#!/usr/bin/env node
/**
 * 静态站点生成器。
 * 输入：content/site.mjs（公司、产品、文案）、content/legal.mjs（隐私政策 / 条款）
 * 输出：dist/ 目录（HTML、assets 副本、sitemap.xml、robots.txt、_headers）
 * 注：www → 裸域 301 不在构建里做（CF 的 _redirects 只接受相对路径），由仓库根目录 worker.mjs 负责。
 *       dist/ 是纯产物，部署时整目录上传即可（Cloudflare Pages 的「构建输出目录」填 dist）。
 *
 * 用法：node tools/build.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { company, products, inProgress, ui, copy } from "../content/site.mjs";
import { privacy, terms } from "../content/legal.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "dist");

const LANGS = ["zh", "en"];
const LEGAL_DATE = { zh: "2026 年 11 月 20 日", en: "20 November 2026" };
const YEAR = 2026;

/* ---------------- paths ---------------- */

const P = {
  home: { zh: "index.html", en: "en/index.html" },
  products: { zh: "products.html", en: "en/products.html" },
  about: { zh: "about.html", en: "en/about.html" },
  support: { zh: "support.html", en: "en/support.html" },
  privacy: { zh: "privacy.html", en: "en/privacy.html" },
  terms: { zh: "terms.html", en: "en/terms.html" },
  notfound: { zh: "404.html", en: "en/404.html" },
};

const productPath = (lang, slug) =>
  lang === "zh" ? `products/${slug}.html` : `en/products/${slug}.html`;

const rel = (from, to) => {
  const r = path.posix.relative(path.posix.dirname(from), to);
  return r === "" ? path.posix.basename(to) : r;
};
const ABS = /^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i;
// 绝对地址（https:、mailto:、#anchor）原样输出，站内路径才做相对化。
const href = (from, to) => (ABS.test(to) ? to : rel(from, to));
const asset = (from, file) => rel(from, `assets/${file}`);

const canonical = (p) =>
  `${company.url}/${p.endsWith("index.html") ? p.slice(0, -"index.html".length) : p}`;

/* ---------------- html helpers ---------------- */

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const t = (lang, key) => ui[lang][key];

const MARK = (cls = "brand-mark") =>
  `<svg class="${cls}" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <rect x="0.8" y="0.8" width="30.4" height="30.4" rx="6.4" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <path d="M15.6 7.4v13.2" stroke="currentColor" stroke-width="1.4"/>
    <path d="M15.6 7.4 23 20.6h-7.4z" fill="currentColor"/>
    <path d="M8.6 23.6h14.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M10.4 20.8h11.2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".4"/>
  </svg>`;

const langSwitchPath = (pageKey, slug, lang) => {
  const other = lang === "zh" ? "en" : "zh";
  if (pageKey === "product") return productPath(other, slug);
  return P[pageKey][other];
};

/* ---------------- chrome ---------------- */

function navItems(lang) {
  return [
    { key: "products", label: t(lang, "nav").products, href: P.products[lang] },
    { key: "capabilities", label: t(lang, "nav").capabilities, href: `${P.home[lang]}#capabilities` },
    { key: "about", label: t(lang, "nav").about, href: P.about[lang] },
    { key: "support", label: t(lang, "nav").support, href: P.support[lang] },
    { key: "contact", label: t(lang, "nav").contact, href: `${P.home[lang]}#contact` },
  ];
}

function header(lang, currentPath, pageKey) {
  const items = navItems(lang)
    .map(
      (item) =>
        `<a href="${href(currentPath, item.href)}"${
          item.key === pageKey ? ' aria-current="page"' : ""
        }>${esc(item.label)}</a>`
    )
    .join("\n        ");

  const otherLangPath = langSwitchPath(pageKey, pageKey === "product" ? currentPath.split("/").pop().replace(".html", "") : null, lang);

  return `<header class="site-head" id="siteHead">
  <div class="wrap head-inner">
    <a class="brand" href="${href(currentPath, P.home[lang])}" aria-label="${esc(
    lang === "zh" ? "云枢方舟首页" : "Yunshu Ark home"
  )}">
      ${MARK()}
      <span class="brand-type"><b>${lang === "zh" ? company.brandZh : company.brandEn}</b><i>${company.brandEn}</i></span>
    </a>
    <nav class="nav" id="siteNav" aria-label="${lang === "zh" ? "主导航" : "Main"}">
        ${items}
    </nav>
    <div class="head-tools">
      <a class="lang" href="${href(currentPath, otherLangPath)}" lang="${lang === "zh" ? "en" : "zh-Hans"}" hreflang="${
    lang === "zh" ? "en" : "zh-Hans"
  }" aria-label="${esc(t(lang, "langSwitchLabel"))}">${t(lang, "langSwitch")}</a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="siteNav" aria-label="${esc(
        t(lang, "openMenu")
      )}"><span></span></button>
    </div>
  </div>
</header>`;
}

