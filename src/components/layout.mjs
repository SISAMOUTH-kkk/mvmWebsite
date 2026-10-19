import fs from 'node:fs';
import path from 'node:path';
import { html, raw, attr, esc } from '../lib/html.mjs';
import { LOCALES, url } from '../lib/i18n.mjs';
import { ROOT } from '../lib/content.mjs';
import { sprite, icon } from './icons.mjs';
import { logo, lattice, band, contactLinks, socialLinks, isPlaceholder } from './ui.mjs';

// Web fonts: self-hosted when `npm run fonts` has been run (public/fonts/*.css),
// otherwise loaded from Google Fonts without blocking rendering. Chinese pages
// use high-quality system fonts for body text.
const GOOGLE_FONTS = {
  en: 'family=Marcellus&family=Noto+Sans:wght@400;500;600',
  la: 'family=Marcellus&family=Noto+Sans:wght@400;500;600&family=Noto+Sans+Lao:wght@400;500;600&family=Noto+Serif+Lao:wght@500;600',
  zh: 'family=Marcellus&family=Noto+Sans:wght@400;500;600&family=Noto+Serif+SC:wght@600',
};

function fontLinks(lang) {
  const local = path.join(ROOT, 'public', 'fonts', `${lang}.css`);
  if (fs.existsSync(local)) return html`<link rel="stylesheet" href="/fonts/${lang}.css">`;
  const href = `https://fonts.googleapis.com/css2?${GOOGLE_FONTS[lang]}&display=swap`;
  return html`<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="${href}" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="${href}"></noscript>`;
}

