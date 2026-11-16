'use strict';

/* ---------- Veri ---------- */
const RECIPES = (window.RECIPES || []).slice().sort((a, b) => a.n.localeCompare(b.n, 'tr'));
const IMAGES = window.IMAGES || {};
const BY_ID = Object.fromEntries(RECIPES.map(r => [r.id, r]));
const CFG = window.CONFIG || {};

const CATS = {
  kirmizi: { label: 'Kırmızı et', emoji: '🥩', color: '#b4232a' },
  tavuk: { label: 'Tavuk', emoji: '🍗', color: '#c77700' },
  balik: { label: 'Balık', emoji: '🐟', color: '#0f6ea8' },
  bakliyat: { label: 'Bakliyat', emoji: '🫘', color: '#8a5a2b' },
  sebze: { label: 'Sebze', emoji: '🥦', color: '#2f7d32' },
};

const CUISINES = {
  tr: { flag: '🇹🇷', label: 'Türk' }, it: { flag: '🇮🇹', label: 'İtalyan' }, gr: { flag: '🇬🇷', label: 'Yunan' },
  es: { flag: '🇪🇸', label: 'İspanyol' }, fr: { flag: '🇫🇷', label: 'Fransız' }, mx: { flag: '🇲🇽', label: 'Meksika' },
  us: { flag: '🇺🇸', label: 'Amerikan' }, cn: { flag: '🇨🇳', label: 'Çin' }, jp: { flag: '🇯🇵', label: 'Japon' },
  th: { flag: '🇹🇭', label: 'Tayland' }, in: { flag: '🇮🇳', label: 'Hint' }, kr: { flag: '🇰🇷', label: 'Kore' },
  vn: { flag: '🇻🇳', label: 'Vietnam' }, lb: { flag: '🇱🇧', label: 'Orta Doğu' }, ma: { flag: '🇲🇦', label: 'Fas' },
  hu: { flag: '🇭🇺', label: 'Macar' }, de: { flag: '🇩🇪', label: 'Alman' }, ru: { flag: '🇷🇺', label: 'Rus' },
  gb: { flag: '🇬🇧', label: 'İngiliz' }, se: { flag: '🇸🇪', label: 'İsveç' },
};
RECIPES.forEach(r => { r.cu = r.cu || 'tr'; });
const isWorld = r => r.cu !== 'tr';

/* Dün ne yendiyse bugün için tercih sırası. Kırmızı et → tavuk → balık. */
const NEXT_PREF = {
  kirmizi: ['tavuk', 'balik', 'bakliyat', 'sebze', 'kirmizi'],
  tavuk: ['balik', 'bakliyat', 'kirmizi', 'sebze', 'tavuk'],
  balik: ['kirmizi', 'tavuk', 'bakliyat', 'sebze', 'balik'],
  bakliyat: ['tavuk', 'balik', 'kirmizi', 'sebze', 'bakliyat'],
  sebze: ['tavuk', 'balik', 'kirmizi', 'bakliyat', 'sebze'],
};

const DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

/* ---------- Yardımcılar ---------- */
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); };
const today = () => ymd(new Date());
const lower = s => s.toLocaleLowerCase('tr');

function dayLabel(s) {
  const t = today();
  if (s === t) return 'Bugün';
  if (s === addDays(t, 1)) return 'Yarın';
  if (s === addDays(t, -1)) return 'Dün';
  return DAYS[parseYmd(s).getDay()];
}
const dayShort = s => { const d = parseYmd(s); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };
const hm = mins => { mins = ((mins % 1440) + 1440) % 1440; return `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`; };
const toMins = s => { const [h, m] = (s || '19:00').split(':').map(Number); return h * 60 + m; };

