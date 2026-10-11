// 「납기에는 파레트의 큐알코드별 제품 분류가 되어 있어야 합니다. 파레트 큐알이 정해지지
//  않은 제품은 배송출발할 수 없습니다.」 — 사장님 말씀 (10-09 13:20)
// 납기 판에서 ① 제품이 파레트별로 묶여 보이는지 ② 파레트가 안 정해진 제품의
// 「배송출발」 이 **진짜 손가락으로 눌러도** 안 열리는지 ③ 파레트가 정해진 제품은
// 전처럼 그대로 열리는지 ④ 옛 기록(파레트 칸이 없던 발주)이 예전과 똑같이 구는지를 잰다.
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
const 본 = await p.evaluate(({ L, 날 }) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장', '발주', '도면', '차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.__쓰기 = 0; const 셈 = () => async () => { window.__쓰기++; };
  window.db = {}; window.storage = {};
  window.fbFirestore = { doc: () => ({}), updateDoc: 셈(), setDoc: 셈(), deleteDoc: 셈(), addDoc: 셈(),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  currentFullData.length = 0; L.forEach(r => currentFullData.push(r));
  const h = currentFullData[0];
  // 쓸 만한 AMT 부속 줄 둘
  const 줄 = [];
  for (let i = 1; i < currentFullData.length && 줄.length < 2; i++) {
    const r = currentFullData[i]; if (!r) continue;
    if (normalizeValue(r[h.indexOf('공급처')]) !== 'AMT') continue;
    if (!(parseFloat(r[h.indexOf('재단W')]) > 0)) continue;
    줄.push(i);
  }
  if (줄.length < 2) return { 못세움: true };
  const 다됨 = ri => ({ '재단': { done: true, date: 날, partName: currentFullData[ri][h.indexOf('부속명')] || '부속' },
                         '엣지': { done: true, date: 날, partName: currentFullData[ri][h.indexOf('부속명')] || '부속' },
                         'NC':   { done: true, date: 날, partName: currentFullData[ri][h.indexOf('부속명')] || '부속' },
                         '보링': { done: true, date: 날, partName: currentFullData[ri][h.indexOf('부속명')] || '부속' } });
  const 발주 = (idNum, docId, 이름, 코드) => ({
    idNum, docId, orderCode: 코드, displayName: 이름, code: 이름,
    supplier: normalizeValue(currentFullData[줄[0]][h.indexOf('ing발주처')]),
    criteria: IDENTITY_HEADERS.map(c => normalizeValue(currentFullData[줄[0]][h.indexOf(c)])),
    orderQty: 10, amtTimeline: true, batchId: 1791000000010 + idNum, deliveryDate: 날,
    procOverrides: {}, partMoveLog: {},
    partInfoMap: Object.fromEntries(줄.map(ri => ['card-' + idNum + '-' + ri, { qty: 10, isDeleted: false }])),
    partStarted: {},
    partCompletions: Object.fromEntries(줄.map(ri => ['card-' + idNum + '-' + ri, 다됨(ri)])),
  });
  confirmedOrders.length = 0;
  confirmedOrders.push(발주(9601, 'd9601', '시험상품 파레트있음', '시험-파레트-01'));
  confirmedOrders.push(발주(9602, 'd9602', '시험상품 파레트없음', '시험-파레트-02'));
  confirmedOrders.push(발주(9603, 'd9603', '시험상품 옛기록', '시험-파레트-03'));
  // ① 첫 발주에만 파레트를 적어 둔다 — 적힌 것(wo_pallet)에서 온 꼴 그대로
  window._파레트기록 = { d9601: { docId: 'd9601', 고른: { ['card-9601-' + 줄[0] + '|엣지']: 'B' } } };
  window._집중파레트들 = {};
  document.documentElement.removeAttribute('data-amthome');
  document.documentElement.removeAttribute('data-amtstock');
  switchPage('process'); appMode = 'process'; renderProcessTimeline();
  const m = window._tlDcGetItems(날);
  if (!m || !m['납기'] || !m['납기'].items || !m['납기'].items.length) return { 납기없음: true, 있는것: Object.keys(m || {}) };
  window.tlExpandDateCard(날); window.tlDcExpandSection('납기');
  return { 줄, 납기건수: m['납기'].items.length };
}, { L, 날 });
console.log('■ 차림: ' + JSON.stringify(본));
if (본.못세움 || 본.납기없음) { console.log('납기파레트1   FAIL (' + JSON.stringify(본) + ')'); process.exit(1); }
await p.waitForTimeout(500);

