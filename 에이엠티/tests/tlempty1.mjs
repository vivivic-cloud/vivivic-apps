// 공정 일정 타임라인 — 일이 잠깐 비었다가 다시 생기면 캘린더가 돌아와야 한다.
// 사장님 지시(09-24 05:55): 「아니 공정 캘린더가 안떠요」
//   짚으신 글자에 「발주서 탭에서 항목을 선택 후」 가 들어 있었다 — 빈 상태 안내문이다.
// 까닭: 그 안내문으로 타임라인 자리를 통째로 덮으면서 TL.renderedDates 를 안 비웠다.
//   그러면 일이 다시 생겨도 TL 이 '이미 그렸다' 고 여겨 refreshCards 만 돌고,
//   방금 지운 자리에는 고칠 카드가 없어 안내문이 그대로 남는다(새로 켜기 전까지).
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

await p.evaluate((O) => {
  const ov = document.getElementById('auth-login-overlay'); if (ov) ov.style.display = 'none';
  ['원장','발주','도면','차례'].forEach(k => window._자료왔다 && window._자료왔다(k));   // 자료는 다 온 셈
  window.__쓰기 = 0; const 셈 = () => async () => { window.__쓰기++; };
  window.db = {}; window.fbFirestore = { doc: () => ({}), updateDoc: 셈(), setDoc: 셈(), deleteDoc: 셈(), addDoc: 셈(),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  confirmedOrders.length = 0;
  O.filter(o => o.amtTimeline === true && !o.amtConfirmedCancel).forEach(o => confirmedOrders.push(o));
  document.documentElement.removeAttribute('data-amthome');
  document.documentElement.removeAttribute('data-amtstock');
  if (typeof switchPage === 'function') switchPage('process');
  appMode = 'process';
  renderProcessTimeline();
}, O);
await p.waitForTimeout(600);

const 본다 = () => p.evaluate(() => {
  const c = document.getElementById('process-timeline-container');
  const 글 = (c && c.textContent || '').replace(/\s+/g, ' ').trim();
  return {
    발주수: confirmedOrders.length,
    거른수: confirmedOrders.filter(o => o.amtTimeline === true && !o.amtConfirmedCancel).length,
    TL그린날: (typeof TL !== 'undefined' && Array.isArray(TL.renderedDates)) ? TL.renderedDates.length : null,
    날칸: c ? c.querySelectorAll('[data-tl-date]').length : 0,
    빈안내: /발주서 탭에서 항목을 선택 후/.test(글),
    글: 글.slice(0, 50),
  };
});

const 처음 = await 본다();
console.log('① 일이 있을 때      : ' + JSON.stringify(처음));
판('① 일이 있으면 캘린더가 그려진다', 처음.거른수 > 0 && 처음.날칸 > 0 && 처음.빈안내 === false,
   '발주 ' + 처음.거른수 + '건 · 날칸 ' + 처음.날칸 + '개');

// 일이 잠깐 비는 일 — 발주가 지워졌다가 다시 오거나, 소식이 늦게 오는 사이에 생긴다
const 빈뒤 = await p.evaluate(() => {
  window.__담아둠 = confirmedOrders.slice();
  confirmedOrders.length = 0;
  renderProcessTimeline();
  const c = document.getElementById('process-timeline-container');
  return { 날칸: c.querySelectorAll('[data-tl-date]').length,
           빈안내: /발주서 탭에서 항목을 선택 후/.test(c.textContent || ''),
           TL그린날: (typeof TL !== 'undefined' && Array.isArray(TL.renderedDates)) ? TL.renderedDates.length : null };
});
console.log('② 일이 잠깐 비면    : ' + JSON.stringify(빈뒤));
판('② 일이 없으면 안내문이 뜬다', 빈뒤.빈안내 === true && 빈뒤.날칸 === 0, JSON.stringify(빈뒤));
판('② 안내문으로 덮을 때 TL 이 그린 날을 비운다 (다시 그릴 수 있게)',
   빈뒤.TL그린날 === 0, 'TL 그린 날 ' + 빈뒤.TL그린날);

const 되돌린뒤 = await p.evaluate(() => {
  window.__담아둠.forEach(o => confirmedOrders.push(o));
  renderProcessTimeline();
  const c = document.getElementById('process-timeline-container');
  const 글 = (c.textContent || '').replace(/\s+/g, ' ').trim();
  return { 발주수: confirmedOrders.length, 날칸: c.querySelectorAll('[data-tl-date]').length,
           빈안내: /발주서 탭에서 항목을 선택 후/.test(글),
           TL그린날: (typeof TL !== 'undefined' && Array.isArray(TL.renderedDates)) ? TL.renderedDates.length : null,
           글: 글.slice(0, 50) };
});
console.log('③ 일이 다시 생기면  : ' + JSON.stringify(되돌린뒤));
판('③ 일이 다시 생기면 캘린더가 돌아온다 (새로 켜지 않아도)',
   되돌린뒤.날칸 > 0 && 되돌린뒤.빈안내 === false && 되돌린뒤.TL그린날 > 0,
   '날칸 ' + 되돌린뒤.날칸 + '개 · TL 그린 날 ' + 되돌린뒤.TL그린날 + ' · 「' + 되돌린뒤.글 + '」');
판('③ 돌아온 캘린더에 안내문이 안 남는다', 되돌린뒤.빈안내 === false, String(되돌린뒤.빈안내));

await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300);
await p.screenshot({ path: 그림칸 + '/tl-375-캘린더.png' });

판('375px 가로 스크롤 없다', (await p.evaluate(() => document.documentElement.scrollWidth)) <= 375, '375px');
판('파이어스토어에 한 줄도 안 썼다', (await p.evaluate(() => window.__쓰기)) === 0,
   (await p.evaluate(() => window.__쓰기)) + '번');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
console.log(실패 === 0 ? 'tlempty1   OK' : 'tlempty1   FAIL (' + 실패 + ')');
await b.close(); process.exit(실패 === 0 ? 0 : 1);
