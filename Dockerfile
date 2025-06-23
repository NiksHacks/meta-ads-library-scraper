# Use the official Apify base image with Node.js and Playwright
FROM apify/actor-node-playwright-chrome:20

# Copy everything
COPY . ./

# Install dependencies as root
USER root
RUN npm install --production

# Switch back to default user
USER myuser

# Run the Actor
CMD npm start