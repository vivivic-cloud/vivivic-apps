// 원장재고 — 필터가 아니라 박스. 폰 375px, 진짜 손가락으로 눌러 들어간다.
import { chromium, devices } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync } from 'node:fs';
const HERE='/tmp/claude-0/-home-user-vivivic-apps/17fbe99e-07b2-5ca2-bd6b-e6d2d41ab942/scratchpad';
// 그림 둘 자리 — SHOTS=1 로 돌릴 때만 저장소에 쓴다(여느 시험 돌리기에 저장소가 더러워지지 않게)
const 그림칸 = process.env.SHOTS==='1' ? '/home/user/vivivic-apps/에이엠티/shots' : HERE;
const CSS=readFileSync(HERE+'/tw-built.css','utf-8');
const B='http://localhost:8899';
const URL=B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const L=await (await fetch(B+'/원장.json')).json();
const b=await chromium.launch();
let 실패=0; const 판=(n,t,v)=>{ if(!t) 실패++; console.log((t?'  OK  ':'  FAIL')+'  '+n+'   → '+v); };
const ctx=await b.newContext({...devices['iPhone 12'],viewport:{width:375,height:812},isMobile:true,hasTouch:true});
await ctx.route('https://cdn.tailwindcss.com*', r=>r.fulfill({status:200,contentType:'application/javascript',
  body:'document.write('+JSON.stringify('<style>'+CSS+'</style>')+');'}));
for (const [무늬,길] of [['https://cdn.sheetjs.com/**','node_modules/xlsx/dist/xlsx.full.min.js'],
                        ['https://cdn.jsdelivr.net/npm/sortablejs**','node_modules/sortablejs/Sortable.min.js'],
                        ['https://cdn.jsdelivr.net/npm/gsap**','node_modules/gsap/dist/gsap.min.js']])
  await ctx.route(무늬, r=>r.fulfill({status:200,contentType:'application/javascript',body:readFileSync(HERE+'/'+길,'utf-8')}));
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(1500);

await p.evaluate((L)=>{
  const ov=document.getElementById('auth-login-overlay'); if(ov) ov.style.display='none';
  window.__쓰기=0; const 셈=()=>async()=>{window.__쓰기++;};
  window.db={}; window.fbFirestore={doc:()=>({}),updateDoc:셈(),setDoc:셈(),deleteDoc:셈(),addDoc:셈(),
    collection:()=>({}),onSnapshot:()=>{},query:x=>x,serverTimestamp:()=>0,
    getDoc:async()=>({exists:()=>false}),getDocs:async()=>({forEach:()=>{}}),deleteField:()=>null};
  currentFullData.length=0; L.forEach(x=>currentFullData.push(x));
  amtOpenStock();
}, L);
await p.waitForTimeout(500);

const 박스읽기 = () => p.evaluate(()=>{
  const 통=id=>[...(document.getElementById(id)||{children:[]}).children].map(b=>({
      이름:(b.querySelector('.amth-nm')||{}).textContent,
      짝:parseInt(((b.querySelector('.amth-pct')||{}).textContent||'').replace(/[^\d]/g,''),10)||0,
      갈래:b.dataset['갈래'], 값:b.dataset['값']}));
  const 재=id=>{const e=document.getElementById(id); const b=e&&e.children[0];
    if(!b) return null; const r=b.getBoundingClientRect(); return {가로:Math.round(r.width), 세로:Math.round(r.height)};};
  return {색:통('ams-box-색'), 두께:통('ams-box-두께'), 가공:통('ams-box-가공'),
          박스판보임:!document.getElementById('ams-boxes').hidden,
          안보임:!document.getElementById('ams-inner').hidden,
          sub:(document.getElementById('ams-sub')||{}).textContent,
          크기:{색:재('ams-box-색'), 두께:재('ams-box-두께'), 가공:재('ams-box-가공')},
          가공칩있나:!!document.getElementById('ams-가공'),
          문서가로:document.documentElement.scrollWidth, 쓰기:window.__쓰기};
});
const 판판 = await 박스읽기();
const 합 = a => a.reduce((x,c)=>x+c.짝,0);
console.log('색상 박스 '+판판.색.length+'개: '+판판.색.map(x=>x.이름+'('+x.짝+')').join(' · '));
console.log('두께 박스 '+판판.두께.length+'개: '+판판.두께.map(x=>x.이름+'('+x.짝+')').join(' · '));
console.log('가공 박스 '+판판.가공.length+'개: '+판판.가공.map(x=>x.이름+'('+x.짝+')').join(' · '));
console.log('합계 — 색상 '+합(판판.색)+' · 두께 '+합(판판.두께)+' · 가공 '+합(판판.가공)+' (sub: '+판판.sub+')');
console.log('박스 누르는 크기: '+JSON.stringify(판판.크기));
판('들어오면 박스판이 먼저 보인다', 판판.박스판보임===true && 판판.안보임===false,
   '박스판 '+판판.박스판보임+' · 박스안 '+판판.안보임);
