#!/usr/bin/env python3
"""「업체별단품명.조립」 엑셀(드라이브 `관리프로그램/발주역입력/업체별단품/TalkFile_업체별단품명.조립.xlsx.xlsx`)의
보이는 시트 「업체별단품코드」 에서 단품코드(C)별 K「조립비(VAT포함)」·L「철물비(VAT포함)」 → 창고 발주역입력_업체별단품단가/단가.
(사장님 11-24 「합계도 보여주고 별도 조립 철물 단가도 보여줘」 — 업체별단품.html v1.6.0 이 읽음)

쓰는 법:
  python3 발주역입력/tools/업체별단품단가읽기.py "<엑셀>"          # 읽고 창고에 씀
  python3 발주역입력/tools/업체별단품단가읽기.py "<엑셀>" --안씀   # 셈만
openpyxl 필요. 엑셀은 읽기만(read_only). ⚠ 금액은 창고에만 — 저장소(공개)에 값을 적지 마라.
시트 꼴(11-24 판): 머리 5행(A no · B 매입처 · C 단품코드 · D 단품명 · … · K 조립비(VAT포함) · L 철물비(VAT포함)), 중간에 머리 줄(B = 「매입처」)이 업체마다 되풀이 → 뺌.
E~H·M·N 숨은 열·I·J(VAT별도)는 안 씀. 단품코드 앞뒤 빈칸 뗌. 값 없는 칸 = null.
"""
import sys, os, datetime
import openpyxl
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from 업체별단품읽기 import 쓰기 as _쓰기, 부름, 값싸기  # 같은 길(익명 로그인 REST)
import 업체별단품읽기 as 길

창고 = 'artifacts/vivivic-4b7ef/public/data/발주역입력_업체별단품단가'
시트 = '업체별단품코드'


def 수(v):
    if v is None or (isinstance(v, str) and not v.strip()): return None
    if isinstance(v, (int, float)): return v
    try: return float(str(v).replace(',', ''))
    except ValueError: return None


def 읽기(경로):
    wb = openpyxl.load_workbook(경로, read_only=True, data_only=True)
    R = [list(r) + [None] * 14 for r in wb[시트].iter_rows(values_only=True)]
    머리 = R[4]
    assert 머리[2] == '단품코드' and str(머리[10]).startswith('조립비') and str(머리[11]).startswith('철물비'), 머리[:12]
    줄 = []
    for r in R[5:]:
        if r[2] is None or r[1] == '매입처' or str(r[2]).strip() in ('', '단품코드'): continue
        줄.append({'c': str(r[2]).strip(), 'k': 수(r[10]), 'l': 수(r[11])})
    return {'칸': [str(머리[10]), str(머리[11])], '줄': 줄}


def main():
    if len(sys.argv) < 2: print(__doc__); sys.exit(1)
    d = 읽기(sys.argv[1])
    print('줄', len(d['줄']), '· 코드', len({x['c'] for x in d['줄']}), '· K 있음', sum(x['k'] is not None for x in d['줄']), '· L 있음', sum(x['l'] is not None for x in d['줄']), '· 칸', d['칸'])
    if '--안씀' in sys.argv: return
    d['파일'] = os.path.basename(sys.argv[1]); d['시트'] = 시트; d['읽은날'] = datetime.date.today().isoformat()
    길.창고 = 창고
    _쓰기({'단가': d})
    print('창고에 씀:', 창고 + '/단가')


if __name__ == '__main__':
    main()
