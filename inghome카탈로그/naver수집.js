/* peekit — 네이버 브랜드스토어 상품 수집기 · VG-VER v1.7.0
   판 번호는 index.html 머리띠 배지와 같다. 고칠 때 둘을 같이 올린다.

   왜 이 꼴인가 —
   이 상자(클라우드 서버)에서는 brand.naver.com 을 받을 수 없다. robots.txt 가
   ClaudeBot 과 * 를 전부 Disallow 로 막아 두었고, 상품 쪽을 찌르면 어느 쪽이든
   429 차단 안내문만 온다(3~45초 띄워 여섯 번 재 봤다). 그 막은 길을 우회하는
   것은 하지 않는다. 그래서 수집은 **사장님 PC 크롬에서 사장님이** 돌린다 —
   사장님이 이미 열어 보고 있는 화면의 값을 그대로 받아 적는 꼴이다.

   쓰는 법 (PC 크롬) —
     1. 브랜드스토어를 크롬에서 연다.  https://brand.naver.com/inggagu
     2. F12 → 위쪽 Console 칸.  (처음이면 「붙여넣기 허용」 을 물어본다 →
        칸에 allow pasting 이라 적고 Enter 한 번, 그 다음 아래 글을 붙인다)
     3. 이 글을 붙여 넣고 Enter. 그러고 기다리시면 끝이다.
     4. 받는 족족 화베(파이어스토어)의 cat_naver 에 바로 담긴다. 폰에서 peekit 을
        열면 그대로 보인다 — 파일을 옮기실 일이 없다.
        화베가 막히면 그때만 n0.json 이 내려온다. 그 파일만 바이글에게 주시면 된다.

   줄 꼴은 data/p*.json(inghome) 과 같다 — t·n·u·img·c·cp·sp·o·cw·th.
   th(썸네일)는 비워 둔다. 네이버 그림 서버(shop-phinf.pstatic.net)가 이 상자에서
   막혀 있어 작은 그림을 만들 수 없다. img 에 주소만 담는다.

   아래 창고 주소와 웹 열쇠는 index.html·shared/viggle.js 에 이미 적혀 있는 것과
   같다. 브라우저가 들고 다니는 공개된 표다 — 숨기는 낱말이 아니다.
   담는 자리는 cat_naver 다. vp_ 로 시작하지 않으니 익명 토큰으로 쓰기가 된다.    */

