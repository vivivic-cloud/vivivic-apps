// 재단 편집에서 **발주에 없는 부속도** 불러올 수 있어야 한다.
// 사장님 지시(10-01 03:47): 「재단 편집시 자동으로 불러오는 가능 부속외에 다른
//   부속(발주에 없더라도)을 불러올수 있도록 해줘 - 조건은 원본정보에서 동일원장
//   (예: PB-28TLPM-양면-발리오크)을 사용하는 다른 부속중 원주문부속의 재단회전등으로
//   추가재단 가능성이 있는 모든 부속들」
// 좁히는 자는 우리가 짓지 않는다 — 같은 원장이면 다 보이고, 고르는 것은 사장님이다.
// 그리고 발주 밖 부속이 **발주 자료·공정 진행에 아무 작용도 남기면 안 된다.**
import { 브라우저열기, devices, 서버, 자료, 자재, 그림칸 as 그림칸자리 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const 그림칸 = 그림칸자리();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const URL = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const L = await 자료('원장'), O = await 자료('confirmed_orders'), C = await 자료('cutting_plans');
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
p.on('dialog', d => d.accept());
await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1500);

const 차림 = await p.evaluate(({ L, O, C }) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장','발주','도면','차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.__쓴칸 = [];
  const 셈 = (이름) => async (ref) => { window.__쓴칸.push((ref && ref.p) || 이름); };
  window.db = {}; window.fbFirestore = {
    doc: (db, ...a) => ({ p: a.join('/'), id: a[a.length - 1] }),
    updateDoc: 셈('updateDoc'), setDoc: 셈('setDoc'), deleteDoc: 셈('deleteDoc'),
    addDoc: async (col) => { window.__쓴칸.push((col && col.p) || 'addDoc'); return { id: 'x' }; },
    collection: (db, ...a) => ({ p: a.join('/') }), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  currentFullData.length = 0; L.forEach(r => currentFullData.push(r));
  confirmedOrders.length = 0; O.forEach(x => confirmedOrders.push(x));
  window._cuttingPlans = {}; C.forEach(x => { window._cuttingPlans[x.confirmId] = x; });
  // 발주에 걸린 원장 하나를 고른다 (cutfill1 과 같은 길)
  let 고른 = null;
  confirmedOrders.forEach(ord => {
    if (고른) return;
    Object.entries(ord.partInfoMap || {}).forEach(([k, v]) => {
      if (고른 || !v || v.isDeleted) return;
      const s = (v.plateName || '') + (v.finish || '') + '-' + (v.finishColor || '');
      if (s.length > 3) 고른 = { ord, plate: s };
    });
  });
  if (!고른) return { 탈: '발주에 걸린 원장을 못 찾았습니다' };
  // 재단편집 화면은 「재단발주」 탭에서만 보인다 — 앱이 쓰는 그 길로 연다
  document.documentElement.removeAttribute('data-amthome');
  switchPage('cutting');
  window._editingCuttingPlan = null;
  showSubParts(고른.plate, [고른.ord]);
  const 적기 = () => [...document.querySelectorAll('.inner-part-card')].map(c => ({
    id: c.id, 이름: c.dataset.name, 행: c.dataset.rowIndex, 발주밖: c.dataset.발주밖 === '1',
    글: (c.textContent || '').replace(/\s+/g, ' ').trim() }));
  window.__처음 = 적기();
  // 이 원장을 쓰는 원본정보 줄이 모두 몇인지 — 우리 잣대와 같은 자로 센다
  const h = currentFullData[0];
  const 자 = (row) => (row[h.indexOf('원장명')] || '') + (row[h.indexOf('마감')] || '') + '-'
    + normalizeValue(row[h.indexOf('마감색상')]);
  const 같은원장 = currentFullData.slice(1).filter(r => 자(r) === 고른.plate).length;
  return { 원장: 고른.plate, 발주: 고른.ord.idNum, 자동: window.__처음.length, 같은원장,
           발주자료: JSON.stringify(confirmedOrders) };
}, { L, O, C });
console.log('■ 차림: ' + JSON.stringify({ ...차림, 발주자료: (차림.발주자료 || '').length + '자' }));
if (차림.탈) { console.log('  FAIL  ' + 차림.탈); await b.close(); process.exit(1); }

const cdp = await ctx.newCDPSession(p);
const 짚기 = async (r, ms = 110) => {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.y, radiusX: 14, radiusY: 14, force: 1 }] });
  await p.waitForTimeout(ms);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(450);
};
const 톡 = async (sel) => {
  const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null;
    e.scrollIntoView({ block: 'center' }); const b = e.getBoundingClientRect();
    if (!b.width || !b.height) return null;
    return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) }; }, sel);
  if (!r) { console.log('   !! 못 집음: ' + sel); return false; }
  await 짚기(r); return true;
};

// ── ① 단추가 있고, 누르면 같은 원장 부속이 더 올라온다
const 단추있나 = await p.evaluate(() => {
  const e = document.getElementById('id302-발주밖-단추'); if (!e) return null;
  const r = e.getBoundingClientRect();
  return { 글: (e.textContent || '').trim(), 높이: Math.round(r.height) };
});
console.log('① 단추: ' + JSON.stringify(단추있나));
판('① 「발주 밖 부속 불러오기」 단추가 있다', !!단추있나, JSON.stringify(단추있나));
판('① 그 단추는 장갑 낀 손으로 눌린다 (44px 이상)', !!단추있나 && 단추있나.높이 >= 44,
   (단추있나 ? 단추있나.높이 : 0) + 'px');
