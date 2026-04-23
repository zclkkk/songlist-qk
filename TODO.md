# TODO

项目后续可以做的改进清单。按优先级 + 工作量粗略排序。

## Admin 端体验

### 1. 拆分 admin/+page.svelte

**问题**：当前单文件 ≈800 行，包含 overview / add-song / song-list / requests 四大块。
**建议拆分**：

- `src/lib/components/admin/OverviewCard.svelte` — 统计 + 顶部操作栏
- `src/lib/components/admin/AddSongPanel.svelte` — 手动填写 + 网易云导入 Tab
- `src/lib/components/admin/SongListCard.svelte` — 搜索 + 批量 + 分页 + 列表
- `src/lib/components/admin/RequestListCard.svelte` — 过滤 tab + 愿望列表
- `src/lib/admin/pending.svelte.ts` — 把 `pendingActions` / `pendingEnhance` 抽到共享模块

### 2. 愿望单也加搜索 + 分页

目前愿望单只有状态 filter，数据多时难找。复用歌曲列表的搜索/分页模式即可。

- 搜索：匹配歌名 / 原唱 / 提交者名 / 留言
- 分页：20 条/页
- 批量：批量接受 / 拒绝

### 3. 歌曲列表列排序

点击列头按歌名 / 原唱 / 状态 / 公开性排序。

### 4. 歌曲行内快捷切换公开态

不展开详情直接切换 `isPublic`（加个小开关 icon）。

## 公共前端

### 5. 骨架屏 / 加载态

首次进入页面时 song 列表骨架屏（现在是空白）。

### 6. 歌曲详情弹窗

公开页点击歌曲行弹出详情（标签、原唱全信息、网易云跳转链接）。

### 7. 愿望单查看页

公开只读页面展示自己提交过的愿望 + 状态（localStorage 记 requesterName 反查）。

## 视觉 / 品牌

### 8. Favicon + OG meta

- 替换默认 Svelte favicon
- 添加 `<meta property="og:*">` + `og:image` 分享图
- PWA manifest（可选）

### 9. 深色主题闪烁

首次加载时 html 根节点需要提前从 localStorage 读主题避免闪烁（类似 dark mode flash of incorrect theme）。

### 10. 错误页 + 404

- `src/routes/+error.svelte` — 通用错误页
- 404 专属插画 + 回首页按钮

### 11. 空态插画

列表空态从纯文字升级为小插画（SVG 或 emoji）。

## 后端 / 性能

### 12. Rate limit 愿望提交

单 IP 每分钟限 3 次，防刷。

### 13. 愿望去重

检测同一请求者提交过相同歌名 + 原唱则提示已提交过。

### 14. 歌曲列表缓存

前台公开接口加 HTTP cache / CDN cache，减少 Supabase 调用。

### 15. 日志 / 审计

admin 操作（保存、删除、批量）写入 audit log 表。

## DX / 代码质量

### 16. 单元测试

- `$lib/server/netease.ts` URL 解析
- `$lib/server/songs.ts` 批量操作
- `$lib/validators` zod schema 正反例

### 17. E2E 测试

Playwright 覆盖：登录 → 添加歌曲 → 提交愿望 → 审核流程。

### 18. CI/CD

GitHub Actions：lint + typecheck + build。
