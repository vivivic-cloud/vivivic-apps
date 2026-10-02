/* 보링변환 — 폰 375px 에서 .cix 를 고르고 바꿔 나온 .bpp 를 재는 시험.
   손가락으로 누른다(CDP 터치·tap()). 잰 것만 적는다.

       node 보링변환/tests/bpp1.mjs

   에이엠티 시험의 터(브라우저 찾기·자리 서버)를 그대로 빌려 쓴다 — 그 파일은 안 건드린다. */
import fs from 'node:fs';
import path from 'node:path';
import { 브라우저열기, devices, 서버, 뿌리 } from '../../에이엠티/tests/도구/터.mjs';

/* 잰 값은 재는 자리에서 바로 적는다 — 뒤에서 무언가 터져도 여기까지 잰 것은 남는다
   (모아 두었다가 끝에 적으면, 앞이 빨개서 뒤가 터졌을 때 아무것도 안 보인다). */
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

const 잰것 = [];
const 재기 = (이름, 됐나, 곁 = '') => {
    잰것.push({ 이름, 됐나, 곁 });
    console.log((됐나 ? '  ✓ ' : '  ✗ ') + 이름 + (곁 ? '   [' + 곁 + ']' : ''));
};

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

/* ── 0. 박스 판 — 이 집의 모든 프로그램이 이 꼴이다 ─────────────────── */
const 박스판 = await p.evaluate(() => ({
  판떴나: !!document.querySelector('#bor-home') && getComputedStyle(document.getElementById('bor-home')).display !== 'none',
  바꾸기화면: getComputedStyle(document.getElementById('bor-app')).display,
  일하는박스: (document.querySelector('#bor-home .borh-tile .borh-nm') || {}).textContent || '',
  새박스: (document.querySelector('.borh-newbox') || {}).textContent || '',
  새박스단추: !!document.getElementById('borb-fab') &&
             getComputedStyle(document.getElementById('borb-fab')).display !== 'none',
  내박스셈: (document.getElementById('borh-mine-n') || {}).textContent || '',
}));
재기('열면 박스 판이 먼저 나오나', 박스판.판떴나 && 박스판.바꾸기화면 === 'none', 박스판.바꾸기화면);
재기('일하는 박스 「보링변환」 이 있나', 박스판.일하는박스 === '보링변환', 박스판.일하는박스);
재기('「새 박스」 가 붙었나', /새 박스/.test(박스판.새박스), 박스판.새박스.trim());
재기('바닥 「새 박스」 단추(FAB)가 떴나', 박스판.새박스단추);
재기('내 박스 셈이 나오나', /개$/.test(박스판.내박스셈), 박스판.내박스셈);

// 타일 크기 — 작업대·에이엠티와 같은 150px 이다
const 타일높이 = await p.evaluate(() =>
  Math.round(document.querySelector('#bor-home .borh-tile').getBoundingClientRect().height));
재기('타일이 집 규격대로 150px 이상', 타일높이 >= 150, 타일높이 + 'px');

// 「새 박스」 를 눌러 만드는 판이 열리나 — 작업대의 그 판이다
await p.tap('.borh-newbox');
await p.waitForTimeout(300);
const 만들판 = await p.evaluate(() => ({
  열렸나: document.documentElement.getAttribute('data-borb') === '1',
  머리: (document.querySelector('#borb-card h4') || {}).textContent || '',
  색칩: [...document.querySelectorAll('#borb-tones .borb-chip')].map(b => b.textContent),
  아이콘칸: document.querySelectorAll('#borb-ig button[data-ic]').length,
  만들기: (document.getElementById('borb-save') || {}).textContent || '',
}));
재기('「새 박스」 를 누르면 만드는 판이 열리나', 만들판.열렸나 && 만들판.머리 === '새 박스', 만들판.머리);
재기('색 세 가지가 작업대 그대로', 만들판.색칩.join('·') === '흰색·회색·검정', 만들판.색칩.join('·'));
재기('아이콘 고르는 칸이 그려지나', 만들판.아이콘칸 > 0, 만들판.아이콘칸 + '칸');
재기('단추가 「만들기」 인가', 만들판.만들기 === '만들기', 만들판.만들기);
// 바깥을 눌러 닫는다 — 판이 아래에서 올라오므로 위쪽 빈 자리를 짚는다
await p.tap('#borb-sheet', { position: { x: 187, y: 6 } });
await p.waitForTimeout(300);
재기('바깥을 누르면 만드는 판이 닫히나',
     await p.evaluate(() => document.documentElement.getAttribute('data-borb') === null));


/* ── 0-2. 박스를 누르면 그 안으로 들어간다 ──────────────────────────────
   사장님이 짚으셨다: 「새박스를 만들고 눌렀을때 앞으로 기능을 추가할 빈 페이지가
   나와야 하는데 … 팝업이 나옵니다」. 작업대가 하는 대로 안으로 들어가야 한다.

   창고(파이어스토어)는 이 상자에서 못 닿는다. 그래서 같은 꼴의 가짜 칸을 끼워
   넣고 화면이 하는 일만 잰다 — 앱 파일은 한 글자도 안 건드린다. */
await p.evaluate(() => {
  const 곳간 = { boring_boxes: new Map(), boring_files: new Map(), boring_config: new Map() };
  const 귀들 = [];
  const 이름of = (a, 뒤) => a[a.length - 1 - 뒤];
  const 스냅칸 = 이름 => ({ forEach: f => 곳간[이름].forEach((v, k) => f({ id: k, data: () => v })) });
  const 스냅문서 = (이름, id) => ({ id, exists: () => 곳간[이름].has(id), data: () => 곳간[이름].get(id) || null });
  const 알린다 = 이름 => 귀들.forEach(g => {
    if (g.이름 !== 이름) return;
    g.cb(g.kind === 'col' ? 스냅칸(이름) : 스냅문서(이름, g.id));
  });
  window.__곳간 = 곳간;
  window.__칸 = 곳간.boring_boxes;          // 박스 시험이 보던 그 칸
  window.db = {};
  window.fbFirestore = {
    collection: (...a) => ({ kind: 'col', 이름: 이름of(a, 0) }),
    doc:        (...a) => ({ kind: 'doc', 이름: 이름of(a, 1), id: 이름of(a, 0) }),
    onSnapshot: (ref, cb) => {
      귀들.push({ kind: ref.kind, 이름: ref.이름, id: ref.id, cb });
      cb(ref.kind === 'col' ? 스냅칸(ref.이름) : 스냅문서(ref.이름, ref.id));
    },
    setDoc: async (r, v, opt) => {
      곳간[r.이름].set(r.id, opt && opt.merge
        ? Object.assign({}, 곳간[r.이름].get(r.id), v) : v);
      알린다(r.이름);
    },
    updateDoc: async (r, v) => { 곳간[r.이름].set(r.id, Object.assign({}, 곳간[r.이름].get(r.id), v)); 알린다(r.이름); },
    deleteDoc: async (r)    => { 곳간[r.이름].delete(r.id); 알린다(r.이름); },
  };
  window.borBoxSync();
  window.borFilesSync();
});

async function 박스만들기(이름){
  await p.tap('.borh-newbox');
  await p.waitForTimeout(250);
  await p.fill('#borb-nm', 이름);
  await p.tap('#borb-save');
  await p.waitForTimeout(300);
}
const 타일글 = () => p.evaluate(() =>
  [...document.querySelectorAll('#borh-mine [data-borb-id]')].map(t =>
    (t.querySelector('.borh-nm')||{}).textContent + '|' + (t.querySelector('.borh-pct')||{}).textContent));

await 박스만들기('시험박스');
재기('박스를 만들면 타일이 생기나', (await 타일글()).length === 1, (await 타일글()).join(' '));
재기('빈 박스 아래에 「비었다」 라 적히나', (await 타일글())[0] === '시험박스|비었다', (await 타일글())[0]);

// ★ 짚으신 자리 — 눌렀을 때 팝업이 아니라 빈 판이 나와야 한다
await p.tap('#borh-mine [data-borb-id]');
await p.waitForTimeout(350);
const 안 = await p.evaluate(() => ({
  고치기판: document.documentElement.getAttribute('data-borb'),
  들어왔나: document.documentElement.getAttribute('data-borin'),
  지나온자리: (document.getElementById('borh-path') || {}).textContent || '',
  셈: (document.getElementById('borh-cnt') || {}).textContent || '',
  안에든것: document.querySelectorAll('#borh-mine [data-borb-id]').length,
  새박스: !!document.querySelector('.borh-newbox'),
  일하는박스: getComputedStyle(document.getElementById('borh-work')).display,
  뒤로: !!document.getElementById('borh-up') &&
        Math.round(document.getElementById('borh-up').getBoundingClientRect().height),
}));
재기('박스를 누르면 고치기 판이 안 나오나', 안.고치기판 === null, '고치기판 ' + 안.고치기판);
재기('박스를 누르면 그 안으로 들어가나', 안.들어왔나 === '1' && 안.안에든것 === 0,
     '안에 든 것 ' + 안.안에든것);
