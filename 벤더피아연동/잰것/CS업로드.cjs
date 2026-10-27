/* **CS 고객문의 올리기**를 재는 자 (10-26 [새 지시 CS업로드]).
   사장님: 「만들어. 시험 등록할 주문은 내가 정해줄게」
   보아야 하는 것 —
     ㄱ) 상담 판 「○○ 접수」/「남기기」 → 우리 창고(`vpcs_note` PATCH)에 남고 **그 뒤** 벤더피아 고객문의(`csDetl.aspx`)에 등록되나
     ㄴ) 원주문 잇기(`btnReflash`)를 먼저 하고, 문의자·제목·문의내용·문의유형이 맞게 실리나
     ㄷ) 두 번 눌러도 **한 번만** 등록되나
     ㄹ) 원주문을 못 이으면 **저장 POST 를 안 보내고** 「등록 실패(…)」 · 우리 저장은 남나
     ㅁ) 벤더피아가 오류 알림을 주면 「등록 실패(그 말)」 인가
     ㅂ) 상태 단추(처리중·끝)로는 벤더피아에 안 가나
     ㅅ) (10-27 [새 지시 원주문잇기]) 원주문 검색 팝업(`ordersPopup.aspx`)으로 몰 주문번호가 **똑같은** 줄을 찾아 그 **안 번호**를
         `hOrderNo` 에 넣나 — 여럿이면 상담 판 줄과 같은 상품, 못 고르면 맨 위. 일부만 맞는 긴 번호는 안 집나
     ㅇ) csDetl 쪽에 늘 박힌 alert(「문의자를 입력해주세요.」)를 실패로 읽지 않나
     ㅈ) (10-27 [새 지시 저장경로]) 사람이 팝업에서 고를 때처럼 `hdStatusCd`(배송상태 **코드**)·`tbUsableQty`(가용수)도 넣나,
         빈 파일 칸(`fileUpload1`, filename="")을 브라우저처럼 보내나, 등록 여부를 **고객문의 목록 조회**로 확인하나
     ㅊ) (10-27 [새 지시 사람길]) GET·잇기·저장이 모두 `csDetl.aspx?previousPage=first` 인가, 잇기 응답 탭이 `hTab=INQUERY` 가
         아니면 저장 안 하나, 제목 = 글 앞 10글자(「[종류]」 없음, 공백·줄바꿈 정리)·문의내용 = 글 전체인가
   ⚠ 진짜 vendorpia.com 은 못 닿는다 — csDetl.aspx·ordersPopup.aspx 를 **흉내**로 세운다(꼴은 10-27 사장님 크롬에서 잰 것). 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PAGES = require('./본보기/PAGES.cjs');

const 머리 = ["CS","CS주문번호","IMG","매출처","주문번호","주문번호","가용수량","상품명","몰","주문자",
  "수취인","휴대전화","주소","배송사","송장번호","배송상태","비고"];
const 줄들 = Array.from({ length: 3 }, (_, i) => 머리.map((c, j) =>
  j === 4 ? "20261015-" + (100 + i) : j === 7 ? "토리블리 2단 와이드 교구장" : c + "-" + i));
const 폼 = `<form name="aspnetForm" method="post" action="/System/Delivery/firmDvList.aspx" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-15"><input name="dcEndDt" id="dcEndDt" value="2026-10-15">
<select name="ddlDStatus" id="ddlDStatus"><option value="">전체</option></select>
<select name="ddlDeliveryCo" id="ddlDeliveryCo"><option value="">전체</option></select>
<select name="ddlStore" id="ddlStore"><option value="">전체</option></select>
<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select>
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div></form>`;
const 배송쪽 = `<html><head><meta charset="utf-8"><title>배송목록조회</title></head><body id="body">${폼}</body></html>`;
const 표 = `<html><body><span>총 ${줄들.length} 건</span>
<table><tr>${머리.map(h=>`<th>${h}</th>`).join('')}</tr>
${줄들.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</table></body></html>`;

/* csDetl.aspx 흉내 — 칸 이름은 조사(517d7fa)에서 잰 그대로(`ctl00$Contents$` + id) */
const C = (id) => 'ctl00$Contents$' + id;
const 문의쪽 = (o = {}) => `<html><head><meta charset="utf-8"><title>CS</title></head><body>
<form name="aspnetForm" method="post" action="./csDetl.aspx?previousPage=first" id="aspnetForm" enctype="multipart/form-data">
<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="VS${o.판 || 1}">
<input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="EV${o.판 || 1}">
<input type="hidden" name="ctl00$hdKey" value="K">
<input type="image" name="${C('btnOrderSearch')}" id="btnOrderSearch" src="a.gif">
<input type="image" name="${C('btnSaveInsert')}" id="btnSaveInsert" src="s.gif">
<input name="${C('tbStoreNm')}" id="tbStoreNm" value="${o.매출처 || ''}">
<input name="${C('tbSOrderNo')}" id="tbSOrderNo" value="${o.주문 || ''}">
<input name="${C('tbSGoodsNm')}" id="tbSGoodsNm" value="${o.상품 || ''}">
<input name="${C('tbOrderer')}" id="tbOrderer" value="${o.주문자 || ''}">
<input type="file" name="${C('fileUpload1')}" id="fileUpload1">
<input name="${C('tbInquirer')}" id="tbInquirer" value="${o.문의자 || ''}">
<input type="checkbox" name="${C('cbReplyYn')}" id="cbReplyYn">
<select name="${C('ddlInqType')}" id="ddlInqType">${['배송','취소','교환','반품','AS','지정','변경','환불'].map((t,i)=>`<option value="I${i}">${t}</option>`).join('')}</select>
<select name="${C('ddlCallEndGb')}" id="ddlCallEndGb">${['처리중','처리완료','부재','확인요청'].map((t,i)=>`<option value="E${i}">${t}</option>`).join('')}</select>
<input name="${C('tbTitle')}" id="tbTitle" value="">
<textarea name="${C('tbContent')}" id="tbContent"></textarea>
<input type="hidden" name="${C('hOrderNo')}" id="hOrderNo" value="${o.숨은 || ''}">
<input type="hidden" name="${C('hdeliveryNo')}" id="hdeliveryNo" value="${o.배송 || ''}">
<input type="hidden" name="${C('hdStatusCd')}" id="hdStatusCd" value="${o.상태 || ''}">
<input type="hidden" name="${C('hTab')}" id="hTab" value="${o.탭 || 'CS'}">
<input name="${C('tbUsableQty')}" id="tbUsableQty" value="${o.가용 || ''}">
<input type="submit" name="${C('btnReflash')}" id="btnReflash" value="">
</form><script>function 검사(){ alert('문의자를 입력해주세요.'); alert('문의내용을 입력해주세요.'); }</script></body></html>`;
/* ordersPopup.aspx 흉내 (10-27 잼): 폼 urlencoded, 칸 `tb_SOrderNo`(일부만 맞아도 걸림), 그림 단추 `btnSearch`,
   #oGrid 머리 「주문번호(안 번호)…주문번호(몰)…상품코드·상품명」, 몸줄 data-rowkey=[안번호] */
