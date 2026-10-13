// 조혼가구 프로그램 화면에서 johon-read.js가 보낸 단품명·부속카드를 크롬 안에 저장한다 (벤더피아 화면이 읽는다).
window.addEventListener("message", (e) => {
  if (e.source !== window || e.data?.type !== "vp-johon" || !e.data.parts?.length) return;
  // v: 자료 판 — 2 부터 부속에 엣지면·뒷판홈(우라홈)·결보호, 3 부터 전도방지(jundo)가 들어 있다
  chrome.storage.local.set({ vpJohon: { v: 3, at: Date.now(), parts: e.data.parts, cards: e.data.cards, jundo: e.data.jundo } });
});
