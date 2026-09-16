import { chromium, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();
const MACS=['1호기','2호기','3호기','4호기','5호기'];
const ctx=await b.newContext({ ...devices['iPhone 12'], viewport:{width:375,height:812}, isMobile:true, hasTouch:true });
const p=await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8899/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html?viggle=1',{waitUntil:'load'});
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
  기계:c.dataset.mac, 카드:c.querySelectorAll('.wo-boring-placed-card').length,
  줄:[...c.querySelectorAll('.wo-cut-grp')].map(g=>g.textContent.replace(/\s+/g,' ').trim())})).filter(x=>x.줄.length||x.카드));

// ① 완료 표시가 있는 부속을 나눠 둔다 — 완료 셈도 칸별로 맞아야 한다
await p.evaluate(sk=>{
  const o=confirmedOrders[0];
  o.partCompletions = o.partCompletions || {};
  // 도어·속가와 두 장을 엣지 완료로 찍는다 (읽기 전용 흉내 — 화면 셈만 본다)
  ['c_도어','c_속가와'].forEach(k=>{ o.partCompletions[k]={ '엣지': true }; });
  const st=window._woBoring[sk]; st['2호기']=['c_도어','c_상판']; st['1호기']=['c_속가와','c_지판','c_이동선반','c_뒷판','c_걸레받이'];
  _woRenderBoard(sk);
},sk);
await p.waitForTimeout(300);
console.log('① 완료 2장을 두 칸에 나눠 둠');
console.log(JSON.stringify(await 줄들(),null,1));

// ② 휴식으로 줄이 끊긴 경우 — 같은 상품이 한 칸에서 두 줄이 된다
await p.evaluate(sk=>{
  const st=window._woBoring[sk];
  st['2호기']=[]; st['1호기']=['c_도어','c_속가와',{type:'break',min:30},'c_상판','c_지판','c_이동선반','c_뒷판','c_걸레받이'];
  _woRenderBoard(sk);
},sk);
await p.waitForTimeout(300);
console.log('② 휴식으로 끊긴 줄 (2장 + 5장)');
console.log(JSON.stringify(await 줄들(),null,1));

// ③ 한 호기만 보는 화면에서도
await p.evaluate(sk=>{
  const st=window._woBoring[sk];
  st['1호기']=['c_도어','c_속가와','c_상판']; st['2호기']=['c_지판','c_이동선반','c_뒷판','c_걸레받이'];
  _woSetOnlyMac(sk,'2호기');
},sk);
await p.waitForTimeout(300);
console.log('③ 2호기만 보기 (2호기에 4장)');
console.log(JSON.stringify(await 줄들(),null,1));
console.log('오류',errs.length,errs.slice(0,2));
await b.close();
