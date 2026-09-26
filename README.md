# 🎓 Campus Marketplace

> A college-only marketplace where students buy, sell, and find second-hand items on their own campus. It is built entirely on free-tier services and costs **₹0 / $0** to build, host, and run.

![Cost](https://img.shields.io/badge/running%20cost-%E2%82%B90-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-MVP%20in%20progress-orange)

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Zero-Cost Principle](#-zero-cost-principle)
3. [Problem Statement](#-problem-statement)
4. [Objectives](#-objectives)
5. [Target Users](#-target-users)
6. [MVP Scope](#-mvp-scope)
7. [Technology Stack (100% Free)](#️-technology-stack-100-free)
8. [Database Choice: Why Supabase (PostgreSQL)](#️-database-choice-why-supabase-postgresql)
9. [System Architecture](#️-system-architecture)
10. [Database Design](#-database-design)
11. [Security](#-security)
12. [Functional Requirements](#-functional-requirements)
13. [Main Application Screens](#-main-application-screens)
14. [Staying Inside the Free Tier](#-staying-inside-the-free-tier)
15. [Getting Started (Local Setup)](#-getting-started-local-setup)
16. [Deployment](#-deployment)
17. [Testing Strategy](#-testing-strategy)
18. [Development Plan](#-development-plan)
19. [Out of Scope for MVP](#-out-of-scope-for-mvp)
20. [Future Scope (Free Options Only)](#-future-scope-free-options-only)
21. [Academic Concepts Demonstrated](#-academic-concepts-demonstrated)

---

## 📋 Project Overview

**Campus Marketplace** is a web platform where students of one college buy and sell items among themselves: books, calculators, electronics, furniture, hostel accessories, bicycles, lab equipment, and more.

Today this trading happens in WhatsApp/Telegram groups, where listings are hard to search, get buried under new messages, and can't be filtered or managed. Campus Marketplace replaces these groups with one organised place where **verified students** can:

* post listings with photos,
* browse, search, and filter products,
* contact sellers directly on WhatsApp,
* manage their own listings and mark items as sold.

The first release is a small, achievable **Minimum Viable Product (MVP)**. It leaves out real-time chat, payments, and delivery on purpose.

---

## 💸 Zero-Cost Principle

This project must cost **nothing** to build, host, and run. Every technical decision follows these rules:

| Rule | What it means in practice |
| ---- | ------------------------- |
| **No credit card** | No service may require a billing account or card on file, even if its usage would be "free". |
| **Free tier only** | Every service is used within its permanent free tier, not a time-limited trial. |
| **Open-source tooling** | Editors and libraries are free and open source (VS Code, Git, supabase-js, etc.). |
| **No paid domain** | We use the free subdomain from the hosting provider (e.g. `campus-market.pages.dev`). |
| **No transaction fees** | Payments happen offline (cash/UPI between students), not through the app. |
| **Graceful limits** | The app compresses images, paginates queries, and cleans up old data so it stays inside free quotas. |

> ⚠️ **Why the original Firebase plan was changed:** Since **3 February 2026**, **Cloud Storage for Firebase needs the pay-as-you-go Blaze plan**, which requires a linked billing account and credit card. On the free Spark plan, storage requests fail with `402/403` errors. Image uploads are a core feature, so an all-Firebase stack is no longer zero-cost. The stack below replaces it.

---

## 📌 Problem Statement

Students lack a dedicated, organised platform for buying and selling items within their campus. Existing WhatsApp/Telegram groups have these problems:

* Products are hard to search.
* Old listings get buried in conversation.
* There are no categories.
* There is no price filtering.
* Sellers cannot edit or remove their posts properly.
* There is no way to mark an item as sold.
* Listings only reach people in the same group.

We therefore need a **college-restricted digital marketplace** that organises student listings and makes campus buying and selling simple.

---

## 🎯 Objectives

* College-restricted registration: only roll numbers on the official student list can sign up.
* Create, edit, and delete product listings with 1–3 images.
* Browse listings, search them by keyword, and filter by category, price, and condition.
* Mark listings as sold.
* Let buyers contact sellers with a WhatsApp link.
* Run the whole system at **zero cost**.

---

## 👥 Target Users

### Students (primary users)

Every student can be both a buyer and a seller.

| As a **Buyer** | As a **Seller** |
| -------------- | --------------- |
| Browse products | Create listings |
| Search & filter | Upload 1–3 images |
| View product details | Set price & condition |
| Contact seller on WhatsApp | Edit / delete listings |
| | Mark products as sold |

### Administrator (future version)

Manage users, review reported listings, remove inappropriate content, block users, manage categories, and monitor activity.

---

## 🚀 MVP Scope

| Module | Features |
| ------ | -------- |
| **Authentication** | Register, email verification, login, logout, forgot password, roll-number allowlist |
| **Listings** | Title, description, price, category, condition, 1–3 images, seller, status, date posted |
| **Marketplace** | Browse, keyword search, filter by category / price / condition, product details |
| **My Listings** | View, edit, delete, mark as sold |
| **Contact** | "Contact Seller" button that opens WhatsApp via `https://wa.me/<number>` |

### User Flows

```text
BUYER                                   SELLER
Register / Login                        Register / Login
      ↓                                       ↓
Marketplace                             Create Listing
      ↓                                       ↓
Search / Filter                         Upload Images + Details
      ↓                                       ↓
Product Details                         Publish Listing
      ↓                                       ↓
Contact Seller (WhatsApp)               Receive Buyer Contact
      ↓                                       ↓
Meet on campus & pay (cash / UPI)       Mark Product as Sold
```

---

## 🛠️ Technology Stack (100% Free)

| Layer | Technology | Free-tier allowance | Credit card? |
| ----- | ---------- | ------------------- | ------------ |
| **Frontend** | HTML5, CSS3, plain JavaScript (no build step; libraries from the jsDelivr CDN) | Open source | ❌ No |
| **Styling** (optional) | Tailwind CSS / Pico.css | Open source | ❌ No |
| **Database** | **Supabase PostgreSQL** | 500 MB database | ❌ No |
| **Authentication** | **Supabase Auth** | 50,000 monthly active users | ❌ No |
| **Image Storage** | **Supabase Storage** | 1 GB files, 5 GB egress/month | ❌ No |
| **Verification Emails** | **Brevo** SMTP (or Resend / Gmail SMTP) | Brevo: ~300 emails/day | ❌ No |
| **Hosting** | **Cloudflare Pages** (alt: GitHub Pages / Netlify / Vercel) | Unlimited static bandwidth | ❌ No |
| **Keep-Alive / CI** | **GitHub Actions** | Free for public repos | ❌ No |
| **Communication** | WhatsApp `wa.me` links | Free | ❌ No |
| **Version Control** | Git + GitHub | Free | ❌ No |

**Total monthly cost: ₹0**

> 💡 **Why custom SMTP?** Supabase's built-in email sender is only for testing. It is heavily rate-limited and delivers only to members of your Supabase team. To send real verification emails to students, connect a free SMTP provider such as Brevo in *Supabase → Authentication → SMTP Settings*.

---

## 🗄️ Database Choice: Why Supabase (PostgreSQL)

### ✅ Recommendation: **Supabase** (managed PostgreSQL + Auth + Storage)

Supabase is the best fit for a zero-cost student project because it provides **database, authentication, and file storage in one free plan with no credit card**. It replaces all three Firebase services.

| Requirement | Supabase (PostgreSQL) | Firebase (Firestore) |
| ----------- | --------------------- | -------------------- |
| Free image storage without a card | ✅ 1 GB included | ❌ Needs Blaze plan (card) since Feb 2026 |
| Keyword search ("calculator") | ✅ Built-in full-text search + `pg_trgm` fuzzy search | ⚠️ No full-text search; needs workarounds or a paid add-on |
| Filter category + price range + condition together | ✅ Plain SQL `WHERE` | ⚠️ Needs composite indexes; limited query shapes |
| Data model (users ↔ products ↔ categories) | ✅ Relational with foreign keys | ⚠️ Denormalised documents |
| "Only edit your own listing" | ✅ Row Level Security (RLS) policies | ✅ Security Rules |
| Academic value (DBMS course) | ✅ Real SQL, joins, constraints, normalisation | ⚠️ NoSQL only |
| Free auth emails | ⚠️ Needs free custom SMTP (Brevo) | ✅ Built in |
| Always on | ⚠️ Free project pauses after 7 days without activity | ✅ Yes |

**Handling the two Supabase caveats at zero cost:**

1. **Auto-pause after 1 week of inactivity**: a scheduled GitHub Actions workflow queries the database twice a week so the project never counts as inactive (see [Staying Inside the Free Tier](#-staying-inside-the-free-tier)). A paused project can also be restored from the dashboard with no data loss.
2. **Email sending**: use Brevo's free SMTP (no card needed).

### Alternatives considered

| Option | Verdict |
| ------ | ------- |
| **Firebase Spark (Auth + Firestore) + Cloudinary free tier for images** | Good zero-cost fallback if the team prefers NoSQL. Search stays weak. |
| **Appwrite Cloud (free)** | Viable all-in-one alternative with a smaller community. |
| **Neon / Turso (DB only)** | Excellent free databases, but auth and storage would need separate services, which adds complexity. |
| **MongoDB Atlas M0** | Free 512 MB, but needs your own backend server for auth, storage, and hosting. Too much for an MVP. |
| **Self-hosted MySQL on a laptop** | Free, but not reachable by other students once deployed. |

---

## 🏗️ System Architecture

```text
                        ┌──────────────────┐
                        │     Student      │
                        │ (browser/mobile) │
                        └────────┬─────────┘
                                 │ HTTPS
                                 ▼
                ┌──────────────────────────────────┐
                │  Static Web App (HTML/CSS/JS)    │
                │  hosted on Cloudflare Pages      │
                │  uses supabase-js client         │
                └───────────────┬──────────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
 ┌─────────────────┐  ┌───────────────────┐  ┌─────────────────┐
 │  Supabase Auth  │  │ Supabase Postgres │  │ Supabase Storage│
 │ (roll-no check) │  │  profiles,        │  │ product-images  │
 │                 │  │  products,        │  │ bucket          │
 │  Brevo SMTP ────┤  │  categories + RLS │  │ (compressed)    │
 └─────────────────┘  └─────────┬─────────┘  └─────────────────┘
                                │
                                ▼
                     "Contact Seller" button
                                │
                                ▼
                      WhatsApp (wa.me link)
```

The app needs **no custom backend server**. The browser talks to Supabase directly, and **Row Level Security** in the database enforces every permission.

---

## 🗃️ Database Design

### Entity Relationship

```text
auth.users (managed by Supabase)
     │ 1
     │
     │ 1
 profiles ───────────────┐
     │ 1                 │
     │                   │
     │ N                 │
 products ── N : 1 ── categories
     │ 1
     │
     │ 1..3
 product images (Supabase Storage, paths stored in products.image_paths)
```

### SQL Schema

The complete, runnable version lives in [`supabase/schema.sql`](supabase/schema.sql) and is the source of truth. Run it in **Supabase → SQL Editor**. Key parts:

```sql
-- Enable fuzzy search
create extension if not exists pg_trgm;

-- 0. Official student list (roll numbers), uploaded by admins as CSV
--    in Supabase → Table Editor → allowed_students → Import data from CSV
create table public.allowed_students (
  roll_no     text primary key check (roll_no ~ '^[0-9]{4}(CSE|CSDS|CSAI|CSIT)[0-9]{3}$'),  -- e.g. 2026CSE102
  full_name   text,
  claimed_by  uuid unique references auth.users(id) on delete set null
);

-- 1. Profiles (one row per registered student, created by the sign-up trigger)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  roll_no     text not null unique references public.allowed_students(roll_no),
  name        text not null check (char_length(name) between 2 and 60),
  phone       text not null check (phone ~ '^[0-9]{10,13}$'),
  created_at  timestamptz not null default now()
);

-- 2. Categories
create table public.categories (
  id    smallserial primary key,
  name  text not null unique,
  icon  text
);

insert into public.categories (name, icon) values
  ('Books','📚'), ('Electronics','💻'), ('Furniture','🪑'),
  ('Stationery','✏️'), ('Hostel Items','🏠'), ('Cycles','🚲'),
  ('Sports Equipment','🏏'), ('Lab Equipment','🔬'),
  ('Clothing','👕'), ('Accessories','🎒'), ('Other','📦');

-- 3. Products
create type product_condition as enum ('New', 'Like New', 'Good', 'Fair', 'Poor');
create type product_status    as enum ('available', 'sold');

create table public.products (
  id           uuid primary key default gen_random_uuid(),
  seller_id    uuid not null references public.profiles(id) on delete cascade,
  title        text not null check (char_length(title) between 3 and 100),
  description  text not null check (char_length(description) <= 1000),
  price        integer not null check (price >= 0 and price <= 200000),
  category_id  smallint not null references public.categories(id),
  condition    product_condition not null,
  image_paths  text[] not null default '{}'
               check (array_length(image_paths, 1) between 1 and 3),
  status       product_status not null default 'available',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- full-text search column, maintained automatically
  search       tsvector generated always as (
                 to_tsvector('english', title || ' ' || description)
               ) stored
);

-- Indexes for fast browsing, filtering and search
create index products_status_created_idx on public.products (status, created_at desc);
create index products_category_idx       on public.products (category_id);
create index products_price_idx          on public.products (price);
create index products_search_idx         on public.products using gin (search);
create index products_title_trgm_idx     on public.products using gin (title gin_trgm_ops);
```

### Example Product Row

```json
{
  "id": "4f1c…",
  "seller_id": "9a2b…",
  "title": "Casio fx-991ES Scientific Calculator",
  "description": "Scientific calculator in good condition, used for one semester.",
  "price": 500,
  "category_id": 2,
  "condition": "Good",
  "image_paths": ["9a2b…/4f1c…/1.webp", "9a2b…/4f1c…/2.webp"],
  "status": "available",
  "created_at": "2026-09-25T10:30:00Z"
}
```

### Example Queries (supabase-js)

```js
// Browse + filter + search, 20 items per page
let q = supabase
  .from('products')
  .select('id, title, price, condition, image_paths, categories(name)')
  .eq('status', 'available')
  .order('created_at', { ascending: false })
  .range(page * 20, page * 20 + 19);

if (categoryId) q = q.eq('category_id', categoryId);
if (minPrice)   q = q.gte('price', minPrice);
if (maxPrice)   q = q.lte('price', maxPrice);
if (condition)  q = q.eq('condition', condition);
if (keyword)    q = q.textSearch('search', keyword, { type: 'websearch' });

const { data, error } = await q;
```

---

## 🔐 Security

### 1. Roll-number allowlist (enforced in the database, not only in the UI)

The college doesn't give students an official email domain, so a student is verified by **roll number** instead. Admins upload the official roll-number list into `allowed_students`. Sign-up succeeds only if the roll number is on the list and hasn't already been used. Students can register with any email address.

```sql
alter table public.allowed_students enable row level security;
-- No policies on purpose: app users can't read the list. Admins manage it in the Supabase dashboard.

-- On sign-up: claim the roll number and create the profile, or reject the whole sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := new.raw_user_meta_data;
  roll text  := upper(trim(meta->>'roll_no'));
begin
  update allowed_students set claimed_by = new.id
   where roll_no = roll and claimed_by is null;
  if not found then
    raise exception 'Roll number is not on the student list or is already registered';
  end if;

  insert into profiles (id, roll_no, name, phone)
  values (new.id, roll, trim(meta->>'name'), trim(meta->>'phone'));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

The frontend passes the details as sign-up metadata:

```js
await supabase.auth.signUp({
  email, password,
  options: { data: { roll_no, name, phone } }
});
```

* Enable **"Confirm email"** in *Authentication → Providers → Email* so every account has a working email for password resets.
* Supabase shows trigger errors to the client as a generic "Database error saving new user". The sign-up form should show a friendly message such as "Roll number not found or already registered."
* **Known weakness:** anyone who knows a classmate's roll number could register as them. If a student reports "my roll number is already taken", an admin deletes the fake user in *Authentication → Users*, which frees the roll number automatically (`on delete set null`). The student can then register.

### 2. Row Level Security (ownership rules)

```sql
alter table public.profiles   enable row level security;
alter table public.products   enable row level security;
alter table public.categories enable row level security;

-- Categories: any logged-in user can read
create policy "read categories" on public.categories
  for select to authenticated using (true);

-- Profiles: logged-in students can read; the sign-up trigger creates rows;
-- users may edit only their own name and phone (never roll_no); email stays private in auth.users
create policy "read profiles"   on public.profiles for select to authenticated using (true);
create policy "update own profile" on public.profiles for update to authenticated
  using (id = auth.uid());
revoke update on public.profiles from authenticated;
grant  update (name, phone) on public.profiles to authenticated;

-- Products: logged-in students can read; only the seller can write
create policy "read products"   on public.products for select to authenticated using (true);
create policy "create own product" on public.products for insert to authenticated
  with check (seller_id = auth.uid());
create policy "update own product" on public.products for update to authenticated
  using (seller_id = auth.uid()) with check (seller_id = auth.uid());
create policy "delete own product" on public.products for delete to authenticated
  using (seller_id = auth.uid());
```

```text
User A ──► can edit/delete ──► User A's listings    ✅
User A ──► can edit/delete ──► User B's listings    ❌  (blocked by RLS)
Guest  ──► can see anything                         ❌  (login required)
```

### 3. Storage rules

Images go in a bucket called `product-images`, under the path `<user_id>/<product_id>/<n>.webp`. A policy lets users write only inside their own folder:

```sql
create policy "upload to own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images'
              and (storage.foldername(name))[1] = auth.uid()::text);

-- Storage API deletes need select + delete on the objects
create policy "read own images" on storage.objects for select to authenticated
  using (bucket_id = 'product-images'
         and (storage.foldername(name))[1] = auth.uid()::text);

create policy "delete own images" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images'
         and (storage.foldername(name))[1] = auth.uid()::text);
```

### 4. Secrets and privacy

* The **`anon` public key** and project URL are safe to ship in frontend code, because RLS protects the data.
* The **`service_role` key must never** appear in frontend code or be committed to Git. Keep `.env` in `.gitignore` and commit only a `.env.example` with placeholder values.
* Phone numbers are visible **only to logged-in students** (RLS `to authenticated`), never to the public internet.
* Validate every input on the client **and** through database `check` constraints.

---

## 🧩 Functional Requirements

| ID | Requirement | Details |
| -- | ----------- | ------- |
| **FR-01** | User Registration | Roll number, name, any email, phone, password. Rejects roll numbers not on the student list or already registered. Sends a verification email. |
| **FR-02** | Authentication | Login, logout, forgot password, persistent session (Supabase Auth). |
| **FR-03** | Create Listing | Title, description, price, category, condition, 1–3 images. |
| **FR-04** | Image Upload | 1–3 images, **compressed in the browser to WebP ≤ 200 KB** before upload, stored in Supabase Storage. |
| **FR-05** | Browse Products | Paginated grid of cards showing image, title, price, category, and condition. |
| **FR-06** | Search | Keyword search using PostgreSQL full-text search. For example, `calculator` returns every calculator listing. |
| **FR-07** | Filtering | By category, price range, and condition. Filters can be combined with search. |
| **FR-08** | Product Details | Images, title, price, description, category, condition, seller name, date posted, and availability. |
| **FR-09** | Contact Seller | Opens `https://wa.me/91XXXXXXXXXX?text=Hi, is "<title>" still available?` |
| **FR-10** | My Listings | Dashboard of your own listings with Edit / Delete / Mark as Sold actions. |
| **FR-11** | Mark as Sold | Status changes `available → sold`. Sold items disappear from the marketplace. |

### Product Categories

📚 Books · 💻 Electronics · 🪑 Furniture · ✏️ Stationery · 🏠 Hostel Items · 🚲 Cycles · 🏏 Sports Equipment · 🔬 Lab Equipment · 👕 Clothing · 🎒 Accessories · 📦 Other

### CRUD Mapping

| Operation | Application Function |
| --------- | -------------------- |
| Create | Create a product listing |
| Read | Browse / search / view listings |
| Update | Edit a listing, mark it as sold |
| Delete | Delete a listing (and its images) |

---

## 📱 Main Application Screens

<details>
<summary><b>Click to expand the wireframes</b></summary>

**1. Landing Page:** intro, Login, Register, preview of categories.

**2. Login**
```text
Email
Password
[ Login ]
Forgot Password? · Register
```

**3. Register**
```text
Name
Roll Number     (must be on the student list)
Email           (any email you can access)
Phone Number    (WhatsApp)
Password / Confirm Password
[ Create Account ]  → "Check your college inbox to verify"
```

**4. Marketplace**
```text
-------------------------------------------------
🔍 Search products...
-------------------------------------------------
Category ▼     Price ▼     Condition ▼
-------------------------------------------------
[Image]          [Image]          [Image]
Calculator       Engg. Maths      Office Chair
₹500             ₹300             ₹800
-------------------------------------------------
                [ Load more ]
```

**5. Product Details**
```text
[ Product Images ◀ ▶ ]
Casio Scientific Calculator
₹500
Condition: Good · Category: Electronics
Description: Scientific calculator suitable for engineering students.
Seller: Student Name · Posted 2 days ago
[ 💬 Contact Seller on WhatsApp ]
```

**6. Create / Edit Listing**
```text
Product Name · Description · Price · Category · Condition
Upload Images (1–3, auto-compressed)
[ Publish Listing ]
```

**7. My Listings**
```text
Calculator · ₹500 · Available   [Edit] [Delete] [Mark as Sold]
Engg. Book · ₹300 · Sold        [View] [Delete]
```

</details>

---

## 📉 Staying Inside the Free Tier

| Free-tier limit (Supabase) | How we stay under it |
| -------------------------- | -------------------- |
| **1 GB file storage** | Compress images in the browser to **WebP, max 1080 px, ≤ 200 KB** using [`browser-image-compression`](https://github.com/Donaldcwl/browser-image-compression). 3 images × 200 KB ≈ 0.6 MB per listing, so about **1,600 listings** fit. |
| **5 GB storage egress / month** | Show thumbnails on cards, lazy-load images (`loading="lazy"`), and set long cache headers. |
| **500 MB database** | Text rows only (images stay in Storage). Tens of thousands of listings fit easily. |
| **Auto-pause after 7 days of inactivity** | The GitHub Actions workflow below pings the database twice a week. |
| **Deleting old data** | When a listing is deleted, also delete its images. Optionally auto-remove *sold* listings older than 60 days. |

**Keep-alive workflow**: `.github/workflows/keep-alive.yml`

```yaml
name: Keep Supabase awake
on:
  schedule:
    - cron: "0 6 * * 1,4"   # Mondays & Thursdays, 06:00 UTC
  workflow_dispatch:
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -s "${{ secrets.SUPABASE_URL }}/rest/v1/categories?select=id&limit=1" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

> For this ping to succeed, either add a read policy on `categories` for the `anon` role, or have the workflow query a small public table.

---

## 🧑‍💻 Getting Started (Local Setup)

### Prerequisites (all free)

* [Git](https://git-scm.com/) and a [GitHub](https://github.com/) account
* [VS Code](https://code.visualstudio.com/) with the *Live Server* extension (for plain HTML/JS)
* A free [Supabase](https://supabase.com/) account (sign in with GitHub, no card)
* A free [Brevo](https://www.brevo.com/) account for SMTP

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/campus-marketplace.git
cd campus-marketplace

# 2. Put your Supabase project URL and anon (public) key in src/lib/supabase.js
#    (Supabase → Project Settings → API). The anon key is safe in frontend code.

# 3. Open index.html with VS Code "Live Server" (right-click → Open with Live Server)
```

### Supabase setup checklist

1. Create a new project (free plan) in the region closest to your college (e.g. *Mumbai / ap-south-1*).
2. **SQL Editor**: run the schema, RLS, roll-number sign-up trigger, and storage policies from this README.
3. **Storage**: create a **public** bucket `product-images` with a 1 MB file-size limit and allowed types `image/webp, image/jpeg, image/png`.
4. **Authentication → Providers → Email**: enable *Confirm email*.
5. **Authentication → SMTP Settings**: enter your Brevo SMTP credentials.
6. **Authentication → URL Configuration**: set the Site URL to your deployed Pages URL.
7. **Table Editor → allowed_students**: import the student list CSV (columns `roll_no`, `full_name`; format `2026CSE102`, courses CSE/CSDS/CSAI/CSIT).

### Suggested folder structure

```text
campus-marketplace/
├── index.html
├── src/
│   ├── lib/supabase.js        # createClient(url, anonKey), supabase-js from CDN
│   ├── pages/                 # login, register, market, product, create, my-listings
│   ├── components/            # ProductCard, Filters, ImageUploader
│   └── styles/
├── supabase/
│   └── schema.sql             # all SQL from this README
├── .github/workflows/keep-alive.yml
├── .gitignore                 # includes .env
└── README.md
```

---

## 🌐 Deployment

**Cloudflare Pages** (free, unlimited static bandwidth, auto-deploys from GitHub):

1. Push the repository to GitHub.
2. In Cloudflare → *Workers & Pages → Create → Pages → Connect to Git*, pick the repo.
3. Leave the build command empty and set the output directory to `/`.
4. The site goes live at `https://campus-marketplace.pages.dev`, free with HTTPS.

*GitHub Pages, Netlify, and Vercel free tiers work equally well.*

---

## 🧪 Testing Strategy

### Authentication

| Test Case | Expected Result |
| --------- | --------------- |
| Register with a roll number on the list | Account created, verification email sent |
| Register with a roll number not on the list | Rejected by the database trigger |
| Register again with an already-used roll number | Rejected by the database trigger |
| Try to change own `roll_no` via the API | Denied (column not updatable) |
| Log in before verifying the email | Rejected |
| Correct credentials | Login succeeds |
| Wrong password | Login rejected |

### Listings

| Test Case | Expected Result |
| --------- | --------------- |
| Create a valid listing with 1–3 images | Listing created |
| Create a listing with 0 or 4 images | Rejected |
| Upload a 5 MB photo | Compressed to ≤ 200 KB, then uploaded |
| Negative price | Rejected by the `check` constraint |
| Edit own listing | Updated |
| Mark as sold | Hidden from the marketplace |
| Delete own listing | Row and images removed |

### Security (RLS)

| Test Case | Expected Result |
| --------- | --------------- |
| User edits own listing | ✅ Allowed |
| User edits another user's listing | ❌ Denied |
| Logged-out visitor reads products | ❌ Denied |
| User uploads into another user's storage folder | ❌ Denied |
| `service_role` key found in the frontend bundle | ❌ Must never happen (check before every release) |

---

## 📅 Development Plan

| Phase | Tasks |
| ----- | ----- |
| **1. Planning** | Requirements, wireframes, SQL schema, create Supabase and GitHub accounts |
| **2. Authentication** | Supabase Auth, Brevo SMTP, roll-number allowlist + trigger, register/login/logout/reset |
| **3. Product Management** | Create listing, image compression and upload, product details page |
| **4. Marketplace** | Product grid, pagination, full-text search, filters |
| **5. Seller Dashboard** | My Listings, edit, delete, mark as sold |
| **6. Communication** | WhatsApp `wa.me` button with a pre-filled message |
| **7. Testing** | Functional, auth, RLS/security, UI and mobile testing |
| **8. Deployment** | Cloudflare Pages, keep-alive workflow, final demo |

---

## 🚫 Out of Scope for MVP

Real-time in-app chat · Online payments · Delivery/logistics · Auctions · AI recommendations · Advanced fraud detection · Dispute resolution · Multi-college support · Ratings

---

## 🔮 Future Scope (Free Options Only)

| Feature | Zero-cost approach |
| ------- | ------------------ |
| **Real-time chat** | Supabase Realtime (included in the free plan: 200 concurrent connections) |
| **Payments** | UPI deep link (`upi://pay?pa=<vpa>&am=<amount>`). No gateway, no fees. Razorpay/Stripe charge per transaction, so they stay out. |
| **Smarter search** | PostgreSQL `pg_trgm` for typo-tolerant search ("calcualtor" → calculator), plus simple rule-based parsing ("under ₹500" → `price <= 500`) |
| **Wishlist** | New `wishlist(user_id, product_id)` table with RLS |
| **Notifications** | In-app notifications table, plus free Brevo emails for wishlist price drops |
| **Ratings & Reviews** | `reviews` table linked to completed deals |
| **Report Listing** | `reports` table (reasons: fraud, wrong info, duplicate, inappropriate, other) |
| **Admin Dashboard** | `role` column on `profiles` and admin-only RLS policies. Stats come from SQL `count(*)` views. |
| **Hostel/Location filter** | `location` column (Hostel A/B/C, Academic Block, Library) |
| **PWA / installable app** | Web App Manifest + Service Worker, so students install it like an app for free |

---

## 🎓 Academic Concepts Demonstrated

* Web application development & responsive design
* Client–server and Backend-as-a-Service architecture
* **Relational database design**: normalisation, primary/foreign keys, constraints, enums, indexes
* **SQL**: DDL, DML, joins, full-text search
* Authentication & authorisation (**Row Level Security**)
* CRUD operations and file management
* Data validation (client-side + database constraints)
* Cloud computing & free-tier cost engineering
* Software testing and the SDLC (MVP → Test → Deploy → Iterate)

---

## 📄 Project Summary

| | |
| - | - |
| **Project Type** | Academic / First-Year Engineering Project |
| **Domain** | Web Development · Cloud Computing · DBMS · E-Commerce |
| **Approach** | MVP → Testing → Deployment → Future Enhancements |
| **Running Cost** | **₹0** |

```text
Frontend       : HTML, CSS, plain JavaScript (no build step)
Database       : Supabase PostgreSQL
Authentication : Supabase Auth (+ Brevo free SMTP)
Storage        : Supabase Storage (browser-compressed WebP images)
Hosting        : Cloudflare Pages
Automation     : GitHub Actions (keep-alive)
Communication  : WhatsApp wa.me links
```

---

## 🏁 Conclusion

Campus Marketplace solves a real, everyday campus problem with a focused MVP. It uses an entirely free, no-credit-card stack. Choosing **Supabase (PostgreSQL)** gives the project free image storage, proper keyword search, and database-level security, while teaching real SQL and relational design. The architecture leaves room for chat, wishlists, ratings, and moderation later, still at zero cost.

---

## 📜 License

Released under the [MIT License](LICENSE). Free to use, modify, and share.
