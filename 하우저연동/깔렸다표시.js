// 이 컴퓨터에 확장이 깔려 있다는 표시 하나만 남긴다(설치 안내 화면 index.html 이 본다). 자료는 읽지도 보내지도 않는다.
document.documentElement.setAttribute("data-하우저연동", chrome.runtime.getManifest().version);
