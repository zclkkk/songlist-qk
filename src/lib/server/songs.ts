import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '$lib/server/database.types';
import { supabaseAdmin, supabasePublic } from '$lib/server/supabase';
import { type Song, type SongLanguage, type SongStatus } from '$lib/types';

type SongRow = Pick<
  Database['public']['Tables']['songs']['Row'],
  'id' | 'title' | 'artist' | 'language' | 'status' | 'tags' | 'is_public'
>;

const sortStrings = (values: Iterable<string>) => Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));

const mapSongRow = (row: SongRow): Song => ({
  id: row.id,
  title: row.title,
  artist: row.artist,
  language: row.language as SongLanguage,
  status: row.status as SongStatus,
  tags: row.tags,
  isPublic: row.is_public
});

const fetchSongs = async (supabase: SupabaseClient<Database>, isPublic?: boolean): Promise<Song[]> => {
  let query = supabase
    .from('songs')
    .select('id, title, artist, language, status, tags, is_public')
    .order('title', { ascending: true });

  if (isPublic !== undefined) {
    query = query.eq('is_public', isPublic);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data as SongRow[]).map(mapSongRow);
};

export const listPublicSongs = () => fetchSongs(supabasePublic, true);

export const listSongs = () => fetchSongs(supabaseAdmin);

export const saveSong = async ({
  id,
  title,
  artist,
  language,
  status,
  tags,
  isPublic
}: {
  id?: string;
  title: string;
  artist: string;
  language: SongLanguage;
  status: SongStatus;
  tags: string[];
  isPublic: boolean;
}) => {
  const row = {
    title,
    artist,
    language,
    status,
    tags: sortStrings(tags),
    is_public: isPublic
  };

  const { error } = id
    ? await supabaseAdmin.from('songs').update(row).eq('id', id)
    : await supabaseAdmin.from('songs').insert(row);

  if (error) {
    throw error;
  }
};

export const deleteSong = async (id: string) => {
  const { error } = await supabaseAdmin.from('songs').delete().eq('id', id);

  if (error) {
    throw error;
  }
};

export const bulkDeleteSongs = async (ids: string[]) => {
  const { error, count } = await supabaseAdmin.from('songs').delete({ count: 'exact' }).in('id', ids);

  if (error) {
    throw error;
  }

  return count!;
};

export const bulkSetSongsPublic = async (ids: string[], isPublic: boolean) => {
  const { error, count } = await supabaseAdmin
    .from('songs')
    .update({ is_public: isPublic }, { count: 'exact' })
    .in('id', ids);

  if (error) {
    throw error;
  }

  return count!;
};

export const importSongs = async (
  songs: Array<{
    title: string;
    artist: string;
    language: SongLanguage;
    status: SongStatus;
    tags: string[];
    isPublic: boolean;
  }>
) => {
  const { error } = await supabaseAdmin.from('songs').insert(
    songs.map((song) => ({
      title: song.title,
      artist: song.artist,
      language: song.language,
      status: song.status,
      tags: sortStrings(song.tags),
      is_public: song.isPublic
    }))
  );

  if (error) {
    throw error;
  }

  return songs.length;
};

export const collectTags = (songs: Song[]) => sortStrings(songs.flatMap((song) => song.tags));
