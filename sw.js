/* =========================================================================
 *  Service worker — mở thiệp một lần là lưu lại, đến nơi mất sóng vẫn xem được
 *  - Cùng trang (html, css, js, ảnh): ưu tiên mạng để luôn có bản mới; mạng chậm
 *    quá 4 giây hoặc mất mạng thì dùng bản đã lưu.
 *  - Font Google, GSAP (link cố định phiên bản): dùng bản đã lưu, không có mới tải.
 *  - Nhạc: không lưu (file lớn, trình duyệt tải từng đoạn).
 * ========================================================================= */
const CACHE = "thiep-v3";
const CORE = [
  "./", "index.html", "css/style.css", "js/config.js", "js/main.js",
  "manifest.webmanifest", "assets/icon-192.png", "assets/icon-512.png", "photos/cover.webp",
];
const NET_TIMEOUT = 4000;

const skip = (req) =>
  req.method !== "GET" ||
  req.headers.has("range") ||
  req.destination === "audio" || req.destination === "video" ||
  /\.(mp3|m4a|ogg|wav|mp4)(\?|$)/i.test(new URL(req.url).pathname) ||
  !req.url.startsWith("http");

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(CORE.map((u) => c.add(u)))) // thiếu file nào cũng không sao
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/** Tải một địa chỉ về bộ nhớ (bỏ qua nếu đã có). Trả về response nếu vừa tải. */
async function store(c, u) {
  if (!/^https?:/.test(u) || /\.(mp3|m4a|ogg|wav|mp4)(\?|$)/i.test(u) || (await c.match(u))) return null;
  const sameOrigin = new URL(u).origin === location.origin;
  const res = await fetch(u, sameOrigin ? {} : { mode: "cors", credentials: "omit" }).catch(() => fetch(u, { mode: "no-cors" }));
  if (!res || !(res.ok || res.type === "opaque")) return null;
  await c.put(u, res.clone());
  return res;
}

/** File CSS của Google Fonts chỉ trỏ tới file font — đọc ra và lưu luôn các file font cần cho tiếng Việt */
async function storeFontFiles(c, cssRes) {
  if (!cssRes || cssRes.type === "opaque") return;
  const css = await cssRes.text();
  const files = [];
  for (const [, label, block] of css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*{([^}]*)}/g)) {
    if (!/^(vietnamese|latin|latin-ext)$/.test(label)) continue; // bỏ chữ Kirin, Hy Lạp...
    const m = block.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
    if (m) files.push(m[1]);
  }
  await Promise.allSettled(files.map((u) => store(c, u)));
}

// trang gửi danh sách những gì đã tải ở lần mở đầu tiên (lúc đó service worker chưa kịp bắt)
self.addEventListener("message", (e) => {
  if (e.data?.type !== "cache" || !Array.isArray(e.data.urls)) return;
  e.waitUntil(caches.open(CACHE).then((c) => Promise.allSettled(
    e.data.urls.map(async (u) => {
      const res = await store(c, u);
      if (u.startsWith("https://fonts.googleapis.com/")) await storeFontFiles(c, res || (await c.match(u)));
    })
  )));
});

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  const net = fetch(req).then((res) => {
    if (res.ok) cache.put(req, res.clone());
    return res;
  });
  net.catch(() => {}); // lỗi mạng khi đã trả bản lưu thì bỏ qua
  const fromCache = () => cache.match(req, { ignoreSearch: req.mode === "navigate" }); // link có ?ten=... vẫn dùng chung bản lưu
  try {
    return await Promise.race([net, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), NET_TIMEOUT))]);
  } catch {
    return (await fromCache()) || net; // chưa có bản lưu thì chờ mạng tiếp
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === "opaque") cache.put(req, res.clone());
  return res;
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (skip(req)) return;
  e.respondWith(new URL(req.url).origin === location.origin ? networkFirst(req) : cacheFirst(req));
});
