/* **확장이 배송관리에 `goods.js` 를 보내는 길**을 재는 자 (10-15 덮어쓰기).
   사장님: 「그러니까 난 안되니까 이거 확장프로그램 덮어씌어야 되는거 아니냐고」
   보아야 하는 것 —
     ㄱ) `불러오기.js` 가 배송관리에 무엇을 보내나 (**그 파일에서 직접 읽는다** — 묵지 않게)
     ㄴ) 꾸밈 차례: **`goods.css` 가 `search.css` 보다 앞**인가 (뒤면 ③ 이 깨진다)
     ㄷ) `goods.js` 가 **한 번만** 도나 (확장 길 + search.js 뒷길, 두 길로 와도)
     ㄹ) ⑤ 상품 단추가 생기나 · ② CS 거르개가 서나
     ㅁ) ③ 쪽 전체 스크롤이 **그대로 없나** (goods.css 가 함께 와도)
   ⚠ 진짜 vendorpia.com 은 못 닿는다. 흉내로 세워 잰다. 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const 깃 = 'https://vivivic-cloud.github.io/vivivic-apps/%EB%B2%A4%EB%8D%94%ED%94%BC%EC%95%84%EC%97%B0%EB%8F%99/';

/* ⚠ 글 목록을 손으로 베끼지 않는다 — `불러오기.js` 의 그 토막을 **그대로 돌려** 읽는다.
     베껴 두면 저쪽이 바뀔 때 자가 조용히 거짓말을 한다. */
function 보내는것(길) {
  const t = fs.readFileSync(path.join(확장, '불러오기.js'), 'utf8');
  const 시작 = t.indexOf('const 글 = [');
  const 끝 = t.indexOf('/* ⚠ 짚개.js 는 여기서 안 넣는다');
  if (시작 < 0 || 끝 < 0) throw new Error('불러오기.js 의 글 목록 토막을 못 찾았다');
  const f = new Function('있나', t.slice(시작, 끝) + '\nreturn { 글: 글, 꾸밈: 꾸밈 };');
  return f((s) => 길.toLowerCase().includes(s));
}

const 상품머리 = ["상품명","상품코드","매출처명","매입처명","배송사명","판매상태","단품명","단품코드","등록일"];
const 상품들 = [
  ["비스켓 800 주방수납장","KLS-800","가매출처","가매입처","경동택배(포천)","판매중","비스켓 800 몸통","bis800_b","2026-01-05"],
  ["비스켓 1200 주방수납장","KLS-1200","나매출처","가매입처","가주문","판매중","비스켓 1200 몸통","bis1200_b","2026-02-11"],
];
/* 사장님 화면의 **진짜 칸 이름** (장부 짚은자리에서 옮겼다) */
const 배송머리 = ["CS","CS주문번호","IMG","매출처","주문번호","주문번호2","가용수량","상품명","몰","주문자",
  "수취인","배송사","송장번호","배송상태","비고"];
const 배송줄 = [
  ["교환요청","CS-1","img","가매출처","20261015-1","-","1","비스켓 800 주방수납장","몰","가나다","가나다","가주문","640001","배송완료",""],
  ["","","img","나매출처","20261015-2","-","2","비스켓 1200 주방수납장","몰","가나다","가나다","가주문","640002","배송중",""],
  ["","","img","가매출처","20261015-3","-","1","상품관리에 없는 물건","몰","가나다","가나다","가주문","640003","배송완료",""],
];
const 표 = (머리, 줄들) => `<html><body><span>총 ${줄들.length} 건</span>
<table><tr>${머리.map(h=>`<th>${h}</th>`).join('')}</tr>
${줄들.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</table></body></html>`;
const 폼 = (액션, 칸들) => `<form name="aspnetForm" method="post" action="${액션}" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-15"><input name="dcEndDt" id="dcEndDt" value="2026-10-15">
${칸들}<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div></form>`;
const 배송쪽 = `<html><head><meta charset="utf-8"><title>배송목록조회</title></head><body id="body">
${폼('/System/Delivery/firmDvList.aspx', `
<select name="ddlDStatus" id="ddlDStatus"><option value="">전체</option><option value="V1">배송완료</option>
<option value="V2">배송중</option></select>
<select name="ddlCSType" id="ddlCSType"><option value="">전체</option><option value="C1">교환요청</option></select>
<select name="ddlDeliveryCo" id="ddlDeliveryCo"><option value="">전체</option><option value="V1">가주문</option>
<option value="V2">경동택배(포천)</option></select>
<select name="ddlStore" id="ddlStore"><option value="">전체</option><option value="V1">가매출처</option>
<option value="V2">나매출처</option></select>
<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select>`)}</body></html>`;
const 상품쪽 = `<html><head><meta charset="utf-8"><title>상품관리</title></head><body id="body">
${폼('/System/Master/salesGoods.aspx', `
<select name="ddlStatus" id="ddlStatus"><option value="전체">전체</option><option value="판매중" selected>판매중</option></select>
<select name="ddlStore" id="ddlStore"><option value="전체">전체</option></select>
<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select>
<input name="tbSGoodsCd" id="tbSGoodsCd"><input name="tbGoodsNm" id="tbGoodsNm">
<input type="checkbox" name="cbOptionGoodsYn" id="cbOptionGoodsYn">`)}</body></html>`;

