# TubeAI — System Architecture

## Overview

TubeAI is a SaaS platform for YouTube creators to generate video ideas, titles, and scripts using AI (OpenAI GPT). The architecture follows a decoupled frontend/backend model for independent scaling and deployment.

```
┌──────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│  Next.js SSR + Client Components / Mobile Browser        │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTPS
                         ▼
┌──────────────────────────────────────────────────────────┐
│              CDN / Reverse Proxy (Nginx/Cloudflare)       │
│  SSL termination, caching, rate limiting, WAF             │
└───────────┬──────────────────────┬───────────────────────┘
            │ Static Pages         │ API Routes
            ▼                      ▼
┌────────────────────┐   ┌────────────────────────────────┐
│ Next.js Frontend   │   │     Express.js Backend          │
│ Static + SSR       │   │  (Node.js 20+)                  │
└────────────────────┘   └────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
   ┌─────────────┐ ┌───────────┐ ┌─────────────┐
   │ PostgreSQL  │ │ OpenAI API│ │   Stripe    │
   │ (User data) │ │ (GPT-4o)  │ │ (Payments)  │
   └─────────────┘ └───────────┘ └─────────────┘
```

## Design Principles

1. **Separation of Concerns** — Backend handles data, auth, AI. Frontend handles UI, routing, state.
2. **Defense in Depth** — Validation at every layer: Zod (request), Prisma (DB), JWT (auth), rate limiting (network).
3. **Stateless Backend** — No session storage. JWT tokens are self-contained. Horizontally scalable.
4. **Mobile-First** — Responsive design with breakpoints at 640px, 768px, 1024px, 1280px.
5. **Fail Fast** — Errors caught early, logged, and returned with proper HTTP status codes.

## Data Flow

### Content Generation Flow

```
Client ──POST /api/generate──▶ Middleware Chain:
                                 1. authenticate (JWT verify)
                                 2. checkUsageLimit (plan quota)
                                 3. generateLimiter (rate limit)
                                 4. validate (Zod schema)
                             ──▶ Controller:
                                 1. Extract topic, format, userId
                                 2. Call generationService
                             ──▶ Service:
                                 1. OpenAI.generateContent(topic, model)
                                 2. Prisma.generation.create()  ← save to history
                                 3. Return sanitized result
                             ──▶ Response: { data, usage }
```

### Subscription Flow

```
Client clicks "Upgrade"
  │
  ▼
POST /api/subscription/checkout { plan: "pro" }
  │
  ▼
Backend creates Stripe Checkout Session
  │
  ▼
Redirect to Stripe hosted checkout (PCI compliant)
  │
  ▼
User pays → Stripe sends webhook → checkout.session.completed
  │
  ▼
Webhook handler updates: user.plan = "pro"
                         user.stripeCustomerId = "..."
                         user.stripeSubId = "..."
  │
  ▼
Client redirected to success page → dashboard upgrades
```

## Database Schema

```
User
│── id (UUID, PK)
│── name (String)
│── email (String, UNIQUE, indexed)
│── password (String — bcrypt hashed)
│── plan (Enum: free, pro, pro_yearly — default: free)
│── stripeCustomerId (String, UNIQUE, nullable)
│── stripeSubId (String, UNIQUE, nullable)
│── subscriptionEnd (DateTime, nullable)
│── createdAt (DateTime, auto)
│── updatedAt (DateTime, auto)
│
└── Generations (1:N)
    │── id (UUID, PK)
    │── userId (FK → User.id, CASCADE delete)
    │── topic (String)
    │── format (Enum: ideas, titles, script, all)
    │── result (JSON — AI output)
    │── model (String)
    │── tokens (Int, nullable)
    │── createdAt (DateTime, auto, indexed)
```

**Indexes:**
- `User.email` — fast login lookup
- `User.stripeCustomerId` — webhook customer resolution
- `Generation.userId` — history queries by user
- `Generation.createdAt` — time-range queries for usage limits

## Plan & Limits Matrix

| Feature | Free | Pro ($19/mo) | Pro Yearly ($149/yr) |
|---------|------|-------------|---------------------|
| Generations/day | 3 | 50 | 50 |
| AI Model | GPT-4o-mini | GPT-4o | GPT-4o |
| History | Last 100 | Unlimited | Unlimited |
| Export | ❌ | ✅ PDF | ✅ PDF |
| API Access | ❌ | ❌ | ✅ |
| Priority Support | ❌ | ✅ | ✅ |

## Security Layers

| Layer | Mechanism | Purpose |
|-------|-----------|---------|
| Network | HTTPS + CORS origin restriction | Prevent unauthorized origins |
| Auth | JWT (7-day expiry) | Stateless authentication |
| Password | bcrypt (10 rounds) | Secure hashing |
| Input | Zod schema validation | Reject malformed requests |
| Rate Limiting | express-rate-limit + usage tracking | Prevent abuse |
| Headers | Helmet (CSP, X-Frame, etc.) | Security headers |
| Webhook | Stripe signature verification | Prevent fake webhook calls |
| DB | Prisma parameterized queries | SQL injection prevention |

## Cross-Device Strategy

| Device | Breakpoint | Adaptation |
|--------|-----------|------------|
| Small Phone (≤640px) | sm | Single column, touch-friendly 44px buttons, stacked layout |
| Large Phone | 641-767px | Two-column grid where possible |
| Tablet | 768-1023px | Sidebar + main content layout |
| Desktop | ≥1024px | Full sidebar, multi-column grids |

The frontend uses **progressive enhancement** — all content loads on any device, layout adapts via CSS. No feature is removed on mobile; only presentation changes.

## Scalability Roadmap

### Current (MVP)
- Single Node.js instance, PostgreSQL on same machine
- In-memory rate limiting

### Phase 2 (1K+ users)
- Upstash Redis for distributed rate limiting
- Connection pooling (PgBouncer)
- CDN for frontend

### Phase 3 (10K+ users)
- Horizontal scaling with load balancer + multiple backend nodes
- Read replicas for PostgreSQL
- Message queue (BullMQ/Redis) for AI generation

### Phase 4 (100K+ users)
- Microservices architecture
- Database sharding
- Geographic CDN + edge caching
