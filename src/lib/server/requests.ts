import type { Database } from '$lib/server/database.types';
import { UserFacingError } from '$lib/server/errors';
import { supabaseAdmin, supabasePublic } from '$lib/server/supabase';
import { type RequestDecision, type RequestStatus, type SongLanguage, type SongRequest } from '$lib/types';

type RequestRow = Pick<
  Database['public']['Tables']['requests']['Row'],
  | 'id'
  | 'song_title'
  | 'artist'
  | 'language'
  | 'message'
  | 'requester_name'
  | 'status'
  | 'matched_song_id'
  | 'created_at'
>;

const mapRequestRow = (row: RequestRow): SongRequest => ({
  id: row.id,
  songTitle: row.song_title,
  artist: row.artist,
  language: row.language as SongLanguage,
  message: row.message,
  requesterName: row.requester_name,
  status: row.status as RequestStatus,
  matchedSongId: row.matched_song_id,
  createdAt: row.created_at
});

export const listRequests = async (): Promise<SongRequest[]> => {
  const { data, error } = await supabaseAdmin
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
  const { error } = await supabasePublic.from('requests').insert({
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
  const supabase = supabaseAdmin;

  if (status === 'accepted') {
    const { error } = await supabase.rpc('accept_song_request', {
      request_id: id
    });

    if (error) {
      if (error.code === 'P0001') {
        throw new UserFacingError(error.message);
      }

      throw error;
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
    throw new UserFacingError('这个愿望已经处理过。');
  }
};

export const countPendingRequests = (requests: SongRequest[]) =>
  requests.filter((item) => item.status === 'pending').length;
