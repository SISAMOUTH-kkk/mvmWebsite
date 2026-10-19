import { html, raw } from '../lib/html.mjs';
import { md, plain } from '../lib/markdown.mjs';
import { layout } from '../components/layout.mjs';
import { pageHero, lattice, img, serviceCard, brandPanel, ctaBand, icon, breadcrumbJsonLd, isPlaceholder } from '../components/ui.mjs';

const SILHOUETTE = raw(
  '<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><circle cx="60" cy="44" r="22"/><path d="M14 120c4-28 22-44 46-44s42 16 46 44"/></svg>'
);

export function aboutPage(ctx) {
  const a = ctx.about;
  const s = ctx.settings;
  const company = s.company || {};
  const trail = [{ label: ctx.t('nav.about') }];
  const units = ctx.units.filter((u) => u.status !== 'planned');

  const registry = [
    { k: ctx.t('about.legalName'), v: company.legal_name },
    { k: ctx.t('footer.registration'), v: company.registration_no },
    { k: ctx.t('about.taxId'), v: company.tax_id },
    { k: ctx.t('about.registeredAddress'), v: company.registered_address },
  ];

  const body = html`${pageHero(ctx, {
    title: a.hero_title || ctx.t('nav.aboutGroup'),
    lead: a.hero_lead,
    trail,
    art: img('/img/illustrations/laos.svg', '', { eager: true }),
  })}

<section class="section t-paper" id="story" aria-labelledby="story-title">
  <div class="wrap split">
    <div data-reveal>
      <h2 class="section__title" id="story-title">${ctx.t('about.history')}</h2>
      ${a.statement ? html`<p class="statement" style="margin-top:28px">${a.statement}</p>` : ''}
    </div>
    <div data-reveal>
      <div class="prose">${md(a.story)}</div>
      ${a.milestones?.length
        ? html`<h3 style="font-size:1.2rem;margin:40px 0 20px">${ctx.t('about.milestones')}</h3>
          <ol class="milestones">${a.milestones.map((m) => html`<li><strong>${m.year}</strong>${m.text}</li>`)}</ol>`
        : ''}
    </div>
  </div>
</section>

<section class="section t-dark" aria-labelledby="vision-title">
  ${lattice('lattice--fade')}
  <div class="wrap" style="position:relative">
    <div class="split">
      <div data-reveal>
        <h2 class="section__title" id="vision-title">${ctx.t('about.vision')}</h2>
      </div>
      <p class="statement" data-reveal>${a.vision}</p>
    </div>
    <div class="vm" style="margin-top:clamp(48px,6vw,80px)">
      <div class="plate" data-reveal>
        <h3>${ctx.t('about.mission')}</h3>
        <ul class="champa-list">${(a.mission || []).map((m) => html`<li>${m}</li>`)}</ul>
      </div>
      <div class="plate" data-reveal>
        <h3>${ctx.t('about.goals')}</h3>
        <ul class="champa-list">${(a.goals || []).map((m) => html`<li>${m}</li>`)}</ul>
      </div>
    </div>
  </div>
</section>

<section class="section t-paper" aria-labelledby="strengths-title">
  <div class="wrap">
    <div class="section__head" data-reveal><div><h2 class="section__title" id="strengths-title">${ctx.t('about.strengths')}</h2>
    ${a.strengths_intro ? html`<p class="section__intro">${a.strengths_intro}</p>` : ''}</div></div>
    <div class="feature-grid" data-count="${(a.strengths || []).length}">${(a.strengths || []).map((x) => html`<div data-reveal><h3>${x.title}</h3><p>${x.text}</p></div>`)}</div>
  </div>
</section>

<section class="section t-paper" style="padding-top:0" aria-labelledby="units-title">
  <div class="wrap">
    <div class="section__head" data-reveal><div><h2 class="section__title" id="units-title">${ctx.t('nav.businessUnits')}</h2>
    ${a.units_intro ? html`<p class="section__intro">${a.units_intro}</p>` : ''}</div></div>
    <div class="grid grid--2">${units.map(
      (u) => html`<a class="plate service-card" href="${u.link || ctx.u('group', u.slug)}" data-reveal>
        ${raw(`<svg class="icon service-card__icon" aria-hidden="true"><use href="#i-${u.icon || 'building'}"></use></svg>`)}
        <h3>${u.title}</h3><p>${u.summary}</p>
        <span class="link">${ctx.t('cta.learnMore')} ${icon('arrow')}</span></a>`
    )}</div>
  </div>
</section>

<section class="section t-navy" aria-labelledby="coop-title">
  ${lattice('lattice--right')}
  <div class="wrap" style="position:relative">
    <div class="section__head" data-reveal><div><h2 class="section__title" id="coop-title">${ctx.t('about.cooperation')}</h2>
    ${a.cooperation_intro ? html`<p class="section__intro">${a.cooperation_intro}</p>` : ''}</div></div>
    <ul class="bridge">${(a.cooperation || []).map((c) => html`<li data-reveal><h3>${c.title}</h3><p>${c.text}</p></li>`)}</ul>
    ${a.areas?.length
      ? html`<h3 style="font-size:1.35rem;margin:clamp(48px,6vw,72px) 0 20px">${ctx.t('about.areas')}</h3>
        <ul class="help-list help-list--wide">${a.areas.map((x) => html`<li><strong>${x.name}</strong><span>${x.text}</span></li>`)}</ul>`
      : ''}
  </div>
</section>

<section class="section t-paper" aria-labelledby="team-title">
  <div class="wrap">
    <div class="section__head" data-reveal><div><h2 class="section__title" id="team-title">${ctx.t('about.team')}</h2>
    ${a.team_intro ? html`<p class="section__intro">${a.team_intro}</p>` : ''}</div></div>
    <ul class="team">${ctx.team.map(
      (m) => html`<li class="${m.placeholder ? 'is-placeholder' : ''}" data-reveal>
        <div class="team__photo">${m.photo ? img(m.photo, m.name) : SILHOUETTE}</div>
        <h3>${m.name}</h3><p>${m.position}</p>${m.bio ? html`<p style="margin-top:8px">${m.bio}</p>` : ''}
      </li>`
    )}</ul>
  </div>
</section>

<section class="section t-paper" style="padding-top:0" aria-labelledby="reg-title">
  <div class="wrap">
    <h2 class="block__title" id="reg-title">${ctx.t('about.registration')}</h2>
    <dl class="registry">${registry.map(
      (r) => html`<div class="${isPlaceholder(r.v) ? 'is-placeholder' : ''}"><dt>${r.k}</dt><dd>${isPlaceholder(r.v) ? ctx.t('misc.placeholder') : r.v}</dd></div>`
    )}</dl>
    ${company.licenses?.length
      ? html`<ul class="doc-list" style="margin-top:24px">${company.licenses.map(
          (l) => html`<li>${icon('file')}<span>${l.file ? html`<a class="link" href="${l.file}" target="_blank" rel="noopener">${l.title}</a>` : l.title}</span></li>`
        )}</ul>`
      : ''}
  </div>
</section>
${ctaBand(ctx)}`;

  return layout(ctx, {
    segments: ['about'],
    nav: 'about',
    title: a.seo_title || a.hero_title || ctx.t('nav.aboutGroup'),
    description: a.seo_description || a.hero_lead || plain(a.story),
    body,
    jsonld: [breadcrumbJsonLd(ctx, trail)],
  });
}

