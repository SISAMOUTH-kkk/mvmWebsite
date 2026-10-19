import { html, raw } from '../lib/html.mjs';
import { md } from '../lib/markdown.mjs';
import { layout } from '../components/layout.mjs';
import { pageHero, lattice, icon, img, contactLinks, socialLinks, breadcrumbJsonLd, isPlaceholder, formatDate } from '../components/ui.mjs';
import { contactForm, quoteForm, partnerForm } from '../components/forms.mjs';

function channels(ctx) {
  const s = ctx.settings;
  const c = s.contact || {};
  const items = contactLinks(ctx).map((l) => ({ ...l }));
  if (s.address) items.push({ key: 'address', icon: 'pin', label: ctx.t('contact.address'), value: s.address, href: !isPlaceholder(c.map_link) ? c.map_link : '' });
  if (s.hours) items.push({ key: 'hours', icon: 'clock', label: ctx.t('contact.hours'), value: s.hours });
  if (!isPlaceholder(c.facebook)) items.push({ key: 'facebook', icon: 'facebook', label: ctx.t('contact.facebook'), value: c.facebook.replace(/^https?:\/\/(www\.)?/, ''), href: c.facebook });
  if (!isPlaceholder(c.tiktok)) items.push({ key: 'tiktok', icon: 'tiktok', label: ctx.t('contact.tiktok'), value: c.tiktok.replace(/^https?:\/\/(www\.)?/, ''), href: c.tiktok });
  return html`<ul class="channels">${items.map(
    (l) => html`<li class="${l.placeholder ? 'is-placeholder' : ''}"${l.key === 'wechat' ? raw(' id="wechat"') : ''}>${icon(l.icon)}<small>${l.label}</small>${
      l.href && !l.placeholder
        ? html`<a href="${l.href}"${l.href.startsWith('http') ? raw(' target="_blank" rel="noopener"') : ''}>${l.value}</a>`
        : html`<span>${l.value || ctx.t('misc.placeholder')}</span>`
    }</li>`
  )}</ul>`;
}

export function contactPage(ctx) {
  const p = ctx.pages;
  const s = ctx.settings;
  const c = s.contact || {};
  const trail = [{ label: ctx.t('nav.contact') }];
  const qr = c.wechat_qr
    ? img(c.wechat_qr, ctx.t('contact.scanWechat'))
    : raw(`<span class="qr-placeholder" aria-hidden="true"><svg class="icon"><use href="#i-wechat"></use></svg></span>`);

  const body = html`${pageHero(ctx, { title: p.contact_title || ctx.t('nav.contactUs'), lead: p.contact_lead, trail })}
<section class="section t-paper">
  <div class="wrap split">
    <div>
      <h2 class="block__title">${ctx.t('contact.channels')}</h2>
      ${channels(ctx)}
      <div class="wechat-qr">${qr}<p>${ctx.t('contact.scanWechat')}${!isPlaceholder(c.wechat) ? html`<br><strong style="color:var(--fg)">${c.wechat}</strong>` : ''}</p></div>
      ${socialLinks(ctx) ? html`<p class="muted" style="margin:28px 0 12px;font-size:var(--fs-small)">${ctx.t('contact.follow')}</p>${socialLinks(ctx)}` : ''}
    </div>
    <div class="form__panel">
      <h2 class="block__title">${ctx.t('contact.formTitle')}</h2>
      ${contactForm(ctx)}
    </div>
  </div>
</section>
<section class="section section--tight t-paper" style="padding-top:0" aria-label="${ctx.t('contact.map')}">
  <div class="wrap">
    <div class="map">
      ${c.map_embed && !isPlaceholder(c.map_embed)
        ? html`<iframe src="${c.map_embed}" title="${ctx.t('contact.map')} — ${s.site_name || 'MVM GROUP'}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`
        : html`<div class="map__pending">${lattice()}<p>${ctx.t('contact.mapPending')}</p></div>`}
    </div>
    ${c.map_link && !isPlaceholder(c.map_link) ? html`<p style="margin-top:14px"><a class="link" href="${c.map_link}" target="_blank" rel="noopener">${ctx.t('contact.openMap')} ${icon('external')}</a></p>` : ''}
  </div>
</section>`;

  return layout(ctx, {
    segments: ['contact'],
    nav: 'contact',
    title: p.contact_title || ctx.t('nav.contactUs'),
    description: p.contact_lead,
    body,
    jsonld: [breadcrumbJsonLd(ctx, trail)],
  });
}

export function quotePage(ctx) {
  const p = ctx.pages;
  const trail = [{ label: ctx.t('cta.requestQuote') }];
  const body = html`${pageHero(ctx, { title: p.quote_title || ctx.t('cta.requestQuote'), lead: p.quote_lead, trail })}
<section class="section t-paper">
  <div class="wrap">
    <div class="split split--form">
      <div class="form__panel">${quoteForm(ctx)}</div>
      <aside class="detail__aside">
        <div class="quote-box">
          <h2>${ctx.t('quote.nextTitle')}</h2>
          <ol class="next-steps"><li>${ctx.t('quote.next1')}</li><li>${ctx.t('quote.next2')}</li><li>${ctx.t('quote.next3')}</li></ol>
        </div>
        <p class="muted" style="margin-top:20px;font-size:var(--fs-small)">${ctx.t('service.pricingText')}</p>
      </aside>
    </div>
  </div>
