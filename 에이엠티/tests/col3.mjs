// 공정카드 세 칸 — 사장님 말씀(10-02)
// 「시작버튼위는 반듯한 그림, 그앞의 그림은 이카드에서 잘라야하는 부속의 그림 이렇게 하자」
//   [ 글 ][ 이 카드에서 잘라야 하는 부속 (누운 민판) ][ 재단배치도 (반듯) ]
//                                                    [ 편집 ]
//                                                    [ ▶ 시작 ]
// 네 갈래(아직·시작했음·끝남·편집중)가 다 제자리에 제 글로 떠야 하고,
// 도면 없는 카드는 예전과 똑같아야 한다.
import { 브라우저열기, devices, 서버, 자재, 그림칸 as 그림칸자리 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const 그림칸 = 그림칸자리();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const URL = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const b = await 브라우저열기();
let 실패 = 0; const 판 = (n, t, v) => { if (!t) 실패++; console.log((t ? '  OK  ' : '  FAIL') + '  ' + n + '   → ' + v); };

const 차리기 = () => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장', '발주', '도면', '차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.db = {}; window.storage = {};
  window.fbFirestore = { doc: (db, ...a) => ({ p: a.join('/'), id: a[a.length - 1] }),
    updateDoc: async () => {}, setDoc: async () => {}, deleteDoc: async () => {}, addDoc: async () => ({ id: 'x' }),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  const sk = '2026-10-02-재단', pk = '재단';
  const 조각 = [
    { lp: 0,    tp: 0,   wp: 0.3279, hp: 0.6557, bg: '#ffffff', dw: '800', dh: '800' },
    { lp: 0.33, tp: 0,   wp: 0.3279, hp: 0.6557, bg: '#ffffff', dw: '800', dh: '800' },
    { lp: 0.70, tp: 0.1, wp: 0.1967, hp: 0.3278, bg: '#f5f5f4', dw: '480', dh: '400' }];
  const 한장 = (n, 더) => Object.assign({ cKey: 'CUT_' + n, nm: '도어' + n, pm: 8, dq: 44,
    orderCode: '조혼-20261002-01', orderKey: 'd1', orderName: '(KRW) 알렉스 800 높은 수납장 올화이트',
    plateName: 'PB-18T', coating: '양면', finish: '화이트', rw: 800, rd: 800,
    isCuttingCard: true, sheets: 5, perSheet: 2, orderIdNum: 1401, pRowIndex: 10 + n,
    boardW: 2440, boardH: 1220, boardParts: 조각.map(q => ({ ...q })), coveredOrderIds: [1401] }, 더 || {});
  // 여러 칸짜리 배치도 — 긴 부속(761×370)이 열두 칸 앉은 원장
  const 열두칸 = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++)
    열두칸.push({ lp: 0.004 + c * 0.249, tp: 0.004 + r * 0.332, wp: 0.2436, hp: 0.3033,
                  bg: '#ffffff', dw: '761', dh: '370' });
  // ㄱ 아직 · ㄴ 시작했음 · ㄷ 끝남 · ㄹ 다른카드에 편집중 · ㅁ 재단사이즈 없음 · ㅂ 도면 없음
  // ㅅ 긴 부속 한 장 + 열두 칸 배치도 (사장님 사진 셋째 줄 꼴)
  const 것들 = [한장(1), 한장(2), 한장(3),
                한장(4, { 받은몫: 12, 받은곳: '전판', sheets: 0 }),
                한장(5, { rw: 0, rd: 0 }),
                한장(6, { boardParts: [] }),
                한장(7, { nm: '이동선반', rw: 761, rd: 370, boardParts: 열두칸 })];
  const 발주 = { idNum: 1401, docId: 'd1', orderCode: '조혼-20261002-01',
    displayName: '(KRW) 알렉스 800 높은 수납장 올화이트', orderQty: 44, amtTimeline: true,
    partInfoMap: {}, partStarted: {}, partCompletions: {}, deliveryDate: '2026-10-30' };
  // 갈래마다 제 열쇠로 기록을 심는다 (이름 규칙은 앱이 쥐고 있다)
  const 열쇠 = p => window._woPartKey(p.cKey, 'd1', p);
  발주.partStarted[열쇠(것들[1])]     = { [pk]: { started: true, startMs: Date.now() - 60000, date: '2026-10-02' } };
  발주.partCompletions[열쇠(것들[2])] = { [pk]: { done: true, date: '2026-10-02', actualMinutes: 12.5,
                                                 pausedMinutes: 3.2, actualQty: 44 } };
  confirmedOrders.length = 0; confirmedOrders.push(발주);
  window._woBoringParts[sk] = 것들;
  window._woBoring[sk] = { pool: [], AMT: 것들.map(q => q.cKey) };
  window.__것들 = 것들; window.__sk = sk;
  document.getElementById('__무대')?.remove();
  const 무대 = document.createElement('div');
  무대.id = '__무대'; 무대.className = 'wo-boring-mac-col';
  무대.style.cssText = 'position:fixed;left:0;top:0;right:0;z-index:99999;background:#f6f7f9;padding:10px;box-sizing:border-box;';
  무대.innerHTML = 것들.map(q => _woPlacedCardHtml(q, q.cKey, sk, 'AMT', _woGetOrderColorMap(sk), ''))
                      .join('<div style="height:10px"></div>');
  document.body.appendChild(무대);
};

