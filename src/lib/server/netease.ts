type NeteaseApi = {
  playlist_detail?: (params: { id: string }) => Promise<NeteasePlaylistResponse>;
  song_detail?: (params: { ids: string }) => Promise<NeteaseSongResponse>;
  default?: {
    playlist_detail?: (params: { id: string }) => Promise<NeteasePlaylistResponse>;
    song_detail?: (params: { ids: string }) => Promise<NeteaseSongResponse>;
  };
};

type NeteaseArtist = {
  name?: unknown;
};

type NeteaseTrack = {
  name?: unknown;
  ar?: NeteaseArtist[];
  artists?: NeteaseArtist[];
};

type NeteasePlaylistResponse = {
  body?: {
    code?: number;
    playlist?: {
      tracks?: NeteaseTrack[];
    };
  };
};

type NeteaseSongResponse = {
  body?: {
    code?: number;
    songs?: NeteaseTrack[];
  };
};

export type NeteasePlaylistSong = {
  title: string;
  artist: string;
};

const getNeteaseApi = async () => (await import('@neteasecloudmusicapienhanced/api')) as NeteaseApi;

const extractNeteaseId = (value: string, pathName: string, errorMessage: string) => {
  const trimmed = value.trim();

  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  const idFromQuery = trimmed.match(/[?&]id=(\d+)/)?.[1];

  if (idFromQuery) {
    return idFromQuery;
  }

  const idFromPath = trimmed.match(new RegExp(`${pathName}/(\\d+)`))?.[1];

  if (idFromPath) {
    return idFromPath;
  }

  throw new Error(errorMessage);
};

const extractPlaylistId = (value: string) => extractNeteaseId(value, 'playlist', '请填写有效的网易云公开歌单链接或 ID。');

const extractSongId = (value: string) => extractNeteaseId(value, 'song', '请填写有效的网易云单曲链接或 ID。');

const getArtistName = (artist: NeteaseArtist) => (typeof artist.name === 'string' ? artist.name.trim() : '');

const mapTrack = (track: NeteaseTrack): NeteasePlaylistSong | null => {
  const title = typeof track.name === 'string' ? track.name.trim() : '';
  const artists = (track.ar ?? track.artists ?? []).map(getArtistName).filter(Boolean);

  if (!title || artists.length === 0) {
    return null;
  }

  return {
    title,
    artist: artists.join(' / ')
  };
};

export const fetchNeteasePlaylistSongs = async (playlistInput: string) => {
  const playlistId = extractPlaylistId(playlistInput);
  const api = await getNeteaseApi();
  const playlistDetail = api.playlist_detail ?? api.default?.playlist_detail;

  if (!playlistDetail) {
    throw new Error('网易云歌单解析器不可用。');
  }

  const response = await playlistDetail({ id: playlistId });
  const tracks = response.body?.playlist?.tracks;

  if (response.body?.code !== 200 || !Array.isArray(tracks)) {
    throw new Error('读取网易云公开歌单失败。');
  }

  const songs = tracks.map(mapTrack).filter((song): song is NeteasePlaylistSong => song !== null);

  if (songs.length === 0) {
    throw new Error('这个歌单没有可导入的歌曲。');
  }

  return songs;
};

export const fetchNeteaseSong = async (songInput: string) => {
  const songId = extractSongId(songInput);
  const api = await getNeteaseApi();
  const songDetail = api.song_detail ?? api.default?.song_detail;

  if (!songDetail) {
    throw new Error('网易云单曲解析器不可用。');
  }

  const response = await songDetail({ ids: songId });
  const song = mapTrack(response.body?.songs?.[0] ?? {});

  if (response.body?.code !== 200 || song === null) {
    throw new Error('读取网易云单曲失败。');
  }

  return song;
};
