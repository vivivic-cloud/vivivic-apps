/* 비요크선불비변경 — 11-25 [새 지시 비요크선불비변경] 사장님(그대로):
     「메인에 이파일을 목록화한 페이지 만들어줘 - 메뉴이름 비요크선불비변경」
   화면 = `orderMst.aspx#vgByk`(메인 메뉴). `search.js` 가 쪽 머리와 표(`VP비요크표` = CS등록·하우저와 같은 표)를 세우고 이 글을 부른다.
   ⚠⚠ **고객 자료는 저장소·코드에 없다.** 사장님이 이 화면에서 .xlsx 를 올리면 **브라우저 안에서만** 읽어 그리고,
      다음에도 보이게 이 브라우저 localStorage(`vp비요크`, 벤더피아 주소 쪽)에만 둔다(임시). 밖으로 보내지 않는다. 「지우기」 = 그 기억 지움.
   ⚠ 벤더피아에는 아무것도 안 쓴다. 표의 상품명 단추·줄 누름(상담 판)은 다른 표와 같은 길(조회만, 공용 줄).
   셀 색: styles.xml `cellXfs[s].fillId` → `fills` 의 solid 채움 fgColor(rgb, 또는 theme → theme1.xml). 흰색 아닌 채움이 줄 칸의 절반 넘으면 「칠한 줄」,
     그 줄은 파일의 그 색으로 칠한다(`tr.vp-칠한줄`). ⚠ CS 「취소」 줄(`vp-취소줄` 연한 빨강)보다 파일 색이 이긴다(임시 — 취소는 CS 칸 글자로 보임). */
