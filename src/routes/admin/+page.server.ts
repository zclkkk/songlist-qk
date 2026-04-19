import { fail, redirect } from '@sveltejs/kit';

import { clearAdminSession } from '$lib/server/auth';
import { readText } from '$lib/server/form-utils';
import { fetchNeteasePlaylistSongs } from '$lib/server/netease';
import { defaultSongLanguage } from '$lib/types';
import {
	deleteSong as removeSong,
	getAdminDashboardData,
	importSongs,
	resetDatabase as resetSongboardDatabase,
	saveSong,
	updateRequestStatus
} from '$lib/server/repository';
import { playlistImportSettingsSchema, playlistPreviewSchema, requestStatusSchema, songSchema } from '$lib/validators';

import type { Actions, PageServerLoad } from './$types';

const readBoolean = (value: FormDataEntryValue | null) => value === 'on';

const readPreviewSongs = (formData: FormData) => {
  const songCount = Number(readText(formData.get('songCount')));

  if (!Number.isInteger(songCount) || songCount < 0) {
    return [];
  }

  return Array.from({ length: songCount }, (_, index) => ({
    title: readText(formData.get(`songTitle-${index}`)),
    artist: readText(formData.get(`songArtist-${index}`))
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
    const parsed = playlistPreviewSchema.safeParse({
      playlistInput: readText(formData.get('playlistInput')),
      status: readText(formData.get('status')),
      tagsInput: readText(formData.get('tagsInput'))
    });

    if (!parsed.success) {
      return fail(400, {
        adminError: parsed.error.issues[0]?.message ?? '导入歌单失败。'
      });
    }

    try {
      const playlistSongs = await fetchNeteasePlaylistSongs(parsed.data.playlistInput);

      return {
        adminMessage: `已解析 ${playlistSongs.length} 首歌曲，请勾选要导入的歌曲。`,
        playlistPreview: {
          playlistInput: parsed.data.playlistInput,
          status: parsed.data.status,
          tagsInput: parsed.data.tagsInput.join(', '),
          songs: playlistSongs
        }
      };
    } catch (error) {
      return fail(500, {
        adminError: error instanceof Error ? error.message : '解析歌单失败。'
      });
    }
  },

  importPlaylist: async ({ request }) => {
    const formData = await request.formData();
    const tagsInput = readText(formData.get('tagsInput'));
    const parsed = playlistImportSettingsSchema.safeParse({
      status: readText(formData.get('status')),
      tagsInput
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
      tagsInput,
      songs: previewSongs
    };

    if (selectedSongs.length === 0) {
      return fail(400, {
        adminError: '请选择至少一首歌。',
        playlistPreview
      });
    }

    try {
      const importedSongs = await importSongs(
        selectedSongs.map((song) => ({
          title: song.title,
          artist: song.artist,
          language: defaultSongLanguage,
          status: parsed.data.status,
          tags: parsed.data.tagsInput,
          isPublic: true
        }))
      );

      return {
        adminMessage: `已从网易云导入 ${importedSongs.length} 首歌曲。`
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

    const parsed = requestStatusSchema.safeParse(rawValues);

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
      await resetSongboardDatabase();
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
  }
};
