import { createHash } from 'node:crypto';

import { fail } from '@sveltejs/kit';

import { readText } from '$lib/server/form-utils';
import { fetchNeteaseSong } from '$lib/server/netease';
import { getPublicCatalog } from '$lib/server/catalog';
import { consumeRequestRateLimit } from '$lib/server/rate-limit';
import { createSongRequest } from '$lib/server/requests';
import { requestSchema, songPreviewSchema } from '$lib/validators';

import type { Actions, PageServerLoad } from './$types';
const requestWindowMs = 10 * 60 * 1000;
const maxRequestsPerWindow = 5;

const readRequestValues = (formData: FormData) => ({
  songInput: readText(formData.get('songInput')),
  songTitle: readText(formData.get('songTitle')),
  artist: readText(formData.get('artist')),
  language: readText(formData.get('language')),
  message: readText(formData.get('message')),
  requesterName: readText(formData.get('requesterName'))
});

const createRateLimitKey = (clientId: string) => createHash('sha256').update(clientId).digest('hex');

export const load: PageServerLoad = async () => ({
  catalog: await getPublicCatalog()
});

export const actions: Actions = {
  parseRequestSong: async ({ request }) => {
    const formData = await request.formData();
    const rawValues = readRequestValues(formData);
    const parsed = songPreviewSchema.safeParse({
      songInput: rawValues.songInput
    });

    if (!parsed.success) {
      return fail(400, {
        requestError: parsed.error.issues[0]?.message ?? '解析单曲失败。',
        requestValues: rawValues
      });
    }

    try {
      const song = await fetchNeteaseSong(parsed.data.songInput);

      return {
        requestMessage: '已解析单曲，可补充留言后提交。',
        requestValues: {
          ...rawValues,
          songInput: parsed.data.songInput,
          songTitle: song.title,
          artist: song.artist
        }
      };
    } catch (error) {
      return fail(500, {
        requestError: error instanceof Error ? error.message : '解析单曲失败。',
        requestValues: rawValues
      });
    }
  },

  submitRequest: async ({ request, getClientAddress }) => {
    const formData = await request.formData();
    const rawValues = readRequestValues(formData);

    const parsed = requestSchema.safeParse(rawValues);

    if (!parsed.success) {
      return fail(400, {
        requestError: parsed.error.issues[0]?.message ?? '提交愿望失败。',
        requestValues: rawValues
      });
    }

    if (
      !(await consumeRequestRateLimit({
        clientKey: createRateLimitKey(getClientAddress()),
        maxRequests: maxRequestsPerWindow,
        windowMs: requestWindowMs
      }))
    ) {
      return fail(429, {
        requestError: '提交过于频繁，请稍后再试。',
        requestValues: rawValues
      });
    }

    try {
      await createSongRequest(parsed.data);
    } catch (error) {
      return fail(500, {
        requestError: error instanceof Error ? error.message : '提交愿望失败。',
        requestValues: rawValues
      });
    }

    return {
      requestMessage: '愿望已提交，主播稍后会在后台处理。',
      requestValues: {
        songInput: '',
        songTitle: '',
        artist: '',
        language: '其他',
        message: '',
        requesterName: ''
      }
    };
  }
};
