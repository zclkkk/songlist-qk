<script lang="ts">
  import FilterPanel from '$lib/components/public/FilterPanel.svelte';
  import Hero from '$lib/components/public/Hero.svelte';
  import RequestForm from '$lib/components/public/RequestForm.svelte';
  import SongTable from '$lib/components/public/SongTable.svelte';
  import { type Song, type SongLanguage, type SongStatus } from '$lib/types';

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
    <FilterPanel
      tags={data.catalog.tags}
      total={data.catalog.songs.length}
      filtered={filteredSongs.length}
      bind:query
      bind:language={selectedLanguage}
      bind:tag={selectedTag}
      bind:status={selectedStatus}
    />

    <SongTable songs={filteredSongs} />
  </section>

  <RequestForm {form} />
</div>
