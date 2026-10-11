// 「명세서 버튼 로고작업 안하니」 · 「각 버튼에는 **로고만** 표기해 주시고 … 엑셀 pdf 등도
//  각버튼에 누구나 알아 볼 수 있는 해당로고를 … 이카운트 버튼에 커서 도착시
//  「이카운트로 데이터를 보냅니다」 라는 메세지가 팝업되도록」 — 사장님 말씀 (10-11)
// 바닥 단추 셋(PDF·엑셀·이카운트)에 **로고만** 있는가 · 커서가 닿으면 말이 뜨는가 ·
// 누르면 **저절로 발급**되는가 · 48px 인가 · 375px 에서 안 넘치는가 를 잰다.
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
const ctx = await b.newContext({ ...devices['iPhone 12'], viewport: { width: 375, height: 812 },
  isMobile: true, hasTouch: true, acceptDownloads: true });
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
             return { 이름: e.getAttribute('aria-label') || '',
                      // 로고 속 글자는 그림의 일부다 — **단추에 적힌 글**만 센다
                      글: [...e.childNodes].filter(n => n.nodeType === 3)
                            .map(n => (n.textContent || '').trim()).join(''),
                      말: e.getAttribute('data-말') || '',
                      그림: !!svg,
                      그림크기: svg ? Math.round(svg.getBoundingClientRect().width) : 0,
                      바탕: svg ? ((svg.querySelector('rect') || {}).getAttribute
                                   ? svg.querySelector('rect').getAttribute('fill') : '') : '',
                      죽음: !!e.disabled,
                      높: Math.round(r.height), 폭: Math.round(r.width),
                      // 로고가 단추 밖으로 나가지 않는가 (뜨는 말은 일부러 밖에 뜬다 — 안 센다)
                      넘침: svg ? (svg.getBoundingClientRect().right > r.right + 1
                                || svg.getBoundingClientRect().bottom > r.bottom + 1) : true }; }),
           그림쓰임: [...document.querySelectorAll('#명세서판 .명세-바닥 img')].length,
           번호: (document.getElementById('명세-번호') || {}).textContent || '',
           가로: document.documentElement.scrollWidth };
});
const 전 = await 잰것();
console.log('■ 누르기 전: ' + JSON.stringify(전));
판('② 바닥 단추는 **셋**이다 (발급·인쇄·외부보내기는 없앴다)',
   전.수 === 3 && JSON.stringify(전.본것.map(x => x.이름)) === JSON.stringify(['PDF', '엑셀', '이카운트']),
   전.수 + '개 · ' + JSON.stringify(전.본것.map(x => x.이름)));
판('② 셋 다 **로고만** 있다 (단추에 적힌 글이 없다)',
   전.본것.every(x => x.그림 && x.글 === ''), JSON.stringify(전.본것.map(x => x.이름 + ':「' + x.글 + '」')));
판('② 누구나 아는 꼴이다 — 빨강 PDF · 초록 엑셀 · 파랑 이카운트',
   JSON.stringify(전.본것.map(x => x.바탕)) === JSON.stringify(['#d93025', '#107c41', '#1a73c7']),
   JSON.stringify(전.본것.map(x => x.바탕)));
판('② 커서가 닿으면 뜨는 말이 달려 있다 (이카운트는 말씀 그대로)',
   전.본것[2].말 === '이카운트로 데이터를 보냅니다' && 전.본것.every(x => x.말 !== ''),
   JSON.stringify(전.본것.map(x => x.말)));
판('② 단추는 모두 48px 이상이고 안 넘친다',
   전.본것.every(x => x.높 >= 48 && !x.넘침), JSON.stringify(전.본것.map(x => x.폭 + '×' + x.높 + (x.넘침 ? ' 넘침' : ''))));
판('② 셋 다 처음부터 살아 있다 (발급을 먼저 누를 일이 없다)',
   전.본것.every(x => !x.죽음) && 전.번호.trim() === '',
   JSON.stringify(전.본것.map(x => x.죽음)) + ' · 번호 「' + 전.번호.trim() + '」');
