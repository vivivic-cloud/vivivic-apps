import { 서버, 브라우저열기, devices, 주소, 테일윈드, 그림칸, 자판 } from './도구/터.mjs';
await 서버();
const TW = await 테일윈드();
const 그림 = 그림칸();
const { 못, 끝 } = 자판();
const b=await 브라우저열기({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
for (const h of [812,667,932]) {
const ctx=await b.newContext({viewport:{width:375,height:h},hasTouch:true,isMobile:true});
const p=await ctx.newPage(); const 오류=[]; p.on('pageerror',e=>오류.push(e.message));
await p.addInitScript(()=>{ let n=0; window.BarcodeDetector=class{static async getSupportedFormats(){return['qr_code'];}
  constructor(){} async detect(){ n++; return n>=30?[{rawValue:'VG-TEST-0001'}]:[]; }};
  window.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');
    s.textContent='#auth-login-overlay{display:none!important}';document.head.appendChild(s);});});
await p.route('**cdn.tailwindcss.com**',r=>r.abort());
await p.goto(주소,{waitUntil:'load'});
await p.addStyleTag({path:TW});
await p.waitForTimeout(1800);
await p.evaluate(()=>{ johonMyBoxes=[{id:'b',name:'스캔',icon:'scan-text',tone:'white',link:'',at:2}];
  johonBoxSaveLS(); johonGoHome(); johonBoxRender(); johonScanOpen(); });
await p.waitForTimeout(2200);
const r=await p.evaluate(()=>{
  const 뭐가위에=(el)=>{ const r=el.getBoundingClientRect();
    const t=document.elementFromPoint(r.x+r.width/2, r.y+r.height/2);
    return { 글:el.textContent.trim(), 크기:Math.round(r.width)+'x'+Math.round(r.height),
             위치:Math.round(r.top)+'~'+Math.round(r.bottom),
             내가맞나: t===el || el.contains(t), 위에있는거:(t&&(t.textContent||'').trim().slice(0,8)) }; };
  const 줄=[...document.querySelectorAll('#johon-scan .jhs-btn')].map(뭐가위에);
  const 뒤=뭐가위에(document.querySelector('#johon-back button'));
  const 밑=[]; document.querySelectorAll('#johon-scan .jhs-btn, #johon-back button').forEach(el=>{
    const q=el.getBoundingClientRect(); if(q.height<44||q.width<44) 밑.push(el.textContent.trim()); });
  return {읽은글:(document.getElementById('jhs-read')||{}).textContent, 줄, 뒤, 밑,
          넘침:[document.documentElement.scrollWidth,document.documentElement.clientWidth],
          패널세로넘침:(()=>{const e=document.getElementById('johon-scan');
            return [e.scrollHeight, e.clientHeight];})()}; });
/* ⚠ 읽은 뒤 「다시」 가 바닥의 ← 박스판 단추에 **깔려 못 눌렸던** 자리다(v1.5.0).
   크기만 보면 안 걸린다 — **가운데를 짚어 올라오는 것이 저 자신인지**를 본다. */
못('세로 '+h+' — 읽은 글', r.읽은글, 'VG-TEST-0001');
r.줄.forEach(x => 못('세로 '+h+' — 「'+x.글+'」 가 안 깔린다', x.내가맞나, true));
못('세로 '+h+' — 「'+r.뒤.글+'」 가 안 깔린다', r.뒤.내가맞나, true);
못('세로 '+h+' — 44px 밑 0개', r.밑, []);
못('세로 '+h+' — 가로 넘침 0', r.넘침, [375,375]);
못('세로 '+h+' — 세로로도 안 넘친다', r.패널세로넘침[0] <= r.패널세로넘침[1], true);
못('세로 '+h+' — 페이지 오류 0', 오류.length, 0);
if (h===812) await p.screenshot({path:그림+'스캔-3읽음.png'});
await ctx.close(); }
await b.close();
끝();
