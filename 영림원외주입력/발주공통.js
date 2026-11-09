/* 발주 링크 페이지 공용(v145) — 배송.html · 입고.html · 발주박스.html 이 같이 쓴다. 로그인 없음, 파이어스토어 REST.
   규칙 배포 전에는 로그인 없는 요청이 막혀 익명 로그인 뒤 다시 한다(그래도 막히면 실패로 본다). */
(function(){
"use strict";
var KEY='AIzaSyB9X_hzd2D3goQ7oenK53Pz805P1c7oSqs',DB='projects/vivivic-4b7ef/databases/(default)',DOCS=DB+'/documents',BASE='https://firestore.googleapis.com/v1/';
function h(tag,cls){var e=document.createElement(tag);if(cls)e.className=cls;for(var i=2;i<arguments.length;i++){var c=arguments[i];(Array.isArray(c)?c:[c]).forEach(function(x){if(x==null||x===false)return;e.append(x.nodeType?x:document.createTextNode(String(x)));});}return e;}
function show(v){return v==null?'':String(v);}
function num(v){if(v==null||String(v).trim()==='')return '';var n=Number(v);return isFinite(n)?n.toLocaleString('ko-KR',{maximumFractionDigits:6}):String(v);}
function when(s){var t=new Date(s);if(!s||isNaN(t))return show(s);var p=function(n){return String(n).padStart(2,'0');};return (t.getMonth()+1)+'-'+p(t.getDate())+' '+p(t.getHours())+':'+p(t.getMinutes());}
function val(x){if(!x)return null;var k=Object.keys(x)[0],y=x[k];
  if(k==='mapValue'){var o={};Object.keys(y.fields||{}).forEach(function(f){o[f]=val(y.fields[f]);});return o;}
  if(k==='arrayValue')return (y.values||[]).map(val);
  if(k==='integerValue')return Number(y);if(k==='doubleValue')return Number(y);if(k==='nullValue')return null;return y;}
function fieldsOf(j){var f={};Object.keys((j&&j.fields)||{}).forEach(function(k){f[k]=val(j.fields[k]);});return f;}
function enc(v){if(v==null)return {nullValue:null};if(Array.isArray(v))return {arrayValue:{values:v.map(enc)}};
  if(typeof v==='object'){var f={};Object.keys(v).forEach(function(k){f[k]=enc(v[k]);});return {mapValue:{fields:f}};}
  if(typeof v==='number')return Number.isInteger(v)?{integerValue:String(v)}:{doubleValue:v};if(typeof v==='boolean')return {booleanValue:v};return {stringValue:String(v)};}
function encFields(o){return enc(o).mapValue.fields;}
var tok=null;
function anon(){
  try{var t=JSON.parse(sessionStorage.getItem('po.tok')||'null');if(t&&t.exp>Date.now())return Promise.resolve(tok=t.id);}catch(e){}
  return fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key='+KEY,{method:'POST',headers:{'Content-Type':'application/json'},body:'{"returnSecureToken":true}'})
    .then(function(r){return r.json();}).then(function(j){if(!j.idToken)throw new Error('anon');
      try{sessionStorage.setItem('po.tok',JSON.stringify({id:j.idToken,exp:Date.now()+50*60*1000}));}catch(e){}return tok=j.idToken;});
}
function call(path,opt){
  var go=function(){var o=Object.assign({cache:'no-store',referrerPolicy:'no-referrer'},opt||{});o.headers=Object.assign({'Content-Type':'application/json'},tok?{Authorization:'Bearer '+tok}:{});
    return fetch(BASE+path+(path.indexOf('?')<0?'?':'&')+'key='+KEY,o);};
  return go().then(function(r){return (r.status===401||r.status===403)&&!tok?anon().then(go).catch(function(){return r;}):r;});
}
/* 여러 문서: 이름(컬렉션/id) → 칸, 없거나 못 읽으면 null */
function getMany(names){
  if(!names.length)return Promise.resolve({});
  return call(DOCS+':batchGet',{method:'POST',body:JSON.stringify({documents:names.map(function(n){return DOCS+'/'+n;})})}).then(function(r){
    if(r.status===403){var o={};names.forEach(function(n){o[n]=null;});return o;}
    if(!r.ok)throw new Error(r.status);
    return r.json().then(function(a){var o={};names.forEach(function(n){o[n]=null;});(a||[]).forEach(function(x){if(x.found)o[x.found.name.slice(DOCS.length+1)]=fieldsOf(x.found);});return o;});
  });
}
function getOne(name){return getMany([name]).then(function(o){return o[name];});}
/* 쓰기 한 묶음(모두 되거나 모두 안 됨). w = {name, fields, mask?:[...], exists?:true|false} */
function commit(ws){
  return call(DOCS+':commit',{method:'POST',body:JSON.stringify({writes:ws.map(function(w){var o={update:{name:DOCS+'/'+w.name,fields:encFields(w.fields)}};
    if(w.mask)o.updateMask={fieldPaths:w.mask};if(w.exists!=null)o.currentDocument={exists:w.exists};return o;})})})
    .then(function(r){if(!r.ok){var e=new Error(r.status);e.status=r.status;throw e;}});
}
function rkey(){var a=new Uint8Array(24);crypto.getRandomValues(a);return btoa(String.fromCharCode.apply(null,a)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function keyOk(k){return /^[A-Za-z0-9_-]{32,64}$/.test(String(k||''));}
function noOk(k){return /^[A-Za-z0-9_-]{1,100}$/.test(String(k||''));}
/* 라이브러리: cdnjs(SRI) → 같은 폴더 사본(v131) */
var LIBS={qr:['https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js','sha384-mZT2gIty7ZDdOGkxfP6joZcYdMW1Jvj9dRlfpTmaJAKKXTqzygtB22k7FLe+KZC1','qrcode','라이브러리/qrcode.min.js'],
  bc:['https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.6/barcodes/JsBarcode.code128.min.js','sha384-7XguhfRLAUmvSGmJn2K+BQDpX0gf5NMsj79jcgd7TVtV87euzdySNZqTjOQxgIiB','JsBarcode','라이브러리/JsBarcode.code128.min.js'],
  scan:['https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js','sha384-c9d8RFSL+u3exBOJ4Yp3HUJXS4znl9f+z66d1y54ig+ea249SpqR+w1wyvXz/lk+','__Html5QrcodeLibrary__','라이브러리/html5-qrcode.min.js']},libP={};
function lib(k){var L=LIBS[k];if(window[L[2]])return Promise.resolve(window[L[2]]);if(libP[k])return libP[k];
  var one=function(src,sri){return new Promise(function(ok,no){var sc=document.createElement('script');sc.src=src;
    if(sri){sc.integrity=sri;sc.crossOrigin='anonymous';sc.referrerPolicy='no-referrer';}
    sc.onload=function(){window[L[2]]?ok(window[L[2]]):no(new Error(k));};sc.onerror=function(){sc.remove();no(new Error(k));};document.head.append(sc);});};
  return libP[k]=one(L[0],L[1]).catch(function(){return one(L[3]);}).catch(function(e){libP[k]=null;throw e;});}
/* QR(값) + 바코드(글자) 한 묶음 — 폼과 같은 크기 */
function codes(qrText,bcText){
  var qrBox=h('div','qr'),bcBox=h('div','bc'),err=h('p','err');err.hidden=true;
  if(qrText)lib('qr').then(function(qrcode){
    var q=qrcode(0,'M');q.addData(qrText);q.make();
    var n=q.getModuleCount(),cell=6,sz=(n+8)*cell,cv=document.createElement('canvas');
    cv.width=sz;cv.height=sz;cv.style.width=sz/2+'px';cv.style.height=sz/2+'px';cv.setAttribute('role','img');cv.setAttribute('aria-label','QR코드');
    var c=cv.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,sz,sz);c.fillStyle='#000';
    for(var r=0;r<n;r++)for(var k=0;k<n;k++)if(q.isDark(r,k))c.fillRect((k+4)*cell,(r+4)*cell,cell,cell);
    qrBox.replaceChildren(cv);
  }).catch(function(){err.hidden=false;err.textContent='QR코드를 그리지 못했습니다.';});
  if(bcText)lib('bc').then(function(JsBarcode){
    var sv=document.createElementNS('http://www.w3.org/2000/svg','svg');sv.setAttribute('role','img');sv.setAttribute('aria-label','바코드 '+bcText);
    JsBarcode(sv,bcText,{format:'CODE128',width:1.6,height:64,fontSize:14,margin:16,displayValue:true});
    sv.removeAttribute('width');sv.removeAttribute('height');bcBox.replaceChildren(sv);
  }).catch(function(){err.hidden=false;err.textContent='바코드를 그리지 못했습니다.';});
  return h('div','codes',qrBox,bcBox,err);
}
/* 카메라 스캔(QR·Code128). el = 비디오 자리, done(글자). 돌려주는 stop() */
function scanner(el,done,fail){
  var reader=null,on=false,stopped=false;
  lib('scan').then(function(L){if(stopped)return;
    var F=L.Html5QrcodeSupportedFormats;if(!el.id)el.id='scan'+Math.random().toString(36).slice(2,8);
    reader=new L.Html5Qrcode(el.id,{formatsToSupport:[F.QR_CODE,F.CODE_128],verbose:false});
    return reader.start({facingMode:'environment'},{fps:10,qrbox:function(w,h2){var s=Math.floor(Math.min(w,h2)*0.8);return {width:s,height:Math.floor(s*0.7)};}},function(t){if(on){stop();done(t);}},function(){}).then(function(){on=true;if(stopped)stop();});
  }).catch(function(){fail&&fail();});
  function stop(){stopped=true;if(reader&&on){on=false;try{reader.stop().catch(function(){});}catch(e){}}}
  return stop;
}
/* 사진 → 긴 변 1280px JPEG(0.6) data URL. 문서 한 장(1MB)에 들어가게 700KB 넘으면 더 줄임 */
function shrink(file){
  return new Promise(function(ok,no){var u=URL.createObjectURL(file),im=new Image();
    im.onload=function(){URL.revokeObjectURL(u);var go=function(max,q){var s=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight)),cv=document.createElement('canvas');
        cv.width=Math.round(im.naturalWidth*s);cv.height=Math.round(im.naturalHeight*s);cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);return cv.toDataURL('image/jpeg',q);};
      var d=go(1280,0.6);if(d.length>700000)d=go(960,0.5);if(d.length>700000)d=go(720,0.45);d.length>700000?no(new Error('big')):ok(d);};
    im.onerror=function(){URL.revokeObjectURL(u);no(new Error('img'));};im.src=u;});
}
/* 이 폰에서 연 입고처 박스 열쇠(입고.html 이 QR 로 바로 열릴 때 씀) */
function inboxes(){try{return JSON.parse(localStorage.getItem('po.inboxes')||'[]').filter(keyOk);}catch(e){return [];}}
function rememberInbox(k){if(!keyOk(k))return;try{var a=inboxes().filter(function(x){return x!==k;});a.unshift(k);localStorage.setItem('po.inboxes',JSON.stringify(a.slice(0,10)));}catch(e){}}
/* 화면 채우기: 배열 안 null·false 는 뺌(replaceChildren 에 null 을 주면 「null」 글자가 됨) */
function fill(el,list){var a=[];(function walk(x){if(Array.isArray(x))x.forEach(walk);else if(x!=null&&x!==false)a.push(x);})(list);el.replaceChildren.apply(el,a);}
window.PO={fill:fill,h:h,show:show,num:num,when:when,getMany:getMany,getOne:getOne,commit:commit,rkey:rkey,keyOk:keyOk,noOk:noOk,lib:lib,codes:codes,scanner:scanner,shrink:shrink,inboxes:inboxes,rememberInbox:rememberInbox};
})();