판('어제 잘못 넣은 가공 칩 줄은 없어졌다', 판판.가공칩있나===false, String(판판.가공칩있나));
판('색상 박스 10개', 판판.색.length===10, 판판.색.length+'개');
판('두께 박스 5개', 판판.두께.length===5, 판판.두께.length+'개');
판('가공 박스 9개', 판판.가공.length===9, 판판.가공.length+'개');
판('세 묶음 합이 다 35', 합(판판.색)===35 && 합(판판.두께)===35 && 합(판판.가공)===35,
   합(판판.색)+' / '+합(판판.두께)+' / '+합(판판.가공));
판('박스 누르는 높이 44px 이상', Object.values(판판.크기).every(x=>x && x.세로>=44),
   JSON.stringify(판판.크기));
// 박스와 재고 줄이 한 화면에 같이 보이는 자리로 옮겨 찍는다 (경계가 보여야 뜻이 있다).
// 이 화면은 창이 아니라 안쪽 칸이 구른다 — 구르는 칸을 찾아 그것을 굴린다.
await p.evaluate(()=>{
  const l=document.getElementById('ams-list'); if(!l) return;
  let e=l.parentElement, 구르는=null;
  while(e && e!==document.body){
    const s=getComputedStyle(e);
    if(/(auto|scroll)/.test(s.overflowY) && e.scrollHeight>e.clientHeight+4){ 구르는=e; break; }
    e=e.parentElement;
  }
  const 목표 = l.getBoundingClientRect().top - 260;
  if(구르는) 구르는.scrollTop += 목표;
  else { document.scrollingElement.scrollTop += 목표; window.scrollBy(0, 목표); }
});
await p.waitForTimeout(250);
await p.screenshot({path:그림칸+'/stock-375-박스판.png'});
await p.evaluate(()=>window.scrollTo(0,0));


// ── 박스판에도 재고 적는 줄이 보이는가 (09-17 00:23 지시 — 사장님이 여기에 수량을 적으신다)
const 판목록 = await p.evaluate(()=>{
  const 줄=[...document.querySelectorAll('#ams-list .ams-row')];
  const 첫=줄[0];
  return {줄수:줄.length,
          박스판보임:!document.getElementById('ams-boxes').hidden,
          목록보임:(()=>{const e=document.getElementById('ams-list'); if(!e) return false;
            const s=getComputedStyle(e); const r=e.getBoundingClientRect();
            return !e.hidden && s.display!=='none' && r.height>0;})(),
          수량칸:첫?!!첫.querySelector('input'):false,
          더하기빼기:첫?[...첫.querySelectorAll('button')].map(b=>b.textContent.trim()).length:0,
          머리:(document.getElementById('ams-sub')||{}).textContent};
});
console.log('■ 박스판의 재고 줄: '+JSON.stringify(판목록));
판('박스판에 재고 줄이 보인다 (한 겹 뒤로 안 숨는다)', 판목록.목록보임===true && 판목록.줄수>0,
   '보임 '+판목록.목록보임+' · '+판목록.줄수+'줄');
판('박스판에 35짝이 다 보인다', 판목록.줄수===35, 판목록.줄수+'줄');
판('박스판에서도 수량 ± 칸이 그대로다', 판목록.수량칸===true && 판목록.더하기빼기>=2,
   '숫자칸 '+판목록.수량칸+' · 단추 '+판목록.더하기빼기+'개');
