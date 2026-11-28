/* 드롭끝.js v3 (11-28) — v3: input[list] 에 _업고르기(표입력.창 — 거래처 체크 드롭)가 달려 있으면 ▾ = 그 창(입력폼 시트로 보기 · 사장님 「드롭 선택 시 거래처명 필터 기능 모든 드롭 선택 칸에 적용시켜」).
   v2 (11-27) — v2: 칸 넓이를 끌어 바꾸는 동안에도 ▾ 가 글 끝을 따라감(ResizeObserver) · 사장님 「아니 각 셀은 넓히기 기능이 있잖아. 이게 넓어져서 입력값이 모두 나오는 자리에 버튼이 옮겨가게 하면 되잖아」
   v1 (11-27) — 드롭 단추(▾)를 칸 안 글자 끝 바로 뒤에, 글을 가리지 않게.
   사장님(분배 방 전달): 「야 모든 드롭선택 버튼 입력된 텍스트 좀 안 가리게 해야. 전부 적용 좀 해. 텍스트 끝에 셀 안에 두라니까」
   대상(이 파일을 부른 쪽 전부):
   · select(하나 고르기) — 브라우저 ▾ 를 걷고(appearance none) 같은 ▾ 그림을 고른 글 끝 3px 뒤에 · 오른쪽 16px 비움(글이 길면 … 로 줄고 ▾ 는 그 뒤).
   · input[list](datalist) — 브라우저 ▾ 를 걷고 같은 자리에(마우스 올림·칸에 있을 때만 — 전과 같음) · ▾ 누름 = 목록 엶(showPicker).
   · input[data-분류](보드매입현황) · input.clsdd(입력폼 분류) — 쪽이 그리는 ▾ 자리만 글 끝으로(--끝x) · 누름 판단 = 드롭끝.누름.
   글 끝 = 칸 글꼴로 잰 글 너비 + 왼쪽 여백(+ 들여쓰기) · 오른쪽 맞춤 칸은 글 끝 = 오른쪽 여백 앞.
   다시 잼 = 그릴 때(MutationObserver) · 글 치기·고르기 · 손 뗌·글쇠 뗌 · 창 크기. 동작(고르기·목록·저장)은 안 바꿈. */
(function(){
  if(window.드롭끝) return;
  const 그림 = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0h8L4 5z' fill='%23767672'/%3E%3C/svg%3E\")";
  const 자리 = 'background-repeat:no-repeat!important;background-position:var(--끝x,calc(100% - 12px)) 50%!important;background-size:8px 5px!important';
  const st = document.createElement('style');
  st.textContent =
    'select.끝세모{-webkit-appearance:none!important;appearance:none!important;background-image:' + 그림 + '!important;' + 자리 + ';padding-right:16px!important;text-overflow:ellipsis}' +
    'input.끝세모{padding-right:16px!important;text-overflow:ellipsis}input.끝세모::-webkit-calendar-picker-indicator{display:none!important}' +
    'input.끝세모:hover,input.끝세모:focus{background-image:' + 그림 + '!important;' + 자리 + '}' +
    'input.끝세모칸{padding-right:16px!important;text-overflow:ellipsis}input.끝세모칸:focus{' + 자리 + '}' +
    'td.표입력세모칸 select.끝세모,td.표입력세모칸 input.끝세모,td.표입력세모칸 input.끝세모칸{background-image:none!important}';   /* 표입력.js ▾ 가 같은 자리에 뜬 칸 = 한 개만 */
  document.head.appendChild(st);
  const 판 = document.createElement('canvas').getContext('2d');
  const 고름 = 'select:not([multiple]), input[list], input[data-분류], input.clsdd';
  const 글 = el => el.tagName === 'SELECT' ? ((el.options[el.selectedIndex] || {}).text || '') : (el.value || el.placeholder || '');
  const 본 = new WeakSet(), 크기봄 = window.ResizeObserver ? new ResizeObserver(들 => 들.forEach(x => 재기(x.target))) : null;   /* v2 칸 넓이를 끄는 동안 ▾ 가 글 끝을 따라감 */
  function 재기(el){
    if(!el || !el.isConnected || !el.matches(고름)) return;
    if(크기봄 && !본.has(el)){ 본.add(el); 크기봄.observe(el); }
    if(el.tagName === 'SELECT'){ if(el.size > 1) return; el.classList.add('끝세모'); }
    else if(el.hasAttribute('list')) el.classList.add('끝세모');
    else el.classList.add('끝세모칸');
    const 안 = el.clientWidth; if(!안) return;
    const cs = getComputedStyle(el);
    판.font = cs.font || (cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily);
    const 왼 = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.textIndent) || 0), 오 = parseFloat(cs.paddingRight) || 0;
    const w = 판.measureText(글(el)).width;
    let x = (cs.textAlign === 'right' || cs.textAlign === 'end') ? 안 - 오 + 3 : 왼 + Math.min(w, Math.max(0, 안 - 왼 - 오)) + 3;
    x = Math.max(2, Math.min(x, 안 - 11));
    const v = Math.round(x) + 'px'; if(el.style.getPropertyValue('--끝x') !== v) el.style.setProperty('--끝x', v);
  }
  let 틀 = 0;
  function 모두(){ 틀 = 0; document.querySelectorAll(고름).forEach(재기); }
  const 예약 = () => { if(!틀) 틀 = requestAnimationFrame(모두); };
  function 누름(el, e){   /* 이 칸의 ▾ 자리를 눌렀나(글 끝 뒤 ▾ ±) */
    const r = el.getBoundingClientRect(), x = parseFloat(el.style.getPropertyValue('--끝x'));
    if(isNaN(x)) return e.clientX >= r.right - 16;
    const cx = e.clientX - r.left - (el.clientLeft || 0);
    return cx >= x - 4 && cx <= x + 14;
  }
  ['input', 'change', 'focusin', 'mouseover'].forEach(t => document.addEventListener(t, e => { const el = e.target; if(el && el.matches && el.matches(고름)) 재기(el); }, true));
  ['pointerup', 'keyup'].forEach(t => document.addEventListener(t, 예약, true));
  addEventListener('resize', 예약);
  document.addEventListener('click', e => { const el = e.target;   /* datalist ▾ = 목록 엶 */
    if(el && el.tagName === 'INPUT' && el.classList.contains('끝세모') && 누름(el, e)){ if(typeof el._업고르기 === 'function'){ e.preventDefault(); el._업고르기(); return; } if(el.showPicker){ try{ el.showPicker(); }catch(_){} } } }, true);   /* v3 업고르기(표입력.창 — 거래처 체크)가 달린 칸은 그 창 */
  const 보기 = () => { 모두(); new MutationObserver(예약).observe(document.body, { childList:true, subtree:true }); };
  if(document.body) 보기(); else document.addEventListener('DOMContentLoaded', 보기);
  window.드롭끝 = { 재기, 모두:예약, 누름 };
})();
