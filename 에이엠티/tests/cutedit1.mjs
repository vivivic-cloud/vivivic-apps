// 재단편집은 카드째가 아니라 카드 안 「편집」 단추로만 열린다.
// 사장님 지시(09-23 00:40): 「부속박스를 눌러 재단편집 화면으로 넘어가는것을
//   부속박스내 재단도면 주변에 편집버튼을 눌러 넘어가게 해주세요」
// 폰 375px · 진짜 손가락(CDP 터치)으로 누른다.
//
// 카드 HTML 은 앱의 제 함수(_woPlacedCardHtml · _woCardHtml)로 뽑아, 아무것도
// 덮지 않는 칸에 그대로 앉혀 누른다. 이 상자에서 시험을 띄우면 박스판·발주서
// 화면이 공정 화면 위에 덮여 손가락이 그리로 가 버리기 때문이다. 앉히는 칸에는
// .wo-boring-mac-col 을 걸어 둔다 — 길게 눌러 옮기기가 그 칸을 찾기 때문이다.
import { 브라우저열기, devices, 서버, 자료, 자재, 그림칸 as 그림칸자리 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const 그림칸 = 그림칸자리();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const B = 'http://127.0.0.1:8899';
const URL = B + '/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
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

await p.evaluate(() => {
  const o = document.getElementById('auth-login-overlay'); if (o) o.style.display = 'none';
  ['원장','발주','도면','차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.__쓰기 = 0; const 셈 = () => async () => { window.__쓰기++; };
  window.db = {}; window.fbFirestore = { doc: () => ({}), updateDoc: 셈(), setDoc: 셈(), deleteDoc: 셈(), addDoc: 셈(),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  const sk = '2026-09-15-재단';
  confirmedOrders.length = 0;
  confirmedOrders.push({ idNum: 1401, docId: 'd1', orderCode: '샘플-20260101-01', displayName: '(본)본보기 오픈장',
    orderQty: 60, amtTimeline: true, partInfoMap: {}, partCompletions: {}, partStarted: {}, deliveryDate: '2026-09-15' });
  const 한장 = (ck, nm) => ({ cKey: ck, nm, pm: 8, dq: 60, orderCode: '샘플-20260101-01', orderKey: 'd1',
    orderName: '(본)본보기 오픈장', plateName: 'PB-18T', coating: '양면', finish: '화이트',
    rw: 480, rd: 1015, isCuttingCard: true, sheets: 5, perSheet: 4, pRowIndex: null,
    boardParts: [{ lp: 0, tp: 0, wp: .45, hp: .4, bg: '#ddd', dw: '480', dh: '1015' },
                 { lp: .5, tp: 0, wp: .45, hp: .4, bg: '#eee', dw: '480', dh: '1015' }],
    coveredOrderIds: [1401] });
  window.__sk = sk;
  window.__놓인것 = 한장('CUT_놓인', '가와');
  window.__안놓인것 = 한장('CUT_풀', '지판');
  window._woBoringParts[sk] = [window.__놓인것, window.__안놓인것];
  window._woBoring[sk] = { pool: ['CUT_풀'], AMT: ['CUT_놓인'] };
});
await p.waitForTimeout(300);

// ── 카드 두 장을 앱의 제 함수로 뽑아 덮이지 않는 칸에 앉힌다
const 무대세우기 = () => p.evaluate(() => {
  document.getElementById('__무대')?.remove();
  const sk = window.__sk;
  const 칸 = document.createElement('div');
  칸.id = '__무대'; 칸.className = 'wo-boring-mac-col';
  칸.style.cssText = 'position:fixed;left:0;top:0;width:375px;z-index:99999;background:#fff;padding:8px;box-sizing:border-box;';
  칸.innerHTML =
    _woPlacedCardHtml(window.__놓인것, 'CUT_놓인', sk, 'AMT', _woGetOrderColorMap(sk), '') +
    '<div style="height:10px"></div>' +
    _woCardHtml(window.__안놓인것, sk);
  document.body.appendChild(칸);
  return { 놓인: document.querySelectorAll('#__무대 .wo-boring-placed-card').length,
           풀: document.querySelectorAll('#__무대 .wo-boring-part-card').length };
});
console.log('■ 무대: ' + JSON.stringify(await 무대세우기()));

const cdp = await ctx.newCDPSession(p);
const 누름 = async (x, y, ms = 110) => {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, radiusX: 14, radiusY: 14, force: 1 }] });
  await p.waitForTimeout(ms);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(320);
};
const 자리 = (sel, 어디) => p.evaluate(({ s, 어디 }) => {
  const e = document.querySelector(s); if (!e) return null;
  const b = e.getBoundingClientRect();
  const x = 어디 === '몸통' ? Math.round(b.x + 24) : Math.round(b.x + b.width / 2);
  const y = 어디 === '몸통' ? Math.round(b.y + 14) : Math.round(b.y + b.height / 2);
  const 위 = document.elementFromPoint(x, y);
  return { x, y, 맞나: !!(위 && (위 === e || e.contains(위))), 위: 위 ? (위.className || 위.tagName) : null };
}, { s: sel, 어디 });
const 톡 = async (sel, 어디, ms) => {
  const r = await 자리(sel, 어디);
  if (!r) { console.log('   !! 못 집음: ' + sel); return false; }
  if (!r.맞나) console.log('   !! 그 자리에 딴것: ' + sel + ' → ' + r.위 + ' (' + r.x + ',' + r.y + ')');
  await 누름(r.x, r.y, ms); return true;
};
const 편집판떴나 = () => p.evaluate(() => !!document.getElementById('_woInlineEditOverlay'));
// 덮개를 그냥 지우면 안 된다 — 재단편집 도구(#cutting-edit-box)를 그 안으로
// 옮겨다 쓰는 구조라, 덮개째 지우면 도구가 같이 사라져 다음 번에 안 열린다.
// 앱이 쓰는 닫기(_woCloseInlineEdit)를 그대로 부른다.
const 치우기 = async () => {
  await p.evaluate(() => {
    if (document.getElementById('_woInlineEditOverlay') && typeof _woCloseInlineEdit === 'function') _woCloseInlineEdit();
    else document.getElementById('_woInlineEditOverlay')?.remove();
  });
  await p.waitForTimeout(150);
  await 무대세우기();
};

