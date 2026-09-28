// 불량보고 — 집중 창과 공정카드에서 올리고, 불량보고 판에서 찾는다.
// 사장님 지시(09-28 04:02): 「작업중 발견된 불량을 보고할 수 있는 버튼을 이 팝업창
//   그리고 각 공정카드에 만들어 주세요. 불량보고는 사진촬영 업로드 테스트 설명 등으로
//   보고 할 수 있으며 각 발주번호별 - 상품명별 - 부속카드별 차후 검색 할 수 있도록
//   불량보고 페이지를 에이엠티 메인 메뉴에 만들어 주세요. 불량 보고는 실시간으로
//   이루어져하 하므로 불량 보고로 인한 작업중 팝업화면의 변동이 있으면 안됩니다.」
// 제일 중요한 것 — 보고해도 작업 창이 안 흔들리고 시계가 안 끊긴다.
import { 브라우저열기, devices, 서버, 자재, 그림칸 as 그림칸자리 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const 그림칸 = 그림칸자리();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const URL = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
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
p.on('dialog', d => d.accept());
await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1500);

// 파이어스토어·저장소를 흉내 낸다 — 진짜에는 한 줄도 안 쓴다
await p.evaluate(() => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장','발주','도면','차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.__올린것 = []; window.__사진올림 = []; window.__구독 = null;
  const 쓰기 = async (ref, 값) => {
    Object.entries(값).forEach(([길, v]) => {
      const 토막 = 길.split('.'); const o = confirmedOrders.find(x => x.docId === ref.id);
      if (!o) return; let 자리 = o;
      토막.slice(0, -1).forEach(t => { 자리[t] = 자리[t] || {}; 자리 = 자리[t]; });
      자리[토막[토막.length - 1]] = v; }); };
  window.db = {}; window.storage = {};
  window.fbFirestore = {
    doc: (db, ...a) => ({ p: a.join('/'), id: a[a.length - 1] }),
    updateDoc: async (ref, 값) => {
      const 것 = window.__올린것.find(x => x.id === ref.id);
      if (것) { Object.assign(것, 값); 알림(); return; }
      return 쓰기(ref, 값);
    },
    setDoc: async () => {}, deleteDoc: async () => {},
    addDoc: async (col, 줄) => { const id = 'r' + (window.__올린것.length + 1);
      window.__올린것.push(Object.assign({ id }, 줄)); 알림(); return { id }; },
    collection: (db, ...a) => ({ p: a.join('/') }),
    onSnapshot: (col, cb) => { if (col && /defect_reports/.test(col.p || '')) { window.__구독 = cb; 알림(); } },
    query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  window.fbStorage = {
    ref: (st, 길) => ({ 길 }),
    uploadBytes: async (자리, f) => { window.__사진올림.push({ 길: 자리.길, 이름: f.name, 크기: f.size }); },
    getDownloadURL: async (자리) => 'https://example.invalid/' + encodeURIComponent(자리.길) };
  function 알림(){ if (window.__구독) window.__구독({ forEach: fn => window.__올린것.forEach(r =>
    fn({ id: r.id, data: () => r })) }); }
  const sk = '2026-09-15-재단';
  confirmedOrders.length = 0;
  confirmedOrders.push({ idNum: 1401, docId: 'd1', orderCode: '샘플-20260101-01',
    displayName: '(본)본보기 오픈장 1', orderQty: 50, amtTimeline: true,
    partInfoMap: {}, partCompletions: {}, partStarted: {}, deliveryDate: '2026-09-15' });
  const 한장 = { cKey: 'CUT_1', nm: '가와1', pm: 8, dq: 50, orderCode: '샘플-20260101-01',
    orderKey: 'd1', orderName: '(본)본보기 오픈장 1', plateName: 'PB-18T', coating: '양면',
    finish: '화이트', rw: 480, rd: 1015, isCuttingCard: true, sheets: 5, perSheet: 4,
    orderIdNum: 1401, pRowIndex: 11, boardW: 2440, boardH: 1220,
    boardParts: [{ lp: 0, tp: 0, wp: .2, hp: .83, bg: '#f5f5f4', dw: '480', dh: '1015' }],
    coveredOrderIds: [1401] };
  window.__sk = sk;
  window._woBoringParts[sk] = [한장];
  window._woBoring[sk] = { pool: [], AMT: ['CUT_1'] };
  const 칸 = document.createElement('div');
  칸.id = '__무대'; 칸.className = 'wo-boring-mac-col';
  칸.style.cssText = 'position:fixed;left:0;top:0;width:375px;z-index:99999;background:#fff;padding:8px;box-sizing:border-box;';
  칸.innerHTML = _woPlacedCardHtml(한장, 'CUT_1', sk, 'AMT', _woGetOrderColorMap(sk), '');
  document.body.appendChild(칸);
});
await p.waitForTimeout(400);

