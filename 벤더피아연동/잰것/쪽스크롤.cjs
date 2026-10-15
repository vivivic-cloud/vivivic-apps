/* ③ **쪽 전체를 내리는 스크롤이 없어졌나**를 재는 자.
   사장님 10-15: 「데이터를 내려보는 스크롤 외에 전체 화면을 내리는 스크롤은 삭제해 주세요」
   (장부 a1792028003 · 짚은 셀렉터 `html.vp-clean > body#body > div#vp-root`)
   보아야 하는 것 — 쪽은 안 움직인다 · 표 안에서는 내려간다 · 머리줄(기간·검색·거르개)이
     늘 보인다 · 마지막 줄까지 닿는다 · 펼친 드롭다운 판이 화면 안에 있다 · 폰에서 안 깨진다.
   ⚠ 진짜 vendorpia.com 은 못 닿는다. 흉내로 세워 잰다. 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PAGES = require('./본보기/PAGES.cjs');
const 머리 = ["주문번호","주문일","상품명","단품명","단품코드","수량","수취인","휴대전화","전화","주소",
  "배송사","송장번호","배송상태","송장전송","매출처","매출처코드","주문자","결제금액","배송비","메모",
  "출고일","도착일","비고"];
const 줄 = Array.from({length:60},(_,i)=>머리.map((c,j)=> j===2
  ? "가나다라 와이드 3단 서랍장 (화이트/오크) 1200x450x700"
  : j===9 ? "경기도 ○○시 ○○구 ○○대로123번길 45-6, ○○아파트 101동 1001호" : c+"-"+i));
const 배송쪽 = `<html><head><meta charset="utf-8"><title>배송목록조회</title></head><body id="body">
<div id="벤더피아제화면">벤더피아 원래 배송관리 화면입니다</div>
<form name="aspnetForm" method="post" action="/System/Delivery/firmDvList.aspx" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-15"><input name="dcEndDt" id="dcEndDt" value="2026-10-15">
<select name="ddlDStatus" id="ddlDStatus"><option value="">전체</option><option value="V1">배송완료</option>
<option value="V2">배송중</option><option value="V3">상품준비중</option></select>
<select name="ddlDeliveryCo" id="ddlDeliveryCo"><option value="">전체</option><option value="V1">가주문</option>
<option value="V2">경동택배(포천)</option></select>
<select name="ddlStore" id="ddlStore"><option value="">전체</option><option value="V1">가매출처</option>
<option value="V2">나매출처</option><option value="V3">다매출처</option></select>
<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select>
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div>
</form></body></html>`;
const VP흉내 = `var VP_DATA = { PAGES: ${JSON.stringify(PAGES)},
  ymd: function (d) { var z=function(n){return String(n).padStart(2,"0");};
    return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate()); },
  list: async function(){ return { cachedAt: null }; }, prefetch: function(){}, clearCache: async function(){} };
window.VP저장 = { get: async function(){return {};}, set: async function(){}, remove: async function(){} };`;

const 잰다 = () => {
  const 쪽 = document.scrollingElement || document.documentElement;
  const 통 = document.querySelector('.vp-table');
  const 띠 = document.querySelector('.vp-bar');
  const 거르개 = document.querySelector('.vp-pills');
  const 안에 = (el) => { if (!el) return null; const r = el.getBoundingClientRect();
    return r.top >= -0.5 && r.bottom <= innerHeight + 0.5; };
  const 쪽움직임 = () => { const 전 = 쪽.scrollTop; window.scrollTo(0, 2000);
    const 후 = 쪽.scrollTop; window.scrollTo(0, 전); return 후; };
  const 첫값 = { 쪽넘침: 쪽.scrollHeight - 쪽.clientHeight, 쪽밀렸나: 쪽움직임() };
  if (!통) return { ...첫값, 표없음: true };
  /* 표를 끝까지 내려 본다 */
  통.scrollTop = 99999;
  const 표민거리 = Math.round(통.scrollTop);
  const 줄들 = 통.querySelectorAll('tbody tr');
  const 마지막줄 = 줄들[줄들.length - 1];
  const mr = 마지막줄 ? 마지막줄.getBoundingClientRect() : null;
  const tr2 = 통.getBoundingClientRect();
  const 것 = {
    ...첫값,
    표통키: Math.round(tr2.height), 표통밑: Math.round(tr2.bottom), 창키: innerHeight,
    표넘침: 통.scrollHeight - 통.clientHeight,
    표민거리,
    줄수: 줄들.length,
    마지막줄보이나: !!mr && mr.top >= tr2.top - 0.5 && mr.bottom <= tr2.bottom + 0.5,
    표내린뒤_검색띠보이나: 안에(띠),
    표내린뒤_거르개보이나: 안에(거르개),
    표통이창안에: tr2.bottom <= innerHeight + 0.5,
  };
  통.scrollTop = 0;
  return 것;
};

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  console.log('\n■ ③ 쪽 전체 스크롤 없애기 — 표 안에서만 내려간다');
  console.log('  ⚠ 자료는 전부 가짜. 줄 ' + 줄.length + '개 · 칸 ' + 머리.length + '개');
  let 초록 = 0, 빨강 = 0;
  const 못 = (참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };
  for (const [w, h] of [[1920,1000],[1280,860],[1280,700],[390,844],[800,600]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    await ctx.route('**://vivivic-cloud.github.io/**', r => r.abort('blockedbyclient'));
    await ctx.route('**://vendorpia.com/**', (r) => {
      if (r.request().method() === 'POST') return r.fulfill({ status:200, contentType:'text/html; charset=utf-8',
        body: `<html><body><span>총 ${줄.length} 건</span><table><tr>${머리.map(x=>`<th>${x}</th>`).join('')}</tr>
          ${줄.map(x=>`<tr>${x.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</table></body></html>` });
      if (new URL(r.request().url()).pathname.endsWith('.js'))
        return r.fulfill({ status:200, contentType:'text/javascript', body:'/* 손잡이 자리 (흉내) */' });
      return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 배송쪽 });
    });
    const page = await ctx.newPage();
    const 탈 = []; page.on('pageerror', e => 탈.push(String(e && e.message).slice(0,120)));
    await page.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx');
    await page.addStyleTag({ content: ['login.css','search.css']
      .map(f => fs.readFileSync(path.join(확장, f), 'utf8')).join('\n') });
    await page.addScriptTag({ content: VP흉내 });
    for (const f of ['login.js','search.js'])
      await page.addScriptTag({ content: fs.readFileSync(path.join(확장, f), 'utf8') });
    await page.waitForTimeout(700);
    await page.click('.vp-bar button[type=submit]').catch(()=>{});
    await page.waitForTimeout(800);

    const 것 = await page.evaluate(잰다);
    const 짜임켜짐 = h >= 640;
    console.log('\n  ' + w + '×' + h + (짜임켜짐 ? '' : '  (창이 640 아래 — 옛대로 쪽이 움직여야 한다)'));
    if (것.표없음) { console.log('    ✗ 표가 안 그려졌다'); 빨강++; await ctx.close(); continue; }
    console.log('    ★ 쪽이 넘치는 양 **' + 것.쪽넘침 + 'px** · 창을 내려 보니 '
      + 것.쪽밀렸나 + 'px 움직였다 ' + 못(짜임켜짐 ? (것.쪽넘침 <= 1 && 것.쪽밀렸나 === 0) : true));
    console.log('    표 통 키 ' + 것.표통키 + 'px · 통 밑 ' + 것.표통밑 + ' / 창 ' + 것.창키
      + ' ' + 못(짜임켜짐 ? 것.표통이창안에 : true));
    console.log('    표 안에서 내려가나 : 넘침 ' + 것.표넘침 + 'px → 민 거리 ' + 것.표민거리 + 'px '
      + 못(것.표넘침 > 0 && 것.표민거리 >= 것.표넘침 - 2));
    console.log('    끝까지 내렸을 때 마지막 줄(' + 것.줄수 + '번째)이 보이나 ' + 것.마지막줄보이나
      + ' ' + 못(것.마지막줄보이나));
    console.log('    그때 검색띠 보이나 ' + 것.표내린뒤_검색띠보이나 + ' · 거르개 보이나 '
      + 것.표내린뒤_거르개보이나 + ' ' + 못(짜임켜짐
        ? (것.표내린뒤_검색띠보이나 && 것.표내린뒤_거르개보이나) : true));

    /* 펼친 드롭다운 판이 화면 안에 들어오나 */
    await page.click('.vp-drop-head').catch(()=>{});
    await page.waitForTimeout(250);
    const 판 = await page.evaluate(() => {
      const l = document.querySelector('.vp-drop-list');
      if (!l) return null;
      const r = l.getBoundingClientRect();
      return { 위: Math.round(r.top), 밑: Math.round(r.bottom), 키: Math.round(r.height),
               안에: r.top >= -0.5 && r.bottom <= innerHeight + 0.5, 창: innerHeight };
    });
    console.log('    펼친 드롭다운 판 ' + (판 ? '키 ' + 판.키 + 'px · ' + 판.위 + '~' + 판.밑
      + ' / 창 ' + 판.창 + ' · 화면 안에 ' + 판.안에 + ' ' + 못(판.안에) : '✗ 안 펼쳐졌다'));
    if (!판) 빨강++;
    if (탈.length) { console.log('    터진 말: ' + JSON.stringify([...new Set(탈)].slice(0,2))); 빨강++; }
    await ctx.close();
  }
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  await b.close();
  process.exit(빨강 ? 1 : 0);
})();
