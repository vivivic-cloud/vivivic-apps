// 이 컴퓨터에 확장이 깔려 있다는 **표시 하나**만 남긴다 (설치 안내 화면 index.html 이 보고 벤더피아로 보낸다).
// 자료는 아무 것도 읽지 않고 아무 것도 보내지 않는다. 깃 페이지(vivivic-apps) 에서만 돈다.
document.documentElement.setAttribute("data-벤더피아연동", chrome.runtime.getManifest().version);

/* ⚠ 10-14 — 사장님이 「벤더피아연동을 열었는데 탭에 표가 안 보인다」 하셨다.
   탭 표는 **벤더피아 사이트(vendorpia.com)** 에서만 찍고 있었다. 설치 안내 화면에는 안 찍었다.
   그래서 어느 화면을 보셨는지에 따라 답이 갈린다 — **여기에도 찍는다.**
   이제 둘 다 탭에 「·짚기v판번호」 가 붙는다. 어느 쪽을 열어도 확장이 살아 있으면 보인다. */
try {
  const 판 = chrome.runtime.getManifest().version;
  if (!/·짚기v/.test(document.title || "")) document.title = (document.title || "벤더피아 연동") + " ·짚기v" + 판;
} catch (e) {}
