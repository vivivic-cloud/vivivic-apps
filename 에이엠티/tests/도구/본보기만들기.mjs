/* 본보기 자료 만들기 — 진짜 업무 자료에서 **알아볼 수 있는 것을 다 걷어낸** 본을 뜬다.
   저장소 뿌리에 진짜 자료가 있을 때만 돌아간다. 결과는 `tests/본보기자료/` 에 들어가고,
   진짜 자료가 없는 자리에서는 시험이 이 본보기를 먹는다.

   걷어내는 것
     원장  — 앱이 안 쓰는 칸은 통째로 비운다(값·원가·부속코드·부속명 …).
             앱이 쓰는 칸 가운데 알아볼 수 있는 것(단품명·단품코드·발주처·대중소분류·창고)은
             본보기 말로 바꾼다.
     발주  — 발주번호·거래처·상품명·갈래·문서번호를 본보기 말로 바꾼다.
     재단  — 이 안에는 사람·거래처·상품 이름이 없다(원장·마감·색상·치수·부속 이름뿐).
             그래도 혹시 섞여 들어온 진짜 말이 있으면 위에서 만든 표로 같이 바꾼다.

   남기는 것 — 원장명·마감·마감색상·치수·세트별소모량처럼 화면 숫자를 만드는 것.
   이것이 없으면 시험이 아무것도 못 잰다. 줄 차례도 그대로 둔다 — 재단계획이 원장
   몇째 줄인지(pRowIndex)로 가리키기 때문이다.

   돌리는 법:  node 에이엠티/tests/도구/본보기만들기.mjs
*/
import fs from 'node:fs';
import path from 'node:path';
import { 뿌리, 시험칸 } from './터.mjs';

const 나갈칸 = path.join(시험칸, '본보기자료');
fs.mkdirSync(나갈칸, { recursive: true });
const 읽기 = 이름 => {
    const p = path.join(뿌리, 이름 + '.json');
    if (!fs.existsSync(p)) { console.log('· 없어서 건너뜀: ' + 이름 + '.json'); return null; }
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
};

/* ── 바꿈표 ─────────────────────────────────────────────────────────── */
const 표 = new Map();
let 번호 = { 상품: 0, 코드: 0, 거래처: 0, 묶음: 0, 갈래: 0, 칸: 0, 창고: 0, 발주: 0, 문서: 0 };
const 본보기말 = (갈래, 원값) => {
    const 값 = String(원값 == null ? '' : 원값).trim();
    if (!값) return 원값;
    if (표.has(값)) return 표.get(값);
    if (공용말.has(값)) return 원값;                 // 자재 말은 바꾸지 않는다
    번호[갈래]++;
    const n = String(번호[갈래]).padStart(2, '0');
    const 새것 = {
        상품:  '(본)본보기 상품 ' + n,
        코드:  'BON-' + n,
        거래처: ['가나가구', '다라목재', '마바가구', '사아공방', '자차목공', '본보기공장-1', '본보기공장-2'][(번호.거래처 - 1) % 7],
        묶음:  '본보기묶음' + n,
        갈래:  '본보기갈래' + n,
        칸:    '본보기칸' + n,
        창고:  '본보기창고-' + n,
        발주:  '본보기-2026' + n + '-01',
        문서:  'BONDOC' + n,
    }[갈래];
    표.set(값, 새것);
    return 새것;
};

/* ── 원장 ───────────────────────────────────────────────────────────── */
// 앱(에이엠티.html)이 실제로 읽는 칸만 값을 남긴다. 나머지는 빈칸으로 둔다.
const 남길칸 = ['원장명','마감','마감색상','부속명','공급처','세트별소모량','재단W','재단D',
                '총엣지면','보링수량','NC유무','결보호','상품색상'];
// 남기되 본보기 말로 바꿔야 하는 칸
const 바꿀칸 = { 'ing단품명':'상품', 'ing단품코드':'코드', 'ing발주처':'거래처',
                 '대분류':'묶음', '중분류':'갈래', '소분류':'칸', '창고':'창고' };
const L = 읽기('원장');
/* 자재 말 — 원장명·마감·마감색상·상품색상·공급처·부속명 에 실제로 적히는 말이다.
   「올화이트」·「공통부속」·「크림버치」 처럼 갈래 칸에도 같은 말이 들어오는데,
   이것들은 거래처도 상품 이름도 아닌 자재 말이므로 바꾸지 않고 그대로 둔다. */
