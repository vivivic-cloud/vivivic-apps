/* **비요크선불비변경** 메뉴를 재는 자 (11-25 [새 지시 비요크선불비변경]). 자료는 전부 지어낸 값이다 — 진짜 파일을 여기 넣지 마라(고객 정보).
   흉내 = 사장님 파일 꼴: 1줄 메모(병합 칸) · 2줄 제목(배송관리 칸 + 「선불 수정 」) · 칠한 줄(채움 FFF2CB) · 흰 채움(theme 0) · 채움 없음 · 숫자 「15000.0」 꼴.
   돌리기: NODE_PATH=<playwright(-core) 있는 node_modules> VP_EXE=<크로미움> node 잰것/비요크.cjs
   (VP_REAL=<저장소 밖 .xlsx> 를 주면 그 파일도 올려 줄 수·칠한 줄 수·합만 찍는다 — 값은 안 찍는다) */
let pw; try { pw = require('playwright'); } catch (e) { pw = require('playwright-core'); }
const { chromium } = pw;
const fs = require('fs'), path = require('path');
const 확장 = path.join(__dirname, '..');
const EXE = process.env.VP_EXE || process.env.PW_EXE || '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';

/* ── 지어낸 .xlsx (저장만 하는 zip) ── */
const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function zip(파일들) {
  const 앞 = [], 뒤 = []; let 자리 = 0;
  for (const [이름, 글] of 파일들) {
    const n = Buffer.from(이름), d = Buffer.from(글), c = crc(d);
    const h = Buffer.alloc(30); h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(0x800, 6); h.writeUInt32LE(c, 14); h.writeUInt32LE(d.length, 18); h.writeUInt32LE(d.length, 22); h.writeUInt16LE(n.length, 26);
    앞.push(h, n, d);
    const g = Buffer.alloc(46); g.writeUInt32LE(0x02014b50, 0); g.writeUInt16LE(20, 4); g.writeUInt16LE(20, 6); g.writeUInt16LE(0x800, 8); g.writeUInt32LE(c, 16); g.writeUInt32LE(d.length, 20); g.writeUInt32LE(d.length, 24); g.writeUInt16LE(n.length, 28); g.writeUInt32LE(자리, 42);
    뒤.push(g, n);
    자리 += 30 + n.length + d.length;
  }
  const 뒤판 = Buffer.concat(뒤), e = Buffer.alloc(22);
  e.writeUInt32LE(0x06054b50, 0); e.writeUInt16LE(파일들.length, 8); e.writeUInt16LE(파일들.length, 10); e.writeUInt32LE(뒤판.length, 12); e.writeUInt32LE(자리, 16);
  return Buffer.concat([...앞, 뒤판, e]);
}
const 머리 = ['CS', '매출처', '생산처', '몰', '수취인', '전화', '휴대전화', '주문자', '주문자휴대폰', '주문번호', '고유번호', '배송번호', '송장번호', '배송상태', '상품명', '옵션값', '수량', '박스', '권역', '주소', '배송사', '선불비', '선불 수정 ', '착불비', '제품비', '주문등록일', '입고확인', '지정일', '지사출발', '지사도착', '지방상태', '지방일자', '배송출발', '배송완료일', '회수', '배송메세지', '기사메모', '메모', '본사메모'];
const 줄들 = [ // [칠 꼴(s), 선불비] — 첫 줄은 CS 「취소」(취소 줄 색보다 파일 색이 이김)
  [7, 15000], [7, 10000], [7, 12000], [6, 15000], [0, 10000],
];
const 열 = (i) => { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
const 공유 = [];
const 글칸 = (r, i, 값, s) => { 공유.push(값); return `<c r="${열(i)}${r}" s="${s}" t="s"><v>${공유.length - 1}</v></c>`; };
const 수칸 = (r, i, 값, s) => `<c r="${열(i)}${r}" s="${s}"><v>${값}.0</v></c>`;
function 가짜파일() {
  공유.length = 0;
  let 몸 = `<row r="1">${글칸(1, 12, '가짜 메모 3건/ 37000원', 1)}${글칸(1, 20, '가짜 수정/ 총 5건 \n62000>25000', 3)}${글칸(1, 22, '가짜 안내 글', 4)}</row>`;
  몸 += `<row r="2">${머리.map((h, i) => 글칸(2, i, h, i === 22 ? 6 : 5)).join('')}</row>`;
  줄들.forEach(([s, 선불], k) => {
    const r = k + 3;
    몸 += `<row r="${r}">${머리.map((h, i) => {
      if (h === '선불비') return 수칸(r, i, 선불, s);
      if (h === '선불 수정 ') return 수칸(r, i, 5000, s);
      if (h === '수량' || h === '박스') return 수칸(r, i, 1, s);
      const 값 = { CS: k === 0 ? '취소' : '', 매출처: '가상몰', 몰: '가짜', 수취인: '홍가짜' + k, 주문번호: '9000000000' + k, 고유번호: '100' + k, 배송상태: '주문확정', 상품명: '가짜 협탁 ' + k, 옵션값: '(가짜) 협탁', 배송사: '가짜물류', 주문등록일: '26.11.20  ' }[h];
      return 값 ? 글칸(r, i, 값, s) : `<c r="${열(i)}${r}" s="${s}"/>`;
    }).join('')}</row>`;
  });
  몸 += `<row r="9"><c r="A9" s="7"/><c r="B9" s="7"/></row>`; // 꼴만 있는 빈 줄
  const 시트 = `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${몸}</sheetData><mergeCells count="1"><mergeCell ref="M1:P1"/></mergeCells></worksheet>`;
  const 공유글 = `<?xml version="1.0" encoding="UTF-8"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${공유.map((t) => `<si><t xml:space="preserve">${t.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</t></si>`).join('')}</sst>`;
  const 꼴 = `<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fills count="5"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="lightGray"/></fill><fill><patternFill patternType="solid"><fgColor theme="0"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFDFE3E8"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFF2CB"/></patternFill></fill></fills><cellXfs count="9"><xf fillId="0"/><xf fillId="0"/><xf fillId="0"/><xf fillId="0"/><xf fillId="2"/><xf fillId="3"/><xf fillId="2"/><xf fillId="4"/><xf fillId="2"/></cellXfs></styleSheet>`;
  const 테마 = `<?xml version="1.0" encoding="UTF-8"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:themeElements><a:clrScheme name="x"><a:dk1><a:srgbClr val="000000"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="16365C"/></a:dk2><a:lt2><a:srgbClr val="EEECE1"/></a:lt2></a:clrScheme></a:themeElements></a:theme>`;
  return zip([
    ['xl/workbook.xml', '<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Sheet1" sheetId="1" r:id="rId3"/></sheets></workbook>'],
    ['xl/_rels/workbook.xml.rels', '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId3" Target="worksheets/sheet1.xml"/></Relationships>'],
    ['xl/sharedStrings.xml', 공유글], ['xl/styles.xml', 꼴], ['xl/theme/theme1.xml', 테마], ['xl/worksheets/sheet1.xml', 시트],
  ]);
}

(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  let 초록 = 0, 빨강 = 0;
  const 재 = (참, 말) => { console.log((참 ? '  ✓ ' : '  ✗ ') + 말); 참 ? 초록++ : 빨강++; };
  async function 쪽열기(ctx) {
    const p = await ctx.newPage();
    const 보낸 = [], 쪽오류 = [], 밖 = [];
    p.on('pageerror', (e) => 쪽오류.push(String(e)));
    await p.route('**/*', async (r) => {
      const q = r.request(), u = new URL(q.url());
      if (u.hostname === 'vivivic-cloud.github.io') {
        const 이름 = decodeURIComponent(u.pathname.split('/').pop());
        return r.fulfill({ status: 200, contentType: 'text/javascript; charset=utf-8', body: 이름 === '비요크.js' ? fs.readFileSync(path.join(확장, 이름)) : '' });
      }
      if (u.hostname !== 'vendorpia.com') {
        /* 상담 셈 읽기(익명 표·Firestore)는 CS등록과 같은 길 — 파일 값(이름·주문번호)이 실리면 안 된다 */
        const 실림 = q.url() + ' ' + (q.postData() || '');
        if (/googleapis\.com$/.test(u.hostname) && !/홍가짜|9000000000|가짜 협탁|가상몰/.test(decodeURIComponent(실림))) return r.abort();
        밖.push(q.method() + ' ' + u.hostname); return r.abort();
      }
      if (q.method() !== 'GET' || !/orderMst/i.test(u.pathname)) 보낸.push(q.method() + ' ' + u.pathname);
      return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: '<html><body><form id="aspnetForm" action="./orderMst.aspx"><input type="image" id="btnSearch" name="ctl00$Contents$btnSearch"><input id="dcStartDt" value="2026-10-25"><input id="dcEndDt" value="2026-11-25"></form></body></html>' });
    });
    await p.goto('https://vendorpia.com/System/Sales/orderMst.aspx#vgByk');
    await p.addStyleTag({ content: fs.readFileSync(path.join(확장, 'login.css'), 'utf8') + fs.readFileSync(path.join(확장, 'search.css'), 'utf8') });
    await p.addScriptTag({ content: fs.readFileSync(path.join(확장, 'vp-data.js'), 'utf8').replace(/^const VP_DATA/m, 'window.VP_DATA') + ';if(typeof VP_DATA!=="undefined")window.VP_DATA=VP_DATA' });
    await p.addScriptTag({ content: fs.readFileSync(path.join(확장, 'search.js'), 'utf8') });
    await p.waitForSelector('#vp-root .vp-비요크줄', { timeout: 20000 });
    return { p, 보낸, 쪽오류, 밖 };
  }
  const 판읽기 = (p) => p.evaluate(() => {
    const t = document.querySelector('#vp-root table.vp-촘촘');
    const 몸 = t ? [...t.tBodies[0].rows] : [];
    const cs = 몸[0] && getComputedStyle(몸[0].cells[1]);
    return { h1: document.querySelector('#vp-root h1')?.textContent, th: t && [...t.tHead.rows[0].cells].map((c) => c.firstChild.textContent), 줄: 몸.length,
      칠: 몸.map((tr) => getComputedStyle(tr.cells[3]).backgroundColor), 칠첫칸: 몸[0] && getComputedStyle(몸[0].cells[0]).backgroundColor,
      메모: document.querySelector('#vp-root .vp-비요크메모')?.textContent, 셈: document.querySelector('#vp-root .vp-비요크셈')?.textContent,
      파일: document.querySelector('#vp-root .vp-비요크파일')?.textContent, 알림: document.querySelector('#vp-root .vp-note')?.textContent,
      선불: 몸.map((tr) => tr.cells[21].textContent), 글: cs && cs.fontSize, 높이: 몸[0] && 몸[0].getBoundingClientRect().height,
      손: t ? t.querySelectorAll('.vp-열손').length : 0, 검색창숨김: getComputedStyle(document.querySelector('#vp-root .vp-bar')).display === 'none',
      쪽가로: document.documentElement.scrollWidth > innerWidth + 1, 기억: !!localStorage.getItem('vp비요크'), 상품칸: document.querySelectorAll('#vp-root td.vp-상품칸').length,
      줄누름: 몸.filter((tr) => tr.classList.contains('vp-줄상담')).length, 지우기넓이: document.querySelector('#vp-root .vp-지우기')?.getBoundingClientRect().width };
  });

  for (const 너비 of [1280, 375]) {
    console.log('\n■ ' + 너비);
    const ctx = await b.newContext({ viewport: { width: 너비, height: 900 } });
    const { p, 보낸, 쪽오류, 밖 } = await 쪽열기(ctx);
    재((await 판읽기(p)).h1 === '비요크선불비변경', '제목 「비요크선불비변경」');
    await p.setInputFiles('#vp-root .vp-비요크줄 input[type=file]', { name: '가짜.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: 가짜파일() });
    await p.waitForFunction(() => document.querySelectorAll('#vp-root table.vp-촘촘 tbody tr').length > 0, null, { timeout: 15000 });
    let 판 = await 판읽기(p);
    재(판.검색창숨김, '주문관리 검색창은 숨김');
    재(JSON.stringify(판.th) === JSON.stringify(머리.map((h) => h.trim())), '칸 = 파일 칸 그대로 39칸(선불비·선불 수정 포함): ' + (판.th || []).length);
    재(판.줄 === 5, '줄 = 글 있는 줄 5(꼴만 있는 빈 줄 뺌): ' + 판.줄);
    재(JSON.stringify(판.칠) === JSON.stringify(['rgb(255, 242, 203)', 'rgb(255, 242, 203)', 'rgb(255, 242, 203)', 'rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)']), '칠한 줄 3 = 파일 색(FFF2CB) · 흰 채움·채움 없음은 안 칠함: ' + 판.칠.join(' / '));
    재(판.칠첫칸 === 'rgb(255, 242, 203)', '붙박이 첫 칸도 칠함');
    재(판.메모 && 판.메모.includes('가짜 메모 3건/ 37000원') && 판.메모.includes('62000>25000'), '맨 위 메모 글 보임');
    재(/줄\s*5/.test(판.셈) && /칠한 줄\s*3/.test(판.셈) && /선불비\s*62,000/.test(판.셈) && /선불 수정\s*25,000/.test(판.셈) && /칠한 줄 선불비\s*37,000/.test(판.셈) && /칠한 줄 선불 수정\s*15,000/.test(판.셈), '셈: ' + 판.셈);
    재(JSON.stringify(판.선불) === JSON.stringify(['15000', '10000', '12000', '15000', '10000']), '숫자 「15000.0」 → 15000: ' + 판.선불.join(','));
    재(판.글 === '11px' && Math.round(판.높이) === 25, '꼴 11px · 줄 25px: ' + 판.글 + ' ' + 판.높이);
    재(판.손 === 39, '열 끌기 손잡이 39: ' + 판.손);
    재(판.상품칸 === 5, '상품명 칸 = 이름 단추 자리 5: ' + 판.상품칸);
    재(판.줄누름 === 5, '줄 누름(상담) = 다른 표와 같음 5: ' + 판.줄누름);
    재(!판.쪽가로, '쪽 전체 가로 스크롤 없음');
    재(판.지우기넓이 > 0 && 판.지우기넓이 < 100, '「지우기」 단추 = 작은 단추(쪽 너비로 안 늘어남): ' + Math.round(판.지우기넓이));
    재(판.기억 && 판.파일.startsWith('가짜.xlsx'), '브라우저 안에 기억 · 파일 이름: ' + 판.파일);
    /* 다시 열기 → 기억으로 그대로 */
    const { p: p2, 보낸: 보낸2, 쪽오류: 오류2 } = await 쪽열기(ctx);
    await p2.waitForFunction(() => document.querySelectorAll('#vp-root table.vp-촘촘 tbody tr').length > 0, null, { timeout: 15000 });
    const 판2 = await 판읽기(p2);
    재(판2.줄 === 5 && 판2.칠.filter((c) => c === 'rgb(255, 242, 203)').length === 3 && 판2.메모.includes('가짜 메모'), '다시 열어도 그대로(줄 5·칠 3·메모)');
    await p2.click('#vp-root .vp-지우기');
    const 판3 = await 판읽기(p2);
    재(!판3.기억 && 판3.줄 === 0 && !판3.셈 && !판3.메모, '지우기 = 기억·표·메모·셈 지움');
    /* 엉뚱한 파일 */
    await p2.setInputFiles('#vp-root .vp-비요크줄 input[type=file]', { name: '깨짐.xlsx', mimeType: 'application/octet-stream', buffer: Buffer.from('아님') });
    await p2.waitForFunction(() => /읽지 못/.test(document.querySelector('#vp-root .vp-note').textContent), null, { timeout: 5000 }).catch(() => {});
    재(/읽지 못/.test((await 판읽기(p2)).알림), '깨진 파일 = 알림 한 줄');
    재(![...보낸, ...보낸2].some((x) => !x.startsWith('GET')), '벤더피아 POST 0: ' + [...보낸, ...보낸2].join(','));
    재(!밖.length, '파일 값이 밖으로 안 나감(구글 익명 표 길에도 안 실림) ' + 밖.join(','));
    재(!쪽오류.length && !오류2.length, '쪽 오류 없음 ' + [...쪽오류, ...오류2].join(' | '));
    await ctx.close();
  }
  if (process.env.VP_REAL) {
    console.log('\n■ 진짜 파일(숫자만)');
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    const { p } = await 쪽열기(ctx);
    await p.setInputFiles('#vp-root .vp-비요크줄 input[type=file]', process.env.VP_REAL);
    await p.waitForFunction(() => document.querySelectorAll('#vp-root table.vp-촘촘 tbody tr').length > 0, null, { timeout: 15000 });
    const 판 = await 판읽기(p);
    console.log('  칸 ' + 판.th.length + ' · 줄 ' + 판.줄 + ' · 칠한 줄 ' + 판.칠.filter((c) => !/rgba\(0, 0, 0, 0\)/.test(c)).length + ' · 색 ' + [...new Set(판.칠)].join(',') + ' · 셈 「' + 판.셈 + '」 · 메모 칸 ' + (await p.evaluate(() => document.querySelectorAll('#vp-root .vp-비요크메모 span').length)));
    await ctx.close();
  }
  await b.close();
  console.log(`\n★ 초록 ${초록} · 빨강 ${빨강}`);
  process.exit(빨강 ? 1 : 0);
})();
