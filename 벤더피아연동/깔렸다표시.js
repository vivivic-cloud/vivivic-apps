// 이 컴퓨터에 확장이 깔려 있다는 **표시 하나**만 남긴다 (설치 안내 화면 index.html 이 보고 벤더피아로 보낸다).
// 자료는 아무 것도 읽지 않고 아무 것도 보내지 않는다. 깃 페이지(vivivic-apps) 에서만 돈다.
document.documentElement.setAttribute("data-벤더피아연동", chrome.runtime.getManifest().version);
