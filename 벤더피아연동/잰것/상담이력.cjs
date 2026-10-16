/* **상담 이력**을 재는 자 (10-15).
   사장님: 「상담할때 고객문의에 이력을 남기는데 이력남길수있게 해주세요」 (장부 a1792056118)
   보아야 하는 것 —
     ㄱ) 이력 단추가 **주문번호 칸 안**에 서나 · **칸 수가 그대로 23개**인가(밀어내지 않았나)
     ㄴ) 이력이 있는 줄이 **눈에 띄나**
     ㄷ) 남기면 창고로 **무엇이 나가나** — **사람 칸(수취인·전화·주소)이 0개**인가
     ㄹ) 벤더피아로는 **아무것도 안 쓰나**(POST 는 조회뿐, PATCH·PUT·DELETE 0개)
     ㅁ) **지우는 길이 없나** · 쌓이나(앞 글이 남나)
     ㅂ) 못 남겼을 때 **조용히 지나가지 않나**
     ㅅ) 375px·1280px 그림
   ⚠ 진짜 vendorpia.com·창고는 못 닿는다. 흉내로 세워 잰다. 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const 그림칸 = path.join(__dirname, '그림');
const PAGES = require('./본보기/PAGES.cjs');

/* 사장님 화면의 **진짜 칸 이름** — 장부 짚은자리에서 옮겼다. 「주문번호」 가 **두 칸**이다. */
const 머리 = ["CS","CS주문번호","IMG","매출처","주문번호","주문번호","가용수량","상품명","몰","주문자",
  "수취인","휴대전화","주소","배송사","송장번호","배송상태","송장전송","매출처코드","결제금액",
  "배송비","메모","출고일","비고"];
/* ⚠ 수취인·전화·주소에 **가짜지만 알아볼 수 있는 글**을 심는다 — 창고로 새는지 보려고 */
const 샘값 = { 수취인: "가나다", 휴대전화: "010-7777-8888", 주소: "경기도 ○○시 ○○로 99" };
const 줄들 = Array.from({ length: 4 }, (_, i) => 머리.map((c, j) =>
  j === 4 ? "20261015-" + (100 + i)
  : j === 7 ? "토리블리 2단 와이드 교구장"
  : 샘값[c] !== undefined ? 샘값[c] : c + "-" + i));

const 폼 = `<form name="aspnetForm" method="post" action="/System/Delivery/firmDvList.aspx" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-15"><input name="dcEndDt" id="dcEndDt" value="2026-10-15">
<select name="ddlDStatus" id="ddlDStatus"><option value="">전체</option><option value="V1">배송완료</option>
<option value="V2">배송중</option></select>
<select name="ddlDeliveryCo" id="ddlDeliveryCo"><option value="">전체</option><option value="V1">가주문</option>
<option value="V2">경동택배(포천)</option></select>
<select name="ddlStore" id="ddlStore"><option value="">전체</option><option value="V1">가매출처</option>
<option value="V2">나매출처</option></select>
<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select>
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div></form>`;
const 배송쪽 = `<html><head><meta charset="utf-8"><title>배송목록조회</title></head><body id="body">${폼}</body></html>`;
const 표 = `<html><body><span>총 ${줄들.length} 건</span>
<table><tr>${머리.map(h=>`<th>${h}</th>`).join('')}</tr>
${줄들.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</table></body></html>`;
const VP흉내 = `var VP_DATA = { PAGES: ${JSON.stringify(PAGES)},
  ymd: function (d) { var z=function(n){return String(n).padStart(2,"0");};
    return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate()); },
  list: async function(){ return { cachedAt: null }; }, prefetch: function(){}, clearCache: async function(){} };
window.VP저장 = { get: async function(){return {};}, set: async function(){}, remove: async function(){} };`;

