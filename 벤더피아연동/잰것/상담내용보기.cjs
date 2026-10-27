/* **상담내용보기 = 벤더피아 CS→고객문의 목록을 우리 표 꼴로** 를 재는 자 (10-27 [새 지시 상담내용보기]).
   사장님(그대로): 「시에등록 헤더에 상담내용보기 버튼을 만들어서 벤더피아 실재 페이지의 CS-고객문의 페이지를 현재 표 디자인에 맞게 보여주는 페이지가 나타나게 해줘」
   흉내 = 사장님 크롬에서 잰 `inquiryList.aspx` 꼴(#oGrid 34칸 · 숨은 칸 15 · Pager1 숨은 값 · PageNum __doPostBack · 그림 단추 Next/Last · 등록·삭제 그림 단추).
   재는 것: CS등록 머리 단추(새 탭) · 보이는 칸·값 · 건수 · 쪽 넘김 POST · 멀티검색 POST · 줄 누름 판(전문·숨은 칸) · 쓰기 단추 안 보냄. 자료는 전부 가짜.
   돌리기: NODE_PATH=<playwright 있는 node_modules> PW_EXE=<크로미움> node 잰것/상담내용보기.cjs */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const 그림칸 = path.join(__dirname, '그림'); fs.mkdirSync(그림칸, { recursive: true });
const EXE = process.env.PW_EXE || '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
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