재기('안이 비었으면 빈 판 + 「새 박스」 만', 안.새박스 && 안.안에든것 === 0);
재기('지나온 자리를 적나', 안.지나온자리.trim() === '시험박스', 안.지나온자리.trim());
재기('안에서는 일하는 박스를 안 보인다', 안.일하는박스 === 'none', 안.일하는박스);
재기('뒤로 가는 단추가 44px 인가', 안.뒤로 >= 44, 안.뒤로 + 'px');

// 안에서 또 만든다 — parent 가 지금 들어와 있는 박스여야 한다
await 박스만들기('속박스');
const 속 = await 타일글();
재기('안에서 만든 박스가 그 안에 들어가나', 속.length === 1 && 속[0].startsWith('속박스'), 속.join(' '));
// 속박스 안으로 한 칸 더 들어가 본다 — 지나온 자리가 두 칸이 되어야 한다
await p.tap('#borh-mine [data-borb-id]');
await p.waitForTimeout(350);
const 두칸 = await p.evaluate(() => ({
  자리: document.getElementById('borh-path').textContent.replace(/\s+/g, ' ').trim(),
  안에든것: document.querySelectorAll('#borh-mine [data-borb-id]').length,
  새박스: !!document.querySelector('.borh-newbox'),
}));
재기('한 칸 더 들어가면 지나온 자리가 두 칸이 되나', 두칸.자리 === '시험박스 › 속박스', 두칸.자리);
재기('두 칸째도 빈 판 + 「새 박스」', 두칸.안에든것 === 0 && 두칸.새박스);

// 뒤로 한 칸 — 시험박스 안으로 돌아온다
await p.tap('#borh-up');
await p.waitForTimeout(300);
재기('뒤로 누르면 한 칸만 나오나',
     await p.evaluate(() => document.getElementById('borh-path').textContent.trim() === '시험박스' &&
                            document.documentElement.getAttribute('data-borin') === '1'));

// 뒤로 한 칸 더 — 맨 위 판
await p.tap('#borh-up');
await p.waitForTimeout(300);
const 나옴 = await p.evaluate(() => ({
  들어왔나: document.documentElement.getAttribute('data-borin'),
  타일: [...document.querySelectorAll('#borh-mine [data-borb-id] .borh-pct')].map(e => e.textContent),
  일하는박스: getComputedStyle(document.getElementById('borh-work')).display,
}));
재기('뒤로 누르면 맨 위 판으로 나오나', 나옴.들어왔나 === null && 나옴.일하는박스 !== 'none');
재기('속에 든 수가 타일에 적히나', 나옴.타일.join('') === '1개', 나옴.타일.join(' '));

// 0.4초 길게 누르면 고치기 판 — 이것이 고치는 유일한 길이다(「새 박스」 단추 말고)
const 타일칸 = await (await p.$('#borh-mine [data-borb-id]')).boundingBox();
const cdp0 = await ctx.newCDPSession(p);
await cdp0.send('Input.dispatchTouchEvent', { type: 'touchStart',
  touchPoints: [{ x: 타일칸.x + 타일칸.width / 2, y: 타일칸.y + 타일칸.height / 2 }] });
await p.waitForTimeout(650);
const 길게 = await p.evaluate(() => ({
  열렸나: document.documentElement.getAttribute('data-borb'),
  머리: (document.querySelector('#borb-card h4') || {}).textContent || '',
  이름칸: (document.getElementById('borb-nm') || {}).value || '',
}));
await cdp0.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
재기('0.4초 길게 누르면 고치기 판이 열리나', 길게.열렸나 === '1' && 길게.머리 === '박스설정', 길게.머리);
재기('고치기 판에 그 박스 이름이 들어와 있나', 길게.이름칸 === '시험박스', 길게.이름칸);
// 속에 든 박스가 있으면 못 지운다 — 조용히 사라지면 안 된다
const 막음 = await p.evaluate(async () => {
  let 말 = ''; const 옛 = window.alert; window.alert = m => { 말 = String(m); };
  document.getElementById('borb-del').click();
  await new Promise(r => setTimeout(r, 200));
  window.alert = 옛;
  return { 말, 아직있나: window.__칸.size };
});
재기('속에 박스가 든 것은 못 지우게 막나', /먼저 치워/.test(막음.말) && 막음.아직있나 === 2, 막음.말);
await p.tap('#borb-sheet', { position: { x: 187, y: 6 } });
await p.waitForTimeout(300);


/* ── 0-3. 「파일」 박스 — 드라이브에서 온 목록 ────────────────────────
   드라이브를 훑어 boring_files 에 담는 일은 앱스 스크립트(서류관리)가 한다.
   여기서는 담긴 것을 읽어 보여 주는 일만 잰다. */
await 박스만들기('파일');
const 파일타일 = await 타일글();
재기('「파일」 이라 적은 박스는 파일 화면으로 간다고 적히나',
     파일타일.some(t => t === '파일|파일'), 파일타일.join(' '));

// 맨 위 판에는 앞서 만든 「시험박스」 도 있다 — 「파일」 박스를 집어서 누른다
const 파일박스 = await p.evaluate(() => {
  const t = [...document.querySelectorAll('#borh-mine [data-borb-id]')]
      .find(e => (e.querySelector('.borh-nm') || {}).textContent === '파일');
  return t ? t.dataset.borbId : '';
});
await p.tap(`[data-borb-id="${파일박스}"]`);
await p.waitForTimeout(400);
const 빈목록 = await p.evaluate(() => ({
  화면: document.documentElement.getAttribute('data-borscreen'),
  보이나: getComputedStyle(document.getElementById('bor-files')).display,
  빈말: document.getElementById('borf-none').textContent,
  찾기: document.getElementById('borf-find').classList.contains('bhide'),
  폴더칸: !!document.getElementById('borf-folder'),
}));
재기('「파일」 박스를 누르면 파일 화면이 나오나',
     빈목록.화면 === 'files' && 빈목록.보이나 !== 'none', 빈목록.보이나);
재기('폴더를 안 정했으면 그렇다고 적나', 빈목록.빈말 === '아직 볼 폴더를 안 정했습니다', 빈목록.빈말);
재기('목록이 비면 찾기·거르기를 안 보인다', 빈목록.찾기);
// 사장님이 짚으셨다(09-30 「이런부분 삭제해줘」) — 화면에서 폴더를 고치는 길은 없앴다
재기('「볼 폴더」 칸이 화면에 없다', !빈목록.폴더칸);
재기('「저장」 단추도 없다', !(await p.evaluate(() => !!document.querySelector('.borf-save'))));

// 폴더는 창고에서 읽어 쓰기만 한다 — 관리자가 넣어 둔 값이 그대로 쓰인다
await p.evaluate(async () => {
  const { setDoc, doc } = window.fbFirestore;
  await setDoc(doc(null, 'a', 'p', 'd', 'boring_config', '설정'), { folder: '국내생산' }, { merge: true });
});
await p.waitForTimeout(350);
재기('창고에 든 폴더를 읽어 쓰나',
     /드라이브를 훑는 일이 아직 안 켜졌습니다/.test(
       await p.evaluate(() => document.getElementById('borf-none').textContent)),
     await p.evaluate(() => document.getElementById('borf-none').textContent));


/* ── 드라이브 훑기를 이 화면이 직접 부른다 ─────────────────────────────
   사장님: 「서류관리 왜열어」. 맞는 말씀이다 — 보링변환만 쓰시는데 다른 프로그램을
   열 까닭이 없다. 주소(exec)는 boring_config/설정 에서 읽고 코드에 안 박는다. */
await p.evaluate(() => {
  window.__부른곳 = [];
  window.__될까 = false;                       // 처음에는 막힌 셈 친다
  const 옛 = window.fetch.bind(window);
  window.fetch = (u, o) => {
    const 글 = String(u);
    if (글.includes('script.google.com')) {
      window.__부른곳.push(글);
      return window.__될까 ? Promise.resolve({ type: 'opaque' })
                           : Promise.reject(new Error('막혔다'));
    }
    return 옛(u, o);                            // 변수틀 읽기 따위는 그대로 지나간다
  };
  window.__옛fetch = 옛;
});
재기('주소가 없으면 아무 데도 안 부른다', (await p.evaluate(() => window.__부른곳.length)) === 0);

