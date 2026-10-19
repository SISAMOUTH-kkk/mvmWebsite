import fs from 'node:fs';
import path from 'node:path';
import { html, raw, attr, cls } from '../lib/html.mjs';
import { ROOT } from '../lib/content.mjs';
import { icon, logoMark, wordmark } from './icons.mjs';
import { formatDate, isoDate } from '../lib/i18n.mjs';
import { PROJECT_CATEGORIES, NEWS_CATEGORIES, findCategory, label } from '../lib/taxonomies.mjs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Values like "+856 20 XXXX XXXX" are placeholders until the client fills them in.
export const isPlaceholder = (v) => !v || /X{3,}|to be added|placeholder/i.test(String(v));
export const digits = (v) => String(v || '').replace(/[^\d]/g, '');

export function img(src, alt = '', { cls: c = '', eager = false, width, height, sizes } = {}) {
  if (!src) return '';
  return html`<img src="${src}" alt="${alt}"${attr('class', c)}${attr('width', width)}${attr('height', height)}${attr(
    'sizes',
    sizes
  )} loading="${eager ? 'eager' : 'lazy'}" decoding="async"${eager ? raw(' fetchpriority="high"') : ''}>`;
}

// <picture> with a WebP source when a .webp file sits next to the JPEG/PNG in public/.
const webpCache = new Map();
export function webpFor(src) {
  if (!src || !/^\/(?!\/).*\.(jpe?g|png)$/i.test(src)) return '';
  if (!webpCache.has(src)) {
    const w = src.replace(/\.(jpe?g|png)$/i, '.webp');
    webpCache.set(src, fs.existsSync(path.join(ROOT, 'public', w)) ? w : '');
  }
  return webpCache.get(src);
}

export function picture(src, alt = '', { cls: c = '', pictureCls = '', eager = false, width, height, style = '' } = {}) {
  if (!src) return '';
  const webp = webpFor(src);
  const image = html`<img src="${src}" alt="${alt}"${attr('class', c)}${attr('width', width)}${attr('height', height)}${attr(
    'style',
    style
  )} loading="${eager ? 'eager' : 'lazy'}" decoding="async"${eager ? raw(' fetchpriority="high"') : ''}>`;
  if (!webp && !pictureCls) return image;
  return html`<picture${attr('class', pictureCls)}>${webp ? html`<source srcset="${webp}" type="image/webp">` : ''}${image}</picture>`;
}

export const lattice = (extra = '', parallax) =>
  html`<div class="${cls('lattice', extra)}" aria-hidden="true"${attr('data-parallax', parallax)}></div>`;
export const band = (extra = '') => html`<div class="${cls('band', extra)}" aria-hidden="true"></div>`;

export function logo(ctx, { href = true, stacked = false } = {}) {
  const s = ctx.settings;
  const name = s.site_name || 'MVM GROUP';
  const inner = s.logo
    ? html`<img class="logo__img" src="${s.logo}" alt="${name}" height="48">`
    : stacked
      ? raw(`<img class="logo__lockup" src="/brand/logo-lockup.svg" width="150" height="146" alt="${name}" decoding="async">`)
      : html`${logoMark('logo__mark', { size: 48 })}${wordmark('logo__word', { height: 13, alt: name })}`;
  if (!href) return html`<span class="logo">${inner}</span>`;
  return html`<a class="logo" href="${ctx.u()}" aria-label="${s.site_name || 'MVM GROUP'} — ${ctx.t('nav.home')}">${inner}</a>`;
}

export function crumbs(ctx, items) {
  const all = [{ label: ctx.t('nav.home'), href: ctx.u() }, ...items];
  return html`<nav class="crumbs" aria-label="${ctx.t('nav.breadcrumb')}"><ol>${all.map((item, i) =>
    i === all.length - 1
      ? html`<li><span aria-current="page">${item.label}</span></li>`
      : html`<li><a href="${item.href}">${item.label}</a></li>`
  )}</ol></nav>`;
}

