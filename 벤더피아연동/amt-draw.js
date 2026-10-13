// 에이엠티(깃 vivivic-apps/에이엠티) 엣지공정지시서의 부속카드를 그리는 함수들 — 에이엠티 코드를 그대로 옮겼다.
// 에이엠티는 원장(엑셀) 줄을 currentFullData 에서 읽지만, 여기서는 조혼가구 화면에서 받아 둔 부속 값(p)에서 읽는다.
//  p: { name, plate, color, w, d, grain(결보호), wEdge(W엣지면), dEdge(D엣지면), ura(우라홈), uraPos(우라홈위치), perSet, edge, … }
const VP_AMT = (() => {
  const normalizeValue = (v) => (v == null || String(v).trim() === "" || String(v).trim() === "선택없음") ? "선택없음" : String(v).trim();

  const _COLOR_NAME_MAP = {
    '화이트':'#f5f5f4', '백색':'#f5f5f4', '아이보리':'#f0e9d8', '베이지':'#e6dcc8',
    '블랙':'#2b2b2b', '흑색':'#2b2b2b', '차콜':'#3a3a3a', '그레이':'#9a9a97', '그레이지':'#a8a196',
    '오크':'#c9a876', '내추럴오크':'#d4b686', '월넛':'#5c4433', '체리':'#8b4a3a', '메이플':'#dcc190',
    '브라운':'#6b4a34', '다크브라운':'#4a3527', '민트':'#a8d8c8', '그린':'#4a7a5c', '올리브':'#6b7a4a',
    '블루':'#3a6b9a', '네이비':'#1f3a5c', '스카이블루':'#8fc4e0', '레드':'#a13a3a', '와인':'#5c2430',
    '옐로우':'#d8c04a', '핑크':'#e0a8b8', '퍼플':'#7a5c8f', '실버':'#c0c0c0', '골드':'#c4a556',
    '무광화이트':'#f5f5f4', '유광화이트':'#fbfbfa', '무광블랙':'#2b2b2b', '유광블랙':'#1a1a1a',
  };
  function _colorNameToHex(name) {
    const n = String(name || '').replace(/\s+/g, '');
    if (!n) return null;
    if (_COLOR_NAME_MAP[n]) return _COLOR_NAME_MAP[n];
    const hit = Object.keys(_COLOR_NAME_MAP).find(k => n.includes(k));
    return hit ? _COLOR_NAME_MAP[hit] : null;
  }
  function _woColorSwatchHtml(colorName) {
    const hex = _colorNameToHex(colorName);
    if (!hex) return '';
    return `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${hex};border:1px solid rgba(0,0,0,0.18);flex-shrink:0;margin-right:4px;"></span>`;
  }
  function _woStatPill(label, value, tone, small) {
    const bg = tone === 'primary' ? '#E4F3FA' : tone === 'accent' ? '#E5F6EE' : '#F1F1EF';
    const fg = tone === 'primary' ? '#0B6E8C' : tone === 'accent' ? '#157F5F' : '#6E6E6A';
    const fs = small ? '9px' : '12px';
    const pad = small ? '2px 8px' : '3px 11px';
    return `<span style="display:inline-flex;align-items:baseline;gap:3px;font-size:${fs};font-weight:800;color:${fg};background:${bg};padding:${pad};border-radius:999px;white-space:nowrap;line-height:1.5;">${label} ${value}</span>`;
  }

  function _한장수량(w, d, BW, BD, fCut, bT) {
    if (!(w > 0) || !(d > 0)) return 0;
    return Math.max(0, Math.floor((BW - fCut + bT) / (w + bT)))
         * Math.max(0, Math.floor((BD - fCut + bT) / (d + bT)));
  }
  function _앉힐방향(w, d, grain, BW, BD, fCut, bT) {
    const 그대로 = _한장수량(w, d, BW, BD, fCut, bT);
    if (normalizeValue(grain) !== 'X') return { w, d, perSheet: 그대로, 돌림: false };
    const 돌려서 = _한장수량(d, w, BW, BD, fCut, bT);
    return 돌려서 > 그대로
      ? { w: d, d: w, perSheet: 돌려서, 돌림: true }
      : { w, d, perSheet: 그대로, 돌림: false };
  }

  let _재단도면번호 = 0;
  function _누운자리(폭, 높이, 여유) {
    const C = 0.8660254, S = 0.5;
    const 누운폭 = C * (폭 + 높이), 누운높이 = S * (폭 + 높이);
    const 배 = Math.min(폭 / 누운폭, 높이 / 누운높이) * (여유 == null ? 0.94 : 여유);
    const 밀기X = (폭 - 배 * 누운폭) / 2 + 배 * C * 높이;
    const 밀기Y = (높이 - 배 * 누운높이) / 2;
    return { C, S, 배, 밀기X, 밀기Y,
             점: (x, y) => ({ x: 밀기X + 배 * C * (x - y), y: 밀기Y + 배 * S * (x + y) }) };
  }
  function _누워싸기(폭, 높이, 번호, 안, 여유) {
    const { C, S, 배, 밀기X, 밀기Y, 점: _점 } = _누운자리(폭, 높이, 여유);
    const 점 = (x, y) => { const q = _점(x, y); return [q.x.toFixed(1), q.y.toFixed(1)]; };
    const 네귀 = [점(0, 0), 점(폭, 0), 점(폭, 높이), 점(0, 높이)];
    const 그늘이름 = 'vpamtsh' + 번호;
    return `<defs><filter id="${그늘이름}" x="-20%" y="-20%" width="140%" height="160%">` +
      `<feGaussianBlur stdDeviation="${(높이 * 0.016).toFixed(1)}"/></filter></defs>` +
      `<path d="M${네귀.map(q => q.join(' ')).join(' L')} Z" fill="rgba(55,53,47,0.22)" ` +
      `filter="url(#${그늘이름})" transform="translate(0 ${(높이 * 0.028).toFixed(1)})"/>` +
      `<g transform="translate(${밀기X.toFixed(1)} ${밀기Y.toFixed(1)}) scale(${배.toFixed(4)}) ` +
      `matrix(${C} ${S} ${-C} ${S} 0 0)">${안}</g>`;
  }

  // 결보호 — 원장에 적힌 그대로 ('O' 결을 지킴, 'X' 돌려도 됨, 빈칸 설정 안 됨)
  const _wo결보호 = (p) => String(p.grain ?? '').trim();
  // 엣지 작업 면 — W엣지면·D엣지면 (2: 두 변, 1: 둘 중 한 변, non: 엣지 불가)
  function _wo엣지면(p) {
    const w = String(p.wEdge ?? '').trim().toLowerCase(), d = String(p.dEdge ?? '').trim().toLowerCase();
    if (w === 'non' || d === 'non') return { W: 0, D: 0, 못함: true };
    const 셈 = v => (/^[0-2]$/.test(v) ? parseInt(v, 10) : 0);
    return { W: 셈(w), D: 셈(d), 못함: false };
  }
  // 우라홈 — 'O' 이면 우라홈위치(치수)와 같은 변 쪽으로 안쪽 2cm 에 빨간 한 줄
  function _wo우라홈(p) {
    const 없음 = { 그림: false, 쪽: '', 위치값: 0 };
    if (String(p.ura ?? '').trim().toLowerCase() !== 'o') return 없음;
    const 위치 = String(p.uraPos ?? '').trim();
    if (!/^\d+(\.\d+)?$/.test(위치)) return 없음;
    const 값 = parseFloat(위치);
    const W = parseFloat(p.rw) || 0, D = parseFloat(p.rd) || 0;
    const 같나 = a => a > 0 && Math.abs(a - 값) < 0.5;
    if (같나(W)) return { 그림: true, 쪽: 'W', 위치값: 값 };
    if (같나(D)) return { 그림: true, 쪽: 'D', 위치값: 값 };
    return 없음;
  }

  // 그 부속 한 장(민판)의 도면 — 에이엠티 _wo부속판Svg 그대로
  function _wo부속판Svg(p, 엣지표시) {
    const W = parseFloat(p && p.rw) || 0, H = parseFloat(p && p.rd) || 0;
    if (!(W > 0 && H > 0)) return '';
    const 번호 = ++_재단도면번호;
    const 바닥 = `<path d="M0 0 H${W} V${H} H0 Z" fill="#ffffff"/>`;
    const 테두리 = `<path d="M0 0 H${W} V${H} H0 Z" fill="none" stroke="#37352f" ` +
                   `stroke-width="1" vector-effect="non-scaling-stroke"/>`;
    const 결값 = _wo결보호(p);
    let 결무늬 = '';
    if (결값 !== '' && normalizeValue(결값) !== 'X') {
      const 방향 = _앉힐방향(W, H, 결값, p.boardW || 2440, p.boardH || 1220, 5, 4.5);
      const 가로결 = !방향.돌림;
      const 금 = [];
      for (let k = 1; k <= 7; k++) 가로결
        ? 금.push(`M0 ${(H * k / 8).toFixed(1)} H${W}`)
        : 금.push(`M${(W * k / 8).toFixed(1)} 0 V${H}`);
      결무늬 = `<path class="결금" d="${금.join(' ')}" fill="none" stroke="#b7b4af" ` +
               `stroke-width="0.7" vector-effect="non-scaling-stroke"/>`;
    }
    let 엣지선 = '';
    if (엣지표시) {
      const _e면 = _wo엣지면(p);
      const W변 = [`M0 0 H${W}`, `M0 ${H} H${W}`];
      const D변 = [`M0 0 V${H}`, `M${W} 0 V${H}`];
      const 실 = [], 점 = [];
      if (_e면.W === 2) 실.push(...W변); else if (_e면.W === 1) 점.push(...W변);
      if (_e면.D === 2) 실.push(...D변); else if (_e면.D === 1) 점.push(...D변);
      const 긋기 = (d, 점선) => d.length
        ? `<path class="엣지면" d="${d.join(' ')}" fill="none" stroke="#22c55e" ` +
          `stroke-width="3" stroke-linecap="square" vector-effect="non-scaling-stroke"` +
          (점선 ? ` stroke-dasharray="7 5"` : '') + `/>`
        : '';
      엣지선 = 긋기(실, false) + 긋기(점, true);
    }
    let 우라홈선 = '';
    {
      const _우 = _wo우라홈(p);
      if (_우.그림) {
        const 안쪽 = _우.쪽 === 'W' ? Math.min(20, H * 0.3) : Math.min(20, W * 0.3);
        const d = _우.쪽 === 'W' ? `M0 ${안쪽.toFixed(1)} H${W}` : `M${안쪽.toFixed(1)} 0 V${H}`;
        우라홈선 = `<path class="우라홈" d="${d}" fill="none" stroke="#ef4444" ` +
                   `stroke-width="2" vector-effect="non-scaling-stroke"/>`;
      }
    }
    const 여유 = 0.76;
    const 자리 = _누운자리(W, H, 여유);
    const 큰쪽 = Math.max(W, H);
    const 띄움 = 큰쪽 * 0.075;
    const W가온 = 자리.점(W / 2, 0), D가온 = 자리.점(0, H / 2);
    const Wx = W가온.x + 띄움 * 자리.S, Wy = W가온.y - 띄움 * 자리.C;
    const Dx = D가온.x - 띄움 * 자리.S, Dy = D가온.y - 띄움 * 자리.C;
    const 가둠 = (v, 작, 큰) => Math.max(작, Math.min(큰, v));
    const 몫 = (x0, y0) => ({ x: 가둠(x0 / W * 100, 2, 98), y: 가둠(y0 / H * 100, 6, 94) });
    const w몫 = 몫(Wx, Wy), d몫 = 몫(Dx, Dy);
    const 치수글 =
      `<b class="부속치수" style="left:${w몫.x.toFixed(1)}%;top:${w몫.y.toFixed(1)}%;">${W}</b>` +
      `<b class="부속치수" style="left:${d몫.x.toFixed(1)}%;top:${d몫.y.toFixed(1)}%;">${H}</b>`;
    return `<span class="부속판" style="--비:${(W / H).toFixed(4)};">` +
      `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="display:block;">` +
      _누워싸기(W, H, 번호, 바닥 + 결무늬 + 테두리 + 엣지선 + 우라홈선, 여유) + `</svg>` +
      치수글 + `</span>`;
  }

  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const 이름줄 = (productName, partName) =>
    `<div class="woc-이름"><span class="cut-제품">${esc(productName)}</span><span class="cut-사이"> - </span><span class="cut-부속">${esc(partName)}</span></div>`;
  const 자재줄 = (plate, color) =>
    `<div class="woc-자재">` +
    `<span style="display:inline-block;line-height:0;flex-shrink:0;">${_woColorSwatchHtml(color)}</span>` +
    `<span class="woc-자재글">${esc([plate, color].filter(Boolean).join('-')) || '-'}</span></div>`;

  // 부속 상세 — 위에 제품명·부속명·사이즈·원장을 한 번만 적고,
  // 에이엠티 엣지공정지시서의 부속 도면(엣지면·우라홈)과 재단공정지시서의 기본 재단배치도를 차례로 둔다.
  function partDetailHtml(productName, part, jundo) {
    const p = { ...part, rw: part.w, rd: part.d };
    const 머리 = 이름줄(productName, part.name) +
      ((p.rw && p.rd) ? `<div class="woc-치수">${p.rw}×${p.rd}</div>` : '') +
      자재줄(part.plate, part.color);
    // 엣지 도면 + 선 설명
    const 엣지도면 = _wo부속판Svg(p, true);
    const 비 = (p.rw > 0 && p.rd > 0) ? ` style="--부속비:${(p.rw / p.rd).toFixed(4)};"` : '';
    const 설명 = `<div class="vp-선설명">` +
      `<span><i style="background:#22c55e;height:3px;"></i>엣지면</span>` +
      `<span><i style="background:#ef4444;height:2px;"></i>우라홈</span></div>`;
    // 재단배치도 + 잔재에 추가로 재단되는 부속
    const plan = cutPlan(part, jundo);
    const 추가 = plan && plan.extras.length
      ? `<div class="cut-추가">` + plan.extras.map(x =>
          `<span class="cut-추가-칩"><b>+ ${esc(x.이름)}</b>` +
          (x.w && x.d ? ` ${esc(x.w)}×${esc(x.d)}` : '') +
          (x.수 > 0 ? ` · ${esc(x.수)} EA` : '') + `</span>`).join('') + `</div>`
      : '';
    const 재단도면 = plan ? _woCuttingDiagramSvg(plan, part) : '';
    return `<div class="woc-몸 woc-쌓기">` +
      `<div class="woc-글">${머리}</div>` +
      (엣지도면 ? `<div class="woc-부속"${비}>${엣지도면}</div>`
              : `<div class="woc-부속"><div class="woc-도면없음">부속 도면 없음<span>원장에 재단 사이즈가 없습니다</span></div></div>`) +
      설명 +
      추가 +
      `<div class="woc-도면자리 vp-재단자리">` +
      (재단도면 || `<div class="woc-도면없음">재단 도면 없음<span>원장에 재단 사이즈가 없습니다</span></div>`) +
      `</div></div>`;
  }

  // ── 재단공정지시서 ─────────────────────────────────────────────────
  // 에이엠티 _autoGenerateCuttingPlansForOrder 의 기본 재단편집과 같은 셈:
  // 4X8 원장, 전단컷 5mm, 톱날 4.5mm. 결이 없으면 더 많이 앉는 쪽으로 돌린다.
  // 1순위 부속을 다 앉히고 남는 오른쪽·아래 자투리에 같은 원장·마감·색상의 「전도방지」(공통부속)가
  // 들어가면 기본으로 함께 앉힌다.
  function _자투리에앉히기(sw, sd, grain, actOX, actOY, BW, BD, fCut, bT) {
    const 후보 = [{ w: sw, d: sd }];
    if (normalizeValue(grain) === 'X' && sw !== sd) 후보.push({ w: sd, d: sw });
    const 자리들 = [
      { 이름: 'right',  w: BW - actOX - bT, d: BD,              x: actOX + bT, y: 0 },
      { 이름: 'bottom', w: BW,              d: BD - actOY - bT, x: 0,          y: actOY + bT }
    ];
    let 최고 = null;
    자리들.forEach(a => {
      if (a.w <= 0 || a.d <= 0) return;
      후보.forEach(c => {
        const cols = Math.floor((a.w + bT) / (c.w + bT));
        const rows = Math.floor((a.d + bT) / (c.d + bT));
        const n = Math.max(0, cols) * Math.max(0, rows);
        if (n > 0 && (!최고 || n > 최고.n)) 최고 = { a, w: c.w, d: c.d, cols, rows, n };
      });
    });
    return 최고;
  }
  // 에이엠티 _전도방지행: 부속명 전도방지 · 공급처 공통부속 · 같은 원장명·마감, 마감색상이 any 거나 같은 것
  function _전도방지행(jundo, plateName, coating, colorName) {
    for (const r of jundo || []) {
      if ((r.plate || '') !== plateName || (r.coating || '') !== coating) continue;
      const c = normalizeValue(r.color);
      if (c && c !== 'any' && c !== colorName) continue;
      if (!(r.w > 0) || !(r.d > 0)) continue;
      return r;
    }
    return null;
  }

  function cutPlan(part, jundo) {
    const BW = 2440, BD = 1220, fCut = 5, bT = 4.5;
    const rw = part.w, rd = part.d;
    if (!(rw > 0) || !(rd > 0)) return null;
    const _방향 = _앉힐방향(rw, rd, part.grain, BW, BD, fCut, bT);
    const pw = _방향.w, pd = _방향.d;
    const maxCols = Math.floor((BW - fCut + bT) / (pw + bT));
    const maxRows = Math.floor((BD - fCut + bT) / (pd + bT));
    if (maxCols * maxRows <= 0) return null;
    const colorName = normalizeValue(part.color);
    const _fillHex = _colorNameToHex(colorName) || '#b0aeaa';
    const actOX = fCut + maxCols * (pw + bT);
    const actOY = fCut + maxRows * (pd + bT);
    const _전도 = _전도방지행(jundo, part.plate, part.finish, colorName);
    const _전도자리 = _전도 ? _자투리에앉히기(_전도.w, _전도.d, _전도.grain, actOX, actOY, BW, BD, fCut, bT) : null;
    const bp = [];
    for (let c = 0; c < maxCols; c++) for (let r = 0; r < maxRows; r++)
      bp.push({ lp: (fCut + c * (pw + bT)) / BW, tp: (fCut + r * (pd + bT)) / BD, wp: pw / BW, hp: pd / BD,
                bg: _fillHex, dw: String(pw), dh: String(pd), 내것: true });
    if (_전도자리) {
      const z = _전도자리;
      for (let c = 0; c < z.cols; c++) for (let r = 0; r < z.rows; r++)
        bp.push({ lp: (z.a.x + c * (z.w + bT)) / BW, tp: (z.a.y + r * (z.d + bT)) / BD, wp: z.w / BW, hp: z.d / BD,
                  bg: '#f5f5f4', dw: String(z.w), dh: String(z.d) });
    }
    return {
      boardW: BW, boardH: BD, boardParts: bp, perSheet: maxCols * maxRows,
      extras: _전도자리 ? [{ 이름: '전도방지', w: _전도자리.w, d: _전도자리.d, 수: _전도자리.n }] : [],
    };
  }

  function _도면격자(칸, 폭, 높이, 번호) {
    const 이름 = 'vpamtcad' + 번호;
    return `<defs><pattern id="${이름}" width="${칸.toFixed(1)}" height="${칸.toFixed(1)}" patternUnits="userSpaceOnUse">` +
      `<path d="M${칸.toFixed(1)} 0 H0 V${칸.toFixed(1)}" fill="none" stroke="#d2cfcb" stroke-width="0.8" vector-effect="non-scaling-stroke"/>` +
      `</pattern></defs>` +
      `<path d="M0 0 H${폭.toFixed(1)} V${높이.toFixed(1)} H0 Z" fill="url(#${이름})"/>`;
  }

  // 에이엠티 _woCuttingDiagramSvg — 재단배치도는 반듯하게, 카드의 도면 자리에 맞춘다(칸맞춤)
  function _woCuttingDiagramSvg(plan, part) {
    const BW = plan.boardW, BD = plan.boardH;
    let minLeftF = Infinity, minTopF = Infinity;
    plan.boardParts.forEach(pt => { minLeftF = Math.min(minLeftF, pt.lp); minTopF = Math.min(minTopF, pt.tp); });
    const cropX = minLeftF * BW, cropY = minTopF * BD;
    const cropW = BW - cropX, cropH = BD - cropY;
    const rects = plan.boardParts.map(pt => {
      const rx = (pt.lp * BW - cropX).toFixed(1), ry = (pt.tp * BD - cropY).toFixed(1);
      const rw = Math.max(2, pt.wp * BW).toFixed(1), rh = Math.max(2, pt.hp * BD).toFixed(1);
      return `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="${pt.bg || '#fff'}" stroke="#37352f" stroke-width="1" vector-effect="non-scaling-stroke"/>`;
    }).join('');
    // 우라홈 빨간 선 — 그 부속 조각마다 엣지라인에서 안쪽 2cm (에이엠티 _우라홈조각들 과 같은 셈)
    const u = _wo우라홈({ ...part, rw: part.w, rd: part.d });
    const 같 = (a, b) => isFinite(a) && isFinite(b) && Math.abs(a - b) < 0.5;
    const 우라홈선들 = !u.그림 ? '' : plan.boardParts.filter(pt => pt.내것).map(pt => {
      const dw = parseFloat(pt.dw), dh = parseFloat(pt.dh);
      const rx = pt.lp * BW - cropX, ry = pt.tp * BD - cropY;
      const rw = Math.max(2, pt.wp * BW), rh = Math.max(2, pt.hp * BD);
      let d = '';
      if (같(dw, u.위치값)) { const 안 = Math.min(20, rh * 0.3); d = `M${rx.toFixed(1)} ${(ry + 안).toFixed(1)} H${(rx + rw).toFixed(1)}`; }
      else if (같(dh, u.위치값)) { const 안 = Math.min(20, rw * 0.3); d = `M${(rx + 안).toFixed(1)} ${ry.toFixed(1)} V${(ry + rh).toFixed(1)}`; }
      return d ? `<path class="우라홈" d="${d}" fill="none" stroke="#ef4444" stroke-width="2" vector-effect="non-scaling-stroke"/>` : '';
    }).join('');
    const 번호 = ++_재단도면번호;
    const 격자 = _도면격자(BD / 4, cropW, cropH, 번호);
    const 테 = `style="display:block;width:100%;height:100%;border:1px solid #d6d4d1;border-radius:4px;box-sizing:border-box;background:#ecebe8;box-shadow:0 1px 2px rgba(55,53,47,0.10),0 5px 12px rgba(55,53,47,0.07);"`;
    // 조각마다 재단 사이즈 — SVG 글은 도면과 함께 줄어 읽히지 않으므로 몫(%) 자리에 HTML 로 얹는다
    const 치수들 = plan.boardParts.map(pt => {
      const cx = ((pt.lp + pt.wp / 2) * BW - cropX) / cropW * 100;
      const cy = ((pt.tp + pt.hp / 2) * BD - cropY) / cropH * 100;
      return `<b class="재단치수" style="left:${cx.toFixed(1)}%;top:${cy.toFixed(1)}%;">${pt.dw}×${pt.dh}</b>`;
    }).join('');
    return `<span class="재단판" style="--비:${(cropW / cropH).toFixed(4)};">` +
      `<svg viewBox="0 0 ${cropW.toFixed(1)} ${cropH.toFixed(1)}" preserveAspectRatio="none" ${테}>${격자}${rects}${우라홈선들}</svg>` +
      치수들 + `</span>`;
  }

  return { partDetailHtml };
})();
