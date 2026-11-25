/* 비요크선불비변경 — 11-25 [새 지시 비요크선불비변경] 사장님(그대로):
     「메인에 이파일을 목록화한 페이지 만들어줘 - 메뉴이름 비요크선불비변경」
   화면 = `orderMst.aspx#vgByk`(메인 메뉴). `search.js` 가 쪽 머리와 표(`VP비요크표` = CS등록·하우저와 같은 표)를 세우고 이 글을 부른다.
   ⚠⚠ **고객 자료는 저장소·코드에 없다.** 사장님이 이 화면에서 .xlsx 를 올리면 **브라우저 안에서만** 읽어 그리고,
      다음에도 보이게 이 브라우저 localStorage(`vp비요크`, 벤더피아 주소 쪽)에만 둔다(임시). 밖으로 보내지 않는다. 「지우기」 = 그 기억 지움.
   ⚠ 벤더피아에는 아무것도 안 쓴다. 표의 상품명 단추·줄 누름(상담 판)은 다른 표와 같은 길(조회만, 공용 줄).
   11-25 [새 지시 비요크연결] 사장님(그대로):
     「선불변경목록 cs 앞에 체크박스를 만들어주세요 전체 체크해제 가능해야 합니다.  자 그리고 이자료로 벤더피아 주문관리의 연결점이 송장번호로 확인됩니다.
       송장번호 일치하는 주문관리의 해당 주문을 찾아 연결하고 이렇게 연결된 목록이 노랗게 나타나게 해주세요 기본 화면은 하얀색 입니다.」
   → 파일 셀 색은 안 읽고 안 칠한다(바탕 흰색). CS 칸 앞 고름 칸(머리 = 전체 체크·해제, search.js `고름칸`).
     잇기: 주문관리 조회 폼엔 송장번호 칸이 없다(11-25 실제 화면 — 주문번호·고유번호는 있음) → 줄의 「주문번호」(몰 주문번호)로 주문관리를
     조회(`tbSOrderNo`, 등록일 = 파일 「주문등록일」 가장 이른 날 − 7일 ~ 오늘)하고, 받은 줄 중 「송장번호」 가 파일 송장번호와 같은 줄과 잇는다.
     이은 줄 = 노랑(`tr.vp-이은줄`) + 줄 누름·상담 단추 = 그 주문관리 줄. 요청 = 공용 줄 `VP_DATA.받기(…, "뒤")` 하나씩(같은 주문번호는 한 번).
     잇기 결과는 파일 기억(`vp비요크`)에 같이 둔다(임시 — 다시 열면 요청 없이 노랑, 못 이은 줄만 다시 찾음). */
