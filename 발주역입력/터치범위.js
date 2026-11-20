/* 발주역입력 폰(터치) 범위 고르기 · 복사 · 붙여넣기 · 채우기 · 지우기 (11-21 — 보드매입현황 v1.40.0 · 영림원품목등록 v2.34.0 부터)
   사장님 「모바일 환경에서는 복사드레그도 안되는듯합니다」 → 「추천방식을 적용해 주세요」.
   ① 입력 칸을 손가락으로 누르면 그 칸 고름 — 파란 틀 + 오른쪽 아래 동그라미 손잡이 + 위(자리 없으면 아래)에 단추 띠 「복사 · 붙여넣기 · 채우기 · 지우기」.
   ② 손잡이를 끌면 범위가 넓어짐(표 상자 끝에 닿으면 저절로 밀림). 손잡이 밖을 끌면 원래대로 표가 밀림.
   ③ 채우기 = 열마다 범위 맨 위 칸 값을 그 열 아래 칸에 · 붙여넣기 = 복사한 값이 한 칸이면 범위 모두, 여러 칸이면 범위 왼쪽 위부터 그대로 · 지우기 = 범위 입력 칸 빈칸.
   ④ 입력 칸이 아닌 칸은 안 건드림(쪽 규칙 그대로 — 막음 칸이 범위에 있으면 그 쪽 알림).
   ⑤ 마우스(PC)는 이 파일이 아무것도 안 함 — pointerType 'touch' 만 봄.
   쓰는 법: 터치범위.표(table 요소, { 칸: td => 입력 칸인가, 읽기: td => 보이는 값, 쓰기: [[td, 값]…] => 쪽의 저장 길, 막음?: td => bool, 알림?: td => () })
   표를 다시 그리면 다시 부른다(같은 표면 덮어씀). 저장은 쪽 코드가(PC 끌기 복사·붙여넣기와 같은 길). */
