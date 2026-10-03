// 「수량 어디갔어?」 — 사장님 말씀(10-03 02:13 · 짚으신 자리가 「0」)
// 공정관리 납기 줄의 부속 목록만 발주에 담긴 수량(partInfoMap.qty)을 **그대로** 읽는다.
// 그 값이 0 으로 담긴 발주가 실제로 있다(럭스-20260929-01 · 부속 여덟 전부 0).
// 다른 자리는 모두 「담긴 값이 없으면 원장 셈(세트별소모량 × 발주수량)」 으로 되돌린다.
// 이 시험은 그 한 자리가 같은 잣대를 쓰는지 본다. 자료에는 한 줄도 안 쓴다.
import { 브라우저열기, devices, 서버, 자료, 자재 } from './도구/터.mjs';
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
for (const [무늬, 길] of [['https://cdn.sheetjs.com/**', 'node_modules/xlsx/dist/xlsx.full.min.js'],
                          ['https://cdn.jsdelivr.net/npm/sortablejs**', 'node_modules/sortablejs/Sortable.min.js'],
                          ['https://cdn.jsdelivr.net/npm/gsap**', 'node_modules/gsap/dist/gsap.min.js']])
  await ctx.route(무늬, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: readFileSync(HERE + '/' + 길, 'utf-8') }));
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1500);

// 진짜 원장에서 AMT 부속 줄 셋을 골라, 수량이 0 으로 담긴 발주와 제대로 담긴 발주를 나란히 세운다
const 본 = await p.evaluate((L) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장', '발주', '도면', '차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.__쓰기 = 0; const 셈 = () => async () => { window.__쓰기++; };
  window.db = {}; window.storage = {};
  window.fbFirestore = { doc: () => ({}), updateDoc: 셈(), setDoc: 셈(), deleteDoc: 셈(), addDoc: 셈(),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  currentFullData.length = 0; L.forEach(r => currentFullData.push(r));
  const h = currentFullData[0];
  // 같은 상품(같은 판별값)에 딸린 AMT 부속 줄을 모은다 — 화면이 묶는 잣대와 같게
  const 줄들 = [];
  for (let ri = 1; ri < currentFullData.length && 줄들.length < 3; ri++) {
    const r = currentFullData[ri];
    if (!r || normalizeValue(r[h.indexOf('공급처')]) !== 'AMT') continue;
    if (줄들.length && !IDENTITY_HEADERS.every(col =>
        normalizeValue(r[h.indexOf(col)]) === normalizeValue(currentFullData[줄들[0]][h.indexOf(col)]))) continue;
    if (줄들.length && normalizeValue(r[h.indexOf('ing발주처')]) !== normalizeValue(currentFullData[줄들[0]][h.indexOf('ing발주처')])) continue;
    줄들.push(ri);
  }
  if (줄들.length < 1) return { 못세움: true };
  const 첫 = currentFullData[줄들[0]];
  const 기준 = IDENTITY_HEADERS.map(col => normalizeValue(첫[h.indexOf(col)]));
  const 공급 = normalizeValue(첫[h.indexOf('ing발주처')]);
  const 오늘 = toLocalDateStr(new Date());
  const 낼 = new Date(); 낼.setDate(낼.getDate() + 3);
  const 납기 = toLocalDateStr(낼);
  const 만들기 = (idNum, code, qty채움) => ({
    idNum, docId: 'd' + idNum, orderCode: code, displayName: '시험상품 ' + code,
    supplier: 공급, criteria: 기준, orderQty: 34, amtTimeline: true, batchId: 'b1',
    deliveryDate: 납기, procOverrides: {}, partMoveLog: {},
    partInfoMap: Object.fromEntries(줄들.map(ri => ['card-' + idNum + '-' + ri,
      { qty: qty채움 ? Math.round((parseFloat(currentFullData[ri][h.indexOf('세트별소모량')]) || 1) * 34) : 0,
        isDeleted: false }])),
    partStarted: {}, partCompletions: {},
  });
  confirmedOrders.length = 0;
  confirmedOrders.push(만들기(9001, '시험-0수량', false));   // 담긴 수량이 0 — 사장님이 보신 꼴
  confirmedOrders.push(만들기(9002, '시험-정상', true));     // 제대로 담긴 발주
  document.documentElement.removeAttribute('data-amthome');
  document.documentElement.removeAttribute('data-amtstock');
  if (typeof switchPage === 'function') switchPage('process');
  appMode = 'process';
  renderProcessTimeline();
  return { 줄: 줄들, 납기, 오늘,
           셈한값: 줄들.map(ri => Math.round((parseFloat(currentFullData[ri][h.indexOf('세트별소모량')]) || 1) * 34)),
           부속명: 줄들.map(ri => currentFullData[ri][h.indexOf('부속명')]) };
}, L);
console.log('■ 차림: ' + JSON.stringify(본));
if (본.못세움) { console.log('qty0   FAIL (원장에서 AMT 부속 줄을 못 찾음)'); process.exit(1); }
await p.waitForTimeout(800);

