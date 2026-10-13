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
  /* ⚠⚠ 10-13 사장님: 「짚은곳 **영역표시만 되고 지시문을 넣을 자리가 안나타남**」.
     붉은 테는 손잡이가 **붙고 나서** 칠해진다. 테가 보이는데 판이 안 뜨면,
     테를 칠한 **바로 다음 줄에서 터진** 것이다(판을 만드는 자리). 그 까닭이 화면에
     한 글자도 안 나오면 아무도 모른다 — 이 집에서 제일 나쁜 꼴이다.
     그래서 **터진 말을 그대로 붉은 줄에 적는다.** 사장님이 그 줄만 읽어 주시면 가른다. */
  addEventListener("error", (e) => {
    const 글 = (e && e.message) || "";
    const 어디 = (e && e.filename) || "";
    /* 손잡이가 **붙은 뒤**에 난 탈이면 다 적는다. 벤더피아 제 탈까지 적으면 시끄럽지만,
       지금은 왜 판이 안 뜨는지 아는 것이 먼저다. 터진 말이 제일 빠른 길이다. */
    if (!window.__vp손잡이붙음 && !/viggle|손잡이|vg-/.test(글 + " " + 어디)) return;
    if (innerWidth < 320 || innerHeight < 240) return;
    const 옛 = document.getElementById("vp-탈"); if (옛) 옛.remove();   // 터진 말이 더 쓸모 있다
    const 줄 = document.createElement("div");
    줄.id = "vp-탈";
    줄.textContent = "짚기가 터졌습니다 — " + 글.slice(0, 160);
    줄.style.cssText = "position:fixed;left:0;right:0;top:0;z-index:2147483647;background:#c92a2a;"
      + "color:#fff;font:600 12px/1.5 sans-serif;padding:8px 12px;text-align:center;word-break:break-all";
    (document.body || document.documentElement).appendChild(줄);
  }, true);

  /* ⚠ 터지지 않고 **조용히** 판만 안 뜨는 길도 있다(판이 틀보다 커서 안 보이는 따위).
     그래서 테가 칠해졌는데 판이 없으면 **그 사실과 틀 크기를 적는다.** 숫자가 있어야 가른다. */
  addEventListener("mouseup", () => setTimeout(() => {
    if (!document.querySelector(".vg-mark")) return;
    if (document.querySelector(".vg-sheet")) return;
    if (document.getElementById("vp-탈")) return;              // 터진 말이 이미 적혔으면 그대로 둔다
    const 줄 = document.createElement("div");
    줄.id = "vp-탈";
    줄.textContent = "짚기 — 테는 칠했는데 지시판이 안 떴습니다 (틀 "
      + innerWidth + "×" + innerHeight + ", " + (window.top === window ? "맨 위" : "틀 안쪽") + ")";
    줄.style.cssText = "position:fixed;left:0;right:0;top:0;z-index:2147483647;background:#c92a2a;"
      + "color:#fff;font:600 12px/1.5 sans-serif;padding:8px 12px;text-align:center";
    (document.body || document.documentElement).appendChild(줄);
  }, 400), true);

  const 넣기 = (주소) => new Promise((풀) => {
    const s = document.createElement("script");
    s.src = 주소; s.async = false;
    /* ⚠ 바깥에서 온 글이 터지면 브라우저가 까닭을 안 알려 준다 — 「Script error.」 한 마디뿐이다.
       `crossorigin` 을 달아야 **터진 말 그대로** 온다(깃허브 페이지는 CORS 를 열어 둔다).
       혹 막혀서 못 불러오면 바로 아래 뒷길(확장 안의 것)로 간다 — 잃을 것이 없다. */
    if (/^https?:/i.test(주소)) s.crossOrigin = "anonymous";
    s.onload = () => 풀(true); s.onerror = () => 풀(false);
    (document.head || document.documentElement).appendChild(s);
  });
  (async () => {
    if (await 넣기("https://vivivic-cloud.github.io/vivivic-apps/shared/viggle.js")) { window.__vp손잡이붙음 = true; return; }
    if (await 넣기(chrome.runtime.getURL("손잡이.js"))) { window.__vp손잡이붙음 = true; return; }
    console.error("[벤더피아 보기] 짚어서 지시하기 손잡이를 못 불렀습니다");
    if (innerWidth < 320 || innerHeight < 240) return;        // 작은 틀에는 안 적는다
    const 줄 = document.createElement("div");
    줄.textContent = "벤더피아 보기 — 짚어서 지시하기를 못 불렀습니다. 바이글에게 알려 주세요.";
    줄.style.cssText = "position:fixed;left:0;right:0;top:0;z-index:2147483647;background:#c92a2a;"
      + "color:#fff;font:600 13px/1.5 sans-serif;padding:8px 12px;text-align:center";
    (document.body || document.documentElement).appendChild(줄);
  })();
})();
