#!/usr/bin/env python3
"""화베(파이어스토어) **칸 이름**을 네 저장소 코드에서 긁어 센다. 추측 없음 — 코드에 적힌 것만.

집집마다 칸을 부르는 꼴이 달라서, 꼴을 다섯 가지로 잡는다.

  꼴1  collection(db,'artifacts',appId,'public','data','칸')    인자 줄줄이
  꼴2  ['artifacts', …, 'public', 'data', '칸']                  배열로 적은 자리
  꼴3  .../public/data/칸                                        REST·템플릿 주소
  꼴4  감싸개('칸')         — 그 파일이 **제 손으로 지은** 감싸개만
  꼴5  감싸개(FILES)        — 이름이 딴 데 `const FILES = 'docs_files'` 로 적힌 것

⚠ 꼴4·꼴5의 **감싸개 이름은 박아 두지 않는다.** 파일마다
  「collection( 을 부르는 화살표 함수」 를 찾아 그 이름을 쓴다.
  cabinet-studio·기계배치도에도 `칸(` 가 있지만 거기 「칸」 은 **선반 칸·자리**다 —
  파이어스토어와 상관이 없어서, 감싸개를 제 손으로 지은 파일에서만 꼴4를 켠다.
  (처음엔 `칸(` 를 통째로 잡아 cabinet-studio 의 「상판유격」·「이동선반」 같은
   가구 낱말 40여 개가 칸으로 잘못 올라왔다. 2026-10-12 에 겪음.)

⚠⚠ 이것은 **코드가 부르는 칸**이다. 산 화베에 그 칸이 **진짜 있는지는 못 잰다**
  — 이 판에서 산 화베 읽기는 자동 승인기가 막는다(「Production Reads」).
  진짜 줄 수가 필요하면 `화베읽기.py` 를 사장님 폰·관리자 쪽에서 돌려야 한다.

쓰기
  python3 -I 온톨로지/tools/칸세기.py                   칸마다 어느 프로그램이 부르나
  python3 -I 온톨로지/tools/칸세기.py --어디 wo_pallet   그 칸을 부르는 파일·줄
"""
import argparse
import collections
import os
import re

ROOTS = {
    "apps": "/home/user/vivivic-apps",
    "viggle": "/home/user/vivivic-cloud/viggle",
    "cabinet": "/home/user/vivivic-cloud/cabinet-studio",
    "docs": "/home/user/vivivic-cloud/vivivic-docs",
}
TAKE = (".html", ".js", ".mjs", ".py", ".gs")
# 시험·그림·만들어진 것·남의 꾸러미·내 연장은 뺀다
SKIP = re.compile(r"(/\.git/|/shots/|/node_modules/|/vendor/|\.min\.js$"
                  r"|package-lock|/dist/|/docs/index\.html$|/온톨로지/|/tests?/)")

Q = "[\"'`]"
NAME = r"[A-Za-z_$가-힣][\w$가-힣]*"

# 칸 이름으로 받아 줄 꼴 — 빈칸·가름표·틀글자가 없는 한 토막
OK = re.compile(r"^[A-Za-z0-9_가-힣.~-]{2,40}$")

PAT_ARG = re.compile(rf"{Q}data{Q}\s*,\s*{Q}([^\"'`/]+?){Q}", re.S)
# 꼴1ㄴ: `'data', 자국칸이름` — 칸 이름을 **딴 줄에 적어 둔** 자리
PAT_ARG_ID = re.compile(rf"{Q}data{Q}\s*,\s*({NAME})", re.S)
PAT_URL = re.compile(r"public/data/([^\"'`/ ?)&,\]]+)")

# 감싸개 — 칸 이름을 인자로 받아 collection( 을 부르는 함수. 이름은 집집마다 다르다.
#   꼴ㄱ  const 칸 = (이름, id) => … collection( …
#   꼴ㄴ  async function 말넣기(이름, id, 말){ … 칸(이름 …
PAT_WRAP = re.compile(
    rf"(?:const|let|var)\s+({NAME})\s*=\s*"
    rf"(?:async\s*)?\(?\s*{NAME}\s*(?:,[^)]*)?\)?\s*=>"
    r"[^;]{0,240}?collection\(",
    re.S)
PAT_FN = re.compile(
    rf"(?:async\s+)?function\s+({NAME})\s*\([^)]*\)\s*\{{([^}}]{{0,400}})",
    re.S)
# 이름을 딴 데 적어 둔 것 — `const FILES = 'docs_files'`
PAT_CONST = re.compile(rf"(?:const|let|var)\s+({NAME})\s*=\s*{Q}([^\"'`]+?){Q}")
# 꼴5로 풀어 줄 이름 — 큰글자 상수만 (FILES·OVERLAY·CONFIG·WT·RULES)
# 큰글자로 시작하는 상수. `VP_상품` 처럼 뒤에 한글이 붙은 것도 받는다
PAT_UPPER = re.compile(r"^[A-Z][A-Z0-9_가-힣]{1,30}$")


def 파일들():
    for 뿌리 in ROOTS.values():
        for d, _, fs in os.walk(뿌리):
            if "/.git" in d:
                continue
            for n in fs:
                p = os.path.join(d, n)
                if n.endswith(TAKE) and not SKIP.search(p):
                    yield p


def 어느집(p):
    """apps 안은 프로그램 폴더까지 쪼갠다 — 어느 프로그램이 부르는지 봐야 한다."""
    r = p.replace("/home/user/vivivic-apps/", "")
    if r != p:
        뭉치 = r.split("/")[0]
        return 뭉치 if "." not in 뭉치 else "(apps뿌리)"
    return p.replace("/home/user/vivivic-cloud/", "").split("/")[0]


