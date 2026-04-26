<script lang="ts">
  import { enhance } from '$app/forms';
  import { createSubmitConfirmation, isPending, pendingEnhance } from '$lib/admin/pending.svelte';
  import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';

  import type { CatalogStats } from '$lib/types';

  let {
    overview,
    onOpenSettings
  }: {
    overview: CatalogStats;
    onOpenSettings: () => void;
  } = $props();

  const resetConfirmation = createSubmitConfirmation();
</script>

<section class="admin-overview">
  <div class="admin-overview-head">
    <div>
      <p class="text-xs font-semibold tracking-[0.14em] text-[var(--color-accent)] uppercase">后台控制台</p>
      <h1 class="mt-2 text-2xl font-semibold text-[var(--color-text)] lg:text-3xl">管理歌曲与愿望单</h1>
      <p class="mt-2 text-sm text-[var(--color-text-secondary)]">维护公开歌单，处理观众提交的点歌请求。</p>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <button type="button" class="button button-ghost button-small" onclick={onOpenSettings}>页面配置</button>
      <form
        method="POST"
        action="?/resetDatabase"
        use:enhance={pendingEnhance(
          'reset',
          resetConfirmation.before({
            title: '确认清空全部歌曲和愿望单？',
            description: '此操作会重置歌曲、愿望单和页面配置，且不可撤销。',
            confirmLabel: '确认重置',
            tone: 'danger'
          })
        )}
      >
        <button
          type="submit"
          class="button button-danger button-small"
          disabled={isPending('reset')}
          data-pending={isPending('reset') || undefined}
        >
          重置数据库
        </button>
      </form>
      <form method="POST" action="?/logout" use:enhance={pendingEnhance('logout')}>
        <button
          type="submit"
          class="button button-ghost button-small"
          disabled={isPending('logout')}
          data-pending={isPending('logout') || undefined}
        >
          退出登录
        </button>
      </form>
    </div>
  </div>

  <div class="admin-stats">
    <div class="admin-stat">
      <span class="admin-stat-value">{overview.totalSongs}</span>
      <span class="admin-stat-label">总歌曲</span>
    </div>
    <div class="admin-stat">
      <span class="admin-stat-value">{overview.publicSongs}</span>
      <span class="admin-stat-label">公开</span>
    </div>
    <div class="admin-stat">
      <span class="admin-stat-value">{overview.pendingRequests}</span>
      <span class="admin-stat-label">待处理愿望</span>
    </div>
  </div>
</section>

<ConfirmDialog
  bind:open={resetConfirmation.open}
  title={resetConfirmation.title}
  description={resetConfirmation.description}
  confirmLabel={resetConfirmation.confirmLabel}
  tone={resetConfirmation.tone}
  onConfirm={resetConfirmation.confirm}
/>
