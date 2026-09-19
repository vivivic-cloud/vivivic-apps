/* 시험이 딛고 서는 터 — 시험 47개가 다 이것을 거쳐 간다.
   여기 있는 까닭은 하나다: **어느 상자에서 받아도 그대로 돌아가게** 하는 것.
   그래서 이 파일 밖으로 나가는 길(절대경로·남이 띄워 줘야 하는 서버)을 두지 않는다.

   주는 것
     뿌리        저장소 뿌리 (이 파일 자리에서 거슬러 올라가 찾는다)
     chromium    플레이라이트 — 있는 자리를 차례로 찾아 쓴다
     devices     〃
     서버()      저장소를 8899 에 내주는 자리 서버. 이미 떠 있으면 그것을 쓴다.
     자료(이름)  시험이 먹는 자료. 진짜 업무 자료가 있으면 그것을, 없으면 본보기를 준다.
     자재()      막힌 CDN 을 대신할 것들이 든 칸. 없으면 npm 으로 스스로 갖춘다.
*/
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const 여기 = path.dirname(fileURLToPath(import.meta.url));          // …/에이엠티/tests/도구
export const 시험칸 = path.resolve(여기, '..');                      // …/에이엠티/tests
export const 뿌리 = path.resolve(여기, '../../..');                  // 저장소 뿌리
const 있나 = p => { try { fs.accessSync(p); return true; } catch { return false; } };

/* ── 플레이라이트 ────────────────────────────────────────────────────────
   **상자에 이미 깔린 것을 먼저 쓴다.** npm 으로 새로 받은 판은 저 혼자 새 브라우저
   번호를 찾는데, 바깥이 막힌 상자에서는 그 브라우저를 받을 길이 없어 반드시 떨어진다.
   상자에 깔린 판은 상자에 깔린 브라우저와 짝이 맞는다. */
async function 플레이라이트(){
    const 길들 = ['/opt/node22/lib/node_modules/playwright/index.mjs',
                  'playwright',
                  path.join(시험칸, '.자재/node_modules/playwright/index.mjs')];
    const 못한것 = [];
    for (const g of 길들) {
        try { return await import(g.startsWith('/') ? ('file://' + g) : g); }
        catch (e) { 못한것.push(g); }
    }
    throw new Error('플레이라이트를 못 찾았습니다. 찾아본 자리: ' + 못한것.join(' · ') +
        '\n  → `npm i -D playwright` 로 받으십시오.');
}
const pw = await 플레이라이트();
export const chromium = pw.chromium;
export const devices = pw.devices;

/* ── 브라우저 열기 ──────────────────────────────────────────────────────
   플레이라이트가 제 판에 맞는 브라우저를 못 찾으면(바깥이 막혀 새로 못 받는 상자에서
   흔하다) 상자에 이미 깔린 크로미움으로 떨어진다. 판 번호는 박지 않는다 — 브라우저
   칸을 훑어 있는 것을 찾는다. 상자가 바뀌면 번호도 바뀌기 때문이다. */
