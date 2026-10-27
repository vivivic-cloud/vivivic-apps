// 10-27 [새 지시 이동느림근본] — 「클릭 → 벤더피아 다른 쪽이 뜨기까지」 를 흉내로 잰다(고치기 전 ↔ 후).
// 서버: 한 로그인의 aspx 는 **하나씩**, 못 들어간 요청은 0.5초마다 다시 잡아 본다(사장님 크롬에서 잰 꼴:
//   혼자 0.25~0.33초 · 4개 동시 0.3/0.8/1.3/1.8초 · 뒤 요청 하나가 쉬지 않으면 0.33초 쪽이 4.5~8.5초).
// 후 = **vp-data.js 의 진짜 공용 줄 코드**(`const 쉼열쇠` ~ `let foreground`)를 떼어 돌린다.
// 전 = 맨 fetch (이름 찾기 3+3 일꾼 · 미리 받기 · 재고 — 쉬지 않고 이어 보냄).
// 실행: node 이동느림.cjs   (끝 줄 「★ 초록 N · 빨강 M」, 결과 이동느림-결과.json)
const fs = require("fs"), path = require("path"), vm = require("vm");
const 글 = fs.readFileSync(path.join(__dirname, "..", "vp-data.js"), "utf8");
const 줄코드 = 글.slice(글.indexOf("const 쉼열쇠"), 글.indexOf("let foreground"));

function 세상({ 후 }) {
  let 지금 = 0; const 할일 = [];
  const 나중 = (ms, f) => { const x = { t: 지금 + ms, f }; let i = 할일.length; while (i && 할일[i - 1].t > x.t) i--; 할일.splice(i, 0, x); return x; };
  const 저장 = {};
  // ── 서버 ──
  let 잠김 = false;
  const 요청 = (ms, 신호) => new Promise((끝, 틀림) => {
    const 잡기 = () => { if (잠김) return 나중(500, 잡기); 잠김 = true; 나중(ms, () => { 잠김 = false; 나중(5, 끝); }); };
    나중(5, 잡기);
    신호?.addEventListener?.("abort", () => 틀림(new Error("abort")));   // 끊어도 서버는 끝까지 한다
  });
  // ── 우리 문서(하나) ──
  const 듣개 = {};
  const 문서 = { hidden: false, 초점: true, hasFocus() { return this.초점; } };
  const 칸 = { Date: { now: () => 지금 }, setTimeout: (f, ms) => 나중(ms || 0, f), clearTimeout() {}, Math, JSON, Promise, Set, Map,
    AbortController, DOMException, document: 문서, localStorage: { getItem: (k) => 저장[k] ?? null, setItem: (k, v) => { 저장[k] = v; } },
    addEventListener: (t, f) => (듣개[t] ||= []).push(f), fetch: (url, opt) => 요청(Number(String(url).split("#")[1]) || 300, opt && opt.signal) };
  칸.window = 칸; 칸.top = { document: 문서 };
  vm.createContext(칸);
  vm.runInContext(후 ? 줄코드 + ";this.받기=벤더피아받기;" : "this.받기=(u,o)=>fetch(u,o);", 칸);
  const 쏘기 = (t, e = {}) => (듣개[t] || []).forEach((f) => f({ type: t, persisted: false, target: { closest: () => ({ matches: () => true, getAttribute: () => "/System/Sales/orderMst.aspx", closest: () => null }) }, key: "Enter", ...e }));
  const 돌림 = async (끝날때, 한도 = 120000) => {
    while (할일.length && 지금 < 한도 && !끝날때()) { const x = 할일.shift(); 지금 = x.t; x.f(); for (let i = 0; i < 3; i++) await new Promise((r) => setImmediate(r)); }
  };
  return { 칸, 문서, 쏘기, 요청, 나중, 돌림, 지금: () => 지금 };
}

// 경우: 뒤에서 도는 것 + 누름 + 새 쪽(aspx 몇 장)
async function 한번({ 후, 뒤, 누름, 쪽 = [330], 때 = 3000 }) {
  const w = 세상({ 후 });
  let 그만 = false, 뒤수 = 0;
  const 일꾼 = (ms, 급) => (async () => { for (; !그만;) { try { await w.칸.받기("/x#" + ms, {}, 급); 뒤수++; } catch (e) { return; } } })();
  for (const [수, ms, 급] of 뒤) for (let i = 0; i < 수; i++) w.나중(i * 37, () => 일꾼(ms, 급));
  let 다뜸 = null;
  w.나중(때, async () => {
    const t0 = w.지금();
    w.쏘기("pointerdown");
    if (누름 === "같은탭") { w.쏘기("beforeunload"); }
    if (누름 === "새탭") w.나중(30, () => { w.문서.hidden = true; w.문서.초점 = false; w.쏘기("visibilitychange"); });
    if (누름 === "원본") { w.칸.VP원본쉼?.(); w.나중(30, () => { w.문서.초점 = false; }); }
    if (누름 === "딴창") { w.문서.초점 = false; }        // 오리지널 창 안에서 누름 — 우리 문서는 누름을 못 본다
    for (const ms of 쪽) await w.요청(ms);
    다뜸 = w.지금() - t0;
    if (누름 === "같은탭") { w.쏘기("pagehide"); 그만 = true; }
  });
  await w.돌림(() => 다뜸 !== null);
  return { 다뜸, 뒤수 };
}
// 이름 찾기 N 가지를 다 끝내는 데 걸린 시간 (아무것도 안 누름, 보이는 화면)
async function 찾기빠르기({ 후, 수 = 60, ms = 280, 일꾼 = 6 }) {
  const w = 세상({ 후 });
  let 남음 = 수, 됨 = 0, 끝 = null;
  for (let i = 0; i < 일꾼; i++) (async () => { while (남음 > 0) { 남음--; await w.칸.받기("/x#" + ms, {}, "뒤"); if (++됨 === 수) 끝 = w.지금(); } })();
  await w.돌림(() => 끝 !== null, 600000);
  return 끝;
}

