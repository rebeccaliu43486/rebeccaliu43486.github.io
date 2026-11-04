(() => {
"use strict";
/* ==================================================================
   ENGINE. Reads #site (settings) and #source (content) and builds the
   page. You should not need to edit anything below this line.
   ================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtYM = ym => { if (!ym) return ''; const [y, m] = ym.split('-'); return m ? MON[+m - 1] + ' ' + y : y; };
const fmtDM = iso => { const [, m, d] = iso.split('-'); return (+d) + ' ' + MON[+m - 1]; };
const pad = n => String(n).padStart(2, '0');
const NOW = new Date();
const TODAY = NOW.getFullYear() + '-' + pad(NOW.getMonth() + 1) + '-' + pad(NOW.getDate());
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let LIST;
try { LIST = new Intl.ListFormat('en-US', { style: 'long', type: 'conjunction' }); } // en-US keeps the Oxford comma
catch (e) { LIST = { format: a => a.length < 3 ? a.join(' and ') : a.slice(0, -1).join(', ') + ', and ' + a[a.length - 1] }; }
const warn = (...a) => { try { console.warn('[site]', ...a); } catch (e) {} };
/* separators: a no-break space ties each middle dot to the word before it, so no line starts with one */
const NB = '\u00a0', SEP = '\u00a0· ';
const SEPSPAN = `<span class="sep" aria-hidden="true">${SEP}</span>`;

/* ---------- settings (with a visible message if the JSON is broken) ---------- */
let SITE = {};
try { SITE = JSON.parse($('#site').textContent); }
catch (e) {
  const m = document.createElement('p'); m.className = 'cfg-error'; m.setAttribute('role', 'alert');
  m.textContent = 'The settings block (#site) has a syntax error, so defaults are used. Check for a missing comma or quote. ' + e.message;
  document.body.prepend(m);
  warn('The settings JSON is broken, so defaults are used: ' + e.message);
}
/* the name falls back to the page's own header text, so a typo in the settings never shows "Your Name" */
SITE = Object.assign({ name: (($('#brand') && $('#brand').textContent.trim()) || 'Your Name'), role: '', institution: '', mode: 'social-science', onMarket: false, marketYear: '', email: '', office: '', timezone: 'Asia/Singapore', profiles: [], updated: '' }, SITE);
SITE.cv = SITE.cv === null ? { url: '', updated: '' } : Object.assign({ url: 'cv.pdf', updated: '' }, SITE.cv || {});
/* "cv": null or an empty url switches every CV link off (header, hero, menu, contact, footer) */
const HAS_CV = !!SITE.cv.url && (SITE.preview || SITE.cv.url !== '#');
if (!Array.isArray(SITE.profiles)) SITE.profiles = [];
const SRC = $('#source') || document.createElement('div');
/* entries marked data-template are placeholders: they show only while "preview" is true,
   so a template that was never filled in cannot reach the live site */
const TEMPLATES = $$('[data-template]', SRC).length;
if (!SITE.preview) $$('[data-template]', SRC).forEach(el => el.remove());
const isTmpl = el => !!(SITE.preview && el && el.closest && el.closest('[data-template]'));
const tmplIf = on => on ? '<span class="tmpl" title="Placeholder entries: replace them with your own">Template</span>' : '';
const tmplTag = els => tmplIf([].concat(els || []).some(isTmpl));
/* in preview, anything that is not a real web address is a placeholder (e.g. cv.pdf not uploaded yet) */
const sample = href => SITE.preview && (!href || href === '#' || !/^(https?:|mailto:)/i.test(href));
const A = (href, text, cls = '', extra = '') => `<a href="${esc(href || '#')}"${cls ? ` class="${cls}"` : ''}${sample(href) ? ' data-sample' : ''}${extra ? ' ' + extra : ''}>${text}</a>`;
/* profile links still set to "#" show only in preview */
const PROFILES = SITE.profiles.filter(x => x && x.label && x.url && (SITE.preview || x.url !== '#'));
const blocks = name => $(`[data-block="${name}"]`, SRC);
const items = name => { const b = blocks(name); return b ? $$('li', b) : []; };

/* ---------- places ---------- */
const ICON = {
  singapore: "<line x1=\"6\" y1=\"42\" x2=\"42\" y2=\"42\"/><path d=\"M8.5 42V39.5H39.5V42\"/><path d=\"M10 39.5V11.5M38 39.5V11.5\"/><path d=\"M7 11.5H41L37 6H11Z\"/><path d=\"M15 6V11.5M19.5 6V11.5M24 6V11.5M28.5 6V11.5M33 6V11.5\"/><path d=\"M13 24V16.5A2.5 2.5 0 0 1 18 16.5V24Z\"/><path d=\"M21.5 24V16.5A2.5 2.5 0 0 1 26.5 16.5V24Z\"/><path d=\"M30 24V16.5A2.5 2.5 0 0 1 35 16.5V24Z\"/><path d=\"M13 16.5A2.5 2.5 0 0 1 18 16.5ZM21.5 16.5A2.5 2.5 0 0 1 26.5 16.5ZM30 16.5A2.5 2.5 0 0 1 35 16.5Z\" fill=\"currentColor\" stroke=\"none\"/><path d=\"M8.5 26.5H39.5\"/><path d=\"M12.5 26.5V39.5M35.5 26.5V39.5\"/><path d=\"M21 39.5V32A3 3 0 0 1 27 32V39.5\"/><path d=\"M21 32A3 3 0 0 1 27 32Z\" fill=\"currentColor\" stroke=\"none\"/><path d=\"M15 32H18V36H15ZM30 32H33V36H30Z\" fill=\"currentColor\" stroke=\"none\"/>",
  shanghai: "<path d=\"M6 42H42\"/><path d=\"M16 42V16H32V42\"/><path d=\"M16 16L24 5L32 16\"/><path d=\"M16 19H32\"/><path d=\"M9 42V30H12.5V24H16\"/><path d=\"M39 42V30H35.5V24H32\"/><path d=\"M20 22V34\"/><path d=\"M24 22V34\"/><path d=\"M28 22V34\"/><path d=\"M21.5 42V37H26.5V42\"/>",
  hongkong: "<path d=\"M6 42H42\"/><path d=\"M9.5 42V9.5H29.5V42\"/><path d=\"M12.5 9.5V5.5H18.5V9.5\"/><path d=\"M8 17H31M8 24.5H31M8 32H31\"/><path d=\"M13.5 12.5H16.5V15H13.5ZM22.5 12.5H25.5V15H22.5ZM13.5 20H16.5V22.5H13.5ZM22.5 20H25.5V22.5H22.5ZM13.5 27.5H16.5V30H13.5ZM22.5 27.5H25.5V30H22.5Z\" fill=\"currentColor\" stroke=\"none\"/><path d=\"M13 42V36H26V42\"/><path d=\"M29.5 13H40\"/><path d=\"M34 13V32H40V13\"/>",
  london: "<line x1=\"6\" y1=\"42\" x2=\"42\" y2=\"42\"/><circle cx=\"24\" cy=\"25\" r=\"17\"/><path d=\"M14 35.5V22a10 10 0 0 1 20 0v13.5z\"/><rect x=\"17\" y=\"18\" width=\"14\" height=\"6.5\" rx=\"2\"/><path d=\"M24 24.5v11\"/><circle cx=\"18\" cy=\"30.5\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"30\" cy=\"30.5\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/><path d=\"M14 38.5h20\"/>",
  oxford: "<path d=\"M6 42H42\"/><path d=\"M8 42V34M40 42V34\"/><path d=\"M7 34H41\"/><path d=\"M21.5 42V39A2.5 2.5 0 0 1 26.5 39V42\"/><path d=\"M12.5 42V39A1.5 2.5 0 0 1 15.5 39V42M32.5 42V39A1.5 2.5 0 0 1 35.5 39V42\"/><path d=\"M10 34V22M38 34V22\"/><path d=\"M9 25H39\"/><path d=\"M17.5 34V25M20 34V25M28 34V25M30.5 34V25\"/><path d=\"M13 27.5H15V31.5H13ZM22.5 27.5H25.5V31.5H22.5ZM33 27.5H35V31.5H33Z\" fill=\"currentColor\" stroke=\"none\"/><path d=\"M10 22H38\"/><circle cx=\"10\" cy=\"20.5\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"38\" cy=\"20.5\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/><path d=\"M13 22V19A11 9 0 0 1 35 19V22\"/><path d=\"M17.5 22V19A6.5 9 0 0 1 21.5 10.5M30.5 22V19A6.5 9 0 0 0 26.5 10.5M24 22V10\"/><path d=\"M21 10H27\"/><path d=\"M21.5 10V7.5H26.5V10\"/><path d=\"M21.5 7.5A2.5 1.5 0 0 1 26.5 7.5\"/><path d=\"M24 6V5\"/>",
  stanford: "<path d=\"M6 42H42\"/><path d=\"M10 42A40 40 0 0 1 11 16.5\"/><path d=\"M11 16.5A6 6 0 0 0 6 20M11 16.5A6 6 0 0 1 16 20M11 16.5A4.5 4.5 0 0 0 6.5 13.5M11 16.5A4.5 4.5 0 0 1 15.5 13.5\"/><path d=\"M34.5 26A40 40 0 0 0 33.5 11\"/><path d=\"M33.5 11A6 6 0 0 0 28.5 14.5M33.5 11A6 6 0 0 1 38.5 14.5M33.5 11A4.5 4.5 0 0 0 29 8M33.5 11A4.5 4.5 0 0 1 38 8\"/><path d=\"M15 42V30M39 42V30\"/><path d=\"M15 36.5A4 4 0 0 1 23 36.5A4 4 0 0 1 31 36.5A4 4 0 0 1 39 36.5\"/><path d=\"M23 36.5V42M31 36.5V42\"/><path d=\"M21.5 36.5H24.5M29.5 36.5H32.5\"/><path d=\"M13 30H41L36.5 26H17.5Z\"/><path d=\"M19 30V28.5M23 30V28.5M27 30V28.5M31 30V28.5M35 30V28.5\"/>"
};
const CITY = {
  singapore: { name: 'Singapore', tz: 'Asia/Singapore', zone: 'SGT', geo: '1.29° N, 103.85° E' },
  shanghai: { name: 'Shanghai', tz: 'Asia/Shanghai', zone: 'China time', geo: '31.23° N, 121.47° E' },
  hongkong: { name: 'Hong Kong', tz: 'Asia/Hong_Kong', zone: 'HKT', geo: '22.28° N, 114.16° E' },
  london: { name: 'London', tz: 'Europe/London', zone: 'UK time', geo: '51.51° N, 0.13° W' },
  oxford: { name: 'Oxford', tz: 'Europe/London', zone: 'UK time', geo: '51.75° N, 1.26° W' },
  stanford: { name: 'Stanford', tz: 'America/Los_Angeles', zone: 'Pacific time', geo: '37.43° N, 122.17° W' }
};
/* inline glosses only for the Chinese-speaking cities; Singapore's four names stay together on its plate */
const LOCAL = { 'Shanghai': ['zh-Hans-CN', '上海'], 'Hong Kong': ['zh-Hant-HK', '香港'] };
const cityName = s => { const l = LOCAL[s]; return l ? `<span class="city">${esc(s)} <span lang="${l[0]}" class="hz">${l[1]}</span></span>` : esc(s); };
const cid = s => String(s || '').toLowerCase().replace(/[\s_.-]+/g, '');
const titleCase = s => String(s || '').replace(/\b\p{L}/gu, c => c.toUpperCase());
const cityOf = raw => CITY[cid(raw)] || { name: titleCase(raw) };
const nowrapYears = html => String(html).replace(/(\d{4})–(\d{2,4}|now)/g, '<span class="nw">$1–$2</span>');
/* where the owner is now: the last Path stop with a start year and no end (Singapore by default).
   Stops without years (e.g. a school shown only by its logo) are never "now". */
const pathItems = () => { const b = SRC.querySelector('[data-block="path"]'); return b ? Array.from(b.querySelectorAll('li')) : []; };
const isOpenStop = d => !!d.start && !d.end;
/* "pathOrder": "newest" shows the Path and the hero's "Before that" cities newest first */
const NEWEST_FIRST = String(SITE.pathOrder || '').toLowerCase() === 'newest';
/* the badge on the current stop; "hereLabel": "" leaves it off */
const HERE_LABEL = SITE.hereLabel === undefined ? 'Now arriving' : String(SITE.hereLabel).trim();
const HERE = (() => { const li = pathItems().filter(x => isOpenStop(x.dataset)).pop(); return li ? cid(li.dataset.city) : 'singapore'; })();
const BASE = Object.assign({ name: 'Singapore', tz: 'Asia/Singapore', zone: 'SGT' }, CITY[HERE] || cityOf(HERE));
const offsetLabel = tz => { const o = utcOffset(tz); return o ? o.label : ''; };   // called only at render time
const icon = city => ICON[city] ? `<svg class="glyph" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON[city]}</svg>` : '<span class="glyph"></span>';
const fmtTime = (tz, extra) => { try { return new Intl.DateTimeFormat('en-GB', Object.assign({ timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }, extra || {})).format(new Date()); } catch (e) { return ''; } };
const utcOffset = tz => {
  try {
    const part = new Intl.DateTimeFormat('en-GB', { timeZone: tz, timeZoneName: 'shortOffset' }).formatToParts(new Date()).find(x => x.type === 'timeZoneName').value;
    const m = part.match(/GMT([+-]\d{1,2})?(?::(\d\d))?/); if (!m) return null;
    const h = m[1] ? parseInt(m[1], 10) : 0, mm = m[2] ? parseInt(m[2], 10) : 0;
    return { minutes: h * 60 + Math.sign(h || 1) * mm, label: 'UTC' + (h > 0 ? '+' + h : h < 0 ? '−' + Math.abs(h) : '+0') + (mm ? ':' + pad(mm) : '') };
  } catch (e) { return null; }
};

/* ---------- topics become lines ---------- */
const LINEVARS = ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8'];
const codeFrom = name => { const w = name.replace(/[^\p{L}\s]/gu, '').split(/\s+/).filter(Boolean); return (w.length > 1 ? w[0][0] + w[1][0] : (w[0] || 'XX').slice(0, 2)).toUpperCase(); };
const topicEls = items('topics');
const rawTopics = topicEls.length ? topicEls.map(li => ({ id: li.dataset.id, code: li.dataset.code, blurb: li.dataset.blurb || '', name: li.textContent.trim() })) : (SITE.topics || []);
const usedCodes = new Set();
const uniqueCode = (want, name) => {
  let c = want;
  if (usedCodes.has(c)) {
    const letters = String(name || '').replace(/[^\p{L}]/gu, '').toUpperCase();
    c = [...letters.slice(1)].map(l => letters[0] + l).find(x => !usedCodes.has(x)) || (want[0] + (usedCodes.size + 1));
    warn(`Line code ${want} is used twice; "${name}" gets ${c}. Set data-code to choose.`);
  }
  usedCodes.add(c); return c;
};
const topics = rawTopics.filter(t => t && t.id).slice(0, 8).map((t, i) => Object.assign({}, t, { name: t.name || t.id, code: uniqueCode((t.code || codeFrom(t.name || t.id)).toUpperCase().slice(0, 3), t.name || t.id), v: LINEVARS[i], i }));
const TOPIC = Object.fromEntries(topics.map(t => [t.id, t]));
if (rawTopics.length > 8) warn('Only the first 8 topics get a line; the rest are ignored.');

/* ---------- papers ---------- */
function parseAuthors(el) {
  if (!el) return [];
  const out = [];
  el.childNodes.forEach(n => {
    if (n.nodeType === 3) n.textContent.split(/,|&|\band\b/).forEach(part => { const t = part.trim(); if (t) out.push({ name: t }); });
    else if (n.nodeType === 1) {
      const t = n.textContent.trim(); if (!t) return;
      const fam = n.dataset ? { family: n.dataset.family || '', given: n.dataset.given || '' } : {};   // e.g. data-family="Ong" for "Ong Mei Lin"
      if (n.tagName === 'B' || n.tagName === 'STRONG') out.push(Object.assign({ name: t, me: true }, fam));
      else if (n.tagName === 'A') out.push(Object.assign({ name: t, url: n.getAttribute('href') }, fam));
      else out.push(Object.assign({ name: t }, fam));
    }
  });
  const list = out.filter(a => !/^(and|&)$/i.test(a.name));
  const norm = s => s.toLowerCase().replace(/\s+/g, ' ').trim();
  if (!list.some(a => a.me)) list.forEach(a => { if (norm(a.name) === norm(SITE.name)) a.me = true; });
  return list;
}
const ALIAS = { 'conditionally-accepted': 'ca', conditional: 'ca', inpress: 'forthcoming', 'in-press': 'forthcoming', submitted: 'review', 'under-review': 'review', underreview: 'review', preprint: 'working', wp: 'working', 'r&r': 'rr', randr: 'rr', 'revise-and-resubmit': 'rr', 'reject-and-resubmit': 'rejresub', 'in-progress': 'wip', 'work-in-progress': 'wip', inprogress: 'wip', publication: 'published' };
const KNOWN = ['jmp', 'rr', 'rejresub', 'review', 'working', 'ca', 'accepted', 'forthcoming', 'published', 'wip', 'policy'];
const PUBS = ['ca', 'accepted', 'forthcoming', 'published'];
const seenIds = new Set();
const allPapers = $$('article.paper', SRC).map((el, order) => {
  const d = el.dataset, h = $('h3', el), a = $('h3 a', el), ab = $('.abstract', el), pr = $('.presented', el);
  let id = el.id || ('paper-' + order);
  if (seenIds.has(id)) { warn('Duplicate paper id "' + id + '"; renamed.'); id = id + '-' + order; }
  seenIds.add(id);
  const tps = [...new Set((d.topics || '').split(/\s+/).filter(Boolean))];
  tps.filter(t => !TOPIC[t]).forEach(t => warn(`Paper "${id}" names an unknown topic "${t}".`));
  let status = String(d.status || 'working').toLowerCase().trim(); status = ALIAS[status] || status;
  if (!KNOWN.includes(status)) { warn(`Paper "${id}" has an unknown status "${d.status}"; shown as a working paper.`); status = 'working'; }
  const title = h ? h.textContent.trim() : '';
  if (status !== 'wip' && status !== 'policy' && !d.date) warn(`Paper "${id}" has no data-date; it is placed last.`);
  if (status !== 'wip' && d.date && d.date > TODAY.slice(0, 7)) warn(`Paper "${id}" is dated after today.`);
  return {
    id, order, status, tmpl: isTmpl(el), date: d.date || '', version: d.version || '', journal: d.journal || '', stage: d.stage || '',
    outlet: d.outlet || '', type: d.type || '', related: d.related || '', hidden: 'hidden' in d, fig: d.fig || '', figure: d.figure || '', figureAlt: d.figureAlt || '',
    volume: d.volume || '', pages: d.pages || '', doi: d.doi || '',
    topics: tps.filter(t => TOPIC[t]),
    title, short: d.short || (title.split(/[:?]/)[0].trim() || title), url: a ? a.getAttribute('href') : '',
    authors: parseAuthors($('.authors', el)),
    links: $$('.links a', el).map(x => ({ kind: x.dataset.kind || '', label: x.textContent.trim(), href: x.getAttribute('href') })),
    abstract: ab ? ab.innerHTML.trim() : '', presented: pr ? pr.innerHTML.trim() : ''
  };
});
const papers = allPapers.filter(p => !p.hidden);
const P = Object.fromEntries(allPapers.map(p => [p.id, p]));
const year = p => (p.date || '').slice(0, 4);

/* stations: dated papers by date, then work in progress. Hidden papers keep their numbers. */
const isOnMap = p => p.status !== 'policy' && p.topics.length;
const orderStations = list => list.filter(p => p.status !== 'wip').sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999') || a.order - b.order).concat(list.filter(p => p.status === 'wip'));
const allStations = orderStations(allPapers.filter(isOnMap));
const stations = allStations.filter(p => !p.hidden);
const CODES = {};
topics.forEach(t => {
  let n = 0;
  allStations.forEach(p => { if (p.topics.includes(t.id)) { n++; (CODES[p.id] = CODES[p.id] || []).push({ t, code: t.code + n }); } });
});
Object.keys(CODES).forEach(id => CODES[id].sort((x, y) => P[id].topics.indexOf(x.t.id) - P[id].topics.indexOf(y.t.id)));
try { console.table(stations.map(p => ({ paper: p.id, codes: (CODES[p.id] || []).map(c => c.code).join(' '), date: p.date || 'in progress' }))); } catch (e) {}
const mapTopics = p => p.topics.slice(0, 2);   // the map draws a paper on at most two lines

const jmp = papers.find(p => p.status === 'jmp') || null;
const spotlight = (SITE.mode !== 'cs' && SITE.onMarket) ? jmp : null;

/* track order: lines that share papers sit next to each other; ties keep the job market
   paper's line and the owner's first topic near the top, then the owner's order */
function perms(a) { if (a.length <= 1) return [a.slice()]; const out = []; a.forEach((v, i) => perms(a.slice(0, i).concat(a.slice(i + 1))).forEach(p => out.push([v].concat(p)))); return out; }
const tracks = (() => {
  const live = topics.filter(t => stations.some(p => mapTopics(p).includes(t.id)));
  if (live.length < 2) return live;
  const ix = Object.fromEntries(live.map((t, i) => [t.id, i]));
  const multi = stations.map(mapTopics).filter(ts => ts.length > 1).map(ts => ts.filter(t => t in ix).map(t => ix[t]));
  const prefer = [jmp && jmp.topics[0], topics[0] && topics[0].id].filter(t => t && t in ix).map(t => ix[t]);
  let best = null, bc = Infinity;
  (live.length <= 6 ? perms(live.map((_, i) => i)) : [live.map((_, i) => i)]).forEach(perm => {
    const pos = []; perm.forEach((t, i) => { pos[t] = i; });
    let c = 0; multi.forEach(ts => { const ps = ts.map(t => pos[t]); c += Math.max(...ps) - Math.min(...ps) - (ts.length - 1); });
    const k = c * 1e6 + prefer.reduce((s, t) => s + pos[t], 0) * 1e3 + perm.reduce((s, t, i) => s + Math.abs(t - i), 0);
    if (k < bc) { bc = k; best = perm; }
  });
  return best.map(i => live[i]);
})();
const trackIx = Object.fromEntries(tracks.map((t, i) => [t.id, i]));

const capStyle = t => `--c:var(--${t.v});--on:var(--${t.v}-on);--tx:var(--${t.v}-tx)`;
const caplets = p => {
  const cs = CODES[p.id] || []; if (!cs.length) return '';
  return `<span class="caps${p.status === 'wip' ? ' wip' : ''}" role="img" aria-label="${esc(cs.map(c => c.code + ', ' + c.t.name + ' line').join('; '))}">${cs.map(c => `<span class="cap" style="${capStyle(c.t)}">${c.code}</span>`).join('')}</span>`;
};

/* ---------- generated figure thumbnails (or the owner's own figure) ---------- */
const hash = s => { let h = 2166136261 >>> 0; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; };
const rng = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const FIGS = ['curve', 'bars', 'scatter', 'grid', 'network'];
function figure(p, big) {
  if (p.figure) return `<img class="fig-img" src="${esc(p.figure)}" alt="${esc(p.figureAlt || '')}" loading="lazy">`;
  const r = rng(hash(p.id || p.title)), cs = CODES[p.id] || [];
  const A1 = cs[0] ? `var(--${cs[0].t.v})` : 'var(--muted)', B1 = cs[1] ? `var(--${cs[1].t.v})` : 'var(--muted)';
  const wip = p.status === 'wip', type = FIGS.includes(p.fig) ? p.fig : FIGS[Math.floor(r() * FIGS.length)];
  const dash = wip ? ' stroke-dasharray="2.5 3"' : '';
  const dot = (x, y, rr, c, o = 1) => wip ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rr}" fill="none" stroke="${c}" stroke-width="1.1" opacity="${o}"/>` : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rr}" fill="${c}" opacity="${o}"/>`;
  let s = `<rect width="72" height="72" fill="${wip ? 'var(--surface)' : `color-mix(in srgb, ${A1} 8%, var(--surface))`}"/><path d="M12 10V60H62" fill="none" stroke="var(--rule-strong)" stroke-width="1"/>`;
  if (type === 'curve') {
    const k = 6 + r() * 6; let d = '';
    for (let i = 0; i <= 20; i++) { const x = 13 + i * 2.4, y = 56 - 40 * (1 - Math.exp(-i / k)); d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }
    s += `<path d="${d}" fill="none" stroke="${A1}" stroke-width="2" stroke-linecap="round"${dash}/>`;
    for (let i = 0; i < 9; i++) { const t = r() * 20, x = 13 + t * 2.4, y = 56 - 40 * (1 - Math.exp(-t / k)) + (r() * 10 - 5); s += dot(x, Math.max(12, Math.min(58, y)), 1.6, cs[1] ? B1 : A1, .8); }
  } else if (type === 'bars') {
    for (let i = 0; i < 5; i++) { const h1 = 10 + r() * 34, h2 = Math.min(46, h1 * (.6 + r() * .8)), x = 16 + i * 9.4;
      s += wip ? `<rect x="${x}" y="${60 - h1}" width="3.6" height="${h1}" fill="none" stroke="${A1}" stroke-width="1.1"${dash}/>` : `<rect x="${x}" y="${60 - h1}" width="3.6" height="${h1}" fill="${A1}"/>`;
      s += `<rect x="${x + 4.4}" y="${60 - h2}" width="3.6" height="${h2}" fill="${cs[1] ? B1 : 'var(--rule-strong)'}" opacity="${wip ? .35 : .9}"/>`; }
  } else if (type === 'scatter') {
    s += `<path d="M14 54L60 18" stroke="var(--muted)" stroke-width="1" stroke-dasharray="2 2.5" opacity=".7"/>`;
    for (let i = 0; i < 16; i++) { const t = r(), x = 15 + t * 44, y = 53 - t * 34 + (r() * 14 - 7); s += dot(x, Math.max(12, Math.min(58, y)), 2, i % 3 === 0 && cs[1] ? B1 : A1, .85); }
  } else if (type === 'grid') {
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) { const v = r(); s += wip ? `<rect x="${15 + i * 7.6}" y="${13 + j * 7.6}" width="6" height="6" rx="1" fill="none" stroke="${A1}" stroke-width=".9" opacity="${(.25 + v * .6).toFixed(2)}"/>` : `<rect x="${15 + i * 7.6}" y="${13 + j * 7.6}" width="6" height="6" rx="1" fill="${(i + j) % 5 === 0 && cs[1] ? B1 : A1}" opacity="${(.15 + v * .85).toFixed(2)}"/>`; }
  } else {
    const n = []; for (let i = 0; i < 8; i++) n.push([18 + r() * 40, 15 + r() * 40]);
    n.forEach((a, i) => n.map((b, j) => [j, Math.hypot(a[0] - b[0], a[1] - b[1])]).filter(v => v[0] !== i).sort((x, y) => x[1] - y[1]).slice(0, 2).forEach(v => { s += `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${n[v[0]][0].toFixed(1)} ${n[v[0]][1].toFixed(1)}" stroke="var(--muted)" stroke-width="1" opacity=".55"${dash}/>`; }));
    n.forEach((a, i) => { s += dot(a[0], a[1], i % 3 === 0 ? 3.4 : 2.3, i % 4 === 0 && cs[1] ? B1 : A1); });
  }
  return `<svg class="fig${big ? ' big' : ''}" viewBox="0 0 72 72" aria-hidden="true" focusable="false">${s}</svg>`;
}

