import { html, raw } from '../lib/html.mjs';
import { layout } from '../components/layout.mjs';
import { img, logoMark, wordmark, isPlaceholder } from '../components/ui.mjs';
import { THAT_LUANG } from '../components/art.mjs';

// Fallback when the CMS list is empty.
const DEFAULT_ROOMS = [
  { title: 'Tour & Travel', link: 'services/tour-travel', icon: 'mountain', kind: 'service', tone: 'navy' },
  { title: 'Government Documents', link: 'services/government-documentation', icon: 'document', kind: 'service', tone: 'red' },
  { title: 'Big Elephant Yogurt', link: 'brands/big-elephant-yogurt', icon: 'elephant', kind: 'brand', tone: 'green' },
  { title: 'Pa Daek Sophanua', link: 'brands/pa-daek-sophanua', icon: 'jar', kind: 'brand', tone: 'black' },
];
const TONES = ['navy', 'red', 'green', 'black'];

// Each business is a small Lao temple front (sim): a gable with a sunburst and
// flame edges, and the door below it.
function sim(ctx, r, i) {
  const external = /^https?:/.test(r.link || '');
  const href = external ? r.link : ctx.u(...String(r.link || '').split('/').filter(Boolean));
  const tone = TONES.includes(r.tone) ? r.tone : TONES[i % TONES.length];
  const mark = r.image
    ? img(r.image, '', { cls: 'sim__logo', eager: true })
    : raw(`<svg class="sim__icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${r.icon || 'compass'}"></use></svg>`);
  return html`<li class="sim sim--${tone}" style="--i:${i}">
  <a href="${href}"${external ? raw(' target="_blank" rel="noopener"') : ''}>
    <span class="sim__gable" aria-hidden="true"><span class="sim__sun">${mark}</span></span>
    <span class="sim__body">
      ${r.kind ? html`<span class="sim__kind">${ctx.t(r.kind === 'brand' ? 'home.kindBrand' : 'home.kindService')}</span>` : ''}
      <span class="sim__title">${r.title}</span>
      ${r.text ? html`<span class="sim__text">${r.text}</span>` : ''}
      <span class="sim__go">${ctx.t('home.enter')}</span>
    </span>
  </a>
</li>`;
}

export function homePage(ctx) {
  const h = ctx.home;
  const s = ctx.settings;
  const pillars = s.pillars?.length ? s.pillars : ['Business', 'Services', 'Brands', 'Opportunities'];
  const rooms = (h.rooms?.length ? h.rooms : DEFAULT_ROOMS).filter((r) => r && r.title);

  const heroMedia = h.hero_video
    ? html`<div class="hero__media"><video src="${h.hero_video}" autoplay muted loop playsinline${h.hero_image ? raw(` poster="${h.hero_image}"`) : ''}></video></div>`
    : h.hero_image
      ? html`<div class="hero__media">${img(h.hero_image, '', { eager: true })}</div>`
      : '';

  const body = html`
<section class="temple t-dark">
  ${heroMedia}
  <div class="temple__stencil" aria-hidden="true"></div>
  <div class="wrap temple__intro">
    ${logoMark('hero__mark', { bold: false, size: 190 })}
    <h1 class="hero__title">${wordmark('hero__wordmark', { height: 46 })}<span class="sr-only"> — ${h.hero_tagline || s.tagline}</span></h1>
    <ul class="hero__pillars">${pillars.map((p) => html`<li>${p}</li>`)}</ul>
    ${h.hero_text ? html`<p class="temple__text">${h.hero_text}</p>` : ''}
  </div>
  <div class="temple__art">${raw(THAT_LUANG)}</div>
  <div class="sinh" aria-hidden="true"></div>
  <div class="wrap temple__group">
    <h2 class="temple__heading" id="group-title"><span>${h.group_title || ctx.t('home.groupTitle')}</span></h2>
    <ul class="sims" aria-labelledby="group-title">${rooms.map((r, i) => sim(ctx, r, i))}</ul>
  </div>
  <div class="sinh sinh--foot" aria-hidden="true"></div>
</section>
`;

  const sameAs = [s.contact?.facebook, s.contact?.tiktok].filter((v) => v && !isPlaceholder(v));
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: s.company?.legal_name || s.site_name || 'MVM GROUP',
    alternateName: 'MVM GROUP',
    url: ctx.abs('/'),
    logo: ctx.abs(s.logo || '/brand/logo-mark.png'),
    description: s.description,
    address: { '@type': 'PostalAddress', addressCountry: 'LA', streetAddress: s.address || undefined },
    ...(isPlaceholder(s.contact?.email) ? {} : { email: s.contact.email }),
    ...(isPlaceholder(s.contact?.phone) ? {} : { telephone: s.contact.phone }),
    ...(sameAs.length ? { sameAs } : {}),
    brand: ctx.brands.map((b) => ({ '@type': 'Brand', name: b.name_en || b.title })),
  };
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: s.site_name || 'MVM GROUP',
    url: ctx.abs(ctx.u()),
    inLanguage: ctx.info.htmlLang,
  };

  return layout(ctx, {
    segments: [],
    nav: 'home',
    fullTitle: h.seo_title || `${s.site_name || 'MVM GROUP'} — ${s.tagline}`,
    description: h.seo_description || s.description,
    body,
    jsonld: [org, website],
  });
}
