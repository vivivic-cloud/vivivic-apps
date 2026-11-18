#!/usr/bin/env python3
"""「업체별단품명」 엑셀(드라이브 `관리프로그램/발주역입력/업체별단품/TalkFile_업체별단품명.xlsx.xlsx`, 사장님이 11-18 A열에 업체를 적은 판)의
보이는 시트 「업체별단품코드」 를 **A열 업체 표시** 로 나눠 → 창고(Firestore) 발주역입력_업체별단품 에 업체마다 문서 하나 + `_업체목록`.

쓰는 법:
  python3 발주역입력/tools/업체별단품읽기.py "<엑셀>"          # 읽고 창고에 씀
  python3 발주역입력/tools/업체별단품읽기.py "<엑셀>" --안씀   # 셈만 본다
openpyxl 이 있어야 한다. 엑셀은 읽기만 한다(read_only).

시트 꼴(11-18 판): A열 = 업체 이름 — 그 업체 구간의 **첫 자료 줄에만** 적혀 있다(조혼가구 6행 · 유한가구 108 · 럭스디자인 132 · 아인가구 145 · 본사 199).
  한 업체 = 그 A열 표시 줄부터 다음 표시 줄 앞까지. 그 안의 다음 업체 제목·기준일·머리 줄(단품코드 칸이 「단품코드」 이거나 빈 줄)은 뺀다.
  머리 = 각 구간 바로 위의 머리 줄(B~O, 14칸: no · 품목등록 · 매입처 · 단품코드 · 단품명 · (빈 머리) · 분류명 · 코드1차등록여부 · 최종수정여부 · 비고 ·
  사용합판코드 · 사용필름코드 · 예외… 두 칸 — 조혼가구 구간만 「예외부속코드(매칭필름코드)·(매칭원자재코드)」, 나머지는 「예외합판코드·예외필름코드」). P열부터는 옆 표 — 안 읽는다.
  ⚠ 11-18 v1.1.0 부터 `뺄칸` 이름(코드1차등록여부~예외부속코드 두 칸, 7개)은 빼고 창고에 넣는다.
  ⚠ 매입처(D열)는 업체와 다를 수 있다(조혼가구 구간에 본사-D공장·B공장 12줄 등) — 나누는 기준은 A열뿐.
"""
import sys, os, re, json, urllib.request, urllib.error, datetime
import openpyxl

창고 = 'artifacts/vivivic-4b7ef/public/data/발주역입력_업체별단품'
시트 = '업체별단품코드'
첫칸, 끝칸 = 1, 15   # B~O (0부터 셈)
# 사장님 11-18(v1.1.0): 이 이름의 칸은 빼고 창고에 넣는다(이름이 다른 칸 — 예외합판코드·예외필름코드 — 은 남긴다).
뺄칸 = {'코드1차등록여부', '최종수정여부', '비고', '사용합판코드', '사용필름코드',
        '예외부속코드(매칭필름코드)', '예외부속코드(매칭원자재코드)'}


def 값(v):
    if v is None: return None
    if isinstance(v, float) and v.is_integer(): return int(v)
    if isinstance(v, (int, float)): return v
    return str(v)


def 읽기(경로):
    wb = openpyxl.load_workbook(경로, read_only=True, data_only=True)
    R = [list(r) + [None] * 16 for r in wb[시트].iter_rows(values_only=True)]
    표시 = [(i, str(r[0]).strip()) for i, r in enumerate(R) if r[0] is not None and str(r[0]).strip()]
    끝 = max(i for i, r in enumerate(R) if any(v is not None for v in r[1:끝칸])) + 1
    업체들 = []
    for k, (i, 이름) in enumerate(표시):
        j = 표시[k + 1][0] if k + 1 < len(표시) else 끝
        머리 = next(R[h] for h in range(i - 1, -1, -1) if R[h][1] == 'no')
        칸 = ['' if v is None else str(v) for v in 머리[첫칸:끝칸]]
        줄 = [{'행': n + 1, 'v': [값(v) for v in R[n][첫칸:끝칸]]}
              for n in range(i, j) if R[n][4] is not None and R[n][4] != '단품코드' and R[n][1] != 'no']
        남김 = [c for c, k in enumerate(칸) if k not in 뺄칸]
        칸 = [칸[c] for c in 남김]
        for r in 줄: r['v'] = [r['v'][c] for c in 남김]
        업체들.append({'업체': 이름, '차례': k, '칸': 칸, '줄': 줄})
    return 업체들


# ───────── 창고(Firestore REST) — 로앤출고읽기.py 와 같은 길(익명 로그인) ─────────
def 값싸기(v):
    if v is None: return {'nullValue': None}
    if isinstance(v, bool): return {'booleanValue': v}
    if isinstance(v, int): return {'integerValue': str(v)}
    if isinstance(v, float): return {'doubleValue': v}
    if isinstance(v, dict): return {'mapValue': {'fields': {k: 값싸기(x) for k, x in v.items()}}}
    if isinstance(v, list): return {'arrayValue': {'values': [값싸기(x) for x in v]}}
    return {'stringValue': str(v)}


def 부름(url, body=None, 토큰=None):
    h = {'content-type': 'application/json'}
    if 토큰: h['Authorization'] = 'Bearer ' + 토큰
    req = urllib.request.Request(url, data=None if body is None else json.dumps(body).encode(), headers=h,
                                 method='POST' if body is not None else 'GET')
    try:
        with urllib.request.urlopen(req, timeout=60) as res:
            return json.loads(res.read() or b'{}')
    except urllib.error.HTTPError as e:
        raise RuntimeError(f'{e.code} {e.read().decode()[:300]}')


def 쓰기(문서들):
    html = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '재단.html'), encoding='utf-8').read()
    key = re.search(r'apiKey:\s*"([^"]+)"', html).group(1)
    토큰 = 부름(f'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={key}', {'returnSecureToken': True})['idToken']
    뿌리 = 'projects/vivivic-4b7ef/databases/(default)/documents'
    ws = [{'update': {'name': f'{뿌리}/{창고}/{n}', 'fields': {k: 값싸기(v) for k, v in d.items()}}} for n, d in 문서들.items()]
    for i in range(0, len(ws), 3):
        부름(f'https://firestore.googleapis.com/v1/{뿌리}:commit', {'writes': ws[i:i + 3]}, 토큰)


def main():
    if len(sys.argv) < 2: print(__doc__); sys.exit(1)
    업체들 = 읽기(sys.argv[1])
    for u in 업체들:
        print(f"{u['업체']} 줄 {len(u['줄'])} (행 {u['줄'][0]['행']}~{u['줄'][-1]['행']}) · 칸 {u['칸'][-2:]}")
    if '--안씀' in sys.argv: return
    문서들 = {u['업체'].replace('/', '／'): u for u in 업체들}
    문서들['_업체목록'] = {'업체들': [u['업체'] for u in 업체들], '파일': os.path.basename(sys.argv[1]),
                       '시트': 시트, '읽은날': datetime.date.today().isoformat()}
    쓰기(문서들)
    print('창고에 씀:', 창고, list(문서들))


if __name__ == '__main__':
    main()
