/* 시험이 쓰는 **PAGES** (단품관리·상품관리·재고조회 설정) 를 내준다.
   ⚠⚠ 10-15 바이글: 시험이 작업자 임시폴더(`/tmp/…/scratchpad/PAGES.json`)를 가리켜
      **남의 손에서는 안 돌았다.** 그 폴더는 그 세션 안에만 있다.
      → 베껴 두지 않고 **저장소의 `vp-data.js` 에서 그때그때 뽑는다.**
        베낀 것이 없으니 **묵을 수가 없고**, 절대경로도 안 쓴다(`__dirname` 만 쓴다).
   쓰는 법:  const PAGES = require('./본보기/PAGES.cjs');   (잰것 폴더에서) */
const fs = require('fs');
const path = require('path');

/* vp-data.js 는 브라우저 글이라 노드에 없는 것들을 쓴다 — 뽑는 동안만 흉내를 세운다.
   PAGES 는 그냥 적어 둔 값이라 이 흉내로 충분하다. */
function 뽑기() {
  const 길 = path.join(__dirname, '..', '..', 'vp-data.js');
  const 글 = fs.readFileSync(길, 'utf8');
  const 옛 = {
    chrome: global.chrome, fetch: global.fetch, DOMParser: global.DOMParser,
    FormData: global.FormData, window: global.window,
  };
  global.chrome = { storage: { local: { get: async () => ({}), set: async () => {}, remove: async () => {} } },
                    runtime: { getManifest: () => ({ version: '0' }) } };
  global.fetch = async () => ({ ok: false, text: async () => '' });
  global.DOMParser = class { parseFromString() { return null; } };
  global.FormData = class { append() {} set() {} delete() {} keys() { return []; } };
  global.window = {};
  try {
    // eslint-disable-next-line no-eval
    const VP = eval(글 + '; VP_DATA');
    if (!VP || !VP.PAGES) throw new Error('vp-data.js 에서 PAGES 를 못 찾았습니다');
    return VP.PAGES;
  } finally {
    for (const [k, v] of Object.entries(옛)) { if (v === undefined) delete global[k]; else global[k] = v; }
  }
}

module.exports = 뽑기();
