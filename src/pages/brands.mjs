import { html, raw } from '../lib/html.mjs';
import { md, plain } from '../lib/markdown.mjs';
import { layout } from '../components/layout.mjs';
import { pageHero, brandPanel, brandNames, brandArt, lattice, band, cover, gallery, ctaBand, icon, breadcrumbJsonLd, isPlaceholder, img, crumbs } from '../components/ui.mjs';

export function brandsIndex(ctx) {
  const p = ctx.pages;
  const trail = [{ label: ctx.t('nav.brands') }];
  const body = html`${pageHero(ctx, { title: p.brands_title || ctx.t('section.brands'), lead: p.brands_lead, trail })}
<section class="section t-paper">
  <div class="wrap">
    <div class="grid grid--2">${ctx.brands.map((b) => brandPanel(ctx, b))}</div>
    <div class="plate" style="margin-top:clamp(28px,4vw,48px);display:flex;flex-wrap:wrap;gap:20px 40px;align-items:center;justify-content:space-between" data-reveal>
      <div style="max-width:60ch">
        <h2 style="font-size:var(--fs-h3)">${ctx.t('brand.moreTitle')}</h2>
        <p class="muted" style="margin-top:8px">${ctx.t('brand.moreText')}</p>
      </div>
      <a class="btn btn--outline" href="${ctx.u('partnership')}?type=business">${ctx.t('cta.partner')}</a>
    </div>
  </div>
</section>
${ctaBand(ctx)}`;
  return layout(ctx, {
    segments: ['brands'],
    nav: 'brands',
    title: p.brands_title || ctx.t('section.brands'),
    description: p.brands_lead,
    body,
    jsonld: [breadcrumbJsonLd(ctx, trail)],
  });
}

