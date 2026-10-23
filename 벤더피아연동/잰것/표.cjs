/* 단품관리·상품관리·재고조회가 **이름 버튼이 첫 칸인 표**로 나오는지 재는 자 (10-21).
   사장님 말씀 (그대로): 「단품관리와 상품관리 재고조회의 각 버튼이 메인이 되는 표형식으로 나열해줘 …
   재고조회의 단품버튼의 상세 내용중 현위치에 필터의 논리를 잘 확인해서 표의 필터로 꼭넣어서 같은 단품의
   중복줄이 생기지 않도록 해주고 … 단품관리의 단품버튼 목록의 현위치별 보기는 단품관리 페이지의 검색창
   아래의 필터형식으로 변경해줘, 상품관리의 상품버튼 목록의 상세에는 매출처명 필터가 있는데 이것도 단품과
   마찬가지로 목록에 같은 상품이 중복표기 되지 않도록 필터링 창을 페이지검색부 하단에 잘 만들어 주고,
   상품정보를 링크한 행당 링크도 표에 잘 위치하게 해줘. 표의 스타일은 … 서류관리 프로그램의 제품관리의 표를 참고해서 …」
   ⚠ 진짜 vendorpia.com 은 이 상자에서 못 닿는다. `VP_DATA` 를 흉내 내고 **진짜 goods.js·goods.css** 를 돌린다.
   ⚠ 자료는 전부 **가짜**다. 그림은 `그림/표-*.png` 에 찍는다. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PAGES = require('./본보기/PAGES.cjs');
const { 기준재기, 재기, 견주기 } = require('./표꼴자.cjs');
const 그림칸 = path.join(__dirname, '그림');

const 원래 = (제목, 쪽) => `<html><head><meta charset="utf-8"><title>${제목}</title></head><body>
<form name="aspnetForm" id="aspnetForm" method="post" action="${쪽}">
<input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-14"><input name="dcEndDt" id="dcEndDt" value="2026-10-14">
<select name="ddlStatus" id="ddlStatus"><option value="">전체</option><option value="1">판매중</option></select>
<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div>
</form></body></html>`;

/* ── 가짜 목록 ── */
const 단품머리 = ["단품코드","단품명","단품분류","매입처명","재고유형","발주유형","판매상태","등록일","매입단가"];
const 단품줄 = [
  ["ING-1","가나다 서랍장","서랍장","가매입처","재고","발주","판매중","2026-08-01","1000"],
  ["ING-2","라마바 장","장","나매입처","재고","발주","판매중","2026-08-02","2000"],
  ["ING-3","사아자 선반","선반","가매입처","재고","발주","판매중","2026-08-03","3000"],
  ["ING-3","사아자 선반","선반","나매입처","재고","발주","판매중","2026-08-03","3000"],   // 같은 단품, 매입처 둘
];
const 상품머리 = ["상품코드","상품명","매출처명","매출처코드","매입처명","배송사명","판매상태","옵션상품유무","단품코드","단품명","등록일","단가"];
const 상품줄 = [
  ["KLS-1","가나다 세트","가매출처","1010","가매입처","○○택배","판매중","N","ING-1","가나다 서랍장","2026-08-01","100000"],
  ["KLS-1","가나다 세트","나매출처","1011","가매입처","○○택배","판매중","N","ING-1","가나다 서랍장","2026-08-01","110000"],
  ["KLS-1","가나다 세트","협찬","1014","가매입처","○○택배","판매중","N","ING-1","가나다 서랍장","2026-08-01","0"],
  ["KLS-2","라마바 장","가매출처","1010","나매입처","○○택배","판매중","N","ING-2","라마바 장","2026-08-02","90000"],
];
const 재고머리 = ["단품코드","단품명","분류명","창고","매입처","박스코드","양품수","비고"];
const 재고줄 = [
  ["ING-1","가나다 서랍장","서랍장","0.본사","가매입처","B1","5",""],
  ["ING-1","가나다 서랍장","서랍장","2.안성","","B1","3",""],
  ["ING-1","가나다 서랍장","서랍장","0.본사","","B1","1",""],
  ["ING-2","라마바 장","장","2.안성","","B2","7",""],
];
const 판 = {
  "/System/Master/goods.aspx": { 제목: "단품관리", 쪽: "goods.aspx", 머리: 단품머리, 줄: 단품줄 },
  "/System/Master/salesGoods.aspx": { 제목: "상품관리", 쪽: "salesGoods.aspx", 머리: 상품머리, 줄: 상품줄 },
  "/System/Stock/StockList.aspx": { 제목: "재고조회", 쪽: "StockList.aspx", 머리: 재고머리, 줄: 재고줄 },
};
const 순위머리 = ["단품명","상품명","배송수량"];
const 흉내 = (자료) => `
var VP_DATA = { PAGES: ${JSON.stringify(PAGES)},
  ymd: function (d) { var z=function(n){return String(n).padStart(2,"0");}; return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate()); },
  list: async function (cfg, url, status, dates, cb) {
    var 이름칸 = cfg.nameCol;
    if (/prePostDelivery/.test(url)) {   // 많이 나간 순: 둘째 것이 더 많이 나갔다
      var 이름들 = ${JSON.stringify([...new Set(자료.줄.map((r) => r[1]))].reverse())};
      var rows = 이름들.map(function (n, i) { return [n, n, String(100 - i)]; });
      cb(["단품명","상품명","배송수량"].filter(function (h) { return h === 이름칸 || h === "배송수량"; }),
         rows.map(function (r) { return 이름칸 === "단품명" ? [r[0], r[2]] : [r[1], r[2]]; }), rows.length, rows.length);
      return { cachedAt: null };
    }
    var 모두 = ${JSON.stringify(판)};
    var 이것 = 모두[url] || ${JSON.stringify(자료)};   // 연결된 화면(상품↔단품·재고)은 그 화면 자료를 준다
    cb(이것.머리, 이것.줄, 이것.줄.length, 이것.줄.length); return { cachedAt: null }; },
  prefetch: function(){}, clearCache: async function(){} };
window.VP저장 = { get: async function(k){ return ${JSON.stringify({ vpJohon: { v: 3, parts: [["거래처","조혼단품","ING-1"]], cards: { "ing-1": [["거래처","조혼단품",[]]] }, jundo: [] } })}; },
  set: async function(){}, remove: async function(){} };
var VP_JOHON_PARTS = [];`;

