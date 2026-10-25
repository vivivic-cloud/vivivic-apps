/* 10-25 [새 지시 이름단추 느림] — 상품 1만 2천 개 + 느린 응답에서 **배송관리 이름 단추가 다 붙는 시간 · 가장 긴 멈춤(long task) · 벤더피아 요청 수** 를 재는 자.
   진짜 크롬에 이 폴더를 확장으로 올리고(깃허브는 이 폴더 파일을 내주는 흉내), vendorpia.com 은 가짜 https 서버. 자료는 전부 가짜.
   쓰는 법: `node 느림.cjs`  (환경 `느림=0` 이면 응답을 빠르게). 재는 것 = ① 첫 열기(저장 없음) ② F5 두 번째 ③ F5 세 번째.
   ⚠ 응답이 느린 정도(기본 200ms + 줄당 0.25ms)는 흉내다. 진짜 벤더피아 속도는 아니다 — 요청 **수**와 **멈춤**을 견주는 자다. */
const { chromium } = require('playwright');
const fs = require('fs'), os = require('os'), path = require('path'), https = require('https'), { execSync } = require('child_process');
const 확장 = path.join(__dirname, '..');
const EXE = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'].find((p) => fs.existsSync(p));
const 느림 = process.env.느림 !== '0';
const 기본지연 = 느림 ? 200 : 5, 줄지연 = 느림 ? 0.25 : 0;
let 초록 = 0, 빨강 = 0;
const 맞나 = (이름, 참, 덧 = '') => { console.log((참 ? '  🟩 ' : '  🟥 ') + 이름 + (덧 ? '  ' + 덧 : '')); 참 ? 초록++ : 빨강++; };

