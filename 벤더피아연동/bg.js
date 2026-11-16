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

/* ── 서류관리에 「벤더피아 로그인돼 있나 · 누구인가」 알려 주기 (11-02 [새 지시 서류관리로그인]) ──────────
   사장님: 「프로그램이 시작되면 벤더피아연동의 로그인이 되어야 서류관리 화면이 열리게 … 벤더피아아이디로 로그인이 되면
            해당 연동프로그램은 화면에 보이지 않지만 로그인이 유지된체로 백에서 작동 합니다」.
   · 묻는 쪽 = `서류다리.js`(서류관리 페이지의 content script)뿐. sender 가 이 확장 + 서류관리 주소일 때만 답한다.
   · 벤더피아 `/index.aspx` 를 **사장님 크롬의 벤더피아 쿠키를 실어** GET 한다(조회만). 틀이면 안쪽 frame 쪽도 차례로(4개까지).
       로그인 칸(`txtID`)이 보이면 → 안 됨 · 메뉴 「배송관리」 나 틀(로그인 칸 없음)이 보이면 → 됨 · 둘 다 아니면 → 모름(null).
     이 GET 이 벤더피아 세션을 늘려 준다 — 서류관리가 열려 있는 동안 5분마다 물으니 그동안 로그인이 안 끊긴다.
   · 아이디 = login.js 가 우리 로그인 칸에서 **아이디만** 적어 둔 `vpWho`(chrome.storage.local). 비밀번호는 어디에도 안 적는다.
     이름 = 벤더피아 쪽 글에서 「OOO님」 을 찾으면(못 찾으면 빈칸 — 11-02 진짜 화면에서 자리를 못 봄).
   ⚠ 쿠키·벤더피아 글은 서류관리로 **안 넘긴다** — 답은 { 로그인, 아이디, 이름, 까닭, 판 } 뿐. */
const 서류집 = "https://vivivic-cloud.github.io/vivivic-docs/";
const 벤더피아집 = "https://vendorpia.com";
let 누구중 = null, 누구때 = 0, 누구답 = null;

