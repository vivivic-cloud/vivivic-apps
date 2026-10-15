/* ⑤ **CS 거르개**를 재는 자.
   사장님 10-15: 「cs버튼을 추가하여 해당 필터 선택시 cs열값에 값이 있는 목록만 보이게
   해주세요」 (장부 a1792028103 · 짚으신 셀렉터 `div.vp-pills.vg-mark`)
   보아야 하는 것 — CS 갈래가 **드롭다운 꼴로 하나 더** 서나 · 고르면 CS 가 **빈 줄이 사라지나** ·
     건수가 맞나 · **벤더피아로 CS 값을 안 보내나** · CS 칸이 없는 화면엔 **안 서나** ·
     앞선 거르개 셋과 **함께** 걸리나.
   ⚠ 진짜 vendorpia.com 은 못 닿는다. 흉내로 세워 잰다. 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PAGES = require('./본보기/PAGES.cjs');

/* ⚠ `fetchList`(search.js 69줄) 는 머리줄을 **「수취인」** 칸으로 찾는다. 그 칸이 없으면
     아무 줄도 안 읽는다 — 10-15 재서 잡았다(0줄이 나왔다). 가짜 머리줄에도 꼭 둔다.
   ⚠ 수취인 값은 **가짜 이름**만 쓴다. 진짜 수취인·전화·주소는 한 글자도 쓰지 않는다. */
const CS자리 = 7;
const 머리있음 = ["주문번호","상품명","수취인","수량","배송사","송장번호","배송상태","CS구분","매출처","비고"];
const 머리없음 = 머리있음.filter((_, i) => i !== CS자리);
const CS값 = (i) => (i % 7 === 0 || i % 11 === 0) ? "교환요청" : "";
const 줄있음 = Array.from({length:60},(_,i)=>["20261015-"+i,"가나다 서랍장 "+i,"가나다",String(1+i%3),
  i%2 ? "가주문" : "경동택배(포천)", String(640000+i), i%3 ? "배송완료" : "배송중",
  CS값(i), i%2 ? "나매출처" : "가매출처", "메모"+i]);
const CS있는줄수 = 줄있음.filter((_,i)=>CS값(i)).length;
const 줄없음 = 줄있음.map((r)=>r.filter((_, i) => i !== CS자리));

const 배송쪽 = `<html><head><meta charset="utf-8"><title>배송목록조회</title></head><body id="body">
<form name="aspnetForm" method="post" action="/System/Delivery/firmDvList.aspx" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-15"><input name="dcEndDt" id="dcEndDt" value="2026-10-15">
<select name="ddlDStatus" id="ddlDStatus"><option value="">전체</option><option value="V1">배송완료</option>
<option value="V2">배송중</option></select>
<select name="ddlCSType" id="ddlCSType"><option value="">전체</option><option value="C1">교환요청</option>
<option value="C2">반품요청</option></select>
<select name="ddlDeliveryCo" id="ddlDeliveryCo"><option value="">전체</option><option value="V1">가주문</option>
<option value="V2">경동택배(포천)</option></select>
<select name="ddlStore" id="ddlStore"><option value="">전체</option><option value="V1">가매출처</option>
<option value="V2">나매출처</option></select>
<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select>
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div>
</form></body></html>`;
const VP흉내 = `var VP_DATA = { PAGES: ${JSON.stringify(PAGES)},
  ymd: function (d) { var z=function(n){return String(n).padStart(2,"0");};
    return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate()); },
  list: async function(){ return { cachedAt: null }; }, prefetch: function(){}, clearCache: async function(){} };
window.VP저장 = { get: async function(){return {};}, set: async function(){}, remove: async function(){} };`;

/* ⚠ `fetchList` 는 `new FormData(form)` 을 그대로 보내므로 POST 알맹이가 **multipart** 다.
     그래서 「이름=값」 꼴로 찾으면 못 찾는다 — 10-15 재서 잡았다.
     multipart 는 `name="칸이름"` 다음 빈 줄 뒤에 값이 온다. 그 꼴로 꺼낸다. */
const 보낸값 = (몸, 이름) => {
  const m = String(몸 || '').match(new RegExp('name="' + 이름 + '"\\r?\\n\\r?\\n([^\\r\\n]*)'));
  return m ? m[1] : null;
};

