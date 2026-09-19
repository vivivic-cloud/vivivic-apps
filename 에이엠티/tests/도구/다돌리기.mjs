/* 시험 47개를 다 돌리고 통과·실패를 센다.
   돌리는 법:  node 에이엠티/tests/도구/다돌리기.mjs  [시험이름 …]
   이름을 적으면 그것만, 안 적으면 `시험목록.txt` 에 적힌 차례대로 다 돈다. */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { 시험칸, 자료어디, 자재 } from './터.mjs';

const 이름들 = process.argv.slice(2).length ? process.argv.slice(2)
    : fs.readFileSync(path.join(시험칸, '시험목록.txt'), 'utf-8').split(/\s+/).filter(Boolean);

console.log('■ 시험 ' + 이름들.length + '개 · 자료는 ' + 자료어디('원장') + ' 원장');
// 자리 서버는 시험마다 스스로 띄운다. 여기서 띄우면 안 된다 —
// 아래 spawnSync 가 이 프로세스를 통째로 멈춰 세워 서버가 대답을 못 한다.
await 자재();                  // 처음 한 번 받는 동안 시험이 헛걸음하지 않게 먼저 갖춘다

let 통과 = 0; const 떨어진것 = [];
for (const 이름 of 이름들) {
    const 길 = path.join(시험칸, 이름 + '.mjs');
    if (!fs.existsSync(길)) { 떨어진것.push([이름, '파일이 없다']); console.log('  없음  ' + 이름); continue; }
    const r = spawnSync(process.execPath, [길], { cwd: 시험칸, encoding: 'utf-8' });
    const 글 = (r.stdout || '') + (r.stderr || '');
    const 떨어짐 = r.status !== 0 || /\bFAIL\b/.test(글);
    if (떨어짐) {
        const 까닭 = (글.split('\n').find(l => /\bFAIL\b/.test(l)) ||
                      글.split('\n').filter(Boolean).pop() || '까닭 모름').trim();
        떨어진것.push([이름, 까닭]);
        console.log('  떨어짐 ' + 이름 + '   ' + 까닭.slice(0, 120));
    } else { 통과++; console.log('  통과  ' + 이름); }
}
console.log('\n■ 통과 ' + 통과 + ' · 떨어짐 ' + 떨어진것.length + ' / 모두 ' + 이름들.length);
떨어진것.forEach(([n, 까닭]) => console.log('   · ' + n + ' — ' + 까닭.slice(0, 200)));
process.exit(떨어진것.length ? 1 : 0);
