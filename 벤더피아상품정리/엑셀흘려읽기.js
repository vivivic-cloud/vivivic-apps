/* ==========================================
   벤더피아상품정리 / 엑셀흘려읽기.js
   버전: v0.2.0 (2026-10-10)

   .xlsx 를 **통째로 메모리에 올리지 않고** 한 줄씩 흘려 읽는다.

   왜 — XLSX.read 는 시트를 다 풀어 칸마다 자리를 만든다. 20만 줄 × 38칸이면 760만 칸이라
   폰이 그것 하나로 죽는다(관리자가 768MB 로 조이고 재서 확인: 600초 넘도록 못 읽고 창이 죽음).
   여기서는 지퍼를 **흘려** 풀어 62KB 조각으로 지나가며 한 줄씩 넘긴다. 손에 드는 것은 조각 하나뿐.

   꾸러미를 새로 받지 않는다 — 브라우저의 DecompressionStream('deflate-raw') 를 쓴다.
   (이 상자는 CDN 이 막혀 있고, SheetJS 는 제 fflate 를 밖으로 안 내준다.)
   ⚠ DecompressionStream 은 사파리 16.4부터다. 없으면 null 을 돌려주니 부르는 쪽이 옛 길로 간다.

   ⚠ 진짜 벤더피아 내보내기는 **t="s"(공유 글자표)** 를 쓴다 — inlineStr 이 아니다.
      (재고조회 2,721줄에서 t="s" 15,546번 · inlineStr 0번. 잰 값이다.)
      네 꼴을 다 받는다 — s · inlineStr · str · 민 숫자.
   ========================================== */
