<script lang="ts">
  import '../app.css';

  import Header from '$lib/components/Header.svelte';

  import type { Snippet } from 'svelte';

  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<svelte:head>
  <title>QingKong Songlist</title>
  <meta name="description" content="单主播 VTuber 歌单站，支持公开歌单展示、搜索筛选、愿望单提交与后台管理。" />
</svelte:head>

<div class="min-h-screen">
  <div class="pointer-events-none fixed inset-0 -z-10 opacity-0 transition-opacity duration-300 dark:opacity-100">
    <div
      class="absolute top-[-18rem] left-[-14rem] h-[36rem] w-[36rem] rounded-full bg-[#2563eb]/20 blur-[120px]"
    ></div>
    <div class="absolute top-24 right-[-16rem] h-[34rem] w-[34rem] rounded-full bg-[#14b8a6]/10 blur-[120px]"></div>
  </div>

  <Header isAdmin={data.isAdmin} />

  <main class="mx-auto max-w-7xl px-4 pt-8 pb-16 lg:px-6 lg:pt-10">
    {@render children()}
  </main>
</div>
