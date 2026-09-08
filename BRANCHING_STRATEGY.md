# Git Branching & Workflow Strategy

To maintain high code quality, enable easy rollback, and keep changes modular for AI-assisted development, we enforce a strict git branching model.

---

## 1. Branch Hierarchy

```
  main (Production)
   ▲
   │  [Release Tag / Hotfix]
  develop (Staging & Integration)
   ▲
   ├─ feature/01-project-setup
   ├─ feature/02-board-component
   ├─ feature/03-template-creator
   ├─ feature/04-webrtc-multiplayer
   └─ fix/bug-description
```

### Branch Definitions

- **`main`**: Production-ready code hosted directly on Vercel. Direct commits are **PROHIBITED**. All updates arrive via pull requests from `develop`.
- **`develop`**: Integration branch for completed features. Staging deployments run from this branch.
- **`feature/<short-description>`**: Topic branches for developing new features. Created from `develop`.
- **`fix/<short-description>`**: Bug fix branches created from `develop` or `main` (hotfixes).

---

## 2. Naming Conventions

- **Feature Branches**: `feature/card-flip-animation`, `feature/supabase-auth`, `feature/room-code-gen`
- **Bug Fix Branches**: `fix/webrtc-disconnection`, `fix/card-grid-overflow`
- **Commit Messages**: Standard Conventional Commits:
  - `feat: add card flip micro-animation`
  - `fix: handle edge case on room disconnect`
  - `docs: update system architecture diagram`
  - `refactor: extract game room state machine`

---

## 3. Pull Request & Review Checklist

Before merging any branch into `develop` or `main`:
1. [ ] All TypeScript types pass (`npm run type-check` or `npx tsc --noEmit`).
2. [ ] Zero linting errors (`npm run lint`).
3. [ ] Successful build (`npm run build`).
4. [ ] Manual testing of affected components completed.
5. [ ] Commit history is clean with descriptive commit messages.