function timeAgo(ts) {
  if (!ts) return '';
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return 'az önce';
  if (m < 60) return `${m} dk önce`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} saat önce`;
  return `${Math.round(h / 24)} gün önce`;
}

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 4294967295;
}

/* ---------- Durum ---------- */
const LS = 'aksam-ne-yesek-v1';
const DEFAULTS = { picks: {}, excluded: [], skips: {}, shuffles: {}, ready: CFG.defaultReady || '19:00', checked: {}, done: {}, twoDay: false, range: 1, lastPub: 0 };
let S = loadState();
const UI = { date: today(), filter: 'all', q: '', browse: false, ulasTab: 'tarif', sync: 'bağlanıyor' };

function loadState() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(LS) || '{}') || {}; } catch { saved = {}; }
  return { ...DEFAULTS, ...saved };
}
function save() { try { localStorage.setItem(LS, JSON.stringify(S)); } catch { /* özel mod */ } }

const params = new URLSearchParams(location.search);
if (params.get('h')) { S.h = params.get('h'); save(); }
const HOUSE = S.h || CFG.household || 'aksam-ortak';

/* ---------- Tarif yardımcıları ---------- */
function parseIng(line) {
  if (line.startsWith('#')) return { head: line.slice(1).trim() };
  const [amt = '', item = ''] = line.split('|');
  const m = amt.trim().match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  return m ? { q: +m[1], u: m[2], item: item.trim() } : { q: null, u: amt.trim(), item: item.trim() };
}

function fmtQ(q, u) {
  if (q == null) return '';
  if (/^(g|ml)$/.test(u)) {
    if (q >= 1000) return `${+(q / 1000).toFixed(2)} ${u === 'g' ? 'kg' : 'lt'}`.replace(/ (kg|lt)$/, ' $1');
    return String(Math.round(q));
  }
  const w = Math.floor(q + 0.01);
  const f = q - w;
  const F = [[0, ''], [0.25, '¼'], [1 / 3, '⅓'], [0.5, '½'], [2 / 3, '⅔'], [0.75, '¾'], [1, '']];
  let best = F[0];
  for (const x of F) if (Math.abs(x[0] - f) < Math.abs(best[0] - f)) best = x;
  const whole = best[0] === 1 ? w + 1 : w;
  if (!whole && !best[1]) return String(+q.toFixed(2));
  return `${whole || ''}${best[1]}`;
}

function ingText(p, mult = 1) {
  if (p.q == null) return p.u ? `${p.item} (${p.u})` : p.item;
  const q = fmtQ(p.q * mult, p.u);
  const unit = /^(g|ml)$/.test(p.u) && p.q * mult >= 1000 ? '' : p.u;
  return [q, unit, p.item].filter(Boolean).join(' ');
}

const keyOf = item => lower(item.replace(/\(.*?\)/g, '')).replace(/\s+/g, ' ').trim();
const WATER = /^(su|sıcak su|kaynar su|soğuk su|ılık su|buzlu su)$/;
const PANTRY = /^(tuz|karabiber|pul biber|kimyon|kekik|kuru nane|zeytinyağı|sıvı yağ|ayçiçek yağı|şeker|toz şeker|un|sumak|yenibahar|tarçın|defne yaprağı|isot|zerdeçal|köri|toz kırmızı biber|tatlı toz biber|sirke|elma sirkesi|üzüm sirkesi|nar ekşisi|karbonat|kabartma tozu|domates salçası|biber salçası|bal|hardal|tahin|susam|çörek otu|limon tuzu|maydanoz kurusu|dereotu kurusu|toz zencefil|kişniş|mısır nişastası|soya sosu|garam masala|muskat|fesleğen|karanfil|tarçın çubuğu|ketçap|kimyon tohumu|kimyon tohumu ya da kimyon|garam masala ya da köri|instant maya)$/;
const AISLES = [
  ['🥫 Market (konserve & dünya)', /(konserve|hindistan cevizi|köri ezmesi|pirinç eriştesi|turşu|kapari|fasulye filizi|demirhindi)/],
  ['🥩 Kasap', /(kıyma|dana|kuzu|bonfile|antrikot|kuşbaşı|incik|sucuk|pastırma|biftek|kaburga|ciğer)/],
  ['🍗 Tavuk', /(tavuk|hindi)/],
  ['🐟 Balıkçı', /(levrek|çipura|somon|hamsi|palamut|uskumru|mezgit|karides|alabalık|istavrit|lüfer|barbun|kalamar|midye|balık|lakerda|kalkan|sardalya|ahtapot)/],
  ['🥛 Süt & şarküteri', /(yoğurt|süt|peynir|kaşar|tereyağı|yumurta|(^| )lor|labne|krema|ayran|kefir|hellim|mozzarella|parmesan)/],
  ['🌾 Kuru gıda & fırın', /(bulgur|pirinç|spagetti|penne|linguine|lazanya|kuskus|hamburger ekmeği|fıstığı|yer fıstığı|maya|mercimek|nohut|kuru fasulye|barbunya|börülce kuru|makarna|erişte|(^| )unu?( |$)|yufka|lavaş|ekme(k|ğ)|irmik|yulaf|şehriye|ceviz|fındık|badem|kuş üzümü|çam fıstığı|galeta|tortilla|pide|kinoa|karabuğday|frik|kuru kayısı|kuru erik|zeytin|bakla kuru|maş fasulyesi|nişasta|kadayıf|mantı)/],
  ['🥬 Manav', /./],
];
function aisleOf(key) {
  if (PANTRY.test(key)) return '🧂 Evde var mı? (temel & baharat)';
  for (const [name, re] of AISLES) if (re.test(key)) return name;
  return '🥬 Manav';
}
const AISLE_ORDER = ['🥬 Manav', '🥩 Kasap', '🍗 Tavuk', '🐟 Balıkçı', '🥛 Süt & şarküteri', '🌾 Kuru gıda & fırın', '🥫 Market (konserve & dünya)', '🧂 Evde var mı? (temel & baharat)'];

function mainIngredients(r) {
  return r.i.map(parseIng).filter(p => !p.head && !WATER.test(keyOf(p.item)) && !PANTRY.test(keyOf(p.item)))
    .map(p => p.item.replace(/\(.*?\)/g, '').trim());
}

/* ---------- Seçimler ve öneriler ---------- */
const pickOf = d => { const p = S.picks[d]; return p && p.id && BY_ID[p.id] ? p : null; };

function prevMeal(date) {
  for (let i = 1; i <= 2; i++) {
    const p = pickOf(addDays(date, -i));
    if (p) return { p, r: BY_ID[p.id], daysAgo: i };
  }
  return null;
}

function suggestions(date, count = 6) {
  const prev = prevMeal(date);
  const pref = prev ? NEXT_PREF[prev.r.c] : null;
  const skips = new Set(S.skips[date] || []);
  const excluded = new Set(S.excluded);
  const recent = new Map();
  for (let i = 1; i <= 10; i++) {
    const p = pickOf(addDays(date, -i));
    if (p && !recent.has(p.id)) recent.set(p.id, i);
  }
  const seed = `${date}:${S.shuffles[date] || 0}`;
  const scored = RECIPES.filter(r => !skips.has(r.id) && !excluded.has(r.id)).map(r => {
    let score = hash(`${seed}:${r.id}`) * 30;
    if (pref) score += (pref.length - pref.indexOf(r.c)) * 12;
    if (recent.has(r.id)) score -= 60 - recent.get(r.id) * 3;
    return { r, score };
  }).sort((a, b) => b.score - a.score);
  const perCat = {};
  const out = [];
  const worldMax = S.world === false ? 0 : 2;
  let worldCount = 0;
  for (const { r } of scored) {
    if ((perCat[r.c] || 0) >= 2) continue;
    if (isWorld(r) && worldCount >= worldMax) continue;
    if (isWorld(r)) worldCount++;
    perCat[r.c] = (perCat[r.c] || 0) + 1;
    out.push(r);
    if (out.length >= count) break;
  }
  return { list: out, prev, pref };
}

function setPick(date, id, days) {
  const now = Date.now();
  const old = S.picks[date];
  if (old && old.days === 2) {
    const nxt = addDays(date, 1);
    if (S.picks[nxt] && S.picks[nxt].leftover && S.picks[nxt].from === date) S.picks[nxt] = { id: null, ts: now };
  }
  if (!id) {
    S.picks[date] = { id: null, ts: now };
  } else {
    S.picks[date] = { id, days, by: 'Dila', ts: now };
    if (days === 2) S.picks[addDays(date, 1)] = { id, leftover: true, from: date, by: 'Dila', ts: now };
  }
  delete S.done[date];
  save();
}

/* ---------- Senkron (ntfy.sh) ---------- */
const NTFY = (CFG.ntfy || 'https://ntfy.sh').replace(/\/$/, '');
const stateTopic = `${HOUSE}-durum`;
const notifyTopic = HOUSE;
const viewLink = v => `${location.origin}${location.pathname}${S.h ? `?h=${encodeURIComponent(S.h)}` : ''}#/${v}`;

