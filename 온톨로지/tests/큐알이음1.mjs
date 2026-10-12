/* 큐알길이 **두 가지 orderCode 를 다 받는지** 잰다. 진짜 shared/큐알길.js 를 부른다.
   (추측이 아니다 — 모듈을 실어 regex 를 돌린 값이다.)

   왜 이 시험이 있나 — `confirmed_orders` 에 발주를 담는 집이 **둘**인데
   orderCode 를 **다른 꼴**로 짓는다:
     조혼가구     `거래처-날짜8-차례`      예 `조혼-20261012-3`   (조혼가구.html:4564)
     이카운트등록  `WO-{batchId 뒤 6자리}`  예 `WO-123456`        (이카운트등록.html:644)
   그런데 납기 큐알 꼴은 `^[^\s]+-\d{8}-\d+-[A-Z]$` 하나다(큐알길.js:15 의 보기).
   8자리 날짜를 바라므로 **WO- 꼴은 못 받는다.** 그러면 이카운트등록이 담은 발주는
   납기명세서 큐알이 끝내 안 열린다.

   ⚠ 이 시험은 **고치라는 것이 아니다.** 지금 어긋나 있음을 못 박아, 이을 때
     어느 쪽을 맞출지 정하고 나면 이 시험이 그 자리를 지킨다.
     (규칙표는 화베에 있고 이 판에서 산 화베를 못 읽는다. 그래서 꼴은
      큐알길.js 주석에 적힌 **보기 그대로** 쓴다 — 산 규칙표의 꼴은 못 쟀다.)

   돌리기:  node 온톨로지/tests/큐알이음1.mjs
*/
import assert from 'node:assert';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const 큐알길 = require('../../shared/큐알길.js');

/* 큐알길.js:15 에 적힌 **보기 그대로**의 꼴. 산 규칙표의 꼴은 이 판에서 못 쟀다. */
const 납기꼴 = String.raw`^[^\s]+-\d{8}-\d+-[A-Z]$`;
const 규칙들 = [{
  꼴: 납기꼴,
  이름: '납기 명세서',
  갈곳: 'https://vivivic-cloud.github.io/vivivic-apps/에이엠티/에이엠티.html?명세={전체}',
  차례: 10,
}];

test('큐알길 모듈이 실린다', () => {
  assert.equal(typeof 큐알길.풀기, 'function');
  assert.ok(Array.isArray(큐알길.자리), '규칙표가 사는 자리가 있다');
  assert.equal(큐알길.자리.at(-1), '큐알규칙');
});

test('조혼가구 꼴 orderCode + 파레트 → 길이 열린다', () => {
  /* orderCode = `거래처-날짜8-차례` · 큐알 = orderCode + '-' + 파레트글자 */
  for (const 글 of ['조혼-20261012-3-A', '아인-20260101-12-D', 'ING-20261231-1-B']) {
    const 길 = 큐알길.풀기(글, 규칙들);
    assert.equal(길.length, 1, `${글} 의 길이 ${길.length} 개다`);
    assert.equal(길[0].이름, '납기 명세서');
    assert.ok(길[0].주소.includes(encodeURIComponent(글)),
              '찍힌 글이 주소에 그대로 실린다');
  }
});

test('⚠ 이카운트등록 꼴(WO-) orderCode 는 길이 하나도 안 열린다', () => {
  /* 이것이 지금 **못 이어진 자리**다. 날짜 8자리가 없어서 꼴에 안 걸린다. */
  for (const 글 of ['WO-123456-A', 'WO-123456-D', 'WO-987654-B']) {
    const 길 = 큐알길.풀기(글, 규칙들);
    assert.equal(길.length, 0,
      `${글} 에 길이 열렸다 — 꼴이 바뀌었으면 이 시험을 고쳐라`);
  }
});

test('파레트 글자가 없으면 길이 안 열린다 — 글자는 꼴의 한 칸이다', () => {
  assert.equal(큐알길.풀기('조혼-20261012-3', 규칙들).length, 0);
});

test('파레트 글자만으로는 어느 발주인지 모른다 — 발주마다 A 가 따로다', () => {
  /* 에이엠티.html:9661 「파레트 글자(A·B·C·D)는 발주마다 따로 붙는다」.
     큐알 두 장이 글자는 같고 발주가 다르면 **다른 자리로 가야 한다.** */
  const 가 = 큐알길.풀기('조혼-20261012-3-A', 규칙들)[0];
  const 나 = 큐알길.풀기('조혼-20261012-4-A', 규칙들)[0];
  assert.notEqual(가.주소, 나.주소,
    '발주가 다른데 같은 자리로 간다 — 글자만 보고 추리면 남의 발주가 끌려온다');
});

test('주소가 아닌 글은 조용히 사라지지 않는다 — 빈 목록을 돌려준다', () => {
  /* 큐알길.js 주석: 「조용히 아무 일도 안 하는 것이 제일 나쁘다」.
     빈 목록이면 부르는 쪽이 찍힌 글을 그대로 보여 드려야 한다. */
  const 길 = 큐알길.풀기('그냥아무글자', 규칙들);
  assert.ok(Array.isArray(길) && 길.length === 0);
});

test('큐알이 그 자체로 주소면 규칙표에 없어도 열린다 (바깥 큐알)', () => {
  const 길 = 큐알길.풀기('https://example.com/a', []);
  assert.equal(길.length, 1);
  assert.equal(길[0].이름, '그 주소 열기');
});

test('javascript: 는 안 연다 — 규칙표는 자료다', () => {
  /* 큐알길.js 의 막이. 찍는 것만으로 코드가 돌면 안 된다. */
  assert.equal(큐알길.풀기('javascript:alert(1)', []).length, 0);
  const 길 = 큐알길.풀기('조혼-20261012-3-A', [{
    꼴: 납기꼴, 이름: '나쁜 길', 갈곳: 'javascript:alert(1)',
  }]);
  assert.equal(길.length, 0, 'javascript: 틀이 열렸다 — 막이가 뚫렸다');
});
