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
})();
