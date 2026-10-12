// 사장님 10-12: 「조혼가구 스캔으로 납기명세서가 발생될때 에이엠티 프로그램으로 연결되어
//  나타나는 듯하다 - 이는 차후 에이엠티와의 로그인 문제로 혼란을 줄 수 있다. 에이엠티의
//  거래명세표를 조혼가구에 따로 받아와서 사용할 수 있는 방법을 강구하라」
// 그래서 **배송을 확정하실 때** 거래명세표를 화베(`출고명세표`)로 보내 둔다.
// ① 배송 확정 한 번에 **파레트 수만큼** 문서가 생기는지 ② 담긴 칸이 그대로인지
// ③ 그 문서를 **공용 그리개로 그리면 에이엠티 화면과 같은 표**가 나오는지
// ④ 화면만 그릴 때는 **안 쓰는지** ⑤ 쓰기를 막으면 **거짓 초록이 안 뜨는지**
// ⑥ 업무 기록·입고확인에 쓰기 0 인지 ⑦ 다시 확정하면 덮는지 를 잰다.
import { 브라우저열기, devices, 서버, 자료, 자재, 그림칸 } from './도구/터.mjs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const URL = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const L = await 자료('원장');
const b = await 브라우저열기();
let 실패 = 0; const 판 = (n, t, v) => { if (!t) 실패++; console.log((t ? '  OK  ' : '  FAIL') + '  ' + n + '   → ' + v); };
const md5 = (s) => createHash('md5').update(s).digest('hex');
const 칸 = 'artifacts/vivivic-4b7ef/public/data/출고명세표/';
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
  await p.waitForTimeout(700); return true;
};

const 날 = '2026-10-21';
const 차림 = await p.evaluate(({ L, 날 }) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장', '발주', '도면', '차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  const 방 = (...a) => a.join('/');
  window.__쓴곳 = []; window.__창고 = {}; window.__막나 = false;
  window.db = {}; window.storage = {}; window._myAccount = { uid: '시험uid' };
  window.fbFirestore = {
    doc: (db, ...a) => ({ 길: 방(...a) }),
    collection: (db, ...a) => ({ 길: 방(...a) }),
    setDoc: async (r, v) => { if (window.__막나) throw new Error('PERMISSION_DENIED: 시험으로 막음');
      window.__쓴곳.push(r.길); window.__창고[r.길] = JSON.parse(JSON.stringify(v)); },
    updateDoc: async (r) => { window.__쓴곳.push(r.길); },
    deleteDoc: async (r) => { window.__쓴곳.push('지움:' + r.길); },
    addDoc: async (r) => { window.__쓴곳.push(r.길); },
    getDoc: async (r) => ({ exists: () => !!window.__창고[r.길], data: () => window.__창고[r.길] || {} }),
    getDocs: async () => ({ forEach: () => {} }),
    onSnapshot: () => {}, query: x => x, serverTimestamp: () => '때', deleteField: () => null };
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
  const 적 = (ri, 이름, 값) => { const i = h.indexOf(이름); if (i >= 0) currentFullData[ri][i] = 값; };
  줄.forEach(ri => 적(ri, '조립부속코드', 'TA_보냄_' + ri));
  const 이름 = ri => currentFullData[ri][h.indexOf('부속명')] || '부속';
  const 다됨 = ri => ({ '재단': { done: true, date: 날, partName: 이름(ri) },
                         '엣지': { done: true, date: 날, partName: 이름(ri) },
                         'NC':   { done: true, date: 날, partName: 이름(ri) },
                         '보링': { done: true, date: 날, partName: 이름(ri) } });
  confirmedOrders.length = 0;
  confirmedOrders.push({
    idNum: 9701, docId: 'd9701', orderCode: '유한-20261009-07', displayName: '시험상품 보냄',
    code: '시험상품 보냄', supplier: '유한가구',
    criteria: IDENTITY_HEADERS.map(c => normalizeValue(currentFullData[줄[0]][h.indexOf(c)])),
    orderQty: 10, amtTimeline: true, batchId: 1791000009701, deliveryDate: 날,
    procOverrides: {}, partMoveLog: {},
    partInfoMap: Object.fromEntries(줄.map(ri => ['card-9701-' + ri, { qty: 10, isDeleted: false }])),
    partStarted: {},
    partCompletions: Object.fromEntries(줄.map(ri => ['card-9701-' + ri, 다됨(ri)])),
  });
  // 파레트 둘 — A 에 둘, B 에 하나. 「파레트마다 한 장」 이 맞는지 보려는 것이다
  window._파레트기록 = { d9701: { docId: 'd9701', 고른: {
    ['card-9701-' + 줄[0] + '|엣지']: 'A',
    ['card-9701-' + 줄[1] + '|보링']: 'A',
    ['card-9701-' + 줄[2] + '|보링']: 'B' } } };
  window._집중파레트들 = {};
  window.__기록전 = JSON.stringify(confirmedOrders);
  document.documentElement.removeAttribute('data-amthome');
  document.documentElement.removeAttribute('data-amtstock');
  switchPage('process'); appMode = 'process'; renderProcessTimeline();
  const m = window._tlDcGetItems(날);
  if (!m || !m['납기'] || !m['납기'].items || !m['납기'].items.length) return { 납기없음: true };
  window.tlExpandDateCard(날); window.tlDcExpandSection('납기');
  return { 줄, 파들: window._제품파레트들(confirmedOrders[0]) };
}, { L, 날 });
console.log('■ 차림: ' + JSON.stringify(차림));
if (차림.못세움 || 차림.납기없음) { console.log('출고보내기1   FAIL (' + JSON.stringify(차림) + ')'); process.exit(1); }
await p.waitForTimeout(500);