const cdp = await ctx.newCDPSession(p);
const 짚기 = async (r, ms = 110) => {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.y, radiusX: 14, radiusY: 14, force: 1 }] });
  await p.waitForTimeout(ms);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(450);
};
const 톡 = async (sel) => {
  const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null;
    const b = e.getBoundingClientRect();
    return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) }; }, sel);
  if (!r) { console.log('   !! 못 집음: ' + sel); return false; }
  await 짚기(r); return true;
};

// ① 공정카드에 불량 단추가 있다 — 진짜로 눌러 보고 창을 연다
const 카드단추 = await p.evaluate(() => {
  const e = document.querySelector('#__무대 .wo-boring-placed-card .wo-불량');
  if (!e) return null; const r = e.getBoundingClientRect();
  const a = e.getBoundingClientRect(), cs = getComputedStyle(e, '::after');
  return { 글: e.textContent.trim(), 높이: Math.round(r.height), 닿는높이: parseFloat(cs.height) || 0 };
});
console.log('① 카드 불량 단추 : ' + JSON.stringify(카드단추));
판('① 공정카드에 불량 단추가 있다', !!카드단추 && 카드단추.글 === '불량', JSON.stringify(카드단추));
판('① 닿는 자리가 44px 이상', !!카드단추 && 카드단추.닿는높이 >= 44, (카드단추 ? 카드단추.닿는높이 : 0) + 'px');
await 톡('#__무대 .wo-boring-placed-card .wo-불량');
판('① 카드의 불량 단추를 누르면 보고 창이 뜬다',
   (await p.evaluate(() => !!document.getElementById('_불량판'))) === true, '뜸');

// ② 사진 없이 글만으로도 올라간다
await p.evaluate(() => { document.getElementById('_불량글').value = '모서리 깨짐'; });
await 톡('#_불량보냄');
const ㄱ = await p.evaluate(() => ({ 올린수: window.__올린것.length, 첫줄: window.__올린것[0] || null,
  창닫힘: !document.getElementById('_불량판') }));
console.log('② 글만 보고 : ' + JSON.stringify(ㄱ.첫줄));
판('② 사진 없이 글만으로도 올라간다', ㄱ.올린수 === 1 && ㄱ.첫줄.글 === '모서리 깨짐', JSON.stringify(ㄱ.첫줄));
판('② 발주번호·상품명·부속·공정·날짜가 다 붙는다',
   ㄱ.첫줄.발주번호 === 1401 && ㄱ.첫줄.상품명 === '(본)본보기 오픈장 1'
   && ㄱ.첫줄.부속명 === '가와1' && ㄱ.첫줄.공정 === '재단' && /^\d{4}-\d{2}-\d{2}$/.test(ㄱ.첫줄.날),
   [ㄱ.첫줄.발주번호, ㄱ.첫줄.상품명, ㄱ.첫줄.부속명, ㄱ.첫줄.공정, ㄱ.첫줄.날].join(' · '));
판('② 보내면 창이 닫힌다', ㄱ.창닫힘 === true, String(ㄱ.창닫힘));
판('② 업무 기록(partStarted·partCompletions)은 안 건드린다',
   (await p.evaluate(() => JSON.stringify(confirmedOrders[0].partStarted) + JSON.stringify(confirmedOrders[0].partCompletions))) === '{}{}',
   '그대로');

// ③ 작업 중에 보고해도 작업 창이 안 흔들린다 — 제일 중요한 대목
await 톡('#__무대 .wo-boring-placed-card button[style*="3b82f6"]');   // ▶ 시작
await p.evaluate(() => { window.__판노드 = document.getElementById('_집중판');
                         window.__시계노드 = document.getElementById('_집중시계글'); });
const 시계1 = await p.evaluate(() => document.getElementById('_집중시계글').textContent);
await 톡('#_집중불량');
const ㄴ = await p.evaluate(() => ({
  보고창: !!document.getElementById('_불량판'),
  작업창: !!document.getElementById('_집중판'),
  같은창: window.__판노드 === document.getElementById('_집중판'),
  같은시계: window.__시계노드 === document.getElementById('_집중시계글'),
  시계: document.getElementById('_집중시계글').textContent,
  붙든일: !!_집중찾기() }));
