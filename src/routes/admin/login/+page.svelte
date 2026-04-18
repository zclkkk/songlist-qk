<script lang="ts">
  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form?: ActionData } = $props();

  const fieldClass =
    'w-full rounded-[18px] border border-[#e6e6e6] bg-white px-4 py-3 text-[#191a1b] shadow-sm outline-none transition placeholder:text-[#8a8f98] focus:border-[#7170ff] focus:ring-4 focus:ring-[#7170ff]/15';
</script>

<svelte:head>
  <title>管理员登录 | VTuber Songboard</title>
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

    <div class="grid gap-4 sm:grid-cols-2">
      <div class="rounded-[24px] border border-[#e6e6e6] bg-white p-5 shadow-sm">
        <p class="text-xs uppercase tracking-[0.14em] text-[#8a8f98]">鉴权模式</p>
        <p class="mt-3 text-xl font-semibold text-[#191a1b]">
          {data.authMode === 'supabase' ? 'Supabase Auth' : '演示登录'}
        </p>
        <p class="mt-2 text-sm leading-6 text-[#62666d]">
          {data.authMode === 'supabase'
            ? '已检测到 Supabase 配置，登录将走真实管理员账号。'
            : '当前未配置 Supabase，使用本地演示账号体验后台。'}
        </p>
      </div>

      <div class="rounded-[24px] border border-[#e6e6e6] bg-white p-5 shadow-sm">
        <p class="text-xs uppercase tracking-[0.14em] text-[#8a8f98]">当前目标</p>
        <p class="mt-3 text-xl font-semibold text-[#191a1b]">单主播 MVP</p>
        <p class="mt-2 text-sm leading-6 text-[#62666d]">
          先完成轻量管理流程，再接入真实后端。
        </p>
      </div>
    </div>
  </section>

  <section class="rounded-[30px] border border-[#e6e6e6] bg-white p-6 shadow-sm lg:p-7">
    <div>
      <p class="text-sm font-medium text-[#5e6ad2]">登录后台</p>
      <h2 class="mt-1 text-2xl font-semibold text-[#191a1b]">管理员身份验证</h2>
    </div>

    {#if data.demoCredentials}
      <div class="mt-5 rounded-[20px] border border-[#7170ff]/30 bg-[#7170ff]/10 p-4 text-sm text-[#5e6ad2]">
        <p class="font-medium">当前为演示模式</p>
        <p class="mt-2">邮箱：{data.demoCredentials.email}</p>
        <p class="mt-1">密码：{data.demoCredentials.password}</p>
      </div>
    {/if}

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
          class={fieldClass}
          placeholder="admin@example.com"
        />
      </label>

      <label class="block space-y-2 text-sm text-[#62666d]">
        <span>密码</span>
        <input
          name="password"
          type="password"
          class={fieldClass}
          placeholder="请输入管理员密码"
        />
      </label>

      <button
        type="submit"
        class="inline-flex w-full items-center justify-center rounded-[18px] bg-[#5e6ad2] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#828fff]"
      >
        登录后台
      </button>
    </form>
  </section>
</div>
