# QingKong Songlist

SvelteKit + Supabase 搭建的单主播歌单站。观众查歌、筛选、提交愿望单；主播后台管理曲库、导入网易云歌曲、处理请求。

前台 `/` · 后台登录 `/admin/login` · 后台 `/admin`

## 快速开始

```bash
npm install
cp .env.example .env   # 填入下方环境变量
# 在 Supabase SQL Editor 执行 supabase/schema.sql
npm run dev
```

要求 Node 20.19+ 或 22.12+（Vite 8）。

## 环境变量

| 变量                              | 说明                                                     |
| --------------------------------- | -------------------------------------------------------- |
| `PUBLIC_SUPABASE_URL`             | Supabase 项目 URL                                        |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable / anon key                                   |
| `SUPABASE_SERVICE_ROLE_KEY`       | Service role key，仅服务端使用                           |
| `AUTH_SECRET`                     | 用于签名 admin session cookie 的随机串，建议至少 32 字节 |

生成 `AUTH_SECRET` 示例：

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

把输出结果填入本地 `.env` 和部署平台环境变量即可。

管理员登录走 Supabase Auth。**任何能在 Supabase 登录的账号都能进后台**，请只在 Auth 中创建受信任的账号。

## 脚本

| 命令                   | 作用                    |
| ---------------------- | ----------------------- |
| `npm run dev`          | 启动开发服务器          |
| `npm run build`        | 生产构建                |
| `npm run preview`      | 预览生产构建            |
| `npm run check`        | 类型 + Svelte 检查      |
| `npm run format`       | Prettier 格式化整个仓库 |
| `npm run format:check` | 只检查格式不写入        |

提交时 husky pre-commit 会自动跑 `lint-staged`，对 staged 文件执行 `prettier --write`。`npm install` 会自动激活 hook。

## 部署

使用 `@sveltejs/adapter-auto`，Vercel / Netlify / Cloudflare Pages 等均可。部署前：

- 托管平台配置全部环境变量
- 在生产 Supabase 执行 `supabase/schema.sql`
- 在 Supabase Auth 中至少创建一个管理员账号

## 技术栈

SvelteKit 2 · Svelte 5 · Vite 8 · Tailwind CSS 4 · Supabase · Zod 4 · `@neteasecloudmusicapienhanced/api`

## 开源协议

Copyright (C) 2026 zclkkk

本项目采用 `GNU Affero General Public License v3.0`（`AGPL-3.0-only`）授权，详见根目录 `LICENSE`。

如果你修改后将其作为网络服务对外提供，需按 AGPL 要求向该服务的用户提供对应源码。