(function(){
  const 꼴 = document.createElement('style');
  꼴.textContent =
    '.터치틀{position:fixed;z-index:40;border:2px solid #1565c0;background:rgba(21,101,192,.08);pointer-events:none;box-sizing:border-box;display:none}' +
    '.터치손{position:fixed;z-index:42;width:36px;height:36px;margin:-18px 0 0 -18px;touch-action:none;display:none;align-items:center;justify-content:center;-webkit-tap-highlight-color:transparent}' +
    '.터치손::after{content:"";width:14px;height:14px;border-radius:50%;background:#fff;border:2px solid #1565c0;box-shadow:0 1px 3px rgba(0,0,0,.3)}' +
    '.터치띠{position:fixed;z-index:45;display:none;gap:2px;background:#1A1A19;border-radius:8px;padding:3px;box-shadow:0 4px 14px rgba(0,0,0,.2)}' +
    '.터치띠 button{font:inherit;font-size:13px;font-weight:600;color:#fff;background:transparent;border:0;border-radius:6px;padding:8px 11px;min-height:36px;-webkit-tap-highlight-color:transparent}' +
    '.터치띠 button:active{background:rgba(255,255,255,.22)}';
  document.head.appendChild(꼴);
  const 틀 = document.createElement('div'); 틀.className = '터치틀';
  const 손 = document.createElement('div'); 손.className = '터치손';
  const 띠 = document.createElement('div'); 띠.className = '터치띠';
  띠.innerHTML = '<button type="button" data-a="복사">복사</button><button type="button" data-a="붙여넣기">붙여넣기</button><button type="button" data-a="채우기">채우기</button><button type="button" data-a="지우기">지우기</button>';
  const 붙임 = () => { if(!틀.isConnected) document.body.append(틀, 손, 띠); };
  if(document.body) 붙임(); else document.addEventListener('DOMContentLoaded', 붙임);

  const 어들 = new WeakMap();
  let 지금 = null, 버퍼 = '', 누름 = null, 끌기 = null, 그림틀 = 0;
  const 보임 = td => !!td && td.offsetParent !== null && !td.parentNode.hidden;
  const 줄들 = t => t.tBodies[0] ? [...t.tBodies[0].rows] : [];
  const 범위 = () => [Math.min(지금.r0, 지금.r1), Math.min(지금.c0, 지금.c1), Math.max(지금.r0, 지금.r1), Math.max(지금.c0, 지금.c1)];
  function 칸판(){   /* 범위 안 보이는 칸 [[td…]…] (보이는 줄 · 보이는 열만) */
    const [r0, c0, r1, c1] = 범위(), 줄 = 줄들(지금.표), 판 = [];
    for(let r = r0; r <= r1; r++){ const tr = 줄[r]; if(!tr || tr.hidden) continue;
      const 칸 = []; for(let c = c0; c <= c1; c++){ const td = tr.cells[c]; if(td && 보임(td)) 칸.push(td); }
      if(칸.length) 판.push(칸); }
    return 판;
  }
  function 끝(){ 지금 = null; 틀.style.display = 손.style.display = 띠.style.display = 'none'; }
  function 그리기(){
    그림틀 = 0;
    if(!지금) return;
    if(!지금.표.isConnected){ 끝(); return; }
    const 판 = 칸판(); if(!판.length){ 끝(); return; }
    let L = Infinity, T = Infinity, R = -Infinity, B = -Infinity;
    for(const 줄 of 판) for(const td of [줄[0], 줄[줄.length - 1]]){ const q = td.getBoundingClientRect(); L = Math.min(L, q.left); T = Math.min(T, q.top); R = Math.max(R, q.right); B = Math.max(B, q.bottom); }
    const 통 = 지금.표.closest('.표통') || 지금.표.parentNode, s = 통.getBoundingClientRect();
    const 머 = 지금.표.tHead ? 지금.표.tHead.getBoundingClientRect().bottom : s.top;
    const 보 = { l:Math.max(L, s.left), t:Math.max(T, s.top, Math.min(머, s.bottom)), r:Math.min(R, s.right - 10), b:Math.min(B, s.bottom - 10) };
    if(보.r <= 보.l || 보.b <= 보.t){ 틀.style.display = 손.style.display = 'none'; }
    else {
      Object.assign(틀.style, { display:'block', left:보.l + 'px', top:보.t + 'px', width:(보.r - 보.l) + 'px', height:(보.b - 보.t) + 'px' });
      Object.assign(손.style, { display:'flex', left:Math.min(R, 보.r - 6) + 'px', top:Math.min(B, 보.b - 6) + 'px' });   /* 범위 끝이 상자 밖이면 보이는 끝에 — 거기서 끌면 저절로 밀림 */
    }
    if(끌기){ 띠.style.display = 'none'; return; }
    띠.style.display = 'flex';
    const w = 띠.offsetWidth, h = 띠.offsetHeight, 끝아래 = window.visualViewport ? visualViewport.offsetTop + visualViewport.height : innerHeight;
    let y = 보.t - h - 10; if(y < 4) y = Math.min(끝아래 - h - 4, Math.max(보.b, 보.t) + 22);
    const x = Math.max(4, Math.min(innerWidth - w - 4, (보.l + Math.min(보.r, innerWidth)) / 2 - w / 2));
    띠.style.left = x + 'px'; 띠.style.top = Math.max(4, y) + 'px';
  }
  const 다시 = () => { if(지금 && !그림틀) 그림틀 = requestAnimationFrame(그리기); };
  function 고르기(td){
    const 표 = td.closest('table'), 어 = 어들.get(표); if(!어) return false;
    const r = 줄들(표).indexOf(td.parentNode), c = td.cellIndex;
    지금 = { 표, 어, r0:r, c0:c, r1:r, c1:c }; 그리기(); return true;
  }
  const 표의칸 = (x, y) => {
    for(const el of document.elementsFromPoint(x, y)){ const td = el.closest && el.closest('td'); if(td && 지금 && td.closest('table') === 지금.표 && 보임(td)) return td; }
    return null;
  };

  /* 누름(짧게, 안 밀고) = 고름 · 다른 데 누름 = 풂 */
  document.addEventListener('pointerdown', e => {
    if(e.pointerType !== 'touch') return;
    누름 = (e.target.closest && (e.target.closest('.터치띠') || e.target.closest('.터치손'))) ? null : { x:e.clientX, y:e.clientY, 때:Date.now(), el:e.target };
  }, true);
  document.addEventListener('pointercancel', e => { if(e.pointerType === 'touch') 누름 = null; }, true);
  document.addEventListener('pointerup', e => {
    if(e.pointerType !== 'touch' || !누름) return;
    const n = 누름; 누름 = null;
    if(Math.hypot(e.clientX - n.x, e.clientY - n.y) > 10 || Date.now() - n.때 > 800) return;
    const td = n.el.closest && n.el.closest('td'), 표 = td && td.closest('table'), 어 = 표 && 어들.get(표);
    if(어 && 어.칸(td)) 고르기(td); else 끝();
  }, true);
  addEventListener('scroll', 다시, true); addEventListener('resize', 다시);
  if(window.visualViewport){ visualViewport.addEventListener('resize', 다시); visualViewport.addEventListener('scroll', 다시); }

  /* 손잡이 끌기 = 범위 넓히기(표 상자 끝 = 저절로 밀기) */
  손.addEventListener('pointerdown', e => {
    if(!지금) return; e.preventDefault(); e.stopPropagation();
    try{ 손.setPointerCapture(e.pointerId); }catch(_){}
    끌기 = { x:e.clientX, y:e.clientY, sx:e.clientX, sy:e.clientY, id:e.pointerId }; 띠.style.display = 'none';
    끌기.틀 = requestAnimationFrame(밀기);
  });
  function 넓히기(){
    const td = 표의칸(끌기.x, 끌기.y); if(!td) return;
    const r = 줄들(지금.표).indexOf(td.parentNode), c = td.cellIndex;
    if(r !== 지금.r1 || c !== 지금.c1){ 지금.r1 = r; 지금.c1 = c; 그리기(); }
  }
  function 밀기(){
    if(!끌기 || !지금) return;
    const 통 = 지금.표.closest('.표통'); if(통){
      const s = 통.getBoundingClientRect(); let dy = 0, dx = 0;
      /* 손가락이 그쪽으로 실제로 움직였을 때만(손잡이가 처음부터 상자 끝에 있어도 옆으로 안 튐) */
      if(끌기.y > s.bottom - 28 && 끌기.y > 끌기.sy + 8) dy = 12; else if(끌기.y < s.top + 40 && 끌기.y < 끌기.sy - 8) dy = -12;
      if(끌기.x > s.right - 28 && 끌기.x > 끌기.sx + 8) dx = 12; else if(끌기.x < s.left + 28 && 끌기.x < 끌기.sx - 8) dx = -12;
      if(dy || dx){ 통.scrollTop += dy; 통.scrollLeft += dx; 넓히기(); }
    }
    끌기.틀 = requestAnimationFrame(밀기);
  }
  손.addEventListener('pointermove', e => { if(!끌기 || e.pointerId !== 끌기.id) return; e.preventDefault(); 끌기.x = e.clientX; 끌기.y = e.clientY; 넓히기(); });
  const 끌끝 = e => { if(!끌기 || e.pointerId !== 끌기.id) return; cancelAnimationFrame(끌기.틀); 끌기 = null; 그리기(); };
  손.addEventListener('pointerup', 끌끝); 손.addEventListener('pointercancel', 끌끝);

  /* 단추 */
  const 칸값 = td => String(지금.어.칸(td) ? 지금.어.읽기(td) : td.textContent.trim()).replace(/[\t\r\n]+/g, ' ');
  function 막음보기(tds){ if(!지금.어.막음 || !지금.어.알림) return; const 막 = tds.find(td => 지금.어.막음(td)); if(막) 지금.어.알림(막); }
  function 쓰기(목){ const 어 = 지금.어; if(목.length) 어.쓰기(목); 다시(); }
  async function 누른단추(a){
    if(!지금) return;
    const 판 = 칸판(), 모두 = 판.flat(), 어 = 지금.어;
    if(a === '복사'){
      버퍼 = 판.map(줄 => 줄.map(칸값).join('\t')).join('\n');
      try{ await navigator.clipboard.writeText(버퍼); }catch(_){}
      return;
    }
    if(a === '지우기'){ 막음보기(모두); 쓰기(모두.filter(td => 어.칸(td)).map(td => [td, ''])); return; }
    if(a === '채우기'){
      막음보기(모두); const 목 = [], 열수 = Math.max(...판.map(줄 => 줄.length));
      for(let j = 0; j < 열수; j++){
        const 열 = 판.map(줄 => 줄[j]).filter(Boolean), 위 = 열.find(td => 어.칸(td)); if(!위) continue;
        const v = 어.읽기(위); for(const td of 열) if(td !== 위 && 어.칸(td) && 열.indexOf(td) > 열.indexOf(위)) 목.push([td, v]);
      }
      쓰기(목); return;
    }
    if(a === '붙여넣기'){
      let 글 = null; try{ 글 = await navigator.clipboard.readText(); }catch(_){}
      if(글 == null || 글 === '') 글 = 버퍼; if(!글) return;
      const 줄 = String(글).replace(/\r\n?/g, '\n').replace(/\n$/, '').split('\n').map(l => l.split('\t').map(v => v.replace(/^"(.*)"$/s, '$1').replace(/""/g, '"')));
      if(줄.length === 1 && 줄[0].length === 1){ 막음보기(모두); 쓰기(모두.filter(td => 어.칸(td)).map(td => [td, 줄[0][0]])); return; }
      /* 여러 칸 = 범위 왼쪽 위부터 보이는 줄·열 차례로(범위보다 크면 넓힘) */
      const [r0, c0] = 범위(), 표줄 = 줄들(지금.표).slice(r0).filter(tr => !tr.hidden), 목 = [], 닿은 = [];
      let 끝r = 지금.r1, 끝c = 지금.c1;
      for(let i = 0; i < 줄.length && i < 표줄.length; i++){
        const 보칸 = [...표줄[i].cells].slice(c0).filter(보임);
        for(let j = 0; j < 줄[i].length && j < 보칸.length; j++){ const td = 보칸[j]; 닿은.push(td); if(어.칸(td)) 목.push([td, 줄[i][j]]);
          끝r = Math.max(끝r, 줄들(지금.표).indexOf(td.parentNode)); 끝c = Math.max(끝c, td.cellIndex); }
      }
      지금.r0 = Math.min(지금.r0, 지금.r1); 지금.c0 = Math.min(지금.c0, 지금.c1); 지금.r1 = 끝r; 지금.c1 = 끝c;
      막음보기(닿은); 쓰기(목);
    }
  }
  띠.addEventListener('pointerdown', e => e.preventDefault());   /* 입력 칸 초점·글쇠판 그대로 */
  띠.addEventListener('click', e => { const b = e.target.closest('button'); if(b) 누른단추(b.dataset.a); });

  window.터치범위 = { 표(표, 어){ if(표) 어들.set(표, 어); }, 어:표 => 어들.get(표), 끝, 지금:() => 지금 && { 범위:범위(), 표:지금.표 } };
})();
