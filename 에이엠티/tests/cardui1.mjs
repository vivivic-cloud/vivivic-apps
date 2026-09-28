// 공정카드 겉모습 — 사장님 지시(09-28 04:16) 「Modern SaaS Dashboard 느낌으로」.
// 겉을 바꾸면서 그동안 만든 것이 하나라도 죽으면 안 된다. 그 여섯을 여기서 지킨다.
// 폰 375px 에서는 접히고, 넓은 화면(1024px)에서는 사장님 그림처럼 가로로 편다.
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
  document.getElementById('auth-login-overlay')?.style.setProperty('display','none');
  ['원장','발주','도면','차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  const 쓰기 = async (ref, 값) => { Object.entries(값).forEach(([길, v]) => {
      const 토막 = 길.split('.'); const o = confirmedOrders.find(x => x.docId === ref.id);
      if (!o) return; let 자리 = o;
      토막.slice(0, -1).forEach(t => { 자리[t] = 자리[t] || {}; 자리 = 자리[t]; });
      자리[토막[토막.length - 1]] = v; }); };
  window.db = {}; window.storage = {};
  window.fbFirestore = { doc: (db, ...a) => ({ p: a.join('/'), id: a[a.length - 1] }),
    updateDoc: 쓰기, setDoc: async () => {}, deleteDoc: async () => {}, addDoc: async () => ({ id: 'x' }),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  const sk = '2026-09-15-재단';
  confirmedOrders.length = 0;
  confirmedOrders.push({ idNum: 1401, docId: 'd1', orderCode: '조혼-20260916-01',
    displayName: '(KRW) 알렉스 800 높은 수납장 올화이트', orderQty: 44, amtTimeline: true,
    partInfoMap: {}, partStarted: {}, deliveryDate: '2026-09-30',
    partCompletions: { 'card-1401-12': { '재단': { done: true, date: '2026-09-28', partName: '도어',
      actualMinutes: 12.5, pausedMinutes: 3.2, actualQty: 44 } } } });
  const 한장 = (n, 나름) => ({ cKey: 'CUT_' + n, nm: 나름, pm: 8, dq: 44, orderCode: '조혼-20260916-01',
    orderKey: 'd1', orderName: '(KRW) 알렉스 800 높은 수납장 올화이트', plateName: 'PB-18T', coating: '양면',
    finish: '화이트', rw: 800, rd: 400, isCuttingCard: true, sheets: 5, perSheet: 4,
    orderIdNum: 1401, pRowIndex: 10 + n, boardW: 2440, boardH: 1220,
    boardParts: [{ lp: 0, tp: 0, wp: .33, hp: .33, bg: '#f5f5f4', dw: '800', dh: '400' },
                 { lp: .33, tp: 0, wp: .33, hp: .33, bg: '#f5f5f4', dw: '800', dh: '400' }],
    coveredOrderIds: [1401] });
  window.__sk = sk; window.__한장 = 한장;
  window._woBoringParts[sk] = [한장(1, '전판'), 한장(2, '도어')];
  window._woBoring[sk] = { pool: [], AMT: ['CUT_1', 'CUT_2'] };
  const 무대 = document.createElement('div');
  무대.id = '__무대'; 무대.className = 'wo-boring-mac-col';
  무대.style.cssText = 'position:fixed;left:0;top:0;right:0;z-index:99999;background:#f6f7f9;padding:10px;box-sizing:border-box;';
  무대.innerHTML = [[1, '전판'], [2, '도어']].map(([n, 나름]) =>
    _woPlacedCardHtml(한장(n, 나름), 'CUT_' + n, sk, 'AMT', _woGetOrderColorMap(sk), '')).join('<div style="height:10px"></div>');
  document.body.appendChild(무대);
};
const 재기 = () => {
  const 카들 = [...document.querySelectorAll('#__무대 .wo-boring-placed-card')];
  const 잼 = c => {
    const cs = getComputedStyle(c); const r = c.getBoundingClientRect();
    const 글칸 = c.querySelector('.woc-글'), 그림칸 = c.querySelector('.woc-그림');
    const 이름 = c.querySelector('.woc-이름'), 치수 = c.querySelector('.woc-치수');
    const 딱지 = [...c.querySelectorAll('.woc-딱지줄 span')].map(e => {
      const s = getComputedStyle(e); return { 글: e.textContent.trim(), 바탕: s.backgroundColor, 글빛: s.color,
        둥금: parseFloat(s.borderRadius) }; });
    const 단추 = [...c.querySelectorAll('button')].map(e => {
      const s = getComputedStyle(e); const q = e.getBoundingClientRect();
      const af = getComputedStyle(e, '::after');
      return { 글: e.textContent.trim().slice(0, 8), w: Math.round(q.width), h: Math.round(q.height),
        닿는높이: Math.max(Math.round(q.height), parseFloat(af.height) || 0),
        죽음: !!e.disabled, 바탕: s.backgroundImage !== 'none' ? 'gradient' : s.backgroundColor,
        잘림: e.scrollWidth > e.clientWidth + 1 };
    });
    return {
      폭: Math.round(r.width), 높이: Math.round(r.height),
      바탕: cs.backgroundColor, 둥금: parseFloat(cs.borderRadius), 안여백: parseFloat(cs.paddingTop),
      그림자: cs.boxShadow !== 'none',
      이름크기: 이름 ? parseFloat(getComputedStyle(이름).fontSize) : 0,
      이름굵기: 이름 ? getComputedStyle(이름).fontWeight : '',
      치수빛: 치수 ? getComputedStyle(치수).color : '',
      치수크기: 치수 ? parseFloat(getComputedStyle(치수).fontSize) : 0,
      딱지, 단추,
      완료됨딱지: !!c.querySelector('.wo-cut-완료딱지'),
      끝글: (c.querySelector('.woc-끝') || {}).textContent || '',
      나란히: (글칸 && 그림칸) ? (그림칸.getBoundingClientRect().left > 글칸.getBoundingClientRect().right - 2) : null,
      글: (c.textContent || '').replace(/\s+/g, ' ').trim(),
    };
  };
  return { 카드: 카들.map(잼), 문서가로: document.documentElement.scrollWidth };
};

