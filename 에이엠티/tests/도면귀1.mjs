// 「어떤데이터든 확인하려는것만 그때그때 호출하는 구조를 만들 수는 없나?」
//   — 사장님 말씀 (10-09)
// 2단계: `cutting_plans` 를 칸째 듣지 않고 **발주별로** 듣는다
// (where('pOrderIds','array-contains',발주번호) · onSnapshot).
// 여기서 재는 것 — ① 몇 건을 읽나 ② 살아 있는 발주 것이 하나도 안 빠지나
// ③ 재단 카드·치수가 전과 한 톨도 안 다른가 ④ 남이 확정하면 바로 바뀌나
// ⑤ 발주가 늘고 줄 때 귀가 쌓이지 않나 ⑥ 발주가 0건이어도 안 멈추나
// ⑦ _자료왔다('도면') 가 제때 불리나.
import { 브라우저열기, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const URL = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const L = await 자료('원장'); const C = await 자료('cutting_plans'); const O = await 자료('confirmed_orders');
// 이 상자 밖에서 미리 세어 둔다 — 화면이 낸 숫자와 맞대 보려고
const 산발주 = [...new Set(O.map(o => parseInt(o.idNum, 10)).filter(n => !isNaN(n)))];
const 걸려야할것 = C.filter(pl => (pl.pOrderIds || []).some(x => 산발주.includes(parseInt(x, 10))));
/* 귀마다 제 발주 것을 받으므로, **두 발주가 같이 쓰는 도면은 두 번 온다.**
   그래서 「읽은 건수」 는 귀마다 센 것의 합이고, 「담기는 건수」 는 서로 다른 도면 수다. */
const 읽어야할합 = 산발주.reduce((a, n) =>
  a + C.filter(pl => (pl.pOrderIds || []).some(x => parseInt(x, 10) === n)).length, 0);
console.log('■ 미리 센 것: 도면 모두 ' + C.length + '건 · 살아 있는 발주 ' + JSON.stringify(산발주) +
            ' · 그 발주에 붙은 도면 ' + 걸려야할것.length + '건 (귀마다 센 합 ' + 읽어야할합 + '건)');

const b = await 브라우저열기();
let 실패 = 0; const 판 = (n, t, v) => { if (!t) 실패++; console.log((t ? '  OK  ' : '  FAIL') + '  ' + n + '   → ' + v); };
const ctx = await b.newContext({ ...devices['iPhone 12'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
await ctx.route('https://cdn.tailwindcss.com*', r => r.fulfill({ status: 200, contentType: 'application/javascript',
  body: 'document.write(' + JSON.stringify('<style>' + CSS + '</style>') + ');' }));
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1300);

const 차림 = await p.evaluate(({ L, C, O }) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  window._자료왔다('원장'); window._자료왔다('차례');
  currentFullData.length = 0; L.forEach(r => currentFullData.push(r));
  /* 허수아비 화베 — **서버가 걸러 주는 것처럼** 군다.
     where('pOrderIds','array-contains',n) 이 걸린 귀에는 그 발주 것만 쏜다.
     귀를 몇 개 걸고 몇 개 뗐는지, 도면 문서를 몇 건 읽었는지 센다. */
  window.__화베 = { 귀: 0, 뗀귀: 0, 읽은도면: 0, 쏜것: [], 산귀: 0 };
  window.__쓰기 = 0; const 셈 = () => async () => { window.__쓰기++; };
  window.db = {}; window.storage = {};
  window.__계획들 = C;
  window.__도면귀쏘개 = {};        // 발주번호 → 그 귀에 다시 쏘는 함수
  window.fbFirestore = {
    collection: (db, ...길) => ({ 칸: 길[길.length - 1] }),
    query: (ref, ...조건) => ({ ...ref, 조건 }),
    where: (칸, 셈2, 값) => ({ 칸, 셈2, 값 }),
    onSnapshot: (ref, cb, 탈) => {
      if (!ref || ref.칸 !== 'cutting_plans') return () => {};
      window.__화베.귀++; window.__화베.산귀++;
      const 조건 = (ref.조건 || [])[0];
      const 쏘기 = (들) => cb({ docChanges: () => 들.map(pl =>
        ({ type: 'added', doc: { id: String(pl.confirmId), data: () => pl } })) });
      const 걸린 = window.__계획들.filter(pl => !조건 ? true
        : ((pl[조건.칸] || []).some(x => String(x) === String(조건.값))));
      window.__화베.읽은도면 += 걸린.length;
      window.__화베.쏜것.push({ 발주: 조건 ? String(조건.값) : '통째로', 수: 걸린.length });
      if (조건) window.__도면귀쏘개[String(조건.값)] = 쏘기;
      쏘기(걸린);
      return () => { window.__화베.뗀귀++; window.__화베.산귀--; };
    },
    doc: () => ({}), updateDoc: 셈(), setDoc: 셈(), deleteDoc: 셈(), addDoc: 셈(),
    serverTimestamp: () => 0, getDoc: async () => ({ exists: () => false }),
    getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  // 발주가 아직 안 왔을 때 — 귀를 걸어도 도면이 「다 왔다」 가 되면 안 된다
  confirmedOrders.length = 0;
  window._cuttingPlans = {}; window._도면귀 = {}; window._도면온발주 = new Set();
  initCuttingPlansSync();
  const 발주오기전 = { 도면왔나: !!window._자료옴['도면'], 귀: window.__화베.귀 };
  // 이제 발주가 왔다
  O.filter(o => !o.amtConfirmedCancel).forEach(o => confirmedOrders.push(o));
  window._자료왔다('발주');
  _도면귀맞추기();
  return { 발주오기전, 화베: window.__화베, 담긴도면: Object.keys(window._cuttingPlans).length,
           도면왔나: !!window._자료옴['도면'], 귀수: Object.keys(window._도면귀).length,
           담긴것: Object.keys(window._cuttingPlans) };
}, { L, C, O });
console.log('■ 차림: ' + JSON.stringify({ ...차림, 담긴것: 차림.담긴것.length + '개' }));

판('⑦ 발주가 오기 전에는 「도면 다 옴」 이 아니다 (덜 온 채로 그리지 않는다)',
   차림.발주오기전.도면왔나 === false, String(차림.발주오기전.도면왔나));
판('① 칸을 통째로 듣지 않는다 — 발주마다 한 귀씩 (' + 산발주.length + '발주 → ' + 산발주.length + '귀)',
   차림.화베.귀 === 산발주.length && 차림.화베.쏜것.every(x => x.발주 !== '통째로'),
   JSON.stringify(차림.화베.쏜것));
판('① 읽는 도면 문서가 줄었다 (' + C.length + '건 → ' + 차림.화베.읽은도면 + '건)',
   차림.화베.읽은도면 === 읽어야할합 && 차림.화베.읽은도면 < C.length,
   '읽음 ' + 차림.화베.읽은도면 + '건 / 칸 전체 ' + C.length + '건 ' +
   '(서로 다른 도면 ' + 걸려야할것.length + '건 · 두 발주가 같이 쓰는 것은 두 번 온다)');
판('② 살아 있는 발주에 붙은 도면이 하나도 안 빠진다',
   차림.담긴도면 === new Set(걸려야할것.map(x => String(x.confirmId))).size,
   '담김 ' + 차림.담긴도면 + '건 / 바라는 ' + new Set(걸려야할것.map(x => String(x.confirmId))).size + '건');
판('⑦ 발주가 다 온 뒤에야 「도면 다 옴」 이 된다', 차림.도면왔나 === true, String(차림.도면왔나));

/* ③ 화면이 전과 같은가 — 지금 담긴 것으로 재단 판을 그려 두고,
   **옛 꼴처럼 칸을 통째로** 부어 다시 그려서 맞대어 본다. 같아야 한다
   (빠진 45건은 산 발주가 없는 찌꺼기라 카드가 되지 않는다). */
const 견줌 = await p.evaluate((C) => {
  const 세기 = () => {
    document.documentElement.removeAttribute('data-amthome');
    document.documentElement.removeAttribute('data-amtstock');
    switchPage('process'); appMode = 'process'; renderProcessTimeline();
    const 날들 = [...new Set([...document.querySelectorAll('[onclick*="tlExpandDateCard"]')]
      .map(e => (e.getAttribute('onclick').match(/tlExpandDateCard\('([^']+)'/) || [])[1]).filter(Boolean))];
    const 고른 = 날들.find(d => { const m = window._tlDcGetItems(d); return m && m['재단'] && m['재단'].items && m['재단'].items.length; });
    if (!고른) return { 날없음: true, 날수: 날들.length };
    window.tlExpandDateCard(고른); window.tlDcExpandSection('재단');
    const sk = 고른 + '-재단';
    const 카드 = (window._woBoringParts[sk] || []).map(x => [x.cKey, x.rw, x.rd, x.sheets, x.dq].join('/')).sort();
    return { 날: 고른, 카드수: 카드.length, 카드 };
  };
  const 발주별 = 세기();
  // 옛 꼴: 칸을 통째로 부어 본다
  C.forEach(pl => { window._cuttingPlans[String(pl.confirmId)] = { ...pl, planId: String(pl.confirmId) }; });
  const 통째로 = 세기();
  return { 발주별, 통째로, 담긴수: Object.keys(window._cuttingPlans).length };
}, C);
console.log('■ 견줌: ' + JSON.stringify({ 발주별: { 날: 견줌.발주별.날, 카드수: 견줌.발주별.카드수 },
  통째로: { 카드수: 견줌.통째로.카드수 }, 담긴수: 견줌.담긴수 }));
판('③ 재단 카드가 전과 한 톨도 안 다르다 (카드 수·치수·장수·필요수량)',
   !견줌.발주별.날없음 && 견줌.발주별.카드수 === 견줌.통째로.카드수
   && JSON.stringify(견줌.발주별.카드) === JSON.stringify(견줌.통째로.카드),
   '발주별 ' + 견줌.발주별.카드수 + '장 · 통째로 ' + 견줌.통째로.카드수 + '장 (' + 견줌.발주별.날 + ')');

/* ④ 남이 재단을 확정했을 때 — 그 발주 귀에 한 번 더 쏜다 */
const 또쏨 = await p.evaluate(() => {
  const 열쇠 = Object.keys(window.__도면귀쏘개)[0];
  const 새것 = { confirmId: 777000111, pOrderIds: [parseInt(열쇠, 10)], pRowIndex: 1,
    baseMaterial: 'PB-18T', materialColor: '화이트', sheets: 7, perSheet: 2, cutW: 100, cutD: 50,
    pInfoText: '100 X 50 - 새로확정 - 2 EA', pProducedQty: 2, targetPage: 'cutting' };
  const 전 = Object.keys(window._cuttingPlans).length;
  window.__도면귀쏘개[열쇠]([새것]);
  return { 열쇠, 전, 후: Object.keys(window._cuttingPlans).length,
           들어왔나: !!window._cuttingPlans['777000111'] };
});
console.log('■ 다시 쏨: ' + JSON.stringify(또쏨));
판('④ 남이 재단을 확정하면 그 자리에서 들어온다 (실시간이 안 끊긴다)',
   또쏨.들어왔나 === true && 또쏨.후 === 또쏨.전 + 1, JSON.stringify(또쏨));

/* ⑤ 발주가 줄고 늘 때 귀가 쌓이지 않는가 */
const 귀셈 = await p.evaluate(() => {
  const 처음귀 = window.__화베.산귀;
  const 뺀것 = confirmedOrders.filter(o => parseInt(o.idNum, 10) === parseInt(confirmedOrders[0].idNum, 10));
  const 남길것 = confirmedOrders.filter(o => parseInt(o.idNum, 10) !== parseInt(confirmedOrders[0].idNum, 10));
  const 뺀번호 = String(parseInt(confirmedOrders[0].idNum, 10));
  confirmedOrders.length = 0; 남길것.forEach(o => confirmedOrders.push(o));
  _도면귀맞추기();
  const 뺀뒤 = { 산귀: window.__화베.산귀, 귀목록: Object.keys(window._도면귀),
                 담김: Object.keys(window._cuttingPlans).length };
  뺀것.forEach(o => confirmedOrders.push(o));
  _도면귀맞추기();
  const 되돌린뒤 = { 산귀: window.__화베.산귀, 귀목록: Object.keys(window._도면귀),
                     담김: Object.keys(window._cuttingPlans).length };
  return { 처음귀, 뺀번호, 뺀뒤, 되돌린뒤, 건귀: window.__화베.귀, 뗀귀: window.__화베.뗀귀 };
});
console.log('■ 귀 셈: ' + JSON.stringify(귀셈));
판('⑤ 발주가 빠지면 그 귀를 뗀다 (귀가 쌓이지 않는다)',
   귀셈.뺀뒤.산귀 === 귀셈.처음귀 - 1 && !귀셈.뺀뒤.귀목록.includes(귀셈.뺀번호),
   '산 귀 ' + 귀셈.처음귀 + ' → ' + 귀셈.뺀뒤.산귀 + ' · 남은 귀 ' + JSON.stringify(귀셈.뺀뒤.귀목록));
판('⑤ 발주가 되돌아오면 귀를 다시 하나만 붙인다',
   귀셈.되돌린뒤.산귀 === 귀셈.처음귀 && 귀셈.되돌린뒤.귀목록.includes(귀셈.뺀번호),
   '산 귀 ' + 귀셈.되돌린뒤.산귀 + ' (붙인 적 ' + 귀셈.건귀 + ' · 뗀 적 ' + 귀셈.뗀귀 + ')');

/* ⑥ 발주가 하나도 없을 때 */
const 빈것 = await p.evaluate(() => {
  confirmedOrders.length = 0;
  window._자료옴['도면'] = false;
  _도면귀맞추기();
  return { 산귀: window.__화베.산귀, 도면왔나: !!window._자료옴['도면'],
           담김: Object.keys(window._cuttingPlans).length, 쓰기: window.__쓰기,
           문서가로: document.documentElement.scrollWidth };
});
console.log('■ 발주 0건: ' + JSON.stringify(빈것));
판('⑥ 발주가 0건이어도 멈추지 않는다 (귀 0 · 도면 다 옴)',
   빈것.산귀 === 0 && 빈것.도면왔나 === true, JSON.stringify(빈것));
판('⑧ 파이어스토어에 한 줄도 안 쓴다', 빈것.쓰기 === 0, 빈것.쓰기 + '번');
판('⑧ 375px 가로 스크롤 없다', 빈것.문서가로 <= 375, 빈것.문서가로 + 'px');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '도면귀1   OK' : '도면귀1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
