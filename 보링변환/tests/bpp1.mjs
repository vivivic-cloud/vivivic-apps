/* 보링변환 — 폰 375px 에서 .cix 를 고르고 바꿔 나온 .bpp 를 재는 시험.
   손가락으로 누른다(CDP 터치·tap()). 잰 것만 적는다.

       node 보링변환/tests/bpp1.mjs

   에이엠티 시험의 터(브라우저 찾기·자리 서버)를 그대로 빌려 쓴다 — 그 파일은 안 건드린다. */
import fs from 'node:fs';
import path from 'node:path';
import { 브라우저열기, devices, 서버, 뿌리 } from '../../에이엠티/tests/도구/터.mjs';

const 잰것 = [];
const 재기 = (이름, 됐나, 곁 = '') => { 잰것.push({ 이름, 됐나, 곁 }); };

await 서버();
const B = 'http://127.0.0.1:8899';
const 주소 = B + '/' + encodeURIComponent('보링변환') + '/' + encodeURIComponent('보링변환.html');
const cix길 = path.join(뿌리, '보링변환/본보기/592x382_1001_01.cix');

/* 겹따옴표 안의 쉼표는 자르지 않는다 — CRN="1,4" 가 실제로 온다 */
const 꼬리쪼개기 = 글 => {
  const 것 = []; let 이번 = '', 안 = false;
  for (const c of String(글)) {
    if (c === '"') { 안 = !안; 이번 += c; continue; }
    if (c === ',' && !안) { 것.push(이번.trim()); 이번 = ''; continue; }
    이번 += c;
  }
  것.push(이번.trim());
  return 것;
};

const 바라던것 = [
  [19,70,5,12],[19,102,8,14],[19,279,8,14],[19,311,5,12],
  [98,10,5,12],[282,69,5,12],[282,325,5,12],[314,69,5,12],
  [314,325,5,12],[346,69,5,12],[346,325,5,12],[504,10,5,12],
  [583,70,5,12],[583,102,8,14],[583,279,8,14],[583,311,5,12],
];

const b = await 브라우저열기();
const 내린칸 = fs.mkdtempSync('/tmp/보링내림-');
const ctx = await b.newContext({
  ...devices['iPhone 12'], viewport: { width: 375, height: 812 },
  isMobile: true, hasTouch: true, acceptDownloads: true,
});
const p = await ctx.newPage();
await p.goto(주소 + '?viggle=1&box=boring', { waitUntil: 'load' });
await p.waitForTimeout(400);

/* ── 1. .cix 를 고른다 ─────────────────────────────────────────────── */
/* 파일은 이름과 속으로 건넨다 — 이 플레이라이트는 한글이 든 길로는 파일을 못 붙인다
   (붙는 척하고 change 가 안 온다). 앱 쪽 일이 아니라 시험 쪽 일이다. */
await p.setInputFiles('#b-file', {
  name: path.basename(cix길), mimeType: 'text/plain', buffer: fs.readFileSync(cix길),
});
await p.waitForTimeout(300);

const 읽음 = await p.evaluate(() => {
  const g = window.__읽은것 || null;
  return {
    알약: document.getElementById('b-pills').textContent,
    동그라미: document.querySelectorAll('#b-draw circle').length,
    빨강: [...document.querySelectorAll('#b-draw circle')].filter(c => c.getAttribute('fill') === '#FF3B30').length,
    빨간글: document.getElementById('b-warn').classList.contains('bhide')
            ? '' : document.getElementById('b-warn').textContent,
  };
});
재기('구멍 16개를 걷었나', 읽음.동그라미 === 16, '동그라미 ' + 읽음.동그라미);
재기('알약에 592×382×18 · 구멍 16', /592×382×18/.test(읽음.알약) && /구멍 16/.test(읽음.알약), 읽음.알약.trim());
재기('결 글자(GEOTEXT)를 버렸나', /결 글자 1 버림/.test(읽음.알약), 읽음.알약.trim());
재기('집게 밑 둘을 빨갛게 칠했나', 읽음.빨강 === 2, '빨간 동그라미 ' + 읽음.빨강);
재기('화면에 「집게 밑」 이 두 번 나오지 않나',
     (읽음.알약.match(/집게/g) || []).length === 0, 읽음.알약.trim() || '(알약에 없다)');
