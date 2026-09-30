// 알림판 — 가리지 않고, 불량보고도 알림에 뜬다.
// 사장님 지시(09-29 12:21): 「알림팝업이 메인화면에 가려져 리스트가 안보인다.
//   또한 불량보고 등록시 알림에 뜨게 해줘」
// ① 종을 누르면 알림판이 첫 화면(박스판) 위로 올라와야 한다.
// ② 새 불량보고가 올라오면 알림에 한 줄 — 부속명 · 공정 · 올린이. 종 옆 숫자도 센다.
//    「전체삭제」 는 알림 줄만 지운다. defect_reports 는 절대 안 지운다.
import { 브라우저열기, devices, 서버, 자재, 그림칸 as 그림칸자리 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const 그림칸 = 그림칸자리();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const URL = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
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
p.on('dialog', d => d.accept());
await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1400);

await p.evaluate(() => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장','발주','도면','차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.__지운것 = []; window.__구독 = null; window.__보고들 = [];
  window.db = {}; window.storage = {};
  window.fbFirestore = {
    doc: (db, ...a) => ({ p: a.join('/'), id: a[a.length - 1] }),
    updateDoc: async () => {}, setDoc: async () => {},
    deleteDoc: async (ref) => { window.__지운것.push(ref.p); },
    addDoc: async () => ({ id: 'x' }),
    collection: (db, ...a) => ({ p: a.join('/') }),
    onSnapshot: (col, cb) => { if (/defect_reports/.test((col && col.p) || '')) { window.__구독 = cb; window.__알림(); } },
    query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  window.__알림 = () => { if (window.__구독) window.__구독({ forEach: fn => window.__보고들.forEach(r =>
    fn({ id: r.id, data: () => r })) }); };
  window.__보고넣기 = (r) => { window.__보고들.push(r); window.__알림(); };
  // 앱은 자료가 붙을 때 이것을 부른다(_자료동기시작). 이 상자에는 파이어베이스가
  // 안 붙으므로 시험이 그 자리를 대신 눌러 준다.
  window.amtDefectSync();
});
await p.waitForTimeout(400);

const cdp = await ctx.newCDPSession(p);
const 짚기 = async (r, ms = 110) => {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.y, radiusX: 14, radiusY: 14, force: 1 }] });
  await p.waitForTimeout(ms);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(450);
};
const 톡 = async (sel) => {
  const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null;
    const b = e.getBoundingClientRect();
    return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) }; }, sel);
  if (!r) { console.log('   !! 못 집음: ' + sel); return false; }
  await 짚기(r); return true;
};

// ── ① 첫 화면(박스판)에서 종을 누른다
await 톡('#notification-bell');
const ㄱ = await p.evaluate(() => {
  const d = document.getElementById('notification-dropdown');
  const r = d.getBoundingClientRect();
  const 점 = { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + Math.min(40, r.height / 2)) };
  const 위 = document.elementFromPoint(점.x, 점.y);
  return { 열림: !d.classList.contains('hidden'),
           맨위: 위 ? (위.id || String(위.className).slice(0, 30) || 위.tagName) : '(없음)',
           판안: !!(위 && 위.closest && 위.closest('#notification-dropdown')),
           부모: d.parentElement ? (d.parentElement.tagName + (d.parentElement.id ? '#' + d.parentElement.id : '')) : '(없음)',
           z: parseInt(getComputedStyle(d).zIndex, 10),
           왼: Math.round(r.x), 오: Math.round(r.right), 폭: Math.round(r.width),
           문서가로: document.documentElement.scrollWidth,
           홈: document.documentElement.getAttribute('data-amthome') };
});
console.log('① 종을 누른 뒤 : ' + JSON.stringify(ㄱ));
판('① 첫 화면에서도 알림판이 위로 올라온다', ㄱ.열림 === true && ㄱ.판안 === true,
   '맨 위 요소 「' + ㄱ.맨위 + '」');
판('① 알림판이 몸통(body) 바로 밑에 선다 (머리줄에 갇히지 않는다)', ㄱ.부모 === 'BODY', ㄱ.부모);
판('① 불량보고 창(2147483500)보다는 낮다', ㄱ.z < 2147483500 && ㄱ.z > 9999, 'z ' + ㄱ.z);
판('① 375px 안에 다 든다', ㄱ.오 <= 375 && ㄱ.왼 >= 0 && ㄱ.문서가로 <= 375,
   '왼 ' + ㄱ.왼 + ' · 오 ' + ㄱ.오 + ' · 폭 ' + ㄱ.폭);

