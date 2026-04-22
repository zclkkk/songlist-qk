import { parseEnum } from '$lib/server/form-utils';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { songLanguageOptions, songStatusOptions, type Song, type SongLanguage, type SongStatus } from '$lib/types';

type SongRow = {
  id: string;
  title: string;
  artist: string;
  language: string;
  status: string;
  tags: string[];
  is_public: boolean;
};

const sortStrings = (values: Iterable<string>) => Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));

const mapSongRow = (row: SongRow): Song => ({
  id: row.id,
  title: row.title,
  artist: row.artist,
  language: parseEnum(row.language, songLanguageOptions, 'song language'),
  status: parseEnum(row.status, songStatusOptions, 'song status'),
  tags: row.tags,
  isPublic: row.is_public
});

export const listSongs = async ({ isPublic }: { isPublic?: boolean } = {}): Promise<Song[]> => {
  const supabase = getSupabaseAdmin();

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
  const supabase = getSupabaseAdmin();
  const row = {
    title,
    artist,
    language,
    status,
    tags: sortStrings(tags),
    is_public: isPublic
  };

  const { error } = id
    ? await supabase.from('songs').update(row).eq('id', id)
    : await supabase.from('songs').insert(row);

  if (error) {
    throw error;
  }
};

export const deleteSong = async (id: string) => {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from('songs').delete().eq('id', id);

  if (error) {
    throw error;
  }
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
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from('songs').insert(
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
