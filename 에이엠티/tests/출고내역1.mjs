// 「에이엠티에도 출고내역 박스를 만들고 거래처별 박스를 만들어 동일한 거래명세표가
//  해당 거래처 박스안에 기록되게 해주세요.」 — 사장님 말씀 (10-12)
// ① 박스판에 「출고내역」 박스가 서는지 ② 누르면 **거래처 네모**가 자료에서 그려지는지
// ③ 거래처를 누르면 그 거래처의 거래명세표 목록이 나오는지 ④ 한 장을 누르면
// **입고확인 때 담은 그 표**가 그대로 펴지는지 ⑤ 담긴 표가 없는 옛 줄은 다시 그리고
// **한 줄로 알리는지** ⑥ 입고확인이 없는 거래처는 네모가 안 생기는지 ⑦ 못 읽으면
// 터지지 않고 한 줄로 알리는지 ⑧ 업무 기록에 쓰기 0 인지 를 잰다.
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
  await p.waitForTimeout(600); return true;
};

const 차림 = await p.evaluate((L) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장', '발주', '도면', '차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.__쓴곳 = []; window.__창고 = {};
  const 방 = (...a) => a.join('/');
  window.db = {}; window._myAccount = { uid: '시험uid' };
  // 입고확인 두 장 — 하나는 **표가 담긴 것**, 하나는 **담기기 전 옛 줄**
  const 칸 = 'artifacts/vivivic-4b7ef/public/data/입고확인';
  window.__입고 = {
    '유한-20261009-01-A': { 큐알: '유한-20261009-01-A', 업체: '유한가구', 파레트: 'A',
      발주번호: '유한-20261009-01', 발주문서: 'd9901', 납기일: '2026-10-21',
      줄수: 2, 총수량: 50, 확인시각글: '2026-10-12 09:10',
      명세표: [{ 발주: { displayName: '시험상품 담김', code: '', orderCode: '유한-20261009-01',
                        deliveryDate: '2026-10-21' },
                 계획들: [{ 파: 'A', 매: null, 종류: 'PB-18T', 색상: '화이트', 품목들: [
                   { 이름: '도어', 크기: '784*396', 몫: 30, 코드: 'TA_담김_1' },
                   { 이름: '가와', 크기: '748*400', 몫: 20, 코드: 'TA_담김_2' }] }] }] },
    '조혼-20261009-01-B': { 큐알: '조혼-20261009-01-B', 업체: '조혼가구', 파레트: 'B',
      발주번호: '조혼-20261009-01', 발주문서: 'd9902', 납기일: '2026-10-21',
      줄수: 1, 총수량: 7, 확인시각글: '2026-10-12 08:00' },   // ← **명세표 칸이 없다 (옛 줄)**
  };
  window.fbFirestore = {
    doc: (db, ...a) => ({ 길: 방(...a) }),
    collection: (db, ...a) => ({ 길: 방(...a) }),
    setDoc: async (r, v) => { window.__쓴곳.push(r.길); window.__창고[r.길] = v; },
    updateDoc: async (r) => { window.__쓴곳.push(r.길); },
    deleteDoc: async () => {}, addDoc: async (r) => { window.__쓴곳.push(r.길); },
    getDoc: async (r) => ({ exists: () => !!window.__창고[r.길], data: () => window.__창고[r.길] || {} }),
    getDocs: async (r) => {
      if (window.__읽기막나) throw new Error('PERMISSION_DENIED: 시험으로 막음');
      const 모 = (r.길 === 칸) ? Object.entries(window.__입고) : [];
      return { forEach: (f) => 모.forEach(([id, v]) => f({ id, data: () => v })) };
    },
    onSnapshot: (r, cb) => {
      // 박스판 듣기는 손에 쥐고 있다가, 박스를 세운 뒤 한 번 더 들려 준다
      if (/amt_boxes$/.test(r.길)) window.__박스듣기 = () => cb({ forEach: (f) =>
        Object.entries(window.__창고).filter(([k]) => k.indexOf('/amt_boxes/') >= 0)
          .forEach(([k, v]) => f({ id: k.split('/').pop(), data: () => v })) });
      if (cb) cb({ forEach: () => {} }); return () => {}; },
    query: x => x, serverTimestamp: () => '때', deleteField: () => null };
  currentFullData.length = 0; L.forEach(r => currentFullData.push(r));
  confirmedOrders.length = 0;
  window.__기록전 = JSON.stringify(confirmedOrders);
  return { ok: true };
}, L);
console.log('■ 차림: ' + JSON.stringify(차림));

