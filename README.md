# MRK AI Web Builder

MRK AI Web Builder is a Next.js MVP for a non-programmer-friendly AI coding workspace. A user connects GitHub, selects a repository, writes a natural-language request, receives Gemini-generated structured code changes, reviews a diff, approves changes, and prepares the project for commit and preview.

## Features

- GitHub OAuth sign-in using server-side routes and HTTP-only session cookies.
- Repository listing through the GitHub REST API.
- Repository inspection with automatic project type detection.
- Server-side Gemini service abstraction for structured JSON code-change generation.
- Agent workflow: understand, inspect, plan, generate, validate, review, approve, apply, commit, preview.
- Change safety validation for path traversal, secret-like files, and hard-coded secret patterns.
- Professional responsive dashboard with chat, changes, preview, repositories, and settings.
- Prisma schema for users, projects, sessions, messages, change sets, and commits.
- Vercel-compatible Next.js application structure.

## Architecture

```text
app/                 Next.js App Router pages and API routes
components/          Dashboard, chat, GitHub, preview, editor, and UI components
lib/auth/            OAuth session helpers
lib/github/          OAuth and GitHub REST API clients
lib/gemini/          Gemini generation and structured response parser
lib/agent/           Agent workflow, diff creation, safety validation, commit boundary
lib/utils/           Error handling, logging, path safety
prisma/              Persistence schema
types/               Shared TypeScript contracts
prompts/             System instructions for the coding agent
tests/               Node test coverage for safety and parsing logic
```

## Requirements

- Node.js 20 or newer
- npm
- GitHub OAuth App credentials
- Gemini API key
- Database connection string for Prisma

## Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in real values locally or in Vercel. Never commit `.env.local`.

```bash
GEMINI_API_KEY=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
SESSION_COOKIE_NAME=mrk_session
GITHUB_OAUTH_SCOPES=repo read:user user:email
```

## GitHub OAuth Setup

1. Open GitHub in your browser.
2. Go to **Settings → Developer settings → OAuth Apps → New OAuth App**.
3. Set the homepage URL to `http://localhost:3000` for local development.
4. Add this callback URL exactly: `http://localhost:3000/api/auth/github/callback`.
5. Copy the Client ID into `GITHUB_CLIENT_ID`.
6. Generate a Client Secret and place it in `GITHUB_CLIENT_SECRET`.

## Gemini API Setup

1. Create a Gemini API key from Google AI Studio.
2. Add it to `GEMINI_API_KEY` in `.env.local` or Vercel environment variables.
3. Do not paste the key into frontend code or commit it.

## Local Development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Testing

```bash
npm run lint
npm test
npm run build
```

## Deployment to Vercel

1. Import the GitHub repository into Vercel.
2. Keep the Framework Preset as **Next.js**. The committed `vercel.json` also forces `framework: nextjs`, `buildCommand: npm run build`, and `outputDirectory: .next` so Vercel does not look for a legacy `public` output folder.
3. Add the environment variables listed above.
4. Set `NEXTAUTH_URL` to your Vercel production URL.
5. Update the GitHub OAuth callback URL to `https://your-domain.vercel.app/api/auth/github/callback`.
6. Deploy.

## Security

- GitHub passwords and personal access tokens are never requested in the UI.
- Gemini and GitHub secrets stay server-side.
- Session cookies are HTTP-only.
- AI output must be structured JSON and is validated before use.
- Path traversal and secret-like file writes are rejected.
- Destructive changes require explicit user approval.
- Arbitrary AI-generated shell commands are never executed automatically.

## Troubleshooting

- **GitHub connection failed**: confirm Client ID, Client Secret, and callback URL match exactly.
- **Gemini is not configured**: add `GEMINI_API_KEY` on the server.
- **Repository list is empty**: verify the OAuth app scopes and repository access.
- **Build fails after install**: run `npm install` again and confirm Node.js 20+ is active.