// ── ④ 화면만 그릴 때는 안 쓴다 ─────────────────────────────────────
await 짚기('#tl-datecard-expand .tl-dc-full-card[data-idnum="9701"] .tl-dc-btn-delivery');
const 그리기만 = await p.evaluate(() => ({ 쓴곳: window.__쓴곳.slice(),
  큐알수: document.querySelectorAll('#tl-datecard-expand .tl-dc-큐알묶음').length,
  확정단추: !!document.querySelector('#tl-datecard-expand .tl-dc-btn-confirm') }));
console.log('■ 배송정보만 폈을 때: ' + JSON.stringify(그리기만));
판('④ 배송 정보를 펴는 것만으로는 **아무것도 안 쓴다**',
   그리기만.쓴곳.length === 0 && 그리기만.큐알수 === 2 && 그리기만.확정단추,
   '쓴 곳 ' + 그리기만.쓴곳.length + ' · 큐알 ' + 그리기만.큐알수 + '개');

// ── ① 배송 확정 — 파레트 수만큼 보낸다 ─────────────────────────────
await 짚기('#tl-datecard-expand .tl-dc-btn-confirm');
await p.waitForTimeout(600);
const 보낸뒤 = await p.evaluate((칸) => {
  const 것 = Object.entries(window.__창고).filter(([k]) => k.indexOf(칸) === 0);
  return { 쓴곳: window.__쓴곳.slice(), 장수: 것.length,
           문서: Object.fromEntries(것.map(([k, v]) => [k.slice(칸.length), v])),
           보냄글: (document.getElementById('출-보냄')?.textContent || '').trim(),
           탈글: (document.getElementById('출-탈')?.textContent || '').trim(),
           기록그대로: JSON.stringify(confirmedOrders) === window.__기록전 };
}, 칸);
console.log('■ 보낸 뒤 쓴 곳: ' + JSON.stringify(보낸뒤.쓴곳));
console.log('■ 보낸 문서 이름: ' + JSON.stringify(Object.keys(보낸뒤.문서)));
판('① 배송 확정 한 번에 **파레트 수(2장)만큼** 문서가 생긴다',
   보낸뒤.장수 === 2 && !!보낸뒤.문서['유한-20261009-07-A'] && !!보낸뒤.문서['유한-20261009-07-B'],
   보낸뒤.장수 + '장 · ' + JSON.stringify(Object.keys(보낸뒤.문서)));