// ── 폰 375px
{
  const ctx = await b.newContext({ ...devices['iPhone 12'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  await ctx.route('https://cdn.tailwindcss.com*', r => r.fulfill({ status: 200, contentType: 'application/javascript',
    body: 'document.write(' + JSON.stringify('<style>' + CSS + '</style>') + ');' }));
  for (const [무늬, 길] of [['https://cdn.sheetjs.com/**', 'node_modules/xlsx/dist/xlsx.full.min.js'],
                            ['https://cdn.jsdelivr.net/npm/sortablejs**', 'node_modules/sortablejs/Sortable.min.js'],
                            ['https://cdn.jsdelivr.net/npm/gsap**', 'node_modules/gsap/dist/gsap.min.js']])
    await ctx.route(무늬, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: readFileSync(HERE + '/' + 길, 'utf-8') }));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1300);
  await p.evaluate(차리기); await p.waitForTimeout(400);
  const 본 = await p.evaluate(재기);
  const [A, B] = 본.카드;
  console.log('■ 375px 카드1: ' + JSON.stringify(A).slice(0, 460));
  console.log('■ 375px 카드2: ' + JSON.stringify(B).slice(0, 460));

  // 사장님 다섯 가지
  판('① 카드가 흰 바탕 · 둥근 모서리(8~12px) · 넉넉한 안 여백 · 옅은 그림자',
     A.바탕 === 'rgb(255, 255, 255)' && A.둥금 >= 8 && A.둥금 <= 14 && A.안여백 >= 10 && A.그림자 === true,
     `바탕 ${A.바탕} · 둥금 ${A.둥금}px · 안여백 ${A.안여백}px · 그림자 ${A.그림자}`);
  판('② 이름은 굵고 크게, 규격은 작고 차분하게',
     A.이름크기 >= 15 && Number(A.이름굵기) >= 700 && A.치수크기 < A.이름크기 && A.치수빛 !== 'rgb(17, 17, 16)',
     `이름 ${A.이름크기}px/${A.이름굵기} · 치수 ${A.치수크기}px ${A.치수빛}`);
  판('③ 딱지는 알약 모양에 파스텔 바탕 · 글자는 진하게',
     A.딱지.length >= 2 && A.딱지.every(d => d.둥금 >= 12 && /^rgb\(2[0-9]{2}, 2[0-9]{2}, 2[0-9]{2}\)$/.test(d.바탕)),
     JSON.stringify(A.딱지));
  const 시작 = A.단추.find(x => /시작/.test(x.글));
  const 편집A = A.단추.find(x => x.글 === '편집');
  판('④ 「시작」 은 파란 그라데이션 · 44px 이상', !!시작 && 시작.바탕 === 'gradient' && 시작.h >= 44,
     JSON.stringify(시작));
  판('④ 「편집」 은 수수한 곁단추이고 닿는 자리는 44px 이상',
     !!편집A && 편집A.바탕 === 'rgb(255, 255, 255)' && 편집A.닿는높이 >= 44, JSON.stringify(편집A));
  판('⑤ 폰에서는 글과 도면이 위아래로 접힌다', A.나란히 === false, '나란히 ' + A.나란히);
  판('375px 가로 스크롤 없다', 본.문서가로 <= 375, 본.문서가로 + 'px');

  // 그동안 만든 것 여섯이 다 살아 있나
  판('㉠ 「불량보고」 단추가 카드마다 있다',
     A.단추.some(x => x.글 === '불량보고') && B.단추.some(x => x.글 === '불량보고'), '둘 다');
  판('㉡ 끝난 카드는 「편집」 이 죽어 있고 「완료됨」 딱지가 붙는다',
     B.완료됨딱지 === true && (B.단추.find(x => x.글 === '편집') || {}).죽음 === true,
     '완료됨 ' + B.완료됨딱지 + ' · 편집 죽음 ' + (B.단추.find(x => x.글 === '편집') || {}).죽음);
  판('㉢ 끝난 카드에 「✓ 완료 ○분」 과 「멈춤 ○분」 이 갈라져 보인다',
     /✓ 완료/.test(B.끝글) && /12\.5분/.test(B.끝글) && /멈춤 3\.2분/.test(B.끝글), B.끝글.replace(/\s+/g, ' '));
  판('㉣ 구구절절한 설명이 없다 (문장이 아니다)', !/(습니다|주세요|됩니다)/.test(A.글 + B.글), A.글.slice(0, 60));
  판('㉤ 단추 글자가 안 잘린다', [...A.단추, ...B.단추].every(x => x.잘림 === false),
     [...A.단추, ...B.단추].map(x => x.글 + ' ' + x.w + 'x' + x.h).join(' · '));

  // ㉥ 집중 창 세 단추 이름 — 진짜 손가락으로 시작을 눌러 확인한다
  const cdp = await ctx.newCDPSession(p);
  const r = await p.evaluate(() => { const bt = document.querySelector('#__무대 .wo-boring-placed-card button[style*="3b82f6"]');
    bt.scrollIntoView({ block: 'center' }); const q = bt.getBoundingClientRect();
    return { x: Math.round(q.x + q.width / 2), y: Math.round(q.y + q.height / 2) }; });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.y, radiusX: 14, radiusY: 14, force: 1 }] });
  await p.waitForTimeout(110);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(500);
  const 집중 = await p.evaluate(() => {
    const m = document.getElementById('_집중판'); if (!m) return null;
    return { 단추: [...m.querySelectorAll('.집중-단추')].map(e => e.textContent.trim()),
             불량: !!document.getElementById('_집중불량'),
             접기: !!document.getElementById('_집중접기') }; });
  console.log('■ 집중 창: ' + JSON.stringify(집중));
  판('㉥ 집중 창 단추는 STOP · COMPLETE · CANCLE 그대로',
     !!집중 && 집중.단추.join(' · ') === 'STOP · COMPLETE · CANCLE', 집중 ? 집중.단추.join(' · ') : '창 없음');
  판('㉥ 집중 창에 「불량보고」 와 「접기」 도 그대로', !!집중 && 집중.불량 && 집중.접기,
     JSON.stringify(집중 && [집중.불량, 집중.접기]));
  await p.evaluate(() => { window._집중판닫기(); const 무 = document.getElementById('__무대'); if (무) 무.remove(); });
  await p.evaluate(차리기); await p.waitForTimeout(300);
  await p.screenshot({ path: 그림칸 + '/card-375-후.png' });
  판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
  await ctx.close();
}

