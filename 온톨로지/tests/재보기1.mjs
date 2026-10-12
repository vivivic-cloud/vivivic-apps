/* 적어 둔 표(`객체.tsv` · `이름갈림.tsv`)가 **코드와 어긋나지 않는지** 잰다.
   고침이 없으면 빨개지는지 먼저 확인하고 붙였다 (2026-10-12) —
   없는 이름 하나를 넣어 보고 빨개지는 것을 보았다.

   왜 이 시험이 있나 — 첫 표를 적을 때 **코드에 없는 이름 셋**을 적어 넣었다
   (`partKey` · `파레트글자` · `매입처명`). 눈으로는 그럴싸했지만 코드에 없었다.
   `재보기.py` 가 그 셋을 잡아냈다. 그 잡는 힘이 살아 있어야 한다.

   돌리기:  node 온톨로지/tests/재보기1.mjs
*/
import assert from 'node:assert';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { test } from 'node:test';

const 뿌리 = new URL('../..', import.meta.url).pathname.replace(/\/$/, '');
const 갈림길 = `${뿌리}/온톨로지/이름갈림.tsv`;

function 재다() {
  try {
    return { ok: true, 글: execFileSync('python3',
      ['-I', `${뿌리}/온톨로지/tools/재보기.py`],
      { encoding: 'utf-8', maxBuffer: 1 << 24 }) };
  } catch (e) {
    return { ok: false, 글: String(e.stdout || '') + String(e.stderr || '') };
  }
}

test('표에 적은 이름·칸이 모두 코드에 있다', () => {
  const r = 재다();
  assert.ok(r.ok, `재보기가 빨개졌다:\n${r.글}`);
  assert.match(r.글, /표에 적은 이름·칸이 모두 코드에 있다/);
});

test('셈을 찍는다 — 객체·갈린 자리·칸', () => {
  const { 글 } = 재다();
  const 객체 = /객체\s+(\d+) 가지/.exec(글);
  const 갈림 = /이름 갈린 자리\s+(\d+) 군데/.exec(글);
  const 칸 = /코드가 부르는 칸\s+(\d+) 가지/.exec(글);
  assert.ok(객체 && 갈림 && 칸, `셈이 안 찍혔다:\n${글}`);
  /* 지금 잰 값. 늘어나는 것은 좋다 — 줄어들면 표가 지워졌거나 그물이 끊긴 것이다. */
  assert.ok(Number(객체[1]) >= 45, `객체가 ${객체[1]} 가지로 줄었다`);
  assert.ok(Number(갈림[1]) >= 16, `갈린 자리가 ${갈림[1]} 군데로 줄었다`);
  assert.ok(Number(칸[1]) >= 41, `칸이 ${칸[1]} 가지로 줄었다`);
});

test('급한 자리 넷을 짚는다', () => {
  const { 글 } = 재다();
  for (const 것 of ['발주를 집는 열쇠', '부속을 집는 열쇠', '밑줄', '파레트']) {
    assert.ok(글.includes(것), `급한 자리에 「${것}」 이 없다`);
  }
});

test('코드에 없는 이름을 적어 넣으면 빨개진다', () => {
  /* 이것이 이 표의 **살아 있는 힘**이다. 「아마」 로 적은 줄이 못 남게 한다. */
  const 본래 = readFileSync(갈림길, 'utf-8');
  try {
    writeFileSync(갈림길, 본래.replace(
      '\t발주를 집는 열쇠\tdocId',
      '\t발주를 집는 열쇠\t이런열쇠는없다XYZ · docId'));
    const r = 재다();
    assert.ok(!r.ok, '없는 이름을 넣었는데 빨개지지 않았다');
    assert.match(r.글, /이런열쇠는없다XYZ」 이 코드에 없다/);
  } finally {
    writeFileSync(갈림길, 본래);           // ⚠ 꼭 되돌린다
  }
  assert.equal(readFileSync(갈림길, 'utf-8'), 본래, '표를 되돌리지 못했다');
});
