import { html, raw } from '../lib/html.mjs';
import { md, plain } from '../lib/markdown.mjs';
import { layout } from '../components/layout.mjs';
import { pageHero, newsCard, newsCategory, cover, ctaBand, icon, breadcrumbJsonLd, formatDate, isoDate, label } from '../components/ui.mjs';
import { NEWS_CATEGORIES } from '../lib/taxonomies.mjs';

export const NEWS_PER_PAGE = 12;

function categoryNav(ctx, active) {
  const used = NEWS_CATEGORIES.filter((c) => ctx.news.some((n) => n.category === c.key));
  if (!used.length) return '';
  return html`<nav class="filters" aria-label="${ctx.t('news.categories')}">
    <a href="${ctx.u('news')}"${!active ? raw(' aria-current="page"') : ''}>${ctx.t('news.all')}</a>
    ${used.map((c) => html`<a href="${ctx.u('news', 'category', c.key)}"${active === c.key ? raw(' aria-current="page"') : ''}>${label(c, ctx.lang)}</a>`)}
  </nav>`;
}

// Listing used for /news/, /news/page/N/ and /news/category/<key>/[page/N/]
export function newsListing(ctx, { category, page = 1, posts, totalPages, baseSegments }) {
  const p = ctx.pages;
  const cat = category ? newsCategory(category) : null;
  const title = cat ? label(cat, ctx.lang) : p.news_title || ctx.t('nav.news');
  const trail = cat
    ? [{ label: ctx.t('nav.news'), href: ctx.u('news') }, { label: title }]
    : [{ label: ctx.t('nav.news') }];
  const segments = page > 1 ? [...baseSegments, 'page', String(page)] : baseSegments;
  const pageHref = (n) => (n === 1 ? ctx.u(...baseSegments) : ctx.u(...baseSegments, 'page', String(n)));
  const [first, ...rest] = posts;
  const showFeature = page === 1 && !category && first;

  const body = html`${pageHero(ctx, { title, lead: cat ? '' : p.news_lead, trail })}
<section class="section t-paper">
  <div class="wrap">
    ${categoryNav(ctx, category)}
    ${!posts.length ? html`<p class="empty">${ctx.t('news.empty')}</p>` : ''}
    ${showFeature
      ? html`<div class="news-feature" style="margin-bottom:clamp(40px,5vw,64px)">${newsCard(ctx, first, { large: true })}<div class="news-feature__list">${rest
          .slice(0, 2)
          .map((n) => newsCard(ctx, n))}</div></div>
        <div class="grid grid--3">${rest.slice(2).map((n) => newsCard(ctx, n))}</div>`
      : html`<div class="grid grid--3">${posts.map((n) => newsCard(ctx, n))}</div>`}
    ${totalPages > 1
      ? html`<nav class="pager" aria-label="${ctx.t('news.page')}">
        ${page > 1 ? html`<a class="btn btn--outline btn--sm" href="${pageHref(page - 1)}">${icon('arrow-left')} ${ctx.t('news.prev')}</a>` : raw('<span></span>')}
        <span class="muted">${page} / ${totalPages}</span>
        ${page < totalPages ? html`<a class="btn btn--outline btn--sm" href="${pageHref(page + 1)}">${ctx.t('news.next')} ${icon('arrow')}</a>` : raw('<span></span>')}
      </nav>`
      : ''}
  </div>
</section>
${ctaBand(ctx)}`;

  return layout(ctx, {
    segments,
    nav: 'news',
    title: page > 1 ? `${title} — ${ctx.t('news.page')} ${page}` : title,
    description: cat ? `${title} — ${ctx.settings.site_name || 'MVM GROUP'}` : p.news_lead,
    body,
    jsonld: [breadcrumbJsonLd(ctx, trail)],
  });
}

export function article(ctx, n) {
  const cat = newsCategory(n.category);
  const trail = [{ label: ctx.t('nav.news'), href: ctx.u('news') }, { label: n.title }];
  const related = ctx.news
    .filter((x) => x.slug !== n.slug && x.category === n.category)
    .concat(ctx.news.filter((x) => x.slug !== n.slug && x.category !== n.category))
    .slice(0, 3);
  const pageUrl = ctx.abs(ctx.u('news', n.slug));
  const share = [
    { label: 'Facebook', icon: 'facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}` },
    { label: 'WhatsApp', icon: 'whatsapp', href: `https://wa.me/?text=${encodeURIComponent(`${n.title} ${pageUrl}`)}` },
  ];

  const body = html`${pageHero(ctx, {
    title: n.title,
    lead: n.excerpt,
    trail,
    extra: html`<p class="card__meta" style="margin-top:22px">${cat ? html`<a class="tag" style="text-decoration:none" href="${ctx.u('news', 'category', cat.key)}">${label(cat, ctx.lang)}</a>` : ''}
      <time datetime="${isoDate(n.date)}">${formatDate(n.date, ctx.lang)}</time>${n.author ? html`<span>${n.author}</span>` : ''}</p>`,
  })}
<article class="section t-paper">
  <div class="wrap wrap--narrow">
    ${n.cover ? cover({ image: n.cover, alt: n.cover_alt || n.title, ratio: '16 / 9', eager: true }) : ''}
    <div class="prose" style="${n.cover ? 'margin-top:44px' : ''}">${md(n.body)}</div>
    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:48px;padding-top:24px;border-top:1px solid var(--line)">
      <span class="muted" style="font-size:var(--fs-small)">${ctx.t('news.share')}</span>
      <ul class="social">${share.map((s) => html`<li><a href="${s.href}" target="_blank" rel="noopener" aria-label="${s.label}">${icon(s.icon)}</a></li>`)}
        <li><a href="${pageUrl}" data-copy-link data-copied="${ctx.t('news.copied')}" aria-label="${ctx.t('news.copyLink')}" onclick="return false">${icon('link')}</a></li></ul>
    </div>
  </div>
</article>
${related.length
  ? html`<section class="section section--tight t-dark"><div class="wrap">
  <div class="section__head"><h2 class="section__title">${ctx.t('news.related')}</h2><a class="link" href="${ctx.u('news')}">${ctx.t('cta.viewNews')} ${icon('arrow')}</a></div>
  <div class="grid grid--3">${related.map((x) => newsCard(ctx, x))}</div></div></section>`
  : ''}
${ctaBand(ctx)}`;

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: n.title,
      description: n.excerpt,
      datePublished: isoDate(n.date),
      dateModified: isoDate(n.updated || n.date),
      inLanguage: ctx.info.htmlLang,
      image: n.cover ? [ctx.abs(n.cover)] : undefined,
      author: { '@type': 'Organization', name: n.author || ctx.settings.site_name || 'MVM GROUP' },
      publisher: { '@type': 'Organization', name: ctx.settings.site_name || 'MVM GROUP', logo: { '@type': 'ImageObject', url: ctx.abs('/brand/logo-mark.png') } },
      mainEntityOfPage: pageUrl,
    },
    breadcrumbJsonLd(ctx, trail),
  ];

  return layout(ctx, {
    segments: ['news', n.slug],
    nav: 'news',
    title: n.seo_title || n.title,
    description: n.seo_description || n.excerpt || plain(n.body),
    image: n.cover,
    ogType: 'article',
    head: raw(`<meta property="article:published_time" content="${isoDate(n.date)}">`),
    body,
    jsonld,
  });
}
