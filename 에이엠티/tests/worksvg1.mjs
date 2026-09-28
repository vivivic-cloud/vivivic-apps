// 시작하면 뜨는 집중 창에 그 일의 재단도면이 보여야 한다.
// 사장님 지시(09-28 03:55): 「시작시 나타나는 팝업화면은 해당 작업도면이 나타나야 합니다」
// 도면이 없는 부속은 빈 자리로 두지 않고 「도면 없음」 딱지를 단다.
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
  window.__쓴것 = [];
  const 쓰기 = async (ref, 값) => { window.__쓴것.push(ref.p);
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
  [1, 2].forEach(n => confirmedOrders.push({ idNum: 1400 + n, docId: 'd' + n,
    orderCode: '샘플-2026010' + n + '-01', displayName: '(본)본보기 오픈장 ' + n, orderQty: 50,
    amtTimeline: true, partInfoMap: {}, partCompletions: {}, partStarted: {}, deliveryDate: '2026-09-15' }));
  const 한장 = (n, 도면있음) => ({ cKey: 'CUT_' + n, nm: '가와' + n, pm: 8, dq: 50,
    orderCode: '샘플-2026010' + n + '-01', orderKey: 'd' + n, orderName: '(본)본보기 오픈장 ' + n,
    plateName: 'PB-18T', coating: '양면', finish: '화이트', rw: 480, rd: 1015,
    isCuttingCard: true, sheets: 5, perSheet: 4, orderIdNum: 1400 + n, pRowIndex: 10 + n,
    boardW: 2440, boardH: 1220,
    boardParts: 도면있음 ? [
      { lp: 0,   tp: 0,  wp: .2, hp: .83, bg: '#f5f5f4', dw: '480', dh: '1015' },
      { lp: .2,  tp: 0,  wp: .2, hp: .83, bg: '#f5f5f4', dw: '480', dh: '1015' },
      { lp: .4,  tp: 0,  wp: .2, hp: .83, bg: '#f5f5f4', dw: '480', dh: '1015' }] : [],
    coveredOrderIds: [1400 + n] });
  window.__sk = sk; window.__조각수 = 3;
  window._woBoringParts[sk] = [한장(1, true), 한장(2, false)];
  window._woBoring[sk] = { pool: [], AMT: ['CUT_1', 'CUT_2'] };
  const 칸 = document.createElement('div');
  칸.id = '__무대'; 칸.className = 'wo-boring-mac-col';
  칸.style.cssText = 'position:fixed;left:0;top:0;width:375px;z-index:99999;background:#fff;padding:8px;box-sizing:border-box;';
  칸.innerHTML = [[1, true], [2, false]].map(([n, d]) =>
    _woPlacedCardHtml(한장(n, d), 'CUT_' + n, sk, 'AMT', _woGetOrderColorMap(sk), '')).join('<div style="height:8px"></div>');
  document.body.appendChild(칸);
});
await p.waitForTimeout(400);

const cdp = await ctx.newCDPSession(p);
const 짚기 = async (r, ms = 110) => {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.y, radiusX: 14, radiusY: 14, force: 1 }] });
  await p.waitForTimeout(ms);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(450);
};
const 톡 = async (sel) => {
  const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null;
    const b = e.getBoundingClientRect();
    return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) }; }, sel);
  if (!r) { console.log('   !! 못 집음: ' + sel); return false; }
  await 짚기(r); return true;
};
const 시작누르기 = async (n) => {
  const r = await p.evaluate(n => {
    const 카 = document.querySelectorAll('#__무대 .wo-boring-placed-card')[n - 1];
    const bt = 카 && 카.querySelector('button[style*="3b82f6"]'); if (!bt) return null;
    const b = bt.getBoundingClientRect();
    return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) }; }, n);
  if (!r) { console.log('   !! 시작 단추 못 집음: ' + n); return false; }
  await 짚기(r); return true;
};
const 도면본다 = () => p.evaluate(() => {
  const 칸 = document.getElementById('_집중도면');
  const svg = 칸 ? 칸.querySelector('svg') : null;
  const r = svg ? svg.getBoundingClientRect() : null;
  return { 칸있나: !!칸, svg: !!svg, 조각: svg ? svg.querySelectorAll('rect').length : 0,
           폭: r ? Math.round(r.width) : 0, 높이: r ? Math.round(r.height) : 0,
           글: 칸 ? (칸.textContent || '').replace(/\s+/g, ' ').trim() : '',
           판: !!document.getElementById('_집중판'),
           시계: (document.getElementById('_집중시계글') || {}).textContent || '' };
});

