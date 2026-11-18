#!/usr/bin/env python3
"""로앤 「N월 보링 출고 총내역」 PDF(월별, 파일 「26년 N월 총출고내역(로앤-보링).pdf」) → 창고(Firestore) 발주역입력_로앤 에 달마다 문서 하나.

쓰는 법:
  python3 발주역입력/tools/로앤출고읽기.py "<드라이브 관리프로그램/발주역입력/로앤.zip 폴더>"          # 읽고 창고에 씀
  python3 발주역입력/tools/로앤출고읽기.py "<폴더>" --안씀                                                 # 셈만 본다
  python3 발주역입력/tools/로앤출고읽기.py "<폴더>" --안씀 --json <파일>                                    # 읽은 것을 JSON 으로(검토용, 저장소에 넣지 마라)
pdfplumber 가 있어야 한다(pip install pdfplumber). PDF 는 읽기만 한다.

⚠ 3월 6쪽 「3월 23일 … 가와 1086*295」 줄은 품목 칸 세로선이 빠져 칸이 안 잡힌다 → 머리 칸 너비로 글자를 직접 읽는다(주의에 남김).
표는 쪽마다 하나, 합친 칸 없음(맨 끝 「총 합 계」 줄만 칸을 합침). 쪽마다 머리 줄이 되풀이된다 → 첫 쪽 머리만 칸 이름으로.
칸 이름은 PDF 머리 글자 그대로(두 줄 머리 「출고\\n업체명」 은 줄바꿈만 뺌 → 「출고업체명」. 「보링 가공비」 의 빈칸은 PDF 그대로).
⚠ 숫자 칸(보링규격·수량·보링단가·보링 가공비, 총 합 계 금액)은 PDF 안에 「6 8,200」「1 ,705」 처럼 빈칸 글자가 끼어 있다 → 빈칸만 뺀다.
  (빼고 나면 달마다 보링 가공비 합 = PDF 「총 합 계」 와 원 단위까지 같다.) 글 칸(품목 「지판 801*481」 등)의 빈칸은 PDF 그대로 둔다.
"""
import sys, os, re, glob, json, unicodedata, urllib.request, urllib.error, datetime

NFC = lambda s: unicodedata.normalize('NFC', s)
창고 = 'artifacts/vivivic-4b7ef/public/data/발주역입력_로앤'
숫자칸 = {'보링규격', '수량', '보링단가', '보링 가공비'}
날꼴 = re.compile(r'^\d+월 ?\d+일$')


def 한달(f):
    import pdfplumber
    m = int(re.search(r'(\d+)월', NFC(os.path.basename(f))).group(1))
    pdf = pdfplumber.open(f)
    제목 = (pdf.pages[0].extract_text() or '').split('\n')[0].strip()
    칸 = None; 줄 = []; 합계 = []; 주의 = []
    for pi, pg in enumerate(pdf.pages):
        tbs = pg.find_tables()
        if len(tbs) != 1: 주의.append(f'{pi+1}쪽 표 {len(tbs)}개')
        for tb in tbs:
            머리x = None
            rows = tb.extract()
            for ri, r in enumerate(rows):
                r = [(c or '').replace('\n', '') for c in r]
                if r[0] == '출고일':
                    머리x = [(c[0], c[2]) for c in tb.rows[ri].cells]
                    if 칸 is None: 칸 = r
                    elif r != 칸: 주의.append(f'{pi+1}쪽 머리가 다름: {r}')
                    continue
                if 날꼴.match(r[0]):
                    for ci, c in enumerate(tb.rows[ri].cells):      # 선이 빠져 칸을 못 찾은 자리 → 머리 칸 너비 · 이 줄 높이에서 글자를 직접 읽음
                        if c is None and 머리x:
                            y0, y1 = tb.rows[ri].bbox[1], tb.rows[ri].bbox[3]
                            r[ci] = ' '.join((pg.crop((머리x[ci][0], y0, 머리x[ci][1], y1)).extract_text() or '').split())
                            주의.append(f'{pi+1}쪽 {r[0]} 「{칸[ci]}」 칸 선 없음 → 글자로 읽음: {r[ci]}')
                    v = [re.sub(r'\s', '', x) if 칸[i] in 숫자칸 else x.strip() for i, x in enumerate(r)]
                    줄.append({'v': v, 'p': pi + 1}); continue
                if r[0].replace(' ', '') == '총합계':          # 합친 칸 그대로: 글과 칸 수
                    cells = tb.rows[ri].cells
                    for ci, c in enumerate(cells):
                        if c is None: continue
                        n = 1
                        while ci + n < len(cells) and cells[ci + n] is None: n += 1
                        x = r[ci]
                        합계.append({'v': x.strip() if not 합계 else re.sub(r'\s', '', x), 'n': n})
                    continue
                주의.append(f'{pi+1}쪽 모르는 줄: {r}')
    return {'달': f'2026-{m:02d}', '파일': NFC(os.path.basename(f)), '쪽수': len(pdf.pages), '제목': 제목,
            '칸': 칸, '줄': 줄, '합계': 합계, '주의': 주의, '읽은날': datetime.date.today().isoformat()}