const 본다 = () => {
  const 통 = document.querySelector('.vp-table');
  const 머리줄 = [...(통?.querySelectorAll('thead th') || [])].map(th => th.textContent);
  const 알들 = [...(통?.querySelectorAll('tbody .vp-상담알') || [])].map(b => ({
    글: b.textContent, 띄나: b.classList.contains('vp-있음'),
    열림: b.classList.contains('vp-열림'),
    주문칸안인가: !!b.closest('td.vp-주문칸'),
  }));
  return {
    칸수: 머리줄.length, 머리줄,
    주문칸자리: 머리줄.indexOf('주문번호'),
    알수: 알들.length, 알들,
    지우기단추있나: !!document.querySelector('.vp-상담덮개 [class*=지우], .vp-상담덮개 button[aria-label*=지우]'),
    판떴나: !!document.querySelector('.vp-상담덮개'),
    판줄수: document.querySelectorAll('.vp-상담줄').length,
    판제목: document.querySelector('.vp-상담머리 strong')?.textContent || null,
    접수줄: document.querySelector('.vp-상담접수줄')?.textContent || null,
    접수열림: !!document.querySelector('.vp-상담접수줄.vp-열림'),
    종류단추: [...document.querySelectorAll('.vp-상담종류')].map(b => b.textContent),
    상태단추: [...document.querySelectorAll('.vp-상담상태 button')]
      .map(b => b.textContent + (b.getAttribute('aria-pressed') === 'true' ? '(켬)' : '')),
    겹친넓이: (() => {
      const a = document.querySelector('.vp-상담판');
      const g = document.querySelector('.vp-곁다리 .vp-goods-panel:not([hidden])');
      if (!a || !g) return null;
      const A = a.getBoundingClientRect(), B = g.getBoundingClientRect();
      const w = Math.max(0, Math.min(A.right, B.right) - Math.max(A.left, B.left));
      const h = Math.max(0, Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top));
      return Math.round(w * h);
    })(),
    알림: document.querySelector('.vp-상담알림')?.textContent || null,
  };
};