function recentPicks() {
  const from = addDays(today(), -21);
  return Object.fromEntries(Object.entries(S.picks).filter(([d]) => d >= from));
}

async function publishState(note) {
  const body = JSON.stringify({ v: 1, picks: recentPicks(), ts: Date.now() });
  try {
    await fetch(`${NTFY}/${stateTopic}`, { method: 'POST', body });
    if (note) {
      await fetch(NTFY, {
        method: 'POST',
        body: JSON.stringify({ topic: notifyTopic, title: note.title, message: note.message, tags: ['plate_with_cutlery'], click: viewLink('ulas') }),
      });
    }
    S.lastPub = Date.now();
    save();
    setSync('bağlı');
  } catch {
    setSync('çevrimdışı');
    toast('İnternet yok gibi. Seçim bu telefonda kaydedildi, bağlantı gelince tekrar gönderilecek.');
    S.pendingPub = true;
    save();
  }
}

function mergeRemote(obj) {
  if (!obj || !obj.picks) return false;
  let changed = false;
  for (const [d, p] of Object.entries(obj.picks)) {
    const cur = S.picks[d];
    if (!cur || (p.ts || 0) > (cur.ts || 0)) { S.picks[d] = p; changed = true; }
  }
  if (changed) save();
  return changed;
}

async function pollState() {
  try {
    const res = await fetch(`${NTFY}/${stateTopic}/json?poll=1&since=12h`);
    const txt = await res.text();
    let changed = false;
    for (const line of txt.split('\n')) {
      if (!line.trim()) continue;
      try {
        const m = JSON.parse(line);
        if (m.event === 'message') changed = mergeRemote(JSON.parse(m.message)) || changed;
      } catch { /* bozuk satır */ }
    }
    setSync('bağlı');
    if (changed) render();
    if (S.pendingPub) { S.pendingPub = false; publishState(); }
  } catch {
    setSync('çevrimdışı');
  }
}

function subscribe() {
  if (!('EventSource' in window)) return;
  const es = new EventSource(`${NTFY}/${stateTopic}/sse`);
  es.onopen = () => setSync('bağlı');
  es.onerror = () => setSync('yeniden bağlanıyor');
  es.onmessage = e => {
    try {
      const m = JSON.parse(e.data);
      if (m.event !== 'message') return;
      if (mergeRemote(JSON.parse(m.message))) {
        render();
        if (route().view === 'ulas') toast('🔔 Dila yeni bir seçim yaptı');
      }
    } catch { /* yoksay */ }
  };
}

