/* 발주역입력 칸 넓이 조정(11-21, 영림원품목등록 v2.33.0 부터) — 재단.html v1.4.0 칸 너비 조절과 같은 꼴.
   표 머리 칸 오른쪽 끝(.칸끈 — PC 8px · 터치 16px)을 끌면 그 칸 넓이가 바뀐다(마우스·손가락 모두, pointer 이벤트).
   3px 넘게 끌어야 시작 · 가장 좁게 24px · 손잡이를 두 번 누르면(더블클릭·두 번 톡) 그 칸만 원래대로.
   한 칸이라도 고친 표 = <colgroup> + table-layout:fixed(.칸고정, 넘치는 글은 칸 안에서 …). 안 고친 칸은 처음 잰 넓이(올림).
   기억 = 이 기기 localStorage(창고에 안 씀) {"묶음|표 차례|머리 글자": px}(같은 쪽 여러 표는 따로). 같은 머리 글자가 한 표에 또 있으면 「글자#2」.
   쓰는 법: 칸넓이.달기(뿌리 요소, { 열쇠:'localStorage 이름', 묶음: th => '시트 이름' })
     뿌리 안 table.dpr-t(머리 한 줄)를 지켜보다가 새로 그려지면 손잡이를 달고 기억한 넓이를 다시 입힌다. 표를 다시 그리는 코드는 안 고쳐도 됨.
   숨은 열(display:none — 빈 열 접기)은 세지 않음: colgroup 은 보이는 열만, 접기·펼침이 바뀌면 다시 맞춤.
   v2(11-27) 사장님 「모든표 가로넓이 조절 가능하게 해. 이걸 꼭 그때그때 말해야만 해주냐?」 — 옵션 표:'table'(고를 표 선택자, 없으면 table.dpr-t) ·
     머리 여러 줄(묶음 머리 colspan·rowspan)도 됨: 열마다 그 열 하나만 덮는 가장 아래 머리 칸에 손잡이 · 그런 칸이 없는 열이 있으면 그 표는 건너뜀 ·
     v3(11-27): 사장님 「아이 표 넓히고 줄이는 게 어디 듣도 보도 못한 방식이야. 그냥 잡은 쪽이 늘어나고 줄어들면 되지 뭐야. 이게 그냥 엑셀이랑 구글시트처럼 해. 특이하게 하려고 그러지 말고」 —
       엑셀·구글시트처럼: 잡은 경계선이 마우스를 그대로 따라감(넓이 = 마우스 x − 그 열 왼쪽 끝, 잡은 자리 어긋남 보정) · 그 열만 바뀌고 다른 열은 잰 넓이 그대로(올림 없이 소수까지 — 전엔 처음 고정할 때 올림으로 옆 열이 0.6~1px 바뀌었음) · 표 너비 = 열 합 · 끄는 동안 경계선 자리에 파란 세로선(표 상자 높이) · 커서 ↔ · 두 번 누름 = 원래대로 · 기억 그대로. 공용 `칸넓이.선(x, 상자)`/`선끝()` = 쪽 자체 손잡이(보드 .열손 · 재단 .칸끈)도 같은 선.
     v2.1(11-27): 열 이름 = 머리 글자에서 .열빨(영림원품목등록 열 제목 빨강 칸 수) 뺌 — 숫자가 바뀌어도 같은 열 기억.
     쪽이 따로 손잡이를 단 표(.칸끈 = 재단 v1.4.0 · .열손 = 보드매입현황 v1.32.0)는 건너뜀 — 이 파일 손잡이 = .칸끈.칸넓이끈.
     v4(11-28): 사장님 「모바일에서는 셀 넓이 조절이 안 되네요?」 → 「고치세요」 — 손가락(pointer:coarse)에서 손잡이 28px · 길게 누름 메뉴·글 고르기 끔 ·
       손잡이(.칸끈 · .열손 — 이 파일·재단·보드매입현황 모두)에서 시작한 터치 = touchstart·touchmove 기본 동작 막음(passive:false) → 표·쪽이 밀리지 않고 그 칸만 넓어짐(touch-action 을 무시하는 브라우저도).
       끄는 셈(pointer 이벤트)·PC 마우스 8px·기억 열쇠는 그대로. */
