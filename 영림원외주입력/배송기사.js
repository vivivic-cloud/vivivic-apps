/* 배송기사 납품 링크 공용 코드 — v2(폼 v241): 배송기사.html 과 입고처별 배송기사-<입고처>.html 이 함께 부름. v1 (2026-11-15, 폼 v239) — 사장님 「구매처 생산중 발주에는 배송기사에게 공유할 해당발주에대한 공유버튼이 있어야 합니다. 공유시 해당 발주건에대한 큐알이 배송기사가 공유받은 페이지에 나타나고 …
   입고확인이 완료되면 수정된 내용이 동일한 배송기사의 공유된 발주서 화면이 변경되면서 납품완료 버튼이 활성화되어 … 배송기사의 납품완료확인이 되어야 모든 납품이 완료된 상황으로 봐 야 합니다.」
   주소 = 배송기사.html#<열쇠 32자>. 문서 erp_purship/<열쇠> = {pono, vendor, wh, items, at, by, recv?, doneAt?} — 폼(구매발주납품 관리 · 생산중 「배송기사 공유」)이 만들고, 입고확인 때 recv 를 적는다.
   이 화면: 발주 한 장 + QR('VVSHIP:'+열쇠, 입고처 입고대기 「스캔」이 읽음) · recv 가 생기면 입고수량·차이가 보이고 「납품완료」가 켜짐 → doneAt 한 칸만 적음(규칙). 로그인 없음.
   v226 에 지운 옛 배송기사 페이지와 코드·자료를 함께 쓰지 않는다. */
