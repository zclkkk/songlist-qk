create extension if not exists pgcrypto;

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  language text not null default '未指定',
  status text not null check (status in ('ready', 'learning', 'resting')),
  tags text[] not null default '{}',
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.songs alter column language set default '未指定';
alter table public.songs drop constraint if exists songs_language_check;
alter table public.songs
  add constraint songs_language_check
  check (language in ('未指定', '中文', '英语', '日语', '其他'));

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  song_title text not null,
  artist text not null default '',
  message text not null,
  requester_name text,
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'planned', 'declined')),
  matched_song_id uuid references public.songs (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.songs enable row level security;
alter table public.requests enable row level security;

drop policy if exists "public songs are readable" on public.songs;
create policy "public songs are readable"
  on public.songs
  for select
  using (is_public = true);

drop policy if exists "public can create requests" on public.requests;
create policy "public can create requests"
  on public.requests
  for insert
  with check (
    status = 'pending'
    and matched_song_id is null
  );