const 잰 = await p.evaluate(() => {
  const 묶음 = [...document.querySelectorAll('#tl-datecard-expand .납-파묶음')].map(e => ({
    글: (e.textContent || '').replace(/\s+/g, ' ').trim(),
    파: (e.querySelector('.납-파')?.textContent || '').trim(),
    없나: !!e.querySelector('.납-파.없') }));
  const 카드 = [...document.querySelectorAll('#tl-datecard-expand .tl-dc-full-card')].map(e => {
    const bt = e.querySelector('.tl-dc-btn-delivery');
    const r = bt ? bt.getBoundingClientRect() : null;
    return { 이름: (e.querySelector('.tl-dc-full-name')?.textContent || '').trim(),
             칩: [...e.querySelectorAll('.tl-dc-full-card-name-row .납-파')].map(x => (x.textContent||'').trim()),
             수량: (e.querySelector('.tl-dc-full-qty')?.textContent || '').trim(),
             단추: !!bt, 죽음: bt ? !!bt.disabled : null,
             단추높: r ? Math.round(r.height) : 0, idnum: e.dataset.idnum };
  });
  // 묶음 띠마다 몇 건인지 — 띠 다음부터 다음 띠 전까지
  const 몸 = document.querySelector('#tl-datecard-expand .tl-dc-single-body');
  const 셈 = []; let 지금 = null;
  [...(몸 ? 몸.querySelectorAll('.납-파묶음, .tl-dc-full-card') : [])].forEach(e => {
    if (e.classList.contains('납-파묶음')) { 지금 = { 띠: (e.textContent||'').replace(/\s+/g,' ').trim(), 수: 0 }; 셈.push(지금); }
    else if (지금) 지금.수++;
  });
  return { 묶음, 카드, 셈, 쓰기: window.__쓰기, 문서가로: document.documentElement.scrollWidth };
});
console.log('■ 잰 값: ' + JSON.stringify(잰));

판('① 납기 판이 파레트별로 묶여 보인다 (묶음 둘 — 「B」 와 「파레트 없음」)',
   잰.묶음.length === 2 && 잰.묶음[0].파 === 'B' && 잰.묶음[1].없나 === true,
   JSON.stringify(잰.묶음.map(x => x.글)));
판('① 묶음마다 몇 건인지 적힌다 (B 1건 · 없음 2건)',
   잰.셈.length === 2 && 잰.셈[0].수 === 1 && 잰.셈[1].수 === 2 && /1건/.test(잰.셈[0].띠) && /2건/.test(잰.셈[1].띠),
   JSON.stringify(잰.셈));
const 있음 = 잰.카드.find(c => /파레트있음/.test(c.이름));
const 없음 = 잰.카드.find(c => /파레트없음/.test(c.이름));
const 옛것 = 잰.카드.find(c => /옛기록/.test(c.이름));
판('① 카드 이름줄에 파레트 딱지가 붙는다 (있으면 글자, 없으면 「파레트 없음」)',
   !!있음 && 있음.칩.join('') === 'B' && !!없음 && 없음.칩.join('') === '파레트 없음',
   JSON.stringify({ 있음: 있음 && 있음.칩, 없음: 없음 && 없음.칩 }));
판('② 파레트 없는 제품의 「배송출발」 은 죽어 있다',
   !!없음 && 없음.단추 === true && 없음.죽음 === true, JSON.stringify(없음));
