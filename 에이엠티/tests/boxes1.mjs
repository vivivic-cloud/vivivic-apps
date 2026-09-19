// 원장재고 거르기 — 늘 보이는 것은 갈래 단추 한 줄뿐. 폰 375px, 진짜 손가락으로 누른다.
// 사장님 지시(09-17 00:37): 「필터링 별 박스 작게 만들어줘 해당 버튼 클릭시
//   아래로 해당 원장만 나오게해줘 스크롤밑으로 길게 노출시키지말라고」
// 사장님 지시(09-19 08:06): 「필터링 버튼 모바일에서 겁나 정신없어 깔끔하게 좀 해봐」
//   → 알약 세 줄(24개, 15개가 화면 밖)을 갈래 단추 한 줄로 접었다.
import { chromium, devices, 서버, 자료, 자재, 그림칸 as 그림칸자리 } from './도구/터.mjs';
await 서버();   // 저장소를 8899 에 내주는 자리 서버 — 없으면 스스로 띄운다
import { readFileSync } from 'node:fs';
const HERE = await 자재();   // 막힌 CDN 대신 쓸 것들 — 없으면 스스로 갖춘다
// 그림 둘 자리 — SHOTS=1 로 돌릴 때만 저장소에 쓴다(여느 시험 돌리기에 저장소가 더러워지지 않게)
const 그림칸 = 그림칸자리();
const CSS=readFileSync(HERE+'/tw-built.css','utf-8');
const B='http://127.0.0.1:8899';
const URL=B+'/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0/%EC%97%90%EC%9D%B4%EC%97%A0%ED%8B%B0.html';
const L=await 자료('원장');
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

const 읽기 = () => p.evaluate(()=>{
  const 줄=id=>[...(document.getElementById(id)||{children:[]}).children].map(b=>({
      이름:b.childNodes[0].textContent.trim(),
      짝:parseInt(((b.querySelector('.ams-수')||{}).textContent||'').replace(/[^\d]/g,''),10)||0,
      값:b.dataset['값'], 켬:b.classList.contains('on')}));
  const 재=id=>{const e=document.getElementById(id), b=e&&e.children[0];
    if(!b) return null; const r=b.getBoundingClientRect(); return {가로:Math.round(r.width), 세로:Math.round(r.height)};};
  const 보임=e=>{ if(!e) return false; const st=getComputedStyle(e);
    return st.display!=='none' && e.getBoundingClientRect().height>0; };
  const 칸=id=>{const e=document.getElementById(id); if(!e) return null; const r=e.getBoundingClientRect();
    return {보임:보임(e), 세로:Math.round(r.height), 보이는폭:Math.round(e.clientWidth), 담긴폭:Math.round(e.scrollWidth),
            옆으로밈:e.scrollWidth>e.clientWidth+1, 아래로깔림:e.scrollHeight>e.clientHeight+1};};
  // 갈래 단추 줄 — 늘 보이는 한 줄
  const 갈래칸=document.getElementById('ams-갈래');
  const 갈래단추=[...(갈래칸||{children:[]}).children].map(b=>{const r=b.getBoundingClientRect();
    return {글:b.innerText.trim(), 갈래:b.dataset['갈래'], 켬:b.classList.contains('on'),
            폈다:b.classList.contains('폈다'), 가로:Math.round(r.width), 세로:Math.round(r.height)};});
  // 거르기가 세로로 먹는 자리 — 갈래 단추 꼭대기부터 펼친 알약 줄(있으면) 바닥까지
  const 편줄=['색','두께','가공'].map(g=>document.getElementById('ams-'+g)).filter(보임);
  const 끝 = 편줄.length ? 편줄[편줄.length-1] : 갈래칸;
  const 먹는자리 = 갈래칸 ? Math.round(끝.getBoundingClientRect().bottom - 갈래칸.getBoundingClientRect().top) : null;
  return {색:줄('ams-색'), 두께:줄('ams-두께'), 가공:줄('ams-가공'),
          갈래단추,
          크기:{색:재('ams-색'), 두께:재('ams-두께'), 가공:재('ams-가공')},
          줄칸:{색:칸('ams-색'), 두께:칸('ams-두께'), 가공:칸('ams-가공')},
          편줄:['색','두께','가공'].filter(g=>보임(document.getElementById('ams-'+g))),
          먹는자리,
          목록줄:document.querySelectorAll('#ams-list .ams-row').length,
          목록보임:(()=>{const e=document.getElementById('ams-list'); if(!e) return false;
            const s=getComputedStyle(e); return !e.hidden && s.display!=='none' && e.getBoundingClientRect().height>0;})(),
          목록첫줄y:(()=>{const e=document.querySelector('#ams-list .ams-row');
            return e?Math.round(e.getBoundingClientRect().top):null;})(),
          빈말:(()=>{const e=document.querySelector('#ams-list .ams-empty');
            return e?e.textContent.trim():null;})(),
          sub:(document.getElementById('ams-sub')||{}).textContent,
          푼다켜짐:(document.getElementById('ams-푼다')||{classList:{contains:()=>null}}).classList.contains('on'),
          박스판있나:!!document.getElementById('ams-boxes'), 뒤단추있나:!!document.getElementById('ams-뒤'),
          문서가로:document.documentElement.scrollWidth, 쓰기:window.__쓰기};
});

