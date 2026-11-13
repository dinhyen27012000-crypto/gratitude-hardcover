-- Chạy trong Supabase SQL Editor.
-- Trước khi chạy: tạo tài khoản quản trị trong Authentication > Users.
-- Sau khi tạo tài khoản, lấy UUID và thêm vào app_admins bằng câu lệnh ở cuối file.

create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.app_admins enable row level security;

create or replace function public.is_book_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.app_admins
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_book_admin() from public;
grant execute on function public.is_book_admin() to anon, authenticated;

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  intro text not null default '',
  portrait_path text,
  quote_intro text not null default '',
  theme_key text not null default 'default',
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  kind text not null check (kind in ('memory', 'gratitude')),
  title text not null,
  body text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  body text not null,
  caption text not null default '',
  sort_order integer not null default 0
);

create table if not exists public.greeting_cards (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  title text not null default '',
  caption text not null default '',
  storage_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.teachers enable row level security;
alter table public.memories enable row level security;
alter table public.quotes enable row level security;
alter table public.greeting_cards enable row level security;

drop policy if exists "Read published teachers" on public.teachers;
create policy "Read published teachers" on public.teachers
for select to anon, authenticated
using (published or (select public.is_book_admin()));

drop policy if exists "Admin manages teachers" on public.teachers;
create policy "Admin manages teachers" on public.teachers
for all to authenticated
using ((select public.is_book_admin()))
with check ((select public.is_book_admin()));

drop policy if exists "Read published memories" on public.memories;
create policy "Read published memories" on public.memories
for select to anon, authenticated
using (
  exists (select 1 from public.teachers t where t.id = teacher_id and t.published)
  or (select public.is_book_admin())
);

drop policy if exists "Admin manages memories" on public.memories;
create policy "Admin manages memories" on public.memories
for all to authenticated
using ((select public.is_book_admin()))
with check ((select public.is_book_admin()));

drop policy if exists "Read published quotes" on public.quotes;
create policy "Read published quotes" on public.quotes
for select to anon, authenticated
using (
  exists (select 1 from public.teachers t where t.id = teacher_id and t.published)
  or (select public.is_book_admin())
);

drop policy if exists "Admin manages quotes" on public.quotes;
create policy "Admin manages quotes" on public.quotes
for all to authenticated
using ((select public.is_book_admin()))
with check ((select public.is_book_admin()));

drop policy if exists "Read published cards" on public.greeting_cards;
create policy "Read published cards" on public.greeting_cards
for select to anon, authenticated
using (
  exists (select 1 from public.teachers t where t.id = teacher_id and t.published)
  or (select public.is_book_admin())
);

drop policy if exists "Admin manages cards" on public.greeting_cards;
create policy "Admin manages cards" on public.greeting_cards
for all to authenticated
using ((select public.is_book_admin()))
with check ((select public.is_book_admin()));

-- Tạo bucket greeting-cards trong Storage, để PRIVATE.
-- Các policy này cho phép khách đọc file nếu có metadata thiệp thuộc chương đã xuất bản.
drop policy if exists "Read published greeting card files" on storage.objects;
create policy "Read published greeting card files" on storage.objects
for select to anon, authenticated
using (
  bucket_id = 'greeting-cards'
  and exists (
    select 1
    from public.greeting_cards gc
    join public.teachers t on t.id = gc.teacher_id
    where gc.storage_path = storage.objects.name
      and t.published = true
  )
);

drop policy if exists "Admin uploads greeting card files" on storage.objects;
create policy "Admin uploads greeting card files" on storage.objects
for insert to authenticated
with check (bucket_id = 'greeting-cards' and (select public.is_book_admin()));

drop policy if exists "Admin updates greeting card files" on storage.objects;
create policy "Admin updates greeting card files" on storage.objects
for update to authenticated
using (bucket_id = 'greeting-cards' and (select public.is_book_admin()))
with check (bucket_id = 'greeting-cards' and (select public.is_book_admin()));

drop policy if exists "Admin deletes greeting card files" on storage.objects;
create policy "Admin deletes greeting card files" on storage.objects
for delete to authenticated
using (bucket_id = 'greeting-cards' and (select public.is_book_admin()));

-- Sau khi tạo tài khoản quản trị trong Authentication > Users:
-- insert into public.app_admins (user_id) values ('UUID-TAI-KHOAN-CUA-BAN');