function footer(lang, currentPath) {
  const u = ui[lang];
  const cols = [
    {
      h: u.nav.products,
      links: [
        ...products.slice(0, 6).map((p) => ({ label: p.name[lang], href: productPath(lang, p.slug) })),
        { label: u.allProducts, href: P.products[lang] },
      ],
    },
    {
      h: lang === "zh" ? "公司" : "Company",
      links: [
        { label: u.nav.about, href: P.about[lang] },
        { label: u.nav.support, href: P.support[lang] },
        { label: u.nav.contact, href: `${P.home[lang]}#contact` },
      ],
    },
    {
      h: u.legal,
      links: [
        { label: u.privacy, href: P.privacy[lang] },
        { label: u.terms, href: P.terms[lang] },
        { label: company.email, href: `mailto:${company.email}` },
      ],
    },
  ];

  return `<footer class="site-foot">
  <div class="wrap">
    <div class="foot-top">
      <div class="foot-brand">
        <span class="brand" style="gap:11px">${MARK()}<span class="brand-type"><b>${
    lang === "zh" ? company.brandZh : company.brandEn
  }</b><i>${company.brandEn}</i></span></span>
        <p>${esc(lang === "zh" ? company.businessZh : company.businessEn)}<br>${
    lang === "zh" ? company.legalNameZh : company.legalNameEn
  }</p>
      </div>
      ${cols
        .map(
          (c) => `<div class="foot-col">
        <h4>${esc(c.h)}</h4>
        <ul>${c.links
          .map((l) => `<li><a href="${href(currentPath, l.href)}">${esc(l.label)}</a></li>`)
          .join("")}</ul>
      </div>`
        )
        .join("\n      ")}
    </div>
    <div class="footer-legal">
      <span>© ${YEAR} ${esc(lang === "zh" ? company.legalNameZh : company.legalNameEn)} · ${esc(u.rights)}</span>
      <span>${esc(lang === "zh" ? company.addressZh : company.addressEn)} · <a href="mailto:${company.email}">${company.email}</a>${
        company.icp
          ? ` · <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">${esc(company.icp)}</a>`
          : ""
      }</span>
    </div>
  </div>
</footer>`;
}

function shell({ lang, pageKey, slug, currentPath, title, desc, body, bodyClass = "" }) {
  const u = ui[lang];
  const zhPath = pageKey === "product" ? productPath("zh", slug) : P[pageKey].zh;
  const enPath = pageKey === "product" ? productPath("en", slug) : P[pageKey].en;

  const orgJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.legalNameZh,
    legalName: company.legalNameZh,
    alternateName: company.brandZh,
    url: `${company.url}/`,
    email: company.email,
    description: lang === "zh" ? copy.zh.homeDesc : copy.en.homeDesc,
    address: {
      "@type": "PostalAddress",
      streetAddress: lang === "zh" ? "建设北路 190 号亿能大厦 1207 室 A293" : "Room 1207-A293, Yineng Building, 190 Jianshe North Road",
      addressLocality: lang === "zh" ? "广州市花都区" : "Guangzhou",
      addressRegion: lang === "zh" ? "广东省" : "Guangdong",
      postalCode: "510800",
      addressCountry: "CN",
    },
  });

  return `<!doctype html>
<html lang="${lang === "zh" ? "zh-Hans" : "en"}" data-lang="${lang}" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical(lang === "zh" ? zhPath : enPath)}">
<link rel="alternate" hreflang="zh-Hans" href="${canonical(zhPath)}">
<link rel="alternate" hreflang="en" href="${canonical(enPath)}">
<link rel="alternate" hreflang="x-default" href="${canonical(zhPath)}">
<meta name="theme-color" content="#f4f1e9">
<meta name="author" content="${esc(company.legalNameZh)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(company.brandZh)} · ${esc(company.brandEn)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical(lang === "zh" ? zhPath : enPath)}">
<meta property="og:image" content="${company.url}/assets/og.png">
<meta property="og:locale" content="${lang === "zh" ? "zh_CN" : "en_US"}">
<meta property="og:locale:alternate" content="${lang === "zh" ? "en_US" : "zh_CN"}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${asset(currentPath, "favicon.svg")}" type="image/svg+xml">
<link rel="apple-touch-icon" href="${asset(currentPath, "apple-touch-icon.png")}">
<link rel="stylesheet" href="${asset(currentPath, "style.css")}">
<script>document.documentElement.classList.remove("no-js");</script>
<script type="application/ld+json">${orgJsonLd}</script>
</head>
<body data-lang="${lang}"${bodyClass ? ` class="${bodyClass}"` : ""}>
<a class="skip" href="#main">${esc(u.skip)}</a>
${header(lang, currentPath, pageKey)}
<main id="main">
${body}
</main>
${footer(lang, currentPath)}
<script src="${asset(currentPath, "site.js")}" defer></script>
</body>
</html>
`;
}

/* ---------------- pieces ---------------- */

function eyebrow(text, extra = "") {
  return `<p class="eyebrow"><span class="dot"></span>${esc(text)}${extra ? `<span>${extra}</span>` : ""}</p>`;
}

function contactBand(lang, { title, body, compact = false } = {}) {
  const u = ui[lang];
  return `<section class="band contact-band${compact ? " band--tight" : ""}" id="contact">
  <div class="wrap contact-grid">
    <div>
      ${eyebrow(lang === "zh" ? "04 — 联系" : "04 — Contact")}
      <h2>${esc(title || u.contactTitle)}</h2>
      <p>${esc(body || u.contactBody)}</p>
      <a class="mail-link" href="mailto:${company.email}?subject=${encodeURIComponent(
    lang === "zh" ? copy.zh.mailSubject : copy.en.mailSubject
  )}">${company.email}<span class="arrow">↗</span></a>
    </div>
    <div class="contact-meta">
      <div class="item"><b>${esc(u.legalName)}</b>${esc(
    lang === "zh" ? company.legalNameZh : company.legalNameEn
  )}</div>
      <div class="item"><b>${esc(u.addressLabel)}</b>${esc(
    lang === "zh" ? company.addressZh : company.addressEn
  )}</div>
      ${company.phone ? `<div class="item"><b>${esc(u.phoneLabel)}</b><a href="tel:${company.phone.replace(/[^+\d]/g, "")}">${esc(company.phone)}</a></div>` : ""}
      <div class="item"><b>${esc(u.hoursLabel)}</b>${esc(
    lang === "zh" ? company.hoursZh : company.hoursEn
  )}</div>
    </div>
  </div>
