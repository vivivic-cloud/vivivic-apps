/* **주문관리(`/System/Sales/orderMst.aspx`)의 CS등록 판**을 재는 자 (10-21).
   사장님: 「연동 메인메뉴의 CS등록의 경우 배송관리 화면이 아닌 …」 → 바로잡음 10-22: 우리 배송관리와 같은 화면 + 자료만 주문관리에서
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
const 주문폼 = (모양) => `<form name="f" method="post" action="/System/Sales/orderMst.aspx" id="f">
<input type="hidden" name="__VIEWSTATE" value="x">
<table id="원래화면"><tr><th>주문기간</th><td><input type="text" name="ctl00$txtFrom" value="${모양 === 'none' ? '' : '2026/09/21'}"> ~ <input type="text" name="ctl00$txtTo" value="${모양 === 'none' ? '' : '2026/10/21'}"></td></tr>
<tr><th>주문번호</th><td><input type="text" name="ctl00$txtOrdNo"></td><th>수취인</th><td><input type="text" name="ctl00$txtRcv"></td></tr>
<tr><th>주문자</th><td><input type="text" name="ctl00$txtOrd"></td><th>주소</th><td><input type="text" name="ctl00$txtAd"></td></tr>
<tr><th>상품명</th><td><input type="text" name="ctl00$txtGn"></td></tr>
${모양 === 'all' ? `<tr><th>송장번호</th><td><input type="text" name="ctl00$txtIv"></td><th>단품코드</th><td><input type="text" name="ctl00$txtGc"></td></tr>` : ''}</table>
<input type="image" name="ctl00$btnSrch" id="btnSrch" src="s.gif"></form><p id="원래글">주문관리 원래 화면</p>`;
const 배송폼 = `<form name="aspnetForm" method="post" action="firmDvList.aspx" id="aspnetForm">
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
  for (const 모양 of ['all', 'five', 'none']) {
    const 칸있나 = 모양 !== 'none', 칸다 = 모양 === 'all';
    console.log('\n  ◆ 주문관리 폼 ' + ({ all: '칸 모두 있음 → 주문관리 조회', five: '사장님 진짜 모양: 송장번호·단품코드 칸만 없음 → 그래도 주문관리 조회', none: '기간 칸도 못 읽음 → 배송목록으로 돌아가기(action 이 상대 주소)' })[모양]);
    for (const 해시 of ['#vgCS', '']) {
      const ctx = await b.newContext({ viewport: { width: +(process.env.VW || 1280), height: 900 } });
      await ctx.route('**://identitytoolkit.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"idToken":"x"}' }));
      await ctx.route('**://firestore.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
      const 부름 = [];
      await ctx.route('**://vendorpia.com/**', (r) => {
        const u = new URL(r.request().url()), m = r.request().method();
        부름.push(m + ' ' + u.pathname + (m === 'POST' ? ' ' + JSON.stringify(Object.fromEntries([...(r.request().postData() || '').matchAll(/name="([^"]+)"\r\n\r\n([^\r]*)\r\n/g)].map((x) => [x[1], x[2]]))) : ''));
        const 화 = (t) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: t });
        if (/orderMst/.test(u.pathname)) return m === 'POST' ? 화(표만들기(자료)) : 화(`<html><head><meta charset="utf-8"></head><body id="body">${주문폼(모양)}</body></html>`);
        if (/firmDvList/.test(u.pathname) && u.pathname !== '/System/Delivery/firmDvList.aspx') return r.fulfill({ status: 404, contentType: 'text/html', body: '리소스를 찾을 수 없습니다.' });
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
      const 화면 = await 쪽.evaluate(() => {
        const f = document.getElementById('f'), p = document.getElementById('원래글');
        const 보임 = (e) => { if (!e) return false; const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 5 && r.height > 5 && s.display !== 'none' && s.visibility !== 'hidden'; };
        return { 원래폼: 보임(f), 원래글: 보임(p), 청소: document.documentElement.classList.contains('vp-clean'),
          우리쪽: 보임(document.querySelector('.vp-search')), 제목: (document.querySelector('.vp-search h1') || {}).textContent,
          기간: !!document.querySelector('.vp-bar input[name=from]') && !!document.querySelector('.vp-bar input[name=q]'),
          덮개: !!document.querySelector('.vp-cs판'), 출처: (document.querySelector('.vp-출처') || {}).textContent || '',
          시작: (document.querySelector('.vp-bar input[name=from]') || {}).value };
      });
      console.log('   ─ ' + (해시 ? '#vgCS 로 옴' : '#vgCS 없이 옴') + ' (둘 다 같아야 한다)');
      console.log('    ★ 배송관리와 같은 꼴(기간+검색창, 제목 ' + 화면.제목 + ') · 원래 주문관리 화면은 가림(' + 화면.청소 + ') · CS 덮개 자동으로 안 뜸(' + !화면.덮개 + ') '
        + 못(화면.기간 && 화면.우리쪽 && 화면.제목 === 'CS등록' && 화면.청소 && !화면.원래폼 && !화면.덮개));
      console.log('    ★ 첫 기간 = 주문관리 폼 값(' + 화면.시작 + ') ' + 못(칸있나 ? 화면.시작 === '2026-09-21' : /^\d{4}-\d\d-\d\d$/.test(화면.시작)));
      console.log('    ★ 출처 글 "' + 화면.출처 + '" ' + 못(칸있나 ? /주문관리 조회/.test(화면.출처) : /배송목록/.test(화면.출처)));
      if (해시) {
        await 쪽.fill('.vp-bar input[name=q]', '가나다');
        await 쪽.click('.vp-bar button[type=submit]');
        await 쪽.waitForTimeout(1500);
        const 표 = await 쪽.evaluate(() => ({ 줄: [...document.querySelectorAll('.vp-table tbody tr')].map((x) => x.textContent),
          상담: document.querySelectorAll('.vp-table .vp-상담알').length, 줄누름: document.querySelectorAll('.vp-table tbody tr.vp-줄상담').length,
          머리: [...document.querySelectorAll('.vp-table th')].map((x) => x.textContent), 출처: (document.querySelector('.vp-출처') || {}).textContent }));
        const 포스트 = 부름.filter((x) => x.startsWith('POST'));
        console.log('    ★ 표 줄 ' + JSON.stringify(표.줄) + ' · 머리 ' + 표.머리.join(',') + ' ' + 못(표.줄.length === 1 && /가나다/.test(표.줄[0]) && /토리블리 책상/.test(표.줄[0])));
        console.log('    ★ 줄마다 「상담」 단추 ' + 표.상담 + ' · 줄 누르면 상담(vp-줄상담) ' + 표.줄누름 + ' ' + 못(표.상담 === 1 && 표.줄누름 === 1));
        const 주문쪽 = 포스트.filter((x) => /orderMst/.test(x)), 배송쪽 = 포스트.filter((x) => /firmDvList/.test(x));
        if (칸있나) {
          const 몸 = 주문쪽.map((x) => JSON.parse(x.slice(x.indexOf('{'))));
          console.log('    ★ 자료가 주문관리 폼으로 갔나 (읽은 칸에 가나다, 날짜 2026/.. 꼴, 조회 단추 .x) ' + 못(몸.length >= 1
            && 몸.every((m) => Object.values(m).includes('가나다') && /^\d{4}\/\d\d\/\d\d$/.test(m['ctl00$txtFrom']) && m['ctl00$btnSrch.x'] === '5')
            && 몸.some((m) => m['ctl00$txtRcv'] === '가나다')));
          console.log('    ★ 배송목록은 안 건드렸나 (POST ' + 배송쪽.length + ') ' + 못(배송쪽.length === 0));
          console.log('    ★ 출처 글이 주문관리 ' + 못(/주문관리 조회/.test(표.출처) && !/대신/.test(표.출처)));
        } else {
          console.log('    ★ 칸이 모자라니 배송목록 조회로 돌아갔나 (POST ' + 배송쪽.length + ') ' + 못(배송쪽.length >= 1 && /"tbRecipient":"가나다"/.test(배송쪽.join('\n'))));
          console.log('    ★ 화면에 「대신 씀」 이 작게 붉게 보이나 ' + 못(/대신 씀/.test(표.출처)
            && await 쪽.evaluate(() => document.querySelector('.vp-출처').classList.contains('vp-출처-대신'))));
        }
        const 진단 = await 쪽.evaluate(() => (document.querySelector('.vp-진단') || {}).textContent || '');
        console.log('    ★ 화면에 까닭 글(진단)이 보이나: ' + JSON.stringify(진단.slice(0, 260)));
        console.log('    ★ 진단에 응답 건수·머리·줄이 적힘 ' + 못(/응답 .*머리\d+칸\[.*줄1 건수1/.test(진단) && (칸있나 ? /주문관리 폼읽음/.test(진단) && /주문관리 응답/.test(진단) && (칸다 || /폼에 없는 칸.*송장번호,단품코드/.test(진단)) : /배송목록 응답 HTTP200/.test(진단) && !/404/.test(진단))));
        await 쪽.click('.vp-table tbody tr td:last-child');   /* 10-24: 줄 누름 = 상담 판 (상품명 단추는 상세 전용이 됐다) */
        await 쪽.waitForTimeout(900);
        const 고객 = await 쪽.evaluate(() => (document.querySelector('.vp-고객목록') || {}).textContent || '');
        console.log('    ★ 줄을 누르면 상담 판에 고객정보 ' + 못(/라마바/.test(고객) && /010-1111-2222/.test(고객)));
        await 쪽.keyboard.press('Escape');
        await 쪽.click('.vp-table .vp-상담알');
        await 쪽.waitForTimeout(600);
        console.log('    ★ 「상담」 단추도 상담 판을 연다 ' + 못(await 쪽.evaluate(() => !!document.querySelector('.vp-상담판'))));
        await 쪽.screenshot({ path: path.join(__dirname, '그림', '주문관리CS-' + 모양 + (process.env.VW ? '-' + process.env.VW : '') + '.png') });
      }
      console.log('    ★ 쪽 오류 ' + 탈.length + '건 ' + 못(탈.length === 0) + (탈.length ? ' ' + JSON.stringify(탈) : ''));
      await ctx.close();
    }
  }
  await b.close();
  console.log('\n★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
})();
