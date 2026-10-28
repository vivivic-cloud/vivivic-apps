/* 10-28 [새 지시 CS등록단품] 을 재는 자 — 사장님 말씀 (한 글자도 안 고침):
   「현재 상담 팝업에서 메세지를 적는 칸의 이름은 고객문의  입니다. 이메세지 하단의 남기기 버튼의 이름을 접수로 변경해 주세요. …
    해당 버튼을 메세지 접수 버튼 하단에 CS등록이라는 명칭 아래 배치 되게 해주세요 - 배치시 취소 버튼을 추가해 주세요. 일단 버튼을 누르면
    현재 상담중인 주문의 단품정보를 확인해야 합니다. … 구성이 확인된 단품중 어느 단품에 대한 접수인지를 확인 해줘야 합니다.」
   ㄱ) 고객문의 칸 아래 「접수」 · 그 아래 「CS등록」 교환·반품·AS·취소
   ㄴ) 종류를 누르면 그 주문 상품의 단품(상품 상세 단품 단추와 같은 것)이 나오고 여럿 고를 수 있다 · 고른 것이 보이고 상태로 남는다
   ㄷ) 쓰기 없음(벤더피아 조회만, 창고 PATCH 0) · 1280/375
   틀은 `이름줄팝업.cjs` 와 같다. 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const 깃 = 'https://vivivic-cloud.github.io/vivivic-apps/%EB%B2%A4%EB%8D%94%ED%94%BC%EC%95%84%EC%97%B0%EB%8F%99/';

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
];
const 배송머리 = ["주문번호","상품명","단품명","수취인","수량","배송사","송장번호","배송상태","CS구분","매출처"];
const 배송줄 = [
  ["20261015-1","비스켓 800 주방수납장","비스켓 800 몸통","가나다","1","경동택배(포천)","640001","배송완료","","가매출처"],
  ["20261015-2","비스켓 1200 주방수납장","비스켓 1200 몸통","가나다","2","가주문","640002","배송중","","나매출처"],
  ["20261015-3","이름이 상품관리에 없는 물건","이름이 단품관리에 없는 단품","가나다","1","가주문","640003","배송완료","","가매출처"],
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

const 표값 = () => {
  const 머리 = [...document.querySelectorAll('.vp-table thead th')].map((x) => x.textContent);
  const 칸 = (이름) => [...document.querySelectorAll('.vp-table tbody tr')].map((tr) => {
    const td = tr.children[머리.indexOf(이름)], b = td && td.querySelector('.vp-goods-list > button');
    return { 글: (td?.textContent || '').trim(), 단추: !!b, 점: b ? b.querySelectorAll('.vp-점 i').length : 0,
      코드: b ? [...b.querySelectorAll('small.vp-code')].map((s) => s.textContent) : [] };
  });
  return { 머리, 상품: 칸('상품명'), 단품: 칸('단품명'),
    줄클릭표: document.querySelectorAll('.vp-table tbody tr.vp-줄상담').length, 줄수: document.querySelectorAll('.vp-table tbody tr').length };
};
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

  const 판값 = () => {
    const 덮 = document.querySelector('.vp-상담덮개:not(.vp-cs덮개)');
    if (!덮) return null;
    const c = 덮.querySelector('.vp-cs등록'), f = 덮.querySelector('.vp-상담적기');
    return {
      라벨: f.querySelector('.vp-상담라벨')?.textContent, 접수: f.querySelector('button[type=submit]').textContent,
      폼안종류: f.querySelectorAll('.vp-상담종류').length,
      아래: f.getBoundingClientRect().bottom <= c.getBoundingClientRect().top + 1,
      CS라벨: c.querySelector('.vp-상담라벨')?.textContent,
      종류: [...c.querySelectorAll('.vp-상담종류')].map((b) => b.textContent + (b.getAttribute('aria-pressed') === 'true' ? '(켬)' : '')),
      단품칸숨음: c.querySelector('.vp-cs단품').hidden,
      단품: [...c.querySelectorAll('.vp-cs단품 .vp-goods-list > button')].map((b) => b.firstChild.textContent + (b.getAttribute('aria-pressed') === 'true' ? '(켬)' : '')),
      단추: [...c.querySelectorAll('.vp-cs단품 .vp-goods-list > button')].map((b) => ({ 점: b.querySelectorAll('.vp-점 i').length,
        코드: b.querySelector('small.vp-code')?.textContent || '', 고름통: b.parentElement.classList.contains('vp-고름') })),
      단품글: c.querySelector('.vp-cs단품').textContent,
      고른것: c.querySelector('.vp-cs고른것').hidden ? '' : c.querySelector('.vp-cs고른것').textContent,
      상태: JSON.parse(JSON.stringify(덮.vpCS등록 || null)),
      꼴: (() => { const 보 = (e) => { if (!e) return null; const s = getComputedStyle(e); return [s.fontSize, s.fontWeight, s.borderRadius, s.paddingTop].join(' '); };
        const 글꼴 = (e) => { if (!e) return null; const s = getComputedStyle(e); return [s.fontSize, s.fontWeight, s.color, s.borderTopWidth, s.backgroundColor].join(' '); };
        return [글꼴(c.querySelector('.vp-cs단품 .vp-goods-list > button')), 글꼴(document.querySelector('.vp-table td .vp-goods-list > button'))]; })(),
      넘침: 덮.querySelector('.vp-상담판').getBoundingClientRect().right > innerWidth + 1,
    };
  };
  for (const 폭 of [1280, 375]) {
    console.log('\n■ 배송관리 상담 판 · ' + 폭 + 'px');
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
    await page.click('.vp-table tbody tr:nth-child(1) td:last-child');
    await page.waitForTimeout(600);
    let 판 = await page.evaluate(판값);
    console.log('  ★ ㄱ 칸 이름 「' + 판.라벨 + '」 · 단추 「' + 판.접수 + '」 ' + 못(판.라벨 === '고객문의' && 판.접수 === '접수' && 판.폼안종류 === 0));
    console.log('  ★ ㄱ 「접수」 아래 「' + 판.CS라벨 + '」 ' + JSON.stringify(판.종류) + ' ' + 못(판.아래 && 판.CS라벨 === 'CS등록'
      && JSON.stringify(판.종류) === JSON.stringify(['교환', '반품', 'AS', '취소'])));
    console.log('  ㄱ 누르기 전엔 단품칸 숨음 ' + 못(판.단품칸숨음 && !판.고른것));
    await page.click('.vp-cs등록 [data-k="교환"]');
    await page.waitForTimeout(2500);
    판 = await page.evaluate(판값);
    console.log('  ★ ㄴ 교환 → 단품 ' + JSON.stringify(판.단품) + ' (상품 상세 단품 단추와 같음) ' + 못(!판.단품칸숨음
      && JSON.stringify(판.단품) === JSON.stringify(['비스켓 800 몸통', '비스켓 800 문'])));
    console.log('  ㄴ 고르기 전 「' + 판.고른것 + '」 ' + 못(판.고른것 === '교환 · 단품을 고르십시오'));
    /* 10-28 [새 지시 CS단품단추] 배송관리 단품 단추와 같은 단추 — 네 점·코드·글꼴 같음 */
    console.log('  ★ ㅁ 단품 단추 = 배송관리 단품 단추(점 넷·코드) ' + JSON.stringify(판.단추) + ' ' + 못(판.단추.length === 2
      && 판.단추.every((x) => x.점 === 4) && 판.단추[0].코드 === 'bis800_b' && 판.단추[1].코드 === 'bis800_d'));
    console.log('  ㅁ 글꼴 = 배송관리 표 단품 단추(크기·굵기·색·테두리·바탕) ' + JSON.stringify(판.꼴) + ' ' + 못(판.꼴[0] && 판.꼴[0] === 판.꼴[1]));
    const 단품 = (n) => '.vp-cs단품 .vp-goods-list:nth-child(' + n + ') > button';
    await page.click(단품(2));
    const 왼값 = await page.evaluate(열린판);
    console.log('  ★ ㅁ 왼쪽 누름 = 고름(상세 안 열림) ' + JSON.stringify(왼값.상세) + ' ' + 못(!왼값.상세.length));
    const 기본막음 = await page.evaluate((q) => { const b = document.querySelector(q); const r = b.getBoundingClientRect();
      const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: r.left + 5, clientY: r.top + 5, button: 2 });
      b.dispatchEvent(e); return e.defaultPrevented; }, 단품(1));
    const 메뉴 = await page.evaluate(() => [...document.querySelectorAll('#vp-root .vp-우클릭 button')].map((b) => b.textContent));
    console.log('  ★ ㅁ 오른쪽 누름 → 메뉴 ' + JSON.stringify(메뉴) + ' · 기본 메뉴 막음 ' + 못(기본막음 && JSON.stringify(메뉴) === '["상세보기"]'));
    await page.click('#vp-root .vp-우클릭 button');
    await page.waitForTimeout(1500);
    const 상세값 = await page.evaluate(열린판);
    const 고름뒤 = await page.evaluate(판값);
    console.log('  ★ ㅁ 「상세보기」 → 상세 ' + JSON.stringify(상세값.상세) + ' · 고름은 그대로 ' + 못(상세값.상세.includes('비스켓 800 몸통')
      && 상세값.상담 && !(await page.$('#vp-root .vp-우클릭')) && 고름뒤.상태.단품.map((d) => d.code).join() === 'bis800_d'));
    await page.evaluate(() => document.querySelectorAll('.vp-goods-panel').forEach((p) => { p.hidden = true; }));
    await page.click(단품(1));
    판 = await page.evaluate(판값);
    console.log('  ★ ㄴ 둘 고름 → 「' + 판.고른것 + '」 · 상태 ' + JSON.stringify(판.상태) + ' ' + 못(판.고른것 === '교환 · 비스켓 800 몸통, 비스켓 800 문'
      && 판.상태.종류 === '교환' && 판.상태.단품.map((d) => d.code).join() === 'bis800_b,bis800_d'));
    console.log('  ㅁ 고른 단품 눈에 띔 ' + JSON.stringify(판.단추.map((x) => x.고름통)) + ' ' + 못(판.단추.every((x) => x.고름통)));
    await page.click(단품(1));
    await page.click('.vp-cs등록 [data-k="취소"]');
    판 = await page.evaluate(판값);
    console.log('  ★ ㄴ 하나 풀고 취소로 바꿈 → 「' + 판.고른것 + '」 ' + JSON.stringify(판.종류) + ' ' + 못(판.고른것 === '취소 · 비스켓 800 문'
      && 판.종류[3] === '취소(켬)' && 판.상태.종류 === '취소'));
    console.log('  ㄱ 판이 화면 밖으로 안 나감 ' + 못(!판.넘침));
    await page.screenshot({ path: path.join(그림칸, 'CS등록단품-' + 폭 + '.png') });
    await page.click('.vp-cs등록 [data-k="취소"]');
    판 = await page.evaluate(판값);
    console.log('  ㄴ 같은 종류 다시 → 꺼짐 ' + 못(판.단품칸숨음 && !판.고른것 && 판.상태.종류 === ''));
    console.log('  ★ ㄷ 쓰기 없음 ' + JSON.stringify(쓰기) + ' ' + 못(!쓰기.length));
    await ctx.close();
  }
  if (탈.length) { console.log('  터진 말 ' + JSON.stringify([...new Set(탈)].slice(0, 3))); 빨강++; }
  await b.close();
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  process.exit(빨강 ? 1 : 0);
})();
