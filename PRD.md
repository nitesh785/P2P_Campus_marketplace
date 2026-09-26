# Campus Marketplace: Product Requirements Document

| Field | Value |
| --- | --- |
| Version | v0.2 (Draft) |
| Date | 2026-09-26 |
| Project type | Academic, first-year engineering project |
| Stack | Plain HTML/CSS/JS · Supabase (Postgres, Auth, Storage) · Cloudflare Pages · Brevo SMTP · WhatsApp links |
| Running cost | **₹0 per month** |
| Related docs | [README.md](README.md) · [TODO.md](TODO.md) |

---

## 1. Summary

Campus Marketplace is a college-only web app where verified students list, find and sell second-hand items. It replaces unorganised WhatsApp and Telegram groups. The MVP ships 11 features (FR-01 to FR-11) and must cost **₹0** to build, host and run: free tiers only, no credit card anywhere.

---

## 2. Problem and goals

Students trade books, calculators, cycles and hostel items in chat groups. Listings get buried, can't be searched or filtered, and never get marked as sold. Only people in the same group ever see them.

### Goals

1. Give students one college-restricted place to list and find items.
2. Make any available item findable in under 30 seconds with search and filters.
3. Let sellers manage their listings: edit, delete, mark as sold.
4. Keep running cost at ₹0 with no credit card on any account.

### Non-goals for the MVP

- In-app chat, online payments, delivery, auctions
- Ratings, AI recommendations, fraud detection
- More than one college
- Native Android/iOS apps (a mobile-friendly website instead)

### Success metrics (first semester after launch)

| Metric | Target |
| --- | --- |
| Verified student accounts | 200 |
| Active listings | 150 |
| Listings marked as sold | 50 |
| Monthly running cost | ₹0 |
| Unauthorised edit attempts that succeed | 0 |

The targets are placeholders until the owner confirms the college's size.

---

## 3. Users and user stories

Every verified student is both a buyer and a seller. An admin role is planned after the MVP.

| ID | As a... | I want to... | So that... |
| --- | --- | --- | --- |
| US-01 | Student | sign up with my roll number | only my classmates can see my listings and phone number |
| US-02 | Buyer | search "calculator" and filter by price under ₹600 | I find an affordable item quickly |
| US-03 | Buyer | see photos, condition and seller name | I can judge the item before contacting anyone |
| US-04 | Buyer | tap one button to message the seller on WhatsApp | I don't have to copy phone numbers |
| US-05 | Seller | post an item with up to 3 photos in under 2 minutes | listing is quicker than posting in a group |
| US-06 | Seller | edit the price or delete a listing | my listings stay accurate |
| US-07 | Seller | mark an item as sold | buyers stop messaging me about it |
| US-08 | Admin (post-MVP) | remove reported listings and block users | the marketplace stays safe |

---

## 4. Functional requirements

All 11 requirements are in the MVP. P0 items are needed for a demo; P1 items can slip one week without blocking launch.

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-01 | Registration | P0 | Roll number, name, any email, phone and password required. The database rejects roll numbers not on the official list or already registered. A verification email arrives within 2 minutes. |
| FR-02 | Login, logout, reset | P0 | Unverified accounts can't log in. Sessions persist across page reloads. The reset-password email works. |
| FR-03 | Create listing | P0 | Title 3–100 chars, description up to 1,000, price ₹0–2,00,000, quantity 1–99, category, condition. Invalid input shows an inline error. |
| FR-04 | Image upload | P0 | 1–3 images per listing. Each is compressed in the browser to WebP, 1080 px max, 200 KB or less. |
| FR-05 | Browse | P0 | Newest-first grid, 20 cards per page, showing image, title, price, category and condition. |
| FR-06 | Search | P0 | Searching "calculator" returns every available listing with that word in the title or description. |
| FR-07 | Filters | P1 | Category, price range and condition can be combined with each other and with search. |
| FR-08 | Product details | P0 | Shows images, title, price, description, category, condition, seller name, date posted and status. |
| FR-09 | Contact seller | P0 | The button opens `wa.me/<number>` with a pre-filled message naming the item. |
| FR-10 | My Listings | P0 | Shows only the user's own listings, with Edit, Delete and Mark as Sold. |
| FR-11 | Mark as sold | P1 | The status changes to sold and the item disappears from browse and search within one refresh. |

**Categories:** Books, Electronics, Furniture, Stationery, Hostel Items, Cycles, Sports Equipment, Lab Equipment, Clothing, Accessories, Other.

**Conditions:** New, Like New, Good, Fair, Poor.

---

## 5. Non-functional requirements