const 공용말 = new Set();
if (L && L.length) {
    const 머리0 = L[0];
    ['원장명','마감','마감색상','상품색상','공급처','부속명'].forEach(칸 => {
        const i = 머리0.indexOf(칸); if (i < 0) return;
        for (let r = 1; r < L.length; r++){
            const v = L[r] && L[r][i]; if (v != null && String(v).trim()) 공용말.add(String(v).trim());
        }
    });
}
if (L && L.length) {
    const 머리 = L[0];
    const 새것 = [머리.slice()];
    for (let r = 1; r < L.length; r++) {
        const 줄 = L[r] || [];
        새것.push(머리.map((칸, i) => {
            if (바꿀칸[칸]) return 본보기말(바꿀칸[칸], 줄[i]);
            if (남길칸.includes(칸)) return 줄[i] == null ? '' : 줄[i];
            return '';                                  // 앱이 안 쓰는 칸 — 통째로 비운다
        }));
    }
    fs.writeFileSync(path.join(나갈칸, '원장.json'), JSON.stringify(새것));
    console.log('· 원장.json — ' + (새것.length - 1) + '줄 · 칸 ' + 머리.length +
                '개 중 값 남긴 칸 ' + (남길칸.length + Object.keys(바꿀칸).length) + '개');
}

/* ── 발주·재단 ───────────────────────────────────────────────────────── */
// 문서번호(docId·_id·batchId)는 건드리지 않는다 — 알아볼 것이 없는 데다,
// 재단계획이 confirmId 로 그 번호를 가리키므로 바꾸면 이어진 것이 끊긴다.
const 발주바꿈 = { orderCode:'발주', supplier:'거래처', code:'상품', displayName:'상품' };
function 훑기(값, 안쪽열쇠){
    if (Array.isArray(값)) return 값.map(v => 훑기(v, 안쪽열쇠));
    if (값 && typeof 값 === 'object') {
        const 새것 = {};
        for (const [k, v] of Object.entries(값)) {
            if (발주바꿈[k] && typeof v === 'string') { 새것[k] = 본보기말(발주바꿈[k], v); continue; }
            if (k === 'criteria' && Array.isArray(v)) { 새것[k] = v.map(x => 본보기말('갈래', x)); continue; }
            새것[k] = 훑기(v, k);
        }
        return 새것;
    }
    if (typeof 값 === 'string' && 표.has(값.trim())) return 표.get(값.trim());
    return 값;
}
for (const 이름 of ['confirmed_orders', 'cutting_plans', '확정발주_지금', 'wo_board_order']) {
    const d = 읽기(이름); if (d === null) continue;
    fs.writeFileSync(path.join(나갈칸, 이름 + '.json'), JSON.stringify(훑기(d)));
    console.log('· ' + 이름 + '.json — ' + (Array.isArray(d) ? d.length + '개' : '사전'));
}

/* ── 샌 것이 없나 살핀다 — 바꿈표의 '진짜 말' 이 결과에 한 글자도 없어야 한다 ── */
// 「400」·「A」 같은 짧은 값까지 찾으면 뜻 없이 걸린다(치수·등급에도 그대로 있는 말이다).
// 알아볼 만한 말 — 한글이 든 두 글자 이상, 또는 네 글자 이상 — 만 본다.
const 볼만한 = 말 => /[가-힣]/.test(말) ? 말.length >= 2
                    : (/[A-Za-z]/.test(말) && 말.length >= 4);   // 숫자만인 말은 치수·번호다
const 샜나 = [];
for (const 파일 of fs.readdirSync(나갈칸)) {
    const 글 = fs.readFileSync(path.join(나갈칸, 파일), 'utf-8');
    for (const 진짜 of 표.keys()) {
        if (!볼만한(진짜) || 공용말.has(진짜)) continue;
        // 자재 말 안에 토막으로 들어 있는 말(「공통」은 「공통부속」 안에 있다)은 샌 것이 아니다
        if ([...공용말].some(m => m !== 진짜 && m.includes(진짜))) continue;
        if (글.includes(진짜)) 샜나.push(파일 + ' :: ' + 진짜);
    }
}
const 살핀수 = [...표.keys()].filter(볼만한).length;
console.log(샜나.length ? '⚠ 샌 것 ' + 샜나.length + '개: ' + 샜나.slice(0, 5).join(' · ')
                        : '· 샌 것 없음 — 알아볼 만한 진짜 말 ' + 살핀수 + '가지를 결과에서 다시 찾아봤다');
if (샜나.length) process.exit(1);
