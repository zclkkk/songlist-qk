import { fail, redirect } from '@sveltejs/kit';

import { clearAdminSession } from '$lib/server/auth';
import { getAdminDashboardData, resetDatabase as resetSonglistDatabase } from '$lib/server/catalog';
import { readText } from '$lib/server/form-utils';
import { fetchNeteasePlaylistSongs, fetchNeteaseSong } from '$lib/server/netease';
import { updateRequestStatus } from '$lib/server/requests';
import { pageSettingsKeys, saveSetting, saveSettingImage } from '$lib/server/settings';
import { deleteSong as removeSong, importSongs, saveSong } from '$lib/server/songs';
import {
  pageSettingsSchema,
  playlistImportSettingsSchema,
  playlistPreviewSchema,
  playlistSongImportSchema,
  requestDecisionSchema,
  songPreviewSchema,
  songSchema
} from '$lib/validators';

import type { Actions, PageServerLoad } from './$types';

const readBoolean = (value: FormDataEntryValue | null) => value === 'on';

const readPreviewSongs = (formData: FormData) => {
  const songCount = Number(readText(formData.get('songCount')));

  if (!Number.isInteger(songCount) || songCount < 0) {
    return [];
  }

  return Array.from({ length: songCount }, (_, index) => ({
    title: readText(formData.get(`songTitle-${index}`)),
    artist: readText(formData.get(`songArtist-${index}`)),
    language: readText(formData.get(`songLanguage-${index}`)),
    tagsInput: readText(formData.get(`songTagsInput-${index}`))
  })).filter((song) => song.title && song.artist);
};

export const load: PageServerLoad = async () => ({
  dashboard: await getAdminDashboardData()
});