export function brandDetail(ctx, b) {
  const trail = [{ label: ctx.t('nav.brands'), href: ctx.u('brands') }, { label: b.title }];
  const style = b.accent_color ? raw(` style="--brand-bg:${b.accent_color}"`) : '';
  const distributorHref = `${ctx.u('partnership')}?type=distributor&brand=${b.slug}`;
  const sections = [];

  if (b.story || b.concept) {
    sections.push(html`<section class="section t-paper" id="story">
      <div class="wrap split">
        <div data-reveal>
          <h2 class="section__title">${ctx.t('brand.story')}</h2>
        </div>
        <div class="prose" data-reveal>
          ${md(b.story)}
          ${b.concept ? html`<h3>${ctx.t('brand.concept')}</h3>${md(b.concept)}` : ''}
        </div>
      </div>
    </section>`);
  }

  if (b.highlights?.length) {
    sections.push(html`<section class="section section--tight t-paper" style="padding-top:0" id="highlights">
      <div class="wrap">
        <h2 class="block__title">${ctx.t('brand.highlights')}</h2>
        <div class="feature-grid" data-count="${b.highlights.length}">${b.highlights.map((h) => html`<div data-reveal><h3>${h.title}</h3>${h.text ? html`<p>${h.text}</p>` : ''}</div>`)}</div>
      </div>
    </section>`);
  }

  const productBlocks = [];
  if (b.products?.length) {
    productBlocks.push(html`<div class="block"><h2 class="block__title">${ctx.t('brand.products')}</h2>
      <ul class="product-grid">${b.products.map(
        (p) => html`<li class="product" data-reveal>${cover({ image: p.image, alt: p.name, iconName: 'jar' })}
        <div class="product__body"><h3>${p.name}</h3>${p.description ? html`<p>${p.description}</p>` : ''}${
          p.size ? html`<span class="product__size">${p.size}</span>` : ''
        }</div></li>`
      )}</ul></div>`);
  }
  if (b.flavors?.length) {
    productBlocks.push(html`<div class="block"><h2 class="block__title">${ctx.t('brand.flavors')}</h2>
      <ul class="pill-list">${b.flavors.map((f) => html`<li>${f.name}${f.note ? html`<small>${f.note}</small>` : ''}</li>`)}</ul></div>`);
  }
  if (b.sizes?.length) {
    productBlocks.push(html`<div class="block"><h2 class="block__title">${ctx.t('brand.sizes')}</h2>
      <ul class="pill-list">${b.sizes.map((f) => html`<li>${f.name}${f.note ? html`<small>${f.note}</small>` : ''}</li>`)}</ul></div>`);
  }
  if (b.usage?.length) {
    productBlocks.push(html`<div class="block"><h2 class="block__title">${ctx.t('brand.usage')}</h2>
      <ol class="steps">${b.usage.map((u) => html`<li><h3>${u.title}</h3>${u.text ? html`<p>${u.text}</p>` : ''}</li>`)}</ol></div>`);
  }
  if (productBlocks.length) {
    sections.push(html`<section class="section t-dark" id="products">${lattice('lattice--fade')}<div class="wrap" style="position:relative">${productBlocks}</div></section>`);
  }

  if (b.gallery?.length) {
    sections.push(html`<section class="section t-paper" id="gallery"><div class="wrap">
      <h2 class="block__title">${ctx.t('brand.gallery')}</h2>${gallery(ctx, b.gallery, 'jar')}
    </div></section>`);
  }

  // Where to buy + distributor + contact
  const outlets = (b.outlets || []).filter((o) => o.name);
  const bc = b.contact || {};
  sections.push(html`<section class="section t-paper" id="where" style="${b.gallery?.length ? 'padding-top:0' : ''}">
    <div class="wrap split split--even">
      <div data-reveal>
        <h2 class="block__title">${ctx.t('brand.whereToBuy')}</h2>
        ${outlets.length
          ? html`<table class="outlets"><thead><tr><th scope="col">${ctx.t('brand.whereToBuy')}</th><th scope="col">${ctx.t('project.location')}</th></tr></thead><tbody>${outlets.map(
              (o) => html`<tr><td>${o.link ? html`<a class="link" href="${o.link}" target="_blank" rel="noopener">${o.name}</a>` : html`<strong>${o.name}</strong>`}${
                o.type ? html`<br><small class="muted">${o.type}</small>` : ''
              }</td><td>${o.area}</td></tr>`
            )}</tbody></table>`
          : html`<p class="empty">${ctx.t('brand.noOutlets')}</p>`}
      </div>
      <div style="display:grid;gap:20px">
        <div class="quote-box" id="distributor" data-reveal>
          <h2>${ctx.t('brand.distributorTitle')}</h2>
          <p>${ctx.t('brand.distributorText')}</p>
          <div class="btn-row" style="flex-direction:row"><a class="btn btn--gold" href="${distributorHref}">${ctx.t('cta.becomeDistributor')}</a></div>
        </div>
        <div class="plate" id="contact" data-reveal>
          <h2 style="font-size:1.2rem">${ctx.t('brand.contactTitle')}</h2>
          <ul class="channels" style="margin-top:14px;border-top:0">
            ${!isPlaceholder(bc.phone) ? html`<li>${icon('phone')}<small>${ctx.t('contact.phone')}</small><a href="tel:+${String(bc.phone).replace(/[^\d]/g, '')}">${bc.phone}</a></li>` : ''}
            ${!isPlaceholder(bc.email) ? html`<li>${icon('mail')}<small>${ctx.t('contact.email')}</small><a href="mailto:${bc.email}">${bc.email}</a></li>` : ''}
            ${!isPlaceholder(bc.facebook) ? html`<li>${icon('facebook')}<small>Facebook</small><a href="${bc.facebook}" target="_blank" rel="noopener">${b.title}</a></li>` : ''}
            ${!isPlaceholder(bc.tiktok) ? html`<li>${icon('tiktok')}<small>TikTok</small><a href="${bc.tiktok}" target="_blank" rel="noopener">${b.title}</a></li>` : ''}
          </ul>
          <p style="margin-top:8px"><a class="link" href="${ctx.u('contact')}?service=product-distribution">${ctx.t('cta.contactBrand')} ${icon('arrow')}</a></p>
        </div>
      </div>
    </div>
  </section>`);

  const art = brandArt(b, { eager: true });
  const body = html`<section class="brand-hero t-dark"${style}>
  ${lattice('lattice--right', '0.12')}
  <div class="wrap brand-hero__inner">
    <div>
      ${crumbs(ctx, trail)}
      <div class="brand-hero__names">${brandNames(b, ctx.lang, { tag: 'h1' })}</div>
      ${b.tagline ? html`<p class="page-hero__lead">${b.tagline}</p>` : ''}
      <p style="margin-top:18px"><span class="tag">${ctx.t('brand.of')}</span></p>
      <div class="btn-row page-hero__actions">
        <a class="btn btn--gold" href="${distributorHref}">${ctx.t('cta.becomeDistributor')}</a>
        <a class="btn btn--outline" href="#contact">${ctx.t('cta.contactBrand')}</a>
      </div>
    </div>
    ${art ? html`<div class="brand-hero__art">${art}</div>` : ''}
  </div>
  ${band()}
</section>
${sections}
${ctaBand(ctx, {
  title: ctx.t('brand.distributorTitle'),
  text: ctx.t('brand.distributorText'),
  actions: html`<a class="btn btn--gold" href="${distributorHref}">${ctx.t('cta.becomeDistributor')}</a><a class="btn btn--outline" href="${ctx.u('contact')}?service=product-distribution">${ctx.t('cta.contactUs')}</a>`,
})}`;

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Brand',
      name: b.name_en || b.title,
      alternateName: [b.name_la, b.name_zh].filter(Boolean),
      description: b.summary,
      logo: b.logo ? ctx.abs(b.logo) : undefined,
      url: ctx.abs(ctx.u('brands', b.slug)),
    },
    breadcrumbJsonLd(ctx, trail),
  ];

  return layout(ctx, {
    segments: ['brands', b.slug],
    nav: 'brands',
    title: b.seo_title || b.title,
    description: b.seo_description || b.summary || plain(b.story),
    image: b.hero_image || b.card_image,
    body,
    jsonld,
  });
}

export { img };
