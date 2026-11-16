// Tarif görsellerini Wikipedia / Wikimedia Commons'tan bulur ve data/images.js dosyasını üretir.
// Kullanım: node scripts/fetch-images.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ['kirmizi-et', 'tavuk', 'balik', 'bakliyat', 'sebze', 'dunya-1', 'dunya-2']) {
  vm.runInContext(fs.readFileSync(`${root}data/${f}.js`, 'utf8'), ctx);
}
const recipes = ctx.window.RECIPES;
const UA = { 'User-Agent': 'aksam-ne-yesek-recipe-site/1.0 (static image lookup)' };
const overridesPath = `${root}data/image-overrides.json`;
const overrides = fs.existsSync(overridesPath) ? JSON.parse(fs.readFileSync(overridesPath, 'utf8')) : {};

async function getJson(url) {
  for (let i = 0; i < 3; i++) {
    const res = await fetch(url, { headers: UA });
    if (res.ok) return res.json();
    await new Promise(r => setTimeout(r, 1000 * (i + 1)));
  }
  return null;
}

async function pageImages(lang, titles) {
  const out = {};
  for (let i = 0; i < titles.length; i += 40) {
    const chunk = titles.slice(i, i + 40);
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=800&titles=${encodeURIComponent(chunk.join('|'))}`;
    const j = await getJson(url);
    if (!j?.query) continue;
    const map = {};
    for (const n of j.query.normalized || []) map[n.to] = n.from;
    for (const rd of j.query.redirects || []) map[rd.to] = map[rd.from] || rd.from;
    for (const p of Object.values(j.query.pages)) {
      const orig = map[p.title] || p.title;
      if (p.thumbnail?.source) out[orig] = p.thumbnail.source.split('?')[0];
    }
  }
  return out;
}

async function commonsSearch(q) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=5&gsrsearch=${encodeURIComponent(`${q} filetype:bitmap`)}&prop=imageinfo&iiprop=url&iiurlwidth=800`;
  const j = await getJson(url);
  const pages = Object.values(j?.query?.pages || {}).sort((a, b) => a.index - b.index);
  return pages.find(p => p.imageinfo?.[0]?.thumburl)?.imageinfo[0].thumburl || null;
}

const result = {};
const titles = [...new Set(recipes.map(r => r.w).filter(Boolean))];
const tr = await pageImages('tr', titles);
const en = await pageImages('en', titles);
for (const r of recipes) {
  if (overrides[r.id]) { result[r.id] = overrides[r.id]; continue; }
  const primary = r.cu && r.cu !== 'tr' ? [en, tr] : [tr, en];
  result[r.id] = primary[0][r.w] || primary[1][r.w] || null;
}
for (const r of recipes) {
  if (result[r.id]) continue;
  result[r.id] = await commonsSearch(r.n) || await commonsSearch(r.w || r.n);
}
const missing = recipes.filter(r => !result[r.id]).map(r => r.id);
const clean = Object.fromEntries(Object.entries(result).filter(([, v]) => v));
fs.writeFileSync(`${root}data/images.js`, `// Otomatik üretildi: node scripts/fetch-images.mjs — Görseller Wikimedia Commons\nwindow.IMAGES = ${JSON.stringify(clean, null, 1)};\n`);
console.log(`${Object.keys(clean).length}/${recipes.length} görsel bulundu`);
if (missing.length) console.log('Eksik:', missing.join(', '));
