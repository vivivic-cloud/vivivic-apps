// 「납기에는 파레트의 큐알코드별 제품 분류가 되어 있어야 합니다. 파레트 큐알이 정해지지
//  않은 제품은 배송출발할 수 없습니다.」 — 사장님 말씀 (10-09 13:20)
// 납기 판에서 ① 제품이 파레트별로 묶여 보이는지 ② 파레트가 안 정해진 제품의
// 「배송출발」 이 **진짜 손가락으로 눌러도** 안 열리는지 ③ 파레트가 정해진 제품은
// 전처럼 그대로 열리는지 ④ 옛 기록(파레트 칸이 없던 발주)이 예전과 똑같이 구는지를 잰다.
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
const cdp = await ctx.newCDPSession(p);
const 손 = (t, x, y) => cdp.send('Input.dispatchTouchEvent',
  { type: t, touchPoints: t === 'touchEnd' ? [] : [{ x, y, radiusX: 14, radiusY: 14, force: 1 }] });
const 짚기 = async (고르개) => {
  const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null;
    e.scrollIntoView({ block: 'center' }); const b2 = e.getBoundingClientRect();
    return { x: Math.round(b2.x + b2.width / 2), y: Math.round(b2.y + b2.height / 2) }; }, 고르개);
  if (!r) return false;
  await 손('touchStart', r.x, r.y); await p.waitForTimeout(60); await 손('touchEnd', 0, 0);
  await p.waitForTimeout(500); return true;
};

const 날 = '2026-10-21';
const 본 = await p.evaluate(({ L, 날 }) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장', '발주', '도면', '차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.__쓰기 = 0; const 셈 = () => async () => { window.__쓰기++; };
  window.db = {}; window.storage = {};
  window.fbFirestore = { doc: () => ({}), updateDoc: 셈(), setDoc: 셈(), deleteDoc: 셈(), addDoc: 셈(),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  currentFullData.length = 0; L.forEach(r => currentFullData.push(r));
  const h = currentFullData[0];
  // 쓸 만한 AMT 부속 줄 둘
  const 줄 = [];
  for (let i = 1; i < currentFullData.length && 줄.length < 2; i++) {
    const r = currentFullData[i]; if (!r) continue;
    if (normalizeValue(r[h.indexOf('공급처')]) !== 'AMT') continue;
    if (!(parseFloat(r[h.indexOf('재단W')]) > 0)) continue;
    줄.push(i);
  }
  if (줄.length < 2) return { 못세움: true };
  const 다됨 = ri => ({ '재단': { done: true, date: 날, partName: currentFullData[ri][h.indexOf('부속명')] || '부속' },
                         '엣지': { done: true, date: 날, partName: currentFullData[ri][h.indexOf('부속명')] || '부속' },
                         'NC':   { done: true, date: 날, partName: currentFullData[ri][h.indexOf('부속명')] || '부속' },
                         '보링': { done: true, date: 날, partName: currentFullData[ri][h.indexOf('부속명')] || '부속' } });
  const 발주 = (idNum, docId, 이름, 코드) => ({
    idNum, docId, orderCode: 코드, displayName: 이름, code: 이름,
    supplier: normalizeValue(currentFullData[줄[0]][h.indexOf('ing발주처')]),
    criteria: IDENTITY_HEADERS.map(c => normalizeValue(currentFullData[줄[0]][h.indexOf(c)])),
    orderQty: 10, amtTimeline: true, batchId: 1791000000010 + idNum, deliveryDate: 날,
    procOverrides: {}, partMoveLog: {},
    partInfoMap: Object.fromEntries(줄.map(ri => ['card-' + idNum + '-' + ri, { qty: 10, isDeleted: false }])),
    partStarted: {},
    partCompletions: Object.fromEntries(줄.map(ri => ['card-' + idNum + '-' + ri, 다됨(ri)])),
  });
  confirmedOrders.length = 0;
  confirmedOrders.push(발주(9601, 'd9601', '시험상품 파레트있음', '시험-파레트-01'));
  confirmedOrders.push(발주(9602, 'd9602', '시험상품 파레트없음', '시험-파레트-02'));
  confirmedOrders.push(발주(9603, 'd9603', '시험상품 옛기록', '시험-파레트-03'));
  // ① 첫 발주에만 파레트를 적어 둔다 — 적힌 것(wo_pallet)에서 온 꼴 그대로
  window._파레트기록 = { d9601: { docId: 'd9601', 고른: { ['card-9601-' + 줄[0] + '|엣지']: 'B' } } };
  window._집중파레트들 = {};
  document.documentElement.removeAttribute('data-amthome');
  document.documentElement.removeAttribute('data-amtstock');
  switchPage('process'); appMode = 'process'; renderProcessTimeline();
  const m = window._tlDcGetItems(날);
  if (!m || !m['납기'] || !m['납기'].items || !m['납기'].items.length) return { 납기없음: true, 있는것: Object.keys(m || {}) };
  window.tlExpandDateCard(날); window.tlDcExpandSection('납기');
  return { 줄, 납기건수: m['납기'].items.length };
}, { L, 날 });
console.log('■ 차림: ' + JSON.stringify(본));
if (본.못세움 || 본.납기없음) { console.log('납기파레트1   FAIL (' + JSON.stringify(본) + ')'); process.exit(1); }
await p.waitForTimeout(500);

