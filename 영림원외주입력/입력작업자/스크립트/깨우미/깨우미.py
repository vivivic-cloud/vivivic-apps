#!/usr/bin/env python3
"""깨우미 v1 — 폼 「대기」 건을 입력 PC 가 알아서 영림원에 넣게 깨운다. 설계 = ../../자동입력-설계.md

돌리는 법:  python3 깨우미.py            (계속 돌며 지켜봄)        python3 깨우미.py once   (한 번 훑고 처리)
            python3 깨우미.py scan       (훑기만, 아무것도 안 바꿈)   python3 깨우미.py resume (멈춤 풀기)
            python3 깨우미.py status     (지금 상태)
외부에서 들어오는 길 없음 — 이 PC 가 Firestore 에 먼저 나가 묻기만 한다. 토큰 = 작업자표.py(같은 폴더 위).
로그 = ~/.vivivic/kkaeumi/로그.log (건 id·상태만, 거래 내용·토큰 안 적음).
"""
import json, os, sys, time, subprocess, fcntl, urllib.request, urllib.error, urllib.parse, socket, uuid, signal

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..'))
import 작업자표 as 표

# ───── 설정(임시 값은 「임시」) ─────
NAME = '깨우미'
HOST = socket.gethostname()
AUTO = {            # 지금 자동으로 맡기는 종류 (단단한 것부터 하나씩 늘림) — 11-16 첫 판: 구매 납품(erp_purdelvs)만.
    'erp_purdelvs': '구매 납품(발주 → 구매납품입력 → 입고완료까지)',   # 늘릴 차례(임시): purchases 한 번에 → pomods 발주수정 → 요청·품의·발주 나눠 넣기
}
ORDER = ['vendors', 'workcenters', 'classes', 'items', 'materials', 'processes', 'flows', 'boms', 'itemflows', 'itemmats', 'itemwcs',
         'contracts', 'imporders', 'imppays', 'impinvs', 'impbls', 'impins', 'purprices', 'purchases', 'purreqs', 'purapprs', 'purords',
         'pomods', 'purdelvs', 'purcalcs', 'prods', 'proddlvs', 'prodmoves']
POLL = 5            # 신호 문서 읽는 간격(초) — 3~10초 (임시 5)
SAFETY = 300        # 안전망 전체 훑기 간격(초)
RUN_MAX = 40 * 60   # 한 건 처리 제한시간
BATCH_MAX = 10      # 한 번 깨어 연속 처리 건수(그 뒤 쉬어 다음 신호·안전망에)
BROWSER = os.environ.get('KKAEUMI_BROWSER', 'Browser 1')   # 임시: 이 맥미니 크롬 = 「Browser 1」(11-16 확인). 입력 PC 가 바뀌면 여기만
STATE_DIR = os.path.expanduser('~/.vivivic/kkaeumi')
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
CWD = os.path.join(REPO, '영림원외주입력', '입력작업자')
DB = 표.DB
os.makedirs(STATE_DIR, mode=0o700, exist_ok=True)
STOP = os.path.join(STATE_DIR, '멈춤')
SESS = os.path.join(STATE_DIR, '크롬세션')
LOG = os.path.join(STATE_DIR, '로그.log')
DRY = False


def log(*a):
    line = time.strftime('%m-%d %H:%M:%S ') + ' '.join(str(x) for x in a)
    print(line, flush=True)
    try:
        with open(LOG, 'a') as f: f.write(line + '\n')
    except OSError: pass


def notify(msg):
    log('알림:', msg)
    try: subprocess.run(['osascript', '-e', 'display notification %s with title "깨우미"' % json.dumps(msg, ensure_ascii=False)], timeout=10)
    except Exception: pass


# ───── Firestore REST ─────
def _req(method, url, body=None):
    h = {'Authorization': 'Bearer ' + 표.token(), 'Content-Type': 'application/json'}
    r = urllib.request.Request(url, json.dumps(body).encode() if body is not None else None, h, method=method)
    with urllib.request.urlopen(r, timeout=30) as x:
        return json.load(x)


