# TubeAI — Environment Variables Reference

Complete documentation of all environment variables for both backend and frontend.

## Backend (.env)

### Server

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `PORT` | number | No | 5000 | Port the Express server listens on |
| `NODE_ENV` | string | No | development | `development`, `production`, or `test` |
| `FRONTEND_URL` | string | Yes | http://localhost:3000 | Frontend origin for CORS and redirect URLs |

### Database

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `DATABASE_URL` | string | Yes | PostgreSQL connection string. Format: `postgresql://user:password@host:port/dbname?schema=public` |

### Authentication

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `JWT_SECRET` | string | Yes | Secret key for signing JWT tokens. Use a long, random string in production. Generate with: `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | string | No | JWT token expiration. Default: `7d`. Options: `30m`, `1h`, `7d`, `30d` |

### OpenAI

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `OPENAI_API_KEY` | string | Yes | API key from OpenAI. Generate at https://platform.openai.com/api-keys |

### Stripe

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `STRIPE_SECRET_KEY` | string | Yes | Stripe secret key. Test keys start with `sk_test_`. Live keys start with `sk_live_` |
| `STRIPE_WEBHOOK_SECRET` | string | Yes | Webhook signing secret. Get it via `stripe listen --forward-to ...` for local, or from Stripe Dashboard → Webhooks for production |
| `STRIPE_PRICE_ID_PRO` | string | Yes | Stripe Price ID for monthly Pro plan. Create in Stripe Dashboard → Products |
| `STRIPE_PRICE_ID_PRO_YEARLY` | string | Yes | Stripe Price ID for yearly Pro plan |

---

## Frontend (.env)

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | string | Yes | Backend API base URL. Example: `http://localhost:5000/api` |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | string | No | Stripe publishable key for client-side. Test keys start with `pk_test_` |

---

## Security Notes

### Never Commit .env Files
- `.env` is in `.gitignore` — but always verify before committing
- Use `.env.example` as the template for team members

### Production Secrets
- Use hosting platform's environment variable feature (Vercel, Railway, Heroku)
- For VPS, use PM2 ecosystem file or systemd EnvironmentFile
- Rotate JWT_SECRET and API keys periodically

### Generating Secure JWT Secret
```bash
# Generate a 32-byte hex string
openssl rand -hex 32
# Example: a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0
```

---

## Environment-Specific Values

### Development
```
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://tubeuser:password@localhost:5432/tubeai"
STRIPE_SECRET_KEY=sk_test_xxx
```

### Production
```
NODE_ENV=production
PORT=5000
DATABASE_URL="postgresql://tubeuser:secure_password@db-host:5432/tubeai?sslmode=require"
STRIPE_SECRET_KEY=sk_live_xxx
```
