#!/usr/bin/env python3
"""에이엠티 「재단 상세내역서」 PDF(월별) → 창고(Firestore) 발주역입력_재단 에 달마다 문서 하나.

쓰는 법:
  python3 발주역입력/tools/재단내역서읽기.py "<드라이브 관리프로그램/발주역입력/AMT.zip/재단 폴더>"          # 읽고 창고에 씀
  python3 발주역입력/tools/재단내역서읽기.py "<폴더>" --안씀                                                # 셈만 본다
  python3 발주역입력/tools/재단내역서읽기.py "<폴더>" --안씀 --json <파일>                                   # 읽은 것을 JSON 으로(검토용, 저장소에 넣지 마라)
pdfplumber 가 있어야 한다(pip install pdfplumber). PDF 는 읽기만 한다.

⚠ 칸이 합쳐진 곳: pdfplumber 의 cells 는 합친 칸을 잘게 쪼개 놓는 일이 있다(8월 1쪽 「이동선반」 줄).
  그래서 칸 경계는 **실제로 그어진 가로선**(lines + 얇은 rects)이 그 칸 가운데를 지나는가로 잡는다.
  칸 하나 = (쪽, 칸 번호, 위 선 ~ 아래 선). 같은 칸에 든 줄은 같은 묶음 번호(g)를 받는다 → 화면에서 rowspan.
"""
import sys, os, re, glob, json, unicodedata, urllib.request, urllib.parse, urllib.error, datetime

NFC = lambda s: unicodedata.normalize('NFC', s)
창고 = 'artifacts/vivivic-4b7ef/public/data/발주역입력_재단'


def 글(pg, b, sep=' '):
    t = pg.crop(b).extract_text() or ''
    return sep.join(x.strip() for x in t.split('\n') if x.strip())


def 안(c, x, y):
    return c[0] - 0.5 <= x <= c[2] + 0.5 and c[1] - 0.5 <= y <= c[3] + 0.5


def 한달(f):
    import pdfplumber
    m = int(re.search(r'(\d+)월분', NFC(f)).group(1))
    pdf = pdfplumber.open(f)
    머리글 = pdf.pages[0].extract_text().split('\n')[:6]
    제목 = next((l.strip() for l in 머리글 if '세부내역' in l), '')
    기간 = next((l.split(':', 1)[1].strip() for l in 머리글 if l.startswith('출고기간')), '')
    줄 = []; 소요 = []; 소요칸 = None; 총 = ''; 칸 = None; 주의 = []
    for pi, pg in enumerate(pdf.pages):
        ws = pg.extract_words()
        ys = [w['top'] for w in ws if w['text'] == '출고처' and w['x0'] < 50]
        ysum = min(ys) - 2 if ys else None
        if ysum is not None:                                   # 끝쪽 원장 소요량 표
            st = pg.crop((0, ysum, pg.width, pg.height)).extract_table()
            소요칸 = [(x or '').replace('\n', '') for x in st[0]][:5]
            last = {}
            for r in st[1:]:
                if r[0] and r[0].replace(' ', '') == '총소요량':
                    총 = [x for x in r if x][-1]; continue
                v = []
                for i in range(4):
                    if r[i] not in (None, ''): last[i] = r[i].replace('\n', ' ')
                    v.append(last.get(i, ''))
                v.append((r[4] or '').replace('\n', ' '))
                소요.append({'v': v})
        tabs = [t for t in pg.find_tables() if ysum is None or t.bbox[1] < ysum]
        if not tabs: continue
        tb = tabs[0]
        cells = [c for c in set(tb.cells) if ysum is None or c[1] < ysum]
        bottom = max(c[3] for c in cells)
        xs = sorted(set(round(c[0], 1) for c in cells))
        xs = [x for i, x in enumerate(xs) if i == 0 or x - xs[i - 1] > 3]
        edges = xs + [tb.bbox[2]]
        mid = [(edges[i] + edges[i + 1]) / 2 for i in range(len(xs))]
        hcell = [c for c in cells if 안(c, mid[0], tb.bbox[1] + 3)][0]; hbot = hcell[3]
        cols = []
        for x in mid:
            top = min([c for c in cells if 안(c, x, tb.bbox[1] + 3)], key=lambda c: c[3] - c[1])
            lab = 글(pg, top, '')
            if top[3] < hbot - 2:                              # 「원 장」 아래 종류·색상·모델명·출고처
                lab = 글(pg, min([c for c in cells if 안(c, x, (top[3] + hbot) / 2)], key=lambda c: c[3] - c[1]), '')
            cols.append(lab)
        if '품목' not in cols: continue
        if 칸 is None: 칸 = cols
        elif cols != 칸: 주의.append(f'{pi+1}쪽 칸이 다름: {cols}')
        segs = [o for o in pg.lines + [r for r in pg.rects if r['height'] < 1.5]
                if abs(o['top'] - o['bottom']) < 1.5 and hbot - 1.5 <= o['top'] <= bottom + 1.5]

        def 선들(ci):
            x = mid[ci]
            hs = sorted(set(round(o['top'], 1) for o in segs if o['x0'] - 1 <= x <= o['x1'] + 1))
            hs = [h for i, h in enumerate(hs) if i == 0 or h - hs[i - 1] > 1.5]
            if not hs or hs[0] > hbot + 2: hs = [hbot] + hs
            if hs[-1] < bottom - 2: hs.append(bottom)
            return hs
        B = [선들(ci) for ci in range(len(cols))]
        pc = cols.index('품목')
        for a, b in zip(B[pc], B[pc][1:]):
            if b - a < 3: continue
            y = (a + b) / 2
            v = []; g = []
            for ci, k in enumerate(cols):
                hs = B[ci]
                ca = max([h for h in hs if h <= y], default=hbot); cb = min([h for h in hs if h > y], default=bottom)
                s = 글(pg, (edges[ci], ca, edges[ci + 1], cb), '' if k == '색상' else ' ')
                if k in ('재단금액', '원장수량', '재단수량'): s = re.sub(r'(?<=\d) (?=[\d,])', '', s)   # 「1 68,000」 → 「168,000」(글자 띄움)
                v.append(s); g.append((pi, ci, round(ca, 1)))
            if not any(v[cols.index(k)] for k in ('품목', '사이즈', '재단수량', '원장수량', '재단금액')):
                continue                                       # 표 아래 빈 줄
            줄.append({'v': v, 'g': g, 'p': pi + 1})
    # 재단일: 빈 칸은 위 날짜를 잇는다(날짜는 합친 칸 가운데에 한 번만 적힌다). 쪽이 넘어가 제품명이 빈 줄은 앞 쪽 값을 잇는다.
    di = 칸.index('재단일'); ni = 칸.index('제품명'); pi_ = 칸.index('품목')
    이을칸 = [i for i, k in enumerate(칸) if i < pi_ and i != di] + [i for i, k in enumerate(칸) if k.startswith('출고') or k == '비고']
    lastd = ''; prev = None
    for r in 줄:
        if not r['v'][di]: r['v'][di] = lastd
        lastd = r['v'][di]
        if prev and r['p'] != prev['p'] and not r['v'][ni]:
            for i in 이을칸:
                if not r['v'][i]: r['v'][i] = prev['v'][i]
        prev = r
    번호 = {}
    for r in 줄:
        r['g'] = [번호.setdefault(k, len(번호) + 1) for k in r['g']]
    return {'달': f'2026-{m:02d}', '파일': NFC(os.path.basename(f)), '쪽수': len(pdf.pages), '제목': 제목, '출고기간': 기간,
            '칸': 칸, '줄': 줄, '소요칸': 소요칸 or [], '소요량': 소요, '총소요량': 총, '주의': 주의,
            '읽은날': datetime.date.today().isoformat()}


