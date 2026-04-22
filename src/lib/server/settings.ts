import { randomUUID } from 'node:crypto';

import { streamerProfile } from '$lib/config';
import { getSupabaseAdmin } from '$lib/server/supabase';
import type { PageSettings } from '$lib/types';

type SettingRow = {
  key: string;
  value: string;
};

export const settingsAssetBucket = 'site-assets';

export const pageSettingsKeys = {
  avatarPath: 'avatar_path',
  backgroundPath: 'background_path',
  heroTitle: 'hero_title'
} as const;

export type PageSettingKey = (typeof pageSettingsKeys)[keyof typeof pageSettingsKeys];

export const pageSettingsReadKeys = Object.values(pageSettingsKeys) as PageSettingKey[];

export const pageSettingsDefaults: Record<PageSettingKey, string> = {
  [pageSettingsKeys.avatarPath]: '',
  [pageSettingsKeys.backgroundPath]: '',
  [pageSettingsKeys.heroTitle]: streamerProfile.name
};

const settingImageKinds = {
  avatar: pageSettingsKeys.avatarPath,
  background: pageSettingsKeys.backgroundPath
} as const;

export type SettingImageKind = keyof typeof settingImageKinds;

const imageExtensionByMimeType: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif'
};

const sanitizeExtension = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const resolveImageExtension = (file: File) => {
  const extensionFromName = sanitizeExtension(file.name.split('.').pop() ?? '');

  if (extensionFromName) {
    return extensionFromName;
  }

  return imageExtensionByMimeType[file.type] ?? 'bin';
};

export const listSettings = async (keys: readonly PageSettingKey[]) => {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('settings').select('key, value').in('key', keys);

  if (error) {
    throw error;
  }

  const settings: Record<string, string> = {};

  for (const row of data as SettingRow[]) {
    settings[row.key] = row.value;
  }

  return settings;
};

const getSettingValue = (settings: Record<string, string>, key: PageSettingKey) =>
  settings[key] ?? pageSettingsDefaults[key];

const readSettingValue = async (key: PageSettingKey) => {
  const settings = await listSettings([key]);

  return getSettingValue(settings, key);
};

const getAssetPublicUrl = (path: string) => {
  if (!path) {
    return '';
  }

  const supabase = getSupabaseAdmin();

  return supabase.storage.from(settingsAssetBucket).getPublicUrl(path).data.publicUrl;
};

const mapPageSettings = (settings: Record<string, string>): PageSettings => ({
  avatar: getAssetPublicUrl(getSettingValue(settings, pageSettingsKeys.avatarPath)),
  background: getAssetPublicUrl(getSettingValue(settings, pageSettingsKeys.backgroundPath)),
  heroTitle: getSettingValue(settings, pageSettingsKeys.heroTitle)
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

  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    throw new Error('仅支持位图格式（JPG / PNG / WebP / GIF / AVIF）。');
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