// ── ① 박스판에 「출고내역」 박스가 선다 ─────────────────────────────
const 박스 = await p.evaluate(async () => {
  try { window.amtBoxSync(); } catch (e) {}
  await new Promise(r => setTimeout(r, 400));
  return { 쓴곳: window.__쓴곳.slice(),
           값: window.__창고['artifacts/vivivic-4b7ef/public/data/amt_boxes/출고내역'] || null };
});
console.log('■ 세운 박스: ' + JSON.stringify(박스));
판('① 박스판(곳 home)에 「출고내역」 박스를 한 번 세운다',
   !!박스.값 && 박스.값.name === '출고내역' && 박스.값.곳 === 'home' && 박스.값.link === '출고'
   && 박스.쓴곳.filter(k => /amt_boxes/.test(k)).length === 1,
   JSON.stringify(박스.값) + ' · 쓴 횟수 ' + 박스.쓴곳.filter(k => /amt_boxes/.test(k)).length);

// 세운 박스가 **박스판에 그려지는지** — 소식을 한 번 더 들려 보고 눈으로도 찍는다
const 판위 = await p.evaluate(async () => {
  window.__박스듣기 && window.__박스듣기();
  await new Promise(r => setTimeout(r, 300));
  const t = [...document.querySelectorAll('[data-amtb-id]')]
    .find(e => (e.querySelector('.amth-nm')?.textContent || '').trim() === '출고내역');
  if (!t) return { 있나: false };
  t.scrollIntoView({ block: 'center' });
  const r2 = t.getBoundingClientRect();
  return { 있나: true, 갈곳: (t.querySelector('.amth-pct')?.textContent || '').trim(),
           보이나: r2.top >= 0 && r2.bottom <= innerHeight, 높: Math.round(r2.height) };
});
console.log('■ 박스판: ' + JSON.stringify(판위));
판('① 박스판에 「출고내역」 타일이 보인다 (갈 곳도 적힌다)',
   판위.있나 && 판위.갈곳 === '출고내역' && 판위.보이나,
   JSON.stringify(판위));
if (그림칸()) await p.screenshot({ path: 그림칸() + '/out-375-박스판출고내역.png' });

// ── ② 열면 거래처 네모가 **자료에서** 그려진다 ─────────────────────
await p.evaluate(() => window.amtOpen출고());
await p.waitForTimeout(500);
const 네모 = await p.evaluate(() => ({
  보임: getComputedStyle(document.getElementById('amt-출고')).display,
  제목: (document.getElementById('출-제목')?.textContent || '').trim(),
  셈: (document.getElementById('출-셈')?.textContent || '').trim(),
  네모들: [...document.querySelectorAll('[data-출업체]')].map(e => ({
    이름: (e.querySelector('.amth-nm')?.textContent || '').trim(),
    장: (e.querySelector('.amth-sub')?.textContent || '').trim(),
    타일: e.classList.contains('amth-tile'),
    높: Math.round(e.getBoundingClientRect().height) })),
  가로: document.documentElement.scrollWidth }));
console.log('■ 거래처 네모: ' + JSON.stringify(네모));
판('② 출고내역 화면이 열리고 **거래처 네모**가 선다 (적힌 업체로)',
   네모.보임 === 'block' && 네모.네모들.length === 2
   && JSON.stringify(네모.네모들.map(x => x.이름)) === JSON.stringify(['유한가구', '조혼가구']),
   네모.셈 + ' · ' + JSON.stringify(네모.네모들.map(x => x.이름 + ' ' + x.장)));
