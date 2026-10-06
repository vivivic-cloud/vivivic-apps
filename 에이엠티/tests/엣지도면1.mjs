// 「엣지 부속카드에 재단카드에 들어있는 재단된 부속의 도면을 넣어 주세요」
// 「엣지 부속카드를 재단 도면카드와 일관성이 유지되도록 해주세요」
//   — 사장님 말씀 (10-06 08:50 · 공정관리 엣지에서 짚으셨다)
// 엣지 카드가 ① 그 부속이 잘린 재단도면을 달고 있는지 ② 재단 도면카드와 같은 칸
// (이름·치수·자재·딱지줄·부속 한 장·도면자리)을 쓰는지 ③ 도면을 못 찾으면 빈 칸이
// 아니라 까닭을 적는지 잰다. 발주·도면은 이 시험이 스스로 세운다(업무 자료에 안 쓴다).
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
  // 원장에서 AMT 부속 줄 둘을 고른다 — 하나는 도면이 있는 것, 하나는 없는 것
  const 줄 = [];
  for (let i = 1; i < currentFullData.length && 줄.length < 2; i++) {
    const r = currentFullData[i];
    if (!r || normalizeValue(r[h.indexOf('공급처')]) !== 'AMT') continue;
    if (!(parseFloat(r[h.indexOf('재단W')]) > 0) || !(parseFloat(r[h.indexOf('재단D')]) > 0)) continue;
    줄.push(i);
  }
  if (줄.length < 2) return { 못세움: true };
  const [ri도면, ri없음] = 줄;
  const 행 = currentFullData[ri도면];
  const W = parseFloat(행[h.indexOf('재단W')]), D = parseFloat(행[h.indexOf('재단D')]);
  const 발주 = {
    idNum: 9201, docId: 'd9201', orderCode: '시험-엣지', displayName: '시험상품 엣지',
    supplier: normalizeValue(행[h.indexOf('ing발주처')]),
    criteria: IDENTITY_HEADERS.map(c => normalizeValue(행[h.indexOf(c)])),
    // batchId(확정 시각)는 도면이 만들어진 시각보다 앞서야 그 도면의 임자가 된다
    // — _cutPlanOwner 의 잣대 그대로다.
    orderQty: 30, amtTimeline: true, batchId: 1791000000000, deliveryDate: '2026-10-19',
    procOverrides: {}, partMoveLog: {},
    partInfoMap: { ['card-9201-' + ri도면]: { qty: 60, isDeleted: false },
                   ['card-9201-' + ri없음]: { qty: 60, isDeleted: false } },
    partStarted: {},
    // 엣지는 재단이 끝나야 시작 단추가 선다(_partPrereqDone) — 그 자리를 그대로 만든다
    // partName 을 빼 두면 카드가 그것을 채우려고 파이어스토어에 쓴다(앱의 자동 보정) —
    // 이 시험은 쓰기 0 을 재므로 처음부터 적어 둔다.
    partCompletions: {
      ['card-9201-' + ri도면]: { '재단': { done: true, date: '2026-10-16', partName: currentFullData[ri도면][h.indexOf('부속명')] || '부속A' } },
      ['card-9201-' + ri없음]: { '재단': { done: true, date: '2026-10-16', partName: currentFullData[ri없음][h.indexOf('부속명')] || '부속B' } } },
  };
  confirmedOrders.length = 0; confirmedOrders.push(발주);
  // 그 부속이 잘린 재단도면 — 한 장에 넷이 앉은 꼴
  const 조각 = [];
  for (let i = 0; i < 4; i++) 조각.push({ lp: 0.004 + i * 0.21, tp: 0.004, wp: 0.2, hp: 0.5, dw: String(W), dh: String(D), bg: '' });
  const 도면번호 = 'auto_1791093945938_9201_' + ri도면;
  window._cuttingPlans = {
    [도면번호]: {
      confirmId: 도면번호, pRowIndex: ri도면, pOrderIds: [9201], pProducedQty: 60,
      sRowIndex: null, sOrderIds: [], sProducedQty: 0, tRowIndex: null, tOrderIds: [], tProducedQty: 0,
      boardParts: 조각, boardW: 2440, boardH: 1220, baseMaterial: 'PB-18T', materialColor: '아이보리',
      cutW: W, cutD: D, sheets: 2, perSheet: 4, reqQty: 60 }
  };
  const 부속 = (ri, 이름) => ({
    cKey: 'd9201_card-9201-' + ri, nm: 이름, pm: 12.5, dq: 60,
    orderCode: 발주.orderCode, orderKey: 'd9201', orderName: 발주.displayName,
    plateName: 'PB-18T', finish: 'LPM-양면',
    rw: parseFloat(currentFullData[ri][h.indexOf('재단W')]),
    rd: parseFloat(currentFullData[ri][h.indexOf('재단D')]), deliveryDate: '2026-10-19' });
  const 엣지1 = 부속(ri도면, currentFullData[ri도면][h.indexOf('부속명')] || '부속A');
  const 엣지2 = 부속(ri없음, currentFullData[ri없음][h.indexOf('부속명')] || '부속B');
  // 같은 부속으로 재단 카드도 한 장 만들어 칸을 견준다
  const 재단카드 = Object.assign({}, 엣지1, { isCuttingCard: true, boardParts: 조각, boardW: 2440, boardH: 1220,
    sheets: 2, perSheet: 4, pRowIndex: ri도면, planId: 도면번호, extras: [] });
  const 칸 = document.createElement('div');
  칸.id = '_엣지시험칸'; 칸.className = 'wo-boring-mac-col';
  칸.style.cssText = 'width:117px;';
  document.body.appendChild(칸);
  const 그리기 = (부, sk, mac) => _woPlacedCardHtml(부, 부.cKey, sk, mac, {}, '');
  칸.innerHTML = 그리기(엣지1, '2026-10-19-엣지', '1호기') + 그리기(엣지2, '2026-10-19-엣지', '1호기');
  const 재단칸 = document.createElement('div');
  재단칸.id = '_재단시험칸'; 재단칸.className = 'wo-boring-mac-col'; 재단칸.style.cssText = 'width:328px;';
  document.body.appendChild(재단칸);
  재단칸.innerHTML = 그리기(재단카드, '2026-10-16-재단', 'AMT');
  const 보링칸 = document.createElement('div');
  보링칸.id = '_보링시험칸'; 보링칸.className = 'wo-boring-mac-col'; 보링칸.style.cssText = 'width:117px;';
  document.body.appendChild(보링칸);
  보링칸.innerHTML = 그리기(엣지1, '2026-10-19-보링', '1호기');
  return { ri도면, ri없음, W, D, 부속명: 엣지1.nm, 없음부속: 엣지2.nm };
}, L);
console.log('■ 차림: ' + JSON.stringify(본));
if (본.못세움) { console.log('엣지도면1   FAIL (원장에서 AMT 부속 줄 둘을 못 찾음)'); process.exit(1); }

