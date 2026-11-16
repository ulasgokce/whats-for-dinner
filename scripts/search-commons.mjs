// Commons'ta yemek fotoğrafı arar, ilk 3 sonucu listeler. Kullanım: node scripts/search-commons.mjs queries.json
import fs from 'node:fs';

const queries = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const UA = { 'User-Agent': 'aksam-ne-yesek-recipe-site/1.0 (static image lookup)' };
const out = {};
for (const [id, q] of Object.entries(queries)) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=6&gsrsearch=${encodeURIComponent(`${q} filetype:bitmap`)}&prop=imageinfo&iiprop=url&iiurlwidth=800`;
  let j = {};
  for (let attempt = 0; attempt < 4; attempt++) {
    await new Promise(r => setTimeout(r, 1500 + attempt * 4000));
    const res = await fetch(url, { headers: UA });
    if (res.ok) { j = await res.json(); break; }
  }
  const pages = Object.values(j?.query?.pages || {}).sort((a, b) => a.index - b.index)
    .filter(p => p.imageinfo?.[0]?.thumburl && !/\.(gif|svg|png)$/i.test(p.title));
  out[id] = pages.slice(0, 3).map(p => ({ t: p.title.replace('File:', ''), u: p.imageinfo[0].thumburl.split('?')[0] }));
  console.log(id.padEnd(26), out[id].map((x, i) => `[${i}] ${x.t.slice(0, 55)}`).join('  |  '));
}
fs.writeFileSync(process.argv[2].replace('.json', '-results.json'), JSON.stringify(out, null, 1));
