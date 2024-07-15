#!/bin/bash

echo "Starting production server..."
npx prisma db push && npx prisma db seed
pm2 start ecosystem.config.js --no-daemon