판('③ 파레트 있는 제품의 「배송출발」 은 그대로 살아 있다',
   !!있음 && 있음.단추 === true && 있음.죽음 === false, JSON.stringify(있음));
/* 「배송출발」 단추의 높이는 **예전 그대로**여야 한다 — 이번 일은 묶고 막는 것이지
   단추 모양을 바꾸는 일이 아니다. (그 단추는 10-09 지금 23px 다. 이 집 규칙은
   누르는 자리 44px 이라 모자라지만, 시킨 것이 아니어서 손대지 않고 적어만 둔다.) */
판('③ 단추 모양은 예전 그대로다 (죽이기만 했다 — 높이가 안 바뀌었다)',
   !!있음 && !!없음 && 있음.단추높 === 없음.단추높 && 있음.단추높 > 0,
   '있음 ' + (있음 && 있음.단추높) + 'px · 없음 ' + (없음 && 없음.단추높) + 'px');
판('④ 옛 기록(파레트 칸이 없던 발주)은 「파레트 없음」 으로 가고 카드는 예전 그대로다',
   !!옛것 && 옛것.칩.join('') === '파레트 없음' && /10 EA/.test(옛것.수량) && 옛것.죽음 === true,
   JSON.stringify(옛것));

// ② 진짜 손가락으로 눌러 본다 — 안 열려야 한다
await 짚기(`#tl-datecard-expand .tl-dc-full-card[data-idnum="9602"] .tl-dc-btn-delivery`);
const 눌러본뒤 = await p.evaluate(() => ({
  열림: !!document.querySelector('#tl-datecard-expand .tl-dc-full-card[data-idnum="9602"] .tl-dc-delivery-area')?.hasChildNodes(),
  쓰기: window.__쓰기 }));
판('② 손가락으로 눌러도 배송 창이 안 열린다 · 화베 쓰기 0',
   눌러본뒤.열림 === false && 눌러본뒤.쓰기 === 0, JSON.stringify(눌러본뒤));

// ③ 파레트 있는 제품은 전처럼 열린다
await 짚기(`#tl-datecard-expand .tl-dc-full-card[data-idnum="9601"] .tl-dc-btn-delivery`);
const 열어본뒤 = await p.evaluate(() => ({
  열림: !!document.querySelector('#tl-datecard-expand .tl-dc-full-card[data-idnum="9601"] .tl-dc-delivery-area')?.hasChildNodes(),
  쓰기: window.__쓰기, 문서가로: document.documentElement.scrollWidth }));
판('③ 파레트 있는 제품은 전처럼 배송 창이 열린다 (되던 것이 안 막혔다)',
   열어본뒤.열림 === true, JSON.stringify(열어본뒤));

/* 10-11 사장님: 「배송정보 확인칸에 **이전 작업으로 생성된 파레트의 큐알코드**를
   나타내 주세요」. 납기 판에서 쓰는 그 큐알 글(발주번호-파레트)이 배송 확인 칸에도
   보여야 한다. 파레트가 없는 제품은 창이 안 열리니 「없음」 꼴은 틀로만 둔다. */
