"""입력 작업자(터미널 쪽) 저장소 로그인 — 영림원외주입력 v127.

저장소 규칙이 erp_ 를 담당자만 쓰게 한다. 터미널 스크립트는 이 맥에 붙박은 익명 계정 하나를 쓴다.
- 갱신표(refresh token) = ~/.vivivic/erp-agent.json (권한 600, 저장소 밖 · 깃·대화·로그에 안 남김, 출력 금지)
- 처음 한 번: 익명 가입 → 파일 저장 → erp_staff/<uid> 에 「입력 작업자(터미널)」 줄(권한 없음).
  사장님이 폼 「담당자 관리」 에서 그 줄(uid 끝 4자리)에 모든 메뉴 권한을 주셔야 읽고 쓴다.
- 갱신이 막히면 새로 만들지 않고 멈춘다.
쓰는 법: import 작업자표; tok = 작업자표.token()   ·   python3 작업자표.py  → uid 끝 4자리만 보인다.
"""
import json, os, time, urllib.request, urllib.parse

KEY = 'AIzaSyB9X_hzd2D3goQ7oenK53Pz805P1c7oSqs'   # 입력폼 FB_CONFIG.apiKey (공개 웹 키)
DB = 'https://firestore.googleapis.com/v1/projects/vivivic-4b7ef/databases/(default)/documents/'
FILE = os.path.expanduser('~/.vivivic/erp-agent.json')
_tok = [None, 0]


def _post(url, data, form=False, tok=None):
    body = urllib.parse.urlencode(data).encode() if form else json.dumps(data).encode()
    h = {'Content-Type': 'application/x-www-form-urlencoded' if form else 'application/json'}
    if tok: h['Authorization'] = 'Bearer ' + tok
    with urllib.request.urlopen(urllib.request.Request(url, body, h)) as r:
        return json.load(r)


def _save(d):
    os.makedirs(os.path.dirname(FILE), mode=0o700, exist_ok=True)
    fd = os.open(FILE, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, 'w') as f: json.dump(d, f)


def _load():
    try:
        with open(FILE) as f: return json.load(f)
    except FileNotFoundError:
        return None


def token():
    if _tok[0] and time.time() - _tok[1] < 50 * 60: return _tok[0]
    s = _load()
    if s and s.get('rt'):
        try:
            j = _post('https://securetoken.googleapis.com/v1/token?key=' + KEY, {'grant_type': 'refresh_token', 'refresh_token': s['rt']}, form=True)
        except urllib.error.HTTPError as e:
            raise SystemExit('입력 작업자 표 갱신 실패(%s) — 새로 만들지 않음. AGENTS 맨 위 「저장소 로그인」' % e.code)
        if j.get('refresh_token') and j['refresh_token'] != s['rt']: _save({'rt': j['refresh_token'], 'uid': j.get('user_id') or s['uid']})
        _tok[:] = [j['id_token'], time.time()]
        return _tok[0]
    j = _post('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + KEY, {'returnSecureToken': True})
    _save({'rt': j['refreshToken'], 'uid': j['localId']})
    _tok[:] = [j['idToken'], time.time()]
    now = time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())
    _post(DB + 'erp_staff?documentId=' + j['localId'], {'fields': {'agent': {'booleanValue': True}, 'name': {'stringValue': '입력 작업자(터미널)'},
                                                                    'firstAt': {'stringValue': now}, 'lastAt': {'stringValue': now}}}, tok=_tok[0])
    return _tok[0]


def who():
    s = _load()
    return '입력 작업자(터미널) uid 끝 ' + s['uid'][-4:] if s and s.get('uid') else '아직 없음'


if __name__ == '__main__':
    token()
    print(who())