// ── 재 본다
const 잰것 = await p.evaluate(() => {
  const 재 = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; };
  const 놓 = document.querySelector('#__무대 .wo-boring-placed-card');
  const 풀 = document.querySelector('#__무대 .wo-boring-part-card');
  const 단추 = 놓.querySelector('.wo-cut-편집');
  const 닿 = getComputedStyle(단추, '::after');
  const 도면 = 놓.querySelector('svg');
  return {
    놓인카드: 재(놓), 풀카드: 재(풀), 놓인단추: 재(단추), 풀단추: 재(풀.querySelector('.wo-cut-편집')),
    닿는자리: { w: 닿.width, h: 닿.height, minW: 닿.minWidth },
    단추글: 단추.textContent.trim(),
    도면과한칸: !!(도면 && 단추.parentElement === 도면.parentElement),
    카드onclick: !!놓.getAttribute('onclick'), 풀onclick: !!풀.getAttribute('onclick'),
    카드커서: getComputedStyle(놓).cursor, 풀커서: getComputedStyle(풀).cursor,
    카드끌기: 놓.getAttribute('draggable'), 풀끌기: 풀.getAttribute('draggable'),
    두번치기: !!놓.getAttribute('ondblclick'),
    문서가로: document.documentElement.scrollWidth,
  };
});
console.log('■ 잰 것: ' + JSON.stringify(잰것));

판('카드 전체의 onclick 이 없어졌다 (놓인 카드·풀 카드 둘 다)',
   잰것.카드onclick === false && 잰것.풀onclick === false, '놓인 ' + 잰것.카드onclick + ' · 풀 ' + 잰것.풀onclick);
