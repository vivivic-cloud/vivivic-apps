#!/usr/bin/env python3
"""MD팀 「스마트스토어 url」 칸에 견줄 **사방넷 스마트스토어 링크** 를 창고에 올린다. (11-27 [새 지시 MD팀스마트스토어칸])

자료 = JSON {벤더피아 상품코드: [스마트스토어 상품코드, 사방넷 품번], ...}
  만드는 길(사방넷 조회만 — 사방넷API/CLAUDE.md 「MD팀 상품코드 ↔ 사방넷 코드 전체 비교」):
    벤더피아 상품코드 = 사방넷 단품 「옵션별칭」(또는 자체상품코드) → 사방넷 품번
    → 그 품번이 「매핑용」 묶음 품번이 아니고 품번코드매핑관리(쇼핑몰 스마트스토어)에 상품코드가 **딱 하나** 일 때만 넣는다.
  ⚠ 자료 JSON 은 커밋하지 않는다(작업자 임시 폴더에 둔다).

창고 = Firestore `artifacts/vivivic-4b7ef/public/data/mdteam_inghome_sabang/links`  {j: JSON 글, n: 개수, at}
  MD팀.js 가 읽기만 한다. 엑셀 올리기(`MD팀올리기.py`)는 `mdteam_inghome` 만 덮어써서 이 칸과 화면 입력 칸(`mdteam_inghome_link`)은 안 건드린다.

쓰는 법:  python3 MD팀사방넷링크올리기.py <자료.json>
"""
import datetime
import json
import sys
import urllib.request

KEY = "AIzaSyB9X_hzd2D3goQ7oenK53Pz805P1c7oSqs"
PROJ = "vivivic-4b7ef"
칸 = "mdteam_inghome_sabang"


def 묻기(주소, 몸=None, 표=None, 셈=None):
    h = {"Content-Type": "application/json"}
    if 표:
        h["Authorization"] = "Bearer " + 표
    q = urllib.request.Request(주소, data=json.dumps(몸).encode() if 몸 is not None else None, headers=h,
                               method=셈 or ("POST" if 몸 is not None else "GET"))
    with urllib.request.urlopen(q, timeout=60) as r:
        return json.loads(r.read() or b"{}")


def 올리기(자료):
    for k, v in 자료.items():
        if not (isinstance(v, list) and len(v) == 2 and str(v[0]).isdigit()):
            raise SystemExit(f"꼴이 틀림: {k} → {v}")
    글 = json.dumps(자료, ensure_ascii=False, separators=(",", ":"))
    표 = 묻기(f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={KEY}", {"returnSecureToken": True})["idToken"]
    자리 = f"projects/{PROJ}/databases/(default)/documents/artifacts/{PROJ}/public/data/{칸}/links"
    묻기(f"https://firestore.googleapis.com/v1/{자리}", {"fields": {
        "j": {"stringValue": 글},
        "n": {"integerValue": str(len(자료))},
        "at": {"stringValue": datetime.datetime.now(datetime.timezone.utc).isoformat()}}}, 표=표, 셈="PATCH")
    print(f"올림: 링크 {len(자료)}개 · 글 {len(글):,}자", file=sys.stderr)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    with open(sys.argv[1], encoding="utf-8") as f:
        올리기(json.load(f))
