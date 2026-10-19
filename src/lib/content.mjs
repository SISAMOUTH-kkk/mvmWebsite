// Loads CMS content (YAML written by Decap CMS) and localizes it.
//
// Every content file uses Decap's i18n "single_file" structure:
//   en: { ...all fields... }
//   la: { ...translated fields... }
//   zh: { ...translated fields... }
// Fields that are not translated (images, dates, order, ...) only live under
// the default locale, so localize() starts from `en` and layers the locale on
// top. Empty translations fall back to English instead of rendering blank.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from '../vendor/js-yaml.mjs';
import { DEFAULT_LOCALE } from './i18n.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CONTENT_DIR = path.join(ROOT, 'content');

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);
const isEmpty = (v) =>
  v === undefined || v === null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0);

function mergeLocale(base, over) {
  if (Array.isArray(base) || Array.isArray(over)) {
    const b = Array.isArray(base) ? base : [];
    const o = Array.isArray(over) ? over : [];
    if (!o.length) return b;
    const out = [];
    for (let i = 0; i < Math.max(b.length, o.length); i++) {
      if (i >= o.length || isEmpty(o[i])) out.push(b[i]);
      else if (isPlainObject(o[i]) && isPlainObject(b[i])) out.push(mergeLocale(b[i], o[i]));
      else out.push(o[i]);
    }
    return out.filter((v) => v !== undefined);
  }
  if (isPlainObject(base) || isPlainObject(over)) {
    const out = { ...(isPlainObject(base) ? base : {}) };
    for (const [key, value] of Object.entries(isPlainObject(over) ? over : {})) {
      if (isEmpty(value)) continue;
      out[key] = mergeLocale(out[key], value);
    }
    return out;
  }
  return isEmpty(over) ? base : over;
}

export function localize(data, lang) {
  const base = (data && data[DEFAULT_LOCALE]) || {};
  if (lang === DEFAULT_LOCALE) return mergeLocale({}, base);
  return mergeLocale(base, (data && data[lang]) || {});
}

function readYaml(file) {
  try {
    return yaml.load(fs.readFileSync(file, 'utf8')) || {};
  } catch (err) {
    throw new Error(`Could not read ${path.relative(ROOT, file)}: ${err.message}`);
  }
}

function readCollection(name) {
  const dir = path.join(CONTENT_DIR, name);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.ya?ml$/i.test(f))
    .map((f) => ({ slug: f.replace(/\.ya?ml$/i, ''), data: readYaml(path.join(dir, f)) }));
}

function readSingleton(name) {
  const file = path.join(CONTENT_DIR, 'settings', `${name}.yml`);
  return fs.existsSync(file) ? readYaml(file) : {};
}

const byOrder = (a, b) => (a.order ?? 999) - (b.order ?? 999) || String(a.title).localeCompare(String(b.title));
const time = (v) => (v ? new Date(v).getTime() || 0 : 0);

// Loads everything once and returns per-locale accessors.
export function loadSite() {
  const raw = {
    site: readSingleton('site'),
    home: readSingleton('home'),
    about: readSingleton('about'),
    legal: readSingleton('legal'),
    pages: readSingleton('pages'),
    services: readCollection('services'),
    units: readCollection('units'),
    brands: readCollection('brands'),
    projects: readCollection('projects'),
    news: readCollection('news'),
    team: readCollection('team'),
    tours: readCollection('tours'),
  };

  const cache = new Map();
  const list = (name, lang, sort) => {
    const key = `${name}:${lang}`;
    if (!cache.has(key)) {
      const items = raw[name]
        .map(({ slug, data }) => ({ ...localize(data, lang), slug }))
        .filter((item) => item.published !== false);
      cache.set(key, items.sort(sort));
    }
    return cache.get(key);
  };

  return {
    raw,
    settings: (lang) => localize(raw.site, lang),
    home: (lang) => localize(raw.home, lang),
    about: (lang) => localize(raw.about, lang),
    legal: (lang) => localize(raw.legal, lang),
    pages: (lang) => localize(raw.pages, lang),
    services: (lang) => list('services', lang, byOrder),
    units: (lang) => list('units', lang, byOrder),
    brands: (lang) => list('brands', lang, byOrder),
    team: (lang) => list('team', lang, byOrder),
    tours: (lang) => list('tours', lang, byOrder),
    projects: (lang) => list('projects', lang, (a, b) => (b.year ?? 0) - (a.year ?? 0) || byOrder(a, b)),
    news: (lang) => list('news', lang, (a, b) => time(b.date) - time(a.date)),
  };
}
