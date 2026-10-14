/* 배송관리 거르개 알약을 재는 자.
   사장님 10-14 (배송관리 화면에서 짚어 보내신 말씀, 그대로):
   「벤더피아 배송관리의 실제 필터들을 확인하여 필터를 버튼형식으로 페이지상단에 보여주세요」
   ⚠ 진짜 vendorpia.com 은 이 상자에서 못 닿는다. 벤더피아 폼 꼴을 세우고 조회 응답을 흉내 낸다.
   ⚠ 자료는 전부 **가짜**다 — 진짜 수취인·전화·주소는 한 글자도 안 쓴다. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

/* 벤더피아 진짜 폼에 있는 고르는 칸 열하나 (search.js 의 SELECTS 그대로) + 글칸 + 기간 */
const 고르는칸 = {
  ddlDStatus:       ['전체', '배송준비', '배송중', '배송완료', '취소'],
  ddlCSType:        ['전체', '교환', '반품'],
  ddlStoreGb:       ['전체', '직영', '위탁'],
  ddlDeliveryCo:    ['전체', '가택배', '나택배', '다택배'],
  ddlMall:          ['전체', '가몰', '나몰'],
  ddlStore:         ['전체', '가매출처', '나매출처', '다매출처'],
  ddlLoc:           ['전체', '본사', '지점'],
  ddl_RecallGb:     ['전체', '회수', '미회수'],
  ddlStockType:     ['전체', '재고', '주문'],
  ddlInvoiceSendYn: ['전체', '전송', '미전송'],
  ddlSupplier:      ['전체', '가매입처', '나매입처'],
};
const 글칸 = ['tbInvoiceNo','tbSOrderNo','tbGoodsCd','tbRecipient','tbOrderer','tbAddr0','tbSGoodsNm'];
const COLUMNS = ['주문번호','상품명','수취인','휴대전화','주소','배송사','송장번호','상태'];

/* 벤더피아 원래 화면 흉내 — search.js 가 보는 못(form·#btnSearch·#dcStartDt·#dcEndDt)을 그대로 둔다 */
const 원래화면 = `<html><head><meta charset="utf-8"><title>배송목록조회</title></head><body>
<form name="aspnetForm" method="post" action="/System/Delivery/firmDvList.aspx" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="/wEPDw">
<input name="dcStartDt" id="dcStartDt" value="2026-07-14"><input name="dcEndDt" id="dcEndDt" value="2026-10-14">
${Object.entries(고르는칸).map(([id, vs]) =>
  `<select name="${id}" id="${id}">${vs.map((t,i)=>`<option value="${i===0?'':'V'+i}">${t}</option>`).join('')}</select>`).join('\n')}
${글칸.map(id=>`<input name="${id}" id="${id}">`).join('')}
<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option><option value="600">600</option></select>
<input type="image" name="btnSearch" id="btnSearch" src="s.gif">
<div id="divGrid"></div>
</form></body></html>`;

