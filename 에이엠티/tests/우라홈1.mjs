// 「원본의 우라홈열의 값을 확인하여 부속의 도면에 우라홈 표기를 해주세요. -우라홈 값이 O 이면
//  우라홈위치열 의 값을 확인하여 해당 사이즈의 방향으로 1줄의 빨간라인을 표현해주면 됩니다.
//  위치는 엣지라인에서 2cm가량의 비율을 계산하여 안쪽에 붉은색 1줄을 표현해 주세요.」
//   — 사장님 말씀 (10-09 05:51)
// 원장의 「우라홈」·「우라홈위치」 를 그대로 읽어 **엣지 부속 도면**에 빨간 선 한 줄이
// 그 사이즈 쪽으로, 변에서 안쪽 2cm(= 도면 단위 20mm, 변 길이의 30% 로 묶음) 자리에
// 그려지는지 잰다. 우라홈이 O 가 아니거나 위치값이 비었거나 W·D 어느 쪽과도 안 맞으면 0개다.
// 10-08 에 넣은 엣지 초록선이 같은 도면에서 그대로 살아 있는지도 같이 잰다.
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
  if (iU < 0 || iP < 0) return { 칸없음: true, iU, iP };
  /* 다섯 갈래를 한 줄씩 세운다 — W쪽 · D쪽 · X · 위치빈칸 · 엉뚱한숫자.
     값은 **이 창의 복사본(currentFullData)에만** 심는다. 업무 원장이 있는 자리에서만
     돌면 안 되기 때문이다 — 본보기 원장은 우라홈·우라홈위치가 1397줄 전부 빈칸이다
     (10-09 관리자 확인). 파일에는 한 줄도 쓰지 않는다. */
  const 쓸줄 = [];
  for (let i = 1; i < currentFullData.length && 쓸줄.length < 5; i++) {
    const r = currentFullData[i]; if (!r) continue;
    if (normalizeValue(r[h.indexOf('공급처')]) !== 'AMT') continue;
    const W = parseFloat(r[h.indexOf('재단W')]), D = parseFloat(r[h.indexOf('재단D')]);
    if (!(W > 0) || !(D > 0) || W === D) continue;    // W·D 가 달라야 「어느 쪽」 을 가를 수 있다
    쓸줄.push(i);
  }
  if (쓸줄.length < 5) return { 못세움: true, 쓸줄 };
  const 줄 = { W쪽: 쓸줄[0], D쪽: 쓸줄[1], 엑스: 쓸줄[2], 위치빈칸: 쓸줄[3], 엉뚱: 쓸줄[4] };
  const 치수 = {};
  Object.entries(줄).forEach(([이름, ri]) => {
    currentFullData[ri] = currentFullData[ri].slice();          // 원본 줄은 그대로 두고 복사본만
    const r = currentFullData[ri];
    const W = parseFloat(r[h.indexOf('재단W')]), D = parseFloat(r[h.indexOf('재단D')]);
    if (이름 === 'W쪽')        { r[iU] = 'O'; r[iP] = String(W); }
    if (이름 === 'D쪽')        { r[iU] = 'o'; r[iP] = String(D); }   // 소문자도 같은 뜻이다
    if (이름 === '엑스')       { r[iU] = 'X'; r[iP] = String(W); }
    if (이름 === '위치빈칸')   { r[iU] = 'O'; r[iP] = ''; }
    if (이름 === '엉뚱')       { r[iU] = 'O'; r[iP] = '99999'; }     // W·D 어느 쪽도 아닌 값
    if (iW >= 0) r[iW] = '2';                                    // 엣지 초록선도 같이 보려고
    if (iD >= 0) r[iD] = '2';
    치수[이름] = { W, D, 우라홈: r[iU], 위치: r[iP], 이름: r[h.indexOf('부속명')] };
  });
  const 발주 = {
    idNum: 9401, docId: 'd9401', orderCode: '시험-우라홈', displayName: '시험상품 우라홈',
    supplier: normalizeValue(currentFullData[줄.W쪽][h.indexOf('ing발주처')]),
    criteria: IDENTITY_HEADERS.map(c => normalizeValue(currentFullData[줄.W쪽][h.indexOf(c)])),
    orderQty: 10, amtTimeline: true, batchId: 1791000000000, deliveryDate: '2026-10-21',
    procOverrides: {}, partMoveLog: {},
    partInfoMap: Object.fromEntries(쓸줄.map(ri => ['card-9401-' + ri, { qty: 10, isDeleted: false }])),
    partStarted: {},
    partCompletions: Object.fromEntries(쓸줄.map(ri => ['card-9401-' + ri,
      { '재단': { done: true, date: '2026-10-19', partName: currentFullData[ri][h.indexOf('부속명')] || '부속' } }])),
  };
  confirmedOrders.length = 0; confirmedOrders.push(발주);
  const 부속 = ri => ({ cKey: 'd9401_card-9401-' + ri, nm: currentFullData[ri][h.indexOf('부속명')] || '부속',
    pm: 10, dq: 10, orderCode: 발주.orderCode, orderKey: 'd9401', orderName: 발주.displayName,
    plateName: 'PB-18T', finish: 'LPM-양면',
    rw: parseFloat(currentFullData[ri][h.indexOf('재단W')]), rd: parseFloat(currentFullData[ri][h.indexOf('재단D')]),
    deliveryDate: '2026-10-21' });
  const 칸 = document.createElement('div');
  칸.id = '_우라홈시험칸'; 칸.className = 'wo-boring-mac-col'; 칸.style.cssText = 'width:117px;';
  document.body.appendChild(칸);
  칸.innerHTML = Object.entries(줄).map(([이름, ri]) =>
    `<div data-갈래="${이름}">` + _woPlacedCardHtml(부속(ri), 부속(ri).cKey, '2026-10-21-엣지', '2호기', {}, '') + `</div>`).join('');
  // 재단 카드에는 그려지면 안 된다 — 같은 부속으로 한 장
  const 재단칸 = document.createElement('div');
  재단칸.id = '_우라홈재단칸'; 재단칸.className = 'wo-boring-mac-col'; 재단칸.style.cssText = 'width:328px;';
  document.body.appendChild(재단칸);
  const 조각 = [{ lp: 0.004, tp: 0.004, wp: 0.3, hp: 0.4, dw: '1', dh: '1', bg: '' }];
  const 재단부속 = Object.assign(부속(줄.W쪽), { isCuttingCard: true, boardParts: 조각, boardW: 2440, boardH: 1220,
    sheets: 1, perSheet: 2, pRowIndex: 줄.W쪽, planId: 'x', extras: [] });
  재단칸.innerHTML = _woPlacedCardHtml(재단부속, 재단부속.cKey, '2026-10-19-재단', 'AMT', {}, '');
  return { 줄, 치수 };
}, L);
console.log('■ 차림: ' + JSON.stringify(본));
if (본.칸없음) { console.log('우라홈1   FAIL (원장에 우라홈·우라홈위치 칸이 없다: ' + JSON.stringify(본) + ')'); process.exit(1); }
if (본.못세움) { console.log('우라홈1   FAIL (원장에서 쓸 만한 AMT 줄 다섯을 못 찾음: ' + JSON.stringify(본.쓸줄) + ')'); process.exit(1); }

