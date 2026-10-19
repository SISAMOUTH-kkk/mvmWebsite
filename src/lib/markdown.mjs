import { Marked } from '../vendor/marked.esm.js';
import { raw, esc } from './html.mjs';

const marked = new Marked({ gfm: true, breaks: false });

// Open external links in a new tab and lazy-load images inside articles.
marked.use({
  renderer: {
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const external = /^https?:\/\//i.test(href || '');
      const t = title ? ` title="${esc(title)}"` : '';
      return `<a href="${esc(href)}"${t}${external ? ' target="_blank" rel="noopener"' : ''}>${text}</a>`;
    },
    image({ href, title, text }) {
      const cap = title ? `<figcaption>${esc(title)}</figcaption>` : '';
      return `<figure class="prose-figure"><img src="${esc(href)}" alt="${esc(text || '')}" loading="lazy" decoding="async">${cap}</figure>`;
    },
  },
});

export function md(text) {
  if (!text) return raw('');
  return raw(marked.parse(String(text)));
}

export function mdInline(text) {
  if (!text) return raw('');
  return raw(marked.parseInline(String(text)));
}

// Plain text from markdown, for meta descriptions.
export function plain(text, max = 160) {
  const s = String(text || '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return s.length > max ? s.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : s;
}
