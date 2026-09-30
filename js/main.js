(function () {
  "use strict";

  const C = window.WEDDING || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const PHOTO_DIR = "photos/";
  const TZ = "+07:00";
  const WEEKDAYS = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const motion = !!(window.gsap && window.ScrollTrigger) && !reduceMotion;
  if (motion) document.documentElement.classList.add("motion");

  const pad = (n) => String(n).padStart(2, "0");
  const get = (obj, path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (id, cls = "") => `<svg class="${cls}"><use href="#${id}"/></svg>`;

  /** "2026-12-20T11:00" -> các thành phần (luôn theo giờ Việt Nam, không phụ thuộc máy người xem) */
  function parseDT(str, time) {
    const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(str || "");
    if (!m) return null;
    let [, y, mo, d, h = "00", mi = "00"] = m;
    if (time && /^\d{1,2}:\d{2}$/.test(time)) [h, mi] = time.split(":");
    const r = { y: +y, m: +mo, d: +d, h: +h, mi: +mi };
    r.instant = new Date(`${y}-${mo}-${d}T${pad(r.h)}:${pad(r.mi)}:00${TZ}`);
    r.weekday = new Date(Date.UTC(r.y, r.m - 1, r.d)).getUTCDay();
    return r;
  }
  const W = parseDT(C.date);
  const G = (get(C, "groom.name") || "").normalize("NFC");
  const B = (get(C, "bride.name") || "").normalize("NFC");
  const params = new URLSearchParams(location.search);
  // Tên khách mời: ?ten=Anh%20Nam (hoặc ?to= / ?khach=). Không có thì xưng "bạn".
  const GUEST = (params.get("ten") || params.get("to") || params.get("khach") || "").trim().slice(0, 60);

  /* ------------------------------------------------------------------ text */
  function bindTexts() {
    $$("[data-bind]").forEach((el) => {
      const v = get(C, el.dataset.bind);
      if (v) el.textContent = v;
      else if (!el.textContent.trim()) el.hidden = true;
    });
    $$("[data-mono]").forEach((el) => (el.textContent = `${G.charAt(0)} & ${B.charAt(0)}`));
    $$('[data-initial="groom"]').forEach((el) => (el.textContent = G.charAt(0)));
    $$('[data-initial="bride"]').forEach((el) => (el.textContent = B.charAt(0)));
    if (G && B) document.title = `${G} & ${B} — Thiệp cưới`;

    if (W) {
      const set = (sel, text) => $$(sel).forEach((el) => (el.textContent = text));
      set("[data-date-dots]", `${pad(W.d)}.${pad(W.m)}.${W.y}`);
      set("[data-date-dash]", `${pad(W.d)} - ${pad(W.m)} - ${W.y}`);
      set("[data-stk-date]", `${pad(W.d)}.${pad(W.m)}.${String(W.y).slice(2)}`);
      set("[data-d]", pad(W.d));
      set("[data-m]", pad(W.m));
      set("[data-y]", W.y);
      set("[data-weekday-time]", `${WEEKDAYS[W.weekday]}\u00a0· ${pad(W.h)}:${pad(W.mi)}`); // không để dấu "·" rơi xuống đầu dòng
    }

    $("#leader-guest").innerHTML = GUEST
      ? `Trân trọng kính mời<b>${esc(GUEST)}</b>`
      : `Trân trọng kính mời bạn đến dự lễ cưới<b>${esc(G)} &amp; ${esc(B)}</b>`;
  }

  /** Tiêu đề mở đầu: HƯNG / & / TUYẾT (ảnh cưới hiện qua lòng chữ) */
  function buildHeroTitle() {
    const h1 = $("#hero-title");
    h1.setAttribute("aria-label", `${G} & ${B}`);
    h1.innerHTML = `<span aria-hidden="true">${esc(G)}</span><span class="amp" aria-hidden="true">&amp;</span><span aria-hidden="true">${esc(B)}</span>`;
  }

  /** Tách lời ngỏ thành từng chữ để hiện rõ dần khi cuộn */
  function splitLogline() {
    const p = $("#logline");
    const words = p.textContent.trim().split(/\s+/);
    p.innerHTML = words.map((w) => `<span class="w">${esc(w)}</span>`).join(" ");
  }

  /* ------------------------------------------------------------- lưu ý khách */
  function renderNotes() {
    const g = C.guestInfo || {};
    const phone = (p) => String(p || "").replace(/[^\d+]/g, "");
    const cards = [];
    if (g.dressCode?.text) {
      const sw = (g.dressCode.colors || []).map((c) => `<span class="swatch" style="background:${esc(c)}"></span>`).join("");
      cards.push(["i-shirt", "Trang phục", `<p>${esc(g.dressCode.text)}</p>${sw ? `<div class="swatches">${sw}</div>` : ""}`]);
    }
    if (g.parking) cards.push(["i-car", "Gửi xe", `<p>${esc(g.parking)}</p>`]);
    const contacts = (g.contacts || []).filter((c) => c.phone);
    if (contacts.length) {
      cards.push(["i-phone", "Liên hệ", contacts.map((c) => `
        <div class="contact">
          <div><small>${esc(c.role)}</small><b>${esc(c.name)}</b></div>
          <div class="contact-actions">
            <a class="icon-btn" href="tel:${esc(phone(c.phone))}" aria-label="Gọi ${esc(c.name)}">${icon("i-phone")}</a>
            <a class="icon-btn" href="https://zalo.me/${esc(phone(c.phone))}" target="_blank" rel="noopener" aria-label="Nhắn Zalo cho ${esc(c.name)}">${icon("i-chat")}</a>
          </div>
        </div>`).join("")]);
    }
    const r = g.rsvp || {};
    const rsvpHref = r.url || (contacts[0] ? `https://zalo.me/${phone(contacts[0].phone)}` : "");
    if (r.text || rsvpHref) {
      cards.push(["i-check", "Xác nhận tham dự", `<p>${esc(r.text || "")}</p>${rsvpHref
        ? `<a class="btn btn-fill" href="${esc(rsvpHref)}" target="_blank" rel="noopener">${icon("i-check", "ic")} ${r.url ? "Xác nhận ngay" : "Nhắn qua Zalo"}</a>` : ""}`]);
    }
    if (!cards.length) {
      $("#luu-y").hidden = true;
      $$('[href="#luu-y"]').forEach((a) => (a.hidden = true));
      return;
    }
    $("#note-grid").innerHTML = cards.map(([ic, title, body]) => `
      <article class="note" data-reveal>
        <div class="note-ic">${icon(ic)}</div>
        <h3 class="note-title">${title}</h3>
        ${body}
      </article>`).join("");
  }

  /* ------------------------------------------------------------- countdown */
  function startCountdown() {
    if (!W) return ($("#countdown").hidden = true);
    const cells = { d: $('[data-cd="d"]'), h: $('[data-cd="h"]'), m: $('[data-cd="m"]'), s: $('[data-cd="s"]') };
    let timer;
    const tick = () => {
      let diff = Math.floor((W.instant - Date.now()) / 1000);
      if (diff <= 0) {
        $("#countdown").hidden = true;
        $("#cd-done").hidden = false;
        return clearInterval(timer);
      }
      const d = Math.floor(diff / 86400); diff %= 86400;
      const h = Math.floor(diff / 3600); diff %= 3600;
      const next = { d: String(d), h: pad(h), m: pad(Math.floor(diff / 60)), s: pad(diff % 60) };
      Object.entries(next).forEach(([k, v]) => {
        const el = cells[k];
        if (el.textContent === v) return;
        el.textContent = v;
        el.classList.remove("tick");
        void el.offsetWidth; // chạy lại hiệu ứng nhích số
        el.classList.add("tick");
      });
    };
    timer = setInterval(tick, 1000);
    tick();
  }

  /* ----------------------------------------------------------------- shows */
  function gcalLink(ev, dt) {
    const fmt = (t) => `${t.getUTCFullYear()}${pad(t.getUTCMonth() + 1)}${pad(t.getUTCDate())}T${pad(t.getUTCHours())}${pad(t.getUTCMinutes())}00`;
    // Dựng mốc "giả UTC" để cộng giờ, rồi truyền kèm ctz = giờ Việt Nam
    const start = new Date(Date.UTC(dt.y, dt.m - 1, dt.d, dt.h, dt.mi));
    const end = new Date(start.getTime() + 2 * 3600 * 1000);
    const q = new URLSearchParams({
      action: "TEMPLATE",
      text: `${ev.title} — ${G} & ${B}`,
      dates: `${fmt(start)}/${fmt(end)}`,
      ctz: "Asia/Ho_Chi_Minh",
      location: [ev.place, ev.address].filter(Boolean).join(", "),
      details: `Trân trọng kính mời bạn đến dự ${ev.title} của ${G} & ${B}.`,
    });
    return `https://calendar.google.com/calendar/render?${q}`;
  }

  /** Lịch trình chia hai bên: mỗi bên có bố mẹ, địa chỉ tư gia và các lễ/tiệc của bên đó */
  function renderShows() {
    const list = C.events || [];
    if (!list.length) return ($("#lich-chieu").hidden = true);
    const ben = (params.get("ben") || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const mine = ben.includes("trai") ? "trai" : ben.includes("gai") ? "gai" : "";
    const sides = [
      { key: "trai", label: "Nhà trai", p: C.groom || {} },
      { key: "gai", label: "Nhà gái", p: C.bride || {} },
    ];
    const eventsOf = (key) => list
      .filter((e) => !e.side || e.side === key)
      .map((e) => ({ e, dt: parseDT(e.date, e.time) || W }))
      .sort((a, b) => (a.dt?.instant || 0) - (b.dt?.instant || 0));

    const row = ({ e, dt }) => `
      <li class="show">
        <div class="show-when">
          <b class="show-time">${esc(e.time || (dt ? `${pad(dt.h)}:${pad(dt.mi)}` : ""))}</b>
          ${dt ? `<span class="show-date">${WEEKDAYS[dt.weekday]}<br> ${pad(dt.d)}.${pad(dt.m)}.${dt.y}</span>` : ""}
        </div>
        <div class="show-body">
          <h4 class="show-title">${esc(e.title)}</h4>
          <p class="show-meta"><b>${esc(e.place)}</b>${e.address ? `<br>${esc(e.address)}` : ""}</p>
          <div class="show-actions">
            ${e.map ? `<a class="btn btn-sm btn-fill" href="${esc(e.map)}" target="_blank" rel="noopener">${icon("i-pin", "ic")} Chỉ đường</a>` : ""}
            ${dt ? `<a class="btn btn-sm" href="${esc(gcalLink(e, dt))}" target="_blank" rel="noopener">${icon("i-cal", "ic")} Lưu vào lịch</a>` : ""}
          </div>
        </div>
      </li>`;

    const active = mine || "trai";
    $("#sides").dataset.active = active;
    $("#sides").innerHTML = `
      <div class="side-tabs" role="tablist" aria-label="Chọn bên gia đình">
        ${sides.map((sd) => `<button type="button" role="tab" data-tab="${sd.key}" aria-selected="${sd.key === active}">${sd.label}${sd.key === mine ? " ✓" : ""}</button>`).join("")}
      </div>
      ${sides.map((sd) => `
        <article class="side side-${sd.key}${sd.key === mine ? " is-mine" : ""}" data-side="${sd.key}">
          <header class="side-head">
            ${sd.key === mine ? `<span class="side-badge">${icon("i-check", "ic")} Bạn được mời bên này</span>` : ""}
            <p class="side-label">${sd.label}</p>
            <p class="side-parents">Ông <b>${esc(sd.p.father)}</b><br>Bà <b>${esc(sd.p.mother)}</b></p>
            ${sd.p.address ? `<p class="side-addr">${icon("i-pin", "ic")} Tư gia: ${esc(sd.p.address)}</p>` : ""}
          </header>
          <ol class="show-list">${eventsOf(sd.key).map(row).join("") || `<li class="show-empty">Chưa có thông tin</li>`}</ol>
        </article>`).join("")}`;

    $("#sides").addEventListener("click", (ev) => {
      const tab = ev.target.closest("[data-tab]");
      if (!tab) return;
      $("#sides").dataset.active = tab.dataset.tab;
      $$("[data-tab]", $("#sides")).forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
      if (motion) ScrollTrigger.refresh();
    });
  }

  /* ------------------------------------------------------------------ gift */
  function renderGift() {
    const g = C.gift || {};
    const list = g.accounts || [];
    if (!g.show || !list.length) return ($("#mung-cuoi").hidden = true);
    const group = (n) => String(n).replace(/\s+/g, "").replace(/(.{4})(?=.)/g, "$1 ");
    $("#gifts").innerHTML = list.map((a) => `
      <article class="gift-item" data-reveal>
        <div class="bank-card">
          <div class="bc-top"><span class="bc-bank">${esc(a.bank)}</span><span class="bc-label">${esc(a.label)}</span></div>
          <div class="bc-chip"></div>
          <div class="bc-number">${esc(group(a.number))}</div>
          <div class="bc-bottom"><span><small>Chủ tài khoản</small><b>${esc(a.owner)}</b></span>${icon("i-heart")}</div>
        </div>
        ${a.qr ? `<div class="gift-qr"><img src="${esc(a.qr)}" alt="Mã QR ${esc(a.bank)}" loading="lazy" onerror="this.parentNode.remove()"></div>` : ""}
        <button class="btn" type="button" data-copy="${esc(String(a.number).replace(/\s+/g, ""))}">${icon("i-copy", "ic")} Sao chép số tài khoản</button>
      </article>`).join("");

    $("#gifts").addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-copy]");
      if (!btn) return;
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = Object.assign(document.createElement("textarea"), { value: text });
        ta.style.cssText = "position:fixed;opacity:0";
        document.body.append(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      toast("Đã sao chép số tài khoản ♥");
    });
  }

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-shown"), 2200);
  }

  /* ---------------------------------------------------------------- lời kết */
  function renderCredits() {
    const gr = C.groom || {}, br = C.bride || {};
    const parents = (p) => `Ông ${esc(p.father)}<br>Bà ${esc(p.mother)}`;
    const blocks = [
      ["Nhà trai", parents(gr)],
      ["Nhà gái", parents(br)],
      ["Trân trọng báo tin lễ thành hôn của con chúng tôi", `${esc(gr.fullName || G)}<br>&amp;<br>${esc(br.fullName || B)}`],
      W ? ["Hôn lễ được cử hành vào", `${pad(W.h)}:${pad(W.mi)} · ${WEEKDAYS[W.weekday]}, ${pad(W.d)}.${pad(W.m)}.${W.y}<small>${esc(C.lunarDate || "")}</small>`] : null,
      ["Trân trọng kính mời", esc(GUEST || "Bạn cùng gia đình"), "cr-guest"],
    ].filter(Boolean);
    $("#credits-roll").innerHTML = blocks.map(([role, names, cls]) => `
      <div class="cr-block ${cls || ""}" data-reveal>
        <p class="cr-role">${role}</p>
        <p class="cr-names">${names}</p>
      </div>`).join("");
  }

  /* ------------------------------------------------------------------ music */
  const audio = $("#bg-music"), musicBtn = $("#music-btn");
  /** Lấy giá trị theo phong cách đang chọn: chấp nhận chuỗi (dùng chung) hoặc { classic, modern } */
  const byTheme = (v) => (typeof v === "string" ? v : (v && (v[document.documentElement.dataset.theme] || v.classic)) || "");

  function setupMusic() {
    if (!C.music) return;
    audio.preload = "none"; // không tải nhạc cho tới khi khách bấm nghe (đỡ tốn dung lượng 3G/4G)
    audio.volume = 0.6;
    const state = $(".tape-state", musicBtn);
    audio.addEventListener("error", () => (musicBtn.hidden = true));
    const npState = $(".np-state", musicBtn);
    audio.addEventListener("play", () => { musicBtn.classList.add("is-playing"); state.textContent = "Đang phát · bấm để tắt"; npState.textContent = "Đang phát"; });
    audio.addEventListener("pause", () => { musicBtn.classList.remove("is-playing"); state.textContent = "Bấm để phát"; npState.textContent = "Nhạc nền"; });
    musicBtn.addEventListener("click", () => (audio.paused ? playMusic() : audio.pause()));
    // đổi phong cách -> đổi bài (nếu đang phát thì phát tiếp bài mới)
    document.addEventListener("themechange", applyTrack);
    applyTrack();
  }
  function applyTrack() {
    const src = byTheme(C.music);
    const title = byTheme(C.musicTitle) || "Nhạc nền";
    $("#tape-title").textContent = title;
    $$("[data-np-title]").forEach((el) => (el.textContent = title));
    if (!src) return (musicBtn.hidden = true);
    if (audio.dataset.src === src) return;
    const wasPlaying = !audio.paused;
    audio.dataset.src = src;
    audio.src = src;
    musicBtn.hidden = false;
    if (wasPlaying) audio.play().catch(() => {});
  }
  function playMusic() {
    if (!musicBtn.hidden && audio.src) audio.play().catch(() => {});
  }

  /* ------------------------------------------------------------ màn mở thiệp */
  function runLeader() {
    const leader = $("#leader");
    requestAnimationFrame(() => leader.classList.add("is-ready"));

    // màn hình khoá (Gen Z): giờ & ngày cưới, thông báo lời mời
    if (W) {
      $("[data-ls-time]").textContent = `${pad(W.h)}:${pad(W.mi)}`;
      $("[data-ls-date]").textContent = `${WEEKDAYS[W.weekday]}, ${W.d} tháng ${W.m}`;
    }
    $("[data-ls-title]").textContent = `${G} & ${B}`;
    $("[data-ls-text]").textContent = GUEST ? `Gửi ${GUEST} một lời mời cưới 💌` : "Bạn có một lời mời cưới 💌";

    // nút sang trang tạo link: chỉ hiện khi mở thiệp trên máy (file://) hoặc link có ?quanly=1
    if (location.protocol === "file:" || params.has("quanly")) $("#admin-link").hidden = false;

    let opened = false;
    // thời gian hiệu ứng (ms) — khớp với CSS
    const T_PREP = reduceMotion ? 0 : 900;   // cuộn băng quay / thông báo phóng to
    const T_MOVE = reduceMotion ? 0 : 1200;  // hai cánh thiệp mở / màn khoá trượt lên
    let timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

    const open = () => {
      if (opened) return;
      opened = true;
      clearTimers();
      // mặc định không tự phát nhạc — khách tự bấm nút nhạc nếu muốn nghe
      window.scrollTo(0, 0);
      $(".cassette-lg", leader)?.classList.add("is-playing");
      leader.classList.remove("is-closing");
      leader.classList.add("is-opening");
      later(() => {
        leader.classList.add("is-gone"); // Gen Y: hai cánh mở; Gen Z: màn khoá trượt lên
        document.body.classList.remove("is-locked");
        if (motion) ScrollTrigger.refresh();
        later(() => { leader.hidden = true; }, T_MOVE);
      }, T_PREP);
    };
    $("#play-btn").addEventListener("click", open);
    $("[data-open-invite]").addEventListener("click", open);

    // bấm logo H & T: đóng thiệp lại (hiệu ứng ngược)
    $("#back-to-cover").addEventListener("click", () => {
      if (!opened) return;
      opened = false;
      clearTimers();
      $(".cassette-lg", leader)?.classList.remove("is-playing");
      document.body.classList.add("is-locked");
      // bắt đầu từ trạng thái "đang mở" rồi chạy ngược lại
      leader.classList.add("is-opening", "is-gone");
      leader.hidden = false;
      void leader.offsetWidth;
      leader.classList.add("is-closing");
      leader.classList.remove("is-gone");
      later(() => {
        leader.classList.remove("is-opening");
        // chạy lại hiệu ứng thông báo rơi xuống (Gen Z)
        const note = $(".ls-note", leader);
        note.style.animation = "none"; void note.offsetWidth; note.style.animation = "";
      }, T_MOVE);
      later(() => leader.classList.remove("is-closing"), T_MOVE + 800);
    });
  }

  /* --------------------------------------------------------- progress, fab */
  function setupScroll() {
    // bấm mục menu: cuộn mượt tới phần đó, chừa chỗ cho thanh trên cùng
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const offset = ($(".topbar")?.offsetHeight || 0) - 1;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: reduceMotion ? "auto" : "smooth" });
    });
    const bar = $("#progress-bar"), top = $("#to-top"), tabbar = $("#tabbar");
    const links = $$("[data-nav]");
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      const past = window.scrollY > window.innerHeight * 0.6;
      top.classList.toggle("is-shown", past);
      tabbar.classList.toggle("is-shown", past);
      musicBtn.classList.toggle("is-compact", past); // điện thoại: thu nút nhạc lại cho khỏi che nội dung
      // tô sáng mục đang xem
      let current = "", best = -Infinity;
      new Set(links.map((a) => a.getAttribute("href"))).forEach((href) => {
        const sec = document.querySelector(href);
        if (!sec || sec.hidden) return;
        const top = sec.getBoundingClientRect().top;
        if (top < window.innerHeight * 0.45 && top > best) { best = top; current = href; }
      });
      links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === current));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ----------------------------------------------------------------- photos */

  const makeImg = (src, { lazy = true, alt = "" } = {}) => {
    const img = new Image();
    img.alt = alt;
    img.decoding = "async";
    if (lazy) img.loading = "lazy";
    img.src = src;
    return img;
  };

  let photos = [];
  /** Ảnh lấy theo danh sách cố định trong config.js (mục photos) — chỉ tải đúng các file đã khai báo. */
  async function loadPhotos() {
    const P = C.photos || {};
    const src = (name) => (name ? PHOTO_DIR + String(name).split("/").map(encodeURIComponent).join("/") : "");
    const special = {
      cover: src(P.cover),
      groom: src(P.groom),
      bride: src(P.bride),
      bg: { 1: src(P.bg?.[0]), 2: src(P.bg?.[1]), 3: src(P.bg?.[2]) },
    };
    photos = (P.album || []).filter(Boolean).map(src);

    const cover = special.cover || photos[0];
    // đường dẫn đầy đủ: url() trong biến CSS được tính theo vị trí file css/, không phải trang
    if (cover) document.documentElement.style.setProperty("--wall", `url("${new URL(cover, location.href).href}")`);
    if (cover) $("#hero-photo").replaceChildren(makeImg(cover, { lazy: false }));


    ["groom", "bride"].forEach((who) => {
      if (!special[who]) return;
      // Gắn ảnh vào trang ngay (ảnh lazy chưa gắn vào DOM sẽ không bao giờ được tải)
      const img = makeImg(special[who], { alt: who === "groom" ? "Chú rể" : "Cô dâu" });
      img.onload = () => $(`[data-person="${who}"] .p-empty`)?.remove();
      img.onerror = () => img.remove();
      $(`[data-person="${who}"] .role-photo`).append(img);
    });

    // Dấu ngày màu cam kiểu máy ảnh phim những năm 90
    stampPhotos(document);
    // Ảnh nền: nen-1 -> lời ngỏ, nen-2 -> ngày cưới, nen-3 -> lời kết.
    // Thiếu ảnh nào thì dùng hình minh hoạ vẽ sẵn theo phong cách (Gen Y / Gen Z).
    [1, 2, 3].forEach((n) => {
      const slot = $(`[data-bg-slot="${n}"]`);
      if (!slot) return;
      const src = special.bg?.[n];
      if (src) slot.append(makeImg(src));
      else {
        slot.innerHTML = ILLUS[n];
        slot.classList.add("is-illus");
        slot.removeAttribute("data-stamp");
      }
      slot.hidden = false;
      slot.closest("section, footer").classList.add("has-bg");
    });
    renderGallery();
  }

  /* ------------------------------------------------ hình minh hoạ thay ảnh nền */
  const use = (id, cls) => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
  const ILLUS = {
    // 1. khung vòm cạnh lời ngỏ
    1: `<div class="il il-y il1-y"><span class="il-hy">囍</span>${use("i-doves", "il-doves")}<p class="il-cap">Trăm năm<br>hạnh phúc</p>${use("i-palm", "il-palm il-palm-l")}${use("i-palm", "il-palm il-palm-r")}</div>
        <div class="il il-z il1-z"><span class="il-blob b1"></span><span class="il-blob b2"></span>${use("i-bloom", "il-bloom bl1")}${use("i-bloom", "il-bloom bl2")}<span class="il-tag">est. 2026 ♡</span></div>`,
    // 2. nền phần ngày cưới
    2: `<div class="il il-y il2-y"><span class="il-hy">囍</span>${use("i-palm", "il-palm il-palm-l")}${use("i-palm", "il-palm il-palm-r")}</div>
        <div class="il il-z il2-z"><span class="il-blob b1"></span><span class="il-blob b2"></span><span class="il-blob b3"></span>${use("i-bloom", "il-bloom bl1")}${use("i-bloom", "il-bloom bl2")}</div>`,
    // 3. nền lời kết
    3: `<div class="il il-y il3-y">${use("i-palm", "il-palm il-palm-l")}${use("i-palm", "il-palm il-palm-r")}<span class="il-ground"></span>${use("i-bike", "il-bike")}</div>
        <div class="il il-z il3-z"><span class="il-blob b1"></span><span class="il-blob b2"></span>${use("i-bloom", "il-bloom bl1")}${use("i-bloom", "il-bloom bl2")}${use("i-bloom", "il-bloom bl3")}</div>`,
  };

  const STAMP = W ? `'${String(W.y).slice(2)} ${pad(W.m)} ${pad(W.d)}` : "";
  function stampPhotos(root) {
    if (!STAMP) return;
    $$(".role-photo, .logline-photo, .g-item", root).forEach((el) => (el.dataset.stamp = STAMP));
  }

  /* ----------------------------------------------------------------- album */
  /** Lưới ảnh giữ nguyên tỉ lệ (không cắt ảnh), hiện dần theo trang, bấm để xem lớn */
  function renderGallery() {
    const grid = $("#gallery"), more = $("#gallery-more");
    if (!photos.length) return ($("#gallery-empty").hidden = false);
    const size = Math.max(1, C.galleryPageSize || 12);
    let shown = 0, refreshTimer;
    // ảnh tải xong làm trang cao thêm -> báo GSAP tính lại vị trí các hiệu ứng (gộp lại cho nhẹ)
    const refresh = () => {
      if (!motion) return;
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 300);
    };
    const showMore = () => {
      const frag = document.createDocumentFragment();
      photos.slice(shown, shown + size).forEach((src, j) => {
        const i = shown + j;
        const item = document.createElement("button");
        item.type = "button";
        item.className = "g-item";
        item.dataset.index = i;
        item.setAttribute("aria-label", `Xem ảnh ${i + 1}`);
        const img = makeImg(src);
        img.onload = () => { item.classList.add("is-loaded"); refresh(); };
        img.onerror = () => { item.remove(); refresh(); };
        item.append(img);
        frag.append(item);
      });
      grid.append(frag);
      stampPhotos(grid);
      shown = Math.min(photos.length, shown + size);
      more.hidden = shown >= photos.length;
      more.textContent = `Xem thêm ảnh (${photos.length - shown})`;
      refresh();
    };
    more.addEventListener("click", showMore);
    grid.addEventListener("click", (e) => {
      const item = e.target.closest(".g-item");
      if (item) openLightbox(+item.dataset.index);
    });
    showMore();
  }

  /* --------------------------------------------------------------- lightbox */
  const lb = $("#lightbox");
  const lbImg = $("#lb-img");
  let lbIndex = 0, lastFocus = null;

  function showLb(i) {
    lbIndex = (i + photos.length) % photos.length;
    lbImg.style.animation = "none";
    void lbImg.offsetWidth; // chạy lại hiệu ứng
    lbImg.style.animation = "";
    lbImg.src = photos[lbIndex];
    $("#lb-count").textContent = `${lbIndex + 1} / ${photos.length}`;
    [1, -1].forEach((d) => { new Image().src = photos[(lbIndex + d + photos.length) % photos.length]; });
  }
  function openLightbox(i) {
    if (!photos.length) return;
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.classList.add("is-locked");
    showLb(i);
    $(".lb-close", lb).focus();
  }
  function closeLightbox() {
    lb.hidden = true;
    document.body.classList.remove("is-locked");
    lastFocus?.focus();
  }
  function setupLightbox() {
    lb.addEventListener("click", (e) => {
      const act = e.target.closest("[data-lb]")?.dataset.lb;
      if (act === "close") closeLightbox();
      else if (act === "prev") showLb(lbIndex - 1);
      else if (act === "next") showLb(lbIndex + 1);
      else if (e.target === lb || e.target.classList.contains("lb-stage")) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showLb(lbIndex - 1);
      if (e.key === "ArrowRight") showLb(lbIndex + 1);
    });
    let x0 = null, y0 = null;
    lb.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    lb.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) showLb(lbIndex + (dx < 0 ? 1 : -1));
      else if (dy > 90) closeLightbox();
      x0 = y0 = null;
    });
  }

  /* ----------------------------------------------------- hiệu ứng khi cuộn */
  function setupMotion() {
    if (!motion) return;
    gsap.registerPlugin(ScrollTrigger);

    // 1. Mở đầu: chữ phóng to "xuyên qua" màn hình, ảnh hiện ra, rồi thẻ tên & ngày cưới (nền kem, dễ đọc)
    gsap.timeline({
      scrollTrigger: { trigger: "#hero", start: "top top", end: "+=170%", scrub: 1, pin: true, anticipatePin: 1 },
    })
      .to(".hero-pre, .hero-scroll", { opacity: 0, duration: 0.15 }, 0)
      .fromTo("#hero-mask", { scale: 1 }, { scale: 7, duration: 1, ease: "power2.in" }, 0)
      .to("#hero-mask", { opacity: 0, duration: 0.4, ease: "none" }, 0.5)
      .fromTo("#hero-photo", { scale: 1.3 }, { scale: 1, duration: 1.3, ease: "none" }, 0)
      .fromTo(".hero-bike", { x: 0 }, { x: () => window.innerWidth * 0.75, duration: 0.7, ease: "none" }, 0)
      .fromTo("#hero-card", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.35 }, 1.0)
      .from("#hero-card > *", { opacity: 0, y: 14, stagger: 0.08, duration: 0.25 }, 1.1)
      .to({}, { duration: 0.3 });

    // 2. Lời ngỏ rõ dần từng chữ
    gsap.fromTo("#logline .w", { opacity: 0.28 }, {
      opacity: 1, stagger: 0.05, ease: "none",
      scrollTrigger: { trigger: "#logline", start: "top 78%", end: "bottom 45%", scrub: true },
    });

    // Ảnh nền trôi chậm khi cuộn
    $$(".sec-bg img").forEach((img) => gsap.fromTo(img, { yPercent: -8 }, {
      yPercent: 8, ease: "none",
      scrollTrigger: { trigger: img.closest("section, footer"), start: "top bottom", end: "bottom top", scrub: true },
    }));

    // Cô dâu & chú rể: ảnh chuyển từ đen trắng sang màu khi cuộn tới
    $$(".role").forEach((r) => ScrollTrigger.create({ trigger: r, start: "top 55%", onEnter: () => r.classList.add("in-view") }));

    // Hiện dần các khối nội dung
    $$("[data-reveal]").forEach((el) => {
      gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
    });

    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  /* ------------------------------------------------------- chữ cắt dán (cổ điển) */
  /** Tách chữ thành từng ký tự, mỗi ký tự nghiêng lệch một chút như chữ cắt dán trên phông cưới xưa.
   *  Ở giao diện hiện đại các ký tự hiển thị bình thường (CSS bỏ nghiêng). */
  function cutout(root = document) {
    $$(".h2, .hero-banner, .hero-title, .hero-date, .te-title, .side-label, .hc-names", root).forEach((el) => {
      if (el.dataset.cut) return;
      el.dataset.cut = "1";
      if (!el.hasAttribute("aria-label") && !el.hasAttribute("aria-hidden")) el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));
      let i = 0;
      const walk = (node) => [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          // bọc từng từ để trình duyệt không xuống dòng giữa các ký tự của một từ
          n.textContent.normalize("NFC").split(/(\s+)/).forEach((word) => {
            if (!word) return;
            if (/^\s+$/.test(word)) return frag.append(word);
            const w = document.createElement("span");
            w.className = "cw";
            Array.from(word).forEach((ch) => {
              const sp = document.createElement("span");
              sp.className = "cl";
              sp.setAttribute("aria-hidden", "true");
              sp.textContent = ch;
              sp.style.setProperty("--r", `${(((i * 37) % 9) - 4) * 0.9}deg`);
              sp.style.setProperty("--y", `${(((i * 53) % 5) - 2) * 0.025}em`);
              i++;
              w.append(sp);
            });
            frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.namespaceURI !== "http://www.w3.org/2000/svg") walk(n);
      });
      walk(el);
    });
  }

  /* -------------------------------------------------------------- giao diện */
  function setupTheme() {
    const root = document.documentElement;
    if (!root.dataset.themeFromUrl) root.dataset.theme = C.theme === "modern" ? "modern" : "classic";
    const sync = () => $$("[data-theme-pick]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.themePick === root.dataset.theme)));
    sync();
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-theme-pick]");
      if (!b || b.dataset.themePick === root.dataset.theme) return;
      // cập nhật link trên thanh địa chỉ: Gen Z -> ?giaodien=genz, Gen Y (mặc định) -> bỏ tham số
      try {
        const url = new URL(location.href);
        if (b.dataset.themePick === "modern") url.searchParams.set("giaodien", "genz");
        else url.searchParams.delete("giaodien");
        history.replaceState(null, "", url);
      } catch {}
      const apply = () => {
        root.dataset.theme = b.dataset.themePick;
        sync();
        document.dispatchEvent(new Event("themechange"));
        if (motion) ScrollTrigger.refresh();
      };
      // chuyển phong cách mượt (mờ dần) trên trình duyệt hỗ trợ
      if (document.startViewTransition && !reduceMotion) document.startViewTransition(apply);
      else apply();
    });
  }

  /* ------------------------------------------------------------------- init */
  async function init() {
    setupTheme();
    bindTexts();
    buildHeroTitle();
    splitLogline();
    renderNotes();
    startCountdown();
    renderShows();
    renderGift();
    renderCredits();
    cutout();
    setupMusic();
    setupScroll();
    setupLightbox();
    runLeader();
    await loadPhotos();
    setupMotion();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
