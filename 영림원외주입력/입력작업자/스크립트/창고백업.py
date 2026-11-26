"""입력폼 저장소(erp_*) 백업 — 지우기 전에 JSON 으로 내려받는다(11-17 1:1 맞춤).

쓰는 법:  python3 창고백업.py [컬렉션 …]
  - 컬렉션을 안 주면 아래 ALL 전부.
  - 저장 자리 = ~/.vivivic/backup/<날짜시각>/<컬렉션>.json  (⚠ 저장소 밖 — 업무 자료라 깃에 넣지 않는다)
  - 열쇠 = 작업자표.py 의 입력 작업자 열쇠(읽기 권한 있는 컬렉션만 받힘, 403 이면 그 이름만 적고 넘어감).
되돌리기: 백업 JSON 의 문서를 같은 id 로 다시 쓰면 된다(필요할 때 사장님 허락 뒤).
  ⚠ 11-26 폼 v344 나눔 저장: erp_contracts 머리 문서({id}, __parts)와 조각 문서({id}~c0 …, __part:1)를 원래 꼴 그대로 함께 받는다 —
    되돌릴 때 머리와 조각을 모두 같은 id 로 쓴다(조각만 빠지면 rows 가 빈다). 건수는 머리만 세고 조각 수를 따로 찍는다.
"""
import json, os, sys, time, urllib.error, urllib.parse, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import 작업자표 as A

ALL = ['erp_vendors', 'erp_workcenters', 'erp_classes', 'erp_items', 'erp_materials', 'erp_processes', 'erp_flows', 'erp_boms',
       'erp_itemflows', 'erp_itemmats', 'erp_itemwcs', 'erp_contracts', 'erp_imporders', 'erp_imppays', 'erp_impinvs', 'erp_impbls',
       'erp_impins', 'erp_purprices', 'erp_purreqs', 'erp_purapprs', 'erp_purords', 'erp_purchases', 'erp_pomods', 'erp_purdelvs',
       'erp_purcalcs', 'erp_purcalcdocs', 'erp_prods', 'erp_proddlvs', 'erp_prodmoves', 'erp_setitems', 'erp_imports', 'erp_stocks',
       'erp_rates', 'erp_vreqs', 'erp_purflow', 'erp_purship', 'erp_pobox', 'erp_pointok', 'erp_podocs', 'erp_asmbox', 'erp_asmlink',
       'erp_prodconfirm', 'erp_vperms', 'erp_agentq', 'erp_basic', 'erp_poship']


def grab(col):
    out, pt = [], ''
    while True:
        u = A.DB + urllib.parse.quote(col) + '?pageSize=300' + ('&pageToken=' + urllib.parse.quote(pt) if pt else '')
        with urllib.request.urlopen(urllib.request.Request(u, headers={'Authorization': 'Bearer ' + A.token()})) as r:
            j = json.load(r)
        out += j.get('documents', [])   # Firestore REST 원래 꼴 그대로(값 종류까지) — 다시 쓸 때 그대로 넣을 수 있음
        pt = j.get('nextPageToken')
        if not pt:
            return out


if __name__ == '__main__':
    cols = sys.argv[1:] or ALL
    d = os.path.expanduser('~/.vivivic/backup/' + time.strftime('%Y%m%d-%H%M%S'))
    os.makedirs(d, mode=0o700, exist_ok=True)
    for c in cols:
        try:
            docs = grab(c)
        except urllib.error.HTTPError as e:
            print(c, '못 받음', e.code)
            continue
        with open(os.path.join(d, c + '.json'), 'w') as f:
            json.dump(docs, f, ensure_ascii=False)
        part = sum(1 for x in docs if 'fields' in x and '__part' in x['fields'])
        print(c, len(docs) - part, '(조각 %d 함께)' % part if part else '')
    print('저장:', d)
