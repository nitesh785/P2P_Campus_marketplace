-- Campus Marketplace: full database setup.
-- Run once on a fresh Supabase project: SQL Editor → paste → Run.
-- Every schema change goes in this file (see CLAUDE.md).

create extension if not exists pg_trgm;
create extension if not exists moddatetime schema extensions;

-- =========================================================
-- Tables
-- =========================================================

-- Official student list. Admins import it as CSV (columns roll_no, full_name)
-- in Table Editor → allowed_students. Format: <year><course><serial>, e.g. 2026CSE102
create table public.allowed_students (
  roll_no     text primary key check (roll_no ~ '^[0-9]{4}(CSE|CSDS|CSAI|CSIT)[0-9]{3}$'),
  full_name   text,
  claimed_by  uuid unique references auth.users(id) on delete set null
);

-- One row per registered student, created by the sign-up trigger below.
-- Email is not copied here: it stays private in auth.users.
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  roll_no     text not null unique references public.allowed_students(roll_no),
  name        text not null check (char_length(name) between 2 and 60),
  phone       text not null check (phone ~ '^[0-9]{10,13}$'),
  created_at  timestamptz not null default now()
);

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

create type product_condition as enum ('New', 'Like New', 'Good', 'Fair', 'Poor');
create type product_status    as enum ('available', 'sold');

create table public.products (
  id           uuid primary key default gen_random_uuid(),
  seller_id    uuid not null references public.profiles(id) on delete cascade,
  title        text not null check (char_length(title) between 3 and 100),
  description  text not null check (char_length(description) <= 1000),
  price        integer not null check (price between 0 and 200000),
  category_id  smallint not null references public.categories(id),
  condition    product_condition not null,
  image_paths  text[] not null check (array_length(image_paths, 1) between 1 and 3),
  status       product_status not null default 'available',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  search       tsvector generated always as (
                 to_tsvector('english', title || ' ' || description)
               ) stored
);

create trigger products_updated_at before update on public.products
  for each row execute procedure extensions.moddatetime(updated_at);

create index products_status_created_idx on public.products (status, created_at desc);
create index products_category_idx       on public.products (category_id);
create index products_price_idx          on public.products (price);
create index products_search_idx         on public.products using gin (search);
create index products_title_trgm_idx     on public.products using gin (title gin_trgm_ops);

-- =========================================================
-- Sign-up: roll number must be on the list and unused
-- =========================================================

-- The frontend calls supabase.auth.signUp({ email, password,
--   options: { data: { roll_no, name, phone } } })
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

-- =========================================================
-- Row Level Security
-- =========================================================

alter table public.allowed_students enable row level security;  -- no policies: app can't read it
alter table public.profiles         enable row level security;
alter table public.categories       enable row level security;
alter table public.products         enable row level security;

create policy "read categories" on public.categories
  for select to authenticated using (true);

-- Profiles: students can read each other (name, phone for WhatsApp);
-- each user may edit only their own name and phone.
create policy "read profiles" on public.profiles
  for select to authenticated using (true);
create policy "update own profile" on public.profiles
  for update to authenticated using (id = auth.uid());
revoke update on public.profiles from authenticated;
grant  update (name, phone) on public.profiles to authenticated;

-- Products: students can read all; only the seller can write.
create policy "read products" on public.products
  for select to authenticated using (true);
create policy "create own product" on public.products
  for insert to authenticated with check (seller_id = auth.uid());
create policy "update own product" on public.products
  for update to authenticated using (seller_id = auth.uid()) with check (seller_id = auth.uid());
create policy "delete own product" on public.products
  for delete to authenticated using (seller_id = auth.uid());

-- =========================================================
-- Storage: product-images bucket, path <user_id>/<product_id>/<n>.webp
-- =========================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 1048576,
        array['image/webp', 'image/jpeg', 'image/png']);

create policy "upload to own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images'
              and (storage.foldername(name))[1] = auth.uid()::text);

-- Storage API deletes need select + delete permission on the objects.
create policy "read own images" on storage.objects
  for select to authenticated
  using (bucket_id = 'product-images'
         and (storage.foldername(name))[1] = auth.uid()::text);

create policy "delete own images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images'
         and (storage.foldername(name))[1] = auth.uid()::text);
