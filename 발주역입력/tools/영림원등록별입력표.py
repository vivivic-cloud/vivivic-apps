#!/usr/bin/env python3
# 영림원 등록별 입력표 — 영림원품목등록.html 화면 표 값(뽑기 js 의 JSON)으로 등록 단계마다 엑셀 하나씩 만든다(구글 드라이브에 올려 구글시트로 바꿈).
# 단계 차례 = 11-01~11-05 T알렉스 4제품이 실제 거친 차례(영림원외주입력/보관/작업일지/2026-10-31~11-09.md):
#   1 품목등록업로드(500259) → (자재등록 500251 원자재) → 2 BOM등록업로드(500302) → 3 품목별공정흐름유형등록(500272)
#   → 4 제품별공정별소요자재등록(500299, 525162 일괄등록 뒤 투입공정 고침) → (자재등록 500251 재공품) → 5 제품별공정별워크센터등록(500865)
# 쓰는 법: node 영림원등록별입력표-뽑기.js <data.json>  →  python3 영림원등록별입력표.py <data.json> <나갈 폴더>
# ⚠ 만든 엑셀은 업무 자료 — 저장소 밖(scratchpad)에 두고 커밋하지 않는다. 영림원·창고에 쓰지 않는다.
import json, sys, os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill
from openpyxl.comments import Comment

d = json.load(open(sys.argv[1], encoding='utf-8'))
OUT = sys.argv[2]
os.makedirs(OUT, exist_ok=True)
노랑 = PatternFill('solid', fgColor='FFF2CC')
굵게 = Font(bold=True)


def 칸(sheet, name, nth=0):
    hs = d[sheet]['hs']
    return [i for i, h in enumerate(hs) if h == name][nth]


def 머리(ws, names):
    ws.append(names)
    for c in ws[ws.max_row]: c.font = 굵게
    ws.freeze_panes = ws.cell(row=ws.max_row + 1, column=1)


def 글자칸(ws, cols, first):   # 차수 00 같은 값을 숫자로 바꾸지 않게
    for col in cols:
        for r in range(first, ws.max_row + 1):
            ws.cell(row=r, column=col).number_format = '@'


def 임시(cell, why):
    cell.fill = 노랑
    cell.comment = Comment('임시 — ' + why, '영림원 등록별 입력표')


def 너비(ws):
    for col in ws.columns:
        n = max(len(str(c.value or '')) for c in col)
        ws.column_dimensions[col[0].column_letter].width = min(max(8, n * 1.6), 60)


# 1 품목등록업로드(500259) — 영림원 칸 45개 = 품명 ~ 품목설명(화면 덧칸 공정흐름·소요량, 원본 덧칸 모품목~필름 소요량 뺌)
s = d['품목']; a, b = 칸('품목', '품명'), 칸('품목', '품목설명')
wb = Workbook(); ws = wb.active; ws.title = '품목등록업로드'
머리(ws, s['hs'][a:b + 1])
for r in s['rows']: ws.append(r[a:b + 1])
너비(ws); wb.save(f'{OUT}/1.xlsx')

# 2 BOM등록업로드(500302) — 공식 양식 RptWPDBOMMulti.xlsx 꼴(시트 BOM일괄업로드 · 1행 필드 이름 · 2행 칸 이름 · A열 순번 · 끝 하위유무) — 입력작업자/스크립트/BOM업로드-엑셀만들기.py COLS 그대로
COLS = [('IDX_NO', '순번'), ('ItemName', '모품목명'), ('ItemNo', '모품목번호'), ('ItemSpec', '모품목규격'), ('ItemBomRevName', '모품목BOM차수'), ('ItemUnitName', '모품목단위'),
        ('ProcName', '공정'), ('UserSeq', '표시순서'), ('SubItemName', '하위품명'), ('SubItemNo', '하위품번'), ('SubItemSpec', '하위규격'), ('SubItemBomRevName', '하위BOM차수'),
        ('SubUnitName', '투입단위'), ('NeedQtyNumerator', '소요량(분자)'), ('NeedQtyDenominator', '소요량(분모)'), ('IsBOMOnly', 'BOM조회용'), ('IsIncludeProcMat', '하위공정소요자재포함'),
        ('InLossRate', '사내Loss율'), ('OutLossRate', '사외Loss율'), ('FrApplyDate', '적용시작일'), ('ToApplyDate', '적용종료일'), ('Location', '조립위치'),
        ('Remark', '비고'), ('Remark1', '비고1'), ('Remark2', '비고2'), ('Remark3', '비고3'), ('Remark4', '비고4'), ('Remark5', '비고5'), ('Remark6', '비고6'), ('Remark7', '비고7'),
        ('Remark8', '비고8'), ('Remark9', '비고9'), ('Remark10', '비고10'), ('StkUnitName', '기준단위'), ('AssetName', '품목자산분류'), ('GoodSeq', '제품코드'), ('GoodBomRev', '제품BOM차수'),
        ('HaveChild', '하위유무')]
