/* 질문 — 입력폼 + 발주역입력 한 프로그램 안 「질문」(2026-11-28 사장님 「4 페이지를 만들자」).
   자료 = 파이어스토어 erp_questions — 질문 하나 = 문서 하나.
     {자리:'입력폼/classes' | '발주역입력/재단', 자리이름:'기본입력 › 5. 품목대중소분류정의', 질문, 보낸이, 만든때(ISO),
      상태:'대기'|'답함'|'실행함', 답, 답한때, 답한이, 실행한때, 시험(true = 시험 질문)}
   v6(11-28) 사장님 「질문 트리에 해당 영역에 대한 지시 요청을 제가 적을 수 있게 해 주세요」 — 지시 = 같은 컬렉션 문서 {종류:'지시', 자리, 자리이름, 링크, 지시(글), 보낸이, 만든때,
      상태:'새 지시'|'받음'|'끝남', 받은때, 끝난때, 메모(작업자)} · 사장님이 질문트리.html 에서 적음 · 작업자 = 입력작업자/스크립트/지시.py 로 받음·끝남.
      질문 화면·수(대기·답함·실행함)·「답 없는 질문」 수는 지시를 빼고 셈(전과 같음) · 지시는 따로: 페이지 위 칸 「지시」 · 모음 「새 지시」 · 머리 단추 「· 지시 N」(끝남 아닌 것).
   화면: 각 메뉴·페이지 위 = 그 자리 질문만(대기 = 답 칸 · 답함/실행함 = 접힌 「지난 질문」) · 입력폼 머리 「답 없는 질문 N」 = 모든 대기 모음.
   로그인 = 입력폼 로그인(파이어베이스 앱 이름 'erp-input') 그대로 — 따로 로그인·익명 로그인 안 함. 쓰기는 쓰기지킴 거침.
   쓰는 법
     입력폼: 질문.붙임({F, fs, who}) (F = 감싼 firestore 함수 모음) → 질문.달기(칸, 자리, 자리이름) · 질문.모음(칸, 나무)
     발주역입력 쪽: <script src="../shared/질문.js?v=1"></script><script>질문.스스로('발주역입력/재단','재단');</script> (body 끝) */