/* ---------- labels ---------- */
const J = p => p.journal ? `, <i>${esc(p.journal)}</i>` : '';
const STATUS = {
  jmp: () => 'Job market paper',
  rr: p => `Revise &amp; resubmit${J(p)}`,
  rejresub: p => `Reject &amp; resubmit${J(p)}`,
  review: () => 'Under review',
  working: () => 'Working paper',
  ca: p => `Conditionally accepted${J(p)}`,
  accepted: p => `Accepted${J(p)}`,
  forthcoming: p => `Forthcoming${J(p)}`,
  published: p => `${p.journal ? `<i>${esc(p.journal)}</i>, ` : ''}${year(p)}${p.volume ? ', ' + esc(p.volume) : ''}${p.pages ? ': ' + esc(p.pages) : ''}`,
  wip: p => esc(p.stage || 'Work in progress'),
  policy: p => [p.type, p.outlet].filter(Boolean).map(esc).join(', ') + (p.date ? SEP + fmtYM(p.date) : '')
};
const datedStatus = p => p.date && !PUBS.includes(p.status) ? SEP + fmtYM(p.date) : '';   // published lines already carry the year
const statusLine = p => (STATUS[p.status] || STATUS.working)(p);
const plain = html => String(html).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');
function authorsLine(p) {
  if (SITE.mode === 'cs') return p.authors.map(a => a.me ? `<b>${esc(a.name)}</b>` : (a.url ? A(a.url, esc(a.name)) : esc(a.name))).join(', ');
  const co = p.authors.filter(a => !a.me);
  if (!co.length) return '';
  return 'with ' + LIST.format(co.map(a => a.url ? A(a.url, esc(a.name)) : esc(a.name)));
}
function bibtex(p) {
  if (['wip', 'policy'].includes(p.status) || !p.title) return '';
  const auths = p.authors.length ? p.authors : [{ name: SITE.name, me: true }];
  const ascii = s => String(s).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z]/g, '');
  const last = n => n.trim().split(/\s+/).pop();
  const first = ascii(auths[0].family || last(auths[0].name)) || 'author';
  const word = ascii((p.title.split(/\s+/).find(w => ascii(w).length > 3 && !/^(the|and|with|from|when|what|how|into|that|this)$/i.test(ascii(w))) || 'paper'));
  const key = first + (year(p) || 'nd') + word;
  // with data-family, write "Family, Given"; otherwise leave the name as written (BibTeX parses "First von Last" itself)
  const names = auths.map(a => a.family ? `${a.family}, ${a.given || a.name.replace(a.family, '').trim()}` : a.name.trim()).join(' and ');
  const pub = PUBS.includes(p.status);
  const tex = s => String(s).replace(/[\\{}&%$#_~^]/g, m => ({ '\\': '\\textbackslash{}', '~': '\\textasciitilde{}', '^': '\\textasciicircum{}' }[m] || '\\' + m));
  const brace = s => '{' + tex(s) + '}';
  const f = [['title', '{' + brace(p.title) + '}'], ['author', brace(names)]];
  if (pub && p.journal) f.push(['journal', brace(p.journal)]);
  f.push(['year', brace(year(p) || 'n.d.')]);
  if (p.volume) f.push(['volume', brace(p.volume)]);
  if (p.pages) f.push(['pages', brace(p.pages.replace(/[–-]/, '--'))]);
  const doiLink = p.links.find(l => l.kind === 'doi' && l.href && l.href !== '#');
  const doi = p.doi || (doiLink ? doiLink.href.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '') : '');
  if (doi) f.push(['doi', '{' + doi + '}']);
  const notes = { rr: 'Revise and resubmit, ' + p.journal, rejresub: 'Reject and resubmit, ' + p.journal, jmp: 'Job market paper', review: 'Under review', working: 'Working paper', ca: 'Conditionally accepted', accepted: 'Accepted', forthcoming: 'Forthcoming' };
  if (notes[p.status]) f.push(['note', brace(notes[p.status].replace(/, $/, '') + (p.version && !pub ? '. This version: ' + p.version : ''))]);
  const pdf = p.links.find(l => l.kind === 'pdf') || (p.url ? { href: p.url } : null);
  if (pdf && pdf.href && pdf.href !== '#') f.push(['url', '{' + pdf.href + '}']);
  const w = Math.max(...f.map(x => x[0].length));
  return `@${pub ? 'article' : 'unpublished'}{${key},\n${f.map(([k, v]) => `  ${k.padEnd(w)} = ${v}`).join(',\n')}\n}`;
}
const LINKORDER = ['pdf', 'appendix', 'slides', 'doi', 'ssrn', 'arxiv', 'nber', 'repec', 'code', 'data', 'replication', 'video', 'poster'];
const lrank = k => { const i = LINKORDER.indexOf(k); return i < 0 ? 99 : i; };
const linkPills = p => p.links.slice().sort((a, b) => lrank(a.kind) - lrank(b.kind)).map(l => A(l.href, esc(l.label), l.kind === 'pdf' ? 'pill pdf' : 'pill')).join('');
const mainCap = p => { const c = (CODES[p.id] || [])[0]; return c ? `<span class="caps${p.status === 'wip' ? ' wip' : ''}" role="img" aria-label="${esc(c.code + ', ' + c.t.name + ' line')}"><span class="cap" style="${capStyle(c.t)}">${c.code}</span></span>` : ''; };
const mainLink = p => { const pdf = p.links.find(l => l.kind === 'pdf'); return pdf ? pdf.href : p.url; };