def dec(v):
    k, x = next(iter(v.items()))
    if k == 'nullValue': return None
    if k in ('stringValue', 'booleanValue', 'timestampValue', 'referenceValue'): return x
    if k == 'integerValue': return int(x)
    if k == 'doubleValue': return x
    if k == 'arrayValue': return [dec(i) for i in x.get('values', [])]
    if k == 'mapValue': return {a: dec(b) for a, b in x.get('fields', {}).items()}
    return x


def enc(x):
    if x is None: return {'nullValue': None}
    if isinstance(x, bool): return {'booleanValue': x}
    if isinstance(x, int): return {'integerValue': str(x)}
    if isinstance(x, str): return {'stringValue': x}
    if isinstance(x, list): return {'arrayValue': {'values': [enc(i) for i in x]}}
    if isinstance(x, dict): return {'mapValue': {'fields': {k: enc(v) for k, v in x.items()}}}
    raise TypeError(x)


def doc_of(d):
    return {'id': d['name'].rsplit('/', 1)[1], 'path': d['name'].split('/documents/')[1], 'ut': d.get('updateTime'),
            'f': {k: dec(v) for k, v in d.get('fields', {}).items()}}


def get_doc(path):
    try: return doc_of(_req('GET', DB + path))
    except urllib.error.HTTPError as e:
        if e.code == 404: return None
        raise


def pending(col):
    """그 컬렉션의 대기·수정대기 문서(조건 질의 하나 — 복합 색인 없음)."""
    out = _req('POST', DB.rstrip('/') + ':runQuery', {'structuredQuery': {'from': [{'collectionId': col}],
        'where': {'fieldFilter': {'field': {'fieldPath': 'status'}, 'op': 'IN', 'value': {'arrayValue': {'values': [enc('대기'), enc('수정대기')]}}}}}})
    return [doc_of(r['document']) for r in out if r.get('document')]


def patch_if(path, fields, ut):
    """조건부 쓰기 — 문서 updateTime 이 ut 와 같을 때만. 성공 True, 이미 바뀌었으면 False."""
    q = urllib.parse.urlencode([('updateMask.fieldPaths', k) for k in fields] + [('currentDocument.updateTime', ut)])
    try:
        _req('PATCH', DB + path + '?' + q, {'fields': {k: enc(v) for k, v in fields.items()}})
        return True
    except urllib.error.HTTPError as e:
        if e.code in (400, 404, 409, 412): return False
        raise


def put_state(**kv):
    """erp_agentq/state — 폼이 나중에 읽는 상태 문서. 권한 없으면 조용히 건너뜀(로그에만 한 줄)."""
    kv['at'] = time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())
    q = urllib.parse.urlencode([('updateMask.fieldPaths', k) for k in kv])
    try: _req('PATCH', DB + 'erp_agentq/state?' + q, {'fields': {k: enc(v) for k, v in kv.items()}}); return True
    except urllib.error.HTTPError as e:
        if not getattr(put_state, 'warned', 0): put_state.warned = 1; log('상태 문서(erp_agentq/state) 쓰기 안 됨', e.code, '— 입력 작업자 권한에 erp_agentq 쓰기 필요')
        return False


# ───── 신호 받는 곳 — 나중에 Firestore 실시간 듣기(listen)로 갈아끼울 때 이 한 함수만 ─────
def read_signal():
    d = get_doc('erp_agentq/ping')
    return (d['f'].get('n'), d['f'].get('at')) if d else (None, None)


# ───── 대상 가리기 ─────
def auto_reason(col, d, ctx=None):
    """자동으로 안 맡기는 이유(없으면 None). 삭제·덮어쓰기·설정·dueEdit·removed 등은 건드리지 않고 대기 그대로 skipped 에만."""
    f = d['f']
    if col not in AUTO: return '자동 종류 아님(%s)' % col.replace('erp_', '')
    if f.get('status') != '대기': return '수정대기'
    for k in ('edit', 'dueEdit', 'removed', 'delete', 'overwrite'):
        if f.get(k): return '%s 있음' % k
    if col == 'erp_purchases' and f.get('stage'): return '나눠 넣기 건(stage=%s)' % f.get('stage')
    if col == 'erp_purdelvs':
        if '남음' in json.dumps(f.get('choose', ''), ensure_ascii=False): return '「남음」 선택 건 — 사장님이 발주수정/부분납품 고르기 전'
        if f.get('pono') in (ctx or {}).get('pomod_pono', set()): return '같은 발주(%s)의 발주수정 대기가 먼저' % f.get('pono')
    return None


