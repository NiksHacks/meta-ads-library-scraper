# Meta Ads Library Scraper

🚀 **Advanced Apify Actor for scraping Meta (Facebook) Ads Library with sophisticated anti-detection capabilities**

## 📋 Overview

This Actor extracts comprehensive data from Meta's Ads Library using advanced web scraping techniques with built-in anti-detection measures. It's designed to handle Facebook's sophisticated bot detection systems while respecting rate limits and maintaining ethical scraping practices.

## ✨ Features

- 🛡️ **Advanced Anti-Detection**: Multiple layers of bot detection evasion
- 🔄 **Smart Proxy Rotation**: Residential proxy support with country targeting
- 📊 **Comprehensive Data Extraction**: Detailed ad information including spend, impressions, targeting
- 🎯 **Flexible Filtering**: Search by keywords, country, ad type, and status
- 📈 **Scalable Architecture**: Handle thousands of ads efficiently
- 🔍 **Multiple Output Formats**: Basic, detailed, or full data extraction
- ⚡ **Performance Optimized**: Human-like behavior simulation

## 🎯 Use Cases

- **Competitive Intelligence**: Monitor competitor advertising strategies
- **Market Research**: Analyze advertising trends in specific industries
- **Ad Compliance**: Track political and issue-based advertising
- **Creative Analysis**: Study successful ad formats and messaging
- **Spend Analysis**: Monitor advertising investment patterns

## 📥 Input Parameters

### Required
- **searchQuery** (string): Search term for ads (e.g., "Nike", "Tesla")

### Optional
- **country** (string): Country code for targeting (default: "ALL")
  - Examples: "US", "IT", "GB", "DE", "FR"
- **adType** (enum): Type of ads to search
  - `ALL` (default)
  - `POLITICAL_AND_ISSUE_ADS`
  - `HOUSING_ADS`
  - `EMPLOYMENT_ADS`
  - `CREDIT_ADS`
- **maxAds** (integer): Maximum number of ads to scrape (1-10000, default: 100)
- **includeInactive** (boolean): Include inactive ads (default: false)
- **scrapeDetails** (boolean): Extract detailed information (default: true)
- **outputFormat** (enum): Data detail level
  - `basic`: Essential information only
  - `detailed`: Comprehensive data (default)
  - `full`: All available information
- **delayBetweenRequests** (integer): Delay in milliseconds (1000-10000, default: 2000)
- **proxyConfiguration** (object): Proxy settings for anti-detection

## 📤 Output Data

Each scraped ad contains:

```json
{
  "adId": "123456789",
  "pageId": "987654321",
  "pageName": "Nike",
  "adContent": "Just Do It - New Collection Available Now",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "spend": "$5,000 - $10,000",
  "impressions": "100K - 500K",
  "reach": "50K - 100K",
  "demographics": "Age: 18-65, Gender: All",
  "platforms": "Facebook, Instagram",
  "adCreative": ["https://example.com/image1.jpg"],
  "targetingInfo": "Sports enthusiasts, Fitness",
  "scrapedAt": "2025-01-15T10:30:00.000Z",
  "url": "https://www.facebook.com/ads/library/?q=Nike"
}
```

## 🚀 Quick Start

### 1. Basic Search
```json
{
  "searchQuery": "Nike",
  "maxAds": 50
}
```

### 2. Advanced Search with Targeting
```json
{
  "searchQuery": "Tesla",
  "country": "US",
  "adType": "ALL",
  "maxAds": 200,
  "includeInactive": true,
  "outputFormat": "detailed",
  "proxyConfiguration": {
    "useApifyProxy": true,
    "apifyProxyGroups": ["RESIDENTIAL"]
  }
}
```

### 3. Political Ads Monitoring
```json
{
  "searchQuery": "election",
  "country": "US",
  "adType": "POLITICAL_AND_ISSUE_ADS",
  "maxAds": 500,
  "scrapeDetails": true
}
```

## 🛡️ Anti-Detection Features

### Browser Fingerprinting Protection
- Random user agents from real browser pool
- Dynamic viewport sizes
- WebDriver property masking
- Plugin and language spoofing

### Human-Like Behavior
- Random delays between actions
- Natural scrolling patterns
- Mouse movement simulation
- Realistic page interaction timing

### Proxy Management
- Residential proxy rotation
- Country-specific IP addresses
- Session persistence
- Automatic retry with different proxies

## ⚙️ Technical Implementation

### Architecture
- **Framework**: Crawlee with Playwright
- **Browser**: Chromium with stealth mode
- **Language**: Node.js
- **Storage**: Apify Dataset

### Performance Optimizations
- Efficient DOM querying with multiple selectors
- Duplicate detection and filtering
- Memory-efficient data processing
- Graceful error handling and recovery

## 📊 Monitoring & Debugging

### Logs
The Actor provides detailed logging:
- Request processing status
- Anti-detection measures applied
- Data extraction progress
- Error handling and recovery

### Metrics
- Total ads scraped
- Success/failure rates
- Processing time per page
- Proxy performance

## ⚠️ Important Considerations

### Legal & Ethical
- ✅ Scrapes only publicly available data
- ✅ Respects robots.txt and rate limits
- ✅ No personal data collection
- ⚠️ Check local laws and Meta's Terms of Service

### Rate Limiting
- Built-in delays between requests
- Automatic backoff on errors
- Proxy rotation to distribute load
- Human-like interaction patterns

### Data Quality
- Multiple extraction strategies for reliability
- Duplicate detection and removal
- Data validation and cleaning
- Comprehensive error handling

## 🔧 Troubleshooting

### Common Issues

1. **No ads found**
   - Check search query spelling
   - Verify country/region settings
   - Try broader search terms

2. **Rate limiting**
   - Increase delay between requests
   - Enable proxy configuration
   - Reduce maxAds parameter

3. **Incomplete data**
   - Enable detailed scraping
   - Check for page layout changes
   - Verify proxy connectivity

### Performance Tips

- Use residential proxies for better success rates
- Start with smaller batches to test configuration
- Monitor logs for optimization opportunities
- Adjust delays based on response times

## 📈 Scaling

For large-scale operations:
- Use multiple Actor instances
- Implement data deduplication
- Set up monitoring and alerting
- Consider API rate limits

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Actor logs for error details
3. Test with minimal configuration first
4. Contact support with specific error messages

## 📄 License

MIT License - See LICENSE file for details

---

**Note**: This Actor is for educational and research purposes. Always comply with Meta's Terms of Service and applicable laws in your jurisdiction.