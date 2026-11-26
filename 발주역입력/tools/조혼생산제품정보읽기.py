#!/usr/bin/env python3
"""「조혼생산제품정보」 엑셀(드라이브 `관리프로그램/발주역입력/조혼가구/TalkFile_조혼생산제품정보.xlsx.xlsx`)
→ 창고 발주역입력_조혼생산제품정보 에 시트마다 문서 하나 + `_시트목록`. 조혼가구부속명.html 「조혼생산제품정보」 메뉴가 읽음
(사장님 11-27 「…「조혼생산제품정보」를 영림원 품목등록업로드 형태로 만들기 위한 중간단계 목록…」).

쓰는 법:
  python3 발주역입력/tools/조혼생산제품정보읽기.py "<엑셀>"          # 읽고 창고에 씀
  python3 발주역입력/tools/조혼생산제품정보읽기.py "<엑셀>" --안씀   # 셈만
openpyxl 필요. 엑셀은 읽기만. ⚠ 값은 창고에만 — 저장소(공개)에 업무 값을 적지 마라.
시트 꼴(11-18 판, 시트 3개 그로잉핏,카비 · 뮤트 주방수납 · 비르케 — 모두 보임):
  묶음 = 제품명 줄(표 첫 칸에만 글) → (윗머리 「18T-LPM · 재단사이즈 · 수량 · 1T」) → 머리 「자재 · 구성 · w · d · 1조 · 엣지면 · (빈칸) · 필름 · 우라홈」 → 줄들.
  표 첫 칸 = 머리 「자재」 가 든 열(그로잉핏,카비 = A, 나머지 = B). 표 칸 = 자재 ~ 우라홈(9칸). 그 오른쪽 메모 열(N·O 등)은 표 밖이라 안 씀.
  줄 = 표 칸에 값이 하나라도 있는 행만(빈 행은 안 남김 — 쪽이 행 번호 틈으로 빈칸행 경계를 셈).
  값 = 엑셀 값(정수 같은 소수 → 정수 · 글 그대로).
"""
import sys, os, datetime
import openpyxl
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import 업체별단품읽기 as 길

창고 = 'artifacts/vivivic-4b7ef/public/data/발주역입력_조혼생산제품정보'
칸이름 = ['자재', '구성', 'w', 'd', '수량', '엣지면', '필름', '우라홈']   # 머리 글자: 자재·구성·w·d·1조(수량)·엣지면·필름·우라홈


def 값(v):
    if v is None: return None
    if isinstance(v, float) and v.is_integer(): return int(v)
    if isinstance(v, (int, float)): return v
    s = str(v); return s if s.strip() else None


def 읽기(경로):
    wb = openpyxl.load_workbook(경로, data_only=True)
    시트들 = []
    for k, ws in enumerate([w for w in wb.worksheets if w.sheet_state == 'visible']):
        R = [list(r) + [None] * 20 for r in ws.iter_rows(values_only=True)]
        머리들 = [i for i, r in enumerate(R) if any(x == '자재' for x in r[:4]) and any(x == '구성' for x in r[:5])]
        if not 머리들: continue
        c0 = R[머리들[0]].index('자재')
        h = R[머리들[0]]
        자 = {n: h.index(n) for n in ['자재', '구성', 'w', 'd', '1조', '엣지면', '필름', '우라홈'] if n in h}
        표칸 = list(range(c0, 자['우라홈'] + 1))
        묶음 = []
        for j, mi in enumerate(머리들):
            # 제품명 = 머리 위로 올라가며 표 첫 칸에만 글이 있는 가장 가까운 행
            t = None
            for i in range(mi - 1, max(-1, mi - 4), -1):
                r = R[i]
                if 값(r[c0]) is not None and all(값(r[c]) is None for c in 표칸[1:]): t = i; break
            끝 = len(R)
            if j + 1 < len(머리들):
                다음 = 머리들[j + 1]; 끝 = 다음
                for i in range(다음 - 1, max(mi, 다음 - 4), -1):
                    r = R[i]
                    if (값(r[c0]) is not None and all(값(r[c]) is None for c in 표칸[1:])) or any(값(r[c]) in ('재단사이즈',) for c in 표칸): 끝 = i
            줄 = []
            for n in range(mi + 1, 끝):
                r = R[n]
                if all(값(r[c]) is None for c in 표칸): continue
                if 값(r[c0]) is not None and all(값(r[c]) is None for c in 표칸[1:]) and n > mi + 1: continue
                줄.append({'행': n + 1, 'v': [값(r[자[x]]) for x in ['자재', '구성', 'w', 'd', '1조', '엣지면', '필름', '우라홈']]})
            묶음.append({'제품명': str(R[t][c0]).strip() if t is not None else '', '행': (t + 1) if t is not None else mi + 1, '머리행': mi + 1, '줄': 줄})
        시트들.append({'시트': ws.title, '차례': k, '칸': 칸이름, '묶음': 묶음})
    return 시트들


def main():
    if len(sys.argv) < 2: print(__doc__); sys.exit(1)
    시트들 = 읽기(sys.argv[1])
    for s in 시트들:
        print('##', s['시트'], '묶음', len(s['묶음']))
        for b in s['묶음']: print('  ', b['행'], b['제품명'], '줄', len(b['줄']), [x['행'] for x in b['줄']])
    if '--안씀' in sys.argv: return
    문서들 = {s['시트'].replace('/', '／'): s for s in 시트들}
    문서들['_시트목록'] = {'시트들': [s['시트'] for s in 시트들], '파일': os.path.basename(sys.argv[1]), '읽은날': datetime.date.today().isoformat()}
    길.창고 = 창고
    길.쓰기(문서들)
    print('창고에 씀:', 창고, list(문서들))


if __name__ == '__main__':
    main()
