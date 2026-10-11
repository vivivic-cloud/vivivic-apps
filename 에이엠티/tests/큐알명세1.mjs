// 「스캔내용 클릭시 해당 납기 명세서가 나타나야 합니다.」 — 사장님 말씀 (10-11 · 조혼가구 화면)
// 조혼가구가 큐알을 찍어 **주소에 그 글을 실어** 이 화면을 연다:
//     …/에이엠티/에이엠티.html?명세=유한-20261009-01-A
// ① 열쇠를 붙여 열면 그 건의 **납기 명세서가 바로** 뜨는지 ② 찍은 파레트 줄이 짚이는지
// ③ 열쇠가 **없으면** 첫 화면이 전과 한 글자도 안 다른지 ④ 없는 큐알이면 **한 줄로** 알리고
// 안 터지는지 ⑤ 손잡이(?viggle=1)와 같이 와도 둘 다 도는지 를 잰다.
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

const 날 = '2026-10-21';
// 자료를 심는 것은 **창이 열리자마자**(자료가 오기 전) 해야 한다 —
// 조혼가구가 주소로 열 때와 같은 차례를 그대로 흉내 낸다.
const 심을것 = (L) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display', 'none');
  window.__쓰기 = 0; const 셈 = () => async () => { window.__쓰기++; };
  window.db = {}; window.storage = {};
  window.fbFirestore = { doc: () => ({}), updateDoc: 셈(), setDoc: 셈(), deleteDoc: 셈(), addDoc: 셈(),
    collection: () => ({}), onSnapshot: () => {}, query: x => x, serverTimestamp: () => 0,
    getDoc: async () => ({ exists: () => false }), getDocs: async () => ({ forEach: () => {} }), deleteField: () => null };
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
    code: '시험상품 스캔',
    supplier: normalizeValue(currentFullData[줄[0]][h.indexOf('ing발주처')]),
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
  document.documentElement.removeAttribute('data-amthome');
  document.documentElement.removeAttribute('data-amtstock');
  return { 줄, 이름들: 줄.map(이름) };
};

const 열기 = async (주소) => {
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  const 알림 = [];
  await p.goto(주소, { waitUntil: 'load' });
  await p.waitForTimeout(900);
  const 심 = await p.evaluate(심을것, L);
  // 이제 자료가 「왔다」 고 알린다 — 진짜 길과 같은 차례다
  await p.evaluate(() => { ['원장', '발주', '도면', '차례'].forEach(k => window._자료왔다 && window._자료왔다(k)); });
  await p.waitForTimeout(900);
  return { p, errs, 심 };
};

// ── ① 열쇠를 붙여 연다 ──────────────────────────────────────────────
const 큐알 = '유한-20261009-01-A';
const 가 = await 열기(터 + '?' + encodeURIComponent('명세') + '=' + encodeURIComponent(큐알));
const 본 = await 가.p.evaluate(() => {
  const 판 = document.getElementById('명세서판');
  if (!판) return { 안열림: true, 화면: (document.body.innerText || '').slice(0, 60) };
  const 표 = 판.querySelector('.명세-표');
  const 줄들 = [...표.querySelectorAll('tr')];
  const 머리칸 = [...줄들[0].children].map(e => (e.textContent || '').replace(/\s+/g, '').trim());
  const 몸줄 = 줄들.slice(2).filter(tr => !tr.classList.contains('합'))
    .map(tr => [...tr.children].map(e => (e.textContent || '').trim()));
  // 같은 날 **전체**는 몇 줄인가 — 추린 것과 견준다 (셈은 한 벌이다)
  const 전체 = window._명세서모으기(window._명세서지금.날짜, '납기');
  const 파별 = {};
  전체.forEach(묶 => 묶.계획들.forEach(g => { const k = g.파 || '없음';
    파별[k] = (파별[k] || 0) + g.품목들.length; }));
  const 전체줄 = Object.values(파별).reduce((a, c) => a + c, 0);
  return { 제목: (판.querySelector('.명세-제목')?.textContent || '').replace(/\s+/g, ' ').trim(),
           머리칸, 파레트칸: 머리칸.includes('파레트'),
           몸줄, 줄수: 몸줄.length,
           파값: 몸줄.map(td => td.find(v => /^[ABCD]$|^없음$/.test(v)) || '').filter(Boolean),
           전체줄, 파별,
           지금: window._명세서지금 ? { 날짜: window._명세서지금.날짜, 공정: window._명세서지금.공정,
                                        파: window._명세서지금.파, 줄수: window._명세서지금.줄수 } : null,
           종이줄: (window._명세서줄들() || { 줄들: [] }).줄들.length,
           쓰기: window.__쓰기, 가로: document.documentElement.scrollWidth };
});
console.log('■ 열쇠로 연 것: ' + JSON.stringify(본));
판('① 주소에 큐알 글을 실어 열면 **납기 명세서가 바로 뜬다**',
   !본.안열림 && /납기 내역/.test(본.제목 || ''), JSON.stringify(본.제목 || 본.화면));