def 수(s):
    try: return float(s.replace(',', ''))
    except ValueError: return None


def 대조(d):
    k = d['칸']; ai = k.index('보링 가공비'); qi = k.index('수량'); ui = k.index('보링단가')
    합 = sum(수(r['v'][ai]) or 0 for r in d['줄'])
    어긋 = [r for r in d['줄'] if None not in (수(r['v'][qi]), 수(r['v'][ui]), 수(r['v'][ai]))
           and abs(수(r['v'][qi]) * 수(r['v'][ui]) - 수(r['v'][ai])) > 0.6]
    pdf합 = next((수(re.sub(r'\s', '', c['v'])) for c in d['합계'][1:2]), None)
    return 합, pdf합, 어긋


# ───────── 창고(Firestore REST) — 재단내역서읽기.py 와 같은 길(익명 로그인) ─────────
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


def 쓰기(문서들):
    html = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '재단.html'), encoding='utf-8').read()
    key = re.search(r'apiKey:\s*"([^"]+)"', html).group(1)
    토큰 = 부름(f'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={key}', {'returnSecureToken': True})['idToken']
    뿌리 = 'projects/vivivic-4b7ef/databases/(default)/documents'
    ws = [{'update': {'name': f'{뿌리}/{창고}/{n}', 'fields': {k: 값싸기(v) for k, v in d.items()}}} for n, d in 문서들.items()]
    for i in range(0, len(ws), 3):
        부름(f'https://firestore.googleapis.com/v1/{뿌리}:commit', {'writes': ws[i:i + 3]}, 토큰)


def main():
    if len(sys.argv) < 2: print(__doc__); sys.exit(1)
    폴더 = sys.argv[1]; 안씀 = '--안씀' in sys.argv
    달들 = {}
    for f in sorted(glob.glob(os.path.join(폴더, '*.pdf'))):
        if '출고내역' not in NFC(f): continue
        d = 한달(f); 달들[d['달']] = d
        합, pdf합, 어긋 = 대조(d)
        print(f"{d['달']} {d['쪽수']}쪽 줄 {len(d['줄'])} · 칸 {d['칸']} · 보링 가공비 합 {합:,.0f} / PDF 총합계 {pdf합:,.0f}"
              + (' ✓' if pdf합 is not None and abs(합 - pdf합) < 1 else ' ✗')
              + f" · 수량×단가≠합계 {len(어긋)}" + (f" · 주의 {d['주의']}" if d['주의'] else ''))
    if '--json' in sys.argv:
        json.dump(달들, open(sys.argv[sys.argv.index('--json') + 1], 'w'), ensure_ascii=False, indent=1)
    if 안씀: return
    문서들 = dict(달들)
    문서들['_달목록'] = {'달들': sorted(달들), '읽은날': datetime.date.today().isoformat()}
    쓰기(문서들)
    print('창고에 씀:', 창고, sorted(문서들))


if __name__ == '__main__':
    main()
