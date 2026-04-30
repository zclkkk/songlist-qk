import { z } from 'zod';
import { zfd } from 'zod-form-data';

import { pageSettingsSchema, playlistImportSettingsSchema, requestDecisionSchema, songSchema } from '$lib/validators';

const formText = z.string().default('');

export const requestFormValuesSchema = zfd.formData({
  songInput: formText,
  songTitle: formText,
  artist: formText,
  language: formText,
  message: formText,
  requesterName: formText
});

export const songPreviewFormValuesSchema = zfd.formData({
  songInput: formText
});

export const playlistPreviewFormValuesSchema = zfd.formData({
  playlistInput: formText
});

export const songFormSchema = zfd
  .formData({
    id: zfd.text(z.string().optional()),
    title: formText,
    artist: formText,
    language: formText,
    status: formText,
    tagsInput: formText,
    isPublic: zfd.checkbox()
  })
  .pipe(songSchema);

export const deleteSongFormSchema = zfd.formData({
  id: formText.pipe(z.string().trim().min(1, '缺少歌曲 ID。'))
});

export const bulkUpdateSongsFormSchema = zfd
  .formData({
    bulkAction: z.enum(['delete', 'setPublic', 'setPrivate'], {
      error: '未知的批量操作。'
    }),
    id: zfd.repeatableOfType(z.string())
  })
  .transform(({ id, ...data }) => ({
    ...data,
    ids: id.filter(Boolean)
  }));

export const playlistImportFormSchema = zfd.formData({
  status: formText.pipe(playlistImportSettingsSchema.shape.status),
  sourceInput: formText,
  songCount: zfd.numeric(z.number().int().min(0)),
  selectedSong: zfd.repeatableOfType(z.string())
});

export const requestDecisionFormSchema = zfd.formData({
  id: formText.pipe(requestDecisionSchema.shape.id),
  status: formText.pipe(requestDecisionSchema.shape.status)
});

export const profileFormSchema = zfd
  .formData({
    heroTitle: formText,
    bilibiliUrl: formText,
    avatar: zfd.file(z.instanceof(File).optional()),
    background: zfd.file(z.instanceof(File).optional())
  })
  .pipe(
    pageSettingsSchema.extend({
      avatar: z.instanceof(File).optional(),
      background: z.instanceof(File).optional()
    })
  );

export const loginFormSchema = zfd.formData({
  email: formText,
  password: formText
});
