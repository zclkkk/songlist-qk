# VTuber Songboard

一个基于 `SvelteKit + Svelte 5 + TypeScript + Tailwind CSS v4 + Supabase` 的单主播歌单站 MVP，适合 VTuber / 直播场景下的歌曲展示、搜索筛选、愿望单收集和后台管理。

## 功能

- 公开歌单展示
- 按歌名、原唱、标签搜索
- 按语言、标签、状态筛选
- 愿望单提交
- 后台歌曲管理
- 后台愿望单状态管理

## 开发

```bash
npm install
npm run dev
```

## 环境变量

复制 `.env.example` 到 `.env` 后按需填写：

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL`
- `AUTH_SECRET`

必须配置 Supabase 鉴权，并在 Supabase Auth 中创建与 `ADMIN_EMAIL` 对应的管理员账号。

## Supabase

数据库初始化 SQL 位于：

`supabase/schema.sql`
