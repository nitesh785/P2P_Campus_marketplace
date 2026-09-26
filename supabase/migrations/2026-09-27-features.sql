-- Campus Marketplace: feature batch (2026-09-27)
-- Saved items, reports + admin, pickup location, negotiable, listing expiry,
-- "wanted" board, in-app chat, seller reviews, typo-tolerant search.
-- Run once in Supabase → SQL Editor. Safe to re-run.

-- =========================================================
-- Listings: pickup location, negotiable, expiry
-- =========================================================

alter table public.products
  add column if not exists pickup_location text check (char_length(pickup_location) <= 40),
  add column if not exists negotiable boolean not null default false,
  -- Listings leave the marketplace after 60 days unless the seller renews them.
  add column if not exists expires_at timestamptz not null default (now() + interval '60 days');

create index if not exists products_expires_idx on public.products (expires_at);

-- =========================================================
-- Profiles: admin and blocked flags (users can't change these:
-- the existing column grant only allows updating name and phone)
-- =========================================================

alter table public.profiles
  add column if not exists is_admin boolean not null default false,
  add column if not exists blocked boolean not null default false;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false)
$$;

-- True for signed-in users who are not blocked.
create or replace function public.is_active_user() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select not blocked from profiles where id = auth.uid()), false)
$$;

-- Admins block/unblock users through this function only.
create or replace function public.admin_set_blocked(target uuid, value boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only';
  end if;
  update profiles set blocked = value where id = target;
end $$;
revoke execute on function public.admin_set_blocked(uuid, boolean) from public, anon;
grant execute on function public.admin_set_blocked(uuid, boolean) to authenticated;

-- Blocked users can't post; admins can edit or remove any listing and its photos.
drop policy if exists "create own product" on public.products;
create policy "create own product" on public.products
  for insert to authenticated with check (seller_id = auth.uid() and public.is_active_user());

drop policy if exists "admin update any product" on public.products;
create policy "admin update any product" on public.products
  for update to authenticated using (public.is_admin());

drop policy if exists "admin delete any product" on public.products;
create policy "admin delete any product" on public.products
  for delete to authenticated using (public.is_admin());

drop policy if exists "admin read images" on storage.objects;
create policy "admin read images" on storage.objects
  for select to authenticated using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "admin delete images" on storage.objects;
create policy "admin delete images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());

-- =========================================================
-- Saved items (wishlist)
-- =========================================================

create table if not exists public.saved_items (
  user_id     uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, product_id)
);
alter table public.saved_items enable row level security;

drop policy if exists "own saved items" on public.saved_items;
create policy "own saved items" on public.saved_items
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =========================================================
-- Reports
-- =========================================================

create table if not exists public.reports (
  id           bigint generated always as identity primary key,
  product_id   uuid not null references public.products(id) on delete cascade,
  reporter_id  uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  reason       text not null check (reason in ('fraud', 'wrong_info', 'duplicate', 'inappropriate', 'other')),
  details      text check (char_length(details) <= 500),
  status       text not null default 'open' check (status in ('open', 'resolved')),
  created_at   timestamptz not null default now(),
  unique (product_id, reporter_id)  -- one report per student per listing
);
alter table public.reports enable row level security;

drop policy if exists "create report" on public.reports;
create policy "create report" on public.reports
  for insert to authenticated with check (reporter_id = auth.uid());

drop policy if exists "read own or admin reports" on public.reports;
create policy "read own or admin reports" on public.reports
  for select to authenticated using (reporter_id = auth.uid() or public.is_admin());

drop policy if exists "admin update reports" on public.reports;
create policy "admin update reports" on public.reports
  for update to authenticated using (public.is_admin());

-- =========================================================
-- "Wanted" board
-- =========================================================

create table if not exists public.wanted_posts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  title        text not null check (char_length(title) between 3 and 100),
  details      text check (char_length(details) <= 500),
  max_budget   integer check (max_budget between 0 and 200000),
  category_id  smallint references public.categories(id),
  status       text not null default 'open' check (status in ('open', 'found')),
  created_at   timestamptz not null default now()
);
create index if not exists wanted_status_created_idx on public.wanted_posts (status, created_at desc);
alter table public.wanted_posts enable row level security;

drop policy if exists "read wanted" on public.wanted_posts;
create policy "read wanted" on public.wanted_posts
  for select to authenticated using (true);

drop policy if exists "create own wanted" on public.wanted_posts;
create policy "create own wanted" on public.wanted_posts
  for insert to authenticated with check (user_id = auth.uid() and public.is_active_user());

drop policy if exists "update own wanted" on public.wanted_posts;
create policy "update own wanted" on public.wanted_posts
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "delete own or admin wanted" on public.wanted_posts;
create policy "delete own or admin wanted" on public.wanted_posts
  for delete to authenticated using (user_id = auth.uid() or public.is_admin());

-- =========================================================
-- In-app chat
-- =========================================================

