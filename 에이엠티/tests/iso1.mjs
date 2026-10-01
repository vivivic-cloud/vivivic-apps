// 재단 도면 누운 꼴 — 사장님 말씀(10-01) 「현재카드에 (아이소메트릭) 표현이 어렵나?」
// 카드는 늘리지 않는다. 그 도면칸 안에서 30도로 눕기만 한다.
// 조각이 앉은 자리는 c65b6be 와 한 자도 달라지면 안 되고,
// 「편집」 으로 크게 띄우는 도면은 반듯한 채로 남아야 한다.
import { 브라우저열기, devices, 서버, 자재, 그림칸 as 그림칸자리 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const 그림칸 = 그림칸자리();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const URL = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const b = await 브라우저열기();
let 실패 = 0; const 판 = (n, t, v) => { if (!t) 실패++; console.log((t ? '  OK  ' : '  FAIL') + '  ' + n + '   → ' + v); };

// c65b6be 에서 잰 그 도면 그대로 — 조각 셋
const 조각들 = [
  { lp: 0,    tp: 0,   wp: 0.3279, hp: 0.6557, bg: '#ffffff', dw: '800', dh: '800' },
  { lp: 0.33, tp: 0,   wp: 0.3279, hp: 0.6557, bg: '#ffffff', dw: '800', dh: '800' },
  { lp: 0.70, tp: 0.1, wp: 0.1967, hp: 0.3278, bg: '#f5f5f4', dw: '480', dh: '400' },
];
// c65b6be 에서 잰 값 (바뀌면 셈이 바뀐 것이다)
const 자리기준 = [[0, 0, 800.1, 800], [805.2, 0, 800.1, 800], [1708, 122, 479.9, 399.9]];

const 차리기 = (조각들) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장', '발주', '도면', '차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.db = {}; window.storage = {};
  window.fbFirestore = { doc: (db, ...a) => ({ p: a.join('/'), id: a[a.length - 1] }),
    updateDoc: async () => {}, setDoc: async () => {}, deleteDoc: async () => {}, addDoc: async () => ({ id: 'x' }),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  const sk = '2026-10-01-재단';
  confirmedOrders.length = 0;
  confirmedOrders.push({ idNum: 1401, docId: 'd1', orderCode: '조혼-20261001-01',
    displayName: '(KRW) 알렉스 800 높은 수납장 올화이트', orderQty: 44, amtTimeline: true,
    partInfoMap: {}, partStarted: {}, partCompletions: {}, deliveryDate: '2026-10-30' });
  const 한장 = { cKey: 'CUT_1', nm: '도어', pm: 8, dq: 44, orderCode: '조혼-20261001-01',
    orderKey: 'd1', orderName: '(KRW) 알렉스 800 높은 수납장 올화이트', plateName: 'PB-18T', coating: '양면',
    finish: '화이트', rw: 800, rd: 800, isCuttingCard: true, sheets: 5, perSheet: 2,
    orderIdNum: 1401, pRowIndex: 11, boardW: 2440, boardH: 1220,
    boardParts: 조각들, coveredOrderIds: [1401] };
  window.__sk = sk; window.__한장 = 한장;
  window._woBoringParts[sk] = [한장];
  window._woBoring[sk] = { pool: [], AMT: ['CUT_1'] };
  const 무대 = document.createElement('div');
  무대.id = '__무대'; 무대.className = 'wo-boring-mac-col';
  무대.style.cssText = 'position:fixed;left:0;top:0;right:0;z-index:99999;background:#f6f7f9;padding:10px;box-sizing:border-box;';
  무대.innerHTML = _woPlacedCardHtml(한장, 'CUT_1', sk, 'AMT', _woGetOrderColorMap(sk), '');
  document.body.appendChild(무대);
};

// 누운 것을 가려내는 자 — 30도 등각이면 matrix 의 a·b 가 cos30·sin30 이다
const 재기 = () => {
  const 카드 = document.querySelector('#__무대 .wo-boring-placed-card');
  const svg  = 카드.querySelector('svg');
  const 칸   = svg.getBoundingClientRect();
  const 눕힘 = [...svg.querySelectorAll('g')].find(g => /matrix\(/.test(g.getAttribute('transform') || ''));
  let 각 = null, 같이누움 = null, 삐짐 = null;
  if (눕힘) {
    const m = /matrix\(\s*([-\d.]+)[ ,]+([-\d.]+)/.exec(눕힘.getAttribute('transform'));
    각 = m ? [Math.round(+m[1] * 1000) / 1000, Math.round(+m[2] * 1000) / 1000] : null;
    같이누움 = 눕힘.querySelectorAll('rect').length === svg.querySelectorAll('rect').length
            && [...눕힘.querySelectorAll('path')].some(e => /url\(#/.test(e.getAttribute('fill') || ''));
    const r = 눕힘.getBoundingClientRect();
    삐짐 = Math.round(Math.max(0, 칸.left - r.left, r.right - 칸.right, 칸.top - r.top, r.bottom - 칸.bottom));
  }
  return {
    조각: [...svg.querySelectorAll('rect')].map(e => [
      +(+e.getAttribute('x')).toFixed(1), +(+e.getAttribute('y')).toFixed(1),
      +(+e.getAttribute('width')).toFixed(1), +(+e.getAttribute('height')).toFixed(1)]),
    조각칠: [...svg.querySelectorAll('rect')].map(e => e.getAttribute('fill')),
    조각선: [...svg.querySelectorAll('rect')].map(e => e.getAttribute('stroke') + ' ' + e.getAttribute('stroke-width')),
    누움: !!눕힘, 각, 같이누움, 삐짐,
    그늘: 눕힘 ? (/filter=/.test(svg.innerHTML) || /filter:/.test(눕힘.getAttribute('style') || '')) : false,
    도면폭: Math.round(칸.width), 도면높이: Math.round(칸.height),
    카드높이: Math.round(카드.getBoundingClientRect().height),
    단추: [...카드.querySelectorAll('button')].map(e => {
      const q = e.getBoundingClientRect(); const af = getComputedStyle(e, '::after');
      return Math.max(Math.round(q.height), parseFloat(af.height) || 0); }),
    문서가로: document.documentElement.scrollWidth };
};

// 반듯한 도면(눕히기 전 꼴)을 같은 폭에 그려 높이를 견준다 — 카드가 늘어났는지 보는 자
const 반듯재기 = () => {
  const 카드 = document.querySelector('#__무대 .wo-boring-placed-card');
  const 그림 = 카드.querySelector('.woc-그림') || 카드;
  const 칸 = document.createElement('div');
  칸.className = 'woc-그림';          // 카드와 같은 칸에 넣어야 같은 자로 잰다(max-height 132px)
  칸.style.cssText = 'position:fixed;left:-9999px;top:0;width:' + Math.round(그림.getBoundingClientRect().width) + 'px;';
  칸.innerHTML = _woCuttingDiagramSvg(window.__한장);   // 기본값 = 반듯한 꼴
  document.body.appendChild(칸);
  const r = 칸.querySelector('svg').getBoundingClientRect();
  const 값 = { 폭: Math.round(r.width), 높이: Math.round(r.height),
               누움: /matrix\(/.test(칸.innerHTML) };
  칸.remove();
  return 값;
};

const ctx = await b.newContext({ ...devices['iPhone 12'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
await ctx.route('https://cdn.tailwindcss.com*', r => r.fulfill({ status: 200, contentType: 'application/javascript',
  body: 'document.write(' + JSON.stringify('<style>' + CSS + '</style>') + ');' }));
for (const [무늬, 길] of [['https://cdn.sheetjs.com/**', 'node_modules/xlsx/dist/xlsx.full.min.js'],
                          ['https://cdn.jsdelivr.net/npm/sortablejs**', 'node_modules/sortablejs/Sortable.min.js'],
                          ['https://cdn.jsdelivr.net/npm/gsap**', 'node_modules/gsap/dist/gsap.min.js']])
  await ctx.route(무늬, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: readFileSync(HERE + '/' + 길, 'utf-8') }));
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1300);
await p.evaluate(차리기, 조각들); await p.waitForTimeout(400);
const 본 = await p.evaluate(재기);
const 반듯 = await p.evaluate(반듯재기);
console.log('■ 카드 안 도면: ' + JSON.stringify(본));
console.log('■ 반듯한 도면: ' + JSON.stringify(반듯));

판('① 카드 안 도면이 30도로 눕는다',
   본.누움 === true && 본.각 !== null && Math.abs(본.각[0] - 0.866) < 0.01 && Math.abs(본.각[1] - 0.5) < 0.01,
   본.누움 ? ('matrix ' + JSON.stringify(본.각)) : '안 누웠다');
판('① 격자와 조각이 같이 눕는다 (바탕만 반듯하지 않다)', 본.같이누움 === true, String(본.같이누움));
판('① 아래로 부드러운 그늘이 진다', 본.그늘 === true, String(본.그늘));

판('② 조각이 앉은 자리·치수가 c65b6be 와 한 자도 안 다르다',
   JSON.stringify(본.조각) === JSON.stringify(자리기준), JSON.stringify(본.조각));
판('② 조각 바탕칠이 그대로다', 본.조각칠.join(',') === 조각들.map(q => q.bg).join(','), 본.조각칠.join(','));
판('② 조각 선이 얇고 또렷한 그대로다', 본.조각선.every(s => s === '#37352f 1'), 본.조각선.join(' · '));

판('③ 카드 길이가 안 변한다 (누운 도면과 반듯한 도면의 높이가 같다)',
   본.도면높이 === 반듯.높이 && 본.도면폭 === 반듯.폭,
   '누운 ' + 본.도면폭 + 'x' + 본.도면높이 + ' · 반듯 ' + 반듯.폭 + 'x' + 반듯.높이 + ' · 카드 ' + 본.카드높이 + 'px');
판('③ 누우면서 칸 밖으로 안 잘린다', 본.삐짐 !== null && 본.삐짐 <= 1, 본.삐짐 + 'px 삐져나감');

// ④ 크게 띄우는 도면은 반듯하다
const 큰것 = await p.evaluate(() => {
  window._집중도면크게(window.__한장);
  const e = document.getElementById('_집중도면큰것');
  const svg = e ? e.querySelector('svg') : null;
  const r = svg ? svg.getBoundingClientRect() : null;
  const 값 = { 떴나: !!svg,
    누움: svg ? [...svg.querySelectorAll('g')].some(g => /matrix\(/.test(g.getAttribute('transform') || '')) : null,
    조각: svg ? [...svg.querySelectorAll('rect')].map(x => [
      +(+x.getAttribute('x')).toFixed(1), +(+x.getAttribute('y')).toFixed(1),
      +(+x.getAttribute('width')).toFixed(1), +(+x.getAttribute('height')).toFixed(1)]) : [],
    폭: r ? Math.round(r.width) : 0 };
  e?.remove();
  return 값;
});
console.log('■ 크게 띄운 도면: ' + JSON.stringify(큰것));
판('④ 크게 띄우는 도면은 반듯하다 (재단 치수를 비뚤지 않게 읽는다)',
   큰것.떴나 === true && 큰것.누움 === false, JSON.stringify(큰것).slice(0, 120));
판('④ 크게 띄운 도면의 조각 자리도 그대로다',
   JSON.stringify(큰것.조각) === JSON.stringify(자리기준), JSON.stringify(큰것.조각));

판('⑤ 단추는 그대로 44px 이상이다', 본.단추.length >= 1 && 본.단추.every(h => h >= 44), JSON.stringify(본.단추));
판('⑤ 375px 가로 넘침 없다', 본.문서가로 <= 375, 본.문서가로 + 'px');

await p.screenshot({ path: 그림칸 + '/iso-375-누운도면.png' });
판('페이지오류 없음', errs.length === 0, String(errs.length));
await b.close();
console.log(실패 === 0 ? 'iso1   OK' : 'iso1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
