// 「해당버튼 삭제하고 선택된 필터 재선택시 해당 필터가 풀린것으로 작동하게 해줘」
//   — 사장님 말씀 (10-11 11:08 · 원장재고 「거르기 풀기」 단추를 짚으심)
// 「거르기 풀기」 단추를 없애고, **켜진 알약을 다시 누르면 그 거르기가 풀리는** 것으로 간다.
// 거르는 셈과 알약·갈래 단추는 그대로다 — 단추 하나만 없앤다.
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
const cdp = await ctx.newCDPSession(p);
const 탭 = async (고르개, n = 0) => {
  const c = await p.evaluate(({ s, n }) => { const e = document.querySelectorAll(s)[n]; if (!e) return null;
    e.scrollIntoView({ block: 'center', inline: 'center' }); const b2 = e.getBoundingClientRect();
    return { x: Math.round(b2.x + b2.width / 2), y: Math.round(b2.y + b2.height / 2) }; }, { s: 고르개, n });
  if (!c) return false;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, radiusX: 14, radiusY: 14, force: 1 }] });
  await p.waitForTimeout(50);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(300); return true;
};

await p.evaluate((L) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  window.__쓰기 = 0; const 셈 = () => async () => { window.__쓰기++; };
  window.db = {}; window.storage = {};
  window.fbFirestore = { doc: () => ({}), updateDoc: 셈(), setDoc: 셈(), deleteDoc: 셈(), addDoc: 셈(),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, where: () => ({}), serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  currentFullData.length = 0; L.forEach(x => currentFullData.push(x));
  amtOpenStock();
}, L);
await p.waitForTimeout(400);

const 재기 = () => p.evaluate(() => ({
  머리: (document.getElementById('ams-sub')?.textContent || '').trim(),
  줄: document.querySelectorAll('#ams-list .ams-row').length,
  풀기단추: !!document.getElementById('ams-푼다'),
  색단추글: (document.querySelector('#ams-갈래 [data-갈래="색"]')?.textContent || '').trim(),
  색단추켜짐: !!document.querySelector('#ams-갈래 [data-갈래="색"]')?.classList.contains('on'),
  켜진칩: [...document.querySelectorAll('#ams-색 .amtb-chip.on, #ams-두께 .amtb-chip.on, #ams-가공 .amtb-chip.on')]
    .map(e => e.textContent.trim()),
  쓰기: window.__쓰기, 문서가로: document.documentElement.scrollWidth }));

const 처음 = await 재기();
console.log('■ 처음(아무것도 안 걸림): ' + JSON.stringify(처음));
판('① 「거르기 풀기」 단추가 없다 (사장님이 지우라 하신 그 단추)',
   처음.풀기단추 === false, '있나 ' + 처음.풀기단추);

// 색상 갈래를 펼치고 첫 알약을 누른다 — 진짜 손가락으로
await 탭('#ams-갈래 [data-갈래="색"]');
const 첫칩 = await p.evaluate(() => {
  const e = document.querySelector('#ams-색 .amtb-chip');
  return e ? { 글: e.textContent.trim(), 값: e.dataset['값'] || '' } : null;
});
console.log('■ 누를 알약: ' + JSON.stringify(첫칩));
if (!첫칩) { console.log('거르기1   FAIL (색상 알약이 하나도 없다)'); process.exit(1); }
await 탭('#ams-색 .amtb-chip');
const 건뒤 = await 재기();
console.log('■ 하나 건 뒤: ' + JSON.stringify(건뒤));
/* 이 화면은 **아무것도 안 걸면 목록을 비워 둔다**(거르지 않은 자재를 쭉 늘어놓지 않는다).
   그래서 걸면 줄이 늘고, 풀면 도로 빈다 — 그것이 「다 보기」 자리다. */
판('② 알약을 누르면 걸린다 (갈래 단추에 그 값이 적히고 그 몫만 나온다)',
   건뒤.색단추켜짐 === true && 건뒤.줄 > 0 && /짝/.test(건뒤.머리)
   && 건뒤.색단추글 === 첫칩.값,
   '색상 단추 「' + 건뒤.색단추글 + '」 · 줄 ' + 처음.줄 + ' → ' + 건뒤.줄 + ' · 머리 「' + 건뒤.머리 + '」');

// 같은 알약을 다시 누른다 — 갈래를 다시 펼쳐 그 자리에서
await 탭('#ams-갈래 [data-갈래="색"]');
const 펼친뒤 = await p.evaluate(() => ({
  켜진칩: [...document.querySelectorAll('#ams-색 .amtb-chip.on')].map(e => e.textContent.trim()) }));
판('③ 다시 펼치면 **고른 알약이 켜진 채**로 보인다 (무엇을 다시 눌러야 하는지 보인다)',
   펼친뒤.켜진칩.length === 1, JSON.stringify(펼친뒤.켜진칩));
await 탭('#ams-색 .amtb-chip.on');
const 푼뒤 = await 재기();
console.log('■ 그 알약을 다시 누른 뒤: ' + JSON.stringify(푼뒤));
판('③ **켜진 알약을 다시 누르면 풀린다** (단추 없이도 풀 수 있다)',
   푼뒤.색단추켜짐 === false && 푼뒤.켜진칩.length === 0,
   '색상 단추 「' + 푼뒤.색단추글 + '」 · 켜진 알약 ' + JSON.stringify(푼뒤.켜진칩));
판('④ 마지막 걸린 것을 풀면 **다 보기**로 돌아간다 (처음과 같은 줄 수·머리글)',
   푼뒤.줄 === 처음.줄 && 푼뒤.머리 === 처음.머리,
   '줄 ' + 푼뒤.줄 + ' = ' + 처음.줄 + ' · 머리 「' + 푼뒤.머리 + '」');

const 자리 = await p.evaluate(() => {
  const 재 = e => { const r = e.getBoundingClientRect(); return { 폭: Math.round(r.width), 높: Math.round(r.height) }; };
  return { 갈래: [...document.querySelectorAll('#ams-갈래 .amtb-chip')].map(재),
           알약: [...document.querySelectorAll('#ams-색 .amtb-chip')].slice(0, 3).map(재) };
});
console.log('■ 누르는 자리: ' + JSON.stringify(자리));
판('⑤ 갈래 단추가 44px 이상이다 (장갑 낀 손)',
   자리.갈래.length === 3 && 자리.갈래.every(x => x.높 >= 44), JSON.stringify(자리.갈래.map(x => x.높)));
판('⑥ 파이어스토어에 한 줄도 안 쓴다', 푼뒤.쓰기 === 0, 푼뒤.쓰기 + '번');
판('⑥ 375px 가로 스크롤 없다', 푼뒤.문서가로 <= 375, 푼뒤.문서가로 + 'px');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '거르기1   OK' : '거르기1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
