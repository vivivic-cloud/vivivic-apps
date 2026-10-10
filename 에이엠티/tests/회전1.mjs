// 「재단편집의 부속카드에 재단회전 버튼이 사라졌다」 — 사장님 말씀 (10-10 01:03 · 800X448)
// 재단편집 팝업 맨 위의 **편집 대상 카드(#_woEditTargetCard)** 에 「재단회전」 단추가
// 서는지 잰다. 그 단추는 그 부속의 **결보호가 X**(돌려도 되는 부속)일 때만 선다.
// 탈이 난 자리 — 계획에 원장 행 번호(pRowIndex)가 없으면 **사이즈로만** 원본 행을 다시
// 찾는데, 같은 사이즈 줄이 여럿이면 **맨 앞 줄**을 집었다. 오늘 원장에는 같은 800X448 에
// 결보호 O(내추럴오크)가 X(화이트)보다 앞에 있어, 화이트 부속을 열어도 O 줄이 잡혀
// 단추가 사라졌다. 여기서는 그 꼴을 그대로 세워서 잰다.
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
await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1400);

const 본 = await p.evaluate((L) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장', '발주', '도면', '차례'].forEach(k => window._자료왔다(k));
  window.__쓰기 = 0; const 셈 = () => async () => { window.__쓰기++; };
  window.db = {}; window.storage = {};
  window.fbFirestore = { doc: () => ({}), updateDoc: 셈(), setDoc: 셈(), deleteDoc: 셈(), addDoc: 셈(),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, where: () => ({}), serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  currentFullData.length = 0; L.forEach(r => currentFullData.push(r));
  const h = currentFullData[0];
  const i재W = h.indexOf('재단W'), i재D = h.indexOf('재단D'), i결 = h.indexOf('결보호');
  const i이름 = h.indexOf('부속명'), i색 = h.indexOf('마감색상'), i원장 = h.indexOf('원장명');
  if ([i재W, i재D, i결, i이름, i색].some(x => x < 0)) return { 칸없음: true };
  /* 같은 사이즈 줄 둘을 세운다 — **앞줄은 결보호 O(못 돌림), 뒷줄은 X(돌려도 됨)**.
     값은 이 창의 복사본에만 심는다. 사장님이 여신 것은 뒷줄(화이트) 쪽 부속이다. */
  const 쓸줄 = [];
  for (let i = 1; i < currentFullData.length && 쓸줄.length < 2; i++) {
    const r = currentFullData[i]; if (!r) continue;
    if (normalizeValue(r[h.indexOf('공급처')]) !== 'AMT') continue;
    if (!(parseFloat(r[i재W]) > 0) || !(parseFloat(r[i재D]) > 0)) continue;
    쓸줄.push(i);
  }
  if (쓸줄.length < 2) return { 못세움: true };
  const [앞, 뒤] = 쓸줄;
  [앞, 뒤].forEach(ri => { currentFullData[ri] = currentFullData[ri].slice(); });
  const W = 800, D = 448;
  currentFullData[앞][i재W] = W; currentFullData[앞][i재D] = D;
  currentFullData[앞][i결] = 'O'; currentFullData[앞][i이름] = '가와L';
  currentFullData[앞][i색] = '내추럴오크'; if (i원장 >= 0) currentFullData[앞][i원장] = 'PB-18T';
  currentFullData[뒤][i재W] = W; currentFullData[뒤][i재D] = D;
  currentFullData[뒤][i결] = 'X'; currentFullData[뒤][i이름] = '가와L';
  currentFullData[뒤][i색] = '화이트'; if (i원장 >= 0) currentFullData[뒤][i원장] = 'PB-18T';

  const 발주 = {
    idNum: 9701, docId: 'd9701', orderCode: '시험-회전-01', displayName: '시험상품 회전',
    code: '시험상품 회전', supplier: normalizeValue(currentFullData[뒤][h.indexOf('ing발주처')]),
    criteria: IDENTITY_HEADERS.map(c => normalizeValue(currentFullData[뒤][h.indexOf(c)])),
    orderQty: 10, amtTimeline: true, batchId: 1791600000000, deliveryDate: '2026-10-21',
    procOverrides: {}, partMoveLog: {}, partStarted: {}, partCompletions: {},
    partInfoMap: { ['card-9701-' + 뒤]: { qty: 10, isDeleted: false, partName: '가와L',
      plateName: 'PB-18T', finishColor: '화이트', w: W, d: D, partSupplier: 'AMT', unitCons: 1 } } };
  confirmedOrders.length = 0; confirmedOrders.push(발주);

  /* 옛 계획처럼 **pRowIndex 가 없는** 재단계획 하나 — 사장님이 여신 그 꼴이다. */
  const 계획 = { confirmId: 1791600000001, docId: '1791600000001', sheets: 2, perSheet: 3,
    baseMaterial: 'PB-18T', materialColor: '화이트', cutW: W, cutD: D,
    pRowIndex: null, pOrderIds: [9701], pProducedQty: 10, pDisplayName: 'PB-18T-화이트',
    pInfoText: W + ' X ' + D + ' - 가와L - 10 EA', targetPage: 'cutting' };
  window._cuttingPlans = { '1791600000001': 계획 };

  const sk = '2026-10-21-재단';
  const 조각 = [{ lp: 0.004, tp: 0.004, wp: W / 2440, hp: D / 1220, dw: String(W), dh: String(D), bg: '' }];
  window._woBoringParts = window._woBoringParts || {};
  window._woBoringParts[sk] = [{
    cKey: 'cut_1791600000001', nm: '가와L', pm: 10, dq: 10,
    orderCode: 발주.orderCode, orderKey: 'd9701', orderName: 발주.displayName,
    plateName: 'PB-18T', coating: 'LPM-양면', finish: '화이트', rw: W, rd: D,
    deliveryDate: '2026-10-21', isCuttingCard: true, boardParts: 조각, boardW: 2440, boardH: 1220,
    sheets: 2, perSheet: 3, pRowIndex: null, planId: '1791600000001',
    coveredOrderIds: [9701], extras: [] }];
  document.documentElement.removeAttribute('data-amthome');
  document.documentElement.removeAttribute('data-amtstock');
  switchPage('process'); appMode = 'process';
  const 말 = []; const 옛말 = window.showToastMessage; window.showToastMessage = t => 말.push(String(t));
  window.woEditCuttingPlan('cut_1791600000001', sk);
  window.showToastMessage = 옛말;
  return { 앞, 뒤, 말, 열림: !!document.getElementById('_woInlineEditOverlay') };
}, L);
console.log('■ 차림: ' + JSON.stringify(본));
if (본.칸없음 || 본.못세움) { console.log('회전1   FAIL (' + JSON.stringify(본) + ')'); process.exit(1); }
await p.waitForTimeout(400);

