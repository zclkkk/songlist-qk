<script lang="ts">
  import Icon from '$lib/components/ui/Icon.svelte';
  import { getPageNumbers } from '$lib/pagination';

  let {
    current,
    total,
    onChange,
    siblings = 1,
    boundary = 1
  }: {
    current: number;
    total: number;
    onChange: (page: number) => void;
    siblings?: number;
    boundary?: number;
  } = $props();

  const pages = $derived(getPageNumbers(current, total, siblings, boundary));
</script>

{#if total > 1}
  <div class="admin-pagination">
    <button
      type="button"
      class="admin-pagination-step"
      disabled={current <= 1}
      onclick={() => onChange(current - 1)}
      aria-label="上一页"
    >
      <Icon name="chevron-left" size={14} />
    </button>
    <div class="admin-pagination-pages">
      {#each pages as item}
        {#if item === 'gap-left' || item === 'gap-right'}
          <span class="admin-pagination-gap">…</span>
        {:else}
          <button
            type="button"
            class="admin-pagination-page"
            data-state={item === current ? 'active' : 'inactive'}
            onclick={() => onChange(item)}
          >
            {item}
          </button>
        {/if}
      {/each}
    </div>
    <button
      type="button"
      class="admin-pagination-step"
      disabled={current >= total}
      onclick={() => onChange(current + 1)}
      aria-label="下一页"
    >
      <Icon name="chevron-right" size={14} />
    </button>
  </div>
{/if}
