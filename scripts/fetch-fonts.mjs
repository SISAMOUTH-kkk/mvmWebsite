#!/usr/bin/env node
// Optional: download the web fonts once so the site serves them itself instead
// of loading them from Google Fonts. This makes the fonts work for visitors in
// mainland China, where Google Fonts is blocked.
//   npm run fonts   (needs an internet connection; commit the public/fonts folder afterwards)
//
// Chinese pages keep using the visitor's system fonts for Chinese characters
// (PingFang SC, Microsoft YaHei...), which is the fastest option.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'fonts');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const SETS = {
  en: 'family=Marcellus&family=Noto+Sans:wght@400;500;600',
  la: 'family=Marcellus&family=Noto+Sans:wght@400;500;600&family=Noto+Sans+Lao:wght@400;500;600&family=Noto+Serif+Lao:wght@500;600',
  zh: 'family=Marcellus&family=Noto+Sans:wght@400;500;600',
};
// Keep only these unicode subsets to stay small.
const KEEP = /\/\* (latin|latin-ext|lao) \*\//;

fs.mkdirSync(OUT, { recursive: true });
const downloaded = new Map();

for (const [lang, query] of Object.entries(SETS)) {
  const cssUrl = `https://fonts.googleapis.com/css2?${query}&display=swap`;
  const res = await fetch(cssUrl, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Could not load ${cssUrl}: ${res.status}`);
  const css = await res.text();
  const blocks = css.split(/(?=\/\* [\w-]+ \*\/)/).filter((b) => KEEP.test(b));
  let out = '';
  for (const block of blocks) {
    let rewritten = block;
    for (const [, url] of block.matchAll(/url\((https:[^)]+)\)/g)) {
      if (!downloaded.has(url)) {
        const r = await fetch(url, { headers: { 'User-Agent': UA } });
        if (!r.ok) throw new Error(`Could not load ${url}`);
        const buf = Buffer.from(await r.arrayBuffer());
        const name = `${crypto.createHash('sha1').update(url).digest('hex').slice(0, 12)}.woff2`;
        fs.writeFileSync(path.join(OUT, name), buf);
        downloaded.set(url, name);
      }
      rewritten = rewritten.replace(url, `/fonts/${downloaded.get(url)}`);
    }
    out += rewritten;
  }
  fs.writeFileSync(path.join(OUT, `${lang}.css`), out);
  console.log(`fonts/${lang}.css written`);
}
console.log(`Downloaded ${downloaded.size} font files to public/fonts/. Rebuild the site to use them.`);
