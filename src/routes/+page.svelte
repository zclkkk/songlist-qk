<script lang="ts">
  import FilterPanel from '$lib/components/public/FilterPanel.svelte';
  import Hero from '$lib/components/public/Hero.svelte';
  import RequestForm from '$lib/components/public/RequestForm.svelte';
  import SongTable from '$lib/components/public/SongTable.svelte';
  import { matchesSongKeyword } from '$lib/songs';
  import { type SongLanguage, type SongStatus } from '$lib/types';

  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form?: ActionData } = $props();

  let query = $state('');
  let selectedLanguage = $state<'all' | SongLanguage>('all');
  let selectedTag = $state<string>('all');
  let selectedStatus = $state<'all' | SongStatus>('all');

  const filteredSongs = $derived(
    data.catalog.songs.filter((song) => {
      const matchesLanguage = selectedLanguage === 'all' || song.language === selectedLanguage;
      const matchesTag = selectedTag === 'all' || song.tags.includes(selectedTag);
      const matchesStatus = selectedStatus === 'all' || song.status === selectedStatus;

      return matchesSongKeyword(song, query) && matchesLanguage && matchesTag && matchesStatus;
    })
  );
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
