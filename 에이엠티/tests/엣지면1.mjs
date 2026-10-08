// 「원본파일의 해당부속의 엣지면 정보를 확인하여 엣지부속 도면의 해당 사이즈선에
//  초록색 밝은 라인을 만들어 주세요. 엣지면 라인은 도면의 선분 자체이고 따로 라인을
//  그리지 않습니다. … w값이 2 인경우 도면의 w면 모두에 … w2 d2 인경우 4면 모두 …
//  값이 non 인경우는 엣지작업 자체가 불가한 부속 … 값이 1인 경우는 두면중 한면에」
//   — 사장님 말씀 (10-08 08:48)
// 원장의 W엣지면·D엣지면 을 그대로 읽어 **그 변 자체**가 초록으로 덮이는지 잰다.
// 변 옆에 덧그리지 않는다(선이 네모의 변과 같은 자리여야 한다).
// 1 은 「두 면 중 한 면」인데 어느 쪽인지가 원장에 없어 두 변을 점선으로 둔다 —
// 그 안이 바뀌면 이 시험의 점선 잣대만 고치면 된다.
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
  const iW = h.indexOf('W엣지면'), iD = h.indexOf('D엣지면');
  if (iW < 0 || iD < 0) return { 칸없음: true };
  const 값 = (r, i) => String((r && r[i]) == null ? '' : r[i]).trim().toLowerCase();
  /* 네 갈래를 한 줄씩 세운다 — 4면(2·2) · W만 두 면(2·0) · 한 면(1·0) · 못함(non).
     값은 **이 창에서만** 심는다. 업무 원장이 있는 자리에서만 돌면 안 되기 때문이다 —
     본보기 원장(tests/본보기자료/원장.json)은 W엣지면·D엣지면 이 1397줄 전부 빈칸이라
     진짜 값을 찾던 예전 꼴은 그 자리에서 그대로 떨어졌다(10-08 관리자 확인).
     심는 자리는 화면 안의 복사본(currentFullData)뿐이고, 파일에는 한 줄도 안 쓴다. */
  const 쓸줄 = [];
  for (let i = 1; i < currentFullData.length && 쓸줄.length < 4; i++) {
    const r = currentFullData[i]; if (!r) continue;
    if (normalizeValue(r[h.indexOf('공급처')]) !== 'AMT') continue;
    if (!(parseFloat(r[h.indexOf('재단W')]) > 0) || !(parseFloat(r[h.indexOf('재단D')]) > 0)) continue;
    쓸줄.push(i);
  }
  if (쓸줄.length < 4) return { 못세움: true, 쓸줄 };
  const 심을값 = [['2', '2'], ['2', '0'], ['1', '0'], ['non', 'non']];
  쓸줄.forEach((ri, i) => {
    currentFullData[ri] = currentFullData[ri].slice();      // 원본 줄은 그대로 두고 복사본에만
    currentFullData[ri][iW] = 심을값[i][0];
    currentFullData[ri][iD] = 심을값[i][1];
  });
  const 줄 = { 네면: 쓸줄[0], W두면: 쓸줄[1], 한면: 쓸줄[2], 못함: 쓸줄[3] };
  /* 진짜 업무 원장이 있는 자리에서는 **심지 않은 진짜 값**으로도 한 번 더 본다.
     없으면(본보기면) 이 자리는 비워 두고 심은 값만으로 잰다. */
  const 진짜 = {};
  ['2|2', '2|0', '1|0', 'non|non'].forEach(짝 => {
    const [w, d] = 짝.split('|');
    for (let i = 1; i < currentFullData.length; i++) {
      const r = currentFullData[i]; if (!r || 쓸줄.includes(i)) continue;
      if (!(parseFloat(r[h.indexOf('재단W')]) > 0) || !(parseFloat(r[h.indexOf('재단D')]) > 0)) continue;
      if (값(r, iW) === w && 값(r, iD) === d) { 진짜[짝] = i; break; }
    }
  });
  const 발주 = {
    idNum: 9301, docId: 'd9301', orderCode: '시험-엣지면', displayName: '시험상품 엣지면',
    supplier: normalizeValue(currentFullData[줄.네면][h.indexOf('ing발주처')]),
    criteria: IDENTITY_HEADERS.map(c => normalizeValue(currentFullData[줄.네면][h.indexOf(c)])),
    orderQty: 10, amtTimeline: true, batchId: 1791000000000, deliveryDate: '2026-10-19',
    procOverrides: {}, partMoveLog: {},
    partInfoMap: Object.fromEntries(쓸줄.map(ri => ['card-9301-' + ri, { qty: 10, isDeleted: false }])),
    partStarted: {},
    partCompletions: Object.fromEntries(쓸줄.map(ri => ['card-9301-' + ri,
      { '재단': { done: true, date: '2026-10-16', partName: currentFullData[ri][h.indexOf('부속명')] || '부속' } }])),
  };
  confirmedOrders.length = 0; confirmedOrders.push(발주);
  const 부속 = ri => ({ cKey: 'd9301_card-9301-' + ri, nm: currentFullData[ri][h.indexOf('부속명')] || '부속',
    pm: 10, dq: 10, orderCode: 발주.orderCode, orderKey: 'd9301', orderName: 발주.displayName,
    plateName: 'PB-18T', finish: 'LPM-양면',
    rw: parseFloat(currentFullData[ri][h.indexOf('재단W')]), rd: parseFloat(currentFullData[ri][h.indexOf('재단D')]),
    deliveryDate: '2026-10-19' });
  const 칸 = document.createElement('div');
  칸.id = '_엣지면시험칸'; 칸.className = 'wo-boring-mac-col'; 칸.style.cssText = 'width:117px;';
  document.body.appendChild(칸);
  칸.innerHTML = Object.entries(줄).map(([이름, ri]) =>
    `<div data-갈래="${이름}">` + _woPlacedCardHtml(부속(ri), 부속(ri).cKey, '2026-10-19-엣지', '1호기', {}, '') + `</div>`).join('');
  // 재단 카드에도 그려지면 안 된다 — 같은 부속으로 한 장
  const 재단칸 = document.createElement('div');
  재단칸.id = '_엣지면재단칸'; 재단칸.className = 'wo-boring-mac-col'; 재단칸.style.cssText = 'width:328px;';
  document.body.appendChild(재단칸);
  const 조각 = [{ lp: 0.004, tp: 0.004, wp: 0.3, hp: 0.4, dw: '1', dh: '1', bg: '' }];
  const 재단부속 = Object.assign(부속(줄.네면), { isCuttingCard: true, boardParts: 조각, boardW: 2440, boardH: 1220,
    sheets: 1, perSheet: 2, pRowIndex: 줄.네면, planId: 'x', extras: [] });
  재단칸.innerHTML = _woPlacedCardHtml(재단부속, 재단부속.cKey, '2026-10-16-재단', 'AMT', {}, '');
  return { 줄, 진짜: 진짜, 치수: Object.fromEntries(Object.entries(줄).map(([k, ri]) =>
    [k, { W: parseFloat(currentFullData[ri][h.indexOf('재단W')]), D: parseFloat(currentFullData[ri][h.indexOf('재단D')]),
          W엣지: 값(currentFullData[ri], iW), D엣지: 값(currentFullData[ri], iD),
          이름: currentFullData[ri][h.indexOf('부속명')] }])) };
}, L);
console.log('■ 차림: ' + JSON.stringify(본));
if (본.칸없음) { console.log('엣지면1   FAIL (원장에 W엣지면·D엣지면 칸이 없다)'); process.exit(1); }
if (본.못세움) { console.log('엣지면1   FAIL (원장에서 쓸 만한 AMT 줄 넷을 못 찾음: ' + JSON.stringify(본.쓸줄) + ')'); process.exit(1); }
console.log('■ 진짜 원장에 그 값이 있는 줄: ' + JSON.stringify(본.진짜) +
  (Object.keys(본.진짜 || {}).length ? '' : ' (본보기 원장이라 심은 값으로만 잰다)'));

