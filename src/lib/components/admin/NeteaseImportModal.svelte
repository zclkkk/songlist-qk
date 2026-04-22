<script lang="ts">
  import { songLanguageOptions, songStatusLabels, songStatusOptions } from '$lib/types';

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

<div class="fixed inset-0 z-50 overflow-y-auto bg-[#191a1b]/50 px-4 py-8">
  <section class="mx-auto max-w-5xl rounded-[24px] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6 shadow-xl lg:p-7">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-[var(--color-accent)]">导入网易云</p>
        <h2 class="mt-1 text-2xl font-semibold text-[var(--color-text)]">歌曲导入</h2>
      </div>

      <button
        type="button"
        class="button button-neutral button-small"
        onclick={onClose}
      >
        关闭
      </button>
    </div>

    {#if adminError}
      <div class="mt-5 rounded-[18px] border border-[#7170ff]/30 bg-[#7170ff]/10 px-4 py-3 text-sm text-[var(--color-accent)]">
        {adminError}
      </div>
    {/if}

    <form method="POST" action="?/importPlaylist" class="mt-6 space-y-5">
      <input type="hidden" name="playlistInput" value={preview.playlistInput} />
      <input type="hidden" name="songCount" value={preview.songs.length} />

      <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
        <span>状态</span>
        <select name="status" class="form-field">
          {#each songStatusOptions as status}
            <option value={status} selected={preview.status === status}>{songStatusLabels[status]}</option>
          {/each}
        </select>
      </label>

      <div class="rounded-[18px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
        {preview.songs.length} 首待确认
      </div>

      <div class="max-h-[56vh] overflow-auto rounded-[18px] border border-[var(--color-border-soft)]">
        <table class="w-full min-w-[760px] text-left text-sm">
          <thead class="sticky top-0 bg-[var(--color-surface)] text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
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
                  <select name={`songLanguage-${index}`} class="form-field-muted min-w-28" required>
                    {#each songLanguageOptions as language}
                      <option value={language} selected={song.language === language}>{language}</option>
                    {/each}
                  </select>
                </td>
                <td class="px-3 py-3">
                  <input
                    name={`songTagsInput-${index}`}
                    class="form-field-muted min-w-48"
                    value={song.tagsInput ?? ''}
                    placeholder="例如：网易云导入"
                  />
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <button
        type="submit"
        class="button button-primary button-full"
      >
        导入勾选歌曲
      </button>
    </form>
  </section>
</div>
