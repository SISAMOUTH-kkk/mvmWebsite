// Tour pages: the tour hub (replaces the generic layout of a service that has
// tour packages, e.g. /la/services/tour-travel/) and one page per package.
import { html, raw } from '../lib/html.mjs';
import { md, mdInline, plain } from '../lib/markdown.mjs';
import { layout } from '../components/layout.mjs';
import { crumbs, band, lattice, picture, ctaBand, icon, contactLinks, breadcrumbJsonLd } from '../components/ui.mjs';

const dayLabel = (ctx, n) => ctx.t('tour.day').replace('{n}', n);
const tourHref = (ctx, s, t) => ctx.u('services', s.slug, t.slug);
const quoteHref = (ctx, s, t) =>
  `${ctx.u('quote')}?service=${encodeURIComponent(s.quote_option || 'tour')}${t ? `&tour=${encodeURIComponent(t.title)}` : ''}`;

function heroSlides(photos, alt = '') {
  const list = (photos || []).filter((p) => p && p.image);
  if (!list.length) return '';
  return html`<div class="tour-hero__media" aria-hidden="true"${list.length > 1 ? raw(' data-slides') : ''}>${list.map((p, i) =>
    picture(p.image, alt, { pictureCls: i === 0 ? 'is-active' : 'slide', eager: i === 0, width: 1600, height: 700 })
  )}</div>`;
}

function placeLabels(photos) {
  const list = (photos || []).filter((p) => p && p.image && p.place);
  if (!list.length) return '';
  return html`<p class="tour-hero__place" data-slide-labels aria-hidden="true">${list.map(
    (p, i) => html`<span class="${i === 0 ? 'is-active' : ''}">${icon('pin')}${p.place}</span>`
  )}</p>`;
}

export function tourCard(ctx, s, t, { headingTag = 'h3' } = {}) {
  const open = raw(`<${headingTag} class="tour-card__title">`);
  const close = raw(`</${headingTag}>`);
  return html`<a class="tour-card" href="${tourHref(ctx, s, t)}" data-reveal>
  <div class="tour-card__media">
    ${picture(t.image || t.hero_image, '', { width: 800, height: 600 })}
    ${t.duration ? html`<span class="tour-card__badge">${t.duration}</span>` : ''}
  </div>
  <div class="tour-card__body">
    ${t.route ? html`<p class="tour-card__route">${icon('route')}${t.route}</p>` : ''}
    ${open}${t.title}${close}
    ${t.summary ? html`<p class="tour-card__text">${t.summary}</p>` : ''}
    ${t.transport ? html`<p class="tour-card__meta">${icon('train')}${t.transport}</p>` : ''}
    <span class="link">${ctx.t('tour.viewItinerary')} ${icon('arrow')}</span>
  </div>
</a>`;
}