판('카드 전체의 cursor:pointer 도 없어졌다',
   잰것.카드커서 !== 'pointer' && 잰것.풀커서 !== 'pointer', '놓인 ' + 잰것.카드커서 + ' · 풀 ' + 잰것.풀커서);
판('두 카드 다 「편집」 단추가 있다', 잰것.단추글 === '편집' && !!잰것.풀단추,
   '글 「' + 잰것.단추글 + '」 · 놓인 ' + JSON.stringify(잰것.놓인단추) + ' · 풀 ' + JSON.stringify(잰것.풀단추));
판('「편집」 이 재단도면과 같은 칸에 있다', 잰것.도면과한칸 === true, String(잰것.도면과한칸));
판('「편집」 닿는 자리가 44px 이상', parseFloat(잰것.닿는자리.h) >= 44 && parseFloat(잰것.닿는자리.w) >= 44,
   JSON.stringify(잰것.닿는자리));
판('375px 가로 스크롤 없다', 잰것.문서가로 <= 375, 잰것.문서가로 + 'px');

// ① 카드 몸통을 눌러도 안 넘어간다
await 톡('#__무대 .wo-boring-placed-card', '몸통');
const 하나놓 = await 편집판떴나(); await 치우기();
await 톡('#__무대 .wo-boring-part-card', '몸통');
const 하나풀 = await 편집판떴나(); await 치우기();
판('① 카드 몸통을 눌러도 재단편집이 안 열린다', 하나놓 === false && 하나풀 === false, '놓인 ' + 하나놓 + ' · 풀 ' + 하나풀);

// ② 「편집」 을 누르면 넘어간다
await 톡('#__무대 .wo-boring-placed-card .wo-cut-편집');
const 둘놓 = await 편집판떴나(); await 치우기();
await 톡('#__무대 .wo-boring-part-card .wo-cut-편집');
const 둘풀 = await 편집판떴나(); await 치우기();
판('② 「편집」 을 누르면 재단편집이 열린다', 둘놓 === true && 둘풀 === true, '놓인 ' + 둘놓 + ' · 풀 ' + 둘풀);

// ③ 카드 몸통은 예전처럼 끌린다
const 셋 = await p.evaluate(() => {
  const el = document.querySelector('#__무대 .wo-boring-placed-card');
  let 불렸나 = false; const 원래 = window.woBoardDragStart;
  window.woBoardDragStart = function () { 불렸나 = true; };
  el.dispatchEvent(new Event('dragstart', { bubbles: true }));
  window.woBoardDragStart = 원래;
  return { 끌기속성: el.getAttribute('draggable'), 손잡이불림: 불렸나 };
});
판('③ 카드 몸통은 예전처럼 끌린다', 셋.끌기속성 === 'true' && 셋.손잡이불림 === true, JSON.stringify(셋));

// ④ 길게 눌러 옮기기 — 카드 몸통은 켜지고, 「편집」 위에서는 안 켜진다
const 길게 = async (sel, 어디) => {
  await p.evaluate(() => { document.querySelectorAll('.wo-move-on').forEach(e => e.classList.remove('wo-move-on'));
    if (window._woMove) window._woMove = null; });
  const r = await 자리(sel, 어디);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.y, radiusX: 14, radiusY: 14, force: 1 }] });
  await p.waitForTimeout(900);
  const 켜짐 = await p.evaluate(() => !!document.querySelector('.wo-move-on') || !!window._woMove);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(250); return 켜짐;
};
const 몸통길게 = await 길게('#__무대 .wo-boring-placed-card', '몸통');
await 치우기();
const 편집길게 = await 길게('#__무대 .wo-boring-placed-card .wo-cut-편집');
await 치우기();
판('④ 카드 몸통을 길게 누르면 예전처럼 옮기기가 켜진다', 몸통길게 === true, String(몸통길게));
판('④ 「편집」 을 길게 눌러도 카드가 안 끌린다', 편집길게 === false, String(편집길게));

