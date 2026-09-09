/* 바이글 손잡이 — 주소에 ?viggle=1 이 있을 때만 켜진다.
   없으면 이 파일은 아무 일도 하지 않는다. 직원들이 보는 화면은 그대로다.

   왜 창을 옮겨 보내는가: 이 프로그램은 https 로 열리고 바이글은 맥 안의 http 라,
   브라우저가 둘 사이의 직접 통신을 막는다. 창을 옮기는 것은 막지 않는다. */
(() => {
  const 표 = new URLSearchParams(location.search);
  if (표.get('viggle') !== '1') return;

  const 바이글 = 표.get('vg') || 'http://macbookpro:5177';
  const 박스 = 표.get('box') || '';
  const 이름 = 표.get('name') || (document.title || '프로그램');

  const css = `
  .vg-bar{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;display:flex;gap:8px;
    padding:10px 12px calc(10px + env(safe-area-inset-bottom));background:#111110;color:#fff;
    font:14px/1.4 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",system-ui,sans-serif}
  .vg-bar button,.vg-bar a{flex:1;min-height:44px;border:0;border-radius:10px;background:#2b2a27;
    color:#fff;font:inherit;font-weight:700;text-decoration:none;display:flex;align-items:center;
    justify-content:center;gap:6px;cursor:pointer}
  .vg-bar button.on{background:#fff;color:#111110}
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


  const bar = document.createElement('div');
  bar.className = 'vg-bar';
  bar.innerHTML = `<button id="vg-pick">✋ 짚어서 지시</button>`;
  document.body.appendChild(bar);
  document.body.style.paddingBottom = '76px';

  let 켬 = false, 겨냥 = null;
  const 단추 = bar.querySelector('#vg-pick');
  단추.onclick = () => { 켬 = !켬; 단추.classList.toggle('on', 켬);
                        단추.textContent = 켬 ? '✋ 짚는 중 — 화면을 누르세요' : '✋ 짚어서 지시'; };

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
    if (!켬 || e.target.closest('.vg-bar, .vg-sheet')) return;
    e.preventDefault(); e.stopPropagation();
    겨냥 = e.target;
    겨냥.classList.add('vg-mark');
    시트(무엇(겨냥));
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
    const 닫기 = () => { s.remove(); 겨냥 && 겨냥.classList.remove('vg-mark'); };
    s.querySelector('.vg-cancel').onclick = 닫기;
    s.onclick = (e) => { if (e.target === s) 닫기(); };
    s.querySelector('.vg-send').onclick = () => {
      const 글 = ta.value.trim(); if (!글) return;
      const u = `${바이글}/take?box=${encodeURIComponent(박스)}`
              + `&where=${encodeURIComponent(어디() + ' · ' + 짚은것)}`
              + `&text=${encodeURIComponent(글)}`;
      닫기();
      window.open(u, '_blank');      // https → http 는 창을 옮기는 것만 허용된다
    };
  }
})();