판('박스판 머리에 전체 짝 수가 뜬다', /35짝/.test(판목록.머리||''), 판목록.머리);
// 박스와 재고 줄이 한 화면에 같이 보이는 자리로 옮겨 찍는다 (경계가 보여야 뜻이 있다).
// 이 화면은 창이 아니라 안쪽 칸이 구른다 — 구르는 칸을 찾아 그것을 굴린다.
await p.evaluate(()=>{
  const l=document.getElementById('ams-list'); if(!l) return;
  let e=l.parentElement, 구르는=null;
  while(e && e!==document.body){
    const s=getComputedStyle(e);
    if(/(auto|scroll)/.test(s.overflowY) && e.scrollHeight>e.clientHeight+4){ 구르는=e; break; }
    e=e.parentElement;
  }
  const 목표 = l.getBoundingClientRect().top - 260;
  if(구르는) 구르는.scrollTop += 목표;
  else { document.scrollingElement.scrollTop += 목표; window.scrollBy(0, 목표); }
});
await p.waitForTimeout(250);
await p.screenshot({path:그림칸+'/stock-375-박스판.png'});
await p.evaluate(()=>window.scrollTo(0,0));
// ── 진짜 손가락으로 박스에 들어간다
const 들어가기 = async (id, 값) => {
  const h = await p.evaluateHandle(({id,값})=>{
      const 찾 = [...document.getElementById(id).children].find(b=>b.dataset['값']===값);
      return 찾 || null;
    }, {id,값});
  const el=h.asElement();
  if(!el){ console.log('   !! 못 집음: '+id+' / '+값); return null; }
  await el.scrollIntoViewIfNeeded(); await el.tap(); await p.waitForTimeout(350);
  return await p.evaluate(()=>({
    이름:(document.getElementById('ams-박스이름')||{}).textContent,
    수:(document.getElementById('ams-박스수')||{}).textContent,
    줄:document.querySelectorAll('#ams-list .ams-row').length,
    박스판보임:!document.getElementById('ams-boxes').hidden,
    안보임:!document.getElementById('ams-inner').hidden,
    뒤:(()=>{const e=document.getElementById('ams-뒤'); if(!e) return null;
        const r=e.getBoundingClientRect(); return {가로:Math.round(r.width), 세로:Math.round(r.height)};})(),
    색칩:!!document.getElementById('ams-색'), 두께칩:!!document.getElementById('ams-두께'),
    문서가로:document.documentElement.scrollWidth}));
};
const 돌아가기 = async () => {
  const h=await p.evaluateHandle(()=>document.getElementById('ams-뒤'));
  await h.asElement().scrollIntoViewIfNeeded(); await h.asElement().tap(); await p.waitForTimeout(300);
  return await 박스읽기();
};

const _두값 = (판판.두께.find(x=>x.이름==='18T')||{}).값;
const 쓸것 = [['ams-box-가공','LPM-양면'], ['ams-box-색','화이트'], ['ams-box-두께', _두값]];
const 본것 = [];
for (const [id,값] of 쓸것) {
  const r = await 들어가기(id, 값);
  const 표 = (id.includes('가공')?판판.가공:id.includes('색')?판판.색:판판.두께).find(x=>x.값===값);
  if(!r) { console.log('   !! 들어가지 못함: '+id+' / '+값); continue; }
  본것.push({값, 표:표?표.짝:null, 머리:r.수, 줄:r.줄, 뒤:r.뒤});
  await 돌아가기();
}
console.log('박스에 들어가 본 것:');
본것.forEach(x=>console.log('   '+x.값.padEnd(10)+' 박스표 '+x.표+'짝 · 머리 '+x.머리+' · 줄 '+x.줄+'개'));
판('박스에 들어가면 그 묶음 짝만 모여 있다', 본것.every(x=>x.줄===x.표),
   본것.map(x=>x.값+' '+x.줄+'/'+x.표).join(' · '));
판('머리에 그 박스 이름과 짝 수가 뜬다', 본것.every(x=>x.머리===x.표+'짝'),
   본것.map(x=>x.머리).join(' · '));
판('돌아가기 단추 44px 이상', 본것.every(x=>x.뒤 && x.뒤.세로>=44), JSON.stringify(본것[0].뒤));
// 줄을 지운 것이 아니라 감춘 것이다 — 되돌리기 쉽게. 그래서 자리 자체는 그대로 있어야 한다.
판('칩 줄을 지운 것이 아니라 감춘 것이다',
   (await p.evaluate(()=>({색:!!document.getElementById('ams-색'), 두:!!document.getElementById('ams-두께')}))).색, '자리 그대로 있음');


