#!/usr/bin/env node
// Local preview with automatic rebuild and browser reload.
//   npm run dev   →   http://localhost:4321
// Forms cannot send email locally (Netlify handles that online), so a submitted
// form simply opens the thank-you page.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT) || 4321;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.yml': 'text/yaml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
};

const clients = new Set();
let building = false;
let queued = false;

function build() {
  if (building) {
    queued = true;
    return;
  }
  building = true;
  const child = spawn(process.execPath, [path.join(ROOT, 'scripts', 'build.mjs')], { stdio: 'inherit', cwd: ROOT });
  child.on('exit', (code) => {
    building = false;
    if (code === 0) for (const res of clients) res.write('data: reload\n\n');
    if (queued) {
      queued = false;
      build();
    }
  });
}

const RELOAD = `<script>(function(){var s=new EventSource('/__reload');s.onmessage=function(){location.reload()};})();</script>`;

function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  let file = path.join(DIST, clean);
  if (!file.startsWith(DIST)) return null;
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (fs.existsSync(file)) return file;
  if (fs.existsSync(file + '.html')) return file + '.html';
  return null;
}

const server = http.createServer((req, res) => {
  if (req.url === '/__reload') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write('\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }
  if (req.method === 'POST') {
    // Simulate Netlify Forms: go to the form's action page.
    res.writeHead(303, { Location: req.url });
    res.end();
    return;
  }
  // Directory URLs without a trailing slash → redirect like Netlify does.
  const urlPath = req.url.split('?')[0];
  if (!path.extname(urlPath) && !urlPath.endsWith('/')) {
    res.writeHead(301, { Location: urlPath + '/' + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '') });
    res.end();
    return;
  }
  let file = resolveFile(req.url);
  let status = 200;
  if (!file) {
    const lang = (urlPath.match(/^\/(en|la|zh)\//) || [])[1] || 'en';
    file = path.join(DIST, lang, '404', 'index.html');
    status = 404;
  }
  const ext = path.extname(file);
  let body = fs.readFileSync(file);
  if (ext === '.html') body = body.toString().replace('</body>', `${RELOAD}</body>`);
  res.writeHead(status, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  res.end(body);
});

build();
let timer;
for (const dir of ['src', 'content', 'public']) {
  fs.watch(path.join(ROOT, dir), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(build, 150);
  });
}
server.listen(PORT, () => {
  console.log(`\n  MVM GROUP website running at http://localhost:${PORT}/en/\n  Lao: http://localhost:${PORT}/la/   Chinese: http://localhost:${PORT}/zh/\n  Press Ctrl+C to stop.\n`);
});
