"""한행 입력표 1/2 — 저장소 erp_ 읽기만(입력 작업자 터미널 로그인). 쓰는 법: python3 저장소읽기.py ../../입력작업자/스크립트 <빈 폴더(저장소 밖, 깃에 넣지 말 것)>"""
import sys, json, urllib.request
sys.path.insert(0, sys.argv[1])
import 작업자표 as W
out = sys.argv[2]
cols = 'erp_vendors erp_workcenters erp_classes erp_items erp_materials erp_processes erp_flows erp_boms erp_itemflows erp_itemmats erp_itemwcs erp_contracts erp_purprices erp_imporders erp_impbls erp_impins erp_imppays erp_impinvs'.split()
tok = W.token()
def val(v):
    k = list(v)[0]; x = v[k]
    if k == 'mapValue': return {a: val(b) for a, b in x.get('fields', {}).items()}
    if k == 'arrayValue': return [val(i) for i in x.get('values', [])]
    if k in ('integerValue',): return int(x)
    return x
for c in cols:
    docs = []; pt = ''
    while True:
        u = W.DB + c + '?pageSize=300' + ('&pageToken=' + pt if pt else '')
        try:
            with urllib.request.urlopen(urllib.request.Request(u, headers={'Authorization': 'Bearer ' + tok})) as r: j = json.load(r)
        except Exception as e:
            print(c, 'ERR', e); break
        for d in j.get('documents', []):
            docs.append({'_id': d['name'].split('/')[-1], **{a: val(b) for a, b in d.get('fields', {}).items()}})
        pt = j.get('nextPageToken')
        if not pt: break
    json.dump(docs, open(f'{out}/{c}.json', 'w'), ensure_ascii=False, indent=1)
    print(c, len(docs))
