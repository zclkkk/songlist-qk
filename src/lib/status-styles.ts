import type { RequestStatus, SongStatus } from '$lib/types';

export const songStatusClasses: Record<SongStatus, string> = {
  ready: 'border-[#10b981]/30 bg-[#10b981]/10 text-[var(--color-success-text)]',
  learning: 'border-[#7170ff]/30 bg-[#7170ff]/10 text-[var(--color-accent)]',
  resting: 'border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]'
};

export const requestStatusClasses: Record<RequestStatus, string> = {
  pending: 'border-[#5e6ad2]/30 bg-[#5e6ad2]/10 text-[var(--color-accent)]',
  accepted: 'border-[#10b981]/30 bg-[#10b981]/10 text-[var(--color-success-text)]',
  refused: 'border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]'
};
