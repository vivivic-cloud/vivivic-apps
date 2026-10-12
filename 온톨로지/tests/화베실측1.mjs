/* `화베실측.tsv` — **내가 잰 것이 아니라 받아 적은 표**다. 그래서 더 단단히 잰다.
   고침이 없으면 빨개지는지 먼저 확인하고 붙였다 (2026-10-12).

   바이글(관리자)이 사장님 관리자 쪽에서 `tools/화베읽기.py` 를 돌려 넘겨 준 값을
   내가 손으로 옮겨 적었다. **옮겨 적다 틀릴 수 있다.** 그래서 코드와 아귀를 맞춘다.

   이 판에서는 산 화베를 못 읽는다(자동 승인기: Production Reads). 그러니 이 시험은
   **줄 수가 맞는지는 못 잰다** — 못 잴 것을 재는 척하지 않는다.
   잴 수 있는 것은 이것이다: 적어 둔 칸이 **코드가 부르는 칸과 하나하나 맞물리나.**

   돌리기:  node 온톨로지/tests/화베실측1.mjs
*/
import assert from 'node:assert';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const 뿌리 = new URL('../..', import.meta.url).pathname.replace(/\/$/, '');

function 표() {
  const 밖 = new Map();
  for (const 줄 of readFileSync(`${뿌리}/온톨로지/화베실측.tsv`, 'utf-8').split('\n')) {
    if (줄.startsWith('#') || !줄.trim()) continue;
    const c = 줄.split('\t');
    if (c[0] === '칸') continue;
    밖.set(c[0], { 줄: c[1], 열쇠수: c[2], 쪽지: c[3] || '' });
  }
  return 밖;
}

function 코드칸() {
  const 글 = execFileSync('python3', ['-I', `${뿌리}/온톨로지/tools/칸세기.py`],
                          { encoding: 'utf-8', maxBuffer: 1 << 24 });
  const 밖 = new Set();
  for (const 줄 of 글.split('\n')) {
    const m = /^(\S+)\s+\d+\s\s/.exec(줄);
    if (m && m[1] !== '칸') 밖.add(m[1]);
  }
  return 밖;
}

const 실측 = 표();
const 코드 = 코드칸();

test('옮겨 적은 칸이 코드가 부르는 칸과 하나하나 맞물린다', () => {
  const 코드만 = [...코드].filter((c) => !실측.has(c));
  const 표만 = [...실측.keys()].filter((c) => !코드.has(c));
  assert.deepEqual(코드만, [], `코드는 부르는데 표에 없다: ${코드만}`);
  assert.deepEqual(표만, [], `표에 있는데 코드가 안 부른다: ${표만}`);
  assert.equal(실측.size, 코드.size);
});

test('바이글이 잰 칸 30 · 아직 못 잰 칸 11 — 합이 코드의 41 이다', () => {
  const 잰것 = [...실측.values()].filter((v) => v.줄 !== '?');
  const 못잰것 = [...실측.values()].filter((v) => v.줄 === '?');
  assert.equal(잰것.length, 30, `잰 칸이 ${잰것.length} 개다`);
  assert.equal(못잰것.length, 11, `못 잰 칸이 ${못잰것.length} 개다`);
  assert.equal(잰것.length + 못잰것.length, 코드.size);
});

test('줄 0 인 칸 다섯은 **왜 비었나**가 적혀 있다', () => {
  /* 바이글: 「빈 칸은 왜 비었나까지. 그 까닭이 곧 이을 자리입니다.」
     까닭 없는 0 은 「없다」 와 「아직 안 쓴다」 를 가르지 못한다. */
  const 빈것 = [...실측.entries()].filter(([, v]) => v.줄 === '0');
  assert.equal(빈것.length, 5, `줄 0 인 칸이 ${빈것.length} 개다`);
  for (const [이름, v] of 빈것) {
    assert.ok(v.쪽지.trim().length > 0, `${이름} 에 까닭이 없다`);
    assert.match(v.쪽지, /아직 안 씀|아직/, `${이름} 의 까닭이 「아직 안 쓴다」 로 안 적혀 있다`);
  }
});

test('출고명세표 0 은 「없다」 가 아니라 「아직 안 쓴다」 로 적혀 있다', () => {
  /* 바이글이 못 박은 것 — 「**「비었다」 를 「없다」 로 적지 마십시오.**」
     v1.59.0 이 10-12 에 막 섰고 그 뒤로 배송 확정을 아직 안 하셨다. */
  const v = 실측.get('출고명세표');
  assert.equal(v.줄, '0');
  assert.match(v.쪽지, /아직 안 씀/);
  assert.ok(!/없다/.test(v.쪽지), '「없다」 라고 적혀 있다 — 비었을 뿐이다');
});

