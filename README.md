# 🎬 TubeAI — AI YouTube Idea & Script Generator

> A production-ready, enterprise-grade SaaS platform for YouTube creators to generate video ideas, titles, and full scripts using AI.

[![MIT License](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)
[![Node.js 20+](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue.svg)](https://www.postgresql.org)
[![CI](https://github.com/ykewat354-cyber/tubeai/actions/workflows/ci.yml/badge.svg)](.github/workflows/ci.yml)
[![Docker](https://img.shields.io/badge/Docker-✓-2496ED.svg)](Dockerfile.backend)

## ✨ Features

| Feature | Description |
|---------|-------------|
| 💡 **AI Video Ideas** | Get fresh, trending ideas for any niche |
| ✍️ **Catchy Titles** | Click-optimized titles for maximum CTR |
| 📝 **Full Scripts** | Complete scripts with hooks, body, and CTAs |
| 📋 **Generation History** | Save, search, and manage all past generations |
| 💳 **Stripe Payments** | Secure subscriptions with webhook integration |
| 📱 **Mobile-First UI** | Works on phones, tablets, and desktops |
| 🔒 **JWT Auth** | Stateless, secure, horizontally scalable |
| ⚡ **Rate Limiting** | Anti-abuse on auth and AI generation endpoints |

## 🛠 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Backend** | Node.js + Express | Mature, fast, huge ecosystem |
| **Frontend** | Next.js 15 + TailwindCSS | SSR, zero-config styling, mobile-first |
| **Database** | PostgreSQL | ACID-compliant, ideal for billing data |
| **ORM** | Prisma | Type-safe queries, clean migrations |
| **Auth** | JWT (custom) | Stateless, scalable, no vendor lock-in |
| **Payments** | Stripe | Global, PCI-compliant, webhook-driven |
| **AI** | OpenAI (GPT-4o-mini / GPT-4o) | Best cost-to-quality ratio |
| **Validation** | Zod | Runtime type checking at the edge |
| **Testing** | Jest + Supertest | Unit + integration test framework |
| **CI/CD** | GitHub Actions | Automated tests + Docker build checks |
| **Containers** | Docker + Compose | One-command local dev environment |

## 📁 Folder Structure

```
TubeAI/
├── .github/workflows/ci.yml     # GitHub Actions CI pipeline
├── Dockerfile.backend           # Multi-stage Docker build (backend)
├── Dockerfile.frontend          # Multi-stage Docker build (frontend)
├── docker-compose.yml           # Local dev with PostgreSQL
├── nginx.conf                   # Production reverse proxy config
├── .dockerignore
│
├── backend/
│   ├── package.json             # + Jest, ESLint, scripts
│   ├── .env.development         # Local dev environment template
│   ├── .env.production          # Production environment template
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│       │   ├── config/
│       │   │   ├── index.js       # ★ Centralized configuration
│       │   │   ├── openai.js      # OpenAI client
│       │   │   └── stripe.js      # Stripe integration
│       │   ├── controllers/       # Request handlers (thin layer)
│       │   ├── middleware/        # Auth, rate limiting, validation, error handler
│       │   ├── routes/            # Route definitions with middleware chains
│       │   ├── services/          # Business logic (JSDoc documented)
│       │   └── utils/
│       │       ├── constants.js   # ★ App-wide constants + response factory
│       │       └── logger.js      # ★ Structured logger
│   └── tests/                   # Jest test suites
│       ├── auth.test.js
│       ├── generation.test.js
│       ├── middleware.test.js
│       └── subscription.test.js
│
├── frontend/
│   ├── package.json             # + Bundle Analyzer
│   ├── .env.development
│   ├── .env.production
│   ├── next.config.js           # Performance + security headers
│   ├── tailwind.config.js       # Mobile-first breakpoints
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js
│   │   │   ├── DashboardLayout.js
│   │   │   ├── Skeleton.js      # ★ Skeleton loading components
│   │   │   └── ErrorMessage.js  # ★ Error display with retry
│   │   ├── pages/               # Next.js routing
│   │   ├── services/api.js
│   │   ├── hooks/
│   │   ├── styles/globals.css   # Responsive + accessible CSS
│   │   └── utils/
│   └── public/
│
├── docs/
│   ├── ARCHITECTURE.md          # System design + scaling roadmap
│   ├── API.md                   # All endpoints documented
│   ├── ENV.md                   # Environment variables reference
│   └── SETUP.md                 # Step-by-step setup guide
│
├── README.md
├── LICENSE                      # MIT
└── .gitignore
```

## 🚀 Quick Setup

### Option 1: Docker (Recommended for local dev)

```bash
# Start PostgreSQL in Docker
docker compose up -d db

# Then setup backend + frontend normally
```

### Option 2: Manual Setup

#### Backend
```bash
cd backend
npm install
cp .env.development .env   # or .env.production for prod
npx prisma generate
npx prisma db push
npm run dev                # → http://localhost:5000
```

#### Frontend
```bash
cd frontend
npm install
cp .env.development .env
npm run dev                # → http://localhost:3000
```

#### Run Tests
```bash
cd backend
npm test               # Jest + coverage
npm test -- --watch    # Watch mode
```

📖 **Detailed setup:** [docs/SETUP.md](docs/SETUP.md)
📖 **Env variables:** [docs/ENV.md](docs/ENV.md)

## 🔌 API Response Format

All API responses follow a standardized structure:

```json
{
  "success": true,
  "message": "Content generated successfully",
  "data": { ... },
  "meta": { "usage": { "used": 2, "limit": 3 } }
}
```

Errors:
```json
{
  "success": false,
  "message": "Description of the error"
}
```

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login and get JWT token |
| GET | `/api/auth/me` | ✅ | Get current user profile |
| POST | `/api/generate` | ✅ | Generate AI content |
| GET | `/api/generate/:id` | ✅ | Get generation detail |
| DELETE | `/api/generate/:id` | ✅ | Delete generation |
| GET | `/api/history` | ✅ | Paginated history |
| GET | `/api/history/search` | ✅ | Search by topic |
| POST | `/api/subscription/checkout` | ✅ | Stripe checkout |
| GET | `/api/subscription/portal` | ✅ | Manage subscription |
| POST | `/api/webhook/stripe` | 🔐 Webhook | Payment events |

📖 **Full API docs:** [docs/API.md](docs/API.md)

## 🏗️ Architecture

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Config management | Centralized `config/index.js` | Single source of truth, env-based |
| API responses | Standardized `{ success, message, data, meta }` | Consistent client handling |
| Error handling | Global middleware + asyncHandler wrapper | No try/catch noise in controllers |
| Authentication | JWT (stateless) | Horizontal scaling, no session store |
| Rate limiting | express-rate-limit + DB usage tracking | Two-layer abuse prevention |
| Password hashing | bcrypt (10 rounds) | Industry standard, timing-safe verify |
| Database | Prisma ORM on PostgreSQL | Type-safe, migration-based, ACID |

### Data Flow

```
Client → CORS/Security Headers → Route → Middleware Chain → Controller → Service → DB/AI → Response

Middleware Chain for /generate:
  1. authenticate (JWT verify)
  2. checkUsageLimit (plan quota)
  3. generateLimiter (rate limit per minute)
  4. validate (Zod schema)
```

## 🌐 Deployment

### Docker Production
```bash
docker compose -f docker-compose.yml up -d
```

### VPS (Ubuntu)
See [docs/SETUP.md](docs/SETUP.md) for full guide including:
- Nginx reverse proxy + SSL (Let's Encrypt)
- PM2 process management
- PostgreSQL setup
- Environment configuration

### Vercel (Frontend)
```bash
vercel --prod
```

### CI/CD Pipeline
- **Push to main:** Runs tests, builds frontend, checks Docker builds
- **PR:** Same checks, blocks merge on failure

## 🗺️ Roadmap

- [ ] YouTube thumbnail generation (DALL-E / Stability AI)
- [ ] SEO tags + description generator
- [ ] Bulk generation (10 videos at once)
- [ ] Team workspaces & collaboration
- [ ] API access for developers
- [ ] Multi-language support (Hindi, Spanish, etc.)
- [ ] Chrome extension for one-click generation

---

Built with ❤️ for YouTube creators everywhere.