// ── 박스 안에서 쓸모없는 칩줄이 감춰지는가 (13:25 지시)
const 줄보기 = () => p.evaluate(()=>{
  const 진짜보임=e=>{ if(!e) return null;
    if(e.hidden) return false;
    const s=getComputedStyle(e);
    if(s.display==='none'||s.visibility==='hidden') return false;
    const r=e.getBoundingClientRect(); return r.height>0 && r.width>0; };
  const 줄=(id)=>{ const e=document.getElementById(id), n=document.getElementById('ams-이름-'+id.replace('ams-',''));
    return {보임:진짜보임(e), 칩:e?[...e.children].map(b=>b.textContent.trim()):[],
            이름표보임:진짜보임(n)}; };
  return {색:줄('ams-색'), 두께:줄('ams-두께'),
          박스:(document.getElementById('ams-박스이름')||{}).textContent,
          푼다켜짐:(document.getElementById('ams-푼다')||{classList:{contains:()=>null}}).classList.contains('on')};
});
const 감춤 = [];
for (const [id,값,갈래] of [['ams-box-색','화이트','색'], ['ams-box-두께',_두값,'두께'], ['ams-box-가공','LPM-양면','가공']]) {
  await 들어가기(id, 값);
  const r = await 줄보기();
  감춤.push({갈래, 박스:r.박스, 색줄:r.색.보임, 색이름표:r.색.이름표보임, 색칩:r.색.칩.length,
             두께줄:r.두께.보임, 두께이름표:r.두께.이름표보임, 두께칩:r.두께.칩,  푼다:r.푼다켜짐});
  if (갈래==='색') await p.screenshot({path:그림칸+'/stock-375-박스안-2.png'});
  await 돌아가기();
}
console.log('박스 안 칩줄:');
감춤.forEach(x=>console.log('   '+x.갈래.padEnd(3)+' 박스('+x.박스+') → 색상줄 '+(x.색줄?'보임':'감춤')
  +'(칩 '+x.색칩+') · 두께줄 '+(x.두께줄?'보임':'감춤')+'(칩 '+JSON.stringify(x.두께칩)+')'));
const 색박스=감춤[0], 두께박스=감춤[1], 가공박스=감춤[2];
판('색상 박스 안 — 색상 칩줄이 감춰진다', 색박스.색줄===false && 색박스.색이름표===false,
   '줄 '+색박스.색줄+' · 이름표 '+색박스.색이름표);
판('색상 박스 안 — 두께 칩줄은 남는다 (더 좁힐 수 있으니)', 색박스.두께줄===true && 색박스.두께칩.length>1,
   '두께 칩 '+JSON.stringify(색박스.두께칩));
판('두께 박스 안 — 두께 칩줄이 감춰진다', 두께박스.두께줄===false && 두께박스.두께이름표===false,
   '줄 '+두께박스.두께줄+' · 이름표 '+두께박스.두께이름표);
판('두께 박스 안 — 색상 칩줄은 남는다', 두께박스.색줄===true && 두께박스.색칩>1,
   '색상 칩 '+두께박스.색칩+'개');
판('가공 박스 안 — 둘 다 남는다', 가공박스.색줄===true && 가공박스.두께줄===true,
   '색상 '+가공박스.색줄+' · 두께 '+가공박스.두께줄);
판('감춘 줄 때문에 「거르기 풀기」 가 켜지지 않는다', 감춤.every(x=>x.푼다===false),
   감춤.map(x=>x.갈래+':'+x.푼다).join(' · '));
// ── 한 짝이 세 박스에 다 드는가
const 세곳 = await p.evaluate(()=>{
  const 짝=window._amtStockPairs();
  const x=짝.find(z=>z.원==='PB-18T' && z.마==='LPM-양면' && z.색==='화이트') || 짝[0];
  const 든다=(갈래,값)=>{ const v = 갈래==='색'?(x.색||'(색상 없음)'):갈래==='두께'?(x.두께||'(두께 모름)'):(x.마||'(가공 없음)');
    return v===값; };
  return {짝:x.원+' · '+x.마+' · '+(x.색||'(색상 없음)'),
          색:든다('색', x.색||'(색상 없음)'), 두께:든다('두께', x.두께||'(두께 모름)'), 가공:든다('가공', x.마||'(가공 없음)'),
          어디:{색:x.색, 두께:x.두께, 가공:x.마}};
});
console.log('한 짝이 드는 박스: '+JSON.stringify(세곳));
판('한 짝이 색상·두께·가공 세 박스에 다 든다', 세곳.색 && 세곳.두께 && 세곳.가공,
   세곳.짝+' → 색상 '+세곳.어디.색+' · 두께 '+세곳.어디.두께+' · 가공 '+세곳.어디.가공);

const 끝 = await 박스읽기();
판('375px 가로 스크롤 없다', 끝.문서가로<=375, 끝.문서가로+'px');
판('파이어베이스 쓰기 0', 끝.쓰기===0, 끝.쓰기+'번');
판('페이지오류 없음', errs.length===0, String(errs.length)+(errs[0]?' :: '+errs[0]:''));
console.log(실패===0?'box1   OK':'box1   FAIL ('+실패+')');
await b.close(); process.exit(실패===0?0:1);
