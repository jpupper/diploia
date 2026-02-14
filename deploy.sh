#!/bin/bash
# ═══════════════════════════════════════════════════════
#  Deploy DiploIA to VPS
# ═══════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════"
echo "  Deploying DiploIA..."
echo "═══════════════════════════════════════════════════"

# Pull latest changes
git pull origin main

# Install dependencies
npm install --production

# Restart the server (using pm2 if available)
if command -v pm2 &> /dev/null; then
    pm2 restart diploia 2>/dev/null || pm2 start server.js --name diploia
    echo "✅ Server restarted with PM2"
else
    echo "⚠️  PM2 not found. Install with: npm install -g pm2"
    echo "    Then run: pm2 start server.js --name diploia"
fi

echo "═══════════════════════════════════════════════════"
echo "  Deploy complete!"
echo "═══════════════════════════════════════════════════"
