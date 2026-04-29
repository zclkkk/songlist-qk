import { fail, redirect } from '@sveltejs/kit';

import { clearAdminSession } from '$lib/server/auth';
import { getAdminDashboardData, resetDatabase as resetSonglistDatabase } from '$lib/server/catalog';
import { getErrorMessage } from '$lib/server/errors';
import { readBoolean, readText } from '$lib/server/form-utils';
import { fetchNeteasePlaylistSongs, fetchNeteaseSong } from '$lib/server/netease';
import { updateRequestStatus } from '$lib/server/requests';
import { pageSettingsKeys, saveSettingImage, saveSettings } from '$lib/server/settings';
import {
  bulkDeleteSongs,
  bulkSetSongsPublic,
  deleteSong as removeSong,
  importSongs,
  saveSong
} from '$lib/server/songs';
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

const avatarMaxBytes = 2 * 1024 * 1024;
const backgroundMaxBytes = 5 * 1024 * 1024;
const maxPreviewSongCount = 5000;

const readPreviewSongs = (formData: FormData) => {
  const songCount = Number(readText(formData.get('songCount')));

  if (!Number.isInteger(songCount) || songCount < 0) {
    return [];
  }

  if (songCount > maxPreviewSongCount) {
    throw new Error(`单次最多导入 ${maxPreviewSongCount} 首歌曲。`);
  }

  return Array.from({ length: songCount }, (_, index) => ({
    title: readText(formData.get(`songTitle-${index}`)),
    artist: readText(formData.get(`songArtist-${index}`)),
    language: readText(formData.get(`songLanguage-${index}`)),
    tagsInput: readText(formData.get(`songTagsInput-${index}`))
  }));
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
        kind: 'error' as const,
        adminError: parsed.error.issues[0].message
      });
    }

    try {
      await saveSong(parsed.data);
    } catch (error) {
      return fail(500, {
        kind: 'error' as const,
        adminError: getErrorMessage(error)
      });
    }

    return {
      kind: 'success' as const,
      adminMessage: '歌曲信息已保存。'
    };
  },

  deleteSong: async ({ request }) => {
    const formData = await request.formData();
    const id = readText(formData.get('id'));

    if (!id) {
      return fail(400, {
        kind: 'error' as const,
        adminError: '缺少歌曲 ID。'
      });
    }

    try {
      await removeSong(id);
    } catch (error) {
      return fail(500, {
        kind: 'error' as const,
        adminError: getErrorMessage(error)
      });
    }

    return {
      kind: 'success' as const,
      adminMessage: '歌曲已删除。'
    };
  },

  bulkUpdateSongs: async ({ request }) => {
    const formData = await request.formData();
    const bulkAction = readText(formData.get('bulkAction'));
    const ids = formData.getAll('id').map(readText).filter(Boolean);

    if (ids.length === 0) {
      return fail(400, { kind: 'error' as const, adminError: '请至少选择一首歌曲。' });
    }

    try {
      if (bulkAction === 'delete') {
        const count = await bulkDeleteSongs(ids);
        return { kind: 'success' as const, adminMessage: `已删除 ${count} 首歌曲。` };
      }

      if (bulkAction === 'setPublic' || bulkAction === 'setPrivate') {
        const makePublic = bulkAction === 'setPublic';
        const count = await bulkSetSongsPublic(ids, makePublic);
        return {
          kind: 'success' as const,
          adminMessage: `已${makePublic ? '公开' : '隐藏'} ${count} 首歌曲。`
        };
      }

      return fail(400, { kind: 'error' as const, adminError: '未知的批量操作。' });
    } catch (error) {
      return fail(500, { kind: 'error' as const, adminError: getErrorMessage(error) });
    }
  },

  previewPlaylist: async ({ request }) => {
    const formData = await request.formData();
    const playlistInput = readText(formData.get('playlistInput'));
    const parsed = playlistPreviewSchema.safeParse({
      playlistInput
    });

    if (!parsed.success) {
      return fail(400, {
        kind: 'preview-parse-error' as const,
        adminError: parsed.error.issues[0].message,
        playlistImport: { playlistInput }
      });
    }

    try {
      const playlistSongs = await fetchNeteasePlaylistSongs(parsed.data.playlistInput);

      return {
        kind: 'preview-ready' as const,
        adminMessage: `已解析 ${playlistSongs.length} 首歌曲，请勾选要导入的歌曲。`,
        importPreview: {
          sourceInput: parsed.data.playlistInput,
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
        kind: 'preview-parse-error' as const,
        adminError: getErrorMessage(error),
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
        kind: 'preview-parse-error' as const,
        adminError: parsed.error.issues[0].message,
        songImport: { songInput }
      });
    }

    try {
      const song = await fetchNeteaseSong(parsed.data.songInput);

      return {
        kind: 'preview-ready' as const,
        adminMessage: '已解析 1 首歌曲，请确认后导入。',
        importPreview: {
          sourceInput: parsed.data.songInput,
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
        kind: 'preview-parse-error' as const,
        adminError: getErrorMessage(error),
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
        kind: 'error' as const,
        adminError: parsed.error.issues[0].message
      });
    }

    let previewSongs: ReturnType<typeof readPreviewSongs>;

    try {
      previewSongs = readPreviewSongs(formData);
    } catch (error) {
      return fail(400, {
        kind: 'error' as const,
        adminError: getErrorMessage(error)
      });
    }

    const selectedIndexes = new Set(formData.getAll('selectedSong').map(readText));
    const selectedSongs = previewSongs.filter((_, index) => selectedIndexes.has(String(index)));
    const importPreview = {
      sourceInput: readText(formData.get('sourceInput')),
      status: parsed.data.status,
      songs: previewSongs
    };

    if (selectedSongs.length === 0) {
      return fail(400, {
        kind: 'preview-import-error' as const,
        adminError: '请选择至少一首歌。',
        importPreview
      });
    }

    const songsToImport = [];

    for (const song of selectedSongs) {
      const parsedSong = playlistSongImportSchema.safeParse(song);

      if (!parsedSong.success) {
        return fail(400, {
          kind: 'preview-import-error' as const,
          adminError: parsedSong.error.issues[0].message,
          importPreview
        });
      }

      songsToImport.push({
        ...parsedSong.data,
        status: parsed.data.status,
        isPublic: true
      });
    }

    try {
      const importedCount = await importSongs(songsToImport);

      return {
        kind: 'success' as const,
        adminMessage: `已从网易云导入 ${importedCount} 首歌曲。`
      };
    } catch (error) {
      return fail(500, {
        kind: 'preview-import-error' as const,
        adminError: getErrorMessage(error),
        importPreview
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
        kind: 'error' as const,
        adminError: parsed.error.issues[0].message
      });
    }

    try {
      await updateRequestStatus(parsed.data);
    } catch (error) {
      return fail(500, {
        kind: 'error' as const,
        adminError: getErrorMessage(error)
      });
    }

    return {
      kind: 'success' as const,
      adminMessage: '愿望状态已更新。'
    };
  },

  resetDatabase: async () => {
    try {
      await resetSonglistDatabase();
    } catch (error) {
      return fail(500, {
        kind: 'error' as const,
        adminError: getErrorMessage(error)
      });
    }

    return {
      kind: 'success' as const,
      adminMessage: '数据库已恢复到空白初始状态。'
    };
  },

  logout: async ({ cookies }) => {
    clearAdminSession(cookies);
    redirect(303, '/admin/login');
  },

  saveProfile: async ({ request }) => {
    const formData = await request.formData();
    const avatarFile = formData.get('avatar') as File | null;
    const bgFile = formData.get('background') as File | null;
    const heroTitle = readText(formData.get('heroTitle'));
    const bilibiliUrl = readText(formData.get('bilibiliUrl'));
    const hasAvatarFile = avatarFile !== null && avatarFile.size > 0;
    const hasBackgroundFile = bgFile !== null && bgFile.size > 0;

    const parsedSettings = pageSettingsSchema.safeParse({ heroTitle, bilibiliUrl });

    if (!parsedSettings.success) {
      return fail(400, {
        kind: 'profile-error' as const,
        adminError: parsedSettings.error.issues[0].message
      });
    }

    if (hasAvatarFile && avatarFile.size > avatarMaxBytes) {
      return fail(400, { kind: 'profile-error' as const, adminError: '头像文件不能超过 2MB' });
    }

    if (hasBackgroundFile && bgFile.size > backgroundMaxBytes) {
      return fail(400, { kind: 'profile-error' as const, adminError: '背景文件不能超过 5MB' });
    }

    try {
      await saveSettings({
        [pageSettingsKeys.heroTitle]: parsedSettings.data.heroTitle,
        [pageSettingsKeys.bilibiliUrl]: parsedSettings.data.bilibiliUrl
      });

      if (hasAvatarFile) {
        await saveSettingImage('avatar', avatarFile);
      }

      if (hasBackgroundFile) {
        await saveSettingImage('background', bgFile);
      }
    } catch (error) {
      return fail(500, { kind: 'profile-error' as const, adminError: getErrorMessage(error) });
    }

    return { kind: 'success' as const, adminMessage: '页面配置已更新。' };
  }
};
