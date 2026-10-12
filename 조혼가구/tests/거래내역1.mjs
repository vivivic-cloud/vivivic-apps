/* 「거래내역」 화면을 잰다. 화베는 이 상자에서 못 닿으니 읽는 자리만 허수아비로 꽂고,
   **진짜 기록에서 읽어 온 그 줄 그대로**(유한-20261009-01-A) 넣는다. */
import { 서버, 브라우저열기, devices, 주소, 에이주소, 테일윈드, 그림칸, 자판 } from './도구/터.mjs';
await 서버();

const TW = await 테일윈드();
const 그림 = 그림칸();
// 화베에서 실제로 읽어 온 줄 (2026-10-12)
const 진짜 = { 큐알:'유한-20261009-01-A', 업체:'유한가구', 발주번호:'유한-20261009-01', 파레트:'A',
  줄수:1, 총수량:100, 납기일:'2026-10-22', 확인시각:'2026-10-12T06:40:35.098Z',
  확인시각글:'2026-10-12 15:40' };
// 차례가 맞는지 보려고 **더 오래된 한 줄**을 보탠다 (최근 것이 위여야 한다)
const 예전 = { 큐알:'유한-20261001-02-B', 업체:'유한가구', 발주번호:'유한-20261001-02', 파레트:'B',
  줄수:3, 총수량:40, 납기일:'2026-10-15', 확인시각:'2026-10-05T01:00:00.000Z',
  확인시각글:'2026-10-05 10:00' };
const 남 = { 큐알:'아인-20261003-01-A', 업체:'아인가구', 발주번호:'아인-20261003-01', 파레트:'A',
  줄수:2, 총수량:20, 납기일:'2026-10-14', 확인시각:'2026-10-06T01:00:00.000Z',
  확인시각글:'2026-10-06 10:00' };
const 규칙 = [{ 이름:'납기 명세서', 꼴:'^[^\\s]+-\\d{8}-\\d+-[A-Z]$', 끔:false, 차례:'10',
  갈곳:'https://vivivic-cloud.github.io/vivivic-apps/에이엠티/에이엠티.html?명세={전체}' }];

const b=await 브라우저열기();
const { 못, 끝 } = 자판();

async function 판({기록='있음', 너비=375, 높이=812}={}){
  const ctx=await b.newContext({viewport:{width:너비,height:높이},hasTouch:true,isMobile:너비<500});
  const p=await ctx.newPage(); const 오류=[]; p.on('pageerror',e=>오류.push(String(e.message)));
  await p.addInitScript(({기록,진짜,예전,남,규칙})=>{
    window.__열림=[];
    window.db = {};
    window.fbFirestore = {
      collection:(...a)=>({칸:a[a.length-1]}),
      getDocs: async (c)=>{
        if (c.칸 === '입고확인') {
          if (기록==='못읽음') throw new Error('읽기 막힘');
          // ⚠ 진짜 기록에서 `확인시각` 은 **글자가 아니라 timestamp** 다.
          //   화베 SDK 는 Timestamp 덩어리를 돌려준다 — String() 을 씌우면 전부
          //   "[object Object]" 가 되어 차례가 한 번도 안 선다. 본보기도 그 꼴로 둔다.
          const 때 = (iso)=>({ toMillis(){ return Date.parse(iso); },
                               toDate(){ return new Date(iso); },
                               seconds: Math.floor(Date.parse(iso)/1000) });
          // ⚠ **오래된 것을 먼저** 넣는다. 안 그러면 차례가 안 서도 초록으로 보인다 —
          //   v1.7.0 때 이 탈을 못 잡은 까닭이 그것이다.
          const 줄 = 기록==='빔' ? [] : [예전, 진짜, 남]
            .map(r => Object.assign({}, r, { 확인시각: 때(r.확인시각) }));
          return { forEach:(f)=>줄.forEach(d=>f({ id:d.큐알, data:()=>d })) };
        }
        const 줄 = 규칙;
        return { forEach:(f)=>줄.forEach(d=>f({ id:'r1', data:()=>d })) };
      } };
    window.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');
      s.textContent='#auth-login-overlay{display:none!important}';document.head.appendChild(s);});
  },{기록,진짜,예전,남,규칙});
  await p.route('**cdn.tailwindcss.com**', r=>r.abort());
  await p.goto(주소,{waitUntil:'load'});
  await p.addStyleTag({path:TW});
  await p.waitForTimeout(1800);
  await p.evaluate(()=>{ window.open=(u)=>{ window.__열림.push(u); return null; };
    johonMyBoxes=[{id:'a',name:'입고확인',icon:'package-check',tone:'white',link:'https://example.com/in',at:1},
                  {id:'d',name:'거래내역',icon:'receipt',tone:'white',link:'',at:3}];
    johonBoxSaveLS(); johonGoHome(); johonBoxRender(); });
  await p.waitForTimeout(400);
  return {p,ctx,오류};
}
const 본다=(p)=>p.evaluate(()=>({
  화면:document.documentElement.getAttribute('data-johondeal'),
  딱지:(document.getElementById('jhd-tag')||{}).textContent.trim(),
  줄:[...document.querySelectorAll('#jhd-list .jhd-row')].map(e=>({
    큐알:e.querySelector('.jhd-q').textContent.trim(),
    밑:e.querySelector('.jhd-sub').textContent.trim() })),
  넘침:[document.documentElement.scrollWidth, document.documentElement.clientWidth],
  작은자리:(()=>{const 밑=[];
    document.querySelectorAll('#johon-deal button, #johon-back button').forEach(el=>{
      const r=el.getBoundingClientRect(); if(r.width===0&&r.height===0) return;
      if(r.height<44||r.width<44) 밑.push(el.textContent.trim().slice(0,14)); }); return 밑;})() }));