const A = 보낸뒤.문서['유한-20261009-07-A'] || {};
console.log('■ A 장에 담긴 칸: ' + JSON.stringify(Object.keys(A)));
판('② 담긴 칸이 그대로다 (큐알·발주번호·파레트·납기일·업체·줄수·총수량·명세표·보낸때·판)',
   A.큐알 === '유한-20261009-07-A' && A.발주번호 === '유한-20261009-07' && A.발주문서 === 'd9701'
   && A.파레트 === 'A' && A.납기일 === 날 && A.업체 === '유한가구'
   && A.줄수 === 2 && A.총수량 > 0 && Array.isArray(A.명세표) && A.명세표.length === 1
   && A.보낸때 === '때' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(A.보낸때글) && !!A.판,
   JSON.stringify({ 큐알: A.큐알, 파레트: A.파레트, 업체: A.업체, 줄수: A.줄수, 총수량: A.총수량,
                    명세표묶음: (A.명세표 || []).length, 보낸때글: A.보낸때글, 판: A.판 }));
판('② 담긴 꼴은 **v1.55.0 의 그 꼴 그대로**다 (발주 넷 · 계획들 · 품목들)',
   (() => { const 묶 = (A.명세표 || [])[0] || {};
     return JSON.stringify(Object.keys(묶.발주 || {}).sort()) === JSON.stringify(['code','deliveryDate','displayName','orderCode'])
       && Array.isArray(묶.계획들) && Array.isArray((묶.계획들[0] || {}).품목들)
       && JSON.stringify(Object.keys((묶.계획들[0].품목들 || [])[0] || {}).sort()) === JSON.stringify(['몫','이름','코드','크기'].sort()); })(),
   JSON.stringify(((A.명세표 || [])[0] || {}).계획들));
판('⑥ 업무 기록·입고확인에는 **한 번도 안 썼다**',
   보낸뒤.쓴곳.every(k => k.indexOf(칸) === 0) && 보낸뒤.쓴곳.length === 2
   && 보낸뒤.기록그대로 === true,
   JSON.stringify(보낸뒤.쓴곳) + ' · 업무기록 그대로 ' + 보낸뒤.기록그대로);
판('① 다 보냈을 때만 **보냈다고 적는다**',
   /거래명세표 2장 보냄/.test(보낸뒤.보냄글) && 보낸뒤.탈글 === '',
   '「' + 보낸뒤.보냄글 + '」');

// ── ③ 보낸 문서를 **공용 그리개로** 그리면 에이엠티 화면과 같은 표다 ──
const 견줌 = await p.evaluate(({ 문서, 날 }) => {
  const 밖 = {};
  Object.entries(문서).forEach(([글, v]) => {
    const 파 = v.파레트;
    const 집 = window._명세서표Html(날, '납기', window._명세서모으기(날, '납기', 파, 'd9701'), 글).html;
    const 밖집 = window.거래명세표.그리기(v.명세표, { 날짜: 날, 추린이름: 글 }).html;
    밖[글] = { 집, 밖집 };
  });
  return 밖;
}, { 문서: 보낸뒤.문서, 날 });
Object.entries(견줌).forEach(([글, v]) => {
  판('③ ' + 글 + ' — 보낸 문서를 공용 그리개로 그리면 **에이엠티 화면과 같은 표**',
     md5(v.집) === md5(v.밖집) && v.집.length > 100, md5(v.밖집) + ' (에이엠티 ' + md5(v.집) + ')');
});
// 조혼가구는 노드/제 집에서 그린다 — window 없이도 같은 표가 나와야 한다
const require = createRequire(import.meta.url);
const 공용 = require('../../shared/거래명세표.js');
판('③ **노드에서 그려도** 같은 표다 (조혼가구가 제 집에서 그리는 길)',
   Object.entries(보낸뒤.문서).every(([글, v]) =>
     md5(공용.그리기(v.명세표, { 날짜: 날, 추린이름: 글 }).html) === md5(견줌[글].집)),
   '두 장 다 같다');
