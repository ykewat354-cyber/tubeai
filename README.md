# 🎬 TubeAI — AI YouTube Idea & Script Generator

> A production-ready SaaS platform for YouTube creators to generate video ideas, titles, and full scripts using AI.

[![MIT License](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)
[![Node.js 20+](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue.svg)](https://www.postgresql.org)

## ✨ Features

| Feature | Description |
|---------|-------------|
| 💡 **AI Video Ideas** | Get fresh, trending ideas for any niche |
| ✍️ **Catchy Titles** | Click-optimized titles for maximum CTR |
| 📝 **Full Scripts** | Complete scripts with hooks, body, and CTAs |
| 📋 **Generation History** | Save, search, and manage all past generations |
| 💳 **Stripe Payments** | Secure subscriptions with webhooks |
| 📱 **Mobile-First UI** | Works on phones, tablets, and desktops |
| 🔒 **JWT Authentication** | Stateless, secure, and horizontally scalable |
| ⚡ **Rate Limiting** | Anti-abuse on auth and AI generation endpoints |

## 🛠 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Backend** | Node.js + Express | Mature, fast, huge ecosystem |
| **Frontend** | Next.js 15 (App Ready) + TailwindCSS | SSR, zero-config styling, mobile-first |
| **Database** | PostgreSQL | ACID-compliant, ideal for billing data |
| **ORM** | Prisma | Type-safe queries, clean migrations |
| **Auth** | JWT (custom) | Stateless, scalable, no vendor lock-in |
| **Payments** | Stripe | Global, PCI-compliant, webhook-driven |
| **AI** | OpenAI (GPT-4o-mini / GPT-4o) | Best cost-to-quality ratio |
| **Validation** | Zod | Runtime type checking at the edge |
| **Testing** | Jest + Supertest | Unit + integration test framework |

## 📁 Folder Structure

\`\`\`
TubeAI/
├── backend/
│   ├── package.json           # + Jest, ESLint, scripts
│   ├── prisma/
│   │   ├── schema.prisma      # Database models
│   │   └── seed.js            # Demo user seeder
│   ├── src/
│       │   ├── config/        # OpenAI client, Stripe integration
│       │   ├── controllers/   # Request handlers (thin layer)
│       │   ├── middleware/    # Auth, rate limiting, validation, error handler
│       │   ├── routes/        # Route definitions with middleware chains
│       │   ├── services/      # Business logic (JSDoc documented)
│       │   ├── utils/         # Logger, helpers
│       │   └── server.js      # Express entry point
│   └── tests/                 # Jest test suites
│       ├── auth.test.js
│       ├── generation.test.js
│       ├── middleware.test.js
│       └── subscription.test.js
│
├── frontend/
│   ├── package.json           # + Next.js Bundle Analyzer
│   ├── next.config.js         # Performance + security headers
│   ├── tailwind.config.js     # Mobile-first breakpoints, custom theme
│   ├── src/
│   │   ├── pages/             # Next.js pages (routing by file)
│   │   │   ├── index.js       # Landing page (hero, features, pricing)
│   │   │   ├── pricing.js     # Plans page
│   │   │   ├── auth/          # Login + Registration
│   │   │   └── dashboard/     # Generator, History, Detail views
│   │   ├── components/        # Layout, DashboardLayout
│   │   ├── services/api.js    # Typed API client
│   │   ├── hooks/             # useAuth, useGenerations
│   │   ├── styles/globals.css # Tailwind + responsive components
│   │   └── utils/             # Format helpers
│   └── public/
│
├── docs/
│   ├── ARCHITECTURE.md        # System design, data flow, scaling roadmap
│   ├── API.md                 # All endpoints documented (+ request/response)
│   ├── ENV.md                 # Environment variables reference
│   └── SETUP.md               # Step-by-step local setup guide
│
├── README.md
├── LICENSE                    # MIT
└── .gitignore
\`\`\`

## 🚀 Quick Setup

### 1. Prerequisites

| Software | Version |
|----------|---------|
| Node.js | 20+ |
| npm | 10+ |
| PostgreSQL | 14+ |

### 2. Backend

\`\`\`bash
cd backend
npm install
cp .env.example .env    # Fill in your keys
npx prisma generate
npx prisma db push
npm run dev             # → http://localhost:5000
\`\`\`

### 3. Frontend

\`\`\`bash
cd frontend
npm install
cp .env.example .env
npm run dev             # → http://localhost:3000
\`\`\`

### 4. Run Tests

\`\`\`bash
cd backend
npm test                # Jest + coverage
npm test -- --watch     # Watch mode
\`\`\`

📖 **Detailed setup guide:** [docs/SETUP.md](docs/SETUP.md)
📖 **Environment variables:** [docs/ENV.md](docs/ENV.md)

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| POST | \`/api/auth/register\` | ❌ | Register new user |
| POST | \`/api/auth/login\` | ❌ | Login and get JWT token |
| GET | \`/api/auth/me\` | ✅ | Get current user profile |
| POST | \`/api/generate\` | ✅ | Generate AI content |
| GET | \`/api/generate/:id\` | ✅ | Get generation detail |
| DELETE | \`/api/generate/:id\` | ✅ | Delete generation |
| GET | \`/api/history\` | ✅ | Paginated history |
| GET | \`/api/history/search\` | ✅ | Search by topic |
| POST | \`/api/subscription/checkout\` | ✅ | Stripe checkout |
| GET | \`/api/subscription/portal\` | ✅ | Manage subscription |
| POST | \`/api/webhook/stripe\` | 🔐 Webhook | Payment events |

📖 **Full API docs:** [docs/API.md](docs/API.md)

## 🌐 Deployment

### Backend (VPS / Railway / Render)

\`\`\`bash
npm ci --production
npx prisma generate
npx prisma migrate deploy
npm start
\`\`\`

### Frontend (Vercel recommended)

\`\`\`bash
npm run build
npm start
\`\`\`

Or deploy: \`vercel --prod\`

📖 **Full deployment guide:** [docs/SETUP.md](docs/SETUP.md)

## 📋 License

MIT License — see [LICENSE](LICENSE) file.

## 🗺️ Roadmap

- [ ] YouTube thumbnail generation (DALL-E)
- [ ] SEO tags + description generator
- [ ] Bulk generation (10 videos at once)
- [ ] Team workspaces & collaboration
- [ ] API access for developers
- [ ] Multi-language support (Hindi, Spanish, etc.)

---

Built with ❤️ for YouTube creators everywhere.