const 벤더피아받기 = async (주소) => {
  const 끊개 = new AbortController();
  const 시계 = setTimeout(() => 끊개.abort(), 8000);
  try {
    const r = await fetch(주소, { signal: 끊개.signal, credentials: "include", cache: "no-store", redirect: "follow" });
    return { 주소: r.url, 글: (await r.text()).slice(0, 400000), ok: r.ok, status: r.status };
  } finally { clearTimeout(시계); }
};
const 로그인칸 = (글) => /\bid\s*=\s*["']?txtID\b/i.test(글) || /\bid\s*=\s*["']?frmSign\b/i.test(글);
const 메뉴있나 = (글) => />\s*배송관리\s*</.test(글);
const 틀주소들 = (글, 바탕) => [...글.matchAll(/<i?frame\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)]
  .map((m) => { try { return new URL(m[1].replace(/&amp;/g, "&"), 바탕).href; } catch (e) { return ""; } })
  .filter((u) => u.startsWith(벤더피아집 + "/") || u.startsWith("https://www.vendorpia.com/"));
const 이름찾기 = (글) => {
  const 맨글 = 글.replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ");
  for (const m of 맨글.matchAll(/([가-힣]{2,5}|[A-Za-z][\w.]{1,19})\s*님/g))
    if (!/^(고객|회원|사용자|관리자|담당자|사장|선생)$/.test(m[1])) return m[1];
  return "";
};

async function 벤더피아누구() {
  const 판 = chrome.runtime.getManifest().version;
  let 누구 = {};
  try { 누구 = (await chrome.storage.local.get("vpWho")).vpWho || {}; } catch (e) {}
  const 아이디 = typeof 누구.id === "string" ? 누구.id.slice(0, 40) : "";
  try {
    const 첫 = await 벤더피아받기(벤더피아집 + "/index.aspx");
    const 쪽들 = [첫];
    for (const u of 틀주소들(첫.글, 첫.주소).slice(0, 4)) {
      try { 쪽들.push(await 벤더피아받기(u)); } catch (e) {}
    }
    if (쪽들.some((x) => 로그인칸(x.글))) return { 로그인: false, 아이디, 이름: "", 까닭: "로그인 화면", 판 };
    const 됨 = 쪽들.some((x) => 메뉴있나(x.글)) || 쪽들.length > 1;
    let 이름 = "";
    for (const x of 쪽들) if ((이름 = 이름찾기(x.글))) break;
    if (됨) return { 로그인: true, 아이디, 이름, 까닭: "", 판 };
    return { 로그인: null, 아이디, 이름, 까닭: "모름 " + 첫.status, 판 };
  } catch (e) {
    return { 로그인: null, 아이디, 이름: "", 까닭: "못 닿음 " + String(e && e.message || e).slice(0, 40), 판 };
  }
}

chrome.runtime.onMessage.addListener((m, 보낸이, 답) => {
  if (!m || m.__vp !== "벤더피아누구" || 보낸이.id !== chrome.runtime.id) return;
  if (!String(보낸이.url || 보낸이.origin || "").startsWith(서류집)) return;
  // 3초 안에 다시 물으면 같은 답(탭 여럿·겹쳐 물음). 「다시」 는 그 3초를 건너뛴다.
  if (!m.다시 && 누구답 && Date.now() - 누구때 < 3000) { 답(누구답); return; }
  if (!누구중) 누구중 = 벤더피아누구().then((r) => { 누구답 = r; 누구때 = Date.now(); 누구중 = null; return r; });
  누구중.then(답);
  return true;
});

/* ── 발주역입력 재단에 「벤더피아연동 단품관리 목록」 건네기 (11-16 [단품다리], 0.35.0) ──────────
   사장님: 「벤더피아 아이디로 로그인하게 하고, 벤더피아연동의 단품관리 페이지에 따라서 연동되어 검색되도록 해 주세요.」
   · 묻는 쪽 = `단품다리.js`(github.io `/vivivic-apps/발주역입력/` 의 content script)뿐. sender 가 이 확장 + 그 주소일 때만 답한다.
   · 차례: ① 로그인 확인 = 서류관리와 같은 `벤더피아누구()`(벤더피아 `/index.aspx` 조회). 로그인 아니면 목록 없이 { 로그인:false }.
           ② 단품관리 화면과 **같은 저장**(`vpCache:/System/Master/goods.aspx|단품명|{}||2000-01-01|<오늘>`)에 오늘 받은 것이 있으면 그것.
              「다시」 면 그 단품관리 저장(`vpCache:/System/Master/goods.aspx|단품명|…`)만 먼저 지운다 — 단품관리 화면을 새로고침한 것과 같은 뜻.
           ③ 없으면 화면 없는 문서(`단품받기.html`, offscreen DOM_PARSER)에서 vp-data.js `list()` 를 단품관리 미리 받기와 같은 조건으로 돌려
              벤더피아에 새로 묻고(사장님 크롬의 벤더피아 쿠키), 같은 열쇠에 담긴 것을 읽어 건넨다. 끝나면 그 문서를 닫는다.
   · 건네는 줄 = [단품코드, 단품명, 판매상태] 세 칸만. 같은 코드 여러 줄은 하나로, 차례 = 중지 아닌 것 먼저 · 단품명 가나다 · 코드
     (goods.js `단품목록짓기` 와 같은 차례).
   ⚠ 받은 목록은 **페이지(그 탭)로만** 간다. 창고·바깥으로 안 보낸다. */
const 단품쪽 = "https://vivivic-cloud.github.io/vivivic-apps/발주역입력/";
const 단품주소 = "/System/Master/goods.aspx";
const 단품열쇠앞 = "vpCache:" + 단품주소 + "|단품명|";
const 오늘글 = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const 단품열쇠 = () => 단품열쇠앞 + "{}||2000-01-01|" + 오늘글();
const 받기문서 = "단품받기.html";
let 단품중 = null;

const 단품세칸 = (hit) => {
  const h = (hit && hit.heads) || [], ci = h.indexOf("단품코드"), ni = h.indexOf("단품명"), si = h.indexOf("판매상태");
  if (ci < 0 || ni < 0) return null;
  const m = new Map();
  for (const r of hit.rows || []) {
    const c = String(r[ci] == null ? "" : r[ci]).trim(), n = String(r[ni] == null ? "" : r[ni]).trim();
    if (!c || !n || n === "합계") continue;
    m.set(c, [c, n, si < 0 ? "" : String(r[si] == null ? "" : r[si]).trim()]);
  }
  return [...m.values()].sort((a, b) => (a[2] === "중지") - (b[2] === "중지")
    || a[1].localeCompare(b[1], "ko", { numeric: true }) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
};

async function 화면없이받기() {
  const 주소 = chrome.runtime.getURL(받기문서);
  try {
    const 있나 = await chrome.runtime.getContexts({ contextTypes: ["OFFSCREEN_DOCUMENT"], documentUrls: [주소] });
    if (!있나.length) await chrome.offscreen.createDocument({ url: 받기문서, reasons: ["DOM_PARSER"], justification: "벤더피아 단품관리 목록을 단품관리 화면과 같은 방식으로 받아 읽는다" });
    return await chrome.runtime.sendMessage({ __vp: "단품받기시작" });
  } finally {
    try { await chrome.offscreen.closeDocument(); } catch (e) {}
  }
}

async function 단품목록주기(다시) {
  const 판 = chrome.runtime.getManifest().version;
  const 누구 = await 벤더피아누구();
  if (누구.로그인 !== true) return { 로그인: 누구.로그인, 까닭: 누구.까닭 || "", 판 };
  if (다시) {
    const 다 = await chrome.storage.local.get(null);
    await chrome.storage.local.remove(Object.keys(다).filter((k) => k.startsWith(단품열쇠앞)));
  }
  const 열쇠 = 단품열쇠();
  let hit = (await chrome.storage.local.get(열쇠))[열쇠];
  let 까닭 = "";
  if (!hit) {
    const r = await 화면없이받기().catch((e) => ({ 됨: false, 까닭: String(e && e.message || e).slice(0, 80) }));
    if (!r || !r.됨) 까닭 = (r && r.까닭) || "받지 못함";
    hit = (await chrome.storage.local.get(열쇠))[열쇠];
  }
  const 줄 = hit ? 단품세칸(hit) : null;
  if (!줄) return { 로그인: true, 까닭: 까닭 || "단품관리 목록이 비었습니다", 판 };
  return { 로그인: true, 까닭: "", 판, 받은때: hit.at || null, 줄 };
}

chrome.runtime.onMessage.addListener((m, 보낸이, 답) => {
  if (!m || 보낸이.id !== chrome.runtime.id) return;
  if (m.__vp === "단품목록") {
    let 쪽 = "";
    try { 쪽 = decodeURI(String(보낸이.url || "")); } catch (e) { return; }
    if (!쪽.startsWith(단품쪽)) return;
    // 탭 여럿이 겹쳐 물으면 하나로(벤더피아에 같은 조회를 두 번 안 보낸다). 「다시」 가 아니면 진행 중인 것을 같이 기다린다.
    // 「다시」 는 진행 중인 것이 끝난 뒤에 이어서(화면 없는 문서는 한 번에 하나뿐).
    if (!단품중 || m.다시) {
      const 앞 = 단품중 || Promise.resolve();
      const 새 = 앞.catch(() => {}).then(() => 단품목록주기(!!m.다시))
        .catch((e) => ({ 로그인: null, 까닭: "탈 " + String(e && e.message || e).slice(0, 60) }));
      단품중 = 새;
      새.then(() => { if (단품중 === 새) 단품중 = null; });
    }
    단품중.then(답);
    return true;
  }
  if (m.__vp === "단품받기저장") {
    // 화면 없는 문서(단품받기.html)의 VP저장 — 그 문서에서 온 것만. 단품관리 저장 열쇠만 쓰게 한다.
    if (String(보낸이.url || "") !== chrome.runtime.getURL(받기문서)) return;
    const s = chrome.storage.local;
    const 열쇠만 = (k) => typeof k === "string" && k.startsWith(단품열쇠앞);
    (async () => {
      if (m.일 === "get") {
        if (m.열쇠 === null) { const 다 = await s.get(null); const 남 = {}; for (const k of Object.keys(다)) if (열쇠만(k)) 남[k] = 다[k]; return 남; }
        return 열쇠만(m.열쇠) ? await s.get(m.열쇠) : {};
      }
      if (m.일 === "set") { const v = m.값 || {}; if (Object.keys(v).every(열쇠만)) await s.set(v); return null; }
      if (m.일 === "remove") { const k = [].concat(m.열쇠 || []).filter(열쇠만); if (k.length) await s.remove(k); return null; }
      return null;
    })().then(답, () => 답(null));
    return true;
  }
});
