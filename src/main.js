const { Actor } = require('apify');
const { PlaywrightCrawler, Dataset } = require('crawlee');
const { chromium } = require('playwright');
const UserAgent = require('user-agents');

// Modern Anti-Detection utilities for 2025
class ModernAntiDetection {
    static getRandomUserAgent() {
        const userAgent = new UserAgent({ 
            deviceCategory: 'desktop',
            platform: 'Win32'
        });
        return userAgent.toString();
    }

    static getRandomViewport() {
        const viewports = [
            { width: 1920, height: 1080 },
            { width: 1366, height: 768 },
            { width: 1440, height: 900 },
            { width: 1536, height: 864 },
            { width: 1280, height: 720 },
            { width: 1600, height: 900 },
            { width: 1680, height: 1050 }
        ];
        return viewports[Math.floor(Math.random() * viewports.length)];
    }

    static async setupAdvancedStealth(page) {
        // Advanced stealth techniques for 2025
        await page.addInitScript(() => {
            // Remove webdriver traces
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
            
            // Override automation indicators
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
            
            // Mock chrome runtime
            window.chrome = {
                runtime: {
                    onConnect: undefined,
                    onMessage: undefined
                }
            };
            
            // Override permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
            );
            
            // Mock plugins
            Object.defineProperty(navigator, 'plugins', {
                get: () => [
                    { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
                    { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
                    { name: 'Native Client', filename: 'internal-nacl-plugin' }
                ],
            });
            
            // Override languages
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en', 'it-IT', 'it'],
            });
            
            // Mock hardware concurrency
            Object.defineProperty(navigator, 'hardwareConcurrency', {
                get: () => 4,
            });
            
            // Mock device memory
            Object.defineProperty(navigator, 'deviceMemory', {
                get: () => 8,
            });
        });
    }

    static async humanLikeDelay(min = 1000, max = 3000) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    static async humanLikeScroll(page, direction = 'down') {
        const scrollSteps = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < scrollSteps; i++) {
            const scrollAmount = Math.floor(Math.random() * 400) + 200;
            if (direction === 'down') {
                await page.mouse.wheel(0, scrollAmount);
            } else {
                await page.mouse.wheel(0, -scrollAmount);
            }
            await this.humanLikeDelay(800, 1500);
        }
    }

    static async randomMouseMovement(page) {
        const viewport = page.viewportSize();
        const x = Math.floor(Math.random() * viewport.width);
        const y = Math.floor(Math.random() * viewport.height);
        await page.mouse.move(x, y, { steps: Math.floor(Math.random() * 10) + 5 });
    }
}

// Modern Meta Ads Library scraper for 2025
class MetaAdsLibraryScraperV2 {
    constructor(input) {
        this.input = input;
        this.baseUrl = 'https://www.facebook.com/ads/library';
        this.scrapedAds = new Set();
        this.totalScraped = 0;
        this.graphqlResponses = [];
        this.adData = [];
    }

    buildSearchUrl() {
        const params = new URLSearchParams();
        
        if (this.input.searchQuery) {
            params.append('q', this.input.searchQuery);
        }
        
        if (this.input.country && this.input.country !== 'ALL') {
            params.append('country', this.input.country);
        } else {
            params.append('country', 'IT'); // Default to Italy
        }
        
        if (this.input.adType && this.input.adType !== 'ALL') {
            params.append('ad_type', this.input.adType);
        } else {
            params.append('ad_type', 'all'); // Include all ad types
        }
        
        params.append('active_status', 'all'); // Include both active and inactive
        params.append('view_all_page_id', this.input.pageId || '');
        
        return `${this.baseUrl}?${params.toString()}`;
    }

