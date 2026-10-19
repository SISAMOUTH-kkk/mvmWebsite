import { html, raw } from '../lib/html.mjs';
import { md, plain } from '../lib/markdown.mjs';
import { layout } from '../components/layout.mjs';
import { pageHero, serviceCard, ctaBand, icon, breadcrumbJsonLd } from '../components/ui.mjs';
import { tourHub } from './tours.mjs';

export function servicesIndex(ctx) {
  const p = ctx.pages;
  const units = ctx.units.filter((u) => u.status !== 'planned');
  const grouped = units
    .map((unit) => ({ unit, services: ctx.services.filter((s) => s.unit === unit.slug) }))
    .filter((g) => g.services.length);
  const ungrouped = ctx.services.filter((s) => !units.some((u) => u.slug === s.unit));
  const trail = [{ label: ctx.t('nav.services') }];

  const body = html`${pageHero(ctx, { title: p.services_title || ctx.t('section.services'), lead: p.services_lead, trail })}
<section class="section t-paper">
  <div class="wrap">
    ${grouped.map(
      (g) => html`<div class="unit-group">
      <div class="unit-group__head" data-reveal>
        <h2>${g.unit.title}</h2>
        ${g.unit.summary ? html`<p class="muted">${g.unit.summary}</p>` : ''}
      </div>
      <div class="grid grid--3">${g.services.map((s) => serviceCard(ctx, s))}</div>
    </div>`
    )}
    ${ungrouped.length ? html`<div class="unit-group"><div class="grid grid--3">${ungrouped.map((s) => serviceCard(ctx, s))}</div></div>` : ''}
  </div>
</section>
${ctaBand(ctx)}`;

  return layout(ctx, {
    segments: ['services'],
    nav: 'services',
    title: p.services_title || ctx.t('section.services'),
    description: p.services_lead,
    body,
    jsonld: [breadcrumbJsonLd(ctx, trail)],
  });
}