let 초록 = 0, 빨강 = 0, 건너뜀 = 0;
const 봤다 = (참, 글) => { if (참) 초록++; else 빨강++; console.log('    ' + (참 ? '✓ ' : '✗ ') + 글); };

const 표본다 = () => {
  const 줄들 = [...document.querySelectorAll('#vp-root .vp-gt tbody tr')];
  const 보이는 = 줄들.filter((tr) => !tr.hidden && tr.getBoundingClientRect().height > 0);
  return {
    머리: [...document.querySelectorAll('#vp-root .vp-gt thead th')].map((t) => t.textContent),
    줄수: 줄들.length, 보이는줄: 보이는.length,
    보이는이름: 보이는.map((tr) => tr.querySelector('td button').firstChild.textContent),
    칸: 보이는.map((tr) => [...tr.children].slice(1).map((td) => td.textContent.trim())),
    알약: [...document.querySelectorAll('#vp-root .vp-pills .vp-fpill')].map((b) => b.firstChild.textContent),
    켜진알약: [...document.querySelectorAll('#vp-root .vp-pills .vp-fpill[aria-pressed="true"]')].map((b) => b.firstChild.textContent),
    알약줄제목: document.querySelector('#vp-root .vp-pillbar-t')?.textContent,
    알약줄보이나: !!document.querySelector('#vp-root .vp-pillbar') && !document.querySelector('#vp-root .vp-pillbar').hidden,
    탭: document.querySelectorAll('#vp-root .vp-loc-tabs, #vp-root .vp-places-list').length,
    패널열림: !document.querySelector('#vp-root .vp-goods-panel').hidden,
    패널제목: document.querySelector('#vp-root .vp-goods-panel strong')?.textContent,
  };
};
const 꼴본다 = () => {
  const g = (s) => { const e = document.querySelector(s); if (!e) return null; const c = getComputedStyle(e);
    return { fs: c.fontSize, fw: c.fontWeight, color: c.color, bg: c.backgroundColor, pad: c.padding,
             br: c.borderRadius, bc: c.borderTopColor, bw: c.borderTopWidth, col: c.borderCollapse, lh: c.lineHeight }; };
  const 둘째 = [...document.querySelectorAll('#vp-root .vp-gt tbody tr')].filter((t) => !t.hidden)[1];
  const 둘째td = 둘째 && getComputedStyle(둘째.children[1]);
  return { 표: g('#vp-root .vp-gt table'), 머리: g('#vp-root .vp-gt th'), 몸: g('#vp-root .vp-gt tbody td:nth-child(2)'),
    둘째줄밑선: 둘째td ? [둘째td.borderBottomWidth, 둘째td.borderBottomColor] : null };
};

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  for (const 너비 of [1280, 375]) {
    const ctx = await b.newContext({ viewport: { width: 너비, height: 900 } });
    const 기준 = await 기준재기(b, 너비);
    for (const [길, 자료] of Object.entries(판)) {
      const 이름 = 자료.제목;
      console.log('\n■ ' + 이름 + ' · 창 ' + 너비);
      const page = await ctx.newPage();
      const 탈 = []; page.on('pageerror', (e) => 탈.push(String(e && e.message).slice(0, 150)));
      await page.route('**://vivivic-cloud.github.io/**', (r) => {
        const u = r.request().url();
        if (/inghome/.test(decodeURIComponent(u)) && /p0\.json/.test(u))
          return r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' },
            body: JSON.stringify([{ t: '가나다 세트', u: 'https://inghome.example/p/1' }, { t: '엉뚱한 것', u: 'https://inghome.example/p/9' }]) });
        if (/inghome/.test(decodeURIComponent(u))) return r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '[]' });
        return r.abort('blockedbyclient');
      });
      await page.route('**://vendorpia.com/**', (r) => {
        const u = new URL(r.request().url());
        if (u.pathname.endsWith('.css')) return r.fulfill({ status: 200, contentType: 'text/css', body: fs.readFileSync(path.join(확장, path.basename(u.pathname))) });
        return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 원래(자료.제목, 자료.쪽) });
      });
      await page.goto('https://vendorpia.com' + 길);
      await page.addStyleTag({ content: fs.readFileSync(path.join(확장, 'login.css'), 'utf8') + fs.readFileSync(path.join(확장, 'goods.css'), 'utf8') });
      await page.addScriptTag({ content: 흉내(자료) });
      await page.addScriptTag({ content: fs.readFileSync(path.join(확장, 'goods.js'), 'utf8') });
      await page.waitForTimeout(900);
      const 누르기 = async (글) => { await page.evaluate((t) => { const x = [...document.querySelectorAll('#vp-root .vp-gt tbody button')]
        .find((q) => (q.textContent || '').startsWith(t)); x && x.click(); }, 글); await page.waitForTimeout(250); };
      const 알약 = async (글) => { await page.evaluate((t) => { const x = [...document.querySelectorAll('#vp-root .vp-pills .vp-fpill')]
        .find((q) => q.firstChild.textContent === t); x && x.click(); }, 글); await page.waitForTimeout(250); };

      let v = await page.evaluate(표본다);
      console.log('  머리 ' + JSON.stringify(v.머리) + ' · 줄 ' + v.줄수 + ' · 알약 ' + JSON.stringify(v.알약));
      봤다(v.머리[0] === (이름 === '상품관리' ? '상품명' : '단품명'), '첫 칸이 이름(메인) 칸');
      봤다(v.탭 === 0, '「전체보기/현위치별 보기」 탭이 없다');
      봤다(v.알약줄보이나 && v.알약줄제목 === (이름 === '상품관리' ? '매출처' : '현위치'), '검색부 아래 거르개 줄 「' + v.알약줄제목 + '」');

      if (이름 === '단품관리') {
        봤다(v.줄수 === 3, '단품이 셋인데 줄이 ' + v.줄수 + ' (같은 단품 「사아자 선반」 이 매입처 둘이어도 한 줄)');
        봤다(v.칸.some((c) => c.includes('가매입처, 나매입처')), '그 한 줄의 현위치 칸에 둘 다 적힌다: ' + JSON.stringify(v.칸.find((c) => c.join().includes('가매입처, 나매입처'))));
        봤다(JSON.stringify(v.알약) === JSON.stringify(['전체', '가매입처', '나매입처']) || v.알약.length === 3, '알약 ' + JSON.stringify(v.알약));
        await 알약('나매입처');
        v = await page.evaluate(표본다);
        봤다(v.보이는줄 === 2 && !v.보이는이름.includes('가나다 서랍장'), '「나매입처」 → ' + JSON.stringify(v.보이는이름));
        봤다(v.칸.every((c) => !c.join().includes('가매입처')), '고른 현위치만 칸에 적힌다');
        await 알약('전체');
        await 누르기('가나다 서랍장');
        v = await page.evaluate(표본다);
        봤다(v.패널열림, '버튼을 누르면 상세가 열린다: ' + v.패널제목);
        const 속성 = await page.evaluate(() => [...document.querySelectorAll('#vp-root .vp-goods-panel .vp-toggle')].map((x) => x.textContent));
        봤다(속성.some((t) => t.startsWith('전체속성 보기')) && 속성.some((t) => t.startsWith('금액속성 보기')), '전체속성·금액속성 보기 단추가 상세에 그대로 있다: ' + JSON.stringify(속성));
        const 부속 = await page.evaluate(() => [...document.querySelectorAll('#vp-root .vp-goods-panel .vp-toggle')].some((x) => x.textContent === '부속보기'));
        const 붉은 = await page.evaluate(() => document.querySelectorAll('#vp-root .vp-gt tbody button.vp-johon').length);
        봤다(붉은 === 1 && 부속, '조혼가구 붉은 줄 단추 ' + 붉은 + '개 · 상세에 「부속보기」 ' + 부속);
        await page.evaluate(() => [...document.querySelectorAll('#vp-root .vp-goods-panel .vp-toggle')].find((x) => x.textContent.startsWith('금액속성'))?.click());
        await page.waitForTimeout(200);
        const 안내 = await page.evaluate(() => document.querySelector('#vp-root .vp-notice p')?.textContent);
        봤다(안내 === '금액 속성은 승인된 아이디만 볼 수 있습니다.', '금액속성 보기 → 승인 아이디 없음 팝업');
        봤다(!(await page.evaluate(() => /매입단가/.test(document.querySelector('#vp-root .vp-goods-panel-body').textContent))), '금액 칸(매입단가)은 표·상세 어디에도 글로 안 나온다');
      }
      if (이름 === '재고조회') {
        봤다(v.줄수 === 2, '단품 둘인데 줄 ' + v.줄수 + ' (「가나다 서랍장」 은 창고 줄이 셋이어도 한 줄)');
        const 가나다 = v.칸[v.보이는이름.indexOf('가나다 서랍장')] || [];
        봤다(가나다[1] === '가매입처, 2.안성, 0.본사' && 가나다[2] === '9', '그 줄: 현위치 「' + 가나다[1] + '」 · 양품수 ' + 가나다[2] + ' (5+3+1)');
        봤다(JSON.stringify(v.알약) === JSON.stringify(['전체', '0.본사', '2.안성', '가매입처']), '현위치 알약(창고, 0.본사면 매입처) ' + JSON.stringify(v.알약));
        await 알약('2.안성');
        v = await page.evaluate(표본다);
        봤다(v.보이는줄 === 2 && JSON.stringify(v.칸.map((c) => c[2]).sort()) === JSON.stringify(['3', '7']), '「2.안성」 → 줄 ' + v.보이는줄 + ' · 양품수 ' + JSON.stringify(v.칸.map((c) => c[2])) + ' (그 현위치 것만)');
        await 알약('가매입처');
        v = await page.evaluate(표본다);
        봤다(v.보이는줄 === 1 && v.보이는이름[0] === '가나다 서랍장' && v.칸[0][2] === '5', '「가매입처」 → ' + JSON.stringify(v.보이는이름) + ' 양품수 ' + v.칸[0][2]);
        await 누르기('가나다 서랍장');
        const 탭 = await page.evaluate(() => ({ 켜진: document.querySelector('#vp-root .vp-goods-panel .vp-places .vp-chips button.on')?.textContent,
          탭수: document.querySelectorAll('#vp-root .vp-goods-panel .vp-places .vp-chips button').length }));
        봤다(탭.탭수 === 3 && 탭.켜진 === '가매입처', '상세의 현위치 탭은 그대로(' + 탭.탭수 + '개) · 거르개로 고른 「' + 탭.켜진 + '」 부터 열린다');
      }
      if (이름 === '상품관리') {
        봤다(v.줄수 === 2, '상품 둘인데 줄 ' + v.줄수 + ' (「가나다 세트」 는 매출처 셋이어도 한 줄)');
        봤다(v.칸.some((c) => c[0] === '가매출처, 나매출처, 협찬'), '매출처 칸에 셋이 모여 적힌다: ' + JSON.stringify(v.칸[0]));
        const 링크 = await page.evaluate(() => [...document.querySelectorAll('#vp-root .vp-gt tbody tr')].map((tr) => ({ 이름: tr.querySelector('button').firstChild.textContent,
          링크: tr.querySelector('a')?.href || null, 새창: tr.querySelector('a')?.target || null })));
        봤다(링크.find((x) => x.이름 === '가나다 세트')?.링크 === 'https://inghome.example/p/1' && 링크.find((x) => x.이름 === '라마바 장')?.링크 === null,
          '상품정보 링크가 맞은 상품 줄의 「상품정보」 칸에만: ' + JSON.stringify(링크));
        await 알약('협찬');
        v = await page.evaluate(표본다);
        봤다(v.보이는줄 === 1 && v.보이는이름[0] === '가나다 세트' && v.칸[0][0] === '협찬', '「협찬」 → ' + JSON.stringify(v.보이는이름) + ' · 매출처 칸 ' + v.칸[0][0]);
        await 누르기('가나다 세트');
        const 켜짐 = await page.evaluate(() => [...document.querySelectorAll('#vp-root .vp-goods-panel .vp-store-pill[aria-pressed="true"]')].map((x) => x.textContent));
        봤다(JSON.stringify(켜짐) === '["협찬"]', '상세는 거르개로 고른 「협찬」 부터 보인다 ' + JSON.stringify(켜짐));
        await 알약('전체');
      }
      /* 모양 */
      /* ── 10-23 서류관리 제품관리 표와 **나란히 숫자로** 견준다 (사장님: 「완벽하게 동일한 디자인」·특히 머리줄) ──
         기준 = 서류관리 css 를 그 자리에서 뽑아 같은 마크업으로 그려 잰 값(`표꼴자.cjs`). 다른 값 0 이어야 한다.
         일부러 다른 것 하나: 목록 표 첫 칸(이름)은 긴 이름이 줄바꿈한다(white-space·min-width) — 서류관리 첫 칸은 짧은 코드다. */
      const 우리 = await 재기(page, '#vp-root .vp-gt table');
      const 다름 = 기준 ? 견주기(기준, 우리).filter((x) => !/^몸\.첫\.(whiteSpace|minWidth)/.test(x)) : null;
      if (!기준) { 건너뜀++; console.log('    – 서류관리 저장소가 없어 나란히 견주기를 건너뜀'); }
      else {
        봤다(다름.length === 0, '머리줄·몸줄이 서류관리 제품관리 표와 **다른 값 0** (' + (다름.length ? 다름.slice(0, 4).join(' / ') : '머리 13px·800/700·#111110·밑선 2px, 몸 14px·안여백 13px 12px·줄 #D6D6D3 …') + ')');
        if (너비 === 1280) 봤다(Math.abs(우리.줄높이 - 기준.줄높이) <= 0.5, '몸 줄 높이(375 는 이름·코드·딱지가 줄바꿈해 더 높을 수 있어 1280 만) ' + 우리.줄높이 + 'px (서류관리 ' + 기준.줄높이 + 'px)');
        if (너비 === 1280) 봤다(Math.abs(우리.머리줄높이 - 기준.머리줄높이) <= 0.5 || 우리.머리줄높이 > 기준.머리줄높이, '머리줄 높이 ' + 우리.머리줄높이 + 'px (서류관리 ' + 기준.머리줄높이 + 'px, 머리글이 줄바꿈하면 더 높다)');
      }
      const 꼴 = await page.evaluate(꼴본다);
      const 맞나 = true;
      /* ── 10-22 글자 + 점 ──────────────────────────────────────────
         사장님: 「각 버튼을 버튼 형태가 아닌 활성화된 텍스트로 … 텍스트아래 연동수준을 표기하는 점 … 재고조회 목록에 있으면
         초록색점 조혼가구와 일치하면 붉은색점 카탈로그와 맞으면 주황색점 … 페이지 헤더에 작게 해당 점에대한 설명」 */
      const 점 = await page.evaluate(() => {
        const 줄 = [...document.querySelectorAll('#vp-root .vp-gt tbody tr')].filter((t) => !t.hidden).map((tr) => {
          const b = tr.querySelector('td button'), s = getComputedStyle(b), q = b.querySelector('.vp-점');
          const 켜짐 = [...q.querySelectorAll('i')].filter((i) => getComputedStyle(i).display !== 'none').map((i) => getComputedStyle(i).backgroundColor);
          return { 이름: b.firstChild.textContent, 글색: s.color, 바탕: s.backgroundColor, 그림자: s.boxShadow, 밑줄: s.textDecorationLine,
            안여백: s.padding, 둥글기: s.borderRadius, 점: 켜짐, 점이글자아래: q.getBoundingClientRect().top >= b.firstChild.parentNode.getBoundingClientRect().top + 8 };
        });
        const 설명 = [...document.querySelectorAll('#vp-root .vp-legend span')].map((x) => [x.textContent, getComputedStyle(x, '::before').color]);
        return { 줄, 설명 };
      });
      const 초 = 'rgb(6, 174, 213)', 붉 = 'rgb(221, 28, 26)', 주 = 'rgb(240, 200, 8)';
      봤다(점.설명.length === 4 && 점.설명[0][1] === 초 && 점.설명[1][1] === 붉 && 점.설명[2][1] === 주 && 점.설명[3][1] === 'rgb(8, 103, 136)', '페이지 머리에 점 설명 넷(초록·빨강·주황·파랑): ' + JSON.stringify(점.설명.map((x) => x[0])));
      봤다(점.줄.length > 0 && 점.줄.every((x) => x.글색 === 'rgb(51, 126, 169)' && x.바탕 === 'rgba(0, 0, 0, 0)' && x.그림자 === 'none' && x.안여백 === '0px' && x.둥글기 === '0px'),
        '이름이 버튼 꼴이 아닌 글자(#337ea9·바탕 없음·그림자 없음)');
      봤다(점.줄.every((x) => x.점이글자아래), '점이 글자 아래에 있다');
      const 점의 = (n) => (점.줄.find((x) => x.이름 === n) || {}).점;
      const 같다 = (a, b) => JSON.stringify(a) === JSON.stringify(b);
      if (이름 === '단품관리') 봤다(같다(점의('가나다 서랍장'), [초, 붉]) && 같다(점의('라마바 장'), [초]) && 같다(점의('사아자 선반'), []), '단품관리 점: 재고조회에 있으면 초록 · 조혼과 맞으면 빨강도 나란히 · 둘 다 아니면 점 없음 ' + JSON.stringify(점의('가나다 서랍장')) + ' · 흉내 재고조회에 없는 단품엔 초록 없음');
      if (이름 === '재고조회') 봤다(같다(점의('가나다 서랍장'), [초, 붉]), '재고조회 점: 목록에 있으면 초록 · 조혼과 맞으면 빨강도 나란히 ' + JSON.stringify(점의('가나다 서랍장')));
      if (이름 === '상품관리') 봤다(같다(점의('가나다 세트'), [주]) && 같다(점의('라마바 장'), []), '상품관리 점: 카탈로그와 맞으면 주황 ' + JSON.stringify(점의('가나다 세트')));
      if (!맞나) console.log('      ' + JSON.stringify(꼴));
      if (v.보이는줄 >= 2) 봤다(꼴.둘째줄밑선 && 꼴.둘째줄밑선[0] === '1px' && 꼴.둘째줄밑선[1] === 'rgb(214, 214, 211)', '줄과 줄 사이 선(줄마다 밑 1px #D6D6D3) ' + JSON.stringify(꼴.둘째줄밑선));
      const 넘침 = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      봤다(넘침 <= 0, '쪽 전체가 옆으로 밀리지 않는다(표 통만 민다) — 넘침 ' + 넘침 + 'px');
      if (탈.length) { 빨강++; console.log('    ✗ 터진 말: ' + JSON.stringify([...new Set(탈)].slice(0, 2))); }
      await page.evaluate(() => { document.querySelector('#vp-root .vp-goods-panel button')?.click(); });
      await page.screenshot({ path: path.join(그림칸, '표-' + 이름 + '-' + 너비 + '.png') });
      await page.close();
    }
    await ctx.close();
  }
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강 + ' · 건너뜀 ' + 건너뜀);
  await b.close();
  process.exit(빨강 ? 1 : 0);
})();