판('① 그 건이 맞다 (납기일 2026-10-21 · 공정 납기)',
   !!본.지금 && 본.지금.날짜 === 날 && 본.지금.공정 === '납기', JSON.stringify(본.지금));
/* 10-11 사장님: 「조혼가구 스캔시 **딱 그 큐알의 해당 명세서만** 보이게 해줘」.
   그래서 앞 판의 「줄만 짚기」 를 걷고 **그 파레트치만** 편다. */
판('② 머리에 어느 파레트치인지 적힌다 (「… 납기 내역 · A 파레트」)',
   /납기 내역 · A 파레트$/.test(본.제목 || '') && (본.지금 || {}).파 === 'A',
   '「' + 본.제목 + '」 · 지금 파 ' + (본.지금 || {}).파);
판('② **A 파레트 줄만** 뜬다 (B·없음은 안 나온다)',
   본.줄수 === (본.파별['A'] || 0) && 본.파값.every(v => v === 'A') && 본.줄수 > 0,
   'A ' + 본.줄수 + '줄 · 적힌 파레트 ' + JSON.stringify(본.파값));
판('② 전체는 더 많다 — 추린 것이 전체보다 적다 (더하면 전체와 맞는다)',
   본.전체줄 > 본.줄수 && Object.values(본.파별).reduce((a, c) => a + c, 0) === 본.전체줄,
   '전체 ' + 본.전체줄 + '줄 = ' + JSON.stringify(본.파별) + ' → A 만 ' + 본.줄수 + '줄');
판('② 셈한 줄 수(_명세서지금.줄수)도 추린 것에 맞는다',
   (본.지금 || {}).줄수 === 본.줄수, (본.지금 || {}).줄수 + ' / 화면 ' + 본.줄수);
판('② **종이(PDF)·엑셀도 추린 것만** 담긴다 (화면만 추리면 더 나쁘다)',
   본.종이줄 === 본.줄수, '종이 ' + 본.종이줄 + '줄 · 화면 ' + 본.줄수 + '줄');
판('② 파이어스토어에 한 줄도 안 쓴다 · 375px 가로 넘침 없다',
   본.쓰기 === 0 && 본.가로 <= 375, 본.쓰기 + '번 · ' + 본.가로 + 'px');
판('② 페이지오류 없음 (열쇠 붙여 열기)', 가.errs.length === 0,
   String(가.errs.length) + (가.errs[0] ? ' :: ' + 가.errs[0] : ''));
if (그림칸()) await 가.p.screenshot({ path: 그림칸() + '/scan-375-큐알명세.png' });
await 가.p.close();

// ── ③ 열쇠 없이 열면 첫 화면이 전과 같아야 한다 ────────────────────
const 나 = await 열기(터);
const 민낯 = await 나.p.evaluate(() => ({
  판있나: !!document.getElementById('명세서판'),
  했나: window._주소명세했다,
  화면: (document.body.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80) }));
console.log('■ 열쇠 없이: ' + JSON.stringify(민낯));
판('③ 열쇠가 없으면 명세서가 안 뜬다 (첫 화면 그대로)',
   민낯.판있나 === false && 민낯.했나 === false, JSON.stringify(민낯));
판('③ 페이지오류 없음 (열쇠 없이)', 나.errs.length === 0,
   String(나.errs.length) + (나.errs[0] ? ' :: ' + 나.errs[0] : ''));
await 나.p.close();

// ── ③-2 머리줄의 「명세서」 단추는 **전체**를 편다 (바꾸면 안 된다) ──────
const 마 = await 열기(터);
const 전체본 = await 마.p.evaluate(() => {
  window.tlExpandDateCard('2026-10-21'); window.tlDcExpandSection('납기');
  const e = document.querySelector('#tl-datecard-expand .tl-dc-single-hdr .명세-단추');
  if (!e) return { 단추없음: true };
  e.click();
  const 판 = document.getElementById('명세서판'); if (!판) return { 안열림: true };
  const 표 = 판.querySelector('.명세-표');
  const 줄 = [...표.querySelectorAll('tr')].slice(2).filter(tr => !tr.classList.contains('합'));
  return { 제목: (판.querySelector('.명세-제목')?.textContent || '').replace(/\s+/g, ' ').trim(),
           줄수: 줄.length, 파: window._명세서지금.파,
           파값: 줄.map(tr => [...tr.children].map(e2 => (e2.textContent || '').trim())
             .find(v => /^[ABCD]$|^없음$/.test(v)) || '').filter(Boolean) };
});
console.log('■ 머리줄 단추(전체): ' + JSON.stringify(전체본));
판('③ 머리줄 「명세서」 단추는 **그 날 전체**를 편다 (전과 한 글자도 안 다르다)',
   !전체본.단추없음 && !전체본.안열림 && 전체본.파 === ''
   && !/파레트$/.test(전체본.제목) && 전체본.줄수 === 본.전체줄
   && 전체본.파값.length === 전체본.줄수,
   '「' + 전체본.제목 + '」 · ' + 전체본.줄수 + '줄 · ' + JSON.stringify(전체본.파값));
