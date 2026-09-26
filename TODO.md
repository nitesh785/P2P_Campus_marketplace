# Campus Marketplace: TODO Checklist

Tick items as you finish them (`- [x]`). Items marked **(you)** need the project owner; everything else can be done by the dev team or Claude.

## Phase 0: Decisions and accounts (you)

- [x] **(you)** College email domain: none available; using a roll-number allowlist instead
- [x] **(you)** Pick the frontend: plain HTML/CSS/JS
- [x] **(you)** Who can join: students only
- [ ] **(you)** Get the official roll-number list as a CSV (`roll_no,full_name`)
- [x] **(you)** Roll-number format: `2026CSE102` (courses CSE, CSDS, CSAI, CSIT)
- [ ] **(you)** Add team members' names and roles to CLAUDE.md
- [ ] **(you)** Invite team admins to the Supabase project (Organization → Team)
- [ ] **(you)** Confirm the demo or submission deadline
- [ ] **(you)** Check whether college permission is needed
- [x] **(you)** Create a GitHub account and repo
- [x] **(you)** Create a Supabase account (free plan, region Mumbai `ap-south-1`)
- [x] **(you)** Create a Brevo account and generate SMTP credentials
- [x] **(you)** Create a Cloudflare account (for Pages hosting)
- [x] **(you)** Install Git, Node.js and VS Code

## Phase 1: Project setup

- [x] `git init`, add `.gitignore` (includes `.env`), push to GitHub
- [x] Write `supabase/schema.sql` (tables, indexes, categories, sign-up trigger, RLS, storage bucket and policies)
- [ ] Import the roll-number CSV into `allowed_students`
- [x] **(you)** Run `supabase/schema.sql` in the Supabase SQL Editor (it also creates the `product-images` bucket)
- [x] Add `src/lib/supabase.js` (supabase-js from CDN, roll-number pattern)
- [x] Put the Supabase project URL and publishable key in `src/lib/supabase.js`

## Phase 2: Authentication (FR-01, FR-02)

- [x] Enable "Confirm email" in Supabase Auth
- [x] Connect Brevo SMTP in Supabase Auth settings
- [x] Set the Site URL and redirect URLs (local: `http://127.0.0.1:5500`)
- [x] Registration page (roll number, name, email, phone, password, confirm, consent checkbox)
- [x] Friendly error for "roll number not found or already registered"
- [x] Login page and logout button
- [x] Forgot/reset password flow
- [x] Route guard: redirect logged-out users to login
- [x] Test: listed roll number accepted, unlisted and reused roll numbers rejected, unverified login blocked

## Phase 3: Listings (FR-03, FR-04, FR-08)

- [ ] **(you)** Run the new `read own images` storage policy in Supabase
- [x] Create Listing form with validation (`sell.html`)
- [x] Browser image compression (native canvas, WebP/JPEG, 1080 px, 200 KB or less; no library)
- [x] Upload 1–3 images to `<user_id>/<product_id>/<n>.webp`, clean up on failure
- [x] Insert the product row with `image_paths`
- [x] Product details page with a swipe gallery and WhatsApp button (`product.html`)
- [x] **(you)** Test: sell an item with 3 photos, view it

## Phase 4: Marketplace (FR-05, FR-06, FR-07)

- [x] Product card component
- [x] Grid with pagination (20 per page, "Load more")
- [x] Keyword search (full-text prefix search)
- [x] Category, price range and condition filters, combinable with search
- [x] Empty state
- [x] Lazy-load images
- [x] **(you)** Test as a second user: see the item, open it, WhatsApp button

## Phase 5: Seller dashboard and contact (FR-09, FR-10, FR-11)

- [x] My Listings page (now part of `dashboard.html`)
- [x] Edit listing, including replacing images (`sell.html?id=`)
- [x] Delete listing, which also deletes its storage images
- [x] Mark as sold / mark as available again
- [x] "Contact Seller on WhatsApp" button with a pre-filled message
- [ ] **(you)** Test: edit (with and without new photos), mark sold (disappears from marketplace), mark available, delete

## Phase 6: Testing

- [ ] Run every test case in the README's Testing Strategy section
- [x] RLS test: user B cannot edit or delete user A's listing (owner tested)
- [x] Logged-out visitor cannot read products, profiles or the roll list; cannot insert (checked via API)
- [x] No secret keys in the repo; `.env` not tracked
- [ ] Mobile test at 360 px wide; keyboard and alt-text check
- [ ] Try it with 3–5 classmates and fix feedback

## Phase 7: Deployment

- [x] Push to GitHub
- [ ] **(you)** Connect the repo to Cloudflare Pages (no build command, output `/`)
- [ ] **(you)** Update the Supabase Site URL + redirect URLs to the live `*.pages.dev` URL
- [x] Add `.github/workflows/keep-alive.yml` (uses the public key, no secrets needed)
- [ ] **(you)** Run the keep-alive workflow once manually (GitHub → Actions → Run workflow)
- [ ] Final end-to-end test on the live site
- [ ] Prepare the demo: seed 10–15 realistic listings, screenshots, slides

## Phase 8: UI/UX redesign

- [x] Design system (`main.css` tokens + components), Plus Jakarta Sans, Lucide icon subset
- [x] Landing page as new home; marketplace moved to `marketplace.html`
- [x] Split-screen login / sign-up / reset
- [x] Dashboard (stats, quick actions, my listings), profile (edit name/phone, change password)
- [x] How it works, About, FAQ, Privacy, Terms, 404
- [x] Skeleton loaders, empty and error states, toasts, delete confirmation dialog
- [ ] **(you)** Test the redesigned site end to end on desktop and phone

## Phase 9: Feedback fixes

- [x] Price inputs no longer change on mouse-wheel scroll
- [x] "Take photo" camera button on phones
- [x] Listing quantity (sell form, cards, product page, dashboard "Sold one")
- [ ] **(you)** Run the quantity migration in Supabase (end of `supabase/schema.sql`)

## Post-MVP backlog

- [ ] Report listing + admin role
- [ ] Wishlist
- [ ] Auto-delete sold listings older than 60 days
- [ ] Hostel/location filter
- [ ] PWA (installable app)
- [ ] Supabase Realtime chat
