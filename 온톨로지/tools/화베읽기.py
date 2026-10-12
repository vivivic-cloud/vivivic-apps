#!/usr/bin/env python3
"""화베(파이어스토어)를 **읽기만** 한다. 쓰기 없음 — setDoc·patch·delete 를 아예 안 부른다.

무엇을 재나 — 칸마다
  (1) 진짜 있나   (2) 줄 몇 개(최대 센 만큼)   (3) 열쇠(필드) 이름과 그 꼴

⚠ **줄의 내용(값)은 찍지 않는다.** 열쇠 이름과 꼴만 찍는다.
   거래처 이름·사람 이름·수량 같은 업무 자료를 밖으로 내지 않기 위함이다.

쓰기:  python3 -I 온톨로지/tools/화베읽기.py confirmed_orders cutting_plans ...
"""
import json
import sys
import urllib.error
import urllib.parse
import urllib.request

KEY = "AIzaSyB9X_hzd2D3goQ7oenK53Pz805P1c7oSqs"
BASE = ("https://firestore.googleapis.com/v1/projects/vivivic-4b7ef/databases/"
        "(default)/documents/artifacts/vivivic-4b7ef/public/data")


def _post(url, body):
    req = urllib.request.Request(
        url, data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(req, timeout=60))


def 토큰():
    """익명 로그인으로 토큰을 받는다."""
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={KEY}"
    return _post(url, {"returnSecureToken": True})["idToken"]


def 꼴(값):
    """파이어스토어 값에서 꼴 이름만 뽑는다. 값 자체는 버린다."""
    t = next(iter(값), "?")
    if t == "mapValue":
        속 = (값["mapValue"].get("fields") or {})
        return f"map({len(속)})"
    if t == "arrayValue":
        속 = (값["arrayValue"].get("values") or [])
        return f"array({len(속)})"
    return t.replace("Value", "")


def 센다(tok, 칸, 최대=300):
    url = f"{BASE}/{urllib.parse.quote(칸)}?pageSize={min(최대, 300)}&key={KEY}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {tok}"})
    try:
        d = json.load(urllib.request.urlopen(req, timeout=60))
    except urllib.error.HTTPError as e:
        return {"칸": 칸, "못읽음": f"HTTP {e.code}"}
    except Exception as e:                                  # noqa: BLE001
        return {"칸": 칸, "못읽음": type(e).__name__}

    docs = d.get("documents", [])
    열쇠 = {}
    for doc in docs:
        for k, v in (doc.get("fields") or {}).items():
            열쇠.setdefault(k, set()).add(꼴(v))
    return {
        "칸": 칸,
        "줄": len(docs),
        "더있나": bool(d.get("nextPageToken")),
        "열쇠수": len(열쇠),
        "열쇠": {k: sorted(t) for k, t in sorted(열쇠.items())},
    }


if __name__ == "__main__":
    칸들 = sys.argv[1:]
    if not 칸들:
        print(__doc__)
        raise SystemExit(2)
    tok = 토큰()
    print(json.dumps([센다(tok, c) for c in 칸들], ensure_ascii=False, indent=1))
