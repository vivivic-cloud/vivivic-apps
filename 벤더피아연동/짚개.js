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

  const s = document.createElement("script");
  s.src = "https://vivivic-cloud.github.io/vivivic-apps/shared/viggle.js";
  s.onerror = () => console.error("[벤더피아 보기] 짚어서 지시하기 손잡이를 못 불렀습니다");
  (document.head || document.documentElement).appendChild(s);
})();
