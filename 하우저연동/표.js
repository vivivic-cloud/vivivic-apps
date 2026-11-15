/* 하우저 목록 화면 공통 — 하우저 화면에 그려진 표를 읽어 「이름이 첫 칸인 표 + 기간·검색창 + 상세 창」 으로 다시 그린다.
   (벤더피아연동 goods.js 와 같은 틀.) ⚠ 읽기만. 아무것도 저장·전송·수정하지 않는다. 쪽 넘김은 하우저의 쪽 번호를 누를 뿐이다.
   ⚠ 0건이어서 못 본 화면의 칸은 짓지 않는다. */
(() => {
  if (window.HW표) return;
  const 판 = () => document.documentElement.getAttribute("data-hw-판") || "";
  const 어디 = () => document.documentElement.getAttribute("data-hw-어디") || "";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const 글 = (el) => (el.innerText || "").replace(/내림차순으로 보기|오름차순으로 보기/g, "").replace(/\s+/g, " ").trim();
  const 수 = (v) => parseInt(String(v || "0").replace(/[^\d-]/g, ""), 10) || 0;
  const 쉬 = (ms) => new Promise((r) => setTimeout(r, ms));

  /* 지금 보이는 한 쪽을 읽는다 */
  const 쪽읽기 = (표선택) => {
    const t = document.querySelector(표선택);
    if (!t) return null;
    const heads = [...t.querySelectorAll("thead th")].map(글);
    const rows = [...t.querySelectorAll("tbody tr")].filter((r) => r.children.length === heads.length).map((r) => {
      const o = { _링크: "" };
      [...r.children].forEach((c, i) => { o[heads[i]] = 글(c); });
      const a = r.querySelector("a[href^='/']");
      if (a) o._링크 = a.getAttribute("href");
      return o;
    });
    return { heads, rows };
  };
  const 서명 = (표선택) => { const t = document.querySelector(표선택); return t ? [...t.querySelectorAll("tbody tr")].slice(0, 3).map((r) => r.innerText).join("|") : ""; };

  /* 하우저의 쪽 번호가 여럿이면 차례로 눌러 모두 읽고 처음 쪽으로 돌아온다 */
  const 모든쪽읽기 = async (표선택, 알림) => {
    const 첫 = 쪽읽기(표선택);
    if (!첫) return null;
    const 쪽들 = [...document.querySelectorAll(".paging_global a")].filter((a) => /^\d+$/.test(a.textContent.trim()));
    if (쪽들.length < 2) return 첫;
    const 지금 = 쪽들.find((a) => /select/.test(a.className)) || 쪽들[0];
    const 모음 = { heads: 첫.heads, rows: 첫.rows.slice() };
    for (const a of 쪽들) {
      if (a === 지금) continue;
      const 전 = 서명(표선택);
      a.click();
      for (let i = 0; i < 30 && 서명(표선택) === 전; i++) await 쉬(250);
      const 쪽 = 쪽읽기(표선택);
      if (쪽 && 서명(표선택) !== 전) 모음.rows.push(...쪽.rows);
      if (알림) 알림(모음.rows.length);
    }
    const 전 = 서명(표선택);
    지금.click();
    for (let i = 0; i < 30 && 서명(표선택) === 전; i++) await 쉬(250);
    return 모음;
  };

  const 열기 = async (o) => {
    if (document.getElementById("hw-root")) return;
    if (!document.getElementById("logout_button")) return;          // 로그인된 화면에서만
    // 하우저가 표를 그릴 때까지 기다린다
    for (let i = 0; i < 60 && !(document.querySelector(o.표선택 + " tbody tr")); i++) await 쉬(300);
    const 뿌리 = document.createElement("div");
    뿌리.id = "hw-root";
    뿌리.innerHTML = '<div class="hw-머리"><h1>' + esc(o.제목) + '</h1>' +
      '<a class="hw-단추" href="/home">← 메뉴</a><button type="button" class="hw-단추 원본">하우저 원본</button></div>' +
      '<div class="hw-줄 기간줄"></div><div class="hw-줄 검색줄"></div>' +
      '<div class="hw-몸"><div class="hw-표통"><table><thead></thead><tbody></tbody></table><div class="hw-빔" hidden></div></div>' +
      '<aside class="hw-상세" hidden></aside></div><div class="hw-꼬리"></div>';
    document.body.appendChild(뿌리);
    const $ = (s) => 뿌리.querySelector(s);

    $(".hw-꼬리").textContent = "하우저 보기 " + 판() + (어디() ? " · " + 어디() : "") + " · 읽기만 · 저장·전송 없음";
    $(".원본").onclick = () => {
      뿌리.style.display = "none";
      const b = document.createElement("button"); b.id = "hw-다시"; b.textContent = "우리 표로 보기";
      b.onclick = () => { b.remove(); 뿌리.style.display = ""; };
      document.body.appendChild(b);
    };

    $(".hw-빔").hidden = false; $(".hw-빔").textContent = "하우저에서 읽는 중…";
    const d = await 모든쪽읽기(o.표선택, (n) => { $(".hw-빔").textContent = "하우저에서 읽는 중… " + n + "줄"; });
    if (!d || !d.rows.length) { $(".hw-빔").textContent = "표가 비어 있습니다. 하우저 조회 조건에서 결과가 없거나 아직 로딩 중입니다. 「하우저 원본」 에서 조회한 뒤 다시 열어 주세요."; return; }
    $(".hw-빔").hidden = true;

    const 칸들 = [o.첫칸, ...o.칸순서.filter((c) => c !== o.첫칸)].filter((c) => d.heads.includes(c));
    $("thead").innerHTML = "<tr>" + 칸들.map((c) => `<th class="${o.숫자칸.includes(c) ? "n" : ""}">${esc(c)}</th>`).join("") + "</tr>";
    const 기준 = o.기준 ? o.기준() : "";
    if (기준) $(".기간줄").textContent = 기준;
    if (o.기간칸) {
      $(".기간줄").innerHTML = '<span>' + esc(o.기간칸) + '</span><input type="date" class="from"> ~ <input type="date" class="to">';
    } else if (!기준) $(".기간줄").remove();
    $(".검색줄").innerHTML = '<input type="search" placeholder="' + esc(o.검색문구) + '"><span class="hw-합계"></span>';

    const 날짜 = (v) => { const m = String(v || "").match(/(\d{4})\D(\d{1,2})\D(\d{1,2})/); return m ? m[1] + "-" + m[2].padStart(2, "0") + "-" + m[3].padStart(2, "0") : ""; };
    let 고른 = null;
    const 그리기 = () => {
      const q = ($("input[type=search]").value || "").trim().toLowerCase();
      const f = $(".from") ? $(".from").value : "", t = $(".to") ? $(".to").value : "";
      const rs = d.rows.filter((r) => {
        if (q && !o.검색칸.some((c) => String(r[c] || "").toLowerCase().includes(q))) return false;
        if (o.기간칸 && (f || t)) { const dt = 날짜(r[o.기간칸]); if (!dt || (f && dt < f) || (t && dt > t)) return false; }
        return true;
      });
      $("tbody").innerHTML = rs.map((r, i) => "<tr data-i=\"" + d.rows.indexOf(r) + "\">" + 칸들.map((c) => {
        const v = r[c] || "";
        if (c === o.첫칸) return `<td><button type="button" class="hw-이름">${esc(v)}</button></td>`;
        const n = o.숫자칸.includes(c);
        const cls = n ? "n" + (v === "0" ? " z" : (c === "불량 재고" && 수(v) > 0 ? " bad" : "")) : "";
        return `<td class="${cls}">${esc(v)}</td>`;
      }).join("") + "</tr>").join("");
      $(".hw-합계").innerHTML = `<span>${esc(o.단위)}<b>${rs.length}</b></span>` + (o.합계칸 || []).map((k) => `<span>${esc(k)}<b>${rs.reduce((s, r) => s + 수(r[k]), 0).toLocaleString()}</b></span>`).join("");
      $(".hw-빔").hidden = rs.length > 0; if (!rs.length) $(".hw-빔").textContent = "조건에 맞는 줄이 없습니다.";
      if (고른 != null) { const tr = $("tr[data-i=\"" + 고른 + "\"]"); if (tr) tr.classList.add("on"); }
    };
    그리기();
    $("input[type=search]").oninput = 그리기;
    for (const e of 뿌리.querySelectorAll(".from,.to")) e.onchange = 그리기;

    /* 상세 창 — 줄 하나의 읽은 칸을 모두 보인다 + 하우저에서 그 상품 화면으로 가는 링크(있을 때) */
    const 창 = $(".hw-상세");
    $("tbody").onclick = (ev) => {
      const tr = ev.target.closest("tr"); if (!tr) return;
      const r = d.rows[+tr.dataset.i];
      고른 = +tr.dataset.i;
      for (const x of 뿌리.querySelectorAll("tr.on")) x.classList.remove("on");
      tr.classList.add("on");
      창.hidden = false;
      창.innerHTML = '<button type="button" class="x" aria-label="닫기">×</button><h2>' + esc(r[o.첫칸]) + '</h2><dl>' +
        d.heads.filter((c) => c !== o.첫칸).map((c) => `<dt>${esc(c)}</dt><dd>${esc(r[c]) || "—"}</dd>`).join("") + "</dl>" +
        (r._링크 ? `<a href="${esc(r._링크)}" target="_blank" rel="noopener">하우저에서 열기 ↗</a>` : "");
      창.querySelector(".x").onclick = () => { 창.hidden = true; 고른 = null; tr.classList.remove("on"); };
    };
  };

  window.HW표 = { 열기, 쪽읽기, 모든쪽읽기 };
})();
