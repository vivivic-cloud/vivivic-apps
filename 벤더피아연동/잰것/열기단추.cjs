/* **「벤더피아 열기」 단추**를 세는 자 — 10-16 사장님 (설치 안내 화면에서 짚어 보내신 말씀, 그대로):
     「이페이지에 벤더피아 연결링크 버튼 만들어 주세요 이전에는 있었습니다」
   그 단추는 `#깔림` 칸 안에만 있었고 그 칸은 **확장을 찾았을 때만** 켜진다 —
   못 찾은 컴퓨터·폰에서는 벤더피아로 갈 길이 **0개**였다. 「이전에는 있었습니다」 가 그 말씀이다.
   보아야 하는 것 —
     ㄱ) 확장 **없을 때** 보이는 「벤더피아 열기」 가 몇 개냐 (고치기 전 0 → 뒤 1)
     ㄴ) 확장 **있을 때** 두 개가 같이 뜨지 않나 (바이글 분부: 「두 개가 같이 뜨는 일은 없게」)
     ㄷ) **폰(375)** 에서도 보이나 — `#못찾음` 글은 크롬·비모바일만인데 단추까지 묶으면 폰에서 또 안 보인다
     ㄹ) 가는 곳이 정말 vendorpia.com 이냐
   ⚠ 진짜 vendorpia.com·github.io 는 이 상자에서 못 닿는다. 가는 길은 **막고** 주소만 잰다.
   ⚠ 재는 쪽은 `쪽=<경로>` 로 바꿀 수 있다 — 고치기 전 판에 그대로 걸어 **빨개지는지** 보려고. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const 집 = path.join(__dirname, '..');
const 쪽길 = process.env.쪽 || path.join(집, 'index.html');
const 찍을곳 = process.env.그림 || path.join(__dirname, '그림');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
/* ⚠ 판번호를 손으로 박지 않는다 — `manifest.json` 에서 그대로 읽는다(10-15 거짓 빨강을 겪었다). */
const 깔린판 = JSON.parse(fs.readFileSync(path.join(집, 'manifest.json'), 'utf8')).version;
const 쪽글 = fs.readFileSync(쪽길, 'utf8');
const 손잡이 = fs.readFileSync(path.join(집, '..', 'shared', 'viggle.js'), 'utf8');

const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const 폰 = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1';

const 자리 = [
  { 이름: '없음·1280·PC크롬',  깔림: false, 폭: 1280, 높: 900, ua: PC, 안내: false, 기다림: 3200, 그림: '열기단추-없음-1280.png' },
  { 이름: '없음·375·아이폰',   깔림: false, 폭: 375,  높: 812, ua: 폰, 안내: false, 기다림: 3200, 그림: '열기단추-없음-375.png'  },
  { 이름: '있음·1280·PC크롬',  깔림: true,  폭: 1280, 높: 900, ua: PC, 안내: true,  기다림: 3200, 그림: '열기단추-있음-1280.png' },
  { 이름: '있음·375·아이폰',   깔림: true,  폭: 375,  높: 812, ua: 폰, 안내: true,  기다림: 3200, 그림: '열기단추-있음-375.png'  },
  /* ⚠ `?안내` 가 없으면 **2초 세고 벤더피아로 보낸다**(사장님 10-13 분부). 보내기 전에 재야 한다 —
       보낸 뒤에는 쪽이 비어 「0개」 가 나오는데 그건 단추가 없는 게 아니다. 1.2초에 재고,
       그 뒤 더 기다려 **정말 벤더피아로 가려 했나**(간곳) 를 따로 본다. */
  { 이름: '있음·1280·바로보냄', 깔림: true,  폭: 1280, 높: 900, ua: PC, 안내: false, 기다림: 1200, 보냄: true, 그림: null },
];

