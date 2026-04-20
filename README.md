# QingKong Songlist

单主播歌单站。观众在前台查歌、筛选歌曲、提交愿望单；主播在后台维护曲库、导入网易云歌曲、处理观众请求。

## 技术栈

- SvelteKit 2
- Svelte 5
- Vite 8
- Tailwind CSS 4
- Supabase Auth + Postgres
- Zod 4
- `@neteasecloudmusicapienhanced/api` 用于解析网易云音乐

Vite 8 要求 Node `20.19+`、`22.12+` 或更高版本。

## 功能

- 公开歌单展示
- 按歌名、原唱、标签搜索
- 按语言、标签、歌曲状态筛选
- 明暗主题切换
- 前台愿望单提交
- 前台网易云单曲解析，自动填入歌名和原唱
- 后台歌曲新增、编辑、删除
- 后台网易云公开歌单导入，解析后勾选要导入的歌曲
- 后台网易云单曲导入
- 后台愿望单处理
- 后台一键清空歌曲和愿望单数据

## 数据规则

歌曲语言固定为：

- `中文`
- `英语`
- `日语`
- `其他`

歌曲状态固定为：

- `ready`: 可唱
- `learning`: 学习中
- `resting`: 暂不开放

愿望单状态固定为：

- `pending`: 观众刚提交，前台不展示
- `accepted`: 后台接受后，自动加入歌曲列表，歌曲状态为 `learning`
- `refused`: 后台拒绝后，仅保留提交记录

## 路由

- `/`: 公开歌单和愿望单提交
- `/admin/login`: 管理员登录
- `/admin`: 后台管理

## 初始化

安装依赖：

```bash
npm install
```

从 `.env.example` 创建 `.env`：

```powershell
Copy-Item .env.example .env
```

必填环境变量：

```dotenv
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=admin@example.com
AUTH_SECRET=replace-me
```

说明：

- `PUBLIC_SUPABASE_URL` 和 `PUBLIC_SUPABASE_PUBLISHABLE_KEY` 来自 Supabase 项目的 API 设置。
- `SUPABASE_SERVICE_ROLE_KEY` 只允许在服务端使用，不要暴露到浏览器。
- `ADMIN_EMAIL` 必须匹配一个 Supabase Auth 用户邮箱。
- 后台登录密码就是这个 Supabase Auth 用户的密码。
- `AUTH_SECRET` 用于签名本地管理员 session cookie。生产环境必须换成真实随机密钥。

## Supabase

执行这个 SQL：

```text
supabase/schema.sql
```

它会创建：

- `public.songs`
- `public.requests`
- 状态和语言的 `check` 约束
- RLS 策略：
  - 公开用户只能读取 `is_public = true` 的歌曲
  - 公开用户只能插入 `pending` 状态的愿望单

在 Supabase Auth 中创建一个邮箱等于 `ADMIN_EMAIL` 的管理员用户。

## 开发

启动开发服务器：

```bash
npm run dev
```

运行类型和 Svelte 检查：

```bash
npm run check
```

构建：

```bash
npm run build
```

预览生产构建：

```bash
npm run preview
```

## 自定义

主播文案和平台链接：

```text
src/lib/config.ts
```

全局样式和主题变量：

```text
src/app.css
```

核心类型、状态和语言枚举：

```text
src/lib/types.ts
```

## 部署

项目当前使用 `@sveltejs/adapter-auto`。

部署前确认：

- 使用兼容 Vite 8 的 Node 版本。
- 在托管平台设置全部必填环境变量。
- 对生产 Supabase 数据库执行 `supabase/schema.sql`。
- 创建 Supabase Auth 管理员用户。
- 把 `AUTH_SECRET=replace-me` 换成真实密钥。

## 安全说明

- 后台登录使用 Supabase Auth。
- 管理员 session 存在 HTTP-only cookie 中，并用 `AUTH_SECRET` 签名。
- 服务端数据库写入使用 `SUPABASE_SERVICE_ROLE_KEY`。
- 不要把 `.env` 提交到 git。
