<script lang="ts">
  import { onDestroy } from 'svelte';
  import { songStatusClasses } from '$lib/status-styles';
  import {
    requestDecisionOptions,
    requestStatusLabels,
    songLanguageOptions,
    songStatusLabels,
    songStatusOptions,
    type RequestStatus
  } from '$lib/types';

  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form?: ActionData } = $props();
  let importModalDismissed = $state(false);
  let settingsModalOpen = $state(false);
  const adminError = $derived(form && 'adminError' in form ? form.adminError : undefined);

  let heroTitleInput = $state('');

  const createImagePreview = (getDefault: () => string) => {
    let preview = $state('');
    let objectUrl = '';

    const clear = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = '';
      }
    };

    const reset = () => {
      clear();
      preview = getDefault();
    };

    const onChange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      clear();
      if (file) {
        objectUrl = URL.createObjectURL(file);
        preview = objectUrl;
      } else {
        preview = getDefault();
      }
    };

    $effect(() => {
      if (!objectUrl) {
        preview = getDefault();
      }
    });

    return {
      get preview() { return preview; },
      onChange,
      reset,
      clear
    };
  };

  const avatarPreview = createImagePreview(() => data.dashboard.settings.avatar);
  const backgroundPreview = createImagePreview(() => data.dashboard.settings.background);

  onDestroy(() => {
    avatarPreview.clear();
    backgroundPreview.clear();
  });

  const openSettingsModal = () => {
    avatarPreview.reset();
    backgroundPreview.reset();
    heroTitleInput = data.dashboard.settings.heroTitle;
    settingsModalOpen = true;
  };

  $effect(() => {
    if (form && 'settingsModalOpen' in form && form.settingsModalOpen) {
      openSettingsModal();
    }
  });

  const closeSettingsModal = () => {
    settingsModalOpen = false;
    avatarPreview.reset();
    backgroundPreview.reset();
  };

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

  const closeImportModal = () => {
    importModalDismissed = true;
  };

  const requestStatusClass = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return 'border-[#5e6ad2]/30 bg-[#5e6ad2]/10 text-[var(--color-accent)]';
      case 'accepted':
        return 'border-[#10b981]/30 bg-[#10b981]/10 text-[var(--color-success-text)]';
      case 'refused':
        return 'border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]';
    }
  };
</script>

<svelte:head>
  <title>后台管理 | QingKong Songlist</title>
</svelte:head>

