const { Actor } = require('apify');
const { PlaywrightCrawler, Dataset } = require('crawlee');
const { chromium } = require('playwright');
const UserAgent = require('user-agents');

// Anti-detection utilities
class AntiDetection {
    static getRandomUserAgent() {
        const userAgent = new UserAgent({ deviceCategory: 'desktop' });
        return userAgent.toString();
    }

    static getRandomViewport() {
        const viewports = [
            { width: 1920, height: 1080 },
            { width: 1366, height: 768 },
            { width: 1440, height: 900 },
            { width: 1536, height: 864 },
            { width: 1280, height: 720 }
        ];
        return viewports[Math.floor(Math.random() * viewports.length)];
    }

    static async setupPage(page) {
        // Remove webdriver property
        await page.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });

        // Override permissions
        await page.addInitScript(() => {
            const originalQuery = window.navigator.permissions.query;
            return window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
            );
        });

        // Override plugins length
        await page.addInitScript(() => {
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5],
            });
        });

        // Override languages
        await page.addInitScript(() => {
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en'],
            });
        });
    }

    static async humanLikeDelay(min = 1000, max = 3000) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    static async humanLikeScroll(page) {
        const scrollSteps = Math.floor(Math.random() * 5) + 3;
        for (let i = 0; i < scrollSteps; i++) {
            await page.mouse.wheel(0, Math.floor(Math.random() * 300) + 100);
            await this.humanLikeDelay(500, 1500);
        }
    }
}

// Meta Ads Library scraper class
class MetaAdsLibraryScraper {
    constructor(input) {
        this.input = input;
        this.baseUrl = 'https://www.facebook.com/ads/library';
        this.scrapedAds = new Set();
        this.totalScraped = 0;
    }

    buildSearchUrl() {
        const params = new URLSearchParams();
        
        if (this.input.searchQuery) {
            params.append('q', this.input.searchQuery);
        }
        
        if (this.input.country && this.input.country !== 'ALL') {
            params.append('country', this.input.country);
        }
        
        if (this.input.adType && this.input.adType !== 'ALL') {
            params.append('ad_type', this.input.adType);
        }
        
        if (this.input.includeInactive) {
            params.append('active_status', 'all');
        } else {
            params.append('active_status', 'active');
        }
        
        return `${this.baseUrl}?${params.toString()}`;
    }

