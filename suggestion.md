# Feature Suggestions (Zero Cost)

> **Status (27 Sep 2026):** everything below has been built except #15 (email alerts), which was skipped on purpose. Listing expiry (#12) uses an `expires_at` date instead of a scheduled job, and photos of old listings are not auto-deleted. Visitor analytics (#14) is a toggle in Cloudflare.

Ideas for what to build next. Every idea stays within the free tiers we already use (Supabase, Cloudflare Pages, Brevo, GitHub Actions) and needs no credit card. Each one lists its effort, what it uses from the free limits, and whether it needs a database change.

**Effort:** S = a few hours · M = one to two days · L = a week or more (for a first-year team)

---

## Recommended next 3

1. **Report listing + admin moderation.** Right now nobody can flag a scam or an inappropriate post from inside the app. This is the biggest trust gap.
2. **Saved items (wishlist).** Cheap to build, and gives students a reason to come back.
3. **Pickup location on listings.** Students already arrange meetups by hostel or block; making it a field and a filter saves a round of WhatsApp messages.

---

## At a glance

| # | Feature | Why it helps | Effort | Free-tier impact | DB change |
|---|---|---|---|---|---|
| 1 | Report listing + admin moderation | Trust and safety | M | Tiny (a few rows) | Yes |
| 2 | Saved items (wishlist) | Brings users back | S | Tiny | Yes |
| 3 | Pickup location + filter | Faster meetups | S | None | Yes |
| 4 | "Wanted" board | Buyers post what they need | M | Tiny | Yes |
| 5 | Seller profile page | See everything one student sells | S | None | No |
| 6 | Share button | Spread listings to class groups | S | None | No |
| 7 | Recently viewed | Easy to find items again | S | None | No |
| 8 | "Negotiable" tag + "Free items" filter | Clearer pricing | S | None | Yes |
| 9 | Typo-tolerant search | "calcualtor" still works | S | None | No |
| 10 | Install as an app (PWA) | Home-screen icon, app feel | S | None | No |
| 11 | Dark mode | Comfort at night | S | None | No |
| 12 | Auto-expire old listings | Keeps the marketplace fresh, saves storage | M | Free Supabase Cron | Yes |
| 13 | In-app admin dashboard | Admins don't need the Supabase dashboard | M | Tiny | Yes |
| 14 | Visitor analytics | Know if people use it | S | Cloudflare Web Analytics (free) | No |
| 15 | Email alerts for new items in a category | Buyers don't miss items | M | Brevo 300 emails/day | Yes |
| 16 | In-app chat | Phone numbers stay private | L | Supabase Realtime (free tier) | Yes |
| 17 | Seller ratings | Reputation | L | Tiny | Yes |

---

## Quick wins (S)

### 2. Saved items (wishlist)
- A heart button on cards and the item page, and a "Saved" tab on the dashboard.
- **Build:** a `saved_items (user_id, product_id)` table. Row Level Security lets each user see and change only their own rows.
- Sold or deleted items drop out automatically if the foreign key uses `on delete cascade`.

### 3. Pickup location + filter
- A "Pickup at" dropdown on the sell form (for example Hostel A, Hostel B, Library, Main gate, Academic block), shown on cards and filterable in the marketplace.
- **Build:** a `location` column with a fixed list of options, like `condition`. The team decides the list.

### 5. Seller profile page
- `seller.html?id=…` shows the seller's name and all their available listings.
- **Build:** no database change. Listings and names are already readable by signed-in students. Link to it from the seller card on the item page.

### 6. Share button
- "Share" on the item page opens the phone's native share sheet (WhatsApp, Telegram, copy link).
- **Build:** the browser's built-in Web Share API, with "copy link" as a fallback on computers. No library needed.
- Note: people who open the link must log in to see the item, which is on purpose.

### 7. Recently viewed
- A "Recently viewed" row on the marketplace.
- **Build:** store the last 10 item IDs in the browser's local storage. No database use at all.

### 8. "Negotiable" tag and "Free items" filter
- A checkbox on the sell form and a small tag on cards. Price 0 items get a "Free" filter chip.
- **Build:** a `negotiable boolean default false` column. The free filter needs no change (`price = 0`).

### 9. Typo-tolerant search
- "calcualtor" or "enginering" still finds results.
- **Build:** the `pg_trgm` extension is already enabled with an index on titles. When the normal search finds nothing, fall back to a similarity search.

### 10. Install as an app (PWA)
- "Add to Home screen" gives an app icon and a full-screen, app-like experience on Android and iPhone.
- **Build:** a `manifest.json` and app icons. A small service worker can cache the page shell for faster loads.

