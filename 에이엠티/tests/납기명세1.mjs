// 「각 명세서 버튼 만들고 엔씨는 작업하면서 칸을 채운다, 납기 명세서는 업로드원본의
//  조립부속코드를 납기하는 부속에 맞게 작성해주고 납기시 각 파레트별 구분이 되어
//  명세서의 부속들이 나열되게 한다.」  — 사장님 말씀 (10-11)
// ① 납기·NC 공정 머리줄에 명세서 단추가 서는지 ② 납기 명세서가 **파레트별로** 갈라지는지
// ③ 부속코드가 **조립부속코드**인지 ④ 수량이 배송 정보 확인 칸과 같은 숫자인지
// ⑤ 재단 명세서는 한 자도 안 달라졌는지 를 잰다.
import { 브라우저열기, devices, 서버, 자료, 자재, 그림칸 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const URL = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const L = await 자료('원장');
const b = await 브라우저열기();
let 실패 = 0; const 판 = (n, t, v) => { if (!t) 실패++; console.log((t ? '  OK  ' : '  FAIL') + '  ' + n + '   → ' + v); };
const ctx = await b.newContext({ ...devices['iPhone 12'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
await ctx.route('https://cdn.tailwindcss.com*', r => r.fulfill({ status: 200, contentType: 'application/javascript',
  body: 'document.write(' + JSON.stringify('<style>' + CSS + '</style>') + ');' }));
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1500);
const cdp = await ctx.newCDPSession(p);
const 손 = (t, x, y) => cdp.send('Input.dispatchTouchEvent',
  { type: t, touchPoints: t === 'touchEnd' ? [] : [{ x, y, radiusX: 14, radiusY: 14, force: 1 }] });
const 짚기 = async (고르개) => {
  const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null;
    e.scrollIntoView({ block: 'center' }); const b2 = e.getBoundingClientRect();
    return { x: Math.round(b2.x + b2.width / 2), y: Math.round(b2.y + b2.height / 2) }; }, 고르개);
  if (!r) return false;
  await 손('touchStart', r.x, r.y); await p.waitForTimeout(60); await 손('touchEnd', 0, 0);
  await p.waitForTimeout(500); return true;
};

const 날 = '2026-10-21';
const 차림 = await p.evaluate(({ L, 날 }) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장', '발주', '도면', '차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.__쓰기 = 0; const 셈 = () => async () => { window.__쓰기++; };
  window.db = {}; window.storage = {};
  window.fbFirestore = { doc: () => ({}), updateDoc: 셈(), setDoc: 셈(), deleteDoc: 셈(), addDoc: 셈(),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  currentFullData.length = 0; L.forEach(r => currentFullData.push(r));
  const h = currentFullData[0];
  const 줄 = [];
  for (let i = 1; i < currentFullData.length && 줄.length < 3; i++) {
    const r = currentFullData[i]; if (!r) continue;
    if (normalizeValue(r[h.indexOf('공급처')]) !== 'AMT') continue;
    if (!(parseFloat(r[h.indexOf('재단W')]) > 0)) continue;
    줄.push(i);
  }
  if (줄.length < 3) return { 못세움: true };
  // 원장에 **조립부속코드**를 심는다 (본보기 원장은 코드 칸이 비어 있다)
  const 적 = (ri, 이름, 값) => { const i = h.indexOf(이름); if (i >= 0) currentFullData[ri][i] = 값; };
  줄.forEach(ri => { 적(ri, '조립부속코드', 'TA_시험_' + ri); 적(ri, '재단부속코드', 'TC_시험_' + ri); });
  const 이름 = ri => currentFullData[ri][h.indexOf('부속명')] || '부속';
  const 다됨 = ri => ({ '재단': { done: true, date: 날, partName: 이름(ri) },
                         '엣지': { done: true, date: 날, partName: 이름(ri) },
                         'NC':   { done: true, date: 날, partName: 이름(ri) },
                         '보링': { done: true, date: 날, partName: 이름(ri) } });
  confirmedOrders.length = 0;
  confirmedOrders.push({
    idNum: 9801, docId: 'd9801', orderCode: '시험-납기-01', displayName: '시험상품 납기명세',
    code: '시험상품 납기명세',
    supplier: normalizeValue(currentFullData[줄[0]][h.indexOf('ing발주처')]),
    criteria: IDENTITY_HEADERS.map(c => normalizeValue(currentFullData[줄[0]][h.indexOf(c)])),
    orderQty: 10, amtTimeline: true, batchId: 1791000009801, deliveryDate: 날,
    procOverrides: {}, partMoveLog: {},
    partInfoMap: Object.fromEntries(줄.map(ri => ['card-9801-' + ri, { qty: 10, isDeleted: false }])),
    partStarted: {},
    partCompletions: Object.fromEntries(줄.map(ri => ['card-9801-' + ri, 다됨(ri)])),
  });
  //  줄0 … 엣지 A · 보링 B → B   |  줄1 … 엣지 A → A  |  줄2 … 아무 데도 안 실림
  window._파레트기록 = { d9801: { docId: 'd9801', 고른: {
    ['card-9801-' + 줄[0] + '|엣지']: 'A',
    ['card-9801-' + 줄[0] + '|보링']: 'B',
    ['card-9801-' + 줄[1] + '|엣지']: 'A' } } };
  window._집중파레트들 = {};
  document.documentElement.removeAttribute('data-amthome');
  document.documentElement.removeAttribute('data-amtstock');
  switchPage('process'); appMode = 'process'; renderProcessTimeline();
  const m = window._tlDcGetItems(날);
  if (!m || !m['납기'] || !m['납기'].items || !m['납기'].items.length) return { 납기없음: true, 있는것: Object.keys(m || {}) };
  window.tlExpandDateCard(날); window.tlDcExpandSection('납기');
  return { 줄, 이름들: 줄.map(이름) };
}, { L, 날 });
console.log('■ 차림: ' + JSON.stringify(차림));
if (차림.못세움 || 차림.납기없음) { console.log('납기명세1   FAIL (' + JSON.stringify(차림) + ')'); process.exit(1); }
await p.waitForTimeout(400);

const 머리 = await p.evaluate(() => {
  const e = document.querySelector('#tl-datecard-expand .tl-dc-single-hdr .명세-단추');
  if (!e) return { 없음: true, 머리글: (document.querySelector('#tl-datecard-expand .tl-dc-single-hdr')?.textContent || '').replace(/\s+/g, ' ').trim() };
  const r = e.getBoundingClientRect(); const a = getComputedStyle(e, '::after');
  return { 글: (e.textContent || '').trim(), 폭: Math.round(r.width), 닿는높이: parseFloat(a.height) || 0 };
});
console.log('■ 납기 머리줄 단추: ' + JSON.stringify(머리));
판('① **납기** 공정 머리줄에도 명세서 단추가 선다',
   !머리.없음 && 머리.글 === '명세서', JSON.stringify(머리));
판('① 닿는 자리는 44px 이다', !머리.없음 && 머리.닿는높이 >= 44 && 머리.폭 >= 44,
   머리.폭 + '×' + 머리.닿는높이);

await 짚기('#tl-datecard-expand .tl-dc-single-hdr .명세-단추');
const 본 = await p.evaluate(() => {
  const 판 = document.getElementById('명세서판'); if (!판) return { 안열림: true };
  const 표 = 판.querySelector('.명세-표');
  const 줄들 = [...표.querySelectorAll('tr')];
  const 머리칸 = [...줄들[0].children].map(e => (e.textContent || '').replace(/\s+/g, '').trim());
  const 몸 = 줄들.slice(2).filter(tr => !tr.classList.contains('합'))
    .map(tr => [...tr.children].map(e => (e.textContent || '').trim()));
  const 짠 = window._명세서줄들();
  return { 제목: (판.querySelector('.명세-제목')?.textContent || '').trim(),
           머리칸, 칸수: 머리칸.length + 3, 몸, 표수: 판.querySelectorAll('.명세-표').length,
           파레트자리: 머리칸.indexOf('파레트'),
           종이칸: 짠 ? 짠.칸들.map(c => c[0]) : null,
           종이줄: 짠 ? 짠.줄들.map(줄 => 줄.값) : null,
           전잔액: /전잔액/.test(판.textContent || ''),
           가로: document.documentElement.scrollWidth };
});
console.log('■ 납기 명세서: ' + JSON.stringify({ 제목: 본.제목, 머리칸: 본.머리칸, 몸: 본.몸, 종이칸: 본.종이칸 }));
판('② 납기 명세서가 펴지고 제목이 「납기 내역」 이다',
   !본.안열림 && /납기 내역/.test(본.제목), JSON.stringify(본.제목));
판('② **파레트 칸**이 선다 (납기에만)', 본.파레트자리 >= 0, JSON.stringify(본.머리칸));
// 몸줄: 첫 줄은 묶음이 많아 칸이 많고, 둘째부터는 덮인 칸이 빠진다
const 파값 = (본.몸 || []).map(td => td.find(v => /^[ABCD]$|^없음$/.test(v)) || '');
판('② 부속이 **파레트별로** 갈라진다 (A · B · 없음)',
   JSON.stringify(파값.filter(Boolean)) === JSON.stringify(['B', 'A', '없음'])
   || JSON.stringify(파값.filter(Boolean)) === JSON.stringify(['A', 'B', '없음']),
   JSON.stringify(파값));
판('③ 부속코드가 **조립부속코드**다 (TA_…)',
   (본.몸 || []).every(td => td.some(v => /^TA_시험_\d+$/.test(v)))
   && !(본.몸 || []).some(td => td.some(v => /^TC_/.test(v))),
   JSON.stringify((본.몸 || []).map(td => td.find(v => /^T[A-Z]_시험_\d+$/.test(v)))));
판('③ 종이(PDF)에도 파레트 칸이 있고 자리가 출고처 바로 뒤다',
   !!본.종이칸 && 본.종이칸[7] === '파레트' && 본.종이칸[6] === '출고처',
   JSON.stringify(본.종이칸));
판('④ 수량은 배송 정보 확인 칸과 같은 셈이다 (세트별소모량 × 발주수량)',
   (본.몸 || []).every(td => td.some(v => /^\d+개$/.test(v))),
   JSON.stringify((본.몸 || []).map(td => td.find(v => /^\d+개$/.test(v)))));
판('④ 원장재고·소요량은 안 나오고 전잔액 줄은 **있다**(빈칸)',
   본.표수 === 1 && 본.전잔액 === true && !본.머리칸.includes('원장수량'),
   '표 ' + 본.표수 + '개 · 전잔액 ' + 본.전잔액);
판('④ 375px 가로 스크롤 없다', 본.가로 <= 375, 본.가로 + 'px');
if (그림칸()) {
  const 가 = await p.evaluate(() => { const r = document.querySelector('#명세서판 .명세-몸').getBoundingClientRect();
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; });
  for (let i = 0; i < 2; i++) {
    await 손('touchStart', 가.x, 가.y);
    for (let k = 1; k <= 14; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove',
      touchPoints: [{ x: 가.x - 300 * k / 14, y: 가.y, radiusX: 14, radiusY: 14, force: 1 }] }); await p.waitForTimeout(16); }
    await 손('touchEnd', 0, 0); await p.waitForTimeout(350);
  }
  await p.screenshot({ path: 그림칸() + '/spec-375-납기명세.png' });
}
await 짚기('#명세서판 .명세-닫기');

// ── NC 도 단추가 있고 펴진다 (일하면서 칸이 채워진다) ────────────────
const NC = await p.evaluate(() => {
  const m = window._tlDcGetItems(window._tlDcDate);
  if (!m || !m['NC']) return { 없음: true, 있는것: Object.keys(m || {}) };
  window.tlDcExpandSection('NC');
  const e = document.querySelector('#tl-datecard-expand .tl-dc-single-hdr .명세-단추');
  return { 단추: !!e, 글: e ? (e.textContent || '').trim() : '' };
});
console.log('■ NC: ' + JSON.stringify(NC));
판('⑤ NC 공정에도 명세서 단추가 있다 (일하면서 칸이 채워진다)',
   NC.단추 === true && NC.글 === '명세서', JSON.stringify(NC));

const 끝 = await p.evaluate(() => ({ 쓰기: window.__쓰기 }));
판('⑥ 파이어스토어에 한 줄도 안 쓴다', 끝.쓰기 === 0, 끝.쓰기 + '번');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '납기명세1   OK' : '납기명세1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
