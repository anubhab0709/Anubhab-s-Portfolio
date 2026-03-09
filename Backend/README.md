# Portfolio Backend

Production-ready backend for the portfolio website.

## Features

- Express API with secure middleware defaults
- MongoDB persistence via Mongoose
- Google OAuth token verification (backend-side)
- JWT-based session token for API authorization
- Guestbook APIs with validation and rate limiting
- Request logging with Pino + request IDs
- Health endpoint for uptime and DB status
- Docker and docker-compose support

## Tech Stack

- Node.js 20+
- Express
- MongoDB + Mongoose
- Zod validation
- Google Auth Library
- JWT (`jsonwebtoken`)

## Quick Start

1. Copy env file.

```bash
cp .env.example .env
```

2. Fill required values in `.env`.

3. Install dependencies.

```bash
npm install
```

4. Start in development mode.

```bash
npm run dev
```

Backend default URL: `http://localhost:8080`

## MongoDB Setup (Without Docker, macOS)

MongoDB community service can run directly via Homebrew.

Start MongoDB:

```bash
npm run mongo:start
```

Check status:

```bash
npm run mongo:status
```

Stop MongoDB:

```bash
npm run mongo:stop
```

If MongoDB is already installed and running, keep:

```env
MONGODB_URI=mongodb://localhost:27017/portfolio
SKIP_DB=false
```

Test DB connection through API:

```bash
curl http://localhost:8080/api/v1/health
```

Expected `mongo` value: `"up"`

## API Base

`/api/v1`

## Endpoints

- `GET /api/v1/health` - health check
- `POST /api/v1/auth/google` - verify Google credential and issue JWT
- `GET /api/v1/guestbook?limit=20&page=1` - list guestbook messages
- `POST /api/v1/guestbook` - create message (requires `Authorization: Bearer <token>`)
- `DELETE /api/v1/guestbook/:entryId` - delete own message
- `PATCH /api/v1/guestbook/:entryId/hide` - admin hide message
- `POST /api/v1/contact` - send contact form email via Resend
- `POST /api/v1/chat` - portfolio chatbot reply using OpenAI API

## Security Notes

- `JWT_SECRET` must be a strong random string (32+ chars)
- Restrict `CORS_ORIGINS` to your frontend domain(s)
- Configure `ADMIN_EMAILS` for moderation routes
- Configure `OPENAI_API_KEY` for chatbot endpoint
- Configure `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` for contact mail delivery
- Sensitive request fields are redacted from logs by default (authorization, cookies, auth credentials)

## Production Setup

Use the production template:

```bash
cp .env.production.example .env
```

Then set:

- `MONGODB_URI` to your production MongoDB/Atlas URI
- `CORS_ORIGINS` to only your production frontend domain(s)
- `JWT_SECRET` to a strong random secret
- `GOOGLE_CLIENT_ID`, `RESEND_API_KEY`, and contact sender/receiver emails

Do not commit `.env` to source control.

## Docker

Run MongoDB + backend:

```bash
docker compose up --build
```
