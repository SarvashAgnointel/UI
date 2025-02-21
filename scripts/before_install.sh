#!/bin/bash
echo "Running BeforeInstall script..."

# Update system packages
echo "Updating system packages..."
sudo yum update -y

# Install Node.js and NPM (if not installed)
if ! command -v node &> /dev/null
then
    echo "Node.js not found. Installing Node.js..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
else
    echo "Node.js already installed."
fi

# Verify Node.js installation
node -v
npm -v

# Ensure PM2 is installed globally
if ! command -v pm2 &> /dev/null
then
    echo "PM2 not found. Installing PM2..."
    npm install -g pm2
else
    echo "PM2 already installed."
fi

echo "BeforeInstall script completed successfully."
