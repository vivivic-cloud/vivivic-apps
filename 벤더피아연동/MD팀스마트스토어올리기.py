#!/usr/bin/env python3
"""MD팀 「스마트스토어 url」 칸에 견줄 **스마트스토어 상품 파일 링크** 를 창고에 올린다. (11-27 [새 지시 MD팀스마트스토어파일])

자료 = 스마트스토어센터 상품 목록에서 받은 CSV(UTF-8 BOM, 72열) — **읽기만** 한다(고치지도, 드라이브에 새 파일을 만들지도 않음).
  쓰는 열: 「판매자상품코드」 · 「상품번호(스마트스토어)」 · 「상품명」.
  ⚠ 11-27 파일 잰 것: 판매자상품코드 있는 줄 173 / 917 · 코드 156가지 · 그중 13가지는 상품번호가 둘 이상(→ 어느 것인지 몰라 **뺀다**).
    「판매자바코드」 2 · 「판매자 내부코드1·2」 0 · 「옵션」 = Y/N(옵션 관리코드 열 없음). MD팀 상품코드와 같은 것은 판매자상품코드뿐.
  넣는 것 = 판매자상품코드 하나에 상품번호가 **딱 하나**인 것만 {판매자상품코드: [상품번호, 상품명]}. 이름으로는 안 맞춘다.

창고 = Firestore `artifacts/vivivic-4b7ef/public/data/mdteam_inghome_ss/links`  {j: JSON 글, n, at, 파일}
  MD팀.js 가 읽기만 한다. 엑셀 올리기(`MD팀올리기.py`)·사방넷 링크(`mdteam_inghome_sabang`)·화면 입력(`mdteam_inghome_link`)과 따로다.

쓰는 법:  python3 MD팀스마트스토어올리기.py "<스마트스토어 상품 CSV>"            (만들어 보고 셈만)
         python3 MD팀스마트스토어올리기.py "<스마트스토어 상품 CSV>" --올리기
"""
import collections
import csv
import datetime
import json
import os
import sys
import urllib.request

KEY = "AIzaSyB9X_hzd2D3goQ7oenK53Pz805P1c7oSqs"
PROJ = "vivivic-4b7ef"
칸 = "mdteam_inghome_ss"


def 만들기(경로):
    with open(경로, encoding="utf-8-sig", newline="") as f:
        줄들 = list(csv.reader(f))
    머리, 몸 = 줄들[0], 줄들[1:]
    자리 = {h: i for i, h in enumerate(머리)}
    for h in ("판매자상품코드", "상품번호(스마트스토어)", "상품명"):
        if h not in 자리:
            raise SystemExit(f"열 없음: {h}")
    값 = lambda r, h: r[자리[h]].strip() if len(r) > 자리[h] else ""
    모음 = collections.defaultdict(dict)
    for r in 몸:
        c, n = 값(r, "판매자상품코드"), 값(r, "상품번호(스마트스토어)")
        if c and n.isdigit():
            모음[c][n] = 값(r, "상품명")
    답 = {c: [next(iter(v)), next(iter(v.values()))] for c, v in 모음.items() if len(v) == 1}
    둘이상 = sorted(c for c, v in 모음.items() if len(v) > 1)
    print(f"줄 {len(몸)} · 판매자상품코드 있는 줄 {sum(1 for r in 몸 if 값(r, '판매자상품코드'))} · 코드 {len(모음)} · 넣음 {len(답)} · 상품번호 둘 이상이라 뺌 {len(둘이상)}: {', '.join(둘이상)}", file=sys.stderr)
    return 답


def 올리기(자료, 파일):
    글 = json.dumps(자료, ensure_ascii=False, separators=(",", ":"))

    def 묻기(주소, 몸=None, 표=None, 셈=None):
        h = {"Content-Type": "application/json"}
        if 표:
            h["Authorization"] = "Bearer " + 표
        q = urllib.request.Request(주소, data=json.dumps(몸).encode() if 몸 is not None else None, headers=h,
                                   method=셈 or ("POST" if 몸 is not None else "GET"))
        with urllib.request.urlopen(q, timeout=60) as r:
            return json.loads(r.read() or b"{}")

    표 = 묻기(f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={KEY}", {"returnSecureToken": True})["idToken"]
    자리 = f"projects/{PROJ}/databases/(default)/documents/artifacts/{PROJ}/public/data/{칸}/links"
    묻기(f"https://firestore.googleapis.com/v1/{자리}", {"fields": {
        "j": {"stringValue": 글},
        "n": {"integerValue": str(len(자료))},
        "파일": {"stringValue": 파일},
        "at": {"stringValue": datetime.datetime.now(datetime.timezone.utc).isoformat()}}}, 표=표, 셈="PATCH")
    print(f"올림: {len(자료)}개 · 글 {len(글):,}자", file=sys.stderr)


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a:
        print(__doc__)
        sys.exit(1)
    자료 = 만들기(a[0])
    if "--올리기" in a:
        올리기(자료, os.path.basename(a[0]))
