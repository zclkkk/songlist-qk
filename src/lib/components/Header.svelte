<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import Icon from '$lib/components/ui/Icon.svelte';
  import { applyTheme, persistTheme } from '$lib/theme';

  let { isAdmin }: { isAdmin: boolean } = $props();

  let isDark = $state(browser && document.documentElement.classList.contains('dark'));
  let isSticky = $state(false);

  const trackHeaderSentinel = (node: HTMLElement) => {
    if (!browser) return;

    const observer = new IntersectionObserver(([entry]) => {
      isSticky = !entry.isIntersecting;
    });

    observer.observe(node);

    return {
      destroy: () => observer.disconnect()
    };
  };

  const toggleTheme = () => {
    isDark = !isDark;
    applyTheme(isDark);
    persistTheme(isDark);
  };

  const isHome = $derived(page.url.pathname === '/');
  const isAdminPage = $derived(page.url.pathname.startsWith('/admin'));
</script>

<div use:trackHeaderSentinel class="site-header-sentinel" aria-hidden="true"></div>

<header
  class:site-header-sticky={isSticky}
  class="site-header sticky top-0 z-20 border-b border-transparent bg-transparent backdrop-blur-xl"
>
  <div
    class:site-header-shell-sticky={isSticky}
    class="site-header-shell mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6"
  >
    <a href="/" class:site-brand-sticky={isSticky} class="site-brand flex min-w-0 items-center gap-3">
      <span
        class:site-brand-badge-sticky={isSticky}
        class="site-brand-badge inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[var(--color-accent)] text-sm font-semibold text-white shadow-sm"
      >
        歌
      </span>
      <span class="flex min-w-0 flex-col leading-tight">
        <span
          class:site-brand-title-sticky={isSticky}
          class="site-brand-title text-sm font-semibold text-[var(--color-text)]"
        >
          QingKong Songlist
        </span>
        <span
          class:site-brand-subtitle-sticky={isSticky}
          class="site-brand-subtitle text-[11px] text-[var(--color-text-muted)]"
        >
          单主播歌单与愿望单管理
        </span>
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
        {#if isDark}
          <Icon name="sun" size={20} class="theme-toggle-icon" />
        {:else}
          <Icon name="moon" size={20} class="theme-toggle-icon" />
        {/if}
      </button>

      {#if !isHome}
        <a href="/" class="button button-primary button-small">公开歌单</a>
      {/if}

      {#if !isAdminPage}
        {#if isAdmin}
          <a href="/admin" class="button button-primary button-small">后台管理</a>
        {:else}
          <a href="/admin/login" class="button button-primary button-small">后台管理</a>
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

  .site-header-sentinel {
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 1px;
    pointer-events: none;
  }

  .theme-toggle {
    border-color: transparent;
    width: 2.75rem;
    height: 2.75rem;
  }

  .theme-toggle:hover {
    border-color: transparent;
  }

  .site-header {
    transition:
      padding-top 220ms ease,
      border-color 180ms ease,
      background-color 180ms ease;
    padding-top: 0.4rem;
  }

  .site-header-shell {
    transition:
      max-width 220ms ease,
      padding-top 220ms ease,
      padding-bottom 220ms ease,
      padding-left 220ms ease,
      padding-right 220ms ease;
  }

  .site-brand {
    transition: gap 220ms ease;
  }

  .site-brand-badge,
  .site-brand-title,
  .site-brand-subtitle {
    transition:
      transform 220ms ease,
      opacity 180ms ease,
      font-size 220ms ease,
      line-height 220ms ease,
      width 220ms ease,
      height 220ms ease;
  }

  .site-header-sticky {
    padding-top: 0;
    border-bottom-color: rgb(208 214 224 / 0.32);
  }

  .site-header-shell-sticky {
    padding-top: 0.55rem;
    padding-bottom: 0.55rem;
  }

  .site-brand-sticky {
    gap: 0.65rem;
  }

  .site-brand-badge-sticky {
    width: 2rem;
    height: 2rem;
    transform: translateY(-0.5px);
  }

  .site-brand-title-sticky {
    font-size: 0.875rem;
    line-height: 1.1;
  }

  .site-brand-subtitle-sticky {
    opacity: 0.74;
    transform: translateY(-1px);
  }

  :global(.dark) .site-header-sticky {
    border-bottom-color: rgb(37 48 68 / 0.4);
  }

  @media (min-width: 1024px) {
    .site-header-shell-sticky {
      max-width: min(86rem, calc(100vw - 1rem));
      padding-left: 1.25rem;
      padding-right: 1.25rem;
    }
  }

  @supports (-webkit-touch-callout: none) {
    .site-header {
      background-color: transparent;
      -webkit-backdrop-filter: none;
      backdrop-filter: none;
    }
  }
</style>
