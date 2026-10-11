// 「배송정보 큐알코드아래 현재의 부속목록에 해당하는 목록이 큐알에 맞게 나타나도록 해줘
//  - 만약 엣지파레트 큐알과 보링파레트 큐알간 혼선이 있다면 보링큐알이 우선으로 하여
//  표기해줘 즉 각 큐알에 해당하는 목록이 큐알 아래에 나타나면 되고 배송시 상대업체의
//  큐알 스캔시 혼돈이 일어나지 않도록 모바일화면에서 큐알이 명확히 분리되어 나타나도록
//  해줘- 한배송정보에 두개이상의 큐알이 있을때 ) 모바일 화면에서 현재 큐알 사이즈가
//  너무 작으니 현재 사이즈의 3배 가량 키워줘」  — 사장님 말씀 (10-11)
// 큐알 둘인 제품을 심어 ① 큐알마다 **제 부속만** 달리는지 ② 엣지와 보링이 엇갈리면
// **보링이 이기는지** ③ 큐알이 위아래로 **따로 선 네모**로 갈라지는지 ④ 큐알이
// 세 배(276px)로 커졌는지 ⑤ 그래도 375px 에서 안 넘치고 **읽히는지** 를 잰다.
import { 브라우저열기, devices, 서버, 자료, 자재, 그림칸 } from './도구/터.mjs';
await 서버();
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
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
  await p.waitForTimeout(500); return true;
};

const 날 = '2026-10-21';
const 차림 = await p.evaluate(({ L, 날 }) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장', '발주', '도면', '차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.__쓰기 = 0; const 셈 = () => async () => { window.__쓰기++; };
  window.db = {}; window.storage = {};
  window.fbFirestore = { doc: () => ({}), updateDoc: 셈(), setDoc: 셈(), deleteDoc: 셈(), addDoc: 셈(),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  currentFullData.length = 0; L.forEach(r => currentFullData.push(r));
  const h = currentFullData[0];
  // 쓸 만한 AMT 부속 줄 셋
  const 줄 = [];
  for (let i = 1; i < currentFullData.length && 줄.length < 3; i++) {
    const r = currentFullData[i]; if (!r) continue;
    if (normalizeValue(r[h.indexOf('공급처')]) !== 'AMT') continue;
    if (!(parseFloat(r[h.indexOf('재단W')]) > 0)) continue;
    줄.push(i);
  }
  if (줄.length < 3) return { 못세움: true };
  const 이름 = ri => currentFullData[ri][h.indexOf('부속명')] || '부속';
  const 다됨 = ri => ({ '재단': { done: true, date: 날, partName: 이름(ri) },
                         '엣지': { done: true, date: 날, partName: 이름(ri) },
                         'NC':   { done: true, date: 날, partName: 이름(ri) },
                         '보링': { done: true, date: 날, partName: 이름(ri) } });
  confirmedOrders.length = 0;
  confirmedOrders.push({
    idNum: 9701, docId: 'd9701', orderCode: '시험-큐알-01', displayName: '시험상품 큐알둘',
    code: '시험상품 큐알둘',
    supplier: normalizeValue(currentFullData[줄[0]][h.indexOf('ing발주처')]),
    criteria: IDENTITY_HEADERS.map(c => normalizeValue(currentFullData[줄[0]][h.indexOf(c)])),
    orderQty: 10, amtTimeline: true, batchId: 1791000009701, deliveryDate: 날,
    procOverrides: {}, partMoveLog: {},
    partInfoMap: Object.fromEntries(줄.map(ri => ['card-9701-' + ri, { qty: 10, isDeleted: false }])),
    partStarted: {},
    partCompletions: Object.fromEntries(줄.map(ri => ['card-9701-' + ri, 다됨(ri)])),
  });
  /* 심는 꼴
       줄0 … 엣지 A · 보링 B   → **엇갈린다. 보링이 이겨 B.**
       줄1 … 엣지 A            → A
       줄2 … 아무 데도 안 실림  → 어느 큐알에도 안 붙는다 */
  window._파레트기록 = { d9701: { docId: 'd9701', 고른: {
    ['card-9701-' + 줄[0] + '|엣지']: 'A',
    ['card-9701-' + 줄[0] + '|보링']: 'B',
    ['card-9701-' + 줄[1] + '|엣지']: 'A' } } };
  window._집중파레트들 = {};
  document.documentElement.removeAttribute('data-amthome');
  document.documentElement.removeAttribute('data-amtstock');
  switchPage('process'); appMode = 'process'; renderProcessTimeline();
  const m = window._tlDcGetItems(날);
  if (!m || !m['납기'] || !m['납기'].items || !m['납기'].items.length) return { 납기없음: true };
  window.tlExpandDateCard(날); window.tlDcExpandSection('납기');
  return { 줄, 이름들: 줄.map(이름), 파들: window._제품파레트들(confirmedOrders[0]) };
}, { L, 날 });
console.log('■ 차림: ' + JSON.stringify(차림));
if (차림.못세움 || 차림.납기없음) { console.log('큐알목록1   FAIL (' + JSON.stringify(차림) + ')'); process.exit(1); }
await p.waitForTimeout(450);
판('⓪ 이 제품에 큐알이 둘 잡힌다 (A · B)',
   JSON.stringify(차림.파들) === JSON.stringify(['A', 'B']), JSON.stringify(차림.파들));

