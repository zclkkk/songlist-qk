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
  'arrow-down-up': '<path d="m21 16-4 4-4-4" /><path d="M17 20V4" /><path d="m3 8 4-4 4 4" /><path d="M7 4v16" />'
} as const;

export type IconName = keyof typeof icons;
