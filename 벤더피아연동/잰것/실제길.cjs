/* 0.34.53 의 **실제 싣는 길(bg.js → MAIN 인라인)** 로 이름 단추·줄 클릭·끌기를 재는 자 (10-25 「이미 34.53 이야」).
   진짜 크롬에 이 폴더를 확장으로 올리고, 깃허브는 이 폴더 파일을 내주는 흉내, vendorpia.com 은 가짜 https 서버. 자료는 전부 가짜. */
const { chromium } = require('playwright');
const fs = require('fs'), os = require('os'), path = require('path'), https = require('https'), { execSync } = require('child_process');
const 확장 = path.join(__dirname, '..');
const EXE = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'].find((p) => fs.existsSync(p));
let 초록 = 0, 빨강 = 0; const POST기록 = [];
const 맞나 = (이름, 참, 덧 = '') => { console.log((참 ? '  🟩 ' : '  🟥 ') + 이름 + (덧 ? '  ' + 덧 : '')); 참 ? 초록++ : 빨강++; };
const 표 = (머리, 줄) => `<html><body><span>총 ${줄.length} 건</span><table><tr>${머리.map(h=>`<th>${h}</th>`).join('')}</tr>${줄.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</table></body></html>`;
const 상품머리 = ["상품명","상품코드","매출처명","매입처명","배송사명","판매상태","단품명","단품코드","모델번호","매출처상품명","옵션상품유무","등록일"];
/* 10-25: 상품관리 목록(등록 2026-01·03·08 — 배송 조회 기간 07-15~10-15 밖이 많다)이 배송목록의 상품보다 **더 많다** → 서버가 등록기간을 지켜 거른다 */
const 상품들 = [["비스켓 800 주방수납장","KLS-800","가매출처","가매입처","경동택배(포천)","판매중","비스켓 800 몸통","bis800_b","M-800","비스켓800","N","2026-01-05"],
  ["카비 3단 와이드 서랍장_블랙","CAB-3B","가매출처","가매입처","경동택배(포천)","판매중","카비 서랍 몸통","cab_body","M-C","카비","N","2026-03-02"],
  ["오래된 협탁 화이트","OLD-T","가매출처","가매입처","경동택배(포천)","판매중","협탁 몸통","old_t","M-O","협탁","N","2026-01-20"],
  ["신상 책장 5단","NEW-B5","가매출처","가매입처","경동택배(포천)","판매중","책장 몸통","new_b","M-N","책장","N","2026-08-10"],
  ["한글 테스트 상품 A","KT-A","가매출처","가매입처","경동택배(포천)","판매중","단품 가","dj_ga","M-K","가","N","2026-02-02"]];
const 단품머리 = ["단품명","단품코드","단품분류","매입처명","재고유형","발주유형","판매상태","바코드","등록일"];
const 단품들 = [["비스켓 800 몸통","bis800_b","수납장","가매입처","재고","정상","판매중","880001","2026-01-05"],
  ["카비 서랍 몸통","cab_body","서랍장","가매입처","재고","정상","판매중","880002","2026-03-02"],
  ["보상 선불 정산용","bosang_01","기타","가매입처","재고","정상","판매중","880003","2026-03-03"],
  ["협탁 몸통","old_t","협탁","가매입처","재고","정상","판매중","880004","2026-01-20"],
  ["책장 몸통","new_b","책장","가매입처","재고","정상","판매중","880005","2026-08-10"],
  ["옛 다리 (사용안함)","old_leg","다리","가매입처","재고","정상","판매중","880006","2025-02-02"]];