// Business unit pages: /<lang>/group/<unit>/
export function unitPage(ctx, unit) {
  const trail = [{ label: ctx.t('nav.about'), href: ctx.u('about') }, { label: unit.title }];
  const services = ctx.services.filter((s) => s.unit === unit.slug);
  const brands = ctx.brands.filter((b) => b.unit === unit.slug);
  const body = html`${pageHero(ctx, {
    title: unit.title,
    lead: unit.summary,
    trail,
    art: raw(`<svg class="icon" style="width:100%;height:auto;max-width:220px;margin-left:auto;color:var(--gold);stroke-width:.6;opacity:.85" aria-hidden="true"><use href="#i-${unit.icon || 'building'}"></use></svg>`),
  })}
${unit.image
  ? html`<section class="section t-paper"><div class="wrap split split--center">
    <div>${img(unit.image, unit.title)}</div>
    <div class="prose">${md(unit.description)}</div></div></section>`
  : unit.description
    ? html`<section class="section t-paper"><div class="wrap"><div class="prose" style="font-size:var(--fs-lead)">${md(unit.description)}</div></div></section>`
    : ''}
${services.length
  ? html`<section class="section t-dark"><div class="wrap">
    <div class="section__head"><h2 class="section__title">${ctx.t('section.services')}</h2></div>
    <div class="grid grid--3">${services.map((s) => serviceCard(ctx, s))}</div></div></section>`
  : ''}
${brands.length
  ? html`<section class="section t-forest"><div class="wrap">
    <div class="section__head"><h2 class="section__title">${ctx.t('section.brands')}</h2></div>
    <div class="grid grid--2">${brands.map((b) => brandPanel(ctx, b))}</div></div></section>`
  : ''}
${ctaBand(ctx)}`;

  return layout(ctx, {
    segments: ['group', unit.slug],
    nav: 'about',
    title: unit.seo_title || unit.title,
    description: unit.seo_description || unit.summary,
    image: unit.image,
    body,
    jsonld: [breadcrumbJsonLd(ctx, trail)],
  });
}
