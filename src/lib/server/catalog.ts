import { collectTags, listSongs } from '$lib/server/songs';
import { countPendingRequests, listRequests } from '$lib/server/requests';
import {
  getSettings,
  listSettings,
  pageSettingsDefaults,
  pageSettingsKeys,
  pageSettingsReadKeys,
  settingsAssetBucket
} from '$lib/server/settings';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { type AdminDashboardData, type PublicCatalog } from '$lib/types';

export const getPublicCatalog = async (): Promise<PublicCatalog> => {
  const songs = await listSongs({ isPublic: true });
  const settings = await getSettings();

  return {
    songs,
    tags: collectTags(songs),
    settings
  };
};

export const getAdminDashboardData = async (): Promise<AdminDashboardData> => {
  const [songs, requests, settings] = await Promise.all([listSongs(), listRequests(), getSettings()]);

  return {
    songs,
    requests,
    overview: {
      totalSongs: songs.length,
      publicSongs: songs.filter((song) => song.isPublic).length,
      pendingRequests: countPendingRequests(requests)
    },
    settings
  };
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
