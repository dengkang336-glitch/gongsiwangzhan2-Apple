# AGENTS.md — 公司官网（云枢方舟）

本仓库是**广州云枢方舟科技有限公司的官方网站**，核心用途之一是通过 Apple Developer Program 组织（公司）账号审核。任何改动先问一句：这会不会让审核方觉得「不是一家真实公司在运营」？

## 硬约束

1. **主体信息必须与营业执照完全一致**，出现三处，改就三处同改：
   - 页脚版权行
   - `/about`「工商与联系信息」表
   - `/privacy` 与 `/terms` 落款

   现值：广州云枢方舟科技有限公司 / Guangzhou Yunshu Ark Technology Co., Ltd. / 广州市花都区建设北路 190 号亿能大厦 1207 室 A293 / support@yunshufz.top（已在用的真实邮箱）/ 站点域名 yunshufz.top（Cloudflare Worker 静态资源托管，见下节）
2. **不出现竞品名称与商标**。站上这批产品属复刻类，功能可参考公开信息，视觉/文案/图标/代码必须原创。
3. **不出现「独立开发者 / 个人工作室 / 个人接单」**这类与公司主体矛盾的表述。
4. 隐私政策要**逐款**写明数据范围（是否上云、留存多久、第三方、跨境、删除方式），不能只写一段通稿——审核会拿它跟 App 的隐私清单对。

## 结构

```text
content/site.mjs    公司信息、9 款产品、界面词、全站文案
content/legal.mjs   隐私政策与服务条款（中英各 12 节）
tools/build.mjs     模板 + 生成（33 页 + sitemap + robots + _headers → dist/）
worker.mjs          CF Worker 入口：www → 裸域 301，其余转给静态资源
tools/check.mjs     产物自检（死链 / h1 唯一 / img alt / 重复 id / canonical）
tools/make-assets.py  og.png / apple-touch-icon.png（Pillow）
assets/style.css    全部样式（断点 1080 / 860 / 640）
assets/site.js      吸顶阴影、移动菜单、reveal（无 JS 有兜底）
assets/img/         产品截图：竖图 620×1344、宽图 1280×800
→ 产物：dist/（已 gitignore），中文在 dist/ 根，英文在 dist/en/
```

## 工作流

```bash
npm run build     # node tools/build.mjs：先清空 dist/，再生成全部页面与 assets 副本
npm run check     # 自检 dist/
npm run preview   # 构建 + 本地起服务 → http://localhost:8820/
```

**产物只进 `dist/`；仓库根目录只放源码。** 只改 `content/`，不要手改 `dist/` 里的 html 或根目录——下次构建就没了。想改版式去 `assets/style.css`，`tools/build.mjs` 只负责模板与路由。

可选字段（留空即整行不渲染，不会出现「未填」字样）：

| 字段 | 填了就出现在 |
| --- | --- |
| `company.phone` | 页脚联系区、`/about` 工商表 |
| `company.icp` | 页脚（带工信部链接） |
| `company.founded` | `/about` 工商表 |

## 踩过的坑

- `href()` 要放行绝对地址（`mailto:` / `https:` / `#`），否则页脚邮箱被相对化成 `../mailto:…`。
- 宽幅产品页（念园、灯下小院）夹着一张竖屏手机截图，**按 `w >= h` 拆成两行**渲染（`gallery-row--wide` + `gallery-row--tall`），否则竖图被拉满整栏。
- `.gallery-row--wide` 缺 `grid-template-columns` 会退化成单列，三张宽图全堆一起。
- 首页产品横条在 ≤860 转成横向滚动（`flex` + `scroll-snap`），别改回 grid。
- 截图/自测：`.reveal` 元素没进视口时 `opacity:0`，裁元素会拍到空白；全页截图先滚到底再回顶。

## 部署（Cloudflare Workers 静态资源）

### 当前状态（2026-11-21）

| 项 | 状态 |
| --- | --- |
| 线上 | `https://yunshufz.top` 已上线（Cloudflare Worker `gongsiwangzhan2-apple` 的静态资源），`www` 301 收口到裸域 |
| 代码 | GitHub `main`（**public**，贡献图靠它计数）是唯一真源，但**发布不走 GitHub**（见下） |
| 域名 | NS 已迁 Cloudflare（`norman/chelsea.ns.cloudflare.com`），apex 与 www 都走 CF 代理 |
| 发布 | **本机 `npx wrangler deploy`**，OAuth 登录态在 `~/Library/Preferences/.wrangler/config/default.toml` |
| 国内机 | `129.204.52.104` 上只剩 `/var/www/yunshufz.top` 与 `ocrtext.top.conf`，本站 vhost 与证书已清；`sudo nginx -t` 通过 |

