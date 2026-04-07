# TubeAI API Documentation

Base URL: `http://localhost:5000/api` (development)

## Authentication

All authenticated endpoints require a `Bearer` token in the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

Standard response format for errors:
```json
{ "error": "Description of the error" }
```

---

## Auth Endpoints

### POST /auth/register
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",        // string, 2-50 chars
  "email": "john@example.com", // string, valid email
  "password": "securepass123"  // string, min 8 chars
}
```

**Response (201):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "plan": "free",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**
| Status | Condition |
|--------|-----------|
| 400 | Invalid input (missing/invalid fields) |
| 409 | Email already registered |
| 429 | Too many registration attempts (10 per 15 min) |

---

### POST /auth/login
Authenticate and receive JWT token.

**Request Body:**
```json
{ "email": "john@example.com", "password": "securepass123" }
```

**Response (200):** Same as register (without `createdAt`).

**Errors:**
| Status | Condition |
|--------|-----------|
| 400 | Invalid input |
| 401 | Wrong email or password |
| 429 | Too many login attempts |

---

### GET /auth/me
Get current user profile and usage stats.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "plan": "free",
    "stripeCustomerId": null,
    "subscriptionEnd": null,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "_count": { "generations": 15 }
  }
}
```

---

## Generation Endpoints

### POST /generate
Generate YouTube content using AI.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "topic": "How to start a vegetable garden in small spaces",
  "format": "all"  // "ideas" | "titles" | "script" | "all"
}
```

**Response (201):**
```json
{
  "message": "Content generated successfully",
  "data": {
    "id": "gen-uuid",
    "topic": "How to start a vegetable garden...",
    "format": "all",
    "result": {
      "ideas": ["Idea 1", "Idea 2"],
      "titles": ["10 Ways to Grow Vegetables in Apartments"],
      "script": "Hook: Did you know you can grow fresh vegetables..."
    },
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "usage": { "used": 2, "limit": 3 }
}
```

**Errors:**
| Status | Condition |
|--------|-----------|
| 400 | Invalid input |
| 401 | Not authenticated |
| 429 | Daily limit reached (see usage in response) |
| 503 | AI service unavailable |

---

### GET /generate/:id
Get a specific generation by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "data": {
    "id": "gen-uuid",
    "topic": "...",
    "format": "all",
    "result": { ... },
    "model": "gpt-4o-mini",
    "createdAt": "..."
  }
}
```

---

### DELETE /generate/:id
Delete a generation from history.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{ "message": "Generation deleted successfully" }
```

---

## History Endpoints

### GET /history
Get paginated generation history.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (max 100) |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "topic": "...",
      "format": "all",
      "model": "gpt-4o-mini",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### GET /history/search
Search generations by topic.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| q | string | Yes | Search query (min 2 chars) |

---

## Subscription Endpoints

### POST /subscription/checkout
Create a Stripe checkout session for upgrading.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{ "plan": "pro" }  // "pro" | "pro-yearly"
```

**Response (200):**
```json
{ "url": "https://checkout.stripe.com/c/pay/cs_test_..." }
```

---

### GET /subscription/portal
Get Stripe billing portal URL (manage subscription).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{ "url": "https://billing.stripe.com/p/session_..." }
```

---

### POST /subscription/check-session
Verify and activate subscription after Stripe checkout.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| session_id | string | Yes | Stripe checkout session ID |

---

## Webhook Endpoints

### POST /webhook/stripe
Handle Stripe webhook events (payment, cancellation).

**Note:** Called by Stripe. Verified with `STRIPE_WEBHOOK_SECRET`. No auth header needed.

**Events Handled:**
| Event | Action |
|-------|--------|
| `checkout.session.completed` | Activate user subscription |
| `invoice.payment_succeeded` | Update subscription end date |
| `customer.subscription.deleted` | Downgrade user to free plan |
