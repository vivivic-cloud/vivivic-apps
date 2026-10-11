// 「명세서 버튼 로고작업 안하니」 — 사장님 말씀 (10-11)
// 명세서 단추마다 **로고(그림)** 가 붙었는가 · 닿는 자리는 그대로 44px 인가 ·
// 발급을 누른 뒤에도 로고가 안 지워지는가 · 375px 에서 안 넘치는가 를 잰다.
// 로고는 바깥에서 받지 않는다(CDN 이 막혀 있다) — 파일 안에 그린 그림이어야 한다.
import { 브라우저열기, devices, 서버, 자료, 자재, 그림칸 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const URL = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const O = await 자료('confirmed_orders'); const C = await 자료('cutting_plans'); const L = await 자료('원장');
const b = await 브라우저열기();
let 실패 = 0; const 판 = (n, t, v) => { if (!t) 실패++; console.log((t ? '  OK  ' : '  FAIL') + '  ' + n + '   → ' + v); };
const ctx = await b.newContext({ ...devices['iPhone 12'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
await ctx.route('https://cdn.tailwindcss.com*', r => r.fulfill({ status: 200, contentType: 'application/javascript',
  body: 'document.write(' + JSON.stringify('<style>' + CSS + '</style>') + ');' }));
// 로고를 **그림파일로 바깥에서 받아 오지는 않는가** — 그림·글꼴 요청만 본다
// (이 앱이 늘 받는 꾸러미(xlsx·gsap 등)는 로고와 상관없다).
const 바깥그림 = [];
await ctx.route('**/*', r => { const u = r.request().url(); const t = r.request().resourceType();
  if ((t === 'image' || t === 'font') && !/^http:\/\/127\.0\.0\.1:8899\//.test(u)) 바깥그림.push(u);
  r.continue(); });
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

const 차림 = await p.evaluate(({ O, C, L }) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장', '발주', '도면', '차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.__쓰기 = 0; const 셈 = () => async () => { window.__쓰기++; };
  window.db = {}; window.storage = {};
  window.fbFirestore = { doc: () => ({}), updateDoc: 셈(), setDoc: 셈(), deleteDoc: 셈(), addDoc: 셈(),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  currentFullData.length = 0; L.forEach(r => currentFullData.push(r));
  confirmedOrders.length = 0;
  O.filter(o => o.amtTimeline === true && !o.amtConfirmedCancel).forEach(o => confirmedOrders.push(o));
  window._cuttingPlans = {}; C.forEach(c => { window._cuttingPlans[c.confirmId || c.docId] = c; });
  document.documentElement.removeAttribute('data-amthome');
  document.documentElement.removeAttribute('data-amtstock');
  switchPage('process'); appMode = 'process'; renderProcessTimeline();
  const 날들 = [...new Set([...document.querySelectorAll('[onclick*="tlExpandDateCard"]')]
    .map(e => (e.getAttribute('onclick').match(/tlExpandDateCard\('([^']+)'/) || [])[1]).filter(Boolean))];
  const 고른 = 날들.find(d => { const m = window._tlDcGetItems(d); return m && m['재단'] && m['재단'].items && m['재단'].items.length; });
  if (!고른) return { 못세움: true };
  window.tlExpandDateCard(고른); window.tlDcExpandSection('재단');
  const 카드들 = (window._woBoringParts || {})[고른 + '-재단'] || [];
  카드들.slice(0, 2).forEach(c => {
    const o = confirmedOrders.find(x => (x.docId || String(x.idNum)) === c.orderKey)
           || confirmedOrders.find(x => (c.coveredOrderIds || []).includes(x.idNum));
    if (!o) return;
    const ck = window._woPartKey(c.cKey, o.docId || String(o.idNum), c);
    o.partCompletions = o.partCompletions || {};
    o.partCompletions[ck] = Object.assign({}, o.partCompletions[ck], {
      '재단': { done: true, date: 고른, partName: c.nm || '부속', actualQty: c.dq || 0, actualMinutes: 1 } });
  });
  window.tlDcExpandSection('재단');
  const hdr = document.querySelector('#tl-datecard-expand .tl-dc-single-hdr');
  const 단 = hdr && hdr.querySelector('.명세-단추');
  const r = 단 ? 단.getBoundingClientRect() : null;
  const a = 단 ? getComputedStyle(단, '::after') : null;
  return { 날: 고른,
           머리단추: 단 ? { 그림: 단.querySelectorAll('svg').length, 글: (단.textContent || '').trim(),
                            폭: Math.round(r.width), 닿는높이: parseFloat(a.height) || 0 } : null,
           머리높: hdr ? Math.round(hdr.getBoundingClientRect().height) : 0 };
}, { O, C, L });
console.log('■ 머리줄: ' + JSON.stringify(차림));
if (차림.못세움) { console.log('로고1   FAIL (재단 일감이 있는 날을 못 찾음)'); process.exit(1); }
판('① 머리줄 「명세서」 단추에 로고가 붙었다 (글은 그대로)',
   !!차림.머리단추 && 차림.머리단추.그림 === 1 && 차림.머리단추.글 === '명세서',
   JSON.stringify(차림.머리단추));
판('① 그래도 닿는 자리는 44px 이다',
   !!차림.머리단추 && 차림.머리단추.닿는높이 >= 44 && 차림.머리단추.폭 >= 44,
   차림.머리단추 ? 차림.머리단추.폭 + '×' + 차림.머리단추.닿는높이 : '-');
// 머리줄이 로고 때문에 더 두꺼워지면 안 된다 — 공정명 줄이 한 줄 더 밀린다
판('① 머리줄이 두꺼워지지 않았다 (70px 그대로)', 차림.머리높 <= 70, 차림.머리높 + 'px');

await 짚기('#tl-datecard-expand .tl-dc-single-hdr .명세-단추');
const 잰것 = () => p.evaluate(() => {
  const 단들 = [...document.querySelectorAll('#명세서판 .명세-바닥 button')];
  return { 수: 단들.length,
           본것: 단들.map(e => { const r = e.getBoundingClientRect();
             const svg = e.querySelector('svg');
             return { 글: (e.textContent || '').trim(), 그림: !!svg,
                      그림크기: svg ? Math.round(svg.getBoundingClientRect().width) : 0,
                      바깥것: svg ? /^(https?:)?\/\//.test(svg.getAttribute('src') || '') : false,
                      높: Math.round(r.height), 폭: Math.round(r.width),
                      넘침: e.scrollWidth > e.clientWidth + 1 }; }),
           그림쓰임: [...document.querySelectorAll('#명세서판 .명세-바닥 img')].length,
           가로: document.documentElement.scrollWidth };
});
const 전 = await 잰것();
console.log('■ 발급 전: ' + JSON.stringify(전));
판('② 바닥 단추 다섯에 모두 로고가 붙었다',
   전.수 === 5 && 전.본것.every(x => x.그림), JSON.stringify(전.본것.map(x => x.글 + (x.그림 ? '✓' : '✗'))));
판('② 글자도 그대로다 (발급·인쇄·PDF·엑셀·외부보내기)',
   JSON.stringify(전.본것.map(x => x.글)) === JSON.stringify(['발급', '인쇄', 'PDF', '엑셀', '외부보내기']),
   JSON.stringify(전.본것.map(x => x.글)));
판('② 단추는 모두 44px 이상이고 글이 안 넘친다',
   전.본것.every(x => x.높 >= 44 && !x.넘침), JSON.stringify(전.본것.map(x => x.폭 + '×' + x.높 + (x.넘침 ? ' 넘침' : ''))));
판('② 로고는 그림파일이 아니라 이 파일 안에 그린 것이다 (바깥에서 안 받는다)',
   전.그림쓰임 === 0 && 전.본것.every(x => x.그림크기 >= 12 && !x.바깥것),
   'img ' + 전.그림쓰임 + '개 · svg 크기 ' + JSON.stringify(전.본것.map(x => x.그림크기)));

await 짚기('#명세-발급');
const 후 = await 잰것();
console.log('■ 발급 뒤: ' + JSON.stringify(후));
판('③ 발급을 눌러 「발급됨」 이 되어도 로고가 안 지워진다',
   후.본것[0].글 === '발급됨' && 후.본것[0].그림 === true,
   JSON.stringify(후.본것[0]));
판('③ 나머지 넷도 로고를 그대로 달고 살아난다',
   후.본것.slice(1).every(x => x.그림) && 후.수 === 5,
   JSON.stringify(후.본것.map(x => x.글 + (x.그림 ? '✓' : '✗'))));
if (그림칸()) await p.screenshot({ path: 그림칸() + '/logo-375-명세단추.png' });

const 끝 = await p.evaluate(() => ({ 쓰기: window.__쓰기, 가로: document.documentElement.scrollWidth }));
판('④ 375px 가로 스크롤 없다', 끝.가로 <= 375, 끝.가로 + 'px');
판('④ 파이어스토어에 한 줄도 안 쓴다', 끝.쓰기 === 0, 끝.쓰기 + '번');
판('④ 로고를 바깥에서 받아 오지 않는다 (그림·글꼴 요청 0)',
   바깥그림.length === 0, 바깥그림.length + '개' + (바깥그림[0] ? ' :: ' + 바깥그림[0] : ''));
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '로고1   OK' : '로고1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