// ---------------------------------------------------------------------------
// Hub: /<lang>/services/<service>/
// ---------------------------------------------------------------------------
export function tourHub(ctx, s, tours) {
  const trail = [{ label: ctx.t('nav.services'), href: ctx.u('services') }, { label: s.title }];
  const title = s.hub_title || s.title;
  const facts = (s.hub_facts || []).filter(Boolean);
  const destinations = (s.destinations || []).filter((d) => d && d.name);
  const info = (s.travel_info || []).filter((x) => x && x.title);
  const help = (s.help || []).filter(Boolean);
  const steps = (s.process || []).filter(Boolean);

  const body = html`
<section class="tour-hero t-dark">
  ${heroSlides(s.hero_photos)}
  <div class="tour-hero__shade" aria-hidden="true"></div>
  <div class="wrap tour-hero__inner">
    ${crumbs(ctx, trail)}
    <p class="eyebrow">${s.title}</p>
    <h1 class="tour-hero__title">${title}</h1>
    ${s.hub_lead ? html`<p class="tour-hero__lead">${s.hub_lead}</p>` : ''}
    ${facts.length ? html`<ul class="tour-hero__facts">${facts.map((f) => html`<li>${icon('check')}${f}</li>`)}</ul>` : ''}
    <div class="btn-row">
      <a class="btn btn--gold btn--lg" href="#packages">${ctx.t('tour.seePackages')} ${icon('arrow')}</a>
      <a class="btn btn--outline btn--lg" href="${quoteHref(ctx, s)}">${ctx.t('cta.requestQuote')}</a>
    </div>
    ${placeLabels(s.hero_photos)}
  </div>
  ${band()}
</section>

<section class="section t-paper" id="packages" aria-labelledby="packages-title">
  <div class="wrap">
    <div class="section__head" data-reveal>
      <div>
        <h2 class="section__title" id="packages-title">${ctx.t('tour.packages')}</h2>
        ${s.packages_intro ? html`<p class="section__intro">${s.packages_intro}</p>` : ''}
      </div>
      <a class="link" href="${quoteHref(ctx, s)}">${ctx.t('cta.requestQuote')} ${icon('arrow')}</a>
    </div>
    <div class="tour-grid">${tours.map((t) => tourCard(ctx, s, t))}</div>
    <p class="tour-note" data-reveal>${icon('compass')}<span>${ctx.t('tour.note')}</span></p>
  </div>
</section>

${destinations.length
  ? html`<section class="section t-dark" id="destinations" aria-labelledby="dest-title">
  ${lattice('lattice--fade')}
  <div class="wrap" style="position:relative">
    <div class="section__head" data-reveal>
      <div>
        <h2 class="section__title" id="dest-title">${ctx.t('tour.destinations')}</h2>
        ${s.destinations_intro ? html`<p class="section__intro">${s.destinations_intro}</p>` : ''}
      </div>
    </div>
    <div class="dests">${destinations.map(
      (d) => html`<article class="dest" data-reveal>
      <div class="dest__media">${picture(d.image, d.name, { width: 800, height: 600 })}</div>
      <div class="dest__body">
        <h3 class="dest__name">${d.name}</h3>
        ${d.text ? html`<p class="dest__text">${d.text}</p>` : ''}
        ${d.sights?.length
          ? html`<div class="dest__sights"><p class="dest__label">${ctx.t('tour.sights')}</p><ul class="champa-list">${d.sights.map((x) => html`<li>${x}</li>`)}</ul></div>`
          : ''}
        <dl class="dest__meta">
          ${d.stay ? html`<div>${icon('bed')}<dt>${ctx.t('tour.stay')}</dt><dd>${d.stay}</dd></div>` : ''}
          ${d.getting_there ? html`<div>${icon('train')}<dt>${ctx.t('tour.gettingThere')}</dt><dd>${d.getting_there}</dd></div>` : ''}
          ${d.time ? html`<div>${icon('clock')}<dt>${ctx.t('tour.time')}</dt><dd>${d.time}</dd></div>` : ''}
        </dl>
      </div>
    </article>`
    )}</div>
  </div>
</section>`
  : ''}

${info.length
  ? html`<section class="section t-paper" id="info" aria-labelledby="info-title">
  <div class="wrap">
    <div class="section__head" data-reveal>
      <div>
        <h2 class="section__title" id="info-title">${ctx.t('tour.info')}</h2>
        ${s.info_intro ? html`<p class="section__intro">${s.info_intro}</p>` : ''}
      </div>
    </div>
    <div class="info-grid">${info.map(
      (x) => html`<article class="info-card" data-reveal>${icon(x.icon || 'compass')}<h3>${x.title}</h3><div class="info-card__text">${md(x.text)}</div></article>`
    )}</div>
  </div>
</section>`
  : ''}

${help.length || steps.length
  ? html`<section class="section t-dark" aria-labelledby="more-title">
  <div class="wrap split split--even">
    ${help.length
      ? html`<div data-reveal>
      <h2 class="section__title" id="more-title">${ctx.t('tour.more')}</h2>
      <ul class="help-list help-list--dark">${help.map((h) =>
        typeof h === 'string' ? html`<li><strong>${h}</strong></li>` : html`<li><strong>${h.title}</strong>${h.text ? html`<span>${h.text}</span>` : ''}</li>`
      )}</ul>
    </div>`
      : ''}
    ${steps.length
      ? html`<div data-reveal>
      <h2 class="section__title">${ctx.t('tour.how')}</h2>
      <ol class="steps">${steps.map((st) => html`<li><h3>${st.title}</h3>${st.text ? html`<p>${st.text}</p>` : ''}</li>`)}</ol>
    </div>`
      : ''}
  </div>
</section>`
  : ''}

${s.faq?.length
  ? html`<section class="section t-paper" aria-labelledby="faq-title">
  <div class="wrap wrap--narrow">
    <h2 class="section__title" id="faq-title" style="margin-bottom:28px">${ctx.t('service.faq')}</h2>
    <div class="faq">${s.faq.map(
      (f) => html`<details><summary>${f.question}${icon('plus')}</summary><div class="faq__answer">${md(f.answer)}</div></details>`
    )}</div>
    ${s.hub_credit ? html`<p class="photo-credit">${mdInline(s.hub_credit)}</p>` : ''}
  </div>
</section>`
  : s.hub_credit
    ? html`<div class="wrap"><p class="photo-credit">${mdInline(s.hub_credit)}</p></div>`
    : ''}

${ctaBand(ctx, {
  title: ctx.t('tour.ctaTitle'),
  text: ctx.t('tour.ctaText'),
  actions: html`<a class="btn btn--gold" href="${quoteHref(ctx, s)}">${ctx.t('cta.requestQuote')}</a><a class="btn btn--outline" href="${ctx.u('contact')}?service=${s.quote_option || 'tour'}">${ctx.t('cta.contactUs')}</a>`,
})}`;

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: title,
      description: s.hub_lead || s.summary,
      serviceType: s.title,
      areaServed: { '@type': 'Country', name: 'Laos' },
      provider: { '@type': 'Organization', name: ctx.settings.site_name || 'MVM GROUP', url: ctx.abs('/') },
      url: ctx.abs(ctx.u('services', s.slug)),
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: ctx.t('tour.packages'),
        itemListElement: tours.map((t) => ({ '@type': 'Offer', itemOffered: { '@type': 'TouristTrip', name: t.title, url: ctx.abs(tourHref(ctx, s, t)) } })),
      },
    },
    breadcrumbJsonLd(ctx, trail),
  ];
  if (s.faq?.length) {
    jsonld.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: s.faq.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: plain(f.answer, 1000) } })),
    });
  }

  return layout(ctx, {
    segments: ['services', s.slug],
    nav: 'services',
    title: s.seo_title || title,
    description: s.seo_description || s.hub_lead || s.summary,
    image: s.hero_photos?.[0]?.image || s.image,
    body,
    jsonld,
  });
}