const 본다 = () => {
  const 갈래들 = [...document.querySelectorAll('.vp-drop')].map((d) => ({
    이름: d.querySelector('.vp-drop-name')?.textContent,
    값: d.querySelector('.vp-drop-value')?.textContent,
    켜짐: d.classList.contains('vp-drop-on'),
  }));
  const 통 = document.querySelector('.vp-table');
  const 머리 = [...(통?.querySelectorAll('thead th') || [])].map((th) => th.textContent);
  const cs자리 = 머리.findIndex((h) => /cs/i.test(h.replace(/\s/g, '')));
  const 줄들 = [...(통?.querySelectorAll('tbody tr') || [])];
  return {
    갈래들, 갈래수: 갈래들.length, 머리, cs자리,
    줄수: 줄들.length,
    CS빈줄수: cs자리 < 0 ? null
      : 줄들.filter((tr) => !(tr.children[cs자리]?.textContent || '').trim()).length,
    안내: document.querySelector('.vp-note')?.textContent,
  };
};

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  console.log('\n■ ⑤ CS 거르개 — 「CS 있는 것만」');
  console.log('  ⚠ 자료는 전부 가짜. 줄 ' + 줄있음.length + '개 가운데 CS 에 값이 있는 것 **'
    + CS있는줄수 + '개**');
  let 초록 = 0, 빨강 = 0;
  const 못 = (참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };

  for (const cs칸있나 of [true, false]) {
    const 머리 = cs칸있나 ? 머리있음 : 머리없음;
    const 줄 = cs칸있나 ? 줄있음 : 줄없음;
    const 보낸것 = [];
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.route('**://vivivic-cloud.github.io/**', r => r.abort('blockedbyclient'));
    await ctx.route('**://vendorpia.com/**', (r) => {
      const req = r.request();
      if (req.method() === 'POST') {
        보낸것.push(req.postData() || '');
        return r.fulfill({ status:200, contentType:'text/html; charset=utf-8',
          body: `<html><body><span>총 ${줄.length} 건</span><table><tr>${머리.map(x=>`<th>${x}</th>`).join('')}</tr>
            ${줄.map(x=>`<tr>${x.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</table></body></html>` });
      }
      if (new URL(req.url()).pathname.endsWith('.js'))
        return r.fulfill({ status:200, contentType:'text/javascript', body:'/* 손잡이 자리 (흉내) */' });
      return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 배송쪽 });
    });
    const page = await ctx.newPage();
    const 탈 = []; page.on('pageerror', e => 탈.push(String(e && e.message).slice(0,140)));
    await page.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx');
    await page.addStyleTag({ content: ['login.css','search.css']
      .map(f => fs.readFileSync(path.join(확장, f), 'utf8')).join('\n') });
    await page.addScriptTag({ content: VP흉내 });
    for (const f of ['login.js','search.js'])
      await page.addScriptTag({ content: fs.readFileSync(path.join(확장, f), 'utf8') });
    await page.waitForTimeout(700);

    console.log('\n  ' + (cs칸있나 ? '① 머리줄에 「CS구분」 이 있는 화면' : '② CS 칸이 **없는** 화면'));
    const 조회전 = await page.evaluate(본다);
    console.log('    조회 전 갈래 ' + 조회전.갈래수 + '개 ' + JSON.stringify(조회전.갈래들.map(x=>x.이름))
      + ' ' + 못(조회전.갈래수 === 3));

    await page.click('.vp-bar button[type=submit]'); await page.waitForTimeout(900);
    const 조회후 = await page.evaluate(본다);
    console.log('    조회 뒤 갈래 ' + 조회후.갈래수 + '개 ' + JSON.stringify(조회후.갈래들.map(x=>x.이름))
      + ' ' + 못(조회후.갈래수 === (cs칸있나 ? 4 : 3)));
    console.log('    머리줄 ' + 조회후.머리.length + '칸 · CS 칸 자리 ' + 조회후.cs자리
      + ' ' + 못(조회후.cs자리 === (cs칸있나 ? CS자리 : -1)));
    console.log('    줄 ' + 조회후.줄수 + '개 · 안내 「' + 조회후.안내 + '」 ' + 못(조회후.줄수 === 줄.length));

    if (!cs칸있나) {
      console.log('    ★ CS 갈래가 **안 섰나** ' + 못(!조회후.갈래들.some(x => x.이름 === 'CS'))
        + ' (가짜 단추를 만들지 않는다)');
      if (탈.length) { console.log('    터진 말: ' + JSON.stringify([...new Set(탈)].slice(0,2))); 빨강++; }
      await ctx.close(); continue;
    }

    /* CS 갈래를 펼쳐 「CS 있는 것만」 을 고른다 */
    const cs머리 = page.locator('.vp-drop', { has: page.locator('.vp-drop-name', { hasText: /^CS$/ }) })
      .locator('.vp-drop-head');
    await cs머리.click(); await page.waitForTimeout(250);
    const 보기 = await page.evaluate(() =>
      [...document.querySelectorAll('.vp-drop-list .vp-drop-item')].map((b) => b.textContent));
    console.log('    펼친 보기 ' + JSON.stringify(보기) + ' '
      + 못(보기.length === 2 && 보기[0] === '전부' && 보기[1] === 'CS 있는 것만'));
    const 전에보낸수 = 보낸것.length;
    await page.getByRole('button', { name: 'CS 있는 것만' }).click();
    await page.waitForTimeout(900);
    const 거른뒤 = await page.evaluate(본다);
    console.log('    ★ 고른 뒤 줄 **' + 거른뒤.줄수 + '개** (CS 있는 것은 ' + CS있는줄수 + '개) '
      + 못(거른뒤.줄수 === CS있는줄수));
    console.log('    ★ 그 가운데 CS 가 빈 줄 **' + 거른뒤.CS빈줄수 + '개** ' + 못(거른뒤.CS빈줄수 === 0));
    console.log('    안내 「' + 거른뒤.안내 + '」 ' + 못(String(거른뒤.안내).startsWith(CS있는줄수 + '건')));
    console.log('    CS 갈래가 켜져 보이나 '
      + JSON.stringify(거른뒤.갈래들.find(x=>x.이름==='CS')) + ' '
      + 못(!!거른뒤.갈래들.find(x=>x.이름==='CS' && x.켜짐 && x.값==='CS 있는 것만')));
    const 새로보낸 = 보낸것.slice(전에보낸수).join('\n');
    const 끝몸 = 보낸것[보낸것.length-1] || '';
    console.log('    ★ 벤더피아로 보낸 것에 `__cs` 가 들었나 ' + /__cs/.test(새로보낸) + ' '
      + 못(!/__cs/.test(새로보낸)) + ' · `ddlCSType` 으로 보낸 값 '
      + JSON.stringify(보낸값(끝몸, 'ddlCSType')) + ' ' + 못(!보낸값(끝몸, 'ddlCSType')));

    /* 앞선 거르개와 **함께** 걸리나 — 배송상태 「배송중」 + CS 있는 것만 */
    const 상태머리 = page.locator('.vp-drop', { has: page.locator('.vp-drop-name', { hasText: '배송상태' }) })
      .locator('.vp-drop-head');
    await 상태머리.click(); await page.waitForTimeout(200);
    await page.getByRole('button', { name: '배송중', exact: true }).click();
    await page.waitForTimeout(900);
    const 둘 = await page.evaluate(본다);
    const 보낸끝 = 보낸것[보낸것.length-1] || '';
    console.log('    둘 함께 — 줄 ' + 둘.줄수 + '개 · CS 빈 줄 ' + 둘.CS빈줄수 + ' '
      + 못(둘.CS빈줄수 === 0) + ' · ddlDStatus 로 보낸 값 '
      + JSON.stringify(보낸값(보낸끝, 'ddlDStatus')) + ' ' + 못(보낸값(보낸끝, 'ddlDStatus') === 'V2')
      + ' · ddlCSType 으로 보낸 값 ' + JSON.stringify(보낸값(보낸끝, 'ddlCSType'))
      + ' ' + 못(!보낸값(보낸끝, 'ddlCSType')));
    if (탈.length) { console.log('    터진 말: ' + JSON.stringify([...new Set(탈)].slice(0,2))); 빨강++; }
    await ctx.close();
  }
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  await b.close();
  process.exit(빨강 ? 1 : 0);
})();
