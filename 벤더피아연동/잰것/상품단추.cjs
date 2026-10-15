/* ④ **배송관리 표의 상품명 칸이 상품관리의 그 상품버튼이 되었나**를 재는 자.
   사장님 10-15: 「이곳에 도착하는 상품명을 상품관리와 동일한 상품버튼으로 변경해 주세요.
   이버튼으로 나타나는 동작은 상품관리의 상품버튼과 동일 합니다.」
   ⚠ 이 자는 **깃허브 주소까지 흉내로 세운다** — `search.js` 가 **제 주소**에서 형제
     `goods.js`·`goods.css` 를 찾기 때문이다. 그래서 글을 `addScriptTag({url})` 로 넣는다.
   ⚠ 진짜 vendorpia.com 은 못 닿는다. 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const 깃 = 'https://vivivic-cloud.github.io/vivivic-apps/%EB%B2%A4%EB%8D%94%ED%94%BC%EC%95%84%EC%97%B0%EB%8F%99/';

/* ── 상품관리에 있는 상품 셋 ───────────────────────────── */
const 상품머리 = ["상품명","상품코드","매출처명","매입처명","배송사명","판매상태","단품명","단품코드",
  "모델번호","매출처상품명","옵션상품유무","등록일"];
const 상품들 = [
  ["비스켓 800 주방수납장","KLS-800","가매출처","가매입처","경동택배(포천)","판매중",
   "비스켓 800 몸통 + 비스켓 800 문","bis800_b + bis800_d","M-800","비스켓800","N","2026-01-05"],
  ["비스켓 1200 주방수납장","KLS-1200","나매출처","가매입처","가주문","판매중",
   "비스켓 1200 몸통","bis1200_b","M-1200","비스켓1200","N","2026-02-11"],
  /* 같은 이름이 매출처만 달라 두 줄 — 상품관리에서 한 단추로 묶인다 */
  ["비스켓 800 주방수납장","KLS-800B","나매출처","나매입처","가주문","판매중",
   "비스켓 800 몸통","bis800_b","M-800","비스켓800","N","2026-03-02"],
];
/* ── 배송관리 줄 ── 셋은 상품관리에 있고, 둘은 **없다** ── */
const 배송머리 = ["주문번호","상품명","수취인","수량","배송사","송장번호","배송상태","CS구분","매출처","비고"];
const 배송줄 = [
  ["20261015-1","비스켓 800 주방수납장","가나다","1","경동택배(포천)","640001","배송완료","","가매출처",""],
  ["20261015-2","비스켓 1200 주방수납장","가나다","2","가주문","640002","배송중","교환요청","나매출처",""],
  ["20261015-3","비스켓 800 주방수납장","가나다","1","가주문","640003","배송완료","","나매출처",""],
  ["20261015-4","이름이 상품관리에 없는 물건","가나다","1","가주문","640004","배송완료","","가매출처",""],
  ["20261015-5","또 없는 물건 999","가나다","3","가주문","640005","배송중","","나매출처",""],
];
const 있는줄 = 3, 없는줄 = 2;

const 표 = (머리, 줄, 총) => `<html><body><span>총 ${총 == null ? 줄.length : 총} 건</span>
<table><tr>${머리.map(h=>`<th>${h}</th>`).join('')}</tr>
${줄.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</table></body></html>`;
const 빈표 = '<html><body><span>총 0 건</span><table><tr><th>없음</th></tr></table></body></html>';

const 폼 = (액션, 칸들) => `<form name="aspnetForm" method="post" action="${액션}" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-15"><input name="dcEndDt" id="dcEndDt" value="2026-10-15">
${칸들}
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div></form>`;

const 배송쪽 = `<html><head><meta charset="utf-8"><title>배송목록조회</title></head><body id="body">
<div id="벤더피아제화면">벤더피아 원래 배송관리 화면입니다</div>
${폼('/System/Delivery/firmDvList.aspx', `
<select name="ddlDStatus" id="ddlDStatus"><option value="">전체</option><option value="V1">배송완료</option>
<option value="V2">배송중</option></select>
<select name="ddlCSType" id="ddlCSType"><option value="">전체</option><option value="C1">교환요청</option></select>
<select name="ddlDeliveryCo" id="ddlDeliveryCo"><option value="">전체</option><option value="V1">가주문</option>
<option value="V2">경동택배(포천)</option></select>
<select name="ddlStore" id="ddlStore"><option value="">전체</option><option value="V1">가매출처</option>
<option value="V2">나매출처</option></select>
<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select>`)}
</body></html>`;
const 상품쪽 = `<html><head><meta charset="utf-8"><title>상품관리</title></head><body id="body">
${폼('/System/Master/salesGoods.aspx', `
<select name="ddlStatus" id="ddlStatus"><option value="전체">전체</option><option value="판매중" selected>판매중</option></select>
<select name="ddlStore" id="ddlStore"><option value="전체">전체</option></select>
<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select>
<input name="tbSGoodsCd" id="tbSGoodsCd"><input name="tbGoodsNm" id="tbGoodsNm">
<input type="checkbox" name="cbOptionGoodsYn" id="cbOptionGoodsYn">`)}
</body></html>`;