/* ---------- paper rows ---------- */
function paperRow(p) {
  const bib = bibtex(p), al = authorsLine(p), href = mainLink(p), title = href ? A(href, esc(p.title), 't') : esc(p.title);
  const panels = [];
  if (p.abstract) panels.push(`<button class="pill" type="button" data-toggle="abs" aria-expanded="false" aria-controls="abs-${p.id}">Abstract</button>`);
  if (bib) panels.push(`<button class="pill" type="button" data-toggle="bib" aria-expanded="false" aria-controls="bibp-${p.id}">BibTeX</button>`);
  const onMap = !!CODES[p.id] && !p.hidden;
  return `<div class="pwrap open" data-id="${p.id}" data-topics="${p.topics.join(' ')}"><div class="inner">
  <article class="paper-row${p.status === 'wip' ? ' is-wip' : ''}" id="p-${p.id}" data-card>
    ${onMap ? `<button class="figbtn" type="button" data-station="${p.id}" aria-label="Show ${esc(p.short)} on the line map and filter the list to the ${esc(TOPIC[p.topics[0]].name)} line">${figure(p)}</button>` : `<span class="figbtn" aria-hidden="true">${figure(p)}</span>`}
    <div class="pbody">
      <p class="pmeta">${caplets(p)}<span class="status${['rr', 'rejresub', 'jmp', 'ca', 'accepted', 'forthcoming'].includes(p.status) ? ' strong' : ''}">${statusLine(p)}</span>${p.version ? `<span class="ver">This version: ${esc(p.version)}</span>` : ''}</p>
      <h4>${title}</h4>
      ${al ? `<p class="auth">${al}</p>` : ''}
      ${panels.length || p.links.length ? `<div class="acts">${linkPills(p)}${panels.length ? `<span class="acts-gap" aria-hidden="true"></span>${panels.join('')}` : ''}</div>` : ''}
      ${p.abstract ? `<div class="collapse" data-panel="abs" id="abs-${p.id}"><div class="inner"><div class="abs">${p.abstract}</div></div></div>` : ''}
      ${bib ? `<div class="collapse" data-panel="bib" id="bibp-${p.id}"><div class="inner"><div class="bib"><pre id="bib-${p.id}">${esc(bib)}</pre><button class="pill copy" type="button" data-copy="bib-${p.id}">Copy</button></div></div></div>` : ''}
    </div>
  </article></div></div>`;
}

/* ---------- groups: Status | Line | Year ---------- */
function groupsBy(mode) {
  const list = papers.filter(p => p.status !== 'policy' && !(spotlight && p.id === spotlight.id));
  const byDate = (a, b) => (b.date || '').localeCompare(a.date || '') || a.order - b.order;
  if (mode === 'line') {
    const g = tracks.concat(topics.filter(t => !tracks.includes(t))).map(t => ({ key: t.id, title: `<span class="cap" style="--c:var(--${t.v});--on:var(--${t.v}-on)">${t.code}</span> ${esc(t.name)}`, items: list.filter(p => p.topics[0] === t.id).sort(byDate) }));
    const none = list.filter(p => !p.topics.length); if (none.length) g.push({ key: 'none', title: 'Other', items: none });
    return g.filter(x => x.items.length);
  }
  if (mode === 'year') {
    const ys = [...new Set(list.filter(p => p.date).map(year))].sort().reverse();
    const g = ys.map(y => ({ key: y, title: y, items: list.filter(p => p.date && year(p) === y).sort(byDate) }));
    const w = list.filter(p => !p.date); if (w.length) g.push({ key: 'next', title: 'In progress', items: w });
    return g;
  }
  const rank = { rr: 0, rejresub: 0, review: 1, jmp: 2, working: 3 };
  const working = list.filter(p => !PUBS.includes(p.status) && p.status !== 'wip').sort((a, b) => (rank[a.status] ?? 3) - (rank[b.status] ?? 3) || byDate(a, b));
  const pubs = list.filter(p => PUBS.includes(p.status)).sort((a, b) => PUBS.indexOf(a.status) - PUBS.indexOf(b.status) || byDate(a, b));
  const wip = list.filter(p => p.status === 'wip');
  const cs = SITE.mode === 'cs';
  const g = { working: { key: 'working', title: cs ? 'Preprints' : 'Working papers', items: working }, pubs: { key: 'pubs', title: 'Publications', items: pubs }, wip: { key: 'wip', title: 'Work in progress', items: wip } };
  const order = Array.isArray(SITE.groupOrder) ? SITE.groupOrder : (cs ? ['pubs', 'working', 'wip'] : ['working', 'pubs', 'wip']);
  return order.filter(k => g[k]).map(k => g[k]).concat(Object.keys(g).filter(k => !order.includes(k)).map(k => g[k])).filter(x => x.items.length);
}

