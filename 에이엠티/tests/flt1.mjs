import { 브라우저열기, devices, 서버, 자료, 자재 } from './도구/터.mjs';
await 서버();   // 저장소를 8899 에 내주는 자리 서버 — 없으면 스스로 띄운다
const B='http://127.0.0.1:8899'; const 폭=parseInt(process.argv[2]||'375',10);
const L=await 자료('원장');
const b=await 브라우저열기();
const ctx=await b.newContext({...devices['iPhone 12'],viewport:{width:폭,height:812},isMobile:폭<500,hasTouch:true});
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html',{waitUntil:'load'});
await p.waitForTimeout(1800);
await p.evaluate((L)=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none'; ['원장','발주','도면','차례'].forEach(k=>window._자료왔다&&window._자료왔다(k));
  currentFullData.length=0; L.forEach(r=>currentFullData.push(r));
  window.__창고={}; window.__쓴곳=[];
  const 방=(...a)=>a.join('/');
  window.db={}; window.fbFirestore={
    collection:(db,...a)=>({p:방(...a)}), doc:(db,...a)=>({p:방(...a)}),
    setDoc:async(r,v)=>{window.__쓴곳.push(r.p); window.__창고[r.p]=Object.assign({},window.__창고[r.p],v);},
    updateDoc:async()=>{}, deleteDoc:async()=>{},
    onSnapshot:(r,cb)=>{cb({forEach:()=>{}}); return ()=>{};},
    query:x=>x, addDoc:async()=>{}, serverTimestamp:()=>0,
    getDoc:async()=>({exists:()=>false}), getDocs:async()=>({forEach:()=>{}}), deleteField:()=>null };
  amtOpenStock();
},L);
await p.waitForTimeout(400);
const 칩 = (자리)=>p.evaluate(s=>[...document.querySelectorAll(s+' .amtb-chip')]
  .map(e=>e.textContent.trim()+(e.classList.contains('on')?' ✓':'')), 자리);
console.log('■ 색상 칩:', JSON.stringify(await 칩('#ams-색')));
console.log('■ 두께 칩:', JSON.stringify(await 칩('#ams-두께')));
const 셈=()=>p.evaluate(()=>({머리:document.getElementById('ams-sub').textContent,
  줄:document.querySelectorAll('#ams-list .ams-row').length,
  푸는단추:document.getElementById('ams-푼다').classList.contains('on')}));
console.log('■ 아무것도 안 고름:', JSON.stringify(await 셈()));
const cdp=await ctx.newCDPSession(p);
const 탭=async(sel,n=0)=>{const c=await p.evaluate(({s,n})=>{const e=document.querySelectorAll(s)[n]; if(!e) return null;
  e.scrollIntoView({block:'center',inline:'center'}); const b=e.getBoundingClientRect();
  return {x:Math.round(b.x+b.width/2),y:Math.round(b.y+b.height/2)};},{s:sel,n});
  if(!c) return false;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:c.x,y:c.y,radiusX:14,radiusY:14,force:1}]});
  await p.waitForTimeout(50); await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await p.waitForTimeout(300); return true;};
// 알약은 그 갈래를 먼저 펼쳐야 눌린다(09-19 지시)
const 갈래펼치기=async(갈래)=>{const i=await p.evaluate(g=>[...document.querySelectorAll('#ams-갈래 .amtb-chip')]
  .findIndex(e=>e.dataset['갈래']===g), 갈래);
  if(i<0) return false; return 탭('#ams-갈래 .amtb-chip', i);};
const 칩누르기=async(자리,글)=>{
  const 갈래=자리.replace('#ams-','');
  const 폈나=await p.evaluate(g=>{const e=document.getElementById('ams-'+g);
    return !!e && getComputedStyle(e).display!=='none';}, 갈래);
  if(!폈나) await 갈래펼치기(갈래);
  const i=await p.evaluate(({s,g})=>{const es=[...document.querySelectorAll(s+' .amtb-chip')];
  return es.findIndex(e=>e.textContent.trim().startsWith(g));},{s:자리,g:글});
  if(i<0){console.log('   («'+글+'» 칩 없음)'); return false;} return 탭(자리+' .amtb-chip', i);};