(async () => {
  fs.mkdirSync(찍을곳, { recursive: true });
  const 브 = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  const 잰것 = [];
  for (const 터 of 자리) {
    const ctx = await 브.newContext({ viewport: { width: 터.폭, height: 터.높 }, userAgent: 터.ua });
    const 쪽 = await ctx.newPage();
    const 간곳 = [];
    /* 설치 안내 쪽을 그대로 내려준다 — 확장이 있는 자리는 확장이 남기는 표시를 `<html>` 에 박아 흉낸다 */
    await 쪽.route('**/*', async (r) => {
      const u = r.request().url();
      if (/\/index\.html(\?|$)/.test(u)) {
        let h = 쪽글;
        if (터.깔림) {
          const 전 = h;
          h = h.replace(/<html([^>]*)>/i, `<html$1 data-벤더피아연동="${깔린판}">`);
          if (h === 전) throw new Error('표시를 박을 <html> 을 못 찾았다');
        }
        return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: h });
      }
      if (/shared\/viggle\.js$/.test(u))
        return r.fulfill({ status: 200, contentType: 'text/javascript; charset=utf-8', body: 손잡이 });
      if (/vendorpia\.com/.test(u)) { 간곳.push(u); return r.abort(); }   /* 못 닿는다 — 막고 주소만 적는다 */
      return r.abort();
    });
    await 쪽.goto('https://vivivic-cloud.github.io/vivivic-apps/%EB%B2%A4%EB%8D%94%ED%94%BC%EC%95%84%EC%97%B0%EB%8F%99/index.html'
      + (터.안내 ? '?안내' : ''), { waitUntil: 'domcontentloaded' });
    await 쪽.waitForTimeout(터.기다림);              /* 열여덟 번 세는 1.8초를 넘겨 기다린다 */

    const 본것 = await 쪽.evaluate(() => {
      const 보이나 = (el) => {
        const r = el.getBoundingClientRect(), s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'
          && Number(s.opacity) > 0.01;
      };
      const 것 = [];
      for (const el of document.querySelectorAll('a, button')) {
        if ((el.textContent || '').trim() !== '벤더피아 열기') continue;
        if (!보이나(el)) continue;
        const r = el.getBoundingClientRect();
        것.push({ id: el.id || '(이름없음)', 주소: el.getAttribute('href') || '(없음)',
          x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) });
      }
      const 숨었나 = (id) => { const el = document.getElementById(id); return !el ? '없는칸' : (el.hidden ? '숨음' : '보임'); };
      return { 단추: 것, 깔림칸: 숨었나('깔림'), 못찾음글: 숨었나('못찾음'), 못찾음단추칸: 숨었나('못찾음열기'),
        쪽폭: document.documentElement.scrollWidth, 창폭: innerWidth };
    });
    if (터.그림) await 쪽.screenshot({ path: path.join(찍을곳, 터.그림), fullPage: false });
    if (터.보냄) await 쪽.waitForTimeout(2600);      /* 2초 뒤 보내기 — 가려던 주소를 잡는다 */
    잰것.push({ ...터, ...본것, 간곳 });
    await ctx.close();
  }
  await 브.close();

  /* ── 재서 따진다 ───────────────────────────────────────────────── */
  const 틀림 = [];
  for (const r of 잰것) {
    const n = r.단추.length;
    console.log(`· ${r.이름}: 보이는 「벤더피아 열기」 ${n}개 ` +
      r.단추.map((b) => `[${b.id} ${b.주소} ${b.w}×${b.h} @${b.x},${b.y}]`).join(' ') +
      ` · 깔림칸 ${r.깔림칸} · 못찾음글 ${r.못찾음글} · 못찾음단추칸 ${r.못찾음단추칸}` +
      ` · 쪽폭 ${r.쪽폭}/${r.창폭}` + (r.간곳.length ? ` · 가려던곳 ${r.간곳[0]}` : ''));
    if (n !== 1) 틀림.push(`${r.이름}: 「벤더피아 열기」 가 ${n}개다 (하나여야 한다)`);
    for (const b of r.단추) {
      if (b.주소 !== 'https://vendorpia.com/') 틀림.push(`${r.이름}: 가는 곳이 ${b.주소} 다`);
      if (b.x < 0 || b.x + b.w > r.창폭) 틀림.push(`${r.이름}: 단추가 창(${r.창폭}) 밖이다 — x ${b.x} 폭 ${b.w}`);
    }
    if (r.깔림 && r.못찾음단추칸 !== '숨음') 틀림.push(`${r.이름}: 깔렸는데 못찾음 단추칸이 ${r.못찾음단추칸} 이다`);
    if (r.보냄 && !r.간곳.some((u) => /^https:\/\/vendorpia\.com\//.test(u)))
      틀림.push(`${r.이름}: 2초 뒤 벤더피아로 보내지 않았다 (사장님 10-13 분부)`);
    if (!r.깔림 && r.깔림칸 !== '숨음') 틀림.push(`${r.이름}: 안 깔렸는데 깔림칸이 ${r.깔림칸} 이다`);
    if (!r.깔림 && r.못찾음단추칸 !== '보임') 틀림.push(`${r.이름}: 안 깔렸는데 못찾음 단추칸이 ${r.못찾음단추칸} 이다`);
  }
  /* 폰에서 보이나 — `#못찾음` 글은 크롬·비모바일만이지만 **단추는 폰에서도** 보여야 한다 */
  const 폰자리 = 잰것.find((r) => r.이름 === '없음·375·아이폰');
  if (폰자리.못찾음글 !== '숨음') 틀림.push('폰인데 `#못찾음` 글이 떴다 (chrome://extensions 이야기는 폰에 쓸 데가 없다)');
  if (폰자리.단추.length !== 1) 틀림.push('폰(375)에서 「벤더피아 열기」 가 안 보인다');

  if (틀림.length) { console.log('\n빨강 ' + 틀림.length + '\n' + 틀림.map((t) => '  ✗ ' + t).join('\n')); process.exit(1); }
  console.log('\n초록 — 재 본 자리 ' + 잰것.length + '곳 전부 맞다 (쪽: ' + 쪽길 + ')');
})().catch((e) => { console.error('터짐: ' + (e && e.stack || e)); process.exit(1); });