/* 조회 응답 흉내 — 고른 값에 따라 건수를 줄인다 (가짜 줄) */
function 결과(보낸값) {
  const 상태 = 보낸값.ddlDStatus || '', 택배 = 보낸값.ddlDeliveryCo || '';
  let n = 60;
  if (상태) n = 7;                 // 배송상태를 고르면 7건으로 줄어든다
  if (택배) n = Math.min(n, 4);    // 배송사까지 고르면 4건
  const 줄 = (i) => [`20261014-${100000+i}`, `가나다라 서랍장 ${i}`, '가나다', '010-0000-0000',
                     '경기도 ○○시 ○○구 ○○로 123', '○○택배', String(640000000000+i), '배송완료'];
  return `<html><body><span>총 ${n} 건</span><table>
<tr>${COLUMNS.map(c=>`<th>${c}</th>`).join('')}</tr>
${Array.from({length:n},(_,i)=>`<tr>${줄(i).map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}
</table></body></html>`;
}

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const 보낸것들 = [];
  await ctx.route('**://vendorpia.com/**', async (r) => {
    const u = new URL(r.request().url());
    if (r.request().method() === 'POST') {
      const 몸 = r.request().postData() || '';
      const 값 = {};
      for (const id of Object.keys(고르는칸)) {
        const m = 몸.match(new RegExp('name="' + id + '"\\r?\\n\\r?\\n([^\\r\\n]*)'));
        if (m && m[1]) 값[id] = m[1];
      }
      보낸것들.push(값);
      return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 결과(값) });
    }
    if (u.pathname.endsWith('.js'))  return r.fulfill({ status:200, contentType:'text/javascript',
      body: fs.readFileSync(path.join(확장, path.basename(u.pathname))) });
    if (u.pathname.endsWith('.css')) return r.fulfill({ status:200, contentType:'text/css',
      body: fs.readFileSync(path.join(확장, path.basename(u.pathname))) });
    return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 원래화면 });
  });
  const page = await ctx.newPage();
  const 탈 = []; page.on('pageerror', e => 탈.push(String(e && e.message).slice(0,150)));
  await page.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx');
  await page.addStyleTag({ content: fs.readFileSync(path.join(확장,'login.css'),'utf8')
                                 + fs.readFileSync(path.join(확장,'search.css'),'utf8') });
  await page.addScriptTag({ content: fs.readFileSync(path.join(확장,'search.js'),'utf8') });
  await page.waitForTimeout(400);

  const 본것 = await page.evaluate(() => {
    const 줄들 = [...document.querySelectorAll('.vp-pill-row')];
    return { 묶음수: 줄들.length,
      묶음: 줄들.map(r => ({ 이름: r.querySelector('.vp-pill-name').textContent,
        알약: [...r.querySelectorAll('.vp-pill')].map(b => b.textContent),
        켜진것: [...r.querySelectorAll('.vp-pill[aria-pressed="true"]')].map(b => b.textContent) })),
      기간칸: !!document.querySelector('.vp-bar [name=from]') && !!document.querySelector('.vp-bar [name=to]'),
      검색창: !!document.querySelector('.vp-bar .vp-q'),
      조회단추: !!document.querySelector('.vp-bar button[type=submit]') };
  });
  console.log('\n■ 배송관리 거르개 알약');
  console.log('  벤더피아 진짜 폼의 고르는 칸: ' + Object.keys(고르는칸).length + '개');
  console.log('  알약으로 올린 묶음: ' + 본것.묶음수 + '개');
  for (const m of 본것.묶음) console.log('    · ' + m.이름 + ' — ' + m.알약.join(' / ') + '  (켜진 것: ' + m.켜진것.join(',') + ')');
  console.log('  기간 두 칸 ' + 본것.기간칸 + ' · 검색창 ' + 본것.검색창 + ' · 조회 단추 ' + 본것.조회단추);

  const 건수 = async () => (await page.textContent('.vp-note') || '').trim();
  await page.click('.vp-bar button[type=submit]'); await page.waitForTimeout(700);
  console.log('\n  아무것도 안 고른 채 조회 → ' + await 건수());
  보낸것들.length = 0;
  await page.click('.vp-pill-row:nth-child(1) .vp-pill:nth-child(4)');   // 배송상태 → 셋째 값
  await page.waitForTimeout(900);
  console.log('  「배송상태」 알약 하나 누름 → ' + await 건수() + ' · 보낸 값 ' + JSON.stringify(보낸것들[0] || {}));
  보낸것들.length = 0;
  await page.click('.vp-pill-row:nth-child(2) .vp-pill:nth-child(2)');   // 배송사 → 첫 값
  await page.waitForTimeout(900);
  console.log('  「배송사」 까지 누름    → ' + await 건수() + ' · 보낸 값 ' + JSON.stringify(보낸것들[0] || {}));
  const 켜짐 = await page.evaluate(() => [...document.querySelectorAll('.vp-pill[aria-pressed="true"]')].map(b=>b.textContent));
  console.log('  지금 켜진 알약: ' + JSON.stringify(켜짐));
  보낸것들.length = 0;
  await page.click('.vp-pill-row:nth-child(1) .vp-pill:nth-child(1)');   // 배송상태 → 「전부」
  await page.waitForTimeout(900);
  console.log('  「전부」 로 끔        → ' + await 건수() + ' · 보낸 값 ' + JSON.stringify(보낸것들[0] || {}));
  if (탈.length) console.log('  터진 말: ' + JSON.stringify(탈.slice(0,3)));
  if (process.argv[2] === '그림') {
    const 밖 = '/tmp/claude-0/-home-user-vivivic-apps/459edaf4-304e-56e1-9eb8-ad6dc33034a4/scratchpad';
    const r = await page.evaluate(() => { const b = document.querySelector('#vp-root .vp-search').getBoundingClientRect();
      return { x:0, y:0, width: Math.round(b.width + 48), height: 420 }; });
    await page.screenshot({ path: 밖 + '/배송관리-알약.png', clip: r });
    console.log('  그림 → ' + 밖 + '/배송관리-알약.png');
  }
  await b.close();
})();
