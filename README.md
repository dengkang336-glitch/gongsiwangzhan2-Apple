# 云枢方舟 · 公司网站

广州云枢方舟科技有限公司的官方网站。纯静态站，中英双语，用来介绍公司主体、在研产品与联系方式。

主要用途：**Apple Developer Program 组织账号（公司账号）审核时的公司官网**。审核方会核对站点上的法人主体名称、可联系的真实地址与邮箱、产品描述与隐私政策是否与营业执照、报名表一致。

---

## 一、技术形态

- 纯 HTML / CSS / JS，**没有框架、没有构建工具链、没有 npm 依赖**。生成器只用了 Node 内置模块。
- 页面由 `content/*.mjs`（内容）+ `tools/build.mjs`（模板）生成。
  **改内容请改 `content/`，然后重新生成，不要直接改根目录的 `.html`**——下次构建会被覆盖。
- 中文在根目录，英文在 `en/`，两侧互相写 `hreflang`。
- 设计语言：档案纸（`#f4f1e9`）+ 墨（`#16181b`）+ 朱红（`#b0392a`）；中文宋体做标题，系统无衬线做正文，等宽字体做标签与编号。分割线极细，不用装饰性阴影与圆角卡片。

## 二、目录结构

```text
源码（仓库根目录只放源码）
├── content/
│   ├── site.mjs          公司信息、9 款产品、界面文案、全站文案
│   └── legal.mjs         隐私政策与服务条款（中英）
├── assets/
│   ├── style.css         全部样式（含 1080 / 860 / 640 三档断点）
│   ├── site.js           吸顶阴影、移动端菜单、进入视口渐显（无 JS 时有兜底）
│   ├── favicon.svg / og.png（1200×630）/ apple-touch-icon.png
│   └── img/              产品截图 28 张，竖图 620×1344、宽图 1280×800
├── tools/
│   ├── build.mjs         生成器：全部页面 + sitemap + robots + _headers + _redirects → dist/
│   ├── check.mjs         产物自检：死链、h1 唯一、img alt、重复 id、canonical
│   └── make-assets.py    用 Pillow 生成 og.png、apple-touch-icon.png、压缩截图
├── deploy/nginx/         旧国内机 vhost（仅留档）
├── package.json          npm run build / preview / check
└── .github/workflows/    deploy-nginx-legacy.yml、deploy-overseas.yml（均手动触发）

产物（dist/，已 gitignore，由 Cloudflare Workers Builds 构建）
├── index.html / products.html / products/<slug>.html ×9 / about / support / privacy / terms / 404
├── en/                   英文镜像，路径同名
├── maintenance.html      维护页（自包含样式，不引用 assets/）
├── assets/               assets/ 的整份副本
├── _headers              安全响应头 + 静态资源缓存
├── _redirects            www → 裸域 301
└── sitemap.xml / robots.txt
```

## 三、本地预览与构建

```bash
npm run build     # = node tools/build.mjs，产物全部进 dist/
npm run preview   # 构建后起静态服务 → http://localhost:8820/
npm run check     # 自检 dist/：死链、h1 唯一、img alt、重复 id、canonical
```

构建是幂等的：每次先清空 `dist/`，再重写全部页面、`assets/` 副本、`sitemap.xml`、`robots.txt`、`_headers`、`_redirects`。

> **产物只在 `dist/` 里。** 仓库根目录只放源码；改完 `content/` 后必须重新构建，`dist/` 已 gitignore，不要提交。
## 四、改内容

| 想改什么 | 改哪里 |
| --- | --- |
| 公司名、地址、邮箱、电话、备案号 | `content/site.mjs` → `company` |
| 增删产品、换截图、改功能清单 | `content/site.mjs` → `products`（`slug` 决定生成路径） |
| 首页文案、能力条目、FAQ、页脚栏目 | `content/site.mjs` → `copy.zh` / `copy.en` |
| 界面小词（「查看详情」「在研」等） | `content/site.mjs` → `ui.zh` / `ui.en` |
| 隐私政策、服务条款 | `content/legal.mjs` |
| 版式、颜色、字号 | `assets/style.css`（变量集中在文件顶部 `:root`） |

> `company.phone` 与 `company.icp` 留空时，对应位置**不会渲染**，不会出现「未填」字样。有信息时填上即可。

产品截图放在 `assets/img/`，命名 `<slug>-01.jpg`……。换图后确认长宽比仍是竖图 620×1344 或宽图 1280×800，否则卡片会被裁切。

## 五、部署（Cloudflare Workers 静态资源）

线上地址：**https://yunshufz.top**（Cloudflare Worker `gongsiwangzhan2-apple` + 静态资源，域名走 Cloudflare DNS）

仓库里的 `wrangler.jsonc` 就是部署契约：

```jsonc
{
  "name": "gongsiwangzhan2-apple",   // 必须与 CF 上的 Worker 名完全一致
  "compatibility_date": "2026-11-21",
  "assets": { "directory": "./dist", "not_found_handling": "404-page" }
}
```

### CF 项目里要填的两格

这条流水线叫 **Workers Builds**（Git 集成），和 Pages 不是一回事：

| 项 | 值 |
| --- | --- |
| Build command | `node tools/build.mjs`（**必填**，留空则静态文件不会生成） |
| Deploy command | `npx wrangler deploy`（默认值，别改） |
| 环境变量 | `NODE_VERSION=20`（项目零依赖，不需要 `npm install`） |

**日常迭代：改 → `npm run build && npm run check` → `git push origin main`**，CF 拉代码、跑构建、`wrangler deploy`，约 1 分钟。

手动发布（本机已登录时）：`npm run build && npx wrangler deploy`。

### 为什么必须是这条路