(async () => {
  let 초록 = 0, 빨강 = 0;
  const 봄 = (말, 됨) => { (됨 ? 초록++ : 빨강++); console.log((됨 ? "✓ " : "✗ ") + 말); };
  봄("vp-data.js 에서 공용 줄 코드를 찾음", 줄코드.includes("벤더피아받기") && 줄코드.includes("beforeunload"));
  const 이름찾기 = [6, 280, "뒤"];                       // 배송관리·CS등록 이름 찾기 3+3
  const 경우들 = [
    ["상담내용보기(새 탭) — 이름 찾기 중", { 뒤: [이름찾기], 누름: "새탭" }],
    ["← 메인(같은 탭, 틀 aspx 3장) — 이름 찾기 중", { 뒤: [이름찾기], 누름: "같은탭", 쪽: [330, 330, 330] }],
    ["메뉴 단추(새 탭) — 메인 미리 받기(700줄 1.5초) 중", { 뒤: [[1, 1500, "뒤"]], 누름: "새탭" }],
    ["단품/상품 단추 누른 직후 → ← 메인 — 상세(1.5초)+이름 찾기 중", { 뒤: [[1, 1500, "사람"], 이름찾기], 누름: "같은탭", 쪽: [330, 330, 330], 때: 3100 }],
    ["CS등록 재고(2초×5, 사람 길) 중 → 상담내용보기(새 탭)", { 뒤: [[1, 2000, "사람"]], 누름: "새탭" }],
    ["「벤더피아」 단추(오리지널 새 창, 틀 3장)", { 뒤: [이름찾기], 누름: "원본", 쪽: [330, 330, 330] }],
    ["오리지널 창에서 20초 뒤 메뉴 누름(우리 창은 뒤에)", { 뒤: [이름찾기], 누름: "딴창", 때: 20000 }],
  ];
  const 줄 = [];
  for (const [이름, 설정] of 경우들) {
    const 전들 = [], 후들 = [];
    for (let k = 0; k < 5; k++) {          // 누르는 때를 조금씩 바꿔 다섯 번
      const s = { ...설정, 때: (설정.때 || 3000) + k * 113 };
      전들.push((await 한번({ ...s, 후: false })).다뜸); 후들.push((await 한번({ ...s, 후: true })).다뜸);
    }
    const 평 = (a) => a.reduce((x, y) => x + (y ?? 120000), 0) / a.length / 1000, 큰 = (a) => Math.max(...a.map((y) => y ?? 120000)) / 1000;
    const r = { 이름, 전평균: +평(전들).toFixed(2), 전최악: +큰(전들).toFixed(2), 후평균: +평(후들).toFixed(2), 후최악: +큰(후들).toFixed(2) };
    줄.push(r);
    console.log(`  ${이름}: 전 평균 ${r.전평균}초(최악 ${r.전최악}) → 후 평균 ${r.후평균}초(최악 ${r.후최악})`);
    const 혼자 = (설정.쪽 || [330]).reduce((a, b) => a + b, 0) / 1000;
    봄(`${이름}: 후 최악이 혼자 뜰 때 + 진행 중 한 개 + 0.6초 안`, r.후최악 <= 혼자 + Math.max(...설정.뒤.map((x) => x[1])) / 1000 + 0.6);
    봄(`${이름}: 후가 전보다 느리지 않음`, r.후평균 <= r.전평균 + 0.05);
  }
  const 전찾기 = await 찾기빠르기({ 후: false }), 후찾기 = await 찾기빠르기({ 후: true });
  console.log(`  이름 찾기 60가지(아무것도 안 누름): 전 ${(전찾기 / 1000).toFixed(1)}초 → 후 ${(후찾기 / 1000).toFixed(1)}초`);
  줄.push({ 이름: "이름 찾기 60가지 다 끝남", 전: 전찾기 / 1000, 후: 후찾기 / 1000 });
  봄("이름 찾기가 느려지지 않음(하나씩 보내도)", 후찾기 <= 전찾기);
  fs.writeFileSync(path.join(__dirname, "이동느림-결과.json"), JSON.stringify(줄, null, 1) + "\n");
  console.log(`★ 초록 ${초록} · 빨강 ${빨강}`);
  process.exit(빨강 ? 1 : 0);
})();