const 잰 = await p.evaluate(() => {
  const 하나 = 갈래 => {
    const 통 = document.querySelector(`#_엣지면시험칸 [data-갈래="${갈래}"]`);
    const svg = 통 && 통.querySelector('.woc-부속 svg');
    const 선 = [...(통 ? 통.querySelectorAll('.woc-부속 path.엣지면') : [])].map(e => ({
      d: e.getAttribute('d') || '', 점선: !!e.getAttribute('stroke-dasharray'),
      색: (e.getAttribute('stroke') || '').toLowerCase(), 굵기: parseFloat(e.getAttribute('stroke-width') || '0'),
      비늘고정: e.getAttribute('vector-effect') === 'non-scaling-stroke' }));
    const 테 = 통 ? [...통.querySelectorAll('.woc-부속 path')].map(e => e.getAttribute('d') || '') : [];
    return { 있나: !!svg, 선, 변들: 테 };
  };
  return { 네면: 하나('네면'), W두면: 하나('W두면'), 한면: 하나('한면'), 못함: 하나('못함'),
           재단엣지선: document.querySelectorAll('#_엣지면재단칸 path.엣지면').length,
           재단부속판: !!document.querySelector('#_엣지면재단칸 .woc-부속 svg'),
           쓰기: window.__쓰기, 문서가로: document.documentElement.scrollWidth };
});
console.log('■ 잰 값: ' + JSON.stringify(잰));

