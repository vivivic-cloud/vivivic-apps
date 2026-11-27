/* 발주역입력 표 입력 — 모든 입력 표가 같게 움직이는 공통 파일(11-21 — 보드매입현황 v1.41.0 · 영림원품목등록 v2.35.0 부터)
   사장님(그대로): 「그냥 입력값 플러스 버튼으로 드레그 하면 복사되게 하고 방향키로 이동시 즉시 입력가능 상황 만들어 주세요.
                  그리고 한번 입련된건 기억해서 드롭다운 목록에 나타나게 해주세요」
   v8(11-27): 드롭 칸 ▾ = 칸 안 글자 끝 바로 뒤(글을 가리지 않게) — 세모그리기 · 글범위.
   v8.1~2(11-27): td.드롭칸 오른쪽 여백 28px(터치 36px) = ▾ 자리 + 손잡이 비킴 — 글이 칸을 꽉 채워도 글 끝 뒤 칸 안에 ▾ · + 손잡이 안 가림.
   v9(11-27): 사장님 「야 모든 드롭선택 버튼 입력된 텍스트 좀 안 가리게 해야. 전부 적용 좀 해. 텍스트 끝에 셀 안에 두라니까」 —
     ① 칸 안 입력 상자·고르기(select)의 글도 잼(전엔 td 글만 → 보드매입현황 칸은 ▾ 가 칸 오른쪽 위 = 글 위) ② 목록(원래 목록·기억)이 있는 열 = 그 열 입력 칸 모두 td.세모자리(드롭칸과 같은 오른쪽 여백)
     — 표를 등록할 때 · 기억을 처음 받을 때 한 번(그 뒤 입력으로 열이 바뀌지 않게) ③ 빈 칸 = 글 시작 자리 ④ 글 끝 뒤에 자리가 없으면(여백이 없는 칸) ▾ 안 그림(목록은 글 치기·Alt+↓) — 글 위에 절대 안 그림.
     ▾ 가 뜬 칸 = td.표입력세모칸(드롭끝.js 의 select·datalist ▾ 가 같은 자리에 둘 겹치지 않게).
   v9.2(11-27): 칸 높이 ≥ ▾ 높이 + 8 이면 ▾ 가 + 손잡이(아래 모서리)와 위아래로 안 겹침 → 오른쪽 끝 2px 까지 씀(여백 0 칸의 고르기 상자에서 ▾ 가 안 뜨던 것).
   v9.1(11-27): 칸 안 입력 상자·고르기도 ▾ 자리(상자 오른쪽 여백 28px — 보드매입현황 td 여백 0 이라 v9 자리가 안 생겼음) · 크롬이 font 빈 글이면 글꼴 조각으로 잼.
   ① 누름 = 칸 고름만(파란 틀 — 드롭 안 열림) · 칸 안 끌기·Shift+누름 = 범위만 · 고른 칸 오른쪽 아래 모서리 「+」 를 위·아래·옆으로 끌면 그 값(범위면 그 차례대로 되풀이) 복사.
      드롭 목록은 셋일 때만 열림: 칸 오른쪽 위 작은 ▾(목록이 있는 칸, + 와 안 겹침) · 글자 치기(친 글로 거름) · Alt+↓. 칸 밖 누름·끌기 시작·+ 끌기·Esc = 바로 닫힘(사장님 11-21 「드레그랑 드롭다운박스랑 클릭 겹쳐서」).
   ② 방향키·Enter·Tab = 칸 옮김(Shift = 반대·범위) · 옮긴 칸에서 바로 글자를 치면 그 칸 입력(한글 조합 포함) · Enter = 넣고 아래 · Tab = 넣고 옆 ·
      Esc = 취소 · Delete/Backspace = 범위 지움 · F2·두 번 누름 = 지금 값 고치기 · Ctrl/⌘+C·V = 범위 복사·붙여넣기(엑셀 탭 글 그대로).
   ③ 입력한 값 기억 → 고칠 때 드롭 목록: 그 열 원래 목록(있으면 그 차례 그대로) 뒤에 기억 값(자주 쓴 차례). 원래 목록이 없던 칸도 기억 값으로 드롭이 생김.
      기억 = 창고 artifacts/vivivic-4b7ef/public/data/발주역입력_입력기억/{쪽} {열:{열 이름:{값:횟수}}} — 다른 기기도 같음(onSnapshot).
   ④ 폰(터치) = 터치범위.js(누름 고름 · 동그라미 손잡이 · 복사/붙여넣기/채우기/지우기 띠) 그대로 + 고른 칸을 한 번 더 누르면 이 파일 고치기 칸(기억 드롭 포함).
   ⑤ 입력 칸이 아닌 칸은 안 씀(막음 칸 = 쪽 알림). 저장은 쪽 코드(어.쓰기 — 쪽이 원래 쓰던 길).
   쓰는 법: 표입력.쪽('보드매입현황') 한 번 → 표를 그릴 때마다 표입력.표(table, 어)
     어 = { 이름:'표 이름(다시 그려도 같음)', 칸: td => 입력 칸인가, 읽기: td => 값, 쓰기: [[td, 값]…] => 저장,
            막음?: td => bool, 알림?: td => (), 열?: td => 기억 열 이름(없으면 머리 글자), 목록?: td => [글 | {v, 글?(흐린 곁글), 덧?(초록 덧글 — 구매처 등), 맞음?(파랑 띠), title?}], 목록만?: td => bool } */
