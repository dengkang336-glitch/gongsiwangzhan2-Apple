# AGENTS.md — 公司官网（云枢方舟）

本仓库是**广州云枢方舟科技有限公司的官方网站**，核心用途之一是通过 Apple Developer Program 组织（公司）账号审核。任何改动先问一句：这会不会让审核方觉得「不是一家真实公司在运营」？

## 硬约束

1. **主体信息必须与营业执照完全一致**，出现三处，改就三处同改：
   - 页脚版权行
   - `/about`「工商与联系信息」表
   - `/privacy` 与 `/terms` 落款

   现值：广州云枢方舟科技有限公司 / Guangzhou Yunshu Ark Technology Co., Ltd. / 广州市花都区建设北路 190 号亿能大厦 1207 室 A293 / support@ysfangzhou.xyz（已在用的真实邮箱）/ 备用域名 yunshufz.top（**已暂停，见下节**）
2. **不出现竞品名称与商标**。站上这批产品属复刻类，功能可参考公开信息，视觉/文案/图标/代码必须原创。
3. **不出现「独立开发者 / 个人工作室 / 个人接单」**这类与公司主体矛盾的表述。
4. 隐私政策要**逐款**写明数据范围（是否上云、留存多久、第三方、跨境、删除方式），不能只写一段通稿——审核会拿它跟 App 的隐私清单对。

## 结构

```text
content/site.mjs    公司信息、9 款产品、界面词、全站文案
content/legal.mjs   隐私政策与服务条款（中英各 12 节）
tools/build.mjs     模板 + 生成（32 页 + sitemap.xml + robots.txt）
tools/make-assets.py  og.png / apple-touch-icon.png（Pillow）
assets/style.css    全部样式（断点 1080 / 860 / 640）
assets/site.js      吸顶阴影、移动菜单、reveal（无 JS 有兜底）
assets/img/         产品截图：竖图 620×1344、宽图 1280×800
→ 生成物：根目录 *.html（中文）+ en/ 镜像
```

## 工作流

```bash
node tools/build.mjs           # 改完 content/ 必须跑；幂等，覆盖全部 html
python3 -m http.server 8800    # 本地预览
```

**只改 `content/`，不要手改根目录 html**——下次构建就没了。想改版式去 `assets/style.css`，`tools/build.mjs` 只负责模板与路由。

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

## 部署（GitHub Actions → 国内服务器 nginx）

### 当前状态：**整站暂停（2026-11-21）**

| 项 | 状态 |
| --- | --- |
| 代码 | GitHub `main` 即本地（唯一真源） |
| 访客 | 打不开：`yunshufz.top` 的 A 记录已移除，DNS 不解析 |
| 服务器 | `129.204.52.104` 上只剩 `/var/www/yunshufz.top` 静态文件（无 vhost 引用，无害）；vhost 与 Let's Encrypt 证书已清理 |
| 仓库变量 | `SITE_STATE=paused`；`deploy/nginx/yunshufz.top.conf` 是暂停版（全站 503 + 维护页） |
| 同机 ocrtext.top | 正常 200 |

**恢复上线**（顺序不能乱）：① DNS 加回 A `129.204.52.104` → ② `gh variable set SITE_STATE -b live` → ③ vhost 里 `return 503` 那 4 行换回 `location / { try_files $uri $uri/ $uri.html =404; }` + 静态资源段（注释里留了原文）→ ④ `sudo certbot certonly --webroot -w /var/www/certbot -d yunshufz.top` → ⑤ push（工作流会自动建目录、装 vhost、reload，海外 runner 顺便验证境外可达）。

暂停页由 `tools/build.mjs` 的 `maintenancePage()` 生成 `maintenance.html`，**样式全内联、不引用 `assets/`**（暂停期间静态资源同样 503）；nginx 里 `location = /maintenance.html { internal; }`，直接访问拿不到。

### 事实

