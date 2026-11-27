# -*- coding: utf-8 -*-
"""MD팀 시험용 **지어낸** 엑셀 → `잰것/본보기/MD팀-흉내.json` (11-27 [새 지시 MD팀])
진짜 아이엔지홈 파일과 **꼴만** 같다(시트 4개·4~5행 두 줄 머리·숨은 열 B·자동필터·조건부 서식 같은 코드 굵은 빨강·2행 색 범례·채운 줄·하이퍼링크·병합·#,##0·0%).
값은 전부 지어냄. 돌리기: <openpyxl 있는 python> 잰것/MD팀흉내만들기.py <임시 폴더>"""
import sys, os, json, subprocess
import openpyxl
from openpyxl.styles import PatternFill, Font, Alignment
from openpyxl.formatting.rule import FormulaRule
from openpyxl.styles.differential import DifferentialStyle

밖 = sys.argv[1]
wb = openpyxl.Workbook()
머리 = ["구분", "순서", "시리즈", "카테고리구분", "스마트스토어 \n url\n", "상품코드", "제품명", "옵션", "주의및 참고사항 ", "소비자가", "할인판매가", None, "배송비", None, None, "조립형태", "배송형태", "배송사", "합포장"]
분홍 = PatternFill("solid", fgColor="FFEAD1DC")
def 목록시트(ws, n, 거르개=True, 숨김B=True, 병합=False, 이름들=None):
    ws["A1"] = "  -"
    ws["F2"] = "색상표기건: 중복코드"; ws["F2"].font = Font(b=True, color="FFFF0000")
    ws["G2"] = "색상표기건: 등록/수정 건 (확인중)"; ws["G2"].fill = 분홍; ws["G2"].font = Font(b=True)
    for i, h in enumerate(머리, 1):
        if h is not None: ws.cell(4, i, h)
    ws.merge_cells("K4:L4"); ws.merge_cells("M4:O4")
    for c, h in zip("KLMNO", ["판매가", "할인율", "서울/경기", "경기외곽", "지방"]): ws[c + "5"] = h
    for k in range(n):
        r = 6 + k
        이름 = (이름들 or [])[k] if 이름들 and k < len(이름들) else f"가짜 의자 {k}"
        ws.cell(r, 3, ["가시리즈", "나시리즈"][k % 2]); ws.cell(r, 4, ["의자", "책상", "침대"][k % 3])
        if k % 4 == 0:
            ws.cell(r, 5, f"https://example.com/p/{k}"); ws.cell(r, 5).hyperlink = f"https://example.com/p/{k}"; ws.cell(r, 5).font = Font(u="single", color="FF0000FF")
        ws.cell(r, 6, "DUP-1" if k in (2, 5) else f"code{k}").number_format = "@"
        ws.cell(r, 7, 이름)
        ws.cell(r, 8, ["화이트", "블랙", None][k % 3])
        ws.cell(r, 10, 100000 + k * 1000).number_format = "#,##0"
        ws.cell(r, 11, 90000 + k * 1000).number_format = "#,##0"; ws.cell(r, 11).font = Font(b=True)
        ws.cell(r, 12, f"=IFERROR(1-(K{r}/J{r}),\"-\")").number_format = "0%"
        ws.cell(r, 13, "무료배송" if k % 2 else 15000).number_format = "#,##0"
        ws.cell(r, 16, "B.반제_조립 및 설치"); ws.cell(r, 18, "가짜배송사" if k % 5 else None)
        ws.cell(r, 3).alignment = Alignment(horizontal="center")
        if k in (3, 4):
            for c in range(1, 33): ws.cell(r, c).fill = 분홍
    ws.cell(6 + n + 2, 7, None)               # 빈 줄 하나 뒤
    if 숨김B: ws.column_dimensions["B"].hidden = True
    if 거르개: ws.auto_filter.ref = f"A4:AF{6 + n}"
    if 병합: ws.merge_cells(f"I6:I8"); ws["I6"] = "세 줄 합친 참고"
    ws.conditional_formatting.add(f"F1:F{6 + n + 10}", FormulaRule(formula=[f"COUNTIF($F$1:$F${6 + n + 10}, F1)>1"], font=Font(b=True, color="FFFF0000")))
ws = wb.active; ws.title = "제품리스트"
목록시트(ws, 30, 이름들=["맞는 상품 하나", "맞는  상품 둘", "없는 상품", "맞는 상품 하나"])
ws2 = wb.create_sheet("사은품리스트")
for i, h in enumerate(["상품코드", "사은품명", "공급가", "비고"], 1): ws2.cell(1, i, h)
for k in range(12):
    ws2.cell(2 + k, 1, f"G-{k}"); ws2.cell(2 + k, 2, f"가짜 사은품 {k}"); ws2.cell(2 + k, 3, 1000 * (k + 1)).number_format = "#,##0"
    if k in (9, 10): ws2.cell(2 + k, 4, "비고"); ws2.cell(2 + k, 4).fill = PatternFill("solid", fgColor="FFFFF2CC")
ws2.auto_filter.ref = "A1:D13"
목록시트(wb.create_sheet("외부복사용"), 30, 거르개=False, 숨김B=False, 병합=True, 이름들=["맞는 상품 하나"])
목록시트(wb.create_sheet("중지단종"), 5, 거르개=False, 숨김B=False)
xl = os.path.join(밖, "흉내.xlsx"); wb.save(xl)
# 수식 값(할인율)은 openpyxl 이 계산하지 않는다 → LibreOffice 없이: 계산값을 넣은 사본을 따로 만든다
wv = openpyxl.load_workbook(xl)
for w in wv.worksheets:
    for row in w.iter_rows():
        for c in row:
            if isinstance(c.value, str) and c.value.startswith("=IFERROR(1-(K"):
                r = c.row; c.value = 1 - w.cell(r, 11).value / w.cell(r, 10).value
wv.save(xl)
여기 = os.path.dirname(os.path.abspath(__file__))
subprocess.run([sys.executable, os.path.join(여기, "..", "MD팀올리기.py"), xl, "--json", os.path.join(여기, "본보기", "MD팀-흉내.json")], check=True)
