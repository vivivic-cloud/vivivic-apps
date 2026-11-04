#!/usr/bin/env python3
# BOM등록업로드(500302) 「파일선택 → 데이터가져오기」용 엑셀을 폼 erp_boms 「대기」 문서로 만든다. 영림원·폼에 쓰지 않는다(읽기만).
# 쓰는 법: python3 BOM업로드-엑셀만들기.py <나갈 파일.xlsx> [모품목번호 …]   — 번호를 주면 그 BOM 만, 안 주면 대기 전부.
#   --추가 를 붙이면 수정대기 BOM 의 edit.added 줄만(폼 v58 엣지필름 줄). ⚠ 이 파일을 올려 줄이 더해지는지는 확인 못 함 — AGENTS.md 3-4-엣지 를 먼저 한다.
#   ⚠ 만든 엑셀은 업무 자료다 — git 밖(scratchpad 등)에 두고 커밋하지 않는다.
# 꼴: 시트 이름 = 화면 「엑셀시트명」 BOM일괄업로드 · 하위품목 한 줄 = 한 행(모품목 4칸을 줄마다 되풀이). 차수는 글자 「00」(하위BOM차수 빈칸 = 00 — 영림원도 00 을 넣음) ·
#   하위유무 = 1/0 · 폼에 없는 칸은 비움(모품목단위·기준단위·품목자산분류는 영림원이 채움).
#   ⚠ 1행만 칸 이름으로 만든 엑셀(11-03 첫 시도)은 서버에 올라가도 표에 아무 줄도 안 나왔다.
import json, sys, urllib.request
from openpyxl import Workbook

KEY = 'AIzaSyB9X_hzd2D3goQ7oenK53Pz805P1c7oSqs'
DB = 'https://firestore.googleapis.com/v1/projects/vivivic-4b7ef/databases/(default)/documents/'
# 공식 양식(「양식다운로드」 RptWPDBOMMulti.xlsx, 11-03 받음) 시트 BOM일괄업로드 = 1행 필드 이름 · 2행 한글 칸 이름 · 3행부터 자료 · A열 순번.
#   양식 37칸에는 하위유무(HaveChild)가 없다(「샘플」 시트에만 있음) → 맨 끝에 붙인다.
COLS = [('IDX_NO', '순번'), ('ItemName', '모품목명'), ('ItemNo', '모품목번호'), ('ItemSpec', '모품목규격'), ('ItemBomRevName', '모품목BOM차수'), ('ItemUnitName', '모품목단위'),
        ('ProcName', '공정'), ('UserSeq', '표시순서'), ('SubItemName', '하위품명'), ('SubItemNo', '하위품번'), ('SubItemSpec', '하위규격'), ('SubItemBomRevName', '하위BOM차수'),
        ('SubUnitName', '투입단위'), ('NeedQtyNumerator', '소요량(분자)'), ('NeedQtyDenominator', '소요량(분모)'), ('IsBOMOnly', 'BOM조회용'), ('IsIncludeProcMat', '하위공정소요자재포함'),
        ('InLossRate', '사내Loss율'), ('OutLossRate', '사외Loss율'), ('FrApplyDate', '적용시작일'), ('ToApplyDate', '적용종료일'), ('Location', '조립위치'),
        ('Remark', '비고'), ('Remark1', '비고1'), ('Remark2', '비고2'), ('Remark3', '비고3'), ('Remark4', '비고4'), ('Remark5', '비고5'), ('Remark6', '비고6'), ('Remark7', '비고7'),
        ('Remark8', '비고8'), ('Remark9', '비고9'), ('Remark10', '비고10'), ('StkUnitName', '기준단위'), ('AssetName', '품목자산분류'), ('GoodSeq', '제품코드'), ('GoodBomRev', '제품BOM차수'),
        ('HaveChild', '하위유무')]


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
    args = [a for a in sys.argv[1:] if a != '--추가']
    add = '--추가' in sys.argv
    out, only = args[0], set(args[1:])
    tok = get('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + KEY, {'returnSecureToken': True})['idToken']
    docs, pt = [], ''
    while True:
        r = get(DB + 'erp_boms?pageSize=300' + ('&pageToken=' + pt if pt else ''), tok=tok)
        docs += r.get('documents', [])
        pt = r.get('nextPageToken')
        if not pt: break
    boms = [{k: val(v) for k, v in d['fields'].items()} for d in docs]
    boms = [b for b in boms if b.get('status') == ('수정대기' if add else '대기') and (not only or b.get('pcode') in only)]
    if add:
        boms = [dict(b, rows=(b.get('edit') or {}).get('added') or []) for b in boms]
        boms = [b for b in boms if b['rows']]
    boms.sort(key=lambda b: b.get('createdAt', ''))
    wb = Workbook(); ws = wb.active; ws.title = 'BOM일괄업로드'
    ws.append([c[0] for c in COLS])
    ws.append([c[1] for c in COLS])
    n = 0
    for b in boms:
        for r in b.get('rows', []):
            n += 1
            row = {'IDX_NO': n, 'ItemName': b['pname'], 'ItemNo': b['pcode'], 'ItemSpec': b.get('pspec') or None, 'ItemBomRevName': b['pver'],
                   'ProcName': r['proc'], 'UserSeq': num(r.get('order')), 'SubItemName': r['cname'], 'SubItemNo': r['ccode'], 'SubItemSpec': r.get('cspec') or None,
                   'SubItemBomRevName': r.get('cver') or '00', 'SubUnitName': r['inunit'], 'NeedQtyNumerator': num(r['qn']), 'NeedQtyDenominator': num(r['qd']),
                   'HaveChild': 1 if r.get('hasSub') else 0}
            ws.append([row.get(c[0]) for c in COLS])
    for col in ('E', 'L'):   # 차수는 글자로
        for c in ws[col][2:]:
            c.number_format = '@'
    wb.save(out)
    print(json.dumps({'BOM': len(boms), '줄': n, '모품목': [b['pcode'] for b in boms]}, ensure_ascii=False))


main()
