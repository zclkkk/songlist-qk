import { randomUUID } from 'node:crypto';

import { defaultBilibiliUrl } from '$lib/config';
import { getSupabaseAdmin, getSupabasePublic } from '$lib/server/supabase';
import type { PageSettings } from '$lib/types';

type SettingRow = {
  key: string;
  value: string;
};

export const settingsAssetBucket = 'site-assets';

export const pageSettingsKeys = {
  avatarPath: 'avatar_path',
  backgroundPath: 'background_path',
  heroTitle: 'hero_title',
  bilibiliUrl: 'bilibili_url'
} as const;

export type PageSettingKey = (typeof pageSettingsKeys)[keyof typeof pageSettingsKeys];

export const pageSettingsReadKeys = Object.values(pageSettingsKeys) as PageSettingKey[];

export const pageSettingsDefaults: Record<PageSettingKey, string> = {
  [pageSettingsKeys.avatarPath]: '',
  [pageSettingsKeys.backgroundPath]: '',
  [pageSettingsKeys.heroTitle]: 'songlist-qk',
  [pageSettingsKeys.bilibiliUrl]: defaultBilibiliUrl
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

const resolveImageExtension = (file: File) => {
  const mapped = imageExtensionByMimeType[file.type];

  if (!mapped) {
    throw new Error('仅支持位图格式（JPG / PNG / WebP / GIF / AVIF）。');
  }

  return mapped;
};

export const listSettings = async (keys: readonly PageSettingKey[]) => {
  const supabase = getSupabasePublic();
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
  settings[key] || pageSettingsDefaults[key];

const readSettingValue = async (key: PageSettingKey) => {
  const settings = await listSettings([key]);

  return getSettingValue(settings, key);
};

const getAssetPublicUrl = (path: string) => {
  if (!path) {
    return '';
  }

  const supabase = getSupabasePublic();

  return supabase.storage.from(settingsAssetBucket).getPublicUrl(path).data.publicUrl;
};

const mapPageSettings = (settings: Record<string, string>): PageSettings => ({
  avatar: getAssetPublicUrl(getSettingValue(settings, pageSettingsKeys.avatarPath)),
  background: getAssetPublicUrl(getSettingValue(settings, pageSettingsKeys.backgroundPath)),
  heroTitle: getSettingValue(settings, pageSettingsKeys.heroTitle),
  bilibiliUrl: getSettingValue(settings, pageSettingsKeys.bilibiliUrl)
});

export const getSettings = async (): Promise<PageSettings> => {
  const settings = await listSettings(pageSettingsReadKeys);

  return mapPageSettings(settings);
};

export const saveSettings = async (entries: Partial<Record<PageSettingKey, string>>) => {
  const rows = Object.entries(entries).map(([key, value]) => ({ key, value: value ?? '' }));
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('settings').upsert(rows);

  if (error) {
    throw error;
  }
};

export const saveSetting = (key: PageSettingKey, value: string) => saveSettings({ [key]: value });

export const saveSettingImage = async (kind: SettingImageKind, file: File) => {
  const supabase = getSupabaseAdmin();

  const settingKey = settingImageKinds[kind];
  const existingPath = await readSettingValue(settingKey);
  const extension = resolveImageExtension(file);
  const objectPath = `profile/${kind}-${Date.now()}-${randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage.from(settingsAssetBucket).upload(objectPath, file, {
    upsert: false,
    cacheControl: '31536000',
    contentType: file.type
  });

  if (uploadError) {
    throw uploadError;
  }

  try {
    await saveSetting(settingKey, objectPath);
  } catch (error) {
    await supabase.storage.from(settingsAssetBucket).remove([objectPath]);
    throw error;
  }

  if (existingPath && existingPath !== objectPath) {
    const { error: removeError } = await supabase.storage.from(settingsAssetBucket).remove([existingPath]);

    if (removeError) {
      console.warn('删除旧设置图片失败：', removeError);
    }
  }

  return getAssetPublicUrl(objectPath);
};
