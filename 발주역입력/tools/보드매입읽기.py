#!/usr/bin/env python3
"""「2026년 국내거래처 구매내역서」 엑셀(카톡 받은 것) → 창고(Firestore) 발주역입력_보드매입.

쓰는 법:
  python3 발주역입력/tools/보드매입읽기.py "<드라이브 관리프로그램/발주역입력/TalkFile_2026년_국내거래처_구매내역서_6개업체_1-10월_v10.xlsx.xlsx>"   # 읽고 창고에 씀 + 대조
  python3 발주역입력/tools/보드매입읽기.py "<엑셀>" --안씀                       # 셈·대조만(엑셀에서 읽은 값으로)
  python3 발주역입력/tools/보드매입읽기.py --대조                                # 창고에 있는 값을 다시 읽어 합계 대조만
openpyxl 이 있어야 한다. 엑셀은 읽기만 한다(값은 data_only — 엑셀이 저장해 둔 셈 결과).

시트 꼴(v10, 11-16 잼 — 발주역입력/CLAUDE.md 「보드매입 엑셀 꼴」):
  · 「총괄요약」: 1행 제목, 3행 머리, 4~10행 거래처·합계 / 13행 제목, 14행 머리, 15~21행 비율 / 23행~ 「※」 글.
  · 거래처 시트: 1행 제목, 3행 머리. 왼쪽 = 월별 표(A~I, 현진산업·현준보드는 A~K), 4행부터 빈 줄까지, 달마다 끝에 「[N월 소계]」.
    그 아래 「… 1~10월 누계 …」 제목 줄 · 다음 줄 머리(B~) · 「[1~10월 총계]」 까지.
    오른쪽 = 「1~10월 매입품목」 목록(머리 3행, 왼쪽 표와 빈 칸 하나 띄움).
  칸은 3행(누계는 그 머리 줄)의 글자 그대로. 머리가 없는 칸(현진산업 X~AF, 현준보드 W 의 메모)은 담지 않는다 — 읽을 때 알려 준다.
  값은 엑셀 셀 표시 꼴(number_format) 대로 글자로 만든다: #,##0 · 음수 괄호/0 은 「-」 · 0.0% · yyyy-mm-dd · 일반.
"""
import sys, os, re, json, datetime, urllib.request, urllib.error
from decimal import Decimal, ROUND_HALF_UP

창고 = 'artifacts/vivivic-4b7ef/public/data/발주역입력_보드매입'
뿌리 = 'projects/vivivic-4b7ef/databases/(default)/documents'


# ───────── 셀 → 엑셀에 보이는 글자 ─────────
def 반올림(x, n=0):
    q = Decimal(1).scaleb(-n)
    return Decimal(repr(x)).quantize(q, rounding=ROUND_HALF_UP)


def 표시(c):
    v, f = c.value, (c.number_format or 'General')
    if v is None: return ''
    if isinstance(v, str): return v
    if isinstance(v, (datetime.datetime, datetime.date)):
        return v.strftime('%Y-%m-%d')
    if isinstance(v, bool): return str(v)
    m = re.match(r'^0(?:\.(0+))?%$', f)
    if m:
        return f'{반올림(v * 100, len(m.group(1) or "")):f}%'
    if f.startswith('#,##0') and ';' in f:               # 회계 꼴: 음수 (1,234) · 0 은 -
        r = 반올림(v)
        if r == 0: return '-'
        return f'({-r:,})' if r < 0 else f'{r:,}'
    if f.startswith('#,##0'):
        return f'{반올림(v):,}'
    if isinstance(v, float) and v.is_integer(): v = int(v)
    return str(v)


def 수인가(c):
    return isinstance(c.value, (int, float)) and not isinstance(c.value, bool)


def 마지막머리(ws, r, c0):
    c = c0
    while ws.cell(r, c).value not in (None, ''): c += 1
    return c - 1


def 줄빈가(ws, r, c0, c1):
    return all(ws.cell(r, c).value in (None, '') for c in range(c0, c1 + 1))


def 표만들기(ws, 머리줄, c0, c1, r0, r1):
    칸 = [str(ws.cell(머리줄, c).value or '') for c in range(c0, c1 + 1)]
    수 = [0] * len(칸); 줄 = []
    for r in range(r0, r1 + 1):
        cs = [ws.cell(r, c) for c in range(c0, c1 + 1)]
        for i, c in enumerate(cs):
            if 수인가(c): 수[i] = 1
        줄.append({'v': [표시(c) for c in cs], 'r': r})
    return {'칸': 칸, '수': 수, '줄': 줄}