const 재기 = () => p.evaluate(() => {
  const 줄 = (code) => {
    const 항 = [...document.querySelectorAll('.tl-delivery-item')]
      .filter(e => (e.dataset.ordercode || '') === code);
    const 것 = [];
    항.forEach(e => {
      e.querySelectorAll('.tl-delivery-parts [data-cardkey]').forEach(r => {
        const 수 = [...r.querySelectorAll('span')].map(s => (s.textContent || '').trim()).filter(t => /EA$/.test(t));
        것.push({ 부속: r.dataset.partname, 담긴총: r.dataset.totalqty, 적힌수량: 수[수.length - 1] || '' });
      });
    });
    return 것;
  };
  return { 영수량발주: 줄('시험-0수량'), 정상발주: 줄('시험-정상'),
           쓰기: window.__쓰기,
           문서가로: document.documentElement.scrollWidth };
});
const 잰 = await 재기();
console.log('■ 담긴 수량이 0 인 발주: ' + JSON.stringify(잰.영수량발주));
console.log('■ 제대로 담긴 발주   : ' + JSON.stringify(잰.정상발주));

판('① 납기 줄의 부속 수량이 0 으로 안 뜬다 (담긴 값이 0 이면 원장 셈으로 되돌린다)',
   잰.영수량발주.length > 0 && 잰.영수량발주.every(r => r.적힌수량 !== '0EA'),
   잰.영수량발주.map(r => r.부속 + ' ' + r.적힌수량).join(' · ') || '줄이 없다');
// 줄은 공정 칸(납기·재단·엣지·보링…)마다 하나씩 나온다 — 부속 이름으로 짝지어 본다
const 셈맵 = Object.fromEntries(본.부속명.map((n, i) => [n, 본.셈한값[i]]));
const 맞나 = 것 => 것.length > 0 && 것.every(r => r.적힌수량 === 셈맵[r.부속] + 'EA');
판('① 그 수량이 원장 셈(세트별소모량 × 발주수량)과 같다', 맞나(잰.영수량발주),
   [...new Set(잰.영수량발주.map(r => r.부속 + ' ' + r.적힌수량 + '/셈 ' + 셈맵[r.부속] + 'EA'))].join(' · '));
판('② 제대로 담긴 발주는 전과 똑같이 그 값을 쓴다', 맞나(잰.정상발주),
   [...new Set(잰.정상발주.map(r => r.부속 + ' ' + r.적힌수량))].join(' · '));
판('③ 발주 자료에 한 줄도 안 쓴다', 잰.쓰기 === 0, 잰.쓰기 + '번');
판('③ 375px 가로 넘침 없다', 잰.문서가로 <= 375, 잰.문서가로 + 'px');
// ④ 「수량 못 맞춤」 이 뜰 때 **왜** 못 맞추는지 적는가 (사장님 물음: 「수량을 왜 못맞춤?」)
const 못맞춤 = await p.evaluate(() => {
  // 도면이 안 붙은 카드로 완료 창을 연다 — 아무것도 안 찍고 글만 본다
  window.tlShowPartDoneConfirm('d9001', 'card-9001-2', '재단', '2026-10-06', null, '가와', 34, '', '');
  const m = document.getElementById('_partDoneModal');
  const 값 = { 열림: !!m, 못맞춤: !!m && /수량 못 맞춤/.test(m.textContent || ''),
    까닭: m ? ((m.querySelector('._pd까닭') || {}).textContent || '').trim() : '',
    수량칸: (document.getElementById('_pdQty') || {}).value || '' };
  m?.remove(); window._pdConfirmData = null;
  return 값;
});
console.log('■ 수량 못 맞춤 창: ' + JSON.stringify(못맞춤));
판('④ 「수량 못 맞춤」 밑에 왜 못 맞추는지 한 줄 적힌다',
   못맞춤.못맞춤 === true && 못맞춤.까닭.length > 0, JSON.stringify(못맞춤));
판('④ 그래도 완료 수량 칸에는 숫자가 들어 있다 (0 이 아니다)',
   못맞춤.수량칸 === '34', 못맞춤.수량칸);

판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));

await b.close();
console.log(실패 === 0 ? 'qty0   OK' : 'qty0   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
