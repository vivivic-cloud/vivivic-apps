/* 바이글 손잡이 — 주소에 ?viggle=1 이 있을 때만 켜진다.
   없으면 이 파일은 아무 일도 하지 않는다. 직원들이 보는 화면은 그대로다.

   왜 창을 옮겨 보내는가: 이 프로그램은 https 로 열리고 바이글은 맥 안의 http 라,
   브라우저가 둘 사이의 직접 통신을 막는다. 창을 옮기는 것은 막지 않는다. */
(() => {
  const 표 = new URLSearchParams(location.search);
  if (표.get('viggle') !== '1') return;

  // 지시를 받는 자리. 예전에는 맥의 /take 였고 지금은 클라우드 작업대다.
  // 주소를 통째로 받으므로 뒤에 /take 를 붙이지 않는다.
  const 받는곳 = 표.get('vg') || 'https://vivivic-cloud.github.io/viggle/?take=1';
  const 박스 = 표.get('box') || '';
  const 이름 = 표.get('name') || (document.title || '프로그램');

  const css = `
  .vg-hint{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(16px + env(safe-area-inset-bottom));
    z-index:2147483000;background:#111110;color:#fff;border-radius:999px;padding:9px 16px;
    font:13px/1.4 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",system-ui,sans-serif;
    opacity:1;transition:opacity .4s;pointer-events:none}
  .vg-hint.gone{opacity:0}
  .vg-mark{outline:2px solid #FF3B30 !important;outline-offset:1px;
    background:rgba(255,59,48,.07) !important}
  .vg-sheet{position:fixed;inset:0;z-index:2147483001;background:rgba(17,17,16,.4);
    display:flex;align-items:flex-end}
  .vg-card{background:#fff;width:100%;border-radius:20px 20px 0 0;padding:16px 16px
    calc(16px + env(safe-area-inset-bottom));
    font:15px/1.5 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",system-ui,sans-serif;
    color:#1A1A19}
  .vg-card .vg-what{background:#F4F4F2;border-radius:10px;padding:10px 12px;font-size:13px;
    color:#6E6E6A;margin:0 0 10px;word-break:break-word;max-height:76px;overflow:hidden}
  .vg-card textarea{width:100%;box-sizing:border-box;min-height:88px;border:1px solid #E2E2DF;
    border-radius:12px;padding:12px;font:inherit;font-size:16px;resize:none;outline:none}
  .vg-card textarea:focus{border-color:#111110}
  .vg-row{display:flex;gap:8px;margin-top:10px}
  .vg-row button{flex:1;min-height:46px;border:0;border-radius:12px;font:inherit;font-weight:700;
    font-size:15px;cursor:pointer}
  .vg-send{background:#111110;color:#fff}
  .vg-cancel{background:#fff;color:#6E6E6A;border:1px solid #E2E2DF !important}`;
  document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);


  /* 켜고 끄는 단추는 없다. 바이글에서 열면 언제나 짚을 수 있고,
     0.5초 길게 누르는 손짓은 바이글 안과 같다. 짧게 누르면 프로그램이 그대로 돌아간다. */
  const 안내 = document.createElement('div');
  안내.className = 'vg-hint';
  안내.textContent = '길게 눌러 짚어서 지시';
  addEventListener('DOMContentLoaded', () => document.body.appendChild(안내), { once: true });
  if (document.readyState !== 'loading') document.body.appendChild(안내);
  setTimeout(() => 안내.classList.add('gone'), 3200);
  setTimeout(() => 안내.remove(), 3800);

  let 겨냥 = null, 시계 = null, 짚었다 = false, 시작 = null;

  const 그만 = () => { clearTimeout(시계); 시계 = null; };
  function 눌림(e){
    const p = e.touches ? e.touches[0] : e;
    if (e.target.closest('.vg-sheet')) return;
    시작 = { x: p.clientX, y: p.clientY };
    시계 = setTimeout(() => {
      시계 = null; 짚었다 = true;
      const sel = getSelection && getSelection(); sel && sel.removeAllRanges();
      겨냥 = e.target;
      겨냥.classList.add('vg-mark');
      시트(무엇(겨냥));
    }, 500);
  }
  function 움직임(e){                       // 스크롤이면 짚는 것이 아니다
    if (!시계 || !시작) return;
    const p = e.touches ? e.touches[0] : e;
    if (Math.abs(p.clientX - 시작.x) > 10 || Math.abs(p.clientY - 시작.y) > 10) 그만();
  }
  addEventListener('touchstart', 눌림, true);
  addEventListener('mousedown', 눌림, true);
  addEventListener('touchmove', 움직임, true);
  addEventListener('mousemove', 움직임, true);
  addEventListener('touchend', 그만, true);
  addEventListener('mouseup', 그만, true);
  addEventListener('touchcancel', 그만, true);
  addEventListener('scroll', 그만, true);

  /* 짚은 것이 무엇인지 사람이 알아볼 말로 적는다 */
  function 무엇(el) {
    const 글 = (el.innerText || el.value || el.placeholder || '').trim().replace(/\s+/g, ' ');
    if (글) return 글.slice(0, 60);
    const t = el.tagName.toLowerCase();
    return ({ button: '단추', input: '입력칸', select: '고르는 칸', img: '그림', svg: '그림' })[t] || t;
  }
  function 어디() {
    const 켜진 = document.querySelector('.nav-link.active, .page-tab-link.active, .bnav.on');
    return [이름, 켜진 && 켜진.textContent.trim()].filter(Boolean).join(' / ');
  }

  document.addEventListener('click', (e) => {
    if (!짚었다 || e.target.closest('.vg-sheet')) return;
    짚었다 = false;                        // 짚느라 누른 것이 눌림으로 새지 않게 한 번만 삼킨다
    e.preventDefault(); e.stopPropagation();
  }, true);

  function 시트(짚은것) {
    const s = document.createElement('div');
    s.className = 'vg-sheet';
    s.innerHTML = `<div class="vg-card">
        <div class="vg-what">짚은 것 · ${짚은것.replace(/</g,'&lt;')}</div>
        <textarea placeholder="여기를 어떻게 고칠까요?"></textarea>
        <div class="vg-row">
          <button class="vg-cancel">그만</button>
          <button class="vg-send">보내기</button>
        </div></div>`;
    document.body.appendChild(s);
    const ta = s.querySelector('textarea');
    setTimeout(() => ta.focus(), 60);
    const 닫기 = () => { s.remove(); 겨냥 && 겨냥.classList.remove('vg-mark'); 짚었다 = false; };
    s.querySelector('.vg-cancel').onclick = 닫기;
    s.onclick = (e) => { if (e.target === s) 닫기(); };
    s.querySelector('.vg-send').onclick = () => {
      const 글 = ta.value.trim(); if (!글) return;
      const u = 받는곳 + (받는곳.includes('?') ? '&' : '?')
              + `box=${encodeURIComponent(박스)}`
              + `&where=${encodeURIComponent(어디() + ' · ' + 짚은것)}`
              + `&text=${encodeURIComponent(글)}`;
      닫기();
      window.open(u, '_blank');      // https → http 는 창을 옮기는 것만 허용된다
    };
  }
})();
