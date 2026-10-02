// 공정작업지시서 재단 도면 꼴 — 사장님 지시(10-01) 「참조 이미지처럼 … 안에 도면은 똑같잖아」.
// 바꾸는 것은 보이는 꼴뿐이다. 조각이 앉은 자리·치수는 한 자도 달라지면 안 된다.
// 그것을 여기서 자로 잰다.
import { 브라우저열기, devices, 서버, 자재, 그림칸 as 그림칸자리 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const 그림칸 = 그림칸자리();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const URL = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const b = await 브라우저열기();
let 실패 = 0; const 판 = (n, t, v) => { if (!t) 실패++; console.log((t ? '  OK  ' : '  FAIL') + '  ' + n + '   → ' + v); };

// 도면 조각 셋 — 1순위 둘과 자투리에 앉힌 곁조각 하나
const 조각들 = [
  { lp: 0,    tp: 0,   wp: 0.3279, hp: 0.6557, bg: '#ffffff', dw: '800', dh: '800' },
  { lp: 0.33, tp: 0,   wp: 0.3279, hp: 0.6557, bg: '#ffffff', dw: '800', dh: '800' },
  { lp: 0.70, tp: 0.1, wp: 0.1967, hp: 0.3278, bg: '#f5f5f4', dw: '480', dh: '400' },
];

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
  window.__sk = sk; window.__조각들 = 조각들;
  window._woBoringParts[sk] = [한장];
  window._woBoring[sk] = { pool: [], AMT: ['CUT_1'] };
  const 무대 = document.createElement('div');
  무대.id = '__무대'; 무대.className = 'wo-boring-mac-col';
  무대.style.cssText = 'position:fixed;left:0;top:0;right:0;z-index:99999;background:#f6f7f9;padding:10px;box-sizing:border-box;';
  무대.innerHTML = _woPlacedCardHtml(한장, 'CUT_1', sk, 'AMT', _woGetOrderColorMap(sk), '');
  document.body.appendChild(무대);
};

