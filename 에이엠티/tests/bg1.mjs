import { chromium, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const 폭=parseInt(process.argv[2]||'375',10);
const b=await chromium.launch();
const ctx=await b.newContext({ ...devices['iPhone 12'], viewport:{width:폭,height:812}, isMobile:폭<500, hasTouch:true });
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html?viggle=1',{waitUntil:'load'});
await p.waitForTimeout(1500);
const sk='2026-09-15-엣지';
await p.evaluate((sk)=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none'; ['원장','발주','도면','차례'].forEach(k=>window._자료왔다&&window._자료왔다(k));
  confirmedOrders.length=0;
  const mk=(i,코드,이름,부속들)=>{const parts=부속들.map((nm,j)=>({cKey:코드+'_'+nm,nm,pm:4,dq:50,orderCode:코드,orderKey:'d'+i,
    orderName:이름,plateName:'PB-18T',coating:'양면',finish:'화이트',rw:600+j,rd:400,isCuttingCard:false,pRowIndex:null,coveredOrderIds:[1400+i]}));
    confirmedOrders.push({idNum:1400+i,docId:'d'+i,orderCode:코드,displayName:이름,orderQty:50,amtTimeline:true,partInfoMap:{},partCompletions:{},partStarted:{},deliveryDate:'2026-09-15'});
    return parts;};
  const A=mk(0,'샘플-20260101-03','(본)본보기 수납장 1200',['도어','속가와','상판']);
  const B=mk(1,'샘플-20260101-01','(본)본보기 오픈장',['가와','이동선반']);
  const parts=[...A,...B];
  window.fbFirestore={doc:()=>({}),updateDoc:async()=>{},setDoc:async()=>{},collection:()=>({}),onSnapshot:()=>{}}; window.db={};
  window._woCutGrpOpen={}; window._woCutGrpOpen[sk+'|샘플-20260101-03']=true; window._woOnlyMac={};
  window._tlDcDate='2026-09-15'; appMode='process';
  tlExpandDateCard('2026-09-15'); tlDcExpandSection('엣지');
  const st={pool:[]}; ['1호기','2호기','3호기','4호기','5호기'].forEach(m=>st[m]=[]);
  st['1호기']=parts.map(x=>x.cKey);
  window._woBoringParts[sk]=parts.slice(); window._woBoring[sk]=st;
  _woRenderBoard(sk);
}, sk);
await p.waitForTimeout(400);
const 값=await p.evaluate(()=>{
  const g=(sel)=>{const e=document.querySelector(sel); if(!e) return null; const s=getComputedStyle(e); const r=e.getBoundingClientRect();
    return {바탕:s.backgroundColor, 테두리:s.borderTopWidth+' '+s.borderTopColor, 왼줄:s.borderLeftWidth+' '+s.borderLeftColor,
      크기:Math.round(r.width)+'x'+Math.round(r.height)};};
  return {판머리:g('.wo-boring-board-hdr'), 기계머리:g('.wo-boring-machine-hdr'),
    닫힌상품줄:g('.wo-cut-grp:not(.on)'), 펼친상품줄:g('.wo-cut-grp.on'), 부속카드:g('.wo-boring-placed-card'),
    칸:g('.wo-boring-mac-col')};
});
console.log('■ 폭',폭, JSON.stringify(값,null,1));
console.log('  오류',errs.length,errs.slice(0,2));
if(폭===375) await p.screenshot({path:'bg_'+(process.argv[3]||'before')+'.png'});
await b.close();
