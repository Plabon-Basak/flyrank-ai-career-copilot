# AI Career Copilot

AI Career Copilot is a Next.js application that helps job seekers compare a resume with a job description and receive structured, AI-generated career feedback. Users can maintain a local career profile, request an analysis, and review an overall match score, skill gaps, ATS-oriented feedback, resume improvements, and a learning roadmap.

## Features

- Career profile settings with required and optional fields, accessible validation feedback, browser storage, and reset-to-last-saved behavior.
- Resume text and job description inputs with trimming, length validation, character counters, loading state, error feedback, and retry support.
- Gemini-powered resume analysis through a server-side Next.js Route Handler.
- Overall match score with an explicit notice that it is an AI estimate, not a hiring or actual ATS result.
- Matched skills and missing skills.
- ATS feedback and concrete resume improvement suggestions.
- Prioritized learning roadmap items and analysis limitations.
- Application health status page and health endpoint.
- Automated Node and component tests with component coverage reporting.

## Technology Stack

- Next.js 16.4.5 with the App Router and Route Handlers
- React 19.3.0
- TypeScript 5
- Tailwind CSS 4 through `@tailwindcss/turbopack`
- Google Gemini API through `@google/genai`
- Zod for request and AI-response schema validation
- Node.js built-in test runner, Vitest 5, Testing Library, and V8 coverage

## Application Routes

| Route | Purpose |
| --- | --- |
| `/` | Dashboard with workspace status and quick actions. |
| `/profile` | Career profile form stored in browser `localStorage`. |
| `/analyze` | Resume/job description form, analysis flow, and results view. |
| `/history` | Placeholder for a future analysis-history feature; no analyses are stored there yet. |
| `/health` | Displays application health data fetched from `/api/health`. |

## API Endpoints

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/analyze` | `POST` | Validates the request, calls Gemini on the server, and returns `data` plus `meta` containing the prompt version and generation timestamp. |
| `/api/health` | `GET` | Returns application status, framework, and timestamp. |

## Prerequisites

- Node.js 20.9.0 or newer, as required by the installed Next.js 16 release.
- npm.
- A Google Gemini API key and a supported Gemini model name for live analysis.

## Installation

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Copy the environment template and fill in the real values:

   ```powershell
   Copy-Item .env.example .env.local
   ```

3. Edit `.env.local`:

   ```text
   GEMINI_API_KEY=your_real_api_key
   GEMINI_MODEL=your_supported_gemini_model
   ```

   `GEMINI_API_KEY` and `GEMINI_MODEL` are the only environment variables used by the application. They are read on the server in `src/lib/ai/provider.ts`. Do not prefix them with `NEXT_PUBLIC_`, and do not commit `.env.local`.

4. Start the development server:

   ```powershell
   npm run dev
   ```

   Open `http://localhost:3000`.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run start` | Start the production server after a successful build. |
| `npm run build` | Create the optimized production build. |
| `npm run test:all` | Run all Node tests and all Vitest component tests. |
| `npm run test:node` | Run only Node tests. |
| `npm run test:components` | Run only Vitest component tests. |
| `npm run test:coverage:components` | Run component tests with V8 coverage. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Run TypeScript type checking without emitting files. |

## Project Structure

```text
src/app/
  api/analyze/route.ts       POST /api/analyze handler
  api/health/route.ts        GET /api/health handler
  analyze/                   Analysis page and component tests
  health/                    Health status page
  history/                   Analysis-history placeholder
  profile/                   Career profile page and tests
  layout.tsx                 Root layout and navigation
  page.tsx                   Dashboard
src/components/
  Navigation.tsx             Shared navigation
  analyze/                   AnalysisForm and AnalysisResults components/tests
src/lib/ai/                  Gemini provider, prompt, schemas, and request handler
src/lib/analyze/             Client-facing API helper, validation, and shared types
tests/                       Node tests for validation, API, and AI modules
vitest.config.mts            Vitest and coverage configuration
vitest.setup.ts              Testing Library cleanup and matchers
.env.example                 Environment variable template
WORKFLOW.md                  Historical vague-versus-precise workflow comparison
```

Older vanilla HTML, CSS, and JavaScript artifacts remain tracked from the earlier workflow experiment, but the runnable application is the Next.js App Router project described above.

## Privacy and Security

- The career profile is saved in browser `localStorage` under `aiCareerCopilot.careerProfile.v1`; use **Delete saved data** on the profile page to remove it.
- When an analysis is requested, the resume text, job description, and any optional profile target role and skills are sent to `/api/analyze` and then to Google's Gemini API for analysis.
- The Route Handler requires `Content-Type: application/json`, validates browser `Origin` values, applies a small in-process abuse safeguard, validates input with Zod, and invokes Gemini only on the server.
- The in-process abuse safeguard allows 12 analysis requests per client key per minute. It is best-effort only: it is not distributed, not durable across restarts, and not shared across server instances. Production deployments should add platform-level rate limiting, WAF rules, and spend alerts.
- The application sends security headers including CSP, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, and `Permissions-Policy`. HSTS and `upgrade-insecure-requests` are sent only in production; production must be served over HTTPS.
- The Gemini API key is read from server environment variables and is never exposed to browser code.
- API failures are returned as stable error codes and safe messages; raw provider details are not leaked to the client.
- Analysis results are AI estimates grounded in the supplied text, include limitations, and are not guarantees of hiring, interviews, or ATS outcomes.
- Analysis results are not currently persisted to analysis history.
- `.env.local` is ignored by Git; `.env.example` contains placeholders only.
