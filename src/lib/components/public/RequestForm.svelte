<script lang="ts">
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
</script>

<section class="rounded-[30px] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6 shadow-sm lg:p-7">
  <div class="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
    <div>
      <span class="w-fit rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1 text-xs font-medium text-[var(--color-text-secondary)]">
        无需登录
      </span>
      <p class="mt-5 text-sm font-medium text-[var(--color-accent)]">愿望单提交</p>
      <h2 class="mt-2 text-2xl font-semibold leading-tight text-[var(--color-text)]">想听哪首歌？</h2>
      <p class="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
        优先粘贴网易云单曲链接或 ID 解析，系统会自动填好歌名和原唱；找不到链接时再手动填写。
      </p>
    </div>

    <div>
      {#if form?.requestMessage || form?.requestError}
        <div class="mb-5 space-y-3">
          {#if form?.requestMessage}
            <div class="rounded-[20px] border border-[#10b981]/30 bg-[#10b981]/10 px-4 py-3 text-sm text-[var(--color-success-text)]">
              {form.requestMessage}
            </div>
          {/if}

          {#if form?.requestError}
            <div class="rounded-[20px] border border-[#7170ff]/30 bg-[#7170ff]/10 px-4 py-3 text-sm text-[var(--color-accent)]">
              {form.requestError}
            </div>
          {/if}
        </div>
      {/if}

      <form method="POST" action="?/submitRequest" class="grid gap-4">
        <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-end">
          <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
            <span>网易云单曲链接或 ID</span>
            <input
              name="songInput"
              value={form?.requestValues?.songInput ?? ''}
              class="form-field"
              placeholder="https://music.163.com/#/song?id=..."
            />
          </label>

          <button
            type="submit"
            formaction="?/parseRequestSong"
            class="button button-secondary button-full"
          >
            解析单曲
          </button>
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
            <select name="language" class="form-field" required>
              {#each songLanguageOptions as language}
                <option value={language} selected={(form?.requestValues?.language ?? '其他') === language}>
                  {language}
                </option>
              {/each}
            </select>
          </label>

          <label class="block space-y-2 text-sm text-[var(--color-text-secondary)] lg:col-span-3">
            <span>留言</span>
            <textarea
              name="message"
              rows="3"
              class="form-field"
              placeholder="可以说说为什么想听、适合什么场合唱。"
            >{form?.requestValues?.message ?? ''}</textarea>
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
            <button
              type="submit"
              class="button button-primary button-full"
            >
              提交愿望单
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</section>
