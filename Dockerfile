# Use an official Node.js LTS Alpine image for smaller size
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock) first
# This leverages Docker cache - dependencies are only re-installed if these files change
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy the rest of the application code into the working directory
COPY . .

# Expose the port the app runs on (should match PORT in .env/server.js)
EXPOSE 3000

# Command to run the application
CMD [ "node", "server.js" ]