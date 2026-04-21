import { randomUUID } from 'node:crypto';

import { streamerProfile } from '$lib/config';
import { getSupabaseConfig } from '$lib/server/env';
import {
  type CatalogStats,
  requestStatusOptions,
  songLanguageOptions,
  songStatusOptions,
  type AdminDashboardData,
  type PageSettings,
  type PublicCatalog,
  type RequestDecision,
  type RequestStatus,
  type Song,
  type SongLanguage,
  type SongRequest,
  type SongStatus
} from '$lib/types';
import { createClient } from '@supabase/supabase-js';

type SongRow = {
  id: string;
  title: string;
  artist: string;
  language: string;
  status: string;
  tags: string[];
  is_public: boolean;
};

type RequestRow = {
  id: string;
  song_title: string;
  artist: string;
  language: string;
  message: string;
  requester_name: string | null;
  status: string;
  matched_song_id: string | null;
  created_at: string;
};

type SettingRow = {
  key: string;
  value: string;
};

const settingsAssetBucket = 'site-assets';

export const pageSettingsKeys = {
  avatarPath: 'avatar_path',
  backgroundPath: 'background_path',
  heroTitle: 'hero_title'
} as const;

type PageSettingKey = (typeof pageSettingsKeys)[keyof typeof pageSettingsKeys];

const pageSettingsReadKeys = [pageSettingsKeys.avatarPath, pageSettingsKeys.backgroundPath, pageSettingsKeys.heroTitle] as const;

const pageSettingsDefaults: Record<PageSettingKey, string> = {
  [pageSettingsKeys.avatarPath]: '',
  [pageSettingsKeys.backgroundPath]: '',
  [pageSettingsKeys.heroTitle]: streamerProfile.name
};

const settingImageKinds = {
  avatar: pageSettingsKeys.avatarPath,
  background: pageSettingsKeys.backgroundPath
} as const;

type SettingImageKind = keyof typeof settingImageKinds;

const imageExtensionByMimeType: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/svg+xml': 'svg'
};

const sortStrings = (values: Iterable<string>) => Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));

const sanitizeExtension = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const resolveImageExtension = (file: File) => {
  const extensionFromName = sanitizeExtension(file.name.split('.').pop() ?? '');

  if (extensionFromName) {
    return extensionFromName;
  }

  return imageExtensionByMimeType[file.type] ?? 'png';
};

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

const parseSongLanguage = (language: string): SongLanguage => {
  if (songLanguageOptions.includes(language as SongLanguage)) {
    return language as SongLanguage;
  }

  throw new Error(`Invalid song language from database: ${language}`);
};

const getSupabaseAdmin = () => {
  const supabaseConfig = getSupabaseConfig();

  return createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
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
  language: parseSongLanguage(row.language),
  status: parseSongStatus(row.status),
  tags: row.tags,
  isPublic: row.is_public
});

const mapRequestRow = (row: RequestRow): SongRequest => ({
  id: row.id,
  songTitle: row.song_title,
  artist: row.artist,
  language: parseSongLanguage(row.language),
  message: row.message,
  requesterName: row.requester_name,
  status: parseRequestStatus(row.status),
  matchedSongId: row.matched_song_id,
  createdAt: row.created_at
});

const countPendingRequests = (requests: SongRequest[]) =>
  requests.filter((item) => item.status === 'pending').length;

const buildStats = (songs: Song[], pendingRequests: number): CatalogStats => ({
  totalSongs: songs.length,
  publicSongs: songs.filter((song) => song.isPublic).length,
  pendingRequests
});

const buildCatalogMetadata = (songs: Song[]) => ({
  tags: sortStrings(songs.flatMap((song) => song.tags)),
  languages: songLanguageOptions
});

const listSongs = async ({ isPublic }: { isPublic?: boolean } = {}): Promise<Song[]> => {
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

  return ((data as SongRow[] | null) ?? []).map(mapSongRow);
};

