/* 11-07 [새 지시 CS상세단품단추] 을 재는 자 — 사장님 말씀 (한 글자도 안 고침):
   「cs등록의 목록줄을 눌렀을 때 나타나는 상세 정보의 단품구성 등 모든 단품명이 나타나는 곳의 단품명표기를 일반텍스트가 아닌 현재의 단품버튼이 나타나 잘 정렬되어 보이도록 해주세요」
   고객정보의 단품명·단품구성 → 같은 단품 단추·수량만큼·이름만·못 찾으면 글자·이름 안 「+」·정렬·안 넘침·누르면 상세·CS등록 단추 그대로. 1280/375. 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const 깃 = 'https://vivivic-cloud.github.io/vivivic-apps/%EB%B2%A4%EB%8D%94%ED%94%BC%EC%95%84%EC%97%B0%EB%8F%99/';

const 긴이름앞 = "아주아주 긴 이름을 가진 비스켓 수납장 좌측 몸통 프레임 화이트 오크 1800 시리즈 특별판";
const 상품머리 = ["상품명","상품코드","매출처명","매입처명","배송사명","판매상태","단품명","단품코드","모델번호","매출처상품명","옵션상품유무","등록일"];
const 상품들 = [
  ["비스켓 800 주방수납장","KLS-800","가매출처","가매입처","경동택배(포천)","판매중","비스켓 800 몸통 + 비스켓 800 문","bis800_b + bis800_d","M-800","비스켓800","N","2026-01-05"],
  ["비스켓 1200 주방수납장","KLS-1200","나매출처","가매입처","가주문","판매중","비스켓 1200 몸통","bis1200_b","M-1200","비스켓1200","N","2026-02-11"],
];
const 단품머리 = ["단품명","단품코드","단품분류","매입처명","재고유형","발주유형","판매상태","바코드","등록일"];
const 단품들 = [
  ["비스켓 800 몸통","bis800_b","수납장","가매입처","재고","정상","판매중","880001","2026-01-05"],
  ["비스켓 800 문","bis800_d","수납장","가매입처","재고","정상","판매중","880002","2026-01-05"],
  ["비스켓 1200 몸통","bis1200_b","수납장","가매입처","재고","정상","판매중","880003","2026-02-11"],
  [긴이름앞,"long_b","수납장","가매입처","재고","정상","판매중","880004","2026-02-11"],
  ["비스켓 + 문 세트","bis_set","수납장","가매입처","재고","정상","판매중","880005","2026-02-11"],
];
const 배송머리 = ["주문번호","상품명","단품명","단품코드","단품구성","수취인","수량","배송상태"];
const 긴이름 = "아주아주 긴 이름을 가진 비스켓 수납장 좌측 몸통 프레임 화이트 오크 1800 시리즈 특별판";
const 배송줄 = [
  ["20261015-1","비스켓 800 주방수납장","비스켓 800 몸통 + 비스켓 800 몸통 + 비스켓 800 문","bis800_b + bis800_b + bis800_d","비스켓 800 몸통 + 비스켓 800 문","가나다","1","배송완료"],
  ["20261015-2","비스켓 1200 주방수납장","비스켓 1200 몸통","","비스켓 1200 몸통","가나다","2","배송중"],
  ["20261015-3","이름이 상품관리에 없는 물건","이름이 단품관리에 없는 단품","","비스켓 1200 몸통 + 없는 단품","가나다","1","배송완료"],
  ["20261015-4","긴 물건","비스켓 + 문 세트",""," "+긴이름+" + "+긴이름+" + 비스켓 800 문","가나다","1","배송완료"],
];

const 표 = (머리, 줄) => `<html><body><span>총 ${줄.length} 건</span><table><tr>${머리.map(h=>`<th>${h}</th>`).join('')}</tr>
${줄.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</table></body></html>`;
const 빈표 = '<html><body><span>총 0 건</span><table><tr><th>없음</th></tr></table></body></html>';
const 폼 = (액션, 칸들) => `<form name="aspnetForm" method="post" action="${액션}" id="aspnetForm">
<input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-15"><input name="dcEndDt" id="dcEndDt" value="2026-10-15">
${칸들}
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div></form>`;
const 쪽 = (제목, 액션, 칸들) => `<html><head><meta charset="utf-8"><title>${제목}</title></head><body id="body">${폼(액션, 칸들)}</body></html>`;
const 행수 = '<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select>';
const 배송쪽 = (액션) => 쪽('배송목록조회', 액션, `<select name="ddlDStatus" id="ddlDStatus"><option value="">전체</option></select>${행수}`);
const 상품쪽 = 쪽('상품관리', '/System/Master/salesGoods.aspx', `<select name="ddlStatus" id="ddlStatus"><option value="전체">전체</option><option value="판매중" selected>판매중</option></select>
<select name="ddlStore" id="ddlStore"><option value="전체">전체</option></select>${행수}<input name="tbSGoodsCd" id="tbSGoodsCd"><input name="tbGoodsNm" id="tbGoodsNm">
<input type="checkbox" name="cbOptionGoodsYn" id="cbOptionGoodsYn">`);
const 단품쪽 = 쪽('단품관리', '/System/Master/goods.aspx', `<select name="ddlSupplier" id="ddlSupplier"><option value="전체">전체</option></select>
<select name="ddlStockYn" id="ddlStockYn"><option value="전체">전체</option></select><select name="ddlOrderingType" id="ddlOrderingType"><option value="전체">전체</option></select>
<select name="ddlStatus" id="ddlStatus"><option value="전체">전체</option><option value="판매중">판매중</option></select>${행수}
<input name="tbGoodsCd" id="tbGoodsCd"><input name="tbGoodsNm" id="tbGoodsNm">`);

const 열린판 = () => ({
  상세: [...document.querySelectorAll('.vp-goods-panel')].filter((p) => !p.hidden).map((p) => p.querySelector('strong')?.textContent),
  상담: document.querySelector('.vp-상담덮개:not(.vp-cs덮개) .vp-상담머리 strong')?.textContent || null,
  CS판: !!document.querySelector('.vp-cs판'),
  검은: document.querySelectorAll('#vp-root .vp-상품칸 button.on').length,
});
const 자리 = (고르개) => { const e = document.querySelector(고르개); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, 위치: getComputedStyle(e).position }; };

(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  let 초록 = 0, 빨강 = 0;
  const 못 = (참) => { if (참) { 초록++; return '✓'; } 빨강++; return '✗'; };
  const 그림칸 = path.join(__dirname, '그림'); fs.mkdirSync(그림칸, { recursive: true });
  const 탈 = [];

  const 세우기 = async (폭, 터치) => {
    const ctx = await b.newContext({ viewport: { width: 폭, height: 900 }, hasTouch: !!터치 });
    await ctx.route('**://identitytoolkit.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"idToken":"x"}' }));
    await ctx.route('**://vivivic-cloud.github.io/**', (r) => {
      const 이름 = decodeURIComponent(new URL(r.request().url()).pathname.split('/').pop());
      const 자리 = path.join(확장, 이름);
      if (!fs.existsSync(자리)) return r.fulfill({ status: 404, body: 'x' });
      return r.fulfill({ status: 200, contentType: 이름.endsWith('.css') ? 'text/css' : 'text/javascript', body: fs.readFileSync(자리, 'utf8') });
    });
    await ctx.route('**://vendorpia.com/**', (r) => {
      const 길 = new URL(r.request().url()).pathname, html = (body) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body });
      if (r.request().method() === 'POST') {
        if (길.includes('salesGoods')) return html(표(상품머리, 상품들));
        if (길.includes('/Master/goods')) return html(표(단품머리, 단품들));
        if (길.includes('firmDvList') || 길.includes('orderMst')) return html(표(배송머리, 배송줄));
        return html(빈표);
      }
      if (길.endsWith('.js')) return r.fulfill({ status: 200, contentType: 'text/javascript', body: '/* 손잡이 (흉내) */' });
      if (길.includes('salesGoods')) return html(상품쪽);
      if (길.includes('/Master/goods')) return html(단품쪽);
      if (길.includes('orderMst')) return html(배송쪽('/System/Sales/orderMst.aspx'));
      if (길.includes('firmDvList')) return html(배송쪽('/System/Delivery/firmDvList.aspx'));
      return html(`<html><body>${폼(길, 행수)}</body></html>`);
    });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => 탈.push(String(e && e.message).slice(0, 160)));
    return { ctx, page };
  };
  const 글넣기 = async (page, 확장에서, 전체) => {
    await page.addScriptTag({ content: 'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};'
      + 'window.VP저장={get:async()=>({}),set:async()=>{},remove:async()=>{}};' });
    for (const f of 전체.꾸밈) await page.addStyleTag({ url: 깃 + encodeURIComponent(f) });
    for (const f of 전체.글) await page.addScriptTag({ url: 깃 + encodeURIComponent(f) });
  };

  const 칸값 = (이름) => {
    const 덮 = document.querySelector('.vp-상담덮개:not(.vp-cs덮개)');
    const dt = [...덮.querySelectorAll('.vp-고객목록 dt')].find((x) => x.textContent === 이름);
    const dd = dt.nextElementSibling, 판 = 덮.querySelector('.vp-상담판').getBoundingClientRect(), 칸 = dd.getBoundingClientRect();
    const 통 = [...dd.querySelectorAll('.vp-goods-list')];
    const 표단추 = document.querySelector('.vp-table td .vp-goods-list > button');
    const 글꼴 = (e) => { const s = getComputedStyle(e); return [s.fontWeight, s.color, s.borderTopWidth].join(' '); };
    return { 글: dd.textContent, 단추: 통.map((t) => { const b = t.querySelector('button'); return { 이름: b.firstChild.textContent,
        코드: b.querySelector('small.vp-code')?.textContent || '', 점: b.querySelectorAll('.vp-점 i').length, 위: Math.round(t.getBoundingClientRect().top) }; }),
      나란: dd.children.length, 넘침: 통.some((t) => t.getBoundingClientRect().right > 칸.right + 1) || 칸.right > 판.right + 1 || dd.scrollWidth > dd.clientWidth + 1,
      꼴같음: 통[0] ? 글꼴(통[0].querySelector('button')) === 글꼴(표단추 || 통[0].querySelector('button')) : null, 줄수: new Set(통.map((t) => Math.round(t.getBoundingClientRect().top))).size };
  };
  const 줄열기 = async (page, n) => {
    await page.keyboard.press('Escape');
    await page.click('.vp-table tbody tr:nth-child(' + n + ') td:last-child');
    await page.waitForTimeout(2500);
  };
  for (const 폭 of [1280, 375]) {
    console.log('\n■ 상담 판 고객정보 · ' + 폭 + 'px');
    const { ctx, page } = await 세우기(폭, 폭 < 500);
    const 쓰기 = [];
    page.on('request', (q) => { const u = q.url(), m = q.method();
      if (/vendorpia\.com/.test(u) && m === 'POST' && !/salesGoods|\/Master\/goods|firmDvList|StockList/.test(u)) 쓰기.push(m + ' ' + u);
      if (/firestore/.test(u) && m !== 'GET' && !/:runQuery/.test(u)) 쓰기.push(m + ' ' + u); });
    await page.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx');
    await 글넣기(page, true, { 꾸밈: ['login.css', 'goods.css', 'search.css'], 글: ['vp-data.js', 'login.js', 'search.js', 'goods.js'] });
    await page.waitForTimeout(600);
    await page.click('.vp-bar button[type=submit]');
    await page.waitForTimeout(3500);
    await 줄열기(page, 1);
    let v = await page.evaluate(칸값, '단품명');
    console.log('  ★ 수량만큼 단추 ' + JSON.stringify(v.단추) + ' ' + 못(v.단추.length === 3 && v.단추.every((x) => x.점 === 4)
      && v.단추.map((x) => x.코드).join() === 'bis800_b,bis800_b,bis800_d' && !v.글.includes('+')));
    console.log('  표 단품 단추와 같은 꼴 ' + 못(v.꼴같음));
    const 구성 = await page.evaluate(칸값, '단품구성');
    console.log('  ★ 단품구성 칸 — 이름만으로 찾음 ' + JSON.stringify(구성.단추.map((x) => x.코드)) + ' ' + 못(구성.단추.map((x) => x.코드).join() === 'bis800_b,bis800_d'));
    console.log('  안 넘침 ' + 못(!v.넘침 && !구성.넘침));
    console.log('  판 폭에 맞춰 줄바꿈·왼쪽 맞춤(줄 ' + v.줄수 + ', 단추 ' + v.단추.length + ') ' + 못(폭 < 500 ? v.줄수 === 3 : v.줄수 === 2));
    await page.click('.vp-상담덮개 .vp-상세단품 .vp-goods-list > button');
    await page.waitForTimeout(1500);
    let 열림 = await page.evaluate(열린판);
    console.log('  ★ 누름 = 단품 상세·상담 판 그대로 ' + JSON.stringify(열림.상세) + ' ' + 못(열림.상세.includes('비스켓 800 몸통') && !!열림.상담));
    await page.evaluate(() => document.querySelectorAll('.vp-goods-panel').forEach((p) => { p.hidden = true; p.style.display = 'none'; }));
    await page.click('.vp-cs등록 [data-k="교환"]');
    await page.waitForTimeout(2500);
    await page.click('.vp-cs단품 .vp-goods-list:nth-child(1) > button');
    열림 = await page.evaluate(열린판);
    const 고름 = await page.evaluate(() => document.querySelector('.vp-상담덮개').vpCS등록?.단품?.map((d) => d.code).join());
    console.log('  ★ CS등록 단추는 그대로(왼쪽 = 고름, 상세 안 열림) ' + 고름 + ' ' + 못(고름 === 'bis800_b' && !열림.상세.length));
    await page.screenshot({ path: path.join(그림칸, 'CS상세단품-' + 폭 + '.png') });
    await 줄열기(page, 3);
    v = await page.evaluate(칸값, '단품명');
    console.log('  ★ 못 찾은 이름 = 글자 그대로 「' + v.글 + '」 ' + 못(v.글 === '이름이 단품관리에 없는 단품' && !v.단추.length));
    v = await page.evaluate(칸값, '단품구성');
    console.log('  섞임 — 찾은 것만 단추 ' + JSON.stringify(v.단추.map((x) => x.코드)) + ' ' + 못(v.단추.length === 1 && v.글.includes('없는 단품')));
    await 줄열기(page, 4);
    v = await page.evaluate(칸값, '단품구성');
    console.log('  ★ 긴 이름 여럿 안 넘침 · 줄 ' + v.줄수 + ' ' + 못(v.단추.length === 3 && !v.넘침));
    await page.screenshot({ path: path.join(그림칸, 'CS상세단품긴이름-' + 폭 + '.png') });
    await page.keyboard.press('Escape');
    await 줄열기(page, 4);
    v = await page.evaluate(칸값, '단품명');
    console.log('  이름 안 「+」 = 단추 하나 ' + JSON.stringify(v.단추.map((x) => x.코드)) + ' ' + 못(v.단추.length === 1 && v.단추[0].코드 === 'bis_set'));
    console.log('  ★ 쓰기 없음 ' + JSON.stringify(쓰기) + ' ' + 못(!쓰기.length));
    await ctx.close();
  }
  if (탈.length) { console.log('  터진 말 ' + JSON.stringify([...new Set(탈)].slice(0, 3))); 빨강++; }
  await b.close();
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  process.exit(빨강 ? 1 : 0);
})();
