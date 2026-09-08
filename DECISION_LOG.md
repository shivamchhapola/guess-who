# Architecture Decision Log (ADR)

This log records major architectural and technical decisions made during the development of Guess Who Maker Clone.

---

## ADR-001: Next.js App Router for Serverless Hosting on Vercel

* **Date**: 2026-09-08
* **Status**: Accepted
* **Context**: The client requires a zero-cost, zero-maintenance backend where the entire app can be deployed to Vercel without maintaining a dedicated Node.js express/socket server.
* **Decision**: Use Next.js 14+ App Router with Server Actions and API Route Handlers.
* **Consequences**: Easy deployment, high performance, automatic CDN caching for templates, serverless edge handling.

---

## ADR-002: No Login Required to Play, Login Required for Templates

* **Date**: 2026-09-08
* **Status**: Accepted
* **Context**: Low barrier to entry is essential for multiplayer viral growth. Guess Who Maker locks features behind paywalls and signups.
* **Decision**: 
  - Guest players get generated temporary sessions stored in `localStorage` / cookies.
  - Template creation, editing, saving, and publishing requires user authentication.
* **Consequences**: High player conversion, simple onboarding, zero friction.

---

## ADR-003: AI-Ready Codebase & Rules Specification

* **Date**: 2026-09-08
* **Status**: Accepted
* **Context**: Development will proceed iteratively with modern AI tools.
* **Decision**: Create an `.agents/AGENTS.md` rules directory specifying coding style, architecture contracts, and quality standards for AI assistants.
* **Consequences**: Maintains consistent code structure, prevents regression bugs, enables multi-step task completion.