(function(){
  if(window.질문) return;
  var COL = 'erp_questions', V = 'https://www.gstatic.com/firebasejs/11.2.0/';
  var C = null, 목록 = null, 듣는이 = [], 끄기 = null;
  var 트 = function(v){ return String(v == null ? '' : v).trim(); };
  var 지시냐 = function(q){ return q && q.종류 === '지시'; }, 열린지시 = function(q){ return 지시냐(q) && (q.상태 || '새 지시') !== '끝남'; };   /* v6 */
  var 질문들 = function(){ return (목록 || []).filter(function(q){ return !지시냐(q); }); };
  function h(tag, at, kids){ var e = document.createElement(tag); at = at || {};
    Object.keys(at).forEach(function(k){ if(k === 'on') Object.keys(at.on).forEach(function(n){ e.addEventListener(n, at.on[n]); });
      else if(k === 'class') e.className = at[k]; else if(at[k] != null && at[k] !== false) e.setAttribute(k, at[k] === true ? '' : at[k]); });
    [].concat(kids == null ? [] : kids).forEach(function(c){ if(c == null || c === '') return; e.append(c.nodeType ? c : String(c)); });
    return e; }
  function 때(s){ s = 트(s); if(!s) return ''; var d = new Date(s); if(isNaN(d)) return s;
    var p = function(n){ return (n < 10 ? '0' : '') + n; }; return (d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()); }
  function 꾸밈(){ if(document.getElementById('qna-css')) return;
    var st = document.createElement('style'); st.id = 'qna-css';
    st.textContent = '.qna{margin:0 0 14px;font-size:13px;line-height:1.5}'
      + '.qna .qh{display:flex;align-items:center;gap:8px;font-weight:700;margin:0 0 6px}'
      + '.qna .qn{display:inline-block;min-width:18px;padding:0 6px;border-radius:9px;background:#E5B800;color:#1A1A19;font-size:12px;text-align:center}'
      + '.qna .qc{border:1px solid #E5B800;background:#FFF7C2;border-radius:8px;padding:8px 10px;margin:0 0 8px}'
      + '.qna .qc.답함{border-color:#2383e2;background:#E8F1FB}.qna .qc.실행함{border-color:#2e7d32;background:#E6F4EA}'
      + '.qna .qq{white-space:pre-wrap;overflow-wrap:anywhere;font-weight:600}'
      + '.qna .qm{color:#6b6b68;font-size:11.5px;margin:2px 0 0}'
      + '.qna .qa{white-space:pre-wrap;overflow-wrap:anywhere;margin:6px 0 0;padding:6px 8px;background:#fff;border-radius:6px}'
      + '.qna .qf{display:flex;gap:6px;align-items:flex-start;margin:6px 0 0}'
      + '.qna textarea{flex:1 1 auto;min-width:0;min-height:38px;font:inherit;font-size:13px;padding:6px 8px;border:1px solid #d6d6d2;border-radius:6px;background:#fff;box-sizing:border-box;resize:vertical}'
      + '.qna button{font:inherit;font-size:12.5px;font-weight:700;padding:7px 12px;border-radius:8px;border:1px solid #1A1A19;background:#1A1A19;color:#fff;cursor:pointer;min-height:36px}'
      + '.qna button:disabled{opacity:.45;cursor:default}'
      + '.qna details>summary{cursor:pointer;color:#6b6b68;font-size:12.5px;margin:2px 0 6px}'
      + '.qna .qg{font-weight:700;margin:10px 0 4px}.qna .qg a{color:inherit}'
      + '.qna .qe{color:#b91c1c;font-size:12px;margin:4px 0 0}'
      + '.qna .qc.지시{border-color:#7E57C2;background:#F3EEFB}.qna .qc.지시.받음{border-color:#2383e2;background:#E8F1FB}.qna .qc.지시.끝남{border-color:#2e7d32;background:#E6F4EA}'   /* v6 지시 */
      + '.qna .qn.지{background:#7E57C2;color:#fff}.qna .qs{display:inline-block;margin-left:6px;padding:0 6px;border-radius:8px;font-size:11px;font-weight:700;background:#fff;border:1px solid currentColor}'
      + '.qna a.ql{color:#2383e2;text-decoration:underline;overflow-wrap:anywhere}'
      + '.qtree details{margin:0 0 2px 14px}.qtree>details{margin-left:0}.qtree summary{cursor:pointer;padding:3px 0;display:flex;align-items:center;gap:8px;list-style-position:inside}'
      + '.qtree summary::-webkit-details-marker{margin-right:2px}.qtree .qtc{display:inline-flex;gap:4px;margin-left:auto}'
      + '.qtree .qtn{min-width:20px;padding:0 6px;border-radius:9px;font-size:11.5px;text-align:center;font-weight:700}'
      + '.qtree .qtn.대기{background:#FFF7C2;color:#8a6d00}.qtree .qtn.답함{background:#E8F1FB;color:#1b5fa8}.qtree .qtn.실행함{background:#E6F4EA;color:#2e7d32}.qtree .qtn.영{color:#b4b4b0}'
      + '.qtree .qc{margin:4px 0 8px 14px}'
      + '.qna-btn{font:inherit;font-size:12px;font-weight:600;padding:5px 12px;border-radius:999px;border:1px solid #d6d6d2;background:#fff;color:#1A1A19;cursor:pointer;margin-left:auto;white-space:nowrap}'
      + '.qna-btn.qna-tr{margin-left:0;text-decoration:none;display:inline-block}.qna-btn[hidden]{display:none}'
      + '.qna-btn.on{background:#FFF7C2;border-color:#E5B800}.qna-btn[aria-pressed="true"]{box-shadow:inset 0 0 0 2px #1A1A19}';
    document.head.append(st); }
  function 알림(){ 듣는이.forEach(function(f){ try{ f(); }catch(e){ console.warn('질문 그리기', e); } }); }
  function 붙임(c){
    C = c; if(끄기){ try{ 끄기(); }catch(e){} 끄기 = null; }
    try{
      끄기 = c.F.onSnapshot(c.F.collection(c.fs, COL), function(sn){
        목록 = sn.docs.map(function(d){ return Object.assign({ id:d.id }, d.data()); })
          .sort(function(a, b){ return 트(a.만든때) < 트(b.만든때) ? -1 : 1; });
        알림(); }, function(e){ console.warn('질문 읽기', e); 목록 = null; 알림(); });
    }catch(e){ console.warn('질문 연결', e); }
  }
  function 답하기(q, 글, 버튼, 틀){
    글 = 트(글); if(!글 || !C) return;
    버튼.disabled = true;
    C.F.updateDoc(C.F.doc(C.fs, COL, q.id), { 상태:'답함', 답:글, 답한때:new Date().toISOString(), 답한이:C.who || '' })
      .catch(function(e){ 버튼.disabled = false; if(틀) 틀.textContent = '저장하지 못했습니다 — ' + ((e && (e.code || e.message)) || ''); });
  }
  /* 11-28 사장님 「질문에 해당 부분 링크도 걸어 줄 수 있냐」 — 링크 = 저장소 뿌리에서 본 주소(예: 발주역입력/보드매입현황.html#현진산업/구매%2B가공품목/구매자재).
     없으면 자리로: 입력폼/<키> → 영림원외주입력/영림원외주입력.html#<키> · 발주역입력/<파일> → 발주역입력/<파일>.html. 모든 쪽이 뿌리 한 칸 아래라 '../' 로 이음. 글 = 자리이름 + # 조각(› 로) */
  function 링크(q){ var l = 트(q.링크), z = 트(q.자리);
    if(!l){ var m = /^입력폼\/(.+)$/.exec(z), n = /^발주역입력\/(.+)$/.exec(z); l = m ? '영림원외주입력/영림원외주입력.html#' + encodeURIComponent(m[1]) : n ? '발주역입력/' + n[1] + '.html' : ''; }
    if(!l) return null;
    var 조 = /^발주역입력\//.test(z) && l.indexOf('#') >= 0 ? l.slice(l.indexOf('#') + 1).split('/').map(function(x){ try{ return decodeURIComponent(x); }catch(e){ return x; } }).filter(Boolean) : [];
    var 주 = new URL('../' + l, location.href).href;
    return h('a', { class:'ql', href:주, title:'그 자리 열기' }, [q.자리이름 || z].concat(조).join(' › ')); }
  function 지시카드(q){   /* v6 사장님 지시 — 글 · 보낸이·때 · 상태 · 그 자리 링크 · 작업자 메모 */
    var 상 = q.상태 || '새 지시', 판 = h('div', { class:'qc 지시 ' + 상, 'data-id':q.id, title:'지시 · ' + 상 });
    판.append(h('div', { class:'qq' }, [q.지시 || '', h('span', { class:'qs' }, 상)]));
    판.append(h('div', { class:'qm' }, [(q.보낸이 || '') + ' · ' + 때(q.만든때), q.받은때 ? ' · 받음 ' + 때(q.받은때) : '', q.끝난때 ? ' · 끝남 ' + 때(q.끝난때) : '', q.시험 ? ' · 시험' : '']));
    var 링 = 링크(q); if(링) 판.append(h('div', { class:'qm' }, 링));
    if(트(q.메모)) 판.append(h('div', { class:'qa', title:'작업자 메모' }, q.메모));
    return 판; }
  function 카드(q, 자리보임){
    if(지시냐(q)) return 지시카드(q);
    var 상 = q.상태 || '대기', 판 = h('div', { class:'qc ' + 상, 'data-id':q.id, title:상 });
    판.append(h('div', { class:'qq' }, q.질문 || ''));
    판.append(h('div', { class:'qm' }, [(q.보낸이 || '') + ' · ' + 때(q.만든때), q.시험 ? ' · 시험' : '']));
    var 링 = 링크(q); if(링) 판.append(h('div', { class:'qm' }, 링));
    if(상 === '대기'){
      var 칸 = h('textarea', { 'aria-label':'답', rows:'2' }), 틀 = h('div', { class:'qe' }), 단 = h('button', { type:'button' }, '답');
      단.addEventListener('click', function(){ 답하기(q, 칸.value, 단, 틀); });
      판.append(h('div', { class:'qf' }, [칸, 단]), 틀);
    } else {
      판.append(h('div', { class:'qa', title:(q.답한이 || '') + ' · ' + 때(q.답한때) + (상 === '실행함' ? ' · 실행 ' + 때(q.실행한때) : '') }, q.답 || ''));
    }
    return 판;
  }
  /* 칸 하나 = 한 자리(메뉴·페이지)의 질문. 질문이 없으면 비움(설명 글 없음) */
  function 달기(칸, 자리, 자리이름){
    if(!칸) return; 꾸밈();
    var 열림 = {};
    function 그림(){
      if(!칸.isConnected && 칸.dataset.qna !== 자리) return;
      var 옛 = 칸.querySelector('details:not([data-지])'); if(옛) 열림[자리] = 옛.open; var 옛지 = 칸.querySelector('details[data-지]'); if(옛지) 열림[자리 + '#지'] = 옛지.open;
      var 활 = document.activeElement, 쓰던 = {};
      칸.querySelectorAll('.qc[data-id] textarea').forEach(function(t){ var id = t.closest('.qc').dataset.id; 쓰던[id] = { v:t.value, f:t === 활, s:t.selectionStart }; });
      var 내 = 질문들().filter(function(q){ return q.자리 === 자리; });
      var 대 = 내.filter(function(q){ return (q.상태 || '대기') === '대기'; }), 지 = 내.filter(function(q){ return (q.상태 || '대기') !== '대기'; }).reverse();
      var 시 = (목록 || []).filter(function(q){ return 지시냐(q) && q.자리 === 자리; }), 시열 = 시.filter(열린지시), 시끝 = 시.filter(function(q){ return !열린지시(q); }).reverse();   /* v6 */
      if(!내.length && !시.length){ 칸.replaceChildren(); 칸.hidden = true; return; }
      칸.hidden = false;
      var 몸 = h('div', { class:'qna' });
      if(시.length){ 몸.append(h('div', { class:'qh' }, ['지시', 시열.length ? h('span', { class:'qn 지' }, String(시열.length)) : '']));
        시열.forEach(function(q){ 몸.append(지시카드(q)); });
        if(시끝.length){ var 끝d = h('details', { 'data-지':'1' }, [h('summary', {}, '끝난 지시 ' + 시끝.length)].concat(시끝.map(지시카드))); 끝d.open = !!열림[자리 + '#지']; 몸.append(끝d); } }
      if(내.length){ 몸.append(h('div', { class:'qh' }, ['질문', 대.length ? h('span', { class:'qn' }, String(대.length)) : '']));
      대.forEach(function(q){ 몸.append(카드(q)); }); }
      if(지.length){ var d = h('details', {}, [h('summary', {}, '지난 질문 ' + 지.length)].concat(지.map(function(q){ return 카드(q); }))); d.open = !!열림[자리]; 몸.append(d); }
      칸.replaceChildren(몸);
      Object.keys(쓰던).forEach(function(id){ var t = 칸.querySelector('.qc[data-id="' + id + '"] textarea'); if(!t) return; t.value = 쓰던[id].v; if(쓰던[id].f){ t.focus(); try{ t.setSelectionRange(쓰던[id].s, 쓰던[id].s); }catch(e){} } });
    }
    칸.dataset.qna = 자리;
    if(칸._qna){ var i = 듣는이.indexOf(칸._qna); if(i >= 0) 듣는이.splice(i, 1); }
    칸._qna = function(){ if(칸.dataset.qna === 자리) 그림(); };
    듣는이.push(칸._qna); 그림();
  }
  function 놓기(칸){ if(!칸) return; if(칸._qna){ var i = 듣는이.indexOf(칸._qna); if(i >= 0) 듣는이.splice(i, 1); 칸._qna = null; } 칸.dataset.qna = ''; 칸.replaceChildren(); 칸.hidden = true; }
  /* 모음 = 모든 대기(나무 차례로 묶음 · 자리 이름 누르면 그 자리로) + 지난 질문 접힘. 나무 = [{자리, 자리이름, 감:function}] */
  function 모음(칸, 나무){
    if(!칸) return; 꾸밈();
    function 그림(){
      var 옛 = 칸.querySelector('details'), 열 = 옛 ? 옛.open : false, 쓰던 = {}, 활 = document.activeElement;   /* 모음 = 지난 질문 details 하나 */
      칸.querySelectorAll('.qc[data-id] textarea').forEach(function(t){ var id = t.closest('.qc').dataset.id; 쓰던[id] = { v:t.value, f:t === 활, s:t.selectionStart }; });
      var 다 = 질문들(), 대 = 다.filter(function(q){ return (q.상태 || '대기') === '대기'; }), 지 = 다.filter(function(q){ return (q.상태 || '대기') !== '대기'; }).reverse();
      var 차 = (나무 || []).map(function(n){ return n.자리; }), 몸 = h('div', { class:'qna' });
      var 시열 = (목록 || []).filter(열린지시);   /* v6 끝나지 않은 지시 — 자리마다 */
      if(시열.length){ 몸.append(h('div', { class:'qh' }, ['지시', h('span', { class:'qn 지' }, String(시열.length))]));
        시열.forEach(function(q){ 몸.append(지시카드(q)); }); }
      몸.append(h('div', { class:'qh' }, ['답 없는 질문', h('span', { class:'qn' }, String(대.length))]));
      var 묶 = {}; 대.forEach(function(q){ (묶[q.자리] = 묶[q.자리] || []).push(q); });
      Object.keys(묶).sort(function(a, b){ var i = 차.indexOf(a), j = 차.indexOf(b); return (i < 0 ? 1e9 : i) - (j < 0 ? 1e9 : j); }).forEach(function(k){
        var n = (나무 || []).filter(function(x){ return x.자리 === k; })[0], 이름 = (n && n.자리이름) || 묶[k][0].자리이름 || k;
        var 기 = n && n.감 ? null : 링크({ 자리:k, 자리이름:이름 });   /* 11-28 나무 없는 쪽(발주역입력) = 그 자리 기본 주소 */
        몸.append(h('div', { class:'qg' }, n && n.감 ? h('a', { href:'#', on:{ click:function(e){ e.preventDefault(); n.감(); } } }, 이름) : 기 || 이름));
        묶[k].forEach(function(q){ 몸.append(카드(q)); }); });
      if(지.length){ var d = h('details', {}, [h('summary', {}, '지난 질문 ' + 지.length)].concat(지.map(function(q){ return 카드(q, true); }))); d.open = 열; 몸.append(d); }
      칸.replaceChildren(몸); 칸.hidden = false;
      Object.keys(쓰던).forEach(function(id){ var t = 칸.querySelector('.qc[data-id="' + id + '"] textarea'); if(!t) return; t.value = 쓰던[id].v; if(쓰던[id].f){ t.focus(); try{ t.setSelectionRange(쓰던[id].s, 쓰던[id].s); }catch(e){} } });
    }
    칸.dataset.qna = '*';
    if(칸._qna){ var i = 듣는이.indexOf(칸._qna); if(i >= 0) 듣는이.splice(i, 1); }
    칸._qna = function(){ if(칸.dataset.qna === '*') 그림(); };
    듣는이.push(칸._qna); 그림();
  }
  /* 11-28 사장님 「나중에 확인할 질문 트리가 필요한데?」 — 질문 트리: 나무 = [{이름, 가지:[{이름, 잎:[{자리, 이름, 감}]}]}](입력폼이 메뉴 박스·발주역입력 머리 목록으로 만듦).
     잎(자리) = 누르면 그 자리 질문 모두(대기·답함·실행함) · 질문 링크에 # 조각(탭)이 있으면 잎 밑 가지로 · 수 = 대기 노랑 · 답함 파랑 · 실행함 초록(0 은 회색) · 이름 = 그 자리 링크. 질문 없는 자리도 보임. */
  function 수칩(qs){ var c = { 대기:0, 답함:0, 실행함:0 }; qs.forEach(function(q){ var t = q.상태 || '대기'; if(t in c) c[t]++; });
    return h('span', { class:'qtc' }, ['대기', '답함', '실행함'].map(function(t){ return h('span', { class:'qtn ' + (c[t] ? t : '영'), title:t }, String(c[t])); })); }
  function 곳조각(q){ var l = 트(q.링크); if(!/^발주역입력\//.test(트(q.자리)) || l.indexOf('#') < 0) return [];
    return l.slice(l.indexOf('#') + 1).split('/').map(function(x){ try{ return decodeURIComponent(x); }catch(e){ return x; } }).filter(Boolean); }
  function 나무(칸, 나무목){
    if(!칸) return; 꾸밈();
    function 그림(){
      var 열린 = {}; 칸.querySelectorAll('details[data-k]').forEach(function(d){ if(d.open) 열린[d.dataset.k] = 1; });
      var 쓰던 = {}, 활 = document.activeElement;
      칸.querySelectorAll('.qc[data-id] textarea').forEach(function(t){ var id = t.closest('.qc').dataset.id; 쓰던[id] = { v:t.value, f:t === 활, s:t.selectionStart }; });
      var 다 = 질문들(), 몸 = h('div', { class:'qna qtree' });
      function 덩이(k, 머리, 속, qs){ var d = h('details', { 'data-k':k }, [h('summary', {}, [머리, 수칩(qs)])].concat(속)); d.open = !!열린[k]; return d; }
      function 잎(z, 이름글){
        var qs = 다.filter(function(q){ return q.자리 === z.자리; }), 바로 = [], 탭 = {}, 탭차 = [];
        qs.forEach(function(q){ var p = 곳조각(q); if(!p.length){ 바로.push(q); return; } var k = p.join(' › '); if(!탭[k]){ 탭[k] = []; 탭차.push(k); } 탭[k].push(q); });
        var 줄 = function(a){ return a.slice().sort(function(x, y){ return ((x.상태 || '대기') === '대기' ? 0 : 1) - ((y.상태 || '대기') === '대기' ? 0 : 1) || (트(y.만든때) < 트(x.만든때) ? -1 : 1); }).map(function(q){ return 카드(q); }); };
        var 이 = z.감 ? h('a', { class:'ql', href:'#', on:{ click:function(e){ e.preventDefault(); e.stopPropagation(); z.감(); } } }, 이름글) : (링크({ 자리:z.자리, 자리이름:이름글 }) || 이름글);
        if(이 && 이.tagName === 'A') 이.addEventListener('click', function(e){ e.stopPropagation(); });
        var 속 = 줄(바로).concat(탭차.sort().map(function(k){ var l = 링크(탭[k][0]); return 덩이(z.자리 + '#' + k, l ? h('a', { class:'ql', href:l.href, on:{ click:function(e){ e.stopPropagation(); } } }, k) : k, 줄(탭[k]), 탭[k]); }));
        return 덩이(z.자리, 이, 속, qs);
      }
      (나무목 || []).forEach(function(줄기){
        var 줄기qs = [], 가지들 = (줄기.가지 || []).map(function(g){
          var gqs = 다.filter(function(q){ return (g.잎 || []).some(function(z){ return z.자리 === q.자리; }); }); 줄기qs = 줄기qs.concat(gqs);
          var 잎들 = (g.잎 || []).map(function(z){ return 잎(z, z.이름); });
          return g.이름 ? 덩이(줄기.이름 + '›' + g.이름, g.이름, 잎들, gqs) : 잎들; });
        몸.append(덩이(줄기.이름, 줄기.이름, [].concat.apply([], 가지들), 줄기qs));
      });
      var 아는 = {}; (나무목 || []).forEach(function(a){ (a.가지 || []).forEach(function(g){ (g.잎 || []).forEach(function(z){ 아는[z.자리] = 1; }); }); });
      var 밖 = 다.filter(function(q){ return !아는[q.자리]; });
      if(밖.length){ var 밖자리 = []; 밖.forEach(function(q){ if(밖자리.indexOf(q.자리) < 0) 밖자리.push(q.자리); });
        몸.append(덩이('밖', '그 밖', 밖자리.map(function(k){ var q0 = 밖.filter(function(q){ return q.자리 === k; })[0]; return 잎({ 자리:k }, q0.자리이름 || k); }), 밖)); }
      칸.replaceChildren(몸); 칸.hidden = false;
      Object.keys(쓰던).forEach(function(id){ var t = 칸.querySelector('.qc[data-id="' + id + '"] textarea'); if(!t) return; t.value = 쓰던[id].v; if(쓰던[id].f){ t.focus(); try{ t.setSelectionRange(쓰던[id].s, 쓰던[id].s); }catch(e){} } });
    }
    칸.dataset.qna = '나무';
    if(칸._qna){ var i = 듣는이.indexOf(칸._qna); if(i >= 0) 듣는이.splice(i, 1); }
    칸._qna = function(){ if(칸.dataset.qna === '나무') 그림(); };
    듣는이.push(칸._qna); 그림();
  }
  function 대기수(){ return 질문들().filter(function(q){ return (q.상태 || '대기') === '대기'; }).length; }
  function 지시수(){ return (목록 || []).filter(열린지시).length; }   /* v6 끝나지 않은 지시 */
  /* v6 사장님 지시 올리기(질문 트리) — 링크 = 저장소 뿌리에서 본 주소(질문 링크와 같은 꼴) */
  function 지시올리기(자리, 자리이름, 링크글, 글, 덧){
    if(!C) return Promise.reject(new Error('로그인 없음')); 글 = 트(글); if(!글) return Promise.reject(new Error('빈 지시'));
    return C.F.addDoc(C.F.collection(C.fs, COL), Object.assign({ 종류:'지시', 자리:자리, 자리이름:자리이름 || 자리, 링크:링크글 || '', 지시:글, 보낸이:C.who || '', 만든때:new Date().toISOString(), 상태:'새 지시', 받은때:'', 끝난때:'', 메모:'' }, 덧 || {}))
      .then(function(r){ return r.id; }); }
  function 듣기(f){ 듣는이.push(f); }
  /* 시험·작업자용(화면 단추 없음) */
  function 올리기(자리, 자리이름, 글, 덧){
    if(!C) return Promise.reject(new Error('로그인 없음'));
    return C.F.addDoc(C.F.collection(C.fs, COL), Object.assign({ 자리:자리, 자리이름:자리이름 || 자리, 질문:트(글), 보낸이:C.who || '', 만든때:new Date().toISOString(), 상태:'대기', 답:'', 답한때:'', 답한이:'' }, 덧 || {}))
      .then(function(r){ return r.id; }); }
  function 지움(id){ if(!C) return Promise.reject(new Error('로그인 없음')); return C.F.deleteDoc(C.F.doc(C.fs, COL, id)); }
  /* 입력폼 로그인('erp-input' 앱) 그대로 붙음 — 로그인 없음·익명 = cb(null). 질문 트리 쪽·발주역입력 쪽이 씀 */
  function 로그인(cb){
    Promise.all([import(V + 'firebase-app.js'), import(V + 'firebase-auth.js'), import(V + 'firebase-firestore.js')]).then(function(m){
      var 설정 = { apiKey:'AIzaSyB9X_hzd2D3goQ7oenK53Pz805P1c7oSqs', authDomain:'vivivic-4b7ef.firebaseapp.com', projectId:'vivivic-4b7ef',
        storageBucket:'vivivic-4b7ef.firebasestorage.app', messagingSenderId:'830175660542', appId:'1:830175660542:web:9054030480c8280af8d8af' };
      var app = m[0].getApps().filter(function(a){ return a.name === 'erp-input'; })[0] || m[0].initializeApp(설정, 'erp-input');
      var auth = m[1].getAuth(app), F = window.쓰기지킴 ? window.쓰기지킴.덮개(Object.assign({}, m[2])) : m[2], fs = F.getFirestore(app);
      m[1].onAuthStateChanged(auth, function(u){
        if(!u || u.isAnonymous){ if(끄기){ try{ 끄기(); }catch(e){} 끄기 = null; } 목록 = null; C = null; 알림(); cb(null); return; }
        붙임({ F:F, fs:fs, who:u.displayName || u.email || '' }); cb(u); });
    }).catch(function(e){ console.warn('질문 불러오기', e); cb(null); });
  }
  /* 발주역입력 쪽 — 페이지가 다 뜬 뒤(페이지 모듈이 'erp-input' 앱을 먼저 만들게) 입력폼 로그인으로 붙음 */
  function 스스로(자리, 자리이름){
    var 칸 = h('div', { class:'qna-slot', hidden:true }), 다봄 = false;
    /* 11-28 사장님 「이거 입력폼뿐만 아니라 발주역입력에서도 보여야지」 — 머리 줄 「답 없는 질문 N」(입력폼 머리와 같음 · 대기 있으면 노랑) · 누르면 모든 대기 모음 · 다시 누르면 이 페이지 질문 */
    var 단 = h('button', { type:'button', class:'qna-btn', hidden:true, 'aria-pressed':'false' }, '답 없는 질문');
    /* 11-28 「질문 트리」 = 입력폼 #질문트리(같은 로그인 · 나무는 입력폼 메뉴 박스로 그림) */
    var 트단 = h('a', { class:'qna-btn qna-tr', hidden:true, target:'_blank', rel:'noopener', href:new URL('../발주역입력/질문트리.html', location.href).href }, '질문 트리');   /* 11-28 「질문 트리는 새 페이지로」 */
    function 단그림(){ var n = 대기수(), m = 지시수(); 단.hidden = 목록 == null; 트단.hidden = 목록 == null; 단.textContent = '답 없는 질문 ' + n + (m ? ' · 지시 ' + m : ''); 단.classList.toggle('on', n > 0 || m > 0);   /* v6 지시 수 */ 단.setAttribute('aria-pressed', 다봄 ? 'true' : 'false'); }
    function 그칸(){ if(!C){ 놓기(칸); return; } if(다봄) 모음(칸, []); else 달기(칸, 자리, 자리이름); }
    단.addEventListener('click', function(){ 다봄 = !다봄; 단그림(); 그칸(); });
    듣기(단그림);
    function 놓을곳(){ var hd = document.querySelector('body > header, header.top, .topbar, header');
      if(hd && hd.parentNode) hd.parentNode.insertBefore(칸, hd.nextSibling); else document.body.prepend(칸);
      칸.style.margin = '12px 16px 0';
      var 머 = document.querySelector('body > header, header'); if(머){ 꾸밈(); 머.append(단, 트단); } }
    function 시작(){
      놓을곳();
      로그인(function(u){ if(!u){ 놓기(칸); 단그림(); return; } 그칸(); 단그림(); });
    }
    if(document.readyState === 'complete') setTimeout(시작, 0); else window.addEventListener('load', function(){ setTimeout(시작, 0); });
  }
  window.질문 = { 로그인:로그인, 카드:function(q){ return 카드(q, true); }, 링크:링크, 꾸밈:꾸밈, 붙임:붙임, 달기:달기, 나무:나무, 놓기:놓기, 모음:모음, 대기수:대기수, 지시수:지시수, 지시올리기:지시올리기, 지시냐:지시냐, 듣기:듣기, 올리기:올리기, 지움:지움, 스스로:스스로, 목록:function(){ return 목록; } };
})();