재기('「집게 밑 — 이대로면 못 뚫는다」 를 적었나',
     /집게 밑 — 이대로면 못 뚫는다/.test(읽음.빨간글), 읽음.빨간글);

/* ── 2. 누르는 자리 크기 (단추 44 · 입력칸 34) ───────────────────────── */
const 크기 = await p.evaluate(() => {
  const 재 = s => [...document.querySelectorAll(s)].filter(e => e.offsetParent)
      .map(e => Math.round(e.getBoundingClientRect().height));
  return { 단추: 재('.bbtn, .btile'), 입력: 재('.brow input') };
});
재기('단추가 다 44px 이상', 크기.단추.length >= 3 && 크기.단추.every(h => h >= 44), 크기.단추.join('·'));
재기('입력칸이 다 34px', 크기.입력.length === 6 && 크기.입력.every(h => h === 34), 크기.입력.join('·'));

/* ── 3. 바꾸기 — 손가락으로 누르고 내려온 파일을 잰다 ─────────────────── */
async function 눌러받기(고를것){
  const [내림] = await Promise.all([ p.waitForEvent('download', { timeout: 8000 }), p.tap(고를것) ]);
  const 길 = path.join(내린칸, 내림.suggestedFilename());
  await 내림.saveAs(길);
  return { 이름: 내림.suggestedFilename(), 글: fs.readFileSync(길, 'latin1') };
}
let 나온것 = null, 탓 = '';
try { 나온것 = await 눌러받기('#b-go'); } catch (e) { 탓 = String(e.message || e).split('\n')[0]; }
재기('바꾸기를 눌러 .bpp 가 내려왔나', !!나온것, 나온것 ? 나온것.이름 : 탓);