(function () {
'use strict';

const 있나 = (typeof DecompressionStream === 'function');
try { if (있나) new DecompressionStream('deflate-raw'); } catch (e) { /* 아래 돌려주기에서 걸린다 */ }

// ── 지퍼 복판 목록 ──────────────────────────────────────────────────
// 끝 기록(EOCD)을 뒤에서 찾아 칸 목록을 읽는다. 파일 전체를 풀지 않는다.
function 칸목록(ab) {
    const u8 = new Uint8Array(ab), dv = new DataView(ab);
    let 끝 = -1;
    for (let i = u8.length - 22; i >= Math.max(0, u8.length - 66000); i--)
        if (dv.getUint32(i, true) === 0x06054b50) { 끝 = i; break; }
    if (끝 < 0) return null;
    let p = dv.getUint32(끝 + 16, true);
    const 칸수 = dv.getUint16(끝 + 10, true), 목록 = [];
    for (let k = 0; k < 칸수 && p + 46 <= u8.length; k++) {
        if (dv.getUint32(p, true) !== 0x02014b50) return null;
        const 이름길이 = dv.getUint16(p + 28, true), 더 = dv.getUint16(p + 30, true), 끝말 = dv.getUint16(p + 32, true);
        목록.push({
            이름: new TextDecoder().decode(u8.subarray(p + 46, p + 46 + 이름길이)),
            방법: dv.getUint16(p + 10, true),
            눌린: dv.getUint32(p + 20, true),
            푼: dv.getUint32(p + 24, true),
            자리: dv.getUint32(p + 42, true)
        });
        p += 46 + 이름길이 + 더 + 끝말;
    }
    return { u8, dv, 목록 };
}

// 눌린 몸만 떼어 낸다 — 지역 머리(LFH)의 길이는 복판 목록 것과 다를 수 있어 거기서 다시 읽는다.
function 몸떼기(z, 칸) {
    const lo = 칸.자리;
    if (z.dv.getUint32(lo, true) !== 0x04034b50) return null;
    const 시작 = lo + 30 + z.dv.getUint16(lo + 26, true) + z.dv.getUint16(lo + 28, true);
    return z.u8.subarray(시작, 시작 + 칸.눌린);
}

// 한 칸을 글자 조각으로 흘려 준다. 방법 8 = 눌림, 0 = 그냥 담김.
async function* 흘리기(z, 칸) {
    const 몸 = 몸떼기(z, 칸);
    if (!몸) return;
    if (칸.방법 === 0) { yield new TextDecoder().decode(몸); return; }
    const 읽기 = new Blob([몸]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
    const dec = new TextDecoder();
    for (;;) {
        const { value, done } = await 읽기.read();
        if (done) break;
        yield dec.decode(value, { stream: true });
    }
}

// ── XML 잔손질 ──────────────────────────────────────────────────────
const 되돌리기 = s => (s.indexOf('&') < 0) ? s : s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(+d))
    .replace(/&amp;/g, '&');

// r="BC12" → 칸 차례 (0부터)
function 칸차례(r) {
    let n = 0;
    for (let i = 0; i < r.length; i++) {
        const c = r.charCodeAt(i);
        if (c < 65 || c > 90) break;
        n = n * 26 + (c - 64);
    }
    return n - 1;
}

// <t>…</t> 를 다 이어 붙인다 (서식이 섞인 글자는 조각으로 나뉘어 있다)
function 티모으기(s) {
    let 밖 = '', i = 0;
    for (;;) {
        const a = s.indexOf('<t', i); if (a < 0) break;
        const b = s.indexOf('>', a); if (b < 0) break;
        if (s.charCodeAt(a + 2) !== 62 && s.charCodeAt(a + 2) !== 32) { i = b + 1; continue; }  // <tr> 따위 아님
        if (s.charAt(b - 1) === '/') { i = b + 1; continue; }                                    // <t/>
        const c = s.indexOf('</t>', b); if (c < 0) break;
        밖 += 되돌리기(s.slice(b + 1, c));
        i = c + 4;
    }
    return 밖;
}

// ── 공유 글자표 ─────────────────────────────────────────────────────
// 이것만 통째로 든다. 재고 2,721줄에서 0.15MB(줄당 59바이트) — 20만 줄이면 11.5MB 쯤.
async function 공유글자(z, 칸) {
    const 밖 = [];
    if (!칸) return 밖;
    let 꼬리 = '';
    for await (const 조각 of 흘리기(z, 칸)) {
        const 글 = 꼬리 + 조각;
        const 쪼갬 = 글.split('</si>');
        꼬리 = 쪼갬.pop();
        for (const s of 쪼갬) {
            const a = s.indexOf('<si');
            밖.push(a < 0 ? '' : 티모으기(s.slice(a)));
        }
    }
    return 밖;
}

// ── 줄마다 ──────────────────────────────────────────────────────────
// 한줄마다(값배열, 줄차례) 를 부른다. false 를 돌려주면 거기서 멈춘다.
// ⚠ **한줄마다가 기다려 달라고 하면(프라미스) 기다린다.** 10-10 에 더했다 —
//    줄을 화베에 **흘려 담으려면** 500줄마다 쓰기를 기다려야 하기 때문이다.
//    안 기다리면 500줄 묶음이 손에 쌓여 23만 줄에서 터진다(그 탈로 한 번 당했다).
//    그냥 값을 돌려주는 옛 쓰임새는 그대로 돈다 — await 가 프라미스 아닌 것에는 거의 공짜다.
// 값은 **전부 글자**다 — 앞자리 0 과 날짜 모양을 지킨다 (이 집 규칙).
function 줄풀기(조각, 공유, 밖) {
    밖.length = 0;
    let i = 0;
    for (;;) {
        const a = 조각.indexOf('<c', i); if (a < 0) break;
        const 다음 = 조각.charCodeAt(a + 2);
        if (다음 !== 32 && 다음 !== 62 && 다음 !== 47) { i = a + 2; continue; }   // <cols> 따위
        const 머리끝 = 조각.indexOf('>', a); if (머리끝 < 0) break;
        const 머리 = 조각.slice(a, 머리끝);
        let 차례 = 밖.length;
        const mr = 머리.indexOf(' r="');
        if (mr > -1) { const e = 머리.indexOf('"', mr + 4); 차례 = 칸차례(머리.slice(mr + 4, e)); }
        if (차례 < 0) 차례 = 밖.length;
        let 값 = '';
        if (조각.charAt(머리끝 - 1) !== '/') {                                   // <c …/> 는 빈 칸
            const 끝 = 조각.indexOf('</c>', 머리끝);
            const 속 = 조각.slice(머리끝 + 1, 끝 < 0 ? 조각.length : 끝);
            const mt = 머리.indexOf(' t="');
            const 갈래 = mt > -1 ? 머리.slice(mt + 4, 머리.indexOf('"', mt + 4)) : '';
            if (갈래 === 's') {
                const v1 = 속.indexOf('<v>'), v2 = 속.indexOf('</v>', v1);
                if (v1 > -1 && v2 > -1) { const k = +속.slice(v1 + 3, v2); 값 = 공유[k] !== undefined ? 공유[k] : ''; }
            } else if (갈래 === 'inlineStr') {
                값 = 티모으기(속);
            } else {                                                              // str · b · e · 민 숫자
                const v1 = 속.indexOf('<v>'), v2 = 속.indexOf('</v>', v1);
                if (v1 > -1 && v2 > -1) 값 = 되돌리기(속.slice(v1 + 3, v2));
            }
            i = 끝 < 0 ? 조각.length : 끝 + 4;
        } else { i = 머리끝 + 1; }
        while (밖.length < 차례) 밖.push('');
        밖[차례] = 값;
    }
    return 밖;
}

async function 줄마다(ab, 한줄마다) {
    const z = 칸목록(ab);
    if (!z) throw new Error('엑셀로 열리지 않는 파일입니다 — 지퍼 꼴이 아닙니다.');
    const 시트칸 = z.목록.filter(x => /^xl\/worksheets\/sheet\d+\.xml$/i.test(x.이름))
        .sort((a, b) => b.푼 - a.푼)[0];                       // 가장 큰 시트 = 자료가 든 장
    if (!시트칸) throw new Error('이 파일에는 시트가 없습니다.');
    const 공유칸 = z.목록.find(x => /sharedStrings\.xml$/i.test(x.이름));
    const 공유 = await 공유글자(z, 공유칸);
    let 꼬리 = '', 차례 = 0, 멈춤 = false;
    const 값 = [];
    for await (const 조각 of 흘리기(z, 시트칸)) {
        if (멈춤) break;
        const 쪽들 = (꼬리 + 조각).split('<row');
        꼬리 = '<row' + 쪽들.pop();
        for (let k = 1; k < 쪽들.length; k++) {
            const e = 쪽들[k].indexOf('</row>');
            const 답 = 한줄마다(줄풀기(e < 0 ? 쪽들[k] : 쪽들[k].slice(0, e), 공유, 값), 차례++);
            if ((답 && typeof 답.then === 'function' ? await 답 : 답) === false) { 멈춤 = true; break; }
        }
    }
    if (!멈춤 && 꼬리.indexOf('<row') === 0) {
        const e = 꼬리.indexOf('</row>');
        if (e > -1) { const 답 = 한줄마다(줄풀기(꼬리.slice(0, e), 공유, 값), 차례++);
            if (답 && typeof 답.then === 'function') await 답; }
    }
    return { 줄수: 차례, 공유수: 공유.length, 시트: 시트칸.이름, 시트푼크기: 시트칸.푼 };
}

window.엑셀흘려읽기 = 있나 ? { 줄마다, 칸목록, 공유글자 } : null;
})();
