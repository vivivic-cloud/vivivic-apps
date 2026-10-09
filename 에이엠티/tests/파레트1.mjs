// 「작업 타이머 팝업에 파레트 A,B,C,D 버튼을 만들어 이중 하나를 선택해야 완료를 누를 수
//  있게 해주세요. 이렇게 선택된 파레트는 발주번호+선택된파레트 ABCD의 조합으로 고유한
//  큐알코드가 나타나야 합니다.」 — 사장님 말씀 (10-08 09:08)
// 네 단추가 서는지 · 고르기 전에는 완료가 막히는지 · 고르면 큐알이 뜨는지 ·
// 그 큐알이 **진짜로 읽히는지**(jsqr 로 읽어 글자를 견준다) 를 잰다.
// 큐알 셈은 앱 안에 있다(바깥 CDN 을 못 쓴다). jsqr 은 시험 쪽에서만 쓴다.
import { 브라우저열기, devices, 서버, 자료, 자재, 시험칸 } from './도구/터.mjs';
await 서버();
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const HERE = await 자재();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
/* 큐알을 **읽어서** 맞는지 보려면 읽는 연장이 하나 있어야 한다 — 없으면 받아 둔다(처음 한 번).
   받는 자리는 `.자재/큐알읽개/` 로 따로 둔다. `.자재` 에 바로 받으면 npm 이 거기 있던
   xlsx·sortablejs·gsap 를 「쓸데없는 것」 으로 보고 지워 버린다(10-08 에 한 번 겪었다). */
