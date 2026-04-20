<script lang="ts">
  import type { ActionData } from './$types';

  let { form }: { form?: ActionData } = $props();
</script>

<svelte:head>
  <title>管理员登录 | QingKong Songlist</title>
</svelte:head>

<div class="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_420px]">
  <section class="space-y-6">
    <div>
      <p class="text-sm font-medium text-[#5e6ad2]">后台入口</p>
      <h1 class="mt-3 text-3xl font-semibold text-[#191a1b] lg:text-5xl">主播后台管理</h1>
      <p class="mt-4 max-w-2xl text-sm leading-7 text-[#62666d] lg:text-base">
        维护公开歌单、处理观众愿望单，并统一管理歌曲状态。
      </p>
    </div>

  </section>

  <section class="rounded-[30px] border border-[#e6e6e6] bg-white p-6 shadow-sm lg:p-7">
    <div>
      <p class="text-sm font-medium text-[#5e6ad2]">登录后台</p>
      <h2 class="mt-1 text-2xl font-semibold text-[#191a1b]">管理员身份验证</h2>
    </div>

    {#if form?.message}
      <div class="mt-5 rounded-[18px] border border-[#7170ff]/30 bg-[#7170ff]/10 px-4 py-3 text-sm text-[#5e6ad2]">
        {form.message}
      </div>
    {/if}

    <form method="POST" class="mt-6 space-y-4">
      <label class="block space-y-2 text-sm text-[#62666d]">
        <span>邮箱</span>
        <input
          name="email"
          type="email"
          value={form?.values?.email ?? ''}
          class="form-field"
          placeholder="admin@example.com"
        />
      </label>

      <label class="block space-y-2 text-sm text-[#62666d]">
        <span>密码</span>
        <input
          name="password"
          type="password"
          class="form-field"
          placeholder="请输入管理员密码"
        />
      </label>

      <button
        type="submit"
        class="button button-primary button-full"
      >
        登录后台
      </button>
    </form>
  </section>
</div>