    async extractAdData(page) {
        return await page.evaluate(() => {
            const ads = [];
            
            // Multiple selectors for different ad layouts
            const adSelectors = [
                '[data-testid="ad-library-card"]',
                '[role="article"]',
                '.x1yztbdb',
                '.x78zum5.xdt5ytf.x1iyjqo2'
            ];
            
            let adElements = [];
            for (const selector of adSelectors) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    adElements = Array.from(elements);
                    break;
                }
            }
            
            adElements.forEach((adElement, index) => {
                try {
                    const ad = {
                        adId: null,
                        pageId: null,
                        pageName: null,
                        adContent: null,
                        startDate: null,
                        endDate: null,
                        spend: null,
                        impressions: null,
                        reach: null,
                        demographics: null,
                        platforms: null,
                        adCreative: null,
                        targetingInfo: null,
                        scrapedAt: new Date().toISOString(),
                        url: window.location.href
                    };
                    
                    // Extract ad ID from various possible locations
                    const adIdElement = adElement.querySelector('[data-ad-id]') || 
                                      adElement.querySelector('[href*="ad_id"]');
                    if (adIdElement) {
                        ad.adId = adIdElement.getAttribute('data-ad-id') || 
                                 adIdElement.href?.match(/ad_id=([^&]+)/)?.[1];
                    }
                    
                    // Extract page name
                    const pageNameElement = adElement.querySelector('a[href*="/"] span, .x1heor9g, .x1qlqyl8') ||
                                          adElement.querySelector('[role="link"] span');
                    if (pageNameElement) {
                        ad.pageName = pageNameElement.textContent?.trim();
                    }
                    
                    // Extract ad content/text
                    const contentSelectors = [
                        '.x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x4zkp8e.x676frb.x1nxh6w3.x1sibtaa.xo1l8bm.xi81zsa',
                        '.x1iorvi4.x1pi30zi.x1l90r2v.x1swvt13',
                        '[data-testid="ad-creative-body"]',
                        '.userContent'
                    ];
                    
                    for (const selector of contentSelectors) {
                        const contentElement = adElement.querySelector(selector);
                        if (contentElement && contentElement.textContent?.trim()) {
                            ad.adContent = contentElement.textContent.trim();
                            break;
                        }
                    }
                    
                    // Extract date information
                    const dateElement = adElement.querySelector('[title*="Started running"], .x1i10hfl.xjbqb8w.x6umtig.x1b1mbwd.xaqea5y.xav7gou.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x1heor9g.xt0b8zv.xo1l8bm');
                    if (dateElement) {
                        const dateText = dateElement.textContent || dateElement.getAttribute('title');
                        if (dateText) {
                            const dateMatch = dateText.match(/Started running on (.+?)(?:\s|$)/);
                            if (dateMatch) {
                                ad.startDate = dateMatch[1];
                            }
                        }
                    }
                    
                    // Extract spend information
                    const spendElement = adElement.querySelector('[aria-label*="spend"], [title*="spend"]');
                    if (spendElement) {
                        const spendText = spendElement.textContent || spendElement.getAttribute('aria-label') || spendElement.getAttribute('title');
                        if (spendText) {
                            const spendMatch = spendText.match(/\$([\d,]+(?:\.\d{2})?)/);  
                            if (spendMatch) {
                                ad.spend = spendMatch[1];
                            }
                        }
                    }
                    
                    // Extract impressions
                    const impressionsElement = adElement.querySelector('[aria-label*="impression"], [title*="impression"]');
                    if (impressionsElement) {
                        const impressionsText = impressionsElement.textContent || impressionsElement.getAttribute('aria-label');
                        if (impressionsText) {
                            const impressionsMatch = impressionsText.match(/([\d,]+(?:\.\d+)?[KMB]?)\s*impression/i);
                            if (impressionsMatch) {
                                ad.impressions = impressionsMatch[1];
                            }
                        }
                    }
                    
                    // Extract platforms
                    const platformElements = adElement.querySelectorAll('[alt*="Facebook"], [alt*="Instagram"], [alt*="Messenger"], [alt*="Audience Network"]');
                    if (platformElements.length > 0) {
                        ad.platforms = Array.from(platformElements).map(el => el.getAttribute('alt')).join(', ');
                    }
                    
                    // Extract ad creative (images/videos)
                    const creativeElements = adElement.querySelectorAll('img[src], video[src]');
                    if (creativeElements.length > 0) {
                        ad.adCreative = Array.from(creativeElements).map(el => el.src).filter(src => src && !src.includes('data:'));
                    }
                    
                    // Only add if we have meaningful data
                    if (ad.pageName || ad.adContent || ad.adId) {
                        ads.push(ad);
                    }
                } catch (error) {
                    console.log(`Error extracting ad ${index}:`, error.message);
                }
            });
            
            return ads;
        });
    }

    async waitForAdsToLoad(page) {
        try {
            // Wait for any of the possible ad selectors
            await page.waitForSelector('[data-testid="ad-library-card"], [role="article"], .x1yztbdb', {
                timeout: 15000
            });
            
            // Additional wait for dynamic content
            await AntiDetection.humanLikeDelay(2000, 4000);
            
            // Scroll to load more ads
            await AntiDetection.humanLikeScroll(page);
            
            return true;
        } catch (error) {
            console.log('Timeout waiting for ads to load:', error.message);
            return false;
        }
    }

    async handleCookieConsent(page) {
        try {
            // Handle various cookie consent dialogs
            const cookieSelectors = [
                '[data-testid="cookie-policy-manage-dialog-accept-button"]',
                '[aria-label="Accept all"]',
                '[aria-label="Allow all cookies"]',
                'button[title="Accept All"]',
                'button:has-text("Accept All")',
                'button:has-text("Allow All Cookies")'
            ];
            
            for (const selector of cookieSelectors) {
                try {
                    const button = await page.$(selector);
                    if (button) {
                        await button.click();
                        await AntiDetection.humanLikeDelay(1000, 2000);
                        console.log('Cookie consent handled');
                        return;
                    }
                } catch (e) {
                    // Continue to next selector
                }
            }
        } catch (error) {
            console.log('No cookie consent dialog found or error handling it:', error.message);
        }
    }

    async loadMoreAds(page) {
        try {
            // Look for "Load More" or "See More" buttons
            const loadMoreSelectors = [
                '[aria-label="See more"]',
                '[aria-label="Load more"]',
                'button:has-text("See more")',
                'button:has-text("Load more")',
                '[role="button"]:has-text("See more")'
            ];
            
            for (const selector of loadMoreSelectors) {
                try {
                    const button = await page.$(selector);
                    if (button) {
                        await button.scrollIntoViewIfNeeded();
                        await AntiDetection.humanLikeDelay(1000, 2000);
                        await button.click();
                        await AntiDetection.humanLikeDelay(3000, 5000);
                        return true;
                    }
                } catch (e) {
                    // Continue to next selector
                }
            }
            
            // If no button found, try infinite scroll
            await page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });
            await AntiDetection.humanLikeDelay(3000, 5000);
            
            return false;
        } catch (error) {
            console.log('Error loading more ads:', error.message);
            return false;
        }
    }
}