// ① 도면이 있는 카드로 시작
await 시작누르기(1);
const ㄱ = await 도면본다();
console.log('① 도면 있는 카드 : ' + JSON.stringify(ㄱ));
판('① 시작하면 집중 창이 뜬다', ㄱ.판 === true, String(ㄱ.판));
판('① 집중 창에 그 일의 재단도면이 보인다', ㄱ.svg === true, JSON.stringify(ㄱ));
판('① 도면의 조각 수가 그 카드의 도면과 같다', ㄱ.조각 === (await p.evaluate(() => window.__조각수)),
   ㄱ.조각 + '조각');
판('① 375px 에서 알아볼 크기다 (폭 240px 이상)', ㄱ.폭 >= 240, ㄱ.폭 + 'x' + ㄱ.높이);
await p.screenshot({ path: 그림칸 + '/worksvg-375-집중도면.png' });

// ② 눌러서 크게 볼 수 있다 — 그래도 일하던 창과 시계는 그대로다
const 시계전 = ㄱ.시계;
await 톡('#_집중도면');
const 큰것 = await p.evaluate(() => {
  const e = document.getElementById('_집중도면큰것');
  const svg = e ? e.querySelector('svg') : null; const r = svg ? svg.getBoundingClientRect() : null;
  return { 떴나: !!e, 폭: r ? Math.round(r.width) : 0, 높이: r ? Math.round(r.height) : 0,
           판그대로: !!document.getElementById('_집중판'),
           시계: (document.getElementById('_집중시계글') || {}).textContent || '' }; });
console.log('② 크게 보기 : ' + JSON.stringify(큰것));
판('② 도면을 누르면 크게 보인다', 큰것.떴나 === true && 큰것.폭 > ㄱ.폭, JSON.stringify(큰것));
판('② 세로 폰에서는 눕혀서 크게 보인다 (높이 400px 이상)', 큰것.높이 >= 400,
   큰것.폭 + 'x' + 큰것.높이 + ' (창 안에서는 ' + ㄱ.폭 + 'x' + ㄱ.높이 + ')');
판('② 크게 봐도 집중 창은 그대로다', 큰것.판그대로 === true, String(큰것.판그대로));
판('② 크게 봐도 시계가 안 끊긴다', parseFloat(큰것.시계) >= parseFloat(시계전 || '0'),
   시계전 + ' → ' + 큰것.시계);
await p.screenshot({ path: 그림칸 + '/worksvg-375-큰도면.png' });
await 톡('#_집중도면큰것');
판('② 닫으면 집중 창이 그대로 남는다', (await p.evaluate(() => !!document.getElementById('_집중판'))) === true
   && (await p.evaluate(() => !!document.getElementById('_집중도면큰것'))) === false, '닫힘');

// ③ 도면이 없는 부속 — 빈 자리가 아니라 「도면 없음」
await 톡('#_집중취소');
await p.waitForTimeout(400);
await 시작누르기(2);
const ㄴ = await 도면본다();
console.log('③ 도면 없는 카드 : ' + JSON.stringify(ㄴ));
판('③ 도면이 없으면 「도면 없음」 이라고 적는다', ㄴ.판 === true && ㄴ.svg === false && ㄴ.글.includes('도면 없음'),
   JSON.stringify(ㄴ));
판('③ 군더더기 설명은 없다 (여덟 자 아래)', ㄴ.글.replace(/\s/g, '').length <= 8, '「' + ㄴ.글 + '」');

판('375px 가로 스크롤 없다', (await p.evaluate(() => document.documentElement.scrollWidth)) <= 375, '375px');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
console.log(실패 === 0 ? 'worksvg1   OK' : 'worksvg1   FAIL (' + 실패 + ')');
await b.close(); process.exit(실패 === 0 ? 0 : 1);
