# TubeAI — Step-by-Step Setup Guide

This guide covers setting up the project from scratch — from cloning to running locally.

## Prerequisites

Before you begin, ensure you have:

| Software | Version | How to Check |
|----------|---------|-------------|
| Node.js | 20+ | `node --version` |
| npm | 10+ | `npm --version` |
| PostgreSQL | 14+ | `psql --version` |
| Git | 2.40+ | `git --version` |

### Installing Prerequisites

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nodejs npm postgresql git

# macOS (with Homebrew)
brew install node postgresql git
```

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/ykewat354-cyber/tubeai.git
cd tubeai
```

---

## Step 2: Set Up PostgreSQL Database

```bash
# Start PostgreSQL service
sudo systemctl start postgresql   # Linux
brew services start postgresql     # macOS

# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user (in psql prompt):
CREATE DATABASE tubeai;
CREATE USER tubeuser WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE tubeai TO tubeuser;
\q

# Test connection
psql -U tubeuser -d tubeai -h localhost
```

> **Using Docker instead?** Run: `docker run -d --name tubeai-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=tubeai -p 5432:5432 postgres:16`

---

## Step 3: Set Up Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Use the connection string from your PostgreSQL setup
DATABASE_URL="postgresql://tubeuser:your_secure_password@localhost:5432/tubeai"

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-key

# Get from https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_ID_PRO=price_pro_monthly
STRIPE_PRICE_ID_PRO_YEARLY=price_pro_yearly
```

```bash
# Generate Prisma client (creates type-safe DB access)
npx prisma generate

# Apply database migrations (creates tables)
npx prisma migrate dev --name init

# (Optional) Seed demo user
node prisma/seed.js
# Demo user: demo@tubeai.com / demo1234

# Start backend development server
npm run dev
```

The backend server runs at `http://localhost:5000`

---

## Step 4: Set Up Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

Edit `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_your_stripe_key
```

```bash
# Start Next.js development server with hot reload
npm run dev
```

The frontend runs at `http://localhost:3000`

---

## Step 5: Verify Setup

1. **Health check:** `curl http://localhost:5000/api/health`
2. **Frontend:** Open `http://localhost:3000` in browser
3. **Register:** Navigate to `/auth/register` and create an account
4. **Generate:** Login and try the dashboard
5. **Run tests:** `cd backend && npm test`

---

## Step 6: Stripe Webhook (Local Testing)

For local development, use the Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe

# Login to Stripe CLI
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:5000/api/webhook/stripe
```

This prints a webhook secret — add it to `STRIPE_WEBHOOK_SECRET` in your `.env`.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `ECONNREFUSED 5432` | PostgreSQL isn't running. Start it: `sudo systemctl start postgresql` |
| `Database not found` | Run `npx prisma migrate dev` |
| `OPENAI_API_KEY not set` | Check `.env` file exists and is populated |
| `CORS error` | Verify `FRONTEND_URL` in backend `.env` matches frontend URL |
| `Port already in use` | Change port: `PORT=5001 npm run dev` |
| `Module not found` | Run `npm install` in both backend/ and frontend/ |