(() => {
  if (window.__vp비요크돌았나) return;
  window.__vp비요크돌았나 = true;
  const 앞줄 = "비요크:";
  const 열쇠 = "vp비요크";
  class 탈 extends Error {}

  /* ── .xlsx = zip + xml (cs정산.js 와 같은 법) ── */
  async function zip열기(buf) {
    const d = new DataView(buf), u8 = new Uint8Array(buf), 글풀개 = new TextDecoder();
    let e = u8.length - 22;
    while (e >= 0 && d.getUint32(e, true) !== 0x06054b50) e--;
    if (e < 0) throw new 탈("엑셀 파일을 읽지 못했습니다. .xlsx 로 다시 저장해 올려 주세요.");
    const 수 = d.getUint16(e + 10, true), 판 = new Map();
    let p = d.getUint32(e + 16, true);
    for (let i = 0; i < 수 && d.getUint32(p, true) === 0x02014b50; i++) {
      const 길이 = d.getUint16(p + 28, true);
      판.set(글풀개.decode(u8.subarray(p + 46, p + 46 + 길이)).replace(/\\/g, "/"),
        { 방식: d.getUint16(p + 10, true), 크기: d.getUint32(p + 20, true), 머리: d.getUint32(p + 42, true) });
      p += 46 + 길이 + d.getUint16(p + 30, true) + d.getUint16(p + 32, true);
    }
    return async (이름) => {
      const x = 판.get(이름);
      if (!x) return null;
      const 시작 = x.머리 + 30 + d.getUint16(x.머리 + 26, true) + d.getUint16(x.머리 + 28, true);
      const 조각 = u8.subarray(시작, 시작 + x.크기);
      if (x.방식 === 0) return 글풀개.decode(조각);
      if (x.방식 !== 8) throw new 탈("엑셀 파일의 압축 방식을 읽지 못했습니다.");
      return new Response(new Blob([조각]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).text();
    };
  }
  const xml읽기 = (글) => new DOMParser().parseFromString(글, "application/xml");
  const 태그들 = (뿌리, 이름) => [...뿌리.getElementsByTagNameNS("*", 이름)];
  const 글잇기 = (뿌리) => 태그들(뿌리, "t").filter((t) => t.parentNode.localName !== "rPh").map((t) => t.textContent).join("");
  const 열번호 = (참조) => {
    let n = 0;
    for (const c of String(참조).replace(/[^A-Za-z]/g, "").toUpperCase()) n = n * 26 + c.charCodeAt(0) - 64;
    return n - 1;
  };
  async function 읽기(buf) {
    const 꺼내기 = await zip열기(buf);
    const 책글 = await 꺼내기("xl/workbook.xml"), 연결글 = await 꺼내기("xl/_rels/workbook.xml.rels");
    if (!책글 || !연결글) throw new 탈("엑셀 시트를 찾지 못했습니다.");
    const 연결 = new Map(태그들(xml읽기(연결글), "Relationship").map((r) => [r.getAttribute("Id"), r.getAttribute("Target")]));
    const 공유글 = await 꺼내기("xl/sharedStrings.xml");
    const 공유 = 공유글 ? 태그들(xml읽기(공유글), "si").map(글잇기) : [];
    const 시트 = 태그들(xml읽기(책글), "sheet")[0];
    if (!시트) throw new 탈("엑셀 시트를 찾지 못했습니다.");
    const 대상 = 연결.get(시트.getAttribute("r:id")) || "";
    const 시트글 = await 꺼내기(대상.startsWith("/") ? 대상.slice(1) : "xl/" + 대상);
    if (!시트글) throw new 탈("엑셀 시트를 찾지 못했습니다.");
    return 태그들(xml읽기(시트글), "row").map((tr) => {
      const 칸 = [];
      for (const c of 태그들(tr, "c")) {
        const i = 열번호(c.getAttribute("r"));
        const 값칸 = 태그들(c, "v")[0], 종류 = c.getAttribute("t");
        let 값 = 종류 === "inlineStr" ? 글잇기(c) : 값칸 ? (종류 === "s" ? 공유[Number(값칸.textContent)] : 값칸.textContent) : "";
        if (값칸 && !종류 && 값 !== "" && Number.isFinite(Number(값))) 값 = String(Number(값));   // 15000.0 → 15000
        칸[i] = String(값 == null ? "" : 값).trim();
      }
      return { 칸 };
    });
  }

  /* 머리 = 앞 20줄 안에서 「주문번호」·「선불비」 칸이 든 줄. 그 위 = 메모, 그 아래 글 있는 줄 = 목록 */
  function 짓기(줄들) {
    const 머리자리 = 줄들.slice(0, 20).findIndex((r) => r.칸.includes("주문번호") && r.칸.includes("선불비"));
    if (머리자리 < 0) throw new 탈("「주문번호」·「선불비」 칸이 있는 제목 줄을 찾지 못했습니다.");
    const 머리칸 = 줄들[머리자리].칸;
    let 끝 = 머리칸.length;
    while (끝 > 0 && !머리칸[끝 - 1]) 끝--;
    const 머리 = Array.from({ length: 끝 }, (_, i) => 머리칸[i] || "");
    const 메모 = 줄들.slice(0, 머리자리).flatMap((r) => r.칸.filter(Boolean));
    const 줄 = [];
    for (const r of 줄들.slice(머리자리 + 1)) {
      const 값 = 머리.map((_, i) => r.칸[i] || "");
      if (값.some(Boolean)) 줄.push(값);
    }
    return { 머리, 메모, 줄 };
  }

  const r = document.getElementById("vp-root");
  const 알림 = r && r.querySelector(".vp-note");
  if (!r || !알림 || !window.VP비요크표) { window.VP말?.(앞줄 + "쪽 틀 없음"); return; }

  if (!document.getElementById("vp-비요크꼴")) {
    const st = document.createElement("style");
    st.id = "vp-비요크꼴";
    st.textContent = `
      #vp-root .vp-비요크줄{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;margin:6px 0;font-size:12px}
      #vp-root .vp-비요크줄 label.vp-올리기{display:inline-block;padding:3px 10px;border:1px solid #c0c0c0;border-radius:4px;background:#f5f5f5;cursor:pointer;font-size:12px}
      #vp-root .vp-비요크줄 label.vp-올리기 input{display:none}
      #vp-root .vp-비요크줄 button.vp-지우기{width:auto;margin:0;height:auto;min-height:0;line-height:normal;font-weight:400;font-family:inherit;padding:3px 10px;border:1px solid #c0c0c0;border-radius:4px;background:#fff;cursor:pointer;font-size:12px;color:#5f5e5a}
      #vp-root .vp-비요크메모{display:flex;flex-wrap:wrap;gap:4px 16px;margin:4px 0;font-size:12px;color:#1a1a19;white-space:pre-wrap}
      #vp-root .vp-비요크셈{display:flex;flex-wrap:wrap;gap:4px 16px;margin:4px 0 6px;font-size:12px;font-variant-numeric:tabular-nums}
      #vp-root .vp-비요크셈 b{font-weight:700}`;
    document.head.appendChild(st);
  }
  const 줄틀 = document.createElement("div");
  줄틀.className = "vp-비요크줄";
  줄틀.innerHTML = `<label class="vp-올리기">파일 올리기<input type="file" accept=".xlsx"></label><span class="vp-비요크파일"></span><button type="button" class="vp-지우기" hidden>지우기</button>`;
  const 메모틀 = document.createElement("div"); 메모틀.className = "vp-비요크메모";
  const 셈틀 = document.createElement("div"); 셈틀.className = "vp-비요크셈";
  알림.before(줄틀, 메모틀, 셈틀);
  const 파일칸 = 줄틀.querySelector("input"), 파일글 = 줄틀.querySelector(".vp-비요크파일"), 지우기단추 = 줄틀.querySelector(".vp-지우기");

  const 수 = (x) => { const n = Number(String(x || "").replace(/,/g, "")); return Number.isFinite(n) ? n : 0; };
  const 돈 = (n) => n.toLocaleString("ko-KR");
  let 지금 = null;                                   // 지금 그린 자료 — 잇기가 도는 동안 바뀌면(지우기·새 파일) 멈춘다
  function 셈그리기(자료) {
    const 선불 = 자료.머리.indexOf("선불비"), 수정 = 자료.머리.findIndex((h) => h.replace(/\s/g, "") === "선불수정");
    const 합 = (i) => (i < 0 ? 0 : 자료.줄.reduce((s, x) => s + 수(x[i]), 0));
    const 칸 = (이름, 값) => `<span>${이름} <b>${값}</b></span>`;
    셈틀.innerHTML = 칸("줄", 돈(자료.줄.length)) + 칸("연결", 돈(Object.keys(자료.이음 || {}).length))
      + (자료.찾는중 ? 칸("확인", 돈(자료.찾는중[0]) + "/" + 돈(자료.찾는중[1])) : "")
      + (선불 >= 0 ? 칸("선불비", 돈(합(선불))) : "") + (수정 >= 0 ? 칸("선불 수정", 돈(합(수정))) : "");
  }
  function 기억하기(자료) {
    try { localStorage.setItem(열쇠, JSON.stringify({ 파일: 자료.파일, 때: 자료.때, 머리: 자료.머리, 메모: 자료.메모, 줄: 자료.줄, 이음: 자료.이음 || {} })); }
    catch (e) { window.VP말?.(앞줄 + "기억 못 함"); }
  }
  async function 그리기(자료) {
    지금 = 자료;
    자료.이음 = 자료.이음 || {};
    파일글.textContent = 자료.파일 + (자료.때 ? " · " + new Date(자료.때).toLocaleString("ko-KR") : "");
    지우기단추.hidden = false;
    메모틀.replaceChildren(...자료.메모.map((m) => Object.assign(document.createElement("span"), { textContent: m })));
    셈그리기(자료);
    알림.textContent = "";
    if (!자료.줄.length) { window.VP비요크표.비우기(); return; }
    await window.VP비요크표.그리기(자료.머리, 자료.줄, { 고름: true });
    if (지금 !== 자료) return;
    /* 기억해 둔 이음 — 송장번호가 그대로인 줄만 */
    const 송 = 자료.머리.indexOf("송장번호");
    for (const [k, v] of Object.entries(자료.이음)) {
      if (!v || 송장맞춤(자료.줄[k] && 자료.줄[k][송]) !== v.송장 || !window.VP비요크표.잇기(Number(k), v)) delete 자료.이음[k];
    }
    셈그리기(자료);
    window.VP말?.(앞줄 + "줄" + 자료.줄.length + " 기억연결" + Object.keys(자료.이음).length);
    잇기(자료).catch((e) => {
      if (지금 !== 자료) return;
      자료.찾는중 = null; 셈그리기(자료);
      알림.textContent = e instanceof 탈 ? e.message : "주문관리 연결을 끝내지 못했습니다.";
      window.VP말?.(앞줄 + "잇기 탈 " + (e && e.message ? e.message : e));
    });
  }

  /* ── 송장번호로 주문관리 주문 잇기 (조회만) ── */
  const 송장맞춤 = (x) => String(x == null ? "" : x).replace(/[\s-]/g, "");
  const 폼 = document.getElementById("aspnetForm") || document.forms[0];
  const 폼이름 = (id) => 폼 && [...폼.elements].map((e) => e.name).find((n) => n && (n === id || n.endsWith("$" + id)));
  const 날글 = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  /* 파일 「주문등록일」 꼴 = 「26.11.20」 (앞뒤 빈칸) — 2000년대로 읽는다. 「2026-11-20」 꼴도 받는다. */
  function 날읽기(x) {
    const m = String(x || "").trim().match(/^(\d{2}|\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
    if (!m) return null;
    const d = new Date((m[1].length === 2 ? 2000 + Number(m[1]) : Number(m[1])), Number(m[2]) - 1, Number(m[3]));
    return isNaN(d) ? null : d;
  }
  async function 주문묻기(주문번호, 시작) {
    const fd = new FormData(폼);
    for (const k of [...fd.keys()]) if (k.includes("chkItem")) fd.delete(k);
    const 단추 = 폼.querySelector('input[type=image][name$="btnSearch"]');   // ⚠ 그림 단추는 form.elements 에 없다
    if (!단추) throw new 탈("주문관리 조회 단추를 찾지 못했습니다.");
    fd.append(단추.name + ".x", "5"); fd.append(단추.name + ".y", "5");
    fd.set(폼이름("tbSOrderNo"), 주문번호);
    fd.set(폼이름("ddlRowCnt"), "50");
    if (시작) fd.set(폼이름("dcStartDt"), 시작);
    fd.set(폼이름("dcEndDt"), 날글(new Date()));
    const res = await VP_DATA.받기(폼.action, { method: "POST", body: fd, credentials: "include", cache: "no-store" }, "뒤");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const 글 = (await res.text()).replace(/<script\b[\s\S]*?<\/script>/gi, "");
    const doc = new DOMParser().parseFromString(글, "text/html");
    if (doc.querySelector("input[type=password]")) throw new 탈("벤더피아 로그인이 끊겼습니다. 다시 로그인한 뒤 이 화면을 새로 열어 주세요.");
    const g = doc.getElementById("oGrid");
    const 전체 = g ? [...g.querySelectorAll("tr")] : [];
    const 머리 = 전체.find((tr) => tr.cells.length >= 60);
    if (!머리) return [];
    const 이름들 = [...머리.cells].map((c) => (c.textContent || "").replace(/\s+/g, " ").trim());
    const 송자리 = 이름들.indexOf("송장번호");
    if (송자리 < 0) throw new 탈("주문관리 표에서 「송장번호」 칸을 못 찾았습니다.");
    const 몸 = 전체.filter((tr) => tr !== 머리 && tr.cells.length === 머리.cells.length && !tr.querySelector("tr") && !tr.querySelector("th.igg_HeaderCaption"));
    const 표 = window.VP비요크표.읽기(doc);              // 주문관리 표에 보이는 칸 그대로(CS등록과 같은 읽기) — 줄 차례는 위 몸과 같다
    if (!표 || 표.rows.length !== 몸.length) throw new 탈("주문관리 표 줄을 맞추지 못했습니다. 주문관리 화면이 바뀌었는지 확인이 필요합니다.");
    const 주자리 = 표.heads.indexOf("주문번호"), 상자리 = 표.heads.indexOf("상품명");
    return 몸.map((tr, j) => ({
      송장: 송장맞춤(tr.cells[송자리].textContent),
      주문: 주자리 >= 0 ? String(표.rows[j][주자리] || "").trim() : "",
      상품명: 상자리 >= 0 ? String(표.rows[j][상자리] || "").trim() : "",
      줄: 표.rows[j], 머리: 표.heads,
    }));
  }
  async function 잇기(자료) {
    const 주 = 자료.머리.indexOf("주문번호"), 송 = 자료.머리.indexOf("송장번호"), 날 = 자료.머리.indexOf("주문등록일");
    if (주 < 0 || 송 < 0) { window.VP말?.(앞줄 + "잇기 칸없음"); return; }
    if (!폼) throw new 탈("주문관리 조회 폼을 찾지 못했습니다.");
    /* 묻을 것 = 못 이은 줄(송장·주문번호 있음)을 주문번호로 묶음 */
    const 묶음 = new Map();
    자료.줄.forEach((r, k) => {
      if (자료.이음[k]) return;
      const 송장 = 송장맞춤(r[송]), 주문 = String(r[주] || "").trim();
      if (!송장 || !주문) return;
      if (!묶음.has(주문)) 묶음.set(주문, []);
      묶음.get(주문).push([k, 송장]);
    });
    if (!묶음.size) return;
    const 날들 = 날 >= 0 ? 자료.줄.map((r) => 날읽기(r[날])).filter(Boolean) : [];
    const 시작 = 날들.length ? 날글(new Date(Math.min(...날들) - 7 * 864e5)) : "";
    const t0 = performance.now();
    let 물음 = 0, 새로 = 0;
    자료.찾는중 = [0, 묶음.size]; 셈그리기(자료);
    for (const [주문, 줄들] of 묶음) {
      if (지금 !== 자료) return;
      let 받은;
      for (let 번 = 1; ; 번++) {
        try { 받은 = await 주문묻기(주문, 시작); break; }
        catch (e) { if (e instanceof 탈 || 번 >= 2) throw e; await new Promise((ok) => setTimeout(ok, 3000)); }
      }
      물음++;
      if (지금 !== 자료) return;
      for (const [k, 송장] of 줄들) {
        const 맞은 = 받은.find((x) => x.송장 === 송장);
        if (!맞은) continue;
        const 이음 = { 송장, 주문: 맞은.주문 || 주문, 상품명: 맞은.상품명, 줄: 맞은.줄, 머리: 맞은.머리 };
        if (window.VP비요크표.잇기(k, 이음)) { 자료.이음[k] = 이음; 새로++; }
      }
      자료.찾는중[0] = 물음; 셈그리기(자료);
    }
    자료.찾는중 = null; 셈그리기(자료);
    기억하기(자료);
    window.VP말?.(앞줄 + "잇기 물음" + 물음 + " 새연결" + 새로 + " 연결" + Object.keys(자료.이음).length + " " + ((performance.now() - t0) / 1000).toFixed(1) + "초 시작" + (시작 ? "있음" : "기본"));
  }

  파일칸.addEventListener("change", async () => {
    const 파일 = 파일칸.files && 파일칸.files[0];
    파일칸.value = "";
    if (!파일) return;
    try {
      if (!/\.xlsx$/i.test(파일.name)) throw new 탈(".xlsx 파일만 읽습니다.");
      알림.textContent = "읽는 중…";
      const 자료 = { 파일: 파일.name, 때: Date.now(), ...짓기(await 읽기(await 파일.arrayBuffer())), 이음: {} };
      기억하기(자료);
      await 그리기(자료);
    } catch (e) {
      알림.textContent = e instanceof 탈 ? e.message : "파일을 읽지 못했습니다.";
      window.VP말?.(앞줄 + "탈 " + (e && e.message ? e.message : e));
    }
  });
  지우기단추.addEventListener("click", () => {
    try { localStorage.removeItem(열쇠); } catch (e) { /* 없음 */ }
    지금 = null;
    window.VP비요크표.비우기();
    파일글.textContent = ""; 메모틀.replaceChildren(); 셈틀.replaceChildren(); 알림.textContent = "";
    지우기단추.hidden = true;
  });

  let 기억 = null;
  try { 기억 = JSON.parse(localStorage.getItem(열쇠) || "null"); } catch (e) { 기억 = null; }
  if (기억 && Array.isArray(기억.머리) && Array.isArray(기억.줄)) 그리기({ 메모: [], ...기억 }).catch(() => { 알림.textContent = "파일을 읽지 못했습니다."; });
})();
