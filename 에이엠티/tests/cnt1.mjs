import { chromium, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();   // 저장소를 8899 에 내주는 자리 서버 — 없으면 스스로 띄운다
const b=await chromium.launch();
const MACS=['1호기','2호기','3호기','4호기','5호기'];
const ctx=await b.newContext({ ...devices['iPhone 12'], viewport:{width:375,height:812}, isMobile:true, hasTouch:true });
const p=await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html?viggle=1',{waitUntil:'load'});
await p.waitForTimeout(1500);
const sk='2026-09-15-엣지';
await p.evaluate(({MACS,sk})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none'; ['원장','발주','도면','차례'].forEach(k=>window._자료왔다&&window._자료왔다(k));
  confirmedOrders.length=0;
  confirmedOrders.push({idNum:1402,docId:'d2',orderCode:'샘플-20260101-02',displayName:'(본)본보기 수납장 1200 흰색',orderQty:50,amtTimeline:true,partInfoMap:{},partCompletions:{},partStarted:{},deliveryDate:'2026-09-15'});
  const 이름들=['도어','속가와','상판','지판','이동선반','뒷판','걸레받이'];
  const parts=이름들.map((nm,i)=>({cKey:'c_'+nm,nm,pm:4,dq:50,orderCode:'샘플-20260101-02',orderKey:'d2',orderName:'(본)본보기 수납장 1200 흰색',plateName:'PB-18T',coating:'양면',finish:'흰색',rw:600+i,rd:400,isCuttingCard:false,pRowIndex:null,coveredOrderIds:[1402]}));
  window.__saved=[];
  window.fbFirestore={doc:()=>({}),updateDoc:async()=>{},setDoc:async(r,d)=>{window.__saved.push(d);},collection:()=>({}),onSnapshot:()=>{}}; window.db={};
  window._woCutGrpOpen={}; window._woOnlyMac={};
  window._tlDcDate='2026-09-15'; appMode='process';
  tlExpandDateCard('2026-09-15'); tlDcExpandSection('엣지');
  const st={pool:[]}; MACS.forEach(m=>st[m]=[]); st['1호기']=parts.map(x=>x.cKey);
  window._woBoringParts[sk]=parts.slice(); window._woBoring[sk]=st;
  _woRenderBoard(sk);
},{MACS,sk});
await p.waitForTimeout(400);
const 줄들=()=>p.evaluate(()=>[...document.querySelectorAll('.wo-boring-mac-col')].map(c=>({
  기계:c.dataset.mac,
  카드:[...c.querySelectorAll('.wo-boring-placed-card')].length,
  줄:[...c.querySelectorAll('.wo-cut-grp')].map(g=>g.textContent.replace(/\s+/g,' ').trim())
})).filter(x=>x.줄.length||x.카드));
const 머리=()=>p.evaluate(()=>{const e=[...document.querySelectorAll('span')].filter(s=>/상품 \d+개 · 부속 \d+개|상품 \d+개 · 재단도 \d+장/.test(s.textContent));return e.map(s=>s.textContent.trim());});
console.log('■ 옮기기 전');
console.log(JSON.stringify(await 줄들(),null,1));
console.log('  판 머리글:',JSON.stringify(await 머리()));
// 부속 2개를 2호기로 옮긴다 (코드로, 화면 셈만 보려는 것)
await p.evaluate(({sk})=>{const st=window._woBoring[sk];st['2호기']=st['1호기'].slice(0,2);st['1호기']=st['1호기'].slice(2);_woRenderBoard(sk);},{sk});
await p.waitForTimeout(300);
console.log('■ 부속 2개를 2호기로 옮긴 뒤');
console.log(JSON.stringify(await 줄들(),null,1));
console.log('  판 머리글:',JSON.stringify(await 머리()));
console.log('오류',errs.length,errs.slice(0,2));
await b.close();
