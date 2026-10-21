/* **CS등록**을 재는 자 (10-16).
   사장님 (메뉴 화면을 짚어 보내신 말씀, 그대로): 「**cs등록 항목을 만들어줘**」(장부 a1792145842)
   보아야 하는 것 —
     ㄱ) 메뉴 단추가 **4개 → 5개** 인가 · 새 단추가 다른 넷과 **같은 꼴**인가(숫자로)
     ㄴ) 눌러서 가는 곳이 주문관리(`/System/Sales/orderMst.aspx`) + `#vgCS` 인가 (10-21 사장님 지시)
     ㄷ) 그 표를 달고 배송관리에 오면 **CS등록 판이 저절로 뜨나**
     ㄹ) 남긴 것이 **한 자리에 보이나** · 안 끝난 접수가 **또렷한가**
     ㅁ) 주문번호를 쳐서 **상담 판이 열리나** · 줄을 눌러도 열리나
     ㅂ) 남기면 창고로 **무엇이 나가나** — **사람 칸 0개** · 쓰는 칸이 `vpcs_note` **하나뿐**인가
     ㅅ) `#vgCS` 가 **없으면** 배송관리는 전과 똑같은가
     ㅇ) 375px·1280px 그림
   ⚠ 진짜 vendorpia.com·창고는 못 닿는다. 흉내로 세워 잰다. 자료는 전부 가짜. */
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