function setSync(s) {
  if (UI.sync === s) return;
  UI.sync = s;
  const el = $('#sync');
  if (el) { el.dataset.state = s; el.querySelector('span').textContent = s; }
}

/* ---------- Görünüm parçaları ---------- */
function photo(r, cls = '') {
  const c = CATS[r.c];
  const img = IMAGES[r.id];
  return `<div class="ph ${cls}" style="--c:${c.color}"><span class="ph-emoji" aria-hidden="true">${r.e || c.emoji}</span>${img ? `<img src="${esc(img)}" alt="${esc(r.n)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}</div>`;
}
const catTag = r => `<span class="tag" style="--c:${CATS[r.c].color}">${CATS[r.c].emoji} ${CATS[r.c].label}</span>${isWorld(r) ? `<span class="tag world">${CUISINES[r.cu]?.flag || '🌍'} ${CUISINES[r.cu]?.label || 'Dünya'}</span>` : ''}`;
const macros = (r, label = 'kişi başı') => `<div class="macros" title="Tahmini değerler, ${label}">
  <div><b>${r.p} g</b><span>protein</span></div><div><b>${r.cb} g</b><span>karbonhidrat</span></div><div><b>${r.k}</b><span>kcal</span></div><div><b>${r.t} dk</b><span>süre</span></div></div>`;

function header(view) {
  const who = view === 'dila' ? '💁‍♀️ Dila' : '👨‍🍳 Ulaş';
  const other = view === 'dila' ? 'ulas' : 'dila';
  return `<header class="top">
    <a class="brand" href="#/">Akşam Ne Yesek?</a>
    <div class="top-r">
      <span id="sync" class="sync" data-state="${esc(UI.sync)}" title="Senkron durumu"><i></i><span>${esc(UI.sync)}</span></span>
      <a class="who" href="#/${other}" title="Diğer görünüme geç">${who} ⇄</a>
    </div>
  </header>`;
}

function dayStrip(selected) {
  const t = today();
  const days = Array.from({ length: 7 }, (_, i) => addDays(t, i));
  return `<nav class="days" aria-label="Gün seç">${days.map(d => {
    const p = pickOf(d);
    const r = p && BY_ID[p.id];
    return `<button class="day ${d === selected ? 'on' : ''} ${r ? 'has' : ''}" data-act="date" data-date="${d}">
      <small>${dayLabel(d)}</small><b>${dayShort(d)}</b>
      <span class="day-pick">${r ? `${r.e || CATS[r.c].emoji} ${esc(r.n)}${p.leftover ? ' (artan)' : ''}` : '—'}</span>
    </button>`;
  }).join('')}</nav>`;
}

/* ---------- Ana sayfa ---------- */
function viewHome() {
  return `<main class="home">
    <div class="hero">
      <div class="hero-emoji">🍲</div>
      <h1>Akşam Ne Yesek?</h1>
      <p>Dila seçer, Ulaş pişirir. Her akşamki “ne yesek” telaşı bitti.</p>
    </div>
    <div class="roles">
      <a class="role" href="#/dila"><span>💁‍♀️</span><b>Dila</b><small>Yemeği ben seçerim</small></a>
      <a class="role" href="#/ulas"><span>👨‍🍳</span><b>Ulaş</b><small>Tarif, saatler ve alışveriş listesi</small></a>
    </div>
    <section class="panel info">
      <h2>Nasıl çalışır?</h2>
      <ol>
        <li>Dila kendi telefonunda <b>Dila</b> sayfasını açar, öneriler arasından seçer ya da beğenmediklerini “İstemiyorum” ile geçer.</li>
        <li>Seçim anında Ulaş’ın sayfasına düşer: tam tarif, saat saat plan ve alışveriş listesi.</li>
        <li>Öneriler dengelidir: dün kırmızı et yendiyse önce tavuk, sonra balık önerilir. Son 10 günde yenenler geri planda kalır.</li>
      </ol>
      <p class="muted">Ana ekrana eklemek için tarayıcıda “Paylaş → Ana Ekrana Ekle”.</p>
      <div class="links">
        <button class="btn ghost sm" data-act="copy" data-text="${esc(viewLink('dila'))}">Dila linkini kopyala</button>
        <button class="btn ghost sm" data-act="copy" data-text="${esc(viewLink('ulas'))}">Ulaş linkini kopyala</button>
      </div>
    </section>
    <p class="foot">${RECIPES.length} tarif · Görseller: Wikimedia Commons · Besin değerleri tahminidir.</p>
  </main>`;
}

