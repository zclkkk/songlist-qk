import type { Song } from '$lib/types';

/**
 * Case-insensitive fuzzy match across title, artist and tags.
 * Empty keyword always matches.
 */
export const matchesSongKeyword = (song: Song, keyword: string): boolean => {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return true;
  return [song.title, song.artist, ...song.tags].some((v) => v.toLowerCase().includes(kw));
};
