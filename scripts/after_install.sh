#!/bin/bash
cd /var/app/current
npm install
npm run build
pm2 restart app