// 박스판 타일과 **같은 줄의 꼴**을 쓴다 — 거기 min-height 가 150px 다
판('② 네모는 박스판 타일 그대로다 (같은 꼴 · 150px)',
   네모.네모들.every(x => x.타일 && x.높 >= 150) && 네모.가로 <= 375,
   JSON.stringify(네모.네모들.map(x => x.높)) + ' · ' + 네모.가로 + 'px');
판('⑥ 입고확인이 없는 거래처는 **빈 네모가 안 생긴다**',
   네모.네모들.length === 2 && !네모.네모들.some(x => x.장 === '0장'),
   JSON.stringify(네모.네모들.map(x => x.이름 + ' ' + x.장)));
if (그림칸()) await p.screenshot({ path: 그림칸() + '/out-375-거래처네모.png' });

// ── ③ 거래처를 누르면 그 거래처의 명세표 목록 ───────────────────────
await 짚기('[data-출업체="유한가구"]');
const 목록 = await p.evaluate(() => ({
  제목: (document.getElementById('출-제목')?.textContent || '').trim(),
  셈: (document.getElementById('출-셈')?.textContent || '').trim(),
  줄: [...document.querySelectorAll('[data-출큐알]')].map(e => ({
    큐알: e.dataset['출큐알'],
    글: (e.textContent || '').replace(/\s+/g, ' ').trim(),
    높: Math.round(e.getBoundingClientRect().height) })) }));
console.log('■ 유한가구 목록: ' + JSON.stringify(목록));
판('③ 거래처를 손가락으로 누르면 **그 거래처 것만** 목록에 선다',
   목록.제목 === '유한가구' && 목록.셈 === '1장' && 목록.줄.length === 1
   && 목록.줄[0].큐알 === '유한-20261009-01-A' && 목록.줄[0].높 >= 44,
   JSON.stringify(목록.줄));
판('③ 한 줄에 날짜 · 발주번호-파레트 · 줄수 · 총수량이 적힌다',
   /10-12 09:10/.test(목록.줄[0].글) && /유한-20261009-01-A/.test(목록.줄[0].글)
   && /2줄/.test(목록.줄[0].글) && /50개/.test(목록.줄[0].글),
   '「' + 목록.줄[0].글 + '」');

// ── ④ 한 장을 누르면 **담은 그 표**가 펴진다 ────────────────────────
await 짚기('[data-출큐알="유한-20261009-01-A"]');
const 편것 = await p.evaluate(() => {
  const 판 = document.getElementById('명세서판'); if (!판) return { 안열림: true };
  const 표 = 판.querySelector('.명세-표');
  const 몸줄 = 표 ? [...표.querySelectorAll('tr')].slice(2).filter(tr => !tr.classList.contains('합'))
    .map(tr => [...tr.children].map(e => (e.textContent || '').trim())) : [];
  return { 제목: (판.querySelector('.명세-제목')?.textContent || '').trim(),
           번호: (판.querySelector('.명세-번호')?.textContent || '').trim(),
           줄수: 몸줄.length, 몸줄,
           다시그림: !!판.querySelector('.출-다시그림'),
           입고단추: !!document.getElementById('명세-입고'),
           단추: [...판.querySelectorAll('.명세-바닥 button')].map(e => e.getAttribute('aria-label')) };
});
console.log('■ 편 거래명세표: ' + JSON.stringify(편것));
판('④ 그 거래명세표가 펴진다 — 머리에 **큐알 글과 확인시각**',
   !편것.안열림 && 편것.제목 === '유한-20261009-01-A'
   && 편것.번호 === '입고확인 2026-10-12 09:10', '「' + 편것.제목 + '」 · 「' + 편것.번호 + '」');
판('④ **담긴 그 표**가 그대로 나온다 (2줄 · 도어 30개 · 가와 20개)',
   편것.줄수 === 2 && 편것.다시그림 === false
   && 편것.몸줄.some(td => td.includes('도어') && td.includes('30개'))
   && 편것.몸줄.some(td => td.includes('가와') && td.includes('20개')),
   JSON.stringify(편것.몸줄));
