/* 쓰기지킴 — Firestore 쓰기 안전장치 (모든 페이지 공통, 11-23)
   사장님: 「이 앱은 앞으로 여러 사람이 계속 쓰게 될 앱인데, 이런 문제(옛 판 창이 공개 문서를 끝없이 덮어쓰기)는 발생 안 해야 되는 거 아닌가요?」
   쓰는 법: 페이지 <head> 에서 파이어베이스 모듈 스크립트보다 먼저 부른다.  <script src="../shared/쓰기지킴.js?v=11-23b"></script>
   · window.fbRead · fbFirestore · fb · FirebaseSDK 에 넣는 순간 setDoc · updateDoc · deleteDoc · addDoc · writeBatch(commit) · runTransaction 을 감싼다.
   · 그 밖 꼴은 페이지가 직접: 쓰기지킴.덮개(Object.assign({}, 모듈)) · 쓰기지킴.감쌈(fn, 'setDoc') · 쓰기지킴.컴팻(firebase)(compat SDK).
   ① 옛 판 막기 — 이 페이지 주소를 다시 받아(cache:'reload' → 브라우저 저장본도 새것) 판 표시를 견줌. 판 표시 = 머리 주석 「올린다: vX」 또는 「버전: vX」, 없으면 class="badge" 글.
      다르면 그 창 쓰기를 모두 거절(페이지의 저장 실패 알림이 그대로 뜸) · 화면 위 가는 빨간 띠(배지가 있으면 배지도 빨강) · 마우스 = 까닭 · 누르면 새 주소로 다시 엶.
      재는 때 = 연 뒤 3초 · 5분마다 · 창이 다시 보일 때. 판 표시가 없는 페이지는 이 검사를 안 함.
   ② 같은 내용 건너뜀 — 같은 문서에 같은 내용(데이터+옵션 글자)을 10초 안에 바로 또 쓰면 안 씀(쓴 것으로 돌려줌). setDoc·updateDoc 만.
   ③ 잦은 쓰기 멈춤 — 한 창이 같은 문서를 10초에 50번 넘게 쓰려 하면(setDoc·updateDoc·deleteDoc·addDoc 의 문서 길마다) 그 창 쓰기를 모두 멈춤(띠·배지 주황). 「임시」 한도.
      writeBatch · runTransaction 은 멈춘 창인지만 봄(셈 안 함 — 여러 문서를 한 번에 쓰는 정상 작업을 막지 않게).
   창고 규칙은 안 바꿈. 읽기는 그대로. */
