// 사장님 10-17 (조혼가구에서): 「거래명세표가 안보입니다」 — 유한-20261009-01-A
// 까닭: 그 건은 **보내는 길(v1.59.0 · 10-12 08:09Z)이 생기기 전**에 확정됐다.
//       그래서 창고(`출고명세표`)에 한 장도 없었다. 확정은 끝나서 다시 누를 자리가 없다.
// ① 출고내역의 그 장에 **「보내기」 단추**가 서는지 ② 진짜 손가락으로 누르면 창고에
// **한 장** 들어가는지(되읽어 확인) ③ 담긴 칸이 배송 확정 때와 **같은 꼴**인지
// ④ 담긴 표가 없는 옛 건은 **지금 그린 그 표**가 그대로 가는지 ⑤ 못 쓰면 **거짓 초록이
// 안 뜨는지** ⑥ `입고확인` 에 **쓴 것 0개**인지 ⑦ 자료가 덜 오면 단추가 죽는지 를 잰다.
import { 브라우저열기, devices, 서버, 자료, 자재, 그림칸 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const 터 = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const L = await 자료('원장');
const b = await 브라우저열기();
let 실패 = 0; const 판 = (n, t, v) => { if (!t) 실패++; console.log((t ? '  OK  ' : '  FAIL') + '  ' + n + '   → ' + v); };
const 칸 = 'artifacts/vivivic-4b7ef/public/data/출고명세표/';
const ctx = await b.newContext({ ...devices['iPhone 12'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
await ctx.route('https://cdn.tailwindcss.com*', r => r.fulfill({ status: 200, contentType: 'application/javascript',
  body: 'document.write(' + JSON.stringify('<style>' + CSS + '</style>') + ');' }));
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(터, { waitUntil: 'load' }); await p.waitForTimeout(1500);
const cdp = await ctx.newCDPSession(p);
const 손 = (t, x, y) => cdp.send('Input.dispatchTouchEvent',
  { type: t, touchPoints: t === 'touchEnd' ? [] : [{ x, y, radiusX: 14, radiusY: 14, force: 1 }] });
const 짚기 = async (고르개) => {
  const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null;
    e.scrollIntoView({ block: 'center' }); const b2 = e.getBoundingClientRect();
    return { x: Math.round(b2.x + b2.width / 2), y: Math.round(b2.y + b2.height / 2) }; }, 고르개);
  if (!r) return false;
  await 손('touchStart', r.x, r.y); await p.waitForTimeout(60); await 손('touchEnd', 0, 0);
  await p.waitForTimeout(800); return true;
};

const 날 = '2026-10-22';
const 차림 = await p.evaluate(({ L, 날 }) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  const 방 = (...a) => a.join('/');
  window.__쓴곳 = []; window.__창고 = {}; window.__막나 = false;
  window.db = {}; window._myAccount = { uid: '시험uid' };
  const 입칸 = 'artifacts/vivivic-4b7ef/public/data/입고확인';
  window.__입고 = {
    // 사장님 건과 같은 꼴 — v1.54.0 에 찍혀 **명세표가 안 담겼다**
    '유한-20261009-01-A': { 큐알: '유한-20261009-01-A', 업체: '유한가구', 파레트: 'A',
      발주번호: '유한-20261009-01', 발주문서: 'd1405', 납기일: 날,
      줄수: 1, 총수량: 100, 확인시각글: '2026-10-12 15:40', 판: 'v1.54.0' },
    // 표가 담긴 건 — 그때 그 표가 그대로 가야 한다
    '유한-20261009-01-B': { 큐알: '유한-20261009-01-B', 업체: '유한가구', 파레트: 'B',
      발주번호: '유한-20261009-01', 발주문서: 'd1405', 납기일: 날,
      줄수: 1, 총수량: 50, 확인시각글: '2026-10-12 16:00', 판: 'v1.55.0',
      명세표: [{ 발주: { displayName: '담긴 것', code: '', orderCode: '유한-20261009-01', deliveryDate: 날 },
                 계획들: [{ 파: 'B', 매: null, 종류: 'PB-18T', 색상: '아이보리', 품목들: [
                   { 이름: '가와', 크기: '1015*480', 몫: 50, 코드: 'TB_1' }] }] }] },
  };
  window.fbFirestore = {
    doc: (db, ...a) => ({ 길: 방(...a) }), collection: (db, ...a) => ({ 길: 방(...a) }),
    setDoc: async (r, v) => { if (window.__막나) throw new Error('PERMISSION_DENIED: 시험으로 막음');
      window.__쓴곳.push(r.길); window.__창고[r.길] = JSON.parse(JSON.stringify(v)); },
    updateDoc: async (r) => { window.__쓴곳.push(r.길); }, deleteDoc: async () => {},
    addDoc: async (r) => { window.__쓴곳.push(r.길); },
    getDoc: async (r) => ({ exists: () => !!window.__창고[r.길], data: () => window.__창고[r.길] || {} }),
    getDocs: async (r) => { const 모 = (r.길 === 입칸) ? Object.entries(window.__입고) : [];
      return { forEach: (f) => 모.forEach(([id, v]) => f({ id, data: () => v })) }; },
    onSnapshot: (r, cb) => { if (cb) cb({ forEach: () => {} }); return () => {}; },
    query: x => x, serverTimestamp: () => '때', deleteField: () => null };

  currentFullData.length = 0; L.forEach(r => currentFullData.push(r));
  window._자료옴 = { 원장: true, 발주: true, 도면: true, 차례: true };
  const h = L[0];
  const 줄 = [];
  for (let i = 1; i < L.length && 줄.length < 5; i++) {
    const r = L[i]; if (!r) continue;
    if (normalizeValue(r[h.indexOf('공급처')]) !== 'AMT') continue;
    if (!(parseFloat(r[h.indexOf('재단W')]) > 0)) continue;
    줄.push(i);
  }
  if (줄.length < 5) return { 못세움: true };
  const ck = ri => 'card-1405-' + ri;
  confirmedOrders.length = 0;
  confirmedOrders.push({
    idNum: 1405, docId: 'd1405', orderCode: '유한-20261009-01',
    displayName: '(EG)토리 옷장_크림버치', code: '(EG)토리 옷장_크림버치',
    supplier: '유한가구', orderQty: 50, amtTimeline: true, deliveryDate: 날,
    batchId: 1791508219540, procOverrides: {}, partMoveLog: {},
    partInfoMap: Object.fromEntries(줄.map(ri => [ck(ri), {
      qty: 100, unitCons: 2, isDeleted: false, plateName: 'PB-18T', finishColor: '아이보리',
      partName: '부속', w: 761, d: 430 }])),
    partStarted: {}, partCompletions: {},
  });
  window._파레트기록 = { d1405: { docId: 'd1405', 고른: Object.assign(
    { [ck(줄[0]) + '|엣지']: 'A' },
    ...줄.slice(1).map(ri => ({ [ck(ri) + '|엣지']: 'A', [ck(ri) + '|보링']: 'B' })) ) } };
  window._집중파레트들 = {};
  window.__기록전 = JSON.stringify(confirmedOrders);
  document.documentElement.removeAttribute('data-amthome');
  return { 줄, 첫부속: L[줄[0]][h.indexOf('부속명')] };
}, { L, 날 });
console.log('■ 차림: ' + JSON.stringify(차림));
if (차림.못세움) { console.log('출고다시보내기1   FAIL (원장에 쓸 줄이 모자람)'); process.exit(1); }

// ── ① 그 장에 「보내기」 단추가 선다 ───────────────────────────────
await p.evaluate(() => window.amtOpen출고());
await p.waitForTimeout(400);
await 짚기('[data-출업체="유한가구"]');
await 짚기('[data-출큐알="유한-20261009-01-A"]');
const 단추 = await p.evaluate(() => {
  const e = document.getElementById('명세-보내기'); if (!e) return { 없나: true };
  const r = e.getBoundingClientRect();
  return { 글: (e.textContent || '').trim(), 죽음: !!e.disabled, 말: e.getAttribute('data-말'),
           높: Math.round(r.height), 보임: r.top >= 0 && r.bottom <= innerHeight };
});
console.log('■ 보내기 단추: ' + JSON.stringify(단추));
판('① 그 장 바닥에 **「보내기」** 단추가 선다 (44px 넘고 눈에 보인다)',
   !단추.없나 && 단추.글 === '보내기' && !단추.죽음 && 단추.높 >= 44 && 단추.보임,
   JSON.stringify(단추));
if (그림칸()) await p.screenshot({ path: 그림칸() + '/resend-375-보내기단추.png' });

// ── ② ③ ④ 눌러 본다 ────────────────────────────────────────────────
await 짚기('#명세-보내기');
const 보낸뒤 = await p.evaluate((칸) => {
  const 것 = Object.entries(window.__창고).filter(([k]) => k.indexOf(칸) === 0);
  const e = document.getElementById('명세-보내기');
  return { 장수: 것.length, 문서: Object.fromEntries(것.map(([k, v]) => [k.slice(칸.length), v])),
           쓴곳: window.__쓴곳.slice(), 단추글: (e?.textContent || '').trim(),
           끝났다: !!e?.classList.contains('끝났다'), 탈줄: !!document.getElementById('출-보냄탈'),
           기록그대로: JSON.stringify(confirmedOrders) === window.__기록전 };
}, 칸);
console.log('■ 보낸 뒤: ' + JSON.stringify({ 장수: 보낸뒤.장수, 쓴곳: 보낸뒤.쓴곳, 단추글: 보낸뒤.단추글 }));
const A = 보낸뒤.문서['유한-20261009-01-A'] || {};
console.log('■ A 장: ' + JSON.stringify(A));
판('② 손가락으로 누르면 창고에 **한 장** 들어간다 (되읽어 확인한 뒤에만 「보냄」)',
   보낸뒤.장수 === 1 && !!보낸뒤.문서['유한-20261009-01-A']
   && /^보냄 · \d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(보낸뒤.단추글) && 보낸뒤.끝났다 && !보낸뒤.탈줄,
   보낸뒤.장수 + '장 · 단추 「' + 보낸뒤.단추글 + '」');
판('③ 담긴 칸이 **배송 확정 때와 같은 꼴**이다',
   JSON.stringify(Object.keys(A).sort()) === JSON.stringify(['큐알','발주번호','발주문서','파레트',
     '납기일','업체','줄수','총수량','명세표','보낸때','보낸때글','보낸uid','판'].sort())
   && A.큐알 === '유한-20261009-01-A' && A.발주문서 === 'd1405' && A.파레트 === 'A'
   && A.업체 === '유한가구' && A.납기일 === 날 && A.보낸때 === '때',
   JSON.stringify(Object.keys(A)));
판('④ 담긴 표가 없던 건은 **지금 그린 그 표**가 그대로 간다 (1줄 · 100개)',
   A.줄수 === 1 && A.총수량 === 100 && (A.명세표 || []).length === 1
   && A.명세표[0].계획들[0].파 === 'A'
   && A.명세표[0].계획들[0].품목들[0].몫 === 100,
   JSON.stringify(A.명세표[0].계획들));
판('⑥ **입고확인·업무 기록에는 한 번도 안 썼다**',
   보낸뒤.쓴곳.every(k => k.indexOf(칸) === 0 || /amt_boxes|amt_meta/.test(k))
   && !보낸뒤.쓴곳.some(k => /입고확인/.test(k)) && 보낸뒤.기록그대로 === true,
   JSON.stringify(보낸뒤.쓴곳));
if (그림칸()) await p.screenshot({ path: 그림칸() + '/resend-375-보냄.png' });
await 짚기('#명세서판 .명세-닫기');

// ── ④ 담긴 표가 있는 건은 **그때 그 표**가 간다 ────────────────────
await 짚기('[data-출큐알="유한-20261009-01-B"]');
await 짚기('#명세-보내기');
const B판 = await p.evaluate((칸) => window.__창고[칸 + '유한-20261009-01-B'] || null, 칸);
console.log('■ B 장: ' + JSON.stringify(B판));
판('④ 담긴 표가 있는 건은 **그때 그 표**가 그대로 간다 (담긴 것 · 가와 50개)',
   !!B판 && B판.줄수 === 1 && B판.총수량 === 50
   && B판.명세표[0].발주.displayName === '담긴 것'
   && B판.명세표[0].계획들[0].품목들[0].코드 === 'TB_1',
   JSON.stringify(B판 && B판.명세표));
await 짚기('#명세서판 .명세-닫기');

// ── ⑤ 못 쓰면 거짓 초록이 안 뜬다 ──────────────────────────────────
await p.evaluate(() => { window.__막나 = true; window.__쓴곳.length = 0; });
await 짚기('[data-출큐알="유한-20261009-01-A"]');
await 짚기('#명세-보내기');
const 막음 = await p.evaluate(() => {
  const e = document.getElementById('명세-보내기');
  return { 단추글: (e?.textContent || '').trim(), 죽음: !!e?.disabled,
           탈글: (document.getElementById('출-보냄탈')?.textContent || '').trim(),
           쓴곳: window.__쓴곳.slice() };
});
console.log('■ 막았을 때: ' + JSON.stringify(막음));
판('⑤ 못 보내면 **「보냄」 이라고 안 한다** — 붉은 한 줄 · 단추는 다시 누를 수 있다',
   !/보냄/.test(막음.단추글) && 막음.단추글 === '보내기' && !막음.죽음
   && 막음.탈글 === '거래처로 못 보냈습니다' && 막음.쓴곳.length === 0,
   '「' + 막음.단추글 + '」 · 「' + 막음.탈글 + '」');
if (그림칸()) await p.screenshot({ path: 그림칸() + '/resend-375-못보냄.png' });
await p.evaluate(() => { window.__막나 = false; });
await 짚기('#명세서판 .명세-닫기');

// ── ⑦ 자료가 덜 오면 단추가 죽는다 (빈 표를 보내지 않는다) ─────────
const 덜옴 = await p.evaluate(() => {
  window._자료옴.원장 = false;
  window.amt출고펴기('유한-20261009-01-A');
  const e = document.getElementById('명세-보내기');
  return { 죽음: !!e?.disabled, 머릿글: (document.querySelector('#명세서판 .출-다시그림')?.textContent || '').trim() };
});
console.log('■ 자료가 덜 왔을 때: ' + JSON.stringify(덜옴));
판('⑦ 자료가 덜 오면 단추가 **죽어 있다** (빈 표를 보내지 않는다)',
   덜옴.죽음 === true && /자료를 아직 못 받았습니다/.test(덜옴.머릿글),
   '죽음 ' + 덜옴.죽음 + ' · 「' + 덜옴.머릿글 + '」');
const 끝 = await p.evaluate(() => ({ 가로: document.documentElement.scrollWidth }));
판('375px 가로 스크롤 없다', 끝.가로 <= 375, 끝.가로 + 'px');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '출고다시보내기1   OK' : '출고다시보내기1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