def scan():
    """대기 전체 훑기 → (후보 목록 순서대로, skipped 목록, 진행중 오래된 우리 건)."""
    cands, skipped, stale = [], [], []
    allp = {s: pending('erp_' + s) for s in ORDER}
    ctx = {'pomod_pono': {d['f'].get('pono') for d in allp.get('pomods', [])}}
    for s in ORDER:
        col = 'erp_' + s
        for d in sorted(allp[s], key=lambda x: str(x['f'].get('createdAt', ''))):
            why = auto_reason(col, d, ctx)
            if why: skipped.append('%s/%s — %s' % (col, d['id'], why))
            else: cands.append((col, d))
    # 우리가 잡아 둔 채 멈춘 진행중(복구) — 자동 재시작 안 함, 오류로 돌려 사장님께
    for col in AUTO:
        out = _req('POST', DB.rstrip('/') + ':runQuery', {'structuredQuery': {'from': [{'collectionId': col}],
            'where': {'fieldFilter': {'field': {'fieldPath': 'status'}, 'op': 'EQUAL', 'value': enc('진행중')}}}})
        for r in out:
            if r.get('document'):
                d = doc_of(r['document'])
                cb = d['f'].get('claimedBy') or {}
                if isinstance(cb, dict) and cb.get('by') == NAME: stale.append((col, d))
    return cands, skipped, stale


# ───── 한 건 처리 ─────
def chrome_up():
    return subprocess.run(['pgrep', '-x', 'Google Chrome'], capture_output=True).returncode == 0


def prompt_for(col, d):
    return f"""입력대기 건 처리(깨우미가 시킴 — 사람이 채팅으로 시킨 것이 아니라 폼에서 확인돼 「대기」로 저장된 건을 자동으로 넣는 것).
1) 먼저 영림원외주입력/입력작업자/AGENTS.md 를 처음부터 끝까지 읽고, 이 건의 종류에 해당하는 절(3-10 등)과 그 절이 가리키는 절차 원문(보관/AGENTS/절차-원문-3장.md 해당 절)·화면별-요령.md 해당 절·스크립트/README.md 를 모두 읽고 시작한다.
2) 처리 대상은 이 한 건뿐이다: 컬렉션 {col} · 문서 id {d['id']}. 다른 문서는 건드리지 않는다. 깨우미가 이미 status 를 「진행중」으로 바꾸고 claimedBy(by={NAME})를 적어 잠갔다 — AGENTS 3-1 2번의 「아직 대기인지 다시 읽기」는 이 건에서는 「아직 진행중이고 claimedBy.by={NAME} 인지 읽기」로 한다. 아니면 아무것도 하지 말고 [깨우미결과] 보류.
3) 규칙은 AGENTS.md 그대로: 조회로 같은 것이 이미 있는지 먼저 · 저장 전 모든 칸 폼 값과 대조 · 저장 뒤 다시 대조 · 영림원에 없는 값은 저장하지 않고 오류 · 막히면 폼 문서 status 오류 + agentNote(🚩 꼴). 끝나면 폼 문서 status 를 완료(번호 적기) 또는 오류로 바꾼다. 앞 단계(AGENTS 3장 1번)에 대기·오류가 남아 이 건을 못 넣으면 영림원에 아무것도 저장하지 말고 폼 문서를 status 대기로 되돌리고(claimedBy 지우기) agentNote 에 이유를 적고 [깨우미결과] 보류.
4) 영림원 탭: Claude in Chrome 에서 list_connected_browsers → 「{BROWSER}」 를 select_browser 로 고른다. 이 실행 전용 탭 묶음에서 먼저 inghometest.ksystemace.com 로그인된 탭을 찾고, 없으면 새 탭을 연다. 로그인 화면이면 아이디·비밀번호를 절대 넣지 말고 멈춘 뒤 문서를 status 대기로 되돌리고(claimedBy 지우기) [깨우미결과] 로그인필요. 크롬이 연결 안 되면 [깨우미결과] 크롬없음(같이 문서를 대기로 되돌림). 사장님이 쓰는 다른 탭은 건드리지 않는다. 끝나도 로그인된 탭은 닫지 않는다.
5) ⛔ 영림원 삭제·행삭제·설정 변경·정산·전표·세금계산서는 하지 않는다. 필요해지면 멈추고 오류+agentNote 로 사장님께. 작업일지·깃은 건드리지 않는다(깨우미가 로그를 남긴다).
6) 마지막 줄에 정확히 하나만 적는다: [깨우미결과] 완료 | 오류 | 보류 | 로그인필요 | 크롬없음  (그 앞에 한두 줄 요약, 거래 내용·번호 위주 아님 — 번호는 폼 문서에 있다)."""