/* ---------- Dila ---------- */
function dilaCard(r, date, compact = false) {
  const ings = r.i.map(parseIng).filter(p => !p.head);
  return `<article class="card ${compact ? 'compact' : ''}">
    ${photo(r)}
    <div class="card-b">
      <div class="tags">${catTag(r)}<span class="tag plain">⏱ ${r.t} dk</span></div>
      <h3>${esc(r.n)}</h3>
      <p class="desc">${esc(r.d)}</p>
      ${macros(r)}
      <p class="ing-line"><b>Malzemeler:</b> ${esc(mainIngredients(r).join(', '))}</p>
      <details><summary>Tüm malzemeler ve miktarlar (${ings.length})</summary>
        <ul class="ing">${r.i.map(parseIng).map(p => p.head ? `<li class="h">${esc(p.head)}</li>` : `<li>${esc(ingText(p))}</li>`).join('')}</ul>
      </details>
      <div class="actions">
        <button class="btn primary" data-act="pick" data-id="${r.id}" data-date="${date}">Bunu seç ✓</button>
        ${compact ? '' : `<button class="btn ghost" data-act="skip" data-id="${r.id}" data-date="${date}">İstemiyorum ✕</button>`}
        <button class="btn link" data-act="never" data-id="${r.id}" title="Bu yemeği bir daha önerme">Hiç önerme</button>
      </div>
    </div>
  </article>`;
}

function viewDila() {
  const date = UI.date;
  const p = pickOf(date);
  const r = p && BY_ID[p.id];
  const { list, prev, pref } = suggestions(date);
  const skips = (S.skips[date] || []).filter(id => BY_ID[id]);

  let reason = 'Henüz geçmiş yok, dengeli karışık öneriler.';
  if (prev) {
    const when = prev.daysAgo === 1 ? (date === today() ? 'Dün' : 'Bir önceki gün') : 'İki gün önce';
    reason = `${when} <b>${esc(prev.r.n)}</b> (${CATS[prev.r.c].label.toLocaleLowerCase('tr')}) yediniz → önce <b>${CATS[pref[0]].label.toLocaleLowerCase('tr')}</b>, sonra <b>${CATS[pref[1]].label.toLocaleLowerCase('tr')}</b> öneriyorum.`;
  }

  const picked = r ? `<section class="picked">
      <div class="picked-l">${photo(r, 'sm')}</div>
      <div class="picked-r">
        <small>${dayLabel(date)} için seçimin${p.leftover ? ' (bir önceki günden artan)' : ''}</small>
        <h2>${esc(r.n)}</h2>
        <p class="muted">${p.days === 2 ? '2 gün yetecek kadar pişecek · ' : ''}Ulaş’a gönderildi ${timeAgo(p.ts)}</p>
        <div class="actions"><button class="btn ghost sm" data-act="unpick" data-date="${date}">Seçimi kaldır</button></div>
      </div>
    </section>` : '';

  const browse = UI.browse ? browseList(date) : '';

  return `${header('dila')}
  <main>
    <div class="greet"><h1>Merhaba Dila 👋</h1><p>${dayLabel(date)} akşam ne yesek?</p></div>
    ${dayStrip(date)}
    ${picked}
    <section class="panel">
      <div class="row between wrap">
        <p class="reason">💡 ${reason}</p>
        <div class="row gap">
          <label class="switch"><input type="checkbox" data-act="twoday" ${S.twoDay ? 'checked' : ''}><i></i><span>2 gün yetsin (ertesi gün de aynısı)</span></label>
          <label class="switch"><input type="checkbox" data-act="world" ${S.world !== false ? 'checked' : ''}><i></i><span>🌍 Dünya mutfağı da öner</span></label>
          <button class="btn ghost sm" data-act="shuffle" data-date="${date}">🔀 Karıştır</button>
        </div>
      </div>
    </section>
    <div class="grid">${list.map(x => dilaCard(x, date)).join('')}</div>
    ${skips.length ? `<p class="muted center">İstemediklerin: ${skips.map(id => `<button class="chip" data-act="unskip" data-id="${id}" data-date="${date}" title="Geri getir">${esc(BY_ID[id].n)} ↺</button>`).join(' ')}</p>` : ''}
    <div class="center"><button class="btn ghost" data-act="browse">${UI.browse ? 'Listeyi gizle' : `📖 Tüm ${RECIPES.length} yemeğe göz at`}</button></div>
    <div id="browse">${browse}</div>
    ${S.excluded.length ? `<details class="panel"><summary>Hiç önerilmeyenler (${S.excluded.length})</summary><p>${S.excluded.filter(id => BY_ID[id]).map(id => `<button class="chip" data-act="unnever" data-id="${id}">${esc(BY_ID[id].n)} ↺</button>`).join(' ')}</p></details>` : ''}
  </main>`;
}

