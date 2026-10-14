/* 벤더피아 메뉴 화면을 흉내 낸 종이들.
   ⚠ 진짜 vendorpia.com 은 이 상자에서 못 본다 — 꼴만 흉내 낸다.
      goods.js 가 보는 못(document.forms[0] · #btnSearch · #divGrid)은 그대로 둔다. */
const 틀 = (안쪽) => `<html><head><title>벤더피아</title></head>
<frameset rows="60,*" border="0" framespacing="0">
  <frame name="topFrame" src="/top.aspx" scrolling="no">
  <frame name="mainFrame" src="${안쪽}">
</frameset></html>`;

/* ASP.NET WebForms 꼴 — doctype 없는 옛 화면 */
const 몸통 = (제목, 안) => `<html>
<head><meta charset="utf-8"><title>${제목}</title>
<style>body{margin:0;font-family:gulim,sans-serif;font-size:12px}
table.grid{border-collapse:collapse;width:100%}
table.grid td,table.grid th{border:1px solid #ccc;padding:3px 6px}</style>
</head>
<body>
<form name="aspnetForm" method="post" action="" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="/wEPDwUKLTEyMzQ1Njc4OQ==">
<input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="/wEWAwL">
${안}
</form>
</body></html>`;

/* 로그인 뒤 메인 — menu.js 가 「배송관리」 라는 <a> 를 보고 켠다 */
const 메인 = 몸통('벤더피아', `
<div id="menu">
  <a href="/System/Delivery/firmDvList.aspx">배송관리</a>
  <a href="/System/Master/goods.aspx">단품관리</a>
  <a href="/System/Master/salesGoods.aspx">상품관리</a>
  <a href="/System/Stock/StockList.aspx">재고조회</a>
</div>`);

/* 목록 화면 — goods.js 가 보는 못 셋이 다 있다 */
const 목록 = (제목) => 몸통(제목, `
<table><tr>
  <td><input name="dcStartDt" id="dcStartDt" value="2026-07-14"></td>
  <td><input name="dcEndDt" id="dcEndDt" value="2026-10-14"></td>
  <td><select name="ddlSearchType" id="ddlSearchType"><option value="ALL">전체</option></select></td>
  <td><input type="submit" name="btnSearch" value="조회" id="btnSearch"></td>
</tr></table>
<div id="divGrid">
  <table class="grid"><tr><th>단품코드</th><th>단품명</th><th>양품수</th></tr>
  ${Array.from({length:60},(_,i)=>`<tr><td>ING-${String(i+1).padStart(3,'0')}</td><td id="칸${i+1}">가구단품 ${i+1}</td><td>${i}</td></tr>`).join('')}
  </table>
</div>`);

/* 조회 결과(POST) — vp-data.js 가 표를 읽는다. 비어 있어도 짚기 재기는 된다 */
const 빈결과 = 몸통('결과', `<div id="divGrid"><table class="grid"><tr><th>단품코드</th><th>단품명</th><th>배송수량</th><th>양품수</th></tr></table></div><span>총 0 건</span>`);

module.exports = { 틀, 메인, 목록, 빈결과, 몸통 };
