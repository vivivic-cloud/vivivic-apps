#!/usr/bin/env python3
"""적어 둔 것을 **코드에 대고 다시 잰다.** 표가 썩지 않게 하는 연장이다.

무엇을 재나
  ㄱ) `이름갈림.tsv` 에 적은 **이름이 진짜 코드에 있나**
  ㄴ) `객체.tsv` 에 적은 **칸이 진짜 코드에서 불리나** (칸세기.py 와 맞대 본다)
  ㄷ) 둘 다 셈을 찍는다 — 객체 몇 가지 · 갈린 자리 몇 군데

없는 이름을 적어 두면 **빨개진다.** 그래야 「아마」 로 적은 줄이 표에 못 남는다.

쓰기
  python3 -I 온톨로지/tools/재보기.py            셈만
  python3 -I 온톨로지/tools/재보기.py --자세히    줄마다 몇 번 나오나
"""
import argparse
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
온 = os.path.dirname(HERE)

ROOTS = [
    "/home/user/vivivic-apps",
    "/home/user/vivivic-cloud/viggle",
    "/home/user/vivivic-cloud/cabinet-studio",
    "/home/user/vivivic-cloud/vivivic-docs",
]
TAKE = (".html", ".js", ".mjs", ".py", ".gs")
SKIP = re.compile(r"(/\.git/|/shots/|/node_modules/|/vendor/|\.min\.js$"
                  r"|package-lock|/dist/|/docs/index\.html$|/온톨로지/)")

# 이름이 아닌 것 — 표에 쪽지로 적은 말들은 재지 않는다
NOT_A_NAME = re.compile(r"^\(|^—$|^$|^[가-힣 ·]+\)$")


def 코드():
    """네 저장소의 업무 코드를 한 덩이로 읽는다. 한 번만 읽고 돌려 쓴다."""
    덩이 = []
    for 뿌리 in ROOTS:
        for d, _, fs in os.walk(뿌리):
            if "/.git" in d:
                continue
            for n in fs:
                p = os.path.join(d, n)
                if n.endswith(TAKE) and not SKIP.search(p):
                    try:
                        덩이.append(open(p, encoding="utf-8",
                                        errors="replace").read())
                    except OSError:
                        pass
    return "\n".join(덩이)


def 줄읽기(길):
    with open(길, encoding="utf-8") as f:
        for 줄 in f:
            if 줄.startswith("#") or not 줄.strip():
                continue
            칸 = 줄.rstrip("\n").split("\t")
            if 칸 and 칸[0] == "번호":
                continue
            yield 칸


def 몇번(글, 이름):
    """그 이름이 코드에 몇 번 나오나. 글자 앞뒤가 이름 글자면 안 센다."""
    # 괄호 안 설명은 떼고 센다 — 「cardKey (= card-…)」 는 cardKey 를 센다
    이름 = re.sub(r"\s*\(.*", "", 이름).strip()
    if not 이름 or NOT_A_NAME.match(이름):
        return None
    # 한 글자 유니코드(밑줄 꼴 같은 것)는 그대로 센다
    if len(이름) == 1 or not re.match(r"^[\w$가-힣]", 이름):
        return 글.count(이름)
    pat = re.compile(r"(?<![\w$가-힣])" + re.escape(이름) + r"(?![\w$가-힣])")
    return len(pat.findall(글))


def 칸목록():
    """칸세기.py 가 세어 준 칸 이름들."""
    글 = subprocess.run([sys.executable, "-I", f"{HERE}/칸세기.py"],
                        capture_output=True, text=True, check=True).stdout
    밖 = set()
    for 줄 in 글.splitlines():
        m = re.match(r"^(\S+)\s+\d+\s\s", 줄)
        if m and m.group(1) != "칸":
            밖.add(m.group(1))
    return 밖


def main():
    ap = argparse.ArgumentParser(add_help=False)
    ap.add_argument("--자세히", action="store_true")
    ap.add_argument("-h", "--help", action="store_true")
    a = ap.parse_args()
    if a.help:
        print(__doc__)
        return

    글 = 코드()
    칸들 = 칸목록()
    탈 = []

    # ── ㄱ) 갈린 이름이 진짜 코드에 있나
    갈림 = list(줄읽기(f"{온}/이름갈림.tsv"))
    이름수 = 0
    for 칸 in 갈림:
        번호, 개념, 이름글 = 칸[0], 칸[1], 칸[2]
        for 이름 in [x.strip() for x in 이름글.split("·")]:
            # 「A ↔ B」 꼴은 양쪽을 다 본다
            for 조각 in [y.strip() for y in 이름.split("↔")]:
                n = 몇번(글, 조각)
                if n is None:
                    continue
                이름수 += 1
                if n == 0:
                    탈.append(f"갈림 {번호} ({개념}) — 「{조각}」 이 코드에 없다")
                elif a.자세히:
                    print(f"  갈림 {번호:>2} {개념:14} {조각:28} {n:>5}번")

    # ── ㄴ) 객체가 사는 칸이 진짜 불리나
    객체 = list(줄읽기(f"{온}/객체.tsv"))
    for 칸 in 객체:
        번호, 이름, 사는곳 = 칸[0], 칸[1], 칸[2]
        for 곳 in re.split(r"[·+]", 사는곳):
            곳 = 곳.strip()
            # 「confirmed_orders.partInfoMap (문서 안)」 → 앞 토막만 본다
            바탕 = re.sub(r"\s*\(.*", "", 곳).split(".")[0].strip()
            if not 바탕 or NOT_A_NAME.match(바탕) or "/" in 바탕:
                continue
            # 칸 이름꼴인 것만 맞댄다 (프로그램 이름·설명은 건너뛴다)
            if not re.match(r"^[a-z][a-z0-9_]*$|^[가-힣]+$", 바탕):
                continue
            if 바탕 in 칸들:
                if a.자세히:
                    print(f"  객체 {번호:>2} {이름:12} 칸 {바탕} ✓")
            elif 몇번(글, 바탕) == 0:
                탈.append(f"객체 {번호} ({이름}) — 사는 곳 「{바탕}」 이 코드에 없다")

    # ── ㄷ) 셈
    print()
    print(f"객체           {len(객체)} 가지")
    print(f"이름 갈린 자리  {len(갈림)} 군데  (적어 둔 이름 {이름수} 개)")
    print(f"코드가 부르는 칸 {len(칸들)} 가지")
    급함3 = [c for c in 갈림 if len(c) > 4 and c[4] == "3"]
    print(f"급한 자리(급함 3) {len(급함3)} 군데 — "
          + " · ".join(c[1] for c in 급함3))

    if 탈:
        print()
        for t in 탈:
            print(f"⚠ {t}")
        print(f"\n{len(탈)} 군데가 코드와 어긋난다 — 표를 고쳐라")
        raise SystemExit(1)
    print("\n표에 적은 이름·칸이 모두 코드에 있다")


if __name__ == "__main__":
    main()
