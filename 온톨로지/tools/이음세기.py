#!/usr/bin/env python3
"""프로그램끼리 **실제로 이어져 있나**를 센다. 추측 없음 — 코드에 적힌 것만.

사장님 10-12 말씀: 「지금까지 만든 몇개의 앱이 서로 연관성이 있는 프로그램으로
돌아갈 수 있도록 만들고 싶어」 — 그래서 **짝마다** 이어졌나를 센다.

무엇을 이음으로 세나 (둘 다 코드에서 확인되는 것만)
  칸    두 프로그램이 **같은 화베 칸**을 부른다            (자료로 이어짐)
  셈    두 프로그램이 **같은 shared/ 셈 한 벌**을 부른다   (셈으로 이어짐)

⚠ `viggle.js` 는 이음으로 세지 않는다. 그것은 **짚어서 지시하는 손잡이**라
  거의 모든 프로그램에 붙어 있다. 업무 자료가 오가는 길이 아니다.
  이것을 세면 모두가 모두와 이어진 것으로 나와 **셈이 뜻을 잃는다.**

⚠ 이것은 **길이 있나**를 센 것이다. 그 길로 **자료가 맞물리나**(이름이 같은가,
  열쇠가 같은가)는 못 센다 — 거기가 `이름갈림.tsv` 가 적는 자리다.
  보기: 서류관리와 벤더피아는 `vp_상품목록` 으로 이어져 **있는데도** 밑줄 두 꼴
  때문에 46쌍이 어긋난다. 길은 있고 자료가 안 맞는 것이다.

쓰기
  python3 -I 온톨로지/tools/이음세기.py              이어진 짝 · 안 이어진 프로그램
  python3 -I 온톨로지/tools/이음세기.py --짝 에이엠티 조혼가구    그 짝이 무엇으로 이어졌나
"""
import argparse
import collections
import itertools
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

# 업무 자료가 오가는 shared 셈 한 벌. 손잡이(viggle.js)·그림(아이콘·svg)은 뺀다.
SHARED_셈 = ["큐알길.js", "거래명세표.js"]

ROOTS = [
    "/home/user/vivivic-apps",
    "/home/user/vivivic-cloud/viggle",
    "/home/user/vivivic-cloud/cabinet-studio",
    "/home/user/vivivic-cloud/vivivic-docs",
]
TAKE = (".html", ".js", ".mjs", ".py", ".gs")
SKIP = re.compile(r"(/\.git/|/shots/|/node_modules/|/vendor/|\.min\.js$"
                  r"|package-lock|/dist/|/docs/index\.html$|/온톨로지/|/tests?/)")

# 사장님이 부르시는 이름으로 — 바이글 규칙(「이름은 사장님이 부르신 그대로」)
부르는이름 = {
    "vivivic-docs": "서류관리",
    "cabinet-studio": "NRS",
    "viggle": "작업대",
    "(apps뿌리)": "작업대화면",
}


def 어느집(p):
    r = p.replace("/home/user/vivivic-apps/", "")
    if r != p:
        뭉치 = r.split("/")[0]
        집 = 뭉치 if "." not in 뭉치 else "(apps뿌리)"
    else:
        집 = p.replace("/home/user/vivivic-cloud/", "").split("/")[0]
    return 부르는이름.get(집, 집)


def 파일들():
    for 뿌리 in ROOTS:
        for d, _, fs in os.walk(뿌리):
            if "/.git" in d:
                continue
            for n in fs:
                p = os.path.join(d, n)
                if n.endswith(TAKE) and not SKIP.search(p):
                    yield p


def 칸이음():
    """칸세기.py 를 불러 칸마다 어느 프로그램이 부르나를 받는다."""
    글 = subprocess.run([sys.executable, "-I", f"{HERE}/칸세기.py"],
                        capture_output=True, text=True, check=True).stdout
    표 = {}
    for 줄 in 글.splitlines():
        m = re.match(r"^(\S+)\s+(\d+)\s\s(.+)$", 줄)
        if not m or m.group(1) == "칸":
            continue
        # ⚠ `(apps뿌리)(5)` 를 `(` 로 쪼개면 **빈 이름**이 나온다 — 뒤의 `(횟수)` 만 뗀다
        집들 = set()
        for x in m.group(3).split():
            이름 = re.sub(r"\(\d+\)$", "", x)
            집들.add(부르는이름.get(이름, 이름))
        집들.discard("shared")          # shared 는 프로그램이 아니다
        표[m.group(1)] = 집들
    return 표


