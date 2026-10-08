// 시간이 세 갈래다 — 일한 시간 · 멈춘 시간 · 빈 시간.
// 사장님 지시(09-28 04:03): 「잠시 멈춰진 시간또한 해당 부속카드의 시간에 분리하여
//   저장되어야 합니다.」
// 사장님 지시(09-28 04:06): 「취소시 작업시간은 이 카드에 쌓이는게 아닌 아무작업이
//   없었던 빈 시간이 되어 따로 저장 되어야 합니다. - 이는 공정작업중 작업자들의
//   패턴을 데이터화 하기위해 데이터를 축적해야 합니다」
// 그래서 — 취소한 분은 카드의 일한 시간에 한 푼도 안 들어가고 빈 시간 장부로 간다.
//          멈춘 분은 완료 기록에 따로 적힌다(일한 시간 칸은 뜻 그대로 둔다).
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
p.on('dialog', d => d.accept());
await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1500);

await p.evaluate(() => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장','발주','도면','차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.__빈시간 = [];
  const 쓰기 = async (ref, 값) => {
    Object.entries(값).forEach(([길, v]) => {
      const 토막 = 길.split('.'); const o = confirmedOrders.find(x => x.docId === ref.id);
      if (!o) return; let 자리 = o;
      토막.slice(0, -1).forEach(t => { 자리[t] = 자리[t] || {}; 자리 = 자리[t]; });
      자리[토막[토막.length - 1]] = v; }); };
  window.db = {}; window.storage = {};
  window.fbFirestore = { doc: (db, ...a) => ({ p: a.join('/'), id: a[a.length - 1] }),
    updateDoc: 쓰기, setDoc: async () => {}, deleteDoc: async () => {},
    addDoc: async (col, 줄) => { const p = (col && col.p) || '';
      if (/idle_times/.test(p)) window.__빈시간.push(줄);
      return { id: 'x' + Math.random().toString(36).slice(2, 7) }; },
    collection: (db, ...a) => ({ p: a.join('/') }),
    onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  const sk = '2026-09-15-재단';
  confirmedOrders.length = 0;
  confirmedOrders.push({ idNum: 1401, docId: 'd1', orderCode: '샘플-20260101-01',
    displayName: '(본)본보기 오픈장 1', orderQty: 50, amtTimeline: true,
    partInfoMap: {}, partCompletions: {}, partStarted: {}, deliveryDate: '2026-09-15' });
  const 한장 = { cKey: 'CUT_1', nm: '가와1', pm: 8, dq: 50, orderCode: '샘플-20260101-01',
    orderKey: 'd1', orderName: '(본)본보기 오픈장 1', plateName: 'PB-18T', coating: '양면',
    finish: '화이트', rw: 480, rd: 1015, isCuttingCard: true, sheets: 5, perSheet: 4,
    orderIdNum: 1401, pRowIndex: 11, boardW: 2440, boardH: 1220,
    boardParts: [{ lp: 0, tp: 0, wp: .2, hp: .83, bg: '#f5f5f4', dw: '480', dh: '1015' }],
    coveredOrderIds: [1401] };
  window.__sk = sk; window.__한장 = 한장;
  window._woBoringParts[sk] = [한장];
  window._woBoring[sk] = { pool: [], AMT: ['CUT_1'] };
  const 칸 = document.createElement('div');
  칸.id = '__무대'; 칸.className = 'wo-boring-mac-col';
  칸.style.cssText = 'position:fixed;left:0;top:0;width:375px;z-index:99999;background:#fff;padding:8px;box-sizing:border-box;';
  칸.innerHTML = _woPlacedCardHtml(한장, 'CUT_1', sk, 'AMT', _woGetOrderColorMap(sk), '');
  document.body.appendChild(칸);
});
await p.waitForTimeout(400);