(async () => {
  fs.mkdirSync(그림칸, { recursive: true });
  const b = await chromium.launch({ executablePath: EXE });
  console.log('\n■ 상담 이력 — 주문번호 칸에 쌓는다 · 칸 ' + 머리.length + '개');
  console.log('  ⚠ 자료는 전부 가짜. 수취인·전화·주소에 알아볼 글을 **일부러 심어** 새는지 본다.');
  let 초록 = 0, 빨강 = 0;
  const 못 = (참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };

  for (const [w, h] of [[1280, 900], [375, 812]]) {
    /* 창고 흉내 — 나간 것을 **다 적어 둔다** */
    const 창고로 = [];
    let 쌓인것 = [], 쓴접수 = null;                   // 창고에 쌓인 log · req
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    await ctx.route('**://vivivic-cloud.github.io/**', r => r.abort('blockedbyclient'));
    await ctx.route('**://identitytoolkit.googleapis.com/**', (r) => {
      창고로.push({ 셈: r.request().method(), 길: new URL(r.request().url()).pathname, 몸: r.request().postData() || '' });
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"idToken":"ascii-fake"}' });
    });
    await ctx.route('**://firestore.googleapis.com/**', (r) => {
      const u = new URL(r.request().url());
      const 셈 = r.request().method();
      const 몸 = r.request().postData() || '';
      창고로.push({ 셈, 길: u.pathname, 몸 });
      if (셈 === 'PATCH') {
        try {
          const f = JSON.parse(몸).fields;
          쌓인것 = f.log.arrayValue.values.map(x => x.mapValue.fields);
          쓴접수 = f.req && f.req.mapValue ? f.req.mapValue.fields : null;
        } catch (e) {}
        return r.fulfill({ status: 200, contentType: 'application/json', body: 몸 });
      }
      if (/vpcs_note$/.test(u.pathname))              // 셈 받기 — 한 줄에 이력 2개가 있다
        return r.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ documents: [{ name: '…/vpcs_note/20261015-101',
            fields: { cnt: { integerValue: '2' } } },
            { name: '…/vpcs_note/20261015-102',           // 접수가 **안 끝난** 줄
              fields: { cnt: { integerValue: '1' }, open: { booleanValue: true },
                        kind: { stringValue: '반품' } } }] }) });
      if (/vpcs_note\/[^/]+$/.test(u.pathname))        // 한 줄 읽기
        return r.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ fields: { log: { arrayValue: { values: 쌓인것.length ? 쌓인것.map(f => ({ mapValue: { fields: f } }))
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
      return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 배송쪽 });
    });
    const page = await ctx.newPage();
    const 탈 = []; page.on('pageerror', e => 탈.push(String(e && e.message).slice(0, 140)));
    await page.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx');
    await page.addScriptTag({ content:
      'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};'
      + 'document.cookie="VP_Cookie=LOGON_EMP_NO%3D7%26x%3Dy";'
      + '(function(){var d=document.createElement("div");d.id="vp-판";'
      + 'd.textContent="벤더피아 보기 잰것 · 확장";'
      + 'd.style.cssText="position:fixed;left:6px;bottom:6px";document.body.appendChild(d);})();' });
    await page.addStyleTag({ content: ['login.css','search.css']
      .map(f => fs.readFileSync(path.join(확장, f), 'utf8')).join('\n') });
    await page.addScriptTag({ content: VP흉내 });
    for (const f of ['login.js','search.js'])
      await page.addScriptTag({ content: fs.readFileSync(path.join(확장, f), 'utf8') });
    await page.waitForTimeout(500);
    await page.click('.vp-bar button[type=submit]');
    await page.waitForTimeout(1400);

    const 것 = await page.evaluate(본다);
    console.log('\n  ◆ ' + w + '×' + h);
    console.log('    ★ 칸 **' + 것.칸수 + '개** (들어온 것 ' + 머리.length + '개) — 밀어내지 않았나 '
      + 못(것.칸수 === 머리.length));
    console.log('    주문번호 칸 자리 ' + 것.주문칸자리 + ' (앞엣것) ' + 못(것.주문칸자리 === 4));
    console.log('    이력 단추 ' + 것.알수 + '개 · 모두 주문번호 칸 안인가 '
      + 못(것.알수 === 줄들.length && 것.알들.every(x => x.주문칸안인가)));
    console.log('    ★ 이력 있는 줄이 **눈에 띄나** '
      + JSON.stringify(것.알들.map(x => x.글 + (x.띄나 ? '(띔)' : ''))) + ' '
      /* ⚠ 흉내 창고가 이력을 둔 줄은 **둘**이다 — `…-101`(둘째, 이력 2줄)과
           `…-102`(셋째, **반품 접수중**). 셋째는 더 또렷해야 한다. */
      + 못(것.알들.filter(x => x.띄나).length === 2
           && 것.알들[1] && 것.알들[1].띄나 && !것.알들[1].열림
           && 것.알들[2] && 것.알들[2].열림));
    await page.screenshot({ path: path.join(그림칸, '상담-표-' + w + '.png'), fullPage: false });

    /* ★ 10-16 사장님: 「상품명 버튼을 누르면 상담버튼과 동일한팝업이 나타납니다.
         **이는 잘못된 작동 입니다**」(장부 a1792133915) — 상품명을 눌러도 **안 떠야** 한다 */
    await page.click('tbody tr:nth-child(2) td.vp-상품칸');
    await page.waitForTimeout(400);
    const 눌러봄 = await page.evaluate(본다);
    console.log('    ★ **상품명을 눌렀을 때 상담 판이 안 뜨나** ' + !눌러봄.판떴나 + ' '
      + 못(!눌러봄.판떴나));

    /* 판을 열고 한 줄 남긴다 — **상담 단추로만** 연다 (10-16) */
    await page.click('tbody tr:nth-child(2) .vp-상담알');
    await page.waitForTimeout(600);
    let 판 = await page.evaluate(본다);
    console.log('    ★ **상담 단추를 눌러** 판이 떴나 ' + 판.판떴나 + ' · 제목 「' + 판.판제목 + '」 '
      + 못(판.판떴나 && 판.판제목 === '토리블리 2단 와이드 교구장'));
    console.log('    앞서 쌓인 줄 ' + 판.판줄수 + '개 ' + 못(판.판줄수 === 1));
    console.log('    접수 단추 ' + JSON.stringify(판.종류단추) + ' '
      + 못(JSON.stringify(판.종류단추) === JSON.stringify(['교환','반품','AS'])));
    console.log('    ★ **지우는 단추가 없나** ' + 못(!판.지우기단추있나));
    await page.fill('.vp-상담적기 textarea', '전화 상담: 문짝 흠 있어 교환 원하심. 다음 주 수요일 재배송 약속.');
    await page.click('.vp-상담종류[data-k="교환"]');
    await page.waitForTimeout(150);
    console.log('    단추 글이 「교환 접수」 로 바뀌나 '
      + 못((await page.textContent('.vp-상담적기 button[type=submit]')) === '교환 접수'));
    await page.click('.vp-상담적기 button[type=submit]');
    await page.waitForTimeout(900);
    판 = await page.evaluate(본다);
    console.log('    남긴 뒤 — 알림 「' + 판.알림 + '」 · 판 줄 ' + 판.판줄수 + '개 (쌓였나) '
      + 못(/남겼습니다/.test(판.알림 || '') && 판.판줄수 === 2));
    console.log('    ★ **접수가 이력 줄로도 남나** · 접수줄 「' + 판.접수줄 + '」 '
      + 못(/교환 접수/.test(판.접수줄 || '') && 판.접수열림));
    console.log('    상태 단추 ' + JSON.stringify(판.상태단추) + ' '
      + 못(JSON.stringify(판.상태단추) === JSON.stringify(['접수(켬)','처리중','끝'])));
    /* 상태를 「끝」 으로 — **지우지 않고 새 줄로 쌓여야** 한다 */
    await page.click('.vp-상담상태 button:nth-child(3)');
    await page.waitForTimeout(800);
    판 = await page.evaluate(본다);
    console.log('    ★ 「끝」 으로 바꾸니 — 판 줄 ' + 판.판줄수 + '개(쌓였나) · 접수 열림 '
      + 판.접수열림 + ' ' + 못(판.판줄수 === 3 && !판.접수열림));
    console.log('    창고에 쌓인 접수 : ' + JSON.stringify(쓴접수 && {
      k: 쓴접수.k.stringValue, st: 쓴접수.st.stringValue }) + ' '
      + 못(!!쓴접수 && 쓴접수.k.stringValue === '교환' && 쓴접수.st.stringValue === '끝'));
    await page.screenshot({ path: path.join(그림칸, '상담-판-' + w + '.png'), fullPage: false });
    await page.keyboard.press('Escape'); await page.waitForTimeout(200);
    const 뒤 = await page.evaluate(본다);
    console.log('    닫힌 뒤 줄 단추 '
      + JSON.stringify(뒤.알들.map(x => x.글 + (x.띄나 ? '(띔)' : ''))) + ' '
      + 못(뒤.알들[1] && 뒤.알들[1].띄나));
    console.log('    ★ **접수 안 끝난 줄이 더 또렷한가** (셋째 줄 「반품 접수중」) '
      + 못(!!뒤.알들[2] && 뒤.알들[2].열림 && /반품 접수중/.test(뒤.알들[2].글)));

    /* ★★ 창고로 나간 것 — 사람 칸이 샜나 */
    const 쓴것 = 창고로.filter(x => x.셈 === 'PATCH');
    const 몸전부 = 창고로.map(x => x.몸).join('\n');
    console.log('    창고로 나간 것 ' + 창고로.length + '개 · 그중 **쓰기(PATCH) ' + 쓴것.length + '개**');
    for (const x of 창고로) console.log('        ' + x.셈 + ' ' + x.길.split('/data/').pop());
    console.log('    ★★ **사람 칸이 샜나** — 수취인「가나다」 ' + /가나다/.test(몸전부)
      + ' · 전화 ' + /010-7777-8888/.test(몸전부) + ' · 주소 ' + /○○로 99/.test(몸전부) + ' '
      + 못(!/가나다|010-7777-8888|○○로 99/.test(몸전부)));
    console.log('    쓴 것에 담긴 칸 : '
      + JSON.stringify(쓴것.length ? Object.keys(JSON.parse(쓴것[0].몸).fields) : []) + ' '
      /* 담는 칸은 일곱뿐이다 — 사람 칸은 하나도 없다.
         `ord`(주문번호) `cnt`(줄 수) `at`(때) `log`(쌓인 글) `req`(접수) `open`(안 끝났나) `kind`(무엇) */
      + 못(쓴것.length >= 1 && 쓴것.every((x) =>
          JSON.stringify(Object.keys(JSON.parse(x.몸).fields).sort())
             === JSON.stringify(['at','cnt','kind','log','open','ord','req']))));
    console.log('    쓴 길이 `vpcs_note/<문서>` 하나인가 '
      + 못(쓴것.every(x => /\/data\/vpcs_note\/[^/]+$/.test(x.길))));
    console.log('    ★ 벤더피아로 **쓴 적 있나** ' + 벤더로.some(x => /^(PATCH|PUT|DELETE)/.test(x)) + ' '
      + 못(!벤더로.some(x => /^(PATCH|PUT|DELETE)/.test(x))) + ' (POST 는 조회뿐: '
      + 벤더로.filter(x => x.startsWith('POST')).length + '개)');
    if (탈.length) { console.log('    터진 말: ' + JSON.stringify([...new Set(탈)].slice(0, 2))); 빨강++; }
    await ctx.close();
  }

  /* ㅂ) 못 남겼을 때 조용히 지나가지 않나 */
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.route('**://vivivic-cloud.github.io/**', r => r.abort('blockedbyclient'));
    await ctx.route('**://identitytoolkit.googleapis.com/**', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: '{"idToken":"ascii-fake"}' }));
    await ctx.route('**://firestore.googleapis.com/**', (r) => {
      const 셈 = r.request().method();
      if (셈 === 'PATCH') return r.fulfill({ status: 403, contentType: 'application/json',
        body: '{"error":{"code":403}}' });                // 창고가 막는다
      return r.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
    });
    await ctx.route('**://vendorpia.com/**', (r) => {
      if (r.request().method() === 'POST')
        return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 표 });
      if (new URL(r.request().url()).pathname.endsWith('.js'))
        return r.fulfill({ status: 200, contentType: 'text/javascript', body: '/* 손잡이 */' });
      return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 배송쪽 });
    });
    const page = await ctx.newPage();
    await page.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx?vg판=1');
    await page.addScriptTag({ content:
      'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};'
      + '(function(){var d=document.createElement("div");d.id="vp-판";'
      + 'd.textContent="벤더피아 보기 잰것 · 확장";'
      + 'd.style.cssText="position:fixed;left:6px;bottom:6px";document.body.appendChild(d);})();' });
    await page.addStyleTag({ content: ['login.css','search.css']
      .map(f => fs.readFileSync(path.join(확장, f), 'utf8')).join('\n') });
    await page.addScriptTag({ content: VP흉내 });
    for (const f of ['login.js','search.js'])
      await page.addScriptTag({ content: fs.readFileSync(path.join(확장, f), 'utf8') });
    await page.waitForTimeout(500);
    await page.click('.vp-bar button[type=submit]'); await page.waitForTimeout(1200);
    await page.click('tbody tr:nth-child(1) .vp-상담알'); await page.waitForTimeout(500);
    await page.fill('.vp-상담적기 textarea', '시험');
    await page.click('.vp-상담적기 button[type=submit]'); await page.waitForTimeout(700);
    const 것 = await page.evaluate(() => ({
      알림: document.querySelector('.vp-상담알림')?.textContent || null,
      딱지: document.getElementById('vp-판')?.textContent || '' }));
    console.log('\n  ◆ 창고가 **막을 때**(403)');
    console.log('    ★ 화면에 알리나 「' + 것.알림 + '」 ' + 못(/못 남겼습니다/.test(것.알림 || '')));
    console.log('    ★ 까닭에 적히나 ' + JSON.stringify((것.딱지.split('‖').map(x=>x.trim())
      .filter(x=>/상담/.test(x)))) + ' ' + 못(/상담:못남김/.test(것.딱지)));
    await ctx.close();
  }
  /* ◆ **바로받기가 막히고(CSP 흉내) 다리로만** 될 때 — 사장님 화면이 바로 이 꼴일 수 있다.
       `connect-src` 는 받는 것만이 아니라 **보내는 것도** 막는다. 그때도 남겨져야 한다. */
  {
    const 다리흉내 = `
(() => {
  let 표 = 0; const 기다림 = new Map();
  addEventListener("message", (e) => {
    if (e.source !== window || !e.data || e.data.__vp !== "밖에답") return;
    const p = 기다림.get(e.data.표); if (p) { 기다림.delete(e.data.표); p(e.data.답); }
  });
  window.VP밖에 = (주소, 옵션) => new Promise((풀) => {
    const 내표 = ++표; 기다림.set(내표, 풀);
    window.postMessage({ __vp: "밖에", 표: 내표, 주소, 옵션: 옵션 || null }, location.origin);
    setTimeout(() => { if (기다림.delete(내표)) 풀(null); }, 20000);
  });
})();`;
    /* 「확장 쪽」 — 막음 토막은 `불러오기.js` 에서 **그대로 떼어** 온다(베끼지 않는다) */
    const t = fs.readFileSync(path.join(확장, '불러오기.js'), 'utf8');
    const 시작 = t.indexOf('/* ──밖에다리시작──'), 끝 = t.indexOf('/* ──밖에다리끝── */');
    const 확장쪽 = `(() => {
  const 진짜받기 = window.fetch.bind(window);
  window.fetch = (주소, 옵션) => {
    const u = String(주소 && 주소.url ? 주소.url : 주소);
    if (!(옵션 && 옵션.__다리) && /googleapis\\.com/.test(u))
      return Promise.reject(new TypeError("Refused to connect (CSP 흉내)"));
    return 진짜받기(주소, 옵션);
  };
  ${t.slice(시작, 끝).replace(/await fetch\(/g, 'await 진짜받기(').replace(/credentials: "omit",/g, 'credentials: "omit", __다리: 1,')}
})();`;
    let 쌓인것 = [], 쓴것 = null;
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.route('**://vivivic-cloud.github.io/**', r => r.abort('blockedbyclient'));
    await ctx.route('**://identitytoolkit.googleapis.com/**', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: '{"idToken":"ascii-fake"}' }));
    await ctx.route('**://firestore.googleapis.com/**', (r) => {
      if (r.request().method() === 'PATCH') { 쓴것 = r.request().postData() || '';
        return r.fulfill({ status: 200, contentType: 'application/json', body: 쓴것 }); }
      return r.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
    });
    await ctx.route('**://vendorpia.com/**', (r) => {
      if (r.request().method() === 'POST')
        return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 표 });
      if (new URL(r.request().url()).pathname.endsWith('.js'))
        return r.fulfill({ status: 200, contentType: 'text/javascript', body: '/* 손잡이 */' });
      return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 배송쪽 });
    });
    const page = await ctx.newPage();
    await page.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx?vg판=1');
    await page.addScriptTag({ content:
      'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};'
      + 'document.cookie="VP_Cookie=LOGON_EMP_NO%3D7";'
      + '(function(){var d=document.createElement("div");d.id="vp-판";'
      + 'd.textContent="벤더피아 보기 잰것 · 확장";'
      + 'd.style.cssText="position:fixed;left:6px;bottom:6px";document.body.appendChild(d);})();' });
    await page.addScriptTag({ content: 다리흉내 });
    await page.addScriptTag({ content: 확장쪽 });
    await page.addStyleTag({ content: ['login.css','search.css']
      .map(f => fs.readFileSync(path.join(확장, f), 'utf8')).join('\n') });
    await page.addScriptTag({ content: VP흉내 });
    for (const f of ['login.js','search.js'])
      await page.addScriptTag({ content: fs.readFileSync(path.join(확장, f), 'utf8') });
    await page.waitForTimeout(500);
    await page.click('.vp-bar button[type=submit]'); await page.waitForTimeout(1200);
    await page.click('tbody tr:nth-child(1) .vp-상담알'); await page.waitForTimeout(600);
    await page.fill('.vp-상담적기 textarea', '전화 상담 — 다리로 남깁니다');
    await page.click('.vp-상담종류[data-k="반품"]');
    await page.click('.vp-상담적기 button[type=submit]'); await page.waitForTimeout(900);
    const 것 = await page.evaluate(() => ({
      알림: document.querySelector('.vp-상담알림')?.textContent || null,
      딱지: document.getElementById('vp-판')?.textContent || '' }));
    console.log('\n  ◆ **바로받기가 막히고(CSP 흉내) 다리로만** 될 때');
    console.log('    ★ 남겼나 「' + 것.알림 + '」 ' + 못(/남겼습니다/.test(것.알림 || '')));
    const 토막 = 것.딱지.split('‖').map(x => x.trim()).filter(x => /상담:남김/.test(x));
    console.log('    ★ **다리로 갔나** ' + JSON.stringify(토막) + ' '
      + 못(토막.some(x => /\/다리/.test(x))));
    console.log('    ★ 사람 칸이 샜나 ' + 못(!/가나다|010-7777-8888|○○로 99/.test(쓴것 || '')));
    await ctx.close();
  }

  console.log('\n  그림: 잰것/그림/상담-표-1280.png · 상담-판-1280.png · 상담-표-375.png · 상담-판-375.png');
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  await b.close();
  process.exit(빨강 ? 1 : 0);
})();
