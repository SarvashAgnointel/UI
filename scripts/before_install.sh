#!/bin/bash

echo "Stopping existing application..."
pkill -f "node" || true

echo "Cleaning up old deployment..."
rm -rf /var/app/current/*
mkdir -p /var/app/current/

echo "Downloading latest build from S3..."
aws s3 cp s3://react-app-artifacts-21-02-2025/build.zip /var/app/current/ || { echo "S3 Download failed"; exit 1; }

echo "Installing unzip if needed..."
sudo yum install -y unzip

echo "Extracting build.zip..."
if [ -f "/var/app/current/build.zip" ]; then
    unzip -o /var/app/current/build.zip -d /var/app/current/
else
    echo "Error: build.zip not found!"
    exit 1
fi

echo "Setting permissions..."
sudo useradd -m webapp || true
chown -R webapp:webapp /var/app/current/
chmod -R 755 /var/app/current/

echo "Before install script completed successfully!"
