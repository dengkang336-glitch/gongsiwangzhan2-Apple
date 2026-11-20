# AGENTS.md — 公司官网（云枢方舟）

本仓库是**广州云枢方舟科技有限公司的官方网站**，核心用途之一是通过 Apple Developer Program 组织（公司）账号审核。任何改动先问一句：这会不会让审核方觉得「不是一家真实公司在运营」？

## 硬约束

1. **主体信息必须与营业执照完全一致**，出现三处，改就三处同改：
   - 页脚版权行
   - `/about`「工商与联系信息」表
   - `/privacy` 与 `/terms` 落款

   现值：广州云枢方舟科技有限公司 / Guangzhou Yunshu Ark Technology Co., Ltd. / 广州市花都区建设北路 190 号亿能大厦 1207 室 A293 / support@ysfangzhou.xyz（已在用的真实邮箱）/ 线上域名 yunshufz.top
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

线上：**https://yunshufz.top**，推 `main` 约 60 秒自动发布。细节见 `README.md` 第五节，这里只记必须知道的：

- 生产机是**国内**腾讯云 `129.204.52.104`（用户 `ubuntu`），宿主机 nginx 直接发静态文件，落点 `/var/www/yunshufz.top`，vhost 在 `/etc/nginx/conf.d/yunshufz.top.conf`；**仓库里的 `deploy/nginx/yunshufz.top.conf` 是权威副本**，工作流每次覆盖服务器那份。
- 这台机器上还跑着 `ocrtext.top`（小程序后端，反代 `127.0.0.1:8081` 的容器）。所以：独立目录、独立 conf.d 文件、`nginx -t` 过了才 `systemctl reload`、**绝不 `systemctl restart nginx`**、发布后回查 `ocrtext.top` 仍是 200。
- nginx 是 **1.24**：443 要写 `listen 443 ssl http2;`，`http2 on;` 是 1.25.1+ 的写法，写了 `nginx -t` 直接 emerg。
- 证书 certbot webroot（`/var/www/certbot`），续期自动；域名换机器后要重新签发。
- 海外机 `43.162.93.153`（Caddy + docker `jinianren-caddy`）保留为备用，workflow 是 `deploy-overseas.yml`，**只能手动触发**。
- GitHub 仓库的 OAuth token **没有 `workflow` scope**，`gh` 走 https 推含 `.github/workflows/` 的提交会被拒；远端是 SSH（`git@github.com:dengkang336-glitch/gongsiwangzhan2-Apple.git`），别改回 https。
- `yunshufz.top` **尚未 ICP 备案**（`ocrtext.top` 已备案）。大陆机跑未备案域名随时可能被拦，站长已知悉；备案下来后要做「备案接入」。

## 审核要点

- **必须 HTTPS，且能从境外打开**——审核在境外访问，只对大陆可见或证书异常会直接卡住。
- 提交前对照 `README.md` 第六节的自查清单逐条过。
