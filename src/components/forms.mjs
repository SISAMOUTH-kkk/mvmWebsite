import { html, raw, attr } from '../lib/html.mjs';
import { QUOTE_OPTIONS, PARTNER_TYPES, label } from '../lib/taxonomies.mjs';

// Forms are handled by Netlify Forms: submissions appear in the Netlify
// dashboard and are emailed to the addresses set under
// Site configuration → Forms → Form notifications.
// Spam protection: honeypot field + Netlify's built-in Akismet filtering, plus
// optional reCAPTCHA (Settings → Forms in the CMS). reCAPTCHA is off by default
// because Google services are blocked for visitors in mainland China.

let fieldId = 0;

function formOpen(ctx, name, extraClass = '') {
  const recaptcha = ctx.settings.forms?.recaptcha === true;
  return html`<form class="form ${extraClass}" name="${name}" method="POST" action="${ctx.u('thank-you')}"
    data-netlify="true" netlify-honeypot="bot-field"${recaptcha ? raw(' data-netlify-recaptcha="true"') : ''}
    data-form data-msg-required="${ctx.t('form.errorRequired')}" data-msg-email="${ctx.t('form.errorEmail')}"
    data-msg-choice="${ctx.t('form.errorChoice')}" data-msg-consent="${ctx.t('form.errorConsent')}" data-msg-sending="${ctx.t('form.sending')}">
  <input type="hidden" name="form-name" value="${name}">
  <input type="hidden" name="language" value="${ctx.lang}">
  <input type="hidden" name="page" value="">
  <p class="hp-field" aria-hidden="true"><label>Leave this field empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>`;
}

function formClose(ctx, submitLabel) {
  const recaptcha = ctx.settings.forms?.recaptcha === true;
  const cid = `consent-${++fieldId}`;
  return html`${recaptcha ? raw('<div data-netlify-recaptcha="true"></div>') : ''}
  <div class="consent" data-consent>
    <input type="checkbox" id="${cid}" name="consent" value="yes" required>
    <label for="${cid}">${ctx.t('form.consent')} <a href="${ctx.u('privacy')}" target="_blank">${ctx.t('footer.privacy')}</a>.</label>
  </div>
  <div class="form__foot">
    <p class="form__note">${ctx.t('form.requiredNote')}</p>
    <button class="btn btn--gold" type="submit">${submitLabel}</button>
  </div>
</form>`;
}

function field(ctx, { name, labelKey, labelText, type = 'text', required = false, autocomplete, hint, options, rows, prefill, inputmode, placeholder, wide = false }) {
  const id = `f-${name.replace(/\W/g, '')}-${++fieldId}`;
  const text = labelText || ctx.t(labelKey);
  const lab = html`<label for="${id}">${text}${required ? ' *' : html`<span class="field__opt">(${ctx.t('form.optional')})</span>`}</label>`;
  const hintEl = hint ? html`<p class="field__hint" id="${id}-hint">${hint}</p>` : '';
  const common = raw(
    `${attr('required', required)}${attr('autocomplete', autocomplete)}${attr('data-prefill', prefill)}${attr('inputmode', inputmode)}${attr(
      'placeholder',
      placeholder
    )}${hint ? attr('aria-describedby', `${id}-hint`) : ''}`
  );
  let control;
  if (type === 'textarea') control = html`<textarea id="${id}" name="${name}" rows="${rows || 5}"${common}></textarea>`;
  else if (type === 'select')
    control = html`<select id="${id}" name="${name}"${common}><option value="">${ctx.t('form.choose')}</option>${options.map(
      (o) => html`<option value="${o.value}">${o.label}</option>`
    )}</select>`;
  else control = html`<input id="${id}" name="${name}" type="${type}"${common}>`;
  return html`<div class="field"${wide ? raw(' style="grid-column:1/-1"') : ''}>${lab}${hintEl}${control}</div>`;
}

function contactFields(ctx, { withWechat = true } = {}) {
  return html`<div class="form__row">
    ${field(ctx, { name: 'name', labelKey: 'form.name', required: true, autocomplete: 'name' })}
    ${field(ctx, { name: 'company', labelKey: 'form.company', autocomplete: 'organization' })}
  </div>
  <div class="form__row">
    ${field(ctx, { name: 'email', labelKey: 'form.email', type: 'email', required: true, autocomplete: 'email' })}
    ${field(ctx, { name: 'phone', labelKey: 'form.phone', type: 'tel', required: true, autocomplete: 'tel', inputmode: 'tel' })}
  </div>
  <div class="form__row">
    ${field(ctx, { name: 'country', labelKey: 'form.country', required: true, autocomplete: 'country-name' })}
    ${withWechat ? field(ctx, { name: 'wechat', labelKey: 'form.wechat' }) : ''}
  </div>`;
}

