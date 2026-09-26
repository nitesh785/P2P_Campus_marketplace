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
| Frontend | Plain HTML/CSS/JS, no build step; libraries (supabase-js, browser-image-compression) from the jsDelivr CDN |
| Student verification | Roll-number allowlist (`allowed_students` table, CSV import); any email allowed; one account per roll number |
| Admin tools (MVP) | Supabase dashboard (Table Editor, Auth → Users); no in-app admin page yet |

## Decisions

| Date | Decision | Decided by |
| --- | --- | --- |
| 2026-09-25 | Supabase over Firebase (free storage, full-text search, SQL for DBMS learning) | Owner + Claude |
| 2026-09-25 | Payments happen offline (cash/UPI between students); no payment gateway | Owner + Claude |
| 2026-09-25 | Project docs are kept as files in this folder, not as online docs | Owner |
| 2026-09-26 | College gives no email domain, so students are verified by a roll-number allowlist | Owner |
| 2026-09-26 | Frontend is plain HTML/CSS/JS (no React, no build step) | Owner |
| 2026-09-26 | Only students may join (no staff/alumni) | Owner |
| 2026-09-26 | Team members are the admins; they use the Supabase dashboard | Owner |
| 2026-09-26 | Roll-number format `<year><course><3-digit serial>`, e.g. `2026CSE102`; courses CSE, CSDS, CSAI, CSIT | Owner |
| 2026-09-26 | Student emails are not copied into `profiles`; they stay private in `auth.users` | Claude |

## Open questions (move to Decisions when answered)

- [ ] Source of the official roll-number list (CSV)
- [ ] Team members' names and roles
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
- **Folders:** HTML pages at the repo root (`index.html`, `login.html`, `register.html`, `reset.html`); `src/lib/supabase.js` (client + shared helpers); `src/styles/main.css`; `supabase/schema.sql`. Each page has one inline `<script type="module">`.
- **Config:** Supabase URL + anon key live in `src/lib/supabase.js` (public-safe). No env vars in the frontend. GitHub Actions uses secrets `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
- **Roll numbers:** regex `^[0-9]{4}(CSE|CSDS|CSAI|CSIT)[0-9]{3}$`, enforced in the DB (`allowed_students`) and in `src/lib/supabase.js` (`ROLL_NO_PATTERN`). New course → update both.
- **Git:** repo at https://github.com/nitesh785/P2P_Campus_marketplace, default branch `main`. Branching and review rules are TBD by the team.

## Current status

- **Phase:** 2, authentication (see TODO.md).
- **Done:** README rewritten for zero cost; PRD.md and TODO.md created; database chosen.
- **Done:** Git repo pushed to GitHub (`main`).
- **Done:** `schema.sql` run in Supabase (project `icphsbadppjnztfxxuui`); URL + publishable key in `src/lib/supabase.js`; register, login, forgot/reset password, logout and a guarded home page built.
- **Not done yet:** auth flow not yet tested end-to-end; marketplace, listings, dashboard.
- **Next step:** owner adds test roll numbers, sets Auth URLs + Brevo SMTP, tests sign-up; then Phase 3 (create listing + images).

## Change log

| Date | Change |
| --- | --- |
| 2026-09-25 | Created CLAUDE.md, README.md, PRD.md, TODO.md |
| 2026-09-26 | Initialised Git, added .gitignore, pushed to GitHub |
| 2026-09-26 | Switched verification to roll-number allowlist; frontend set to plain HTML/JS; README, PRD, TODO updated |
| 2026-09-26 | Roll-number format decided; added supabase/schema.sql and src/lib/supabase.js |
| 2026-09-26 | Schema run in Supabase; added auth pages (register, login, reset, home with logout) |