// ⚠ 좁은 폰에서는 그 박스 줄이 화면 밖에 있다(667 에서 y 726). 사장님은 내려서 누르신다 —
//   먼저 그 자리로 내리고, 그다음에 **진짜 손가락**으로 누른다.
const 박스탭=async(p,이름)=>{
  await p.evaluate(n=>{ const t=[...document.querySelectorAll('#jhh-mine [data-go]')]
      .find(e=>e.childNodes[0].textContent.trim()===n);
    t.scrollIntoView({block:'center'}); }, 이름);
  await p.waitForTimeout(350);
  const 점=await p.evaluate(n=>{
    const t=[...document.querySelectorAll('#jhh-mine [data-go]')]
      .find(e=>e.childNodes[0].textContent.trim()===n);
    const r=t.getBoundingClientRect();
    return {x:r.x+r.width/2, y:r.y+r.height/2,
      위에있는거:(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)||{}).tagName}; }, 이름);
  if (!점.위에있는거) throw new Error('박스 줄이 화면 밖이다: ' + 이름);
  await p.touchscreen.tap(점.x,점.y); await p.waitForTimeout(900); };

// ㉠ 박스를 진짜로 누른다 → 유한가구 2줄, 최근 것이 위
{ const {p,ctx,오류}=await 판({});
  await p.evaluate(()=>switchSupplier('유한가구')); await p.waitForTimeout(300);
  await p.screenshot({path:그림+'거래-1박스판.png'});
  await 박스탭(p,'거래내역');
  const r=await 본다(p);
  못('박스를 누르면 화면이 뜬다', r.화면, '1');
  못('유한가구 2줄', r.줄.length, 2);
  못('최근 것이 위', r.줄.map(x=>x.큐알), ['유한-20261009-01-A','유한-20261001-02-B']);
  못('한 줄에 시각·줄수·수량', r.줄[0].밑, '2026-10-12 15:40 · 1줄 · 100개');
  못('딱지에 거래처와 건수', r.딱지, '유한가구 · 2건');
  못('가로 넘침 0', r.넘침, [375,375]);
  못('44px 밑 0개', r.작은자리, []);
  await p.screenshot({path:그림+'거래-2목록.png'});
  // 줄을 진짜 손가락으로
  const 점=await p.evaluate(()=>{const el=document.querySelector('#jhd-list .jhd-row');
    const q=el.getBoundingClientRect();
    return {x:q.x+q.width/2,y:q.y+q.height/2,
      위에있는거:(document.elementFromPoint(q.x+q.width/2,q.y+q.height/2)||{}).className};});
  못('줄 위에 가린 것 없음', /jhd-/.test(점.위에있는거), true);
  await p.touchscreen.tap(점.x,점.y); await p.waitForTimeout(700);
  // 10-12 지시 — 줄을 눌러도 에이엠티로 안 간다. 제 집 명세표 화면으로 간다.
  못('누르면 에이엠티로 안 나간다', await p.evaluate(()=>window.__열림), []);
  못('누르면 제 집 명세표 화면이 뜬다',
     await p.evaluate(()=>document.documentElement.getAttribute('data-johonbill')), '1');
  // 거래처를 바꾸면 목록이 바뀐다 — 다시 읽지 않는다
  await p.evaluate(()=>switchSupplier('아인가구')); await p.waitForTimeout(500);
  const r2=await 본다(p);
  못('거래처를 바꾸면 목록이 바뀐다', r2.줄.map(x=>x.큐알), ['아인-20261003-01-A']);
  await p.evaluate(()=>switchSupplier('럭스디자인')); await p.waitForTimeout(500);
  const r3=await 본다(p);
  못('없는 거래처는 0줄', r3.줄.length, 0);
  못('없으면 빈 표가 아니라 한 줄', r3.딱지, '아직 온 명세서가 없습니다');
  // 뒤로
  const 뒤=await p.evaluate(()=>{const el=document.querySelector('#johon-back button');
    const q=el.getBoundingClientRect();
    return {x:q.x+q.width/2,y:q.y+q.height/2,
      위에있는거:(document.elementFromPoint(q.x+q.width/2,q.y+q.height/2)||{}).tagName};});
  못('뒤로 단추 위에 가린 것 없음', 뒤.위에있는거, 'BUTTON');
  await p.touchscreen.tap(뒤.x,뒤.y); await p.waitForTimeout(700);
  못('뒤로 가면 닫히고 박스판으로', await p.evaluate(()=>[
     document.documentElement.getAttribute('data-johondeal'),
     document.documentElement.getAttribute('data-johonhome')]), [null,'1']);
  못('페이지 오류 0', 오류.length, 0);
  await ctx.close(); }