Worker 静态资源只认 `wrangler.jsonc` 里 `assets.directory` 指的那个目录。早期仓库把产物直接写在根目录，CF 拿仓库根去 `wrangler deploy` 会报：

```text
✘ [ERROR] Could not detect a directory containing static files (e.g. html, css and js) for the project
```

所以**产物统一在 `dist/`、且构建命令必须真的执行**，这两件事同时成立才能发布成功。

### 产物约定

`dist/` 是纯产物，包含：

- `_headers` —— 安全响应头（`nosniff` / `Referrer-Policy` / `X-Frame-Options` / `Permissions-Policy`）+ 静态资源缓存（`/assets/img/*` 一年 immutable）
- `_redirects` —— `www` → 裸域 301（按 `company.url` 自动生成）
- `404.html` —— 由 `wrangler.jsonc` 的 `not_found_handling: "404-page"` 用作未命中页面
- 全部 HTML、`assets/` 副本、`sitemap.xml`、`robots.txt`、`maintenance.html`

### 域名接入（dnspod → Cloudflare）

1. **先在 dnspod 导出全部记录**，重点 MX / TXT / SPF / DKIM / DMARC —— 域名邮箱全靠它们，丢了收信就断。
2. Cloudflare 添加站点 `yunshufz.top`（Free 计划够用），把记录逐条重建，MX/TXT 原样照抄；A/CNAME 先保持 **DNS only（灰云）**。
3. 站点验证通过后，去 dnspod 把 NS 改成 Cloudflare 给的那两个 —— **改 NS 之前别删旧记录**。
4. `dig +short NS yunshufz.top @8.8.8.8` 返回 `*.ns.cloudflare.com` 即生效（几分钟到 24 小时）。
5. Worker → Settings → Domains & Routes → 绑定 `yunshufz.top` 与 `www.yunshufz.top`；`www → 裸域` 的 301 由 `_redirects` 负责。
6. 清理旧机残留：`/var/www/yunshufz.top`、`/etc/nginx/conf.d/yunshufz.top.conf`，以及 dnspod 上指向 `129.204.52.104` 的 `www` A 记录（现在返回的是腾讯云未备案拦截页）。

### 换域名

改 `content/site.mjs` 的 `company.domain` / `company.url` → `npm run build` → push；Cloudflare 侧给新域名加 Custom domain。`_redirects`、`canonical`、`sitemap.xml`、`og` 会跟着一起变，没有第二处要改。

### 暂停 / 回滚

- 暂停：CF 控制台 Deployments → 停用当前部署；或把 DNS 摘掉（会直接不可达，不适合临时维护）。
- 回滚：CF 控制台 Deployments → 选一个历史成功部署 → Rollback；仓库侧 `git revert` 后 push。

### 历史部署路线（已退役，仅留档）

- `.github/workflows/deploy-nginx-legacy.yml` —— 国内机 `129.204.52.104` + 宿主机 nginx，手动触发才有动作。
- `.github/workflows/deploy-overseas.yml` —— 海外机 `43.162.93.153` + Caddy 容器，同样手动触发。

两条都只做加法（独立目录 + 独立站点块 + reload 前 `nginx -t`），不要再对它们做自动触发。

### ⚠️ 备案

`.top` 域名未做 ICP 备案。Cloudflare 不经过国内机房，通常不会被腾讯云拦，但不等于合规；境内访问延迟也偏高。

## 六、Apple 组织账号审核自查清单

提交前逐条对照（审核看的是「网站证明这是一家真实运营的公司」）：

- [ ] **法人主体名称与营业执照完全一致**：页脚版权行、`/about` 工商信息表、`/privacy` 落款三处均为「广州云枢方舟科技有限公司」。
- [ ] **网站可公开访问**：无登录墙、无密码、HTTPS 有效、非「建设中」页面。
- [ ] **首页能看出公司做什么**：首屏有主体名称、业务说明、产品横条，不是模板占位。
- [ ] **每款 App 有独立介绍页**：`/products/<slug>` 含平台、功能、数据与隐私说明。审核在核对 App 时会点进来。
- [ ] **真实联系方式**：邮箱 `yunshufz@163.com`（页脚 + `/support` + `/about`）与完整注册地址（页脚 + `/about` + 政策落款）。
- [ ] **隐私政策**：`/privacy`，逐款写明采集范围、留存期、第三方、跨境与删除方式；App Store Connect 的 Privacy Policy URL 填它。
- [ ] **服务条款**：`/terms`。
- [ ] **支持页**：`/support`，App Store 的 Support URL 填它。
- [ ] **英文版可用**：`/en/`，给境外审核看。
- [ ] 报名表另填（不在网站上）：D-U-N-S 编号、公司固定电话、以公司域名收信的邮箱。

注意两点容易出现的问题：

- 网站上任何「个人开发者 / 独立工作室 / 个人接单」式表述，都和「以公司主体注册」矛盾，别在报名材料里混用。本站统一写公司。
- 站点文案只描述自家产品功能，**不出现任何竞品名称与商标**（这批产品属复刻类，功能可参考公开信息，视觉、文案、图标、代码均为原创）。

## 七、待补（需要公司提供）

- 公司固定电话 —— 填 `content/site.mjs` 的 `company.phone`，会自动出现在页脚与 `/about`。
- ICP 备案号（若解析到大陆服务器）—— 填 `company.icp`，页脚自动出现并链到工信部查询页。
- 营业执照英文名核对：现用 `Guangzhou Yunshu Ark Technology Co., Ltd.`，如执照或银行开户名另有写法，以执照为准同步修改 `company.legalNameEn`。
- 若域名或邮箱更换，同步 `company.url` / `company.domain` / `company.email`，并重新生成（`sitemap.xml`、canonical、`og:url` 都取自这里）。
