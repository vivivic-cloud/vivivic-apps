// 도면 자리 — 사장님 말씀(10-02)
// 「재단될 부속을 표현해주는 도면들은 실제사이즈와 상관없이 부속카드의 현재위치에
//   일정공간을 동일하게 차지하는 도면이 되게 해주세요」
// 그리고 「작업된 제품을 보여주는 도면에 회색 뒷배경을 제거하고 재단할 사이즈의 도면만」
//   → 자리는 늘 같고(고정), 그 자리는 눈에 안 보인다(부속 그림의 상자를 없앤다).
// 부속 크기가 서로 다른 카드 다섯으로 잰다. 찌그러지면 치수를 잘못 읽으신다.
import { 브라우저열기, devices, 서버, 자재, 그림칸 as 그림칸자리 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const 그림칸 = 그림칸자리();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const URL = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const b = await 브라우저열기();
let 실패 = 0; const 판 = (n, t, v) => { if (!t) 실패++; console.log((t ? '  OK  ' : '  FAIL') + '  ' + n + '   → ' + v); };

// 아주 길쭉한 것 · 납작한 것 · 정사각 · 작은 것 · 큰 것
const 크기들 = [[1984, 594], [761, 370], [800, 800], [300, 280], [2200, 1000]];

const 차리기 = (크기들) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장', '발주', '도면', '차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.db = {}; window.storage = {};
  window.fbFirestore = { doc: (db, ...a) => ({ p: a.join('/'), id: a[a.length - 1] }),
    updateDoc: async () => {}, setDoc: async () => {}, deleteDoc: async () => {}, addDoc: async () => ({ id: 'x' }),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  const sk = '2026-10-02-재단';
  confirmedOrders.length = 0;
  confirmedOrders.push({ idNum: 1401, docId: 'd1', orderCode: '조혼-20261002-01',
    displayName: '(KRW) 알렉스 800 높은 수납장 올화이트', orderQty: 44, amtTimeline: true,
    partInfoMap: {}, partStarted: {}, partCompletions: {}, deliveryDate: '2026-10-30' });
  const 것들 = 크기들.map(([w, d], i) => ({
    cKey: 'CUT_' + (i + 1), nm: '부속' + (i + 1), pm: 8, dq: 44, orderCode: '조혼-20261002-01',
    orderKey: 'd1', orderName: '(KRW) 알렉스 800 높은 수납장 올화이트', plateName: 'PB-18T', coating: '양면',
    finish: '화이트', rw: w, rd: d, isCuttingCard: true, sheets: 5, perSheet: 2, orderIdNum: 1401,
    pRowIndex: 11 + i, boardW: 2440, boardH: 1220,
    boardParts: [{ lp: 0, tp: 0, wp: w / 2440, hp: d / 1220, bg: '#ffffff', dw: String(w), dh: String(d) },
                 { lp: w / 2440 + 0.01, tp: 0, wp: w / 2440, hp: d / 1220, bg: '#ffffff', dw: String(w), dh: String(d) }],
    coveredOrderIds: [1401] }));
  window._woBoringParts[sk] = 것들;
  window._woBoring[sk] = { pool: [], AMT: 것들.map(q => q.cKey) };
  document.getElementById('__무대')?.remove();
  const 무대 = document.createElement('div');
  무대.id = '__무대'; 무대.className = 'wo-boring-mac-col';
  무대.style.cssText = 'position:fixed;left:0;top:0;right:0;z-index:99999;background:#f6f7f9;padding:10px;box-sizing:border-box;';
  무대.innerHTML = 것들.map(q => _woPlacedCardHtml(q, q.cKey, sk, 'AMT', _woGetOrderColorMap(sk), ''))
                      .join('<div style="height:10px"></div>');
  document.body.appendChild(무대);
};

const 재기 = () => {
  const 잼 = e => { if (!e) return null; const r = e.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height) }; };
  return [...document.querySelectorAll('#__무대 .wo-boring-placed-card')].map(c => {
    const 부속칸 = c.querySelector('.woc-부속'), 도면칸 = c.querySelector('.woc-도면자리') || c.querySelector('.woc-그림');
    const 부속svg = c.querySelector('.woc-부속 svg'), 배치svg = c.querySelector('.woc-그림 svg');
    const 결 = e => { if (!e) return null;
      const r = e.getBoundingClientRect(); const vb = (e.getAttribute('viewBox') || '').split(/\s+/).map(Number);
      return { 그린결: Math.round(r.width / r.height * 1000) / 1000,   // 재는 값은 안 반올림한 폭·높이로 낸다
               참결: vb.length === 4 ? Math.round(vb[2] / vb[3] * 1000) / 1000 : null,
               w: Math.round(r.width), h: Math.round(r.height) }; };
    const 꾸밈 = e => { if (!e) return null; const s = getComputedStyle(e);
      return { 바탕: s.backgroundColor, 테: s.borderTopWidth + ' ' + s.borderTopStyle, 그늘: s.boxShadow !== 'none' }; };
    return {
      이름: (c.querySelector('.woc-이름') || {}).textContent || '',
      부속칸: 잼(부속칸), 도면칸: 잼(도면칸),
      부속결: 결(부속svg), 배치결: 결(배치svg),
      부속꾸밈: 꾸밈(부속svg),
      카드높이: Math.round(c.getBoundingClientRect().height),
      줄수: (c.querySelector('.woc-글') || {}).childElementCount || 0,
    };
  });
};

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
  await p.evaluate(차리기, 크기들); await p.waitForTimeout(500);
  const 본 = await p.evaluate(재기);
  const 넘침 = await p.evaluate(() => document.documentElement.scrollWidth);
  보기[폭] = { 본, 넘침, errs };
  console.log('════ ' + 폭 + 'px ════');
  본.forEach((c, i) => console.log('  ' + 크기들[i].join('×') + '  ' + JSON.stringify({
    부속칸: c.부속칸, 도면칸: c.도면칸, 부속결: c.부속결, 배치결: c.배치결, 카드: c.카드높이 })));
  await p.setViewportSize({ width: 폭, height: 폭 === 375 ? 1700 : 1500 });
  await p.waitForTimeout(250);
  await p.screenshot({ path: 그림칸 + '/slot-' + 폭 + '-도면자리.png' });
  await p.close(); await ctx.close();
}

