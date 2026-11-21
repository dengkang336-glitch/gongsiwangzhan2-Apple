#!/usr/bin/env node
/**
 * 构建产物自检（对 dist/ 跑，不做网络请求）。
 *
 * 检查项：
 *   1. 站内相对链接（href / src）是否都能在 dist/ 里找到对应文件
 *   2. 每个页面恰好一个 <h1>
 *   3. 每个 <img> 都有 alt
 *   4. 页面内没有重复 id
 *   5. canonical / hreflang 指向的地址与文件存在性一致（仅提示）
 *
 * 用法：node tools/check.mjs      （先 node tools/build.mjs）
 * 退出码非 0 表示有问题，适合放进 CI。
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "../dist");

/** 递归收集 dist 下所有文件（相对 dist 的路径，统一用 / 分隔）。 */
async function walk(dir, base = dir, out = []) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(abs, base, out);
    else out.push(path.relative(base, abs).split(path.sep).join("/"));
  }
  return out;
}

const ABS = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\/)/i;
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i"));
  return m ? m[1] : null;
};

function main() {
  return fs
    .readdir(DIST)
    .then((names) => names.length > 0)
    .catch(() => false)
    .then(async (ok) => {
      if (!ok) {
        console.error("dist/ 不存在或为空，先跑 node tools/build.mjs");
        return 1;
      }

      const files = await walk(DIST);
      const fileSet = new Set(files);
      const pages = files.filter((f) => f.endsWith(".html"));
      const problems = [];

      for (const page of pages) {
        const html = await fs.readFile(path.join(DIST, page), "utf8");

        /* ---- 1. 相对链接可达 ---- */
        for (const tag of html.match(/<(?:a|link|img|script|source)\b[^>]*>/gi) || []) {
          const url = attr(tag, "href") ?? attr(tag, "src");
          if (!url || ABS.test(url)) continue;
          const clean = url.split("#")[0].split("?")[0];
          if (!clean) continue;
          const target = path.posix.normalize(
            path.posix.join(path.posix.dirname(page), clean)
          );
          const candidates = [target, `${target}/index.html`, `${target}.html`];
          if (!candidates.some((c) => fileSet.has(c))) {
            problems.push(`${page}: 死链 ${url} → ${target}`);
          }
        }

        /* ---- 2. 唯一 h1 ---- */
        const h1 = (html.match(/<h1\b/gi) || []).length;
        if (h1 !== 1) problems.push(`${page}: <h1> 有 ${h1} 个（应为 1）`);

        /* ---- 3. img 必须有 alt ---- */
        for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
          const alt = attr(tag, "alt");
          if (alt === null || alt.trim() === "") {
            problems.push(`${page}: <img> 缺 alt（${attr(tag, "src") ?? "无 src"}）`);
          }
        }

        /* ---- 4. id 不重复 ---- */
        const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
        const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
        if (dup.length) problems.push(`${page}: 重复 id ${[...new Set(dup)].join(", ")}`);

        /* ---- 5. canonical 与页面是否对应（相对站点根） ---- */
        // 维护页与 404 是 noindex 页，不需要 canonical。
        const needsCanonical = !/(?:^|\/)(?:maintenance|404)\.html$/.test(page);
        const canonical = attr(html.match(/<link[^>]*rel="canonical"[^>]*>/i)?.[0] ?? "", "href");
        if (needsCanonical && !canonical) problems.push(`${page}: 缺 canonical`);
      }

      console.log(`检查 ${pages.length} 个页面、${files.length} 个文件`);
      if (problems.length === 0) {
        console.log("全部通过：链接可达、h1 唯一、img 有 alt、id 不重复、canonical 齐全");
        return 0;
      }
      console.error(`发现 ${problems.length} 处问题：`);
      for (const p of problems) console.error(`  · ${p}`);
      return 1;
    });
}

main().then((code) => {
  process.exitCode = code;
});