function analytics(settings) {
  const a = settings.analytics || {};
  const out = [];
  if (a.ga4_id && /^G-[A-Z0-9]+$/i.test(a.ga4_id)) {
    out.push(
      raw(`<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(a.ga4_id)}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${esc(a.ga4_id)}');</script>`)
    );
  }
  if (a.meta_pixel_id && /^\d{6,20}$/.test(String(a.meta_pixel_id))) {
    const id = esc(a.meta_pixel_id);
    out.push(
      raw(`<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');</script>
<noscript><img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1"></noscript>`)
    );
  }
  return out;
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
function navModel(ctx) {
  const { t, u } = ctx;
  const unitsInMenu = ctx.units.filter((x) => x.status !== 'planned' && x.show_in_menu !== false);
  const items = [
    { key: 'home', label: t('nav.home'), href: u() },
    {
      key: 'about',
      label: t('nav.about'),
      href: u('about'),
      children: [
        { label: t('nav.aboutGroup'), href: u('about') },
        ...unitsInMenu.map((x) => ({ label: x.title, href: x.link || u('group', x.slug), note: x.summary })),
        { label: t('nav.partnership'), href: u('partnership') },
      ],
    },
    {
      key: 'services',
      label: t('nav.services'),
      href: u('services'),
      children: [
        ...ctx.services.map((s) => ({ label: s.title, href: u('services', s.slug) })),
        { label: t('nav.allServices'), href: u('services'), all: true },
      ],
    },
    {
      key: 'brands',
      label: t('nav.brands'),
      href: u('brands'),
      children: [
        ...ctx.brands.map((b) => ({ label: b.title, href: u('brands', b.slug) })),
        { label: t('nav.partnership'), href: u('partnership') },
        { label: t('nav.allBrands'), href: u('brands'), all: true },
      ],
    },
    { key: 'projects', label: t('nav.projects'), href: u('projects') },
    { key: 'news', label: t('nav.news'), href: u('news') },
    { key: 'contact', label: t('nav.contact'), href: u('contact') },
  ];
  for (const extra of ctx.settings.menu_extra || []) {
    if (extra && extra.url && (extra[`label_${ctx.lang}`] || extra.label_en)) {
      items.splice(items.length - 1, 0, {
        key: `extra-${extra.url}`,
        label: extra[`label_${ctx.lang}`] || extra.label_en,
        href: /^https?:/.test(extra.url) ? extra.url : url(ctx.lang, ...extra.url.split('/').filter(Boolean)),
        external: /^https?:/.test(extra.url),
      });
    }
  }
  return items;
}

function langLinks(ctx, segments) {
  return LOCALES.map(
    (l) =>
      html`<a href="${url(l.code, ...segments)}" hreflang="${l.hreflang}" lang="${l.htmlLang}" data-lang-link="${l.code}"${
        l.code === ctx.lang ? raw(' aria-current="true"') : ''
      }>${l.label}</a>`
  );
}

function header(ctx, page) {
  const items = navModel(ctx);
  return html`<header class="site-header" data-header>
  <div class="site-header__band" aria-hidden="true"></div>
  <div class="wrap site-header__bar">
    ${logo(ctx)}
    <nav class="nav" aria-label="${ctx.t('nav.menu')}">
      <ul class="nav__list">
        ${items.map((item) => {
          const active = page.nav === item.key;
          const current = active && page.segments.join('/') === (item.key === 'home' ? '' : item.key);
          const linkAttrs = raw(`${current ? ' aria-current="page"' : ''}${item.external ? ' target="_blank" rel="noopener"' : ''}`);
          if (!item.children) {
            return html`<li class="nav__item"><a class="nav__link${active ? ' is-active' : ''}" href="${item.href}"${linkAttrs}>${item.label}</a></li>`;
          }
          return html`<li class="nav__item has-menu">
          <a class="nav__link${active ? ' is-active' : ''}" href="${item.href}"${linkAttrs}>${item.label}${icon('chevron')}</a>
          <ul class="nav__menu">${item.children.map(
            (c) => html`<li><a href="${c.href}"${c.all ? raw(' class="nav__menu-all"') : ''}>${c.label}${c.note ? html`<small>${c.note}</small>` : ''}</a></li>`
          )}</ul>
        </li>`;
        })}
      </ul>
    </nav>
    <div class="header-actions">
      <div class="lang" role="group" aria-label="${ctx.t('nav.language')}">${langLinks(ctx, page.segments)}</div>
      <a class="btn btn--gold btn--sm" href="${ctx.u('contact')}">${ctx.t('nav.contactUs')}</a>
      <button class="burger" type="button" data-burger aria-expanded="false" aria-controls="mobile-nav">
        <span>${ctx.t('nav.menu')}</span><span class="burger__lines" aria-hidden="true"></span>
      </button>
    </div>
  </div>
</header>
<div class="mobile-nav t-dark" id="mobile-nav">
  ${lattice()}
  <div class="mobile-nav__inner">
    <div class="mobile-nav__lang" role="group" aria-label="${ctx.t('nav.language')}">${langLinks(ctx, page.segments)}</div>
    <ul class="mobile-nav__list">
      ${items.map((item) =>
        item.children
          ? html`<li><details${page.nav === item.key ? raw(' open') : ''}><summary>${item.label}${icon('chevron')}</summary>
            <ul class="mobile-nav__sub">${item.children.map((c) => html`<li><a href="${c.href}">${c.label}</a></li>`)}</ul></details></li>`
          : html`<li><a href="${item.href}">${item.label}</a></li>`
      )}
    </ul>
    <div class="mobile-nav__actions">
      <a class="btn btn--gold" href="${ctx.u('quote')}">${ctx.t('cta.requestQuote')}</a>
      <a class="btn btn--outline" href="${ctx.u('contact')}">${ctx.t('cta.contactUs')}</a>
    </div>
  </div>
</div>`;
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
function footer(ctx, page) {
  const s = ctx.settings;
  const c = s.contact || {};
  const company = s.company || {};
  const year = new Date().getFullYear();
  const contacts = contactLinks(ctx);
  return html`<footer class="site-footer">
  ${band('band--faint')}
  ${lattice()}
  <div class="wrap site-footer__grid">
    <div class="site-footer__about">
      ${logo(ctx, { stacked: true })}
      <p>${s.footer_text}</p>
      ${socialLinks(ctx)}
    </div>
    <div>
      <h2>${ctx.t('footer.services')}</h2>
      <ul>${ctx.services.map((x) => html`<li><a href="${ctx.u('services', x.slug)}">${x.title}</a></li>`)}</ul>
    </div>
    <div>
      <h2>${ctx.t('footer.brands')}</h2>
      <ul>${ctx.brands.map((x) => html`<li><a href="${ctx.u('brands', x.slug)}">${x.title}</a></li>`)}
        <li><a href="${ctx.u('partnership')}">${ctx.t('nav.partnership')}</a></li></ul>
      <h2 style="margin-top:28px">${ctx.t('footer.company')}</h2>
      <ul>
        <li><a href="${ctx.u('about')}">${ctx.t('nav.about')}</a></li>
        <li><a href="${ctx.u('projects')}">${ctx.t('nav.projects')}</a></li>
        <li><a href="${ctx.u('news')}">${ctx.t('nav.news')}</a></li>
      </ul>
    </div>
    <div>
      <h2>${ctx.t('footer.contact')}</h2>
      <ul class="site-footer__contact">
        ${contacts.map(
          (l) => html`<li>${icon(l.icon)}<span>${l.href ? html`<a href="${l.href}"${l.href.startsWith('http') ? raw(' target="_blank" rel="noopener"') : ''}>${l.value}</a>` : html`${l.label}: ${l.value || ctx.t('misc.placeholder')}`}</span></li>`
        )}
        ${s.address ? html`<li>${icon('pin')}<span>${s.address}</span></li>` : ''}
      </ul>
      <p style="margin-top:22px"><a class="btn btn--outline btn--sm" href="${ctx.u('quote')}">${ctx.t('cta.requestQuote')}</a></p>
    </div>
  </div>
  <div class="wrap site-footer__bottom">
    <p>© ${year} ${company.legal_name || s.site_name || 'MVM GROUP'}. ${ctx.t('footer.rights')}${
      company.registration_no && !isPlaceholder(company.registration_no)
        ? html` ${ctx.t('footer.registration')}: ${company.registration_no}`
        : ''
    }</p>
    <ul>
      <li><a href="${ctx.u('privacy')}">${ctx.t('footer.privacy')}</a></li>
      <li><a href="${ctx.u('terms')}">${ctx.t('footer.terms')}</a></li>
      ${LOCALES.filter((l) => l.code !== ctx.lang).map(
        (l) => html`<li><a href="${url(l.code, ...page.segments)}" lang="${l.htmlLang}" hreflang="${l.hreflang}" data-lang-link="${l.code}">${l.label}</a></li>`
      )}
    </ul>
  </div>
</footer>`;
}

function quickContact(ctx) {
  const links = contactLinks(ctx).filter((l) => l.href);
  if (!links.length) return '';
  return html`<div class="quick" data-quick>
  <ul class="quick__panel" id="quick-panel">
    ${links.map(
      (l) => html`<li><a href="${l.href}"${l.href.startsWith('http') ? raw(' target="_blank" rel="noopener"') : ''}>${icon(l.icon)}<span>${l.label}<small>${l.value}</small></span></a></li>`
    )}
  </ul>
  <button class="quick__toggle" type="button" aria-expanded="false" aria-controls="quick-panel" aria-label="${ctx.t('cta.chat')}">${icon('chat')}</button>
</div>`;
}

// ---------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------
export function layout(ctx, page) {
  const s = ctx.settings;
  const siteName = s.site_name || 'MVM GROUP';
  const fullTitle = page.fullTitle || (page.title ? `${page.title} | ${siteName}` : `${siteName} — ${s.tagline || ''}`);
  const description = page.description || s.description || '';
  const canonical = ctx.abs(url(ctx.lang, ...page.segments));
  const image = ctx.abs(page.image || s.og_image || '/brand/og-image.png');
  const jsonld = [].concat(page.jsonld || []).filter(Boolean);

  return `<!doctype html>
${html`<html lang="${ctx.info.htmlLang}" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${fullTitle}</title>
<meta name="description" content="${description}">
${page.noindex ? raw('<meta name="robots" content="noindex, follow">') : ''}
<link rel="canonical" href="${canonical}">
${LOCALES.map((l) => html`<link rel="alternate" hreflang="${l.hreflang}" href="${ctx.abs(url(l.code, ...page.segments))}">
`)}<link rel="alternate" hreflang="x-default" href="${ctx.abs(url('en', ...page.segments))}">
<meta property="og:type" content="${page.ogType || 'website'}">
<meta property="og:site_name" content="${siteName}">
<meta property="og:title" content="${page.title || siteName}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${image}">
<meta property="og:locale" content="${ctx.info.ogLocale}">
${LOCALES.filter((l) => l.code !== ctx.lang).map((l) => html`<meta property="og:locale:alternate" content="${l.ogLocale}">
`)}<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#15120e">
${s.analytics?.google_site_verification ? html`<meta name="google-site-verification" content="${s.analytics.google_site_verification}">` : ''}
<link rel="icon" href="${s.favicon || '/brand/favicon.svg'}" type="image/svg+xml">
<link rel="icon" href="/brand/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/brand/apple-touch-icon.png">
${fontLinks(ctx.lang)}
<link rel="stylesheet" href="${ctx.assets.css}">
<script>document.documentElement.classList.add('js')</script>
${analytics(s)}
${jsonld.map((j) => raw(`<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>\n`))}
${page.head || ''}
</head>
<body class="${page.bodyClass || ''}">
${sprite()}
<a class="skip-link" href="#main">${ctx.t('nav.skip')}</a>
${header(ctx, page)}
<main id="main">
${page.body}
</main>
${footer(ctx, page)}
${quickContact(ctx)}
<script src="${ctx.assets.js}" defer></script>
${page.foot || ''}
</body>
</html>`}`;
}

export { attr };
