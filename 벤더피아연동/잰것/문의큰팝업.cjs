/* **문의 큰 팝업 + 공용 팝업 부품** 을 재는 자 (11-01 [새 지시 문의큰팝업]).
   사장님(그대로): 「상담내용보기 에서 문의 내용 클릭시 등록된 문의내용 전문이 보이는 큰 팝업을 만들어 주고 … 이팝업은 마우스 드레그 이동이 가능하게 해서
   뒤 화면을 가리는것을 피해다닐 수 있게 해주고 백화면에 구애 받지 않고 크기가 조절 되게 해주고 내용이 길어지면 스크롤되게 해줘 이런유형의 모든 팝업이 이런 모습 적용해 줘」
   흉내 = `상담내용보기.cjs` 의 inquiryList 꼴 그대로 + 원주문 검색(ordersPopup) 빈 결과. 재는 것(1280·375): 위 기본 정보·가운데 문의 전문·아래 CS등록(같은 종류 넷·단품·메시지·저장),
   끌기·화면 밖 안 나감·가장자리/모서리 크기·작게 하면 안에서 스크롤·쪽 가로 스크롤 없음, 「CS등록 저장」 = 같은 길(원주문 검색에 **매출처주문번호**) — 흉내가 0줄을 줘 ①에서 멈춤(저장 POST·csDetl 0).
   goods.js 는 비워 두고 `VP상품단품` 을 흉내(단품 둘). 자료는 전부 가짜.
   돌리기(맥): NODE_PATH=<playwright> VP_EXE=<크로미움> node 잰것/문의큰팝업.cjs */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const 그림칸 = path.join(__dirname, '그림'); fs.mkdirSync(그림칸, { recursive: true });
const EXE = process.env.VP_EXE || '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const 머리 = ['', '주문번호', 'ctCd', 'inquiryCd', '문의자', '몰', '배송사', '문의유형', '배송상태', '처리결과', '상품명', '제목', '문의내용', '고객약속일', '답변내용', '수', '가용수', '답변자',
  '매출처', '매출처주문번호', '매출처상품코드', '주문자', '주문자전화', '주문자핸드폰', '수취인', '수취인전화', '수취인휴대폰', '우편번호', '주소', '수발신', '주문등록일', '문의접수일', '접수자', '순번'];
const 숨은 = new Set([1, 2, 3, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 33]);
const 보일 = 머리.filter((h, i) => i && !숨은.has(i));
const 값 = (꼴, r, c) => c === 0 ? '<input type="checkbox">' : c === 3 ? 꼴 + 'cd' + r : c === 12 ? 꼴 + ' 문의 첫줄<br>둘째줄 ' + r : c === 26 ? '010-1234-567' + r : 꼴 + r + '_' + c;
const 그리드 = (꼴, n, 시작 = 0) => {
  const th = 머리.map((h, i) => `<th class="igg_HeaderCaption${숨은.has(i) ? ' ig9x' : ''}">${h}</th>`).join('');
  const 몸 = Array.from({ length: n }, (_, k) => `<tr type="row">${머리.map((_, c) => `<td${c === 12 ? ` title="${값(꼴, k + 시작, c).replace('<br>', '\n')}"` : ''}>${값(꼴, k + 시작, c)}</td>`).join('')}</tr>`).join('');
  return `<div id="oGrid"><table><tr>${th}</tr></table><div><table><tbody>${몸}</tbody></table></div></div>`;
};
const 쪽 = (지금, 전체) => `<input type="hidden" name="ctl00$Contents$Pager1$hdCurrentPage" id="hdCurrentPage" value="${지금}"><input type="hidden" name="ctl00$Contents$Pager1$ctl01" value="${전체}"><input type="hidden" name="ctl00$Contents$Pager1$ctl02" value="27">
<table><tr><td class="paging">${[1, 2, 3].map((n) => `<a class="PageNum" href="javascript:__doPostBack('ctl00$Contents$Pager1$ctl${9 + n * 2}','')">${n}</a>`).join(' ')}
<input type="image" name="ctl00$Contents$Pager1$ctl32" alt="Next" src="r.svg"><input type="image" name="ctl00$Contents$Pager1$ctl34" alt="Last" src="rr.svg"></td></tr></table>`;
const 문의쪽 = (꼴, n, 지금, 전체) => `<html><body><form method="post" action="./inquiryList.aspx" id="aspnetForm"><input type="hidden" name="__VIEWSTATE" value="vs${지금}"><input type="hidden" name="__EVENTTARGET" value=""><input type="hidden" name="__EVENTARGUMENT" value="">
<select name="ctl00$Contents$ddlInqType"><option value="전체">전체</option><option value="1">배송</option><option value="3">교환</option></select>
<select name="ctl00$Contents$ddlCallEndGb"><option value="전체">전체</option><option value="1">처리중</option><option value="2">처리완료</option></select>
<select name="ctl00$Contents$ddlRowCnt"><option value="27">27</option><option value="500">500</option></select>
${['tbStoreOrderNo', 'tbOrderer', 'tbRecipient', 'tbInquirer', 'tbSGoodsNm', 'tbTitle', 'tbContent'].map((k) => `<input type="text" name="ctl00$Contents$${k}">`).join('')}
<input type="text" name="ctl00$Contents$dcStartDt" value="2026-09-27"><input type="text" name="ctl00$Contents$dcEndDt" value="2026-10-27">
<input type="image" name="ctl00$Contents$btnSearch" src="s.gif"><input type="image" name="ctl00$Contents$btnInsert" src="i.gif"><input type="image" name="ctl00$Contents$btnDelete" src="d.gif"><input type="image" name="ctl00$Contents$btnExcel" src="e.gif">
${그리드(꼴, n)}${쪽(지금, 전체)}</form></body></html>`;
const 주문쪽 = '<html><body id="body"><form id="f" method="post" action="/System/Sales/orderMst.aspx"><input type="hidden" name="__VIEWSTATE" value="x"><p id="원래">주문관리 원래</p></form></body></html>';

