#!/bin/bash
echo "Starting the React application with PM2..."
cd /var/app/current/

# Start the app with PM2
pm2 stop all || true
pm2 start npm --name "react-app" -- start
pm2 save

echo "Application started successfully."
