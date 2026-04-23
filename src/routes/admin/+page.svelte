<script lang="ts">
  import { browser } from '$app/environment';
  import { enhance } from '$app/forms';
  import NeteaseImportModal from '$lib/components/admin/NeteaseImportModal.svelte';
  import SettingsModal from '$lib/components/admin/SettingsModal.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import { requestStatusClasses, songStatusClasses } from '$lib/status-styles';
  import {
    requestDecisionOptions,
    requestStatusLabels,
    songLanguageOptions,
    songStatusLabels,
    songStatusOptions
  } from '$lib/types';
  import { Tabs } from 'bits-ui';
  import { untrack } from 'svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import { toast } from 'svelte-sonner';

  import type { SubmitFunction } from '@sveltejs/kit';

  import type { ActionData, PageData } from './$types';

  const languageItems = songLanguageOptions.map((v) => ({ value: v, label: v }));
  const statusItems = songStatusOptions.map((s) => ({ value: s, label: songStatusLabels[s] }));
  const decisionItems = requestDecisionOptions.map((s) => ({ value: s, label: requestStatusLabels[s] }));

  let { data, form }: { data: PageData; form?: ActionData } = $props();
  let importModalDismissed = $state(true);
  let lastSeenPreview: unknown = null;
  let settingsModalOpen = $state(false);
  let activeTab = $state(browser && window.location.hash === '#requests' ? 'requests' : 'songs');
  let addPanelActive = $state(
    untrack(() =>
      form && ('songImport' in form || 'playlistImport' in form || 'playlistPreview' in form) ? 'netease' : 'manual'
    )
  );
  let requestFilter = $state<'all' | 'pending' | 'accepted' | 'refused'>('all');
  let songSearch = $state('');
  let songPage = $state(1);
  const songPageSize = 20;
  const selectedSongIds = new SvelteSet<string>();

  const normalizedSearch = $derived(songSearch.trim().toLowerCase());
  const filteredSongs = $derived(
    normalizedSearch === ''
      ? data.dashboard.songs
      : data.dashboard.songs.filter(
          (s) =>
            s.title.toLowerCase().includes(normalizedSearch) ||
            s.artist.toLowerCase().includes(normalizedSearch) ||
            s.tags.some((t) => t.toLowerCase().includes(normalizedSearch))
        )
  );
  const totalPages = $derived(Math.max(1, Math.ceil(filteredSongs.length / songPageSize)));
  const safePage = $derived(Math.min(songPage, totalPages));
  const pagedSongs = $derived(filteredSongs.slice((safePage - 1) * songPageSize, safePage * songPageSize));
  const pageNumbers = $derived.by<Array<number | 'gap-left' | 'gap-right'>>(() => {
    const total = totalPages;
    const current = safePage;
    const siblings = 1;
    const boundary = 1;
    const showAll = total <= siblings * 2 + boundary * 2 + 3;

    if (showAll) return Array.from({ length: total }, (_, i) => i + 1);

    const leftSibling = Math.max(current - siblings, boundary + 1);
    const rightSibling = Math.min(current + siblings, total - boundary);
    const showLeftGap = leftSibling > boundary + 1;
    const showRightGap = rightSibling < total - boundary;

    const out: Array<number | 'gap-left' | 'gap-right'> = [];
    for (let i = 1; i <= boundary; i++) out.push(i);
    if (showLeftGap) out.push('gap-left');
    for (let i = leftSibling; i <= rightSibling; i++) out.push(i);
    if (showRightGap) out.push('gap-right');
    for (let i = total - boundary + 1; i <= total; i++) out.push(i);
    return out;
  });
  const pagedSongIds = $derived(pagedSongs.map((s) => s.id));
  const allOnPageSelected = $derived(pagedSongIds.length > 0 && pagedSongIds.every((id) => selectedSongIds.has(id)));
  const someOnPageSelected = $derived(pagedSongIds.some((id) => selectedSongIds.has(id)));

  let lastSeenSearch = '';
  $effect(() => {
    if (normalizedSearch !== lastSeenSearch) {
      lastSeenSearch = normalizedSearch;
      songPage = 1;
      selectedSongIds.clear();
    }
  });

  const toggleSongSelected = (id: string) => {
    if (selectedSongIds.has(id)) selectedSongIds.delete(id);
    else selectedSongIds.add(id);
  };

  const togglePageSelection = () => {
    if (allOnPageSelected) {
      pagedSongIds.forEach((id) => selectedSongIds.delete(id));
    } else {
      pagedSongIds.forEach((id) => selectedSongIds.add(id));
    }
  };

  const selectAllFiltered = () => {
    filteredSongs.forEach((s) => selectedSongIds.add(s.id));
  };

  const clearSelection = () => {
    selectedSongIds.clear();
  };

  const confirmBulk = (action: 'delete' | 'setPublic' | 'setPrivate'): boolean => {
    const count = selectedSongIds.size;
    const verb = action === 'delete' ? '删除' : action === 'setPublic' ? '公开' : '隐藏';
    const suffix = action === 'delete' ? '此操作不可撤销。' : '';
    return confirm(`确认${verb} ${count} 首歌曲？${suffix}`);
  };
  const adminError = $derived(form && 'adminError' in form ? form.adminError : undefined);
  const requestCounts = $derived({
    all: data.dashboard.requests.length,
    pending: data.dashboard.requests.filter((r) => r.status === 'pending').length,
    accepted: data.dashboard.requests.filter((r) => r.status === 'accepted').length,
    refused: data.dashboard.requests.filter((r) => r.status === 'refused').length
  });
  const filteredRequests = $derived(
    requestFilter === 'all'
      ? data.dashboard.requests
      : data.dashboard.requests.filter((r) => r.status === requestFilter)
  );

  let lastFormRef: ActionData | null = null;
  $effect(() => {
    if (form && form !== lastFormRef) {
      lastFormRef = form;
      if ('adminMessage' in form && form.adminMessage) {
        toast.success(form.adminMessage);
      }
      if ('adminError' in form && form.adminError) {
        const errorShownInModal =
          ('settingsModalOpen' in form && form.settingsModalOpen) ||
          ('playlistPreview' in form && form.playlistPreview);
        if (!errorShownInModal) toast.error(form.adminError);
      }
    } else if (!form) {
      lastFormRef = null;
    }
  });

  $effect(() => {
    if (form && 'settingsModalOpen' in form && form.settingsModalOpen) {
      settingsModalOpen = true;
    }
  });

  $effect(() => {
    const preview = form?.playlistPreview;
    if (preview && preview !== lastSeenPreview) {
      lastSeenPreview = preview;
      importModalDismissed = false;
    } else if (!preview) {
      lastSeenPreview = null;
    }
  });

  $effect(() => {
    if (browser) {
      window.history.replaceState(null, '', `#${activeTab}`);
    }
  });

  const pendingActions = new SvelteSet<string>();
  const isPending = (key: string) => pendingActions.has(key);

  const pendingEnhance =
    (key: string, before?: (input: Parameters<SubmitFunction>[0]) => boolean): SubmitFunction =>
    (input) => {
      if (before && before(input) === false) return;
      pendingActions.add(key);
      return async ({ update }) => {
        await update();
        pendingActions.delete(key);
      };
    };

  const confirmDelete = ({ cancel }: Parameters<SubmitFunction>[0]) => {
    if (!confirm('确认删除这首歌？')) {
      cancel();
      return false;
    }
    return true;
  };

  const confirmReset = ({ cancel }: Parameters<SubmitFunction>[0]) => {
    if (!confirm('确认清空全部歌曲和愿望单？此操作不可撤销。')) {
      cancel();
      return false;
    }
    return true;
  };
