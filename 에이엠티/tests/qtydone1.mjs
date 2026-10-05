// 「완료시 왜 수량이 0이되는거야 실제 작업된 수량이 기준이 되어 나타나야지」
//   — 사장님 말씀 (10-04 01:29 · 공정관리에서 짚으셨다)
// 0 은 이렇게 번졌다: 담긴 수량(partInfoMap.qty) 0 → 카드 p.dq 0 → 완료 창이 0 으로
// 미리 채워짐 → 그 0 을 찍으면 partCompletions.actualQty 에 0 이 박힘 → 그 뒤로는
// _partQtyInfo 가 그 0 을 「실제 작업 수량」 으로 믿어 영원히 0 으로 보인다.
// 이 시험은 그 길의 네 자리를 다 재고, 「사유가 적힌 0」(불량으로 한 개도 못 나온
// 자리)은 그대로 0 으로 남는지도 본다. 업무 자료에는 한 줄도 안 쓴다.
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

// 진짜 원장에서 AMT 부속 한 줄을 골라, 수량이 0 으로 담긴 발주를 세운다
const 본 = await p.evaluate((L) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장', '발주', '도면', '차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.__쓴것 = [];
  const 적기 = async (ref, 묶음) => { window.__쓴것.push(묶음); };
  window.db = {}; window.storage = {};
  window.fbFirestore = { doc: () => ({}), updateDoc: 적기, setDoc: 적기, deleteDoc: 적기, addDoc: 적기,
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  currentFullData.length = 0; L.forEach(r => currentFullData.push(r));
  const h = currentFullData[0];
  let ri = 0;
  for (let i = 1; i < currentFullData.length; i++) {
    const r = currentFullData[i];
    if (!r || normalizeValue(r[h.indexOf('공급처')]) !== 'AMT') continue;
    if (!(parseFloat(r[h.indexOf('재단W')]) > 0) || !(parseFloat(r[h.indexOf('재단D')]) > 0)) continue;
    ri = i; break;
  }
  if (!ri) return { 못세움: true };
  const row = currentFullData[ri];
  const uc  = parseFloat(row[h.indexOf('세트별소모량')]) || 1;
  const 발주수량 = 34;
  const 셈값 = Math.round(uc * 발주수량);
  const 낼 = new Date(); 낼.setDate(낼.getDate() + 3);
  const 납기 = toLocalDateStr(낼);
  const ck = 'card-9101-' + ri;
  const 발주 = {
    idNum: 9101, docId: 'd9101', orderCode: '시험-완료0', displayName: '시험상품 완료0',
    supplier: normalizeValue(row[h.indexOf('ing발주처')]),
    criteria: IDENTITY_HEADERS.map(col => normalizeValue(row[h.indexOf(col)])),
    orderQty: 발주수량, amtTimeline: true, batchId: 'b1', deliveryDate: 납기,
    procOverrides: {}, partMoveLog: {},
    partInfoMap: { [ck]: { qty: 0, unitCons: uc, isDeleted: false } },   // 사장님이 보신 꼴 — 담긴 수량이 0
    partStarted:     { [ck]: { '재단': { started: true, startedAt: Date.now() - 600000 } } },
    partCompletions: {},
  };
  confirmedOrders.length = 0; confirmedOrders.push(발주);
  document.documentElement.removeAttribute('data-amthome');
  document.documentElement.removeAttribute('data-amtstock');
  if (typeof switchPage === 'function') switchPage('process');
  appMode = 'process';
  renderProcessTimeline();
  return { ri, uc, 발주수량, 셈값, 납기, ck, 부속명: row[h.indexOf('부속명')],
           재단W: row[h.indexOf('재단W')], 재단D: row[h.indexOf('재단D')] };
}, L);
console.log('■ 차림: ' + JSON.stringify(본));
if (본.못세움) { console.log('qtydone1   FAIL (원장에서 AMT 부속 줄을 못 찾음)'); process.exit(1); }

