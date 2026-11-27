// =========================================================
// ALTA RUNA – сборка сайта для поисковиков
// Запускается автоматически (GitHub Actions) после каждой правки.
// Берёт data/products.js и data/articles.js и создаёт в папке _site:
//   • готовые HTML-страницы: /articles/<id>/ и /products/<id>/
//   • заполненные главную, каталог, статьи и гайд
//   • sitemap.xml, robots.txt, CNAME, 404.html
//   • canonical, Open Graph и разметку schema.org
// Локально: node scripts/build.mjs
// =========================================================
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = path.join(ROOT, "_site");
const SKIP = new Set(["_site", "scripts", "design-system", ".github", ".git", "node_modules", "README.md", ".gitignore", "CNAME", "logo-test.html"]);

/* ---------- данные и шаблоны ---------- */
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ["data/products.js", "data/articles.js", "assets/render.js"]) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), ctx, { filename: f });
}
const W = ctx.window;
const CFG = W.ALTA_CONFIG || {};
const SITE = (CFG.SITE_URL || "https://altaruna.ru").replace(/\/+$/, "");
const make = (base) => W.AltaRender({ config: CFG, products: W.ALTA_PRODUCTS, articles: W.ALTA_ARTICLES, base });
const R = make("");
const R2 = make("../../");
const esc = R.esc;
const abs = (p) => (/^https?:\/\//.test(p) ? p : `${SITE}/${String(p).replace(/^\/+/, "")}`);
const DEFAULT_IMAGE = (R.PRODUCTS.find((p) => p.image) || {}).image || "images/guide-preview.png";
const realLink = (url, min) => url && url.replace(/\/+$/, "").length > min;
const today = new Date().toISOString().slice(0, 10);

/* ---------- копирование исходников ---------- */
fs.rmSync(OUT, { recursive: true, force: true });
function copy(src, dst) {
  for (const name of fs.readdirSync(src)) {
    if (SKIP.has(name) && src === ROOT) continue;
    if (name.startsWith(".") && src === ROOT) continue;
    const s = path.join(src, name), d = path.join(dst, name);
    if (fs.statSync(s).isDirectory()) { fs.mkdirSync(d, { recursive: true }); copy(s, d); }
    else { fs.mkdirSync(dst, { recursive: true }); fs.copyFileSync(s, d); }
  }
}
copy(ROOT, OUT);
const write = (rel, content) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, content); };

/* ---------- общие куски ---------- */
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;
const ORG = {
  "@type": "Organization",
  name: "Alta Runa",
  url: SITE + "/",
  sameAs: [CFG.TELEGRAM_URL, CFG.INSTAGRAM_URL].filter((u) => realLink(u, 22))
};
function seo({ url, image, type = "website", extra = "" }) {
  return `
<link rel="canonical" href="${esc(url)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:type" content="${type}">
<meta property="og:image" content="${esc(abs(image || DEFAULT_IMAGE))}">
<meta property="og:site_name" content="Alta Runa">
<meta property="og:locale" content="ru_RU">
<meta name="twitter:card" content="summary_large_image">
${extra}`;
}
function headTag({ title, desc, base }) {
  return `<head>
<meta charset="UTF-8">
<script>document.documentElement.classList.add('js')</script>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta name="theme-color" content="#2B1D3C">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%232B1D3C'/><text x='50' y='72' font-size='64' text-anchor='middle' fill='%23C9AEE0'>ᚱ</text></svg>">
<link rel="stylesheet" href="${base}assets/style.css">
</head>`;
}
const scripts = (base) => `
<script>window.ALTA_BASE = ${JSON.stringify(base)};</script>
<script src="${base}data/products.js"></script>
<script src="${base}data/articles.js"></script>
<script src="${base}assets/render.js"></script>
<script src="${base}assets/main.js"></script>`;
const crumbs = (items) => ld({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: items.map(([name, url], i) => ({ "@type": "ListItem", position: i + 1, name, item: url }))
});

/* ---------- корневые страницы ---------- */
const ROOT_PAGES = {
  "index.html": { page: "home", url: SITE + "/", extra: ld({ "@context": "https://schema.org", "@graph": [ORG, { "@type": "WebSite", name: "Alta Runa", url: SITE + "/", inLanguage: "ru" }] }) },
  "shop.html": { page: "shop", url: SITE + "/shop.html" },
  "articles.html": { page: "articles", url: SITE + "/articles.html" },
  "guide.html": { page: "guide", url: SITE + "/guide.html", image: "images/guide-cover.jpg" },
  "privacy.html": { page: "legal", url: SITE + "/privacy.html" },
  "consent.html": { page: "legal", url: SITE + "/consent.html" },
  "terms.html": { page: "legal", url: SITE + "/terms.html" }
};
const fillId = (html, id, inner) => html.replace(new RegExp(`(id="${id}"[^>]*>)(</(div|nav|header|footer)>)`), `$1${inner}$2`);

