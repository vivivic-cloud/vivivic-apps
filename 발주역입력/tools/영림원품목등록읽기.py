#!/usr/bin/env python3
"""「품목등록test서버용」 엑셀(드라이브 `관리프로그램/발주역입력/업체별단품/TalkFile_품목등록test서버용1116-2.xlsx.xlsx`)의
시트 셋(품목등록업로드 · BOM등록업로드 · 원부자재)을 그대로 → 창고(Firestore) 발주역입력_영림원품목등록.

쓰는 법:
  python3 발주역입력/tools/영림원품목등록읽기.py "<엑셀>"          # 읽고 창고에 씀
  python3 발주역입력/tools/영림원품목등록읽기.py "<엑셀>" --안씀   # 셈만 본다
openpyxl 이 있어야 한다(python3 -I 로는 못 찾음). 엑셀은 읽기만 한다(read_only).

시트 꼴(11-18 판): 1행 = 시트 제목, 2행 = 머리 줄, 3행부터 자료(빈 줄은 뺀다). 칸 수 = 머리 줄의 마지막 이름 있는 칸까지.
창고 문서:
  _시트목록            = {시트들: [{이름, 칸, 줄수, 조각}], 파일, 읽은날}   — 시트 차례 = 엑셀 차례
  {시트이름}_{1..조각}  = {줄: [{행, v}]}                              — 문서 한도 1MB 라 줄을 조각(≤ 약 500KB)으로 나눔
(11-18 v1.0 의 발주역입력_품목등록업로드/목록 은 옛 자리 — 쪽은 더 읽지 않는다.)
"""
import sys, os, json, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from 업체별단품읽기 import 값, 쓰기 as _쓰기
import 업체별단품읽기 as 다리
import openpyxl

창고 = 'artifacts/vivivic-4b7ef/public/data/발주역입력_영림원품목등록'
조각한도 = 500_000   # 바이트(JSON 길이로 어림)


def 시트읽기(ws):
    R = [list(r) for r in ws.iter_rows(values_only=True)]
    머리 = R[1]
    n = max(i for i, v in enumerate(머리) if v is not None and str(v).strip()) + 1
    칸 = [str(v) if v is not None else '' for v in 머리[:n]]
    줄 = []
    for i, r in enumerate(R[2:], start=3):
        r = (r + [None] * n)[:n]
        if any(v is not None and str(v).strip() != '' for v in r):
            줄.append({'행': i, 'v': [값(v) for v in r]})
    return 칸, 줄


def 조각내기(줄):
    조각, 지금, 크기 = [], [], 0
    for r in 줄:
        b = len(json.dumps(r, ensure_ascii=False).encode())
        if 지금 and 크기 + b > 조각한도:
            조각.append(지금); 지금, 크기 = [], 0
        지금.append(r); 크기 += b
    if 지금: 조각.append(지금)
    return 조각


def main():
    if len(sys.argv) < 2: print(__doc__); sys.exit(1)
    wb = openpyxl.load_workbook(sys.argv[1], read_only=True, data_only=True)
    문서들, 목록 = {}, []
    for 이름 in wb.sheetnames:
        칸, 줄 = 시트읽기(wb[이름])
        조각 = 조각내기(줄)
        print(f'{이름}: 칸 {len(칸)} · 줄 {len(줄)} (행 {줄[0]["행"]}~{줄[-1]["행"]}) · 조각 {len(조각)}')
        목록.append({'이름': 이름, '칸': 칸, '줄수': len(줄), '조각': len(조각)})
        for k, c in enumerate(조각, start=1):
            문서들[f'{이름.replace("/", "／")}_{k}'] = {'줄': c}
    if '--안씀' in sys.argv: return
    문서들['_시트목록'] = {'시트들': 목록, '파일': os.path.basename(sys.argv[1]),
                       '읽은날': datetime.date.today().isoformat()}
    다리.창고 = 창고
    _쓰기(문서들)
    print('창고에 씀:', 창고, list(문서들))


if __name__ == '__main__':
    main()