def 수(s):
    s = (s or '').replace(',', '').replace('매', '').replace('개', '').strip()
    try: return float(s)
    except ValueError: return None


def 셈(d):
    k = d['칸']; oi = k.index('원장수량'); ai = k.index('재단금액')
    본 = set(); 원장 = 0; 금액 = 0
    for r in d['줄']:
        if r['g'][oi] in 본: continue
        본.add(r['g'][oi]); 원장 += 수(r['v'][oi]) or 0; 금액 += 수(r['v'][ai]) or 0
    return 원장, 금액


# ───────── 창고(Firestore REST) — 납품내역/tools/세부내역검사.py 와 같은 길(익명 로그인) ─────────
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
    for i in range(0, len(ws), 5):
        부름(f'https://firestore.googleapis.com/v1/{뿌리}:commit', {'writes': ws[i:i + 5]}, 토큰)


def main():
    if len(sys.argv) < 2: print(__doc__); sys.exit(1)
    폴더 = sys.argv[1]; 안씀 = '--안씀' in sys.argv
    달들 = {}
    for f in sorted(glob.glob(os.path.join(폴더, '*.pdf'))):
        if not re.search(r'월분', NFC(f)): continue
        d = 한달(f); 달들[d['달']] = d
        원장, 금액 = 셈(d)
        print(f"{d['달']} {d['쪽수']}쪽 줄 {len(d['줄'])} · 원장수량 합 {원장:g} / PDF 총소요량 {d['총소요량']} · 재단금액 합 {금액:,.0f}"
              + (f" · 주의 {d['주의']}" if d['주의'] else ''))
    if '--json' in sys.argv:
        json.dump(달들, open(sys.argv[sys.argv.index('--json') + 1], 'w'), ensure_ascii=False, indent=1)
    if 안씀: return
    문서들 = dict(달들)
    문서들['_달목록'] = {'달들': sorted(달들), '읽은날': datetime.date.today().isoformat()}
    쓰기(문서들)
    print('창고에 씀:', 창고, sorted(문서들))


if __name__ == '__main__':
    main()
