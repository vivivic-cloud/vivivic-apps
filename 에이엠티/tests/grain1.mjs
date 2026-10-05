// 결방향 — 사장님 말씀(10-02)
// 「부속의 도면에는 만약 결방향이 설정되어 있다면 올바른 결방향을 표현해 주어야 합니다」
// 제일 무서운 자리: 배치도가 돌려 앉혔는데 부속 그림의 결이 딴 쪽이면 현장에서 반대로 자른다.
// 그래서 **그리는 쪽과 앉히는 쪽이 같은 값을 보는지**를 숫자로 잰다.
// 자료는 진짜 원장을 쓴다 — 결보호 'O'(결 지킴)·'X'(돌려도 됨) 줄을 거기서 골라 온다.
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

// 원장에서 결보호 'O' 둘과 'X' 하나를 골라 둔다 (행 번호 그대로 카드에 쓴다)
const h = L[0], i결 = h.indexOf('결보호'), iW = h.indexOf('재단W'), iD = h.indexOf('재단D'), i이름 = h.indexOf('부속명');
const 고르기 = (조건) => {
  for (let ri = 1; ri < L.length; ri++) {
    const r = L[ri]; if (!r) continue;
    const g = String(r[i결] == null ? '' : r[i결]).trim();
    const w = parseFloat(r[iW]) || 0, d = parseFloat(r[iD]) || 0;
    if (w > 0 && d > 0 && 조건(g, w, d)) return { ri, 결: g, w, d, 이름: r[i이름] };
  }
  return null;
};
const 결지킴가로 = 고르기((g, w, d) => g.toUpperCase() === 'O' && w > d);
const 결지킴세로 = 고르기((g, w, d) => g.toUpperCase() === 'O' && d > w);
const 결없음     = 고르기((g) => g.toUpperCase() === 'X');
console.log('■ 원장에서 고른 줄: ' + JSON.stringify({ 결지킴가로, 결지킴세로, 결없음 }));
if (!결지킴가로 || !결없음) { console.log('grain1   FAIL (원장에서 고를 줄이 없다)'); process.exit(1); }

const 차리기 = ({ 것들, L }) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장', '발주', '도면', '차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  // 원장을 화면이 쓰는 그 자리에 그대로 넣는다 — 결보호는 거기서 읽힌다
  currentFullData.length = 0; L.forEach(r => currentFullData.push(r));
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
  const 카드들 = 것들.filter(Boolean).map((q, n) => ({
    cKey: 'CUT_' + (n + 1), nm: q.이름 || ('부속' + (n + 1)), pm: 8, dq: 44,
    orderCode: '조혼-20261002-01', orderKey: 'd1', orderName: '(KRW) 알렉스 800 높은 수납장 올화이트',
    plateName: 'PB-18T', coating: '양면', finish: '화이트', rw: q.w, rd: q.d,
    isCuttingCard: true, sheets: 5, perSheet: 2, orderIdNum: 1401, pRowIndex: q.ri,
    boardW: 2440, boardH: 1220,
    boardParts: [{ lp: 0, tp: 0, wp: q.w / 2440, hp: q.d / 1220, bg: '#ffffff', dw: String(q.w), dh: String(q.d) }],
    coveredOrderIds: [1401] }));
  window._woBoringParts[sk] = 카드들;
  window._woBoring[sk] = { pool: [], AMT: 카드들.map(q => q.cKey) };
  window.__카드들 = 카드들;
  document.getElementById('__무대')?.remove();
  const 무대 = document.createElement('div');
  무대.id = '__무대'; 무대.className = 'wo-boring-mac-col';
  무대.style.cssText = 'position:fixed;left:0;top:0;right:0;z-index:99999;background:#f6f7f9;padding:10px;box-sizing:border-box;';
  무대.innerHTML = 카드들.map(q => _woPlacedCardHtml(q, q.cKey, sk, 'AMT', _woGetOrderColorMap(sk), ''))
                        .join('<div style="height:10px"></div>');
  document.body.appendChild(무대);
};