const 부를곳 = 'https://script.google.com/macros/s/AKfycbTEST/exec';
await p.evaluate(async (곳) => {
  const { setDoc, doc } = window.fbFirestore;
  await setDoc(doc(null, 'a', 'p', 'd', 'boring_config', '설정'), { exec: 곳 }, { merge: true });
}, 부를곳);
await p.waitForTimeout(400);
const 막힘 = await p.evaluate(() => ({
  부른수: window.__부른곳.length,
  부른곳: window.__부른곳[0] || '',
  빈말: document.getElementById('borf-none').textContent,
  단추: document.getElementById('borf-again').textContent,
}));
재기('주소가 오면 그때 한 번 부른다', 막힘.부른수 === 1 && 막힘.부른곳 === 부를곳, 막힘.부른수 + '번');
재기('못 부르면 솔직히 적는다', 막힘.빈말 === '드라이브를 못 불렀습니다', 막힘.빈말);

// 「새로고침」 을 누르실 때만 다시 부른다
await p.tap('#borf-again');
await p.waitForTimeout(350);
재기('「새로고침」 을 누르면 다시 부른다',
     (await p.evaluate(() => window.__부른곳.length)) === 2,
     (await p.evaluate(() => window.__부른곳.length)) + '번');

await p.evaluate(() => { window.__될까 = true; });
await p.tap('#borf-again');
await p.waitForTimeout(350);
const 훑는중 = await p.evaluate(() => ({
  부른수: window.__부른곳.length,
  빈말: document.getElementById('borf-none').textContent,
  단추: document.getElementById('borf-again').textContent,
  막혔나: document.getElementById('borf-again').disabled,
}));
재기('부르고 나면 훑는 중이라 적는다', 훑는중.빈말 === '드라이브를 훑는 중입니다', 훑는중.빈말);
재기('훑는 동안에는 단추를 잠근다', 훑는중.막혔나, 훑는중.단추);
재기('「훑는 중」 을 화면에서 두 번 말하지 않나', 훑는중.단추 === '새로고침', 훑는중.단추);
await p.waitForTimeout(1200);
재기('저절로 되풀이하지 않는다',
     (await p.evaluate(() => window.__부른곳.length)) === 3,
     (await p.evaluate(() => window.__부른곳.length)) + '번');

// 앱스 스크립트가 담았다 치고 — 사장님 드라이브와 같은 꼴로 넣는다.
// path 에 폴더 길과 파일 이름이 함께 들어 있다(거실장3종/1200/…cix).
await p.evaluate(async () => {
  const { setDoc, doc } = window.fbFirestore;
  const 넣기 = (id, v) => setDoc(doc(null, 'a', 'p', 'd', 'boring_files', id), v);
  const 때 = t => Date.parse(t);
  await 넣기('f1', { name:'거실장_서랍형_1001_01.cix', path:'거실장3종/1200/거실장_서랍형_1001_01.cix',
                     driveId:'D1', size:4096, mtime:때('2026-09-28T10:00:00Z') });
  await 넣기('f2', { name:'거실장_서랍형_1001_01.bpp', path:'거실장3종/1200/거실장_서랍형_1001_01.bpp',
                     driveId:'D2', size:8192, mtime:때('2026-09-29T09:00:00Z') });
  await 넣기('f3', { name:'거실장_서랍형_1006_01.cix', path:'거실장3종/1800/거실장_서랍형_1006_01.cix',
                     driveId:'D3', size:2048, mtime:때('2026-09-27T08:00:00Z') });
  await 넣기('f4', { name:'알렉스_상판_2001_01.cix', path:'알렉스/알렉스_상판_2001_01.cix',
                     driveId:'D4', size:3300, mtime:때('2026-09-30T04:00:00Z') });
  await 넣기('f5', { name:'베이비장_1001_01.cix', path:'신규 베이비장_로엔/베이비장_1001_01.cix',
                     driveId:'D5', size:1200, mtime:때('2026-09-26T08:00:00Z') });
});
await p.waitForTimeout(400);

const 폴더칸 = () => p.evaluate(() =>
  [...document.querySelectorAll('#borf-folders [data-into]')].map(t =>
    t.querySelector('.borh-nm').textContent + '|' + t.querySelector('.borh-pct').textContent));
const 목록 = () => p.evaluate(() =>
  [...document.querySelectorAll('#borf-list .borf-row')].map(r =>
    r.querySelector('.borf-t').childNodes[0].textContent));
const 자리 = () => p.evaluate(() => ({
  보이나: document.getElementById('borf-crumb').classList.contains('on'),
  글: document.getElementById('borf-path').textContent.replace(/\s+/g, ' ').trim(),
  셈: document.getElementById('borf-sub').textContent,
}));

// ★ 맨 위 = 국내생산 바로 밑. 파일이 나온 가지만 나온다(빈 폴더 없음)
재기('맨 위에 폴더가 이름순으로 나오나',
     (await 폴더칸()).join(' ') === '거실장3종|3개 신규 베이비장_로엔|1개 알렉스|1개',
     (await 폴더칸()).join(' '));
재기('폴더 줄에 안쪽까지 합친 수를 적나', (await 폴더칸())[0] === '거실장3종|3개', (await 폴더칸())[0]);
재기('맨 위에는 파일 줄이 없다', (await 목록()).length === 0, (await 목록()).join(' '));
재기('맨 위에서는 지나온 자리를 안 보인다', !(await 자리()).보이나);
재기('머리에 밑에 든 수를 적나', (await 자리()).셈 === '5개', (await 자리()).셈);

// 폴더를 누르면 그 안으로
await p.tap('#borf-folders [data-into="거실장3종"]');
await p.waitForTimeout(300);
재기('폴더를 누르면 그 안으로 들어가나',
     (await 폴더칸()).join(' ') === '1200|2개 1800|1개', (await 폴더칸()).join(' '));
재기('지나온 자리를 적나', (await 자리()).글 === '국내생산 › 거실장3종', (await 자리()).글);

await p.tap('#borf-folders [data-into="1200"]');
await p.waitForTimeout(300);
재기('한 칸 더 들어가면 파일이 나오나',
     (await 목록()).join(' ') === '거실장_서랍형_1001_01.bpp 거실장_서랍형_1001_01.cix',
     (await 목록()).join(' '));
재기('두 칸째 지나온 자리', (await 자리()).글 === '국내생산 › 거실장3종 › 1200', (await 자리()).글);
재기('폴더가 없으면 폴더 칸을 안 보인다',
     await p.evaluate(() => document.getElementById('borf-folders').classList.contains('bhide')));
const 폴더줄높이 = await p.evaluate(() =>
  Math.min(...[...document.querySelectorAll('#borf-list .borf-row')].map(r => Math.round(r.getBoundingClientRect().height))));
재기('줄이 44px 이상', 폴더줄높이 >= 44, 폴더줄높이 + 'px');

// 알약은 지금 들어와 있는 폴더 안에서만 거른다
await p.tap('#borf-chips [data-kind="cix"]');
await p.waitForTimeout(250);
재기('이 폴더 안에서만 .cix 를 거르나',
     (await 목록()).join(' ') === '거실장_서랍형_1001_01.cix', (await 목록()).join(' '));
await p.tap('#borf-chips [data-kind="all"]');
await p.waitForTimeout(250);

// 뒤로
await p.tap('#borf-up');
await p.waitForTimeout(300);
재기('← 를 누르면 한 칸 나오나',
     (await 자리()).글 === '국내생산 › 거실장3종' && (await 폴더칸()).length === 2, (await 자리()).글);

// 찾기는 나무를 접고 전부에서 — 길을 함께 보여 준다
await p.fill('#borf-find', '1006');
await p.waitForTimeout(300);
const 찾음 = await p.evaluate(() => ({
  줄: [...document.querySelectorAll('#borf-list .borf-row')].map(r => r.querySelector('.borf-t').childNodes[0].textContent),
  길: [...document.querySelectorAll('#borf-list .borf-t i')].map(e => e.textContent),
  폴더칸: document.getElementById('borf-folders').classList.contains('bhide'),
  자리: document.getElementById('borf-crumb').classList.contains('on'),
}));
재기('찾을 때는 폴더를 넘어 전부에서 찾나', 찾음.줄.join(' ') === '거실장_서랍형_1006_01.cix', 찾음.줄.join(' '));
재기('찾은 줄에 길을 함께 보여 주나', /^거실장3종\/1800 · /.test(찾음.길[0] || ''), 찾음.길[0] || '');
재기('찾는 동안에는 나무를 접나', 찾음.폴더칸 && !찾음.자리);
await p.fill('#borf-find', '');
await p.waitForTimeout(250);

// 바닥에 뜬 「← 박스판」 이 「저장」 을 가리지 않나 — 끝까지 내려 보고 잰다
await p.evaluate(() => window.scrollTo(0, 999999));
await p.waitForTimeout(300);
const 파일안가림 = await p.evaluate(() => {
  // 이 자리에 마지막으로 놓인 것 — 폴더 타일이든 파일 줄이든
  const 것들 = [...document.querySelectorAll('#borf-folders [data-into], #borf-list .borf-row')];
  const 끝 = 것들[것들.length - 1].getBoundingClientRect();
  const 판 = document.querySelector('#bor-back button').getBoundingClientRect();
  return { 끝: Math.round(끝.bottom), 판: Math.round(판.top),
           겹침: 끝.bottom > 판.top && 끝.left < 판.right };
});
재기('파일 화면에서도 「← 박스판」 이 마지막 줄을 안 가리나', !파일안가림.겹침,
     '마지막 줄 ' + 파일안가림.끝 + ' · 단추 ' + 파일안가림.판);

