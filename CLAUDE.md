# CLAUDE.md: Campus Marketplace

Shared context for Claude and the team. This file is committed to Git so it works on every teammate's device.
**Claude: when a teammate states a preference or makes a decision, update the matching section below and add a Change Log entry.**

## Project

College-only web marketplace where verified students buy and sell second-hand items (books, calculators, cycles, hostel items). It is an academic, first-year engineering group project.

- Requirements: [PRD.md](PRD.md)
- Task checklist: [TODO.md](TODO.md) (tick items as they're done)
- Feature ideas within the free tiers: [suggestion.md](suggestion.md)
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
| Keep-alive | `.github/workflows/keep-alive.yml`, twice a week (Supabase pauses after 7 idle days) |
| Contact | In-app chat (`messages.html`, Supabase Realtime); WhatsApp `wa.me` links only for students who opted in |
| Frontend | Plain HTML/CSS/JS, no build step; libraries (supabase-js, browser-image-compression) from the jsDelivr CDN |
| Student verification | Roll-number allowlist (`allowed_students` table, CSV import); any email allowed; one account per roll number |
| Admin tools | `admin.html` (reports, block/unblock, remove listings) for profiles with `is_admin = true`; roll list still in the Supabase dashboard |

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
| 2026-09-27 | Listings have a quantity (1–99). "Sold one" lowers it; the last one is marked sold | Owner + Claude |
| 2026-09-27 | Build every free-tier feature from suggestion.md except email alerts | Owner |
| 2026-09-27 | Listings expire 60 days after posting/renewal via an `expires_at` column filtered in queries (no cron job) | Claude |
| 2026-09-27 | Only a buyer the seller replied to in Messages can rate that seller, once per conversation | Claude |
| 2026-09-27 | Students don't see their own listings when browsing (marketplace, search, recently viewed, landing, related). They manage them on the dashboard and see them on their own seller profile | Owner |
| 2026-09-27 | Chats are kept when their listing or wanted post is deleted (deliberate: the history stays; the chat header just loses its link). Don't change without asking | Owner |
| 2026-09-27 | College is ABESIT; meeting spots come from the campus map (`CAMPUS_SPOTS` in `layout.js`, pins in % of the map) | Owner |
| 2026-09-27 | Official logo used for header/footer mark, sign-in panels, About, favicon and app icons | Owner |
| 2026-09-27 | WhatsApp numbers are private by default (opt-in `show_whatsapp`); only `whatsapp_numbers()` can return a number. "I have this" on Wanted opens an in-app chat | Owner |
| 2026-09-27 | Admins are set by SQL (`update profiles set is_admin = true ...`); users can never change `is_admin`/`blocked` | Claude |

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
- **UI & motion:** follow the installed Claude Code skills `emil-design-eng` and `animate` (Emil Kowalski's philosophy). Use `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` from `main.css`; animate only transform/opacity; UI motion under 300 ms; press feedback `scale(0.97)`; no animation on page load or frequent actions; always a `prefers-reduced-motion` variant; hover motion only behind `@media (hover: hover) and (pointer: fine)`.
- **Code style:** the Ponytail plugin is active: simplest working code, native browser features before libraries, fewest files. It never cuts security, validation or accessibility.
- _(add more as they come)_

## Conventions

- **Database:** snake_case tables/columns; schema lives in `supabase/schema.sql`; every schema change goes in that file.
- **Pages (repo root):** `index.html` (public landing), `login.html`, `register.html`, `reset.html`, `marketplace.html`, `product.html`, `sell.html` (edit mode via `?id=`), `dashboard.html` (my listings, stats, saved items), `profile.html`, `seller.html?id=`, `wanted.html`, `messages.html?c=`, `admin.html`, `offline.html` (PWA fallback), `how-it-works.html`, `about.html`, `faq.html`, `privacy.html`, `terms.html`, `404.html` (served by Cloudflare for missing URLs).
- **Shared code:** `src/lib/supabase.js` (client, `requireUser`, `nextPage`, `showMessage`, `busy`), `src/lib/layout.js` (header/footer injected into `#site-header`/`#site-footer`, `productCard`, `skeletonCards`, `stateBlock`, `icon`, formatters), `src/styles/main.css` (the design system), `src/icons.svg` (Lucide subset; add a symbol there before using a new icon).
- **Analytics:** Cloudflare Web Analytics beacon (public token) before `</body>` on every page except `offline.html`. New pages must include it.
- **Brand assets:** `images/logo-mark.png` (header/footer, transparent), `images/logo-emblem.webp` (large), `images/campus-map.webp` (900 px). Originals (1.4 MB each) live in `design/`; never link them from pages. Icons in `icons/` are generated from the emblem.
- **Meeting spots:** `CAMPUS_SPOTS` in `src/lib/layout.js` (name + pin x/y %). `openCampusMap()` shows the picker (sell form) or one spot (item page). Adding a spot = one line there.
- **Phones (≤ 900 px):** signed-in students get a bottom tab bar (`renderBottomNav()` in `layout.js`: Browse, Wanted, Sell, Chats, Me); it hides inside a chat (`body.in-thread`). Anything fixed to the bottom must add `var(--bottom-nav-h)`. Marketplace filters fold behind a Filters button; landing sections use compact icon-beside-text rows at ≤ 600 px. Check phone layouts with the 390 px iframe audit before pushing UI changes.
- **Install button:** any element with `data-install` opens the install flow (`installApp()` in `layout.js`): the browser's saved install prompt if available, otherwise step-by-step help (iPhone/others). Hidden inside the installed app. Also on the dashboard as a card on touch devices.
- **Icon files are versioned** (`icons/app-192-v2.png` …). When the logo changes, save new files with a new version and update `manifest.json` + the `apple-touch-icon` link; installed apps only pick up a changed URL. Keep `manifest.json` `id` as `/marketplace.html` so installs stay the same app.
- **App (PWA):** `manifest.json`, `sw.js` (offline fallback only, never caches data), `icons/`.
- **Migrations:** `supabase/schema.sql` first, then `supabase/migrations/*.sql` in date order. New DB changes go in a new dated file there.
- **Paths:** root-absolute (`/src/...`, `/marketplace.html`) in shared code and 404 so they work at any URL.
- **Design system:** tokens at the top of `main.css` (teal `--brand`, sunflower `--accent`, warm neutrals, Plus Jakarta Sans). Use existing classes (`.btn .btn-primary/.btn-secondary/...`, `.input`, `.select`, `.card`, `.badge-*`, `.state`, `.pcard`) — don't style pages one-off.
- **Honesty rule:** UI copy must match real features. Online payments, Google login, maps and email alerts don't exist — don't show them. Listings are visible only to signed-in students (RLS), so the landing page shows a sign-in prompt instead of listings when logged out.
- **Config:** Supabase URL + anon key live in `src/lib/supabase.js` (public-safe). No env vars in the frontend. GitHub Actions uses secrets `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
- **Roll numbers:** regex `^[0-9]{4}(CSE|CSDS|CSAI|CSIT)[0-9]{3}$`, enforced in the DB (`allowed_students`) and in `src/lib/supabase.js` (`ROLL_NO_PATTERN`). New course → update both.
- **Git:** repo at https://github.com/nitesh785/P2P_Campus_marketplace, default branch `main`. Branching and review rules are TBD by the team.

## Deploying

- **Automatic:** every push to `main` deploys to Cloudflare Pages (~1 min). Routine: `git pull` → commit → `git push`.
- **Check / undo:** Cloudflare → Workers & Pages → project → Deployments (status, Rollback).
- **Preview:** push any other branch to get a separate preview URL; merge to `main` to go live.
- **Database changes are manual:** new SQL in `supabase/schema.sql` must also be run in the Supabase SQL Editor.
- **Order for schema changes:** add the SQL to the *Migrations* section at the end of `schema.sql`, run it in Supabase **first**, then push the code that uses it. Pushing first breaks the live site (queries on a missing column fail).

## Current status

- **Phase:** 8, UI/UX redesign done (2026-09-26): landing page, auth split screens, design system, dashboard, profile, content pages, 404. All MVP features kept.
- **Done:** README rewritten for zero cost; PRD.md and TODO.md created; database chosen.
- **Done:** Git repo pushed to GitHub (`main`).
- **Done:** `schema.sql` run in Supabase (project `icphsbadppjnztfxxuui`); URL + publishable key in `src/lib/supabase.js`; register, login, forgot/reset password, logout and a guarded home page built.
- **Done:** Brevo SMTP connected; sign-up → confirmation email → login tested successfully (2026-09-26).
- **Done:** Phase 3 code: `sell.html` (form, native canvas compression to WebP/JPEG ≤ 200 KB, upload + cleanup on failure) and `product.html` (swipe gallery, details, WhatsApp button).
- **Done:** Phase 3 tested by owner (sell + view photos works).
- **Done:** Phase 4 code: marketplace grid on `index.html`, prefix full-text search (`calc` finds calculator), category/condition/price filters, 20 per page + Load more.
- **Done:** Phase 4 tested by owner (second user sees item, WhatsApp contact works).
- **Done:** Phase 5 code: `my-listings.html` (now replaced by `dashboard.html`) (edit, mark sold/available, delete with photo cleanup), edit mode in `sell.html`.
- **Done:** Phase 5 tested by owner; Phase 6 API security checks passed (logged-out reads/writes blocked, no secrets in repo); keep-alive workflow added.
- **Not done yet:** Cloudflare Pages deployment; mobile/keyboard check; demo data.
- **Next step:** owner makes team admins and tests chat, reports and the admin page on the live site.

## Gotchas (setup lessons)

- **`profiles.phone` is not selectable** (column grants). Get numbers only through `whatsappNumbers(ids)` in `layout.js` (RPC `whatsapp_numbers`), which returns opted-in students and yourself. Never add `phone` to a select.

- **Always name the join when embedding `profiles`:** `profiles:profiles!products_seller_id_fkey(name)`, not `profiles(name)`. Any new table linking two tables (like `saved_items`) makes a plain embed ambiguous and breaks every page that uses it ("more than one relationship was found").
- **After every schema change run `python tools/check_queries.py`** before pushing. It tests every page's query against the live database.

- **Start-up order in page scripts:** call the page's load functions at the *end* of the module. Calling them earlier throws a silent `ReferenceError` if they use a `const` helper defined further down (this blanked the admin stats once).
- **Git Bash heredocs** break on some Unicode characters (curly quotes, emoji). Write scripts to a file instead.

- **No `type="number"` inputs:** the mouse wheel changes their value while scrolling (a user saw 1250 become 1233). Use `type="text" inputmode="numeric" pattern="[0-9]*"` and strip non-digits on input.
- **Camera on phones:** a file input with `multiple` opens only the gallery on Android. `sell.html` has a separate `capture="environment"` input for the camera, shown only on touch screens.

- **`form.name` / `form.title`:** these return the form's own attributes, not inputs. Always use `form.elements.name`.
- **Headless Chrome screenshots:** virtual time doesn't advance CSS transitions, so menus/modals look half-faded in screenshots. Not a bug; check with `el.getAnimations()` (should be `running`).
- **Visual testing:** copy the site to a scratch folder, swap `src/lib/supabase.js` for a mock with sample data, serve with `python -m http.server`, screenshot with headless Chrome (phones via 390 px iframes).

- **Brevo `525 5.7.1 Unauthorized IP address`:** turn off Brevo → Security → Authorised IPs → "Block unknown IP addresses". Supabase sends from changing IPs, so allowlisting one IP doesn't work.
- **Failed sign-up leaves an unconfirmed user:** delete it in Supabase → Authentication → Users to free the roll number.
- **CSS `hidden`:** `display: grid/block` rules override the `hidden` attribute; `main.css` has a global `[hidden] { display: none !important; }`. Keep it.
- **Keep-alive workflow:** GitHub disables scheduled workflows after 60 days without repo activity; re-enable it in the Actions tab if that happens.
- **Mobile check without a phone:** headless Chrome on Windows won't go narrower than ~500 px; render pages inside 375 px `<iframe>`s to see the real phone layout.
- **Local testing:** Supabase Auth URL config has Site URL `http://127.0.0.1:5500` and redirect `http://127.0.0.1:5500/**` (VS Code Live Server). Update both when deploying.

## Change log

| Date | Change |
| --- | --- |
| 2026-09-25 | Created CLAUDE.md, README.md, PRD.md, TODO.md |
| 2026-09-26 | Initialised Git, added .gitignore, pushed to GitHub |
| 2026-09-26 | Switched verification to roll-number allowlist; frontend set to plain HTML/JS; README, PRD, TODO updated |
| 2026-09-26 | Roll-number format decided; added supabase/schema.sql and src/lib/supabase.js |
| 2026-09-26 | Schema run in Supabase; added auth pages (register, login, reset, home with logout) |
| 2026-09-26 | Brevo SMTP connected (fixed Unauthorized IP error); auth flow tested OK |
| 2026-09-26 | Phase 3: sell + product pages, motion rules from emil-design-eng/animate skills, storage read policy, fixed [hidden] CSS bug |
| 2026-09-26 | Phase 4: marketplace grid with search, filters, pagination on index.html |
| 2026-09-26 | Phase 5: My Listings page, edit mode on sell page |
| 2026-09-26 | Phase 6 security checks passed; keep-alive GitHub Action added |
| 2026-09-26 | Site deployed on Cloudflare Pages; mobile layout fixed (full-bleed pages, 2-column grid, wrapping header, filter overflow, 44 px tap targets) |
| 2026-09-26 | Full UI/UX redesign: design system, landing page (new home), marketplace moved to marketplace.html, dashboard replaces my-listings, profile, how-it-works/about/FAQ/privacy/terms/404, login returns to the requested page |
| 2026-09-27 | Fixed price inputs changing on mouse-wheel scroll (text + numeric keypad); added "Take photo" camera button on the sell page |
| 2026-09-27 | Added listing quantity (DB column via migration, sell form, cards, product page, dashboard "Sold one") |
| 2026-09-27 | Added suggestion.md (free-tier feature ideas, recommended next 3) |
| 2026-09-27 | Feature batch: saved items, reports + admin page, pickup location, negotiable/free filter, 60-day expiry + renew, wanted board, seller profiles, in-app chat, seller ratings, share, recently viewed, typo-tolerant search, installable app, dark mode |
| 2026-09-27 | Feature migration run in Supabase and verified; feature batch pushed. Analytics mention removed from privacy.html until enabled |
| 2026-09-27 | Cloudflare Web Analytics enabled (beacon on all pages), privacy.html updated |
| 2026-09-27 | Fixed ambiguous products→profiles joins after saved_items was added (broke admin and listing pages); added tools/check_queries.py |
| 2026-09-27 | WhatsApp privacy: opt-in switch (profile + sign-up), numbers hidden via column grants + RPC, Wanted chats in Messages |
| 2026-09-27 | Added official logo (header, footer, sign-in, About, icons) and ABESIT campus map picker for meeting spots |
| 2026-09-27 | Permanent Install app button (menu, footer, dashboard card) replaces the one-time browser pop-up; versioned icon files so installed apps pick up the new logo |
| 2026-09-27 | Mobile pass (emil-design-eng): bottom tab bar, compact landing sections, collapsible filters, sticky contact bar, fixed sign-in layout and admin overflow; website copy updated for chat, map, Wanted, ratings, privacy, install |
| 2026-09-27 | Footer redesigned: deep-teal brand block (logo, tagline, Sell + Install buttons), three link groups that adapt to login state, compact on phones |
| 2026-09-27 | Own listings hidden from marketplace, search, recently viewed, landing and related listings |
