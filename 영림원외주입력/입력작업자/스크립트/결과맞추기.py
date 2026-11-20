"""보드/엣지 매입현황 「영림원보내기」 줄 상태 맞추기 — 폼 문서 상태 → 공개 `발주역입력_영림원폼/{거래처}.결과` (폼 v305 · v307 넘긴 줄만).

사장님 11-20 「영림원에서 영림원 등록 대기중 되면 얘도 대기중되고 영림원 입력완료되면 얘도 입력완료되고 이렇게」
폼 `bdResSync`·`bdClsPub`(영림원외주입력.html) 와 **같은 셈**을 터미널에서 한다 — 폼 창이 안 열려 있어도 맞게.
⚠ 폼의 셈(bdEntries·bdDocOf·bdResOf·bdClsPub)을 바꾸면 여기도 같이 바꾼다.

쓰는 법(입력 작업자 — `bd` 칸 있는 분류·자재·구매단가 문서의 status 를 바꿀 때마다 그 직후):
  python3 결과맞추기.py            모든 거래처 맞춤(바뀐 칸만 씀) · 끝에 「어긋남 0」
  python3 결과맞추기.py 양지데코   그 거래처만
  python3 결과맞추기.py 보기       쓰지 않고 어긋난 칸만 보임
v313(11-20) 공정흐름 사본도: `발주역입력_영림원폼/_공정흐름` = 공정흐름(erp_flows) 완료 이름(폼 bdFlowPub 와 같은 셈)
  → 발주역입력/영림원품목등록 공정흐름 드롭(로그인 없는 기기). **흐름 status 를 바꾼 뒤에도 이 스크립트를 돌린다.**
토큰 = 작업자표.py. 출력엔 거래처·열쇠·단계·상태만(단가·토큰 안 적음).
"""
import json, os, sys, time, urllib.request, urllib.parse, urllib.error

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import 작업자표 as 표

DB = 표.DB
BD = 'artifacts/vivivic-4b7ef/public/data/발주역입력_영림원폼'
SEP = ' > '
ST = {'대기': '대기', '수정대기': '대기', '진행중': '진행중', '완료': '완료', '오류': '오류'}
STAGES = ['분류', '자재', '구매단가']


# ───── Firestore REST 값 ⇄ 파이썬 ─────
def dec(v):
    if 'stringValue' in v: return v['stringValue']
    if 'integerValue' in v: return int(v['integerValue'])
    if 'doubleValue' in v: return v['doubleValue']
    if 'booleanValue' in v: return v['booleanValue']
    if 'nullValue' in v: return None
    if 'timestampValue' in v: return v['timestampValue']
    if 'mapValue' in v: return {k: dec(x) for k, x in (v['mapValue'].get('fields') or {}).items()}
    if 'arrayValue' in v: return [dec(x) for x in (v['arrayValue'].get('values') or [])]
    return None


def enc(v):
    if v is None: return {'nullValue': None}
    if isinstance(v, bool): return {'booleanValue': v}
    if isinstance(v, int): return {'integerValue': str(v)}
    if isinstance(v, float): return {'doubleValue': v}
    if isinstance(v, dict): return {'mapValue': {'fields': {k: enc(x) for k, x in v.items()}}}
    if isinstance(v, list): return {'arrayValue': {'values': [enc(x) for x in v]}}
    return {'stringValue': str(v)}


def req(method, url, body=None):
    h = {'Authorization': 'Bearer ' + 표.token(), 'Content-Type': 'application/json'}
    r = urllib.request.Request(url, json.dumps(body).encode() if body is not None else None, h, method=method)
    with urllib.request.urlopen(r, timeout=60) as x:
        return json.load(x)


def q(p): return urllib.parse.quote(p, safe='/')


def col(path):
    out, tok = [], ''
    while True:
        j = req('GET', DB + q(path) + '?pageSize=300' + ('&pageToken=' + urllib.parse.quote(tok) if tok else ''))
        for d in j.get('documents') or []:
            o = {k: dec(v) for k, v in (d.get('fields') or {}).items()}
            o['id'] = d['name'].rsplit('/', 1)[1]
            out.append(o)
        tok = j.get('nextPageToken')
        if not tok: return out


def fp(*segs):   # 칸 경로 — 모든 조각을 `` 로 감쌈
    return '.'.join('`' + s.replace('\\', '\\\\').replace('`', '\\`') + '`' for s in segs)


# ───── 폼 셈 그대로 ─────
def tr(v): return str('' if v is None else v).strip()
def cls_path(r): return SEP.join(tr(r.get(k)) for k in ('big', 'mid', 'name'))
def pur_key(r): return '|'.join(tr(r.get(k)) for k in ('vendor', 'code', 'from'))
def gone(r): return bool(r.get('ylwGone') and r.get('status') == '완료')
def bd_path(c):
    a = [tr(c.get(k)) for k in ('대분류', '중분류', '소분류')]
    return SEP.join(a) if any(a) else ''
