/* 배경 글 — 깃허브의 화면 글(.js·.css)을 받아 하우저 페이지에 넣어 준다. 벤더피아연동 `bg.js` 와 같은 방식.
   ⚠ 허락한 주소는 `https://vivivic-cloud.github.io/vivivic-apps/하우저연동/` 아래 .js·.css 뿐. 넓히지 마라.
   ⚠ 쿠키는 안 싣는다(credentials:"omit"). 부탁은 이 확장의 content script 만 받는다.
   ⚠ 못 받으면 확장 안에 든 같은 이름 파일을 넣는다(뒷길). 둘 다 안 되면 불러오기.js 가 붉은 줄을 띄운다.
   ⚠ 하우저 로그인 값(아이디·비밀번호)은 여기도 어디에도 읽지 않는다. */
const 집 = "https://vivivic-cloud.github.io/vivivic-apps/%ED%95%98%EC%9A%B0%EC%A0%80%EC%97%B0%EB%8F%99/";
const 허락 = (주소) => {
  try { const u = new URL(주소); return u.href.startsWith(집) && /\.(js|css)$/.test(u.pathname) && !u.pathname.includes(".."); }
  catch (e) { return false; }
};
const 받기 = async (주소) => {
  const 끊개 = new AbortController();
  const 시계 = setTimeout(() => 끊개.abort(), 5000);
  try {
    const r = await fetch(주소, { signal: 끊개.signal, credentials: "omit", cache: "no-cache" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.text();
  } catch (e) { throw new Error(e && e.name === "AbortError" ? "5초 안에 못 받음" : String((e && e.message) || e)); }
  finally { clearTimeout(시계); }
};
const 넣는토막 = (글, 이름) => {
  const R = document.documentElement;
  const 돌린 = (R.getAttribute("data-hw-글") || "").split("|");
  if (돌린.includes(이름)) return "이미";
  R.setAttribute("data-hw-글", 돌린.concat(이름).join("|"));
  const s = document.createElement("script");
  s.textContent = 글 + "\n//# sourceURL=" + 이름;
  R.appendChild(s); s.remove();
  return "돌림";
};

chrome.runtime.onMessage.addListener((m, 보낸이, 답) => {
  if (!m || m.__hw !== "글" || 보낸이.id !== chrome.runtime.id || !보낸이.tab) return;
  const 목록 = Array.isArray(m.목록) ? m.목록.slice(0, 16) : [];
  const 대상 = { tabId: 보낸이.tab.id, frameIds: [보낸이.frameId || 0] };
  (async () => {
    const 결과 = {};
    const 받는중 = 목록.map((이름) => {
      if (typeof 이름 !== "string" || !/^[^/\\]+\.(js|css)$/.test(이름)) return Promise.resolve({ e: "이름 이상" });
      const 주소 = 집 + encodeURIComponent(이름) + "?t=" + Math.floor(Date.now() / 60000);
      if (!허락(주소)) return Promise.resolve({ e: "허락 안 한 주소" });
      return 받기(주소).then((t) => ({ t }), (e) => ({ e: e.message }));
    });
    for (let i = 0; i < 목록.length; i++) {
      const 이름 = String(목록[i]), 낱 = await 받는중[i];
      const 꾸밈 = /\.css$/.test(이름);
      try {
        if (낱.t != null) {
          if (꾸밈) { await chrome.scripting.insertCSS({ target: 대상, css: 낱.t }); 결과[이름] = "깃"; }
          else {
            const [r] = await chrome.scripting.executeScript({ target: 대상, world: "MAIN", func: 넣는토막, args: [낱.t, 이름] });
            결과[이름] = (r && r.result === "이미") ? "이미" : "깃";
          }
        } else {                                              // 뒷길: 확장 안의 것
          if (꾸밈) await chrome.scripting.insertCSS({ target: 대상, files: [이름] });
          else await chrome.scripting.executeScript({ target: 대상, world: "MAIN", files: [이름] });
          결과[이름] = "확장(" + 낱.e + ")";
        }
      } catch (e) { 결과[이름] = "탈:" + String((e && e.message) || e).slice(0, 80); }
    }
    답({ 결과 });
  })();
  return true;
});
