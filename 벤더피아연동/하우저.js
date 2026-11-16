/* 하우저 — 11-16 [새 지시 하우저 메뉴] 사장님(그대로):
     「벤더피아 메인에 하우져 메뉴를 만들어서 클릭시 벤피아상품중  배송사가 하우저 인것의 상품들의 정보가 보이게 해줘」
   화면 = `orderMst.aspx#vgHau`(메인 메뉴). `search.js` 가 쪽 머리(「하우저」)와 표(`VP하우저표` = CS등록·CS정산과 같은 표)를 세우고 이 글을 부른다
   — 확장 안 글은 그대로(덮어쓰기 불필요).
   ⚠⚠ **읽기 전용.** 벤더피아에는 상품관리(`/System/Master/salesGoods.aspx`) GET 한 번 + 조회 POST(+ 700줄 넘으면 쪽 넘김)만 간다. 저장 0.
   길(11-16 사장님 크롬에서 잼, CLAUDE.md 「하우저」):
     · 배송사는 상품관리 목록 **줄마다** 붙는다(칸 「배송사명」). 상품관리 조회 폼에 배송사 고르는 칸 `ddlDCo`(화면 글자 「배송사」)가 있고
       그 안에 「하우저」가 있다 → 그 칸으로 벤더피아가 거른 줄을 그대로 받는다(값은 글자 「하우저」로 찾는다, 번호를 박지 않는다).
     · 판매상태 = **판매중만(임시)** — 상품관리의 기본값과 같다. 등록기간 = 2000-01-01 ~ 오늘(기본 5년을 넓힘, 임시 — 잴 때는 5년과 같은 수).
     · 칸 = 상품관리 목록에서 벤더피아가 **보이는 칸 그대로**(숨긴 칸 = 머리 th class 에 생성 이름 `ig…` 이 붙은 것, 체크 칸은 뺌).
   ⚠ 요청은 공용 줄 `VP_DATA.받기` 로만. 로그인이 끊겼으면 멈추고 알린다(다시 로그인하지 않는다). */
