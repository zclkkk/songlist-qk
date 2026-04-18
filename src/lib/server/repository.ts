import { randomUUID } from 'node:crypto';

import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { streamerProfile } from '$lib/config';
import { sampleRequests, sampleSongs } from '$lib/sample-data';
import {
  type CatalogStats,
  requestStatusOptions,
  songStatusOptions,
  type AdminDashboardData,
  type BackendMode,
  type PublicCatalog,
  type RequestStatus,
  type Song,
  type SongRequest,
  type SongStatus
} from '$lib/types';
import { createClient } from '@supabase/supabase-js';

const memoryStore = {
  songs: sampleSongs.map((song) => ({ ...song, tags: [...song.tags] })),
  requests: sampleRequests.map((item) => ({ ...item }))
};

type SongRow = {
  id: string;
  title: string;
  artist: string;
  language: string;
  status: string;
  tags: string[] | null;
  is_public: boolean;
};

type RequestRow = {
  id: string;
  song_title: string;
  artist: string;
  message: string;
  requester_name: string | null;
  status: string;
  matched_song_id: string | null;
  created_at: string;
};

const sortStrings = (values: Iterable<string>) => Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));

const cloneSong = (song: Song): Song => ({
  ...song,
  tags: [...song.tags]
});

const cloneRequest = (item: SongRequest): SongRequest => ({
  ...item
});

const parseSongStatus = (status: string): SongStatus => {
  if (songStatusOptions.includes(status as SongStatus)) {
    return status as SongStatus;
  }

  throw new Error(`Invalid song status from database: ${status}`);
};

const parseRequestStatus = (status: string): RequestStatus => {
  if (requestStatusOptions.includes(status as RequestStatus)) {
    return status as RequestStatus;
  }

  throw new Error(`Invalid request status from database: ${status}`);
};

const getBackendMode = (): BackendMode =>
  publicEnv.PUBLIC_SUPABASE_URL && publicEnv.PUBLIC_SUPABASE_ANON_KEY && privateEnv.SUPABASE_SERVICE_ROLE_KEY
    ? 'supabase'
    : 'memory';

const getSupabaseAdmin = () => {
  if (getBackendMode() !== 'supabase') {
    return null;
  }

  return createClient(publicEnv.PUBLIC_SUPABASE_URL!, privateEnv.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
};

const mapSongRow = (row: SongRow): Song => ({
  id: row.id,
  title: row.title,
  artist: row.artist,
  language: row.language,
  status: parseSongStatus(row.status),
  tags: row.tags ?? [],
  isPublic: row.is_public
});

const mapRequestRow = (row: RequestRow): SongRequest => ({
  id: row.id,
  songTitle: row.song_title,
  artist: row.artist,
  message: row.message,
  requesterName: row.requester_name,
  status: parseRequestStatus(row.status),
  matchedSongId: row.matched_song_id,
  createdAt: row.created_at
});

const buildStats = (songs: Song[], requests: SongRequest[]): CatalogStats => ({
  totalSongs: songs.length,
  publicSongs: songs.filter((song) => song.isPublic).length,
  pendingRequests: requests.filter((item) => item.status === 'pending').length
});

const listSongs = async (): Promise<Song[]> => {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return memoryStore.songs.map(cloneSong);
  }

  const { data, error } = await supabase
    .from('songs')
    .select('id, title, artist, language, status, tags, is_public')
    .order('title', { ascending: true });

  if (error) {
    throw error;
  }

  return ((data as SongRow[] | null) ?? []).map(mapSongRow);
};

const listRequests = async (): Promise<SongRequest[]> => {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return memoryStore.requests.map(cloneRequest).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const { data, error } = await supabase
    .from('requests')
    .select('id, song_title, artist, message, requester_name, status, matched_song_id, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return ((data as RequestRow[] | null) ?? []).map(mapRequestRow);
};

export const getCatalogMetadata = async (): Promise<{ tags: string[]; languages: string[] }> => {
  const songs = await listSongs();

  return {
    tags: sortStrings(songs.flatMap((song) => song.tags)),
    languages: sortStrings(songs.map((song) => song.language))
  };
};

export const getPublicCatalog = async (): Promise<PublicCatalog> => {
  const songs = (await listSongs()).filter((song) => song.isPublic);
  const requests = await listRequests();
  const tags = sortStrings(songs.flatMap((song) => song.tags));
  const languages = sortStrings(songs.map((song) => song.language));

  return {
    streamer: streamerProfile,
    songs,
    tags,
    languages,
    statuses: songStatusOptions,
    stats: buildStats(songs, requests),
    backendMode: getBackendMode()
  };
};

export const getAdminDashboardData = async (): Promise<AdminDashboardData> => {
  const songs = await listSongs();
  const requests = await listRequests();

  return {
    streamer: streamerProfile,
    songs,
    requests,
    tags: sortStrings(songs.flatMap((song) => song.tags)),
    languages: sortStrings(songs.map((song) => song.language)),
    overview: buildStats(songs, requests),
    backendMode: getBackendMode()
  };
};

export const createSongRequest = async ({
  songTitle,
  artist,
  message,
  requesterName
}: {
  songTitle: string;
  artist: string;
  message: string;
  requesterName: string;
}) => {
  const payload: SongRequest = {
    id: randomUUID(),
    songTitle,
    artist,
    message,
    requesterName: requesterName || null,
    status: 'pending',
    matchedSongId: null,
    createdAt: new Date().toISOString()
  };

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    memoryStore.requests.unshift(payload);
    return payload;
  }

  const { error } = await supabase.from('requests').insert({
    id: payload.id,
    song_title: payload.songTitle,
    artist: payload.artist,
    message: payload.message,
    requester_name: payload.requesterName,
    status: payload.status,
    matched_song_id: payload.matchedSongId,
    created_at: payload.createdAt
  });

  if (error) {
    throw error;
  }

  return payload;
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
  language: string;
  status: SongStatus;
  tags: string[];
  isPublic: boolean;
}) => {
  const payload: Song = {
    id: id || randomUUID(),
    title,
    artist,
    language,
    status,
    tags: sortStrings(tags),
    isPublic
  };

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    const existingIndex = memoryStore.songs.findIndex((song) => song.id === payload.id);

    if (existingIndex >= 0) {
      memoryStore.songs[existingIndex] = payload;
    } else {
      memoryStore.songs.unshift(payload);
    }

    return payload;
  }

  const { error } = await supabase.from('songs').upsert({
    id: payload.id,
    title: payload.title,
    artist: payload.artist,
    language: payload.language,
    status: payload.status,
    tags: payload.tags,
    is_public: payload.isPublic
  });

  if (error) {
    throw error;
  }

  return payload;
};

export const deleteSong = async (id: string) => {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    memoryStore.songs = memoryStore.songs.filter((song) => song.id !== id);
    memoryStore.requests = memoryStore.requests.map((item) =>
      item.matchedSongId === id
        ? {
            ...item,
            matchedSongId: null
          }
        : item
    );
    return;
  }

  const { error } = await supabase.from('songs').delete().eq('id', id);

  if (error) {
    throw error;
  }
};

export const updateRequestStatus = async ({
  id,
  status
}: {
  id: string;
  status: RequestStatus;
}) => {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    memoryStore.requests = memoryStore.requests.map((item) =>
      item.id === id
        ? {
            ...item,
            status
          }
        : item
    );
    return;
  }

  const { error } = await supabase.from('requests').update({ status }).eq('id', id);

  if (error) {
    throw error;
  }
};