export function breadcrumbJsonLd(ctx, items) {
  const all = [{ label: ctx.t('nav.home'), href: ctx.u() }, ...items];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: ctx.abs(item.href) } : {}),
    })),
  };
}

// ---------------------------------------------------------------------------
// Page hero for inner pages
// ---------------------------------------------------------------------------
export function pageHero(ctx, { title, lead, trail = [], actions = '', art = '', theme = 't-dark', extra = '' }) {
  return html`<section class="${cls('page-hero', theme, art && 'page-hero--with-art')}">
  ${lattice('lattice--right', '0.12')}
  <div class="wrap page-hero__inner">
    <div>
      ${crumbs(ctx, trail)}
      <h1 class="page-hero__title">${title}</h1>
      ${lead ? html`<p class="page-hero__lead">${lead}</p>` : ''}
      ${extra}
      ${actions ? html`<div class="btn-row page-hero__actions">${actions}</div>` : ''}
    </div>
    ${art ? html`<div class="page-hero__aside" aria-hidden="true">${art}</div>` : ''}
  </div>
  ${band()}
</section>`;
}

// ---------------------------------------------------------------------------
// Covers & cards
// ---------------------------------------------------------------------------
export function cover({ image, alt = '', iconName = 'compass', ratio, eager = false, video } = {}) {
  const style = ratio ? raw(` style="aspect-ratio:${ratio}"`) : '';
  if (image) return html`<div class="cover"${style}>${img(image, alt, { eager })}</div>`;
  return html`<div class="cover cover--placeholder"${style} role="img" aria-label="${alt}">${lattice()}${icon(iconName)}</div>`;
}

export function serviceCard(ctx, s, { bullets = 3 } = {}) {
  const items = (s.help || []).slice(0, bullets).map((h) => (typeof h === 'string' ? h : h.title));
  return html`<a class="plate service-card" href="${ctx.u('services', s.slug)}" data-reveal>
  ${raw(`<svg class="icon service-card__icon" aria-hidden="true"><use href="#i-${s.icon || 'compass'}"></use></svg>`)}
  <h3>${s.title}</h3>
  <p>${s.summary}</p>
  ${items.length ? html`<ul>${items.map((i) => html`<li>${i}</li>`)}</ul>` : ''}
  <span class="link">${ctx.t('cta.learnMore')} ${icon('arrow')}</span>
</a>`;
}

export function brandNames(brand, lang, { tag = 'h3' } = {}) {
  const names = [
    { lang: 'la', htmlLang: 'lo', value: brand.name_la },
    { lang: 'en', htmlLang: 'en', value: brand.name_en },
    { lang: 'zh', htmlLang: 'zh-Hans', value: brand.name_zh },
  ].filter((n) => n.value);
  const primary = names.find((n) => n.lang === lang) || names.find((n) => n.lang === 'en') || names[0];
  const others = names.filter((n) => n !== primary);
  const open = raw(`<${tag} class="brand-names__primary">`);
  const close = raw(`</${tag}>`);
  return html`<div class="brand-names">${open}${primary ? primary.value : brand.title}${close}
  <p class="brand-names__alt">${others.map((n) => html`<span lang="${n.htmlLang}">${n.value}</span>`)}</p></div>`;
}

export function brandArt(brand, { eager = false } = {}) {
  if (brand.hero_image) return img(brand.hero_image, brand.name_en || '', { eager, cls: 'is-photo' });
  if (brand.illustration) return img(`/img/illustrations/${brand.illustration}.svg`, '', { eager, cls: 'is-illustration' });
  return '';
}

