import type { RequestStatus, SongStatus } from '$lib/types';

export const songStatusClasses: Record<SongStatus, string> = {
  ready: 'text-[var(--color-success-text)]',
  learning: 'text-[var(--color-accent)]',
  resting: 'text-[var(--color-text-secondary)]'
};

export const requestStatusClasses: Record<RequestStatus, string> = {
  pending: 'text-[var(--color-accent)]',
  accepted: 'text-[var(--color-success-text)]',
  refused: 'text-[var(--color-text-secondary)]'
};
