#!/usr/bin/env python3
"""적어 둔 것을 **코드에 대고 다시 잰다.** 표가 썩지 않게 하는 연장이다.

무엇을 재나
  ㄱ) `이름갈림.tsv` 에 적은 **이름이 진짜 코드에 있나**
  ㄴ) `객체.tsv` 에 적은 **칸이 진짜 코드에서 불리나** (칸세기.py 와 맞대 본다)
  ㄷ) `못이음.tsv` 에 적은 **짝이 진짜 그 됨(이어짐·반쯤·안됨)인지** (이음세기.py 와 맞대 본다)
  ㄷ-2) `화베실측.tsv` 의 칸이 **코드가 부르는 칸과 아귀가 맞는지**
       — 받아 적은 표라 **베껴 적다 틀릴 수 있다.** 양쪽을 다 본다:
         코드엔 있는데 실측 표에 없는 칸 / 실측 표엔 있는데 코드가 안 부르는 칸
  ㄹ) 셈을 찍는다 — 객체 몇 가지 · 갈린 자리 몇 군데 · 못 이어진 짝 몇 쌍

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
            # 표마다 머리줄이 다르다 — 못이음·객체·이름갈림은 「번호」, 화베실측은 「칸」
            if 칸 and 칸[0] in ("번호", "칸"):
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


def 이음():
    """이음세기.py 가 세어 준 **이어진 짝**. {(집,집): 무엇으로} 꼴."""
    글 = subprocess.run([sys.executable, "-I", f"{HERE}/이음세기.py"],
                        capture_output=True, text=True, check=True).stdout
    밖 = {}
    for 줄 in 글.splitlines():
        m = re.match(r"^\s{2}(\S+) ↔ (\S+)\s+(.+)$", 줄)
        if m:
            밖[tuple(sorted((m.group(1), m.group(2))))] = m.group(3).strip()
    return 밖


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

    # ── ㄷ) 못이음.tsv 의 됨이 잰 값과 맞나
    짝표 = list(줄읽기(f"{온}/못이음.tsv"))
    이어진 = 이음()
    for 칸 in 짝표:
        번호, 짝글, 됨 = 칸[0], 칸[1], 칸[2]
        집들 = [x.strip() for x in 짝글.split("↔")]
        if len(집들) != 2 or "·" in 집들[1] or 집들[1] == "아무 집":
            continue                      # 여럿을 한 줄에 적은 것은 손으로 본다
        키 = tuple(sorted(집들))
        있나 = 키 in 이어진
        if 됨 == "안됨" and 있나:
            탈.append(f"못이음 {번호} ({짝글}) — 「안됨」 이라 적었는데 "
                      f"실제로 이어져 있다: {이어진[키]}")
        if 됨 in ("이어짐", "반쯤") and not 있나:
            탈.append(f"못이음 {번호} ({짝글}) — 「{됨}」 이라 적었는데 "
                      f"이은 자리가 하나도 없다")
        if a.자세히:
            print(f"  못이음 {번호:>2} {짝글:28} {됨:4} "
                  f"{'(이어져 있다)' if 있나 else '(이은 자리 없음)'}")

    # ── ㄷ-2) 화베실측.tsv 가 코드와 아귀가 맞나
    실측 = list(줄읽기(f"{온}/화베실측.tsv"))
    실측칸 = {c[0] for c in 실측}
    for 이름 in sorted(칸들 - 실측칸):
        탈.append(f"화베실측 — 코드는 「{이름}」 을 부르는데 실측 표에 그 줄이 없다")
    for 이름 in sorted(실측칸 - 칸들):
        탈.append(f"화베실측 — 표에 「{이름}」 이 있는데 코드가 안 부른다")
    잰것 = [c for c in 실측 if len(c) > 1 and c[1] not in ("?", "")]
    못읽은 = [c for c in 실측 if len(c) > 1 and c[1] == "?"]
    빈것 = [c for c in 실측 if len(c) > 1 and c[1] == "0"]

    # ── ㄹ) 셈
    print()
    print(f"객체           {len(객체)} 가지")
    print(f"이름 갈린 자리  {len(갈림)} 군데  (적어 둔 이름 {이름수} 개)")
    print(f"코드가 부르는 칸 {len(칸들)} 가지")
    여럿 = sum(1 for c in 객체 if len(c) > 4 and c[4] != "(없다)"
               and len(c[4].split("·")) >= 2)
    print(f"  그중 **두 집 이상을 잇는 객체** {여럿} 가지 "
          f"(나머지 {len(객체) - 여럿} 가지는 한 집 안에만 있다 — 뒤로 미룬다)")
    print(f"산 화베 실측     {len(잰것)} 칸 (바이글이 10-12 에 쟀다) "
          f"· 아직 못 잰 칸 {len(못읽은)}")
    print(f"  그중 **줄이 0 인 칸** {len(빈것)} — "
          + " · ".join(c[0] for c in 빈것))
    print(f"이어진 짝       {len(이어진)} 쌍 / 있을 수 있는 짝 105 쌍")
    못 = [c for c in 짝표 if len(c) > 2 and c[2] == "안됨"]
    반 = [c for c in 짝표 if len(c) > 2 and c[2] == "반쯤"]
    print(f"못 이어진 짝     {len(못)} 줄 · 반쯤 이어진 짝 {len(반)} 줄 "
          f"(`못이음.tsv` 에 적은 것)")
    값3 = [c for c in 짝표 if len(c) > 3 and c[3] == "3"]
    print(f"이으면 바로 쓰실 것(값 3) {len(값3)} 줄 — "
          + " · ".join(c[1] for c in 값3))
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