(function(){
"use strict";
var FB_CONFIG={apiKey:"AIzaSyB9X_hzd2D3goQ7oenK53Pz805P1c7oSqs",authDomain:"vivivic-4b7ef.firebaseapp.com",projectId:"vivivic-4b7ef",storageBucket:"vivivic-4b7ef.firebasestorage.app",messagingSenderId:"830175660542",appId:"1:830175660542:web:9054030480c8280af8d8af"};
var V='https://www.gstatic.com/firebasejs/11.2.0/';
var app=document.getElementById('app');
var KEY=(location.hash||'').replace(/^#/,'');
function h(tag,props){
  var e=document.createElement(tag);props=props||{};
  Object.keys(props).forEach(function(k){var v=props[k];if(v==null||v===false)return;
    if(k==='class')e.className=v;else if(k==='on')Object.keys(v).forEach(function(ev){e.addEventListener(ev,v[ev]);});
    else if(k==='value'||k==='disabled'||k==='hidden')e[k]=v;else e.setAttribute(k,v===true?'':v);});
  for(var i=2;i<arguments.length;i++){var c=arguments[i];(Array.isArray(c)?c:[c]).forEach(function(x){if(x==null||x===false||x==='')return;e.append(x.nodeType?x:document.createTextNode(x));});}
  return e;
}
function t(x){return String(x==null?'':x).trim();}
function num(n){if(n==null||n==='')return '';var x=Number(n);return isFinite(x)?x.toLocaleString('ko-KR',{maximumFractionDigits:4}):String(n);}
function when(iso){var d=new Date(iso);if(isNaN(d))return t(iso);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
function fail(m){app.replaceChildren(h('div',{class:'empty'},m));}
if(!/^[A-Za-z0-9]{32}$/.test(KEY)){fail('링크 주소가 맞지 않습니다.');return;}
/* QR 라이브러리 — cdnjs(SRI) → 같은 폴더 사본 */
var QRL=['https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js','sha384-mZT2gIty7ZDdOGkxfP6joZcYdMW1Jvj9dRlfpTmaJAKKXTqzygtB22k7FLe+KZC1','라이브러리/qrcode.min.js'],qrP=null;
function qrLib(){if(window.qrcode)return Promise.resolve(window.qrcode);if(qrP)return qrP;
  var one=function(src,sri){return new Promise(function(ok,no){var sc=document.createElement('script');sc.src=src;
    if(sri){sc.integrity=sri;sc.crossOrigin='anonymous';sc.referrerPolicy='no-referrer';}
    sc.onload=function(){window.qrcode?ok(window.qrcode):no(new Error('qr'));};sc.onerror=function(){sc.remove();no(new Error('qr'));};document.head.append(sc);});};
  return qrP=one(QRL[0],QRL[1]).catch(function(){return one(QRL[2]);}).catch(function(e){qrP=null;throw e;});}
var QRBOX=null;   /* 한 번만 그림 — 다시 그려도 같은 그림을 붙임 */
function qrBox(){
  if(QRBOX)return QRBOX;QRBOX=h('div',{class:'qr'});
  qrLib().then(function(qrcode){var q=qrcode(0,'M');q.addData('VVSHIP:'+KEY);q.make();
    var n=q.getModuleCount(),cell=8,sz=(n+8)*cell,cv=document.createElement('canvas');
    cv.width=sz;cv.height=sz;cv.style.width=Math.min(sz/2,260)+'px';cv.setAttribute('role','img');cv.setAttribute('aria-label','QR코드');
    var c=cv.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,sz,sz);c.fillStyle='#000';
    for(var r=0;r<n;r++)for(var k=0;k<n;k++)if(q.isDark(r,k))c.fillRect((k+4)*cell,(r+4)*cell,cell,cell);
    QRBOX.replaceChildren(cv);
  }).catch(function(){QRBOX.replaceChildren(h('p',{class:'msg bad'},'QR코드를 그리지 못했습니다.'));});
  return QRBOX;
}
var F=null,fs=null,S=null,MSG={t:'',bad:false},BUSY=false;
function draw(){
  if(!S)return;
  var recv=S.recv||null,done=!!S.doneAt;
  var st=done?h('span',{class:'st done'},'납품완료'):recv?h('span',{class:'st on'},'입고확인'):h('span',{class:'st'},'입고확인 전');
  var head=h('div',{class:'head'},h('dl',{},h('dt',{},'발주번호'),h('dd',{},t(S.pono)),h('dt',{},'구매거래처'),h('dd',{},t(S.vendor)),h('dt',{},'창고'),h('dd',{},t(S.wh)),
    recv?[h('dt',{},'입고확인'),h('dd',{},when(recv.at))]:null,done?[h('dt',{},'납품완료'),h('dd',{},when(S.doneAt))]:null,h('dt',{},'상태'),h('dd',{},st)));
  var rows=(recv&&recv.items||S.items||[]).map(function(x){var d=recv?Math.round((Number(x.qty)-Number(x.poqty||0))*100)/100:null;
    return h('div',{class:'po'},h('div',{class:'nt'},t(x.cname)),h('dl',{},h('dt',{},'품번'),h('dd',{},t(x.ccode)),t(x.cspec)?[h('dt',{},'규격'),h('dd',{},t(x.cspec))]:null,t(x.unit)?[h('dt',{},'단위'),h('dd',{},t(x.unit))]:null,
      h('dt',{},'발주수량'),h('dd',{class:'n'},num(x.poqty)),recv?[h('dt',{},'입고수량'),h('dd',{class:'n'},num(x.qty)),h('dt',{},'차이'),h('dd',{class:'n'+(d?' chg':'')},d===0?'0':(d>0?'+':'')+num(d))]:null));});
  var bt=done?null:h('button',{type:'button',class:'btn primary',disabled:!recv||BUSY},'납품완료');
  if(bt)bt.addEventListener('click',function(){
    if(!confirm(t(S.pono)+' 납품완료를 확인합니다.'))return;BUSY=true;MSG={t:'',bad:false};draw();
    F.updateDoc(F.doc(fs,'erp_purship',KEY),{doneAt:new Date().toISOString()}).then(function(){BUSY=false;},function(e){console.warn(e);BUSY=false;MSG={t:'저장하지 못했습니다. 다시 눌러 주세요.',bad:true};draw();});});
  app.replaceChildren(h('h1',{},t(S.pono)),h('section',{class:'card'},head,done?null:qrBox(),h('div',{class:'sub'},recv?'입고확인':'발주'),rows,
    h('div',{class:'actions'},bt,h('span',{class:'msg'+(MSG.bad?' bad':''),role:'status'},MSG.t))));
}
Promise.all([import(V+'firebase-app.js'),import(V+'firebase-firestore.js')]).then(function(m){
  F=(window.쓰기지킴?window.쓰기지킴.덮개(Object.assign({},m[1])):m[1]);fs=F.getFirestore(m[0].initializeApp(FB_CONFIG,'pur-ship'));
  var first=true;
  F.onSnapshot(F.doc(fs,'erp_purship',KEY),function(d){
    if(!d.exists()||!t(d.data().pono)){if(first)fail('링크를 열 수 없습니다.');first=false;return;}
    first=false;S=d.data();document.title=t(S.pono)+' 납품';draw();
  },function(e){console.warn(e);if(first)fail('링크를 열 수 없습니다.');first=false;});
}).catch(function(e){console.warn(e);fail('링크를 열 수 없습니다.');});
})();