// Main Actor function
Actor.main(async () => {
    console.log('Starting Meta Ads Library Scraper...');
    
    const input = await Actor.getInput();
    console.log('Input:', input);
    
    // Validate required input
    if (!input.searchQuery) {
        throw new Error('Search query is required!');
    }
    
    const scraper = new MetaAdsLibraryScraper(input);
    const searchUrl = scraper.buildSearchUrl();
    
    console.log('Search URL:', searchUrl);
    
    // Configure crawler with anti-detection and memory optimization
        const crawler = new PlaywrightCrawler({
            launchContext: {
                launcher: chromium,
                launchOptions: {
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--disable-gpu',
                        '--disable-background-timer-throttling',
                        '--disable-backgrounding-occluded-windows',
                        '--disable-renderer-backgrounding',
                        '--disable-features=TranslateUI',
                        '--disable-ipc-flooding-protection',
                        '--memory-pressure-off',
                        '--max_old_space_size=512'
                    ]
                }
            },
            
            // Memory optimization settings
            maxConcurrency: 1,
            maxRequestsPerCrawl: 100,
        
        preNavigationHooks: [async ({ page }) => {
            // Set random user agent and viewport
            const userAgent = AntiDetection.getRandomUserAgent();
            const viewport = AntiDetection.getRandomViewport();
            
            await page.setExtraHTTPHeaders({
                'User-Agent': userAgent
            });
            await page.setViewportSize(viewport);
            
            // Setup anti-detection
            await AntiDetection.setupPage(page);
            
            console.log(`Using User Agent: ${userAgent}`);
            console.log(`Using Viewport: ${viewport.width}x${viewport.height}`);
        }],
        
        requestHandler: async ({ page, request }) => {
            console.log(`Processing: ${request.url}`);
            
            try {
                // Handle cookie consent
                await scraper.handleCookieConsent(page);
                
                // Wait for ads to load
                const adsLoaded = await scraper.waitForAdsToLoad(page);
                if (!adsLoaded) {
                    console.log('No ads found on this page');
                    return;
                }
                
                let totalAdsScraped = 0;
                let consecutiveEmptyPages = 0;
                
                // Main scraping loop
                while (totalAdsScraped < input.maxAds && consecutiveEmptyPages < 3) {
                    console.log(`Scraping page... Total ads so far: ${totalAdsScraped}`);
                    
                    // Extract ads from current page
                    const ads = await scraper.extractAdData(page);
                    
                    if (ads.length === 0) {
                        consecutiveEmptyPages++;
                        console.log(`No ads found on this iteration. Empty pages: ${consecutiveEmptyPages}`);
                    } else {
                        consecutiveEmptyPages = 0;
                        
                        // Filter out duplicates and process ads
                        const newAds = ads.filter(ad => {
                            const adKey = ad.adId || `${ad.pageName}_${ad.adContent?.substring(0, 50)}`;
                            if (scraper.scrapedAds.has(adKey)) {
                                return false;
                            }
                            scraper.scrapedAds.add(adKey);
                            return true;
                        });
                        
                        // Limit the size of scrapedAds Set to prevent memory issues
                        if (scraper.scrapedAds.size > 1000) {
                            const adsArray = Array.from(scraper.scrapedAds);
                            scraper.scrapedAds = new Set(adsArray.slice(-500)); // Keep only last 500
                            console.log('Cleaned up scraped ads cache to prevent memory overflow');
                        }
                        
                        if (newAds.length > 0) {
                            // Save to dataset in smaller batches to reduce memory usage
                            const batchSize = 10;
                            for (let i = 0; i < newAds.length; i += batchSize) {
                                const batch = newAds.slice(i, i + batchSize);
                                await Dataset.pushData(batch);
                            }
                            totalAdsScraped += newAds.length;
                            console.log(`Scraped ${newAds.length} new ads. Total: ${totalAdsScraped}`);
                            
                            // Clear processed ads from memory every 50 ads
                            if (totalAdsScraped % 50 === 0) {
                                if (global.gc) {
                                    global.gc();
                                    console.log('Memory cleanup performed');
                                }
                            }
                        }
                    }
                    
                    // Break if we've reached the limit
                    if (totalAdsScraped >= input.maxAds) {
                        console.log(`Reached maximum ads limit: ${input.maxAds}`);
                        break;
                    }
                    
                    // Try to load more ads
                    const moreLoaded = await scraper.loadMoreAds(page);
                    if (!moreLoaded && consecutiveEmptyPages > 0) {
                        console.log('No more ads to load');
                        break;
                    }
                    
                    // Human-like delay between iterations
                    await AntiDetection.humanLikeDelay(
                        input.delayBetweenRequests || 2000,
                        (input.delayBetweenRequests || 2000) + 2000
                    );
                }
                
                console.log(`Scraping completed. Total ads scraped: ${totalAdsScraped}`);
                
            } catch (error) {
                console.error('Error during scraping:', error);
                throw error;
            }
        },
        
        failedRequestHandler: async ({ request, error }) => {
            console.error(`Request failed: ${request.url}`, error);
        },
        
        maxRequestRetries: 3,
        requestHandlerTimeoutSecs: 300,
        
        // Use proxy if configured
        ...(input.proxyConfiguration?.useApifyProxy && {
            proxyConfiguration: await Actor.createProxyConfiguration({
                groups: input.proxyConfiguration.apifyProxyGroups || ['RESIDENTIAL'],
                countryCode: input.country !== 'ALL' ? input.country : undefined
            })
        })
    });
    
    // Start crawling
    await crawler.run([searchUrl]);
    
    console.log('Meta Ads Library Scraper finished successfully!');
});

module.exports = { MetaAdsLibraryScraper, AntiDetection };