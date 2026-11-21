/**
 * Cloudflare Worker 入口。
 *
 * 只有一件事：把 www.<域名> 永久收口到裸域，避免同一份内容有两个地址。
 * 其余请求原样交给静态资源（dist/），所以这个文件不参与页面生成，也不读 content/。
 *
 * 约束：
 *   - APEX 必须与 content/site.mjs 的 company.domain 一致（换域名时两处一起改）。
 *   - wrangler.jsonc 里必须开 assets.run_worker_first，否则静态资源会先于本脚本命中，
 *     www 的 301 永远不执行。
 *   - Cloudflare 的 _redirects 只接受相对路径（"Only relative URLs are allowed"），
 *     所以跨主机的收口只能放在这里，不能写成 `https://www.../*`。
 */
const APEX = "yunshufz.top";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === `www.${APEX}`) {
      url.hostname = APEX;
      url.protocol = "https:";
      url.port = "";
      return Response.redirect(url.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
};
