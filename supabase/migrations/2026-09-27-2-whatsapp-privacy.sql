-- Campus Marketplace: WhatsApp privacy (2026-09-27, second migration)
-- Phone numbers are hidden unless the student opts in; in-app chat also works for "Wanted" posts.
-- Run once in Supabase → SQL Editor, after 2026-09-27-features.sql. Safe to re-run.

-- =========================================================
-- Opt-in flag (off by default: numbers stay private until the student chooses)
-- =========================================================

alter table public.profiles
  add column if not exists show_whatsapp boolean not null default false;

-- Phone numbers can no longer be read directly: only the columns below are readable.
revoke select on public.profiles from anon, authenticated;
grant select (id, roll_no, name, created_at, is_admin, blocked, show_whatsapp) on public.profiles to authenticated;

-- Students may edit only their name, number and WhatsApp choice.
revoke update on public.profiles from authenticated;
grant update (name, phone, show_whatsapp) on public.profiles to authenticated;

-- The only way to get a number: returns it for students who opted in (and always your own).
create or replace function public.whatsapp_numbers(ids uuid[])
returns table (id uuid, phone text)
language sql stable security definer set search_path = public as $$
  select p.id, p.phone from profiles p
  where auth.uid() is not null
    and p.id = any(ids)
    and (p.show_whatsapp or p.id = auth.uid())
$$;
revoke execute on function public.whatsapp_numbers(uuid[]) from public, anon;
grant execute on function public.whatsapp_numbers(uuid[]) to authenticated;

-- Sign-up: store the WhatsApp choice from the registration form.
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

  insert into profiles (id, roll_no, name, phone, show_whatsapp)
  values (new.id, roll, trim(meta->>'name'), trim(meta->>'phone'),
          coalesce((meta->>'show_whatsapp')::boolean, false));
  return new;
end $$;

-- =========================================================
-- In-app chat about "Wanted" posts (so private numbers are still reachable)
-- The student who starts a chat is stored as buyer_id, the other person as seller_id.
-- =========================================================

alter table public.conversations
  add column if not exists wanted_id uuid references public.wanted_posts(id) on delete set null;

create unique index if not exists conversations_wanted_buyer_key
  on public.conversations (wanted_id, buyer_id) where wanted_id is not null;

drop policy if exists "start conversation" on public.conversations;
create policy "start conversation" on public.conversations
  for insert to authenticated with check (
    buyer_id = auth.uid()
    and public.is_active_user()
    and (
      exists (select 1 from public.products p
              where p.id = product_id and p.seller_id = conversations.seller_id)
      or exists (select 1 from public.wanted_posts w
                 where w.id = wanted_id and w.user_id = conversations.seller_id)
    )
  );

-- Ratings are for sellers of listings only, not for chats about wanted posts.
drop policy if exists "write review after chat" on public.reviews;
create policy "write review after chat" on public.reviews
  for insert to authenticated with check (
    reviewer_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and c.buyer_id = auth.uid()
        and c.seller_id = reviews.seller_id
        and c.wanted_id is null
        and c.product_title not like 'Wanted: %'
        and exists (select 1 from public.messages m
                    where m.conversation_id = c.id and m.sender_id = c.seller_id)
    )
  );
