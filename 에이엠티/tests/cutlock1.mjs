// 완료된 부속카드는 편집으로 흔들 수 없다.
// 사장님 지시(09-28 03:53): 「작업이 완료된 부속카드의 편집은 더이상 불가능 하게
//   해주세요 - 버튼 비활성화등 / 작업 완료후 편집으로 인한 작업데이터의 병동(변동)을
//   2차 3차 방지해 주세요」
// 그래서 길을 셋 다 막았는지 본다 — ① 죽은 단추 ② 편집 여는 함수 ③ 저장하는 함수.
// 잣대는 이미 있는 partCompletions 다.
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
await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1500);

// 카드 두 장을 무대에 세운다 — 1번은 재단 완료, 2번은 아직
await p.evaluate(() => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장','발주','도면','차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.__쓰기 = 0; const 셈 = () => async () => { window.__쓰기++; };
  window.db = {}; window.fbFirestore = { doc: () => ({}), updateDoc: 셈(), setDoc: 셈(), deleteDoc: 셈(), addDoc: 셈(),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  const sk = '2026-09-15-재단';
  confirmedOrders.length = 0;
  [1, 2].forEach(n => confirmedOrders.push({ idNum: 1400 + n, docId: 'd' + n,
    orderCode: '샘플-2026010' + n + '-01', displayName: '(본)본보기 오픈장 ' + n, orderQty: 50,
    amtTimeline: true, partInfoMap: {}, partCompletions: {}, partStarted: {}, deliveryDate: '2026-09-15' }));
  // 1번 카드만 재단 완료로 찍혀 있다 (이미 있는 기록 모양 그대로)
  confirmedOrders[0].partCompletions['card-1401-11'] = { '재단': { done: true, date: '2026-09-15',
    partName: '가와1', actualMinutes: 12.5, actualQty: 50 } };
  const 한장 = (n) => ({ cKey: 'CUT_' + n, nm: '가와' + n, pm: 8, dq: 50,
    orderCode: '샘플-2026010' + n + '-01', orderKey: 'd' + n, orderName: '(본)본보기 오픈장 ' + n,
    plateName: 'PB-18T', coating: '양면', finish: '화이트', rw: 480, rd: 1015,
    isCuttingCard: true, sheets: 5, perSheet: 4, planId: 'plan' + n,
    orderIdNum: 1400 + n, pRowIndex: 10 + n,
    boardParts: [{ lp: 0, tp: 0, wp: .45, hp: .4, bg: '', dw: '480', dh: '1015' }],
    coveredOrderIds: [1400 + n] });
  window.__sk = sk;
  window._woBoringParts[sk] = [한장(1), 한장(2)];
  window._woBoring[sk] = { pool: [], AMT: ['CUT_1', 'CUT_2'] };
  window._cuttingPlans['plan1'] = { confirmId: 'plan1', 표시: '바뀌면 안 된다' };
  const 칸 = document.createElement('div');
  칸.id = '__무대'; 칸.className = 'wo-boring-mac-col';
  칸.style.cssText = 'position:fixed;left:0;top:0;width:375px;z-index:99999;background:#fff;padding:8px;box-sizing:border-box;';
  칸.innerHTML = [1, 2].map(n => _woPlacedCardHtml(한장(n), 'CUT_' + n, sk, 'AMT', _woGetOrderColorMap(sk), '')).join('<div style="height:8px"></div>');
  document.body.appendChild(칸);
});
await p.waitForTimeout(400);

const cdp = await ctx.newCDPSession(p);
const 톡 = async (sel, ms = 110) => {
  const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null;
    const b = e.getBoundingClientRect();
    return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) }; }, sel);
  if (!r) { console.log('   !! 못 집음: ' + sel); return false; }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.y, radiusX: 14, radiusY: 14, force: 1 }] });
  await p.waitForTimeout(ms);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(500); return true;
};
const 단추 = (n) => p.evaluate(n => {
  const 카 = document.querySelectorAll('#__무대 .wo-boring-placed-card')[n - 1];
  const e = 카 ? 카.querySelector('.wo-cut-편집') : null;
  if (!e) return null;
  const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
  return { 죽음: !!e.disabled, 글: (e.textContent || '').trim(), 높이: Math.round(r.height),
           딱지: (카.querySelector('.wo-cut-완료딱지') || {}).textContent || '',
           색: cs.color, 손: cs.cursor };
}, n);
const 편집창 = () => p.evaluate(() => !!document.getElementById('_woInlineEditOverlay'));

const ㄱ = await 단추(1), ㄴ = await 단추(2);
console.log('■ 완료된 카드 단추 : ' + JSON.stringify(ㄱ));
console.log('■ 아직인 카드 단추 : ' + JSON.stringify(ㄴ));
판('① 완료된 카드의 편집 단추는 죽어 있다', ㄱ && ㄱ.죽음 === true, ㄱ ? JSON.stringify(ㄱ) : '(단추 없음)');
판('① 죽은 단추 곁에 「완료됨」 딱지가 있다', !!ㄱ && ㄱ.딱지.includes('완료'), ㄱ ? ('「' + ㄱ.딱지 + '」') : '(없음)');
판('① 단추를 지우지 않았다 (글자는 그대로 「편집」)', !!ㄱ && ㄱ.글 === '편집', ㄱ ? ㄱ.글 : '(없음)');
판('① 아직인 카드의 단추는 살아 있다', !!ㄴ && ㄴ.죽음 === false, ㄴ ? JSON.stringify(ㄴ) : '(단추 없음)');