const 잰때 = Date.now();
await 톡('#id302-발주밖-단추');
console.log('① 펼치는 데 걸린 시간: ' + (Date.now() - 잰때) + 'ms (손가락 기다림 포함)');
const ㄱ = await p.evaluate(() => {
  const 다 = [...document.querySelectorAll('.inner-part-card')].map(c => ({
    id: c.id, 이름: c.dataset.name, 행: c.dataset.rowIndex, 발주밖: c.dataset.발주밖 === '1',
    결: c.dataset.grain, 글: (c.textContent || '').replace(/\s+/g, ' ').trim() }));
  const 밖 = 다.filter(x => x.발주밖);
  return { 다: 다.length, 밖: 밖.length, 보기: 밖.slice(0, 3),
    겹침: 밖.filter(x => window.__처음.some(y => y.행 === x.행)).length,
    결있는줄: 밖.filter(x => /결|그레인|▣|회전/.test(x.글) || x.결 != null).length,
    표붙은줄: 밖.filter(x => /발주 밖/.test(x.글)).length,
    처음그대로: JSON.stringify(다.filter(x => !x.발주밖).map(x => [x.id, x.이름, x.글]))
                === JSON.stringify(window.__처음.map(x => [x.id, x.이름, x.글])),
    가로: document.documentElement.scrollWidth };
});
console.log('① 불러온 뒤: ' + JSON.stringify({ ...ㄱ, 보기: ㄱ.보기 }));
판('① 발주 밖 부속이 올라온다', ㄱ.밖 > 0, ㄱ.밖 + '개 (자동 ' + 차림.자동 + '개 → 모두 ' + ㄱ.다 + '개)');
판('① 이미 올라온 것과 겹치지 않는다', ㄱ.겹침 === 0, ㄱ.겹침 + '개 겹침');
판('① 줄마다 「발주 밖」 표가 붙는다', ㄱ.표붙은줄 === ㄱ.밖, ㄱ.표붙은줄 + '/' + ㄱ.밖);
판('① 자동 목록은 한 줄도 안 바뀐다 (개수·차례·글자)', ㄱ.처음그대로 === true, String(ㄱ.처음그대로));
판('① 375px 가로 넘침 없다', ㄱ.가로 <= 375, ㄱ.가로 + 'px');
await p.screenshot({ path: 그림칸 + '/extra-375-발주밖.png' });

// ── ② 하나를 골라 재단확정까지 — 발주 자료·공정 진행이 한 자도 안 변해야 한다
const ㄴ = await p.evaluate(() => {
  const 밖카드 = [...document.querySelectorAll('.inner-part-card')].find(c => c.dataset.발주밖 === '1');
  if (!밖카드) return { 탈: '발주 밖 카드가 없다' };
  const 전발주 = JSON.stringify(confirmedOrders);
  handleCardClick(밖카드);
  return { 고름: primarySelectedCardId === 밖카드.id, 이름: 밖카드.dataset.name, 전발주 };
});
판('② 발주 밖 카드도 똑같이 골라진다', ㄴ.고름 === true, JSON.stringify({ 고름: ㄴ.고름, 이름: ㄴ.이름 }));
await 톡('#confirm-cutting-btn, button[onclick*="confirmCutting"]');
const ㄷ = await p.evaluate((전발주) => {
  const 목 = (typeof confirmedCuttingData !== 'undefined') ? confirmedCuttingData : [];
  const 새것 = 목[0] || null;
  return { 도면수: 목.length, 담긴도면: Object.keys(window._cuttingPlans || {}).length,
    새도면: 새것 ? { 발주밖: 새것.발주밖 === true, pOrderIds: 새것.pOrderIds, 이름: 새것.pDisplayName } : null,
    발주안변함: JSON.stringify(confirmedOrders) === 전발주,
    쓴칸: window.__쓴칸.slice(0, 6),
    발주쓰기: window.__쓴칸.filter(x => /confirmed_orders/.test(x)).length,
    시작기록: confirmedOrders.reduce((n, o) => n + Object.keys(o.partStarted || {}).length, 0),
    완료기록: confirmedOrders.reduce((n, o) => n + Object.keys(o.partCompletions || {}).length, 0) };
}, ㄴ.전발주);
console.log('② 재단확정 뒤: ' + JSON.stringify(ㄷ));
판('② 재단확정이 된다 (도면이 하나 생긴다)', ㄷ.도면수 >= 1, ㄷ.도면수 + '장');
판('② 그 도면에 「발주 밖」 표가 남는다', !!ㄷ.새도면 && ㄷ.새도면.발주밖 === true, JSON.stringify(ㄷ.새도면));
판('② 발주에 걸린 번호가 없다 (다음 단계로 안 샌다)',
   !!ㄷ.새도면 && (!ㄷ.새도면.pOrderIds || ㄷ.새도면.pOrderIds.length === 0), JSON.stringify(ㄷ.새도면 && ㄷ.새도면.pOrderIds));
판('② 발주 자료가 한 자도 안 변했다', ㄷ.발주안변함 === true, String(ㄷ.발주안변함));
판('② confirmed_orders 에 한 줄도 안 썼다', ㄷ.발주쓰기 === 0, ㄷ.발주쓰기 + '번 · 쓴 칸 ' + JSON.stringify(ㄷ.쓴칸));

판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
console.log(실패 === 0 ? 'extra1   OK' : 'extra1   FAIL (' + 실패 + ')');
await b.close(); process.exit(실패 === 0 ? 0 : 1);
