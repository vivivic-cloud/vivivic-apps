import { 서버, 브라우저열기, devices, 주소, 테일윈드, 자판 } from './도구/터.mjs';
await 서버();
const TW = await 테일윈드();
const { 못, 끝 } = 자판();
const b=await 브라우저열기({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
for (const 길 of ['막힘','열림']) {
const ctx=await b.newContext({viewport:{width:375,height:812},hasTouch:true,isMobile:true});
const p=await ctx.newPage(); const 오류=[]; p.on('pageerror',e=>오류.push(e.message));
await p.addInitScript(()=>{ delete window.BarcodeDetector;   // 아이폰 사파리 흉내
  window.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');
    s.textContent='#auth-login-overlay{display:none!important}';document.head.appendChild(s);});});
await p.route('**cdn.tailwindcss.com**',r=>r.abort());
if (길==='막힘') await p.route('**unpkg.com**', r=>r.abort());
else await p.route('**unpkg.com**', r=>r.fulfill({status:200,contentType:'application/javascript',
  body:`window.Html5Qrcode=class{ static async getCameras(){return [{id:'c1',label:'back camera'}];}
    constructor(id){this.id=id;} async start(cam,cfg,ok){ this._t=setTimeout(()=>ok('VG-TEST-0001'),600);
      const v=document.createElement('video'); document.getElementById(this.id).appendChild(v); }
    async stop(){ clearTimeout(this._t); } };`}));
await p.goto(주소,{waitUntil:'load'});
await p.addStyleTag({path:TW});
await p.waitForTimeout(1800);
const t0=Date.now();
await p.evaluate(()=>{ johonMyBoxes=[{id:'b',name:'스캔',icon:'scan-text',tone:'white',link:'',at:2}];
  johonBoxSaveLS(); johonGoHome(); johonBoxRender(); johonScanOpen(); });
await p.waitForTimeout(3000);
const r = await p.evaluate(()=>({
  스캔화면:document.documentElement.getAttribute('data-johonscan'),
  켜짐:document.documentElement.getAttribute('data-johonscanon'),
  딱지:(document.getElementById('jhs-tag')||{}).textContent.trim(),
  읽은글:(document.getElementById('jhs-read')||{}).textContent,
  글자수:(document.getElementById('johon-scan').innerText||'').replace(/\s+/g,'').length,
  Html5있나:!!window.Html5Qrcode }));
/* ⚠ 아이폰 사파리에는 BarcodeDetector 가 없다 — 사장님 폰에서 **실제로 도는 것은 이쪽**이다.
   꾸러미를 바깥에서 받아 오는데, 못 받았을 때 **카메라 탓으로 적으면 안 된다.** */
if (길==='막힘') {
  못('꾸러미 못 받음 — 딱지가 「못 불러옴」', r.딱지, '못 불러옴');
  못('꾸러미 못 받음 — 빈 화면이 아니다', r.글자수>0, true);
  못('꾸러미 못 받음 — 화면은 떠 있다', r.스캔화면, '1');
} else {
  못('꾸러미 받음 — B 쪽으로 읽힌다', r.읽은글, 'VG-TEST-0001');
  못('꾸러미 받음 — 읽고 나면 카메라를 끈다', r.켜짐, null);
}
못('unpkg '+길+' — 페이지 오류 0', 오류.length, 0);
// 뒤로 눌러 끄기
await p.evaluate(()=>johonGoHome());
await p.waitForTimeout(600);
못('unpkg '+길+' — 뒤로 가면 카메라가 꺼진다',
   [await p.evaluate(()=>document.documentElement.getAttribute('data-johonscanon')),
    await p.evaluate(()=>document.querySelectorAll('#jhs-view video').length)], [null, 0]);
await ctx.close(); }
await b.close();
끝();