(async () => {
  fs.mkdirSync(그림칸, { recursive: true });
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  let 초록 = 0, 빨강 = 0;
  const 못 = (참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };
  console.log('\n■ CS등록 (10-16 사장님 「cs등록 항목을 만들어줘」)');
  console.log('  ⚠ 자료는 전부 가짜. 사람 칸(수취인·전화·주소)을 **일부러 심어** 새는지 본다.');

  for (const [w, h] of [[1280, 900], [375, 812]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const 창고로 = [];
    await ctx.route('**://identitytoolkit.googleapis.com/**', (r) => {
      창고로.push({ 셈: r.request().method(), 길: new URL(r.request().url()).pathname, 몸: r.request().postData() || '' });
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"idToken":"ascii-fake"}' });
    });
    let 쌓인것 = [];
    await ctx.route('**://firestore.googleapis.com/**', (r) => {
      const u = new URL(r.request().url());
      const 셈 = r.request().method(), 몸 = r.request().postData() || '';
      창고로.push({ 셈, 길: u.pathname, 몸 });
      if (셈 === 'PATCH') {
        try { 쌓인것 = JSON.parse(몸).fields.log.arrayValue.values.map((x) => x.mapValue.fields); } catch (e) {}
        return r.fulfill({ status: 200, contentType: 'application/json', body: 몸 });
      }
      if (/vpcs_note$/.test(u.pathname))
        return r.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ documents: Object.entries(둔것).map(([id, f]) =>
            ({ name: '…/vpcs_note/' + id, fields: 싸기(f) })) }) });
      if (/vpcs_note\/[^/]+$/.test(u.pathname))
        return r.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ fields: { log: { arrayValue: { values: 쌓인것.length
            ? 쌓인것.map((f) => ({ mapValue: { fields: f } }))
            : [{ mapValue: { fields: { s: { stringValue: '앞서 남긴 글' },
                at: { integerValue: '1760000000' }, by: { stringValue: '7' } } } }] } } } }) });
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    const 벤더로 = [];
    await ctx.route('**://vendorpia.com/**', (r) => {
      const u = new URL(r.request().url());
      벤더로.push(r.request().method() + ' ' + u.pathname);
      if (r.request().method() === 'POST')
        return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 표 });
      if (u.pathname.endsWith('.js'))
        return r.fulfill({ status: 200, contentType: 'text/javascript', body: '/* 손잡이 (흉내) */' });
      if (/firmDvList/.test(u.pathname))
        return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 배송쪽 });
      return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 메인쪽 });
    });

    /* ── ㄱ 메뉴 화면 ─────────────────────────────── */
    const 쪽 = await ctx.newPage();
    const 탈 = []; 쪽.on('pageerror', (e) => 탈.push(String(e && e.message).slice(0, 140)));
    await 쪽.goto('https://vendorpia.com/index.aspx');
    await 쪽.addScriptTag({ content:
      'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};' });
    await 쪽.addStyleTag({ content: ['login.css', 'menu.css']
      .map((f) => fs.readFileSync(path.join(확장, f), 'utf8')).join('\n') });
    await 쪽.addScriptTag({ content: VP흉내 });
    for (const f of ['login.js', 'menu.js'])
      await 쪽.addScriptTag({ content: fs.readFileSync(path.join(확장, f), 'utf8') });
    await 쪽.waitForTimeout(600);
    const 메뉴 = await 쪽.evaluate(메뉴본다);
    console.log('\n  ◆ ' + w + '×' + h + ' — 메뉴 화면');
    console.log('    ★ 메뉴 단추 **' + 메뉴.수 + '개** (전 4개) ' + 못(메뉴.수 === 5));
    console.log('      ' + JSON.stringify(메뉴.것.map((x) => x.글)));
    const CS단추 = 메뉴.것.find((x) => x.글 === 'CS등록');
    const 딴넷 = 메뉴.것.filter((x) => x.글 !== 'CS등록');
    console.log('    ★ CS등록이 있나 ' + 못(!!CS단추) + ' · 보이나 ' + 못(!!CS단추 && CS단추.보이나)
      + ' · 가는 곳 ' + (CS단추 && CS단추.길) + ' '
      + 못(!!CS단추 && CS단추.길 === '/System/Sales/orderMst.aspx#vgCS'));
    if (CS단추) {
      /* 꼴은 **숫자로** 댄다 — 글자 수가 다르니 **너비는 빼고** 나머지를 댄다 */
      const 잴것 = ['글씨', '굵기', '글색', '바탕', '둥글기', '안여백', '키'];
      const 어긋 = 잴것.filter((k) => 딴넷.some((x) => String(x[k]) !== String(CS단추[k])));
      console.log('    ★ 다른 넷과 **같은 꼴**인가 — 어긋난 것 ' + JSON.stringify(어긋) + ' ' + 못(어긋.length === 0));
      console.log('      CS등록 : ' + JSON.stringify(Object.fromEntries(잴것.map((k) => [k, CS단추[k]]))));
    }
    await 쪽.screenshot({ path: path.join(그림칸, 'CS등록-메뉴-' + w + '.png') });

    /* ── ㄴ·ㄷ·ㄹ 배송관리 + #vgCS ──────────────────── */
    const 쪽2 = await ctx.newPage();
    const 탈2 = []; 쪽2.on('pageerror', (e) => 탈2.push(String(e && e.message).slice(0, 140)));
    await 쪽2.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx#vgCS');
    await 쪽2.addScriptTag({ content:
      'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};'
      + 'document.cookie="VP_Cookie=LOGON_EMP_NO%3D7%26x%3Dy";'
      + '(function(){var d=document.createElement("div");d.id="vp-판";'
      + 'd.textContent="벤더피아 보기 잰것 · 확장";'
      + 'd.style.cssText="position:fixed;left:6px;bottom:6px";document.body.appendChild(d);})();' });
    await 쪽2.addStyleTag({ content: ['login.css', 'search.css']
      .map((f) => fs.readFileSync(path.join(확장, f), 'utf8')).join('\n') });
    await 쪽2.addScriptTag({ content: VP흉내 });
    for (const f of ['login.js', 'search.js'])
      await 쪽2.addScriptTag({ content: fs.readFileSync(path.join(확장, f), 'utf8') });
    await 쪽2.waitForTimeout(1500);
    const cs = await 쪽2.evaluate(CS본다);
    console.log('    ★ `#vgCS` 로 오니 CS등록 판이 **저절로 떴나** ' + cs.떴나 + ' · 머리 「' + cs.머리 + '」 '
      + 못(cs.떴나 && cs.머리 === 'CS등록'));
    console.log('    ★ 남긴 것 ' + JSON.stringify(cs.줄들.map((x) => x.주문 + '|' + x.적)) + ' · ' + cs.셈글 + ' '
      + 못(cs.줄들.length === 2));
    console.log('    ★ **안 끝난 접수가 또렷한가** '
      + 못(cs.줄들.some((x) => x.열림 && /반품 접수중/.test(x.적))
          && cs.줄들.filter((x) => x.열림).length === 1));
    console.log('    ★ 주문번호 치는 칸이 있나 ' + 못(cs.찾는칸));
    console.log('    ★ **사람 칸이 판에 샜나** '
      + 못(!/가나다|010-7777-8888|○○로 99/.test(cs.판글)));
    await 쪽2.screenshot({ path: path.join(그림칸, 'CS등록-판-' + w + '.png') });

    /* 줄을 누르면 그 상담 판이 열리나 */
    await 쪽2.click('.vp-cs줄:nth-child(1)');
    await 쪽2.waitForTimeout(700);
    const 열림 = await 쪽2.evaluate(CS본다);
    console.log('    ★ 줄을 누르니 상담 판이 열리나 ' + 열림.상담떴나 + ' · ' + 열림.상담머리 + ' '
      + 못(열림.상담떴나 && /20261015-10[12]/.test(열림.상담머리 || '')));
    /* 거기서 한 줄 남긴다 — 창고로 무엇이 나가나 */
    await 쪽2.fill('.vp-상담적기 textarea', '전화 상담 — CS등록에서 남깁니다');
    await 쪽2.click('.vp-상담적기 button[type=submit]');
    await 쪽2.waitForTimeout(900);
    const 쓴것 = 창고로.filter((x) => x.셈 === 'PATCH');
    console.log('    ★ 창고에 쓴 칸 ' + JSON.stringify([...new Set(쓴것.map((x) => x.길.split('/').slice(-2, -1)[0]))])
      + ' ' + 못(쓴것.length === 1 && 쓴것.every((x) => /\/vpcs_note\/[^/]+$/.test(x.길))));
    console.log('    ★ 쓴 글에 **사람 칸이 샜나** '
      + 못(쓴것.every((x) => !/가나다|010-7777-8888|○○로 99/.test(x.몸))));
    console.log('    ★ 벤더피아에는 **조회만** 했나 '
      + 못(벤더로.every((x) => /^(GET|POST) /.test(x))));

    /* 주문번호를 쳐서 여는 길 */
    await 쪽2.keyboard.press('Escape');
    await 쪽2.waitForTimeout(200);
    await 쪽2.evaluate(() => { location.hash = ''; location.hash = '#vgCS'; });
    await 쪽2.waitForTimeout(800);
    await 쪽2.fill('.vp-cs찾기 input', '20261015-101');
    await 쪽2.click('.vp-cs찾기 button[type=submit]');
    await 쪽2.waitForSelector('.vp-cs결과 .vp-cs찾은', { timeout: 5000 });
    await 쪽2.click('.vp-cs결과 .vp-cs찾은:has-text("주문 20261015-101")');   /* 0.34.34 부터 찾으면 줄로 먼저 보이고, 상품명을 눌러야 상담 판이 열린다 */
    await 쪽2.waitForTimeout(700);
    const 친것 = await 쪽2.evaluate(CS본다);
    console.log('    ★ 주문번호를 쳐서 상담 판이 열리나 ' + 친것.상담떴나 + ' · ' + 친것.상담머리 + ' '
      + 못(친것.상담떴나 && /20261015-101/.test(친것.상담머리 || '')));

    /* ㅅ `#vgCS` 가 없으면 전과 똑같아야 한다 */
    const 쪽3 = await ctx.newPage();
    await 쪽3.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx');
    await 쪽3.addScriptTag({ content:
      'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};' });
    await 쪽3.addStyleTag({ content: ['login.css', 'search.css']
      .map((f) => fs.readFileSync(path.join(확장, f), 'utf8')).join('\n') });
    await 쪽3.addScriptTag({ content: VP흉내 });
    for (const f of ['login.js', 'search.js'])
      await 쪽3.addScriptTag({ content: fs.readFileSync(path.join(확장, f), 'utf8') });
    await 쪽3.waitForTimeout(1200);
    const 맨 = await 쪽3.evaluate(CS본다);
    console.log('    ★ `#vgCS` 없이 오면 CS등록 판이 **안 뜨나** ' + !맨.떴나 + ' ' + 못(!맨.떴나));
    if (탈.length || 탈2.length) {
      console.log('    터진 말: ' + JSON.stringify([...new Set([...탈, ...탈2])].slice(0, 3))); 빨강++;
    }
    await ctx.close();
  }
  console.log('\n  그림: 잰것/그림/CS등록-메뉴-{1280,375}.png · CS등록-판-{1280,375}.png');
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  await b.close();
  process.exit(빨강 ? 1 : 0);
})().catch((e) => { console.error('터짐: ' + (e && e.stack || e)); process.exit(1); });