if (나온것) {
  const 글 = 나온것.글;
  재기('이름이 592x382_1001_01.bpp', 나온것.이름 === '592x382_1001_01.bpp', 나온것.이름);
  재기('줄 끝이 CRLF', !/[^\r]\n/.test(글), (글.match(/\r\n/g) || []).length + '줄');
  재기('[HEADER] TYPE=BPP VER=150', /^\[HEADER\]\r\nTYPE=BPP\r\nVER=150\r\n/.test(글));
  for (const 칸 of ['[DESCRIPTION]','[VARIABLES]','[PROGRAM]','[VBSCRIPT]','[MACRODATA]','[TDCODES]','[PCF]','[TOOLING]','[SUBPROGS]'])
    재기(칸 + ' 칸이 있나', 글.includes('\r\n' + 칸 + '\r\n') || 글.includes(칸 + '\r\n'));

  const 변수틀 = fs.readFileSync(path.join(뿌리, '보링변환/본보기/변수틀.bpp'), 'latin1')
      .split(/\r?\n/).map(s => s.trim()).filter(Boolean).slice(1);
  const 본것 = 변수틀.filter(줄 => !/^PAN=(LPX|LPY|LPZ)\|/.test(줄));
  재기('[VARIABLES] 를 본보기 파일에서 그대로 가져왔나',
       본것.length > 0 && 본것.every(줄 => 글.includes(줄)), 본것.length + '줄 그대로');
  재기('LPX·LPY·LPZ 만 갈아 끼웠나',
       글.includes('PAN=LPX|592||4|') && 글.includes('PAN=LPY|382||4|') && 글.includes('PAN=LPZ|18||4|'));
  재기('나머지 29줄은 한 글자도 안 건드렸나', 본것.length === 29 && 본것.every(줄 => 글.includes(줄)),
       본것.length + '줄');
  재기('$ 가 든 CUSTSTR 줄이 그대로 나갔나',
       글.includes('PAN=CUSTSTR|$B$KBsSkipperProcessor1.PreProc$V"2,2,100,100,,0,0,0"||3|'));

  const BG들 = 글.split('\r\n').filter(s => s.startsWith('@ BG,'));
  재기('BG 줄이 16개', BG들.length === 16, BG들.length + '개');
  재기('WAIT 줄은 없다', !글.includes('@ WAIT,'));
  재기('이름 자리가 P1001 부터 순번인가',
       BG들.every((줄, i) => 줄.includes(`-1, "P${1001 + i}", 0, "", "", 0,`)),
       BG들.map(줄 => (/-1, "([^"]*)"/.exec(줄) || [,'?'])[1]).slice(0, 2).join('·') + '…');


  // 구멍 값이 한 자도 안 달라졌나 — 자리로 읽어 cix 값과 맞춘다
  let 어긋남 = [];
  BG들.forEach((줄, i) => {
    const 꼬리 = 꼬리쪼개기(줄.slice(줄.indexOf(' : ') + 3));
    const [x, y, dia, dp] = 바라던것[i];
    const 봐야할것 = [['SIDE',꼬리[0],'0'], ['CRN',꼬리[1],'"1"'], ['X',꼬리[2],String(x)],
                     ['Y',꼬리[3],String(y)], ['Z',꼬리[4],'0'], ['DP',꼬리[5],String(dp)],
                     ['DIA',꼬리[6],String(dia)]];
    for (const [이름, 적힌것, 와야할것] of 봐야할것)
      if (적힌것 !== 와야할것) 어긋남.push(`${i+1}째 ${이름} ${적힌것}≠${와야할것}`);
    if (!/, "BG", 0, 0, 0, 0, -1, 0, 0, 0$/.test(줄)) 어긋남.push(`${i+1}째 줄 꼬리가 다르다`);
  });
  재기('16개 구멍 값(SIDE·CRN·X·Y·Z·DP·DIA)이 cix 그대로', 어긋남.length === 0, 어긋남.slice(0,4).join(' / '));
  재기('DP 가 DIA 보다 앞이다 (첫 구멍 12 → 5)',
       / : 0, "1", 19, 70, 0, 12, 5, /.test(BG들[0]), BG들[0].slice(0, 70));
  재기('번호가 1부터 차례로', BG들.every((줄, i) => 줄.startsWith(`@ BG, "", "", ${i+1}, "", 0 : `)));
}

/* ── 4. WAIT 단추 — 사장님이 누를 때만 ──────────────────────────────── */
let 웨잇 = null; 탓 = '';
try { 웨잇 = await 눌러받기('#b-wait'); } catch (e) { 탓 = String(e.message || e).split('\n')[0]; }
재기('WAIT 단추로도 .bpp 가 내려왔나', !!웨잇, 웨잇 ? 웨잇.이름 : 탓);
if (웨잇) {
  재기('이름이 _WAIT 로 갈라졌나', 웨잇.이름 === '592x382_1001_01_WAIT.bpp', 웨잇.이름);
  const 줄들 = 웨잇.글.split('\r\n').filter(s => /^@ (BG|WAIT),/.test(s));
  const w = 줄들.findIndex(s => s.startsWith('@ WAIT,'));
  const 앞 = 줄들.slice(0, w), 뒤 = 줄들.slice(w + 1);
  const xy = s => { const t = 꼬리쪼개기(s.slice(s.indexOf(' : ') + 3)); return t[2] + '|' + t[3]; };
  재기('WAIT 줄이 하나 들어갔나', 줄들.filter(s => s.startsWith('@ WAIT,')).length === 1);
  재기('WAIT 줄 꼴이 본보기 그대로',
       /^@ WAIT, "", "", \d+, "", 0 : 1, 1, 0, 2, 1, 0$/.test(줄들[w]), 줄들[w]);
  재기('구멍 16개가 그대로 다 있나', 줄들.length === 17, 줄들.length + '줄');
  재기('집게 밑 둘만 WAIT 뒤로 미뤘나',
       뒤.length === 2 && 뒤.map(xy).sort().join(' ') === '504|10 98|10',
       '앞 ' + 앞.length + ' · 뒤 ' + 뒤.map(xy).join(' '));
  재기('번호가 WAIT 까지 이어 1부터 차례로',
       줄들.every((s, i) => new RegExp(`^@ (BG|WAIT), "", "", ${i+1}, "", 0 : `).test(s)));
}

/* ── 5. 값이 어긋나면 내려받기를 막나 ───────────────────────────────── */
const 막았나 = await p.evaluate(async () => {
  const 판 = { LPX:'592', LPY:'382', LPZ:'18' };
  const 변수 = await window.보링.변수틀읽기();
  const 차례 = [{ id:'1', side:'0', crn:'1', x:'19', y:'70', dia:'5', dp:'12' }];
  const 좋은것 = window.보링.bpp짓기(판, 차례, 변수, -1);
  const 성한것 = window.보링.되짚기(좋은것, 차례, 판).length;
  // X 를 한 자 바꿔 놓고 되짚어 본다
  const 흠난것 = 좋은것.replace(' : 0, "1", 19, 70,', ' : 0, "1", 20, 70,');
  const 잡은것 = window.보링.되짚기(흠난것, 차례, 판);
  // 판 크기가 어긋난 것도 잡나
  const 흠난것2 = 좋은것.replace('PAN=LPX|592||4|', 'PAN=LPX|591||4|');
  return { 성한것, 잡은것, 판잡음: window.보링.되짚기(흠난것2, 차례, 판) };
});
재기('성한 bpp 는 어긋남 0', 막았나.성한것 === 0, '어긋남 ' + 막았나.성한것);
재기('X 를 한 자 바꾸면 잡아내나', 막았나.잡은것.length === 1 && /X 20 ≠ 19/.test(막았나.잡은것[0]), 막았나.잡은것.join(' / '));
재기('판 크기가 어긋나도 잡아내나', 막았나.판잡음.length === 1, 막았나.판잡음.join(' / '));

/* ── 6. 짚어서 지시하는 손잡이 — 진짜 길게 눌러 본다 ────────────────── */
const 판 = await p.$('#b-go');
const box = await 판.boundingBox();
const cdp = await ctx.newCDPSession(p);
const 점 = [{ x: box.x + box.width / 2, y: box.y + box.height / 2 }];
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: 점 });
await p.waitForTimeout(700);                       // 0.5초보다 길게 — 손잡이가 열려야 한다
const 열렸나 = await p.$('.vg-sheet') !== null;
const 짚은것 = 열렸나 ? (await p.textContent('.vg-sheet .vg-what')) : '';
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
재기('길게 누르면 지시창이 열리나', 열렸나, 짚은것.trim());
재기('짚은 것이 「바꾸기」 인가', /바꾸기/.test(짚은것), 짚은것.trim());
const 이름 = await p.evaluate(() => document.title);
재기('손잡이가 부를 이름이 「보링변환」', 이름 === '보링변환', 이름);
// 지시창을 닫아 둔다 — 열린 채로 두면 inset:0 뒤판이 다음 누름을 다 먹는다
if (열렸나) { await p.waitForTimeout(500); await p.tap('.vg-sheet .vg-cancel'); await p.waitForTimeout(300); }
재기('「그만」 을 누르면 지시창이 닫히나', await p.$('.vg-sheet') === null);


