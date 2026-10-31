// 불러오기 공통 — 영림원 조회 화면 → 입력폼(erp_*) 「영림원에서 불러오기」. **공통.js 다음, 화면별 *-읽기.js 앞에** 한 번 실행한다.
// 어디서: 영림원 맨 위 창(사장님이 로그인해 둔 탭). 로그인 화면이면 멈춘다(비밀번호 안 넣음).
// 하는 일:
//   - ylw.read.cols(시트) = 화면에 **보이는** 칸 [{title, field}] (숨은 칸 뺌 — 시트 Sheet.getColumnVisible 로 가름. objOriSheetData 의 HID 표시는 화면과 다를 때가 있어 안 씀, 11-01 워크센터)
//   - ylw.read.need(시트, 칸이름들) = 읽기 스크립트가 쓰는 칸이 화면에 그대로 있는지 확인(없으면 멈춤 — 화면이 바뀐 것)
//   - ylw.imp.* = 폼 저장소(파이어스토어 REST, 익명 로그인) 읽기·쓰기 + 폼과 비교 + 요청 처리
//     · 폼에 없는 것만 status 「완료」 + source 「영림원」 으로 넣는다. 이미 같은 이름(열쇠)이 있으면 **덮어쓰지 않는다**:
//       값이 같으면 건너뜀, 다르면 그 문서의 ylwDiff 칸에만 차이를 적는다(다른 칸·status·agentNote 는 안 건드림). 차이 목록은 요청 문서 agentNote 에도.
//     · 영림원에는 아무것도 저장하지 않는다(조회·읽기만). 영림원 단추(저장·삭제)는 누르지 않는다.
// 요청: 폼의 「영림원에서 불러오기」 단추가 erp_imports 에 {steps, only('all'|'T'), mode('count'|'import'), status:'대기'} 를 쌓는다.
//   처리 순서는 ../AGENTS.md 「불러오기 요청 처리 순서」. 화면별 읽기 함수 = ylw.read.<단계키>(only) → {rows:[폼 문서 꼴], 읽음, 확인못함:[칸]}.
// 확인: 2026-11-01 테스트 서버(공정·공정흐름·거래처 T 로 시험 — 영림원 저장 없음).
(function () {
  const Y = window.ylw;
  if (!Y || !Y.rows) throw new Error('먼저 공통.js 를 실행');
  const R = (Y.read = Y.read || {});
  R.cols = (sh) => {
    const S = sh.Sheet, o = sh.objOriSheetData || [], out = [];
    for (let i = 0; i < S.getColumnCount(); i++) {
      if (!S.getColumnVisible(i) || !(S.getColumnWidth(i) > 0)) continue;
      out.push({ title: String(S.getValue(0, i, 1) == null ? '' : S.getValue(0, i, 1)), field: o[i] ? o[i].DataField : '' });
    }
    return out;
  };
  R.need = (sh, titles) => {
    const have = R.cols(sh).map((c) => c.title);
    const miss = titles.filter((t) => have.indexOf(t) < 0);
    if (miss.length) throw new Error('화면 칸이 바뀜 — 안 보이는 칸: ' + miss.join(', ') + ' (화면별-요령.md 를 고치고 스크립트를 고칠 것)');
  };
  R.ymd = (v) => { const d = String(v == null ? '' : v).replace(/\D/g, ''); return d.length === 8 ? d.slice(0, 4) + '-' + d.slice(4, 6) + '-' + d.slice(6) : String(v == null ? '' : v); };
  R.bool = (v) => v === true || /^(1|true)$/i.test(String(v == null ? '' : v).trim());
  R.s = (v) => (v == null ? '' : String(v).trim());
  R.isT = (v) => /^T/.test(R.s(v));
  R.open = async (page) => {
    if (!document.getElementById(page + '_iframe')) { Home.OpenPageSeq(page); await Y.sleep(5000); }
    return Y.win(page);
  };

  const I = (Y.imp = Y.imp || {});
  const KEY = 'AIzaSyB9X_hzd2D3goQ7oenK53Pz805P1c7oSqs';   // 입력폼 FB_CONFIG.apiKey (공개 웹 키)
  const BASE = 'https://firestore.googleapis.com/v1/projects/vivivic-4b7ef/databases/(default)/documents/';
  let tok = null, tokAt = 0;
  I.token = async () => {
    if (tok && Date.now() - tokAt < 50 * 60 * 1000) return tok;
    const r = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + KEY, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"returnSecureToken":true}' });
    tok = (await r.json()).idToken; tokAt = Date.now();
    return tok;
  };
  const enc = (v) => {
    if (v == null) return { nullValue: null };
    if (typeof v === 'boolean') return { booleanValue: v };
    if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    if (Array.isArray(v)) return { arrayValue: { values: v.map(enc) } };
    if (typeof v === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
    return { stringValue: String(v) };
  };
  const call = async (method, path, body) => {
    const r = await fetch(BASE + path, { method, headers: { Authorization: 'Bearer ' + (await I.token()), 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json();
    if (!r.ok) throw new Error('저장소 ' + method + ' ' + path.split('?')[0] + ' 실패: ' + (j.error && j.error.message));
    return j;
  };
  I.list = async (coll) => {
    let out = [], pt = '';
    do {
      const j = await call('GET', coll + '?pageSize=300' + (pt ? '&pageToken=' + encodeURIComponent(pt) : ''));
      out = out.concat((j.documents || []).map(Y.fs));
      pt = j.nextPageToken || '';
    } while (pt);
    return out;
  };
  I.add = (coll, o) => call('POST', coll, { fields: Object.fromEntries(Object.entries(o).map(([k, v]) => [k, enc(v)])) });
  I.patch = (coll, id, o) => call('PATCH', coll + '/' + id + '?' + Object.keys(o).map((k) => 'updateMask.fieldPaths=' + k).join('&'), { fields: Object.fromEntries(Object.entries(o).map(([k, v]) => [k, enc(v)])) });

  // 단계별: 컬렉션 · 열쇠(같은 것으로 보는 값) · 비교 칸(머리) · 비교 칸(행). 비교 칸 = 읽기 스크립트가 화면에서 읽는 칸만(확인 못 한 칸은 비교 안 함).
  I.STEPS = {
    vendors: { coll: 'erp_vendors', title: '거래처', key: (d) => R.s(d.name), fields: ['sangho', 'name', 'state', 'credit', 'bizno', 'rep', 'tel', 'biztype', 'bizitem', 'kinds'] },
    workcenters: { coll: 'erp_workcenters', title: '워크센터', key: (d) => R.s(d.name), fields: ['name', 'dept', 'kind', 'vendor', 'capa', 'start', 'end', 'whMat', 'whProd', 'whDeliv', 'whSite', 'whIn', 'whSemi'] },
    items: { coll: 'erp_items', title: '품목', key: (d) => R.s(d.code), fields: ['name', 'code', 'spec', 'eng', 'asset', 'status', 'unit', 'small', 'io', 'imp', 'rep'] },
    processes: { coll: 'erp_processes', title: '공정', key: (d) => R.s(d.name), fields: ['name', 'memo', 'inspect'] },
    flows: { coll: 'erp_flows', title: '공정흐름', key: (d) => R.s(d.name), fields: ['name', 'memo'], rows: ['seq', 'proc', 'next', 'last'] },
    boms: { coll: 'erp_boms', title: 'BOM', key: (d) => R.s(d.pcode) + '|' + R.s(d.pver), fields: ['pname', 'pcode', 'pspec', 'pver'], rows: ['proc', 'order', 'cname', 'ccode', 'cspec', 'cver', 'inunit', 'qn', 'qd', 'hasSub'] },
    contracts: { coll: 'erp_contracts', title: '외주계약', key: (d) => R.s(d.vendor), fields: ['unit', 'vendor'], rows: ['prod', 'pcode', 'seq', 'proc', 'oname', 'ocode', 'cur', 'basis', 'price', 'from'] },
  };
  const nv = (v) => {
    if (v === true || v === false) return v ? '1' : '0';
    if (Array.isArray(v)) return v.map(R.s).filter(Boolean).sort().join(', ');
    const s = R.s(v);
    if (/^\d{4}-?\d{2}-?\d{2}$/.test(s)) return s.replace(/\D/g, '');
    if (/^-?\d+(\.\d+)?$/.test(s.replace(/,/g, ''))) return String(+s.replace(/,/g, ''));
    return s;
  };
  const show = (v) => (Array.isArray(v) ? v.join(', ') : v === true ? '✓' : v === false ? '' : R.s(v)) || '(빈칸)';
  // 폼 문서와 영림원 값의 차이 → ['칸: 폼 X / 영림원 Y', …]. 폼에 없는 칸(undefined)도 영림원에 값이 있으면 차이.
  I.diff = (spec, form, erp, label) => {
    const out = [], L = label || {};
    for (const k of spec.fields) if (nv(form[k]) !== nv(erp[k])) out.push((L[k] || k) + ': 폼 ' + show(form[k]) + ' / 영림원 ' + show(erp[k]));
    if (spec.rows) {
      const a = form.rows || [], b = erp.rows || [];
      if (a.length !== b.length) out.push('행 수: 폼 ' + a.length + ' / 영림원 ' + b.length);
      for (let i = 0; i < Math.min(a.length, b.length); i++)
        for (const k of spec.rows) if (nv(a[i][k]) !== nv(b[i][k])) out.push((i + 1) + '행 ' + (L[k] || k) + ': 폼 ' + show(a[i][k]) + ' / 영림원 ' + show(b[i][k]));
    }
    return out;
  };
  // 한 단계 반영. got = 읽기 함수 결과. mode 'count' = 세기만(아무것도 안 씀). 돌려줌 {읽음, 폼에없음, 같음, 다름, 넣음, 다른것:[…]}
  I.apply = async (step, got, req, mode) => {
    const spec = I.STEPS[step];
    const form = await I.list(spec.coll), byKey = {};
    form.forEach((d) => { const k = spec.key(d); if (k && !byKey[k]) byKey[k] = d; });
    const res = { 읽음: got.rows.length, 폼에없음: 0, 같음: 0, 다름: 0, 넣음: 0, 다른것: [] };
    const now = new Date().toISOString(), t0 = new Date(), day = String(t0.getMonth() + 1).padStart(2, '0') + '-' + String(t0.getDate()).padStart(2, '0');   // 이 컴퓨터 날짜(ISO 는 세계시라 한국 새벽이면 전날로 찍힌다)
    for (const e of got.rows) {
      const k = spec.key(e), f = byKey[k];
      if (!f) {
        res.폼에없음++;
        if (mode === 'import') {
          await I.add(spec.coll, Object.assign({}, e, {
            status: '완료', agentNote: '영림원에서 불러옴(' + day + ')', source: '영림원', importedAt: now, importId: req ? req.id : '',
            createdAt: now, route: { screen: got.screen, specRef: 'erp-spec.json', from: '영림원 불러오기' },
          }));
          res.넣음++;
          byKey[k] = e;
        }
        continue;
      }
      const d = I.diff(spec, f, e, got.labels);
      if (!d.length) { res.같음++; if (mode === 'import' && f.ylwDiff) await I.patch(spec.coll, f.id, { ylwDiff: '', ylwCheckedAt: now }); continue; }
      res.다름++;
      res.다른것.push(k + (f.status !== '완료' ? '(폼 ' + f.status + ')' : '') + ' — ' + d.join(' · '));
      if (mode === 'import') await I.patch(spec.coll, f.id, { ylwDiff: d.join(' · '), ylwCheckedAt: now });
    }
    return res;
  };
  // 요청 목록(대기, 오래된 것부터)
  I.pending = async () => (await I.list('erp_imports')).filter((r) => r.status === '대기').sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  // 요청 하나 처리: 진행중 → 단계마다 읽기·반영 → 완료(또는 오류). 읽기 전에 그 화면이 조회돼 있어야 한다(AGENTS.md 순서).
  I.run = async (req) => {
    const cur = (await I.list('erp_imports')).find((r) => r.id === req.id);
    if (!cur || cur.status !== '대기') return '건너뜀 — 요청이 없거나 대기가 아님';
    await I.patch('erp_imports', req.id, { status: '진행중', agentNote: '' });
    const result = {}, notes = [];
    try {
      for (const step of req.steps) {
        if (!R[step]) throw new Error(step + '-읽기 스크립트를 먼저 실행');
        const got = await R[step](req.only);
        const r = await I.apply(step, got, req, req.mode);
        result[step] = { 읽음: r.읽음, 폼에없음: r.폼에없음, 같음: r.같음, 다름: r.다름, 넣음: r.넣음 };
        notes.push(I.STEPS[step].title + ': 영림원 ' + r.읽음 + '건 · 폼에 없음 ' + r.폼에없음 + (req.mode === 'import' ? '(넣음 ' + r.넣음 + ')' : '') + ' · 같음 ' + r.같음 + ' · 다름 ' + r.다름 +
          (got.확인못함 && got.확인못함.length ? ' · 못 읽은 것(화면에 칸 없음·안 열림): ' + got.확인못함.join(', ') : '') +
          (r.다른것.length ? '\n  다름: ' + r.다른것.join('\n  ') : ''));
      }
      await I.patch('erp_imports', req.id, { status: '완료', agentNote: notes.join('\n'), result, doneAt: new Date().toISOString() });
      return { 완료: true, result, agentNote: notes.join('\n') };
    } catch (e) {
      await I.patch('erp_imports', req.id, { status: '오류', agentNote: notes.concat(String(e.message || e)).join('\n'), result });
      return { 오류: String(e.message || e) };
    }
  };
  return '불러오기 공통 준비됨';
})();