const 원주문쪽 = `<html><body><form method="post" action="./ordersPopup.aspx" id="aspnetForm"><input type="hidden" name="__VIEWSTATE" value="op">
<input type="text" id="tb_SOrderNo" name="ctl00$Contents$tb_SOrderNo"><input type="text" id="dcStartDt" name="ctl00$Contents$dcStartDt" value="2025-11-01">
<input type="image" id="btnSearch" name="ctl00$Contents$btnSearch" src="s.gif"><div id="oGrid"><table><tr><th>주문번호</th><th>상품명</th><th>주문번호</th></tr></table></div></form></body></html>`;

(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  let 초록 = 0, 빨강 = 0;
  const 못 = (참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };
  console.log('\n■ 문의 큰 팝업 + 공용 팝업 부품 (11-01)');
  for (const 너비 of [1280, 375]) {
    const ctx = await b.newContext({ viewport: { width: 너비, height: 800 } });
    await ctx.route('**://identitytoolkit.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"idToken":"x"}' }));
    await ctx.route('**://firestore.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    const 깃 = [];
    await ctx.route('**://vivivic-cloud.github.io/**', (r) => { 깃.push(decodeURIComponent(new URL(r.request().url()).pathname).split('/').pop());
      return r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }); });
    const 부름 = [], 보낸 = [];
    await ctx.route('**://vendorpia.com/**', (r) => {
      const q = r.request(), u = new URL(q.url());
      부름.push(q.method() + ' ' + u.pathname);
      const 화 = (t) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: t });
      if (/orderMst/i.test(u.pathname)) return 화(주문쪽);
      if (/ordersPopup/i.test(u.pathname)) { if (q.method() === 'POST') 보낸.push(Object.fromEntries(new URLSearchParams(q.postData() || ''))); return 화(원주문쪽); }
      if (/inquiryList/i.test(u.pathname)) return 화(문의쪽('조회', 3, 1, 3));
      return r.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
    });
    const pg = await ctx.newPage();
    const 탈 = []; pg.on('pageerror', (e) => 탈.push(String(e && e.message).slice(0, 140)));
    await pg.goto('https://vendorpia.com/System/Sales/orderMst.aspx#vgInq');
    await pg.addScriptTag({ content: 'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};' });
    await pg.addStyleTag({ content: ['login.css', 'search.css', 'goods.css'].map((f) => fs.readFileSync(path.join(확장, f), 'utf8')).join('\n') });
    await pg.addScriptTag({ content: 'window.VP저장={get:async()=>({}),set:async()=>{},remove:async()=>{}};'
      + 'window.VP상품단품=async(이름)=>{window.__단품물음=이름;return [{code:"bs-body",name:"비스켓 몸통",n:1},{code:"bs-door",name:"비스켓 문짝",n:2}]};' });
    await pg.addScriptTag({ content: fs.readFileSync(path.join(확장, 'vp-data.js'), 'utf8') });
    await pg.addScriptTag({ content: fs.readFileSync(path.join(확장, 'search.js'), 'utf8') });
    await pg.waitForTimeout(1200);
    console.log('\n  ◆ 창 ' + 너비);
    부름.length = 0;
    await pg.click('#vp-root .vp-table tbody tr:nth-child(2) td:nth-child(3)'); await pg.waitForTimeout(400);
    const 판 = await pg.evaluate(() => { const d = document.querySelector('#vp-root .vp-문의덮개 .vp-문의판'); if (!d) return null;
      const r = d.getBoundingClientRect(), y = (s) => (d.querySelector(s) || { getBoundingClientRect: () => ({ top: -1 }) }).getBoundingClientRect().top;
      const dl = [...d.querySelectorAll('.vp-문의정보 dt')].map((x) => [x.textContent, x.nextElementSibling.textContent]);
      return { 머리: d.querySelector('.vp-상담머리 strong').textContent, 작은: d.querySelector('.vp-상담머리 small').textContent, 문의: d.querySelector('.vp-문의글').textContent,
        글꼴: getComputedStyle(d.querySelector('.vp-문의글')).fontSize, 정보: Object.fromEntries(dl), 정보칸: dl.map((x) => x[0]),
        y정보: y('.vp-문의정보'), y본문: y('.vp-문의본문'), y답: y('.vp-답변글'), yCS: y('.vp-cs등록'),
        종류: [...d.querySelectorAll('.vp-cs등록 .vp-상담종류')].map((x) => x.textContent), 접수폼: !!d.querySelector('.vp-상담적기'),
        w: r.width, 안: r.left >= 0 && r.right <= innerWidth + 1 && r.top >= 0 && r.bottom <= innerHeight + 1,
        공용: d.classList.contains('vp-팝업') && d.querySelectorAll(':scope > .vp-팝업손').length === 5 && !!d.querySelector(':scope > .vp-팝업몸') };
    });
    console.log('    판 ' + JSON.stringify(판 && { 머리: 판.머리, 작은: 판.작은, w: Math.round(판.w), 정보칸: 판.정보칸 }));
    console.log('    ★ 줄 누름 → 큰 팝업(문의판) · 제목·유형·처리결과·접수일 머리 ' + 못(판 && 판.머리 === '조회1_11' && 판.작은 === '조회1_7 · 조회1_9 · 조회1_31'));
    console.log('    ★ 위 기본 정보 = 칸 이름 그대로(문의자·주문자·전화·수취인휴대폰·상품명·매출처주문번호·주문번호·주소…) ' + 못(판 && 판.정보.문의자 === '조회1_4' && 판.정보['수취인휴대폰'] === '010-1234-5671'
      && 판.정보.상품명 === '조회1_10' && 판.정보.매출처주문번호 === '조회1_19' && 판.정보.주문번호 === '조회1_1' && 판.정보.주소 === '조회1_28' && 판.정보.주문자전화 === '조회1_22' && !('문의내용' in 판.정보) && !('ctCd' in 판.정보)));
    console.log('    ★ 가운데 = 문의내용 전문(주체, 15px) · 그 아래 답변 · 맨 아래 CS등록 ' + 못(판 && 판.문의 === '조회 문의 첫줄\n둘째줄 1' && 판.글꼴 === '15px' && 판.y정보 < 판.y본문 && 판.y본문 < 판.y답 && 판.y답 < 판.yCS));
    console.log('    ★ CS등록 = 상담 판과 같은 종류 넷(교환·반품·AS·취소) · 「접수」 폼은 없음 ' + 못(판 && 판.종류.join() === '교환,반품,AS,취소' && !판.접수폼));
    console.log('    ★ 크기 ' + (너비 > 900 ? '820px' : '화면 폭 안') + ' · 화면 안 · 공용 팝업(손잡이 5·몸) ' + 못(판 && (너비 > 900 ? Math.round(판.w) === 820 : 판.안) && 판.안 && 판.공용));
    console.log('    ★ 문의 열기에 벤더피아 요청 0 ' + 못(부름.length === 0));
    await pg.screenshot({ path: path.join(그림칸, '문의큰팝업-' + 너비 + '.png') });

    /* CS등록 — 같은 로직: 종류 → 단품(상품명으로 물음) → 메시지 → 저장 = 원주문 검색에 매출처주문번호 */
    await pg.click('.vp-문의판 .vp-cs등록 .vp-상담종류[data-k="교환"]'); await pg.waitForTimeout(400);
    const 단 = await pg.evaluate(() => ({ 물음: window.__단품물음, 단추: [...document.querySelectorAll('.vp-문의판 .vp-cs단품 .vp-goods-list > button')].map((x) => x.textContent),
      검색: !document.querySelector('.vp-문의판 .vp-cs단품검색').hidden, goods부름: true }));
    console.log('    ★ 「교환」 → 이 문의 상품명으로 단품 · 단품 단추 둘 · 단품 검색칸 ' + 못(단.물음 === '조회1_10' && 단.단추.join() === '비스켓 몸통,비스켓 문짝' && 단.검색) + ' ' + JSON.stringify(단.단추));
    console.log('    ★ goods.js 를 뒷길로 한 번 부름(단품 단추·검색용) ' + 못(깃.filter((x) => x === 'goods.js').length === 1));
    await pg.click('.vp-문의판 .vp-cs단품 .vp-goods-list > button >> nth=1'); await pg.waitForTimeout(200);
    await pg.fill('.vp-문의판 .vp-cs메시지 textarea', '문짝 교환 부탁');
    const 고른 = await pg.evaluate(() => ({ 글: document.querySelector('.vp-문의판 .vp-cs고른것').textContent, 저장: !document.querySelector('.vp-문의판 .vp-cs저장').disabled,
      메시지: !document.querySelector('.vp-문의판 .vp-cs메시지').hidden }));
    console.log('    ★ 단품 고름 → 「교환 · 비스켓 문짝 ×2」 · 메시지 칸 · 저장 켜짐 ' + 못(고른.글 === '교환 · 비스켓 문짝 ×2' && 고른.저장 && 고른.메시지));
    부름.length = 0; 보낸.length = 0;
    await pg.click('.vp-문의판 .vp-cs저장'); await pg.waitForTimeout(1500);
    const 결과 = await pg.evaluate(() => document.querySelector('.vp-문의판 .vp-cs알림').textContent);
    console.log('    「CS등록 저장」 → ' + 결과 + ' · 부름 ' + JSON.stringify(부름));
    console.log('    ★ 저장 = 같은 길: 원주문 검색 tb_SOrderNo = 매출처주문번호(조회1_19) ' + 못(보낸.length >= 1 && 보낸.every((f) => f['ctl00$Contents$tb_SOrderNo'] === '조회1_19')));
    console.log('    ★ 흉내가 0줄 → ① 에서 멈춤 · csDetl·저장 POST 0 ' + 못(/^실패\(① 원주문을 못 찾음/.test(결과) && !부름.some((x) => /csDetl|orderMst/i.test(x))));

    /* 끌기 */
    const 자리 = () => pg.evaluate(() => { const r = document.querySelector('.vp-문의판').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, r: r.right, b: r.bottom }; });
    const 머리점 = () => pg.evaluate(() => { const r = document.querySelector('.vp-문의판 .vp-상담머리 strong').getBoundingClientRect(); return { x: r.left + 4, y: r.top + r.height / 2 }; });
    const 끌기 = async (from, dx, dy) => { await pg.mouse.move(from.x, from.y); await pg.mouse.down(); await pg.mouse.move(from.x + dx / 2, from.y + dy / 2); await pg.mouse.move(from.x + dx, from.y + dy); await pg.mouse.up(); await pg.waitForTimeout(150); };
    const 앞 = await 자리();
    await 끌기(await 머리점(), -40, 30);
    const 뒤 = await 자리();
    console.log('    ★ 머리 끌기 (-40,+30) → ' + Math.round(뒤.x - 앞.x) + ',' + Math.round(뒤.y - 앞.y) + ' ' + 못((너비 > 900 ? Math.abs(뒤.x - 앞.x + 40) < 2 : 뒤.x < 앞.x) && 뒤.y > 앞.y && 뒤.y - 앞.y <= 30.5));
    await 끌기(await 머리점(), 3000, 3000);
    const 밖 = await 자리();
    console.log('    ★ 화면 밖으로 끌어도 안 나감 ' + 못(밖.x >= 0 && 밖.y >= 0 && 밖.r <= 너비 + 1 && 밖.b <= 800 + 1));
    await 끌기(await 머리점(), -3000, -3000);
    /* 크기 — 모서리·가장자리 */
    const 손 = (d) => pg.evaluate((d) => { const r = document.querySelector('.vp-문의판 > .vp-팝업손[data-d="' + d + '"]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, d);
    const 크1 = await 자리();
    await 끌기(await 손('s'), 0, -(크1.h - 300));
    const 크2 = await 자리();
    const 몸 = await pg.evaluate(() => { const m = document.querySelector('.vp-문의판 > .vp-팝업몸'); const 전 = m.scrollHeight > m.clientHeight + 10; m.scrollTop = 200; return { 전, 내려감: m.scrollTop > 0, 오버: getComputedStyle(m).overflowY }; });
    console.log('    ★ 아래 가장자리로 높이 300 → 내용은 판 안에서 스크롤 ' + 못(Math.abs(크2.h - 300) < 3 && 몸.전 && 몸.내려감) + ' (' + Math.round(크2.h) + 'px, ' + 몸.오버 + ')');
    if (너비 > 900) {
      await 끌기(await 손('e'), -200, 0);
      const 크3 = await 자리();
      await 끌기(await 손('se'), 100, 120);
      const 크4 = await 자리();
      await 끌기(await 손('w'), 2000, 0);
      const 크5 = await 자리();
      await 끌기(await 손('sw'), -100, 50);
      const 크6 = await 자리();
      console.log('    ★ 오른쪽 가장자리 -200 → 폭 ' + Math.round(크3.w) + ' ' + 못(Math.abs(크3.w - (크2.w - 200)) < 3));
      console.log('    ★ 오른쪽 아래 모서리 +100,+120 → ' + Math.round(크4.w) + '×' + Math.round(크4.h) + ' ' + 못(Math.abs(크4.w - 크3.w - 100) < 3 && Math.abs(크4.h - 크3.h - 120) < 3));
      console.log('    ★ 왼쪽 가장자리로 줄여도 최소 폭 260 · 오른쪽 끝 그대로 ' + 못(Math.abs(크5.w - 260) < 2 && Math.abs(크5.r - 크4.r) < 2));
      console.log('    ★ 왼쪽 아래 모서리 -100,+50 ' + 못(Math.abs(크6.w - 360) < 3 && Math.abs(크6.h - 크5.h - 50) < 3 && Math.abs(크6.r - 크5.r) < 2));
    }
    await 끌기(await 손('se'), 5000, 5000);
    const 큼 = await 자리();
    const 가로 = await pg.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    console.log('    ★ 아무리 키워도 화면 안 · 쪽 전체 가로 스크롤 없음 ' + 못(큼.r <= 너비 + 1 && 큼.b <= 800 + 1 && !가로));
    await pg.screenshot({ path: path.join(그림칸, '문의큰팝업-크기-' + 너비 + '.png') });
    await pg.keyboard.press('Escape');
    console.log('    ★ Esc 로 닫힘 ' + 못(!(await pg.$('#vp-root .vp-문의덮개'))));
    console.log('    ★ 쪽 오류 ' + 탈.length + ' ' + 못(탈.length === 0) + (탈.length ? ' ' + 탈.join(' | ') : ''));
    await ctx.close();
  }
  await b.close();
  console.log('\n★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  process.exit(빨강 ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
