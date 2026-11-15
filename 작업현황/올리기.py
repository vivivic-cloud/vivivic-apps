#!/usr/bin/env python3
"""작업현황/data.json 을 GitHub 에서 받고 올린다 (gh 로그인 필요, 체크아웃 필요 없음).
   python3 올리기.py 받기 <저장할경로>      — 지금 올라가 있는 data.json 을 내려받는다
   python3 올리기.py 올리기 <올릴경로> ["커밋글"] — 모양을 검사하고 data.json 한 파일만 올린다
   (11-15) 예약 작업 `작업현황 갱신` 이 쓴다. 이 파일 한 개만 건드린다.
   (11-16) 화면링크·화면이름: `프로그램길.json` 에 있는 주소(첫화면·부분)만 허락한다 — 지어낸 주소는 검사에서 걸린다."""
import sys, json, base64, subprocess, urllib.parse, re
REPO = "vivivic-cloud/vivivic-apps"
PATH = "작업현황/data.json"
API = f"repos/{REPO}/contents/" + urllib.parse.quote(PATH)
STATES = {"작업중", "사장님 지시 대기", "끝남"}
OK_URL = re.compile(r"^(https://|claude://|$)")

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
    d = 검사(json.load(open(sys.argv[2], encoding="utf-8")))
    txt = json.dumps(d, ensure_ascii=False, indent=1) + "\n"
    sha = json.loads(gh(API))["sha"]
    msg = sys.argv[3] if len(sys.argv) > 3 else "작업현황 자료 갱신"
    out = gh("-X", "PUT", API, "-f", f"message={msg}", "-f", f"sha={sha}",
             "-f", "content=" + base64.b64encode(txt.encode()).decode())
    print("올림", json.loads(out)["commit"]["sha"][:7])
else:
    sys.exit(__doc__)
