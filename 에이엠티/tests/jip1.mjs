// 짚어서 지시(viggle 0.5초)가 가려지지 않는가 — 사장님 말씀(10-02)
// 「새로 생성되는 객체들에 짚어서 지시하기 기능을 빼먹고 있는거 같네요」
// 진짜 손가락 0.7초로 누르고, 지시 창이 뜨는지로만 가린다. 아무것도 안 보낸다.
// 지킬 것: 옮길 수 있는 카드 위에서는 옮기기가 이긴다(09-23 지시) · 보통 화면에서는
// 박스를 길게 눌러 고치는 길이 그대로다.
import { 브라우저열기, devices, 서버, 자재 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const B = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const b = await 브라우저열기();
let 실패 = 0; const 판 = (n, t, v) => { if (!t) 실패++; console.log((t ? '  OK  ' : '  FAIL') + '  ' + n + '   → ' + v); };
const 나간쓰기 = [];

const 차림 = async (꼬리) => {
  const ctx = await b.newContext({ ...devices['iPhone 12'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  await ctx.route('https://cdn.tailwindcss.com*', r => r.fulfill({ status: 200, contentType: 'application/javascript',
    body: 'document.write(' + JSON.stringify('<style>' + CSS + '</style>') + ');' }));
  for (const [무늬, 길] of [['https://cdn.sheetjs.com/**', 'node_modules/xlsx/dist/xlsx.full.min.js'],
                            ['https://cdn.jsdelivr.net/npm/sortablejs**', 'node_modules/sortablejs/Sortable.min.js'],
                            ['https://cdn.jsdelivr.net/npm/gsap**', 'node_modules/gsap/dist/gsap.min.js']])
    await ctx.route(무늬, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: readFileSync(HERE + '/' + 길, 'utf-8') }));
  // 지시는 한 줄도 나가면 안 된다 — 그물에서 막고 무엇을 보내려 했는지만 적는다
  await ctx.route('**/firestore.googleapis.com/**', r => {
    const q = r.request();
    if (q.method() === 'GET') return r.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    나간쓰기.push(q.method() + ' ' + q.url().split('?')[0]); return r.abort();
  });
  await ctx.route('**/identitytoolkit.googleapis.com/**', r =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ idToken: '가짜' }) }));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(B + 꼬리, { waitUntil: 'load' }); await p.waitForTimeout(1500);
  await p.evaluate(() => {
    document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
    ['원장', '발주', '도면', '차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
    window.db = {}; window.storage = {};
    window.fbFirestore = { doc: (db, ...a) => ({ p: a.join('/'), id: a[a.length - 1] }),
      updateDoc: async () => {}, setDoc: async () => {}, deleteDoc: async () => {}, addDoc: async () => ({ id: 'x' }),
      collection: () => ({}), query: x => x, serverTimestamp: () => 0,
      onSnapshot: (ref, cb) => { try { cb({ forEach: f => f({ id: '박스1',
        data: () => ({ name: '재단발주·도면', icon: 'scissors', tone: 'slate', at: 1, 곳: 'home' }) }) }); } catch (e) {} },
      getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
    try { window.amtBoxSync && window.amtBoxSync(); } catch (e) {}
  });
  await p.waitForTimeout(700);
  const cdp = await ctx.newCDPSession(p);
  return { ctx, p, cdp, errs };
};

// 0.7초 진짜 손가락. 누른 채로 무엇이 떴는지 보고, 뗀 뒤 치운다.
const 길게누르기 = async ({ p, cdp }, sel) => {
  const r = await p.evaluate(s => {
    const e = document.querySelector(s); if (!e) return null;
    e.scrollIntoView({ block: 'center' });
    const q = e.getBoundingClientRect();
    if (q.width < 2 || q.height < 2) return null;
    const x = Math.round(q.x + Math.min(q.width / 2, 40)), y = Math.round(q.y + q.height / 2);
    if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return null;
    const 위 = document.elementFromPoint(x, y);
    return { x, y, 맞나: !!(위 && (위 === e || e.contains(위) || 위.contains(e))) };
  }, sel);
  if (!r) return { 자리없음: true };
  await p.waitForTimeout(250);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.y, radiusX: 14, radiusY: 14, force: 1 }] });
  await p.waitForTimeout(700);
  const 본것 = await p.evaluate(() => ({
    지시창: !!document.querySelector('.vg-sheet'),
    짚은글: (document.querySelector('.vg-sheet') || {}).textContent
      ? document.querySelector('.vg-sheet').textContent.replace(/\s+/g, ' ').trim().slice(0, 30) : '',
    박스판: document.documentElement.getAttribute('data-amtb') === '1',
    카드잡힘: !!window._woMove }));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(250);
  await p.evaluate(() => {
    document.querySelector('.vg-sheet')?.remove();
    document.querySelectorAll('.vg-mark').forEach(e => e.classList.remove('vg-mark'));
    try { window.amtBoxClose && window.amtBoxClose(); } catch (e) {}
  });
  await p.waitForTimeout(150);
  return { ...본것, 맞나: r.맞나 };
};