// ── ② 불량보고가 올라오면 알림에 한 줄
await p.evaluate(() => window.__보고넣기({ id: 'r9', 때: Date.now(), 날: new Date().toISOString().slice(0, 10),
  발주번호: 1401, 발주docId: 'd1', 발주코드: '조혼-20260929-01', 상품명: '(KRW) 알렉스 800',
  부속키: 'card-1401-11', 부속명: '도어', 공정: '재단', 글: '모서리 깨짐', 사진: [],
  올린이: '작업자A', 어디서: '공정카드' }));
await p.waitForTimeout(600);
const ㄴ = await p.evaluate(() => {
  const list = document.getElementById('notifications-list');
  const 줄 = [...list.querySelectorAll('[data-불량]')];
  const badge = document.getElementById('notification-badge');
  return { 줄수: 줄.length, 글: 줄.length ? 줄[0].textContent.replace(/\s+/g, ' ').trim() : '',
           높이: 줄.length ? Math.round(줄[0].getBoundingClientRect().height) : 0,
           숫자: badge.classList.contains('hidden') ? null : badge.textContent,
           전체글: (list.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120) };
});
console.log('② 불량보고 알림 : ' + JSON.stringify(ㄴ));
판('② 새 불량보고가 알림에 한 줄 뜬다', ㄴ.줄수 === 1, ㄴ.줄수 + '줄 · 「' + ㄴ.글 + '」');
판('② 그 줄에 부속명 · 공정 · 올린이가 있다',
   /도어/.test(ㄴ.글) && /재단/.test(ㄴ.글) && /작업자A/.test(ㄴ.글), '「' + ㄴ.글 + '」');
판('② 구구절절하지 않다 (한 줄 · 문장 아님)', !/(습니다|주세요|됩니다)/.test(ㄴ.글), '「' + ㄴ.글 + '」');
판('② 누르는 높이 44px 이상', ㄴ.높이 >= 44, ㄴ.높이 + 'px');
판('② 종 옆 빨간 숫자에도 세어진다', ㄴ.숫자 === '1', '숫자 ' + ㄴ.숫자);

await p.screenshot({ path: 그림칸 + '/noti-375-알림판.png' });   // 판 위로 올라온 채 불량 줄이 보이는 자리
// 눌러 보면 불량보고 판으로 간다
await 톡('[data-불량]');
const ㄷ = await p.evaluate(() => ({
  판: document.documentElement.getAttribute('data-amtdefect'),
  알림닫힘: document.getElementById('notification-dropdown').classList.contains('hidden') }));
console.log('② 알림 줄을 누른 뒤 : ' + JSON.stringify(ㄷ));
판('② 누르면 불량보고 판으로 간다', ㄷ.판 === '1', JSON.stringify(ㄷ));
판('② 알림판은 닫힌다 (지금 알림들과 같은 법)', ㄷ.알림닫힘 === true, String(ㄷ.알림닫힘));

// ── ③ 전체삭제 — 알림 줄만 지운다
await 톡('#notification-bell');
await 톡('#notification-dropdown button');      // 머리줄 첫 단추가 「전체삭제」
await p.waitForTimeout(400);
const ㄹ = await p.evaluate(() => ({
  줄수: document.querySelectorAll('#notifications-list [data-불량]').length,
  보고수: window.__보고들.length, 지운것: window.__지운것,
  숫자: document.getElementById('notification-badge').classList.contains('hidden') }));
console.log('③ 전체삭제 뒤 : ' + JSON.stringify(ㄹ));
판('③ 전체삭제로 알림 줄이 사라진다', ㄹ.줄수 === 0, ㄹ.줄수 + '줄');
판('③ 진짜 보고(defect_reports)는 그대로다', ㄹ.보고수 === 1 && ㄹ.지운것.length === 0,
   '보고 ' + ㄹ.보고수 + '건 · 지운 것 ' + ㄹ.지운것.length);

판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
console.log(실패 === 0 ? 'noti1   OK' : 'noti1   FAIL (' + 실패 + ')');
await b.close(); process.exit(실패 === 0 ? 0 : 1);
