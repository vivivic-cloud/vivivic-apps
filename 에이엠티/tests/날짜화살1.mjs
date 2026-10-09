// 「날짜 좌우로 날짜를 변경 할 수 있는 화살표를 만들어 주세요.」
//   — 사장님 말씀 (10-09 03:05 · 공정관리 날짜카드 머리 「20 10월 화요일」 자리)
// 화살표 둘이 서는지 · 44px 인지 · 진짜 손가락으로 눌렀을 때 **날짜와 그 안의 내용이
// 같이 바뀌는지**(날짜 글·카드 수) · 파이어스토어에 안 쓰는지 를 잰다.
import { 브라우저열기, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const URL = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const O = await 자료('confirmed_orders'); const C = await 자료('cutting_plans'); const L = await 자료('원장');
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

const 첫날 = await p.evaluate(({ O, C, L }) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장', '발주', '도면', '차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.__쓰기 = 0; const 셈 = () => async () => { window.__쓰기++; };
  window.db = {}; window.storage = {};
  window.fbFirestore = { doc: () => ({}), updateDoc: 셈(), setDoc: 셈(), deleteDoc: 셈(), addDoc: 셈(),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  currentFullData.length = 0; L.forEach(r => currentFullData.push(r));
  confirmedOrders.length = 0;
  O.filter(o => o.amtTimeline === true && !o.amtConfirmedCancel).forEach(o => confirmedOrders.push(o));
  window._cuttingPlans = {}; C.forEach(c => { window._cuttingPlans[c.confirmId || c.docId] = c; });
  document.documentElement.removeAttribute('data-amthome');
  document.documentElement.removeAttribute('data-amtstock');
  switchPage('process'); appMode = 'process'; renderProcessTimeline();
  // 일감이 있는 날을 하나 고른다 — 없으면 아무 날이나
  const 날들 = [...new Set([...document.querySelectorAll('[onclick*="tlExpandDateCard"]')]
    .map(e => (e.getAttribute('onclick').match(/tlExpandDateCard\('([^']+)'/) || [])[1]).filter(Boolean))];
  const 고른 = 날들.find(d => { const m = window._tlDcGetItems(d); return m && Object.keys(m).length; }) || 날들[0];
  if (!고른) return { 못세움: true };
  window.tlExpandDateCard(고른);
  return { 날: 고른, 날수: 날들.length };
}, { O, C, L });
console.log('■ 차림: ' + JSON.stringify(첫날));
if (첫날.못세움) { console.log('날짜화살1   FAIL (날짜카드를 못 찾음)'); process.exit(1); }
await p.waitForTimeout(300);

const 재기 = () => p.evaluate(() => {
  const hdr = document.querySelector('#tl-datecard-expand .tl-dc-hdr');
  const 화살 = [...document.querySelectorAll('#tl-datecard-expand .tl-dc-날짜화살')].map(e => {
    const r = e.getBoundingClientRect();
    return { 글: (e.textContent || '').trim(), 폭: Math.round(r.width), 높이: Math.round(r.height),
             이름: e.getAttribute('aria-label') || '' }; });
  return { 날: window._tlDcDate,
           머리글: hdr ? (hdr.textContent || '').replace(/\s+/g, ' ').trim() : '',
           화살, 칸수: document.querySelectorAll('#tl-datecard-expand .tl-dc-grid-cell, #tl-datecard-expand [onclick*="tlDcExpandSection"]').length,
           카드수: document.querySelectorAll('#tl-datecard-expand .wo-boring-placed-card, #tl-datecard-expand .tl-delivery-item').length,
           쓰기: window.__쓰기, 문서가로: document.documentElement.scrollWidth };
});
const 처음 = await 재기();
console.log('■ 처음: ' + JSON.stringify(처음));
판('① 날짜 좌우에 화살표가 둘 선다', 처음.화살.length === 2, JSON.stringify(처음.화살.map(x => x.글)));
판('① 둘 다 44px 이상이다 (장갑 낀 손)',
   처음.화살.length === 2 && 처음.화살.every(x => x.폭 >= 44 && x.높이 >= 44),
   JSON.stringify(처음.화살.map(x => x.폭 + '×' + x.높이)));
판('① 왼쪽이 하루 전 · 오른쪽이 하루 뒤라고 적혀 있다',
   처음.화살.length === 2 && /전/.test(처음.화살[0].이름) && /뒤/.test(처음.화살[1].이름),
   JSON.stringify(처음.화살.map(x => x.이름)));

// ② 오른쪽을 진짜 손가락으로 누른다 — 하루 뒤로
const 하루뒤 = (날, 걸음) => { const d = new Date(날 + 'T00:00:00'); d.setDate(d.getDate() + 걸음);
  return d.toISOString().slice(0, 10); };
await 짚기('#tl-datecard-expand .tl-dc-날짜화살[aria-label="하루 뒤"]');
const 뒤 = await 재기();
console.log('■ 하루 뒤: ' + JSON.stringify(뒤));
판('② 오른쪽을 누르면 하루 뒤로 간다', 뒤.날 === 하루뒤(첫날.날, 1), 첫날.날 + ' → ' + 뒤.날);
판('② 머리 글자도 그 날짜로 바뀐다', 뒤.머리글 !== 처음.머리글 && 뒤.머리글.length > 0,
   '전 「' + 처음.머리글.slice(0, 24) + '」 → 후 「' + 뒤.머리글.slice(0, 24) + '」');
판('② 판 안의 내용도 그 날짜 것으로 다시 선다 (칸이 다시 그려진다)',
   뒤.칸수 > 0, '칸 ' + 처음.칸수 + '개 → ' + 뒤.칸수 + '개 · 카드 ' + 처음.카드수 + ' → ' + 뒤.카드수);

// ③ 왼쪽을 두 번 눌러 하루 전으로
await 짚기('#tl-datecard-expand .tl-dc-날짜화살[aria-label="하루 전"]');
const 되돌이 = await 재기();
판('③ 왼쪽을 누르면 하루 전으로 돌아온다', 되돌이.날 === 첫날.날, 뒤.날 + ' → ' + 되돌이.날);
await 짚기('#tl-datecard-expand .tl-dc-날짜화살[aria-label="하루 전"]');
const 앞 = await 재기();
판('③ 한 번 더 누르면 또 하루 전이다', 앞.날 === 하루뒤(첫날.날, -1), 되돌이.날 + ' → ' + 앞.날);
판('③ 그 날에도 화살표는 그대로 둘이다', 앞.화살.length === 2, JSON.stringify(앞.화살.map(x => x.글)));

// ④ 공정 칸을 펴 놓고 날짜를 옮기면 그 공정이 새 날짜에서 다시 선다
const 공정옮김 = await p.evaluate((날) => {
  window.tlExpandDateCard(날);
  const 칸 = window._tlDcGetItems(날) || {};
  const 공정 = Object.keys(칸)[0];
  if (!공정) return { 공정없음: true };
  window.tlDcExpandSection(공정);
  const 전 = { 공정, 섹션: !!document.querySelector('#tl-datecard-expand .tl-dc-single-sec'),
               머리: (document.querySelector('#tl-datecard-expand .tl-dc-single-hdr')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30) };
  window.tlDc날짜옮기기(1);
  const 후 = { 날: window._tlDcDate, 섹션: !!document.querySelector('#tl-datecard-expand .tl-dc-single-sec'),
               머리: (document.querySelector('#tl-datecard-expand .tl-dc-single-hdr')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30) };
  return { 전, 후 };
}, 첫날.날);
console.log('■ 공정 칸을 펴 놓고 옮김: ' + JSON.stringify(공정옮김));
판('④ 공정 칸을 보던 중이면 새 날짜에서도 그 공정이 선다 (없으면 격자)',
   !!공정옮김.공정없음 || 공정옮김.후.날 === 하루뒤(첫날.날, 1),
   JSON.stringify(공정옮김));

const 끝 = await 재기();
판('⑤ 파이어스토어에 한 줄도 안 쓴다 (화살표는 보는 것이다)', 끝.쓰기 === 0, 끝.쓰기 + '번');
판('⑤ 375px 가로 스크롤 없다', 끝.문서가로 <= 375, 끝.문서가로 + 'px');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '날짜화살1   OK' : '날짜화살1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
