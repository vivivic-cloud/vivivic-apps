// 발주가 언제 들어왔는지 — 날짜 옆에 시각까지 보인다.
// 사장님 지시(09-29 10:29): 「등록시간도 기록되어야함」
// 발주를 만드는 곳은 조혼가구·이카운트등록이고 거기서 이미 createdAt 을
// serverTimestamp 로 찍어 둔다. 에이엠티는 그것을 **읽어서 보여 주기만** 한다 —
// 여기서 새로 쓰지 않는다(쓰면 「마지막에 만진 때」 가 되어 버린다).
// 옛 발주에는 그 칸이 없다 — 그때는 아무것도 지어내지 않고 비워 둔다.
import { 브라우저열기, devices, 서버, 자재, 그림칸 as 그림칸자리 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const 그림칸 = 그림칸자리();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const URL = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const b = await 브라우저열기();
let 실패 = 0; const 판 = (n, t, v) => { if (!t) 실패++; console.log((t ? '  OK  ' : '  FAIL') + '  ' + n + '   → ' + v); };
const ctx = await b.newContext({ ...devices['iPhone 12'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
await ctx.route('https://cdn.tailwindcss.com*', r => r.fulfill({ status: 200, contentType: 'application/javascript',
  body: 'document.write(' + JSON.stringify('<style>' + CSS + '</style>') + ');' }));
for (const [무늬, 길] of [['https://cdn.sheetjs.com/**', 'node_modules/xlsx/dist/xlsx.full.min.js'],
                          ['https://cdn.jsdelivr.net/npm/sortablejs**', 'node_modules/sortablejs/Sortable.min.js'],
                          ['https://cdn.jsdelivr.net/npm/gsap**', 'node_modules/gsap/dist/gsap.min.js']])
  await ctx.route(무늬, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: readFileSync(HERE + '/' + 길, 'utf-8') }));
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1400);

const 차림 = await p.evaluate(() => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장','발주','도면','차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.__쓰기 = 0; const 셈 = () => async () => { window.__쓰기++; };
  window.db = {}; window.fbFirestore = { doc: () => ({}), updateDoc: 셈(), setDoc: 셈(), deleteDoc: 셈(), addDoc: 셈(),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  // 진짜 파이어스토어가 주는 꼴 그대로 — Timestamp 는 seconds 를 들고 온다
  const 새것 = { idNum: 1501, docId: 'n1', orderCode: '조혼-20260929-01', supplier: '조혼가구',
    displayName: '(KRW) 알렉스 800 높은 수납장 올화이트', orderQty: 44, deliveryDate: '2026-09-30',
    amtTimeline: false, amtRegistered: false, partInfoMap: {}, criteria: [],
    createdAt: { seconds: Math.floor(new Date('2026-09-29T14:07:00').getTime() / 1000), nanoseconds: 0 } };
  const 옛것 = { idNum: 1502, docId: 'n2', orderCode: '조혼-20260929-02', supplier: '조혼가구',
    displayName: '(HA)토리 5단 서랍장_크림버치', orderQty: 55, deliveryDate: '2026-09-30',
    amtTimeline: false, amtRegistered: false, partInfoMap: {}, criteria: [] };   // createdAt 없음 = 옛 발주
  confirmedOrders.length = 0; confirmedOrders.push(새것, 옛것);
  // 거래처를 안 고르면 발주 목록이 안 열린다 — 앱이 쓰는 그 길로 「전체」 를 고른다
  if (typeof amtVendorPick === 'function') amtVendorPick('*');
  appMode = 'order';
  if (typeof renderPendingOrders === 'function') renderPendingOrders();
  const 칸 = document.getElementById('pending-order-list-body') || document.getElementById('main-container');
  return { 그림: (칸 ? 칸.textContent : '').replace(/\s+/g, ' ').trim().slice(0, 200) };
});
await p.waitForTimeout(400);

const 본 = await p.evaluate(() => {
  const 줄 = [...document.querySelectorAll('[id^="pending-item-"], .pending-order-card, #pending-order-list-body > div')];
  const 글 = (document.getElementById('pending-order-list-body') || document.body).textContent.replace(/\s+/g, ' ');
  const 등록 = [...document.querySelectorAll('.발주-등록')].map(e => e.textContent.replace(/\s+/g, ' ').trim());
  return { 줄수: 줄.length, 등록, 글: 글.slice(0, 260),
           셈: (typeof _등록시각 === 'function') ? {
             초: _등록시각({ createdAt: { seconds: Math.floor(new Date('2026-09-29T14:07:00').getTime() / 1000) } }),
             밀리: _등록시각({ createdAt: new Date('2026-09-29T14:07:00').getTime() }),
             글자: _등록시각({ createdAt: '2026-09-29T14:07:00' }),
             없음: _등록시각({}), 널: _등록시각(null) } : null };
});
console.log('■ 화면: ' + 본.글);
console.log('■ 등록 줄: ' + JSON.stringify(본.등록));
console.log('■ 셈: ' + JSON.stringify(본.셈));

판('① 새 발주 줄에 등록 날짜와 시각이 보인다 (초는 없다)',
   본.등록.length === 1 && /등록\s*2026-09-29 14:07$/.test(본.등록[0]), JSON.stringify(본.등록));
판('② 옛 발주(칸 없음)에는 아무것도 지어내지 않는다', 본.등록.length === 1, 본.등록.length + '줄');
판('③ 파이어스토어 꼴을 다 읽는다 (Timestamp · 밀리초 · 글자)',
   !!본.셈 && 본.셈.초 === '2026-09-29 14:07' && 본.셈.밀리 === '2026-09-29 14:07' && 본.셈.글자 === '2026-09-29 14:07',
   JSON.stringify(본.셈));
판('③ 칸이 없으면 빈 글자다', !!본.셈 && 본.셈.없음 === '' && 본.셈.널 === '', JSON.stringify([본.셈?.없음, 본.셈?.널]));
판('④ 에이엠티는 등록시각을 쓰지 않는다 (파이어스토어 쓰기 0)',
   (await p.evaluate(() => window.__쓰기)) === 0, (await p.evaluate(() => window.__쓰기)) + '번');
판('375px 가로 스크롤 없다', (await p.evaluate(() => document.documentElement.scrollWidth)) <= 375, '375px');
// 사장님이 보시는 자리에서 찍는다 — 첫 화면에서 「발주확정 대기목록」 박스를 손가락으로 연다
const cdp = await ctx.newCDPSession(p);
const 자리 = await p.evaluate(() => { const bt = document.querySelector('button.amth-tile[onclick*="pending"]');
  if (!bt) return null; bt.scrollIntoView({ block: 'center' }); const r = bt.getBoundingClientRect();
  return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; });
if (자리) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 자리.x, y: 자리.y, radiusX: 14, radiusY: 14, force: 1 }] });
  await p.waitForTimeout(110);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(700);
}
const 보이나 = await p.evaluate(() => {
  const e = document.querySelector('.발주-등록');
  if (!e) return null;
  e.scrollIntoView({ block: 'center' });
  const r = e.getBoundingClientRect();
  return { 글: e.textContent.replace(/\s+/g, ' ').trim(), 폭: Math.round(r.width), 높이: Math.round(r.height),
           탭: document.body.className, 박스: document.documentElement.getAttribute('data-amtbox') };
});
await p.waitForTimeout(300);
console.log('■ 발주서 줄에서 : ' + JSON.stringify(보이나));
판('① 발주서 화면에서 그 줄이 눈에 보인다 (자리를 차지한다)',
   !!보이나 && /2026-09-29 14:07/.test(보이나.글) && 보이나.폭 > 0 && 보이나.높이 > 0, JSON.stringify(보이나));
await p.screenshot({ path: 그림칸 + '/regtime-375-등록시각.png' });
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
console.log(실패 === 0 ? 'regtime1   OK' : 'regtime1   FAIL (' + 실패 + ')');
await b.close(); process.exit(실패 === 0 ? 0 : 1);