/* ==================================================================
   RENDER
   ================================================================== */
function renderHero() {
  const bio = blocks('bio');
  const bioHtml = bio ? (SITE.preview ? bio.innerHTML.replace(/<a href="#"/g, '<a href="#" data-sample') : bio.innerHTML) : '';
  const pick = ['Google Scholar', 'GitHub', 'ORCID', SITE.mode === 'cs' ? 'DBLP' : 'SSRN'];
  const quick = pick.map(l => PROFILES.find(x => x.label === l)).filter(Boolean);
  const path = items('path');
  const currentIx = path.map(li => isOpenStop(li.dataset)).lastIndexOf(true);
  // every earlier city, once each, in the order first visited (the current stop itself is left out)
  const earlier = path.filter((li, i) => i !== currentIx);
  const before = [...new Set((NEWEST_FIRST ? earlier.reverse() : earlier).map(li => cityOf(li.dataset.city).name))].filter(Boolean);
  const words = SITE.name.split(/\s+/).filter(Boolean);
  const initials = words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0] || '').slice(0, 2);
  const facts = [SITE.fields && SITE.fields.length ? `Fields: ${esc([].concat(SITE.fields).join(', '))}` : '', SITE.expected ? `PhD expected ${esc(SITE.expected)}` : ''].concat([].concat(SITE.facts || []).map(esc)).filter(Boolean);
  const cvLabel = `CV, PDF${SITE.cv.updated ? ', updated ' + SITE.cv.updated : ''}`;
  $('#about').innerHTML = `
  <div class="hero-grid">
    ${SITE.photo ? `<figure class="portrait rise"><img src="${esc(SITE.photo)}" alt="${esc(SITE.name)}" width="300" height="400"></figure>` : `<div class="portrait rise" aria-hidden="true"><span class="ph">${esc(initials)}</span>${SITE.preview ? '<span class="ph-note">your photo</span>' : ''}</div>`}
    <div class="hero-text">
      ${SITE.onMarket ? `<p class="blind rise r1"><span class="ring" aria-hidden="true"></span>On the ${esc(SITE.marketYear)} job market</p>` : ''}
      <h1 class="rise r1">${esc(SITE.name)}${SITE.nativeName ? ` <span class="native" lang="${esc(SITE.nativeLang || 'zh-Hans')}">${esc(SITE.nativeName)}</span>` : ''}</h1>
      <p class="role rise r2">${esc(SITE.role)}${SITE.institution ? ', ' + esc(SITE.institution) : ''}</p>
      ${facts.length ? `<p class="facts rise r2">${facts.join(SEPSPAN)}</p>` : ''}
      ${before.length ? `<p class="places rise r2">Before that: ${before.map(n => `<span class="city"><a href="#path" data-go="path">${esc(n)}</a>${LOCAL[n] ? ` <span lang="${LOCAL[n][0]}" class="hz">${LOCAL[n][1]}</span>` : ''}</span>`).join(SEPSPAN)}</p>` : ''}
      <div class="bio rise r2">${bioHtml}</div>
      <p class="links rise r3">${HAS_CV ? A(SITE.cv.url, 'CV <span class="sub">PDF</span>', 'btn', `aria-label="${esc(cvLabel)}"`) : ''}<a class="tl" href="#contact" data-go="contact">Email</a>${quick.map(q => A(q.url, esc(q.label), 'tl')).join('')}</p>
      ${spotlight ? `<p class="jmpline rise r4"><span class="jl">Job market paper</span> ${A(mainLink(spotlight), esc(spotlight.title), 'jt')} <span class="muted">(PDF)</span> <a class="tl small-tl" href="#p-${spotlight.id}" data-go="p-${spotlight.id}">Abstract <span aria-hidden="true">↓</span></a></p>` : ''}
    </div>
  </div>`;
}

/* ---------- the line map ---------- */
let mapState = { preview: null, filter: null }, firstDraw = true, previewTimer = 0, lastMapW = 0;
function renderLines() {
  const host = $('#lines');
  if (!stations.length || !tracks.length) { host.remove(); return; }
  const counts = Object.fromEntries(tracks.map(t => [t.id, stations.filter(p => p.topics.includes(t.id)).length]));
  const wipCounts = Object.fromEntries(tracks.map(t => [t.id, stations.filter(p => p.topics.includes(t.id) && p.status === 'wip').length]));
  host.innerHTML = `
  <div class="lines-head"><div class="lh"><h2 class="eyebrow" id="lines-title">Research lines</h2>${tmplIf(stations.some(p => p.tmpl))}</div><p class="hint" id="lines-hint">Choose a line to filter the papers. Choose a station to jump to it.</p></div>
  <div class="lines-grid">
    <div class="lbtns" role="group" aria-label="Filter papers by research line">${tracks.map(t => `<button class="lbtn" type="button" data-t="${t.id}" aria-pressed="false" aria-label="${esc(`${t.code}, ${t.name}, ${counts[t.id]} paper${counts[t.id] === 1 ? '' : 's'}${wipCounts[t.id] ? `, ${wipCounts[t.id]} in progress` : ''}`)}"><span class="cap" style="--c:var(--${t.v});--on:var(--${t.v}-on)" aria-hidden="true">${t.code}</span><span class="nm" aria-hidden="true">${esc(t.name)}</span><span class="ct" aria-hidden="true">${counts[t.id]}</span></button>`).join('')}</div>
    <div class="map" id="map"><div class="tip" id="tip" aria-hidden="true"></div></div>
  </div>
  <div class="lines-foot"><p id="map-status" aria-live="polite"></p>
    <p class="legend"><span><i class="lg-st" aria-hidden="true"></i>paper</span><span><i class="lg-ic" aria-hidden="true"></i>paper on two lines</span><span class="lg-linked-wrap" hidden><i class="lg-linked" aria-hidden="true"></i>linked stations</span><span><i class="lg-wip" aria-hidden="true"></i>in progress</span><span><i class="lg-today" aria-hidden="true"></i>today</span><span class="lg-note">Stations in order, not to scale</span></p></div>`;
  mapStatusDefault();
  drawMap();
}
const mapCount = () => {
  const wip = stations.filter(p => p.status === 'wip').length, done = stations.length - wip;
  return `${done}${NB}paper${done === 1 ? '' : 's'}${wip ? ` and ${wip}${NB}in progress` : ''} on ${tracks.length}${NB}line${tracks.length === 1 ? '' : 's'}`;
};
function mapStatusDefault() {
  const inter = stations.filter(p => mapTopics(p).filter(t => t in trackIx).length > 1).length;
  const st = $('#map-status'); if (st) st.textContent = `${mapCount()}${inter ? `${SEP}${inter}${NB}interchange${inter === 1 ? '' : 's'}` : ''}`;
}

function drawMap() {
  const host = $('#map'); if (!host) return;
  const W = Math.round(host.clientWidth); if (!W) return;
  // a redraw replaces the SVG: remember the focused (or tabbable) station so focus can return to it
  const had = document.activeElement && document.activeElement.closest ? document.activeElement.closest('#map .st') : null;
  const keepId = (had || host.querySelector('.st[tabindex="0"]') || { dataset: {} }).dataset.st;
  lastMapW = W;
  const k = tracks.length, n = stations.length;
  const vertical = W < 560 || 40 + (n - 1) * 24 > W;
  const dated = stations.filter(p => p.status !== 'wip').length;
  const lines = $('#lines');
  let svg = '', band = '', H, pt, linked = false, TXv = 0;
  const tsOf = p => mapTopics(p).filter(t => t in trackIx).sort((x, y) => trackIx[x] - trackIx[y]);
  let todayA, todayB; // band edges along the time axis
  if (!vertical) {
    const GAP = 40, TOP = 46, BOT = 18, PL = 10, PR = 18;
    const usable = W - PL - PR - 24;
    const step = n > 1 ? Math.max(24, Math.min(n <= 6 ? 128 : 96, usable / (n - 1 + (dated < n ? .6 : .35)))) : 0;
    const X = c => PL + 12 + c * step + (c >= dated ? step * .45 : 0);
    const ty = t => TOP + trackIx[t] * GAP;
    pt = (c, t) => [X(c), ty(t)];
    H = TOP + (k - 1) * GAP + BOT;
    lines.style.setProperty('--top', TOP + 'px'); lines.style.setProperty('--gap', GAP + 'px');
    let prev = null; const ys = new Set(stations.filter(p => p.status !== 'wip').map(year));
    if (ys.size > 1) stations.forEach((p, c) => {
      const y = p.status === 'wip' ? null : year(p);
      if (y && y !== prev) { svg += `<text class="yr" x="${X(c) - 6}" y="16" aria-hidden="true">${y}</text><path class="yr-tick" d="M${X(c)} 22V28" aria-hidden="true"/>`; prev = y; }
    });
    todayA = dated ? X(dated - 1) + step * .3 : PL; todayB = dated < n ? X(dated) - step * .3 : Math.min(W - 4, todayA + Math.max(14, step * .5));
    band = `<g aria-hidden="true"><rect class="today" x="${todayA}" y="24" width="${Math.max(10, todayB - todayA)}" height="${H - 30}" rx="6"/><text class="today-l" x="${(todayA + todayB) / 2}" y="16" text-anchor="middle">Today</text></g>`;
  } else {
    const GAP = 30, TOP = 26, STEP = 50, PL = 12;
    const tx = t => PL + 8 + trackIx[t] * GAP;
    const Y = c => TOP + c * STEP + (c >= dated ? 22 : 0);
    pt = (c, t) => [tx(t), Y(c)];
    H = Y(n - 1) + 26;
    lines.style.setProperty('--top', '0px'); lines.style.setProperty('--gap', '40px');
    const TX = PL + 8 + (k - 1) * GAP + 26; TXv = TX;
    let prev = null;
    stations.forEach((p, c) => {
      const y = p.status === 'wip' ? null : year(p);
      if (y && y !== prev) { svg += `<text class="yr" x="${TX}" y="${Y(c) - 17}" aria-hidden="true">${y}</text>`; prev = y; }
    });
    todayA = dated ? Y(dated - 1) + 14 : 4; todayB = dated < n ? Y(dated) - 14 : Math.min(H - 2, todayA + 20);
    band = `<g aria-hidden="true"><rect class="today" x="0" y="${todayA}" width="${W}" height="${Math.max(8, todayB - todayA)}" rx="6"/><text class="today-l" x="${W - 4}" y="${(todayA + todayB) / 2 + 4}" text-anchor="end">Today</text></g>`;
    stations.forEach((p, c) => { svg += `<text class="sname${p.status === 'wip' ? ' wip' : ''}" data-st="${p.id}" x="${TX}" y="${Y(c) + 4.5}" aria-hidden="true">${esc(p.short)}</text>`; });
  }
  const along = q => vertical ? q[1] : q[0];
  const at = (q, v) => vertical ? [q[0], v] : [v, q[1]];
  const seg = (p1, p2) => `M${p1[0]} ${p1[1]}L${p2[0]} ${p2[1]}`;
  // lines: solid up to today, hollow only after today
  tracks.forEach((t, ti) => {
    const st = stations.map((p, c) => tsOf(p).includes(t.id) ? c : -1).filter(c => c >= 0);
    if (!st.length) return;
    const done = st.filter(c => stations[c].status !== 'wip'), wips = st.filter(c => stations[c].status === 'wip');
    const first = pt(st[0], t.id), lead = vertical ? [first[0], 4] : [2, first[1]];
    let body = '';
    if (done.length) {
      const a = pt(done[0], t.id), b = wips.length ? at(a, todayA) : pt(done[done.length - 1], t.id);
      if (along(b) > along(a)) body += `<path class="casing" d="${seg(a, b)}"/><path class="stroke draw" pathLength="1" d="${seg(a, b)}"/>`;
    }
    if (wips.length) {
      const a = done.length ? at(first, todayA) : at(first, todayA), e = pt(wips[wips.length - 1], t.id);
      if (!done.length) body += `<path class="lead" d="${seg(lead, a)}"/>`;
      body += `<path class="casing" d="${seg(a, e)}"/><path class="stroke hollow" d="${seg(a, e)}"/><path class="hollow-in" d="${seg(a, e)}"/>`;
    }
    const end = pt(st[st.length - 1], t.id);
    svg += `<g class="ln" data-t="${t.id}" style="--c:var(--${t.v});--k:${ti}" aria-hidden="true">${done.length ? `<path class="lead" d="${seg(lead, first)}"/>` : ''}${body}<path class="hit" d="${seg(lead, end)}"/></g>`;
  });
  // the Today band sits over the lines and blends, so the lines show through it without gaps
  svg += band;
  // stations
  stations.forEach((p, c) => {
    const ts = tsOf(p); if (!ts.length) return;
    const pts = ts.map(t => pt(c, t)), wip = p.status === 'wip';
    const label = `${(CODES[p.id] || []).map(x => x.code).join(' and ')}: ${p.title}. ${plain(statusLine(p))}${datedStatus(p).replace(SEP, ', ')}`;
    let mark, halo = '';
    const contiguous = ts.length < 2 || (trackIx[ts[ts.length - 1]] - trackIx[ts[0]] === ts.length - 1);
    if (pts.length > 1) {   // the halo (hover and focus ring) wraps the whole interchange
      const x0 = Math.min(...pts.map(q => q[0])), x1 = Math.max(...pts.map(q => q[0])), y0 = Math.min(...pts.map(q => q[1])), y1 = Math.max(...pts.map(q => q[1]));
      halo = `<rect class="halo" x="${x0 - 12}" y="${y0 - 12}" width="${x1 - x0 + 24}" height="${y1 - y0 + 24}" rx="14"/>`;
    }
    if (pts.length > 1 && contiguous) {
      const x0 = Math.min(...pts.map(q => q[0])), x1 = Math.max(...pts.map(q => q[0])), y0 = Math.min(...pts.map(q => q[1])), y1 = Math.max(...pts.map(q => q[1]));
      mark = `<rect class="ic${wip ? ' wip' : ''}" x="${x0 - 7.5}" y="${y0 - 7.5}" width="${x1 - x0 + 15}" height="${y1 - y0 + 15}" rx="7.5"/>`;
    } else if (pts.length > 1) {
      linked = true;
      mark = `<path class="link" d="${seg(pts[0], pts[pts.length - 1])}"/>` + pts.map(q => `<circle class="ring2${wip ? ' wip' : ''}" cx="${q[0]}" cy="${q[1]}" r="6.5"/>`).join('');
    } else {
      mark = `<circle class="dot${wip ? ' wip' : ''}" cx="${pts[0][0]}" cy="${pts[0][1]}" r="5.5" style="--c:var(--${TOPIC[ts[0]].v})"/>`;
    }
    const top = vertical ? pts[0] : pts.reduce((m, q) => q[1] < m[1] ? q : m, pts[0]);
    const flag = jmp && p.id === jmp.id && !vertical ? `<g class="flag" aria-hidden="true"><path d="M${top[0]} ${top[1] - 9}V22"/><rect x="${top[0] - 30}" y="21" width="30" height="13" rx="2"/><text x="${top[0] - 15}" y="30.5" text-anchor="middle">JMP</text></g>` : '';
    const caps = vertical ? '' : (CODES[p.id] || []).filter(x => ts.includes(x.t.id)).map(x => {
      const q = pt(c, x.t.id), w = x.code.length * 6.6 + 9, below = pts.length > 1 && q[1] > top[1];
      const cx = q[0] - w / 2, cy = below ? q[1] + 12 : q[1] - 27;
      return `<g class="cl" data-t="${x.t.id}" style="--c:var(--${x.t.v});--on:var(--${x.t.v}-on);--i:${c}" aria-hidden="true"><rect x="${cx}" y="${cy}" width="${w}" height="15" rx="3"/><text x="${cx + w / 2}" y="${cy + 11}" text-anchor="middle">${x.code}</text></g>`;
    }).join('');
    svg += `<g class="st" data-st="${p.id}" data-topics="${ts.join(' ')}" style="--i:${c}" tabindex="${c === 0 ? 0 : -1}" role="link" aria-label="${esc(label)}">${flag}${halo || `<circle class="halo" cx="${top[0]}" cy="${top[1]}" r="15"/>`}${mark}${caps}</g>`;
  });
  const intro = firstDraw && !reduceMotion(); firstDraw = false;
  const tip = $('#tip');
  host.innerHTML = `<svg class="${vertical ? 'v' : 'h'}${intro ? ' intro' : ''}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="group" aria-labelledby="lines-title" aria-describedby="lines-hint map-keys">${svg}</svg><p class="sr" id="map-keys">Use the arrow keys to move between stations and Enter to open a paper.</p>`;
  host.appendChild(tip);
  host.classList.toggle('vertical', vertical);
  const keep = keepId && host.querySelector(`.st[data-st="${keepId}"]`);
  if (keep) { $$('.st', host).forEach(g => g.setAttribute('tabindex', g === keep ? '0' : '-1')); if (had) keep.focus({ preventScroll: true }); }
  if (vertical) $$('text.sname', host).forEach(t => {   // keep long names inside the screen
    const max = W - TXv - 6; if (t.getComputedTextLength() <= max) return;
    const full = t.textContent; let s = full;
    while (s.length > 2 && t.getComputedTextLength() > max) { s = s.slice(0, -1); t.textContent = s.trimEnd() + '…'; }
    const ti = document.createElementNS('http://www.w3.org/2000/svg', 'title'); ti.textContent = full; t.appendChild(ti);
  });
  const lw = $('.lg-linked-wrap'); if (lw) lw.hidden = !linked;
  applyMapState();
}