for (const 폭 of [375, 1280]) {
  const 본 = 보기[폭].본;
  const 부w = 본.map(c => c.부속칸 && c.부속칸.w), 부h = 본.map(c => c.부속칸 && c.부속칸.h);
  const 도w = 본.map(c => c.도면칸 && c.도면칸.w), 도h = 본.map(c => c.도면칸 && c.도면칸.h);
  판(`① ${폭}px — 부속 그림 칸이 카드마다 똑같은 자리를 쓴다`,
     부w.every(v => v && v === 부w[0]) && 부h.every(v => v && v === 부h[0]),
     '폭 ' + 부w.join(',') + ' · 높이 ' + 부h.join(','));
  판(`① ${폭}px — 재단배치도 칸도 카드마다 똑같다`,
     도w.every(v => v && v === 도w[0]) && 도h.every(v => v && v === 도h[0]),
     '폭 ' + 도w.join(',') + ' · 높이 ' + 도h.join(','));
  판(`① ${폭}px — 카드 높이가 부속 크기를 안 따라간다 (글 줄 수가 같다)`,
     본.every(c => c.카드높이 === 본[0].카드높이), 본.map(c => c.카드높이).join(','));
  판(`② ${폭}px — 도면이 안 찌그러진다 (그린 가로세로비 = 실제 치수비)`,
     본.every(c => c.부속결 && Math.abs(c.부속결.그린결 / c.부속결.참결 - 1) < 0.015)
     && 본.every(c => c.배치결 && Math.abs(c.배치결.그린결 / c.배치결.참결 - 1) < 0.015),
     본.map((c, i) => 크기들[i].join('×') + ' ' + c.부속결.그린결 + '/' + c.부속결.참결).join(' · '));
  판(`② ${폭}px — 도면이 제 칸 안에 들어간다 (넘치지 않는다)`,
     본.every(c => c.부속결.w <= c.부속칸.w + 1 && c.부속결.h <= c.부속칸.h + 1),
     본.map(c => c.부속결.w + 'x' + c.부속결.h + ' ≤ ' + c.부속칸.w + 'x' + c.부속칸.h).join(' · '));
  판(`③ ${폭}px — 부속 그림의 회색 상자(바탕·테두리)가 없다`,
     본.every(c => c.부속꾸밈 && /rgba\(0, 0, 0, 0\)|transparent/.test(c.부속꾸밈.바탕)
                  && /^0px|none$/.test(c.부속꾸밈.테.split(' ')[0] === '0px' ? '0px' : c.부속꾸밈.테)),
     JSON.stringify(본[0].부속꾸밈));
  판(`③ ${폭}px — 판 아래 그늘은 그대로 있다`, 본.every(c => c.부속꾸밈 && c.부속꾸밈.그늘 === false),
     '상자 그늘 ' + 본[0].부속꾸밈.그늘 + ' (판 그늘은 도면 안 filter 로 그린다)');
}
판('375px 가로 넘침 없다', 보기[375].넘침 <= 375, 보기[375].넘침 + 'px');
판('페이지오류 없음', 보기[375].errs.length === 0 && 보기[1280].errs.length === 0,
   String(보기[375].errs.length + 보기[1280].errs.length));

await b.close();
console.log(실패 === 0 ? 'slot1   OK' : 'slot1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