(async () => {
  'use strict';

  const 잠깐 = ms => new Promise(r => setTimeout(r, ms));
  const 쉼 = () => 3000 + Math.floor(Math.random() * 2000);        /* 3~5초 */
  const 로그 = (...a) => console.log('%c[peekit]', 'color:#b26a00;font-weight:700', ...a);
  const 시작 = Date.now();
  let 막힘 = 0;                                                     /* 429 가 난 횟수 */

  if (!/(^|\.)naver\.com$/.test(location.hostname)) {
    로그('네이버 가게 화면에서 돌려 주세요. 지금 자리:', location.hostname);
    return;
  }
  const 가게 = (location.pathname.split('/')[1] || '').trim();
  if (!가게) { 로그('가게 이름을 주소에서 못 읽었습니다. 가게 첫 화면에서 돌려 주세요.'); return; }

  /* ── 화베(파이어스토어) ──────────────────────────────────────────
     한 줄 = 한 문서, 문서 id 는 상품번호다. 그래야 다시 긁어도 덮어써지고
     겹치지 않는다. 통째로 한 문서에 넣지 않는다(한 문서 1MB 가 끝이다).      */
  const VG_PROJ = 'vivivic-4b7ef';
  const VG_KEY = 'AIzaSyB9X_hzd2D3goQ7oenK53Pz805P1c7oSqs';
  const VG_창고 = `https://firestore.googleapis.com/v1/projects/${VG_PROJ}/databases/(default)/documents/artifacts/${VG_PROJ}/public/data`;
  const VG_칸 = 'cat_naver';

  let 토큰 = null, 토큰끝 = 0;
  async function vg토큰() {
    if (토큰 && Date.now() < 토큰끝 - 300000) return 토큰;   /* 5분 남으면 새로 받는다 */
    const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${VG_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }) });
    if (!r.ok) throw new Error('화베에 들어가지 못했습니다 (' + r.status + ')');
    const d = await r.json();
    토큰 = d.idToken; 토큰끝 = Date.now() + 3300000;
    return 토큰;
  }
  const vg값 = v => v === null || v === undefined ? { nullValue: null }
    : typeof v === 'boolean' ? { booleanValue: v }
    : typeof v === 'number' ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v })
    : Array.isArray(v) ? { arrayValue: { values: v.map(vg값) } }
    : typeof v === 'object' ? { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, vg값(x)])) } }
    : { stringValue: String(v) };

  /* 한 줄을 담는다. 담았으면 true. 거절당하면 2s·4s·8s 로 물러나며 다시 */
  async function 화베담기(줄) {
    const id = String(줄.n).replace(/[^0-9A-Za-z_-]/g, '');
    if (!id) return false;
    for (let i = 0; i < 4; i++) {
      try {
        const tok = await vg토큰();
        const r = await fetch(`${VG_창고}/${VG_칸}/${id}`, {
          method: 'PATCH',
          headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: Object.fromEntries(Object.entries(줄).map(([k, v]) => [k, vg값(v)])) })
        });
        if (r.ok) return true;
        if (r.status === 401 || r.status === 403) { 토큰 = null; }   /* 토큰이 쉬었다 — 새로 받는다 */
        if (r.status >= 400 && r.status < 500 && r.status !== 401 && r.status !== 403 && r.status !== 429) return false;
      } catch (e) { /* 그물이 끊겼다 — 물러나며 다시 */ }
      await 잠깐(2000 * 2 ** i);
    }
    return false;
  }

  /* 집어온다 — 429·5xx 면 2s·4s·8s·16s 로 물러나며 다시. 몰아치지 않는다 */
  async function 받기(길) {
    for (let i = 0; i < 5; i++) {
      let r;
      try { r = await fetch(길, { credentials: 'include', headers: { accept: 'application/json' } }); }
      catch (e) { await 잠깐(2000 * 2 ** i); continue; }
      if (r.ok) { try { return await r.json(); } catch (e) { return null; } }
      if (r.status === 429) 막힘++;
      if (r.status === 429 || r.status >= 500) { await 잠깐(2000 * 2 ** i); continue; }
      return null;
    }
    return null;
  }

  /* 1) 이 가게 번호를 화면이 들고 있는 쪽지에서 찾는다 */
  function 가게번호() {
    const 씨 = ['channelNo', 'channelUid', 'payReferenceKey'];
    const 본 = new Set(), 답 = {};
    (function 뒤져(o, 깊이) {
      if (!o || 깊이 > 9 || typeof o !== 'object' || 본.has(o)) return;
      본.add(o);
      for (const k of Object.keys(o)) {
        const v = o[k];
        if (씨.includes(k) && (typeof v === 'string' || typeof v === 'number') && !답[k]) 답[k] = String(v);
        뒤져(v, 깊이 + 1);
      }
    })(window.__PRELOADED_STATE__ || window.__NEXT_DATA__ || {}, 0);
    return 답;
  }

  const 쪽지 = 가게번호();
  const ch = 쪽지.channelNo || 쪽지.channelUid;
  로그('가게:', 가게, '· 번호:', ch || '(못 찾음)');

  /* 2) 상품 묶음을 내주는 끝점을 골라낸다 — 되는 것 하나를 찾아 쓴다.
        화면이 쓰는 같은 집 주소라 사장님 크롬에서는 그냥 열린다 */
  const 후보 = ch ? [
    n => `/n/v2/channels/${ch}/categories/ALL/products?categorySearchType=DISPCATG&sortType=RECENT&page=${n}&pageSize=80`,
    n => `/n/v1/channels/${ch}/categories/ALL/products?categorySearchType=DISPCATG&sortType=RECENT&page=${n}&pageSize=80`,
    n => `/i/v1/brand-stores/${ch}/products?page=${n}&size=80`,
  ] : [];

  /* 묶음 안에서 상품 배열을 찾아낸다 — 끝점마다 껍데기 이름이 다르다 */
  const 배열찾기 = o => {
    if (!o || typeof o !== 'object') return null;
    if (Array.isArray(o)) return o.length && typeof o[0] === 'object' ? o : null;
    for (const k of ['simpleProducts', 'products', 'list', 'contents', 'items', 'data']) {
      const v = o[k];
      const 본 = Array.isArray(v) ? v : 배열찾기(v);
      if (본 && 본.length && (본[0].id || 본[0].productNo)) return 본;
    }
    for (const k of Object.keys(o)) {
      const 본 = 배열찾기(o[k]);
      if (본) return 본;
    }
    return null;
  };

  let 쓸끝점 = null, 첫묶음 = null;
  for (const 꼴 of 후보) {
    const d = await 받기(꼴(1));
    const a = 배열찾기(d);
    if (a) { 쓸끝점 = 꼴; 첫묶음 = d; 로그('끝점 찾음:', 꼴(1), '· 첫 쪽', a.length, '개'); break; }
    await 잠깐(쉼());
  }

  /* 못 찾으면 — 긁지 않고, 무엇이 보였는지만 알려 준다. 이걸 바이글에게 보내 주시면
     그 값으로 끝점을 맞춰 다시 내 드립니다. 엉뚱한 것을 담지 않는 쪽이 낫다 */
  if (!쓸끝점) {
    const 쪽 = window.__PRELOADED_STATE__ || window.__NEXT_DATA__;
    로그('상품 묶음을 내주는 끝점을 못 찾았습니다. 아래를 바이글에게 보내 주세요 ↓');
    console.log(JSON.stringify({
      가게, 쪽지, 주소: location.href,
      쪽지열쇠: 쪽 ? Object.keys(쪽).slice(0, 40) : null,
      막힘
    }, null, 1));
    return;
  }

  /* 3) 쪽을 넘기며 모은다 */
  const 묶음 = [];
  const 담기 = d => { const a = 배열찾기(d) || []; 묶음.push(...a); return a.length; };
  담기(첫묶음);
  for (let p = 2; p <= 60; p++) {
    await 잠깐(쉼());
    const d = await 받기(쓸끝점(p));
    const n = 담기(d);
    로그(`쪽 ${p} — ${n}개 (모두 ${묶음.length}개)`);
    if (!n) break;
  }
  if (!묶음.length) { 로그('상품이 하나도 안 왔습니다. 멈춥니다.'); return; }

  /* 4) 상품마다 들어가 옵션표·색을 받는다 — 여기가 느리다(한 개에 3~5초).
        옵션을 못 받은 상품은 이름 한 줄짜리 list 로 둔다. 비워 두지 않는다 */
  const 번호 = p => String(p.id || p.productNo || p.channelProductNo || '');
  const 돈 = v => { const n = Number(v); return Number.isFinite(n) ? Math.round(n) : 0; };

  function 분류(p) {
    const 통 = p.wholeCategoryName || p.categoryName || '';
    const 길 = String(통).split(/\s*>\s*/).filter(Boolean);
    const 쪽 = [];
    if (길.length) 쪽.push(길.slice(-2).join(' > '));
    (p.productTags || p.tags || []).forEach(t => {
      const 글 = typeof t === 'string' ? t : (t && (t.text || t.name));
      if (글) 쪽.push(String(글));
    });
    return [...new Set(쪽)];
  }

  /* 네이버 옵션을 inghome 의 o 꼴로 바꿔 놓는다 (matrix · colors · list) */
  function 옵션꼴(상세, 이름, 값) {
    const 빈 = { hidden: false, count: 1, mode: 'list', list: [[이름, 값, false]], base: 값, colors: [], sizes: [], add: [] };
    const 짝 = (상세 && (상세.optionCombinations || (상세.optionCombinationGroupNames && 상세.optionCombinations))) || [];
    if (!Array.isArray(짝) || !짝.length) return 빈;

    const 이름표 = (상세 && 상세.optionCombinationGroupNames) || {};
    const A = 이름표.optionGroupName1 || '', B = 이름표.optionGroupName2 || '';
    const 색인가 = 글 => /색|컬러|color/i.test(글 || '');

    const 줄 = 짝
      .filter(c => c && c.usable !== false)
      .map(c => {
        const a = c.optionName1 == null ? '' : String(c.optionName1);
        const b = c.optionName2 == null ? '' : String(c.optionName2);
        const 값2 = 값 + 돈(c.price);
        return { a, b, 값: 값2, 품절: (c.stockQuantity != null && 돈(c.stockQuantity) <= 0) };
      });
    if (!줄.length) return 빈;

    const 바닥 = Math.min(...줄.map(r => r.값));
    /* 이름에 이미 들어 있는 토막은 다시 붙이지 않는다 —
       「모든랙 협탁 400」 + 사이즈 400 이 「… 400 400」 이 되면 안 된다 */
    const 글줄 = r => [r.a, r.b].filter(Boolean)
      .reduce((글, 토막) => 글.split(/\s+/).includes(토막) ? 글 : 글 + ' ' + 토막, 이름);
    const list = 줄.map(r => [글줄(r), r.값, r.품절]);

    /* 두 갈래 — 사이즈 x 색상 표 */
    if (B && 줄.some(r => r.b)) {
      const rows = [...new Set(줄.map(r => r.a))];
      const cols = [...new Set(줄.map(r => r.b))];
      const cells = {};
      줄.forEach(r => { cells[r.a + '\u0001' + r.b] = [r.값, r.품절]; });
      const 색뒤 = 색인가(B);
      return {
        hidden: false, count: 줄.length, rowName: A || '사이즈·구성', colName: B,
        mode: 'matrix', rows, cols, cells, list, base: 바닥,
        colors: 색뒤 ? cols : [], sizes: 색뒤 ? rows : [], add: []
      };
    }
    /* 한 갈래 — 색이면 colors, 아니면 list */
    const 값들 = [...new Set(줄.map(r => r.a))];
    if (색인가(A)) {
      return {
        hidden: false, count: 줄.length, colName: A, mode: 'colors',
        list, base: 바닥, colors: 값들, sizes: [], add: []
      };
    }
    return { hidden: false, count: 줄.length, rowName: A, mode: 'list', list, base: 바닥, colors: [], sizes: 값들, add: [] };
  }

  /* 긴 일을 시작하기 전에 화베 문이 열리는지 먼저 본다 —
     45분 긁고 나서 못 담는 것을 아는 것보다 2초에 아는 쪽이 낫다 */
  let 화베된다 = true;
  try { await vg토큰(); 로그('화베 문 열렸습니다 — 받는 족족 담습니다.'); }
  catch (e) { 화베된다 = false; 로그('화베에 못 들어갔습니다(' + e.message + '). 그래도 끝까지 긁고 파일로 내려 드립니다.'); }

  const 줄들 = [];
  let 담긴 = 0, 못담은 = 0;
  로그(`상품 ${묶음.length}개의 옵션표를 받습니다 — 한 개에 3~5초, 어림 ${Math.ceil(묶음.length * 4 / 60)}분입니다. 창을 닫지 마세요.`);

  for (let i = 0; i < 묶음.length; i++) {
    const p = 묶음[i];
    const no = 번호(p);
    if (!no) continue;

    const 이름 = String(p.name || p.productName || '').trim();
    const 정가 = 돈(p.salePrice != null ? p.salePrice : p.price);
    const 팔값 = 돈(
      (p.benefitsView && (p.benefitsView.discountedSalePrice != null ? p.benefitsView.discountedSalePrice : p.benefitsView.sellerImmediateDiscountedSalePrice))
      != null
        ? (p.benefitsView.discountedSalePrice != null ? p.benefitsView.discountedSalePrice : p.benefitsView.sellerImmediateDiscountedSalePrice)
        : (p.discountedSalePrice != null ? p.discountedSalePrice : 정가)
    ) || 정가;

    await 잠깐(쉼());
    const 상세 = await 받기(`/n/v2/channels/${ch}/products/${no}`) || await 받기(`/n/v1/channels/${ch}/products/${no}`);
    const o = 옵션꼴(상세, 이름, 팔값);

    const 줄 = {
      n: /^\d+$/.test(no) ? Number(no) : no,
      t: 이름,
      c: 분류(상세 || p),
      cp: 정가,
      sp: 팔값,
      img: String((p.representativeImageUrl || p.imageUrl || (상세 && 상세.representativeImage && 상세.representativeImage.url) || '')).split('?')[0],
      u: `https://brand.naver.com/${가게}/products/${no}`,
      th: '',                                   /* 그림 서버가 막혀 비워 둔다 */
      o,
      cw: o.colors
    };
    줄들.push(줄);

    /* 받는 족족 담는다 — 중간에 창이 닫혀도 여기까지는 남는다.
       네이버에서 받느라 어차피 3~5초를 쉬니, 담는 데 더 드는 시간은 없다 */
    if (화베된다) {
      if (await 화베담기(줄)) 담긴++;
      else { 못담은++; if (못담은 === 5 && 담긴 === 0) { 화베된다 = false; 로그('화베가 계속 거절합니다 — 담기를 접고 파일로 내려 드립니다.'); } }
    } else 못담은++;

    if ((i + 1) % 10 === 0 || i + 1 === 묶음.length)
      로그(`옵션표 ${i + 1}/${묶음.length} — 담김 ${담긴} · 못담음 ${못담은} · 429 ${막힘}번`);
  }

  /* 5) 끝맺음 — 다 담겼으면 파일은 안 내린다. 하나라도 못 담았으면 파일로 내려 준다.
        내려받기는 지우지 않고 예비로 남긴다 — 언제든 peekit내려받기() 로 부를 수 있다 */
  window.peekit내려받기 = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(줄들)], { type: 'application/json' }));
    a.download = 'n0.json';
    document.body.appendChild(a); a.click(); a.remove();
    로그('n0.json 을 내렸습니다.');
  };

  const 초 = Math.round((Date.now() - 시작) / 1000);
  const 옵션수 = 줄들.reduce((s, r) => s + (r.o.count || 0), 0);
  로그(`끝났습니다 — 상품 ${줄들.length}개 · 옵션 ${옵션수}개 · ${초}초 · 429 ${막힘}번`);
  로그(`끝점: ${쓸끝점(1)}`);

  if (못담은 === 0 && 담긴 === 줄들.length) {
    로그(`%c화베에 담겼습니다 ${담긴}개 — 폰에서 peekit 을 열면 보입니다.`, 'color:#0a7;font-weight:700;font-size:13px');
  } else {
    window.peekit내려받기();
    로그(`%c못 담아서 파일로 내려받았습니다 — 담김 ${담긴}개 · 못담음 ${못담은}개. n0.json 을 바이글에게 보내 주세요.`, 'color:#c00;font-weight:700;font-size:13px');
  }
  window.peekit결과 = { 상품: 줄들.length, 옵션: 옵션수, 담긴, 못담은, 초, 막힘, 끝점: 쓸끝점(1), 줄들 };
})();