| Area | Requirement |
| --- | --- |
| Cost | ₹0 per month. No service may require a credit card or billing account. |
| Security | Row Level Security on every table. Users can only change their own rows and storage folder. The `service_role` key never reaches the browser or Git. |
| Privacy | Phone numbers and listings are visible only to logged-in, verified students. The roll-number list is never readable from the app. |
| Performance | The marketplace page loads in under 3 s on 4G. Search returns in under 1 s. |
| Free-tier fit | Images 200 KB or less. Paginated queries. The database stays under 500 MB and storage under 1 GB. |
| Availability | A keep-alive job prevents Supabase's 7-day inactivity pause. |
| Usability | Mobile-first layout, working from 360 px wide screens. |
| Accessibility | Labelled form fields, alt text on images, keyboard-usable controls, WCAG AA contrast. |
| Maintainability | All SQL lives in one versioned `supabase/schema.sql` file. The code is modular (pages, components, lib). |

---

## 6. Technical approach

The browser talks directly to Supabase; there is no custom backend server. Row Level Security in Postgres enforces every permission. Full SQL, security policies and setup steps are in [README.md](README.md).

| Layer | Service | Free allowance |
| --- | --- | --- |
| Frontend | Plain HTML/CSS/JS, no build step | Open source |
| Database | Supabase Postgres | 500 MB |
| Auth | Supabase Auth | 50,000 monthly active users |
| Image storage | Supabase Storage | 1 GB storage, 5 GB egress/month |
| Verification emails | Brevo SMTP | About 300 emails/day |
| Hosting | Cloudflare Pages | Unlimited static bandwidth |
| Keep-alive | GitHub Actions | Free |
| Contact | WhatsApp `wa.me` links | Free |

**Data model:** `allowed_students` (official roll-number list) → `profiles` (1 per user) → `products` (many per user) → `categories` (11 rows). Images live in the `product-images` bucket at `<user_id>/<product_id>/<n>.webp`; their paths are stored in `products.image_paths`.

**Capacity:** with 3 images at 200 KB each, about 1,600 listings fit in 1 GB of storage.

**Why not Firebase:** since 3 February 2026, Cloud Storage for Firebase needs the Blaze plan, which requires a billing account and credit card. That breaks the zero-cost rule.

---

## 7. Risks and open questions

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Supabase pauses the project after 7 idle days | Site goes down during holidays | GitHub Actions ping twice a week. Restore from the dashboard if it pauses. |
| No official college email domain | Can't verify students by email | Roll-number allowlist uploaded by admins; one account per roll number. |
| Someone registers with a classmate's roll number | Real student is locked out | Admin deletes the fake account, which frees the roll number. |
| Official roll-number list unavailable | Nobody can sign up | Team collects lists from class representatives. |
| Brevo emails land in spam | Students can't verify | Test with Gmail/Outlook in week 1. Fall back to Resend or Gmail SMTP. |
| Storage fills up (1 GB) | New uploads fail | Compression, delete images with their listing, auto-remove sold listings after 60 days |
| Phone numbers exposed | Privacy complaint | Visible only to verified, logged-in students. Consent checkbox at sign-up. |
| Scam or inappropriate listings | Loss of trust | Report button and admin role early in v1.1. Meanwhile, the team removes listings manually through Supabase. |
| Free-tier terms change | Cost appears | Re-check the free tiers each semester. The stack is portable to Appwrite or Neon. |

### Open questions for the owner

- [x] College email domain: none available, so we verify by roll-number allowlist (decided 2026-09-26).
- [x] Who can join: students only (decided 2026-09-26).
- [x] Frontend: plain HTML/CSS/JS (decided 2026-09-26).
- [ ] Roll-number format, and where the official list comes from
- [ ] Is college permission needed to run a student marketplace?
- [ ] What is the demo or submission deadline?

---

## 8. Release plan

| Phase | Scope | Exit criteria |
| --- | --- | --- |
| 1. Setup | Accounts, repo, schema, security policies | Schema and RLS run cleanly in Supabase |
| 2. Auth | FR-01, FR-02 | A listed roll number registers, verifies and logs in; unlisted or reused roll numbers are rejected |
| 3. Listings | FR-03, FR-04, FR-08 | A listing with 3 compressed images is created and viewed |
| 4. Marketplace | FR-05, FR-06, FR-07 | Search and filters return correct results |
| 5. Dashboard | FR-09, FR-10, FR-11 | Edit, delete, sold and WhatsApp all work |
| 6. Test and deploy | Test cases in the README, Cloudflare Pages, keep-alive | All security tests pass on the live URL |

The detailed task checklist is in [TODO.md](TODO.md).
