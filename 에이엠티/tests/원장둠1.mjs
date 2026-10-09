// 「에이엠티 - 새로고침시 기존데이터를 잘 불러오지 못해 몇번씩 새로고침 해야만 데이터를
//  불러오고 있다 문제가 뭐야」 「새로고침후 데이터가 도착하는 시간지연이 점점 길어지는
//  느낌이 들어서…」 — 사장님 말씀 (10-09)
// 1단계: 원장 엑셀을 **바뀐 때만** 받는다. excel_metadata 가 가리키는 파일을 열쇠로
// 삼아 푼 결과를 폰(IndexedDB)에 두고, 열쇠가 같으면 창고에 안 간다.
// 여기서 재는 것 — ① 처음엔 받아서 푼다 ② 두 번째엔 **안 받는다** ③ 새 원장을 올리면
// **반드시 새것을 받는다**(제일 큰 사고를 막는 자리) ④ 둔 것이 깨지면 전처럼 받는다
// ⑤ 두 길 모두에서 _자료왔다('원장') 가 불린다.
import { 브라우저열기, devices, 서버, 자재, 본보기 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const HERE = await 자재();
const require = createRequire(HERE + '/package.json');
const XLSX = require('xlsx');
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const URL = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';

// 보기 원장 둘 — 줄 수가 달라야 「새것을 받았다」 를 숫자로 가를 수 있다
const 머리 = ['ing단품명','ing발주처','대분류','중분류','소분류','상품색상','부속명','재단W','재단D','공급처'];
const 원장만들기 = (줄수, 꼬리) => {
  const aoa = [머리];
  for (let i = 1; i <= 줄수; i++)
    aoa.push(['단품' + i, '조혼가구', '수납장', '높은', '1200', '화이트', '가와' + 꼬리, 748, 400, 'AMT']);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), '원장');
  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
};
/* 「가」 는 **진짜 원장만 한 크기**로 만든다(본보기 원장 그대로 1398줄 × 60칸) —
   받아서 푸는 데 걸리는 시간을 진짜에 가깝게 재야 고침이 얼마나 득인지 알 수 있다. */
const 본장 = await 본보기('원장');
const 가 = (() => {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(본장), '원장');
  return { 줄: 본장.length, 바이트: Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })),
           첫부속: 본장[1][본장[0].indexOf('부속명')] };
})();
const 나 = { 줄: 21, 바이트: 원장만들기(20, 'B'), 첫부속: '가와B' };