const 잰 = await p.evaluate(() => {
  const 묶음 = [...document.querySelectorAll('#tl-datecard-expand .납-파묶음')].map(e => ({
    글: (e.textContent || '').replace(/\s+/g, ' ').trim(),
    파: (e.querySelector('.납-파')?.textContent || '').trim(),
    없나: !!e.querySelector('.납-파.없') }));
  const 카드 = [...document.querySelectorAll('#tl-datecard-expand .tl-dc-full-card')].map(e => {
    const bt = e.querySelector('.tl-dc-btn-delivery');
    const r = bt ? bt.getBoundingClientRect() : null;
    return { 이름: (e.querySelector('.tl-dc-full-name')?.textContent || '').trim(),
             칩: [...e.querySelectorAll('.tl-dc-full-card-name-row .납-파')].map(x => (x.textContent||'').trim()),
             수량: (e.querySelector('.tl-dc-full-qty')?.textContent || '').trim(),
             단추: !!bt, 죽음: bt ? !!bt.disabled : null,
             단추높: r ? Math.round(r.height) : 0, idnum: e.dataset.idnum };
  });
  // 묶음 띠마다 몇 건인지 — 띠 다음부터 다음 띠 전까지
  const 몸 = document.querySelector('#tl-datecard-expand .tl-dc-single-body');
  const 셈 = []; let 지금 = null;
  [...(몸 ? 몸.querySelectorAll('.납-파묶음, .tl-dc-full-card') : [])].forEach(e => {
    if (e.classList.contains('납-파묶음')) { 지금 = { 띠: (e.textContent||'').replace(/\s+/g,' ').trim(), 수: 0 }; 셈.push(지금); }
    else if (지금) 지금.수++;
  });
  return { 묶음, 카드, 셈, 쓰기: window.__쓰기, 문서가로: document.documentElement.scrollWidth };
});
console.log('■ 잰 값: ' + JSON.stringify(잰));

판('① 납기 판이 파레트별로 묶여 보인다 (묶음 둘 — 「B」 와 「파레트 없음」)',
   잰.묶음.length === 2 && 잰.묶음[0].파 === 'B' && 잰.묶음[1].없나 === true,
   JSON.stringify(잰.묶음.map(x => x.글)));
판('① 묶음마다 몇 건인지 적힌다 (B 1건 · 없음 2건)',
   잰.셈.length === 2 && 잰.셈[0].수 === 1 && 잰.셈[1].수 === 2 && /1건/.test(잰.셈[0].띠) && /2건/.test(잰.셈[1].띠),
   JSON.stringify(잰.셈));