/* ── 가짜 자료 ── */
const 상품수 = 12577, 단품수 = 4730;
/* 등록일은 번호와 상관없이 섞는다(배송 목록의 상품이 앞 날짜에 몰리지 않게) */
const 날 = (n, 총) => new Date(Date.UTC(2019, 0, 1) + Math.floor(((n * 7919) % 총) * 2850 / 총) * 864e5).toISOString().slice(0, 10);
const 채움 = (n) => Array.from({ length: n }, (_, i) => '비고칸' + i + '-내용입니다내용입니다');
const 상품머리 = ["상품명", "상품코드", "매출처명", "매입처명", "배송사명", "판매상태", "단품명", "단품코드", "모델번호", "매출처상품명", "옵션상품유무", "등록일", ...채움(14).map((_, i) => '칸' + i)];
const 상품들 = Array.from({ length: 상품수 }, (_, i) => [`상품 ${i} 서랍장`, `P${i}`, '가매출처', '가매입처', '경동택배(포천)', '판매중', `단품 ${i % 단품수} 몸통`, `d${i % 단품수}`, 'M-' + i, '매출' + i, 'N', 날(i, 상품수), ...채움(14)]);
const 단품머리 = ["단품명", "단품코드", "단품분류", "매입처명", "재고유형", "발주유형", "판매상태", "바코드", "등록일", ...채움(14).map((_, i) => '칸' + i)];
const 단품들 = Array.from({ length: 단품수 }, (_, i) => [`단품 ${i} 몸통`, `d${i}`, '서랍장', '가매입처', '재고', '정상', '판매중', '88' + i, 날(i, 단품수), ...채움(14)]);
const 재고머리 = ["단품명", "단품코드", "분류명", "창고", "매입처", "양품수", "판매상태"];
const 재고들 = 단품들.slice(0, 4000).map((r, i) => [r[0], r[1], '서랍장', '0.본사', '가매입처', String(i % 7), '판매중']);
const 순위머리 = (n) => [n, "배송수량"];
const 배송머리 = ["주문번호", "상품명", "상품코드", "단품명", "단품코드", "수취인", "수량", "배송사", "송장번호", "배송상태", "CS구분", "매출처"];
const 배송줄수 = 600;
const 배송줄 = Array.from({ length: 배송줄수 }, (_, i) => {
  const 신 = i % 120 === 119;                                     // 5줄은 상품관리에 없는 새 이름
  const p = (i * 37) % 상품수 % 450;                               // 서로 다른 상품 약 450가지
  return [`20261015-${i}`, 신 ? `없는 새 상품 ${i}` : `상품 ${p} 서랍장`, 신 ? `NEW${i}` : `P${p}`, 신 ? `없는 새 단품 ${i}` : `단품 ${p % 단품수} 몸통`, 신 ? `nd${i}` : `d${p % 단품수}`, '가나다', '1', '경동택배(포천)', '64' + i, '배송완료', '', '가매출처'];
});
const 표 = (머리, 줄, 전체, 쪽들 = '', 행수값 = '700') => `<html><body><form id="aspnetForm" method="post"><input type="hidden" name="__VIEWSTATE" value="${'x'.repeat(60000)}"><input type="hidden" name="ddlRowCnt" value="${행수값}"><span>총 ${전체} 건</span>${쪽들}<table><tr>${머리.map((h) => `<th>${h}</th>`).join('')}</tr>${줄.map((r) => `<tr>${r.map((v) => `<td>${v}</td>`).join('')}</tr>`).join('')}</table></form></body></html>`;
const 행수 = '<select name="ddlRowCnt" id="ddlRowCnt"><option value="10">10</option><option value="50">50</option><option value="700">700</option></select>';
const 쪽 = (제목, 액션, 칸들) => `<html><head><meta charset="utf-8"><title>${제목}</title></head><body id="body"><form name="aspnetForm" method="post" action="${액션}" id="aspnetForm"><input type="hidden" name="__VIEWSTATE" value="${'x'.repeat(60000)}"><input name="dcStartDt" id="dcStartDt" value="2026-07-15"><input name="dcEndDt" id="dcEndDt" value="2026-10-15">${칸들}<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div></form></body></html>`;
const 묶음읽기 = (몸) => { const o = {}; for (const m of 몸.matchAll(/name="([^"]+)"\r\n\r\n([^\r]*)\r\n/g)) o[m[1].split('$').pop()] = m[2]; return o; };

const 요청 = [];                      // 벤더피아로 간 요청 (POST·GET)
const 기록 = (q, 덧) => 요청.push(q.method + ' ' + q.url.split('?')[0].split('/').pop() + (덧 ? ' ' + 덧 : ''));

(async () => {
  const d0 = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-cert-'));
  execSync(`openssl req -x509 -newkey rsa:2048 -nodes -keyout ${d0}/k.pem -out ${d0}/c.pem -days 2 -subj "/CN=vendorpia.com" 2>/dev/null`);
  const 서버 = https.createServer({ key: fs.readFileSync(d0 + '/k.pem'), cert: fs.readFileSync(d0 + '/c.pem') }, (q, r) => {
    const 길 = q.url.split('?')[0]; r.setHeader('content-type', 'text/html; charset=utf-8');
    const 늦게 = (ms, 글) => setTimeout(() => r.end(글), ms);
    if (q.method === 'POST') {
      let 몸 = ''; q.on('data', (c) => { 몸 += c; }); q.on('end', () => {
        const f = 묶음읽기(몸);
        const 부터 = f.dcStartDt || '0000', 까지 = f.dcEndDt || '9999', 개수 = Number(f.ddlRowCnt || 50);
        const 글 = (f.tbSGoodsNm || f.tbGoodsNm || '').trim(), 코드 = (f.tbSGoodsCd || f.tbGoodsCd || '').trim();
        const 쪽번호 = /^pg(\d+)$/.test(f.__EVENTTARGET || '') ? Number(RegExp.$1) : 1;
        기록(q, 길.includes('firmDvList') ? '' : `${부터}~${까지} 줄${개수}${글 ? ' 이름=' + 글 : ''}${코드 ? ' 코드=' + 코드 : ''}${쪽번호 > 1 ? ' 쪽' + 쪽번호 : ''}`);
        const 답 = (머리, 모두, 날칸, 이름칸, 코드칸) => {
          let 거름 = 모두.filter((x) => (날칸 < 0 || (x[날칸] >= 부터 && x[날칸] <= 까지)) && (!글 || x[이름칸].includes(글)) && (!코드 || x[코드칸].toLowerCase() === 코드.toLowerCase()));
          const 쪽수 = Math.ceil(거름.length / 개수);
          const 이쪽 = 거름.slice((쪽번호 - 1) * 개수, 쪽번호 * 개수);
          const 쪽들 = 쪽수 > 1 ? Array.from({ length: 쪽수 }, (_, i) => `<a href="javascript:__doPostBack('pg${i + 1}','')">${i + 1}</a>`).join(' ') : '';
          늦게(기본지연 + 이쪽.length * 줄지연, 표(머리, 이쪽, 거름.length, 쪽들, String(개수)));
        };
        if (길.includes('salesGoods')) return 답(상품머리, 상품들, 11, 0, 1);
        if (길.includes('/Master/goods')) return 답(단품머리, 단품들, 8, 0, 1);
        if (길.includes('StockList')) return 답(재고머리, 재고들, -1, 0, 1);
        if (길.includes('prePostDeliveryList2')) return 늦게(기본지연, 표(순위머리('상품명'), 상품들.slice(0, 100).map((x) => [x[0], '5']), 100));
        if (길.includes('prePostDeliveryList4')) return 늦게(기본지연, 표(순위머리('단품명'), 단품들.slice(0, 100).map((x) => [x[0], '5']), 100));
        if (길.includes('firmDvList')) return 늦게(기본지연 + 배송줄수 * 줄지연, 표(배송머리, 배송줄, 배송줄수));
        늦게(기본지연, '<html><body>x</body></html>');
      }); return;
    }
    기록(q, '');
    if (길.includes('salesGoods')) return 늦게(기본지연, 쪽('상품관리', '/System/Master/salesGoods.aspx', 행수 + '<input name="tbSGoodsCd"><input name="tbSGoodsNm">'));
    if (길.includes('/Master/goods')) return 늦게(기본지연, 쪽('단품관리', '/System/Master/goods.aspx', 행수 + '<input name="tbGoodsCd"><input name="tbGoodsNm">'));
    if (길.includes('StockList')) return 늦게(기본지연, 쪽('재고조회', '/System/Stock/StockList.aspx', 행수 + '<select name="ddlStatus" id="ddlStatus"><option>전체</option></select>'));
    if (길.includes('firmDvList')) return 늦게(기본지연, 쪽('배송목록조회', '/System/Delivery/firmDvList.aspx', '<select name="ddlDStatus" id="ddlDStatus"><option value="">전체</option></select>' + 행수));
    늦게(기본지연, '<html><body>x</body></html>');
  }).listen(8443);

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-ext-'));
  const ctx = await chromium.launchPersistentContext(dir, { executablePath: EXE, headless: false, ignoreDefaultArgs: ['--disable-extensions'], ignoreHTTPSErrors: true,
    env: { ...process.env, LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8' },
    args: ['--headless=new', '--no-sandbox', '--no-proxy-server', '--host-resolver-rules=MAP vendorpia.com 127.0.0.1:8443, MAP www.vendorpia.com 127.0.0.1:8443',
      '--disable-extensions-except=' + 확장, '--load-extension=' + 확장] });
  await new Promise((r) => setTimeout(r, 2000));
  await ctx.route('**://identitytoolkit.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"idToken":"x"}' }));
  await ctx.route('**://firestore.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '[]', headers: { 'access-control-allow-origin': '*' } }));
  await ctx.route('**://vivivic-cloud.github.io/**', (r) => {
    const 이름 = decodeURIComponent(new URL(r.request().url()).pathname.split('/').pop()), 자리 = path.join(확장, 이름);
    if (!fs.existsSync(자리)) return r.fulfill({ status: 404, body: 'x' });
    return r.fulfill({ status: 200, headers: { 'content-type': 이름.endsWith('.css') ? 'text/css' : 'text/javascript', 'access-control-allow-origin': '*' }, body: fs.readFileSync(자리, 'utf8') });
  });
  const 오류 = [];
  const p = await ctx.newPage();
  p.on('pageerror', (e) => 오류.push(String(e).slice(0, 160)));
  /* 쪽 안에서: 가장 긴 멈춤(long task) · 단추 다 붙은 때. 조회 단추를 누른 때를 0으로 */
  await p.addInitScript(() => {
    window.__긴일 = []; window.__조회0 = 0; window.__다붙음 = 0; window.__줄다옴 = 0;
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__긴일.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ entryTypes: ['longtask'] }); } catch (e) {}
    setInterval(() => {
      if (!window.__조회0) return;
      const 칸 = [...document.querySelectorAll('.vp-table td.vp-상품칸')];
      if (!window.__줄다옴 && document.querySelectorAll('.vp-table tbody tr').length >= 600) window.__줄다옴 = performance.now();
      const 알것 = 칸.filter((td) => !/없는 새/.test(td.textContent));
      if (!window.__다붙음 && 칸.length >= 1200 && 알것.length && 알것.every((td) => td.querySelector('.vp-goods-list'))) window.__다붙음 = performance.now();
    }, 20);
  });
  const 한번 = async (이름, 길) => {
    요청.length = 0;
    const t0 = Date.now();
    if (길) await p.goto('https://vendorpia.com' + 길); else await p.reload();
    await p.waitForSelector('.vp-bar button[type=submit]', { timeout: 30000 });
    await p.waitForTimeout(1500);
    const 앞요청 = 요청.length;
    const 열때 = await p.evaluate(() => Math.max(0, ...window.__긴일.map((x) => x[1])));
    await p.evaluate(() => { window.__긴일 = []; window.__조회0 = performance.now(); window.__다붙음 = 0; window.__줄다옴 = 0; });
    await p.click('.vp-bar button[type=submit]');
    let 끝 = false;
    for (let i = 0; i < 400 && !끝; i++) { await p.waitForTimeout(250); try { 끝 = await p.evaluate(() => !!window.__다붙음, null); } catch (e) {} }
    /* 뒤에서 조용히 받는 이름표가 끝나길(최대 90초) 기다린다 — 다음 F5 가 저장된 이름표를 쓰게 */
    for (let i = 0; i < 360; i++) { const 딱 = await p.evaluate(() => (document.getElementById('vp-판') || {}).textContent || '').catch(() => ''); if (/상품이름표:/.test(딱) && /단품이름표:/.test(딱)) break; await p.waitForTimeout(250); }
    await p.waitForTimeout(느림 ? 3000 : 800);
    const 값 = await p.evaluate(() => ({ 줄: Math.round(window.__줄다옴 - window.__조회0), 붙음: window.__다붙음 ? Math.round(window.__다붙음 - window.__조회0) : -1,
      긴일: window.__긴일.filter((x) => x[0] >= window.__조회0 - 50), 가장긴: Math.max(0, ...window.__긴일.filter((x) => x[0] >= window.__조회0 - 50).map((x) => x[1])),
      전부가장긴: Math.max(0, ...window.__긴일.map((x) => x[1])),
      단추: document.querySelectorAll('.vp-table td.vp-상품칸 .vp-goods-list').length, 칸: document.querySelectorAll('.vp-table td.vp-상품칸').length,
      딱지: (document.getElementById('vp-판') || {}).textContent }));
    const 종류 = {}; for (const x of 요청) { const k = x.split(' ').slice(0, 2).join(' ').replace(/ \d.*/, ''); 종류[k] = (종류[k] || 0) + 1; }
    console.log(`\n■ ${이름}  (${((Date.now() - t0) / 1000).toFixed(1)}초 걸림)`);
    console.log(`   조회→줄 600 보임 ${값.줄}ms · 조회→이름 단추 다 붙음 ${값.붙음}ms · 단추 ${값.단추}/${값.칸}칸 · 조회 뒤 가장 긴 멈춤 ${값.가장긴}ms (조회 누르기 전 열 때 ${열때}ms)`);
    console.log(`   벤더피아 요청: 조회 누르기 전 ${앞요청} + 그 뒤 ${요청.length - 앞요청} = 모두 ${요청.length}  ${JSON.stringify(종류)}`);
    console.log('   딱지:', (값.딱지 || '').split(' ‖ ').filter((x) => /이름표|이름찾기|단추:준비|맨글자/.test(x)).join(' ‖ '));
    값.열때 = 열때;
    return { ...값, 요청수: 요청.length, 요청: [...요청] };
  };
  const 결과 = {};
  결과.첫 = await 한번('① 첫 열기 (저장 없음)', '/System/Delivery/firmDvList.aspx');
  결과.둘 = await 한번('② F5 두 번째', null);
  결과.셋 = await 한번('③ F5 세 번째', null);
  fs.writeFileSync(path.join(__dirname, '느림-결과.json'), JSON.stringify({ 결과: Object.fromEntries(Object.entries(결과).map(([k, v]) => [k, { ...v, 요청: v.요청.length > 400 ? v.요청.slice(0, 400) : v.요청 }])) }, null, 1));
  맞나('쪽 오류 0', 오류.length === 0, JSON.stringify(오류.slice(0, 3)));
  if (process.env.목표 === '1') {
    맞나('둘째 F5: 이름 단추 1초(1000ms) 안에 다 붙음', 결과.둘.붙음 >= 0 && 결과.둘.붙음 <= 1000, 결과.둘.붙음 + 'ms');
    맞나('둘째 F5: 가장 긴 멈춤 200ms 이하', 결과.둘.가장긴 <= 200, 결과.둘.가장긴 + 'ms');
    맞나('셋째 F5: 이름 단추 1초 안에', 결과.셋.붙음 >= 0 && 결과.셋.붙음 <= 1000, 결과.셋.붙음 + 'ms');
    맞나('첫 열기: 이름 단추 다 붙음(몇 초 안)', 결과.첫.붙음 >= 0 && 결과.첫.붙음 <= 10000, 결과.첫.붙음 + 'ms');
    맞나('첫 열기: 가장 긴 멈춤 200ms 이하', 결과.첫.가장긴 <= 200, 결과.첫.가장긴 + 'ms');
  }
  await ctx.close(); 서버.close();
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  process.exit(빨강 ? 1 : 0);
})();