const 무대세우기 = (p) => p.evaluate(() => {
  const sk = '2026-10-02-재단';
  const 조각 = [{ lp: 0, tp: 0, wp: .33, hp: .66, bg: '#ffffff', dw: '800', dh: '800' },
                { lp: .34, tp: 0, wp: .33, hp: .66, bg: '#ffffff', dw: '800', dh: '800' }];
  const 한장 = { cKey: 'CUT_1', nm: '도어', pm: 8, dq: 44, orderCode: '조혼-20261002-01', orderKey: 'd1',
    orderName: '(KRW) 알렉스 800 높은 수납장 올화이트', plateName: 'PB-18T', coating: '양면', finish: '화이트',
    rw: 800, rd: 800, isCuttingCard: true, sheets: 5, perSheet: 2, orderIdNum: 1401, pRowIndex: 11,
    boardW: 2440, boardH: 1220, boardParts: 조각, coveredOrderIds: [1401] };
  confirmedOrders.length = 0;
  confirmedOrders.push({ idNum: 1401, docId: 'd1', orderCode: '조혼-20261002-01',
    displayName: '(KRW) 알렉스 800 높은 수납장 올화이트', orderQty: 44, amtTimeline: true,
    partInfoMap: {}, partStarted: {}, partCompletions: {}, deliveryDate: '2026-10-30' });
  window._woBoringParts[sk] = [한장];
  window._woBoring[sk] = { pool: [], AMT: ['CUT_1'] };
  const 무대 = document.createElement('div');
  무대.id = '__무대'; 무대.className = 'wo-boring-mac-col';
  무대.style.cssText = 'position:fixed;left:0;top:200px;right:0;z-index:9000;background:#f6f7f9;padding:10px;box-sizing:border-box;';
  무대.innerHTML = _woPlacedCardHtml(한장, 'CUT_1', sk, 'AMT', _woGetOrderColorMap(sk), '');
  document.body.appendChild(무대);
});

// ── ① 짚는 화면 (?viggle=1)
const ㄱ = await 차림('?viggle=1');
const 박스 = await 길게누르기(ㄱ, '#amth-mine [data-amtb-id]');
console.log('■ 박스 타일: ' + JSON.stringify(박스));
판('① 박스 타일을 짚으면 지시 창이 뜬다', 박스.지시창 === true && /재단발주/.test(박스.짚은글 || ''),
   JSON.stringify(박스));
판('① 그 위로 「박스 고치기」 판이 겹쳐 뜨지 않는다 (둘 다 0.5초라 겹쳤다)',
   박스.박스판 === false, '박스 고치기 판 ' + 박스.박스판);

await 무대세우기(ㄱ.p);
const 볼것 = [
  ['공정카드 — 편집 단추', '#__무대 .wo-cut-편집', true],
  ['공정카드 — 시작 단추', '#__무대 .woc-단추', true],
  ['공정카드 — 불량보고 단추', '#__무대 .woc-줄 button', true],
  ['공정카드 — 부속 그림', '#__무대 .woc-부속 svg', false],
  ['공정카드 — 재단배치도', '#__무대 .woc-그림 svg', false],
  ['공정카드 — 이름', '#__무대 .woc-이름', false],
];
const 잰표 = [];
for (const [이름, sel, 되어야] of 볼것) {
  const v = await 길게누르기(ㄱ, sel);
  잰표.push([이름, v.지시창, v.카드잡힘]);
  console.log('  ' + (v.지시창 ? '○' : '✕') + '  ' + 이름 + '   ' + JSON.stringify(v));
  판((되어야 ? '② ' : '③ ') + 이름 + (되어야 ? ' — 지시 창이 뜬다' : ' — 옮기기가 이긴다 (09-23 그대로)'),
     v.지시창 === 되어야 && (되어야 ? true : v.카드잡힘 === true),
     '지시창 ' + v.지시창 + ' · 카드잡힘 ' + v.카드잡힘);
}
판('페이지오류 없음 (짚는 화면)', ㄱ.errs.length === 0, String(ㄱ.errs.length));
await ㄱ.ctx.close();

// ── ② 보통 화면 (?viggle 없음) — 박스를 길게 눌러 고치는 길은 그대로다
const ㄴ = await 차림('');
const 보통 = await 길게누르기(ㄴ, '#amth-mine [data-amtb-id]');
console.log('■ 보통 화면 박스 타일: ' + JSON.stringify(보통));
판('④ 보통 화면에서는 길게 누르면 「박스 고치기」 가 그대로 열린다',
   보통.박스판 === true && 보통.지시창 === false, JSON.stringify(보통));
판('페이지오류 없음 (보통 화면)', ㄴ.errs.length === 0, String(ㄴ.errs.length));
await ㄴ.ctx.close();

판('파이어스토어로 나간 쓰기 0건', 나간쓰기.length === 0, 나간쓰기.length + '건' + (나간쓰기[0] ? ' :: ' + 나간쓰기[0] : ''));

await b.close();
console.log(실패 === 0 ? 'jip1   OK' : 'jip1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
