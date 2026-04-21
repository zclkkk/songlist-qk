create extension if not exists pgcrypto;

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  language text not null,
  status text not null check (status in ('ready', 'learning', 'resting')),
  tags text[] not null default '{}',
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.songs alter column language drop default;
alter table public.songs drop constraint if exists songs_language_check;
alter table public.songs
  add constraint songs_language_check
  check (language in ('中文', '英语', '日语', '其他'));

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  song_title text not null,
  artist text not null default '',
  language text not null,
  message text not null,
  requester_name text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'refused')),
  matched_song_id uuid references public.songs (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.requests drop constraint if exists requests_language_check;
alter table public.requests
  add constraint requests_language_check
  check (language in ('中文', '英语', '日语', '其他'));

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

create table if not exists public.settings (
  key text primary key,
  value text not null
);

alter table public.settings drop constraint if exists settings_key_check;
alter table public.settings
  add constraint settings_key_check
  check (key in ('avatar_path', 'background_path', 'hero_title'));

alter table public.settings enable row level security;

drop policy if exists "public settings are readable" on public.settings;
create policy "public settings are readable"
  on public.settings
  for select
  using (key in ('avatar_path', 'background_path', 'hero_title'));

insert into public.settings (key, value)
values
  ('avatar_path', ''),
  ('background_path', ''),
  ('hero_title', 'songlist-qk')
on conflict (key) do nothing;

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public;