// 갈래 단추 한 줄만 늘 보인다. 누르면 그 갈래 알약이 펼쳐지고, 고르면 도로 접힌다.
console.log('■ 갈래 단추:', JSON.stringify(await 칩('#ams-갈래')));
await 칩누르기('#ams-색','화이트');
console.log('■ 색상 «화이트» 만:', JSON.stringify(await 셈()),
  '\n   보이는 것:', JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('#ams-list .ams-nm')].map(e=>e.textContent))));
await 칩누르기('#ams-두께','18T');
console.log('■ 화이트 + 18T 함께:', JSON.stringify(await 셈()),
  '\n   보이는 것:', JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('#ams-list .ams-nm')].map(e=>e.textContent))));
// ⚠ 걸러진 상태에서 수량이 제 짝에 들어가는가
const 잰것=await p.evaluate(()=>{
  const 줄=[...document.querySelectorAll('#ams-list .ams-row')];
  const 둘째=줄[1]||줄[0];
  const 이름=둘째.querySelector('.ams-nm').textContent;
  const 키=둘째.dataset.k;
  const i=둘째.querySelector('input'); i.value='55'; i.dispatchEvent(new Event('change',{bubbles:true}));
  return {누른줄:이름, 그줄의열쇠:키};
});
await p.waitForTimeout(250);
console.log('■ 걸러진 채로 둘째 줄에 55 적기:', JSON.stringify(잰것),
  '\n   담긴 곳:', JSON.stringify(await p.evaluate(()=>{const k=window.__쓴곳[window.__쓴곳.length-1];
    return {칸:k.split('/').pop(), 값:window.__창고[k]};})));
// 빈칸·any 가 남아 있는가
await 탭('#ams-푼다');
console.log('■ 거르기 푼 뒤:', JSON.stringify(await 셈()));
for(const g of ['(색상 없음)','any']){
  await 칩누르기('#ams-색',g);
  console.log('■ 색상 «'+g+'»:', JSON.stringify(await 셈()),
    '\n   보이는 것:', JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('#ams-list .ams-nm')].map(e=>e.textContent))));
  await 탭('#ams-푼다');
}
// 폭
// 늘 보이는 것은 갈래 단추 한 줄이다. 알약 줄은 펼쳤을 때만 잴 것이 있으므로 펼쳐 놓고 잰다.
await 갈래펼치기('색');
console.log('■ 잰 값(폭 '+폭+'):', JSON.stringify(await p.evaluate(()=>{
  const g=document.getElementById('ams-갈래'), c=document.getElementById('ams-색');
  const 재=e=>{const r=e.getBoundingClientRect(); return Math.round(r.width)+'x'+Math.round(r.height);};
  return {갈래줄:{높이:Math.round(g.getBoundingClientRect().height),
                  단추:[...g.children].map(재), 틈:getComputedStyle(g).gap},
          펼친색줄:{보이는폭:Math.round(c.clientWidth), 담긴폭:Math.round(c.scrollWidth),
                    옆으로밈:c.scrollWidth>c.clientWidth+1, 높이:Math.round(c.getBoundingClientRect().height)},
          칩:(()=>{const e=c.querySelector('.amtb-chip'); const s=getComputedStyle(e);
            return {크기:재(e), 모서리:s.borderRadius, 글자:s.fontSize};})()};
})));
console.log('■ 문서 가로', await p.evaluate(()=>document.documentElement.scrollWidth),
  '· 오류', errs.length, errs.slice(0,3));
await p.screenshot({path:process.argv[3]||'/tmp/flt.png'});
await b.close();
