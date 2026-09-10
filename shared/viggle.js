/* 바이글 손잡이 — 주소에 ?viggle=1 이 있을 때만 켜진다.
   없으면 이 파일은 아무 일도 하지 않는다. 직원들이 보는 화면은 그대로다.

   지시는 이 자리에서 바로 파이어베이스로 보낸다. 화면을 떠나지 않는다.
   (예전에는 바이글이 맥 안의 http 라 브라우저가 직접 통신을 막았고, 그래서
    창을 옮겨 '보냈습니다' 쪽지를 띄웠다. 돌아올 길이 없어 앱을 껐다 켜야 했다.
    지시함이 파이어베이스로 옮겨져 그럴 이유가 없어졌다.) */
(() => {
  const 표 = new URLSearchParams(location.search);
  if (표.get('viggle') !== '1') return;

  // 지시를 받는 자리. 예전에는 맥의 /take 였고 지금은 클라우드 작업대다.
  // 주소를 통째로 받으므로 뒤에 /take 를 붙이지 않는다.
  const 받는곳 = 표.get('vg') || 'https://vivivic-cloud.github.io/viggle/?take=1';  // 마지막 수단

  /* ── 지시함 (파이어베이스) ──────────────────────────────────
     작업대가 쓰는 칸과 같은 곳이다. 짚은 자리를 앞에 붙여 그 박스의
     지시 대화에 그대로 쌓인다. */
  const KEY = 'AIzaSyB9X_hzd2D3goQ7oenK53Pz805P1c7oSqs';
  const PROJ = 'vivivic-4b7ef';
  const 창고 = `https://firestore.googleapis.com/v1/projects/${PROJ}/databases/(default)/documents/artifacts/${PROJ}/public/data`;

  async function 토큰() {
    // 이 화면이 이미 파이어베이스에 들어가 있으면 그 자격을 쓴다
    try {
      const u = window.fbAuth && window.fbAuth.auth && window.fbAuth.auth.currentUser;
      if (u) return await u.getIdToken();
    } catch (e) {}
    // 아니면 익명으로 들어간다. 한 시간은 다시 안 받아도 된다
    try {
      const 둔것 = JSON.parse(localStorage.getItem('vg.tok') || 'null');
      if (둔것 && 둔것.until > Date.now() + 60000) return 둔것.tok;
    } catch (e) {}
    const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnSecureToken: true }) });
    if (!r.ok) throw new Error('들어가지 못했습니다');
    const d = await r.json();
    try { localStorage.setItem('vg.tok', JSON.stringify({ tok: d.idToken, until: Date.now() + 3300000 })); } catch (e) {}
    return d.idToken;
  }

  const 값 = v =>
      v === null || v === undefined ? { nullValue: null }
    : typeof v === 'boolean' ? { booleanValue: v }
    : typeof v === 'number' ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v })
    : Array.isArray(v) ? { arrayValue: { values: v.map(값) } }
    : typeof v === 'object' ? { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, 값(x)])) } }
    : { stringValue: String(v) };

  const 풀기 = v => {
    const k = Object.keys(v)[0];
    if (k === 'arrayValue') return (v[k].values || []).map(풀기);
    if (k === 'mapValue') return Object.fromEntries(Object.entries(v[k].fields || {}).map(([a, b]) => [a, 풀기(b)]));
    if (k === 'integerValue') return parseInt(v[k]);
    if (k === 'nullValue') return null;
    return v[k];
  };

  async function 지시보내기(글) {
    const 자리 = 박스 ? 'box:' + 박스 : '모든박스';
    const 문서 = encodeURIComponent(자리).replace(/%/g, '~');
    const 길 = `${창고}/wt_dev/${문서}`;
    const tok = await 토큰();
    const 머리 = { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' };
    let 것 = { area: 자리, msgs: [] };
    const r = await fetch(길, { headers: 머리 });
    if (r.ok) {
      const d = await r.json();
      것 = Object.fromEntries(Object.entries(d.fields || {}).map(([k, v]) => [k, 풀기(v)]));
      것.area = 자리; 것.msgs = 것.msgs || [];
    }
    것.msgs.push({ who: '나', text: 글, at: Math.floor(Date.now() / 1000), sent: true });
    것['잰때'] = Date.now();
    const w = await fetch(길, { method: 'PATCH', headers: 머리,
      body: JSON.stringify({ fields: Object.fromEntries(Object.entries(것).map(([k, v]) => [k, 값(v)])) }) });
    if (!w.ok) throw new Error('보내지 못했습니다 (' + w.status + ')');
  }

  /* 화면 위에 잠깐 떴다 사라지는 알림 — 페이지를 떠나지 않는다 */
  function 알림(글, 나쁨) {
    const t = document.createElement('div');
    t.className = 'vg-toast' + (나쁨 ? ' bad' : '');
    t.textContent = 글;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('gone'), 2400);
    setTimeout(() => t.remove(), 2900);
  }
  const 박스 = 표.get('box') || '';
  const 이름 = 표.get('name') || (document.title || '프로그램');

  const css = `
  .vg-hint{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(16px + env(safe-area-inset-bottom));
    z-index:2147483000;background:#111110;color:#fff;border-radius:999px;padding:9px 16px;
    font:13px/1.4 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",system-ui,sans-serif;
    opacity:1;transition:opacity .4s;pointer-events:none}
  .vg-hint.gone{opacity:0}
  .vg-toast{position:fixed;left:50%;transform:translateX(-50%);
    bottom:calc(22px + env(safe-area-inset-bottom));z-index:2147483002;
    background:#111110;color:#fff;border-radius:999px;padding:11px 18px;
    font:14px/1.4 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",system-ui,sans-serif;
    font-weight:700;box-shadow:0 6px 24px rgba(0,0,0,.22);opacity:1;transition:opacity .4s;
    pointer-events:none;max-width:88vw;text-align:center}
  .vg-toast.bad{background:#D9342B}
  .vg-toast.gone{opacity:0}
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
    const 보냄 = s.querySelector('.vg-send');
    보냄.onclick = async () => {
      const 글 = ta.value.trim(); if (!글) return;
      보냄.disabled = true; 보냄.textContent = '보내는 중…';
      const 본문 = `[${어디()} · ${짚은것}] ${글}`;
      try {
        await 지시보내기(본문);
        닫기();
        알림('클로드에게 보냈습니다');
      } catch (e) {
        보냄.disabled = false; 보냄.textContent = '보내기';
        알림((e.message || '보내지 못했습니다') + ' — 새 창으로 보냅니다', true);
        // 마지막 수단: 예전처럼 창을 옮겨 보낸다. 쓴 글이 사라지지는 않는다
        const u = 받는곳 + (받는곳.includes('?') ? '&' : '?')
                + `box=${encodeURIComponent(박스)}`
                + `&where=${encodeURIComponent(어디() + ' · ' + 짚은것)}`
                + `&text=${encodeURIComponent(글)}`;
        setTimeout(() => window.open(u, '_blank'), 900);
      }
    };
  }
})();
