# Codra

> **code + creation** — An AI-powered coding platform that lets you write, execute, and get intelligent feedback on your code, all in the browser.

---

## What is Codra?

Codra is a full-stack AI coding assistant platform built as a Turborepo monorepo. It combines a Next.js frontend with a dedicated backend service, connected through Nginx as a reverse proxy.

At its core, Codra lets users:

- Write and execute code directly in the browser using sandboxed environments powered by [E2B](https://e2b.dev)
- Get AI-powered hints, explanations, and mentorship via Google Gemini and Groq
- Sign in securely with Google or GitHub OAuth via NextAuth
- Interact with a persistent database layer through Prisma ORM

The monorepo is structured with `apps/frontend` (Next.js) and `apps/backend` (Node.js), sharing packages under `packages/` — managed with Turborepo for fast, parallel builds.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend | Node.js, TypeScript |
| AI | Google Gemini, Groq, AI SDK |
| Code Execution | E2B Sandboxes |
| Auth | NextAuth (Google + GitHub OAuth) |
| Database | PostgreSQL, Prisma ORM |
| Monorepo | Turborepo, npm Workspaces |
| Reverse Proxy | Nginx |
| Containerization | Docker, Docker Compose |

---

## Installation

### Prerequisites

- Node.js >= 18
- npm >= 11
- Git

### Without Docker (Local Development)

**1. Clone the repository**
```bash
git clone https://github.com/kartiklikesyou/codra.git
cd codra
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**

Create a `.env` file in the root:
```env
# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# OAuth
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret

# AI
GROQ_API_KEY=your_groq_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key

# Code Execution
E2B_API_KEY=your_e2b_api_key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/codra
```

**4. Set up the database**
```bash
npx prisma migrate dev
npx prisma generate
```

**5. Run the development server**
```bash
npm run dev
```

Frontend runs on `http://localhost:3000`  
Backend runs on `http://localhost:8080`

---

### With Docker

**1. Clone the repository**
```bash
git clone https://github.com/kartiklikesyou/codra.git
cd codra
```

**2. Set up environment variables**

Create a `.env` file in the root with the same variables as above.

**3. Build and run with Docker Compose**
```bash
docker compose up --build
```

This spins up three containers:
- `frontend` — Next.js app on port 3000
- `backend` — Node.js API on port 8080
- `nginx` — Reverse proxy on port 80, routing `/api` to backend and everything else to frontend

**4. Access the app**

Open `http://localhost` in your browser.

**To stop:**
```bash
docker compose down
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start all apps in development mode |
| `npm run build` | Build all apps |
| `npm run lint` | Lint all apps |
| `npm run format` | Format all files with Prettier |
| `npm run check-types` | TypeScript type checking |

---

## Project Structure

```
codra/
├── apps/
│   ├── frontend/        # Next.js app
│   └── backend/         # Node.js API
├── packages/            # Shared packages (db, config, etc)
├── docker-compose.yml
├── nginx.conf
├── turbo.json
└── package.json
```

---

## Status

> Currently in active development. More features coming soon.