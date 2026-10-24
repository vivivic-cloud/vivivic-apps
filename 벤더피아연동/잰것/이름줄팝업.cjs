/* 10-24 새 지시 셋을 재는 자 — 사장님 말씀 (한 글자도 안 고침):
   「배송관리와 cs관리 등 벤더피아의 데이터 목록을 불러올때 목록의 상품명/단품명  단품관리/상품관리에 있는 동일한 기능의 해당 명칭
    버튼이 나타나게 해주세요. 목록의 줄 자체를 클릭했을때는 현재의 상담 버튼 과 동일한 정보가 나타나야 하며 목록의 상품명/단품명
    클릭시에는 단품관리/상품관리/재고관리 의 해당 상품/단품명 처럼 작동해야 합니다. 현재 상담버튼 클릭시 나타나는 팝업화면을
    이동 가능한 팝업화면으로 수정해 주세요.」
   ㄱ) 배송관리·CS등록(주문관리) 표의 상품명 칸 = 상품관리 이름 단추, 단품명 칸 = 단품관리 이름 단추(누르는 글자 + 연동 점)
   ㄴ) 이름 단추를 누르면 그 상세만(상담은 안 열림) · 두 벌의 상세가 겹쳐 안 뜸
   ㄷ) 줄의 다른 곳을 누르면 상담 판
   ㄹ) 상담 판·CS 판 머리를 끌면 움직이고 화면 밖으로 안 나감(마우스·터치) · 375/1280
   ⚠ 진짜 vendorpia.com 은 못 닿는다. 자료는 전부 가짜. 깃허브 주소는 흉내로 세운다(search.js 가 제 주소에서 형제를 부른다). */
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

  for (const 폭 of [1280, 375]) {
    console.log('\n■ 배송관리 · ' + 폭 + 'px  (확장이 goods.js 도 보내는 길 — 불러오기.js 와 같은 차례)');
    const { ctx, page } = await 세우기(폭, 폭 < 500);
    await page.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx');
    await 글넣기(page, true, { 꾸밈: ['login.css', 'goods.css', 'search.css'], 글: ['vp-data.js', 'login.js', 'search.js', 'goods.js'] });
    await page.waitForTimeout(600);
    await page.click('.vp-bar button[type=submit]');
    await page.waitForTimeout(3500);
    const 것 = await page.evaluate(표값);
    console.log('  머리 ' + 것.머리.join(','));
    console.log('  ★ ㄱ 상품명 칸: 단추 ' + 것.상품.filter((x) => x.단추).length + '/2, 글자 그대로 ' + 것.상품.filter((x) => !x.단추).length + '/1 '
      + 못(것.상품.filter((x) => x.단추).length === 2 && !것.상품[2].단추));
    console.log('  ★ ㄱ 단품명 칸: 단추 ' + 것.단품.filter((x) => x.단추).length + '/2, 글자 그대로 ' + 것.단품.filter((x) => !x.단추).length + '/1 '
      + 못(것.단품.filter((x) => x.단추).length === 2 && !것.단품[2].단추) + ' · 코드 ' + JSON.stringify(것.단품[0].코드));
    console.log('  ★ ㄱ 점 넷(연동 점)이 단추마다 있나 ' + 못(것.상품[0].점 === 4 && 것.단품[0].점 === 4));
    console.log('  ★ ㄷ 줄마다 줄 누름 표(vp-줄상담) ' + 것.줄클릭표 + '/' + 것.줄수 + ' ' + 못(것.줄클릭표 === 것.줄수));
    const 꼴 = await page.evaluate(() => {
      const 보 = (s) => { const b = document.querySelector(s); if (!b) return null; const c = getComputedStyle(b); return [c.color, c.backgroundColor, c.padding, c.borderRadius, c.fontSize, c.fontWeight]; };
      return { 상품: 보('.vp-table td.vp-상품칸:not(.vp-단품칸) .vp-goods-list button'), 단품: 보('.vp-table td.vp-단품칸 .vp-goods-list button') };
    });
    console.log('  ★ 누르는 글자 꼴(단품관리 표 첫 칸과 같음: 글색 #337ea9·바탕 없음·안여백 0·14px·700) 상품 ' + JSON.stringify(꼴.상품) + ' 단품 ' + JSON.stringify(꼴.단품)
      + ' ' + 못(JSON.stringify(꼴.상품) === JSON.stringify(꼴.단품) && 꼴.상품[0] === 'rgb(51, 126, 169)' && 꼴.상품[1] === 'rgba(0, 0, 0, 0)' && 꼴.상품[2] === '0px' && 꼴.상품[4] === '14px' && 꼴.상품[5] === '700'));
    await page.screenshot({ path: path.join(그림칸, '이름줄-표-' + 폭 + '.png') });

    /* ㄴ 단품 이름 단추 → 단품 상세만 */
    await page.click('.vp-table tbody tr:nth-child(1) td.vp-단품칸 button');
    await page.waitForTimeout(500);
    let 판 = await page.evaluate(열린판);
    console.log('  ★ ㄴ 단품명 단추 누름 → 상세 ' + JSON.stringify(판.상세) + ' · 상담 ' + 판.상담 + ' ' + 못(판.상세.length === 1 && 판.상세[0] === '비스켓 800 몸통' && !판.상담 && 판.검은 === 1));
    const 단품상세줄 = await page.evaluate(() => [...document.querySelectorAll('.vp-goods-panel:not([hidden]) dl')].length);
    console.log('    단품 상세 줄 ' + 단품상세줄 + '개(단품관리 상세와 같은 `detailFields`) ' + 못(단품상세줄 >= 1));
    await page.screenshot({ path: path.join(그림칸, '이름줄-단품상세-' + 폭 + '.png') });
    /* 상품 이름 단추 → 상품 상세, 단품 상세는 닫힘(겹쳐 안 뜸), 검은 단추 하나 */
    await page.keyboard.press('Escape'); await page.waitForTimeout(200);
    await page.click('.vp-table tbody tr:nth-child(1) td.vp-상품칸:not(.vp-단품칸) button');
    await page.waitForTimeout(500);
    판 = await page.evaluate(열린판);
    console.log('  ★ ㄴ 상품명 단추 누름 → 상세 ' + JSON.stringify(판.상세) + ' · 상담 ' + 판.상담 + ' ' + 못(판.상세.length === 1 && 판.상세[0] === '비스켓 800 주방수납장' && !판.상담 && 판.검은 === 1));
    /* 상세를 연 채로 다른 벌(단품) 단추 → 앞의 것이 닫히고 하나만 */
    if (폭 > 500) {
      await page.click('.vp-table tbody tr:nth-child(2) td.vp-단품칸 button');
      await page.waitForTimeout(500);
      판 = await page.evaluate(열린판);
      console.log('  ★ ㄴ 상품 상세가 열린 채 단품 단추 → 하나만 열림 ' + JSON.stringify(판.상세) + ' · 검은 단추 ' + 판.검은 + ' ' + 못(판.상세.length === 1 && 판.상세[0] === '비스켓 1200 몸통' && 판.검은 === 1));
    }
    await page.keyboard.press('Escape'); await page.waitForTimeout(250);

    /* ㄷ 줄의 다른 곳 → 상담 판 */
    await page.click('.vp-table tbody tr:nth-child(2) td:last-child');
    await page.waitForTimeout(600);
    판 = await page.evaluate(열린판);
    console.log('  ★ ㄷ 줄의 다른 곳(끝 칸)을 누름 → 상담 판 「' + 판.상담 + '」 · 상세 ' + JSON.stringify(판.상세)
      + ' ' + 못(판.상담 === '비스켓 1200 주방수납장' && 판.상세.length === 0));
    /* ㄹ 끌기 */
    const 앞 = await page.evaluate(자리, '.vp-상담판');
    const 머리자리 = await page.evaluate(() => { const r = document.querySelector('.vp-상담판 .vp-상담머리 strong').getBoundingClientRect(); return { x: r.left + 4, y: r.top + r.height / 2 }; });
    await page.mouse.move(머리자리.x, 머리자리.y); await page.mouse.down();
    await page.mouse.move(머리자리.x + 60, 머리자리.y + 70, { steps: 6 }); await page.mouse.up();
    const 뒤 = await page.evaluate(자리, '.vp-상담판');
    const 움직인 = 폭 > 500 ? (Math.abs(뒤.x - 앞.x - 60) <= 2 && Math.abs(뒤.y - 앞.y - 70) <= 2) : (Math.abs(뒤.y - 앞.y - 70) <= 2 || 뒤.y > 앞.y);
    console.log('  ★ ㄹ 머리를 잡고 끌었다 (+60,+70) → 자리 (' + Math.round(앞.x) + ',' + Math.round(앞.y) + ') → (' + Math.round(뒤.x) + ',' + Math.round(뒤.y) + ') ' + 못(움직인) + ' · 위치 ' + 뒤.위치);
    /* 화면 밖으로 끌어 봐도 안 나감 */
    const 현재머리 = await page.evaluate(() => { const r = document.querySelector('.vp-상담판 .vp-상담머리 strong').getBoundingClientRect(); return { x: r.left + 4, y: r.top + r.height / 2 }; });
    for (const [dx, dy] of [[-3000, -3000], [3000, 3000], [3000, -3000]]) {
      await page.mouse.move(현재머리.x, 현재머리.y); await page.mouse.down();
      await page.mouse.move(Math.min(Math.max(현재머리.x + dx, 1), 폭 - 1), Math.min(Math.max(현재머리.y + dy, 1), 899), { steps: 4 });
      await page.mouse.move(현재머리.x + dx / 3, 현재머리.y + dy / 3); await page.mouse.up();
      const r = await page.evaluate(자리, '.vp-상담판');
      const 안 = r.x >= -0.5 && r.y >= -0.5 && r.x + r.w <= 폭 + 0.5 && r.y + r.h <= 900 + 0.5;
      console.log('    화면 밖으로 끌기 (' + dx + ',' + dy + ') → (' + Math.round(r.x) + ',' + Math.round(r.y) + ') ' + Math.round(r.w) + '×' + Math.round(r.h) + ' ' + 못(안));
      const 다시 = await page.evaluate(() => { const r = document.querySelector('.vp-상담판 .vp-상담머리 strong').getBoundingClientRect(); return { x: r.left + 4, y: r.top + r.height / 2 }; });
      현재머리.x = 다시.x; 현재머리.y = 다시.y;
    }
    /* 터치(포인터 이벤트 pointerType=touch) */
    const 터치앞 = await page.evaluate(자리, '.vp-상담판');
    const 터치결과 = await page.evaluate(() => {
      const 머리 = document.querySelector('.vp-상담판 .vp-상담머리'), r = 머리.getBoundingClientRect();
      const x = r.left + 10, y = r.top + r.height / 2;
      const 쏘기 = (종류, dx, dy) => 머리.dispatchEvent(new PointerEvent(종류, { pointerId: 7, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x + dx, clientY: y + dy, button: 0 }));
      쏘기('pointerdown', 0, 0); 쏘기('pointermove', 20, 30); 쏘기('pointermove', 40, 60); 쏘기('pointerup', 40, 60);
      const p = document.querySelector('.vp-상담판').getBoundingClientRect();
      return { x: p.left, y: p.top, 머리touchAction: getComputedStyle(머리).touchAction };
    });
    console.log('  ★ ㄹ 터치로 끌기 (+40,+60) → 자리 (' + Math.round(터치앞.x) + ',' + Math.round(터치앞.y) + ') → (' + Math.round(터치결과.x) + ',' + Math.round(터치결과.y) + ') touch-action ' + 터치결과.머리touchAction + ' '
      + 못(터치결과.머리touchAction === 'none' && (터치결과.x !== 터치앞.x || 터치결과.y !== 터치앞.y)));
    await page.screenshot({ path: path.join(그림칸, '이름줄-상담끌기-' + 폭 + '.png') });
    /* 닫기 단추는 끌기가 아니다 */
    await page.click('.vp-상담판 .vp-상담닫기');
    console.log('  ★ 머리 안의 닫기 단추는 그대로 닫는다 ' + 못(!(await page.evaluate(열린판)).상담));

    /* CS 판 (#vgCS) */
    await page.evaluate(() => { location.hash = '#vgCS'; });
    await page.waitForSelector('.vp-cs판', { timeout: 4000 });
    await page.fill('.vp-cs찾기 input', '가나다'); await page.click('.vp-cs찾기 button[type=submit]');
    await page.waitForSelector('.vp-cs결과 .vp-cs찾은', { timeout: 5000 });
    await page.waitForTimeout(500);
    const cs = await page.evaluate(() => [...document.querySelectorAll('.vp-cs결과 .vp-cs찾은')].map((r) => ({ 단추: !!r.querySelector('strong .vp-goods-list button'), 글: r.querySelector('strong')?.textContent })));
    console.log('  ★ ㄱ CS 검색 결과 줄의 상품명 → 이름 단추 ' + JSON.stringify(cs.map((x) => x.단추)) + ' ' + 못(cs.length === 3 && cs[0].단추 && cs[1].단추 && !cs[2].단추));
    await page.screenshot({ path: path.join(그림칸, '이름줄-CS판-' + 폭 + '.png') });
    await page.click('.vp-cs결과 .vp-cs찾은:nth-child(2) strong button');
    await page.waitForTimeout(500);
    판 = await page.evaluate(열린판);
    console.log('  ★ ㄴ CS 결과의 상품명 단추 → 상품 상세 ' + JSON.stringify(판.상세) + ' · CS판 그대로 ' + 판.CS판 + ' · 상담 ' + 판.상담 + ' ' + 못(판.상세.length === 1 && 판.상세[0] === '비스켓 800 주방수납장' && 판.CS판 && !판.상담));
    await page.click('.vp-goods-panel:not([hidden]) .vp-goods-panel-head button'); await page.waitForTimeout(200);
    /* CS 판 끌기 */
    const cs앞 = await page.evaluate(자리, '.vp-cs판');
    const cs머리 = await page.evaluate(() => { const r = document.querySelector('.vp-cs판 .vp-상담머리 strong').getBoundingClientRect(); return { x: r.left + 4, y: r.top + r.height / 2 }; });
    await page.mouse.move(cs머리.x, cs머리.y); await page.mouse.down(); await page.mouse.move(cs머리.x + 50, cs머리.y + 40, { steps: 5 }); await page.mouse.up();
    const cs뒤 = await page.evaluate(자리, '.vp-cs판');
    console.log('  ★ ㄹ CS등록 판도 끌린다 (+50,+40) → (' + Math.round(cs앞.x) + ',' + Math.round(cs앞.y) + ') → (' + Math.round(cs뒤.x) + ',' + Math.round(cs뒤.y) + ') ' + 못(cs뒤.y > cs앞.y || cs뒤.x > cs앞.x));
    /* CS 결과 줄의 다른 곳 → 상담 판 */
    console.log('    (살핌) ' + JSON.stringify(await page.evaluate(() => { const e = document.querySelector('.vp-cs결과 .vp-cs찾은:nth-child(3) > small'); if (!e) return 'small 없음'; const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.left + 5, r.top + r.height / 2); return [Math.round(r.left), Math.round(r.top), t && t.className, t && t.tagName]; })));
    await page.click('.vp-cs결과 .vp-cs찾은:nth-child(3) > small');
    await page.waitForTimeout(600);
    판 = await page.evaluate(열린판);
    console.log('  ★ ㄷ CS 결과 줄의 다른 곳(작은 글) → 상담 판 「' + 판.상담 + '」 · CS판 닫힘 ' + !판.CS판 + ' ' + 못(판.상담 === '비스켓 1200 주방수납장' && !판.CS판));
    await ctx.close();
  }

  /* CS등록 화면(주문관리)은 10-24 에 목록만 보이는 것으로 다시 시작 — 이름 단추·줄 클릭 상담을 일부러 안 건다(`주문관리CS.cjs` 가 잰다) */

  console.log('\n  쪽 오류 ' + 탈.length + '건 ' + 못(탈.length === 0) + (탈.length ? ' ' + JSON.stringify(탈.slice(0, 3)) : ''));
  await b.close();
  console.log('\n★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  process.exit(빨강 ? 1 : 0);
})();