// ⑤ 두 번 치기 그대로
const 다섯 = await p.evaluate(() => {
  const el = document.querySelector('#__무대 .wo-boring-placed-card');
  let 불렸나 = false; const 원래 = window.woBoardDblClick;
  window.woBoardDblClick = function () { 불렸나 = true; };
  el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
  const bt = el.querySelector('.wo-cut-편집');
  let 단추에서 = false;
  window.woBoardDblClick = function () { 단추에서 = true; };
  bt.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
  window.woBoardDblClick = 원래;
  return { 속성: !!el.getAttribute('ondblclick'), 몸통에서: 불렸나, 단추에서 };
});
판('⑤ 카드 두 번 치기가 그대로 돈다', 다섯.속성 === true && 다섯.몸통에서 === true, JSON.stringify(다섯));
판('⑤ 「편집」 위에서 두 번 쳐도 카드로 안 샌다', 다섯.단추에서 === false, String(다섯.단추에서));

// ⑥ 완료·시작 단추 그대로
const 여섯 = await p.evaluate(() => {
  const 놓 = document.querySelector('#__무대 .wo-boring-placed-card');
  const 것 = [...놓.querySelectorAll('button')].map(e => { const r = e.getBoundingClientRect();
    return { 글: e.textContent.trim().slice(0, 6), w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) }; });
  const 겹침 = [];
  for (let i = 0; i < 것.length; i++) for (let j = i + 1; j < 것.length; j++) {
    const a = 것[i], c = 것[j];
    if (a.x < c.x + c.w && c.x < a.x + a.w && a.y < c.y + c.h && c.y < a.y + a.h) 겹침.push(a.글 + '↔' + c.글);
  }
  return { 단추들: 것, 겹침 };
});
console.log('■ 카드 안 단추: ' + JSON.stringify(여섯));
판('⑥ 시작(또는 완료) 단추가 그대로 있다', 여섯.단추들.some(x => /시작|완료/.test(x.글)), 여섯.단추들.map(x => x.글).join(' · '));
판('⑥ 「편집」 과 시작·완료 단추가 겹치지 않는다', 여섯.겹침.length === 0, JSON.stringify(여섯.겹침));
const 앞쓰기 = await p.evaluate(() => window.__쓰기);
await 톡('#__무대 .wo-boring-placed-card button[style*="3b82f6"]');
const 여섯눌림 = (await p.evaluate(() => window.__쓰기)) > 앞쓰기;
판('⑥ 「▶ 시작」 이 손가락에 그대로 눌린다', 여섯눌림 === true, '기록 쓰임 ' + 여섯눌림);
판('파이어스토어에 재단계획·발주확정을 새로 쓰지 않았다 (시작 누른 것 말고는 0)',
   (await p.evaluate(() => window.__쓰기)) <= 앞쓰기 + 2, '쓰기 ' + (await p.evaluate(() => window.__쓰기)) + '번');

// ── 그림 두 장 (판번호를 올린 뒤에 찍는다)
await 치우기();
const 오려찍기 = async (sel, 이름) => {
  const c = await p.evaluate(s => { const e = document.querySelector(s); const r = e.getBoundingClientRect();
    return { x: Math.max(0, Math.round(r.x - 6)), y: Math.max(0, Math.round(r.y - 6)),
             width: Math.min(375, Math.round(r.width + 12)), height: Math.round(r.height + 12) }; }, sel);
  await p.screenshot({ path: 그림칸 + '/' + 이름, clip: c });
};
await 오려찍기('#__무대 .wo-boring-placed-card', 'cut-375-놓인카드.png');
await 오려찍기('#__무대 .wo-boring-part-card', 'cut-375-풀카드.png');

판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
console.log('■ 카드 높이 — 놓인 ' + 잰것.놓인카드.h + 'px · 풀 ' + 잰것.풀카드.h + 'px');
console.log(실패 === 0 ? 'cutedit1   OK' : 'cutedit1   FAIL (' + 실패 + ')');
await b.close(); process.exit(실패 === 0 ? 0 : 1);
