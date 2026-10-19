// Tiny, dependency-free HTML templating.
// html`...` escapes every interpolated value unless it is already SafeHtml
// (returned by html`` itself or by raw()). Arrays are joined, null/false skipped.

export class SafeHtml {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return this.value;
  }
}

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
}

export function raw(value) {
  return new SafeHtml(String(value ?? ''));
}

function render(value) {
  if (value === null || value === undefined || value === false) return '';
  if (Array.isArray(value)) return value.map(render).join('');
  if (value instanceof SafeHtml) return value.value;
  return esc(value);
}

export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += render(values[i]) + strings[i + 1];
  return new SafeHtml(out);
}

// Conditional attribute helper: attr('href', url) -> ` href="..."` or ''.
export function attr(name, value) {
  if (value === null || value === undefined || value === false || value === '') return raw('');
  if (value === true) return raw(` ${name}`);
  return raw(` ${name}="${esc(value)}"`);
}

export function cls(...names) {
  return names.flat().filter(Boolean).join(' ');
}
