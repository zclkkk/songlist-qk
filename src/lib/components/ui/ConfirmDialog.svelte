<script lang="ts">
  import type { ConfirmationTone } from '$lib/admin/pending.svelte';
  import Icon from '$lib/components/ui/Icon.svelte';
  import { AlertDialog } from 'bits-ui';

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

<AlertDialog.Root bind:open>
  <AlertDialog.Portal>
    <AlertDialog.Overlay class="dialog-overlay" />
    <AlertDialog.Content class="dialog-content">
      <div class="dialog-header">
        <div>
          <AlertDialog.Title class="dialog-title">{title}</AlertDialog.Title>
          {#if description}
            <AlertDialog.Description class="dialog-description">{description}</AlertDialog.Description>
          {/if}
        </div>
        <AlertDialog.Cancel class="dialog-close" aria-label="关闭">
          <Icon name="close" size={18} />
        </AlertDialog.Cancel>
      </div>

      <div class="flex flex-wrap justify-end gap-3">
        <AlertDialog.Cancel class="button button-ghost button-small">
          {cancelLabel}
        </AlertDialog.Cancel>
        <AlertDialog.Action type="button" class={confirmClass} onclick={onConfirm}>{confirmLabel}</AlertDialog.Action>
      </div>
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>
