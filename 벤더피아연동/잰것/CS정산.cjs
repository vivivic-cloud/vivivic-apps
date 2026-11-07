/* **CS정산** 을 재는 자 (11-07 [새 지시 CS정산]). 자료는 전부 지어낸 값이다.
   흉내 = 사장님 크롬에서 잰 주문관리 꼴: #oGrid 69칸·머리/몸 다른 table·합계 「행수: N건」·Pager1 쪽 링크 10개 + 11·21쪽은 Next 그림 단추·tbRecipient 부분 맞춤.
   돌리기: NODE_PATH=<playwright(-core) 있는 node_modules> VP_EXE=<크로미움> node 잰것/CS정산.cjs */
let pw; try { pw = require('playwright'); } catch (e) { pw = require('playwright-core'); }
const { chromium } = pw;
const fs = require('fs'), path = require('path'), zlib = require('zlib'), { execFileSync } = require('child_process');
const 확장 = path.join(__dirname, '..');
const EXE = process.env.VP_EXE || process.env.PW_EXE || '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const 머리 = ['', 'Page', 'CS', 'CS주문번호', 'IMG', '주문번호', '블랙번호', '매출처코드', '단품분류', '매출처', '생산처', '몰', '계정', '주문번호', '상품코드', '상품명', '매출처상품명', '단품구성', '주문옵션', '수량', '가용수량', '박스수량', '판매금액', '공급금액', '매입처', '매입금액', '매출이익', '마진%', '판매단가', '공급단가', '수취인', '선불비', '착불비', '제품비', '전화', '핸드폰', '알림', '상태', '우편번호', '주소', '배송메세지', '물류메모', '배송메모', '본사메모', '배송사', '배송상태', '송장번호', '등록일', '입고일', '지사출발', '지사도착', '출발일', '완료일', '실판매가', '배송예정일', '등록자', '옵션상품여부', '색강조', '수정이력', '알림', '전화', '핸드폰', '주문전달', '알림', '알림', '발송여부', '발송구분', 'LastTimeStamp', 'colorRGB'];
/* 벤더피아가 보이는 칸(11-07 실제 화면 34칸 — 첫 칸은 체크). 나머지는 th 가 display:none */
const 보이는칸 = ['', 'CS', 'IMG', '매출처', '몰', '주문번호#2', '상품코드', '상품명', '단품구성', '주문옵션', '수량', '가용수량', '박스수량', '판매금액', '수취인', '선불비', '착불비', '알림', '주소', '배송메세지', '물류메모', '배송메모', '본사메모', '배송사', '배송상태', '송장번호', '등록일', '입고일', '지사출발', '지사도착', '출발일', '완료일', '등록자', '수정이력'];
const 숨김자리 = new Set(머리.map((h, i) => i).filter((i) => {
  if (i === 0) return false;
  if (머리[i] === '주문번호') return i !== 머리.lastIndexOf('주문번호');
  if (머리[i] === '알림') return i !== 머리.indexOf('알림');
  return !보이는칸.includes(머리[i]) || 머리.indexOf(머리[i]) !== i;
}));
const 칸 = Object.fromEntries(['수취인', '주문옵션', '물류메모', '등록일', '매출처', '몰', '상품코드', '상품명', '단품구성', '수량', 'CS', '배송상태'].map((h) => [h, 머리.indexOf(h)]));
/* 줄 3,000 — 앞 여섯 수취인은 시험 값, 나머지는 「손님N」 */
const 주문들 = Array.from({ length: 3000 }, (_, i) => {
  const 값 = Array(69).fill('');
  값[5] = String(1000000 + i); 값[13] = 'M-' + i;
  값[칸.수취인] = '손님' + (i % 300); 값[칸.주문옵션] = '색상: 화이트 / ' + (i % 7); 값[칸.물류메모] = i % 2 ? '문앞 ' + (i % 5) : '';
  값[칸.등록일] = '2026-01-01'; 값[칸.매출처] = '가상몰'; 값[칸.몰] = '몰A'; 값[칸.상품코드] = 'P' + i; 값[칸.상품명] = '가짜 책장 ' + i; 값[칸.단품구성] = '가짜 몸통+가짜 문'; 값[칸.수량] = '1'; 값[칸.CS] = ''; 값[칸.배송상태] = '배송완료';
  return 값;
});
const 심기 = (i, 이름, 옵션, 메모) => { 주문들[i][칸.수취인] = 이름; 주문들[i][칸.주문옵션] = 옵션; 주문들[i][칸.물류메모] = 메모; };
심기(10, '가나다', '색상: Oak / 대형', '설치 요청');   // 빈칸·대소문자 차이로 맞을 줄
심기(1505, '가나다', '색상: Oak / 대형', '설치 요청'); // 같은 세 칸이 뒤쪽 쪽에도
심기(20, '라마바', '옵션A', '');                       // 메모 빈 줄
심기(2900, '사아자', '옵션B', '메모B');                // 맨 뒤쪽
심기(30, '라마바사', '옵션A', '');                     // 수취인 부분 맞춤 — 맞으면 안 됨
심기(40, '차카타', '옵션C', '다른 메모');              // 메모 다름 — 못 찾음이어야
주문들[20][칸.CS] = '취소';                             // 취소 줄 칠하기가 CS등록과 같은가

