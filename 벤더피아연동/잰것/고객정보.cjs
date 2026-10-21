const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const 그림칸 = path.join(__dirname, '그림');
const PAGES = require('./본보기/PAGES.cjs');

/* 배송관리 표 — 사람 칸에 **가짜지만 알아볼 수 있는 글**을 심는다(창고로 새는지 보려고) */
const 머리 = ["CS","CS주문번호","IMG","매출처","주문번호","주문번호","가용수량","상품명","몰","주문자",
  "수취인","휴대전화","주소","배송사","송장번호","배송상태","비고"];
const 샘값 = { 수취인: "가나다", 휴대전화: "010-7777-8888", 주소: "경기도 ○○시 ○○로 99" };
const 줄들 = Array.from({ length: 3 }, (_, i) => 머리.map((c, j) =>
  j === 4 ? "20261015-" + (100 + i)
  : j === 7 ? "토리블리 2단 와이드 교구장"
  : 샘값[c] !== undefined ? 샘값[c] : c + "-" + i));

const 폼 = `<form name="aspnetForm" method="post" action="/System/Delivery/firmDvList.aspx" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-15"><input name="dcEndDt" id="dcEndDt" value="2026-10-15">
<select name="ddlDStatus" id="ddlDStatus"><option value="">전체</option><option value="V1">배송완료</option></select>
<select name="ddlDeliveryCo" id="ddlDeliveryCo"><option value="">전체</option><option value="V1">가주문</option></select>
<select name="ddlStore" id="ddlStore"><option value="">전체</option><option value="V1">가매출처</option></select>
<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select>
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div></form>`;
const 배송쪽 = `<html><head><meta charset="utf-8"><title>배송목록조회</title></head><body id="body">${폼}</body></html>`;
/* 로그인된 메인 화면 — `menu.js` 는 「배송관리」 라는 링크가 있어야 제 일을 한다 */
const 메인쪽 = `<html><head><meta charset="utf-8"><title>vendorpia</title></head><body id="body">
<div id="벤더피아제메뉴"><a href="/System/Delivery/firmDvList.aspx">배송관리</a>
<a href="/System/Master/goods.aspx">단품관리</a></div></body></html>`;
const 표 = `<html><body><span>총 ${줄들.length} 건</span>
<table><tr>${머리.map(h=>`<th>${h}</th>`).join('')}</tr>
${줄들.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</table></body></html>`;
const VP흉내 = `var VP_DATA = { PAGES: ${JSON.stringify(PAGES)},
  ymd: function (d) { var z=function(n){return String(n).padStart(2,"0");};
    return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate()); },
  list: async function(){ return { cachedAt: null }; }, prefetch: function(){}, clearCache: async function(){} };
window.VP저장 = { get: async function(){return {};}, set: async function(){}, remove: async function(){} };`;

/* 창고에 이미 남아 있는 것 둘 — 하나는 **접수가 안 끝난** 줄이다 */
const 둔것 = {
  '20261015-101': { cnt: 2, ord: '20261015-101', at: 1760500000 },
  '20261015-102': { cnt: 1, ord: '20261015-102', at: 1760600000, open: true, kind: '반품' },
};
const 싸기 = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k,
  typeof v === 'boolean' ? { booleanValue: v }
  : typeof v === 'number' ? { integerValue: String(v) } : { stringValue: String(v) }]));

