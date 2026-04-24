<script lang="ts">
  import { enhance } from '$app/forms';
  import { createLocalPending } from '$lib/admin/pending.svelte';
  import Icon from '$lib/components/ui/Icon.svelte';
  import { Dialog } from 'bits-ui';
  import { onDestroy } from 'svelte';

  import type { PageSettings } from '$lib/types';

  let {
    settings,
    adminError,
    open = $bindable()
  }: {
    settings: PageSettings;
    adminError?: string;
    open: boolean;
  } = $props();

  const createImagePreview = (getDefault: () => string) => {
    let objectUrl = $state('');

    const clear = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = '';
      }
    };

    const onChange = (e: Event) => {
      clear();
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        objectUrl = URL.createObjectURL(file);
      }
    };

    return {
      get preview() {
        return objectUrl || getDefault();
      },
      onChange,
      clear
    };
  };

  const avatarPreview = createImagePreview(() => settings.avatar);
  const backgroundPreview = createImagePreview(() => settings.background);

  onDestroy(() => {
    avatarPreview.clear();
    backgroundPreview.clear();
  });

  const submit = createLocalPending();
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="dialog-overlay" />
    <Dialog.Content class="dialog-content">
      <div class="dialog-header">
        <div>
          <Dialog.Title class="dialog-title">页面设置</Dialog.Title>
          <Dialog.Description class="dialog-description">修改首页主标题、Bilibili 链接、头像和背景图</Dialog.Description
          >
        </div>
        <Dialog.Close class="dialog-close" aria-label="关闭">
          <Icon name="close" size={18} />
        </Dialog.Close>
      </div>

      {#if adminError}
        <div class="alert alert-danger mb-5">{adminError}</div>
      {/if}

      <form
        method="POST"
        action="?/saveProfile"
        enctype="multipart/form-data"
        class="space-y-5"
        use:enhance={submit.enhance}
      >
        <div class="rounded-[20px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] p-4">
          <label class="field-label">
            <span>头像下方主标题</span>
            <input
              name="heroTitle"
              class="form-field"
              required
              maxlength="40"
              value={settings.heroTitle}
              placeholder="例如：青空点歌台"
            />
          </label>
          <p class="mt-2 text-xs text-[var(--color-text-muted)]">最多 40 字，显示在首页头像下方。</p>
        </div>

        <div class="rounded-[20px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] p-4">
          <label class="field-label">
            <span>Bilibili 链接</span>
            <input
              name="bilibiliUrl"
              type="url"
              class="form-field"
              required
              maxlength="240"
              value={settings.bilibiliUrl}
              placeholder="https://space.bilibili.com/... 或直播间链接"
            />
          </label>
          <p class="mt-2 text-xs text-[var(--color-text-muted)]">
            首页按钮会跳转到这里，需以 http:// 或 https:// 开头。
          </p>
        </div>

        <div class="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div class="rounded-[20px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] p-4">
            <label class="field-label">
              <span>主播头像 (建议正方形，不超过 2MB)</span>
              {#if avatarPreview.preview}
                <div class="mt-2 flex justify-center">
                  <div
                    class="h-24 w-24 overflow-hidden rounded-full border-4 border-[var(--color-avatar-ring)] bg-[var(--color-surface-muted)] shadow-sm"
                  >
                    <img src={avatarPreview.preview} alt="头像预览" class="h-full w-full object-cover" />
                  </div>
                </div>
              {/if}
              <input type="file" name="avatar" accept="image/*" class="form-field" onchange={avatarPreview.onChange} />
            </label>
          </div>

          <div class="rounded-[20px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] p-4">
            <label class="field-label">
              <span>背景图片 (建议 1920x1080，不超过 5MB)</span>
              {#if backgroundPreview.preview}
                <div
                  class="mt-2 h-36 w-full overflow-hidden rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)]"
                >
                  <img src={backgroundPreview.preview} alt="背景预览" class="h-full w-full object-cover" />
                </div>
              {/if}
              <input
                type="file"
                name="background"
                accept="image/*"
                class="form-field"
                onchange={backgroundPreview.onChange}
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          class="button button-primary button-full"
          disabled={submit.pending}
          data-pending={submit.pending || undefined}
        >
          保存配置
        </button>
      </form>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