const b = await 브라우저열기();
let 실패 = 0; const 판 = (n, t, v) => { if (!t) 실패++; console.log((t ? '  OK  ' : '  FAIL') + '  ' + n + '   → ' + v); };
const ctx = await b.newContext({ ...devices['iPhone 12'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
await ctx.route('https://cdn.tailwindcss.com*', r => r.fulfill({ status: 200, contentType: 'application/javascript',
  body: 'document.write(' + JSON.stringify('<style>' + CSS + '</style>') + ');' }));
await ctx.route('https://cdn.sheetjs.com/**', r => r.fulfill({ status: 200, contentType: 'application/javascript',
  body: readFileSync(HERE + '/node_modules/xlsx/dist/xlsx.full.min.js', 'utf-8') }));
let 받은수 = 0, 받은것 = [];
await ctx.route('https://example.invalid/**', r => {
  const u = r.request().url(); 받은수++; 받은것.push(u.split('/').pop());
  r.fulfill({ status: 200, contentType: 'application/octet-stream',
    body: /B\.xlsx/.test(u) ? 나.바이트 : 가.바이트 });
});
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));

const 메타 = (이름, 때) => ({ fileName: 이름, storagePath: 'artifacts/vivivic-4b7ef/excel_files/' + 이름,
  downloadURL: 'https://example.invalid/' + 이름, timestamp: { seconds: 때 } });

/* 한 번 「새로 열기」 — 판을 새로 읽고(둔 것은 남는다) 듣기를 걸어 원장을 들인다 */
const 열기 = async (메타값) => {
  받은수 = 0; 받은것 = [];
  await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(900);
  const 잰 = await p.evaluate(async (m) => {
    document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
    window.__쓰기 = 0; const 셈 = () => async () => { window.__쓰기++; };
    window.db = {}; window.storage = {};
    window.fbFirestore = { doc: () => ({}), updateDoc: 셈(), setDoc: 셈(), deleteDoc: 셈(), addDoc: 셈(),
      collection: () => ({}), query: x => x, serverTimestamp: () => 0,
      onSnapshot: (ref, cb) => { cb({ docs: [{ data: () => m }] }); },
      getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
    const 잰때 = performance.now();
    initCloudDataSync();
    // 원장이 들어올 때까지 기다린다 (최대 5초)
    for (let i = 0; i < 2000 && !window._자료옴['원장']; i++) await new Promise(r => setTimeout(r, 5));
    return { ms: Math.round(performance.now() - 잰때), 줄: currentFullData.length,
             원장왔나: !!window._자료옴['원장'], 쓰기: window.__쓰기,
             첫부속: (() => { const h = currentFullData[0] || [];
               const i = h.indexOf('부속명'); return i < 0 ? '' : ((currentFullData[1] || [])[i] || ''); })() };
  }, 메타값);
  return { ...잰, 받은수, 받은것: 받은것.slice() };
};

// 둔 것을 지우고 시작한다
await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(500);
await p.evaluate(() => new Promise(r => { const q = indexedDB.deleteDatabase('amt원장'); q.onsuccess = q.onerror = q.onblocked = () => r(); }));

const 메타가 = 메타('A.xlsx', 1700000000);
/* 두는 것(IndexedDB put)은 화면을 막지 않으려고 **기다리지 않고** 건다.
   그래서 받자마자 바로 새로 열면 두는 일이 끝나기 전일 수 있다(그때는 다음 번에
   또 받을 뿐 탈은 없다). 시험은 그 경주를 피해 **다 두어진 것을 보고** 다음으로 간다. */
const 둔것기다리기 = async (바라는열쇠) => {
  for (let i = 0; i < 100; i++) {
    const 있나 = await p.evaluate(async (k) => {
      try { const 둔 = await _원장둔것(); return !!(둔 && 둔.열쇠 === k && Array.isArray(둔.줄)); }
      catch (e) { return false; }
    }, 바라는열쇠);
    if (있나) return true;
    await p.waitForTimeout(50);
  }
  return false;
};
const 열쇠가 = [메타가.storagePath, 메타가.fileName, String(메타가.timestamp.seconds)].join('|');
const 처음 = await 열기(메타가);
판('① 받은 것을 폰에 둔다', await 둔것기다리기(열쇠가), '열쇠 ' + 열쇠가);
console.log('■ 처음 열기(둔 것 없음): ' + JSON.stringify(처음));
판('① 처음 열 때는 창고에서 받아 푼다 (줄 수가 그대로다)',
   처음.받은수 === 1 && 처음.줄 === 가.줄 && 처음.원장왔나 === true && 처음.첫부속 === 가.첫부속,
   '받음 ' + 처음.받은수 + '번 · ' + 처음.줄 + '줄 (바라는 ' + 가.줄 + ') · 원장왔다 ' + 처음.원장왔나);

const 두번째 = await 열기(메타가);
console.log('■ 두 번째 열기(둔 것 있음): ' + JSON.stringify(두번째));
판('② 두 번째는 창고에서 **안 받는다** (fetch·getBytes 0번)',
   두번째.받은수 === 0, '받음 ' + 두번째.받은수 + '번 · ' + 두번째.ms + 'ms');
판('② 둔 것으로도 줄 수가 같다', 두번째.줄 === 가.줄 && 두번째.첫부속 === 가.첫부속,
   두번째.줄 + '줄 · 첫 부속 ' + 두번째.첫부속);
판('② 전보다 빠르다 (받는 길을 아예 안 간다)', 두번째.ms < 처음.ms,
   처음.ms + 'ms → ' + 두번째.ms + 'ms (' + (처음.ms - 두번째.ms) + 'ms 줄었다)');
판('⑤ 둔 것으로 열어도 _자료왔다(\'원장\') 가 불린다', 두번째.원장왔나 === true, String(두번째.원장왔나));

// ③ 새 원장을 올리셨다 — 파일 이름과 올린 때가 함께 바뀐다
const 메타나 = 메타('B.xlsx', 1700009999);
const 열쇠나 = [메타나.storagePath, 메타나.fileName, String(메타나.timestamp.seconds)].join('|');
const 새원장 = await 열기(메타나);
await 둔것기다리기(열쇠나);
console.log('■ 새 원장: ' + JSON.stringify(새원장));
판('③ 원장을 새로 올리면 **반드시 새것을 받는다** (옛것이 안 뜬다)',
   새원장.받은수 === 1 && 새원장.줄 === 나.줄 && 새원장.첫부속 === '가와B',
   '받음 ' + 새원장.받은수 + '번 · ' + 새원장.줄 + '줄 (바라는 ' + 나.줄 + ') · 첫 부속 ' + 새원장.첫부속);
const 새것다시 = await 열기(메타나);
판('③ 새것도 다음부터는 안 받는다 (둔 것이 새것으로 바뀌었다)',
   새것다시.받은수 === 0 && 새것다시.줄 === 나.줄, '받음 ' + 새것다시.받은수 + '번 · ' + 새것다시.줄 + '줄');

// ④ 둔 것이 깨졌을 때
await p.evaluate(() => new Promise((풀) => {
  const q = indexedDB.open('amt원장', 1);
  q.onsuccess = () => { const d = q.result;
    const t = d.transaction('둔것', 'readwrite');
    t.objectStore('둔것').put({ 열쇠: '망가짐', 줄: '이건 줄이 아니다' }, '원장');
    t.oncomplete = () => { d.close(); 풀(); }; t.onerror = () => { d.close(); 풀(); }; };
  q.onerror = () => 풀();
}));
const 깨진뒤 = await 열기(메타나);
console.log('■ 둔 것이 깨졌을 때: ' + JSON.stringify(깨진뒤));
판('④ 둔 것이 깨졌으면 전처럼 받아 온다 (아무것도 못 쓰게 되지 않는다)',
   깨진뒤.받은수 === 1 && 깨진뒤.줄 === 나.줄 && 깨진뒤.원장왔나 === true,
   '받음 ' + 깨진뒤.받은수 + '번 · ' + 깨진뒤.줄 + '줄');
판('⑥ 파이어스토어에 한 줄도 안 쓴다', 깨진뒤.쓰기 === 0, 깨진뒤.쓰기 + '번');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '원장둠1   OK' : '원장둠1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