// ── 넓은 화면 1024px — 사장님 그림처럼 가로로 편다
{
  const ctx = await b.newContext({ viewport: { width: 1024, height: 900 } });
  await ctx.route('https://cdn.tailwindcss.com*', r => r.fulfill({ status: 200, contentType: 'application/javascript',
    body: 'document.write(' + JSON.stringify('<style>' + CSS + '</style>') + ');' }));
  for (const [무늬, 길] of [['https://cdn.sheetjs.com/**', 'node_modules/xlsx/dist/xlsx.full.min.js'],
                            ['https://cdn.jsdelivr.net/npm/sortablejs**', 'node_modules/sortablejs/Sortable.min.js'],
                            ['https://cdn.jsdelivr.net/npm/gsap**', 'node_modules/gsap/dist/gsap.min.js']])
    await ctx.route(무늬, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: readFileSync(HERE + '/' + 길, 'utf-8') }));
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1300);
  await p.evaluate(차리기); await p.waitForTimeout(400);
  const 본 = await p.evaluate(재기);
  const A = 본.카드[0];
  console.log('■ 1024px 카드1: ' + JSON.stringify({ 폭: A.폭, 높이: A.높이, 나란히: A.나란히, 단추: A.단추 }));
  판('⑤ 넓은 화면에서는 글과 도면이 가로로 나란히 선다', A.나란히 === true, '나란히 ' + A.나란히);
  판('⑤ 넓은 화면에서도 누르는 자리는 44px 이상', A.단추.every(x => x.닿는높이 >= 44),
     A.단추.map(x => x.글 + ' ' + x.h + 'px(닿는 ' + x.닿는높이 + ')').join(' · '));
  await p.screenshot({ path: 그림칸 + '/card-1024-후.png' });
  await ctx.close();
}
console.log(실패 === 0 ? 'cardui1   OK' : 'cardui1   FAIL (' + 실패 + ')');
await b.close(); process.exit(실패 === 0 ? 0 : 1);
