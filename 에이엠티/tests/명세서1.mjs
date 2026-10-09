// 「공정작업지시서상 공정카드의 작업이 완료가 되면 … 공정명이 적힌 헤더 우측 부분에
//  명세서 발급 버튼을 만들고 버튼을 누르면 해당일의 현재까지의 작업내용이 양식에 맞춰
//  나타나고 발급버튼으로 확정하여 인쇄하기 pdf / 엑셀 로 보내기가 가능하게 해주세요.」
//   — 사장님 말씀 (10-09)
// 머리줄 오른쪽에 단추가 서는지 · 닿는 자리가 44px 인지 · 진짜 손가락으로 눌렀을 때
// **그날 완료된 작업만** 양식대로 펴지는지 · 발급 전에는 인쇄·엑셀이 죽어 있는지 ·
// 파이어스토어에 한 줄도 안 쓰는지 를 잰다.
import { 브라우저열기, devices, 서버, 자료, 자재 } from './도구/터.mjs';
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
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1500);
const cdp = await ctx.newCDPSession(p);
const 손 = (t, x, y) => cdp.send('Input.dispatchTouchEvent',
  { type: t, touchPoints: t === 'touchEnd' ? [] : [{ x, y, radiusX: 14, radiusY: 14, force: 1 }] });
const 짚기 = async (고르개) => {
  const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null;
    e.scrollIntoView({ block: 'center' }); const b2 = e.getBoundingClientRect();
    return { x: Math.round(b2.x + b2.width / 2), y: Math.round(b2.y + b2.height / 2) }; }, 고르개);
  if (!r) return false;
  await 손('touchStart', r.x, r.y); await p.waitForTimeout(60); await 손('touchEnd', 0, 0);
  await p.waitForTimeout(500); return true;
};