// 몇 번째 카드의 단추인지로 집는다 (칸 사이에 빈 줄이 끼어 있어 nth-of-type 은 안 맞는다)
const 톡카드 = async (n) => {
  const r = await p.evaluate(n => {
    const 카 = document.querySelectorAll('#__무대 .wo-boring-placed-card')[n - 1];
    const e = 카 ? 카.querySelector('.wo-cut-편집') : null; if (!e) return null;
    // 카드가 길어져 둘째 카드 단추가 화면 밖으로 나갈 수 있다.
    // 무대는 fixed 라 스크롤이 안 먹으니 무대째 위로 밀어 올려 놓고 누른다.
    const 무대 = document.getElementById('__무대');
    무대.style.top = '0px';
    let b = e.getBoundingClientRect();
    if (b.bottom > innerHeight - 8) {
      무대.style.top = Math.round(innerHeight - 8 - b.bottom) + 'px';
      b = e.getBoundingClientRect();
    }
    const x = Math.round(b.x + b.width / 2), y = Math.round(b.y + b.height / 2);
    if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return null;
    return { x, y }; }, n);
  await p.waitForTimeout(200);
  if (!r) { console.log('   !! 못 집음: ' + n + '번 카드 편집'); return false; }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.y, radiusX: 14, radiusY: 14, force: 1 }] });
  await p.waitForTimeout(110);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(500); return true;
};

// ① 진짜로 눌러 본다 — 완료된 카드는 편집창이 안 열려야 한다
await 톡카드(1);
const 열렸나1 = await 편집창();
판('① 완료된 카드의 편집 단추를 눌러도 편집창이 안 열린다', 열렸나1 === false, String(열렸나1));

// ② 화면을 건너뛰고 함수로 들어와도 막힌다
const 함수로 = await p.evaluate(() => { woEditCuttingPlan('CUT_1', window.__sk);
  return { 열림: !!document.getElementById('_woInlineEditOverlay'),
           알림: (document.getElementById('toast') || {}).textContent || '' }; });
console.log('■ 함수로 들어왔을 때 : ' + JSON.stringify(함수로));
판('② 함수로 들어와도 완료된 카드는 편집창이 안 열린다', 함수로.열림 === false, JSON.stringify(함수로));

// ③ 저장하는 함수도 막힌다 — 완료된 카드를 고쳐 덮어쓰지 못한다
const 저장 = await p.evaluate(() => {
  window._editingCuttingPlan = { planId: 'plan1', oldCKey: 'CUT_1', oldSk: window.__sk };
  const 전 = JSON.stringify(window._cuttingPlans['plan1']);
  const 쓰기전 = window.__쓰기;
  try { confirmCutting(); } catch (e) { return { 탈: String(e).slice(0, 80) }; }
  return { 알림: (document.getElementById('toast') || {}).textContent || '',
           안바뀜: JSON.stringify(window._cuttingPlans['plan1']) === 전,
           쓴횟수: window.__쓰기 - 쓰기전 };
});
console.log('■ 저장 함수로 들어왔을 때 : ' + JSON.stringify(저장));
판('③ 저장 함수가 완료된 카드를 막는다', !!저장.알림 && /완료/.test(저장.알림), JSON.stringify(저장));
판('③ 막았으니 도면이 안 바뀐다', 저장.안바뀜 === true, String(저장.안바뀜));
판('③ 파이어스토어에도 안 쓴다', 저장.쓴횟수 === 0, String(저장.쓴횟수) + '번');

// ④ 아직 안 한 카드는 예전처럼 편집이 열린다 (막느라 다 막아 버리지 않았는지)
await p.evaluate(() => { window._editingCuttingPlan = null; _woCloseInlineEdit && _woCloseInlineEdit(); });
await 톡카드(2);
const 열렸나2 = await 편집창();
판('④ 아직인 카드는 예전처럼 편집이 열린다', 열렸나2 === true, String(열렸나2));
await p.evaluate(() => { _woCloseInlineEdit && _woCloseInlineEdit(); });

await p.waitForTimeout(300);
await p.screenshot({ path: 그림칸 + '/cutlock-375-죽은편집.png' });
판('375px 가로 스크롤 없다', (await p.evaluate(() => document.documentElement.scrollWidth)) <= 375, '375px');
판('파이어스토어에 한 줄도 안 썼다', (await p.evaluate(() => window.__쓰기)) === 0,
   (await p.evaluate(() => window.__쓰기)) + '번');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
console.log(실패 === 0 ? 'cutlock1   OK' : 'cutlock1   FAIL (' + 실패 + ')');
await b.close(); process.exit(실패 === 0 ? 0 : 1);
