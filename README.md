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
.
├── index.html            首页（公司档案卡 + 产品横条 + 产品索引 + 能力 + 关于 + 联系）
├── products.html         产品目录（9 张卡片）
├── products/<slug>.html  单款产品页 ×9（vivace / tuziscan / palmglow / shiyin / tunison /
│                         nightisle / kite / grove / lampside）
├── about.html            关于（自述、工作方式、工商与联系信息、我们不做的事）
├── support.html          支持（FAQ + 各产品支持入口）
├── privacy.html          隐私政策（12 节，逐款说明数据范围）
├── terms.html            服务条款（12 节）
├── 404.html
├── en/                   英文镜像，路径同名
├── sitemap.xml / robots.txt
├── assets/
│   ├── style.css         全部样式（含 1080 / 860 / 640 三档断点）
│   ├── site.js           吸顶阴影、移动端菜单、进入视口渐显（无 JS 时有兜底）
│   ├── favicon.svg
│   ├── og.png            社交卡片 1200×630
│   ├── apple-touch-icon.png
│   └── img/              产品截图，手机竖图 620×1344、宽图 1280×800，共 28 张
├── content/
│   ├── site.mjs          公司信息、9 款产品、界面文案、全站文案
│   └── legal.mjs         隐私政策与服务条款（中英）
└── tools/
    ├── build.mjs         生成全部页面 + sitemap + robots
    └── make-assets.py    用 Pillow 生成 og.png 与 apple-touch-icon.png
```

## 三、本地预览与构建

```bash
# 生成全部页面（改完 content/ 后必须跑）
node tools/build.mjs

# 本地预览
python3 -m http.server 8800
# 打开 http://localhost:8800/
```

构建是幂等的：每次都会重写根目录与 `en/` 下的全部 HTML、`sitemap.xml`、`robots.txt`。

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

## 五、部署

站点是纯静态文件，**根目录整份上传即可**（`content/`、`tools/` 不是运行必需，但建议一起留着，方便以后改）。

三种常见做法：

1. **复用现有服务器（推荐，域名不变）**
   之前为旧版公司站准备好的机器与域名（`ysfangzhou.xyz`）可以继续用：把本目录 rsync 到原来的站点目录，Caddy / Nginx 指向它，只换文件不动配置。

   ```bash
   rsync -avz --delete --exclude .git ./ user@host:/opt/company-site/
   ```

2. **静态托管**（Cloudflare Pages / Netlify / Vercel / GitHub Pages）
   构建命令留空，发布目录填 `/`（根目录）。随后在托管面板绑定域名并开启 HTTPS。

3. **对象存储 + CDN**（OSS / COS + 全站加速）
   需要把 `404.html` 配成自定义错误页。

无论哪种：**必须 HTTPS，且能从境外正常打开**。Apple 审核团队在境外访问，站点如果只对大陆网络可见、或证书错误，会直接卡在「网站无法访问」。

## 六、Apple 组织账号审核自查清单

提交前逐条对照（审核看的是「网站证明这是一家真实运营的公司」）：

- [ ] **法人主体名称与营业执照完全一致**：页脚版权行、`/about` 工商信息表、`/privacy` 落款三处均为「广州云枢方舟科技有限公司」。
- [ ] **网站可公开访问**：无登录墙、无密码、HTTPS 有效、非「建设中」页面。
- [ ] **首页能看出公司做什么**：首屏有主体名称、业务说明、产品横条，不是模板占位。
- [ ] **每款 App 有独立介绍页**：`/products/<slug>` 含平台、功能、数据与隐私说明。审核在核对 App 时会点进来。
- [ ] **真实联系方式**：邮箱 `support@ysfangzhou.xyz`（页脚 + `/support` + `/about`）与完整注册地址（页脚 + `/about` + 政策落款）。
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