// ① 완료 창이 0 으로 미리 채워지지 않는다 (카드가 0 을 건네도)
const 창 = await p.evaluate(({ ck, 부속명, 납기 }) => {
  window.tlShowPartDoneConfirm('d9101', ck, '재단', 납기, null, 부속명, 0, ck, '');
  const q = document.getElementById('_pdQty');
  return { 수량칸: q ? q.value : null, 예정: window._pdConfirmData?.expectedQty ?? null,
           기준: window._pdConfirmData?.rawDefaultQty ?? null };
}, 본);
console.log('■ 완료 창(카드가 0 을 건넸을 때): ' + JSON.stringify(창));
판('① 완료 창 수량칸이 0 이 아니다', 창.수량칸 !== '0' && 창.수량칸 !== null, String(창.수량칸));
판('① 그 값이 원장 셈(세트별소모량 × 발주수량)과 같다',
   String(창.수량칸) === String(본.셈값) && 창.예정 === 본.셈값,
   '수량칸 ' + 창.수량칸 + ' · 예정 ' + 창.예정 + ' / 셈 ' + 본.셈값);

// ② 그 창을 그대로 찍으면 기록에 0 이 박히지 않는다
const 찍기 = await p.evaluate(async () => {
  window.__쓴것 = [];
  await window._tlPartDoneSubmit();
  await new Promise(r => setTimeout(r, 300));
  const 묶음 = window.__쓴것[0] || null;
  const 칸 = 묶음 ? Object.keys(묶음)[0] : null;
  return { 쓴횟수: window.__쓴것.length, 칸, 적힌것: 칸 ? 묶음[칸] : null };
});
console.log('■ 찍은 뒤 기록: ' + JSON.stringify(찍기));
판('② 완료를 찍어도 actualQty 에 0 이 적히지 않는다',
   찍기.적힌것 != null && 찍기.적힌것.actualQty !== 0,
   '적힌것 ' + JSON.stringify(찍기.적힌것));

// ③④ 카드에 보이는 수량 — 기록에 박힌 0 을 어떻게 읽는가
//     카드 글씨는 _partQtyInfo 가 정한다. 사유 없는 맨 0 은 「안 적힌 것」 으로 보고
//     원장 셈을 살리고, 사유가 적힌 0(불량으로 한 개도 못 나온 자리)은 0 으로 남아야 한다.
const 카드글 = (기록) => p.evaluate(({ ck, ri, 부속명, 납기, 재단W, 재단D, 기록 }) => {
  const o = confirmedOrders.find(x => x.idNum === 9101);
  o.partCompletions = 기록 ? { [ck]: { '재단': 기록 } } : {};
  const pObj = { cKey: ck, nm: 부속명, pm: 10, dq: 0, orderCode: o.orderCode, orderName: o.displayName,
                 orderKey: 'd9101', pRowIndex: ri, plateName: 'PB-18T', finish: '아이보리',
                 rw: parseFloat(재단W), rd: parseFloat(재단D), deliveryDate: 납기 };
  let 글 = '';
  try { 글 = _woCardHtml(pObj, 납기 + '-재단'); } catch (e) { return { 탈: e.message }; }
  const m = 글.match(/>([^<>]*?)\s*EA</);
  return { 딱지: m ? m[1].trim() : null };
}, { ...본, 기록 });

const 맨영 = await 카드글({ done: true, date: 본.납기, actualQty: 0 });
console.log('■ 사유 없는 0 이 박힌 카드: ' + JSON.stringify(맨영));
판('③ 사유 없는 맨 0 은 「안 적힌 것」 으로 보고 원장 셈으로 보인다',
   String(맨영.딱지) === String(본.셈값), '딱지 ' + 맨영.딱지 + ' / 셈 ' + 본.셈값);