const cdp = await ctx.newCDPSession(p);
const 짚기 = async (r, ms = 110) => {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.y, radiusX: 14, radiusY: 14, force: 1 }] });
  await p.waitForTimeout(ms);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(430);
};
const 톡 = async (sel) => {
  const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null;
    const b = e.getBoundingClientRect();
    return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) }; }, sel);
  if (!r) { console.log('   !! 못 집음: ' + sel); return false; }
  await 짚기(r); return true;
};
const 시작누르기 = async () => {
  const r = await p.evaluate(() => {
    const bt = document.querySelector('#__무대 .wo-boring-placed-card button[style*="3b82f6"]');
    if (!bt) return null; const b = bt.getBoundingClientRect();
    return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) }; });
  if (!r) { console.log('   !! ▶ 시작 못 집음'); return false; }
  await 짚기(r); return true;
};
// 몇 분 흐른 셈 치고 시계를 뒤로 돌린다 (진짜로 기다릴 수 없다)
const 시간되돌리기 = (분) => p.evaluate(분 => {
  const r = confirmedOrders[0].partStarted['card-1401-11']['재단'];
  r.startMs = r.startMs - 분 * 60000;
  if (r.멈춤시작ms) r.멈춤시작ms = r.멈춤시작ms - 분 * 60000;
  if (window._집중일) window._집중일.rec = r;
}, 분);
const 기록 = () => p.evaluate(() => ({
  시작: confirmedOrders[0].partStarted?.['card-1401-11']?.['재단'] || null,
  완료: confirmedOrders[0].partCompletions?.['card-1401-11']?.['재단'] || null,
  빈시간: window.__빈시간 }));

// ── ① 일 2분 → 취소 → 다시 시작 → 일 3분 → 완료
await 시작누르기();
await 시간되돌리기(2);
await 톡('#_집중취소');
await p.waitForTimeout(500);
const ㄱ = await 기록();
console.log('① 취소 직후: ' + JSON.stringify(ㄱ));
판('① 취소해도 일한 시간(쌓인분)에 안 쌓인다', _쌓인(ㄱ.시작) === 0, '쌓인분 ' + _쌓인(ㄱ.시작));
판('① 취소한 2분이 빈 시간 장부에 남는다',
   ㄱ.빈시간.length === 1 && Math.abs(ㄱ.빈시간[0].분 - 2) < 0.3, JSON.stringify(ㄱ.빈시간));
판('① 빈 시간 한 줄에 발주·상품·부속·공정·때가 다 붙는다',
   !!ㄱ.빈시간[0] && ㄱ.빈시간[0].발주번호 === 1401 && ㄱ.빈시간[0].상품명 === '(본)본보기 오픈장 1'
   && ㄱ.빈시간[0].부속키 === 'card-1401-11' && ㄱ.빈시간[0].공정 === '재단'
   && !!ㄱ.빈시간[0].시작ms && !!ㄱ.빈시간[0].끝ms && !!ㄱ.빈시간[0].날,
   JSON.stringify(ㄱ.빈시간[0]));

// 취소하면 카드가 「▶ 시작」 으로 돌아간다 — 무대를 다시 그리고 누른다
await p.evaluate(() => { document.getElementById('__무대').innerHTML =
  _woPlacedCardHtml(window.__한장, 'CUT_1', window.__sk, 'AMT', _woGetOrderColorMap(window.__sk), ''); });
await p.waitForTimeout(300);
await 시작누르기();
await 시간되돌리기(3);
const 일한분 = await p.evaluate(() => _일한분(confirmedOrders[0].partStarted['card-1401-11']['재단']));
console.log('① 다시 3분 일한 뒤 일한분: ' + 일한분);
판('① 카드의 일한 시간은 3분이다 (5분이 아니다)', Math.abs(일한분 - 3) < 0.3, 일한분 + '분');

// ── ② 멈춤 2분 → 다시 하기 → 완료. 멈춘 분이 따로 남는다.
await 톡('#_집중멈춤');            // STOP
await 시간되돌리기(2);
await 톡('#_집중멈춤');            // 다시 하기
const ㄴ = await 기록();
console.log('② 멈췄다 다시: ' + JSON.stringify(ㄴ.시작));
판('② 멈춘 2분이 기록에 따로 쌓인다', Math.abs((ㄴ.시작.멈춘분 || 0) - 2) < 0.3, '멈춘분 ' + (ㄴ.시작.멈춘분 || 0));
판('② 멈춘 분이 일한 시간 칸(쌓인분)으로 넘어가지 않는다', _쌓인(ㄴ.시작) === 0, '쌓인분 ' + _쌓인(ㄴ.시작));

