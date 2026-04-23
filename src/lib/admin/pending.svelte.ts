import { SvelteSet } from 'svelte/reactivity';

import type { SubmitFunction } from '@sveltejs/kit';

export type BeforeHook = (input: Parameters<SubmitFunction>[0]) => boolean;

export const pendingActions = new SvelteSet<string>();

export const isPending = (key: string) => pendingActions.has(key);

export const pendingEnhance =
  (key: string, before?: BeforeHook): SubmitFunction =>
  (input) => {
    if (before && before(input) === false) return;
    pendingActions.add(key);
    return async ({ update }) => {
      await update();
      pendingActions.delete(key);
    };
  };

export const confirmBefore =
  (message: string): BeforeHook =>
  ({ cancel }) => {
    if (!confirm(message)) {
      cancel();
      return false;
    }
    return true;
  };

export function createLocalPending() {
  let pending = $state(false);
  const enhance: SubmitFunction = () => {
    pending = true;
    return async ({ update }) => {
      await update();
      pending = false;
    };
  };
  return {
    get pending() {
      return pending;
    },
    enhance
  };
}
