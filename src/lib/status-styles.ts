import type { RequestStatus, SongStatus } from '$lib/types';

export const songStatusClasses: Record<SongStatus, string> = {
  ready: 'border-[var(--color-success-border)] bg-[var(--color-success-bg)] text-[var(--color-success-text)]',
  learning: 'border-[var(--color-accent-border-soft)] bg-[var(--color-accent-bg-soft)] text-[var(--color-accent)]',
  resting: 'border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]'
};

export const requestStatusClasses: Record<RequestStatus, string> = {
  pending: 'border-[var(--color-accent-border-soft)] bg-[var(--color-accent-bg-soft)] text-[var(--color-accent)]',
  accepted: 'border-[var(--color-success-border)] bg-[var(--color-success-bg)] text-[var(--color-success-text)]',
  refused: 'border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]'
};
