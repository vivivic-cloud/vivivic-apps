// MD팀 — 아이엔지홈 제품리스트(엑셀 4시트)를 시트별 탭 표로. 메인 메뉴 「MD팀」 = orderMst.aspx#vgMD (search.js 가 부른다)
/* 11-27 [새 지시 MD팀] 사장님(그대로):
     「벤더피아메인 에 MD팀 메뉴를 만들어서 제공한파일의 기능 그대로 페이지를 만들어 목록을 보여주세요. 제공파일의 제품명열값과 벤더피아상품관리의 상품명버튼과 일치시 해당 버튼이 나타나게해주세요」
     「모든시트 시트별로 구분해서 페이지 보여주세요」
   자료 = 우리 Firestore 창고 `artifacts/vivivic-4b7ef/public/data/mdteam_inghome` (`info` + `c1…cn` 조각의 `j` 를 이어 붙인 JSON).
     만드는 글 = `MD팀올리기.py`(엑셀 → JSON → 창고). ⚠ 공개 저장소·Pages 에 자료를 두지 않는다(업무 자료 — 사은품 공급가 등).
   읽기만 한다: 창고 GET(확장 다리 `VP밖에` 먼저) · 벤더피아에는 이름 단추(goods.js 곁다리 — CS등록과 같은 것)가 공용 줄로 조회만.
   표 = `table.vp-촘촘` + `VP표.넓이틀`(열 끌기·넓이 기억 `vp열넓이:MD팀:<시트>`·표 안 가로 스크롤·화면 아래 밀대).
   엑셀 그대로: 칸·차례(숨은 열 B 「순서」 뺌 — 제품리스트) · 계산된 값과 숫자 꼴(#,##0 · 0%) · 셀 색·글 색·굵게 ·
     조건부 서식(같은 상품코드 = 굵은 빨강) · 하이퍼링크(새 탭) · 병합(첫 칸 값)
     (0.35.23 [새 지시 MD팀표동일] 머리는 배송·CS 표처럼 한 줄 — 위 머리(할인판매가·배송비)는 칸 title · 엑셀 가로 맞춤·병합 선 지움은 안 씀) · 자동필터가 있는 시트만 칸별 거르개(▾).
   화면에 설명 글 없음 — 색의 까닭(파일 2행 「색상표기건: …」)은 칸에 마우스를 올리면. */