const 첫판 = await 읽기();
const 합 = a => a.reduce((x,c)=>x+c.짝,0);
console.log('색상 알약 '+첫판.색.length+'개: '+첫판.색.map(x=>x.이름+'('+x.짝+')').join(' · '));
console.log('두께 알약 '+첫판.두께.length+'개: '+첫판.두께.map(x=>x.이름+'('+x.짝+')').join(' · '));
console.log('가공 알약 '+첫판.가공.length+'개: '+첫판.가공.map(x=>x.이름+'('+x.짝+')').join(' · '));
console.log('합계 — 색상 '+합(첫판.색)+' · 두께 '+합(첫판.두께)+' · 가공 '+합(첫판.가공)+' (sub: '+첫판.sub+')');
console.log('갈래 단추: '+JSON.stringify(첫판.갈래단추));
console.log('거르기가 먹는 세로 자리: '+첫판.먹는자리+'px · 펼친 줄 '+JSON.stringify(첫판.편줄));
console.log('줄칸: '+JSON.stringify(첫판.줄칸));

판('박스판과 돌아가기 단추가 없어졌다 (들어가는 칸이 없다)',
   첫판.박스판있나===false && 첫판.뒤단추있나===false,
   '박스판 '+첫판.박스판있나+' · 뒤단추 '+첫판.뒤단추있나);
판('색상 알약 10개', 첫판.색.length===10, 첫판.색.length+'개');
판('두께 알약 5개', 첫판.두께.length===5, 첫판.두께.length+'개');
판('가공 알약 9개', 첫판.가공.length===9, 첫판.가공.length+'개');
판('세 묶음 합이 다 35', 합(첫판.색)===35 && 합(첫판.두께)===35 && 합(첫판.가공)===35,
   합(첫판.색)+' / '+합(첫판.두께)+' / '+합(첫판.가공));
// 09-19 지시 — 세 줄을 한꺼번에 펼쳐 두지 않는다. 늘 보이는 것은 갈래 단추 한 줄뿐.
판('연 직후에는 알약 줄이 하나도 안 펼쳐져 있다', 첫판.편줄.length===0, JSON.stringify(첫판.편줄));
판('갈래 단추 세 개(색상·두께·가공)가 한 줄에 있다',
   첫판.갈래단추.length===3 && 첫판.갈래단추.map(x=>x.글).join('·')==='색상·두께·가공',
   첫판.갈래단추.map(x=>x.글).join('·'));
판('갈래 단추 누르는 높이 44px 이상', 첫판.갈래단추.every(x=>x.세로>=44),
   첫판.갈래단추.map(x=>x.가로+'x'+x.세로).join(' · '));