export function brandPanel(ctx, b) {
  const style = b.accent_color ? raw(` style="--brand-bg:${b.accent_color}"`) : '';
  const art = b.card_image
    ? img(b.card_image, b.name_en || '')
    : b.illustration
      ? img(`/img/illustrations/${b.illustration}.svg`, '', { cls: 'is-illustration' })
      : '';
  return html`<article class="brand-panel" data-reveal${style}>
  <div class="brand-panel__art">${lattice()}${art}</div>
  <div class="brand-panel__body">
    ${brandNames(b, ctx.lang)}
    <p>${b.summary}</p>
    <div class="btn-row">
      <a class="btn btn--outline btn--sm" href="${ctx.u('brands', b.slug)}">${ctx.t('cta.viewBrand')}</a>
      <a class="btn btn--ghost btn--sm" href="${ctx.u('partnership')}?type=distributor&brand=${b.slug}">${ctx.t('cta.becomeDistributor')}</a>
    </div>
  </div>
</article>`;
}

export function projectCategory(key) {
  return findCategory(PROJECT_CATEGORIES, key);
}
export function newsCategory(key) {
  return findCategory(NEWS_CATEGORIES, key);
}

export function projectCard(ctx, p, { headingTag = 'h3' } = {}) {
  const cat = projectCategory(p.category);
  const open = raw(`<${headingTag} class="card__title">`);
  const close = raw(`</${headingTag}>`);
  return html`<a class="card" href="${ctx.u('projects', p.slug)}" data-category="${p.category || ''}" data-reveal>
  ${cover({ image: p.cover, alt: p.cover_alt || p.title, iconName: cat?.icon })}
  <div class="card__meta">
    ${cat ? html`<span class="tag">${label(cat, ctx.lang)}</span>` : ''}
    ${p.year ? html`<span>${p.year}</span>` : ''}
    ${p.sample ? html`<span class="tag tag--sample">${ctx.t('project.sample')}</span>` : ''}
  </div>
  ${open}${p.title}${close}
  ${p.summary ? html`<p class="card__text">${p.summary}</p>` : ''}
</a>`;
}

export function newsCard(ctx, n, { large = false } = {}) {
  const cat = newsCategory(n.category);
  return html`<a class="card" href="${ctx.u('news', n.slug)}" data-reveal>
  ${cover({ image: n.cover, alt: n.cover_alt || n.title, iconName: cat?.icon, ratio: large ? '16 / 10' : undefined })}
  <div class="card__meta">
    ${cat ? html`<span class="tag">${label(cat, ctx.lang)}</span>` : ''}
    <time datetime="${isoDate(n.date)}">${formatDate(n.date, ctx.lang)}</time>
  </div>
  <h3 class="card__title"${large ? raw(' style="font-size:clamp(1.5rem,2.4vw,2rem)"') : ''}>${n.title}</h3>
  ${n.excerpt ? html`<p class="card__text">${n.excerpt}</p>` : ''}
</a>`;
}

export function newsRow(ctx, n) {
  const cat = newsCategory(n.category);
  return html`<a class="news-row" href="${ctx.u('news', n.slug)}" data-reveal>
  <div class="card__meta">${cat ? html`<span class="tag">${label(cat, ctx.lang)}</span>` : ''}<time datetime="${isoDate(
    n.date
  )}">${formatDate(n.date, ctx.lang)}</time></div>
  <h3>${n.title}</h3>
  ${n.excerpt ? html`<p>${n.excerpt}</p>` : ''}
</a>`;
}

// ---------------------------------------------------------------------------
// Contact helpers
// ---------------------------------------------------------------------------
export function contactLinks(ctx) {
  const c = ctx.settings.contact || {};
  const out = [];
  if (!isPlaceholder(c.whatsapp)) out.push({ key: 'whatsapp', icon: 'whatsapp', label: ctx.t('contact.whatsapp'), value: c.whatsapp, href: `https://wa.me/${digits(c.whatsapp)}` });
  else out.push({ key: 'whatsapp', icon: 'whatsapp', label: ctx.t('contact.whatsapp'), value: c.whatsapp, placeholder: true });
  out.push({ key: 'wechat', icon: 'wechat', label: ctx.t('contact.wechat'), value: c.wechat, href: isPlaceholder(c.wechat) ? '' : `${ctx.u('contact')}#wechat`, placeholder: isPlaceholder(c.wechat) });
  if (!isPlaceholder(c.phone)) out.push({ key: 'phone', icon: 'phone', label: ctx.t('contact.phone'), value: c.phone, href: `tel:+${digits(c.phone)}` });
  else out.push({ key: 'phone', icon: 'phone', label: ctx.t('contact.phone'), value: c.phone, placeholder: true });
  out.push({ key: 'email', icon: 'mail', label: ctx.t('contact.email'), value: c.email, href: isPlaceholder(c.email) ? '' : `mailto:${c.email}`, placeholder: isPlaceholder(c.email) });
  return out;
}

