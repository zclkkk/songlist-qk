<script lang="ts">
  import { enhance } from '$app/forms';
  import Select from '$lib/components/ui/Select.svelte';
  import { songLanguageOptions } from '$lib/types';

  export type RequestFormState = {
    requestMessage?: string;
    requestError?: string;
    requestValues?: {
      songInput?: string;
      songTitle?: string;
      artist?: string;
      language?: string;
      message?: string;
      requesterName?: string;
    };
  };

  let { form }: { form?: RequestFormState | null } = $props();

  let celebrationDismissed = $state(false);
  let lastSubmittedMessage: string | undefined;

  $effect(() => {
    const msg = form?.requestMessage;
    const hasValues = !!form?.requestValues;
    if (msg && !hasValues && msg !== lastSubmittedMessage) {
      lastSubmittedMessage = msg;
      celebrationDismissed = false;
    } else if (!msg) {
      lastSubmittedMessage = undefined;
    }
  });

  const submitAnother = () => {
    celebrationDismissed = true;
  };

  const showCelebration = $derived(!!form?.requestMessage && !form?.requestValues && !celebrationDismissed);
</script>

<section class="request-card">
  <div class="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
    <div>
      <p class="text-xs font-semibold tracking-[0.14em] text-[var(--color-accent)] uppercase">愿望单提交</p>
      <h2 class="mt-2 text-2xl leading-tight font-semibold text-[var(--color-text)]">想听哪首歌？</h2>
      <p class="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
        粘贴网易云链接一键解析，或手动填写歌名与原唱。无需登录，可匿名提交。
      </p>
    </div>

    <div>
      {#if showCelebration}
        <div class="request-success">
          <div class="request-success-icon">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h3 class="mt-4 text-xl font-semibold text-[var(--color-text)]">愿望已提交</h3>
          <p class="mt-2 text-sm text-[var(--color-text-secondary)]">{form?.requestMessage}</p>
          <button type="button" class="button button-secondary mt-5" onclick={submitAnother}>再提交一条</button>
        </div>
      {:else}
        {#if form?.requestMessage || form?.requestError}
          <div class="mb-5 space-y-3">
            {#if form?.requestMessage && form?.requestValues}
              <div class="alert alert-success">{form.requestMessage}</div>
            {/if}
            {#if form?.requestError}
              <div class="alert alert-danger">{form.requestError}</div>
            {/if}
          </div>
        {/if}

        <form
          method="POST"
          action="?/submitRequest"
          class="space-y-5"
          use:enhance={() =>
            async ({ update }) => {
              await update({ reset: false });
            }}
        >
          <div class="netease-block">
            <div class="flex items-center gap-2 text-sm font-medium text-[var(--color-text)]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
                class="text-[var(--color-accent)]"
              >
                <path d="m21 16-4 4-4-4" />
                <path d="M17 20V4" />
                <path d="m3 8 4-4 4 4" />
                <path d="M7 4v16" />
              </svg>
              一键从网易云填充
            </div>
            <p class="mt-1 text-xs text-[var(--color-text-secondary)]">粘贴单曲链接或 ID，自动填入歌名和原唱</p>

            <div class="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <input
                name="songInput"
                value={form?.requestValues?.songInput ?? ''}
                class="form-field"
                placeholder="https://music.163.com/#/song?id=..."
              />
              <button type="submit" formaction="?/parseRequestSong" class="button button-secondary"> 解析 </button>
            </div>
          </div>

          <div class="grid gap-4 lg:grid-cols-3">
            <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
              <span>歌曲名</span>
              <input
                name="songTitle"
                value={form?.requestValues?.songTitle ?? ''}
                class="form-field"
                placeholder="例如：群青"
              />
            </label>

            <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
              <span>原唱</span>
              <input
                name="artist"
                value={form?.requestValues?.artist ?? ''}
                class="form-field"
                placeholder="例如：YOASOBI"
              />
            </label>

            <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
              <span>语言</span>
              <Select
                name="language"
                required
                value={form?.requestValues?.language ?? '其他'}
                items={songLanguageOptions.map((v) => ({ value: v, label: v }))}
              />
            </label>

            <label class="block space-y-2 text-sm text-[var(--color-text-secondary)] lg:col-span-3">
              <span>留言</span>
              <textarea name="message" rows="3" class="form-field" placeholder="可以说说为什么想听、适合什么场合唱。"
                >{form?.requestValues?.message ?? ''}</textarea
              >
            </label>

            <label class="block space-y-2 text-sm text-[var(--color-text-secondary)] lg:col-span-2">
              <span>你的昵称（可选）</span>
              <input
                name="requesterName"
                value={form?.requestValues?.requesterName ?? ''}
                class="form-field"
                placeholder="例如：夜猫子"
              />
            </label>

            <div class="flex items-end">
              <button type="submit" class="button button-primary button-lg button-full"> 提交愿望单 </button>
            </div>
          </div>
        </form>
      {/if}
    </div>
  </div>
</section>
