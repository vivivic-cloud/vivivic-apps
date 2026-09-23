// 시작한 일 — 잠시 멈춤 · 취소 · 완료. 그리고 취소했다 다시 한 시간이 합산되는지.
// 사장님 지시(09-23 03:43): 「시작 버튼을 누른후 시작을 취소 할 수 있어야 합니다.
//   … stop/cancle/complete 세가지 … stop시 잠시 멈춤 시간카운트는 계속됨,
//   cancle시 … 지금까지의 시간을 해당카드에 합산되도록 기록 … 재시작시 합산,
//   complete 시 해당카드의 작업이 완료됨」
// 폰 375px · 진짜 손가락(CDP 터치)으로 누른다.
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
p.on('dialog', d => d.accept());          // 「무를까요?」 물음에 예 라고 답한다
await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1500);

const 차리기 = () => p.evaluate(() => {
  const ov = document.getElementById('auth-login-overlay'); if (ov) ov.style.display = 'none';
  ['원장','발주','도면','차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.__쓴것 = [];
  const 쓰기 = async (ref, 값) => { window.__쓴것.push({ 칸: ref.p, 값 });
    // 진짜 파이어스토어처럼 발주에도 반영해 둔다(경로 한 칸짜리만)
    Object.entries(값).forEach(([길, v]) => {
      const 토막 = 길.split('.'); const o = confirmedOrders.find(x => x.docId === ref.id);
      if (!o) return; let 자리 = o;
      토막.slice(0, -1).forEach(t => { 자리[t] = 자리[t] || {}; 자리 = 자리[t]; });
      자리[토막[토막.length - 1]] = v;
    });
  };
  window.db = {};
  window.fbFirestore = {
    doc: (db, ...a) => ({ p: a.join('/'), id: a[a.length - 1] }),
    updateDoc: 쓰기, setDoc: async () => {}, deleteDoc: async () => {}, addDoc: async () => {},
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  const sk = '2026-09-15-재단';
  confirmedOrders.length = 0;
  [1, 2].forEach(n => confirmedOrders.push({ idNum: 1400 + n, docId: 'd' + n,
    orderCode: '샘플-2026010' + n + '-01', displayName: '(본)본보기 오픈장 ' + n, orderQty: 50,
    amtTimeline: true, partInfoMap: {}, partCompletions: {}, partStarted: {}, deliveryDate: '2026-09-15' }));
  const 한장 = (n) => ({ cKey: 'CUT_' + n, nm: '가와' + n, pm: 8, dq: 50,
    orderCode: '샘플-2026010' + n + '-01', orderKey: 'd' + n, orderName: '(본)본보기 오픈장 ' + n,
    plateName: 'PB-18T', coating: '양면', finish: '화이트', rw: 480, rd: 1015,
    isCuttingCard: true, sheets: 5, perSheet: 4, pRowIndex: null,
    boardParts: [{ lp: 0, tp: 0, wp: .45, hp: .4, bg: '', dw: '480', dh: '1015' }],
    coveredOrderIds: [1400 + n] });
  window.__sk = sk; window.__한장 = 한장;
  window._woBoringParts[sk] = [한장(1), 한장(2)];
  window._woBoring[sk] = { pool: [], AMT: ['CUT_1', 'CUT_2'] };
  // 카드 두 장을 덮이지 않는 칸에 앉힌다(이 상자에서는 박스판이 위에 덮인다)
  const 칸 = document.createElement('div');
  칸.id = '__무대'; 칸.className = 'wo-boring-mac-col';
  칸.style.cssText = 'position:fixed;left:0;top:0;width:375px;z-index:99999;background:#fff;padding:8px;box-sizing:border-box;';
  칸.innerHTML = [1, 2].map(n => _woPlacedCardHtml(한장(n), 'CUT_' + n, sk, 'AMT', _woGetOrderColorMap(sk), '')).join('<div style="height:8px"></div>');
  document.getElementById('__무대')?.remove();
  document.body.appendChild(칸);
  return document.querySelectorAll('#__무대 .wo-boring-placed-card').length;
});
console.log('■ 무대에 카드 ' + (await 차리기()) + '장');

const cdp = await ctx.newCDPSession(p);
const 톡 = async (sel, ms = 110) => {
  const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null;
    e.scrollIntoView({ block: 'center' }); const b = e.getBoundingClientRect();
    return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) }; }, sel);
  if (!r) { console.log('   !! 못 집음: ' + sel); return false; }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.y, radiusX: 14, radiusY: 14, force: 1 }] });
  await p.waitForTimeout(ms);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(420); return true;
};
const 판떴나 = () => p.evaluate(() => !!document.getElementById('_집중판'));
const 시계글 = () => p.evaluate(() => (document.getElementById('_집중시계글') || {}).textContent || '');
const 기록 = (n = 1) => p.evaluate(n => {
  const o = confirmedOrders.find(x => x.docId === 'd' + n);
  return { 시작: (o.partStarted?.['CUT_' + n] || {})['재단'] || null,
           완료: (o.partCompletions?.['CUT_' + n] || {})['재단'] || null }; }, n);
