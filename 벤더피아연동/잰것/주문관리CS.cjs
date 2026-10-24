/* **CS등록 = 벤더피아 주문관리 목록 그대로** 를 재는 자 (10-24 다시 시작).
   사장님 (10-24): 「배송관리의 모습이 보여지면 안되는곳이야 정확히 주문관리의 화면을 보여줘야하는곳이야 일단 cs등록 들어갔을때
   벤더피아의 주문관리 현재 목록이 그대로 보이게 해줘 …목록의 디자인 일관성을 유지해줘」
   재는 것: ㄱ) th 머리줄 · td 머리줄 표를 페이지에서 그대로 읽나(칸 이름·차례·값) ㄴ) 페이지 목록이 비면 같은 기본값으로 한 번만 조회하나
           ㄷ) 못 읽으면 빈 표 + 까닭 한 줄이고 배송목록을 안 부르나 ㄹ) 배송관리 모습(기간·검색창·거르개·출처)·이름 단추·줄 클릭 상담이 없나
           ㅁ) 표 꼴(머리 줄바꿈 없음·가로 스크롤) ㅂ) 늦게 오는 목록(AJAX)도 읽나
   ⚠ 진짜 vendorpia.com 은 못 닿는다 — 주문관리 모양은 흉내다. 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const 그림칸 = path.join(__dirname, '그림'); fs.mkdirSync(그림칸, { recursive: true });
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const 머리 = ["선택", "주문번호", "상품명", "수취인", "주문자", "휴대전화", "주소", "주문일", "배송상태", "택배사", "메모"];
const 줄들 = [0, 1, 2].map((i) => ["", "20261024-77" + i, "토리블리 책상 " + i, "가나다", "라마바", "010-1111-2222", "서울 ○○구 아주 긴 주소 123-4", "2026-10-2" + i, "배송중", "경동", "메모" + i]);
const 폼 = `<table id="조건"><tr><th>주문기간</th><td><input type="text" name="ctl00$txtFrom" value="2026/09/24"> ~ <input type="text" name="ctl00$txtTo" value="2026/10/24"></td></tr>
<tr><th>주문번호</th><td><input type="text" name="ctl00$txtOrdNo"></td><th>수취인</th><td><input type="text" name="ctl00$txtRcv"></td></tr></table>
<input type="image" name="ctl00$btnSrch" id="btnSrch" src="s.gif">`;
const 표 = (모양, 줄) => {
  const 본 = 줄.map((r) => `<tr>${r.map((v) => `<td>${v}</td>`).join('')}</tr>`).join('');
  if (모양 === 'td') return `<table id="grid"><tr>${머리.map((h) => `<td>${h}</td>`).join('')}</tr>${본}</table>`;
  return `<table id="grid"><thead><tr>${머리.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${본}</tbody><tfoot><tr><td colspan="11"><table><tr><td>1</td><td>2</td></tr></table></td></tr></tfoot></table>`;
};
const 쪽모양 = (내용) => `<html><head><meta charset="utf-8"></head><body id="body"><form name="f" method="post" action="/System/Sales/orderMst.aspx" id="f"><input type="hidden" name="__VIEWSTATE" value="x">
<div><table><tr><td>${폼}</td></tr><tr><td>${내용}</td></tr></table></div></form><p id="원래글">주문관리 원래 화면</p></body></html>`;
const 응답 = (모양) => `<html><body><span>총 3 건</span>${표(모양, 줄들)}</body></html>`;
const VP흉내 = `window.VP저장 = { get: async function(){return {};}, set: async function(){}, remove: async function(){} };`;

/* 모양: th / td = 페이지에 목록이 이미 있음, 비어있음 = 헤더만(조회 필요), 늦게 = 1.2초 뒤 AJAX 로 옴, 없음 = 표가 하나도 안 옴(조회도 빈 글) */
const 경우 = [
  { 이름: '머리줄이 th 인 목록', 쪽: () => 쪽모양(표('th', 줄들)), 읽는곳: '쪽', 기대칸: 11 },
  { 이름: '머리줄이 td 인 목록', 쪽: () => 쪽모양(표('td', 줄들)), 읽는곳: '쪽', 기대칸: 11 },
  { 이름: '목록이 비어 있음(머리만) → 같은 기본값으로 한 번 조회', 쪽: () => 쪽모양(표('th', [])), 읽는곳: '조회', 기대칸: 11 },
  { 이름: '목록이 늦게(AJAX) 옴', 쪽: () => 쪽모양('<div id="늦게"></div>') + `<script>setTimeout(function(){document.getElementById('늦게').innerHTML=${JSON.stringify(표('th', 줄들))};},1200)</script>`, 읽는곳: '쪽', 기대칸: 11 },
  { 이름: '못 읽음(표 없음, 조회 응답도 표 없음)', 쪽: () => 쪽모양('<div>데이터 없음</div>'), 읽는곳: '못읽음', 응답글: '<html><body>없음</body></html>' },
];