(function(){
  const 최소 = 24, 시작거리 = 3, 두번간격 = 350;
  const 꼴 = document.createElement('style');
  꼴.textContent =
    '.칸끈{position:absolute;top:0;right:0;bottom:0;width:8px;cursor:col-resize;touch-action:none;z-index:2}' +
    '.칸끈:hover,.칸끈.끄는중{background:linear-gradient(to right,transparent 6px,#9C9C98 6px)}' +
    '@media (pointer:coarse){.칸끈,.폼표 thead th .열손{width:28px;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}.칸끈:hover,.칸끈.끄는중,.폼표 thead th .열손:hover,.폼표 thead th .열손.끄는중{background:linear-gradient(to right,transparent calc(100% - 2px),#9C9C98 0)}}' +   /* v4 손가락 = 28px(재단 .칸끈 · 보드매입현황 .열손 도) */
    'table.칸고정{table-layout:fixed}table.칸고정>thead>tr>th,table.칸고정>tbody>tr>td{overflow:hidden;text-overflow:ellipsis;max-width:none}' +
    'body.칸끄는중{cursor:col-resize;user-select:none;-webkit-user-select:none}body.칸끄는중 *{cursor:col-resize!important}' +
    '.칸넓이선{position:fixed;z-index:60;width:2px;margin-left:-1px;background:#1a73e8;pointer-events:none;display:none}';   /* v3 끄는 동안 경계선(구글시트처럼) */
  document.head.appendChild(꼴);
  let 선 = null;
  function 선보임(x, 상자){ if(!선){ 선 = document.createElement('div'); 선.className = '칸넓이선'; document.body.appendChild(선); }
    const r = (상자 || document.body).getBoundingClientRect(), 위 = Math.max(0, r.top), 아래 = Math.min(innerHeight, r.bottom);
    Object.assign(선.style, { display:'block', left:x + 'px', top:위 + 'px', height:Math.max(0, 아래 - 위) + 'px' }); }
  function 선끝(){ if(선) 선.style.display = 'none'; }

  function 달기(뿌리, 옵션){
    const 열쇠 = 옵션.열쇠, 묶음 = 옵션.묶음 || (() => ''), 표선 = 옵션.표 || 'table.dpr-t';
    let 넓 = {}; try{ 넓 = JSON.parse(localStorage.getItem(열쇠) || '{}') || {}; }catch(e){ 넓 = {}; }
    const 저장 = () => { try{ localStorage.setItem(열쇠, JSON.stringify(넓)); }catch(e){} };
    function 열머리(t){   /* v2 열마다 그 열 하나만 덮는 가장 아래 머리 칸 · 없으면 null */
      if(!t.tHead || !t.tHead.rows.length) return null;
      const 칸 = [], 찬 = [];
      [...t.tHead.rows].forEach((tr, r) => { let c = 0;
        for(const th of tr.cells){ while(찬[r] && 찬[r][c]) c++; const cs = th.colSpan || 1, rs = th.rowSpan || 1;
          for(let y = r; y < r + rs; y++) for(let x = c; x < c + cs; x++){ (찬[y] = 찬[y] || [])[x] = 1; }
          if(cs === 1) 칸[c] = th; c += cs; } });
      const n = Math.max(0, ...찬.map(x => x ? x.length : 0)); for(let i = 0; i < n; i++) if(!칸[i]) return null;
      return 칸; }
    const 남손 = t => !!(t.tHead && t.tHead.querySelector('.칸끈:not(.칸넓이끈), .열손'));
    const 머리들 = t => { if(남손(t)) return []; const 칸 = 열머리(t); return 칸 ? 칸.filter(th => getComputedStyle(th).display !== 'none') : []; };   /* 숨은(접힌) 열은 표 칸에서 빠짐 — 보이는 열만 */
    const 표번 = t => [...뿌리.querySelectorAll(표선)].indexOf(t);
    const 이름들 = t => { const 셈 = {}, 묶 = 묶음(t) + '|' + 표번(t); return 머리들(t).map(th => { const k = (th.dataset.k || [...th.childNodes].filter(n => !(n.nodeType === 1 && n.classList.contains('열빨'))).map(n => n.textContent).join('')).trim();   /* v2.1 머리 칸 숫자 표시(.열빨 — 영림원품목등록 v2.162)는 이름에서 뺌 */ 셈[k] = (셈[k] || 0) + 1; return 묶 + '|' + k + (셈[k] > 1 ? '#' + 셈[k] : ''); }); };
    function 풀기(t){ t.classList.remove('칸고정'); t.style.width = ''; const cg = t.querySelector(':scope>colgroup.칸넓이'); if(cg) cg.remove(); }
    function 고정(t){   /* 지금 넓이를 재어 colgroup 에 박고 고친 칸만 기억 값 */
      const ths = 머리들(t), 이름 = 이름들(t);
      풀기(t);
      const 잰 = ths.map(th => th.getBoundingClientRect().width);   /* v3 올림 안 함 — 옆 열이 안 바뀜 */
      const cg = document.createElement('colgroup'); cg.className = '칸넓이';
      let 합 = 0;
      잰.forEach((w, i) => { const v = Math.max(최소, 넓[이름[i]] || w); const c = document.createElement('col'); c.style.width = v + 'px'; cg.appendChild(c); 합 += v; });
      t.insertBefore(cg, t.firstChild); t.style.width = 합 + 'px'; t.classList.add('칸고정');
    }
    function 입히기(t){
      const 이름 = 이름들(t);
      if(!이름.length) return;
      if(이름.some(k => 넓[k])) 고정(t); else 풀기(t);
      t.dataset.칸넓이 = 이름.join('\t');
    }
    function 손달기(t){
      머리들(t).forEach(th => {
        if(th.querySelector(':scope>.칸넓이끈')) return;
        if(getComputedStyle(th).position === 'static') th.style.position = 'relative';
        const h = document.createElement('span'); h.className = '칸끈 칸넓이끈'; th.appendChild(h);
      });
    }
    function 살피기(){
      예약 = 0;
      뿌리.querySelectorAll(표선).forEach(t => {
        if(!t.tHead || !머리들(t).length || (끌기 && 끌기.t === t)) return;   /* 끄는 중인 표는 건드리지 않음 */
        손달기(t);
        const 이름 = 이름들(t).join('\t');
        if(t.dataset.칸넓이 !== 이름 || (이름들(t).some(k => 넓[k]) !== t.classList.contains('칸고정'))) 입히기(t);
      });
    }
    let 예약 = 0;
    const 다시 = () => { if(!예약) 예약 = requestAnimationFrame(살피기); };
    new MutationObserver(다시).observe(뿌리, { childList:true, subtree:true, attributes:true, attributeFilter:['class'] });
    new MutationObserver(다시).observe(document.body, { attributes:true, attributeFilter:['class'] });   /* 열 접기·펼쳐보기(영림원품목등록 v2.32.0)도 다시 맞춤 */
    다시();

    let 끌기 = null, 앞누름 = { 때:0, 손:null };
    뿌리.addEventListener('pointerdown', e => {
      const h = e.target.closest && e.target.closest('.칸넓이끈'); if(!h || (e.pointerType === 'mouse' && e.button !== 0)) return;
      e.preventDefault(); e.stopPropagation();
      const th = h.parentNode, t = th.closest('table');
      끌기 = { h, th, t, x:e.clientX, id:e.pointerId, 시작:false, 처음:th.getBoundingClientRect().width, 어긋:th.getBoundingClientRect().right - e.clientX };   /* v3 잡은 자리 ↔ 경계선 */
      try{ h.setPointerCapture(e.pointerId); }catch(_){}
    }, true);
    뿌리.addEventListener('pointermove', e => {
      if(!끌기 || e.pointerId !== 끌기.id) return;
      const dx = e.clientX - 끌기.x;
      if(!끌기.시작){
        if(Math.abs(dx) < 시작거리) return;
        끌기.시작 = true; 끌기.h.classList.add('끄는중'); document.body.classList.add('칸끄는중');
        if(!끌기.t.classList.contains('칸고정')) 고정(끌기.t);
        끌기.i = 머리들(끌기.t).indexOf(끌기.th);
        끌기.처음 = parseFloat(끌기.t.querySelector(':scope>colgroup.칸넓이').children[끌기.i].style.width);
      }
      e.preventDefault();
      const cg = 끌기.t.querySelector(':scope>colgroup.칸넓이'), c = cg.children[끌기.i];
      const v = Math.max(최소, Math.round(e.clientX + 끌기.어긋 - 끌기.th.getBoundingClientRect().left));   /* v3 경계선 = 마우스 자리 */
      c.style.width = v + 'px';
      끌기.t.style.width = [...cg.children].reduce((s, x) => s + parseFloat(x.style.width), 0) + 'px';
      끌기.v = v; 선보임(끌기.th.getBoundingClientRect().right, 끌기.t.closest('.표통') || 끌기.t);
    }, true);
    const 끝 = e => {
      if(!끌기 || e.pointerId !== 끌기.id) return;
      const { h, th, t, 시작, v } = 끌기; 끌기 = null;
      h.classList.remove('끄는중'); document.body.classList.remove('칸끄는중'); 선끝();
      const k = 이름들(t)[머리들(t).indexOf(th)];
      if(시작){ if(k && v){ 넓[k] = v; 저장(); t.dataset.칸넓이 = 이름들(t).join('\t'); } 앞누름 = { 때:0, 손:null }; return; }
      if(e.type !== 'pointerup') return;
      const 지금 = Date.now();
      if(앞누름.손 === h && 지금 - 앞누름.때 < 두번간격){   /* 두 번 누름 = 그 칸 원래대로 */
        앞누름 = { 때:0, 손:null };
        if(k && 넓[k]){ delete 넓[k]; 저장(); 입히기(t); }
      } else 앞누름 = { 때:지금, 손:h };
    };
    뿌리.addEventListener('pointerup', 끝, true);
    뿌리.addEventListener('pointercancel', 끝, true);
    뿌리.addEventListener('click', e => { if(e.target.closest && e.target.closest('.칸넓이끈')){ e.preventDefault(); e.stopPropagation(); } }, true);
    return { 다시 };
  }
  /* v4 손잡이에서 시작한 터치 = 쪽·표 밀기·확대 안 함(pointer 끄는 셈은 그대로) — 이 파일·재단 .칸끈·보드매입현황 .열손 모두 */
  let 손터치 = false;
  document.addEventListener('touchstart', e => { const t = e.target; 손터치 = !!(t && t.closest && t.closest('.칸끈, .열손')); if(손터치 && e.cancelable) e.preventDefault(); }, { capture:true, passive:false });
  document.addEventListener('touchmove', e => { if(손터치 && e.cancelable) e.preventDefault(); }, { capture:true, passive:false });
  document.addEventListener('touchend', () => { 손터치 = false; }, true); document.addEventListener('touchcancel', () => { 손터치 = false; }, true);
  window.칸넓이 = { 달기, 선:선보임, 선끝 };
})();
