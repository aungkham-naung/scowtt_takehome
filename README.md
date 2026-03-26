# Movie Memory

A full-stack web application where users sign in with Google, set their favorite movie, and generate AI-powered fun facts about it.

**Tech Stack:** TypeScript, Next.js 16, React, Tailwind CSS v4, PostgreSQL, Prisma, Google OAuth 2.0, OpenAI API

## Setup Instructions

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)
- A [Google Cloud OAuth 2.0](https://console.cloud.google.com/apis/credentials) client (Web application type)
- An [OpenAI API key](https://platform.openai.com/api-keys) with billing enabled

### 1. Clone and install

```bash
git clone https://github.com/aungkham-naung/scowtt_takehome.git
cd scowtt_takehome
npm install
```

### 2. Start PostgreSQL with Docker

```bash
docker run --name movie-memory-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=movie-memory \
  -p 5433:5432 \
  -d postgres:16
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/movie-memory"
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
SESSION_SECRET=<generate-with: openssl rand -base64 32>
NEXT_PUBLIC_URL=http://localhost:3000
OPENAI_API_KEY=<your-openai-api-key>
```

> In the Google Cloud Console, add `http://localhost:3000/api/auth/google/callback` as an authorized redirect URI.

### 4. Run database migration

```bash
npx prisma migrate deploy
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Running tests

```bash
npm test
```

## Architecture Overview

### Database Schema

Two tables with a one-to-many relationship:

- **users** — stores Google profile data and the user's favorite movie
- **facts** — stores AI-generated fun facts, linked to a user and the movie it was generated for

The `movie` column on `facts` captures which movie the fact was about, so facts remain accurate even after the user changes their favorite movie.

### Authentication & Authorization

Google OAuth 2.0 implemented from scratch (no NextAuth.js):

1. **`/api/auth/google`** — redirects to Google's consent screen
2. **`/api/auth/google/callback`** — exchanges the authorization code for tokens, fetches user info, upserts the user in the database, and creates a session
3. **Session management** — stateless JWT (signed with HS256 via `jose`) stored in an HttpOnly cookie with 24h expiry
4. **Route protection** — `proxy.ts` (Next.js 16's replacement for `middleware.ts`) checks the JWT on every request. Unauthenticated users can only access `/` and `/api/auth/*`. Authenticated users hitting `/` are redirected to `/dashboard`.
5. **Onboarding guard** — a server-side layout checks if the user has set a favorite movie. If not, they're redirected to `/onboarding`.

### API Layer

| Method | Route                       | Description                  |
| ------ | --------------------------- | ---------------------------- |
| GET    | `/api/auth/google`          | Redirect to Google OAuth     |
| GET    | `/api/auth/google/callback` | OAuth callback handler       |
| GET    | `/api/me`                   | Return authenticated user    |
| PUT    | `/api/me/movie`             | Update favorite movie        |
| GET    | `/api/fact`                 | Generate a fun fact (OpenAI) |

A typed API client (`app/lib/api.ts`) wraps all fetch calls with generic error handling and typed responses (`UserResponse`, `FactResponse`, `ApiError`).

### Client Architecture

- **Server components** for data fetching (dashboard page fetches user from Prisma, passes to client)
- **Client components** for displaying (ProfileCard handles editing, fact generation, sign-out)
- **Optimistic UI** on movie edit — the UI updates immediately and reverts if the API call fails
- **Client-side fact caching** — facts are cached in a `useRef` with a 30-second TTL. The cache is keyed by movie name and invalidated when the movie changes.

## Why Variant B

I chose Variant B (frontend-focused) because I enjoy working with visual components and the collaboration between frontend and backend. Many of the subtle bugs and performance issues in web apps come down to how you manage client state which includes scenerios such as a `useEffect` that fires too often, or unnecessary refetches that cause UI flicker. This variant let me demonstrate that understanding.

## Key Tradeoffs

These decisions were all made with the app's small scale in mind:

- **Stateless JWT sessions via `jose`** instead of database-backed sessions with refresh/access tokens. For a small app, we don't need to track every login or support "sign out of all devices." JWT keeps things simple and avoids extra database queries on every request.
- **`useState` instead of Zustand/Redux** — the state is local to one component (ProfileCard) and doesn't need to be shared. A state management library would be unnecessary overhead here.
- **`useRef` + `created_at` for the 30-second cache TTL** instead of React Query. React Query is great at scale, but for a single cached value with a simple expiry, a ref is more straightforward and avoids adding another dependency.

## What I'd Improve With More Time

- **Database-backed sessions** with refresh tokens for proper token rotation and remote session revocation
- **Rate limiting** on the `/api/fact` endpoint to prevent abuse of the OpenAI API
- **Display previously generated facts** so users can see their history instead of only the latest one