def run_claude(col, d):
    sid = None
    try: sid = open(SESS).read().strip()
    except OSError: pass
    first = not sid
    if first:
        sid = str(uuid.uuid4()); open(SESS, 'w').write(sid)
    tools = 'Bash,Read,Write,Edit,Glob,Grep,ToolSearch,mcp__claude-in-chrome'
    cmd = ['claude', '-p', '--chrome', '--output-format', 'json', '--permission-mode', 'acceptEdits', '--allowedTools', tools]
    cmd += ['--session-id', sid] if first else ['--resume', sid]
    try:
        p = subprocess.run(cmd, input=prompt_for(col, d), capture_output=True, text=True, cwd=CWD, timeout=RUN_MAX)
    except subprocess.TimeoutExpired:
        return 'timeout', '', 0
    try: j = json.loads(p.stdout)
    except Exception: return 'noparse', (p.stdout[-300:] + p.stderr[-300:]), 0
    return ('error' if j.get('is_error') else 'ok'), str(j.get('result', '')), j.get('total_cost_usd', 0)


def process(col, d):
    """집기 → 실행 → 끝 확인. 반환: 'ok'|'defer'|'pause'|'fail'."""
    key = col + '/' + d['id']
    now = time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())
    claim = {'status': '진행중', 'claimedBy': {'by': NAME, 'host': HOST, 'at': now}}
    if DRY: log('(시험) 집을 건', key); return 'ok'
    if not patch_if(col + '/' + d['id'], claim, d['ut']):
        log('이미 바뀐 건 — 건너뜀', key); return 'defer'
    log('집음', key)
    put_state(running=key)
    kind, res, cost = run_claude(col, d)
    mark = ''
    for k in ('완료', '오류', '보류', '로그인필요', '크롬없음'):
        if '[깨우미결과] ' + k in res.replace('[깨우미결과]  ', '[깨우미결과] '): mark = k
    cur = get_doc(col + '/' + d['id'])
    st = cur['f'].get('status') if cur else None
    log('끝', key, '실행=' + kind, '표시=' + (mark or '없음'), '폼 상태=' + str(st), '비용=$%.2f' % cost)
    put_state(running='')
    if cur is None: return 'ok'
    cb = (cur['f'].get('claimedBy') or {}) if isinstance(cur['f'].get('claimedBy'), dict) else {}
    if st == '진행중' and cb.get('by') == NAME:      # 실행이 끝났는데 아직 진행중 = 실패
        if mark in ('로그인필요', '크롬없음') or kind in ('timeout', 'noparse', 'error') and mark in ('로그인필요', '크롬없음'):
            patch_if(cur['path'], {'status': '대기', 'claimedBy': None}, cur['ut'])    # 영림원에 안 넣었으니 대기로 되돌림(오류 안 남김)
            return 'pause:' + mark
        note = '🚩 깨우미: 실행이 끝났는데 폼 상태가 진행중으로 남음(실행=%s). 영림원에 이미 저장됐을 수 있으니 영림원에서 먼저 조회해 확인한 뒤 처리하세요. 자동 재입력 안 함.' % kind
        patch_if(cur['path'], {'status': '오류', 'agentNote': note}, cur['ut'])
        return 'fail'
    if st == '대기':                                  # 보류·로그인필요·크롬없음으로 대기 되돌림
        DEFER[cur['path']] = cur['ut']
        return 'pause:' + mark if mark in ('로그인필요', '크롬없음') else 'defer'
    return 'ok'


