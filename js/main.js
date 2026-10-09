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
  /** Khoá/mở cuộn trang: gắn class lên cả <html> và <body>.
   *  Không dùng html:has(body.is-locked) vì WebKit (Safari, Chrome trên iPhone) có khi không tính lại :has() → trang kẹt không cuộn được. */
  const setLocked = (on) => [document.documentElement, document.body].forEach((el) => el.classList.toggle("is-locked", on));

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
  const params = new URLSearchParams(location.search);
  // Khách bên nào: ?ben=trai | ?ben=gai (không ghi = chưa rõ, hiển thị theo nhà trai)
  const BEN = (params.get("ben") || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const SIDE = BEN.includes("trai") ? "trai" : BEN.includes("gai") ? "gai" : "";
  // Lễ & tiệc của bên đang xem (sự kiện không ghi side là chung cho cả hai bên)
  const MY_EVENTS = (C.events || []).filter((e) => !e.side || e.side === (SIDE || "trai"));
  const isCeremony = (e) => /hôn lễ|thành hôn|vu quy/i.test(e.title || "");
  const isParty = (e) => /tiệc/i.test(e.title || "");
  // Thời điểm chính: khách nhà gái thấy giờ hôn lễ nhà gái; còn lại theo config.date
  const W = (() => {
    const own = SIDE === "gai" && MY_EVENTS.find((e) => e.side === "gai" && isCeremony(e));
    return own ? parseDT(own.date, own.time) : parseDT(C.date);
  })();
  const G = (get(C, "groom.name") || "").normalize("NFC");
  const B = (get(C, "bride.name") || "").normalize("NFC");
  // Tên khách mời: ?ten=Anh%20Nam (hoặc ?to= / ?khach=). Không có thì xưng "bạn".
  const GUEST = (params.get("ten") || params.get("to") || params.get("khach") || "").trim().slice(0, 60);

  /* Giai đoạn của thiệp theo ngày (giờ Việt Nam): "before" trước ngày cưới, "today" đúng ngày có lễ/tiệc,
   * "after" sau ngày cuối cùng. Cô dâu chú rể xem trước được bằng link có ?ngay=2026-11-16 */
  const ymd = (d) => `${d.y}-${pad(d.m)}-${pad(d.d)}`;
  const SIM_DAY = /^\d{4}-\d{2}-\d{2}$/.test(params.get("ngay") || "") ? params.get("ngay") : "";
  /** thời điểm hiện tại; khi giả lập ngày thì lấy giờ hiện tại đặt vào ngày đó */
  const nowVN = () => {
    if (!SIM_DAY) return Date.now();
    const t = new Date(Date.now() + 7 * 3600 * 1000);
    return Date.parse(`${SIM_DAY}T${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())}:00${TZ}`);
  };
  const TODAY = SIM_DAY || (() => {
    const t = new Date(Date.now() + 7 * 3600 * 1000);
    return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
  })();
  const ALL_EVENTS = (C.events || []).map((e) => ({ e, dt: parseDT(e.date, e.time) })).filter((x) => x.dt);
  const PHASE = (() => {
    const days = [W, ...ALL_EVENTS.map((x) => x.dt)].filter(Boolean).map(ymd).sort();
    if (!days.length) return "before";
    if (days.includes(TODAY)) return "today";
    return TODAY > days[days.length - 1] ? "after" : "before";
  })();

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
    const contacts = (g.contacts || []).filter((c) => c.phone)
      .filter((c) => !SIDE || (SIDE === "trai" ? /chú rể/i : /cô dâu/i).test(c.role || "")); // đã chọn bên: chỉ người bên đó
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
    if (g.rsvp) {
    // khách nhà gái nhắn cô dâu, còn lại nhắn người liên hệ đầu tiên (chú rể)
    const rsvpTo = (SIDE === "gai" && contacts.find((c) => /cô dâu/i.test(c.role || ""))) || contacts[0];
    const rsvpHref = r.url || (rsvpTo ? `https://zalo.me/${phone(rsvpTo.phone)}` : "");
    if (r.text || rsvpHref) {
      cards.push(["i-check", "Xác nhận tham dự", `<p>${esc(r.text || "")}</p>${rsvpHref
        ? `<a class="btn btn-fill" href="${esc(rsvpHref)}" target="_blank" rel="noopener">${icon("i-check", "ic")} ${r.url ? "Xác nhận ngay" : "Nhắn qua Zalo"}</a>` : ""}`]);
    }
    }
    // chỉ còn mục liên hệ: hiện gọn thành hai thẻ chú rể / cô dâu cạnh nhau
    if (cards.length === 1 && cards[0][1] === "Liên hệ") {
      $("#note-grid").className = "contact-tiles";
      $("#note-grid").innerHTML = contacts.map((c) => `
        <article class="ct-tile" data-reveal>
          <small>${esc(c.role)}</small>
          <b>${esc(c.name)}</b>
          <div class="ct-actions">
            <a class="ct-btn ct-call" href="tel:${esc(phone(c.phone))}" aria-label="Gọi ${esc(c.name)}">${icon("i-phone", "ic")}<span>Gọi</span></a>
            <a class="ct-btn" href="https://zalo.me/${esc(phone(c.phone))}" target="_blank" rel="noopener" aria-label="Nhắn Zalo cho ${esc(c.name)}">${icon("i-chat", "ic")}<span>Zalo</span></a>
          </div>
        </article>`).join("");
      return;
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
      details: `Trân trọng kính mời bạn đến dự ${ev.title} của ${G} & ${B}.${ev.map ? `\nChỉ đường: ${ev.map}` : ""}`,
    });
    return `https://calendar.google.com/calendar/render?${q}`;
  }

  /** Link chỉ đường: dùng map trong config; không ghi map thì tự tìm theo địa chỉ trên Google Maps; map: "" để ẩn */
  const mapLink = (e) => (e.map !== undefined ? e.map
    : e.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.address)}` : "");

  /** Lịch trình chia hai bên: mỗi bên có bố mẹ, địa chỉ tư gia và các lễ/tiệc của bên đó */
  function renderShows() {
    const list = C.events || [];
    if (!list.length) return ($("#lich-chieu").hidden = true);
    // đã chọn một bên: tiêu đề theo bên đó thay vì "hai bên gia đình"
    if (SIDE) $("#lich-chieu .h2").innerHTML = `Lịch trình <i>${SIDE === "trai" ? "nhà trai" : "nhà gái"}</i>`;
    const mine = SIDE;
    const sides = [
      { key: "trai", label: "Nhà trai", p: C.groom || {} },
      { key: "gai", label: "Nhà gái", p: C.bride || {} },
    ].filter((sd) => !mine || sd.key === mine); // đã chọn bên: chỉ hiện bên đó
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
          ${e.lunar ? `<p class="show-lunar">${esc(e.lunar)}</p>` : ""}
          <p class="show-meta"><b>${esc(e.place)}</b>${e.address ? `<br>${esc(e.address)}` : ""}</p>
          <div class="show-actions">
            ${mapLink(e) ? `<a class="btn btn-sm btn-fill" href="${esc(mapLink(e))}" target="_blank" rel="noopener">${icon("i-pin", "ic")} Chỉ đường</a>` : ""}
            ${dt ? `<a class="btn btn-sm" href="${esc(gcalLink(e, dt))}" target="_blank" rel="noopener">${icon("i-cal", "ic")} Lưu vào lịch</a>` : ""}
          </div>
        </div>
      </li>`;

    const active = mine || "trai";
    $("#sides").dataset.active = active;
    $("#sides").innerHTML = `
      <div class="side-tabs" role="tablist" aria-label="Chọn bên gia đình"${mine ? " hidden" : ""}>
        ${sides.map((sd) => `<button type="button" role="tab" data-tab="${sd.key}" aria-selected="${sd.key === active}">${sd.label}${sd.key === mine ? " ✓" : ""}</button>`).join("")}
      </div>
      ${sides.map((sd) => `
        <article class="side side-${sd.key}${sd.key === mine ? " is-mine" : ""}" data-side="${sd.key}">
          <header class="side-head">
            <p class="side-label">${sd.label}</p>
            <p class="side-parents">Ông <b>${esc(sd.p.father)}</b><br>Bà <b>${esc(sd.p.mother)}</b></p>
            ${sd.p.address ? (sd.p.map
              ? `<a class="side-addr" href="${esc(sd.p.map)}" target="_blank" rel="noopener">${icon("i-pin", "ic")} Tư gia: ${esc(sd.p.address)}</a>`
              : `<p class="side-addr">${icon("i-pin", "ic")} Tư gia: ${esc(sd.p.address)}</p>`) : ""}
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
    const all = g.accounts || [];
    // đã chọn bên: chỉ tài khoản bên đó (nhận theo nhãn "chú rể" / "cô dâu"); không khớp thì hiện tất cả
    const own = SIDE ? all.filter((a) => (SIDE === "trai" ? /chú rể/i : /cô dâu/i).test(a.label || "")) : [];
    const list = own.length ? own : all;
    if (!g.show || !list.length) return ($("#mung-cuoi").hidden = true);
    $("#gifts").innerHTML = list.map((a) => `
      <article class="gift-item" data-reveal>
        <div class="envelope${a.qr ? " has-qr" : ""}">
          <div class="env-back"></div>
          <div class="env-letter">
            <div class="bc-top"><span class="bc-bank">${esc(a.bank)}</span></div>
            <div class="bc-scratch"><div class="bc-number">${esc(String(a.number).replace(/\s+/g, ""))}</div><canvas class="sc-cover" aria-hidden="true"></canvas></div>
            <div class="bc-row">
              <div class="bc-bottom"><small>Chủ tài khoản</small><b>${esc(a.owner)}</b></div>
              <button class="bc-copy" type="button" data-copy="${esc(String(a.number).replace(/\s+/g, ""))}" aria-label="Sao chép số tài khoản">${icon("i-copy", "ic")}<span>Sao chép</span></button>
            </div>
          </div>
          <div class="env-front">${a.qr ? `<span class="env-qr"><img src="${esc(a.qr)}" alt="Mã QR ${esc(a.bank)}" loading="lazy" onerror="this.closest('.envelope').classList.remove('has-qr');this.parentNode.remove()"><a class="qr-dl" aria-label="Tải mã QR" title="Tải mã QR" href="${esc(a.qr)}" download="ma-qr-${esc(String(a.label || a.bank).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase().replace(/\s+/g, "-"))}.png">${icon("i-download", "ic")}<span>Tải</span></a></span>` : ""}<span class="env-label">${esc(a.label)}</span></div>
          <span class="env-seal" aria-hidden="true"><span class="only-y">囍</span><span class="only-z">♡</span></span>
        </div>
      </article>`).join("");

    $("#gifts").addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-copy]");
      if (!btn) return;
      const text = btn.dataset.copy;
      btn.closest(".gift-item")?._reveal?.(true);
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
    // hôn lễ & tiệc của bên đang xem (khách nhà gái thấy lễ/tiệc nhà gái, còn lại theo nhà trai)
    const evs = MY_EVENTS.map((e) => ({ e, dt: parseDT(e.date, e.time) }));
    const ceremony = evs.find(({ e }) => isCeremony(e))?.e;
    const partyEv = evs.find(({ e }) => isParty(e));
    const party = partyEv?.e;
    const partyWhen = () => {
      const { e, dt } = partyEv;
      const when = dt ? `${pad(dt.h)}:${pad(dt.mi)} · ${WEEKDAYS[dt.weekday]}, ${pad(dt.d)}.${pad(dt.m)}.${dt.y}` : "";
      const addr = e.address ? `<small>Địa chỉ: ${esc(e.address)}</small>` : "";
      return `${when}${e.lunar ? `<small>${esc(e.lunar)}</small>` : ""}${addr}`;
    };
    const parents = (p) => `Ông ${esc(p.father)}<br>Bà ${esc(p.mother)}`;
    /** Không rõ khách bên nào: mỗi bên một khối — lễ/tiệc theo thứ tự ngày, cuối khối là địa chỉ tư gia */
    const bothSides = () => [["trai", "Nhà trai", gr], ["gai", "Nhà gái", br]].map(([key, label, p]) => {
      const list = (C.events || []).filter((e) => e.side === key)
        .map((e) => ({ e, dt: parseDT(e.date, e.time) })).filter((x) => x.dt)
        .sort((a, b) => (a.e.date + a.e.time).localeCompare(b.e.date + b.e.time));
      if (!list.length) return null;
      const rows = list.map(({ e, dt }) =>
        `<span class="cr-ev"><b>${esc(e.title)}</b> · ${pad(dt.h)}:${pad(dt.mi)} · ${WEEKDAYS[dt.weekday]}, ${pad(dt.d)}.${pad(dt.m)}.${dt.y}</span>`).join("");
      const addr = p.address || list[0].e.address;
      return [`Tại tư gia ${label.toLowerCase()}`, `${rows}${addr ? `<small>Địa chỉ: ${esc(addr)}</small>` : ""}`, "cr-side"];
    }).filter(Boolean);
    const blocks = [
      ["Trân trọng báo tin lễ thành hôn của con chúng tôi", `${esc(gr.fullName || G)}<br>&amp;<br>${esc(br.fullName || B)}`],
      // link có ben=trai/gai: chỉ lễ & tiệc của bên đó; không ghi bên nào: hiện rõ cả hai bên kèm địa chỉ
      ...(SIDE ? [
        party ? [`Vui lòng đến dự buổi tiệc chung vui cùng gia đình chúng tôi${party.place ? ` tại ${esc(party.place.toLowerCase())}` : ""}`, partyWhen()] : null,
        W ? [`Hôn lễ được cử hành${ceremony?.place ? ` tại ${esc(ceremony.place.toLowerCase())}` : ""} vào lúc`, `${pad(W.h)}:${pad(W.mi)} · ${WEEKDAYS[W.weekday]}, ${pad(W.d)}.${pad(W.m)}.${W.y}<small>${esc(C.lunarDate || "")}</small>${ceremony?.address && ceremony.address !== party?.address ? `<small>Địa chỉ: ${esc(ceremony.address)}</small>` : ""}`] : null,
      ] : bothSides()),
      [PHASE === "after" ? "Cảm ơn sự hiện diện của" : "Trân trọng kính mời", esc(GUEST || "Bạn cùng gia đình"), "cr-guest"],
    ].filter(Boolean);
    $("#credits-roll").innerHTML = blocks.map(([role, names, cls]) => `
      <div class="cr-block ${cls || ""}" data-reveal>
        <p class="cr-role">${role}</p>
        <p class="cr-names">${names}</p>
      </div>`).join("");
  }

  /* ------------------------------------------ ngày cưới & sau ngày cưới */
  /** Đúng ngày có lễ/tiệc: giờ, địa điểm, trạng thái trực tiếp, chỉ đường và gọi điện ngay dưới phần mở đầu */
  function renderToday() {
    const box = $("#hom-nay");
    const list = ALL_EVENTS.filter(({ dt }) => ymd(dt) === TODAY).sort((a, b) => a.dt.instant - b.dt.instant);
    const wedding = W && ymd(W) === TODAY;
    const phone = (p) => String(p || "").replace(/[^\d+]/g, "");
    const contacts = (get(C, "guestInfo.contacts") || []).filter((c) => c.phone);
    box.innerHTML = `
      <p class="eyebrow">Hôm nay</p>
      <h2 class="today-title">${wedding ? "Hôm nay chúng mình cưới! 🎉" : `Hôm nay là ${esc(list[0]?.e.title || "ngày vui")} 🎉`}</h2>
      <ol class="today-list">${list.map(({ e, dt }) => `
        <li class="today-ev" data-start="${dt.instant.getTime()}">
          <div class="td-when"><b>${pad(dt.h)}:${pad(dt.mi)}</b><span class="td-status"></span></div>
          <div class="td-body">
            <h3>${esc(e.title)}</h3>
            <p><b>${esc(e.place)}</b>${e.address ? `<br>${esc(e.address)}` : ""}</p>
            ${e.map ? `<a class="btn btn-fill today-go" href="${esc(e.map)}" target="_blank" rel="noopener">${icon("i-pin", "ic")} Chỉ đường</a>` : ""}
          </div>
        </li>`).join("")}</ol>
      ${contacts.length ? `<div class="today-call">${contacts.map((c) => `<a class="btn" href="tel:${esc(phone(c.phone))}">${icon("i-phone", "ic")} Gọi ${esc(String(c.role || c.name).toLowerCase())}</a>`).join("")}</div>` : ""}`;
    box.hidden = false;
    // trạng thái: còn bao lâu / đang diễn ra (3 tiếng đầu) / đã xong
    const tick = () => $$(".today-ev", box).forEach((li) => {
      const mins = Math.round((+li.dataset.start - nowVN()) / 60000);
      $(".td-status", li).textContent = mins > 60 ? `còn ${Math.floor(mins / 60)} giờ ${mins % 60} phút` : mins > 0 ? `còn ${mins} phút` : mins > -180 ? "đang diễn ra" : "đã xong";
      li.classList.toggle("is-live", mins <= 0 && mins > -180);
      li.classList.toggle("is-done", mins <= -180);
    });
    tick();
    setInterval(tick, 30000);
  }

  function applyPhase() {
    document.documentElement.dataset.phase = PHASE;
    const html = (sel, v) => $$(sel).forEach((el) => (el.innerHTML = v));
    if (PHASE === "today") {
      renderToday();
      if (W && ymd(W) === TODAY) html(".hc-kicker", "Hôm nay chúng mình cưới!");
      // thanh điều hướng dưới đáy: mục đầu tiên dẫn tới "Hôm nay"
      const first = $(".tabbar a");
      if (first) { first.setAttribute("href", "#hom-nay"); $("span", first).textContent = "Hôm nay"; }
    }
    if (PHASE === "after") {
      $("#leader-guest").innerHTML = `Cảm ơn ${GUEST ? esc(GUEST) : "bạn"} đã đến chung vui cùng<b>${esc(G)} &amp; ${esc(B)}</b>`;
      html(".hc-kicker", "Cảm ơn bạn đã đến chung vui");
      html(".te-sub", "Cảm ơn vì đã là một phần ngày vui của chúng mình!");
      if (W) html(".te-date", `Ngày chúng mình về chung một nhà · ${pad(W.d)}.${pad(W.m)}.${W.y}`);
      html("#lich-chieu .lead", "Cảm ơn sự hiện diện của bạn trong ngày vui của gia đình chúng tôi.");
      // album lên ngay sau phần mở đầu; lịch trình đã diễn ra; lưu ý & xác nhận tham dự không còn cần
      $("#hero").after($("#album"));
      $("#lich-chieu").classList.add("is-past");
      $$('#lich-chieu a[href*="calendar.google"]').forEach((a) => a.remove());
      $("#luu-y").hidden = true;
      $$('[href="#luu-y"]').forEach((a) => (a.hidden = true));
    }
  }

  /* ------------------------------------------------------------------ music */
  const audio = $("#bg-music"), musicBtn = $("#music-btn");
  /** Lấy giá trị theo phong cách đang chọn: chấp nhận chuỗi (dùng chung) hoặc { classic, modern } */
  const byTheme = (v) => (typeof v === "string" ? v : (v && (v[document.documentElement.dataset.theme] || v.classic)) || "");

  /** Danh sách bài của phong cách đang xem. config.music có thể là:
   *  - mảng [{ src, title }, …] dùng chung hai phong cách (phát lần lượt, hết thì quay lại bài đầu)
   *  - { classic: …, modern: … } mỗi phong cách một chuỗi / một mảng
   *  - một chuỗi đường dẫn mp3 (tên bài lấy ở musicTitle) */
  function playlist() {
    const m = C.music;
    const v = m && !Array.isArray(m) && typeof m === "object" ? m[document.documentElement.dataset.theme] || m.classic : m;
    const list = (Array.isArray(v) ? v : v ? [v] : [])
      .map((t) => (typeof t === "string" ? { src: t, title: "" } : { ...t }))
      .filter((t) => t && t.src);
    if (list.length === 1 && !list[0].title) list[0].title = byTheme(C.musicTitle) || "";
    return list;
  }

  let tracks = [], trackIdx = 0, wantPlay = false;
  const failed = new Set();
  function setupMusic() {
    if (!C.music) return;
    audio.preload = "none"; // không tải nhạc cho tới khi khách bấm nghe (đỡ tốn dung lượng 3G/4G)
    audio.volume = 0.6;
    const state = $(".tape-state", musicBtn);
    const npState = $(".np-state", musicBtn);
    audio.addEventListener("play", () => {
      musicBtn.classList.add("is-playing");
      state.textContent = "Đang phát · bấm để tắt";
      npState.textContent = tracks.length > 1 ? `Đang phát · ${trackIdx + 1}/${tracks.length}` : "Đang phát";
    });
    audio.addEventListener("pause", () => { musicBtn.classList.remove("is-playing"); state.textContent = "Bấm để phát"; npState.textContent = "Nhạc nền"; });
    // hết bài -> sang bài tiếp theo (hết danh sách thì quay lại bài đầu)
    audio.addEventListener("ended", () => loadTrack(trackIdx + 1, true));
    // file lỗi / chưa có -> bỏ qua sang bài kế; tất cả đều lỗi thì ẩn nút nhạc
    audio.addEventListener("error", () => {
      failed.add(tracks[trackIdx]?.src);
      if (tracks.every((t) => failed.has(t.src))) return (musicBtn.hidden = true);
      if (wantPlay) loadTrack(trackIdx + 1, true);
    });
    musicBtn.addEventListener("click", (e) => {
      if (e.target.closest("#music-list-btn")) return; // nút ☰ mở danh sách, không bật/tắt nhạc
      audio.paused ? playMusic() : (wantPlay = false, audio.pause());
    });
    setupTrackPicker();
    // đổi phong cách: nếu danh sách khác thì đổi (đang phát thì phát tiếp), cùng danh sách thì nghe tiếp
    document.addEventListener("themechange", applyTrack);
    applyTrack();
  }
  /** Đèn nháy (Gen Y) và vạch sóng nhạc (Gen Z) nháy theo nhịp bài hát thật khi đang phát.
   *  Bỏ qua khi mở file trên máy (trình duyệt không cho đọc âm thanh → nhạc câm) và trên iPhone/iPad
   *  (WebKit có thể giữ bộ xử lý âm thanh ở trạng thái tạm dừng → nhạc câm). Khi đó giữ hiệu ứng nháy cũ. */
  function setupBeat() {
    const AC = window.AudioContext || window.webkitAudioContext;
    const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (reduceMotion || !AC || ios || !/^https?:$/.test(location.protocol)) return;
    let ctx = null, analyser, data, raf = 0;
    const level = [0, 0, 0, 0], avg = [0, 0, 0, 0], peak = [0.05, 0.05, 0.05, 0.05];
    const BANDS = [[1, 4], [4, 12], [12, 40], [40, 110]]; // trầm → cao (fftSize 512)
    const loop = () => {
      analyser.getByteFrequencyData(data);
      BANDS.forEach(([a, b], k) => {
        let sum = 0;
        for (let i = a; i < b; i++) sum += data[i];
        const raw = sum / ((b - a) * 255);
        // tự cân theo bài: so với mức trung bình gần đây của chính dải đó → chỉ nhịp nhấn mới làm đèn bừng lên
        avg[k] = avg[k] * 0.97 + raw * 0.03;
        peak[k] = Math.max(raw, peak[k] * 0.996, avg[k] + 0.04);
        const v = Math.min(1, Math.max(0, (raw - avg[k] * 0.85) / (peak[k] - avg[k] * 0.85)));
        level[k] = level[k] * 0.55 + v * 0.45; // làm mượt, không giật
      });
      $$(".lights, .np-eq").forEach((el) => level.forEach((v, k) => el.style.setProperty(`--b${k}`, v.toFixed(3))));
      raf = requestAnimationFrame(loop);
    };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; document.documentElement.classList.remove("is-beat"); };
    // tạo bộ phân tích ngay trong lúc khách bấm nút nhạc (trình duyệt chỉ cho bật âm thanh khi có thao tác)
    const initCtx = () => {
      if (ctx) return ctx.resume?.();
      try {
        ctx = new AC();
        analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.55;
        ctx.createMediaElementSource(audio).connect(analyser);
        analyser.connect(ctx.destination);
        data = new Uint8Array(analyser.frequencyBinCount);
      } catch { ctx = null; }
    };
    [musicBtn, $("#play-btn"), $("[data-open-invite]"), $("#music-sheet")].forEach((el) => el?.addEventListener("click", initCtx));
    audio.addEventListener("play", () => {
      if (!ctx) return;
      ctx.resume?.();
      document.documentElement.classList.add("is-beat");
      if (!raf) loop();
    });
    audio.addEventListener("pause", stop);
    document.addEventListener("visibilitychange", () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!audio.paused && ctx) loop(); });
  }
  /** Bảng chọn bài: bấm ☰ trên nút nhạc → danh sách bài, chọn bài nào phát bài đó (chỉ tải bài được chọn). */
  const sheet = $("#music-sheet"), sheetList = $("#music-list");
  function renderTrackList() {
    sheetList.replaceChildren(...tracks.map((t, i) => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.type = "button";
      b.className = "msheet-item" + (i === trackIdx ? " is-current" : "") + (failed.has(t.src) ? " is-failed" : "");
      b.dataset.track = i;
      // "Tên bài · Ca sĩ" -> hai dòng
      const [name, ...by] = (t.title || `Bài ${i + 1}`).split(" · ");
      b.innerHTML = `<span class="mi-no">${String(i + 1).padStart(2, "0")}</span>`
        + `<span class="mi-txt"><b>${esc(name)}</b>${by.length ? `<small>${esc(by.join(" · "))}</small>` : ""}</span>`
        + `<span class="mi-eq" aria-hidden="true"><i></i><i></i><i></i></span>`;
      if (i === trackIdx) b.setAttribute("aria-current", "true");
      li.append(b);
      return li;
    }));
  }
  function setupTrackPicker() {
    const listBtn = $("#music-list-btn");
    let lastFocus = null;
    const close = () => { sheet.hidden = true; lastFocus?.focus?.(); };
    const openSheet = (e) => {
      e.preventDefault(); e.stopPropagation();
      if (!tracks.length) return;
      lastFocus = document.activeElement;
      renderTrackList();
      sheet.classList.toggle("is-playing", !audio.paused);
      sheet.hidden = false;
      $(".msheet-item.is-current", sheet)?.focus();
    };
    listBtn.addEventListener("click", openSheet);
    listBtn.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") openSheet(e); });
    sheet.addEventListener("click", (e) => {
      const item = e.target.closest("[data-track]");
      if (item) { failed.delete(tracks[+item.dataset.track]?.src); loadTrack(+item.dataset.track, true); return close(); }
      if (e.target === sheet || e.target.closest("[data-msheet-close]")) close();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !sheet.hidden) close(); });
  }
  function applyTrack() {
    const list = playlist();
    if (!list.length) return (musicBtn.hidden = true);
    const key = list.map((t) => t.src).join("|");
    if (key === audio.dataset.list) return;
    audio.dataset.list = key;
    tracks = list;
    failed.clear();
    audio.loop = tracks.length === 1; // một bài thì lặp lại bài đó
    musicBtn.hidden = false;
    $("#music-list-btn").hidden = tracks.length < 2; // chỉ hiện ☰ khi có từ 2 bài trở lên
    loadTrack(0, !audio.paused);
  }
  function loadTrack(i, autoplay) {
    // bỏ qua các bài đã biết là lỗi
    for (let k = 0; k < tracks.length && failed.has(tracks[((i % tracks.length) + tracks.length) % tracks.length].src); k++) i++;
    trackIdx = ((i % tracks.length) + tracks.length) % tracks.length;
    const t = tracks[trackIdx];
    const title = t.title || "Nhạc nền";
    $("#tape-title").textContent = title;
    $$("[data-np-title]").forEach((el) => (el.textContent = title));
    audio.src = t.src; // preload="none": chỉ tải khi phát
    if (!sheet.hidden) renderTrackList();
    if (autoplay) { wantPlay = true; audio.play().catch(() => {}); }
  }
  function playMusic() {
    if (musicBtn.hidden || !tracks.length) return;
    wantPlay = true;
    audio.play().catch(() => {});
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
    $("[data-ls-text]").textContent = PHASE === "after"
      ? `Cảm ơn ${GUEST || "bạn"} đã đến chung vui 💕`
      : GUEST ? `Gửi ${GUEST} một lời mời cưới 💌` : "Bạn có một lời mời cưới 💌";

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
      goFullscreen(); // phải gọi ngay trong lúc bấm thì trình duyệt mới cho phép
      playMusic(); // bấm "Mở thiệp" là phát nhạc luôn (trình duyệt chỉ cho phát khi khách đã bấm)
      window.scrollTo(0, 0);
      $(".cassette-lg", leader)?.classList.add("is-playing");
      leader.classList.remove("is-closing");
      leader.classList.add("is-opening");
      if (isGenZ()) {
        const r = $(".ls-note", leader).getBoundingClientRect();
        emojiBurst(r.left + r.width / 2, r.top + r.height / 2, ["💌", "💖", "💍", "✨", "🥹"], 14, { spread: 1.6, dist: 220 });
      }
      later(() => {
        leader.classList.add("is-gone"); // Gen Y: hai cánh mở; Gen Z: màn khoá trượt lên
        setLocked(false);
        syncThemeColor();
        if (!isGenZ()) firecrackers(); // Gen Y: cánh thiệp mở là pháo nổ
        if (motion) ScrollTrigger.refresh();
        later(() => { leader.hidden = true; }, T_MOVE);
        // Gen Z: mách khách mẹo thả tim (một lần)
        if (isGenZ() && !hinted) { hinted = true; later(() => toast("Chạm 2 lần vào màn hình để thả tim 💖"), T_MOVE + 600); }
      }, T_PREP);
    };
    let hinted = false;
    $("#play-btn").addEventListener("click", open);
    $("[data-open-invite]").addEventListener("click", open);

    // bấm logo H & T: đóng thiệp lại (hiệu ứng ngược)
    $("#back-to-cover").addEventListener("click", () => {
      if (!opened) return;
      opened = false;
      clearTimers();
      $(".cassette-lg", leader)?.classList.remove("is-playing");
      setLocked(true);
      // bắt đầu từ trạng thái "đang mở" rồi chạy ngược lại
      leader.classList.add("is-opening", "is-gone");
      leader.hidden = false;
      void leader.offsetWidth;
      leader.classList.add("is-closing");
      leader.classList.remove("is-gone");
      syncThemeColor();
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
      scrollToSection(target);
    });
    /** Cuộn tới một mục và bám theo nó: ảnh (lazyload) phía trên tải xong làm trang dài thêm, mục đích bị
     *  đẩy xuống -> tự cuộn tiếp tới đúng chỗ, không phải bấm lần hai. Khách tự cuộn/chạm thì dừng bám. */
    let follow = 0;
    function scrollToSection(target) {
      clearInterval(follow);
      const offset = ($(".topbar")?.offsetHeight || 0) - 1;
      const dest = () => Math.min(target.getBoundingClientRect().top + window.scrollY - offset,
        document.documentElement.scrollHeight - window.innerHeight);
      const behavior = reduceMotion ? "auto" : "smooth";
      let goal = dest(), t0 = performance.now(), still = 0, lastY = -1;
      window.scrollTo({ top: goal, behavior });
      const stop = () => { clearInterval(follow); ["wheel", "touchstart", "keydown"].forEach((ev) => window.removeEventListener(ev, stop)); };
      ["wheel", "touchstart", "keydown"].forEach((ev) => window.addEventListener(ev, stop, { passive: true }));
      const tick = () => {
        const now = dest();
        const stalled = window.scrollY === lastY && Math.abs(window.scrollY - now) > 2; // cuộn mượt bị ngắt giữa chừng
        if (Math.abs(now - goal) > 2 || stalled) { goal = now; window.scrollTo({ top: goal, behavior }); still = 0; }
        // dừng khi đã tới nơi và đứng yên một lúc, hoặc quá 4 giây
        still = Math.abs(window.scrollY - goal) < 3 && window.scrollY === lastY ? still + 1 : 0;
        lastY = window.scrollY;
        if (still > 6 || performance.now() - t0 > 8000) stop();
      };
      follow = setInterval(tick, 120); // setInterval: vẫn chạy khi trình duyệt hoãn requestAnimationFrame
    }
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
        <div class="il il-z il1-z"><span class="il-blob b1"></span><span class="il-blob b2"></span>${use("i-bloom", "il-bloom bl1")}${use("i-bloom", "il-bloom bl2")}</div>`,
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
    grid.dataset.n = Math.min(photos.length, 4); // ít ảnh thì ít cột cho cân
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
    setLocked(true);
    showLb(i);
    $(".lb-close", lb).focus();
  }
  function closeLightbox() {
    lb.hidden = true;
    setLocked(false);
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
      .fromTo(".hero-bike", { x: 0 }, { x: () => $("#hero").clientWidth * 0.75, duration: 0.7, ease: "none" }, 0)
      .fromTo("#hero-card", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.35 }, 1.0)
      .from("#hero-card > *", { opacity: 0, y: 14, stagger: 0.08, duration: 0.25 }, 1.1)
      .to({}, { duration: 0.3 });

    // 2. Lời ngỏ rõ dần từng chữ
    gsap.fromTo("#logline .w", { opacity: 0.28 }, {
      opacity: 1, stagger: 0.05, ease: "none",
      scrollTrigger: { trigger: "#logline", start: "top 92%", end: "bottom 75%", scrub: 0.4 }, // sáng sớm hơn, xong khi đoạn văn còn ở nửa dưới màn hình
    });

    // Ảnh nền trôi chậm khi cuộn
    $$(".sec-bg img").forEach((img) => gsap.fromTo(img, { yPercent: -8 }, {
      yPercent: 8, ease: "none",
      scrollTrigger: { trigger: img.closest("section, footer"), start: "top bottom", end: "bottom top", scrub: true },
    }));

    // Cô dâu & chú rể: ảnh zoom nhẹ về kích thước gốc khi cuộn tới (ảnh luôn có màu)
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

  /* ------------------------------------------------------ hiệu ứng riêng */
  const isGenZ = () => document.documentElement.dataset.theme === "modern";
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  /** Điện thoại: bấm mở thiệp thì vào toàn màn hình (ẩn thanh địa chỉ).
   *  iPhone chưa cho web làm việc này — khách "Thêm vào MH chính" thì mở toàn màn hình nhờ manifest. */
  function goFullscreen() {
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!coarse || !req || document.fullscreenElement || document.webkitFullscreenElement) return;
    try { req.call(el, { navigationUI: "hide" })?.catch?.(() => {}); } catch {}
  }

  /** Màu thanh trạng thái điện thoại theo màn đang xem */
  function syncThemeColor() {
    const meta = $('meta[name="theme-color"]');
    if (!meta) return;
    const onCover = !$("#leader").hidden && !$("#leader").classList.contains("is-gone");
    meta.content = onCover
      ? (isGenZ() ? "#efd9de" : "#a3121d")
      : getComputedStyle(document.documentElement).getPropertyValue("--paper").trim() || "#fbf4e6";
  }

  /** Gen Y: xác pháo đỏ (lẫn vài mảnh kim tuyến vàng, hồng) bay lả tả khắp màn hình */
  let fxCanvas = null, fxRaf = 0, bits = [];
  function firecrackers(n = 150) {
    if (reduceMotion) return;
    if (!fxCanvas) {
      fxCanvas = Object.assign(document.createElement("canvas"), { className: "fx-canvas" });
      fxCanvas.setAttribute("aria-hidden", "true");
      document.body.append(fxCanvas);
    }
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const vw = innerWidth, vh = innerHeight;
    if (!fxRaf) { fxCanvas.width = vw * dpr; fxCanvas.height = vh * dpr; }
    const ctx = fxCanvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const colors = ["#d8262f", "#d8262f", "#e8343c", "#b8161f", "#c8173a", "#ffd23f", "#f78fb3"];
    // nửa bắn tung từ hai góc dưới (như pháo nổ), nửa rơi từ trên xuống
    for (let i = 0; i < n; i++) {
      const fromSide = i % 2 === 0, left = i % 4 === 0;
      bits.push({
        x: fromSide ? (left ? -10 : vw + 10) : Math.random() * vw,
        y: fromSide ? vh * (0.55 + Math.random() * 0.3) : -20 - Math.random() * vh * 0.5,
        vx: fromSide ? (left ? 1 : -1) * (4 + Math.random() * 7) : (Math.random() - 0.5) * 1.5,
        vy: fromSide ? -(9 + Math.random() * 8) : 1.5 + Math.random() * 2,
        w: 5 + Math.random() * 6, h: 9 + Math.random() * 10,
        a: Math.random() * 6.3, va: (Math.random() - 0.5) * 0.25,
        f: Math.random() * 6.3, vf: 0.08 + Math.random() * 0.14, // lật mảnh giấy
        c: colors[(Math.random() * colors.length) | 0],
      });
    }
    if (fxRaf) return;
    const step = () => {
      ctx.clearRect(0, 0, vw, vh);
      bits = bits.filter((b) => b.y < vh + 30);
      for (const b of bits) {
        b.vx *= 0.985;
        b.vy = Math.min(b.vy + 0.18, 2.6 + b.w * 0.15); // trọng lực + sức cản của giấy
        b.x += b.vx + Math.sin(b.f) * 0.9;
        b.y += b.vy;
        b.a += b.va; b.f += b.vf;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.a);
        ctx.scale(1, Math.cos(b.f));
        ctx.fillStyle = b.c;
        ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
        ctx.restore();
      }
      if (bits.length) fxRaf = requestAnimationFrame(step);
      else { fxRaf = 0; ctx.clearRect(0, 0, vw, vh); }
    };
    fxRaf = requestAnimationFrame(step);
  }

  /** Gen Z: emoji bung ra từ một điểm (kiểu thả cảm xúc trên livestream) */
  function emojiBurst(x, y, list, n = 10, { spread = 1, dist = 160, dur = 1.6 } = {}) {
    if (reduceMotion) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = "fx-emoji";
      s.textContent = list[(Math.random() * list.length) | 0];
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * spread;
      const d = dist * (0.5 + Math.random() * 0.7);
      s.style.cssText = `left:${x}px;top:${y}px;--dx:${(Math.cos(ang) * d).toFixed(0)}px;--dy:${(Math.sin(ang) * d).toFixed(0)}px;` +
        `--r:${((Math.random() - 0.5) * 70).toFixed(0)}deg;--s:${(0.8 + Math.random() * 0.8).toFixed(2)};animation-delay:${(Math.random() * dur * 0.2).toFixed(2)}s;animation-duration:${dur}s`;
      s.addEventListener("animationend", () => s.remove());
      frag.append(s);
    }
    document.body.append(frag);
  }
  const emojiRain = (list, n = 26) => {
    for (let i = 0; i < n; i++) emojiBurst(Math.random() * innerWidth, innerHeight + 10, list, 1, { spread: 0.25, dist: innerHeight * 0.9, dur: 3.2 });
  };

  /** Gen Z: chạm 2 lần vào màn hình để thả tim (như Instagram) */
  function likeAt(x, y) {
    const h = document.createElement("span");
    h.className = "fx-like";
    h.innerHTML = icon("i-heart");
    h.style.cssText = `left:${x}px;top:${y}px`;
    h.addEventListener("animationend", () => h.remove());
    document.body.append(h);
    emojiBurst(x, y, ["💖", "💗", "✨", "🥰"], 7, { dist: 120 });
  }

  function setupFx() {
    // dây đèn nháy (Gen Y): bóng đèn treo theo đường võng của dây
    $$("[data-lights]").forEach((box) => {
      const n = 21, colors = ["#ff3b3b", "#ffd23f", "#3ddc6a", "#3aa0ff", "#ff7ac8"];
      box.innerHTML = Array.from({ length: n }, (_, i) => {
        const t = (i + 0.5) / n;
        return `<i style="--t:${t.toFixed(3)};--y:${(1 + 120 * t * (1 - t)).toFixed(1)}px;--c:${colors[i % colors.length]};--d:${(i % 3) * -0.4}s"></i>`;
      }).join("");
    });

    // dải chữ chạy (Gen Z): lặp 2 lần để chạy vòng liền mạch
    const dateTxt = W ? `${pad(W.d)}.${pad(W.m)}.${W.y}` : "";
    const words = [`${G} & ${B}`, "save the date", dateTxt, "chốt đơn ♡", "đi đám cưới thôi", "không gặp không về", "we said yes 💍"].filter(Boolean);
    const run = words.map((w) => `<span>${esc(w)}</span><b>✦</b>`).join("");
    $$("[data-ticker]").forEach((t) => (t.innerHTML = run + run));

    // lời ngỏ dạng tin nhắn (Gen Z): "đang nhập…" rồi mới hiện bong bóng chat
    const logline = $("#loi-dan");
    if (reduceMotion || !("IntersectionObserver" in window)) logline.classList.add("is-sent");
    else {
      const io = new IntersectionObserver(([en]) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        setTimeout(() => logline.classList.add("is-sent"), isGenZ() ? 700 : 0);
      }, { threshold: 0.15 });
      io.observe(logline);
    }

    // chạm 2 lần để thả tim (Gen Z)
    let last = 0, lx = 0, ly = 0;
    document.addEventListener("pointerup", (e) => {
      if (!isGenZ() || e.button > 0) return;
      if (e.target.closest("a, button, input, textarea, .lightbox, .leader, .topbar, .tabbar, .g-item")) return;
      if (e.timeStamp - last < 330 && Math.hypot(e.clientX - lx, e.clientY - ly) < 40) {
        likeAt(e.clientX, e.clientY);
        last = 0;
      } else { last = e.timeStamp; lx = e.clientX; ly = e.clientY; }
    });
    // máy tính: bấm đúp không bôi đen chữ ở Gen Z
    document.addEventListener("mousedown", (e) => { if (isGenZ() && e.detail > 1 && !e.target.closest("input, textarea")) e.preventDefault(); });

    // con trỏ để lại vệt lấp lánh (Gen Z, chỉ máy tính có chuột)
    if (!coarse && !reduceMotion) {
      let lastSpark = 0;
      document.addEventListener("pointermove", (e) => {
        if (!isGenZ() || e.pointerType !== "mouse" || e.timeStamp - lastSpark < 45) return;
        lastSpark = e.timeStamp;
        const s = document.createElement("span");
        s.className = "fx-spark";
        s.textContent = Math.random() < 0.7 ? "✦" : "♡";
        s.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;--dx:${((Math.random() - 0.5) * 30).toFixed(0)}px`;
        s.addEventListener("animationend", () => s.remove());
        document.body.append(s);
      }, { passive: true });
    }

    // tới lời kết: Gen Y nổ pháo, Gen Z mưa emoji (mỗi lần cuộn tới, cách nhau ít nhất 8 giây)
    const end = $(".the-end");
    if (end && "IntersectionObserver" in window) {
      let lastEnd = 0;
      new IntersectionObserver(([en]) => {
        if (!en.isIntersecting || Date.now() - lastEnd < 8000) return;
        lastEnd = Date.now();
        if (isGenZ()) emojiRain(["💖", "🥂", "✨", "🎉", "💍", "🫶"]);
        else firecrackers(120);
      }, { threshold: 0.6 }).observe(end);
    }

    document.addEventListener("themechange", syncThemeColor);
    syncThemeColor();
  }

  /* ------------------------------------------------------------- thẻ cào */
  /** Biến một canvas thành lớp phủ cào được. Cào khoảng một nửa (hoặc gọi hàm trả về) là mở.
   *  Gen Y: lớp bạc như vé số cào; Gen Z: lớp hologram. */
  function scratchable(cv, { label, onReveal }) {
    const ctx = cv.getContext("2d"), box = cv.parentElement;
    let revealed = false, drawn = 0, last = null, moves = 0;
    const reveal = (silent = false) => {
      if (revealed) return;
      revealed = true;
      box.classList.add("is-revealed");
      onReveal?.(cv, silent);
    };

    const paint = async () => {
      if (revealed) return;
      const w = cv.clientWidth, h = cv.clientHeight;
      if (!w || !h) return;
      try { await document.fonts.load(isGenZ() ? "700 20px 'Be Vietnam Pro'" : "800 20px 'Baloo 2'"); } catch {}
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = w * dpr; cv.height = h * dpr; drawn = w;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const text = label(isGenZ());
      const fit = (weight, family, max) => { let size = max; do { ctx.font = `${weight} ${size}px ${family}`; } while (ctx.measureText(text).width > w * 0.84 && --size > 9); };
      if (isGenZ()) {
        const g = ctx.createLinearGradient(0, 0, w, h);
        ["#f6b3c4", "#dcc6f5", "#bfe0f7", "#f8dcc0", "#f6b3c4"].forEach((c, i, arr) => g.addColorStop(i / (arr.length - 1), c));
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "rgba(255,255,255,.8)";
        for (let i = 0; i < 14; i++) { ctx.font = `${8 + ((i * 7) % 8)}px sans-serif`; ctx.fillText("✦", ((i * 97) % 100) / 100 * w, ((i * 61) % 100) / 100 * h); }
        fit(700, "'Be Vietnam Pro', sans-serif", Math.round(h * 0.4));
        ctx.fillStyle = "#fff"; ctx.shadowColor = "rgba(140,85,99,.45)"; ctx.shadowBlur = 8;
        ctx.fillText(text, w / 2, h / 2 + 1);
        ctx.shadowBlur = 0;
      } else {
        const g = ctx.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, "#b9b9b9"); g.addColorStop(0.45, "#efefef"); g.addColorStop(0.55, "#d6d6d6"); g.addColorStop(1, "#a4a4a4");
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 2;
        for (let x = -h; x < w; x += 8) { ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + h, 0); ctx.stroke(); }
        fit(800, "'Baloo 2', sans-serif", Math.round(h * 0.42));
        ctx.fillStyle = "#6a6a6a";
        ctx.fillText(text, w / 2, h / 2 + 2);
      }
    };

    /** phần trăm lớp phủ đã bị cào (lấy mẫu thưa cho nhẹ) */
    const cleared = () => {
      const { data } = ctx.getImageData(0, 0, cv.width, cv.height);
      let n = 0, t = 0;
      for (let i = 3; i < data.length; i += 4 * 16) { t++; if (data[i] < 40) n++; }
      return t ? n / t : 0;
    };
    const scratchTo = (e) => {
      const r = cv.getBoundingClientRect();
      const p = { x: e.clientX - r.left, y: e.clientY - r.top };
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "#000"; // nét xoá phải đặc (lớp bạc vẽ sọc bằng nét trắng mờ)
      ctx.lineCap = ctx.lineJoin = "round";
      ctx.lineWidth = Math.max(26, r.height * 0.6);
      ctx.beginPath();
      ctx.moveTo((last || p).x, (last || p).y);
      ctx.lineTo(p.x + 0.1, p.y);
      ctx.stroke();
      last = p;
      if (++moves % 6 === 0 && cleared() > 0.45) reveal();
    };
    cv.addEventListener("pointerdown", (e) => { if (revealed) return; try { cv.setPointerCapture(e.pointerId); } catch {} last = null; scratchTo(e); });
    cv.addEventListener("pointermove", (e) => { if (last && !revealed) scratchTo(e); });
    ["pointerup", "pointercancel"].forEach((t) => cv.addEventListener(t, () => {
      last = null;
      if (!revealed && cleared() > 0.45) reveal();
    }));

    document.addEventListener("themechange", paint);
    window.addEventListener("resize", () => { if (cv.clientWidth !== drawn) paint(); });
    paint();
    return reveal;
  }

  /** Mừng cưới: cào dải phủ để lộ số tài khoản (nút "Sao chép" vẫn chép được ngay, không cần cào) */
  function setupScratch() {
    $$(".gift-item").forEach((item) => {
      const cv = $(".sc-cover", item);
      if (!cv) return;
      item._reveal = scratchable(cv, {
        label: (z) => (z ? "cào để lộ số ✨" : "CÀO ĐỂ XEM SỐ TÀI KHOẢN"),
        onReveal: (c, silent) => {
          item.classList.add("is-revealed");
          if (silent) return;
          navigator.vibrate?.([30, 40, 70]);
          const r = c.getBoundingClientRect();
          if (isGenZ()) emojiBurst(r.left + r.width / 2, r.top + r.height / 2, ["💸", "💖", "✨", "🥂", "💍"], 14, { spread: 1.8, dist: 180 });
          else firecrackers(100);
        },
      });
    });
  }

  /* ------------------------------------------------------------ photobooth */
  /** Chụp ảnh (hoặc chọn ảnh) rồi gắn khung thiệp theo phong cách đang xem. Mọi thứ xử lý trên máy khách. */
  function setupBooth() {
    const pb = $("#pb"), view = $("#pb-canvas"), vctx = view.getContext("2d");
    const video = $("#pb-video"), result = $("#pb-result"), msg = $("#pb-msg");
    const FW = 1080, FH = 1440; // kích thước ảnh xuất (3:4)
    let stream = null, facing = "user", raf = 0, busy = false;
    let src = null, mirror = false;  // ảnh nguồn đang dùng (ảnh chụp / ảnh chọn)
    let coverImg = null;              // ảnh bìa để xem trước khung khi chưa chụp
    let layers = null, noSvg = false, blob = null, blobUrl = "";

    const say = (t = "") => (msg.textContent = t);
    const setState = (s) => {
      pb.dataset.state = s;
      $$("[data-in]", pb).forEach((b) => (b.hidden = !b.dataset.in.split(" ").includes(s)));
      const share = $('[data-pb="share"]', pb);
      share.hidden = s !== "done" || !navigator.canShare?.({ files: [new File([""], "a.jpg", { type: "image/jpeg" })] });
      result.hidden = s !== "done";
      view.hidden = s === "done";
    };

    /* ---- vẽ ---- */
    const rr = (c, x, y, w, h, r) => {
      c.beginPath();
      c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
    };
    const canvasOf = (w, h) => Object.assign(document.createElement("canvas"), { width: w, height: h });
    const svgImg = (id, color = "") => new Promise((res) => {
      const sym = $("#" + id);
      if (!sym || noSvg) return res(null);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${sym.getAttribute("viewBox")}" style="color:${color}"><defs>${$("#dove")?.outerHTML || ""}</defs>${sym.innerHTML}</svg>`;
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = () => res(null);
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    });
    const dateDots = W ? `${pad(W.d)}.${pad(W.m)}.${W.y}` : "";
    // ô ảnh trong khung theo từng phong cách
    const BOX = { y: { x: 86, y: 196, w: 908, h: 930, r: 6 }, z: { x: 80, y: 80, w: 920, h: 1080, r: 56 } };

    /** Dựng 2 lớp tĩnh của khung (nền dưới ảnh, trang trí đè lên ảnh) — chỉ dựng lại khi đổi phong cách */
    async function buildLayers() {
      const z = isGenZ();
      try {
        await Promise.all(["800 40px 'Baloo 2'", "700 40px 'Baloo 2'", "40px VT323", "italic 300 40px 'Cormorant Garamond'", "500 40px 'Be Vietnam Pro'", "600 40px 'Be Vietnam Pro'"].map((f) => document.fonts.load(f)));
      } catch {}
      const under = canvasOf(FW, FH), over = canvasOf(FW, FH);
      const u = under.getContext("2d"), o = over.getContext("2d");
      [u, o].forEach((c) => { c.textAlign = "center"; c.textBaseline = "alphabetic"; });
      const b = BOX[z ? "z" : "y"];
      const who = `${G} & ${B}`;

      if (!z) {
        const [doves, palm] = await Promise.all([svgImg("i-doves"), svgImg("i-palm")]);
        // nền thiệp đỏ, chữ Song Hỷ mờ, viền đôi vàng
        const g = u.createRadialGradient(FW / 2, FH * 0.45, 100, FW / 2, FH * 0.45, FH * 0.8);
        g.addColorStop(0, "#c8202c"); g.addColorStop(0.7, "#a3121d"); g.addColorStop(1, "#8a0f18");
        u.fillStyle = g; u.fillRect(0, 0, FW, FH);
        u.fillStyle = "rgba(255,210,63,.09)"; u.font = "700 980px serif"; u.fillText("囍", FW / 2, FH * 0.78);
        u.strokeStyle = "rgba(255,210,63,.8)"; u.lineWidth = 5; u.strokeRect(28, 28, FW - 56, FH - 56);
        u.lineWidth = 2; u.strokeRect(42, 42, FW - 84, FH - 84);
        if (palm) {
          u.save(); u.translate(40, 20); u.rotate(-0.12); u.drawImage(palm, -60, -30, 330, 300); u.restore();
          u.save(); u.translate(FW - 40, 20); u.scale(-1, 1); u.rotate(-0.12); u.drawImage(palm, -60, -30, 330, 300); u.restore();
        }
        // viền trắng quanh ảnh như ảnh rửa
        u.fillStyle = "#fffdf8"; u.shadowColor = "rgba(0,0,0,.4)"; u.shadowBlur = 30; u.shadowOffsetY = 10;
        u.fillRect(b.x - 18, b.y - 18, b.w + 36, b.h + 36);
        u.shadowColor = "transparent";
        // chữ cắt dán "VUI TÂN HÔN"
        o.font = "800 112px 'Baloo 2', sans-serif"; o.lineJoin = "round";
        o.fillStyle = "rgba(0,0,0,.3)"; o.fillText("VUI TÂN HÔN", FW / 2 + 5, 158);
        o.strokeStyle = "#fff"; o.lineWidth = 14; o.strokeText("VUI TÂN HÔN", FW / 2, 152);
        o.fillStyle = "#d8262f"; o.fillText("VUI TÂN HÔN", FW / 2, 152);
        // dấu ngày màu cam kiểu máy ảnh phim
        if (STAMP) {
          o.save(); o.textAlign = "right"; o.font = "64px VT323, monospace";
          o.shadowColor = "rgba(255,120,40,.95)"; o.shadowBlur = 14; o.fillStyle = "#ff9a4d";
          o.fillText(STAMP, b.x + b.w - 30, b.y + b.h - 30); o.restore();
        }
        if (doves) o.drawImage(doves, FW / 2 - 150, b.y + b.h - 120, 300, 172);
        // tên, ngày, khách
        o.font = "800 118px 'Baloo 2', sans-serif";
        o.fillStyle = "rgba(0,0,0,.3)"; o.fillText(`${G} ♥ ${B}`, FW / 2 + 5, 1290);
        o.fillStyle = "#ffd23f"; o.fillText(`${G} ♥ ${B}`, FW / 2, 1284);
        o.font = "700 52px 'Baloo 2', sans-serif"; o.fillStyle = "#fff";
        o.fillText(W ? `${pad(W.d)} - ${pad(W.m)} - ${W.y}` : "", FW / 2, 1352);
        o.font = "600 34px 'Be Vietnam Pro', sans-serif"; o.fillStyle = "#fbe7c0";
        o.fillText(GUEST ? `Kỷ niệm ngày vui · có mặt: ${GUEST}` : "Kỷ niệm ngày vui của chúng mình", FW / 2, 1404);
      } else {
        const bloom = await svgImg("i-bloom", "#a86f7d");
        // nền pastel với các mảng màu mờ
        const g = u.createLinearGradient(0, 0, FW, FH);
        g.addColorStop(0, "#fde8ee"); g.addColorStop(0.5, "#efe0f5"); g.addColorStop(1, "#fbe6d4");
        u.fillStyle = g; u.fillRect(0, 0, FW, FH);
        [[120, 1300, 420, "rgba(243,166,184,.55)"], [980, 1250, 380, "rgba(220,198,245,.6)"], [900, 120, 320, "rgba(248,220,192,.6)"]].forEach(([x, y, r, c]) => {
          const rg = u.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, c); rg.addColorStop(1, "rgba(255,255,255,0)");
          u.fillStyle = rg; u.fillRect(0, 0, FW, FH);
        });
        if (bloom) { u.globalAlpha = 0.7; u.drawImage(bloom, 6, 1150, 120, 260); u.drawImage(bloom, FW - 110, 1180, 100, 216); u.globalAlpha = 1; }
        u.fillStyle = "#fff"; u.shadowColor = "rgba(61,52,53,.3)"; u.shadowBlur = 40; u.shadowOffsetY = 16;
        rr(u, b.x - 14, b.y - 14, b.w + 28, b.h + 28, b.r + 12); u.fill();
        u.shadowColor = "transparent";
        // sticker
        const pill = (text, x, y, rot, bg, fg, size = 40) => {
          o.save(); o.translate(x, y); o.rotate(rot);
          o.font = `600 ${size}px 'Be Vietnam Pro', sans-serif`;
          const w = o.measureText(text).width + size * 1.3, h = size * 1.75;
          o.shadowColor = "rgba(61,52,53,.35)"; o.shadowBlur = 24; o.shadowOffsetY = 10;
          o.fillStyle = bg; rr(o, -w / 2, -h / 2, w, h, h / 2); o.fill();
          o.shadowColor = "transparent"; o.fillStyle = fg; o.textBaseline = "middle"; o.fillText(text, 0, 2);
          o.restore();
        };
        pill("save the date ✦", 250, 150, -0.16, "#8c5563", "#fff");
        pill("chốt đơn ♡", 830, 1110, 0.1, "#f1e2e2", "#8c5563", 38);
        if (W) {
          o.save(); o.translate(905, 175); o.rotate(0.2);
          o.shadowColor = "rgba(61,52,53,.35)"; o.shadowBlur = 24; o.shadowOffsetY = 10;
          o.fillStyle = "#fff"; o.beginPath(); o.arc(0, 0, 105, 0, Math.PI * 2); o.fill();
          o.shadowColor = "transparent"; o.setLineDash([8, 7]); o.strokeStyle = "#a86f7d"; o.lineWidth = 3;
          o.beginPath(); o.arc(0, 0, 92, 0, Math.PI * 2); o.stroke();
          o.fillStyle = "#3d3435"; o.textBaseline = "middle"; o.font = "400 50px 'Cormorant Garamond', serif";
          o.fillText(`${pad(W.d)}.${pad(W.m)}.${String(W.y).slice(2)}`, 0, 2);
          o.restore();
        }
        o.font = "110px sans-serif"; o.fillText("💍", 150, 1150);
        // tên chữ hologram, ngày, khách
        o.font = "italic 300 128px 'Cormorant Garamond', serif";
        const tg = o.createLinearGradient(FW / 2 - 380, 0, FW / 2 + 380, 0);
        tg.addColorStop(0, "#e8668f"); tg.addColorStop(0.5, "#a985e6"); tg.addColorStop(1, "#f0a35e");
        o.fillStyle = tg; o.fillText(who, FW / 2, 1284);
        o.font = "500 36px 'Be Vietnam Pro', sans-serif"; o.fillStyle = "#847876";
        o.fillText(`${dateDots} · we said yes 💍`, FW / 2, 1370);
        if (GUEST) { o.font = "600 34px 'Be Vietnam Pro', sans-serif"; o.fillStyle = "#8c5563"; o.fillText(`ft. ${GUEST} ✨`, FW / 2, 1418); }
      }
      layers = { under, over, box: b, z };
    }

    /** Vẽ ảnh nguồn vào ô ảnh (cắt vừa khung, lật như gương nếu là camera trước) */
    function compose(c, scale, source, flip) {
      const { under, over, box: b, z } = layers;
      c.save();
      c.scale(scale, scale);
      c.drawImage(under, 0, 0);
      c.save();
      rr(c, b.x, b.y, b.w, b.h, b.r); c.clip();
      const sw = source?.videoWidth || source?.naturalWidth || source?.width || 0;
      const sh = source?.videoHeight || source?.naturalHeight || source?.height || 0;
      if (sw && sh) {
        const k = Math.max(b.w / sw, b.h / sh), dw = sw * k, dh = sh * k;
        if (flip) { c.translate(b.x * 2 + b.w, 0); c.scale(-1, 1); }
        // ảnh dọc bị cắt bớt chiều cao: giữ phần trên (đầu, mặt) thay vì cắt đều hai đầu
        c.drawImage(source, b.x + (b.w - dw) / 2, b.y + (b.h - dh) * 0.15, dw, dh);
        c.setTransform(scale, 0, 0, scale, 0, 0);
        // Gen Y: màu phim ấm, hơi phai
        if (!z) { c.fillStyle = "rgba(255,160,80,.16)"; c.globalCompositeOperation = "soft-light"; c.fillRect(b.x, b.y, b.w, b.h); c.globalCompositeOperation = "source-over"; c.fillStyle = "rgba(255,244,225,.07)"; c.fillRect(b.x, b.y, b.w, b.h); }
      } else {
        c.fillStyle = z ? "#f1e2e2" : "#efe2c8"; c.fillRect(b.x, b.y, b.w, b.h);
        c.fillStyle = z ? "#a86f7d" : "#1c3f94"; c.font = "600 44px 'Be Vietnam Pro', sans-serif"; c.textAlign = "center";
        c.fillText("Ảnh của bạn ở đây 📸", b.x + b.w / 2, b.y + b.h / 2);
      }
      c.restore();
      c.drawImage(over, 0, 0);
      c.restore();
    }
    const preview = () => { if (layers) compose(vctx, view.width / FW, src || coverImg, src ? mirror : false); };

    /* ---- camera ---- */
    const stopCam = () => {
      cancelAnimationFrame(raf); raf = 0;
      stream?.getTracks().forEach((t) => t.stop());
      stream = null;
      video.srcObject = null;
    };
    const loop = () => { if (layers && video.readyState >= 2) compose(vctx, view.width / FW, video, mirror); raf = requestAnimationFrame(loop); };
    async function startCam() {
      if (!navigator.mediaDevices?.getUserMedia) return say("Trình duyệt này chưa cho dùng camera — bạn bấm “Chọn ảnh có sẵn” nhé.");
      say("Đang mở camera…");
      stopCam();
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1440 }, height: { ideal: 1920 } }, audio: false });
      } catch (err) {
        setState("idle");
        return say(err?.name === "NotAllowedError" ? "Bạn chưa cho phép dùng camera. Bật lại quyền camera cho trang này, hoặc bấm “Chọn ảnh có sẵn”." : "Không mở được camera — bạn bấm “Chọn ảnh có sẵn” nhé.");
      }
      video.srcObject = stream;
      await video.play().catch(() => {});
      mirror = facing === "user";
      say("");
      setState("live");
      loop();
    }

    /* ---- xuất ảnh ---- */
    async function render() {
      const out = canvasOf(FW, FH);
      compose(out.getContext("2d"), 1, src, mirror);
      try {
        blob = await new Promise((res, rej) => out.toBlob((b) => (b ? res(b) : rej(new Error("blob"))), "image/jpeg", 0.92));
      } catch (e) {
        // vài trình duyệt chặn xuất ảnh khi khung có hình SVG — dựng lại khung không có SVG rồi thử lại
        if (noSvg) throw e;
        noSvg = true;
        await buildLayers();
        return render();
      }
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      blobUrl = URL.createObjectURL(blob);
      result.src = blobUrl;
      setState("done");
    }
    const flash = () => { const f = $("#pb-flash"); f.classList.remove("go"); void f.offsetWidth; f.classList.add("go"); };

    async function shoot() {
      if (busy || !stream) return;
      busy = true;
      const cnt = $("#pb-count");
      for (const n of reduceMotion ? [] : [3, 2, 1]) {
        cnt.textContent = n; cnt.classList.remove("pop"); void cnt.offsetWidth; cnt.classList.add("pop");
        await new Promise((r) => setTimeout(r, 800));
      }
      cnt.textContent = "";
      // giữ lại khung hình vừa chụp để đổi khung (Gen Y/Gen Z) vẫn dùng được
      const snap = canvasOf(video.videoWidth, video.videoHeight);
      snap.getContext("2d").drawImage(video, 0, 0);
      src = snap;
      flash();
      navigator.vibrate?.(40);
      stopCam();
      try { await render(); } catch { say("Chưa lưu được ảnh, bạn thử lại nhé."); setState("idle"); }
      busy = false;
      const r = result.getBoundingClientRect();
      if (isGenZ()) emojiBurst(r.left + r.width / 2, r.top + r.height / 3, ["📸", "✨", "💖", "🥰"], 12);
    }

    $("#pb-file").addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      stopCam();
      const img = new Image();
      img.onload = async () => {
        src = img; mirror = false;
        try { await render(); say(""); } catch { say("Chưa lưu được ảnh, bạn thử ảnh khác nhé."); }
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => say("Không đọc được ảnh này (ảnh HEIC của iPhone cần chọn dạng JPG).");
      img.src = URL.createObjectURL(file);
    });

    pb.addEventListener("click", async (e) => {
      const act = e.target.closest("[data-pb]")?.dataset.pb;
      if (act === "start") startCam();
      else if (act === "shoot") shoot();
      else if (act === "flip") { facing = facing === "user" ? "environment" : "user"; startCam(); }
      else if (act === "again") startCam();
      else if (act === "save" && blobUrl) {
        const a = Object.assign(document.createElement("a"), { href: blobUrl, download: `${G}-${B}-photobooth.jpg`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/\s+/g, "-") });
        document.body.append(a); a.click(); a.remove();
        toast("Đã lưu ảnh 📸");
      } else if (act === "share" && blob) {
        try { await navigator.share({ files: [new File([blob], "photobooth.jpg", { type: "image/jpeg" })], title: `${G} & ${B}` }); } catch {}
      }
    });

    // tắt camera khi cuộn đi chỗ khác hoặc chuyển ứng dụng
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([en]) => { if (!en.isIntersecting && stream) { stopCam(); setState(src ? "done" : "idle"); if (!src) preview(); } }).observe(pb);
    }
    document.addEventListener("visibilitychange", () => { if (document.hidden && stream) { stopCam(); setState(src ? "done" : "idle"); } });

    // đổi phong cách: dựng lại khung; nếu đã có ảnh thì xuất lại ảnh với khung mới
    document.addEventListener("themechange", async () => {
      await buildLayers();
      if (pb.dataset.state === "done" && src) render().catch(() => {});
      else if (!stream) preview();
    });

    setState("idle");
    // xem trước khung bằng ảnh bìa của cô dâu chú rể
    const P = C.photos || {};
    const coverName = P.cover || (P.album || [])[0];
    buildLayers().then(() => {
      preview();
      if (!coverName) return;
      const img = new Image();
      img.onload = () => { coverImg = img; if (pb.dataset.state === "idle") preview(); };
      img.src = PHOTO_DIR + String(coverName).split("/").map(encodeURIComponent).join("/");
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

  /* ------------------------------------------------- xem được khi mạng yếu */
  /** Đăng ký service worker (chỉ khi thiệp chạy trên mạng, không phải mở file trên máy) rồi nhờ nó
   *  lưu ngay những gì trang vừa tải — lần mở sau, đến nơi mất sóng vẫn xem được địa chỉ, số điện thoại. */
  function setupOffline() {
    if (!("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js")
        .then(() => navigator.serviceWorker.ready)
        .then((reg) => {
          const urls = performance.getEntriesByType("resource").map((r) => r.name);
          reg.active?.postMessage({ type: "cache", urls: [location.href.split("#")[0], ...urls] });
        })
        .catch(() => {});
    });
  }

  /* ------------------------------------------------------------------- init */
  /** Mỗi lần bấm "Mở thiệp" đều hỏi khách bên nào (chọn nhầm thì lần sau chọn lại). Không lưu lựa chọn.
   *  Chọn đúng bên đang xem: mở luôn. Chọn bên khác / cả hai: tải lại trang theo lựa chọn rồi tự mở thiệp. */
  function setupSidePick() {
    const ask = $("#side-ask");
    if (!ask) return;
    let pass = false; // lần bấm do chính hộp hỏi gọi lại -> cho mở thiệp
    const cur = SIDE || "ca";
    $$("[data-side-ans]", ask).forEach((b) => b.classList.toggle("is-current", b.dataset.sideAns === cur && !!SIDE));
    ["#play-btn", "[data-open-invite]"].forEach((sel) => $(sel)?.addEventListener("click", (e) => {
      if (pass) return;
      e.stopImmediatePropagation();
      ask.hidden = false;
      requestAnimationFrame(() => ask.classList.add("is-in"));
    }, true));
    const close = () => { ask.classList.remove("is-in"); setTimeout(() => (ask.hidden = true), 250); };
    ask.addEventListener("click", (e) => {
      if (e.target === ask) return close(); // chạm ra ngoài: đóng, chưa mở thiệp
      const b = e.target.closest("[data-side-ans]");
      if (!b) return;
      const v = b.dataset.sideAns;
      if (v === cur) { // giữ nguyên bên đang xem -> mở thiệp ngay (nhạc phát được vì đang trong lúc bấm)
        close(); pass = true; $("#play-btn").click(); pass = false;
        return;
      }
      try { sessionStorage.setItem("thiep-autoopen", "1"); } catch {}
      const url = new URL(location.href);
      if (v === "ca") url.searchParams.delete("ben"); else url.searchParams.set("ben", v);
      location.replace(url);
    });
    setupSidePick.open = () => { pass = true; $("#play-btn").click(); pass = false; };
  }
  /** Vừa chọn bên xong (trang tải lại): mở thiệp luôn; nhạc bật ở lần chạm/cuộn đầu tiên (trình duyệt chặn tự phát) */
  function autoOpenAfterPick() {
    let flag = "";
    try { flag = sessionStorage.getItem("thiep-autoopen"); sessionStorage.removeItem("thiep-autoopen"); } catch {}
    if (!flag) return;
    setupSidePick.open();
    const kick = () => { playMusic(); ["pointerdown", "touchstart", "keydown", "wheel"].forEach((ev) => removeEventListener(ev, kick)); };
    ["pointerdown", "touchstart", "keydown", "wheel"].forEach((ev) => addEventListener(ev, kick, { passive: true }));
  }

  async function init() {
    setupSidePick();
    setupTheme();
    bindTexts();
    buildHeroTitle();
    splitLogline();
    renderNotes();
    startCountdown();
    renderShows();
    renderGift();
    renderCredits();
    applyPhase();
    cutout();
    setupMusic();
    setupBeat();
    setupScroll();
    setupLightbox();
    runLeader();
    autoOpenAfterPick();
    setupFx();
    setupOffline();
    setupScratch();
    setupBooth();
    await loadPhotos();
    setupMotion();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