// 흐른 시간을 흉내 낸다 — startMs 를 뒤로 돌린다(진짜로 몇 분 기다릴 수는 없다)
const 시간되돌리기 = (분, n = 1) => p.evaluate(({ 분, n }) => {
  const o = confirmedOrders.find(x => x.docId === 'd' + n);
  const r = o.partStarted['CUT_' + n]['재단'];
  r.startMs = r.startMs - 분 * 60000;
  if (window._집중일) window._집중일.rec = r;
}, { 분, n });

// ── ① 시작 → 집중 창이 뜨고 안 닫힌다
await 톡('#__무대 .wo-boring-placed-card button[style*="3b82f6"]');
const 뜸 = await 판떴나();
const 크기 = await p.evaluate(() => {
  const s = document.querySelector('#_집중판 .집중-속'); const r = s.getBoundingClientRect();
  const 단 = [...document.querySelectorAll('#_집중판 .집중-단추')].map(e => {
    const b = e.getBoundingClientRect();
    return { 글: e.textContent.trim(), w: Math.round(b.width), h: Math.round(b.height), y: Math.round(b.y) }; });
  return { 판: { w: Math.round(r.width), h: Math.round(r.height) }, 단추: 단,
           문서가로: document.documentElement.scrollWidth };
});
console.log('■ 집중 창: ' + JSON.stringify(크기));
판('① 시작을 누르면 집중 창이 뜬다', 뜸 === true, String(뜸));
판('① 단추 셋 — 잠시 멈춤 · 완료 · 취소', 크기.단추.map(x => x.글).join(' · ') === '잠시 멈춤 · 완료 · 취소',
   크기.단추.map(x => x.글).join(' · '));
판('① 단추 누르는 높이 44px 이상', 크기.단추.every(x => x.h >= 44), JSON.stringify(크기.단추.map(x => x.w + 'x' + x.h)));
판('① 「취소」 는 「완료」 와 줄이 다르다 (잘못 눌리지 않게)',
   크기.단추.find(x => x.글 === '취소').y > 크기.단추.find(x => x.글 === '완료').y,
   '완료 y ' + 크기.단추.find(x => x.글 === '완료').y + ' · 취소 y ' + 크기.단추.find(x => x.글 === '취소').y);
판('① 375px 가로 스크롤 없다', 크기.문서가로 <= 375, 크기.문서가로 + 'px');
// 바깥을 눌러도 · ESC 를 눌러도 안 닫힌다 — 덮개의 빈 구석(왼쪽 위)을 짚는다
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 8, y: 8, radiusX: 14, radiusY: 14, force: 1 }] });
await p.waitForTimeout(110);
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await p.waitForTimeout(400);
const 바깥뒤 = await 판떴나();
await p.keyboard.press('Escape'); await p.waitForTimeout(250);
const ESC뒤 = await 판떴나();
판('① 바깥을 눌러도 안 닫힌다', 바깥뒤 === true, String(바깥뒤));
판('① ESC 를 눌러도 안 닫힌다', ESC뒤 === true, String(ESC뒤));

