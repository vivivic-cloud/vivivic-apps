/* 배송관리·CS등록 목록 표가 **서류관리 제품관리 표와 같은 꼴**인가를 재는 자 (10-23 새 지시 배송·CS 표 디자인).
   사장님 10-23: 「배송관리, CS등록에 나타나는 목록도 표디자인 일관성을 유지해 달라니까?」
   기준 = 서류관리 css 를 그 자리에서 뽑아 그린 표(`표꼴자.cjs`, 저장소 없으면 「건너뜀」). 머리줄·몸줄 computed style 을 **나란히 숫자로** 견준다.
   · 배송관리(firmDvList, 23칸) · CS등록(orderMst#vgCS) 두 화면의 진짜 `search.js`/`search.css`/`goods.css` 로 세워 잰다.
   · 칸·상담 단추·상품명 단추·가로 스크롤(23칸 안 밀어냄)은 그대로인지도 본다. 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const 그림칸 = path.join(__dirname, '그림');
const { 기준재기, 재기, 견주기 } = require('./표꼴자.cjs');

const 칸23 = ["CS","IMG","매출처","주문번호","상품명","옵션","수량","가용수량","몰","주문자","수취인","휴대전화","우편번호","주소","배송메모","배송사","송장번호","배송상태","출고일","등록일","금액","비고","관리코드"];
const 줄 = (i) => 칸23.map((c, j) => c === '주문번호' ? '20261023-10' + i : c === '상품명' ? '토리블리 2단 와이드 교구장 (화이트/오크) 1200x450' : c === '수량' || c === '가용수량' ? String(i + 2) : c + '-' + i);
const 폼 = `<form name="aspnetForm" method="post" action="/System/Delivery/firmDvList.aspx" id="aspnetForm"><input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-23"><input name="dcEndDt" id="dcEndDt" value="2026-10-23">
<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select><input type="image" name="btnSearch" id="btnSearch" src="s.gif"></form>`;
const 표 = (머리, 줄들) => `<html><body><span>총 ${줄들.length} 건</span><table><tr>${머리.map((h) => `<th>${h}</th>`).join('')}</tr>${줄들.map((r) => `<tr>${r.map((v) => `<td>${v}</td>`).join('')}</tr>`).join('')}</table></body></html>`;
const 주문폼 = `<form name="f" method="post" action="/System/Sales/orderMst.aspx" id="f"><input type="hidden" name="__VIEWSTATE" value="x">
<table id="원래화면"><tr><th>주문기간</th><td><input type="text" name="ctl00$txtFrom" value="2026/09/23"> ~ <input type="text" name="ctl00$txtTo" value="2026/10/23"></td></tr>
<tr><th>주문번호</th><td><input type="text" name="ctl00$txtOrdNo"></td><th>수취인</th><td><input type="text" name="ctl00$txtRcv"></td></tr>
<tr><th>주문자</th><td><input type="text" name="ctl00$txtOrd"></td><th>주소</th><td><input type="text" name="ctl00$txtAd"></td></tr>
<tr><th>상품명</th><td><input type="text" name="ctl00$txtGn"></td></tr></table><input type="image" name="ctl00$btnSrch" id="btnSrch" src="s.gif"></form>`;
const 주문머리 = ["선택", "주문번호", "상품명", "수취인", "주문자", "휴대전화", "주소", "주문일"];
const 주문줄 = [0, 1, 2].map((i) => ["", "20261023-20" + i, "토리블리 책상", "가나다", "라마바", "010-1111-2222", "서울 ○○구", "2026-10-23"]);
const VP흉내 = `window.VP저장 = { get: async function(){return {};}, set: async function(){}, remove: async function(){} };`;

(async () => {
  fs.mkdirSync(그림칸, { recursive: true });
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  let 초록 = 0, 빨강 = 0, 건너뜀 = 0;
  const 못 = (참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };
  console.log('\n■ 배송관리·CS등록 표 꼴 = 서류관리 제품관리 표 (10-23)');
  for (const 너비 of [1280, 375]) {
    const 기준 = await 기준재기(b, 너비);
    for (const 화면 of ['배송관리', 'CS등록']) {
      const ctx = await b.newContext({ viewport: { width: 너비, height: 900 } });
      await ctx.route('**://identitytoolkit.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"idToken":"x"}' }));
      await ctx.route('**://firestore.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
      await ctx.route('**://vendorpia.com/**', (r) => {
        const u = new URL(r.request().url()), m = r.request().method();
        const 화 = (t) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: t });
        if (/orderMst/.test(u.pathname)) return m === 'POST' ? 화(표(주문머리, 주문줄)) : 화(`<html><head><meta charset="utf-8"></head><body id="body">${주문폼}</body></html>`);
        if (/firmDvList/.test(u.pathname)) return m === 'POST' ? 화(표(칸23, [0, 1, 2].map(줄))) : 화(`<html><head><meta charset="utf-8"></head><body id="body">${폼}</body></html>`);
        return r.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
      });
      const 쪽 = await ctx.newPage();
      const 탈 = []; 쪽.on('pageerror', (e) => 탈.push(String(e && e.message).slice(0, 140)));
      await 쪽.goto('https://vendorpia.com' + (화면 === '배송관리' ? '/System/Delivery/firmDvList.aspx' : '/System/Sales/orderMst.aspx#vgCS'));
      await 쪽.addScriptTag({ content: 'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};document.cookie="VP_Cookie=LOGON_EMP_NO%3D7";' });
      await 쪽.addStyleTag({ content: ['login.css', 'search.css', 'goods.css'].map((f) => fs.readFileSync(path.join(확장, f), 'utf8')).join('\n') });
      await 쪽.addScriptTag({ content: VP흉내 });
      await 쪽.addScriptTag({ content: fs.readFileSync(path.join(확장, 'search.js'), 'utf8') });
      await 쪽.waitForTimeout(1000);
      await 쪽.click('.vp-bar button[type=submit]');
      await 쪽.waitForTimeout(1500);
      /* 재기 자는 서류관리 표의 첫 칸 이름(vp-main)으로 첫 칸을 집는다 — 우리 첫 칸에 그 이름표만 붙여 재게 한다(꼴엔 안 걸린다) */
      await 쪽.evaluate(() => document.querySelectorAll('.vp-table th.vp-first, .vp-table td.vp-first').forEach((e) => e.classList.add('vp-main')));
      const 우리 = await 재기(쪽, '.vp-table table');
      const 내용 = await 쪽.evaluate(() => ({ 머리: document.querySelectorAll('.vp-table thead th').length, 줄: document.querySelectorAll('.vp-table tbody tr').length,
        상담: document.querySelectorAll('.vp-table .vp-상담알').length, 상품단추: document.querySelectorAll('.vp-table td.vp-상품칸 > button').length,
        통: (() => { const t = document.querySelector('.vp-table'); return { 밀수있나: t.scrollWidth > t.clientWidth + 1, 첫칸붙음: getComputedStyle(t.querySelector('td.vp-first')).position === 'sticky' }; })(),
        세로줄: [...document.querySelectorAll('.vp-table th, .vp-table td')].filter((e) => parseFloat(getComputedStyle(e).borderLeftWidth) > 0 || parseFloat(getComputedStyle(e).borderRightWidth) > 0).length }));
      console.log('\n  ◆ ' + 화면 + ' · 창 ' + 너비);
      console.log('    칸 ' + 내용.머리 + ' · 줄 ' + 내용.줄 + ' · 상담 단추 ' + 내용.상담 + ' · 상품명 단추 ' + 내용.상품단추 + ' · 옆으로 밀림 ' + 내용.통.밀수있나);
      console.log('    ★ 칸 수 그대로(배송 23 · CS 주문관리 머리 8) ' + 못(화면 === '배송관리' ? 내용.머리 === 23 && 내용.줄 === 3 : 내용.머리 === 8 && 내용.줄 === 3));
      console.log('    ★ 첫 칸은 밀어도 붙음 ' + 못(내용.통.첫칸붙음) + ' · 세로줄 ' + 내용.세로줄 + '개 ' + 못(내용.세로줄 === 0));
      if (화면 === '배송관리') console.log('    ★ 23칸이 **창 안에 욱여넣어지지 않고** 옆으로 밀리나 ' + 못(내용.통.밀수있나));
      /* 사장님 10-23 (장부 a1792740601) 「이렇게 텍스트 열바뀜 안되게 해줘」 — 머리글은 전부 **한 줄**(줄바꿈 없음, 주문번호 포함) */
      const 머리줄 = await 쪽.evaluate(() => [...document.querySelectorAll('.vp-table thead th')].map((th) => { const c = getComputedStyle(th); const lh = parseFloat(c.lineHeight);
        return { 글: th.textContent, 줄바꿈: c.whiteSpace, 줄수: Math.round((th.clientHeight - parseFloat(c.paddingTop) - parseFloat(c.paddingBottom)) / lh) }; }));
      const 두줄 = 머리줄.filter((x) => x.줄수 > 1 || !/^nowrap$/.test(x.줄바꿈));
      console.log('    ★ 머리글 ' + 머리줄.length + '개 전부 한 줄(nowrap) — 두 줄 이상 ' + 두줄.length + '개 ' + 못(두줄.length === 0 && 머리줄.some((x) => x.글 === '주문번호')));
      두줄.forEach((x) => console.log('       ✗ ' + x.글 + ' ' + x.줄바꿈 + ' ' + x.줄수 + '줄'));
      const 머리 = 우리.머리.보통, 몸 = 우리.몸.보통, 첫 = 우리.몸.첫;
      console.log('    머리 ' + 머리.fontSize + '/' + 머리.fontWeight + ' ' + 머리.color + ' 바탕 ' + 머리.backgroundColor + ' 안여백 ' + 머리.paddingTop + ' ' + 머리.paddingLeft + ' 밑선 ' + 머리.borderBottomWidth + ' ' + 머리.borderBottomColor);
      console.log('    몸   ' + 몸.fontSize + '/' + 몸.fontWeight + ' ' + 몸.color + ' 안여백 ' + 몸.paddingTop + ' ' + 몸.paddingLeft + ' 밑선 ' + 몸.borderBottomWidth + ' ' + 몸.borderBottomColor + ' · 첫 칸 굵기 ' + 첫.fontWeight + ' · 줄 높이 ' + 우리.줄높이);
      if (!기준) { 건너뜀++; console.log('    – 서류관리 저장소가 없어 나란히 견주기를 건너뜀'); }
      else {
        const 다름 = 견주기(기준, 우리).filter((x) => !/^몸\.모델|^몸\.첫\.(whiteSpace|minWidth)|^머리\.첫\.(whiteSpace|minWidth)|^머리\.보통\.(whiteSpace|minWidth)/.test(x));
        console.log('    ★ 서류관리 제품관리 표와 나란히 — 다른 값 ' + 다름.length + '개 ' + 못(다름.length === 0));
        다름.forEach((x) => console.log('       ✗ ' + x));
        console.log('      기준 줄 높이 ' + 기준.줄높이 + ' · 우리 ' + 우리.줄높이 + ' ' + 못(Math.abs(기준.줄높이 - 우리.줄높이) < 1.5));
      }
      console.log('    ★ 쪽 오류 ' + 탈.length + ' ' + 못(탈.length === 0));
      if (process.env.DBG) console.log(JSON.stringify(await 쪽.evaluate(() => [...document.querySelectorAll('.vp-table tbody tr:first-child td')].map((t) => [t.textContent.slice(0,6), Math.round(t.getBoundingClientRect().height*10)/10, t.firstElementChild && t.firstElementChild.tagName]).filter((x) => x[1] > 47.9))));
      await 쪽.screenshot({ path: path.join(그림칸, '배송CS표-' + 화면 + '-' + 너비 + '.png') });
      if (화면 === 'CS등록' && 너비 === 1280) {
        /* 세로로 밀어도 머리줄 밑선이 붙어 있나는 그림으로 — 줄을 늘려 밀어 본다 */
      }
      await ctx.close();
    }
  }
  /* CS 판(찾기 결과·남긴 것) — 같은 표 꼴 줄 */
  for (const 너비 of [1280, 375]) {
    const ctx = await b.newContext({ viewport: { width: 너비, height: 900 } });
    await ctx.route('**://identitytoolkit.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"idToken":"x"}' }));
    await ctx.route('**://firestore.googleapis.com/**', (r) => {
      const u = new URL(r.request().url());
      if (/vpcs_note$/.test(u.pathname)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ documents: [
        { name: '…/vpcs_note/20261023-101', fields: { cnt: { integerValue: '2' }, ord: { stringValue: '20261023-101' }, at: { integerValue: '1760500000' } } },
        { name: '…/vpcs_note/20261023-102', fields: { cnt: { integerValue: '1' }, ord: { stringValue: '20261023-102' }, at: { integerValue: '1760600000' }, open: { booleanValue: true }, kind: { stringValue: '반품' } } }] }) });
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await ctx.route('**://vendorpia.com/**', (r) => r.fulfill({ status: 200, contentType: r.request().url().endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8', body: r.request().url().endsWith('.js') ? '' : `<html><head><meta charset="utf-8"></head><body id="body">${폼}</body></html>` }));
    const 쪽 = await ctx.newPage();
    await 쪽.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx#vgCS');
    await 쪽.addScriptTag({ content: 'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};document.cookie="VP_Cookie=LOGON_EMP_NO%3D7";' });
    await 쪽.addStyleTag({ content: ['login.css', 'search.css', 'goods.css'].map((f) => fs.readFileSync(path.join(확장, f), 'utf8')).join('\n') });
    await 쪽.addScriptTag({ content: VP흉내 });
    await 쪽.addScriptTag({ content: fs.readFileSync(path.join(확장, 'search.js'), 'utf8') });
    await 쪽.waitForTimeout(1500);
    const 줄값 = await 쪽.evaluate(() => { const e = document.querySelector('.vp-cs줄'); if (!e) return null; const c = getComputedStyle(e), s = getComputedStyle(e.querySelector('strong'));
      const h = getComputedStyle(document.querySelector('.vp-cs목록'), '::before');
      return { 줄: [c.paddingTop, c.paddingLeft, c.borderBottomWidth, c.borderBottomColor, c.borderRadius, c.borderLeftWidth, c.backgroundColor], 첫: [s.fontSize, s.fontWeight], 머리: [h.fontSize, h.fontWeight, h.color, h.borderBottomWidth, h.borderBottomColor, h.paddingTop] }; });
    console.log('\n  ◆ CS 판(남긴 것 목록) · 창 ' + 너비 + ' ' + JSON.stringify(줄값));
    console.log('    ★ 몸 줄 13px 12px · 밑 1px #D6D6D3 · 모서리·옆선 0 · 첫 글 14px/700 ' + 못(!!줄값 && 줄값.줄.join() === '13px,12px,1px,rgb(214, 214, 211),0px,0px,rgba(0, 0, 0, 0)' && 줄값.첫.join() === '14px,700'));
    console.log('    ★ 머리 13px/800 #111110 · 밑 2px #111110 · 10px ' + 못(!!줄값 && 줄값.머리.join() === '13px,800,rgb(17, 17, 16),2px,rgb(17, 17, 16),10px'));
    await 쪽.screenshot({ path: path.join(그림칸, '배송CS표-CS판-' + 너비 + '.png') });
    await ctx.close();
  }
  await b.close();
  console.log('\n■ 초록 ' + 초록 + ' · 빨강 ' + 빨강 + ' · 건너뜀 ' + 건너뜀);
  process.exit(빨강 ? 1 : 0);
})();