create table if not exists public.conversations (
  id                   uuid primary key default gen_random_uuid(),
  -- Kept if the listing is deleted, so the chat history survives
  product_id           uuid references public.products(id) on delete set null,
  product_title        text not null check (char_length(product_title) <= 100),
  buyer_id             uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  seller_id            uuid not null references public.profiles(id) on delete cascade,
  created_at           timestamptz not null default now(),
  last_message_at      timestamptz not null default now(),
  buyer_last_read_at   timestamptz not null default now(),
  seller_last_read_at  timestamptz not null default 'epoch',
  unique (product_id, buyer_id),
  check (buyer_id <> seller_id)
);
create index if not exists conversations_buyer_idx on public.conversations (buyer_id, last_message_at desc);
create index if not exists conversations_seller_idx on public.conversations (seller_id, last_message_at desc);
alter table public.conversations enable row level security;

create or replace function public.in_conversation(conv uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from conversations c where c.id = conv and auth.uid() in (c.buyer_id, c.seller_id))
$$;

drop policy if exists "read own conversations" on public.conversations;
create policy "read own conversations" on public.conversations
  for select to authenticated using (auth.uid() in (buyer_id, seller_id));

-- A buyer can open a chat only about a real listing, with its real seller.
drop policy if exists "start conversation" on public.conversations;
create policy "start conversation" on public.conversations
  for insert to authenticated with check (
    buyer_id = auth.uid()
    and public.is_active_user()
    and exists (select 1 from public.products p
                where p.id = product_id and p.seller_id = conversations.seller_id)
  );

-- Participants may only update their "last read" times.
drop policy if exists "mark conversation read" on public.conversations;
create policy "mark conversation read" on public.conversations
  for update to authenticated using (auth.uid() in (buyer_id, seller_id));
revoke update on public.conversations from authenticated;
grant update (buyer_last_read_at, seller_last_read_at) on public.conversations to authenticated;

create table if not exists public.messages (
  id               bigint generated always as identity primary key,
  conversation_id  uuid not null references public.conversations(id) on delete cascade,
  sender_id        uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  body             text not null check (char_length(body) between 1 and 1000),
  created_at       timestamptz not null default now()
);
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);
alter table public.messages enable row level security;

drop policy if exists "read conversation messages" on public.messages;
create policy "read conversation messages" on public.messages
  for select to authenticated using (public.in_conversation(conversation_id));

drop policy if exists "send message" on public.messages;
create policy "send message" on public.messages
  for insert to authenticated with check (
    sender_id = auth.uid() and public.is_active_user() and public.in_conversation(conversation_id)
  );

-- New message → bump the conversation and mark it read for the sender.
create or replace function public.touch_conversation() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update conversations set
    last_message_at     = new.created_at,
    buyer_last_read_at  = case when new.sender_id = buyer_id  then new.created_at else buyer_last_read_at  end,
    seller_last_read_at = case when new.sender_id = seller_id then new.created_at else seller_last_read_at end
  where id = new.conversation_id;
  return new;
end $$;

drop trigger if exists messages_touch_conversation on public.messages;
create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation();

-- Live updates in the chat page (Realtime respects the RLS policies above).
do $$
begin
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

-- =========================================================
-- Seller reviews: only a buyer the seller actually replied to can review,
-- once per conversation.
-- =========================================================

create table if not exists public.reviews (
  id               bigint generated always as identity primary key,
  seller_id        uuid not null references public.profiles(id) on delete cascade,
  reviewer_id      uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  conversation_id  uuid not null unique references public.conversations(id) on delete cascade,
  rating           smallint not null check (rating between 1 and 5),
  comment          text check (char_length(comment) <= 300),
  created_at       timestamptz not null default now()
);
create index if not exists reviews_seller_idx on public.reviews (seller_id, created_at desc);
alter table public.reviews enable row level security;

drop policy if exists "read reviews" on public.reviews;
create policy "read reviews" on public.reviews
  for select to authenticated using (true);

drop policy if exists "write review after chat" on public.reviews;
create policy "write review after chat" on public.reviews
  for insert to authenticated with check (
    reviewer_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and c.buyer_id = auth.uid()
        and c.seller_id = reviews.seller_id
        and exists (select 1 from public.messages m
                    where m.conversation_id = c.id and m.sender_id = c.seller_id)
    )
  );

drop policy if exists "delete own review" on public.reviews;
create policy "delete own review" on public.reviews
  for delete to authenticated using (reviewer_id = auth.uid() or public.is_admin());

-- =========================================================
-- Typo-tolerant search ("calcualtor" → calculator), used when normal search finds nothing
-- =========================================================

create or replace function public.search_products_fuzzy(q text)
returns table (id uuid)
language sql stable security invoker set search_path = public, extensions as $$
  select p.id from products p
  where p.status = 'available' and p.expires_at > now()
    and word_similarity(q, p.title) > 0.3
  order by word_similarity(q, p.title) desc
  limit 20
$$;