function applyMapState() {
  const host = $('#map'); if (!host) return;
  const act = mapState.preview || mapState.filter;
  $$('.ln', host).forEach(g => { g.classList.toggle('dim', !!act && g.dataset.t !== act); g.classList.toggle('lit', !!act && g.dataset.t === act); });
  $$('.st', host).forEach(g => { const on = !!act && g.dataset.topics.split(' ').includes(act); g.classList.toggle('dim', !!act && !on); g.classList.toggle('capson', on); });
  $$('.cl', host).forEach(g => g.classList.toggle('show', !!act && g.dataset.t === act));
  $$('.sname', host).forEach(s => { const p = P[s.dataset.st]; s.classList.toggle('dim', !!act && !p.topics.includes(act)); });
  $$('.lbtn').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.t === mapState.filter)); b.classList.toggle('lit', b.dataset.t === act); });
}
function setFilter(t) {
  mapState.filter = mapState.filter === t ? null : t;
  applyMapState();
  const f = mapState.filter;
  let shown = 0;
  $$('#groups .pwrap').forEach(w => { const on = !f || w.dataset.topics.split(' ').includes(f); w.classList.toggle('open', on); w.toggleAttribute('inert', !on); if (on) shown++; });
  $$('#groups .group').forEach(g => {
    const open = $$('.pwrap.open', g).length, n = $('.glabel .n', g);
    g.classList.toggle('empty', !open);
    if (n) n.textContent = f ? `${open} of ${$$('.pwrap', g).length}` : $$('.pwrap', g).length;
  });
  const pol = $('#papers .group.policy'); if (pol) pol.hidden = !!f;   // policy writing is not on any line
  const spot = $('#spot'), spotOn = !!spotlight && (!f || spotlight.topics.includes(f));
  if (spot && spotlight) { spot.classList.toggle('faded', !spotOn); spot.toggleAttribute('inert', !spotOn); }
  if (spotOn && spotlight) shown++;
  const fl = $('#filter-line');
  const total = $$('#groups .pwrap').length + (spotlight ? 1 : 0);
  if (f) {
    const t = TOPIC[f];
    $('#map-status').textContent = `Showing ${shown} of ${total}${NB}papers, on the ${t.name} line`;
    fl.innerHTML = `<span class="cap" style="--c:var(--${t.v});--on:var(--${t.v}-on)">${t.code}</span> <b>${esc(t.name)}</b>${t.blurb ? ': ' + esc(t.blurb) : ''} <span class="muted">${shown} of ${total} papers below.</span> <button type="button" class="linkbtn" data-clear>Show all</button>`;
    fl.hidden = false;
  } else { mapStatusDefault(); fl.hidden = true; }
}

/* ---------- papers section ---------- */
let groupMode = 'status';
try { const g = localStorage.getItem('groupBy'); if (['status', 'line', 'year'].includes(g)) groupMode = g; } catch (e) {}
function renderPapers() {
  const sec = $('#papers');
  const policy = papers.filter(p => p.status === 'policy').sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const count = papers.filter(p => p.status !== 'policy').length;
  if (!count && !policy.length) { sec.remove(); return; }
  sec.innerHTML = `
  <div class="sec-h"><h2>Papers</h2>${tmplIf(papers.some(p => p.tmpl))}<span class="sec-count">${count}${tracks.length ? ` on ${tracks.length} line${tracks.length === 1 ? '' : 's'}` : ''}</span>
    <div class="seg" role="group" aria-label="Group papers by"><span class="knob" aria-hidden="true"></span>${['status', 'line', 'year'].filter(m => m !== 'line' || tracks.length > 1).map(m => `<button type="button" data-group="${m}" aria-pressed="${m === groupMode}">${m[0].toUpperCase() + m.slice(1)}</button>`).join('')}</div>
  </div>
  <p class="filter-line" id="filter-line" hidden></p>
  ${spotlight ? renderSpotlight(spotlight) : ''}
  <div id="groups"></div>
  ${policy.length ? `<div class="group policy"><h3 class="glabel">Policy and other writing <span class="n">${policy.length}</span></h3><ul class="rows">${policy.map(p => `<li><span class="when">${fmtYM(p.date)}</span><span>${p.url ? A(p.url, esc(p.title)) : esc(p.title)}<span class="muted">${SEP}${esc(p.outlet || '')}${p.related && P[p.related] ? `${SEP}on <a href="#p-${p.related}" data-go="p-${p.related}">${esc(P[p.related].short)}</a>` : ''}</span></span></li>`).join('')}</ul></div>` : ''}`;
  if (groupMode === 'line' && tracks.length < 2) groupMode = 'status';
  renderGroups();
}
function renderGroups() {
  const host = $('#groups');
  host.innerHTML = (groupMode === 'line' ? '<p class="group-note">Each paper sits under its main line. Its codes show every line it is on.</p>' : '') +
    groupsBy(groupMode).map(g => `<div class="group" data-g="${g.key}"><h3 class="glabel">${g.title} <span class="n">${g.items.length}</span></h3>${g.items.map(p => paperRow(p)).join('')}</div>`).join('');
  if (mapState.filter) { const f = mapState.filter; mapState.filter = null; setFilter(f); }
}
function renderSpotlight(p) {
  const bib = bibtex(p), al = authorsLine(p), href = mainLink(p);
  // "Presented at" comes from the Talks list unless the paper has its own line
  const talks = items('talks').filter(li => li.dataset.paper === p.id && li.dataset.date).sort((a, b) => b.dataset.date.localeCompare(a.dataset.date));
  const isLater = d => d.length === 7 ? d >= TODAY.slice(0, 7) : d > TODAY;
  const auto = talks.length ? 'Presented at ' + talks.map(li => esc(li.textContent.trim()) + (isLater(li.dataset.date) ? ' (scheduled)' : '')).join('; ') + '.' : '';
  p = Object.assign({}, p, { presented: p.presented || auto });
  return `<article class="spot" id="spot" data-card>
    <div class="spot-fig">${figure(p, true)}</div>
    <div class="spot-body" id="p-${p.id}" tabindex="-1">
      <p class="pmeta">${caplets(p)}<span class="status strong">Job market paper</span>${p.version ? `<span class="ver">This version: ${esc(p.version)}</span>` : ''}</p>
      <h3>${href ? A(href, esc(p.title), 't') : esc(p.title)}</h3>
      ${al ? `<p class="auth">${al}</p>` : ''}
      ${p.abstract ? `<div class="abs open-abs">${p.abstract}</div>` : ''}
      <div class="acts">${linkPills(p)}${SITE.onMarket && items('references').length ? `<a class="pill" href="#references" data-go="references">References</a>` : ''}${bib ? `<span class="acts-gap" aria-hidden="true"></span><button class="pill" type="button" data-toggle="bib" aria-expanded="false" aria-controls="bibp-spot">BibTeX</button>` : ''}</div>
      ${bib ? `<div class="collapse" data-panel="bib" id="bibp-spot"><div class="inner"><div class="bib"><pre id="bib-spot">${esc(bib)}</pre><button class="pill copy" type="button" data-copy="bib-spot">Copy</button></div></div></div>` : ''}
      ${p.presented ? `<p class="presented">${p.presented}</p>` : ''}
    </div>
  </article>`;
}

