// 「어떤데이터든 확인하려는것만 그때그때 호출하는 구조」 — 사장님 말씀 (10-09)
// 3단계: **열 때는 재단도면을 하나도 안 부른다.** 도면을 보는 자리에서 그때 부른다
// (날짜카드 펼침 · 재단발주 탭 · 집중 창 · 완료 창 · 명세서).
// 여기서 재는 것 — ① 열 때 0건 ② 펼치면 그날 발주 것만 ③ 어느 길로 들어와도 뜬다
// ④ 작업 단추가 안 막힌다 ⑤ 펼쳤다 접었다 열 번 해도 귀가 안 쌓인다
// ⑥ 재단 카드가 전과 한 톨도 안 다르다 ⑦ 기다리는 티가 난다(「불러오는 중」).
import { 브라우저열기, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const URL = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const L = await 자료('원장'); const C = await 자료('cutting_plans'); const O = await 자료('confirmed_orders');
const b = await 브라우저열기();
let 실패 = 0; const 판 = (n, t, v) => { if (!t) 실패++; console.log((t ? '  OK  ' : '  FAIL') + '  ' + n + '   → ' + v); };
const ctx = await b.newContext({ ...devices['iPhone 12'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
await ctx.route('https://cdn.tailwindcss.com*', r => r.fulfill({ status: 200, contentType: 'application/javascript',
  body: 'document.write(' + JSON.stringify('<style>' + CSS + '</style>') + ');' }));
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1300);

/* 허수아비 화베 — 서버가 걸러 주는 것처럼 군다. 「늦게」 를 켜면 소식을 쥐고 있다가
   __도면쏴라() 를 불러야 쏜다. 기다리는 티가 나는지 보려는 것이다. */
const 차리기 = async (늦게) => p.evaluate(({ L, C, O, 늦게 }) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  window._자료왔다('원장'); window._자료왔다('차례');
  window.__쓰기 = 0; const 셈 = () => async () => { window.__쓰기++; };
  window.db = {}; window.storage = {};
  window.__화베 = { 귀: 0, 산귀: 0, 읽은도면: 0, 쥔것: [] };
  window.__계획들 = C;
  window.fbFirestore = {
    collection: (db, ...길) => ({ 칸: 길[길.length - 1] }),
    query: (ref, ...조건) => ({ ...ref, 조건 }),
    where: (칸, 셈2, 값) => ({ 칸, 셈2, 값 }),
    onSnapshot: (ref, cb) => {
      if (!ref || ref.칸 !== 'cutting_plans') return () => {};
      window.__화베.귀++; window.__화베.산귀++;
      const 조건 = (ref.조건 || [])[0];
      const 걸린 = window.__계획들.filter(pl => !조건 ? true
        : ((pl[조건.칸] || []).some(x => String(x) === String(조건.값))));
      const 쏘기 = () => { window.__화베.읽은도면 += 걸린.length;
        cb({ docChanges: () => 걸린.map(pl =>
          ({ type: 'added', doc: { id: String(pl.confirmId), data: () => pl } })) }); };
      if (늦게) window.__화베.쥔것.push(쏘기); else 쏘기();
      return () => { window.__화베.산귀--; };
    },
    doc: () => ({}), updateDoc: 셈(), setDoc: 셈(), deleteDoc: 셈(), addDoc: 셈(),
    serverTimestamp: () => 0, getDoc: async () => ({ exists: () => false }),
    getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  window.__도면쏴라 = () => { const 들 = window.__화베.쥔것.slice(); window.__화베.쥔것.length = 0;
    들.forEach(f => f()); };
  currentFullData.length = 0; L.forEach(r => currentFullData.push(r));
  confirmedOrders.length = 0; O.filter(o => !o.amtConfirmedCancel).forEach(o => confirmedOrders.push(o));
  window._cuttingPlans = {}; window._도면귀 = {}; window._도면온발주 = new Set(); window._도면원함 = new Set();
  document.documentElement.removeAttribute('data-amthome');
  document.documentElement.removeAttribute('data-amtstock');
  // 여기까지가 「열었다」 — 앱이 여는 자리에서 하는 그대로 부른다
  initCuttingPlansSync();
  window._자료왔다('발주');
  _도면귀맞추기();
  switchPage('process'); appMode = 'process'; renderProcessTimeline();
  const 날들 = [...new Set([...document.querySelectorAll('[onclick*="tlExpandDateCard"]')]
    .map(e => (e.getAttribute('onclick').match(/tlExpandDateCard\('([^']+)'/) || [])[1]).filter(Boolean))];
  const 재단날 = 날들.find(d => { const m = window._tlDcGetItems(d); return m && m['재단'] && m['재단'].items && m['재단'].items.length; });
  return { 귀: window.__화베.귀, 읽은도면: window.__화베.읽은도면,
           담김: Object.keys(window._cuttingPlans).length,
           도면왔나: !!window._자료옴['도면'], 막힘: window._자료막힘(),
           재단날, 그날발주: 재단날 ? (window._tlDcGetItems(재단날)['재단'].items.map(x => String(x.idNum))) : [],
           쓰기: window.__쓰기 };
}, { L, C, O, 늦게 });

// ── 열 때 ────────────────────────────────────────────────────────────
const 열때 = await 차리기(false);
console.log('■ 열 때: ' + JSON.stringify(열때));
판('① 열 때 재단계획을 **0건** 부른다 (귀도 0개)',
   열때.귀 === 0 && 열때.읽은도면 === 0 && 열때.담김 === 0,
   '귀 ' + 열때.귀 + '개 · 읽음 ' + 열때.읽은도면 + '건 · 담김 ' + 열때.담김 + '건 (칸 전체 ' + C.length + '건)');
판('④ 열자마자 작업 단추가 안 막힌다 (_자료막힘 false · 「도면 다 옴」 true)',
   열때.막힘 === false && 열때.도면왔나 === true,
   '막힘 ' + 열때.막힘 + ' · 도면왔다 ' + 열때.도면왔나);

// ── ② 날짜카드를 펼치면 그날 발주 것만 ───────────────────────────────
const 펼친뒤 = await p.evaluate((날) => {
  window.tlExpandDateCard(날); window.tlDcExpandSection('재단');
  const sk = 날 + '-재단';
  return { 귀: window.__화베.귀, 귀목록: Object.keys(window._도면귀), 읽은도면: window.__화베.읽은도면,
           담김: Object.keys(window._cuttingPlans).length,
           카드: (window._woBoringParts[sk] || []).filter(x => x.isCuttingCard)
             .map(x => [x.cKey, x.rw, x.rd, x.sheets, x.dq].join('/')).sort() };
}, 열때.재단날);
console.log('■ 펼친 뒤: ' + JSON.stringify({ ...펼친뒤, 카드: 펼친뒤.카드.length + '장' }));
판('② 펼치면 **그날 발주 것만** 붙는다',
   펼친뒤.귀 === new Set(열때.그날발주).size
   && 펼친뒤.귀목록.sort().join(',') === [...new Set(열때.그날발주)].sort().join(','),
   '귀 ' + 펼친뒤.귀 + '개 ' + JSON.stringify(펼친뒤.귀목록) + ' · 그날 발주 ' + JSON.stringify([...new Set(열때.그날발주)]));
판('② 그때 읽은 도면이 칸 전체보다 적다',
   펼친뒤.읽은도면 > 0 && 펼친뒤.읽은도면 < C.length,
   펼친뒤.읽은도면 + '건 / 칸 전체 ' + C.length + '건');

// ── ⑥ 재단 카드가 전과 한 톨도 안 다른가 ─────────────────────────────
const 견줌 = await p.evaluate(({ C, 날 }) => {
  C.forEach(pl => { window._cuttingPlans[String(pl.confirmId)] = { ...pl, planId: String(pl.confirmId) }; });
  window.tlDcExpandSection('재단');
  const sk = 날 + '-재단';
  return (window._woBoringParts[sk] || []).filter(x => x.isCuttingCard)
    .map(x => [x.cKey, x.rw, x.rd, x.sheets, x.dq].join('/')).sort();
}, { C, 날: 열때.재단날 });
판('⑥ 재단 카드·치수·장수·필요수량이 전과 한 톨도 안 다르다',
   견줌.length === 펼친뒤.카드.length && JSON.stringify(견줌) === JSON.stringify(펼친뒤.카드),
   '그날 것만 ' + 펼친뒤.카드.length + '장 · 칸 통째로 ' + 견줌.length + '장');

// ── ⑤ 펼쳤다 접었다 열 번 ────────────────────────────────────────────
const 열번 = await p.evaluate((날) => {
  for (let i = 0; i < 10; i++) {
    window.tlDcBackToGrid();
    window.tlExpandDateCard(날); window.tlDcExpandSection('재단');
  }
  return { 귀: window.__화베.귀, 산귀: window.__화베.산귀, 귀목록: Object.keys(window._도면귀).length };
}, 열때.재단날);
console.log('■ 열 번 펼쳤다 접은 뒤: ' + JSON.stringify(열번));
판('⑤ 열 번 펼쳤다 접어도 귀가 안 쌓인다',
   열번.산귀 === 펼친뒤.귀 && 열번.귀 === 펼친뒤.귀 && 열번.귀목록 === 펼친뒤.귀,
   '산 귀 ' + 열번.산귀 + ' · 붙인 적 ' + 열번.귀 + ' (펼치기 전 ' + 펼친뒤.귀 + ')');

// ── ③ 다른 길로 바로 들어가도 뜨는가 ─────────────────────────────────
const 길들 = [];
for (const [이름, 짓] of [
  ['재단발주 탭', () => { switchPage('cutting'); return { 귀: window.__화베.귀, 담김: Object.keys(window._cuttingPlans).length }; }],
  ['집중 창', () => { const o = confirmedOrders[0];
      window._집중판열기({ docId: o.docId, cardKey: 'card-' + o.idNum + '-1', procKey: '엣지', order: o, rec: {} });
      const r = { 귀: window.__화베.귀, 담김: Object.keys(window._cuttingPlans).length };
      window._집중판닫기(); return r; }],
  ['명세서', () => { window._명세서열기('2026-10-16', '재단');
      const r = { 귀: window.__화베.귀, 담김: Object.keys(window._cuttingPlans).length };
      window._명세서닫기(); return r; }]]) {
  await 차리기(false);
  const 잰 = await p.evaluate((f) => { const 전 = { 귀: window.__화베.귀, 담김: Object.keys(window._cuttingPlans).length };
    const 후 = (new Function('return ' + f))()(); return { 전, 후 }; }, 짓.toString());
  길들.push({ 이름, ...잰 });
}
console.log('■ 다른 길: ' + JSON.stringify(길들));
판('③ 재단발주 탭·집중 창·명세서로 **바로** 들어가도 도면이 온다',
   길들.every(x => x.전.귀 === 0 && x.후.귀 > 0 && x.후.담김 > 0),
   JSON.stringify(길들.map(x => x.이름 + ' 귀 ' + x.전.귀 + '→' + x.후.귀 + ' · 담김 ' + x.후.담김)));

// ── ⑦ 기다리는 티 ────────────────────────────────────────────────────
await 차리기(true);                      // 소식을 쥐고 있는 꼴
const 기다림 = await p.evaluate(async (날) => {
  window.tlExpandDateCard(날); window.tlDcExpandSection('재단');
  const 글 = (document.querySelector('#tl-datecard-expand .tl-dc-single-sec')?.textContent || '').replace(/\s+/g, ' ').trim();
  const 기다리는중 = /불러오는 중/.test(글);
  const 판보드 = !!document.querySelector('#tl-datecard-expand .wo-boring-board');
  window.__도면쏴라();                    // 이제 소식이 왔다
  await new Promise(r => setTimeout(r, 300));
  const 글2 = (document.querySelector('#tl-datecard-expand .tl-dc-single-sec')?.textContent || '').replace(/\s+/g, ' ').trim();
  return { 기다리는중, 판보드, 뒤에글: 글2.slice(0, 40),
           뒤에보드: !!document.querySelector('#tl-datecard-expand .wo-boring-board'),
           뒤에기다림: /불러오는 중/.test(글2),
           카드수: (window._woBoringParts[날 + '-재단'] || []).filter(x => x.isCuttingCard).length,
           쓰기: window.__쓰기, 문서가로: document.documentElement.scrollWidth };
}, 열때.재단날);
console.log('■ 기다림: ' + JSON.stringify(기다림));
판('⑦ 도면이 아직이면 **이 집이 쓰는 「불러오는 중」** 이 보인다 (빈 칸으로 두지 않는다)',
   기다림.기다리는중 === true && 기다림.판보드 === false, JSON.stringify({ 기다리는중: 기다림.기다리는중, 판: 기다림.판보드 }));
판('⑦ 소식이 오면 그 자리에서 재단 판으로 바뀐다',
   기다림.뒤에기다림 === false && 기다림.뒤에보드 === true && 기다림.카드수 > 0,
   '카드 ' + 기다림.카드수 + '장 · 「' + 기다림.뒤에글 + '」');
판('⑧ 파이어스토어에 한 줄도 안 쓴다', 기다림.쓰기 === 0, 기다림.쓰기 + '번');
판('⑧ 375px 가로 스크롤 없다', 기다림.문서가로 <= 375, 기다림.문서가로 + 'px');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '도면늦게1   OK' : '도면늦게1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