    async setupNetworkInterception(page) {
        // Intercept GraphQL requests to capture ad data
        await page.route('**/graphql', async (route) => {
            const request = route.request();
            const response = await route.fetch();
            
            try {
                const responseBody = await response.text();
                const postData = request.postData();
                
                // Check if this is an ads library GraphQL request
                if (postData && (postData.includes('AdLibrarySearchResultsQuery') || 
                                postData.includes('AdLibraryMobileSearchResultsQuery') ||
                                postData.includes('AdLibrarySearchQuery'))) {
                    
                    console.log('Intercepted Ads Library GraphQL request');
                    
                    try {
                        const jsonResponse = JSON.parse(responseBody);
                        this.processGraphQLResponse(jsonResponse);
                    } catch (parseError) {
                        console.log('Error parsing GraphQL response:', parseError.message);
                    }
                }
            } catch (error) {
                console.log('Error processing intercepted request:', error.message);
            }
            
            await route.fulfill({ response });
        });
    }

    processGraphQLResponse(response) {
        try {
            // Navigate through the GraphQL response structure to find ads
            const data = response.data;
            if (!data) return;

            // Look for ad library search results in various possible paths
            const searchPaths = [
                'ad_library_search',
                'adLibrarySearch', 
                'search_results',
                'results',
                'edges'
            ];

            let adsData = null;
            for (const path of searchPaths) {
                if (data[path]) {
                    adsData = data[path];
                    break;
                }
            }

            if (adsData && adsData.edges) {
                adsData.edges.forEach(edge => {
                    if (edge.node) {
                        const adNode = edge.node;
                        const processedAd = this.processAdNode(adNode);
                        if (processedAd) {
                            this.adData.push(processedAd);
                        }
                    }
                });
                console.log(`Processed ${adsData.edges.length} ads from GraphQL response`);
            }
        } catch (error) {
            console.log('Error processing GraphQL response:', error.message);
        }
    }

    processAdNode(adNode) {
        try {
            const ad = {
                adId: adNode.ad_archive_id || adNode.id,
                pageId: adNode.page?.id,
                pageName: adNode.page?.name,
                adContent: adNode.ad_creative_body || adNode.creative_body,
                startDate: adNode.ad_delivery_start_time,
                endDate: adNode.ad_delivery_stop_time,
                spend: adNode.spend?.lower_bound || adNode.spend?.upper_bound,
                impressions: adNode.impressions?.lower_bound || adNode.impressions?.upper_bound,
                reach: adNode.reach?.lower_bound || adNode.reach?.upper_bound,
                demographics: adNode.demographic_distribution,
                platforms: adNode.publisher_platforms,
                adCreative: {
                    images: adNode.ad_creative_link_captions || [],
                    videos: adNode.videos || [],
                    link_url: adNode.ad_creative_link_url
                },
                targetingInfo: adNode.target_ages || adNode.target_gender,
                currency: adNode.currency,
                isActive: adNode.is_active,
                scrapedAt: new Date().toISOString(),
                source: 'graphql_interception'
            };

            // Generate unique key for deduplication
            const adKey = ad.adId || `${ad.pageName}_${ad.adContent?.substring(0, 50)}`;
            if (!this.scrapedAds.has(adKey)) {
                this.scrapedAds.add(adKey);
                return ad;
            }
            return null;
        } catch (error) {
            console.log('Error processing ad node:', error.message);
            return null;
        }
    }

