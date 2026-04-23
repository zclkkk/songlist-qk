<script lang="ts">
  import { enhance } from '$app/forms';
  import { confirmBefore, isPending, pendingEnhance } from '$lib/admin/pending.svelte';
  import Icon from '$lib/components/ui/Icon.svelte';
  import Pagination from '$lib/components/ui/Pagination.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import { matchesSongKeyword } from '$lib/songs';
  import { songStatusClasses } from '$lib/status-styles';
  import { songLanguageOptions, songStatusLabels, songStatusOptions, type Song } from '$lib/types';
  import { SvelteSet } from 'svelte/reactivity';

  let { songs }: { songs: Song[] } = $props();

  const languageItems = songLanguageOptions.map((v) => ({ value: v, label: v }));
  const statusItems = songStatusOptions.map((s) => ({ value: s, label: songStatusLabels[s] }));

  let songSearch = $state('');
  let songPage = $state(1);
  const songPageSize = 20;
  const selectedIds = new SvelteSet<string>();

  const normalizedSearch = $derived(songSearch.trim().toLowerCase());
  const filteredSongs = $derived(songs.filter((s) => matchesSongKeyword(s, songSearch)));
  const totalPages = $derived(Math.max(1, Math.ceil(filteredSongs.length / songPageSize)));
  const safePage = $derived(Math.min(songPage, totalPages));
  const pagedSongs = $derived(filteredSongs.slice((safePage - 1) * songPageSize, safePage * songPageSize));
  const pagedSongIds = $derived(pagedSongs.map((s) => s.id));
  const allOnPageSelected = $derived(pagedSongIds.length > 0 && pagedSongIds.every((id) => selectedIds.has(id)));
  const someOnPageSelected = $derived(pagedSongIds.some((id) => selectedIds.has(id)));

  let lastSeenSearch = '';
  $effect(() => {
    if (normalizedSearch !== lastSeenSearch) {
      lastSeenSearch = normalizedSearch;
      songPage = 1;
      selectedIds.clear();
    }
  });

  const toggleSong = (id: string) => {
    if (selectedIds.has(id)) selectedIds.delete(id);
    else selectedIds.add(id);
  };

  const togglePage = () => {
    if (allOnPageSelected) pagedSongIds.forEach((id) => selectedIds.delete(id));
    else pagedSongIds.forEach((id) => selectedIds.add(id));
  };

  const confirmBulk = (action: 'delete' | 'setPublic' | 'setPrivate'): boolean => {
    const verb = action === 'delete' ? '删除' : action === 'setPublic' ? '公开' : '隐藏';
    const suffix = action === 'delete' ? '此操作不可撤销。' : '';
    return confirm(`确认${verb} ${selectedIds.size} 首歌曲？${suffix}`);
  };

  const confirmDelete = confirmBefore('确认删除这首歌？');

  const bulkActions = [
    { key: 'setPublic', label: '全部公开', btnClass: 'button button-secondary button-small' },
    { key: 'setPrivate', label: '全部隐藏', btnClass: 'button button-secondary button-small' },
    { key: 'delete', label: '批量删除', btnClass: 'button button-ghost button-small admin-bulk-delete' }
  ] as const;
</script>