const 본다 = () => {
  const 통 = document.querySelector('.vp-table');
  const 머리 = [...(통?.querySelectorAll('thead th') || [])].map(th => th.textContent);
  const 자리 = 머리.indexOf('상품명');
  const 칸들 = [...(통?.querySelectorAll('tbody tr') || [])].map((tr) => {
    const td = tr.children[자리];
    const b = td?.querySelector('button');
    return { 글: (td?.textContent || '').trim(), 단추인가: !!b,
             코드작은글씨: b ? [...b.querySelectorAll('small.vp-code')].map(s=>s.textContent) : null };
  });
  const 곁 = document.querySelector('#vp-root > .vp-곁다리');
  const 보임 = (el) => { if (!el) return false; const r = el.getBoundingClientRect();
    return r.width > 2 && r.height > 2 && getComputedStyle(el).display !== 'none'; };
  const 쪽 = document.scrollingElement || document.documentElement;
  return {
    머리칸수: 머리.length, 상품칸자리: 자리, 칸들,
    단추수: 칸들.filter(x=>x.단추인가).length,
    글자그대로수: 칸들.filter(x=>!x.단추인가 && x.글).length,
    곁다리붙었나: !!곁,
    곁다리몸통보이나: 보임(곁?.querySelector('.vp-filters')) || 보임(곁?.querySelector('.vp-goods-list')),
    상품목록몇개: window.VP상품목록몇개 ? window.VP상품목록몇개() : null,
    거르개들: [...document.querySelectorAll('.vp-drop .vp-drop-name')].map(x=>x.textContent),
    쪽넘침: 쪽.scrollHeight - 쪽.clientHeight,
    표통밑: 통 ? Math.round(통.getBoundingClientRect().bottom) : null, 창키: innerHeight,
  };
};
const 판본다 = () => {
  const p = document.querySelector('#vp-root > .vp-곁다리 .vp-goods-panel');
  if (!p) return null;
  return { 떴나: !p.hidden, 제목: p.querySelector('strong')?.textContent,
    줄수: p.querySelectorAll('dl').length,
    inghome링크: !!p.querySelector('.vp-ing-link'),
    매출처알약: [...p.querySelectorAll('.vp-store-pill')].map(b=>b.textContent),
    검은단추수: document.querySelectorAll('#vp-root .vp-상품칸 button.on').length };
};

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  /* 깃허브 흉내 — 우리 글을 제 주소로 내어 준다 */
  await ctx.route('**://vivivic-cloud.github.io/**', (r) => {
    const 이름 = decodeURIComponent(new URL(r.request().url()).pathname.split('/').pop());
    const 자리 = path.join(확장, 이름);
    if (!fs.existsSync(자리)) return r.fulfill({ status: 404, body: 'x' });
    const css = 이름.endsWith('.css');
    return r.fulfill({ status: 200, contentType: css ? 'text/css' : 'text/javascript',
      body: fs.readFileSync(자리, 'utf8') });
  });
  const 보낸길 = [];
  await ctx.route('**://vendorpia.com/**', (r) => {
    const u = new URL(r.request().url());
    const 길 = u.pathname;
    if (r.request().method() === 'POST') {
      보낸길.push(길);
      if (길.includes('salesGoods')) return r.fulfill({ status:200,
        contentType:'text/html; charset=utf-8', body: 표(상품머리, 상품들) });
      if (길.includes('firmDvList')) return r.fulfill({ status:200,
        contentType:'text/html; charset=utf-8', body: 표(배송머리, 배송줄) });
      return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 빈표 });
    }
    if (길.endsWith('.js')) return r.fulfill({ status:200, contentType:'text/javascript', body:'/* 손잡이 (흉내) */' });
    if (길.includes('salesGoods')) return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 상품쪽 });
    if (길.includes('firmDvList')) return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 배송쪽 });
    return r.fulfill({ status:200, contentType:'text/html; charset=utf-8',
      body: `<html><body>${폼(길, '')}</body></html>` });
  });

  const page = await ctx.newPage();
  const 탈 = []; page.on('pageerror', e => 탈.push(String(e && e.message).slice(0,160)));
  await page.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx');
  /* `불러오기.js` 가 하는 것과 같은 차례 · 같은 주소로 넣는다 */
  await page.addScriptTag({ content:
    'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};'
    + 'window.VP저장={get:async()=>({}),set:async()=>{},remove:async()=>{}};' });
  for (const f of ['login.css','search.css']) await page.addStyleTag({ url: 깃 + encodeURIComponent(f) });
  for (const f of ['vp-data.js','login.js','search.js'])
    await page.addScriptTag({ url: 깃 + encodeURIComponent(f) });
  await page.waitForTimeout(600);

  console.log('\n■ ④ 배송관리 상품명 칸 → 상품관리의 그 상품버튼 · 1440×900');
  console.log('  ⚠ 자료는 전부 가짜. 배송 줄 ' + 배송줄.length + '개 — 상품관리에 있는 이름 '
    + 있는줄 + '개 · **없는 이름 ' + 없는줄 + '개**');
  let 초록 = 0, 빨강 = 0;
  const 못 = (참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };

  await page.click('.vp-bar button[type=submit]');
  await page.waitForTimeout(2500);                 // 곁다리가 상품관리 목록을 받을 틈
  const 것 = await page.evaluate(본다);
  console.log('\n  곁다리로 `goods.js` 를 불렀나 ' + 것.곁다리붙었나 + ' ' + 못(것.곁다리붙었나)
    + ' · 받은 상품 ' + 것.상품목록몇개 + '가지 ' + 못(것.상품목록몇개 === 2)
    + ' (같은 이름 두 줄은 한 단추로 묶인다)');
  console.log('  곁다리 **몸통이 안 보이나**(검색칸·목록) ' + !것.곁다리몸통보이나 + ' '
    + 못(!것.곁다리몸통보이나));
  console.log('  머리줄 ' + 것.머리칸수 + '칸 · 상품명 칸 자리 ' + 것.상품칸자리 + ' '
    + 못(것.상품칸자리 === 1));
  console.log('  ★ 단추가 된 칸 **' + 것.단추수 + '개** / 글자 그대로 남은 칸 **'
    + 것.글자그대로수 + '개** ' + 못(것.단추수 === 있는줄 && 것.글자그대로수 === 없는줄));
  for (const x of 것.칸들) console.log('      ' + (x.단추인가 ? '단추 ' : '글자 ') + '「' + x.글 + '」'
    + (x.코드작은글씨 ? ' · 코드 ' + JSON.stringify(x.코드작은글씨) : ''));
  console.log('  상품관리 단추 꼴(코드 작은 글씨)이 붙었나 '
    + 못(것.칸들.filter(x=>x.단추인가).every(x => x.코드작은글씨 && x.코드작은글씨.length === 1)));
  console.log('  거르개 ' + JSON.stringify(것.거르개들) + ' ' + 못(것.거르개들.length === 4));
  console.log('  ③ 안 깨졌나 — 쪽 넘침 ' + 것.쪽넘침 + 'px · 표 통 밑 ' + 것.표통밑 + ' / 창 '
    + 것.창키 + ' ' + 못(것.쪽넘침 <= 1 && 것.표통밑 <= 것.창키 + 1));

  /* ★ 누르면 상품관리와 **같은 상세**가 뜨나 */
  await page.click('#vp-root .vp-상품칸 button');
  await page.waitForTimeout(400);
  const 판 = await page.evaluate(판본다);
  /* ⚠ 10-15 부터 상품명을 누르면 **상담 판도 같이** 뜬다(잡는 결로 듣는다).
       이 자는 상품 단추를 재는 자라 상담은 치워 두고 간다 — 안 그러면 덮개가 다음 누르기를 막는다. */
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  console.log('\n  ★ 단추를 눌렀다 → 상세 판 ' + JSON.stringify(판));
  console.log('    떴나 ' + 못(!!판 && 판.떴나) + ' · 제목이 그 상품명인가 '
    + 못(판?.제목 === '비스켓 800 주방수납장') + ' · 상세 줄 ' + 판?.줄수 + '개 '
    + 못((판?.줄수 || 0) >= 1));
  console.log('    매출처 알약 ' + JSON.stringify(판?.매출처알약) + ' '
    + 못(Array.isArray(판?.매출처알약) && 판.매출처알약.length >= 3)
    + ' (같은 이름이 매출처 둘이라 알약이 선다 — 상품관리와 같다)');
  console.log('    검게 된 단추 ' + 판?.검은단추수 + '개 ' + 못(판?.검은단추수 === 1));

  /* 다른 단추를 누르면 앞엣것이 풀리나 */
  await page.click('#vp-root tbody tr:nth-child(2) .vp-상품칸 button');
  await page.waitForTimeout(400);
  const 판2 = await page.evaluate(판본다);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  console.log('    다른 단추를 눌렀다 → 제목 「' + 판2?.제목 + '」 · 검은 단추 '
    + 판2?.검은단추수 + '개 ' + 못(판2?.검은단추수 === 1 && 판2?.제목 === '비스켓 1200 주방수납장'));

  console.log('\n  벤더피아에 POST 한 길 ' + JSON.stringify([...new Set(보낸길)])
    + ' ' + 못(보낸길.some(x=>x.includes('salesGoods')) && 보낸길.some(x=>x.includes('firmDvList'))));
  if (탈.length) { console.log('  터진 말: ' + JSON.stringify([...new Set(탈)].slice(0,3))); 빨강++; }
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  await ctx.close(); await b.close();
  process.exit(빨강 ? 1 : 0);
})();
