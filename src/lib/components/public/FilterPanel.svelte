<script lang="ts">
  import Select from '$lib/components/ui/Select.svelte';
  import {
    songLanguageOptions,
    songStatusLabels,
    songStatusOptions,
    type SongLanguage,
    type SongStatus
  } from '$lib/types';

  type Props = {
    tags: string[];
    total: number;
    filtered: number;
    query: string;
    language: 'all' | SongLanguage;
    tag: string;
    status: 'all' | SongStatus;
  };

  let {
    tags,
    total,
    filtered,
    query = $bindable(),
    language = $bindable(),
    tag = $bindable(),
    status = $bindable()
  }: Props = $props();

  const hasActiveFilter = $derived(query.trim() !== '' || language !== 'all' || tag !== 'all' || status !== 'all');

  const resetFilters = () => {
    query = '';
    language = 'all';
    tag = 'all';
    status = 'all';
  };
</script>

<aside class="filter-panel">
  <div class="flex items-start justify-between gap-3">
    <div>
      <p class="text-xs font-semibold tracking-[0.14em] text-[var(--color-accent)] uppercase">公开歌单</p>
      <h2 class="mt-1 text-xl font-semibold text-[var(--color-text)]">搜索与筛选</h2>
    </div>
    <span class="filter-count">
      <strong>{filtered}</strong><span class="text-[var(--color-text-muted)]">/{total}</span>
    </span>
  </div>

  <div class="mt-6 space-y-4">
    <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
      <span>搜索</span>
      <div class="filter-search">
        <svg
          class="filter-search-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input bind:value={query} class="form-field filter-search-input" placeholder="按歌名、原唱、标签搜索" />
      </div>
    </label>

    <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
      <span>语言</span>
      <Select
        bind:value={language}
        items={[{ value: 'all', label: '全部语言' }, ...songLanguageOptions.map((v) => ({ value: v, label: v }))]}
      />
    </label>

    <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
      <span>标签</span>
      <Select
        bind:value={tag}
        items={[{ value: 'all', label: '全部标签' }, ...tags.map((t) => ({ value: t, label: t }))]}
      />
    </label>

    <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
      <span>当前状态</span>
      <Select
        bind:value={status}
        items={[
          { value: 'all', label: '全部状态' },
          ...songStatusOptions.map((s) => ({ value: s, label: songStatusLabels[s] }))
        ]}
      />
    </label>
  </div>

  {#if hasActiveFilter}
    <button type="button" class="button button-ghost button-small mt-5 w-full" onclick={resetFilters}>
      清空筛选
    </button>
  {/if}
</aside>