// 맨 위로 나와서 파일 하나를 누른다
await p.tap('#borf-up');
await p.waitForTimeout(300);
await p.tap('#borf-folders [data-into="알렉스"]');
await p.waitForTimeout(300);

/* ── 줄을 누르면 뜯어 본다 ────────────────────────────────────────────
   사장님: 「이렇게 파일을 눌렀을때 이파일의 원본을 보는건 보는거고 분석을 해줘야지」.
   알맹이를 받아 「고르기」 와 똑같은 길에 태운다. 안 될 때는 까닭을 갈라 말한다. */
const 빈말글 = () => p.evaluate(() => document.getElementById('borf-none').textContent);

/* 안 될 때를 갈라 말하는가 — 사장님: 「이게 뭔소리야 어제는 되었던건데」(10-02).
   한마디로 뭉개지 않고 갈래마다 증거를 그대로 보여야 한다. */
await p.evaluate(() => {
  window.__보낸몸 = [];
  const 옛 = window.fetch.bind(window);
  window.fetch = (u, o) => {
    if (String(u).includes('script.google.com')) {
      if (o && o.method === 'POST') { window.__보낸몸.push(o); return window.__속답(); }
      window.__부른곳.push(String(u)); return Promise.resolve({ type: 'opaque' });
    }
    return 옛(u, o);
  };
});
const 빈말보기 = () => p.evaluate(() => ({
  말: (document.querySelector('#borf-none b') || {}).textContent || document.getElementById('borf-none').textContent,
  할일: (document.querySelector('#borf-none em') || {}).textContent || '',
  증거: (document.querySelector('#borf-none i') || {}).textContent || '',
  넘침: document.documentElement.scrollWidth,
}));