</section>`;
}

function productCard(lang, from, p, i) {
  const cover = p.shots[0];
  return `<article class="card reveal" data-shape="${p.shape}">
  <a class="card-link" href="${href(from, productPath(lang, p.slug))}">
    <div class="card-visual">
      <img src="${asset(from, `img/${cover.file}`)}" width="${cover.w}" height="${cover.h}" alt="${esc(
    cover.alt[lang]
  )}" loading="lazy" decoding="async">
    </div>
    <div class="card-body">
      <div class="card-top"><span>${String(i + 1).padStart(2, "0")}</span><span>${esc(p.category[lang])}</span></div>
      <h3>${esc(p.name[lang])}</h3>
      <p class="tagline">${esc(p.tagline[lang])}</p>
      <div class="card-foot"><span>${esc(p.platforms[lang])}</span><span>${esc(
    ui[lang].viewDetail
  )} <span aria-hidden="true">→</span></span></div>
    </div>
  </a>
</article>`;
}

/* ---------------- pages ---------------- */

function homePage(lang) {
  const c = copy[lang];
  const u = ui[lang];
  const from = P.home[lang];
  const stripIds = ["vivace", "tuziscan", "palmglow", "nightisle", "shiyin"];
  const strip = stripIds
    .map((id, i) => {
      const p = products.find((x) => x.slug === id);
      const cover = p.shots[0];
      return `<a class="strip-item" href="${href(from, productPath(lang, id))}">
        <div class="strip-shot"><img src="${asset(from, `img/${cover.file}`)}" width="${cover.w}" height="${
        cover.h
      }" alt="${esc(cover.alt[lang])}" loading="lazy" decoding="async"></div>
        <div class="strip-cap"><b>${esc(p.name[lang])}</b><span>${String(i + 1).padStart(2, "0")}</span></div>
      </a>`;
    })
    .join("\n      ");

  const caps = [
    {
      t: { zh: "原生应用工程", en: "Native app engineering" },
      s: { zh: "SwiftUI · Swift · HealthKit · StoreKit", en: "SwiftUI · Swift · HealthKit · StoreKit" },
      d: {
        zh: "iOS、iPadOS 与 watchOS 的原生开发，包括健康数据读写、内购与订阅、小组件、本地通知与多语言本地化。我们做过 30 项健康指标、买断与订阅并存的商店逻辑，以及 9 种语言的同一套界面。",
        en: "Native work for iOS, iPadOS and watchOS: reading health data, in-app purchase and subscriptions, widgets, local notifications and localization. We have shipped 30 health metrics, store logic with both one-off and subscription products, and one interface in nine languages.",
      },
    },
    {
      t: { zh: "Web 与实时 3D", en: "Web and real-time 3D" },
      s: { zh: "TypeScript · React · Three.js · WebSocket", en: "TypeScript · React · Three.js · WebSocket" },
      d: {
        zh: "在浏览器里做可以走进去的空间：第三人称漫游、多人同场、PWA 安装与移动端触屏操作。性能预算按中端手机定，而不是按开发机定。",
        en: "Spaces you can walk into, in a browser: third-person navigation, shared scenes, PWA installation and touch controls. The performance budget is set for a mid-range phone, not a developer machine.",
      },
    },
    {
      t: { zh: "产品设计与原型", en: "Product design and prototypes" },
      s: { zh: "Design system · Typography · Motion", en: "Design system · Typography · Motion" },
      d: {
        zh: "先出可以点的原型，再写界面的代码。设计系统统一颜色、字号与间距；动效有实际作用，不只是装饰。方向在真机上验证，而不是在想象里验证。",
        en: "A prototype you can tap comes before interface code. A design system holds colour, type and spacing together; motion does a job rather than decorating. Direction is validated on a real device, not in imagination.",
      },
    },
    {
      t: { zh: "隐私与本地优先", en: "Privacy and local-first data" },
      s: { zh: "On-device · No tracking · Minimal collection", en: "On-device · No tracking · Minimal collection" },
      d: {
        zh: "能在设备上算的就不上传：健康、录音、扫描、文档默认只留在本机。确实需要服务端的产品，会把存了什么、存在哪里、怎么删除写进隐私政策。",
        en: "If it can be computed on the device, it is not uploaded: health, recordings, scans and documents stay local. Where a server is genuinely needed, the privacy policy says what is stored, where, and how to delete it.",
      },
    },
    {
      t: { zh: "工程与质量", en: "Engineering and quality" },
      s: { zh: "Unit tests · Type checks · Self-check scripts", en: "Unit tests · Type checks · Self-check scripts" },
      d: {
        zh: "核心逻辑有单元测试，关键流程有端到端自检，类型检查是构建的一部分。每个产品都能被重新构建、重新测试，而不是只在某台机器上能跑。",
        en: "Core logic has unit tests, key flows have end-to-end self-checks, and type checking is part of the build. Every product can be rebuilt and retested — it does not only run on one machine.",
      },
    },
  ];

  const body = `