const 재기 = () => {
  const 카드 = document.querySelector('#__무대 .wo-boring-placed-card');
  const svg  = 카드 ? 카드.querySelector('.woc-그림 svg') : null;   // 재단배치도 (가운데 부속판이 아니다)
  if (!svg) return { svg: false };
  const cs = getComputedStyle(svg);
  const r  = svg.getBoundingClientRect();
  const vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
  const 조각 = [...svg.querySelectorAll('rect')].map(e => ({
    x: +(+e.getAttribute('x')).toFixed(1), y: +(+e.getAttribute('y')).toFixed(1),
    w: +(+e.getAttribute('width')).toFixed(1), h: +(+e.getAttribute('height')).toFixed(1),
    바탕: e.getAttribute('fill'), 선빛: e.getAttribute('stroke'),
    선굵기: parseFloat(e.getAttribute('stroke-width')),
    안눌림: e.getAttribute('vector-effect') === 'non-scaling-stroke' }));
  const 무늬 = [...svg.querySelectorAll('defs pattern')];
  const 격자선 = 무늬.length ? [...무늬[0].querySelectorAll('path,line')].map(e => ({
    선빛: e.getAttribute('stroke'), 선굵기: parseFloat(e.getAttribute('stroke-width')) })) : [];
  const 바탕칠 = [...svg.querySelectorAll('path')].filter(e => /url\(#/.test(e.getAttribute('fill') || ''));
  // 기대값 — 코드와 무관하게 조각 비율에서 그대로 셈한다
  const BW = 2440, BD = 1220;
  const cropX = Math.min(...window.__조각들.map(q => q.lp)) * BW;
  const cropY = Math.min(...window.__조각들.map(q => q.tp)) * BD;
  const 기대 = window.__조각들.map(q => ({
    x: +(q.lp * BW - cropX).toFixed(1), y: +(q.tp * BD - cropY).toFixed(1),
    w: +Math.max(2, q.wp * BW).toFixed(1), h: +Math.max(2, q.hp * BD).toFixed(1) }));
  return { svg: true, 조각, 기대, 격자선, 무늬수: 무늬.length, 바탕칠수: 바탕칠.length,
    바탕: cs.backgroundColor, 그림자: cs.boxShadow, 테두리: cs.borderTopWidth + ' ' + cs.borderTopColor,
    둥금: parseFloat(cs.borderRadius),
    보기: Math.round(vb[2]) + 'x' + Math.round(vb[3]),
    폭: Math.round(r.width), 높이: Math.round(r.height),
    카드바탕: getComputedStyle(카드).backgroundColor,
    카드둥금: parseFloat(getComputedStyle(카드).borderRadius),
    단추: [...카드.querySelectorAll('button')].map(e => {
      const q = e.getBoundingClientRect(); const af = getComputedStyle(e, '::after');
      return { 글: e.textContent.trim().slice(0, 6),
               닿는높이: Math.max(Math.round(q.height), parseFloat(af.height) || 0) }; }),
    문서가로: document.documentElement.scrollWidth };
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
console.log('■ 잰 값: ' + JSON.stringify(본).slice(0, 900));

판('① 카드에 재단 도면이 그려진다', 본.svg === true, String(본.svg));

// ── 안에 든 도면은 똑같아야 한다 ─────────────────────────────────
const 같나 = JSON.stringify(본.조각.map(q => ({ x: q.x, y: q.y, w: q.w, h: q.h }))) === JSON.stringify(본.기대);
판('① 조각이 앉은 자리·치수가 한 자도 안 바뀐다',
   본.조각.length === 조각들.length && 같나,
   본.조각.length + '조각 · ' + JSON.stringify(본.조각.map(q => [q.x, q.y, q.w, q.h])));
판('① 조각 바탕칠(원장 색)은 그대로다',
   본.조각.map(q => q.바탕).join(',') === 조각들.map(q => q.bg).join(','),
   본.조각.map(q => q.바탕).join(','));
판('① 보이는 칸(viewBox)이 그대로다 — 좌·상 기준선까지만 잘린다', 본.보기 === '2440x1220', 본.보기);

// ── 꼴 (사장님 스타일 가이드 2·3) ────────────────────────────────
판('② CAD 격자가 그려진다 (무늬 하나)', 본.무늬수 >= 1 && 본.바탕칠수 >= 1,
   '무늬 ' + 본.무늬수 + '개 · 격자 바탕 ' + 본.바탕칠수 + '칸');
판('② 격자선은 얇다 (1px 이하)', 본.격자선.length >= 1 && 본.격자선.every(q => q.선굵기 <= 1),
   JSON.stringify(본.격자선));
판('② 조각 선은 얇고 정교한 1px 다크 그레이다',
   본.조각.every(q => q.선굵기 <= 1 && q.안눌림 === true && /^#37352f$/i.test(q.선빛 || '')),
   본.조각.map(q => q.선빛 + ' ' + q.선굵기).join(' · '));
판('② 바탕은 연한 라이트 그레이다', /^rgb\(2[3-5][0-9], 2[3-5][0-9], 2[3-5][0-9]\)$/.test(본.바탕), 본.바탕);
판('③ 얇은 베젤(1px 테두리)이 둘린다', /^1px/.test(본.테두리) && 본.둥금 >= 3, 본.테두리 + ' · 둥금 ' + 본.둥금);
판('③ 아래로 부드러운 그림자가 진다', 본.그림자 !== 'none' && /rgba/.test(본.그림자), 본.그림자);

// ── 격자를 rect 로 만들면 조각 셈이 틀어진다 (worksvg1 이 조각을 센다)
판('③ 격자는 조각(rect)으로 만들지 않는다', 본.조각.length === 조각들.length,
   'rect ' + 본.조각.length + '개 = 조각 ' + 조각들.length + '개');

// ── 도면 밖은 안 건드린다 ────────────────────────────────────────
판('④ 카드는 그대로다 (흰 바탕 · 둥근 모서리)',
   본.카드바탕 === 'rgb(255, 255, 255)' && 본.카드둥금 >= 8 && 본.카드둥금 <= 14,
   본.카드바탕 + ' · ' + 본.카드둥금 + 'px');
판('④ 단추는 그대로 44px 이상이다', 본.단추.length >= 1 && 본.단추.every(q => q.닿는높이 >= 44),
   JSON.stringify(본.단추));
판('④ 375px 가로 넘침 없다', 본.문서가로 <= 375, 본.문서가로 + 'px');

await p.screenshot({ path: 그림칸 + '/cad-375-재단도면.png' });
판('페이지오류 없음', errs.length === 0, String(errs.length));
await b.close();
console.log(실패 === 0 ? 'cad1   OK' : 'cad1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