const 재기 = () => [...document.querySelectorAll('#__무대 .wo-boring-placed-card')].map((c, n) => {
  const p = window.__카드들[n];
  const svg = c.querySelector('.woc-부속 svg');
  const 금 = svg ? svg.querySelector('path.결금') : null;
  // 그린 금이 어느 쪽으로 가는가 — d 가 H(가로) 면 가로결, V(세로) 면 세로결
  const d = 금 ? (금.getAttribute('d') || '') : '';
  const 그린결 = !금 ? null : (/H\d/.test(d) ? '가로' : (/V\d/.test(d) ? '세로' : '?'));
  // 앉히는 쪽이 보는 값 — 배치도가 쓰는 그 셈을 그대로 부른다
  const 앉힘 = window._앉힐방향 ? window._앉힐방향(p.rw, p.rd, window.__결값들[n], 2440, 1220, 5, 4.5) : null;
  return {
    이름: p.nm, 치수: p.rw + '×' + p.rd, 결보호: window.__결값들[n],
    금있나: !!금, 그린결, 금수: 금 ? (d.match(/M/g) || []).length : 0,
    선색: 금 ? 금.getAttribute('stroke') : '', 선굵기: 금 ? parseFloat(금.getAttribute('stroke-width')) : null,
    앉힌돌림: 앉힘 ? 앉힘.돌림 : null,
    조각: svg ? svg.querySelectorAll('rect').length : -1,
    글: svg ? svg.outerHTML.length : 0,
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
  await p.evaluate(차리기, { 것들: [결지킴가로, 결지킴세로, 결없음], L });
  await p.evaluate(v => { window.__결값들 = v; },
    [결지킴가로, 결지킴세로, 결없음].filter(Boolean).map(q => q.결));
  await p.waitForTimeout(400);
  const 본 = await p.evaluate(재기);
  보기[폭] = { 본, errs, 넘침: await p.evaluate(() => document.documentElement.scrollWidth) };
  console.log('════ ' + 폭 + 'px ════');
  본.forEach(c => console.log('  ' + JSON.stringify(c)));
  await p.setViewportSize({ width: 폭, height: 폭 === 375 ? 1400 : 1200 });
  await p.waitForTimeout(250);
  await p.screenshot({ path: 그림칸 + '/grain-' + 폭 + '-결방향.png' });
  await p.close(); await ctx.close();
}

const W = 보기[1280].본;
const 지킴 = W.filter(c => c.결보호.toUpperCase() === 'O');
const 없음 = W.filter(c => c.결보호.toUpperCase() !== 'O');

판('① 결보호가 「O」 인 부속에만 결금이 그려진다',
   지킴.length >= 1 && 지킴.every(c => c.금있나 === true) && 없음.every(c => c.금있나 === false),
   W.map(c => c.결보호 + ':' + c.금있나).join(' · '));
판('① 결보호가 「X」·빈칸인 부속은 아무것도 안 그린다 (지금과 같다)',
   없음.every(c => c.금있나 === false && c.금수 === 0), JSON.stringify(없음.map(c => [c.이름, c.금있나])));
판('② 그린 결이 배치도가 앉힌 방향과 같다 (돌려 앉혔으면 세로, 아니면 가로)',
   지킴.every(c => c.앉힌돌림 === false ? c.그린결 === '가로' : c.그린결 === '세로'),
   지킴.map(c => c.이름 + ' ' + c.치수 + ' 돌림=' + c.앉힌돌림 + ' → ' + c.그린결).join(' · '));
판('② 결보호 「O」 는 배치도가 절대 안 돌린다 (두 쪽이 같은 값을 본다)',
   지킴.every(c => c.앉힌돌림 === false), 지킴.map(c => c.이름 + ' 돌림 ' + c.앉힌돌림).join(' · '));
판('③ 결금은 얇은 회색이다 (CAD 꼴을 안 깬다)',
   지킴.every(c => c.선굵기 <= 1 && /^#b7b4af$/i.test(c.선색 || '')),
   지킴.map(c => c.선색 + ' ' + c.선굵기).join(' · '));
판('③ 결금을 조각(rect)으로 만들지 않는다', W.every(c => c.조각 === 0),
   W.map(c => c.조각).join(','));
판('④ 폰에서도 똑같이 그려진다',
   보기[375].본.map(c => c.금있나 + '/' + c.그린결).join(',') === W.map(c => c.금있나 + '/' + c.그린결).join(','),
   보기[375].본.map(c => c.금있나 + '/' + c.그린결).join(','));
판('④ 375px 가로 넘침 없다', 보기[375].넘침 <= 375, 보기[375].넘침 + 'px');
판('페이지오류 없음', 보기[375].errs.length === 0 && 보기[1280].errs.length === 0,
   String(보기[375].errs.length + 보기[1280].errs.length));

await b.close();
console.log(실패 === 0 ? 'grain1   OK' : 'grain1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