// ① 아예 못 닿았을 때
await p.evaluate(() => { window.__속답 = () => Promise.reject(new Error('못 닿음')); });
await p.tap('#borf-list .borf-row');
await p.waitForTimeout(400);
let 본것 = await 빈말보기();
재기('못 닿았으면 그렇다고 적나', 본것.말 === '그 주소에 아예 닿지 못했습니다', 본것.말);
재기('부른 주소를 그대로 보이나', /^부른 곳: https:\/\/script\.google\.com\//.test(본것.증거), 본것.증거);
재기('무엇을 하면 되는지 한 줄로 적나',
     본것.할일 === '맥에서 서류관리 앱스스크립트를 다시 배포해 주십시오', 본것.할일);

const 보낸것 = await p.evaluate(() => {
  const o = window.__보낸몸[0] || {};
  return { 방법: o.method, 머리: o.headers && o.headers['Content-Type'], 몸: o.body };
});
재기('POST · text/plain 으로 보내나', 보낸것.방법 === 'POST' && 보낸것.머리 === 'text/plain',
     보낸것.방법 + ' · ' + 보낸것.머리);
재기('몸통이 {일:보링파일, driveId} 인가',
     JSON.parse(보낸것.몸 || '{}')['일'] === '보링파일' && JSON.parse(보낸것.몸 || '{}').driveId === 'D4',
     보낸것.몸);

// ② 닿았는데 돌려보냈을 때 — 상태 번호를 적는다
await p.evaluate(() => { window.__속답 = () => Promise.resolve({ ok: false, status: 403,
  text: () => Promise.resolve('Sorry, unable to open the file at this time.') }); });
await p.tap('#borf-list .borf-row');
await p.waitForTimeout(400);
본것 = await 빈말보기();
재기('퇴짜면 상태 번호를 적나', 본것.말 === '닿았는데 돌려보냈습니다 (403)', 본것.말);
재기('돌아온 글도 그대로 보이나', /돌아온 글: Sorry, unable to open/.test(본것.증거), 본것.증거);

// ③ 답은 왔는데 자료가 아니라 웹 화면일 때 — 온 글 앞머리를 그대로
await p.evaluate(() => { window.__속답 = () => Promise.resolve({ ok: true, status: 200,
  text: () => Promise.resolve('<!DOCTYPE html><html><head><title>Google 계정으로 로그인</title>') }); });
await p.tap('#borf-list .borf-row');
await p.waitForTimeout(400);
본것 = await 빈말보기();
재기('자료가 아니면 그렇다고 적나', 본것.말 === '답이 왔는데 자료가 아니라 웹 화면이었습니다', 본것.말);
재기('온 글 앞머리를 그대로 보이나', /로그인/.test(본것.증거), 본것.증거.slice(0, 60));
재기('375px 에서 그 글이 가로로 안 넘친다', 본것.넘침 === 375, 본것.넘침 + 'px');

// ④ 볼 폴더 밖
await p.evaluate(() => { window.__속답 = () => Promise.resolve({ ok: true, status: 200,
  text: () => Promise.resolve(JSON.stringify({ ok: false, why: '밖' })) }); });
await p.tap('#borf-list .borf-row');
await p.waitForTimeout(400);
재기('볼 폴더 밖이면 그렇다고 적나', (await 빈말보기()).말 === '볼 폴더 밖의 파일입니다', (await 빈말보기()).말);

// ⑤ 그 밖의 ok:false 는 돌아온 why 를 그대로
await p.evaluate(() => { window.__속답 = () => Promise.resolve({ ok: true, status: 200,
  text: () => Promise.resolve(JSON.stringify({ ok: false, why: '파일이 없습니다' })) }); });
await p.tap('#borf-list .borf-row');
await p.waitForTimeout(400);
재기('그 밖의 까닭은 온 그대로 적나', (await 빈말보기()).말 === '파일이 없습니다', (await 빈말보기()).말);

// ④ 문이 열렸을 때 — 알맹이를 받아 「고르기」 와 똑같은 길을 탄다
const 알맹이 = fs.readFileSync(cix길).toString('base64');
await p.evaluate(b64 => { window.__속답 = () => Promise.resolve({ ok: true, status: 200,
  text: () => Promise.resolve(JSON.stringify({ ok: true, name: '592x382_1001_01.cix', b64 })) }); }, 알맹이);
await p.tap('#borf-list .borf-row');
await p.waitForTimeout(600);
const 뜯음 = await p.evaluate(() => ({
  화면: document.documentElement.getAttribute('data-borscreen'),
  집: document.documentElement.getAttribute('data-borhome'),
  이름: document.getElementById('b-pick-nm').textContent,
  동그라미: document.querySelectorAll('#b-draw circle').length,
  표줄: document.querySelectorAll('#b-read tbody tr').length,
  알약: document.getElementById('b-pills').textContent,
  드라이브단추: !document.getElementById('b-drive').classList.contains('bhide'),
}));
재기('뜯어 보면 바꾸기 화면으로 넘어가나', 뜯음.화면 === null && 뜯음.집 === null, String(뜯음.화면));
재기('파일 이름이 올라오나', 뜯음.이름 === '592x382_1001_01.cix', 뜯음.이름);
재기('고르기와 똑같이 구멍 16개를 그리나', 뜯음.동그라미 === 16, '동그라미 ' + 뜯음.동그라미);
재기('읽은 것 표도 열여섯 줄 그대로', 뜯음.표줄 === 16, '표 ' + 뜯음.표줄 + '줄');
재기('판 크기도 파일에 적힌 칸 이름 그대로',
     /LPX 592/.test(뜯음.알약) && /LPY 382/.test(뜯음.알약) && /LPZ 18/.test(뜯음.알약), 뜯음.알약.trim());
재기('「드라이브에서 열기」 가 뜨나', 뜯음.드라이브단추);

// 「드라이브에서 열기」 — 원본 보는 길도 남아 있다
const 원본 = await p.evaluate(async () => {
  let 곳 = ''; const 옛 = window.open; window.open = u => { 곳 = String(u); return null; };
  document.getElementById('b-drive').click();
  await new Promise(r => setTimeout(r, 150));
  window.open = 옛; return 곳;
});
재기('「드라이브에서 열기」 가 원본으로 보내나',
     원본 === 'https://drive.google.com/file/d/D4/view', 원본);
const 드라이브단추높이 = await p.evaluate(() =>
  Math.round(document.getElementById('b-drive').getBoundingClientRect().height));
재기('「드라이브에서 열기」 가 44px 인가', 드라이브단추높이 >= 44, 드라이브단추높이 + 'px');

// 뜯어 본 것도 되짚기를 거쳐 .bpp 가 나온다 — 고르기와 같은 길이다
let 뜯어바꾼것 = null, 뜯다탓 = '';
try { 뜯어바꾼것 = await 눌러받기('#b-go'); } catch (e) { 뜯다탓 = String(e.message || e).split('\n')[0]; }
재기('뜯어 본 것도 바꿔 내려받을 수 있나', !!뜯어바꾼것, 뜯어바꾼것 ? 뜯어바꾼것.이름 : 뜯다탓);
if (뜯어바꾼것) {
  const BG = 뜯어바꾼것.글.split('\r\n').filter(x => x.startsWith('@ BG,')).map(번호지우기);
  재기('뜯어 본 것으로 만든 bpp 도 기계가 읽은 파일과 같나',
       BG.length === 16 && 기계가읽은것.every((바른것, i) => BG[i] === 바른것),
       BG.length + '줄');
}

/* ⑤ .bpp 줄을 누르면 그 자리에서 도면이 뜬다 ─────────────────────────
   사장님: 「bpp 로 만드는게 이 프로그램의 목적이 아니고 이파일을 프로그램 내에서
   읽어들여 실제 보링의 도면을 보려고 하는거야」. cix 와 같은 길로 간다. */
await p.tap('#bor-back button');                 // 박스판으로
await p.waitForTimeout(300);
await p.tap(`[data-borb-id="${파일박스}"]`);      // 「파일」 박스로 다시
await p.waitForTimeout(400);
await p.tap('#borf-up');                          // 알렉스 → 맨 위
await p.waitForTimeout(300);
await p.tap('#borf-folders [data-into="거실장3종"]');
await p.waitForTimeout(300);
await p.tap('#borf-folders [data-into="1200"]');
await p.waitForTimeout(300);

// 본보기 cix 로 .bpp 를 만들어 그것을 알맹이로 준다 — 만드는 길 그대로 쓴다
const 만든bpp = await p.evaluate(async (cix글) => {
  const { cix읽기, bpp짓기, 변수틀읽기 } = window.보링;
  const o = cix읽기(cix글);
  return bpp짓기(o.판, o.구멍, await 변수틀읽기(), -1);
}, fs.readFileSync(cix길, 'utf-8'));
await p.evaluate(b64 => { window.__속답 = () => Promise.resolve({ ok: true, status: 200,
  text: () => Promise.resolve(JSON.stringify({ ok: true, name: '거실장_서랍형_1001_01.bpp', b64 })) }); },
  Buffer.from(만든bpp, 'latin1').toString('base64'));
await p.tap('#borf-list .borf-row[data-kind="bpp"]');
await p.waitForTimeout(700);
const bpp본것 = await p.evaluate(() => ({
  화면: document.documentElement.getAttribute('data-borscreen'),
  집: document.documentElement.getAttribute('data-borhome'),
  이름: document.getElementById('b-pick-nm').textContent,
  알약: document.getElementById('b-pills').textContent,
  동그라미: document.querySelectorAll('#b-draw circle').length,
  표: [...document.querySelectorAll('#b-read tbody tr')].map(tr =>
        [...tr.children].map(td => td.textContent).join(',')),
  만들기단추: !document.getElementById('b-go').classList.contains('bhide'),
  빨간글: document.getElementById('b-warn').classList.contains('bhide')
          ? '' : document.getElementById('b-warn').textContent,
  넘침: document.documentElement.scrollWidth,
}));
재기('.bpp 를 누르면 그 자리에서 도면이 뜨나',
     bpp본것.화면 === null && bpp본것.집 === null && bpp본것.동그라미 === 16,
     '동그라미 ' + bpp본것.동그라미);
재기('.bpp 에서 판 크기를 읽어 내나',
     /LPX 592/.test(bpp본것.알약) && /LPY 382/.test(bpp본것.알약) && /LPZ 18/.test(bpp본것.알약),
     bpp본것.알약.trim());
재기('.bpp 에서 구멍 열여섯 줄을 읽어 내나', bpp본것.표.length === 16, bpp본것.표.length + '줄');
재기('.bpp 에서는 만드는 단추를 안 보인다', !bpp본것.만들기단추);
재기('성한 .bpp 에는 빨간 글이 없다', bpp본것.빨간글 === '', bpp본것.빨간글);
const bpp해석 = await p.evaluate(() => ({
  읽은법: [...document.querySelectorAll('#b-how p')].map(e => e.textContent),
  안읽음: [...document.querySelectorAll('#b-skip tbody tr')].map(tr =>
            [...tr.children].map(td => td.textContent).join('|')),
}));
재기('.bpp 는 몇째 자리에서 읽었는지 적나',
     bpp해석.읽은법.some(t => /「:」 뒤 1~7째 자리를 차례로 SIDE·CRN·X·Y·Z·DP·DIA 로 읽었습니다/.test(t)) &&
     bpp해석.읽은법.some(t => t === '33째 자리를 ID 로 읽었습니다'),
     bpp해석.읽은법.length + '줄');
재기('.bpp 에서 안 읽은 자리를 값과 함께 다 드러내나',
     bpp해석.안읽음.length === 50 && bpp해석.안읽음[0] === '8째 자리|0' &&
     bpp해석.안읽음.some(t => t === '50째 자리|"BG"'),
     bpp해석.안읽음.length + '자리 · ' + bpp해석.안읽음.slice(0,2).join(' '));
재기('.bpp 의 Z 는 안 쓴다고 그대로 적나',
     bpp해석.읽은법.some(t => t === 'Z 는 읽었지만 표에도 도면에도 아직 안 씁니다'));
재기('375px 에서 가로로 안 넘친다', bpp본것.넘침 === 375, bpp본것.넘침 + 'px');

/* ★ cix 로 그린 도면과 bpp 로 그린 도면이 같은가 — 가장 확실한 증거 */
const 맞춰보기 = await p.evaluate(async ([cix글, bpp글]) => {
  const a = window.보링.cix읽기(cix글);
  const b = window.보링.bpp읽기(bpp글);
  const 재 = g => [g.x, g.y, g.dp, g.dia, g.side, g.crn].join(',');
  return {
    cix판: [a.판.LPX, a.판.LPY, a.판.LPZ].join('×'),
    bpp판: [b.판.LPX, b.판.LPY, b.판.LPZ].join('×'),
    cix수: a.구멍.length, bpp수: b.구멍.length,
    다른줄: a.구멍.map((g, i) => 재(g) === 재(b.구멍[i] || {}) ? null
              : (i+1) + '째 ' + 재(g) + ' ≠ ' + 재(b.구멍[i] || {})).filter(Boolean),
    cix첫줄: 재(a.구멍[0]), bpp첫줄: 재(b.구멍[0]),
  };
}, [fs.readFileSync(cix길, 'utf-8'), 만든bpp]);
재기('cix 와 bpp 의 판 크기가 같나', 맞춰보기.cix판 === 맞춰보기.bpp판,
     맞춰보기.cix판 + ' · ' + 맞춰보기.bpp판);
재기('cix 와 bpp 의 구멍 수가 같나', 맞춰보기.cix수 === 16 && 맞춰보기.bpp수 === 16,
     맞춰보기.cix수 + ' · ' + 맞춰보기.bpp수);
재기('열여섯 줄의 X·Y·DP·DIA·SIDE·CRN 이 다 같나', 맞춰보기.다른줄.length === 0,
     맞춰보기.다른줄.length ? 맞춰보기.다른줄.slice(0,3).join(' / ') : '첫 줄 ' + 맞춰보기.cix첫줄);

/* 꼴이 다른 .bpp 도 안 터지고 읽은 것까지 보인다 */
const 험한것 = await p.evaluate(() => {
  const 읽 = window.보링.bpp읽기;
  const 한줄 = '@ BG, "", "", 1, "", 0 : 0, "1", 19, 70, 0, 12, 5, 0, 1, 0, 288';
  return {
    빈것:   (() => { const r = 읽('[VARIABLES]\r\nPAN=LPX|592||4|\r\n');
                     return { 구멍: r.구멍.length, LPX: r.판.LPX }; })(),
    판없음: (() => { const r = 읽('[PROGRAM]\r\n' + 한줄 + '\r\n');
                     return { 구멍: r.구멍.length, LPX: r.판.LPX, x: r.구멍[0] && r.구멍[0].x }; })(),
    깨진줄: (() => { const r = 읽('PAN=LPX|592||4|\r\n@ BG, "", "", 1, "", 0\r\n' + 한줄 + '\r\n');
                     return { 구멍: r.구멍.length, 못읽은: r.못읽은줄.length,
                              날것: r.못읽은줄[0] && r.못읽은줄[0].날것 }; })(),
    LF만:   (() => { const r = 읽('PAN=LPX|592||4|\n' + 한줄 + '\n');
                     return { 구멍: r.구멍.length, LPX: r.판.LPX }; })(),
  };
});
재기('구멍이 없는 .bpp 도 안 터지고 판만 보인다',
     험한것.빈것.구멍 === 0 && 험한것.빈것.LPX === '592', JSON.stringify(험한것.빈것));
재기('판 크기가 없는 .bpp 도 구멍만 보인다',
     험한것.판없음.구멍 === 1 && 험한것.판없음.LPX === null && 험한것.판없음.x === '19',
     JSON.stringify(험한것.판없음));
재기('줄 하나가 깨져도 나머지는 다 읽는다',
     험한것.깨진줄.구멍 === 1 && 험한것.깨진줄.못읽은 === 1, JSON.stringify(험한것.깨진줄));
재기('못 읽은 줄을 그대로 들고 있나', /^@ BG, "", "", 1, "", 0$/.test(험한것.깨진줄.날것 || ''),
     험한것.깨진줄.날것);
재기('줄 끝이 LF 뿐이어도 읽는다',
     험한것.LF만.구멍 === 1 && 험한것.LF만.LPX === '592', JSON.stringify(험한것.LF만));

/* 되짚기의 어긋남 잡기가 전과 똑같이 도는가 — 갈래마다 잰다 */
const 되짚음 = await p.evaluate(async () => {
  const { bpp짓기, 되짚기, 변수틀읽기 } = window.보링;
  const 판 = { LPX:'592', LPY:'382', LPZ:'18' };
  const 차례 = [{ id:'1', side:'0', crn:'1', x:'19', y:'70', dia:'5', dp:'12' }];
  const 변수 = await 변수틀읽기();
  const 성한것 = bpp짓기(판, 차례, 변수, -1);
  const 재 = 글 => 되짚기(글, 차례, 판);
  return {
    성한것: 재(성한것),
    X바꿈: 재(성한것.replace(' : 0, "1", 19, 70,', ' : 0, "1", 20, 70,')),
    판바꿈: 재(성한것.replace('PAN=LPX|592||4|', 'PAN=LPX|591||4|')),
    판없앰: 재(성한것.replace('PAN=LPZ|18||4|\r\n', '')),
    줄늘림: 재(성한것.replace('[PROGRAM]\r\n\r\n', '[PROGRAM]\r\n\r\n@ BG, "", "", 9, "", 0 : 0, "1", 1, 1, 0, 1, 1\r\n')),
    꼴틀림: 재(성한것.replace(/^@ BG.*$/m, '@ BG, "", "", 1, "", 0')),
    Z바꿈:  재(성한것.replace(' : 0, "1", 19, 70, 0, 12,', ' : 0, "1", 19, 70, 1, 12,')),
    머리늘림: 재(성한것.replace('@ BG, "", "", 1, "", 0 : ', '@ BG, "", "", 1, "", 0, 0 : ')),
  };
});
재기('되짚기 — 성한 것은 어긋남 0', 되짚음.성한것.length === 0, 되짚음.성한것.join(' / '));
재기('되짚기 — X 한 자', 되짚음.X바꿈.join('|') === '1째 구멍 X 20 ≠ 19', 되짚음.X바꿈.join(' / '));
재기('되짚기 — 판 크기', 되짚음.판바꿈.join('|') === 'LPX 591 ≠ 592', 되짚음.판바꿈.join(' / '));
재기('되짚기 — 판 크기 줄이 없을 때', 되짚음.판없앰.join('|') === 'LPZ 없음 ≠ 18', 되짚음.판없앰.join(' / '));
재기('되짚기 — 구멍 수가 다르면 그것만 말하고 멈춘다',
     되짚음.줄늘림.join('|') === '구멍 수 2 ≠ 1', 되짚음.줄늘림.join(' / '));
재기('되짚기 — 줄 꼴이 틀렸을 때', 되짚음.꼴틀림.join('|') === '1째 줄 꼴이 틀렸다', 되짚음.꼴틀림.join(' / '));
재기('되짚기 — Z 가 0 이 아닐 때', /1째 구멍 Z 1 ≠ 0/.test(되짚음.Z바꿈.join('|')), 되짚음.Z바꿈.join(' / '));
재기('되짚기 — 머리 칸이 다를 때', /1째 줄 머리 칸이 7개/.test(되짚음.머리늘림.join('|')),
     되짚음.머리늘림.join(' / '));

// 치우고 박스 판으로 — fetch 도 원래대로 돌려 놓는다
await p.evaluate(async () => {
  const { deleteDoc, doc } = window.fbFirestore;
  for (const id of [...window.__곳간.boring_files.keys()])
    await deleteDoc(doc(null, 'a', 'p', 'd', 'boring_files', id));
  if (window.__옛fetch) window.fetch = window.__옛fetch;
});
await p.tap('#bor-back button');
await p.waitForTimeout(300);
재기('파일 화면에서도 「← 박스판」 으로 돌아오나',
     await p.evaluate(() => document.documentElement.getAttribute('data-borhome') === '1'));

// 시험이 만든 박스는 치우고 간다 — 뒤 시험이 깨끗한 자리에서 돌게
await p.evaluate(async () => {
  const { deleteDoc, doc } = window.fbFirestore;
  for (const id of [...window.__칸.keys()])
    await deleteDoc(doc(null, 'a', 'p', 'd', 'boring_boxes', id));
});
await p.waitForTimeout(250);
재기('시험이 만든 박스를 다 치웠나',
     await p.evaluate(() => window.__칸.size === 0 &&
                            document.querySelectorAll('#borh-mine [data-borb-id]').length === 0));

// 일하는 박스를 눌러 바꾸기 화면으로 — 여기서부터는 앞과 똑같다
await p.tap('#bor-home .borh-tile');
await p.waitForTimeout(300);
재기('일하는 박스를 누르면 바꾸기 화면이 나오나',
     await p.evaluate(() => document.documentElement.getAttribute('data-borhome') === null &&
                            getComputedStyle(document.getElementById('bor-app')).display !== 'none'));

/* ── 1. .cix 를 고른다 ─────────────────────────────────────────────── */
/* 파일은 이름과 속으로 건넨다 — 이 플레이라이트는 한글이 든 길로는 파일을 못 붙인다
   (붙는 척하고 change 가 안 온다). 앱 쪽 일이 아니라 시험 쪽 일이다. */
await p.setInputFiles('#b-file', {
  name: path.basename(cix길), mimeType: 'text/plain', buffer: fs.readFileSync(cix길),
});
await p.waitForTimeout(300);

const 읽음 = await p.evaluate(() => ({
  알약: document.getElementById('b-pills').textContent,
  동그라미: document.querySelectorAll('#b-draw circle').length,
  빨간글: document.getElementById('b-warn').classList.contains('bhide')
          ? '' : document.getElementById('b-warn').textContent,
  표: [...document.querySelectorAll('#b-read tbody tr')].map(tr =>
        [...tr.children].map(td => td.textContent).join(',')),
  칸이름: [...document.querySelectorAll('#b-read thead th')].map(th => th.textContent).join(' '),
  버린것: document.getElementById('b-drop').textContent,
}));
재기('구멍 16개를 걷었나', 읽음.동그라미 === 16, '동그라미 ' + 읽음.동그라미);
재기('구멍 수를 적나', /구멍 16/.test(읽음.알약), 읽음.알약.trim());
재기('빨간 글이 안 뜬다 (성한 파일이다)', 읽음.빨간글 === '', 읽음.빨간글);

/* ★ 사장님: 「이딴 내가 알 수도없는 용어를 사용해서 뭔가 만들지마 … 지금 주어진 파일을
   어떻게 읽고 있는지를 나에게 보여주면 되는거야」. 읽은 것을 글자 그대로 보인다. */
재기('판 크기를 파일에 적힌 칸 이름 그대로 보이나',
     /LPX 592/.test(읽음.알약) && /LPY 382/.test(읽음.알약) && /LPZ 18/.test(읽음.알약), 읽음.알약.trim());
재기('표 칸 이름이 파일 글자 그대로인가 (SIDE·CRN 을 옮기지 않았나)',
     읽음.칸이름 === '번호 X Y 지름 깊이 SIDE CRN ID', 읽음.칸이름);
재기('구멍 열여섯 줄이 다 나오나', 읽음.표.length === 16, 읽음.표.length + '줄');
재기('표 값이 cix 에 적힌 글자 그대로인가',
     읽음.표.every((줄, i) => {
       const [x, y, dia, dp] = 바라던것[i];
       return 줄 === `${i+1},${x},${y},${dia},${dp},0,1,${i+1}`;
     }), 읽음.표[0] + ' … ' + 읽음.표[15]);
/* ★ 사장님: 「파일을 일단 니가 어떻게 해석하고 있는지를 보여줘야 내가 틀린점을
   이야기하며 프로그램을 만들어 갈거 아니야」(10-02). 짐작을 글로 드러낸다. */
const 해석 = await p.evaluate(() => ({
  읽은법: [...document.querySelectorAll('#b-how p')].map(e => e.textContent),
  안쓴다표시: [...document.querySelectorAll('#b-how p.bhow-no')].map(e => e.textContent),
  제목: (document.getElementById('b-how-head') || {}).textContent || '',
  안읽음제목: (document.getElementById('b-skip-head') || {}).textContent || '',
  안읽음: [...document.querySelectorAll('#b-skip tbody tr')].map(tr =>
            [...tr.children].map(td => td.textContent).join('|')),
  안읽음칸: [...document.querySelectorAll('#b-skip thead th')].map(th => th.textContent).join(' '),
}));
재기('「이렇게 읽었습니다」 를 적나', 해석.제목 === '이렇게 읽었습니다', 해석.제목);
재기('X 를 어디서 잰 것으로 읽었는지 적나',
     해석.읽은법.some(t => t === 'X 는 왼쪽 끝에서 잰 것으로 읽었습니다'), 해석.읽은법.length + '줄');
재기('Y 가 어느 쪽으로 자라는지 적나',
     해석.읽은법.some(t => /Y 는 위에서 아래로 자라는 것으로 읽었습니다 — Y 0 이 판 위쪽입니다/.test(t)));
재기('cix 는 어느 자리에서 읽었는지 적나',
     해석.읽은법.some(t => t === 'BEGIN MACRO 의 NAME=BG 만 구멍으로 읽었습니다') &&
     해석.읽은법.some(t => /BEGIN MAINDATA 의 LPX · LPY · LPZ/.test(t)));
재기('안 쓰는 값을 「안 씁니다」 라고 그대로 적나',
     ['LPZ','깊이','SIDE','CRN','ID'].every(k => 해석.안쓴다표시.some(t => t.startsWith(k))),
     해석.안쓴다표시.length + '줄');
재기('「안 읽은 자리」 를 적나', 해석.안읽음제목 === '안 읽은 자리', 해석.안읽음제목);
재기('안 읽은 자리 칸이 「자리 · 적혀 있던 값」 인가', 해석.안읽음칸 === '자리 적혀 있던 값', 해석.안읽음칸);
재기('cix 에서 안 읽은 칸을 값과 함께 다 드러내나',
     해석.안읽음.join(' ') === 'THR|NO RTY|0 DUPLIN|0', 해석.안읽음.join(' '));

재기('버린 것을 한 줄로 적나',
     /GEOTEXT 1 버림/.test(읽음.버린것) && /VBLINE 2줄 버림/.test(읽음.버린것), 읽음.버린것);

// 사장님이 모르시는 낱말은 화면에 한 군데도 없어야 한다
const 낱말 = await p.evaluate(() => {
  const 글 = document.getElementById('bor-app').innerText || '';
  return { 집게: (글.match(/집게/g) || []).length, WAIT: (글.match(/WAIT/g) || []).length, 글: 글.slice(0, 0) };
});
재기('화면에 「집게」 가 0번', 낱말.집게 === 0, 낱말.집게 + '번');
재기('화면에 「WAIT」 가 0번', 낱말.WAIT === 0, 낱말.WAIT + '번');

/* ── 2. 누르는 자리 크기 (단추 44 · 입력칸 34) ───────────────────────── */
const 크기 = await p.evaluate(() => {
  const 재 = s => [...document.querySelectorAll(s)].filter(e => e.offsetParent)
      .map(e => Math.round(e.getBoundingClientRect().height));
  return { 단추: 재('.bbtn, .btile, .borf-again') };
});
재기('단추가 다 44px 이상', 크기.단추.length >= 2 && 크기.단추.every(h => h >= 44), 크기.단추.join('·'));

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
재기('짚은 것이 그 단추인가', /기계에 넣을 파일 만들기/.test(짚은것), 짚은것.trim());
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
  [ { crn:'1,4', x:'374-32', y:'50',    dia:'15', dp:'14' },
    { crn:'1',   x:'400+50', y:'30-25', dia:'5',  dp:'10' },
    { crn:'1',   x:'34',     y:'50',    dia:'15', dp:'14' } ]));