### 发布（唯一一条命令）

```bash
npm run build && node tools/check.mjs && npx wrangler deploy
```

三段都要过：build 出 37 个文件、check 报「全部通过」、deploy 打印 `Uploaded gongsiwangzhan2-apple`。

- **不要依赖 Cloudflare 的 Git 集成**。Workers Builds 一直报 `Error fetching GitHub User or Organization details`，构建被标成 `by API token` 且提交信息 `Empty commit message`，`dist/` 从未生成 → `Could not detect a directory containing static files`。**push 到 GitHub 不会自动上线**，push 只是备份与贡献图。
- `npx wrangler login` 在本机直连会 `UND_ERR_CONNECT_TIMEOUT`；必须 `HTTPS_PROXY=http://127.0.0.1:7897 npx wrangler login`（走本地代理）。登录一次管很久，之后 `deploy` 不需要代理。
- 换域名要同时改两处：`content/site.mjs` 的 `company.domain` / `company.url`，以及 `worker.mjs` 顶部的 `APEX`。生成器负责 `canonical` / `hreflang` / `sitemap.xml` / `og`，`worker.mjs` 负责 `www` 收口，没有第三处。
- `_headers` 缓存策略：`/assets/img/*` 一年 immutable（换图必须换文件名），`/assets/*` 一周。CF 会把自己的默认策略拼在前面，浏览器取最后一条，行为正确。
- `maintenance.html` 仍会生成但当前不生效（nginx 已退役）；要临时维护就下线部署或在 CF 面板操作。

### Cloudflare 踩过的坑

- **`_redirects` 只接受相对路径**：写 `https://www.x.top/*  https://x.top/:splat  301!` 会被 API 直接拒（`Invalid _redirects configuration: Line 1: Only relative URLs are allowed. [code: 100324]`），deploy 全失败。跨主机收口只能放 `worker.mjs`。
- **有 `main` 必须配 `assets.binding` + `run_worker_first: true`**。默认静态资源优先命中，worker 只有在未命中时才执行，不写 `run_worker_first` 则 `www` 的 301 永远不触发。
- `wrangler.jsonc` 的 `name` 必须与线上 Worker 名一致，否则 deploy 会新建一个 Worker，域名还绑在旧的上面。

### 历史部署路线（已退役，仅留档）

- `.github/workflows/deploy-nginx-legacy.yml` —— 国内机 nginx，**仅 workflow_dispatch**。
- `.github/workflows/deploy-overseas.yml` —— 海外机 `43.162.93.153`（Caddy 容器 `jinianren-caddy`），同样手动触发。

两条都只做加法（独立目录 + 独立站点块 + reload 前 `nginx -t`），不要再给它们加自动触发。

### nginx 时代踩过的坑（仍有效，回滚时会用到）

- **证书没了还装 vhost = 全机 nginx 起不来**。`ssl_certificate` 指向的 pem 缺失时 `nginx -t` 是整份配置 emerg；nginx 仍在跑只是因为内存里是旧配置，**一旦 restart 或重启机器，同机 `ocrtext.top` 一起躺下**。
- `nginx -t` 失败必须撤回自己的 conf 再退出，否则等于把一台坏机器留在那儿。
- nginx **1.24**：443 写 `listen 443 ssl http2;`；`http2 on;` 是 1.25.1+ 才有的写法。
- `/var/www` 归 root：`sudo mkdir -p && sudo chown $(id -u):$(id -g)`。
- `ssh deploy "sudo cat > /etc/nginx/..."` 会 `Permission denied`（重定向在普通用户 shell 里执行），要用 `sudo tee`。
- 非 root 跑 `nginx -t` 读不了 privkey 会假报失败，诊断一律 `sudo nginx -t`。
- GitHub OAuth token **没有 `workflow` scope**：`gh` 走 https 推含 `.github/workflows/` 的提交会被拒；远端是 SSH（`git@github.com:dengkang336-glitch/gongsiwangzhan2-Apple.git`），别改回 https。
- `yunshufz.top` **尚未 ICP 备案**（`ocrtext.top` 已备案）。走 Cloudflare 不过国内机房，通常不被拦，但不等于合规。

## 审核要点

- **必须 HTTPS，且能从境外打开**——审核在境外访问，只对大陆可见或证书异常会直接卡住。
- 提交前对照 `README.md` 第六节的自查清单逐条过。
