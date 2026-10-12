/* 조혼가구 시험이 딛고 서는 터.

   ⚠ **새로 짓지 않았다.** 플레이라이트 찾기·자리 서버·본보기 자료는 에이엠티의
     `에이엠티/tests/도구/터.mjs` 한 벌을 **그대로 가져다 쓴다**. 베끼면 두 집의 틀이
     갈라진다 — 집이 쓰는 셈은 한 벌이라는 이 집 규칙 그대로다.
     여기 있는 것은 **조혼가구에만 있는 것** 셋뿐이다: 주소 · 테일윈드 · 로그인 덮개 치우기.

   주는 것
     서버()          저장소를 8899 에 내주는 자리 서버 (에이엠티 것 그대로)
     브라우저열기()  크로미움 (에이엠티 것 그대로)
     devices         〃
     자료(이름)      본보기 원장 등 (에이엠티 것 그대로 — 끝끝 시험이 쓴다)
     주소            조혼가구.html 자리
     에이주소        에이엠티.html 자리 (두 집을 이어 재는 시험이 쓴다)
     테일윈드()      조혼가구.html 기준으로 뽑은 CSS 파일 자리
     덮개치우기      로그인 판을 감추는 init 조각 (시험마다 같은 것을 적지 않게)
*/
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export { 서버, 브라우저열기, devices, chromium, 자료, 본보기, 자료어디, 크로미움찾기, 뿌리, 자리 }
  from '../../../에이엠티/tests/도구/터.mjs';
import { 뿌리 as _뿌리, 자리 as _자리 } from '../../../에이엠티/tests/도구/터.mjs';

const 여기 = path.dirname(fileURLToPath(import.meta.url));
export const 시험칸 = path.resolve(여기, '..');
const 자재칸 = path.join(시험칸, '.자재');
const 있나 = p => { try { fs.accessSync(p); return true; } catch { return false; } };

const ㅈ = s => encodeURIComponent(s);
export const 주소    = _자리 + '/' + ㅈ('조혼가구') + '/' + ㅈ('조혼가구.html');
export const 에이주소 = _자리 + '/' + ㅈ('에이엠티') + '/' + ㅈ('에이엠티.html');

/* 테일윈드 — 앱이 CDN 으로 받던 것을 이 상자에서는 못 받는다(막혀 있다).
   **조혼가구.html 에 실제로 쓰인 것만** 뽑아 둔다. 에이엠티 것(tw-built.css)을 쓰면
   조혼가구에만 있는 칸이 빠져, 있지도 않은 크기를 재게 된다 — 한 번 그렇게 틀렸다. */
export async function 테일윈드(){
    const 낸것 = path.join(자재칸, 'tw.css');
    if (있나(낸것)) return 낸것;
    fs.mkdirSync(자재칸, { recursive: true });
    // 에이엠티가 이미 받아 둔 tailwindcss 가 있으면 그것을 쓴다 — 두 번 받지 않는다.
    const 남의것 = path.join(_뿌리, '에이엠티/tests/.자재/node_modules/tailwindcss/lib/cli.js');
    let cli = 있나(남의것) ? 남의것 : path.join(자재칸, 'node_modules/tailwindcss/lib/cli.js');
    if (!있나(cli)) {
        // package.json 이 없으면 npm 이 위로 거슬러 올라가 엉뚱한 자리를 보고 아무것도 안 받는다.
        fs.writeFileSync(path.join(자재칸, 'package.json'),
            JSON.stringify({ name: 'johon-시험자재', private: true, version: '0.0.0' }, null, 2) + '\n');
        console.log('· 시험 자재를 받습니다 (처음 한 번만): tailwindcss');
        const r = spawnSync('npm', ['install', '--no-audit', '--no-fund', 'tailwindcss@3.4.17'],
                            { cwd: 자재칸, stdio: 'inherit' });
        if (r.status !== 0) throw new Error('tailwindcss 를 못 받았습니다 — tests/README.md 를 보십시오');
    }
    fs.writeFileSync(path.join(자재칸, 'tw.config.js'),
        'module.exports = { content: [' + JSON.stringify(path.join(_뿌리, '조혼가구/조혼가구.html')) +
        '], theme:{extend:{}}, plugins:[] };\n');
    fs.writeFileSync(path.join(자재칸, 'tw.in.css'),
        '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n');
    const r2 = spawnSync(process.execPath,
        [cli, '-c', 'tw.config.js', '-i', 'tw.in.css', '-o', 'tw.css', '--minify'],
        { cwd: 자재칸, stdio: 'inherit' });
    if (r2.status !== 0 || !있나(낸것)) throw new Error('테일윈드를 못 뽑았습니다');
    return 낸것;
}

/* 시험이 찍은 그림이 가는 자리. **앱 폴더에 안 쌓는다** — 거기 그림은 손으로 골라
   커밋한 것뿐이다. 여기 것은 저장소에 안 들어간다(.gitignore). */
export function 그림칸(){
    const 칸 = path.join(시험칸, '.그림');
    fs.mkdirSync(칸, { recursive: true });
    return 칸 + '/';
}

/* 로그인 판을 감춘다. 시험마다 같은 줄을 적지 않게 한 군데 둔다. */
export const 덮개치우기 = () => {
    window.addEventListener('DOMContentLoaded', () => {
        const s = document.createElement('style');
        s.textContent = '#auth-login-overlay{display:none!important}';
        document.head.appendChild(s);
    });
};

/* 못을 세는 자 — 시험마다 같은 꼴로 적는다.
   돌려주는 것: { 못, 끝(), 초록, 빨강 } */
export function 자판(){
    let 초록 = 0, 빨강 = 0;
    const 못 = (이름, 본것, 바란것) => {
        const 맞나 = (typeof 바란것 === 'boolean' || 바란것 === undefined)
            ? (바란것 === undefined ? !!본것 : 본것 === 바란것)
            : JSON.stringify(본것) === JSON.stringify(바란것);
        if (맞나) { 초록++; console.log('  초록  ' + 이름 + '   → ' + JSON.stringify(본것)); }
        else { 빨강++; console.log('  FAIL  ' + 이름 + '   → ' + JSON.stringify(본것) +
                                   '   (바란 것 ' + JSON.stringify(바란것) + ')'); }
        return 맞나;
    };
    /* 참·거짓으로 재는 자리 — 보일 값은 따로 넘긴다.
       (크기·자리처럼 「무엇이었는지」 를 같이 적어야 다음 사람이 읽는다.) */
    const 참 = (이름, 참인가, 보일것) => {
        if (참인가) { 초록++; console.log('  초록  ' + 이름 + '   → ' + JSON.stringify(보일것)); }
        else { 빨강++; console.log('  FAIL  ' + 이름 + '   → ' + JSON.stringify(보일것)); }
        return !!참인가;
    };
    const 끝 = () => {
        console.log('\n시험통  초록 ' + 초록 + ' · 빨강 ' + 빨강);
        if (빨강) process.exitCode = 1;
    };
    return { 못, 참, 끝, 셈: () => ({ 초록, 빨강 }) };
}