<section class="hero">
  <div class="wrap hero-grid">
    <div>
      ${eyebrow(c.heroEyebrow)}
      <h1>${esc(c.heroTitleA)}<br><em>${esc(c.heroTitleB)}</em></h1>
      <p class="lede">${esc(c.heroLede)}</p>
      <div class="actions">
        <a class="btn" href="${href(from, P.products[lang])}">${esc(c.heroCta1)}<span class="arrow">→</span></a>
        <a class="btn btn--ghost" href="${href(from, P.about[lang])}">${esc(c.heroCta2)}</a>
      </div>
    </div>
    <aside class="record" aria-label="${esc(c.factsTitle)}">
      <h2><span>${esc(c.factsTitle)}</span><span>CN-GZ-01</span></h2>
      <dl>
        <div class="row"><dt>${esc(c.fact1)}</dt><dd>${esc(
    lang === "zh" ? company.legalNameZh : company.legalNameEn
  )}<span class="sub">${esc(lang === "zh" ? company.legalNameEn : company.legalNameZh)}</span></dd></div>
        <div class="row"><dt>${esc(c.fact2)}</dt><dd>${esc(
    lang === "zh" ? company.cityZh : company.cityEn
  )}<span class="sub">${esc(lang === "zh" ? company.addressShortZh : company.addressShortEn)}</span></dd></div>
        <div class="row"><dt>${esc(c.fact3)}</dt><dd>${esc(c.heroNote)}</dd></div>
        <div class="row"><dt>${esc(c.fact4)}</dt><dd><a href="mailto:${company.email}">${company.email}</a></dd></div>
      </dl>
    </aside>
  </div>
</section>

<section aria-label="${esc(u.shotsLabel)}">
  <div class="strip">
      ${strip}
  </div>
</section>

<section class="band" id="products">
  <div class="wrap">
    <div class="sec-head reveal">
      <div>
        ${eyebrow(c.s1Eyebrow)}
        <h2>${esc(c.s1Title)}</h2>
      </div>
      <p class="note note--right">${esc(c.s1Note)}</p>
    </div>
    <ul class="index-list">
      ${products
        .map(
          (p, i) => `<li class="index-row reveal"><a href="${href(from, productPath(lang, p.slug))}">
        <span class="num">${String(i + 1).padStart(2, "0")}</span>
        <h3>${esc(p.name[lang])}<span>${esc(p.latin)} — ${esc(p.category[lang])}</span></h3>
        <p class="desc">${esc(p.tagline[lang])}</p>
        <span class="go">${esc(u.viewDetail)} <span aria-hidden="true">→</span></span>
      </a></li>`
        )
        .join("\n      ")}
    </ul>
    <div class="inprogress reveal">
      <span class="tag">${esc(u.inProgress)}</span>
      <p>${inProgress[lang]
        .map((x) => `<b>${esc(x.name)}</b> <i>${esc(x.desc)}</i>`)
        .join(" · ")}</p>
    </div>
  </div>
</section>

<section class="band" id="capabilities">
  <div class="wrap">
    <div class="sec-head reveal">
      <div>
        ${eyebrow(c.s2Eyebrow)}
        <h2>${esc(c.s2Title)}</h2>
      </div>
      <p class="note note--right">${esc(c.s2Note)}</p>
    </div>
    <ul class="caps">
      ${caps
        .map(
          (cap, i) => `<li class="cap reveal">
        <span class="num">${String(i + 1).padStart(2, "0")}</span>
        <h3>${esc(cap.t[lang])}<small>${esc(cap.s[lang])}</small></h3>
        <p>${esc(cap.d[lang])}</p>
      </li>`
        )
        .join("\n      ")}
    </ul>
  </div>
</section>

<section class="band" id="company">
  <div class="wrap split">
    <div class="reveal">
      ${eyebrow(c.s3Eyebrow)}
      <h2 class="split-title">${esc(c.s3Title)}</h2>
      <p class="quote">${esc(c.aboutLead)}<small>${esc(
    lang === "zh" ? "我们的工作信条" : "How we work"
  )}</small></p>
    </div>
    <div class="prose reveal">
      <p>${esc(c.s3Body1)}</p>
      <p>${esc(c.s3Body2)}</p>
      <p><a class="link" href="${href(from, P.about[lang])}">${esc(c.s3Link)} →</a></p>
    </div>
  </div>
</section>