const listRequests = async (): Promise<SongRequest[]> => {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('requests')
    .select('id, song_title, artist, language, message, requester_name, status, matched_song_id, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return ((data as RequestRow[] | null) ?? []).map(mapRequestRow);
};

const listSettings = async (keys: readonly PageSettingKey[]) => {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('settings').select('key, value').in('key', keys);

  if (error) {
    throw error;
  }

  const settings: Record<string, string> = {};

  for (const row of ((data as SettingRow[] | null) ?? [])) {
    settings[row.key] = row.value;
  }

  return settings;
};

const requireSettingValue = (settings: Record<string, string>, key: PageSettingKey) => {
  const value = settings[key];

  if (value === undefined) {
    throw new Error(`缺少页面配置：${key}`);
  }

  return value;
};

const readSettingValue = async (key: PageSettingKey) => {
  const settings = await listSettings([key]);

  return requireSettingValue(settings, key);
};

const getAssetPublicUrl = (path: string) => {
  if (!path) {
    return '';
  }

  const supabase = getSupabaseAdmin();

  return supabase.storage.from(settingsAssetBucket).getPublicUrl(path).data.publicUrl;
};

const mapPageSettings = (settings: Record<string, string>): PageSettings => ({
  avatar: getAssetPublicUrl(requireSettingValue(settings, pageSettingsKeys.avatarPath)),
  background: getAssetPublicUrl(requireSettingValue(settings, pageSettingsKeys.backgroundPath)),
  heroTitle: requireSettingValue(settings, pageSettingsKeys.heroTitle)
});

export const getSettings = async (): Promise<PageSettings> => {
  const settings = await listSettings(pageSettingsReadKeys);

  return mapPageSettings(settings);
};

export const saveSetting = async (key: PageSettingKey, value: string) => {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('settings').upsert({ key, value });
  if (error) throw error;
};

export const saveSettingImage = async (kind: SettingImageKind, file: File) => {
  const supabase = getSupabaseAdmin();

  if (!file.type.startsWith('image/')) {
    throw new Error('仅支持图片文件。');
  }

  const settingKey = settingImageKinds[kind];
  const existingPath = await readSettingValue(settingKey);
  const extension = resolveImageExtension(file);
  const objectPath = `profile/${kind}-${Date.now()}-${randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage.from(settingsAssetBucket).upload(objectPath, file, {
    upsert: false,
    cacheControl: '31536000',
    contentType: file.type || 'application/octet-stream'
  });

  if (uploadError) {
    throw uploadError;
  }

  await saveSetting(settingKey, objectPath);

  if (existingPath && existingPath !== objectPath) {
    await supabase.storage.from(settingsAssetBucket).remove([existingPath]);
  }

  return getAssetPublicUrl(objectPath);
};

export const getPublicCatalog = async (): Promise<PublicCatalog> => {
  const songs = await listSongs({ isPublic: true });
  const metadata = buildCatalogMetadata(songs);
  const settings = await getSettings();

  return {
    streamer: streamerProfile,
    songs,
    tags: metadata.tags,
    languages: metadata.languages,
    statuses: songStatusOptions,
    stats: buildStats(songs, 0),
    settings
  };
};

export const getAdminDashboardData = async (): Promise<AdminDashboardData> => {
  const [songs, requests, settings] = await Promise.all([listSongs(), listRequests(), getSettings()]);

  return {
    streamer: streamerProfile,
    songs,
    requests,
    overview: buildStats(songs, countPendingRequests(requests)),
    settings
  };
};

export const createSongRequest = async ({
  songTitle,
  artist,
  language,
  message,
  requesterName
}: {
  songTitle: string;
  artist: string;
  language: SongLanguage;
  message: string;
  requesterName: string;
}) => {
  const payload: SongRequest = {
    id: randomUUID(),
    songTitle,
    artist,
    language,
    message,
    requesterName: requesterName || null,
    status: 'pending',
    matchedSongId: null,
    createdAt: new Date().toISOString()
  };

  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from('requests').insert({
    id: payload.id,
    song_title: payload.songTitle,
    artist: payload.artist,
    language: payload.language,
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

export const consumeRequestRateLimit = async ({
  clientKey,
  maxRequests,
  windowMs
}: {
  clientKey: string;
  maxRequests: number;
  windowMs: number;
}) => {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc('consume_request_rate_limit', {
    p_client_key: clientKey,
    p_max_requests: maxRequests,
    p_window_seconds: Math.ceil(windowMs / 1000)
  });

  if (error) {
    throw new Error(error.message);
  }

  return data === true;
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
  const payloads: Song[] = songs.map((song) => ({
    id: randomUUID(),
    title: song.title,
    artist: song.artist,
    language: song.language,
    status: song.status,
    tags: sortStrings(song.tags),
    isPublic: song.isPublic
  }));
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from('songs').insert(
    payloads.map((song) => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      language: song.language,
      status: song.status,
      tags: song.tags,
      is_public: song.isPublic
    }))
  );

  if (error) {
    throw error;
  }

  return payloads;
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

  const { error } = await supabase.from('songs').delete().eq('id', id);

  if (error) {
    throw error;
  }
};

export const resetDatabase = async () => {
  const supabase = getSupabaseAdmin();
  const settings = await listSettings(pageSettingsReadKeys);
  const assetPaths = [settings[pageSettingsKeys.avatarPath], settings[pageSettingsKeys.backgroundPath]].filter(Boolean);

  const { error: requestsError } = await supabase.from('requests').delete().not('id', 'is', null);

  if (requestsError) {
    throw requestsError;
  }

  const { error: songsError } = await supabase.from('songs').delete().not('id', 'is', null);

  if (songsError) {
    throw songsError;
  }

  const { error: settingsError } = await supabase.from('settings').upsert(
    pageSettingsReadKeys.map((key) => ({
      key,
      value: pageSettingsDefaults[key]
    }))
  );

  if (settingsError) {
    throw settingsError;
  }

  if (assetPaths.length > 0) {
    const { error: assetsError } = await supabase.storage.from(settingsAssetBucket).remove(assetPaths);

    if (assetsError) {
      throw assetsError;
    }
  }
};

export const updateRequestStatus = async ({
  id,
  status
}: {
  id: string;
  status: RequestDecision;
}) => {
  const supabase = getSupabaseAdmin();
  const { data: requestRow, error: requestError } = await supabase
    .from('requests')
    .select('id, song_title, artist, language, message, requester_name, status, matched_song_id, created_at')
    .eq('id', id)
    .single();

  if (requestError) {
    throw requestError;
  }

  const request = mapRequestRow(requestRow as RequestRow);

  if (request.status !== 'pending') {
    throw new Error('这个愿望已经处理过。');
  }

  if (status === 'accepted') {
    const { error } = await supabase.rpc('accept_song_request', {
      request_id: id
    });

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  const { error } = await supabase.from('requests').update({ status }).eq('id', id);

  if (error) {
    throw error;
  }
};