function browseList(date) {
  const q = lower(UI.q.trim());
  const cu = UI.cuisine || 'all';
  const items = RECIPES.filter(r => (UI.filter === 'all' || r.c === UI.filter) &&
    (cu === 'all' || (cu === 'tr' ? !isWorld(r) : isWorld(r))) &&
    (!q || lower(r.n).includes(q) || lower(CUISINES[r.cu]?.label || '').includes(q) || r.i.some(l => lower(l).includes(q))));
  const worldN = RECIPES.filter(isWorld).length;
  return `<section class="panel browse">
    <div class="filters">
      <input id="q" type="search" placeholder="Yemek veya malzeme ara (ör. ıspanak)" value="${esc(UI.q)}" autocomplete="off">
      <div class="chips">${[['all', 'Hepsi']].concat(Object.entries(CATS).map(([k, v]) => [k, `${v.emoji} ${v.label}`])).map(([k, l]) =>
        `<button class="chip ${UI.filter === k ? 'on' : ''}" data-act="filter" data-cat="${k}">${l}</button>`).join('')}</div>
      <div class="chips">${[['all', 'Tüm mutfaklar'], ['tr', `🇹🇷 Türk (${RECIPES.length - worldN})`], ['world', `🌍 Dünya (${worldN})`]].map(([k, l]) =>
        `<button class="chip ${cu === k ? 'on' : ''}" data-act="cuisine" data-cu="${k}">${l}</button>`).join('')}</div>
      <p class="muted small">${items.length} yemek</p>
    </div>
    <div id="browse-list" class="grid small">${items.map(r => dilaCard(r, date, true)).join('') || '<p class="muted">Bulunamadı.</p>'}</div>
  </section>`;
}

/* ---------- Ulaş ---------- */
function viewUlas() {
  const date = UI.date;
  return `${header('ulas')}
  <main>
    <div class="greet"><h1>Şef Ulaş 👨‍🍳</h1><p>Dila ne seçti, ne zaman başlamalısın, ne almalısın.</p></div>
    ${dayStrip(date)}
    <div class="tabs" role="tablist">
      <button role="tab" class="${UI.ulasTab === 'tarif' ? 'on' : ''}" data-act="tab" data-tab="tarif">🍳 Tarif & saatler</button>
      <button role="tab" class="${UI.ulasTab === 'liste' ? 'on' : ''}" data-act="tab" data-tab="liste">🛒 Alışveriş listesi</button>
    </div>
    ${UI.ulasTab === 'tarif' ? ulasRecipe(date) : ulasShopping()}
  </main>`;
}

function ulasRecipe(date) {
  const p = pickOf(date);
  if (!p) {
    return `<section class="panel empty">
      <div class="big">⏳</div>
      <h2>${dayLabel(date)} için Dila henüz seçmedi</h2>
      <p class="muted">Seçim yapıldığı an burada görünecek. Telefonuna bildirim gelmesi için aşağıdaki adımı bir kez yap.</p>
      ${notifyHelp()}
    </section>`;
  }
  const r = BY_ID[p.id];
  if (p.leftover) {
    return `<section class="panel recipe-head">${photo(r, 'wide')}
      <div class="rh-b"><div class="tags">${catTag(r)}<span class="tag plain">♻️ Dünden kalan</span></div>
      <h2>${esc(r.n)}</h2>
      <p>Bugün pişirmek yok 🎉 Dün iki günlük yaptın. Yemeği tencereyle kısık ateşte 10–15 dakika (gerekirse 2–3 yemek kaşığı su ekleyerek) ya da fırında 180°C’de 15 dakika ısıt. Yanına taze bir salata yap.</p>
      ${macros(r)}</div></section>`;
  }
  const mult = p.days || 1;
  const ready = S.ready;
  const end = toMins(ready);
  const start = end - r.t;
  const done = new Set(S.done[date] || []);
  const nowM = new Date().getHours() * 60 + new Date().getMinutes();
  const isToday = date === today();
  let currentIdx = -1;
  if (isToday) r.s.forEach(([off], i) => { if (start + off <= nowM) currentIdx = i; });

  return `<section class="panel recipe-head">
      ${photo(r, 'wide')}
      <div class="rh-b">
        <div class="tags">${catTag(r)}${mult === 2 ? '<span class="tag plain">🍱 2 günlük (4 porsiyon)</span>' : '<span class="tag plain">2 kişilik</span>'}</div>
        <h2>${esc(r.n)}</h2>
        <p class="muted">Dila seçti · ${timeAgo(p.ts)}</p>
        <p>${esc(r.d)}</p>
        ${macros(r)}
      </div>
    </section>

    <div class="cook-grid">
    <section class="panel">
      <div class="row between wrap">
        <h3>⏰ Zaman planı</h3>
        <label class="ready">Yemek hazır olsun: <input type="time" id="ready" value="${esc(ready)}"></label>
      </div>
      <p class="start">👉 <b>${hm(start)}</b>’te mutfağa gir · yemek <b>${hm(end)}</b>’de masada</p>
      <ol class="timeline">
        ${r.s.map(([off, txt], i) => `<li class="${done.has(i) ? 'done' : ''} ${i === currentIdx && !done.has(i) ? 'now' : ''}">
          <label><input type="checkbox" data-act="step" data-i="${i}" data-date="${date}" ${done.has(i) ? 'checked' : ''}>
          <time>${hm(start + off)}</time><span>${esc(txt)}</span></label></li>`).join('')}
        <li class="serve"><label><time>${hm(end)}</time><span>🍽️ Servis! Afiyet olsun.</span></label></li>
      </ol>
      ${mult === 2 ? '<p class="muted">Miktarlar 2 gün için ikiye katlandı. Daha büyük tencere kullan; pişme süresi 5–10 dakika uzayabilir. Yarınki porsiyonu soğuyunca kapalı kapta buzdolabına koy.</p>' : ''}
    </section>

    <section class="panel">
      <h3>🧺 Malzemeler ${mult === 2 ? '(4 porsiyon)' : '(2 porsiyon)'}</h3>
      <ul class="ing big">${r.i.map(parseIng).map(x => x.head ? `<li class="h">${esc(x.head)}</li>` : `<li>${esc(ingText(x, mult))}</li>`).join('')}</ul>
      ${r.tip ? `<p class="tip">💡 ${esc(r.tip)}</p>` : ''}
      ${measuresGuide()}
    </section>
    </div>`;
}