if (그림칸()) await p.screenshot({ path: 그림칸() + '/send-375-배송확정.png' });

// ── ⑦ 다시 확정하면 덮는다 (책임 기록이 아니다) ────────────────────
const 또 = await p.evaluate(async () => {
  const 전 = JSON.parse(JSON.stringify(window.__창고));
  window.__쓴곳.length = 0;
  await window._출고명세표보내기(confirmedOrders[0]);
  const 길들 = Object.keys(window.__창고).filter(k => /출고명세표\//.test(k));
  return { 쓴곳: window.__쓴곳.slice(), 장수: 길들.length,
           같나: 길들.every(k => JSON.stringify(window.__창고[k].명세표) === JSON.stringify(전[k].명세표)) };
});
판('⑦ 다시 확정하면 **덮는다** — 장 수는 그대로 2장이다',
   또.장수 === 2 && 또.쓴곳.length === 2 && 또.같나 === true,
   '장 ' + 또.장수 + ' · 쓴 곳 ' + 또.쓴곳.length + ' · 내용 같다 ' + 또.같나);

// ── ⑤ 쓰기를 막으면 거짓 초록이 안 뜬다 ────────────────────────────
const 막음 = await p.evaluate(async () => {
  window.__막나 = true; window.__쓴곳.length = 0;
  const r = await window._출고명세표보내기(confirmedOrders[0]);
  window.__막나 = false;
  return r;
});
console.log('■ 막았을 때: ' + JSON.stringify(막음));
판('⑤ 못 쓰면 **보냈다고 하지 않는다** (0장 · 까닭을 들고 온다)',
   막음.보냄 === 0 && 막음.모두 === 2 && /PERMISSION_DENIED/.test(막음.탈), JSON.stringify(막음));
// 화면에서도 — 쓰기를 막아 놓고 **진짜 손가락으로** 배송 확정을 눌러 본다
await p.evaluate(() => { window.__막나 = true; window.__쓴곳.length = 0; });
await 짚기('#tl-datecard-expand .tl-dc-full-card[data-idnum="9701"] .tl-dc-btn-delivery');
await 짚기('#tl-datecard-expand .tl-dc-full-card[data-idnum="9701"] .tl-dc-btn-delivery');
await 짚기('#tl-datecard-expand .tl-dc-btn-confirm');
await p.waitForTimeout(700);
const 막은화면 = await p.evaluate(() => ({
  보냄글: (document.getElementById('출-보냄')?.textContent || '').trim(),
  탈글: (document.getElementById('출-탈')?.textContent || '').trim(),
  쓴곳: window.__쓴곳.slice() }));
console.log('■ 막아 놓고 누른 화면: ' + JSON.stringify(막은화면));
판('⑤ 못 보냈으면 **화면이 「보냄」 이라고 말하지 않는다** (거짓 초록 금지)',
   !/보냄/.test(막은화면.보냄글) && 막은화면.탈글 === '거래명세표를 못 보냈습니다 — 2장 중 0장'
   && 막은화면.쓴곳.length === 0,
   '「' + 막은화면.보냄글 + '」 · 「' + 막은화면.탈글 + '」');
if (그림칸()) await p.screenshot({ path: 그림칸() + '/send-375-못보냄.png' });
await p.evaluate(() => { window.__막나 = false; });
판('⑤ 그때도 안 터진다', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
const 끝 = await p.evaluate(() => ({ 가로: document.documentElement.scrollWidth }));
판('375px 가로 스크롤 없다', 끝.가로 <= 375, 끝.가로 + 'px');
await b.close();
console.log(실패 === 0 ? '출고보내기1   OK' : '출고보내기1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
