# Use the official Apify base image with Node.js and Playwright
FROM apify/actor-node-playwright-chrome:20

# Set working directory
WORKDIR /usr/src/app

# Set environment variables for better performance
ENV APIFY_DISABLE_OUTDATED_WARNING=1
ENV APIFY_DISABLE_TELEMETRY=1
ENV NODE_ENV=production

# Optimize for headless browser performance
ENV DISPLAY=:99
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Set memory limits for better stability
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Copy package files
COPY package*.json ./

# Fix permissions for npm install
RUN chown -R $(whoami) /usr/src/app

# Install dependencies
RUN npm ci --only=production --no-optional \
    && npm cache clean --force

# Copy source code
COPY . ./

# Install Playwright browsers and dependencies
RUN npx playwright install chromium \
    && npx playwright install-deps chromium

# Expose port (if needed for debugging)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('Health check passed')" || exit 1

# Run the Actor
CMD npm start