/**
 * Cloudflare Pages middleware — link previews (Zalo / Messenger / Facebook) per domain.
 *
 * Link-preview bots read the raw HTML and do not run JavaScript, so the static <head> in index.html
 * always says "Hưng & Tuyết". For the bride's domain this rewrites the title, description and
 * og:/twitter: tags (bride's name first, bride-side image) and points og:url/og:image at the
 * requesting domain. Only runs on Cloudflare Pages; GitHub Pages ignores this folder.
 *
 * Keep the domain list in sync with `domains` in js/config.js.
 */
const SITES = {
  "tuyethung.thiepcuoi.date": {
    names: "Tuyết & Hưng",
    image: "assets/og-image-gai.jpg",
    alt: "Thiệp cưới Tuyết & Hưng — 16.11.2026",
  },
  "hungtuyet.thiepcuoi.date": {
    names: "Hưng & Tuyết",
    image: "assets/og-image.jpg",
    alt: "Thiệp cưới Hưng & Tuyết — 16.11.2026",
  },
};

const setAttr = (value) => ({ element(el) { el.setAttribute("content", value); } });

export async function onRequest({ request, next }) {
  const res = await next();
  const type = res.headers.get("content-type") || "";
  if (!type.includes("text/html")) return res;

  const url = new URL(request.url);
  const site = SITES[url.hostname.toLowerCase()];
  const origin = `${url.protocol}//${url.host}/`;
  const image = origin + (site ? site.image : "assets/og-image.jpg");

  let rw = new HTMLRewriter()
    .on('meta[property="og:url"]', setAttr(origin))
    .on('meta[property="og:image"]', setAttr(image))
    .on('meta[name="twitter:image"]', setAttr(image));

  if (site) {
    rw = rw
      .on("title", { element(el) { el.setInnerContent(`${site.names} — Thiệp cưới`); } })
      .on('meta[name="description"]', setAttr(`Trân trọng kính mời bạn đến dự lễ cưới của ${site.names}.`))
      .on('meta[property="og:title"]', setAttr(`${site.names} — Chúng mình cưới!`))
      .on('meta[property="og:image:alt"]', setAttr(site.alt))
      .on('meta[name="apple-mobile-web-app-title"]', setAttr(site.names));
  }
  return rw.transform(res);
}