export function 크로미움찾기(){
    const 칸 = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
    if (!있나(칸)) return null;
    const 뒤 = ['chrome-linux/chrome', 'chrome-headless-shell-linux64/chrome-headless-shell',
                'chrome-linux64/chrome', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium'];
    // 번호가 큰 것부터 본다. 맨 이름(chromium)은 흔히 최신을 가리키는 이음줄이다.
    const 것들 = fs.readdirSync(칸).filter(n => n.startsWith('chromium'))
        .sort((a, b) => (parseInt(b.replace(/\D/g, ''), 10) || 0) - (parseInt(a.replace(/\D/g, ''), 10) || 0));
    for (const 이름 of ['chromium', ...것들]) {
        const 밑 = path.join(칸, 이름);
        if (!있나(밑)) continue;
        try { if (fs.statSync(밑).isFile()) return 밑; } catch { continue; }   // 이음줄이 곧 실행파일
        for (const t of 뒤) { const p2 = path.join(밑, t); if (있나(p2)) return p2; }
    }
    return null;
}
export async function 브라우저열기(옵션 = {}){
    try { return await chromium.launch(옵션); }
    catch (e) {
        const 길 = 크로미움찾기();
        if (!길) throw new Error(
            '크로미움을 못 열었습니다. 플레이라이트가 찾는 브라우저도, ' +
            (process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers') + ' 에 깔린 것도 없습니다.' +
            '\n  → `npx playwright install chromium` 이 되는 자리면 그것을, 안 되면 상자에 깔린 크로미움을 ' +
            'PLAYWRIGHT_BROWSERS_PATH 로 가리켜 주십시오.\n  (플레이라이트가 한 말: ' +
            String(e && e.message || e).split('\n')[0] + ')');
        return await chromium.launch({ ...옵션, executablePath: 길 });
    }
}

/* ── 자리 서버 ───────────────────────────────────────────────────────────
   8899 에 이미 저장소를 내주는 것이 떠 있으면 그것을 쓴다. 없으면 우리가 띄우고
   시험이 끝날 때 내린다. 남이 미리 띄워 줘야 하는 것은 없다. */
const 갈래 = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
    '.mjs':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8',
    '.json':'application/json; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg',
    '.svg':'image/svg+xml', '.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
export const 자리 = 'http://127.0.0.1:8899';
let 서버떴다 = null;
export async function 서버(){
    if (서버떴다) return 자리;
    // 이미 누가 띄워 두었나 — 앱 파일이 나오면 그것을 쓴다.
    // 대답이 없는 것이 물려 있을 수도 있으므로 1.5초만 기다린다(안 그러면 여기서 멎는다).
    try {
        const r = await fetch(자리 + '/' + encodeURIComponent('에이엠티') + '/' + encodeURIComponent('에이엠티.html'),
                              { signal: AbortSignal.timeout(1500) });
        if (r.ok && (await r.text()).includes('<html')) { 서버떴다 = '남의것'; return 자리; }
    } catch {}
    const s = createServer((req, res) => {
        let 길;
        try { 길 = decodeURIComponent(new URL(req.url, 자리).pathname); } catch { 길 = ''; }
        const 참 = path.join(뿌리, path.normalize(길).replace(/^(\.\.[/\\])+/, ''));
        if (!참.startsWith(뿌리) || !있나(참) || fs.statSync(참).isDirectory()) {
            res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); res.end('없습니다: ' + 길); return;
        }
        res.writeHead(200, { 'content-type': 갈래[path.extname(참).toLowerCase()] || 'application/octet-stream' });
        fs.createReadStream(참).pipe(res);
    });
    try {
        await new Promise((풀, 깨) => { s.once('error', 깨); s.listen(8899, '127.0.0.1', 풀); });
    } catch (e) {
        throw new Error('8899 를 못 씁니다(' + (e && e.code || e) + '). 그 자리에 저장소를 안 내주는 것이 물려 있습니다 — 그것을 내리고 다시 돌리십시오.');
    }
    s.unref();                                   // 이것 때문에 노드가 안 끝나는 일은 없게
    서버떴다 = s;
    process.on('exit', () => { try { s.close(); } catch {} });
    return 자리;
}

/* ── 자료 ───────────────────────────────────────────────────────────────
   진짜 업무 자료(원장·발주·재단계획)는 저장소에 넣지 않는다. 저장소 뿌리에 있으면
   그것을 쓰고, 없으면 `본보기자료/` 의 본보기를 쓴다. 본보기에는 실제 거래처·상품
   이름·전화번호·열쇠가 한 줄도 없다. 시험이 자료를 고치는 일은 없다 — 읽기만 한다. */
const 자료들 = new Map();
export async function 자료(이름){
    if (자료들.has(이름)) return 자료들.get(이름);
    const 진짜 = path.join(뿌리, 이름 + '.json');
    const 본보기 = path.join(시험칸, '본보기자료', 이름 + '.json');
    const 쓸것 = 있나(진짜) ? 진짜 : 본보기;
    if (!있나(쓸것)) throw new Error('자료를 못 찾았습니다: ' + 이름 + '.json (본보기도 없습니다)');
    const 값 = JSON.parse(fs.readFileSync(쓸것, 'utf-8'));
    자료들.set(이름, 값);
    return 값;
}
export function 자료어디(이름){
    return 있나(path.join(뿌리, 이름 + '.json')) ? '진짜' : '본보기';
}

/* ── 그림 둘 자리 ────────────────────────────────────────────────────────
   `SHOTS=1` 로 돌리면 저장소의 `에이엠티/shots/` 에 찍는다. 그냥 돌리면 `tests/.그림/`
   에만 남아 저장소가 더러워지지 않는다. */
export function 그림칸(){
    const 칸 = process.env.SHOTS === '1' ? path.join(뿌리, '에이엠티/shots') : path.join(시험칸, '.그림');
    fs.mkdirSync(칸, { recursive: true });
    return 칸;
}

/* ── 자재 — 막힌 CDN 을 대신할 것들 ──────────────────────────────────────
   이 상자에서는 cdn.tailwindcss.com · cdn.sheetjs.com · cdn.jsdelivr.net 에 못 닿는다.
   그래서 npm 으로 같은 판을 받아 시험 창에만 끼워 준다(앱 파일은 안 건드린다).
   한 번 갖춰 두면 다시 받지 않는다. 자리는 `tests/.자재/` — 저장소에 안 들어간다. */
const 자재칸 = path.join(시험칸, '.자재');
const 있어야할것 = [
    'tw-built.css',
    'node_modules/xlsx/dist/xlsx.full.min.js',
    'node_modules/sortablejs/Sortable.min.js',
    'node_modules/gsap/dist/gsap.min.js',
];
let 자재됐다 = false;
export async function 자재(){
    if (자재됐다) return 자재칸;
    if (있어야할것.every(f => 있나(path.join(자재칸, f)))) { 자재됐다 = true; return 자재칸; }
    fs.mkdirSync(자재칸, { recursive: true });
    const 돌려 = (명, 인자, 어디) => {
        const r = spawnSync(명, 인자, { cwd: 어디 || 자재칸, stdio: 'inherit' });
        if (r.status !== 0) throw new Error('자재를 갖추지 못했습니다: ' + 명 + ' ' + 인자.join(' ') +
            '\n  (인터넷이 막힌 자리면 tests/.자재/ 에 직접 넣어 주십시오 — README 를 보십시오)');
    };
    if (!있나(path.join(자재칸, 'node_modules/tailwindcss'))) {
        // package.json 이 없으면 npm 이 위로 거슬러 올라가 엉뚱한 자리를 보고
        // 「up to date」 라며 아무것도 안 받는다. 그래서 여기에 하나 둔다.
        fs.writeFileSync(path.join(자재칸, 'package.json'),
            JSON.stringify({ name: 'amt-시험자재', private: true, version: '0.0.0' }, null, 2) + '\n');
        console.log('· 시험 자재를 받습니다 (처음 한 번만): tailwindcss · xlsx · sortablejs · gsap');
        돌려('npm', ['install', '--no-audit', '--no-fund',
                     'tailwindcss@3.4.17', 'xlsx', 'sortablejs', 'gsap']);
    }
    if (!있나(path.join(자재칸, 'tw-built.css'))) {
        // 테일윈드는 앱 파일에 실제로 쓰인 것만 뽑는다 — 판은 앱이 CDN 으로 쓰던 3.x 그대로
        fs.writeFileSync(path.join(자재칸, 'tw.config.js'),
            'module.exports = { content: [' + JSON.stringify(path.join(뿌리, '에이엠티/에이엠티.html')) +
            '], theme:{extend:{}}, plugins:[] };\n');
        fs.writeFileSync(path.join(자재칸, 'tw.in.css'),
            '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n');
        console.log('· 테일윈드를 앱 파일 기준으로 뽑습니다 (처음 한 번만)');
        돌려(process.execPath, [path.join(자재칸, 'node_modules/tailwindcss/lib/cli.js'),
             '-c', 'tw.config.js', '-i', 'tw.in.css', '-o', 'tw-built.css', '--minify']);
    }
    const 빠진것 = 있어야할것.filter(f => !있나(path.join(자재칸, f)));
    if (빠진것.length) throw new Error('자재가 모자랍니다: ' + 빠진것.join(', '));
    자재됐다 = true;
    return 자재칸;
}
