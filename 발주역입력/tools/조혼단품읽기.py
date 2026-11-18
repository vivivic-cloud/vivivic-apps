#!/usr/bin/env python3
"""「업체별단품명」 엑셀(드라이브 `관리프로그램/발주역입력/TalkFile_업체별단품명.xlsx.xlsx`, 카톡 받은 것)에서
보이는 시트 「업체별단품코드」 의 매입처 칸이 「조혼가구」 인 줄만 → 창고(Firestore) 발주역입력_조혼단품/목록 문서 하나.

쓰는 법:
  python3 발주역입력/tools/조혼단품읽기.py "<드라이브 …/TalkFile_업체별단품명.xlsx.xlsx>"          # 읽고 창고에 씀
  python3 발주역입력/tools/조혼단품읽기.py "<엑셀>" --안씀                                             # 셈만 본다
openpyxl 이 있어야 한다. 엑셀은 읽기만 한다(read_only).

시트 꼴: 5행 머리(no · 품목등록 · 매입처 · 단품코드 · 단품명 · (빈 머리) · 분류명 · 코드1차등록여부 · 최종수정여부 · 비고 ·
사용합판코드 · 사용필름코드 · 예외부속코드(매칭필름코드) · 예외부속코드(매칭원자재코드)) = A~N. P열부터는 옆 표(부속 규칙표 등) — 안 읽는다.
업체별로 블록이 위아래로 이어진다(조혼가구 · 유한가구 · 럭스디자인 · 아인가구 · 본사생산). 조혼가구 줄은 첫 블록(6~97행) 84줄.
⚠ 「A열」 은 no(번호)다 — 업체는 C열 「매입처」. 값이 정확히 「조혼가구」 인 줄만(「생산처:조혼/…」 같은 비고 줄은 넣지 않음).
"""
import sys, os, re, json, urllib.request, urllib.error, datetime
import openpyxl

창고 = 'artifacts/vivivic-4b7ef/public/data/발주역입력_조혼단품'
시트 = '업체별단품코드'
머리행 = 5
끝칸 = 14   # A~N


def 읽기(경로):
    wb = openpyxl.load_workbook(경로, read_only=True, data_only=True)
    ws = wb[시트]
    칸, 줄 = None, []
    for i, r in enumerate(ws.iter_rows(values_only=True), 1):
        r = list(r[:끝칸]) + [None] * max(0, 끝칸 - len(r))
        if i == 머리행:
            칸 = ['' if v is None else str(v) for v in r]
            continue
        if i > 머리행 and r[2] == '조혼가구':
            줄.append({'행': i, 'v': [None if v is None else (v if isinstance(v, (int, float)) else str(v)) for v in r]})
    return {'파일': os.path.basename(경로), '시트': 시트, '칸': 칸, '줄': 줄, '읽은날': datetime.date.today().isoformat()}


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


def 쓰기(문서):
    html = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '재단.html'), encoding='utf-8').read()
    key = re.search(r'apiKey:\s*"([^"]+)"', html).group(1)
    토큰 = 부름(f'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={key}', {'returnSecureToken': True})['idToken']
    뿌리 = 'projects/vivivic-4b7ef/databases/(default)/documents'
    부름(f'https://firestore.googleapis.com/v1/{뿌리}:commit',
         {'writes': [{'update': {'name': f'{뿌리}/{창고}/목록', 'fields': {k: 값싸기(v) for k, v in 문서.items()}}}]}, 토큰)


def main():
    if len(sys.argv) < 2: print(__doc__); sys.exit(1)
    d = 읽기(sys.argv[1])
    print(f"{d['시트']} 칸 {len(d['칸'])} {d['칸']} · 조혼가구 줄 {len(d['줄'])} (행 {d['줄'][0]['행']}~{d['줄'][-1]['행']})")
    if '--안씀' in sys.argv: return
    쓰기(d)
    print('창고에 씀:', 창고 + '/목록')


if __name__ == '__main__':
    main()