await 짚기('#tl-datecard-expand .tl-dc-full-card[data-idnum="9701"] .tl-dc-btn-delivery');
const 본 = await p.evaluate(() => {
  const 칸 = document.querySelector('#tl-datecard-expand .tl-dc-full-card[data-idnum="9701"] .tl-dc-delivery-card');
  if (!칸) return { 안열림: true };
  const 칸상자 = 칸.getBoundingClientRect();
  const 묶음 = [...칸.querySelectorAll('.tl-dc-큐알묶음')].map(e => {
    const svg = e.querySelector('svg.큐알');
    const r = svg ? svg.getBoundingClientRect() : null;
    let 판 = null;
    if (svg) {
      const 크기 = parseInt(svg.dataset['크기'], 10);
      const pa = svg.querySelector('path');
      const d = pa ? (pa.getAttribute('d') || '') : '';
      const 칸들 = Array.from({ length: 크기 }, () => new Array(크기).fill(0));
      (d.match(/M(\d+) (\d+)h1v1h-1z/g) || []).forEach(m => {
        const n = m.match(/M(\d+) (\d+)/);
        칸들[Number(n[2]) - 4][Number(n[1]) - 4] = 1;
      });
      판 = { 크기, 칸: 칸들 };
    }
    const 상자 = e.getBoundingClientRect();
    const 단 = e.querySelector('.tl-dc-큐알명세');
    const 단상자 = 단 ? 단.getBoundingClientRect() : null;
    return { 파: e.dataset['파'],
             단추: !!단, 단추글: 단 ? (단.textContent || '').trim() : '',
             단추높: 단상자 ? Math.round(단상자.height) : 0,
             단추폭: 단상자 ? Math.round(단상자.width) : 0,
             글: (e.querySelector('.tl-dc-큐알글')?.textContent || '').trim(),
             큐알폭: r ? Math.round(r.width) : 0,
             부속: [...e.querySelectorAll('.tl-dc-큐알부속 .tl-dc-part-row')]
                     .map(x => (x.querySelector('.tl-dc-part-name')?.textContent || '').trim()),
             몫: [...e.querySelectorAll('.tl-dc-큐알부속 .tl-dc-part-qty')].map(x => (x.textContent || '').trim()),
             위: Math.round(상자.top), 아래: Math.round(상자.bottom),
             테두리: getComputedStyle(e).borderTopWidth,
             넘침: 상자.right > 칸상자.right + 1 || (r ? r.right > 칸상자.right + 1 : true), 판 };
  });
  return { 묶음,
           남은부속: [...칸.querySelectorAll('.tl-dc-delivery-parts-title')]
             .map(e => (e.textContent || '').trim()),
           바깥목록: [...칸.querySelectorAll(':scope > div > .tl-dc-part-row')]
             .map(x => (x.querySelector('.tl-dc-part-name')?.textContent || '').trim()),
           메모있나: !!칸.querySelector('.tl-dc-delivery-memo'),
           단추: [...칸.querySelectorAll('.tl-dc-delivery-btn-row button')].map(e => (e.textContent || '').trim()),
           가로: document.documentElement.scrollWidth, 쓰기: window.__쓰기 };
});
console.log('■ 배송 칸: ' + JSON.stringify({ 묶음: (본.묶음 || []).map(x =>
  ({ 파: x.파, 글: x.글, 큐알폭: x.큐알폭, 부속: x.부속, 몫: x.몫, 위: x.위, 아래: x.아래, 넘침: x.넘침 })),
  제목: 본.남은부속, 바깥목록: 본.바깥목록 }));
판('① 큐알이 둘, 저마다 따로 선 네모다', !본.안열림 && 본.묶음.length === 2
   && 본.묶음.every(x => parseFloat(x.테두리) >= 2),
   (본.묶음 || []).length + '묶음 · 테두리 ' + JSON.stringify((본.묶음 || []).map(x => x.테두리)));
판('① 큐알이 위아래로 갈라진다 (찍을 때 섞이지 않게)',
   본.묶음.length === 2 && 본.묶음[1].위 >= 본.묶음[0].아래,
   JSON.stringify((본.묶음 || []).map(x => x.파 + ':' + x.위 + '~' + x.아래)));
