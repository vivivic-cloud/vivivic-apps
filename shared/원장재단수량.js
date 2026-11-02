/* ==========================================
   shared/원장재단수량.js — 원장 한 장에서 부속이 몇 개 나오나 (원장당 재단 수량)
   window.원장재단수량

   **한 벌이다.** 에이엠티 재단 편집·재단 자동계획과 영림원외주입력 BOM 소요량이
   같이 부른다. 베껴 두 벌로 만들지 않는다 — 여기를 고치면 두 집이 같이 바뀐다.
   (2026-11-01 에이엠티.html v1.63.0 의 _한장수량·_앉힐방향·updateBoardVisual 계산을 그대로 옮김)

   계산과 글만 한다. 파이어베이스·화면 칸에 쓰는 일은 부르는 집이 한다.
   결과를 다른 집으로 보내는 길(예: 에이엠티 재단 편집 → 영림원 BOM 대기 자료)은
   아래 「끼울 자리」 결과받기/결과보내기 로 붙인다. 지금은 아무도 보내지 않는다.
   ========================================== */
(function () {
    // 에이엠티 재단 편집 기본값: 4X8 원장, 전단컷 5mm, 톱날두께 4.5mm
    const 기본 = { 원장: '4X8', 전단컷: 5, 톱날: 4.5 };
    const 원장표 = { '4X8': { w: 2440, d: 1220 }, '3X6': { w: 1840, d: 920 } };

    // 재단 편집 「원장사이즈」 고르기 값 → mm. 3X6 이 아니면 4X8 (에이엠티 그대로)
    function 원장크기(size) {
        const b = size === '3X6' ? 원장표['3X6'] : 원장표['4X8'];
        return { w: b.w, d: b.d };
    }

    // 바둑판으로 앉힐 때 가로 몇 줄 · 세로 몇 줄. 값 검사 없이 식 그대로(재단 편집 도면이 쓴다)
    function 배치(w, d, BW, BD, fCut, bT) {
        return { cols: Math.floor((BW - fCut + bT) / (w + bT)),
                 rows: Math.floor((BD - fCut + bT) / (d + bT)) };
    }

    // 원장 한 장에 몇 개가 앉는지
    function 한장수량(w, d, BW, BD, fCut, bT) {
        if (!(w > 0) || !(d > 0)) return 0;
        const b = 배치(w, d, BW, BD, fCut, bT);
        return Math.max(0, b.cols) * Math.max(0, b.rows);
    }

    // 결보호가 'X'(결 없음)일 때만 돌려 앉힐 수 있다
    function 돌려도되나(grain) {
        return String(grain == null ? '' : grain).trim() === 'X';
    }

    // 눕혀서 더 많이 앉으면 그 방향. 결이 있으면 그대로.
    // 수량과 무관하게 '한 장에 더 많이 앉는 쪽'으로만 정한다.
    function 앉힐방향(w, d, grain, BW, BD, fCut, bT) {
        const 그대로 = 한장수량(w, d, BW, BD, fCut, bT);
        if (!돌려도되나(grain)) return { w, d, perSheet: 그대로, 돌림: false };
        const 돌려서 = 한장수량(d, w, BW, BD, fCut, bT);
        return 돌려서 > 그대로
            ? { w: d, d: w, perSheet: 돌려서, 돌림: true }
            : { w, d, perSheet: 그대로, 돌림: false };
    }

    // 「784*396」 「2440×1220」 「784x396」 → {w, d}. 못 읽으면 null
    function 크기읽기(글) {
        const m = String(글 == null ? '' : 글).match(/(\d+(?:\.\d+)?)\s*[*×xX]\s*(\d+(?:\.\d+)?)/);
        if (!m) return null;
        const w = parseFloat(m[1]), d = parseFloat(m[2]);
        return w > 0 && d > 0 ? { w, d } : null;
    }

    // 부속 1개 = 원장 1/n장.
    // 받는 것 { 부속:{w,d}, 원장:{w,d}, 결보호, 전단컷, 톱날 } (결보호를 모르면 돌리지 않는다)
    // 돌려주는 것 { n, 분자, 분모, 돌림, 근거 } 또는 { n:0, 이유 }
    function 소요량(o) {
        o = o || {};
        const p = o.부속, b = o.원장;
        if (!p || !(p.w > 0) || !(p.d > 0)) return { n: 0, 이유: '부속 크기를 모릅니다' };
        if (!b || !(b.w > 0) || !(b.d > 0)) return { n: 0, 이유: '원장 크기를 모릅니다' };
        const fCut = o.전단컷 != null ? o.전단컷 : 기본.전단컷;
        const bT = o.톱날 != null ? o.톱날 : 기본.톱날;
        const 방 = 앉힐방향(p.w, p.d, o.결보호, b.w, b.d, fCut, bT);
        if (!(방.perSheet > 0)) return { n: 0, 이유: '부속 ' + p.w + '×' + p.d + '이(가) 원장 ' + b.w + '×' + b.d + '보다 큽니다' };
        const n = 방.perSheet;
        return { n, 분자: 1, 분모: n, 돌림: 방.돌림,
                 근거: '원장 ' + b.w + '×' + b.d + '에서 ' + n + '개' + (방.돌림 ? '(돌려 앉힘)' : '') + ' → 1/' + n };
    }

    // 부속카드에 싣는 「원장 1장당 생산량」 — 재단 편집 기본규칙 그대로
    // (4X8 원장 · 전단컷 5 · 톱날 4.5 · 결보호 'X' 면 더 많이 앉는 쪽으로 돌림 = 자동계획과 같다).
    // 못 셈(크기 없음·원장보다 큼)이면 0. 조혼가구·에이엠티 부속카드가 부른다.
    function 원장당(w, d, grain) {
        return 소요량({ 부속: { w: parseFloat(w), d: parseFloat(d) }, 원장: 원장크기(기본.원장), 결보호: grain }).n;
    }

    /* ── 끼울 자리 ─────────────────────────────────────────────
       계산 결과를 다른 집이 받아 가는 길. 부품은 저장하지 않는다.
       예) 나중에 에이엠티 재단 편집이 확정할 때 결과보내기({부속코드, 원장, n, …}) →
           영림원외주입력이 결과받기 로 받아 erp_boms 대기 자료로 쌓는다(그 집이 쓴다).
       같은 창 안에서만 닿는다. 다른 프로그램(다른 탭)으로 가려면 받는 쪽이 저장소를 거친다. */
    const 받는곳 = [];
    function 결과받기(fn) {
        if (typeof fn === 'function') 받는곳.push(fn);
        return function () { const i = 받는곳.indexOf(fn); if (i >= 0) 받는곳.splice(i, 1); };
    }
    function 결과보내기(결과) {
        받는곳.slice().forEach(function (fn) { try { fn(결과); } catch (e) { console.error(e); } });
    }

    window.원장재단수량 = { 기본, 원장크기, 배치, 한장수량, 돌려도되나, 앉힐방향, 크기읽기, 소요량, 원장당, 결과받기, 결과보내기 };
})();