판('④ 여기에는 입고확인 단추를 안 단다 (큐알로 들어온 길이 아니다)',
   편것.입고단추 === false, '있나 ' + 편것.입고단추);
if (그림칸()) {   // 품목 칸(이름·몫)이 오른쪽에 있다 — 거기까지 밀어 놓고 찍는다
  await p.evaluate(() => { const m = document.querySelector('#명세서판 .명세-몸');
    if (m) m.scrollLeft = m.scrollWidth; });
  await p.waitForTimeout(200);
  await p.screenshot({ path: 그림칸() + '/out-375-거래명세표.png' });
}
await 짚기('#명세서판 .명세-닫기');

// ── ⑤ 담긴 표가 없는 옛 줄 ─────────────────────────────────────────
await p.evaluate(() => { window.amt출고뒤(); });
await p.waitForTimeout(300);
await 짚기('[data-출업체="조혼가구"]');
await 짚기('[data-출큐알="조혼-20261009-01-B"]');
const 옛것 = await p.evaluate(() => {
  const 판 = document.getElementById('명세서판'); if (!판) return { 안열림: true };
  return { 다시그림글: (판.querySelector('.출-다시그림')?.textContent || '').trim(),
           제목: (판.querySelector('.명세-제목')?.textContent || '').trim() };
});
console.log('■ 옛 줄: ' + JSON.stringify(옛것));
/* v1.61.0 — 이 차림에는 그 발주(d9902)가 아예 없다. 자료는 다 왔는데 0줄이니
   「지금 자료로 그렸습니다」 가 아니라 **그때 표가 안 남았다**가 사실이다.
   (지금 자료로 그려지는 쪽은 `출고못읽음1` 이 잰다.) 숨기지 않는 것은 그대로다. */
판('⑤ 담긴 표가 없으면 **한 줄로 알린다** (숨기지 않는다)',
   !옛것.안열림 && 옛것.다시그림글 === '이 건은 옛 판에서 찍혀 그때 표가 안 남았습니다',
   '「' + 옛것.다시그림글 + '」');
판('⑤ 그때도 안 터진다', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await 짚기('#명세서판 .명세-닫기');

// ── ⑦ 못 읽으면 한 줄로 알린다 ─────────────────────────────────────
const 못읽음 = await p.evaluate(async () => {
  window.__읽기막나 = true;
  await window.amtOpen출고();
  await new Promise(r => setTimeout(r, 200));
  return { 글: (document.querySelector('#amt-출고 .ams-empty')?.textContent || '').trim(),
           네모: document.querySelectorAll('[data-출업체]').length };
});
console.log('■ 못 읽을 때: ' + JSON.stringify(못읽음));
판('⑦ 못 읽으면 터지지 않고 **한 줄로** 알린다',
   못읽음.글 === '출고내역을 못 읽었습니다' && 못읽음.네모 === 0, '「' + 못읽음.글 + '」');

// ── ⑧ 업무 기록에 쓰기 0 ───────────────────────────────────────────
const 끝 = await p.evaluate(() => ({
  쓴곳: window.__쓴곳.slice(),
  기록그대로: JSON.stringify(confirmedOrders) === window.__기록전,
  가로: document.documentElement.scrollWidth }));
console.log('■ 쓴 곳: ' + JSON.stringify(끝.쓴곳));
// v1.57.0 부터 **「한 번 세웠다」 자국**(amt_meta/박스세움)이 하나 더 적힌다 — 그 둘뿐이다
판('⑧ 쓴 곳은 **박스와 그 자국뿐**이다 (입고확인·업무기록에 쓰기 0)',
   끝.쓴곳.length === 2 && /amt_boxes\/출고내역$/.test(끝.쓴곳[0])
   && /amt_meta\/박스세움$/.test(끝.쓴곳[1]) && 끝.기록그대로 === true,
   JSON.stringify(끝.쓴곳) + ' · 업무기록 그대로 ' + 끝.기록그대로);
판('⑧ 375px 가로 스크롤 없다', 끝.가로 <= 375, 끝.가로 + 'px');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '출고내역1   OK' : '출고내역1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
