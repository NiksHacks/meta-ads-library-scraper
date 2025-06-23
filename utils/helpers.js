/**
 * Utility functions for Meta Ads Library Scraper
 * Provides common helpers for data processing, validation, and formatting
 */

const { log } = require('apify');
const fs = require('fs').promises;
const path = require('path');

/**
 * Data Processing Utilities
 */
class DataProcessor {
    /**
     * Clean and normalize ad text
     * @param {string} text - Raw ad text
     * @returns {string} Cleaned text
     */
    static cleanAdText(text) {
        if (!text || typeof text !== 'string') return '';
        
        return text
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/[\r\n]+/g, ' ') // Replace line breaks with spaces
            .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '') // Remove non-printable characters
            .trim();
    }

    /**
     * Parse impression range (e.g., "1,000 - 5,000")
     * @param {string} impressionText - Impression range text
     * @returns {Object} Parsed impression data
     */
    static parseImpressionRange(impressionText) {
        if (!impressionText) return { min: null, max: null, raw: null };
        
        const cleanText = impressionText.replace(/,/g, '').toLowerCase();
        const rangeMatch = cleanText.match(/(\d+)\s*-\s*(\d+)/);
        
        if (rangeMatch) {
            return {
                min: parseInt(rangeMatch[1]),
                max: parseInt(rangeMatch[2]),
                raw: impressionText
            };
        }
        
        const singleMatch = cleanText.match(/(\d+)/);
        if (singleMatch) {
            const value = parseInt(singleMatch[1]);
            return {
                min: value,
                max: value,
                raw: impressionText
            };
        }
        
        return { min: null, max: null, raw: impressionText };
    }

    /**
     * Parse spend range (e.g., "$1,000 - $5,000")
     * @param {string} spendText - Spend range text
     * @returns {Object} Parsed spend data
     */
    static parseSpendRange(spendText) {
        if (!spendText) return { min: null, max: null, currency: null, raw: null };
        
        const currencyMatch = spendText.match(/([£$€¥₹])/);
        const currency = currencyMatch ? this.getCurrencyCode(currencyMatch[1]) : 'USD';
        
        const cleanText = spendText.replace(/[£$€¥₹,]/g, '');
        const rangeMatch = cleanText.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
        
        if (rangeMatch) {
            return {
                min: parseFloat(rangeMatch[1]),
                max: parseFloat(rangeMatch[2]),
                currency,
                raw: spendText
            };
        }
        
        const singleMatch = cleanText.match(/(\d+(?:\.\d+)?)/);
        if (singleMatch) {
            const value = parseFloat(singleMatch[1]);
            return {
                min: value,
                max: value,
                currency,
                raw: spendText
            };
        }
        
        return { min: null, max: null, currency, raw: spendText };
    }

    /**
     * Convert currency symbol to code
     * @param {string} symbol - Currency symbol
     * @returns {string} Currency code
     */
    static getCurrencyCode(symbol) {
        const currencyMap = {
            '$': 'USD',
            '€': 'EUR',
            '£': 'GBP',
            '¥': 'JPY',
            '₹': 'INR'
        };
        return currencyMap[symbol] || 'USD';
    }

    /**
     * Parse date string to ISO format
     * @param {string} dateText - Date text
     * @returns {string|null} ISO date string
     */
    static parseDate(dateText) {
        if (!dateText) return null;
        
        try {
            const date = new Date(dateText);
            return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
        } catch (error) {
            log.warning(`Failed to parse date: ${dateText}`);
            return null;
        }
    }

    /**
     * Extract targeting information from text
     * @param {string} targetingText - Raw targeting text
     * @returns {Object} Parsed targeting data
     */
    static parseTargetingInfo(targetingText) {
        if (!targetingText) return {};
        
        const targeting = {};
        
        // Age range
        const ageMatch = targetingText.match(/age[s]?\s*(\d+)\s*[-–]\s*(\d+)/i);
        if (ageMatch) {
            targeting.ageRange = `${ageMatch[1]}-${ageMatch[2]}`;
        }
        
        // Gender
        const genderMatch = targetingText.match(/\b(men|women|male|female|all genders?)\b/i);
        if (genderMatch) {
            const gender = genderMatch[1].toLowerCase();
            if (gender.includes('men') || gender.includes('male')) {
                targeting.gender = gender.includes('women') ? 'All' : 'Male';
            } else if (gender.includes('women') || gender.includes('female')) {
                targeting.gender = 'Female';
            } else {
                targeting.gender = 'All';
            }
        }
        
        // Locations (basic extraction)
        const locationMatch = targetingText.match(/location[s]?[:\s]+([^,;]+)/i);
        if (locationMatch) {
            targeting.locations = [locationMatch[1].trim()];
        }
        
        return targeting;
    }

    /**
     * Generate unique ad ID from URL or content
     * @param {string} url - Ad URL or identifier
     * @returns {string} Unique ad ID
     */
    static generateAdId(url) {
        if (!url) return null;
        
        // Extract ID from Facebook ad URL
        const idMatch = url.match(/\/ads\/library\/\?id=(\d+)/);
        if (idMatch) return idMatch[1];
        
        // Extract from other URL patterns
        const hashMatch = url.match(/[?&]id=([^&]+)/);
        if (hashMatch) return hashMatch[1];
        
        // Generate hash from URL
        return this.generateHash(url);
    }

    /**
     * Generate simple hash from string
     * @param {string} str - Input string
     * @returns {string} Hash string
     */
    static generateHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }
}

/**
 * Validation Utilities
 */
