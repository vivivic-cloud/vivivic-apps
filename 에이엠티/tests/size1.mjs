// 부속 도면 — 사장님 말씀(10-03)
// 「공정작업지시서 재단카드의 재단된 부속의 도면안에 격자무늬 삭제하고
//   재단하는 사이즈를 해당변에맞게 표기해줘」
// ⚠ 제일 무서운 자리: 도면이 30도로 누워 있어 화면의 가로변이 W 가 아니다.
//   그래서 숫자가 어느 변에 붙었는지를 **화면에 그려진 네 귀로** 재서 가린다.
//   (틀리면 현장에서 거꾸로 자른다.)
import { 브라우저열기, devices, 서버, 자료, 자재, 그림칸 as 그림칸자리 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const 그림칸 = 그림칸자리();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const URL = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const L = await 자료('원장');
const b = await 브라우저열기();
let 실패 = 0; const 판 = (n, t, v) => { if (!t) 실패++; console.log((t ? '  OK  ' : '  FAIL') + '  ' + n + '   → ' + v); };

// 가로로 긴 것 · 세로로 긴 것 · 정사각에 가까운 것
const 크기들 = [[1984, 594], [748, 400], [500, 1100], [800, 790]];
// 결금이 그대로인지 보려면 결보호 'O' 줄이 하나 필요하다
const h = L[0], i결 = h.indexOf('결보호');
let 결행 = null;
for (let ri = 1; ri < L.length; ri++) {
  const r = L[ri]; if (!r) continue;
  if (String(r[i결] == null ? '' : r[i결]).trim().toUpperCase() === 'O') { 결행 = ri; break; }
}
console.log('■ 결보호 O 줄: ' + 결행);

const 차리기 = ({ 크기들, L, 결행 }) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장', '발주', '도면', '차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  currentFullData.length = 0; L.forEach(r => currentFullData.push(r));
  window.db = {}; window.storage = {};
  window.fbFirestore = { doc: (db, ...a) => ({ p: a.join('/'), id: a[a.length - 1] }),
    updateDoc: async () => {}, setDoc: async () => {}, deleteDoc: async () => {}, addDoc: async () => ({ id: 'x' }),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  const sk = '2026-10-03-재단';
  confirmedOrders.length = 0;
  confirmedOrders.push({ idNum: 1401, docId: 'd1', orderCode: '조혼-20261003-01',
    displayName: '(KRW) 알렉스 800 높은 수납장 올화이트', orderQty: 44, amtTimeline: true,
    partInfoMap: {}, partStarted: {}, partCompletions: {}, deliveryDate: '2026-10-30' });
  const 것들 = 크기들.map(([w, d], i) => ({
    cKey: 'CUT_' + (i + 1), nm: '부속' + (i + 1), pm: 8, dq: 44, orderCode: '조혼-20261003-01',
    orderKey: 'd1', orderName: '(KRW) 알렉스 800 높은 수납장 올화이트', plateName: 'PB-18T', coating: '양면',
    finish: '화이트', rw: w, rd: d, isCuttingCard: true, sheets: 5, perSheet: 2, orderIdNum: 1401,
    // 마지막 한 장만 결보호 'O' 줄에 걸어 결금이 그대로인지 본다
    pRowIndex: (i === 크기들.length - 1) ? 결행 : null,
    boardW: 2440, boardH: 1220,
    boardParts: [{ lp: 0, tp: 0, wp: Math.min(0.9, w / 2440), hp: Math.min(0.9, d / 1220),
                   bg: '#ffffff', dw: String(w), dh: String(d) }],
    coveredOrderIds: [1401] }));
  window._woBoringParts[sk] = 것들;
  window._woBoring[sk] = { pool: [], AMT: 것들.map(q => q.cKey) };
  window.__크기들 = 크기들;
  document.getElementById('__무대')?.remove();
  const 무대 = document.createElement('div');
  무대.id = '__무대'; 무대.className = 'wo-boring-mac-col';
  무대.style.cssText = 'position:fixed;left:0;top:0;right:0;z-index:99999;background:#f6f7f9;padding:10px;box-sizing:border-box;';
  무대.innerHTML = 것들.map(q => _woPlacedCardHtml(q, q.cKey, sk, 'AMT', _woGetOrderColorMap(sk), ''))
                      .join('<div style="height:10px"></div>');
  document.body.appendChild(무대);
};

// 화면에 **그려진** 네 귀로 어느 변이 W 변인지 가린다 — 내 셈을 안 믿고 그림을 믿는다
const 재기 = () => [...document.querySelectorAll('#__무대 .wo-boring-placed-card')].map((c, n) => {
  const [W, H] = window.__크기들[n];
  const svg = c.querySelector('.woc-부속 svg');
  const 배치 = c.querySelector('.woc-그림 svg');
  if (!svg) return { 없음: true };
  const g = [...svg.querySelectorAll('g')].find(x => /matrix\(/.test(x.getAttribute('transform') || ''));
  const m = g ? g.getScreenCTM() : null;
  const 점 = (x, y) => { const p = svg.createSVGPoint(); p.x = x; p.y = y;
                         const q = p.matrixTransform(m); return { x: q.x, y: q.y }; };
  const 네귀 = m ? { 영: 점(0, 0), W끝: 점(W, 0), D끝: 점(0, H) } : null;
  const 가온 = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const W변 = 네귀 ? 가온(네귀.영, 네귀.W끝) : null;      // 재단W 가 놓인 변
  const D변 = 네귀 ? 가온(네귀.영, 네귀.D끝) : null;      // 재단D 가 놓인 변
  // 글은 이제 도면 밖(HTML)에 얹는다 — 크기를 CSS 가 쥐어야 부속마다 안 달라진다
  const 칸 = c.querySelector('.woc-부속');
  const 판 = c.querySelector('.woc-부속 .부속판');
  const 글들 = [...c.querySelectorAll('.woc-부속 .부속치수')].map(t => {
    const r = t.getBoundingClientRect();
    return { 글: (t.textContent || '').trim(), x: r.left + r.width / 2, y: r.top + r.height / 2,
             w: Math.round(r.width), h: Math.round(r.height),
             글자: Math.round(parseFloat(getComputedStyle(t).fontSize)),
             기울었나: (() => { const m = getComputedStyle(t).transform || 'none';
               if (m === 'none') return false;
               const v = m.match(/matrix\(([-\d.]+), ([-\d.]+), ([-\d.]+), ([-\d.]+)/);
               return v ? !(Math.abs(+v[1] - 1) < .01 && Math.abs(+v[2]) < .01 && Math.abs(+v[3]) < .01) : false; })(),
             칸밖: (() => { const s = 칸.getBoundingClientRect();
               return r.left < s.left - 0.5 || r.right > s.right + 0.5 || r.top < s.top - 0.5 || r.bottom > s.bottom + 0.5; })() };
  });
  // 그 변 가온에서 얼마나 떨어져 있나 — 판 지름을 1 로 본 몫
  const 지름 = 네귀 ? Math.hypot(네귀.W끝.x - 네귀.D끝.x, 네귀.W끝.y - 네귀.D끝.y) : 1;
  const 벗어남 = g => {
    if (!W변 || !D변) return null;
    const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    return Math.round(Math.min(d(g, W변), d(g, D변)) / 지름 * 100) / 100;
  };
  const 가까운변 = g => {
    if (!W변 || !D변) return '?';
    const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    return d(g, W변) < d(g, D변) ? 'W변' : 'D변';
  };
  return {
    치수: W + '×' + H,
    격자: svg.querySelectorAll('defs pattern').length,
    격자칠: [...svg.querySelectorAll('path')].filter(q => /url\(#amtcad/.test(q.getAttribute('fill') || '')).length,
    배치도격자: 배치 ? 배치.querySelectorAll('defs pattern').length : null,
    결금: svg.querySelectorAll('path.결금').length,
    결금수: (() => { const e = svg.querySelector('path.결금');
                     return e ? ((e.getAttribute('d') || '').match(/M/g) || []).length : 0; })(),
    글수: 글들.length,
    판칸같나: (() => { if (!판) return null; const a = 판.getBoundingClientRect(), b2 = svg.getBoundingClientRect();
      return Math.abs(a.width - b2.width) <= 1 && Math.abs(a.height - b2.height) <= 1
          && Math.abs(a.left - b2.left) <= 1 && Math.abs(a.top - b2.top) <= 1; })(),
    글: 글들.map(t => ({ 글: t.글, 붙은변: 가까운변(t), 기울었나: t.기울었나, 칸밖: t.칸밖,
                        h: t.h, 글자: t.글자, 벗어남: 벗어남(t) })),
    조각: svg.querySelectorAll('rect').length,
  };
});

const 보기 = {};
for (const [폭, opt] of [[375, { ...devices['iPhone 12'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }],
                         [1280, { viewport: { width: 1280, height: 950 } }]]) {
  const ctx = await b.newContext(opt);
  await ctx.route('https://cdn.tailwindcss.com*', r => r.fulfill({ status: 200, contentType: 'application/javascript',
    body: 'document.write(' + JSON.stringify('<style>' + CSS + '</style>') + ');' }));
  for (const [무늬, 길] of [['https://cdn.sheetjs.com/**', 'node_modules/xlsx/dist/xlsx.full.min.js'],
                            ['https://cdn.jsdelivr.net/npm/sortablejs**', 'node_modules/sortablejs/Sortable.min.js'],
                            ['https://cdn.jsdelivr.net/npm/gsap**', 'node_modules/gsap/dist/gsap.min.js']])
    await ctx.route(무늬, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: readFileSync(HERE + '/' + 길, 'utf-8') }));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1300);
  await p.evaluate(차리기, { 크기들, L, 결행 }); await p.waitForTimeout(500);
  const 본 = await p.evaluate(재기);
  보기[폭] = { 본, errs, 넘침: await p.evaluate(() => document.documentElement.scrollWidth) };
  console.log('════ ' + 폭 + 'px ════');
  본.forEach(c => console.log('  ' + JSON.stringify(c)));
  await p.setViewportSize({ width: 폭, height: 폭 === 375 ? 1600 : 1400 });
  await p.waitForTimeout(250);
  await p.screenshot({ path: 그림칸 + '/size-' + 폭 + '-치수표기.png' });
  await p.close(); await ctx.close();
}

for (const 폭 of [375, 1280]) {
  const 본 = 보기[폭].본;
  판(`① ${폭}px — 부속 도면에 격자무늬가 없다`,
     본.every(c => c.격자 === 0 && c.격자칠 === 0), 본.map(c => c.격자 + '/' + c.격자칠).join(' · '));
  판(`① ${폭}px — 재단배치도의 격자는 그대로 있다 (거기는 안 건드렸다)`,
     본.every(c => c.배치도격자 === 1), 본.map(c => c.배치도격자).join(','));
  판(`① ${폭}px — 결금은 그대로다 (결보호 O 인 부속에 일곱 줄)`,
     본[본.length - 1].결금 === 1 && 본[본.length - 1].결금수 === 7
     && 본.slice(0, -1).every(c => c.결금 === 0),
     본.map(c => c.결금수).join(','));
  판(`② ${폭}px — 두 변에 숫자가 하나씩 붙는다`,
     본.every(c => c.글수 === 2), 본.map(c => c.글수).join(','));
  판(`② ${폭}px — W 는 W 변에, D 는 D 변에 붙는다 (그려진 네 귀로 쟀다)`,
     본.every((c, i) => {
       const [W, H] = 크기들[i];
       const w글 = c.글.find(t => t.글.replace(/[^0-9]/g, '') === String(W));
       const d글 = c.글.find(t => t.글.replace(/[^0-9]/g, '') === String(H));
       return w글 && d글 && w글.붙은변 === 'W변' && d글.붙은변 === 'D변';
     }),
     본.map((c, i) => 크기들[i].join('×') + ' → ' + c.글.map(t => t.글 + '@' + t.붙은변).join(' ')).join(' · '));
  판(`③ ${폭}px — 글씨가 안 기울었다 (누운 틀 밖에서 똑바로)`,
     본.every(c => c.글.every(t => t.기울었나 === false)),
     본.map(c => c.글.map(t => t.기울었나).join('/')).join(' · '));
  판(`③ ${폭}px — 글씨가 칸 밖으로 안 잘린다`,
     본.every(c => c.글.every(t => t.칸밖 === false)),
     본.map(c => c.글.map(t => t.칸밖).join('/')).join(' · '));
  판(`③ ${폭}px — 글자 크기가 부속마다 같다 (제멋대로가 아니다)`,
     (() => { const 다 = 본.flatMap(c => c.글.map(t => t.글자));
              return 다.length > 0 && 다.every(v => v === 다[0]); })(),
     본.map((c, i) => 크기들[i].join('×') + ' ' + c.글.map(t => t.글자 + 'px').join('/')).join(' · '));
  판(`③ ${폭}px — 폰에서 읽힌다 (13px 이상)`,
     본.every(c => c.글.every(t => t.글자 >= 13)), 본.map(c => c.글.map(t => t.글자).join('/')).join(' · '));
  판(`③ ${폭}px — 글이 제 변 가온 가까이에 선다 (판 지름의 30% 안)`,
     본.every(c => c.글.every(t => t.벗어남 != null && t.벗어남 <= 0.3)),
     본.map((c, i) => 크기들[i].join('×') + ' ' + c.글.map(t => t.벗어남).join('/')).join(' · '));
  판(`③ ${폭}px — 도면 안에 rect 를 안 만든다`, 본.every(c => c.조각 === 0), 본.map(c => c.조각).join(','));
}
판('375px 가로 넘침 없다', 보기[375].넘침 <= 375, 보기[375].넘침 + 'px');
판('페이지오류 없음', 보기[375].errs.length === 0 && 보기[1280].errs.length === 0,
   String(보기[375].errs.length + 보기[1280].errs.length));

await b.close();
console.log(실패 === 0 ? 'size1   OK' : 'size1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