def 한파일(글):
    """그 파일 안의 `const X = '글'` 을 모은다. 이름이 뭐든 받는다 —
    같은 파일 안이면 어긋날 일이 없다."""
    표 = {}
    for m in PAT_CONST.finditer(글):
        표.setdefault(m.group(1), set()).add(m.group(2))
    return 표


def 이름표():
    """네 저장소를 통째로 훑어 **큰글자 상수만** 모은다.
    `export const FILES = 'docs_files'` 처럼 딴 파일에 적힌 것을 풀기 위함이다.
    ⚠ 큰글자만 받는다. `이름`·`name` 같은 **받는 인자**까지 풀면 가짜가 생긴다 —
      에이엠티의 `const 이름 = 'amtcad'+번호` 가 viggle 의 `칸(이름, …)` 에 붙어
      `amtcad` 라는 없는 칸이 올라왔다 (2026-10-12 에 겪음)."""
    표 = {}
    for p in 파일들():
        try:
            글 = open(p, encoding="utf-8", errors="replace").read()
        except OSError:
            continue
        for m in PAT_CONST.finditer(글):
            if PAT_UPPER.match(m.group(1)):
                표.setdefault(m.group(1), set()).add(m.group(2))
    return 표


def 센다():
    상수 = 이름표()
    표 = collections.defaultdict(lambda: collections.defaultdict(int))
    자리 = collections.defaultdict(list)

    def 담기(칸, p, i):
        칸 = 칸.strip()
        if not OK.match(칸):
            return
        표[칸][어느집(p)] += 1
        자리[칸].append(f"{p.split('/home/user/')[-1]}:{i}")

    for p in 파일들():
        try:
            글 = open(p, encoding="utf-8", errors="replace").read()
        except OSError:
            continue

        제것 = 한파일(글)          # 같은 파일에 적힌 이름 (먼저 본다)

        def 풀기(이름):
            """이름 하나를 칸 이름들로 푼다. 같은 파일 → 큰글자 상수 순."""
            if 이름 in 제것:
                return 제것[이름]
            if PAT_UPPER.match(이름) and 이름 in 상수:
                return 상수[이름]
            return ()

        # 이 파일이 제 손으로 지은 감싸개 이름들 (꼴4·꼴5를 켤 열쇠)
        감싸개 = {m.group(1) for m in PAT_WRAP.finditer(글)}
        # 그 감싸개를 몸통에서 부르는 함수도 감싸개다 (viggle 의 말넣기·말받기)
        for m in PAT_FN.finditer(글):
            몸 = m.group(2)
            if "collection(" in 몸 or any(
                    re.search(rf"(?<![\w$가-힣]){re.escape(w)}\(", 몸) for w in 감싸개):
                감싸개.add(m.group(1))
        꼴45 = [
            re.compile(rf"(?<![\w$가-힣])(?:{'|'.join(map(re.escape, 감싸개))})"
                       rf"\(\s*(?:{Q}([^\"'`/]+?){Q}|({NAME}))")
        ] if 감싸개 else []

        # 글자 자리 -> 줄 번호
        줄머리 = [0]
        for 줄 in 글.splitlines(True):
            줄머리.append(줄머리[-1] + len(줄))

        def 줄번호(자리):
            lo, hi = 0, len(줄머리) - 1
            while lo < hi - 1:
                mid = (lo + hi) // 2
                if 줄머리[mid] <= 자리:
                    lo = mid
                else:
                    hi = mid
            return lo + 1

        for m in PAT_ARG.finditer(글):
            담기(m.group(1), p, 줄번호(m.start()))
        for m in PAT_ARG_ID.finditer(글):
            for v in 풀기(m.group(1)):
                담기(v, p, 줄번호(m.start()))
        for m in PAT_URL.finditer(글):
            담기(m.group(1), p, 줄번호(m.start()))
        for pat in 꼴45:
            for m in pat.finditer(글):
                글자, 이름 = m.group(1), m.group(2)
                if 글자:                       # 꼴4 — 바로 적힌 이름
                    담기(글자, p, 줄번호(m.start()))
                elif 이름:                     # 꼴5 — 딴 줄에 적어 둔 이름
                    for v in 풀기(이름):
                        담기(v, p, 줄번호(m.start()))
    return 표, 자리


def main():
    ap = argparse.ArgumentParser(add_help=False)
    ap.add_argument("--어디")
    ap.add_argument("-h", "--help", action="store_true")
    a = ap.parse_args()
    if a.help:
        print(__doc__)
        return

    표, 자리 = 센다()
    if a.어디:
        for s in 자리.get(a.어디, []):
            print(s)
        if a.어디 not in 자리:
            print(f"(코드에 {a.어디} 를 부르는 자리가 없다)")
        return

    print(f"# 코드가 부르는 칸 {len(표)} 가지 — 산 화베에 진짜 있는지는 이 판에서 못 잰다")
    print(f"{'칸':24} {'집':>2}  부르는 프로그램들")
    for 칸, 집들 in sorted(표.items(), key=lambda t: (-len(t[1]), t[0])):
        줄 = " ".join(f"{k}({v})" for k, v in
                      sorted(집들.items(), key=lambda t: (-t[1], t[0])))
        print(f"{칸:24} {len(집들):>2}  {줄}")


if __name__ == "__main__":
    main()
