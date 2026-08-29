# ZoneFix API — MVP

Base URL: `http://localhost:4000/api`

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /me`

## Owner

- `GET /dashboard`
- `POST /zones`
- `POST /mikrotiks`
- `POST /mikrotiks/:id/test`
- `GET /mikrotiks/:id/health`
- `POST /diagnostics`
- `POST /diagnostics/:id/resolve`
- `POST /diagnostics/:id/escalate`
- `POST /mikrotiks/:id/action`

## Technician

- `GET /interventions`
- `POST /interventions/:id/accept`

## Admin

- `GET /admin/overview`

## Payment demo

- `POST /payments/demo-activate`

All protected routes use:

`Authorization: Bearer <JWT>`

