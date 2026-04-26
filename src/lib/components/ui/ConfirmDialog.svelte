<script lang="ts">
  import type { ConfirmationTone } from '$lib/admin/pending.svelte';
  import Icon from '$lib/components/ui/Icon.svelte';
  import { Dialog } from 'bits-ui';

  let {
    open = $bindable(),
    title,
    description = '',
    confirmLabel = '确认',
    cancelLabel = '取消',
    tone = 'default',
    onConfirm
  }: {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: ConfirmationTone;
    onConfirm: () => void;
  } = $props();

  const confirmClass = $derived(
    tone === 'danger' ? 'button button-danger button-small' : 'button button-primary button-small'
  );
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="dialog-overlay" />
    <Dialog.Content class="dialog-content">
      <div class="dialog-header">
        <div>
          <Dialog.Title class="dialog-title">{title}</Dialog.Title>
          {#if description}
            <Dialog.Description class="dialog-description">{description}</Dialog.Description>
          {/if}
        </div>
        <button type="button" class="dialog-close" aria-label="关闭" onclick={() => (open = false)}>
          <Icon name="close" size={18} />
        </button>
      </div>

      <div class="flex flex-wrap justify-end gap-3">
        <button type="button" class="button button-ghost button-small" onclick={() => (open = false)}>
          {cancelLabel}
        </button>
        <button type="button" class={confirmClass} onclick={onConfirm}>{confirmLabel}</button>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