const 몫 = 갈래 => 잰[갈래].선.map(x => x.d).join(' ');
const W = 본.치수, 변 = {
  네면: (c) => [`M0 0 H${c.W}`, `M0 ${c.D} H${c.W}`, `M0 0 V${c.D}`, `M${c.W} 0 V${c.D}`],
  W두면: (c) => [`M0 0 H${c.W}`, `M0 ${c.D} H${c.W}`],
};
판('① 네 면(W2·D2)이면 네 변 모두 초록 실선이다',
   잰.네면.선.length === 1 && !잰.네면.선[0].점선 && 변.네면(W.네면).every(d => 잰.네면.선[0].d.includes(d)),
   JSON.stringify(잰.네면.선) + ' / 바라는 변 ' + JSON.stringify(변.네면(W.네면)));
판('① W만 두 면(W2·D0)이면 그 두 변만 초록이다 (D 변은 안 긋는다)',
   잰.W두면.선.length === 1 && !잰.W두면.선[0].점선
   && 변.W두면(W.W두면).every(d => 잰.W두면.선[0].d.includes(d))
   && !잰.W두면.선[0].d.includes(`V${W.W두면.D}`),
   JSON.stringify(잰.W두면.선));
const 첫선 = 잰.네면.선[0] || null;   // 선이 아예 없으면 탈 나지 않고 FAIL 로 적는다
판('② 선이 도면의 변과 같은 자리다 (옆에 덧그리지 않는다)',
   !!첫선 && 첫선.d.split('M').filter(Boolean).every(seg => /^0 0 |^0 \d|^\d+ 0 /.test(seg.trim())),
   첫선 ? 첫선.d : '(선 없음)');
판('② 초록이고 굵고 비늘이 고정이다 (어느 크기에서나 같은 굵기)',
   !!첫선 && 첫선.색 === '#22c55e' && 첫선.굵기 >= 2 && 첫선.비늘고정 === true,
   JSON.stringify(첫선));
판('③ 한 면(1)은 두 변을 점선으로 둔다 (어느 쪽인지 원장에 없다)',
   잰.한면.선.length === 1 && 잰.한면.선[0].점선 === true
   && 변.W두면(W.한면).every(d => 잰.한면.선[0].d.includes(d)),
   JSON.stringify(잰.한면.선));
판('④ non 인 부속은 아무 선도 안 긋는다 (엣지 작업 자체가 안 되는 부속)',
   잰.못함.있나 === true && 잰.못함.선.length === 0, JSON.stringify(잰.못함.선));
판('⑤ 재단 카드에는 안 긋는다 (시킨 것은 엣지 카드다)',
   잰.재단부속판 === true && 잰.재단엣지선 === 0, '재단 부속판 ' + 잰.재단부속판 + ' · 엣지선 ' + 잰.재단엣지선);
판('⑥ 발주 자료에 한 줄도 안 쓴다', 잰.쓰기 === 0, 잰.쓰기 + '번');
판('⑥ 375px 가로 스크롤 없다', 잰.문서가로 <= 375, 잰.문서가로 + 'px');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '엣지면1   OK' : '엣지면1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
