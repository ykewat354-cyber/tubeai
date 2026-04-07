# 🚀 TubeAI Launch Guide

> Complete guide for taking TubeAI from development to production and getting your first paying users.

---

## 📋 Pre-Launch Checklist

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | **Domain & Hosting** | ☐ | Buy domain (Namecheap, GoDaddy) |
| 2 | **SSL Certificate** | ☐ | Let's Encrypt (free via Certbot) |
| 3 | **PostgreSQL Database** | ☐ | VPS local or Supabase/Neon (free tier) |
| 4 | **Redis** | ☐ | Docker or Upstash (free tier: 10k commands/day) |
| 5 | **OpenAI API Key** | ☐ | https://platform.openai.com/api-keys |
| 6 | **Stripe Account** | ☐ | https://dashboard.stripe.com |
| 7 | **Email Provider** | ☐ | Resend (free: 3,000 emails/month) |
| 8 | **Admin API Key** | ☐ | Generate: `openssl rand -hex 16` |
| 9 | **Stripe Webhook** | ☐ | Add endpoint URL to Stripe Dashboard |
| 10 | **Stripe Products** | ☐ | Create Pro ($19/mo) and Pro Yearly ($149/yr) |

---

## 🔧 Environment Setup

### Backend (.env)

```bash
# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-domain.com

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/tubeai"

# JWT
JWT_SECRET=<generate with: openssl rand -hex 32>
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-your-key

# Stripe
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_key
STRIPE_PRICE_ID_PRO=price_your_pro_monthly
STRIPE_PRICE_ID_PRO_YEARLY=price_your_pro_yearly

# Email (Resend — https://resend.com)
EMAIL_PROVIDER=resend
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=465
EMAIL_USER=resend
EMAIL_PASS=re_your_api_key
EMAIL_FROM=noreply@your-domain.com
EMAIL_FROM_NAME=TubeAI

# Admin
ADMIN_API_KEY=<generate with: openssl rand -hex 16>

# Redis
REDIS_URL=redis://localhost:6379

# Monitoring
LOG_LEVEL=info
MEMORY_ALERT_THRESHOLD_MB=500
BACKUP_RETENTION_DAYS=14
```

### Frontend (.env)

```bash
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_your_key
NEXT_PUBLIC_ADMIN_API_KEY=your_admin_api_key
```

---

## 📦 Deployment

### Option 1: VPS (Recommended for Full Control)

```bash
# 1. Connect to your VPS
ssh root@your-server-ip

# 2. Install dependencies
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs npm postgresql redis-server nginx certbot python3-certbot-nginx git

# 3. Clone repository
cd /opt
git clone https://github.com/ykewat354-cyber/tubeai.git
cd tubeai/backend

# 4. Setup environment
cp .env.example .env
nano .env  # Fill in all values

# 5. Install & setup
npm install
npx prisma generate
npx prisma migrate deploy

# 6. Install PM2
sudo npm install -g pm2

# 7. Deploy
./scripts/deploy.sh

# 8. Setup Nginx
sudo cp nginx.conf /etc/nginx/sites-available/tubeai
sudo nano /etc/nginx/sites-available/tubeai  # Replace your-domain.com
sudo ln -s /etc/nginx/sites-available/tubeai /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 9. SSL (Let's Encrypt)
sudo certbot --nginx -d your-domain.com -d api.your-domain.com
```

### Option 2: Separate Services (Scaling Ready)

| Service | Platform | Cost |
|---------|----------|------|
| **Frontend** | Vercel | Free |
| **Backend API** | Railway / Render | ~$5/mo |
| **Database** | Supabase / Neon | Free tier |
| **Redis** | Upstash | Free tier |
| **Email** | Resend | Free (3k/mo) |
| **Payments** | Stripe | 2.9% + 30¢ |
| **AI** | OpenAI | Pay per usage |
| **Worker** | Railway | ~$5/mo |

**Total estimated cost: ~$10-15/mo for startup**

