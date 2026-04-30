<script lang="ts">
  import { enhance } from '$app/forms';
  import Icon from '$lib/components/ui/Icon.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import { createLocalPending } from '$lib/pending.svelte';
  import { songLanguageItems } from '$lib/select-options';
  import type { RequestFormResult } from '$lib/types';

  let { form }: { form?: RequestFormResult | null } = $props();

  let celebrationDismissed = $state(false);

  $effect(() => {
    if (form?.kind === 'submitted') {
      celebrationDismissed = false;
    }
  });

  const submitAnother = () => {
    celebrationDismissed = true;
  };

  const showCelebration = $derived(form?.kind === 'submitted' && !celebrationDismissed);
  const submittedMessage = $derived(form?.kind === 'submitted' ? form.message : '');
  const formValues = $derived(form?.kind === 'parsed' || form?.kind === 'error' ? form.values : null);

  const parser = createLocalPending({ reset: false });
  const submitter = createLocalPending({ reset: false });
</script>

<section id="request-form" class="request-card">
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
            <Icon name="check" size={28} strokeWidth={2.5} />
          </div>
          <h3 class="mt-4 text-xl font-semibold text-[var(--color-text)]">愿望已提交</h3>
          <p class="mt-2 text-sm text-[var(--color-text-secondary)]">{submittedMessage}</p>
          <button type="button" class="button button-secondary mt-5" onclick={submitAnother}>再提交一条</button>
        </div>
      {:else}
        {#if form?.kind === 'parsed'}
          <div class="mb-5">
            <div class="alert alert-success">{form.message}</div>
          </div>
        {:else if form?.kind === 'error'}
          <div class="mb-5">
            <div class="alert alert-danger">{form.error}</div>
          </div>
        {/if}

        <form
          method="POST"
          action="?/submitRequest"
          class="space-y-5"
          use:enhance={(input) =>
            (input.action.search.includes('parseRequestSong') ? parser.enhance : submitter.enhance)(input)}
        >
          <div class="netease-block">
            <div class="flex items-center gap-2 text-sm font-medium text-[var(--color-text)]">
              <Icon name="arrow-down-up" class="text-[var(--color-accent)]" />
              一键从网易云填充
            </div>
            <p class="mt-1 text-xs text-[var(--color-text-secondary)]">粘贴单曲链接或 ID，自动填入歌名和原唱</p>

            <div class="parse-row mt-3">
              <input
                name="songInput"
                value={formValues?.songInput ?? ''}
                class="form-field parse-input"
                placeholder="https://music.163.com/#/song?id=..."
              />
              <button
                type="submit"
                formaction="?/parseRequestSong"
                class="button parse-button"
                disabled={parser.pending}
                data-pending={parser.pending || undefined}
              >
                一键解析
              </button>
            </div>
          </div>

          <div class="grid gap-4 lg:grid-cols-3">
            <label class="field-label">
              <span>歌曲名</span>
              <input name="songTitle" value={formValues?.songTitle ?? ''} class="form-field" placeholder="例如：群青" />
            </label>

            <label class="field-label">
              <span>原唱</span>
              <input name="artist" value={formValues?.artist ?? ''} class="form-field" placeholder="例如：YOASOBI" />
            </label>

            <label class="field-label">
              <span>语言</span>
              <Select name="language" required value={formValues?.language ?? '其他'} items={songLanguageItems} />
            </label>

            <label class="field-label lg:col-span-3">
              <span>留言</span>
              <textarea name="message" rows="3" class="form-field" placeholder="可以说说为什么想听、适合什么场合唱。"
                >{formValues?.message ?? ''}</textarea
              >
            </label>

            <label class="field-label lg:col-span-2">
              <span>你的昵称（可选）</span>
              <input
                name="requesterName"
                value={formValues?.requesterName ?? ''}
                class="form-field"
                placeholder="例如：夜猫子"
              />
            </label>

            <div class="flex items-end">
              <button
                type="submit"
                class="button button-primary button-lg button-full"
                disabled={submitter.pending}
                data-pending={submitter.pending || undefined}
              >
                提交愿望单
              </button>
            </div>
          </div>
        </form>
      {/if}
    </div>
  </div>
</section>