def live(d): return [r for r in (d.get('보내기') or {}).get('줄') or [] if isinstance(r, dict) and r.get('상태') == '보냄']


def old_key(r):   # bdOld — 오류 아닌 것 먼저, 그다음 만든 때 늦은 것 먼저(폼 sort 와 같은 차례)
    return ((r.get('status') == '오류'), [-ord(ch) for ch in str(r.get('createdAt') or '')])


def first(rows): return sorted(rows, key=old_key)[0] if rows else None


def doc_of(key, vn, e, data):
    a = data[key]
    mine = lambda r: isinstance(r.get('bd'), dict) and r['bd'].get('거래처') == vn and r['bd'].get('열쇠') == e.get('key')
    if key == 'classes':
        p = SEP.join([e['vals']['big'], e['vals']['mid'], e['vals']['name']])
        m = first([r for r in a if r.get('kind') == '자재' and cls_path(r) == p])
        if m: return m
        return first([r for r in a if r.get('kind') == '자재' and r.get('status') == '오류' and isinstance(r.get('bd'), dict)
                      and r['bd'].get('거래처') == vn and any(k in e['keys'] for k in (r['bd'].get('열쇠') or []))])
    if key == 'materials':
        cd, nm = tr(e['vals']['code']), tr(e['vals']['name'])
        m = first([r for r in a if mine(r)])
        if m: return m
        if cd:
            for r in a:
                if r.get('status') == '완료' and not gone(r) and tr(r.get('code')) == cd and tr(r.get('name')) == nm: return r
        return None
    k = pur_key(e['vals'])
    hi = e.get('hi')
    return first([r for r in a if pur_key(r) == k and (r.get('status') != '오류' or mine(r))]) \
        or first([r for r in a if mine(r) and r['bd'].get('이력') == hi])   # 폼 v312 품번으로 못 찾으면 줄 열쇠로


def res_of(dd, mat=False):
    if not dd: return None
    o = {'상태': ST.get(dd.get('status'), '대기'), '이유': str(dd.get('agentNote') or '')[:300] if dd.get('status') == '오류' else '',
         '때': str(dd.get('doneAt') or dd.get('updatedAt') or dd.get('createdAt') or '')}
    if mat: o['자재번호'] = tr(dd.get('code'))
    return o


def sent_keys(vn, data):   # 폼 bdSentKeys(v307) — 등록대기로 넘긴 줄 열쇠 = bd 문서(거래처 같음)의 열쇠
    o = set()
    for k in ('classes', 'materials', 'purprices'):
        for r in data[k]:
            b = r.get('bd')
            if not isinstance(b, dict) or b.get('거래처') != vn: continue
            x = b.get('열쇠')
            for y in (x if isinstance(x, list) else [x]):
                if y is not None: o.add(y)
    return o


def want(d, data):
    """{열쇠: {단계: 결과}} — 폼 bdResSync 의 R · v307 넘긴 줄만(사장님 11-20 「입력폼 신호는 대기 입력을 했을때 부터 받아오는거야」)"""
    R = {}
    sent = sent_keys(d['id'], data)
    def put(k, st, v):
        if v and k in sent: R.setdefault(k, {})[st] = v
    g, order = {}, []
    for r in live(d):
        c = r.get('분류') or {}
        p = bd_path(c)
        if p not in g:
            g[p] = {'keys': [], 'vals': {'big': tr(c.get('대분류')), 'mid': tr(c.get('중분류')), 'name': tr(c.get('소분류'))}}
            order.append(p)
        g[p]['keys'].append(r.get('열쇠'))
    for p in order:
        v = res_of(doc_of('classes', d['id'], g[p], data))
        for k in g[p]['keys']: put(k, '분류', v)
    for r in live(d):
        m = r.get('자재등록') or {}
        e = {'key': r.get('열쇠'), 'vals': {'code': tr(m.get('자재번호')), 'name': tr(m.get('자재명'))}}
        put(r.get('열쇠'), '자재', res_of(doc_of('materials', d['id'], e, data), True))
        u = r.get('구매단가등록') or {}
        e = {'key': r.get('열쇠'), 'vals': {'vendor': tr(u.get('구매거래처')), 'code': tr(u.get('품번')), 'from': tr(u.get('적용시작일'))}}
        put(r.get('열쇠'), '구매단가', res_of(doc_of('purprices', d['id'], e, data)))
    return R


def diff(d, R):
    """[(열쇠, 단계, 새 값|None=지움, 옛 값)] — 바뀐 칸 + 보낼 줄인데 문서가 없어진 단계(v304)·안 넘긴 줄(v307)"""
    old = d.get('결과') if isinstance(d.get('결과'), dict) else {}
    out = []
    for k, sts in R.items():
        for st, v in sts.items():
            o = (old.get(k) or {}).get(st) if isinstance(old.get(k), dict) else None
            if o != v: out.append((k, st, v, o))
    for r in live(d):
        k = r.get('열쇠'); o = old.get(k)
        if not isinstance(o, dict): continue
        for st in STAGES:
            if o.get(st) and not (R.get(k) or {}).get(st): out.append((k, st, None, o.get(st)))
    return out


