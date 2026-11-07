/* CS정산 — 11-07 [새 지시 CS정산] 사장님(그대로):
     「벤더메인 메뉴에 cs정산 메뉴를 만들어  구글시트 또는 엑셀을 업로드하면 업로드 파일의 수취인/옵션값/메모 열의 값이  벤더피아 주문관리의
      수취인/주문옵션/물류메모 일치하는 목록을 나타내줘 벤더피아 조회는 최근 1년이내 모두를 검색 해서 나타내줘」
   11-07 [새 지시 CS정산목록] 사장님(그대로): 「일치하는 벤더피아의 주문관리 목록이 나타나야 함」
     → 결과 = 대조표가 아니라 **CS등록과 같은 주문관리 표**(`search.js` `VP정산표`) — 같은 칸·차례·값·이름 단추·줄 누름. 줄 차례 = 벤더피아 기본 차례(안 번호 큰 것 먼저).
       못 찾은 업로드 줄은 표 위 접힌 칸(`.vp-정산못찾음`)에 건수와 함께 따로 둔다.
   화면 = `orderMst.aspx#vgCal`(메인 메뉴). `search.js` 가 쪽 머리와 표를 세우고 이 글을 부른다 — 확장 안 글은 그대로(덮어쓰기 불필요).
   ⚠⚠ **읽기 전용.** 벤더피아에는 조회(주문관리 POST)만 간다. 업로드 파일·조회 결과는 이 브라우저 안에서만 쓰고 어디에도 보내지도 저장하지도 않는다.
   ⚠ 외부 라이브러리 없음 — .xlsx 는 브라우저의 DecompressionStream 으로 직접 푼다. 공유 링크 받기는 안 만들었다(CLAUDE.md 「CS정산」).
   ⚠ 요청은 공용 줄 `VP_DATA.받기(…, "뒤")` 로만 — 사람이 누른 요청이 먼저 가고, 다른 데를 누르거나 탭이 가려지면 쉰다.
   길(11-07 실제 화면에서 잼, CLAUDE.md 「CS정산」): 1년치 약 14만 건·700줄씩 200쪽 넘음·쪽당 9MB → 고유 수취인 수가 전체 쪽 수보다 적으면
   수취인 칸으로 1년을 묻고(부분 맞춤, 받은 줄에서 세 칸을 다시 대조), 많으면 1년치를 끝까지 쪽 넘김으로 훑는다. 일치 결과는 같다. */
