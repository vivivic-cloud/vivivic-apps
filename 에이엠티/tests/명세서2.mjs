// 「엣지공정의 명세서는 엣지관련만 나타나야 합니다. 명세서 양식에서 재단관련 서식이
//  나타나서는 안됩니다. 일단 현재 알 수 없는 표기는 빈킨으로 두고 재단과의 관련성부터
//  배제시켜 명세서가 엣지관련으로 작동하게 해주세요 이는 보링 단계에서도 마찬가지 입니다.」
// 「엣지 보링 납기의 명세서 에서는 원장재고및 소요량 표기가 필요 없습니다 삭제 해주세요.」
//   — 사장님 말씀 (10-11)
// 엣지·보링 명세서에서 **원장재고(원장입고일·원장수량·전잔액/현잔액)와 재단금액,
// 원장 소요량 쪽이 아예 없는지** · 모르는 칸은 0 이 아니라 **빈칸**인지 ·
// **재단 명세서는 전과 똑같은지** 를 잰다. 화면과 종이(PDF)와 엑셀을 다 본다.
import { 브라우저열기, devices, 서버, 자료, 자재, 그림칸 } from './도구/터.mjs';
await 서버();
import { readFileSync } from 'node:fs';
const HERE = await 자재();
const CSS = readFileSync(HERE + '/tw-built.css', 'utf-8');
const URL = 'http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const O = await 자료('confirmed_orders'); const C = await 자료('cutting_plans'); const L = await 자료('원장');
const b = await 브라우저열기();
let 실패 = 0; const 판 = (n, t, v) => { if (!t) 실패++; console.log((t ? '  OK  ' : '  FAIL') + '  ' + n + '   → ' + v); };
const ctx = await b.newContext({ ...devices['iPhone 12'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
await ctx.route('https://cdn.tailwindcss.com*', r => r.fulfill({ status: 200, contentType: 'application/javascript',
  body: 'document.write(' + JSON.stringify('<style>' + CSS + '</style>') + ');' }));
for (const [무늬, 길] of [['https://cdn.sheetjs.com/**', 'node_modules/xlsx/dist/xlsx.full.min.js']])
  await ctx.route(무늬, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: readFileSync(HERE + '/' + 길, 'utf-8') }));
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1500);
const cdp = await ctx.newCDPSession(p);
const 손 = (t, x, y) => cdp.send('Input.dispatchTouchEvent',
  { type: t, touchPoints: t === 'touchEnd' ? [] : [{ x, y, radiusX: 14, radiusY: 14, force: 1 }] });
const 끌기 = async (x, y, dx, dy) => {      // 진짜 손가락으로 민다
  await 손('touchStart', x, y);
  const 칸 = 14;
  for (let i = 1; i <= 칸; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove',
      touchPoints: [{ x: x + dx * i / 칸, y: y + dy * i / 칸, radiusX: 14, radiusY: 14, force: 1 }] });
    await p.waitForTimeout(16);
  }
  await 손('touchEnd', 0, 0); await p.waitForTimeout(400);
};
const 짚기 = async (고르개) => {
  const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null;
    e.scrollIntoView({ block: 'center' }); const b2 = e.getBoundingClientRect();
    return { x: Math.round(b2.x + b2.width / 2), y: Math.round(b2.y + b2.height / 2) }; }, 고르개);
  if (!r) return false;
  await 손('touchStart', r.x, r.y); await p.waitForTimeout(60); await 손('touchEnd', 0, 0);
  await p.waitForTimeout(500); return true;
};

await p.evaluate(({ O, C, L }) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  ['원장', '발주', '도면', '차례'].forEach(k => window._자료왔다 && window._자료왔다(k));
  window.__쓰기 = 0; const 셈 = () => async () => { window.__쓰기++; };
  window.db = {}; window.storage = {};
  window.fbFirestore = { doc: () => ({}), updateDoc: 셈(), setDoc: 셈(), deleteDoc: 셈(), addDoc: 셈(),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
  currentFullData.length = 0; L.forEach(r => currentFullData.push(r));
  confirmedOrders.length = 0;
  O.filter(o => o.amtTimeline === true && !o.amtConfirmedCancel).forEach(o => confirmedOrders.push(o));
  window._cuttingPlans = {}; C.forEach(c => { window._cuttingPlans[c.confirmId || c.docId] = c; });
  document.documentElement.removeAttribute('data-amthome');
  document.documentElement.removeAttribute('data-amtstock');
  switchPage('process'); appMode = 'process'; renderProcessTimeline();
}, { O, C, L });
await p.waitForTimeout(400);