판('갈래 단추 세 개가 한 화면 폭 안에 든다 (옆으로 밀 일이 없다)',
   첫판.갈래단추.reduce((a,c)=>a+c.가로,0) + 16 <= 375,
   첫판.갈래단추.map(x=>x.가로).join('+')+'+틈16 = '+(첫판.갈래단추.reduce((a,c)=>a+c.가로,0)+16)+'px');
판('거르기가 먹는 세로가 알약 줄 하나보다 작다 (전 214px)', 첫판.먹는자리<=60,
   첫판.먹는자리+'px');
// 09-17 02:00 지시 — 안 고르셨으면 자재를 쭉 늘어놓지 않는다
판('연 직후에는 목록이 비어 있다 (안 거른 자재를 늘어놓지 않는다)',
   첫판.목록줄===0, 첫판.목록줄+'줄');
판('빈 목록 자리에 한 줄 안내가 있다',
   /고르시면/.test(첫판.빈말||''), 첫판.빈말);
판('머리의 「35짝」 은 그대로 둔다 (몇 짝인지는 보셔야 한다)',
   /^35짝$/.test((첫판.sub||'').trim()), 첫판.sub);
판('목록 칸 자체는 이 화면에 그대로 있다 (한 겹 뒤로 안 숨는다)',
   첫판.목록보임===true, String(첫판.목록보임));

// 그림 ① — 아무것도 안 고른 첫 화면 (판번호를 올린 뒤에 찍는다)
await p.evaluate(()=>window.scrollTo(0,0));
await p.waitForTimeout(200);
await p.screenshot({path:그림칸+'/stock-375-거르기-후.png'});

// ── 진짜 손가락으로 갈래 단추와 알약을 누른다
const 갈래톡 = async (갈래) => {
  const h=await p.evaluateHandle(g=>[...(document.getElementById('ams-갈래')||{children:[]}).children]
      .find(e=>e.dataset['갈래']===g)||null, 갈래);
  const el=h.asElement(); if(!el){ console.log('   !! 갈래 단추 못 집음: '+갈래); return false; }
  await el.scrollIntoViewIfNeeded(); await el.tap(); await p.waitForTimeout(320); return true;
};
// 알약은 그 갈래를 먼저 펼쳐야 눌린다 — 접혀 있으면 화면에 없다
const 칩톡 = async (칸, 값) => {
  const 갈래 = 칸.replace('ams-','');
  const 폈나 = await p.evaluate(g=>{const e=document.getElementById('ams-'+g);
    return !!e && getComputedStyle(e).display!=='none';}, 갈래);
  if(!폈나) await 갈래톡(갈래);
  const h=await p.evaluateHandle(({s,g})=>[...(document.getElementById(s)||{children:[]}).children]
      .find(e=>e.dataset['값']===g)||null, {s:칸,g:값});
  const el=h.asElement(); if(!el){ console.log('   !! 못 집음: '+칸+' / '+값); return false; }
  await el.scrollIntoViewIfNeeded(); await el.tap(); await p.waitForTimeout(320); return true;
};

// ── 갈래 단추를 누르면 그 갈래 알약만 펼쳐진다
await 갈래톡('색');
const 색폄 = await 읽기();
console.log('■ 「색상」 누른 뒤: 펼친 줄 '+JSON.stringify(색폄.편줄)+' · 거르기 세로 '+색폄.먹는자리+'px');
판('갈래를 누르면 그 갈래 알약 줄만 펼쳐진다',
   색폄.편줄.length===1 && 색폄.편줄[0]==='색' && 색폄.색.length===10,
   JSON.stringify(색폄.편줄)+' · 알약 '+색폄.색.length+'개');
판('펼친 갈래 단추에 표가 난다', (색폄.갈래단추.find(x=>x.갈래==='색')||{}).폈다===true,
   String((색폄.갈래단추.find(x=>x.갈래==='색')||{}).폈다));
