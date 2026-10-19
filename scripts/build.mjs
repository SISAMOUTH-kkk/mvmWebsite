#!/usr/bin/env node
// Static site build for MVM GROUP. No dependencies: `node scripts/build.mjs`.
// Output goes to dist/, which Netlify (or any static host) publishes.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ROOT, loadSite, localize } from '../src/lib/content.mjs';
import { LOCALES, localeInfo, t, url } from '../src/lib/i18n.mjs';
import { NEWS_CATEGORIES } from '../src/lib/taxonomies.mjs';
import { homePage } from '../src/pages/home.mjs';
import { aboutPage, unitPage } from '../src/pages/about.mjs';
import { servicesIndex, serviceDetail } from '../src/pages/services.mjs';
import { tourDetail } from '../src/pages/tours.mjs';
import { brandsIndex, brandDetail } from '../src/pages/brands.mjs';
import { projectsIndex, projectDetail } from '../src/pages/projects.mjs';
import { newsListing, article, NEWS_PER_PAGE } from '../src/pages/news.mjs';
import { contactPage, quotePage, partnershipPage, thankYouPage, legalPage, notFoundPage } from '../src/pages/contact.mjs';

const started = Date.now();
const DIST = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');
const ASSETS = path.join(ROOT, 'src', 'assets');

// ---------------------------------------------------------------------------
// 1. Clean output and copy static files
// ---------------------------------------------------------------------------
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
fs.cpSync(PUBLIC, DIST, { recursive: true, filter: (src) => !path.basename(src).startsWith('.DS_Store') });

