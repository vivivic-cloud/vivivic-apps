/* 10-26 [새 지시 한번에] — 사장님: 「되도록 불러온 정보의 상태과 그 작동은 한번에 되게 해줘」
   배송관리에서 조회했을 때 **줄이 보이는 때 · 이름 단추가 붙는 때 · 단품 단추에 초록 점(재고조회에 있음)·양품 수량이 붙는 때** 와 그 차이,
   「단추는 있는데 초록 점이 없는」 단품 칸이 한 번이라도 있었나(있으면 나뉜 것), 가장 긴 멈춤, 열고 40초 요청, 단추 처음 누름 → 상세.
   경우: ① 열고 40초 ② 처음 조회(모음·재고 저장 없음) ③ F5(모음 있음·재고 저장 10분 안) ④ F5(재고 저장 낡음 11분) ⑤ 단추 누름.
   쓰는 법: `node 한번에.cjs` (환경 `열고기다림`=ms, 기본 40000). 바탕은 뒤요청.cjs(진짜 크롬+확장, 흉내 서버, 큰 배송 HTML·서로 다른 상품 약 450가지). 자료는 전부 가짜.
   ⚠ 응답 느림(200ms + 줄당 0.25ms)은 흉내다. 진짜 벤더피아는 재고 한 응답 1.3~1.9초·요청을 하나씩 처리 — 흉내 서버는 동시에 처리한다. */
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
  const p = (i * 37) % 상품수 % (Number(process.env.이름수) || 450);                               // 서로 다른 상품 약 450가지
  return [`20261015-${i}`, 신 ? `없는 새 상품 ${i}` : `상품 ${p} 서랍장`, 신 ? `NEW${i}` : `P${p}`, 신 ? `없는 새 단품 ${i}` : `단품 ${p % 단품수} 몸통`, 신 ? `nd${i}` : `d${p % 단품수}`, '가나다', '1', '경동택배(포천)', '64' + i, '배송완료', '', '가매출처'];
});
const 큰배송 = process.env.큰배송 !== '0';
const 덧 = (v, i, j) => 큰배송 ? `<span id="ctl00_ContentPlaceHolder1_gvList_ctl${100 + i}_lbl${j}" class="gvCell" style="display:inline-block;padding:2px 4px;color:#333">${v}</span><input type="hidden" name="h${i}_${j}" value="${'q'.repeat(60)}">` : v;
const 표 = (머리, 줄, 전체, 쪽들 = '', 행수값 = '700') => `<html><body><form id="aspnetForm" method="post"><input type="hidden" name="__VIEWSTATE" value="${'x'.repeat(60000)}"><input type="hidden" name="ddlRowCnt" value="${행수값}"><span>총 ${전체} 건</span>${쪽들}<table><tr>${머리.map((h) => `<th>${h}</th>`).join('')}</tr>${줄.map((r, i) => `<tr>${r.map((v, j) => `<td>${덧(v, i, j)}</td>`).join('')}</tr>`).join('')}</table></form></body></html>`;
const 행수 = '<select name="ddlRowCnt" id="ddlRowCnt"><option value="10">10</option><option value="50">50</option><option value="700">700</option></select>';
const 쪽 = (제목, 액션, 칸들) => `<html><head><meta charset="utf-8"><title>${제목}</title></head><body id="body"><form name="aspnetForm" method="post" action="${액션}" id="aspnetForm"><input type="hidden" name="__VIEWSTATE" value="${'x'.repeat(60000)}"><input name="dcStartDt" id="dcStartDt" value="2026-07-15"><input name="dcEndDt" id="dcEndDt" value="2026-10-15">${칸들}<input type="image" name="btnSearch" id="btnSearch" src="s.gif"><div id="divGrid"></div></form></body></html>`;
const 묶음읽기 = (몸) => { const o = {}; for (const m of 몸.matchAll(/name="([^"]+)"\r\n\r\n([^\r]*)\r\n/g)) o[m[1].split('$').pop()] = m[2]; return o; };

const 요청 = [];                      // 벤더피아로 간 요청 (POST·GET)
const 기록 = (q, 덧) => 요청.push(q.method + ' ' + q.url.split('?')[0].split('/').pop() + (덧 ? ' ' + 덧 : ''));

(async () => {
  const d0 = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-cert-'));
  execSync(`openssl req -x509 -newkey rsa:2048 -nodes -keyout ${d0}/k.pem -out ${d0}/c.pem -days 2 -subj "/CN=vendorpia.com" 2>/dev/null`);
  const 통계 = {};   // 길 → { 수, 바이트 }
  let 기준 = Date.now();
  const 서버 = https.createServer({ key: fs.readFileSync(d0 + '/k.pem'), cert: fs.readFileSync(d0 + '/c.pem') }, (q, r) => {
    const 길 = q.url.split('?')[0];
    const 끝냄 = r.end.bind(r);
    r.end = (글) => { const k = q.method + ' ' + 길.split('/').pop(); const t = 통계[k] || (통계[k] = { 수: 0, 바이트: 0, 처음: -1 }); t.수++; t.바이트 += Buffer.byteLength(String(글 || '')); if (t.처음 < 0) t.처음 = Date.now() - 기준; (global.__타임 ||= []).push([k, Date.now() - 기준]); return 끝냄(글); }; r.setHeader('content-type', 'text/html; charset=utf-8');
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
    window.__긴일 = []; window.__조회0 = 0;
    const 새 = () => ({ 줄: 0, 첫단추: 0, 단추다: 0, 점다: 0, 나뉜칸: 0 });
    window.__잼 = 새(); window.__잼새 = () => { window.__잼 = 새(); };
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__긴일.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ entryTypes: ['longtask'] }); } catch (e) {}
    setInterval(() => {
      if (!window.__조회0) return;
      const Z = window.__잼, 지금 = performance.now() - window.__조회0;
      if (!Z.줄 && document.querySelectorAll('.vp-table tbody tr').length >= 600) Z.줄 = 지금;
      const 칸 = [...document.querySelectorAll('.vp-table td.vp-상품칸')].filter((td) => !/없는 새/.test(td.textContent));
      if (칸.length < 1180) return;
      const 단추 = 칸.filter((td) => td.querySelector('.vp-goods-list'));
      if (!Z.첫단추 && 단추.length) Z.첫단추 = 지금;
      if (!Z.단추다 && 단추.length === 칸.length) Z.단추다 = 지금;
      const 단품단추 = 단추.filter((td) => td.classList.contains('vp-단품칸'));
      const 점없음 = 단품단추.filter((td) => !td.querySelector('button.vp-instock .vp-qty')).length;   // 단추는 있는데 초록 점·수량이 없는 단품 칸
      Z.나뉜칸 = Math.max(Z.나뉜칸, 점없음);
      const 단품칸 = 칸.filter((td) => td.classList.contains('vp-단품칸'));
      if (!Z.점다 && 단품칸.length && 단품단추.length === 단품칸.length && !점없음) Z.점다 = 지금;
    }, 20);
  });
  const 새통계 = () => { for (const k of Object.keys(통계)) delete 통계[k]; 기준 = Date.now(); };
  const 통계글 = () => Object.entries(통계).filter(([k]) => !/s\.gif|firmDvList.*GET/.test(k)).sort().map(([k, v]) => `${k} ×${v.수} ${Math.round(v.바이트 / 1024)}KB(처음 ${(v.처음 / 1000).toFixed(1)}s)`).join(' · ');
  const 결과 = {};
  const 조회재기 = async (이름, 오래 = 120) => {
    새통계();
    await p.evaluate(() => { window.__긴일 = []; window.__조회0 = performance.now(); window.__잼새(); });
    await p.click('.vp-bar button[type=submit]');
    for (let i = 0; i < 오래 * 4 && !(await p.evaluate(() => !!(window.__잼.단추다 && window.__잼.점다))); i++) await p.waitForTimeout(250);
    await p.waitForTimeout(2000);
    const Z = await p.evaluate(() => ({ ...window.__잼, 긴일: window.__긴일, 말: (document.getElementById('vp-판')?.textContent || '').split('‖').filter((x) => /한번에|재고/.test(x)).join('|') }));
    const r = (x) => (x ? Math.round(x) : -1);
    const 가장긴 = Math.max(0, ...Z.긴일.map((x) => x[1]));
    const 끝 = Math.max(r(Z.단추다), r(Z.점다));
    const 줄 = { 줄: r(Z.줄), 첫단추: r(Z.첫단추), 단추다: r(Z.단추다), 점다: r(Z.점다), 차이: Z.점다 && Z.단추다 ? 끝 - r(Z.줄) : -1, 단추점차이: Z.점다 && Z.단추다 ? r(Z.점다) - r(Z.첫단추) : -1, 나뉜칸: Z.나뉜칸, 가장긴, 요청: 통계글() };
    console.log(`\n■ ${이름}: 줄 600 보임 ${줄.줄}ms · 첫 단추 ${줄.첫단추}ms · 단추 다 ${줄.단추다}ms · 초록 점·수량 다 ${줄.점다}ms → 줄↔점 차이 ${줄.차이}ms · 단추 있는데 점 없던 단품 칸 최대 ${줄.나뉜칸} · 가장 긴 멈춤 ${가장긴}ms`);
    console.log('   긴 멈춤들 ' + JSON.stringify(Z.긴일.slice(0, 10)) + '\n   말 ' + Z.말 + '\n   요청 — ' + 줄.요청);
    return 줄;
  };
  /* ① 열고 아무것도 안 누른 40초 */
  새통계();
  await p.goto('https://vendorpia.com/System/Delivery/firmDvList.aspx');
  await p.waitForSelector('.vp-bar button[type=submit]', { timeout: 30000 });
  await p.waitForTimeout(Number(process.env.열고기다림 || 40000));
  결과.열기 = { 요청: 통계글(), 가장긴: Math.max(0, ...(await p.evaluate(() => window.__긴일)).map((x) => x[1])) };
  console.log('\n■ ① 열고 아무것도 안 누름: 벤더피아 요청 — ' + (결과.열기.요청 || '없음') + ' · 가장 긴 멈춤 ' + 결과.열기.가장긴 + 'ms');
  맞나('① 열 때 재고조회 요청 0', !/StockList/.test(결과.열기.요청));
  /* ② 처음 조회 */
  결과.처음 = await 조회재기('② 처음 조회(모음·재고 저장 없음)');
  맞나('② 재고조회는 배송 목록 받은 뒤', !/StockList/.test(결과.처음.요청) || (통계['POST StockList.aspx'] || {}).처음 >= (통계['POST firmDvList.aspx'] || {}).처음);
  /* ③ F5 — 재고 저장 10분 안 */
  await p.reload(); await p.waitForSelector('.vp-bar button[type=submit]', { timeout: 30000 }); await p.waitForTimeout(3000);
  결과.F5 = await 조회재기('③ F5(모음 있음·재고 저장 10분 안)');
  맞나('③ F5 10분 안: 재고조회 요청 0', !/StockList/.test(결과.F5.요청));
  /* ④ F5 — 재고 저장 낡음(11분 전으로 돌림) */
  const sw = ctx.serviceWorkers()[0];
  if (sw) await sw.evaluate(async () => { const v = (await chrome.storage.local.get('vpStock')).vpStock; if (v) { v.at -= 11 * 60 * 1000; await chrome.storage.local.set({ vpStock: v }); } });
  await p.reload(); await p.waitForSelector('.vp-bar button[type=submit]', { timeout: 30000 }); await p.waitForTimeout(3000);
  결과.낡음 = await 조회재기('④ F5(모음 있음·재고 저장 11분 — 다시 받음)');
  맞나('④ 낡으면 다시 받음', /StockList/.test(결과.낡음.요청) || !sw);
  for (const k of ['처음', 'F5', '낡음']) 맞나(k + ': 단추 있는데 점 없는 단품 칸 0 (한번에)', 결과[k].나뉜칸 === 0 && 결과[k].점다 > 0, '최대 ' + 결과[k].나뉜칸);
  맞나('F5 10분 안: 줄↔점 차이 1초 아래', 결과.F5.차이 >= 0 && 결과.F5.차이 < 1000, 결과.F5.차이 + 'ms');
  for (const k of ['처음', 'F5', '낡음']) 맞나(k + ': 가장 긴 멈춤 200ms 아래', 결과[k].가장긴 < 200, 결과[k].가장긴 + 'ms');
  /* ⑤ 단추 처음 누름 → 상세 */
  새통계();
  const 눌러보기 = async (종류) => {
    await p.evaluate(() => { for (const o of document.querySelectorAll('#vp-root .vp-곁다리 .vp-goods-panel')) o.hidden = true; });
    const t0 = Date.now();
    await p.evaluate((k) => { const td = [...document.querySelectorAll('.vp-table td.vp-상품칸')].find((x) => x.querySelector('.vp-goods-list') && x.classList.contains('vp-단품칸') === (k === '단품')); td.querySelector('button').click(); }, 종류);
    await p.waitForFunction(() => [...document.querySelectorAll('#vp-root .vp-곁다리 .vp-goods-panel')].some((o) => !o.hidden && o.querySelectorAll('dl').length > 0), null, { timeout: 30000 }).catch(() => {});
    const ms = Date.now() - t0;
    console.log('   ' + 종류 + ' 단추 처음 누름 → 상세 뜸 ' + ms + 'ms');
    return ms;
  };
  console.log('\n■ ⑤ 단추 누름');
  결과.눌림 = { 상품: await 눌러보기('상품'), 단품: await 눌러보기('단품') };
  console.log('   누른 뒤 요청 — ' + 통계글());
  맞나('쪽 오류 0', 오류.length === 0, JSON.stringify(오류.slice(0, 3)));
  if (!process.env.결과안씀) fs.writeFileSync(path.join(__dirname, '한번에-결과.json'), JSON.stringify(결과, null, 1));
  await ctx.close(); 서버.close();
  console.log('\n  ★ 초록 ' + 초록 + ' · 빨강 ' + 빨강);
  process.exit(빨강 ? 1 : 0);
})();
