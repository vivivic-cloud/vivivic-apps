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
const EXE = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const 전체머리 = "(체크)·Page·CS·CS주문번호·IMG·주문번호·블랙번호·매출처코드·단품분류·매출처·생산처·몰·계정·주문번호·상품코드·상품명·매출처상품명·단품구성·주문옵션·수량·가용수량·박스수량·판매금액·공급금액·매입처·매입금액·매출이익·마진%·판매단가·공급단가·수취인·선불비·착불비·제품비·전화·핸드폰·알림·상태·우편번호·주소·배송메세지·물류메모·배송메모·본사메모·배송사·배송상태·송장번호·등록일·입고일·지사출발·지사도착·출발일·완료일·실판매가·배송예정일·등록자·옵션상품여부·색강조·수정이력·알림·전화·핸드폰·주문전달·알림·알림·발송여부·발송구분·LastTimeStamp·colorRGB".split("·").map((x) => x === "(체크)" ? "" : x);
const 보일이름 = "CS·IMG·매출처·몰·주문번호·상품코드·주문옵션·수량·가용수량·박스수량·판매금액·수취인·선불비·착불비·알림·주소·배송메세지·물류메모·배송메모·본사메모·배송사·배송상태·송장번호·등록일·입고일·지사출발·지사도착·출발일·완료일·등록자·수정이력".split("·");
const 머리 = ["", ...보일이름];     // 체크 칸은 빼도 된다 — 우리는 뺀다
function 보임찾기(이름들) { const 쓴 = new Set(); return 전체머리.map((h, i) => { if (i === 0) return true; if (이름들.includes(h) && !쓴.has(h)) { 쓴.add(h); return true; } return false; }); }
const 줄수 = 5;
const 가짜 = (r, c) => c === 0 ? '<input type="checkbox">' : (전체머리[c] === 'IMG' ? '<img src="x.gif" width="1" height="1">' : '가짜' + r + '_' + c);
/* 진짜 꼴: #oGrid > 머리 틀(table, 69 th) , 몸 틀(th > div > table > tbody, 줄 69 td). 숨긴 th 는 class 에 생성 이름 + display:none */
function 그리드(보임) {
  const th = 전체머리.map((h, i) => `<th class="igg_HeaderCaption nowrap${보임[i] ? '' : ' ig9a6376x'}"${보임[i] ? ' style="width: 80px;"' : ''}>${h}</th>`).join('');
  const 몸 = Array.from({ length: 줄수 }, (_, r) => `<tr class="${r % 2 ? 'ig_Alt igg_Alt back-Thistle' : 'back-LightGray'}">${전체머리.map((_, c) => `<td class="${보임[c] ? '' : 'ig9a6376x'}">${가짜(r, c)}</td>`).join('')}</tr>`).join('');
  return `<div id="divGrid" class="col-sm-12"><div id="oGrid" class="ig_Control igg_Control"><table class="igg_Header"><tr class="igg_Header">${th}</tr></table><div><table class="igc"><tr><th><div><table><tbody>${몸}</tbody></table></div></th></tr></table></div><table class="pg"><tr><td id="Pager1">1</td><td>2</td></tr></table></div></div>`;
}
const 달력 = '<table id="ctl00__ig_def_dp_cal" class="igmc_Control"><tr>' + ['일','월','화','수','목','금','토'].map((d) => `<th>${d}</th>`).join('') + '</tr>' + Array.from({ length: 8 }, (_, r) => '<tr>' + Array.from({ length: 7 }, (_, c) => `<td>${r * 7 + c + 1}</td>`).join('') + '</tr>').join('') + '</table>';
const 합계글 = '<span id="sum">주문수량: 11,029 / 행수: 10,758건 / 매입금액: 281,897,937원</span>';
const 폼 = `<input type="text" name="ctl00$Contents$dcStartDt" value="2026-09-25"><input type="text" name="ctl00$Contents$dcEndDt" value="2026-10-25"><select name="ctl00$Contents$ddlRowCnt"><option>50</option></select>
<input type="image" name="ctl00$Contents$btnSearch" id="btnSearch" src="s.gif">`;
const 쪽모양 = (내용) => `<html><head><meta charset="utf-8"><style>.ig9a6376x{display:none}</style></head><body id="body"><form name="f" method="post" action="/System/Sales/orderMst.aspx" id="f"><input type="hidden" name="__VIEWSTATE" value="x">
<div>${폼}${달력}${합계글}${내용}</div></form><p id="원래글">주문관리 원래 화면</p></body></html>`;
const 응답 = () => `<html><body>${합계글}${그리드(보임찾기(보일이름))}</body></html>`;
const 기대머리 = 보일이름;
const 기대줄 = Array.from({ length: 줄수 }, (_, r) => 보일이름.map((h) => { const c = 전체머리.findIndex((x, i) => x === h && 보임찾기(보일이름)[i]); return 전체머리[c] === 'IMG' ? '' : '가짜' + r + '_' + c; }));
const VP흉내 = `window.VP저장 = { get: async function(){return {};}, set: async function(){}, remove: async function(){} };`;

