import { z } from 'zod';

import { requestStatusOptions, songLanguageOptions, songStatusOptions } from '$lib/types';

const csvToTags = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);

export const requestSchema = z.object({
  songTitle: z.string().trim().min(1, '请填写歌曲名。').max(120, '歌曲名过长。'),
  artist: z.string().trim().max(120, '原唱名称过长。'),
  message: z.string().trim().min(1, '请填写留言。').max(300, '留言请控制在 300 字以内。'),
  requesterName: z.string().trim().max(40, '昵称请控制在 40 字以内。')
});

export const songSchema = z.object({
  id: z.string().trim().optional(),
  title: z.string().trim().min(1, '请填写歌名。').max(120, '歌名过长。'),
  artist: z.string().trim().min(1, '请填写原唱。').max(120, '原唱名称过长。'),
  language: z.enum(songLanguageOptions, {
    errorMap: () => ({ message: '请选择有效语言。' })
  }),
  status: z.enum(songStatusOptions, {
    errorMap: () => ({ message: '请选择有效状态。' })
  }),
  tagsInput: z.string().trim().max(240, '标签内容过长。').transform(csvToTags),
  isPublic: z.boolean()
});

export const playlistImportSettingsSchema = z.object({
  status: z.enum(songStatusOptions, {
    errorMap: () => ({ message: '请选择有效状态。' })
  }),
  tagsInput: z.string().trim().max(240, '标签内容过长。').transform(csvToTags)
});

export const playlistPreviewSchema = playlistImportSettingsSchema.extend({
  playlistInput: z.string().trim().min(1, '请填写网易云公开歌单链接或 ID。').max(240, '歌单链接过长。')
});

export const requestStatusSchema = z.object({
  id: z.string().trim().min(1, '请求 ID 缺失。'),
  status: z.enum(requestStatusOptions, {
    errorMap: () => ({ message: '请选择有效的请求状态。' })
  })
});