${contactBand(lang)}`;

  return shell({
    lang,
    pageKey: "home",
    currentPath: from,
    title: `${company.brandZh} · ${lang === "zh" ? "自研软件产品" : "Software products"}`,
    desc: c.homeDesc,
    body,
  });
}

function productsPage(lang) {
  const c = copy[lang];
  const from = P.products[lang];
  const body = `
<section class="page-head">
  <div class="wrap">
    <nav class="crumbs" aria-label="${esc(ui[lang].breadcrumb)}">
      <a href="${href(from, P.home[lang])}">${esc(ui[lang].home)}</a><span class="sep">/</span><span>${esc(
    ui[lang].products
  )}</span>
    </nav>
    ${eyebrow(String(products.length).padStart(2, "0") + " — " + ui[lang].productList)}
    <h1>${esc(c.productsTitle)}</h1>
    <p class="lede">${esc(c.productsIntro)}</p>
  </div>
</section>

<section class="band band--tight" style="border-top:0">
  <div class="wrap">
    <div class="grid">
      ${products.map((p, i) => productCard(lang, from, p, i)).join("\n      ")}
    </div>
    <div class="inprogress reveal">
      <span class="tag">${esc(ui[lang].inProgress)}</span>
      <p>${inProgress[lang].map((x) => `<b>${esc(x.name)}</b> <i>${esc(x.desc)}</i>`).join(" · ")}</p>
    </div>
  </div>
</section>

${contactBand(lang, { compact: true })}`;

  return shell({
    lang,
    pageKey: "products",
    currentPath: from,
    title: `${c.productsTitle} · ${company.brandZh}`,
    desc: c.productsDesc,
    body,
  });
}

function productPage(lang, p) {
  const from = productPath(lang, p.slug);
  const u = ui[lang];
  const idx = products.findIndex((x) => x.slug === p.slug);
  const prev = products[(idx - 1 + products.length) % products.length];
  const next = products[(idx + 1) % products.length];
  const isPhone = p.shape === "phone";

  const shot = (s) =>
    `<figure class="shot" style="margin:0"><img src="${asset(from, `img/${s.file}`)}" width="${s.w}" height="${
      s.h
    }" alt="${esc(s.alt[lang])}" loading="lazy" decoding="async"></figure>`;

  // 宽幅产品可能夹一张竖屏图（手机端截图）：竖图单独一行居中，避免被拉满整栏。
  const wideShots = p.shots.filter((s) => s.w >= s.h);
  const tallShots = p.shots.filter((s) => s.w < s.h);

  const gallery = isPhone
    ? `<div class="gallery-row gallery-row--phone">${p.shots.map(shot).join("")}</div>`
    : `<div class="gallery-row gallery-row--wide">${wideShots.map(shot).join("")}</div>${
        tallShots.length
          ? `<div class="gallery-row gallery-row--tall">${tallShots.map(shot).join("")}</div>`
          : ""
      }`;

  const body = `
<section class="page-head" style="padding-bottom:0">
  <div class="wrap">
    <nav class="crumbs" aria-label="${esc(u.breadcrumb)}">
      <a href="${href(from, P.home[lang])}">${esc(u.home)}</a><span class="sep">/</span>
      <a href="${href(from, P.products[lang])}">${esc(u.products)}</a><span class="sep">/</span>
      <span>${esc(p.name[lang])}</span>
    </nav>
    <div class="product-head">
      <div>
        ${eyebrow(String(idx + 1).padStart(2, "0") + " — " + p.latin)}
        <h1>${esc(p.name[lang])}</h1>
        <p class="tagline">${esc(p.tagline[lang])}</p>
      </div>
      <dl class="spec">
        <div class="row"><dt>${esc(u.categoryLabel)}</dt><dd>${esc(p.category[lang])}</dd></div>
        <div class="row"><dt>${esc(u.platformsLabel)}</dt><dd>${esc(p.platforms[lang])}</dd></div>
        <div class="row"><dt>${esc(u.modelLabel)}</dt><dd>${esc(u.modelSelf)}</dd></div>
        <div class="row"><dt>${esc(u.statusLabel)}</dt><dd>${esc(u.statusLive)}</dd></div>
      </dl>
    </div>
  </div>
</section>

<section class="gallery" aria-label="${esc(u.shotsLabel)}">
  <div class="wrap wrap--wide">
    ${gallery}
    <p class="gallery-note">${esc(p.latin)} — ${esc(u.shotsLabel)}</p>
  </div>
</section>

<section class="band band--tight">
  <div class="wrap split">
    <div class="reveal">
      ${eyebrow(`02 — ${u.featuresEyebrow}`)}
      <h2 class="split-title">${esc(u.featuresLabel)}</h2>
      <p class="lede" style="font-size:14.5px">${esc(p.summary[lang])}</p>
    </div>
    <div class="features reveal" style="border-top:0">
      ${p.features
        .map(
          (f) => `<div class="feature">
        <h3>${esc(f.t[lang])}</h3>
        <p>${esc(f.d[lang])}</p>
      </div>`
        )
        .join("\n      ")}
    </div>
  </div>
</section>

<section class="band band--tight" style="border-top:0;padding-top:0">
  <div class="wrap">
    <div class="callout reveal">
      <span class="k">${esc(u.dataLabel)}</span>
      <p>${esc(p.dataNote[lang])} <a href="${href(from, P.privacy[lang])}" style="border-bottom:1px solid var(--line)">${esc(
    u.privacy
  )} →</a></p>
    </div>

    <nav class="pager" aria-label="pagination">
      <a href="${href(from, productPath(lang, prev.slug))}"><span class="k">← ${esc(u.prev)}</span><span class="t">${esc(
    prev.name[lang]
  )}</span></a>
      <a href="${href(from, productPath(lang, next.slug))}"><span class="k">${esc(u.next)} →</span><span class="t">${esc(
    next.name[lang]
  )}</span></a>
    </nav>
  </div>
</section>

${contactBand(lang, { compact: true })}`;

  return shell({
    lang,
    pageKey: "product",
    slug: p.slug,
    currentPath: from,
    title: `${p.name[lang]} · ${company.brandZh}`,
    desc: `${p.tagline[lang]} ${p.platforms[lang]}`,
    body,
  });
}