def 거래처시트(ws):
    쓴칸 = set()
    # 왼쪽 월별 표
    c1 = 마지막머리(ws, 3, 1)
    r = 4
    while r <= ws.max_row and not 줄빈가(ws, r, 1, c1): r += 1
    월표 = 표만들기(ws, 3, 1, c1, 4, r - 1)
    월 = ''
    for z in 월표['줄']:
        if z['v'][0]: 월 = z['v'][0]
        z['월'] = 월
        if re.match(r'^\[.*소계\]$', z['v'][1]): z['소'] = 1
    for rr in range(3, r): 쓴칸.update((rr, c) for c in range(1, c1 + 1))
    # 아래 누계 표
    누제목줄 = next(rr for rr in range(r, ws.max_row + 1) if '누계' in str(ws.cell(rr, 1).value or ''))
    머리 = 누제목줄 + 1
    nc0 = next(c for c in range(1, c1 + 2) if ws.cell(머리, c).value not in (None, ''))
    nc1 = 마지막머리(ws, 머리, nc0)
    끝 = next(rr for rr in range(머리 + 1, ws.max_row + 1) if '총계' in str(ws.cell(rr, nc0).value or ''))
    누표 = 표만들기(ws, 머리, nc0, nc1, 머리 + 1, 끝)
    누표['제목'] = str(ws.cell(누제목줄, 1).value)
    누표['줄'][-1]['소'] = 1
    쓴칸.add((누제목줄, 1))
    for rr in range(머리, 끝 + 1): 쓴칸.update((rr, c) for c in range(nc0, nc1 + 1))
    # 오른쪽 매입품목 목록 (왼쪽 표 뒤 빈 칸 하나 다음)
    mc0 = c1 + 2
    mc1 = 마지막머리(ws, 3, mc0)
    r = 4
    while r <= ws.max_row and ws.cell(r, mc0).value not in (None, ''): r += 1
    목표 = 표만들기(ws, 3, mc0, mc1, 4, r - 1)
    for rr in range(3, r): 쓴칸.update((rr, c) for c in range(mc0, mc1 + 1))
    쓴칸.add((1, 1))
    남은 = [f'{ws.cell(rr, cc).coordinate}={ws.cell(rr, cc).value!r}'
            for rr in range(1, ws.max_row + 1) for cc in range(1, ws.max_column + 1)
            if ws.cell(rr, cc).value not in (None, '') and (rr, cc) not in 쓴칸]
    return {'시트': ws.title, '제목': str(ws['A1'].value or ''),
            '표': [dict(월표, 이름='월별'), dict(누표, 이름='누계'), dict(목표, 이름='매입품목')]}, 남은


def 총괄시트(ws):
    표들 = []; 쓴 = set()
    r = 1
    while r <= ws.max_row:
        t = ws.cell(r, 1).value
        if t and ws.cell(r + 1, 1).value == '거래처' or (t and ws.cell(r + 2, 1).value == '거래처' and ws.cell(r + 1, 1).value is None):
            머리 = r + 1 if ws.cell(r + 1, 1).value == '거래처' else r + 2
            c1 = 마지막머리(ws, 머리, 1)
            e = 머리 + 1
            while e <= ws.max_row and not 줄빈가(ws, e, 1, c1): e += 1
            표 = 표만들기(ws, 머리, 1, c1, 머리 + 1, e - 1)
            표['제목'] = str(t)
            표['줄'][-1]['소'] = 1 if 표['줄'][-1]['v'][0] == '합계' else 0
            표들.append(표)
            쓴.add((r, 1)); [쓴.update((rr, c) for c in range(1, c1 + 1)) for rr in range(머리, e)]
            r = e
        else:
            r += 1
    글 = [str(ws.cell(rr, 1).value) for rr in range(1, ws.max_row + 1)
          if (rr, 1) not in 쓴 and str(ws.cell(rr, 1).value or '').startswith('※')]
    return {'시트': ws.title, '제목': '', '표': 표들, '글': 글}


def 읽기(파일):
    import openpyxl
    wb = openpyxl.load_workbook(파일, data_only=True)
    문서들 = {}; 순서 = []
    for ws in wb.worksheets:
        if ws.sheet_state != 'visible': continue
        if ws.title == '총괄요약':
            d = 총괄시트(ws)
        else:
            d, 남은 = 거래처시트(ws)
            if 남은: print(f'  [{ws.title}] 머리 없는 칸 — 담지 않음: {"; ".join(남은)}')
        문서들[ws.title] = d; 순서.append(ws.title)
    return 문서들, 순서


