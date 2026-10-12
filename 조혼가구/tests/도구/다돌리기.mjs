/* 조혼가구 시험을 다 돌리고 통과·떨어짐을 센다.
   돌리는 법:  node 조혼가구/tests/도구/다돌리기.mjs  [시험이름 …]
   이름을 적으면 그것만, 안 적으면 `tests/` 안의 `*.mjs` 를 **이름 차례로** 다 돈다.

   ⚠ 목록 파일을 따로 두지 않는다. 이 저장소의 `.gitignore` 가 `*.txt` 를 막아
     목록이 커밋에 안 들어간다 — 받아 간 사람이 못 돌리게 된다.
     (에이엠티의 `시험목록.txt` 가 실제로 그렇게 빠져 있다.)
   ⚠ 에이엠티의 `도구/다돌리기.mjs` 와 세는 말은 같다. */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { 시험칸, 테일윈드 } from './터.mjs';

const 이름들 = process.argv.slice(2).length ? process.argv.slice(2)
    : fs.readdirSync(시험칸).filter(f => f.endsWith('.mjs'))
        .map(f => f.slice(0, -4)).sort((a, b) => a.localeCompare(b, 'ko'));

console.log('■ 조혼가구 시험 ' + 이름들.length + '개');
// 자리 서버는 시험마다 스스로 띄운다. 여기서 띄우면 아래 spawnSync 가 이 프로세스를
// 통째로 멈춰 세워 서버가 대답을 못 한다. 테일윈드만 미리 갖춘다.
await 테일윈드();

/* 떨어진 까닭은 **진짜 첫 줄**을 적는다. 끝줄만 집으면 「Node.js v22…」 가 찍힌다. */
function 까닭뽑기(글){
    const 줄 = 글.split('\n').map(l => l.replace(/\s+$/, ''));
    const 쓸모없는 = l => !l.trim() || /^Node\.js v/.test(l) || /^\s+at /.test(l)
        || /^\s*\^+\s*$/.test(l) || /^node:internal/.test(l)
        || /throw new /.test(l) || /^\s*[\}\)];?\s*$/.test(l) || /^\/.*:\d+$/.test(l);
    return (줄.find(l => /\bFAIL\b/.test(l))
         || 줄.find(l => /^[A-Za-z]*Error:/.test(l.trim()))
         || 줄.filter(l => !쓸모없는(l)).pop()
         || '까닭 모름').trim();
}

let 통과 = 0, 초록합 = 0, 빨강합 = 0; const 떨어진것 = [];
for (const 이름 of 이름들) {
    const 길 = path.join(시험칸, 이름 + '.mjs');
    if (!fs.existsSync(길)) { 떨어진것.push([이름, '파일이 없다']); console.log('  없음  ' + 이름); continue; }
    const r = spawnSync(process.execPath, [길], { cwd: 시험칸, encoding: 'utf-8' });
    const 글 = (r.stdout || '') + (r.stderr || '');
    const 셈 = /시험통\s+초록\s+(\d+)\s+·\s+빨강\s+(\d+)/.exec(글);
    if (셈) { 초록합 += +셈[1]; 빨강합 += +셈[2]; }
    const 떨어짐 = r.status !== 0 || /\bFAIL\b/.test(글);
    if (떨어짐) {
        const 까닭 = 까닭뽑기(글);
        떨어진것.push([이름, 까닭]);
        console.log('  떨어짐 ' + 이름 + '   ' + 까닭.slice(0, 140));
    } else { 통과++; console.log('  통과  ' + 이름 + (셈 ? '   (못 ' + 셈[1] + ')' : '')); }
}
console.log('\n■ 통과 ' + 통과 + ' · 떨어짐 ' + 떨어진것.length + ' / 모두 ' + 이름들.length);
console.log('■ 못  초록 ' + 초록합 + ' · 빨강 ' + 빨강합);
떨어진것.forEach(([n, 까닭]) => console.log('   · ' + n + ' — ' + 까닭.slice(0, 200)));
process.exit(떨어진것.length ? 1 : 0);