판('② 큐알이 세 배로 커졌다 (92 → 276px)',
   본.묶음.every(x => x.큐알폭 >= 260), JSON.stringify((본.묶음 || []).map(x => x.큐알폭 + 'px')));
판('② 그래도 375px 에서 안 넘친다',
   본.묶음.every(x => !x.넘침) && 본.가로 <= 375, '넘침 ' + JSON.stringify((본.묶음 || []).map(x => x.넘침)) + ' · 문서 ' + 본.가로 + 'px');

const A = (본.묶음 || []).find(x => x.파 === 'A') || {};
const B = (본.묶음 || []).find(x => x.파 === 'B') || {};
판('③ 큐알마다 **그 큐알의 부속만** 달린다',
   JSON.stringify(A.부속) === JSON.stringify([차림.이름들[1]])
   && JSON.stringify(B.부속) === JSON.stringify([차림.이름들[0]]),
   'A ' + JSON.stringify(A.부속) + ' · B ' + JSON.stringify(B.부속)
   + ' · 바란 것 A[' + 차림.이름들[1] + '] B[' + 차림.이름들[0] + ']');
판('③ **엣지와 보링이 엇갈리면 보링이 이긴다** (줄0 은 엣지 A · 보링 B → B)',
   (B.부속 || []).includes(차림.이름들[0]) && !(A.부속 || []).includes(차림.이름들[0]),
   '줄0 「' + 차림.이름들[0] + '」 이 간 곳 — B ' + ((B.부속 || []).includes(차림.이름들[0]) ? 'O' : 'X')
   + ' · A ' + ((A.부속 || []).includes(차림.이름들[0]) ? 'O' : 'X'));
판('③ 수량도 큐알 밑에 그대로 적힌다',
   (A.몫 || []).every(v => /^\d+EA$/.test(v)) && (B.몫 || []).every(v => /^\d+EA$/.test(v))
   && (A.몫 || []).length === 1 && (B.몫 || []).length === 1,
   'A ' + JSON.stringify(A.몫) + ' · B ' + JSON.stringify(B.몫));
판('④ 어느 큐알에도 안 실린 부속은 「📦 부속 목록」 에 그대로 남는다',
   본.남은부속.some(t => /부속 목록/.test(t)) && 본.바깥목록.includes(차림.이름들[2])
   && !본.바깥목록.includes(차림.이름들[0]) && !본.바깥목록.includes(차림.이름들[1]),
   JSON.stringify(본.바깥목록) + ' · 바란 것 [' + 차림.이름들[2] + ']');
판('④ 배송 칸의 나머지는 그대로다 (메모 · 취소 · 배송 확정)',
   본.메모있나 === true && JSON.stringify(본.단추) === JSON.stringify(['취소', '✅ 배송 확정']),
   JSON.stringify(본.단추));

/* 10-11 사장님: 「파레트별 큐알쪽에도 **각 큐알의 납기 명세**가 나타나게 해줘야겠어」.
   큐알 네모마다 그 큐알 하나치 명세서를 여는 단추를 둔다. 장갑 낀 손이라 44px 이다. */
판('⑤ 큐알마다 「명세서」 단추가 있다 (44px)',
   본.묶음.length === 2 && 본.묶음.every(x => x.단추 && x.단추글 === '명세서'
     && x.단추높 >= 44 && x.단추폭 >= 44),
   JSON.stringify((본.묶음 || []).map(x => x.파 + ':' + x.단추글 + ' ' + x.단추폭 + '×' + x.단추높)));
// 진짜 손가락으로 B 큐알의 단추를 누른다 — **그 파레트치만** 펴져야 한다
const 눌러본 = await (async () => {
  const 자리 = await p.evaluate(() => {
    const 네모 = [...document.querySelectorAll('#tl-datecard-expand .tl-dc-큐알묶음')]
      .find(e => e.dataset['파'] === 'B');
    const 단 = 네모 && 네모.querySelector('.tl-dc-큐알명세'); if (!단) return null;
    단.scrollIntoView({ block: 'center' });
    const r = 단.getBoundingClientRect();
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
  });
  if (!자리) return { 못누름: true };
  await 손('touchStart', 자리.x, 자리.y); await p.waitForTimeout(60); await 손('touchEnd', 0, 0);
  await p.waitForTimeout(500);
  return await p.evaluate(() => {
    const 판 = document.getElementById('명세서판'); if (!판) return { 안열림: true };
    const 표 = 판.querySelector('.명세-표');
    const 줄 = 표 ? [...표.querySelectorAll('tr')].slice(2).filter(tr => !tr.classList.contains('합')) : [];
    return { 제목: (판.querySelector('.명세-제목')?.textContent || '').replace(/\s+/g, ' ').trim(),
             파: window._명세서지금.파, 줄수: 줄.length,
             파값: 줄.map(tr => [...tr.children].map(e => (e.textContent || '').trim())
               .find(v => /^[ABCD]$|^없음$/.test(v)) || '').filter(Boolean),
             종이줄: (window._명세서줄들() || { 줄들: [] }).줄들.length };
  });
})();
console.log('■ B 큐알의 명세서 단추를 눌러: ' + JSON.stringify(눌러본));
판('⑤ 그 단추를 손가락으로 누르면 **그 큐알치만** 펴진다',
   !눌러본.못누름 && !눌러본.안열림 && 눌러본.파 === 'B'
   // 머리에는 **찍은 큐알 글 그대로**가 적힌다 (발주번호-파레트) — 10-11 지시
   && /납기 내역 · 시험-큐알-01-B$/.test(눌러본.제목 || '')
   && 눌러본.줄수 === 1 && JSON.stringify(눌러본.파값) === JSON.stringify(['B'])
   && 눌러본.종이줄 === 1,
   JSON.stringify(눌러본));
