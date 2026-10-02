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

  /* ── 「내가 시킨 것」 에 한 줄 남긴다 ──────────────────────────
     사장님 말씀(10-01): 「지시가 올라오면 내가 시킨것에 가장먼저 등록되어야 되는거
     아니니?」 그리고 「등록을 하는게 작업대 프로그램에 코드화 된게 아니라 혹시 니가
     직접 등록해주는 거니?」. 그때까지는 관리자가 손으로 적었고, 한 번 빠뜨렸다.
     **사람 기억에 맡기지 않는다 — 보내는 이 자리에서 적는다.**
     여기 한 곳만 고치면 모든 프로그램과 작업대가 같이 적힌다.

     ⚠ 이것이 실패해도 **지시 보내기는 성공으로 둔다.** 지시가 들어간 뒤의 덧일이다.
        여기서 터져서 지시가 안 가면 더 나쁘다. */
  async function 시킨것남기기(짚은것, 글, 때) {
    const 한줄 = (글 || '').replace(/\s+/g, ' ').trim().slice(0, 40)
               + ((글 || '').replace(/\s+/g, ' ').trim().length > 40 ? '…' : '');
    const 몸 = {
      자리: 박스 ? 'box:' + 박스 : '모든박스',
      짚은자리: [어디(), 짚은것].filter(Boolean).join(' · '),
      // 짚으셨을 때 켜져 있던 페이지. 작업대가 이것으로 그 페이지를 열어 준다
      페이지: 어느페이지(),
      말: 글 || '',
      한줄: 한줄 || '(빈 말)',
      상태: '받음',
      때: 때,
    };
    const 길 = `${창고}/wt_asked/a${때}`;
    const tok = await 토큰();
    const 머리 = { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' };
    // 이미 있으면 덮지 않는다 — 관리자가 적어 둔 상태·결과를 지우면 안 된다
    const 봄 = await fetch(길, { headers: { Authorization: 'Bearer ' + tok } });
    if (봄.ok) return;
    const w = await fetch(길, { method: 'PATCH', headers: 머리,
      body: JSON.stringify({ fields: Object.fromEntries(Object.entries(몸).map(([k, v]) => [k, 값(v)])) }) });
    if (!w.ok) throw new Error('내가 시킨 것에 못 적었습니다 (' + w.status + ')');
  }

  /* 지난 지시를 읽어 온다 — 읽기만 한다. 보내기와 같은 자리(wt_dev/<자리>)다 */
  async function 지난것읽기() {
    const 자리 = 박스 ? 'box:' + 박스 : '모든박스';
    const 문서 = encodeURIComponent(자리).replace(/%/g, '~');
    const tok = await 토큰();
    const r = await fetch(`${창고}/wt_dev/${문서}`, { headers: { Authorization: 'Bearer ' + tok } });
    if (r.status === 404) return [];                 // 아직 한 번도 지시가 없던 자리
    if (!r.ok) throw new Error('읽지 못했습니다 (' + r.status + ')');
    const d = await r.json();
    const 것 = Object.fromEntries(Object.entries(d.fields || {}).map(([k, v]) => [k, 풀기(v)]));
    return Array.isArray(것.msgs) ? 것.msgs : [];
  }
  const 때글 = sec => {
    const d = new Date((sec || 0) * 1000), z = n => String(n).padStart(2, '0');
    return `${z(d.getMonth() + 1)}.${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}`;
  };
  const 막기 = t => String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

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
  .vg-cancel{background:#fff;color:#6E6E6A;border:1px solid #E2E2DF !important}
  /* 지난 지시 — 작게 곁들인다. 적는 자리(textarea)는 그대로 둔다 */
  .vg-row .vg-log{flex:none;padding:0 12px;font-size:14px;background:#fff;color:#6E6E6A;
    border:1px solid #E2E2DF !important}
  .vg-head{display:flex;align-items:baseline;gap:8px;margin:0 0 10px}
  .vg-head b{font-size:15px}
  .vg-cnt{font-size:12px;color:#9B9B96}
  .vg-list{max-height:56vh;overflow-y:auto;-webkit-overflow-scrolling:touch}
  .vg-it{border-radius:12px;padding:10px 12px;margin:0 0 8px;font-size:14px;
    word-break:break-word;white-space:pre-wrap}
  .vg-it.me{background:#111110;color:#fff}
  .vg-it.cl{background:#F4F4F2;color:#1A1A19}
  .vg-it .vg-when{display:block;font-size:11px;opacity:.6;margin:0 0 4px}
  .vg-it .vg-where{display:block;font-size:11px;opacity:.75;margin:0 0 4px}
  /* 작업대에서 찾아온 그 말 — 어느 줄인지 한눈에 보이게 테를 두른다 (10-01 사장님 말씀) */
  .vg-it.vg-here{outline:2px solid #FF3B30;outline-offset:2px}
  .vg-empty{color:#9B9B96;font-size:14px;padding:20px 2px;text-align:center}
  .vg-back{background:#fff;color:#6E6E6A;border:1px solid #E2E2DF !important}`;
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
    // 손가락이 둘이면 짚는 것이 아니라 확대·축소다. 첫 손가락만 보던 때는
    // 그 손가락이 제자리에 있어 10px 자에 안 걸렸고, 0.5초 뒤 지시창이 튀어나왔다.
    // 확대는 대개 한 손가락이 먼저 닿고 둘째가 뒤따른다 — 그때도 touchstart 가
    // 다시 오므로 여기서 걸린다.
    if (e.touches && e.touches.length > 1) return 그만();
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
    if (e.touches && e.touches.length > 1) return 그만();
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
  /* 지금 켜져 있는 페이지(탭) 글자. 이것을 적어 두면 작업대가 **그 페이지로** 열어 준다. */
  function 어느페이지() {
    const 켜진 = document.querySelector('.nav-link.active, .page-tab-link.active, .bnav.on');
    return (켜진 && 켜진.textContent.trim()) || '';
  }
  function 어디() {
    return [이름, 어느페이지()].filter(Boolean).join(' / ');
  }

  document.addEventListener('click', (e) => {
    if (!짚었다 || e.target.closest('.vg-sheet')) return;
    짚었다 = false;                        // 짚느라 누른 것이 눌림으로 새지 않게 한 번만 삼킨다
    e.preventDefault(); e.stopPropagation();
  }, true);

  function 시트(짚은것, 지난부터, 찾을때) {
    const s = document.createElement('div');
    s.className = 'vg-sheet';
    s.innerHTML = `<div class="vg-card">
        <div class="vg-write">
          <div class="vg-what">짚은 것 · ${짚은것.replace(/</g,'&lt;')}</div>
          <textarea placeholder="여기를 어떻게 고칠까요?"></textarea>
          <div class="vg-row">
            <button class="vg-log" type="button">지난 지시</button>
            <button class="vg-cancel">그만</button>
            <button class="vg-send">보내기</button>
          </div>
        </div>
        <div class="vg-past" hidden>
          <div class="vg-head"><b>지난 지시</b><span class="vg-cnt"></span></div>
          <div class="vg-list"></div>
          <div class="vg-row"><button class="vg-back" type="button">← 돌아가기</button></div>
        </div>
      </div>`;
    document.body.appendChild(s);
    const ta = s.querySelector('textarea');
    if (!지난부터) setTimeout(() => ta.focus(), 60);   // 지난 지시만 보러 왔으면 자판을 올리지 않는다
    const 닫기 = () => { s.remove(); 겨냥 && 겨냥.classList.remove('vg-mark'); 짚었다 = false; };
    s.querySelector('.vg-cancel').onclick = 닫기;
    /* 길게 누른 손가락을 떼면 click 하나가 뒤따라온다. 그 click 이 방금 열린
       이 판의 뒤판 위에 떨어져 판이 곧바로 닫혔다 — 짚어도 아무 일이 없는
       것처럼 보였고, 화면 아래쪽(카드가 깔리는 자리)을 짚었을 때만 살아남았다.
       판이 열리고 잠깐은 뒤판 닫기를 받지 않는다. 손으로 누르는 것은 그대로다. */
    let 뒤판받기 = false;
    setTimeout(() => { 뒤판받기 = true; }, 400);
    s.onclick = (e) => { if (뒤판받기 && e.target === s) 닫기(); };

    /* 지난 지시 — 이 자리에 오간 말을 새것부터 보여 준다. 읽기만 한다.
       적던 글은 그대로 두고 판 안에서만 갈아 끼운다 — 돌아가면 쓰던 글이 남아 있다. */
    const 적는곳 = s.querySelector('.vg-write'), 지난곳 = s.querySelector('.vg-past');
    const 목록 = s.querySelector('.vg-list'), 셈 = s.querySelector('.vg-cnt');
    s.querySelector('.vg-back').onclick = () => {
      지난곳.hidden = true; 적는곳.hidden = false;
    };
    s.querySelector('.vg-log').onclick = async () => {
      if (ta) ta.blur();                       // 자판을 내려 목록이 다 보이게
      적는곳.hidden = true; 지난곳.hidden = false;
      셈.textContent = ''; 목록.innerHTML = '<div class="vg-empty">읽는 중…</div>';
      let 말들;
      try { 말들 = await 지난것읽기(); }
      catch (e) { 목록.innerHTML = '<div class="vg-empty">' + 막기(e.message || '읽지 못했습니다') + '</div>'; return; }
      if (!말들.length){ 목록.innerHTML = '<div class="vg-empty">아직 이곳에 남긴 지시가 없습니다</div>'; return; }
      셈.textContent = 말들.length + '건';
      목록.innerHTML = 말들
        .slice().sort((a, b) => (b.at || 0) - (a.at || 0))          // 새것이 위로
        .map(m => {
          const 나 = m.who === '나';
          const 글 = String(m.text == null ? '' : m.text);
          const 쪼갬 = /^\s*\[([^\]]{1,80})\]\s*([\s\S]*)$/.exec(글);   // 짚으셨던 자리
          const 어디글 = 쪼갬 ? 쪼갬[1] : '';
          const 본문 = 쪼갬 ? 쪼갬[2] : 글;
          return '<div class="vg-it ' + (나 ? 'me' : 'cl') + '" data-at="' + (m.at || 0) + '">'
               + '<span class="vg-when">' + 때글(m.at) + ' · ' + 막기(나 ? '사장님' : (m.who || '클로드')) + '</span>'
               + (어디글 ? '<span class="vg-where">' + 막기(어디글) + '</span>' : '')
               + 막기(본문) + '</div>';
        }).join('');
      목록.scrollTop = 0;
      /* 사장님 말씀(10-01): 「이곳을 눌렀을때 내가 본 상세 위치를 보여 줄수는 없는건가요?」
         작업대가 `vg때` 를 붙여 보내면 **그 말이 있는 자리로 굴러가** 잠깐 드러낸다.
         때가 1~2초 어긋날 수 있어(손잡이가 적은 때와 글이 담긴 때가 다르다) 가장 가까운 줄을 고른다.
         못 찾으면 아무 일도 안 한다 — 맨 위 그대로다. */
      if (찾을때) {
        const 줄들 = [...목록.querySelectorAll('.vg-it')];
        let 고른 = null, 가까움 = 6;                       // 6초까지만 같은 것으로 본다
        줄들.forEach(el => {
          const d = Math.abs(Number(el.dataset.at || 0) - 찾을때);
          if (d <= 가까움) { 가까움 = d; 고른 = el; }
        });
        if (고른) {
          고른.classList.add('vg-here');
          setTimeout(() => 고른.scrollIntoView({ block: 'center' }), 60);
        }
      }
    };
    const 보냄 = s.querySelector('.vg-send');
    보냄.onclick = async () => {
      const 글 = ta.value.trim(); if (!글) return;
      보냄.disabled = true; 보냄.textContent = '보내는 중…';
      const 본문 = `[${어디()} · ${짚은것}] ${글}`;
      const 때 = Math.floor(Date.now() / 1000);
      try {
        await 지시보내기(본문);
        // 지시는 들어갔다. 이제 「내가 시킨 것」 에 한 줄 남긴다 —
        // 못 남겨도 지시는 그대로 둔다(알림만 다르게 한다).
        let 남겼나 = true;
        try { await 시킨것남기기(짚은것, 글, 때); } catch (e) { 남겼나 = false; }
        /* 10-02 사장님 말씀: 「한번의 지시후에도 **추가 지시가 가능하도록 지시 입력칸을
           유지**해 주세요」. 전에는 보내자마자 판을 닫아서(`닫기()`), 같은 자리에
           한마디 더 보태려면 **다시 길게 눌러야** 했다. 이제 판을 그대로 두고
           **쓰던 글만 비운다** — 짚은 자리도 그대로라 이어서 바로 적으시면 된다.
           닫는 길은 그대로다 — 「그만」 이나 뒤판. */
        ta.value = '';
        보냄.disabled = false; 보냄.textContent = '보내기';
        ta.focus();
        알림(남겼나 ? '클로드에게 보냈습니다 — 더 적으셔도 됩니다'
                   : '보냈습니다 — 「내가 시킨 것」 에는 못 적었습니다');
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
    // 주저리주저리 채팅을 보러 오신 길 — 적는 칸 대신 지난 지시를 바로 펼친다
    if (지난부터) s.querySelector('.vg-log').click();
  }

  /* ── 작업대 「내가 시킨 것」 에서 들어오는 두 꾸러미 ───────────────
     사장님 말씀(10-01): 「짚은페이지로는 최소한 가줘야 되는거 아니냐」
                        「주저리주저리 채팅위치로 갈 수 있는 링크 클릭」
       vg페이지=<켜진 탭 글자>  그 페이지를 눌러 둔다
       vg지난=1                지난 지시(주저리주저리 채팅)를 바로 펼친다
     ⚠ 프로그램이 뜨는 데 시간이 걸린다. 탭이 생길 때까지 잠깐 기다린다.
        없는 탭이면 아무 일도 하지 않는다 — 엉뚱한 곳을 누르지 않는다. */
  function 그페이지로(글, 남은) {
    const 후보 = [...document.querySelectorAll('.nav-link, .page-tab-link, .bnav')];
    const 것 = 후보.find(e => e.textContent.trim() === 글);
    if (것) {
      if (!것.classList.contains('active') && !것.classList.contains('on')) 것.click();
      try { 것.scrollIntoView({ block: 'center' }); } catch (e) {}
      return;
    }
    if (남은 > 0) setTimeout(() => 그페이지로(글, 남은 - 1), 300);
  }
  const 갈페이지 = (표.get('vg페이지') || '').trim();
  if (갈페이지) setTimeout(() => 그페이지로(갈페이지, 20), 300);   // 최대 6초까지 기다린다
  if (표.get('vg지난') === '1') {
    const 때 = Number(표.get('vg때') || 0) || 0;        // 짚으셨던 그 말의 때 (없으면 맨 위)
    setTimeout(() => 시트('지난 지시', true, 때), 500);
  }
})();
