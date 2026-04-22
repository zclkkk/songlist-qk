<script lang="ts">
  import { browser } from '$app/environment';
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

  import type { ActionData, PageData } from './$types';

  const languageItems = songLanguageOptions.map((v) => ({ value: v, label: v }));
  const statusItems = songStatusOptions.map((s) => ({ value: s, label: songStatusLabels[s] }));
  const decisionItems = requestDecisionOptions.map((s) => ({ value: s, label: requestStatusLabels[s] }));

  let { data, form }: { data: PageData; form?: ActionData } = $props();
  let importModalDismissed = $state(false);
  let settingsModalOpen = $state(false);
  let activeTab = $state(browser && window.location.hash === '#requests' ? 'requests' : 'songs');
  const adminError = $derived(form && 'adminError' in form ? form.adminError : undefined);

  $effect(() => {
    if (form && 'settingsModalOpen' in form && form.settingsModalOpen) {
      settingsModalOpen = true;
    }
  });

  $effect(() => {
    if (browser) {
      window.history.replaceState(null, '', `#${activeTab}`);
    }
  });

  const confirmDelete = (event: SubmitEvent) => {
    if (!confirm('确认删除这首歌？')) {
      event.preventDefault();
    }
  };

  const confirmReset = (event: SubmitEvent) => {
    if (!confirm('确认清空全部歌曲和愿望单？此操作不可撤销。')) {
      event.preventDefault();
    }
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
        <form method="POST" action="?/resetDatabase" onsubmit={confirmReset}>
          <button type="submit" class="button button-ghost button-small">重置数据库</button>
        </form>
        <form method="POST" action="?/logout">
          <button type="submit" class="button button-ghost button-small">退出登录</button>
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

    {#if form?.adminMessage}
      <div class="alert alert-success mt-5">{form.adminMessage}</div>
    {/if}
    {#if adminError && !form?.playlistPreview}
      <div class="alert alert-danger mt-5">{adminError}</div>
    {/if}
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
        class="rounded-[30px] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6 shadow-sm lg:p-7"
      >
        <div>
          <p class="text-sm font-medium text-[var(--color-accent)]">新增歌曲</p>
          <h2 class="mt-1 text-2xl font-semibold text-[var(--color-text)]">创建公开歌单条目</h2>
        </div>

        <form method="POST" action="?/saveSong" class="mt-6 space-y-4">
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
            class="flex items-center gap-3 rounded-[18px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-text-secondary)]"
          >
            <input
              name="isPublic"
              type="checkbox"
              class="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
              checked
            />
            <span>公开展示到前台歌单</span>
          </label>

          <button type="submit" class="button button-primary button-full"> 保存歌曲 </button>
        </form>

        <div class="mt-8 border-t border-[var(--color-border-soft)] pt-7">
          <div>
            <p class="text-sm font-medium text-[var(--color-accent)]">导入网易云</p>
            <h2 class="mt-1 text-2xl font-semibold text-[var(--color-text)]">解析公开歌单或单曲</h2>
          </div>

          <form
            method="POST"
            action="?/previewSong"
            class="mt-6 space-y-4"
            onsubmit={() => (importModalDismissed = false)}
          >
            <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
              <span>单曲链接或 ID</span>
              <input
                name="songInput"
                class="form-field"
                value={form && 'songImport' in form ? form.songImport?.songInput : ''}
                placeholder="https://music.163.com/#/song?id=..."
              />
            </label>

            <button type="submit" class="button button-secondary button-full"> 解析单曲 </button>
          </form>

          <form
            method="POST"
            action="?/previewPlaylist"
            class="mt-6 space-y-4"
            onsubmit={() => (importModalDismissed = false)}
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

            <button type="submit" class="button button-secondary button-full"> 解析歌单 </button>
          </form>
        </div>
      </div>

      <section
        class="rounded-[30px] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6 shadow-sm lg:p-7"
      >
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-[var(--color-accent)]">歌曲列表</p>
            <h2 class="mt-1 text-2xl font-semibold text-[var(--color-text)]">已录入曲目</h2>
          </div>
          <span
            class="rounded-full border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] px-3 py-1 text-xs text-[var(--color-text-secondary)]"
          >
            {data.dashboard.songs.length} 首
          </span>
        </div>

        <div class="mt-6 space-y-4">
          {#each data.dashboard.songs as song}
            <details
              class="group rounded-[24px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] p-5 open:bg-[var(--color-surface)]"
            >
              <summary class="flex cursor-pointer list-none items-center justify-between gap-4">
                <div class="min-w-0">
                  <h3 class="truncate text-lg font-semibold text-[var(--color-text)]">{song.title}</h3>
                  <p class="mt-1 truncate text-sm text-[var(--color-text-secondary)]">
                    {song.artist} · {song.language}
                  </p>
                </div>
                <div class="flex flex-wrap items-center justify-end gap-2">
                  <span
                    class={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${songStatusClasses[song.status]}`}
                  >
                    {songStatusLabels[song.status]}
                  </span>
                  <span
                    class="rounded-full border border-[var(--color-border-soft)] bg-[var(--color-surface)] px-3 py-1 text-xs text-[var(--color-text-secondary)]"
                  >
                    {song.isPublic ? '公开' : '隐藏'}
                  </span>
                </div>
              </summary>

              <div class="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_140px]">
                <form method="POST" action="?/saveSong" class="grid gap-4 lg:grid-cols-2">
                  <input type="hidden" name="id" value={song.id} />

                  <label class="block space-y-2 text-sm text-[var(--color-text-secondary)] lg:col-span-2">
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

                  <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
                    <span>标签</span>
                    <input name="tagsInput" value={song.tags.join(', ')} class="form-field-muted" />
                  </label>

                  <label
                    class="flex items-center gap-3 rounded-[18px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-text-secondary)] lg:col-span-2"
                  >
                    <input
                      name="isPublic"
                      type="checkbox"
                      class="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
                      checked={song.isPublic}
                    />
                    <span>在公开歌单展示</span>
                  </label>

                  <button type="submit" class="button button-primary lg:col-span-2"> 保存修改 </button>
                </form>

                <form method="POST" action="?/deleteSong" class="flex flex-col justify-end" onsubmit={confirmDelete}>
                  <input type="hidden" name="id" value={song.id} />
                  <button type="submit" class="button button-neutral"> 删除歌曲 </button>
                </form>
              </div>
            </details>
          {/each}
        </div>
      </section>
    </Tabs.Content>

    <Tabs.Content value="requests">
      <section
        class="rounded-[30px] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6 shadow-sm lg:p-7"
      >
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-[var(--color-accent)]">愿望单管理</p>
            <h2 class="mt-1 text-2xl font-semibold text-[var(--color-text)]">观众提交记录</h2>
          </div>
          <span
            class="rounded-full border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] px-3 py-1 text-xs text-[var(--color-text-secondary)]"
          >
            {data.dashboard.requests.length} 条
          </span>
        </div>

        <div class="mt-6 space-y-4">
          {#each data.dashboard.requests as item}
            <details
              class="group rounded-[24px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] p-5 open:bg-[var(--color-surface)]"
            >
              <summary class="flex cursor-pointer list-none items-center justify-between gap-4">
                <div class="min-w-0">
                  <h3 class="truncate text-lg font-semibold text-[var(--color-text)]">{item.songTitle}</h3>
                  <p class="mt-1 truncate text-sm text-[var(--color-text-secondary)]">
                    {item.artist || '未填写'} · {item.language}
                  </p>
                </div>
                <div class="flex flex-wrap items-center justify-end gap-2">
                  <span
                    class={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${requestStatusClasses[item.status]}`}
                  >
                    {requestStatusLabels[item.status]}
                  </span>
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
                  >
                    <input type="hidden" name="id" value={item.id} />
                    <Select name="status" value="accepted" items={decisionItems} triggerClass="form-field-muted" />
                    <button type="submit" class="button button-primary"> 处理愿望 </button>
                  </form>
                {/if}
              </div>
            </details>
          {/each}
        </div>
      </section>
    </Tabs.Content>
  </Tabs.Root>
</div>

{#if settingsModalOpen}
  <SettingsModal settings={data.dashboard.settings} {adminError} onClose={() => (settingsModalOpen = false)} />
{/if}

{#if form?.playlistPreview && !importModalDismissed}
  <NeteaseImportModal preview={form.playlistPreview} {adminError} onClose={() => (importModalDismissed = true)} />
{/if}
