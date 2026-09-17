// 원장재고 — 박스가 아니라 알약 세 줄. 폰 375px, 진짜 손가락으로 누른다.
// 사장님 지시(09-17 00:37): 「필터링 별 박스 작게 만들어줘 해당 버튼 클릭시
// 아래로 해당 원장만 나오게해줘 스크롤밑으로 길게 노출시키지말라고」
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

const 읽기 = () => p.evaluate(()=>{
  const 줄=id=>[...(document.getElementById(id)||{children:[]}).children].map(b=>({
      이름:b.childNodes[0].textContent.trim(),
      짝:parseInt(((b.querySelector('.ams-수')||{}).textContent||'').replace(/[^\d]/g,''),10)||0,
      값:b.dataset['값'], 켬:b.classList.contains('on')}));
  const 재=id=>{const e=document.getElementById(id), b=e&&e.children[0];
    if(!b) return null; const r=b.getBoundingClientRect(); return {가로:Math.round(r.width), 세로:Math.round(r.height)};};
  const 칸=id=>{const e=document.getElementById(id); if(!e) return null; const r=e.getBoundingClientRect();
    return {세로:Math.round(r.height), 보이는폭:Math.round(e.clientWidth), 담긴폭:Math.round(e.scrollWidth),
            옆으로밈:e.scrollWidth>e.clientWidth+1, 아래로깔림:e.scrollHeight>e.clientHeight+1};};
  // 거르기 세 줄이 세로로 먹는 자리 — 이름표 '색상' 꼭대기부터 가공 줄 바닥까지
  const 첫=document.getElementById('ams-이름-색'), 끝=document.getElementById('ams-가공');
  const 먹는자리 = (첫&&끝) ? Math.round(끝.getBoundingClientRect().bottom - 첫.getBoundingClientRect().top) : null;
  return {색:줄('ams-색'), 두께:줄('ams-두께'), 가공:줄('ams-가공'),
          크기:{색:재('ams-색'), 두께:재('ams-두께'), 가공:재('ams-가공')},
          줄칸:{색:칸('ams-색'), 두께:칸('ams-두께'), 가공:칸('ams-가공')},
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
console.log('알약 누르는 크기: '+JSON.stringify(첫판.크기));
console.log('거르기 세 줄이 먹는 세로 자리: '+첫판.먹는자리+'px · 목록 첫 줄 y '+첫판.목록첫줄y+'px');
console.log('줄칸: '+JSON.stringify(첫판.줄칸));

판('박스판과 돌아가기 단추가 없어졌다 (들어가는 칸이 없다)',
   첫판.박스판있나===false && 첫판.뒤단추있나===false,
   '박스판 '+첫판.박스판있나+' · 뒤단추 '+첫판.뒤단추있나);
판('색상 알약 10개', 첫판.색.length===10, 첫판.색.length+'개');
판('두께 알약 5개', 첫판.두께.length===5, 첫판.두께.length+'개');
판('가공 알약 9개', 첫판.가공.length===9, 첫판.가공.length+'개');
판('세 묶음 합이 다 35', 합(첫판.색)===35 && 합(첫판.두께)===35 && 합(첫판.가공)===35,
   합(첫판.색)+' / '+합(첫판.두께)+' / '+합(첫판.가공));
판('알약 누르는 높이 44px 이상', Object.values(첫판.크기).every(x=>x && x.세로>=44),
   JSON.stringify(첫판.크기));
판('갈래마다 딱 한 줄 — 아래로 안 깔린다 (넘치면 옆으로 민다)',
   Object.values(첫판.줄칸).every(x=>x && !x.아래로깔림),
   Object.entries(첫판.줄칸).map(([k,v])=>k+' '+v.세로+'px(담긴폭 '+v.담긴폭+')').join(' · '));
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
await p.screenshot({path:그림칸+'/stock-375-안고름.png'});

// ── 진짜 손가락으로 알약을 누른다
const 칩톡 = async (칸, 값) => {
  const h=await p.evaluateHandle(({s,g})=>[...(document.getElementById(s)||{children:[]}).children]
      .find(e=>e.dataset['값']===g)||null, {s:칸,g:값});
  const el=h.asElement(); if(!el){ console.log('   !! 못 집음: '+칸+' / '+값); return false; }
  await el.scrollIntoViewIfNeeded(); await el.tap(); await p.waitForTimeout(320); return true;
};
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
판('머리에 무엇을 걸었는지와 몇 짝인지 뜬다', /화이트/.test(화이트.sub) && /짝/.test(화이트.sub), 화이트.sub);
판('걸어도 세 줄이 먹는 세로 자리가 그대로다', 화이트.먹는자리===첫판.먹는자리,
   첫판.먹는자리+'px → '+화이트.먹는자리+'px');

// 그림 ② — 「화이트」 를 누른 화면. 세 줄과 목록 첫 줄이 한 화면에 같이 보이게
await p.evaluate(()=>window.scrollTo(0,0));
await p.waitForTimeout(200);
await p.screenshot({path:그림칸+'/stock-375-알약.png'});

// ② 두께를 더 건다 — AND
const _두값 = (첫판.두께.find(x=>x.이름==='18T')||첫판.두께[0]).값;
await 칩톡('ams-두께', _두값);
const 둘 = await 읽기();
console.log('■ 「화이트」 + 「'+_두값+'T」: '+둘.목록줄+'줄 · sub 「'+둘.sub+'」');
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