const 식본것 = await p.evaluate(() => ({
  동그라미: document.querySelectorAll('#b-draw circle').length,
  알약: document.getElementById('b-pills').textContent,
  표: [...document.querySelectorAll('#b-read tbody tr')].map(tr =>
        [...tr.children].map(td => td.textContent).join(',')),
}));
재기('식으로 적힌 판 크기를 재서 그렸나', 식본것.동그라미 === 3, '동그라미 ' + 식본것.동그라미);
재기('판 크기는 계산하지 않고 적힌 그대로 보이나',
     /LPX 700\+48/.test(식본것.알약) && /LPY 380\+0\.5/.test(식본것.알약), 식본것.알약.trim());
재기('표에도 식이 계산되지 않고 그대로 나오나',
     식본것.표[0] === '1,374-32,50,15,14,0,1,4' || /374-32/.test(식본것.표[0] || ''), 식본것.표[0]);
재기('쉼표 든 CRN 이 표에 그대로 나오나', /,1,4,/.test(식본것.표[0] || '') || 식본것.표[0].includes('1,4'),
     식본것.표[0]);

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

/* ── 8. 못 재는 값은 그림에만 못 그린다 — 값은 그대로 나간다 ─────────── */
await 먹이기('못재.cix', cix짓기(
  { LPX:'592', LPY:'382', LPZ:'18' },
  [ { crn:'1', x:'98',    y:'10', dia:'5', dp:'12' },
    { crn:'1', x:'100*2', y:'10', dia:'5', dp:'12' } ]));      // 곱하기는 못 잰다