/* ---------- other sections ---------- */
/* a section heading; pass the section's source entries to mark placeholder content in preview */
const head = (title, extra = '', els) => `<div class="sec-h"><h2>${title}</h2>${els ? tmplTag(els) : ''}${extra}</div>`;
/* one gold tessera (Stanford Memorial Church) marks an award */
const TESS = '<svg class="tess" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><rect x="1.5" y="1.5" width="9" height="9" rx="1.2" fill="var(--g1)" transform="rotate(6 6 6)"/><rect x="3.5" y="3.5" width="3" height="3" rx=".5" fill="var(--g3)" transform="rotate(6 6 6)"/></svg>';
function renderNews() {
  const sec = $('#news');
  const cut = new Date(NOW.getFullYear() - 1, NOW.getMonth(), 1), cutYM = cut.getFullYear() + '-' + pad(cut.getMonth() + 1);
  const list = items('news').filter(li => (li.dataset.date || '') >= cutYM).sort((a, b) => b.dataset.date.localeCompare(a.dataset.date)).slice(0, 4);
  if (!list.length) { sec.remove(); return; }
  sec.innerHTML = head('News', '', list) + `<ul class="rows">${list.map(li => `<li><span class="when">${fmtYM(li.dataset.date)}</span><span>${li.innerHTML}</span></li>`).join('')}</ul>`;
}
function renderCode() {
  const list = items('code'); const sec = $('#code');
  if (!list.length) { sec.remove(); return; }
  sec.innerHTML = head('Code and data', `<span class="sec-count">${list.length}</span>`, list) + `<ul class="repos">${list.map(li => {
    const d = li.dataset, p = d.paper && P[d.paper] && !P[d.paper].hidden ? P[d.paper] : null;
    return `<li class="repo">
      <p class="rname">${A(d.url, esc(d.name))}${d.type ? ` <span class="kind">${esc(d.type)}</span>` : ''}</p>
      <p class="rdesc">${li.innerHTML}</p>
      <p class="rmeta">${[d.lang, d.license].filter(Boolean).map(esc).concat(d.doi ? ['DOI ' + A(SITE.preview ? '#' : 'https://doi.org/' + d.doi, esc(d.doi))] : []).join(SEP)}</p>
      ${p ? `<p class="rfor">For ${mainCap(p)} <a href="#p-${p.id}" data-go="p-${p.id}">${esc(p.short)}</a></p>` : ''}
    </li>`;
  }).join('')}</ul>`;
}
function renderTeaching() {
  const t = items('teaching'), s = items('service'); const sec = $('#teaching');
  if (!t.length && !s.length) { sec.remove(); return; }
  const tRows = t.length ? `<ul class="rows">${t.map(li => { const d = li.dataset; return `<li><span class="when">${nowrapYears(esc(d.term || ''))}</span><span><b>${li.innerHTML}</b>${d.role || d.level ? `<span class="muted">${SEP}${esc(d.role || '')}${d.level ? (d.role ? ', ' : '') + esc(d.level) : ''}</span>` : ''}${d.eval ? `<span class="small">${esc(d.eval)}</span>` : ''}${d.award ? `<span class="small award">${TESS}${esc(d.award)}</span>` : ''}</span></li>`; }).join('')}</ul>` : '';
  const sRows = s.length ? `<ul class="rows">${s.map(li => `<li class="wide"><span>${li.dataset.kind === 'referee' ? '<b>Referee for</b> ' : ''}${nowrapYears(li.innerHTML)}</span></li>`).join('')}</ul>` : '';
  sec.innerHTML = head(t.length && s.length ? 'Teaching and service' : t.length ? 'Teaching' : 'Service', '', t.concat(s)) +
    (t.length && s.length ? `<div class="cols"><div><h3 class="glabel">Teaching</h3>${tRows}</div><div><h3 class="glabel">Service and refereeing</h3>${sRows}</div></div>` : tRows || sRows);
}
function renderTalks() {
  const list = items('talks').filter(li => li.dataset.date).sort((a, b) => b.dataset.date.localeCompare(a.dataset.date)); const sec = $('#talks');
  if (!list.length) { sec.remove(); return; }
  const years = [...new Set(list.map(li => li.dataset.date.slice(0, 4)))];
  const co = list.some(li => li.dataset.by === 'coauthor');
  const later = d => d.length === 7 ? d >= TODAY.slice(0, 7) : d > TODAY;   // YYYY-MM or YYYY-MM-DD
  const dayMonth = d => d.length === 7 ? fmtYM(d).split(' ')[0] : fmtDM(d);
  const next = list.filter(li => later(li.dataset.date)).sort((a, b) => a.dataset.date.localeCompare(b.dataset.date))[0];
  const row = (li, sched) => { const d = li.dataset, p = d.paper && P[d.paper] && !P[d.paper].hidden ? P[d.paper] : null;
    return `<b>${li.innerHTML}</b>${d.by === 'coauthor' ? '<sup><abbr title="Presented by a coauthor">*</abbr></sup>' : ''}${sched ? ' <span class="sched">Scheduled</span>' : ''}<span class="small">${esc(d.city || '')}${p ? `${SEP}${mainCap(p)} <a href="#p-${p.id}" data-go="p-${p.id}">${esc(p.short)}</a>` : ''}</span>`; };
  sec.innerHTML = head('Talks', `<span class="sec-count">${list.length}</span>`, list) +
    (next ? `<p class="next-talk"><span class="nt-l">Next talk</span><span class="nt-d">${dayMonth(next.dataset.date)} ${next.dataset.date.slice(0, 4)}</span><span class="nt-b">${row(next, false)}</span></p>` : '') +
    years.map((y, yi) => `<div class="tyear"><h3 class="yr-h" style="--tone:var(--m${(yi % 4) + 1})">${y}</h3><ul class="rows">${list.filter(li => li.dataset.date.startsWith(y)).map(li => `<li><span class="when">${dayMonth(li.dataset.date)}</span><span>${row(li, later(li.dataset.date))}</span></li>`).join('')}</ul></div>`).join('') +
    (co ? '<p class="legend-note">* Presented by a coauthor.</p>' : '');
}
function renderAwards() {
  const list = items('awards'); const sec = $('#awards');
  if (!list.length) { sec.remove(); return; }
  const title = (blocks('awards').dataset.title || '').trim() || 'Awards and fellowships';
  sec.innerHTML = head(esc(title), '', list) + `<ul class="rows">${list.map(li => `<li><span class="when">${nowrapYears(esc(li.dataset.year || ''))}</span><span>${TESS}<b>${li.innerHTML}</b>${li.dataset.by ? `<span class="muted">${SEP}${esc(li.dataset.by)}</span>` : ''}${li.dataset.note ? `<span class="small">${esc(li.dataset.note)}</span>` : ''}</span></li>`).join('')}</ul>`;
}

/* ---------- research experience: roles, the projects in each, and the papers they fed ---------- */
const yearSpan = d => {
  const a = (d.start || '').slice(0, 4), z = (d.end || '').slice(0, 4);
  return !a ? z : !d.end ? a + '–now' : a === z ? a : a + '–' + z;
};
function renderResearch() {
  const sec = $('#research'); if (!sec) return;
  const b = blocks('research');
  const roles = b ? Array.from(b.children).filter(x => x.tagName === 'LI') : [];
  const skills = items('skills');
  if (!roles.length && !skills.length) { sec.remove(); return; }
  const withLine = w => w ? `with ${esc(w)}` : '';
  sec.innerHTML = head(roles.length ? 'Research experience' : 'Skills', roles.length ? `<span class="sec-count">${roles.length}</span>` : '', roles.concat(skills)) +
    (roles.length ? `<ol class="rx">${roles.map(li => {
      const d = li.dataset, projects = $$(':scope > ul > li', li);
      return `<li><span class="when">${nowrapYears(esc(yearSpan(d)))}</span><div class="rx-body">
        ${d.role ? `<h3>${esc(d.role)}</h3>` : ''}
        ${d.place || d.with ? `<p class="rx-at">${[esc(d.place || ''), withLine(d.with)].filter(Boolean).join(SEPSPAN)}</p>` : ''}
        ${d.project ? `<p class="rx-pj">${esc(d.project)}</p>` : ''}
        ${projects.length ? `<ul class="rx-proj">${projects.map(p => `<li>${p.dataset.project ? `<span class="pj"><b>${esc(p.dataset.project)}</b>${p.dataset.with ? ` <span class="muted">${withLine(p.dataset.with)}</span>` : ''}</span>` : ''}${p.innerHTML.trim()}</li>`).join('')}</ul>` : ''}
        ${d.datasets ? `<p class="small rx-data">Data: ${esc(d.datasets)}</p>` : ''}
      </div></li>`;
    }).join('')}</ol>` : '') +
    (skills.length ? `<p class="skills">${skills.map(li => `<span>${li.dataset.label ? `<b>${esc(li.dataset.label)}</b> ` : ''}${li.innerHTML.trim()}</span>`).join('')}</p>` : '');
}

