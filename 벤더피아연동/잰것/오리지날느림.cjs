// 10-27 [새 지시 오리지날느림] — 「벤더피아」 단추(새 창 오리지널)가 늦게 뜨는 것을 흉내로 잰다.
// 벤더피아(ASP.NET WebForms)는 한 사람(세션)의 aspx 요청을 **하나씩** 처리한다. 잠금을 못 잡은 요청은
// 0.5초마다 다시 잡아 본다(차례 줄이 아니다). 그래서 우리 화면이 뒤에서 요청을 쉬지 않고 이어 보내면
// 새 창 요청이 잠금을 계속 놓친다. 이 자는 가상 시계로 그 꼴을 돌리고, **vp-data.js 의 진짜 쉼 코드**
// (`쉼열쇠`~`window.VP원본쉼`)를 떼어 넣어 고치기 전(쉼 없음)·후를 견준다.
// 실행: node 오리지날느림.cjs   (끝 줄 「★ 초록 N · 빨강 M」)
const fs = require("fs"), path = require("path"), vm = require("vm");

const 글 = fs.readFileSync(path.join(__dirname, "..", "vp-data.js"), "utf8");
const 쉼코드 = 글.slice(글.indexOf("const 쉼열쇠"), 글.indexOf("let foreground"));

function 돌리기({ 쉼, 뒤일꾼 = 6, 일 = 400, 쪽일 = 500, 누름 = 5000, 쪽수 = 3, 다시 = 500 }) {
  // ── 가상 시계 ──
  let 지금 = 0; const 할일 = [];
  const 나중 = (ms, f) => { 할일.push({ t: 지금 + ms, f }); 할일.sort((a, b) => a.t - b.t); };
  const 저장 = {};
  const 칸 = { Date: { now: () => 지금 }, setTimeout: (f, ms) => 나중(ms || 0, f),
    localStorage: { getItem: (k) => 저장[k] ?? null, setItem: (k, v) => { 저장[k] = v; } }, Number, Math, Promise,
    window: {}, fetch: null };
  // ── 서버: 잠금 하나, 놓친 요청은 `다시`ms 마다 다시 ──
  let 잠김 = false;
  const 요청 = (ms) => new Promise((끝) => {
    const 잡기 = () => { if (잠김) return 나중(다시, 잡기); 잠김 = true; 나중(ms, () => { 잠김 = false; 끝(); }); };
    나중(5, 잡기);                                                // 오가는 길 5ms
  });
  칸.fetch = () => 요청(일);
  vm.createContext(칸);
  vm.runInContext(쉼 ? 쉼코드 + ";this.받기=벤더피아받기;" : "this.받기=fetch;", 칸);
  // ── 우리 화면: 뒤에서 이름 찾기 따위를 쉬지 않고 ──
  let 뒤수 = 0;
  for (let i = 0; i < 뒤일꾼; i++) (async () => { for (;;) { await 칸.받기("/x", {}); 뒤수++; await new Promise((r) => 나중(30, r)); } })();
  // ── 사장님이 누름: 새 창이 쪽(틀이면 aspx 여럿)을 차례로 받는다 ──
  let 다뜸 = null;
  나중(누름, async () => {
    if (쉼) 칸.window.VP원본쉼();
    for (let i = 0; i < 쪽수; i++) await 요청(쪽일);
    다뜸 = 지금 - 누름;
  });
  // 돌림 (Promise 고리는 마이크로태스크라 할일마다 비운다)
  return (async () => {
    while (할일.length && 지금 < 누름 + 120000 && 다뜸 === null) { const x = 할일.shift(); 지금 = x.t; x.f(); await new Promise((r) => setImmediate(r)); }
    return { 다뜸, 뒤수 };
  })();
}

(async () => {
  let 초록 = 0, 빨강 = 0;
  const 봄 = (말, 됨) => { (됨 ? 초록++ : 빨강++); console.log((됨 ? "✓ " : "✗ ") + 말); };
  봄("vp-data.js 에서 쉼 코드를 찾음", 쉼코드.includes("VP원본쉼") && 쉼코드.includes("벤더피아받기"));
  const 줄 = [];
  for (const [이름, 설정] of [["틀 아님(쪽 1)", { 쪽수: 1 }], ["메인 틀(aspx 3)", { 쪽수: 3 }], ["뒤 일꾼 3", { 쪽수: 3, 뒤일꾼: 3 }]]) {
    const 전 = await 돌리기({ ...설정, 쉼: false }), 후 = await 돌리기({ ...설정, 쉼: true });
    const 글자 = (r) => (r.다뜸 === null ? "120초 넘음" : (r.다뜸 / 1000).toFixed(1) + "초");
    줄.push({ 이름, 전: 글자(전), 후: 글자(후) });
    console.log(`  ${이름}: 고치기 전 ${글자(전)} → 후 ${글자(후)}`);
    봄(`${이름}: 고친 뒤 새 창이 ${설정.쪽수 * 0.5 + 1.5}초 안에 다 뜸`, 후.다뜸 !== null && 후.다뜸 <= 설정.쪽수 * 500 + 1500);
    봄(`${이름}: 고친 뒤가 고치기 전보다 빠름`, 전.다뜸 === null || 후.다뜸 < 전.다뜸);
  }
  fs.writeFileSync(path.join(__dirname, "오리지날느림-결과.json"), JSON.stringify(줄, null, 1) + "\n");
  console.log(`★ 초록 ${초록} · 빨강 ${빨강}`);
  process.exit(빨강 ? 1 : 0);
})();
