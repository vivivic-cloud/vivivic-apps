/* shared/벤더피아단품단추.js — 확장 밖 페이지에서 쓰는 **벤더피아연동 단품 단추** + 단품 상세 「관련 상품」.
   첫 사용: 발주역입력 업체별단품.html v1.3.0 (11-19). 사장님(그대로): 「업체별 단품명에는 이 단품을 포함시키고 있는 상품명을 연결해줘야해
     방법은 벤더피아연동의 단품명 버튼이 그대로 지금 이 표의 단품명에 나타나게 하면 된다. 그 단품안에는 관련상품이 연동되어 보이게 해뒀으니 맞지?」

   꼴·동작 = 벤더피아연동 `goods.js` 그대로(값은 `goods.css` 숫자 그대로 옮김 — 확장 쪽은 안 고쳤다, 재설치 없음):
     단추   = `labelButton` — 누르는 글자 #337ea9 11px + 작은 단품코드(.vp-code) + 「양품 N」(.vp-qty, 재고 있을 때) + 밑 점 줄(.vp-점, 초록 = 재고).
              통은 `div.vp-goods-list`(배송관리 단품명 칸과 같은 통).
     누름   = 단품 상세 창(`.vp-goods-panel` 꼴, 오른쪽에 떠 있는 카드) — 단품코드·단품명·판매상태·양품수 + 「관련 상품」(`productChips`).
     관련 상품 단추 누름 = 연결 항목 팝업(`.vp-modal` 꼴, `popup`) + 「상품관리로 가기」.
   자료(읽기만, 벤더피아 요청 0) — 확장이 단품관리를 열 때 올려 둔 것:
     `납품내역_상품목록/상품_N.줄` = "상품코드\t상품명\t판매상태\t단품코드,단품코드,…" — `loadLinked()` 판매중·전체 기간 목록(= 단품 상세 「관련 상품」 과 같은 목록)
     `납품내역_단품목록/단품_N.줄` = "단품코드\t단품명\t판매상태\t양품수"
     짝 = 단품코드 trim + 소문자(벤더피아연동 `codeKey`).
   관련 상품이 없는 단추 = 색(.vp-관련없음)만, 까닭은 title(마우스 올림). 「없음」 = 판매중 상품 없음(판매중지에만 든 것도 빨강, title 에 중지 수).
   11-19 판매중지 상품도 관련 상품에 — 확장 0.35.7 이 판매상태 2(중지)를 따로 받아 같은 `납품내역_상품목록` 에 판매상태 「중지」 로 함께 올림.
     관련 상품 단추 중 그 이름 상품이 모두 중지 = `.vp-중지`(회색·옅게, 판매중 뒤) + title.
   쓰는 법:
     VP단품단추.읽기({ db, collection, getDocs }) → Promise   (한 번만 받음)
     VP단품단추.단추글(코드, 이름) → HTML 글(통째) — 표 칸 안에 넣는다
     VP단품단추.칠하기(뿌리) — 자료가 오면(또는 표를 다시 그린 뒤) 양품·점·관련없음 색을 입힌다
     VP단품단추.셈() → { 단품, 붙음, 없음 } (뿌리 안 단추 기준이 아니라 마지막 칠하기 기준) */
