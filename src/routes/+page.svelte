<script lang="ts">
  import Hero from '$lib/components/public/Hero.svelte';
  import RequestForm from '$lib/components/public/RequestForm.svelte';
  import SongTable from '$lib/components/public/SongTable.svelte';
  import {
    songLanguageOptions,
    songStatusLabels,
    songStatusOptions,
    type Song,
    type SongLanguage,
    type SongStatus
  } from '$lib/types';

  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form?: ActionData } = $props();

  let query = $state('');
  let selectedLanguage = $state<'all' | SongLanguage>('all');
  let selectedTag = $state<string>('all');
  let selectedStatus = $state<'all' | SongStatus>('all');

  const normalize = (value: string) => value.trim().toLowerCase();

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
  <Hero catalog={data.catalog} />

  <section class="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
    <aside
      class="h-fit rounded-[30px] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-5 shadow-sm lg:sticky lg:top-24"
    >
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-sm font-medium text-[var(--color-accent)]">公开歌单</p>
          <h2 class="mt-1 text-2xl font-semibold text-[var(--color-text)]">搜索与筛选</h2>
        </div>
        <span
          class="rounded-full border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] px-3 py-1 text-xs text-[var(--color-text-secondary)]"
        >
          {filteredSongs.length} / {data.catalog.songs.length}
        </span>
      </div>

      <div class="mt-5 space-y-4">
        <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
          <span>搜索</span>
          <input bind:value={query} class="form-field" placeholder="按歌名、原唱、标签搜索" />
        </label>

        <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
          <span>语言</span>
          <select bind:value={selectedLanguage} class="form-field">
            <option value="all">全部语言</option>
            {#each songLanguageOptions as language}
              <option value={language}>{language}</option>
            {/each}
          </select>
        </label>

        <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
          <span>标签</span>
          <select bind:value={selectedTag} class="form-field">
            <option value="all">全部标签</option>
            {#each data.catalog.tags as tag}
              <option value={tag}>{tag}</option>
            {/each}
          </select>
        </label>

        <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
          <span>当前状态</span>
          <select bind:value={selectedStatus} class="form-field">
            <option value="all">全部状态</option>
            {#each songStatusOptions as status}
              <option value={status}>{songStatusLabels[status]}</option>
            {/each}
          </select>
        </label>
      </div>
    </aside>

    <SongTable songs={filteredSongs} />
  </section>

  <RequestForm {form} />
</div>
