/* ==========================================
   shared/자재매입순위.js — 자재별 매입 누계 순위 (드롭다운 차례용)
   window.자재매입순위

   사장님 11-21(그대로):
   「드롭다운 표기순위를 발주역입력 보드엣지매입현황의 거래처별 누계 순위별(즉 많이자주 매입하는 순위)로」
   「한번의 결과가 아닌 이곳에서 명세가 누적될수록 변하는 통계 정보를 유할 수 있도록 조치해 주세요」
   「해피코는 명세에 단가가 입력되지 않아 누계가 없으나 입력된 월별 발주 수량으로 가늠할 수 있으니 이를 바탕으로 누계를 먼저 만들고 이를 적용해주세요」

   **자료실(발주역입력_자재매입순위/누계)** 에 순위를 두고 드롭다운은 그것만 읽는다(구독). 자료실은 매입현황 페이지가 자료실지킴 으로
   명세가 바뀔 때마다 다시 셈해 갱신한다(아래 「자료실」). 셈은 늘 지금 명세 전체에서 — 한 번짜리 결과를 고정하지 않는다.
   셈이 읽는 곳(모두 공개 창고, 익명으로 읽힘):
     · 발주역입력_보드매입/{거래처 시트}  표[이름='월별'] 줄 = 명세(납품제품명(품목)·규격·수량·공급가액 — 현진·현준은 별도 공급가액)
     · 발주역입력_중국엣지/해피코          줄 = 해피코 입고 명세(제품명·옵션·수량(M) — 단가·금액 빈칸)
     · 발주역입력_영림원폼/{거래처}        연결 = 명세서 표기 → 영림원보내기 줄(자재번호·자재명) · 결과.{줄}.자재.자재번호 = 입력폼 등록 자재번호
   자재 잇기 = 보드매입현황 「월별 명세서 자재명·자재번호」(v1.36.0 등록자재표)와 같은 길:
     명세 줄 품목+규격 → 열쇠(NFKC·빈칸 뺌·소문자, 보드매입현황 표기열쇠 그대로) → 그 거래처 `연결` →
     자재번호 = 결과[줄품목⇥줄규격].자재.자재번호(입력폼이 쓴 것) 없으면 연결.자재번호(영림원보내기 값). 해피코 동일품은 연결에 「동일품」 으로 이미 대표 줄을 가리킴.
   점수: 국내 = 공급가액 누계(원) · 해피코 = 수량(M) 누계(단가가 없어서). 같으면 횟수(명세 줄 수)·달 수가 많은 쪽 = 「자주」.
   화면은 안 그린다. 창고 쓰기는 자료실지킴 하나뿐(자료실 문서 하나).
   ========================================== */
