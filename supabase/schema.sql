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

create or replace function public.accept_song_request(request_id uuid)
returns uuid
language plpgsql
set search_path = public
as $$
declare
  request_row public.requests%rowtype;
  new_song_id uuid;
begin
  select *
  into request_row
  from public.requests
  where id = request_id
  for update;

  if not found then
    raise exception '愿望不存在。';
  end if;

  if request_row.status <> 'pending' then
    raise exception '这个愿望已经处理过。';
  end if;

  insert into public.songs (title, artist, language, status, tags, is_public)
  values (request_row.song_title, request_row.artist, request_row.language, 'learning', '{}', true)
  returning id into new_song_id;

  update public.requests
  set status = 'accepted',
      matched_song_id = new_song_id
  where id = request_id;

  return new_song_id;
end;
$$;

revoke all on function public.accept_song_request(uuid) from public, anon, authenticated;
grant execute on function public.accept_song_request(uuid) to service_role;

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

create table if not exists public.request_rate_limits (
  client_key text primary key,
  request_count integer not null,
  reset_at timestamptz not null
);

alter table public.request_rate_limits enable row level security;

create or replace function public.consume_request_rate_limit(
  p_client_key text,
  p_max_requests integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
set search_path = public
as $$
declare
  current_limit public.request_rate_limits%rowtype;
begin
  loop
    select *
    into current_limit
    from public.request_rate_limits
    where client_key = p_client_key
    for update;

    if not found then
      begin
        insert into public.request_rate_limits (client_key, request_count, reset_at)
        values (p_client_key, 1, now() + make_interval(secs => p_window_seconds));
        return true;
      exception
        when unique_violation then
          null;
      end;
    elsif current_limit.reset_at <= now() then
      update public.request_rate_limits
      set request_count = 1,
          reset_at = now() + make_interval(secs => p_window_seconds)
      where client_key = p_client_key;
      return true;
    elsif current_limit.request_count >= p_max_requests then
      return false;
    else
      update public.request_rate_limits
      set request_count = current_limit.request_count + 1
      where client_key = p_client_key;
      return true;
    end if;
  end loop;
end;
$$;

revoke all on function public.consume_request_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_request_rate_limit(text, integer, integer) to service_role;

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public;
