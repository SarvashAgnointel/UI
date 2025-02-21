#!/bin/bash
echo "Stopping application..."
pm2 stop all || echo "No PM2 process found."
