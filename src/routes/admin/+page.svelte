<script lang="ts">
  import { browser } from '$app/environment';
  import AddSongPanel from '$lib/components/admin/AddSongPanel.svelte';
  import NeteaseImportModal from '$lib/components/admin/NeteaseImportModal.svelte';
  import OverviewCard from '$lib/components/admin/OverviewCard.svelte';
  import RequestListCard from '$lib/components/admin/RequestListCard.svelte';
  import SettingsModal from '$lib/components/admin/SettingsModal.svelte';
  import SongListCard from '$lib/components/admin/SongListCard.svelte';
  import { watchChange } from '$lib/svelte-utils.svelte';
  import { Tabs } from 'bits-ui';
  import { untrack } from 'svelte';
  import { toast } from 'svelte-sonner';

  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form?: ActionData } = $props();
  const initialActiveTab = browser && window.location.hash === '#requests' ? 'requests' : 'songs';
  let importModalDismissed = $state(true);
  let settingsModalOpen = $state(false);
  let activeTab = $state(initialActiveTab);
  let syncedHashTab = initialActiveTab;
  let addPanelActive = $state(
    untrack(() =>
      form && ('songImport' in form || 'playlistImport' in form || 'importPreview' in form) ? 'netease' : 'manual'
    )
  );

  const adminError = $derived(form && 'adminError' in form ? form.adminError : undefined);
  const settingsError = $derived(
    form && 'settingsModalOpen' in form && form.settingsModalOpen ? adminError : undefined
  );

  watchChange(
    () => form,
    (current) => {
      if (!current) return;
      if ('adminMessage' in current && current.adminMessage) {
        toast.success(current.adminMessage);
      }
      if ('adminError' in current && current.adminError) {
        const errorShownInModal =
          ('settingsModalOpen' in current && current.settingsModalOpen) ||
          ('importPreview' in current && current.importPreview);
        if (!errorShownInModal) toast.error(current.adminError);
      }
    }
  );

  $effect(() => {
    if (form && 'settingsModalOpen' in form && form.settingsModalOpen) {
      settingsModalOpen = true;
    }
  });

  watchChange(
    () => form?.importPreview ?? null,
    (preview) => {
      if (preview) importModalDismissed = false;
    }
  );

  $effect(() => {
    if (browser && activeTab !== syncedHashTab) {
      syncedHashTab = activeTab;
      window.history.replaceState(null, '', `#${activeTab}`);
    }
  });
</script>

<svelte:head>
  <title>后台管理 | QingKong Songlist</title>
</svelte:head>

<div class="space-y-6">
  <OverviewCard overview={data.dashboard.overview} onOpenSettings={() => (settingsModalOpen = true)} />

  <Tabs.Root bind:value={activeTab} class="space-y-5">
    <Tabs.List class="admin-tabs-list inline-flex">
      <Tabs.Trigger value="songs" class="admin-tab-trigger">
        歌曲 <span class="admin-tab-count">{data.dashboard.songs.length}</span>
      </Tabs.Trigger>
      <Tabs.Trigger value="requests" class="admin-tab-trigger">
        愿望单 <span class="admin-tab-count">{data.dashboard.requests.length}</span>
      </Tabs.Trigger>
    </Tabs.List>

    <Tabs.Content value="songs" class="grid items-start gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <AddSongPanel bind:active={addPanelActive} {form} />
      <SongListCard songs={data.dashboard.songs} />
    </Tabs.Content>

    <Tabs.Content value="requests">
      <RequestListCard requests={data.dashboard.requests} />
    </Tabs.Content>
  </Tabs.Root>
</div>

<SettingsModal settings={data.dashboard.settings} adminError={settingsError} bind:open={settingsModalOpen} />

{#if form?.importPreview && !importModalDismissed}
  <NeteaseImportModal preview={form.importPreview} {adminError} onClose={() => (importModalDismissed = true)} />
{/if}