const 차림 = await p.evaluate(({ O, C, L }) => {
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
  const 날들 = [...new Set([...document.querySelectorAll('[onclick*="tlExpandDateCard"]')]
    .map(e => (e.getAttribute('onclick').match(/tlExpandDateCard\('([^']+)'/) || [])[1]).filter(Boolean))];
  const 고른 = 날들.find(d => { const m = window._tlDcGetItems(d); return m && m['재단'] && m['재단'].items && m['재단'].items.length; });
  if (!고른) return { 못세움: true, 날수: 날들.length };
  window.tlExpandDateCard(고른); window.tlDcExpandSection('재단');
  return { 날: 고른 };
}, { O, C, L });
console.log('■ 차림: ' + JSON.stringify(차림));
if (차림.못세움) { console.log('명세서1   FAIL (재단 일감이 있는 날을 못 찾음)'); process.exit(1); }
await p.waitForTimeout(400);

// ── 그날 재단 카드 가운데 둘을 완료로 심는다 (이 창의 복사본에만) ──────────────
const 심기 = await p.evaluate((날) => {
  const sk = 날 + '-재단';
  const 카드들 = (window._woBoringParts || {})[sk] || [];
  if (!카드들.length) return { 카드없음: true };
  const 심은 = [];
  카드들.slice(0, 2).forEach(c => {
    const o = confirmedOrders.find(x => (x.docId || String(x.idNum)) === c.orderKey)
           || confirmedOrders.find(x => (c.coveredOrderIds || []).includes(x.idNum));
    if (!o) return;
    const ck = window._woPartKey(c.cKey, o.docId || String(o.idNum), c);
    o.partCompletions = o.partCompletions || {};
    o.partCompletions[ck] = Object.assign({}, o.partCompletions[ck], {
      '재단': { done: true, date: 날, partName: c.nm || '부속', actualQty: c.dq || 0, actualMinutes: 1 } });
    심은.push({ 칸: ck, 이름: c.nm, 몫: c.dq, 매: c.sheets, 발주: o.orderCode });
  });
  window.tlDcExpandSection('재단');
  return { 심은 };
}, 차림.날);
console.log('■ 심은 완료: ' + JSON.stringify(심기));
if (심기.카드없음 || !심기.심은 || !심기.심은.length) { console.log('명세서1   FAIL (재단 카드를 못 찾음)'); process.exit(1); }
await p.waitForTimeout(400);

const 단추 = await p.evaluate(() => {
  const e = document.querySelector('#tl-datecard-expand .tl-dc-single-hdr .명세-단추');
  if (!e) return { 없음: true, 머리: (document.querySelector('#tl-datecard-expand .tl-dc-single-hdr')?.textContent || '').trim() };
  const r = e.getBoundingClientRect();
  const a = getComputedStyle(e, '::after');
  const hdr = e.parentElement.getBoundingClientRect();
  return { 글: (e.textContent || '').trim(), 폭: Math.round(r.width), 높이: Math.round(r.height),
           닿는높이: parseFloat(a.height) || 0,
           오른쪽끝: Math.round(hdr.right - r.right), 문서가로: document.documentElement.scrollWidth };
});
console.log('■ 단추: ' + JSON.stringify(단추));
판('① 공정명 머리줄에 「명세서」 단추가 선다', !단추.없음 && 단추.글 === '명세서', JSON.stringify(단추));
판('① 머리줄 **오른쪽 끝**에 붙는다', !단추.없음 && 단추.오른쪽끝 <= 20, 단추.오른쪽끝 + 'px 남음');
판('① 닿는 자리가 44px 이상이다 (장갑 낀 손)',
   !단추.없음 && 단추.닿는높이 >= 44 && 단추.폭 >= 44, 단추.폭 + '×' + 단추.닿는높이);

const 열기전 = await p.evaluate(() => ({
  머리: (document.querySelector('#tl-datecard-expand .tl-dc-single-hdr')?.textContent || '').replace(/\s+/g, ' ').trim(),
  카드수: document.querySelectorAll('#tl-datecard-expand .wo-boring-placed-card').length,
  공정: document.querySelector('#tl-datecard-expand .tl-dc-panel')?.dataset.공정 || '',
  몸넘침: document.body.style.overflow || '' }));
await 짚기('#tl-datecard-expand .tl-dc-single-hdr .명세-단추');
const 판본 = await p.evaluate(() => {
  const 판 = document.getElementById('명세서판');
  if (!판) return { 안열림: true };
  const 줄 = [...판.querySelectorAll('.명세-표 tr')].map(tr => (tr.textContent || '').replace(/\s+/g, ' ').trim());
  const 머리 = (판.querySelector('.명세-제목')?.textContent || '').trim();
  const 표수 = 판.querySelectorAll('.명세-표').length;
  return { 머리, 표수, 줄수: 줄.length, 줄: 줄.slice(0, 6),
           몰라: 판.querySelectorAll('.명세-몰라').length,
           발급: !document.getElementById('명세-발급')?.disabled,
           인쇄죽음: !!document.getElementById('명세-인쇄')?.disabled,
           엑셀죽음: !!document.getElementById('명세-엑셀')?.disabled,
           PDF죽음: !!document.getElementById('명세-PDF')?.disabled,
           보내기죽음: !!document.getElementById('명세-보내기')?.disabled,
           단추자리: [...판.querySelectorAll('.명세-바닥 button')].map(e => {
             const r = e.getBoundingClientRect();
             return { 글: (e.textContent || '').trim(), 높: Math.round(r.height), 폭: Math.round(r.width) }; }),
           번호: (document.getElementById('명세-번호')?.textContent || '').trim(),
           단가: window._재단단가,
           돈줄: [...판.querySelectorAll('.명세-표 tr')].map(tr => {
             const td = [...tr.children].map(x => (x.textContent || '').trim());
             const i = td.findIndex(v => /^\d+매$/.test(v));
             return i < 0 ? null : { 매: parseInt(td[i], 10), 돈: td[i + 1] };
           }).filter(Boolean),
           합계줄: (() => { const tr = [...판.querySelectorAll('.명세-표 tr')]
               .find(x => /합\s*계/.test(x.textContent || ''));
             if (!tr) return null; const td = [...tr.children].map(x => (x.textContent || '').trim());
             return { 매: td[1], 돈: td[2] }; })(),
           문서가로: document.documentElement.scrollWidth, 쓰기: window.__쓰기,
           꼴: (() => { const g = getComputedStyle(판); const 속 = 판.querySelector('.명세-속');
             const r = 속 && 속.getBoundingClientRect();
             return { 자리: g.position, 바탕: g.backgroundColor,
                      속있나: !!속, 속둥글: 속 ? getComputedStyle(속).borderRadius : '',
                      속폭: r ? Math.round(r.width) : 0,
                      바탕보임: r ? Math.round(r.top) > 0 : false }; })() };
});
console.log('■ 펴진 명세서: ' + JSON.stringify(판본));
판('② 단추를 누르면 명세서가 펴진다', !판본.안열림, JSON.stringify(판본.머리 || ''));
판('② 양식대로 두 쪽이다 (내역 + 원장 소요량)', 판본.표수 === 2, 판본.표수 + '개');
판('② **팝업 창**으로 뜬다 (어두운 바탕 + 가운데 흰 창 — 이 집 창 꼴)',
   !판본.안열림 && 판본.꼴.자리 === 'fixed' && /rgba\(0, 0, 0, 0\.6/.test(판본.꼴.바탕)
   && 판본.꼴.속있나 === true && parseFloat(판본.꼴.속둥글) >= 12 && 판본.꼴.바탕보임 === true,
   JSON.stringify(판본.꼴));
판('② 그날 완료된 작업이 줄로 선다', 판본.줄수 >= 4, 판본.줄수 + '줄 / ' + JSON.stringify(판본.줄.slice(2, 4)));
판('② 심은 부속 이름이 그 안에 보인다',
   !판본.안열림 && 심기.심은.some(x => 판본.줄.join(' ').includes(String(x.이름))) ,
   JSON.stringify(심기.심은.map(x => x.이름)) + ' / ' + JSON.stringify(판본.줄.slice(2, 5)));
판('③ 모르는 칸은 빨간 「?」 로 둔다 (지어내지 않는다)', 판본.몰라 >= 6, 판본.몰라 + '칸');
// 재단금액 — 원장 한 장당 2,400원(부가세 포함). 단가는 한 자리(window._재단단가)에만 있다.
판('③ 단가가 한 자리에 2,400원으로 있다', 판본.단가 === 2400, String(판본.단가));
판('③ 줄마다 재단금액 = 원장수량 × 2,400 이다',
   판본.돈줄.length > 0 && 판본.돈줄.every(x => x.돈 === (x.매 * 2400).toLocaleString('ko-KR')),
   JSON.stringify(판본.돈줄.map(x => x.매 + '매 → ' + x.돈)));
판('③ 합계 금액도 합계 매수 × 2,400 이다',
   !!판본.합계줄 && 판본.합계줄.돈 === (parseInt(판본.합계줄.매, 10) * 2400).toLocaleString('ko-KR'),
   JSON.stringify(판본.합계줄));
판('④ 발급 전에는 인쇄·PDF·엑셀·보내기가 다 죽어 있다',
   판본.인쇄죽음 === true && 판본.엑셀죽음 === true && 판본.PDF죽음 === true && 판본.보내기죽음 === true,
   JSON.stringify({ 인쇄: 판본.인쇄죽음, PDF: 판본.PDF죽음, 엑셀: 판본.엑셀죽음, 보내기: 판본.보내기죽음 }));
판('④ 단추는 모두 44px 이상이다 (장갑 낀 손)',
   판본.단추자리.length === 5 && 판본.단추자리.every(x => x.높 >= 44),
   JSON.stringify(판본.단추자리));
판('④ 발급 전에는 발급번호가 없다', 판본.번호 === '', JSON.stringify(판본.번호));

await 짚기('#명세-발급');
const 발급뒤 = await p.evaluate(() => ({
  번호: (document.getElementById('명세-번호')?.textContent || '').trim(),
  발급죽음: !!document.getElementById('명세-발급')?.disabled,
  인쇄살음: !document.getElementById('명세-인쇄')?.disabled,
  엑셀살음: !document.getElementById('명세-엑셀')?.disabled,
  PDF살음: !document.getElementById('명세-PDF')?.disabled,
  보내기살음: !document.getElementById('명세-보내기')?.disabled,
  쓰기: window.__쓰기, 문서가로: document.documentElement.scrollWidth }));
console.log('■ 발급 뒤: ' + JSON.stringify(발급뒤));
판('⑤ 발급을 누르면 번호가 찍힌다', /\d{8}-재단/.test(발급뒤.번호), JSON.stringify(발급뒤.번호));
판('⑤ 그제야 인쇄·PDF·엑셀·보내기가 다 살아난다',
   발급뒤.인쇄살음 === true && 발급뒤.엑셀살음 === true && 발급뒤.PDF살음 === true && 발급뒤.보내기살음 === true,
   JSON.stringify(발급뒤));

/* ── PDF (10-09 지시 「pdf로도 발급 되어야 하고 외부보내기 가능하게」) ─────
   바깥 꾸러미(CDN)를 못 받는 상자라 제 손으로 짠다 — 장을 캔버스에 그려 JPEG 로
   떠서 PDF 에 넣는다. 여기서는 **진짜 바이트**를 꺼내 머리글·크기·쪽수를 잰다. */
const pdf = await p.evaluate(async () => {
  const blob = window._명세서PDF만들기();
  if (!blob) return { 없음: true };
  const buf = new Uint8Array(await blob.arrayBuffer());
  const 끝 = String.fromCharCode(...buf.subarray(buf.length - 6));
  return { 크기: blob.size, 갈래: blob.type, 장수: window._명세서장들().length,
           머리: String.fromCharCode(...buf.subarray(0, 8)), 끝: 끝.trim(),
           쪽수: (String.fromCharCode(...buf.subarray(0, 400)).match(/\/Count (\d+)/) || [])[1] };
});
console.log('■ PDF: ' + JSON.stringify(pdf));
판('⑥ PDF 가 **파일로** 나온다 (%PDF 로 시작하고 %%EOF 로 끝난다)',
   !pdf.없음 && pdf.머리 === '%PDF-1.4' && /%%EOF/.test(pdf.끝) && pdf.갈래 === 'application/pdf',
   JSON.stringify(pdf));
판('⑥ 빈 파일이 아니다 (장 수와 크기)', !pdf.없음 && pdf.크기 > 20000 && pdf.장수 >= 1
   && String(pdf.쪽수) === String(pdf.장수), pdf.크기 + '바이트 · ' + pdf.장수 + '장 · PDF 쪽수 ' + pdf.쪽수);

/* 외부보내기 — 이 상자에는 공유판이 없다. 허수아비 navigator.share 를 놓고
   **무엇이 실려 나가는지**(파일 이름·크기·형식) 담아서 본다. */
const 실린것 = await p.evaluate(async () => {
  window.__실린것 = null;
  navigator.share = async (d) => { window.__실린것 = { 제목: d.title, 글: d.text,
    파일: (d.files || []).map(f => ({ 이름: f.name, 크기: f.size, 갈래: f.type })) }; };
  navigator.canShare = () => true;
  await window._명세서보내기();
  return window.__실린것;
});
console.log('■ 외부보내기에 실린 것: ' + JSON.stringify(실린것));
판('⑦ 외부보내기에 PDF 파일이 실려 나간다 (이름·크기·형식)',
   !!실린것 && 실린것.파일.length === 1 && /^명세서_\d{4}-\d{2}-\d{2}_재단\.pdf$/.test(실린것.파일[0].이름)
   && 실린것.파일[0].갈래 === 'application/pdf' && 실린것.파일[0].크기 === pdf.크기,
   JSON.stringify(실린것));
판('⑤ 두 번 발급되지 않는다', 발급뒤.발급죽음 === true, String(발급뒤.발급죽음));

await 짚기('#명세서판 .명세-닫기');
const 닫힘 = await p.evaluate(() => !document.getElementById('명세서판'));
판('⑥ 닫기를 누르면 닫힌다', 닫힘 === true, String(닫힘));
const 열기후 = await p.evaluate(() => ({
  머리: (document.querySelector('#tl-datecard-expand .tl-dc-single-hdr')?.textContent || '').replace(/\s+/g, ' ').trim(),
  카드수: document.querySelectorAll('#tl-datecard-expand .wo-boring-placed-card').length,
  공정: document.querySelector('#tl-datecard-expand .tl-dc-panel')?.dataset.공정 || '',
  몸넘침: document.body.style.overflow || '' }));
판('⑥ 닫으면 **보던 화면이 그대로** 돌아온다 (머리줄·카드 수·공정·몸 스크롤)',
   JSON.stringify(열기전) === JSON.stringify(열기후),
   JSON.stringify(열기전) + ' → ' + JSON.stringify(열기후));
// 어두운 바탕을 눌러도 닫힌다
await 짚기('#tl-datecard-expand .tl-dc-single-hdr .명세-단추');
const 또열림 = await p.evaluate(() => !!document.getElementById('명세서판'));
await p.evaluate(() => { const 판 = document.getElementById('명세서판');
  const r = 판.getBoundingClientRect(); window.__바탕점 = { x: Math.round(r.x + 8), y: Math.round(r.y + 8) }; });
const 점 = await p.evaluate(() => window.__바탕점);
await 손('touchStart', 점.x, 점.y); await p.waitForTimeout(60); await 손('touchEnd', 0, 0);
await p.waitForTimeout(400);
const 바탕닫힘 = await p.evaluate(() => !document.getElementById('명세서판'));
판('⑥ 어두운 바탕을 눌러도 닫힌다', 또열림 === true && 바탕닫힘 === true,
   '열림 ' + 또열림 + ' · 바탕 눌러 닫힘 ' + 바탕닫힘);
판('⑦ 파이어스토어에 한 줄도 안 쓴다', 발급뒤.쓰기 === 0, 발급뒤.쓰기 + '번');
판('⑦ 375px 가로 스크롤 없다', 발급뒤.문서가로 <= 375, 발급뒤.문서가로 + 'px');
판('페이지오류 없음', errs.length === 0, String(errs.length) + (errs[0] ? ' :: ' + errs[0] : ''));
await b.close();
console.log(실패 === 0 ? '명세서1   OK' : '명세서1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