### 11. Dark mode
- Follows the phone's setting automatically.
- **Build:** all colours are already tokens at the top of `main.css`, so it's one block of overrides inside `@media (prefers-color-scheme: dark)`.

### 14. Visitor analytics
- Page views and popular pages, with no cookies and no tracking banner needed.
- **Build:** Cloudflare Web Analytics is free and one toggle in the Pages project.

---

## Trust and safety (M)

### 1. Report listing + admin moderation
- A "Report" button on each item with reasons (fraud, wrong info, duplicate, inappropriate, other).
- Admins see open reports and can hide the listing or block the user.
- **Build:**
  - A `reports` table (who reported, which listing, reason, status).
  - An `is_admin` flag on `profiles`, plus Row Level Security policies that let admins read reports and update any listing.
  - Admins could start by using the Supabase dashboard, then move to #13.
- Add a limit so one student can report a listing only once.

### 12. Auto-expire old listings
- Listings older than 60 days get marked "expired" and leave the marketplace, and the seller can relist them with one tap. Sold listings older than 90 days are deleted along with their photos.
- **Build:**
  - Supabase Cron (`pg_cron`), which is included in the free plan, runs a nightly SQL job to mark listings expired.
  - Photo deletion should go through the Storage API, for example a small Supabase Edge Function (500,000 free calls a month) triggered by the same cron job.
- This protects the 1 GB storage limit as the site grows.

### 13. In-app admin dashboard
- An `admin.html` page, visible only to admins: open reports, recent listings, counts of users and listings, and a "remove listing" button.
- **Build:** depends on #1. Counts come from small SQL views protected by Row Level Security.

---

## Engagement (M)

### 4. "Wanted" board
- Students post what they're looking for ("Engineering Graphics textbook, 1st sem") and sellers can respond on WhatsApp.
- **Build:** a `wanted_posts` table (title, description, max budget, category, created_by), plus a simple list page that reuses the existing card styles.
- Useful at semester start, when many students need the same books.

### 15. Email alerts for a category
- "Email me when a new Cycle is listed."
- **Build:** a `subscriptions` table, and an Edge Function that runs when a listing is created and sends through Brevo.
- **Stay within the limit:** Brevo's free plan allows 300 emails a day, and sign-up and password emails share that allowance. Send at most one digest email per student per day instead of one email per new listing.

---

## Bigger projects (L)

### 16. In-app chat
- Buyers message sellers inside the site, so phone numbers no longer have to be shared.
- **Build:** `conversations` and `messages` tables with Row Level Security (only the two people in a conversation can read it), and Supabase Realtime for live updates.
- **Free limits:** 200 users connected at the same time and 2 million messages a month, which is plenty for one campus.
- **Trade-off:** it's the largest feature here. WhatsApp already works, so do this only if students ask for privacy.

### 17. Seller ratings
- Buyers rate a seller after a deal.
- **Hard part:** the site doesn't know who actually bought an item, so ratings are easy to fake. A workable version: when marking an item sold, the seller picks the buyer from students who contacted them, and only that buyer can rate. This needs chat (#16) or a "request to buy" button first.

---

## Free-tier budget (what we have)

| Service | Free limit | Used today by |
|---|---|---|
| Supabase database | 500 MB | Profiles, listings, categories |
| Supabase storage | 1 GB files, 5 GB downloads/month | Listing photos (~200 KB each, about 1,600 listings with 3 photos) |
| Supabase Auth | 50,000 monthly active users | Login |
| Supabase Edge Functions | 500,000 calls/month | Nothing yet |
| Supabase Realtime | 200 concurrent connections, 2 M messages/month | Nothing yet |
| Supabase Cron | Included | Nothing yet |
| Brevo | 300 emails/day | Sign-up confirmation, password reset |
| Cloudflare Pages | Unlimited static bandwidth, 500 builds/month | Hosting |
| GitHub Actions | Free for public repos; 2,000 min/month for private | Keep-alive ping |

Before building, re-check the current limits on each provider's pricing page. Free tiers change.

---

## Avoid (costs money or breaks a rule)

| Idea | Why not |
|---|---|
| Online payments (Razorpay, Stripe) | Transaction fees, and business verification needed |
| SMS / OTP login | SMS gateways charge per message |
| Google Maps for pickup spots | The Maps API needs a billing account; use the fixed location list (#3) |
| Custom domain (campusmarket.in) | A domain costs money every year; the free `*.pages.dev` address works |
| AI features through paid APIs | Pay per use; typo-tolerant search (#9) covers the main search need for free |
| Firebase Storage | Needs the Blaze billing plan since February 2026 |