function quoteOptions(lang) {
  return QUOTE_OPTIONS.map((o) => ({ value: o.key, label: label(o, lang) }));
}

// Contact page form (brief section 7)
export function contactForm(ctx) {
  const options = [...quoteOptions(ctx.lang), { value: 'other', label: ctx.t('form.other') }];
  return html`${formOpen(ctx, 'contact')}
  ${contactFields(ctx)}
  ${field(ctx, { name: 'interest', labelKey: 'form.interest', type: 'select', options, prefill: 'service' })}
  ${field(ctx, { name: 'message', labelKey: 'form.details', type: 'textarea', required: true, hint: ctx.t('form.detailsHint') })}
  ${formClose(ctx, ctx.t('form.sendMessage'))}`;
}

// Request a Quote (brief section 8)
export function quoteForm(ctx) {
  const contactBy = ['email', 'phone', 'whatsapp', 'wechat'].map((k) => ({
    value: k,
    label: ctx.t(`contact.${k}`),
  }));
  const starts = ['asap', 'month', 'quarter', 'exploring'].map((k) => ({ value: k, label: ctx.t(`form.start.${k}`) }));
  return html`${formOpen(ctx, 'quote')}
  <fieldset class="form__group">
    <legend class="form__legend">${ctx.t('form.aboutRequest')}</legend>
    <div class="field" data-required-group>
      <span class="field__label" id="services-label">${ctx.t('form.servicesNeeded')} *</span>
      <p class="field__hint">${ctx.t('form.selectAll')}</p>
      <div class="choices" role="group" aria-labelledby="services-label">
        ${QUOTE_OPTIONS.map(
          (o) => html`<label class="choice"><input type="checkbox" name="services[]" value="${o.key}" data-prefill="service"><span>${label(o, ctx.lang)}</span></label>`
        )}
      </div>
    </div>
    ${field(ctx, { name: 'details', labelKey: 'form.projectDetails', type: 'textarea', required: true, hint: ctx.t('form.projectHint'), rows: 6 })}
    <div class="form__row">
      ${field(ctx, { name: 'start', labelKey: 'form.startDate', type: 'select', options: starts })}
      ${field(ctx, { name: 'budget', labelKey: 'form.budget' })}
    </div>
  </fieldset>
  <fieldset class="form__group">
    <legend class="form__legend">${ctx.t('form.yourDetails')}</legend>
    ${contactFields(ctx)}
    ${field(ctx, { name: 'contact_by', labelKey: 'form.contactBy', type: 'select', options: contactBy })}
  </fieldset>
  ${formClose(ctx, ctx.t('form.sendQuote'))}`;
}

// Distributor / partnership (brief section 9)
export function partnerForm(ctx) {
  return html`${formOpen(ctx, 'partnership')}
  <fieldset class="form__group">
    <legend class="form__legend">${ctx.t('form.partnerType')}</legend>
    <div class="choice-cards" data-required-group role="radiogroup">
      ${PARTNER_TYPES.map(
        (k, i) => html`<label class="choice-card"><input type="radio" name="partnership_type" value="${k}" data-prefill="type"${
          i === 0 ? raw(' checked') : ''
        }><span><strong>${ctx.t(`partner.${k}`)}</strong><small>${ctx.t(`partner.${k}Text`)}</small></span></label>`
      )}
    </div>
    <div class="field">
      <span class="field__label" id="brands-label">${ctx.t('form.brandInterest')}</span>
      <div class="choices" role="group" aria-labelledby="brands-label">
        ${ctx.brands.map(
          (b) => html`<label class="choice"><input type="checkbox" name="brands[]" value="${b.slug}" data-prefill="brand"><span>${b.title}</span></label>`
        )}
        <label class="choice"><input type="checkbox" name="brands[]" value="any"><span>${ctx.t('form.allBrands')}</span></label>
      </div>
    </div>
  </fieldset>
  <fieldset class="form__group">
    <legend class="form__legend">${ctx.t('form.yourDetails')}</legend>
    ${contactFields(ctx)}
    <div class="form__row">
      ${field(ctx, { name: 'business_type', labelKey: 'form.businessType', hint: ctx.t('form.businessHint') })}
      ${field(ctx, { name: 'location', labelKey: 'form.location' })}
    </div>
    ${field(ctx, { name: 'message', labelKey: 'form.partnerMessage', type: 'textarea', required: true, hint: ctx.t('form.partnerHint') })}
  </fieldset>
  ${formClose(ctx, ctx.t('form.sendPartner'))}`;
}
