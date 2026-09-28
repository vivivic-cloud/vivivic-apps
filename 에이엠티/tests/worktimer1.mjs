// 집중 창의 시계는 100분의 1초까지 돈다 — 보이는 것만. 기록은 분(分) 그대로다.
// 사장님 지시(09-28 03:56): 「타이머는 100분의 1초단위로 긴장감을 주세요」
// 그러면서 지킬 것 — 카드를 통째로 다시 그리지 않는다(글자만 갈아 끼운다),
// 창을 닫으면 시계가 멈춘다(타이머가 새면 안 된다), partCompletions.actualMinutes
// 는 분 그대로다.
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
// 살아 있는 타이머를 센다 — 창을 닫고도 남아 도는 것이 없어야 한다
await p.addInitScript(() => {
  window.__산타이머 = new Set();
  const si = window.setInterval, ci = window.clearInterval;
  window.setInterval = function(...a){ const id = si.apply(this, a); window.__산타이머.add(id); return id; };
  window.clearInterval = function(id){ window.__산타이머.delete(id); return ci.call(this, id); };
});
await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1500);

await p.evaluate(() => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장','발주','도면','차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  const 쓰기 = async (ref, 값) => {
    Object.entries(값).forEach(([길, v]) => {
      const 토막 = 길.split('.'); const o = confirmedOrders.find(x => x.docId === ref.id);
      if (!o) return; let 자리 = o;
      토막.slice(0, -1).forEach(t => { 자리[t] = 자리[t] || {}; 자리 = 자리[t]; });
      자리[토막[토막.length - 1]] = v; }); };
  window.db = {};
  window.fbFirestore = { doc: (db, ...a) => ({ p: a.join('/'), id: a[a.length - 1] }),
    updateDoc: 쓰기, setDoc: async () => {}, deleteDoc: async () => {}, addDoc: async () => {},
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
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
  window.__sk = sk;
  window._woBoringParts[sk] = [한장];
  window._woBoring[sk] = { pool: [], AMT: ['CUT_1'] };
  const 칸 = document.createElement('div');
  칸.id = '__무대'; 칸.className = 'wo-boring-mac-col';
  칸.style.cssText = 'position:fixed;left:0;top:0;width:375px;z-index:99999;background:#fff;padding:8px;box-sizing:border-box;';
  칸.innerHTML = _woPlacedCardHtml(한장, 'CUT_1', sk, 'AMT', _woGetOrderColorMap(sk), '');
  document.body.appendChild(칸);
});
await p.waitForTimeout(400);
const 타이머수 = () => p.evaluate(() => window.__산타이머.size);
const 창밖타이머 = await 타이머수();

const cdp = await ctx.newCDPSession(p);
const 짚기 = async (r, ms = 110) => {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.y, radiusX: 14, radiusY: 14, force: 1 }] });
  await p.waitForTimeout(ms);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(420);
};
const 톡 = async (sel) => {
  const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null;
    const b = e.getBoundingClientRect();
    return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) }; }, sel);
  if (!r) { console.log('   !! 못 집음: ' + sel); return false; }
  await 짚기(r); return true;
};
const 시계 = () => p.evaluate(() => (document.getElementById('_집중시계글') || {}).textContent || '');

// 시작 — 진짜 손가락으로
await 톡('#__무대 .wo-boring-placed-card button[style*="3b82f6"]');
await p.evaluate(() => { window.__시계노드 = document.getElementById('_집중시계글');
                         window.__판노드 = document.getElementById('_집중판'); });
const ㄱ = await 시계();
await p.waitForTimeout(160);
const ㄴ = await 시계();
await p.waitForTimeout(160);
const ㄷ = await 시계();
console.log('■ 시계 글: ' + JSON.stringify([ㄱ, ㄴ, ㄷ]));
판('① 시계가 100분의 1초까지 나온다', /^\d+:\d{2}\.\d{2}$/.test(ㄷ), '「' + ㄷ + '」');
판('① 0.16초 사이에도 숫자가 움직인다 (긴장감)', ㄱ !== ㄴ && ㄴ !== ㄷ, [ㄱ, ㄴ, ㄷ].join(' → '));
const 백분자리 = await p.evaluate(() => {
  const 값 = []; const g = document.getElementById('_집중시계글');
  return new Promise(r => { let n = 0;
    const t = setInterval(() => { 값.push(g.textContent); if (++n >= 6) { clearInterval(t); r(값); } }, 60); });
});
판('① 100분의 1초 자리가 실제로 바뀐다', new Set(백분자리).size >= 5, 백분자리.join(' '));

// ② 글자만 갈아 끼운다 — 창도 시계 칸도 통째로 다시 그리지 않는다
const 그대로 = await p.evaluate(() => ({
  시계노드: window.__시계노드 === document.getElementById('_집중시계글'),
  판노드: window.__판노드 === document.getElementById('_집중판') }));
console.log('■ 노드 그대로: ' + JSON.stringify(그대로));
판('② 시계 칸을 통째로 다시 그리지 않는다 (글자만 바뀐다)', 그대로.시계노드 === true, JSON.stringify(그대로));
판('② 집중 창도 다시 그리지 않는다', 그대로.판노드 === true, String(그대로.판노드));

// ③ 기록은 분(分) 그대로다
const 기록 = await p.evaluate(() => {
  const r = confirmedOrders[0].partStarted['card-1401-11']['재단'];
  r.startMs = r.startMs - 4 * 60000;                 // 4분 흐른 셈
  if (window._집중일) window._집중일.rec = r;
  return { 일한분: _일한분(r), 쌓인분: _쌓인분(r) }; });
console.log('■ 기록(분): ' + JSON.stringify(기록));
판('③ 기록에 쓰는 값은 분(分) 그대로다 (4.0 언저리, 소수 한 자리)',
   Math.abs(기록.일한분 - 4) < 0.2 && Math.round(기록.일한분 * 10) === 기록.일한분 * 10,
   기록.일한분 + '분');

await p.screenshot({ path: 그림칸 + '/worktimer-375-시계.png' });

// ④ 창을 닫으면 시계가 멈춘다 — 타이머가 새면 안 된다
await 톡('#_집중취소');
await p.waitForTimeout(600);
const 닫은뒤 = await 타이머수();
console.log('■ 살아 있는 타이머: 창 열기 전 ' + 창밖타이머 + ' → 닫은 뒤 ' + 닫은뒤);
판('④ 창을 닫으면 시계 타이머가 남지 않는다', 닫은뒤 <= 창밖타이머,
   창밖타이머 + ' → ' + 닫은뒤);
판('④ 닫은 뒤 시계 칸도 없다', (await p.evaluate(() => !!document.getElementById('_집중시계글'))) === false, '없음');

판('375px 가로 스크롤 없다', (await p.evaluate(() => document.documentElement.scrollWidth)) <= 375, '375px');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
console.log(실패 === 0 ? 'worktimer1   OK' : 'worktimer1   FAIL (' + 실패 + ')');
await b.close(); process.exit(실패 === 0 ? 0 : 1);
