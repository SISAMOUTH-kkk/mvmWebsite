#!/usr/bin/env node
// Builds an offline copy of the website in preview/ that opens by double-clicking
// preview/index.html — no server needed. Useful for showing the design to
// colleagues. (Forms do not send from the offline copy.)
//   npm run preview

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'preview');

execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'build.mjs')], { stdio: 'inherit' });
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(DIST, OUT, { recursive: true, filter: (p) => !p.includes(`${path.sep}admin`) });

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

// "/en/about/?x=1#y" seen from a file `depth` folders deep → "../../en/about/index.html?x=1#y"
function relative(url, depth) {
  const m = url.match(/^([^?#]*)(.*)$/);
  let p = m[1];
  if (p === '/' || p.endsWith('/')) p += 'index.html';
  else if (!path.extname(p)) p += '/index.html';
  return '../'.repeat(depth) + p.replace(/^\//, '') + m[2];
}

for (const file of walk(OUT)) {
  const ext = path.extname(file);
  if (ext !== '.html' && ext !== '.css') continue;
  const depth = path.relative(OUT, path.dirname(file)).split(path.sep).filter(Boolean).length;
  let text = fs.readFileSync(file, 'utf8');
  if (ext === '.html') {
    text = text.replace(/(\s(?:href|src|srcset|poster|action)=")(\/(?!\/)[^"]*)"/g, (_, a, u) => `${a}${relative(u, depth)}"`);
    // Root language redirect
    text = text.replace("location.replace('/' + lang + '/')", "location.replace(lang + '/index.html')");
    text = text.replace("location.replace('/admin/' + location.hash)", 'void 0');
    text = text.replace('<meta http-equiv="refresh" content="0; url=/en/">', '<meta http-equiv="refresh" content="0; url=en/index.html">');
  }
  text = text.replace(/url\((\/(?!\/)[^)]*)\)/g, (_, u) => `url(${'../'.repeat(depth) + u.replace(/^\//, '')})`);
  fs.writeFileSync(file, text);
}
console.log('Offline preview ready: open preview/index.html');