def 셈이음():
    """shared 셈 한 벌마다 어느 프로그램이 부르나."""
    표 = collections.defaultdict(set)
    for p in 파일들():
        if "/shared/" in p:
            continue
        try:
            글 = open(p, encoding="utf-8", errors="replace").read()
        except OSError:
            continue
        for m in SHARED_셈:
            # ⚠ 이름이 글에 **적혀 있는 것**과 **싣는 것**은 다르다.
            #   viggle/tools/관리자/큐알규칙넣기.py 는 주석에 `큐알길.js` 를 적어 두었을
            #   뿐인데 그것을 이음으로 세어 「작업대 ↔ 조혼가구」 가 가짜로 떴다
            #   (2026-10-12 에 겪음). `<script src=…>` · `import` 만 이음으로 센다.
            if re.search(rf"(?:src\s*=\s*[\"\'][^\"\']*|from\s*[\"\'][^\"\']*)"
                         rf"{re.escape(m)}", 글):
                표[m].add(어느집(p))
    return dict(표)


def 프로그램들():
    밖 = set()
    for p in 파일들():
        집 = 어느집(p)
        if 집 not in ("shared",):
            밖.add(집)
    return 밖


def main():
    ap = argparse.ArgumentParser(add_help=False)
    ap.add_argument("--짝", nargs=2)
    ap.add_argument("-h", "--help", action="store_true")
    a = ap.parse_args()
    if a.help:
        print(__doc__)
        return

    칸 = 칸이음()
    셈 = 셈이음()
    모든집 = 프로그램들()

    # 짝 -> 무엇으로 이어졌나
    이음 = collections.defaultdict(lambda: {"칸": [], "셈": []})
    for 이름, 집들 in 칸.items():
        for a1, b1 in itertools.combinations(sorted(집들), 2):
            이음[(a1, b1)]["칸"].append(이름)
    for 이름, 집들 in 셈.items():
        for a1, b1 in itertools.combinations(sorted(집들), 2):
            이음[(a1, b1)]["셈"].append(이름)

    if a.짝:
        키 = tuple(sorted(a.짝))
        v = 이음.get(키)
        if not v:
            print(f"{키[0]} ↔ {키[1]} — **안 이어졌다.** 같은 칸도, 같은 셈도 없다")
            return
        print(f"{키[0]} ↔ {키[1]}")
        if v["칸"]:
            print(f"  같은 칸 {len(v['칸'])}: " + " · ".join(sorted(v["칸"])))
        if v["셈"]:
            print(f"  같은 셈 {len(v['셈'])}: " + " · ".join(sorted(v["셈"])))
        return

    print(f"# 프로그램 {len(모든집)} 가지 · 이어진 짝 {len(이음)} 쌍")
    print(f"# 있을 수 있는 짝은 {len(모든집) * (len(모든집) - 1) // 2} 쌍이다")
    print()
    print("이어진 짝 — 무엇으로 이어졌나 (칸 수 많은 순)")
    for (a1, b1), v in sorted(이음.items(),
                              key=lambda t: (-len(t[1]["칸"]) - len(t[1]["셈"]),
                                             t[0])):
        조각 = []
        if v["셈"]:
            조각.append("셈 " + "·".join(sorted(v["셈"])))
        if v["칸"]:
            조각.append("칸 " + "·".join(sorted(v["칸"])))
        print(f"  {a1} ↔ {b1:16} {' | '.join(조각)}")

    혼자 = sorted(집 for 집 in 모든집
                  if not any(집 in 짝 for 짝 in 이음))
    print()
    print(f"아무 프로그램과도 안 이어진 것 {len(혼자)} 가지 — " + " · ".join(혼자))

    셈 = collections.Counter()
    for 짝 in 이음:
        for 집 in 짝:
            셈[집] += 1
    print()
    print("프로그램마다 이어진 짝 수 (적은 것이 외딴 것이다)")
    for 집 in sorted(모든집, key=lambda x: (셈[x], x)):
        print(f"  {셈[집]:>3}  {집}")


if __name__ == "__main__":
    main()
