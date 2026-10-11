// 「럭스 실작업한 명세서의 재단수량이 왜 0인가용 이 원인을 찾아 수정해 주세요」
//   — 사장님 말씀 (10-11)
// 까닭: 원장의 **세트별소모량이 빈칸**인 제품은 발주확정 때 `partInfoMap.qty` 가 0 으로 담긴다.
// 카드는 「소모량이 비면 1로 본다」 는 받침(_원장셈몫)이 있어 12 를 보이는데, 명세서만
// 제 셈을 따로 갖고 있어 0 으로 떨어졌다. 여기서는 **럭스와 같은 꼴**을 심어 네 가지를 가른다.
//   ① 적힌 수량이 아예 없다            → 원장 셈으로 받친다 (소모량 빈칸 → 1 × 발주수량)
//   ② 사유가 적힌 0                     → **0 개** 가 맞다 (불량으로 한 개도 못 나온 자리)
//   ③ 사유 없는 맨 0                    → 「안 적힌 것」 으로 보고 받친다 (_partQtyInfo 와 같은 잣대)
//   ④ 실제로 적힌 수량                   → 그 수량 그대로
//   ⑤ 셋 다 못 읽는다                   → **빈칸** 이다 (0 으로 채우지 않는다)
import { 브라우저열기, devices, 서버, 자료, 자재, 그림칸 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const URL = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const O = await 자료('confirmed_orders'); const C = await 자료('cutting_plans'); const L = await 자료('원장');
const b = await 브라우저열기();
let 실패 = 0; const 판 = (n, t, v) => { if (!t) 실패++; console.log((t ? '  OK  ' : '  FAIL') + '  ' + n + '   → ' + v); };
const ctx = await b.newContext({ ...devices['iPhone 12'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
await ctx.route('https://cdn.tailwindcss.com*', r => r.fulfill({ status: 200, contentType: 'application/javascript',
  body: 'document.write(' + JSON.stringify('<style>' + CSS + '</style>') + ');' }));
await ctx.route('https://cdn.sheetjs.com/**', r => r.fulfill({ status: 200, contentType: 'application/javascript',
  body: readFileSync(HERE + '/node_modules/xlsx/dist/xlsx.full.min.js', 'utf-8') }));
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1500);
const cdp = await ctx.newCDPSession(p);
const 손 = (t, x, y) => cdp.send('Input.dispatchTouchEvent',
  { type: t, touchPoints: t === 'touchEnd' ? [] : [{ x, y, radiusX: 14, radiusY: 14, force: 1 }] });
const 끌기 = async (x, y, dx, dy) => {
  await 손('touchStart', x, y);
  for (let i = 1; i <= 14; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove',
      touchPoints: [{ x: x + dx * i / 14, y: y + dy * i / 14, radiusX: 14, radiusY: 14, force: 1 }] });
    await p.waitForTimeout(16);
  }
  await 손('touchEnd', 0, 0); await p.waitForTimeout(400);
};
const 짚기 = async (고르개) => {
  const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null;
    e.scrollIntoView({ block: 'center' }); const b2 = e.getBoundingClientRect();
    return { x: Math.round(b2.x + b2.width / 2), y: Math.round(b2.y + b2.height / 2) }; }, 고르개);
  if (!r) return false;
  await 손('touchStart', r.x, r.y); await p.waitForTimeout(60); await 손('touchEnd', 0, 0);
  await p.waitForTimeout(500); return true;
};