/* ── 7. 식으로 적힌 값 · 쉼표 든 CRN ──────────────────────────────────
   관리자가 짚어 준 것: `374-32` · `380+0.5` 처럼 식이 와도 기계가 읽으니 계산하지
   말고 그대로 넣는다. CRN="1,4" 는 모서리 1 과 4 에서 두 번 뚫으라는 뜻이라 그대로
   옮긴다. 본보기 자리는 사장님 실제 부속만 두므로 이 판은 시험이 지어서 먹인다. */
const cix짓기 = (판, 구멍들) => {
  const T = '\t', L = ['BEGIN ID CID3', T + 'REL= 5.0', 'END ID', 'BEGIN MAINDATA'];
  for (const [k, v] of Object.entries(판)) L.push(T + k + '=' + v);
  L.push('END MAINDATA');
  구멍들.forEach((g, i) => {
    L.push('BEGIN MACRO', T + 'NAME=BG', T + `PARAM,NAME=ID,VALUE="${i+1}"`,
           T + 'PARAM,NAME=SIDE,VALUE=0', T + `PARAM,NAME=CRN,VALUE="${g.crn}"`,
           T + `PARAM,NAME=X,VALUE=${g.x}`, T + `PARAM,NAME=Y,VALUE=${g.y}`,
           T + `PARAM,NAME=DIA,VALUE=${g.dia}`, T + `PARAM,NAME=DP,VALUE=${g.dp}`, 'END MACRO');
  });
  return Buffer.from(L.join('\r\n') + '\r\n', 'utf-8');
};
async function 먹이기(이름, 속){
  await p.setInputFiles('#b-file', { name: 이름, mimeType: 'text/plain', buffer: 속 });
  await p.waitForTimeout(350);
}

await 먹이기('식.cix', cix짓기(
  { LPX:'700+48', LPY:'380+0.5', LPZ:'18+0.1' },
  [ { crn:'1,4', x:'374-32', y:'50',    dia:'15', dp:'14' },   // 집게 밖
    { crn:'1',   x:'400+50', y:'30-25', dia:'5',  dp:'10' },   // 재면 450,5 — 집게2 밑
    { crn:'1',   x:'34',     y:'50',    dia:'15', dp:'14' } ]));