def write(vn, ch):
    mask, fields = [], {}
    for k, st, v, _ in ch:
        mask.append(fp('결과', k, st))
        if v is not None: fields.setdefault('결과', {}).setdefault(k, {})[st] = v
    body = {'fields': {n: enc(x) for n, x in fields.items()}}
    url = DB + q(BD + '/' + vn) + '?currentDocument.exists=true&' + '&'.join('updateMask.fieldPaths=' + urllib.parse.quote(m) for m in mask)
    req('PATCH', url, body)


def cls_pub(docs, data, dry):   # 폼 bdClsPub — _분류.영림원
    cd = next((x for x in docs if x['id'] == '_분류'), None)
    if not cd: return 0
    rows = []
    for r in data['classes']:
        if r.get('kind') == '자재' and r.get('status') == '완료' and not gone(r):
            c = r.get('ylwCode')
            rows.append({'대분류': tr(r.get('big')), '중분류': tr(r.get('mid')), '소분류': tr(r.get('name')), '코드': '/'.join(c) if isinstance(c, list) else tr(c)})
    rows.sort(key=lambda x: x['대분류'] + '\t' + x['중분류'] + '\t' + x['소분류'])
    old = (cd.get('영림원') or {}).get('줄')
    if old is not None and sorted(json.dumps(x, ensure_ascii=False, sort_keys=True) for x in old) == sorted(json.dumps(x, ensure_ascii=False, sort_keys=True) for x in rows):
        return 0
    if not dry:
        body = {'fields': {'영림원': enc({'줄': rows, '올린때': time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime()), '출처': '입력폼 품목대중소분류정의(자재·완료)'})}}
        req('PATCH', DB + q(BD + '/_분류') + '?currentDocument.exists=true&updateMask.fieldPaths=' + urllib.parse.quote(fp('영림원')), body)
    return 1


def flow_rows(flows):   # 폼 bdFlowRows — 공정흐름 완료·ylwGone 아님, createdAt 차례
    out, seen = [], set()
    for r in sorted((r for r in flows if r.get('status') == '완료' and not gone(r) and tr(r.get('name'))),
                    key=lambda r: (str(r.get('createdAt') or ''), tr(r.get('name')))):
        n = tr(r.get('name'))
        if n not in seen: seen.add(n); out.append(n)
    return out


def flow_pub(docs, data, dry):   # 폼 bdFlowPub (v313) — _공정흐름 = 영림원품목등록 공정흐름 드롭(로그인 없을 때)
    rows = flow_rows(data['flows'])
    cd = next((x for x in docs if x['id'] == '_공정흐름'), None)
    if cd and cd.get('줄') == rows: return 0
    if not dry:
        body = {'fields': {'줄': enc(rows), '올린때': enc(time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())), '출처': enc('입력폼 공정흐름유형등록(완료)')}}
        req('PATCH', DB + q(BD + '/_공정흐름'), body)   # 없으면 만듦 · 통째
    return 1


def run(only=None, dry=False):
    data = {k: col('erp_' + k) for k in ('classes', 'materials', 'purprices', 'flows')}
    docs = col(BD)
    vendors = sorted([d for d in docs if not d['id'].startswith('_') and isinstance((d.get('보내기') or {}).get('줄'), list)], key=lambda d: d['id'])
    left = 0
    for d in vendors:
        if only and d['id'] != only: continue
        ch = diff(d, want(d, data))
        if not ch: continue
        for k, st, v, o in ch:
            print('%s  %s  %s: %s → %s' % (d['id'], str(k).replace('\t', ' ').strip(), st, (o or {}).get('상태', '없음'), (v or {}).get('상태', '지움')))
        if dry: left += len(ch)
        else: write(d['id'], ch)
    c = cls_pub(docs, data, dry)
    if c: print('_분류.영림원 ' + ('다름' if dry else '올림'))
    f = flow_pub(docs, data, dry)
    if f: print('_공정흐름 ' + ('다름' if dry else '올림'))
    if not dry:   # 다시 읽어 확인
        docs = col(BD)
        for d in docs:
            if d['id'].startswith('_') or not isinstance((d.get('보내기') or {}).get('줄'), list) or (only and d['id'] != only): continue
            left += len(diff(d, want(d, data)))
        if flow_pub(docs, data, True): left += 1
    elif f: left += 1
    print('어긋남 %d' % left)
    return left


if __name__ == '__main__':
    a = sys.argv[1:]
    dry = '보기' in a
    a = [x for x in a if x != '보기']
    sys.exit(1 if run(a[0] if a else None, dry) and not dry else 0)
