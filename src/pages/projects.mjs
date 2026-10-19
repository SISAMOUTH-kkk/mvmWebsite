import { html } from '../lib/html.mjs';
import { md, plain } from '../lib/markdown.mjs';
import { layout } from '../components/layout.mjs';
import { pageHero, projectCard, projectCategory, cover, gallery, ctaBand, icon, breadcrumbJsonLd, label } from '../components/ui.mjs';
import { PROJECT_CATEGORIES } from '../lib/taxonomies.mjs';

export function projectsIndex(ctx) {
  const p = ctx.pages;
  const trail = [{ label: ctx.t('nav.projects') }];
  const used = PROJECT_CATEGORIES.filter((c) => ctx.projects.some((x) => x.category === c.key));
  const body = html`${pageHero(ctx, { title: p.projects_title || ctx.t('nav.projects'), lead: p.projects_lead, trail })}
<section class="section t-paper">
  <div class="wrap">
    ${used.length > 1
      ? html`<div class="filters" role="group" aria-label="${ctx.t('project.category')}" data-filter-group="project-grid">
        <button type="button" data-filter="all" aria-pressed="true">${ctx.t('news.all')}</button>
        ${used.map((c) => html`<button type="button" data-filter="${c.key}" aria-pressed="false">${label(c, ctx.lang)}</button>`)}
      </div>`
      : ''}
    <div class="grid grid--3" id="project-grid">${ctx.projects.map((x) => projectCard(ctx, x, { headingTag: 'h2' }))}</div>
    <p class="empty" data-filter-empty hidden>${ctx.t('project.empty')}</p>
  </div>
</section>
${ctaBand(ctx)}`;
  return layout(ctx, {
    segments: ['projects'],
    nav: 'projects',
    title: p.projects_title || ctx.t('nav.projects'),
    description: p.projects_lead,
    body,
    jsonld: [breadcrumbJsonLd(ctx, trail)],
  });
}

export function projectDetail(ctx, pr) {
  const cat = projectCategory(pr.category);
  const trail = [{ label: ctx.t('nav.projects'), href: ctx.u('projects') }, { label: pr.title }];
  const services = (pr.services || []).map((slug) => ctx.services.find((s) => s.slug === slug)).filter(Boolean);
  const related = ctx.projects.filter((x) => x.slug !== pr.slug && x.category === pr.category).concat(ctx.projects.filter((x) => x.slug !== pr.slug && x.category !== pr.category)).slice(0, 3);

  const facts = [
    { k: ctx.t('project.client'), v: pr.client },
    { k: ctx.t('project.category'), v: cat ? label(cat, ctx.lang) : '' },
    { k: ctx.t('project.year'), v: pr.year },
    { k: ctx.t('project.location'), v: pr.location },
  ].filter((f) => f.v);

  const body = html`${pageHero(ctx, {
    title: pr.title,
    lead: pr.summary,
    trail,
    extra: pr.sample ? html`<p style="margin-top:18px"><span class="tag tag--sample">${ctx.t('project.sample')}</span></p>` : '',
  })}
<section class="section t-paper">
  <div class="wrap detail">
    <aside class="detail__aside">
      <dl class="registry" style="grid-template-columns:1fr">
        ${facts.map((f) => html`<div><dt>${f.k}</dt><dd>${f.v}</dd></div>`)}
        ${services.length
          ? html`<div><dt>${ctx.t('project.services')}</dt><dd>${services.map(
              (s, i) => html`${i ? ', ' : ''}<a class="link" href="${ctx.u('services', s.slug)}">${s.title}</a>`
            )}</dd></div>`
          : ''}
      </dl>
      <p style="margin-top:24px"><a class="btn btn--gold btn--block" href="${ctx.u('quote')}">${ctx.t('cta.requestQuote')}</a></p>
    </aside>
    <div>
      ${cover({ image: pr.cover, alt: pr.cover_alt || pr.title, iconName: cat?.icon, ratio: '16 / 9', eager: true })}
      <div class="prose" style="margin-top:40px">${md(pr.body)}</div>
      ${pr.gallery?.length ? html`<div class="block" style="margin-top:56px"><h2 class="block__title">${ctx.t('project.gallery')}</h2>${gallery(ctx, pr.gallery, cat?.icon)}</div>` : ''}
    </div>
  </div>
</section>
${related.length
  ? html`<section class="section section--tight t-dark"><div class="wrap">
  <div class="section__head"><h2 class="section__title">${ctx.t('project.related')}</h2><a class="link" href="${ctx.u('projects')}">${ctx.t('cta.viewProjects')} ${icon('arrow')}</a></div>
  <div class="grid grid--3">${related.map((x) => projectCard(ctx, x))}</div></div></section>`
  : ''}
${ctaBand(ctx)}`;

  return layout(ctx, {
    segments: ['projects', pr.slug],
    nav: 'projects',
    title: pr.seo_title || pr.title,
    description: pr.seo_description || pr.summary || plain(pr.body),
    image: pr.cover,
    body,
    jsonld: [breadcrumbJsonLd(ctx, trail)],
    noindex: pr.sample === true,
  });
}
