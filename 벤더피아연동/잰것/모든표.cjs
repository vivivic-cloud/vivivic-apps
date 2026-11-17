/* 11-17 [새 지시 모든표 통일] — 단품관리·상품관리·재고조회 목록이 배송관리와 같은 표(`table.vp-촘촘`, 공용 `VP표`)로,
   칸은 원래 화면이 보이는 칸 그대로(`PAGES[…].원래칸`) + 덧칸으로 그려지는지 잰다. 자료는 전부 지어낸 값.
   돌리기: NODE_PATH=<playwright-core 있는 node_modules> VP_EXE=<크로미움> node 잰것/모든표.cjs */
let pw; try { pw = require('playwright'); } catch (e) { pw = require('playwright-core'); }
const { chromium } = pw;
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = process.env.VP_EXE || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PAGES = require('./본보기/PAGES.cjs');
let 초록 = 0, 빨강 = 0;
const 봤다 = (참, 글) => { if (참) 초록++; else 빨강++; console.log('    ' + (참 ? '✓ ' : '✗ ') + 글); };

const 원래 = (제목, 쪽) => `<html><head><meta charset="utf-8"><title>${제목}</title></head><body>
<form name="aspnetForm" id="aspnetForm" method="post" action="${쪽}"><input type="hidden" name="__VIEWSTATE" value="x">
<input name="dcStartDt" id="dcStartDt" value="2026-07-14"><input name="dcEndDt" id="dcEndDt" value="2026-10-14">
<select name="ddlStatus" id="ddlStatus"><option value="">전체</option><option value="1">판매중</option></select><input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div></form></body></html>`;
/* 받은 자료 머리 = 원래칸 사이에 숨은 칸을 섞어 둔다(원래 화면처럼) */
const 자료짓기 = (길, 숨은, 몇이름, 이름당줄) => {
  const 원 = PAGES[길].원래칸;
  const 머리 = [...원.slice(0, 2), ...숨은, ...원.slice(2)];
  const 줄 = [];
  for (let n = 0; n < 몇이름; n++) for (let k = 0; k < 이름당줄; k++)
    줄.push(머리.map((h, i) => h === PAGES[길].nameCol ? `지어낸이름${n}` : h === PAGES[길].codeCol ? `CODE-${n}` :
      h === '양품수' ? String(k + 1) : h === '등록일' ? '2026-08-0' + (k + 1) : h === '창고' ? (k ? '2.안성' : '0.본사') : `${h}값${n}-${k}`));
  return { 머리, 줄 };
};
const 판 = {
  '/System/Master/goods.aspx': { 제목: '단품관리', 쪽: 'goods.aspx', ...자료짓기('/System/Master/goods.aspx', ['수도권선불비', 'Page'], 60, 2) },
  '/System/Master/salesGoods.aspx': { 제목: '상품관리', 쪽: 'salesGoods.aspx', ...자료짓기('/System/Master/salesGoods.aspx', ['매출처코드', '모델번호'], 60, 3) },
  '/System/Stock/StockList.aspx': { 제목: '재고조회', 쪽: 'StockList.aspx', ...자료짓기('/System/Stock/StockList.aspx', ['재고번호', '박스코드'], 60, 2) },
};
const 흉내 = (자료) => `
var VP_DATA = { PAGES: ${JSON.stringify(PAGES)},
  ymd: function (d) { var z=function(n){return String(n).padStart(2,"0");}; return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate()); },
  list: async function (cfg, url, status, dates, cb) {
    if (/prePostDelivery/.test(url)) { var rows = []; for (var n = 0; n < 60; n++) rows.push(["지어낸이름" + n, String(100 - n)]);
      cb([cfg.nameCol, "배송수량"], rows, rows.length, rows.length); return { cachedAt: null }; }
    var 모두 = ${JSON.stringify(판)}; var 이것 = 모두[url] || ${JSON.stringify(자료)};
    cb(이것.머리, 이것.줄, 이것.줄.length, 이것.줄.length); return { cachedAt: null }; },
  prefetch: function(){}, clearCache: async function(){} };
window.VP저장 = { get: async function(){ return {}; }, set: async function(){}, remove: async function(){} };`;
const vp데이터 = fs.readFileSync(path.join(확장, 'vp-data.js'), 'utf8').replace(/^const VP_DATA = /m, 'const VP_DATA_진짜 = ');

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  for (const 너비 of [1280, 375]) {
    for (const [길, 자료] of Object.entries(판)) {
      console.log('\n■ ' + 자료.제목 + ' · 창 ' + 너비);
      const ctx = await b.newContext({ viewport: { width: 너비, height: 900 } });
      const page = await ctx.newPage();
      const 탈 = []; page.on('pageerror', (e) => 탈.push(String(e && e.message).slice(0, 150)));
      await page.route('**://vivivic-cloud.github.io/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '[]' }));
      await page.route('**://firestore.googleapis.com/**', (r) => r.abort());
      await page.route('**://vendorpia.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 원래(자료.제목, 자료.쪽) }));
      await page.goto('https://vendorpia.com' + 길);
      await page.addStyleTag({ content: fs.readFileSync(path.join(확장, 'login.css'), 'utf8') + fs.readFileSync(path.join(확장, 'goods.css'), 'utf8') });
      await page.addScriptTag({ content: 흉내(자료) });
      await page.addScriptTag({ content: vp데이터 });
      await page.addScriptTag({ content: fs.readFileSync(path.join(확장, 'goods.js'), 'utf8') });
      await page.waitForTimeout(1500);
      const 원 = PAGES[길].원래칸, 덧 = (PAGES[길].덧칸 || []).map((d) => d.name);
      let v = await page.evaluate(() => {
        const t = document.querySelector('#vp-root .vp-목록표 table.vp-촘촘');
        if (!t) return { 표없음: true };
        const th = t.tHead.rows[0].cells, 줄 = [...t.querySelectorAll('tbody:not([hidden]) tr')];
        const s = getComputedStyle(th[1]), d = 줄[0] && getComputedStyle(줄[0].cells[1]);
        return { 머리: [...th].map((c) => c.firstChild.textContent), 줄수: 줄.length, 묶음: t.querySelectorAll('tbody:not([hidden])').length,
          첫줄: 줄[0] && [...줄[0].cells].map((c) => c.textContent), 둘째줄단추: 줄[1] && !!줄[1].querySelector('button'),
          머리꼴: [s.fontSize, s.fontWeight, s.backgroundColor, s.textAlign, s.position, Math.round(th[1].getBoundingClientRect().height)],
          몸꼴: d && [d.fontSize, d.lineHeight, d.padding, d.borderRight, d.whiteSpace, Math.round(줄[0].getBoundingClientRect().height)],
          첫칸붙음: getComputedStyle(th[0]).position + '/' + (줄[0] && getComputedStyle(줄[0].cells[0]).position),
          손: t.querySelectorAll('.vp-열손').length, 표layout: getComputedStyle(t).tableLayout,
          통: (() => { const g = t.closest('.vp-표통'); return [getComputedStyle(g).overflowX, g.scrollWidth > g.clientWidth]; })(),
          쪽가로: document.documentElement.scrollWidth - innerWidth };
      });
      봤다(!v.표없음, '표가 vp-촘촘 ' + 탈.join(' | ') + ' ' + (await page.evaluate(() => document.body.innerHTML.slice(0, 300))));
      if (v.표없음) { await ctx.close(); continue; }
      봤다(JSON.stringify(v.머리) === JSON.stringify([...원, ...덧]), `칸 = 원래칸 ${원.length} + 덧칸 ${덧.length} (${v.머리.length})`);
      봤다(v.묶음 === 50, '첫 화면 많이 나간 순 50 묶음: ' + v.묶음);
      const 이름자리 = 원.indexOf(PAGES[길].nameCol);
      봤다(v.첫줄 && v.첫줄[이름자리].startsWith('지어낸이름0'), '이름 칸에 단추(첫 줄)');
      봤다(v.첫줄 && v.첫줄.slice(0, 원.length).every((x, i) => i === 이름자리 || x === (원[i] === PAGES[길].codeCol ? 'CODE-0' : x)), '값 = 받은 줄 그대로');
      봤다(v.둘째줄단추 === false, '같은 이름 둘째 줄은 단추 없음(글자)');
      봤다(JSON.stringify(v.머리꼴) === JSON.stringify(['11px', '700', 'rgb(245, 245, 245)', 'center', 'sticky', 25]), '머리 꼴 ' + v.머리꼴);
      봤다(JSON.stringify(v.몸꼴) === JSON.stringify(['11px', '20px', '2px 3px', '1px solid rgb(192, 192, 192)', 'nowrap', 25]), '몸 꼴 ' + v.몸꼴);
      봤다(v.첫칸붙음 === 'sticky/sticky' && v.손 === v.머리.length && v.표layout === 'fixed', '첫 칸 붙음·끌개·fixed ' + v.첫칸붙음 + ' ' + v.손);
      봤다(v.통[0] === 'auto' && v.쪽가로 <= 0, '표 안 가로 스크롤만 (쪽 가로 ' + v.쪽가로 + ', 통 넘침 ' + v.통[1] + ')');
      if (PAGES[길].nameCol === '상품명') 봤다(['매입금액', '수도선불비', '판매금액'].every((h) => v.머리.includes(h)), '상품관리 금액·배송비 칸 보임');
      // 끌기 → 저장
      const 손 = await page.evaluate(() => { const r = document.querySelectorAll('#vp-root .vp-열손')[1].getBoundingClientRect(); return [r.x + 3, r.y + 10]; });
      await page.mouse.move(손[0], 손[1]); await page.mouse.down(); await page.mouse.move(손[0] + 60, 손[1], { steps: 4 }); await page.mouse.up();
      const 저장 = await page.evaluate((k) => localStorage.getItem(k), 'vp열넓이:' + 자료.제목);
      봤다(!!저장 && Object.keys(JSON.parse(저장)).length === 1, '끌어 넓힌 칸 기억 ' + 저장);
      // 단추 누름 → 상세
      await page.evaluate(() => document.querySelector('#vp-root .vp-목록표 tbody:not([hidden]) button').click());
      await page.waitForTimeout(300);
      봤다(await page.evaluate(() => !document.querySelector('#vp-root .vp-goods-panel').hidden), '단추 누르면 상세 창');
      // 검색 → 묶음 안 맞는 줄만
      await page.fill('#vp-root .vp-q', `값7-1`);
      await page.waitForTimeout(300);
      v = await page.evaluate(() => [...document.querySelectorAll('#vp-root .vp-목록표 tbody:not([hidden]) tr')].length);
      봤다(v === 1, '검색하면 맞는 줄만: ' + v);
      if (너비 === 1280) await page.screenshot({ path: path.join(__dirname, '그림', '모든표-' + 자료.제목 + '.png') });
      봤다(!탈.length, '쪽 오류 없음 ' + 탈.join(' | '));
      await ctx.close();
    }
  }
  await b.close();
  console.log(`\n초록 ${초록} · 빨강 ${빨강}`);
  process.exit(빨강 ? 1 : 0);
})();