</script>

<svelte:head>
  <title>后台管理 | QingKong Songlist</title>
</svelte:head>

<div class="space-y-6">
  <section class="admin-overview">
    <div class="admin-overview-head">
      <div>
        <p class="text-xs font-semibold tracking-[0.14em] text-[var(--color-accent)] uppercase">后台控制台</p>
        <h1 class="mt-2 text-2xl font-semibold text-[var(--color-text)] lg:text-3xl">管理歌曲与愿望单</h1>
        <p class="mt-2 text-sm text-[var(--color-text-secondary)]">维护公开歌单，处理观众提交的点歌请求。</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button type="button" class="button button-ghost button-small" onclick={() => (settingsModalOpen = true)}>
          页面配置
        </button>
        <form method="POST" action="?/resetDatabase" use:enhance={pendingEnhance('reset', confirmReset)}>
          <button
            type="submit"
            class="button button-ghost button-small"
            disabled={isPending('reset')}
            data-pending={isPending('reset') || undefined}
          >
            重置数据库
          </button>
        </form>
        <form method="POST" action="?/logout" use:enhance={pendingEnhance('logout')}>
          <button
            type="submit"
            class="button button-ghost button-small"
            disabled={isPending('logout')}
            data-pending={isPending('logout') || undefined}
          >
            退出登录
          </button>
        </form>
      </div>
    </div>

    <div class="admin-stats">
      <div class="admin-stat">
        <span class="admin-stat-value">{data.dashboard.overview.totalSongs}</span>
        <span class="admin-stat-label">总歌曲</span>
      </div>
      <div class="admin-stat">
        <span class="admin-stat-value">{data.dashboard.overview.publicSongs}</span>
        <span class="admin-stat-label">公开</span>
      </div>
      <div class="admin-stat">
        <span class="admin-stat-value">{data.dashboard.overview.pendingRequests}</span>
        <span class="admin-stat-label">待处理愿望</span>
      </div>
    </div>
  </section>

  <Tabs.Root bind:value={activeTab} class="space-y-5">
    <Tabs.List class="admin-tabs-list">
      <Tabs.Trigger value="songs" class="admin-tab-trigger">
        歌曲 <span class="admin-tab-count">{data.dashboard.songs.length}</span>
      </Tabs.Trigger>
      <Tabs.Trigger value="requests" class="admin-tab-trigger">
        愿望单 <span class="admin-tab-count">{data.dashboard.requests.length}</span>
      </Tabs.Trigger>
    </Tabs.List>

    <Tabs.Content value="songs" class="grid items-start gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <div
        class="rounded-[28px] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6 shadow-sm lg:p-7"
      >
        <h2 class="text-lg font-semibold text-[var(--color-text)]">添加歌曲</h2>

        <Tabs.Root bind:value={addPanelActive} class="mt-5 space-y-4">
          <Tabs.List class="admin-tabs-list">
            <Tabs.Trigger value="manual" class="admin-tab-trigger">手动填写</Tabs.Trigger>
            <Tabs.Trigger value="netease" class="admin-tab-trigger">网易云导入</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="manual">
            <form method="POST" action="?/saveSong" class="space-y-4" use:enhance={pendingEnhance('save-new')}>
              <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
                <span>歌曲名</span>
                <input name="title" class="form-field" placeholder="例如：祝福" />
              </label>

              <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
                <span>原唱</span>
                <input name="artist" class="form-field" placeholder="例如：YOASOBI" />
              </label>

              <div class="grid gap-4 sm:grid-cols-2">
                <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
                  <span>语言</span>
                  <Select name="language" required value="其他" items={languageItems} />
                </label>

                <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
                  <span>状态</span>
                  <Select name="status" value="ready" items={statusItems} />
                </label>
              </div>

              <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
                <span>标签（逗号分隔）</span>
                <input name="tagsInput" class="form-field" placeholder="例如：高能, 日语, 动画" />
              </label>

              <label
                class="flex items-center gap-3 rounded-[14px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-text-secondary)]"
              >
                <input
                  name="isPublic"
                  type="checkbox"
                  class="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
                  checked
                />
                <span>公开展示到前台歌单</span>
              </label>

              <button
                type="submit"
                class="button button-primary button-full"
                disabled={isPending('save-new')}
                data-pending={isPending('save-new') || undefined}
              >
                保存歌曲
              </button>
            </form>
          </Tabs.Content>

          <Tabs.Content value="netease" class="space-y-5">
            <form method="POST" action="?/previewSong" class="space-y-3" use:enhance={pendingEnhance('preview-song')}>
              <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
                <span>单曲链接或 ID</span>
                <input
                  name="songInput"
                  class="form-field"
                  value={form && 'songImport' in form ? form.songImport?.songInput : ''}
                  placeholder="https://music.163.com/#/song?id=..."
                />
              </label>
              <button
                type="submit"
                class="button button-secondary button-full"
                disabled={isPending('preview-song')}
                data-pending={isPending('preview-song') || undefined}
              >
                解析单曲
              </button>
            </form>

            <div class="relative flex items-center">
              <div class="flex-1 border-t border-[var(--color-border-soft)]"></div>
              <span class="px-3 text-xs text-[var(--color-text-muted)]">或</span>
              <div class="flex-1 border-t border-[var(--color-border-soft)]"></div>
            </div>

            <form
              method="POST"
              action="?/previewPlaylist"
              class="space-y-3"
              use:enhance={pendingEnhance('preview-playlist')}
            >
              <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
                <span>歌单链接或 ID</span>
                <input
                  name="playlistInput"
                  class="form-field"
                  value={form?.playlistImport?.playlistInput ?? form?.playlistPreview?.playlistInput ?? ''}
                  placeholder="https://music.163.com/#/playlist?id=..."
                />
              </label>
              <button
                type="submit"
                class="button button-secondary button-full"
                disabled={isPending('preview-playlist')}
                data-pending={isPending('preview-playlist') || undefined}
              >
                解析歌单
              </button>
            </form>
          </Tabs.Content>
        </Tabs.Root>
      </div>

      <section
        class="rounded-[28px] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6 shadow-sm lg:p-7"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <h2 class="text-lg font-semibold text-[var(--color-text)]">歌曲列表</h2>
          <span
            class="rounded-full border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] px-3 py-1 text-xs text-[var(--color-text-secondary)]"
          >
            {#if normalizedSearch}
              {filteredSongs.length} / {data.dashboard.songs.length} 首
            {:else}
              共 {data.dashboard.songs.length} 首
            {/if}
          </span>
        </div>

        <div class="mt-5 flex flex-wrap items-center gap-3">
          <label class="admin-search">
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
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              bind:value={songSearch}
              placeholder="搜索歌名、原唱或标签"
              class="admin-search-input"
            />
            {#if songSearch}
              <button type="button" class="admin-search-clear" onclick={() => (songSearch = '')} aria-label="清空">
                ×
              </button>
            {/if}
          </label>
        </div>

        {#if selectedSongIds.size > 0}
          <div class="admin-bulk-bar mt-4">
            <div class="flex flex-wrap items-center gap-3">
              <span class="text-sm font-medium text-[var(--color-text)]">
                已选 {selectedSongIds.size} 首
              </span>
              <button type="button" class="button button-ghost button-small" onclick={clearSelection}>
                取消选择
              </button>
              {#if selectedSongIds.size < filteredSongs.length}
                <button type="button" class="button button-ghost button-small" onclick={selectAllFiltered}>
                  全选过滤结果（{filteredSongs.length}）
                </button>
              {/if}
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <form
                method="POST"
                action="?/bulkUpdateSongs"
                use:enhance={pendingEnhance('bulk-public', () => confirmBulk('setPublic'))}
              >
                {#each [...selectedSongIds] as id}
                  <input type="hidden" name="id" value={id} />
                {/each}
                <input type="hidden" name="bulkAction" value="setPublic" />
                <button
                  type="submit"
                  class="button button-secondary button-small"
                  disabled={isPending('bulk-public')}
                  data-pending={isPending('bulk-public') || undefined}
                >
                  全部公开
                </button>
              </form>
              <form
                method="POST"
                action="?/bulkUpdateSongs"
                use:enhance={pendingEnhance('bulk-private', () => confirmBulk('setPrivate'))}
              >
                {#each [...selectedSongIds] as id}
                  <input type="hidden" name="id" value={id} />
                {/each}
                <input type="hidden" name="bulkAction" value="setPrivate" />
                <button
                  type="submit"
                  class="button button-secondary button-small"
                  disabled={isPending('bulk-private')}
                  data-pending={isPending('bulk-private') || undefined}
                >
                  全部隐藏
                </button>
              </form>
              <form
                method="POST"
                action="?/bulkUpdateSongs"
                use:enhance={pendingEnhance('bulk-delete', () => confirmBulk('delete'))}
              >
                {#each [...selectedSongIds] as id}
                  <input type="hidden" name="id" value={id} />
                {/each}
                <input type="hidden" name="bulkAction" value="delete" />
                <button
                  type="submit"
                  class="button button-ghost button-small admin-bulk-delete"
                  disabled={isPending('bulk-delete')}
                  data-pending={isPending('bulk-delete') || undefined}
                >
                  批量删除
                </button>
              </form>
            </div>
          </div>
        {/if}

        {#if pagedSongs.length === 0}
          <div class="admin-empty mt-5">
            {#if data.dashboard.songs.length === 0}
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
                onchange={togglePageSelection}
              />
              <span>本页全选</span>
            </label>
            <span class="text-xs text-[var(--color-text-muted)]">
              第 {safePage} / {totalPages} 页
            </span>
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
                      checked={selectedSongIds.has(song.id)}
                      onclick={(e) => e.stopPropagation()}
                      onchange={() => toggleSongSelected(song.id)}
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
                    <span class={`status-badge ${songStatusClasses[song.status]}`}>
                      {songStatusLabels[song.status]}
                    </span>
                    <svg
                      class="song-chevron"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
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
                  <form
                    method="POST"
                    action="?/deleteSong"
                    use:enhance={pendingEnhance(`delete-${song.id}`, confirmDelete)}
                  >
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

          {#if totalPages > 1}
            <div class="admin-pagination mt-5">
              <button
                type="button"
                class="admin-pagination-step"
                disabled={safePage <= 1}
                onclick={() => (songPage = safePage - 1)}
                aria-label="上一页"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <div class="admin-pagination-pages">
                {#each pageNumbers as item}
                  {#if item === 'gap-left' || item === 'gap-right'}
                    <span class="admin-pagination-gap">…</span>
                  {:else}
                    <button
                      type="button"
                      class="admin-pagination-page"
                      data-state={item === safePage ? 'active' : 'inactive'}
                      onclick={() => (songPage = item)}
                    >
                      {item}
                    </button>
                  {/if}
                {/each}
              </div>
              <button
                type="button"
                class="admin-pagination-step"
                disabled={safePage >= totalPages}
                onclick={() => (songPage = safePage + 1)}
                aria-label="下一页"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          {/if}
        {/if}
      </section>
    </Tabs.Content>

    <Tabs.Content value="requests">
      <section
        class="rounded-[28px] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6 shadow-sm lg:p-7"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <h2 class="text-lg font-semibold text-[var(--color-text)]">愿望单</h2>
          <div class="admin-tabs-list">
            <button
              type="button"
              class="admin-tab-trigger"
              data-state={requestFilter === 'all' ? 'active' : 'inactive'}
              onclick={() => (requestFilter = 'all')}
            >
              全部 <span class="admin-tab-count">{requestCounts.all}</span>
            </button>
            <button
              type="button"
              class="admin-tab-trigger"
              data-state={requestFilter === 'pending' ? 'active' : 'inactive'}
              onclick={() => (requestFilter = 'pending')}
            >
              待处理 <span class="admin-tab-count">{requestCounts.pending}</span>
            </button>
            <button
              type="button"
              class="admin-tab-trigger"
              data-state={requestFilter === 'accepted' ? 'active' : 'inactive'}
              onclick={() => (requestFilter = 'accepted')}
            >
              已接受 <span class="admin-tab-count">{requestCounts.accepted}</span>
            </button>
            <button
              type="button"
              class="admin-tab-trigger"
              data-state={requestFilter === 'refused' ? 'active' : 'inactive'}
              onclick={() => (requestFilter = 'refused')}
            >
              已拒绝 <span class="admin-tab-count">{requestCounts.refused}</span>
            </button>
          </div>
        </div>

        {#if filteredRequests.length === 0}
          <div class="admin-empty mt-5">
            {#if data.dashboard.requests.length === 0}
              <p class="text-sm font-medium text-[var(--color-text-secondary)]">还没有观众提交愿望</p>
              <p class="mt-1 text-xs text-[var(--color-text-muted)]">前台公开链接打开后就能收到</p>
            {:else}
              <p class="text-sm font-medium text-[var(--color-text-secondary)]">当前筛选下没有结果</p>
              <p class="mt-1 text-xs text-[var(--color-text-muted)]">换一个状态试试</p>
            {/if}
          </div>
        {:else}
          <div class="mt-5 space-y-3">
            {#each filteredRequests as item}
              <details
                class="group rounded-[20px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] p-5 transition-colors open:bg-[var(--color-surface)] hover:bg-[var(--color-surface)]"
              >
                <summary class="flex cursor-pointer list-none items-center justify-between gap-4">
                  <div class="min-w-0">
                    <h3 class="truncate text-base font-semibold text-[var(--color-text)]">{item.songTitle}</h3>
                    <p class="mt-1 truncate text-sm text-[var(--color-text-secondary)]">
                      {item.artist || '未填写'} · {item.language}
                    </p>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class={`status-badge ${requestStatusClasses[item.status]}`}>
                      {requestStatusLabels[item.status]}
                    </span>
                    <svg
                      class="song-chevron"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </summary>

                <div class="mt-5 space-y-4">
                  {#if item.message}
                    <p class="text-sm leading-7 text-[var(--color-text-secondary)]">{item.message}</p>
                  {/if}
                  <div class="flex flex-wrap gap-3 text-xs text-[var(--color-text-muted)]">
                    <span>提交者：{item.requesterName || '匿名'}</span>
                    <span>时间：{new Date(item.createdAt).toLocaleString('zh-CN')}</span>
                  </div>

                  {#if item.status === 'pending'}
                    <form
                      method="POST"
                      action="?/updateRequestStatus"
                      class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
                      use:enhance={pendingEnhance(`request-${item.id}`)}
                    >
                      <input type="hidden" name="id" value={item.id} />
                      <Select name="status" value="accepted" items={decisionItems} triggerClass="form-field-muted" />
                      <button
                        type="submit"
                        class="button button-primary"
                        disabled={isPending(`request-${item.id}`)}
                        data-pending={isPending(`request-${item.id}`) || undefined}
                      >
                        处理愿望
                      </button>
                    </form>
                  {/if}
                </div>
              </details>
            {/each}
          </div>
        {/if}
      </section>
    </Tabs.Content>
  </Tabs.Root>
</div>

<SettingsModal settings={data.dashboard.settings} {adminError} bind:open={settingsModalOpen} />

{#if form?.playlistPreview && !importModalDismissed}
  <NeteaseImportModal preview={form.playlistPreview} {adminError} onClose={() => (importModalDismissed = true)} />
{/if}