    async extractAdDataFromDOM(page) {
        return await page.evaluate(() => {
            const ads = [];
            
            // Updated selectors for 2025 Facebook Ads Library
            const adSelectors = [
                '[data-testid="ad_library_card"]',
                '[data-testid="ad-library-card"]', 
                '[role="article"]',
                '.x1yztbdb.x1d52u69',
                '.x78zum5.xdt5ytf.x1iyjqo2.xs83m0k',
                '[data-pagelet="AdLibrarySearchResults"] > div > div'
            ];
            
            let adElements = [];
            for (const selector of adSelectors) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    adElements = Array.from(elements);
                    console.log(`Found ${elements.length} ads using selector: ${selector}`);
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
                        url: window.location.href,
                        source: 'dom_extraction'
                    };
                    
                    // Extract ad ID from various possible locations
                    const adIdSelectors = [
                        '[data-ad-id]',
                        '[href*="ad_archive_id"]',
                        '[href*="ad_id"]'
                    ];
                    
                    for (const selector of adIdSelectors) {
                        const element = adElement.querySelector(selector);
                        if (element) {
                            ad.adId = element.getAttribute('data-ad-id') || 
                                     element.href?.match(/ad_archive_id=([^&]+)/)?.[1] ||
                                     element.href?.match(/ad_id=([^&]+)/)?.[1];
                            if (ad.adId) break;
                        }
                    }
                    
                    // Extract page name with updated selectors
                    const pageNameSelectors = [
                        '[data-testid="page_name"] span',
                        '.x1heor9g.x1qlqyl8.x1pd3egz.x16tdsg8',
                        'a[href*="/"] span.x1lliihq',
                        '[role="link"] span.x193iq5w'
                    ];
                    
                    for (const selector of pageNameSelectors) {
                        const element = adElement.querySelector(selector);
                        if (element && element.textContent?.trim()) {
                            ad.pageName = element.textContent.trim();
                            break;
                        }
                    }
                    
                    // Extract ad content with updated selectors
                    const contentSelectors = [
                        '[data-testid="ad_creative_body"]',
                        '.x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x4zkp8e.x676frb.x1nxh6w3.x1sibtaa.xo1l8bm.xi81zsa',
                        '.x1iorvi4.x1pi30zi.x1l90r2v.x1swvt13',
                        '.userContent',
                        '[data-testid="post_message"] span'
                    ];
                    
                    for (const selector of contentSelectors) {
                        const element = adElement.querySelector(selector);
                        if (element && element.textContent?.trim()) {
                            ad.adContent = element.textContent.trim();
                            break;
                        }
                    }
                    
                    // Extract date information with updated selectors
                    const dateSelectors = [
                        '[data-testid="ad_start_date"]',
                        '[title*="Started running"]',
                        '.x1i10hfl.xjbqb8w.x6umtig.x1b1mbwd.xaqea5y.xav7gou.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x1heor9g.xt0b8zv.xo1l8bm'
                    ];
                    
                    for (const selector of dateSelectors) {
                        const element = adElement.querySelector(selector);
                        if (element) {
                            const dateText = element.textContent || element.getAttribute('title');
                            if (dateText) {
                                const dateMatch = dateText.match(/Started running on (.+?)(?:\s|$)/) ||
                                                dateText.match(/(\d{1,2}\/\d{1,2}\/\d{4})/) ||
                                                dateText.match(/(\d{4}-\d{2}-\d{2})/);
                                if (dateMatch) {
                                    ad.startDate = dateMatch[1];
                                    break;
                                }
                            }
                        }
                    }
                    
                    // Extract spend information with updated selectors
                    const spendSelectors = [
                        '[data-testid="spend_amount"]',
                        '[aria-label*="spend"]',
                        '[title*="spend"]',
                        'span:contains("€")',
                        'span:contains("$")'
                    ];
                    
                    for (const selector of spendSelectors) {
                        const element = adElement.querySelector(selector);
                        if (element) {
                            const spendText = element.textContent || element.getAttribute('aria-label') || element.getAttribute('title');
                            if (spendText) {
                                const spendMatch = spendText.match(/[€$]([\d,]+(?:\.\d{2})?)/) ||
                                                 spendText.match(/([\d,]+(?:\.\d{2})?)[€$]/);
                                if (spendMatch) {
                                    ad.spend = spendMatch[1];
                                    break;
                                }
                            }
                        }
                    }
                    
                    // Extract impressions with updated selectors
                    const impressionSelectors = [
                        '[data-testid="impression_count"]',
                        '[aria-label*="impression"]',
                        '[title*="impression"]'
                    ];
                    
                    for (const selector of impressionSelectors) {
                        const element = adElement.querySelector(selector);
                        if (element) {
                            const impressionsText = element.textContent || element.getAttribute('aria-label');
                            if (impressionsText) {
                                const impressionsMatch = impressionsText.match(/([\d,]+(?:\.\d+)?[KMB]?)\s*impression/i);
                                if (impressionsMatch) {
                                    ad.impressions = impressionsMatch[1];
                                    break;
                                }
                            }
                        }
                    }
                    
                    // Extract platforms with updated selectors
                    const platformElements = adElement.querySelectorAll('[alt*="Facebook"], [alt*="Instagram"], [alt*="Messenger"], [alt*="Audience Network"], [data-testid*="platform"]');
                    if (platformElements.length > 0) {
                        ad.platforms = Array.from(platformElements).map(el => 
                            el.getAttribute('alt') || el.getAttribute('data-testid')
                        ).filter(Boolean).join(', ');
                    }
                    
                    // Extract ad creative (images/videos) with updated selectors
                    const creativeElements = adElement.querySelectorAll('img[src]:not([src*="data:"]), video[src]');
                    if (creativeElements.length > 0) {
                        ad.adCreative = Array.from(creativeElements)
                            .map(el => el.src)
                            .filter(src => src && !src.includes('data:') && !src.includes('static.xx.fbcdn.net/rsrc.php'));
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
            // Wait for any of the possible ad selectors with longer timeout
            await page.waitForSelector('[data-testid="ad_library_card"], [data-testid="ad-library-card"], [role="article"], .x1yztbdb', {
                timeout: 20000
            });
            
            // Additional wait for dynamic content
            await ModernAntiDetection.humanLikeDelay(3000, 5000);
            
            // Gentle scroll to trigger lazy loading
            await ModernAntiDetection.humanLikeScroll(page);
            
            return true;
        } catch (error) {
            console.log('Timeout waiting for ads to load:', error.message);
            return false;
        }
    }

    async handleCookieConsent(page) {
        try {
            // Updated cookie consent selectors for 2025
            const cookieSelectors = [
                '[data-testid="cookie-policy-manage-dialog-accept-button"]',
                '[data-testid="cookie-policy-banner-accept"]',
                '[aria-label="Accept all"]',
                '[aria-label="Allow all cookies"]',
                'button[title="Accept All"]',
                'div[role="button"]:has-text("Accept All")',
                'div[role="button"]:has-text("Allow All Cookies")',
                '[data-cookiebanner="accept_button"]'
            ];
            
            for (const selector of cookieSelectors) {
                try {
                    const button = await page.$(selector);
                    if (button) {
                        await button.click();
                        await ModernAntiDetection.humanLikeDelay(1000, 2000);
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
            // Updated "Load More" selectors for 2025
            const loadMoreSelectors = [
                '[data-testid="see-more-button"]',
                '[aria-label="See more"]',
                '[aria-label="Load more"]',
                'div[role="button"]:has-text("See more")',
                'div[role="button"]:has-text("Load more")',
                '[data-testid="load-more-ads"]'
            ];
            
            for (const selector of loadMoreSelectors) {
                try {
                    const button = await page.$(selector);
                    if (button) {
                        await button.scrollIntoViewIfNeeded();
                        await ModernAntiDetection.humanLikeDelay(1000, 2000);
                        await button.click();
                        await ModernAntiDetection.humanLikeDelay(3000, 5000);
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
            await ModernAntiDetection.humanLikeDelay(3000, 5000);
            
            return false;
        } catch (error) {
            console.log('Error loading more ads:', error.message);
            return false;
        }
    }

    async performSearch(page, searchQuery) {
        try {
            // Look for search input with updated selectors
            const searchSelectors = [
                '[data-testid="search-input"]',
                '[placeholder*="Search"]',
                'input[type="search"]',
                'input[aria-label*="Search"]'
            ];
            
            for (const selector of searchSelectors) {
                const searchInput = await page.$(selector);
                if (searchInput) {
                    await searchInput.clear();
                    await searchInput.type(searchQuery, { delay: 100 });
                    await page.keyboard.press('Enter');
                    await ModernAntiDetection.humanLikeDelay(3000, 5000);
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.log('Error performing search:', error.message);
            return false;
        }
    }
}

// Import Actor from Apify SDK (already imported at top)

// Main Actor function
Actor.main(async () => {
    console.log('Starting Modern Meta Ads Library Scraper V2 (2025)...');
    
    const input = await Actor.getInput();
    console.log('Input:', input);
    
    // Set default values if not provided
    const config = {
        searchQuery: input.searchQuery || '',
        country: input.country || 'IT',
        adType: input.adType || 'all',
        maxAds: input.maxAds || 100,
        delayBetweenRequests: input.delayBetweenRequests || 3000,
        includeInactive: input.includeInactive !== false,
        pageId: input.pageId || '',
        proxyConfiguration: input.proxyConfiguration || {},
        enableGraphQLInterception: input.enableGraphQLInterception !== false,
        useAdvancedStealth: input.useAdvancedStealth !== false,
        headlessMode: input.headlessMode || false,
        outputFormat: input.outputFormat || 'detailed'
    };
    
    const scraper = new MetaAdsLibraryScraperV2(config);
    const searchUrl = scraper.buildSearchUrl();
    
    console.log('Search URL:', searchUrl);
    
    // Configure crawler with advanced anti-detection for 2025
    const crawler = new PlaywrightCrawler({
        launchContext: {
            launcher: chromium,
            launchOptions: {
                headless: config.headlessMode, // Configurable headless mode
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
                    '--disable-features=TranslateUI,VizDisplayCompositor',
                    '--disable-ipc-flooding-protection',
                    '--memory-pressure-off',
                    '--max_old_space_size=1024',
                    '--disable-blink-features=AutomationControlled',
                    '--disable-extensions',
                    '--disable-plugins',
                    '--disable-images', // Reduce memory usage
                    '--disable-javascript-harmony-shipping',
                    '--disable-background-networking',
                    '--disable-sync',
                    '--disable-translate',
                    '--hide-scrollbars',
                    '--mute-audio',
                    '--no-default-browser-check',
                    '--no-pings',
                    '--single-process'
                ]
            }
        },
        
        // Optimized settings for 2025
        maxConcurrency: 1,
        maxRequestsPerCrawl: 1,
        
        preNavigationHooks: [async ({ page }) => {
            // Set random user agent and viewport
            const userAgent = ModernAntiDetection.getRandomUserAgent();
            const viewport = ModernAntiDetection.getRandomViewport();
            
            await page.setExtraHTTPHeaders({
                'User-Agent': userAgent,
                'Accept-Language': 'en-US,en;q=0.9,it-IT;q=0.8,it;q=0.7',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Upgrade-Insecure-Requests': '1'
            });
            
            await page.setViewportSize(viewport);
            
            // Setup advanced anti-detection
            await ModernAntiDetection.setupAdvancedStealth(page);
            
            // Setup network interception if enabled
            if (config.enableGraphQLInterception) {
                await scraper.setupNetworkInterception(page);
            }
            
            // Setup advanced stealth if enabled
            if (config.useAdvancedStealth) {
                await ModernAntiDetection.setupAdvancedStealth(page);
            }
            
            console.log(`Using User Agent: ${userAgent}`);
            console.log(`Using Viewport: ${viewport.width}x${viewport.height}`);
        }],
        
        requestHandler: async ({ page, request }) => {
            console.log(`Processing: ${request.url}`);
            
            try {
                // Handle cookie consent
                await scraper.handleCookieConsent(page);
                
                // Perform additional search if needed
                if (config.searchQuery) {
                    await scraper.performSearch(page, config.searchQuery);
                }
                
                // Wait for ads to load
                const adsLoaded = await scraper.waitForAdsToLoad(page);
                if (!adsLoaded) {
                    console.log('No ads found on this page, trying alternative approach...');
                    
                    // Try scrolling and waiting again
                    await ModernAntiDetection.humanLikeScroll(page);
                    await ModernAntiDetection.humanLikeDelay(5000, 8000);
                    
                    const adsLoadedRetry = await scraper.waitForAdsToLoad(page);
                    if (!adsLoadedRetry) {
                        console.log('Still no ads found after retry');
                        return;
                    }
                }
                
                let totalAdsScraped = 0;
                let consecutiveEmptyPages = 0;
                let iterations = 0;
                const maxIterations = 10;
                
                // Main scraping loop
                while (totalAdsScraped < config.maxAds && consecutiveEmptyPages < 3 && iterations < maxIterations) {
                    iterations++;
                    console.log(`Scraping iteration ${iterations}... Total ads so far: ${totalAdsScraped}`);
                    
                    // Extract ads from current page DOM
                    const domAds = await scraper.extractAdDataFromDOM(page);
                    
                    // Combine DOM ads with GraphQL intercepted ads
                    const allAds = [...domAds, ...scraper.adData];
                    scraper.adData = []; // Clear processed GraphQL data
                    
                    if (allAds.length === 0) {
                        consecutiveEmptyPages++;
                        console.log(`No ads found on this iteration. Empty pages: ${consecutiveEmptyPages}`);
                    } else {
                        consecutiveEmptyPages = 0;
                        
                        // Filter out duplicates
                        const newAds = allAds.filter(ad => {
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
                            scraper.scrapedAds = new Set(adsArray.slice(-500));
                            console.log('Cleaned up scraped ads cache to prevent memory overflow');
                        }
                        
                        if (newAds.length > 0) {
                            // Save to dataset in smaller batches
                            const batchSize = 5;
                            for (let i = 0; i < newAds.length; i += batchSize) {
                                const batch = newAds.slice(i, i + batchSize);
                                await Dataset.pushData(batch);
                            }
                            totalAdsScraped += newAds.length;
                            console.log(`Scraped ${newAds.length} new ads. Total: ${totalAdsScraped}`);
                            
                            // Memory cleanup every 25 ads
                            if (totalAdsScraped % 25 === 0) {
                                if (global.gc) {
                                    global.gc();
                                    console.log('Memory cleanup performed');
                                }
                            }
                        }
                    }
                    
                    // Break if we've reached the limit
                    if (totalAdsScraped >= config.maxAds) {
                        console.log(`Reached maximum ads limit: ${config.maxAds}`);
                        break;
                    }
                    
                    // Try to load more ads
                    const moreLoaded = await scraper.loadMoreAds(page);
                    if (!moreLoaded && consecutiveEmptyPages > 0) {
                        console.log('No more ads to load');
                        break;
                    }
                    
                    // Random mouse movement to appear more human
                    await ModernAntiDetection.randomMouseMovement(page);
                    
                    // Human-like delay between iterations
                    await ModernAntiDetection.humanLikeDelay(
                        config.delayBetweenRequests,
                        config.delayBetweenRequests + 2000
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
        
        maxRequestRetries: 2,
        requestHandlerTimeoutSecs: 600,
        
        // Use proxy if configured
        ...(config.proxyConfiguration?.useApifyProxy && {
            proxyConfiguration: await Actor.createProxyConfiguration({
                groups: config.proxyConfiguration.apifyProxyGroups || ['RESIDENTIAL'],
                countryCode: config.country !== 'ALL' ? config.country : undefined
            })
        })
    });
    
    // Start crawling
    await crawler.run([searchUrl]);
    
    console.log('Modern Meta Ads Library Scraper V2 finished successfully!');
});

module.exports = { MetaAdsLibraryScraperV2, ModernAntiDetection };