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

/* ── 벤더피아 자료 읽기 (0.6.0, 11-16) ───────────────────────────────────────────
   벤더피아연동이 이미 올려 둔 납품내역 창고(Firestore `납품내역_상품목록`·`납품내역_단품목록`)를 **읽기만** 한다 — 서류관리·벤더피아연동과 같은 길
   (익명 표 → 창고 읽기). 하우저 페이지는 그 주소로 못 나갈 수 있어 확장 배경이 대신 받는다. 받은 것 가운데 **하우저 상품과 맞은 것만** 페이지로 돌려준다.
   ⚠ 쓰기 없음. 하우저·벤더피아 로그인 값은 안 읽는다. 표(토큰)는 페이지로 안 보낸다. 새 판 번호를 올려도 이 길은 확장 안(bg.js·manifest·불러오기.js)이라 덮어쓰기+↻ 필요. */
const 창키 = "AIzaSyB9X_hzd2D3goQ7oenK53Pz805P1c7oSqs", 창집 = "vivivic-4b7ef";
let 표 = null;
const 표받기 = async () => {
  if (표 && 표.until > Date.now() + 60000) return 표.tok;
  const r = await fetch("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" + 창키, { method: "POST", credentials: "omit",
    headers: { "Content-Type": "application/json" }, body: JSON.stringify({ returnSecureToken: true }) });
  if (!r.ok) throw new Error("표 " + r.status);
  const d = await r.json(); if (!d.idToken) throw new Error("표 없음");
  표 = { tok: d.idToken, until: Date.now() + 3300000 }; return d.idToken;
};
const 창고읽기 = async (칸, 앞) => {
  const tok = await 표받기(), 줄들 = []; let 정보 = {}, 쪽 = "";
  for (let i = 0; i < 40; i++) {
    const r = await fetch("https://firestore.googleapis.com/v1/projects/" + 창집 + "/databases/(default)/documents/artifacts/" + 창집 + "/public/data/" + encodeURIComponent(칸)
      + "?pageSize=300" + (쪽 ? "&pageToken=" + encodeURIComponent(쪽) : ""), { credentials: "omit", headers: { Authorization: "Bearer " + tok } });
    if (!r.ok) throw new Error(칸 + " 읽기 " + r.status);
    const j = await r.json();
    for (const d of (j.documents || [])) {
      const 이름 = decodeURIComponent(String(d.name || "").split("/").pop()), f = d.fields || {};
      if (이름 === "_정보") 정보 = { 올린때: (f.올린때 || {}).stringValue || "" };
      else if (이름.startsWith(앞)) for (const v of (((f.줄 || {}).arrayValue || {}).values || [])) if (v.stringValue) 줄들.push(v.stringValue.split("\t"));
    }
    쪽 = j.nextPageToken || ""; if (!쪽) break;
  }
  return { 줄들, 정보 };
};
const 정규 = (s) => String(s || "").toLowerCase().replace(/[^0-9a-z가-힣]/g, "");
const 벤더피아맞추기 = async (목록) => {
  const [상, 단] = await Promise.all([창고읽기("납품내역_상품목록", "상품_"), 창고읽기("납품내역_단품목록", "단품_")]);
  const 번호별 = new Map(), 이름별 = new Map();                      // 하우저 상품번호 → 상품 / 정규 이름 → 상품들
  for (const [코드, 이름, 상태, 단품] of 상.줄들) {
    const 상품 = { 코드, 이름, 상태: 상태 || "", 단품: (단품 || "").split(",").map((x) => x.trim()).filter(Boolean) };
    const m = /^h?(\d{5,8})$/i.exec(String(코드 || "").trim());
    if (m) { const 전 = 번호별.get(m[1]); if (!전) 번호별.set(m[1], { 이름, 상태: 상품.상태, 코드: [코드], 단품: 상품.단품 }); else { 전.코드.push(코드); if (!전.단품.length) 전.단품 = 상품.단품; } }
    const k = 정규(이름); if (k) { if (!이름별.has(k)) 이름별.set(k, []); 이름별.get(k).push(상품); }
  }
  const 단품표 = new Map();
  for (const [코드, 이름, 상태] of 단.줄들) if (코드) 단품표.set(String(코드).trim().toLowerCase(), { 이름, 상태: 상태 || "" });
  const 맞음 = {};
  for (const x of 목록) {
    let 길 = "", 상품 = 번호별.get(String(x.번)) || null;
    if (상품) 길 = "번호";
    else { const c = (이름별.get(정규(x.이름)) || []); if (c.length && new Set(c.map((y) => y.이름)).size === 1) { 상품 = { 이름: c[0].이름, 상태: c[0].상태, 코드: c.map((y) => y.코드), 단품: c[0].단품 }; 길 = "이름"; } }
    if (!상품) continue;
    const 셈 = new Map(); for (const 코드 of 상품.단품) 셈.set(코드, (셈.get(코드) || 0) + 1);
    맞음[x.번] = { 길, 이름: 상품.이름, 상태: 상품.상태, 코드: [...new Set(상품.코드)],
      단품: [...셈].map(([코드, 수]) => { const t = 단품표.get(코드.toLowerCase()); return { 코드, 이름: t ? t.이름 : "", 상태: t ? t.상태 : "", 수 }; }) };
  }
  return { ok: true, 올린때: 상.정보.올린때 || "", 상품수: 상.줄들.length, 단품수: 단.줄들.length, 맞음 };
};
chrome.runtime.onMessage.addListener((m, 보낸이, 답) => {
  if (!m || m.__hw !== "벤더피아" || 보낸이.id !== chrome.runtime.id || !보낸이.tab) return;
  const 목록 = (Array.isArray(m.목록) ? m.목록 : []).slice(0, 1000).map((x) => ({ 번: String((x && x.번) || "").slice(0, 20), 이름: String((x && x.이름) || "").slice(0, 200) }));
  벤더피아맞추기(목록).then(답, (e) => 답({ ok: false, 까닭: String((e && e.message) || e).slice(0, 120) }));
  return true;
});
