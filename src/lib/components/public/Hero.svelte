<script lang="ts">
  import { defaultHeroTagline } from '$lib/config';
  import type { PublicCatalog } from '$lib/types';

  let { catalog }: { catalog: PublicCatalog } = $props();

  const learningSongs = $derived(catalog.songs.filter((song) => song.status === 'learning').length);
</script>

<section class="hero-card">
  {#if catalog.settings.background}
    <img
      src={catalog.settings.background}
      alt=""
      aria-hidden="true"
      class="hero-background pointer-events-none absolute inset-0 h-full w-full object-cover"
    />
  {/if}
  <div class="hero-overlay pointer-events-none absolute inset-0"></div>
  <div class="hero-glow pointer-events-none absolute" aria-hidden="true"></div>

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

    <a
      href={catalog.settings.bilibiliUrl}
      target="_blank"
      rel="noreferrer"
      class="button button-primary button-lg mt-10"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
          d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.4l.027.027c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .187-.213l.027-.027 2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.507.498-.769 1.13-.786 1.894v7.52c.017.764.279 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.507-.498.769-1.129.786-1.893v-7.52c-.017-.765-.279-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374a1.344 1.344 0 0 1-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374a1.344 1.344 0 0 1-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386z"
        />
      </svg>
      前往 Bilibili
    </a>
  </div>
</section>