(() => {
  if (window.__vp정산돌았나) return;
  window.__vp정산돌았나 = true;
  const form = document.forms[0];
  const 앞줄 = "CS정산:";
  const 틈 = 600;                                   // 요청 사이 쉼 — 벤더피아 다른 화면이 끼어들 자리
  const 표글꼴 = '"Microsoft Sans Serif", 돋움, sans-serif';
  const 쉼 = (ms) => new Promise((r) => setTimeout(r, ms));
  class 탈 extends Error {}                         // 사용자에게 그대로 보일 까닭
  class 멈춤 extends Error {}

  /* ── 비교 — 앞뒤·가운데 빈칸·줄바꿈, 대소문자, 전각/반각 표기 차이를 지운 값으로 견준다(임시 기준, CLAUDE.md) ── */
  const 맞춤값 = (글) => String(글 == null ? "" : 글).normalize("NFKC").replace(/[\s​﻿]+/g, "").toLowerCase();
  const 세칸열쇠 = (a, b, c) => [맞춤값(a), 맞춤값(b), 맞춤값(c)].join("\u0001");

  /* ── 날짜 — 오늘 포함 1년 안(벤더피아 검사 「1년 이상 값을 조회할 수 없습니다」 를 넘지 않게) ── */
  const 날짜글 = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const 오늘 = new Date();
  const 끝날 = 날짜글(오늘);
  const 첫날 = 날짜글(new Date(오늘.getFullYear() - 1, 오늘.getMonth(), 오늘.getDate() + 1));

  /* ── .xlsx = zip + xml. 라이브러리 없이 읽는다 ── */
  async function zip열기(buf) {
    const d = new DataView(buf), u8 = new Uint8Array(buf), 글풀개 = new TextDecoder();
    let e = u8.length - 22;
    while (e >= 0 && d.getUint32(e, true) !== 0x06054b50) e--;
    if (e < 0) throw new 탈("엑셀 파일을 읽지 못했습니다. 엑셀에서 .xlsx 로 다시 저장해 올려 주세요(암호가 걸린 파일은 못 읽습니다).");
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
      if (x.방식 !== 8) throw new 탈("엑셀 파일의 압축 방식을 읽지 못했습니다. 엑셀에서 .xlsx 로 다시 저장해 올려 주세요.");
      return new Response(new Blob([조각]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).text();
    };
  }
  const xml읽기 = (글) => new DOMParser().parseFromString(글, "application/xml");
  const 태그들 = (뿌리, 이름) => [...뿌리.getElementsByTagNameNS("*", 이름)];
  /* 글 조각 잇기 — ⚠ 한글 엑셀의 `rPh`(읽는 법)는 값이 아니다 */
  const 글잇기 = (뿌리) => 태그들(뿌리, "t").filter((t) => t.parentNode.localName !== "rPh").map((t) => t.textContent).join("");
  const 열번호 = (참조) => {
    let n = 0;
    for (const c of String(참조).replace(/[^A-Za-z]/g, "").toUpperCase()) n = n * 26 + c.charCodeAt(0) - 64;
    return n - 1;
  };
  async function xlsx읽기(buf) {
    const 꺼내기 = await zip열기(buf);
    const 책글 = await 꺼내기("xl/workbook.xml"), 연결글 = await 꺼내기("xl/_rels/workbook.xml.rels");
    if (!책글 || !연결글) throw new 탈("엑셀 시트를 찾지 못했습니다. 엑셀에서 .xlsx 로 다시 저장해 올려 주세요.");
    const 연결 = new Map(태그들(xml읽기(연결글), "Relationship").map((r) => [r.getAttribute("Id"), r.getAttribute("Target")]));
    const 공유글 = await 꺼내기("xl/sharedStrings.xml");
    const 공유 = 공유글 ? 태그들(xml읽기(공유글), "si").map(글잇기) : [];
    const 시트들 = [];
    for (const s of 태그들(xml읽기(책글), "sheet")) {
      const 대상 = 연결.get(s.getAttribute("r:id")) || "";
      const 글 = await 꺼내기(대상.startsWith("/") ? 대상.slice(1) : "xl/" + 대상);
      if (!글) continue;
      const 줄 = 태그들(xml읽기(글), "row").map((tr, i) => {
        const 칸 = [];
        for (const c of 태그들(tr, "c")) {
          const 값칸 = 태그들(c, "v")[0], 종류 = c.getAttribute("t");
          const 값 = 종류 === "inlineStr" ? 글잇기(c) : 값칸 ? (종류 === "s" ? 공유[Number(값칸.textContent)] : 값칸.textContent) : "";
          칸[열번호(c.getAttribute("r"))] = 값 == null ? "" : 값;
        }
        return { n: Number(tr.getAttribute("r")) || i + 1, 칸 };
      });
      시트들.push({ 이름: s.getAttribute("name") || "", 줄 });
    }
    return 시트들;
  }
  /* CSV — UTF-8(표 유무)이 아니면 EUC-KR(엑셀 CSV 기본)로 푼다 */
  function csv글풀기(buf) {
    try { return new TextDecoder("utf-8", { fatal: true }).decode(buf).replace(/^﻿/, ""); }
    catch (e) { return new TextDecoder("euc-kr").decode(buf); }
  }
  function csv읽기(글) {
    const 줄 = [];
    let 칸 = [], 값 = "", 따옴표 = false;
    const 칸끝 = () => { 칸.push(값); 값 = ""; };
    const 줄끝 = () => { 칸끝(); 줄.push({ n: 줄.length + 1, 칸 }); 칸 = []; };
    for (let i = 0; i < 글.length; i++) {
      const c = 글[i];
      if (따옴표) {
        if (c !== '"') 값 += c;
        else if (글[i + 1] === '"') { 값 += '"'; i++; }
        else 따옴표 = false;
      } else if (c === '"') 따옴표 = true;
      else if (c === ",") 칸끝();
      else if (c === "\n") 줄끝();
      else if (c !== "\r") 값 += c;
    }
    if (값 || 칸.length) 줄끝();
    return [{ 이름: "", 줄 }];
  }
  async function 파일읽기(파일) {
    if (/\.xlsx$/i.test(파일.name)) return xlsx읽기(await 파일.arrayBuffer());
    if (/\.csv$/i.test(파일.name)) return csv읽기(csv글풀기(await 파일.arrayBuffer()));
    throw new 탈("이 파일 꼴은 못 읽습니다. .xlsx 또는 .csv 로 저장해 올려 주세요(옛 .xls 는 엑셀에서 .xlsx 로 다시 저장).");
  }

  /* 제목 찾기 — 시트마다 앞 20줄에서 「수취인」「옵션값」「메모」 세 제목이 다 든 줄을 찾는다 */
  const 찾을제목 = ["수취인", "옵션값", "메모"];
  function 제목찾기(시트들) {
    let 낫 = null;
    for (const s of 시트들) {
      for (const 줄 of s.줄.slice(0, 20)) {
        const 글들 = [...줄.칸].map((x) => 맞춤값(x));
        const 자리 = 찾을제목.map((h) => 글들.indexOf(h));
        const 찾음 = 자리.filter((x) => x >= 0).length;
        if (찾음 === 3) return { s, 줄, 자리 };
        const 칸수 = 글들.filter(Boolean).length;
        if (칸수 && (!낫 || 찾음 > 낫.찾음)) 낫 = { s, 줄, 자리, 찾음 };
      }
    }
    if (!낫) throw new 탈("파일에 읽을 줄이 없습니다.");
    const 없음 = 찾을제목.filter((_, i) => 낫.자리[i] < 0);
    const 본것 = [...낫.줄.칸].map((x) => String(x == null ? "" : x).trim()).filter(Boolean).slice(0, 12).join(", ");
    throw new 탈("없는 열: " + 없음.join(", ") + " — 제목이 정확히 「수취인」「옵션값」「메모」 여야 합니다."
      + (낫.s.이름 ? " (시트 「" + 낫.s.이름 + "」" : " (") + 낫.줄.n + "번째 줄에서 본 제목: " + 본것 + ")");
  }
  function 업로드줄뽑기(시트들) {
    const { s, 줄: 제목줄, 자리 } = 제목찾기(시트들);
    const 값 = (줄, i) => String(줄.칸[자리[i]] == null ? "" : 줄.칸[자리[i]]).trim();
    const 줄들 = s.줄.filter((줄) => 줄.n > 제목줄.n)
      .map((줄) => ({ n: 줄.n, 수취인: 값(줄, 0), 옵션값: 값(줄, 1), 메모: 값(줄, 2), 찾은: false }))
      .filter((줄) => 줄.수취인 || 줄.옵션값 || 줄.메모);
    if (!줄들.length) throw new 탈("제목 줄 아래에 값이 있는 줄이 없습니다.");
    return { 줄들, 시트: s.이름 };
  }

  /* ── 벤더피아 조회 ──
     요청 = 주문관리 폼 그대로 + 조회 단추 좌표(`보내기` 와 같은 길), 다음 쪽 = 받은 폼 + 쪽 번호 링크, 11·21…쪽은 Next 그림 단추. */
  const 폼이름 = (id) => [...form.elements].map((e) => e.name).find((n) => n && (n === id || n.endsWith("$" + id)));
  const 체크빼기 = (fd) => { for (const k of [...fd.keys()]) if (k.includes("chkItem")) fd.delete(k); return fd; };
  function 첫폼(칸, 줄수) {
    const fd = 체크빼기(new FormData(form));
    const 단추 = form.querySelector('input[type=image][name$="btnSearch"]');   // ⚠ 그림 단추는 form.elements 에 없다
    if (!단추) throw new 탈("주문관리 조회 단추를 찾지 못했습니다.");
    fd.append(단추.name + ".x", "5"); fd.append(단추.name + ".y", "5");
    fd.set(폼이름("ddlRowCnt"), 줄수);
    fd.set(폼이름("dcStartDt"), 첫날);
    fd.set(폼이름("dcEndDt"), 끝날);
    for (const [k, v] of Object.entries(칸)) fd.set(폼이름(k), v);
    return fd;
  }
  function 다음폼(doc, 쪽) {
    const fd = 체크빼기(new FormData(doc.forms[0]));
    const 링크 = [...doc.querySelectorAll('[id*="Pager1"] a')].find((a) => a.textContent.trim() === String(쪽));
    const 이름 = 링크 && ((링크.getAttribute("href") || "").match(/doPostBack\('([^']+)'/) || [])[1];
    fd.set("__EVENTARGUMENT", "");
    if (이름) { fd.set("__EVENTTARGET", 이름); return fd; }
    const 다음 = [...doc.querySelectorAll('[id*="Pager1"] input')].find((i) => /next/i.test(i.value || i.alt || ""));
    if (!다음) return null;
    fd.set("__EVENTTARGET", "");
    fd.delete(다음.name);
    if (다음.type === "image") { fd.append(다음.name + ".x", "5"); fd.append(다음.name + ".y", "5"); }
    else fd.set(다음.name, 다음.value);
    return fd;
  }
  /* 응답을 읽는다 — 칸 자리는 머리 글자로 찾는다(주문번호는 둘: 앞 = 안 번호, 뒤 = 몰 주문번호) */
  const 칸글 = (c) => (c.textContent || "").replace(/\s+/g, " ").trim();
  const 필요칸 = ["수취인", "주문옵션", "물류메모"];
  function 쪽읽기(글) {
    const 맑은 = 글.replace(/<script\b[\s\S]*?<\/script>/gi, "");
    const doc = new DOMParser().parseFromString(맑은, "text/html");
    if (doc.querySelector("input[type=password]")) throw new 탈("벤더피아 로그인이 끊겼습니다. 다시 로그인한 뒤 파일을 다시 올려 주세요.");
    const 행수글 = (맑은.match(/행수\s*:\s*([\d,]+)/) || [])[1];
    const g = doc.getElementById("oGrid");
    const 전체줄 = g ? [...g.querySelectorAll("tr")] : [];
    const 머리 = 전체줄.find((tr) => tr.cells.length >= 60);
    if (행수글 == null && !머리) throw new 탈("주문관리 응답을 읽지 못했습니다. 주문관리 화면이 바뀌었는지 확인이 필요합니다.");
    const 이름들 = 머리 ? [...머리.cells].map(칸글) : [];
    const 자리 = (이름) => 이름들.indexOf(이름);
    if (머리 && 필요칸.some((h) => 자리(h) < 0)) throw new 탈("주문관리 표에서 칸을 못 찾았습니다: " + 필요칸.filter((h) => 자리(h) < 0).join(", "));
    const 줄들 = 머리 ? 전체줄.filter((tr) => tr !== 머리 && tr.cells.length === 머리.cells.length && !tr.querySelector("tr") && !tr.querySelector("th.igg_HeaderCaption")) : [];
    const 표 = 머리 ? window.VP정산표.읽기(doc) : { heads: [], rows: [] };   // 주문관리 표에 그릴 칸 — CS등록과 같은 읽기(`목록고르기`), 줄 차례는 위 `줄들` 과 같다
    if (표.rows.length !== 줄들.length) throw new 탈("주문관리 표 줄을 맞추지 못했습니다(" + 표.rows.length + " / " + 줄들.length + "). 주문관리 화면이 바뀌었는지 확인이 필요합니다.");
    return {
      머리: 표.heads, doc, 행수: 행수글 == null ? 줄들.length : Number(행수글.replace(/,/g, "")),
      지금쪽: Number((doc.querySelector('[name$="hdCurrentPage"]') || {}).value) || 0,
      줄들: 줄들.map((tr, j) => {
        const 값 = (i) => (i >= 0 ? 칸글(tr.cells[i]) : "");
        return { 안번호: 값(자리("주문번호")), 수취인: 값(자리("수취인")), 주문옵션: 값(자리("주문옵션")), 물류메모: 값(자리("물류메모")), 상품코드: 값(자리("상품코드")), 표줄: 표.rows[j] };
      }),
    };
  }

  let 판 = null;                                     // 지금 도는 조회
  async function 묻기(fd) {
    판.요청++;
    for (let 번 = 1; ; 번++) {
      try {
        const res = await VP_DATA.받기(form.action, { method: "POST", body: fd, credentials: "include", cache: "no-store" }, "뒤");
        if (!res.ok) throw new Error("HTTP " + res.status);
        const 답 = 쪽읽기(await res.text());
        if (!판.머리.length && 답.줄들.length) 판.머리 = 답.머리;
        return 답;
      } catch (e) {
        if (e instanceof 탈 || (e && e.name === "AbortError") || 번 >= 2) throw e;
        await 쉼(3000);                               // 한 번만 다시
      }
    }
  }
  const 멈췄나 = () => { if (판.멈춤) throw new 멈춤(); };
  /* 한 질문의 쪽을 끝까지 걷는다 */
  async function 걷기(fd, 줄마다) {
    let 쪽 = 1, 받음 = 0, 답 = await 묻기(fd);
    for (;;) {
      받음 += 답.줄들.length;
      답.줄들.forEach(줄마다);
      판.표시?.(쪽, 받음, 답.행수);
      if (받음 >= 답.행수 || !답.줄들.length) return 답.행수;
      멈췄나();
      쪽++;
      await 쉼(틈);
      const 다음 = 다음폼(답.doc, 쪽);
      if (!다음) throw new 탈(쪽 + "쪽으로 넘어가는 단추를 찾지 못했습니다. 받은 곳까지만 보입니다.");
      답 = await 묻기(다음);
      if (답.지금쪽 && 답.지금쪽 !== 쪽) throw new 탈(쪽 + "쪽을 받지 못했습니다(받은 쪽 " + 답.지금쪽 + "). 받은 곳까지만 보입니다.");
    }
  }
  async function 조회(업로드) {
    const 맞춤판 = new Map();
    for (const 줄 of 업로드) {
      const k = 세칸열쇠(줄.수취인, 줄.옵션값, 줄.메모);
      (맞춤판.get(k) || 맞춤판.set(k, []).get(k)).push(줄);
    }
    const 본줄 = new Set();
    const 대조 = (o) => {
      const 짝 = 맞춤판.get(세칸열쇠(o.수취인, o.주문옵션, o.물류메모));
      if (!짝) return;
      const 열쇠 = [o.안번호, o.상품코드, o.주문옵션].join("\u0001");
      if (본줄.has(열쇠)) return;
      본줄.add(열쇠);
      판.벤더피아건++;
      판.찾은줄.push(o);
      for (const 줄 of 짝) 줄.찾은 = true;
    };
    const 이름들 = new Map();
    for (const 줄 of 업로드) if (맞춤값(줄.수취인) && !이름들.has(맞춤값(줄.수취인))) 이름들.set(맞춤값(줄.수취인), 줄.수취인);
    const 첫답 = await 묻기(첫폼({}, "10"));
    판.전체 = 첫답.행수;
    const 전체쪽 = Math.ceil(첫답.행수 / 700);
    if (이름들.size <= 전체쪽) {
      판.길 = "수취인별";
      let i = 0;
      for (const 이름 of 이름들.values()) {
        멈췄나();
        await 쉼(틈);
        i++;
        판.표시 = (쪽) => 진행쓰기("수취인 " + i + " / " + 이름들.size + (쪽 > 1 ? " · " + 쪽 + "쪽" : ""), i / 이름들.size);
        판.표시(1);
        await 걷기(첫폼({ tbRecipient: 이름 }, "100"), 대조);
      }
    } else {
      판.길 = "전체";
      판.표시 = (쪽, 받음, 행수) => 진행쓰기(쪽 + " / " + 전체쪽 + "쪽 · " + 받음.toLocaleString() + " / " + 행수.toLocaleString() + "건", 받음 / 행수);
      await 쉼(틈);
      await 걷기(첫폼({}, "700"), 대조);
    }
  }

  /* ── 화면 — 쪽 머리·알림·표 통은 `search.js` 가 세웠다. 여기는 올리기 줄·안내·못 찾은 칸만 ── */
  const r = document.getElementById("vp-root");
  const 쪽 = r.querySelector(".vp-search"), 알림 = r.querySelector(".vp-note");
  쪽.classList.add("vp-정산");
  r.querySelector(".vp-bar").insertAdjacentHTML("beforebegin", `
      <div class="vp-정산줄">
        <label class="vp-머리단추 vp-파일단추">파일 올리기<input type="file" accept=".xlsx,.csv" style="display:none"></label>
        <button type="button" class="vp-머리단추 vp-정산멈춤" style="display:none">멈추기</button>
        <span class="vp-파일이름"></span>
      </div>
      <div class="vp-정산안내">엑셀(.xlsx)·CSV 파일에 「수취인」「옵션값」「메모」 열이 있어야 합니다. 구글시트는 <b>파일 → 다운로드 → Microsoft Excel(.xlsx)</b> 로 받아서 올리세요.
        벤더피아 주문관리 ${첫날} ~ ${끝날}(등록일) 전체에서 찾습니다. 파일은 이 브라우저 안에서만 읽고 어디에도 보내지 않습니다.</div>`);
  알림.insertAdjacentHTML("afterend", `<details class="vp-정산못찾음" hidden><summary></summary><div class="vp-table"></div></details>`);
  const 입력 = r.querySelector("input[type=file]"), 파일단추 = r.querySelector(".vp-파일단추"), 멈춤단추 = r.querySelector(".vp-정산멈춤");
  const 파일이름 = r.querySelector(".vp-파일이름"), 못칸 = r.querySelector(".vp-정산못찾음"), 못통 = 못칸.querySelector(".vp-table");
  const 목록통 = r.querySelector(":scope .vp-search > .vp-table");

  function 진행쓰기(글, 몫) {
    판.글 = 글; 판.몫 = 몫;
    진행그리기();
  }
  function 진행그리기() {
    if (!판) return;
    const 지남 = Math.round((Date.now() - 판.시작) / 1000);
    const 남음 = 판.몫 > 0.02 && 판.몫 < 1 ? " · 남은 시간 약 " + 시간글(Math.round(지남 / 판.몫 - 지남)) : "";
    알림.textContent = (판.멈춤 ? "멈추는 중… " : "벤더피아 조회 중 ") + 판.글 + " · 일치 " + 판.벤더피아건.toLocaleString() + "건 · " + 시간글(지남) + 남음
      + (document.hidden ? " · 이 탭이 가려져 쉬는 중(돌아오면 이어집니다)" : "");
  }
  const 시간글 = (초) => (초 >= 60 ? Math.floor(초 / 60) + "분 " : "") + (초 % 60) + "초";

  /* 못 찾은 업로드 줄 표 — 벤더피아 꼴(`table.vp-촘촘`, search.css). 열 끌기는 `search.js` `넓이틀` 과 같은 쓰임, 저장 열쇠만 따로 */
  const 넓이열쇠 = "vp열넓이:CS정산", 최소넓이 = 16, 끝넓이 = 130, 긴칸끝 = 200;
  const 칸들 = [["결과", (u) => u.결과], ["줄", (u) => String(u.n)], ["수취인", (u) => u.수취인], ["옵션값", (u) => u.옵션값], ["메모", (u) => u.메모]];
  const 긴칸 = /옵션|메모/;
  let 재는판 = null;
  function 글너비(글, 굵게) {
    try {
      재는판 = 재는판 || document.createElement("canvas").getContext("2d");
      재는판.font = (굵게 ? "700 " : "") + "11px " + 표글꼴;
      return Math.ceil(재는판.measureText(글).width);
    } catch (e) { return 글.length * 9; }
  }
  function 넓이읽기() {
    try { const 값 = JSON.parse(localStorage.getItem(넓이열쇠) || "{}"); return 값 && typeof 값 === "object" ? 값 : {}; } catch (e) { return {}; }
  }
  function 넓이틀(t, 줄값들) {
    const 묶음 = document.createElement("colgroup");
    const cols = 칸들.map(() => 묶음.appendChild(document.createElement("col")));
    t.insertBefore(묶음, t.firstChild);
    const 둔것 = 넓이읽기();
    const 자동 = 칸들.map(([h], i) => {
      const 끝값 = 긴칸.test(h) ? 긴칸끝 : 끝넓이;
      let w = 글너비(h, true) + 8;
      for (const 줄 of 줄값들) { if (w >= 끝값) break; if (줄[i]) w = Math.max(w, Math.min(끝값, 글너비(줄[i].slice(0, 60)) + 8)); }
      return w;
    });
    const 둠 = 칸들.map(([h]) => Number(둔것[h]) >= 최소넓이);
    const 자리 = 칸들.map(([h], i) => (둠[i] ? Math.round(둔것[h]) : 자동[i]));
    const 입히기 = () => {
      let 합 = 0;
      cols.forEach((c, i) => { const w = 둠[i] ? 자리[i] : 자동[i]; c.style.width = w + "px"; 합 += w; });
      t.style.width = 합 + "px";
    };
    const 쓰기 = () => {
      const 값 = {};
      칸들.forEach(([h], i) => { if (둠[i]) 값[h] = 자리[i]; });
      try { localStorage.setItem(넓이열쇠, JSON.stringify(값)); } catch (e) {}
    };
    [...t.tHead.rows[0].cells].forEach((th, i) => {
      const 손 = th.appendChild(document.createElement("span"));
      손.className = "vp-열손";
      손.title = "끌면 넓이 조정 · 두 번 누르면 처음 넓이로";
      손.addEventListener("pointerdown", (e) => {
        e.preventDefault(); e.stopPropagation();
        const x0 = e.clientX, w0 = 둠[i] ? 자리[i] : 자동[i];
        try { 손.setPointerCapture(e.pointerId); } catch (err) {}
        손.classList.add("vp-끄는중");
        const 움직 = (ev) => { 자리[i] = Math.max(최소넓이, Math.round(w0 + ev.clientX - x0)); 둠[i] = true; 입히기(); };
        const 끝 = () => {
          손.removeEventListener("pointermove", 움직); 손.removeEventListener("pointerup", 끝); 손.removeEventListener("pointercancel", 끝);
          손.classList.remove("vp-끄는중");
          if (둠[i]) 쓰기();
        };
        손.addEventListener("pointermove", 움직); 손.addEventListener("pointerup", 끝); 손.addEventListener("pointercancel", 끝);
      });
      손.addEventListener("dblclick", (e) => { e.stopPropagation(); 둠[i] = false; 입히기(); 쓰기(); });
    });
    입히기();
  }

  function 못찾음그리기(못) {
    못칸.hidden = !못.length;
    못칸.open = false;
    못통.replaceChildren();
    if (!못.length) return;
    못칸.querySelector("summary").textContent = "못 찾은 업로드 줄 " + 못.length.toLocaleString() + "건";
    const 줄값들 = 못.map((u) => 칸들.map(([, 뽑]) => String(뽑(u) || "")));
    const t = document.createElement("table");
    t.className = "vp-촘촘";
    const 머리 = t.createTHead().insertRow();
    칸들.forEach(([h], i) => {
      const th = 머리.appendChild(document.createElement("th"));
      th.textContent = h;
      if (i === 0) th.className = "vp-first";
    });
    const 몸 = t.createTBody();
    for (const 값들 of 줄값들) {
      const tr = 몸.insertRow();
      tr.classList.add("vp-못찾음줄");
      값들.forEach((값, i) => {
        const td = tr.insertCell();
        td.textContent = 값;
        if (값) td.title = 값;
        if (i === 0) td.className = "vp-first";
      });
    }
    못통.appendChild(t);
    넓이틀(t, 줄값들);
  }
  /* 일치한 주문 = 주문관리 표(`VP정산표`, CS등록과 같은 표) · 줄 차례 = 벤더피아 기본 차례(안 번호 큰 것 먼저 — 11-07 500줄에서 잼) */
  async function 결과그리기(업로드, p) {
    못찾음그리기(업로드.filter((u) => !u.찾은).map((u) => ({ ...u, 결과: 맞춤값(u.수취인) ? "못 찾음" : "수취인 없음" })));
    const 번호 = (o) => Number(o.안번호) || 0;
    const 줄들 = p.찾은줄.slice().sort((a, b) => 번호(b) - 번호(a)).map((o) => o.표줄);
    if (줄들.length) await window.VP정산표.그리기(p.머리, 줄들);
    else 목록통.textContent = "일치한 주문이 없습니다.";
    if (!줄들.length) 못칸.open = true;
  }

  async function 시작(파일) {
    파일이름.textContent = 파일.name;
    window.VP정산표.비우기();
    못칸.hidden = true;
    알림.textContent = "파일 읽는 중…";
    let 업로드;
    try { 업로드 = 업로드줄뽑기(await 파일읽기(파일)).줄들; }
    catch (e) {
      window.VP말?.(앞줄 + "파일 못 읽음 " + (e && e.name));
      알림.textContent = e instanceof 탈 ? e.message : "파일을 읽지 못했습니다. 엑셀에서 .xlsx 로 다시 저장해 올려 주세요.";
      return;
    }
    판 = { 시작: Date.now(), 요청: 0, 벤더피아건: 0, 찾은줄: [], 머리: [], 전체: 0, 길: "", 글: "준비", 몫: 0, 멈춤: false, 표시: null };
    const 시계 = setInterval(진행그리기, 1000);
    파일단추.style.display = "none";
    멈춤단추.style.display = "";
    진행그리기();
    let 끝말 = "";
    try { await 조회(업로드); }
    catch (e) {
      if (e instanceof 멈춤) 끝말 = "멈췄습니다 — 받은 곳까지만 대조했습니다. ";
      else if (e instanceof 탈) 끝말 = e.message + " ";
      else if (e && e.name === "AbortError") 끝말 = "다른 화면으로 가느라 조회를 멈췄습니다. ";
      else 끝말 = "조회에 실패했습니다. 벤더피아에 로그인되어 있는지 확인하고 다시 올려 주세요. ";
    }
    clearInterval(시계);
    const p = 판;
    판 = null;
    await 결과그리기(업로드, p);
    const 일치 = 업로드.filter((u) => u.찾은).length;
    const 초 = Math.round((Date.now() - p.시작) / 1000);
    window.VP말?.(앞줄 + "끝 요청" + p.요청 + " " + 초 + "초 " + p.길);
    알림.textContent = 끝말 + "일치 주문 " + p.벤더피아건.toLocaleString() + "건 · 업로드 " + 업로드.length.toLocaleString() + "줄 중 일치 " + 일치.toLocaleString() + "줄"
      + " · 못 찾음 " + (업로드.length - 일치).toLocaleString() + "줄 · 벤더피아 1년치 " + p.전체.toLocaleString() + "건 대상"
      + " · " + (p.길 === "전체" ? "전체 훑기" : "수취인별 조회") + " · 요청 " + p.요청 + "번 · " + 시간글(초);
    파일단추.style.display = "";
    멈춤단추.style.display = "none";
    입력.value = "";
  }
  입력.addEventListener("change", () => { if (입력.files[0] && !판) 시작(입력.files[0]); });
  멈춤단추.addEventListener("click", () => { if (판) { 판.멈춤 = true; 진행그리기(); } });
  document.addEventListener("visibilitychange", 진행그리기);
})();
