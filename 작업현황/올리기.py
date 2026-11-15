#!/usr/bin/env python3
"""작업현황/data.json 을 GitHub 에서 받고 올린다 (gh 로그인 필요, 체크아웃 필요 없음).
   python3 올리기.py 받기 <저장할경로>      — 지금 올라가 있는 data.json 을 내려받는다
   python3 올리기.py 올리기 <올릴경로> ["커밋글"] — 모양을 검사하고 data.json 한 파일만 올린다
   (11-15) 예약 작업 `작업현황 갱신` 이 쓴다. 이 파일 한 개만 건드린다.
   python3 올리기.py 해시 "<글>"                  — 글의 짧은 지문(10자)을 낸다(보고해시용)
   (11-16 삭제) 올리기는 올리기 전에 **삭제 표시 목록(파이어스토어 ws_deleted)을 읽어** 지운 줄을 다시 안 올린다. 못 읽으면 올리지 않는다.
   (11-16) 화면링크·화면이름: `프로그램길.json` 에 있는 주소(첫화면·부분)만 허락한다 — 지어낸 주소는 검사에서 걸린다."""
import sys, json, base64, subprocess, urllib.parse, urllib.request, urllib.error, re, os, time, hashlib, datetime
REPO = "vivivic-cloud/vivivic-apps"
PATH = "작업현황/data.json"
API = f"repos/{REPO}/contents/" + urllib.parse.quote(PATH)
STATES = {"작업중", "사장님 지시 대기", "끝남"}
OK_URL = re.compile(r"^(https://|claude://|$)")

KEY = "AIzaSyB9X_hzd2D3goQ7oenK53Pz805P1c7oSqs"   # 파이어베이스 웹 열쇠(공개 값 — 화면 코드에도 들어 있다)
PROJ = "vivivic-4b7ef"
열쇠파일 = os.path.expanduser("~/.claude/작업현황-열쇠.json")   # 이 맥에만 둔다(저장소에 올리지 않는다)
묘비칸 = f"https://firestore.googleapis.com/v1/projects/{PROJ}/databases/(default)/documents/artifacts/{PROJ}/public/data/ws_deleted"

def 해시(t):
    return hashlib.sha1(" ".join(str(t).split()).encode("utf-8")).hexdigest()[:10]

def _보내(url, 몸=None, 헤더=None, 꼴="json"):
    데이터 = None
    h = dict(헤더 or {})
    if 몸 is not None:
        if 꼴 == "json": 데이터 = json.dumps(몸).encode(); h["Content-Type"] = "application/json"
        else: 데이터 = urllib.parse.urlencode(몸).encode(); h["Content-Type"] = "application/x-www-form-urlencoded"
    return json.load(urllib.request.urlopen(urllib.request.Request(url, 데이터, h), timeout=20))