// ---------------------------------------------------------------------------
// 2. Fingerprinted CSS / JS
// ---------------------------------------------------------------------------
function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}
function writeAsset(name, content) {
  const hash = crypto.createHash('sha1').update(content).digest('hex').slice(0, 10);
  const [base, ext] = name.split('.');
  const file = `${base}.${hash}.${ext}`;
  fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(DIST, 'assets', file), content);
  return `/assets/${file}`;
}
// Inline the small Lao pattern SVGs into the CSS (fewer requests; masks also work offline).
function inlinePatterns(css) {
  return css.replace(/url\((\/img\/patterns\/[\w-]+\.svg)\)/g, (match, url) => {
    const file = path.join(PUBLIC, url);
    if (!fs.existsSync(file)) return match;
    const svg = fs.readFileSync(file, 'utf8').replace(/\s+/g, ' ').trim();
    const encoded = svg.replace(/"/g, "'").replace(/[%#<>{}]/g, (c) => encodeURIComponent(c));
    return `url("data:image/svg+xml,${encoded}")`;
  });
}
const assets = {
  css: writeAsset('main.css', inlinePatterns(minifyCss(fs.readFileSync(path.join(ASSETS, 'main.css'), 'utf8')))),
  js: writeAsset('main.js', fs.readFileSync(path.join(ASSETS, 'main.js'), 'utf8')),
};

// ---------------------------------------------------------------------------
// 3. Pages
// ---------------------------------------------------------------------------
const site = loadSite();
const baseSettings = localize(site.raw.site, 'en');
const isRealUrl = (v) => v && /^https?:\/\//.test(v) && !/X{3,}/.test(v);
const SITE_URL = (isRealUrl(baseSettings.site_url) ? baseSettings.site_url : process.env.URL || 'https://www.mvmgroup.la').replace(/\/$/, '');

const written = [];
function writePage(segments, htmlString) {
  const dir = path.join(DIST, ...segments);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), htmlString);
  written.push({ segments, noindex: /<meta name="robots" content="noindex/.test(htmlString) });
}

for (const { code: lang } of LOCALES) {
  const ctx = {
    lang,
    info: localeInfo(lang),
    t: (key) => t(lang, key),
    u: (...segments) => url(lang, ...segments),
    abs: (p) => (/^https?:/.test(p) ? p : `${SITE_URL}${p.startsWith('/') ? '' : '/'}${p}`),
    assets,
    settings: site.settings(lang),
    home: site.home(lang),
    about: site.about(lang),
    legal: site.legal(lang),
    pages: site.pages(lang),
    services: site.services(lang),
    units: site.units(lang),
    brands: site.brands(lang),
    projects: site.projects(lang),
    news: site.news(lang),
    team: site.team(lang),
    tours: site.tours(lang),
  };

  writePage([lang], homePage(ctx));
  writePage([lang, 'about'], aboutPage(ctx));
  writePage([lang, 'services'], servicesIndex(ctx));
  for (const s of ctx.services) {
    writePage([lang, 'services', s.slug], serviceDetail(ctx, s));
    const tours = ctx.tours.filter((t) => t.service === s.slug);
    for (const t of tours) writePage([lang, 'services', s.slug, t.slug], tourDetail(ctx, s, t, tours));
  }
  writePage([lang, 'brands'], brandsIndex(ctx));
  for (const b of ctx.brands) writePage([lang, 'brands', b.slug], brandDetail(ctx, b));
  writePage([lang, 'projects'], projectsIndex(ctx));
  for (const p of ctx.projects) writePage([lang, 'projects', p.slug], projectDetail(ctx, p));
  for (const u of ctx.units.filter((x) => x.status !== 'planned' && !x.link)) writePage([lang, 'group', u.slug], unitPage(ctx, u));

  // News listings with pagination, then category listings, then articles
  const paginate = (posts, baseSegments, category) => {
    const totalPages = Math.max(1, Math.ceil(posts.length / NEWS_PER_PAGE));
    for (let page = 1; page <= totalPages; page++) {
      const slice = posts.slice((page - 1) * NEWS_PER_PAGE, page * NEWS_PER_PAGE);
      const segs = page === 1 ? baseSegments : [...baseSegments, 'page', String(page)];
      writePage([lang, ...segs], newsListing(ctx, { category, page, posts: slice, totalPages, baseSegments }));
    }
  };
  paginate(ctx.news, ['news']);
  for (const c of NEWS_CATEGORIES) {
    const posts = ctx.news.filter((n) => n.category === c.key);
    if (posts.length) paginate(posts, ['news', 'category', c.key], c.key);
  }
  for (const n of ctx.news) writePage([lang, 'news', n.slug], article(ctx, n));

  writePage([lang, 'contact'], contactPage(ctx));
  writePage([lang, 'quote'], quotePage(ctx));
  writePage([lang, 'partnership'], partnershipPage(ctx));
  writePage([lang, 'thank-you'], thankYouPage(ctx));
  writePage([lang, 'privacy'], legalPage(ctx, 'privacy'));
  writePage([lang, 'terms'], legalPage(ctx, 'terms'));
  writePage([lang, '404'], notFoundPage(ctx));
  if (lang === 'en') fs.copyFileSync(path.join(DIST, 'en', '404', 'index.html'), path.join(DIST, '404.html'));
}

// ---------------------------------------------------------------------------
// 4. Root language redirect, sitemap, robots
// ---------------------------------------------------------------------------
const alternates = (segments) =>
  LOCALES.map((l) => `<link rel="alternate" hreflang="${l.hreflang}" href="${SITE_URL}${url(l.code, ...segments)}">`).join('\n');

fs.writeFileSync(
  path.join(DIST, 'index.html'),
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MVM GROUP</title>
<link rel="canonical" href="${SITE_URL}/en/">
${alternates([])}
<link rel="alternate" hreflang="x-default" href="${SITE_URL}/en/">
<link rel="icon" href="/brand/favicon.svg" type="image/svg+xml">
<script>
(function () {
  if (/(invite|confirmation|recovery|email_change)_token=/.test(location.hash)) {
    location.replace('/admin/' + location.hash);
    return;
  }
  var lang = 'en';
  try {
    var saved = localStorage.getItem('mvm-lang');
    if (saved === 'en' || saved === 'la' || saved === 'zh') lang = saved;
    else {
      var prefs = (navigator.languages || [navigator.language || '']).join(',').toLowerCase();
      if (/(^|,)lo/.test(prefs)) lang = 'la';
      else if (/(^|,)zh/.test(prefs)) lang = 'zh';
    }
  } catch (e) {}
  location.replace('/' + lang + '/');
})();
</script>
<noscript><meta http-equiv="refresh" content="0; url=/en/"></noscript>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#15120e;color:#eee7da;font-family:system-ui,sans-serif}a{color:#c8a15a;margin:0 12px}</style>
</head>
<body><p><a href="/en/">English</a><a href="/la/" lang="lo">ລາວ</a><a href="/zh/" lang="zh-Hans">中文</a></p></body>
</html>
`
);

// Sitemap with hreflang alternates. Group pages by their language-neutral path.
const groups = new Map();
for (const page of written) {
  if (page.noindex) continue;
  const [lang, ...rest] = page.segments;
  const key = rest.join('/');
  if (!groups.has(key)) groups.set(key, new Set());
  groups.get(key).add(lang);
}
const today = new Date().toISOString().slice(0, 10);
const urls = [];
for (const [key, langs] of groups) {
  const segs = key ? key.split('/') : [];
  for (const lang of langs) {
    const links = [...langs]
      .map((l) => `<xhtml:link rel="alternate" hreflang="${localeInfo(l).hreflang}" href="${SITE_URL}${url(l, ...segs)}"/>`)
      .join('');
    urls.push(`<url><loc>${SITE_URL}${url(lang, ...segs)}</loc><lastmod>${today}</lastmod>${links}</url>`);
  }
}
fs.writeFileSync(
  path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`
);
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`Built ${written.length} pages in ${LOCALES.length} languages → dist/ (${Date.now() - started} ms)`);