<div class="space-y-8">
  <section class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
    <div class="space-y-6">
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <span class="rounded-full border border-[#5e6ad2]/30 bg-[#5e6ad2]/10 px-4 py-1 text-sm font-medium text-[var(--color-accent)]">
            后台控制台
          </span>
        </div>

        <h1 class="mt-4 text-3xl font-semibold text-[var(--color-text)] lg:text-4xl">管理歌曲与愿望单</h1>
        <p class="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)] lg:text-base">
          维护公开歌单、调整歌曲状态，并处理观众提交的点歌请求。
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-3">
        <div class="rounded-[24px] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-5 shadow-sm">
          <p class="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">总歌曲数</p>
          <p class="mt-3 text-3xl font-semibold text-[var(--color-text)]">{data.dashboard.overview.totalSongs}</p>
        </div>
        <div class="rounded-[24px] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-5 shadow-sm">
          <p class="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">公开歌曲数</p>
          <p class="mt-3 text-3xl font-semibold text-[var(--color-text)]">{data.dashboard.overview.publicSongs}</p>
        </div>
        <div class="rounded-[24px] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-5 shadow-sm">
          <p class="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">待处理愿望</p>
          <p class="mt-3 text-3xl font-semibold text-[var(--color-text)]">{data.dashboard.overview.pendingRequests}</p>
        </div>
      </div>
    </div>

    <div class="rounded-[30px] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6 shadow-sm lg:p-7">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-sm font-medium text-[var(--color-accent)]">会话</p>
          <h2 class="mt-1 text-2xl font-semibold text-[var(--color-text)]">管理员操作</h2>
        </div>
        <div class="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            class="button button-neutral button-small"
            onclick={openSettingsModal}
          >
            页面配置
          </button>

          <form method="POST" action="?/resetDatabase" onsubmit={confirmReset}>
            <button
              type="submit"
              class="button button-neutral button-small"
            >
              重置数据库
            </button>
          </form>

          <form method="POST" action="?/logout">
            <button
              type="submit"
              class="button button-neutral button-small"
            >
              退出登录
            </button>
          </form>
        </div>
      </div>

      {#if form?.adminMessage}
        <div class="mt-5 rounded-[18px] border border-[#10b981]/30 bg-[#10b981]/10 px-4 py-3 text-sm text-[var(--color-success-text)]">
          {form.adminMessage}
        </div>
      {/if}

      {#if adminError}
        {#if !form?.playlistPreview}
          <div class="mt-5 rounded-[18px] border border-[#7170ff]/30 bg-[#7170ff]/10 px-4 py-3 text-sm text-[var(--color-accent)]">
            {adminError}
          </div>
        {/if}
      {/if}

    </div>
  </section>

  <section class="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
    <div class="rounded-[30px] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6 shadow-sm lg:p-7">
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
            <select name="language" class="form-field" required>
              {#each songLanguageOptions as language}
                <option value={language} selected={language === '其他'}>{language}</option>
              {/each}
            </select>
          </label>

          <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
            <span>状态</span>
            <select name="status" class="form-field">
              {#each songStatusOptions as status}
                <option value={status}>{songStatusLabels[status]}</option>
              {/each}
            </select>
          </label>
        </div>

        <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
          <span>标签（逗号分隔）</span>
          <input name="tagsInput" class="form-field" placeholder="例如：高能, 日语, 动画" />
        </label>

        <label class="flex items-center gap-3 rounded-[18px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
          <input name="isPublic" type="checkbox" class="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]" checked />
          <span>公开展示到前台歌单</span>
        </label>

        <button
          type="submit"
          class="button button-primary button-full"
        >
          保存歌曲
        </button>
      </form>

      <div class="mt-8 border-t border-[var(--color-border-soft)] pt-7">
        <div>
          <p class="text-sm font-medium text-[var(--color-accent)]">导入网易云</p>
          <h2 class="mt-1 text-2xl font-semibold text-[var(--color-text)]">解析公开歌单或单曲</h2>
        </div>

        <form method="POST" action="?/previewSong" class="mt-6 space-y-4" onsubmit={() => (importModalDismissed = false)}>
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
          >
            解析单曲
          </button>
        </form>

        <form method="POST" action="?/previewPlaylist" class="mt-6 space-y-4" onsubmit={() => (importModalDismissed = false)}>
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
          >
            解析歌单
          </button>
        </form>
      </div>
    </div>

    <div class="space-y-6">
      <section class="rounded-[30px] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6 shadow-sm lg:p-7">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-[var(--color-accent)]">歌曲列表</p>
            <h2 class="mt-1 text-2xl font-semibold text-[var(--color-text)]">已录入曲目</h2>
          </div>
          <span class="rounded-full border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] px-3 py-1 text-xs text-[var(--color-text-secondary)]">
            {data.dashboard.songs.length} 首
          </span>
        </div>

        <div class="mt-6 space-y-4">
          {#each data.dashboard.songs as song}
            <details class="group rounded-[24px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] p-5 open:bg-[var(--color-surface)]">
              <summary class="flex cursor-pointer list-none items-center justify-between gap-4">
                <div class="min-w-0">
                  <h3 class="truncate text-lg font-semibold text-[var(--color-text)]">{song.title}</h3>
                  <p class="mt-1 truncate text-sm text-[var(--color-text-secondary)]">{song.artist} · {song.language}</p>
                </div>
                <div class="flex flex-wrap items-center justify-end gap-2">
                  <span class={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${songStatusClasses[song.status]}`}>
                    {songStatusLabels[song.status]}
                  </span>
                  <span class="rounded-full border border-[var(--color-border-soft)] bg-[var(--color-surface)] px-3 py-1 text-xs text-[var(--color-text-secondary)]">
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
                    <select name="language" class="form-field-muted" required>
                      {#each songLanguageOptions as language}
                        <option value={language} selected={song.language === language}>{language}</option>
                      {/each}
                    </select>
                  </label>

                  <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
                    <span>状态</span>
                    <select name="status" class="form-field-muted">
                      {#each songStatusOptions as status}
                        <option value={status} selected={song.status === status}>{songStatusLabels[status]}</option>
                      {/each}
                    </select>
                  </label>

                  <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
                    <span>标签</span>
                    <input name="tagsInput" value={song.tags.join(', ')} class="form-field-muted" />
                  </label>

                  <label class="flex items-center gap-3 rounded-[18px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-text-secondary)] lg:col-span-2">
                    <input
                      name="isPublic"
                      type="checkbox"
                      class="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
                      checked={song.isPublic}
                    />
                    <span>在公开歌单展示</span>
                  </label>

                  <button
                    type="submit"
                    class="button button-primary lg:col-span-2"
                  >
                    保存修改
                  </button>
                </form>

                <form method="POST" action="?/deleteSong" class="flex flex-col justify-end" onsubmit={confirmDelete}>
                  <input type="hidden" name="id" value={song.id} />
                  <button
                    type="submit"
                    class="button button-neutral"
                  >
                    删除歌曲
                  </button>
                </form>
              </div>
            </details>
          {/each}
        </div>
      </section>

      <section class="rounded-[30px] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6 shadow-sm lg:p-7">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-[var(--color-accent)]">愿望单管理</p>
            <h2 class="mt-1 text-2xl font-semibold text-[var(--color-text)]">观众提交记录</h2>
          </div>
          <span class="rounded-full border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] px-3 py-1 text-xs text-[var(--color-text-secondary)]">
            {data.dashboard.requests.length} 条
          </span>
        </div>

        <div class="mt-6 space-y-4">
          {#each data.dashboard.requests as item}
            <article class="rounded-[24px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] p-5">
              <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <h3 class="break-words text-lg font-semibold text-[var(--color-text)]">{item.songTitle}</h3>
                    <span class={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${requestStatusClass(item.status)}`}>
                      {requestStatusLabels[item.status]}
                    </span>
                  </div>
                  <p class="mt-2 text-sm text-[var(--color-text-secondary)]">原唱：{item.artist || '未填写'}</p>
                  <p class="mt-1 text-sm text-[var(--color-text-secondary)]">语言：{item.language}</p>
                  <p class="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">{item.message}</p>
                  <div class="mt-4 flex flex-wrap gap-3 text-xs text-[var(--color-text-muted)]">
                    <span>提交者：{item.requesterName || '匿名'}</span>
                    <span>时间：{new Date(item.createdAt).toLocaleString('zh-CN')}</span>
                  </div>
                </div>

                {#if item.status === 'pending'}
                  <form method="POST" action="?/updateRequestStatus" class="flex w-full shrink-0 gap-3 lg:w-auto lg:min-w-[260px] lg:flex-col">
                    <input type="hidden" name="id" value={item.id} />
                    <select name="status" class="form-field-muted">
                      {#each requestDecisionOptions as status}
                        <option value={status}>{requestStatusLabels[status]}</option>
                      {/each}
                    </select>
                    <button
                      type="submit"
                      class="button button-primary"
                    >
                      处理愿望
                    </button>
                  </form>
                {/if}
              </div>
            </article>
          {/each}
        </div>
      </section>
    </div>
  </section>
</div>

{#if settingsModalOpen}
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
          onclick={closeSettingsModal}
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
{/if}

{#if form?.playlistPreview && !importModalDismissed}
  <div class="fixed inset-0 z-50 overflow-y-auto bg-[#191a1b]/50 px-4 py-8">
    <section class="mx-auto max-w-5xl rounded-[24px] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6 shadow-xl lg:p-7">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-medium text-[var(--color-accent)]">导入网易云</p>
          <h2 class="mt-1 text-2xl font-semibold text-[var(--color-text)]">歌曲导入</h2>
        </div>

        <button
          type="button"
          class="button button-neutral button-small"
          onclick={closeImportModal}
        >
          关闭
        </button>
      </div>

      {#if adminError}
        <div class="mt-5 rounded-[18px] border border-[#7170ff]/30 bg-[#7170ff]/10 px-4 py-3 text-sm text-[var(--color-accent)]">
          {adminError}
        </div>
      {/if}

      <form method="POST" action="?/importPlaylist" class="mt-6 space-y-5">
        <input type="hidden" name="playlistInput" value={form.playlistPreview.playlistInput} />
        <input type="hidden" name="songCount" value={form.playlistPreview.songs.length} />

        <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
          <span>状态</span>
          <select name="status" class="form-field">
            {#each songStatusOptions as status}
              <option value={status} selected={form.playlistPreview.status === status}>{songStatusLabels[status]}</option>
            {/each}
          </select>
        </label>

        <div class="rounded-[18px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
          {form.playlistPreview.songs.length} 首待确认
        </div>

        <div class="max-h-[56vh] overflow-auto rounded-[18px] border border-[var(--color-border-soft)]">
          <table class="w-full min-w-[760px] text-left text-sm">
            <thead class="sticky top-0 bg-[var(--color-surface)] text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
              <tr>
                <th class="w-12 px-3 py-3">选</th>
                <th class="px-3 py-3">歌曲</th>
                <th class="px-3 py-3">原唱</th>
                <th class="px-3 py-3">语言</th>
                <th class="px-3 py-3">标签</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-border-soft)] bg-[var(--color-surface)]">
              {#each form.playlistPreview.songs as song, index}
                <tr>
                  <td class="px-3 py-3 align-middle">
                    <div class="flex justify-center">
                      <input
                        name="selectedSong"
                        type="checkbox"
                        value={index}
                        class="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
                        checked
                      />
                    </div>
                    <input type="hidden" name={`songTitle-${index}`} value={song.title} />
                    <input type="hidden" name={`songArtist-${index}`} value={song.artist} />
                  </td>
                  <td class="px-3 py-3 text-[var(--color-text)]">{song.title}</td>
                  <td class="px-3 py-3 text-[var(--color-text-secondary)]">{song.artist}</td>
                  <td class="px-3 py-3">
                    <select name={`songLanguage-${index}`} class="form-field-muted min-w-28" required>
                      {#each songLanguageOptions as language}
                        <option value={language} selected={song.language === language}>{language}</option>
                      {/each}
                    </select>
                  </td>
                  <td class="px-3 py-3">
                    <input
                      name={`songTagsInput-${index}`}
                      class="form-field-muted min-w-48"
                      value={song.tagsInput ?? ''}
                      placeholder="例如：网易云导入"
                    />
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <button
          type="submit"
          class="button button-primary button-full"
        >
          导入勾选歌曲
        </button>
      </form>
    </section>
  </div>
{/if}
