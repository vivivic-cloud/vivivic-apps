// 「화베에 업로드된 자료의 재단부속코드/엣지부속코드/보링부속코드/nc부속코드/조립부속코드 를
//  확인하여 관련 명세서의 관련 부속에 맞는 부속코드가 명세서에 나타나게 해주세요.
//  조립부속코드는 납기명세서에 나타납니다.」  — 사장님 말씀 (10-11)
// 원장에 적힌 이름은 **「NC부속코드」(대문자)** 다. 공정마다 제 칸을 봐야 한다 —
// 엣지 명세서에 재단 코드가 뜨면 안 된다. 칸이 비면 0 이 아니라 **빈칸**이다.
// 업무 기록에는 이 칸이 없다 — 카드 열쇠의 원장줄번호로 **원장을 읽는다**. 쓰기는 0 이어야 한다.
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
await ctx.route('https://cdn.sheetjs.com/**', r => r.fulfill({ status: 200, contentType: 'application/javascript',
  body: readFileSync(HERE + '/node_modules/xlsx/dist/xlsx.full.min.js', 'utf-8') }));
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1500);
const cdp = await ctx.newCDPSession(p);
const 손 = (t, x, y) => cdp.send('Input.dispatchTouchEvent',
  { type: t, touchPoints: t === 'touchEnd' ? [] : [{ x, y, radiusX: 14, radiusY: 14, force: 1 }] });
const 끌기 = async (x, y, dx, dy) => {
  await 손('touchStart', x, y);
  for (let i = 1; i <= 14; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove',
      touchPoints: [{ x: x + dx * i / 14, y: y + dy * i / 14, radiusX: 14, radiusY: 14, force: 1 }] });
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

// ── ⓪ 원장 머리줄에 다섯 칸이 **그 이름 그대로** 있는가 ────────────────
const 머리칸 = await p.evaluate(() => {
  const h = currentFullData[0] || [];
  const 짝 = { '재단': '재단부속코드', '엣지': '엣지부속코드', '보링': '보링부속코드',
               'NC': 'NC부속코드', '납기': '조립부속코드' };
  const 본 = {}; Object.entries(짝).forEach(([k, v]) => { 본[k] = { 이름: v, 자리: h.indexOf(v) }; });
  return { 본, 코드칸들: h.filter(x => /부속코드$/.test(String(x))) };
});
console.log('■ 원장 머리줄: ' + JSON.stringify(머리칸));
판('⓪ 원장에 다섯 칸이 그 이름 그대로 있다 (NC 는 대문자 「NC부속코드」)',
   Object.values(머리칸.본).every(x => x.자리 >= 0),
   JSON.stringify(Object.entries(머리칸.본).map(([k, v]) => k + ':' + v.이름 + '(' + v.자리 + ')')));

