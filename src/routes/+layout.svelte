<script lang="ts">
  import '../app.css';

  import { getCurrentYearInShanghai } from '$lib/datetime';
  import Header from '$lib/components/Header.svelte';
  import { Toaster } from 'svelte-sonner';

  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();
  const currentYear = getCurrentYearInShanghai();
</script>

<svelte:head>
  <title>QingKong Songlist</title>
  <meta name="description" content="单主播 VTuber 歌单站，支持公开歌单展示、搜索筛选、愿望单提交与后台管理。" />
</svelte:head>

<div class="page-layer flex min-h-screen flex-col">
  <div class="site-background" aria-hidden="true"></div>
  <div class="noise-overlay" aria-hidden="true"></div>

  <div class="content-layer flex min-h-screen flex-col">
    <Header isAdmin={data.isAdmin} />

    <main class="mx-auto w-full max-w-7xl flex-1 px-4 pt-5 pb-16 lg:px-6 lg:pt-7">
      {@render children()}
    </main>

    <footer class="site-footer">
      <div class="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 lg:px-6">
        <p class="text-xs text-[var(--color-text-muted)]">
          © {currentYear} QingKong Songlist
        </p>
        <p class="text-xs text-[var(--color-text-muted)]">由 SvelteKit 驱动</p>
      </div>
    </footer>
  </div>
</div>

<Toaster
  position="top-right"
  richColors
  closeButton
  toastOptions={{
    duration: 3500,
    classes: {
      toast: 'qk-toast'
    }
  }}
/>
