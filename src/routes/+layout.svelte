<script lang="ts">
  import '../app.css';

  import { onMount } from 'svelte';

  import type { Snippet } from 'svelte';

  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();
  let isDark = $state(false);

  onMount(() => {
    isDark = document.documentElement.classList.contains('dark');
  });

  const toggleTheme = () => {
    isDark = !isDark;
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };
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

  <header
    class="sticky top-0 z-20 border-b border-[var(--color-border-soft)] bg-[var(--color-surface-overlay)] shadow-sm backdrop-blur-xl"
  >
    <div class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
      <a href="/" class="flex min-w-0 items-center gap-3 text-sm font-medium text-[var(--color-text)]">
        <span
          class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[var(--color-accent)] text-base font-semibold text-white shadow-sm"
        >
          歌
        </span>
        <span class="flex min-w-0 flex-col">
          <span class="text-base font-semibold">QingKong Songlist</span>
          <span class="text-xs text-[var(--color-text-muted)]">单主播歌单与愿望单管理</span>
        </span>
      </a>

      <nav class="flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-secondary)]">
        <button
          type="button"
          class="button button-neutral button-small flex items-center justify-center p-2"
          aria-pressed={isDark}
          onclick={toggleTheme}
          aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
        >
          {#if isDark}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path
                d="m4.93 4.93 1.41 1.41"
              /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path
                d="m6.34 17.66-1.41 1.41"
              /><path d="m19.07 4.93-1.41 1.41" /></svg
            >
          {:else}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg
            >
          {/if}
        </button>

        <a href="/" class="button button-neutral button-small"> 公开歌单 </a>

        {#if data.isAdmin}
          <a href="/admin" class="button button-primary button-small"> 后台管理 </a>
        {:else}
          <a href="/admin/login" class="button button-neutral button-small"> 管理员登录 </a>
        {/if}
      </nav>
    </div>
  </header>

  <main class="mx-auto max-w-7xl px-4 pt-8 pb-16 lg:px-6 lg:pt-10">
    {@render children()}
  </main>
</div>