export function socialLinks(ctx) {
  const c = ctx.settings.contact || {};
  const items = [
    { key: 'facebook', icon: 'facebook', label: 'Facebook', href: c.facebook },
    { key: 'tiktok', icon: 'tiktok', label: 'TikTok', href: c.tiktok },
  ].filter((i) => i.href && !isPlaceholder(i.href));
  if (!items.length) return '';
  return html`<ul class="social">${items.map(
    (i) => html`<li><a href="${i.href}" target="_blank" rel="noopener" aria-label="${i.label}">${icon(i.icon)}</a></li>`
  )}</ul>`;
}

// ---------------------------------------------------------------------------
// Call to action band
// ---------------------------------------------------------------------------
export function ctaBand(ctx, { title, text, actions } = {}) {
  const links = contactLinks(ctx).filter((l) => l.href);
  return html`<section class="section cta t-dark" aria-labelledby="cta-title">
  ${band('band--faint')}
  ${lattice('lattice--edges')}
  <div class="wrap" data-reveal>
    <h2 class="cta__title" id="cta-title">${title || ctx.home.cta_title || ctx.t('home.ctaTitle')}</h2>
    <p class="cta__text">${text || ctx.home.cta_text || ctx.t('home.ctaText')}</p>
    <div class="btn-row">
      ${actions ||
      html`<a class="btn btn--gold" href="${ctx.u('quote')}">${ctx.t('cta.requestQuote')}</a>
      <a class="btn btn--outline" href="${ctx.u('contact')}">${ctx.t('cta.contactUs')}</a>`}
    </div>
    ${links.length
      ? html`<ul class="quick-links">${links.map(
          (l) => html`<li><a href="${l.href}"${l.href.startsWith('http') ? raw(' target="_blank" rel="noopener"') : ''}>${icon(l.icon)}<span>${l.label}</span></a></li>`
        )}</ul>`
      : ''}
  </div>
</section>`;
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------
export function youtubeId(u) {
  const m = String(u || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
  return m ? m[1] : '';
}

export function videoEmbed(ctx, src, poster) {
  const id = youtubeId(src);
  if (id) {
    const thumb = poster || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    return html`<div class="video-embed">${img(thumb, '')}<button type="button" data-video="https://www.youtube-nocookie.com/embed/${id}?autoplay=1" aria-label="${ctx.t(
      'misc.playVideo'
    )}">${icon('play')}</button></div>`;
  }
  return html`<div class="video-embed"><video src="${src}" controls preload="none"${attr('poster', poster)} playsinline></video></div>`;
}

export function gallery(ctx, items = [], fallbackIcon = 'compass') {
  if (!items.length) return '';
  return html`<ul class="gallery">${items.map((g) =>
    g.video
      ? html`<li>${videoEmbed(ctx, g.video, g.image)}${g.alt ? html`<p class="field__hint" style="margin-top:8px">${g.alt}</p>` : ''}</li>`
      : html`<li><figure>${cover({ image: g.image, alt: g.alt || '', iconName: fallbackIcon })}${g.alt ? html`<figcaption>${g.alt}</figcaption>` : ''}</figure></li>`
  )}</ul>`;
}

export { icon, logoMark, wordmark, formatDate, isoDate, label };
