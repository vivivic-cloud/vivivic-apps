/* 폼결과 — 영림원품목등록이 보낸 줄의 입력폼 등록 상태를 입력폼 문서(erp_*)에서 바로 셈(2026-11-28 사장님 「모든 부분에서 실제 완료 상황 좀 보게 만들어」).
   입력폼이 공개 보내기 문서에 써 주는 `결과`(yinResSync · iwResSync · mixResSync)와 같은 셈 — 입력폼 창이 안 열려 있어도 지금 상태.
     보내기 이름 → 컬렉션: 창고 warehouses · 워크센터등록 workcenters · 품목 items · BOM boms · 공정흐름 itemflows · 소요자재 itemmats · 외주계약 contracts · 워크센터 itemwcs
       = bd.출처 「영림원품목등록」 · bd.열쇠 같음 · 오류 아닌 것 먼저 → 늦게 만든 것 먼저(bdOld) 첫 문서 → {상태, 이유, 때}(bdResOf)
     재공품 = materials·classes 중 bd.출처·bd.거래처 「영림원품목등록」 · bd.단계 → {열쇠:{단계:{…}}}(mixResSync)
   로그인(입력폼 'erp-input' 앱) 없음·익명·읽기 못 함 = null → 쓰는 쪽은 공개 사본 결과를 그대로 씀.
   쓰는 법: <script src="../shared/폼결과.js?v=1"></script> · 폼결과.결과('품목') → {열쇠:{상태,이유,때}} | null · 폼결과.듣기(함수) · 폼결과.문서('BOM', 열쇠) → 그 결과의 입력폼 문서 | null */
(function(){
  if(window.폼결과) return;
  var V = 'https://www.gstatic.com/firebasejs/11.2.0/', SRC = '영림원품목등록';
  var 표 = { 창고:'erp_warehouses', 워크센터등록:'erp_workcenters', 품목:'erp_items', BOM:'erp_boms', 공정흐름:'erp_itemflows', 소요자재:'erp_itemmats', 외주계약:'erp_contracts', 워크센터:'erp_itemwcs' };
  var 재표 = ['erp_materials', 'erp_classes'];
  var ST = { '대기':'대기', '수정대기':'대기', '진행중':'진행중', '완료':'완료', '오류':'오류' };
  var 문서 = {}, 끄기 = [], 셈값 = null, 문서값 = null, 듣는이 = [], 됨 = false;
  function 옛(a, b){ return ((a.status === '오류') - (b.status === '오류')) || (String(b.createdAt || '') < String(a.createdAt || '') ? -1 : 1); }
  function 결(d){ return { '상태':ST[d.status] || '대기', '이유':d.status === '오류' ? String(d.agentNote || '').slice(0, 300) : '', '때':String(d.doneAt || d.updatedAt || d.createdAt || '') }; }
  function 셈(){
    var 다 = Object.keys(표).concat(['재공품']).every(function(n){ return n === '재공품' ? 재표.every(function(c){ return 문서[c]; }) : !!문서[표[n]]; });
    if(!다){ 셈값 = null; 문서값 = null; return; }
    var o = {}, 문 = {};
    Object.keys(표).forEach(function(n){ var g = {}, m = {};
      문서[표[n]].forEach(function(d){ var b = d.bd; if(!b || b['출처'] !== SRC || d.__part) return; var k = b['열쇠']; if(typeof k !== 'string') return; (g[k] = g[k] || []).push(d); });
      var dm = {}; Object.keys(g).forEach(function(k){ var d0 = g[k].sort(옛)[0]; m[k] = 결(d0); dm[k] = d0; });
      o[n] = m; 문[n] = dm; });
    var w = {}, g2 = {};
    재표.forEach(function(c){ 문서[c].forEach(function(d){ var b = d.bd; if(!b || b['출처'] !== SRC || b['거래처'] !== SRC || !b['단계']) return;
      [].concat(b['열쇠'] == null ? [] : b['열쇠']).forEach(function(k){ var x = k + '\u0001' + b['단계']; (g2[x] = g2[x] || []).push(d); }); }); });
    Object.keys(g2).forEach(function(x){ var p = x.split('\u0001'); (w[p[0]] = w[p[0]] || {})[p[1]] = 결(g2[x].sort(옛)[0]); });
    o['재공품'] = w;
    셈값 = o; 문서값 = 문;
  }
  function 알림(){ 셈(); 듣는이.forEach(function(f){ try{ f(); }catch(e){ console.warn('폼결과', e); } }); }
  function 끔(){ 끄기.forEach(function(f){ try{ f(); }catch(e){} }); 끄기 = []; 문서 = {}; }
  function 시작(){
    Promise.all([import(V + 'firebase-app.js'), import(V + 'firebase-auth.js'), import(V + 'firebase-firestore.js')]).then(function(m){
      var 설정 = { apiKey:'AIzaSyB9X_hzd2D3goQ7oenK53Pz805P1c7oSqs', authDomain:'vivivic-4b7ef.firebaseapp.com', projectId:'vivivic-4b7ef',
        storageBucket:'vivivic-4b7ef.firebasestorage.app', messagingSenderId:'830175660542', appId:'1:830175660542:web:9054030480c8280af8d8af' };
      var app = m[0].getApps().filter(function(a){ return a.name === 'erp-input'; })[0] || m[0].initializeApp(설정, 'erp-input');
      var auth = m[1].getAuth(app), F = m[2], fs = F.getFirestore(app);
      m[1].onAuthStateChanged(auth, function(u){
        끔(); 됨 = false;
        if(!u || u.isAnonymous){ 알림(); return; }
        Object.keys(표).map(function(n){ return 표[n]; }).concat(재표).forEach(function(c){
          끄기.push(F.onSnapshot(F.query(F.collection(fs, c), F.where('bd.출처', '==', SRC)),
            function(sn){ 문서[c] = sn.docs.map(function(d){ return Object.assign({ id:d.id }, d.data()); }); 알림(); },
            function(e){ console.warn('폼결과 읽기 못 함 ' + c, e); 끔(); 알림(); })); });
      });
    }).catch(function(e){ console.warn('폼결과 불러오기', e); });
  }
  if(document.readyState === 'complete') setTimeout(시작, 0); else window.addEventListener('load', function(){ setTimeout(시작, 0); });
  window.폼결과 = { 결과:function(n){ return 셈값 ? 셈값[n] || null : null; }, 듣기:function(f){ 듣는이.push(f); }, 다:function(){ return 셈값; },
    문서:function(n, k){ return 문서값 && 문서값[n] ? 문서값[n][k] || null : null; } };   /* v2(11-28) 그 열쇠의 입력폼 문서(결과와 같은 문서) — 영림원품목등록 BOM 잠긴 줄 = 입력폼 완료 문서와 같아지면 새 줄 */
})();
