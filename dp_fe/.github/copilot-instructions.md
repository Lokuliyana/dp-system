# Copilot / AI Agent Instructions — dp_fe

Summary
- This is a Next.js 14 app-router front-end (see `app/` for routes). Use `pnpm` (pnpm-lock.yaml present) for installs and scripts.

High-level architecture (big picture)
- Routes: `app/` contains server and client route files (Next app-router). Each route typically has `page.tsx` (+ nested folders like `students/[gradeId]`).
- UI: `components/` contains reusable and feature-scoped React components. `components/index.ts` is the central public API for importing components across pages.
- Data layer: `services/` contains small service classes (static methods) that operate on in-memory arrays. `testData/` provides generators and sample datasets used by `hooks/use-app-data.ts`.
- Hooks: `hooks/` contains client hooks (many files start with `"use client"`) used by components for local app state.
- Styling: Tailwind + global CSS (`styles/globals.css`). PostCSS and Tailwind are configured in repo.

Key developer workflows
- Install: `pnpm install` (pnpm recommended because `pnpm-lock.yaml` exists).
- Run dev server: `pnpm dev` → starts Next dev server.
- Build: `pnpm build` (uses `next build`).
- Start production: `pnpm start`.
- Lint: `pnpm lint`.

Project-specific conventions and examples
- Central re-exports: components are re-exported from `components/index.ts` — add new feature components and update this file so other pages import from a single entry.
  - Example: `export { StudentDetailsPage, StudentListView } from "./students"`
- Client components: Many components are explicit client components using `"use client"` at the top (see `components/advanced-table.tsx`, `components/app-shell.tsx`). If your component uses hooks or browser APIs, add `"use client"`.
- Services operate on in-memory datasets: Services expect arrays from `testData/` or `useAppData()` rather than calling real APIs. See `services/student-service.ts` for the pattern (class with static helpers: `getStudentById(students, id)`). Mimic the same signature for new services.
- App data seed: `hooks/use-app-data.ts` aggregates `testData/` (e.g., `generateStudents()`) and exposes a simple client-side data store. For quick UI work, consume `useAppData()` instead of integrating backend calls.
- Path alias: imports use `@/` mapped to repo root (see `tsconfig.json` paths). Use `import { X } from "@/components"` or `"@/services"`.

Integration & dependencies
- Many UI libs: Radix (`@radix-ui/*`), Framer Motion, Recharts, lucide-react, next-themes, sonner for toasts. Prefer existing components and UI primitives.
- Analytics: `@vercel/analytics` is installed and may appear in `app/analytics`.

Where to look first when changing/adding features
- Add a new page/route: create `app/<route>/page.tsx`. Import UI from `components/` and data from `hooks/use-app-data` or `services/`.
- Add a new component: place in `components/<feature>/` and export it in that folder's `index.ts` and from `components/index.ts`.
- Add data logic: add service in `services/` as a class with static functions. Keep signatures pure (arrays in, arrays/values out) to match existing test-first UX.

Common pitfalls to avoid
- Forgetting `"use client"` on components that use hooks/browser APIs — that causes runtime errors under app-router.
- Not re-exporting components from `components/index.ts` — many pages import from the central index.
- Assuming network APIs exist — most current services operate on `testData/`; adding network calls should be done consciously and wrapped so components/hook consumers remain testable.

References (examples to inspect)
- Route & layout: `app/layout.tsx`, `app/page.tsx`
- Component export: `components/index.ts`
- Data hook: `hooks/use-app-data.ts`
- Service pattern: `services/student-service.ts`, `attendance-service.ts`
- Sample data: `testData/` (generators and types)
- Scripts & deps: `package.json`, `pnpm-lock.yaml`, `tsconfig.json`

If anything above is unclear or you want me to add example PR-ready snippets (e.g., a new page template, service stub, or component scaffold), tell me which one and I will add it.