const 쪽html = ({ 줄들, 지금, 전체, 쪽크기, 받는이 = '' }) => {
  const 끝쪽 = Math.ceil(전체 / 쪽크기) || 1, 묶음시작 = Math.floor((지금 - 1) / 10) * 10 + 1;
  const 링크 = []; for (let n = 묶음시작; n < 묶음시작 + 10 && n <= 끝쪽; n++) 링크.push(`<a class="PageNum" href="javascript:__doPostBack('ctl00$Contents$Pager1$ctl${9 + (n - 묶음시작 + 1) * 2}','')">${n}</a>`);
  const 다음 = 묶음시작 + 10 <= 끝쪽 ? `<input type="image" name="ctl00$Contents$Pager1$ctl32" id="Pager1_ctl32" alt="Next" src="r.svg">` : '';
  return `<html><body id="body"><form id="aspnetForm" method="post" action="./orderMst.aspx"><input type="hidden" name="__VIEWSTATE" value="x"><input type="hidden" name="__EVENTTARGET"><input type="hidden" name="__EVENTARGUMENT">
<input type="text" name="ctl00$Contents$tbRecipient" value="${받는이}"><input type="text" name="ctl00$Contents$dcStartDt" value="2026-10-07"><input type="text" name="ctl00$Contents$dcEndDt" value="2026-11-07">
<select name="ctl00$Contents$ddlRowCnt">${[10, 50, 100, 700].map((n) => `<option value="${n}"${n === 쪽크기 ? ' selected' : ''}>${n}</option>`).join('')}</select>
<input type="image" id="btnSearch" name="ctl00$Contents$btnSearch" src="s.gif"><input type="image" name="ctl00$Contents$btnDelete" src="d.gif">
<span>주문수량: 1 / 행수: ${전체.toLocaleString()}건 / 매입금액: 0원</span>
<style>.숨은칸{display:none}</style><div id="oGrid"><table><tr>${머리.map((h, i) => `<th class="igg_HeaderCaption${숨김자리.has(i) ? ' 숨은칸' : ''}" style="width: 40px;">${h}</th>`).join('')}</tr></table><div><table>${줄들.map((값) => `<tr>${값.map((v, i) => `<td${i === 칸.물류메모 ? ` title="${v || '&nbsp;'}"` : ''}${숨김자리.has(i) ? ' class="숨은칸"' : ''}>${i === 0 ? '<input type="checkbox" name="chkItem">' : v || '&nbsp;'}</td>`).join('')}</tr>`).join('')}</table></div></div>
<div id="Pager1"><input type="hidden" name="ctl00$Contents$Pager1$hdCurrentPage" value="${지금}"><input type="hidden" name="ctl00$Contents$Pager1$ctl01" value="${전체}">${링크.join('')}${다음}</div>
</form></body></html>`;
};