판('펼쳐도 거르기가 먹는 세로가 전(214px)보다 작다', 색폄.먹는자리<214, 색폄.먹는자리+'px');
await 갈래톡('색');
const 색접 = await 읽기();
판('같은 갈래를 다시 누르면 접힌다', 색접.편줄.length===0, JSON.stringify(색접.편줄));

// 갈래를 하나씩 펼쳐 알약 크기를 잰다 — 접혀 있으면 잴 것이 없다
const 알약크기 = {};
for (const g of ['색','두께','가공']) {
  await 갈래톡(g);
  const r = await 읽기();
  알약크기[g] = r.크기[g];
  판(g+' 줄만 펼쳐진다 (한 번에 한 줄)', r.편줄.length===1 && r.편줄[0]===g, JSON.stringify(r.편줄));
  await 갈래톡(g);
}
console.log('■ 펼쳤을 때 알약 누르는 크기: '+JSON.stringify(알약크기));
판('알약 누르는 높이 44px 이상', Object.values(알약크기).every(x=>x && x.세로>=44),
   JSON.stringify(알약크기));
const 표에서 = (줄,값) => (줄.find(x=>x.값===값)||{}).짝;

// ① 색상 「화이트」
await 칩톡('ams-색','화이트');
const 화이트 = await 읽기();
console.log('■ 「화이트」 누른 뒤: '+화이트.목록줄+'줄 · sub 「'+화이트.sub+'」 · 첫 줄 y '+화이트.목록첫줄y);
판('「화이트」 를 누르면 그때 그 자리에 그 몫만 나온다',
   화이트.목록줄===표에서(첫판.색,'화이트'), 표에서(첫판.색,'화이트')+'짝 → '+화이트.목록줄+'줄');
판('세 줄과 목록 첫 줄이 한 화면(812px) 안에 같이 든다',
   화이트.목록첫줄y!=null && 화이트.목록첫줄y<812, '목록 첫 줄 y '+화이트.목록첫줄y+'px');
판('누른 알약이 켜지고 「거르기 풀기」 가 나온다',
   화이트.색.find(x=>x.값==='화이트').켬===true && 화이트.푼다켜짐===true,
   '켬 '+화이트.색.find(x=>x.값==='화이트').켬+' · 푼다 '+화이트.푼다켜짐);
// 09-19 지시 — 고르고 나면 알약 줄은 도로 접고, 고른 것은 갈래 단추에 적는다
판('알약을 고르면 그 줄이 도로 접힌다', 화이트.편줄.length===0, JSON.stringify(화이트.편줄));
판('고른 것이 갈래 단추에 적히고 켜진다',
   (화이트.갈래단추.find(x=>x.갈래==='색')||{}).글==='화이트' &&
   (화이트.갈래단추.find(x=>x.갈래==='색')||{}).켬===true,
   JSON.stringify(화이트.갈래단추.map(x=>x.글+(x.켬?'✓':''))));
판('머리에 무엇을 걸었는지와 몇 짝인지 뜬다', /화이트/.test(화이트.sub) && /짝/.test(화이트.sub), 화이트.sub);
판('걸어도 거르기가 먹는 세로 자리가 그대로다', 화이트.먹는자리===첫판.먹는자리,
   첫판.먹는자리+'px → '+화이트.먹는자리+'px');

// 그림 ② — 「화이트」 를 누른 화면. 갈래 단추 줄과 목록 첫 줄이 한 화면에 같이 보이게
await p.evaluate(()=>window.scrollTo(0,0));
await p.waitForTimeout(200);
await p.screenshot({path:그림칸+'/stock-375-알약.png'});

// ② 두께를 더 건다 — AND
const _두값 = (첫판.두께.find(x=>x.이름==='18T')||첫판.두께[0]).값;
await 칩톡('ams-두께', _두값);
const 둘 = await 읽기();
console.log('■ 「화이트」 + 「'+_두값+'T」: '+둘.목록줄+'줄 · sub 「'+둘.sub+'」 · 거르기 세로 '+둘.먹는자리+'px');
판('둘을 걸어도 갈래 단추 한 줄로 그대로다', 둘.먹는자리===첫판.먹는자리 && 둘.편줄.length===0,
   둘.먹는자리+'px · 펼친 줄 '+JSON.stringify(둘.편줄));