// ── 그 공정 일감이 있는 날에 카드 둘을 완료로 심고, 그 원장줄에 코드를 적어 둔다 ──
const 심기 = async (공정) => {
  const r = await p.evaluate((공정) => {
    const 날들 = [...new Set([...document.querySelectorAll('[onclick*="tlExpandDateCard"]')]
      .map(e => (e.getAttribute('onclick').match(/tlExpandDateCard\('([^']+)'/) || [])[1]).filter(Boolean))];
    const 고른 = 날들.find(d => { const m = window._tlDcGetItems(d);
      return m && m[공정] && m[공정].items && m[공정].items.length; });
    if (!고른) return { 못세움: true };
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
      심은.push(ck);
    });
    // 그 원장 줄에 **아는 코드**를 적어 둔다 (이 창의 복사본에만 — 파일은 안 건드린다)
    const h = currentFullData[0] || [];
    const 적 = (ri, 이름, 값) => { const i = h.indexOf(이름); if (i >= 0 && currentFullData[ri]) currentFullData[ri][i] = 값; };
    const 줄들 = 심은.map(ck => { const m = String(ck).match(/card-\d+-(\d+)$/); return m ? parseInt(m[1], 10) : null; })
                      .filter(x => x != null);
    줄들.forEach((ri, n) => {
      적(ri, '재단부속코드', 'TC_시험_' + ri);
      // 둘째 줄의 엣지 코드는 **일부러 비워 둔다** — 비면 빈칸인지 보려고
      적(ri, '엣지부속코드', n === 1 ? '' : 'TE_시험_' + ri);
      적(ri, '보링부속코드', 'TB_시험_' + ri);
      적(ri, 'NC부속코드', 'TN_시험_' + ri);
      적(ri, '조립부속코드', 'TA_시험_' + ri);
    });
    window.tlDcExpandSection(공정);
    return { 날: 고른, 심은, 줄들 };
  }, 공정);
  if (r.못세움 || !(r.심은 || []).length) return { 못세움: true };
  await p.waitForTimeout(350);
  if (!await 짚기('#tl-datecard-expand .tl-dc-single-hdr .명세-단추')) return { 단추없음: true };
  const 본 = await p.evaluate(() => {
    const 판 = document.getElementById('명세서판'); if (!판) return { 안열림: true };
    const 표 = 판.querySelector('.명세-표');
    const 줄 = [...표.querySelectorAll('tr')];
    const 머리 = [...줄[0].children].map(e => (e.textContent || '').replace(/\s+/g, '').trim());
    const 코드자리 = 머리.indexOf('부속코드');
    const 짠 = window._명세서줄들();
    const 종이코드자리 = 짠 ? 짠.칸들.findIndex(c => c[0] === '부속코드') : -1;
    return { 머리, 코드자리,
             // 몸줄의 첫 칸 묶음은 rowspan 이라 **줄마다 칸 수가 다르다** — 코드만 뽑는다
             // 합계·전잔액 줄은 일한 줄이 아니다 — 빼고 센다
             화면코드: [...표.querySelectorAll('tr')].slice(2).filter(tr => !tr.classList.contains('합'))
               .map(tr => [...tr.children].map(e => (e.textContent || '').trim()))
               .map(td => td.find(v => /^T[CEBNA]_시험_\d+$/.test(v)) || (td.length ? '(없음)' : '')),
             종이코드자리,
             종이코드: 짠 ? 짠.줄들.map(줄 => 종이코드자리 >= 0 ? 줄.값[종이코드자리] : null) : null,
             종이칸: 짠 ? 짠.칸들.map(c => c[0]) : null };
  });
  return Object.assign({}, r, 본);
};

const 봄 = {};
for (const 공정 of ['재단', '엣지', '보링']) {
  봄[공정] = await 심기(공정);
  console.log('■ ' + 공정 + ': ' + JSON.stringify(봄[공정]));
  if (!봄[공정].못세움 && !봄[공정].안열림) {
    if (그림칸()) {
      const 가 = await p.evaluate(() => { const r = document.querySelector('#명세서판 .명세-몸').getBoundingClientRect();
        return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; });
      await 끌기(가.x, 가.y, -300, 0); await 끌기(가.x, 가.y, -300, 0);
      await p.screenshot({ path: 그림칸() + '/code-375-' + (공정 === '재단' ? 'cut' : 공정 === '엣지' ? 'edge' : 'bore') + '부속코드.png' });
    }
    await 짚기('#명세서판 .명세-닫기');
  }
}

const 머릿글자 = { '재단': 'TC', '엣지': 'TE', '보링': 'TB' };
for (const 공정 of ['재단', '엣지', '보링']) {
  const m = 봄[공정]; const 꼬리 = ' (' + 공정 + ')';
  판('① 명세서에 「부속코드」 칸이 선다' + 꼬리, !m.못세움 && m.코드자리 >= 0,
     m.코드자리 + '번째 · ' + JSON.stringify(m.머리));
  if (m.못세움 || m.코드자리 < 0) continue;
  const 기대 = m.줄들.map((ri, n) => (공정 === '엣지' && n === 1) ? '' : 머릿글자[공정] + '_시험_' + ri);
  판('② 그 칸에 **제 공정의** 코드가 뜬다 (원장 줄 그대로)' + 꼬리,
     JSON.stringify(m.화면코드.map(v => v === '(없음)' ? '' : v)) === JSON.stringify(기대),
     '화면 ' + JSON.stringify(m.화면코드) + ' · 바란 것 ' + JSON.stringify(기대));
  판('③ 다른 공정의 코드는 안 뜬다' + 꼬리,
     m.화면코드.every(v => v === '(없음)' || v.startsWith(머릿글자[공정])),
     JSON.stringify(m.화면코드));
  판('④ 종이(PDF)에도 같은 칸·같은 값이다' + 꼬리,
     m.종이코드자리 >= 0 && JSON.stringify(m.종이코드) === JSON.stringify(기대),
     '자리 ' + m.종이코드자리 + ' · ' + JSON.stringify(m.종이코드));
}
// 엣지 둘째 줄은 원장이 비어 있다 — 0 이 아니라 **빈칸**이어야 한다
판('⑤ 원장 칸이 비면 0 이 아니라 **빈칸**이다',
   !봄['엣지'].못세움 && 봄['엣지'].화면코드[1] === '(없음)'
   && 봄['엣지'].종이코드[1] === '',
   '화면 「' + (봄['엣지'].화면코드 || [])[1] + '」 · 종이 「' + ((봄['엣지'].종이코드 || [])[1]) + '」');

// ── 납기는 조립부속코드를 본다 · 없는 줄에도 안 터진다 ─────────────────
const 더 = await p.evaluate((줄들) => {
  // 고침이 없으면 이 자리가 아예 없다 — 터뜨리지 말고 「없다」 로 적어 빨갛게 둔다
  if (typeof window._명세서부속코드 !== 'function') return { 자리없음: true };
  const h = currentFullData[0] || [];
  const 읽 = (ri, 이름) => { const i = h.indexOf(이름); return i < 0 ? null : String(currentFullData[ri][i]); };
  const ri = 줄들[0];
  return { 납기: window._명세서부속코드('납기', ri), 원장조립: 읽(ri, '조립부속코드'),
           NC: window._명세서부속코드('NC', ri), 원장NC: 읽(ri, 'NC부속코드'),
           없는줄: window._명세서부속코드('재단', 999999),
           빈줄번호: window._명세서부속코드('재단', null),
           모르는공정: window._명세서부속코드('포장', ri) };
}, 봄['재단'].줄들);
console.log('■ 납기·NC·없는 줄: ' + JSON.stringify(더));
판('⑥ 납기는 **조립부속코드**를 본다 (이름이 다르다)',
   더.납기 !== '' && 더.납기 === 더.원장조립, '「' + 더.납기 + '」 ↔ 원장 「' + 더.원장조립 + '」');
판('⑥ NC 는 대문자 「NC부속코드」 를 본다', 더.NC !== '' && 더.NC === 더.원장NC,
   '「' + 더.NC + '」 ↔ 원장 「' + 더.원장NC + '」');
판('⑦ 원장 줄이 없거나 모르는 공정이면 빈칸이고 안 터진다',
   더.없는줄 === '' && 더.빈줄번호 === '' && 더.모르는공정 === '',
   JSON.stringify([더.없는줄, 더.빈줄번호, 더.모르는공정]));

// ── 엑셀 머리에도 선다 ────────────────────────────────────────────────
const 엑 = await p.evaluate((날들) => {
  if (typeof XLSX === 'undefined') return { 엑셀없음: true };
  const 담 = {}; const 원래 = XLSX.writeFile;
  ['재단', '엣지', '보링'].forEach(공정 => {
    const 날 = 날들[공정]; if (!날) return;
    window._명세서열기(날, 공정);
    XLSX.writeFile = (wb) => { const a = XLSX.utils.sheet_to_json(wb.Sheets['내역'], { header: 1 });
      담[공정] = { 머리: a[0], 첫줄: a[1] }; };
    window._명세서엑셀(); window._명세서닫기();
  });
  XLSX.writeFile = 원래; return 담;
}, { '재단': 봄['재단'].날, '엣지': 봄['엣지'].날, '보링': 봄['보링'].날 });
console.log('■ 엑셀: ' + JSON.stringify(엑));
if (엑.엑셀없음) console.log('  (엑셀 꾸러미가 없는 자리 — 건너뜀)');
else 판('⑧ 엑셀 머리에도 「부속코드」 가 서고 값이 들어간다',
   ['재단', '엣지', '보링'].every(k => !엑[k] || (엑[k].머리.indexOf('부속코드') >= 0
     && /^T[CEB]_시험_\d+$/.test(String(엑[k].첫줄[엑[k].머리.indexOf('부속코드')] || '')))),
   JSON.stringify(['재단', '엣지', '보링'].map(k => 엑[k] && [엑[k].머리.indexOf('부속코드'),
     엑[k].첫줄[엑[k].머리.indexOf('부속코드')]])));

const 끝 = await p.evaluate(() => ({ 쓰기: window.__쓰기, 가로: document.documentElement.scrollWidth }));
판('⑨ 파이어스토어에 한 줄도 안 쓴다 (원장은 읽기만)', 끝.쓰기 === 0, 끝.쓰기 + '번');
판('⑨ 375px 가로 스크롤 없다', 끝.가로 <= 375, 끝.가로 + 'px');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '부속코드1   OK' : '부속코드1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
