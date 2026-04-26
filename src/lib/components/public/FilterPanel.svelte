<script lang="ts">
  import Icon from '$lib/components/ui/Icon.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import { allSongLanguageItems, allSongStatusItems, createTagItems } from '$lib/select-options';
  import { type SongLanguage, type SongStatus } from '$lib/types';

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
  const tagItems = $derived(createTagItems(tags));

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
    <label class="field-label">
      <span>搜索</span>
      <div class="filter-search">
        <Icon name="search-alt" class="filter-search-icon" />
        <input bind:value={query} class="form-field filter-search-input" placeholder="按歌名、原唱、标签搜索" />
      </div>
    </label>

    <label class="field-label">
      <span>语言</span>
      <Select bind:value={language} items={allSongLanguageItems} />
    </label>

    <label class="field-label">
      <span>标签</span>
      <Select bind:value={tag} items={tagItems} />
    </label>

    <label class="field-label">
      <span>当前状态</span>
      <Select bind:value={status} items={allSongStatusItems} />
    </label>
  </div>

  {#if hasActiveFilter}
    <button type="button" class="button button-ghost button-small mt-5 w-full" onclick={resetFilters}>
      清空筛选
    </button>
  {/if}
</aside>