const 못잰것 = await p.evaluate(() => ({
  버린것: document.getElementById('b-drop').textContent,
  바꾸기: document.getElementById('b-go').disabled ? '막힘' : '열림',
  동그라미: document.querySelectorAll('#b-draw circle').length,
  표: [...document.querySelectorAll('#b-read tbody tr')].map(tr =>
        [...tr.children].map(td => td.textContent).join(',')),
}));
재기('못 그린 구멍 수를 한 줄로 적나', /그림에 못 그린 구멍 1/.test(못잰것.버린것), 못잰것.버린것);
재기('못 재는 구멍은 그리지 않는다', 못잰것.동그라미 === 1, '동그라미 ' + 못잰것.동그라미);
재기('그래도 표에는 글자 그대로 나온다', /100\*2/.test(못잰것.표.join('|')), 못잰것.표.join(' '));
재기('바꾸기는 열어 둔다 (값은 그대로 옮긴다)', 못잰것.바꾸기 === '열림', 못잰것.바꾸기);
let 못잰내림 = null; 탓 = '';
try { 못잰내림 = await 눌러받기('#b-go'); } catch (e) { 탓 = String(e.message || e).split('\n')[0]; }
재기('못 재는 값도 글자 그대로 나가나',
     !!못잰내림 && 못잰내림.글.includes(', 100*2, 10, 0, 12, 5, '), 못잰내림 ? '나갔다' : 탓);

/* ── 9. 못 읽는 것 — 꾸짖지 말고 그 속의 값을 펴 보인다 ────────────────
   사장님: 「이런슬데없는 소리는 왜 적어 놓는거야 내가 이걸 알아듣는다고 생각하는거야?」
   (짚으신 자리: 「CUT_G — 모르는 매크로다…」). 실제 파일에 CUT_G 가 들어 있다.
   무엇인지 우리는 모른다 — 지어내지 말고 적혀 있던 것을 다 보여 드린다. */
await 먹이기('못읽음.cix', Buffer.from(
  ['BEGIN ID CID3','\tREL= 5.0','END ID',
   'BEGIN MAINDATA','\tLPX=592','\tLPY=382','\tLPZ=18','END MAINDATA',
   'BEGIN MACRO','\tNAME=BG','\tPARAM,NAME=ID,VALUE="1"','\tPARAM,NAME=SIDE,VALUE=0',
   '\tPARAM,NAME=CRN,VALUE="1"','\tPARAM,NAME=X,VALUE=19','\tPARAM,NAME=Y,VALUE=70',
   '\tPARAM,NAME=DIA,VALUE=5','\tPARAM,NAME=DP,VALUE=12','END MACRO',
   'BEGIN MACRO','\tNAME=CUT_G','\tPARAM,NAME=ID,VALUE="2"','\tPARAM,NAME=SIDE,VALUE=0',
   '\tPARAM,NAME=X,VALUE=100','\tPARAM,NAME=Y,VALUE=50','\tPARAM,NAME=DP,VALUE=6',
   '\tPARAM,NAME=WID,VALUE=9','\tPARAM,NAME=AZ,VALUE=0','END MACRO',
   'BEGIN MACRO','\tNAME=BH','\tPARAM,NAME=SIDE,VALUE=1','\tPARAM,NAME=X,VALUE=50','END MACRO',
  ].join('\r\n') + '\r\n', 'utf-8'));

