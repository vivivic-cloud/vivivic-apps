"""질문 올리기·보기 — 입력폼 v369 「질문」(파이어스토어 erp_questions, 질문 하나 = 문서 하나).

사장님 11-28 「4 페이지를 만들자」: 작업자가 막힌 것을 그 화면 자리에 질문으로 올리면, 사장님이 그 화면(또는 입력폼 머리 「답 없는 질문」)에서 답한다.

쓰는 법(토큰 = 작업자표.py — 입력 작업자 열쇠):
  python3 질문올리기.py 자리                       자리 목록(입력폼 메뉴 · 발주역입력 페이지)
  python3 질문올리기.py 올림 <자리> "<질문>" [보낸이] [--곳 "거래처/탭/…"]   대기 질문 한 장 → 문서 id 찍음
      --곳 = 그 페이지 안 자리(화면 단추 글자 그대로, / 로): 발주역입력 = 「현진산업/구매+가공품목/구매자재」 꼴 · 입력폼 = 안 씀(메뉴가 곧 자리)
      → 문서 「링크」 = 발주역입력/보드매입현황.html#현진산업/구매%2B가공품목/구매자재 (사장님 질문 카드의 링크 · 열면 그 자리로)
  python3 질문올리기.py 보기 [자리]                 질문·상태·답(자리 주면 그 자리만)
  python3 질문올리기.py 실행함 <문서 id>            답대로 한 뒤 상태 「실행함」
자리 = '입력폼/<메뉴 키>'(예: 입력폼/classes) · '발주역입력/<파일 이름>'(예: 발주역입력/재단).
⚠ 답을 언제 볼지(사장님 「답했어」 / 몇 분마다)는 사장님이 정한다 — 저절로 도는 확인을 만들지 말 것.
⚠ 공개 저장소 — 질문 글에 단가·계정·비밀번호를 쓰지 말 것(정리 때 깃 작업일지로 옮겨짐).
⚠ 쓰기 403 = 입력 작업자 권한을 담당자 관리에서 한 번 다시 저장해야 함(v369 가 모든 메뉴 권한에 erp_questions 를 더함).
"""
import json, os, re, sys, time, urllib.error, urllib.parse, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import 작업자표 as A

COL = 'erp_questions'
뿌리 = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))


def 자리목록():
    """입력폼 메뉴 키·이름(STEPS 와 특별 메뉴) + 발주역입력 페이지(입력폼 머리 #topnav 링크). 화면 글자 그대로."""
    s = open(os.path.join(뿌리, '영림원외주입력', '영림원외주입력.html'), encoding='utf-8').read()
    out = []
    for k, n, t in re.findall(r"^\{key:'([a-z0-9]+)',n:([^,]+),(?:[^\n]*?)title:'([^']*)'", s, re.M):
        if "hidden:1" in re.search(r"^\{key:'" + k + r"'[^\n]*", s, re.M).group(0):
            continue
        n = n.strip("'")
        out.append(('입력폼/' + k, '입력폼 › ' + ((n + '. ') if n.isdigit() else '') + t))
    for k, t in [('bdreg', '구매자재 일괄등록'), ('bdmix', '구매+가공품목'), ('pdm', '구매발주납품 관리'), ('vappr', '구매/발주 품의'),
                 ('vpnames', '벤더피아 상품명연결'), ('stocks', '물류 · [물류] 재고현황'), ('staff', '담당자 관리'), ('vperm', '거래처별 발주권한관리'), ('ids', '아이디관리')]:
        out.append(('입력폼/' + k, '입력폼 › ' + t))
    nav = s[s.index('id="topnav"'):s.index('</header>')]
    for href, t in re.findall(r'href="\.\./발주역입력/([^"]+)\.html">([^<]+)</a>', nav):
        out.append(('발주역입력/' + href, '발주역입력 › ' + t.strip()))
    return out


def 값(v):
    return {'stringValue': str(v)} if not isinstance(v, bool) else {'booleanValue': v}


def 풀기(d):
    f = d.get('fields', {})
    o = {k: (x.get('stringValue') if 'stringValue' in x else x.get('booleanValue')) for k, x in f.items()}
    o['id'] = d['name'].rsplit('/', 1)[1]
    return o


def 요청(method, url, body=None):
    r = urllib.request.Request(url, method=method, data=json.dumps(body).encode() if body is not None else None,
                               headers={'Authorization': 'Bearer ' + A.token(), 'Content-Type': 'application/json'})
    with urllib.request.urlopen(r) as x:
        t = x.read()
        return json.loads(t) if t else {}


def 모두():
    out, pt = [], ''
    while True:
        j = 요청('GET', A.DB + COL + '?pageSize=300' + ('&pageToken=' + urllib.parse.quote(pt) if pt else ''))
        out += [풀기(d) for d in j.get('documents', [])]
        pt = j.get('nextPageToken')
        if not pt:
            return sorted(out, key=lambda q: q.get('만든때') or '')


def 지금():
    return time.strftime('%Y-%m-%dT%H:%M:%S', time.gmtime()) + '.000Z'


if __name__ == '__main__':
    a = sys.argv[1:]
    try:
        if not a or a[0] == '자리':
            for k, n in 자리목록():
                print(k.ljust(28), n)
        elif a[0] == '올림' and len(a) >= 3:
            곳 = ''
            if '--곳' in a:
                i = a.index('--곳'); 곳 = a[i + 1] if i + 1 < len(a) else ''; a = a[:i] + a[i + 2:]
            이름 = dict(자리목록()).get(a[1])
            if not 이름:
                sys.exit('자리 「%s」 없음 — python3 질문올리기.py 자리' % a[1])
            doc = {'자리': a[1], '자리이름': 이름, '질문': a[2].strip(), '보낸이': a[3] if len(a) > 3 else '입력 작업자',
                   '만든때': 지금(), '상태': '대기', '답': '', '답한때': '', '답한이': ''}
            k = a[1].split('/', 1)
            doc['링크'] = ('영림원외주입력/영림원외주입력.html#' + urllib.parse.quote(k[1], safe='') if k[0] == '입력폼'
                          else '발주역입력/' + k[1] + '.html' + ('#' + '/'.join(urllib.parse.quote(x, safe='') for x in 곳.split('/') if x) if 곳 else ''))
            j = 요청('POST', A.DB + COL, {'fields': {k: 값(v) for k, v in doc.items()}})
            print('올림', j['name'].rsplit('/', 1)[1], 이름)
        elif a[0] == '보기':
            for q in 모두():
                if len(a) > 1 and q.get('자리') != a[1]:
                    continue
                print('[%s] %s · %s · %s\n  질문: %s' % (q.get('상태') or '대기', q['id'], q.get('자리이름') or q.get('자리'), q.get('만든때'), q.get('질문')))
                if q.get('답'):
                    print('  답: %s (%s %s)' % (q['답'], q.get('답한이') or '', q.get('답한때') or ''))
        elif a[0] == '실행함' and len(a) == 2:
            요청('PATCH', A.DB + COL + '/' + a[1] + '?updateMask.fieldPaths=%EC%83%81%ED%83%9C&updateMask.fieldPaths=%EC%8B%A4%ED%96%89%ED%95%9C%EB%95%8C'
                 + '&currentDocument.exists=true', {'fields': {'상태': 값('실행함'), '실행한때': 값(지금())}})
            print('실행함', a[1])
        else:
            print(__doc__)
    except urllib.error.HTTPError as e:
        sys.exit('저장소 %s — %s' % (e.code, e.read().decode()[:300]))
