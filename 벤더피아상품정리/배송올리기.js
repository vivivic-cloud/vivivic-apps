/* ==========================================
   벤더피아상품정리 / 배송올리기.js
   버전: v0.1.0 (2026-10-09)

   배송관리 엑셀을 읽고 **사람 정보를 가리고** 겹친 주문줄을 가려내는 셈.
   ⚠ 이 셈은 **한 벌만 있어야 한다.** 베껴서 두 벌이 되면 언젠가 달라지고,
      한쪽만 고쳐지면 사람 정보가 샌다. 그래서 여기로 모았다.

   쓰는 곳 — 배송관리업로드.html · 제품명료화.html
   쓰는 법 — <script src="배송올리기.js"></script> 를 먼저 읽히고
             const { 사람정보지우기, … } = window.배송올리기;

   창에 있어야 하는 것 — XLSX (사람정보지우기 가 사본을 다시 쓴다), Blob
   ========================================== */
(function () {
'use strict';

// ⚠ 사람 정보는 창고에 올리지 않는다.
//    화베 규칙이 「로그인한 사람이면 누구나」 하나뿐이라, 창고에 올린 파일은
//    주소를 아는 사람이면 누구나 받는다. 이름·전화·집주소는 아예 안 올린다.
//    「어떤 물건이 얼마나 나갔나」 를 세는 데 이 칸들은 하나도 안 쓰인다.
const 사람칸 = ['수취인','전화','휴대전화','주문자','주문자휴대폰','주소'];

// 「26.10.02」 · 「2026-10-03」 두 모양이 섞여 있다. 둘 다 받아 YYYY-MM 으로.
function toMonth(v) {
    const s = String(v || '').trim();
    let m = s.match(/^(\d{4})[-.\/](\d{1,2})/);        // 2026-10-03
    if (m) return m[1] + '-' + m[2].padStart(2, '0');
    m = s.match(/^(\d{2})[-.\/](\d{1,2})/);            // 26.10.02
    if (m) return '20' + m[1] + '-' + m[2].padStart(2, '0');
    return '';
}

// ── 주소 가리기 ─────────────────────────────────────────────
// 「주소도 가려줘」 (10-06 사장님). 다만 「3층 엘리베이터 없음」 같은 일 이야기는 남겨야 한다.
// 그래서 통째로 지우지 않고, 주소처럼 생긴 낱말이 이어지는 동안만 가린다.
const 시도꼴   = /^(경기|서울|부산|인천|대구|대전|광주|울산|강원|충북|충남|전북|전남|경북|경남|세종|제주)(도|특별시|광역시|특별자치도|특별자치시)?$/;

const 시군구꼴 = /.{2,}(시|군|구)$/;

const 끝말꼴   = /(로|길|동|가|리|읍|면|번지|아파트|빌라|타워|오피스텔|단지|호)\d*$/;

const 번지꼴   = /^(산)?\d+(-\d+)?$/;

const 괄호꼴   = /^\(.*\)$/;

const 주소말   = t => 번지꼴.test(t) || 끝말꼴.test(t) || 괄호꼴.test(t);

// 「(보정동, 죽현마을 아이파크)」 를 한 낱말로 묶는다. 안 그러면 그 사이에서 끊긴다.
function 낱말나누기(글) {
    const 밖 = []; let i = 0;
    while (i < 글.length) {
        if (/\s/.test(글[i])) { i++; continue; }
        if (글[i] === '(') { const j = 글.indexOf(')', i); if (j > -1) { 밖.push(글.slice(i, j + 1)); i = j + 1; continue; } }
        /* ⚠⚠ **i+1 에서 시작한다. i 로 되돌리지 마라 — 무한 반복이 된다.**
              10-11 사장님 폰에서 23만 줄이 여기서 터졌다(「Invalid array length — 배송올리기.js:56」).
              닫는 괄호가 없는 「(보정동 211동」 같은 글이 오면 위 괄호 가지가 빠져나오는데,
              j 를 i 에서 시작하면 글[i] 가 '(' 라 while 이 **첫 바퀴에 멈춰** j = i 가 된다.
              그러면 빈 글자를 넣고 i 가 그대로라 **영원히 돌며** 배열이 한계에서 터진다.
              i+1 에서 시작하면 i 가 반드시 한 칸은 나아가고, 그 '(' 는 낱말 첫 글자로 들어간다.
              괄호 아닌 보통 낱말에는 아무 차이가 없다(글[i] 는 이미 빈칸도 '(' 도 아니다). */
        let j = i + 1; while (j < 글.length && !/\s/.test(글[j]) && 글[j] !== '(') j++;
        밖.push(글.slice(i, j)); i = j;
    }
    return 밖;
}

function 주소가리기(글) {
    const 낱말 = 낱말나누기(String(글));
    let 나온수 = 0;
    for (let i = 0; i < 낱말.length; i++) {
        if (낱말[i] === null || !시도꼴.test(낱말[i])) continue;
        if (!(낱말[i + 1] && 시군구꼴.test(낱말[i + 1]))) continue;   // 「경기도 사람」 은 안 건드린다
        let j = i + 1;
        if (낱말[j + 1] && 시군구꼴.test(낱말[j + 1])) j++;           // 용인시 기흥구
        j++;
        while (j < 낱말.length) {
            if (주소말(낱말[j])) { j++; continue; }
            if (낱말[j + 1] && 주소말(낱말[j + 1])) { j += 2; continue; }   // 건물이름 하나는 건너뛴다
            break;
        }
        for (let k = i; k < j; k++) 낱말[k] = null;
        나온수++; i = j - 1;
    }
    if (!나온수) return { 글, 나온수: 0 };
    const 밖 = []; let 빈적 = false;
    for (const t of 낱말) {
        if (t === null) { if (!빈적) { 밖.push('***주소***'); 빈적 = true; } }
        else { 밖.push(t); 빈적 = false; }
    }
    return { 글: 밖.join(' '), 나온수 };
}

// 사람 칸을 뺀 사본을 만든다. 없으면 null — 그때는 원본 그대로 올린다.
// 사람 칸이 어디인가. head 에서 찾아 자리를 돌려준다.
function 가릴자리(head) {
    const 뺄자리 = [], 뺀이름 = [];
    head.forEach((h, i) => { if (사람칸.indexOf(h) > -1) { 뺄자리.push(i); 뺀이름.push(h); } });
    return { 뺄자리, 뺀이름, 남길자리: head.map((_, i) => i).filter(i => 뺄자리.indexOf(i) < 0) };
}

// 칸만 지워서는 모자란다. 메모·배송메세지 글 속에 번호가 묻혀 있다 —
// 「상주인원이 없습니다 배송전 필시 연락 바랍니다 010-3307-1324」 같은 줄이 실제로 있었다.
// 앞이 숫자가 아닐 때만 잡는다. 주문번호(2026100118872871)를 가리면 안 된다.
// 「010 만 가리는 게 무슨 의미냐」 — 사장님 말씀이 옳다. 집·사무실 번호도 메모에 적힌다.
//   휴대폰 01X · 안심 050X · 인터넷 070   — 구분자가 없어도 잡는다
//   지역 02·031~064 · 대표 15xx/16xx/18xx — 구분자가 있을 때만. 안 그러면
//   송장번호(4082610021059)·주문번호(2026100118872871)를 물어뜯는다.
const 번호꼴 = [
    /(\D|^)((?:01[016789]|070|050\d)[-. ]?\d{3,4}[-. ]?\d{4})(?!\d)/g,
    /(\D|^)((?:02|0(?:3[1-3]|4[1-4]|5[1-5]|6[1-4]))[-. ]\d{3,4}[-. ]\d{4})(?!\d)/g,
    /(\D|^)(1[5678]\d\d[-. ]\d{4})(?!\d)/g
];

// 한 줄을 **제자리에서** 가린다. 센 것은 셈 에 쌓는다.
// ⚠ 사람정보지우기() 와 흘려 읽기가 **이 한 벌**을 같이 쓴다. 베껴서 두 벌로 만들지 마라 —
//   두 벌이 되면 언젠가 달라지고 한쪽만 고쳐져 사람 정보가 샌다.
function 줄가리기(r, 셈) {
    for (let i = 0; i < r.length; i++) {
        if (typeof r[i] !== 'string' || r[i].length < 8) continue;
        for (const 꼴 of 번호꼴)
            r[i] = r[i].replace(꼴, (m, a) => { 셈.가린수++; return a + '***-****-****'; });
        const 주 = 주소가리기(r[i]);
        if (주.나온수) { r[i] = 주.글; 셈.주소본것 += 주.나온수; }
    }
    return r;
}

// CSV 한 칸. 쉼표·따옴표·줄바꿈이 들면 따옴표로 감싸고 안의 따옴표는 둘로 적는다.
const 칸글 = v => {
    const s = (v === undefined || v === null) ? '' : String(v);
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const BOM = '\uFEFF';   // 없으면 나중에 엑셀로 열 때 한글이 깨진다

function 사람정보지우기(aoa, head) {
    const { 뺄자리, 뺀이름, 남길자리 } = 가릴자리(head);
    if (!뺄자리.length) return { 뺀이름: [], 가린수: 0, 주소본것: 0, 파일: null };

    const 새표 = aoa.map(r => 남길자리.map(i => (r && r[i] !== undefined) ? r[i] : ''));
    const 셈 = { 가린수: 0, 주소본것: 0 };
    for (const r of 새표) 줄가리기(r, 셈);

    // ⚠ 창고 사본은 **CSV** 로 쓴다. 엑셀로 쓰지 마라.
    //    XLSX.write 는 시트 XML 을 글자 한 덩어리로 만든다. 20만 줄이면 그 덩어리가 299MB 라
    //    브라우저가 들 수 있는 글자 길이를 넘어 「Invalid array length」 로 터진다. (10-09 사장님)
    const 조각들 = [BOM];
    const 묶음 = [];
    for (let n = 0; n < 새표.length; n++) {
        묶음.push(새표[n].map(칸글).join(','));
        if (묶음.length >= 5000) { 조각들.push(묶음.join('\n') + '\n'); 묶음.length = 0; }
    }
    if (묶음.length) 조각들.push(묶음.join('\n') + '\n');
    return { 뺀이름, 가린수: 셈.가린수, 주소본것: 셈.주소본것, 꼴: 'csv',
             파일: new Blob(조각들, { type: 'text/csv;charset=utf-8' }) };
}

// 머리줄은 이름으로 찾지 않는다. 위 열 줄 가운데 채워진 칸이 가장 많은 줄이다(같으면 위엣것).
// 제목 줄·회사 이름·뽑은 날짜는 칸이 한둘뿐이라 저절로 걸러진다.
function 머리줄찾기(aoa) {
    let best = 0, n = -1;
    for (let i = 0; i < Math.min(10, aoa.length); i++) {
        const k = (aoa[i] || []).filter(v => String(v ?? '').trim() !== '').length;
        if (k > n) { n = k; best = i; }
    }
    return best;
}

// ── 겹침 열쇠 ────────────────────────────────────────────────────────
// 주문번호 같은 칸이 있어도 **한 주문에 여러 줄**이면 겹친다. 그래서 이름만 보고
// 고르지 않고 **값을 세어 본다** — 그 파일 안에서 겹침이 0 인 첫 후보를 쓴다.
// 아무것도 없으면 **줄을 통째로** 견준다(똑같은 줄이면 같은 것으로 본다).
function 겹침수(줄들, 칸) {
    const s = new Set(); let dup = 0;
    for (const r of 줄들) { const k = 칸.map(i => String(r[i] ?? '').trim()).join('·');
        if (s.has(k)) dup++; else s.add(k); }
    return dup;
}

// 열쇠 후보를 차례대로. **열쇠고르기() 와 흘려 읽기가 이 한 벌을 같이 쓴다.**
function 열쇠후보(head) {
    const 어디 = re => head.map((h, i) => [h, i]).filter(([h]) => re.test(h)).map(([, i]) => i);
    const 번호 = 어디(/주문.*번호|오더.*번호/);
    const 송장 = 어디(/송장/);
    const 물건 = 어디(/상품코드|단품코드|상품명|옵션/);
    const 후보 = [];
    번호.forEach(i => 후보.push([i]));
    송장.forEach(i => 후보.push([i]));
    번호.forEach(a => 물건.forEach(b => 후보.push([a, b])));   // 한 주문에 여러 줄일 때
    송장.forEach(a => 물건.forEach(b => 후보.push([a, b])));
    return 후보;
}

function 열쇠고르기(head, 줄들) {
    const 후보 = 열쇠후보(head);
    if (줄들.length) {
        for (const c of 후보) {
            const d = 겹침수(줄들, c);
            if (d === 0) return { 칸: c, 이름: c.map(i => head[i]).join(' + '), 안겹침: true };
        }
    }
    return { 칸: null, 이름: '줄 전체', 안겹침: false };
}

const 열쇠값 = (row, 칸) =>
    (칸 ? 칸.map(i => String(row[i] ?? '').trim()) : (row || []).map(v => String(v ?? '').trim())).join('·');

// 16자리로 줄인다 — 10만 줄이라도 부딪칠 일이 없고, 문서가 가벼워진다.
function 해시(s) {
    let a = 0x811c9dc5, b = 0x01000193;
    for (let i = 0; i < s.length; i++) {
        const c = s.charCodeAt(i);
        a = Math.imul(a ^ c, 0x01000193) >>> 0;
        b = Math.imul((b + c) >>> 0, 0x85ebca6b) >>> 0; b = (b ^ (b >>> 13)) >>> 0;
    }
    return a.toString(16).padStart(8, '0') + b.toString(16).padStart(8, '0');
}

function 집계내기(줄들) {
    const byMonth = {}, rowsOf = {};
    let used = 0;
    줄들.forEach(r => {
        used++;
        if (!r.name) return;                 // 셀 칸이 없거나 이름이 빈 줄 — 줄만 센다
        if (!byMonth[r.mon]) { byMonth[r.mon] = {}; rowsOf[r.mon] = 0; }
        byMonth[r.mon][r.name] = (byMonth[r.mon][r.name] || 0) + r.q;
        rowsOf[r.mon]++;
    });
    return { byMonth, rowsOf, used };
}

window.배송올리기 = { 열쇠후보, 가릴자리, 줄가리기, 칸글, BOM, 사람칸, toMonth, 시도꼴, 시군구꼴, 끝말꼴, 번지꼴, 괄호꼴, 주소말, 낱말나누기, 주소가리기, 사람정보지우기, 머리줄찾기, 겹침수, 열쇠고르기, 열쇠값, 해시, 집계내기 };
})();
