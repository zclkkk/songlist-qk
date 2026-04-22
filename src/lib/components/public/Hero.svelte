<script lang="ts">
  import type { PublicCatalog } from '$lib/types';

  let { catalog }: { catalog: PublicCatalog } = $props();

  const coverImage = $derived(
    catalog.settings.background ||
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1740&auto=format&fit=crop'
  );

  const learningSongs = $derived(catalog.songs.filter((song) => song.status === 'learning').length);
</script>

<section class="overflow-hidden rounded-[32px] border border-[var(--color-border-soft)] bg-[var(--color-surface)] shadow-sm">
  <div class="relative min-h-[380px]">
    <img
      src={coverImage}
      alt="舞台麦克风和灯光"
      class="absolute inset-0 h-full w-full object-cover"
    />
    <div class="theme-hero-overlay absolute inset-0"></div>

    <div class="relative flex min-h-[380px] flex-col justify-between gap-8 p-6 lg:p-10">
      <div class="flex flex-col items-center justify-center pt-8 text-center">
        {#if catalog.settings.avatar}
          <div class="h-28 w-28 overflow-hidden rounded-full border-4 border-[var(--color-avatar-ring)] bg-[var(--color-surface-muted)] shadow-sm">
            <img src={catalog.settings.avatar} alt="Up主头像" class="h-full w-full object-cover" />
          </div>
        {:else}
          <div class="flex h-28 w-28 items-center justify-center rounded-full border-4 border-[var(--color-avatar-ring)] bg-[var(--color-accent)] shadow-sm">
            <span class="text-4xl font-bold text-white">{catalog.streamer.name.charAt(0)}</span>
          </div>
        {/if}

        <div class="my-6 h-[2px] w-12 rounded-full bg-[var(--color-border)]"></div>

        <h1 class="text-3xl font-semibold tracking-tight text-[var(--color-text)] lg:text-4xl">
          {catalog.settings.heroTitle}
        </h1>
      </div>

      <div class="grid gap-6 border-t border-[var(--color-border-soft)] pt-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.55fr)] lg:items-end">
        <div class="grid gap-4 sm:grid-cols-3">
          <div class="rounded-[24px] border border-[var(--color-border-soft)] bg-[var(--color-surface-overlay)] p-4 shadow-sm backdrop-blur">
            <p class="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-text-muted)]">公开曲目</p>
            <p class="mt-2 text-3xl font-semibold text-[var(--color-text)]">{catalog.stats.publicSongs}</p>
            <p class="mt-1 text-xs text-[var(--color-text-secondary)]">首可浏览歌曲</p>
          </div>

          <div class="rounded-[24px] border border-[var(--color-border-soft)] bg-[var(--color-surface-overlay)] p-4 shadow-sm backdrop-blur">
            <p class="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-text-muted)]">学习中曲目</p>
            <p class="mt-2 text-3xl font-semibold text-[var(--color-text)]">{learningSongs}</p>
            <p class="mt-1 text-xs text-[var(--color-text-secondary)]">首正在练习</p>
          </div>

          <div class="rounded-[24px] border border-[var(--color-border-soft)] bg-[var(--color-surface-overlay)] p-4 shadow-sm backdrop-blur">
            <p class="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-text-muted)]">标签总览</p>
            <p class="mt-2 text-3xl font-semibold text-[var(--color-text)]">{catalog.tags.length}</p>
            <p class="mt-1 text-xs text-[var(--color-text-secondary)]">个筛选标签</p>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {#each catalog.streamer.platforms as platform}
            <a
              href={platform.href}
              target="_blank"
              rel="noreferrer"
              class="button button-neutral button-full"
            >
              前往 {platform.label}
            </a>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>
