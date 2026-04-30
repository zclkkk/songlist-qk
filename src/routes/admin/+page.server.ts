import { fail, redirect } from '@sveltejs/kit';

import { clearAdminSession } from '$lib/server/auth';
import { getAdminDashboardData, resetDatabase as resetSonglistDatabase } from '$lib/server/catalog';
import { getErrorMessage, getValidationMessage } from '$lib/server/errors';
import {
  bulkUpdateSongsFormSchema,
  deleteSongFormSchema,
  playlistImportFormSchema,
  playlistPreviewFormValuesSchema,
  profileFormSchema,
  requestDecisionFormSchema,
  songFormSchema,
  songPreviewFormValuesSchema
} from '$lib/server/form-schemas';
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
import { playlistPreviewSchema, playlistSongImportSchema, songPreviewSchema } from '$lib/validators';

import type { Actions, PageServerLoad } from './$types';

const avatarMaxBytes = 2 * 1024 * 1024;
const backgroundMaxBytes = 5 * 1024 * 1024;
const maxPreviewSongCount = 5000;

const readFormText = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
};

const readPreviewSongs = (formData: FormData, songCount: number) =>
  Array.from({ length: songCount }, (_, index) => ({
    title: readFormText(formData, `songTitle-${index}`),
    artist: readFormText(formData, `songArtist-${index}`),
    language: readFormText(formData, `songLanguage-${index}`),
    tagsInput: readFormText(formData, `songTagsInput-${index}`)
  }));

export const load: PageServerLoad = async () => ({
  dashboard: await getAdminDashboardData()
});

export const actions: Actions = {
  saveSong: async ({ request }) => {
    const parsed = songFormSchema.safeParse(await request.formData());

    if (!parsed.success) {
      return fail(400, {
        kind: 'error' as const,
        adminError: getValidationMessage(parsed.error)
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
    const parsed = deleteSongFormSchema.safeParse(await request.formData());

    if (!parsed.success) {
      return fail(400, {
        kind: 'error' as const,
        adminError: getValidationMessage(parsed.error)
      });
    }

    try {
      await removeSong(parsed.data.id);
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
    const parsed = bulkUpdateSongsFormSchema.safeParse(await request.formData());

    if (!parsed.success) {
      return fail(400, { kind: 'error' as const, adminError: getValidationMessage(parsed.error) });
    }

    const { bulkAction, ids } = parsed.data;

    if (ids.length === 0) {
      return fail(400, { kind: 'error' as const, adminError: '请至少选择一首歌曲。' });
    }

    try {
      if (bulkAction === 'delete') {
        const count = await bulkDeleteSongs(ids);
        return { kind: 'success' as const, adminMessage: `已删除 ${count} 首歌曲。` };
      }

      const makePublic = bulkAction === 'setPublic';
      const count = await bulkSetSongsPublic(ids, makePublic);
      return {
        kind: 'success' as const,
        adminMessage: `已${makePublic ? '公开' : '隐藏'} ${count} 首歌曲。`
      };
    } catch (error) {
      return fail(500, { kind: 'error' as const, adminError: getErrorMessage(error) });
    }
  },

  previewPlaylist: async ({ request }) => {
    const formData = await request.formData();
    const values = playlistPreviewFormValuesSchema.parse(formData);
    const parsed = playlistPreviewSchema.safeParse(values);

    if (!parsed.success) {
      return fail(400, {
        kind: 'preview-parse-error' as const,
        adminError: getValidationMessage(parsed.error),
        playlistImport: values
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
        playlistImport: values
      });
    }
  },

  previewSong: async ({ request }) => {
    const formData = await request.formData();
    const values = songPreviewFormValuesSchema.parse(formData);
    const parsed = songPreviewSchema.safeParse(values);

    if (!parsed.success) {
      return fail(400, {
        kind: 'preview-parse-error' as const,
        adminError: getValidationMessage(parsed.error),
        songImport: values
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
        songImport: values
      });
    }
  },

  importPlaylist: async ({ request }) => {
    const formData = await request.formData();
    const parsed = playlistImportFormSchema.safeParse(formData);

    if (!parsed.success) {
      return fail(400, {
        kind: 'error' as const,
        adminError: getValidationMessage(parsed.error)
      });
    }

    if (parsed.data.songCount > maxPreviewSongCount) {
      return fail(400, {
        kind: 'error' as const,
        adminError: `单次最多导入 ${maxPreviewSongCount} 首歌曲。`
      });
    }

    const previewSongs = readPreviewSongs(formData, parsed.data.songCount);
    const selectedIndexes = new Set(parsed.data.selectedSong);
    const selectedSongs = previewSongs.filter((_, index) => selectedIndexes.has(String(index)));
    const importPreview = {
      sourceInput: parsed.data.sourceInput,
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
          adminError: getValidationMessage(parsedSong.error),
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
    const parsed = requestDecisionFormSchema.safeParse(await request.formData());

    if (!parsed.success) {
      return fail(400, {
        kind: 'error' as const,
        adminError: getValidationMessage(parsed.error)
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
    const parsed = profileFormSchema.safeParse(await request.formData());

    if (!parsed.success) {
      return fail(400, {
        kind: 'profile-error' as const,
        adminError: getValidationMessage(parsed.error)
      });
    }

    const { avatar: avatarFile, background: bgFile, heroTitle, bilibiliUrl } = parsed.data;
    const hasAvatarFile = avatarFile !== undefined;
    const hasBackgroundFile = bgFile !== undefined;

    if (hasAvatarFile && avatarFile.size > avatarMaxBytes) {
      return fail(400, { kind: 'profile-error' as const, adminError: '头像文件不能超过 2MB' });
    }

    if (hasBackgroundFile && bgFile.size > backgroundMaxBytes) {
      return fail(400, { kind: 'profile-error' as const, adminError: '背景文件不能超过 5MB' });
    }

    try {
      await saveSettings({
        [pageSettingsKeys.heroTitle]: heroTitle,
        [pageSettingsKeys.bilibiliUrl]: bilibiliUrl
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
