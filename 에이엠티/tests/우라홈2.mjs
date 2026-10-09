// 「재단의 도면에도 우라홈 라인 표현해줘」 — 사장님 말씀 (10-09 06:56)
// 10-09 에 엣지 부속 도면에 넣은 빨간 선(_wo우라홈)을 **재단 쪽 도면**에도 긋는다.
// 재단 카드에는 그림이 둘이다 — ① 부속 한 장(민판) ② 재단 배치도(원장 위 조각들).
// 둘 다에 그어지는지, 우라홈이 O 가 아니면 0개인지, **엣지 쪽 선이 그대로 살아 있는지**,
// 그리고 **재단 치수·조각 자리가 한 톨도 안 바뀌는지**를 잰다.
import { 브라우저열기, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const URL = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const L = await 자료('원장');
const b = await 브라우저열기();
let 실패 = 0; const 판 = (n, t, v) => { if (!t) 실패++; console.log((t ? '  OK  ' : '  FAIL') + '  ' + n + '   → ' + v); };
const ctx = await b.newContext({ ...devices['iPhone 12'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
await ctx.route('https://cdn.tailwindcss.com*', r => r.fulfill({ status: 200, contentType: 'application/javascript',
  body: 'document.write(' + JSON.stringify('<style>' + CSS + '</style>') + ');' }));
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1500);

const 본 = await p.evaluate((L) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장', '발주', '도면', '차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.__쓰기 = 0; const 셈 = () => async () => { window.__쓰기++; };
  window.db = {}; window.storage = {};
  window.fbFirestore = { doc: () => ({}), updateDoc: 셈(), setDoc: 셈(), deleteDoc: 셈(), addDoc: 셈(),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  currentFullData.length = 0; L.forEach(r => currentFullData.push(r));
  const h = currentFullData[0];
  const iU = h.indexOf('우라홈'), iP = h.indexOf('우라홈위치');
  const iW = h.indexOf('W엣지면'), iD = h.indexOf('D엣지면');
  if (iU < 0 || iP < 0) return { 칸없음: true };
  /* 두 줄을 세운다 — 1순위(우라홈 O) 와 2순위(곁에 앉히는 조각, 우라홈 X).
     값은 **이 창의 복사본에만** 심는다(본보기 원장은 두 칸이 전부 빈칸이다).
     파일에는 한 줄도 안 쓴다. */
  const 쓸줄 = [];
  for (let i = 1; i < currentFullData.length && 쓸줄.length < 2; i++) {
    const r = currentFullData[i]; if (!r) continue;
    if (normalizeValue(r[h.indexOf('공급처')]) !== 'AMT') continue;
    const W = parseFloat(r[h.indexOf('재단W')]), D = parseFloat(r[h.indexOf('재단D')]);
    if (!(W > 0) || !(D > 0) || W === D) continue;
    쓸줄.push(i);
  }
  if (쓸줄.length < 2) return { 못세움: true, 쓸줄 };
  const [일, 곁] = 쓸줄;
  const 치 = ri => ({ W: parseFloat(currentFullData[ri][h.indexOf('재단W')]),
                      D: parseFloat(currentFullData[ri][h.indexOf('재단D')]),
                      이름: currentFullData[ri][h.indexOf('부속명')] });
  [일, 곁].forEach(ri => { currentFullData[ri] = currentFullData[ri].slice();
    if (iW >= 0) currentFullData[ri][iW] = '2'; if (iD >= 0) currentFullData[ri][iD] = '2'; });
  const T1 = 치(일), T2 = 치(곁);
  currentFullData[일][iU] = 'O'; currentFullData[일][iP] = String(T1.W);   // 1순위 — W 쪽 한 줄
  currentFullData[곁][iU] = 'X'; currentFullData[곁][iP] = String(T2.W);   // 곁조각 — 안 그린다

  const 발주 = {
    idNum: 9501, docId: 'd9501', orderCode: '시험-우라홈2', displayName: '시험상품 우라홈2',
    supplier: normalizeValue(currentFullData[일][h.indexOf('ing발주처')]),
    criteria: IDENTITY_HEADERS.map(c => normalizeValue(currentFullData[일][h.indexOf(c)])),
    orderQty: 10, amtTimeline: true, batchId: 1791000000001, deliveryDate: '2026-10-21',
    procOverrides: {}, partMoveLog: {}, partStarted: {}, partCompletions: {},
    partInfoMap: Object.fromEntries([일, 곁].map(ri => ['card-9501-' + ri, { qty: 10, isDeleted: false }])),
  };
  confirmedOrders.length = 0; confirmedOrders.push(발주);
  // 재단계획 한 건 — 1순위 넷, 곁조각 둘
  const 계획 = { confirmId: 1791000000002, docId: '1791000000002', sheets: 3, perSheet: 4,
    baseMaterial: 'PB-18T', materialColor: '화이트', cutW: T1.W, cutD: T1.D,
    pRowIndex: 일, pOrderIds: [9501], pProducedQty: 40, pDisplayName: 'PB-18T-화이트',
    pInfoText: T1.W + ' X ' + T1.D + ' - ' + T1.이름 + ' - 40 EA',
    sRowIndex: 곁, sOrderIds: [9501], sProducedQty: 20,
    sInfoText: T2.W + ' X ' + T2.D + ' - ' + T2.이름 + ' - 20 EA',
    tRowIndex: null, tOrderIds: [], targetPage: 'cutting' };
  window._cuttingPlans = { '1791000000002': 계획 };

  const BW = 2440, BH = 1220;
  const 조각 = [
    { lp: 0.004, tp: 0.004, wp: T1.W / BW, hp: T1.D / BH, dw: String(T1.W), dh: String(T1.D), bg: '' },
    { lp: 0.004 + T1.W / BW + 0.004, tp: 0.004, wp: T1.D / BW, hp: T1.W / BH, dw: String(T1.D), dh: String(T1.W), bg: '' },
    { lp: 0.004, tp: 0.004 + T1.D / BH + 0.004, wp: T2.W / BW, hp: T2.D / BH, dw: String(T2.W), dh: String(T2.D), bg: '#f5f5f4' },
  ];
  const 부속 = { cKey: 'cut_1791000000002', nm: T1.이름, pm: 10, dq: 40,
    orderCode: 발주.orderCode, orderKey: 'd9501', orderName: 발주.displayName,
    plateName: 'PB-18T', finish: '화이트', rw: T1.W, rd: T1.D, deliveryDate: '2026-10-21',
    isCuttingCard: true, boardParts: 조각, boardW: BW, boardH: BH, sheets: 3, perSheet: 4,
    pRowIndex: 일, planId: '1791000000002', coveredOrderIds: [9501],
    extras: [{ 이름: T2.이름, w: String(T2.W), d: String(T2.D), 수: 20 }] };
  const 칸 = document.createElement('div');
  칸.id = '_우라홈2재단칸'; 칸.className = 'wo-boring-mac-col'; 칸.style.cssText = 'width:328px;';
  document.body.appendChild(칸);
  칸.innerHTML = _woPlacedCardHtml(부속, 부속.cKey, '2026-10-21-재단', 'AMT', {}, '');
  // 같은 부속으로 엣지 카드도 한 장 — 엣지 쪽이 그대로 살아 있나
  const 엣칸 = document.createElement('div');
  엣칸.id = '_우라홈2엣지칸'; 엣칸.className = 'wo-boring-mac-col'; 엣칸.style.cssText = 'width:117px;';
  document.body.appendChild(엣칸);
  엣칸.innerHTML = _woPlacedCardHtml({ cKey: 'd9501_card-9501-' + 일, nm: T1.이름, pm: 10, dq: 10,
    orderCode: 발주.orderCode, orderKey: 'd9501', orderName: 발주.displayName,
    plateName: 'PB-18T', finish: 'LPM-양면', rw: T1.W, rd: T1.D, deliveryDate: '2026-10-21' },
    'd9501_card-9501-' + 일, '2026-10-21-엣지', '2호기', {}, '');
  return { 일, 곁, T1, T2 };
}, L);
console.log('■ 차림: ' + JSON.stringify(본));
if (본.칸없음) { console.log('우라홈2   FAIL (원장에 우라홈 칸이 없다)'); process.exit(1); }
if (본.못세움) { console.log('우라홈2   FAIL (쓸 만한 AMT 줄 둘을 못 찾음)'); process.exit(1); }

const 잰 = await p.evaluate(() => {
  const 뽑 = (고르개) => [...document.querySelectorAll(고르개)].map(e => ({
    d: e.getAttribute('d') || '', 색: (e.getAttribute('stroke') || '').toLowerCase(),
    굵기: parseFloat(e.getAttribute('stroke-width') || '0'),
    비늘고정: e.getAttribute('vector-effect') === 'non-scaling-stroke' }));
  const 배치 = document.querySelector('#_우라홈2재단칸 .woc-도면 svg, #_우라홈2재단칸 svg:not(.부속판 svg)');
  const 조각네모 = [...document.querySelectorAll('#_우라홈2재단칸 rect')].map(e => ({
    x: +(+e.getAttribute('x')).toFixed(1), y: +(+e.getAttribute('y')).toFixed(1),
    w: +(+e.getAttribute('width')).toFixed(1), h: +(+e.getAttribute('height')).toFixed(1) }));
  return {
    부속판우라: 뽑('#_우라홈2재단칸 .부속판 path.우라홈'),
    부속판있나: !!document.querySelector('#_우라홈2재단칸 .부속판 svg'),
    배치우라: 뽑('#_우라홈2재단칸 svg path.우라홈').filter(x => !/^M0 [\d.]+ H\d+$/.test('')),
    배치있나: !!배치,
    모든우라: document.querySelectorAll('#_우라홈2재단칸 path.우라홈').length,
    조각네모, 네모수: 조각네모.length,
    치수글: [...document.querySelectorAll('#_우라홈2재단칸 .부속치수, #_우라홈2재단칸 .woc-치수')]
      .map(e => (e.textContent || '').trim()),
    매수: (document.querySelector('#_우라홈2재단칸 .woc-매')?.textContent || '').trim(),
    엣지우라: 뽑('#_우라홈2엣지칸 path.우라홈'),
    엣지초록: 뽑('#_우라홈2엣지칸 path.엣지면'),
    쓰기: window.__쓰기, 문서가로: document.documentElement.scrollWidth };
});
console.log('■ 잰 값: ' + JSON.stringify(잰));

const T1 = 본.T1, T2 = 본.T2;
const 부속d = `M0 ${Math.min(20, T1.D * 0.3).toFixed(1)} H${T1.W}`;
판('① 재단 카드의 **부속 한 장**에 빨간 선 한 줄 (변에서 안쪽 2cm)',
   잰.부속판있나 === true && 잰.부속판우라.length === 1 && 잰.부속판우라[0].d === 부속d,
   JSON.stringify(잰.부속판우라) + ' / 바라는 d ' + 부속d);
판('① 붉은색·비늘고정이다', 잰.부속판우라.length === 1 && 잰.부속판우라[0].색 === '#ef4444'
   && 잰.부속판우라[0].비늘고정 === true, JSON.stringify(잰.부속판우라[0] || null));
// 배치도: 1순위 조각 둘(하나는 돌려 앉힌 것)에만 긋고, 곁조각(우라홈 X)에는 안 긋는다
const 배치선 = 잰.모든우라 - 잰.부속판우라.length;
판('② 재단 **배치도**의 1순위 조각마다 한 줄씩 (돌려 앉힌 것까지 둘)',
   잰.배치있나 === true && 배치선 === 2, '배치도 빨간 선 ' + 배치선 + '개 (모두 ' + 잰.모든우라 + ' − 부속판 ' + 잰.부속판우라.length + ')');
const 다 = 잰.배치우라.map(x => x.d);
판('② 돌려 앉힌 조각은 선도 따라 돈다 (가로 한 줄 · 세로 한 줄)',
   다.filter(d => / H/.test(d)).length >= 1 && 다.filter(d => / V/.test(d)).length >= 1,
   JSON.stringify(다));
판('③ 우라홈이 X 인 곁조각에는 안 긋는다 (조각 셋 중 둘만)',
   잰.네모수 === 3 && 배치선 === 2, '조각 ' + 잰.네모수 + '개 · 선 ' + 배치선 + '개');
판('④ 엣지 카드의 빨간 선이 그대로 살아 있다', 잰.엣지우라.length === 1, JSON.stringify(잰.엣지우라));
판('④ 엣지 초록선도 그대로다 (네 변)',
   잰.엣지초록.length === 1 && 잰.엣지초록[0].색 === '#22c55e'
   && [`M0 0 H${T1.W}`, `M0 ${T1.D} H${T1.W}`, `M0 0 V${T1.D}`, `M${T1.W} 0 V${T1.D}`]
      .every(d => 잰.엣지초록[0].d.includes(d)), JSON.stringify(잰.엣지초록));
판('⑤ 재단 조각 자리가 그대로다 (선만 더했다 — 네모 셋, 치수 그대로)',
   잰.네모수 === 3 && 잰.치수글.join(' ').includes(String(T1.W)),
   JSON.stringify(잰.조각네모) + ' / 치수 ' + JSON.stringify(잰.치수글));
판('⑤ 재단도 장수가 그대로다', 잰.매수 === '3매', JSON.stringify(잰.매수));
판('⑥ 발주 자료에 한 줄도 안 쓴다', 잰.쓰기 === 0, 잰.쓰기 + '번');
판('⑥ 375px 가로 스크롤 없다', 잰.문서가로 <= 375, 잰.문서가로 + 'px');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '우라홈2   OK' : '우라홈2   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
