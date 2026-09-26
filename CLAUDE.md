# CLAUDE.md: Campus Marketplace

Shared context for Claude and the team. This file is committed to Git so it works on every teammate's device.
**Claude: when a teammate states a preference or makes a decision, update the matching section below and add a Change Log entry.**

## Project

College-only web marketplace where verified students buy and sell second-hand items (books, calculators, cycles, hostel items). It is an academic, first-year engineering group project.

- Requirements: [PRD.md](PRD.md)
- Task checklist: [TODO.md](TODO.md) (tick items as they're done)
- Full setup, SQL schema, security policies: [README.md](README.md)

## Hard rules (never break)

1. **Zero cost.** Only free tiers, and no service that needs a credit card or billing account. Before adding any library or service, confirm it's free with no card required.
2. **No Firebase Storage.** Since Feb 2026 it requires the Blaze (billing) plan.
3. **Never commit secrets.** `.env` stays out of Git; only `.env.example` with placeholders is committed. The Supabase `service_role` key must never appear in frontend code or the repo. The `anon` key is fine in frontend code.
4. **Security lives in the database.** Every table has Row Level Security; don't rely on UI-only checks.
5. **Stay inside free-tier limits.** Compress images to WebP, 1080 px, 200 KB or less. Paginate queries (20 per page). Delete storage images when their listing is deleted.

## Tech stack (decided)

| Layer | Choice |
| --- | --- |
| Database | Supabase PostgreSQL (free: 500 MB) |
| Auth | Supabase Auth + email confirmation |
| Images | Supabase Storage, bucket `product-images`, path `<user_id>/<product_id>/<n>.webp` |
| Emails | Brevo free SMTP (fallback: Resend or Gmail SMTP) |
| Hosting | Cloudflare Pages |
| Keep-alive | GitHub Actions cron, twice a week (Supabase pauses after 7 idle days) |
| Contact | WhatsApp `wa.me` links (no in-app chat in MVP) |
| Frontend | **TBD**: plain HTML/CSS/JS or React + Vite |

## Decisions

| Date | Decision | Decided by |
| --- | --- | --- |
| 2026-09-25 | Supabase over Firebase (free storage, full-text search, SQL for DBMS learning) | Owner + Claude |
| 2026-09-25 | Payments happen offline (cash/UPI between students); no payment gateway | Owner + Claude |
| 2026-09-25 | Project docs are kept as files in this folder, not as online docs | Owner |

## Open questions (move to Decisions when answered)

- [ ] College email domain (e.g. `@abc.edu.in`). Allow staff/alumni?
- [ ] Frontend: plain HTML/JS or React + Vite?
- [ ] Demo or submission deadline
- [ ] Is college permission needed?
- [ ] Approximate number of students (for PRD success targets)

## Team

| Name | Role / area | Notes |
| --- | --- | --- |
| _TBD_ | | |

## Team preferences

Coding style, tools, communication and workflow preferences go here as teammates give them.

- Keep docs and plans as Markdown files in this repo folder (PRD.md, TODO.md, README.md), not online docs.
- _(add more as they come)_

## Conventions

- **Database:** snake_case tables/columns; schema lives in `supabase/schema.sql`; every schema change goes in that file.
- **Folders:** `src/lib` (Supabase client, helpers), `src/pages`, `src/components`, `src/styles`, `supabase/`.
- **Env vars:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_COLLEGE_DOMAIN`.
- **Git:** repo at https://github.com/nitesh785/P2P_Campus_marketplace, default branch `main`. Branching and review rules are TBD by the team.

## Current status

- **Phase:** 0, decisions and accounts (see TODO.md).
- **Done:** README rewritten for zero cost; PRD.md and TODO.md created; database chosen.
- **Done:** Git repo initialised and committed locally (`main`). Push pending: GitHub account needs collaborator access.
- **Not done yet:** code, Supabase project.
- **Next step:** once the domain and frontend choice are known, continue Phase 1 (folder structure, `.env.example`, `schema.sql`).

## Change log

| Date | Change |
| --- | --- |
| 2026-09-25 | Created CLAUDE.md, README.md, PRD.md, TODO.md |
| 2026-09-26 | Initialised Git, added .gitignore, first commit (push blocked: no write access yet) |