function aboutPage(lang) {
  const c = copy[lang];
  const u = ui[lang];
  const from = P.about[lang];

  const values = c.values
    .map(
      (v, i) => `<div class="value">
      <span class="num">${String(i + 1).padStart(2, "0")}</span>
      <div><h3>${esc(v.t)}</h3><p>${esc(v.d)}</p></div>
    </div>`
    )
    .join("\n    ");

  const rows = [
    [u.legalName, lang === "zh" ? company.legalNameZh : company.legalNameEn],
    [u.legalNameEn, lang === "zh" ? company.legalNameEn : company.legalNameZh],
    [u.addressLabel, lang === "zh" ? company.addressZh : company.addressEn],
    ...(company.founded
      ? [[u.foundedLabel, lang === "zh" ? `${company.founded} 年` : company.founded]]
      : []),
    ...(company.phone
      ? [[u.phoneLabel, `<a href="tel:${company.phone.replace(/[^+\d]/g, "")}">${esc(company.phone)}</a>`]]
      : []),
    [u.emailLabel, `<a href="mailto:${company.email}">${company.email}</a>`],
    [u.websiteLabel, `<a href="${company.url}">${company.domain}</a>`],
    [u.businessLabel, lang === "zh" ? company.businessZh : company.businessEn],
  ]
    .map(([k, v]) => `<div class="row"><dt>${esc(k)}</dt><dd>${v}</dd></div>`)
    .join("\n      ");

  const body = `
<section class="page-head">
  <div class="wrap">
    <nav class="crumbs" aria-label="${esc(u.breadcrumb)}">
      <a href="${href(from, P.home[lang])}">${esc(u.home)}</a><span class="sep">/</span><span>${esc(u.about)}</span>
    </nav>
    ${eyebrow(lang === "zh" ? "03 — 公司" : "03 — Company")}
    <h1>${esc(c.aboutTitle)}</h1>
  </div>
</section>

<section class="wrap" style="padding-bottom:clamp(28px,4vw,48px)">
  <p class="about-lead reveal">${esc(c.aboutLead)}</p>
  <div class="split">
    <div class="prose reveal">
      <p>${esc(c.aboutP1)}</p>
      <p>${esc(c.aboutP2)}</p>
    </div>
    <div class="prose reveal">
      <p>${esc(c.aboutP3)}</p>
      <p>${esc(c.aboutP4)}</p>
      <p>${esc(c.aboutP5)}</p>
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="sec-head reveal">
      <div>${eyebrow(lang === "zh" ? "工作方式" : "Method")}<h2>${esc(c.valuesTitle)}</h2></div>
      <p class="note note--right">${esc(
        lang === "zh"
          ? "四条习惯，覆盖从方向判断到上线之后的每一次改动。"
          : "Four habits, from choosing a direction to every change after launch."
      )}</p>
    </div>
    <div class="values reveal">
    ${values}
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap split">
    <div class="reveal">
      ${eyebrow(lang === "zh" ? "档案" : "Record")}
      <h2 class="split-title">${esc(c.recordTitle)}</h2>
      <p class="note" style="max-width:30em">${esc(c.recordNote)}</p>
      <div class="seal" aria-hidden="true">${lang === "zh" ? "云枢" : "YS"}</div>
    </div>
    <div class="reveal">
      <dl class="dl-table">
      ${rows}
      </dl>
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap split">
    <div class="reveal">
      ${eyebrow(lang === "zh" ? "边界" : "Boundaries")}
      <h2 class="split-title">${esc(c.noDoTitle)}</h2>
    </div>
    <ul class="nodo reveal">
      ${c.noDo.map((x) => `<li>${esc(x)}</li>`).join("\n      ")}
    </ul>
  </div>
</section>

${contactBand(lang, { compact: true })}`;

  return shell({
    lang,
    pageKey: "about",
    currentPath: from,
    title: `${c.aboutTitle} · ${company.brandZh}`,
    desc: c.aboutDesc,
    body,
  });
}