const 식본것 = await p.evaluate(() => ({
  빨강: [...document.querySelectorAll('#b-draw circle')].filter(c => c.getAttribute('fill') === '#FF3B30').length,
  동그라미: document.querySelectorAll('#b-draw circle').length,
  빨간글: document.getElementById('b-warn').classList.contains('bhide') ? '' : document.getElementById('b-warn').textContent,
  알약: document.getElementById('b-pills').textContent,
}));
재기('식으로 적힌 판 크기를 재서 그렸나', 식본것.동그라미 === 3, '동그라미 ' + 식본것.동그라미);
재기('식(400+50 · 30-25)을 재서 집게 밑을 찾아내나', 식본것.빨강 === 1 && /집게 밑/.test(식본것.빨간글),
     '빨강 ' + 식본것.빨강 + ' · ' + 식본것.빨간글);

let 식나온것 = null; 탓 = '';
try { 식나온것 = await 눌러받기('#b-go'); } catch (e) { 탓 = String(e.message || e).split('\n')[0]; }
// 이름이 `download` 로 나오는 것은 시험이 지은 파일 이름(식.cix)이 한글이라 그렇다.
// 진짜 CAD 파일 이름은 영문·숫자라 위 첫 시험처럼 그대로 붙는다.
재기('식이 든 판도 .bpp 가 내려왔나', !!식나온것, 식나온것 ? 식나온것.이름 : 탓);
if (식나온것) {
  const 글 = 식나온것.글;
  재기('판 크기 식을 계산하지 않고 그대로 넣었나',
       글.includes('PAN=LPX|700+48||4|') && 글.includes('PAN=LPY|380+0.5||4|') && 글.includes('PAN=LPZ|18+0.1||4|'));
  const BG = 글.split('\r\n').filter(s => s.startsWith('@ BG,'));
  const 꼬리 = BG.map(s => 꼬리쪼개기(s.slice(s.indexOf(' : ') + 3)));
  재기('구멍 X·Y 식도 계산하지 않고 그대로',
       꼬리[0][2] === '374-32' && 꼬리[1][2] === '400+50' && 꼬리[1][3] === '30-25',
       꼬리.map(t => t[2] + '|' + t[3]).join(' '));
  재기('쉼표 든 CRN("1,4")을 그대로 옮겼나', 꼬리[0][1] === '"1,4"', 꼬리[0][1]);
  재기('쉼표가 들어와도 자리가 안 밀렸나 (DP 14 · DIA 15)',
       꼬리[0][5] === '14' && 꼬리[0][6] === '15', 꼬리[0].slice(0,7).join(' / '));
}

/* ── 8. 못 재는 값이면 말하고 WAIT 를 막는다 ────────────────────────── */
await 먹이기('못재.cix', cix짓기(
  { LPX:'592', LPY:'382', LPZ:'18' },
  [ { crn:'1', x:'98',    y:'10', dia:'5', dp:'12' },          // 집게 밑
    { crn:'1', x:'100*2', y:'10', dia:'5', dp:'12' } ]));      // 곱하기는 못 잰다
const 못잰것 = await p.evaluate(() => ({
  빨간글: document.getElementById('b-warn').classList.contains('bhide') ? '' : document.getElementById('b-warn').textContent,
  WAIT: document.getElementById('b-wait').disabled ? '막힘' : '열림',
  바꾸기: document.getElementById('b-go').disabled ? '막힘' : '열림',
  동그라미: document.querySelectorAll('#b-draw circle').length,
}));
재기('못 재는 값이 있으면 빨갛게 말하나', /못 재는 구멍 1개/.test(못잰것.빨간글), 못잰것.빨간글);
재기('못 재는 값이 있으면 WAIT 를 막나', 못잰것.WAIT === '막힘', 못잰것.WAIT);
재기('그래도 바꾸기는 열어 둔다 (값은 그대로 옮긴다)', 못잰것.바꾸기 === '열림', 못잰것.바꾸기);
재기('못 재는 구멍은 그리지 않는다', 못잰것.동그라미 === 1, '동그라미 ' + 못잰것.동그라미);
let 못잰내림 = null; 탓 = '';
try { 못잰내림 = await 눌러받기('#b-go'); } catch (e) { 탓 = String(e.message || e).split('\n')[0]; }
재기('못 재는 값도 글자 그대로 나가나',
     !!못잰내림 && 못잰내림.글.includes(', 100*2, 10, 0, 12, 5, '), 못잰내림 ? '나갔다' : 탓);