def 토큰():
    """익명 열쇠 한 벌을 돌려 쓴다(계정을 매번 새로 만들면 막힌다 — 10-16 바이글 사례). 지나면 갱신, 갱신 안 되면 그때만 새로."""
    try: c = json.load(open(열쇠파일))
    except Exception: c = {}
    if c.get("idToken") and c.get("끝", 0) - time.time() > 300: return c["idToken"]
    j = None
    if c.get("refreshToken"):
        try:
            r = _보내("https://securetoken.googleapis.com/v1/token?key=" + KEY,
                      {"grant_type": "refresh_token", "refresh_token": c["refreshToken"]}, 꼴="form")
            j = {"idToken": r["id_token"], "refreshToken": r["refresh_token"], "expiresIn": r["expires_in"]}
        except Exception: j = None
    if not j:
        j = _보내("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" + KEY, {"returnSecureToken": True})
    os.makedirs(os.path.dirname(열쇠파일), exist_ok=True)
    fd = os.open(열쇠파일, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as f:
        json.dump({"idToken": j["idToken"], "refreshToken": j["refreshToken"], "끝": time.time() + int(j["expiresIn"])}, f)
    return j["idToken"]

def 묘비읽기():
    """삭제 표시 목록 전부(읽기만). 글·상세는 없고 지문(해시)·종류·시각뿐이다."""
    t = 토큰(); 나옴 = []; 쪽 = ""
    while True:
        try:
            r = _보내(묘비칸 + "?pageSize=300" + ("&pageToken=" + 쪽 if 쪽 else ""), 헤더={"Authorization": "Bearer " + t})
        except urllib.error.HTTPError as e:
            if e.code == 404: return 나옴
            raise
        for d in r.get("documents", []):
            나옴.append({k: list(v.values())[0] for k, v in d.get("fields", {}).items()})
        쪽 = r.get("nextPageToken", "")
        if not 쪽: return 나옴

def _때(x):
    try: return datetime.datetime.fromisoformat(x).timestamp()
    except Exception: return 0

def 지문붙이고_지운것빼기(d, 묘비):
    """줄마다 지문(id·방해시)을 붙이고, 삭제 표시가 있는 줄은 뺀다. 빠진 개수를 돌려준다."""
    뺀 = {"확인": 0, "방": 0}
    확인묘 = [m for m in 묘비 if m.get("종류") == "확인"]
    방묘 = {m["id"]: m for m in 묘비 if m.get("종류") == "방" and m.get("id")}
    새확인 = []
    for x in d["확인"]:
        x["방해시"] = 해시(x.get("방링크", ""))
        x["id"] = 해시(x.get("방링크", "") + "|" + x["글"])
        if x.get("보고해시") is not None: x["보고해시"] = str(x["보고해시"])
        지움 = any(m.get("id") == x["id"]
                  or (m.get("방해시") == x["방해시"] and m.get("보고해시") and m.get("보고해시") == x.get("보고해시"))
                  for m in 확인묘)
        if 지움: 뺀["확인"] += 1
        else: 새확인.append(x)
    d["확인"] = 새확인
    새묶 = []
    for g in d["묶음"]:
        남 = []
        for b in g["방"]:
            b["id"] = 해시(b.get("링크", "") or b["제목"])
            m = 방묘.get(b["id"])
            # 지운 뒤로 방이 다시 움직였으면(마지막이 더 새로우면) 새 일이니 다시 보인다
            if m and _때(b["마지막"]) <= _때(m.get("마지막", "")): 뺀["방"] += 1
            else: 남.append(b)
        if 남: g["방"] = 남; 새묶.append(g)
    d["묶음"] = 새묶
    return 뺀

def gh(*a, inp=None):
    r = subprocess.run(["gh", "api", *a], input=inp, capture_output=True, text=True)
    if r.returncode: sys.exit("gh 실패: " + r.stderr.strip()[:300])
    return r.stdout

def 길주소():
    """`프로그램길.json` 에 적힌 주소 전부(첫화면·부분)와 그 주소의 이름"""
    j = json.loads(gh("repos/%s/contents/%s" % (REPO, urllib.parse.quote("작업현황/프로그램길.json"))))
    표 = json.loads(base64.b64decode(j["content"]))
    return {x["주소"]: True for p in 표["프로그램"] for x in [p["첫화면"]] + p["부분"]}

def 화면검사(줄, 길, 어디):
    a, b = 줄.get("화면링크", ""), 줄.get("화면이름", "")
    assert bool(a) == bool(b), f"{어디}: 화면링크와 화면이름은 같이 있거나 같이 없어야 한다"
    if a:
        assert a in 길, f"{어디}: 프로그램길.json 에 없는 화면링크 {a}"
        assert 0 < len(b) <= 20, f"{어디}: 화면이름은 20자 안"

def 검사(d):
    길 = 길주소()
    assert re.match(r"^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\+09:00$", d.get("갱신", "")), "갱신 시각 꼴(+09:00)"
    for x in d["확인"]:
        assert x["글"].strip(), "확인 글 비어 있음"
        assert OK_URL.match(x.get("방링크", "")) and OK_URL.match(x.get("일지링크", "")), "확인 링크 꼴"
        화면검사(x, 길, "확인 " + x["글"][:12])
    for g in d["묶음"]:
        assert g["이름"].strip()
        for b in g["방"]:
            assert b["상태"] in STATES, f"상태 {b['상태']}"
            assert OK_URL.match(b.get("링크", "")), "방 링크 꼴"
            화면검사(b, 길, "방 " + b["제목"][:12])
            assert len(b["한일"]) <= 80, "한일은 한 줄(80자 안)"
    return d

if len(sys.argv) >= 3 and sys.argv[1] == "받기":
    j = json.loads(gh(API))
    open(sys.argv[2], "wb").write(base64.b64decode(j["content"]))
    print("받음", j["sha"][:7])
elif len(sys.argv) >= 3 and sys.argv[1] == "올리기":
    d = json.load(open(sys.argv[2], encoding="utf-8"))
    try: 묘비 = 묘비읽기()
    except Exception as e: sys.exit("삭제 표시 목록을 못 읽어 올리지 않았다: " + str(e)[:200])   # 못 읽으면 지운 줄이 되살아날 수 있어 올리지 않는다
    뺀 = 지문붙이고_지운것빼기(d, 묘비)
    print(f"삭제 표시 {len(묘비)}건 읽음 · 뺀 줄 확인 {뺀['확인']} · 방 {뺀['방']}")
    d = 검사(d)
    txt = json.dumps(d, ensure_ascii=False, indent=1) + "\n"
    sha = json.loads(gh(API))["sha"]
    msg = sys.argv[3] if len(sys.argv) > 3 else "작업현황 자료 갱신"
    out = gh("-X", "PUT", API, "-f", f"message={msg}", "-f", f"sha={sha}",
             "-f", "content=" + base64.b64encode(txt.encode()).decode())
    print("올림", json.loads(out)["commit"]["sha"][:7])
elif len(sys.argv) >= 3 and sys.argv[1] == "해시":
    print(해시(sys.argv[2]))
else:
    sys.exit(__doc__)
