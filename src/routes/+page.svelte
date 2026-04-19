<script lang="ts">
  import { songStatusLabels, type Song, type SongStatus } from '$lib/types';

  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form?: ActionData } = $props();

  let query = $state('');
  let selectedLanguage = $state('all');
  let selectedTag = $state('all');
  let selectedStatus = $state<'all' | SongStatus>('all');

  const coverImage =
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1740&auto=format&fit=crop';

  const normalize = (value: string) => value.trim().toLowerCase();

  const statusClass = (status: SongStatus) => {
    switch (status) {
      case 'ready':
        return 'border-[#10b981]/30 bg-[#10b981]/10 text-[#27a644]';
      case 'learning':
        return 'border-[#7170ff]/30 bg-[#7170ff]/10 text-[#5e6ad2]';
      case 'resting':
        return 'border-[#d0d6e0] bg-[#f3f4f5] text-[#62666d]';
    }
  };

  const matchesKeyword = (song: Song, keyword: string) => {
    if (!keyword) {
      return true;
    }

    return [song.title, song.artist, ...song.tags].some((value) => normalize(value).includes(keyword));
  };

  const filteredSongs = $derived.by(() => {
    const keyword = normalize(query);

    return data.catalog.songs.filter((song) => {
      const matchesLanguage = selectedLanguage === 'all' || song.language === selectedLanguage;
      const matchesTag = selectedTag === 'all' || song.tags.includes(selectedTag);
      const matchesStatus = selectedStatus === 'all' || song.status === selectedStatus;

      return matchesKeyword(song, keyword) && matchesLanguage && matchesTag && matchesStatus;
    });
  });
</script>

<svelte:head>
  <title>{data.catalog.streamer.name} | 公开歌单</title>
</svelte:head>