const 잰 = await p.evaluate(() => {
  const 하나 = 갈래 => {
    const 통 = document.querySelector(`#_우라홈시험칸 [data-갈래="${갈래}"]`);
    const svg = 통 && 통.querySelector('.woc-부속 svg');
    const 뽑 = 클 => [...(통 ? 통.querySelectorAll('.woc-부속 path.' + 클) : [])].map(e => ({
      d: e.getAttribute('d') || '', 색: (e.getAttribute('stroke') || '').toLowerCase(),
      굵기: parseFloat(e.getAttribute('stroke-width') || '0'),
      비늘고정: e.getAttribute('vector-effect') === 'non-scaling-stroke' }));
    const 네모 = svg && svg.getBoundingClientRect();
    return { 있나: !!svg, 우라: 뽑('우라홈'), 엣지: 뽑('엣지면'),
             그려진자리: 네모 ? { w: Math.round(네모.width), h: Math.round(네모.height) } : null };
  };
  return { W쪽: 하나('W쪽'), D쪽: 하나('D쪽'), 엑스: 하나('엑스'), 위치빈칸: 하나('위치빈칸'), 엉뚱: 하나('엉뚱'),
           재단우라: document.querySelectorAll('#_우라홈재단칸 path.우라홈').length,
           재단부속판: !!document.querySelector('#_우라홈재단칸 .woc-부속 svg'),
           쓰기: window.__쓰기, 문서가로: document.documentElement.scrollWidth };
});
console.log('■ 잰 값: ' + JSON.stringify(잰));

