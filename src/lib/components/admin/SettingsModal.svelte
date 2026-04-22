<script lang="ts">
  import { onDestroy, untrack } from 'svelte';

  import type { PageSettings } from '$lib/types';

  let {
    settings,
    adminError,
    onClose
  }: {
    settings: PageSettings;
    adminError?: string;
    onClose: () => void;
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

  let heroTitleInput = $state(untrack(() => settings.heroTitle));

  onDestroy(() => {
    avatarPreview.clear();
    backgroundPreview.clear();
  });
</script>

<div class="fixed inset-0 z-50 overflow-y-auto bg-[#191a1b]/50 px-4 py-8">
  <section class="mx-auto max-w-3xl rounded-[24px] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6 shadow-xl lg:p-7">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-[var(--color-accent)]">外观</p>
        <h2 class="mt-1 text-2xl font-semibold text-[var(--color-text)]">自定义页面设置</h2>
        <p class="mt-2 text-sm text-[var(--color-text-secondary)]">修改首页主标题、头像和背景图。</p>
      </div>

      <button
        type="button"
        class="button button-neutral button-small"
        onclick={onClose}
      >
        关闭
      </button>
    </div>

    {#if adminError}
      <div class="mt-5 rounded-[18px] border border-[#7170ff]/30 bg-[#7170ff]/10 px-4 py-3 text-sm text-[var(--color-accent)]">
        {adminError}
      </div>
    {/if}

    <form method="POST" action="?/saveProfile" enctype="multipart/form-data" class="mt-6 space-y-6">
      <div class="rounded-[20px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] p-4">
        <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
          <span>头像下方主标题</span>
          <input
            name="heroTitle"
            class="form-field"
            required
            maxlength="40"
            bind:value={heroTitleInput}
            placeholder="例如：青空点歌台"
          />
        </label>
        <p class="mt-2 text-xs text-[var(--color-text-muted)]">最多 40 字，显示在首页头像下方。</p>
      </div>

      <div class="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div class="rounded-[20px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] p-4">
          <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
            <span>主播头像 (建议正方形，不超过 2MB)</span>
            {#if avatarPreview.preview}
              <div class="mt-2 flex justify-center">
                <div class="h-24 w-24 overflow-hidden rounded-full border-4 border-[var(--color-avatar-ring)] bg-[var(--color-surface-muted)] shadow-sm">
                  <img src={avatarPreview.preview} alt="头像预览" class="h-full w-full object-cover" />
                </div>
              </div>
            {/if}
            <input
              type="file"
              name="avatar"
              accept="image/*"
              class="form-field"
              onchange={avatarPreview.onChange}
            />
          </label>
        </div>

        <div class="rounded-[20px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] p-4">
          <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
            <span>背景图片 (建议 1920x1080，不超过 5MB)</span>
            {#if backgroundPreview.preview}
              <div class="mt-2 h-36 w-full overflow-hidden rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)]">
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
      >
        保存配置
      </button>
    </form>
  </section>
</div>
