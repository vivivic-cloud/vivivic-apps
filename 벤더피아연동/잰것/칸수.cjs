/* 우리 표가 **벤더피아가 준 칸을 다 그리는지** 재는 자.
   사장님 10-15: 「불러온 데이터 가로스크롤로 실제 벤더피아의 모든 정보를 동일하게 볼 수 있게해줘」
   ⚠ 진짜 vendorpia.com 은 못 닿는다 — **벤더피아가 줄 법한 넓은 머리줄**을 흉내로 준다.
     진짜 칸 수는 사장님 화면에서만 알 수 있다. 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
/* 벤더피아 배송목록조회가 내주는 머리줄을 **넓게** 흉내 낸다 (우리가 그리던 여덟 + 더) */
const 진짜머리 = ['선택','번호','주문일','주문번호','매출처명','상품명','옵션','수량','단가','금액',
  '수취인','휴대전화','전화번호','우편번호','주소','배송메시지','배송사','송장번호','발송일','상태',
  '단품코드','매입처명','비고'];
const 우리가그리던여덟 = ['주문번호','상품명','수취인','휴대전화','주소','배송사','송장번호','상태'];
const 줄 = (i) => 진짜머리.map((h) => h === '선택' ? '' : h + '-' + (i + 1));
const 고르는칸 = { ddlDStatus:['전체','배송완료'], ddlDeliveryCo:['전체','가주문'], ddlStore:['전체','가매출처'],
  ddlCSType:['전체'], ddlStoreGb:['전체'], ddlMall:['전체'], ddlLoc:['전체'], ddl_RecallGb:['전체'],
  ddlStockType:['전체'], ddlInvoiceSendYn:['전체'], ddlSupplier:['전체'] };
const 글칸 = ['tbInvoiceNo','tbSOrderNo','tbGoodsCd','tbRecipient','tbOrderer','tbAddr0','tbSGoodsNm'];
const 원래 = `<html><head><meta charset="utf-8"><title>배송목록조회</title></head><body>
<form name="aspnetForm" method="post" action="/System/Delivery/firmDvList.aspx" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-15"><input name="dcEndDt" id="dcEndDt" value="2026-10-15">
${Object.entries(고르는칸).map(([id,vs])=>`<select name="${id}" id="${id}">${vs.map((t,i)=>`<option value="${i===0?'':'V'+i}">${t}</option>`).join('')}</select>`).join('')}
${글칸.map(id=>`<input name="${id}" id="${id}">`).join('')}
<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select>
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div>
</form></body></html>`;
const 결과 = (n) => `<html><body><span>총 ${n} 건</span><table>
<tr>${진짜머리.map(h=>`<th>${h}</th>`).join('')}</tr>
${Array.from({length:n},(_,i)=>`<tr>${줄(i).map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}
</table></body></html>`;

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route('**://vendorpia.com/**', (r) => {
    if (r.request().method() === 'POST')
      return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 결과(12) });
    return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 원래 });
  });
  const page = await ctx.newPage();
  const 탈 = []; page.on('pageerror', e => 탈.push(String(e && e.message).slice(0,140)));
  await page.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx');
  await page.addStyleTag({ content: fs.readFileSync(path.join(확장,'login.css'),'utf8')
                                  + fs.readFileSync(process.env.SEARCHCSS || path.join(확장,'search.css'),'utf8') });
  await page.addScriptTag({ content: fs.readFileSync(process.env.SEARCH || path.join(확장,'search.js'),'utf8') });
  await page.waitForTimeout(400);
  await page.click('.vp-bar button[type=submit]');
  await page.waitForTimeout(900);

  const v = await page.evaluate(() => {
    const t = document.querySelector('#vp-root .vp-table table');
    if (!t) return { 없다: true };
    const 머리 = [...t.querySelectorAll('thead th')].map(x => x.textContent);
    const 첫줄 = [...t.querySelectorAll('tbody tr')[0].children].map(x => x.textContent);
    const 통 = document.querySelector('#vp-root .vp-table');
    const th0 = t.querySelector('thead th');
    return { 우리칸: 머리.length, 머리, 첫줄칸: 첫줄.length,
      밀수있나: 통.scrollWidth > 통.clientWidth + 1, 밀수있는양: 통.scrollWidth - 통.clientWidth,
      /* ⚠ 머리줄은 10-14 부터 **세로로** sticky 다. 여기서 보려는 것은 **가로로 밀어도 붙어 있나** 이다 */
      첫칸왼쪽고정: getComputedStyle(th0).position === 'sticky' && getComputedStyle(th0).left === '0px',
      줄수: t.querySelectorAll('tbody tr').length };
  });
  console.log('\n■ 배송관리 칸 수 ' + (process.env.SEARCH ? '— **고치기 전**' : '— **고친 뒤**') + ' · 폰 390×844');
  console.log('  벤더피아가 준 칸(흉내) : **' + 진짜머리.length + '개**');
  console.log('  우리 화면이 그린 칸    : **' + v.우리칸 + '개** (줄 칸도 ' + v.첫줄칸 + '개)');
  const 빠진 = 진짜머리.filter(h => !v.머리.includes(h));
  console.log('  ★ 빠진 칸 ' + 빠진.length + '개: ' + (빠진.length ? JSON.stringify(빠진) : '없음'));
  console.log('  그린 차례 : ' + JSON.stringify(v.머리));
  console.log('  벤더피아와 **차례까지 같나** : ' + (JSON.stringify(v.머리) === JSON.stringify(진짜머리)));
  console.log('  가로로 밀리나 : ' + (v.밀수있나 ? '예(' + v.밀수있는양 + 'px)' : '아니오')
            + ' · 줄 ' + v.줄수 + '개');
  /* 끝까지 밀면 마지막 칸이 보이나 */
  const 끝 = await page.evaluate(() => { const 통=document.querySelector('#vp-root .vp-table');
    const ths=[...통.querySelectorAll('thead th')];
    const 민전 = Math.round(ths[0].getBoundingClientRect().left);
    통.scrollLeft = 통.scrollWidth; const r=통.getBoundingClientRect();
    const e=ths[ths.length-1].getBoundingClientRect();
    const 민후 = Math.round(ths[0].getBoundingClientRect().left);
    return { 마지막: ths[ths.length-1].textContent, 보이나: e.left>=r.left-0.5 && e.right<=r.right+0.5,
             첫칸_민전: 민전, 첫칸_민후: 민후, 첫칸이따라오나: Math.abs(민전-민후) < 2 }; });
  console.log('  끝까지 밀면 마지막 칸 「' + 끝.마지막 + '」 : ' + (끝.보이나 ? '보인다 ✓' : '안 보인다 ✗'));
  console.log('  ★ 첫 칸이 **가로로 밀어도 붙어 있나** : ' + 끝.첫칸이따라오나
            + ' (민 전 x=' + 끝.첫칸_민전 + ' → 민 뒤 x=' + 끝.첫칸_민후 + ')');
  const 안내 = await page.textContent('#vp-root .vp-note');
  console.log('  건수 안내 줄 : ' + (안내 || '').trim());
  if (탈.length) console.log('  터진 말: ' + JSON.stringify([...new Set(탈)].slice(0,2)));
  await b.close();
})();
