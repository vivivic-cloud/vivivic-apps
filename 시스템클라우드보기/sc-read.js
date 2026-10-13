// SystemCloud 페이지 안(MAIN)에서 돌며, guide.js 가 부탁하면 SystemCloud 화면의 목록을 읽어 돌려준다.
// 화면을 프로그램 번호로 열고(Home.OpenPageSeq) → 그 화면의 「조회」를 실행하고 → 목록(시트)의 자료를 읽는다.
// 조회만 한다. 저장·삭제 등 다른 버튼은 누르지 않는다.
(() => {
  if (window.top !== window) return;
  // 탭이 가려져 있으면 브라우저가 setTimeout 을 1분에 한 번꼴로 늦추므로, 그때는 MessageChannel 로 기다린다
  const channel = new MessageChannel();
  const sleep = (ms) => new Promise((resolve) => {
    if (document.visibilityState === "visible") return setTimeout(resolve, ms);
    const end = performance.now() + ms;
    const tick = () => {
      if (performance.now() >= end) return resolve();
      channel.port1.onmessage = tick;
      channel.port2.postMessage(0);
    };
    tick();
  });

  // 화면이 열리고 시트가 준비될 때까지 기다린다
  async function openPage(seq, sheetId) {
    if (!document.getElementById(seq + "_iframe")) window.Home.OpenPageSeq(seq);
    for (let i = 0; i < 120; i++) {
      const f = document.getElementById(seq + "_iframe");
      const w = f?.contentWindow;
      const d = f?.contentDocument;
      const ctrl = d?.querySelector("[ng-controller]");
      const scope = ctrl && w.angular?.element(ctrl).scope();
      const sheet = d?.getElementById(sheetId);
      if (scope?._base && typeof sheet?.GetAllData === "function") return { d, scope, sheet };
      await sleep(250);
    }
    throw new Error("화면을 열지 못했습니다");
  }

  // 조회 뒤 줄 수가 한동안 그대로이면 다 받은 것으로 본다
  async function query({ d, scope, sheet }, clear) {
    for (const id of clear || []) {
      const input = d.getElementById(id);
      if (!input) continue;
      input.value = "";
      for (const t of ["input", "keyup", "change", "blur"]) input.dispatchEvent(new Event(t, { bubbles: true }));
    }
    const count = () => sheet.GetAllData().Tables[0].Rows.length;
    scope._base.ExpExecuteToolbarEvent("Query");
    let last = -1, same = 0;
    for (let i = 0; i < 160 && same < 8; i++) {
      await sleep(250);
      const n = count();
      same = n === last && (n > 0 || i >= 16) ? same + 1 : 0;
      last = n;
    }
    const t = sheet.GetAllData().Tables[0];
    return { columns: t.Columns, rows: t.Rows };
  }

  let busy = Promise.resolve();
  window.addEventListener("message", (e) => {
    const m = e.data;
    if (e.source !== window || m?.vpg !== "read") return;
    // 한 번에 하나씩 (같은 화면을 두 번 조회하지 않도록)
    busy = busy.then(async () => {
      try {
        const page = await openPage(m.seq, m.sheet);
        const data = await query(page, m.clear);
        window.postMessage({ vpg: "readResult", id: m.id, ...data }, location.origin);
      } catch (err) {
        window.postMessage({ vpg: "readResult", id: m.id, error: err.message }, location.origin);
      }
    });
  });
})();
