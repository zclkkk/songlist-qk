import { SvelteSet } from 'svelte/reactivity';

import type { SubmitFunction } from '@sveltejs/kit';

type SubmitInput = Parameters<SubmitFunction>[0];
type UpdateOptions = { reset?: boolean; invalidateAll?: boolean };

export type BeforeHook = (input: SubmitInput) => boolean;
export type ConfirmationTone = 'default' | 'danger';

type ConfirmationOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  tone?: ConfirmationTone;
};

type ConfirmationOptionsResolver = ConfirmationOptions | (() => ConfirmationOptions);

export const pendingActions = new SvelteSet<string>();

export const isPending = (key: string) => pendingActions.has(key);

type PendingMarker = {
  start: () => void;
  stop: () => void;
};

const wrapPendingSubmit =
  ({ start, stop }: PendingMarker, before?: BeforeHook, updateOptions?: UpdateOptions): SubmitFunction =>
  (input) => {
    if (before && before(input) === false) {
      input.cancel();
      return;
    }
    start();
    return async ({ update }) => {
      try {
        await update(updateOptions);
      } finally {
        stop();
      }
    };
  };

export const pendingEnhance = (key: string, before?: BeforeHook): SubmitFunction =>
  wrapPendingSubmit(
    {
      start: () => pendingActions.add(key),
      stop: () => pendingActions.delete(key)
    },
    before
  );

export function createSubmitConfirmation() {
  let open = $state(false);
  let title = $state('');
  let description = $state('');
  let confirmLabel = $state('确认');
  let tone = $state<ConfirmationTone>('default');
  let pendingInput: SubmitInput | null = null;
  let confirmedForm: HTMLFormElement | null = null;

  const resolveOptions = (options: ConfirmationOptionsResolver) =>
    typeof options === 'function' ? options() : options;

  const close = () => {
    open = false;
    pendingInput = null;
  };

  const before = (options: ConfirmationOptionsResolver): BeforeHook => {
    return (input) => {
      if (confirmedForm === input.formElement) {
        confirmedForm = null;
        return true;
      }

      const resolved = resolveOptions(options);
      title = resolved.title;
      description = resolved.description ?? '';
      confirmLabel = resolved.confirmLabel ?? '确认';
      tone = resolved.tone ?? 'default';
      pendingInput = input;
      open = true;

      return false;
    };
  };

  const confirm = () => {
    if (!pendingInput) {
      return;
    }

    const { formElement, submitter } = pendingInput;

    confirmedForm = formElement;
    close();

    if (submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement) {
      formElement.requestSubmit(submitter);
      return;
    }

    formElement.requestSubmit();
  };

  return {
    get open() {
      return open;
    },
    set open(value: boolean) {
      open = value;
      if (!value) {
        pendingInput = null;
      }
    },
    get title() {
      return title;
    },
    get description() {
      return description;
    },
    get confirmLabel() {
      return confirmLabel;
    },
    get tone() {
      return tone;
    },
    before,
    confirm,
    close
  };
}

export function createLocalPending(updateOptions?: UpdateOptions) {
  let pending = $state(false);
  const enhance = wrapPendingSubmit(
    {
      start: () => {
        pending = true;
      },
      stop: () => {
        pending = false;
      }
    },
    undefined,
    updateOptions
  );
  return {
    get pending() {
      return pending;
    },
    enhance
  };
}