(function(){
  if(window.표입력) return;
  const 꼴 = document.createElement('style');
  꼴.textContent =
    '.표입력틀{position:fixed;z-index:30;border:2px solid #1565c0;background:rgba(21,101,192,.07);pointer-events:none;box-sizing:border-box;display:none}' +
    '.표입력채움{position:fixed;z-index:31;border:1px dashed #1565c0;pointer-events:none;box-sizing:border-box;display:none}' +
    '.표입력손{position:fixed;z-index:33;width:11px;height:11px;margin:-6px 0 0 -6px;display:none;align-items:center;justify-content:center;background:#1565c0;color:#fff;border:1px solid #fff;border-radius:3px;font:700 10px/1 -apple-system,sans-serif;cursor:crosshair;user-select:none;-webkit-user-select:none}' +
    '.표입력칸{position:fixed;z-index:34;box-sizing:border-box;margin:0;border:2px solid #1565c0;border-radius:0;outline:none;background:#fff;color:#1A1A19;font:11.5px/1.3 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",system-ui,sans-serif;padding:1px 4px}' +
    '.표입력칸.숨음{opacity:0;caret-color:transparent;pointer-events:none}' +
    '@media (pointer:coarse){.표입력칸{font-size:16px}}' +
    '.표입력세모{position:fixed;z-index:35;width:15px;height:12px;display:none;align-items:center;justify-content:center;background:#fff;color:#1565c0;border:1px solid #1565c0;border-radius:3px;font:700 9px/1 -apple-system,sans-serif;cursor:pointer;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}' +
    '@media (pointer:coarse){.표입력세모{width:22px;height:18px;font-size:12px}}' +
    'table td.드롭칸,table td.세모자리{padding-right:28px}@media (pointer:coarse){table td.드롭칸,table td.세모자리{padding-right:36px}}' +
    'table td.세모자리 select,table td.세모자리 input:not([type=checkbox]):not([type=radio]){padding-right:28px!important}@media (pointer:coarse){table td.세모자리 select,table td.세모자리 input:not([type=checkbox]):not([type=radio]){padding-right:36px!important}}' +   /* v9.1 칸 안 입력 상자 = 상자 안에 ▾ 자리(쪽이 td 여백 0 으로 둔 표) */   /* v9 세모자리 = 목록 있는 열 */   /* v8.1~2 드롭 칸 오른쪽 = ▾ 자리 + 손잡이 비킴(늘 — 고를 때 열이 안 바뀜) → 글 끝 뒤에 ▾ */
    '.표입력목록{position:fixed;z-index:50;background:#fff;border:1px solid #C7C7C3;border-radius:6px;box-shadow:0 4px 14px rgba(0,0,0,.12);max-height:260px;overflow:auto;min-width:140px;padding:3px 0;font-size:12px;display:none}' +
    '.표입력목록 div{padding:4px 10px;white-space:nowrap;cursor:pointer;border-left:3px solid transparent}' +
    '.표입력목록 div:hover,.표입력목록 div.지금{background:#F4F4F2}' +
    '.표입력목록 div.맞음{border-left-color:#1565c0}' +
    '.표입력목록 div.기억{color:#1565c0}' +
    '.표입력목록 div .곁{color:#9C9C98;margin-left:6px}' +
    '.표입력목록 div .덧{color:#2e5a1e;font-weight:600;margin-left:8px}';
  document.head.appendChild(꼴);
  const 만들 = (tag, cls) => { const e = document.createElement(tag); e.className = cls; return e; };
  const 틀 = 만들('div', '표입력틀'), 채틀 = 만들('div', '표입력채움'), 손 = 만들('div', '표입력손'), 목록 = 만들('div', '표입력목록'), 세모 = 만들('div', '표입력세모');
  세모.textContent = '▾';
  const 칸 = 만들('input', '표입력칸 숨음'); 칸.autocomplete = 'off'; 칸.spellcheck = false; 칸.setAttribute('autocapitalize', 'off');
  손.textContent = '+';
  const 붙임 = () => { if(!틀.isConnected) document.body.append(틀, 채틀, 손, 칸, 세모, 목록); };
  if(document.body) 붙임(); else document.addEventListener('DOMContentLoaded', 붙임);

  /* ── 표 등록 ── */
  const 어들 = new WeakMap(), 이름표 = new Map();   // 이름 → 지금 table (다시 그리면 바뀜)
  let 쪽이름 = '', 기억 = {}, 기억받음 = false, 기억더할 = {}, 기억틀 = 0;
  const 창고 = () => window.db && window.fbRead && window.fbRead.doc;
  const 기억문서 = () => window.fbRead.doc(window.db, 'artifacts', 'vivivic-4b7ef', 'public', 'data', '발주역입력_입력기억', 쪽이름);
  function 기억구독(){
    if(기억받음 || !쪽이름) return;
    if(!창고() || !window.fbRead.onSnapshot){ setTimeout(기억구독, 800); return; }
    기억받음 = true;
    try{ window.fbRead.onSnapshot(기억문서(), d => { 기억 = (d.exists() && d.data().열) || {};
      if(기억처음){ 기억처음 = false; for(const t of 이름표.values()) 자리달기(t); } }, () => {}); }catch(e){}   /* v9 기억 처음 받음 = 기억 열도 ▾ 자리 */
  }
  function 기억하기(열, 값들){
    if(!열) return;
    for(const v0 of 값들){ const v = String(v0 ?? '').trim(); if(!v || v.length > 200) continue;
      const 칸들 = (기억더할[열] ||= {}); 칸들[v] = (칸들[v] || 0) + 1; }
    clearTimeout(기억틀); 기억틀 = setTimeout(기억저장, 600);
  }
  async function 기억저장(){
    const 더 = 기억더할; 기억더할 = {};
    if(!Object.keys(더).length || !창고() || !window.fbRead.setDoc || !쪽이름) return;
    const 보낼 = {};
    for(const [열, 칸들] of Object.entries(더)){ 보낼[열] = {}; for(const [v, n] of Object.entries(칸들)){ const 옛 = ((기억[열] || {})[v]) || 0; 보낼[열][v] = 옛 + n; (기억[열] ||= {})[v] = 옛 + n; } }
    try{ await window.fbRead.setDoc(기억문서(), { 열:보낼, 고친때:new Date().toISOString() }, { merge:true }); }catch(e){}
  }
  function 머리글(td){   /* 열 이름 기본 = 그 칸 위 머리 글자(머리 한 줄 표) */
    const t = td.closest('table'), 머 = t.tHead && t.tHead.rows[t.tHead.rows.length - 1];
    return 머 && 머.cells.length === td.parentNode.cells.length ? 머.cells[td.cellIndex].textContent.trim() : '';
  }
  const 열이름 = (어, td) => (어.열 ? 어.열(td) : 머리글(td)) || '';
  function 등록(t, 어0){
    if(!t) return;
    const 원쓰기 = 어0.쓰기;
    const 어 = Object.assign({}, 어0, { 쓰기: 목 => {
      const 열별 = {};
      for(const [td, v] of 목){ const 열 = 열이름(어0, td); if(!열) continue;
        if(어0.목록만 && 어0.목록만(td)) continue;   /* 목록 밖 값을 못 넣는 칸은 기억 안 함 */
        (열별[열] ||= []).push(v); }
      for(const [열, 값들] of Object.entries(열별)) 기억하기(열, [...new Set(값들.map(v => String(v ?? '').trim()))]);
      원쓰기(목);
    } });
    어들.set(t, 어);
    if(어0.이름){ const 옛 = 이름표.get(어0.이름); 이름표.set(어0.이름, t); if(지금 && 지금.표 === 옛 && 옛 !== t) 바꿔끼움(t); }
    if(window.터치범위) 터치범위.표(t, 어);
    자리달기(t);   /* v9 */
    기억구독();
  }

  /* ── 고름 ── */
  let 지금 = null, 편집 = null, 끌기 = null, 채우기 = null, 그림틀 = 0, 고른줄 = null;   /* v7 고른 칸 줄 = tr.표입력줄(모양은 쪽 CSS) */
  const 줄표시 = tr => { if(tr === 고른줄) return; if(고른줄) 고른줄.classList.remove('표입력줄'); if(tr) tr.classList.add('표입력줄'); 고른줄 = tr || null; };   // 지금 = {표, 어, r0,c0,r1,c1, ar,ac(머리 칸)}
  const 줄들 = t => t.tBodies[0] ? [...t.tBodies[0].rows] : [];
  const 보임 = td => !!td && td.offsetParent !== null && !td.parentNode.hidden;
  /* 11-26 합친 칸(rowspan) 표 = 보이는 열 자리로 셈(영림원품목등록 공통반자재 탭) — 사장님 「입력될 때마다 화면 꺼떡거리는 게 입력 내용이 다른 위치에 적용되면서 그런 거지?」.
     전엔 칸 번호(cellIndex)로 세어 합친 칸이 있는 줄에선 Enter·방향키·붙여넣기·채우기가 다른 열로 갔음. 합친 칸 없는 표는 전과 같음(열 자리 = 칸 번호). */
  const 격자표 = new WeakMap();
  function 격자(t){ const 줄 = 줄들(t), 열쇠 = 줄.length + ':' + (t.tBodies[0] ? t.tBodies[0].children.length : 0) + ':' + (t.dataset.꼴 || '');
    const 옛 = 격자표.get(t); if(옛 && 옛.열쇠 === 열쇠 && 옛.줄[0] === 줄[0] && 옛.줄[줄.length - 1] === 줄[줄.length - 1]) return 옛;
    const g = [], 자리 = new Map();
    줄.forEach((tr, r) => { g[r] = g[r] || []; let c = 0; for(const td of tr.cells){ while(g[r][c]) c++; const rs = Math.max(1, td.rowSpan || 1), cs = Math.max(1, td.colSpan || 1);
      for(let i = 0; i < rs; i++){ g[r + i] = g[r + i] || []; for(let j = 0; j < cs; j++) g[r + i][c + j] = td; } 자리.set(td, [r, c]); c += cs; } });
    const o = { 열쇠, 줄, g, 자리 }; 격자표.set(t, o); return o; }
  const 열of = td => { const t = td.closest('table'), x = 격자(t).자리.get(td); return x ? x[1] : td.cellIndex; };
  const 칸at = (r, c) => { const x = 격자(지금.표).g[r]; return x ? x[c] || null : null; };
  const 범위 = () => [Math.min(지금.r0, 지금.r1), Math.min(지금.c0, 지금.c1), Math.max(지금.r0, 지금.r1), Math.max(지금.c0, 지금.c1)];
  function 칸판(b){   /* 범위 안 보이는 칸 [[td…]…] */
    const [r0, c0, r1, c1] = b || 범위(), 줄 = 줄들(지금.표), 판 = [];
    for(let r = r0; r <= r1; r++){ const tr = 줄[r]; if(!tr || tr.hidden) continue;
      const 줄칸 = [], 격 = 격자(지금.표); for(let c = c0; c <= c1; c++){ const td = (격.g[r] || [])[c]; if(td && 보임(td) && !줄칸.includes(td) && 격.자리.get(td)[0] === r) 줄칸.push(td); } if(줄칸.length) 판.push(줄칸); }
    return 판;
  }
  function 바꿔끼움(t){ if(!지금) return; 지금.표 = t; 지금.어 = 어들.get(t); 다시(); }
  function 고르기(td, 넓힘){
    const t = td.closest('table'), 어 = 어들.get(t); if(!어) return;
    const r = 줄들(t).indexOf(td.parentNode), c = 열of(td);
    if(넓힘 && 지금 && 지금.표 === t){ 지금.r1 = r; 지금.c1 = c; }
    else 지금 = { 표:t, 어, r0:r, c0:c, r1:r, c1:c };
    그리기(); 초점();
  }
  function 풀기(){ if(편집) 끝내기(true); 지금 = null; 줄표시(null); [틀, 채틀, 손, 세모, 목록].forEach(e => e.style.display = 'none'); 칸.classList.add('숨음'); if(document.activeElement === 칸) 칸.blur(); }
  function 초점(){ if(!지금) return; 칸위치(); if(document.activeElement !== 칸) 칸.focus({ preventScroll:true }); }
  const 머칸 = () => 칸at(지금.r0, 지금.c0);

  function 보이는틀(L, T, R, B){   /* 표 상자·머리·붙박이 열에 가려지는 곳을 깎음 */
    const 통 = 지금.표.closest('.표통') || 지금.표.parentNode, s = 통.getBoundingClientRect();
    const 머 = 지금.표.tHead ? Math.min(지금.표.tHead.getBoundingClientRect().bottom, s.bottom) : s.top;
    let 붙 = s.left; const tr = 줄들(지금.표).find(x => !x.hidden);
    if(tr) for(const td of tr.cells){ if(열of(td) >= Math.min(지금.c0, 지금.c1)) break; if(getComputedStyle(td).position === 'sticky') 붙 = Math.max(붙, td.getBoundingClientRect().right); }
    return { l:Math.max(L, 붙, s.left), t:Math.max(T, 머, s.top), r:Math.min(R, s.right - 10), b:Math.min(B, s.bottom - 10) };
  }
  function 둘레(판){ let L = Infinity, T = Infinity, R = -Infinity, B = -Infinity;
    for(const 줄 of 판) for(const td of [줄[0], 줄[줄.length - 1]]){ const q = td.getBoundingClientRect(); L = Math.min(L, q.left); T = Math.min(T, q.top); R = Math.max(R, q.right); B = Math.max(B, q.bottom); }
    return [L, T, R, B]; }
  function 그리기(){
    그림틀 = 0;
    if(!지금) return;
    if(!지금.표.isConnected){ const 새 = 지금.어 && 지금.어.이름 && 이름표.get(지금.어.이름); if(새 && 새.isConnected && 새 !== 지금.표){ 지금.표 = 새; 지금.어 = 어들.get(새); } else { 풀기(); return; } }
    줄표시(줄들(지금.표)[지금.r1] || null);   /* v7 */
    const 판 = 칸판(); if(!판.length){ 틀.style.display = 손.style.display = 'none'; return; }
    const [L, T, R, B] = 둘레(판), 보 = 보이는틀(L, T, R, B);
    if(보.r <= 보.l || 보.b <= 보.t){ 틀.style.display = 손.style.display = 'none'; }
    else {
      Object.assign(틀.style, { display:'block', left:보.l + 'px', top:보.t + 'px', width:(보.r - 보.l) + 'px', height:(보.b - 보.t) + 'px' });
      Object.assign(손.style, { display:편집 ? 'none' : 'flex', left:Math.min(R, 보.r - 6) + 'px', top:Math.min(B, 보.b - 6) + 'px' });   /* 범위 끝이 상자 밖이면 보이는 끝에 */
    }
    세모그리기();
    if(채우기){ const [cl, ct, cr, cb] = 둘레(칸판(채우기.b)), 보2 = 보이는틀(cl, ct, cr, cb);
      Object.assign(채틀.style, { display:'block', left:보2.l + 'px', top:보2.t + 'px', width:Math.max(0, 보2.r - 보2.l) + 'px', height:Math.max(0, 보2.b - 보2.t) + 'px' }); }
    else 채틀.style.display = 'none';
    칸위치();
  }
  function 칸위치(){
    const td = 머칸(); if(!td){ return; }
    const q = td.getBoundingClientRect();
    Object.assign(칸.style, { left:q.left + 'px', top:q.top + 'px', width:Math.max(q.width, 편집 ? 80 : 0) + 'px', height:q.height + 'px' });
    if(편집 && 목록.style.display !== 'none') 목록자리();
  }
  let 재는판 = null;
  const 글꼴 = cs => cs.font || [cs.fontStyle, cs.fontWeight, cs.fontSize, cs.fontFamily].join(' ');   /* v9.1 크롬이 font 를 빈 글로 줄 때 */
  function 글범위(td, q){   /* v8 칸에 보이는 글의 왼쪽·오른쪽 끝(화면 자리) · 글 없으면 null */
    if(편집){ const v = 칸.value; if(!v) return null; const cs = getComputedStyle(칸); 재는판 = 재는판 || document.createElement('canvas'); const c = 재는판.getContext('2d'); c.font = 글꼴(cs);
      const k = 칸.getBoundingClientRect(), 왼 = parseFloat(cs.paddingLeft) || 0, 오 = parseFloat(cs.paddingRight) || 0, 너 = Math.min(c.measureText(v).width, Math.max(0, k.width - 왼 - 오 - 4));   /* v9 칸 안 글 자리까지 */
      if(cs.textAlign === 'right' || cs.textAlign === 'end') return { l:k.right - 오 - 너, r:k.right - 오 };
      return { l:k.left + 왼, r:k.left + 왼 + 너 }; }
    const 상 = [...td.querySelectorAll('select, input:not([type=checkbox]):not([type=radio]):not([type=hidden]), textarea')].find(x => x.getClientRects().length);   /* v9 칸 안 입력 상자·고르기 */
    if(상){ const v = 상.tagName === 'SELECT' ? ((상.options[상.selectedIndex] || {}).text || '') : 상.value; if(!v) return null;
      const cs = getComputedStyle(상); 재는판 = 재는판 || document.createElement('canvas'); const c = 재는판.getContext('2d'); c.font = 글꼴(cs);
      const k = 상.getBoundingClientRect(), 왼 = (상.clientLeft || 0) + (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.textIndent) || 0), 안오 = k.left + (상.clientLeft || 0) + 상.clientWidth - (parseFloat(cs.paddingRight) || 0);
      const 너 = Math.min(c.measureText(v).width, Math.max(0, 안오 - k.left - 왼));
      if(cs.textAlign === 'right' || cs.textAlign === 'end') return { l:안오 - 너, r:안오 };
      return { l:k.left + 왼, r:k.left + 왼 + 너 }; }
    if(!td.textContent.trim()) return null;
    const rg = document.createRange(); rg.selectNodeContents(td); const rs = [...rg.getClientRects()].filter(x => x.width > 0 && x.right > q.left && x.left < q.right);
    if(!rs.length) return null;
    const 안오 = q.right - (parseFloat(getComputedStyle(td).paddingRight) || 0);   /* v9 글이 넘쳐 잘려도 끝 = 칸 안 글 자리 끝 */
    return { l:Math.max(q.left, Math.min(...rs.map(x => x.left))), r:Math.min(안오, Math.max(...rs.map(x => x.right))) }; }
  /* v9 목록 있는 열 = 그 열 입력 칸 모두 td.세모자리(오른쪽 여백 = ▾ 자리) — 표 등록·기억 처음 받음 때만(입력하는 동안 열이 안 바뀜) */
  const 세모열 = new WeakMap();
  function 자리달기(t){
    const 어 = 어들.get(t); if(!어 || !t.isConnected) return;
    const 열들 = 세모열.get(t) || new Set(); 세모열.set(t, 열들);
    const 칸들 = [];
    for(const b of t.tBodies) for(const tr of b.rows) for(const td of tr.cells){
      if(!어.칸(td) || (어.막음 && 어.막음(td))) continue;
      const 열 = 열이름(어, td); 칸들.push([td, 열]); if(열들.has(열)) continue;
      const 만 = 어.목록만 && 어.목록만(td), 기 = !만 && 열 && 기억[열] && Object.keys(기억[열]).length;
      let 있 = !!기; if(!있 && 어.목록){ try{ 있 = (어.목록(td) || []).length > 0; }catch(e){} }
      if(있) 열들.add(열); }
    for(const [td, 열] of 칸들) if(열들.has(열)) td.classList.add('세모자리');
  }
  let 기억처음 = true;
  let 세모난때 = 0, 세모칸 = null;   /* ▾ 가 막 나타난 직후의 누름(같은 손가락의 뒤따른 click)은 무시 */
  function 세모그리기(){   /* 고른 칸 하나(또는 고치는 중) + 그 칸에 목록이 있을 때만 · 끌기 중엔 숨김 */
    const td = 지금 && 머칸(), 하나 = 지금 && 지금.r0 === 지금.r1 && 지금.c0 === 지금.c1;
    if(세모칸 && 세모칸 !== td){ 세모칸.classList.remove('표입력세모칸'); 세모칸 = null; }
    if(!td || (!하나 && !편집) || 끌기 || 채우기 || !지금.어.칸(td) || !목록들(td).length){ 세모.style.display = 'none'; if(세모칸){ 세모칸.classList.remove('표입력세모칸'); 세모칸 = null; } return; }
    { const 열들 = 세모열.get(지금.표); if(열들 && 열들.has(열이름(지금.어, td))) td.classList.add('세모자리'); }   /* v9 다시 그린 칸도 같은 여백 */
    const q = td.getBoundingClientRect(), 보 = 보이는틀(q.left, q.top, q.right, q.bottom), 거 = matchMedia('(pointer:coarse)').matches;
    if(편집){ const pr = 거 ? '36px' : '28px'; if(칸.style.paddingRight !== pr) 칸.style.paddingRight = pr; }   /* v9 고치는 글도 ▾ 자리 앞까지(겹친 입력 칸 = 표 모양 안 바뀜) */
    const w = 거 ? 22 : 15, h = 거 ? 18 : 12, y = q.top + 1;
    /* v8(11-27) 사장님 「드롭선택목록 확정버튼은 입력된 텍스트 끝에 셀안에 두어 이버튼이 텍스트를 가리지 않게 해주세요」 — ▾ = 칸 안 글자 끝 바로 뒤(3px) ·
       글 끝 뒤에 자리가 없으면(오른쪽 맞춤 숫자 등) 글 앞 · 그것도 없으면 칸 오른쪽 끝(전 자리) · 고치는 중이면 치는 글 끝 */
    const 끝 = q.height >= h + 8 ? Math.min(q.right, 보.r) - 2 : Math.min(q.right, 보.r - 6) - 6 - 3, 글자리 = 글범위(td, q);   /* v9.2 칸이 ▾+손잡이보다 높으면 위아래로 안 겹침 → 칸 오른쪽 2px 까지 */   /* v8.2 + 손잡이(모서리 ±6px)보다 3px 왼쪽까지 — 끌어 채우기를 가리지 않음 */
    /* v9 빈 칸 = 글 시작 자리(오른쪽 맞춤 칸은 끝) · 글 끝 뒤 자리 없으면 글 앞 · 그것도 없으면 안 그림(글 위에 안 그림) */
    const ts = getComputedStyle(td), 오맞 = ts.textAlign === 'right' || ts.textAlign === 'end';
    let x = 오맞 || 편집 ? 끝 - w : q.left + (parseFloat(ts.paddingLeft) || 0);
    if(편집 && !글자리){ const k = 칸.getBoundingClientRect(); x = k.left + (parseFloat(getComputedStyle(칸).paddingLeft) || 0) + 3; }
    if(글자리){ if(글자리.r + 3 + w <= 끝) x = 글자리.r + 3; else if(글자리.l - 3 - w >= q.left + 1) x = 글자리.l - 3 - w; else x = NaN; }
    if(!(x >= 보.l) || x + w > 끝 + 0.5 || y < 보.t - 1 || y + h > 보.b + 2){ 세모.style.display = 'none'; if(세모칸){ 세모칸.classList.remove('표입력세모칸'); 세모칸 = null; } return; }
    if(세모칸 !== td){ 세모칸 = td; td.classList.add('표입력세모칸'); }
    if(세모.style.display !== 'flex') 세모난때 = Date.now();
    Object.assign(세모.style, { display:'flex', left:x + 'px', top:y + 'px' });
  }
  const 다시 = () => { if(지금 && !그림틀) 그림틀 = requestAnimationFrame(그리기); };
  addEventListener('scroll', 다시, true); addEventListener('resize', 다시);
  if(window.visualViewport){ visualViewport.addEventListener('resize', 다시); visualViewport.addEventListener('scroll', 다시); }

  /* 고른 칸이 보이게 표 상자를 민다(머리·붙박이 열 고려) */
  function 보이게(td){
    const 통 = td.closest('.표통'); if(!통) return;
    const s = 통.getBoundingClientRect(), q = td.getBoundingClientRect();
    const 머 = 지금.표.tHead ? 지금.표.tHead.getBoundingClientRect().bottom : s.top;
    let 붙 = s.left; for(const x of td.parentNode.cells){ if(x === td) break; if(getComputedStyle(x).position === 'sticky') 붙 = Math.max(붙, x.getBoundingClientRect().right); }
    if(q.top < 머) 통.scrollTop -= 머 - q.top + 2; else if(q.bottom > s.bottom - 12) 통.scrollTop += q.bottom - s.bottom + 14;
    if(getComputedStyle(td).position !== 'sticky'){ if(q.left < 붙) 통.scrollLeft -= 붙 - q.left + 2; else if(q.right > s.right - 12) 통.scrollLeft += q.right - s.right + 14; }
  }
  function 옮김(dr, dc, 넓힘){
    if(!지금) return;
    const 줄 = 줄들(지금.표), 기r = 넓힘 ? 지금.r1 : 지금.r0, 기c = 넓힘 ? 지금.c1 : 지금.c0;
    let r = 기r, c = 기c;
    const 격 = 격자(지금.표), 칸 = (i, j) => (격.g[i] || [])[j], 지금칸 = 칸(r, c);
    if(dr){ let i = r + dr; while(줄[i] && (줄[i].hidden || 칸(i, c) === 지금칸)) i += dr; if(줄[i]) r = i; }
    if(dc){ let i = c + dc; while(칸(r, i) && (!보임(칸(r, i)) || 칸(r, i) === 지금칸)) i += dc; if(칸(r, i)) c = i; }
    const td = 칸(r, c); if(!td) return; r = 격.자리.get(td)[0];   /* 합친 칸 = 그 칸 첫 줄 */
    if(넓힘){ 지금.r1 = r; 지금.c1 = c; } else { 지금.r0 = 지금.r1 = r; 지금.c0 = 지금.c1 = c; }
    보이게(td); 그리기(); 초점();
  }

  /* ── 고치기(겹친 입력 칸 하나 + 기억 드롭) ── */
  function 목록들(td){
    const 어 = 지금.어, 원 = (어.목록 ? 어.목록(td) || [] : []).map(x => typeof x === 'string' ? { v:x } : x).filter(x => x && x.v !== '' && x.v != null);
    const 있음 = new Set(원.map(x => String(x.v)));
    const 만 = 어.목록만 && 어.목록만(td);
    const 열 = 열이름(어, td), 합 = Object.assign({}, 기억[열] || {});
    for(const [v, n] of Object.entries(기억더할[열] || {})) 합[v] = (합[v] || 0) + n;   /* 아직 창고로 안 간 것도 바로 */
    const 기 = Object.entries(합).filter(([v]) => !있음.has(v) && !만).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ko')).map(([v]) => ({ v, 기억:true }));
    return 원.concat(기);
  }
  let 목록줄 = [], 목록고름 = -1;
  function 목록그리기(){
    if(!편집){ 목록.style.display = 'none'; return; }
    const g = 칸.value.trim().toLowerCase(), 다 = 편집.목록;
    목록줄 = 편집.처음글 ? 다 : 다.filter(x => !g || (String(x.v) + ' ' + (x.글 || '')).toLowerCase().includes(g));
    편집.처음글 = false;
    if(!목록줄.length){ 목록.style.display = 'none'; 목록고름 = -1; return; }
    목록고름 = Math.min(목록고름, 목록줄.length - 1);
    목록.innerHTML = 목록줄.map((x, i) => `<div data-i="${i}" class="${[x.맞음 ? '맞음' : '', x.기억 ? '기억' : '', i === 목록고름 ? '지금' : ''].join(' ')}"${x.title ? ` title="${String(x.title).replace(/"/g, '&quot;')}"` : ''}>${글(x.v)}${x.글 && x.글 !== x.v ? `<span class="곁">${글(x.글)}</span>` : ''}${x.덧 ? `<span class="덧">${글(x.덧)}</span>` : ''}</div>`).join('');
    목록.style.display = 'block'; 목록자리();
  }
  const 글 = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  function 목록자리(){   /* 다른 드롭과 같게: 칸 옆 10px(오른쪽, 자리 없으면 왼쪽, 그것도 없으면 아래·위 10px) */
    const 끝 = window.visualViewport ? visualViewport.offsetTop + visualViewport.height : innerHeight;
    목록.style.maxHeight = Math.max(80, Math.min(420, 끝 - 8)) + 'px';   /* 11-23 화면보다 길면 잘렸음 — 보이는 높이 안으로(자리 있으면 420px 까지 = 워크센터 10곳이 한눈에) */
    const q = 칸.getBoundingClientRect(), w = 목록.offsetWidth, h = 목록.offsetHeight;
    let x, y = Math.max(4, Math.min(q.top, 끝 - h - 4));
    if(q.right + 10 + w <= innerWidth) x = q.right + 10;
    else if(q.left - 10 - w >= 0) x = q.left - 10 - w;
    else { x = Math.max(4, Math.min(q.left, innerWidth - w - 4)); y = q.bottom + 10 + h <= 끝 ? q.bottom + 10 : q.top - 10 - h >= 4 ? q.top - 10 - h : Math.max(4, 끝 - h - 4); }   /* 아래 자리 없으면 위 · 위도 없으면 화면 안 끝에 붙임 */
    목록.style.left = x + 'px'; 목록.style.top = y + 'px';
  }
  function 고치기(방식, 첫글, 열기){   /* 방식 'F2' = 지금 값(←→ 글자 사이) · '친' = 친 글로 바꿈(←→ = 넣고 옮김) */
    if(!지금) return false;
    const td = 머칸(), 어 = 지금.어;
    if(!td) return false;
    if(!어.칸(td)){ if(어.막음 && 어.막음(td) && 어.알림) 어.알림(td); return false; }
    편집 = { td, 방식, 원:어.읽기(td), 목록:목록들(td), 처음글:!!열기 };
    칸.classList.remove('숨음'); 칸.readOnly = !!(어.목록만 && 어.목록만(td) && matchMedia('(pointer:coarse)').matches);
    if(방식 === 'F2'){ 칸.value = 편집.원; } else if(첫글 != null){ 칸.value = 첫글; }
    목록고름 = -1; 칸위치(); 그리기(); 칸.focus({ preventScroll:true });
    if(방식 === 'F2') 칸.setSelectionRange(칸.value.length, 칸.value.length);
    if(방식 === '친' || 열기) 목록그리기(); else 목록.style.display = 'none';   /* F2·두 번 누름 = 고치기만, 목록은 ▾·Alt+↓·글 치기 */
    return true;
  }
  function 끝내기(넣기, 값){
    if(!편집) return;
    const { td } = 편집, 어 = 지금 && 지금.어; 편집 = null; 칸.style.paddingRight = '';
    const v = 값 != null ? 값 : 칸.value;
    칸.value = ''; 칸.classList.add('숨음'); 칸.readOnly = false; 목록.style.display = 'none';
    if(넣기 && 어 && td.isConnected && v !== 어.읽기(td)){
      if(어.목록만 && 어.목록만(td) && v.trim() && !목록들(td).some(x => String(x.v) === v.trim())){ if(어.알림) 어.알림(td, '목록에 없음 — 드롭에서 고르세요'); }
      else 어.쓰기([[td, v]]);
    }
    다시();
  }
  function 목록닫기(){ 목록.style.display = 'none'; 목록고름 = -1; }
  function 목록열닫(){   /* ▾ · Alt+↓ */
    if(!지금) return;
    if(편집){ if(목록.style.display !== 'none') 목록닫기(); else { 편집.처음글 = true; 목록그리기(); } 칸.focus({ preventScroll:true }); return; }
    고치기('F2', null, true);
  }
  let 누르는중 = false;   /* 목록·▾ 를 누르는 동안 입력 칸이 초점을 잃어도 고치기를 끝내지 않음(폰) */
  [목록, 세모].forEach(el => { el.addEventListener('pointerdown', e => { 누르는중 = true; if(el === 세모) e.preventDefault(); }); el.addEventListener('mousedown', e => e.preventDefault()); });
  세모.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); 누르는중 = false; if(Date.now() - 세모난때 < 400 && 톡뒤()) return; 목록열닫(); });
  목록.addEventListener('click', e => { 누르는중 = false; const d = e.target.closest('[data-i]'); if(!d || !편집) return; 끝내기(true, String(목록줄[+d.dataset.i].v)); 초점(); });

  /* ── 글쇠 ── */
  칸.addEventListener('keydown', e => {
    if(!지금 || e.isComposing) return;
    const 명 = e.ctrlKey || e.metaKey;
    if(편집){
      const 목보임 = 목록.style.display !== 'none' && 목록줄.length;
      if(e.key === 'Escape'){ e.preventDefault(); if(목록.style.display !== 'none'){ 목록닫기(); return; } 끝내기(false); 초점(); return; }
      if(e.altKey && e.key === 'ArrowDown'){ e.preventDefault(); 목록열닫(); return; }
      if(e.key === 'Enter'){ e.preventDefault(); const 고른 = 목보임 && 목록고름 >= 0 ? String(목록줄[목록고름].v) : null; 끝내기(true, 고른); 옮김(e.shiftKey ? -1 : 1, 0); return; }
      if(e.key === 'Tab'){ e.preventDefault(); 끝내기(true); 옮김(0, e.shiftKey ? -1 : 1); return; }
      if((e.key === 'ArrowDown' || e.key === 'ArrowUp') && 목보임){ e.preventDefault(); 목록고름 = Math.max(0, Math.min(목록줄.length - 1, 목록고름 + (e.key === 'ArrowDown' ? 1 : -1))); 목록그리기(); const 고 = 목록.querySelector('.지금'); if(고) 고.scrollIntoView({ block:'nearest' }); return; }
      const 화 = { ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1] }[e.key];
      if(화 && (편집.방식 === '친' || 화[0])){ e.preventDefault(); 끝내기(true); 옮김(화[0], 화[1]); }
      return;
    }
    /* 고름 상태 */
    const 화 = { ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1] }[e.key];
    if(화 && !명 && !e.altKey){ e.preventDefault(); 옮김(화[0], 화[1], e.shiftKey); return; }
    if(e.key === 'Enter'){ e.preventDefault(); 옮김(e.shiftKey ? -1 : 1, 0); return; }
    if(e.key === 'Tab'){ e.preventDefault(); 옮김(0, e.shiftKey ? -1 : 1); return; }
    if(e.altKey && e.key === 'ArrowDown'){ e.preventDefault(); 목록열닫(); return; }
    if(e.key === 'F2'){ e.preventDefault(); 고치기('F2'); return; }
    if(e.key === 'Escape'){ e.preventDefault(); 풀기(); return; }
    if(e.key === 'Delete' || e.key === 'Backspace'){ e.preventDefault(); 지우기(); return; }
    if(명 && (e.key === 'a' || e.key === 'A')){ e.preventDefault(); const 줄 = 줄들(지금.표); 지금.r0 = 0; 지금.r1 = 줄.length - 1; 그리기(); return; }
    if(명 || e.altKey) return;   /* ⌘C·⌘V·⌘X = copy/paste 이벤트로 */
    if(e.key.length === 1 || e.key === 'Process'){
      if(!고치기('친')) e.preventDefault();   /* 입력 칸 아님 = 글자 버림 · 맞으면 글자가 그대로 칸으로 들어감(한글 조합 포함) */
    }
  });
  칸.addEventListener('compositionstart', () => { if(지금 && !편집) 고치기('친'); });
  칸.addEventListener('input', () => { if(편집){ 목록그리기(); 세모그리기(); } else if(지금 && 칸.value){ const v = 칸.value; if(!고치기('친', v)) 칸.value = ''; else 세모그리기(); } });   /* v8 ▾ 가 치는 글 끝을 따라감 */
  칸.addEventListener('blur', () => { setTimeout(() => { if(누르는중){ 누르는중 = false; return; } if(편집 && document.activeElement !== 칸) 끝내기(true); }, 0); });

  /* ── 복사·붙여넣기·지우기 ── */
  const 칸값 = td => String(지금.어.칸(td) ? 지금.어.읽기(td) : td.textContent.trim()).replace(/[\t\r\n]+/g, ' ');
  function 막음보기(tds){ const 어 = 지금.어; if(!어.막음 || !어.알림) return; const 막 = tds.find(td => 어.막음(td)); if(막) 어.알림(막); }
  function 지우기(){ const 모두 = 칸판().flat(), 어 = 지금.어; 막음보기(모두); const 목 = 모두.filter(td => 어.칸(td) && 어.읽기(td) !== '').map(td => [td, '']); if(목.length) 어.쓰기(목); 다시(); }
  const 복사글 = () => 칸판().map(줄 => 줄.map(칸값).join('\t')).join('\n');
  function 붙이기(글자){
    if(!지금 || 글자 == null || 글자 === '') return;
    const 어 = 지금.어, 줄 = String(글자).replace(/\r\n?/g, '\n').replace(/\n$/, '').split('\n').map(l => l.split('\t').map(v => v.replace(/^"(.*)"$/s, '$1').replace(/""/g, '"')));
    const 모두 = 칸판().flat();
    if(줄.length === 1 && 줄[0].length === 1){ 막음보기(모두); 어.쓰기(모두.filter(td => 어.칸(td)).map(td => [td, 줄[0][0]])); 다시(); return; }
    const [r0, c0] = 범위(), 표줄 = 줄들(지금.표), 아래 = 표줄.slice(r0).filter(tr => !tr.hidden), 목 = [], 닿은 = [];
    let 끝r = r0, 끝c = c0;
    for(let i = 0; i < 줄.length && i < 아래.length; i++){
      const 격 = 격자(지금.표), ri = 표줄.indexOf(아래[i]), 보칸 = [...new Set((격.g[ri] || []).slice(c0))].filter(td => td && 보임(td) && 격.자리.get(td)[0] === ri);   /* 합친 칸은 첫 줄에서만 */
      for(let j = 0; j < 줄[i].length && j < 보칸.length; j++){ const td = 보칸[j]; 닿은.push(td); if(어.칸(td)) 목.push([td, 줄[i][j]]); 끝r = Math.max(끝r, 표줄.indexOf(td.parentNode)); 끝c = Math.max(끝c, 열of(td)); }
    }
    지금.r0 = r0; 지금.c0 = c0; 지금.r1 = 끝r; 지금.c1 = 끝c;
    막음보기(닿은); if(목.length) 어.쓰기(목); 다시();
  }
  칸.addEventListener('copy', e => { if(!지금 || 편집) return; e.preventDefault(); e.clipboardData.setData('text/plain', 복사글()); });
  칸.addEventListener('cut', e => { if(!지금 || 편집) return; e.preventDefault(); e.clipboardData.setData('text/plain', 복사글()); });
  칸.addEventListener('paste', e => { if(!지금 || 편집) return; e.preventDefault(); 붙이기((e.clipboardData || window.clipboardData).getData('text')); });

  /* ── 마우스: 누름 = 고름 · 끌기 = 범위 · 두 번 = 고치기 ── */
  const 내표칸 = el => { const td = el && el.closest && el.closest('td'); const t = td && td.closest('table'); return t && 어들.has(t) && t.tBodies[0] && t.tBodies[0].contains(td) ? td : null; };
  const 쓸칸 = td => { const 어 = 어들.get(td.closest('table')); return 어.칸(td) || (어.막음 && 어.막음(td)); };
  let 최근톡 = 0;   /* 폰 누름 뒤 따라오는 흉내 마우스 이벤트는 무시(폰 = 터치범위가 맡음) */
  document.addEventListener('pointerdown', e => { if(e.pointerType === 'touch') 최근톡 = Date.now(); }, true);
  const 톡뒤 = () => Date.now() - 최근톡 < 1200;
  document.addEventListener('mousedown', e => {
    if(e.button !== 0 || 톡뒤()) return;
    if(e.target === 칸 || 목록.contains(e.target) || e.target === 손 || e.target === 세모) return;
    const td = 내표칸(e.target);
    if(!td || !쓸칸(td) || (e.target.closest('input[type=checkbox],button,a,.칸끈'))){
      if(편집) 끝내기(true);
      if(!td && !e.target.closest('.터치띠,.터치손,.표입력목록,.표입력세모')) 풀기();
      return;
    }
    e.preventDefault(); e.stopPropagation();   /* 쪽의 옛 누름·끌기 고르기·네이티브 칸 초점을 막음 — 이 파일 하나가 맡음 */
    if(편집) 끝내기(true);
    고르기(td, e.shiftKey);
    끌기 = { 시작:td };
  }, true);
  document.addEventListener('mouseover', e => {
    if(!끌기 || !지금) return; const td = 내표칸(e.target); if(!td || td.closest('table') !== 지금.표) return;
    const r = 줄들(지금.표).indexOf(td.parentNode), c = 열of(td); if(r === 지금.r1 && c === 지금.c1) return;
    지금.r1 = r; 지금.c1 = c; 그리기();
  }, true);
  addEventListener('mouseup', () => { if(끌기){ 끌기 = null; 다시(); } });
  document.addEventListener('dblclick', e => { if(톡뒤()) return; const td = 내표칸(e.target); if(!td || !쓸칸(td)) return; e.preventDefault(); e.stopPropagation(); 고르기(td); 고치기('F2'); }, true);
  document.addEventListener('click', e => { if(e.pointerType === 'touch' || 톡뒤()) return; const td = 내표칸(e.target); if(td && 쓸칸(td) && !e.target.closest('input[type=checkbox],button,a')){ e.stopPropagation(); } }, true);

  /* ── + 끌기 = 복사(위·아래, 옆) ── */
  손.addEventListener('pointerdown', e => {
    if(!지금 || e.pointerType === 'touch') return;
    e.preventDefault(); e.stopPropagation(); try{ 손.setPointerCapture(e.pointerId); }catch(_){}
    목록닫기(); 세모.style.display = 'none';
    채우기 = { id:e.pointerId, x:e.clientX, y:e.clientY, b:범위() }; 채우기.원 = 채우기.b.slice();
    채우기.틀 = requestAnimationFrame(채우며밀기);
  });
  function 채움범위(x, y){
    const 원 = 채우기.원; let 다 = null;
    for(const el of document.elementsFromPoint(x, y)){ const td = el.closest && el.closest('td'); if(td && td.closest('table') === 지금.표 && 보임(td)){ 다 = td; break; } }
    if(!다) return;
    const r = 줄들(지금.표).indexOf(다.parentNode), c = 열of(다);
    const 아래 = r - 원[2], 위 = 원[0] - r, 옆 = c - 원[3], 왼 = 원[1] - c;
    const 세 = Math.max(아래, 위, 0), 가 = Math.max(옆, 왼, 0);
    if(세 >= 가 && 세 > 0) 채우기.b = 아래 > 0 ? [원[0], 원[1], r, 원[3]] : [r, 원[1], 원[2], 원[3]];
    else if(가 > 0) 채우기.b = 옆 > 0 ? [원[0], 원[1], 원[2], c] : [원[0], c, 원[2], 원[3]];
    else 채우기.b = 원.slice();
    그리기();
  }
  function 채우며밀기(){
    if(!채우기 || !지금) return;
    const 통 = 지금.표.closest('.표통'); if(통){ const s = 통.getBoundingClientRect(); let dy = 0, dx = 0;
      if(채우기.y > s.bottom - 24) dy = 12; else if(채우기.y < s.top + 30) dy = -12;
      if(채우기.x > s.right - 24) dx = 12; else if(채우기.x < s.left + 24) dx = -12;
      if(dy || dx){ 통.scrollTop += dy; 통.scrollLeft += dx; 채움범위(채우기.x, 채우기.y); } }
    채우기.틀 = requestAnimationFrame(채우며밀기);
  }
  손.addEventListener('pointermove', e => { if(!채우기 || e.pointerId !== 채우기.id) return; 채우기.x = e.clientX; 채우기.y = e.clientY; 채움범위(e.clientX, e.clientY); });
  const 채움끝 = 넣기 => e => {
    if(!채우기 || e.pointerId !== 채우기.id) return;
    const { 원, b, 틀:f } = 채우기; cancelAnimationFrame(f); 채우기 = null;
    if(넣기 && b.join() !== 원.join()){
      const 어 = 지금.어, 원판 = 칸판(원), 목 = [];
      const 세로 = b[0] !== 원[0] || b[2] !== 원[2];
      if(세로){   /* 열마다 원래 줄 값을 차례로 되풀이 */
        const 새줄 = 칸판(b[0] < 원[0] ? [b[0], 원[1], 원[0] - 1, 원[3]] : [원[2] + 1, 원[1], b[2], 원[3]]);
        const 원값 = 원판.map(줄 => 줄.map(td => 칸값(td)));
        const 위로 = b[0] < 원[0];
        새줄.forEach((줄, i) => 줄.forEach((td, j) => { const n = 원값.length, k = 위로 ? (n - 1 - ((새줄.length - 1 - i) % n)) : (i % n); const v = (원값[k] || [])[j]; if(v != null && 어.칸(td)) 목.push([td, v]); }));
      } else {
        const 새칸 = 칸판(b[1] < 원[1] ? [원[0], b[1], 원[2], 원[1] - 1] : [원[0], 원[3] + 1, 원[2], b[3]]);
        원판.forEach((줄, i) => { const 원값 = 줄.map(칸값), 왼으로 = b[1] < 원[1], n = 원값.length;
          (새칸[i] || []).forEach((td, j, 다) => { const k = 왼으로 ? (n - 1 - ((다.length - 1 - j) % n)) : (j % n); if(어.칸(td)) 목.push([td, 원값[k]]); }); });
      }
      막음보기(칸판(b).flat().filter(td => !원판.flat().includes(td)));
      지금.r0 = b[0]; 지금.c0 = b[1]; 지금.r1 = b[2]; 지금.c1 = b[3];
      if(목.length) 어.쓰기(목);
    }
    그리기(); 초점();
  };
  손.addEventListener('pointerup', 채움끝(true)); 손.addEventListener('pointercancel', 채움끝(false));

  /* ── 폰: 터치범위가 고른 칸을 한 번 더 누르면 고치기 ── */
  let 앞톡 = null;
  document.addEventListener('pointerup', e => {
    if(e.pointerType !== 'touch') return;
    const td = 내표칸(e.target); if(!td){ 앞톡 = null; return; }
    const 터 = window.터치범위 && 터치범위.지금();
    const 같음 = 앞톡 === td && 터 && 터.표 === td.closest('table') && 터.범위[0] === 터.범위[2] && 터.범위[1] === 터.범위[3];
    앞톡 = td;
    if(같음 && 쓸칸(td)){ 앞톡 = null; 지금 = { 표:td.closest('table'), 어:어들.get(td.closest('table')), r0:0, c0:0, r1:0, c1:0 };
      const r = 줄들(지금.표).indexOf(td.parentNode); 지금.r0 = 지금.r1 = r; 지금.c0 = 지금.c1 = 열of(td);
      if(window.터치범위) 터치범위.끝(); 그리기(); 고치기('F2'); }   /* 목록은 ▾·글 치기로 */
  }, true);
  document.addEventListener('click', e => { if(e.pointerType === 'touch' && 내표칸(e.target) && 쓸칸(내표칸(e.target))) { e.stopPropagation(); e.preventDefault(); } }, true);   /* 쪽 옛 폰 누름 동작 대신 */

  window.표입력 = { 쪽(이름){ 쪽이름 = 이름; 기억구독(); }, 표:등록, 풀기, 지금:() => 지금 && { 범위:범위(), 표:지금.표, 편집:!!편집 }, 기억:() => 기억 };
})();
