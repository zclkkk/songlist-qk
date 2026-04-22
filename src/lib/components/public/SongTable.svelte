<script lang="ts">
  import { songStatusClasses } from '$lib/status-styles';
  import { songStatusLabels, type Song } from '$lib/types';

  let { songs }: { songs: Song[] } = $props();
</script>

<div class="overflow-hidden rounded-[28px] border border-[var(--color-border-soft)] bg-[var(--color-surface)] shadow-sm">
  <div class="hidden grid-cols-[minmax(0,2fr)_minmax(0,1.6fr)_120px_140px_1.7fr] gap-4 border-b border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)] lg:grid">
    <div>歌曲名</div>
    <div>原唱</div>
    <div>语言</div>
    <div>当前状态</div>
    <div>标签</div>
  </div>

  {#if songs.length > 0}
    <div class="divide-y divide-[var(--color-border-soft)]">
      {#each songs as song}
        <article class="grid gap-4 p-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.6fr)_120px_140px_1.7fr] lg:items-center lg:px-6">
          <div class="min-w-0">
            <p class="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)] lg:hidden">歌曲名</p>
            <h3 class="mt-1 break-words text-lg font-semibold text-[var(--color-text)] lg:mt-0 lg:text-base">{song.title}</h3>
          </div>

          <div class="min-w-0 text-sm text-[var(--color-text-secondary)]">
            <p class="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)] lg:hidden">原唱</p>
            <p class="mt-1 truncate lg:mt-0">{song.artist}</p>
          </div>

          <div class="text-sm text-[var(--color-text-secondary)]">
            <p class="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)] lg:hidden">语言</p>
            <p class="mt-1 lg:mt-0">{song.language}</p>
          </div>

          <div>
            <p class="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)] lg:hidden">当前状态</p>
            <span class={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${songStatusClasses[song.status]}`}>
              {songStatusLabels[song.status]}
            </span>
          </div>

          <div>
            <p class="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)] lg:hidden">标签</p>
            <div class="flex flex-wrap gap-2">
              {#each song.tags as tag}
                <span class="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1 text-xs text-[var(--color-text-secondary)]">
                  {tag}
                </span>
              {/each}
            </div>
          </div>
        </article>
      {/each}
    </div>
  {:else}
    <div class="px-6 py-16 text-center text-sm text-[var(--color-text-muted)]">
      当前筛选下没有结果，试试放宽关键词或筛选项。
    </div>
  {/if}
</div>
