<script lang="ts">
  import type { ActionData } from './$types';

  let { form }: { form?: ActionData } = $props();
</script>

<svelte:head>
  <title>管理员登录 | QingKong Songlist</title>
</svelte:head>

<div class="flex min-h-[70vh] items-center justify-center">
  <section class="request-card w-full max-w-md">
    <div class="flex flex-col items-center text-center">
      <div
        class="inline-flex h-12 w-12 items-center justify-center rounded-[14px] bg-[var(--color-accent)] text-base font-semibold text-white shadow-sm"
      >
        歌
      </div>
      <p class="mt-4 text-xs font-semibold tracking-[0.14em] text-[var(--color-accent)] uppercase">后台入口</p>
      <h1 class="mt-2 text-2xl font-semibold text-[var(--color-text)]">管理员登录</h1>
      <p class="mt-2 text-sm text-[var(--color-text-secondary)]">输入邮箱和密码进入后台管理</p>
    </div>

    {#if form?.message}
      <div class="alert alert-danger mt-6">{form.message}</div>
    {/if}

    <form method="POST" class="mt-6 space-y-4">
      <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
        <span>邮箱</span>
        <input
          name="email"
          type="email"
          value={form?.values?.email ?? ''}
          class="form-field"
          placeholder="admin@example.com"
        />
      </label>

      <label class="block space-y-2 text-sm text-[var(--color-text-secondary)]">
        <span>密码</span>
        <input name="password" type="password" class="form-field" placeholder="请输入管理员密码" />
      </label>

      <button type="submit" class="button button-primary button-lg button-full mt-2"> 登录后台 </button>
    </form>
  </section>
</div>
