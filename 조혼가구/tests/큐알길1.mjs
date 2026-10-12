import { 서버, 브라우저열기, devices, 주소, 에이주소, 테일윈드, 그림칸, 자판 } from './도구/터.mjs';
await 서버();

const TW = await 테일윈드();
const 그림 = 그림칸();
// 화베의 규칙표 한 줄 — 바이글이 넣어 뒀다는 그 줄 그대로.
const 진짜줄 = [{ 이름:'납기 명세서', 꼴:'^[^\\s]+-\\d{8}-\\d+-[A-Z]$',
  갈곳:'https://vivivic-cloud.github.io/vivivic-apps/에이엠티/에이엠티.html?명세={전체}', 차례:10 }];
const b=await 브라우저열기({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
const { 못, 끝 } = 자판();

async function 판({규칙='진짜', 글='유한-20261009-01-A', 높이=812, 너비=375}={}){
  const ctx=await b.newContext({viewport:{width:너비,height:높이},hasTouch:true,isMobile:너비<500});
  const p=await ctx.newPage(); const 오류=[]; p.on('pageerror',e=>오류.push(String(e.message)));
  await p.addInitScript(({규칙,진짜줄})=>{
    // 화베 SDK 는 이 상자에서 못 받아 온다(gstatic 막힘). 규칙표 읽는 자리만 허수아비로 꽂는다.
    window.__길열림=[];
    window.db = {};
    window.fbFirestore = {
      collection: (...a)=>({길:a.slice(1)}),
      getDocs: async (c)=>{
        if (규칙==='못읽음') throw new Error('읽기 막힘');
        const 줄 = 규칙==='빔' ? [] : 진짜줄;
        return { forEach:(f)=>줄.forEach(d=>f({data:()=>d})) };
      }
    };
    let n=0;
    window.BarcodeDetector = class { static async getSupportedFormats(){ return ['qr_code']; }
      constructor(){} async detect(){ n++; return n>=25?[{rawValue:window.__찍을글}]:[]; } };
    window.addEventListener('DOMContentLoaded',()=>{
      const s=document.createElement('style'); s.textContent='#auth-login-overlay{display:none!important}';
      document.head.appendChild(s); });
  },{규칙,진짜줄});
  await p.route('**cdn.tailwindcss.com**', r=>r.abort());
  await p.goto(주소,{waitUntil:'load'});
  await p.addStyleTag({path:TW});
  await p.waitForTimeout(1800);
  await p.evaluate(g=>{ window.__찍을글=g;
    window.open = (u)=>{ window.__길열림.push(u); return null; };
    johonMyBoxes=[{id:'b',name:'스캔',icon:'scan-text',tone:'white',link:'',at:2}];
    johonBoxSaveLS(); johonGoHome(); johonBoxRender(); johonScanOpen(); }, 글);
  await p.waitForTimeout(2400);
  return {p,ctx,오류};
}
const 본다=(p)=>p.evaluate(()=>({
  읽은글:(document.getElementById('jhs-read')||{}).textContent,
  길깃발:document.documentElement.getAttribute('data-johonscanway'),
  길이름:[...document.querySelectorAll('#jhs-ways .jhs-way')].map(e=>e.textContent.trim()),
  모르겠다보이나:(()=>{const e=document.getElementById('jhs-none');
    return e?getComputedStyle(e).display!=='none':false;})(),
  스캔화면:document.documentElement.getAttribute('data-johonscan'),
  넘침:[document.documentElement.scrollWidth, document.documentElement.clientWidth],
  살아있는트랙:(()=>{let n=0;document.querySelectorAll('video').forEach(v=>{
    if(v.srcObject)n+=v.srcObject.getTracks().filter(t=>t.readyState==='live').length;});return n;})(),
  작은자리:(()=>{const 밑=[];
    document.querySelectorAll('#johon-scan button, #johon-back button').forEach(el=>{
      const r=el.getBoundingClientRect(); if(r.width===0&&r.height===0) return;
      if(r.height<44||r.width<44) 밑.push(el.textContent.trim()); }); return 밑;})() }));

// ㉠ 아는 글 — 길 하나, 누르면 그 주소로
{ const {p,ctx,오류}=await 판({});
  const r=await 본다(p);
  못('아는 글 — 읽은 글', r.읽은글, '유한-20261009-01-A');
  못('아는 글 — 길 단추 이름', r.길이름, ['납기 명세서']);
  못('아는 글 — 단추 개수', r.길이름.length, 1);
  못('아는 글 — 「모르겠습니다」 안 보임', r.모르겠다보이나, false);
  못('아는 글 — 가로 넘침 0', r.넘침, [375,375]);
  못('아는 글 — 44px 밑 0개', r.작은자리, []);
  못('아는 글 — 읽은 뒤 살아있는 트랙 0', r.살아있는트랙, 0);
  await p.screenshot({path:그림+'길-1있음.png'});
  // 진짜 탭으로 누른다
  const 점=await p.evaluate(()=>{const el=document.querySelector('#jhs-ways .jhs-way');
    const q=el.getBoundingClientRect();
    return {x:q.x+q.width/2,y:q.y+q.height/2,
      위에있는거:(document.elementFromPoint(q.x+q.width/2,q.y+q.height/2)||{}).className};});
  못('아는 글 — 단추 위에 가린 것 없음', 점.위에있는거, 'jhs-way');
  await p.touchscreen.tap(점.x,점.y); await p.waitForTimeout(600);
  // 10-12 사장님: 「에이엠티 프로그램으로 연결되어 … 로그인 문제로 혼란을 줄 수 있다」 —
  // 그래서 **주소로 나가지 않는다.** 가리는 것은 규칙표 그대로, 펴는 것은 제 집이다.
  못('아는 글 — 에이엠티로 안 나간다', await p.evaluate(()=>window.__길열림), []);
  못('아는 글 — 제 집 명세표 화면이 뜬다',
     await p.evaluate(()=>document.documentElement.getAttribute('data-johonbill')), '1');
  못('아는 글 — 누른 뒤 살아있는 트랙 0', await p.evaluate(()=>{let n=0;
    document.querySelectorAll('video').forEach(v=>{if(v.srcObject)
      n+=v.srcObject.getTracks().filter(t=>t.readyState==='live').length;});return n;}), 0);
  못('아는 글 — 페이지 오류 0', 오류.length, 0);
  await ctx.close(); }

// ㉡ 모르는 글
{ const {p,ctx,오류}=await 판({글:'뭔지모를글'});
  const r=await 본다(p);
  못('모르는 글 — 글이 그대로 보임', r.읽은글, '뭔지모를글');
  못('모르는 글 — 길 단추 0개', r.길이름, []);
  못('모르는 글 — 「모르겠습니다」 한 줄 뜸', r.모르겠다보이나, true);
  못('모르는 글 — 가로 넘침 0', r.넘침, [375,375]);
  못('모르는 글 — 페이지 오류 0', 오류.length, 0);
  await p.screenshot({path:그림+'길-2모름.png'});
  await ctx.close(); }

// ㉢ 규칙표가 빔
{ const {p,ctx,오류}=await 판({규칙:'빔'});
  const r=await 본다(p);
  못('규칙표 빔 — 안 터짐(스캔 화면 그대로)', r.스캔화면, '1');
  못('규칙표 빔 — 글은 보임', r.읽은글, '유한-20261009-01-A');
  못('규칙표 빔 — 「모르겠습니다」 뜸', r.모르겠다보이나, true);
  못('규칙표 빔 — 페이지 오류 0', 오류.length, 0);
  await ctx.close(); }

// ㉣ 규칙표를 못 읽음
{ const {p,ctx,오류}=await 판({규칙:'못읽음'});
  const r=await 본다(p);
  못('못 읽음 — 안 터짐(스캔 화면 그대로)', r.스캔화면, '1');
  못('못 읽음 — 글은 보임', r.읽은글, '유한-20261009-01-A');
  못('못 읽음 — 「모르겠습니다」 뜸', r.모르겠다보이나, true);
  못('못 읽음 — 페이지 오류 0', 오류.length, 0);
  await ctx.close(); }

// ㉤ 좁은 폰 / 넓은 판
for (const [표,높이,너비] of [['좁은 폰 667',667,375],['넓은 판 1280',900,1280]]) {
  const {p,ctx,오류}=await 판({높이,너비});
  const r=await 본다(p);
  못(표+' — 길 단추 1개', r.길이름.length, 1);
  못(표+' — 가로 넘침 0', r.넘침, [너비,너비]);
  못(표+' — 44px 밑 0개', r.작은자리, []);
  못(표+' — 페이지 오류 0', 오류.length, 0);
  await ctx.close(); }

await b.close();
끝();