// ② 다른 카드의 ▶ 시작이 안 눌린다
const 다른카드눌림 = await p.evaluate(() => {
  const 둘째 = [...document.querySelectorAll('#__무대 .wo-boring-placed-card')][1];
  const bt = 둘째 && 둘째.querySelector('button[style*="3b82f6"]');
  if (!bt) return '단추없음';
  const r = bt.getBoundingClientRect();
  const 위 = document.elementFromPoint(Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2));
  return 위 && (위.id === '_집중판' || 위.closest('#_집중판')) ? '집중창이 막음' : '뚫림:' + (위 && 위.tagName);
});
판('② 그 동안 다른 카드의 ▶ 시작은 못 누른다', 다른카드눌림 === '집중창이 막음', 다른카드눌림);

// ④ 잠시 멈춤 — 시간은 계속 간다
await 시간되돌리기(3);
const 멈춤전글 = await 시계글();
await 톡('#_집중멈춤');
const 멈춤기록 = (await 기록()).시작;
await 시간되돌리기(2);
await p.waitForTimeout(1200);
const 멈춤후글 = await 시계글();
판('④ 「잠시 멈춤」 이 기록에 남는다 (멈춤:true)', 멈춤기록 && 멈춤기록.멈춤 === true, JSON.stringify(멈춤기록));
판('④ 멈춘 동안에도 시간은 계속 간다',
   parseFloat(멈춤후글) > parseFloat(멈춤전글), 멈춤전글 + ' → ' + 멈춤후글);
await p.screenshot({ path: 그림칸 + '/work-375-집중-멈춤.png' });
await 톡('#_집중멈춤');   // 다시 하기

// ⑤ 취소 — 카드가 ▶ 시작으로 돌아가고 쌓인분이 적힌다
await 시간되돌리기(5);
const 취소전 = await 시계글();
await 톡('#_집중취소');
const 취소뒤 = await 기록();
const 창닫힘 = await 판떴나();
console.log('■ 취소 뒤 기록: ' + JSON.stringify(취소뒤.시작) + ' · 창 ' + 창닫힘);
판('⑤ 취소하면 집중 창이 닫힌다', 창닫힘 === false, String(창닫힘));
판('⑤ 취소하면 started 가 false 가 된다', 취소뒤.시작 && 취소뒤.시작.started === false, JSON.stringify(취소뒤.시작));
판('⑤ 지금까지 흐른 분이 쌓인분에 적힌다',
   취소뒤.시작 && 취소뒤.시작.쌓인분 >= 5 && 취소뒤.시작.쌓인분 <= 11,
   '쌓인분 ' + (취소뒤.시작 || {}).쌓인분 + ' (화면 ' + 취소전 + ')');
const 카드꼴 = await p.evaluate(() => {
  _woRenderBoard(window.__sk);
  const 칸 = document.getElementById('__무대');
  칸.innerHTML = [1, 2].map(n => _woPlacedCardHtml(window.__한장(n), 'CUT_' + n, window.__sk, 'AMT', _woGetOrderColorMap(window.__sk), '')).join('<div style="height:8px"></div>');
  const bt = 칸.querySelector('.wo-boring-placed-card button[style*="3b82f6"]');
  return bt ? bt.textContent.trim() : '(파란 시작 단추 없음)';
});
판('⑤ 카드가 「▶ 시작」 으로 돌아간다', 카드꼴 === '▶ 시작', 카드꼴);
await p.screenshot({ path: 그림칸 + '/work-375-취소뒤.png' });

// ⑥ 다시 시작 → 쌓인분이 살아 있고, 완료하면 합쳐진다
await 톡('#__무대 .wo-boring-placed-card button[style*="3b82f6"]');
const 다시시작 = (await 기록()).시작;
판('⑥ 다시 시작해도 쌓인분은 살아 있다', 다시시작 && 다시시작.쌓인분 === 취소뒤.시작.쌓인분,
   '쌓인분 ' + (다시시작 || {}).쌓인분);
await 시간되돌리기(4);
await p.waitForTimeout(1200);          // 시계는 1초마다 다시 적는다 — 한 번 돌기를 기다린다
const 합계글 = await 시계글();
판('⑥ 집중 창 시계가 쌓인분 + 이번 분을 보여 준다',
   parseFloat(합계글) >= 다시시작.쌓인분 + 3.5, '쌓인분 ' + 다시시작.쌓인분 + ' + 4분 → ' + 합계글);

