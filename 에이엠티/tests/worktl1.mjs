// 작업중인 공정이 있어도 공정 캘린더가 보여야 한다.
// 사장님 지시(09-28 03:39): 「작업중 공정이 있는데 공정캘린더가 안떠요」
// 까닭: 집중 창(#_집중판)이 화면을 통째로 덮는다(inset 0 · z-index 2147483000).
//   완료나 취소를 누르기 전에는 안 걷히고, 새로고침해도 되살아난다.
//   그래서 일을 붙잡고 있는 동안에는 캘린더를 아예 못 본다.
// 고침: 집중 창을 접을 수 있게 하고, 접으면 아래 띠(#_집중띠)만 남긴다.
//   새로고침으로 되살아날 때는 접힌 채로 돌아온다. 시간은 접어도 계속 간다.
import { 브라우저열기, devices, 서버, 자료, 자재, 그림칸 as 그림칸자리 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const 그림칸 = 그림칸자리();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const B = 'http://127.0.0.1:8899';
const URL = B + '/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const O = await 자료('confirmed_orders');
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

const cdp = await ctx.newCDPSession(p);
const 톡 = async (sel, ms = 110) => {
  const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null;
    const b = e.getBoundingClientRect();
    return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) }; }, sel);
  if (!r) { console.log('   !! 못 집음: ' + sel); return false; }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.y, radiusX: 14, radiusY: 14, force: 1 }] });
  await p.waitForTimeout(ms);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(420); return true;
};