const 사유영 = await 카드글({ done: true, date: 본.납기, actualQty: 0, reason: '생산불량' });
console.log('■ 사유(생산불량)가 적힌 0 카드: ' + JSON.stringify(사유영));
판('④ 사유가 적힌 0 은 0 으로 남는다 (불량 0개 길이 안 죽는다)',
   /^0\(/.test(String(사유영.딱지)) || String(사유영.딱지) === '0',
   '딱지 ' + 사유영.딱지);

const 사유다른수 = await 카드글({ done: true, date: 본.납기, actualQty: 5, reason: '생산불량' });
판('④ 사유와 함께 적힌 다른 수량도 그대로 이긴다 (실제 작업된 수량이 기준)',
   /^5(\(|$)/.test(String(사유다른수.딱지)), '딱지 ' + 사유다른수.딱지);

// ⑤ 보링·재단 보드 카드(p.dq 가 0 으로 오는 자리) — 카드 글씨와 완료 단추 기준 수량
const 카드 = await p.evaluate(({ ck, ri, 부속명, 납기, 재단W, 재단D }) => {
  const o = confirmedOrders.find(x => x.idNum === 9101);
  o.partCompletions = {};
  const pObj = { cKey: ck, nm: 부속명, pm: 10, dq: 0, orderCode: o.orderCode, orderName: o.displayName,
                 orderKey: 'd9101', pRowIndex: ri, plateName: 'PB-18T', finish: '아이보리',
                 rw: parseFloat(재단W), rd: parseFloat(재단D), deliveryDate: 납기 };
  const 글 = { 미배정: '', 배치: '' };
  try { 글.미배정 = _woCardHtml(pObj, 납기 + '-재단'); } catch (e) { 글.미배정 = '탈: ' + e.message; }
  try { 글.배치   = _woPlacedCardHtml(pObj, ck, 납기 + '-재단', '', {}, ''); } catch (e) { 글.배치 = '탈: ' + e.message; }
  const 기준뽑기 = t => { const m = t.match(/tlShowPartDoneConfirm\([^)]*?,\s*(\d+)\s*,\s*'[^']*'\s*,\s*'[^']*'\)/); return m ? m[1] : null; };
  const EA뽑기  = t => (t.match(/>(\d+)\s*EA/g) || []).map(x => x.replace(/[^0-9]/g, ''));
  return { 미배정기준: 기준뽑기(글.미배정), 배치기준: 기준뽑기(글.배치),
           미배정EA: EA뽑기(글.미배정), 배치EA: EA뽑기(글.배치),
           탈: /^탈/.test(글.미배정) ? 글.미배정 : (/^탈/.test(글.배치) ? 글.배치 : null) };
}, 본);
console.log('■ 보드 카드: ' + JSON.stringify(카드));
판('⑤ 미배정 카드의 완료 기준 수량이 0 이 아니다 (원장 셈)',
   String(카드.미배정기준) === String(본.셈값), '기준 ' + 카드.미배정기준 + ' / 셈 ' + 본.셈값);
판('⑤ 배치 카드의 완료 기준 수량도 원장 셈이다',
   String(카드.배치기준) === String(본.셈값), '기준 ' + 카드.배치기준 + ' / 셈 ' + 본.셈값);

// ⑥ 집중판 「완료」(tl일완료) 도 0 을 넘기지 않는다
const 집중 = await p.evaluate(({ ck, 부속명, 납기 }) => {
  document.getElementById('_partDoneModal')?.remove(); window._pdConfirmData = null;
  const o = confirmedOrders.find(x => x.idNum === 9101);
  window._집중일 = { order: o, docId: 'd9101', cardKey: ck, procKey: '재단',
                     rec: { date: 납기, partName: 부속명 } };
  try { window.tl일완료(); } catch (e) { return { 탈: e.message }; }
  const q = document.getElementById('_pdQty');
  const v = q ? q.value : null;
  document.getElementById('_partDoneModal')?.remove(); window._pdConfirmData = null;
  return { 수량칸: v };
}, 본);
console.log('■ 집중판 완료: ' + JSON.stringify(집중));
판('⑥ 집중판 완료 창도 0 이 아니라 원장 셈으로 열린다',
   String(집중.수량칸) === String(본.셈값), '수량칸 ' + 집중.수량칸 + ' / 셈 ' + 본.셈값);

판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? 'qtydone1   OK' : 'qtydone1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
