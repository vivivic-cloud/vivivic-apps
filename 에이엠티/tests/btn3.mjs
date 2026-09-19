import { 브라우저열기, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();   // 저장소를 8899 에 내주는 자리 서버 — 없으면 스스로 띄운다
const B='http://127.0.0.1:8899';
const O=await 자료('confirmed_orders');
const L=await 자료('원장');
const b=await 브라우저열기();
const ctx=await b.newContext({...devices['iPhone 12'],viewport:{width:375,height:812},isMobile:true,hasTouch:true});
const p=await ctx.newPage();
await p.goto(B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html',{waitUntil:'load'});
await p.waitForTimeout(1700);
console.log(JSON.stringify(await p.evaluate(async({O,L})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none'; ['원장','발주','도면','차례'].forEach(k=>window._자료왔다&&window._자료왔다(k));
  currentFullData.length=0; L.forEach(r=>currentFullData.push(r));
  confirmedOrders.length=0;
  const 가짜=JSON.parse(JSON.stringify(O.find(o=>o.partInfoMap)||O[0]));
  가짜.docId='시험-실패'; 가짜.idNum=9912; 가짜.orderCode='시험-실패-01';
  가짜.amtTimeline=false; 가짜.amtRegistered=false; 가짜.amtConfirmedCancel=false;
  가짜.isCancelRequested=false; delete 가짜.editInfo; delete 가짜.editCompleted;
  confirmedOrders.push(가짜);
  window.__토스트들=[]; const _옛=window.showToastMessage;
  window.showToastMessage=function(m){ window.__토스트들.push(String(m)); try{return _옛.apply(this,arguments);}catch(e){} };
  // 창고가 터지게 만든다 — 실패 알림 글을 보려는 것이다
  window.db={}; window.fbFirestore={ doc:()=>({}), updateDoc:async()=>{ throw new Error('시험용 실패'); },
    setDoc:async()=>{}, deleteDoc:async()=>{}, collection:()=>({}), onSnapshot:()=>{}, query:x=>x,
    addDoc:async()=>{}, serverTimestamp:()=>0, getDoc:async()=>({exists:()=>false}),
    getDocs:async()=>({forEach:()=>{}}), deleteField:()=>null };
  if(typeof amtOpenBox==='function') amtOpenBox('pending');
  window._amtVendor='*'; if(typeof amtVendorSync==='function') amtVendorSync();
  renderPendingOrders();
  const cb=document.querySelector('.pending-order-check'); if(cb && !cb.checked) cb.click();
  await confirmSelectedToTimeline();
  return {뜬알림:window.__토스트들, amtTimeline:confirmedOrders[0].amtTimeline};
},{O,L}),null,1));
await b.close();
