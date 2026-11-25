/* 단품찾기.js — 로앤·이룸산업 출고내역 「누계」 표 위 단품 찾기(11-25).
   사장님(그대로): 「로앤 이룸 출고내역 누계에서 선택된 단품을 검색하여 해당칸으로 이동가능하게 하는 검색창을 만들어 주세요. 해당 단품명이 선택된 각 칸으로 이동가능해야 합니다」
   쓰는 법: 누계 표를 그린 뒤 단품찾기.달기(속) — 속 맨 앞에 찾기 줄(검색 칸 · n/전체 · ‹ ›)을 넣고, 지난 검색어가 있으면 다시 찾음.
   찾는 칸 = 표 안 고른 단품 단추(.vk .dn) 중 단품명·단품코드에 검색 낱말이 모두 든 것(띄어쓰기·대소문자 무시).
   Enter = 다음 · Shift+Enter = 이전 · 이동 = 표 상자 안에서 그 칸으로 밀고 굵은 테. 검색 칸 드롭 = 표에 나온 거래처들의 업체별 단품명(업체단품목록.js — 같은 검색·비슷한 순, 칸 10px 아래). */
(function(){
  if(window.단품찾기) return;
  const 글 = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const 찾글 = s => String(s ?? '').toLowerCase().replace(/\s+/g, '');
  let 말 = '', 지금 = -1, 맞은 = [], 줄 = null, 드 = null, 드목 = [];
  const st = document.createElement('style');
  st.textContent = '.단찾{display:flex;align-items:center;gap:6px;margin:0 0 8px}.단찾 input{width:240px;max-width:60vw;height:24px;padding:1px 6px;font:inherit;font-size:12px;border:1px solid #C7C7C3;border-radius:4px}'
    + '.단찾 .n{font-size:12px;color:var(--vg-muted);min-width:44px;text-align:center}.단찾 button{height:24px;min-width:26px;padding:0 6px;font:inherit;font-size:13px;border:1px solid #C7C7C3;border-radius:4px;background:var(--vg-bg);cursor:pointer}'
    + '.vk .dn.찾은{box-shadow:inset 0 0 0 2px #E5B800}.vk .dn.찾음{box-shadow:inset 0 0 0 2px var(--vg-ink);background:#FFF59D}'
    + '@media (max-width:600px){.단찾 input{font-size:16px;height:28px}}';
  document.head.appendChild(st);
  function 찾기(){
    document.querySelectorAll('.vk .dn.찾은, .vk .dn.찾음').forEach(b => b.classList.remove('찾은', '찾음'));
    const 낱 = 말.toLowerCase().split(/\s+/).filter(Boolean);
    맞은 = 낱.length ? [...document.querySelectorAll('#속 .vk .dn')].filter(b => { const g = 찾글(b.textContent + ' ' + (b.dataset.c || '')); return 낱.every(w => g.includes(w)); }) : [];
    맞은.forEach(b => b.classList.add('찾은'));
    if(지금 >= 맞은.length) 지금 = 맞은.length ? 0 : -1;
    표시();
  }
  function 표시(){ if(!줄) return; const n = 줄.querySelector('.n'); n.textContent = (맞은.length ? (지금 + 1) : 0) + '/' + 맞은.length;
    document.querySelectorAll('.vk .dn.찾음').forEach(b => b.classList.remove('찾음')); const b = 맞은[지금]; if(b) b.classList.add('찾음'); }
  function 가기(d){ if(맞은.some(b => !b.isConnected)) 찾기(); if(!맞은.length) return; 지금 = 지금 < 0 ? (d < 0 ? 맞은.length - 1 : 0) : (지금 + d + 맞은.length) % 맞은.length; 표시();
    const b = 맞은[지금], 통 = b.closest('.표통'); if(!통) return;
    const r = b.getBoundingClientRect(), t = 통.getBoundingClientRect(), 왼고정 = (통.querySelector('th.dpr-k') || {}).offsetWidth || 0;
    if(b.closest('td.dpr-k')) 통.scrollTop += (r.top + r.height / 2) - (t.top + t.height / 2);
    else 통.scrollBy({ left:(r.left + r.width / 2) - (t.left + 왼고정 + (t.width - 왼고정) / 2), top:(r.top + r.height / 2) - (t.top + t.height / 2) }); }
  /* 드롭 */
  function 드닫(){ if(드){ 드.remove(); 드 = null; } }
  function 드그림(input){
    const 업들 = [...new Set([...document.querySelectorAll('#속 .vk')].flatMap(v => (v.dataset.u || '').split('|').filter(Boolean)))];
    const 목 = window.업체단품 && 업들.length ? window.업체단품.목록(업들) : null;
    if(!드){ 드 = document.createElement('div'); 드.className = 'vpd'; document.body.appendChild(드);
      드.addEventListener('pointerdown', e => e.preventDefault());
      드.addEventListener('click', e => { const d = e.target.closest('div[data-i]'); if(!d) return; const x = 드목[+d.dataset.i]; if(!x) return; input.value = x.코드; 말 = x.코드; 지금 = -1; 찾기(); 드닫(); 가기(1); }); }
    const r = input.getBoundingClientRect(), 폭 = Math.min(380, innerWidth - 16);
    Object.assign(드.style, { left:Math.max(8, Math.min(r.left, innerWidth - 폭 - 8)) + 'px', top:(r.bottom + 10) + 'px', width:폭 + 'px', maxHeight:Math.max(60, Math.min(280, innerHeight - r.bottom - 18)) + 'px' });
    if(!목){ 드목 = []; 드.innerHTML = '<div class="msg">업체별 단품명을 읽는 중…</div>'; return; }
    const 낱 = input.value.toLowerCase().split(/\s+/).filter(Boolean), 찾 = d => 찾글(d.이름 + ' ' + d.코드);
    let 비슷 = false; 드목 = 낱.length ? 목.filter(d => 낱.every(w => 찾(d).includes(w))) : 목.slice();
    if(낱.length && !드목.length){ const 조 = [...new Set(input.value.toLowerCase().match(/[가-힣]+|[0-9]+|[a-z]+/g) || [])].filter(w => w.length >= 2), 점 = [];
      목.forEach((d, j) => { const g = 찾(d); let n = 0, k = ''; for(const w of 조){ const y = g.includes(w); if(y) n++; k += y ? '1' : '0'; } if(n) 점.push({ d, n, k, j }); });
      점.sort((a, b) => b.n - a.n || (a.k < b.k ? 1 : a.k > b.k ? -1 : 0) || a.j - b.j); 드목 = 점.map(x => x.d); 비슷 = 드목.length > 0; }
    드.innerHTML = (비슷 ? '<div class="msg">다 맞는 단품 없음 — 비슷한 순</div>' : '') + (드목.length ? '' : '<div class="msg">맞는 단품 없음</div>')
      + 드목.slice(0, 200).map((d, i) => `<div data-i="${i}">${글(d.이름)}<span class="cd">${글(d.코드)}${업들.length > 1 ? ' · ' + 글(d.업체 || '') : ''}</span></div>`).join('');
  }
  function 달기(속){
    if(!속) return; const 통 = 속.querySelector('.표통'); if(!통) return;
    줄 = document.createElement('div'); 줄.className = '단찾';
    줄.innerHTML = '<input type="search" placeholder="단품 찾기" autocomplete="off" enterkeyhint="search"><span class="n">0/0</span><button type="button" data-d="-1" title="이전">‹</button><button type="button" data-d="1" title="다음">›</button>';
    속.insertBefore(줄, 통);
    const input = 줄.querySelector('input'); input.value = 말;
    input.addEventListener('input', () => { 말 = input.value; 지금 = -1; 찾기(); 드그림(input); });
    input.addEventListener('focus', () => 드그림(input));
    input.addEventListener('blur', () => setTimeout(드닫, 0));
    input.addEventListener('keydown', e => { if(e.key==='Enter'){ e.preventDefault(); 드닫(); 가기(e.shiftKey ? -1 : 1); } else if(e.key==='Escape'){ 드닫(); input.blur(); } });
    줄.querySelectorAll('button[data-d]').forEach(b => b.addEventListener('click', () => 가기(+b.dataset.d)));
    통.addEventListener('scroll', 드닫);
    찾기();
  }
  window.단품찾기 = { 달기, 다시:() => { if(줄 && 줄.isConnected) 찾기(); } };
})();
