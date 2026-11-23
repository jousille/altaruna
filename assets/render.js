/* =========================================================
   ALTA RUNA – шаблоны разметки.
   Используются и в браузере (main.js), и при сборке сайта
   (scripts/build.mjs), поэтому страница выглядит одинаково
   для посетителя и для поискового робота.
   ========================================================= */
(function (root) {
  const RUNE_NAMES = ["Феху","Уруз","Турисаз","Ансуз","Райдо","Кеназ","Гебо","Вуньо","Хагалаз","Наутиз","Иса","Йера","Эйваз","Перт","Альгиз","Соулу","Тейваз","Беркана","Эваз","Манназ","Лагуз","Ингуз","Дагаз","Отала"];
  const AETTS = ["Атт Фрейи", "Атт Хеймдалля", "Атт Тюра"];
  const FUTHARK = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ".split("");
  const PRODUCT_CATS = { jewelry: "Украшения", tarot: "Карты таро" };
  const ARTICLE_CATS = { runes: "Руны", stones: "Камни", tarot: "Таро" };
  const MONTHS = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtPrice = (n) => String(Math.round(Number(n))).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const fmtDate = (d) => { const [y, m, day] = d.split("-").map(Number); return `${day} ${MONTHS[m - 1]} ${y}`; };

  function AltaRender(opts) {
    const CFG = opts.config || {};
    const PRODUCTS = opts.products || [];
    const ARTICLES = (opts.articles || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
    const BASE = opts.base || "";              // "" для корня, "../../" для /articles/id/
    const PRETTY = opts.pretty !== false;      // красивые адреса /articles/id/

    const u = (path) => BASE + path;           // внутренняя ссылка
    const img = (src) => (/^(https?:)?\/\//.test(src) ? src : BASE + src);
    const productUrl = (id) => PRETTY ? u(`products/${encodeURIComponent(id)}/`) : u(`product.html?id=${encodeURIComponent(id)}`);
    const articleUrl = (id) => PRETTY ? u(`articles/${encodeURIComponent(id)}/`) : u(`article.html?id=${encodeURIComponent(id)}`);
    const buyUrl = (p) => p.link || CFG.AVITO_URL || "#";
    const productImages = (p) => (p.images && p.images.length) ? p.images : (p.image ? [p.image] : []);

    // ссылки внутри текста статей: product.html?id=x, article.html?id=x, images/...
    const fixBody = (html) => String(html)
      .replace(/href="product\.html\?id=([^"]+)"/g, (_, id) => `href="${productUrl(decodeURIComponent(id))}"`)
      .replace(/href="article\.html\?id=([^"]+)"/g, (_, id) => `href="${articleUrl(decodeURIComponent(id))}"`)
      .replace(/(src|href)="(images|guides)\//g, (_, attr, dir) => `${attr}="${BASE}${dir}/`);

    function media(item, symbol, field, eager) {
      const src = item[field];
      if (src) return `<img src="${esc(img(src))}" alt="${esc(item.title)}"${eager ? "" : ' loading="lazy"'}>`;
      return `<div class="art tone-${esc(item.tone || "plum")}"><span class="art__sym">${esc(symbol)}</span></div>`;
    }

    function header(page, dark) {
      const link = (href, text, key) => `<a href="${href}"${page === key ? ' class="active"' : ""}>${text}</a>`;
      return `
      <div class="wrap header__in">
        <a href="${u("index.html")}" class="logo">Alta <span class="rune">ᚱ</span> Runa</a>
        <nav class="nav" id="nav">
          ${link(u("index.html"), "Главная", "home")}
          ${link(u("shop.html"), "Купить", "shop")}
          ${link(u("guide.html"), "Гайд по рунам", "guide")}
          ${link(u("articles.html"), "Статьи", "articles")}
          ${link(u("index.html#about"), "О бренде", "about")}
          <a href="${esc(CFG.AVITO_URL)}" target="_blank" rel="noopener" class="btn btn--accent btn--sm">Мы на Авито</a>
        </nav>
        <button class="burger" id="burger" aria-label="Меню"><span></span><span></span><span></span></button>
      </div>`;
    }

    function footer() {
      const social = [
        CFG.TELEGRAM_URL && `<li><a href="${esc(CFG.TELEGRAM_URL)}" target="_blank" rel="noopener">Telegram</a></li>`,
        CFG.INSTAGRAM_URL && `<li><a href="${esc(CFG.INSTAGRAM_URL)}" target="_blank" rel="noopener">Instagram</a></li>`,
        CFG.AVITO_URL && `<li><a href="${esc(CFG.AVITO_URL)}" target="_blank" rel="noopener">Авито</a></li>`
      ].filter(Boolean).join("");
      return `
      <div class="wrap">
        <div class="footer__top">
          <div>
            <a href="${u("index.html")}" class="logo">Alta <span class="rune">ᚱ</span> Runa</a>
            <p>Украшения ручной работы с рунами и натуральными камнями. Карты таро для тех, кто ищет свой язык символов.</p>
          </div>
          <div>
            <h4>Разделы</h4>
            <ul>
              <li><a href="${u("shop.html")}">Купить</a></li>
              <li><a href="${u("shop.html#jewelry")}">Украшения</a></li>
              <li><a href="${u("shop.html#tarot")}">Карты таро</a></li>
              <li><a href="${u("guide.html")}">Гайд по рунам</a></li>
              <li><a href="${u("articles.html")}">Статьи</a></li>
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

    function productCard(p) {
      const page = productUrl(p.id);
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
            <a href="${esc(buyUrl(p))}" target="_blank" rel="noopener" class="btn btn--accent btn--sm">Купить</a>
          </div>
        </div>
      </article>`;
    }

    function articleCard(a) {
      return `
      <a href="${articleUrl(a.id)}" class="a-card reveal">
        <div class="a-card__cover">${media(a, a.symbol, "cover")}</div>
        <div class="a-card__meta"><b>${esc(ARTICLE_CATS[a.category] || "")}</b><span>${fmtDate(a.date)}</span><span>${a.readTime} мин</span></div>
        <h3>${esc(a.title)}</h3>
        <p>${esc(a.excerpt)}</p>
      </a>`;
    }

    function productPage(p) {
      const imgs = productImages(p);
      const main = imgs.length
        ? `<img src="${esc(img(imgs[0]))}" alt="${esc(p.title)}" id="pmain">`
        : `<div class="art tone-${esc(p.tone || "plum")}"><span class="art__sym">${esc(p.rune)}</span></div>`;
      const thumbs = imgs.length > 1
        ? `<div class="pthumbs">${imgs.map((src, i) => `<button class="pthumb${i === 0 ? " active" : ""}" data-src="${esc(img(src))}" aria-label="Фото ${i + 1}"><img src="${esc(img(src))}" alt="${esc(p.title)} – фото ${i + 1}" loading="lazy"></button>`).join("")}</div>` : "";
      const details = (p.details || []).map((d, i) =>
        `<details class="pdetail"${i === 0 ? " open" : ""}><summary>${esc(d.title)}</summary><p>${esc(d.text)}</p></details>`).join("");
      return `
      <div class="wrap product">
        <a href="${u("shop.html")}" class="back">← Каталог</a>
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
              <a href="${esc(buyUrl(p))}" target="_blank" rel="noopener" class="btn btn--accent">Купить на Авито</a>
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
    }

    function relatedProducts(p) {
      return PRODUCTS.filter((x) => x.id !== p.id).sort((a, b) => (b.category === p.category) - (a.category === p.category)).slice(0, 3).map(productCard).join("");
    }

    function articlePage(a) {
      return `
      <div class="wrap article-hero">
        <a href="${u("articles.html")}" class="back">← Все статьи</a>
        <h1>${esc(a.title)}</h1>
        <div class="a-card__meta"><b>${esc(ARTICLE_CATS[a.category] || "")}</b><span>${fmtDate(a.date)}</span><span>${a.readTime} мин чтения</span></div>
        <div class="article-cover">${media(a, a.symbol, "cover", true)}</div>
        <article class="prose">${fixBody(a.body)}</article>
      </div>`;
    }

    function relatedArticles(a) {
      return ARTICLES.filter((x) => x.id !== a.id).sort((x, y) => (y.category === a.category) - (x.category === a.category)).slice(0, 3).map(articleCard).join("");
    }

    function futhark() {
      return FUTHARK.map((r, i) =>
        (i % 8 === 0 ? `<div class="futhark__aett">${AETTS[i / 8]}</div>` : "") +
        `<div class="rune-tile reveal"><span class="rune">${r}</span><b>${RUNE_NAMES[i]}</b></div>`
      ).join("");
    }

    function ring() {
      return FUTHARK.map((r, i) => {
        const ang = (2 * Math.PI / FUTHARK.length) * i - Math.PI / 2;
        const x = (50 + Math.cos(ang) * 47).toFixed(2), y = (50 + Math.sin(ang) * 47).toFixed(2);
        return `<span style="left:${x}%;top:${y}%;transform:translate(-50%,-50%) rotate(${(ang + Math.PI / 2).toFixed(4)}rad)">${r}</span>`;
      }).join("");
    }

    function marquee() {
      const words = ["Ручная работа", "Натуральные камни", "Старший Футарк", "Карты таро", "Украшения со смыслом"];
      const chunk = words.map((w, i) => `<span>${w}</span><span class="rune">${FUTHARK[(i * 5) % 24]}</span>`).join("");
      return chunk + chunk + chunk + chunk;
    }

    function list(items, cardFn, cat) {
      const l = !cat || cat === "all" ? items : items.filter((i) => i.category === cat);
      return l.length ? l.map(cardFn).join("") : `<p class="empty">Здесь пока пусто – скоро появится.</p>`;
    }

    function chips(cats, active) {
      return `<button class="chip${active === "all" ? " active" : ""}" data-cat="all">Все</button>` +
        Object.entries(cats).map(([k, v]) => `<button class="chip${active === k ? " active" : ""}" data-cat="${k}">${v}</button>`).join("");
    }

    return {
      CFG, PRODUCTS, ARTICLES, PRODUCT_CATS, ARTICLE_CATS,
      esc, fmtPrice, fmtDate, productUrl, articleUrl, buyUrl, productImages, img,
      header, footer, productCard, articleCard, productPage, relatedProducts,
      articlePage, relatedArticles, futhark, ring, marquee, list, chips
    };
  }

  root.AltaRender = AltaRender;
})(typeof window !== "undefined" ? window : globalThis);