const 못읽음 = await p.evaluate(() => ({
  곁한줄: document.getElementById('b-warn').classList.contains('bhide')
          ? '' : document.getElementById('b-warn').textContent,
  제목: document.getElementById('b-unk-head').classList.contains('bhide')
        ? '' : document.getElementById('b-unk-head').textContent,
  칸이름: [...document.querySelectorAll('#b-unk thead th')].map(th => th.textContent).join(' '),
  줄: [...document.querySelectorAll('#b-unk tbody tr')].map(tr =>
        [...tr.children].map(td => td.textContent)),
  바꾸기: document.getElementById('b-go').disabled ? '막힘' : '열림',
  단추곁: document.getElementById('b-go-note').classList.contains('bhide')
          ? '' : document.getElementById('b-go-note').textContent,
  구멍표: document.querySelectorAll('#b-read tbody tr').length,
}));
재기('못 읽는 것 수를 곁에 한 줄로 적나',
     못읽음.곁한줄 === '아직 못 읽는 것 2개 — 이대로 바꾸면 빠집니다', 못읽음.곁한줄);
재기('표 제목이 「못 읽은 것」 인가', 못읽음.제목 === '못 읽은 것', 못읽음.제목);
재기('표 칸이 「이름 · 적혀 있던 값」 인가', 못읽음.칸이름 === '이름 적혀 있던 값', 못읽음.칸이름);
재기('이름을 파일 글자 그대로 적나',
     못읽음.줄.map(r => r[0]).join(' ') === 'CUT_G BH', 못읽음.줄.map(r => r[0]).join(' '));
재기('CUT_G 속 값을 하나도 안 빼고 다 적나',
     못읽음.줄[0] && 못읽음.줄[0][1] === 'ID=2 · SIDE=0 · X=100 · Y=50 · DP=6 · WID=9 · AZ=0',
     못읽음.줄[0] ? 못읽음.줄[0][1] : '');
재기('BH 속 값도 다 적나', 못읽음.줄[1] && 못읽음.줄[1][1] === 'SIDE=1 · X=50',
     못읽음.줄[1] ? 못읽음.줄[1][1] : '');
재기('파일 만들기를 막나', 못읽음.바꾸기 === '막힘', 못읽음.바꾸기);

// ① 단추 이름이 무엇을 하는지로 적혀 있나
재기('단추 이름이 「기계에 넣을 파일 만들기 (.bpp)」 인가',
     (await p.evaluate(() => document.getElementById('b-go').textContent)) === '기계에 넣을 파일 만들기 (.bpp)',
     await p.evaluate(() => document.getElementById('b-go').textContent));
재기('단추 곁에 「못 읽는 것이 있어 막았습니다」', 못읽음.단추곁 === '못 읽는 것이 있어 막았습니다',
     못읽음.단추곁);
재기('읽은 구멍은 그대로 표에 나오나', 못읽음.구멍표 === 1, 못읽음.구멍표 + '줄');

// 사장님이 모르시는 낱말이 화면에 한 군데도 없어야 한다
const 안쓰는말 = await p.evaluate(() => {
  const 글 = document.getElementById('bor-app').innerText || '';
  const 세기 = w => (글.match(new RegExp(w, 'g')) || []).length;
  return { 매크로: 세기('매크로'), 파라미터: 세기('파라미터'), 변수: 세기('변수'), 블록: 세기('블록') };
});
재기('화면에 「매크로」 가 0번', 안쓰는말.매크로 === 0, 안쓰는말.매크로 + '번');
재기('화면에 「파라미터」 가 0번', 안쓰는말.파라미터 === 0, 안쓰는말.파라미터 + '번');
재기('화면에 「변수」 가 0번', 안쓰는말.변수 === 0, 안쓰는말.변수 + '번');
재기('화면에 「블록」 이 0번', 안쓰는말.블록 === 0, 안쓰는말.블록 + '번');

/* 「창고」 도 우리 낱말이다. 화면에 뜨는 글에 한 군데도 없어야 한다 —
   박스 판에서 알림창으로 뜨던 것까지 센다. */
const 창고세기 = await p.evaluate(() => {
  const 것들 = [];
  // 화면에 지금 떠 있는 글
  것들.push(document.body.innerText || '');
  // 박스를 담다 실패했을 때 뜨는 알림창 — 창고가 안 붙은 채로 눌러 본다
  const 옛db = window.db; window.db = null;
  const 옛집 = document.documentElement.getAttribute('data-borhome');   // 보던 자리를 되돌려 놓는다
  let 알림 = ''; const 옛alert = window.alert; window.alert = m => { 알림 = String(m); };
  document.documentElement.setAttribute('data-borhome', '1');
  const 새박스 = document.querySelector('.borh-newbox');
  if (새박스) 새박스.click();
  const 담기 = document.getElementById('borb-save');
  if (담기) 담기.click();
  window.alert = 옛alert; window.db = 옛db;
  if (typeof window.borBoxClose === 'function') window.borBoxClose();
  if (옛집 === null) document.documentElement.removeAttribute('data-borhome');
  else document.documentElement.setAttribute('data-borhome', 옛집);
  것들.push(알림);
  return { 수: (것들.join('\n').match(/창고/g) || []).length, 알림 };
});
재기('화면에 「창고」 가 0번', 창고세기.수 === 0, 창고세기.수 + '번');
재기('박스를 못 담았을 때 「담지 못했습니다」 라고 적나',
     창고세기.알림 === '담지 못했습니다. 잠시 뒤 다시 해 주십시오.', 창고세기.알림);

/* ── 10. 기계가 읽어 준 그 파일과 견주기 ─────────────────────────────
   이 프로그램의 기둥이다. 어떤 일이 있어도 지우지 마라. */
if (나온것) {
  const 우리것 = 나온것.글.split('\r\n').filter(x => x.startsWith('@ BG,')).map(번호지우기);
  const 다른줄 = 기계가읽은것
      .map((바른것, i) => 우리것[i] === 바른것 ? null : (i + 1) + '째')
      .filter(Boolean);
  재기('기계가 읽은 파일의 BG 열여섯 줄과 글자 그대로 같나',
       우리것.length === 16 && 다른줄.length === 0,
       다른줄.length ? 다른줄.join(' · ') + ' 이 다르다' : '16줄 다 같다');
  재기('맨 끝에 빈 줄이 하나 있나', /\[SUBPROGS\]\r\n\r\n$/.test(나온것.글),
       JSON.stringify(나온것.글.slice(-14)));
  // 마지막 줄과 [VBSCRIPT] 사이는 빈 줄 둘이다. 한 줄이면 기계가 읽은 파일과 다르다.
  const 빈줄세기 = 글 => {
    const 줄 = 글.split('\r\n'), i = 줄.indexOf('[VBSCRIPT]');
    if (i < 0) return '[VBSCRIPT] 가 없다';
    let n = 0;
    while (i - 1 - n >= 0 && 줄[i - 1 - n] === '') n++;
    return n + '줄 (앞은 ' + JSON.stringify((줄[i - 1 - n] || '').slice(0, 24)) + ')';
  };
  재기('마지막 줄과 [VBSCRIPT] 사이에 빈 줄이 둘', /^2줄 \(앞은 "@ BG, /.test(빈줄세기(나온것.글)),
       빈줄세기(나온것.글));
}

/* ── 11. 「← 박스판」 으로 돌아오나 ─────────────────────────────────── */
const 돌아가기 = await p.evaluate(() => {
  const b = document.querySelector('#bor-back button');
  return b ? Math.round(b.getBoundingClientRect().height) : 0;
});
재기('「← 박스판」 단추가 44px 인가', 돌아가기 >= 44, 돌아가기 + 'px');
// 바닥에 뜬 「← 박스판」 이 「바꾸기」 를 가리지 않나 — 끝까지 내려 보고 잰다
await p.evaluate(() => window.scrollTo(0, 999999));
await p.waitForTimeout(300);
const 안가림 = await p.evaluate(() => {
  const 끝 = document.getElementById('b-go').getBoundingClientRect();
  const 판 = document.querySelector('#bor-back button').getBoundingClientRect();
  return { 끝: Math.round(끝.bottom), 판: Math.round(판.top),
           겹침: 끝.bottom > 판.top && 끝.left < 판.right };
});
재기('「← 박스판」 이 「바꾸기」 를 안 가리나', !안가림.겹침,
     '바꾸기 ' + 안가림.끝 + ' · 단추 ' + 안가림.판);
await p.tap('#bor-back button');
await p.waitForTimeout(300);
재기('「← 박스판」 을 누르면 박스 판으로 돌아오나',
     await p.evaluate(() => document.documentElement.getAttribute('data-borhome') === '1'));

await b.close();
fs.rmSync(내린칸, { recursive: true, force: true });

/* ── 적기 ──────────────────────────────────────────────────────────── */
const 실패 = 잰것.filter(t => !t.됐나);
console.log(`\n${잰것.length - 실패.length}/${잰것.length} 통과`);
process.exit(실패.length ? 1 : 0);
