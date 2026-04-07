# 🎬 TubeAI - AI YouTube Idea & Script Generator

A SaaS platform where YouTube creators can generate video ideas, titles, and full scripts using AI (OpenAI).

## ✨ Features

- **AI Video Ideas** — Get fresh, trending ideas for any niche
- **Catchy Titles** — Click-optimized titles for maximum CTR
- **Full Scripts** — Complete video scripts with hooks, body, and CTAs
- **Generation History** — Save and search all your past generations
- **Free + Pro Plans** — Stripe-powered subscription with usage limits
- **Clean Dark UI** — Modern, responsive dashboard design

## 🛠 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Backend** | Node.js + Express | Mature ecosystem, fast development |
| **Frontend** | Next.js 15 + TailwindCSS | SSR, modern DX, zero-config styling |
| **Database** | PostgreSQL | ACID-compliant, ideal for billing data |
| **ORM** | Prisma | Type-safe, clean migrations |
| **Auth** | JWT (custom) | Stateless, horizontally scalable |
| **Payments** | Stripe | Global, subscriptions + webhooks |
| **AI** | OpenAI API (GPT-4o / 4o-mini) | Best cost-to-quality ratio |

## 📁 Folder Structure

```
TubeAI/
├── README.md
├── LICENSE
├── .gitignore
│
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── prisma/
│   │   └── schema.prisma          # Database models
│   ├── src/
│       │   ├── config/
│       │   │   ├── openai.js       # OpenAI client & generation
│       │   │   └── stripe.js       # Stripe integration
│       │   ├── middleware/
│       │   │   ├── auth.js         # JWT authentication
│       │   │   ├── subscription.js # Usage limits by plan
│       │   │   ├── rateLimiter.js  # Brute force prevention
│       │   │   ├── errorHandler.js # Global error handling
│       │   │   └── validate.js     # Zod request validation
│       │   ├── models/             # (handled by Prisma)
│       │   ├── services/
│       │   │   ├── authService.js
│       │   │   ├── generationService.js
│       │   │   ├── historyService.js
│       │   │   └── subscriptionService.js
│       │   ├── routes/
│       │   │   ├── authRoutes.js
│       │   │   ├── generateRoutes.js
│       │   │   ├── historyRoutes.js
│       │   │   ├── subscriptionRoutes.js
│       │   │   └── webhookRoutes.js
│       │   ├── controllers/
│       │   │   ├── authController.js
│       │   │   ├── generateController.js
│       │   │   ├── historyController.js
│       │   │   ├── subscriptionController.js
│       │   │   └── webhookController.js
│       │   ├── utils/              # Helper functions
│       │   └── server.js           # Express entry point
│
├── frontend/
│   ├── package.json
│   ├── .env.example
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.js            # Landing page
│   │   │   ├── pricing.js          # Plans page
│   │   │   ├── auth/
│   │   │   │   ├── login.js
│   │   │   │   └── register.js
│   │   │   └── dashboard/
│   │   │       ├── index.js        # Main dashboard / generator
│   │   │       └── history/
│   │   │           ├── index.js    # History list
│   │   │           └── detail/[id].js  # Individual generation
│   │   ├── components/
│   │   │   ├── Layout.js           # Public layout with navbar
│   │   │   └── DashboardLayout.js  # Authenticated sidebar layout
│   │   ├── services/
│   │   │   └── api.js              # API client for backend
│   │   ├── hooks/
│   │   │   ├── useAuth.js          # Auth state management
│   │   │   └── useGenerations.js   # Generation state + history
│   │   ├── styles/
│   │   │   └── globals.css         # Global styles + Tailwind
│   │   └── utils/                  # Helper utilities
│   └── public/
│
└── docs/
    └── ARCHITECTURE.md             # System architecture details
```

## 🚀 Setup Guide

### Prerequisites

- Node.js 20+
- PostgreSQL database
- OpenAI API key
- Stripe account (for payments)

### 1. Clone repository

```bash
git clone https://github.com/yourusername/tubeai.git
cd tubeai
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file and fill values
cp .env.example .env

# Set up database
npx prisma generate
npx prisma migrate dev --name init

# (Optional) Seed demo user
npx prisma db seed

# Start development server
npm run dev  # Runs on port 5000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev  # Runs on port 3000
```

### 4. Environment Variables

```bash
# Backend .env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/tubeai"
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-your-key
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-secret
FRONTEND_URL=http://localhost:3000

# Frontend .env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🌐 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| POST | /api/auth/register | ❌ | Register new user |
| POST | /api/auth/login | ❌ | Login & get token |
| GET | /api/auth/me | ✅ | Get current user profile |
| POST | /api/generate | ✅ | Generate content |
| GET | /api/generate/:id | ✅ | Get generation detail |
| DELETE | /api/generate/:id | ✅ | Delete generation |
| GET | /api/history | ✅ | List history (paginated) |
| GET | /api/history/search | ✅ | Search by topic |
| POST | /api/subscription/checkout | ✅ | Create Stripe checkout |
| GET | /api/subscription/portal | ✅ | Manage subscription |

## 🚢 Deployment Guide

### Backend (VPS / Render / Railway)

```bash
# Install dependencies, generate Prisma client
npm ci
npx prisma generate
npx prisma migrate deploy

# Set environment variables in hosting platform
# Then start
npm start
```

### Frontend (Vercel recommended)

```bash
# Build
npm run build

# Start production server
npm start
```

Or deploy on Vercel:
```bash
vercel --prod
```

### VPS Setup (Ubuntu)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs postgresql nginx

# Create PostgreSQL database
sudo -u postgres psql
CREATE DATABASE tubeai;
CREATE USER tubeuser WITH PASSWORD 'securepassword';
GRANT ALL PRIVILEGES ON DATABASE tubeai TO tubeuser;
\q

# Install PM2
npm install -g pm2

# Start backend with PM2
cd /opt/tubeai/backend
pm2 start src/server.js --name tubeai-api

# Start frontend
cd /opt/tubeai/frontend
pm2 start "npm start" --name tubeai-web

# Nginx reverse proxy
# Configure in /etc/nginx/sites-available/tubeai
```

## 📋 License

MIT License — see [LICENSE](LICENSE) file.
