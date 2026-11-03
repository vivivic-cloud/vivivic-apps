#!/usr/bin/env python3
# BOM등록업로드(500302) 「파일선택 → 데이터가져오기」용 엑셀을 폼 erp_boms 「대기」 문서로 만든다. 영림원·폼에 쓰지 않는다(읽기만).
# 쓰는 법: python3 BOM업로드-엑셀만들기.py <나갈 파일.xlsx> [모품목번호 …]   — 번호를 주면 그 BOM 만, 안 주면 대기 전부.
#   ⚠ 만든 엑셀은 업무 자료다 — git 밖(scratchpad 등)에 두고 커밋하지 않는다.
# 꼴(11-03 실제 화면 SSNew 30칸 글자 그대로): 시트 이름 = 화면 「엑셀시트명」 BOM일괄업로드 · 1행 = 칸 이름 · 2행부터 하위품목 한 줄 = 한 행(모품목 4칸을 줄마다 되풀이).
#   차수(모품목BOM차수·하위BOM차수)는 글자 「00」(숫자로 두면 0 이 됨) · 하위유무 = 1/0 · 폼에 없는 칸은 비움(모품목단위·기준단위·품목자산분류는 영림원이 채움).
import json, sys, urllib.request
from openpyxl import Workbook

KEY = 'AIzaSyB9X_hzd2D3goQ7oenK53Pz805P1c7oSqs'
DB = 'https://firestore.googleapis.com/v1/projects/vivivic-4b7ef/databases/(default)/documents/'
COLS = ['모품목명', '모품목번호', '모품목규격', '모품목BOM차수', '모품목단위', '공정', '표시순서', '하위품명', '하위품번', '하위규격', '하위BOM차수', '투입단위',
        '소요량(분자)', '소요량(분모)', '하위유무', 'BOM조회용', '하위공정소요자재포함', '사내Loss율', '사외Loss율', '적용시작일', '적용종료일', '조립위치',
        '비고', '비고1', '비고2', '비고3', '비고4', '비고5', '기준단위', '품목자산분류']


def get(url, data=None, tok=None):
    req = urllib.request.Request(url, data=json.dumps(data).encode() if data is not None else None, headers={'content-type': 'application/json', **({'Authorization': 'Bearer ' + tok} if tok else {})})
    return json.load(urllib.request.urlopen(req))


def val(v):
    if 'stringValue' in v: return v['stringValue']
    if 'integerValue' in v: return int(v['integerValue'])
    if 'doubleValue' in v: return v['doubleValue']
    if 'booleanValue' in v: return v['booleanValue']
    if 'arrayValue' in v: return [val(x) for x in v['arrayValue'].get('values', [])]
    if 'mapValue' in v: return {k: val(x) for k, x in v['mapValue'].get('fields', {}).items()}
    return None


def num(x):
    if x in (None, ''): return None
    f = float(x)
    return int(f) if f == int(f) else f


def main():
    out, only = sys.argv[1], set(sys.argv[2:])
    tok = get('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + KEY, {'returnSecureToken': True})['idToken']
    docs, pt = [], ''
    while True:
        r = get(DB + 'erp_boms?pageSize=300' + ('&pageToken=' + pt if pt else ''), tok=tok)
        docs += r.get('documents', [])
        pt = r.get('nextPageToken')
        if not pt: break
    boms = [{k: val(v) for k, v in d['fields'].items()} for d in docs]
    boms = [b for b in boms if b.get('status') == '대기' and (not only or b.get('pcode') in only)]
    boms.sort(key=lambda b: b.get('createdAt', ''))
    wb = Workbook(); ws = wb.active; ws.title = 'BOM일괄업로드'
    ws.append(COLS)
    n = 0
    for b in boms:
        for r in b.get('rows', []):
            row = {'모품목명': b['pname'], '모품목번호': b['pcode'], '모품목규격': b.get('pspec') or None, '모품목BOM차수': b['pver'],
                   '공정': r['proc'], '표시순서': num(r.get('order')), '하위품명': r['cname'], '하위품번': r['ccode'], '하위규격': r.get('cspec') or None,
                   '하위BOM차수': r.get('cver') or None, '투입단위': r['inunit'], '소요량(분자)': num(r['qn']), '소요량(분모)': num(r['qd']), '하위유무': 1 if r.get('hasSub') else 0}
            ws.append([row.get(c) for c in COLS])
            n += 1
    for col in ('D', 'K'):   # 차수는 글자로
        for c in ws[col][1:]:
            c.number_format = '@'
    wb.save(out)
    print(json.dumps({'BOM': len(boms), '줄': n, '모품목': [b['pcode'] for b in boms]}, ensure_ascii=False))


main()
