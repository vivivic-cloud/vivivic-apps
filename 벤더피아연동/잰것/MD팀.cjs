/* **MD팀** 메뉴를 재는 자 (11-27 [새 지시 MD팀]). 자료는 전부 지어낸 값(`본보기/MD팀-흉내.json` = `MD팀흉내만들기.py` 가 지어낸 엑셀을 `MD팀올리기.py` 로 바꾼 것).
   흉내: 창고(Firestore) GET 목록 = info + c1(JSON 한 조각) · 익명 표 · 깃허브 = 진짜 MD팀.js/search.js/vp-data.js, goods.js 는 **이름 단추 흉내**
     (`VP상품단추`(이름) — 이름표에 있는 이름만 단추, `VP상품찾기` = 벤더피아에서 찾은 셈으로 하나 더함 → `vp상품단추준비`).
   돌리기(맥): NODE_PATH=<playwright-core 있는 node_modules> VP_EXE=<크로미움> node 잰것/MD팀.cjs */
let pw; try { pw = require('playwright'); } catch (e) { pw = require('playwright-core'); }
const { chromium } = pw;
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = process.env.VP_EXE || '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const 깃 = 'https://vivivic-cloud.github.io/vivivic-apps/%EB%B2%A4%EB%8D%94%ED%94%BC%EC%95%84%EC%97%B0%EB%8F%99/';
const 자료 = JSON.parse(fs.readFileSync(path.join(__dirname, '본보기', 'MD팀-흉내.json'), 'utf8'));
const 자료글 = JSON.stringify(자료);
const 가짜goods = `(() => {
  /* 11-27 [새 지시 MD팀코드연결] 이름표 = 상품코드 → 벤더피아 상품명. 이름으로는 안 맞춤(진짜 표에서찾기("", 코드) 와 같음) */
  const 표 = new Map([["code0", "맞는 상품 하나"], ["code1", "벤더피아 이름 둘"]]);
  window.__부름 = []; window.__찾음 = [];
  window.VP상품단추 = (이름, 코드) => {
    window.__부름.push([이름, 코드]);
    const n = (!String(이름).trim() || null) && 표.get(String(코드).trim());
    if (!n) return null;
    const b = document.createElement("button"); b.type = "button"; b.className = "가짜단추"; b.textContent = n;
    const 점 = b.appendChild(document.createElement("span")); 점.className = "vp-점";
    b.addEventListener("click", () => { window.__누름 = n; });
    return b;
  };
  window.VP상품표끝 = () => true;
  window.VP상품찾기 = async (목록) => { window.__찾음.push(...목록.map((x) => x.코드)); 표.set("code7", "가짜 의자 7"); setTimeout(() => dispatchEvent(new Event("vp상품단추준비")), 50); return 1; };
  setTimeout(() => dispatchEvent(new Event("vp상품단추준비")), 300);
})();`;