DEFER = {}   # 보류한 건 {경로: 그때 updateTime} — 문서가 바뀌기 전엔 다시 안 집음


def stop(reason):
    open(STOP, 'w').write(reason)
    put_state(stopped=reason)
    notify('멈춤: ' + reason + ' — 해결 뒤 「python3 깨우미.py resume」')


def cycle(trigger):
    """대기 훑기 → 한 번에 하나씩 처리(최대 BATCH_MAX)."""
    done = 0
    fails = 0
    while done < BATCH_MAX and not os.path.exists(STOP):
        cands, skipped, stale = scan()
        for col, d in stale:   # 복구
            cb = d['f'].get('claimedBy') or {}
            if time.time() - time.mktime(time.strptime(cb.get('at', '1970-01-01T00:00:00')[:19], '%Y-%m-%dT%H:%M:%S')) + time.timezone > 180:
                patch_if(col + '/' + d['id'], {'status': '오류', 'agentNote': '🚩 깨우미가 멈춘 흔적: 진행중으로 잡힌 채 깨우미가 끊김. 영림원에서 이미 저장됐는지 조회로 확인한 뒤 처리하세요(자동 재입력 안 함).'}, d['ut'])
                log('멈춘 흔적 → 오류', col, d['id'])
        todo = [(c, d) for c, d in cands if DEFER.get(c + '/' + d['id']) != d['ut']]
        put_state(skipped=skipped[:50], waiting=len(todo), last=trigger)
        if not todo: log('훑기(%s): 자동 대상 0 · 건너뜀 %d' % (trigger, len(skipped))); return
        if not chrome_up():
            notify('크롬이 꺼져 있어 대기 %d건을 못 넣고 기다립니다' % len(todo)); return
        col, d = todo[0]
        r = process(col, d)
        done += 1
        if r.startswith('pause:'): stop('영림원 쪽 준비 안 됨(%s) — 로그인된 탭이 필요합니다' % r.split(':')[1]); return
        fails = fails + 1 if r == 'fail' else 0
        if fails >= 2: stop('연속 2건 실패'); return
    if done >= BATCH_MAX: log('한 번에 %d건 처리 — 쉬었다 다음 신호·안전망에 이어감' % done)


def main(mode):
    lock = open(os.path.join(STATE_DIR, 'lock'), 'w')
    try: fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError: raise SystemExit('깨우미가 이미 돌고 있음')
    signal.signal(signal.SIGTERM, lambda *a: sys.exit(0))
    log('깨우미 시작', mode, HOST, '자동 종류:', ','.join(AUTO))
    last_n, last_full, was_err = None, 0, False
    cycle('시작')
    if mode == 'once': return
    last_full = time.time()
    try: last_n = read_signal()
    except Exception: pass
    while True:
        time.sleep(POLL)
        if os.path.exists(STOP): continue
        try:
            n = read_signal()
            reconn = was_err; was_err = False
            if n != last_n:
                last_n = n; last_full = time.time(); cycle('신호')
            elif reconn or time.time() - last_full >= SAFETY:
                last_full = time.time(); cycle('재접속' if reconn else '안전망')
        except SystemExit: raise
        except Exception as e:
            if not was_err: log('연결 문제', type(e).__name__, str(e)[:120])
            was_err = True; time.sleep(20)


if __name__ == '__main__':
    m = sys.argv[1] if len(sys.argv) > 1 else 'run'
    if m == 'resume':
        try: os.remove(STOP); put_state(stopped=''); print('멈춤 풀었음')
        except FileNotFoundError: print('멈춘 적 없음')
    elif m == 'status':
        print('멈춤:', open(STOP).read() if os.path.exists(STOP) else '아님'); os.system('tail -n 15 "%s"' % LOG)
    elif m == 'scan':
        c, s, st = scan(); print('자동 대상 %d건:' % len(c)); [print(' ', col, d['id'], d['f'].get('createdAt')) for col, d in c]
        print('건너뜀(대기 그대로) %d건:' % len(s)); [print(' ', x) for x in s]; print('멈춘 흔적', [(c, d['id']) for c, d in st])
        print('신호 문서:', read_signal())
    else:
        DRY = (m == 'dry'); main('once' if m in ('once', 'dry') else 'run')
