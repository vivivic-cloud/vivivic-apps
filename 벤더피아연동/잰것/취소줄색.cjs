/* **CS등록 취소 줄 색** 을 재는 자 (11-04 [새 지시 취소줄색]). 진짜 search.js/search.css/goods.css, 자료는 전부 가짜.
   사장님(그대로): 「CS등록 목록에서 CS값이 취소 인 주문은 일반 주문과 구분되게 배경색 변경등을 적용해 주세요」
   재는 것: 1280·375 — 값 「취소」(앞뒤 공백 포함) 줄만 칠함 · 붙박이 첫 칸까지 같은 색 · 교환/반품/AS/빈값/부분취소 안 칠함 ·
           이름 단추·코드 글 대비 4.5:1 이상 · 점 보임 · 상담 알약 흰 바탕 · 올림(hover)해도 그대로 · 줄 누름 상담 · 배송관리는 같은 값이어도 안 칠함.
   돌리기: NODE_PATH=<playwright 있는 node_modules> VP_EXE=<크로미움> node 잰것/취소줄색.cjs */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = process.env.VP_EXE || '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const 그림칸 = path.join(__dirname, '그림');
const CS값 = ['', '취소', '교환', ' 취소 ', '반품', 'AS', '부분취소', ''];
const 머리 = ['CS', '주문번호', '상품코드', '상품명', '수취인', '주소'];
const 숨김 = Array.from({ length: 54 }, (_, i) => '숨김' + i);
const 전부 = [...머리, ...숨김];
const th = 전부.map((h, i) => `<th class="igg_HeaderCaption nowrap${i < 머리.length ? '' : ' igx'}"${i < 머리.length ? ' style="width: 80px;"' : ''}>${h}</th>`).join('');
const 몸 = CS값.map((v, n) => `<tr>${전부.map((h, i) => `<td class="${i < 머리.length ? '' : 'igx'}">${h === 'CS' ? v : h === '주문번호' ? '20261104-3' + n : h === '상품명' ? '토리블리 책상' : h === '상품코드' ? 'A' + n : i < 머리.length ? h + n : 'x'}</td>`).join('')}</tr>`).join('');
const 그리드 = `<style>.igx{display:none}</style><div id="oGrid"><table><tr>${th}</tr></table><table><tr><th><div><table><tbody>${몸}</tbody></table></div></th></tr></table></div>`;
const 주문폼 = `<form name="f" method="post" action="/System/Sales/orderMst.aspx" id="f"><input type="hidden" name="__VIEWSTATE" value="x"><input type="image" name="ctl00$btnSrch" id="btnSrch" src="s.gif"></form>`;
const 배송칸 = ['CS', '주문번호', '상품명', '수취인', '주소'];
const 배송표 = `<html><body><span>총 2 건</span><table><tr>${배송칸.map((h) => `<th>${h}</th>`).join('')}</tr>${['취소', ''].map((v, n) => `<tr><td>${v}</td><td>2026-${n}</td><td>토리블리 책상</td><td>수취인</td><td>주소</td></tr>`).join('')}</table></body></html>`;
const 배송폼 = `<form name="aspnetForm" method="post" action="/System/Delivery/firmDvList.aspx" id="aspnetForm"><input type="hidden" name="__VIEWSTATE" value="x"><input name="dcStartDt" id="dcStartDt" value="2026-07-23"><input name="dcEndDt" id="dcEndDt" value="2026-10-23"><select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select><input type="image" name="btnSearch" id="btnSearch" src="s.gif"></form>`;
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
const 대비 = (a, b) => { const L = (s) => { const c = s.match(/\d+/g).slice(0, 3).map((x) => { x /= 255; return x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }; const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };
(async () => {
  fs.mkdirSync(그림칸, { recursive: true });
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  let 초록 = 0, 빨강 = 0;
  const 봄 = (말, 참, 덧 = '') => { 참 ? 초록++ : 빨강++; console.log('  ' + (참 ? '✓' : '✗') + ' ' + 말 + (덧 ? ' — ' + 덧 : '')); };
  const 분홍 = 'rgb(255, 227, 227)';
  for (const 너비 of [1280, 375]) {
    console.log('\n■ 창 ' + 너비);
    const ctx = await b.newContext({ viewport: { width: 너비, height: 700 } });
    await ctx.route('**://identitytoolkit.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"idToken":"x"}' }));
    await ctx.route('**://firestore.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    await ctx.route('**://vendorpia.com/**', (r) => {
      const u = new URL(r.request().url()), m = r.request().method(), 화 = (t) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: t });
      if (/orderMst/.test(u.pathname)) return 화(m === 'POST' ? `<html><body>${그리드}</body></html>` : `<html><head><meta charset="utf-8"></head><body id="body">${주문폼}${그리드}</body></html>`);
      if (/firmDvList/.test(u.pathname)) return 화(m === 'POST' ? 배송표 : `<html><head><meta charset="utf-8"></head><body id="body">${배송폼}</body></html>`);
      return r.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
    });
    const 쪽 = await ctx.newPage(); const 탈 = []; 쪽.on('pageerror', (e) => 탈.push(String(e.message).slice(0, 120)));
    await 세우기(쪽, '/System/Sales/orderMst.aspx#vgCS');
    const 줄 = await 쪽.evaluate(() => [...document.querySelectorAll('.vp-table tbody tr')].map((tr) => ({ cs: tr.cells[0].textContent, 칠: tr.classList.contains('vp-취소줄'), 색: [...tr.cells].map((c) => getComputedStyle(c).backgroundColor) })));
    봄('줄 8개', 줄.length === 8, 줄.length);
    봄('값이 취소인 줄만 칠함(앞뒤 공백 포함 둘)', 줄.filter((r) => r.칠).map((r) => r.cs.trim()).join() === '취소,취소', 줄.filter((r) => r.칠).length + '줄');
    봄('부분취소·교환·반품·AS·빈값은 안 칠함', 줄.filter((r) => !r.칠).length === 6 && 줄.filter((r) => !r.칠).every((r) => !r.색.includes(분홍)));
    봄('칠한 줄은 붙박이 첫 칸까지 모든 칸이 같은 색', 줄.filter((r) => r.칠).every((r) => r.색.every((c) => c === 분홍)), 줄[1].색[0]);
    // 이름 단추는 goods.js 곁다리가 채운다 — 여기선 goods.js 가 그리는 꼴(점 넷 달린 단추)을 칸에 그대로 넣어 css 만 잰다
    await 쪽.evaluate(() => { document.querySelectorAll('.vp-table tbody td.vp-상품칸').forEach((td) => { td.innerHTML = '<div class="vp-goods-list"><button class="vp-instock vp-johon vp-ing vp-서류">토리블리 책상<span class="vp-점"><i class="g"></i><i class="r"></i><i class="o"></i><i class="b"></i></span></button><span class="vp-code">A1</span></div>'; }); });
    const 글 = await 쪽.evaluate(() => { const tr = document.querySelector('tr.vp-취소줄'), 단 = tr.querySelector('.vp-goods-list button'), 코드 = tr.querySelector('.vp-goods-list .vp-code'), 알 = tr.querySelector('.vp-상담알'), 일반 = document.querySelector('.vp-table tbody tr:not(.vp-취소줄) .vp-goods-list button');
      return { 단: 단 && getComputedStyle(단).color, 코드: 코드 && getComputedStyle(코드).color, 알: 알 && getComputedStyle(알).backgroundColor, 일반: 일반 && getComputedStyle(일반).color, 점: 단 ? [...단.querySelectorAll('.vp-점 i')].filter((i) => getComputedStyle(i).display !== 'none').length : -1 }; });
    봄('이름 단추 있음·대비 4.5 이상', !!글.단 && 대비(글.단, 분홍) >= 4.5, 글.단);
    봄('일반 줄 이름 단추 색은 그대로', 글.일반 === 'rgb(51, 126, 169)', 글.일반);
    봄('상담 알약 흰 바탕 그대로', 글.알 === 'rgb(255, 255, 255)', 글.알);
    봄('점 넷 보임', 글.점 === 4, 글.점);
    if (글.코드) 봄('코드 글 대비 4.5 이상', 대비(글.코드, 분홍) >= 4.5, 글.코드);
    await 쪽.locator('tr.vp-취소줄 td').last().hover();
    봄('마우스 올려도 색 그대로', await 쪽.evaluate(() => getComputedStyle(document.querySelector('tr.vp-취소줄 td')).backgroundColor) === 분홍);
    await 쪽.locator('tr.vp-취소줄 .vp-goods-list button').first().hover();
    봄('이름 단추에 올려도 글색 유지', await 쪽.evaluate(() => getComputedStyle(document.querySelector('tr.vp-취소줄 .vp-goods-list button')).color) === 글.단);
    봄('쪽 가로 스크롤 없음', await 쪽.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await 쪽.screenshot({ path: path.join(그림칸, `취소줄색-${너비}.png`) });
    await 쪽.locator('tr.vp-취소줄 td').last().click();
    await 쪽.waitForTimeout(300);
    봄('취소 줄 눌러도 상담 판 열림', await 쪽.locator('.vp-상담덮개').count() > 0);
    봄('화면 오류 없음', !탈.length, 탈.join(' | '));
    await 쪽.close();
    const 배 = await ctx.newPage();
    await 세우기(배, '/System/Delivery/firmDvList.aspx');
    const 값 = await 배.evaluate(() => ({ 글: document.querySelector('.vp-table tbody td')?.textContent, 수: document.querySelectorAll('.vp-취소줄').length }));
    봄('배송관리는 CS 값이 취소여도 안 칠함', 값.글 === '취소' && 값.수 === 0, JSON.stringify(값));
    await 배.close(); await ctx.close();
  }
  await b.close();
  console.log(`\n초록 ${초록} · 빨강 ${빨강}`);
  process.exit(빨강 ? 1 : 0);
})();