// ---------------------------------------------------------------------------
// Package: /<lang>/services/<service>/<tour>/
// ---------------------------------------------------------------------------
export function tourDetail(ctx, s, t, tours) {
  const trail = [
    { label: ctx.t('nav.services'), href: ctx.u('services') },
    { label: s.hub_title || s.title, href: ctx.u('services', s.slug) },
    { label: t.title },
  ];
  const others = tours.filter((x) => x.slug !== t.slug);
  const days = (t.days || []).filter(Boolean);
  const whatsapp = contactLinks(ctx).find((l) => l.key === 'whatsapp' && l.href);
  const facts = [
    { k: 'tour.duration', v: t.duration, i: 'clock' },
    { k: 'tour.route', v: t.route, i: 'route' },
    { k: 'tour.start', v: t.start, i: 'pin' },
    { k: 'tour.end', v: t.end, i: 'pin' },
    { k: 'tour.transport', v: t.transport, i: 'train' },
    { k: 'tour.bestFor', v: t.best_for, i: 'users' },
  ].filter((f) => f.v);

  const bookBox = html`<div class="quote-box tour-book">
    <h2>${ctx.t('tour.request')}<span class="price">${ctx.t('service.pricingNote')}</span></h2>
    <p>${ctx.t('tour.requestText')}</p>
    <div class="btn-row">
      <a class="btn btn--gold btn--block" href="${quoteHref(ctx, s, t)}">${ctx.t('tour.request')}</a>
      ${whatsapp
        ? html`<a class="btn btn--outline btn--block" href="${whatsapp.href}" target="_blank" rel="noopener">${icon('whatsapp')} WhatsApp</a>`
        : html`<a class="btn btn--outline btn--block" href="${ctx.u('contact')}?service=${s.quote_option || 'tour'}">${ctx.t('cta.contactUs')}</a>`}
    </div>
  </div>`;

  const body = html`
<section class="tour-hero tour-hero--detail t-dark">
  ${heroSlides([{ image: t.hero_image || t.image }])}
  <div class="tour-hero__shade" aria-hidden="true"></div>
  <div class="wrap tour-hero__inner">
    ${crumbs(ctx, trail)}
    ${t.duration ? html`<p class="eyebrow">${t.duration}</p>` : ''}
    <h1 class="tour-hero__title tour-hero__title--detail">${t.title}</h1>
    ${t.summary ? html`<p class="tour-hero__lead">${t.summary}</p>` : ''}
    ${t.route ? html`<p class="tour-hero__route">${icon('route')}${t.route}</p>` : ''}
    <div class="btn-row">
      <a class="btn btn--gold btn--lg" href="${quoteHref(ctx, s, t)}">${ctx.t('tour.request')} ${icon('arrow')}</a>
      <a class="btn btn--outline btn--lg" href="#itinerary">${ctx.t('tour.itinerary')}</a>
    </div>
  </div>
  ${band()}
</section>

<section class="section t-paper">
  <div class="wrap detail detail--tour">
    <aside class="detail__aside">
      <dl class="tour-facts">${facts.map((f) => html`<div>${icon(f.i)}<dt>${ctx.t(f.k)}</dt><dd>${f.v}</dd></div>`)}</dl>
      ${bookBox}
    </aside>
    <div>
      ${t.overview
        ? html`<section class="block"><h2 class="block__title">${ctx.t('tour.overview')}</h2><div class="prose">${md(t.overview)}</div></section>`
        : ''}
      ${t.highlights?.length
        ? html`<section class="block"><h2 class="block__title">${ctx.t('tour.highlights')}</h2>
          <ul class="champa-list tour-highlights">${t.highlights.map((h) => html`<li>${h}</li>`)}</ul></section>`
        : ''}
      ${days.length
        ? html`<section class="block" id="itinerary"><h2 class="block__title">${ctx.t('tour.itinerary')}</h2>
          <ol class="itinerary">${days.map(
            (d, i) => html`<li class="itinerary__day">
            <div class="itinerary__marker" aria-hidden="true"><span>${i + 1}</span></div>
            <div class="itinerary__body">
              <p class="itinerary__label">${dayLabel(ctx, i + 1)}</p>
              <h3 class="itinerary__title">${d.title}</h3>
              ${d.text ? html`<div class="prose">${md(d.text)}</div>` : ''}
              ${d.visits?.length
                ? html`<div class="itinerary__part"><p class="itinerary__part-label">${icon('pin')}${ctx.t('tour.visit')}</p>
                  <ul class="itinerary__visits">${d.visits.map((v) => html`<li>${v}</li>`)}</ul></div>`
                : ''}
              <dl class="itinerary__meta">
                ${d.overnight ? html`<div>${icon('bed')}<dt>${ctx.t('tour.overnight')}</dt><dd>${d.overnight}</dd></div>` : ''}
                ${d.transport ? html`<div>${icon('train')}<dt>${ctx.t('tour.transport')}</dt><dd>${d.transport}</dd></div>` : ''}
              </dl>
            </div>
          </li>`
          )}</ol></section>`
        : ''}
      ${t.includes?.length || t.excludes?.length
        ? html`<section class="block"><div class="incl">
          ${t.includes?.length
            ? html`<div><h2 class="block__title">${ctx.t('tour.includes')}</h2><ul class="incl__list incl__list--yes">${t.includes.map(
                (x) => html`<li>${icon('check')}<span>${x}</span></li>`
              )}</ul></div>`
            : ''}
          ${t.excludes?.length
            ? html`<div><h2 class="block__title">${ctx.t('tour.excludes')}</h2><ul class="incl__list incl__list--no">${t.excludes.map(
                (x) => html`<li>${icon('plus')}<span>${x}</span></li>`
              )}</ul></div>`
            : ''}
        </div></section>`
        : ''}
      <p class="tour-note">${icon('compass')}<span>${ctx.t('tour.note')}</span></p>
      ${t.photo_credit ? html`<p class="photo-credit">${mdInline(t.photo_credit)}</p>` : ''}
    </div>
  </div>
</section>

${others.length
  ? html`<section class="section section--tight t-dark" aria-labelledby="other-tours">
  <div class="wrap">
    <div class="section__head"><h2 class="section__title" id="other-tours">${ctx.t('tour.other')}</h2>
    <a class="link" href="${ctx.u('services', s.slug)}#packages">${ctx.t('tour.all')} ${icon('arrow')}</a></div>
    <div class="tour-grid tour-grid--3">${others.slice(0, 3).map((x) => tourCard(ctx, s, x))}</div>
  </div>
</section>`
  : ''}

${ctaBand(ctx, {
  title: ctx.t('tour.ctaTitle'),
  text: ctx.t('tour.ctaText'),
  actions: html`<a class="btn btn--gold" href="${quoteHref(ctx, s, t)}">${ctx.t('tour.request')}</a><a class="btn btn--outline" href="${ctx.u('contact')}?service=${s.quote_option || 'tour'}">${ctx.t('cta.contactUs')}</a>`,
})}`;

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      name: t.title,
      description: t.summary || plain(t.overview),
      touristType: t.best_for || undefined,
      url: ctx.abs(tourHref(ctx, s, t)),
      ...(t.hero_image || t.image ? { image: ctx.abs(t.hero_image || t.image) } : {}),
      provider: { '@type': 'Organization', name: ctx.settings.site_name || 'MVM GROUP', url: ctx.abs('/') },
      itinerary: {
        '@type': 'ItemList',
        itemListElement: days.map((d, i) => ({ '@type': 'ListItem', position: i + 1, name: `${dayLabel(ctx, i + 1)}: ${d.title}` })),
      },
    },
    breadcrumbJsonLd(ctx, trail),
  ];

  return layout(ctx, {
    segments: ['services', s.slug, t.slug],
    nav: 'services',
    title: t.seo_title || t.title,
    description: t.seo_description || t.summary || plain(t.overview),
    image: t.hero_image || t.image,
    body,
    jsonld,
  });
}
