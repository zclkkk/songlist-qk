import {
  requestDecisionOptions,
  requestStatusLabels,
  songLanguageOptions,
  songStatusLabels,
  songStatusOptions
} from '$lib/types';

export const songLanguageItems = songLanguageOptions.map((value) => ({ value, label: value }));
export const songStatusItems = songStatusOptions.map((value) => ({ value, label: songStatusLabels[value] }));
export const requestDecisionItems = requestDecisionOptions.map((value) => ({
  value,
  label: requestStatusLabels[value]
}));

export const allSongLanguageItems = [{ value: 'all', label: '全部语言' }, ...songLanguageItems];
export const allSongStatusItems = [{ value: 'all', label: '全部状态' }, ...songStatusItems];

export const createTagItems = (tags: string[]) => [
  { value: 'all', label: '全部标签' },
  ...tags.map((value) => ({ value, label: value }))
];
