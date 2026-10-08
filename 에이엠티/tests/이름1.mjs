// 「각 부속카드의 글자 크기를 줄이더라도 제품명 풀네임과 부속명이 표기 되어야 합니다
//  특히 부속명은 눈에 잘 뛰어야 합니다.」 — 사장님 말씀 (10-08 11:21 · 2호기 칸에서 짚으심)
// 좁은 기계 칸(폰에서 117px)에 카드를 세우고 ① 제품명이 **다** 보이는지(「…」 로 안 자름)
// ② 부속명이 같이 보이는지 ③ 부속명이 제품명보다 큰지 를 잰다.
// 엣지 카드(woc-이름)와 보링·NC 민카드 둘 다 본다.
import { 브라우저열기, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const URL = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const L = await 자료('원장');
const b = await 브라우저열기();
let 실패 = 0; const 판 = (n, t, v) => { if (!t) 실패++; console.log((t ? '  OK  ' : '  FAIL') + '  ' + n + '   → ' + v); };
const 긴제품 = '(4LP)(HA)토리 1200 높은 수납장_크림버치 올화이트';
const 긴부속 = '이동선반L';

for (const 폭 of [375, 1280]) {
  const ctx = await b.newContext({ ...devices['iPhone 12'], viewport: { width: 폭, height: 812 }, isMobile: 폭 < 500, hasTouch: true });
  await ctx.route('https://cdn.tailwindcss.com*', r => r.fulfill({ status: 200, contentType: 'application/javascript',
    body: 'document.write(' + JSON.stringify('<style>' + CSS + '</style>') + ');' }));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1500);
  console.log('════ 폭 ' + 폭 + 'px (기계 칸 117px) ════');

  const 세움 = await p.evaluate(({ L, 긴제품, 긴부속 }) => {
    document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
    ['원장', '발주', '도면', '차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
    window.__쓰기 = 0; const 셈 = () => async () => { window.__쓰기++; };
    window.db = {}; window.storage = {};
    window.fbFirestore = { doc: () => ({}), updateDoc: 셈(), setDoc: 셈(), deleteDoc: 셈(), addDoc: 셈(),
      collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
      getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
    currentFullData.length = 0; L.forEach(r => currentFullData.push(r));
    const h = currentFullData[0];
    let ri = 0;
    for (let i = 1; i < currentFullData.length; i++) { const r = currentFullData[i];
      if (r && normalizeValue(r[h.indexOf('공급처')]) === 'AMT' && parseFloat(r[h.indexOf('재단W')]) > 0) { ri = i; break; } }
    if (!ri) return { 못세움: true };
    const ck = 'card-9501-' + ri;
    const 발주 = { idNum: 9501, docId: 'd9501', orderCode: '본사-20261004-01', displayName: 긴제품,
      orderQty: 10, amtTimeline: true, batchId: 1791000000000, deliveryDate: '2026-10-19',
      procOverrides: {}, partMoveLog: {}, partInfoMap: { [ck]: { qty: 10, isDeleted: false } },
      partStarted: {}, partCompletions: {} };
    confirmedOrders.length = 0; confirmedOrders.push(발주);
    const 부속 = { cKey: 'd9501_' + ck, nm: 긴부속, pm: 10, dq: 10, orderCode: 발주.orderCode,
      orderKey: 'd9501', orderName: 긴제품, plateName: 'PB-18T', finish: 'LPM-양면',
      rw: parseFloat(currentFullData[ri][h.indexOf('재단W')]), rd: parseFloat(currentFullData[ri][h.indexOf('재단D')]),
      deliveryDate: '2026-10-19' };
    const 칸 = (id) => { const d = document.createElement('div'); d.id = id;
      d.className = 'wo-boring-mac-col'; d.style.cssText = 'width:117px;'; document.body.appendChild(d); return d; };
    칸('_엣지이름칸').innerHTML = _woPlacedCardHtml(부속, 부속.cKey, '2026-10-19-엣지', '2호기', {}, '');
    칸('_보링이름칸').innerHTML = _woPlacedCardHtml(부속, 부속.cKey, '2026-10-19-보링', '2호기', {}, '');
    return { ri, 제품: 긴제품, 부속: 긴부속 };
  }, { L, 긴제품, 긴부속 });
  if (세움.못세움) { console.log('이름1   FAIL (원장에서 AMT 부속 줄을 못 찾음)'); process.exit(1); }
  await p.waitForTimeout(200);

  const 잰 = await p.evaluate(({ 긴제품, 긴부속 }) => {
    const 재 = e => { if (!e) return null; const s = getComputedStyle(e); const r = e.getBoundingClientRect();
      return { 글: (e.textContent || '').trim(), 보임: s.display !== 'none' && r.width > 0 && r.height > 0,
               크기: parseFloat(s.fontSize), 두께: parseInt(s.fontWeight, 10), 줄바꿈: s.whiteSpace,
               자름: s.textOverflow, 넘침: e.scrollWidth > e.clientWidth + 1,
               속: e.scrollWidth, 겉: e.clientWidth, 높이: Math.round(r.height) }; };
    const 한칸 = (id, 제품선, 부속선) => {
      const 통 = document.getElementById(id);
      const c = 통 && 통.querySelector('.wo-boring-placed-card');
      const 제품el = c && [...c.querySelectorAll('*')].find(e => e.children.length === 0 && (e.textContent || '').trim() === 긴제품);
      const 부속el = c && [...c.querySelectorAll('*')].find(e => e.children.length === 0 && (e.textContent || '').trim() === 긴부속);
      return { 카드: c ? { w: Math.round(c.getBoundingClientRect().width), h: Math.round(c.getBoundingClientRect().height) } : null,
               제품: 재(제품el), 부속: 재(부속el),
               몸넘침: (() => { const m = c && (c.querySelector('.woc-몸') || c.firstElementChild);
                 return m ? m.scrollWidth > m.clientWidth + 1 : false; })() };
    };
    return { 엣지: 한칸('_엣지이름칸'), 보링: 한칸('_보링이름칸'),
             문서가로: document.documentElement.scrollWidth, 쓰기: window.__쓰기 };
  }, { 긴제품, 긴부속 });
  console.log('■ 엣지 카드: ' + JSON.stringify(잰.엣지));
  console.log('■ 보링 카드: ' + JSON.stringify(잰.보링));

  for (const [이름, x] of [['엣지', 잰.엣지], ['보링', 잰.보링]]) {
    판(`① ${이름} 카드에 제품명이 보인다`, !!(x.제품 && x.제품.보임), JSON.stringify(x.제품 && x.제품.글));
    판(`① ${이름} 제품명이 풀네임이다 (「…」 로 안 자른다)`,
       !!x.제품 && x.제품.글 === 긴제품 && x.제품.넘침 === false && x.제품.줄바꿈 !== 'nowrap',
       x.제품 ? `${x.제품.속}/${x.제품.겉} · 줄바꿈 ${x.제품.줄바꿈} · 자름 ${x.제품.자름}` : '(없음)');
    판(`② ${이름} 카드에 부속명도 보인다`, !!(x.부속 && x.부속.보임), JSON.stringify(x.부속 && x.부속.글));
    판(`③ ${이름} 부속명이 제품명보다 크고 진하다`,
       !!x.부속 && !!x.제품 && x.부속.크기 > x.제품.크기 && x.부속.두께 >= x.제품.두께,
       x.부속 && x.제품 ? `부속 ${x.부속.크기}px/${x.부속.두께} · 제품 ${x.제품.크기}px/${x.제품.두께}` : '(없음)');
    판(`③ ${이름} 폰에서 읽히는 크기다 (제품 11px 이상 · 부속 14px 이상)`,
       !!x.부속 && !!x.제품 && x.제품.크기 >= 11 && x.부속.크기 >= 14,
       x.부속 && x.제품 ? `제품 ${x.제품.크기}px · 부속 ${x.부속.크기}px` : '(없음)');
    판(`④ ${이름} 카드 안이 옆으로 안 넘친다`, x.몸넘침 === false, String(x.몸넘침));
  }
  판('④ 가로 스크롤 없다', 잰.문서가로 <= 폭, 잰.문서가로 + 'px');
  판('⑤ 발주 자료에 한 줄도 안 쓴다', 잰.쓰기 === 0, 잰.쓰기 + '번');
  판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
  await ctx.close();
}
await b.close();
console.log(실패 === 0 ? '이름1   OK' : '이름1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