export function serviceDetail(ctx, s) {
  // A service with tour packages gets the dedicated tour page.
  const tours = (ctx.tours || []).filter((t) => t.service === s.slug);
  if (tours.length) return tourHub(ctx, s, tours);

  const unit = ctx.units.find((u) => u.slug === s.unit);
  const others = ctx.services.filter((x) => x.slug !== s.slug);
  const quoteKey = s.quote_option || '';
  const quoteHref = `${ctx.u('quote')}${quoteKey ? `?service=${quoteKey}` : ''}`;
  const contactHref = `${ctx.u('contact')}${quoteKey ? `?service=${quoteKey}` : ''}`;
  const trail = [{ label: ctx.t('nav.services'), href: ctx.u('services') }, { label: s.title }];

  const sections = [
    { id: 'about', title: ctx.t('service.whatIs'), show: !!s.intro },
    { id: 'who', title: ctx.t('service.whoFor'), show: s.audience?.length },
    { id: 'help', title: ctx.t('service.help'), show: s.help?.length },
    { id: 'process', title: ctx.t('service.process'), show: s.process?.length },
    { id: 'documents', title: ctx.t('service.documents'), show: s.documents?.length },
    { id: 'timeline', title: ctx.t('service.timeline'), show: s.timeline?.length },
    { id: 'faq', title: ctx.t('service.faq'), show: s.faq?.length },
  ].filter((x) => x.show);

  const quoteBox = html`<div class="quote-box">
    <h2>${ctx.t('service.pricing')}<span class="price">${ctx.t('service.pricingNote')}</span></h2>
    <p>${ctx.t('service.pricingText')}</p>
    <div class="btn-row">
      <a class="btn btn--gold btn--block" href="${quoteHref}">${ctx.t('cta.requestQuote')}</a>
      <a class="btn btn--outline btn--block" href="${contactHref}">${ctx.t('cta.contactUs')}</a>
    </div>
  </div>`;

  const body = html`${pageHero(ctx, {
    title: s.title,
    lead: s.summary,
    trail,
    art: raw(`<svg class="icon" style="width:100%;height:auto;max-width:220px;margin-left:auto;color:var(--gold);stroke-width:.6;opacity:.85" aria-hidden="true"><use href="#i-${s.icon || 'compass'}"></use></svg>`),
    extra: unit ? html`<p style="margin-top:20px"><a class="tag" href="${unit.link || ctx.u('group', unit.slug)}" style="text-decoration:none">${ctx.t('service.unit')}: ${unit.title}</a></p>` : '',
    actions: html`<a class="btn btn--gold" href="${quoteHref}">${ctx.t('cta.requestQuote')}</a><a class="btn btn--outline" href="${contactHref}">${ctx.t('cta.contactUs')}</a>`,
  })}
<section class="section t-paper">
  <div class="wrap detail">
    <aside class="detail__aside">
      <nav class="toc" aria-label="${ctx.t('service.onThisPage')}">
        <p class="toc__title">${ctx.t('service.onThisPage')}</p>
        <ol>${sections.map((x) => html`<li><a href="#${x.id}">${x.title}</a></li>`)}</ol>
      </nav>
      ${quoteBox}
    </aside>
    <div>
      ${s.intro
        ? html`<section class="block" id="about"><h2 class="block__title">${ctx.t('service.whatIs')}</h2><div class="prose">${md(s.intro)}</div></section>`
        : ''}
      ${s.audience?.length
        ? html`<section class="block" id="who"><h2 class="block__title">${ctx.t('service.whoFor')}</h2>
          <ul class="audience">${s.audience.map((a) => html`<li>${typeof a === 'string' ? a : a.text}</li>`)}</ul></section>`
        : ''}
      ${s.help?.length
        ? html`<section class="block" id="help"><h2 class="block__title">${ctx.t('service.help')}</h2>
          <ul class="help-list">${s.help.map((h) =>
            typeof h === 'string' ? html`<li><strong>${h}</strong></li>` : html`<li><strong>${h.title}</strong>${h.text ? html`<span>${h.text}</span>` : ''}</li>`
          )}</ul></section>`
        : ''}
      ${s.process?.length
        ? html`<section class="block" id="process"><h2 class="block__title">${ctx.t('service.process')}</h2>
          <ol class="steps">${s.process.map((st) => html`<li><h3>${st.title}</h3>${st.text ? html`<p>${st.text}</p>` : ''}</li>`)}</ol></section>`
        : ''}
      ${s.documents?.length
        ? html`<section class="block" id="documents"><h2 class="block__title">${ctx.t('service.documents')}</h2>
          <ul class="doc-list">${s.documents.map((d) => html`<li>${icon('file')}<span>${typeof d === 'string' ? d : d.text}</span></li>`)}</ul>
          <p class="block__note">${ctx.t('service.documentsNote')}</p></section>`
        : ''}
      ${s.timeline?.length
        ? html`<section class="block" id="timeline"><h2 class="block__title">${ctx.t('service.timeline')}</h2>
          <table class="timeline-table"><tbody>${s.timeline.map(
            (r) => html`<tr><th scope="row">${r.item}</th><td>${r.duration}</td></tr>`
          )}</tbody></table>
          <p class="block__note">${ctx.t('service.timelineNote')}</p></section>`
        : ''}
      ${s.faq?.length
        ? html`<section class="block" id="faq"><h2 class="block__title">${ctx.t('service.faq')}</h2>
          <div class="faq">${s.faq.map(
            (f) => html`<details><summary>${f.question}${icon('plus')}</summary><div class="faq__answer">${md(f.answer)}</div></details>`
          )}</div></section>`
        : ''}
    </div>
  </div>
</section>
<section class="section section--tight t-dark" aria-labelledby="other-services">
  <div class="wrap">
    <div class="section__head"><h2 class="section__title" id="other-services">${ctx.t('service.other')}</h2>
    <a class="link" href="${ctx.u('services')}">${ctx.t('nav.allServices')} ${icon('arrow')}</a></div>
    <div class="grid grid--3">${others.slice(0, 3).map((x) => serviceCard(ctx, x, { bullets: 0 }))}</div>
  </div>
</section>
${ctaBand(ctx)}`;

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: s.title,
      description: s.summary,
      serviceType: s.title,
      areaServed: { '@type': 'Country', name: 'Laos' },
      provider: { '@type': 'Organization', name: ctx.settings.site_name || 'MVM GROUP', url: ctx.abs('/') },
      url: ctx.abs(ctx.u('services', s.slug)),
    },
    breadcrumbJsonLd(ctx, trail),
  ];
  if (s.faq?.length) {
    jsonld.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: s.faq.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: plain(f.answer, 1000) },
      })),
    });
  }

  return layout(ctx, {
    segments: ['services', s.slug],
    nav: 'services',
    title: s.seo_title || s.title,
    description: s.seo_description || s.summary || plain(s.intro),
    image: s.image,
    body,
    jsonld,
  });
}