function supportPage(lang) {
  const c = copy[lang];
  const u = ui[lang];
  const from = P.support[lang];

  const body = `
<section class="page-head">
  <div class="wrap">
    <nav class="crumbs" aria-label="${esc(u.breadcrumb)}">
      <a href="${href(from, P.home[lang])}">${esc(u.home)}</a><span class="sep">/</span><span>${esc(u.support)}</span>
    </nav>
    ${eyebrow("05 — " + u.support)}
    <h1>${esc(c.supportTitle)}</h1>
    <p class="lede">${esc(c.supportLead)}</p>
  </div>
</section>

<section class="band band--tight" style="border-top:0">
  <div class="wrap">
    <div class="faq">
      ${c.faq
        .map(
          (item, i) => `<details${i === 0 ? " open" : ""}>
        <summary>${esc(item.q)}</summary>
        <div class="a"><p>${item.a}</p></div>
      </details>`
        )
        .join("\n      ")}
    </div>
  </div>
</section>

<section class="band band--tight" style="border-top:0">
  <div class="wrap split">
    <div class="reveal">
      ${eyebrow(lang === "zh" ? "产品支持" : "Per product")}
      <h2 class="split-title">${esc(u.productSupport)}</h2>
      <p class="note" style="max-width:30em">${esc(
        lang === "zh"
          ? "每款产品的数据与隐私说明写在产品页；账号与数据删除请用注册邮箱联系。"
          : "Each product page states what it stores and where. For account and data deletion, write from your registered address."
      )}</p>
    </div>
    <dl class="dl-table reveal">
      ${products
        .map(
          (p) =>
            `<div class="row"><dt>${esc(p.latin)}</dt><dd><a href="${href(from, productPath(lang, p.slug))}">${
              p.name[lang]
            }</a> · ${esc(p.platforms[lang])}</dd></div>`
        )
        .join("\n      ")}
    </dl>
  </div>
</section>

${contactBand(lang, { compact: true, title: c.contactFaqTitle, body: c.supportLead })}`;

  return shell({
    lang,
    pageKey: "support",
    currentPath: from,
    title: `${c.supportTitle} · ${company.brandZh}`,
    desc: c.supportDesc,
    body,
  });
}

function legalPage(lang, kind) {
  const doc = kind === "privacy" ? privacy[lang] : terms[lang];
  const c = copy[lang];
  const u = ui[lang];
  const from = kind === "privacy" ? P.privacy[lang] : P.terms[lang];
  const title = kind === "privacy" ? c.privacyTitle : c.termsTitle;

  const toc = doc.sections
    .map((s, i) => `<li><a href="#s${i + 1}">${esc(s.h.replace(/^\d+\.\s*/, ""))}</a></li>`)
    .join("\n      ");

  const sections = doc.sections
    .map(
      (s, i) => `<section id="s${i + 1}">
      <h2>${esc(s.h)}</h2>
      ${s.p.map((p) => `<p>${p}</p>`).join("\n      ")}
    </section>`
    )
    .join("\n    ");

  const body = `
<section class="page-head">
  <div class="wrap">
    <nav class="crumbs" aria-label="${esc(u.breadcrumb)}">
      <a href="${href(from, P.home[lang])}">${esc(u.home)}</a><span class="sep">/</span><span>${esc(title)}</span>
    </nav>
    ${eyebrow(u.legal)}
    <h1>${esc(title)}</h1>
    <div class="doc-meta" style="padding-top:18px">
      <span>${esc(u.legalName)}：${esc(lang === "zh" ? company.legalNameZh : company.legalNameEn)}</span>
      <span>${esc(u.lastUpdated)}：${esc(LEGAL_DATE[lang])}</span>
    </div>
  </div>
</section>

<section class="band band--tight" style="border-top:0">
  <div class="wrap legal">
    <nav class="toc" aria-label="${esc(u.toc)}">
      <h3>${esc(u.toc)}</h3>
      <ol>
      ${toc}
      </ol>
    </nav>
    <div class="doc">
      <div class="doc-intro">${doc.intro.map((p) => `<p>${p}</p>`).join("")}</div>
      ${sections}
    </div>
  </div>
</section>`;

  return shell({
    lang,
    pageKey: kind,
    currentPath: from,
    title: `${title} · ${company.brandZh}`,
    desc: kind === "privacy" ? c.privacyDesc : c.termsDesc,
    body,
  });
}

function notFoundPage(lang) {
  const c = copy[lang];
  const from = P.notfound[lang];
  const body = `
<section class="wrap nf">
  <p class="code">ERROR 404</p>
  <h1>${esc(c.notFoundTitle)}</h1>
  <p>${esc(c.notFoundBody)}</p>
  <div class="actions" style="justify-content:center">
    <a class="btn" href="${href(from, P.home[lang])}">${esc(ui[lang].backHome)}<span class="arrow">→</span></a>
    <a class="btn btn--ghost" href="${href(from, P.products[lang])}">${esc(ui[lang].allProducts)}</a>
  </div>
</section>`;
  return shell({
    lang,
    pageKey: "notfound",
    currentPath: from,
    title: `${c.notFoundTitle} · ${company.brandZh}`,
    desc: c.notFoundBody,
    body,
  });
}

/* 暂停页：整站暂停时 nginx 用它当 503 的 body。
   刻意不引用 assets/ 里任何东西（暂停期间静态资源同样 503），样式全部内联。 */