판('둘을 같이 걸면 둘 다 맞는 것만 남는다 (AND)',
   둘.목록줄<=화이트.목록줄 && 둘.목록줄===표에서(둘.두께,_두값) && 둘.목록줄===표에서(둘.색,'화이트'),
   '화이트만 '+화이트.목록줄+' → 둘 '+둘.목록줄+' (걸린 채 센 수: 두께 '+표에서(둘.두께,_두값)+' · 색 '+표에서(둘.색,'화이트')+')');
판('걸린 채로도 알약에 적힌 수가 남는 짝 수를 미리 알려 준다',
   둘.가공.reduce((a,c)=>a+c.짝,0)===둘.목록줄,
   '가공 줄 합 '+둘.가공.reduce((a,c)=>a+c.짝,0)+' / 목록 '+둘.목록줄);

// ③ 같은 알약을 다시 누르면 풀린다
await 칩톡('ams-두께', _두값);
const 푼하나 = await 읽기();
판('같은 알약을 다시 누르면 그것만 풀린다',
   푼하나.목록줄===화이트.목록줄 && 푼하나.색.find(x=>x.값==='화이트').켬===true,
   둘.목록줄+' → '+푼하나.목록줄+'줄');

// ④ 마지막 하나까지 끄면 목록이 도로 빈다
await 칩톡('ams-색','화이트');
const 다끔 = await 읽기();
판('마지막 알약까지 끄면 목록이 도로 빈다', 다끔.목록줄===0 && /고르시면/.test(다끔.빈말||''),
   다끔.목록줄+'줄 · 「'+다끔.빈말+'」');

// ⑤ 찾는 말만 쳐도 나온다 — 그것도 거르는 것이다
await p.evaluate(()=>{const i=document.getElementById('ams-find'); i.value='아이보리';
  i.dispatchEvent(new Event('input',{bubbles:true}));});
await p.waitForTimeout(300);
const 찾기 = await 읽기();
console.log('■ 「아이보리」 찾기: '+찾기.목록줄+'줄 · sub 「'+찾기.sub+'」');
판('알약을 안 눌러도 찾는 말만 치면 나온다', 찾기.목록줄>0 && 찾기.목록줄<35,
   찾기.목록줄+'줄');

// ⑥ 거르기 풀기 — 아무것도 안 고른 자리로, 곧 빈 목록으로 돌아간다
const h=await p.evaluateHandle(()=>document.getElementById('ams-푼다'));
await h.asElement().scrollIntoViewIfNeeded(); await h.asElement().tap(); await p.waitForTimeout(320);
const 끝 = await 읽기();
console.log('■ 거르기 푼 뒤: '+끝.목록줄+'줄 · sub 「'+끝.sub+'」');
판('풀면 펼친 줄도 없다', 끝.편줄.length===0, JSON.stringify(끝.편줄));
판('「거르기 풀기」 가 세 갈래와 찾는 말을 다 풀고 목록을 비운다',
   끝.목록줄===0 && /고르시면/.test(끝.빈말||'') &&
   [...끝.색,...끝.두께,...끝.가공].every(x=>!x.켬) && 끝.푼다켜짐===false,
   끝.목록줄+'줄 · 「'+끝.빈말+'」 · 푼다 '+끝.푼다켜짐);
판('풀고 나도 머리는 「35짝」 이다', /^35짝$/.test((끝.sub||'').trim()), 끝.sub);
판('375px 가로 스크롤 없다', 끝.문서가로<=375, 끝.문서가로+'px');
판('파이어베이스 쓰기 0', 끝.쓰기===0, 끝.쓰기+'번');
판('페이지오류 없음', errs.length===0, String(errs.length)+(errs[0]?' :: '+errs[0]:''));
console.log(실패===0?'boxes1   OK':'boxes1   FAIL ('+실패+')');
await b.close(); process.exit(실패===0?0:1);
