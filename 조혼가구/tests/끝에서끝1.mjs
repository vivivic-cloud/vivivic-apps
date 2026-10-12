/* 끝에서 끝까지 한 번 — **두 집을 이어서** 잰다.
   ㄱ) 에이엠티에서 **배송 확정**을 일으켜 `출고명세표` 에 장이 나가게 한다.
       (허수아비 화베에 담는다. 담기는 꼴은 에이엠티의 `_출고명세표보내기` 가 만든 **그대로**다 —
        내가 지어내지 않는다.)
   ㄴ) 그 장을 **조혼가구가 찍어서** 펴고, 표가 **에이엠티 화면과 같은 글자**인지 본다.
   ㄷ) 그 자리에서 **입고확인** — 적히는지, 두 번 눌러도 안 덮이는지.
   ㄹ) 「거래내역」 목록에 **그 줄이 새로 서는지**(최근 것부터). */
import { 서버, 브라우저열기, devices, 자료, 주소, 에이주소, 테일윈드, 그림칸, 자판 } from './도구/터.mjs';
await 서버();
const 그림 = 그림칸();
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const CSS = readFileSync(await 테일윈드(), 'utf-8');


const L = await 자료('원장');
const b = await 브라우저열기({ args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream'] });
const { 참: 못, 끝: 끝맺기 } = 자판();
const md5=(x)=>createHash('md5').update(x).digest('hex').slice(0,12);
// 브라우저는 <tbody> 를 저 혼자 끼운다 — **보이는 글자만** 견준다
const 글자만=(x)=>String(x||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();

/* ── 에이엠티가 먹는 자료 (tests/큐알명세1.mjs 의 그것 그대로) ── */
const 심을것 = (L) => {
  document.getElementById('auth-login-overlay')?.style.setProperty('display','none');
  window.__보낸것={}; window.__쓴곳=[];
  const 눈=(있,값)=>({exists:()=>!!있, data:()=>값});
  window.db={}; window.storage={};
  window.fbFirestore={ doc:(...a)=>({길:a.slice(1).join('/'), 칸:a[a.length-2], id:a[a.length-1]}),
    updateDoc:async()=>{window.__쓴곳.push('updateDoc');}, addDoc:async()=>{window.__쓴곳.push('addDoc');},
    deleteDoc:async()=>{window.__쓴곳.push('deleteDoc');},
    setDoc:async(d,v)=>{ window.__쓴곳.push(d.길);
      if (d.칸==='출고명세표') window.__보낸것[d.id]=JSON.parse(JSON.stringify(v)); },
    getDoc:async(d)=>{ if (d.칸==='출고명세표') { const v=window.__보낸것[d.id];
        return 눈(!!v, v); } return 눈(false, undefined); },
    collection:()=>({}), onSnapshot:()=>{}, query:x=>x, serverTimestamp:()=>'[때]',
    getDocs:async()=>({forEach:()=>{}}), deleteField:()=>null };
  currentFullData.length=0; L.forEach(r=>currentFullData.push(r));
  const h=currentFullData[0]; const 줄=[];
  for (let i=1;i<currentFullData.length&&줄.length<3;i++){ const r=currentFullData[i]; if(!r) continue;
    if (normalizeValue(r[h.indexOf('공급처')])!=='AMT') continue;
    if (!(parseFloat(r[h.indexOf('재단W')])>0)) continue; 줄.push(i); }
  const 적=(ri,이름,값)=>{const i=h.indexOf(이름); if(i>=0) currentFullData[ri][i]=값;};
  줄.forEach(ri=>적(ri,'조립부속코드','TA_시험_'+ri));
  const 이름=ri=>currentFullData[ri][h.indexOf('부속명')]||'부속';
  const 다됨=ri=>({'재단':{done:true,date:'2026-10-21',partName:이름(ri)},
    '엣지':{done:true,date:'2026-10-21',partName:이름(ri)},
    'NC':{done:true,date:'2026-10-21',partName:이름(ri)},
    '보링':{done:true,date:'2026-10-21',partName:이름(ri)}});
  confirmedOrders.length=0;
  confirmedOrders.push({ idNum:9901, docId:'d9901', orderCode:'유한-20261009-01',
    displayName:'시험상품 스캔', code:'시험상품 스캔', supplier:'유한가구',
    criteria: IDENTITY_HEADERS.map(c=>normalizeValue(currentFullData[줄[0]][h.indexOf(c)])),
    orderQty:10, amtTimeline:true, batchId:1791000009901, deliveryDate:'2026-10-21',
    procOverrides:{}, partMoveLog:{},
    partInfoMap: Object.fromEntries(줄.map(ri=>['card-9901-'+ri,{qty:10,isDeleted:false}])),
    partStarted:{},
    partCompletions: Object.fromEntries(줄.map(ri=>['card-9901-'+ri,다됨(ri)])) });
  window._파레트기록={ d9901:{docId:'d9901', 고른:{
    ['card-9901-'+줄[0]+'|보링']:'B', ['card-9901-'+줄[1]+'|엣지']:'A' }} };
  window._집중파레트들={};
  document.documentElement.removeAttribute('data-amthome');
  document.documentElement.removeAttribute('data-amtstock');
};

/* ═══ ㄱ) 에이엠티 — 배송 확정을 일으킨다 ═══════════════════════════ */
const ctxA = await b.newContext({ ...devices['iPhone 12'],
  viewport:{width:375,height:812}, isMobile:true, hasTouch:true });
await ctxA.route('https://cdn.tailwindcss.com*', r=>r.fulfill({status:200,
  contentType:'application/javascript',
  body:'document.write('+JSON.stringify('<style>'+CSS+'</style>')+');'}));
const pa = await ctxA.newPage(); const 에러A=[]; pa.on('pageerror',e=>에러A.push(e.message));
await pa.goto(에이주소, {waitUntil:'load'}); await pa.waitForTimeout(900);
await pa.evaluate(심을것, L);
await pa.evaluate(()=>{ ['원장','발주','도면','차례'].forEach(k=>window._자료왔다&&window._자료왔다(k)); });
await pa.waitForTimeout(900);
const 보냄 = await pa.evaluate(async ()=>{
  const item = confirmedOrders.find(o=>o.idNum===9901);
  const r = await window._출고명세표보내기(item);
  return { ...r, 담긴것: window.__보낸것, 쓴곳: window.__쓴곳 }; });
못('ㄱ 에이엠티가 거래명세표를 보낸다', 보냄.보냄>0 && 보냄.보냄===보냄.모두,
   보냄.보냄+'/'+보냄.모두+' 장 · '+JSON.stringify(보냄.글들));
못('ㄱ 쓴 곳은 출고명세표뿐 (업무 기록에 안 쓴다)',
   보냄.쓴곳.every(x=>/출고명세표/.test(x)), [...new Set(보냄.쓴곳.map(x=>x.split('/').slice(-2,-1)[0]))]);
const 큐알 = 보냄.글들[0];
const 종이 = 보냄.담긴것[큐알];
못('ㄱ 담긴 칸이 약속한 그대로',
   ['큐알','발주번호','발주문서','파레트','납기일','업체','줄수','총수량','명세표','보낸때글','판']
     .every(k=>k in 종이), Object.keys(종이).sort());
못('ㄱ 업체는 유한가구', 종이.업체==='유한가구', 종이.업체);

/* 에이엠티가 **제 화면에** 그린 그 표.
   ⚠ 에이엠티의 **진짜 길**(`?명세=<큐알>`)로 연다. 손으로 `_명세서열기` 를 부르면
     파레트를 안 추려 그 날 **전체**가 떠서, 견주는 것이 서로 다른 종이가 된다.
     (처음에 그렇게 재서 빨갛게 나왔다 — 제품이 아니라 내 자가 틀렸다.) */
const pa2 = await ctxA.newPage(); pa2.on('pageerror',e=>에러A.push(e.message));
await pa2.goto(에이주소 + '?' + encodeURIComponent('명세') + '=' + encodeURIComponent(큐알),
               {waitUntil:'load'});
await pa2.waitForTimeout(900);
await pa2.evaluate(심을것, L);
await pa2.evaluate(()=>{ ['원장','발주','도면','차례'].forEach(k=>window._자료왔다&&window._자료왔다(k)); });
await pa2.waitForTimeout(1200);
const 에이표 = await pa2.evaluate(()=>{
  const t = document.querySelector('#명세서판 .명세-표');
  return t ? t.outerHTML : ''; });
못('ㄱ 에이엠티 화면에 그 표가 떠 있다', !!에이표 && /도어|가와|부속/.test(에이표), 글자만(에이표).slice(0,60));
못('ㄱ 페이지 오류 0 (에이엠티)', 에러A.length===0, 에러A);
await ctxA.close();

/* ═══ ㄴ~ㄹ) 조혼가구 — 찍어서 펴고, 입고확인하고, 목록에 선다 ═══════ */
const 규칙 = [{ 이름:'납기 명세서', 꼴:'^[^\\s]+-\\d{8}-\\d+-[A-Z]$', 끔:false, 차례:'10',
  갈곳:'https://vivivic-cloud.github.io/vivivic-apps/에이엠티/에이엠티.html?명세={전체}' }];
const ctxB = await b.newContext({ ...devices['iPhone 12'],
  viewport:{width:375,height:812}, isMobile:true, hasTouch:true });
await ctxB.route('https://cdn.tailwindcss.com*', r=>r.fulfill({status:200,
  contentType:'application/javascript',
  body:'document.write('+JSON.stringify('<style>'+CSS+'</style>')+');'}));
const pb = await ctxB.newPage(); const 에러B=[]; pb.on('pageerror',e=>에러B.push(e.message));
await pb.addInitScript(({종이, 큐알, 규칙})=>{
  window.__열림=[]; window.__입고={};      // 화베의 `입고확인` 칸을 흉내낸다
  window.__출고={ [큐알]: 종이 };
  window.db={};
  const 눈=(있,값)=>({exists:()=>!!있, data:()=>값});
  window.fbFirestore={
    collection:(...a)=>({칸:a[a.length-1]}),
    doc:(...a)=>({길:a.slice(1).join('/'), 칸:a[a.length-2], id:a[a.length-1]}),
    getDoc: async (d)=>{ if (d.칸==='출고명세표') return 눈(!!window.__출고[d.id], window.__출고[d.id]);
      if (d.칸==='입고확인') return 눈(!!window.__입고[d.id], window.__입고[d.id]);
      return 눈(false, undefined); },
    getDocs: async (c)=>{ const 칸=c&&c.칸;
      const 줄 = 칸==='큐알규칙' ? 규칙 : (칸==='입고확인' ? Object.values(window.__입고) : []);
      return { forEach:(f)=>줄.forEach((d,i)=>f({ id:d.큐알||('r'+i), data:()=>d })) }; },
    setDoc: async (d,v)=>{ if (d.칸==='입고확인') window.__입고[d.id]=v; },
    runTransaction: async (db, fn)=>{ await fn({
      get: async (d)=>눈(!!window.__입고[d.id], window.__입고[d.id]),
      set: (d,v)=>{ window.__입고[d.id]=JSON.parse(JSON.stringify(v)); } }); },
    onSnapshot:()=>{}, serverTimestamp:()=>'[때]' };
  let n=0;
  window.BarcodeDetector = class { static async getSupportedFormats(){ return ['qr_code']; }
    constructor(){} async detect(){ n++; return n>=25?[{rawValue:큐알}]:[]; } };
  window.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');
    s.textContent='#auth-login-overlay{display:none!important}';document.head.appendChild(s);});
}, {종이, 큐알, 규칙});
await pb.goto(주소, {waitUntil:'load'}); await pb.waitForTimeout(1700);
await pb.evaluate(()=>{ window.open=(u)=>{ window.__열림.push(u); return null; };
  johonMyBoxes=[{id:'d',name:'거래내역',icon:'receipt',tone:'white',link:'',at:3}];
  johonBoxSaveLS(); johonGoHome(); johonBoxRender(); switchSupplier('유한가구'); });
// ㄴ) 진짜로 찍는다
await pb.evaluate(()=>johonScanOpen());
await pb.waitForTimeout(2400);
const 탭=async(sel)=>{ const 점=await pb.evaluate(s=>{ const el=document.querySelector(s);
    el.scrollIntoView({block:'center'}); const r=el.getBoundingClientRect();
    return {x:r.x+r.width/2,y:r.y+r.height/2,
      내가맞나:(()=>{const t=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
        return !!t && (t===el||el.contains(t)||el.contains(t.parentElement));})()}; }, sel);
  await pb.touchscreen.tap(점.x,점.y); await pb.waitForTimeout(900); return 점; };
const 눌림 = await 탭('#jhs-ways .jhs-way');
못('ㄴ 「납기 명세서」 단추가 가려지지 않는다', 눌림.내가맞나, 눌림.내가맞나);
await pb.waitForTimeout(1000);
const 본 = await pb.evaluate(()=>({
  명세화면:document.documentElement.getAttribute('data-johonbill'),
  표:(document.querySelector('#jhb-paper .명세-표')||{}).outerHTML||'',
  딱지:(document.getElementById('jhb-tag')||{}).textContent.trim(),
  열림:window.__열림 }));
못('ㄴ 에이엠티로 안 넘어간다', 본.열림.length===0, 본.열림);
못('ㄴ 제 집에서 표가 펴진다', 본.명세화면==='1' && !!본.표, 본.딱지);
못('⚠ ㄴ 두 집이 **같은 종이**다 (글자 md5)', md5(글자만(에이표))===md5(글자만(본.표)),
   md5(글자만(에이표))+' / '+md5(글자만(본.표)));
if (md5(글자만(에이표))!==md5(글자만(본.표))) {
  console.log('   에이엠티:', 글자만(에이표));
  console.log('   조혼가구:', 글자만(본.표)); }
await pb.screenshot({path:그림+'끝끝-1표.png'});

// ㄷ) 입고확인
await 탭('#jhb-ok');
const 물음 = await pb.evaluate(()=>(document.getElementById('jha-말')||{}).textContent.trim());
못('ㄷ 글귀에 그 종이의 업체가 들어간다', /책임은 유한가구에 기록됩니다/.test(물음), 물음);
await 탭('#jha-go');
await pb.waitForTimeout(1000);
const 적힌 = await pb.evaluate(()=>window.__입고);
const 한말1 = await pb.evaluate(()=>(document.getElementById('jhb-said')||{}).textContent.trim());
못('ㄷ 입고확인이 화베에 적힌다', !!적힌[큐알], Object.keys(적힌));
못('ㄷ 그 칸들이 들어 있다',
   !!적힌[큐알] && 적힌[큐알].업체==='유한가구' && 적힌[큐알].큐알===큐알 && !!적힌[큐알].명세표,
   적힌[큐알] && {업체:적힌[큐알].업체, 줄수:적힌[큐알].줄수, 총수량:적힌[큐알].총수량});
못('ㄷ 쓰고 다시 읽어 본 뒤에 됐다고 한다', /입고확인/.test(한말1), 한말1);
const 처음시각 = 적힌[큐알] && 적힌[큐알].확인시각글;
// 두 번 눌러도 안 덮는다
await pb.evaluate(()=>{ const b=document.getElementById('jhb-ok'); if(b) b.disabled=false;
  johonBillAsk(); johonBillConfirm(); });
await pb.waitForTimeout(1000);
const 적힌2 = await pb.evaluate(()=>window.__입고);
못('⚠ ㄷ 두 번 눌러도 안 덮는다', 적힌2[큐알].확인시각글===처음시각,
   처음시각+' → '+적힌2[큐알].확인시각글);
await pb.screenshot({path:그림+'끝끝-2입고확인.png'});

// ㄹ) 「거래내역」 목록에 그 줄이 선다
await pb.evaluate(()=>johonGoHome());
await pb.waitForTimeout(500);
await 탭('#jhh-mine [data-go]');
await pb.waitForTimeout(1200);
const 목록 = await pb.evaluate(()=>({
  딱지:(document.getElementById('jhd-tag')||{}).textContent.trim(),
  줄:[...document.querySelectorAll('#jhd-list .jhd-row')].map(e=>({
    큐알:e.querySelector('.jhd-q').textContent.trim(),
    밑:e.querySelector('.jhd-sub').textContent.trim() })) }));
못('ㄹ 거래내역에 그 줄이 새로 선다', 목록.줄.length===1 && 목록.줄[0].큐알===큐알, 목록.줄);
못('ㄹ 딱지에 거래처와 건수', 목록.딱지==='유한가구 · 1건', 목록.딱지);
await pb.screenshot({path:그림+'끝끝-3목록.png'});
// 그 줄을 누르면 다시 제 집 표로
await 탭('#jhd-list .jhd-row');
await pb.waitForTimeout(1200);
못('ㄹ 그 줄을 누르면 다시 제 집 표로',
   (await pb.evaluate(()=>document.documentElement.getAttribute('data-johonbill')))==='1' &&
   (await pb.evaluate(()=>window.__열림)).length===0, '제 집');
const 끝 = await pb.evaluate(()=>({
  넘침:[document.documentElement.scrollWidth, document.documentElement.clientWidth],
  작은자리:(()=>{const 밑=[];
    document.querySelectorAll('#johon-bill button, #johon-deal button, #johon-back button').forEach(el=>{
      const r=el.getBoundingClientRect(); if(r.width===0&&r.height===0) return;
      if(r.height<44||r.width<44) 밑.push(el.textContent.trim().slice(0,12)); }); return 밑;})() }));
못('375 가로 넘침 0', JSON.stringify(끝.넘침)===JSON.stringify([375,375]), 끝.넘침);
못('44px 밑 0개', 끝.작은자리.length===0, 끝.작은자리);
못('페이지 오류 0 (조혼가구)', 에러B.length===0, 에러B);
await ctxB.close();
await b.close();
끝맺기();
