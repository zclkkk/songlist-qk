import { z } from 'zod';

import { requestDecisionOptions, songLanguageOptions, songStatusOptions } from '$lib/types';

const maxTagCount = 8;

const csvToTags = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const tagsInputSchema = z
  .string()
  .trim()
  .max(240, '标签内容过长。')
  .transform(csvToTags)
  .refine((tags) => tags.length <= maxTagCount, `标签最多 ${maxTagCount} 个。`);

export const requestSchema = z.object({
  songTitle: z.string().trim().min(1, '请填写歌曲名。').max(120, '歌曲名过长。'),
  artist: z.string().trim().max(120, '原唱名称过长。'),
  language: z.enum(songLanguageOptions, {
    error: '请选择有效语言。'
  }),
  message: z.string().trim().min(1, '请填写留言。').max(300, '留言请控制在 300 字以内。'),
  requesterName: z
    .string()
    .trim()
    .max(40, '昵称请控制在 40 字以内。')
    .transform((value) => value || null)
});

export const songSchema = z
  .object({
    id: z
      .string()
      .trim()
      .optional()
      .transform((value) => value || undefined),
    title: z.string().trim().min(1, '请填写歌名。').max(120, '歌名过长。'),
    artist: z.string().trim().min(1, '请填写原唱。').max(120, '原唱名称过长。'),
    language: z.enum(songLanguageOptions, {
      error: '请选择有效语言。'
    }),
    status: z.enum(songStatusOptions, {
      error: '请选择有效状态。'
    }),
    tagsInput: tagsInputSchema,
    isPublic: z.boolean()
  })
  .transform(({ tagsInput, ...song }) => ({
    ...song,
    tags: tagsInput
  }));

export const playlistImportSettingsSchema = z.object({
  status: z.enum(songStatusOptions, {
    error: '请选择有效状态。'
  })
});

export const playlistSongImportSchema = z
  .object({
    language: z.enum(songLanguageOptions, {
      error: '请选择有效语言。'
    }),
    tagsInput: tagsInputSchema
  })
  .transform(({ tagsInput, ...song }) => ({
    ...song,
    tags: tagsInput
  }));

export const playlistPreviewSchema = z.object({
  playlistInput: z.string().trim().min(1, '请填写网易云公开歌单链接或 ID。').max(240, '歌单链接过长。')
});

export const songPreviewSchema = z.object({
  songInput: z.string().trim().min(1, '请填写网易云单曲链接或 ID。').max(240, '单曲链接过长。')
});

export const pageSettingsSchema = z.object({
  heroTitle: z.string().trim().min(1, '标题不能为空。').max(40, '标题最多 40 字。'),
  bilibiliUrl: z
    .string()
    .trim()
    .min(1, '请填写 Bilibili 链接。')
    .max(240, 'Bilibili 链接过长。')
    .refine((value) => {
      try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    }, '请填写以 http:// 或 https:// 开头的有效链接。')
});

export const requestDecisionSchema = z.object({
  id: z.string().trim().min(1, '请求 ID 缺失。'),
  status: z.enum(requestDecisionOptions, {
    error: '请选择 Accept 或 Refuse。'
  })
});