const 배송머리 = ["주문번호","상품명","단품명","단품코드","수취인","수량","배송사","송장번호","배송상태","CS구분","매출처"];
/* 둘째 줄: 상품명이 상품관리엔 3월 등록(기간 밖) · 단품명이 단품관리와 다르게 적혔지만 단품코드는 맞음 · 셋째: 둘 다 상품관리에 없는 이름 */
const 배송줄 = [["20261015-1","비스켓 800 주방수납장","비스켓 800 몸통","bis800_b","가나다","1","경동택배(포천)","640001","배송완료","","가매출처"],
  ["20261015-2","카비 3단 와이드 서랍장_블랙","보상 선불 정산용","bosang_01","라마바","1","경동택배(포천)","640002","배송완료","","가매출처"],
  ["20261015-3","오래된  협탁 화이트","협탁  몸통 (코드만 맞음)","old_t","사아자","1","경동택배(포천)","640003","배송완료","","가매출처"],
  ["20261015-4","신상 책장 5단","옛 다리 (사용안함)","old_leg","차카타","1","경동택배(포천)","640004","배송완료","","가매출처"],
  ["20261015-5","없는 상품 Z","없는 단품 Z","zzz_none","파하갸","1","경동택배(포천)","640005","배송완료","","가매출처"]];
const 보임 = ["주문번호","상품명","단품명","수취인","수량"];
const 머리69 = Array.from({ length: 66 }, (_, i) => i < 5 ? 보임[i] : '숨김' + i);
const 주문그리드 = `<div id="oGrid"><table><tr>${머리69.map((h, i) => `<th class="igg_HeaderCaption"${i < 5 ? '' : ' style="display:none"'}>${h}</th>`).join('')}</tr></table><table><tr><th><div><table><tbody>
<tr>${머리69.map((h, i) => `<td${i < 5 ? '' : ' style="display:none"'}>${['20261015-1','비스켓 800 주방수납장','비스켓 800 몸통','가나다','1'][i] || 'x'}</td>`).join('')}</tr></tbody></table></div></th></tr></table></div>`;
const 주문쪽 = `<html><head><meta charset="utf-8"></head><body id="body"><form name="f" method="post" action="/System/Sales/orderMst.aspx" id="f"><input type="hidden" name="__VIEWSTATE" value="x"><input name="dcStartDt" value="2026-09-25"><input name="dcEndDt" value="2026-10-25"><input type="image" name="btnSearch" id="btnSearch" src="s.gif"></form>${주문그리드}</body></html>`;
const 행수 = '<select name="ddlRowCnt" id="ddlRowCnt"><option value="50">50</option></select>';
const 쪽 = (제목, 액션, 칸들) => `<html><head><meta charset="utf-8"><title>${제목}</title></head><body id="body"><form name="aspnetForm" method="post" action="${액션}" id="aspnetForm"><input type="hidden" name="__VIEWSTATE" value="x"><input name="dcStartDt" id="dcStartDt" value="2026-07-15"><input name="dcEndDt" id="dcEndDt" value="2026-10-15">${칸들}<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div></form></body></html>`;

