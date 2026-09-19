import { 브라우저열기, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();   // 저장소를 8899 에 내주는 자리 서버 — 없으면 스스로 띄운다
const B='http://127.0.0.1:8899';
const O=await 자료('확정발주_지금');
const L=await 자료('원장');
const b=await 브라우저열기();
const ctx=await b.newContext({ ...devices['iPhone 12'], viewport:{width:375,height:812}, isMobile:true, hasTouch:true });
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html',{waitUntil:'load'});
await p.waitForTimeout(1600);
const r=await p.evaluate(({O,L})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none'; ['원장','발주','도면','차례'].forEach(k=>window._자료왔다&&window._자료왔다(k));
  currentFullData.length=0; L.forEach(rr=>currentFullData.push(rr));
  confirmedOrders.length=0; O.forEach(x=>confirmedOrders.push(Object.assign({docId:x._id},x)));
  const h=currentFullData[0];
  // 진짜 발주 하나에, 사장님이 'AMT 발주 추가' 로 더한 것과 같은 모양의 부속을 하나 넣는다
  // (화면 안에서만. 파이어스토어에는 쓰지 않는다)
  // 발주번호를 못 박지 않는다 — 저장소에 실제 발주번호를 남기지 않으려는 것이고,
  // 자료가 바뀌어도 견디게 하려는 것이다. 부속이 달린 발주 아무거나 하나 쓴다.
  const 대상=confirmedOrders.find(o=>o.partInfoMap && Object.keys(o.partInfoMap).length)
           || confirmedOrders[0];
  window.__쓴발주=대상.orderCode;
  const 그발주행=Object.keys(대상.partInfoMap).map(k=>parseInt(k.split('-')[2]));
  // 그 상품의 원장 행 근처에서 공급처가 AMT 가 아닌 행 하나 고른다
  let 더한행=null;
  for(let ri=Math.max(1,Math.min(...그발주행)-6); ri<=Math.max(...그발주행)+6 && ri<currentFullData.length; ri++){
    const r0=currentFullData[ri]; if(!r0) continue;
    if(String(r0[h.indexOf('공급처')]).trim()==='AMT') continue;
    const W=parseFloat(r0[h.indexOf('재단W')])||0, D=parseFloat(r0[h.indexOf('재단D')])||0;
    if(W>0&&D>0){ 더한행=ri; break; }
  }
  if(더한행==null) return {실패:'외부발주 행을 못 찾음'};
  const 더한키='card-'+대상.idNum+'-'+더한행;
  대상.partInfoMap[더한키]={qty:대상.orderQty,unitCons:1,isDeleted:false,isManual:false,
    partSupplier:String(currentFullData[더한행][h.indexOf('공급처')]).trim(),
    partName:currentFullData[더한행][h.indexOf('부속명')]};
  window.fbFirestore={doc:()=>({}),updateDoc:async()=>{},setDoc:async()=>{},collection:()=>({}),onSnapshot:()=>{}}; window.db={};
  window._woBoring={}; window._woBoringParts={}; window._woBoardOrder={}; window._cuttingPlans={};
  appMode='process'; if(typeof renderProcessTimeline==='function') renderProcessTimeline();
  ['2026-09-09','2026-09-10','2026-09-11','2026-09-12','2026-09-13','2026-09-14','2026-09-15','2026-09-16'].forEach(d=>{
    window._tlDcDate=d; try{ tlExpandDateCard(d); ['재단','엣지','보링'].forEach(pr=>{try{tlDcExpandSection(pr);}catch(e){}}); }catch(e){}
  });
  const 판={};
  Object.keys(window._woBoringParts).forEach(sk=>{
    const 내것=(window._woBoringParts[sk]||[]).filter(x=>x.orderCode===window.__쓴발주);
    if(내것.length) 판[sk]=내것.map(x=>x.nm);
  });
  return {더한행, 더한부속:대상.partInfoMap[더한키].partName, 공급처:대상.partInfoMap[더한키].partSupplier, 판};
},{O,L});
console.log(JSON.stringify(r,null,1));
console.log('오류',errs.length,errs.slice(0,2));
await b.close();