for (const [file, meta] of Object.entries(ROOT_PAGES)) {
  let h = fs.readFileSync(path.join(ROOT, file), "utf8");
  h = h.replace("</head>", seo({ url: meta.url, image: meta.image, extra: meta.extra || "" }) + "\n</head>");
  h = h.replace(/<header id="site-header"( data-dark)?><\/header>/, (_, d) => `<header id="site-header" class="header${d ? " on-dark" : ""}"${d || ""}>${R.header(meta.page)}</header>`);
  h = h.replace('<footer id="site-footer"></footer>', `<footer id="site-footer" class="footer">${R.footer()}</footer>`);
  h = fillId(h, "ring-track", R.ring());
  h = fillId(h, "marquee", R.marquee());
  h = fillId(h, "featured-products", R.PRODUCTS.slice(0, 3).map(R.productCard).join(""));
  h = fillId(h, "latest-articles", R.ARTICLES.slice(0, 3).map(R.articleCard).join(""));
  h = fillId(h, "futhark", R.futhark());
  if (meta.page === "shop") { h = fillId(h, "filters", R.chips(R.PRODUCT_CATS, "all")); h = fillId(h, "products", R.list(R.PRODUCTS, R.productCard)); }
  if (meta.page === "articles") { h = fillId(h, "filters", R.chips(R.ARTICLE_CATS, "all")); h = fillId(h, "articles", R.list(R.ARTICLES, R.articleCard)); }
  h = h.replace(/href="#"( data-guide-free)/g, `href="${esc(CFG.GUIDE_FREE_URL || "#")}"$1`);
  h = h.replace(/href="#"( data-guide-full)/g, `href="${esc(CFG.GUIDE_FULL_URL || CFG.AVITO_URL || "#")}"$1`);
  if (CFG.GUIDE_FULL_PRICE) h = h.replace(/(id="full-price">)[^<]*/, `$1${R.fmtPrice(CFG.GUIDE_FULL_PRICE)} ₽`);
  if (realLink(CFG.TELEGRAM_URL, 13)) h = h.replace(/href="#"( id="cta-telegram")/, `href="${esc(CFG.TELEGRAM_URL)}"$1`);
  write(file, h);
}

/* ---------- страницы статей ---------- */
for (const a of R.ARTICLES) {
  const url = `${SITE}/articles/${encodeURIComponent(a.id)}/`;
  const image = a.cover || DEFAULT_IMAGE;
  const extra = ld({
    "@context": "https://schema.org", "@type": "Article",
    headline: a.title, description: a.excerpt, image: [abs(image)],
    datePublished: a.date, dateModified: a.updated || a.date, inLanguage: "ru",
    author: ORG, publisher: ORG, mainEntityOfPage: url
  }) + "\n" + crumbs([["Главная", SITE + "/"], ["Статьи", SITE + "/articles.html"], [a.title, url]]);
  write(`articles/${a.id}/index.html`, `<!DOCTYPE html>
<html lang="ru">
${headTag({ title: `${a.title} – Alta Runa`, desc: a.excerpt, base: "../../" }).replace("</head>", seo({ url, image, type: "article", extra: extra + `\n<meta property="article:published_time" content="${a.date}">` }) + "\n</head>")}
<body data-page="article" data-id="${esc(a.id)}">
<header id="site-header" class="header">${R2.header("articles")}</header>
<main>
  <div id="article">${R2.articlePage(a)}</div>
  <section class="section">
    <div class="wrap">
      <div class="sec-head"><h2>Читайте <em>также</em></h2><a href="../../articles.html" class="link-arrow">Все статьи →</a></div>
      <div class="grid" id="related">${R2.relatedArticles(a)}</div>
    </div>
  </section>
</main>
<footer id="site-footer" class="footer">${R2.footer()}</footer>${scripts("../../")}
</body>
</html>
`);
}

