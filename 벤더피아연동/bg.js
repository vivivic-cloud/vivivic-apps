/* 배경 글 — 깃허브 화면 글을 **받아서 벤더피아 페이지 세상(MAIN)에 넣어 주는** 일만 한다. (10-25 「GitHub 코드를 못 받는 문제」)

   왜 필요한가: 확장의 content script(따로인 세상)가 문서에 박는 `<script>` 는 **확장의 CSP**(`script-src 'self' …`)로 검사받아
   깃허브 주소도 인라인 글도 막힌다(요청이 나가기도 전에 실패). 배경 글이 `fetch` 로 받아 `chrome.scripting.executeScript`
   `world:"MAIN"` 으로 넣으면 **페이지 CSP** 로 검사받는다(벤더피아에는 없다). 불러오기.js·짚개.js 가 부탁한다.

   ⚠⚠ 허락한 주소는 **깃허브 페이지 한 집 `https://vivivic-cloud.github.io/vivivic-apps/` 아래 .js 뿐**이다. 넓히지 마라.
     쿠키는 안 싣는다(`credentials:"omit"`). 부탁은 우리 content script(`sender.id`가 이 확장)만 받는다.
   ⚠ 두 벌 방지: 넣기 전에 문서 뿌리 `data-vp-글` 에 그 파일 이름이 있으면 안 넣는다(확장 안 뒷길과 서로 본다). */
const 집 = "https://vivivic-cloud.github.io/vivivic-apps/";

const 허락한주소 = (주소) => {
  try {
    const u = new URL(주소);
    return u.href.startsWith(집) && /\.js$/.test(u.pathname) && !u.pathname.includes("..");
  } catch (e) { return false; }
};

const 받기 = async (주소) => {
  const 끊개 = new AbortController();
  const 시계 = setTimeout(() => 끊개.abort(), 5000);
  try {
    const r = await fetch(주소, { signal: 끊개.signal, credentials: "omit", cache: "no-cache" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.text();
  } catch (e) {
    throw new Error(e && e.name === "AbortError" ? "5초 안에 못 받음" : String(e && e.message || e));
  } finally { clearTimeout(시계); }
};

/* 페이지 세상(MAIN)에서 도는 토막 — 인자만 받는다(바깥 변수 못 씀) */
const 넣는토막 = (글, 이름) => {
  const R = document.documentElement;
  const 돌린 = (R.getAttribute("data-vp-글") || "").split("|");
  if (돌린.includes(이름)) return "이미";
  const 시험 = document.createElement("script");
  시험.textContent = 'document.documentElement.setAttribute("data-vp-인라인","1")';
  R.appendChild(시험); 시험.remove();
  if (R.getAttribute("data-vp-인라인") !== "1") return "탈:페이지가 인라인 글을 막음(CSP)";
  R.setAttribute("data-vp-글", 돌린.concat(이름).join("|"));
  const s = document.createElement("script");
  s.textContent = 글 + "\n//# sourceURL=" + 이름;
  R.appendChild(s); s.remove();
  return "돌림";
};

chrome.runtime.onMessage.addListener((m, 보낸이, 답) => {
  if (!m || m.__vp !== "깃글" || 보낸이.id !== chrome.runtime.id || !보낸이.tab) return;
  const 목록 = Array.isArray(m.목록) ? m.목록.slice(0, 16) : [];
  (async () => {
    const 결과 = {};
    // 받기는 한꺼번에, 넣기는 차례대로(vp-data.js 가 goods.js 보다 먼저여야 한다)
    const 받는중 = 목록.map((x) => {
      if (!x || typeof x.이름 !== "string" || !허락한주소(x.주소)) return Promise.resolve({ e: "허락 안 한 주소" });
      return 받기(x.주소).then((t) => ({ t }), (e) => ({ e: e.message }));
    });
    for (let i = 0; i < 목록.length; i++) {
      const 이름 = String(목록[i] && 목록[i].이름), 낱 = await 받는중[i];
      if (낱.t == null) { 결과[이름] = "탈:" + 낱.e; continue; }
      try {
        const [r] = await chrome.scripting.executeScript({
          target: { tabId: 보낸이.tab.id, frameIds: [보낸이.frameId || 0] },
          world: "MAIN", func: 넣는토막, args: [낱.t, 이름],
        });
        결과[이름] = (r && r.result) || "탈:넣은 답 없음";
      } catch (e) { 결과[이름] = "탈:넣기 실패 " + String(e && e.message || e).slice(0, 80); }
    }
    답({ 결과 });
  })();
  return true;
});
