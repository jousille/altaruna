/* ===================== ALTA RUNA – поведение страниц =====================
   Разметку строит assets/render.js. На собранном сайте (после GitHub Actions)
   страницы уже содержат готовый HTML – здесь только «оживляем» их:
   меню, фильтры, галерея, анимации. Если HTML пустой (локальный просмотр
   без сборки) – дорисовываем его из data/*.js.
   ========================================================================= */
(function () {
  const R = window.AltaRender({
    config: window.ALTA_CONFIG,
    products: window.ALTA_PRODUCTS,
    articles: window.ALTA_ARTICLES,
    base: window.ALTA_BASE || ""
  });
  const CFG = R.CFG;
  const $ = (s, r = document) => r.querySelector(s);
  const body = document.body;
  const page = body.dataset.page || "";
  const fill = (el, html) => { if (el && !el.children.length) el.innerHTML = html; return el; };

  /* ---------- Шапка и подвал ---------- */
  const head = $("#site-header");
  if (head) {
    head.classList.add("header");
    if (head.hasAttribute("data-dark")) head.classList.add("on-dark");
    fill(head, R.header(page));
    const burger = $("#burger"), nav = $("#nav");
    burger.addEventListener("click", () => { burger.classList.toggle("open"); nav.classList.toggle("open"); });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => { burger.classList.remove("open"); nav.classList.remove("open"); }));
  }
  const foot = $("#site-footer");
  if (foot) { foot.classList.add("footer"); fill(foot, R.footer()); }

  /* ---------- Ссылки из настроек ---------- */
  document.querySelectorAll("[data-guide-free]").forEach((a) => (a.href = R.img(CFG.GUIDE_FREE_URL || "#")));
  document.querySelectorAll("[data-guide-full]").forEach((a) => (a.href = CFG.GUIDE_FULL_URL || CFG.AVITO_URL || "#"));
  document.querySelectorAll("[data-avito]").forEach((a) => (a.href = CFG.AVITO_URL || "#"));

  /* ---------- Фильтры каталога и статей ---------- */
  function setupFilter(listEl, filtersEl, items, cats, cardFn) {
    if (!listEl || !filtersEl) return;
    const valid = ["all", ...Object.keys(cats)];
    const draw = (cat) => {
      listEl.innerHTML = R.list(items, cardFn, cat);
      filtersEl.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c.dataset.cat === cat));
      observe();
    };
    fill(filtersEl, R.chips(cats, "all"));
    filtersEl.addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;
      history.replaceState(null, "", b.dataset.cat === "all" ? location.pathname : "#" + b.dataset.cat);
      draw(b.dataset.cat);
    });
    window.addEventListener("hashchange", () => { const h = location.hash.slice(1); draw(valid.includes(h) ? h : "all"); });
    const h = location.hash.slice(1);
    if (valid.includes(h) && h !== "all") draw(h); else fill(listEl, R.list(items, cardFn));
  }

  /* ---------- Страницы ---------- */
  const pages = {
    home() {
      fill($("#ring-track"), R.ring());
      fill($("#marquee"), R.marquee());
      fill($("#featured-products"), R.PRODUCTS.slice(0, 3).map(R.productCard).join(""));
      fill($("#latest-articles"), R.ARTICLES.slice(0, 3).map(R.articleCard).join(""));
      const tg = $("#cta-telegram");
      if (tg) { if (CFG.TELEGRAM_URL) tg.href = CFG.TELEGRAM_URL; else tg.closest("section").remove(); }
    },
    shop() { setupFilter($("#products"), $("#filters"), R.PRODUCTS, R.PRODUCT_CATS, R.productCard); },
    articles() { setupFilter($("#articles"), $("#filters"), R.ARTICLES, R.ARTICLE_CATS, R.articleCard); },
    guide() {
      fill($("#futhark"), R.futhark());
      const fp = $("#full-price"); if (fp && CFG.GUIDE_FULL_PRICE) fp.textContent = `${R.fmtPrice(CFG.GUIDE_FULL_PRICE)} ₽`;
    },
    article() {
      const root = $("#article");
      if (root && !root.children.length) {
        const id = body.dataset.id || new URLSearchParams(location.search).get("id");
        const a = R.ARTICLES.find((x) => x.id === id);
        if (!a) { root.innerHTML = `<div class="wrap page-title"><h1>Статья не найдена</h1><p>Загляните в <a class="link-arrow" href="${R.img("articles.html")}">список статей</a>.</p></div>`; return; }
        document.title = `${a.title} – Alta Runa`;
        root.innerHTML = R.articlePage(a);
        fill($("#related"), R.relatedArticles(a));
      }
    },
    product() {
      const root = $("#product");
      if (root && !root.children.length) {
        const id = body.dataset.id || new URLSearchParams(location.search).get("id");
        const p = R.PRODUCTS.find((x) => x.id === id);
        if (!p) { root.innerHTML = `<div class="wrap page-title"><h1>Товар не найден</h1><p>Загляните в <a class="link-arrow" href="${R.img("shop.html")}">каталог</a>.</p></div>`; return; }
        document.title = `${p.title} – Alta Runa`;
        root.innerHTML = R.productPage(p);
        fill($("#related"), R.relatedProducts(p));
      }
      root.querySelectorAll(".pthumb").forEach((b) => b.addEventListener("click", () => {
        $("#pmain").src = b.dataset.src;
        root.querySelectorAll(".pthumb").forEach((x) => x.classList.toggle("active", x === b));
      }));
    }
  };

  /* ---------- Появление блоков при прокрутке ---------- */
  let io;
  function observe() {
    if (!("IntersectionObserver" in window)) { document.querySelectorAll(".reveal").forEach((e) => e.classList.add("in")); return; }
    io = io || new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    document.querySelectorAll(".reveal:not(.in)").forEach((e) => io.observe(e));
  }

  (pages[page] || (() => {}))();
  observe();
})();
