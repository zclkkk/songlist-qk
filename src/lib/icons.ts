export const icons = {
  'chevron-down': '<path d="m6 9 6 6 6-6" />',
  'chevron-left': '<path d="m15 18-6-6 6-6" />',
  'chevron-right': '<path d="m9 18 6-6-6-6" />',
  close: '<path d="M18 6 6 18" /><path d="m6 6 12 12" />',
  search: '<circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />',
  'search-alt': '<circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />',
  check: '<path d="M20 6 9 17l-5-5" />',
  sun: '<circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />',
  'arrow-down-up': '<path d="m21 16-4 4-4-4" /><path d="M17 20V4" /><path d="m3 8 4-4 4 4" /><path d="M7 4v16" />',
  bilibili:
    '<path d="M7 7h10a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3Z" /><path d="m9 4 2 2" /><path d="m15 4-2 2" /><path d="M10 11v2" /><path d="M14 11v2" />',
  weibo:
    '<path d="M8.5 18.5c-2.8 0-4.8-1.7-4.8-4s2.4-4.4 5.5-4.4c2.8 0 4.7 1.5 4.7 3.7 0 2.6-2.3 4.7-5.4 4.7Z" /><path d="M15.5 6.5c1.9.2 3.3 1.7 3.5 3.6" /><path d="M14.8 3.8c3.1.4 5.6 2.9 6 6" /><circle cx="10.3" cy="14.4" r="1" fill="currentColor" stroke="none" />',
  group:
    '<path d="M16 19v-1a3 3 0 0 0-3-3h-2a3 3 0 0 0-3 3v1" /><circle cx="12" cy="10" r="3" /><path d="M6 19v-0.5a2.5 2.5 0 0 1 1.5-2.3" /><path d="M18 19v-0.5a2.5 2.5 0 0 0-1.5-2.3" /><path d="M7.5 8.5a2.5 2.5 0 1 0-1-4.8" /><path d="M16.5 8.5a2.5 2.5 0 1 1 1-4.8" />'
} as const;

export type IconName = keyof typeof icons;