(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  let 초록 = 0, 빨강 = 0;
  const 못 = (참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };
  console.log('\n■ CS등록 = 주문관리 목록 그대로 (10-24 다시 시작)');
  for (const 너비 of [1280, 375]) for (const 해시 of ['#vgCS', '']) for (const c of 경우) {
    if (해시 === '' && c !== 경우[0]) continue;      // 해시가 있든 없든 같다 — 한 경우만
    const ctx = await b.newContext({ viewport: { width: 너비, height: 900 } });
    await ctx.route('**://identitytoolkit.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"idToken":"x"}' }));
    await ctx.route('**://firestore.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    const 부름 = [];
    await ctx.route('**://vendorpia.com/**', (r) => {
      const u = new URL(r.request().url()), m = r.request().method();
      부름.push(m + ' ' + u.pathname);
      const 화 = (t) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: t });
      if (/orderMst/.test(u.pathname)) return m === 'POST' ? 화(c.응답글 || 응답('th')) : 화(c.쪽());
      return r.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
    });
    const 쪽 = await ctx.newPage();
    const 탈 = []; 쪽.on('pageerror', (e) => 탈.push(String(e && e.message).slice(0, 140)));
    await 쪽.goto('https://vendorpia.com/System/Sales/orderMst.aspx' + 해시);
    await 쪽.addScriptTag({ content: 'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};document.cookie="VP_Cookie=LOGON_EMP_NO%3D7";' });
    await 쪽.addStyleTag({ content: ['login.css', 'search.css'].map((f) => fs.readFileSync(path.join(확장, f), 'utf8')).join('\n') });
    await 쪽.addScriptTag({ content: VP흉내 });
    await 쪽.addScriptTag({ content: fs.readFileSync(path.join(확장, 'search.js'), 'utf8') });
    await 쪽.waitForTimeout(4500);
    const 화면 = await 쪽.evaluate(() => {
      const 보임 = (e) => { if (!e) return false; const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 5 && r.height > 5 && s.display !== 'none' && s.visibility !== 'hidden'; };
      const t = document.querySelector('#vp-root .vp-table table');
      const th = t ? [...t.querySelectorAll('thead th')] : [];
      const 통 = document.querySelector('#vp-root .vp-table');
      return { 청소: document.documentElement.classList.contains('vp-clean'), 원래: 보임(document.getElementById('f')), 제목: (document.querySelector('#vp-root h1') || {}).textContent,
        메인: !!document.querySelector('#vp-root a.vp-home'),
        머리: th.map((x) => x.textContent), 줄: t ? [...t.querySelectorAll('tbody tr')].map((tr) => [...tr.cells].map((x) => x.textContent)) : [],
        한줄: th.every((x) => getComputedStyle(x).whiteSpace === 'nowrap'),
        배송꼴: !!document.querySelector('#vp-root .vp-bar, #vp-root input[type=date], #vp-root .vp-pills, #vp-root .vp-출처, .vp-cs판'),
        단추: document.querySelectorAll('#vp-root .vp-goods-list, #vp-root .vp-상담알, #vp-root tr.vp-줄상담').length,
        글: document.querySelector('#vp-root .vp-note').textContent, 까닭: document.querySelector('#vp-root .vp-진단').textContent,
        가로: 통 ? 통.scrollWidth > 통.clientWidth + 1 : false, 쪽가로: document.documentElement.scrollWidth > innerWidth + 1,
        글자수: document.querySelector('#vp-root').innerText.length };
    });
    console.log('\n  ◆ ' + c.이름 + ' · ' + (해시 || '(#vgCS 없이)') + ' · 창 ' + 너비);
    console.log('    제목 ' + 화면.제목 + ' · 칸 ' + 화면.머리.length + ' · 줄 ' + 화면.줄.length + ' · 글 "' + 화면.글 + '"' + (화면.까닭 ? '\n    까닭: ' + 화면.까닭.slice(0, 260) : ''));
    console.log('    ★ 제목 CS등록 · ← 메인 · 주문관리 원래 화면 가림 ' + 못(화면.제목 === 'CS등록' && 화면.메인 && 화면.청소 && !화면.원래));
    console.log('    ★ 배송관리 모습(기간·검색창·거르개·출처·CS판)이 없다 · 이름 단추·상담 단추·줄 클릭 없음 ' + 못(!화면.배송꼴 && 화면.단추 === 0));
    console.log('    ★ 배송목록·goods 를 안 불렀다 ' + 못(!부름.some((x) => /firmDvList|goods|salesGoods|StockList/i.test(x))));
    if (c.읽는곳 === '못읽음') {
      console.log('    ★ 빈 표 + 까닭 한 줄(표 수·줄/칸·첫 줄 글·iframe) ' + 못(화면.머리.length === 0 && /읽지 못/.test(화면.글) && /표 \d+개/.test(화면.까닭) && /iframe 0개/.test(화면.까닭) && /\d+줄\/\d+칸\[/.test(화면.까닭)));
    } else {
      console.log('    ★ 칸 이름·차례 = 주문관리 것 ' + 못(JSON.stringify(화면.머리) === JSON.stringify(머리)));
      console.log('    ★ 값·줄 = 주문관리 것 (3줄, 값 그대로) ' + 못(JSON.stringify(화면.줄) === JSON.stringify(줄들)));
      console.log('    ★ 자료를 읽은 곳 = ' + c.읽는곳 + ' — 주문관리 조회(POST) ' + (부름.filter((x) => /^POST/.test(x)).length) + '번 ' + 못(c.읽는곳 === '쪽' ? !부름.some((x) => /^POST/.test(x)) : 부름.filter((x) => /^POST \/System\/Sales\/orderMst/.test(x)).length === 1));
      console.log('    ★ 머리글 전부 한 줄(nowrap) · 쪽 전체는 안 밀림 ' + 못(화면.한줄 && !화면.쪽가로) + ' · 표 통 가로 스크롤 ' + 화면.가로);
    }
    console.log('    ★ 쪽 오류 ' + 탈.length + ' ' + 못(탈.length === 0));
    if (해시 === '#vgCS') await 쪽.screenshot({ path: path.join(그림칸, '주문관리CS-' + (c === 경우[0] ? 'th' : c === 경우[1] ? 'td' : c === 경우[2] ? '비어서조회' : c === 경우[3] ? '늦게' : '못읽음') + '-' + 너비 + '.png') });
    await ctx.close();
  }
  await b.close();
  console.log('\n★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  process.exit(빨강 ? 1 : 0);
})();