// 한 번 더 멈췄다 간다 — 쌓이는지
await 톡('#_집중멈춤');
await 시간되돌리기(1);
await 톡('#_집중멈춤');
const ㄷ = await 기록();
판('② 여러 번 멈추면 멈춘 분도 쌓인다 (2 → 3)', Math.abs((ㄷ.시작.멈춘분 || 0) - 3) < 0.4,
   '멈춘분 ' + (ㄷ.시작.멈춘분 || 0));

// ── ③ 완료 — 일한 시간과 멈춘 시간이 갈라져 적힌다
// 10-08 부터는 파레트를 골라야 완료로 넘어간다(사장님 지시) — 손가락으로 A 를 먼저 누른다
await 톡('#_집중파레트 .집중-파[data-파="A"]');
await 톡('#_집중완료');
await p.waitForTimeout(500);
// 완료 팝업의 등록 단추를 진짜로 누른다
const 등록 = await (async () => {
  const i = await p.evaluate(() => [...document.querySelectorAll('#_partDoneModal button')]
    .findIndex(b => /_tlPartDoneSubmit/.test(b.getAttribute('onclick') || '')));
  if (i < 0) return '등록 단추 없음';
  const r = await p.evaluate(i => { const b = [...document.querySelectorAll('#_partDoneModal button')][i];
    const x = b.getBoundingClientRect();
    return { x: Math.round(x.x + x.width / 2), y: Math.round(x.y + x.height / 2) }; }, i);
  await 짚기(r, 110); return '눌림';
})();
console.log('③ 등록 단추: ' + 등록);
await p.waitForTimeout(700);
const ㄹ = await 기록();
console.log('③ 완료 기록: ' + JSON.stringify(ㄹ.완료));
판('③ 완료에 일한 시간이 적힌다 (취소분 빼고)', !!ㄹ.완료 && Math.abs(ㄹ.완료.actualMinutes - 6) < 0.5,
   (ㄹ.완료 || {}).actualMinutes + '분');
판('③ 완료에 멈춘 시간이 따로 적힌다', !!ㄹ.완료 && Math.abs((ㄹ.완료.pausedMinutes || 0) - 3) < 0.5,
   (ㄹ.완료 || {}).pausedMinutes + '분');
판('③ 빈 시간 장부는 그대로 한 줄 (완료가 더 쓰지 않는다)', ㄹ.빈시간.length === 1, ㄹ.빈시간.length + '줄');

// ── ④ 화면에도 갈라져 보인다
const 화면 = await p.evaluate(() => {
  const 칸 = document.getElementById('__무대');
  칸.innerHTML = _woPlacedCardHtml(window.__한장, 'CUT_1', window.__sk, 'AMT', _woGetOrderColorMap(window.__sk), '');
  return (칸.textContent || '').replace(/\s+/g, ' ').trim();
});
console.log('④ 카드 글: ' + 화면);
판('④ 카드에 일한 시간과 멈춘 시간이 갈라져 보인다', /완료/.test(화면) && /멈춤/.test(화면), 화면.slice(0, 90));
판('④ 카드 글이 구구절절하지 않다 (문장이 아니다)', !/(습니다|주세요)/.test(화면), 화면.slice(0, 60));
await p.screenshot({ path: 그림칸 + '/idle-375-세갈래.png' });

// ── ⑤ 옛 기록은 예전처럼 — 새 칸이 없으면 0
const 옛것 = await p.evaluate(() => {
  const 옛 = { started: true, startMs: Date.now() - 5 * 60000, date: '2026-09-01', partName: '옛부속' };
  return { 일한분: _일한분(옛), 멈춘분: (옛.멈춘분 || 0), 쌓인분: _쌓인분(옛) }; });
판('⑤ 옛 기록은 새 칸이 없어도 예전처럼 읽힌다 (없으면 0)',
   Math.abs(옛것.일한분 - 5) < 0.3 && 옛것.멈춘분 === 0 && 옛것.쌓인분 === 0, JSON.stringify(옛것));

판('375px 가로 스크롤 없다', (await p.evaluate(() => document.documentElement.scrollWidth)) <= 375, '375px');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
console.log(실패 === 0 ? 'idle1   OK' : 'idle1   FAIL (' + 실패 + ')');
function _쌓인(r){ const v = Number(r && r.쌓인분); return Number.isFinite(v) && v > 0 ? v : 0; }
await b.close(); process.exit(실패 === 0 ? 0 : 1);