s = d['BOM']; hi = {h: i for i, h in enumerate(s['hs'])}
wb = Workbook(); ws = wb.active; ws.title = 'BOM일괄업로드'
ws.append([c[0] for c in COLS]); ws.append([c[1] for c in COLS])
for c in ws[2]: c.font = 굵게
ws.freeze_panes = 'A3'
for n, r in enumerate(s['rows'], 1):
    row = [n] + [r[hi[k]] if k in hi and r[hi[k]] != '' else None for _, k in COLS[1:]]
    ws.append(row)
글자칸(ws, [5, 12], 3)
너비(ws); wb.save(f'{OUT}/2.xlsx')

# 3 품목별공정흐름유형등록(500272) — 칸 품명·품번·규격·공정흐름유형(11-01·11-04 화면), 값 = 품목등록업로드 화면 공정흐름 칸(제품 = 조립)
s = d['품목']; f, n_, c_, sp = 칸('품목', '공정흐름'), 칸('품목', '품명'), 칸('품목', '품번'), 칸('품목', '규격')
wb = Workbook(); ws = wb.active; ws.title = '품목별공정흐름유형등록'
머리(ws, ['품명', '품번', '규격', '공정흐름유형'])
for r in s['rows']: ws.append([r[n_], r[c_], r[sp], r[f]])
너비(ws); wb.save(f'{OUT}/3.xlsx')

# 4 제품별공정별소요자재등록(500299) — 탭 둘 = 화면 표 둘(공정 · 소요자재), 머리 6칸 = 화면 머리(제품명~공정흐름유형)
wb = Workbook(); first = True
for key, title in (('공정', '공정'), ('소요', '소요자재')):
    s = d[key]; ws = wb.active if first else wb.create_sheet(); ws.title = title; first = False
    머리(ws, s['hs'])
    for r in s['rows']: ws.append(r)
    글자칸(ws, [5], 2); 너비(ws)
wb.save(f'{OUT}/4.xlsx')

# 5 제품별공정별워크센터등록(500865) — 공정마다 한 줄. 칸 이름 = 제품별공정별워크센터일괄수정(525145) 화면(11-10) 글자
#   공정차수 00 = 임시(11-05 T 기록은 00 · 이 제품은 영림원에서 확인 못 함). 워크센터·시간단위·표준작업시간·우선순위 = 정해진 값 없음 → 빈칸.
s = d['공정']; h = s['hs']
wb = Workbook(); ws = wb.active; ws.title = '제품별공정별워크센터등록'
머리(ws, ['제품명', '제품번호', '제품규격', '공정차수', '공정', '워크센터', '시간단위', '표준작업시간', '우선순위'])
for r in s['rows']:
    ws.append([r[h.index('제품명')], r[h.index('제품번호')], r[h.index('규격')], '00', r[h.index('공정')], None, None, None, None])
    임시(ws.cell(row=ws.max_row, column=4), '11-05 T 4제품 기록이 00. 이 제품 공정차수는 영림원에서 확인 못 함')
글자칸(ws, [4], 2); 너비(ws); wb.save(f'{OUT}/5.xlsx')
print('만듦', OUT)