<section class="rounded-[28px] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6 shadow-sm lg:p-7">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <h2 class="text-lg font-semibold text-[var(--color-text)]">歌曲列表</h2>
    <span
      class="rounded-full border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] px-3 py-1 text-xs text-[var(--color-text-secondary)]"
    >
      {#if normalizedSearch}
        {filteredSongs.length} / {songs.length} 首
      {:else}
        共 {songs.length} 首
      {/if}
    </span>
  </div>

  <div class="mt-5 flex flex-wrap items-center gap-3">
    <label class="admin-search">
      <Icon name="search" />
      <input type="search" bind:value={songSearch} placeholder="搜索歌名、原唱或标签" class="admin-search-input" />
      {#if songSearch}
        <button type="button" class="admin-search-clear" onclick={() => (songSearch = '')} aria-label="清空">
          ×
        </button>
      {/if}
    </label>
  </div>

  {#if selectedIds.size > 0}
    <div class="admin-bulk-bar mt-4">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm font-medium text-[var(--color-text)]">已选 {selectedIds.size} 首</span>
        <button type="button" class="button button-ghost button-small" onclick={() => selectedIds.clear()}>
          取消选择
        </button>
        {#if selectedIds.size < filteredSongs.length}
          <button
            type="button"
            class="button button-ghost button-small"
            onclick={() => filteredSongs.forEach((s) => selectedIds.add(s.id))}
          >
            全选过滤结果（{filteredSongs.length}）
          </button>
        {/if}
      </div>
      <div class="flex flex-wrap items-center gap-2">
        {#each bulkActions as action}
          <form
            method="POST"
            action="?/bulkUpdateSongs"
            use:enhance={pendingEnhance(`bulk-${action.key}`, () => confirmBulk(action.key))}
          >
            {#each [...selectedIds] as id}
              <input type="hidden" name="id" value={id} />
            {/each}
            <input type="hidden" name="bulkAction" value={action.key} />
            <button
              type="submit"
              class={action.btnClass}
              disabled={isPending(`bulk-${action.key}`)}
              data-pending={isPending(`bulk-${action.key}`) || undefined}
            >
              {action.label}
            </button>
          </form>
        {/each}
      </div>
    </div>
  {/if}

  {#if pagedSongs.length === 0}
    <div class="admin-empty mt-5">
      {#if songs.length === 0}
        <p class="text-sm font-medium text-[var(--color-text-secondary)]">还没有歌曲，先添加一首吧</p>
      {:else}
        <p class="text-sm font-medium text-[var(--color-text-secondary)]">没有符合条件的歌曲</p>
        <p class="mt-1 text-xs text-[var(--color-text-muted)]">换个关键词试试</p>
      {/if}
    </div>
  {:else}
    <div class="admin-list-head mt-4">
      <label class="admin-select-all">
        <input
          type="checkbox"
          class="admin-checkbox"
          checked={allOnPageSelected}
          indeterminate={!allOnPageSelected && someOnPageSelected}
          onchange={togglePage}
        />
        <span>本页全选</span>
      </label>
      <span class="text-xs text-[var(--color-text-muted)]">第 {safePage} / {totalPages} 页</span>
    </div>

    <div class="mt-3 space-y-3">
      {#each pagedSongs as song (song.id)}
        <details
          class="group rounded-[20px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] p-5 transition-colors open:bg-[var(--color-surface)] hover:bg-[var(--color-surface)]"
        >
          <summary class="flex cursor-pointer list-none items-center justify-between gap-4">
            <span class="admin-row-check">
              <input
                type="checkbox"
                class="admin-checkbox"
                checked={selectedIds.has(song.id)}
                onclick={(e) => e.stopPropagation()}
                onchange={() => toggleSong(song.id)}
              />
            </span>
            <div class="min-w-0 flex-1">
              <h3 class="truncate text-base font-semibold text-[var(--color-text)]">{song.title}</h3>
              <p class="mt-1 truncate text-sm text-[var(--color-text-secondary)]">
                {song.artist} · {song.language}{#if !song.isPublic}
                  · <span class="text-[var(--color-text-muted)]">未公开</span>
                {/if}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <span class={`status-badge ${songStatusClasses[song.status]}`}>{songStatusLabels[song.status]}</span>
              <Icon name="chevron-down" class="song-chevron" />
            </div>
          </summary>

          <form
            id="save-song-{song.id}"
            method="POST"
            action="?/saveSong"
            class="mt-5 grid gap-4 sm:grid-cols-2"
            use:enhance={pendingEnhance(`save-${song.id}`)}
          >
            <input type="hidden" name="id" value={song.id} />

            <label class="block space-y-2 text-sm text-[var(--color-text-secondary)] sm:col-span-2">
              <span>歌曲名</span>
              <input name="title" value={song.title} class="form-field-muted" />
            </label>

            <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
              <span>原唱</span>
              <input name="artist" value={song.artist} class="form-field-muted" />
            </label>

            <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
              <span>语言</span>
              <Select
                name="language"
                required
                value={song.language}
                items={languageItems}
                triggerClass="form-field-muted"
              />
            </label>

            <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
              <span>状态</span>
              <Select name="status" value={song.status} items={statusItems} triggerClass="form-field-muted" />
            </label>

            <label class="block space-y-2 text-sm text-[var(--color-text-secondary)] sm:col-span-2">
              <span>标签</span>
              <input name="tagsInput" value={song.tags.join(', ')} class="form-field-muted" />
            </label>

            <label
              class="flex items-center gap-3 rounded-[14px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-text-secondary)] sm:col-span-2"
            >
              <input
                name="isPublic"
                type="checkbox"
                class="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
                checked={song.isPublic}
              />
              <span>在公开歌单展示</span>
            </label>
          </form>

          <div class="detail-actions">
            <form method="POST" action="?/deleteSong" use:enhance={pendingEnhance(`delete-${song.id}`, confirmDelete)}>
              <input type="hidden" name="id" value={song.id} />
              <button
                type="submit"
                class="button button-ghost button-small"
                disabled={isPending(`delete-${song.id}`)}
                data-pending={isPending(`delete-${song.id}`) || undefined}
              >
                删除
              </button>
            </form>
            <button
              type="submit"
              form="save-song-{song.id}"
              class="button button-primary"
              disabled={isPending(`save-${song.id}`)}
              data-pending={isPending(`save-${song.id}`) || undefined}
            >
              保存修改
            </button>
          </div>
        </details>
      {/each}
    </div>

    <div class="mt-5">
      <Pagination current={safePage} total={totalPages} onChange={(p) => (songPage = p)} />
    </div>
  {/if}
</section>
