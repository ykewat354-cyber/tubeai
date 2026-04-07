#!/bin/bash
# Production Deployment Script
# Usage: ./scripts/deploy.sh
#
# Prerequisites:
#   - Node.js 20+
#   - PostgreSQL
#   - Redis
#   - Nginx
#   - PM2

set -e

echo "🚀 TubeAI — Production Deployment"
echo "=================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

CONFIG_FILE="../ecosystem.config.js"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
  echo -e "${YELLOW}PM2 not found. Installing...${NC}"
  npm install -g pm2
fi

# Check environment
if [ ! -f ".env" ]; then
  echo -e "${RED}❌ .env file not found. Copy from .env.production first.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Environment file exists${NC}"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Database
echo "🗄️  Running database migrations..."
npx prisma migrate deploy
npx prisma generate
echo -e "${GREEN}✅ Database up to date${NC}"

# Build frontend
if [ -d "../frontend" ]; then
  echo "🎨 Building frontend..."
  cd ../frontend
  npm ci
  npm run build
  cd ../backend
  echo -e "${GREEN}✅ Frontend built${NC}"
fi

# Start with PM2
echo "🔄 Starting PM2 processes..."
pm2 start $CONFIG_FILE --env production
pm2 save
pm2 startup
echo -e "${GREEN}✅ Processes started${NC}"

# Health check
sleep 3
echo "🏥 Running health check..."
curl -s http://localhost:5000/api/health | python3 -m json.tool 2>/dev/null || echo "⚠️  Health check endpoint not responding yet"

echo ""
echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}==================================${NC}"
echo ""
echo "Useful commands:"
echo "  pm2 status              — View running processes"
echo "  pm2 logs tubeapi        — View API logs"
echo "  pm2 logs tube-worker    — View worker logs"
echo "  pm2 reload all          — Zero-downtime reload"
echo "  pm2 monit               — Real-time monitoring"
