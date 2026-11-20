# AGENTS.md — 公司官网（云枢方舟）

本仓库是**广州云枢方舟科技有限公司的官方网站**，核心用途之一是通过 Apple Developer Program 组织（公司）账号审核。任何改动先问一句：这会不会让审核方觉得「不是一家真实公司在运营」？

## 硬约束

1. **主体信息必须与营业执照完全一致**，出现三处，改就三处同改：
   - 页脚版权行
   - `/about`「工商与联系信息」表
   - `/privacy` 与 `/terms` 落款

   现值：广州云枢方舟科技有限公司 / Guangzhou Yunshu Ark Technology Co., Ltd. / 广州市花都区建设北路 190 号亿能大厦 1207 室 A293 / support@ysfangzhou.xyz / ysfangzhou.xyz
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

## 部署与审核

- 纯静态，根目录整份上传即可（`content/`、`tools/` 不是运行必需但要留着）。
- **必须 HTTPS，且能从境外打开**——审核在境外访问，只对大陆可见或证书异常会直接卡住。
- 提交前对照 `README.md` 第六节的自查清单逐条过。