const 메뉴본다 = () => {
  const 것 = [...document.querySelectorAll('#vp-root .vp-btn')].map((a) => {
    const s = getComputedStyle(a), r = a.getBoundingClientRect();
    return { 글: a.textContent.trim(), 길: a.getAttribute('href'),
      글씨: s.fontSize, 굵기: s.fontWeight, 글색: s.color, 바탕: s.backgroundColor,
      둥글기: s.borderRadius, 안여백: s.padding, 키: Math.round(r.height),
      보이나: r.width > 2 && r.height > 2 };
  });
  return { 수: 것.length, 것 };
};
const CS본다 = () => {
  const 판 = document.querySelector('.vp-cs판');
  const 상담 = document.querySelector('.vp-상담판:not(.vp-cs판)');
  return {
    떴나: !!판, 머리: 판 ? (판.querySelector('.vp-상담머리 strong') || {}).textContent : null,
    셈글: 판 ? (판.querySelector('.vp-상담머리 small') || {}).textContent : null,
    줄들: 판 ? [...판.querySelectorAll('.vp-cs줄')].map((b) => ({
      주문: (b.querySelector('strong') || {}).textContent || '',
      적: (b.querySelector('small') || {}).textContent || '',
      열림: b.classList.contains('vp-열림') })) : [],
    찾는칸: !!(판 && 판.querySelector('.vp-cs찾기 input')),
    판글: 판 ? 판.textContent : '',
    상담떴나: !!상담, 상담머리: 상담 ? (상담.querySelector('.vp-상담머리 small') || {}).textContent : null,
  };
};

/* **고객정보**를 재는 자 (10-21). 사장님: 「cs등록할때 주문관리에 있는 모든 고객정보가 확인되게 해주세요」
   보아야 하는 것 — ㄱ) 배송관리 표에서 상담 판을 열면 그 줄의 칸이 **전부** 나오나 ㄴ) CS등록에서 주문번호로 열면
   벤더피아에 조회해 같은 칸이 나오나 ㄷ) 없는 주문은 없다고 하나(남의 줄을 안 보이나) ㄹ) 창고로 사람 칸이 0개인가 ㅁ) 벤더피아엔 조회만 */