const T = 본.치수;
const 안쪽 = (쪽, c) => Math.min(20, (쪽 === 'W' ? c.D : c.W) * 0.3).toFixed(1);
const wd = `M0 ${안쪽('W', T.W쪽)} H${T.W쪽.W}`;
const dd = `M${안쪽('D', T.D쪽)} 0 V${T.D쪽.D}`;
const 첫 = 잰.W쪽.우라[0] || null;
판('① 우라홈 O + 위치값이 재단W → W 쪽으로 빨간 선 한 줄, 변에서 안쪽 2cm',
   잰.W쪽.우라.length === 1 && 잰.W쪽.우라[0].d === wd, JSON.stringify(잰.W쪽.우라) + ' / 바라는 d ' + wd);
판('① 우라홈 o + 위치값이 재단D → D 쪽으로 빨간 선 한 줄',
   잰.D쪽.우라.length === 1 && 잰.D쪽.우라[0].d === dd, JSON.stringify(잰.D쪽.우라) + ' / 바라는 d ' + dd);
판('② 붉은색이고 비늘이 고정이다 (어느 크기에서나 같은 굵기)',
   !!첫 && 첫.색 === '#ef4444' && 첫.굵기 >= 1.5 && 첫.비늘고정 === true, JSON.stringify(첫));
판('③ 선이 **한 줄**이다 (M 이 하나뿐)',
   !!첫 && (첫.d.match(/M/g) || []).length === 1, 첫 ? 첫.d : '(선 없음)');
판('④ 우라홈이 X 면 0개다', 잰.엑스.있나 === true && 잰.엑스.우라.length === 0, JSON.stringify(잰.엑스.우라));
판('④ 우라홈위치가 비면 0개다 (방향을 모르면 안 그린다)',
   잰.위치빈칸.있나 === true && 잰.위치빈칸.우라.length === 0, JSON.stringify(잰.위치빈칸.우라));
판('④ 위치값이 W·D 어느 쪽도 아니면 0개다 (짐작하지 않는다)',
   잰.엉뚱.있나 === true && 잰.엉뚱.우라.length === 0, JSON.stringify(잰.엉뚱.우라));
판('⑤ 같은 도면에 엣지 초록선이 그대로 살아 있다 (네 변)',
   잰.W쪽.엣지.length === 1 && 잰.W쪽.엣지[0].색 === '#22c55e'
   && [`M0 0 H${T.W쪽.W}`, `M0 ${T.W쪽.D} H${T.W쪽.W}`, `M0 0 V${T.W쪽.D}`, `M${T.W쪽.W} 0 V${T.W쪽.D}`]
      .every(d => 잰.W쪽.엣지[0].d.includes(d)),
   JSON.stringify(잰.W쪽.엣지));
판('⑤ 빨간 선과 초록 변이 서로 덮지 않는다 (0 도 D 도 아닌 안쪽에 있다)',
   !!첫 && (() => { const y = parseFloat(첫.d.match(/M0 ([\d.]+) H/)?.[1] ?? 'x');
                    return y > 0 && y < T.W쪽.D; })(), 첫 ? 첫.d + ' / D=' + T.W쪽.D : '(선 없음)');
판('⑥ 재단 카드에는 안 그린다 (시킨 것은 엣지 카드다)',
   잰.재단부속판 === true && 잰.재단우라 === 0, '재단 부속판 ' + 잰.재단부속판 + ' · 우라홈선 ' + 잰.재단우라);
판('⑦ 발주 자료에 한 줄도 안 쓴다', 잰.쓰기 === 0, 잰.쓰기 + '번');
판('⑦ 375px 가로 스크롤 없다', 잰.문서가로 <= 375, 잰.문서가로 + 'px');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '우라홈1   OK' : '우라홈1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