if (그림칸()) {
  /* 큐알 네모의 **부속 목록**과 그 큐알의 **명세서**가 한 화면에 같이 보여야 한다 —
     둘이 같은 말을 하는지 눈으로 바로 견주시게. 창은 고정이라 뒤쪽만 민다. */
  await p.evaluate(() => {
    const 네모 = [...document.querySelectorAll('#tl-datecard-expand .tl-dc-큐알묶음')]
      .find(e => e.dataset['파'] === 'B');
    const 줄 = 네모 && 네모.querySelector('.tl-dc-큐알부속');
    if (줄) 줄.scrollIntoView({ block: 'end' });   // 창 아래쪽에 오게 — 창이 가운데를 덮는다
  });
  await p.waitForTimeout(300);
  await p.screenshot({ path: 그림칸() + '/scan-375-큐알한치.png' });
}

/* ⑤ 두 큐알을 **다 읽어** 본다 — 키웠다고 못 읽히면 안 된다 */
const 읽개칸 = path.join(HERE, '큐알읽개');
const jsqr길 = path.join(읽개칸, 'node_modules/jsqr/dist/jsQR.js');
if (!existsSync(jsqr길)) {
  mkdirSync(읽개칸, { recursive: true });
  writeFileSync(path.join(읽개칸, 'package.json'),
    JSON.stringify({ name: 'amt-큐알읽개', private: true, version: '0.0.0' }, null, 2) + '\n');
  spawnSync('npm', ['install', '--no-audit', '--no-fund', 'jsqr'], { cwd: 읽개칸, stdio: 'inherit' });
}
const 읽힌것 = [];
if (existsSync(jsqr길)) {
  const { default: jsQR } = await import('file://' + jsqr길);
  for (const 묶 of (본.묶음 || [])) {
    if (!묶.판) { 읽힌것.push('(그림 없음)'); continue; }
    const q = 묶.판, 배 = 10, 여백 = 4, px = (q.크기 + 여백 * 2) * 배;
    const 점 = new Uint8ClampedArray(px * px * 4).fill(255);
    for (let r = 0; r < q.크기; r++) for (let c = 0; c < q.크기; c++) if (q.칸[r][c])
      for (let y = 0; y < 배; y++) for (let x = 0; x < 배; x++) {
        const Y = (r + 여백) * 배 + y, X = (c + 여백) * 배 + x, i = (Y * px + X) * 4;
        점[i] = 점[i + 1] = 점[i + 2] = 0;
      }
    const 나온것 = jsQR(점, px, px);
    읽힌것.push(나온것 ? 나온것.data : '(못 읽음)');
  }
}
console.log('■ 읽은 큐알: ' + JSON.stringify(읽힌것));
판('⑤ 두 큐알이 다 **진짜로 읽히고**, 큐알 밑 글과 같다',
   읽힌것.length === 2 && JSON.stringify(읽힌것) === JSON.stringify(['시험-큐알-01-A', '시험-큐알-01-B'])
   && JSON.stringify(읽힌것) === JSON.stringify((본.묶음 || []).map(x => x.글)),
   JSON.stringify(읽힌것));

if (그림칸()) {
  await p.evaluate(() => document.querySelector('.tl-dc-큐알칸')?.scrollIntoView({ block: 'start' }));
  await p.waitForTimeout(250);
  await p.screenshot({ path: 그림칸() + '/dlv-375-큐알둘.png' });
}
판('⑥ 파이어스토어에 한 줄도 안 쓴다 (보기만 했다)', 본.쓰기 === 0, 본.쓰기 + '번');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '큐알목록1   OK' : '큐알목록1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