// ── 그 공정 일감이 있는 날을 찾아 카드 둘을 완료로 심고, 명세서를 손가락으로 연다 ──
const 펴기 = async (공정) => {
  const 섬 = await p.evaluate((공정) => {
    const 날들 = [...new Set([...document.querySelectorAll('[onclick*="tlExpandDateCard"]')]
      .map(e => (e.getAttribute('onclick').match(/tlExpandDateCard\('([^']+)'/) || [])[1]).filter(Boolean))];
    const 고른 = 날들.find(d => { const m = window._tlDcGetItems(d);
      return m && m[공정] && m[공정].items && m[공정].items.length; });
    if (!고른) return { 못세움: true, 날수: 날들.length };
    window.tlExpandDateCard(고른); window.tlDcExpandSection(공정);
    const 카드들 = (window._woBoringParts || {})[고른 + '-' + 공정] || [];
    const 심은 = [];
    카드들.slice(0, 2).forEach(c => {
      const o = confirmedOrders.find(x => (x.docId || String(x.idNum)) === c.orderKey)
             || confirmedOrders.find(x => (c.coveredOrderIds || []).includes(x.idNum));
      if (!o) return;
      const ck = window._woPartKey(c.cKey, o.docId || String(o.idNum), c);
      o.partCompletions = o.partCompletions || {};
      o.partCompletions[ck] = Object.assign({}, o.partCompletions[ck], {
        [공정]: { done: true, date: 고른, partName: c.nm || '부속', actualQty: c.dq || 0, actualMinutes: 1 } });
      심은.push(c.nm);
    });
    window.tlDcExpandSection(공정);
    window.__날 = window.__날 || {}; window.__날[공정] = 고른;
    return { 날: 고른, 심은, 카드수: 카드들.length };
  }, 공정);
  if (섬.못세움 || !(섬.심은 || []).length) return { 못세움: true, 섬 };
  await p.waitForTimeout(350);
  const 눌림 = await 짚기('#tl-datecard-expand .tl-dc-single-hdr .명세-단추');
  if (!눌림) return { 단추없음: true, 섬 };
  const 본 = await p.evaluate(() => {
    const 판 = document.getElementById('명세서판');
    if (!판) return { 안열림: true };
    const 글 = (판.querySelector('.명세-몸')?.textContent || '').replace(/\s+/g, ' ');
    const 표들 = [...판.querySelectorAll('.명세-표')];
    const 머리 = 표들.length ? [...표들[0].querySelectorAll('tr')].slice(0, 2)
      .map(tr => [...tr.children].map(e => (e.textContent || '').replace(/\s+/g, '').trim())) : [];
    const 짠 = window._명세서줄들();
    return { 쪽수: 판.querySelectorAll('.명세-쪽').length, 표수: 표들.length,
             머리: 머리, 머릿글: 머리.flat(),
             // 「원 장」 머리 하나가 넷을 덮는다 — 명세서1 과 같은 잣대로 센다
             칸수: 머리[0] ? 머리[0].length + 3 : 0,
             줄수: 표들.length ? [...표들[0].querySelectorAll('tr')].length : 0,
             몸줄: 표들.length ? [...표들[0].querySelectorAll('tr')].slice(2)
               .map(tr => [...tr.children].map(e => (e.textContent || '').trim())) : [],
             몰라: 판.querySelectorAll('.명세-몰라').length,
             합계있나: /합\s*계/.test(글), 전잔액있나: /전잔액/.test(글),
             소요량있나: /소요량/.test(글), 금액있나: /재단금액/.test(글),
             원장수량있나: /원장수량/.test(글.replace(/\s/g, '')),
             입고일있나: /원장입고일/.test(글.replace(/\s/g, '')),
             종이칸: 짠 ? 짠.칸들.map(c => c[0]) : null,
             종이줄수: 짠 ? 짠.줄들.length : 0,
             종이값: 짠 ? (짠.줄들[0] || {}).값 : null,
             문서가로: document.documentElement.scrollWidth };
  });
  return 본;
};

const 재볼것 = {};
for (const 공정 of ['엣지', '보링', '재단']) {
  재볼것[공정] = await 펴기(공정);
  console.log('■ ' + 공정 + ' 명세서: ' + JSON.stringify(재볼것[공정]));
  if (!재볼것[공정].안열림 && !재볼것[공정].못세움) {
    if (그림칸()) {
      // 표 끝(출고예정일)까지 **손가락으로 밀어** 놓고 찍는다 — 뺀 칸이 없다는 것이
      // 그림 안에 보여야 한다. 밀기는 재는 것이 끝난 뒤에 한다.
      const 가 = await p.evaluate(() => { const r = document.querySelector('#명세서판 .명세-몸').getBoundingClientRect();
        return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; });
      await 끌기(가.x, 가.y, -320, 0); await 끌기(가.x, 가.y, -320, 0); await 끌기(가.x, 가.y, -320, 0);
      await p.screenshot({ path: 그림칸() + '/spec-375-' + (공정 === '엣지' ? 'edge' : 공정 === '보링' ? 'bore' : 'cut') + '명세서.png' });
    }
    await 짚기('#명세서판 .명세-닫기');
  }
}

for (const 공정 of ['엣지', '보링']) {
  const m = 재볼것[공정];
  const 꼬리 = ' (' + 공정 + ')';
  판('① 명세서가 펴진다' + 꼬리, !m.못세움 && !m.단추없음 && !m.안열림, JSON.stringify(m).slice(0, 160));
  if (m.못세움 || m.단추없음 || m.안열림) continue;
  판('② 원장수량 칸이 없다' + 꼬리, m.원장수량있나 === false, '있나 ' + m.원장수량있나);
  판('② 재단금액 칸이 없다' + 꼬리, m.금액있나 === false, '있나 ' + m.금액있나);
  판('② 원장입고일 칸이 없다' + 꼬리, m.입고일있나 === false, '있나 ' + m.입고일있나);
  판('② 원장 소요량 쪽이 없다 (쪽이 하나다)' + 꼬리,
     m.소요량있나 === false && m.표수 === 1 && m.쪽수 === 1, m.표수 + '표 · ' + m.쪽수 + '쪽');
  판('② 합계·전잔액/현잔액 줄이 없다' + 꼬리,
     m.합계있나 === false && m.전잔액있나 === false,
     '합계 ' + m.합계있나 + ' · 전잔액 ' + m.전잔액있나);
  판('③ 모르는 칸은 빨간 「?」 가 아니라 **빈칸**이다' + 꼬리, m.몰라 === 0, m.몰라 + '칸');
  // 10-11 지시로 「부속코드」 칸이 하나 늘었다 — 열하나가 **열둘**이 된다(부속코드1 이 본다)
  판('④ 머리 끝은 「출고예정일」, 칸은 열두 개다' + 꼬리,
     m.칸수 === 12 && m.머리[0][m.머리[0].length - 1] === '출고예정일'
     && m.머릿글.includes(공정 + '수량'),
     m.칸수 + '칸 · ' + JSON.stringify(m.머리[0]));
  판('④ 종이(PDF)도 같은 열두 칸이다' + 꼬리,
     !!m.종이칸 && m.종이칸.length === 12 && !m.종이칸.includes('원장수량')
     && !m.종이칸.includes('재단금액') && !m.종이칸.includes('원장입고일')
     && m.종이칸[11] === '출고예정일' && m.종이줄수 > 0,
     JSON.stringify(m.종이칸) + ' · ' + m.종이줄수 + '줄');
  판('④ 종이 줄에도 「?」 가 없다' + 꼬리,
     !!m.종이값 && m.종이값.every(v => v !== '?'), JSON.stringify(m.종이값));
  판('⑤ 일한 줄은 그대로 선다 (품목·사이즈·' + 공정 + '수량)' + 꼬리,
     m.몸줄.length > 0 && m.몸줄[0].length >= 3, m.몸줄.length + '줄 · ' + JSON.stringify(m.몸줄[0]));
  판('⑥ 375px 가로 스크롤 없다' + 꼬리, m.문서가로 <= 375, m.문서가로 + 'px');
}

// ── 재단은 전과 한 글자도 달라지지 않아야 한다 ───────────────────────────
const 재 = 재볼것['재단'];
판('⑦ 재단 명세서는 그대로다 — 열다섯 칸 · 두 쪽',
   !재.못세움 && 재.칸수 === 15 && 재.표수 === 2 && 재.쪽수 === 2,
   재.칸수 + '칸 · ' + 재.표수 + '표 · ' + 재.쪽수 + '쪽');
판('⑦ 재단에는 원장수량·재단금액·원장입고일이 그대로 있다',
   재.원장수량있나 === true && 재.금액있나 === true && 재.입고일있나 === true,
   '원장수량 ' + 재.원장수량있나 + ' · 재단금액 ' + 재.금액있나 + ' · 입고일 ' + 재.입고일있나);
판('⑦ 재단에는 합계·전잔액·원장 소요량이 그대로 있다',
   재.합계있나 === true && 재.전잔액있나 === true && 재.소요량있나 === true,
   '합계 ' + 재.합계있나 + ' · 전잔액 ' + 재.전잔액있나 + ' · 소요량 ' + 재.소요량있나);
판('⑦ 재단은 모르는 칸을 빨간 「?」 로 둔다 (지어내지 않는다)', 재.몰라 >= 6, 재.몰라 + '칸');
판('⑦ 재단 종이도 열다섯 칸 그대로다',
   !!재.종이칸 && 재.종이칸.length === 15 && 재.종이칸.includes('원장수량')
   && 재.종이칸.includes('재단금액') && 재.종이칸.includes('원장입고일'),
   JSON.stringify(재.종이칸));

// ── 엑셀도 같은 칸이어야 한다 (쪽도 하나) ────────────────────────────────
const 엑셀본 = await p.evaluate(async (공정들) => {
  if (typeof XLSX === 'undefined') return { 엑셀없음: true };
  const 담 = {};
  const 원래 = XLSX.writeFile;
  for (const 공정 of 공정들) {
    const 날 = window.__날[공정]; if (!날) { 담[공정] = null; continue; }
    window._명세서열기(날, 공정);
    XLSX.writeFile = (wb) => { 담[공정] = { 쪽: wb.SheetNames.slice(),
      머리: XLSX.utils.sheet_to_json(wb.Sheets['내역'], { header: 1 })[0] }; };
    window._명세서엑셀();
    window._명세서닫기();
  }
  XLSX.writeFile = 원래;
  return 담;
}, ['엣지', '보링', '재단']);
console.log('■ 엑셀: ' + JSON.stringify(엑셀본));
if (엑셀본.엑셀없음) console.log('  (엑셀 꾸러미가 없는 자리 — 엑셀 잣대는 건너뜀)');
else {
  판('⑧ 엑셀도 엣지·보링은 쪽 하나 · 열두 칸이다',
     ['엣지', '보링'].every(k => !엑셀본[k] || (엑셀본[k].쪽.length === 1 && 엑셀본[k].머리.length === 12
       && !엑셀본[k].머리.includes('원장수량') && !엑셀본[k].머리.includes('재단금액')
       && !엑셀본[k].머리.includes('원장입고일'))),
     JSON.stringify(['엣지', '보링'].map(k => 엑셀본[k] && [엑셀본[k].쪽.length, 엑셀본[k].머리.length])));
  판('⑧ 엑셀의 재단은 두 쪽 · 열다섯 칸 그대로다',
     !엑셀본['재단'] || (엑셀본['재단'].쪽.length === 2 && 엑셀본['재단'].머리.length === 15),
     JSON.stringify(엑셀본['재단'] && [엑셀본['재단'].쪽, 엑셀본['재단'].머리.length]));
}

const 끝 = await p.evaluate(() => ({ 쓰기: window.__쓰기, 가로: document.documentElement.scrollWidth }));
판('⑨ 파이어스토어에 한 줄도 안 쓴다', 끝.쓰기 === 0, 끝.쓰기 + '번');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '명세서2   OK' : '명세서2   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