/* ── 9. 모르는 매크로(BH 따위)면 바꾸기를 막는다 ───────────────────── */
await 먹이기('모름.cix', Buffer.from(
  ['BEGIN ID CID3','\tREL= 5.0','END ID','BEGIN MAINDATA','\tLPX=592','\tLPY=382','\tLPZ=18','END MAINDATA',
   'BEGIN MACRO','\tNAME=BG','\tPARAM,NAME=CRN,VALUE="1"','\tPARAM,NAME=X,VALUE=19','\tPARAM,NAME=Y,VALUE=70',
   '\tPARAM,NAME=DIA,VALUE=5','\tPARAM,NAME=DP,VALUE=12','\tPARAM,NAME=SIDE,VALUE=0','END MACRO',
   'BEGIN MACRO','\tNAME=BH','\tPARAM,NAME=SIDE,VALUE=1','\tPARAM,NAME=X,VALUE=50','END MACRO'].join('\r\n') + '\r\n', 'utf-8'));
const 모름 = await p.evaluate(() => ({
  빨간글: document.getElementById('b-warn').classList.contains('bhide') ? '' : document.getElementById('b-warn').textContent,
  바꾸기: document.getElementById('b-go').disabled ? '막힘' : '열림',
}));
재기('모르는 매크로(BH)를 만나면 바꾸기를 막나', 모름.바꾸기 === '막힘', 모름.바꾸기);
재기('무엇이 모르는 것인지 적나', /BH/.test(모름.빨간글) && /구멍이 빠진다/.test(모름.빨간글), 모름.빨간글);


/* ── 10. 기계가 읽어 준 그 파일과 견주기 ─────────────────────────────
   사장님이 실제로 기계에 넣으셨고 기계가 읽은 파일의 @ BG 열여섯 줄이다.
   자리 하나가 어긋나면 바로 여기서 잡힌다. **번호 자리만 빼고 글자 그대로** 본다
   — 번호는 겹치지만 않으면 된다고 관리자가 짚어 주었다. 손대지 마라. */
