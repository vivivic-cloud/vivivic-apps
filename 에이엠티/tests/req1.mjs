import { 브라우저열기, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();   // 저장소를 8899 에 내주는 자리 서버 — 없으면 스스로 띄운다
const B='http://127.0.0.1:8899'; const 폭=parseInt(process.argv[2]||'375',10); const 손가락=폭<500;
const O=await 자료('확정발주_지금');
const L=await 자료('원장');
const b=await 브라우저열기();
const ctx=await b.newContext({ ...devices['iPhone 12'], viewport:{width:폭,height:812}, isMobile:손가락, hasTouch:true });
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html',{waitUntil:'load'});
await p.waitForTimeout(1600);
// 가짜 실시간 배달통 — 가나가구가 요청을 넣는 것을 흉내낸다 (파이어스토어에 쓰지 않는다)
await p.evaluate(({O,L})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none'; ['원장','발주','도면','차례'].forEach(k=>window._자료왔다&&window._자료왔다(k));
  currentFullData.length=0; L.forEach(rr=>currentFullData.push(rr));
  window.__배달=null;
  window.fbFirestore={doc:()=>({}),updateDoc:async()=>{},setDoc:async()=>{},collection:()=>({}),
    query:(x)=>x, onSnapshot:(ref,cb)=>{ window.__배달=cb; return ()=>{}; }};
  window.db={};
  confirmedOrders.length=0;
  window._woBoardOrder={}; window._woBoring={}; window._woBoringParts={}; window._cuttingPlans={};
  if(typeof initConfirmedOrdersSync==='function') initConfirmedOrdersSync();
  // 첫 배달 — 지금 있는 발주들
  const 문서들=O.map(x=>({id:x._id, data:()=>Object.assign({},x)}));
  window.__보내기=(chs)=>window.__배달({docChanges:()=>chs, docs:문서들});
  window.__보내기(문서들.map(d=>({type:'added', doc:d})));
  appMode='order'; if(typeof switchPage==='function') switchPage('order');
  try{ if(typeof amtOpenBox==='function') amtOpenBox('confirmed'); }catch(e){}
  try{ if(typeof amtVendorPick==='function') amtVendorPick('*'); }catch(e){}
},{O,L});
await p.waitForTimeout(900);
const 고름=await p.evaluate(()=>{const o=confirmedOrders.find(x=>x.amtTimeline===true); return {docId:o.docId, 이름:o.displayName, 코드:o.orderCode};});
console.log('■ 고른 확정 발주:', JSON.stringify(고름));
const 표시=()=>p.evaluate(d=>{
  const el=document.getElementById('tlconf-card-'+d) || document.getElementById('pending-card-'+d);
  return {줄:el?el.id:null, 취소표시:el?/취소요청/.test(el.textContent):false, 알림수:(document.getElementById('notification-badge')||{}).textContent};
}, 고름.docId);
console.log('  요청 전:', JSON.stringify(await 표시()));
// 가나가구가 취소요청을 넣었다고 배달한다
const t0=Date.now();
await p.evaluate(d=>{ const o=confirmedOrders.find(x=>x.docId===d);
  const 새={...o, isCancelRequested:true};
  window.__보내기([{type:'modified', doc:{id:d, data:()=>새}}]); }, 고름.docId);
await p.waitForTimeout(120);
const 후=await 표시(); const 걸린=Date.now()-t0;
console.log('  요청 뒤:', JSON.stringify(후), '· 새로고침 없이 뜨기까지', 걸린, 'ms');
// 알림 카드를 눌러 그 줄로 가는지
await p.evaluate(()=>{const d=document.getElementById('notification-dropdown'); if(d) d.classList.remove('hidden');});
await p.waitForTimeout(200);
const 카드=await p.evaluate(()=>{const c=document.querySelector('#notifications-list > div'); if(!c) return null;
  const r=c.getBoundingClientRect(); return {크기:Math.round(r.width)+'x'+Math.round(r.height), x:Math.round(r.x+40), y:Math.round(r.y+r.height/2)};});
console.log('  알림 카드:', JSON.stringify(카드));
if(카드){
  console.log('  탭 자리에 있는 것:', await p.evaluate(({x,y})=>{const el=document.elementFromPoint(x,y);
    return el? (el.tagName+' · '+(el.className||'').toString().slice(0,30)+' · onclick='+!!el.closest('[onclick]')) : '없음';},카드));
  if(손가락){ await p.tap('#notifications-list > div'); }
  else { await p.click('#notifications-list > div'); }
  await p.waitForTimeout(1400);
  console.log('  드롭다운 숨김?', await p.evaluate(()=>document.getElementById('notification-dropdown').classList.contains('hidden')));
  console.log('  직접 부르면:', JSON.stringify(await p.evaluate(async d=>{ scrollToPendingOrder(d);
    await new Promise(r=>setTimeout(r,700));
    const el=document.getElementById('tlconf-card-'+d)||document.getElementById('pending-card-'+d);
    return {줄:el?el.id:null, 짚음:el?el.classList.contains('notif-highlight'):false};}, 고름.docId)));
  console.log('  누른 뒤:', JSON.stringify(await p.evaluate(d=>{
    const el=document.getElementById('tlconf-card-'+d)||document.getElementById('pending-card-'+d);
    return {탭:appMode, 줄:el?el.id:null, 짚음:el?el.classList.contains('notif-highlight'):false,
      보임:el?(el.getBoundingClientRect().height>0):false, 알림수:(document.getElementById('notification-badge')||{}).textContent,
      요청그대로:!!confirmedOrders.find(x=>x.docId===d)?.isCancelRequested};}, 고름.docId)));
}
console.log('  오류',errs.length,errs.slice(0,2));
await b.close();
