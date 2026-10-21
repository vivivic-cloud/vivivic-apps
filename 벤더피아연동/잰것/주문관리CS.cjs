/* **주문관리(`/System/Sales/orderMst.aspx`)의 CS등록 판**을 재는 자 (10-21).
   사장님: 「연동 메인메뉴의 CS등록의 경우 배송관리 화면이 아닌 벤더피아 -판매관리-주문관리 화면이 연동되어야 합니다.」
   보아야 하는 것 —
     ㄱ) 주문관리에 `#vgCS` 로 오면 CS 판이 뜨나 · 원래 화면(폼·표)은 그대로인가(가리지 않나)
     ㄴ) 검색이 **주문관리 폼**(페이지에서 읽은 칸)으로 가나 — 배송목록을 안 건드리나
     ㄷ) `#vgCS` 없이 오면 아무것도 안 뜨나
     ㅁ) 주문관리 폼을 못 맞추면(칸 없음) 배송목록 조회로 돌아가 같은 결과가 나오나
   ⚠ 진짜 vendorpia.com 은 못 닿는다. 주문관리 폼 칸 이름은 **일부러 배송관리와 다르게** 지은 흉내다
     (칸 이름을 코드에 박았다면 여기서 들통난다). 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const 머리 = ["선택","주문번호","상품명","수취인","주문자","휴대전화","주소","주문일"];
const 표만들기 = (줄) => `<html><body><span>총 ${줄.length} 건</span><table><tr>${머리.map(h=>`<th>${h}</th>`).join('')}</tr>
${줄.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</table></body></html>`;
const 자료 = [["", "20261021-777", "토리블리 책상", "가나다", "라마바", "010-1111-2222", "서울 ○○구", "2026-10-20"]];
const 주문폼 = (칸있나) => `<form name="f" method="post" action="/System/Sales/orderMst.aspx" id="f">
<input type="hidden" name="__VIEWSTATE" value="x">
<table id="원래화면"><tr><th>주문기간</th><td><input type="text" name="ctl00$txtFrom" value="2026/09/21"> ~ <input type="text" name="ctl00$txtTo" value="2026/10/21"></td></tr>
<tr><th>주문번호</th><td><input type="text" name="ctl00$txtOrdNo"></td><th>수취인</th><td><input type="text" name="ctl00$txtRcv"></td></tr>
${칸있나 ? `<tr><th>주문자</th><td><input type="text" name="ctl00$txtOrd"></td><th>주소</th><td><input type="text" name="ctl00$txtAd"></td></tr>
<tr><th>상품명</th><td><input type="text" name="ctl00$txtGn"></td><th>송장번호</th><td><input type="text" name="ctl00$txtIv"></td></tr>
<tr><th>단품코드</th><td><input type="text" name="ctl00$txtGc"></td></tr>` : ''}</table>
<input type="image" name="ctl00$btnSrch" id="btnSrch" src="s.gif"></form><p id="원래글">주문관리 원래 화면</p>`;
const 배송폼 = `<form name="aspnetForm" method="post" action="/System/Delivery/firmDvList.aspx" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="x"><input name="dcStartDt" id="dcStartDt" value="2026-07-15"><input name="dcEndDt" id="dcEndDt" value="2026-10-15">
<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select>
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"></form>`;
const 배송표 = `<html><body><span>총 1 건</span><table><tr>${["CS","주문번호","상품명","수취인","주문자","휴대전화","주소"].map(h=>`<th>${h}</th>`).join('')}</tr>
<tr><td></td><td>20261021-777</td><td>토리블리 책상</td><td>가나다</td><td>라마바</td><td>010-1111-2222</td><td>서울 ○○구</td></tr></table></body></html>`;
const VP흉내 = `window.VP저장 = { get: async function(){return {};}, set: async function(){}, remove: async function(){} };`;

(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  let 초록 = 0, 빨강 = 0;
  const 못 = (참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };
  console.log('\n■ 주문관리 CS등록 (10-21 사장님)');
  for (const 칸있나 of [true, false]) {
    console.log('\n  ◆ 주문관리 폼 ' + (칸있나 ? '칸 모두 있음 → 주문관리 조회' : '주문자·주소·상품명 칸 없음 → 배송목록으로 돌아가기'));
    for (const 해시 of ['#vgCS', '']) {
      const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
      await ctx.route('**://identitytoolkit.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"idToken":"x"}' }));
      await ctx.route('**://firestore.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
      const 부름 = [];
      await ctx.route('**://vendorpia.com/**', (r) => {
        const u = new URL(r.request().url()), m = r.request().method();
        부름.push(m + ' ' + u.pathname + (m === 'POST' ? ' ' + JSON.stringify(Object.fromEntries([...(r.request().postData() || '').matchAll(/name="([^"]+)"\r\n\r\n([^\r]*)\r\n/g)].map((x) => [x[1], x[2]]))) : ''));
        const 화 = (t) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: t });
        if (/orderMst/.test(u.pathname)) return m === 'POST' ? 화(표만들기(자료)) : 화(`<html><head><meta charset="utf-8"></head><body id="body">${주문폼(칸있나)}</body></html>`);
        if (/firmDvList/.test(u.pathname)) return m === 'POST' ? 화(배송표) : 화(`<html><body>${배송폼}</body></html>`);
        return r.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
      });
      const 쪽 = await ctx.newPage();
      const 탈 = []; 쪽.on('pageerror', (e) => 탈.push(String(e && e.message).slice(0, 140)));
      await 쪽.goto('https://vendorpia.com/System/Sales/orderMst.aspx' + 해시);
      await 쪽.addScriptTag({ content: 'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};document.cookie="VP_Cookie=LOGON_EMP_NO%3D7";' });
      await 쪽.addStyleTag({ content: ['login.css', 'search.css'].map((f) => fs.readFileSync(path.join(확장, f), 'utf8')).join('\n') });
      await 쪽.addScriptTag({ content: VP흉내 });
      await 쪽.addScriptTag({ content: fs.readFileSync(path.join(확장, 'search.js'), 'utf8') });
      await 쪽.waitForTimeout(1200);
      const 떴나 = await 쪽.evaluate(() => !!document.querySelector('.vp-cs판'));
      const 원래 = await 쪽.evaluate(() => {
        const f = document.getElementById('f'), p = document.getElementById('원래글');
        const 보임 = (e) => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 5 && r.height > 5 && s.display !== 'none' && s.visibility !== 'hidden'; };
        return { 폼: f && 보임(f), 글: p && 보임(p), 청소: document.documentElement.classList.contains('vp-clean'),
          우리쪽: !!document.querySelector('.vp-search'), 쪽키: document.documentElement.scrollHeight };
      });
      if (해시) {
        console.log('   ─ #vgCS 로 옴');
        console.log('    ★ CS 판이 떴나 ' + 못(떴나));
        console.log('    ★ **원래 화면이 그대로 보이나** 폼 ' + 원래.폼 + ' · 글 ' + 원래.글 + ' · 가림(vp-clean) ' + 원래.청소 + ' · 배송관리 화면 붙음 ' + 원래.우리쪽
          + ' ' + 못(원래.폼 && 원래.글 && !원래.청소 && !원래.우리쪽));
        await 쪽.fill('.vp-cs찾기 input', '가나다');
        await 쪽.click('.vp-cs찾기 button');
        await 쪽.waitForTimeout(1500);
        const 줄 = await 쪽.evaluate(() => [...document.querySelectorAll('.vp-cs찾은')].map((x) => x.textContent));
        const 포스트 = 부름.filter((x) => x.startsWith('POST'));
        console.log('    ★ 찾은 줄 ' + JSON.stringify(줄) + ' ' + 못(줄.length === 1 && /가나다/.test(줄[0]) && /토리블리 책상/.test(줄[0])));
        const 주문쪽 = 포스트.filter((x) => /orderMst/.test(x)), 배송쪽 = 포스트.filter((x) => /firmDvList/.test(x));
        if (칸있나) {
          const 몸 = 주문쪽.map((x) => JSON.parse(x.slice(x.indexOf('{'))));
          console.log('    ★ 조회가 주문관리 폼으로 갔나 (읽은 칸에 가나다, 날짜는 2026/.. 꼴, 조회 단추 .x) ' + 못(몸.length >= 1
            && 몸.every((m) => Object.values(m).includes('가나다') && /^\d{4}\/\d\d\/\d\d$/.test(m['ctl00$txtFrom']) && m['ctl00$btnSrch.x'] === '5')
            && 몸.some((m) => m['ctl00$txtRcv'] === '가나다')));
          console.log('    ★ 배송목록은 안 건드렸나 (POST ' + 배송쪽.length + ') ' + 못(배송쪽.length === 0));
        } else {
          console.log('    ★ 칸이 모자라니 배송목록 조회로 돌아갔나 (POST ' + 배송쪽.length + ') ' + 못(배송쪽.length >= 1 && /"tbRecipient":"가나다"/.test(배송쪽.join('\n'))));
        }
        await 쪽.click('.vp-cs찾은');
        await 쪽.waitForTimeout(900);
        const 고객 = await 쪽.evaluate(() => (document.querySelector('.vp-고객목록') || {}).textContent || '');
        console.log('    ★ 줄을 누르면 상담 판에 고객정보 ' + 못(/라마바/.test(고객) && /010-1111-2222/.test(고객)));
        await 쪽.screenshot({ path: path.join(__dirname, '그림', '주문관리CS-' + (칸있나 ? '칸있음' : '칸없음') + '.png') });
      } else {
        console.log('   ─ #vgCS 없이 옴');
        console.log('    ★ 아무 판도 안 뜨고 원래 화면 그대로 ' + 못(!떴나 && 원래.폼 && 원래.글 && !원래.청소 && !원래.우리쪽));
      }
      console.log('    ★ 쪽 오류 ' + 탈.length + '건 ' + 못(탈.length === 0) + (탈.length ? ' ' + JSON.stringify(탈) : ''));
      await ctx.close();
    }
  }
  await b.close();
  console.log('\n★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
})();