console.log('③ 작업 중 보고 : ' + JSON.stringify(ㄴ));
판('③ 집중 창에서 불량 단추를 누르면 보고 창이 그 위에 뜬다', ㄴ.보고창 === true && ㄴ.작업창 === true, JSON.stringify(ㄴ));
판('③ 작업 창이 다시 그려지지 않는다 (같은 노드 그대로)', ㄴ.같은창 === true && ㄴ.같은시계 === true, JSON.stringify(ㄴ));
판('③ 시계가 끊기지 않는다', parseFloat(ㄴ.시계.split(':')[1] || '0') >= parseFloat(시계1.split(':')[1] || '0'),
   시계1 + ' → ' + ㄴ.시계);
await p.screenshot({ path: 그림칸 + '/defect-375-보고창.png' });

// ④ 사진을 붙여 보낸다 — 사진은 저장소로, 파이어스토어에는 주소만
await p.setInputFiles('#_불량파일', { name: '깨짐.png', mimeType: 'image/png',
  buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64') });
await p.waitForTimeout(400);
await p.evaluate(() => { document.getElementById('_불량글').value = '엣지 들뜸'; });
await 톡('#_불량보냄');
await p.waitForTimeout(700);
const ㄷ = await p.evaluate(() => ({ 올린수: window.__올린것.length,
  둘째: window.__올린것.find(r => r.글 === '엣지 들뜸') || null,
  사진올림: window.__사진올림, 작업창: !!document.getElementById('_집중판'),
  붙든일: !!_집중찾기() }));
console.log('④ 사진 보고 : ' + JSON.stringify(ㄷ));
판('④ 사진을 붙여도 올라간다', ㄷ.올린수 === 2 && !!ㄷ.둘째, JSON.stringify(ㄷ.둘째 && ㄷ.둘째.글));
판('④ 사진은 저장소로 가고 주소만 적힌다',
   ㄷ.사진올림.length === 1 && /^defect_photos\//.test(ㄷ.사진올림[0].길)
   && (ㄷ.둘째.사진 || []).length === 1 && /^https:/.test((ㄷ.둘째.사진[0] || {}).주소),
   JSON.stringify(ㄷ.사진올림) + ' → ' + JSON.stringify(ㄷ.둘째.사진));
판('④ 사진을 올려도 작업 창과 붙든 일은 그대로다', ㄷ.작업창 === true && ㄷ.붙든일 === true, JSON.stringify([ㄷ.작업창, ㄷ.붙든일]));

// ⑤ 불량보고 판 — 첫 화면에서 열고 찾는다
await 톡('#_집중취소');
await p.waitForTimeout(400);
await p.evaluate(() => { document.getElementById('__무대')?.remove(); amtGoHome(); });
await p.waitForTimeout(300);
await 톡('button.amth-row[onclick="amtOpenDefect()"]');
const ㄹ = await p.evaluate(() => ({
  열림: document.documentElement.getAttribute('data-amtdefect') === '1',
  줄수: document.querySelectorAll('#amd-list .amd-줄').length,
  글: (document.getElementById('amd-list').textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
  셈: (document.getElementById('amd-sub') || {}).textContent }));
console.log('⑤ 불량보고 판 : ' + JSON.stringify(ㄹ));
판('⑤ 첫 화면에서 불량보고 판이 열린다', ㄹ.열림 === true, String(ㄹ.열림));
판('⑤ 올린 보고 둘이 다 보인다', ㄹ.줄수 === 2, ㄹ.줄수 + '줄 · ' + ㄹ.셈);
await p.screenshot({ path: 그림칸 + '/defect-375-보고판.png' });

for (const [찾을것, 바람] of [['1401', 2], ['가와1', 2], ['엣지 들뜸', 1], ['없는말', 0]]) {
  await p.fill('#amd-find', 찾을것);
  await p.waitForTimeout(250);
  const 수 = await p.evaluate(() => document.querySelectorAll('#amd-list .amd-줄').length);
  판('⑤ 「' + 찾을것 + '」 로 찾으면 ' + 바람 + '줄', 수 === 바람, 수 + '줄');
}

판('375px 가로 스크롤 없다', (await p.evaluate(() => document.documentElement.scrollWidth)) <= 375, '375px');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
console.log(실패 === 0 ? 'defect1   OK' : 'defect1   FAIL (' + 실패 + ')');
await b.close(); process.exit(실패 === 0 ? 0 : 1);
