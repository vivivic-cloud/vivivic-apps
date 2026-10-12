import { 서버, 브라우저열기, devices, 주소, 테일윈드, 그림칸, 자판 } from './도구/터.mjs';
await 서버();

const TW = await 테일윈드();
const 그림 = 그림칸();
const b=await 브라우저열기({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
const { 못, 끝 } = 자판();
// 카메라모드: 'ok' | 'deny' | 'none' ,  읽기: 몇 프레임 뒤에 QR 를 내놓을지 (0 = 안 내놓음)
async function 판(카메라모드, 읽기, 너비=375){
  const ctx=await b.newContext({viewport:{width:너비,height:812}, hasTouch:true, isMobile:너비<500});
  const p=await ctx.newPage();
  const 오류=[]; p.on('pageerror',e=>오류.push(String(e.message)));
  await p.addInitScript(({카메라모드,읽기})=>{
    window.__오류=[];
    if (카메라모드!=='ok'){
      navigator.mediaDevices.getUserMedia = async ()=>{
        const e=new Error('x'); e.name = (카메라모드==='deny') ? 'NotAllowedError' : 'NotFoundError'; throw e; };
    }
    let n=0;
    window.BarcodeDetector = class { static async getSupportedFormats(){ return ['qr_code']; }
      constructor(){} async detect(){ n++;
        if (읽기 && n>=읽기) return [{rawValue:'VG-TEST-0001'}]; return []; } };
    window.addEventListener('DOMContentLoaded',()=>{
      const s=document.createElement('style'); s.textContent='#auth-login-overlay{display:none!important}';
      document.head.appendChild(s); });
  },{카메라모드,읽기});
  await p.route('**cdn.tailwindcss.com**', r=>r.abort());
  await p.goto(주소,{waitUntil:'load'});
  await p.addStyleTag({path:TW});
  await p.waitForTimeout(1800);
  // 박스판으로: 사장님 박스 두 개를 그대로 둔다
  await p.evaluate(()=>{ johonMyBoxes=[
      {id:'a',name:'입고확인',icon:'package-check',tone:'white',link:'https://example.com/in',at:1},
      {id:'b',name:'스캔',icon:'scan-text',tone:'white',link:'',at:2}];
    johonBoxSaveLS(); johonGoHome&&johonGoHome(); johonBoxRender(); });
  await p.waitForTimeout(500);
  return {p,ctx,오류};
}
function 자리들(p){ return p.evaluate(()=>{
  const sel='#johon-scan button, #johon-back button, #johon-scan a';
  const 밑=[]; document.querySelectorAll(sel).forEach(el=>{ const r=el.getBoundingClientRect();
    if (r.width===0&&r.height===0) return;
    if (r.height<44||r.width<44) 밑.push((el.textContent||el.id).trim().slice(0,12)+' '+Math.round(r.width)+'x'+Math.round(r.height)); });
  return {밑, 넘침:[document.documentElement.scrollWidth, document.documentElement.clientWidth]}; }); }

// ㉠ 정상 — 탭으로 열고, 읽고, 뒤로
{
  const {p,ctx,오류}=await 판('ok',0);
  못('㉠ 박스판에 박스 둘', await p.evaluate(()=>[...document.querySelectorAll('#jhh-mine [data-go]')].map(e=>e.childNodes[0].textContent.trim())), ['입고확인','스캔']);
  await p.screenshot({path:그림+'스캔-1박스판.png'});
  // 진짜 탭
  const 점=await p.evaluate(()=>{ const t=[...document.querySelectorAll('#jhh-mine [data-go]')]
      .find(el=>el.childNodes[0].textContent.trim()==='스캔');
    const r=t.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; });
  await p.touchscreen.tap(점.x,점.y);
  await p.waitForTimeout(1500);
  못('㉠ 「스캔」 을 누르면 스캔 화면이 뜬다', await p.evaluate(()=>document.documentElement.getAttribute('data-johonscan')), '1');
  못('㉠ 카메라 그림이 붙는다', await p.evaluate(()=>document.querySelectorAll('#jhs-view video').length), 1);
  못('㉠ 열자마자 카메라가 살아 있다', await p.evaluate(()=>{const v=document.querySelector('#jhs-view video');
    return v&&v.srcObject? v.srcObject.getTracks().filter(t=>t.readyState==='live').length : -1;}), 1);
  await p.screenshot({path:그림+'스캔-2화면.png'});
  const z=await 자리들(p); 못('㉠ 44px 밑 0개', z.밑, []); 못('㉠ 가로 넘침 0', z.넘침, [375,375]);
  // 뒤로가기 진짜 탭
  const 뒤=await p.evaluate(()=>{ const el=document.querySelector('#johon-back button');
    const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2,
      위에있는거:(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)||{}).tagName}; });
  못('㉠ 뒤로 단추가 안 깔린다', 뒤.위에있는거, 'BUTTON');
  await p.touchscreen.tap(뒤.x,뒤.y);
  await p.waitForTimeout(900);
  못('㉠ 뒤로 가면 스캔 화면이 닫힌다', await p.evaluate(()=>document.documentElement.getAttribute('data-johonscan')), null);
  못('㉠ 뒤로 가면 박스판으로', await p.evaluate(()=>document.documentElement.getAttribute('data-johonhome')), '1');
  못('⚠ ㉠ 뒤로 가면 카메라가 꺼진다(트랙 0)', await p.evaluate(()=>{ let n=0;
    document.querySelectorAll('video').forEach(v=>{ if(v.srcObject) n+=v.srcObject.getTracks().filter(t=>t.readyState==='live').length; });
    return n; }), 0);
  못('㉠ 페이지 오류 0', 오류.length, 0);
  await ctx.close();
}
// ㉡ 읽힘 — 40 프레임 뒤 QR
{
  const {p,ctx,오류}=await 판('ok',40);
  await p.evaluate(()=>johonScanOpen());
  await p.waitForTimeout(2200);
  못('㉡ 읽은 글이 그대로 선다', await p.evaluate(()=>(document.getElementById('jhs-read')||{}).textContent), 'VG-TEST-0001');
  못('⚠ ㉡ 읽으면 카메라가 꺼진다(트랙 0)', await p.evaluate(()=>{ let n=0;
    document.querySelectorAll('video').forEach(v=>{ if(v.srcObject) n+=v.srcObject.getTracks().filter(t=>t.readyState==='live').length; }); return n; }), 0);
  await p.screenshot({path:그림+'스캔-3읽음.png'});
  못('㉡ 44px 밑 0개', (await 자리들(p)).밑, []);
  못('㉡ 페이지 오류 0', 오류.length, 0);
  await ctx.close();
}
// ㉢ 카메라 막힘 / ㉣ 카메라 없음 — 빈 화면이 아닌지
for (const [표,모드] of [['㉢ 막힘','deny'],['㉣ 없음','none']]) {
  const {p,ctx,오류}=await 판(모드,0);
  await p.evaluate(()=>johonScanOpen());
  await p.waitForTimeout(1500);
  못(표+' 딱지', await p.evaluate(()=>(document.getElementById('jhs-tag')||{}).textContent.trim()), 모드==='deny'?'카메라 막힘':'카메라 없음');
  못(표+' 빈 화면이 아니다(글자 있음)', (await p.evaluate(()=>(document.getElementById('johon-scan').innerText||'').replace(/\s+/g,'').length))>0, true);
  못(표+' 화면은 그대로 떠 있다', await p.evaluate(()=>document.documentElement.getAttribute('data-johonscan')), '1');
  못(표+' 페이지 오류 0', 오류.length, 0);
  await ctx.close();
}
// ㉤ 입고확인은 안 건드렸나
{
  const {p,ctx,오류}=await 판('ok',0);
  await p.evaluate(()=>{ window.open=()=>null; });
  const 점=await p.evaluate(()=>{ const t=[...document.querySelectorAll('#jhh-mine [data-go]')]
      .find(el=>el.childNodes[0].textContent.trim()==='입고확인');
    const r=t.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; });
  await p.touchscreen.tap(점.x,점.y);
  await p.waitForTimeout(900);
  못('⚠ ㉤ 「입고확인」 박스는 안 건드린다', await p.evaluate(()=>document.documentElement.getAttribute('data-johonscan')), null);
  못('㉤ 페이지 오류 0', 오류.length, 0);
  await ctx.close();
}
// ㉥ 1280 넓은 판
{
  const {p,ctx,오류}=await 판('ok',0,1280);
  await p.evaluate(()=>johonScanOpen());
  await p.waitForTimeout(1200);
  const z=await 자리들(p); 못('㉥ 1280 44px 밑 0개', z.밑, []); 못('㉥ 1280 가로 넘침 0', z.넘침, [1280,1280]);
  못('㉥ 페이지 오류 0', 오류.length, 0);
  await ctx.close();
}
await b.close();
끝();
