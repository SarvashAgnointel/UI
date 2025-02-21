#!/bin/bash
echo "Running AfterInstall script..."

# Navigate to the application directory
cd /var/app/current/

# Install dependencies
echo "Installing npm dependencies..."
npm install

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null
then
    echo "PM2 not found. Installing PM2..."
    npm install -g pm2
else
    echo "PM2 already installed."
fi

# Restart the application with PM2
echo "Restarting app with PM2..."
pm2 stop all || true # Prevent errors if PM2 is not managing any process
pm2 start npm --name "react-app" -- start
pm2 save

echo "Deployment complete."
