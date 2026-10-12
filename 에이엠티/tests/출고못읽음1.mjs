// 사장님 10-12 09:08: 「명세서가 안나타 납니다」
//   [에이엠티 / 발주서 · **유한-20261009-01-A 에 담긴 것이 없습니다.**]
// 쟀더니 그 발주의 파레트 A 에는 **이동선반 1줄·100개가 있었다.** 담긴 것이 없는 게
// 아니라 **아직 못 읽은 것**이었다(원장·발주·파레트 중 하나만 없어도 0줄이 된다).
// ① 자료가 덜 왔을 때 **「담긴 것이 없습니다」 를 안 띄우는지** ② 대신 못 받았다고 적는지
// ③ 자료가 들어오면 **스스로 다시 그려** 그 줄이 뜨는지 ④ 다 갖추고도 0줄이면 글이
// 「그때 표가 안 남았습니다」 로 바뀌는지 ⑤ 명세표가 담긴 건은 전과 똑같은지 를 잰다.
import { 브라우저열기, devices, 서버, 자료, 자재, 그림칸 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const 터 = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const L = await 자료('원장');
const b = await 브라우저열기();
let 실패 = 0; const 판 = (n, t, v) => { if (!t) 실패++; console.log((t ? '  OK  ' : '  FAIL') + '  ' + n + '   → ' + v); };
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
  await p.waitForTimeout(600); return true;
};

const 날 = '2026-10-22';
/* 사장님 건과 **같은 꼴**로 심는다 — 파레트 A 는 「엣지만 A」 인 부속 하나뿐이고,
   나머지는 보링에서 B 로 가 A 에서 빠진다(뒤 공정이 이긴다). 진짜 자료가 그랬다. */
const 차림 = await p.evaluate(({ L, 날 }) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  const 방 = (...a) => a.join('/');
  window.__쓴곳 = []; window.__창고 = {};
  window.db = {}; window._myAccount = { uid: '시험uid' };
  const 칸 = 'artifacts/vivivic-4b7ef/public/data/입고확인';
  window.__입고 = {
    // ㉠ 옛 줄 — v1.54.0 에 찍혀 **명세표가 안 담겼다** (사장님이 여신 그 건)
    '유한-20261009-01-A': { 큐알: '유한-20261009-01-A', 업체: '유한가구', 파레트: 'A',
      발주번호: '유한-20261009-01', 발주문서: 'd1405', 납기일: 날,
      줄수: 1, 총수량: 100, 확인시각글: '2026-10-12 15:40', 판: 'v1.54.0' },
    // ㉤ 새 줄 — 명세표가 담겼다 (전과 똑같아야 한다)
    '유한-20261009-01-B': { 큐알: '유한-20261009-01-B', 업체: '유한가구', 파레트: 'B',
      발주번호: '유한-20261009-01', 발주문서: 'd1405', 납기일: 날,
      줄수: 1, 총수량: 50, 확인시각글: '2026-10-12 16:00', 판: 'v1.55.0',
      명세표: [{ 발주: { displayName: '담긴 것', code: '', orderCode: '유한-20261009-01', deliveryDate: 날 },
                 계획들: [{ 파: 'B', 매: null, 종류: 'PB-18T', 색상: '아이보리', 품목들: [
                   { 이름: '가와', 크기: '1015*480', 몫: 50, 코드: 'TB_1' }] }] }] },
  };
  window.fbFirestore = {
    doc: (db, ...a) => ({ 길: 방(...a) }), collection: (db, ...a) => ({ 길: 방(...a) }),
    setDoc: async (r, v) => { window.__쓴곳.push(r.길); window.__창고[r.길] = v; },
    updateDoc: async (r) => { window.__쓴곳.push(r.길); }, deleteDoc: async () => {},
    addDoc: async (r) => { window.__쓴곳.push(r.길); },
    getDoc: async (r) => ({ exists: () => !!window.__창고[r.길], data: () => window.__창고[r.길] || {} }),
    getDocs: async (r) => { const 모 = (r.길 === 칸) ? Object.entries(window.__입고) : [];
      return { forEach: (f) => 모.forEach(([id, v]) => f({ id, data: () => v })) }; },
    onSnapshot: (r, cb) => { if (cb) cb({ forEach: () => {} }); return () => {}; },
    query: x => x, serverTimestamp: () => '때', deleteField: () => null };

  // ⚠ **원장은 아직 안 온 것으로 둔다** — 사장님 화면이 그랬다
  window.__원장줄 = L;
  currentFullData.length = 0;
  window._자료옴 = { 원장: false, 발주: true, 도면: true, 차례: true };

  // 발주는 왔다 — 진짜 건과 같은 꼴(부속 5개 · A 는 엣지만, 나머지는 보링 B)
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
    partInfoMap: Object.fromEntries(줄.map((ri, i) => [ck(ri), {
      qty: 100, unitCons: 2, isDeleted: false, plateName: 'PB-18T', finishColor: '아이보리',
      partName: i === 0 ? '이동선반' : ('부속' + i), w: 761, d: 430 }])),
    partStarted: {}, partCompletions: {},
  });
  window._파레트기록 = { d1405: { docId: 'd1405', 고른: Object.assign(
    { [ck(줄[0]) + '|엣지']: 'A' },                                   // ← A 에 남는 하나
    ...줄.slice(1).map(ri => ({ [ck(ri) + '|엣지']: 'A', [ck(ri) + '|보링']: 'B' })) ) } };
  window._집중파레트들 = {};
  window.__기록전 = JSON.stringify(confirmedOrders);
  document.documentElement.removeAttribute('data-amthome');
  return { 줄, 첫부속: L[줄[0]][h.indexOf('부속명')] };
}, { L, 날 });
console.log('■ 차림: ' + JSON.stringify(차림));
if (차림.못세움) { console.log('출고못읽음1   FAIL (원장에 쓸 줄이 모자람)'); process.exit(1); }