/* ---------- страницы товаров ---------- */
for (const p of R.PRODUCTS) {
  const url = `${SITE}/products/${encodeURIComponent(p.id)}/`;
  const imgs = R.productImages(p);
  const extra = ld({
    "@context": "https://schema.org", "@type": "Product",
    name: p.title, description: p.description, sku: p.id,
    image: (imgs.length ? imgs : [DEFAULT_IMAGE]).map(abs),
    brand: { "@type": "Brand", name: "Alta Runa" },
    offers: {
      "@type": "Offer", url, priceCurrency: "RUB", price: String(p.price),
      availability: p.soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition"
    }
  }) + "\n" + crumbs([["Главная", SITE + "/"], ["Купить", SITE + "/shop.html"], [p.title, url]]);
  const desc = `${p.description} Цена ${R.fmtPrice(p.price)} ₽. Ручная работа Alta Runa.`;
  write(`products/${p.id}/index.html`, `<!DOCTYPE html>
<html lang="ru">
${headTag({ title: `${p.title} – купить | Alta Runa`, desc, base: "../../" }).replace("</head>", seo({ url, image: imgs[0], type: "product", extra: extra + `\n<meta property="product:price:amount" content="${p.price}">\n<meta property="product:price:currency" content="RUB">` }) + "\n</head>")}
<body data-page="product" data-id="${esc(p.id)}">
<header id="site-header" class="header">${R2.header("shop")}</header>
<main>
  <div id="product">${R2.productPage(p)}</div>
  <section class="section section--alt">
    <div class="wrap">
      <div class="sec-head"><h2>Вам может <em>понравиться</em></h2><a href="../../shop.html" class="link-arrow">Весь каталог →</a></div>
      <div class="grid" id="related">${R2.relatedProducts(p)}</div>
    </div>
  </section>
</main>
<footer id="site-footer" class="footer">${R2.footer()}</footer>${scripts("../../")}
</body>
</html>
`);
}

/* ---------- старые адреса article.html?id= и product.html?id= → новые ---------- */
const redirect = (dir, fallback) => `<!DOCTYPE html>
<html lang="ru"><head><meta charset="UTF-8"><meta name="robots" content="noindex">
<title>Alta Runa</title>
<script>var id=new URLSearchParams(location.search).get("id");location.replace(id?"${dir}/"+encodeURIComponent(id)+"/":"${fallback}");</script>
</head><body><a href="${fallback}">Alta Runa</a></body></html>
`;
write("article.html", redirect("articles", "articles.html"));
write("product.html", redirect("products", "shop.html"));

/* ---------- 404 ---------- */
const R404 = make("/");
write("404.html", `<!DOCTYPE html>
<html lang="ru">
${headTag({ title: "Страница не найдена – Alta Runa", desc: "Такой страницы нет на сайте Alta Runa.", base: "/" }).replace("</head>", '<meta name="robots" content="noindex">\n</head>')}
<body data-page="404">
<header id="site-header" class="header">${R404.header("")}</header>
<main><section class="wrap page-title" style="padding-bottom:120px">
  <span class="eyebrow">Ошибка 404</span>
  <h1>Эта руна <em>ещё не вырезана</em></h1>
  <p>Такой страницы нет. Загляните в <a class="link-arrow" href="/shop.html">каталог</a> или <a class="link-arrow" href="/articles.html">статьи</a>.</p>
</section></main>
<footer id="site-footer" class="footer">${R404.footer()}</footer>${scripts("/")}
</body>
</html>
`);

/* ---------- sitemap.xml, robots.txt, CNAME ---------- */
const urls = [
  [SITE + "/", today, "1.0"],
  [SITE + "/shop.html", today, "0.9"],
  [SITE + "/guide.html", today, "0.8"],
  [SITE + "/articles.html", today, "0.8"],
  ...R.PRODUCTS.map((p) => [`${SITE}/products/${encodeURIComponent(p.id)}/`, today, "0.8"]),
  ...R.ARTICLES.map((a) => [`${SITE}/articles/${encodeURIComponent(a.id)}/`, a.updated || a.date, "0.7"])
];
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([loc, mod, pr]) => `  <url><loc>${loc}</loc><lastmod>${mod}</lastmod><priority>${pr}</priority></url>`).join("\n")}
</urlset>
`);
write("robots.txt", `User-agent: *
Allow: /
Disallow: /article.html
Disallow: /product.html

Sitemap: ${SITE}/sitemap.xml
`);
// Timeweb build: no GitHub Pages CNAME.

console.log(`Готово: ${R.ARTICLES.length} статей, ${R.PRODUCTS.length} товаров, ${urls.length} адресов в sitemap → _site/`);
