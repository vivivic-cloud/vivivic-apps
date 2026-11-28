/* 자리주소 — 보던 자리(거래처·탭 단추)를 주소 # 에 담고, 새로고침·링크로 열면 그 자리로 다시 누름(2026-11-28 사장님 「질문에 해당 부분 링크도 걸어 줄 수 있냐. 지금은 새로고침하면 메인 페이지로 돌아와서…」).
   쓰는 법(body 끝): <script src="../shared/자리주소.js?v=1"></script><script>자리주소.달기(['#거래처 .chip', '#볼것 .chip', '[data-가탭]']);</script>
   층 = 단추 묶음 선택자(앞에서부터). 층마다 지금 켜진 단추(.on) 글자 = 주소 한 조각(끝 숫자 「 12」 는 뺌) → #현진산업/구매%2B가공품목/구매자재.
   열 때 = 층마다 그 글자 단추가 나타날 때까지 기다렸다가(최대 20초) 눌러 줌(페이지 자기 단추 길 그대로 — 따로 그리지 않음). 페이지 코드·저장 자료는 안 건드림. */
(function(){
  if(window.자리주소) return;
  var 층 = [], 되살리는중 = false;
  function 이름(b){ return String(b.textContent || '').replace(/\s+[\d,]+$/, '').trim(); }
  function 켜짐(sel){ var a = Array.prototype.slice.call(document.querySelectorAll(sel)); return a.filter(function(b){ return b.classList.contains('on') && b.offsetParent !== null; })[0] || null; }
  function 지금(){ var out = []; for(var i = 0; i < 층.length; i++){ var b = 켜짐(층[i]); if(!b) break; out.push(이름(b)); } return out; }
  function 쓰기(){
    if(되살리는중 || !층.length) return;
    var p = 지금(); if(!p.length) return;
    var h = '#' + p.map(encodeURIComponent).join('/');
    if(location.hash !== h){ try{ history.replaceState(history.state, '', location.pathname + location.search + h); }catch(e){} }
  }
  function 읽기(){ var h = location.hash.replace(/^#/, ''); if(!h) return []; return h.split('/').map(function(x){ try{ return decodeURIComponent(x); }catch(e){ return x; } }).filter(Boolean); }
  function 기다려(sel, 글, 끝){ return new Promise(function(ok){ var t0 = Date.now();
    (function 봄(){ var b = Array.prototype.slice.call(document.querySelectorAll(sel)).filter(function(x){ return 이름(x) === 글; })[0];
      if(b || Date.now() - t0 > 끝) return ok(b || null); setTimeout(봄, 250); })(); }); }
  function 되살림(){
    var p = 읽기(); if(!p.length) return;
    되살리는중 = true;
    var i = 0;
    (function 다음(){
      if(i >= p.length || i >= 층.length){ 되살리는중 = false; 쓰기(); return; }
      기다려(층[i], p[i], 20000).then(function(b){
        if(!b){ 되살리는중 = false; return; }
        if(!b.classList.contains('on')) b.click();
        i++; setTimeout(다음, 400);
      });
    })();
  }
  function 달기(sels){
    층 = sels || [];
    document.addEventListener('click', function(){ setTimeout(쓰기, 80); }, true);
    setInterval(쓰기, 1500);
    if(document.readyState === 'complete') setTimeout(되살림, 300); else window.addEventListener('load', function(){ setTimeout(되살림, 300); });
  }
  window.자리주소 = { 달기:달기, 지금:지금 };
})();
