// 누운 꼴 — 사장님 말씀(10-01) 「현재카드에 (아이소메트릭) 표현이 어렵나?」
// 10-02 에 누울 것이 갈렸다: **가운데 부속판이 눕고, 재단배치도는 반듯하다.**
// 그래도 지킬 것은 그대로다 — 눕혀도 칸이 안 커지고, 조각이 앉은 자리는
// c65b6be 와 한 자도 달라지지 않으며, 크게 띄우는 도면은 반듯하다.
import { 브라우저열기, devices, 서버, 자재, 그림칸 as 그림칸자리 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const 그림칸 = 그림칸자리();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const URL = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const b = await 브라우저열기();
let 실패 = 0; const 판 = (n, t, v) => { if (!t) 실패++; console.log((t ? '  OK  ' : '  FAIL') + '  ' + n + '   → ' + v); };

// c65b6be 에서 잰 그 도면 그대로 — 조각 셋
const 조각들 = [
  { lp: 0,    tp: 0,   wp: 0.3279, hp: 0.6557, bg: '#ffffff', dw: '800', dh: '800' },
  { lp: 0.33, tp: 0,   wp: 0.3279, hp: 0.6557, bg: '#ffffff', dw: '800', dh: '800' },
  { lp: 0.70, tp: 0.1, wp: 0.1967, hp: 0.3278, bg: '#f5f5f4', dw: '480', dh: '400' },
];
// c65b6be 에서 잰 값 (바뀌면 셈이 바뀐 것이다)
const 자리기준 = [[0, 0, 800.1, 800], [805.2, 0, 800.1, 800], [1708, 122, 479.9, 399.9]];

const 차리기 = (조각들) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장', '발주', '도면', '차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.db = {}; window.storage = {};
  window.fbFirestore = { doc: (db, ...a) => ({ p: a.join('/'), id: a[a.length - 1] }),
    updateDoc: async () => {}, setDoc: async () => {}, deleteDoc: async () => {}, addDoc: async () => ({ id: 'x' }),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  const sk = '2026-10-01-재단';
  confirmedOrders.length = 0;
  confirmedOrders.push({ idNum: 1401, docId: 'd1', orderCode: '조혼-20261001-01',
    displayName: '(KRW) 알렉스 800 높은 수납장 올화이트', orderQty: 44, amtTimeline: true,
    partInfoMap: {}, partStarted: {}, partCompletions: {}, deliveryDate: '2026-10-30' });
  const 한장 = { cKey: 'CUT_1', nm: '도어', pm: 8, dq: 44, orderCode: '조혼-20261001-01',
    orderKey: 'd1', orderName: '(KRW) 알렉스 800 높은 수납장 올화이트', plateName: 'PB-18T', coating: '양면',
    finish: '화이트', rw: 800, rd: 800, isCuttingCard: true, sheets: 5, perSheet: 2,
    orderIdNum: 1401, pRowIndex: 11, boardW: 2440, boardH: 1220,
    boardParts: 조각들, coveredOrderIds: [1401] };
  window.__sk = sk; window.__한장 = 한장;
  window._woBoringParts[sk] = [한장];
  window._woBoring[sk] = { pool: [], AMT: ['CUT_1'] };
  const 무대 = document.createElement('div');
  무대.id = '__무대'; 무대.className = 'wo-boring-mac-col';
  무대.style.cssText = 'position:fixed;left:0;top:0;right:0;z-index:99999;background:#f6f7f9;padding:10px;box-sizing:border-box;';
  무대.innerHTML = _woPlacedCardHtml(한장, 'CUT_1', sk, 'AMT', _woGetOrderColorMap(sk), '');
  document.body.appendChild(무대);
};

// 누운 것을 가려내는 자 — 30도 등각이면 matrix 의 a·b 가 cos30·sin30 이다
const 재기 = () => {
  const 카드 = document.querySelector('#__무대 .wo-boring-placed-card');
  const 잼 = svg => {
    if (!svg) return null;
    const 칸 = svg.getBoundingClientRect();
    const 눕힘 = [...svg.querySelectorAll('g')].find(g => /matrix\(/.test(g.getAttribute('transform') || ''));
    const vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
    let 각 = null, 같이누움 = null, 삐짐 = null;
    if (눕힘) {
      const m = /matrix\(\s*([-\d.]+)[ ,]+([-\d.]+)/.exec(눕힘.getAttribute('transform'));
      각 = m ? [Math.round(+m[1] * 1000) / 1000, Math.round(+m[2] * 1000) / 1000] : null;
      같이누움 = 눕힘.querySelectorAll('rect').length === svg.querySelectorAll('rect').length
              && [...눕힘.querySelectorAll('path')].some(e => /url\(#/.test(e.getAttribute('fill') || ''));
      const r = 눕힘.getBoundingClientRect();
      삐짐 = Math.round(Math.max(0, 칸.left - r.left, r.right - 칸.right, 칸.top - r.top, r.bottom - 칸.bottom));
    }
    return {
      누움: !!눕힘, 각, 같이누움, 삐짐,
      그늘: /filter=/.test(svg.innerHTML),
      조각: [...svg.querySelectorAll('rect')].map(e => [
        +(+e.getAttribute('x')).toFixed(1), +(+e.getAttribute('y')).toFixed(1),
        +(+e.getAttribute('width')).toFixed(1), +(+e.getAttribute('height')).toFixed(1)]),
      조각칠: [...svg.querySelectorAll('rect')].map(e => e.getAttribute('fill')),
      조각선: [...svg.querySelectorAll('rect')].map(e => e.getAttribute('stroke') + ' ' + e.getAttribute('stroke-width')),
      폭: Math.round(칸.width), 높이: Math.round(칸.height),
      칸결: Math.round(칸.width / 칸.height * 100) / 100,
      보기결: vb.length === 4 ? Math.round(vb[2] / vb[3] * 100) / 100 : null,
      보기: svg.getAttribute('viewBox') };
  };
  return {
    부속: 잼(카드.querySelector('.woc-부속 svg')),
    배치도: 잼(카드.querySelector('.woc-그림 svg')),
    카드높이: Math.round(카드.getBoundingClientRect().height),
    단추: [...카드.querySelectorAll('button')].map(e => {
      const q = e.getBoundingClientRect(); const af = getComputedStyle(e, '::after');
      return Math.max(Math.round(q.height), parseFloat(af.height) || 0); }),
    문서가로: document.documentElement.scrollWidth };
};

const ctx = await b.newContext({ ...devices['iPhone 12'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
await ctx.route('https://cdn.tailwindcss.com*', r => r.fulfill({ status: 200, contentType: 'application/javascript',
  body: 'document.write(' + JSON.stringify('<style>' + CSS + '</style>') + ');' }));
for (const [무늬, 길] of [['https://cdn.sheetjs.com/**', 'node_modules/xlsx/dist/xlsx.full.min.js'],
                          ['https://cdn.jsdelivr.net/npm/sortablejs**', 'node_modules/sortablejs/Sortable.min.js'],
                          ['https://cdn.jsdelivr.net/npm/gsap**', 'node_modules/gsap/dist/gsap.min.js']])
  await ctx.route(무늬, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: readFileSync(HERE + '/' + 길, 'utf-8') }));
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1300);
await p.evaluate(차리기, 조각들); await p.waitForTimeout(400);
const 본 = await p.evaluate(재기);
console.log('■ 가운데 부속판: ' + JSON.stringify(본.부속));
console.log('■ 오른쪽 배치도: ' + JSON.stringify(본.배치도));

판('① 가운데 부속판이 30도로 눕는다',
   !!본.부속 && 본.부속.누움 === true && Math.abs(본.부속.각[0] - 0.866) < 0.01 && Math.abs(본.부속.각[1] - 0.5) < 0.01,
   본.부속 ? ('matrix ' + JSON.stringify(본.부속.각)) : '칸이 없다');
판('① 격자와 판이 같이 눕는다 (바탕만 반듯하지 않다)', !!본.부속 && 본.부속.같이누움 === true,
   String(본.부속 && 본.부속.같이누움));
판('① 아래로 부드러운 그늘이 진다', !!본.부속 && 본.부속.그늘 === true, String(본.부속 && 본.부속.그늘));
판('① 누우면서 칸 밖으로 안 잘린다', !!본.부속 && 본.부속.삐짐 <= 1, (본.부속 ? 본.부속.삐짐 : '-') + 'px 삐져나감');
판('① 눕혀도 그 칸이 안 커진다 (칸 가로세로비 = 보기칸 가로세로비)',
   !!본.부속 && Math.abs(본.부속.칸결 - 본.부속.보기결) < 0.02,
   본.부속 ? (본.부속.폭 + 'x' + 본.부속.높이 + ' · 결 ' + 본.부속.칸결 + ' / ' + 본.부속.보기결) : '-');

판('② 오른쪽 재단배치도는 반듯하다', !!본.배치도 && 본.배치도.누움 === false,
   String(본.배치도 && 본.배치도.누움));
판('② 조각이 앉은 자리·치수가 c65b6be 와 한 자도 안 다르다',
   !!본.배치도 && JSON.stringify(본.배치도.조각) === JSON.stringify(자리기준),
   JSON.stringify(본.배치도 && 본.배치도.조각));
판('② 조각 바탕칠이 그대로다', !!본.배치도 && 본.배치도.조각칠.join(',') === 조각들.map(q => q.bg).join(','),
   String(본.배치도 && 본.배치도.조각칠.join(',')));
판('② 조각 선이 얇고 또렷한 그대로다', !!본.배치도 && 본.배치도.조각선.every(x => x === '#37352f 1'),
   String(본.배치도 && 본.배치도.조각선.join(' · ')));

// ④ 크게 띄우는 도면은 반듯하다
const 큰것 = await p.evaluate(() => {
  window._집중도면크게(window.__한장);
  const e = document.getElementById('_집중도면큰것');
  const svg = e ? e.querySelector('svg') : null;
  const r = svg ? svg.getBoundingClientRect() : null;
  const 값 = { 떴나: !!svg,
    누움: svg ? [...svg.querySelectorAll('g')].some(g => /matrix\(/.test(g.getAttribute('transform') || '')) : null,
    조각: svg ? [...svg.querySelectorAll('rect')].map(x => [
      +(+x.getAttribute('x')).toFixed(1), +(+x.getAttribute('y')).toFixed(1),
      +(+x.getAttribute('width')).toFixed(1), +(+x.getAttribute('height')).toFixed(1)]) : [],
    폭: r ? Math.round(r.width) : 0 };
  e?.remove();
  return 값;
});
console.log('■ 크게 띄운 도면: ' + JSON.stringify(큰것));
판('④ 크게 띄우는 도면은 반듯하다 (재단 치수를 비뚤지 않게 읽는다)',
   큰것.떴나 === true && 큰것.누움 === false, JSON.stringify(큰것).slice(0, 120));
판('④ 크게 띄운 도면의 조각 자리도 그대로다',
   JSON.stringify(큰것.조각) === JSON.stringify(자리기준), JSON.stringify(큰것.조각));

판('⑤ 단추는 그대로 44px 이상이다', 본.단추.length >= 1 && 본.단추.every(h => h >= 44), JSON.stringify(본.단추) + ' · 카드 ' + 본.카드높이 + 'px');
판('⑤ 375px 가로 넘침 없다', 본.문서가로 <= 375, 본.문서가로 + 'px');

await p.screenshot({ path: 그림칸 + '/iso-375-누운도면.png' });
판('페이지오류 없음', errs.length === 0, String(errs.length));
await b.close();
console.log(실패 === 0 ? 'iso1   OK' : 'iso1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