await 마.p.close();

// ── ④ 없는 큐알이면 한 줄로 알리고 안 터진다 ───────────────────────
const 다 = await 열기(터 + '?' + encodeURIComponent('명세') + '=' + encodeURIComponent('없는곳-20991231-99-Z'));
const 없을때 = await 다.p.evaluate(() => ({
  판있나: !!document.getElementById('명세서판'),
  알림: (document.querySelector('.toast-message, #toast-message, [class*="toast"]')?.textContent || '').trim(),
  몸글: (document.body.innerText || '').replace(/\s+/g, ' ') }));
console.log('■ 없는 큐알: ' + JSON.stringify({ 판있나: 없을때.판있나, 알림: 없을때.알림,
  한줄: /그 큐알의 발주를 못 찾았습니다/.test(없을때.몸글) }));
판('④ 없는 큐알이면 **한 줄로** 알린다 (긴 설명 없이)',
   /그 큐알의 발주를 못 찾았습니다/.test(없을때.몸글) && 없을때.판있나 === false,
   '알림 「' + (없을때.알림 || (없을때.몸글.match(/그 큐알의[^·\n]{0,30}/) || [''])[0]) + '」');
판('④ 터지지 않는다', 다.errs.length === 0,
   String(다.errs.length) + (다.errs[0] ? ' :: ' + 다.errs[0] : ''));
if (그림칸()) await 다.p.screenshot({ path: 그림칸() + '/scan-375-큐알없음.png' });
await 다.p.close();

// ── ④-2 발주는 있는데 그 파레트가 비면 **빈 표 대신 한 줄** ────────────
const 바 = await 열기(터 + '?' + encodeURIComponent('명세') + '=' + encodeURIComponent('유한-20261009-01-Z'));
const 빈파 = await 바.p.evaluate(() => {
  const 판 = document.getElementById('명세서판'); if (!판) return { 안열림: true };
  return { 제목: (판.querySelector('.명세-제목')?.textContent || '').replace(/\s+/g, ' ').trim(),
           없음글: (판.querySelector('.명세-없음')?.textContent || '').trim(),
           표있나: !!판.querySelector('.명세-표') };
});
console.log('■ 없는 파레트(Z): ' + JSON.stringify(빈파));
판('④ 그 파레트에 줄이 없으면 **빈 표 대신 한 줄**로 알린다',
   !빈파.안열림 && 빈파.표있나 === false && /Z 파레트에 담긴 것이 없습니다/.test(빈파.없음글),
   '「' + 빈파.없음글 + '」 · 표 ' + 빈파.표있나);
판('④ 그때도 머리에 어느 파레트인지 적힌다',
   /Z 파레트$/.test(빈파.제목 || ''), '「' + 빈파.제목 + '」');
판('④ 터지지 않는다 (빈 파레트)', 바.errs.length === 0,
   String(바.errs.length) + (바.errs[0] ? ' :: ' + 바.errs[0] : ''));
if (그림칸()) await 바.p.screenshot({ path: 그림칸() + '/scan-375-빈파레트.png' });
await 바.p.close();

// ── ⑤ 손잡이(?viggle=1)와 같이 와도 둘 다 돈다 ─────────────────────
const 라 = await 열기(터 + '?viggle=1&box=amt&' + encodeURIComponent('명세') + '=' + encodeURIComponent(큐알));
const 같이 = await 라.p.evaluate(() => ({
  판있나: !!document.getElementById('명세서판'),
  제목: (document.querySelector('#명세서판 .명세-제목')?.textContent || '').trim(),
  짚는화면: new URLSearchParams(location.search).get('viggle') === '1',
  박스: new URLSearchParams(location.search).get('box') }));
console.log('■ 손잡이와 같이: ' + JSON.stringify(같이));
판('⑤ 손잡이(?viggle=1&box=amt)와 같이 와도 명세서가 뜬다',
   같이.판있나 === true && /납기 내역/.test(같이.제목)
   && 같이.짚는화면 === true && 같이.박스 === 'amt', JSON.stringify(같이));
판('⑤ 페이지오류 없음 (둘 다 붙여 열기)', 라.errs.length === 0,
   String(라.errs.length) + (라.errs[0] ? ' :: ' + 라.errs[0] : ''));
await 라.p.close();

await b.close();
console.log(실패 === 0 ? '큐알명세1   OK' : '큐알명세1   FAIL (' + 실패 + ')');
process.exit(실패 ? 1 : 0);
