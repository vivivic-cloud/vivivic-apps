// 「필터별 색상 목록이 해당칸에서 잘리지 않도록 버튼사이즈 조절 줄바뀜등으로 모두
//  나타나게 해줘」 — 사장님 말씀 (10-11 11:10 · 「… 아카시아 2 UV화이」 에서 잘림)
// 색상·두께·가공 알약 줄이 **칸 밖으로 안 나가고 다 보이는지** 잰다.
// 색 가짓수는 자료에서 나온다 — **열다섯 가지를 심어도** 안 잘려야 한다.
import { 브라우저열기, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
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
await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1400);
const cdp = await ctx.newCDPSession(p);
const 탭 = async (고르개) => {
  const c = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null;
    e.scrollIntoView({ block: 'center' }); const b2 = e.getBoundingClientRect();
    return { x: Math.round(b2.x + b2.width / 2), y: Math.round(b2.y + b2.height / 2) }; }, 고르개);
  if (!c) return false;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, radiusX: 14, radiusY: 14, force: 1 }] });
  await p.waitForTimeout(50);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(300); return true;
};

/* 색 가짓수를 **열다섯**으로 늘려 심는다 — 지금 보이는 아홉에 맞춰 박지 않는다.
   심는 자리는 이 창의 복사본(currentFullData)뿐이고 파일에는 한 줄도 안 쓴다. */
const 차림 = await p.evaluate((L) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  window.__쓰기 = 0; const 셈 = () => async () => { window.__쓰기++; };
  window.db = {}; window.storage = {};
  window.fbFirestore = { doc: () => ({}), updateDoc: 셈(), setDoc: 셈(), deleteDoc: 셈(), addDoc: 셈(),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, where: () => ({}), serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  currentFullData.length = 0; L.forEach(x => currentFullData.push(x));
  const h = currentFullData[0];
  const i색 = h.indexOf('마감색상');
  if (i색 < 0) return { 칸없음: true };
  const 새색 = ['화이트', '아이보리', '내츄럴오크', '발리오크', '베이지', '블랙', '아카시아',
                'UV화이트', '크림버치', '스카이블루', '네이비딥그레이', '백색펄', '옐로우',
                '신규자작', '월넛다크브라운'];
  let 심은 = 0;
  for (let i = 1; i < currentFullData.length; i++) {
    const r = currentFullData[i]; if (!r) continue;
    currentFullData[i] = r.slice();
    currentFullData[i][i색] = 새색[심은 % 새색.length]; 심은++;
  }
  amtOpenStock();
  return { 심은, 색가짓수: 새색.length };
}, L);
console.log('■ 차림: ' + JSON.stringify(차림));
if (차림.칸없음) { console.log('색딱지1   FAIL (원장에 마감색상 칸이 없다)'); process.exit(1); }
await p.waitForTimeout(400);
await 탭('#ams-갈래 [data-갈래="색"]');

const 재기 = (칸) => p.evaluate((id) => {
  const 줄 = document.getElementById(id); if (!줄) return null;
  const r = 줄.getBoundingClientRect();
  const 칩들 = [...줄.querySelectorAll('.amtb-chip')].map(e => {
    const q = e.getBoundingClientRect();
    return { 글: (e.textContent || '').replace(/\s+/g, ' ').trim(),
             왼: Math.round(q.left), 오: Math.round(q.right), 높: Math.round(q.height), 폭: Math.round(q.width),
             // 칸 밖으로 나갔나 — 줄 칸의 왼·오른 테두리를 넘으면 잘려 보인다
             넘침: q.left < r.left - 0.5 || q.right > r.right + 0.5,
             다보임: q.width > 0 && q.height > 0 };
  });
  return { 칩수: 칩들.length, 칩들, 줄높이: Math.round(r.height),
           보이는폭: 줄.clientWidth, 담긴폭: 줄.scrollWidth,
           옆으로밈: 줄.scrollWidth > 줄.clientWidth + 1,
           줄바꿈: getComputedStyle(줄).flexWrap,
           문서가로: document.documentElement.scrollWidth };
}, 칸);

const 색 = await 재기('ams-색');
console.log('■ 색상 줄: ' + JSON.stringify({ ...색, 칩들: 색.칩들.map(x => x.글) }));
판('① 색이 열다섯 가지여도 알약이 다 선다',
   색.칩수 === 차림.색가짓수, 색.칩수 + '개 / 심은 ' + 차림.색가짓수 + '가지');
판('① 알약이 칸 밖으로 안 나간다 (잘리는 것이 없다)',
   색.칩들.every(x => !x.넘침 && x.다보임), '넘친 알약 ' + 색.칩들.filter(x => x.넘침).length + '개 — ' +
   JSON.stringify(색.칩들.filter(x => x.넘침).map(x => x.글)));
판('① 옆으로 밀지 않고 **줄을 바꿔** 다 보인다',
   색.옆으로밈 === false && 색.줄바꿈 === 'wrap',
   '옆으로밈 ' + 색.옆으로밈 + ' (보이는폭 ' + 색.보이는폭 + ' · 담긴폭 ' + 색.담긴폭 + ') · wrap ' + 색.줄바꿈);
판('② 딱지에 붙은 숫자도 같이 보인다 (「화이트 7」 처럼)',
   색.칩들.every(x => /\d/.test(x.글)), JSON.stringify(색.칩들.slice(0, 4).map(x => x.글)));
판('③ 누르는 자리가 44px 아래로 안 내려간다',
   색.칩들.every(x => x.높 >= 44), '44px 밑 ' + 색.칩들.filter(x => x.높 < 44).length + '개 · 높이 ' +
   JSON.stringify([...new Set(색.칩들.map(x => x.높))]));
판('④ 375px 가로 넘침 0', 색.문서가로 <= 375, (색.문서가로 - 375) + 'px 넘침 (문서가로 ' + 색.문서가로 + ')');

// 두께·가공 줄도 같은 잣대로 본다
for (const [이름, id] of [['두께', 'ams-두께'], ['가공', 'ams-가공']]) {
  await 탭('#ams-갈래 [data-갈래="' + 이름 + '"]');
  const 것 = await 재기(id);
  console.log('■ ' + 이름 + ' 줄: ' + JSON.stringify({ 칩수: 것.칩수, 옆으로밈: 것.옆으로밈, 줄높이: 것.줄높이 }));
  판('⑤ ' + 이름 + ' 줄도 안 잘리고 다 보인다',
     것.칩수 > 0 && 것.옆으로밈 === false && 것.칩들.every(x => !x.넘침 && x.높 >= 44),
     것.칩수 + '개 · 옆으로밈 ' + 것.옆으로밈 + ' · 44px 밑 ' + 것.칩들.filter(x => x.높 < 44).length + '개');
}
const 끝 = await p.evaluate(() => ({ 쓰기: window.__쓰기, 문서가로: document.documentElement.scrollWidth }));
판('⑥ 파이어스토어에 한 줄도 안 쓴다', 끝.쓰기 === 0, 끝.쓰기 + '번');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '색딱지1   OK' : '색딱지1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
