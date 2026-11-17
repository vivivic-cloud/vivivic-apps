#!/usr/bin/env python3
"""해피코(HPC) 「26년 엣지 입고리스트」 엑셀 → 창고(Firestore) 발주역입력_중국엣지/해피코. (보드매입현황 v1.16.0 「중국엣지필름」)

쓰는 법:
  python3 발주역입력/tools/중국엣지읽기.py "<드라이브 관리프로그램/발주역입력/해피코엣지/TalkFile_26년 엣지 입고리스트_HPC_261117.xlsx>"   # 읽고 · 바뀐 것 있으면 씀 · 다시 읽어 견줌
  python3 발주역입력/tools/중국엣지읽기.py "<엑셀>" --안씀 [--json 출력.json]                                                              # 읽기만
openpyxl 이 있어야 한다. 엑셀은 읽기만 한다(data_only — 엑셀이 저장해 둔 셈 결과).
셈은 보드매입현황.html 「중국엑셀읽기」 덩이와 같다(같은 엑셀이면 같은 값 — 고칠 때 둘을 같이):
  시트 = 1행에 「제품명」·「입고일」 이 있는 첫 시트 · 칸 = 1행 글자(빈 머리 칸은 끝에서 자름) · 줄 = 2행~, 다 빈 행 뺌.
  값 = 글 그대로 · 날짜 YYYY-MM-DD · 숫자 = 표시 꼴의 [$¥] 통화 글자 + #,##0(.00) / 0(.00), 그 밖(일반)은 그대로. 월 = 입고일의 YYYY-MM.
"""
import sys, os, re, json, datetime
from decimal import Decimal, ROUND_HALF_UP
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from 보드매입읽기 import 값싸기, 값풀기, 부름, 토큰받기   # 같은 창고 길(익명 로그인)

창고 = 'artifacts/vivivic-4b7ef/public/data/발주역입력_중국엣지'
문서이름 = '해피코'
뿌리 = 'projects/vivivic-4b7ef/databases/(default)/documents'


def 표시(c):
    v, f = c.value, (c.number_format or 'General')
    if v is None or v == '': return ''
    if isinstance(v, str): return v
    if isinstance(v, bool): return 'True' if v else 'False'
    if isinstance(v, (datetime.datetime, datetime.date)): return v.strftime('%Y-%m-%d')
    f = f.split(';')[0]; 앞 = ''
    m = re.match(r'^\[\$([^\]-]*)[^\]]*\]', f)
    if m: 앞 = m.group(1); f = f[m.end():]
    m = re.match(r'^(#,##)?0(?:\.(0+))?$', f)
    if m:
        n = len(m.group(2) or '')
        q = Decimal(repr(v)).quantize(Decimal(1).scaleb(-n), rounding=ROUND_HALF_UP)
        return 앞 + (f'{q:,f}' if m.group(1) else f'{q:f}')
    if isinstance(v, float) and v.is_integer(): v = int(v)
    return str(v)


def 수인가(c):
    return isinstance(c.value, (int, float)) and not isinstance(c.value, bool)


def 읽기(파일):
    import openpyxl
    wb = openpyxl.load_workbook(파일, data_only=True)
    ws = next((w for w in wb.worksheets
               if {'제품명', '입고일'} <= {str(w.cell(1, c).value or '').strip() for c in range(1, w.max_column + 1)}), None)
    if ws is None: raise SystemExit('1행에 「제품명」·「입고일」 이 있는 시트가 없다')
    끝 = ws.max_column
    while 끝 > 0 and 표시(ws.cell(1, 끝)) == '': 끝 -= 1
    칸 = [표시(ws.cell(1, c)) for c in range(1, 끝 + 1)]
    수 = [0] * len(칸); 입 = 칸.index('입고일'); 줄 = []
    for r in range(2, ws.max_row + 1):
        cs = [ws.cell(r, c) for c in range(1, 끝 + 1)]
        v = [표시(c) for c in cs]
        if all(x == '' for x in v): continue
        for i, c in enumerate(cs):
            if 수인가(c): 수[i] = 1
        월 = v[입][:7] if re.match(r'^\d{4}-\d{2}-\d{2}$', v[입]) else ''
        줄.append({'v': v, '월': 월, 'r': r})
    return {'업체': '해피코', '시트': ws.title, '칸': 칸, '수': 수, '줄': 줄,
            '파일': os.path.basename(파일), '읽은날': datetime.date.today().isoformat()}


def main():
    if len(sys.argv) < 2: print(__doc__); sys.exit(1)
    문서 = 읽기(sys.argv[1])
    print(f"시트 {문서['시트']} · 칸 {len(문서['칸'])}({' · '.join(문서['칸'])}) · 줄 {len(문서['줄'])}")
    if '--json' in sys.argv:
        json.dump(문서, open(sys.argv[sys.argv.index('--json') + 1], 'w'), ensure_ascii=False, indent=1)
    if '--안씀' in sys.argv: return
    import urllib.parse
    토큰 = 토큰받기()
    길 = 'https://firestore.googleapis.com/v1/' + urllib.parse.quote(f'{뿌리}/{창고}/{문서이름}')
    try: 옛 = 값풀기({'mapValue': 부름(길, 토큰=토큰)})
    except RuntimeError: 옛 = {}
    같다 = lambda a, b: json.dumps(a, sort_keys=True, ensure_ascii=False) == json.dumps(b, sort_keys=True, ensure_ascii=False)
    if 같다(옛.get('칸'), 문서['칸']) and 같다(옛.get('줄'), 문서['줄']):
        print('창고와 같음 — 안 씀'); return
    부름(f'https://firestore.googleapis.com/v1/{뿌리}:commit',
         {'writes': [{'update': {'name': f'{뿌리}/{창고}/{문서이름}', 'fields': {k: 값싸기(x) for k, x in 문서.items()}}}]}, 토큰)
    다시 = 값풀기({'mapValue': 부름(길, 토큰=토큰)})
    ok = 같다(다시.get('칸'), 문서['칸']) and 같다(다시.get('줄'), 문서['줄'])
    print('창고에 씀:', f'{창고}/{문서이름}', '— 다시 읽어 견줌:', '같음' if ok else '다름!')
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
