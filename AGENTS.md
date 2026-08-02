# AGENTS.md

## Cursor Cloud specific instructions

This repo is the Pulse8 Next.js 14 frontend. The actual app lives in the nested
`pulse8-frontend/` subfolder — run all npm commands from
`/agent/repos/pulse8front/pulse8-frontend`. The .NET backend API is a separate
repo checked out at `/agent/repos/pulse8` and must be running for the app to do
anything useful.

The startup snapshot has Node (v22) preinstalled, and the update script runs
`npm install` for this app. It does not start the dev server.

### Required environment (`.env.local`)

`.env.local` is git-ignored and persists in the VM snapshot. If it is missing,
recreate it in `pulse8-frontend/` before starting the dev server:

```bash
cat > /agent/repos/pulse8front/pulse8-frontend/.env.local <<'EOF'
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=dev-placeholder.apps.googleusercontent.com
EOF
```

Non-obvious gotchas:

- `src/app/providers.tsx` **throws** if `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is empty,
  which makes every route return HTTP 500. A placeholder value is enough to
  render the app; email login/registration works without a real Google app. Use
  a real client id only to exercise Google OAuth.
- Point `BACKEND_URL`/`NEXT_PUBLIC_BACKEND_URL` at plain HTTP `:5000`. Do not use
  the API's HTTPS `:5001` endpoint — its dev cert is untrusted and Node's
  server-side proxy calls will fail. (Run the API HTTP-only; see the backend
  repo's AGENTS.md.)
- Changing `.env.local` requires restarting `npm run dev`.

### Commands (run from `pulse8-frontend/`)

- Dev server: `npm run dev` → http://localhost:3000
- Lint: `npm run lint` (only warnings expected)
- Type-check: `npm run type-check` (clean)
- Production build: `npm run build`

### Quick end-to-end check

With Postgres + API + frontend running, register an account (Admin) and view its
dashboard:

1. Start the API and frontend (see backend AGENTS.md for the API command).
2. Register via API — note `organizationState` must be <= 2 chars:
   `curl -X POST http://localhost:5000/api/auth/register -H 'Content-Type: application/json' -d '{"firstName":"Grace","lastName":"Hopper","userEmail":"grace@pulse8.dev","password":"Passw0rd!","userPhone":"11988887777","document":"98765432100","organizationName":"Cobol Events","organizationCnpj":"11222333000181","organizationAddress":"1 Navy Rd","organizationCity":"Sao Paulo","organizationState":"SP","organizationZipCode":"01000000","organizationPhone":"1140000000","organizationEmail":"org2@pulse8.dev"}'`
3. Log in at http://localhost:3000/login with those credentials and you land on
   the authenticated dashboard.
