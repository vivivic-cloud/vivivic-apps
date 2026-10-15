/* 배송관리 거르개가 **제목별 드롭다운 셋**인지 재는 자.
   사장님 10-15 (배송관리를 짚으시고, 그대로):
   「지금 형태의 필터링 버튼을 나열하기 보다 각 필터링제목 즉 배송상태 배송사 매출처 별
     드롭다운 해당 선택 하게 해줘 , 송장전송 필터링은 없어도 됨」
   ⚠ 진짜 vendorpia.com 은 못 닿는다. 폼 꼴과 조회 응답을 흉내 낸다. 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const 고르는칸 = {
  ddlDStatus:       ['전체', '배송준비', '배송중', '배송완료', '취소'],
  ddlCSType:        ['전체', '교환', '반품'],
  ddlStoreGb:       ['전체', '직영', '위탁'],
  ddlDeliveryCo:    ['전체', '가주문', '경동택배(포천)', '밀크런', '성진물류'],
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
const 원래화면 = `<html><head><meta charset="utf-8"><title>배송목록조회</title></head><body>
<form name="aspnetForm" method="post" action="/System/Delivery/firmDvList.aspx" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="/wEPDw">
<input name="dcStartDt" id="dcStartDt" value="2026-07-15"><input name="dcEndDt" id="dcEndDt" value="2026-10-15">
${Object.entries(고르는칸).map(([id, vs]) =>
  `<select name="${id}" id="${id}">${vs.map((t,i)=>`<option value="${i===0?'':'V'+i}">${t}</option>`).join('')}</select>`).join('\n')}
${글칸.map(id=>`<input name="${id}" id="${id}">`).join('')}
<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option><option value="600">600</option></select>
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div>
</form></body></html>`;
function 결과(값) {
  let n = 60;
  if (값.ddlDStatus) n = 7;
  if (값.ddlDeliveryCo) n = Math.min(n, 4);
  if (값.ddlStore) n = Math.min(n, 2);
  const 줄 = (i) => [`20261015-${100000+i}`, `가나다 서랍장 ${i}`, '가나다', '010-0000-0000',
                     '경기도 ○○시 ○○구 ○○로 123', '○○택배', String(640000000000+i), '배송완료'];
  return `<html><body><span>총 ${n} 건</span><table>
<tr>${COLUMNS.map(c=>`<th>${c}</th>`).join('')}</tr>
${Array.from({length:n},(_,i)=>`<tr>${줄(i).map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}
</table></body></html>`;
}
(async () => {
  const 옛 = !!process.env.SEARCH;                     // 옛 글(알약)로 재는 중인가
  const b = await chromium.launch({ executablePath: EXE });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });   // 폰 크기
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
    return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 원래화면 });
  });
  const page = await ctx.newPage();
  const 탈 = []; page.on('pageerror', e => 탈.push(String(e && e.message).slice(0,140)));
  await page.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx');
  await page.addStyleTag({ content: fs.readFileSync(path.join(확장,'login.css'),'utf8')
                                  + fs.readFileSync(process.env.SEARCHCSS || path.join(확장,'search.css'),'utf8') });
  await page.addScriptTag({ content: fs.readFileSync(process.env.SEARCH || path.join(확장,'search.js'),'utf8') });
  await page.waitForTimeout(400);

  console.log('\n■ 배송관리 거르개 — ' + (옛 ? '**고치기 전(알약 나열)**' : '**고친 뒤(드롭다운)**') + ' · 폰 390×844');
  if (옛) {
    const v = await page.evaluate(() => [...document.querySelectorAll('#vp-root .vp-pill-row')]
      .map(r => ({ 이름: r.querySelector('.vp-pill-name').textContent,
                   알약수: r.querySelectorAll('.vp-pill').length })));
    console.log('  알약 줄 ' + v.length + '개: ' + v.map(x => x.이름 + '(' + x.알약수 + ')').join(' · '));
  } else {
    const v = await page.evaluate(() => [...document.querySelectorAll('#vp-root .vp-drop')]
      .map(d => ({ 이름: d.querySelector('.vp-drop-name').textContent,
                   보이는값: d.querySelector('.vp-drop-value').textContent,
                   머리높이: Math.round(d.querySelector('.vp-drop-head').getBoundingClientRect().height) })));
    console.log('  드롭다운 ' + v.length + '개: ' + v.map(x => x.이름 + '「' + x.보이는값 + '」 ' + x.머리높이 + 'px').join(' · '));
    /* 갈래마다 몇 개를 담았나 — 펼쳐서 센다 */
    for (let i = 0; i < v.length; i++) {
      /* ⚠ 누르면 화면을 다시 그린다 — 헌 노드를 붙잡지 말고 **다시 찾는다** */
      await page.evaluate((n) => {
        document.querySelectorAll('#vp-root .vp-drop')[n].querySelector('.vp-drop-head').click();
      }, i);
      await page.waitForTimeout(150);
      const 담 = await page.evaluate((n) => {
        const d = document.querySelectorAll('#vp-root .vp-drop')[n];
        const 판 = d.querySelector('.vp-drop-list');
        if (!판) return { 이름: d.querySelector('.vp-drop-name').textContent, 개수: 0, 글: [], 맨앞: null, 화면안: null, 줄높이: 0, 안펼쳐짐: true };
        const r = 판.getBoundingClientRect();
        const 것 = [...판.querySelectorAll('.vp-drop-item')];
        return { 이름: d.querySelector('.vp-drop-name').textContent, 개수: 것.length,
                 글: 것.map(x => x.textContent), 맨앞: 것[0] && 것[0].textContent,
                 화면안: r.left >= -0.5 && r.right <= innerWidth + 0.5,
                 줄높이: 것[0] ? Math.round(것[0].getBoundingClientRect().height) : 0 };
      }, i);
      console.log('    · ' + 담.이름 + ' — ' + 담.개수 + '개 ' + JSON.stringify(담.글)
        + ' | 맨 앞 「' + 담.맨앞 + '」 | 화면 안 ' + 담.화면안 + ' | 줄 ' + 담.줄높이 + 'px');
      await page.keyboard.press('Escape'); await page.waitForTimeout(120);
    }
    const 송장 = await page.evaluate(() => [...document.querySelectorAll('#vp-root .vp-drop-name')]
      .some(x => x.textContent.includes('송장')));
    console.log('  ★ 송장전송 거르개가 있나: ' + 송장 + '  (false 여야 맞다)');
  }

  /* ── 거르는 셈이 전과 같은가 — 같은 고름으로 **벤더피아에 보낸 값**을 견준다 ── */
  const 고르기 = async (이름, 글) => {
    if (옛) await page.evaluate(([n, t]) => {
      const 줄 = [...document.querySelectorAll('#vp-root .vp-pill-row')]
        .find(r => r.querySelector('.vp-pill-name').textContent === n);
      const b = [...줄.querySelectorAll('.vp-pill')].find(x => x.textContent === t); b && b.click();
    }, [이름, 글]);
    else {
      /* ⚠ 머리를 누르면 화면을 다시 그린다 — 두 번에 나눠, 다시 찾아서 누른다 */
      await page.evaluate((n) => {
        const d = [...document.querySelectorAll('#vp-root .vp-drop')]
          .find(x => x.querySelector('.vp-drop-name').textContent === n);
        d.querySelector('.vp-drop-head').click();
      }, 이름);
      await page.waitForTimeout(150);
      const 눌렀나 = await page.evaluate(([n, t]) => {
        const d = [...document.querySelectorAll('#vp-root .vp-drop')]
          .find(x => x.querySelector('.vp-drop-name').textContent === n);
        const b = [...d.querySelectorAll('.vp-drop-item')].find(x => x.textContent === t);
        if (!b) return false; b.click(); return true;
      }, [이름, 글]);
      if (!눌렀나) console.log('    ✗ 「' + 글 + '」 을 못 찾았다');
    }
    await page.waitForTimeout(800);
  };
  await page.click('.vp-bar button[type=submit]'); await page.waitForTimeout(700);
  const 건수 = async () => (await page.textContent('.vp-note') || '').trim();
  console.log('\n  아무것도 안 고르고 조회 → ' + await 건수());
  보낸것들.length = 0;
  await 고르기('배송상태', '배송완료');
  console.log('  배송상태「배송완료」 → ' + await 건수() + ' · 보낸 값 ' + JSON.stringify(보낸것들[0] || {}));
  보낸것들.length = 0;
  await 고르기('배송사', '경동택배(포천)');
  console.log('  + 배송사「경동택배(포천)」 → ' + await 건수() + ' · 보낸 값 ' + JSON.stringify(보낸것들[0] || {}));
  보낸것들.length = 0;
  await 고르기('매출처', '나매출처');
  console.log('  + 매출처「나매출처」 → ' + await 건수() + ' · 보낸 값 ' + JSON.stringify(보낸것들[0] || {}));
  보낸것들.length = 0;
  await 고르기('배송상태', '전부');
  console.log('  배송상태를 「전부」 로 끔 → ' + await 건수() + ' · 보낸 값 ' + JSON.stringify(보낸것들[0] || {}));
  if (탈.length) console.log('\n  터진 말: ' + JSON.stringify([...new Set(탈)].slice(0,2)));
  await b.close();
})();