export const actions: Actions = {
  saveSong: async ({ request }) => {
    const formData = await request.formData();
    const rawValues = {
      id: readText(formData.get('id')),
      title: readText(formData.get('title')),
      artist: readText(formData.get('artist')),
      language: readText(formData.get('language')),
      status: readText(formData.get('status')),
      tagsInput: readText(formData.get('tagsInput')),
      isPublic: readBoolean(formData.get('isPublic'))
    };

    const parsed = songSchema.safeParse(rawValues);

    if (!parsed.success) {
      return fail(400, {
        adminError: parsed.error.issues[0]?.message ?? '保存歌曲失败。'
      });
    }

    try {
      await saveSong({
        id: parsed.data.id || undefined,
        title: parsed.data.title,
        artist: parsed.data.artist,
        language: parsed.data.language,
        status: parsed.data.status,
        tags: parsed.data.tagsInput,
        isPublic: parsed.data.isPublic
      });
    } catch (error) {
      return fail(500, {
        adminError: error instanceof Error ? error.message : '保存歌曲失败。'
      });
    }

    return {
      adminMessage: '歌曲信息已保存。'
    };
  },

  deleteSong: async ({ request }) => {
    const formData = await request.formData();
    const id = readText(formData.get('id'));

    if (!id) {
      return fail(400, {
        adminError: '缺少歌曲 ID。'
      });
    }

    try {
      await removeSong(id);
    } catch (error) {
      return fail(500, {
        adminError: error instanceof Error ? error.message : '删除歌曲失败。'
      });
    }

    return {
      adminMessage: '歌曲已删除。'
    };
  },

  previewPlaylist: async ({ request }) => {
    const formData = await request.formData();
    const playlistInput = readText(formData.get('playlistInput'));
    const parsed = playlistPreviewSchema.safeParse({
      playlistInput
    });

    if (!parsed.success) {
      return fail(400, {
        adminError: parsed.error.issues[0]?.message ?? '导入歌单失败。',
        playlistImport: { playlistInput }
      });
    }

    try {
      const playlistSongs = await fetchNeteasePlaylistSongs(parsed.data.playlistInput);

      return {
        adminMessage: `已解析 ${playlistSongs.length} 首歌曲，请勾选要导入的歌曲。`,
        playlistPreview: {
          playlistInput: parsed.data.playlistInput,
          status: 'ready',
          songs: playlistSongs.map((song) => ({
            ...song,
            language: '其他',
            tagsInput: ''
          }))
        }
      };
    } catch (error) {
      return fail(500, {
        adminError: error instanceof Error ? error.message : '解析歌单失败。',
        playlistImport: { playlistInput: parsed.data.playlistInput }
      });
    }
  },

  previewSong: async ({ request }) => {
    const formData = await request.formData();
    const songInput = readText(formData.get('songInput'));
    const parsed = songPreviewSchema.safeParse({
      songInput
    });

    if (!parsed.success) {
      return fail(400, {
        adminError: parsed.error.issues[0]?.message ?? '导入单曲失败。',
        songImport: { songInput }
      });
    }

    try {
      const song = await fetchNeteaseSong(parsed.data.songInput);

      return {
        adminMessage: '已解析 1 首歌曲，请确认后导入。',
        playlistPreview: {
          playlistInput: parsed.data.songInput,
          status: 'ready',
          songs: [
            {
              ...song,
              language: '其他',
              tagsInput: ''
            }
          ]
        }
      };
    } catch (error) {
      return fail(500, {
        adminError: error instanceof Error ? error.message : '解析单曲失败。',
        songImport: { songInput: parsed.data.songInput }
      });
    }
  },

  importPlaylist: async ({ request }) => {
    const formData = await request.formData();
    const parsed = playlistImportSettingsSchema.safeParse({
      status: readText(formData.get('status'))
    });

    if (!parsed.success) {
      return fail(400, {
        adminError: parsed.error.issues[0]?.message ?? '导入歌单失败。'
      });
    }

    const previewSongs = readPreviewSongs(formData);
    const selectedIndexes = new Set(formData.getAll('selectedSong').map(readText));
    const selectedSongs = previewSongs.filter((_, index) => selectedIndexes.has(String(index)));
    const playlistPreview = {
      playlistInput: readText(formData.get('playlistInput')),
      status: parsed.data.status,
      songs: previewSongs
    };

    if (selectedSongs.length === 0) {
      return fail(400, {
        adminError: '请选择至少一首歌。',
        playlistPreview
      });
    }

    const songsToImport = [];

    for (const song of selectedSongs) {
      const parsedSong = playlistSongImportSchema.safeParse({
        language: song.language,
        tagsInput: song.tagsInput
      });

      if (!parsedSong.success) {
        return fail(400, {
          adminError: parsedSong.error.issues[0]?.message ?? '导入歌单失败。',
          playlistPreview
        });
      }

      songsToImport.push({
        title: song.title,
        artist: song.artist,
        language: parsedSong.data.language,
        status: parsed.data.status,
        tags: parsedSong.data.tagsInput,
        isPublic: true
      });
    }

    try {
      const importedCount = await importSongs(songsToImport);

      return {
        adminMessage: `已从网易云导入 ${importedCount} 首歌曲。`
      };
    } catch (error) {
      return fail(500, {
        adminError: error instanceof Error ? error.message : '导入歌单失败。',
        playlistPreview
      });
    }
  },

  updateRequestStatus: async ({ request }) => {
    const formData = await request.formData();
    const rawValues = {
      id: readText(formData.get('id')),
      status: readText(formData.get('status'))
    };

    const parsed = requestDecisionSchema.safeParse(rawValues);

    if (!parsed.success) {
      return fail(400, {
        adminError: parsed.error.issues[0]?.message ?? '更新愿望状态失败。'
      });
    }

    try {
      await updateRequestStatus(parsed.data);
    } catch (error) {
      return fail(500, {
        adminError: error instanceof Error ? error.message : '更新愿望状态失败。'
      });
    }

    return {
      adminMessage: '愿望状态已更新。'
    };
  },

  resetDatabase: async () => {
    try {
      await resetSonglistDatabase();
    } catch (error) {
      return fail(500, {
        adminError: error instanceof Error ? error.message : '重置数据库失败。'
      });
    }

    return {
      adminMessage: '数据库已恢复到空白初始状态。'
    };
  },

  logout: async ({ cookies }) => {
    clearAdminSession(cookies);
    throw redirect(303, '/admin/login');
  },

  saveProfile: async ({ request }) => {
    const formData = await request.formData();
    const avatarFile = formData.get('avatar') as File | null;
    const bgFile = formData.get('background') as File | null;
    const heroTitle = readText(formData.get('heroTitle'));
    const hasAvatarFile = avatarFile !== null && avatarFile.size > 0;
    const hasBackgroundFile = bgFile !== null && bgFile.size > 0;

    try {
      const parsedSettings = pageSettingsSchema.safeParse({
        heroTitle
      });

      if (!parsedSettings.success) {
        return fail(400, {
          adminError: parsedSettings.error.issues[0]?.message ?? '保存配置失败。',
          settingsModalOpen: true
        });
      }

      if (hasAvatarFile && avatarFile.size > 1024 * 1024 * 2) {
        return fail(400, { adminError: '头像文件不能超过 2MB', settingsModalOpen: true });
      }

      if (hasBackgroundFile && bgFile.size > 1024 * 1024 * 5) {
        return fail(400, { adminError: '背景文件不能超过 5MB', settingsModalOpen: true });
      }

      await saveSetting(pageSettingsKeys.heroTitle, parsedSettings.data.heroTitle);

      if (hasAvatarFile) {
        await saveSettingImage('avatar', avatarFile);
      }

      if (hasBackgroundFile) {
        await saveSettingImage('background', bgFile);
      }

      return { adminMessage: '页面配置已更新。' };
    } catch (error) {
      return fail(500, { adminError: error instanceof Error ? error.message : '保存配置失败。', settingsModalOpen: true });
    }
  }
};