(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  let 초록 = 0, 빨강 = 0;
  const 재 = (참, 말) => { console.log((참 ? '  ✓ ' : '  ✗ ') + 말); 참 ? 초록++ : 빨강++; };
  async function 쪽열기(너비, { 창고없음 = false, 사방넷 = null } = {}) {
    const ctx = await b.newContext({ viewport: { width: 너비, height: 900 } });
    const p = await ctx.newPage();
    const 쪽오류 = [], 밖 = [], 벤더 = [], 창고요청 = [], 창고쓰기 = [];
    p.on('pageerror', (e) => 쪽오류.push(String(e)));
    if (사방넷) await ctx.addInitScript((설정) => {
      /* 11-27 [새 지시 MD팀사방넷] 확장 다리 흉내 — 처음엔 로그인 안 됨, 로그인창을 연 뒤 상태를 두 번 물으면 로그인 됨 */
      let 로그인 = 설정.처음로그인, 물음 = 0;
      window.__사방넷 = [];
      window.VP사방넷 = async (할일) => {
        window.__사방넷.push(할일);
        if (할일 === '상태') { if (window.__사방넷.includes('로그인창') && ++물음 >= 2) 로그인 = true; return { 로그인, 남은분: 로그인 ? 700 : 0, 계정: 로그인 ? 'mw0000' : '' }; }
        if (할일 === '로그인창') return { 로그인 };
        if (할일 === '창닫기') return true;
        if (할일 === '자료') return 로그인 ? { 로그인: true, 매핑: 설정.매핑, 단품: 설정.단품 } : { 로그인: false };
        return null;
      };
    }, 사방넷);
    await ctx.route('**/*', async (r) => {
      const q = r.request(), u = new URL(q.url());
      if (u.hostname === 'vivivic-cloud.github.io') {
        const 이름 = decodeURIComponent(u.pathname.split('/').pop());
        if (이름 === 'goods.js') return r.fulfill({ status: 200, contentType: 'text/javascript; charset=utf-8', body: 가짜goods });
        const 길 = path.join(확장, 이름);
        return r.fulfill({ status: 200, contentType: (이름.endsWith('.css') ? 'text/css' : 'text/javascript') + '; charset=utf-8', body: fs.existsSync(길) ? fs.readFileSync(길) : '' });
      }
      const 열림 = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
      if (/googleapis\.com$/.test(u.hostname) && q.method() === 'OPTIONS') return r.fulfill({ status: 204, headers: 열림 });
      if (u.hostname === 'identitytoolkit.googleapis.com') return r.fulfill({ status: 200, headers: 열림, contentType: 'application/json', body: JSON.stringify({ idToken: 'fake-token' }) });
      if (u.hostname === 'firestore.googleapis.com') {
        창고요청.push(q.method() + ' ' + decodeURIComponent(u.pathname).split('/public/data/')[1]);
        if (창고없음) return r.fulfill({ status: 200, headers: 열림, contentType: 'application/json', body: '{}' });
        /* 11-27 [새 지시 MD팀스마트스토어칸] 사방넷 링크·화면 입력 창고 흉내 (값은 지어냄) */
        const 길 = decodeURIComponent(u.pathname);
        if (/mdteam_inghome_sabang\/links$/.test(길) && q.method() !== 'GET') { 창고쓰기.push(q.method() + ' sabang ' + (q.postData() || '')); return r.fulfill({ status: 200, headers: 열림, contentType: 'application/json', body: '{}' }); }
        if (/mdteam_inghome_sabang\/links$/.test(길)) return r.fulfill({ status: 200, headers: 열림, contentType: 'application/json', body: JSON.stringify({ fields: { j: { stringValue: JSON.stringify(
          { code1: ['222', '901'], code4: ['333', '902'], code6: ['444', '903'], code7: ['556', '904'] }) } } }) });
        if (/mdteam_inghome_link/.test(길)) {
          if (q.method() !== 'GET') { 창고쓰기.push(q.method() + ' ' + 길.split('/').pop() + ' ' + (q.postData() || '')); return r.fulfill({ status: 200, headers: 열림, contentType: 'application/json', body: '{}' }); }
          const 링뿌리 = 'projects/vivivic-4b7ef/databases/(default)/documents/artifacts/vivivic-4b7ef/public/data/mdteam_inghome_link/';
          return r.fulfill({ status: 200, headers: 열림, contentType: 'application/json', body: JSON.stringify({ documents: [
            { name: 링뿌리 + 'c_636f646536', fields: { code: { stringValue: 'code6' }, url: { stringValue: 'https://smartstore.naver.com/inggagu/products/444' } } },
            { name: 링뿌리 + 'c_636f646537', fields: { code: { stringValue: 'code7' }, url: { stringValue: 'https://brand.naver.com/inggagu/products/555' } } }] }) });
        }
        const 뿌리 ='projects/vivivic-4b7ef/databases/(default)/documents/artifacts/vivivic-4b7ef/public/data/mdteam_inghome/';
        return r.fulfill({ status: 200, headers: 열림, contentType: 'application/json', body: JSON.stringify({ documents: [
          { name: 뿌리 + 'info', fields: { n: { integerValue: '1' }, file: { stringValue: '흉내.xlsx' } } },
          { name: 뿌리 + 'c1', fields: { j: { stringValue: 자료글 } } }] }) });
      }
      if (u.hostname !== 'vendorpia.com') { 밖.push(q.method() + ' ' + u.hostname); return r.abort(); }
      벤더.push(q.method() + ' ' + u.pathname);
      return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: '<html><body><form id="aspnetForm" action="./orderMst.aspx"><input type="image" id="btnSearch" name="ctl00$Contents$btnSearch"><input id="dcStartDt" value="2026-10-16"><input id="dcEndDt" value="2026-11-16"></form></body></html>' });
    });
    await p.goto('https://vendorpia.com/System/Sales/orderMst.aspx#vgMD');
    for (const f of ['login.css', 'search.css']) await p.addStyleTag({ url: 깃 + encodeURIComponent(f) });
    await p.addScriptTag({ content: fs.readFileSync(path.join(확장, 'vp-data.js'), 'utf8').replace(/^const VP_DATA/m, 'window.VP_DATA') });
    await p.addScriptTag({ url: 깃 + 'search.js' });
    await p.waitForFunction(() => document.querySelector('#vp-root.vp-md팀 .vp-md탭 button') || /못/.test(document.querySelector('#vp-root .vp-note')?.textContent || ''), null, { timeout: 30000 });
    await p.waitForTimeout(900);
    return { p, ctx, 쪽오류, 밖, 벤더, 창고요청, 창고쓰기 };
  }

  for (const 너비 of [1280, 375]) {
    console.log('\n■ ' + 너비);
    const { p, ctx, 쪽오류, 밖, 벤더, 창고요청, 창고쓰기 } = await 쪽열기(너비);
    const 판 = await p.evaluate(() => {
      const 보이는통 = [...document.querySelectorAll('#vp-root .vp-table')].find((x) => !x.hidden);
      const t = 보이는통 && 보이는통.querySelector('table.vp-촘촘');
      const 머리 = t && [...t.tHead.rows].map((tr) => [...tr.cells].map((c) => [c.firstChild ? c.firstChild.textContent : '', c.colSpan]));
      const td = t && t.tBodies[0].rows[0].cells[1], cs = td && getComputedStyle(td), ths = t && getComputedStyle(t.tHead.rows[0].cells[0]);
      return { h1: document.querySelector('#vp-root h1')?.textContent, 탭: [...document.querySelectorAll('#vp-root .vp-md탭 button')].map((x) => [x.textContent, x.getAttribute('aria-selected')]),
        메모: [...document.querySelectorAll('#vp-root .vp-md메모 span')].map((s) => [s.textContent, s.style.color, s.style.background]),
        머리, 줄: t ? t.tBodies[0].rows.length : 0, 글: cs && cs.fontSize, 높이: t && t.tBodies[0].rows[1].getBoundingClientRect().height,
        머리글: ths && ths.fontSize, 머리높이: t && t.tHead.rows[0].getBoundingClientRect().height, 머리위: ths && ths.top, 묶음글: t && [t.tHead.rows[0].cells[9].title, t.tHead.rows[0].cells[11].title],
        손높이: t && [...t.querySelectorAll('.vp-열손')].every((h) => h.getBoundingClientRect().height >= h.parentElement.clientHeight - 1),
        같은꼴: t && (() => { const a = getComputedStyle(t.tHead.rows[0].cells[2]); return [a.backgroundColor, a.textAlign, a.fontWeight, a.borderRightColor, getComputedStyle(t.tBodies[0].rows[0].cells[2]).borderRightColor].join('|'); })(),
        손: t ? t.querySelectorAll('.vp-열손').length : 0, 거름: t ? t.querySelectorAll('.vp-md거름').length : 0,
        첫칸붙음: t && getComputedStyle(t.tBodies[0].rows[0].cells[0]).position === 'sticky',
        쪽가로: document.documentElement.scrollWidth > innerWidth + 1, 표통: 보이는통 && 보이는통.scrollWidth > 보이는통.clientWidth,
        통밀대: 보이는통 && getComputedStyle(보이는통).overflowX, 단추: document.querySelectorAll('#vp-root td.vp-상품칸 .vp-goods-list button.가짜단추').length,
        시트셈: window.VP_MD셈 && window.VP_MD셈(), 설명: document.querySelector('#vp-root .vp-note').hidden };
    });
    재(판.h1 === 'MD팀', '제목 「MD팀」');
    재(JSON.stringify(판.탭.map((x) => x[0])) === JSON.stringify(['제품리스트', '사은품리스트', '외부복사용', '중지단종', '사방넷']) && 판.탭[0][1] === 'true', '탭 = 시트 이름 그대로 넷 + 사방넷, 처음 제품리스트: ' + 판.탭.map((x) => x.join(':')));
    const 아래 = 판.머리 && 판.머리[0].map((x) => x[0]);
    재(판.머리 && 판.머리.length === 1 && JSON.stringify(아래) === JSON.stringify(['구분', '시리즈', '카테고리구분', '스마트스토어 url', '상품코드', '제품명', '옵션', '주의및 참고사항', '소비자가', '판매가', '할인율', '서울/경기', '경기외곽', '지방', '조립형태', '배송형태', '배송사', '합포장']),
      '칸 = 엑셀 차례 그대로 18칸(숨은 열 B 「순서」 뺌): ' + 아래);
    재(판.머리위 === '0px' && 판.묶음글[0] === '할인판매가 › 판매가' && 판.묶음글[1] === '배송비 › 서울/경기', '머리 = 배송·CS 표처럼 한 줄(붙음 top 0) · 위 머리는 title: ' + 판.묶음글);
    재(판.같은꼴 === 'rgb(245, 245, 245)|center|700|rgb(192, 192, 192)|rgb(192, 192, 192)', '머리 #f5f5f5·가운데·굵게 · 칸 선 #c0c0c0 = 배송·CS 표: ' + 판.같은꼴);
    재(판.손높이, '끌개 = 머리 칸 높이 전체(위 반도 잡힘)');
    재(판.줄 === 30, '줄 = 값 있는 줄 30(빈 줄 뺌): ' + 판.줄);
    재(JSON.stringify(판.메모.map((x) => x[0])) === JSON.stringify(['  -', '색상표기건: 중복코드', '색상표기건: 등록/수정 건 (확인중)']) && /255, 0, 0/.test(판.메모[1][1]) && /234, 209, 220/.test(판.메모[2][2]), '표 위 = 파일 1~2행 글·색 그대로');
    재(판.글 === '11px' && Math.round(판.높이) === 25 && 판.머리글 === '11px' && Math.round(판.머리높이) === 25, '꼴 = 배송·CS 표(11px·25px): ' + [판.글, 판.높이, 판.머리글, 판.머리높이]);
    재(판.손 === 18, '열 끌기 손잡이 18: ' + 판.손);
    재(판.거름 === 18, '자동필터 시트 = 칸마다 거르개 18: ' + 판.거름);
    재(판.첫칸붙음, '첫 칸 붙음');
    재(!판.쪽가로, '쪽 전체 가로 스크롤 없음');
    재(/auto|scroll/.test(판.통밀대) && (너비 > 1000 || 판.표통), '넓은 표는 표 통 안에서 가로로 밀림(밀대 auto): ' + 판.통밀대);
    재(판.설명, '설명 글 없음(알림 칸 숨김)');
    /* 값·꼴·까닭·링크 */
    const 칸 = await p.evaluate(() => {
      const t = [...document.querySelectorAll('#vp-root .vp-table')].find((x) => !x.hidden).querySelector('table');
      const 줄 = (i) => t.tBodies[0].rows[i];
      const 칸 = (i, j) => 줄(i).cells[j];
      return { 소비자가: 칸(0, 8).textContent, 할인율: 칸(0, 10).textContent, 배송비: 칸(0, 11).textContent, 무료: 칸(1, 11).textContent,
        정렬: getComputedStyle(칸(0, 8)).textAlign, 가운데: getComputedStyle(칸(0, 1)).textAlign, 표준: getComputedStyle(칸(0, 2)).textAlign, 굵음: getComputedStyle(칸(0, 9)).fontWeight,
        중복: [칸(2, 4).textContent, getComputedStyle(칸(2, 4)).color, getComputedStyle(칸(2, 4)).fontWeight, 칸(2, 4).title], 안중복: getComputedStyle(칸(1, 4)).color,
        분홍: [getComputedStyle(칸(3, 0)).backgroundColor, getComputedStyle(칸(3, 7)).backgroundColor, 칸(3, 7).title, getComputedStyle(칸(5, 7)).backgroundColor],
        링크: (() => { const a = 칸(0, 3).querySelector('a'); return a && [a.href, a.target, getComputedStyle(a).color]; })() };
    });
    재(칸.소비자가 === '100,000' && 칸.할인율 === '10%' && 칸.배송비 === '15,000' && 칸.무료 === '무료배송', '값 = 엑셀이 보이는 글(#,##0 · 0% 계산값): ' + [칸.소비자가, 칸.할인율, 칸.배송비, 칸.무료]);
    재(칸.정렬 === 칸.표준 && 칸.가운데 === 칸.표준 && 칸.굵음 === '700', '맞춤 = 배송·CS 표와 같음(엑셀 맞춤 안 씀) · 굵게 그대로: ' + [칸.정렬, 칸.가운데, 칸.표준]);
    재(칸.중복[0] === 'DUP-1' && /255, 0, 0/.test(칸.중복[1]) && 칸.중복[2] === '700' && 칸.중복[3] === '중복코드' && !/255, 0, 0/.test(칸.안중복), '같은 상품코드 = 굵은 빨강 · 마우스 올리면 「중복코드」');
    재(/234, 209, 220/.test(칸.분홍[0]) && /234, 209, 220/.test(칸.분홍[1]) && 칸.분홍[2] === '등록/수정 건 (확인중)' && !/234, 209, 220/.test(칸.분홍[3]), '채운 줄 = 분홍 그대로 · 까닭 「등록/수정 건 (확인중)」');
    재(칸.링크 && 칸.링크[0] === 'https://example.com/p/0' && 칸.링크[1] === '_blank' && /0, 0, 255/.test(칸.링크[2]), '하이퍼링크 = 새 탭 · 글 색 그대로: ' + 칸.링크);
    /* 이름 단추 */
    await p.waitForTimeout(400);
    const 단 = await p.evaluate(() => ({ 셈: window.VP_MD셈(), 찾음: window.__찾음, 부름코드: window.__부름.every((x) => x[0] === '' && x[1]),
      첫: (() => { const t = [...document.querySelectorAll('#vp-root .vp-table')].find((x) => !x.hidden).querySelector('table'); return [0, 1, 2, 3].map((i) => { const c = t.tBodies[0].rows[i].cells[5]; const s = c.querySelector('.vp-md엑셀명'); return [c.className, c.querySelector('.vp-goods-list > button')?.firstChild?.nodeValue || '', s ? s.textContent : '', c.textContent, s ? getComputedStyle(s).fontSize : '']; }); })() }));
    재(/vp-상품칸/.test(단.첫[0][0]) && 단.첫[0][1] === '맞는 상품 하나' && 단.첫[0][2] === '', '코드 일치·같은 이름 = 단추만: ' + JSON.stringify(단.첫[0]));
    재(단.첫[1][1] === '벤더피아 이름 둘' && 단.첫[1][2] === '맞는  상품 둘'.trim() && parseFloat(단.첫[1][4]) < 13, '코드 일치·다른 이름 = 단추 + 엑셀 제품명 작게: ' + JSON.stringify(단.첫[1]));
    재(!단.첫[2][1] && 단.첫[2][3] === '없는 상품', '코드 없음(벤더피아에 없음) = 글자 그대로: ' + JSON.stringify(단.첫[2]));
    재(!단.첫[3][1] && 단.첫[3][3] === '맞는 상품 하나', '이름이 같아도 코드가 다르면 단추 없음(이름으로 안 맞춤): ' + JSON.stringify(단.첫[3]));
    재(단.부름코드, '맞춤은 상품코드만(이름 안 넘김)');
    재(단.찾음.includes('DUP-1') && 단.찾음.includes('code7') && new Set(단.찾음).size === 단.찾음.length && !단.찾음.includes('code0'), '이름표에 없는 코드만 한 번씩 벤더피아에서 찾기(시트끼리 겹침 한 번): ' + 단.찾음.length);
    재(단.셈.제품리스트.단추 === 3 && 단.셈.외부복사용.단추 === 3 && 단.셈.중지단종.단추 === 2 && 단.셈.사은품리스트.제품명칸 === 0, '시트별 단추(찾은 뒤 code7 더함): ' + JSON.stringify(단.셈));
    await p.click('#vp-root td.vp-상품칸 .vp-goods-list button');
    재(await p.evaluate(() => window.__누름 === '맞는 상품 하나'), '단추 누름 = 이름 단추 제 동작');
    /* 거르개 */
    if (너비 === 1280) {
      await p.click('#vp-root .vp-table:not([hidden]) thead tr:last-child th:nth-child(3) .vp-md거름');
      const 판값 = await p.evaluate(() => [...document.querySelectorAll('#vp-root .vp-md거름판 label span')].map((s) => s.textContent));
      재(JSON.stringify(판값) === JSON.stringify(['(모두 선택)', '의자', '책상', '침대']), '거르개 판 = (모두 선택) + 칸 값: ' + 판값);
      await p.click('#vp-root .vp-md거름판 label:has-text("(모두 선택)")');
      await p.click('#vp-root .vp-md거름판 label:has-text("책상")');
      await p.click('#vp-root .vp-md거름판 .vp-md확인');
      const 남 = await p.evaluate(() => { const t = document.querySelector('#vp-root .vp-table:not([hidden]) table'); return [[...t.tBodies[0].rows].filter((r) => !r.hidden).map((r) => r.cells[2].textContent), !!t.querySelector('.vp-md거름켬')]; });
      재(남[0].length === 10 && 남[0].every((x) => x === '책상') && 남[1], '책상만 남음 · 단추 켜짐 표시: ' + 남[0].length);
      await p.click('#vp-root .vp-table:not([hidden]) thead tr:last-child th:nth-child(17) .vp-md거름');
      const 판값2 = await p.evaluate(() => [...document.querySelectorAll('#vp-root .vp-md거름판 label span')].map((s) => s.textContent));
      재(JSON.stringify(판값2) === JSON.stringify(['(모두 선택)', '가짜배송사', '(필드 값 없음)']), '다른 칸 판 = 남은 줄 값만 · 빈칸 = (필드 값 없음): ' + 판값2);
      await p.click('#vp-root .vp-md거름판 label:has-text("(모두 선택)")');
      await p.click('#vp-root .vp-md거름판 label:has-text("(필드 값 없음)")');
      await p.click('#vp-root .vp-md거름판 .vp-md확인');
      const 남2 = await p.evaluate(() => [...document.querySelector('#vp-root .vp-table:not([hidden]) table').tBodies[0].rows].filter((r) => !r.hidden).length);
      재(남2 === 2, '두 칸 거르기 = 그리고: ' + 남2);
      /* 열 끌기 기억 */
      const 손 = p.locator('#vp-root .vp-table:not([hidden]) th .vp-열손').nth(5);
      const 상자 = await 손.boundingBox();
      await p.mouse.move(상자.x + 3, 상자.y + 3); await p.mouse.down(); await p.mouse.move(상자.x + 70, 상자.y + 3, { steps: 4 }); await p.mouse.up();   // 머리 칸 위쪽을 잡아도
      const 둠 = await p.evaluate(() => localStorage.getItem('vp열넓이:MD팀:제품리스트'));
      재(둠 && JSON.parse(둠).제품명 > 0, '끈 넓이 = vp열넓이:MD팀:제품리스트: ' + 둠);
    }
    /* 다른 탭 */
    await p.click('#vp-root .vp-md탭 button:has-text("사은품리스트")');
    const 사 = await p.evaluate(() => { const t = [...document.querySelectorAll('#vp-root .vp-table')].find((x) => !x.hidden).querySelector('table');
      return { 머리: [...t.tHead.rows].length, 칸: [...t.tHead.rows[0].cells].map((c) => c.firstChild.textContent), 줄: t.tBodies[0].rows.length, 거름: t.querySelectorAll('.vp-md거름').length,
        노랑: getComputedStyle(t.tBodies[0].rows[9].cells[3]).backgroundColor, 메모: document.querySelectorAll('#vp-root .vp-md메모 span').length, 공급가: t.tBodies[0].rows[0].cells[2].textContent }; });
    재(사.머리 === 1 && JSON.stringify(사.칸) === JSON.stringify(['상품코드', '사은품명', '공급가', '비고']) && 사.줄 === 12 && 사.거름 === 4 && /255, 242, 204/.test(사.노랑) && 사.메모 === 0 && 사.공급가 === '1,000', '사은품리스트 = 한 줄 머리 4칸·12줄·거르개 4·노랑 칸: ' + JSON.stringify(사));
    await p.click('#vp-root .vp-md탭 button:has-text("외부복사용")');
    const 외 = await p.evaluate(() => { const t = [...document.querySelectorAll('#vp-root .vp-table')].find((x) => !x.hidden).querySelector('table'); const c = (i) => t.tBodies[0].rows[i].cells[8];
      return { 칸: t.tHead.rows[0].cells.length, 머리줄: t.tHead.rows.length, 순서: t.tHead.rows[0].cells[1].firstChild.textContent, 거름: t.querySelectorAll('.vp-md거름').length, 병합: [c(0).textContent, c(0).className, c(1).textContent, c(1).title, c(2).className], 가로: document.documentElement.scrollWidth > innerWidth + 1 }; });
    재(외.칸 === 19 && 외.머리줄 === 1 && 외.순서 === '순서' && 외.거름 === 0, '외부복사용 = 19칸(B 숨김 아님) · 자동필터 없으니 거르개 없음');
    재(외.병합[0] === '세 줄 합친 참고' && !/vp-md병합/.test(외.병합[1]) && 외.병합[2] === '' && 외.병합[3] === '세 줄 합친 참고', '병합 = 첫 칸 값·칸 선 그대로(배송·CS 표)·아래 칸 마우스 올리면 값: ' + JSON.stringify(외.병합));
    재(!외.가로, '탭 바꿔도 쪽 가로 스크롤 없음');
    재(!쪽오류.length, '쪽 오류 없음 ' + 쪽오류.join(' | '));
    재(!밖.length, '밖으로 나간 요청 없음 ' + 밖.join(','));
    재(벤더.every((x) => /^GET /.test(x)), '벤더피아에 쓰기 없음(흉내 goods 라 조회 0): ' + 벤더.join(','));
    재(창고요청.length === 3 && 창고요청.every((x) => /^GET mdteam_inghome/.test(x)) && !창고쓰기.length, '창고 = 열 때 GET 셋(자료·사방넷 링크·화면 입력, 쓰기 0): ' + 창고요청);

    /* ── 11-27 [새 지시 MD팀스마트스토어칸] 「스마트스토어 url」 칸 ── */
    await p.click('#vp-root .vp-md탭 button:has-text("제품리스트")');
    const 링 = await p.evaluate(() => {
      const t = [...document.querySelectorAll('#vp-root .vp-table')].find((x) => !x.hidden).querySelector('table');
      const 칸 = (i) => { const td = t.tBodies[0].rows[i].cells[3]; return { 글: td.textContent, a: [...td.querySelectorAll('a')].map((a) => [a.textContent, a.getAttribute('href'), getComputedStyle(a).color, a.title]), cls: td.className, title: td.title }; };
      return { 머리: [...t.tHead.rows[0].cells].length, r0: 칸(0), r1: 칸(1), r4: 칸(4), r6: 칸(6), r7: 칸(7), 셈: window.VP_MD링크셈(), 설명: /사방넷 품번|다름/.test(document.querySelector('#vp-root .vp-table:not([hidden])').innerText) };
    });
    재(링.머리 === 18, '열 구성 그대로 18칸');
    재(링.r0.a.length === 1 && 링.r0.a[0][1] === 'https://example.com/p/0' && /0, 0, 255/.test(링.r0.a[0][2]) && !/vp-md링크/.test(링.r0.cls), '사방넷 링크 없는 줄 = 엑셀 값 그대로: ' + JSON.stringify(링.r0.a));
    재(링.r1.a.length === 1 && 링.r1.a[0][1] === 'https://smartstore.naver.com/inggagu/products/222' && /vp-md링크채움/.test(링.r1.cls) && /901/.test(링.r1.a[0][3]), '빈 값 = 사방넷 링크 넣음(까닭은 마우스): ' + JSON.stringify(링.r1.a));
    재(링.r4.a.length === 2 && 링.r4.a[0][1] === 'https://example.com/p/4' && /221, 28, 26/.test(링.r4.a[0][2]) && /다름/.test(링.r4.a[0][3]) && 링.r4.a[1][1] === 'https://smartstore.naver.com/inggagu/products/333' && !/221, 28, 26/.test(링.r4.a[1][2]), '다름 = 기존 값 빨강 + 사방넷 링크 함께: ' + JSON.stringify(링.r4.a));
    재(링.r6.a.length === 1 && 링.r6.a[0][1] === 'https://smartstore.naver.com/inggagu/products/444' && /화면 입력/.test(링.r6.title), '화면 입력 값이 엑셀보다 먼저 · 사방넷과 같으면 그대로: ' + JSON.stringify(링.r6));
    재(링.r7.a.length === 2 && /products\/555/.test(링.r7.a[0][1]) && /221, 28, 26/.test(링.r7.a[0][2]) && /화면 입력/.test(링.r7.a[0][3]), '화면 입력 값도 사방넷과 다르면 빨강: ' + JSON.stringify(링.r7.a));
    재(!링.설명, '화면에 설명 글 없음(까닭은 title 만)');
    재(링.셈.제품리스트 && 링.셈.제품리스트.채움 === 1 && 링.셈.제품리스트.다름 === 2 && 링.셈.제품리스트.같음 === 1 && 링.셈.제품리스트.입력 === 2, '셈: ' + JSON.stringify(링.셈.제품리스트));
    /* 한 번 누름 = 링크 열기 · 두 번 누름 = 고치기(새 탭 안 열림) */
    await p.evaluate(() => { window.__열림 = []; window.open = (u) => { window.__열림.push(u); return null; };
      for (const tr of [...document.querySelectorAll('#vp-root .vp-table:not([hidden]) table tbody tr')]) tr.hidden = false; });   // 앞 시험의 거르개가 숨긴 줄 다시 보임
    const 셀 = (i) => `#vp-root .vp-table:not([hidden]) table tbody tr:nth-child(${i + 1}) td:nth-child(4)`;
    await p.click(셀(1) + ' a'); await p.waitForTimeout(450);
    재(JSON.stringify(await p.evaluate(() => window.__열림)) === '["https://smartstore.naver.com/inggagu/products/222"]', '한 번 누름 = 링크 새 탭');
    await p.dblclick(셀(1) + ' a'); await p.waitForTimeout(450);
    const 입력칸 = await p.evaluate((s) => { const i = document.querySelector(s + ' input'); return i && [i.value, window.__열림.length]; }, 셀(1));
    재(입력칸 && 입력칸[0] === '' && 입력칸[1] === 1, '두 번 누름 = 입력칸(새 탭 안 열림): ' + JSON.stringify(입력칸));
    await p.fill(셀(1) + ' input', 'https://brand.naver.com/inggagu/products/777');
    await p.press(셀(1) + ' input', 'Enter'); await p.waitForTimeout(600);
    const 저장후 = await p.evaluate((s) => { const td = document.querySelector(s); return [...td.querySelectorAll('a')].map((a) => [a.getAttribute('href'), getComputedStyle(a).color]); }, 셀(1));
    재(창고쓰기.length === 1 && /^PATCH c_636f646531 /.test(창고쓰기[0]) && /"code":\{"stringValue":"code1"\}/.test(창고쓰기[0]) && /products\/777/.test(창고쓰기[0]), '저장 = 창고 mdteam_inghome_link 에 상품코드 문서 PATCH: ' + 창고쓰기[0]);
    재(저장후.length === 2 && /777/.test(저장후[0][0]) && /221, 28, 26/.test(저장후[0][1]) && /222/.test(저장후[1][0]), '저장 뒤 = 입력 값(사방넷과 다름 → 빨강) + 사방넷 링크: ' + JSON.stringify(저장후));
    await p.dblclick(셀(1)); await p.waitForTimeout(200);
    await p.fill(셀(1) + ' input', ''); await p.press(셀(1) + ' input', 'Enter'); await p.waitForTimeout(600);
    const 지운뒤 = await p.evaluate((s) => [...document.querySelector(s).querySelectorAll('a')].map((a) => a.getAttribute('href')), 셀(1));
    재(창고쓰기.length === 2 && /^DELETE c_636f646531/.test(창고쓰기[1]) && JSON.stringify(지운뒤) === '["https://smartstore.naver.com/inggagu/products/222"]', '비우고 저장 = 입력 지움 → 엑셀(빈 값)+사방넷 링크로: ' + 창고쓰기[1]);
    await p.dblclick(셀(4)); await p.waitForTimeout(200);
    await p.press(셀(4) + ' input', 'Escape'); await p.waitForTimeout(300);
    재(창고쓰기.length === 2 && (await p.evaluate((s) => document.querySelectorAll(s + ' a').length, 셀(4))) === 2, 'Esc = 저장 안 함');
    재(!쪽오류.length, '고친 뒤 쪽 오류 없음 ' + 쪽오류.join(' | '));
    await p.screenshot({ path: path.join(__dirname, '그림', `MD팀-${너비}.png`) });
    await ctx.close();
  }
  console.log('\n■ 사방넷 로그인 연동 (확장 다리 흉내)');
  {
    const 매핑 = [['P1', '5001', '맞는 상품'], ['P2', '5002', '의자'], ['S1', '6001', '키즈가구 (매핑용)'], ['S1', '6002', '키즈가구 (매핑용)']];
    const 단품 = [['P1', 'code1', ''], ['P2', '', 'code3'], ['S1', 'code6', ''], ['S1', 'code4', '']];
    const { p, ctx, 쪽오류, 창고쓰기 } = await 쪽열기(1280, { 사방넷: { 처음로그인: false, 매핑, 단품 } });
    await p.waitForFunction(() => window.VP_MD사방넷 && window.VP_MD사방넷().셈, null, { timeout: 20000 }).catch(() => {});
    const 사 = await p.evaluate(() => ({ 부름: window.__사방넷, 판: window.VP_MD사방넷(), 셈: window.VP_MD링크셈().제품리스트,
      칸: (i) => 0 }));
    const 부름 = 사.부름.join(',');
    재(/^상태,로그인창,(상태,)+창닫기/.test(부름) && 부름.includes('자료'), '들어오면 상태 → 로그인 안 됨 → 사방넷 로그인창 → 2초마다 상태 → 로그인되면 창닫기 → 자료: ' + 부름);
    재(사.판.셈 && 사.판.셈.매핑 === 4 && 사.판.셈.단품 === 4 && 사.판.셈.링크 === 2, '받은 자료 셈 · 링크 = 매핑용 아닌 품번에 스마트스토어 코드 하나인 상품코드만(code1·code3, code4·code6 은 묶음 품번이라 뺌): ' + JSON.stringify(사.판.셈));
    const 칸 = await p.evaluate(() => { const t = [...document.querySelectorAll('#vp-root .vp-table')].find((x) => !x.hidden).querySelector('table'); const f = (i) => [...t.tBodies[0].rows[i].cells[3].querySelectorAll('a')].map((a) => a.getAttribute('href')); return [f(1), f(3), f(4), f(6)]; });
    재(JSON.stringify(칸) === JSON.stringify([['https://smartstore.naver.com/inggagu/products/5001'], ['https://smartstore.naver.com/inggagu/products/5002'], ['https://example.com/p/4'], ['https://smartstore.naver.com/inggagu/products/444']]),
      '연동 뒤 칸 = 새 사방넷 링크로 다시 그림(빈 칸 채움 · 사방넷에 없으면 엑셀·화면 입력 그대로): ' + JSON.stringify(칸));
    재(창고쓰기.some((x) => /^PATCH sabang /.test(x) && /5001/.test(x) && /MD팀 사방넷 로그인 연동/.test(x)), '마지막 연동 결과를 창고 mdteam_inghome_sabang/links 에 새로 적음');
    재(!창고쓰기.some((x) => /비밀|password|pw/i.test(x)), '창고에 비밀번호 같은 것 없음');
    await p.click('#vp-root .vp-md탭 button:has-text("사방넷")');
    const 탭 = await p.evaluate(() => { const 통 = document.querySelector('#vp-root .vp-md사방넷'); const t = 통.querySelector('table');
      const 꼴 = getComputedStyle(통), 줄칸 = document.querySelector('#vp-root .vp-md사방넷줄');
      return { 보임: !통.hidden, 줄글: 줄칸.innerText, 줄칸보임: !줄칸.hidden, 바로아래: 통.parentElement.classList.contains('vp-search') && 통.classList.contains('vp-table'),
        밀림: 꼴.overflowY + '/' + 꼴.overflowX + '/' + 꼴.flexGrow + '/' + 꼴.minHeight, 안넘침: 통.getBoundingClientRect().bottom <= innerHeight + 1, 쪽가로: document.documentElement.scrollWidth > innerWidth + 1, 머리: [...t.tHead.rows[0].cells].map((c) => c.firstChild.textContent), 줄: t.tBodies[0].rows.length, 손: t.querySelectorAll('.vp-열손, [class*=손]').length,
        시트숨음: [...document.querySelectorAll('#vp-root .vp-table')].filter((x) => !x.closest('.vp-md사방넷')).every((x) => x.hidden) }; });
    재(탭.보임 && 탭.시트숨음 && /mw0000 로그인/.test(탭.줄글) && /링크 2/.test(탭.줄글) && 탭.줄 === 2 && 탭.머리.join(',') === '상품코드,사방넷 품번,스마트스토어 상품코드,스마트스토어 링크,MD팀', '「사방넷」 탭 = 로그인 상태·셈 + 링크 표: ' + JSON.stringify(탭));
    재(탭.바로아래 && 탭.줄칸보임 && 탭.밀림 === 'auto/auto/1/0px' && 탭.안넘침 && !탭.쪽가로, '사방넷 표 통 = 시트 표와 같은 .vp-search 바로 아래 .vp-table(남은 높이·통 안에서 세로·가로 밀림 · 쪽 가로 스크롤 없음): ' + JSON.stringify([탭.바로아래, 탭.밀림, 탭.안넘침, 탭.쪽가로]));
    await p.click('#vp-root .vp-md탭 button:has-text("제품리스트")');
    재(await p.evaluate(() => document.querySelector('#vp-root .vp-md사방넷').hidden && document.querySelector('#vp-root .vp-md사방넷줄').hidden), '시트 탭으로 돌아가면 사방넷 통·줄 숨음');
    재(!쪽오류.length, '쪽 오류 없음 ' + 쪽오류.join(' | '));
    await p.screenshot({ path: path.join(__dirname, '그림', 'MD팀-사방넷.png') });
    await ctx.close();
  }
  console.log('\n■ 사방넷 이미 로그인');
  {
    const { p, ctx } = await 쪽열기(1280, { 사방넷: { 처음로그인: true, 매핑: [['P1', '5001', '맞는 상품']], 단품: [['P1', 'code1', '']] } });
    await p.waitForFunction(() => window.VP_MD사방넷 && window.VP_MD사방넷().셈, null, { timeout: 20000 }).catch(() => {});
    const 부름 = await p.evaluate(() => window.__사방넷.join(','));
    재(!부름.includes('로그인창') && 부름.includes('자료'), '이미 로그인이면 창 안 열고 바로 자료: ' + 부름);
    await ctx.close();
  }
  console.log('\n■ 창고 비었음');
  {
    const { p, ctx } = await 쪽열기(1280, { 창고없음: true });
    const 글 = await p.evaluate(() => document.querySelector('#vp-root .vp-note').textContent);
    재(/받지 못했습니다/.test(글), '알림: ' + 글);
    await ctx.close();
  }
  await b.close();
  console.log(`\n★ 초록 ${초록} · 빨강 ${빨강}`);
  process.exit(빨강 ? 1 : 0);
})();