### Vercel Deployment (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd tubeai/frontend
vercel --prod
```

### Railway Deployment (Backend)

1. Connect GitHub repository to Railway
2. Set all environment variables in Railway dashboard
3. Add PostgreSQL database via Railway
4. Set build command: `npm install && npx prisma generate && npx prisma migrate deploy`
5. Set start command: `npm start`

### Deploy Worker (Same Railway project)

1. Add another service in Railway pointing to `backend/scripts/queue-worker.js`
2. Use same environment variables

---

## 💳 Stripe Setup

### 1. Create Products & Prices

```bash
# Monthly Pro — $19/mo
stripe prices create \
  --unit-amount 1900 \
  --currency usd \
  --recurring interval=month \
  --product-data name="Pro Monthly" \
  --metadata plan=pro

# Yearly Pro — $149/yr
stripe prices create \
  --unit-amount 14900 \
  --currency usd \
  --recurring interval=year \
  --product-data name="Pro Yearly" \
  --metadata plan=pro-yearly
```

Copy the Price IDs and add them to `.env`:
- `STRIPE_PRICE_ID_PRO=price_xxx`
- `STRIPE_PRICE_ID_PRO_YEARLY=price_yyy`

### 2. Add Webhook Endpoint

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://api.your-domain.com/api/webhook/stripe`
3. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.paused`
   - `customer.subscription.resumed`
4. Copy the webhook signing secret → `STRIPE_WEBHOOK_SECRET`

---

## 📊 Post-Launch Monitoring

### Health Checks

```bash
# Basic health check
curl https://api.your-domain.com/api/health

# Detailed diagnostics
curl https://api.your-domain.com/api/health/detailed

# Real-time metrics
curl https://api.your-domain.com/api/health/metrics
```

### Daily Backup (Cron)

```bash
# Edit crontab
crontab -e

# Add this line (daily 3 AM)
0 3 * * * cd /opt/tubeai/backend && node scripts/backup-db.js >> logs/backup.log 2>&1
```

### Admin Panel

```
URL: https://your-domain.com/admin
Access: Requires ADMIN_API_KEY header
```

### PM2 Monitoring

```bash
pm2 status          # View all processes
pm2 monit           # Real-time CPU/memory monitoring
pm2 logs tubeapi    # View API logs
pm2 logs tube-worker # View worker logs
pm2 reload all      # Zero-downtime reload
```

---

## 🎯 Getting First Users

### 1. Launch Strategy
- **Product Hunt**: Submit on Product Hunt (free traffic)
- **Reddit**: r/youtube, r/videoproduction, r/saas
- **Twitter/X**: Post demos of AI-generated scripts
- **YouTube**: Make a video about AI tools for creators (meta!)
- **Hacker News**: "Show HN" post

### 2. Pricing Strategy
- **Free tier**: 3 generations/day (enough to hook users)
- **Pro**: $19/mo (50 gens/day, better AI model)
- **Pro Yearly**: $149/yr ($12.42/mo — save $79)
- **Future**: Agency plan at $49/mo for teams

### 3. Conversion Optimization
- Landing page has clear CTA and social proof sections
- Free tier shows "Upgrade to Pro" banner after 2 generations
- Dashboard shows usage limit visually (X/3 today)
- Pricing page shows value comparison clearly

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **Port already in use** | `lsof -i :5000` → kill process or change PORT |
| **Database connection failed** | Check DATABASE_URL, ensure PostgreSQL is running |
| **Redis connection failed** | `redis-cli ping` → should return PONG |
| **Stripe webhook not firing** | Check webhook URL, verify SSL, test with `stripe login` |
| **Email not sending** | Check Resend API key, verify "from" domain in Resend |
| **PM2 process crashes** | `pm2 logs` → check error, `pm2 restart tubeapi` |
| **High memory usage** | `pm2 monit` → check heap, restart if > 500MB |
| **CORS errors** | Verify FRONTEND_URL in backend .env matches frontend URL |

---

## 📈 Growth Metrics to Track

| Metric | Target (Month 1) | Target (Month 3) |
|--------|------------------|------------------|
| Registered users | 100 | 1,000 |
| Daily active users | 20 | 200 |
| Generations/day | 50 | 2,000 |
| Free → Pro conversion | 2% | 5% |
| Monthly revenue | $100 | $2,000 |
| Churn rate | < 10% | < 5% |

---

Built with ❤️ by TubeAI Team
Launch Date: 2025