# ───────── 대조 (창고에 들어간 글자를 다시 숫자로) ─────────
def 수(s):
    s = str(s).replace(',', '').strip()
    if s in ('', '-'): return 0
    if s.startswith('(') and s.endswith(')'): s = '-' + s[1:-1]
    try: return int(s)
    except ValueError:
        try: return float(s)
        except ValueError: return None


def 대조(문서들):
    틀림 = 0
    def 같나(이름, a, b):
        nonlocal 틀림
        ok = abs(a - b) < 0.5
        if not ok: 틀림 += 1
        return f'{이름} {a:,} {"=" if ok else "≠"} {b:,}'
    총괄 = 문서들.get('총괄요약')
    월공급 = {}
    for 이름, d in 문서들.items():
        if 이름 == '총괄요약': continue
        월표, 누표, 목표 = d['표']
        k = 월표['칸']
        ci = k.index('수량'); ei = k.index('별도 공급가액(원)') if '별도 공급가액(원)' in k else k.index('공급가액(원)')
        ai = 4  # E 칸(공급가액 또는 금액)
        월합 = {}; 줄들 = []
        out = []
        for z in 월표['줄']:
            if z.get('소'):
                c = sum(수(x['v'][ci]) or 0 for x in 줄들); e = sum(수(x['v'][ei]) or 0 for x in 줄들); a = sum(수(x['v'][ai]) or 0 for x in 줄들)
                ok1 = abs(c - (수(z['v'][ci]) or 0)) < .5 and abs(e - (수(z['v'][ei]) or 0)) < .5 and abs(a - (수(z['v'][ai]) or 0)) < .5
                if not ok1:
                    틀림 += 1; out.append(f'{z["월"]} 소계 틀림: 수량 {c}/{z["v"][ci]} {k[ei]} {e}/{z["v"][ei]}')
                월합[z['월']] = 수(z['v'][ei]) or 0
                줄들 = []
            elif z['v'][1] != '(구매내역 없음)':
                줄들.append(z)
            else:
                월합[z['월']] = 수(z['v'][ei]) or 0
        if 줄들: out.append(f'소계 없이 끝난 줄 {len(줄들)}'); 틀림 += 1
        월공급[이름] = 월합
        nk = 누표['칸']; nei = nk.index('별도 공급가액(원)') if '별도 공급가액(원)' in nk else nk.index('공급가액(원)')
        nci = nk.index('수량')
        총 = 누표['줄'][-1]['v']; 품 = 누표['줄'][:-1]
        월수량 = sum(수(z['v'][ci]) or 0 for z in 월표['줄'] if z.get('소'))
        print(f'■ {이름}: 월별 소계 {len(월합)}달 ' + ('모두 맞음' if not out else ' / '.join(out)))
        print('   ' + ' · '.join([
            같나(f'{k[ei]} 달 소계 합 vs 총계', sum(월합.values()), 수(총[nei])),
            같나('누계 품목 합 vs 총계', sum(수(z['v'][nei]) or 0 for z in 품), 수(총[nei])),
            같나('수량 달 소계 합 vs 총계', 월수량, 수(총[nci])),
            같나('누계 수량 합 vs 총계', sum(수(z['v'][nci]) or 0 for z in 품), 수(총[nci])),
        ]))
        mk = 목표['칸']; mi = next(i for i, x in enumerate(mk) if x == '1~10월 공급가액(원)')
        print('   ' + 같나('매입품목 공급가액 합 vs 총계', sum(수(z['v'][mi]) or 0 for z in 목표['줄']), 수(총[nei])))
    if 총괄:
        t = 총괄['표'][0]; 달칸 = t['칸'][1:11]
        이름표 = {'(주)엘데코': '엘데코', '(주)신태광': '신태광', '재하기업': '재하기업', '현진산업': '현진산업', '(주)현준보드': '현준보드(서광)', '양지데코': '양지데코'}
        세로 = [0] * 11
        for z in t['줄'][:-1]:
            시트 = 이름표.get(z['v'][0]); 틀린달 = []
            for i, 달 in enumerate(달칸):
                a = 수(z['v'][1 + i]); b = 월공급.get(시트, {}).get(달, 0)
                세로[i] += a
                if abs(a - b) > .5: 틀린달.append(f'{달} {a:,}≠{b:,}')
            세로[10] += 수(z['v'][11])
            줄합 = sum(수(z['v'][1 + i]) for i in range(10))
            if 틀린달: 틀림 += len(틀린달)
            print(f'■ 총괄요약 {z["v"][0]} ↔ {시트} 시트 달 소계: ' + ('10달 모두 맞음' if not 틀린달 else ', '.join(틀린달))
                  + ' · ' + 같나('1~10월 합계', 줄합, 수(z['v'][11])))
        합 = t['줄'][-1]['v']
        print('■ 총괄요약 합계 줄: ' + ' · '.join(같나(c, 세로[i], 수(합[1 + i])) for i, c in enumerate(t['칸'][1:12])))
    print('대조 결과:', '모두 맞음' if not 틀림 else f'틀린 곳 {틀림}')
    return 틀림


