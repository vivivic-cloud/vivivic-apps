/* 쓰기지킴 — Firestore 쓰기 안전장치 (발주역입력 페이지 공통, 11-23)
   사장님: 「이 앱은 앞으로 여러 사람이 계속 쓰게 될 앱인데, 이런 문제(옛 판 창이 공개 문서를 끝없이 덮어쓰기)는 발생 안 해야 되는 거 아닌가요?」
   쓰는 법: 페이지 <head> 에서 모듈 스크립트(window.fbRead = {…} 를 만드는 곳)보다 먼저 이 파일을 부른다.
     <script src="../shared/쓰기지킴.js?v=11-23"></script>
   window.fbRead 에 넣는 순간 setDoc · deleteDoc · updateDoc · addDoc 을 감싼다(페이지 코드는 그대로 window.fbRead.setDoc 을 부르면 됨).
   ① 옛 판 막기 — 이 페이지 주소를 새로 받아(cache:'reload' → 브라우저 저장본도 새것으로) 그 안 배지 판(class="badge">vX)과 지금 화면 배지를 견줌.
      다르면 쓰기를 모두 멈추고(거절 — 페이지의 「저장 실패」 알림이 그대로 뜸) 배지를 빨강, 마우스 = 까닭. 배지를 누르면 새 주소로 다시 엶. 그냥 새로고침해도 받은 새 판이 뜸.
      재는 때 = 연 뒤 3초 · 5분마다 · 창이 다시 보일 때.
   ② 끝없는 쓰기 막기 — 같은 문서에 같은 내용(데이터+옵션 글자)을 10초 안에 다시 쓰면 건너뜀(쓴 것으로 돌려줌).
      한 창이 같은 문서를 10초에 50번 넘게 쓰려 하면 그 창의 쓰기를 모두 멈춤(배지 주황). 「임시」 값 — 아래 한도.
   창고 규칙은 안 바꿈. 읽기(getDoc·onSnapshot)는 그대로. */
(function(){
  if(window.쓰기지킴) return;
  const 한도 = { 같은내용초: 10, 창초: 10, 창횟수: 50, 재기분: 5 };
  const 상태 = { 멈춤: '', 최신: '', 지금: '', 기록: new Map(), 마지막: new Map() };
  const 배지 = () => document.querySelector('.badge');
  const 지금판 = () => { const b = 배지(); return b ? b.textContent.trim() : ''; };
  function 칠(){
    const b = 배지(); if(!b || !상태.멈춤) return;
    b.style.background = 상태.멈춤 === '옛판' ? '#e53935' : '#fb8c00'; b.style.color = '#fff'; b.style.borderColor = 'transparent'; b.style.cursor = 'pointer';
    b.title = 상태.멈춤 === '옛판'
      ? `옛 판(지금 ${상태.지금} · 최신 ${상태.최신}) — 이 창은 저장을 멈췄습니다. 누르거나 새로고침하면 최신 판으로 엽니다.`
      : `같은 문서를 ${한도.창초}초에 ${한도.창횟수}번 넘게 쓰려 해서 이 창의 저장을 멈췄습니다 — 새로고침하면 다시 저장됩니다.`;
    if(!b.dataset.지킴){ b.dataset.지킴 = '1'; b.addEventListener('click', () => { location.replace(location.pathname + '?v=' + Date.now() + location.hash); }); }
  }
  function 멈춤(왜){ if(상태.멈춤 === '옛판') return; 상태.멈춤 = 왜; 칠(); console.warn('쓰기지킴: 저장 멈춤 —', 왜, 상태); }
  async function 판재기(){
    const 지금 = 지금판(); if(!지금 || 상태.멈춤 === '옛판') return;
    try{
      const r = await fetch(location.pathname + '?쓰기지킴=' + Date.now(), { cache: 'reload' });
      if(!r.ok) return;
      const 글 = await r.text(), m = 글.match(/class="badge"[^>]*>\s*(v[0-9][0-9.]*)\s*</);
      if(!m) return;
      상태.지금 = 지금; 상태.최신 = m[1];
      if(m[1] !== 지금) 멈춤('옛판');
    }catch(e){ /* 못 재면 그대로(오프라인 등) */ }
  }
  function 글자(v){ try{ return JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x)) ? Object.keys(x).sort().reduce((o, kk) => (o[kk] = x[kk], o), {}) : x); }catch(e){ return null; } }
  function 길(ref){ return (ref && (ref.path || (ref._key && String(ref._key)))) || '?'; }
  function 거절(왜){ const e = new Error('쓰기지킴: ' + (왜 === '옛판' ? '옛 판 창 — 새로고침해 주세요' : '쓰기가 너무 잦아 멈춤 — 새로고침해 주세요')); e.code = '쓰기지킴/' + 왜; return Promise.reject(e); }
  function 셈(p){
    const t = Date.now(), 목 = (상태.기록.get(p) || []).filter(x => t - x < 한도.창초 * 1000); 목.push(t); 상태.기록.set(p, 목);
    return 목.length > 한도.창횟수;
  }
  function 감쌈(fn, 이름){
    if(typeof fn !== 'function' || fn.__지킴) return fn;
    const g = function(ref, ...a){
      if(상태.멈춤) return 거절(상태.멈춤);
      const p = 길(ref);
      if(이름 === 'setDoc' || 이름 === 'updateDoc'){
        const k = 글자(a), 옛 = 상태.마지막.get(p);
        if(k && 옛 && 옛.k === k && Date.now() - 옛.t < 한도.같은내용초 * 1000) return Promise.resolve();   /* 같은 내용 = 안 씀 */
        if(셈(p)){ 멈춤('잦음'); return 거절('잦음'); }
        const 결과 = fn.call(this, ref, ...a);
        Promise.resolve(결과).then(() => { if(k) 상태.마지막.set(p, { k, t: Date.now() }); }, () => {});
        return 결과;
      }
      if(셈(p)){ 멈춤('잦음'); return 거절('잦음'); }
      return fn.call(this, ref, ...a);
    };
    g.__지킴 = true; return g;
  }
  function 덮개(o){
    if(!o || typeof o !== 'object') return o;
    for(const n of ['setDoc', 'deleteDoc', 'updateDoc', 'addDoc']) if(n in o) o[n] = 감쌈(o[n], n);
    return o;
  }
  let 속 = window.fbRead;
  Object.defineProperty(window, 'fbRead', { configurable: true, get(){ return 속; }, set(v){ 속 = 덮개(v); } });
  if(속) 덮개(속);
  window.쓰기지킴 = { 상태, 한도, 판재기, 칠 };
  setTimeout(판재기, 3000);
  setInterval(판재기, 한도.재기분 * 60 * 1000);
  document.addEventListener('visibilitychange', () => { if(document.visibilityState === 'visible') 판재기(); });
})();