const 팝업자료 = [
  { 안: '7770001', 몰: '20261015-1012', 코드: 'G1', 상품: '토리블리 2단 와이드 교구장' },   // 일부만 맞음 — 집으면 안 됨
  { 안: '1230002', 몰: '20261015-101', 코드: 'G7', 상품: '다른 침대 프레임' },             // 맨 위지만 다른 상품
  { 안: '1230001', 몰: '20261015-101', 코드: 'G1', 상품: '토리블리 2단 와이드 교구장', 상태: '배송완료', 가용: '2' },   // ← 같은 상품
  { 안: '1240009', 몰: '20261015-100', 코드: 'G8', 상품: '맨 위 상품' },                   // 같은 상품 없음 → 맨 위
  { 안: '1240008', 몰: '20261015-100', 코드: 'G9', 상품: '둘째 상품' },
];
const 안번호주문 = Object.fromEntries(팝업자료.map(x => [x.안, x.몰]));
const 팝업머리 = ['주문번호','CS','매출처','몰','','주문번호','배송사','배송상태','상품코드','상품명','가용수','주문자'];
/* 배송상태 칸 고르개 — 진짜 팝업은 글자(배송완료)를 보이고 값은 코드(4). 10-27 잰 목록 그대로 */
const 상태글 = `<script>Sys.Application.add_init(function() { $create(Infragistics.Web.UI.WebDropDown, {"id":"oGrid_ddlStatus"},[{'0':[[,,,,,"배송지시","1",1,,1,]],'1':[[,,,,,"배송준비중","2",0,,0,]],'2':[[,,,,,"물류입고","5",0,,0,]],'3':[[,,,,,"배송출발","3",0,,0,]],'4':[[,,,,,"배송완료","4",0,,0,]],'5':[[,,,,,"지사출발","6",0,,0,]],'6':[[,,,,,"지사도착","7",0,,0,]]}],[]]}, null, null, $get("oGrid_ddlStatus")); });
Sys.Application.add_init(function() { $create(Infragistics.Web.UI.WebDropDown, {"id":"oGrid_ddlDelivery"},[{'0':[[,,,,,"택배","9",1,,1,]]}], null, null, $get("oGrid_ddlDelivery")); });</script>`;
const 팝업쪽 = (찾는것) => `<html><body><form name="aspnetForm" method="post" action="./ordersPopup.aspx" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="PV"><input type="hidden" name="ctl00$hdKey" value="K">
<select name="${C('ddlStore')}" id="ddlStore"><option value="전체">전체</option></select>
<input name="${C('tb_SOrderNo')}" id="tb_SOrderNo" value="${찾는것 || ''}">
<input name="${C('dcStartDt')}" id="dcStartDt" value="2025-10-28"><input name="${C('dcEndDt')}" id="dcEndDt" value="2026-10-27">
<input type="image" name="${C('btnSearch')}" id="btnSearch" src="s.gif">
<div id="oGrid"><table><tr>${팝업머리.map(h => `<th>${h}</th>`).join('')}</tr></table>
<table>${찾는것 ? 팝업자료.filter(x => x.몰.includes(찾는것)).map(x => `<tr data-rowkey="[${x.안}]">${
  [x.안, '', '가매출처', '몰', '', x.몰, '택배', x.상태 || '', x.코드, x.상품, x.가용 || '1', '김가짜'].map(v => `<td>${v}</td>`).join('')}</tr>`).join('') : ''}</table></div>
</form>${상태글}</body></html>`;
/* inquiryList.aspx 흉내 — 등록 확인용 조회(문의내용 칸 `tbContent` 일부만 맞아도 걸림) */
const 목록쪽 = (줄 = []) => `<html><body><form name="aspnetForm" method="post" action="./inquiryList.aspx" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="LV"><input name="${C('dcStartDt')}" id="dcStartDt" value="2026-09-27">
<input name="${C('tbContent')}" id="tbContent" value=""><input type="image" name="${C('btnSearch')}" id="btnSearch" src="s.gif">
<div id="oGrid"><table><tr><th>문의자</th><th>제목</th><th>문의내용</th></tr></table><table>${줄.map(r => `<tr><td>${r.문의자}</td><td>${r.제목}</td><td>${r.내용}</td></tr>`).join('')}</table></div></form></body></html>`;
/* multipart 몸 → {이름: 값} */
const 풀기 = (몸) => { const o = {}; for (const m of String(몸 || '').matchAll(/name="([^"]+)"(?:; filename="[^"]*")?\r\n(?:Content-Type:[^\r]*\r\n)?\r\n([\s\S]*?)\r\n--/g)) o[m[1]] = m[2]; return o; };