const 경우 = [
  { 이름: '진짜 구조(#oGrid 머리·몸 다른 table, 69칸 중 32 보임, 달력 표 함께)', 쪽: () => 쪽모양(그리드(보임찾기(보일이름))), 읽는곳: '쪽' },
  { 이름: '사장님이 칸 설정을 바꿈(보이는 칸이 다름 — 칸 이름을 박지 않았나)', 쪽: () => 쪽모양(그리드(보임찾기(["주문번호", "상품코드", "수취인", "송장번호", "상태", "상품명"]))), 읽는곳: '쪽', 다른칸: ["주문번호", "상품코드", "수취인", "송장번호", "상태", "상품명"] },
  { 이름: '#oGrid 가 늦게(AJAX) 옴', 쪽: () => 쪽모양('<div id="늦게"></div>') + `<script>setTimeout(function(){document.getElementById('늦게').innerHTML=${JSON.stringify(그리드(보임찾기(보일이름)))};},1200)</script>`, 읽는곳: '쪽' },
  { 이름: '#oGrid 못 찾음(달력만) — 빈 표 + 까닭, 배송목록 안 부름', 쪽: () => 쪽모양(''), 읽는곳: '못읽음', 응답글: '<html><body>없음</body></html>' },
];

(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  let 초록 = 0, 빨강 = 0;
  const 못 = (참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };
  console.log('\n■ CS등록 = 주문관리 목록 그대로 (10-24 다시 시작)');
  for (const 너비 of [1280, 375]) for (const 해시 of ['#vgCS', '']) for (const c of 경우) {
    if (해시 === '' && c !== 경우[0]) continue;
    const ctx = await b.newContext({ viewport: { width: 너비, height: 900 } });
    await ctx.route('**://identitytoolkit.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"idToken":"x"}' }));
    await ctx.route('**://firestore.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    const 부름 = [];
    await ctx.route('**://vendorpia.com/**', (r) => {
      const u = new URL(r.request().url()), m = r.request().method();
      부름.push(m + ' ' + u.pathname);
      const 화 = (t) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: t });
      if (/orderMst/.test(u.pathname)) return m === 'POST' ? 화(c.응답글 || 응답()) : 화(c.쪽());
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
        머리: th.map((x) => x.textContent), 줄: t ? [...t.querySelectorAll('tbody tr')].map((tr) => [...tr.cells].map((x) => { const c = x.cloneNode(true); c.querySelectorAll('button').forEach((b) => b.remove()); return c.textContent; })) : [],
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
    console.log('    ★ 배송관리 모습(기간·검색창·거르개·출처·CS판)이 없다 ' + 못(!화면.배송꼴));
    console.log('    ★ 배송목록을 안 불렀다(10-25: 이름 단추·줄 클릭은 되살림 — 이름줄길 시험이 잰다) ' + 못(!부름.some((x) => /firmDvList/i.test(x))));
    if (c.읽는곳 === '못읽음') {
      console.log('    ★ 빈 표 + 까닭 한 줄(#oGrid 없음) · 달력을 목록으로 안 집음 ' + 못(화면.머리.length === 0 && /읽지 못/.test(화면.글) && /#oGrid 없음/.test(화면.까닭) && !화면.머리.includes('월')));
    } else {
      const 내머리 = c.다른칸 || 기대머리, 보인 = 보임찾기(내머리);
      const 내줄 = Array.from({ length: 줄수 }, (_, r) => 내머리.map((h) => { const k = 전체머리.findIndex((x, i) => x === h && 보인[i]); return 전체머리[k] === 'IMG' ? '' : '가짜' + r + '_' + k; }));
      const 내보임 = 전체머리.filter((h, i) => 보인[i] && i !== 0);
      console.log('    ★ 달력(일 월 화 …)을 목록으로 안 집음 ' + 못(!화면.머리.includes('월') && !화면.머리.includes('토')));
      console.log('    ★ 보이는 칸만·같은 차례(숨긴 칸 안 나옴, 체크 칸 뺌) ' + 못(JSON.stringify(화면.머리) === JSON.stringify(내보임)) + ' (' + 화면.머리.length + '칸)');
      console.log('    ★ 줄 수 = 몸줄 수(' + 줄수 + ') · 값 그대로 ' + 못(화면.줄.length === 줄수 && JSON.stringify(화면.줄) === JSON.stringify(내줄.map((_, r) => 내보임.map((h) => { const k = 전체머리.findIndex((x, i) => x === h && 보인[i]); return 전체머리[k] === 'IMG' ? '' : '가짜' + r + '_' + k; })))));
      console.log('    ★ 합계 글 그대로 ' + 못(화면.글 === '주문수량: 11,029 / 행수: 10,758건 / 매입금액: 281,897,937원'));
      console.log('    ★ 자료를 읽은 곳 = 쪽(조회 안 누름) ' + 못(!부름.some((x) => /^POST/.test(x))));
      console.log('    ★ 머리글 전부 한 줄(nowrap) · 쪽 전체는 안 밀림 ' + 못(화면.한줄 && !화면.쪽가로) + ' · 표 통 가로 스크롤 ' + 화면.가로);
    }
    console.log('    ★ 쪽 오류 ' + 탈.length + ' ' + 못(탈.length === 0));
    if (해시 === '#vgCS') await 쪽.screenshot({ path: path.join(그림칸, '주문관리CS-' + (c === 경우[0] ? '진짜구조' : c === 경우[1] ? '칸바뀜' : c === 경우[2] ? '늦게' : '못읽음') + '-' + 너비 + '.png') });
    await ctx.close();
  }
  await b.close();
  console.log('\n★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  process.exit(빨강 ? 1 : 0);
})();