const 큐알 = await p.evaluate(() => {
  const 칸 = document.querySelector('#tl-datecard-expand .tl-dc-full-card[data-idnum="9601"] .tl-dc-delivery-card');
  if (!칸) return { 없음: true };
  const 칸상자 = 칸.getBoundingClientRect();
  const 것들 = [...칸.querySelectorAll('.tl-dc-큐알')].map(e => {
    const svg = e.querySelector('svg.큐알');
    const r = svg ? svg.getBoundingClientRect() : null;
    // 그려 놓은 그림에서 **칸판을 되읽는다** — 그린 것이 진짜 큐알인지 시험이 직접 푼다
    let 판 = null;
    if (svg) {
      const 크기 = parseInt(svg.dataset['크기'], 10);
      const p2 = svg.querySelector('path');
      const d = p2 ? (p2.getAttribute('d') || '') : '';
      const 칸들 = Array.from({ length: 크기 }, () => new Array(크기).fill(0));
      (d.match(/M(\d+) (\d+)h1v1h-1z/g) || []).forEach(m => {
        const n = m.match(/M(\d+) (\d+)/);
        칸들[Number(n[2]) - 4][Number(n[1]) - 4] = 1;
      });
      판 = { 크기, 칸: 칸들 };
    }
    return { 글: (e.querySelector('.tl-dc-큐알글')?.textContent || '').trim(),
             그림: !!svg, 폭: r ? Math.round(r.width) : 0,
             넘침: r ? (r.right > 칸상자.right + 1) : true, 판 };
  });
  const o = confirmedOrders.find(x => x.idNum === 9601);
  return { 제목: [...칸.querySelectorAll('.tl-dc-delivery-parts-title')].map(e => (e.textContent || '').trim()),
           것들, 다른줄: [...칸.querySelectorAll('.tl-dc-delivery-info-row')]
             .map(e => (e.querySelector('.tl-dc-delivery-info-label')?.textContent || '').trim()),
           메모있나: !!칸.querySelector('.tl-dc-delivery-memo'),
           단추: [...칸.querySelectorAll('.tl-dc-delivery-btn-row button')].map(e => (e.textContent || '').trim()),
           바란것: (window._제품파레트들(o) || []).map(파 => window._제품큐알글(o, 파)) };
});
console.log('■ 배송 정보 확인칸의 큐알: ' + JSON.stringify(
  { 제목: 큐알.제목, 것들: (큐알.것들 || []).map(x => ({ 글: x.글, 폭: x.폭, 넘침: x.넘침 })), 바란것: 큐알.바란것 }));
if (그림칸()) {
  await p.evaluate(() => document.querySelector('#tl-datecard-expand .tl-dc-full-card[data-idnum="9601"] .tl-dc-delivery-card')
    ?.scrollIntoView({ block: 'center' }));
  await p.waitForTimeout(250);
  await p.screenshot({ path: 그림칸() + '/dlv-375-큐알줄.png' });
}
판('④ 배송 정보 확인칸에 파레트 큐알이 **그림으로** 선다',
   !큐알.없음 && 큐알.제목.includes('📱 파레트 큐알')
   && 큐알.것들.length === 1 && (큐알.것들[0] || {}).그림 === true && (큐알.것들[0] || {}).폭 >= 80,
   JSON.stringify(큐알.제목) + ' · ' + JSON.stringify((큐알.것들 || []).map(x => x.폭 + 'px')));
판('④ 큐알 밑에 그 글자가 적힌다 (이전 작업에서 만든 그 글 그대로)',
   !큐알.없음 && (큐알.것들[0] || {}).글 === '시험-파레트-01-B'
   && JSON.stringify(큐알.것들.map(x => x.글)) === JSON.stringify(큐알.바란것),
   JSON.stringify(큐알.것들.map(x => x.글)) + ' · 납기 판과 같은 글 ' + JSON.stringify(큐알.바란것));
판('④ 큐알이 칸 밖으로 안 나간다 (여럿이면 줄을 바꾼다)',
   !큐알.없음 && 큐알.것들.every(x => !x.넘침), JSON.stringify(큐알.것들.map(x => x.넘침)));
판('④ 배송 정보 확인칸의 나머지는 그대로다 (메모·취소·배송 확정·다른 줄)',
   !큐알.없음 && 큐알.메모있나 === true
   && JSON.stringify(큐알.단추) === JSON.stringify(['취소', '✅ 배송 확정'])
   && JSON.stringify(큐알.다른줄) === JSON.stringify(['오더코드', '상품명', '수량', '납기일', '공급처']),
   JSON.stringify(큐알.다른줄) + ' · ' + JSON.stringify(큐알.단추));

