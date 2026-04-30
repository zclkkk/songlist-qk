<script lang="ts">
  import { defaultHeroTagline } from '$lib/config';
  import Icon from '$lib/components/ui/Icon.svelte';
  import type { PublicCatalog } from '$lib/types';

  let { catalog }: { catalog: PublicCatalog } = $props();

  const learningSongs = $derived(catalog.songs.filter((song) => song.status === 'learning').length);
</script>

<svelte:head>
  {#if catalog.settings.background}
    <link rel="preload" as="image" href={catalog.settings.background} fetchpriority="high" />
  {/if}
</svelte:head>

<section class="hero-card">
  {#if catalog.settings.background}
    <img
      src={catalog.settings.background}
      alt=""
      aria-hidden="true"
      fetchpriority="high"
      decoding="async"
      class="hero-background pointer-events-none absolute inset-0 h-full w-full object-cover"
    />
  {/if}

  <div class="relative flex flex-col items-center px-6 py-12 text-center lg:px-12 lg:py-16">
    <div class="hero-avatar-ring">
      {#if catalog.settings.avatar}
        <img src={catalog.settings.avatar} alt="Up主头像" class="hero-avatar-image" />
      {:else}
        <div class="hero-avatar-image hero-avatar-placeholder">
          {catalog.settings.heroTitle.charAt(0)}
        </div>
      {/if}
    </div>

    <h1 class="mt-7 text-4xl font-semibold tracking-tight text-[var(--color-text)] lg:text-5xl">
      {catalog.settings.heroTitle}
    </h1>

    <p class="mt-3 max-w-xl text-sm text-[var(--color-text-secondary)] lg:text-base">
      {defaultHeroTagline}
    </p>

    <dl class="hero-stats mt-10">
      <div class="hero-stat">
        <dd class="hero-stat-value">{catalog.songs.length}</dd>
        <dt class="hero-stat-label">公开曲目</dt>
      </div>
      <div class="hero-stat">
        <dd class="hero-stat-value">{learningSongs}</dd>
        <dt class="hero-stat-label">学习中</dt>
      </div>
      <div class="hero-stat">
        <dd class="hero-stat-value">{catalog.tags.length}</dd>
        <dt class="hero-stat-label">标签</dt>
      </div>
    </dl>

    <div class="hero-social-links mt-8">
      <a
        href={catalog.settings.bilibiliUrl}
        target="_blank"
        rel="noreferrer"
        class="hero-social-link"
        aria-label="前往 Bilibili"
        title="前往 Bilibili"
      >
        <Icon name="bilibili" size={18} />
      </a>

      {#if catalog.settings.weiboUrl}
        <a
          href={catalog.settings.weiboUrl}
          target="_blank"
          rel="noreferrer"
          class="hero-social-link"
          aria-label="前往微博"
          title="前往微博"
        >
          <Icon name="weibo" size={18} />
        </a>
      {/if}

      {#if catalog.settings.qqGroupUrl}
        <a
          href={catalog.settings.qqGroupUrl}
          target="_blank"
          rel="noreferrer"
          class="hero-social-link"
          aria-label="加入 QQ 群"
          title="加入 QQ 群"
        >
          <Icon name="group" size={18} />
        </a>
      {/if}
    </div>
  </div>
</section>
