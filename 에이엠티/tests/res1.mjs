import { 브라우저열기, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();   // 저장소를 8899 에 내주는 자리 서버 — 없으면 스스로 띄운다
const B='http://127.0.0.1:8899'; const 폭=parseInt(process.argv[2]||'375',10);
const O=await 자료('confirmed_orders');
const L=await 자료('원장');
const b=await 브라우저열기();
const ctx=await b.newContext({ ...devices['iPhone 12'], viewport:{width:폭,height:812}, isMobile:폭<500, hasTouch:true });
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html',{waitUntil:'load'});
await p.waitForTimeout(1500);
console.log(JSON.stringify(await p.evaluate(({O,L})=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none'; ['원장','발주','도면','차례'].forEach(k=>window._자료왔다&&window._자료왔다(k));
  confirmedOrders.length=0; O.forEach(x=>confirmedOrders.push(x));
  currentFullData.length=0; L.forEach(r=>currentFullData.push(r));
  window.fbFirestore={doc:()=>({}),updateDoc:async()=>{},setDoc:async()=>{},collection:()=>({}),onSnapshot:()=>{}}; window.db={};
  const h=currentFullData[0], 공=h.indexOf("공급처"), 소=h.indexOf("세트별소모량");
  // 진짜 원장에서 AMT 줄 셋, AMT 아닌 줄 셋을 고른다 (읽기만)
  const AMT=[], 남=[];
  for(let i=1;i<currentFullData.length;i++){ const r=currentFullData[i]; if(!r) continue;
    const s=normalizeValue(r[공]); if(s==="AMT"){ if(AMT.length<3) AMT.push(i); } else if(s){ if(남.length<3) 남.push(i); }
    if(AMT.length>=3&&남.length>=3) break; }
  // 가짜 발주 하나 — 화면 안에서만. 파이어스토어에 쓰지 않는다.
  const idNum=9901, pim={};
  const 넣기=(i,del)=>{ const r=currentFullData[i]; pim['card-'+idNum+'-'+i]={
      unitCons: parseFloat(r[소])||1, qty:(parseFloat(r[소])||1)*2, isDeleted:del, isManual:false,
      partSupplier: normalizeValue(r[공]) }; };
  AMT.forEach(i=>넣기(i,false));          // 원장이 AMT — 보임
  남.forEach(i=>넣기(i,false));           // 사장님이 'AMT 발주 추가' 로 넣으신 것 — 보임
  // 손으로 뺀 AMT 부속 하나 + 손으로 고친 수량 하나 (되돌리기가 살아 있는지 보려고)
  pim['card-'+idNum+'-'+AMT[0]].isDeleted=true;
  pim['card-'+idNum+'-'+AMT[1]].qty=999; pim['card-'+idNum+'-'+AMT[1]].isManual=true;
  const 가짜={ idNum, code:'가짜상품', criteria:['','','',''], plates:[], displayName:'가짜상품',
    supplier:'가나가구', partInfoMap:pim, orderQty:2, deliveryDate:'2026-09-30', orderCode:'', checked:false };
  pendingOrdersMap[appMode]=[가짜];
  const 셈=()=>{ const m=pendingOrdersMap[appMode][0].partInfoMap;
    const 보이는=Object.keys(m).filter(k=>!m[k].isDeleted);
    return { 보이는수:보이는.length,
      더한것:보이는.filter(k=>m[k].partSupplier!=='AMT').length,
      뺐던AMT보임: !m['card-'+idNum+'-'+AMT[0]].isDeleted,
      고친수량: m['card-'+idNum+'-'+AMT[1]].qty,
      손댐표시: m['card-'+idNum+'-'+AMT[1]].isManual }; };
  const 전=셈();
  let 탈=null; try{ resetSubParts(idNum); }catch(e){ 탈=String(e); }
  const 후=셈();
  return { 고른줄:{AMT,남}, 전, 후, 탈,
    사라진더한것: 전.더한것 - 후.더한것,
    호출자: '없음(파일 안에 부르는 자리 0곳)' };
},{O,L}),null,1));
console.log('오류', errs.length, errs.slice(0,3));
await b.close();