<div class="space-y-8 lg:space-y-10">
  <section class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-stretch xl:grid-cols-[minmax(0,1fr)_460px]">
    <div class="overflow-hidden rounded-[32px] border border-[#e6e6e6] bg-white shadow-sm">
      <div class="relative h-full min-h-[280px] lg:min-h-[360px]">
        <img
          src={coverImage}
          alt="舞台麦克风和灯光"
          class="absolute inset-0 h-full w-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/40"></div>

        <div class="relative flex h-full min-h-[420px] flex-col justify-between gap-8 p-6 lg:min-h-[540px] lg:p-10">
          <div class="flex flex-wrap items-center gap-3">
            <span class={`inline-flex rounded-full px-4 py-1 text-sm font-semibold text-white ${data.catalog.streamer.accent}`}>
              {data.catalog.streamer.name}
            </span>
          </div>

          <div class="max-w-3xl space-y-4">
            <h1 class="text-3xl font-semibold tracking-tight text-[#191a1b] lg:text-5xl">
              {data.catalog.streamer.tagline}
            </h1>
            <p class="max-w-2xl text-sm leading-7 text-[#62666d] lg:text-base">
              {data.catalog.streamer.description}
            </p>
          </div>

          <div class="space-y-4">
            <div class="grid gap-3 sm:grid-cols-3">
              <div class="rounded-[24px] border border-[#e6e6e6] bg-white/90 p-4 shadow-sm backdrop-blur">
                <p class="text-xs font-medium uppercase tracking-[0.14em] text-[#8a8f98]">公开曲目</p>
                <p class="mt-3 text-3xl font-semibold text-[#191a1b]">{data.catalog.stats.publicSongs}</p>
                <p class="mt-1 text-xs text-[#62666d]">首可浏览歌曲</p>
              </div>

              <div class="rounded-[24px] border border-[#e6e6e6] bg-white/90 p-4 shadow-sm backdrop-blur">
                <p class="text-xs font-medium uppercase tracking-[0.14em] text-[#8a8f98]">待处理曲目</p>
                <p class="mt-3 text-3xl font-semibold text-[#191a1b]">{data.catalog.stats.pendingRequests}</p>
                <p class="mt-1 text-xs text-[#62666d]">条愿望单请求</p>
              </div>

              <div class="rounded-[24px] border border-[#e6e6e6] bg-white/90 p-4 shadow-sm backdrop-blur">
                <p class="text-xs font-medium uppercase tracking-[0.14em] text-[#8a8f98]">标签总览</p>
                <p class="mt-3 text-3xl font-semibold text-[#191a1b]">{data.catalog.tags.length}</p>
                <p class="mt-1 text-xs text-[#62666d]">个筛选标签</p>
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-3">
              {#each data.catalog.streamer.platforms as platform}
                <a
                  href={platform.href}
                  target="_blank"
                  rel="noreferrer"
                  class="rounded-[18px] border border-[#e6e6e6] bg-white/90 px-4 py-3 text-sm font-medium text-[#191a1b] shadow-sm transition hover:border-[#d0d6e0] hover:bg-[#f5f6f7] hover:text-[#5e6ad2]"
                >
                  前往 {platform.label}
                </a>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="overflow-hidden rounded-[32px] border border-[#e6e6e6] bg-white shadow-sm">
      <div class="border-b border-[#e6e6e6] bg-[#f5f6f7] px-6 py-6 lg:px-7">
        <div class="flex flex-col gap-4">
          <span class="w-fit rounded-full border border-[#d0d6e0] bg-white px-3 py-1 text-xs font-medium text-[#62666d]">
            无需登录
          </span>

          <div>
            <p class="text-sm font-medium text-[#5e6ad2]">愿望单提交</p>
            <h2 class="mt-2 text-2xl font-semibold leading-tight text-[#191a1b]">
              想听哪首歌？
            </h2>
            <p class="mt-3 text-sm leading-6 text-[#62666d]">
              写下歌名、原唱和一点想法，主播之后会在后台统一处理。
            </p>
          </div>
        </div>
      </div>

      <div class="p-6 lg:p-7">
        {#if form?.requestMessage || form?.requestError}
          <div class="space-y-3">
            {#if form?.requestMessage}
              <div class="rounded-[20px] border border-[#10b981]/30 bg-[#10b981]/10 px-4 py-3 text-sm text-[#27a644]">
                {form.requestMessage}
              </div>
            {/if}

            {#if form?.requestError}
              <div class="rounded-[20px] border border-[#7170ff]/30 bg-[#7170ff]/10 px-4 py-3 text-sm text-[#5e6ad2]">
                {form.requestError}
              </div>
            {/if}
          </div>
        {/if}

        <form method="POST" class={`grid gap-5 ${form?.requestMessage || form?.requestError ? 'mt-5' : ''}`}>
          <label class="block space-y-2 text-sm text-[#62666d]">
            <span>歌曲名</span>
            <input
              name="songTitle"
              value={form?.requestValues?.songTitle ?? ''}
              class="form-field"
              placeholder="例如：群青"
            />
          </label>

          <label class="block space-y-2 text-sm text-[#62666d]">
            <span>原唱</span>
            <input
              name="artist"
              value={form?.requestValues?.artist ?? ''}
              class="form-field"
              placeholder="例如：YOASOBI"
            />
          </label>

          <label class="block space-y-2 text-sm text-[#62666d]">
            <span>留言</span>
            <textarea
              name="message"
              rows="5"
              class="form-field"
              placeholder="可以说说为什么想听、适合什么场合唱。"
            >{form?.requestValues?.message ?? ''}</textarea>
          </label>

          <label class="block space-y-2 text-sm text-[#62666d]">
            <span>你的昵称（可选）</span>
            <input
              name="requesterName"
              value={form?.requestValues?.requesterName ?? ''}
              class="form-field"
              placeholder="例如：夜猫子"
            />
          </label>

          <button
            type="submit"
            class="mt-1 inline-flex w-full items-center justify-center rounded-[18px] bg-[#5e6ad2] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#828fff]"
          >
            提交愿望单
          </button>
        </form>
      </div>
    </div>
  </section>

  <section class="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
    <aside class="h-fit rounded-[30px] border border-[#e6e6e6] bg-white p-5 shadow-sm lg:sticky lg:top-24">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-sm font-medium text-[#5e6ad2]">公开歌单</p>
          <h2 class="mt-1 text-2xl font-semibold text-[#191a1b]">搜索与筛选</h2>
        </div>
        <span class="rounded-full border border-[#e6e6e6] bg-[#f5f6f7] px-3 py-1 text-xs text-[#62666d]">
          {filteredSongs.length} / {data.catalog.songs.length}
        </span>
      </div>

      <div class="mt-5 space-y-4">
        <label class="block space-y-2 text-sm text-[#62666d]">
          <span>搜索</span>
          <input
            bind:value={query}
            class="form-field"
            placeholder="按歌名、原唱、标签搜索"
          />
        </label>

        <label class="block space-y-2 text-sm text-[#62666d]">
          <span>语言</span>
          <select bind:value={selectedLanguage} class="form-field">
            <option value="all">全部语言</option>
            {#each data.catalog.languages as language}
              <option value={language}>{language}</option>
            {/each}
          </select>
        </label>

        <label class="block space-y-2 text-sm text-[#62666d]">
          <span>标签</span>
          <select bind:value={selectedTag} class="form-field">
            <option value="all">全部标签</option>
            {#each data.catalog.tags as tag}
              <option value={tag}>{tag}</option>
            {/each}
          </select>
        </label>

        <label class="block space-y-2 text-sm text-[#62666d]">
          <span>当前状态</span>
          <select bind:value={selectedStatus} class="form-field">
            <option value="all">全部状态</option>
            {#each data.catalog.statuses as status}
              <option value={status}>{songStatusLabels[status]}</option>
            {/each}
          </select>
        </label>
      </div>
    </aside>

    <div class="overflow-hidden rounded-[28px] border border-[#e6e6e6] bg-white shadow-sm">
      <div class="hidden grid-cols-[minmax(0,2fr)_minmax(0,1.6fr)_120px_140px_1.7fr] gap-4 border-b border-[#e6e6e6] bg-[#f5f6f7] px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8f98] lg:grid">
        <div>歌曲名</div>
        <div>原唱</div>
        <div>语言</div>
        <div>当前状态</div>
        <div>标签</div>
      </div>

      {#if filteredSongs.length > 0}
        <div class="divide-y divide-[#e6e6e6]">
          {#each filteredSongs as song}
            <article class="grid gap-4 p-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.6fr)_120px_140px_1.7fr] lg:items-center lg:px-6">
              <div class="min-w-0">
                <p class="text-xs uppercase tracking-[0.14em] text-[#8a8f98] lg:hidden">歌曲名</p>
                <h3 class="mt-1 break-words text-lg font-semibold text-[#191a1b] lg:mt-0 lg:text-base">{song.title}</h3>
              </div>

              <div class="min-w-0 text-sm text-[#62666d]">
                <p class="text-xs uppercase tracking-[0.14em] text-[#8a8f98] lg:hidden">原唱</p>
                <p class="mt-1 truncate lg:mt-0">{song.artist}</p>
              </div>

              <div class="text-sm text-[#62666d]">
                <p class="text-xs uppercase tracking-[0.14em] text-[#8a8f98] lg:hidden">语言</p>
                <p class="mt-1 lg:mt-0">{song.language}</p>
              </div>

              <div>
                <p class="mb-2 text-xs uppercase tracking-[0.14em] text-[#8a8f98] lg:hidden">当前状态</p>
                <span class={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusClass(song.status)}`}>
                  {songStatusLabels[song.status]}
                </span>
              </div>

              <div>
                <p class="mb-2 text-xs uppercase tracking-[0.14em] text-[#8a8f98] lg:hidden">标签</p>
                <div class="flex flex-wrap gap-2">
                  {#each song.tags as tag}
                    <span class="rounded-full border border-[#d0d6e0] bg-[#f5f6f7] px-3 py-1 text-xs text-[#62666d]">
                      {tag}
                    </span>
                  {/each}
                </div>
              </div>
            </article>
          {/each}
        </div>
      {:else}
        <div class="px-6 py-16 text-center text-sm text-[#8a8f98]">
          当前筛选下没有结果，试试放宽关键词或筛选项。
        </div>
      {/if}
    </div>
  </section>
</div>