const 잰 = await p.evaluate(() => {
  const 대상 = document.getElementById('_woEditTargetCard');
  const bt = 대상 && 대상.querySelector('.rotate-btn');
  const r = bt ? bt.getBoundingClientRect() : null;
  return { 열림: !!document.getElementById('_woInlineEditOverlay'), 대상있나: !!대상,
           대상이름: 대상 ? (대상.dataset.name || '') : '',
           대상결: 대상 ? (대상.dataset.grain || '') : '',
           대상행: 대상 ? (대상.dataset.rowIndex || '') : '',
           회전있나: !!bt, 글: bt ? (bt.textContent || '').trim() : '',
           높이: r ? Math.round(r.height) : 0, 폭: r ? Math.round(r.width) : 0,
           쓰기: window.__쓰기, 문서가로: document.documentElement.scrollWidth };
});
console.log('■ 잰 값: ' + JSON.stringify(잰));

판('① 재단편집이 열리고 편집 대상 카드가 선다', 잰.열림 === true && 잰.대상있나 === true,
   JSON.stringify({ 열림: 잰.열림, 대상: 잰.대상있나 }));
판('② 원장 행을 **사이즈만으로 맨 앞 줄**에서 집지 않는다 (색상·부속명이 맞는 줄이다)',
   String(잰.대상행) === String(본.뒤), '집은 행 ' + 잰.대상행 + ' · 바라는 행 ' + 본.뒤 + ' (앞줄 ' + 본.앞 + ' 은 결보호 O)');
판('② 그래서 결보호가 X 로 잡힌다 (돌려도 되는 부속)', 잰.대상결 === 'X', JSON.stringify(잰.대상결));
판('③ 편집 대상 카드에 「재단회전」 단추가 있다', 잰.회전있나 === true && 잰.글 === '재단회전',
   JSON.stringify({ 있나: 잰.회전있나, 글: 잰.글 }));
판('③ 단추가 44px 이상이다 (장갑 낀 손)', 잰.높이 >= 44, 잰.높이 + 'px × ' + 잰.폭 + 'px');
판('④ 부속 이름도 그 줄에서 온다', 잰.대상이름 === '가와L', JSON.stringify(잰.대상이름));
판('⑤ 파이어스토어에 한 줄도 안 쓴다', 잰.쓰기 === 0, 잰.쓰기 + '번');
판('⑤ 375px 가로 스크롤 없다', 잰.문서가로 <= 375, 잰.문서가로 + 'px');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '회전1   OK' : '회전1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
