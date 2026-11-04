/* 배송관리·CS등록 표 = 벤더피아 꼴 · 열 넓이 끌기 시험 (11-04 [새 지시 표촘촘히]). 자료는 전부 가짜.
   진짜 search.js/search.css/goods.css 로 세운다. 1280·375 — 꼴(11px·25px·2px 3px·칸선) · 끌기 · 새로고침 뒤 기억 · 두 번 눌러 되돌림 ·
   화면별 따로 기억 · 망가진 저장값 · 표 안 가로 스크롤 · 쪽 가로 스크롤 없음 · 줄 누름=상담 판 · 상담내용보기 표는 그대로 인지 잰다. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = process.env.VP_EXE || '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const 그림칸 = path.join(__dirname, '그림');
const 칸 = ["CS","IMG","매출처","주문번호","상품명","옵션","수량","가용수량","몰","주문자","수취인","휴대전화","우편번호","주소","배송메세지","배송메모","본사메모","배송사","송장번호","상태","등록일","입고일","주문번호"];
const 값 = (c, i) => c === '주문번호' ? '20261104-10' + i : c === '상품명' ? '토리블리 2단 와이드 교구장 (화이트/오크) 1200x450' : c === '주소' ? '서울특별시 어느구 어느로 123 가나다아파트 101동 1001호' : c === '상태' ? '배송준비' : c === '수량' ? '1' : c + i;
const 표 = (줄수) => `<html><body><span>총 ${줄수} 건</span><table><tr>${칸.map((h) => `<th>${h}</th>`).join('')}</tr>${Array.from({ length: 줄수 }, (_, i) => `<tr>${칸.map((c) => `<td>${값(c, i)}</td>`).join('')}</tr>`).join('')}</table></body></html>`;
const 폼 = `<form name="aspnetForm" method="post" action="/System/Delivery/firmDvList.aspx" id="aspnetForm"><input type="hidden" name="__VIEWSTATE" value="x"><input name="dcStartDt" id="dcStartDt" value="2026-07-23"><input name="dcEndDt" id="dcEndDt" value="2026-10-23"><select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select><input type="image" name="btnSearch" id="btnSearch" src="s.gif"></form>`;
const 주문폼 = `<form name="f" method="post" action="/System/Sales/orderMst.aspx" id="f"><input type="hidden" name="__VIEWSTATE" value="x"><input type="image" name="ctl00$btnSrch" id="btnSrch" src="s.gif"></form>`;
const 주문머리 = ["선택칸", "주문번호", "상품명", "수취인", "주문자", "휴대전화", "주소", "주문일"];
const 오그리드 = (() => { const 전부 = [...주문머리, ...Array.from({ length: 54 }, (_, i) => '숨김' + i)];
  const th = 전부.map((h, i) => `<th class="igg_HeaderCaption nowrap${i < 8 ? '' : ' igx'}"${i < 8 ? ' style="width: 80px;"' : ''}>${h}</th>`).join('');
  const 몸 = [0, 1, 2].map((n) => `<tr>${전부.map((h, i) => `<td class="${i < 8 ? '' : 'igx'}">${i < 8 ? (h === '주문번호' ? '20261104-20' + n : h === '상품명' ? '토리블리 책상' : h === '선택칸' ? '' : h + n) : 'x'}</td>`).join('')}</tr>`).join('');
  return `<style>.igx{display:none}</style><div id="oGrid"><table><tr>${th}</tr></table><table><tr><th><div><table><tbody>${몸}</tbody></table></div></th></tr></table></div>`; })();
const 세우기 = async (쪽, 주소) => {
  await 쪽.goto('about:blank'); await 쪽.goto('https://vendorpia.com' + 주소);
  await 쪽.addScriptTag({ content: 'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};document.cookie="VP_Cookie=LOGON_EMP_NO%3D7";' });
  await 쪽.addStyleTag({ content: ['login.css', 'search.css', 'goods.css'].map((f) => fs.readFileSync(path.join(확장, f), 'utf8')).join('\n') });
  await 쪽.addScriptTag({ content: 'window.VP저장={get:async()=>({}),set:async()=>{},remove:async()=>{}};' });
  await 쪽.addScriptTag({ content: fs.readFileSync(path.join(확장, 'vp-data.js'), 'utf8') });
  await 쪽.addScriptTag({ content: fs.readFileSync(path.join(확장, 'search.js'), 'utf8') });
  await 쪽.waitForTimeout(800);
  if (!/orderMst/.test(주소)) await 쪽.click('.vp-bar button[type=submit]');
  await 쪽.waitForSelector('.vp-table tbody tr', { timeout: 6000 });
  await 쪽.waitForTimeout(300);
};
const 넓이 = (쪽, i) => 쪽.evaluate((i) => Math.round(document.querySelectorAll('.vp-table thead th')[i].getBoundingClientRect().width), i);
const 끌기 = async (쪽, i, 만큼) => {
  const 손 = 쪽.locator('.vp-table thead th').nth(i).locator('.vp-열손');
  await 손.scrollIntoViewIfNeeded();
  const r = await 손.boundingBox();
  await 쪽.mouse.move(r.x + 3, r.y + 10); await 쪽.mouse.down(); await 쪽.mouse.move(r.x + 3 + 만큼 / 2, r.y + 10); await 쪽.mouse.move(r.x + 3 + 만큼, r.y + 10); await 쪽.mouse.up();
};
(async () => {
  fs.mkdirSync(그림칸, { recursive: true });
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  let 초록 = 0, 빨강 = 0;
  const 봄 = (말, 참, 덧 = '') => { 참 ? 초록++ : 빨강++; console.log('  ' + (참 ? '✓' : '✗') + ' ' + 말 + (덧 ? ' — ' + 덧 : '')); };
  for (const 너비 of [1280, 375]) {
    const ctx = await b.newContext({ viewport: { width: 너비, height: 800 } });
    await ctx.route('**://identitytoolkit.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"idToken":"x"}' }));
    await ctx.route('**://firestore.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    await ctx.route('**://vendorpia.com/**', (r) => {
      const u = new URL(r.request().url()), m = r.request().method(), 화 = (t) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: t });
      if (/orderMst/.test(u.pathname)) return 화(m === 'POST' ? `<html><body>${오그리드}</body></html>` : `<html><head><meta charset="utf-8"></head><body id="body">${주문폼}${오그리드}</body></html>`);
      if (/firmDvList/.test(u.pathname)) return 화(m === 'POST' ? 표(40) : `<html><head><meta charset="utf-8"></head><body id="body">${폼}</body></html>`);
      return r.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
    });
    for (const [이름, 주소] of [['배송관리', '/System/Delivery/firmDvList.aspx'], ['CS등록', '/System/Sales/orderMst.aspx#vgCS']]) {
      console.log('\n■ ' + 이름 + ' · 창 ' + 너비);
      const 쪽 = await ctx.newPage(); const 탈 = []; 쪽.on('pageerror', (e) => 탈.push(String(e.message).slice(0, 120)));
      await 세우기(쪽, 주소);
      const 꼴 = await 쪽.evaluate(() => { const th = document.querySelector('.vp-table thead th:nth-child(2)'), td = document.querySelector('.vp-table tbody td:nth-child(2)'); const c = getComputedStyle(th), d = getComputedStyle(td);
        return { 머리: [c.fontSize, c.fontWeight, c.backgroundColor, c.textAlign, c.borderBottomColor].join(), 몸: [d.fontSize, d.lineHeight, d.padding, d.borderRightWidth, d.borderBottomColor].join(), 글꼴: d.fontFamily, 줄: td.parentNode.getBoundingClientRect().height, 머리키: th.getBoundingClientRect().height }; });
      봄('머리 11px·700·#f5f5f5·가운데·#c0c0c0', 꼴.머리 === '11px,700,rgb(245, 245, 245),center,rgb(192, 192, 192)', 꼴.머리);
      봄('몸 11px·글줄 20px·2px 3px·칸선 1px', 꼴.몸 === '11px,20px,2px 3px,1px,rgb(192, 192, 192)', 꼴.몸);
      봄('글꼴 벤더피아 것', /Microsoft Sans Serif/.test(꼴.글꼴));
      봄('줄 25px · 머리 25px', Math.abs(꼴.줄 - 25) < .6 && Math.abs(꼴.머리키 - 25) < .6, 꼴.줄 + '/' + 꼴.머리키);
      await 쪽.evaluate(() => { const t = document.querySelector('.vp-table'); t.scrollLeft = 0; });
      const 전 = await 넓이(쪽, 1);
      await 끌기(쪽, 1, 40);
      const 후 = await 넓이(쪽, 1);
      봄('끌면 넓어짐', Math.abs(후 - 전 - 40) <= 2, 전 + '→' + 후);
      await 끌기(쪽, 1, -500);
      봄('최소 넓이 16px 아래로 안 줄어듦', (await 넓이(쪽, 1)) === 16, String(await 넓이(쪽, 1)));
      await 끌기(쪽, 1, 44);
      const 끌은값 = await 넓이(쪽, 1);
      await 쪽.screenshot({ path: path.join(그림칸, '표촘촘-' + 이름 + '-' + 너비 + '.png') });
      const 스크롤 = await 쪽.evaluate(() => { const t = document.querySelector('.vp-table'), 앞 = t.scrollLeft; t.scrollLeft = 200; const 뒤 = t.scrollLeft; t.scrollLeft = 앞; return { 뒤, 쪽넓이: document.documentElement.scrollWidth, 창: innerWidth, 몸: document.body.scrollWidth, 표넘음: t.scrollWidth > t.clientWidth }; });
      if (이름 === '배송관리') 봄('표 안에서 가로로 밀림', 스크롤.표넘음 && 스크롤.뒤 > 0, JSON.stringify(스크롤));
      봄('쪽 전체 가로 스크롤 없음', 스크롤.쪽넓이 <= 스크롤.창 && 스크롤.몸 <= 스크롤.창);
      await 쪽.locator('.vp-table tbody tr td:nth-child(3)').first().click();
      await 쪽.waitForTimeout(250);
      봄('줄 누름 = 상담 판', await 쪽.locator('.vp-상담판').count() > 0);
      await 세우기(쪽, 주소);
      봄('새로고침 뒤에도 그 넓이', (await 넓이(쪽, 1)) === 끌은값, String(await 넓이(쪽, 1)));
      await 쪽.locator('.vp-table thead th').nth(1).locator('.vp-열손').dblclick();
      await 쪽.waitForTimeout(100);
      봄('경계 두 번 누르면 처음 넓이', (await 넓이(쪽, 1)) === 전, String(await 넓이(쪽, 1)));
      await 쪽.evaluate((k) => localStorage.setItem(k, '{망가짐'), 이름 === 'CS등록' ? 'vp열넓이:CS' : 'vp열넓이:배송');
      await 세우기(쪽, 주소);
      봄('저장값이 망가져도 표가 그려짐', await 쪽.locator('.vp-table tbody tr').count() > 0);
      await 쪽.evaluate((k) => localStorage.removeItem(k), 이름 === 'CS등록' ? 'vp열넓이:CS' : 'vp열넓이:배송');
      봄('쪽 오류 0', 탈.length === 0, 탈.join(' | '));
      await 쪽.close();
    }
    /* 화면별 기억 + 상담내용보기 표는 그대로 */
    const 쪽 = await ctx.newPage();
    await 세우기(쪽, '/System/Delivery/firmDvList.aspx');
    await 끌기(쪽, 1, 30);
    const 키들 = await 쪽.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('vp열넓이')));
    봄('배송관리에서 끈 것은 배송 열쇠에만', 키들.join() === 'vp열넓이:배송', 키들.join());
    await ctx.close();
  }
  await b.close();
  console.log('\n■ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  process.exit(빨강 ? 1 : 0);
})();
