<script lang="ts">
  import { enhance } from '$app/forms';
  import { isPending, pendingEnhance } from '$lib/admin/pending.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import { songLanguageItems, songStatusItems } from '$lib/select-options';
  import { Tabs } from 'bits-ui';

  type NeteaseFormShape = {
    songImport?: { songInput?: string };
    playlistImport?: { playlistInput?: string };
    importPreview?: { sourceInput?: string };
  };

  let {
    active = $bindable('manual'),
    form
  }: {
    active?: string;
    form?: NeteaseFormShape | null;
  } = $props();
</script>

<div class="panel-card min-w-0">
  <h2 class="text-lg font-semibold text-[var(--color-text)]">添加歌曲</h2>

  <Tabs.Root bind:value={active} class="mt-5 space-y-4">
    <Tabs.List class="admin-tabs-list inline-flex">
      <Tabs.Trigger value="manual" class="admin-tab-trigger">手动填写</Tabs.Trigger>
      <Tabs.Trigger value="netease" class="admin-tab-trigger">网易云导入</Tabs.Trigger>
    </Tabs.List>

    <Tabs.Content value="manual">
      <form method="POST" action="?/saveSong" class="space-y-4" use:enhance={pendingEnhance('save-new')}>
        <label class="field-label">
          <span>歌曲名</span>
          <input name="title" class="form-field" placeholder="例如：祝福" />
        </label>

        <label class="field-label">
          <span>原唱</span>
          <input name="artist" class="form-field" placeholder="例如：YOASOBI" />
        </label>

        <div class="grid gap-4 sm:grid-cols-2">
          <label class="field-label">
            <span>语言</span>
            <Select name="language" required value="其他" items={songLanguageItems} />
          </label>

          <label class="field-label">
            <span>状态</span>
            <Select name="status" value="ready" items={songStatusItems} />
          </label>
        </div>

        <label class="field-label">
          <span>标签（逗号分隔）</span>
          <input name="tagsInput" class="form-field" placeholder="例如：高能, 日语, 动画" />
        </label>

        <label
          class="flex items-center gap-3 rounded-[14px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-text-secondary)]"
        >
          <input
            name="isPublic"
            type="checkbox"
            class="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
            checked
          />
          <span>公开展示到前台歌单</span>
        </label>

        <button
          type="submit"
          class="button button-primary button-full"
          disabled={isPending('save-new')}
          data-pending={isPending('save-new') || undefined}
        >
          保存歌曲
        </button>
      </form>
    </Tabs.Content>

    <Tabs.Content value="netease" class="space-y-5">
      <form method="POST" action="?/previewSong" class="space-y-3" use:enhance={pendingEnhance('preview-song')}>
        <label class="field-label">
          <span>单曲链接或 ID</span>
          <input
            name="songInput"
            class="form-field"
            value={form?.songImport?.songInput ?? ''}
            placeholder="https://music.163.com/#/song?id=..."
          />
        </label>
        <button
          type="submit"
          class="button button-secondary button-full"
          disabled={isPending('preview-song')}
          data-pending={isPending('preview-song') || undefined}
        >
          解析单曲
        </button>
      </form>

      <div class="relative flex items-center">
        <div class="flex-1 border-t border-[var(--color-border-soft)]"></div>
        <span class="px-3 text-xs text-[var(--color-text-muted)]">或</span>
        <div class="flex-1 border-t border-[var(--color-border-soft)]"></div>
      </div>

      <form method="POST" action="?/previewPlaylist" class="space-y-3" use:enhance={pendingEnhance('preview-playlist')}>
        <label class="field-label">
          <span>歌单链接或 ID</span>
          <input
            name="playlistInput"
            class="form-field"
            value={form?.playlistImport?.playlistInput ?? form?.importPreview?.sourceInput ?? ''}
            placeholder="https://music.163.com/#/playlist?id=..."
          />
        </label>
        <button
          type="submit"
          class="button button-secondary button-full"
          disabled={isPending('preview-playlist')}
          data-pending={isPending('preview-playlist') || undefined}
        >
          解析歌单
        </button>
      </form>
    </Tabs.Content>
  </Tabs.Root>
</div>