test('vp_* 넷은 「사장님만 읽는 칸」 으로 적혀 있다 — 뚫지 않는다', () => {
  /* 화베 규칙이 `vp_*` 를 사장님 계정 하나로 잠가 두었다. 바이글도 못 읽는다.
     **앞으로도 못 잰다. 그게 맞는 것이다** — 거래처 사람 정보가 섞인다. */
  for (const 이름 of ['vp_상품목록', 'vp_기록', 'vp_배송열쇠', 'vp_배송집계']) {
    const v = 실측.get(이름);
    assert.ok(v, `${이름} 줄이 없다`);
    assert.equal(v.줄, '?', `${이름} 에 줄 수가 적혀 있다 — 못 읽는 칸이다`);
    assert.match(v.쪽지, /사장님만 읽는 칸/, `${이름} 에 그 말이 없다`);
  }
});

test('300 에서 끊긴 세 칸은 「300+」 로 적혀 있다', () => {
  /* 바이글: 「**「300」 이라 적으면 거짓입니다.**」 */
  for (const 이름 of ['boring_files', 'cutting_plans', 'product_master']) {
    assert.equal(실측.get(이름).줄, '300+', `${이름} 이 300+ 로 안 적혀 있다`);
  }
  for (const [이름, v] of 실측) {
    assert.ok(v.줄 !== '300', `${이름} 이 「300」 이라 적혀 있다 — 끊긴 것이다`);
  }
});

test('amt_cutting 은 **쓰기만 하고 아무도 안 읽는다** — 코드로 다시 잰다', () => {
  /* 줄이 16 인데 읽는 쪽이 없다. 표에만 적지 않고 코드로 못 박는다. */
  const 글 = readFileSync(`${뿌리}/에이엠티/에이엠티.html`, 'utf-8');
  /* ⚠ **줄로 센다.** 16605 줄에 `amt_cutting` 과 `amtCuttingRef` 가 **같이** 있어서
     글자로 세면 3이고 자리로 세면 2다. 자리가 뜻이 있는 셈이다. */
  const 자리 = 글.split('\n')
    .map((줄, i) => ({ 줄, n: i + 1 }))
    .filter((x) => /amt_cutting|amtCuttingRef/.test(x.줄));
  assert.equal(자리.length, 2,
    `amt_cutting 이 나오는 줄이 ${자리.length} 곳이다: ${자리.map((x) => x.n)}`);
  assert.match(자리[0].줄, /collection\(/, '첫 자리는 칸을 잡는 자리다');
  assert.match(자리[1].줄, /addDoc\(/, '둘째 자리는 담는 자리다 — 읽는 자리가 없다');
  assert.ok(/getDocs\s*\(\s*amtCuttingRef|onSnapshot\s*\(\s*amtCuttingRef/.test(글) === false,
            'amt_cutting 을 읽는 자리가 생겼다 — 좋은 일이다. 이 시험을 고쳐라');
  assert.match(실측.get('amt_cutting').쪽지, /쓰기만/);
});

test('product_master 와 product_overrides 는 같은 58칸 꼴이다 — SCHEMA 로 잰다', () => {
  /* 바이글 실측이 양쪽 다 `fields:map(58)` 이라고 했다. 그 58이 어디서 오나를 코드로 센다. */
  const 글 = readFileSync(`${뿌리}/원장관리/원장관리.html`, 'utf-8');
  const m = /const SCHEMA = \[([\s\S]*?)\n\];/.exec(글);
  assert.ok(m, 'SCHEMA 를 못 찾았다');
  const 열쇠 = [...m[1].matchAll(/\{\s*key:'([^']+)'/g)].map((x) => x[1]);
  assert.equal(열쇠.length, 58, `SCHEMA 가 ${열쇠.length} 칸이다 — 실측의 map(58) 과 어긋난다`);
  /* 이 집의 **허브**인 까닭 — 한 줄에 벤더피아 쪽 열쇠와 에이엠티 쪽 열쇠가 같이 있다 */
  for (const k of ['ing단품명', 'ing단품코드', 'ing발주처', '부속명', '부속코드',
                   '조립부속코드', '재단부속코드', '엣지부속코드', '보링부속코드',
                   'NC부속코드', '원장명', '우라홈', '창고', '세트별소모량']) {
    assert.ok(열쇠.includes(k), `SCHEMA 에 ${k} 가 없다`);
  }
});

test('에이엠티는 product_master 를 **0번** 읽는다 — 허브가 있는데 엑셀로 돈다', () => {
  /* 이것이 못이음.tsv 4번의 알맹이다. 막힌 것은 코드가 아니라 길이다. */
  const 글 = readFileSync(`${뿌리}/에이엠티/에이엠티.html`, 'utf-8');
  assert.equal((글.match(/product_master/g) || []).length, 0,
    '에이엠티가 product_master 를 읽기 시작했다 — 좋은 일이다. 이 시험을 고쳐라');
  assert.match(글, /currentFullData = jsonData/, '엑셀로 받는 자리가 있어야 한다');
});