// ── ① ② 원장이 아직 안 왔을 때 ─────────────────────────────────────
await p.evaluate(() => window.amtOpen출고());
await p.waitForTimeout(400);
await 짚기('[data-출업체="유한가구"]');
await 짚기('[data-출큐알="유한-20261009-01-A"]');
const 덜왔을때 = await p.evaluate(() => {
  const 판 = document.getElementById('명세서판'); if (!판) return { 안열림: true };
  return { 머릿글: (판.querySelector('.출-다시그림')?.textContent || '').trim(),
           빈글: (판.querySelector('.명세-없음')?.textContent || '').trim(),
           표: !!판.querySelector('.명세-표'),
           몸글: (판.querySelector('.명세-몸')?.textContent || '').replace(/\s+/g, ' ').trim() };
});
console.log('■ 원장이 덜 왔을 때: ' + JSON.stringify(덜왔을때));
판('① **「담긴 것이 없습니다」 를 안 띄운다** (못 읽은 것을 없다고 하지 않는다)',
   !덜왔을때.안열림 && 덜왔을때.빈글 === '' && !/담긴 것이 없습니다/.test(덜왔을때.몸글),
   '「' + 덜왔을때.몸글 + '」');
판('② 대신 **무엇을 못 받았는지** 한 줄로 적는다',
   덜왔을때.머릿글 === '자료를 아직 못 받았습니다 — 원장', '「' + 덜왔을때.머릿글 + '」');
if (그림칸()) await p.screenshot({ path: 그림칸() + '/lost-375-못받음.png' });

