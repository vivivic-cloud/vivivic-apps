// 불러오기 공통 — 영림원 조회 화면 → 입력폼(erp_*) 「영림원에서 불러오기」. **공통.js 다음, 화면별 *-읽기.js 앞에** 한 번 실행한다.
// 어디서: 영림원 맨 위 창(사장님이 로그인해 둔 탭). 로그인 화면이면 멈춘다(비밀번호 안 넣음).
// 하는 일:
//   - ylw.read.cols(시트) = 화면에 **보이는** 칸 [{title, field}] (숨은 칸 뺌 — 시트 Sheet.getColumnVisible 로 가름. objOriSheetData 의 HID 표시는 화면과 다를 때가 있어 안 씀, 11-01 워크센터)
//   - ylw.read.need(시트, 칸이름들) = 읽기 스크립트가 쓰는 칸이 화면에 그대로 있는지 확인(없으면 멈춤 — 화면이 바뀐 것)
//   - ylw.imp.* = 폼 저장소(파이어스토어 REST, 익명 로그인) 읽기·쓰기 + 폼과 비교 + 요청 처리
//     · 폼에 없는 것만 status 「완료」 + source 「영림원」 으로 넣는다. 이미 같은 이름(열쇠)이 있으면 **덮어쓰지 않는다**:
//       값이 같으면 건너뜀, 다르면 그 문서의 ylwDiff 칸에만 차이를 적는다(다른 칸·status·agentNote 는 안 건드림). 차이 목록은 요청 문서 agentNote 에도.
//     · (폼 v106) 읽은 범위 안에서 폼에는 완료로 있는데 영림원 조회에 없는 문서 = 모든 단계를 다 읽은 뒤 지운다(멈춤 장치 I.goneStop · 뒤 문서 묶음 I.gone). 옛 v104 ylwGone 표시는 다시 보이면 지운다.
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

  // 화면 「조회」를 다시 누른다 — ⚠ 이미 열린 탭의 표는 연 때의 값이다(11-04 T조립·T포장을 이렇게 놓침). click() 은 안 먹고 마우스 동작을 차례로 보내야 조회된다(11-04 500228 확인).
  R.query = async (page, wait = 2500) => {
    const w = Y.win(page), b = [...w.document.querySelectorAll('a,button')].find((e) => /^\s*조회\s*$/.test(e.textContent));
    if (!b) throw new Error(page + ' 에 조회 단추 없음');
    const r = b.getBoundingClientRect(), o = { bubbles: true, cancelable: true, view: w, clientX: r.x + 5, clientY: r.y + 5, button: 0 };
    for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) b.dispatchEvent(new (t.startsWith('pointer') ? w.PointerEvent : w.MouseEvent)(t, o));
    await Y.sleep(wait);
  };

  const I = (Y.imp = Y.imp || {});
  const KEY = 'AIzaSyB9X_hzd2D3goQ7oenK53Pz805P1c7oSqs';   // 입력폼 FB_CONFIG.apiKey (공개 웹 키)
  const BASE = 'https://firestore.googleapis.com/v1/projects/vivivic-4b7ef/databases/(default)/documents/';
  let tok = null, tokAt = 0;
  /* 11-09 영림원외주입력 v127 — 저장소 규칙이 erp_ 를 담당자만 쓰게 한다. 입력 작업자 = 이 브라우저(영림원 탭 출처)에 붙박은 익명 계정 하나.
     처음 한 번 익명 가입 → 갱신표(refresh token)를 이 출처 localStorage 「vivivic.erpAgent」 에 두고, erp_staff/<uid> 에 「입력 작업자」 줄을 만든다(권한 없음).
     사장님이 폼 「담당자 관리」 에서 그 줄(uid 끝 4자리 = I.who())에 모든 메뉴 권한을 주셔야 읽고 쓴다. 비밀번호 없음 · 갱신표는 깃·대화에 안 남긴다(출력 금지).
     갱신이 막히면 새로 만들지 않고 멈춘다(새 계정은 권한이 없어 조용히 틀린다). 다시 만들려면 localStorage 를 지우고 사장님께 권한을 다시 받는다. */
  const AG = 'vivivic.erpAgent';
  const agGet = () => { try { return JSON.parse(localStorage.getItem(AG) || 'null'); } catch (e) { return null; } };
  I.who = () => { const s = agGet(); return s && s.uid ? '입력 작업자 uid 끝 ' + s.uid.slice(-4) : '아직 없음'; };
  I.token = async () => {
    if (tok && Date.now() - tokAt < 50 * 60 * 1000) return tok;
    const s = agGet();
    if (s && s.rt) {
      const r = await fetch('https://securetoken.googleapis.com/v1/token?key=' + KEY, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(s.rt) });
      const j = await r.json();
      if (!r.ok || !j.id_token) throw new Error('입력 작업자 표 갱신 실패: ' + (j.error && j.error.message) + ' — 새로 만들지 않음(AGENTS 맨 위 「저장소 로그인」)');
      if (j.refresh_token && j.refresh_token !== s.rt) localStorage.setItem(AG, JSON.stringify({ rt: j.refresh_token, uid: j.user_id || s.uid }));
      tok = j.id_token; tokAt = Date.now();
      return tok;
    }
    const r = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + KEY, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"returnSecureToken":true}' });
    const j = await r.json();
    if (!j.idToken) throw new Error('입력 작업자 익명 가입 실패: ' + (j.error && j.error.message));
    localStorage.setItem(AG, JSON.stringify({ rt: j.refreshToken, uid: j.localId }));
    tok = j.idToken; tokAt = Date.now();
    const now = new Date().toISOString();
    await fetch(BASE + 'erp_staff?documentId=' + j.localId, { method: 'POST', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { agent: { booleanValue: true }, name: { stringValue: '입력 작업자' }, firstAt: { stringValue: now }, lastAt: { stringValue: now } } }) });
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

  // 단계별: 컬렉션 · 열쇠(같은 것으로 보는 값) · t(폼 문서가 「T로 시작하는 것만」 범위인지 — 그 단계 *-읽기.js 의 T 거르기와 같은 칸) · 비교 칸(머리) · 비교 칸(행).
  //   ⚠ 새 단계를 더하면 t 도 꼭 단다. t 가 없으면 T 요청에서 「영림원에 없음」을 못 가려 안 지운다(I.apply). 비교 칸 = 읽기 스크립트가 화면에서 읽는 칸만(확인 못 한 칸은 비교 안 함).
  I.STEPS = {
    vendors: { coll: 'erp_vendors', title: '거래처', key: (d) => R.s(d.name), t: (d) => R.isT(d.name), fields: ['sangho', 'name', 'state', 'credit', 'bizno', 'rep', 'tel', 'biztype', 'bizitem', 'kinds'] },
    workcenters: { coll: 'erp_workcenters', title: '워크센터', key: (d) => R.s(d.name), t: (d) => R.isT(d.name), fields: ['name', 'dept', 'kind', 'vendor', 'capa', 'start', 'end', 'whMat', 'whProd', 'whDeliv', 'whSite', 'whIn', 'whSemi'] },
    classes: { coll: 'erp_classes', title: '분류', key: (d) => [d.kind, d.big, d.mid, d.name].map(R.s).join('>'), t: (d) => R.isT(d.big) || R.isT(d.mid) || R.isT(d.name), fields: ['kind', 'big', 'mid', 'name', 'use'] },
    items: { coll: 'erp_items', title: '품목', key: (d) => R.s(d.code), t: (d) => R.isT(d.name), fields: ['name', 'code', 'spec', 'eng', 'asset', 'state', 'unit', 'small', 'io', 'imp', 'rep'] },
    materials: { coll: 'erp_materials', title: '자재', key: (d) => R.s(d.code), t: (d) => R.isT(d.name) || R.isT(d.code), fields: ['name', 'code', 'spec', 'eng', 'asset', 'state', 'io', 'imp', 'unit', 'small'] },
    processes: { coll: 'erp_processes', title: '공정', key: (d) => R.s(d.name), t: (d) => R.isT(d.name), fields: ['name', 'memo', 'inspect'] },
    flows: { coll: 'erp_flows', title: '공정흐름', key: (d) => R.s(d.name), t: (d) => R.isT(d.name), fields: ['name', 'memo'], rows: ['seq', 'proc', 'next', 'last'] },
    boms: { coll: 'erp_boms', title: 'BOM', key: (d) => R.s(d.pcode) + '|' + R.s(d.pver), t: (d) => R.isT(d.pname), fields: ['pname', 'pcode', 'pspec', 'pver'], rows: ['proc', 'order', 'cname', 'ccode', 'cspec', 'cver', 'inunit', 'qn', 'qd', 'hasSub'] },
    itemflows: { coll: 'erp_itemflows', title: '품목별 공정흐름', key: (d) => R.s(d.code) + '|' + R.s(d.flow), t: (d) => R.isT(d.name) || R.isT(d.code), fields: ['name', 'code', 'spec', 'flow'] },
    itemmats: { coll: 'erp_itemmats', title: '제품별공정별소요자재', key: (d) => R.s(d.code) + '|' + R.s(d.rev), t: (d) => R.isT(d.name) || R.isT(d.code), fields: ['name', 'code', 'spec', 'rev'] },
    itemwcs: { coll: 'erp_itemwcs', title: '제품별공정별워크센터', key: (d) => [d.code, d.rev, d.proc, d.wc].map(R.s).join('|'), t: (d) => R.isT(d.name) || R.isT(d.code), fields: ['name', 'code', 'spec', 'rev', 'proc', 'wc', 'tunit', 'time', 'rank'] },
    purprices: { coll: 'erp_purprices', title: '구매단가', key: (d) => [R.s(d.vendor), R.s(d.code), R.s(d.from).replace(/\D/g, '')].join('|'), t: (d) => R.isT(d.vendor) || R.isT(d.code), fields: ['vendor', 'name', 'code', 'spec', 'unit', 'io', 'cur', 'price', 'minqty', 'stepqty', 'from', 'memo', 'maker', 'days'] },
    contracts: { coll: 'erp_contracts', title: '외주계약', key: (d) => R.s(d.vendor), t: (d) => R.isT(d.vendor), fields: ['unit', 'vendor'], rows: ['prod', 'pcode', 'seq', 'proc', 'oname', 'ocode', 'cur', 'basis', 'price', 'from'] },
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
  // 폼 small = 「대 > 중 > 소」 경로(v26), 영림원 품목소분류·자재소분류 = 소분류 이름 → 끝 토막끼리 본다(11-06, 품목 18건 가짜 차이).
  const lastSeg = (v) => R.s(v).split('>').pop().trim();
  I.diff = (spec, form0, erp0, label) => {
    const out = [], L = label || {};
    const form = 'small' in form0 ? Object.assign({}, form0, { small: lastSeg(form0.small) }) : form0;
    const erp = 'small' in erp0 ? Object.assign({}, erp0, { small: lastSeg(erp0.small) }) : erp0;
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
    const form = await I.list(spec.coll), byKey = {}, allByKey = {};
    form.forEach((d) => { const k = spec.key(d); if (!k) return; if (!byKey[k]) byKey[k] = d; (allByKey[k] = allByKey[k] || []).push(d); });
    const res = { 읽음: got.rows.length, 폼에없음: 0, 같음: 0, 다름: 0, 넣음: 0, 공정채움: 0, 영림원에없음: 0, 다시있음: 0, 다른것: [], 없는것: [] };
    const seen = {};
    const now = new Date().toISOString(), t0 = new Date(), day = String(t0.getMonth() + 1).padStart(2, '0') + '-' + String(t0.getDate()).padStart(2, '0');   // 이 컴퓨터 날짜(ISO 는 세계시라 한국 새벽이면 전날로 찍힌다)
    for (const e of got.rows) {
      const k = spec.key(e), f = byKey[k];
      seen[k] = 1;
      // 폼 v104: 영림원에 다시 나타난 문서 → 「영림원에 없음」 표시를 지운다(목록에 돌아온다). 같은 열쇠 문서 모두.
      for (const g of allByKey[k] || []) if (g.ylwGone) { res.다시있음++; if (mode === 'import') await I.patch(spec.coll, g.id, { ylwGone: '', ylwGoneAt: '', ylwGoneId: '' }); }
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
      // 폼 v53: 불러온 흐름의 공정만 예외로 채운다 — 폼 rows 칸이 없거나(공정 모름), 비었는데 영림원 상세에 줄이 있을 때(사람이 영림원에서 채움). 덮어쓰기가 아니다(폼에 값이 없다).
      //   이것이 없으면 빈 흐름이 「영림원과 다름」으로만 남아 8단계에서 영영 못 고른다. 폼이 만든 흐름·수정 중인 흐름은 안 건드린다.
      if (step === 'flows' && f.source === '영림원' && f.status === '완료' && !(f.edit && f.edit.changed && f.edit.changed.length)) {
        const had = Array.isArray(f.rows) ? f.rows.length : -1, has = (e.rows || []).length;
        if (had < 0 || (had === 0 && has)) {
          res.공정채움++;
          if (mode === 'import') await I.patch(spec.coll, f.id, { rows: e.rows || [], agentNote: '영림원에서 공정 불러옴(' + day + ') · 상세 ' + has + '줄', ylwDiff: '', ylwCheckedAt: now });
          continue;
        }
      }
      const d = I.diff(spec, f, e, got.labels);
      // 폼 v105: 같음도 ylwCheckedAt 을 적는다 — 폼이 「영림원에 있다고 확인된 거래처」를 드롭다운에 더하는 표시(거래처 외 단계도 같은 뜻).
      if (!d.length) { res.같음++; if (mode === 'import') await I.patch(spec.coll, f.id, { ylwDiff: '', ylwCheckedAt: now }); continue; }
      res.다름++;
      res.다른것.push(k + (f.status !== '완료' ? '(폼 ' + f.status + ')' : '') + ' — ' + d.join(' · '));
      if (mode === 'import') await I.patch(spec.coll, f.id, { ylwDiff: d.join(' · '), ylwCheckedAt: now });
    }
    // 폼 v106 「영림원에 없음」 = 지울 후보: 이번에 읽은 범위(only T 면 spec.t · 읽기 스크립트가 준 got.scope — 기간 등) 안에서 폼에 status 완료로 있는데 영림원 조회에 없는 문서.
    //   여기서는 고르기만 한다. 지우기는 I.run 이 모든 단계를 다 읽은 뒤 멈춤 장치(I.goneStop)를 거쳐 한다(I.gone). 대기·진행중·오류·수정대기는 대상이 아니다.
    const tOk = req && req.only === 'T' ? spec.t : () => true;
    res.범위완료 = 0; res.지울것 = [];
    if (got.noGone || got.scopeErr || !tOk) res.없음못봄 = got.noGone ? '읽기 스크립트가 다 못 읽음' : got.scopeErr ? '조회 조건 안 맞음: ' + got.scopeErr : 'T 범위 함수(t) 없음';
    else for (const f of form) {
      const k = spec.key(f);
      if (f.status !== '완료' || !k || !tOk(f) || (got.scope && !got.scope(f))) continue;
      res.범위완료++;
      if (seen[k]) continue;
      res.영림원에없음++;
      res.없는것.push(k);
      res.지울것.push({ coll: spec.coll, id: f.id, key: k });
    }
    return res;
  };
  // 지우기 멈춤 장치 — 하나라도 걸리면 그 단계는 하나도 안 지운다(까닭을 agentNote 에). opt = I.run 두째 인자(작업자가 화면을 눈으로 본 뒤에만 켬).
  //   ① 영림원 0건인데 지울 것이 있음 → 조회 실패·조건 잘못일 수 있다(opt.allowEmpty 로만 넘김)
  //   ② 지울 것이 5건을 넘고 범위 안 완료 문서의 30% 를 넘음 → 한꺼번에 지우지 않는다(opt.allowMany 로만 넘김)
  I.goneStop = (r, opt) => {
    opt = opt || {};
    if (!r.지울것.length) return '';
    if (r.읽음 === 0 && !opt.allowEmpty) return '영림원 0건 — 조회가 실패했거나 조건이 다를 수 있어 지우지 않음';
    if (r.지울것.length > 5 && r.지울것.length > r.범위완료 * 0.3 && !opt.allowMany) return '지울 것 ' + r.지울것.length + '건 / 범위 안 완료 ' + r.범위완료 + '건 — 너무 많아 지우지 않음';
    return '';
  };
  // 앞 문서 ← 뒤 문서(폼 DEL_KIDS 와 같음). 앞 문서는 그 뒤 문서가 모두 같은 불러오기에서 지워질 때만 지운다.
  I.KIDS = { erp_imporders: [['erp_imppays', 'poId']], erp_imppays: [['erp_impinvs', 'payId']], erp_impinvs: [['erp_impbls', 'invId']], erp_impbls: [['erp_impins', 'blId']], erp_purchases: [['erp_purdelvs', 'purId']], erp_prods: [['erp_proddlvs', 'prodId'], ['erp_prodmoves', 'prodId']] };
  I.get = (coll, id) => call('GET', coll + '/' + id);
  // 지우기 직전 다시 읽어 아직 완료일 때만 지운다(그 사이 바뀐 문서는 남김, updateTime 전제조건).
  I.del = async (coll, id) => {
    const j = await I.get(coll, id), d = Y.fs(j);
    if (!d || d.status !== '완료') return false;
    await call('DELETE', coll + '/' + id + '?currentDocument.updateTime=' + encodeURIComponent(j.updateTime));
    return true;
  };
  // cand = [{coll,id,key,step}] → 묶음 검사 뒤 지움. 돌려줌 {지움:[…], 남김:[{…, 까닭}]}
  I.gone = async (cand) => {
    let keep = cand.slice(), out = { 지움: [], 남김: [] };
    const kidsOf = {};
    for (const c of keep) for (const [kc, kf] of I.KIDS[c.coll] || []) if (!kidsOf[kc]) kidsOf[kc] = await I.list(kc);
    for (let changed = true; changed;) {
      changed = false;
      const ids = new Set(keep.map((c) => c.coll + '/' + c.id));
      for (const c of keep.slice()) {
        const left = (I.KIDS[c.coll] || []).flatMap(([kc, kf]) => (kidsOf[kc] || []).filter((x) => x[kf] === c.id && !ids.has(kc + '/' + x.id)));
        if (left.length) { keep = keep.filter((x) => x !== c); out.남김.push(Object.assign({}, c, { 까닭: '뒤 문서가 남음(' + left.length + '건)' })); changed = true; }
      }
    }
    const depth = (coll) => { for (const [p, ks] of Object.entries(I.KIDS)) if (ks.some((k) => k[0] === coll)) return depth(p) + 1; return 0; };
    keep.sort((a, b) => depth(b.coll) - depth(a.coll));   // 뒤 문서 먼저
    for (const c of keep) {
      try { if (await I.del(c.coll, c.id)) out.지움.push(c); else out.남김.push(Object.assign({}, c, { 까닭: '그 사이 완료가 아님' })); }
      catch (e) { out.남김.push(Object.assign({}, c, { 까닭: '지우기 실패 ' + (e.message || e) })); }
    }
    return out;
  };
  // 요청 목록(대기, 오래된 것부터)
  I.pending = async () => (await I.list('erp_imports')).filter((r) => r.status === '대기').sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  // 요청 하나 처리: 진행중 → 단계마다 읽기·반영 → (모두 읽은 뒤) 영림원에 없는 완료 문서 지우기 → 완료(또는 오류). 읽기 전에 그 화면이 조회돼 있어야 한다(AGENTS.md 순서).
  //   opt = {allowEmpty, allowMany} — 멈춤 장치에 걸린 뒤 작업자가 영림원 화면에서 조건·건수를 눈으로 확인했을 때만 켜고 다시 돌린다.
  I.run = async (req, opt) => {
    const cur = (await I.list('erp_imports')).find((r) => r.id === req.id);
    if (!cur || cur.status !== '대기') return '건너뜀 — 요청이 없거나 대기가 아님';
    await I.patch('erp_imports', req.id, { status: '진행중', agentNote: '' });
    const result = {}, notes = [], rs = {}, gots = {};
    try {
      for (const step of req.steps) {
        if (!R[step]) throw new Error(step + '-읽기 스크립트를 먼저 실행');
        gots[step] = await R[step](req.only);
        rs[step] = await I.apply(step, gots[step], req, req.mode);
      }
      // 모든 단계를 다 읽은 뒤에만 지운다(읽다가 멈추면 하나도 안 지움).
      const stop = {}, cand = [];
      for (const step of req.steps) { stop[step] = rs[step].없음못봄 ? '' : I.goneStop(rs[step], opt); if (!stop[step]) rs[step].지울것.forEach((c) => cand.push(Object.assign({ step }, c))); }
      const g = req.mode === 'import' ? await I.gone(cand) : { 지움: [], 남김: [] };
      for (const step of req.steps) {
        const r = rs[step], got = gots[step], del = g.지움.filter((c) => c.step === step), kept = g.남김.filter((c) => c.step === step);
        result[step] = { 읽음: r.읽음, 폼에없음: r.폼에없음, 같음: r.같음, 다름: r.다름, 넣음: r.넣음, 공정채움: r.공정채움, 영림원에없음: r.영림원에없음, 지움: del.length, 지운것: del.map((c) => c.key), 남김: kept.length, 멈춤: stop[step] || '' };
        notes.push(I.STEPS[step].title + ': 영림원 ' + r.읽음 + '건 · 폼에 없음 ' + r.폼에없음 + (req.mode === 'import' ? '(넣음 ' + r.넣음 + ')' : '') + (r.공정채움 ? ' · 공정 채움 ' + r.공정채움 : '') + ' · 같음 ' + r.같음 + ' · 다름 ' + r.다름 +
          ' · 영림원에 없음 ' + (r.없음못봄 ? '못 봄(' + r.없음못봄 + ')' : r.영림원에없음) + (req.mode === 'import' && !r.없음못봄 ? '(지움 ' + del.length + ')' : '') +
          (got.확인못함 && got.확인못함.length ? ' · 못 읽은 것(화면에 칸 없음·안 열림): ' + got.확인못함.join(', ') : '') +
          (r.다른것.length ? '\n  다름: ' + r.다른것.join('\n  ') : '') +
          (stop[step] ? '\n  지우지 않음: ' + stop[step] + ' — ' + r.없는것.join(', ') : '') +
          (del.length ? '\n  지움 ' + del.length + '건: ' + del.map((c) => c.key).join(', ') : '') +
          (kept.length ? '\n  남김 ' + kept.length + '건: ' + kept.map((c) => c.key + '(' + c.까닭 + ')').join(', ') : '') +
          (req.mode !== 'import' && !stop[step] && r.없는것.length ? '\n  지울 것: ' + r.없는것.join(', ') : ''));
      }
      await I.patch('erp_imports', req.id, { status: '완료', agentNote: notes.join('\n'), result, doneAt: new Date().toISOString() });
      return { 완료: true, result, agentNote: notes.join('\n') };
    } catch (e) {
      await I.patch('erp_imports', req.id, { status: '오류', agentNote: notes.concat(String(e.message || e) + ' — 지운 것 없음').join('\n'), result });
      return { 오류: String(e.message || e) };
    }
  };
  return '불러오기 공통 준비됨';
})();
