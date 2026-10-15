/* 화면 글(깃허브에서 온 것)은 확장 저장소에 바로 못 닿는다. 이 다리로 건넌다.
   확장 쪽(불러오기.js)이 받아서 chrome.storage.local 에 넣고 빼 준다.
   ⚠ 이 파일은 **늘 확장 안의 것**을 쓴다. 다리까지 바깥에서 받으면 인터넷이 끊겼을 때 길이 끊긴다. */
(() => {
  let 표 = 0;
  const 기다리는것 = new Map();
  addEventListener("message", (e) => {
    if (e.source !== window || !e.data || e.data.__vp !== "저장답") return;
    const 풀 = 기다리는것.get(e.data.표);
    if (풀) { 기다리는것.delete(e.data.표); 풀(e.data.답); }
  });
  const 묻기 = (일, 열쇠, 값) => new Promise((풀) => {
    const 내표 = ++표;
    기다리는것.set(내표, 풀);
    window.postMessage({ __vp: "저장", 표: 내표, 일, 열쇠, 값 }, location.origin);
    setTimeout(() => { if (기다리는것.delete(내표)) 풀(null); }, 4000);   // 답이 없어도 멈추지 않는다
  });
  window.VP저장 = {
    get: (열쇠) => 묻기("get", 열쇠 === undefined ? null : 열쇠),
    set: (값) => 묻기("set", null, 값),
    remove: (열쇠) => 묻기("remove", 열쇠),
  };

  /* ── ⑧ **밖에서 받아 오는 다리** (10-15) ──────────────────────
     사장님 PC 에서 단품 상세의 「수입정보」 단추가 **아예 안 생겼다.** 403 길의 모습과 같았다.
     벤더피아 쪽 **CSP `connect-src`** 가 창고(firestore)로 나가는 것을 막으면 화면 글은
     아무리 애써도 못 받는다. 그런데 **확장 쪽(`불러오기.js`)의 받아오기는 그 CSP에 안 묶인다.**
     그래서 저장 다리와 **같은 길**로 「이 주소 좀 받아 주십시오」 를 건넨다.
     ⚠ 받아 줄 집은 **확장 쪽에서 둘만 허락한다**(창고·익명로그인). 거기서 막는다.
     ⚠ 쿠키는 **안 싣는다**(`credentials: omit`) — 확장 쪽에서 그렇게 받는다. */
  let 표2 = 0;
  const 기다리는것2 = new Map();
  addEventListener("message", (e) => {
    if (e.source !== window || !e.data || e.data.__vp !== "밖에답") return;
    const 풀 = 기다리는것2.get(e.data.표);
    if (풀) { 기다리는것2.delete(e.data.표); 풀(e.data.답); }
  });
  window.VP밖에 = (주소, 옵션) => new Promise((풀) => {
    const 내표 = ++표2;
    기다리는것2.set(내표, 풀);
    window.postMessage({ __vp: "밖에", 표: 내표, 주소, 옵션: 옵션 || null }, location.origin);
    /* 받아오기는 저장보다 오래 걸린다. 그래도 끝내 답이 없으면 멈추지 않고 null 로 돌려준다. */
    setTimeout(() => { if (기다리는것2.delete(내표)) 풀(null); }, 20000);
  });
})();
