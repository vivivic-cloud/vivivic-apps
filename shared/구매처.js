/* 구매처 — 품번·자재번호 → 입력폼 구매단가등록 완료 구매거래처(2026-11-28 분배 방 사장님 「드롭 선택 시 거래처명 필터 기능 모든 드롭 선택 칸에 적용시켜」).
   영림원품목등록·입력폼과 같은 기준(erp_purprices status 완료 · ylwGone 뺌 · 유한가구 → 진아산업). 로그인(입력폼 'erp-input' 앱) 기기만 — 없으면 null(거래처 체크 안 붙임).
   쓰는 법: <script src="../shared/구매처.js?v=1"></script> · 구매처.업(번호) → [거래처…] | null · 구매처.듣기(함수) */
(function(){
  if(window.구매처) return;
  var V = 'https://www.gstatic.com/firebasejs/11.2.0/', 맵 = null, 듣는이 = [], 끄기 = null;
  var 트 = function(v){ return String(v == null ? '' : v).trim(); }, 별명 = function(v){ return v.replace(/유한가구/g, '진아산업'); };
  function 알림(){ 듣는이.forEach(function(f){ try{ f(); }catch(e){ console.warn('구매처', e); } }); }
  function 시작(){
    Promise.all([import(V + 'firebase-app.js'), import(V + 'firebase-auth.js'), import(V + 'firebase-firestore.js')]).then(function(m){
      var 설정 = { apiKey:'AIzaSyB9X_hzd2D3goQ7oenK53Pz805P1c7oSqs', authDomain:'vivivic-4b7ef.firebaseapp.com', projectId:'vivivic-4b7ef',
        storageBucket:'vivivic-4b7ef.firebasestorage.app', messagingSenderId:'830175660542', appId:'1:830175660542:web:9054030480c8280af8d8af' };
      var app = m[0].getApps().filter(function(a){ return a.name === 'erp-input'; })[0] || m[0].initializeApp(설정, 'erp-input');
      var F = m[2], fs = F.getFirestore(app);
      m[1].onAuthStateChanged(m[1].getAuth(app), function(u){
        if(끄기){ try{ 끄기(); }catch(e){} 끄기 = null; }
        if(!u || u.isAnonymous){ 맵 = null; 알림(); return; }
        끄기 = F.onSnapshot(F.query(F.collection(fs, 'erp_purprices'), F.where('status', '==', '완료')), function(sn){
          var o = new Map(); sn.docs.forEach(function(d){ var x = d.data(); if(x.ylwGone) return; var c = 트(x.code).toLowerCase(), v = 별명(트(x.vendor)); if(!c) return;
            if(!o.has(c)) o.set(c, []); if(v && o.get(c).indexOf(v) < 0) o.get(c).push(v); });
          맵 = o; 알림(); }, function(e){ console.warn('구매처 읽기 못 함', e); 맵 = null; 알림(); });
      });
    }).catch(function(e){ console.warn('구매처 불러오기', e); });
  }
  if(document.readyState === 'complete') setTimeout(시작, 0); else window.addEventListener('load', function(){ setTimeout(시작, 0); });
  window.구매처 = { 업:function(c){ return 맵 ? (맵.get(트(c).toLowerCase()) || []).slice() : null; }, 듣기:function(f){ 듣는이.push(f); } };
})();
