import { chromium, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();   // 저장소를 8899 에 내주는 자리 서버 — 없으면 스스로 띄운다
const b=await chromium.launch();
const MACS=['1호기','2호기','3호기','4호기','5호기'];
const ctx=await b.newContext({ ...devices['iPhone 12'], viewport:{width:375,height:812}, isMobile:true, hasTouch:true });
const p=await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html?viggle=1',{waitUntil:'load'});
await p.waitForTimeout(1500);
await p.evaluate((MACS)=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none'; ['원장','발주','도면','차례'].forEach(k=>window._자료왔다&&window._자료왔다(k));
  const sk='2026-09-15-엣지';
  confirmedOrders.length=0;
  confirmedOrders.push({idNum:1401,docId:'d0',orderCode:'샘플-20260101-01',displayName:'(본)본보기 오픈장',orderQty:50,amtTimeline:true,partInfoMap:{},partCompletions:{},partStarted:{},deliveryDate:'2026-09-15'});
  const parts=['가와','이동선반','지판'].map((nm,i)=>({cKey:'c_'+nm,nm,pm:8,dq:50,orderCode:'샘플-20260101-01',orderKey:'d0',orderName:'(본)본보기 오픈장',plateName:'PB-18T',coating:'양면',finish:'미색',rw:600+i,rd:400,isCuttingCard:false,pRowIndex:null,coveredOrderIds:[1401]}));
  window.__saved=[];
  window.fbFirestore={doc:()=>({}),updateDoc:async()=>{},setDoc:async(r,d)=>{window.__saved.push(d);},collection:()=>({}),onSnapshot:()=>{}}; window.db={};
  window._woCutGrpOpen={}; window._woCutGrpOpen[sk+'|샘플-20260101-01']=true;
  window._woOnlyMac={};
  window._tlDcDate='2026-09-15'; appMode='process';
  tlExpandDateCard('2026-09-15'); tlDcExpandSection('엣지');
  const st={pool:[]}; MACS.forEach((m,i)=>st[m]= i===0?parts.map(x=>x.cKey):[]);
  window._woBoringParts[sk]=parts.slice(); window._woBoring[sk]=st;
  _woRenderBoard(sk);
}, MACS);
await p.waitForTimeout(400);
const cdp=await ctx.newCDPSession(p);
const 손=(t,x,y)=>cdp.send('Input.dispatchTouchEvent',{type:t,touchPoints:t==='touchEnd'?[]:[{x,y,radiusX:14,radiusY:14,force:1}]});
const 탭=async(sel)=>{const r=await p.evaluate(s=>{const e=document.querySelector(s); if(!e) return null; const b=e.getBoundingClientRect(); return {x:Math.round(b.x+b.width/2),y:Math.round(b.y+b.height/2)};},sel);
  if(!r) return false; await 손('touchStart',r.x,r.y); await p.waitForTimeout(110); await 손('touchEnd',0,0); await p.waitForTimeout(350); return true;};
const 차례=()=>p.evaluate(()=>_woGetEntries('2026-09-15-엣지','1호기'));
await 탭('.wo-boring-machine-hdr');
console.log('한 호기 보기:', JSON.stringify(await p.evaluate(()=>({칸:document.querySelectorAll('.wo-boring-mac-col').length, 너비:Math.round(document.querySelector('.wo-boring-mac-col').getBoundingClientRect().width), 카드:[...document.querySelectorAll('.wo-boring-placed-card')].filter(e=>e.offsetParent!==null).length}))));
console.log('  처음 차례:', (await 차례()).join(' · '));
// 한 호기만 보는 중에 기기변경 모드로 들어가면 전체 호기로 돌아와야 한다
const 전 = await p.evaluate(()=>({칸:document.querySelectorAll('.wo-boring-mac-col').length, 한호기:(window._woOnlyMac||{})['2026-09-15-엣지']||null}));
console.log('기기변경 전:', JSON.stringify(전));
await p.evaluate(()=>window.woBoardDblClick('c_가와','2026-09-15-엣지'));
await p.waitForTimeout(350);
const 후 = await p.evaluate(()=>{
  const 배너=document.querySelector('.wo-mac-change-banner, #wo-mac-change-banner');
  return {
    칸: document.querySelectorAll('.wo-boring-mac-col').length,
    한호기: (window._woOnlyMac||{})['2026-09-15-엣지']||null,
    모드: !!window._woMacChangeMode,
    강조: document.querySelectorAll('.wo-mac-highlight').length,
    배너뜸: !!(배너 && 배너.classList.contains('on')),
    머리: [...document.querySelectorAll('.wo-boring-machine-hdr')].map(e=>e.textContent.trim()),
  };
});
console.log('기기변경 후:', JSON.stringify(후, null, 0));
console.log('오류', errs.length, errs.slice(0,3));
await b.close();
