<script lang="ts">
  import { enhance } from '$app/forms';
  import { isPending, pendingEnhance } from '$lib/admin/pending.svelte';
  import Icon from '$lib/components/ui/Icon.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import { requestStatusClasses } from '$lib/status-styles';
  import { requestDecisionOptions, requestStatusLabels, type RequestStatus, type SongRequest } from '$lib/types';

  let { requests }: { requests: SongRequest[] } = $props();

  const decisionItems = requestDecisionOptions.map((s) => ({ value: s, label: requestStatusLabels[s] }));

  type FilterKey = 'all' | RequestStatus;

  let filter = $state<FilterKey>('all');

  const counts = $derived({
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    refused: requests.filter((r) => r.status === 'refused').length
  });

  const filtered = $derived(filter === 'all' ? requests : requests.filter((r) => r.status === filter));

  const tabs: Array<{ key: FilterKey; label: string }> = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待处理' },
    { key: 'accepted', label: '已接受' },
    { key: 'refused', label: '已拒绝' }
  ];
</script>

<section class="rounded-[28px] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6 shadow-sm lg:p-7">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <h2 class="text-lg font-semibold text-[var(--color-text)]">愿望单</h2>
    <div class="admin-tabs-list">
      {#each tabs as tab}
        <button
          type="button"
          class="admin-tab-trigger"
          data-state={filter === tab.key ? 'active' : 'inactive'}
          onclick={() => (filter = tab.key)}
        >
          {tab.label} <span class="admin-tab-count">{counts[tab.key]}</span>
        </button>
      {/each}
    </div>
  </div>

  {#if filtered.length === 0}
    <div class="admin-empty mt-5">
      {#if requests.length === 0}
        <p class="text-sm font-medium text-[var(--color-text-secondary)]">还没有观众提交愿望</p>
        <p class="mt-1 text-xs text-[var(--color-text-muted)]">前台公开链接打开后就能收到</p>
      {:else}
        <p class="text-sm font-medium text-[var(--color-text-secondary)]">当前筛选下没有结果</p>
        <p class="mt-1 text-xs text-[var(--color-text-muted)]">换一个状态试试</p>
      {/if}
    </div>
  {:else}
    <div class="mt-5 space-y-3">
      {#each filtered as item}
        <details
          class="group rounded-[20px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] p-5 transition-colors open:bg-[var(--color-surface)] hover:bg-[var(--color-surface)]"
        >
          <summary class="flex cursor-pointer list-none items-center justify-between gap-4">
            <div class="min-w-0">
              <h3 class="truncate text-base font-semibold text-[var(--color-text)]">{item.songTitle}</h3>
              <p class="mt-1 truncate text-sm text-[var(--color-text-secondary)]">
                {item.artist || '未填写'} · {item.language}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <span class={`status-badge ${requestStatusClasses[item.status]}`}>
                {requestStatusLabels[item.status]}
              </span>
              <Icon name="chevron-down" class="song-chevron" />
            </div>
          </summary>

          <div class="mt-5 space-y-4">
            {#if item.message}
              <p class="text-sm leading-7 text-[var(--color-text-secondary)]">{item.message}</p>
            {/if}
            <div class="flex flex-wrap gap-3 text-xs text-[var(--color-text-muted)]">
              <span>提交者：{item.requesterName || '匿名'}</span>
              <span>时间：{new Date(item.createdAt).toLocaleString('zh-CN')}</span>
            </div>

            {#if item.status === 'pending'}
              <form
                method="POST"
                action="?/updateRequestStatus"
                class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
                use:enhance={pendingEnhance(`request-${item.id}`)}
              >
                <input type="hidden" name="id" value={item.id} />
                <Select name="status" value="accepted" items={decisionItems} triggerClass="form-field-muted" />
                <button
                  type="submit"
                  class="button button-primary"
                  disabled={isPending(`request-${item.id}`)}
                  data-pending={isPending(`request-${item.id}`) || undefined}
                >
                  处理愿望
                </button>
              </form>
            {/if}
          </div>
        </details>
      {/each}
    </div>
  {/if}
</section>