function maintenancePage() {
  return `<!doctype html>
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(company.brandZh)} · 站点维护中</title>
<style>
  :root { color-scheme: light }
  * { box-sizing: border-box }
  html, body { height: 100% }
  body {
    margin: 0;
    display: grid;
    place-items: center;
    padding: 32px 22px;
    background: #f4f1e9;
    color: #16181b;
    font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB",
      "Microsoft YaHei", "Noto Sans SC", sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .box { width: 100%; max-width: 560px }
  .mark { width: 38px; height: 38px; color: #16181b; margin-bottom: 30px }
  .code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px; letter-spacing: .16em; text-transform: uppercase;
    color: #b0392a; margin: 0 0 14px;
  }
  h1 {
    font-family: "Songti SC", "Source Han Serif SC", "Noto Serif SC", serif;
    font-size: clamp(30px, 6vw, 42px);
    font-weight: 600; line-height: 1.24; letter-spacing: .01em;
    margin: 0 0 18px;
  }
  h1 em { font-style: normal; color: #b0392a }
  p { margin: 0 0 12px; font-size: 15px; line-height: 1.8; color: #4b4d52; max-width: 46ch }
  .en { font-size: 13px; color: #6f6d64; line-height: 1.75 }
  hr { border: 0; border-top: 1px solid rgba(22,24,27,.14); margin: 30px 0 22px }
  a { color: #16181b; text-decoration: none; border-bottom: 1px solid rgba(22,24,27,.32) }
  a:hover { color: #b0392a; border-bottom-color: #b0392a }
  .foot {
    margin-top: 34px; display: flex; flex-wrap: wrap; gap: 8px 18px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px; letter-spacing: .04em; color: #6f6d64;
  }
</style>
</head>
<body>
  <div class="box">
    ${MARK("mark")}
    <p class="code">HTTP 503 · Maintenance</p>
    <h1>站点正在维护<em>，</em><br>请稍后再访问。</h1>
    <p>${esc(company.brandZh)}的网站正在进行例行维护，预计很快恢复。给你带来不便，抱歉。</p>
    <p class="en">This site is temporarily down for maintenance. Please check back shortly.</p>
    <hr>
    <p class="en">需要联系我们：<a href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
    <div class="foot">
      <span>${esc(company.legalNameZh)}</span>
      <span>${esc(company.legalNameEn)}</span>
    </div>
  </div>
</body>
</html>
`;
}

/* ---------------- output ---------------- */

async function write(relPath, content) {
  const abs = path.join(OUT, relPath);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, content, "utf8");
  return relPath;
}

/* Cloudflare Pages 读取的响应头。规则按前缀匹配，后面的覆盖前面的。 */
const headersFile = `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()

/assets/*
  Cache-Control: public, max-age=604800

/assets/img/*
  Cache-Control: public, max-age=31536000, immutable
`;

async function main() {
  const written = [];

  // 每次构建前清空 dist/，避免删掉的产品页残留。assets/ 是源文件，整份拷进去。
  await fs.rm(OUT, { recursive: true, force: true });
  await fs.mkdir(OUT, { recursive: true });
  await fs.cp(path.join(ROOT, "assets"), path.join(OUT, "assets"), { recursive: true });

  for (const lang of LANGS) {
    written.push(await write(P.home[lang], homePage(lang)));
    written.push(await write(P.products[lang], productsPage(lang)));
    for (const p of products) written.push(await write(productPath(lang, p.slug), productPage(lang, p)));
    written.push(await write(P.about[lang], aboutPage(lang)));
    written.push(await write(P.support[lang], supportPage(lang)));
    written.push(await write(P.privacy[lang], legalPage(lang, "privacy")));
    written.push(await write(P.terms[lang], legalPage(lang, "terms")));
    written.push(await write(P.notfound[lang], notFoundPage(lang)));
  }

  /* sitemap: zh 页面 + en 页面 + hreflang 交替标注 */
  const urls = [];
  for (const lang of LANGS) {
    const list = [
      P.home[lang],
      P.products[lang],
      ...products.map((p) => productPath(lang, p.slug)),
      P.about[lang],
      P.support[lang],
      P.privacy[lang],
      P.terms[lang],
    ];
    for (const p of list) {
      const isIndex = p.endsWith("index.html");
      const loc = canonical(p);
      const prio = p === P.home[lang] ? "1.0" : p.includes("products/") ? "0.7" : p === P.privacy[lang] || p === P.terms[lang] ? "0.4" : "0.8";
      urls.push(
        `  <url>\n    <loc>${loc}</loc>\n    <lastmod>2026-11-20</lastmod>\n    <changefreq>${
          isIndex ? "weekly" : "monthly"
        }</changefreq>\n    <priority>${prio}</priority>\n  </url>`
      );
    }
  }
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
  written.push(await write("maintenance.html", maintenancePage()));
  written.push(await write("sitemap.xml", sitemap));
  written.push(await write("_headers", headersFile));

  const robots = `User-agent: *
Allow: /

Sitemap: ${company.url}/sitemap.xml
`;
  written.push(await write("robots.txt", robots));

  console.log(`构建完成：${written.length} 个页面/文件 → dist/`);
  console.log(written.join("\n"));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