(function (g) {
    'use strict';
    const 자리 = ['artifacts', 'vivivic-4b7ef', 'public', 'data'];
    const 해피코 = '해피코';
    const 트 = v => String(v == null ? '' : v).trim();
    const 표기열쇠 = (품목, 규격) => [품목, 규격].map(t => String(t == null ? '' : t).normalize('NFKC').replace(/\s+/g, '').toLowerCase()).join('|');
    const 번열쇠 = c => 트(c).normalize('NFKC').toLowerCase();
    const 명열쇠 = n => 트(n).normalize('NFKC').replace(/\s+/g, '').toLowerCase();
    // 엑셀 표시 꼴 숫자 → 수: 「1,234」 「(1,234)」(음수) 「-」(0)
    function 수(s) {
        s = 트(s).replace(/,/g, ''); if (s === '' || s === '-') return 0;
        const m = s.match(/^\((.*)\)$/); return m ? -Number(m[1]) || 0 : Number(s) || 0;
    }

    // 명세 줄 → 표기별 누계 { 열쇠: {품목, 규격, 금액, 수량, 횟수, 달:Set} }
    function 국내누계(시트) {
        const t = ((시트 && 시트.표) || []).find(x => x.이름 === '월별'); if (!t) return new Map();
        const 칸 = t.칸 || [], 찾 = (...a) => a.map(k => 칸.indexOf(k)).find(i => i >= 0);
        const 품 = 찾('납품제품명(품목)'), 규 = 찾('규격'), 량 = 찾('수량');
        const 금 = 칸.includes('별도 공급가액(원)') ? 칸.indexOf('별도 공급가액(원)') : 칸.indexOf('공급가액(원)');
        const 모 = new Map(); if (품 == null) return 모;
        for (const z of (t.줄 || [])) {
            if (z.소) continue;
            const v = z.v || [], 이름 = 트(v[품]);
            if (!이름 || 이름 === '(구매내역 없음)' || /^\[.*(소계|총계)\]$/.test(이름)) continue;
            const 규격 = 규 == null ? '' : 트(v[규]), k = 표기열쇠(이름, 규격);
            if (!모.has(k)) 모.set(k, { 품목: 이름, 규격, 금액: 0, 수량: 0, 횟수: 0, 달: new Set() });
            const m = 모.get(k); m.금액 += 금 >= 0 ? 수(v[금]) : 0; m.수량 += 량 == null ? 0 : 수(v[량]); m.횟수++; if (z.월) m.달.add(z.월);
        }
        return 모;
    }
    function 해피코누계(d) {
        const 칸 = (d && d.칸) || [], i = k => 칸.indexOf(k), 품 = i('제품명'), 규 = i('옵션'), 량 = i('수량(M)');
        const 모 = new Map(); if (품 < 0) return 모;
        for (const z of ((d && d.줄) || [])) {
            const v = z.v || [], 이름 = 트(v[품]); if (!이름) continue;
            const 규격 = 규 < 0 ? '' : 트(v[규]), k = 표기열쇠(이름, 규격);
            if (!모.has(k)) 모.set(k, { 품목: 이름, 규격, 금액: 0, 수량: 0, 횟수: 0, 달: new Set() });
            const m = 모.get(k); m.수량 += 량 < 0 ? 0 : 수(v[량]); m.횟수++; if (z.월) m.달.add(z.월);
        }
        return 모;
    }

    /* 셈 — 받은 자료로 자재별 누계를 만든다(순수 함수, 시험에도 씀).
       받는 것 { 보드매입:{시트이름: 문서}, 해피코: 문서, 영림원폼:{거래처: 문서} }
       돌려주는 것 { 자재:[통계], 못이음:[통계] }
         통계 = { 자재번호, 자재명, 거래처, 해피코(참/거짓), 점수, 금액, 수량, 횟수, 달수, 표기:[ '품목⇥규격' ] , 대분류 } */
    function 셈(자료) {
        자료 = 자료 || {};
        const 폼 = 자료.영림원폼 || {}, 모두 = new Map(), 못 = [];
        const 거래처들 = Object.keys(자료.보드매입 || {}).filter(s => s !== '총괄요약' && !s.startsWith('_'));
        const 넣기 = (s, 누, 해) => {
            const f = 폼[s] || {}, 결 = f.결과 || {}, 연 = new Map();
            for (const x of (f.연결 || [])) if (x && x.열쇠 && !연.has(x.열쇠)) 연.set(x.열쇠, x);
            const 분류 = new Map();   // 줄 → 대분류(보내기)
            for (const z of (((f.보내기 || {}).줄) || [])) 분류.set(z.열쇠, 트(((z.분류 || {}).대분류)));
            for (const [k, m] of 누) {
                const x = 연.get(k), 줄 = x ? x.줄품목 + '\t' + x.줄규격 : '';
                const 자 = x && (결[줄] || {}).자재;
                const 번 = 트((자 && 자.자재번호) || (x && x.자재번호)), 명 = 트(x && x.자재명);
                const 열 = 번 ? '번\t' + 번열쇠(번) : 명 ? '명\t' + 명열쇠(명) : '';
                if (!열) { 못.push({ 거래처: s, 해피코: 해, 표기: [m.품목 + '\t' + m.규격], 금액: m.금액, 수량: m.수량, 횟수: m.횟수, 달수: m.달.size, 점수: 해 ? m.수량 : m.금액 }); continue; }
                if (!모두.has(열)) 모두.set(열, { 자재번호: 번, 자재명: 명, 거래처: s, 해피코: 해, 금액: 0, 수량: 0, 횟수: 0, 달: new Set(), 표기: [], 대분류: 분류.get(줄) || '' });
                const a = 모두.get(열); a.금액 += m.금액; a.수량 += m.수량; a.횟수 += m.횟수; m.달.forEach(d => a.달.add(d)); a.표기.push(m.품목 + '\t' + m.규격);
                if (a.거래처 !== s && !a.거래처.split('·').includes(s)) a.거래처 += '·' + s;
            }
        };
        for (const s of 거래처들) 넣기(s, 국내누계(자료.보드매입[s]), false);
        if (자료.해피코) 넣기(해피코, 해피코누계(자료.해피코), true);
        const 자재 = [...모두.values()].map(a => ({ ...a, 달수: a.달.size, 달: undefined, 점수: a.해피코 ? a.수량 : a.금액 }));
        자재.forEach(a => delete a.달);
        return { 자재, 못이음: 못 };
    }

    /* ── 자료실 (11-21 사장님 「매번세지 않아도 이를 위해 알수 있는 실시간 연동되는 자료실을 따로 만들어 두어도 좋습니다.」) ──
       자리 = artifacts/vivivic-4b7ef/public/data/발주역입력_자재매입순위/누계 (공개 창고 — 익명 읽기·쓰기 되는 자리, 규칙 바꿀 것 없음.
              erp_* 는 담당자 로그인만 쓸 수 있어 매입현황(익명)이 못 씀)
       꼴 = { 판, 고친때, 원본:{보드매입파일, 보드매입읽은날, 해피코읽은날}, 못이음, 자재:[{자재번호, 자재명, 거래처, 해피코, 순위, 횟수, 달수, 대분류}] }
         순위 = 무리 안 차례(국내 = 공급가액 누계 큰 차례 · 해피코 = 수량(M) 누계 큰 차례, 같으면 횟수·달수). **금액·수량은 안 넣는다**(공개 자리).
       쓰는 집 = 자료실지킴 을 부르는 페이지(보드/엣지 매입현황) — 명세·연결·결과가 바뀌면 다시 셈해 다를 때만 씀.
       읽는 집 = 구독 → 자재순위·정렬(드롭다운). */
    const 자료실 = [...자리, '발주역입력_자재매입순위', '누계'];
    // 칸 차례와 무관한 글(창고는 칸 차례를 바꿔 돌려줌 — 그대로 견주면 늘 「다름」)
    const 고른글 = v => JSON.stringify(v, (k, x) => x && typeof x === 'object' && !Array.isArray(x) ? Object.keys(x).sort().reduce((o, j) => (o[j] = x[j], o), {}) : x);
    function 자료실꼴(지, 원본) {
        const 무리 = 해 => 지.자재.filter(a => a.해피코 === 해).sort(견줌(false));
        const 줄 = [];
        for (const 해 of [false, true]) 무리(해).forEach((a, i) => 줄.push({ 자재번호: a.자재번호, 자재명: a.자재명, 거래처: a.거래처, 해피코: a.해피코, 순위: i + 1, 횟수: a.횟수, 달수: a.달수, 대분류: a.대분류 || '' }));
        return { 원본, 못이음: 지.못이음.length, 자재: 줄 };
    }

    // 견주기(셈 결과): 점수 · 횟수 · 달수 큰 차례
    const 견줌 = () => (a, b) => b.점수 - a.점수 || b.횟수 - a.횟수 || b.달수 - a.달수;
    // 견주기(자료실 줄): 해피코먼저면 해피코 무리 → 국내, 아니면 국내 → 해피코, 그다음 순위
    const 줄견줌 = 해먼저 => (a, b) => ((a.해피코 ? 1 : 0) - (b.해피코 ? 1 : 0)) * (해먼저 ? -1 : 1) || a.순위 - b.순위;

    let 지금 = { 자재: [], 판: 0 }, 번표 = new Map(), 명표 = new Map(), 다옴 = false;
    const 듣는곳 = [];
    function 표다시() {
        번표 = new Map(); 명표 = new Map();
        for (const a of 지금.자재 || []) {
            if (a.자재번호) { const k = 번열쇠(a.자재번호); if (!번표.has(k) || 줄견줌(false)(a, 번표.get(k)) < 0) 번표.set(k, a); }
            if (a.자재명) { const k = 명열쇠(a.자재명); if (!명표.has(k) || 줄견줌(false)(a, 명표.get(k)) < 0) 명표.set(k, a); }
        }
    }
    // 자재 하나의 자료실 줄(없으면 null). 자재 = {code, name} 또는 {자재번호, 자재명}
    function 통계(m) {
        if (!m) return null;
        const 번 = 트(m.code != null ? m.code : m.자재번호), 명 = 트(m.name != null ? m.name : m.자재명);
        return (번 && 번표.get(번열쇠(번))) || (명 && 명표.get(명열쇠(명))) || null;
    }

    /* 자재순위(자재목록, {해피코먼저}) → Map(자재번호 → {순위, 무리순위, 해피코, 거래처, 자재명, 횟수, 달수})
       자재목록 = [{code, name}] (입력폼 erp_materials 꼴) 또는 [{자재번호, 자재명}].
       순위 = 그 목록 안에서 1부터(해피코먼저 = 해피코 자재를 맨 위로 — 엣지 드롭에 씀). 자료실에 없는 자재는 Map 에 없음. */
    function 자재순위(목록, 옵션) {
        const 해먼저 = !!(옵션 && 옵션.해피코먼저), 있는 = [];
        for (const m of (목록 || [])) {
            const 번 = 트(m && (m.code != null ? m.code : m.자재번호)); if (!번) continue;
            const t = 통계(m); if (t) 있는.push([번, t]);
        }
        있는.sort((x, y) => 줄견줌(해먼저)(x[1], y[1]));
        const 결과 = new Map();
        있는.forEach(([번, t]) => { if (!결과.has(번)) 결과.set(번, { 순위: 결과.size + 1, 무리순위: t.순위, 해피코: t.해피코, 거래처: t.거래처, 자재명: t.자재명, 횟수: t.횟수, 달수: t.달수 }); });
        return 결과;
    }
    // 정렬(목록, 옵션) → 같은 목록을 순위 차례로(자료실에 없는 자재는 뒤에, 원래 차례 그대로)
    function 정렬(목록, 옵션) {
        const 순 = 자재순위(목록, 옵션), 키 = m => 트(m && (m.code != null ? m.code : m.자재번호));
        return (목록 || []).map((m, i) => [m, i]).sort((a, b) => {
            const x = 순.get(키(a[0])), y = 순.get(키(b[0]));
            return (x ? x.순위 : 1e9) - (y ? y.순위 : 1e9) || a[1] - b[1];
        }).map(a => a[0]);
    }

    /* 구독(db, fb, 받으면) — 읽는 집(드롭다운). 자료실 문서 하나만 onSnapshot. fb = {doc, onSnapshot}(window.fbRead 꼴).
       자료실이 바뀔 때마다 받으면(자료실 문서). 돌려주는 것 = 끄기 함수. 여러 번 불러도 창고 구독은 한 벌. */
    let 구독중 = null;
    function 구독(db, fb, 받으면) {
        if (typeof 받으면 === 'function') { 듣는곳.push(받으면); if (다옴) { try { 받으면(지금); } catch (e) { console.error(e); } } }
        if (!구독중) {
            구독중 = fb.onSnapshot(fb.doc(db, ...자료실), d => {
                지금 = d.exists() ? d.data() : { 자재: [], 판: 0 }; 표다시(); 다옴 = true;
                듣는곳.slice().forEach(f => { try { f(지금); } catch (e) { console.error(e); } });
            }, e => console.warn('자재매입순위 자료실 못 읽음', e));
        }
        return function () { const i = 듣는곳.indexOf(받으면); if (i >= 0) 듣는곳.splice(i, 1); };
    }

    /* 자료실지킴(db, fb) — 쓰는 집(보드/엣지 매입현황). fb = {collection, doc, onSnapshot, setDoc}.
       명세(보드매입·해피코)·영림원폼(연결·결과·보내기)이 바뀔 때마다 셈해 자료실과 다를 때만 setDoc(통째). 처음 부르면 지금까지 명세로 채움.
       돌려주는 것 = 끄기 함수. 한 창에서 한 번만 돈다. */
    let 지킴중 = null;
    function 자료실지킴(db, fb) {
        if (지킴중) return 지킴중;
        const 자료 = { 보드매입: {}, 해피코: null, 영림원폼: {} }, 옴 = { 보: false, 해: false, 폼: false, 실: false };
        let 있는글 = null, 있는판 = 0, 원본 = {}, 틀 = null, 쓰는중 = false;
        const 다시 = () => {
            if (!(옴.보 && 옴.해 && 옴.폼 && 옴.실)) return;
            clearTimeout(틀); 틀 = setTimeout(async () => {
                const 꼴 = 자료실꼴(셈(자료), 원본), 글 = 고른글(꼴);
                if (글 === 있는글 || 쓰는중) return;
                쓰는중 = true;
                try { await fb.setDoc(fb.doc(db, ...자료실), { ...꼴, 판: 있는판 + 1, 고친때: new Date().toISOString() }); 있는글 = 글; }
                catch (e) { console.warn('자재매입순위 자료실 못 씀', e); }
                finally { 쓰는중 = false; }
            }, 800);
        };
        const 끈 = [];
        끈.push(fb.onSnapshot(fb.doc(db, ...자료실), d => {
            const v = d.exists() ? d.data() : null; 있는판 = (v && v.판) || 0;
            있는글 = v ? 고른글({ 원본: v.원본, 못이음: v.못이음, 자재: v.자재 }) : null; 옴.실 = true; 다시();
        }, () => { 옴.실 = true; 다시(); }));
        끈.push(fb.onSnapshot(fb.collection(db, ...자리, '발주역입력_보드매입'), q => {
            자료.보드매입 = {}; const 목 = q.docs.find(d => d.id === '_목록'), 목값 = 목 ? 목.data() : {}, 시트 = 목값.시트들;
            q.docs.forEach(d => { if (!d.id.startsWith('_') && (!시트 || 시트.includes(d.id))) 자료.보드매입[d.id] = d.data(); });
            원본 = { ...원본, 보드매입파일: 트(목값.파일), 보드매입읽은날: 트(목값.읽은날) };
            옴.보 = true; 다시();
        }, () => { 옴.보 = true; 다시(); }));
        끈.push(fb.onSnapshot(fb.doc(db, ...자리, '발주역입력_중국엣지', 해피코), d => {
            자료.해피코 = d.exists() ? d.data() : null; 원본 = { ...원본, 해피코읽은날: 트(자료.해피코 && 자료.해피코.읽은날) }; 옴.해 = true; 다시();
        }, () => { 옴.해 = true; 다시(); }));
        끈.push(fb.onSnapshot(fb.collection(db, ...자리, '발주역입력_영림원폼'), q => {
            자료.영림원폼 = {}; q.docs.forEach(d => { if (!d.id.startsWith('_')) 자료.영림원폼[d.id] = d.data(); }); 옴.폼 = true; 다시();
        }, () => { 옴.폼 = true; 다시(); }));
        지킴중 = () => { 끈.forEach(f => f()); clearTimeout(틀); 지킴중 = null; };
        return 지킴중;
    }

    g.자재매입순위 = { 셈, 자료실꼴, 자재순위, 정렬, 통계, 구독, 자료실지킴, 지금: () => 지금, 자료실자리: 자료실.join('/'), 표기열쇠 };
})(window);
