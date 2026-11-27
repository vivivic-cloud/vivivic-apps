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
    s.줄.forEach((줄, ri) => {
      const tr = tb.insertRow();
      줄.forEach((c, ci) => {
        const td = tr.insertCell();
        const 글 = 셀값(c), k = 셀꼴(c), l = 셀링크(c);
        if (!ci) td.className = "vp-first";
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

  function 탭고르기(k) {
    시트표.forEach((x, i) => {
      x.탭.setAttribute("aria-selected", String(i === k));
      x.통.hidden = i !== k;
    });
    const x = 시트표[k];
    메모칸.replaceChildren(...(x.s.메모 || []).map(([글, 꼴]) => { const sp = document.createElement("span"); sp.textContent = 글; 꼴입히기(sp, 꼴 ? 꼴표[꼴 - 1] : null); return sp; }));
    거름판닫기();
    if (!x.그림) 표그리기(x);
  }

  (async () => {
    let 자료;
    try { 자료 = await 자료받기(); }
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
    /* 나머지 시트도 한가할 때 미리 그린다 — 이름 단추 찾기를 한 번에(시트끼리 같은 이름은 한 번만) */
    for (let i = 1; i < 시트표.length; i++) { await new Promise((풀) => setTimeout(풀, 30)); if (!시트표[i].그림) 표그리기(시트표[i]); }
    단추붙이기();
    말("그림 " + 시트표.map((x) => x.s.이름 + " " + x.s.줄.length).join(" · "));
  })();
})();