(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  let 초록 = 0, 빨강 = 0;
  const 못 = (참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };
  console.log('\n■ 상담내용보기 (10-27)');
  for (const 너비 of [1280, 375]) {
    const ctx = await b.newContext({ viewport: { width: 너비, height: 900 } });
    await ctx.route('**://identitytoolkit.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"idToken":"x"}' }));
    await ctx.route('**://firestore.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    const 부름 = [], 보낸 = [];
    await ctx.route('**://vendorpia.com/**', (r) => {
      const q = r.request(), u = new URL(q.url());
      부름.push(q.method() + ' ' + u.pathname);
      const 화 = (t) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: t });
      if (/orderMst/i.test(u.pathname)) return 화(주문쪽);
      if (/inquiryList/i.test(u.pathname)) {
        if (q.method() !== 'POST') return 화(문의쪽('첫', 3, 1, 7676));
        const p = Object.fromEntries(new URLSearchParams(q.postData() || ''));
        보낸.push(p);
        if (/Pager1\$ctl13/.test(p.__EVENTTARGET)) return 화(문의쪽('둘째쪽', 2, 2, 7676));
        const 찾은 = Object.entries(p).find(([k, v]) => /\$tb/.test(k) && v);
        return 화(문의쪽(찾은 ? '찾음' : '조회', 2, 1, 2));
      }
      return r.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
    });
    const 열기 = async (해시) => {
      const pg = await ctx.newPage();
      const 탈 = []; pg.on('pageerror', (e) => 탈.push(String(e && e.message).slice(0, 140)));
      await pg.goto('https://vendorpia.com/System/Sales/orderMst.aspx' + 해시);
      await pg.addScriptTag({ content: 'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};' });
      await pg.addStyleTag({ content: ['login.css', 'search.css'].map((f) => fs.readFileSync(path.join(확장, f), 'utf8')).join('\n') });
      await pg.addScriptTag({ content: 'window.VP저장={get:async()=>({}),set:async()=>{},remove:async()=>{}};' });
      await pg.addScriptTag({ content: fs.readFileSync(path.join(확장, 'search.js'), 'utf8') });
      await pg.waitForTimeout(1500);
      return { pg, 탈 };
    };
    console.log('\n  ◆ 창 ' + 너비);
    /* ① CS등록 머리 단추 */
    const cs = await 열기('#vgCS');
    const 단추 = await cs.pg.evaluate(() => { const a = document.querySelector('#vp-root .vp-머리줄 a.vp-머리단추'); const r = a && a.getBoundingClientRect();
      return a ? { 글: a.textContent, 주소: a.getAttribute('href'), 새: a.target === '_blank', 보임: r.width > 5 && r.height > 5, 제목: document.querySelector('#vp-root h1').textContent } : null; });
    console.log('    ★ CS등록 머리에 「상담내용보기」 · 새 탭 · #vgInq ' + 못(단추 && 단추.글 === '상담내용보기' && 단추.새 && 단추.주소 === '/System/Sales/orderMst.aspx#vgInq' && 단추.보임 && 단추.제목 === 'CS등록'));
    await cs.pg.close();
    /* ② 상담내용보기 화면 */
    부름.length = 0;
    const { pg, 탈 } = await 열기('#vgInq');
    const 화면 = await pg.evaluate(() => { const t = document.querySelector('#vp-root .vp-table table');
      return { 제목: (document.querySelector('#vp-root h1') || {}).textContent, 청소: document.documentElement.classList.contains('vp-clean'),
        원래: !!document.getElementById('원래') && document.getElementById('원래').getBoundingClientRect().height > 0,
        머리: t ? [...t.querySelectorAll('thead th')].map((x) => x.textContent) : [], 줄: t ? [...t.querySelectorAll('tbody tr')].map((tr) => [...tr.cells].map((c) => c.textContent)) : [],
        글: document.querySelector('#vp-root .vp-note').textContent, 기간: [...document.querySelectorAll('#vp-root .vp-bar input[type=date]')].map((x) => x.value),
        쪽: [...document.querySelectorAll('#vp-root .vp-쪽넘김 button')].map((x) => x.textContent + (x.getAttribute('aria-current') ? '*' : '')),
        CS판: !!document.querySelector('.vp-cs판'), 쪽가로: document.documentElement.scrollWidth > innerWidth + 1,
        첫칸붙음: t ? getComputedStyle(t.querySelector('thead th')).position === 'sticky' : false }; });
    console.log('    제목 ' + 화면.제목 + ' · 칸 ' + 화면.머리.length + ' · 줄 ' + 화면.줄.length + ' · 글 "' + 화면.글 + '" · 쪽 ' + 화면.쪽.join(' '));
    console.log('    ★ 제목 상담내용보기 · 원래 화면 가림 · CS등록 판 안 뜸 ' + 못(화면.제목 === '상담내용보기' && 화면.청소 && !화면.원래 && !화면.CS판));
    console.log('    ★ 보이는 칸만·벤더피아 차례(숨은 칸 15·체크 칸 뺌) ' + 못(JSON.stringify(화면.머리) === JSON.stringify(보일)));
    console.log('    ★ 값 그대로(문의내용 <br> → 한 줄 글) ' + 못(화면.줄.length === 3 && 화면.줄[0][0] === '첫0_4' && 화면.줄[1][보일.indexOf('문의내용')] === '첫 문의 첫줄\n둘째줄 1'));
    console.log('    ★ 건수 = Pager 전체 수 · 기간 = 벤더피아 기본값 ' + 못(화면.글 === '7,676건 · 1쪽' && 화면.기간.join('~') === '2026-09-27~2026-10-27'));
    console.log('    ★ 쪽 넘김 = 벤더피아 것 그대로(1* 2 3 › ») ' + 못(화면.쪽.join(' ') === '1* 2 3 › »'));
    console.log('    ★ 표 꼴 = 우리 표(머리 sticky) · 쪽 전체 안 밀림 ' + 못(화면.첫칸붙음 && !화면.쪽가로));
    console.log('    ★ 처음은 GET 하나뿐(POST 없음) ' + 못(부름.filter((x) => /inquiryList/i.test(x)).join() === 'GET /System/CS/inquiryList.aspx'));
    await pg.screenshot({ path: path.join(그림칸, '상담내용보기-' + 너비 + '.png') });
    /* ③ 쪽 넘김 */
    await pg.click('#vp-root .vp-쪽넘김 button:nth-child(2)'); await pg.waitForTimeout(600);
    const p2 = 보낸[보낸.length - 1] || {};
    const 둘 = await pg.evaluate(() => ({ 첫: document.querySelector('#vp-root .vp-table tbody td').textContent, 글: document.querySelector('#vp-root .vp-note').textContent,
      쪽: [...document.querySelectorAll('#vp-root .vp-쪽넘김 button')].map((x) => x.textContent + (x.getAttribute('aria-current') ? '*' : '')).join(' ') }));
    console.log('    ★ 2쪽 = __EVENTTARGET Pager1$ctl13 + 받은 폼(VIEWSTATE) POST ' + 못(p2.__EVENTTARGET === 'ctl00$Contents$Pager1$ctl13' && p2.__VIEWSTATE === 'vs1' && !Object.keys(p2).some((k) => /btn/.test(k))));
    console.log('    ★ 2쪽 줄·글·쪽 표시 ' + 못(둘.첫 === '둘째쪽0_4' && 둘.글 === '7,676건 · 2쪽' && 둘.쪽 === '1 2* 3 › »'));
    await pg.click('#vp-root .vp-쪽넘김 button:nth-child(4)'); await pg.waitForTimeout(600);
    const p3 = 보낸[보낸.length - 1] || {};
    console.log('    ★ 「›」 = 그림 단추 ctl32.x/.y (받은 폼 vs2) ' + 못(p3['ctl00$Contents$Pager1$ctl32.x'] && p3.__VIEWSTATE === 'vs2'));
    /* ④ 멀티검색 */
    const 찾기 = async (말) => { 보낸.length = 0; await pg.fill('#vp-root .vp-q', 말); await pg.click('#vp-root .vp-bar button[type=submit]'); await pg.waitForTimeout(800); };
    const 칸만 = () => 보낸.map((f) => Object.entries(f).filter(([k, v]) => v && v !== '전체' && /\$(tb|ddl)/.test(k) && !/RowCnt/.test(k)).map(([k, v]) => k.split('$').pop() + '=' + v).join('&'));
    await 찾기('홍길동');
    console.log('    ★ 「홍길동」 → 문의자·수취인·주문자·상품명·제목·문의내용 여섯 · 500줄 · 기간 · 조회 단추 ' + 못(JSON.stringify(칸만()) === JSON.stringify(['tbInquirer=홍길동', 'tbRecipient=홍길동', 'tbOrderer=홍길동', 'tbSGoodsNm=홍길동', 'tbTitle=홍길동', 'tbContent=홍길동'])
      && 보낸.every((f) => f['ctl00$Contents$ddlRowCnt'] === '500' && f['ctl00$Contents$dcStartDt'] === '2026-09-27' && f['ctl00$Contents$btnSearch.x'] && f.__VIEWSTATE === 'vs1')) + ' ' + JSON.stringify(칸만()));
    const 합 = await pg.evaluate(() => ({ 줄: document.querySelectorAll('#vp-root .vp-table tbody tr').length, 글: document.querySelector('#vp-root .vp-note').textContent, 쪽: document.querySelectorAll('#vp-root .vp-쪽넘김 button').length }));
    console.log('    ★ 여섯 응답 합침(같은 inquiryCd 한 번) · 쪽 넘김 없음 ' + 못(합.줄 === 2 && 합.글 === '2건' && 합.쪽 === 0));
    await 찾기('교환 처리중');
    console.log('    ★ 「교환 처리중」 → 문의유형·처리결과 고르는 칸, 쪽 넘김 있음 ' + 못(JSON.stringify(칸만()) === JSON.stringify(['ddlInqType=3&ddlCallEndGb=1'])
      && 보낸[0]['ctl00$Contents$ddlRowCnt'] === '27') + ' ' + JSON.stringify(칸만()));
    await 찾기('');
    console.log('    ★ 빈 검색 = 앞 검색 칸 비우고 조회(남은 값 없음) ' + 못(JSON.stringify(칸만()) === JSON.stringify([''])));
    await 찾기('010-1234-5671');
    const 폰 = await pg.evaluate(() => document.querySelectorAll('#vp-root .vp-table tbody tr').length);
    console.log('    ★ 전화 → 받은 줄(숨은 수취인휴대폰 칸)에서 거름 ' + 못(보낸.length === 1 && JSON.stringify(칸만()) === JSON.stringify(['']) && 폰 === 1));
    await 찾기('');
    /* ⑤ 줄 누름 = 판 */
    await pg.click('#vp-root .vp-table tbody tr:nth-child(1) td:nth-child(3)'); await pg.waitForTimeout(300);
    const 판 = await pg.evaluate(() => { const d = document.querySelector('#vp-root .vp-상담덮개 .vp-상담판'); if (!d) return null; const r = d.getBoundingClientRect();
      return { 머리: d.querySelector('.vp-상담머리 strong').textContent, 문의: d.querySelector('.vp-문의글').textContent, 답: d.querySelector('.vp-답변글').textContent,
        dt: [...d.querySelectorAll('.vp-고객목록 dt')].map((x) => x.textContent), 안: r.left >= 0 && r.right <= innerWidth + 1 }; });
    console.log('    ★ 줄 누름 → 판: 제목·문의내용 전문·답변·숨은 칸(수취인·주소) ' + 못(판 && 판.머리 === '조회0_11' && 판.문의 === '조회 문의 첫줄\n둘째줄 0' && 판.답 === '조회0_14' && 판.dt.includes('수취인') && 판.dt.includes('주소') && 판.안));
    await pg.screenshot({ path: path.join(그림칸, '상담내용보기-판-' + 너비 + '.png') });
    await pg.keyboard.press('Escape');
    console.log('    ★ Esc 로 닫힘 ' + 못(!(await pg.$('#vp-root .vp-상담덮개'))));
    console.log('    ★ 쓰기 단추(등록·삭제·엑셀)를 한 번도 안 보냄 · csDetl 안 부름 ' + 못(!보낸.some((f) => Object.keys(f).some((k) => /btn(Insert|Delete|Excel|Save)/.test(k))) && !부름.some((x) => /csDetl/i.test(x))));
    console.log('    ★ 쪽 오류 ' + 탈.length + ' ' + 못(탈.length === 0) + (탈.length ? ' ' + 탈.join(' | ') : ''));
    await ctx.close();
  }
  await b.close();
  console.log('\n★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  process.exit(빨강 ? 1 : 0);
})();