(() => {
  if (window.__vpMD팀) return;
  window.__vpMD팀 = true;
  const KEY = "AIzaSyB9X_hzd2D3goQ7oenK53Pz805P1c7oSqs", PROJ = "vivivic-4b7ef";
  const 창고 = `https://firestore.googleapis.com/v1/projects/${PROJ}/databases/(default)/documents/artifacts/${PROJ}/public/data/mdteam_inghome`;
  const 말 = (t) => window.VP말?.("MD팀:" + t);

  const 꼴글 = `
#vp-root .vp-md탭 { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 4px; margin: 0 0 6px; padding: 4px; max-width: 100%; box-sizing: border-box;
  border: 1px solid #ededeb; border-radius: 8px; background: #f7f6f3; }
#vp-root .vp-md탭 button { width: auto; margin: 0; padding: 6px 14px; border: 0; border-radius: 6px; background: transparent; box-shadow: none;
  font: 700 13px/1.3 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #787774; white-space: nowrap; cursor: pointer; transition: all .2s; }
#vp-root .vp-md탭 button[aria-selected="true"] { background: #ffffff; color: #37352f; box-shadow: 0 1px 3px rgba(0,0,0,0.08), inset 0 0 0 1px #ededeb; }
@media (max-width: 767px) {
  #vp-root .vp-md탭 { display: flex; flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
  #vp-root .vp-md탭::-webkit-scrollbar { display: none; }
  #vp-root .vp-md탭 button { padding: 7px 12px; font-size: 12px; flex-shrink: 0; }
}
#vp-root .vp-md메모 { display: flex; flex-wrap: wrap; gap: 4px 12px; font: 12px/18px "Microsoft Sans Serif", 돋움, sans-serif; color: #000; margin: 0 0 2px; }
#vp-root .vp-md엑셀명 { margin-left: 4px; font-size: 10px; line-height: 13px; color: #787774; vertical-align: top; }
#vp-root .vp-md메모:empty { display: none; }
#vp-root .vp-md검색판 { position: fixed; z-index: 60; padding: 3px; background: #fff; border: 1px solid #b0b0b0; border-radius: 4px; box-shadow: 0 4px 14px rgba(0,0,0,.18); }
#vp-root .vp-md검색판 button { display: block; width: auto; margin: 0; padding: 4px 16px; font: 12px/18px "Microsoft Sans Serif", 돋움, sans-serif; color: #000; background: #fff; border: 0; border-radius: 3px; cursor: pointer; }
#vp-root .vp-md검색판 button:hover { background: #2383e2; color: #fff; }
#vp-root .vp-md사방넷[hidden], #vp-root .vp-md사방넷줄[hidden] { display: none !important; }
#vp-root .vp-md사방넷줄 { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 14px; margin: 2px 0 8px; font: 12px/24px "Microsoft Sans Serif", 돋움, sans-serif; color: #37352f; }
#vp-root .vp-md사방넷됨 { color: #086788; font-weight: 700; }
#vp-root .vp-md사방넷안됨 { color: #DD1C1A; font-weight: 700; }
#vp-root .vp-md사방넷단추 { width: auto; margin: 0; padding: 3px 12px; font: 700 12px/18px 'Inter', -apple-system, sans-serif; color: #fff; background: #37352f; border: 0; border-radius: 4px; cursor: pointer; }
#vp-root .vp-md사방넷단추:disabled { opacity: .5; cursor: default; }
#vp-root table.vp-촘촘.vp-md표 td .vp-md링크옛 { color: #DD1C1A !important; }
#vp-root table.vp-촘촘.vp-md표 td .vp-md링크사방넷 { margin-left: 8px; }
#vp-root table.vp-촘촘.vp-md표 td .vp-md후보 { display: inline-flex; align-items: center; gap: 3px; margin-right: 10px; color: #9b9a97; white-space: nowrap; cursor: pointer; }
#vp-root table.vp-촘촘.vp-md표 td .vp-md후보 input { width: auto; height: auto; margin: 0; padding: 0; flex: none; cursor: pointer; }
#vp-root table.vp-촘촘.vp-md표 td.vp-md링크못함 { outline: 1px solid #DD1C1A; outline-offset: -1px; }
#vp-root table.vp-촘촘.vp-md표 td input.vp-md링크입력 { width: 100%; min-width: 240px; box-sizing: border-box; margin: 0; padding: 0 3px; height: 20px; font: inherit; border: 1px solid #2383e2; border-radius: 2px; }
#vp-root .vp-md메모 span { padding: 0 3px; white-space: pre; }
#vp-root .vp-table[hidden] { display: none !important; }
#vp-root table.vp-촘촘.vp-md표 th .vp-md거름 { position: absolute; right: 7px; top: 50%; transform: translateY(-50%); width: 15px; height: 15px; margin: 0; padding: 0;
  font: 9px/13px sans-serif; color: #555; background: #fff; border: 1px solid #b0b0b0; border-radius: 2px; cursor: pointer; }
#vp-root table.vp-촘촘.vp-md표 th.vp-md거름칸 { padding-right: 24px; }
#vp-root table.vp-촘촘.vp-md표 th .vp-md거름.vp-md거름켬 { background: #2383e2; border-color: #2383e2; color: #fff; }
#vp-root .vp-md거름판 { position: fixed; z-index: 50; width: 240px; max-width: calc(100vw - 16px); background: #fff; border: 1px solid #b0b0b0; border-radius: 4px;
  box-shadow: 0 4px 14px rgba(0,0,0,.18); padding: 8px; font: 12px/1.4 "Microsoft Sans Serif", 돋움, sans-serif; color: #000; }
#vp-root .vp-md거름판 input[type=search] { display: block; width: 100%; box-sizing: border-box; margin: 0 0 6px; padding: 4px 6px; font-size: 12px; border: 1px solid #c0c0c0; border-radius: 3px; }
#vp-root .vp-md거름판 .vp-md값들 { max-height: 260px; overflow: auto; border: 1px solid #e3e2e0; padding: 2px 4px; }
#vp-root .vp-md거름판 label { display: flex; gap: 5px; align-items: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; padding: 1px 0; font-size: 12px; }
#vp-root .vp-md거름판 label input { width: auto; margin: 0; padding: 0; flex: none; }
#vp-root .vp-md거름판 .vp-md단추들 { display: flex; justify-content: flex-end; gap: 6px; margin-top: 8px; }
#vp-root .vp-md거름판 .vp-md단추들 button { width: auto; margin: 0; padding: 4px 12px; font-size: 12px; border: 1px solid #c0c0c0; border-radius: 3px; background: #f5f5f5; cursor: pointer; }
#vp-root .vp-md거름판 .vp-md단추들 button.vp-md확인 { background: #37352f; color: #fff; border-color: #37352f; }`;

  const r = document.createElement("div");
  r.id = "vp-root";
  r.className = "vp-wide vp-촘촘쪽 vp-md팀";
  r.innerHTML = `
    <div class="vp-search">
      <a class="vp-home" href="/index.aspx">← 메인</a>
      <h1>MD팀</h1>
      <div class="vp-md탭" role="tablist"></div>
      <div class="vp-md메모"></div>
      <div class="vp-note">불러오는 중…</div>
    </div>`;
  const st = document.createElement("style");
  st.id = "vp-md꼴";
  st.textContent = 꼴글;
  (document.head || document.documentElement).appendChild(st);
  document.body.appendChild(r);
  document.documentElement.classList.add("vp-clean");
  const 쪽 = r.querySelector(".vp-search"), 탭칸 = r.querySelector(".vp-md탭"), 메모칸 = r.querySelector(".vp-md메모"), 알림 = r.querySelector(".vp-note");

  /* ── 창고 읽기 (goods.js 서류표·search.js 상담로그인과 같은 길: 표 `vg.tok` 같이 씀 · 확장 다리 먼저) ── */
  async function 밖에(주소, 옵션) {
    if (window.VP밖에) {
      const 답 = await window.VP밖에(주소, 옵션 || null);
      if (답 && 답.다리) return 답;
    }
    const x = await fetch(주소, Object.assign({ credentials: "omit" }, 옵션 || {}));
    return { ok: x.ok, status: x.status, 글: await x.text() };
  }
  async function 표받기() {
    try {
      const 둔것 = JSON.parse(localStorage.getItem("vg.tok") || "null");
      if (둔것 && 둔것.until > Date.now() + 60000) return 둔것.tok;
    } catch (e) {}
    const 답 = await 밖에(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${KEY}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ returnSecureToken: true }) });
    if (!답.ok) throw new Error("표 " + 답.status);
    const d = JSON.parse(답.글);
    if (!d.idToken) throw new Error("표 없음");
    try { localStorage.setItem("vg.tok", JSON.stringify({ tok: d.idToken, until: Date.now() + 3300000 })); } catch (e) {}
    return d.idToken;
  }
  /* ── 「스마트스토어 url」 칸 (11-27 [새 지시 MD팀스마트스토어칸]) ──
     값 차례: 화면 입력(창고 `mdteam_inghome_link`, 문서 = 상품코드마다 {code,url,at}) > 엑셀 E열(그대로 고정).
     엑셀을 다시 올려도(`MD팀올리기.py` 는 `mdteam_inghome` 만 덮어씀) 화면 입력은 남는다.
     사방넷 링크(창고 `mdteam_inghome_sabang/links`, `MD팀사방넷링크올리기.py`) 와 견줌 — 스마트스토어 상품번호로:
       값 없음 → 사방넷 링크를 넣어 보임 · 같음 → 그대로 · 다름 → 기존 값 빨강 + 사방넷 링크 함께(까닭은 마우스 올림).
     고치기 = 칸을 두 번 누름 → 입력 → Enter(저장)·Esc(그만). 비우거나 엑셀 값으로 되돌리고 저장하면 화면 입력을 지움. */
  const 링크창고 = 창고 + "_link", 사방넷창고 = 창고 + "_sabang/links";
  const 문서이름 = (code) => "c_" + [...new TextEncoder().encode(code)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const 링크번호 = (u) => { const m = String(u || "").match(/\/products\/(\d+)/); return m ? m[1] : ""; };
  const 사방넷주소 = (n) => "https://smartstore.naver.com/inggagu/products/" + n;
  let 사방넷링크 = {}, 파일링크 = {};      // 파일링크 = 스마트스토어 상품 파일(`MD팀스마트스토어올리기.py` → 창고 `mdteam_inghome_ss/links`) {판매자상품코드: [상품번호, 상품명]}
  const 파일창고 = 창고 + "_ss/links";
  /* 11-27 [새 지시 MD팀후보체크] 후보링크 = 창고 `mdteam_inghome_cand/links` {상품코드: [[스마트스토어 상품번호, 스마트스토어 옵션 글], …]}
     (사방넷 단품코드매핑관리: 스마트스토어 상품+옵션 → 사방넷 단품 → 옵션별칭·자체상품코드 = 상품코드, 지금 스마트스토어 상품 파일에 있는 번호만) */
  let 후보링크 = {};
  const 후보창고 = 창고 + "_cand/links";
  const 입력링크 = new Map();
  async function 링크자료받기() {
    const tok = await 표받기();
    const [가, 나, 다, 라] = await Promise.all([
      밖에(사방넷창고, { headers: { Authorization: "Bearer " + tok } }).catch(() => null),
      (async () => {
        const 모음 = []; let 다음 = "";
        for (let i = 0; i < 20; i++) {
          const 답 = await 밖에(링크창고 + "?pageSize=300" + (다음 ? "&pageToken=" + encodeURIComponent(다음) : ""), { headers: { Authorization: "Bearer " + tok } });
          if (!답.ok) break;
          const d = JSON.parse(답.글 || "{}");
          모음.push(...(d.documents || []));
          if (!(다음 = d.nextPageToken)) break;
        }
        return 모음;
      })().catch(() => []),
      밖에(파일창고, { headers: { Authorization: "Bearer " + tok } }).catch(() => null),
      밖에(후보창고, { headers: { Authorization: "Bearer " + tok } }).catch(() => null),
    ]);
    try { if (라 && 라.ok) 후보링크 = JSON.parse(((JSON.parse(라.글).fields || {}).j || {}).stringValue || "{}"); } catch (e) {}
    try { if (가 && 가.ok) 사방넷링크 = JSON.parse(((JSON.parse(가.글).fields || {}).j || {}).stringValue || "{}"); } catch (e) {}
    try { if (다 && 다.ok) 파일링크 = JSON.parse(((JSON.parse(다.글).fields || {}).j || {}).stringValue || "{}"); } catch (e) {}
    for (const d of 나) {
      const f = d.fields || {};
      const code = f.code && f.code.stringValue;
      if (code) 입력링크.set(code, (f.url && f.url.stringValue) || "");
    }
  }
  /* 쓰기는 확장 다리(`VP밖에`)를 거치지 않고 화면에서 창고로 바로 보낸다 — 다리는 쓰기를 `vpcs_note` 한 곳만 받는다(불러오기.js ⑧, 넓히지 않음).
     11-27 벤더피아 orderMst.aspx 에는 창고를 막는 CSP 가 없다(화면에서 바로 GET → 403 = 길은 열림). 창고 규칙: `mdteam_` 칸 = 로그인(익명 표)한 누구나 읽기·쓰기. */
  async function 링크저장(code, url) {
    const tok = await 표받기();
    const 주소 = 링크창고 + "/" + 문서이름(code);
    const 옵션 = url
      ? { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: "Bearer " + tok },
          body: JSON.stringify({ fields: { code: { stringValue: code }, url: { stringValue: url }, at: { stringValue: new Date().toISOString() } } }) }
      : { method: "DELETE", headers: { Authorization: "Bearer " + tok } };
    const x = await fetch(주소, Object.assign({ credentials: "omit" }, 옵션));
    const 답 = { ok: x.ok, status: x.status };
    if (!답.ok) throw new Error("저장 " + 답.status);
    if (url) 입력링크.set(code, url); else 입력링크.delete(code);
  }
  const 링크칸들 = [];             // {td, code, 엑셀:[글, 꼴, 링크], 시트, 상태}
  function 링크칸그리기(칸) {
    const { td, code } = 칸;
    const 입력 = !!code && 입력링크.has(code);
    const 글 = 입력 ? 입력링크.get(code) : 셀값(칸.엑셀);
    const 링 = 입력 ? 입력링크.get(code) : 셀링크(칸.엑셀);
    const 사 = code ? 사방넷링크[code] : null;
    const 사번 = 사 ? String(사[0]) : "";
    /* 11-27 [새 지시 MD팀스마트스토어파일] 견줄 링크 = 사방넷 링크 + 스마트스토어 상품 파일(판매자상품코드 = 이 줄 상품코드) — 상품번호로 겹침 뺌 */
    const 스 = code ? 파일링크[code] : null;
    const 견줄 = [];
    if (사번) 견줄.push({ n: 사번, 출처: "사방넷", 까닭: "사방넷 품번 " + 사[1] + " 스마트스토어 링크" });
    if (스 && !견줄.some((x) => x.n === String(스[0]))) 견줄.push({ n: String(스[0]), 출처: "파일", 까닭: "스마트스토어 상품 파일 — 판매자상품코드 " + code + (스[1] ? " · " + 스[1] : "") });
    const 지금번 = 링크번호(링 || 글);
    const 새a = (주소, 보일글, 까닭) => {
      const a = document.createElement("a");
      a.href = 주소; a.target = "_blank"; a.rel = "noopener"; a.textContent = 보일글;
      a.style.color = "inherit"; a.style.textDecoration = "none";
      if (까닭) a.title = 까닭;
      return a;
    };
    const 기존 = () => {
      if (링) {
        const a = 새a(링, 글);
        if (!입력) { const k = 셀꼴(칸.엑셀); a.style.color = (k && k.f) || "inherit"; a.style.textDecoration = k && k.u ? "underline" : "none"; }
        return a;
      }
      const sp = document.createElement("span"); sp.textContent = 글; return sp;
    };
    td.replaceChildren();
    td.classList.remove("vp-md링크다름", "vp-md링크채움", "vp-md링크못함");
    칸.상태 = ""; 칸.출처 = "";
    const 견줄a = (x, i) => { const a = td.appendChild(새a(사방넷주소(x.n), 사방넷주소(x.n), x.까닭)); if (i) a.classList.add("vp-md링크사방넷"); return a; };
    if (!String(글).trim()) {
      if (견줄.length) { 견줄.forEach(견줄a); 칸.상태 = "채움"; 칸.출처 = 견줄.map((x) => x.출처).join("+"); td.classList.add("vp-md링크채움"); }
      else if (code && 후보링크[code] && 후보링크[code].length) {
        /* 11-27 [새 지시 MD팀후보체크] 빈 칸 = 사방넷 단품코드매핑관리 후보(그 상품이 옵션으로 팔리는 스마트스토어 상품) — 회색 + 체크 단추. 체크 = 그 링크를 화면 입력으로 저장. */
        for (const [n, 옵션] of 후보링크[code]) {
          const lb = td.appendChild(document.createElement("span"));      // label 아님 — 링크를 눌러도 체크되지 않게
          lb.className = "vp-md후보";
          const cb = lb.appendChild(document.createElement("input"));
          cb.type = "checkbox";
          cb.title = "이 링크로 정함";
          cb.addEventListener("change", async () => {
            if (!cb.checked) return;
            for (const x of td.querySelectorAll(".vp-md후보 input")) x.disabled = true;
            try { await 링크저장(code, 사방넷주소(n)); 말("후보고름 " + code); }
            catch (e) { cb.checked = false; td.classList.add("vp-md링크못함"); td.title = "저장 못 함 — " + (e && e.message ? e.message : e); for (const x of td.querySelectorAll(".vp-md후보 input")) x.disabled = false; return; }
            for (const c of 링크칸들) if (c.code === code && !c.고치는중) 링크칸그리기(c);
          });
          lb.appendChild(새a(사방넷주소(n), 사방넷주소(n), "후보 — 스마트스토어 옵션: " + 옵션));
        }
        칸.상태 = "후보";
      }
    } else if (!견줄.length || 견줄.some((x) => x.n === 지금번)) {
      td.appendChild(기존()); 칸.상태 = 견줄.length ? "같음" : "";
    } else {
      const 옛 = td.appendChild(기존());
      옛.classList.add("vp-md링크옛");
      옛.title = (입력 ? "화면 입력" : "엑셀") + " 값 — " + 견줄.map((x) => x.까닭 + "(" + x.n + ")").join(" · ") + "와 다름";
      견줄.forEach((x) => 견줄a(x, 1));
      칸.상태 = "다름"; 칸.출처 = 견줄.map((x) => x.출처).join("+"); td.classList.add("vp-md링크다름");
    }
    td.title = [입력 ? "화면 입력: " + 글 : 글, 칸.상태 !== "다름" ? 견줄.map((x) => x.출처 === "사방넷" ? "사방넷 품번 " + 사[1] : "스마트스토어 상품 파일").join(" · ") : "", "두 번 누르면 고침"].filter(Boolean).join("\n");
  }
  function 링크고치기(칸) {
    if (칸.고치는중) return;
    칸.고치는중 = true;
    const 엑셀값 = String(셀링크(칸.엑셀) || 셀값(칸.엑셀)).trim();
    const 지금 = 입력링크.has(칸.code) ? 입력링크.get(칸.code) : 엑셀값;
    const inp = document.createElement("input");
    inp.type = "text"; inp.className = "vp-md링크입력"; inp.value = 지금;
    칸.td.replaceChildren(inp);
    inp.focus(); inp.select();
    let 끝남 = false;
    const 마침 = async (저장) => {
      if (끝남) return; 끝남 = true;
      const 새값 = inp.value.trim();
      let 못함 = "";
      if (저장 && 새값 !== String(지금).trim()) {
        inp.disabled = true;
        try { await 링크저장(칸.code, 새값 === 엑셀값 ? "" : 새값); 말("링크저장 " + 칸.code); }
        catch (e) { 못함 = "저장 못 함 — " + (e && e.message ? e.message : e); 말("링크저장못함 " + 칸.code); }
      }
      칸.고치는중 = false;
      for (const c of 링크칸들) if (c.code === 칸.code && !c.고치는중) 링크칸그리기(c);
      if (못함) { 칸.td.classList.add("vp-md링크못함"); 칸.td.title = 못함; }
    };
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); 마침(true); } if (e.key === "Escape") { e.preventDefault(); 마침(false); } });
    inp.addEventListener("blur", () => 마침(true));
  }
  window.VP_MD링크셈 = () => {
    const 셈 = {};
    for (const c of 링크칸들) {
      const k = c.시트;
      셈[k] = 셈[k] || { 칸: 0, 채움: 0, 같음: 0, 다름: 0, 입력: 0, 채움파일: 0, 다름파일: 0, 후보: 0 };
      셈[k].칸++;
      if (c.상태) 셈[k][c.상태]++;
      if (c.상태 === "채움" && /파일/.test(c.출처)) 셈[k].채움파일++;
      if (c.상태 === "다름" && /파일/.test(c.출처)) 셈[k].다름파일++;
      if (c.code && 입력링크.has(c.code)) 셈[k].입력++;
    }
    return 셈;
  };

  async function 자료받기() {
    const tok = await 표받기();
    const 답 = await 밖에(창고 + "?pageSize=300", { headers: { Authorization: "Bearer " + tok } });
    if (!답.ok) throw new Error("창고 " + 답.status);
    const 문서 = new Map();
    for (const d of (JSON.parse(답.글 || "{}").documents || [])) 문서.set(String(d.name || "").split("/").pop(), d.fields || {});
    const info = 문서.get("info");
    const n = info && Number(info.n && info.n.integerValue);
    if (!n) throw new Error("자료 없음");
    let 글 = "";
    for (let i = 1; i <= n; i++) {
      const f = 문서.get("c" + i);
      if (!f || !f.j) throw new Error("조각 " + i + " 없음");
      글 += f.j.stringValue || "";
    }
    return JSON.parse(글);
  }

  /* ── 표 ── */
  const 시트표 = [];          // {s, 통, 탭, 표, 그림, 단추칸}
  let 꼴표 = [];
  const 셀값 = (c) => (Array.isArray(c) ? c[0] : c) || "";
  const 셀꼴 = (c) => (Array.isArray(c) && c[1] ? 꼴표[c[1] - 1] || null : null);
  const 셀링크 = (c) => (Array.isArray(c) && c[2]) || "";
  function 꼴입히기(el, k) {
    if (!k) return;
    if (k.b) el.style.background = k.b;
    if (k.f) el.style.color = k.f;
    if (k.w) el.style.fontWeight = "700";
    if (k.i) el.style.fontStyle = "italic";
    const 줄 = [k.u ? "underline" : "", k.s ? "line-through" : ""].filter(Boolean).join(" ");
    if (줄) el.style.textDecoration = 줄;
  }
  const 비었음 = "(필드 값 없음)";
  function 표그리기(x) {
    const s = x.s;
    const t = document.createElement("table");
    t.className = "vp-촘촘 vp-md표";
    const hr = t.createTHead().insertRow();
    s.칸.forEach((이름, i) => {
      const th = hr.appendChild(document.createElement("th"));
      th.textContent = 이름;
      const 묶음 = 위자리(s)[i] && 위자리(s)[i].글;           // 엑셀 위 머리(할인판매가·배송비)는 한 줄 머리의 title 로만
      const 원래 = s.칸원래 && s.칸원래[i] !== 이름 ? s.칸원래[i] : "";
      if (묶음 || 원래) th.title = [묶음, 원래 || 이름].filter(Boolean).join(" › ");
      if (!i) th.classList.add("vp-first");
    });
    const tb = t.createTBody();
    const 병합 = new Map();       // "r,c" → {아래, 오른, 값}
    for (const [r0, c0, r1, c1] of s.병합 || []) {
      const 값 = 셀값(s.줄[r0][c0]);
      for (let rr = r0; rr <= r1; rr++) for (let cc = c0; cc <= c1; cc++)
        병합.set(rr + "," + cc, { 아래: rr < r1, 오른: cc < c1, 값, 첫: rr === r0 && cc === c0 });
    }
    x.단추칸 = [];
    const 코드칸 = s.칸.indexOf("상품코드");     // 11-27 [새 지시 MD팀코드연결] 이 줄의 상품코드 = 벤더피아 상품코드로 맞춘다
    const 링크칸 = s.칸.findIndex((이름) => String(이름).replace(/\s+/g, "").toLowerCase() === "스마트스토어url");
    s.줄.forEach((줄, ri) => {
      const tr = tb.insertRow();
      줄.forEach((c, ci) => {
        const td = tr.insertCell();
        const 글 = 셀값(c), k = 셀꼴(c), l = 셀링크(c);
        if (!ci) td.className = "vp-first";
        if (ci === 링크칸) {                       // 11-27 [새 지시 MD팀스마트스토어칸]
          꼴입히기(td, k);
          const 칸 = { td, code: 코드칸 >= 0 ? String(셀값(줄[코드칸])).trim() : "", 엑셀: c, 시트: s.이름 };
          링크칸들.push(칸);
          링크칸그리기(칸);
          if (칸.code) {
            /* 한 번 누름 = 링크 열기(조금 기다렸다가) · 두 번 누름 = 고치기 — 두 번 누를 때 새 탭이 열리지 않게 */
            let 기다림 = 0;
            td.addEventListener("click", (e) => {
              const a = e.target.closest && e.target.closest("a");
              if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return;
              e.preventDefault();
              clearTimeout(기다림);
              if (e.detail > 1) return;
              기다림 = setTimeout(() => window.open(a.href, "_blank", "noopener"), 280);
            });
            td.addEventListener("dblclick", (e) => { if (e.target.closest("input")) return; e.preventDefault(); clearTimeout(기다림); 링크고치기(칸); });
          }
          return;
        }
        if (l) {
          const a = td.appendChild(document.createElement("a"));
          a.href = l; a.target = "_blank"; a.rel = "noopener";
          a.textContent = 글;
          a.style.color = (k && k.f) || "inherit";                       // 엑셀 글 색 그대로(밑줄도 칸 꼴 그대로)
          a.style.textDecoration = k && k.u ? "underline" : "none";
        } else td.textContent = 글;
        꼴입히기(td, k);
        const m = 병합.get(ri + "," + ci);
        td.title = (k && k.t) || (m && !m.첫 ? m.값 : 글);
        if (ci === s.제품명칸 && 글.trim()) { td.classList.add("vp-상품칸"); x.단추칸.push({ td, 이름: 글, 코드: 코드칸 >= 0 ? 셀값(줄[코드칸]).trim() : "" }); }
      });
    });
    x.통.appendChild(t);
    const 판 = window.VP표 && window.VP표.넓이틀(t, s.칸, "vp열넓이:MD팀:" + s.이름);
    if (판) 판.맞춤(s.줄.map((줄) => 줄.map(셀값)), (i, h) => (i === s.제품명칸 ? { 끝: 280 } : {}));
    x.표 = t;
    if (s.거르개) 거르개달기(x);
    x.그림 = true;
    단추붙이기();
  }
  function 위자리(s) {
    if (s._위자리) return s._위자리;
    const 답 = [];
    for (const [글, 칸수] of s.위 || []) for (let k = 0; k < 칸수; k++) 답.push({ 글: 칸수 > 1 ? 글 : "" });
    return (s._위자리 = 답);
  }

  /* ── 거르개 = 엑셀 자동필터처럼 칸마다 값 고르기(▾). 고른 값만 남김, 칸끼리는 「그리고」. ── */
  function 거르개달기(x) {
    x.거름 = new Map();               // 칸 → Set(남길 값)
    const 머리 = x.표.tHead.rows[x.표.tHead.rows.length - 1];
    [...머리.cells].forEach((th, i) => {
      th.classList.add("vp-md거름칸");
      const b = th.appendChild(document.createElement("button"));
      b.type = "button";
      b.className = "vp-md거름";
      b.textContent = "▾";
      b.title = "거르기";
      b.addEventListener("pointerdown", (e) => e.stopPropagation());
      b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); 거름판열기(x, i, b); });
    });
  }
  const 값글 = (v) => (String(v).trim() ? v : 비었음);
  function 거르기(x) {
    const 줄들 = x.표.tBodies[0].rows;
    x.s.줄.forEach((줄, ri) => {
      let 보임 = true;
      for (const [ci, 남길] of x.거름) if (!남길.has(값글(셀값(줄[ci])))) { 보임 = false; break; }
      줄들[ri].hidden = !보임;
    });
    const 머리 = x.표.tHead.rows[x.표.tHead.rows.length - 1];
    [...머리.cells].forEach((th, i) => { const b = th.querySelector(".vp-md거름"); if (b) b.classList.toggle("vp-md거름켬", x.거름.has(i)); });
  }
  const 견줌 = (a, b) => {
    if (a === 비었음) return 1;
    if (b === 비었음) return -1;
    const na = Number(String(a).replace(/[,%]/g, "")), nb = Number(String(b).replace(/[,%]/g, ""));
    const 숫a = String(a).trim() !== "" && !isNaN(na), 숫b = String(b).trim() !== "" && !isNaN(nb);
    if (숫a && 숫b) return na - nb;
    if (숫a !== 숫b) return 숫a ? -1 : 1;
    return String(a).localeCompare(String(b), "ko");
  };
  function 거름판닫기() { r.querySelectorAll(".vp-md거름판").forEach((p) => p.remove()); removeEventListener("pointerdown", 밖눌림, true); }
  function 밖눌림(e) { if (!e.target.closest || !e.target.closest(".vp-md거름판")) 거름판닫기(); }
  function 거름판열기(x, ci, 단추) {
    const 열렸던 = r.querySelector(`.vp-md거름판[data-k="${x.s.이름}#${ci}"]`);
    거름판닫기();
    if (열렸던) return;
    /* 엑셀처럼 — 다른 칸 거르개를 지난 줄의 값만 보인다 */
    const 셈 = new Map();
    x.s.줄.forEach((줄) => {
      for (const [k, 남길] of x.거름) if (k !== ci && !남길.has(값글(셀값(줄[k])))) return;
      const v = 값글(셀값(줄[ci]));
      셈.set(v, (셈.get(v) || 0) + 1);
    });
    const 값들 = [...셈.keys()].sort(견줌);
    const 지금 = x.거름.get(ci);
    const 판 = document.createElement("div");
    판.className = "vp-md거름판";
    판.dataset.k = x.s.이름 + "#" + ci;
    판.innerHTML = `<input type="search" placeholder="검색"><div class="vp-md값들"></div>
      <div class="vp-md단추들"><button type="button" class="vp-md확인">확인</button><button type="button" class="vp-md취소">취소</button></div>`;
    const 찾기 = 판.querySelector("input"), 목록 = 판.querySelector(".vp-md값들");
    const 모두 = document.createElement("label");
    모두.innerHTML = `<input type="checkbox"><span>(모두 선택)</span>`;
    목록.appendChild(모두);
    const 상자들 = 값들.map((v) => {
      const lb = document.createElement("label");
      const cb = lb.appendChild(document.createElement("input"));
      cb.type = "checkbox";
      cb.checked = !지금 || 지금.has(v);
      cb.value = v;
      const sp = lb.appendChild(document.createElement("span"));
      sp.textContent = v;
      lb.title = v;
      목록.appendChild(lb);
      return cb;
    });
    const 모두상자 = 모두.querySelector("input");
    const 보이는상자 = () => 상자들.filter((cb) => !cb.parentElement.hidden);
    const 모두맞춤 = () => {
      const 보 = 보이는상자(), 켠 = 보.filter((cb) => cb.checked).length;
      모두상자.checked = 보.length > 0 && 켠 === 보.length;
      모두상자.indeterminate = 켠 > 0 && 켠 < 보.length;
    };
    모두상자.addEventListener("change", () => { for (const cb of 보이는상자()) cb.checked = 모두상자.checked; 모두맞춤(); });
    목록.addEventListener("change", (e) => { if (e.target !== 모두상자) 모두맞춤(); });
    찾기.addEventListener("input", () => {
      const q = 찾기.value.trim().toLowerCase();
      for (const cb of 상자들) { const 맞음 = !q || cb.value.toLowerCase().includes(q); cb.parentElement.hidden = !맞음; if (q) cb.checked = 맞음; }
      모두맞춤();
    });
    판.querySelector(".vp-md취소").addEventListener("click", 거름판닫기);
    판.querySelector(".vp-md확인").addEventListener("click", () => {
      const 켠 = 상자들.filter((cb) => cb.checked && !cb.parentElement.hidden).map((cb) => cb.value);
      if (!켠.length) return;
      if (켠.length === 상자들.length) x.거름.delete(ci); else x.거름.set(ci, new Set(켠));
      거름판닫기();
      거르기(x);
    });
    판.addEventListener("keydown", (e) => { if (e.key === "Escape") 거름판닫기(); if (e.key === "Enter") 판.querySelector(".vp-md확인").click(); });
    r.appendChild(판);
    모두맞춤();
    const 자 = 단추.getBoundingClientRect();
    판.style.left = Math.max(8, Math.min(자.right - 판.offsetWidth, innerWidth - 판.offsetWidth - 8)) + "px";
    판.style.top = Math.max(8, Math.min(자.bottom + 2, innerHeight - 판.offsetHeight - 8)) + "px";
    setTimeout(() => addEventListener("pointerdown", 밖눌림, true), 0);
    찾기.focus();
  }

  /* ── 제품명 칸 = 상품관리 이름 단추 (goods.js 곁다리 `VP상품단추` — 배송관리·CS등록과 같은 단추·점·상세) ──
     11-27 [새 지시 MD팀코드연결] 맞춤 = **같은 줄 상품코드 = 벤더피아 상품코드**(goods.js `표에서찾기("", 코드)` — 이름으로는 안 맞춤).
     이름표에 없는 코드는 `VP상품찾기`(벤더피아 상품관리 **상품코드 조회** = 전체 상품에서, 공용 줄 「뒤」, 3개씩).
     단추 = 벤더피아 상품명. 엑셀 제품명이 그와 다르면(빈칸·대소문자 무시) 옆에 작은 글자 `.vp-md엑셀명`(줄 높이 그대로). 코드 없음·못 찾음 = 엑셀 글자 그대로(가짜 단추 없음). */
  let 찾아봄 = false, 붙이는중 = false, 또 = false;
  const 뭉갬 = (t) => String(t == null ? "" : t).replace(/\s+/g, "").toLowerCase();
  async function 단추붙이기() {
    if (!window.VP상품단추) return;
    if (붙이는중) { 또 = true; return; }
    붙이는중 = true;
    try {
      let 끝 = performance.now() + 25;
      for (const x of 시트표) {
        for (const 칸 of x.단추칸 || []) {
          if (칸.된 || !칸.td.isConnected || !칸.코드) continue;
          const b = window.VP상품단추("", 칸.코드);       // 이름은 안 넘김 → 상품코드로만 찾음
          if (b) {
            const 통 = document.createElement("div");
            통.className = "vp-goods-list";
            통.appendChild(b);
            const 상품명 = String((b.firstChild && b.firstChild.nodeValue) || "");
            if (뭉갬(상품명) !== 뭉갬(칸.이름)) {        // 엑셀 제품명이 상품명과 다르면 작게 함께
              const 옛 = 통.appendChild(document.createElement("small"));
              옛.className = "vp-md엑셀명";
              옛.textContent = 칸.이름.trim();
            }
            칸.td.replaceChildren(통);
            칸.된 = true;
          }
          if (performance.now() > 끝) { await new Promise((풀) => setTimeout(풀, 0)); 끝 = performance.now() + 25; }
        }
      }
      if (!찾아봄 && window.VP상품찾기 && window.VP상품표끝 && window.VP상품표끝() && 시트표.length && 시트표.every((x) => x.그림)) {
        찾아봄 = true;
        const 본 = new Set(), 목록 = [];
        for (const x of 시트표) for (const 칸 of x.단추칸 || []) {
          const c = 칸.코드;
          if (!칸.된 && c && !본.has(c)) { 본.add(c); 목록.push({ 이름: c, 코드: c }); }   // 이름 칸에도 코드(곁다리는 이름 없는 것을 건너뜀) — 코드 조회 먼저
        }
        if (목록.length) window.VP상품찾기(목록).then(() => 단추붙이기()).catch(() => {});
      }
      말(셈글());
    } finally {
      붙이는중 = false;
      if (또) { 또 = false; 단추붙이기(); }
    }
  }
  const 셈글 = () => 시트표.map((x) => x.s.이름 + " " + (x.단추칸 || []).filter((c) => c.된).length + "/" + (x.단추칸 || []).length).join(" · ");
  window.VP_MD셈 = () => Object.fromEntries(시트표.map((x) => [x.s.이름, { 단추: (x.단추칸 || []).filter((c) => c.된).length, 제품명칸: (x.단추칸 || []).length }]));
  addEventListener("vp상품단추준비", () => 단추붙이기());

  /* ── 11-27 [새 지시 MD팀제품명검색] 제품명 칸 오른쪽 단추 → 작은 메뉴 「검색」 → 아이엔지홈 스마트스토어(브랜드스토어) 안 검색 새 탭.
     검색 글 = 파란 단추의 벤더피아 상품명(없으면 엑셀 제품명 글자). 주소 = brand.naver.com/inggagu/search?q= (11-27 잼: 200 ·
     smartstore.naver.com/inggagu/search 는 로그인으로 돌림). 왼쪽 단추(이름 단추·상세)는 그대로. */
  const 스토어검색 = (글) => "https://brand.naver.com/inggagu/search?q=" + encodeURIComponent(글);
  function 검색판닫기() { r.querySelectorAll(".vp-md검색판").forEach((p) => p.remove()); }
  r.addEventListener("contextmenu", (e) => {
    const td = e.target.closest && e.target.closest("table.vp-md표 td.vp-상품칸");
    if (!td) return;
    const b = td.querySelector(".vp-goods-list button");
    const 글 = (b ? String((b.firstChild && b.firstChild.nodeValue) || "") : td.textContent).trim();
    if (!글) return;
    e.preventDefault();
    검색판닫기();
    const 판 = r.appendChild(document.createElement("div"));
    판.className = "vp-md검색판";
    const 단 = 판.appendChild(document.createElement("button"));
    단.type = "button"; 단.textContent = "검색"; 단.title = 글;
    단.addEventListener("click", () => { window.open(스토어검색(글), "_blank", "noopener"); 검색판닫기(); 말("검색 " + 글); });
    판.style.left = Math.min(e.clientX, innerWidth - 90) + "px";
    판.style.top = Math.min(e.clientY, innerHeight - 40) + "px";
  });
  addEventListener("pointerdown", (e) => { if (!e.target.closest || !e.target.closest(".vp-md검색판")) 검색판닫기(); }, true);
  addEventListener("keydown", (e) => { if (e.key === "Escape") 검색판닫기(); });
  addEventListener("scroll", 검색판닫기, true);

  /* ── 「사방넷」 탭 (11-27 [새 지시 MD팀사방넷]) ──
     MD팀에 들어오면 먼저 사방넷 로그인을 본다(확장 다리 `VP사방넷` → bg.js). 안 돼 있으면 사방넷 **공식 로그인 창**을 연다 —
     아이디·비밀번호는 사장님이 그 창에 직접(이 글·확장·창고 어디에도 안 적음). 로그인되면(쿠키, 약 12시간) 그 창을 닫고
     사방넷을 **읽기만**: 품번코드매핑관리(스마트스토어) + 단품 목록 → MD팀 상품코드 = 단품 옵션별칭/자체상품코드 → 「매핑용」 아닌 품번 →
     스마트스토어 상품코드가 딱 하나면 링크. 그 결과로 「스마트스토어 url」 칸을 다시 그리고 창고 `mdteam_inghome_sabang/links` 를 새로 적는다
     (사방넷 로그인이 없는 사람·때도 마지막 연동 결과가 보이게). 한 번 로그인하면 쿠키가 살아 있는 동안 MD팀을 다시 열어도 다시 안 묻는다. */
  const 사방넷 = { 탭: null, 통: null, 상태: null, 받은때: "", 셈: null, 기다림: 0, 하는중: false, 줄: [] };
  const 단추 = (글, 할) => { const b = document.createElement("button"); b.type = "button"; b.className = "vp-md사방넷단추"; b.textContent = 글; b.addEventListener("click", 할); return b; };
  function 사방넷그리기() {
    const 통 = 사방넷.통, 줄 = 사방넷.줄칸;
    if (!통) return;
    const 상 = 사방넷.상태;
    줄.replaceChildren();
    const 글 = (t, 까닭) => { const sp = 줄.appendChild(document.createElement("span")); sp.textContent = t; if (까닭) sp.title = 까닭; return sp; };
    if (!window.VP사방넷) 글("확장 덮어쓰기 필요", "벤더피아 보기 확장 0.35.27 이상이 깔려야 사방넷에 로그인할 수 있습니다").className = "vp-md사방넷안됨";
    else if (!상) 글("사방넷 확인 중…");
    else if (상.로그인) { 글("사방넷 " + (상.계정 || "") + " 로그인").className = "vp-md사방넷됨"; 글("남은 " + Math.floor(상.남은분 / 60) + "시간 " + (상.남은분 % 60) + "분", "사방넷 로그인 쿠키가 끝나는 때까지"); }
    else { 글("사방넷 로그인 안 됨").className = "vp-md사방넷안됨"; 줄.appendChild(단추("사방넷 로그인", () => 사방넷로그인())); }
    if (상 && 상.로그인) 줄.appendChild(단추(사방넷.하는중 ? "받는 중…" : "다시 받기", () => 사방넷연동())).disabled = 사방넷.하는중;
    if (사방넷.받은때) 글("받은 때 " + 사방넷.받은때);
    if (사방넷.셈) 글("매핑 " + 사방넷.셈.매핑 + " · 단품 " + 사방넷.셈.단품 + " · 링크 " + 사방넷.셈.링크);
    if (사방넷.탈) 글("못 받음 — " + 사방넷.탈).className = "vp-md사방넷안됨";
    const 머리 = ["상품코드", "사방넷 품번", "스마트스토어 상품코드", "스마트스토어 링크", "MD팀"];
    const t = document.createElement("table");
    t.className = "vp-촘촘 vp-md표 vp-md사방넷표";
    const hr = t.createTHead().insertRow();
    머리.forEach((h, i) => { const th = hr.appendChild(document.createElement("th")); th.textContent = h; if (!i) th.className = "vp-first"; });
    const tb = t.createTBody();
    const 상태글 = new Map();
    for (const c of 링크칸들) if (c.code && c.상태 && !상태글.has(c.code)) 상태글.set(c.code, c.상태);
    const 값줄 = Object.entries(사방넷링크).map(([code, [n, p]]) => [code, p, n, 사방넷주소(n), 상태글.get(code) || ""]);
    for (const v of 값줄) {
      const tr = tb.insertRow();
      v.forEach((x, i) => {
        const td = tr.insertCell();
        if (!i) td.className = "vp-first";
        if (i === 3) { const a = td.appendChild(document.createElement("a")); a.href = x; a.target = "_blank"; a.rel = "noopener"; a.textContent = x; a.style.color = "inherit"; a.style.textDecoration = "none"; }
        else td.textContent = x;
        if (i === 4 && x === "다름") td.style.color = "#DD1C1A";
      });
    }
    /* 11-27 [새 지시 MD팀사방넷스크롤] 표 통 = 시트 표와 똑같이 `.vp-search` 바로 아래 `.vp-table`(쪽은 안 밀리고 이 통만 세로·가로로 밀림).
       전에는 `.vp-md사방넷` 안에 한 겹 더 싸여 그 규칙(flex 남은 높이·overflow auto)을 못 받아 표가 늘어난 채 잘렸다 → 스크롤 안 됨. */
    const 위 = 통.scrollTop, 옆 = 통.scrollLeft;
    통.replaceChildren(t);
    통.scrollTop = 위; 통.scrollLeft = 옆;
    const 판 = window.VP표 && window.VP표.넓이틀(t, 머리, "vp열넓이:MD팀:사방넷");
    if (판) 판.맞춤(값줄);
  }
  async function 사방넷상태보기() {
    if (!window.VP사방넷) { 사방넷.상태 = null; 사방넷그리기(); return null; }
    사방넷.상태 = await window.VP사방넷("상태");
    사방넷그리기();
    return 사방넷.상태;
  }
  async function 사방넷로그인() {
    if (!window.VP사방넷) return;
    const 상 = await window.VP사방넷("로그인창");
    if (상 && 상.로그인) { 사방넷.상태 = 상; return 사방넷연동(); }
    clearInterval(사방넷.기다림);
    const 시작 = Date.now();
    사방넷.기다림 = setInterval(async () => {
      const s = await window.VP사방넷("상태");
      if (s && s.로그인) {
        clearInterval(사방넷.기다림);
        사방넷.상태 = s;
        window.VP사방넷("창닫기");
        사방넷연동();
      } else if (Date.now() - 시작 > 15 * 60000) clearInterval(사방넷.기다림);
    }, 2000);
  }
  function 사방넷링크만들기(자료s, 매핑, 단품) {
    const n = (s) => String(s || "").trim().toLowerCase();
    const 묶음 = new Set(매핑.filter((r) => /매핑용/.test(r[2])).map((r) => r[0]));
    const 품번별 = new Map();
    for (const [p, s] of 매핑) { if (!품번별.has(p)) 품번별.set(p, new Set()); 품번별.get(p).add(s); }
    const 코드별 = new Map();
    const 더 = (k, p) => { if (!k) return; if (!코드별.has(k)) 코드별.set(k, new Set()); 코드별.get(k).add(p); };
    for (const [p, 별칭, 자체] of 단품) { 더(n(별칭), p); 더(n(자체), p); }
    const 답 = {};
    for (const s of 자료s) {
      const ci = s.칸.indexOf("상품코드");
      if (ci < 0) continue;
      for (const 줄 of s.줄) {
        const code = String(셀값(줄[ci])).trim();
        if (!code || 답[code]) continue;
        const 품번들 = [...(코드별.get(n(code)) || [])].filter((p) => 품번별.has(p) && !묶음.has(p));
        const 번호들 = [...new Set(품번들.flatMap((p) => [...품번별.get(p)]))];
        if (번호들.length === 1) 답[code] = [번호들[0], 품번들.find((p) => 품번별.get(p).has(번호들[0]))];
      }
    }
    return 답;
  }
  async function 사방넷연동() {
    if (!window.VP사방넷 || 사방넷.하는중) return;
    사방넷.하는중 = true; 사방넷.탈 = ""; 사방넷그리기();
    try {
      const 자 = await window.VP사방넷("자료");
      if (!자) throw new Error("확장 답 없음");
      if (자.로그인 === false) { 사방넷.상태 = { 로그인: false }; return; }
      if (자.탈) throw new Error(자.탈);
      const 새 = 사방넷링크만들기(시트표.map((x) => x.s), 자.매핑 || [], 자.단품 || []);
      사방넷링크 = 새;
      사방넷.셈 = { 매핑: (자.매핑 || []).length, 단품: (자.단품 || []).length, 링크: Object.keys(새).length };
      사방넷.받은때 = new Date().toLocaleString("ko-KR", { hour12: false });
      for (const c of 링크칸들) if (!c.고치는중) 링크칸그리기(c);
      말("사방넷연동 " + JSON.stringify(사방넷.셈));
      try {   // 마지막 연동 결과를 창고에(사방넷 로그인이 없는 때도 보이게). 화면 fetch 로 바로(다리는 이 칸 쓰기 안 받음)
        const tok = await 표받기();
        await fetch(사방넷창고, { method: "PATCH", credentials: "omit", headers: { "Content-Type": "application/json", Authorization: "Bearer " + tok },
          body: JSON.stringify({ fields: { j: { stringValue: JSON.stringify(새) }, n: { integerValue: String(Object.keys(새).length) }, at: { stringValue: new Date().toISOString() }, 출처: { stringValue: "MD팀 사방넷 로그인 연동" } } }) });
      } catch (e) {}
    } catch (e) {
      사방넷.탈 = String(e && e.message || e).slice(0, 60);
    } finally {
      사방넷.하는중 = false;
      try { 사방넷.상태 = (await window.VP사방넷("상태")) || 사방넷.상태; } catch (e) {}
      사방넷그리기();
    }
  }
  window.VP_MD사방넷 = () => ({ 상태: 사방넷.상태, 셈: 사방넷.셈, 받은때: 사방넷.받은때, 탈: 사방넷.탈 || "", 다리: !!window.VP사방넷 });
  function 사방넷탭고르기() {
    시트표.forEach((x) => { x.탭.setAttribute("aria-selected", "false"); x.통.hidden = true; });
    사방넷.탭.setAttribute("aria-selected", "true");
    사방넷.통.hidden = false;
    사방넷.줄칸.hidden = false;
    메모칸.replaceChildren();
    거름판닫기();
    사방넷그리기();
  }
  async function 사방넷시작() {
    사방넷.탭 = 탭칸.appendChild(document.createElement("button"));
    사방넷.탭.type = "button";
    사방넷.탭.setAttribute("role", "tab");
    사방넷.탭.textContent = "사방넷";
    사방넷.탭.addEventListener("click", 사방넷탭고르기);
    사방넷.줄칸 = 쪽.appendChild(document.createElement("div"));      // 상태 한 줄 (표 통 위, 안 밀림)
    사방넷.줄칸.className = "vp-md사방넷줄";
    사방넷.줄칸.hidden = true;
    사방넷.통 = 쪽.appendChild(document.createElement("div"));        // 표 통 = 시트 표와 같은 `.vp-table` (이 통 안에서만 세로·가로 밀림)
    사방넷.통.className = "vp-table vp-md사방넷";
    사방넷.통.hidden = true;
    const 상 = await 사방넷상태보기();
    if (!상) return;
    if (상.로그인) 사방넷연동();
    else 사방넷로그인();       // MD팀에 들어오면 먼저 사방넷 로그인 창
  }

  function 탭고르기(k) {
    시트표.forEach((x, i) => {
      x.탭.setAttribute("aria-selected", String(i === k));
      x.통.hidden = i !== k;
    });
    if (사방넷.탭) { 사방넷.탭.setAttribute("aria-selected", "false"); 사방넷.통.hidden = true; 사방넷.줄칸.hidden = true; }
    const x = 시트표[k];
    메모칸.replaceChildren(...(x.s.메모 || []).map(([글, 꼴]) => { const sp = document.createElement("span"); sp.textContent = 글; 꼴입히기(sp, 꼴 ? 꼴표[꼴 - 1] : null); return sp; }));
    거름판닫기();
    if (!x.그림) 표그리기(x);
  }

  (async () => {
    let 자료;
    try { [자료] = await Promise.all([자료받기(), 링크자료받기().catch(() => {})]); }
    catch (e) { 알림.textContent = "MD팀 자료를 받지 못했습니다 — " + (e && e.message ? e.message : e); 말("못받음 " + (e && e.message)); return; }
    꼴표 = 자료.꼴 || [];
    알림.textContent = "";
    알림.hidden = true;
    (자료.시트 || []).forEach((s, i) => {
      const 탭 = 탭칸.appendChild(document.createElement("button"));
      탭.type = "button";
      탭.setAttribute("role", "tab");
      탭.textContent = s.이름;
      탭.addEventListener("click", () => 탭고르기(i));
      const 통 = document.createElement("div");
      통.className = "vp-table";
      통.hidden = true;
      쪽.appendChild(통);
      시트표.push({ s, 통, 탭, 그림: false });
    });
    if (!시트표.length) { 알림.hidden = false; 알림.textContent = "MD팀 자료에 시트가 없습니다."; return; }
    탭고르기(0);
    사방넷시작();
    /* 나머지 시트도 한가할 때 미리 그린다 — 이름 단추 찾기를 한 번에(시트끼리 같은 이름은 한 번만) */
    for (let i = 1; i < 시트표.length; i++) { await new Promise((풀) => setTimeout(풀, 30)); if (!시트표[i].그림) 표그리기(시트표[i]); }
    단추붙이기();
    말("그림 " + 시트표.map((x) => x.s.이름 + " " + x.s.줄.length).join(" · "));
  })();
})();