- 生产机是**国内**腾讯云 `129.204.52.104`（用户 `ubuntu`），宿主机 nginx 直接发静态文件，落点 `/var/www/yunshufz.top`，vhost 在 `/etc/nginx/conf.d/yunshufz.top.conf`；**仓库里的 `deploy/nginx/yunshufz.top.conf` 是权威副本**，工作流每次覆盖服务器那份。
- 这台机器上还跑着 `ocrtext.top`（小程序后端，反代 `127.0.0.1:8081` 的容器）。所以：独立目录、独立 conf.d 文件、`nginx -t` 过了才 `systemctl reload`、**绝不 `systemctl restart nginx`**、发布后回查 `ocrtext.top` 仍是 200。
- `SITE_STATE`（仓库变量）决定工作流怎么断言：`live` 要求首页 200 + 抽检公司全称/地址/canonical；`paused` 要求所有路径 **503 且 503 带维护页正文**。vhost 与这个变量必须一致，否则流水线红。
- 域名不解析时（暂停 / 未挂 DNS），外网自检自动降级为 `warning` 且不失败——但 `回归检查` 步骤照常跑，同机站点仍受保护。
- nginx 是 **1.24**：443 要写 `listen 443 ssl http2;`，`http2 on;` 是 1.25.1+ 的写法，写了 `nginx -t` 直接 emerg。
- 证书 certbot webroot（`/var/www/certbot`），续期自动；域名换机器后要重新签发。`/etc/letsencrypt/live/<域名>/` 被删时工作流**拒绝安装 vhost**（见下条）。
- 海外机 `43.162.93.153`（Caddy + docker `jinianren-caddy`）保留为备用，workflow 是 `deploy-overseas.yml`，**只能手动触发**。
- GitHub 仓库的 OAuth token **没有 `workflow` scope**，`gh` 走 https 推含 `.github/workflows/` 的提交会被拒；远端是 SSH（`git@github.com:dengkang336-glitch/gongsiwangzhan2-Apple.git`），别改回 https。
- `yunshufz.top` **尚未 ICP 备案**（`ocrtext.top` 已备案）。大陆机跑未备案域名随时可能被拦——这也是当初整站暂停的直接原因；备案下来后要做「备案接入」。

### 部署踩过的坑（血泪，别重复）

- **证书没了还装 vhost = 全机 nginx 起不来**。vhost 里 `ssl_certificate` 指向的 pem 缺失时 `nginx -t` 是**整份配置 emerg**；nginx 当时仍在跑是因为内存里是旧配置，**一旦 restart / 重启机器，同机 `ocrtext.top` 会一起躺下**。现在 vhost 步骤先 `sudo test -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem`，不在就跳过安装并 warning。
- **`nginx -t` 失败必须撤回自己的 conf**。只 `exit 1` 会把一台坏机器留在那儿；reload 步骤里已加：校验失败 → `sudo rm -f /etc/nginx/conf.d/yunshufz.top.conf` → 再 `nginx -t` 确认回到可用状态 → 才失败退出。
- **`/var/www` 归 root**，被清过之后普通用户 `mkdir` 会 `Permission denied`：用 `sudo mkdir -p && sudo chown $(id -u):$(id -g)`。
- `ssh deploy "sudo cat > /etc/nginx/conf.d/x.conf"` 会 `Permission denied`——重定向由普通用户 shell 执行，不在 sudo 语境；用 `sudo tee ... > /dev/null`。
- 非 root 跑 `nginx -t` 会因读不了 privkey 报 test failed，**别误判成配置坏了**；诊断一律 `sudo nginx -t`。
- 域名/证书/目录被人工清掉后，工作流仍会照常同步文件（无害），但会红在“证书缺失”。清理服务器后记得把 `SITE_STATE` 也改成 `paused`。

## 审核要点

- **必须 HTTPS，且能从境外打开**——审核在境外访问，只对大陆可见或证书异常会直接卡住。
- 提交前对照 `README.md` 第六节的自查清单逐条过。
