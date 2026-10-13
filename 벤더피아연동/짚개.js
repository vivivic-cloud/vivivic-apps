/* 벤더피아 화면에도 **짚어서 지시하기** 손잡이를 붙인다.
   사장님 10-13: 「벤더피아연동 짚어서 지시하기 안된다고 짚어서지시하기」.
   설치 안내 화면에는 손잡이가 있었지만, 사장님이 실제로 쓰시는 **프로그램 화면은
   벤더피아 사이트 위**라 거기엔 손잡이가 없었다. 그래서 짚을 자리가 없었다.

   ⚠ 배송관리(firmDvList.aspx)에는 **일부러 안 붙인다.** 그 화면에는 수취인·전화·주소가 있고,
      손잡이는 짚으신 칸의 글을 60자까지 지시에 함께 적는다. 그 지시함(wt_asked)은
      들어온 사람 누구나 읽는 칸이다. 사람 정보가 거기로 새면 안 된다.
      (manifest 의 matches 에서 배송관리를 뺐다. 늘릴 때 이 쪽지를 먼저 읽어라.)

   손잡이는 주소에 ?viggle=1 이 있을 때 켜지는데, 벤더피아 주소에는 그것을 붙일 수 없다
   (ASP.NET 이 주소로 되돌려 보내는 화면이라 함부로 건드리면 안 된다).
   대신 손잡이가 보는 **기억**(vg기억장·vg기억칸)을 이 자리에서 적어 둔다. 손잡이가 그것을 보고 켠다. */
(() => {
  /* ⚠⚠ 10-13 사장님: 「메인화면에서는 **영역만 짚어지고** 지시내용을 보내는 부분이 안나타난다」.
     까닭을 찾았다 — 벤더피아 메인은 **틀(frameset)** 로 짜여 있다.
       ㄱ) 틀 문서에는 몸(body) 대신 `<frameset>` 이 있다. 거기에 지시판을 붙이면 **안 그려진다.**
          짚은 자리에 붉은 테만 남는다 — 그게 「영역만 짚어진다」 였다.
       ㄴ) 확장 글은 기본으로 **맨 위 문서에서만** 돈다. 그래서 틀 안쪽(진짜 화면)에는
          손잡이가 아예 없었다 — 「본 메뉴에 들어가서도 안된다」.
     그래서 ① 집 꼴에 `all_frames` 를 켜 **틀 안쪽마다** 붙이고,
            ② 틀 문서 자체에는 **안 붙인다**(아래 두 줄). */
  if (!document.body || document.body.tagName === "FRAMESET") return;
  if (window.__vp짚개) return;                       // 한 문서에 두 번 붙지 않는다
  window.__vp짚개 = true;
  /* ⚠ 배송관리에는 붙이지 않는다 — 수취인·전화·주소가 지시에 딸려 간다.
     집 꼴에서도 빼 두었지만, 틀 안쪽으로 들어오는 길이 있어 여기서 한 번 더 막는다. */
  if (/firmdvlist\.aspx/i.test(location.pathname)) return;

  const 것 = {
    box: "bbohq715mc5",                                   // 비비빅의 「밴더피아연동」 박스
    name: "밴더피아연동",
    vg: "https://vivivic-cloud.github.io/viggle/?take=1",  // 지시를 받는 작업대
    누구: ""                                               // 사장님 것 — 공유자는 설치 안내 화면에서 짚는다
  };
  const 적기 = (열쇠) => { for (const 통 of [sessionStorage, localStorage]) {
    try { 통.setItem(열쇠, JSON.stringify(것)); } catch (e) {} } };
  적기("vg기억장:" + location.pathname);
  적기("vg기억칸:" + location.pathname.replace(/[^/]*$/, ""));

  /* ⚠⚠ 10-13 사장님: 「이전에 있던 **지시영역 선택 영역표시마저 사라진** 상태이다」.
     손잡이를 **바깥(github.io)에서만** 불러오고 있었다. 벤더피아가 바깥 글을 막거나
     인터넷이 느리면 **아무 일도 안 난다** — 붉은 테조차 안 생긴다. 뒷길을 둔다.
       ① 바깥(늘 새것)  → ② 안 되면 **확장 안의 것**(손잡이.js) → ③ 그래도 안 되면 **붉은 줄로 알린다.**
     ⚠ `손잡이.js` 는 `shared/viggle.js` 를 **그대로 베껴 둔 뒷길**이다. 집 꼴을 다시 묶을 때
        반드시 같이 베껴라(배포 차례에 적어 두었다). 고치는 곳은 늘 `shared/viggle.js` 하나다. */
  const 넣기 = (주소) => new Promise((풀) => {
    const s = document.createElement("script");
    s.src = 주소; s.async = false;
    s.onload = () => 풀(true); s.onerror = () => 풀(false);
    (document.head || document.documentElement).appendChild(s);
  });
  (async () => {
    if (await 넣기("https://vivivic-cloud.github.io/vivivic-apps/shared/viggle.js")) return;
    if (await 넣기(chrome.runtime.getURL("손잡이.js"))) return;
    console.error("[벤더피아 보기] 짚어서 지시하기 손잡이를 못 불렀습니다");
    if (innerWidth < 320 || innerHeight < 240) return;        // 작은 틀에는 안 적는다
    const 줄 = document.createElement("div");
    줄.textContent = "벤더피아 보기 — 짚어서 지시하기를 못 불렀습니다. 바이글에게 알려 주세요.";
    줄.style.cssText = "position:fixed;left:0;right:0;top:0;z-index:2147483647;background:#c92a2a;"
      + "color:#fff;font:600 13px/1.5 sans-serif;padding:8px 12px;text-align:center";
    (document.body || document.documentElement).appendChild(줄);
  })();
})();
