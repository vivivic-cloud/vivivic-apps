/* 10-28 [새 지시 CS단품검색] 을 재는 자 — 사장님 말씀 (한 글자도 안 고침):
   「실패(③ 주문 단품정보에 없는 단품: r2-trl8p(r2-trl8p) · 표에는 R2-tori5)  - 해당 상황의 경우 단품관리의 판매중 단품명을 검색하여 선택할 수 있게 해주세요.
    검색은 해당 사용자가 직접 텍스트로 검색합니다. 이 선택 또한 멀티로 선택이 가능해야 합니다. 해당 검색시 현재 단품관리의 검색과 동일한 검색 방식이 유지되어야 하며
    검색 결과는 스크롤 드롭다운 목록으로 나타나며 해당 목록의 결과 또한 현재 단품명 버튼과 동일한 버튼이 나타나야 합니다.」
   ㄱ) CS등록 종류를 누르면 단품 검색칸이 보인다
   ㄴ) 글로 찾음 = 단품관리 검색과 같은 방식(낱말 나눔·대소문자 무시·단품명/코드/바코드/분류/매입처) + 판매중만
   ㄷ) 결과 = 스크롤 드롭다운, 단추 = 단품 단추(점 넷·코드), 왼쪽 = 고름, 오른쪽 = 「상세보기」
   ㄹ) 여럿 고름 · 상품 단품과 섞임 · 풀기 · 쓰기 없음 · 1280/375
   틀은 `CS등록단품.cjs` 와 같다. 자료는 전부 가짜. 맥: VP_EXE 에 크로미움 경로. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = process.env.VP_EXE || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const 깃 = 'https://vivivic-cloud.github.io/vivivic-apps/%EB%B2%A4%EB%8D%94%ED%94%BC%EC%95%84%EC%97%B0%EB%8F%99/';

const 상품머리 = ["상품명","상품코드","매출처명","매입처명","배송사명","판매상태","단품명","단품코드","모델번호","매출처상품명","옵션상품유무","등록일"];
const 상품들 = [
  ["비스켓 800 주방수납장","KLS-800","가매출처","가매입처","경동택배(포천)","판매중","비스켓 800 몸통 + 비스켓 800 문","bis800_b + bis800_d","M-800","비스켓800","N","2026-01-05"],
];
const 단품머리 = ["단품명","단품코드","단품분류","매입처명","재고유형","발주유형","판매상태","바코드","등록일"];
const 단품들 = [
  ["비스켓 800 몸통","bis800_b","수납장","가매입처","재고","정상","판매중","880001","2026-01-05"],
  ["비스켓 800 문","bis800_d","수납장","가매입처","재고","정상","판매중","880002","2026-01-05"],
  ["토리 침대 R2 5","R2-tori5","침대","나매입처","재고","정상","판매중","880011","2026-03-01"],
  ["토리 침대 R2 6","R2-tori6","침대","나매입처","재고","정상","판매중","880012","2026-03-01"],
  ["토리 침대 R2 옛것","R2-tori0","침대","나매입처","재고","정상","판매중지","880010","2025-03-01"],
];
const 배송머리 = ["주문번호","상품명","단품명","수취인","수량","배송사","송장번호","배송상태","CS구분","매출처"];
const 배송줄 = [["20261015-1","비스켓 800 주방수납장","비스켓 800 몸통","가나다","1","경동택배(포천)","640001","배송완료","","가매출처"]];

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
      if (길.includes('firmDvList')) return html(배송쪽('/System/Delivery/firmDvList.aspx'));
      return html(`<html><body>${폼(길, 행수)}</body></html>`);
    });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => 탈.push(String(e && e.message).slice(0, 160)));
    return { ctx, page };
  };
  const 글넣기 = async (page) => {
    await page.addScriptTag({ content: 'window.chrome=window.chrome||{};chrome.runtime={getManifest:()=>({version:"잰것"}),getURL:f=>"/"+f};'
      + 'window.VP저장={get:async()=>({}),set:async()=>{},remove:async()=>{}};' });
    for (const f of ['login.css', 'goods.css', 'search.css']) await page.addStyleTag({ url: 깃 + encodeURIComponent(f) });
    for (const f of ['vp-data.js', 'login.js', 'search.js', 'goods.js']) await page.addScriptTag({ url: 깃 + encodeURIComponent(f) });
  };
  const 판값 = () => {
    const 덮 = document.querySelector('.vp-상담덮개:not(.vp-cs덮개)');
    const c = 덮.querySelector('.vp-cs등록'), 검 = c.querySelector('.vp-cs단품검색'), 목 = c.querySelector('.vp-cs검색목록');
    const 단추들 = (q) => [...c.querySelectorAll(q + ' .vp-goods-list > button')].map((b) => ({ 글: b.firstChild.textContent,
      점: b.querySelectorAll('.vp-점 i').length, 코드: b.querySelector('small.vp-code')?.textContent || '', 고름: b.parentElement.classList.contains('vp-고름') }));
    const 글꼴 = (e) => { if (!e) return null; const s = getComputedStyle(e); return [s.fontSize, s.fontWeight, s.color, s.borderTopWidth, s.backgroundColor].join(' '); };
    const 통꼴 = (e) => { if (!e) return null; const s = getComputedStyle(e); return [s.borderTopWidth, s.borderRadius, s.paddingTop, s.backgroundColor].join(' '); };
    const ms = getComputedStyle(목);
    return {
      검색보임: !검.hidden, 목록보임: !목.hidden, 목록글: 목.textContent.trim().slice(0, 60),
      목록스크롤: [ms.overflowY, ms.maxHeight].join(' '),
      결과: 단추들('.vp-cs검색목록'), 위: 단추들('.vp-cs단품:not(.vp-cs검색고름)'), 아래: 단추들('.vp-cs검색고름'),
      꼴: [글꼴(c.querySelector('.vp-cs검색목록 .vp-goods-list > button')), 글꼴(c.querySelector('.vp-cs단품 .vp-goods-list > button'))],
      통: [통꼴(c.querySelector('.vp-cs검색목록 .vp-goods-list:not(.vp-고름)')), 통꼴(c.querySelector('.vp-cs단품 .vp-goods-list:not(.vp-고름)'))],
      고른것: c.querySelector('.vp-cs고른것').textContent,
      상태: JSON.parse(JSON.stringify(덮.vpCS등록)),
      넘침: 덮.querySelector('.vp-상담판').getBoundingClientRect().right > innerWidth + 1 || document.documentElement.scrollWidth > innerWidth + 1,
    };
  };
  const 찾기 = async (page, 글) => { await page.fill('.vp-cs단품검색 input', 글); await page.waitForTimeout(1500); return page.evaluate(판값); };
  for (const 폭 of [1280, 375]) {
    console.log('\n■ 배송관리 상담 판 CS등록 단품 검색 · ' + 폭 + 'px');
    const { ctx, page } = await 세우기(폭, 폭 < 500);
    const 쓰기 = [];
    page.on('request', (q) => { const u = q.url(), m = q.method();
      if (/vendorpia\.com/.test(u) && m === 'POST' && !/salesGoods|\/Master\/goods|firmDvList|StockList/.test(u)) 쓰기.push(m + ' ' + u);
      if (/firestore/.test(u) && m !== 'GET' && !/:runQuery/.test(u)) 쓰기.push(m + ' ' + u); });
    await page.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx');
    await 글넣기(page);
    await page.waitForTimeout(600);
    await page.click('.vp-bar button[type=submit]');
    await page.waitForTimeout(3500);
    await page.click('.vp-table tbody tr:nth-child(1) td:last-child');
    await page.waitForTimeout(600);
    console.log('  ㄱ 종류 누르기 전 검색칸 숨음 ' + 못(!(await page.evaluate(판값)).검색보임));
    await page.click('.vp-cs등록 [data-k="교환"]');
    await page.waitForTimeout(2500);
    let 판 = await page.evaluate(판값);
    console.log('  ★ ㄱ 교환 → 단품 검색칸 보임 · 위 단품 ' + JSON.stringify(판.위.map((x) => x.글)) + ' ' + 못(판.검색보임 && !판.목록보임 && 판.위.length === 2));
    판 = await 찾기(page, 'r2 TORI');
    console.log('  ★ ㄴ 「r2 TORI」 → ' + JSON.stringify(판.결과.map((x) => x.코드)) + ' (낱말 나눔·대소문자 무시·판매중지 뺌) '
      + 못(판.목록보임 && JSON.stringify(판.결과.map((x) => x.코드)) === '["R2-tori5","R2-tori6"]'));
    console.log('  ★ ㄷ 스크롤 드롭다운 「' + 판.목록스크롤 + '」 ' + 못(/^auto \d+px$/.test(판.목록스크롤)));
    console.log('  ★ ㄷ 결과 = 단품 단추(점 넷·코드) ' + JSON.stringify(판.결과) + ' ' + 못(판.결과.every((x) => x.점 === 4 && x.코드)));
    console.log('  ㄷ 글꼴·통 = 위 단품 단추 ' + JSON.stringify([판.꼴, 판.통]) + ' ' + 못(판.꼴[0] && 판.꼴[0] === 판.꼴[1] && 판.통[0] === 판.통[1]));
    판 = await 찾기(page, '880011');
    console.log('  ㄴ 바코드로도 찾음(단품관리 검색 칸) ' + JSON.stringify(판.결과.map((x) => x.코드)) + ' ' + 못(JSON.stringify(판.결과.map((x) => x.코드)) === '["R2-tori5"]'));
    판 = await 찾기(page, '옛것');
    console.log('  ㄴ 판매중지만 맞으면 「' + 판.목록글 + '」 ' + 못(!판.결과.length && /판매중 단품에서 찾지 못했습니다/.test(판.목록글)));
    판 = await 찾기(page, 'tori');
    const 결과 = (n) => '.vp-cs검색목록 .vp-goods-list:nth-child(' + n + ') > button';
    await page.click(결과(1));
    await page.click(결과(2));
    판 = await page.evaluate(판값);
    console.log('  ★ ㄹ 둘 고름(목록 열린 채) → ' + JSON.stringify(판.상태) + ' ' + 못(판.목록보임
      && 판.상태.단품.map((d) => d.code).join() === 'R2-tori5,R2-tori6' && 판.결과.every((x) => x.고름)));
    /* 오른쪽 누름 → 「상세보기」 → 단품관리 상세 · 고름 그대로 */
    const 막음 = await page.evaluate((q) => { const b = document.querySelector(q); const r = b.getBoundingClientRect();
      const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: r.left + 5, clientY: r.top + 5, button: 2 });
      b.dispatchEvent(e); return e.defaultPrevented; }, 결과(1));
    await page.click('#vp-root .vp-우클릭 button');
    await page.waitForTimeout(1500);
    const 상세 = await page.evaluate(() => [...document.querySelectorAll('.vp-goods-panel')].filter((p) => !p.hidden).map((p) => p.querySelector('strong')?.textContent));
    판 = await page.evaluate(판값);
    console.log('  ★ ㄷ 오른쪽 누름 「상세보기」 → ' + JSON.stringify(상세) + ' · 고름 그대로 ' + 못(막음 && 상세.includes('토리 침대 R2 5') && 판.상태.단품.length === 2));
    await page.evaluate(() => document.querySelectorAll('.vp-goods-panel').forEach((p) => { p.hidden = true; p.style.display = 'none'; }));
    await page.click('.vp-cs단품:not(.vp-cs검색고름) .vp-goods-list:nth-child(1) > button');
    판 = await page.evaluate(판값);
    console.log('  ★ ㄹ 상품 단품과 섞임 → 「' + 판.고른것 + '」 ' + 못(판.상태.단품.map((d) => d.code).join() === 'bis800_b,R2-tori5,R2-tori6'
      && 판.고른것 === '교환 · 비스켓 800 몸통, 토리 침대 R2 5, 토리 침대 R2 6'));
    await page.click('.vp-cs고른것');
    판 = await page.evaluate(판값);
    console.log('  ★ ㄷ 밖 누름 → 목록 닫힘 · 검색으로 고른 것은 아래 같은 단추로 남음 ' + JSON.stringify(판.아래) + ' ' + 못(!판.목록보임
      && JSON.stringify(판.아래.map((x) => x.코드)) === '["R2-tori5","R2-tori6"]' && 판.아래.every((x) => x.고름 && x.점 === 4)));
    await page.click('.vp-cs검색고름 .vp-goods-list:nth-child(1) > button');
    판 = await page.evaluate(판값);
    console.log('  ★ ㄹ 아래 단추 누름 → 풂 ' + JSON.stringify(판.상태.단품.map((d) => d.code)) + ' ' + 못(판.상태.단품.map((d) => d.code).join() === 'bis800_b,R2-tori6'
      && JSON.stringify(판.아래.map((x) => x.코드)) === '["R2-tori6"]'));
    console.log('  ㄹ 저장 단추 켜짐 ' + 못(await page.evaluate(() => !document.querySelector('.vp-cs저장').disabled)));
    console.log('  판이 화면 밖으로 안 나감 ' + 못(!판.넘침));
    await page.focus('.vp-cs단품검색 input');
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(그림칸, 'CS단품검색-' + 폭 + '.png') });
    console.log('  ★ 쓰기 없음 ' + JSON.stringify(쓰기) + ' ' + 못(!쓰기.length));
    await ctx.close();
  }
  if (탈.length) { console.log('  터진 말 ' + JSON.stringify([...new Set(탈)].slice(0, 3))); 빨강++; }
  await b.close();
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  process.exit(빨강 ? 1 : 0);
})();