const 잰 = await p.evaluate(() => {
  const 칸모음 = e => [...e.querySelectorAll('[class^="woc-"],[class*=" woc-"]')]
    .map(x => x.className.split(' ')[0]).filter((v, i, a) => a.indexOf(v) === i).sort();
  const 카드 = [...document.querySelectorAll('#_엣지시험칸 .wo-boring-placed-card')];
  const 재단 = document.querySelector('#_재단시험칸 .wo-boring-placed-card');
  const 보링 = document.querySelector('#_보링시험칸 .wo-boring-placed-card');
  const 재 = e => e ? { w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height) } : null;
  const 하나 = c => ({
    칸: 칸모음(c),
    도면: 재(c.querySelector('.woc-도면자리 svg')),
    부속판: 재(c.querySelector('.woc-부속 svg')),
    없음글: (c.querySelector('.woc-도면없음')?.textContent || '').replace(/\s+/g, ' ').trim(),
    이름: (c.querySelector('.woc-이름')?.innerText || '').trim(),
    치수: (c.querySelector('.woc-치수')?.textContent || '').trim(),
    자재: (c.querySelector('.woc-자재글')?.textContent || '').trim(),
    딱지: [...c.querySelectorAll('.woc-딱지줄 span')].map(e => (e.textContent || '').trim()),
    큰단추: [...c.querySelectorAll('button')].filter(bt => /시작|완료/.test(bt.textContent))
      .map(bt => Math.round(bt.getBoundingClientRect().height)),
    몸넘침: (() => { const m = c.querySelector('.woc-몸'); return m ? m.scrollWidth > m.clientWidth + 1 : false; })(),
  });
  return { 도면카드: 하나(카드[0]), 없음카드: 하나(카드[1]),
           재단카드: { 칸: 칸모음(재단), 도면: 재(재단.querySelector('.woc-도면자리 svg')),
                      부속판: 재(재단.querySelector('.woc-부속 svg')) },
           보링카드: 하나(보링),
           문서가로: document.documentElement.scrollWidth, 쓰기: window.__쓰기 };
});
console.log('■ 엣지(도면 있음): ' + JSON.stringify(잰.도면카드));
console.log('■ 엣지(도면 없음): ' + JSON.stringify(잰.없음카드));
console.log('■ 재단 카드: ' + JSON.stringify(잰.재단카드));
console.log('■ 보링 카드: ' + JSON.stringify(잰.보링카드.칸));

