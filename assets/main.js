/* ===================== ALTA RUNA – общий скрипт ===================== */
(function () {
  const CFG = window.ALTA_CONFIG || {};
  const PRODUCTS = window.ALTA_PRODUCTS || [];
  const ARTICLES = (window.ALTA_ARTICLES || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));

  const RUNE_NAMES = ["Феху","Уруз","Турисаз","Ансуз","Райдо","Кеназ","Гебо","Вуньо","Хагалаз","Наутиз","Иса","Йера","Эйваз","Перт","Альгиз","Соулу","Тейваз","Беркана","Эваз","Манназ","Лагуз","Ингуз","Дагаз","Отала"];
  const AETTS = ["Атт Фрейи", "Атт Хеймдалля", "Атт Тюра"];
  const FUTHARK = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ".split("");
  const PRODUCT_CATS = { jewelry: "Украшения", tarot: "Карты таро" };
  const ARTICLE_CATS = { runes: "Руны", stones: "Камни", tarot: "Таро" };
  const MONTHS = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtPrice = (n) => Number(n).toLocaleString("ru-RU");
  const fmtDate = (d) => { const [y, m, day] = d.split("-").map(Number); return `${day} ${MONTHS[m - 1]} ${y}`; };
  const page = document.body.dataset.page || "";

  /* ---------- Header & footer ---------- */
  function renderHeader() {
    const el = $("#site-header");
    if (!el) return;
    const dark = el.hasAttribute("data-dark");
    const link = (href, text, key) => `<a href="${href}" class="${page === key ? "active" : ""}">${text}</a>`;
    el.className = "header" + (dark ? " on-dark" : "");
    el.innerHTML = `
      <div class="wrap header__in">
        <a href="index.html" class="logo">Alta <span class="rune">ᚱ</span> Runa</a>
        <nav class="nav" id="nav">
          ${link("index.html", "Главная", "home")}
          ${link("shop.html", "Купить", "shop")}
          ${link("guide.html", "Гайд по рунам", "guide")}
          ${link("articles.html", "Статьи", "articles")}
          ${link("index.html#about", "О бренде", "about")}
          <a href="${esc(CFG.AVITO_URL)}" target="_blank" rel="noopener" class="btn btn--accent btn--sm">Мы на Авито</a>
        </nav>
        <button class="burger" id="burger" aria-label="Меню"><span></span><span></span><span></span></button>
      </div>`;
    const burger = $("#burger"), nav = $("#nav");
    burger.addEventListener("click", () => { burger.classList.toggle("open"); nav.classList.toggle("open"); });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => { burger.classList.remove("open"); nav.classList.remove("open"); }));
  }

  function renderFooter() {
    const el = $("#site-footer");
    if (!el) return;
    const social = [
      CFG.TELEGRAM_URL && `<li><a href="${esc(CFG.TELEGRAM_URL)}" target="_blank" rel="noopener">Telegram</a></li>`,
      CFG.INSTAGRAM_URL && `<li><a href="${esc(CFG.INSTAGRAM_URL)}" target="_blank" rel="noopener">Instagram</a></li>`,
      CFG.AVITO_URL && `<li><a href="${esc(CFG.AVITO_URL)}" target="_blank" rel="noopener">Авито</a></li>`
    ].filter(Boolean).join("");
    el.className = "footer";
    el.innerHTML = `
      <div class="wrap">
        <div class="footer__top">
          <div>
            <a href="index.html" class="logo">Alta <span class="rune">ᚱ</span> Runa</a>
            <p>Украшения ручной работы с рунами и натуральными камнями. Карты таро для тех, кто ищет свой язык символов.</p>
          </div>
          <div>
            <h4>Разделы</h4>
            <ul>
              <li><a href="shop.html">Купить</a></li>
              <li><a href="shop.html#jewelry">Украшения</a></li>
              <li><a href="shop.html#tarot">Карты таро</a></li>
              <li><a href="guide.html">Гайд по рунам</a></li>
              <li><a href="articles.html">Статьи</a></li>
            </ul>
          </div>
          <div>
            <h4>Мы на связи</h4>
            <ul>${social}</ul>
          </div>
        </div>
        <div class="footer__bot">
          <span>© ${new Date().getFullYear()} Alta Runa. Все украшения сделаны вручную.</span>
          <span class="rune">ᚨᛚᛏᚨ ᚱᚢᚾᚨ</span>
        </div>
      </div>`;
  }

  /* ---------- Cards ---------- */
  function media(item, symbol, imgField) {
    const img = item[imgField];
    if (img) return `<img src="${esc(img)}" alt="${esc(item.title)}" loading="lazy">`;
    return `<div class="art tone-${esc(item.tone || "plum")}"><span class="art__sym">${esc(symbol)}</span></div>`;
  }

  function productCard(p) {
    const href = p.link || CFG.AVITO_URL || "#";
    const page = `product.html?id=${encodeURIComponent(p.id)}`;
    return `
      <article class="card reveal">
        <a href="${page}" class="card__media">
          ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}
          ${media(p, p.rune, "image")}
        </a>
        <div class="card__body">
          <div class="card__meta">${esc(PRODUCT_CATS[p.category] || "")}${p.stone ? " · " + esc(p.stone) : ""}</div>
          <h3 class="card__title"><a href="${page}">${esc(p.title)}</a></h3>
          <p class="card__desc">${esc(p.description)}</p>
          <div class="card__foot">
            <span class="price">${fmtPrice(p.price)} <small>₽</small></span>
            <a href="${esc(href)}" target="_blank" rel="noopener" class="btn btn--accent btn--sm">Купить</a>
          </div>
        </div>
      </article>`;
  }

  function product() {
    const id = new URLSearchParams(location.search).get("id");
    const p = PRODUCTS.find((x) => x.id === id);
    const root = $("#product");
    if (!p) {
      root.innerHTML = `<div class="wrap page-title"><h1>Товар не найден</h1><p>Загляните в <a class="link-arrow" href="shop.html">каталог</a>.</p></div>`;
      return;
    }
    document.title = `${p.title} – Alta Runa`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", p.description);
    const imgs = (p.images && p.images.length) ? p.images : (p.image ? [p.image] : []);
    const href = p.link || CFG.AVITO_URL || "#";
    const main = imgs.length
      ? `<img src="${esc(imgs[0])}" alt="${esc(p.title)}" id="pmain">`
      : `<div class="art tone-${esc(p.tone || "plum")}"><span class="art__sym">${esc(p.rune)}</span></div>`;
    const thumbs = imgs.length > 1
      ? `<div class="pthumbs">${imgs.map((src, i) => `<button class="pthumb${i === 0 ? " active" : ""}" data-src="${esc(src)}"><img src="${esc(src)}" alt=""></button>`).join("")}</div>` : "";
    const details = (p.details || []).map((d, i) =>
      `<details class="pdetail"${i === 0 ? " open" : ""}><summary>${esc(d.title)}</summary><p>${esc(d.text)}</p></details>`).join("");
    root.innerHTML = `
      <div class="wrap product">
        <a href="shop.html" class="back">← Каталог</a>
        <div class="product__grid">
          <div class="pgallery">
            <div class="pmain">${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}${main}</div>
            ${thumbs}
          </div>
          <div class="pinfo">
            <div class="card__meta">${esc(PRODUCT_CATS[p.category] || "")}${p.stone ? " · " + esc(p.stone) : ""}</div>
            <h1>${esc(p.title)}</h1>
            <div class="pprice">${fmtPrice(p.price)} <small>₽</small></div>
            <p class="plead">${esc(p.description)}</p>
            <div class="pbuy">
              <a href="${esc(href)}" target="_blank" rel="noopener" class="btn btn--accent">Купить на Авито</a>
            </div>
            <div class="pfacts">
              <div><span class="rune">${esc(p.rune)}</span><small>Руна</small></div>
              <div><span>◇</span><small>${esc(p.stone || "")}</small></div>
              <div><span>✦</span><small>Ручная работа</small></div>
            </div>
            <div class="pdetails">${details}</div>
          </div>
        </div>
      </div>`;
    root.querySelectorAll(".pthumb").forEach((b) => b.addEventListener("click", () => {
      $("#pmain").src = b.dataset.src;
      root.querySelectorAll(".pthumb").forEach((x) => x.classList.toggle("active", x === b));
    }));
    const rel = $("#related");
    if (rel) rel.innerHTML = PRODUCTS.filter((x) => x.id !== p.id).sort((a, b) => (b.category === p.category) - (a.category === p.category)).slice(0, 3).map(productCard).join("");
  }

  function articleCard(a) {
    return `
      <a href="article.html?id=${encodeURIComponent(a.id)}" class="a-card reveal">
        <div class="a-card__cover">${media(a, a.symbol, "cover")}</div>
        <div class="a-card__meta"><b>${esc(ARTICLE_CATS[a.category] || "")}</b><span>${fmtDate(a.date)}</span><span>${a.readTime} мин</span></div>
        <h3>${esc(a.title)}</h3>
        <p>${esc(a.excerpt)}</p>
      </a>`;
  }

  /* ---------- Filters (shop & articles) ---------- */
  function setupFilter(listEl, filtersEl, items, cats, cardFn) {
    const valid = ["all", ...Object.keys(cats)];
    const draw = (cat) => {
      const list = cat === "all" ? items : items.filter((i) => i.category === cat);
      listEl.innerHTML = list.length ? list.map(cardFn).join("") : `<p class="empty">Здесь пока пусто – скоро появится.</p>`;
      filtersEl.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c.dataset.cat === cat));
      observe();
    };
    filtersEl.innerHTML = `<button class="chip" data-cat="all">Все</button>` +
      Object.entries(cats).map(([k, v]) => `<button class="chip" data-cat="${k}">${v}</button>`).join("");
    filtersEl.addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;
      history.replaceState(null, "", b.dataset.cat === "all" ? location.pathname : "#" + b.dataset.cat);
      draw(b.dataset.cat);
    });
    const fromHash = () => { const h = location.hash.slice(1); draw(valid.includes(h) ? h : "all"); };
    window.addEventListener("hashchange", fromHash);
    fromHash();
  }

  /* ---------- Pages ---------- */
  function home() {
    const track = $("#ring-track");
    if (track) {
      // 24 руны Старшего Футарка по окружности
      track.innerHTML = FUTHARK.map((r, i) => {
        const ang = (2 * Math.PI / FUTHARK.length) * i - Math.PI / 2;
        const x = 50 + Math.cos(ang) * 47, y = 50 + Math.sin(ang) * 47;
        return `<span style="left:${x}%;top:${y}%;transform:translate(-50%,-50%) rotate(${ang + Math.PI / 2}rad)">${r}</span>`;
      }).join("");
    }
    const mq = $("#marquee");
    if (mq) {
      const words = ["Ручная работа", "Натуральные камни", "Старший Футарк", "Карты таро", "Украшения со смыслом"];
      const chunk = words.map((w, i) => `<span>${w}</span><span class="rune">${FUTHARK[(i * 5) % 24]}</span>`).join("");
      mq.innerHTML = chunk + chunk + chunk + chunk;
    }
    const fp = $("#featured-products");
    if (fp) fp.innerHTML = PRODUCTS.slice(0, 3).map(productCard).join("");
    const la = $("#latest-articles");
    if (la) la.innerHTML = ARTICLES.slice(0, 3).map(articleCard).join("");
    const tg = $("#cta-telegram");
    if (tg) { if (CFG.TELEGRAM_URL) tg.href = CFG.TELEGRAM_URL; else tg.closest("section").remove(); }
    document.querySelectorAll("[data-avito]").forEach((a) => (a.href = CFG.AVITO_URL || "#"));
  }

  function shop() {
    setupFilter($("#products"), $("#filters"), PRODUCTS, PRODUCT_CATS, productCard);
  }

  function articles() {
    setupFilter($("#articles"), $("#filters"), ARTICLES, ARTICLE_CATS, articleCard);
  }

  function article() {
    const id = new URLSearchParams(location.search).get("id");
    const a = ARTICLES.find((x) => x.id === id);
    const root = $("#article");
    if (!a) {
      root.innerHTML = `<div class="wrap page-title"><h1>Статья не найдена</h1><p>Возможно, её переименовали. Загляните в <a class="link-arrow" href="articles.html">список статей</a>.</p></div>`;
      return;
    }
    document.title = `${a.title} – Alta Runa`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", a.excerpt);
    root.innerHTML = `
      <div class="wrap article-hero">
        <a href="articles.html" class="back">← Все статьи</a>
        <h1>${esc(a.title)}</h1>
        <div class="a-card__meta"><b>${esc(ARTICLE_CATS[a.category] || "")}</b><span>${fmtDate(a.date)}</span><span>${a.readTime} мин чтения</span></div>
        <div class="article-cover">${media(a, a.symbol, "cover")}</div>
        <div class="prose">${a.body}</div>
      </div>`;
    const related = ARTICLES.filter((x) => x.id !== a.id).sort((x, y) => (x.category === a.category ? -1 : 0) - (y.category === a.category ? -1 : 0)).slice(0, 3);
    const rel = $("#related");
    if (rel) rel.innerHTML = related.map(articleCard).join("");
  }

  function guideLinks() {
    document.querySelectorAll("[data-guide-free]").forEach((a) => (a.href = CFG.GUIDE_FREE_URL || "#"));
    document.querySelectorAll("[data-guide-full]").forEach((a) => (a.href = CFG.GUIDE_FULL_URL || CFG.AVITO_URL || "#"));
  }

  function guide() {
    const box = $("#futhark");
    if (box) {
      box.innerHTML = FUTHARK.map((r, i) =>
        (i % 8 === 0 ? `<div class="futhark__aett">${AETTS[i / 8]}</div>` : "") +
        `<div class="rune-tile reveal"><span class="rune">${r}</span><b>${RUNE_NAMES[i]}</b></div>`
      ).join("");
    }
    const fp = $("#full-price"); if (fp && CFG.GUIDE_FULL_PRICE) fp.textContent = `${fmtPrice(CFG.GUIDE_FULL_PRICE)} ₽`;
  }

  /* ---------- Reveal on scroll ---------- */
  let io;
  function observe() {
    if (!("IntersectionObserver" in window)) { document.querySelectorAll(".reveal").forEach((e) => e.classList.add("in")); return; }
    io = io || new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    document.querySelectorAll(".reveal:not(.in)").forEach((e) => io.observe(e));
  }

  renderHeader();
  renderFooter();
  guideLinks();
  ({ home, shop, articles, article, guide, product }[page] || (() => {}))();
  observe();
})();
