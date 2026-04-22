import { parseEnum } from '$lib/server/form-utils';
import { getSupabaseAdmin } from '$lib/server/supabase';
import {
  requestStatusOptions,
  songLanguageOptions,
  type RequestDecision,
  type SongLanguage,
  type SongRequest
} from '$lib/types';

type RequestRow = {
  id: string;
  song_title: string;
  artist: string;
  language: string;
  message: string;
  requester_name: string | null;
  status: string;
  matched_song_id: string | null;
  created_at: string;
};

const mapRequestRow = (row: RequestRow): SongRequest => ({
  id: row.id,
  songTitle: row.song_title,
  artist: row.artist,
  language: parseEnum(row.language, songLanguageOptions, 'song language'),
  message: row.message,
  requesterName: row.requester_name,
  status: parseEnum(row.status, requestStatusOptions, 'request status'),
  matchedSongId: row.matched_song_id,
  createdAt: row.created_at
});

export const listRequests = async (): Promise<SongRequest[]> => {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('requests')
    .select('id, song_title, artist, language, message, requester_name, status, matched_song_id, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as RequestRow[]).map(mapRequestRow);
};

export const createSongRequest = async ({
  songTitle,
  artist,
  language,
  message,
  requesterName
}: {
  songTitle: string;
  artist: string;
  language: SongLanguage;
  message: string;
  requesterName: string | null;
}) => {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from('requests').insert({
    song_title: songTitle,
    artist,
    language,
    message,
    requester_name: requesterName
  });

  if (error) {
    throw error;
  }
};

export const updateRequestStatus = async ({ id, status }: { id: string; status: RequestDecision }) => {
  const supabase = getSupabaseAdmin();

  if (status === 'accepted') {
    const { error } = await supabase.rpc('accept_song_request', {
      request_id: id
    });

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  const { count, error } = await supabase
    .from('requests')
    .update({ status }, { count: 'exact' })
    .eq('id', id)
    .eq('status', 'pending');

  if (error) {
    throw error;
  }

  if (count === 0) {
    throw new Error('这个愿望已经处理过。');
  }
};

export const countPendingRequests = (requests: SongRequest[]) =>
  requests.filter((item) => item.status === 'pending').length;