# ───────── 창고(Firestore REST) — 재단내역서읽기.py 와 같은 길(익명 로그인) ─────────
def 값싸기(v):
    if v is None: return {'nullValue': None}
    if isinstance(v, bool): return {'booleanValue': v}
    if isinstance(v, int): return {'integerValue': str(v)}
    if isinstance(v, float): return {'doubleValue': v}
    if isinstance(v, dict): return {'mapValue': {'fields': {k: 값싸기(x) for k, x in v.items()}}}
    if isinstance(v, list): return {'arrayValue': {'values': [값싸기(x) for x in v]}}
    return {'stringValue': str(v)}


def 값풀기(v):
    if 'mapValue' in v: return {k: 값풀기(x) for k, x in v['mapValue'].get('fields', {}).items()}
    if 'arrayValue' in v: return [값풀기(x) for x in v['arrayValue'].get('values', [])]
    if 'integerValue' in v: return int(v['integerValue'])
    if 'doubleValue' in v: return v['doubleValue']
    if 'nullValue' in v: return None
    return next(iter(v.values()))


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


def 토큰받기():
    html = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '재단.html'), encoding='utf-8').read()
    key = re.search(r'apiKey:\s*"([^"]+)"', html).group(1)
    return 부름(f'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={key}', {'returnSecureToken': True})['idToken']


def 쓰기(문서들, 토큰):
    ws = [{'update': {'name': f'{뿌리}/{창고}/{n}', 'fields': {k: 값싸기(v) for k, v in d.items()}}} for n, d in 문서들.items()]
    for i in range(0, len(ws), 3):
        부름(f'https://firestore.googleapis.com/v1/{뿌리}:commit', {'writes': ws[i:i + 3]}, 토큰)


def 창고읽기(토큰):
    import urllib.parse
    길 = lambda n: 'https://firestore.googleapis.com/v1/' + urllib.parse.quote(f'{뿌리}/{창고}/{n}')
    목 = 값풀기({'mapValue': 부름(길('_목록'), 토큰=토큰)})
    out = {}
    for n in 목['시트들']:
        d = 부름(길(n), 토큰=토큰)
        out[n] = 값풀기({'mapValue': d})
    return 목, out


def main():
    if '--대조' in sys.argv:
        목, 문서들 = 창고읽기(토큰받기())
        print('창고 읽음:', 목.get('파일'), 목.get('읽은날'), 목['시트들'])
        sys.exit(1 if 대조(문서들) else 0)
    if len(sys.argv) < 2: print(__doc__); sys.exit(1)
    파일 = sys.argv[1]
    문서들, 순서 = 읽기(파일)
    for n in 순서:
        print(n, ' / '.join(f"{t.get('이름', t.get('제목', ''))[:12]} {len(t['줄'])}줄 {len(t['칸'])}칸" for t in 문서들[n]['표']))
    if '--json' in sys.argv:
        json.dump(문서들, open(sys.argv[sys.argv.index('--json') + 1], 'w'), ensure_ascii=False, indent=1)
    if '--안씀' in sys.argv:
        대조(문서들); return
    토큰 = 토큰받기()
    목록 = {'시트들': 순서, '파일': os.path.basename(파일), '읽은날': datetime.date.today().isoformat()}
    쓰기(dict(문서들, _목록=목록), 토큰)
    print('창고에 씀:', 창고, 순서 + ['_목록'])
    _, 다시 = 창고읽기(토큰)
    print('— 창고에서 다시 읽어 대조 —')
    sys.exit(1 if 대조(다시) else 0)


if __name__ == '__main__':
    main()
