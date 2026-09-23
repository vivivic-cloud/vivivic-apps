// 저장된 재단도면을 다시 열면 「부속 선택 (멀티)」 에 후보가 하나도 안 뜨던 것.
// 사장님 지시(09-23 00:42): 「같은 발주내에 잔재를 이용해 재단 할 수 있는 부속이
//   있는데 나타나지 않고 있습니다. (마이다)」
//
// 까닭: _woRenderActualBoardParts 가 '1순위가 차지한 자리' 를 저장된 조각 **전부**
// (자투리에 앉힌 2·3순위까지) 의 경계로 잡아 suggestNextCards 에 넘겼다. 한 번이라도
// 자투리를 쓴 도면은 경계가 원장 끝까지라 남는 자리가 0 이 되고, 모든 후보가
// wo-not-fitting 으로 숨었다. 자투리 조각은 잿빛(#f5f5f4)이므로 그것을 빼고 센다.
import { 브라우저열기, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const B = 'http://127.0.0.1:8899';
const URL = B + '/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
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
await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1500);

const 잰것 = await p.evaluate(({ L, O, C }) => {
  const ov = document.getElementById('auth-login-overlay'); if (ov) ov.style.display = 'none';
  ['원장','발주','도면','차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.__쓰기 = 0; const 셈 = () => async () => { window.__쓰기++; };
  window.db = {}; window.fbFirestore = { doc: () => ({}), updateDoc: 셈(), setDoc: 셈(), deleteDoc: 셈(), addDoc: 셈(),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  currentFullData.length = 0; L.forEach(r => currentFullData.push(r));
  confirmedOrders.length = 0; O.forEach(x => confirmedOrders.push(x));
  window._cuttingPlans = {}; C.forEach(x => { window._cuttingPlans[x.confirmId] = x; });

  // 이 자료에서 한 원장에 부속이 둘 이상 걸린 발주를 찾는다(진짜 자료든 본보기든)
  let 고른 = null;
  confirmedOrders.forEach(ord => {
    if (고른) return;
    const 짝 = {};
    Object.entries(ord.partInfoMap || {}).forEach(([k, v]) => {
      if (!v || v.isDeleted) return;
      const s = (v.plateName || '') + (v.finish || '') + '-' + (v.finishColor || '');
      (짝[s] = 짝[s] || []).push(k);
    });
    Object.entries(짝).forEach(([s, ks]) => { if (!고른 && ks.length >= 2) 고른 = { ord, plate: s }; });
  });
  if (!고른) return { 탈: '부속이 둘 이상 걸린 원장을 못 찾았습니다' };

  window._editingCuttingPlan = null;
  showSubParts(고른.plate, [고른.ord]);
  const 목록 = [...document.querySelectorAll('.inner-part-card')]
    .map(c => ({ id: c.id, 이름: c.dataset.name, w: parseFloat(c.dataset.w), d: parseFloat(c.dataset.d) }))
    .filter(x => x.w > 0 && x.d > 0);
  if (목록.length < 2) return { 탈: '후보 카드가 둘이 안 됩니다 (' + 목록.length + ')' };

  // 1순위는 가장 큰 것으로 둔다. 그 뒤에 남는 자리는 **우리가 정한다** —
  // 어느 자료로 돌려도 같은 것을 재려면 자리를 자료에 맡기면 안 된다.
  목록.sort((a, b) => (b.w * b.d) - (a.w * a.d));
  const 첫 = 목록[0];
  handleCardClick(document.getElementById(첫.id));

  const BW = 2440, BD = 1220, bT = 4.5;
  // 들어갈 수 있어야 하는 부속 하나를 고른다 — 폭이 원장 안에 드는 것 중 제일 작은 것
  const 들것 = 목록.slice(1).filter(x => x.w <= BW - 20 && x.d <= BD - 20)
                    .sort((a, b) => (a.w * a.d) - (b.w * b.d))[0];
  if (!들것) return { 탈: '원장 안에 드는 둘째 부속이 없습니다' };
  // 아래쪽에 그 부속이 딱 들어갈 만큼만 남긴다(오른쪽은 안 남긴다)
  const 일순위아래끝 = (BD - (들것.d + bT + 2)) / BD;
  const 일순위오른끝 = (BW - 1) / BW;

  // 저장된 도면을 흉내 낸다 — 1순위 조각 + **자투리에 앉힌 잿빛 조각**.
  // 잿빛 조각이 원장 끝까지 차 있는 것이 핵심이다(여태 이것 때문에 다 숨었다).
  const boardParts = [
    { lp: 0, tp: 0, wp: 일순위오른끝, hp: 일순위아래끝, bg: '', dw: String(첫.w), dh: String(첫.d) },
    { lp: 0, tp: 일순위아래끝, wp: 0.999, hp: Math.max(0, 0.999 - 일순위아래끝),
      bg: '#f5f5f4', dw: '0', dh: '0' },
    { lp: 일순위오른끝, tp: 0, wp: Math.max(0, 0.999 - 일순위오른끝), hp: 0.999,
      bg: 'rgb(245, 245, 244)', dw: '0', dh: '0' },
  ];

  /* ② 자동생성 꼴 — 1순위 조각에도 자투리와 **똑같은 잿빛**이 칠해져 있다.
     화이트 원장이 그렇다(「화이트」 색이 자투리 잿빛과 같은 #f5f5f4 이고,
     자동생성은 1순위에도 그 색을 칠한다). 색으로는 못 가르고 치수로 갈라야 한다. */
  const boardParts자동 = boardParts.map(pt => Object.assign({}, pt, { bg: '#f5f5f4' }));
  boardParts자동[0].dw = String(첫.w); boardParts자동[0].dh = String(첫.d);

  const 보임 = () => [...document.querySelectorAll('.inner-part-card')]
    .filter(c => c.id !== primarySelectedCardId && getComputedStyle(c).display !== 'none')
    .map(c => c.dataset.name);

  _woRenderActualBoardParts({ boardParts, rw: 첫.w, rd: 첫.d });
  const 고친뒤 = 보임();
  // 자동생성 꼴로 다시 — 색이 다 같아도 치수로 갈라 같은 후보가 떠야 한다
  document.querySelectorAll('.inner-part-card').forEach(c => c.classList.remove('wo-not-fitting'));
  _woRenderActualBoardParts({ boardParts: boardParts자동, rw: 첫.w, rd: 첫.d });
  const 자동뒤 = 보임();
  // 치수도 색도 못 가르는 옛 도면(치수 빈칸 + 색 다 같음)은 예전처럼 통째로 센다
  document.querySelectorAll('.inner-part-card').forEach(c => c.classList.remove('wo-not-fitting'));
  const boardParts옛 = boardParts자동.map(pt => Object.assign({}, pt, { dw: '', dh: '' }));
  _woRenderActualBoardParts({ boardParts: boardParts옛, rw: 첫.w, rd: 첫.d });
  const 옛뒤 = 보임();

  // 예전 셈 — 잿빛까지 넣어 경계를 잡으면 무엇이 남는지 그대로 재 본다
  const 옛오른 = Math.max(...boardParts.map(x => x.lp + x.wp)) * BW;
  const 옛아래 = Math.max(...boardParts.map(x => x.tp + x.hp)) * BD;
  const 새오른 = Math.max(...boardParts.filter(x => !x.bg).map(x => x.lp + x.wp)) * BW;
  const 새아래 = Math.max(...boardParts.filter(x => !x.bg).map(x => x.tp + x.hp)) * BD;
  const 들어가나 = (cw, cd, ox, oy, 결) => Math.max(
    getPackingCount(cw, cd, BW - ox - bT, BD, 0, bT), getPackingCount(cw, cd, BW, BD - oy - bT, 0, bT),
    결 === 'X' ? Math.max(getPackingCount(cd, cw, BW - ox - bT, BD, 0, bT), getPackingCount(cd, cw, BW, BD - oy - bT, 0, bT)) : 0);
  const 옛셈 = 목록.slice(1).map(x => {
    const c = document.getElementById(x.id);
    return { 이름: x.이름, 옛: 들어가나(x.w, x.d, 옛오른, 옛아래, c.dataset.grain),
             새: 들어가나(x.w, x.d, 새오른, 새아래, c.dataset.grain) };
  });

  return {
    발주: 고른.ord.orderCode, plate: 고른.plate, 일순위: 첫.이름 + ' ' + 첫.w + 'X' + 첫.d,
    들어야할것: 들것.이름 + ' ' + 들것.w + 'X' + 들것.d,
    후보수: 목록.length - 1, 고친뒤보임: 고친뒤, 자동뒤보임: 자동뒤, 옛뒤보임: 옛뒤,
    잿빛다같나: boardParts자동.every(x => String(x.bg).toLowerCase() === '#f5f5f4'),
    옛차지:{오른:Math.round(옛오른), 아래:Math.round(옛아래)},
    새차지:{오른:Math.round(새오른), 아래:Math.round(새아래)},
    옛셈, 쓰기: window.__쓰기,
  };
}, { L, O, C });

if (잰것.탈) { console.log('■ 잴 수 없습니다: ' + 잰것.탈); console.log('cutfill1   FAIL (1)'); await b.close(); process.exit(1); }
console.log('■ 잰 것: ' + JSON.stringify(잰것));

const 옛들어가는것 = 잰것.옛셈.filter(x => x.옛 > 0).map(x => x.이름);
const 새들어가는것 = 잰것.옛셈.filter(x => x.새 > 0).map(x => x.이름);
판('자투리 조각까지 세면 1순위가 원장 끝까지 차지한 것이 된다',
   잰것.옛차지.오른 > 잰것.새차지.오른 || 잰것.옛차지.아래 > 잰것.새차지.아래,
   '옛 ' + JSON.stringify(잰것.옛차지) + ' → 새 ' + JSON.stringify(잰것.새차지));
판('예전 셈으로는 남는 자리에 들어갈 부속이 하나도 없다', 옛들어가는것.length === 0,
   JSON.stringify(옛들어가는것));
판('1순위만 세면 들어갈 부속이 생긴다', 새들어가는것.length > 0, JSON.stringify(새들어가는것));
판('도면을 다시 열어도 후보가 목록에 뜬다', 잰것.고친뒤보임.length > 0,
   잰것.고친뒤보임.length + '개 · ' + JSON.stringify(잰것.고친뒤보임));
판('뜨는 것은 진짜로 들어가는 것뿐이다 (아무거나 풀어 놓지 않는다)',
   잰것.고친뒤보임.every(n => 새들어가는것.includes(n)),
   '뜬 것 ' + JSON.stringify(잰것.고친뒤보임) + ' · 들어가는 것 ' + JSON.stringify(새들어가는것));
판('안 들어가는 부속은 그대로 숨는다',
   잰것.옛셈.filter(x => x.새 <= 0).every(x => !잰것.고친뒤보임.includes(x.이름)),
   JSON.stringify(잰것.옛셈.filter(x => x.새 <= 0).map(x => x.이름)));
// 자동생성 꼴 — 색이 다 같아도(화이트 원장) 치수로 갈라 같은 후보가 떠야 한다
판('자동생성 도면은 1순위도 잿빛이다 (색으로는 못 가른다)', 잰것.잿빛다같나 === true, String(잰것.잿빛다같나));
판('색이 다 같아도 치수로 갈라 후보가 뜬다 (화이트 원장)',
   잰것.자동뒤보임.length > 0 && JSON.stringify(잰것.자동뒤보임) === JSON.stringify(잰것.고친뒤보임),
   '자동생성 ' + JSON.stringify(잰것.자동뒤보임) + ' · 손으로 저장한 것 ' + JSON.stringify(잰것.고친뒤보임));
판('치수도 색도 없는 옛 도면은 예전처럼 통째로 센다 (되돌이가 산다)',
   잰것.옛뒤보임.length === 0, JSON.stringify(잰것.옛뒤보임));
판('파이어스토어에 한 줄도 안 썼다', 잰것.쓰기 === 0, 잰것.쓰기 + '번');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
console.log(실패 === 0 ? 'cutfill1   OK' : 'cutfill1   FAIL (' + 실패 + ')');
await b.close(); process.exit(실패 === 0 ? 0 : 1);