class Validator {
    /**
     * Validate input parameters
     * @param {Object} input - Input object
     * @returns {Object} Validation result
     */
    static validateInput(input) {
        const errors = [];
        const warnings = [];
        
        // Required fields
        if (!input.searchQuery || input.searchQuery.trim().length === 0) {
            errors.push('searchQuery is required and cannot be empty');
        }
        
        // Country validation
        const validCountries = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES', 'BR', 'IN', 'JP'];
        if (input.country && !validCountries.includes(input.country)) {
            warnings.push(`Country '${input.country}' may not be supported. Supported: ${validCountries.join(', ')}`);
        }
        
        // Max ads validation
        if (input.maxAds && (input.maxAds < 1 || input.maxAds > 10000)) {
            errors.push('maxAds must be between 1 and 10000');
        }
        
        // Delay validation
        if (input.delayBetweenRequests && (input.delayBetweenRequests < 500 || input.delayBetweenRequests > 30000)) {
            warnings.push('delayBetweenRequests should be between 500ms and 30000ms for optimal performance');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Validate scraped ad data
     * @param {Object} adData - Ad data object
     * @returns {boolean} Is valid
     */
    static validateAdData(adData) {
        if (!adData || typeof adData !== 'object') return false;
        
        // Must have at least ad text or creative URL
        if (!adData.adText && !adData.adCreativeUrl) return false;
        
        // Must have advertiser name
        if (!adData.advertiserName) return false;
        
        return true;
    }

    /**
     * Check if URL is valid Facebook ad library URL
     * @param {string} url - URL to validate
     * @returns {boolean} Is valid
     */
    static isValidFacebookAdUrl(url) {
        if (!url || typeof url !== 'string') return false;
        
        const facebookAdPatterns = [
            /facebook\.com\/ads\/library/,
            /facebook\.com\/ad_library/,
            /www\.facebook\.com\/ads\/library/
        ];
        
        return facebookAdPatterns.some(pattern => pattern.test(url));
    }
}

/**
 * File and Storage Utilities
 */
class FileUtils {
    /**
     * Ensure directory exists
     * @param {string} dirPath - Directory path
     */
    static async ensureDir(dirPath) {
        try {
            await fs.access(dirPath);
        } catch (error) {
            await fs.mkdir(dirPath, { recursive: true });
        }
    }

    /**
     * Save data to JSON file
     * @param {string} filePath - File path
     * @param {Object} data - Data to save
     */
    static async saveJson(filePath, data) {
        await this.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    }

    /**
     * Load data from JSON file
     * @param {string} filePath - File path
     * @returns {Object} Loaded data
     */
    static async loadJson(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            log.warning(`Failed to load JSON file: ${filePath}`);
            return null;
        }
    }

    /**
     * Get file size in bytes
     * @param {string} filePath - File path
     * @returns {number} File size
     */
    static async getFileSize(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return stats.size;
        } catch (error) {
            return 0;
        }
    }
}

/**
 * Performance and Monitoring Utilities
 */
class PerformanceMonitor {
    constructor() {
        this.startTime = Date.now();
        this.metrics = {
            adsScraped: 0,
            pagesVisited: 0,
            errors: 0,
            retries: 0,
            totalRequests: 0,
            avgResponseTime: 0
        };
        this.responseTimes = [];
    }

    /**
     * Record a successful ad scrape
     */
    recordAdScraped() {
        this.metrics.adsScraped++;
    }

    /**
     * Record a page visit
     */
    recordPageVisit() {
        this.metrics.pagesVisited++;
    }

    /**
     * Record an error
     */
    recordError() {
        this.metrics.errors++;
    }

    /**
     * Record a retry
     */
    recordRetry() {
        this.metrics.retries++;
    }

    /**
     * Record request timing
     * @param {number} responseTime - Response time in ms
     */
    recordRequest(responseTime) {
        this.metrics.totalRequests++;
        this.responseTimes.push(responseTime);
        this.metrics.avgResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
    }

    /**
     * Get performance summary
     * @returns {Object} Performance metrics
     */
    getSummary() {
        const runtime = Date.now() - this.startTime;
        const adsPerMinute = this.metrics.adsScraped / (runtime / 60000);
        
        return {
            ...this.metrics,
            runtime: runtime,
            runtimeFormatted: this.formatDuration(runtime),
            adsPerMinute: Math.round(adsPerMinute * 100) / 100,
            errorRate: this.metrics.totalRequests > 0 ? (this.metrics.errors / this.metrics.totalRequests) * 100 : 0,
            retryRate: this.metrics.totalRequests > 0 ? (this.metrics.retries / this.metrics.totalRequests) * 100 : 0
        };
    }

    /**
     * Format duration in human readable format
     * @param {number} ms - Duration in milliseconds
     * @returns {string} Formatted duration
     */
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
}

/**
 * Rate Limiting Utilities
 */
class RateLimiter {
    constructor(maxRequests = 60, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = [];
    }

    /**
     * Check if request is allowed
     * @returns {boolean} Is allowed
     */
    isAllowed() {
        const now = Date.now();
        
        // Remove old requests outside the window
        this.requests = this.requests.filter(time => now - time < this.windowMs);
        
        // Check if we're under the limit
        return this.requests.length < this.maxRequests;
    }

    /**
     * Record a request
     */
    recordRequest() {
        this.requests.push(Date.now());
    }

    /**
     * Get time until next request is allowed
     * @returns {number} Wait time in ms
     */
    getWaitTime() {
        if (this.isAllowed()) return 0;
        
        const oldestRequest = Math.min(...this.requests);
        return this.windowMs - (Date.now() - oldestRequest);
    }
}

module.exports = {
    DataProcessor,
    Validator,
    FileUtils,
    PerformanceMonitor,
    RateLimiter
};