판('② 로고는 그림파일이 아니라 이 파일 안에 그린 것이다 (바깥에서 안 받는다)',
   전.그림쓰임 === 0 && 전.본것.every(x => x.그림크기 >= 20 && x.바탕),
   'img ' + 전.그림쓰임 + '개 · svg 크기 ' + JSON.stringify(전.본것.map(x => x.그림크기)));

// 커서를 대면 말이 **창 안에** 다 보여야 한다 — 가장자리 단추가 특히 그렇다
await p.hover('#명세-이카운트'); await p.waitForTimeout(300);
const 뜬말 = await p.evaluate(() => {
  const 단 = document.getElementById('명세-이카운트');
  const 속 = document.querySelector('#명세서판 .명세-속');
  const s = getComputedStyle(단, '::before');
  const r = 단.getBoundingClientRect(), sr = 속.getBoundingClientRect();
  // ::before 의 자리는 못 재니, 글 길이로 폭을 가늠해 오른쪽 끝을 센다
  const 자 = document.createElement('span');
  자.style.cssText = 'position:fixed;visibility:hidden;white-space:nowrap;font-size:' + s.fontSize
    + ';font-weight:' + s.fontWeight + ';padding:' + s.padding;
  자.textContent = 단.getAttribute('data-말'); document.body.appendChild(자);
  const 폭 = 자.getBoundingClientRect().width + 18; 자.remove();
  const 오른끝 = (s.right === 'auto' ? r.left + r.width / 2 + 폭 / 2 : r.right);
  return { 보임: s.opacity, 말폭: Math.round(폭), 오른끝: Math.round(오른끝),
           창오른: Math.round(sr.right), 안에: 오른끝 <= sr.right + 1,
           화면안: 오른끝 <= window.innerWidth + 1 };
});
console.log('■ 뜬 말: ' + JSON.stringify(뜬말));
판('③ 커서를 대면 말이 뜨고, 창 밖으로 안 나간다',
   뜬말.보임 === '1' && 뜬말.안에 === true && 뜬말.화면안 === true, JSON.stringify(뜬말));
if (그림칸()) await p.screenshot({ path: 그림칸() + '/logo-375-명세단추.png' });

// ── 진짜 손가락으로 PDF 를 누르면 **저절로 발급**되고 파일이 내려온다 ──────
const 받은것 = p.waitForEvent('download', { timeout: 8000 }).catch(() => null);
await 짚기('#명세-PDF');
const 파일 = await 받은것;
const 후 = await 잰것();
console.log('■ PDF 를 누른 뒤: ' + JSON.stringify({ 번호: 후.번호, 파일: 파일 ? 파일.suggestedFilename() : null }));
판('③ 누르면 **저절로** 발급번호가 찍힌다 (발급 단추 없이)',
   /\d{8}-재단/.test(후.번호), JSON.stringify(후.번호));
const 낸것 = await p.evaluate(() => window.__명세서낸것 || null);
판('③ 그 자리에서 PDF 파일이 내려온다 (파일명 고르는 통상 기능으로 이어진다)',
   !!파일 && !!낸것 && /^명세서_\d{4}-\d{2}-\d{2}_재단\.pdf$/.test(낸것.이름)
   && 낸것.갈래 === 'application/pdf' && 낸것.크기 > 20000,
   (파일 ? '내려받기 1건 · ' : '안 내려옴 · ') + JSON.stringify(낸것));
판('③ 누른 뒤에도 단추 셋은 그대로 살아 있다',
   후.수 === 3 && 후.본것.every(x => !x.죽음 && x.그림),
   JSON.stringify(후.본것.map(x => x.이름 + (x.죽음 ? '죽음' : '삶'))));

const 끝 = await p.evaluate(() => ({ 쓰기: window.__쓰기, 가로: document.documentElement.scrollWidth }));
판('④ 375px 가로 스크롤 없다', 끝.가로 <= 375, 끝.가로 + 'px');
판('④ 파이어스토어에 한 줄도 안 쓴다', 끝.쓰기 === 0, 끝.쓰기 + '번');
판('④ 로고를 바깥에서 받아 오지 않는다 (그림·글꼴 요청 0)',
   바깥그림.length === 0, 바깥그림.length + '개' + (바깥그림[0] ? ' :: ' + 바깥그림[0] : ''));
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '로고1   OK' : '로고1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