// ⑧ 쌓인분 없는 옛 기록은 예전과 똑같다 — 셈만 떼어 잰다
const 셈 = await p.evaluate(() => {
  const 옛 = { started: true, startMs: Date.now() - 7 * 60000, date: '2026-09-15', partName: '가와' };
  const 새 = { started: true, startMs: Date.now() - 4 * 60000, date: '2026-09-15', partName: '가와', 쌓인분: 6.5 };
  const 무름 = { started: false, startMs: null, date: '2026-09-15', partName: '가와', 쌓인분: 9.3 };
  return { 옛: _일한분(옛), 새: _일한분(새), 무름: _일한분(무름),
           빈것: _일한분({ started: true }), 없음: _일한분(null),
           시작됐나: { 옛: _공정시작됨(옛), 무름: _공정시작됨(무름), 없음: _공정시작됨(null) } };
});
console.log('■ 셈만 떼어 재 봄: ' + JSON.stringify(셈));
판('⑧ 쌓인분 없는 옛 기록은 흐른 분 그대로 (예전과 같다)', Math.abs(셈.옛 - 7) < 0.2, 셈.옛 + '분');
판('⑧ 쌓인분이 있으면 더해서 낸다', Math.abs(셈.새 - 10.5) < 0.2, '6.5 + 4 → ' + 셈.새 + '분');
판('⑧ 무른 자리(startMs 없음)는 쌓인분만 낸다', Math.abs(셈.무름 - 9.3) < 0.05, 셈.무름 + '분');
판('⑧ 잴 것이 없으면 예전처럼 null', 셈.빈것 === null && 셈.없음 === null, JSON.stringify([셈.빈것, 셈.없음]));
판('⑧ 무른 자리는 「시작 안 함」 으로 본다 (옛 기록은 시작으로 본다)',
   셈.시작됐나.옛 === true && 셈.시작됐나.무름 === false && 셈.시작됐나.없음 === false,
   JSON.stringify(셈.시작됐나));

// ⑦ 취소를 세 번 해도 계속 쌓인다 — 셈으로 잰다(화면과 안 얽히게)
const 세번 = await p.evaluate(() => {
  let rec = { started: true, startMs: Date.now() - 2 * 60000, date: '2026-09-15', partName: '가와' };
  const 무르기 = () => { const 쌓 = Math.round((_쌓인분(rec) + _흐른분(rec)) * 10) / 10;
    rec = { started: false, startMs: null, date: rec.date, partName: rec.partName, 쌓인분: 쌓, 멈춤: false }; return 쌓; };
  const 다시 = 분 => { rec = Object.assign({}, rec, { started: true, startMs: Date.now() - 분 * 60000, 멈춤: false }); };
  const 걸음 = [];
  걸음.push(무르기());           // 2분 쌓임
  다시(3); 걸음.push(무르기());   // +3 = 5
  다시(4); 걸음.push(무르기());   // +4 = 9
  다시(1.5);
  return { 걸음, 끝: _일한분(rec) };
});
console.log('■ 세 번 무르고 다시: ' + JSON.stringify(세번));
판('⑦ 무를 때마다 쌓인다 (2 → 5 → 9)', JSON.stringify(세번.걸음) === JSON.stringify([2, 5, 9]), JSON.stringify(세번.걸음));
판('⑦ 세 번 무른 뒤 완료하면 다 더해진다 (9 + 1.5 = 10.5)', Math.abs(세번.끝 - 10.5) < 0.2, 세번.끝 + '분');

// ③ 새로고침 — 붙잡고 있던 일이 되살아난다
const 되살림 = await p.evaluate(() => {
  window._집중판닫기();                      // 새로고침한 셈 치고 창을 없앤다
  const 전 = !!document.getElementById('_집중판');
  window._집중판다시();                      // 발주 소식이 올 때 부르는 그것
  const g = document.getElementById('_집중시계글');
  return { 지운뒤: 전, 되살아남: !!document.getElementById('_집중판'), 시계: g ? g.textContent : null };
});
console.log('■ 새로고침 흉내: ' + JSON.stringify(되살림));
판('③ 새로고침해도 집중 창이 되살아난다', 되살림.지운뒤 === false && 되살림.되살아남 === true, JSON.stringify(되살림));
판('③ 되살아난 창의 시간이 이어진다', parseFloat(되살림.시계) >= 다시시작.쌓인분,
   '쌓인분 ' + 다시시작.쌓인분 + ' → ' + 되살림.시계);