const VP흉내 = `var VP_DATA = { PAGES: ${JSON.stringify(PAGES)},
  ymd: function (d) { var z=function(n){return String(n).padStart(2,"0");};
    return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate()); },
  list: async function(){ return { cachedAt: null }; }, prefetch: function(){}, clearCache: async function(){} };
window.VP저장 = { get: async function(){return {};}, set: async function(){}, remove: async function(){} };`;

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  console.log('\n■ CS 고객문의 올리기 (흉내 csDetl.aspx — 진짜 벤더피아 아님)');
  let 초록 = 0, 빨강 = 0;
  const 못 = (참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };

  /* 경우: 줄 차례(2=…-101 이을 수 있음, 3=…-102 못 이음) · 저장 답 */
  async function 해보기(이름, { 줄 = 2, 저장답 = 'ok', 탭안바뀜 = false, 할일 }) {
    const 일 = { 패치: 0, 잇기: [], 저장: [], 가져옴: 0, 벤더쓰기: [], 찾기: [], 목록: [], 확인: 0, 문의주소: [] };
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.route('**://vivivic-cloud.github.io/**', r => r.abort('blockedbyclient'));
    await ctx.route('**://identitytoolkit.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"idToken":"ascii-fake"}' }));
    await ctx.route('**://firestore.googleapis.com/**', (r) => {
      if (r.request().method() === 'PATCH') { 일.패치++; return r.fulfill({ status: 200, contentType: 'application/json', body: r.request().postData() }); }
      if (/vpcs_note\/[^/]+$/.test(new URL(r.request().url()).pathname)) return r.fulfill({ status: 404, body: '{}' });
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await ctx.route('**://vendorpia.com/**', async (r) => {
      const u = new URL(r.request().url()), 셈 = r.request().method();
      if (/ordersPopup\.aspx$/i.test(u.pathname)) {
        if (셈 === 'GET') return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 팝업쪽('') });
        const f = Object.fromEntries(new URLSearchParams(r.request().postData() || ''));
        일.찾기.push(f);
        if (!((C('btnSearch') + '.x') in f)) 일.벤더쓰기.push('POST ordersPopup 모르는 단추');
        return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 팝업쪽(f[C('tb_SOrderNo')]) });
      }
      if (/inquiryList\.aspx$/i.test(u.pathname)) {
        if (셈 === 'GET') return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 목록쪽() });
        const f = Object.fromEntries(new URLSearchParams(r.request().postData() || ''));
        일.확인++;
        if (!((C('btnSearch') + '.x') in f)) 일.벤더쓰기.push('POST inquiryList 모르는 단추');
        const 찾 = f[C('tbContent')] || '';
        return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 목록쪽(일.목록.filter(x => x.내용.includes(찾))) });
      }
      if (/csDetl\.aspx$/i.test(u.pathname)) {
        일.문의주소.push(셈 + ' ' + u.search);
        if (셈 === 'GET') { 일.가져옴++; return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 문의쪽() }); }
        const f = 풀기(r.request().postData());
        if (C('btnReflash') in f) {
          일.잇기.push(f);
          const 안 = f[C('hOrderNo')], 몰 = 안번호주문[안];
          return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 문의쪽(몰
            ? { 판: 2, 탭: 탭안바뀜 ? 'CS' : 'INQUERY', 주문: `${몰} / ${안} / ${안}`, 숨은: 안, 주문자: '김가짜', 문의자: '김가짜', 상품: '토리블리 2단 와이드 교구장', 매출처: '가매출처', 배송: 'D9',
                상태: f[C('hdStatusCd')], 가용: f[C('tbUsableQty')] }
            : { 판: 2, 주문: '' }) });
        }
        if ((C('btnSaveInsert') + '.x') in f) {
          일.저장.push(f);
          await new Promise(z => setTimeout(z, 300));
          /* 빈 파일 칸이 없으면 옛 ASP.NET 코드(`fileUpload1.PostedFile.…`)가 터지는 꼴 — 브라우저는 늘 보낸다 */
          if (저장답 === '500' || !(C('fileUpload1') in f))
            return r.fulfill({ status: 500, contentType: 'text/html; charset=utf-8',
              body: `<html><head><title>개체 참조가 개체의 인스턴스로 설정되지 않았습니다.</title></head><body><h2><i>개체 참조가 개체의 인스턴스로 설정되지 않았습니다.</i></h2></body></html>` });
          if (저장답 !== 'err') 일.목록.push({ 문의자: f[C('tbInquirer')], 제목: f[C('tbTitle')], 내용: String(f[C('tbContent')]).replace(/\r\n/g, '\n') });
          const 몸 = 저장답 === 'ok'
            ? `<html><body><script>alert('저장되었습니다.'); location.href='inquiryList.aspx';</script>${문의쪽({ 판: 3 })}</body></html>`
            : 저장답 === 'quiet' ? 문의쪽({ 판: 3 })
            : `<html><body><script>alert('오류가 발생했습니다.');</script>${문의쪽({ 판: 3 })}</body></html>`;
          return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 몸 });
        }
        일.벤더쓰기.push('POST csDetl 모르는 단추');
        return r.fulfill({ status: 200, body: '' });
      }
      if (셈 !== 'GET' && 셈 !== 'POST') 일.벤더쓰기.push(셈 + ' ' + u.pathname);
      if (셈 === 'POST') return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 표 });
      if (u.pathname.endsWith('.js')) return r.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
      return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 배송쪽 });
    });
    const page = await ctx.newPage();
    page.on('dialog', d => d.dismiss());
    await page.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx');
    await page.addScriptTag({ content:
      'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};'
      + 'document.cookie="VP_Cookie=LOGON_EMP_NO%3D7%26x%3Dy";' });
    await page.addStyleTag({ content: ['login.css','search.css'].map(f => fs.readFileSync(path.join(확장, f), 'utf8')).join('\n') });
    await page.addScriptTag({ content: VP흉내 });
    for (const f of ['login.js','search.js']) await page.addScriptTag({ content: fs.readFileSync(path.join(확장, f), 'utf8') });
    await page.waitForTimeout(500);
    await page.click('.vp-bar button[type=submit]');
    await page.waitForTimeout(1200);
    await page.click(`tbody tr:nth-child(${줄}) .vp-상담알`);
    await page.waitForTimeout(600);
    await 할일(page);
    await page.waitForTimeout(1500);
    const 알림 = await page.textContent('.vp-상담알림');
    await ctx.close();
    console.log('\n  ◆ ' + 이름 + ' — 알림 「' + 알림 + '」 · 창고PATCH ' + 일.패치 + ' · csDetl GET ' + 일.가져옴
      + ' · 원주문검색 ' + 일.찾기.length + ' · 잇기 ' + 일.잇기.length + ' · 저장 ' + 일.저장.length + ' · 목록확인 ' + 일.확인);
    return { 일, 알림 };
  }
  const 쓰고접수 = (글, 종류) => async (page) => {
    await page.fill('.vp-상담적기 textarea', 글);
    if (종류) await page.click(`.vp-상담종류[data-k="${종류}"]`);
    await page.click('.vp-상담적기 button[type=submit]');
  };

  /* A — 잘 됨 */
  let { 일, 알림 } = await 해보기('A 교환 접수(이을 수 있는 주문)', { 할일: 쓰고접수('문짝 흠. 교환 원하심\n다음 주 수요일 재배송', '교환') });
  console.log('    ★ 우리 창고에 남았나 ' + 못(일.패치 === 1));
  console.log('    ★ 알림 「벤더피아 등록됨」 ' + 못(/남겼습니다 · 벤더피아 등록됨/.test(알림)));
  console.log('    원주문 검색 = 몰 주문번호로 조회(그림 단추) ' + 못(일.찾기.length === 1 && 일.찾기[0][C('tb_SOrderNo')] === '20261015-101'));
  console.log('    ★ 원주문 잇기 — hOrderNo = 같은 상품 줄의 안 번호 1230001(맨 위 1230002·일부만 맞는 7770001 아님) ' + 못(일.잇기.length === 1
    && 일.잇기[0][C('hOrderNo')] === '1230001'));
  console.log('    ★ 잇기에 팝업이 넣는 세 칸 — 배송상태 「배송완료」→코드 4 · 가용수 2 ' + 못(일.잇기[0] && 일.잇기[0][C('hdStatusCd')] === '4'
    && 일.잇기[0][C('tbUsableQty')] === '2'));
  const s = 일.저장[0] || {};
  console.log('    저장 한 번 · 이어진 숨은 칸·새 VIEWSTATE 를 그대로 실음 ' + 못(일.저장.length === 1
    && s[C('hOrderNo')] === '1230001' && s[C('hdeliveryNo')] === 'D9' && s.__VIEWSTATE === 'VS2'));
  console.log('    문의자 「' + s[C('tbInquirer')] + '」 = 주문자 ' + 못(s[C('tbInquirer')] === '김가짜'));
  console.log('    ★ 제목 「' + s[C('tbTitle')] + '」 = 글 앞 10글자(「[교환]」 없음) ' + 못(s[C('tbTitle')] === '문짝 흠. 교환 원'));
  console.log('    ★ GET·잇기·저장 모두 csDetl.aspx?previousPage=first ' + 못(일.문의주소.length === 3
    && 일.문의주소.every(x => x.endsWith(' ?previousPage=first')) && 일.문의주소[0].startsWith('GET')));
  console.log('    문의내용 = 쓴 글 그대로 ' + 못(String(s[C('tbContent')]).replace(/\r\n/g, '\n') === '문짝 흠. 교환 원하심\n다음 주 수요일 재배송'));   // 폼은 줄바꿈을 \r\n 으로 보낸다(브라우저 규칙)
  console.log('    문의유형 = 교환(I2) ' + 못(s[C('ddlInqType')] === 'I2'));
  console.log('    ★ 빈 파일 칸은 브라우저처럼 실음 · 잇기 단추는 안 실음 ' + 못(!(C('btnReflash') in s) && s[C('fileUpload1')] === ''));
  console.log('    저장에도 상태 코드·가용수가 그대로 ' + 못(s[C('hdStatusCd')] === '4' && s[C('tbUsableQty')] === '2'));
  console.log('    ★ 저장 뒤 고객문의 목록 조회로 확인(조회만) ' + 못(일.확인 === 1));
  console.log('    다른 쓰기 없음 ' + 못(!일.벤더쓰기.length));

  /* B — 두 번 누름 */
  ({ 일, 알림 } = await 해보기('B 남기기 두 번 빠르게', { 할일: async (page) => {
    await page.fill('.vp-상담적기 textarea', '배송 언제 오나요 문의');
    await page.click('.vp-상담적기 button[type=submit]');
    await page.evaluate(() => document.querySelector('.vp-상담적기').requestSubmit());
    await page.waitForTimeout(100);
    await page.evaluate(() => document.querySelector('.vp-상담적기').requestSubmit());
  } }));
  console.log('    ★ 등록 한 번뿐 · 창고 한 번뿐 ' + 못(일.저장.length === 1 && 일.패치 === 1));
  console.log('    종류 없으면 문의유형은 기본값(I0) · 제목 = 앞 10글자 끝 공백 정리 ' + 못(일.저장[0] && 일.저장[0][C('ddlInqType')] === 'I0'
    && 일.저장[0][C('tbTitle')] === '배송 언제 오나요'));

  /* C — 원주문 검색에 없음 */
  ({ 일, 알림 } = await 해보기('C 원주문 검색에 없는 주문', { 줄: 3, 할일: 쓰고접수('반품 원함', '반품') }));
  console.log('    기본 기간에 없으면 넓혀 한 번 더 찾음 ' + 못(일.찾기.length === 2 && 일.찾기[1][C('dcStartDt')] === '2000-01-01'));
  console.log('    ★ 잇기·저장 POST 안 보냄 ' + 못(일.잇기.length === 0 && 일.저장.length === 0));
  console.log('    ★ 「등록 실패(① 원주문을 못 찾음 …)」 · 우리 저장은 남음 ' + 못(/벤더피아 등록 실패\(① 원주문을 못 찾음/.test(알림) && 일.패치 === 1));

  /* F — 같은 상품 없음 → 맨 위 줄 */
  ({ 일, 알림 } = await 해보기('F 같은 상품 줄이 없는 주문', { 줄: 1, 할일: 쓰고접수('배송 문의') }));
  console.log('    ★ 맨 위 줄 안 번호 1240009 로 이음 · 등록됨 ' + 못(일.잇기[0] && 일.잇기[0][C('hOrderNo')] === '1240009'
    && 일.저장.length === 1 && /벤더피아 등록됨/.test(알림)));

  /* D — 벤더피아 오류 알림 */
  ({ 일, 알림 } = await 해보기('D 벤더피아가 오류', { 저장답: 'err', 할일: 쓰고접수('AS 요청', 'AS') }));
  console.log('    ★ 「등록 실패(③ 벤더피아가 저장 안 함 — 오류가 발생했습니다.)」 ' + 못(/벤더피아 등록 실패\(③ 벤더피아가 저장 안 함 — 오류가 발생했습니다\.\)/.test(알림) && 일.패치 === 1));

  /* G — 응답에 아무 표시 없어도 목록에 있으면 등록됨 */
  ({ 일, 알림 } = await 해보기('G 저장 응답에 알림 없음(목록엔 들어감)', { 저장답: 'quiet', 할일: 쓰고접수('배송 날짜 바꿔 달라심', '교환') }));
  console.log('    ★ 목록 확인으로 「벤더피아 등록됨」 ' + 못(/벤더피아 등록됨/.test(알림) && 일.확인 === 1));

  /* H — 벤더피아 서버 오류(HTTP 500) */
  ({ 일, 알림 } = await 해보기('H 벤더피아 서버 오류 500', { 저장답: '500', 할일: 쓰고접수('반품 접수', '반품') }));
  console.log('    ★ 「등록 실패(③ 벤더피아가 저장 안 함 — 저장 HTTP 500 · 그 오류 글)」 ' + 못(/등록 실패\(③ 벤더피아가 저장 안 함 — 저장 HTTP 500 · 개체 참조가/.test(알림)));

  /* I — 잇기 응답이 고객문의 탭으로 안 바뀜 → 저장 안 함 */
  ({ 일, 알림 } = await 해보기('I 잇기 뒤 탭이 고객문의 아님', { 탭안바뀜: true, 할일: 쓰고접수('교환 문의', '교환') }));
  console.log('    ★ 저장 POST 안 보냄 · 「등록 실패(② 잇기 뒤 고객문의 칸이 안 열림…)」 ' + 못(일.잇기.length === 1 && 일.저장.length === 0
    && /등록 실패\(② 잇기 뒤 고객문의 칸이 안 열림/.test(알림)));

  /* J — 앞뒤 공백·줄바꿈 정리 */
  ({ 일, 알림 } = await 해보기('J 공백·줄바꿈 섞인 글', { 할일: 쓰고접수('  AS\n\n  다리 흔들림 고정 요청', 'AS') }));
  console.log('    ★ 제목 「' + (일.저장[0] || {})[C('tbTitle')] + '」 = 「AS 다리 흔들림 」 앞 10글자 정리 ' + 못(일.저장[0]
    && 일.저장[0][C('tbTitle')] === 'AS 다리 흔들림'));

  /* E — 상태 단추는 벤더피아로 안 감 */
  ({ 일, 알림 } = await 해보기('E 접수 뒤 상태 「처리중」', { 할일: async (page) => {
    await 쓰고접수('교환 접수함', '교환')(page);
    await page.waitForTimeout(1500);
    await page.click('.vp-상담상태 button:nth-child(2)');
  } }));
  console.log('    ★ 상태 단추는 창고만(PATCH 2) · 벤더피아 등록은 처음 한 번뿐 ' + 못(일.패치 === 2 && 일.저장.length === 1 && 일.가져옴 === 1));

  await b.close();
  console.log('\n★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  process.exit(빨강 ? 1 : 0);
})();
