# Deployment Checklist

## Project

- Project: FlyRank AI Career Copilot
- Production URL: https://flyrank-ai-career-copilot.vercel.app/
- GitHub repository: https://github.com/Plabon-Basak/flyrank-ai-career-copilot
- Production commit: `53c8578`
- Application: Next.js App Router application for Gemini-powered resume and job-description analysis.

This checklist separates completed verification checks from documented procedures that have not been performed as part of FE-21A. No deployment, redeploy, rollback, live production smoke test, or sign-off was performed by this documentation task.

## Completed Verification Checks

### Environment Variables and Secret Handling

- `.env.example` documents the required variables:
  - `GEMINI_API_KEY`
  - `GEMINI_MODEL`
- `.env.local` is the local development configuration file; production deployments require `GEMINI_API_KEY` and `GEMINI_MODEL` to be configured in the hosting platform's environment settings.
- Production environment values were not inspected during FE-21A.
- `GEMINI_API_KEY` and `GEMINI_MODEL` are server-side only and are not prefixed with `NEXT_PUBLIC_`.
- `.env.local` is ignored by Git; `.env.example` contains placeholders only.
- The Gemini API key is read in server code and is not exposed to browser code.

### Dependency Audit

- `npm audit`: 0 vulnerabilities.
- `npm audit --omit=dev`: 0 vulnerabilities.

### Tests and Coverage

- Node tests: 36 passed.
- Component tests: 23 passed.
- Coverage:
  - Statements: 77%
  - Branches: 68.63%
  - Functions: 85.71%
  - Lines: 78.21%

### Lint, Typecheck, and Production Build

- Lint: 0 errors; 4 warnings from generated coverage files.
- Typecheck: passed.
- Production build: passed with Next.js 16.4.6.

### Security Headers and API Protections

- Security headers are configured for all routes:
  - Content-Security-Policy
  - X-Content-Type-Options
  - Referrer-Policy
  - X-Frame-Options
  - Permissions-Policy
  - Strict-Transport-Security in production only
- `/api/analyze` requires `Content-Type: application/json`.
- Browser `Origin` values are validated.
- An in-process abuse safeguard allows 12 analysis requests per client key per minute.
- Request and AI-response payloads are validated with Zod.
- Gemini is invoked only from server-side code.

### Production Routes and Gemini Integration

- Production routes verified from the application/build inventory:
  - `/`
  - `/profile`
  - `/analyze`
  - `/history`
  - `/health`
  - `/api/analyze`
  - `/api/health`
- Gemini integration is implemented through the server-side Route Handler and covered by automated tests with mocked provider responses.
- Live production Gemini calls were not performed as part of FE-21A.

### Final Mobile Lighthouse Results

| Category | Score |
| --- | --- |
| Performance | 98 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

No final axe or WAVE pass is claimed, and no axe package was installed. Lighthouse's automated accessibility score does not replace manual WCAG testing.

### Error-Handling Verification

- API failures return stable error codes and safe messages.
- Raw provider details are not leaked to clients.
- Automated tests cover malformed requests, provider errors, rate limits, unknown errors, and safe response content.

## Monitoring Procedure

### Manual Health Check

1. Open the production URL: https://flyrank-ai-career-copilot.vercel.app/
2. Open `/health` and confirm the page reports application health.
3. Request `GET /api/health`.
4. Confirm the JSON response includes `status: "Operational"`, the application name, framework, and a current timestamp.
5. Confirm the response uses `Cache-Control: no-store`.
6. Spot-check `/`, `/profile`, and `/analyze` for expected rendering and navigation.
7. Repeat after each deployment and during routine release verification.

### Known Monitoring Limitations

- No automated alerting is configured.
- Health checks are manual and do not currently measure Gemini API latency or spend.
- The in-process abuse safeguard does not provide distributed rate-limit telemetry.

## Rollback Procedure

Status: documented, not tested during FE-21A.

1. Open the Vercel project.
2. Open Deployments.
3. Identify the previous known-good Ready production deployment.
4. Open its deployment menu.
5. Select Redeploy and confirm.
6. Wait for Ready.
7. Verify the production URL and critical routes.

Critical routes to verify after rollback: `/`, `/profile`, `/analyze`, `/health`, `/api/analyze`, and `/api/health`.

## Known Limitations

- Rate limiting is in-process, not distributed.
- No authentication is implemented.
- CSP retains `unsafe-inline`; `unsafe-eval` is development-only.
- No automated alerting is configured.
- Analysis results are AI estimates and are not guarantees of hiring, interviews, or ATS outcomes.
- Analysis results are not persisted to analysis history.

## Deployment Sign-off

Status: pending project owner sign-off.

Project owner signature: ______________________________________

Date: ______________________________________________________