function measuresGuide() {
  return `<details class="measures"><summary>📏 Ölçü rehberi (tartısız)</summary>
    <ul>
      <li><b>1 su bardağı</b> = 200 ml (normal su bardağı)</li>
      <li><b>1 çay bardağı</b> ≈ 100 ml (ince belli çay bardağı)</li>
      <li><b>1 yemek kaşığı</b> (çorba kaşığı) ≈ 15 ml</li>
      <li><b>1 tatlı kaşığı</b> ≈ 10 ml</li>
      <li><b>1 çay kaşığı</b> ≈ 5 ml</li>
      <li>1 su bardağı bulgur/pirinç ≈ 180 g · 1 su bardağı mercimek ≈ 190 g · 1 su bardağı un ≈ 110 g</li>
      <li>Et, tavuk ve balık: kasaptan/paketten yazan ağırlıkta al, tartmana gerek yok.</li>
    </ul></details>`;
}

function notifyHelp() {
  return `<div class="notify">
    <b>📲 Bildirim kur (bir kez):</b>
    <ol>
      <li>Telefona ücretsiz <b>ntfy</b> uygulamasını indir (App Store / Google Play).</li>
      <li>“+” ile abone ol, konu adı: <code>${esc(notifyTopic)}</code></li>
      <li>Dila her seçim yaptığında telefonuna bildirim gelir.</li>
    </ol>
    <button class="btn ghost sm" data-act="copy" data-text="${esc(notifyTopic)}">Konu adını kopyala</button>
  </div>`;
}

function shoppingData(dates) {
  const map = new Map();
  for (const d of dates) {
    const p = pickOf(d);
    if (!p || p.leftover) continue;
    const r = BY_ID[p.id];
    const mult = p.days || 1;
    for (const line of r.i) {
      const x = parseIng(line);
      if (x.head) continue;
      const key = keyOf(x.item);
      if (WATER.test(key)) continue;
      const e = map.get(key) || { key, name: x.item.replace(/\(.*?\)/g, '').trim(), amounts: {}, recipes: new Set() };
      if (x.q != null) e.amounts[x.u] = (e.amounts[x.u] || 0) + x.q * mult;
      e.recipes.add(r.n);
      map.set(key, e);
    }
  }
  const groups = {};
  for (const e of map.values()) (groups[aisleOf(e.key)] ||= []).push(e);
  for (const g of Object.values(groups)) g.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  return AISLE_ORDER.filter(a => groups[a]).map(a => [a, groups[a]]);
}
const amountText = e => Object.entries(e.amounts).map(([u, q]) => {
  const big = /^(g|ml)$/.test(u) && q >= 1000;
  return `${fmtQ(q, u)}${big ? '' : ` ${u}`}`.trim();
}).join(' + ');

function ulasShopping() {
  const t = today();
  const dates = Array.from({ length: S.range }, (_, i) => addDays(t, i));
  const meals = dates.map(d => [d, pickOf(d)]).filter(([, p]) => p);
  const groups = shoppingData(dates);
  const total = groups.reduce((n, [, g]) => n + g.length, 0);
  const checked = groups.reduce((n, [, g]) => n + g.filter(e => S.checked[e.key]).length, 0);
  return `<section class="panel">
    <div class="row between wrap">
      <h3>🛒 Alışveriş listesi</h3>
      <div class="chips">${[[1, 'Bugün'], [2, '2 gün'], [3, '3 gün'], [7, '7 gün']].map(([n, l]) =>
        `<button class="chip ${S.range === n ? 'on' : ''}" data-act="range" data-n="${n}">${l}</button>`).join('')}</div>
    </div>
    ${meals.length ? `<p class="muted">Yemekler: ${meals.map(([d, p]) => `<b>${dayLabel(d)}</b> ${esc(BY_ID[p.id].n)}${p.leftover ? ' (artan)' : ''}${p.days === 2 ? ' ×2' : ''}`).join(' · ')}</p>` :
      '<p class="muted">Bu aralıkta Dila henüz yemek seçmedi.</p>'}
    ${total ? `<div class="progress"><i style="width:${Math.round(checked / total * 100)}%"></i></div><p class="muted">${checked}/${total} alındı</p>` : ''}
    ${groups.map(([aisle, items]) => `<div class="aisle ${aisle.startsWith('🧂') ? 'pantry' : ''}">
      <h4>${aisle}</h4>
      <ul class="shop">${items.map(e => `<li class="${S.checked[e.key] ? 'done' : ''}"><label>
        <input type="checkbox" data-act="check" data-key="${esc(e.key)}" ${S.checked[e.key] ? 'checked' : ''}>
        <span class="nm">${esc(e.name)}</span><span class="am">${esc(amountText(e))}</span></label></li>`).join('')}</ul></div>`).join('')}
    ${total ? `<div class="actions">
      <button class="btn primary" data-act="sharelist">WhatsApp’ta paylaş</button>
      <button class="btn ghost" data-act="copylist">Kopyala</button>
      <button class="btn link" data-act="resetlist">İşaretleri sıfırla</button></div>` : ''}
  </section>`;
}

