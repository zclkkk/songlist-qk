<script lang="ts">
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
  const adminError = $derived(form && 'adminError' in form ? form.adminError : undefined);

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
        return 'border-[#5e6ad2]/30 bg-[#5e6ad2]/10 text-[#5e6ad2]';
      case 'accepted':
        return 'border-[#10b981]/30 bg-[#10b981]/10 text-[#27a644]';
      case 'refused':
        return 'border-[#d0d6e0] bg-[#f3f4f5] text-[#62666d]';
    }
  };
</script>

<svelte:head>
  <title>后台管理 | VTuber Songboard</title>
</svelte:head>

<div class="space-y-8">
  <section class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
    <div class="space-y-6">
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <span class="rounded-full border border-[#5e6ad2]/30 bg-[#5e6ad2]/10 px-4 py-1 text-sm font-medium text-[#5e6ad2]">
            后台控制台
          </span>
        </div>

        <h1 class="mt-4 text-3xl font-semibold text-[#191a1b] lg:text-4xl">管理歌曲与愿望单</h1>
        <p class="mt-3 max-w-3xl text-sm leading-7 text-[#62666d] lg:text-base">
          维护公开歌单、调整歌曲状态，并处理观众提交的点歌请求。
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-3">
        <div class="rounded-[24px] border border-[#e6e6e6] bg-white p-5 shadow-sm">
          <p class="text-xs uppercase tracking-[0.14em] text-[#8a8f98]">总歌曲数</p>
          <p class="mt-3 text-3xl font-semibold text-[#191a1b]">{data.dashboard.overview.totalSongs}</p>
        </div>
        <div class="rounded-[24px] border border-[#e6e6e6] bg-white p-5 shadow-sm">
          <p class="text-xs uppercase tracking-[0.14em] text-[#8a8f98]">公开歌曲数</p>
          <p class="mt-3 text-3xl font-semibold text-[#191a1b]">{data.dashboard.overview.publicSongs}</p>
        </div>
        <div class="rounded-[24px] border border-[#e6e6e6] bg-white p-5 shadow-sm">
          <p class="text-xs uppercase tracking-[0.14em] text-[#8a8f98]">待处理愿望</p>
          <p class="mt-3 text-3xl font-semibold text-[#191a1b]">{data.dashboard.overview.pendingRequests}</p>
        </div>
      </div>
    </div>

    <div class="rounded-[30px] border border-[#e6e6e6] bg-white p-6 shadow-sm lg:p-7">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-sm font-medium text-[#5e6ad2]">会话</p>
          <h2 class="mt-1 text-2xl font-semibold text-[#191a1b]">管理员操作</h2>
        </div>
        <div class="flex flex-wrap items-center justify-end gap-2">
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
        <div class="mt-5 rounded-[18px] border border-[#10b981]/30 bg-[#10b981]/10 px-4 py-3 text-sm text-[#27a644]">
          {form.adminMessage}
        </div>
      {/if}

      {#if adminError}
        {#if !form?.playlistPreview}
          <div class="mt-5 rounded-[18px] border border-[#7170ff]/30 bg-[#7170ff]/10 px-4 py-3 text-sm text-[#5e6ad2]">
            {adminError}
          </div>
        {/if}
      {/if}

    </div>
  </section>

  <section class="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
    <div class="rounded-[30px] border border-[#e6e6e6] bg-white p-6 shadow-sm lg:p-7">
      <div>
        <p class="text-sm font-medium text-[#5e6ad2]">新增歌曲</p>
        <h2 class="mt-1 text-2xl font-semibold text-[#191a1b]">创建公开歌单条目</h2>
      </div>

      <form method="POST" action="?/saveSong" class="mt-6 space-y-4">
        <label class="block space-y-2 text-sm text-[#62666d]">
          <span>歌曲名</span>
          <input name="title" class="form-field" placeholder="例如：祝福" />
        </label>

        <label class="block space-y-2 text-sm text-[#62666d]">
          <span>原唱</span>
          <input name="artist" class="form-field" placeholder="例如：YOASOBI" />
        </label>

        <div class="grid gap-4 sm:grid-cols-2">
          <label class="block space-y-2 text-sm text-[#62666d]">
            <span>语言</span>
            <select name="language" class="form-field" required>
              {#each songLanguageOptions as language}
                <option value={language} selected={language === '其他'}>{language}</option>
              {/each}
            </select>
          </label>

          <label class="block space-y-2 text-sm text-[#62666d]">
            <span>状态</span>
            <select name="status" class="form-field">
              {#each songStatusOptions as status}
                <option value={status}>{songStatusLabels[status]}</option>
              {/each}
            </select>
          </label>
        </div>

        <label class="block space-y-2 text-sm text-[#62666d]">
          <span>标签（逗号分隔）</span>
          <input name="tagsInput" class="form-field" placeholder="例如：高能, 日语, 动画" />
        </label>

        <label class="flex items-center gap-3 rounded-[18px] border border-[#e6e6e6] bg-[#f5f6f7] px-4 py-3 text-sm text-[#62666d]">
          <input name="isPublic" type="checkbox" class="h-4 w-4 rounded border-[#d0d6e0] accent-[#5e6ad2]" checked />
          <span>公开展示到前台歌单</span>
        </label>

        <button
          type="submit"
          class="button button-primary button-full"
        >
          保存歌曲
        </button>
      </form>

      <div class="mt-8 border-t border-[#e6e6e6] pt-7">
        <div>
          <p class="text-sm font-medium text-[#5e6ad2]">导入网易云</p>
          <h2 class="mt-1 text-2xl font-semibold text-[#191a1b]">解析公开歌单或单曲</h2>
        </div>

        <form method="POST" action="?/previewSong" class="mt-6 space-y-4" onsubmit={() => (importModalDismissed = false)}>
          <label class="block space-y-2 text-sm text-[#62666d]">
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
          <label class="block space-y-2 text-sm text-[#62666d]">
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
      <section class="rounded-[30px] border border-[#e6e6e6] bg-white p-6 shadow-sm lg:p-7">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-[#5e6ad2]">歌曲列表</p>
            <h2 class="mt-1 text-2xl font-semibold text-[#191a1b]">已录入曲目</h2>
          </div>
          <span class="rounded-full border border-[#e6e6e6] bg-[#f5f6f7] px-3 py-1 text-xs text-[#62666d]">
            {data.dashboard.songs.length} 首
          </span>
        </div>

        <div class="mt-6 space-y-4">
          {#each data.dashboard.songs as song}
            <details class="group rounded-[24px] border border-[#e6e6e6] bg-[#f5f6f7] p-5 open:bg-white">
              <summary class="flex cursor-pointer list-none items-center justify-between gap-4">
                <div class="min-w-0">
                  <h3 class="truncate text-lg font-semibold text-[#191a1b]">{song.title}</h3>
                  <p class="mt-1 truncate text-sm text-[#62666d]">{song.artist} · {song.language}</p>
                </div>
                <div class="flex flex-wrap items-center justify-end gap-2">
                  <span class={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${songStatusClasses[song.status]}`}>
                    {songStatusLabels[song.status]}
                  </span>
                  <span class="rounded-full border border-[#e6e6e6] bg-white px-3 py-1 text-xs text-[#62666d]">
                    {song.isPublic ? '公开' : '隐藏'}
                  </span>
                </div>
              </summary>

              <div class="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_140px]">
                <form method="POST" action="?/saveSong" class="grid gap-4 lg:grid-cols-2">
                  <input type="hidden" name="id" value={song.id} />

                  <label class="block space-y-2 text-sm text-[#62666d] lg:col-span-2">
                    <span>歌曲名</span>
                    <input name="title" value={song.title} class="form-field-muted" />
                  </label>

                  <label class="block space-y-2 text-sm text-[#62666d]">
                    <span>原唱</span>
                    <input name="artist" value={song.artist} class="form-field-muted" />
                  </label>

                  <label class="block space-y-2 text-sm text-[#62666d]">
                    <span>语言</span>
                    <select name="language" class="form-field-muted" required>
                      {#each songLanguageOptions as language}
                        <option value={language} selected={song.language === language}>{language}</option>
                      {/each}
                    </select>
                  </label>

                  <label class="block space-y-2 text-sm text-[#62666d]">
                    <span>状态</span>
                    <select name="status" class="form-field-muted">
                      {#each songStatusOptions as status}
                        <option value={status} selected={song.status === status}>{songStatusLabels[status]}</option>
                      {/each}
                    </select>
                  </label>

                  <label class="block space-y-2 text-sm text-[#62666d]">
                    <span>标签</span>
                    <input name="tagsInput" value={song.tags.join(', ')} class="form-field-muted" />
                  </label>

                  <label class="flex items-center gap-3 rounded-[18px] border border-[#e6e6e6] bg-[#f5f6f7] px-4 py-3 text-sm text-[#62666d] lg:col-span-2">
                    <input
                      name="isPublic"
                      type="checkbox"
                      class="h-4 w-4 rounded border-[#d0d6e0] accent-[#5e6ad2]"
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

      <section class="rounded-[30px] border border-[#e6e6e6] bg-white p-6 shadow-sm lg:p-7">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-[#5e6ad2]">愿望单管理</p>
            <h2 class="mt-1 text-2xl font-semibold text-[#191a1b]">观众提交记录</h2>
          </div>
          <span class="rounded-full border border-[#e6e6e6] bg-[#f5f6f7] px-3 py-1 text-xs text-[#62666d]">
            {data.dashboard.requests.length} 条
          </span>
        </div>

        <div class="mt-6 space-y-4">
          {#each data.dashboard.requests as item}
            <article class="rounded-[24px] border border-[#e6e6e6] bg-[#f5f6f7] p-5">
              <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <h3 class="break-words text-lg font-semibold text-[#191a1b]">{item.songTitle}</h3>
                    <span class={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${requestStatusClass(item.status)}`}>
                      {requestStatusLabels[item.status]}
                    </span>
                  </div>
                  <p class="mt-2 text-sm text-[#62666d]">原唱：{item.artist || '未填写'}</p>
                  <p class="mt-1 text-sm text-[#62666d]">语言：{item.language}</p>
                  <p class="mt-3 text-sm leading-7 text-[#62666d]">{item.message}</p>
                  <div class="mt-4 flex flex-wrap gap-3 text-xs text-[#8a8f98]">
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

{#if form?.playlistPreview && !importModalDismissed}
  <div class="fixed inset-0 z-50 overflow-y-auto bg-[#191a1b]/50 px-4 py-8">
    <section class="mx-auto max-w-5xl rounded-[24px] border border-[#e6e6e6] bg-white p-6 shadow-xl lg:p-7">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-medium text-[#5e6ad2]">导入网易云</p>
          <h2 class="mt-1 text-2xl font-semibold text-[#191a1b]">歌曲导入</h2>
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
        <div class="mt-5 rounded-[18px] border border-[#7170ff]/30 bg-[#7170ff]/10 px-4 py-3 text-sm text-[#5e6ad2]">
          {adminError}
        </div>
      {/if}

      <form method="POST" action="?/importPlaylist" class="mt-6 space-y-5">
        <input type="hidden" name="playlistInput" value={form.playlistPreview.playlistInput} />
        <input type="hidden" name="songCount" value={form.playlistPreview.songs.length} />

        <label class="block space-y-2 text-sm text-[#62666d]">
          <span>状态</span>
          <select name="status" class="form-field">
            {#each songStatusOptions as status}
              <option value={status} selected={form.playlistPreview.status === status}>{songStatusLabels[status]}</option>
            {/each}
          </select>
        </label>

        <div class="rounded-[18px] border border-[#e6e6e6] bg-[#f5f6f7] px-4 py-3 text-sm text-[#62666d]">
          {form.playlistPreview.songs.length} 首待确认
        </div>

        <div class="max-h-[56vh] overflow-auto rounded-[18px] border border-[#e6e6e6]">
          <table class="w-full min-w-[760px] text-left text-sm">
            <thead class="sticky top-0 bg-white text-xs uppercase tracking-[0.12em] text-[#8a8f98]">
              <tr>
                <th class="w-12 px-3 py-3">选</th>
                <th class="px-3 py-3">歌曲</th>
                <th class="px-3 py-3">原唱</th>
                <th class="px-3 py-3">语言</th>
                <th class="px-3 py-3">标签</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#e6e6e6] bg-white">
              {#each form.playlistPreview.songs as song, index}
                <tr>
                  <td class="px-3 py-3 align-middle">
                    <div class="flex justify-center">
                      <input
                        name="selectedSong"
                        type="checkbox"
                        value={index}
                        class="h-4 w-4 rounded border-[#d0d6e0] accent-[#5e6ad2]"
                        checked
                      />
                    </div>
                    <input type="hidden" name={`songTitle-${index}`} value={song.title} />
                    <input type="hidden" name={`songArtist-${index}`} value={song.artist} />
                  </td>
                  <td class="px-3 py-3 text-[#191a1b]">{song.title}</td>
                  <td class="px-3 py-3 text-[#62666d]">{song.artist}</td>
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