const 있음 = 잰.카드.find(c => /파레트있음/.test(c.이름));
const 없음 = 잰.카드.find(c => /파레트없음/.test(c.이름));
const 옛것 = 잰.카드.find(c => /옛기록/.test(c.이름));
판('① 카드 이름줄에 파레트 딱지가 붙는다 (있으면 글자, 없으면 「파레트 없음」)',
   !!있음 && 있음.칩.join('') === 'B' && !!없음 && 없음.칩.join('') === '파레트 없음',
   JSON.stringify({ 있음: 있음 && 있음.칩, 없음: 없음 && 없음.칩 }));
판('② 파레트 없는 제품의 「배송출발」 은 죽어 있다',
   !!없음 && 없음.단추 === true && 없음.죽음 === true, JSON.stringify(없음));
판('③ 파레트 있는 제품의 「배송출발」 은 그대로 살아 있다',
   !!있음 && 있음.단추 === true && 있음.죽음 === false, JSON.stringify(있음));
/* 「배송출발」 단추의 높이는 **예전 그대로**여야 한다 — 이번 일은 묶고 막는 것이지
   단추 모양을 바꾸는 일이 아니다. (그 단추는 10-09 지금 23px 다. 이 집 규칙은
   누르는 자리 44px 이라 모자라지만, 시킨 것이 아니어서 손대지 않고 적어만 둔다.) */
판('③ 단추 모양은 예전 그대로다 (죽이기만 했다 — 높이가 안 바뀌었다)',
   !!있음 && !!없음 && 있음.단추높 === 없음.단추높 && 있음.단추높 > 0,
   '있음 ' + (있음 && 있음.단추높) + 'px · 없음 ' + (없음 && 없음.단추높) + 'px');
판('④ 옛 기록(파레트 칸이 없던 발주)은 「파레트 없음」 으로 가고 카드는 예전 그대로다',
   !!옛것 && 옛것.칩.join('') === '파레트 없음' && /10 EA/.test(옛것.수량) && 옛것.죽음 === true,
   JSON.stringify(옛것));

// ② 진짜 손가락으로 눌러 본다 — 안 열려야 한다
await 짚기(`#tl-datecard-expand .tl-dc-full-card[data-idnum="9602"] .tl-dc-btn-delivery`);
const 눌러본뒤 = await p.evaluate(() => ({
  열림: !!document.querySelector('#tl-datecard-expand .tl-dc-full-card[data-idnum="9602"] .tl-dc-delivery-area')?.hasChildNodes(),
  쓰기: window.__쓰기 }));
판('② 손가락으로 눌러도 배송 창이 안 열린다 · 화베 쓰기 0',
   눌러본뒤.열림 === false && 눌러본뒤.쓰기 === 0, JSON.stringify(눌러본뒤));

// ③ 파레트 있는 제품은 전처럼 열린다
await 짚기(`#tl-datecard-expand .tl-dc-full-card[data-idnum="9601"] .tl-dc-btn-delivery`);
const 열어본뒤 = await p.evaluate(() => ({
  열림: !!document.querySelector('#tl-datecard-expand .tl-dc-full-card[data-idnum="9601"] .tl-dc-delivery-area')?.hasChildNodes(),
  쓰기: window.__쓰기, 문서가로: document.documentElement.scrollWidth }));
판('③ 파레트 있는 제품은 전처럼 배송 창이 열린다 (되던 것이 안 막혔다)',
   열어본뒤.열림 === true, JSON.stringify(열어본뒤));
판('⑤ 파이어스토어에 한 줄도 안 쓴다 (보기만 했다)', 열어본뒤.쓰기 === 0, 열어본뒤.쓰기 + '번');
판('⑤ 375px 가로 스크롤 없다', 열어본뒤.문서가로 <= 375, 열어본뒤.문서가로 + 'px');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '납기파레트1   OK' : '납기파레트1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