// ── ③ 원장이 들어오면 **스스로** 다시 그린다 ───────────────────────
await p.evaluate(() => {
  window.__원장줄.forEach(r => currentFullData.push(r));
  window._자료옴.원장 = true;                       // 원장이 손에 들어온 그 순간
});
await p.waitForTimeout(1600);                        // 스스로 다시 그릴 틈 (0.5초마다 본다)
const 들어온뒤 = await p.evaluate(() => {
  const 판 = document.getElementById('명세서판'); if (!판) return { 안열림: true };
  const 표 = 판.querySelector('.명세-표');
  const 몸줄 = 표 ? [...표.querySelectorAll('tr')].slice(2).filter(tr => !tr.classList.contains('합'))
    .map(tr => [...tr.children].map(e => (e.textContent || '').trim())) : [];
  return { 머릿글: (판.querySelector('.출-다시그림')?.textContent || '').trim(),
           줄수: 몸줄.length, 몸줄 };
});
console.log('■ 원장이 들어온 뒤: ' + JSON.stringify(들어온뒤));
// 부속 이름은 **원장 줄에서** 온다(info.partName 이 아니다) — 그 줄의 이름이 떠야 한다
판('③ 원장이 들어오면 **손대지 않아도 다시 그린다** — 그 줄이 뜬다 (1줄 · 100개)',
   들어온뒤.줄수 === 1 && 들어온뒤.몸줄[0].includes(차림.첫부속)
   && 들어온뒤.몸줄[0].includes('100개') && 들어온뒤.몸줄[0].includes('A'),
   JSON.stringify(들어온뒤.몸줄));
판('③ 그때는 **지금 자료로 그렸다**고 적는다',
   들어온뒤.머릿글 === '그때 표가 안 담겨 있습니다 — 지금 자료로 그렸습니다',
   '「' + 들어온뒤.머릿글 + '」');
if (그림칸()) await p.screenshot({ path: 그림칸() + '/lost-375-들어온뒤.png' });
await 짚기('#명세서판 .명세-닫기');

// ── ⑤ 명세표가 담긴 건은 전과 똑같다 ───────────────────────────────
await 짚기('[data-출큐알="유한-20261009-01-B"]');
const 담긴것 = await p.evaluate(() => {
  const 판 = document.getElementById('명세서판'); if (!판) return { 안열림: true };
  const 표 = 판.querySelector('.명세-표');
  const 몸줄 = 표 ? [...표.querySelectorAll('tr')].slice(2).filter(tr => !tr.classList.contains('합'))
    .map(tr => [...tr.children].map(e => (e.textContent || '').trim())) : [];
  return { 머릿글: (판.querySelector('.출-다시그림')?.textContent || '').trim(), 줄수: 몸줄.length, 몸줄 };
});
console.log('■ 담긴 건: ' + JSON.stringify(담긴것));
판('⑤ **명세표가 담긴 건은 전과 똑같다** (머릿글 없이 그 표 그대로)',
   담긴것.줄수 === 1 && 담긴것.머릿글 === '' && 담긴것.몸줄[0].includes('가와')
   && 담긴것.몸줄[0].includes('50개'), JSON.stringify(담긴것.몸줄));
await 짚기('#명세서판 .명세-닫기');

// ── ④ 다 갖추고도 0줄이면 글이 바뀐다 ──────────────────────────────
const 진짜없음 = await p.evaluate(() => {
  confirmedOrders.length = 0;                       // 그 발주가 이제 없다 (진짜로 0줄)
  window.amt출고펴기('유한-20261009-01-A');
  const 판 = document.getElementById('명세서판');
  return { 머릿글: (판?.querySelector('.출-다시그림')?.textContent || '').trim(),
           빈글: (판?.querySelector('.명세-없음')?.textContent || '').trim() };
});
console.log('■ 진짜 0줄: ' + JSON.stringify(진짜없음));
판('④ 다 갖추고도 0줄이면 **「그때 표가 안 남았습니다」** 로 적는다',
   진짜없음.머릿글 === '이 건은 옛 판에서 찍혀 그때 표가 안 남았습니다' && 진짜없음.빈글 === '',
   '「' + 진짜없음.머릿글 + '」');

// ── 쓰기 0 · 안 터짐 ───────────────────────────────────────────────
const 끝 = await p.evaluate(() => ({ 쓴곳: window.__쓴곳.slice(),
  기록그대로: true, 가로: document.documentElement.scrollWidth,
  시계: !!window._출고시계 }));
판('업무 기록·입고확인에 쓰기 0 (박스 자국 말고는 안 쓴다)',
   끝.쓴곳.every(k => /amt_boxes|amt_meta/.test(k)), JSON.stringify(끝.쓴곳));
판('375px 가로 스크롤 없다', 끝.가로 <= 375, 끝.가로 + 'px');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '출고못읽음1   OK' : '출고못읽음1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
