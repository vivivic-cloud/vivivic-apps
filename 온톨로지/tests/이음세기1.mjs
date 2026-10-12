/* 이음세기.py 가 **이어진 짝을 맞게 세는지** 잰다.
   고침이 없으면 빨개지는지 먼저 확인하고 붙였다 (2026-10-12).

   왜 이 시험이 있나 — 이음을 세면서 세 가지를 잘못 쟀다.
     1) 칸세기가 **이카운트등록을 통째로 놓쳤다.** 그 집만 옛 꼴(compat·v8)
        `db.collection('public').doc('data').collection(…)` 을 쓴다. 모듈 꼴만
        잡다가 놓쳤는데, 그 집은 `confirmed_orders` 를 **읽고 쓴다** —
        한 집을 놓치면 이음 짝이 통째로 사라진다 (8쌍 → 10쌍).
     2) `(apps뿌리)(5)` 를 `(` 로 쪼개 **빈 프로그램 이름**이 나왔다.
     3) 주석에 모듈 이름만 적힌 것을 이음으로 세어 「작업대 ↔ 조혼가구」 가
        가짜로 떴다 (viggle/tools/관리자/큐알규칙넣기.py).

   돌리기:  node 온톨로지/tests/이음세기1.mjs
*/
import assert from 'node:assert';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';

const 뿌리 = new URL('../..', import.meta.url).pathname.replace(/\/$/, '');

function 재다(...더) {
  return execFileSync('python3',
    ['-I', `${뿌리}/온톨로지/tools/이음세기.py`, ...더],
    { encoding: 'utf-8', maxBuffer: 1 << 24 });
}

const 글 = 재다();
const 짝들 = [...글.matchAll(/^ {2}(\S+) ↔ (\S+)\s+(.+)$/gm)]
  .map((m) => ({ 가: m[1], 나: m[2], 무엇: m[3].trim() }));

test('짝을 센다 — 아무것도 못 세면 그물이 끊긴 것이다', () => {
  assert.ok(짝들.length >= 10, `이어진 짝이 ${짝들.length} 쌍뿐이다`);
  assert.match(글, /프로그램 \d+ 가지 · 이어진 짝 \d+ 쌍/);
});

test('빈 프로그램 이름이 없다', () => {
  /* `(apps뿌리)(5)` 를 `(` 로 쪼개면 빈 이름이 나온다. */
  for (const 짝 of 짝들) {
    assert.ok(짝.가.length > 0 && 짝.나.length > 0,
              `빈 이름이 있다: 「${짝.가}」 ↔ 「${짝.나}」`);
  }
  assert.ok(!/^ {2}↔/m.test(글), '이름 없는 짝 줄이 있다');
});

test('이카운트등록이 confirmed_orders 로 이어진 것을 센다 (옛 꼴 compat API)', () => {
  /* 이 집만 옛 꼴을 쓴다. 놓치면 이 짝 둘이 사라진다. */
  const 에 = 짝들.find((x) => x.가 === '에이엠티' && x.나 === '이카운트등록');
  const 조 = 짝들.find((x) => x.가 === '이카운트등록' && x.나 === '조혼가구');
  assert.ok(에, '에이엠티 ↔ 이카운트등록 을 못 세고 있다 — 옛 꼴을 놓쳤다');
  assert.ok(조, '이카운트등록 ↔ 조혼가구 를 못 세고 있다 — 옛 꼴을 놓쳤다');
  assert.match(에.무엇, /confirmed_orders/);
});

test('주석에 이름만 적힌 것은 이음이 아니다', () => {
  /* viggle 은 큐알길.js 를 **싣지 않는다.** 관리자 연장 주석에 적어 둔 것뿐이다. */
  const 가짜 = 짝들.find((x) =>
    (x.가 === '작업대' && x.나 === '조혼가구') ||
    (x.가 === '조혼가구' && x.나 === '작업대'));
  assert.ok(!가짜 || !/큐알길/.test(가짜.무엇),
            '작업대 ↔ 조혼가구 가 큐알길.js 로 이어진 것으로 떴다 — 주석을 세고 있다');
});

test('에이엠티 ↔ 조혼가구 가 제일 두껍게 이어져 있다 (10-12 에 선 길)', () => {
  const 첫 = 짝들[0];
  assert.ok((첫.가 === '에이엠티' && 첫.나 === '조혼가구'),
            `제일 두꺼운 짝이 ${첫.가} ↔ ${첫.나} 로 나왔다`);
  for (const c of ['confirmed_orders', '입고확인', '출고명세표', '거래명세표.js']) {
    assert.ok(첫.무엇.includes(c), `그 짝에 ${c} 가 없다`);
  }
});

test('shared/큐알길.js 를 싣는 집은 아직 조혼가구 하나뿐이다', () => {
  /* 이것이 **넓힐 자리**다. 큐알길.js 는 「스캔하는 프로그램이 여럿이라 다 읽을
     수 있어야 한다」 고 적혀 있는데, 지금 싣는 집이 하나라서 짝이 안 생긴다.
     반품스캔이 싣게 되면 이 시험이 빨개진다 — 그때 이 글을 고치고 짝을 센다. */
  assert.ok(!/큐알길\.js/.test(글),
    '큐알길.js 로 이어진 짝이 생겼다 — 좋은 일이다. 이 시험을 고쳐라');
});

test('NRS 는 아무 집과도 안 이어져 있다 — 파이어스토어가 없다', () => {
  assert.match(글, /아무 프로그램과도 안 이어진 것 \d+ 가지 — .*NRS/);
});

test('손잡이(viggle.js)는 이음으로 세지 않는다', () => {
  /* 세면 거의 모든 집이 모든 집과 이어진 것으로 나와 셈이 뜻을 잃는다. */
  assert.ok(!/viggle\.js/.test(글), 'viggle.js 를 이음으로 세고 있다');
  assert.ok(짝들.length < 40, `짝이 ${짝들.length} 쌍이다 — 손잡이를 세고 있지 않나`);
});

test('--짝 으로 한 짝을 들여다본다', () => {
  const 하나 = 재다('--짝', '에이엠티', '조혼가구');
  assert.match(하나, /같은 칸 \d+:/);
  assert.match(하나, /같은 셈 \d+:/);
  const 없는 = 재다('--짝', 'NRS', '에이엠티');
  assert.match(없는, /안 이어졌다/);
});
