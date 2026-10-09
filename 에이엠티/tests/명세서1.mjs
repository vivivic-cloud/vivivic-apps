// 「공정작업지시서상 공정카드의 작업이 완료가 되면 … 공정명이 적힌 헤더 우측 부분에
//  명세서 발급 버튼을 만들고 버튼을 누르면 해당일의 현재까지의 작업내용이 양식에 맞춰
//  나타나고 발급버튼으로 확정하여 인쇄하기 pdf / 엑셀 로 보내기가 가능하게 해주세요.」
//   — 사장님 말씀 (10-09)
// 머리줄 오른쪽에 단추가 서는지 · 닿는 자리가 44px 인지 · 진짜 손가락으로 눌렀을 때
// **그날 완료된 작업만** 양식대로 펴지는지 · 발급 전에는 인쇄·엑셀이 죽어 있는지 ·
// 파이어스토어에 한 줄도 안 쓰는지 를 잰다.
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

const 차림 = await p.evaluate(({ O, C, L }) => {
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
  const 날들 = [...new Set([...document.querySelectorAll('[onclick*="tlExpandDateCard"]')]
    .map(e => (e.getAttribute('onclick').match(/tlExpandDateCard\('([^']+)'/) || [])[1]).filter(Boolean))];
  const 고른 = 날들.find(d => { const m = window._tlDcGetItems(d); return m && m['재단'] && m['재단'].items && m['재단'].items.length; });
  if (!고른) return { 못세움: true, 날수: 날들.length };
  window.tlExpandDateCard(고른); window.tlDcExpandSection('재단');
  return { 날: 고른 };
}, { O, C, L });
console.log('■ 차림: ' + JSON.stringify(차림));
if (차림.못세움) { console.log('명세서1   FAIL (재단 일감이 있는 날을 못 찾음)'); process.exit(1); }
await p.waitForTimeout(400);

// ── 그날 재단 카드 가운데 둘을 완료로 심는다 (이 창의 복사본에만) ──────────────
const 심기 = await p.evaluate((날) => {
  const sk = 날 + '-재단';
  const 카드들 = (window._woBoringParts || {})[sk] || [];
  if (!카드들.length) return { 카드없음: true };
  const 심은 = [];
  카드들.slice(0, 2).forEach(c => {
    const o = confirmedOrders.find(x => (x.docId || String(x.idNum)) === c.orderKey)
           || confirmedOrders.find(x => (c.coveredOrderIds || []).includes(x.idNum));
    if (!o) return;
    const ck = window._woPartKey(c.cKey, o.docId || String(o.idNum), c);
    o.partCompletions = o.partCompletions || {};
    o.partCompletions[ck] = Object.assign({}, o.partCompletions[ck], {
      '재단': { done: true, date: 날, partName: c.nm || '부속', actualQty: c.dq || 0, actualMinutes: 1 } });
    심은.push({ 칸: ck, 이름: c.nm, 몫: c.dq, 매: c.sheets, 발주: o.orderCode });
  });
  window.tlDcExpandSection('재단');
  return { 심은 };
}, 차림.날);
console.log('■ 심은 완료: ' + JSON.stringify(심기));
if (심기.카드없음 || !심기.심은 || !심기.심은.length) { console.log('명세서1   FAIL (재단 카드를 못 찾음)'); process.exit(1); }
await p.waitForTimeout(400);

const 단추 = await p.evaluate(() => {
  const e = document.querySelector('#tl-datecard-expand .tl-dc-single-hdr .명세-단추');
  if (!e) return { 없음: true, 머리: (document.querySelector('#tl-datecard-expand .tl-dc-single-hdr')?.textContent || '').trim() };
  const r = e.getBoundingClientRect();
  const a = getComputedStyle(e, '::after');
  const hdr = e.parentElement.getBoundingClientRect();
  return { 글: (e.textContent || '').trim(), 폭: Math.round(r.width), 높이: Math.round(r.height),
           닿는높이: parseFloat(a.height) || 0,
           오른쪽끝: Math.round(hdr.right - r.right), 문서가로: document.documentElement.scrollWidth };
});
console.log('■ 단추: ' + JSON.stringify(단추));
판('① 공정명 머리줄에 「명세서」 단추가 선다', !단추.없음 && 단추.글 === '명세서', JSON.stringify(단추));
판('① 머리줄 **오른쪽 끝**에 붙는다', !단추.없음 && 단추.오른쪽끝 <= 20, 단추.오른쪽끝 + 'px 남음');
판('① 닿는 자리가 44px 이상이다 (장갑 낀 손)',
   !단추.없음 && 단추.닿는높이 >= 44 && 단추.폭 >= 44, 단추.폭 + '×' + 단추.닿는높이);

await 짚기('#tl-datecard-expand .tl-dc-single-hdr .명세-단추');
const 판본 = await p.evaluate(() => {
  const 판 = document.getElementById('명세서판');
  if (!판) return { 안열림: true };
  const 줄 = [...판.querySelectorAll('.명세-표 tr')].map(tr => (tr.textContent || '').replace(/\s+/g, ' ').trim());
  const 머리 = (판.querySelector('.명세-제목')?.textContent || '').trim();
  const 표수 = 판.querySelectorAll('.명세-표').length;
  return { 머리, 표수, 줄수: 줄.length, 줄: 줄.slice(0, 6),
           몰라: 판.querySelectorAll('.명세-몰라').length,
           발급: !document.getElementById('명세-발급')?.disabled,
           인쇄죽음: !!document.getElementById('명세-인쇄')?.disabled,
           엑셀죽음: !!document.getElementById('명세-엑셀')?.disabled,
           번호: (document.getElementById('명세-번호')?.textContent || '').trim(),
           문서가로: document.documentElement.scrollWidth, 쓰기: window.__쓰기 };
});
console.log('■ 펴진 명세서: ' + JSON.stringify(판본));
판('② 단추를 누르면 명세서가 펴진다', !판본.안열림, JSON.stringify(판본.머리 || ''));
판('② 양식대로 두 쪽이다 (내역 + 원장 소요량)', 판본.표수 === 2, 판본.표수 + '개');
판('② 그날 완료된 작업이 줄로 선다', 판본.줄수 >= 4, 판본.줄수 + '줄 / ' + JSON.stringify(판본.줄.slice(2, 4)));
판('② 심은 부속 이름이 그 안에 보인다',
   !판본.안열림 && 심기.심은.some(x => 판본.줄.join(' ').includes(String(x.이름))) ,
   JSON.stringify(심기.심은.map(x => x.이름)) + ' / ' + JSON.stringify(판본.줄.slice(2, 5)));
판('③ 모르는 칸은 빨간 「?」 로 둔다 (지어내지 않는다)', 판본.몰라 >= 6, 판본.몰라 + '칸');
판('④ 발급 전에는 인쇄·엑셀이 죽어 있다', 판본.인쇄죽음 === true && 판본.엑셀죽음 === true,
   '인쇄죽음 ' + 판본.인쇄죽음 + ' · 엑셀죽음 ' + 판본.엑셀죽음);
판('④ 발급 전에는 발급번호가 없다', 판본.번호 === '', JSON.stringify(판본.번호));

await 짚기('#명세-발급');
const 발급뒤 = await p.evaluate(() => ({
  번호: (document.getElementById('명세-번호')?.textContent || '').trim(),
  발급죽음: !!document.getElementById('명세-발급')?.disabled,
  인쇄살음: !document.getElementById('명세-인쇄')?.disabled,
  엑셀살음: !document.getElementById('명세-엑셀')?.disabled,
  쓰기: window.__쓰기, 문서가로: document.documentElement.scrollWidth }));
console.log('■ 발급 뒤: ' + JSON.stringify(발급뒤));
판('⑤ 발급을 누르면 번호가 찍힌다', /\d{8}-재단/.test(발급뒤.번호), JSON.stringify(발급뒤.번호));
판('⑤ 그제야 인쇄·엑셀이 살아난다', 발급뒤.인쇄살음 === true && 발급뒤.엑셀살음 === true,
   '인쇄 ' + 발급뒤.인쇄살음 + ' · 엑셀 ' + 발급뒤.엑셀살음);
판('⑤ 두 번 발급되지 않는다', 발급뒤.발급죽음 === true, String(발급뒤.발급죽음));

await 짚기('#명세서판 .명세-닫기');
const 닫힘 = await p.evaluate(() => !document.getElementById('명세서판'));
판('⑥ 닫기를 누르면 닫힌다', 닫힘 === true, String(닫힘));
판('⑦ 파이어스토어에 한 줄도 안 쓴다', 발급뒤.쓰기 === 0, 발급뒤.쓰기 + '번');
판('⑦ 375px 가로 스크롤 없다', 발급뒤.문서가로 <= 375, 발급뒤.문서가로 + 'px');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '명세서1   OK' : '명세서1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
