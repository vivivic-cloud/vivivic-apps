#!/usr/bin/env python3
"""네 저장소 코드에서 **열쇠 이름(속성명)** 을 긁어 센다. 추측 없음 — 코드에 적힌 것만.

잡는 꼴 둘
  꼴1  x.열쇠            (점으로 읽는 자리)
  꼴2  { 열쇠: ... }     (객체를 짓는 자리)

웹·자바스크립트 붙박이 이름(DOM·CSS·SDK)은 `붙박이.txt` 로 걷어낸다.
시험·본보기자료·만들어진 것(docs/·dist/)은 뺀다 — 업무 코드만 센다.

쓰기
  python3 -I 온톨로지/tools/낱말세기.py                 많이 쓰인 순 (업무 낱말만)
  python3 -I 온톨로지/tools/낱말세기.py --집마다        어느 집에서 쓰는지 함께
  python3 -I 온톨로지/tools/낱말세기.py --찾기 거래처   그 낱말이 든 열쇠만
  python3 -I 온톨로지/tools/낱말세기.py --어디 orderCode  그 열쇠가 적힌 파일·줄
  python3 -I 온톨로지/tools/낱말세기.py --날것          붙박이도 안 걷어내고 전부
"""
import argparse
import collections
import os
import re
import sys

ROOTS = {
    "apps": "/home/user/vivivic-apps",
    "viggle": "/home/user/vivivic-cloud/viggle",
    "cabinet": "/home/user/vivivic-cloud/cabinet-studio",
    "docs": "/home/user/vivivic-cloud/vivivic-docs",
}
TAKE = (".html", ".js", ".mjs")
SKIP = re.compile(
    r"(/\.git/|/tests?/|/본보기자료/|/shots/|/dist/|/node_modules/|/vendor/"
    r"|\.min\.js$|package-lock|_v\d|/docs/index\.html$)"
)

# 꼴1: .열쇠   꼴2: 열쇠:
RE_DOT = re.compile(r"\.([A-Za-z_$가-힣][\w$가-힣]{1,34})")
RE_KEY = re.compile(r"[{,\s]([A-Za-z_$가-힣][\w$가-힣]{1,34})\s*:")

HERE = os.path.dirname(os.path.abspath(__file__))


def 붙박이():
    """업무 뜻이 없는 이름 명단. 없으면 빈 집합 — 그러면 아무것도 안 걷어낸다."""
    길 = os.path.join(HERE, "붙박이.txt")
    if not os.path.exists(길):
        return set()
    out = set()
    with open(길, encoding="utf-8") as f:
        for 줄 in f:
            줄 = 줄.split("#")[0].strip()
            if 줄:
                out.add(줄)
    return out


def 파일들():
    for 집, 뿌리 in ROOTS.items():
        for d, _, fs in os.walk(뿌리):
            if "/.git" in d:
                continue
            for n in fs:
                p = os.path.join(d, n)
                if n.endswith(TAKE) and not SKIP.search(p):
                    yield 집, p


def 센다():
    """열쇠 -> {집: 횟수}"""
    표 = collections.defaultdict(collections.Counter)
    for 집, p in 파일들():
        try:
            글 = open(p, encoding="utf-8", errors="replace").read()
        except OSError:
            continue
        for m in RE_DOT.finditer(글):
            표[m.group(1)][집] += 1
        for m in RE_KEY.finditer(글):
            표[m.group(1)][집] += 1
    return 표


def 어디(열쇠):
    """그 열쇠가 적힌 파일과 줄을 찍는다."""
    pat = re.compile(r"(?<![\w$가-힣])" + re.escape(열쇠) + r"(?![\w$가-힣])")
    for 집, p in sorted(파일들()):
        try:
            줄들 = open(p, encoding="utf-8", errors="replace").read().splitlines()
        except OSError:
            continue
        for i, 줄 in enumerate(줄들, 1):
            if pat.search(줄):
                짧 = 줄.strip()[:110]
                print(f"{집:8} {p.split('/home/user/')[-1]}:{i}  {짧}")


def main():
    ap = argparse.ArgumentParser(add_help=False)
    ap.add_argument("--집마다", action="store_true")
    ap.add_argument("--찾기")
    ap.add_argument("--어디")
    ap.add_argument("--날것", action="store_true")
    ap.add_argument("--최소", type=int, default=1)
    ap.add_argument("-h", "--help", action="store_true")
    a = ap.parse_args()

    if a.help:
        print(__doc__)
        return
    if a.어디:
        어디(a.어디)
        return

    표 = 센다()
    버릴 = set() if a.날것 else 붙박이()
    줄들 = []
    for k, c in 표.items():
        if k in 버릴:
            continue
        총 = sum(c.values())
        if 총 < a.최소:
            continue
        if a.찾기 and a.찾기.lower() not in k.lower():
            continue
        줄들.append((총, k, c))
    줄들.sort(key=lambda t: (-t[0], t[1]))

    print(f"# 서로 다른 열쇠 {len(줄들)} 가지 "
          f"(붙박이 {len(버릴)} 개 걷어냄, 최소 {a.최소}번)", file=sys.stderr)
    for 총, k, c in 줄들:
        if a.집마다:
            집들 = " ".join(f"{집}:{n}" for 집, n in c.most_common())
            print(f"{총:6}  {k:34} {집들}")
        else:
            print(f"{총:6}  {k}")


if __name__ == "__main__":
    main()