(() => {
  if (window.VP단품단추) return;
  const 자리 = ['artifacts', 'vivivic-4b7ef', 'public', 'data'];
  const 키 = (c) => String(c == null ? '' : c).trim().toLowerCase();
  const 글 = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const 점 = '<span class="vp-점"><i class="g"></i><i class="r"></i><i class="o"></i><i class="b"></i></span>';

  /* goods.css 값 그대로(#vp-root → .vp단품뿌리 / 쪽 안 .vp-goods-list). --ink #37352f · --muted #787774 · --fill #f1f1ef · --line #e3e2e0 (login.css) */
  const 꼴 = document.createElement('style');
  꼴.textContent = `
.vp-goods-list{display:flex;flex-wrap:wrap;gap:6px}
.vp-goods-list button,.vp단품뿌리 .vp-chips button{display:inline-block;width:auto;margin:0;padding:0;border:0;border-radius:0;background:none;
  color:#337ea9;font:inherit;font-size:11px;font-weight:400;text-align:left;cursor:pointer;box-shadow:none;text-decoration:none}
.vp-goods-list button{white-space:nowrap}
.vp단품뿌리 .vp-chips button{font-size:12px}
.vp-goods-list button:hover,.vp단품뿌리 .vp-chips button:hover{background:none;color:#337ea9;text-decoration:underline}
.vp-goods-list button.on,.vp단품뿌리 .vp-chips button.on{background:none;color:#337ea9;font-weight:700;text-decoration:underline}
.vp-goods-list .vp-code,.vp단품뿌리 .vp-code{margin-left:6px;font-size:11px;font-weight:500;color:#787774}
.vp-goods-list .vp-qty{margin-left:6px;padding:1px 6px;border-radius:999px;background:#eef7e0;color:#3d6b12;font-size:11px;font-weight:700}
.vp-goods-list .vp-점,.vp단품뿌리 .vp-chips .vp-점{display:flex;gap:3px;min-height:6px;margin-top:2px;line-height:0}
.vp-점 i{display:none;width:6px;height:6px;border-radius:50%}
.vp-instock .vp-점 i.g{display:block;background:#06AED5}
.vp단품뿌리 .vp-chips button.vp-중지,.vp단품뿌리 .vp-chips button.vp-중지:hover{color:#9C9C98;opacity:.55}
.vp단품뿌리 .vp-chips button.vp-중지 .vp-code{color:#9C9C98}
.vp-goods-list button.vp-관련없음,.vp-goods-list button.vp-관련없음:hover{color:#FF3B30}
.vp단품뿌리{color:#37352f;font:13px/1.45 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",system-ui,sans-serif}
.vp단품뿌리 .vp-chips{display:flex;flex-wrap:wrap;gap:6px}
.vp단품뿌리 .vp-goods-panel{position:fixed;top:16px;right:16px;bottom:16px;width:380px;max-width:calc(100vw - 32px);
  z-index:2147483646;background:#fff;border:1px solid #e3e2e0;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,.12);display:flex;flex-direction:column}
.vp단품뿌리 [hidden]{display:none!important}
.vp단품뿌리 .vp-goods-panel-head{display:flex;align-items:flex-start;gap:12px;padding:18px 20px;border-bottom:1px solid #ededeb}
.vp단품뿌리 .vp-goods-panel-head strong{flex:1;font-size:16px;font-weight:800;color:#37352f}
.vp단품뿌리 .vp-goods-panel-head button{width:28px;height:28px;margin:0;padding:0;border:0;border-radius:999px;background:#f1f1ef;color:#37352f;font-size:16px;line-height:1;cursor:pointer;flex:none}
.vp단품뿌리 .vp-goods-panel-body{overflow-y:auto;padding:8px 20px 20px}
.vp단품뿌리 dl{display:grid;grid-template-columns:110px 1fr;gap:8px 12px;margin:12px 0 0;padding-bottom:12px;border-bottom:1px solid #ededeb;font-size:13px}
.vp단품뿌리 dl:last-child{border-bottom:0}
.vp단품뿌리 dt{color:#787774}
.vp단품뿌리 dd{margin:0;word-break:break-all}
.vp단품뿌리 .vp-modal{position:fixed;inset:0;z-index:2147483647;background:rgba(55,53,47,.35);display:flex;align-items:center;justify-content:center;padding:16px}
.vp단품뿌리 .vp-modal-card{width:440px;max-width:100%;max-height:calc(100vh - 32px);display:flex;flex-direction:column;background:#fff;border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.2)}
.vp단품뿌리 .vp-modal-body{overflow-y:auto;padding:0 20px 8px}
.vp단품뿌리 .vp-modal-foot{padding:12px 20px 20px;border-top:1px solid #ededeb}
.vp단품뿌리 .vp-goto{display:block;padding:12px;border-radius:12px;background:#37352f;color:#fff;font-size:14px;font-weight:800;text-align:center;text-decoration:none}`;
  document.head.appendChild(꼴);

  let 받기 = null, 다받음 = false, 단품 = new Map(), 상품 = new Map(), 셈값 = { 단품: 0, 붙음: 0, 없음: 0 };
  const 칠할곳 = new Set();

  async function 문서줄(fb, 이름, 머리) {
    const 눈 = await fb.getDocs(fb.collection(fb.db, ...자리, 이름));
    const 문들 = [];
    눈.forEach((d) => { const m = d.id.match(new RegExp('^' + 머리 + '_(\\d+)$')); if (m) 문들.push([Number(m[1]), d.data().줄 || []]); });
    문들.sort((a, b) => a[0] - b[0]);
    return [].concat(...문들.map((x) => x[1]));
  }
  function 읽기(fb) {
    if (받기) return 받기;
    받기 = Promise.all([문서줄(fb, '납품내역_단품목록', '단품'), 문서줄(fb, '납품내역_상품목록', '상품')]).then(([단줄, 상줄]) => {
      단품 = new Map(); 상품 = new Map();
      for (const s of 단줄) {
        const [코드 = '', 이름 = '', 상태 = '', 양품 = ''] = String(s).split('\t');
        if (코드.trim() && !단품.has(키(코드))) 단품.set(키(코드), { 코드: 코드.trim(), 이름, 상태, 양품 });
      }
      for (const s of 상줄) {          // 받은 차례 그대로(= 확장 `productChips` 차례)
        const [코드 = '', 이름 = '', 상태 = '', 단 = ''] = String(s).split('\t');
        if (!코드.trim()) continue;
        const x = { 코드: 코드.trim(), 이름, 상태, 단품들: 단.split(/[,+]/).map((v) => v.trim()).filter(Boolean) };
        for (const k of new Set(x.단품들.map(키))) { if (!상품.has(k)) 상품.set(k, []); 상품.get(k).push(x); }
      }
      다받음 = true;
      칠할곳.forEach((r) => 칠하기(r));
    });
    받기.catch(() => { 받기 = null; });
    return 받기;
  }

  function 단추글(코드, 이름) {
    const c = String(코드 == null ? '' : 코드).trim();
    return `<div class="vp-goods-list"><button type="button" data-vpc="${글(c)}" data-vpn="${글(이름)}">${글(이름)}${c ? `<small class="vp-code">${글(c)}</small>` : ''}${점}</button></div>`;
  }
  /* 양품(labelButton 과 같음: 재고 값이 있으면 vp-instock + 「양품 N」) · 관련 상품 없음 = 색 + title */
  function 칠하기(뿌리) {
    칠할곳.add(뿌리);
    if (!다받음) return;
    const 본 = new Set(), 붙 = new Set();
    뿌리.querySelectorAll('button[data-vpc]').forEach((b) => {
      const k = 키(b.dataset.vpc), d = 단품.get(k), 다관련 = 상품.get(k) || [];
      const 관련 = 다관련.filter((x) => x.상태 !== '중지').length, 중지수 = 다관련.length - 관련;
      const 양 = d && String(d.양품).trim() !== '' && !isNaN(Number(d.양품)) ? Number(d.양품) : undefined;
      b.classList.toggle('vp-instock', 양 !== undefined);
      let q = b.querySelector('.vp-qty');
      if (양 !== undefined) {
        if (!q) { q = document.createElement('small'); q.className = 'vp-qty'; b.insertBefore(q, b.querySelector('.vp-점')); }
        q.textContent = `양품 ${양.toLocaleString()}`;
      } else if (q) q.remove();
      if (k) { 본.add(k); if (관련) 붙.add(k); }
      b.classList.toggle('vp-관련없음', !관련);
      if (관련) b.removeAttribute('title');
      else b.title = !k ? '단품코드 없음' : !d ? '벤더피아 단품관리에 이 단품코드 없음'
        : 중지수 ? `이 단품이 든 판매중 상품 없음 — 판매중지 상품 ${중지수}개뿐` : '이 단품이 든 판매중 상품 없음(벤더피아 상품관리)';
    });
    셈값 = { 단품: 본.size, 붙음: 붙.size, 없음: 본.size - 붙.size };
  }

  /* ── 창 ── */
  let 뿌리 = null, 판, 판제목, 판몸, 창, 창제목, 창몸, 창가기;
  function 뿌리세우기() {
    if (뿌리) return;
    뿌리 = document.body.appendChild(document.createElement('div'));
    뿌리.className = 'vp단품뿌리';
    뿌리.innerHTML = `<div class="vp-goods-panel" hidden><div class="vp-goods-panel-head"><strong></strong><button type="button" aria-label="닫기">×</button></div><div class="vp-goods-panel-body"></div></div>
<div class="vp-modal" hidden><div class="vp-modal-card"><div class="vp-goods-panel-head"><strong></strong><button type="button" aria-label="닫기">×</button></div><div class="vp-modal-body"></div><div class="vp-modal-foot"><a class="vp-goto" target="_blank" rel="noopener">상품관리로 가기</a></div></div></div>`;
    판 = 뿌리.querySelector('.vp-goods-panel'); 판제목 = 판.querySelector('strong'); 판몸 = 판.querySelector('.vp-goods-panel-body');
    창 = 뿌리.querySelector('.vp-modal'); 창제목 = 창.querySelector('strong'); 창몸 = 창.querySelector('.vp-modal-body'); 창가기 = 창.querySelector('.vp-goto');
    판.querySelector('.vp-goods-panel-head button').addEventListener('click', 판닫기);
    창.querySelector('.vp-goods-panel-head button').addEventListener('click', () => { 창.hidden = true; });
    창.addEventListener('click', (e) => { if (e.target === 창) 창.hidden = true; });
  }
  function 판닫기() { if (!판) return; 판.hidden = true; document.querySelectorAll('.vp-goods-list button.on').forEach((x) => x.classList.remove('on')); }
  const 칸들 = (짝) => { const dl = document.createElement('dl'); for (const [k, v] of 짝) { if (!String(v == null ? '' : v).trim() && k !== '관련 상품') continue; dl.appendChild(document.createElement('dt')).textContent = k; const dd = dl.appendChild(document.createElement('dd')); if (v instanceof Node) dd.appendChild(v); else dd.textContent = v; } return dl; };

  function 상품창(이름, 줄들) {      // goods.js `popup(name, linked.heads, items, name)`
    창제목.textContent = 이름;
    const 단이름 = (c) => (단품.get(키(c)) || {}).이름;
    창몸.replaceChildren(...줄들.map((x) => 칸들([['상품코드', x.코드], ['상품명', x.이름], ['판매상태', x.상태], ['단품코드', x.단품들.join('+')],
      ['단품명', x.단품들.every(단이름) ? x.단품들.map(단이름).join('+') : '']])));
    창가기.href = `https://vendorpia.com/System/Master/salesGoods.aspx#vp-q=${encodeURIComponent(이름)}`;
    창.hidden = false;
  }
  function 관련상품(코드) {          // goods.js `productChips`
    const box = document.createElement('div'); box.className = 'vp-chips';
    if (!다받음) { box.textContent = '불러오는 중…'; return box; }
    const byName = new Map();
    for (const x of 상품.get(키(코드)) || []) { if (!byName.has(x.이름)) byName.set(x.이름, []); byName.get(x.이름).push(x); }
    if (!byName.size) { box.textContent = '없음'; return box; }
    /* 11-19 사장님 「판매중지도 약간 죽은느낌으로 보이게 해줘」 — 판매중 먼저, 판매중지(그 이름 상품이 모두 중지)는 흐리게 · 까닭은 title */
    const 죽음 = (줄들) => 줄들.every((x) => x.상태 === '중지');
    for (const [이름, 줄들] of [...byName].sort((a, z) => 죽음(a[1]) - 죽음(z[1]))) {
      const b = box.appendChild(document.createElement('button')); b.type = 'button';
      if (죽음(줄들)) { b.classList.add('vp-중지'); b.title = '판매중지 상품(벤더피아 상품관리 판매상태 중지)'; }
      b.innerHTML = `${글(이름)}<small class="vp-code">${글([...new Set(줄들.map((x) => x.코드))].join(', '))}</small>${점}`;
      b.addEventListener('click', () => 상품창(이름, 줄들));
    }
    return box;
  }
  function 단품판(b) {
    뿌리세우기();
    const 코드 = b.dataset.vpc, d = 단품.get(키(코드)) || {};
    판제목.textContent = d.이름 || b.dataset.vpn;
    판몸.replaceChildren(칸들([['단품코드', d.코드 || 코드], ['단품명', d.이름 || b.dataset.vpn], ['판매상태', d.상태], ['양품수', d.양품], ['관련 상품', 관련상품(코드)]]));
    판.hidden = false; 판몸.scrollTop = 0;
    document.querySelectorAll('.vp-goods-list button.on').forEach((x) => x.classList.remove('on'));
    b.classList.add('on');
    if (!다받음 && 받기) 받기.then(() => { if (!판.hidden && b.classList.contains('on')) 단품판(b); });
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('.vp-goods-list button[data-vpc]');
    if (b) { 단품판(b); return; }
    if (판 && !판.hidden && !e.target.closest('.vp단품뿌리')) 판닫기();     // 바깥 누름 = 닫힘(goods.js 상세 창과 같음)
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !뿌리) return;
    if (!창.hidden) 창.hidden = true; else 판닫기();
  });

  window.VP단품단추 = { 읽기, 단추글, 칠하기, 셈: () => 셈값, 키 };
})();
