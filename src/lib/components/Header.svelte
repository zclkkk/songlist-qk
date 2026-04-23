<script lang="ts">
  import { page } from '$app/state';
  import Icon from '$lib/components/ui/Icon.svelte';
  import { onMount } from 'svelte';

  let { isAdmin }: { isAdmin: boolean } = $props();

  let isDark = $state(false);
  let mounted = $state(false);

  onMount(() => {
    isDark = document.documentElement.classList.contains('dark');
    mounted = true;
  });

  const toggleTheme = () => {
    isDark = !isDark;
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  const isHome = $derived(page.url.pathname === '/');
  const isAdminPage = $derived(page.url.pathname.startsWith('/admin'));
</script>

<header
  class="sticky top-0 z-20 border-b border-[var(--color-border-soft)] bg-[var(--color-surface-overlay)] backdrop-blur-xl"
>
  <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
    <a href="/" class="flex min-w-0 items-center gap-3">
      <span
        class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[var(--color-accent)] text-sm font-semibold text-white shadow-sm"
      >
        歌
      </span>
      <span class="flex min-w-0 flex-col leading-tight">
        <span class="text-sm font-semibold text-[var(--color-text)]">QingKong Songlist</span>
        <span class="text-[11px] text-[var(--color-text-muted)]">单主播歌单与愿望单管理</span>
      </span>
    </a>

    <nav class="flex items-center gap-1 text-sm">
      <button
        type="button"
        class="button button-ghost button-icon theme-toggle"
        aria-pressed={isDark}
        aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
        onclick={toggleTheme}
      >
        {#if mounted && isDark}
          <Icon name="sun" class="theme-toggle-icon" />
        {:else}
          <Icon name="moon" class="theme-toggle-icon" />
        {/if}
      </button>

      {#if !isHome}
        <a href="/" class="button button-primary button-small">公开歌单</a>
      {/if}

      {#if !isAdminPage}
        {#if isAdmin}
          <a href="/admin" class="button button-primary button-small">后台管理</a>
        {:else}
          <a href="/admin/login" class="button button-ghost button-small">管理员登录</a>
        {/if}
      {/if}
    </nav>
  </div>
</header>

<style>
  :global(.theme-toggle-icon) {
    transition:
      transform 300ms ease,
      opacity 200ms ease;
  }

  .theme-toggle:hover :global(.theme-toggle-icon) {
    transform: rotate(15deg);
  }

  .theme-toggle[aria-pressed='true'] :global(.theme-toggle-icon) {
    color: var(--color-accent);
  }
</style>
