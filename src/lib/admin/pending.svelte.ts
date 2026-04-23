import { SvelteSet } from 'svelte/reactivity';

import type { SubmitFunction } from '@sveltejs/kit';

export type BeforeHook = () => boolean;

export const pendingActions = new SvelteSet<string>();

export const isPending = (key: string) => pendingActions.has(key);

export const pendingEnhance =
  (key: string, before?: BeforeHook): SubmitFunction =>
  (input) => {
    if (before && before() === false) {
      input.cancel();
      return;
    }
    pendingActions.add(key);
    return async ({ update }) => {
      try {
        await update();
      } finally {
        pendingActions.delete(key);
      }
    };
  };

export const confirmBefore =
  (message: string): BeforeHook =>
  () =>
    confirm(message);

export function createLocalPending() {
  let pending = $state(false);
  const enhance: SubmitFunction = () => {
    pending = true;
    return async ({ update }) => {
      try {
        await update();
      } finally {
        pending = false;
      }
    };
  };
  return {
    get pending() {
      return pending;
    },
    enhance
  };
}