/* ── 올릴 파일 ── */
function zip(칸들) {
  const 몸 = [], 끝 = []; let p = 0;
  const u32 = (n) => { const b = Buffer.alloc(4); b.writeUInt32LE(n); return b; }, u16 = (n) => { const b = Buffer.alloc(2); b.writeUInt16LE(n); return b; };
  for (const [이름, 글] of Object.entries(칸들)) {
    const 원 = Buffer.from(글), 압 = zlib.deflateRawSync(원), n = Buffer.from(이름);
    const 머 = Buffer.concat([u32(0x04034b50), u16(20), u16(0x800), u16(8), u16(0), u16(0), u32(0), u32(압.length), u32(원.length), u16(n.length), u16(0), n]);
    끝.push(Buffer.concat([u32(0x02014b50), u16(20), u16(20), u16(0x800), u16(8), u16(0), u16(0), u32(0), u32(압.length), u32(원.length), u16(n.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(p), n]));
    몸.push(머, 압); p += 머.length + 압.length;
  }
  const 판 = Buffer.concat(끝);
  return Buffer.concat([...몸, 판, u32(0x06054b50), u16(0), u16(0), u16(끝.length), u16(끝.length), u32(판.length), u32(p), u16(0)]);
}
const xlsx = (시트들) => {
  const 공유 = [], 값글 = (v) => `<t xml:space="preserve">${String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</t>`;
  const 줄글 = (줄들) => 줄들.map(([n, 값들]) => `<row r="${n}">${값들.map((v, i) => {
    const 참 = String.fromCharCode(65 + i) + n;
    if (v === '') return '';
    if (typeof v === 'number') return `<c r="${참}"><v>${v}</v></c>`;
    if (v.인라인) return `<c r="${참}" t="inlineStr"><is>${값글(v.인라인)}</is></c>`;
    공유.push(v); return `<c r="${참}" t="s"><v>${공유.length - 1}</v></c>`;
  }).join('')}</row>`).join('');
  const 파일 = {}, 판 = [], 연결 = [];
  시트들.forEach(([이름, 줄들], i) => {
    파일[`xl/worksheets/sheet${i + 1}.xml`] = `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${줄글(줄들)}</sheetData></worksheet>`;
    판.push(`<sheet name="${이름}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`);
    연결.push(`<Relationship Id="rId${i + 1}" Type="x" Target="worksheets/sheet${i + 1}.xml"/>`);
  });
  파일['xl/workbook.xml'] = `<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${판.join('')}</sheets></workbook>`;
  파일['xl/_rels/workbook.xml.rels'] = `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${연결.join('')}</Relationships>`;
  /* 첫 공유 글에는 한글 엑셀처럼 읽는 법(rPh)을 붙인다 — 값에 섞이면 안 된다 */
  파일['xl/sharedStrings.xml'] = `<?xml version="1.0"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${공유.map((v, i) => `<si>${String(v).length > 3 && i % 2 ? `<r>${값글(String(v).slice(0, 2))}</r><r>${값글(String(v).slice(2))}</r>` : 값글(v)}${i === 0 ? '<rPh sb="0" eb="1"><t>읽는법</t></rPh>' : ''}</si>`).join('')}</sst>`;
  return zip(파일);
};
const 엑셀 = xlsx([
  ['안내', [[1, ['아무 글']]]],
  ['정산', [
    [1, ['6월 정산 자료']],
    [3, ['번호', '수취인', '옵션값', ' 메모 ', '금액']],
    [4, [1, ' 가나다 ', '색상: OAK /  대형', '설치\n요청', 100]],
    [6, [2, '라마바', '옵션A', '', 200]],
    [7, [3, { 인라인: '사아자' }, '옵션B', '메모B', 300]],
    [8, [4, '차카타', '옵션C', '메모C', 400]],
    [9, [5, '', '옵션D', '수취인 빈 줄', 500]],
    [10, ['', '', '', '', '']],
  ]],
]);
const 여럿csv = Buffer.from('﻿수취인,옵션값,메모\n' + ['가나다,"색상: Oak / 대형",설치 요청', '라마바,옵션A,', '사아자,옵션B,메모B', '손님1,없는옵션,', '손님2,없는옵션,', '손님3,없는옵션,', '손님4,없는옵션,', '손님5,없는옵션,'].join('\r\n'));
const 한글csv = execFileSync('python3', ['-c', 'import sys;sys.stdout.buffer.write("수취인,옵션값,메모\\n사아자,옵션B,메모B\\n".encode("euc-kr"))']);

(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  let 초록 = 0, 빨강 = 0;
  const 재 = (참, 말) => { console.log((참 ? '  ✓ ' : '  ✗ ') + 말); 참 ? 초록++ : 빨강++; };
  async function 쪽열기(너비, 끊기 = () => false, 늦음 = 0) {
    const ctx = await b.newContext({ viewport: { width: 너비, height: 900 } });
    const p = await ctx.newPage();
    const 보낸 = [], 쪽오류 = [], 밖 = [], 밖글 = [];
    p.on('pageerror', (e) => 쪽오류.push(String(e)));
    await ctx.route('**/*', async (r) => {
      const q = r.request(), u = new URL(q.url());
      if (u.hostname === 'vivivic-cloud.github.io') {
        const 이름 = decodeURIComponent(u.pathname.split('/').pop());
        return r.fulfill({ status: 200, contentType: 'text/javascript; charset=utf-8', body: fs.existsSync(path.join(확장, 이름)) && 이름 === 'cs정산.js' ? fs.readFileSync(path.join(확장, 이름)) : '' });
      }
      if (u.hostname !== 'vendorpia.com') { 밖.push(q.method() + ' ' + u.hostname); 밖글.push(q.url() + ' ' + (q.postData() || '')); return r.abort(); }
      if (!/orderMst/i.test(u.pathname)) return r.fulfill({ status: 200, body: '' });
      if (q.method() !== 'POST') return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 쪽html({ 줄들: 주문들.slice(0, 2), 지금: 1, 전체: 주문들.length, 쪽크기: 50 }) });
      const 글 = q.postDataBuffer().toString('utf8');
      const 값 = (k) => (글.match(new RegExp(`name="${k.replace(/\$/g, '\\$')}"\\r\\n\\r\\n([^\\r]*)`)) || [])[1] || '';
      const 쪽값 = { 받는이: 값('ctl00$Contents$tbRecipient'), 시작: 값('ctl00$Contents$dcStartDt'), 끝: 값('ctl00$Contents$dcEndDt'), 줄수: Number(값('ctl00$Contents$ddlRowCnt')) || 50, 쪽: Number(값('ctl00$Contents$Pager1$hdCurrentPage')) || 1, 대상: 값('__EVENTTARGET'), 다음: 글.includes('Pager1$ctl32.x'), 지움: /btnDelete|btnInsert|btnSave/.test(글), 조회: 글.includes('btnSearch.x') };
      보낸.push(쪽값);
      if (끊기(보낸.length)) return r.fulfill({ status: 200, contentType: 'text/html', body: '<html><body><form><input type="password"></form></body></html>' });
      if (늦음) await new Promise((res) => setTimeout(res, 늦음));
      const 몫 = 주문들.filter((값들) => !쪽값.받는이 || 값들[칸.수취인].includes(쪽값.받는이.trim()));
      let 쪽 = 1;
      if (!쪽값.조회) {
        const 묶음시작 = Math.floor((쪽값.쪽 - 1) / 10) * 10 + 1, m = 쪽값.대상.match(/ctl(\d+)$/);
        쪽 = 쪽값.다음 ? 묶음시작 + 10 : m ? 묶음시작 + (Number(m[1]) - 9) / 2 - 1 : 쪽값.쪽;
      }
      return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: 쪽html({ 줄들: 몫.slice((쪽 - 1) * 쪽값.줄수, 쪽 * 쪽값.줄수), 지금: 쪽, 전체: 몫.length, 쪽크기: 쪽값.줄수, 받는이: 쪽값.받는이 }) });
    });
    await p.goto('https://vendorpia.com/System/Sales/orderMst.aspx#vgCal');
    await p.addStyleTag({ content: fs.readFileSync(path.join(확장, 'login.css'), 'utf8') + fs.readFileSync(path.join(확장, 'search.css'), 'utf8') });
    await p.addScriptTag({ content: fs.readFileSync(path.join(확장, 'vp-data.js'), 'utf8').replace(/^const VP_DATA/m, 'window.VP_DATA') + ';if(typeof VP_DATA!=="undefined")window.VP_DATA=VP_DATA' });
    await p.addScriptTag({ content: fs.readFileSync(path.join(확장, 'search.js'), 'utf8') });
    await p.waitForSelector('#vp-root .vp-정산');
    return { p, ctx, 보낸, 쪽오류, 밖, 밖글 };
  }
  const 올리기 = (p, 이름, 글) => p.setInputFiles('#vp-root input[type=file]', { name: 이름, mimeType: 'application/octet-stream', buffer: 글 });
  const 끝기다림 = (p, t = 90000) => p.waitForFunction(() => { const 글 = document.querySelector('#vp-root .vp-note').textContent; return 글 && !/조회 중|읽는 중|멈추는 중/.test(글); }, null, { timeout: t });
  const 표 = (p) => p.evaluate(() => { const 머리 = [...document.querySelectorAll('#vp-root .vp-search > .vp-table thead th')].map((x) => x.textContent); return [...document.querySelectorAll('#vp-root .vp-search > .vp-table tbody tr')].map((tr) => { const o = {}; [...tr.cells].forEach((c, i) => { o[머리[i]] = c.textContent; }); return o; }); });
  const 못줄 = (p) => p.evaluate(() => [...document.querySelectorAll('#vp-root .vp-정산못찾음 tbody tr')].map((tr) => [...tr.cells].map((c) => c.textContent)));

  for (const 너비 of [1280, 375]) {
    console.log('\n■ 엑셀 · ' + 너비);
    const { p, ctx, 보낸, 쪽오류, 밖, 밖글 } = await 쪽열기(너비);
    재(await p.textContent('#vp-root h1') === 'CS정산', '제목 CS정산');
    재(/파일 → 다운로드/.test(await p.textContent('.vp-정산안내')), '구글시트 안내');
    await 올리기(p, '정산.xlsx', 엑셀);
    await 끝기다림(p);
    const 줄 = await 표(p), 못 = await 못줄(p), 글 = await p.textContent('#vp-root .vp-note');
    console.log('  ' + 글);
    const 머리칸 = await p.$$eval('#vp-root .vp-search > .vp-table thead th', (x) => x.map((c) => c.textContent));
    재(머리칸.join() === 보이는칸.slice(1).map((h) => h.replace('#2', '')).join(), '주문관리 목록 칸 그대로·같은 차례 33칸(체크 뺌), 업로드 칸 없음 (' + 머리칸.length + ')');
    재(줄.length === 4, '일치 주문만 목록에 넷: 가나다 둘 + 라마바 + 사아자 (' + 줄.length + ')');
    재(줄.map((x) => x.상품코드).join() === 'P2900,P1505,P20,P10', '줄 차례 = 벤더피아 기본(안 번호 큰 것 먼저) ' + 줄.map((x) => x.상품코드).join());
    재(줄.filter((x) => x.수취인 === '가나다').length === 2, '표기 차이(빈칸·대소문자·줄바꿈) 맞춤, 뒤쪽 쪽 줄까지');
    재(줄.some((x) => x.수취인 === '라마바' && x.주문번호.startsWith('M-20') && x.주문옵션 === '옵션A' && x.물류메모 === '') && !줄.some((x) => x.수취인 === '라마바사'), '값 그대로 · 메모 빈 줄 맞음 · 부분 맞춤 수취인은 안 맞음');
    재(줄.some((x) => x.수취인 === '사아자'), 'inlineStr 값');
    재(못.length === 2 && 못.some((x) => x[0] === '못 찾음' && x[1] === '8' && x[2] === '차카타'), '메모 다른 줄 = 못 찾음 칸에 엑셀 줄 번호와');
    재(못.some((x) => x[0] === '수취인 없음' && x[3] === '옵션D'), '수취인 빈 줄 = 수취인 없음');
    재(await p.$eval('.vp-정산못찾음', (d) => !d.hidden && !d.open && /못 찾은 업로드 줄 2건/.test(d.textContent)), '못 찾은 줄은 건수와 함께 접혀 따로');
    재(await p.$$eval('#vp-root .vp-search > .vp-table tr.vp-못찾음줄', (x) => x.length) === 0, '주문관리 목록에 못 찾은 줄이 안 섞임');
    재(!줄.some((x) => Object.values(x).some((c) => /읽는법/.test(c))) && !못.some((x) => x.some((c) => /읽는법/.test(c))), 'rPh 안 섞임');
    재(/일치 주문 4건 · 업로드 5줄 중 일치 3줄 · 못 찾음 2줄 · 벤더피아 1년치 3,000건/.test(글), '건수 글');
    재(보낸.every((x) => x.조회 || x.대상 || x.다음) && !보낸.some((x) => x.지움), '조회·쪽 넘김만 보냄');
    재(보낸.slice(1).every((x) => x.받는이), '수취인별로 물음(첫 건수 물음 뒤)');
    재(보낸.every((x) => /^\d{4}-\d\d-\d\d$/.test(x.시작) && Number(x.끝.slice(0, 4)) - Number(x.시작.slice(0, 4)) <= 1 && x.시작 > String(Number(x.끝.slice(0, 4)) - 1) + x.끝.slice(4)), '기간 = 오늘 포함 1년 안');
    재(!밖.filter((x) => !['GET firestore.googleapis.com', 'POST identitytoolkit.googleapis.com'].includes(x)).length, '벤더피아·깃허브 밖은 상담 셈 읽기와 그 익명 표뿐 ' + [...new Set(밖)].join());
    재(!밖글.some((x) => /가나다|라마바|사아자|차카타|옵션|M-\d|encodeURIComponent/.test(decodeURIComponent(x))), '밖으로 나간 요청에 파일·주문 값 없음');
    const 꼴 = await p.evaluate(() => {
      const td = document.querySelector('#vp-root .vp-search > .vp-table tbody td'), s = getComputedStyle(td), tr = td.parentNode, 통 = document.querySelector('#vp-root .vp-search > .vp-table');
      return { 글: s.fontSize, 높: tr.getBoundingClientRect().height, 쪽밀림: document.documentElement.scrollWidth > innerWidth, 통: getComputedStyle(통).overflowX, 머리: 통.querySelectorAll('thead .vp-열손').length, 촘촘: !!통.querySelector('table.vp-촘촘'), 취소: !!통.querySelector('tr.vp-취소줄') };
    });
    재(꼴.글 === '11px' && Math.round(꼴.높) === 25 && 꼴.촘촘, '글 11px·줄 25px·vp-촘촘 (' + 꼴.글 + ' ' + 꼴.높 + ')');
    재(!꼴.쪽밀림 && /auto|scroll/.test(꼴.통), '쪽 가로 스크롤 없음·표 안에서만');
    재(꼴.머리 === 33, '칸마다 끌기 손');
    재(꼴.취소, 'CS 취소 줄 칠함 — CS등록과 같은 표');
    await p.evaluate(() => document.querySelector('#vp-root .vp-search > .vp-table').scrollTo(0, 0));
    await p.evaluate(() => { const d = document.querySelector('.vp-정산못찾음'); d.scrollIntoView(); });
    const 손 = await p.$$('#vp-root .vp-search > .vp-table thead .vp-열손'), 상 = await 손[1].boundingBox();
    const 전 = await p.evaluate(() => document.querySelectorAll('#vp-root .vp-search > .vp-table col')[1].style.width);
    await p.mouse.move(상.x + 3, 상.y + 5); await p.mouse.down(); await p.mouse.move(상.x + 43, 상.y + 5); await p.mouse.up();
    const 후 = await p.evaluate(() => [document.querySelectorAll('#vp-root .vp-search > .vp-table col')[1].style.width, localStorage.getItem('vp열넓이:CS')]);
    재(parseInt(후[0]) === parseInt(전) + 40 && /IMG/.test(후[1] || ''), '열 끌기·CS등록과 같은 기억 ' + 후.join(' '));
    /* 단품·상품 단추 — goods.js 대신 같은 이름의 함수 */
    await p.evaluate(() => {
      window.VP단품있나 = () => false;
      window.VP상품단추 = window.VP단품단추 = (이름) => { const b = document.createElement('button'); b.textContent = 이름; return b; };
      window.dispatchEvent(new Event('vp상품단추준비')); window.dispatchEvent(new Event('vp단품단추준비'));
    });
    await p.waitForFunction(() => document.querySelectorAll('#vp-root td.vp-단품칸 .vp-goods-list button').length >= 8);
    재(await p.$$eval('#vp-root td.vp-단품칸 .vp-goods-list button', (x) => x.length) === 8, '단품구성 칸 = 단품 단추(「+」 나눔, 4건×2)');
    재(await p.$$eval('#vp-root td.vp-상품칸:not(.vp-단품칸) .vp-goods-list button', (x) => x.length) === 4, '상품명 칸 = 상품 단추');
    재(await p.$$eval('#vp-root .vp-search > .vp-table td.vp-주문칸 .vp-상담알', (x) => x.length) === 4, '주문번호 칸 상담 단추');
    재(await p.$$eval('#vp-root .vp-search > .vp-table tr.vp-줄상담', (x) => x.length) === 4, '줄 누름 표시');
    await p.click('#vp-root .vp-search > .vp-table tbody tr:nth-child(2) td:nth-child(2)');
    await p.waitForSelector('.vp-상담판', { timeout: 5000 });
    재(true, '줄 누름 = 상담 판(CS등록과 같은 판)');
    await p.keyboard.press('Escape');
    /* 못 찾은 칸 펼치기 */
    await p.click('.vp-정산못찾음 summary');
    const 못꼴 = await p.evaluate(() => { const 통 = document.querySelector('.vp-정산못찾음 .vp-table'), td = 통.querySelector('tbody td'); return { 글: getComputedStyle(td).fontSize, 높: td.parentNode.getBoundingClientRect().height, 색: getComputedStyle(td).backgroundColor, 쪽밀림: document.documentElement.scrollWidth > innerWidth, 손: 통.querySelectorAll('.vp-열손').length }; });
    재(못꼴.글 === '11px' && Math.round(못꼴.높) === 25 && 못꼴.색 === 'rgb(255, 243, 205)' && !못꼴.쪽밀림 && 못꼴.손 === 5, '못 찾은 표도 같은 꼴·구분 색·쪽 밀림 없음');
    /* 다시 올리기 — 일치 0 */
    await 올리기(p, '없음.csv', Buffer.from('수취인,옵션값,메모\n없는사람,없는옵션,\n'));
    await p.waitForFunction(() => /일치 주문 0건/.test(document.querySelector('#vp-root .vp-note').textContent));
    재(/일치한 주문이 없습니다/.test(await p.textContent('#vp-root .vp-search > .vp-table')) && await p.$eval('.vp-정산못찾음', (d) => d.open), '일치 0 = 빈 안내 + 못 찾은 칸 펼침');
    await 올리기(p, '한글.csv', 한글csv);
    await p.waitForFunction(() => /일치 주문 1건/.test(document.querySelector('#vp-root .vp-note').textContent));
    재((await 표(p)).length === 1 && await p.$eval('.vp-정산못찾음', (d) => d.hidden), '다시 올리면 표를 새로 그림 · 못 찾음 0 이면 칸 숨김');
    재(!쪽오류.length, '쪽 오류 없음 ' + 쪽오류.join());
    await ctx.close();
  }

  console.log('\n■ 전체 훑기 — 고유 수취인이 전체 쪽 수보다 많음');
  { const { p, ctx, 보낸 } = await 쪽열기(1280);
    await 올리기(p, '여럿.csv', 여럿csv);
    await 끝기다림(p);
    const 줄 = await 표(p), 글 = await p.textContent('#vp-root .vp-note');
    console.log('  ' + 글);
    재(/전체 훑기/.test(글) && 보낸.length === 6 && 보낸.slice(1).every((x) => !x.받는이), '700줄씩 다섯 쪽 끝까지(요청 ' + 보낸.length + ')');
    재(줄.length === 4 && (await 못줄(p)).length === 5 && 줄[0].상품코드 === 'P2900', '수취인별과 같은 일치 4 · 못 찾음 5 · 같은 차례');
    await ctx.close(); }

  console.log('\n■ 쪽이 많음 — 11쪽·21쪽은 Next');
  { const { p, ctx, 보낸 } = await 쪽열기(1280);
    await p.evaluate(() => {
      const 판 = VP_DATA.받기;                         // 줄 수만 10 으로 — 30쪽을 걸어 본다
      VP_DATA.받기 = (u, o, g) => { const k = [...o.body.keys()].find((x) => x.endsWith('ddlRowCnt')); if (k && o.body.get(k) === '700') o.body.set(k, '100'); return 판(u, o, g); };
    });
    await 올리기(p, '여럿.csv', 여럿csv);
    await 끝기다림(p);
    재(보낸.filter((x) => x.다음).length === 2, 'Next 두 번(11·21쪽) ' + 보낸.length);
    재((await 표(p)).length === 4, '끝까지 받아 일치 4');
    await ctx.close(); }

  console.log('\n■ 파일 꼴');
  { const { p, ctx, 보낸 } = await 쪽열기(1280);
    await 올리기(p, '옛.xlsx', xlsx([['가', [[1, ['수취인', '옵션', '비고']], [2, ['a', 'b', 'c']]]]]));
    await p.waitForFunction(() => /없는 열/.test(document.querySelector('#vp-root .vp-note').textContent));
    const 글 = await p.textContent('#vp-root .vp-note');
    재(/없는 열: 옵션값, 메모/.test(글) && /시트 「가」/.test(글) && /본 제목: 수취인, 옵션, 비고/.test(글), '없는 열을 알림: ' + 글);
    재(보낸.length === 0, '열이 없으면 벤더피아에 안 물음');
    await 올리기(p, '옛.xls', Buffer.from('x'));
    await p.waitForFunction(() => /파일 꼴은 못 읽습니다/.test(document.querySelector('#vp-root .vp-note').textContent));
    재(true, '.xls 안내');
    await 올리기(p, '깨진.xlsx', Buffer.from('아무것도 아님'));
    await p.waitForFunction(() => /엑셀 파일을 읽지 못했습니다/.test(document.querySelector('#vp-root .vp-note').textContent));
    재(true, '깨진 xlsx·암호 파일 안내');
    await 올리기(p, '한글.csv', 한글csv);
    await 끝기다림(p);
    재((await 표(p)).filter((x) => x.수취인 === '사아자').length === 1, 'EUC-KR CSV');
    await ctx.close(); }

  console.log('\n■ 세션 끊김 · 멈추기');
  { const { p, ctx, 보낸 } = await 쪽열기(1280, (n) => n === 2);
    await 올리기(p, '정산.xlsx', 엑셀);
    await 끝기다림(p);
    const 글 = await p.textContent('#vp-root .vp-note');
    재(/로그인이 끊겼습니다/.test(글) && 보낸.length === 2, '끊기면 바로 멈춤·다시 로그인 시도 없음');
    await ctx.close(); }
  { const { p, ctx, 보낸 } = await 쪽열기(1280, () => false, 150);
    await 올리기(p, '여럿.csv', 여럿csv);
    await p.waitForFunction(() => /쪽 ·/.test(document.querySelector('#vp-root .vp-note').textContent));
    await p.click('.vp-정산멈춤');
    await 끝기다림(p);
    const 글 = await p.textContent('#vp-root .vp-note');
    재(/멈췄습니다/.test(글) && 보낸.length < 6, '멈추기(요청 ' + 보낸.length + ')');
    재((await 표(p)).length >= 1, '멈춰도 받은 곳까지 주문관리 목록');
    재(await p.$eval('.vp-파일단추', (x) => x.style.display !== 'none'), '다시 올릴 수 있음');
    await ctx.close(); }

  await b.close();
  console.log(`\n★ 초록 ${초록} · 빨강 ${빨강}`);
  process.exit(빨강 ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
