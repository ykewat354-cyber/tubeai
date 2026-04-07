# TubeAI Architecture

## System Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────▶│ Next.js App  │────▶│  Express    │
│  (Client)   │     │ (Frontend)   │     │  Backend    │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                │
                     ┌──────────────────────────┤
                     ▼                          ▼
              ┌─────────────┐          ┌─────────────┐
              │ PostgreSQL  │          │ OpenAI API  │
              │ (Database)  │          │ (GPT-4o)    │
              └─────────────┘          └─────────────┘
                     ▲
                     ▼
              ┌─────────────┐
              │ Stripe      │
              │ (Payments)  │
              └─────────────┘
```

## Auth Flow

1. User registers → bcrypt hash → save to DB → return JWT
2. User logs in → verify hash → return JWT
3. Frontend stores JWT → sends with every request in `Authorization: Bearer <token>`
4. Backend middleware verifies JWT → attaches `req.user`

## Subscription Flow

1. User selects plan → backend creates Stripe Checkout Session
2. User redirected to Stripe → enters payment → success
3. Stripe webhook sends `checkout.session.completed` → backend updates user plan
4. Usage limits enforced per request based on plan

## Data Models

### User
- id, name, email, password (hashed)
- plan (free/pro/pro-yearly)
- stripeCustomerId, stripeSubId, subscriptionEnd

### Generation
- id, userId, topic, format, result (JSON)
- model, tokens, createdAt

## Rate Limiting

- Auth endpoints: 10 requests per 15 min window
- Generation endpoints: 5 requests per 1 min window
- Usage limits: tracked per day via database count
