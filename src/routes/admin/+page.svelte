<script lang="ts">
  import { browser } from '$app/environment';
  import AddSongPanel from '$lib/components/admin/AddSongPanel.svelte';
  import NeteaseImportModal from '$lib/components/admin/NeteaseImportModal.svelte';
  import OverviewCard from '$lib/components/admin/OverviewCard.svelte';
  import RequestListCard from '$lib/components/admin/RequestListCard.svelte';
  import SettingsModal from '$lib/components/admin/SettingsModal.svelte';
  import SongListCard from '$lib/components/admin/SongListCard.svelte';
  import { Tabs } from 'bits-ui';
  import { untrack } from 'svelte';
  import { toast } from 'svelte-sonner';

  import type { ActionData, PageData } from './$types';

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

  const adminError = $derived(form && 'adminError' in form ? form.adminError : undefined);
  const settingsError = $derived(
    form && 'settingsModalOpen' in form && form.settingsModalOpen ? adminError : undefined
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

{#if form?.playlistPreview && !importModalDismissed}
  <NeteaseImportModal preview={form.playlistPreview} {adminError} onClose={() => (importModalDismissed = true)} />
{/if}
