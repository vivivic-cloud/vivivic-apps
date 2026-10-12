/* 칸세기.py 가 **칸을 맞게 세는지** 잰다.
   고침이 없으면 빨개지는지 먼저 확인하고 붙였다 (2026-10-12).

   왜 이 시험이 있나 — 칸을 긁는 그물을 두 번 잘못 쳤다.
     1) `칸(` 를 통째로 잡아서 cabinet-studio 의 **가구 낱말**이 칸으로 올라왔다
        (「상판유격」·「이동선반」·「무게합」 … 40여 가지). 그 집에는 파이어스토어가
        **아예 없다** — `collection(` 이 0번이다.
     2) 받는 인자 `이름` 을 딴 파일의 상수로 풀어서 `amtcad` 라는 **없는 칸**이 생겼다.
   그래서 **가짜가 다시 올라오면 빨개지게** 못 박아 둔다.

   돌리기:  node 온톨로지/tests/칸세기1.mjs
*/
import assert from 'node:assert';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';

const 뿌리 = new URL('../..', import.meta.url).pathname.replace(/\/$/, '');

function 재다() {
  const 글 = execFileSync('python3', ['-I', `${뿌리}/온톨로지/tools/칸세기.py`],
                          { encoding: 'utf-8', maxBuffer: 1 << 24 });
  const 칸 = new Map();
  for (const 줄 of 글.split('\n')) {
    const m = /^(\S+)\s+(\d+)\s\s(.+)$/.exec(줄);
    if (!m || 줄.startsWith('#') || m[1] === '칸') continue;
    칸.set(m[1], { 집수: Number(m[2]), 집: m[3].trim() });
  }
  return 칸;
}

const 칸 = 재다();

test('칸을 센다 — 아무것도 못 세면 그물이 끊긴 것이다', () => {
  assert.ok(칸.size >= 30, `칸이 ${칸.size} 가지뿐이다 — 그물이 끊겼다`);
});

test('진짜 업무 칸은 다 잡힌다', () => {
  /* 코드에서 눈으로 확인한 것들. 부르는 자리를 함께 적어 둔다. */
  for (const c of ['confirmed_orders', 'cutting_plans', 'wo_pallet', '입고확인',
                   '출고명세표', '큐알규칙', 'amt_boxes', 'johon_boxes',
                   'docs_files', 'docs_overlay', 'docs_rules',
                   'wt_boxes', 'wt_dev', 'wt_asked', 'wt_chat',
                   'vp_상품목록', 'layout_배치도', 'layout_저장',
                   /* 칸 이름을 **딴 줄에 적어 둔** 것들. 같은 파일 상수 풀기가 살아 있나.
                      johon_meta 는 부르는 자리가 **두 줄에 걸쳐** 있어 줄 단위로는 못 잡혔다. */
                   'amt_meta', 'johon_meta']) {
    assert.ok(칸.has(c), `${c} 를 놓쳤다`);
  }
});

test('감싸개 뒤에 숨은 칸도 풀린다', () => {
  /* docs 는 `col(FILES)` 로 부르고 `FILES` 는 딴 파일에 적혀 있다.
     wt_chat 은 `말넣기('wt_chat', …)` — 함수꼴 감싸개 안에 있다. */
  assert.equal(칸.get('docs_files').집, 'vivivic-docs(4)');
  assert.ok(칸.get('wt_chat').집.startsWith('viggle'));
});

test('cabinet-studio 의 가구 낱말이 칸으로 올라오지 않는다', () => {
  /* 그 집에는 파이어스토어가 없다. 하나라도 올라오면 그물이 너무 넓은 것이다. */
  for (const 가짜 of ['무게합', '상판유격', '이동선반', '측판유격', '고정선반',
                     '엣지', '부속', '깊이', '규칙', '역사', '상태']) {
    assert.ok(!칸.has(가짜), `${가짜} 는 칸이 아니다 — cabinet-studio 의 가구 낱말이다`);
  }
  for (const [이름, v] of 칸) {
    assert.ok(!v.집.includes('cabinet'),
              `${이름} 이 cabinet-studio 것으로 잡혔다 — 그 집엔 파이어스토어가 없다`);
  }
});

test('받는 인자를 딴 파일 상수로 풀지 않는다', () => {
  /* `칸(이름, 자리키(id))` 의 `이름` 은 **인자**다. 이것을 풀면 `amtcad` 가 생긴다. */
  assert.ok(!칸.has('amtcad'), 'amtcad 는 없는 칸이다 — 인자를 상수로 풀었다');
  for (const 이름 of ['이름', '칸', '칸이름', '메시지', '클로드에게 지시']) {
    assert.ok(!칸.has(이름), `${이름} 은 칸이 아니다`);
  }
});

test('vp_상품목록 은 두 집이 부른다 — 벤더피아가 담고 서류관리가 읽는다', () => {
  /* 서류관리는 `VP_상품 = 'vp_상품목록'` 으로 부른다. 큰글자 상수 풀기가 살아 있나. */
  const v = 칸.get('vp_상품목록');
  assert.equal(v.집수, 2, `vp_상품목록 을 부르는 집이 ${v.집수} 곳이다`);
  assert.ok(v.집.includes('vivivic-docs') && v.집.includes('벤더피아상품정리'), v.집);
});

test('내 연장은 세지 않는다', () => {
  for (const [, v] of 칸) {
    assert.ok(!v.집.includes('온톨로지'), '온톨로지 폴더를 세고 있다');
  }
});