/* ---------- Path: plates in each city's own sign style, never overstating a visit ---------- */
const KIND = { exchange: 'EXCHANGE', visiting: 'VISITING', work: '', internship: '', school: '', degree: '' };
const MINOR = ['exchange', 'visiting', 'internship', 'school'];   // drawn lighter than degrees and jobs
/* "Shanghai High School International Division" -> "SHSID", for an empty logo slot */
const initialsOf = s => String(s || '').split(/\s+/).filter(w => /^\p{Lu}/u.test(w)).map(w => w[0]).join('') || 'School';
function plate(city, d) {
  switch (city) {
    case 'singapore': return `<span class="plate sg"><span class="en">Singapore</span><span class="loc"><span lang="zh-Hans-SG">新加坡</span><span lang="ms">Singapura</span><span lang="ta">சிங்கப்பூர்</span></span></span>`;
    case 'shanghai': return d.streetLocal || d.street ? `<span class="plate sh">${d.streetLocal ? `<span lang="zh-Hans-CN" class="hz">${esc(d.streetLocal)}</span>` : ''}${d.street ? `<span class="py">${esc(d.street)}</span>` : ''}</span>` : '';
    case 'hongkong': return d.street || d.streetLocal ? `<span class="plate hk">${d.street ? `<span class="en">${esc(d.street)}</span>` : ''}${d.streetLocal ? `<span lang="zh-Hant-HK" class="hz">${esc(d.streetLocal)}</span>` : ''}</span>` : '';
    case 'london': return d.street ? `<span class="plate ldn"><span class="street">${esc(d.street.toUpperCase())}</span>${d.district ? `<span class="pc">${esc(d.district)}</span>` : ''}</span>` : '';
    case 'oxford': return `<span class="plate ox">${esc(d.board || 'OXFORD' + (KIND[d.kind] ? ' · ' + KIND[d.kind] : ''))}</span>`;
    /* no year on the bronze plate: a year would read as a Stanford graduating class */
    case 'stanford': return `<span class="plate su">${esc(d.board || 'STANFORD' + (KIND[d.kind] ? ' · ' + KIND[d.kind] : ''))}</span>`;
    default: return '';
  }
}
function renderPath() {
  const list = items('path'); const sec = $('#path');
  if (!list.length) { sec.remove(); return; }
  const dated = list.map(li => Object.assign({}, li.dataset, { city: cid(li.dataset.city), raw: li.dataset.city }));
  const nowStop = dated[dated.map(isOpenStop).lastIndexOf(true)];   // only the last open-ended stop is "now"
  const stops = NEWEST_FIRST ? dated.slice().reverse() : dated;
  const current = stops.indexOf(nowStop);
  const nextStop = SITE.onMarket ? `<li class="stop next"><span class="node" aria-hidden="true"></span><span class="glyph"></span><div class="sbody"><p class="yrs"><span>Next station</span></p><h3>On the ${esc(SITE.marketYear)} job market</h3>${spotlight ? `<p class="place">Job market paper: <a href="#p-${spotlight.id}" data-go="p-${spotlight.id}">${esc(spotlight.short)}</a></p>` : ''}</div></li>` : '';
  const title = (blocks('path').dataset.title || '').trim() || 'Path so far';
  sec.innerHTML = head(esc(title), '', list) + `
  <ol class="route${NEWEST_FIRST ? ' rev' : ''}" id="route">
    ${NEWEST_FIRST ? nextStop : ''}
    ${stops.map((d, i) => {
      const c = cityOf(d.raw), here = i === current, prev = stops[i - 1], same = prev && prev.city === d.city;
      const pl = d.logo ? '' : plate(d.city, d);   // a logo (a school crest, say) takes the place of the street plate
      const minor = MINOR.includes(d.kind);
      const end = d.end || (here ? '' : d.start);
      const yrs = d.start ? esc(d.start) + (end === d.start ? '' : '–' + (end ? esc(end) : 'now')) : '';
      return `<li class="stop${here ? ' now' : ''}${same || minor ? ' tick' : ''}${minor ? ' minor' : ''}" data-city="${esc(d.city)}">
        <span class="node" aria-hidden="true"></span>
        ${same ? '<span class="glyph"></span>' : icon(d.city)}
        <div class="sbody">
          <p class="yrs">${yrs ? `<span>${yrs}</span>` : ''}<span class="cityname${yrs ? '' : ' solo'}">${cityName(c.name)}</span>${here && HERE_LABEL ? `<span class="you">${esc(HERE_LABEL)}</span>` : ''}</p>
          ${pl ? `<p class="plate-row">${pl}</p>` : ''}
          ${d.logo ? `<p class="logo-row"><img class="slogo" src="${esc(d.logo)}" alt="${esc(d.logoAlt || '')}"${d.logoAlt ? ` title="${esc(d.logoAlt)}"` : ''} data-ph="${esc(initialsOf(d.logoAlt))}" decoding="async"></p>` : ''}
          ${d.role ? `<h3>${esc(d.role)}</h3>` : ''}
          ${d.place ? `<p class="place">${esc(d.place)}</p>` : ''}
          ${d.note ? `<p class="snote">${esc(d.note)}</p>` : ''}
          ${c.geo ? `<p class="geo">${esc(c.geo)}</p>` : ''}
        </div>
      </li>`;
    }).join('')}
    ${NEWEST_FIRST ? '' : nextStop}
  </ol>`;
  watchLogos(sec);
}
/* a logo file that is not there yet: a labelled empty slot in preview, nothing on the live site */
function watchLogos(root) {
  $$('img.slogo', root).forEach(img => {
    const ok = () => img.classList.add('ok');
    const fail = () => {
      const row = img.closest('.logo-row'); if (!row) return;
      if (!SITE.preview) { row.remove(); return; }
      const ph = document.createElement('span');
      ph.className = 'slogo-ph'; ph.textContent = img.dataset.ph + ' logo';
      ph.setAttribute('role', 'img'); ph.setAttribute('aria-label', `${img.alt || 'Logo'}: logo file not added yet`);
      ph.title = `${img.alt ? img.alt + '. ' : ''}Add the file ${img.getAttribute('src')} to show the logo here.`;
      img.replaceWith(ph);
    };
    img.addEventListener('load', ok); img.addEventListener('error', fail);
    if (img.complete) (img.naturalWidth ? ok : fail)();
  });
}
function renderReferences() {
  const list = items('references'); const sec = $('#references');
  if (!SITE.onMarket || !list.length) { sec.remove(); return; }
  const pl = blocks('placement');
  const wbr = s => esc(s).replace(/[@.]/g, '<wbr>$&');
  sec.innerHTML = head('References') + `<ul class="refs">${list.map((li, i) => { const d = li.dataset; return `<li><p class="rn">${A(d.url, esc(d.name))}</p><p class="muted">${esc(d.title || '')}${d.inst ? ', ' + esc(d.inst) : ''}</p>${d.role ? `<p class="muted">${esc(d.role)}</p>` : ''}${d.email ? `<p class="mono ref-mail"><span id="ref-${i}">${wbr(d.email)}</span><button class="pill copy" type="button" data-copy="ref-${i}" aria-label="Copy ${esc(d.name)}’s email">Copy</button></p>` : ''}</li>`; }).join('')}</ul>${pl ? `<p class="placement">${pl.innerHTML.replace(/<span>([^<]+@[^<]+)<\/span>/g, (m, e, k) => `<span class="mono" id="pl-${k}">${wbr(e)}</span>`)}</p>` : ''}`;
}
function renderContact() {
  const prof = PROFILES;
  $('#contact').innerHTML = head('Contact') + `
  <div class="contact">
    <div>
      ${SITE.email ? `<p class="mail"><a href="mailto:${esc(SITE.email)}" class="addr" id="email">${esc(SITE.email).replace(/[@.]/g, '<wbr>$&')}</a><button class="pill copy" type="button" data-copy="email" aria-label="Copy email address">Copy</button></p>` : ''}
      ${SITE.office ? `<p class="office">${esc(SITE.office)}</p>` : ''}
      <p class="clock-line"><span class="live" aria-hidden="true"></span><time data-clock="${esc(SITE.timezone || BASE.tz)}"></time> in ${esc(BASE.name)} <span class="muted">(${[BASE.zone, offsetLabel(SITE.timezone || BASE.tz)].filter(Boolean).map(esc).join(', ')})</span></p>
      ${HAS_CV ? `<p class="cvline">${A(SITE.cv.url, 'CV, PDF', 'btn', `aria-label="CV, PDF${SITE.cv.updated ? ', updated ' + esc(SITE.cv.updated) : ''}"`)}${SITE.cv.updated ? ` <span class="muted">Last updated ${esc(SITE.cv.updated)}</span>` : ''}</p>` : ''}
    </div>
    ${prof.length ? `<ul class="profiles">${prof.map(x => `<li>${A(x.url, esc(x.label), 'tl')}</li>`).join('')}</ul>` : ''}
  </div>`;
}
function renderNav() {
  const secs = [['papers', 'Papers'], ['research', 'Experience'], ['code', 'Code'], ['teaching', 'Teaching'], ['talks', 'Talks'], ['path', 'Path'], ['references', 'References'], ['contact', 'Contact']].filter(([id]) => document.getElementById(id));
  // the skip link goes to the first main section that is on the page
  const skip = $('.skip'), first = [['papers', 'papers'], ['research', 'research experience'], ['path', 'path'], ['contact', 'contact']].find(([id]) => document.getElementById(id));
  if (skip && first) { skip.setAttribute('href', '#' + first[0]); skip.textContent = 'Skip to ' + first[1]; }
  $('#navlinks').innerHTML = secs.map(([id, l]) => `<a href="#${id}" data-go="${id}" data-spy="${id}">${l}</a>`).join('') + '<span class="nav-ind" aria-hidden="true"></span>';
  $('#menulinks').innerHTML = (HAS_CV ? A(SITE.cv.url, `CV <span class="muted">PDF${SITE.cv.updated ? ', ' + esc(SITE.cv.updated) : ''}</span>`, 'menu-cv') : '') + secs.map(([id, l]) => `<a href="#${id}" data-go="${id}">${l}</a>`).join('');
  $$('.cvpill').forEach(x => { x.innerHTML = HAS_CV ? A(SITE.cv.url, 'CV', 'cv', `aria-label="CV, PDF${SITE.cv.updated ? ', updated ' + esc(SITE.cv.updated) : ''}"`) : ''; });
  $('#brand').textContent = SITE.name;
}
/* one quiet clock line, grouped by the offsets the owner's cities share right now */
function worldBoard() {
  const host = $('#world'); if (!host) return;
  const cities = [...new Set(['singapore'].concat(items('path').map(li => cid(li.dataset.city))))].filter(c => CITY[c]);
  const groups = new Map();
  cities.forEach(c => { const o = utcOffset(CITY[c].tz); if (!o) return; const g = groups.get(o.minutes) || { o, tz: CITY[c].tz, names: [] }; g.names.push(CITY[c].name); groups.set(o.minutes, g); });
  if (!groups.size) { host.hidden = true; return; }
  const homeDay = fmtTime(SITE.timezone, { weekday: 'short', hour: undefined, minute: undefined });
  host.innerHTML = '<span class="sr">Local times in the cities on my path: </span>' + [...groups.values()].sort((a, b) => b.o.minutes - a.o.minutes).map(g => {
    const day = fmtTime(g.tz, { weekday: 'short', hour: undefined, minute: undefined });
    return `<span class="wg"><span class="wo">${g.o.label}</span> ${g.names.map(esc).join(SEP)} <time>${fmtTime(g.tz)}${day && day !== homeDay ? ' ' + day : ''}</time></span>`;
  }).join('');
}
function renderFooter() {
  const up = SITE.updated ? (() => { const [y, m, d] = SITE.updated.split('-'); return `${+d} ${MON[+m - 1]} ${y}`; })() : '';
  const notes = colophon();
  $('#foot').innerHTML = `
    <p class="world" id="world"></p>
    <p class="foot-meta">${[up ? `Last updated ${up}` : '', HAS_CV ? A(SITE.cv.url, 'CV') + (SITE.cv.updated ? ` (PDF, ${esc(SITE.cv.updated)})` : '') : '', `© ${NOW.getFullYear()} ${esc(SITE.name)}`, '<a href="#top" data-go="top">Back to top</a>'].filter(Boolean).join(SEP)}</p>
    ${notes ? `<p class="colophon">${notes}</p>` : ''}`;
  worldBoard();
}
/* the design notes describe only the parts that are on the page */
function colophon() {
  const out = [], bits = [];
  if ($('#lines')) out.push('Line colours come from Singapore’s MRT palette, and the diagram follows the rules of Harry Beck’s 1933 London Underground map. Station codes are numbered by date along each line.');
  if ($('#talks')) bits.push('talk years are set like Hong Kong MTR station mosaics');
  if ($('#awards')) bits.push('awards carry a tessera of Stanford’s gold mosaic');
  if ($('#path')) bits.push('the Path’s signs follow each city’s own street-sign style');
  if (bits.length) { const s = LIST.format(bits); out.push(s[0].toUpperCase() + s.slice(1) + '.'); }
  if ($('#papers')) out.push('Author lists use the Oxford comma.');
  return out.join(' ');
}

/* ==================================================================
   BEHAVIOUR
   ================================================================== */
function layoutSegs() {
  $$('.seg').forEach(seg => {
    const k = $('.knob', seg), b = $('button[aria-pressed="true"]', seg);
    if (!k) return;
    if (!b || !seg.offsetParent) { k.style.opacity = b ? '' : 0; return; }
    k.style.opacity = '';
    k.style.width = b.offsetWidth + 'px'; k.style.transform = `translateX(${b.offsetLeft}px)`;
    if (!seg.classList.contains('ready')) requestAnimationFrame(() => requestAnimationFrame(() => seg.classList.add('ready')));
  });
}
function tickClocks() { $$('time[data-clock]').forEach(t => { t.textContent = fmtTime(t.dataset.clock); }); worldBoard(); }
let toastT = 0;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1900); }
async function copyFrom(btn) {
  const el = document.getElementById(btn.dataset.copy); if (!el) return;
  const label = btn.dataset.label || btn.textContent; btn.dataset.label = label;
  const text = el.textContent.trim();
  try { await navigator.clipboard.writeText(text); btn.textContent = 'Copied'; toast(/@/.test(text) && text.length < 80 ? 'Copied ' + text : 'Copied'); }
  catch (e) {
    const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    btn.textContent = mac ? 'Selected: press ⌘C' : 'Selected: press Ctrl+C';
    toast('Selected. Use your device’s Copy command.');
  }
  setTimeout(() => { btn.textContent = label; }, 1800);
}
function goTo(id, flash) {
  const el = id === 'top' ? document.body : document.getElementById(id); if (!el) return;
  // a paper hidden by the current line filter: clear the filter first, then scroll once it has opened
  const hiddenRow = el.closest('.pwrap:not(.open), .spot.faded');
  if (hiddenRow && mapState.filter) { setFilter(mapState.filter); setTimeout(() => goTo(id, flash), reduceMotion() ? 0 : 500); return; }
  el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: id === 'top' ? 'start' : (flash ? 'center' : 'start') });
  // move keyboard focus with the jump, so the next Tab continues from the target
  let target;
  if (flash) {
    const row = el.closest('.paper-row, .spot') || el;
    row.classList.remove('flash'); void row.offsetWidth; row.classList.add('flash'); setTimeout(() => row.classList.remove('flash'), 1700);
    target = row.querySelector('h4 a, h3 a') || row.querySelector('h4, h3');
  } else target = id === 'top' ? $('.hero h1') : (el.querySelector('h2, h3') || el);
  if (target) { if (!target.matches('a[href], button, [tabindex]')) target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
}
function previewSoon(t) { clearTimeout(previewTimer); previewTimer = setTimeout(() => { mapState.preview = t; applyMapState(); }, t ? 120 : 60); }

