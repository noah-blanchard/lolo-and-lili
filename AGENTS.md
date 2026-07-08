<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Repository map & coding rules

The full repo map, conventions, the server request contract, validation rules, and the
step-by-step "how to add a feature" checklist live in [`docs/REPO_MAP.md`](./docs/REPO_MAP.md).
Read it before implementing anything — it documents the non-negotiable rules (zod validation
on every server entry point, `defineRoute`/`defineAction`, couple-scoped RLS, centralized
query keys, `next-intl` copy, `@/*` imports, etc.).

Also read [`docs/UI_ANIMATION_GOTCHAS.md`](./docs/UI_ANIMATION_GOTCHAS.md) whenever you build
modals, lightboxes, drawers, or any animated mount/unmount UI with `motion/react` — it covers
the common `AnimatePresence` early-return footgun that silently kills exit animations.

# Package manager

Always use **bun** and **bunx** — never `npm` or `npx`. The project uses `bun.lock`.