// ㉡ 기록이 빔
{ const {p,ctx,오류}=await 판({기록:'빔'});
  await 박스탭(p,'거래내역'); await p.waitForTimeout(600);
  const r=await 본다(p);
  못('빔 — 안 터지고 화면은 뜬다', r.화면, '1');
  못('빔 — 한 줄로 알린다', r.딱지, '아직 온 명세서가 없습니다');
  못('빔 — 페이지 오류 0', 오류.length, 0);
  await ctx.close(); }

// ㉢ 못 읽음
{ const {p,ctx,오류}=await 판({기록:'못읽음'});
  await 박스탭(p,'거래내역'); await p.waitForTimeout(800);
  const r=await 본다(p);
  못('못 읽음 — 안 터지고 화면은 뜬다', r.화면, '1');
  못('못 읽음 — 한 줄로 알린다', r.딱지, '기록을 못 읽었습니다');
  못('못 읽음 — 빈 표를 내지 않는다', r.줄.length, 0);
  못('못 읽음 — 페이지 오류 0', 오류.length, 0);
  await ctx.close(); }

// ㉣ 「입고확인」 박스는 안 건드린다
{ const {p,ctx,오류}=await 판({});
  await 박스탭(p,'입고확인');
  못('「입고확인」 을 눌러도 거래내역이 안 뜬다',
     await p.evaluate(()=>document.documentElement.getAttribute('data-johondeal')), null);
  못('「입고확인」 은 제 link 로 간다', await p.evaluate(()=>window.__열림), ['https://example.com/in']);
  못('㉣ 페이지 오류 0', 오류.length, 0);
  await ctx.close(); }

// ㉤ 좁은 폰 / 넓은 판
for (const [표,높이,너비] of [['좁은 폰 667',667,375],['넓은 판 1280',900,1280]]) {
  const {p,ctx,오류}=await 판({높이,너비});
  await p.evaluate(()=>switchSupplier('유한가구')); await p.waitForTimeout(300);
  await 박스탭(p,'거래내역'); await p.waitForTimeout(600);
  const r=await 본다(p);
  못(표+' — 2줄', r.줄.length, 2);
  못(표+' — 가로 넘침 0', r.넘침, [너비,너비]);
  못(표+' — 44px 밑 0개', r.작은자리, []);
  못(표+' — 페이지 오류 0', 오류.length, 0);
  await ctx.close(); }

await b.close();
끝();