const 읽개칸 = path.join(HERE, '큐알읽개');
const jsqr길 = path.join(읽개칸, 'node_modules/jsqr/dist/jsQR.js');
if (!existsSync(jsqr길)) {
  mkdirSync(읽개칸, { recursive: true });
  writeFileSync(path.join(읽개칸, 'package.json'),
    JSON.stringify({ name: 'amt-큐알읽개', private: true, version: '0.0.0' }, null, 2) + '\n');
  const r = spawnSync('npm', ['install', '--no-audit', '--no-fund', 'jsqr'], { cwd: 읽개칸, stdio: 'inherit' });
  if (r.status !== 0 || !existsSync(jsqr길))
    throw new Error('큐알을 읽을 연장(jsqr)을 못 갖췄습니다 — tests/.자재/큐알읽개 에 npm i jsqr 해 주십시오');
}
const { default: jsQR } = await import('file://' + jsqr길);
const URL = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const L = await 자료('원장');
const b = await 브라우저열기();
let 실패 = 0; const 판 = (n, t, v) => { if (!t) 실패++; console.log((t ? '  OK  ' : '  FAIL') + '  ' + n + '   → ' + v); };
const ctx = await b.newContext({ ...devices['iPhone 12'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
await ctx.route('https://cdn.tailwindcss.com*', r => r.fulfill({ status: 200, contentType: 'application/javascript',
  body: 'document.write(' + JSON.stringify('<style>' + CSS + '</style>') + ');' }));
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1500);

const 본 = await p.evaluate((L) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장', '발주', '도면', '차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.__쓰기 = 0; const 셈 = () => async () => { window.__쓰기++; };
  window.db = {}; window.storage = {};
  window.fbFirestore = { doc: () => ({}), updateDoc: 셈(), setDoc: 셈(), deleteDoc: 셈(), addDoc: 셈(),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  currentFullData.length = 0; L.forEach(r => currentFullData.push(r));
  const h = currentFullData[0];
  let ri = 0;
  for (let i = 1; i < currentFullData.length; i++) {
    const r = currentFullData[i];
    if (r && normalizeValue(r[h.indexOf('공급처')]) === 'AMT' && parseFloat(r[h.indexOf('재단W')]) > 0) { ri = i; break; }
  }
  if (!ri) return { 못세움: true };
  const ck = 'card-9401-' + ri;
  const 발주 = { idNum: 9401, docId: 'd9401', orderCode: '본사-20261004-01', displayName: '시험상품 파레트',
    orderQty: 10, amtTimeline: true, batchId: 1791000000000, deliveryDate: '2026-10-19',
    procOverrides: {}, partMoveLog: {}, partInfoMap: { [ck]: { qty: 10, isDeleted: false } },
    partStarted: { [ck]: { '보링': { started: true, startedAt: Date.now() - 300000 } } }, partCompletions: {} };
  confirmedOrders.length = 0; confirmedOrders.push(발주);
  window._집중파레트들 = {};
  window._집중판열기({ order: 발주, docId: 'd9401', cardKey: ck, procKey: '보링',
    rec: { date: '2026-10-19', partName: currentFullData[ri][h.indexOf('부속명')] || '부속', started: true,
           startedAt: Date.now() - 300000 } });
  return { ri, ck, 발주번호: 발주.orderCode };
}, L);
console.log('■ 차림: ' + JSON.stringify(본));
if (본.못세움) { console.log('파레트1   FAIL (원장에서 AMT 부속 줄을 못 찾음)'); process.exit(1); }
await p.waitForTimeout(300);

const 처음 = await p.evaluate(() => {
  const 단 = [...document.querySelectorAll('#_집중파레트 .집중-파')].map(e => ({
    글: (e.textContent || '').trim(), 높이: Math.round(e.getBoundingClientRect().height),
    폭: Math.round(e.getBoundingClientRect().width), 켜짐: e.classList.contains('on') }));
  return { 단, 큐알: !!document.querySelector('#_집중큐알 svg.큐알'),
           큐알칸글: (document.getElementById('_집중큐알')?.textContent || '').trim(),
           문서가로: document.documentElement.scrollWidth };
});
console.log('■ 처음: ' + JSON.stringify(처음));
판('① 파레트 단추 넷(A·B·C·D)이 선다',
   처음.단.length === 4 && 처음.단.map(x => x.글).join('') === 'ABCD', JSON.stringify(처음.단.map(x => x.글)));
판('① 네 단추 다 44px 이상이다 (장갑 낀 손)',
   처음.단.length === 4 && 처음.단.every(x => x.높이 >= 44), JSON.stringify(처음.단.map(x => x.높이)));
판('② 고르기 전에는 큐알이 없다', 처음.큐알 === false, 처음.큐알칸글 || '(빈 칸)');

// ③ 고르기 전에 완료를 눌러 본다 — 완료 창이 열리면 안 된다
const 막힘 = await p.evaluate(async () => {
  const 말 = []; const 옛 = window.showToastMessage; window.showToastMessage = t => 말.push(String(t));
  document.getElementById('_pdQty')?.closest('#_partDoneModal')?.remove();
  document.getElementById('_집중완료').click();
  await new Promise(r => setTimeout(r, 200));
  window.showToastMessage = 옛;
  return { 완료창: !!document.getElementById('_partDoneModal'), 집중판: !!document.getElementById('_집중판'), 말 };
});
console.log('■ 고르기 전 완료: ' + JSON.stringify(막힘));
판('③ 파레트를 안 고르면 완료 창이 안 열린다', 막힘.완료창 === false && 막힘.집중판 === true, JSON.stringify(막힘));
판('③ 왜 안 되는지 한 마디 뜬다', 막힘.말.some(t => /파레트/.test(t)), JSON.stringify(막힘.말));

// ④ 진짜 손가락으로 B 를 누른다
const cdp = await ctx.newCDPSession(p);
const 손 = (t, x, y) => cdp.send('Input.dispatchTouchEvent',
  { type: t, touchPoints: t === 'touchEnd' ? [] : [{ x, y, radiusX: 14, radiusY: 14, force: 1 }] });
const 자리 = await p.evaluate(() => {
  const e = [...document.querySelectorAll('#_집중파레트 .집중-파')].find(x => x.dataset.파 === 'B');
  if (!e) return null; e.scrollIntoView({ block: 'center' });
  const r = e.getBoundingClientRect();
  return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
});
if (!자리) { console.log('파레트1   FAIL (B 단추를 못 찾음)'); process.exit(1); }
await 손('touchStart', 자리.x, 자리.y); await p.waitForTimeout(60); await 손('touchEnd', 0, 0);
await p.waitForTimeout(400);

const 고른뒤 = await p.evaluate(() => {
  const svg = document.querySelector('#_집중큐알 svg.큐알');
  const 켜진 = [...document.querySelectorAll('#_집중파레트 .집중-파')].filter(e => e.classList.contains('on'))
    .map(e => e.dataset.파);
  let 판 = null;
  if (svg) {
    const 크기 = parseInt(svg.getAttribute('data-크기'), 10);
    const 여백 = 4;
    const 칸 = Array.from({ length: 크기 }, () => new Array(크기).fill(0));
    const d = svg.querySelector('path').getAttribute('d');
    (d.match(/M(\d+) (\d+)h1v1h-1z/g) || []).forEach(seg => {
      const m = seg.match(/M(\d+) (\d+)/);
      const c = parseInt(m[1], 10) - 여백, r = parseInt(m[2], 10) - 여백;
      if (r >= 0 && r < 크기 && c >= 0 && c < 크기) 칸[r][c] = 1;
    });
    판 = { 크기, 칸, 글: svg.getAttribute('data-글'),
           본크기: { w: Math.round(svg.getBoundingClientRect().width), h: Math.round(svg.getBoundingClientRect().height) } };
  }
  return { 켜진, 판, 밑글: (document.querySelector('#_집중큐알 .집중-큐알글')?.textContent || '').trim(),
           문서가로: document.documentElement.scrollWidth, 쓰기: window.__쓰기 };
});
console.log('■ B 를 손가락으로 누른 뒤: 켜진 ' + JSON.stringify(고른뒤.켜진) + ' · 큐알 ' +
  (고른뒤.판 ? 고른뒤.판.크기 + '×' + 고른뒤.판.크기 + ' ' + JSON.stringify(고른뒤.판.본크기) : '(없음)') +
  ' · 밑글 ' + 고른뒤.밑글);
판('④ 누른 단추 하나만 켜진다', 고른뒤.켜진.length === 1 && 고른뒤.켜진[0] === 'B', JSON.stringify(고른뒤.켜진));
판('④ 큐알이 나타난다', !!고른뒤.판, 고른뒤.판 ? '있다' : '없다');
판('④ 큐알 글자가 「발주번호-파레트」 다',
   !!고른뒤.판 && 고른뒤.판.글 === 본.발주번호 + '-B' && 고른뒤.밑글 === 본.발주번호 + '-B',
   (고른뒤.판 ? 고른뒤.판.글 : '(없음)') + ' / 밑글 ' + 고른뒤.밑글);

// ⑤ 그 큐알을 **읽어** 본다 — 그림만 그린 것이 아니라 진짜 큐알이어야 한다
let 읽힌 = '(못 읽음)';
if (고른뒤.판) {
  const q = 고른뒤.판, 배 = 10, 여백 = 4, px = (q.크기 + 여백 * 2) * 배;
  const 점 = new Uint8ClampedArray(px * px * 4).fill(255);
  for (let r = 0; r < q.크기; r++) for (let c = 0; c < q.크기; c++) if (q.칸[r][c])
    for (let y = 0; y < 배; y++) for (let x = 0; x < 배; x++) {
      const Y = (r + 여백) * 배 + y, X = (c + 여백) * 배 + x, i = (Y * px + X) * 4;
      점[i] = 점[i + 1] = 점[i + 2] = 0;
    }
  const 나온것 = jsQR(점, px, px);
  읽힌 = 나온것 ? 나온것.data : '(못 읽음)';
}
판('⑤ 그 큐알이 진짜로 읽힌다 (jsqr 로 읽어 글자를 견준다)', 읽힌 === 본.발주번호 + '-B', 읽힌);

// ⑥ 이제 완료가 열린다
const 열림 = await p.evaluate(async () => {
  document.getElementById('_집중완료').click();
  await new Promise(r => setTimeout(r, 300));
  const m = document.getElementById('_partDoneModal');
  const 값 = { 완료창: !!m, 수량칸: (document.getElementById('_pdQty') || {}).value || null };
  m?.remove(); window._pdConfirmData = null;
  return 값;
});
console.log('■ 고른 뒤 완료: ' + JSON.stringify(열림));
판('⑥ 파레트를 고르면 완료 창이 열린다', 열림.완료창 === true, JSON.stringify(열림));
판('⑦ 375px 가로 스크롤 없다', 고른뒤.문서가로 <= 375, 고른뒤.문서가로 + 'px');
판('⑦ 발주 자료에 한 줄도 안 쓴다 (고른 파레트는 이 창에서만 들고 있다)', 고른뒤.쓰기 === 0, 고른뒤.쓰기 + '번');

/* ⑧ 재단에는 파레트가 없다 — 10-09 사장님 말씀:
   「재단 작업에는 파레트 설정이 필요 없습니다.」
   같은 부속·같은 발주를 **공정만 재단으로** 바꿔 타이머를 열어 잰다.
   다른 공정(위에서 잰 보링)은 그대로 있어야 한다 — 통째로 되돌린 것이 아니다. */
const 재단 = await p.evaluate(async ({ ck }) => {
  document.getElementById('_partDoneModal')?.remove(); window._pdConfirmData = null;
  const o = confirmedOrders.find(x => x.idNum === 9401);
  o.partStarted[ck] = Object.assign({}, o.partStarted[ck],
    { '재단': { started: true, startedAt: Date.now() - 300000 } });
  window._집중판닫기();
  window._집중판열기({ order: o, docId: 'd9401', cardKey: ck, procKey: '재단',
    rec: { date: '2026-10-19', partName: '가와', started: true, startedAt: Date.now() - 300000 } });
  await new Promise(r => setTimeout(r, 200));
  const 단 = document.querySelectorAll('#_집중파레트 .집중-파').length;
  const 큐 = !!document.getElementById('_집중큐알');
  const 말 = []; const 옛 = window.showToastMessage; window.showToastMessage = t => 말.push(String(t));
  document.getElementById('_집중완료').click();
  await new Promise(r => setTimeout(r, 300));
  window.showToastMessage = 옛;
  const m = document.getElementById('_partDoneModal');
  const 값 = { 단추: 단, 큐알칸: 큐, 완료창: !!m, 말, 쓰기: window.__쓰기 };
  m?.remove(); window._pdConfirmData = null;
  return 값;
}, { ck: 본.ck });
console.log('■ 재단 타이머: ' + JSON.stringify(재단));
판('⑧ 재단 타이머에는 파레트 단추가 없다', 재단.단추 === 0, 재단.단추 + '개');
판('⑧ 재단 타이머에는 큐알 자리도 없다', 재단.큐알칸 === false, String(재단.큐알칸));
판('⑧ 재단은 파레트 없이 그냥 완료된다 (막지 않는다)',
   재단.완료창 === true && !재단.말.some(t => /파레트/.test(t)), JSON.stringify(재단));
판('⑧ 그래도 발주 자료에는 안 쓴다', 재단.쓰기 === 0, 재단.쓰기 + '번');

판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '파레트1   OK' : '파레트1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