function bind() {
  // a menu left open would cover the links that keyboard focus moves on to
  const bar = $('#bar');
  if (bar) bar.addEventListener('focusout', e => { if (e.relatedTarget && !bar.contains(e.relatedTarget)) closeMenu(); });
  document.addEventListener('click', e => {
    const go = e.target.closest('[data-go]');
    if (go) { e.preventDefault(); const id = go.dataset.go; goTo(id, id.startsWith('p-')); closeMenu(); return; }
    if (e.target.closest('[data-sample]')) { e.preventDefault(); toast('Sample link. Yours will point to the real page or file.'); return; }
    const cp = e.target.closest('[data-copy]'); if (cp) { copyFrom(cp); return; }
    const tg = e.target.closest('[data-toggle]');
    if (tg) {
      const card = tg.closest('[data-card]'), val = tg.dataset.toggle;
      $$('[data-panel]', card).forEach(p => { p.classList.toggle('open', p.dataset.panel === val && !p.classList.contains('open')); });
      $$('[data-toggle]', card).forEach(b => { const p = $(`[data-panel="${b.dataset.toggle}"]`, card); b.setAttribute('aria-expanded', String(!!p && p.classList.contains('open'))); });
      return;
    }
    const lb = e.target.closest('.lbtn'); if (lb) { setFilter(lb.dataset.t); return; }
    if (e.target.closest('[data-clear]')) { const f = mapState.filter; setFilter(f); const b = $(`.lbtn[data-t="${f}"]`); if (b) b.focus(); return; }
    const fb = e.target.closest('button[data-station]');
    if (fb) {
      const p = P[fb.dataset.station]; if (!p) return;
      $('#lines').scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
      mapState.preview = null; if (mapState.filter !== p.topics[0]) setFilter(p.topics[0]); pulseStation(p.id);
      const g = $(`#map .st[data-st="${p.id}"]`); if (g) { $$('#map .st').forEach(x => x.setAttribute('tabindex', x === g ? '0' : '-1')); g.focus({ preventScroll: true }); }
      return;
    }
    const st = e.target.closest('#map .st'); if (st) { goTo('p-' + st.dataset.st, true); return; }
    const sn = e.target.closest('#map .sname'); if (sn) { goTo('p-' + sn.dataset.st, true); return; }
    const gb = e.target.closest('[data-group]');
    if (gb) { groupMode = gb.dataset.group; try { localStorage.setItem('groupBy', groupMode); } catch (err) {} $$('[data-group]').forEach(b => b.setAttribute('aria-pressed', String(b === gb))); layoutSegs(); const g = $('#groups'); g.classList.add('swap'); setTimeout(() => { renderGroups(); g.classList.remove('swap'); }, reduceMotion() ? 0 : 140); return; }
    const th = e.target.closest('[data-theme-set]'); if (th) { setTheme(th.dataset.themeSet); return; }
    if (e.target.closest('#menubtn')) { const open = !$('#bar').classList.contains('menu-open'); $('#bar').classList.toggle('menu-open', open); $('#menubtn').setAttribute('aria-expanded', String(open)); if (open) requestAnimationFrame(layoutSegs); return; }
  });
  document.addEventListener('keydown', e => {
    const st = e.target.closest && e.target.closest('#map .st');
    if (st) {
      const all = $$('#map .st'), i = all.indexOf(st);
      const nextKeys = ['ArrowRight', 'ArrowDown'], prevKeys = ['ArrowLeft', 'ArrowUp'];
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo('p-' + st.dataset.st, true); return; }
      if (nextKeys.includes(e.key) || prevKeys.includes(e.key) || e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        const j = e.key === 'Home' ? 0 : e.key === 'End' ? all.length - 1 : Math.max(0, Math.min(all.length - 1, i + (nextKeys.includes(e.key) ? 1 : -1)));
        all.forEach((g, k) => g.setAttribute('tabindex', k === j ? '0' : '-1')); all[j].focus(); return;
      }
      if (e.key === 'Escape') { hideTip(); const b = $(`.lbtn[data-t="${mapState.filter || st.dataset.topics.split(' ')[0]}"]`); if (b) b.focus(); return; }
    }
    if (e.key === 'Escape') { closeMenu(); hideTip(); }
  });
  const lines = $('#lines');
  if (lines) {
    lines.addEventListener('pointerover', e => {
      const b = e.target.closest('.lbtn, .ln'); if (b) previewSoon(b.dataset.t);
      const st = e.target.closest('.st'); if (st) showTip(st);
    });
    lines.addEventListener('pointerout', e => {
      const b = e.target.closest('.lbtn, .ln'); if (b && !b.contains(e.relatedTarget)) previewSoon(null);
      const st = e.target.closest('.st'); if (st && !st.contains(e.relatedTarget)) hideTipSoon();
    });
    // the tooltip can be hovered (WCAG 1.4.13): leaving the station only hides it after a pause
    const tip = $('#tip');
    if (tip) { tip.addEventListener('pointerenter', () => clearTimeout(tipTimer)); tip.addEventListener('pointerleave', hideTip); }
    lines.addEventListener('focusin', e => { const b = e.target.closest('.lbtn'); if (b) { mapState.preview = b.dataset.t; applyMapState(); } const st = e.target.closest('.st'); if (st) showTip(st); });
    lines.addEventListener('focusout', e => { const b = e.target.closest('.lbtn'); if (b) { mapState.preview = null; applyMapState(); } if (e.target.closest('.st')) hideTip(); });
  }
  const pap = $('#papers');
  if (pap) {
    pap.addEventListener('pointerover', e => { const r = e.target.closest('.pwrap'); if (r) markStation(r.dataset.id, true); });
    pap.addEventListener('pointerout', e => { const r = e.target.closest('.pwrap'); if (r && !r.contains(e.relatedTarget)) markStation(r.dataset.id, false); });
  }
}
function markStation(id, on) { const g = $(`#map .st[data-st="${id}"]`); if (g) g.classList.toggle('on', on); }
function pulseStation(id) { const g = $(`#map .st[data-st="${id}"]`); if (!g) return; g.classList.remove('pulse'); void g.getBoundingClientRect(); g.classList.add('pulse'); setTimeout(() => g.classList.remove('pulse'), 1600); }
let tipTimer = 0;
function hideTipSoon() { clearTimeout(tipTimer); tipTimer = setTimeout(hideTip, 300); }
function showTip(st) {
  const p = P[st.dataset.st], tip = $('#tip'), host = $('#map'); if (!p || !tip) return;
  clearTimeout(tipTimer);
  if (host.classList.contains('vertical')) return;   // the phone map prints every name already
  tip.innerHTML = `${caplets(p)}<b>${esc(p.short)}</b><span>${statusLine(p)}${datedStatus(p)}</span>`;
  tip.classList.add('show');
  const hr = host.getBoundingClientRect(), r = (st.querySelector('.halo') || st).getBoundingClientRect();
  const w = tip.offsetWidth, h = tip.offsetHeight;
  // place it outside the band of station halos, on the side nearer this station, so it never covers
  // another station; switch sides if it would slide under the sticky bar or off the screen
  const halos = $$('.st .halo', host).map(x => x.getBoundingClientRect());
  const bandTop = Math.min(...halos.map(b => b.top)) - hr.top, bandBot = Math.max(...halos.map(b => b.bottom)) - hr.top;
  const mid = (r.top + r.bottom) / 2 - hr.top, above = mid - bandTop <= bandBot - mid;
  const barB = ($('#bar') || { getBoundingClientRect: () => ({ bottom: 0 }) }).getBoundingClientRect().bottom;
  let x = r.left + r.width / 2 - hr.left - w / 2, y = above ? bandTop - 4 - h : bandBot + 4;
  if (above && hr.top + y < barB + 4) y = bandBot + 4;
  else if (!above && hr.top + y + h > innerHeight - 4) y = bandTop - 4 - h;
  x = Math.max(0, Math.min(hr.width - w, x));
  tip.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
}
function hideTip() { clearTimeout(tipTimer); const tip = $('#tip'); if (tip) tip.classList.remove('show'); }
function closeMenu() {
  const bar = $('#bar');
  if (bar && bar.classList.contains('menu-open')) {
    const inSheet = $('#menusheet').contains(document.activeElement);
    bar.classList.remove('menu-open'); $('#menubtn').setAttribute('aria-expanded', 'false');
    if (inSheet && document.activeElement && $('#menusheet').contains(document.activeElement)) $('#menubtn').focus();
  }
}
/* collapse the nav when it does not fit, by measuring rather than guessing a breakpoint */
function fitNav() {
  const bar = $('#bar'), inner = $('.bar-in', bar), brand = $('#brand'); if (!bar || !inner) return;
  bar.classList.remove('compact');
  // collapse when the links do not fit, when the name would be cut short, or on small screens,
  // where the CV and theme buttons live in the menu
  if (inner.scrollWidth > inner.clientWidth + 1 || (brand && brand.scrollWidth > brand.clientWidth + 1) || matchMedia('(max-width: 480px)').matches) bar.classList.add('compact');
  if (!bar.classList.contains('compact')) closeMenu();
}

/* theme: Kopi (light) and Kopi-O (dark, black coffee) */
function effectiveTheme() { const t = document.documentElement.dataset.theme; return t || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); }
function syncTheme() { const t = effectiveTheme(); $$('[data-theme-set]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeSet === t))); layoutSegs(); }
function setTheme(t) { document.documentElement.dataset.theme = t; try { localStorage.setItem('theme', t); } catch (e) {} syncTheme(); }

/* scroll: header state, section spy, path progress */
function onScroll() {
  const bar = $('#bar'); bar.classList.toggle('scrolled', scrollY > 8);
  const links = $$('#navlinks [data-spy]'); let cur = null;
  const th = bar.offsetHeight + 40;
  // the section being read; none while reading a section that has no nav link (Awards, News)
  links.forEach(a => { const s = document.getElementById(a.dataset.spy); if (!s) return; const r = s.getBoundingClientRect(); if (r.top <= th) cur = r.bottom > th ? a : null; });
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4 && links.length) cur = links[links.length - 1];
  links.forEach(a => { a.classList.toggle('on', a === cur); if (a === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  const ind = $('#navlinks .nav-ind');
  if (ind) { if (cur) { ind.style.width = cur.offsetWidth - 20 + 'px'; ind.style.transform = `translateX(${cur.offsetLeft + 10}px)`; ind.style.opacity = 1; } else ind.style.opacity = 0; }
  const route = $('#route');
  if (route) {
    const mark = innerHeight * .62;
    $$('.stop', route).forEach(li => {
      const r = li.getBoundingClientRect();
      li.style.setProperty('--f', Math.min(1, Math.max(0, (mark - r.top - 15) / r.height)).toFixed(4));
      li.classList.toggle('on', r.top + 15 <= mark);
    });
  }
}

/* ==================================================================
   BOOT
   ================================================================== */
function boot() {
  try { const t = localStorage.getItem('theme'); if ((t === 'light' || t === 'dark') && !document.documentElement.dataset.theme) document.documentElement.dataset.theme = t; } catch (e) {}
  if (SITE.preview) {
    // a preview with placeholders should not show up in search results
    if (!$('meta[name="robots"]')) { const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex'; document.head.appendChild(m); }
    const n = $('#note');
    if (n) {
      n.hidden = false;
      n.textContent = TEMPLATES
        ? 'Preview. Sections marked Template hold placeholder entries to replace with your own. Setting “preview” to false hides anything still marked Template and turns off the sample-link notices.'
        : 'Preview. Links that are not set yet show a notice instead of opening. Set “preview” to false when the site is ready.';
    }
  }
  document.title = SITE.role ? `${SITE.name} · ${SITE.role}` : SITE.name;
  // each section renders on its own, so one bad entry cannot blank the page
  [renderHero, renderLines, renderPapers, renderResearch, renderNews, renderCode, renderTeaching, renderTalks, renderAwards, renderPath, renderReferences, renderContact, renderNav, renderFooter].forEach(fn => {
    try { fn(); } catch (e) { warn(`${fn.name} failed: ${e.message}`, e); }
  });
  // each section is named by its own heading, so the name always matches what is shown
  $$('main section').forEach(sec => { const h = $('h2', sec); if (h) { h.id = h.id || sec.id + '-title'; sec.setAttribute('aria-labelledby', h.id); sec.removeAttribute('aria-label'); } });
  try { bind(); } catch (e) { warn('bind failed', e); }
  syncTheme(); tickClocks(); setInterval(tickClocks, 30000);
  fitNav(); layoutSegs(); onScroll();
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; onScroll(); }); } }, { passive: true });
  let rt = 0; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { fitNav(); const m = $('#map'); if (m && Math.round(m.clientWidth) !== lastMapW) drawMap(); layoutSegs(); onScroll(); }, 120); });
  const mq = matchMedia('(prefers-color-scheme: dark)'); if (mq.addEventListener) mq.addEventListener('change', syncTheme);
  new MutationObserver(syncTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if (document.fonts) {
    // web fonts arrive late (their stylesheets are injected so they never block the page): re-measure then
    const refit = () => { fitNav(); const m = $('#map'); if (m && (Math.round(m.clientWidth) !== lastMapW || m.classList.contains('vertical'))) drawMap(); layoutSegs(); onScroll(); };
    document.fonts.ready.then(refit);
    if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', refit);
  }
  document.documentElement.classList.add('ready');
}
boot();
})();