const 차림 = await p.evaluate(({ O, C, L }) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장', '발주', '도면', '차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.__쓰기 = 0; const 셈 = () => async () => { window.__쓰기++; };
  window.db = {}; window.storage = {};
  window.fbFirestore = { doc: () => ({}), updateDoc: 셈(), setDoc: 셈(), deleteDoc: 셈(), addDoc: 셈(),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  currentFullData.length = 0; L.forEach(r => currentFullData.push(r));
  confirmedOrders.length = 0;
  O.filter(o => o.amtTimeline === true && !o.amtConfirmedCancel).forEach(o => confirmedOrders.push(o));
  window._cuttingPlans = {}; C.forEach(c => { window._cuttingPlans[c.confirmId || c.docId] = c; });
  document.documentElement.removeAttribute('data-amthome');
  document.documentElement.removeAttribute('data-amtstock');
  switchPage('process'); appMode = 'process'; renderProcessTimeline();
  const 날들 = [...new Set([...document.querySelectorAll('[onclick*="tlExpandDateCard"]')]
    .map(e => (e.getAttribute('onclick').match(/tlExpandDateCard\('([^']+)'/) || [])[1]).filter(Boolean))];
  const 고른 = 날들.find(d => { const m = window._tlDcGetItems(d); return m && m['재단'] && m['재단'].items && m['재단'].items.length; });
  if (!고른) return { 못세움: true };

  // ── 럭스와 같은 꼴을 짓는다 ────────────────────────────────────────
  // 원장의 **세트별소모량을 비운다** — 럭스 제품 여덟 줄이 꼭 이랬다.
  const h = currentFullData[0] || [];
  const uci = h.indexOf('세트별소모량');
  const 줄 = [11, 12, 13, 14];                 // 쓸 원장 줄 넷
  줄.forEach(ri => { if (currentFullData[ri] && uci >= 0) currentFullData[ri][uci] = ''; });
  const 없는줄 = 999999;                        // 원장에 없는 줄 — 셋 다 못 읽는 자리
  const K = n => 'card-990001-' + n;
  const 꼴 = { 발주수량: 12, 줄, 없는줄 };
  const 정보 = (이름, ri) => ({ partName: 이름, w: 800, d: 400, qty: 0, unitCons: 0,
                                plateName: 'PB-18T', finishColor: '아이보리', partSupplier: 'AMT', isDeleted: false });
  const 럭 = {
    idNum: 990001, docId: 'TEST-럭스', orderCode: '럭스-시험-01', displayName: '시험 럭스 제품',
    orderQty: 12, deliveryDate: 고른, amtTimeline: true,
    partInfoMap: {
      [K(줄[0])]: 정보('①적힌것없음', 줄[0]), [K(줄[1])]: 정보('②사유있는0', 줄[1]),
      [K(줄[2])]: 정보('③맨0', 줄[2]),       [K(줄[3])]: 정보('④적힌7', 줄[3]),
      [K(없는줄)]: 정보('⑤못읽음', 없는줄),
    },
    partCompletions: {
      [K(줄[0])]: { '재단': { done: true, date: 고른, partName: '①적힌것없음' } },
      [K(줄[1])]: { '재단': { done: true, date: 고른, partName: '②사유있는0', actualQty: 0, reason: '불량' } },
      [K(줄[2])]: { '재단': { done: true, date: 고른, partName: '③맨0', actualQty: 0 } },
      [K(줄[3])]: { '재단': { done: true, date: 고른, partName: '④적힌7', actualQty: 7 } },
      [K(없는줄)]: { '재단': { done: true, date: 고른, partName: '⑤못읽음' } },
    },
  };
  confirmedOrders.push(럭);
  window.tlExpandDateCard(고른); window.tlDcExpandSection('재단');
  return { 날: 고른, 꼴 };
}, { O, C, L });
console.log('■ 차림: ' + JSON.stringify(차림));
if (차림.못세움) { console.log('럭스몫1   FAIL (재단 일감이 있는 날을 못 찾음)'); process.exit(1); }
await p.waitForTimeout(400);

if (!await 짚기('#tl-datecard-expand .tl-dc-single-hdr .명세-단추')) {
  console.log('럭스몫1   FAIL (명세서 단추를 못 찾음)'); process.exit(1);
}
const 본 = await p.evaluate(() => {
  const 판 = document.getElementById('명세서판'); if (!판) return { 안열림: true };
  const 표 = 판.querySelector('.명세-표');
  const 머리 = [...표.querySelectorAll('tr')][0];
  const 칸이름 = [...머리.children].map(e => (e.textContent || '').replace(/\s+/g, '').trim());
  const 수량자리 = 칸이름.indexOf('재단수량');
  const 줄들 = [...표.querySelectorAll('tr')].slice(2).filter(tr => !tr.classList.contains('합'));
  const 본것 = {};
  줄들.forEach(tr => {
    const td = [...tr.children].map(e => (e.textContent || '').trim());
    const i = td.findIndex(v => /^[①②③④⑤]/.test(v));
    if (i < 0) return;
    본것[td[i]] = { 수량: td[i + 2], 사이즈: td[i + 1] };   // 품목 · 사이즈 · 공정수량
  });
  const 짠 = window._명세서줄들();
  const 종이 = {};
  (짠 ? 짠.줄들 : []).forEach(줄 => {
    const i = 줄.값.findIndex(v => /^[①②③④⑤]/.test(String(v)));
    if (i >= 0) 종이[줄.값[i]] = 줄.값[i + 2];
  });
  return { 칸이름, 수량자리, 본것, 종이, 줄수: 줄들.length };
});
console.log('■ 명세서가 적은 수량: ' + JSON.stringify(본));
if (그림칸()) {
  const 가 = await p.evaluate(() => { const r = document.querySelector('#명세서판 .명세-몸').getBoundingClientRect();
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; });
  await 끌기(가.x, 가.y, -300, 0); await 끌기(가.x, 가.y, -300, 0);
  await p.screenshot({ path: 그림칸() + '/qty-375-럭스몫.png' });
}

const 있 = k => (본.본것 || {})[k] || {};
판('① 적힌 수량이 없으면 원장 셈으로 받친다 (소모량 빈칸 → 1 × 발주수량 12)',
   있('①적힌것없음').수량 === '12개', '「' + 있('①적힌것없음').수량 + '」 · 바란 것 「12개」');
판('② **사유가 적힌 0** 은 0 개 그대로다 (불량으로 한 개도 못 나온 자리)',
   있('②사유있는0').수량 === '0개', '「' + 있('②사유있는0').수량 + '」 · 바란 것 「0개」');
판('③ 사유 없는 맨 0 은 「안 적힌 것」 — 받친다 (_partQtyInfo 와 같은 잣대)',
   있('③맨0').수량 === '12개', '「' + 있('③맨0').수량 + '」 · 바란 것 「12개」');
판('④ 실제로 적힌 수량은 그대로다', 있('④적힌7').수량 === '7개',
   '「' + 있('④적힌7').수량 + '」 · 바란 것 「7개」');
판('⑤ 셋 다 못 읽으면 **빈칸**이다 (0 으로 채우지 않는다)',
   있('⑤못읽음').수량 === '', '「' + 있('⑤못읽음').수량 + '」 · 바란 것 「」(빈칸)');
판('⑥ 종이(PDF)도 화면과 같은 숫자다',
   본.종이['①적힌것없음'] === '12개' && 본.종이['②사유있는0'] === '0개'
   && 본.종이['③맨0'] === '12개' && 본.종이['④적힌7'] === '7개' && 본.종이['⑤못읽음'] === '',
   JSON.stringify(본.종이));

// ── 엑셀도 같은 숫자여야 한다 ────────────────────────────────────────
const 엑 = await p.evaluate(() => {
  if (typeof XLSX === 'undefined') return { 엑셀없음: true };
  let 담 = null; const 원래 = XLSX.writeFile;
  XLSX.writeFile = (wb) => { 담 = XLSX.utils.sheet_to_json(wb.Sheets['내역'], { header: 1 }); };
  window._명세서엑셀(); XLSX.writeFile = 원래;
  const 본 = {};
  (담 || []).forEach(줄 => { const i = (줄 || []).findIndex(v => /^[①②③④⑤]/.test(String(v)));
    if (i >= 0) 본[줄[i]] = 줄[i + 2]; });
  return 본;
});
console.log('■ 엑셀: ' + JSON.stringify(엑));
if (엑.엑셀없음) console.log('  (엑셀 꾸러미가 없는 자리 — 건너뜀)');
else 판('⑦ 엑셀도 같은 숫자다 (못 읽은 자리는 0 이 아니라 빈칸)',
   엑['①적힌것없음'] === 12 && 엑['②사유있는0'] === 0 && 엑['③맨0'] === 12
   && 엑['④적힌7'] === 7 && (엑['⑤못읽음'] === '' || 엑['⑤못읽음'] == null),
   JSON.stringify(엑));

// ── 카드가 보이는 수량과 명세서가 적는 수량이 같아야 한다 ────────────────
const 맞나 = await p.evaluate(() => {
  const o = confirmedOrders.find(x => x.orderCode === '럭스-시험-01');
  const ck = Object.keys(o.partCompletions).find(k => /^card-990001-11$/.test(k));
  const 기본 = window._원장셈몫(o, ck) || 0;
  return { 원장셈: 기본, 카드: window._partQtyInfo(o.partCompletions[ck], 기본).qty };
});
console.log('■ 카드 잣대: ' + JSON.stringify(맞나));
판('⑧ 카드가 쓰는 잣대와 같은 숫자다 (같은 화면에서 두 숫자가 안 갈린다)',
   맞나.카드 === 12 && String(있('①적힌것없음').수량) === String(맞나.카드) + '개',
   '카드 ' + 맞나.카드 + ' · 명세서 ' + 있('①적힌것없음').수량);

const 끝 = await p.evaluate(() => ({ 쓰기: window.__쓰기, 가로: document.documentElement.scrollWidth }));
판('⑨ 파이어스토어에 한 줄도 안 쓴다 (화면만 고친다)', 끝.쓰기 === 0, 끝.쓰기 + '번');
판('⑨ 375px 가로 스크롤 없다', 끝.가로 <= 375, 끝.가로 + 'px');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '럭스몫1   OK' : '럭스몫1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
