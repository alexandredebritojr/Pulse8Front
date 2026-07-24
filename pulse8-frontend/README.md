# Pulse8 Frontend

Pulse8 is a Next.js web application for event-production operations. Its UI covers authentication, administration, events, guests and check-in, finance, calendars, marketing assets and campaigns, teams, promoters, suppliers, reporting, and settings.

## Verified stack

- Next.js 14 (App Router), React 18, and TypeScript
- Tailwind CSS, Radix UI primitives, Lucide icons, and `tailwind-merge`
- React Hook Form and Zod for forms and validation
- Axios-based API client
- Google OAuth through `@react-oauth/google`
- FullCalendar, React Big Calendar, Moment, and date-fns for scheduling

The repository does not currently contain a unit-test runner, a formal E2E suite, NextAuth, TanStack Query, or Zustand.

## Architecture

```text
src/
├── app/                  App Router pages, layouts, and route handlers
│   ├── (auth)/           Login, registration, and password recovery pages
│   ├── (dashboard)/      Authenticated feature areas
│   ├── api/auth/         Server-side authentication proxies
│   └── auth/instagram/   Instagram OAuth callback
├── components/           Shared UI and feature components
├── hooks/                Reusable React hooks
├── lib/
│   ├── api/              Backend client and service modules
│   ├── auth/             Authentication context
│   ├── config.ts         Public backend configuration
│   └── validations/      Zod schemas
└── types/                Shared TypeScript API and domain types
```

Browser API requests use `NEXT_PUBLIC_BACKEND_URL` and are sent to the backend under `/api`. The authentication route handlers use `BACKEND_URL` (with the public backend URL as a compatibility fallback) for server-to-server requests.

## Endpoints and integrations

The frontend exposes these Next.js route handlers:

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`

The client also calls the configured backend's `/api` endpoints for the application feature areas. Configure backend CORS to permit the frontend origin and to support credentials where required.

Google OAuth requires `NEXT_PUBLIC_GOOGLE_CLIENT_ID`; it has no repository fallback. Instagram OAuth requires `NEXT_PUBLIC_INSTAGRAM_APP_ID` and `NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI`; its callback exchanges the authorization code with the configured backend. Configure authorized JavaScript origins and redirect URIs with each provider.

## Setup

Prerequisites: Node.js 18 or 20 and npm.

```bash
npm install
cp .env.example .env.local
# Edit .env.local with environment-specific values.
npm run dev
```

The development server runs at `http://localhost:3000`. The default local backend URLs in existing API configuration point to `https://localhost:5001`; set the backend variables explicitly instead of relying on that fallback.

## Environment variables

`.env` and `.env.*` are ignored by Git. `.env.example` is the only committed template and intentionally contains no real values.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_BACKEND_URL` | Backend origin exposed to browser code. |
| `BACKEND_URL` | Backend origin used by server-side route handlers. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Required Google OAuth client ID. |
| `NEXT_PUBLIC_INSTAGRAM_APP_ID` | Required to initiate Instagram OAuth. |
| `NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI` | Required Instagram OAuth callback URI. |
| `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD` | Non-production administrator account for captures and login checks. |
| `E2E_MANAGER_*`, `E2E_COORDINATOR_*`, `E2E_OPERATOR_*`, `E2E_VIEWER_*` | Non-production accounts used by the full screenshot capture script. |
| `E2E_API_EMAIL`, `E2E_API_PASSWORD` | Non-production account for `test-api.js`. |

Supply E2E values through the shell or your CI secret store. The scripts do not load or embed credentials.

## Build, checks, and captures

```bash
npm run lint
npx tsc --noEmit
npm run build
```

`npm run type-check` is equivalent to `npx tsc --noEmit`. Screenshot and manual login scripts require Playwright plus the appropriate `E2E_*` variables; start the app first, then run a script directly, for example:

```bash
E2E_ADMIN_EMAIL=... E2E_ADMIN_PASSWORD=... node test-login.js
```

`capture-screenshots.js` additionally requires all five role credential pairs. No automated test command is currently configured.

## Deployment

The existing deployment checklist targets a Node web service such as Render:

```bash
npm ci && npm run build
npm start -- -p $PORT
```

Set `NEXT_PUBLIC_BACKEND_URL`, `BACKEND_URL`, and configured OAuth variables in the deployment platform. Use the platform's secret manager for test accounts and any backend credentials; do not add them to frontend environment variables unless they are intentionally public.

## Production limitations

- There is no committed CI pipeline, automated unit-test suite, or formal E2E runner.
- OAuth errors and some diagnostics are currently surfaced in the browser UI/console and should be reviewed before a production rollout.
- Backend availability, authentication-token storage, CORS policy, and authorization enforcement are backend-dependent and must be validated in the target environment.
- Screenshot scripts are operational tools, not production tests; they require isolated non-production accounts.

## AI usage

Pulse8 supports an `AI` marketing-asset type in the UI. This repository contains no configured AI model provider, API key, prompt-processing service, or generated-content pipeline. Any future AI integration must keep provider secrets server-side, document data handling and consent, and add appropriate security and output-quality review.

## Security follow-up

Previously committed OAuth identifiers and test credentials must be treated as exposed. Rotate or restrict OAuth clients and app settings (authorized origins, redirect URIs, and allowed users) and reset any associated test accounts. If the repository was public or broadly accessible, evaluate Git-history cleanup with the security owner after rotation; removing current references does not remove historical copies.

