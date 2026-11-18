/* 발주역입력 — 벤더피아 단품 **실시간 검색** 다리 (11-18 [새 지시 단품실시간]) · 재단·이룸산업·로앤 페이지가 같이 쓴다.
   사장님: 「단품 추가」 검색을 창고 사본(`납품내역_단품목록`)이 아니라 벤더피아연동을 통해 벤더피아 단품관리에서 바로. 확장 내려받기·덮어쓰기 없이.

   길(확장 덮어쓰기 없음):
     이 페이지가 `window.open` 으로 연 벤더피아 탭(창 이름 `vp단품관리`)에서는 깔린 벤더피아연동이 깃의 `벤더피아연동/vp-data.js` 를 넣는다.
     그 글이 연 쪽(이 페이지)에 `{__vp:"단품창"}` 인사를 보내고, 이 페이지가 `{__vp:"단품찾기", 표, 낱말}` 을 보내면
     사장님 벤더피아 로그인 그대로 단품관리 검색 폼에 조회 한 번 → `{__vp:"단품찾기답", 표, 로그인, 줄:[[단품코드, 단품명, 판매상태]]}`.
     · 이 페이지를 새로고침해도 그 탭이 열려 있으면 다시 인사가 와서 이어진다(숨은 탭은 크롬이 타이머를 늦춰 1분까지 걸릴 수 있다).
     · 창끼리 주고받는 것뿐 — 창고·URL 에 아무것도 안 남긴다. 받는 집은 벤더피아(`https://vendorpia.com`·`www`)만.
   쓰는 법(페이지):
     VP실시간.열기()            — 누름(사용자 손) 안에서 부른다. 이어진 탭이 없고 확장이 깔린 크롬이면 벤더피아 단품관리 탭을 한 번 연다(이 쪽 열린 동안 한 번).
     VP실시간.찾기(검색어) → Promise<null | {로그인, 줄}>   — 이어진 탭이 없거나 15초 안에 답이 없으면 null(→ 페이지는 사본 그대로).
     VP실시간.됨()              — 마지막 답이 로그인·목록이었나(작은 표시용).
     VP실시간.낱말(검색어)      — 벤더피아에 보낼 낱말들(긴 낱말 → 긴 한글 조각). */
(() => {
  if (window.VP실시간) return;
  const 벤더피아집 = /^https:\/\/(www\.)?vendorpia\.com$/;
  const 창이름 = 'vp단품관리', 단품관리주소 = 'https://vendorpia.com/System/Master/goods.aspx';
  let 창 = null, 창집 = 'https://vendorpia.com', 인사때 = 0, 열었나 = false, 마지막 = null;
  const 기다림 = new Map(), 알림들 = new Set();
  addEventListener('message', e => {
    if (!벤더피아집.test(e.origin) || !e.data || !e.source) return;
    if (e.data.__vp === '단품창') {
      const 처음 = !인사때 || 창 !== e.source;
      창 = e.source; 창집 = e.origin; 인사때 = Date.now();
      try { sessionStorage.setItem(탭표, String(인사때)); } catch (er) {}
      if (처음) 알림들.forEach(f => { try { f(); } catch (er) {} });
      return;
    }
    if (e.data.__vp === '단품찾기답') { const f = 기다림.get(e.data.표); if (f) f(e.data); }
  });
  const 이어짐 = () => { try { return !!창 && !창.closed && 인사때 > 0; } catch (e) { return false; } };
  const 확장있나 = () => document.documentElement.hasAttribute('data-벤더피아연동');
  /* 이 탭이 전에 벤더피아 탭과 이어졌으면(sessionStorage) 새로고침 뒤엔 그 탭의 인사를 기다린다 — 숨은 탭은 크롬이 타이머를 늦춰 1분까지.
     그동안 `window.open('', 이름)` 을 부르면 그 탭이 앞으로 튀어나오므로 70초는 안 부른다(그사이 검색은 사본, 인사가 오면 바로 실시간). */
  const 탭표 = 'vp단품탭', 뜬때 = Date.now();
  function 열기() {
    if (이어짐() || 열었나 || !확장있나()) return;
    let 전 = null; try { 전 = sessionStorage.getItem(탭표); } catch (e) {}
    if (전 && Date.now() - 뜬때 < 70000) return;
    열었나 = true;
    let w = null;
    try { w = window.open('', 창이름); } catch (e) {}
    if (!w) return;
    let 새것 = false;
    try { 새것 = w.location.href === 'about:blank'; } catch (e) {}   /* 벤더피아 탭이 이미 있으면 남의 집이라 못 읽는다 */
    if (새것) w.location.href = 단품관리주소;
    else try { w.postMessage({ __vp: '단품안녕' }, '*'); } catch (e) {}
    try { sessionStorage.setItem(탭표, String(Date.now())); } catch (e) {}
    try { window.focus(); } catch (e) {}
  }
  function 낱말(검색어) {
    const 글 = String(검색어 || '').replace(/\s+/g, ' ').trim();
    const 들 = [];
    const 넣 = w => { if (w && w.length >= 2 && !들.includes(w)) 들.push(w); };
    넣([...글.split(' ')].sort((a, b) => b.length - a.length)[0]);
    넣([...(글.match(/[가-힣]+/g) || [])].sort((a, b) => b.length - a.length)[0]);
    return 들.slice(0, 2);
  }
  function 찾기(검색어) {
    const 들 = 낱말(검색어);
    if (!이어짐() || !들.length) return Promise.resolve(null);
    return new Promise(풀 => {
      const 표 = Math.random().toString(36).slice(2);
      const 끝 = 답 => { 기다림.delete(표); clearTimeout(시); 풀(답); };
      const 시 = setTimeout(() => { 마지막 = null; 끝(null); }, 15000);
      기다림.set(표, 답 => {
        마지막 = 답.로그인 === true ? '됨' : 답.로그인 === false ? '로그인' : null;
        끝(답.로그인 === true || 답.로그인 === false ? { 로그인: 답.로그인, 줄: Array.isArray(답.줄) ? 답.줄 : [] } : null);
      });
      try { 창.postMessage({ __vp: '단품찾기', 표, 낱말: 들 }, 창집); } catch (e) { 끝(null); }
    });
  }
  window.VP실시간 = { 열기, 찾기, 낱말, 이어짐, 됨: () => 마지막 === '됨', 로그인필요: () => 마지막 === '로그인', 이으면: f => 알림들.add(f) };
})();