(async () => {
  fs.mkdirSync(그림칸, { recursive: true });
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  let 초록 = 0, 빨강 = 0;
  const 못 = (참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };
  const 사람 = /가나다|010-7777-8888|○○로 99/;
  for (const [w, h] of [[1280, 900], [375, 812]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const 창고로 = [], 벤더로 = [];
    await ctx.route('**://identitytoolkit.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"idToken":"x"}' }));
    await ctx.route('**://firestore.googleapis.com/**', (r) => {
      창고로.push({ 셈: r.request().method(), 몸: r.request().postData() || '' });
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await ctx.route('**://vendorpia.com/**', (r) => {
      const u = new URL(r.request().url()), m = r.request().method();
      벤더로.push(m + ' ' + u.pathname);
      if (m === 'POST') {
        const 몸 = decodeURIComponent(r.request().postData() || '');
        const 묻은 = (몸.match(/2026\d{4}-\d+/) || [])[0];
        const 찾는 = 줄들.filter((x) => !묻은 || x[4] === 묻은);
        const 내용 = `<html><body><span>총 ${찾는.length} 건</span><table><tr>${머리.map(h=>`<th>${h}</th>`).join('')}</tr>${찾는.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</table></body></html>`;
        return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 내용 });
      }
      if (u.pathname.endsWith('.js')) return r.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
      return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 배송쪽 });
    });
    const 쪽 = await ctx.newPage();
    const 탈 = []; 쪽.on('pageerror', (e) => 탈.push(String(e && e.message).slice(0, 140)));
    await 쪽.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx');
    await 쪽.addScriptTag({ content: 'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};document.cookie="VP_Cookie=LOGON_EMP_NO%3D7%26x%3Dy";' });
    await 쪽.addStyleTag({ content: ['login.css', 'search.css'].map((f) => fs.readFileSync(path.join(확장, f), 'utf8')).join('\n') });
    await 쪽.addScriptTag({ content: VP흉내 });
    for (const f of ['login.js', 'search.js']) await 쪽.addScriptTag({ content: fs.readFileSync(path.join(확장, f), 'utf8') });
    await 쪽.waitForTimeout(800);
    const 읽기 = () => 쪽.evaluate(() => {
      const 칸 = document.querySelector('.vp-고객정보');
      return { 있나: !!칸, 이름: [...document.querySelectorAll('.vp-고객목록 dt')].map((x) => x.textContent),
        값: [...document.querySelectorAll('.vp-고객목록 dd')].map((x) => x.textContent), 글: 칸 ? 칸.textContent : '' };
    });
    console.log('\n  ◆ ' + w + '×' + h);
    await 쪽.evaluate(() => { document.querySelector('.vp-bar input[name=from]').value = '2026-07-15'; document.querySelector('.vp-bar input[name=to]').value = '2026-10-15'; });
    await 쪽.click('.vp-bar button[type=submit]');
    await 쪽.waitForSelector('.vp-상담알', { timeout: 5000 });
    await 쪽.click('tbody tr:nth-child(1) .vp-상담알');
    await 쪽.waitForTimeout(500);
    let g = await 읽기();
    const 채운 = (줄) => 머리.filter((c, i) => String(줄[i]).trim());
    console.log('    ★ 표에서 연 판 — 벤더피아 ' + 채운(줄들[0]).length + '칸 / 판 ' + g.이름.length + '칸 ' + 못(g.이름.join() === 채운(줄들[0]).join()));
    console.log('    ★ 수취인·휴대전화·주소 값이 보이나 ' + 못(g.값.includes('가나다') && g.값.includes('010-7777-8888') && g.값.includes('경기도 ○○시 ○○로 99')));
    await 쪽.screenshot({ path: path.join(그림칸, '고객정보-표-' + w + '.png') });
    await 쪽.keyboard.press('Escape');
    await 쪽.evaluate(() => { location.hash = '#vgCS'; });
    await 쪽.waitForSelector('.vp-cs찾기 input');
    await 쪽.fill('.vp-cs찾기 input', '20261015-101');
    await 쪽.click('.vp-cs찾기 button[type=submit]');
    await 쪽.waitForSelector('.vp-cs결과 .vp-cs찾은', { timeout: 5000 });
    await 쪽.click('.vp-cs결과 .vp-cs찾은');   /* 0.34.34 부터 찾으면 줄로 보이고, 상품명을 눌러야 판이 열린다 */
    await 쪽.waitForTimeout(900);
    g = await 읽기();
    console.log('    ★ CS등록에서 주문번호로 연 판 — 칸 ' + g.이름.length + '/' + 채운(줄들[1]).length + ' ' + 못(g.이름.join() === 채운(줄들[1]).join()));
    console.log('    ★ 그 주문 값만 나오나 ' + 못(g.값.includes('20261015-101') && !g.값.includes('20261015-100') && !g.값.includes('20261015-102')));
    await 쪽.screenshot({ path: path.join(그림칸, '고객정보-CS등록-' + w + '.png') });
    await 쪽.keyboard.press('Escape');
    await 쪽.evaluate(() => { location.hash = ''; location.hash = '#vgCS'; });
    await 쪽.waitForSelector('.vp-cs찾기 input');
    await 쪽.fill('.vp-cs찾기 input', '20269999-1');
    await 쪽.click('.vp-cs찾기 button[type=submit]');
    await 쪽.waitForTimeout(900);
    g = await 읽기();
    const 없음 = await 쪽.evaluate(() => (document.querySelector('.vp-cs결과') || {}).textContent || '');
    console.log('    ★ 없는 주문은 「찾은 주문이 없습니다」, 판 안 열리고 남의 값 0 ' + 못(/찾은 주문이 없습니다/.test(없음) && !g.있나 && !g.이름.length));
    console.log('    ★ 창고로 사람 칸 샘 ' + 못(창고로.every((x) => !사람.test(x.몸))) + ' · 쓰기 ' + 창고로.filter((x) => x.셈 === 'PATCH').length + '개');
    console.log('    ★ 벤더피아에는 조회만 ' + 못(벤더로.every((x) => /^(GET|POST) /.test(x))));
    if (탈.length) { console.log('    터진 말: ' + JSON.stringify(탈.slice(0, 3))); 빨강++; }
    await ctx.close();
  }
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  await b.close();
  process.exit(빨강 ? 1 : 0);
})().catch((e) => { console.error('터짐: ' + (e && e.stack || e)); process.exit(1); });
