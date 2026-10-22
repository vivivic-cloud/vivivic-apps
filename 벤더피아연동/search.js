// 배송관리(배송목록조회) 화면을 기간 + 검색창 하나로 바꾼다.
// 조회는 원래 화면의 검색 폼을 그대로 벤더피아에 보내고, 받은 결과에서 목록만 뽑아 보여준다.
(() => {
  /* ⚠⚠ 10-22 사장님 (바로잡음, 한 글자도 안 고침): 「내가 말을 잘못전달했네 CS등록 메뉴 입장시 이런 벤더피아
       화면 그대로가 아니라 현재 프로그램의 배송관리와 같은 화면이 나오고 대신 그 검색 데이터가
       -판매관리의 주문관리의 데이터에서 검색될어져야 한다는거였어」
     → 주문관리(`/System/Sales/orderMst.aspx`) 쪽 위에서 **배송관리와 같은 꼴**(기간 + 검색창 + 결과 표 +
       줄마다 「상담」 단추)을 그린다. 다른 것은 **자료의 출처뿐** — 주문관리 조회에서 온다.
       (10-21 0.34.39 는 이것을 「원래 화면 위에 CS 판만」 으로 잘못 읽었다.)
     ⚠ 주문관리 폼의 칸 이름은 저장소에 없다 — **페이지에서 읽어 맞춘다**(`주문관리조회`). 못 맞추면
       배송목록 조회(`배송틀받기`)로 돌아가며, 그때는 화면에 작게 그렇다고 적는다(`.vp-출처`). */
  const CS전용 = /\/system\/sales\/ordermst\.aspx/i.test(location.pathname);
  const form = document.forms[0];
  const searchBtn = document.getElementById("btnSearch");
  const startDt = document.getElementById("dcStartDt");
  const endDt = document.getElementById("dcEndDt");
  if (CS전용 ? !form : (!form || !searchBtn || !startDt || !endDt)) return;

  const fieldNames = CS전용 ? [] : [...new FormData(form).keys()];
  const fullName = (id) => fieldNames.find((n) => n === id || n.endsWith("$" + id)) || id;

  // 검색어 한 단어가 목록 칸의 항목과 똑같으면 그 칸을 고른다 (앞에 있을수록 우선)
  const SELECTS = ["ddlDStatus", "ddlCSType", "ddlStoreGb", "ddlDeliveryCo", "ddlMall", "ddlStore",
    "ddlLoc", "ddl_RecallGb", "ddlStockType", "ddlInvoiceSendYn", "ddlSupplier"];
  const norm = (s) => s.replace(/^\d+\s+/, "").replace(/\s/g, "").toLowerCase();

  function matchSelect(token) {
    if (CS전용) return null;     // 주문관리 화면의 고르는 칸은 배송목록 폼의 것이 아니다 — 섞어 보내지 않는다
    for (const id of SELECTS) {
      const sel = document.getElementById(id);
      if (!sel) continue;
      const opt = [...sel.options].find((o) => o.text !== "전체" && norm(o.text) === norm(token));
      if (opt) return { id, value: opt.value, label: opt.text };
    }
    return null;
  }

  // 검색어를 벤더피아 검색칸에 나눠 담는다
  function plan(query) {
    const filters = {};      // 목록 칸 (모든 조회에 함께 적용)
    let variants = null;     // 벤더피아에 보낼 조회들 (결과를 칸별로 나눠 보여줌)
    const local = [];        // 받아온 목록 안에서 거르는 말 (전화번호 등)

    for (const token of query.trim().split(/\s+/).filter(Boolean)) {
      const sel = matchSelect(token);
      if (sel) { filters[sel.id] = sel.value; continue; }

      const digits = token.replace(/-/g, "");
      const isNumber = /^[\d-]+$/.test(token);
      const isPhone = isNumber && /^0\d{8,10}$/.test(digits);
      const isShortNumber = isNumber && digits.length <= 8;

      if (variants || isPhone || isShortNumber) { local.push(token); continue; }

      if (isNumber) {
        variants = [["송장번호", { tbInvoiceNo: token }], ["주문번호", { tbSOrderNo: token }]];
      } else if (/[A-Za-z]/.test(token) && !/[가-힣]/.test(token)) {
        variants = [["단품코드", { tbGoodsCd: token }]];
      } else {
        // 서버 응답이 빠른 칸부터 (상품명이 가장 느림)
        variants = [["수취인", { tbRecipient: token }], ["주문자", { tbOrderer: token }],
          ["주소", { tbAddr0: token }], ["상품명", { tbSGoodsNm: token }]];
      }
    }
    return { filters, variants: variants || [["전체", {}]], local };
  }

  /* 받은 글에서 머리줄(수취인 칸이 든 줄 — 주문관리는 칸이 가장 많은 머리줄)과 줄들을 뽑는다 */
  function 표뽑기(글, 머리찾기) {
    const doc = new DOMParser().parseFromString(글, "text/html");
    const count = (doc.body.textContent.match(/([\d,]+)\s*건/) || [])[1] || "0";
    const th = 머리찾기(doc);
    /* 까닭 적기 — 진짜 화면에서 왜 비는지 보이게(10-22): 응답 길이·로그인 칸·머리줄 칸 수·그 밖 줄 칸 수들 */
    const 칸수들 = {};
    for (const tr of doc.querySelectorAll("tr")) if (!tr.querySelector("th")) { const n = tr.children.length; 칸수들[n] = (칸수들[n] || 0) + 1; }
    const 몸 = { 길이: 글.length, 로그인칸: !!doc.querySelector("input[type=password]"), 틀: doc.querySelectorAll("frame,iframe").length,
      표수: doc.querySelectorAll("table").length, 칸수들: Object.entries(칸수들).sort((a, z) => z[1] - a[1]).slice(0, 4).map(([n, c]) => n + "칸×" + c).join(" "),
      제목: ((doc.querySelector("title") || {}).textContent || "").trim().slice(0, 30) };
    if (!th) return { count, heads: [], rows: [], 몸 };
    const heads = [...th.parentElement.children].map((c) => c.textContent.trim());
    const rows = [...doc.querySelectorAll("tr")]
      .filter((tr) => tr.children.length === heads.length && !tr.querySelector("th"))
      .map((tr) => [...tr.children].map((c) => c.textContent.trim()));
    return { count, heads, rows, 몸 };
  }
  let 마지막응답 = null;
  async function 보내기(틀, 이름, 몫, rowCnt) {
    const fd = new FormData(틀.form);
    for (const k of [...fd.keys()]) if (k.includes("chkItem")) fd.delete(k);
    if (틀.버튼) {
      if (틀.버튼.type === "image") { fd.append(틀.버튼.name + ".x", "5"); fd.append(틀.버튼.name + ".y", "5"); }
      else if (틀.버튼.name) fd.append(틀.버튼.name, 틀.버튼.value || "");
    }
    if (틀.행수칸) fd.set(틀.행수칸, rowCnt);
    for (const [id, v] of Object.entries(몫)) fd.set(이름(id), v);
    const res = await fetch(틀.form.action, { method: "POST", body: fd, credentials: "include" });
    마지막응답 = { 상태: res.status, 넘어옴: res.redirected, 주소: (res.url || "").replace(/^https?:\/\/[^/]+/, "").slice(0, 60),
      보낸: [...fd.entries()].filter(([k, v]) => typeof v === "string" && v && !/^__|chkItem/.test(k)).map(([k, v]) => k.split("$").pop() + "=" + String(v).slice(0, 20)).slice(0, 8).join(" ") };
    return res.text();
  }

  /* ── 주문관리(`orderMst.aspx`) 조회 ─────────────────────────
     칸 이름을 **짐작해 박지 않는다.** 이 쪽의 폼을 읽어서 맞춘다 —
       · 기간  : 날짜 꼴(2026-10-21 · 2026/10/21 · 2026.10.21) 값이 든 글칸 둘 (앞이 시작, 뒤가 끝)
       · 그 밖 : 폼 안 머리글(th·td·label)이 「주문번호」「수취인」… 인 곳 바로 옆 칸
       · 조회 단추 : 폼 안의 이미지·제출 단추 가운데 이름·값이 search·조회·검색 인 것(없으면 제출 단추가 하나뿐일 때 그것)
     ⚠ 하나라도 못 맞추면 `null` — 그때는 배송목록 조회를 쓴다(아래 `fetchList`).
     ⚠ 받은 결과의 머리줄에 「주문번호」「상품명」이 없어도 `null` — CS 판이 읽는 칸이다. */
  const 칸이름표 = { tbSOrderNo: "주문번호", tbRecipient: "수취인", tbOrderer: "주문자",
    tbAddr0: "주소", tbSGoodsNm: "상품명", tbInvoiceNo: "송장번호", tbGoodsCd: "단품코드" };
  const 깎 = (t) => String(t || "").replace(/[\s:：*]/g, "");
  const 쓸칸 = (e) => e && /^(INPUT|SELECT|TEXTAREA)$/.test(e.tagName)
    && !/^(hidden|image|submit|button|checkbox|radio)$/i.test(e.type || "") && e.name;
  function 머리글옆칸(글) {
    for (const c of form.querySelectorAll("th,td,label")) {
      if (깎(c.textContent) !== 글) continue;
      if (c.tagName === "LABEL" && c.htmlFor && 쓸칸(document.getElementById(c.htmlFor)))
        return document.getElementById(c.htmlFor);
      const 옆 = c.nextElementSibling;
      const 칸 = 옆 && (쓸칸(옆) ? 옆 : [...옆.querySelectorAll("input,select,textarea")].find(쓸칸));
      if (칸) return 칸;
    }
    return null;
  }
  let 주문틀 = undefined;
  function 주문틀읽기() {
    if (주문틀 !== undefined) return 주문틀;
    주문틀 = null;
    const 날 = [...form.elements].filter((e) => e.tagName === "INPUT" && 쓸칸(e)
      && /^\d{4}([-/.])\d{2}\1\d{2}$/.test((e.value || "").trim()));
    const 단추들 = [...form.querySelectorAll("input[type=image],input[type=submit],button[type=submit]")];
    const 버튼 = 단추들.find((e) => /search|srch|조회|검색/i.test((e.name || "") + (e.id || "") + (e.value || "") + (e.alt || "")))
      || (단추들.length === 1 ? 단추들[0] : null);        // 이름으로 못 알아도 폼에 제출 단추가 하나뿐이면 그것
    if (날.length < 2 || !버튼) { window.VP말?.("주문관리:폼못맞춤 날짜" + 날.length + " 단추" + (버튼 ? 1 : 0));
      진단적기("주문관리 폼못맞춤: 폼" + document.forms.length + "개(첫 폼 칸 " + form.elements.length + "개) 날짜꼴 칸 " + 날.length + "개["
        + 날.slice(0, 3).map((e) => e.name.split("$").pop() + "=" + e.value).join(",") + "] 제출단추 " + 단추들.length + "개["
        + 단추들.slice(0, 3).map((e) => (e.name || e.id || e.tagName).split("$").pop()).join(",") + "] 창 " + (window === window.top ? "맨위" : "틀안") + " " + location.pathname.split("/").pop());
      return null; }
    const 칸 = { dcStartDt: 날[0], dcEndDt: 날[1] };
    for (const [id, 글] of Object.entries(칸이름표)) { const e = 머리글옆칸(글); if (e) 칸[id] = e; }
    /* ⚠ 한 칸이라도 못 맞추면 **통째로** 배송목록 쪽으로 간다 — 한 검색의 줄이 두 곳에서 섞여 겹치면 안 된다 */
    const 빠진 = Object.keys(칸이름표).filter((id) => !칸[id]);
    if (빠진.length) { window.VP말?.("주문관리:폼못맞춤 빠진 칸 " + 빠진.join(","));
      진단적기("주문관리 폼못맞춤: 못 찾은 칸 " + 빠진.map((id) => 칸이름표[id]).join(",") + " · 찾은 칸 " + Object.keys(칸).filter((k) => 칸이름표[k]).map((k) => 칸이름표[k]).join(",")
        + " · 날짜 " + 날.slice(0, 2).map((e) => e.name.split("$").pop() + "=" + e.value).join(","));
      return null; }
    const 행수 = [...form.elements].find((e) => e.tagName === "SELECT" && /rowcnt|pagesize|pagecnt|listcnt/i.test(e.name + e.id));
    주문틀 = { form, 버튼, 칸, 행수칸: 행수 ? 행수.name : "" };
    window.VP말?.("주문관리:폼읽음 칸 " + Object.keys(칸).join(","));
    진단적기("주문관리 폼읽음: " + Object.entries(칸).map(([k, e]) => (칸이름표[k] || k) + "=" + e.name.split("$").pop()).join(" ")
      + " 단추 " + (버튼.name || 버튼.id).split("$").pop() + "(" + 버튼.type + ")");
    return 주문틀;
  }
  const 날모양 = (본, ymd) => { const m = /^\d{4}([-/.])\d{2}\1\d{2}$/.exec((본 || "").trim());
    return m ? ymd.replace(/-/g, m[1]) : ""; };
  async function 주문관리조회(fields, rowCnt) {
    const t = 주문틀읽기();
    if (!t) return null;
    const 몫 = {};
    for (const [id, v] of Object.entries(fields)) {
      const e = t.칸[id];
      if (!e) { window.VP말?.("주문관리:칸없음 " + id); return null; }   // 맞는 칸이 없으면 지어내지 않는다
      const 값 = /^dc(Start|End)Dt$/.test(id) ? 날모양(e.value, v) : v;
      if (!값) return null;
      몫[e.name] = 값;
    }
    const 글 = await 보내기(t, (n) => n, 몫, rowCnt);
    const r = 표뽑기(글, (doc) => [...doc.querySelectorAll("tr")]
      .filter((tr) => tr.querySelectorAll("th").length >= 5)
      .sort((a, z) => z.querySelectorAll("th").length - a.querySelectorAll("th").length)[0]?.querySelector("th"));
    진단적기(응답말("주문관리", r));
    if (!r.heads.includes("주문번호") || !r.heads.includes("상품명")) {
      window.VP말?.("주문관리:머리줄이 CS 판이 읽는 꼴이 아님 → 배송목록으로");
      진단적기("주문관리 머리줄에 「주문번호」「상품명」 이 없어 배송목록으로 돌아감"); return null; }
    return r;
  }

  /* 주문관리에서는 배송목록 폼이 쪽에 없다 — 배송목록 쪽을 **한 번 받아서** 그 폼으로 묻는다(조회만) */
  let 배송틀캐시 = null;
  async function 배송틀받기() {
    if (!CS전용) return { form, 버튼: searchBtn, 행수칸: fullName("ddlRowCnt") };
    if (!배송틀캐시) 배송틀캐시 = (async () => {
      const res = await fetch("/System/Delivery/firmDvList.aspx", { credentials: "include" });
      const doc = new DOMParser().parseFromString(await res.text(), "text/html");
      const f = doc.forms[0], b = doc.getElementById("btnSearch");
      if (!f || !b) throw new Error("배송목록 폼 없음");
      const 이름들 = [...new FormData(f).keys()];
      f.action = new URL(f.getAttribute("action") || "/System/Delivery/firmDvList.aspx", location.href).href;
      return { form: f, 버튼: b, 행수칸: 이름들.find((n) => n === "ddlRowCnt" || n.endsWith("$ddlRowCnt")) || "ddlRowCnt", 이름들 };
    })();
    return 배송틀캐시;
  }

  /* 지금 자료가 어디서 오는지 화면에 작게 적는다 (CS등록 화면만) — 배송목록으로 돌면 사장님이 알아채시게 */
  let 출처칸 = null, 진단칸 = null;
  const 진단줄 = []; let 폼줄 = "";
  /* 화면에 작게 까닭을 적는다(CS등록 화면만) — 사장님이 그대로 알려 주시면 된다. 최근 세 줄만. */
  function 진단적기(줄) {
    window.VP말?.("진단:" + 줄.slice(0, 80));
    /* 폼 읽은 줄(`주문관리 폼…`)은 늘 맨 위에 붙여 두고, 응답 줄은 최근 둘만 */
    if (/^주문관리 폼/.test(줄)) 폼줄 = 줄; else { 진단줄.push(줄); while (진단줄.length > 2) 진단줄.shift(); }
    if (진단칸) 진단칸.textContent = [폼줄, ...진단줄].filter(Boolean).join("\n");
  }
  const 응답말 = (이름, r) => 이름 + " 응답 " + (마지막응답 ? "HTTP" + 마지막응답.상태 + (마지막응답.넘어옴 ? " 넘어옴→" + 마지막응답.주소 : "") + " 보냄[" + 마지막응답.보낸 + "] " : "")
    + "길이" + r.몸.길이 + (r.몸.로그인칸 ? " 로그인칸있음" : "") + " 제목[" + r.몸.제목 + "] 표" + r.몸.표수 + " 틀" + r.몸.틀
    + " 머리" + r.heads.length + "칸[" + r.heads.slice(0, 8).join(",") + "] 줄" + r.rows.length + " 건수" + r.count + " 줄칸수[" + r.몸.칸수들 + "]";
  function 출처적기(어디) {
    if (!출처칸) return;
    const 주문 = 어디 === "주문관리";
    출처칸.textContent = 주문 ? "자료: 주문관리 조회"
      : "자료: 배송목록 조회 — 주문관리 폼을 못 맞춰 대신 씀 (벤더피아 판매관리→주문관리 폼 칸을 확인해야 합니다)";
    출처칸.classList.toggle("vp-출처-대신", !주문);
  }
  async function fetchList(fields, rowCnt) {
    if (CS전용) {
      const r = await 주문관리조회(fields, rowCnt);
      if (r) { 출처적기("주문관리"); return r; }
      출처적기("배송목록");
    }
    const 틀 = await 배송틀받기();
    const 이름들 = 틀.이름들 || fieldNames;
    const 이름 = (id) => 이름들.find((n) => n === id || n.endsWith("$" + id)) || id;
    const 글 = await 보내기(틀, 이름, fields, rowCnt);
    const r = 표뽑기(글, (doc) => [...doc.querySelectorAll("th")].find((c) => c.textContent.trim() === "수취인"));
    if (CS전용) 진단적기(응답말("배송목록", r));
    return r;
  }

  /* ⚠⚠ 10-15 사장님 (배송관리를 짚으시고, 그대로):
       「불러온 데이터 가로스크롤로 실제 벤더피아의 모든 정보를 동일하게 볼 수 있게해줘」
     가로스크롤은 10-14 에 이미 됐다. 모자란 것은 **칸**이었다 —
     여기 여덟 개만 적어 두고 **그 여덟만 그리고 있었다.** 벤더피아가 준 나머지 칸은
     `fetchList` 가 **받아는 오는데**(`heads`) 그리지 않고 버렸다.
     → 이제 **벤더피아가 준 머리줄(`heads`)을 그대로** 그린다. 이름도 차례도 벤더피아 것이다.
     칸을 줄이지도 합치지도 않는다. 넘치면 **가로로 민다**(10-14 에 깐 그대로). */

  const root = document.createElement("div");
  root.id = "vp-root";
  root.className = "vp-wide";
  root.innerHTML = `
    <div class="vp-search">
      <a class="vp-home" href="/index.aspx">← 메인</a>
      <h1>${CS전용 ? "CS등록" : "배송관리"}</h1>
      <form class="vp-bar">
        <input type="date" name="from" required>
        <span>~</span>
        <input type="date" name="to" required>
        <input name="q" class="vp-q" placeholder="${CS전용 ? "주문번호, 이름, 상품명, 주소, 전화번호…" : "송장번호, 주문번호, 이름, 상품명, 주소, 전화번호, 배송상태…"}">
        <button type="submit">조회</button>
      </form>
      <div class="vp-pills"></div>
      ${CS전용 ? '<div class="vp-출처">자료: 주문관리 폼을 읽는 중…</div><pre class="vp-진단"></pre>' : ""}
      <div class="vp-note"></div>
      <div class="vp-table"></div>
    </div>`;
  document.body.appendChild(root);
  document.documentElement.classList.add("vp-clean");
  출처칸 = root.querySelector(".vp-출처");
  진단칸 = root.querySelector(".vp-진단");

  const bar = root.querySelector(".vp-bar");
  const note = root.querySelector(".vp-note");
  const table = root.querySelector(".vp-table");
  const 알약칸 = root.querySelector(".vp-pills");

  /* ⚠⚠ 10-14 사장님 (배송관리 화면에서 짚어 보내신 말씀, 그대로):
       「벤더피아 배송관리의 실제 필터들을 확인하여 필터를 버튼형식으로 페이지상단에 보여주세요」
     벤더피아 진짜 폼의 고르는 칸은 **열하나**다 (위 SELECTS 줄). 그 가운데 **넷**을 알약으로 깐다.
     나머지 일곱은 지금처럼 검색창에 그 말을 치면 그대로 잡힌다(matchSelect).
     ⚠ **고를 수 있는 값은 짐작하지 않는다** — 그 화면의 <select> 에 든 <option> 을 그때그때 읽는다.
       화면에 없는 칸이나, 「전체」 말고 고를 것이 없는 칸은 **아예 안 그린다.**
     ⚠ 칸 이름(한글)은 id 에서 미루어 적은 것이다. 진짜 화면 글자와 다르면 여기만 고치면 된다. */
  /* ⚠⚠ 10-15 사장님 (배송관리 거르개를 짚으시고, 그대로):
       「지금 형태의 필터링 버튼을 나열하기 보다 각 필터링제목 즉 배송상태 배송사 매출처 별
         드롭다운 해당 선택 하게 해줘 , 송장전송 필터링은 없어도 됨」
     10-14 에 깐 **알약 나열**을 이 말씀이 고쳐 쓰신다 → **제목별 드롭다운 셋.**
     · 제목 단추에 **고른 값이 함께 보인다** (보기: 「배송사 · 경동택배(포천)」).
     · **송장전송은 뺀다** — 사장님이 「없어도 됨」 하셨다.
     · 「전부」 는 갈래마다 맨 앞에 그대로 둔다 (끄는 길).
     ⚠ **거르는 셈은 한 글자도 안 바꿨다** — 바뀐 것은 고르는 **모습**뿐이다. */
  const 거르개들 = [
    ["ddlDStatus", "배송상태"],
    ["ddlDeliveryCo", "배송사"],
    ["ddlStore", "매출처"],
    /* ⑤ CS — 사장님 10-15: 「cs버튼을 추가하여 해당 필터 선택시 cs열값에 값이 있는 목록만
         보이게 해주세요」 (장부 a1792028103)
       ⚠ 이것만은 **벤더피아에 보내는 거르개가 아니다.** 벤더피아에도 `ddlCSType` 칸이
         있으나 그것은 「**어느** CS 인가」 를 고르는 칸이라 「**값이 있는 것만**」 을
         한 번에 못 묻는다. 그래서 **받아 온 줄을 우리가 거른다.**
       ⚠ 받아 온 줄만 거른다 — 「결과가 많아 일부만 받아왔습니다」 가 뜬 조회에서는
         안 받아 온 줄의 CS 는 셈에 안 든다. 기간을 좁히시면 다 든다.
       ⚠ 이름이 `__` 로 시작하는 것은 **벤더피아로 안 보낸다**(`알약값`). */
    ["__cs", "CS", [["", "전부"], ["있음", "CS 있는 것만"]]],
  ];
  const 고른것 = {};                                   // { 칸id: 고른 값 } — 빈 값이면 「전부」

  /* 벤더피아가 준 머리줄에서 CS 칸이 몇 번째인가. -1 이면 그 화면엔 CS 칸이 없다.
     ⚠ 칸 이름을 코드에 박지 않는다 — 머리글에 「cs」 가 든 칸을 찾는다
       (「CS」·「CS구분」·「CS유형」 어느 꼴로 와도 받는다). */
  let cs칸 = -1;
  const cs찾기 = (heads) =>
    (heads || []).findIndex((h) => /cs/i.test(String(h == null ? "" : h).replace(/\s/g, "")));

  let 펼친것 = null;                                   // 지금 펼쳐 둔 갈래 (하나만 펼친다)
  function 알약그리기() {
    알약칸.replaceChildren();
    for (const [id, 이름, 제보기] of 거르개들) {
      let 보기;
      if (제보기) {
        /* 우리 것 (CS) — 머리줄에 그 칸이 **있을 때만** 둔다. 없는 화면에 두면
           눌러도 아무 일이 없는 **가짜 단추**가 된다. 첫 조회로 머리줄을 알면 다시 그린다. */
        if (cs칸 < 0) continue;
        보기 = 제보기;
      } else {
        const sel = document.getElementById(id);
        if (!sel) continue;                            // 그 화면에 없는 칸
        const 전체 = [...sel.options].find((o) => o.text.trim() === "전체");
        const 고를것 = [...sel.options].filter((o) => o !== 전체 && o.text.trim());
        if (고를것.length < 2) continue;               // 고를 것이 하나뿐이면 둘 까닭이 없다
        /* 끄는 길 — 「전부」 가 늘 맨 앞에 있다 */
        보기 = [[전체 ? 전체.value : "", "전부"], ...고를것.map((o) => [o.value, o.text.trim()])];
      }
      const 지금값 = 고른것[id] || "";
      const 지금글 = (보기.find(([값]) => (값 || "") === 지금값) || [, "전부"])[1];

      const 갈래 = document.createElement("div");
      갈래.className = "vp-drop" + (지금값 ? " vp-drop-on" : "");
      const 머리 = document.createElement("button");
      머리.type = "button";
      머리.className = "vp-drop-head";
      머리.setAttribute("aria-expanded", 펼친것 === id ? "true" : "false");
      머리.setAttribute("aria-pressed", 지금값 ? "true" : "false");
      머리.appendChild(Object.assign(document.createElement("span"),
        { className: "vp-drop-name", textContent: 이름 }));
      머리.appendChild(Object.assign(document.createElement("span"),
        { className: "vp-drop-value", textContent: 지금글 }));
      머리.appendChild(Object.assign(document.createElement("span"),
        { className: "vp-drop-arrow", textContent: "▾" }));
      머리.addEventListener("click", (e) => {
        e.stopPropagation();
        펼친것 = 펼친것 === id ? null : id;
        알약그리기();
      });
      갈래.appendChild(머리);

      if (펼친것 === id) {
        const 판 = document.createElement("div");
        판.className = "vp-drop-list";
        for (const [값, 글] of 보기) {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "vp-drop-item";
          b.textContent = 글;
          b.setAttribute("aria-pressed", (값 || "") === 지금값 ? "true" : "false");
          b.addEventListener("click", (e) => {
            e.stopPropagation();
            고른것[id] = 값 || "";
            펼친것 = null;
            알약그리기();
            bar.requestSubmit();                       // 고르면 그 조건으로 바로 다시 조회
          });
          판.appendChild(b);
        }
        갈래.appendChild(판);
      }
      알약칸.appendChild(갈래);
    }
  }
  /* 바깥을 누르면 펼친 것을 접는다 */
  document.addEventListener("click", () => { if (펼친것) { 펼친것 = null; 알약그리기(); } });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && 펼친것) { 펼친것 = null; 알약그리기(); }
  });

  /* 켜진 알약만 조회에 싣는다 (「전부」 는 안 싣는다 — 원래 폼 값 그대로 둔다) */
  const 알약값 = () => Object.fromEntries(Object.entries(고른것)
    .filter(([k, v]) => v && !k.startsWith("__")));    // `__` 로 시작하는 것은 우리끼리 쓰는 것
  알약그리기();
  if (!CS전용) {
    bar.from.value = startDt.value;
    bar.to.value = endDt.value;
  } else {
    /* 기간 첫값 = 주문관리 폼이 보여 주는 기간. 폼을 못 읽으면 최근 30일 */
    const 틀 = 주문틀읽기();
    const ymd = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    const 오늘 = new Date();
    bar.from.value = 틀 ? 틀.칸.dcStartDt.value.trim().replace(/[/.]/g, "-") : ymd(new Date(오늘.getTime() - 30 * 86400000));
    bar.to.value = 틀 ? 틀.칸.dcEndDt.value.trim().replace(/[/.]/g, "-") : ymd(오늘);
    출처적기(틀 ? "주문관리" : "배송목록");
  }
  bar.q.focus();

  /* ④ **상품명 칸을 상품관리의 그 상품버튼으로** — 사장님 10-15:
       「이곳에 도착하는 상품명을 상품관리와 동일한 상품버튼으로 변경해 주세요.
         이버튼으로 나타나는 동작은 상품관리의 상품버튼과 동일 합니다.」
     ⚠ 상품관리 코드를 **베끼지 않는다.** `goods.js` 를 **그대로 불러** 곁다리로 돌리고
       (`window.VP상품단추요청`), 단추는 그 글이 만들어 준다.
     ⚠ `불러오기.js`(확장 안)는 배송관리 쪽에 `goods.js` 를 안 보낸다. 거기를 고치면
       사장님이 **덮어쓰셔야** 한다. 그래서 **이 글이 온 그 주소**에서 형제 파일을 불러온다 —
       깃이든 확장이든, 캐시표(`?v=…&t=…`)까지 그대로 따라온다.
     ⚠ 상품관리에 **없는 이름**은 글자 그대로 둔다. 가짜 단추를 만들지 않는다. */
  const 내주소 = (() => {
    const me = document.currentScript
      || [...document.querySelectorAll("script[src]")].reverse()
           .find((x) => /search\.js(\?|$)/.test(x.src));
    return me ? me.src : null;
  })();
  const 형제 = (이름) => 내주소 && 내주소.replace(/search\.js(?=\?|$)/, 이름);
  function 상품단추불러오기() {
    /* ⚠⚠ 이것은 **뒷길**이다. 10-15 부터는 `불러오기.js`(확장)가 배송관리에도
       `goods.js`·`goods.css` 를 **제대로 보낸다.** 이 길은 확장이 옛 판인 분을 위해 남겨 둔다.
       ⚠ 확장이 이미 보냈으면 **또 넣지 않는다** — 넣으면 같은 글을 두 번 받는다.
         (그래도 `goods.js` 가 스스로 한 번만 돌게 막아 둔다 — 두 겹으로 막는다.) */
    window.VP상품단추요청 = true;                      // 뒤에 올 goods.js 에게 알리는 표
    /* ⚠⚠ **차례를 재서 잡았다 (10-15).** `불러오기.js` 는 `search.js` 를 **먼저** 넣고
         `goods.js` 를 **그 뒤에** 넣는다. 그래서 이 자리에서 `script[src*=goods.js]` 를
         찾아봐도 **아직 없다** — 그 검사는 영영 안 맞는다(재서 확인).
       그러니 **기다렸다가** 본다. 확장이 보냈으면 그동안 `goods.js` 가 돌아
         `__vp굿즈돌았나` 가 서니, 뒷길은 **아예 안 나선다**. 옛 판을 쓰시는 분 화면에서만 나선다. */
    setTimeout(() => {
      if (window.__vp굿즈돌았나 || window.VP상품단추) return;   // 확장이 이미 보냈다
      뒷길로부르기();
    }, 2500);
  }
  function 뒷길로부르기() {
    const js = 형제("goods.js");
    /* ⚠ 까닭을 적는다 (10-15) — 사장님 PC 에서 **조용히** 안 됐다 */
    if (!js) { window.VP말?.("상품단추:내주소못찾음"); return; }
    window.VP말?.("상품단추:부름 " + (js.split("/").pop() || "").slice(0, 24));
    const css = 형제("goods.css");
    if (css && !document.querySelector('link[href*="goods.css"]')) {
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.href = css; l.dataset.vp = "goods.css";
      document.head.appendChild(l);
    }
    const sc = document.createElement("script");
    sc.src = js;
    sc.async = false;
    sc.addEventListener("error", () => window.VP말?.("상품단추:goods.js못받음"));
    sc.addEventListener("load", () => window.VP말?.("상품단추:goods.js받음"
      + (window.VP상품단추 ? "/셈있음" : "/**셈없음**")));
    document.head.appendChild(sc);
  }
  if (!CS전용) 상품단추불러오기();         // CS등록 화면은 상품 단추 대신 상품명으로 상담 판을 연다

  /* ── 상담 이력 ──────────────────────────────────────────
     사장님 10-15: 「**상담할때 고객문의에 이력을 남기는데 이력남길수있게 해주세요**」
     (장부 a1792056118 · 짚은자리 `td.vp-상품칸`, 배송관리 표)

     ⚠⚠ **벤더피아에는 아무것도 안 쓴다.** 집 규칙 — 벤더피아에서는 **조회만**.
       「고객문의」 가 벤더피아 제 칸이면 거기에 안 쓰고, **우리 칸에 따로 쌓아** 그 줄에 보인다.
     ⚠⚠ **사람 칸을 담지 않는다.** 열쇠는 **주문번호** 하나뿐이고, 담는 것은
       **적으신 글 · 적은 때 · 적은이** 셋뿐이다. 수취인 이름·전화·주소는 **긁어 담지 않는다.**
       (사장님이 글 안에 손으로 적으시는 것은 사장님 뜻이다 — 그것까지 막지 않는다.)
     ⚠⚠ **지우는 길을 만들지 않는다.** 이력은 쌓이는 기록이다. 고치면 앞 글을 남기고
       새 줄을 쌓는다. 책임 기록이라 사장님도 저도 지우지 않는다(바이글 10-15).
     ⚠ 칸 이름에 `vp_` 를 쓰지 않는다 — 그 꼴은 사장님 uid 라야 손이 닿는다. `vpcs_note` 다.
     ⚠ 창고 칸 이름은 **아스키**로 둔다(`ord`·`cnt`·`at`·`log`). 주소에 실려 가는 이름이라
       한글은 번지수가 길어지고 가리기 쉽다. 화면에 보이는 말은 한글 그대로다. */
  const 상담칸 = "vpcs_note";
  const 상담 = {
    KEY: "AIzaSyB9X_hzd2D3goQ7oenK53Pz805P1c7oSqs",
    PROJ: "vivivic-4b7ef",
  };
  const 상담뿌리 = () => `https://firestore.googleapis.com/v1/projects/${상담.PROJ}`
    + `/databases/(default)/documents/artifacts/${상담.PROJ}/public/data/${상담칸}`;
  /* 주문번호를 문서 이름으로 쓴다. 창고가 못 받는 글자는 `_` 로 바꾼다. */
  const 상담열쇠 = (주문) => String(주문 == null ? "" : 주문).trim()
    .replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 180);

  /* 밖으로 나가는 길 — **읽기는 확장 다리를 먼저** 쓴다(벤더피아 쪽 CSP 에 안 묶인다).
     ⚠⚠ **쓰기는 다리로 보내지 않는다.** 다리는 읽기만 지나가게 막아 두었고
       (`불러오기.js` 의 `허락한셈`), 그 막음을 **넓히지 않는다.** 쓰기는 화면 쪽에서 바로 보낸다 —
       화면 쪽 받아오기는 원래 누구나 할 수 있는 것이라 확장 권한이 **안 넓어진다.**
       ⚠ 다만 벤더피아 쪽 CSP(`connect-src`)가 막으면 **쓰기가 안 된다.** 그때는 조용히
         지나가지 않고 **까닭을 적고 화면에 알린다**(아래 `상담쓰기`). */
  let 상담표 = null;
  async function 상담로그인() {
    try {
      const 둔것 = JSON.parse(localStorage.getItem("vg.tok") || "null");
      if (둔것 && 둔것.until > Date.now() + 60000) return 둔것.tok;
    } catch (e) {}
    const 주소 = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${상담.KEY}`;
    const 옵션 = { method: "POST", headers: { "Content-Type": "application/json" },
                   body: JSON.stringify({ returnSecureToken: true }) };
    let 글 = null;
    if (window.VP밖에) {
      const 답 = await window.VP밖에(주소, 옵션);
      if (답 && 답.다리 && 답.ok) 글 = 답.글;
    }
    if (글 === null) {
      const r = await fetch(주소, Object.assign({ credentials: "omit" }, 옵션));
      if (!r.ok) throw new Error("표 " + r.status);
      글 = await r.text();
    }
    const d = JSON.parse(글);
    if (!d.idToken) throw new Error("표 없음");
    try { localStorage.setItem("vg.tok", JSON.stringify({ tok: d.idToken, until: Date.now() + 3300000 })); } catch (e) {}
    return d.idToken;
  }
  const 상담표받기 = async () => (상담표 = 상담표 || await 상담로그인());

  async function 상담읽기(주소) {                      // GET — 다리를 먼저
    const tok = await 상담표받기();
    const 옵션 = { headers: { Authorization: "Bearer " + tok } };
    if (window.VP밖에) {
      const 답 = await window.VP밖에(주소, 옵션);
      if (답 && 답.다리) return { ok: 답.ok, status: 답.status, 글: 답.글 };
    }
    const r = await fetch(주소, Object.assign({ credentials: "omit" }, 옵션));
    return { ok: r.ok, status: r.status, 글: await r.text() };
  }

  /* 창고 꼴 ↔ 보통 값 */
  const 풀기 = (v) => {
    if (!v) return null;
    if ("stringValue" in v) return v.stringValue;
    if ("integerValue" in v) return Number(v.integerValue);
    if ("doubleValue" in v) return v.doubleValue;
    if ("booleanValue" in v) return v.booleanValue;
    if ("nullValue" in v) return null;
    if ("arrayValue" in v) return (v.arrayValue.values || []).map(풀기);
    if ("mapValue" in v) {
      const o = {};
      for (const [k, x] of Object.entries(v.mapValue.fields || {})) o[k] = 풀기(x);
      return o;
    }
    return null;
  };
  const 싸기 = (v) => {
    if (v === null || v === undefined) return { nullValue: null };
    if (typeof v === "number") return Number.isInteger(v)
      ? { integerValue: String(v) } : { doubleValue: v };
    if (Array.isArray(v)) return { arrayValue: { values: v.map(싸기) } };
    if (typeof v === "object") return { mapValue: { fields:
      Object.fromEntries(Object.entries(v).map(([k, x]) => [k, 싸기(x)])) } };
    return { stringValue: String(v) };
  };

  /* 적은이 — 벤더피아에 들어와 계신 아이디. 손님 칸이 아니라 **우리 쪽 사람**이다. */
  const 적은이 = () => decodeURIComponent((document.cookie.match(/VP_Cookie=([^;]*)/) || [])[1] || "")
    .match(/LOGON_EMP_NO=([^&]*)/)?.[1] || "";

  const 상담셈 = new Map();                            // 열쇠 → 쌓인 줄 수
  let 주문칸자리 = -1;
  const 상담칸들 = [];                                 // [칸, 주문번호] — 늦게 와도 점을 찍는다

  /* 어느 줄에 이력이 있나 — **셈만** 받는다(`mask`). 글까지 받으면 쌓일수록 무거워진다. */
  async function 상담셈받기() {
    try {
      /* ⚠ `ord`·`at` 도 같이 받는다 — **CS등록 판**이 「무슨 주문인지·언제인지」 를 보여야 한다
           (10-16 사장님 「cs등록 항목을 만들어줘」). `log` 는 안 받는다 — 길고 여기선 안 쓴다. */
      const 답 = await 상담읽기(상담뿌리()
        + "?pageSize=300&mask.fieldPaths=cnt&mask.fieldPaths=open&mask.fieldPaths=kind"
        + "&mask.fieldPaths=ord&mask.fieldPaths=at");
      if (!답.ok) { window.VP말?.("상담:셈못받음 " + 답.status); return; }
      let 연것 = 0;
      for (const d of (JSON.parse(답.글).documents || [])) {
        const 이름 = String(d.name || "").split("/").pop();
        const f = d.fields || {};
        상담셈.set(이름, { 수: 풀기(f.cnt) || 0, 열림: !!풀기(f.open), 종류: 풀기(f.kind) || "",
                          주문: 풀기(f.ord) || 이름, 때: Number(풀기(f.at)) || 0 });
        if (풀기(f.open)) 연것++;
      }
      window.VP말?.("상담:이력있는줄 " + 상담셈.size + "개 · 안끝난접수 " + 연것 + "건");
      for (const [칸, 주문] of 상담칸들) 상담점찍기(칸, 주문);
    } catch (e) {
      window.VP말?.("상담:셈못받음 " + (e && e.message ? e.message : e));
    }
  }

  /* ⚠ **접수 안 끝난 것은 더 또렷하게.** 사장님이 그걸 찾으시려고 쓰신다(바이글 10-15). */
  function 상담점찍기(칸, 주문) {
    const 알 = 칸.querySelector(".vp-상담알");
    if (!알) return;
    const 것 = 상담셈.get(상담열쇠(주문)) || { 수: 0, 열림: false, 종류: "" };
    알.classList.toggle("vp-있음", 것.수 > 0);
    알.classList.toggle("vp-열림", !!것.열림);
    알.textContent = 것.열림 ? (것.종류 || "접수") + " 접수중"
      : 것.수 > 0 ? "상담 " + 것.수 : "상담";
  }

  /* 주문번호 칸에 **작은 단추 하나**만 더한다 — 칸을 새로 내지 않는다.
     (배송관리 23칸을 밀어내지 않는다 — 사장님이 그 칸을 다 보셔야 한다) */
  function 상담단추(td, 주문, 상품명, 줄, 머리) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "vp-상담알";
    b.title = "상담 이력 · 교환 · 반품 · AS 접수";
    b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); 상담판열기(주문, 상품명, 줄, 머리); });
    td.appendChild(b);
    상담칸들.push([td, 주문]);
    상담점찍기(td, 주문);
  }

  /* ── 상담 판 ── */
  let 상담판 = null;
  function 상담판닫기() { if (상담판) { 상담판.remove(); 상담판 = null; } }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { 상담판닫기(); CS판닫기(); } });

  const 접수종류 = ["교환", "반품", "AS"];
  const 접수상태 = ["접수", "처리중", "끝"];

  /* ── CS등록 (10-16) ──────────────────────────────────────
     사장님: 「**cs등록 항목을 만들어줘**」(장부 a1792145842) — 메뉴 화면을 짚어 보내셨다.
     메뉴의 「CS등록」 은 배송관리로 오면서 `#vgCS` 를 달고 온다(`menu.js`). 그것을 보고 이 판을 연다.
     ⚠ **상담 판을 두 벌로 만들지 않는다.** 여기서는 **남긴 것을 모아 보여 주고**,
       누르면 배송관리 줄에서 여는 **그 상담 판**(`상담판열기`)을 그대로 연다.
     ⚠ 주문번호를 모르실 때는 배송관리 표에서 그 줄의 「상담」 단추로 여시면 된다 —
       여기에는 **주문번호로 바로 여는 길**을 둔다(치시거나 붙여 넣으시면 된다).
     ⚠ 사람 칸(수취인·전화·주소)은 **한 글자도 안 싣는다.** 창고에 담지도 않았다. */
  let CS판 = null;
  function CS판닫기() { if (CS판) { CS판.remove(); CS판 = null; } }

  /* 찾은 주문을 줄마다 보인다 — 이름·지역·전화·상품명·주문번호. 상품명을 누르면 그 주문의 상담 판이 열린다.
     ⚠ 보이기만 한다 — 창고에 싣지 않는다. */
  function CS결과그리기(칸, 줄들, 머리, 끝) {
    if (!줄들.length) { 칸.textContent = 끝 ? "찾은 주문이 없습니다." : "찾는 중…"; return; }
    const 자리 = (re) => 머리.findIndex((h) => re.test(String(h || "").replace(/\s/g, "")));
    const 값 = (줄, i) => (i < 0 || 줄[i] == null ? "" : String(줄[i]).trim());
    const 상 = 머리.indexOf("상품명"), 주 = 머리.indexOf("주문번호");
    const 받 = 머리.indexOf("수취인"), 시 = 자리(/^주문자/), 소 = 자리(/주소/);
    const 전 = 머리.map((h, i) => (/전화|연락|휴대|핸드폰|tel|hp/i.test(String(h || "")) ? i : -1)).filter((i) => i >= 0);
    const 만들기 = 줄들.map(({ 줄 }) => {
      const 주문 = 값(줄, 주);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "vp-cs줄 vp-cs찾은";
      const 상품명 = 값(줄, 상);
      b.appendChild(document.createElement("strong")).textContent = 상품명 || "(상품명 없음)";
      const 사람 = [값(줄, 받), 값(줄, 시) && 값(줄, 시) !== 값(줄, 받) ? "주문자 " + 값(줄, 시) : ""].filter(Boolean).join(" · ");
      const 번호들 = [...new Set(전.map((i) => 값(줄, i)).filter(Boolean))].join(" / ");
      const 가 = b.appendChild(document.createElement("small"));
      가.textContent = [사람, 번호들, 값(줄, 소), 주문 && "주문 " + 주문].filter(Boolean).join(" · ");
      const 접수 = 상담셈.get(상담열쇠(주문));
      if (접수 && (접수.수 > 0 || 접수.열림)) {
        const t = b.appendChild(document.createElement("small"));
        t.textContent = (접수.열림 ? (접수.종류 || "접수") + " 접수중 · " : "") + "상담 " + (접수.수 || 0);
        if (접수.열림) b.classList.add("vp-열림");
      }
      b.addEventListener("click", () => {
        if (!주문) return;
        CS판닫기();
        상담판열기(주문, 상품명, 줄, 머리);
      });
      return b;
    });
    const 머릿글 = document.createElement("p");
    머릿글.className = "vp-cs없음";
    머릿글.textContent = 줄들.length + "건" + (끝 ? "" : " · 더 찾는 중…") + " — 상품명을 누르면 상담·접수 판이 열립니다.";
    칸.replaceChildren(머릿글, ...만들기);
  }

  async function CS판열기() {
    CS판닫기();
    const 덮개 = document.createElement("div");
    덮개.className = "vp-상담덮개 vp-cs덮개";
    덮개.innerHTML = `<div class="vp-상담판 vp-cs판" role="dialog" aria-label="CS등록">
      <div class="vp-상담머리"><strong>CS등록</strong><small></small>
        <button type="button" class="vp-상담닫기" aria-label="닫기">×</button></div>
      <form class="vp-cs찾기">
        <input type="text" placeholder="이름 · 지역 · 전화번호 · 주문상품명 · 주문번호 …">
        <button type="submit">찾기</button>
      </form>
      <div class="vp-cs결과" hidden></div>
      <div class="vp-cs목록">불러오는 중…</div></div>`;
    덮개.querySelector(".vp-상담닫기").addEventListener("click", CS판닫기);
    덮개.addEventListener("mousedown", (e) => { if (e.target === 덮개) CS판닫기(); });
    document.getElementById("vp-root")?.appendChild(덮개) || document.body.appendChild(덮개);
    CS판 = 덮개;

    const 칸 = 덮개.querySelector(".vp-cs찾기 input");
    const 결과칸 = 덮개.querySelector(".vp-cs결과");
    let 찾는번호 = 0;
    덮개.querySelector(".vp-cs찾기").addEventListener("submit", async (e) => {
      e.preventDefault();
      const 말 = 칸.value.trim();
      const 번호 = ++찾는번호;
      if (!말) { 결과칸.hidden = true; 결과칸.replaceChildren(); 칸.focus(); return; }
      결과칸.hidden = false;
      결과칸.textContent = "찾는 중…";
      const 줄들 = [];
      let 머리 = null;
      const 보이기 = (끝) => {
        if (번호 !== 찾는번호) return;
        CS결과그리기(결과칸, 줄들, 머리, 끝);
      };
      try {
        /* 검색어 나눠 보내기는 배송관리 검색창의 `plan`·`fetchList` 를 그대로 쓴다. */
        const { filters, variants, local } = plan(말);
        const 오늘 = new Date(), 먼저 = new Date(오늘.getTime() - 400 * 86400000);
        const ymd = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0")
          + "-" + String(d.getDate()).padStart(2, "0");
        const 날 = { dcStartDt: ymd(먼저), dcEndDt: ymd(오늘) };
        const 봤다 = new Set();
        for (const [이름, 칸들] of variants) {
          const r = await fetchList({ ...날, ...filters, ...칸들 }, 이름 === "전체" ? "600" : "100");
          if (번호 !== 찾는번호) return;
          if (!머리 && r.heads.length) 머리 = r.heads;
          for (const row of r.rows) {
            const 키 = row.join("\t");
            if (봤다.has(키)) continue;
            봤다.add(키);
            const 글 = row.join(" "), 숫자 = 글.replace(/\D/g, "");
            if (!local.every((w) => 글.includes(w) || (/^[\d-]+$/.test(w) && 숫자.includes(w.replace(/-/g, ""))))) continue;
            줄들.push({ 줄: row, 머리: r.heads });
          }
          보이기(false);
        }
        보이기(true);
      } catch (err) {
        if (번호 === 찾는번호) 결과칸.textContent = "조회에 실패했습니다. 다시 로그인한 뒤 시도해 주세요.";
        window.VP말?.("CS찾기:실패 " + (err && err.message ? err.message : err));
      }
    });
    setTimeout(() => 칸.focus(), 0);

    if (!상담셈.size) await 상담셈받기();
    const 목록 = 덮개.querySelector(".vp-cs목록");
    const 줄들 = [...상담셈.entries()]
      .filter(([, v]) => (v.수 || 0) > 0 || v.열림)
      .sort((a, z) => (z[1].때 || 0) - (a[1].때 || 0));
    덮개.querySelector(".vp-상담머리 small").textContent = "남긴 것 " + 줄들.length + "건";
    if (!줄들.length) {
      목록.replaceChildren(Object.assign(document.createElement("p"),
        { className: "vp-cs없음", textContent: "아직 남긴 것이 없습니다. 주문번호로 새로 남기십시오." }));
      return;
    }
    목록.replaceChildren(...줄들.map(([, v]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "vp-cs줄" + (v.열림 ? " vp-열림" : "");
      b.appendChild(document.createElement("strong")).textContent = v.주문;
      const 적 = b.appendChild(document.createElement("small"));
      적.textContent = (v.열림 ? (v.종류 || "접수") + " 접수중 · " : "") + "상담 " + (v.수 || 0)
        + (v.때 ? " · " + new Date(v.때 * 1000).toLocaleDateString("ko-KR") : "");
      b.addEventListener("click", () => { CS판닫기(); 상담판열기(v.주문, ""); });
      return b;
    }));
  }

  /* 메뉴에서 「CS등록」 으로 들어오면 바로 연다. ⚠ 주소의 `#vgCS` 하나만 본다 —
     그 표가 없으면 배송관리는 **전과 똑같이** 뜬다. */
  function CS등록인가() { return /(^|[#&])vgCS\b/i.test(location.hash || ""); }
  /* ⚠ 주문관리 위(CS전용)에서는 화면 자체가 CS등록이다 — 위에 덮개를 또 열지 않는다(10-22) */
  if (!CS전용) {
    if (CS등록인가()) setTimeout(() => { CS판열기(); }, 400);
    window.addEventListener("hashchange", () => { if (CS등록인가()) CS판열기(); });
  }

  /* ── 고객정보 (10-21) ──────────────────────────────────
     사장님: 「cs등록할때 주문관리에 있는 모든 고객정보가 확인되게 해주세요」(장부 a1792555506)
     CS 판(상담 판)을 열면 그 주문의 **벤더피아 배송목록 한 줄을 머리줄과 짝지어 전부** 보인다
     (주문자·수취인·연락처·주소… 벤더피아가 준 칸 모두, 이름·차례 그대로).
     ⚠ 배송관리 표에서 열면 이미 받은 그 줄을, CS등록에서 주문번호로 열면 **그 자리에서 벤더피아에 조회**한다.
     ⚠ **보이기만 한다.** 창고(`vpcs_note`)에 싣지 않는다 — 늘 벤더피아에 바로 묻는다. 벤더피아에는 조회만. */
  async function 고객줄받기(주문) {
    const 오늘 = new Date(), 먼저 = new Date(오늘.getTime() - 400 * 86400000);
    const ymd = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0")
      + "-" + String(d.getDate()).padStart(2, "0");
    const r = await fetchList({ dcStartDt: ymd(먼저), dcEndDt: ymd(오늘), tbSOrderNo: 주문 }, "50");
    /* ⚠ 주문번호가 **똑같은 줄만** 쓴다 — 다른 사람 줄을 대신 보이면 안 된다. 없으면 없다고 알린다. */
    const 줄 = r.rows.find((x) => x.some((v) => String(v).trim() === String(주문).trim()));
    return 줄 ? { 줄, 머리: r.heads } : null;
  }
  function 고객그리기(칸, 줄, 머리) {
    칸.replaceChildren();
    const 틀 = 칸.appendChild(document.createElement("dl"));
    틀.className = "vp-고객목록";
    머리.forEach((이름, i) => {
      const 값 = 줄[i] === undefined || 줄[i] === null ? "" : String(줄[i]).trim();
      if (!이름 || !값) return;
      틀.appendChild(document.createElement("dt")).textContent = 이름;
      틀.appendChild(document.createElement("dd")).textContent = 값;
    });
    if (!틀.children.length) 칸.textContent = "고객정보가 비어 있습니다.";
  }

  async function 상담판열기(주문, 상품명, 받은줄, 받은머리) {
    상담판닫기();
    const 열쇠 = 상담열쇠(주문);
    if (!열쇠) return;
    const 덮개 = document.createElement("div");
    덮개.className = "vp-상담덮개";
    덮개.innerHTML = `<div class="vp-상담판" role="dialog" aria-label="상담 이력과 접수">
      <div class="vp-상담머리"><strong></strong><small></small>
        <button type="button" class="vp-상담닫기" aria-label="닫기">×</button></div>
      <div class="vp-고객정보">고객정보 불러오는 중…</div>
      <div class="vp-상담접수"></div>
      <div class="vp-상담목록">불러오는 중…</div>
      <form class="vp-상담적기">
        <div class="vp-상담고르기">
          <span class="vp-상담라벨">접수</span>
          ${접수종류.map((k) => `<button type="button" class="vp-상담종류" data-k="${k}">${k}</button>`).join("")}
        </div>
        <textarea rows="3" placeholder="오간 말을 적으십시오 (지울 수 없습니다 — 쌓입니다)"></textarea>
        <div class="vp-상담발"><span class="vp-상담알림"></span><button type="submit">남기기</button></div>
      </form></div>`;
    덮개.querySelector("strong").textContent = 상품명 || "상담";
    덮개.querySelector(".vp-상담머리 small").textContent = "주문 " + 주문;
    덮개.querySelector(".vp-상담닫기").addEventListener("click", 상담판닫기);
    덮개.addEventListener("mousedown", (e) => { if (e.target === 덮개) 상담판닫기(); });
    document.getElementById("vp-root")?.appendChild(덮개) || document.body.appendChild(덮개);
    상담판 = 덮개;

    const 목록 = 덮개.querySelector(".vp-상담목록");
    const 접수칸 = 덮개.querySelector(".vp-상담접수");
    const 고객칸 = 덮개.querySelector(".vp-고객정보");
    if (받은줄 && 받은머리) 고객그리기(고객칸, 받은줄, 받은머리);
    else 고객줄받기(주문).then((답) => {
      if (답) 고객그리기(고객칸, 답.줄, 답.머리);
      else 고객칸.textContent = "벤더피아 배송목록에서 이 주문을 찾지 못했습니다.";
    }).catch((e) => {
      고객칸.textContent = "고객정보를 못 읽었습니다. 다시 로그인한 뒤 시도해 주세요.";
      window.VP말?.("고객정보:못읽음 " + (e && e.message ? e.message : e));
    });
    const 알림 = 덮개.querySelector(".vp-상담알림");
    const 적기 = 덮개.querySelector(".vp-상담적기");
    const 글칸 = 덮개.querySelector("textarea");
    let 쌓인것 = [], 지금접수 = null, 고른종류 = "";

    /* 종류 단추 — 하나만 켜진다. 다시 누르면 꺼진다(그냥 상담만 남기실 때). */
    for (const b of 덮개.querySelectorAll(".vp-상담종류")) {
      b.addEventListener("click", () => {
        고른종류 = 고른종류 === b.dataset.k ? "" : b.dataset.k;
        for (const x of 덮개.querySelectorAll(".vp-상담종류"))
          x.setAttribute("aria-pressed", x.dataset.k === 고른종류 ? "true" : "false");
        적기.querySelector("button[type=submit]").textContent = 고른종류 ? 고른종류 + " 접수" : "남기기";
      });
    }

    const 접수그리기 = () => {
      접수칸.replaceChildren();
      if (!지금접수 || !지금접수.k) { 접수칸.hidden = true; return; }
      접수칸.hidden = false;
      const 줄 = 접수칸.appendChild(document.createElement("div"));
      줄.className = "vp-상담접수줄" + (지금접수.st !== "끝" ? " vp-열림" : "");
      const 이름 = 줄.appendChild(document.createElement("strong"));
      이름.textContent = 지금접수.k + " 접수";
      const 때 = 줄.appendChild(document.createElement("small"));
      때.textContent = 지금접수.at ? new Date(지금접수.at * 1000).toLocaleString("ko-KR") : "";
      const 고름 = 줄.appendChild(document.createElement("div"));
      고름.className = "vp-상담상태";
      for (const st of 접수상태) {
        const b = 고름.appendChild(document.createElement("button"));
        b.type = "button";
        b.textContent = st;
        b.setAttribute("aria-pressed", 지금접수.st === st ? "true" : "false");
        /* ⚠ 지우지 않는다 — 상태를 바꾸면 **새 줄로 쌓는다**(바이글 10-15). */
        b.addEventListener("click", () => 남기기({ 글: 지금접수.k + " 접수 → " + st,
                                                  종류: 지금접수.k, 상태: st }));
      }
    };

    const 그리기 = () => {
      접수그리기();
      if (!쌓인것.length) { 목록.textContent = "아직 남긴 것이 없습니다."; return; }
      목록.replaceChildren(...쌓인것.slice().reverse().map((x) => {
        const 줄 = document.createElement("div");
        줄.className = "vp-상담줄";
        const 머리 = 줄.appendChild(document.createElement("small"));
        const 때 = x.at ? new Date(x.at * 1000) : null;
        머리.textContent = (때 ? 때.toLocaleString("ko-KR") : "") + (x.by ? " · " + x.by : "");
        if (x.k) {
          const 표 = 머리.appendChild(document.createElement("b"));
          표.className = "vp-상담표";
          표.textContent = x.k;
        }
        const 몸 = 줄.appendChild(document.createElement("p"));
        몸.textContent = x.s || "";
        return 줄;
      }));
    };

    async function 남기기({ 글, 종류, 상태 }) {
      const 단추 = 적기.querySelector("button[type=submit]");
      단추.disabled = true;
      알림.textContent = "남기는 중…";
      try {
        const 온것 = await 상담쓰기(열쇠, 주문, { 글, 종류, 상태, 앞것: 쌓인것, 앞접수: 지금접수 });
        쌓인것 = 온것.log;
        지금접수 = 온것.req;
        상담셈.set(열쇠, { 수: 쌓인것.length, 열림: 온것.open, 종류: (온것.req && 온것.req.k) || "" });
        for (const [칸, 주] of 상담칸들) 상담점찍기(칸, 주);
        글칸.value = "";
        고른종류 = "";
        for (const x of 덮개.querySelectorAll(".vp-상담종류")) x.setAttribute("aria-pressed", "false");
        단추.textContent = "남기기";
        알림.textContent = "남겼습니다";
        그리기();
      } catch (err) {
        /* ⚠ **조용히 지나가지 않는다.** 사장님께 글로 알리고 까닭도 적는다. */
        알림.textContent = "못 남겼습니다 — " + (err && err.message ? err.message : err);
        window.VP말?.("상담:못남김 " + (err && err.message ? err.message : err));
      } finally {
        단추.disabled = false;
      }
    }

    try {
      const 답 = await 상담읽기(상담뿌리() + "/" + encodeURIComponent(열쇠));
      if (답.ok) {
        const f = JSON.parse(답.글).fields || {};
        쌓인것 = (풀기(f.log) || []).filter(Boolean);
        지금접수 = 풀기(f.req) || null;
      } else if (답.status !== 404) { 목록.textContent = "못 읽었습니다 (" + 답.status + ")"; return; }
      그리기();
    } catch (e) {
      목록.textContent = "못 읽었습니다";
      window.VP말?.("상담:읽기못함 " + (e && e.message ? e.message : e));
      return;
    }

    적기.addEventListener("submit", (e) => {
      e.preventDefault();
      const 글 = 글칸.value.trim();
      if (!글 && !고른종류) return;
      /* 종류를 고르셨으면 **접수**다 — 그래도 **이력 줄로 같이 쌓인다**
         (사장님 10-15: 「이력을 남기면서 **동시에**」). */
      남기기({ 글: 글 || (고른종류 + " 접수"), 종류: 고른종류,
               상태: 고른종류 ? "접수" : "" });
    });
    글칸.focus();
  }

  /* 한 줄 쌓기 — **앞 글을 그대로 두고 뒤에 더한다.** 지우지 않는다.
     ⚠ 쓰기는 **화면 쪽에서 바로** 보낸다. 확장 다리는 읽기만 지나가게 막혀 있고
       그 막음을 넓히지 않는다(10-15). */
  async function 상담쓰기(열쇠, 주문, { 글, 종류, 상태, 앞것, 앞접수 }) {
    const tok = await 상담표받기();
    const 이제 = Math.floor(Date.now() / 1000);
    const 적은 = 적은이();
    const 쌓기 = (앞것 || []).concat([{ s: 글, at: 이제, by: 적은, k: 종류 || "" }]);
    /* 접수 — 종류를 고르셨으면 새로 열고, 상태만 바뀌면 그 접수의 상태를 고친다.
       ⚠ 앞 줄은 **그대로 둔다.** 취소는 「끝」 으로 바꾸고 그 사실이 **새 줄로** 남는다. */
    let 접수 = 앞접수 || null;
    if (종류) 접수 = { k: 종류, at: (접수 && 접수.k === 종류 && 접수.at) || 이제,
                      by: (접수 && 접수.k === 종류 && 접수.by) || 적은,
                      st: 상태 || "접수" };
    const 열림 = !!(접수 && 접수.k && 접수.st !== "끝");
    const 주소 = 상담뿌리() + "/" + encodeURIComponent(열쇠)
      + "?updateMask.fieldPaths=ord&updateMask.fieldPaths=cnt&updateMask.fieldPaths=at"
      + "&updateMask.fieldPaths=log&updateMask.fieldPaths=req"
      + "&updateMask.fieldPaths=open&updateMask.fieldPaths=kind";
    const 몸 = JSON.stringify({ fields: {
      ord: 싸기(String(주문)), cnt: 싸기(쌓기.length), at: 싸기(이제), log: 싸기(쌓기),
      req: 접수 ? 싸기(접수) : { nullValue: null },
      open: { booleanValue: 열림 }, kind: 싸기((접수 && 접수.k) || "") } });
    /* ⚠⚠ **다리를 먼저** 쓴다 (10-15). 벤더피아 쪽 `connect-src` 는 받는 것만이 아니라
         **보내는 것도 같이 막는다** — `fetch` 는 읽기든 쓰기든 한 울타리다. 그래서
         「쓰기만 화면 쪽에서」 는 안 통한다(⑧ 수입정보가 안 됐던 그 까닭이다).
         다리는 그 CSP 에 안 묶인다. 다리가 없으면(확장이 옛 판) 전처럼 바로 보낸다.
       ⚠ 다리는 이 한 길만 받는다 — `vpcs_note` 의 한 문서 자리에 `PATCH`.
         `:commit`·`:batchWrite`·`DELETE`·딴 칸은 **계속 막혀 있다**(`불러오기.js`). */
    const 옵션 = { method: "PATCH",
      headers: { Authorization: "Bearer " + tok, "Content-Type": "application/json" }, body: 몸 };
    let 길 = "바로", ok = false, 번호 = 0, 탈 = "";
    if (window.VP밖에) {
      const 답 = await window.VP밖에(주소, 옵션);
      if (답 && 답.다리) { 길 = "다리"; ok = !!답.ok; 번호 = 답.status; 탈 = 답.탈 || ""; }
    }
    if (길 === "바로") {
      const r = await fetch(주소, Object.assign({ credentials: "omit" }, 옵션));
      ok = r.ok; 번호 = r.status;
    }
    if (!ok) throw new Error("창고 " + 번호 + (탈 ? "/" + 탈 : "") + " (" + 길 + ")");
    window.VP말?.("상담:남김 " + 쌓기.length + "줄/" + 길
      + (열림 ? " · " + 접수.k + " " + 접수.st : ""));
    return { log: 쌓기, req: 접수, open: 열림 };
  }

  let tbody = null;
  let currentSearch = 0;
  /* 상품명 칸들을 적어 둔다 — 목록이 늦게 와도 그때 단추로 바꿔 끼운다 */
  let 상품칸들 = [];
  let 상품칸자리 = -1;
  let 단추된것 = 0;
  function 상품칸채우기(td, 이름) {
    const 만들기 = window.VP상품단추;
    const b = 만들기 ? 만들기(이름) : null;
    if (!b) { td.textContent = 이름; return false; }   // 상품관리에 없는 이름 → 글자 그대로
    td.replaceChildren(b);
    단추된것++;
    return true;
  }
  /* ⚠ 까닭 적기 — **그려 놓고 보니** 몇 칸이 단추가 됐나. 이것이 ⑤ 를 가른다:
       칸이 0개면 상품명 칸을 못 찾은 것, 칸은 있고 단추가 0개면 **이름이 하나도 안 맞은** 것. */
  const 상품칸셈적기 = () => window.VP말?.(
    "상품칸:" + 상품칸들.length + "개중 단추" + 단추된것 + "개");
  window.addEventListener("vp상품단추준비", () => {
    let 바뀐것 = 0;
    for (const [td, 이름] of 상품칸들) if (상품칸채우기(td, 이름)) 바뀐것++;
    window.VP말?.("상품단추:준비 상품" + (window.VP상품목록몇개?.() ?? "?")
      + "가지 · 늦게바꾼칸 " + 바뀐것 + "개");
    상품칸셈적기();
  });

  let 그린머리 = null;                                 // 지금 그려 둔 머리줄 (벤더피아가 준 그대로)
  /* ⚠⚠ **머리줄 배우기는 줄 수와 떼어 놓는다 (10-15).**
       전에는 이 일이 `addRows` 안에 있었다. 그런데 `addRows` 는 첫 줄이
       `if (!rows.length) return;` 이다 — **줄이 하나도 없으면 바로 돌아선다.**
       그러면 머리줄을 영영 못 배우고 **CS 거르개가 끝내 안 선다.**
       줄이 0 이 되는 길이 셋이나 있다:
         ㄱ) 벤더피아가 「총 0 건」 을 줄 때
         ㄴ) 검색어로 우리가 거른 뒤 하나도 안 남을 때
         ㄷ) 「CS 있는 것만」 으로 거른 뒤 하나도 안 남을 때
       그래서 **받자마자**(`take` 맨 앞) 머리줄만 따로 배운다. 거르기 전이다.
       사장님 10-15: CS 단추가 안 섰다 — 바이글이 이 길을 짚어 주었다. */
  let 머리본것 = null;
  function 머리알기(heads) {
    if (!heads || !heads.length) {
      /* `fetchList` 는 머리줄을 **「수취인」 칸으로** 찾는다. 그 칸이 없으면 아무것도 못 읽는다. */
      window.VP말?.("머리줄:못읽음(수취인칸없음)");
      return;
    }
    const 글 = heads.join("\u0001");
    if (머리본것 === 글) return;                       // 같은 머리줄은 한 번만
    머리본것 = 글;
    /* ⑤ CS 칸이 있으면 거르개 줄에 CS 를 내놓는다 */
    const 찾은것 = cs찾기(heads);
    if (찾은것 !== cs칸) { cs칸 = 찾은것; 알약그리기(); }
    /* ④ 상품명 칸이 몇 번째인가 — 그 칸만 단추로 바꾼다 */
    상품칸자리 = heads.indexOf("상품명");
    /* 상담 이력 — 열쇠는 **주문번호** 하나뿐이다(사람 칸은 안 쓴다).
       ⚠ 사장님 화면에는 「주문번호」 가 **두 칸** 있다. 앞엣것을 쓴다 — `indexOf` 가 그렇게 집는다. */
    주문칸자리 = heads.indexOf("주문번호");
    if (주문칸자리 < 0) window.VP말?.("상담:주문번호칸없음");
    else if (!상담셈.size) 상담셈받기();
    /* ⚠ 까닭을 적는다 — 못 찾았으면 **벤더피아가 준 칸 이름 그대로** 적는다.
         그래야 「CS」 인지 「CS구분」 인지 「cs상태」 인지 사장님 화면에서 보인다. */
    window.VP말?.("칸" + heads.length + "개 CS자리" + cs칸 + " 상품명자리" + 상품칸자리);
    if (cs칸 < 0 || 상품칸자리 < 0)
      window.VP말?.("머리줄:" + heads.slice(0, 12).join(","));
  }

  function addRows(heads, rows) {
    if (!rows.length) return;
    if (!tbody) {
      그린머리 = heads.slice();                        // ⚠ 벤더피아 칸을 **하나도 안 빼고** 그대로
      const t = document.createElement("table");
      const head = t.createTHead().insertRow();
      그린머리.forEach((c, i) => {
        const th = head.appendChild(document.createElement("th"));
        th.textContent = c;
        if (i === 0) th.className = "vp-first";        // 첫 칸은 가로로 밀어도 붙어 있는다
      });
      tbody = t.createTBody();
      table.replaceChildren(t);
    }
    for (const row of rows) {
      const tr = tbody.insertRow();
      그린머리.forEach((c, i) => {
        const td = tr.insertCell();
        const 값 = row[i] === undefined ? "" : row[i];
        if (CS전용 && i === 상품칸자리 && String(값).trim()) {
          /* CS등록 화면: 상품명을 누르면 그 주문의 상담 판(이력 + 교환·반품·AS 접수 + 고객정보)이 열린다 */
          td.className = "vp-상품칸" + (i === 0 ? " vp-first" : "");
          const 주문 = 주문칸자리 >= 0 ? String(row[주문칸자리] == null ? "" : row[주문칸자리]).trim() : "";
          const b = document.createElement("button");
          b.type = "button"; b.className = "vp-cs상품"; b.textContent = 값;
          b.title = "상담 이력 · 교환 · 반품 · AS 접수";
          b.addEventListener("click", () => { if (주문) 상담판열기(주문, String(값).trim(), row, 그린머리); });
          td.appendChild(b);
          return;
        }
        if (i === 상품칸자리 && String(값).trim()) {
          td.className = "vp-상품칸" + (i === 0 ? " vp-first" : "");
          상품칸들.push([td, 값]);
          상품칸채우기(td, 값);
          /* ⚠⚠ 10-16 사장님 (이 칸을 짚어 보내신 말씀, 그대로):
               「상품명이 여전히 상품관리의 상품버튼이 아니네요」(장부 a1792133856)
               「상품명 버튼을 누르면 상담버튼과 동일한팝업이 나타납니다.
                 **이는 잘못된 작동 입니다**」(장부 a1792133915)
             10-15 에 「상품명 클릭하면 상담을 남길수있도록」 하셔서 이 칸의 누름을
             **잡는 결(capture)로 가로채** 상담 판을 같이 열었다. 그런데 상담 판은 덮개다 —
             상품 상세를 **덮어 버려** 사장님께는 「상품버튼이 아니다」 로 보였다.
             ⚠ 그래서 **가로채기를 걷었다.** 상품명은 상품관리의 그 단추 그대로
               (눌러서 상품 상세), **상담은 주문번호 칸의 「상담」 단추로만** 연다.
             ⚠ 상담·이력·교환/반품/AS 접수는 **그대로다** — 들어가는 길만 하나로 모았다. */
          return;
        }
        td.textContent = 값;
        if (i === 0) td.className = "vp-first";
        /* 상담 이력 단추 — **그 칸 안에** 작게 붙인다. 칸을 새로 내지 않는다
           (배송관리 23칸을 밀어내지 않는다 — 사장님이 그 칸을 다 보셔야 한다). */
        if (i === 주문칸자리 && String(값).trim()) {
          td.classList.add("vp-주문칸");
          상담단추(td, String(값).trim(),
                   상품칸자리 >= 0 ? String(row[상품칸자리] == null ? "" : row[상품칸자리]).trim() : "",
                   row, 그린머리);
        }
      });
    }
    상품칸셈적기();
  }

  // 벤더피아에 매번 직접 조회한다 (항상 최신 상태).
  // 50줄을 먼저 받아 바로 보여주고, 더 있으면 600줄까지 이어서 받는다. 결과는 도착하는 대로 덧붙인다.
  bar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const searchId = ++currentSearch;
    const { filters, variants, local } = plan(bar.q.value);
    const dates = { dcStartDt: bar.from.value, dcEndDt: bar.to.value };

    tbody = null; 그린머리 = null; 상품칸들 = []; 상품칸자리 = -1; 단추된것 = 0; 머리본것 = null;
    상담칸들.length = 0; 주문칸자리 = -1; 상담판닫기();
    table.replaceChildren();
    const seen = new Set();
    let shown = 0;
    let cut = false;

    const take = (r) => {
      /* ⚠ **거르기 전에** 머리줄부터 배운다 — 거른 뒤 하나도 안 남아도 거르개는 서야 한다 */
      머리알기(r.heads);
      if (!r.rows.length) window.VP말?.("조회:벤더피아가 0줄");
      /* ⑤ 「CS 있는 것만」 — 받아 온 줄에서 CS 칸이 빈 줄을 버린다.
         칸을 못 찾으면(-1) 아무것도 안 거른다 — 빈 표를 보여 드리는 것이 더 나쁘다. */
      const cs만 = (고른것.__cs || "") === "있음";
      const cs자리 = cs만 ? cs찾기(r.heads) : -1;
      const fresh = r.rows.filter((row) => {
        const key = row.join("\t");
        if (seen.has(key)) return false;
        seen.add(key);
        if (cs자리 >= 0 && !String(row[cs자리] == null ? "" : row[cs자리]).trim()) return false;
        const text = row.join(" ");
        const digits = text.replace(/\D/g, "");
        return local.every((w) => text.includes(w) || (/^[\d-]+$/.test(w) && digits.includes(w.replace(/-/g, ""))));
      });
      addRows(r.heads, fresh);
      shown += fresh.length;
    };
    const status = (busy) => {
      note.textContent = `${shown.toLocaleString()}건` +
        (busy ? " · 더 찾는 중…" : cut ? " · 결과가 많아 일부만 받아왔습니다. 기간을 좁혀 보세요." : "");
    };

    try {
      status(true);
      const more = [];
      for (const [, fields] of variants) {
        const r = await fetchList({ ...dates, ...알약값(), ...filters, ...fields }, "50");
        if (searchId !== currentSearch) return;
        take(r);
        status(true);
        if (Number(r.count.replace(/,/g, "")) > r.rows.length) more.push(fields);
      }
      for (const fields of more) {
        const r = await fetchList({ ...dates, ...알약값(), ...filters, ...fields }, "600");
        if (searchId !== currentSearch) return;
        take(r);
        if (Number(r.count.replace(/,/g, "")) > r.rows.length) cut = true;
        status(true);
      }
      status(false);
      if (!shown) table.textContent = "결과가 없습니다.";
    } catch (err) {
      if (searchId === currentSearch) note.textContent = "조회에 실패했습니다. 다시 로그인한 뒤 시도해 주세요.";
      if (CS전용) 진단적기("조회 실패(터짐): " + (err && err.message ? err.message : err));
    }
  });
})();