const 기계가읽은것 = [
  '@ BG, "", "", N, "", 0 : 0, "1", 19, 70, 0, 12, 5, 0, 1, 0, 288, 0, 0, 0, 2, "", 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, -1, "P1001", 0, "", "", 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, "", "", "BG", 0, 0, 0, 0, -1, 0, 0, 0',
  '@ BG, "", "", N, "", 0 : 0, "1", 19, 102, 0, 14, 8, 0, 1, 0, 288, 0, 0, 0, 2, "", 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, -1, "P1002", 0, "", "", 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, "", "", "BG", 0, 0, 0, 0, -1, 0, 0, 0',
  '@ BG, "", "", N, "", 0 : 0, "1", 19, 279, 0, 14, 8, 0, 1, 0, 288, 0, 0, 0, 2, "", 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, -1, "P1003", 0, "", "", 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, "", "", "BG", 0, 0, 0, 0, -1, 0, 0, 0',
  '@ BG, "", "", N, "", 0 : 0, "1", 19, 311, 0, 12, 5, 0, 1, 0, 288, 0, 0, 0, 2, "", 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, -1, "P1004", 0, "", "", 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, "", "", "BG", 0, 0, 0, 0, -1, 0, 0, 0',
  '@ BG, "", "", N, "", 0 : 0, "1", 98, 10, 0, 12, 5, 0, 1, 0, 288, 0, 0, 0, 2, "", 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, -1, "P1005", 0, "", "", 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, "", "", "BG", 0, 0, 0, 0, -1, 0, 0, 0',
  '@ BG, "", "", N, "", 0 : 0, "1", 282, 69, 0, 12, 5, 0, 1, 0, 288, 0, 0, 0, 2, "", 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, -1, "P1006", 0, "", "", 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, "", "", "BG", 0, 0, 0, 0, -1, 0, 0, 0',
  '@ BG, "", "", N, "", 0 : 0, "1", 282, 325, 0, 12, 5, 0, 1, 0, 288, 0, 0, 0, 2, "", 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, -1, "P1007", 0, "", "", 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, "", "", "BG", 0, 0, 0, 0, -1, 0, 0, 0',
  '@ BG, "", "", N, "", 0 : 0, "1", 314, 69, 0, 12, 5, 0, 1, 0, 288, 0, 0, 0, 2, "", 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, -1, "P1008", 0, "", "", 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, "", "", "BG", 0, 0, 0, 0, -1, 0, 0, 0',
  '@ BG, "", "", N, "", 0 : 0, "1", 314, 325, 0, 12, 5, 0, 1, 0, 288, 0, 0, 0, 2, "", 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, -1, "P1009", 0, "", "", 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, "", "", "BG", 0, 0, 0, 0, -1, 0, 0, 0',
  '@ BG, "", "", N, "", 0 : 0, "1", 346, 69, 0, 12, 5, 0, 1, 0, 288, 0, 0, 0, 2, "", 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, -1, "P1010", 0, "", "", 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, "", "", "BG", 0, 0, 0, 0, -1, 0, 0, 0',
  '@ BG, "", "", N, "", 0 : 0, "1", 346, 325, 0, 12, 5, 0, 1, 0, 288, 0, 0, 0, 2, "", 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, -1, "P1011", 0, "", "", 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, "", "", "BG", 0, 0, 0, 0, -1, 0, 0, 0',
  '@ BG, "", "", N, "", 0 : 0, "1", 504, 10, 0, 12, 5, 0, 1, 0, 288, 0, 0, 0, 2, "", 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, -1, "P1012", 0, "", "", 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, "", "", "BG", 0, 0, 0, 0, -1, 0, 0, 0',
  '@ BG, "", "", N, "", 0 : 0, "1", 583, 70, 0, 12, 5, 0, 1, 0, 288, 0, 0, 0, 2, "", 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, -1, "P1013", 0, "", "", 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, "", "", "BG", 0, 0, 0, 0, -1, 0, 0, 0',
  '@ BG, "", "", N, "", 0 : 0, "1", 583, 102, 0, 14, 8, 0, 1, 0, 288, 0, 0, 0, 2, "", 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, -1, "P1014", 0, "", "", 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, "", "", "BG", 0, 0, 0, 0, -1, 0, 0, 0',
  '@ BG, "", "", N, "", 0 : 0, "1", 583, 279, 0, 14, 8, 0, 1, 0, 288, 0, 0, 0, 2, "", 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, -1, "P1015", 0, "", "", 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, "", "", "BG", 0, 0, 0, 0, -1, 0, 0, 0',
  '@ BG, "", "", N, "", 0 : 0, "1", 583, 311, 0, 12, 5, 0, 1, 0, 288, 0, 0, 0, 2, "", 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, -1, "P1016", 0, "", "", 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, "", "", "BG", 0, 0, 0, 0, -1, 0, 0, 0',
];
const 번호지우기 = 줄 => 줄.replace(/^(@ BG, "", "", )\d+(, "")/, '$1N$2');
if (나온것) {
  const 우리것 = 나온것.글.split('\r\n').filter(s => s.startsWith('@ BG,')).map(번호지우기);
  const 다른줄 = 기계가읽은것
      .map((바른것, i) => 우리것[i] === 바른것 ? null : (i + 1) + '째')
      .filter(Boolean);
  재기('기계가 읽은 파일의 BG 열여섯 줄과 글자 그대로 같나',
       우리것.length === 16 && 다른줄.length === 0,
       다른줄.length ? 다른줄.join(' · ') + ' 이 다르다' : '16줄 다 같다');
  재기('맨 끝에 빈 줄이 하나 있나', /\[SUBPROGS\]\r\n\r\n$/.test(나온것.글),
       JSON.stringify(나온것.글.slice(-14)));
}

await b.close();
fs.rmSync(내린칸, { recursive: true, force: true });

/* ── 적기 ──────────────────────────────────────────────────────────── */
const 실패 = 잰것.filter(t => !t.됐나);
for (const t of 잰것) console.log((t.됐나 ? '  ✓ ' : '  ✗ ') + t.이름 + (t.곁 ? '   [' + t.곁 + ']' : ''));
console.log(`\n${잰것.length - 실패.length}/${잰것.length} 통과`);
process.exit(실패.length ? 1 : 0);