(function(){
  if(window.쓰기지킴) return;
  const 한도 = { 같은내용초: 10, 창초: 10, 창횟수: 50, 재기분: 5 };
  const 상태 = { 멈춤: '', 최신: '', 지금: '', 기록: new Map(), 마지막: new Map() };
  const 판식 = [/(?:올린다|버전)[^:\n<>]{0,60}:\s*(v[0-9][0-9.]*)/, /class="badge"[^>]*>\s*(v[0-9][0-9.]*)\s*</];
  function 판뽑기(글){ for(const r of 판식){ const m = 글 && 글.match(r); if(m) return m[1]; } return ''; }
  function 지금판(){
    if(상태.처음판 !== undefined) return 상태.처음판;
    let 주석 = '';
    try{ const w = document.createTreeWalker(document, NodeFilter.SHOW_COMMENT); let n, k = 0; while((n = w.nextNode()) && k++ < 40){ const m = n.nodeValue.match(판식[0]); if(m){ 주석 = m[1]; break; } } }catch(e){}
    if(주석) return (상태.처음판 = 주석);
    const b = document.querySelector('.badge'), t = b ? b.textContent.trim() : '';
    return /^v[0-9][0-9.]*$/.test(t) ? t : '';   /* 배지는 화면이 다 그려진 뒤 생길 수 있어 기억하지 않음 */
  }
  let 띠 = null;
  function 칠(){
    if(!상태.멈춤 || !document.body) return;
    const 옛 = 상태.멈춤 === '옛판', 색 = 옛 ? '#e53935' : '#fb8c00';
    const 말 = 옛 ? `옛 판(지금 ${상태.지금} · 최신 ${상태.최신}) — 이 창은 저장을 멈췄습니다. 누르거나 새로고침하면 최신 판으로 엽니다.`
                 : `같은 문서를 ${한도.창초}초에 ${한도.창횟수}번 넘게 쓰려 해서 이 창의 저장을 멈췄습니다 — 새로고침하면 다시 저장됩니다.`;
    const 열기 = () => location.replace(location.pathname + '?v=' + Date.now() + location.hash);
    if(!띠){ 띠 = document.createElement('div'); 띠.style.cssText = 'position:fixed;left:0;right:0;top:0;height:5px;z-index:2147483647;cursor:pointer'; 띠.addEventListener('click', 열기); document.body.appendChild(띠); }
    띠.style.background = 색; 띠.title = 말;
    const b = document.querySelector('.badge');
    if(b){ b.style.background = 색; b.style.color = '#fff'; b.style.borderColor = 'transparent'; b.style.cursor = 'pointer'; b.title = 말;
      if(!b.dataset.지킴){ b.dataset.지킴 = '1'; b.addEventListener('click', 열기); } }
  }
  function 멈춤(왜){ if(상태.멈춤 === '옛판') return; 상태.멈춤 = 왜; if(document.body) 칠(); else document.addEventListener('DOMContentLoaded', 칠); console.warn('쓰기지킴: 저장 멈춤 —', 왜, 상태); }
  async function 판재기(){
    const 지금 = 지금판(); if(!지금 || 상태.멈춤 === '옛판') return;
    try{
      const r = await fetch(location.pathname + '?쓰기지킴=' + Date.now(), { cache: 'reload' });
      if(!r.ok) return;
      const 최신 = 판뽑기(await r.text()); if(!최신) return;
      상태.지금 = 지금; 상태.최신 = 최신;
      if(최신 !== 지금) 멈춤('옛판');
    }catch(e){ /* 못 재면 그대로 */ }
  }
  function 글자(v){ try{ return JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) && Object.getPrototypeOf(x) === Object.prototype) ? Object.keys(x).sort().reduce((o, kk) => (o[kk] = x[kk], o), {}) : x); }catch(e){ return null; } }
  function 길(ref){ try{ return (ref && (ref.path || (ref._key && String(ref._key)))) || '?'; }catch(e){ return '?'; } }
  function 거절(왜){ const e = new Error('쓰기지킴: ' + (왜 === '옛판' ? '옛 판 창 — 새로고침해 주세요' : '쓰기가 너무 잦아 멈춤 — 새로고침해 주세요')); e.code = '쓰기지킴/' + 왜; return Promise.reject(e); }
  function 셈(p){
    const t = Date.now(), 목 = (상태.기록.get(p) || []).filter(x => t - x < 한도.창초 * 1000); 목.push(t); 상태.기록.set(p, 목);
    return 목.length > 한도.창횟수;
  }
  function 감쌈(fn, 이름){
    if(typeof fn !== 'function' || fn.__지킴) return fn;
    let g;
    if(이름 === 'runTransaction') g = function(...a){ return 상태.멈춤 ? 거절(상태.멈춤) : fn.apply(this, a); };
    else if(이름 === 'writeBatch') g = function(...a){
      const b = fn.apply(this, a);
      if(b && typeof b.commit === 'function' && !b.commit.__지킴){ const c = b.commit; b.commit = function(...x){ return 상태.멈춤 ? 거절(상태.멈춤) : c.apply(this, x); }; b.commit.__지킴 = true; }
      return b; };
    else g = function(ref, ...a){
      if(상태.멈춤) return 거절(상태.멈춤);
      const p = 길(ref) + (이름 === 'addDoc' ? '/+' : '');
      if(이름 === 'setDoc' || 이름 === 'updateDoc'){
        const k = 글자(a), 옛 = 상태.마지막.get(p);
        if(k && 옛 && 옛.k === k && Date.now() - 옛.t < 한도.같은내용초 * 1000) return Promise.resolve();
        if(셈(p)){ 멈춤('잦음'); return 거절('잦음'); }
        const 결과 = fn.call(this, ref, ...a);
        Promise.resolve(결과).then(() => { if(k) 상태.마지막.set(p, { k, t: Date.now() }); }, () => {});
        return 결과;
      }
      if(셈(p)){ 멈춤('잦음'); return 거절('잦음'); }
      return fn.call(this, ref, ...a); };
    g.__지킴 = true; return g;
  }
  const 쓰기이름 = ['setDoc', 'updateDoc', 'deleteDoc', 'addDoc', 'writeBatch', 'runTransaction'];
  function 덮개(o){
    if(!o || (typeof o !== 'object' && typeof o !== 'function')) return o;
    for(const n of 쓰기이름) if(typeof o[n] === 'function'){ try{ o[n] = 감쌈(o[n], n); }catch(e){} }
    return o;
  }
  /* compat SDK(firebase-firestore-compat) — 문서·모음·묶음 원형을 감쌈 */
  function 컴팻(fb){
    try{
      const F = fb && fb.firestore; if(!F || F.__지킴) return; F.__지킴 = true;
      const 원 = (C, n, 이름) => { if(!C || !C.prototype || typeof C.prototype[n] !== 'function' || C.prototype[n].__지킴) return; const f = C.prototype[n];
        const g = 이름 === '묶음' ? null : 감쌈(function(ref, ...x){ return f.apply(ref, x); }, 이름);
        C.prototype[n] = g ? function(...a){ return g.call(null, this, ...a); } : function(...a){ return 상태.멈춤 ? 거절(상태.멈춤) : f.apply(this, a); };
        C.prototype[n].__지킴 = true; };
      원(F.DocumentReference, 'set', 'setDoc'); 원(F.DocumentReference, 'update', 'updateDoc'); 원(F.DocumentReference, 'delete', 'deleteDoc');
      원(F.CollectionReference, 'add', 'addDoc'); 원(F.WriteBatch, 'commit', '묶음');
    }catch(e){ console.warn('쓰기지킴: compat 감싸기 못 함', e); }
  }
  for(const 이름 of ['fbRead', 'fbFirestore', 'fb', 'FirebaseSDK']){
    let 속 = window[이름];
    try{ Object.defineProperty(window, 이름, { configurable: true, enumerable: true, get(){ return 속; }, set(v){ 속 = 덮개(v); } }); }catch(e){ continue; }
    if(속) 덮개(속);
  }
  window.쓰기지킴 = { 상태, 한도, 판재기, 칠, 덮개, 감쌈, 컴팻 };
  setTimeout(판재기, 3000);
  setInterval(판재기, 한도.재기분 * 60 * 1000);
  document.addEventListener('visibilitychange', () => { if(document.visibilityState === 'visible') 판재기(); });
})();