(() => {
  if (window.__vp하우저돌았나) return;
  window.__vp하우저돌았나 = true;
  const 앞줄 = "하우저:";
  const 주소 = "/System/Master/salesGoods.aspx";
  const 배송사이름 = "하우저";
  const 판매상태 = "1";                              // 판매중(임시) — 상품관리 기본값
  const 줄수 = "700";                               // 상품관리 쪽당 줄 수 끝값(27·100·500·700)
  const 첫날 = "2000-01-01";
  const 쉼 = (ms) => new Promise((r) => setTimeout(r, ms));
  class 탈 extends Error {}
  const 날짜글 = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const 받기 = (url, opt) => (typeof VP_DATA !== "undefined" && VP_DATA.받기 ? VP_DATA.받기(url, opt, "사람") : fetch(url, opt));
  const 칸글 = (c) => {
    let t = (c.textContent || "").replace(/\s+/g, " ").trim();
    if (!t) {
      const i = c.querySelector("input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=image]):not([type=submit]):not([type=button])");
      if (i) t = String(i.value || "").trim();
    }
    return t;
  };
  const 체크빼기 = (fd) => { for (const k of [...fd.keys()]) if (k.includes("chkItem")) fd.delete(k); return fd; };

  async function 문서받기(opt) {
    const res = await 받기(주소, { credentials: "include", cache: "no-store", ...opt });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const 글 = (await res.text()).replace(/<script\b[\s\S]*?<\/script>/gi, "");
    const doc = new DOMParser().parseFromString(글, "text/html");
    if (doc.querySelector("input[type=password]")) throw new 탈("벤더피아 로그인이 끊겼습니다. 벤더피아에 다시 로그인한 뒤 이 화면을 새로고침해 주세요.");
    return doc;
  }
  const 칸 = (doc, id) => doc.getElementById(id) || [...(doc.forms[0] || { elements: [] }).elements].find((e) => e.name && e.name.endsWith("$" + id));

  /* 상품관리 목록(`#oGrid`, Infragistics) 읽기 — 머리 = th.igg_HeaderCaption 이 든 첫 tr, 몸 = 같은 칸 수의 tr.
     숨긴 칸 = 머리 th class 에 생성 이름(`ig9a63765d` 꼴)이 더 붙은 것(11-16 잼: 매출처코드·매출처상품명·모델번호·옵션상품유무) */
  function 목록읽기(doc) {
    const g = doc.getElementById("oGrid");
    if (!g) throw new 탈("상품관리 목록(#oGrid)을 찾지 못했습니다. 상품관리 화면이 바뀌었는지 확인이 필요합니다.");
    const 전체 = [...g.querySelectorAll("tr")];
    const 머리줄 = 전체.find((tr) => tr.querySelector("th.igg_HeaderCaption"));
    const 총 = Number(((doc.body.textContent || "").match(/총\s*([\d,]+)\s*건/) || [])[1]?.replace(/,/g, "") ?? NaN);
    if (!머리줄) return { heads: [], rows: [], 총: Number.isNaN(총) ? 0 : 총 };
    const n = 머리줄.cells.length;
    const 숨김 = (th) => [...th.classList].some((c) => /^ig[0-9a-f]{6,}$/i.test(c));
    const 몸 = 전체.filter((tr) => tr !== 머리줄 && tr.cells.length === n && !tr.querySelector("tr") && !tr.querySelector("th"));
    const 칸들 = [...머리줄.cells].map((th, i) => ({ i, 이름: 칸글(th), 숨: 숨김(th) }))
      .filter((c) => !c.숨 && !(!c.이름 && 몸.length && 몸.every((tr) => tr.cells[c.i].querySelector("input[type=checkbox]"))));
    return {
      heads: 칸들.map((c) => c.이름),
      rows: 몸.map((tr) => 칸들.map((c) => 칸글(tr.cells[c.i]))),
      총: Number.isNaN(총) ? 몸.length : 총,
      doc,
    };
  }
  /* 다음 쪽 폼 — CS정산(`cs정산.js` `다음폼`)과 같은 법: 쪽 번호 링크(__doPostBack) → 없으면 Next 그림 단추 */
  function 다음폼(doc, 쪽) {
    const fd = 체크빼기(new FormData(doc.forms[0]));
    const 링크 = [...doc.querySelectorAll('[id*="Pager1"] a')].find((a) => a.textContent.trim() === String(쪽));
    const 이름 = 링크 && ((링크.getAttribute("href") || "").match(/doPostBack\('([^']+)'/) || [])[1];
    fd.set("__EVENTARGUMENT", "");
    if (이름) { fd.set("__EVENTTARGET", 이름); return fd; }
    const 다음 = [...doc.querySelectorAll('[id*="Pager1"] input')].find((i) => /next/i.test(i.value || i.alt || i.name || ""));
    if (!다음) return null;
    fd.set("__EVENTTARGET", "");
    fd.delete(다음.name);
    if (다음.type === "image") { fd.append(다음.name + ".x", "5"); fd.append(다음.name + ".y", "5"); }
    else fd.set(다음.name, 다음.value);
    return fd;
  }

  const r = document.getElementById("vp-root");
  const 알림 = r && r.querySelector(".vp-note");
  if (!r || !알림 || !window.VP하우저표) { window.VP말?.(앞줄 + "쪽 틀 없음"); return; }
  const 알리기 = (글) => { 알림.textContent = 글; };

  (async () => {
    const t0 = performance.now();
    const 지남 = () => ((performance.now() - t0) / 1000).toFixed(1) + "초";
    try {
      알리기("벤더피아 상품관리에서 배송사 「" + 배송사이름 + "」 상품을 받는 중…");
      const 처음 = await 문서받기({});
      const 고르개 = 칸(처음, "ddlDCo");
      const 하나 = 고르개 && [...고르개.options].find((o) => o.text.replace(/\s/g, "") === 배송사이름);
      if (!하나) throw new 탈("상품관리의 배송사 고르는 칸에서 「" + 배송사이름 + "」를 찾지 못했습니다.");
      const fd = 체크빼기(new FormData(처음.forms[0]));
      const 놓기 = (id, v) => { const e = 칸(처음, id); if (e && e.name) fd.set(e.name, v); };
      놓기("ddlDCo", 하나.value);
      놓기("ddlStatus", 판매상태);
      놓기("ddlRowCnt", 줄수);
      놓기("dcStartDt", 첫날);
      놓기("dcEndDt", 날짜글(new Date()));
      const 조회 = 처음.querySelector("#btnSearch");   // 그림 단추라 form.elements 에 없다(CS정산 함정)
      if (!조회 || !조회.name) throw new 탈("상품관리 조회 단추를 찾지 못했습니다.");
      fd.append(조회.name + ".x", "5"); fd.append(조회.name + ".y", "5");
      let 답 = 목록읽기(await 문서받기({ method: "POST", body: fd }));
      const heads = 답.heads, rows = 답.rows.slice();
      for (let 쪽 = 2; rows.length < 답.총 && 답.rows.length; 쪽++) {
        알리기("받는 중… " + rows.length.toLocaleString() + " / " + 답.총.toLocaleString() + "줄 · " + 지남());
        await 쉼(300);
        const 다음 = 다음폼(답.doc, 쪽);
        if (!다음) throw new 탈(쪽 + "쪽으로 넘어가는 단추를 찾지 못했습니다. 받은 " + rows.length + "줄까지만 보입니다.");
        답 = 목록읽기(await 문서받기({ method: "POST", body: 다음 }));
        rows.push(...답.rows);
      }
      const 상품수 = new Set(rows.map((x) => x[heads.indexOf("상품코드")])).size;
      if (rows.length) await window.VP하우저표.그리기(heads, rows);
      알리기("배송사 「" + 배송사이름 + "」 · 판매중(임시) · 상품 " + 상품수.toLocaleString() + "개 · " + rows.length.toLocaleString() + "줄"
        + (답.총 > rows.length ? " (벤더피아 총 " + 답.총.toLocaleString() + "건 중)" : "") + " · 조회 " + 지남());
      window.VP말?.(앞줄 + "줄" + rows.length + " 상품" + 상품수 + " " + 지남());
    } catch (e) {
      알리기(e instanceof 탈 ? e.message : "상품관리를 읽지 못했습니다. 벤더피아에 로그인되어 있는지 확인하고 새로고침해 주세요.");
      window.VP말?.(앞줄 + "탈 " + (e && e.message ? e.message : e));
    }
  })();
})();
