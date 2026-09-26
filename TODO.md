# Campus Marketplace: TODO Checklist

Tick items as you finish them (`- [x]`). Items marked **(you)** need the project owner; everything else can be done by the dev team or Claude.

## Phase 0: Decisions and accounts (you)

- [ ] **(you)** Confirm the college email domain (e.g. `@abc.edu.in`)
- [ ] **(you)** Pick the frontend: plain HTML/JS or React + Vite
- [ ] **(you)** Confirm the demo or submission deadline
- [ ] **(you)** Check whether college permission is needed
- [ ] **(you)** Create a GitHub account and an empty repo `campus-marketplace`
- [ ] **(you)** Create a Supabase account (sign in with GitHub, free plan, region Mumbai `ap-south-1`)
- [ ] **(you)** Create a Brevo account and generate SMTP credentials
- [ ] **(you)** Create a Cloudflare account (for Pages hosting)
- [ ] **(you)** Install Git, Node.js LTS and VS Code

## Phase 1: Project setup

- [ ] `git init`, add `.gitignore` (include `.env`, `node_modules/`, `dist/`)
- [ ] Create `.env.example` with placeholder values; keep the real `.env` out of Git
- [ ] Scaffold the folder structure (`src/lib`, `src/pages`, `src/components`, `src/styles`, `supabase/`)
- [ ] Write `supabase/schema.sql` (tables, enums, indexes, categories seed)
- [ ] Add the Row Level Security policies and the college-domain trigger to `schema.sql`
- [ ] Run `schema.sql` in the Supabase SQL Editor
- [ ] Create the public `product-images` bucket (1 MB limit, webp/jpeg/png) and its storage policies
- [ ] Add `src/lib/supabase.js` (`createClient` with URL + anon key)

## Phase 2: Authentication (FR-01, FR-02)

- [ ] Enable "Confirm email" in Supabase Auth
- [ ] Connect Brevo SMTP in Supabase Auth settings
- [ ] Set the Site URL and redirect URLs
- [ ] Registration page (name, email, phone, password, confirm, consent checkbox)
- [ ] Create a `profiles` row after sign-up
- [ ] Login page and logout button
- [ ] Forgot/reset password flow
- [ ] Route guard: redirect logged-out users to login
- [ ] Test: college email accepted, `@gmail.com` rejected, unverified login blocked

## Phase 3: Listings (FR-03, FR-04, FR-08)

- [ ] Create Listing form with validation
- [ ] Browser image compression (`browser-image-compression`, WebP, 1080 px, 200 KB or less)
- [ ] Upload 1–3 images to `<user_id>/<product_id>/<n>.webp`
- [ ] Insert the product row with `image_paths`
- [ ] Product details page with an image carousel

## Phase 4: Marketplace (FR-05, FR-06, FR-07)

- [ ] Product card component
- [ ] Grid with pagination (20 per page, "Load more")
- [ ] Keyword search (full-text `textSearch`)
- [ ] Category, price range and condition filters, combinable with search
- [ ] Empty-state and loading states
- [ ] Lazy-load images

## Phase 5: Seller dashboard and contact (FR-09, FR-10, FR-11)

- [ ] My Listings page
- [ ] Edit listing (including replacing images)
- [ ] Delete listing, which also deletes its storage images
- [ ] Mark as sold
- [ ] "Contact Seller on WhatsApp" button with a pre-filled message

## Phase 6: Testing

- [ ] Run every test case in the README's Testing Strategy section
- [ ] RLS test: user B cannot edit, delete or upload into user A's data
- [ ] Logged-out visitor cannot read products
- [ ] Search the built bundle to confirm no `service_role` key is present
- [ ] Mobile test at 360 px wide; keyboard and alt-text check
- [ ] Try it with 3–5 classmates and fix feedback

## Phase 7: Deployment

- [ ] Push to GitHub
- [ ] Connect the repo to Cloudflare Pages and add environment variables
- [ ] Update the Supabase Site URL to the live `*.pages.dev` URL
- [ ] Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` as GitHub Actions secrets
- [ ] Add `.github/workflows/keep-alive.yml` and run it once manually
- [ ] Final end-to-end test on the live site
- [ ] Prepare the demo: seed 10–15 realistic listings, screenshots, slides

## Post-MVP backlog

- [ ] Report listing + admin role
- [ ] Wishlist
- [ ] Auto-delete sold listings older than 60 days
- [ ] Hostel/location filter
- [ ] PWA (installable app)
- [ ] Supabase Realtime chat
