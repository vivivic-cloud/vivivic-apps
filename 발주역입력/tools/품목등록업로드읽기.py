#!/usr/bin/env python3
"""「품목등록test서버용」 엑셀(드라이브 `관리프로그램/발주역입력/업체별단품/TalkFile_품목등록test서버용1116-2.xlsx.xlsx`)의
시트 「품목등록업로드」 를 그대로 → 창고(Firestore) 발주역입력_품목등록업로드 / 목록 문서 하나.

쓰는 법:
  python3 발주역입력/tools/품목등록업로드읽기.py "<엑셀>"          # 읽고 창고에 씀
  python3 발주역입력/tools/품목등록업로드읽기.py "<엑셀>" --안씀   # 셈만 본다
openpyxl 이 있어야 한다. 엑셀은 읽기만 한다(read_only).

시트 꼴(11-18 판): 1행 = 시트 제목, 2행 = 머리 줄(A~AY 51칸: 품명 · 품번 · 규격 · … · 기본구매처 · … · 모품목(상위 품번) · 투입수량 · 재단률 · 합판코드 · 필름코드 · 필름 소요량(M)),
  3행부터 자료(빈 줄은 뺀다). 칸 수 = 머리 줄의 마지막 이름 있는 칸까지.
"""
import sys, os, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from 업체별단품읽기 import 값, 쓰기 as _쓰기
import 업체별단품읽기 as 다리
import openpyxl

창고 = 'artifacts/vivivic-4b7ef/public/data/발주역입력_품목등록업로드'
시트 = '품목등록업로드'


def 읽기(경로):
    wb = openpyxl.load_workbook(경로, read_only=True, data_only=True)
    R = [list(r) for r in wb[시트].iter_rows(values_only=True)]
    머리 = R[1]
    n = max(i for i, v in enumerate(머리) if v is not None and str(v).strip()) + 1
    칸 = [str(v) if v is not None else '' for v in 머리[:n]]
    줄 = []
    for i, r in enumerate(R[2:], start=3):
        r = (r + [None] * n)[:n]
        if any(v is not None and str(v).strip() != '' for v in r):
            줄.append({'행': i, 'v': [값(v) for v in r]})
    return 칸, 줄


def main():
    if len(sys.argv) < 2: print(__doc__); sys.exit(1)
    칸, 줄 = 읽기(sys.argv[1])
    print(f'칸 {len(칸)} · 줄 {len(줄)} (행 {줄[0]["행"]}~{줄[-1]["행"]})')
    if '--안씀' in sys.argv: return
    다리.창고 = 창고
    _쓰기({'목록': {'칸': 칸, '줄': 줄, '파일': os.path.basename(sys.argv[1]), '시트': 시트,
                  '읽은날': datetime.date.today().isoformat()}})
    print('창고에 씀:', 창고 + '/목록')


if __name__ == '__main__':
    main()