const 본다 = () => {
  const 통 = document.querySelector('.vp-table');
  const 머리 = [...(통?.querySelectorAll('thead th') || [])].map(th => th.textContent);
  const 자리 = 머리.indexOf('상품명');
  const 칸들 = [...(통?.querySelectorAll('tbody tr') || [])].map((tr) => {
    const td = tr.children[자리];
    return { 글: (td?.textContent || '').trim(), 단추인가: !!td?.querySelector('button') };
  });
  const 쪽 = document.scrollingElement || document.documentElement;
  const 뿌리 = document.getElementById('vp-root');
  return {
    머리칸수: 머리.length, 상품칸자리: 자리,
    단추수: 칸들.filter(x=>x.단추인가).length,
    글자그대로수: 칸들.filter(x=>!x.단추인가 && x.글).length,
    칸들,
    곁다리통수: document.querySelectorAll('#vp-root > .vp-곁다리').length,
    굿즈돌았나: !!window.__vp굿즈돌았나,
    상품목록몇개: window.VP상품목록몇개 ? window.VP상품목록몇개() : null,
    거르개들: [...document.querySelectorAll('.vp-drop .vp-drop-name')].map(x=>x.textContent),
    셈한display: 뿌리 ? getComputedStyle(뿌리).display : null,
    쪽넘침: 쪽.scrollHeight - 쪽.clientHeight,
    표통밑: 통 ? Math.round(통.getBoundingClientRect().bottom) : null, 창키: innerHeight,
    딱지: document.getElementById('vp-판')?.textContent || null,
  };
};

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  console.log('\n■ 확장이 배송관리에 goods.js 를 보내는 길 · 1440×900');
  console.log('  ⚠ 자료는 전부 가짜. 머리줄은 사장님 장부 짚은자리에서 옮긴 진짜 칸 이름.');
  let 초록 = 0, 빨강 = 0;
  const 못 = (참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };

  /* ㄱㄴ) 불러오기.js 가 무엇을 보내나 — 그 파일에서 직접 읽는다 */
  const 배송 = 보내는것('/System/Delivery/firmDvList.aspx');
  const 단품 = 보내는것('/System/Master/goods.aspx');
  console.log('\n  불러오기.js 가 **배송관리**에 보내는 것');
  console.log('    글   : ' + JSON.stringify(배송.글));
  console.log('    꾸밈 : ' + JSON.stringify(배송.꾸밈));
  console.log('    goods.js 들었나 ' + 못(배송.글.includes('goods.js'))
    + ' · goods.css 들었나 ' + 못(배송.꾸밈.includes('goods.css')));
  console.log('    ★ goods.css 가 search.css **앞**인가 ('
    + 배송.꾸밈.indexOf('goods.css') + ' < ' + 배송.꾸밈.indexOf('search.css') + ') '
    + 못(배송.꾸밈.indexOf('goods.css') < 배송.꾸밈.indexOf('search.css')));
  console.log('    search.js 가 goods.js **앞**인가 ('
    + 배송.글.indexOf('search.js') + ' < ' + 배송.글.indexOf('goods.js') + ') '
    + 못(배송.글.indexOf('search.js') < 배송.글.indexOf('goods.js')));
  console.log('    johon.js·amt-draw.js 는 **안 보내나** (쓰는 것만) '
    + 못(!배송.글.includes('johon.js') && !배송.글.includes('amt-draw.js')));
  console.log('    단품관리 쪽은 그대로인가 : ' + JSON.stringify(단품.글) + ' '
    + 못(단품.글.includes('goods.js') && 단품.글.includes('johon.js') && 단품.글.includes('amt-draw.js')));

  /* ㄷㄹㅁ) 진짜로 그 차례대로 넣어 본다 */
  const 받은횟수 = {};
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.route('**://vivivic-cloud.github.io/**', (r) => {
    const 이름 = decodeURIComponent(new URL(r.request().url()).pathname.split('/').pop());
    받은횟수[이름] = (받은횟수[이름] || 0) + 1;
    const 자리 = path.join(확장, 이름);
    if (!fs.existsSync(자리)) return r.fulfill({ status: 404, body: 'x' });
    return r.fulfill({ status: 200, contentType: 이름.endsWith('.css') ? 'text/css' : 'text/javascript',
      body: fs.readFileSync(자리, 'utf8') });
  });
  await ctx.route('**://firestore.googleapis.com/**', (r) =>
    r.fulfill({ status: 403, contentType: 'application/json', body: '{"error":{"code":403}}' }));
  await ctx.route('**://identitytoolkit.googleapis.com/**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: '{"idToken":"ascii-fake"}' }));
  const POST길 = [];
  await ctx.route('**://vendorpia.com/**', (r) => {
    const 길 = new URL(r.request().url()).pathname;
    if (r.request().method() === 'POST') {
      POST길.push(길);
      if (길.includes('salesGoods')) return r.fulfill({ status:200,
        contentType:'text/html; charset=utf-8', body: 표(상품머리, 상품들) });
      if (길.includes('firmDvList')) return r.fulfill({ status:200,
        contentType:'text/html; charset=utf-8', body: 표(배송머리, 배송줄) });
      return r.fulfill({ status:200, contentType:'text/html; charset=utf-8',
        body: '<html><body><span>총 0 건</span><table><tr><th>없음</th></tr></table></body></html>' });
    }
    if (길.endsWith('.js')) return r.fulfill({ status:200, contentType:'text/javascript', body:'/* 손잡이 (흉내) */' });
    if (길.includes('salesGoods')) return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 상품쪽 });
    return r.fulfill({ status:200, contentType:'text/html; charset=utf-8', body: 배송쪽 });
  });
  const page = await ctx.newPage();
  const 탈 = []; page.on('pageerror', e => 탈.push(String(e && e.message).slice(0,160)));
  await page.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx?vg판=1');
  await page.addScriptTag({ content:
    'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"0.34.20"}),getURL:f=>"/"+f};'
    + 'window.VP저장={get:async()=>({}),set:async()=>{},remove:async()=>{}};'
    + 'document.documentElement.classList.add("vp-clean");'
    + '(function(){var d=document.createElement("div");d.id="vp-판";'
    + 'd.textContent="벤더피아 보기 0.34.20 · 확장 · 짚개✓ 기억✓ 손잡이✓ 꾸밈✓";'
    + 'd.style.cssText="position:fixed;left:6px;bottom:6px";document.body.appendChild(d);})();' });
  /* ⚠ `불러오기.js` 와 **같은 차례**로 넣는다 — 꾸밈 먼저, 그다음 글 하나씩 기다려 가며 */
  for (const f of 배송.꾸밈) await page.addStyleTag({ url: 깃 + encodeURIComponent(f) });
  for (const f of 배송.글) {
    if (f === '저장다리.js') continue;                 // 확장 안의 것 — 위에서 흉내로 세웠다
    await page.addScriptTag({ url: 깃 + encodeURIComponent(f) });
  }
  await page.waitForTimeout(600);
  await page.click('.vp-bar button[type=submit]').catch(()=>{});
  await page.waitForTimeout(2800);

  const 것 = await page.evaluate(본다);
  console.log('\n  진짜로 그 차례대로 넣어 보았다');
  console.log('    받은 횟수 : ' + JSON.stringify(받은횟수));
  console.log('    ★ goods.js 를 **한 번만** 받았나 ' + 못(받은횟수['goods.js'] === 1)
    + ' · 곁다리 통 ' + 것.곁다리통수 + '개 ' + 못(것.곁다리통수 === 1));
  console.log('    ★ 뒷길이 **안 나섰나** (「상품단추:부름」 토막이 없어야 한다) '
    + 못(!/상품단추:부름/.test(것.딱지 || '')));
  console.log('    받은 상품 ' + 것.상품목록몇개 + '가지 ' + 못(것.상품목록몇개 === 2));
  console.log('    머리줄 ' + 것.머리칸수 + '칸 · 상품명 자리 ' + 것.상품칸자리 + ' '
    + 못(것.상품칸자리 === 7));
  console.log('    ★ 단추 ' + 것.단추수 + '개 / 글자 그대로 ' + 것.글자그대로수 + '개 '
    + 못(것.단추수 === 2 && 것.글자그대로수 === 1));
  for (const x of 것.칸들) console.log('        ' + (x.단추인가 ? '단추 ' : '글자 ') + '「' + x.글 + '」');
  console.log('    ② 거르개 ' + JSON.stringify(것.거르개들) + ' ' + 못(것.거르개들.length === 4));
  console.log('    ③ 셈해진 #vp-root display **' + 것.셈한display + '** ' + 못(것.셈한display === 'flex')
    + ' (goods.css 의 block 에 안 덮였나)');
  console.log('    ③ 쪽 넘침 ' + 것.쪽넘침 + 'px · 표 통 밑 ' + 것.표통밑 + ' / 창 ' + 것.창키 + ' '
    + 못(것.쪽넘침 <= 1 && 것.표통밑 <= 것.창키 + 1));
  /* ★★ 10-16 사장님: 「상품명 버튼을 누르면 상담버튼과 동일한팝업이 나타납니다.
       **이는 잘못된 작동 입니다**」(장부 a1792133915).
       그래서 10-15 에 넣었던 **칸 가로채기를 걷었다.** 이제 자가 볼 것은 바뀌었다 —
       상품명을 누르면 **상품 상세만**, 상담은 **주문번호 칸의 상담 단추로만.** */
  await page.click('#vp-root tbody tr:nth-child(1) .vp-상품칸 button');
  await page.waitForTimeout(900);
  const 누른뒤 = await page.evaluate(() => ({
    상담판: !!document.querySelector('.vp-상담판'),
    상세: !!document.querySelector('.vp-곁다리 .vp-goods-panel:not([hidden])'),
    상담단추수: document.querySelectorAll('.vp-주문칸 .vp-상담알').length }));
  console.log('    ★ 상품명 누름 → 상세 ' + 누른뒤.상세 + ' · **상담 판 ' + 누른뒤.상담판
    + '** ' + 못(누른뒤.상세 && !누른뒤.상담판));
  /* 상담은 그 단추로는 **열려야** 한다 — 없앤 게 아니라 길을 하나로 모은 것이다 */
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await page.click('#vp-root tbody tr:nth-child(1) .vp-주문칸 .vp-상담알');
  await page.waitForTimeout(600);
  const 상담뒤 = await page.evaluate(() => !!document.querySelector('.vp-상담판'));
  console.log('    ★ 상담 단추(' + 누른뒤.상담단추수 + '개) 누름 → 상담 판 ' + 상담뒤 + ' '
    + 못(상담뒤 && 누른뒤.상담단추수 > 0));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  console.log('    ⑧ 수입정보는 403 — 딱지에 까닭이 적혔나 '
    + 못(/수입정보/.test(것.딱지 || '') === false || /수입정보:/.test(것.딱지 || '')));
  console.log('    딱지 : ' + 것.딱지);
  if (탈.length) { console.log('    터진 말: ' + JSON.stringify([...new Set(탈)].slice(0,3))); 빨강++; }
  await ctx.close();
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  await b.close();
  process.exit(빨강 ? 1 : 0);
})();