/* ⑤ 그린 큐알을 **읽어** 본다 — 「그렸다」 가 아니라 **읽힌다**까지가 한 벌이다.
   읽는 연장(jsqr)은 시험 쪽에서만 쓴다. 앱은 큐알 셈을 제 안에 갖고 있다. */
const 읽개칸 = path.join(HERE, '큐알읽개');
const jsqr길 = path.join(읽개칸, 'node_modules/jsqr/dist/jsQR.js');
if (!existsSync(jsqr길)) {
  mkdirSync(읽개칸, { recursive: true });
  writeFileSync(path.join(읽개칸, 'package.json'),
    JSON.stringify({ name: 'amt-큐알읽개', private: true, version: '0.0.0' }, null, 2) + '\n');
  spawnSync('npm', ['install', '--no-audit', '--no-fund', 'jsqr'], { cwd: 읽개칸, stdio: 'inherit' });
}
let 읽힌 = '(연장 없음)';
if (existsSync(jsqr길) && 큐알.것들 && 큐알.것들[0] && 큐알.것들[0].판) {
  const { default: jsQR } = await import('file://' + jsqr길);
  const q = 큐알.것들[0].판, 배 = 10, 여백 = 4, px = (q.크기 + 여백 * 2) * 배;
  const 점 = new Uint8ClampedArray(px * px * 4).fill(255);
  for (let r = 0; r < q.크기; r++) for (let c = 0; c < q.크기; c++) if (q.칸[r][c])
    for (let y = 0; y < 배; y++) for (let x = 0; x < 배; x++) {
      const Y = (r + 여백) * 배 + y, X = (c + 여백) * 배 + x, i = (Y * px + X) * 4;
      점[i] = 점[i + 1] = 점[i + 2] = 0;
    }
  const 나온것 = jsQR(점, px, px);
  읽힌 = 나온것 ? 나온것.data : '(못 읽음)';
}
판('⑤ 그 큐알이 **진짜로 읽힌다** (jsqr 로 읽어 글자를 견준다)',
   읽힌 === '시험-파레트-01-B', '읽힌 글 「' + 읽힌 + '」');
/* ⑥ 파레트가 하나도 없으면 **칸을 아예 안 만든다** — 빈 네모나 「없음」 을 지어 넣지 않는다. */
const 없을때 = await p.evaluate(() => {
  const o = confirmedOrders.find(x => x.idNum === 9602);
  const area = document.querySelector('#tl-datecard-expand .tl-dc-full-card[data-idnum="9602"] .tl-dc-delivery-area');
  return { 파레트: (window._제품파레트들(o) || []).length, 글: area ? area.innerHTML : '' };
});
console.log('■ 파레트 없는 제품: ' + JSON.stringify({ 파레트: 없을때.파레트, 창길이: (없을때.글 || '').length }));
판('⑥ 파레트가 없으면 큐알 칸을 아예 안 만든다 (빈 네모를 짓지 않는다)',
   없을때.파레트 === 0 && !/파레트 큐알/.test(없을때.글 || ''),
   '파레트 ' + 없을때.파레트 + '개 · 창에 큐알 칸 ' + (/파레트 큐알/.test(없을때.글 || '') ? '있음' : '없음'));
if (그림칸()) {
  await p.evaluate(() => document.querySelector('#tl-datecard-expand .tl-dc-full-card[data-idnum="9602"]')
    ?.scrollIntoView({ block: 'center' }));
  await p.waitForTimeout(250);
  await p.screenshot({ path: 그림칸() + '/dlv-375-큐알없음.png' });
}
판('⑤ 파이어스토어에 한 줄도 안 쓴다 (보기만 했다)', 열어본뒤.쓰기 === 0, 열어본뒤.쓰기 + '번');
판('⑤ 375px 가로 스크롤 없다', 열어본뒤.문서가로 <= 375, 열어본뒤.문서가로 + 'px');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '납기파레트1   OK' : '납기파레트1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
