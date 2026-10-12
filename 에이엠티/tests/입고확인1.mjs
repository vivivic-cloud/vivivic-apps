// 「조혼가구쪽 큐알 스캔으로 나타나는 명세서에는 입고확인 버튼이 있어야 합니다.
//  입고확인 버튼을 누르면 '확인' 버튼과 함께 '입고된 수량을 정확히 확인했나요?
//  확인후 착오된 수량의 책임은 조혼가구(현재납품중인업체명)에 기록됩니다.' 라는
//  메세지가 팝업이 나타나게해주세요.」 — 사장님 말씀 (10-11)
// ① 큐알로 연 명세서에만 단추가 서는지(머리줄·큐알네모·열쇠없음 셋은 안 선다)
// ② 글귀가 **한 글자도 안 다른지** · 업체가 **그 발주 기록**에서 오는지
// ③ 「확인」 을 누르면 **진짜로 적히는지**(새 칸 입고확인 · 문서 id = 큐알 글)
// ④ 업무 기록에는 **한 글자도 안 쓰는지** ⑤ 두 번 안 적히고 단추가 잠기는지
// ⑥ 못 적으면 **거짓 초록 없이** 「기록을 못 남겼습니다」 가 뜨는지 를 잰다.
import { 브라우저열기, devices, 서버, 자료, 자재, 그림칸 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const 터 = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const L = await 자료('원장');
const b = await 브라우저열기();
let 실패 = 0; const 판 = (n, t, v) => { if (!t) 실패++; console.log((t ? '  OK  ' : '  FAIL') + '  ' + n + '   → ' + v); };
const ctx = await b.newContext({ ...devices['iPhone 12'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
await ctx.route('https://cdn.tailwindcss.com*', r => r.fulfill({ status: 200, contentType: 'application/javascript',
  body: 'document.write(' + JSON.stringify('<style>' + CSS + '</style>') + ');' }));

const 큐알 = '유한-20261009-01-A';
const 글귀바람 = '입고된 수량을 정확히 확인했나요? 확인후 착오된 수량의 책임은 유한가구에 기록됩니다.';

const 심을것 = ({ L, 막나, 트랜 }) => {
  window.__트랜잭션쓰나 = !!트랜;
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  window.__쓴곳 = []; window.__쓴값 = {}; window.__창고 = {};
  const 방 = (...a) => a.join('/');
  window.db = {}; window._myAccount = { uid: '시험uid', email: '', role: 'amt' };
  window.fbFirestore = {
    doc: (db, ...a) => ({ 길: 방(...a) }),
    collection: (db, ...a) => ({ 길: 방(...a) }),
    setDoc: async (r, v) => {
      // 일부러 막아 보는 자리 — 「기록을 못 남겼습니다」 가 떠야 한다
      if (막나) throw new Error('PERMISSION_DENIED: 시험으로 막음');
      window.__쓴곳.push(r.길); window.__쓴값[r.길] = Object.assign({}, window.__쓴값[r.길], v);
      window.__창고[r.길] = window.__쓴값[r.길];
    },
    getDoc: async (r) => ({ exists: () => !!window.__창고[r.길], data: () => window.__창고[r.길] || {} }),
    // 진짜 꾸러미에는 runTransaction 이 있다 — 없을 때 길(읽고 나서 쓰기)도 같이 잰다
    runTransaction: window.__트랜잭션쓰나 ? async (db, 일) => 일({
      get: async (r) => ({ exists: () => !!window.__창고[r.길], data: () => window.__창고[r.길] || {} }),
      set: (r, v) => { window.__쓴곳.push(r.길); window.__쓴값[r.길] = v; window.__창고[r.길] = v; },
    }) : undefined,
    updateDoc: async (r, v) => { window.__쓴곳.push(r.길); },
    deleteDoc: async () => {}, addDoc: async (r) => { window.__쓴곳.push(r.길); },
    onSnapshot: () => {}, query: x => x, serverTimestamp: () => '때',
    getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  currentFullData.length = 0; L.forEach(r => currentFullData.push(r));
  const h = currentFullData[0];
  const 줄 = [];
  for (let i = 1; i < currentFullData.length && 줄.length < 3; i++) {
    const r = currentFullData[i]; if (!r) continue;
    if (normalizeValue(r[h.indexOf('공급처')]) !== 'AMT') continue;
    if (!(parseFloat(r[h.indexOf('재단W')]) > 0)) continue;
    줄.push(i);
  }
  const 적 = (ri, 이름, 값) => { const i = h.indexOf(이름); if (i >= 0) currentFullData[ri][i] = 값; };
  줄.forEach(ri => 적(ri, '조립부속코드', 'TA_시험_' + ri));
  const 이름 = ri => currentFullData[ri][h.indexOf('부속명')] || '부속';
  const 다됨 = ri => ({ '재단': { done: true, date: '2026-10-21', partName: 이름(ri) },
                         '엣지': { done: true, date: '2026-10-21', partName: 이름(ri) },
                         'NC':   { done: true, date: '2026-10-21', partName: 이름(ri) },
                         '보링': { done: true, date: '2026-10-21', partName: 이름(ri) } });
  confirmedOrders.length = 0;
  confirmedOrders.push({
    idNum: 9901, docId: 'd9901', orderCode: '유한-20261009-01', displayName: '시험상품 스캔',
    code: '시험상품 스캔', supplier: '유한가구',      // ← 업체는 **기록**에서 온다
    criteria: IDENTITY_HEADERS.map(c => normalizeValue(currentFullData[줄[0]][h.indexOf(c)])),
    orderQty: 10, amtTimeline: true, batchId: 1791000009901, deliveryDate: '2026-10-21',
    procOverrides: {}, partMoveLog: {},
    partInfoMap: Object.fromEntries(줄.map(ri => ['card-9901-' + ri, { qty: 10, isDeleted: false }])),
    partStarted: {},
    partCompletions: Object.fromEntries(줄.map(ri => ['card-9901-' + ri, 다됨(ri)])),
  });
  window._파레트기록 = { d9901: { docId: 'd9901', 고른: {
    ['card-9901-' + 줄[0] + '|보링']: 'B',
    ['card-9901-' + 줄[1] + '|엣지']: 'A' } } };
  window._집중파레트들 = {};
  // 업무 기록을 **한 글자도 안 쓰는지** 보려고 지금 모습을 떠 둔다
  window.__기록찍기 = () => JSON.stringify(confirmedOrders.map(o => ({
    pc: o.partCompletions, ps: o.partStarted, pi: o.partInfoMap })));
  window.__기록전 = window.__기록찍기();
  document.documentElement.removeAttribute('data-amthome');
  document.documentElement.removeAttribute('data-amtstock');
  return { 줄 };
};

const 열기 = async (주소, 막나, 트랜) => {
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(주소, { waitUntil: 'load' });
  await p.waitForTimeout(900);
  await p.evaluate(심을것, { L, 막나: !!막나, 트랜: !!트랜 });
  await p.evaluate(() => { ['원장', '발주', '도면', '차례'].forEach(k => window._자료왔다 && window._자료왔다(k)); });
  await p.waitForTimeout(900);
  const cdp = await ctx.newCDPSession(p);
  const 손 = (t, x, y) => cdp.send('Input.dispatchTouchEvent',
    { type: t, touchPoints: t === 'touchEnd' ? [] : [{ x, y, radiusX: 14, radiusY: 14, force: 1 }] });
  const 짚기 = async (고르개) => {
    const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null;
      e.scrollIntoView({ block: 'center' }); const b2 = e.getBoundingClientRect();
      return { x: Math.round(b2.x + b2.width / 2), y: Math.round(b2.y + b2.height / 2) }; }, 고르개);
    if (!r) return false;
    await 손('touchStart', r.x, r.y); await p.waitForTimeout(60); await 손('touchEnd', 0, 0);
    await p.waitForTimeout(600); return true;
  };
  return { p, errs, 짚기 };
};
const 단추보기 = (p) => p.evaluate(() => {
  const 단 = document.getElementById('명세-입고');
  const 들 = [...document.querySelectorAll('#명세서판 .명세-바닥 button')];
  const r = 단 ? 단.getBoundingClientRect() : null;
  return { 있나: !!단, 글: 단 ? (단.textContent || '').trim() : '',
           죽음: 단 ? !!단.disabled : null,
           높: r ? Math.round(r.height) : 0, 폭: r ? Math.round(r.width) : 0,
           단추수: 들.length, 가로: document.documentElement.scrollWidth };
});

// ── ① 큐알로 연 명세서에만 단추가 선다 ─────────────────────────────
const 가 = await 열기(터 + '?' + encodeURIComponent('명세') + '=' + encodeURIComponent(큐알));
const 섰나 = await 단추보기(가.p);
console.log('■ 큐알로 연 명세서: ' + JSON.stringify(섰나));
판('① 큐알로 연 명세서에 「입고확인」 단추가 선다',
   섰나.있나 && 섰나.글 === '입고확인' && 섰나.죽음 === false, JSON.stringify(섰나));
판('① 단추는 넷이 되고 48px 이상 · 375px 가로 넘침 없다',
   섰나.단추수 === 4 && 섰나.높 >= 48 && 섰나.폭 >= 48 && 섰나.가로 <= 375,
   섰나.단추수 + '개 · ' + 섰나.폭 + '×' + 섰나.높 + ' · ' + 섰나.가로 + 'px');

// ── ② 눌러서 뜨는 글귀 ─────────────────────────────────────────────
await 가.짚기('#명세-입고');
const 뜬것 = await 가.p.evaluate(() => {
  const 판 = document.getElementById('입고판'); if (!판) return { 안뜸: true };
  return { 제목: (판.querySelector('.명세-제목')?.textContent || '').trim(),
           글귀: (판.querySelector('.입고-글')?.textContent || '').trim(),
           단추: [...판.querySelectorAll('.명세-바닥 button')].map(e => (e.textContent || '').trim()),
           단추높: [...판.querySelectorAll('.명세-바닥 button')].map(e => Math.round(e.getBoundingClientRect().height)),
           닫기: !!판.querySelector('.명세-닫기'),
           자리: getComputedStyle(판).position, 바탕: getComputedStyle(판).backgroundColor,
           가로: document.documentElement.scrollWidth };
});
console.log('■ 뜬 글귀: ' + JSON.stringify(뜬것));
판('② 손가락으로 누르면 팝업이 뜬다 (이 집 창 꼴)',
   !뜬것.안뜸 && 뜬것.자리 === 'fixed' && /rgba\(0, 0, 0, 0\.6/.test(뜬것.바탕 || '') && 뜬것.닫기 === true,
   JSON.stringify({ 자리: 뜬것.자리, 바탕: 뜬것.바탕 }));
판('② 글귀가 **한 글자도 안 다르다** (업체는 그 발주 기록에서)',
   뜬것.글귀 === '입고된 수량을 정확히 확인했나요? 확인후 착오된 수량의 책임은 유한가구에 기록됩니다.',
   '「' + 뜬것.글귀 + '」');
판('② 괄호와 그 안의 말은 화면에 안 쓴다',
   !/\(|현재납품중인업체명/.test(뜬것.글귀 || ''), '「' + 뜬것.글귀 + '」');
판('② 단추는 「확인」 하나다 (「취소」 를 새로 만들지 않았다) · 48px',
   JSON.stringify(뜬것.단추) === JSON.stringify(['확인']) && (뜬것.단추높[0] || 0) >= 48,
   JSON.stringify(뜬것.단추) + ' · ' + JSON.stringify(뜬것.단추높));
판('② 375px 가로 넘침 없다', 뜬것.가로 <= 375, 뜬것.가로 + 'px');
if (그림칸()) await 가.p.screenshot({ path: 그림칸() + '/in-375-입고묻기.png' });

// ── ③ 「확인」 을 누르면 진짜로 적힌다 ──────────────────────────────
await 가.짚기('#입고-확인');
const 적힌것 = await 가.p.evaluate(() => ({
  쓴곳: window.__쓴곳.slice(),
  값: window.__쓴값[(window.__쓴곳[0] || '')] || null,
  판닫힘: !document.getElementById('입고판'),
  단추글: (document.getElementById('명세-입고')?.textContent || '').trim(),
  단추죽음: !!document.getElementById('명세-입고')?.disabled,
  기록그대로: window.__기록찍기() === window.__기록전,
  명세표줄: (() => { const v = window.__쓴값[(window.__쓴곳[0] || '')] || {};
    return (v.명세표 || []).reduce((a, 묶) => a + (묶.계획들 || []).reduce(
      (b, g) => b + (g.품목들 || []).length, 0), 0); })(),
  화면줄: (window._명세서지금 || {}).줄수 }));
console.log('■ 적힌 것: ' + JSON.stringify(적힌것));
판('③ 새 칸 **입고확인** 에 적힌다 · 문서 id 는 **찍힌 큐알 글**이다',
   적힌것.쓴곳.length === 1
   && 적힌것.쓴곳[0] === 'artifacts/vivivic-4b7ef/public/data/입고확인/' + 큐알,
   JSON.stringify(적힌것.쓴곳));
판('③ 담긴 칸이 시킨 그대로다 (큐알·발주번호·파레트·납기일·업체·줄수·총수량·시각·uid·글귀·판)',
   !!적힌것.값 && ['큐알','발주번호','발주문서','파레트','납기일','업체','줄수','총수량','명세표','확인시각','확인시각글','확인uid','글귀','판']
     .every(k => k in 적힌것.값)
   && 적힌것.값.업체 === '유한가구' && 적힌것.값.파레트 === 'A'
   && 적힌것.값.발주번호 === '유한-20261009-01'
   && 적힌것.값.큐알 === 큐알 && 적힌것.값.확인uid === '시험uid'
   && 적힌것.값.글귀 === '입고된 수량을 정확히 확인했나요? 확인후 착오된 수량의 책임은 유한가구에 기록됩니다.',
   JSON.stringify(적힌것.값));
/* 10-12 지시: 「입고확인된 명세표는 … 기록되게」 — **그때 그 표**를 그대로 담는다.
   나중에 다시 그리면 발주가 바뀐 뒤엔 딴 종이가 나온다. 그것은 기록이 아니다. */
판('③ **그때 그 명세표**가 담긴다 (화면에 떠 있던 표와 같은 줄)',
   Array.isArray(적힌것.값 && 적힌것.값.명세표) && 적힌것.명세표줄 === 적힌것.값.줄수
   && 적힌것.명세표줄 === 적힌것.화면줄,
   '담긴 줄 ' + 적힌것.명세표줄 + ' · 적힌 줄수 ' + (적힌것.값 || {}).줄수 + ' · 화면 ' + 적힌것.화면줄);
판('③ 담긴 표에 부속 이름·크기·수량·코드·파레트가 다 있다',
   (() => { const g = (((적힌것.값 || {}).명세표 || [])[0] || {}).계획들 || [];
     const 품 = ((g[0] || {}).품목들 || [])[0] || {};
     return g.length > 0 && (g[0].파 === 'A')
       && 품.이름 && 품.크기 && 품.몫 != null && /^TA_/.test(품.코드 || ''); })(),
   JSON.stringify(((적힌것.값 || {}).명세표 || [])[0] || null));
판('③ 발주 기록을 통째로 베끼지 않는다 (화면이 읽는 넷만)',
   (() => { const o = (((적힌것.값 || {}).명세표 || [])[0] || {}).발주 || {};
     return JSON.stringify(Object.keys(o).sort())
       === JSON.stringify(['code', 'deliveryDate', 'displayName', 'orderCode']); })(),
   JSON.stringify(Object.keys(((((적힌것.값 || {}).명세표 || [])[0] || {}).발주) || {})));
판('③ 사람 이름·전화·주소는 안 담는다',
   !!적힌것.값 && !Object.keys(적힌것.값).some(k => /이름|전화|주소|email|phone/i.test(k)),
   JSON.stringify(Object.keys(적힌것.값 || {})));
판('④ **업무 기록에는 한 글자도 안 쓴다** (새 칸 하나뿐)',
   적힌것.기록그대로 === true
   && 적힌것.쓴곳.every(k => /\/입고확인\//.test(k)),
   '기록 그대로 ' + 적힌것.기록그대로 + ' · 쓴 곳 ' + JSON.stringify(적힌것.쓴곳));
판('⑤ 적힌 뒤 창이 닫히고 단추가 「입고확인 · 시각」 으로 잠긴다',
   적힌것.판닫힘 === true && /^입고확인 · \d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(적힌것.단추글)
   && 적힌것.단추죽음 === true, '「' + 적힌것.단추글 + '」 · 죽음 ' + 적힌것.단추죽음);
판('⑤ 두 번 안 적힌다 (눌러도 그대로)',
   await (async () => { await 가.짚기('#명세-입고');
     return (await 가.p.evaluate(() => window.__쓴곳.length)) === 1; })(),
   await 가.p.evaluate(() => window.__쓴곳.length + '번'));
판('① 페이지오류 없음', 가.errs.length === 0, String(가.errs.length) + (가.errs[0] ? ' :: ' + 가.errs[0] : ''));
await 가.p.close();

// ── ⑥ 이미 확인한 큐알은 열 때부터 잠겨 있다 ──────────────────────
const 나 = await 열기(터 + '?' + encodeURIComponent('명세') + '=' + encodeURIComponent(큐알));
await 나.p.evaluate((큐알) => {
  // 적어 둔 것이 이미 있는 자리로 꾸민다
  window.__창고['artifacts/vivivic-4b7ef/public/data/입고확인/' + 큐알] =
    { 큐알, 확인시각글: '2026-10-11 18:40' };
  window._명세서닫기(); window._명세서열기('2026-10-21', '납기', 'A', 'd9901', 큐알);
}, 큐알);
await 나.p.waitForTimeout(500);
const 이미 = await 단추보기(나.p);
console.log('■ 이미 확인한 큐알: ' + JSON.stringify(이미));
판('⑥ 이미 확인한 큐알은 열 때부터 「입고확인 · 시각」 으로 잠겨 있다',
   이미.있나 && 이미.글 === '입고확인 · 2026-10-11 18:40' && 이미.죽음 === true,
   JSON.stringify(이미));
await 나.p.close();

/* ── ⑥-2 ⚠ **먼저 적힌 기록을 덮지 않는다** ─────────────────────────────
   열 때 읽기가 한 번 어긋나면 「이미 적혔다」 를 모른 채 확인을 누르게 된다.
   그때도 **먼저 확인한 사람의 시각·uid 가 그대로** 남아야 한다 — 책임을 적는 기록이다.
   읽고 나서 쓰는 길과 runTransaction 길 **둘 다** 잰다. */
for (const 트랜 of [false, true]) {
  const 꼴 = 트랜 ? '(runTransaction)' : '(읽고 나서 쓰기)';
  const 마 = await 열기(터 + '?' + encodeURIComponent('명세') + '=' + encodeURIComponent(큐알), false, 트랜);
  await 마.p.evaluate((큐알) => {
    const 길 = 'artifacts/vivivic-4b7ef/public/data/입고확인/' + 큐알;
    window.__창고[길] = { 큐알, 확인시각글: '2026-10-11 09:00', 확인uid: '먼저온사람', 업체: '유한가구' };
    // ⚠ **열 때 읽기가 어긋난 것처럼** 꾸민다 — 단추가 안 잠긴 채로 누르게 된다
    window._명세서지금.입고됨 = '';
    const 단 = document.getElementById('명세-입고');
    if (단) { 단.textContent = '입고확인'; 단.disabled = false; 단.classList.remove('끝났다'); }
  }, 큐알);
  await 마.짚기('#명세-입고');
  await 마.짚기('#입고-확인');
  const 덮었나 = await 마.p.evaluate((큐알) => {
    const 길 = 'artifacts/vivivic-4b7ef/public/data/입고확인/' + 큐알;
    return { 남은값: window.__창고[길], 쓴곳: window.__쓴곳.length,
             단추글: (document.getElementById('명세-입고')?.textContent || '').trim(),
             단추죽음: !!document.getElementById('명세-입고')?.disabled,
             판남음: !!document.getElementById('입고판'),
             붉은띠: !!document.getElementById('입고-탈') };
  }, 큐알);
  console.log('■ 이미 적힌 큐알에 또 확인 ' + 꼴 + ': ' + JSON.stringify(덮었나));
  판('⑥ 먼저 적힌 **시각·uid 가 안 바뀐다** ' + 꼴,
     덮었나.남은값 && 덮었나.남은값.확인시각글 === '2026-10-11 09:00'
     && 덮었나.남은값.확인uid === '먼저온사람' && 덮었나.쓴곳 === 0,
     JSON.stringify(덮었나.남은값) + ' · 쓴 곳 ' + 덮었나.쓴곳);
  판('⑥ 단추는 **먼저 적힌 시각**으로 잠기고 창이 닫힌다 ' + 꼴,
     덮었나.단추글 === '입고확인 · 2026-10-11 09:00' && 덮었나.단추죽음 === true
     && 덮었나.판남음 === false,
     '「' + 덮었나.단추글 + '」 · 창 ' + 덮었나.판남음);
  판('⑥ 「이미 있다」 는 **탈이 아니다** — 붉은 띠를 안 띄운다 ' + 꼴,
     덮었나.붉은띠 === false, '붉은 띠 ' + 덮었나.붉은띠);
  await 마.p.close();
}

// ── ⑦ 못 적으면 **거짓 초록 없이** 한 줄로 알린다 ───────────────────
const 다 = await 열기(터 + '?' + encodeURIComponent('명세') + '=' + encodeURIComponent(큐알), true);
await 다.짚기('#명세-입고');
await 다.짚기('#입고-확인');
const 막힘 = await 다.p.evaluate(() => ({
  탈글: (document.getElementById('입고-탈')?.textContent || '').trim(),
  판남음: !!document.getElementById('입고판'),
  단추글: (document.getElementById('명세-입고')?.textContent || '').trim(),
  단추죽음: !!document.getElementById('명세-입고')?.disabled,
  확인단추: (document.getElementById('입고-확인')?.textContent || '').trim(),
  쓴곳: window.__쓴곳.length }));
console.log('■ 쓰기를 막았을 때: ' + JSON.stringify(막힘));
판('⑦ 못 적으면 **「기록을 못 남겼습니다」** 가 뜬다',
   막힘.탈글 === '기록을 못 남겼습니다' && 막힘.판남음 === true, '「' + 막힘.탈글 + '」');
판('⑦ **거짓 초록이 없다** — 단추가 「입고확인」 그대로고 안 잠긴다',
   막힘.단추글 === '입고확인' && 막힘.단추죽음 === false && 막힘.쓴곳 === 0,
   '「' + 막힘.단추글 + '」 · 죽음 ' + 막힘.단추죽음 + ' · 쓴 곳 ' + 막힘.쓴곳);
판('⑦ 다시 눌러 볼 수 있다 (확인 단추가 살아 있다)',
   막힘.확인단추 === '확인', '「' + 막힘.확인단추 + '」');
// 두 번 떨어져도 붉은 띠는 **한 줄**만 (쌓이지 않는다)
await 다.짚기('#입고-확인');
판('⑦ 두 번 떨어져도 붉은 띠는 한 줄이다',
   (await 다.p.evaluate(() => document.querySelectorAll('.입고-탈').length)) === 1,
   (await 다.p.evaluate(() => document.querySelectorAll('.입고-탈').length)) + '줄');
if (그림칸()) await 다.p.screenshot({ path: 그림칸() + '/in-375-입고못적음.png' });
판('⑦ 터지지 않는다', 다.errs.length === 0, String(다.errs.length) + (다.errs[0] ? ' :: ' + 다.errs[0] : ''));
await 다.p.close();

// ── ⑧ 큐알이 아닌 길로 연 명세서에는 단추가 **없다** ─────────────────
const 라 = await 열기(터);
const 없어야 = await 라.p.evaluate(() => {
  const 본 = {};
  window._명세서열기('2026-10-21', '납기');                      // 머리줄 단추와 같은 길
  본.전체 = !!document.getElementById('명세-입고'); window._명세서닫기();
  window._명세서열기('2026-10-21', '납기', 'A', 'd9901');        // 큐알 네모의 단추와 같은 길
  본.큐알네모 = !!document.getElementById('명세-입고'); window._명세서닫기();
  window._명세서열기('2026-10-21', '재단');                      // 다른 공정
  본.재단 = !!document.getElementById('명세-입고'); window._명세서닫기();
  return 본;
});
console.log('■ 큐알이 아닌 길: ' + JSON.stringify(없어야));
판('⑧ 머리줄(전체)·큐알네모 단추·재단으로 연 명세서에는 단추가 **없다**',
   없어야.전체 === false && 없어야.큐알네모 === false && 없어야.재단 === false,
   JSON.stringify(없어야));
판('⑧ 페이지오류 없음', 라.errs.length === 0, String(라.errs.length) + (라.errs[0] ? ' :: ' + 라.errs[0] : ''));
await 라.p.close();

await b.close();
console.log(실패 === 0 ? '입고확인1   OK' : '입고확인1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