</section>`;
  return layout(ctx, {
    segments: ['quote'],
    nav: '',
    title: p.quote_title || ctx.t('cta.requestQuote'),
    description: p.quote_lead,
    body,
    jsonld: [breadcrumbJsonLd(ctx, trail)],
  });
}

export function partnershipPage(ctx) {
  const p = ctx.pages;
  const trail = [{ label: ctx.t('nav.partnership') }];
  const body = html`${pageHero(ctx, { title: p.partnership_title || ctx.t('nav.partnership'), lead: p.partnership_lead, trail })}
${p.partnership_intro
  ? html`<section class="section section--tight t-paper" style="padding-bottom:0"><div class="wrap"><div class="prose">${md(p.partnership_intro)}</div></div></section>`
  : ''}
<section class="section t-paper">
  <div class="wrap">
    <div class="split split--form">
      <div class="form__panel">${partnerForm(ctx)}</div>
      <aside class="detail__aside">
        <div class="quote-box">
          <h2>${ctx.t('quote.nextTitle')}</h2>
          <ol class="next-steps"><li>${ctx.t('quote.next1')}</li><li>${p.partnership_next || ctx.t('quote.next2')}</li></ol>
        </div>
      </aside>
    </div>
  </div>
</section>`;
  return layout(ctx, {
    segments: ['partnership'],
    nav: 'brands',
    title: p.partnership_title || ctx.t('nav.partnership'),
    description: p.partnership_lead,
    body,
    jsonld: [breadcrumbJsonLd(ctx, trail)],
  });
}

export function thankYouPage(ctx) {
  const links = contactLinks(ctx).filter((l) => l.href);
  const body = html`<section class="page-hero t-dark" style="min-height:80vh">
  ${lattice('lattice--edges')}
  <div class="wrap page-hero__inner" style="text-align:center;display:grid;justify-items:center">
    ${raw('<svg class="icon" style="width:56px;height:56px;color:var(--gold)" aria-hidden="true"><use href="#i-check"></use></svg>')}
    <h1 class="page-hero__title" style="margin-inline:auto">${ctx.t('thanks.title')}</h1>
    <p class="page-hero__lead" style="margin-inline:auto">${ctx.t('thanks.text')}</p>
    <div class="btn-row page-hero__actions" style="justify-content:center">
      <a class="btn btn--gold" href="${ctx.u()}">${ctx.t('cta.backHome')}</a>
      <a class="btn btn--outline" href="${ctx.u('services')}">${ctx.t('cta.viewServices')}</a>
    </div>
    ${links.length ? html`<ul class="quick-links">${links.map((l) => html`<li><a href="${l.href}">${icon(l.icon)}<span>${l.label}</span></a></li>`)}</ul>` : ''}
  </div>
</section>`;
  // Conversion events for GA4 and Meta Pixel when they are configured.
  const foot = raw(`<script>try{if(window.gtag)gtag('event','generate_lead');if(window.fbq)fbq('track','Lead');}catch(e){}</script>`);
  return layout(ctx, { segments: ['thank-you'], nav: '', title: ctx.t('thanks.title'), body, noindex: true, foot });
}

export function legalPage(ctx, which) {
  const l = ctx.legal;
  const title = which === 'privacy' ? l.privacy_title || ctx.t('footer.privacy') : l.terms_title || ctx.t('footer.terms');
  const text = which === 'privacy' ? l.privacy_body : l.terms_body;
  const trail = [{ label: title }];
  const body = html`${pageHero(ctx, { title, trail, lead: l.updated ? `${ctx.t('misc.updated')}: ${formatDate(l.updated, ctx.lang)}` : '' })}
<section class="section t-paper"><div class="wrap wrap--narrow"><div class="prose">${md(text)}</div></div></section>`;
  return layout(ctx, { segments: [which], nav: '', title, description: title, body, jsonld: [breadcrumbJsonLd(ctx, trail)] });
}

export function notFoundPage(ctx) {
  const body = html`<section class="page-hero t-dark" style="min-height:80vh">
  ${lattice('lattice--edges')}
  <div class="wrap page-hero__inner" style="text-align:center;display:grid;justify-items:center">
    <p class="hero__pillars" style="margin:0">404</p>
    <h1 class="page-hero__title" style="margin-inline:auto">${ctx.t('notFound.title')}</h1>
    <p class="page-hero__lead" style="margin-inline:auto">${ctx.t('notFound.text')}</p>
    <div class="btn-row page-hero__actions" style="justify-content:center">
      <a class="btn btn--gold" href="${ctx.u()}">${ctx.t('cta.backHome')}</a>
      <a class="btn btn--outline" href="${ctx.u('contact')}">${ctx.t('cta.contactUs')}</a>
    </div>
  </div>
</section>`;
  return layout(ctx, { segments: ['404'], nav: '', title: ctx.t('notFound.title'), body, noindex: true });
}
