# Use an official Node.js runtime as a parent image
FROM node:18-alpine 

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install any dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose port 4173 for the app
EXPOSE 3000


# Start the app (ensure it listens on the correct port)
CMD ["npm", "start"]