function listText() {
  const t = today();
  const groups = shoppingData(Array.from({ length: S.range }, (_, i) => addDays(t, i)));
  return `🛒 Alışveriş listesi\n${groups.map(([a, items]) => `\n${a}\n${items.filter(e => !S.checked[e.key]).map(e => `• ${e.name}${amountText(e) ? ` – ${amountText(e)}` : ''}`).join('\n')}`).join('\n')}`;
}

/* ---------- Yönlendirme ve çizim ---------- */
function route() {
  const h = location.hash.replace(/^#\/?/, '');
  return { view: h.split('/')[0] || '' };
}

function render() {
  const { view } = route();
  const y = window.scrollY;
  const app = $('#app');
  document.body.dataset.view = view || 'home';
  if (view === 'dila') app.innerHTML = viewDila();
  else if (view === 'ulas') app.innerHTML = viewUlas();
  else app.innerHTML = viewHome();
  window.scrollTo(0, y);
}

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast('Kopyalandı ✓'); }
  catch { prompt('Kopyala:', text); }
}

/* ---------- Eylemler ---------- */
const ACT = {
  date: d => { UI.date = d.date; render(); },
  pick: d => {
    const r = BY_ID[d.id];
    const days = S.twoDay ? 2 : 1;
    setPick(d.date, d.id, days);
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast(`✓ ${r.n} seçildi, Ulaş’a gönderiliyor`);
    publishState({ title: `${dayLabel(d.date)} akşam: ${r.n} ${r.e || ''}`, message: `Dila ${dayLabel(d.date).toLocaleLowerCase('tr')} için ${r.n} seçti${days === 2 ? ' (2 günlük)' : ''}. ${S.ready}’de hazır olması için ${hm(toMins(S.ready) - r.t)}’te başla.` });
  },
  unpick: d => {
    setPick(d.date, null);
    render();
    publishState({ title: 'Seçim kaldırıldı', message: `Dila ${dayLabel(d.date).toLocaleLowerCase('tr')} için seçimini kaldırdı.` });
  },
  skip: d => { (S.skips[d.date] ||= []).push(d.id); save(); render(); },
  unskip: d => { S.skips[d.date] = (S.skips[d.date] || []).filter(x => x !== d.id); save(); render(); },
  never: d => { if (!S.excluded.includes(d.id)) S.excluded.push(d.id); save(); render(); toast(`${BY_ID[d.id].n} bir daha önerilmeyecek`); },
  unnever: d => { S.excluded = S.excluded.filter(x => x !== d.id); save(); render(); },
  shuffle: d => { S.shuffles[d.date] = (S.shuffles[d.date] || 0) + 1; save(); render(); },
  twoday: (d, e) => { S.twoDay = e.target.checked; save(); },
  world: (d, e) => { S.world = e.target.checked; save(); render(); },
  cuisine: d => { UI.cuisine = d.cu; render(); },
  browse: () => { UI.browse = !UI.browse; render(); },
  filter: d => { UI.filter = d.cat; render(); },
  tab: d => { UI.ulasTab = d.tab; render(); },
  step: (d, e) => {
    const set = new Set(S.done[d.date] || []);
    e.target.checked ? set.add(+d.i) : set.delete(+d.i);
    S.done[d.date] = [...set];
    save();
    render();
  },
  check: (d, e) => { if (e.target.checked) S.checked[d.key] = true; else delete S.checked[d.key]; save(); render(); },
  range: d => { S.range = +d.n; save(); render(); },
  resetlist: () => { S.checked = {}; save(); render(); },
  copylist: () => copy(listText()),
  sharelist: () => window.open(`https://wa.me/?text=${encodeURIComponent(listText())}`, '_blank', 'noopener'),
  copy: d => copy(d.text),
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.tagName === 'INPUT') return;
  const fn = ACT[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el.dataset, e); }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.id === 'ready') { S.ready = el.value || '19:00'; save(); render(); return; }
  if (el.matches('input[data-act]')) ACT[el.dataset.act]?.(el.dataset, e);
});
document.addEventListener('input', e => {
  if (e.target.id !== 'q') return;
  UI.q = e.target.value;
  const box = $('#browse');
  const pos = e.target.selectionStart;
  box.innerHTML = browseList(UI.date);
  const q = $('#q');
  q.focus();
  q.setSelectionRange(pos, pos);
});

window.addEventListener('hashchange', () => { window.scrollTo(0, 0); render(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) { pollState(); render(); } });
setInterval(() => { if (route().view === 'ulas') render(); }, 60000);

render();
pollState();
subscribe();