// 자료를 다 받은 셈 치고, 확정발주를 얹어 캘린더를 그린다
await p.evaluate((O) => {
  const ov = document.getElementById('auth-login-overlay'); if (ov) ov.style.display = 'none';
  ['원장','발주','도면','차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.__쓰기 = 0; const 셈 = () => async () => { window.__쓰기++; };
  window.db = {}; window.fbFirestore = { doc: () => ({}), updateDoc: 셈(), setDoc: 셈(), deleteDoc: 셈(), addDoc: 셈(),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  confirmedOrders.length = 0;
  O.filter(o => o.amtTimeline === true && !o.amtConfirmedCancel).forEach(o => confirmedOrders.push(o));
}, O);
await p.waitForTimeout(400);
// 사장님이 하시듯 첫 화면에서 「공정 일정 타임라인」 박스를 손가락으로 연다
await 톡('button.amth-tile[onclick*="timeline"]');
await p.waitForTimeout(900);

// 일을 하나 붙잡는다 — 「시작」 을 누른 뒤와 같은 기록이다
await p.evaluate(() => {
  const o = confirmedOrders[0];
  o.partStarted = o.partStarted || {};
  o.partStarted['__시험카드'] = { '엣지': { started: true, startMs: Date.now(),
    date: new Date().toISOString().slice(0, 10), partName: '시험 부속 · 엣지', 쌓인분: 0, 멈춤: false } };
  window._집중판다시();          // 발주 소식이 올 때(새로고침 뒤) 앱이 부르는 그것
});
await p.waitForTimeout(700);

const 본다 = () => p.evaluate(() => {
  // 사장님이 하시듯 타임라인 자리로 내린 다음, 날짜칸 한가운데를 짚어 본다.
  const sec = document.getElementById('order-timeline-section');
  if (sec) window.scrollTo(0, sec.getBoundingClientRect().top + window.scrollY - 70);
  const c = document.getElementById('process-timeline-container');
  const 날 = c ? [...c.querySelectorAll('[data-tl-date]')]
        .find(d => { const r = d.getBoundingClientRect(); return r.left > 0 && r.right < 375; }) : null;
  let 캘린더보임 = false, 맨위 = '(없음)';
  if (날) {
    const r = 날.getBoundingClientRect();
    const x = Math.round(Math.min(Math.max(r.left + r.width / 2, 5), 370));
    const y = Math.round(Math.min(Math.max(r.top + 60, 150), 700));
    const e = document.elementFromPoint(x, y);
    맨위 = e ? (e.id || e.className || e.tagName) : '(없음)';
    캘린더보임 = !!(e && e.closest('#process-timeline-container'));
  }
  const 띠 = document.getElementById('_집중띠');
  const 띠칸 = 띠 ? 띠.getBoundingClientRect() : null;
  return {
    날칸: c ? c.querySelectorAll('[data-tl-date]').length : 0,
    캘린더보임, 맨위,
    집중판: !!document.getElementById('_집중판'),
    띠: !!띠, 띠높이: 띠칸 ? Math.round(띠칸.height) : 0,
    띠글: 띠 ? (띠.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60) : '',
    붙든일: (typeof _집중찾기 === 'function') ? !!_집중찾기() : '(함수없음)',
  };
});

const ㄱ = await 본다();
console.log('① 새로고침으로 되살아난 자리 : ' + JSON.stringify(ㄱ));
판('① 일을 붙잡고 있어도 공정 캘린더가 보인다', ㄱ.날칸 > 0 && ㄱ.캘린더보임 === true,
   '날칸 ' + ㄱ.날칸 + ' · 맨 위 요소 「' + ㄱ.맨위 + '」');
판('① 붙잡은 일은 그대로 살아 있다', ㄱ.붙든일 === true, String(ㄱ.붙든일));
판('② 접힌 자리에 일감 띠가 남는다 (이름 · 공정 · 시간 · 열기)', ㄱ.띠 === true, ㄱ.띠글 || '(없음)');
판('② 띠에 구구절절한 설명이 없다 (한 줄 딱지뿐)', !/습니다|주세요/.test(ㄱ.띠글), '「' + ㄱ.띠글 + '」');
판('② 띠는 장갑 낀 손으로 누를 수 있다 (44px 이상)', ㄱ.띠높이 >= 44, ㄱ.띠높이 + 'px');

await p.screenshot({ path: 그림칸 + '/worktl-375-띠.png' });

// ③ 띠를 누르면 집중 창이 다시 열린다
await 톡('#_집중띠');
const ㄴ = await 본다();
console.log('③ 띠를 누른 뒤             : ' + JSON.stringify(ㄴ));
판('③ 띠를 누르면 집중 창이 다시 열린다', ㄴ.집중판 === true, String(ㄴ.집중판));

// ④ 「접기」 를 누르면 다시 접힌다
await 톡('#_집중접기');
const ㄷ = await 본다();
console.log('④ 접기를 누른 뒤           : ' + JSON.stringify(ㄷ));
판('④ 접으면 집중 창이 걷힌다', ㄷ.집중판 === false, String(ㄷ.집중판));
판('④ 접으면 캘린더가 다시 보인다', ㄷ.캘린더보임 === true, '맨 위 요소 「' + ㄷ.맨위 + '」');
판('④ 접어도 일은 안 끊긴다', ㄷ.붙든일 === true, String(ㄷ.붙든일));

// ⑤ 접어 둔 동안에도 시간은 간다
const 분 = await p.evaluate(() => {
  const 일 = _집중찾기(); 일.rec.startMs = 일.rec.startMs - 7 * 60000;   // 7분 흐른 셈
  if (window._집중일) window._집중일.rec = 일.rec;
  if (typeof window._집중띠그리기 === 'function') window._집중띠그리기();
  const 띠 = document.getElementById('_집중띠');
  return (띠 ? 띠.textContent : '').match(/([\d.]+)\s*분/);
});
console.log('⑤ 7분 흐른 뒤 띠 글        : ' + JSON.stringify(분));
판('⑤ 접어 둔 동안에도 시간이 간다', !!분 && parseFloat(분[1]) >= 6.9, 분 ? 분[1] + '분' : '(못 읽음)');

판('375px 가로 스크롤 없다', (await p.evaluate(() => document.documentElement.scrollWidth)) <= 375, '375px');
판('파이어스토어에 한 줄도 안 썼다', (await p.evaluate(() => window.__쓰기)) === 0,
   (await p.evaluate(() => window.__쓰기)) + '번');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
console.log(실패 === 0 ? 'worktl1   OK' : 'worktl1   FAIL (' + 실패 + ')');
await b.close(); process.exit(실패 === 0 ? 0 : 1);
