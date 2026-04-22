<script lang="ts">
  import { songStatusClasses } from '$lib/status-styles';
  import { songStatusLabels, type Song } from '$lib/types';

  let { songs }: { songs: Song[] } = $props();
</script>

<div class="song-table">
  <div class="song-table-header">
    <div>歌曲名</div>
    <div>原唱</div>
    <div>语言</div>
    <div>当前状态</div>
    <div>标签</div>
  </div>

  {#if songs.length > 0}
    <div class="divide-y divide-[var(--color-border-soft)]">
      {#each songs as song}
        <article class="song-row">
          <div class="song-row-mobile">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h3 class="truncate text-base font-semibold text-[var(--color-text)]">{song.title}</h3>
                <p class="mt-1 truncate text-xs text-[var(--color-text-secondary)]">
                  {song.artist} · {song.language}
                </p>
              </div>
              <span class={`status-badge ${songStatusClasses[song.status]}`}>
                {songStatusLabels[song.status]}
              </span>
            </div>
            {#if song.tags.length > 0}
              <div class="mt-2.5 flex flex-wrap gap-1.5">
                {#each song.tags as tag}
                  <span class="tag-pill">{tag}</span>
                {/each}
              </div>
            {/if}
          </div>

          <div class="song-row-desktop">
            <h3 class="min-w-0 truncate text-sm font-medium text-[var(--color-text)]">{song.title}</h3>
            <p class="min-w-0 truncate text-sm text-[var(--color-text-secondary)]">{song.artist}</p>
            <p class="text-sm text-[var(--color-text-secondary)]">{song.language}</p>
            <div>
              <span class={`status-badge ${songStatusClasses[song.status]}`}>
                {songStatusLabels[song.status]}
              </span>
            </div>
            <div class="flex flex-wrap gap-1.5">
              {#each song.tags as tag}
                <span class="tag-pill">{tag}</span>
              {/each}
            </div>
          </div>
        </article>
      {/each}
    </div>
  {:else}
    <div class="song-empty">
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <p class="mt-3 text-sm font-medium text-[var(--color-text-secondary)]">没有匹配的歌曲</p>
      <p class="mt-1 text-xs text-[var(--color-text-muted)]">试试放宽筛选或清空关键词</p>
    </div>
  {/if}
</div>
