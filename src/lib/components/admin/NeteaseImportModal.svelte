<script lang="ts">
  import Select from '$lib/components/ui/Select.svelte';
  import { songLanguageOptions, songStatusLabels, songStatusOptions } from '$lib/types';
  import { Dialog } from 'bits-ui';

  export type PlaylistPreview = {
    playlistInput: string;
    status: string;
    songs: Array<{
      title: string;
      artist: string;
      language: string;
      tagsInput: string;
    }>;
  };

  let {
    preview,
    adminError,
    onClose
  }: {
    preview: PlaylistPreview;
    adminError?: string;
    onClose: () => void;
  } = $props();
</script>

<Dialog.Root
  open
  onOpenChange={(o) => {
    if (!o) onClose();
  }}
>
  <Dialog.Portal>
    <Dialog.Overlay class="dialog-overlay" />
    <Dialog.Content class="dialog-content dialog-content-lg">
      <div class="dialog-header">
        <div>
          <Dialog.Title class="dialog-title">网易云歌单导入</Dialog.Title>
          <Dialog.Description class="dialog-description">勾选需要导入的歌曲，编辑语言和标签后提交</Dialog.Description>
        </div>
        <Dialog.Close class="dialog-close" aria-label="关闭">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </Dialog.Close>
      </div>

      {#if adminError}
        <div class="alert alert-danger mb-5">{adminError}</div>
      {/if}

      <form method="POST" action="?/importPlaylist" class="space-y-5">
        <input type="hidden" name="playlistInput" value={preview.playlistInput} />
        <input type="hidden" name="songCount" value={preview.songs.length} />

        <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
          <span>状态</span>
          <Select
            name="status"
            value={preview.status}
            items={songStatusOptions.map((s) => ({ value: s, label: songStatusLabels[s] }))}
          />
        </label>

        <div
          class="rounded-[18px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-text-secondary)]"
        >
          {preview.songs.length} 首待确认
        </div>

        <div class="max-h-[56vh] overflow-auto rounded-[18px] border border-[var(--color-border-soft)]">
          <table class="w-full min-w-[760px] text-left text-sm">
            <thead
              class="sticky top-0 bg-[var(--color-surface)] text-xs tracking-[0.12em] text-[var(--color-text-muted)] uppercase"
            >
              <tr>
                <th class="w-12 px-3 py-3">选</th>
                <th class="px-3 py-3">歌曲</th>
                <th class="px-3 py-3">原唱</th>
                <th class="px-3 py-3">语言</th>
                <th class="px-3 py-3">标签</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-border-soft)] bg-[var(--color-surface)]">
              {#each preview.songs as song, index}
                <tr>
                  <td class="px-3 py-3 align-middle">
                    <div class="flex justify-center">
                      <input
                        name="selectedSong"
                        type="checkbox"
                        value={index}
                        class="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
                        checked
                      />
                    </div>
                    <input type="hidden" name={`songTitle-${index}`} value={song.title} />
                    <input type="hidden" name={`songArtist-${index}`} value={song.artist} />
                  </td>
                  <td class="px-3 py-3 text-[var(--color-text)]">{song.title}</td>
                  <td class="px-3 py-3 text-[var(--color-text-secondary)]">{song.artist}</td>
                  <td class="px-3 py-3">
                    <Select
                      name={`songLanguage-${index}`}
                      required
                      value={song.language}
                      items={songLanguageOptions.map((v) => ({ value: v, label: v }))}
                      triggerClass="form-field-muted min-w-28"
                    />
                  </td>
                  <td class="px-3 py-3">
                    <input
                      name={`songTagsInput-${index}`}
                      class="form-field-muted min-w-48"
                      value={song.tagsInput}
                      placeholder="例如：网易云导入"
                    />
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <button type="submit" class="button button-primary button-full"> 导入勾选歌曲 </button>
      </form>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
