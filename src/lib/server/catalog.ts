import { collectTags, listPublicSongs, listSongs } from '$lib/server/songs';
import { countPendingRequests, listRequests } from '$lib/server/requests';
import {
  getSettings,
  listSettings,
  pageSettingsDefaults,
  pageSettingsKeys,
  pageSettingsReadKeys,
  settingsAssetBucket
} from '$lib/server/settings';
import { supabaseAdmin } from '$lib/server/supabase';
import { type AdminDashboardData, type PublicCatalog } from '$lib/types';

export const getPublicCatalog = async (): Promise<PublicCatalog> => {
  const [songs, settings] = await Promise.all([listPublicSongs(), getSettings()]);

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
  const settings = await listSettings(pageSettingsReadKeys);
  const assetPaths = [settings[pageSettingsKeys.avatarPath], settings[pageSettingsKeys.backgroundPath]].filter(Boolean);

  const { error } = await supabaseAdmin.rpc('reset_admin_data', { p_settings: pageSettingsDefaults });

  if (error) {
    throw error;
  }

  if (assetPaths.length > 0) {
    const { error: assetsError } = await supabaseAdmin.storage.from(settingsAssetBucket).remove(assetPaths);

    if (assetsError) {
      throw assetsError;
    }
  }
};