const 재기 = () => {
  const 칸잼 = e => { if (!e) return null; const r = e.getBoundingClientRect();
    return { x: Math.round(r.left), 오른: Math.round(r.right), 위: Math.round(r.top),
             아래: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) }; };
  const svg잼 = e => { if (!e) return null;
    const 눕 = [...e.querySelectorAll('g')].find(g => /matrix\(/.test(g.getAttribute('transform') || ''));
    return { 누움: !!눕, 보기: e.getAttribute('viewBox'),
             조각: e.querySelectorAll('rect').length,
             격자: e.querySelectorAll('defs pattern').length,
             칠: [...e.querySelectorAll('path')].filter(q => /url\(#amtcad/.test(q.getAttribute('fill') || '')).length }; };
  return [...document.querySelectorAll('#__무대 .wo-boring-placed-card')].map(c => {
    const 글 = c.querySelector('.woc-글'), 부속 = c.querySelector('.woc-부속'), 그림 = c.querySelector('.woc-그림');
    const 속 = c.querySelector('.woc-그림속');
    const 큰단추 = c.querySelector('.woc-단추') || c.querySelector('.woc-끝');
    const 편집 = [...c.querySelectorAll('button')].find(e => e.textContent.trim() === '편집');
    const 불량 = [...c.querySelectorAll('button')].find(e => /불량보고/.test(e.textContent));
    const af = 큰단추 ? getComputedStyle(큰단추, '::after') : null;
    return {
      글: 칸잼(글), 부속: 칸잼(부속), 그림: 칸잼(그림),
      부속도면: svg잼(부속 ? 부속.querySelector('svg') : null),
      배치도: svg잼(그림 ? 그림.querySelector('svg') : null),
      큰단추글: 큰단추 ? 큰단추.textContent.replace(/\s+/g, ' ').trim().slice(0, 18) : '',
      큰단추칸: 칸잼(큰단추),
      큰단추닿: 큰단추 ? Math.max(Math.round(큰단추.getBoundingClientRect().height), parseFloat(af.height) || 0) : 0,
      큰단추속: !!(속 && 큰단추 && 속.contains(큰단추)),
      편집속: !!(속 && 편집 && 속.contains(편집)),
      편집칸: 칸잼(편집),
      불량줄: !!(불량 && 불량.closest('.woc-줄')),
      줄글: (c.querySelector('.woc-줄') || {}).textContent ? c.querySelector('.woc-줄').textContent.replace(/\s+/g, ' ').trim() : '',
      높이: Math.round(c.getBoundingClientRect().height),
      글자: (c.textContent || '').replace(/\s+/g, ' ').trim(),
    };
  });
};

const 보기 = {};
for (const [폭, opt] of [[375, { ...devices['iPhone 12'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }],
                         [1280, { viewport: { width: 1280, height: 950 } }]]) {
  const ctx = await b.newContext(opt);
  await ctx.route('https://cdn.tailwindcss.com*', r => r.fulfill({ status: 200, contentType: 'application/javascript',
    body: 'document.write(' + JSON.stringify('<style>' + CSS + '</style>') + ');' }));
  for (const [무늬, 길] of [['https://cdn.sheetjs.com/**', 'node_modules/xlsx/dist/xlsx.full.min.js'],
                            ['https://cdn.jsdelivr.net/npm/sortablejs**', 'node_modules/sortablejs/Sortable.min.js'],
                            ['https://cdn.jsdelivr.net/npm/gsap**', 'node_modules/gsap/dist/gsap.min.js']])
    await ctx.route(무늬, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: readFileSync(HERE + '/' + 길, 'utf-8') }));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1300);
  await p.evaluate(차리기); await p.waitForTimeout(500);
  const 본 = await p.evaluate(재기);
  const 넘침 = await p.evaluate(() => document.documentElement.scrollWidth);
  보기[폭] = { 본, 넘침, errs };
  console.log('════ ' + 폭 + 'px ════');
  본.forEach((c, i) => console.log('  카드' + (i + 1) + ' ' + JSON.stringify({
    글: c.글, 부속: c.부속, 그림: c.그림, 부속도면: c.부속도면, 배치도: c.배치도,
    단추: c.큰단추글, 단추속: c.큰단추속, 높이: c.높이 })));
  // 그림은 카드가 다 들어가게 창을 늘려 찍는다 (잰 값은 위에서 제 크기로 쟀다)
  await p.setViewportSize({ width: 폭, height: 폭 === 375 ? 1500 : 1400 });
  await p.waitForTimeout(250);
  await p.screenshot({ path: 그림칸 + '/col3-' + 폭 + '-세칸.png' });
  await p.close(); await ctx.close();
}

const W = 보기[1280].본, M = 보기[375].본;
const [ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, ㅅ] = W;
// 고치기 전 판에는 없는 칸이 있다 — 터지지 말고 FAIL 로 적히게 한다
const 폭값 = o => (o && o.w) || 0, 위값 = o => (o && o.위) || 0, 아래값 = o => (o && o.아래) || 0,
      엑스 = o => (o && o.x) || 0, 오른값 = o => (o && o.오른) || 0;

// ── ① 세 칸
판('① 넓은 화면에서 글·부속·배치도가 가로로 나란히 선다',
   !!ㄱ.부속 && 오른값(ㄱ.글) <= 엑스(ㄱ.부속) + 2 && 오른값(ㄱ.부속) <= 엑스(ㄱ.그림) + 2,
   '글 ' + 폭값(ㄱ.글) + ' · 부속 ' + 폭값(ㄱ.부속) + ' · 배치도 ' + 폭값(ㄱ.그림));
판('① 칸 너비가 사진의 어림(글 45 · 부속 33 · 배치도 22)에 든다',
   Math.abs(폭값(ㄱ.글) / 1232 - 0.45) < 0.06 && Math.abs(폭값(ㄱ.부속) / 1232 - 0.33) < 0.06,
   [폭값(ㄱ.글), 폭값(ㄱ.부속), 폭값(ㄱ.그림)].join(' / ') + 'px');

// ── ② 가운데 = 이 카드에서 잘라야 하는 부속 한 장
판('② 가운데 그림은 누운 민판 한 장이다 (칸을 안 나눈다)',
   ㄱ.부속도면 && ㄱ.부속도면.누움 === true && ㄱ.부속도면.조각 === 0,
   JSON.stringify(ㄱ.부속도면));
판('② 그 판의 크기는 재단 사이즈(800×800) 그대로다',
   ㄱ.부속도면 && ㄱ.부속도면.보기 === '0 0 800 800', ㄱ.부속도면 && ㄱ.부속도면.보기);
판('② 그 판에도 같은 CAD 격자가 깔린다',
   ㄱ.부속도면 && ㄱ.부속도면.격자 === 1 && ㄱ.부속도면.칠 === 1, JSON.stringify(ㄱ.부속도면));
판('② 재단 사이즈가 없는 카드는 가운데 칸 자체가 없다', ㅁ.부속 === null, String(ㅁ.부속));

// ── ③ 오른쪽 배치도는 반듯
판('③ 오른쪽 재단배치도는 반듯하다 (누워 있지 않다)',
   ㄱ.배치도 && ㄱ.배치도.누움 === false && ㄱ.배치도.조각 === 3, JSON.stringify(ㄱ.배치도));

// ── ④ 시작 단추는 배치도 칸 안, 편집 밑
판('④ 큰 단추가 배치도 칸 안, 편집 밑에 선다',
   ㄱ.큰단추속 === true && ㄱ.편집속 === true && 위값(ㄱ.큰단추칸) >= 아래값(ㄱ.편집칸) - 2,
   '편집 아래 ' + 아래값(ㄱ.편집칸) + ' → 단추 위 ' + 위값(ㄱ.큰단추칸));
판('④ 그 단추가 칸 폭을 꽉 채운다', 폭값(ㄱ.큰단추칸) >= 폭값(ㄱ.그림) - 4 && 폭값(ㄱ.그림) > 0,
   폭값(ㄱ.큰단추칸) + ' / 칸 ' + 폭값(ㄱ.그림));
판('④ 닿는 자리는 44px 이상이다', W.every(c => c.큰단추닿 >= 44), W.map(c => c.큰단추닿).join(','));
판('④ 불량보고는 아랫줄에 그대로 남는다', W.every(c => c.불량줄 === true), W.map(c => c.불량줄).join(','));

// ── ⑤ 네 갈래
판('⑤ 아직 — 「▶ 시작」', /시작/.test(ㄱ.큰단추글) && ㄱ.큰단추속 === true, ㄱ.큰단추글);
판('⑤ 시작했음 — 「완료」', ㄴ.큰단추글 === '완료' && ㄴ.큰단추속 === true, ㄴ.큰단추글);
판('⑤ 끝남 — 「✓ 완료 … 분」 과 멈춤',
   /✓ 완료/.test(ㄷ.큰단추글) && /12\.5분/.test(ㄷ.글자) && /멈춤 3\.2분/.test(ㄷ.글자) && ㄷ.큰단추속 === true,
   ㄷ.큰단추글);
판('⑤ 편집중 — 「다른카드에 편집중」', /다른카드에 편집중/.test(ㄹ.큰단추글) && ㄹ.큰단추속 === true, ㄹ.큰단추글);

// ── ⑥ 도면 없는 카드는 예전 그대로
판('⑥ 도면 없는 카드는 가운데·오른쪽 칸이 없다', ㅂ.그림 === null && ㅂ.부속 === null,
   String(ㅂ.그림) + ' / ' + String(ㅂ.부속));
판('⑥ 도면 없는 카드는 큰 단추가 아랫줄에 그대로 있다',
   ㅂ.큰단추속 === false && /시작/.test(ㅂ.줄글) && /불량보고/.test(ㅂ.줄글), ㅂ.줄글);

// ── ⑦ 폰 375px
const [ㄱm] = M;
판('⑦ 폰에서는 글이 한 줄을 다 쓰고 그림 둘이 가로로 나란히 선다',
   !!ㄱm.부속 && 폭값(ㄱm.글) >= 300 && 위값(ㄱm.부속) >= 아래값(ㄱm.글) - 2
   && 오른값(ㄱm.부속) <= 엑스(ㄱm.그림) + 2 && Math.abs(위값(ㄱm.부속) - 위값(ㄱm.그림)) <= 4,
   '글 ' + 폭값(ㄱm.글) + 'px · 부속 ' + 폭값(ㄱm.부속) + ' · 배치도 ' + 폭값(ㄱm.그림));
판('⑦ 폰에서 카드가 한 화면(812px)을 안 넘는다', M.every(c => c.높이 <= 812),
   M.map(c => c.높이).join(','));
판('⑦ 폰에서도 단추는 44px 이상', M.every(c => c.큰단추닿 >= 44), M.map(c => c.큰단추닿).join(','));
판('⑦ 375px 가로 넘침 없다', 보기[375].넘침 <= 375, 보기[375].넘침 + 'px');

판('⑧ 긴 부속도 제 크기(761×370) 민판 한 장으로 눕는다',
   !!ㅅ.부속도면 && ㅅ.부속도면.보기 === '0 0 761 370' && ㅅ.부속도면.누움 === true && ㅅ.부속도면.조각 === 0,
   JSON.stringify(ㅅ.부속도면));
판('⑧ 여러 칸 배치도(열두 칸)도 반듯하게 그대로 뜬다',
   !!ㅅ.배치도 && ㅅ.배치도.조각 === 12 && ㅅ.배치도.누움 === false, JSON.stringify(ㅅ.배치도));

판('페이지오류 없음', 보기[375].errs.length === 0 && 보기[1280].errs.length === 0,
   보기[375].errs.concat(보기[1280].errs).slice(0, 2).join(' / ') || '0');

await b.close();
console.log(실패 === 0 ? 'col3   OK' : 'col3   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
