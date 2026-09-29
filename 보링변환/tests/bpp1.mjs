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

  const BG들 = 글.split('\r\n').filter(s => s.startsWith('@ BG,'));
  재기('BG 줄이 16개', BG들.length === 16, BG들.length + '개');
  재기('WAIT 줄은 없다', !글.includes('@ WAIT,'));

  // 구멍 값이 한 자도 안 달라졌나 — 자리로 읽어 cix 값과 맞춘다
  let 어긋남 = [];
  BG들.forEach((줄, i) => {
    const 꼬리 = 줄.slice(줄.indexOf(' : ') + 3).split(',').map(s => s.trim());
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
  const xy = s => { const t = s.slice(s.indexOf(' : ') + 3).split(',').map(v => v.trim()); return t[2] + ',' + t[3]; };
  재기('WAIT 줄이 하나 들어갔나', 줄들.filter(s => s.startsWith('@ WAIT,')).length === 1);
  재기('WAIT 줄 꼴이 본보기 그대로',
       /^@ WAIT, "", "", \d+, "", 0 : 1, 1, 0, 2, 1, 0$/.test(줄들[w]), 줄들[w]);
  재기('구멍 16개가 그대로 다 있나', 줄들.length === 17, 줄들.length + '줄');
  재기('집게 밑 둘만 WAIT 뒤로 미뤘나',
       뒤.length === 2 && 뒤.map(xy).sort().join(' ') === '504,10 98,10',
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

await b.close();
fs.rmSync(내린칸, { recursive: true, force: true });

/* ── 적기 ──────────────────────────────────────────────────────────── */
const 실패 = 잰것.filter(t => !t.됐나);
for (const t of 잰것) console.log((t.됐나 ? '  ✓ ' : '  ✗ ') + t.이름 + (t.곁 ? '   [' + t.곁 + ']' : ''));
console.log(`\n${잰것.length - 실패.length}/${잰것.length} 통과`);
process.exit(실패.length ? 1 : 0);