(() => {
  if (window.__vp비요크돌았나) return;
  window.__vp비요크돌았나 = true;
  const 앞줄 = "비요크:";
  const 열쇠 = "vp비요크";
  class 탈 extends Error {}

  /* ── .xlsx = zip + xml (cs정산.js 와 같은 법, 셀 색까지) ── */
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
  const 흰색 = (rgb) => !rgb || /^(FF)?FFFFFF$/i.test(rgb);

  /* 테마 색 — Excel theme 번호 0·1·2·3 = lt1·dk1·lt2·dk2(차례가 엇갈림), 4~ = accent… */
  function 테마색들(글) {
    if (!글) return [];
    const 판 = 태그들(xml읽기(글), "clrScheme")[0];
    if (!판) return [];
    const 색 = [...판.children].map((k) => {
      const s = 태그들(k, "srgbClr")[0], y = 태그들(k, "sysClr")[0];
      return s ? s.getAttribute("val") : y ? y.getAttribute("lastClr") || "" : "";
    });
    const [dk1, lt1, dk2, lt2, ...나머지] = 색;
    return [lt1, dk1, lt2, dk2, ...나머지];
  }
  function 색풀기(el, 테마) {
    if (!el) return "";
    const rgb = el.getAttribute("rgb");
    if (rgb) return rgb.slice(-6).toUpperCase();
    const th = el.getAttribute("theme");
    if (th != null && 테마[Number(th)]) return String(테마[Number(th)]).slice(-6).toUpperCase();
    if (el.getAttribute("indexed") === "64" || el.getAttribute("auto")) return "";
    return "";
  }
  async function 읽기(buf) {
    const 꺼내기 = await zip열기(buf);
    const 책글 = await 꺼내기("xl/workbook.xml"), 연결글 = await 꺼내기("xl/_rels/workbook.xml.rels");
    if (!책글 || !연결글) throw new 탈("엑셀 시트를 찾지 못했습니다.");
    const 연결 = new Map(태그들(xml읽기(연결글), "Relationship").map((r) => [r.getAttribute("Id"), r.getAttribute("Target")]));
    const 공유글 = await 꺼내기("xl/sharedStrings.xml");
    const 공유 = 공유글 ? 태그들(xml읽기(공유글), "si").map(글잇기) : [];
    const 테마 = 테마색들(await 꺼내기("xl/theme/theme1.xml"));
    /* 칸 꼴 번호(s) → 채움 색(흰색·없음이면 "") */
    let 꼴색 = [];
    const 꼴글 = await 꺼내기("xl/styles.xml");
    if (꼴글) {
      const 꼴 = xml읽기(꼴글);
      const 채움들 = 태그들(태그들(꼴, "fills")[0] || 꼴, "fill").map((f) => {
        const pf = 태그들(f, "patternFill")[0];
        if (!pf || pf.getAttribute("patternType") !== "solid") return "";
        const c = 색풀기(태그들(pf, "fgColor")[0], 테마);
        return 흰색(c) ? "" : c;
      });
      const xfs = 태그들(꼴, "cellXfs")[0];
      꼴색 = xfs ? [...xfs.children].filter((x) => x.localName === "xf").map((x) => 채움들[Number(x.getAttribute("fillId") || 0)] || "") : [];
    }
    const 시트 = 태그들(xml읽기(책글), "sheet")[0];
    if (!시트) throw new 탈("엑셀 시트를 찾지 못했습니다.");
    const 대상 = 연결.get(시트.getAttribute("r:id")) || "";
    const 시트글 = await 꺼내기(대상.startsWith("/") ? 대상.slice(1) : "xl/" + 대상);
    if (!시트글) throw new 탈("엑셀 시트를 찾지 못했습니다.");
    return 태그들(xml읽기(시트글), "row").map((tr) => {
      const 칸 = [], 색 = [];
      for (const c of 태그들(tr, "c")) {
        const i = 열번호(c.getAttribute("r"));
        const 값칸 = 태그들(c, "v")[0], 종류 = c.getAttribute("t");
        let 값 = 종류 === "inlineStr" ? 글잇기(c) : 값칸 ? (종류 === "s" ? 공유[Number(값칸.textContent)] : 값칸.textContent) : "";
        if (값칸 && !종류 && 값 !== "" && Number.isFinite(Number(값))) 값 = String(Number(값));   // 15000.0 → 15000
        칸[i] = String(값 == null ? "" : 값).trim();
        색[i] = 꼴색[Number(c.getAttribute("s") || 0)] || "";
      }
      return { 칸, 색 };
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
    const 줄 = [], 칠 = [];
    for (const r of 줄들.slice(머리자리 + 1)) {
      const 값 = 머리.map((_, i) => r.칸[i] || "");
      if (!값.some(Boolean)) continue;
      const 색들 = 머리.map((_, i) => r.색[i] || "");
      const 셈 = new Map();
      for (const c of 색들) if (c) 셈.set(c, (셈.get(c) || 0) + 1);
      const [큰색, 큰수] = [...셈].sort((a, z) => z[1] - a[1])[0] || ["", 0];
      줄.push(값);
      칠.push(큰수 * 2 > 머리.length ? 큰색 : "");
    }
    return { 머리, 메모, 줄, 칠 };
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
      #vp-root .vp-비요크줄 button.vp-지우기{padding:3px 10px;border:1px solid #c0c0c0;border-radius:4px;background:#fff;cursor:pointer;font-size:12px;color:#5f5e5a}
      #vp-root .vp-비요크메모{display:flex;flex-wrap:wrap;gap:4px 16px;margin:4px 0;font-size:12px;color:#1a1a19;white-space:pre-wrap}
      #vp-root .vp-비요크셈{display:flex;flex-wrap:wrap;gap:4px 16px;margin:4px 0 6px;font-size:12px;font-variant-numeric:tabular-nums}
      #vp-root .vp-비요크셈 b{font-weight:700}
      #vp-root .vp-table table.vp-촘촘 tr.vp-칠한줄.vp-칠한줄 > td{background:var(--vp칠)}`;
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
  async function 그리기(자료) {
    파일글.textContent = 자료.파일 + (자료.때 ? " · " + new Date(자료.때).toLocaleString("ko-KR") : "");
    지우기단추.hidden = false;
    메모틀.replaceChildren(...자료.메모.map((m) => Object.assign(document.createElement("span"), { textContent: m })));
    const 선불 = 자료.머리.indexOf("선불비"), 수정 = 자료.머리.findIndex((h) => h.replace(/\s/g, "") === "선불수정");
    const 칠한 = 자료.줄.filter((_, i) => 자료.칠[i]);
    const 합 = (줄들, i) => (i < 0 ? 0 : 줄들.reduce((s, x) => s + 수(x[i]), 0));
    const 칸 = (이름, 값) => `<span>${이름} <b>${값}</b></span>`;
    셈틀.innerHTML = 칸("줄", 돈(자료.줄.length)) + 칸("칠한 줄", 돈(칠한.length))
      + (선불 >= 0 ? 칸("선불비", 돈(합(자료.줄, 선불))) : "") + (수정 >= 0 ? 칸("선불 수정", 돈(합(자료.줄, 수정))) : "")
      + (칠한.length !== 자료.줄.length && 선불 >= 0 ? 칸("칠한 줄 선불비", 돈(합(칠한, 선불))) : "")
      + (칠한.length !== 자료.줄.length && 수정 >= 0 ? 칸("칠한 줄 선불 수정", 돈(합(칠한, 수정))) : "");
    알림.textContent = "";
    if (!자료.줄.length) { window.VP비요크표.비우기(); return; }
    await window.VP비요크표.그리기(자료.머리, 자료.줄);
    const t = r.querySelector(".vp-table table.vp-촘촘");
    const 몸줄 = t && t.tBodies[0] ? [...t.tBodies[0].rows] : [];
    몸줄.forEach((tr, i) => {
      if (!자료.칠[i]) return;
      tr.classList.add("vp-칠한줄");
      tr.style.setProperty("--vp칠", "#" + 자료.칠[i]);
    });
    window.VP말?.(앞줄 + "줄" + 자료.줄.length + " 칠" + 칠한.length + " 그린줄" + 몸줄.length);
  }

  파일칸.addEventListener("change", async () => {
    const 파일 = 파일칸.files && 파일칸.files[0];
    파일칸.value = "";
    if (!파일) return;
    try {
      if (!/\.xlsx$/i.test(파일.name)) throw new 탈(".xlsx 파일만 읽습니다.");
      알림.textContent = "읽는 중…";
      const 자료 = { 파일: 파일.name, 때: Date.now(), ...짓기(await 읽기(await 파일.arrayBuffer())) };
      try { localStorage.setItem(열쇠, JSON.stringify(자료)); } catch (e) { window.VP말?.(앞줄 + "기억 못 함"); }
      await 그리기(자료);
    } catch (e) {
      알림.textContent = e instanceof 탈 ? e.message : "파일을 읽지 못했습니다.";
      window.VP말?.(앞줄 + "탈 " + (e && e.message ? e.message : e));
    }
  });
  지우기단추.addEventListener("click", () => {
    try { localStorage.removeItem(열쇠); } catch (e) { /* 없음 */ }
    window.VP비요크표.비우기();
    파일글.textContent = ""; 메모틀.replaceChildren(); 셈틀.replaceChildren(); 알림.textContent = "";
    지우기단추.hidden = true;
  });

  let 기억 = null;
  try { 기억 = JSON.parse(localStorage.getItem(열쇠) || "null"); } catch (e) { 기억 = null; }
  if (기억 && Array.isArray(기억.머리) && Array.isArray(기억.줄)) 그리기({ 메모: [], 칠: [], ...기억 }).catch(() => { 알림.textContent = "파일을 읽지 못했습니다."; });
})();