판('① 엣지 카드에 그 부속이 잘린 재단도면이 붙는다',
   !!(잰.도면카드.도면 && 잰.도면카드.도면.w > 0 && 잰.도면카드.도면.h > 0), JSON.stringify(잰.도면카드.도면));
판('① 그 부속 한 장(민판)도 같이 선다',
   !!(잰.도면카드.부속판 && 잰.도면카드.부속판.w > 0), JSON.stringify(잰.도면카드.부속판));
const 꼭 = ['woc-몸', 'woc-글', 'woc-이름', 'woc-치수', 'woc-자재', 'woc-딱지줄', 'woc-부속', 'woc-그림', 'woc-도면자리'];
const 빠진 = 꼭.filter(k => !잰.도면카드.칸.includes(k));
판('② 재단 도면카드와 같은 칸을 쓴다 (' + 꼭.join('·') + ')', 빠진.length === 0, '빠진 칸: ' + (빠진.join(',') || '없음'));
const 재단빠진 = 꼭.filter(k => !잰.재단카드.칸.includes(k));
판('② 그 칸 이름이 진짜 재단 카드에도 다 있다 (한 잣대로 견준다)', 재단빠진.length === 0, '빠진 칸: ' + (재단빠진.join(',') || '없음'));
판('② 이름·치수·자재·수량이 다 적힌다',
   잰.도면카드.이름.length > 0 && /×/.test(잰.도면카드.치수) && 잰.도면카드.자재.length > 1 && 잰.도면카드.딱지.length > 0,
   [잰.도면카드.이름, 잰.도면카드.치수, 잰.도면카드.자재, 잰.도면카드.딱지.join('/')].join(' · '));
판('③ 도면을 못 찾으면 빈 칸이 아니라 까닭을 적는다',
   !잰.없음카드.도면 && /재단도면 없음/.test(잰.없음카드.없음글) && 잰.없음카드.없음글.length > '재단도면 없음'.length,
   JSON.stringify(잰.없음카드.없음글));
판('③ 도면이 없어도 나머지 칸은 그대로 선다',
   빠진.length === 0 && 잰.없음카드.칸.includes('woc-도면자리') && !!잰.없음카드.부속판,
   JSON.stringify(잰.없음카드.칸));
판('④ 375px 에서 큰 단추는 44px 이상',
   잰.도면카드.큰단추.length > 0 && 잰.도면카드.큰단추.every(h => h >= 44), JSON.stringify(잰.도면카드.큰단추));
판('④ 카드 안이 옆으로 안 넘친다', 잰.도면카드.몸넘침 === false && 잰.없음카드.몸넘침 === false,
   '도면칸 ' + 잰.도면카드.몸넘침 + ' · 없음칸 ' + 잰.없음카드.몸넘침);
판('④ 375px 가로 스크롤 없다', 잰.문서가로 <= 375, 잰.문서가로 + 'px');
판('⑤ 보링 카드는 그대로다 (시킨 것만 고친다)',
   !잰.보링카드.도면 && !잰.보링카드.칸.includes('woc-몸'), JSON.stringify(잰.보링카드.칸));
판('⑥ 발주 자료에 한 줄도 안 쓴다', 잰.쓰기 === 0, 잰.쓰기 + '번');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '엣지도면1   OK' : '엣지도면1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