await p.screenshot({ path: 그림칸 + '/work-375-집중.png' });

// ⑥-끝 완료 → actualMinutes 가 합쳐진 값
await p.evaluate(() => { window.tl일완료(); });
await p.waitForTimeout(500);
const 완료판 = await p.evaluate(() => {
  const 칸 = document.querySelector('#part-done-qty, input[type="number"]');
  const 단 = [...document.querySelectorAll('button')].find(b => /등록|완료 등록|확인/.test(b.textContent));
  return { 팝업: !!document.querySelector('[id*="done"], .swal2-container, #part-done-popup'), 단추: !!단 };
});
const 완료값 = await p.evaluate(() => {
  // 완료 팝업이 무엇을 적든, 적히는 분은 _일한분 이 낸다 — 그 값을 그대로 잰다
  const o = confirmedOrders.find(x => x.docId === 'd1');
  const rec = o.partStarted['CUT_1']['재단'];
  return { 쌓인분: _쌓인분(rec), 흐른분: _흐른분(rec), 적힐분: _일한분(rec) };
});
console.log('■ 완료 때 적힐 분: ' + JSON.stringify(완료값));
판('⑥ 완료에 적힐 분 = 쌓인분 + 이번 분',
   Math.abs(완료값.적힐분 - (완료값.쌓인분 + 완료값.흐른분)) < 0.05,
   완료값.쌓인분 + ' + ' + 완료값.흐른분 + ' = ' + 완료값.적힐분);

// ── 세 군데 다 같은 길로 간다 — 타임라인 줄 · 작업 카드(풀) · 보드에 놓인 카드
const 세군데 = await (async () => {
  const 글 = await (await fetch(URL)).text();
  const 수 = (글.match(/tlMarkPartStarted\(/g) || []).length;
  const 카드둘 = await p.evaluate(() => {
    const 있나 = f => typeof f === 'function' && /tlMarkPartStarted/.test(String(f));
    return { 놓인카드: 있나(_woPlacedCardHtml), 작업카드: 있나(_woCardHtml) };
  });
  return Object.assign({ 부르는자리수: 수 }, 카드둘);
})();
console.log('■ ▶ 시작을 그리는 자리: ' + JSON.stringify(세군데));
판('▶ 시작을 그리는 자리가 셋이고 다 tlMarkPartStarted 를 부른다',
   세군데.부르는자리수 === 3 && 세군데.놓인카드 && 세군데.작업카드, JSON.stringify(세군데));
// 풀 카드(아직 기계에 안 놓인 카드)에서도 집중 창이 뜬다
const 풀에서 = await p.evaluate(async () => {
  window._집중판닫기();
  const o = confirmedOrders.find(x => x.docId === 'd2');
  o.partStarted = {}; o.partCompletions = {};
  const o1 = confirmedOrders.find(x => x.docId === 'd1');
  o1.partStarted = {}; o1.partCompletions = {};      // 붙잡은 일을 놓는다
  const 칸 = document.getElementById('__무대');
  칸.innerHTML = _woCardHtml(window.__한장(2), window.__sk);
  const bt = 칸.querySelector('button[style*="3b82f6"]');
  if (!bt) return '시작 단추 없음';
  bt.click();
  await new Promise(r => setTimeout(r, 400));
  return document.getElementById('_집중판') ? '집중 창 뜸' : '안 뜸';
});
판('작업 카드(아직 안 놓인 카드)에서 시작해도 집중 창이 뜬다', 풀에서 === '집중 창 뜸', 풀에서);

판('파이어스토어에 쓴 것은 partStarted 뿐이다 (발주 내용·재단계획 안 건드림)',
   (await p.evaluate(() => window.__쓴것.every(x => Object.keys(x.값).every(k => /^partStarted\./.test(k))))) === true,
   JSON.stringify(await p.evaluate(() => window.__쓴것.map(x => Object.keys(x.값)[0]))));
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
console.log(실패 === 0 ? 'worktime1   OK' : 'worktime1   FAIL (' + 실패 + ')');
await b.close(); process.exit(실패 === 0 ? 0 : 1);
