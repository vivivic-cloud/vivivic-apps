#!/usr/bin/env python3
"""「하준이형」 엑셀(드라이브 `관리프로그램/발주역입력/업체별단품/TalkFile_하준이형.xlsx`, 조혼가구 발주서 시트들)
→ 창고 발주역입력_조혼가구부속명 에 시트마다 문서 하나 + `_시트목록`. 조혼가구부속명.html 이 읽음(사장님 11-24 「발주역입력 메뉴에 조혼가구부속명 메뉴를 만들고 폴더에 하준이형 파일을 목록으로 만들어줘」).

쓰는 법:
  python3 발주역입력/tools/조혼가구부속명읽기.py "<엑셀>"          # 읽고 창고에 씀
  python3 발주역입력/tools/조혼가구부속명읽기.py "<엑셀>" --안씀   # 셈만
openpyxl 필요. 엑셀은 읽기만. ⚠ 값은 창고에만 — 저장소(공개)에 업무 값을 적지 마라.
시트 꼴(11-24 판, 시트 6개 서랍장·플레인·알렉스·킨포크·토리블리·키큰장, 모두 보임 · 숨은 열·행 없음):
  1행 「발    주    서」 · I1 「발주날짜」 K1 날짜 · B3 「조혼가구」 · I3 「업체」 K3 업체 이름 · 8행 머리(B~N) + 9행 둘째 머리(같은 칸 아래 글) · 10행부터 줄.
  ⚠ 「킨포크」 시트만 8·9행 머리 줄이 없고 칸이 한 칸 왼쪽(B 단품코드…) → 칸 이름 = 열 글자(B~N), 8행부터(짓지 않음).
  칸 = B~N 13칸, 이름 = 8행 글 + (9행 글 있으면 줄바꿈 + 9행 글) 그대로. P열 안내 글·숨은 시트·숨은 열은 안 씀. 다 빈 줄 뺌.
  값 = 엑셀 값(정수 같은 소수 → 정수 · 날짜 → YYYY-MM-DD · 글 그대로).
"""
import sys, os, datetime
import openpyxl
from openpyxl.utils import get_column_letter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import 업체별단품읽기 as 길

창고 = 'artifacts/vivivic-4b7ef/public/data/발주역입력_조혼가구부속명'
첫칸, 끝칸 = 1, 14   # B~N (0부터)


def 값(v):
    if v is None: return None
    if isinstance(v, datetime.datetime): return v.date().isoformat()
    if isinstance(v, datetime.date): return v.isoformat()
    if isinstance(v, float) and v.is_integer(): return int(v)
    if isinstance(v, (int, float)): return v
    s = str(v); return s if s.strip() else None


def 읽기(경로):
    wb = openpyxl.load_workbook(경로, data_only=True)
    시트들 = []
    for k, ws in enumerate([w for w in wb.worksheets if w.sheet_state == 'visible']):
        숨 = {i for i in range(1, ws.max_column + 1) if ws.column_dimensions[get_column_letter(i)].hidden}
        R = [list(r) + [None] * 20 for r in ws.iter_rows(values_only=True)]
        머리 = next((i for i, r in enumerate(R) if r[1] == 'PO#'), None)
        쓸칸 = [c for c in range(첫칸, 끝칸) if (c + 1) not in 숨]
        if 머리 is None:   # 11-24 「킨포크」 = 머리 줄 없음(칸도 한 칸 왼쪽으로 밀림) → 칸 이름 = 엑셀 열 글자, 8행(7행 안내 글 다음)부터
            칸 = [get_column_letter(c + 1) for c in 쓸칸]; 시작 = 7
        else:
            칸 = []
            for c in 쓸칸:
                a, b = 값(R[머리][c]), 값(R[머리 + 1][c])
                칸.append('\n'.join(str(x).strip() for x in (a, b) if x is not None))
            시작 = 머리 + 2
        줄 = [{'행': n + 1, 'v': [값(R[n][c]) for c in 쓸칸]} for n in range(시작, len(R))
              if any(값(R[n][c]) is not None for c in 쓸칸) and not ws.row_dimensions[n + 1].hidden]
        시트들.append({'시트': ws.title, '차례': k, '발주날짜': 값(R[0][10]), '업체': 값(R[2][10]), '칸': 칸, '머리없음': 머리 is None, '줄': 줄})
    return 시트들


def main():
    if len(sys.argv) < 2: print(__doc__); sys.exit(1)
    시트들 = 읽기(sys.argv[1])
    for s in 시트들: print(s['시트'], '줄', len(s['줄']), '·', s['업체'], s['발주날짜'], '· 칸', len(s['칸']))
    print('모두', sum(len(s['줄']) for s in 시트들), '줄')
    if '--안씀' in sys.argv: return
    문서들 = {s['시트'].replace('/', '／'): s for s in 시트들}
    문서들['_시트목록'] = {'시트들': [s['시트'] for s in 시트들], '파일': os.path.basename(sys.argv[1]), '읽은날': datetime.date.today().isoformat()}
    길.창고 = 창고
    길.쓰기(문서들)
    print('창고에 씀:', 창고, list(문서들))


if __name__ == '__main__':
    main()
