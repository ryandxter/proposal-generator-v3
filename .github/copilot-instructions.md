# Copilot Instructions for Proposal Generator App

## Project Overview
- This is a Next.js app for generating business proposals, tightly integrated with [v0.app](https://v0.app) and deployed on Vercel.
- All changes made in v0.app are auto-synced to this repo; manual edits may be overwritten by v0.app deployments.
- Supabase is used for database and authentication; see `DATABASE_SETUP.md` for schema and setup.

## Architecture & Key Patterns
- **Pages & Routing:**
  - App routes are in `app/` (e.g., `create-proposal`, `designer`, `settings`, etc.).
  - API routes (e.g., PDF generation) are in `app/api/`.
- **Components:**
  - UI components are in `components/ui/` (Radix UI, custom shadcn components).
  - Auth, navigation, and PDF preview logic are in `components/`.
- **PDF Generation:**
  - PDF logic is in `lib/pdf-generator.ts` and `utils/htmlToPdf.ts`.
  - API endpoint for PDF: `app/api/generate-pdf/route.ts`.
- **Database:**
  - Supabase tables for templates, products, portfolios, proposals (see `DATABASE_SETUP.md`).
  - RLS (Row Level Security) is enabled for multi-tenant isolation.
  - SQL migration scripts in `scripts/`.
- **State & Auth:**
  - Auth logic in `components/auth-provider.tsx` and `lib/supabase/`.
  - Use context providers for auth/session state.

## Developer Workflows
- **Local Development:**
  - Start dev server: `pnpm dev` or `npm run dev`
  - Build: `pnpm build` or `npm run build`
  - Lint: `pnpm lint` or `npm run lint`
- **Database Setup:**
  - Follow `DATABASE_SETUP.md` and run SQL scripts in `scripts/` via Supabase dashboard.
  - Set required env vars in Vercel (see `DATABASE_SETUP.md`).
- **Deployment:**
  - Vercel auto-deploys on repo changes or v0.app sync.

## Conventions & Integration Notes
- **v0.app Sync:**
  - Manual code changes may be overwritten by v0.app sync.
  - UI structure may reflect v0.app conventions (e.g., component naming, layout).
- **Styling:**
  - Global styles in `app/globals.css` and `styles/globals.css`.
  - Component styles in CSS modules (e.g., `components/PDFLayout.module.css`).
- **External Libraries:**
  - Uses Radix UI, shadcn/ui, jsPDF, Supabase client.
- **File/Folder References:**
  - Key files: `app/api/generate-pdf/route.ts`, `lib/pdf-generator.ts`, `components/auth-provider.tsx`, `DATABASE_SETUP.md`, `scripts/`.

## Example: PDF Generation Flow
1. User fills proposal form in `create-proposal` page.
2. Data is sent to `/api/generate-pdf` (see `app/api/generate-pdf/route.ts`).
3. PDF is generated using `lib/pdf-generator.ts` and returned to frontend.

---

If any conventions or workflows are unclear, ask the user for clarification or examples from their recent work.