(async () => {
  const d0 = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-cert-'));
  execSync(`openssl req -x509 -newkey rsa:2048 -nodes -keyout ${d0}/k.pem -out ${d0}/c.pem -days 2 -subj "/CN=vendorpia.com" 2>/dev/null`);
  const 서버 = https.createServer({ key: fs.readFileSync(d0 + '/k.pem'), cert: fs.readFileSync(d0 + '/c.pem') }, (q, r) => {
    const 길 = q.url.split('?')[0]; r.setHeader('content-type', 'text/html; charset=utf-8');
    if (q.method === 'POST' && 길.includes('orderMst')) { q.resume(); return r.end('<html><body>' + 주문그리드 + '</body></html>'); }
    if (q.method === 'POST') {
      let 몸 = ''; q.on('data', (c) => { 몸 += c; }); q.on('end', () => {
        const 값 = (n) => (몸.match(new RegExp('name="' + n + '"\\r\\n\\r\\n([^\\r]*)')) || [])[1] || '';
        const 부터 = 값('dcStartDt') || '0000', 까지 = 값('dcEndDt') || '9999';
        POST기록.push(길.split('/').pop() + ' ' + 부터 + '~' + 까지);
        const 거름 = (줄들, i) => 줄들.filter((x) => x[i] >= 부터 && x[i] <= 까지);
        r.end(길.includes('salesGoods') ? 표(상품머리, 거름(상품들, 11)) : 길.includes('/Master/goods') ? 표(단품머리, 단품들) : 표(배송머리, 배송줄));
      }); return;
    }
    if (길.includes('orderMst')) return r.end(주문쪽);
    if (길.includes('salesGoods')) return r.end(쪽('상품관리', '/System/Master/salesGoods.aspx', 행수 + '<input name="tbSGoodsCd"><input name="tbGoodsNm">'));
    if (길.includes('/Master/goods')) return r.end(쪽('단품관리', '/System/Master/goods.aspx', 행수 + '<input name="tbGoodsCd"><input name="tbGoodsNm">'));
    if (길.includes('firmDvList')) return r.end(쪽('배송목록조회', '/System/Delivery/firmDvList.aspx', '<select name="ddlDStatus" id="ddlDStatus"><option value="">전체</option></select>' + 행수));
    r.end('<html><body>x</body></html>');
  }).listen(8443);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-ext-'));
  const ctx = await chromium.launchPersistentContext(dir, { executablePath: EXE, headless: false, ignoreDefaultArgs: ['--disable-extensions'], ignoreHTTPSErrors: true,
    env: { ...process.env, LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8' },
    args: ['--headless=new', '--no-sandbox', '--no-proxy-server', '--host-resolver-rules=MAP vendorpia.com 127.0.0.1:8443, MAP www.vendorpia.com 127.0.0.1:8443',
      '--disable-extensions-except=' + 확장, '--load-extension=' + 확장] });
  await new Promise((r) => setTimeout(r, 2000));
  await ctx.route('**://identitytoolkit.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"idToken":"x"}' }));
  await ctx.route('**://firestore.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}', headers: { 'access-control-allow-origin': '*' } }));
  await ctx.route('**://vivivic-cloud.github.io/**', (r) => {
    const 이름 = decodeURIComponent(new URL(r.request().url()).pathname.split('/').pop()), 자리 = path.join(확장, 이름);
    if (!fs.existsSync(자리)) return r.fulfill({ status: 404, body: 'x' });
    return r.fulfill({ status: 200, headers: { 'content-type': 이름.endsWith('.css') ? 'text/css' : 'text/javascript', 'access-control-allow-origin': '*' }, body: fs.readFileSync(자리, 'utf8') });
  });
  const 오류 = [];
  const 화면 = async (길, 조회) => {
    const p = await ctx.newPage(); p.on('pageerror', (e) => 오류.push(String(e).slice(0, 160)));
    p.on('console', (m) => { if (/VP|상품단추|단품단추/.test(m.text())) console.log('   [콘솔]', m.text().slice(0, 140)); });
    await p.goto('https://vendorpia.com' + 길); await p.waitForTimeout(5000);
    if (조회) { await p.click('.vp-bar button[type=submit]'); await p.waitForTimeout(3500); }
    return p;
  };
  console.log('\n■ 배송관리 (실제 길)');
  const p = await 화면('/System/Delivery/firmDvList.aspx', true);
  console.log('   딱지:', await p.evaluate(() => (document.getElementById('vp-판') || {}).textContent));
  const 본 = await p.evaluate(() => ({ 상품단추: !!window.VP상품단추, 단품단추: !!window.VP단품단추, 굿즈: !!window.__vp굿즈돌았나, 글: document.documentElement.getAttribute('data-vp-글'),
    이름단추: document.querySelectorAll('.vp-table .vp-goods-list button').length, 줄표: document.querySelectorAll('.vp-table tbody tr.vp-줄상담').length, 줄: document.querySelectorAll('.vp-table tbody tr').length }));
  console.log('  ', JSON.stringify(본));
  맞나('배송 5줄: 이름 단추 8개(상품명 4 · 단품명 4 — 기간 밖 등록·빈칸 다른 이름·코드만 맞는 단품·사용안함 포함), 맨 글자는 목록에 없는 이름 둘뿐', 본.이름단추 === 8, '단추 ' + 본.이름단추);
  const 딱 = await p.evaluate(() => (document.getElementById('vp-판') || {}).textContent);
  맞나('딱지에 맨글자 2칸(상품1가지·단품1가지, 사용안함 0)', /맨글자 2칸\(상품1가지·단품1가지, 그중 사용안함 0\)/.test(딱));
  맞나('곁다리가 상품관리를 전체 기간(2000-01-01~)으로 받음', POST기록.some((x) => /salesGoods/.test(x) && /2000-01-01/.test(x)), JSON.stringify(POST기록));
  맞나('줄 누름 표', 본.줄표 === 본.줄 && 본.줄 > 0);
  await p.click('.vp-table tbody tr td:last-child'); await p.waitForTimeout(600);
  맞나('줄 누름 → 상담 판', await p.evaluate(() => !!document.querySelector('.vp-상담판')));
  const 앞 = await p.evaluate(() => { const r = document.querySelector('.vp-상담판').getBoundingClientRect(); return [r.left, r.top]; });
  const 머 = await p.evaluate(() => { const r = document.querySelector('.vp-상담판 .vp-상담머리 strong').getBoundingClientRect(); return [r.left + 4, r.top + r.height / 2]; });
  await p.mouse.move(머[0], 머[1]); await p.mouse.down(); await p.mouse.move(머[0] + 60, 머[1] + 70, { steps: 6 }); await p.mouse.up();
  const 뒤 = await p.evaluate(() => { const r = document.querySelector('.vp-상담판').getBoundingClientRect(); return [r.left, r.top]; });
  맞나('상담 판 끌림', Math.abs(뒤[0] - 앞[0] - 60) <= 2 && Math.abs(뒤[1] - 앞[1] - 70) <= 2, JSON.stringify([앞, 뒤]));
  await p.close();

  console.log('\n■ CS등록 (주문관리, 실제 길 — 확장은 goods.js 를 안 보낸다)');
  const c = await 화면('/System/Sales/orderMst.aspx#vgCS', false); await c.waitForTimeout(2500);
  console.log('   딱지:', await c.evaluate(() => (document.getElementById('vp-판') || {}).textContent));
  const 씨 = await c.evaluate(() => ({ 머리: [...document.querySelectorAll('.vp-table thead th')].map((x) => x.textContent), 이름단추: document.querySelectorAll('.vp-table .vp-goods-list button').length, 줄표: document.querySelectorAll('.vp-table tbody tr.vp-줄상담').length, 줄: document.querySelectorAll('.vp-table tbody tr').length }));
  console.log('  ', JSON.stringify(씨));
  맞나('CS등록 이름 단추(상품+단품) 2개', 씨.이름단추 === 2);
  맞나('CS등록 줄 누름 표', 씨.줄표 === 씨.줄 && 씨.줄 > 0);
  await c.click('.vp-table tbody tr td:last-child'); await c.waitForTimeout(600);
  맞나('CS등록 줄 누름 → 상담 판', await c.evaluate(() => !!document.querySelector('.vp-상담판')));
  const 앞2 = await c.evaluate(() => { const r = document.querySelector('.vp-상담판').getBoundingClientRect(); return [r.left, r.top]; });
  const 머2 = await c.evaluate(() => { const r = document.querySelector('.vp-상담판 .vp-상담머리 strong').getBoundingClientRect(); return [r.left + 4, r.top + r.height / 2]; });
  await c.mouse.move(머2[0], 머2[1]); await c.mouse.down(); await c.mouse.move(머2[0] + 60, 머2[1] + 70, { steps: 6 }); await c.mouse.up();
  const 뒤2 = await c.evaluate(() => { const r = document.querySelector('.vp-상담판').getBoundingClientRect(); return [r.left, r.top]; });
  맞나('CS등록 상담 판 끌림', Math.abs(뒤2[0] - 앞2[0] - 60) <= 2 && Math.abs(뒤2[1] - 앞2[1] - 70) <= 2, JSON.stringify([앞2, 뒤2]));
  await c.keyboard.press('Escape');
  await c.click('.vp-table tbody tr td.vp-상품칸:not(.vp-단품칸) button'); await c.waitForTimeout(600);
  맞나('CS등록 상품명 단추 → 상품 상세(상담 아님)', await c.evaluate(() => [...document.querySelectorAll('.vp-goods-panel')].some((p) => !p.hidden) && !document.querySelector('.vp-상담판')));
  await c.close();
  맞나('쪽 오류 0', 오류.length === 0, JSON.stringify(오류.slice(0, 3)));
  await ctx.close(); 서버.close();
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  process.exit(빨강 ? 1 : 0);
})();
