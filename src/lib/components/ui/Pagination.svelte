<script lang="ts">
  import Icon from '$lib/components/ui/Icon.svelte';
  import { Pagination as BitsPagination } from 'bits-ui';

  let {
    current,
    total,
    onChange,
    siblings = 1
  }: {
    current: number;
    total: number;
    onChange: (page: number) => void;
    siblings?: number;
  } = $props();
</script>

{#if total > 1}
  <BitsPagination.Root
    count={total}
    perPage={1}
    page={current}
    onPageChange={onChange}
    siblingCount={siblings}
    class="admin-pagination"
  >
    {#snippet children({ pages })}
      <BitsPagination.PrevButton class="admin-pagination-step" aria-label="上一页">
        <Icon name="chevron-left" size={14} />
      </BitsPagination.PrevButton>

      <div class="admin-pagination-pages">
        {#each pages as page (page.key)}
          {#if page.type === 'ellipsis'}
            <span class="admin-pagination-gap">…</span>
          {:else}
            <BitsPagination.Page {page} class="admin-pagination-page">
              {page.value}
            </BitsPagination.Page>
          {/if}
        {/each}
      </div>

      <BitsPagination.NextButton class="admin-pagination-step" aria-label="下一页">
        <Icon name="chevron-right" size={14} />
      </BitsPagination.NextButton>
    {/snippet}
  </BitsPagination.Root>
{/if}
