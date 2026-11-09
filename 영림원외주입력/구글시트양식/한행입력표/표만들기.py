"""한행 입력표 2/2 — 읽은 JSON → xlsx(칸 머리 메모·드롭다운·VLOOKUP). 쓰는 법: python3 표만들기.py <읽은 폴더> <저장소 밖>/표.xlsx → 드라이브에 올리면 구글시트. 4제품(PROD) 기준 — 다른 제품은 PROD 를 바꿈. 결과 xlsx·JSON 은 업무 자료라 깃에 넣지 않는다."""
import json, sys
from openpyxl import Workbook
from openpyxl.comments import Comment
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.styles import PatternFill, Font, Alignment
from openpyxl.utils import get_column_letter as CL
D = sys.argv[1]; OUT = sys.argv[2]
L = lambda c: json.load(open(f'{D}/{c}.json'))
items = {d['code']: d for d in L('erp_items')}
mats = {d['code']: d for d in L('erp_materials')}
boms = {d['pcode']: d for d in L('erp_boms')}
iflows = {d['code']: d for d in L('erp_itemflows')}
imats = {d['code']: d for d in L('erp_itemmats')}
flows = {d['name']: d for d in L('erp_flows')}
procs = {d['name']: d for d in L('erp_processes')}
wcs = {d['name']: d for d in L('erp_workcenters')}
vendors = {d['name']: d for d in L('erp_vendors') if d.get('status') == '완료'}
classes = L('erp_classes')
purp = L('erp_purprices'); impbl = L('erp_impbls'); impin = L('erp_impins')
iw = {}
for w in L('erp_itemwcs'): iw.setdefault((w['code'], int(w['seq'])), []).append(w)
ct = {}
for k in L('erp_contracts'):
    for r in k['rows']: ct.setdefault((r['pcode'], int(r['pseq'])), []).append((k, r))

PROD = ['T-al12h', 'T-al12mh', 'T-al80h', 'T-al8mh']
parts = sorted({r['ccode'] for p in PROD for r in boms[p]['rows']})
CODES = PROD + parts
matcodes = sorted({r['ccode'] for p in parts for r in boms[p]['rows']})
cls_kind = {c['name']: c['kind'] for c in classes if c.get('status') == '완료'}
def split3(s):
    a = [x.strip() for x in (s or '').split('>')]
    return (a + ['', '', ''])[:3]

wb = Workbook()
GROUPFILL = ['DDEBF7', 'E2EFDA', 'FFF2CC', 'FCE4D6', 'EDEDED', 'D9E1F2', 'E4DFEC', 'FFE699', 'C6E0B4']
AUTOFILL = PatternFill('solid', fgColor='F2F2F2')
HF = Font(bold=True, name='Arial', size=10); BF = Font(name='Arial', size=10)
AF = Font(name='Arial', size=10, color='595959')

def sheet(ws, cols, rows, freeze='B3'):
    """cols: list of dict(g, h, note, get(row,rIdx)->value, auto, dv, w)"""
    groups = []
    for i, c in enumerate(cols, 1):
        if not groups or groups[-1][0] != c['g']: groups.append([c['g'], i, i])
        else: groups[-1][2] = i
    for gi, (g, a, b) in enumerate(groups):
        fill = PatternFill('solid', fgColor=GROUPFILL[gi % len(GROUPFILL)])
        ws.cell(1, a, g).font = HF
        if b > a: ws.merge_cells(start_row=1, start_column=a, end_row=1, end_column=b)
        for i in range(a, b + 1):
            ws.cell(1, i).fill = fill; ws.cell(2, i).fill = fill
            ws.cell(1, i).alignment = Alignment(horizontal='center')
    dvs = {}
    for i, c in enumerate(cols, 1):
        h = ws.cell(2, i, c['h']); h.font = HF; h.alignment = Alignment(wrap_text=True, vertical='center')
        h.comment = Comment(c['note'], 'VIVIVIC', width=320, height=110)
        ws.column_dimensions[CL(i)].width = c.get('w', 14)
        for r, row in enumerate(rows, 3):
            v = c['get'](row, r)
            cell = ws.cell(r, i, v if v != '' else None)
            cell.font = AF if c.get('auto') else BF
            if c.get('auto'): cell.fill = AUTOFILL
        if c.get('auto') and not rows: pass
        if c.get('auto'):   # 자동 칸은 빈 행 100줄까지 수식을 미리 깐다
            for r in range(3 + len(rows), 103):
                ws.cell(r, i, c['get'](None, r)).fill = AUTOFILL
        if c.get('dv'):
            dvs.setdefault(c['dv'], []).append(CL(i))
    for f, letters in dvs.items():
        dv = DataValidation(type='list', formula1=f, allow_blank=True, showErrorMessage=False)
        for l in letters: dv.add(f'{l}3:{l}102')
        ws.add_data_validation(dv)
    ws.freeze_panes = freeze
    ws.row_dimensions[2].height = 42

def LST(*a): return '"' + ','.join(a) + '"'
UNITS = LST('M', 'EA', 'SET', 'KG', 'TON', 'G', 'BOX', 'L', 'ml')
STATES = LST('임시', '사용', '생산중지', '거래중지', '폐기')
IO = LST('내자', '외자'); IMP = LST('A등급', 'B등급', 'C등급'); TF = LST('TRUE', 'FALSE')
R = lambda sh: f"'{sh}'!$A$3:$A$102"

# ---------- 품목 ----------
ws = wb.active; ws.title = '품목'
def it(k): return lambda c, r: items[c].get(k, '')
cols = []
G4 = '4 품목등록'
for k, h, extra in [('code', '품번', {}), ('name', '품명', {'w': 34}), ('spec', '규격', {}), ('eng', '영문명', {}),
                    ('asset', '품목자산분류', {'dv': LST('상품', '제품', '반제품', '세트품')}), ('state', '품목상태', {'dv': STATES}),
                    ('io', '내외자구분', {'dv': IO}), ('imp', '중요도', {'dv': IMP}), ('unit', '기준단위', {'dv': UNITS}),
                    ('rep', '대표품목', {'dv': TF})]:
    cols.append(dict(g=G4, h=h, note=f'4단계 품목등록 · 「{h}」 (erp_items.{k})', get=it(k), **extra))
G3 = '3 품목대중소분류정의'
cols.append(dict(g=G3, h='품목구분', note='3단계 품목대중소분류정의 · 「품목구분」 (erp_classes.kind). 품목은 제상품', dv=LST('제상품', '자재'),
                 get=lambda c, r: cls_kind.get(split3(items[c].get('small'))[2], '')))
for n, h in enumerate(['대분류', '중분류', '소분류']):
    cols.append(dict(g=G3, h=h, w=26, note=f'3단계 품목대중소분류정의 · 「{h}」 (erp_classes.{["big","mid","name"][n]}). 세 칸을 「대 > 중 > 소」로 이으면 4단계 「품목소분류」(erp_items.small)',
                     get=(lambda n: lambda c, r: split3(items[c].get('small'))[n])(n)))
cols.append(dict(g='8 품목별공정흐름유형등록', h='공정흐름유형', w=20, dv=R('공정흐름유형'),
                 note='8단계 품목별공정흐름유형등록 · 「공정흐름유형」 (erp_itemflows.flow). 목록 = 공정흐름유형 시트. 공정순서1·2·3 = 이 흐름의 공정 순서',
                 get=lambda c, r: iflows[c]['flow']))
G7 = '7 BOM등록업로드'
cols.append(dict(g=G7, h='모품목BOM차수', note='7단계 BOM등록업로드 · 「모품목BOM차수」 (erp_boms.pver). 모품목명·모품목번호·모품목규격 = 이 행의 품명·품번·규격',
                 get=lambda c, r: boms[c]['pver']))
start_bom = len(cols) + 1
def brow(c, i): rows = boms[c]['rows']; return rows[i] if i < len(rows) else None
def LK(colL, r, k):
    x = f'{colL}{r}'
    return f"=IF({x}=\"\",\"\",IFERROR(VLOOKUP({x},'원장·자재'!$A:$I,{k},FALSE),IFERROR(VLOOKUP({x},'품목'!$A:$I,{k},FALSE),\"\")))"
for i in range(10):
    n = i + 1
    base = len(cols) + 1; codeL = CL(base + 1)
    cols.append(dict(g=G7, h=f'공정{n}', dv=R('공정'), note=f'7단계 BOM등록업로드 줄{n} · 「공정」 (erp_boms.rows.proc). 표시순서 = {n}',
                     get=(lambda i: lambda c, r: (brow(c, i) or {}).get('proc', '') if c else '')(i)))
    cols.append(dict(g=G7, h=f'하위품번{n}', dv="'목록'!$A$2:$A$201",
                     note=f'7단계 BOM등록업로드 줄{n} · 「하위품번」 (erp_boms.rows.ccode). 제품 행 = 품목 시트 부속 품번, 부속 행 = 원장·자재 시트 자재번호. 목록 밖 입력 됨',
                     get=(lambda i: lambda c, r: (brow(c, i) or {}).get('ccode', '') if c else '')(i)))
    for h, k, fld in [('하위품명', 2, 'cname'), ('하위규격', 3, 'cspec'), ('투입단위', 9, 'inunit')]:
        cols.append(dict(g=G7, h=f'{h}{n}', auto=1, w=22 if k == 2 else 12,
                         note=f'자동(입력 안 함) · 7단계 「{h}」 (erp_boms.rows.{fld}) = 하위품번{n} 으로 원장·자재 또는 품목 시트에서 찾음',
                         get=(lambda cl, k: lambda c, r: LK(cl, r, k))(codeL, k)))
    cols.append(dict(g=G7, h=f'소요량(분자){n}', note=f'7단계 BOM등록업로드 줄{n} · 「소요량(분자)」 (erp_boms.rows.qn)',
                     get=(lambda i: lambda c, r: float((brow(c, i) or {}).get('qn')) if c and brow(c, i) else '')(i)))
    cols.append(dict(g=G7, h=f'소요량(분모){n}', note=f'7단계 BOM등록업로드 줄{n} · 「소요량(분모)」 (erp_boms.rows.qd)',
                     get=(lambda i: lambda c, r: float((brow(c, i) or {}).get('qd')) if c and brow(c, i) else '')(i)))
    cols.append(dict(g=G7, h=f'결방향 있음{n}', dv=TF, note=f'7단계 BOM 줄{n} · 「결방향 있음」 (erp_boms.rows.grain). 폼 계산용 칸, 영림원에 안 보냄',
                     get=(lambda i: lambda c, r: bool(brow(c, i).get('grain')) if c and brow(c, i) else '')(i)))
    cols.append(dict(g=G7, h=f'단가{n}', auto=1, note=f'자동(입력 안 함) · 원장·자재 시트 구매단가등록 「단가」(구매거래처 첫째) = 하위품번{n}. 통화는 원장·자재 시트 「통화」',
                     get=(lambda cl: lambda c, r: f"=IF({cl}{r}=\"\",\"\",IFERROR(VLOOKUP({cl}{r},'원장·자재'!$A:$Q,17,FALSE),\"\"))")(codeL)))
G9 = '9 제품별공정별소요자재일괄등록'
cols.append(dict(g=G9, h='공정차수', note='9단계 · 「공정차수」 (erp_itemmats.rev). 10단계 공정차수·11단계 공정차수도 같은 값', get=lambda c, r: imats[c]['rev']))
cols.append(dict(g=G9, h='BOM차수', note='9단계 · 「BOM차수」 (erp_itemmats.bomRev). 소요자재 줄(mats)은 위 BOM 줄 그대로, 조달구분 = 원장 구매 / 부속 제작', get=lambda c, r: imats[c]['bomRev']))
G5 = '5 자재등록(재공품)'
def wip(c, s):
    for m in mats.values():
        if m.get('wipOf') == c and int(m.get('wipSeq', 0)) == s: return m
    return None
for s in (1, 2):
    cols.append(dict(g=G5, h=f'공정순서{s} 재공품 자재번호', note=f'5단계 자재등록 · 「자재번호」 (erp_materials.code, 재공품). 공정순서{s} 공정을 마친 재공품 = 품번_{s}. 품목자산분류 재공품 · 소분류 T재공품 > T재공품 > T재공품 · EA',
                     get=(lambda s: lambda c, r: (wip(c, s) or {}).get('code', ''))(s)))
    cols.append(dict(g=G5, h=f'공정순서{s} 재공품 자재명', w=26, note=f'5단계 자재등록 · 「자재명」 (erp_materials.name, 재공품 공정순서{s})',
                     get=(lambda s: lambda c, r: (wip(c, s) or {}).get('name', ''))(s)))
G10 = '10 제품별공정별워크센터등록'
cols.append(dict(g=G10, h='시간단위', dv=LST('분'), note='10단계 · 「시간단위」 (erp_itemwcs.tunit). 모든 공정 같은 값', get=lambda c, r: iw[(c, 1)][0]['tunit']))
cols.append(dict(g=G10, h='표준작업시간', note='10단계 · 「표준작업시간」 (erp_itemwcs.time). 모든 공정 같은 값', get=lambda c, r: iw[(c, 1)][0]['time']))
def wcat(c, s, k):
    L_ = sorted(iw.get((c, s), []), key=lambda w: w['rank'])
    return L_[k - 1]['wc'] if len(L_) >= k else ''
for s in (1, 2, 3):
    for k in (1, 2, 3):
        cols.append(dict(g=G10, h=f'공정순서{s} 워크센터(우선순위{k})', dv=R('워크센터'),
                         note=f'10단계 · 공정순서 {s} 공정의 「워크센터」 (erp_itemwcs.wc), 「우선순위」 {k} (erp_itemwcs.rank). 공정 = 공정흐름유형의 {s}번째',
                         get=(lambda s, k: lambda c, r: wcat(c, s, k))(s, k)))
G11 = '11 외주계약등록'
def c1(c, s): return (ct.get((c, s)) or [(None, None)])[0]
cols.append(dict(g=G11, h='사업단위', dv=LST('본사'), note='11단계 외주계약등록 · 「사업단위」 (erp_contracts.unit)', get=lambda c, r: c1(c, 1)[0].get('unit', '본사')))
for h, k, dv in [('통화', 'cur', LST('KRW', 'CNY', 'USD')), ('정산기준', 'basis', None), ('부가세포함여부', 'vat', TF), ('적용시작일', 'from', None)]:
    cols.append(dict(g=G11, h=h, dv=dv, note=f'11단계 · 「{h}」 (erp_contracts.rows.{k}). 모든 공정 같은 값',
                     get=(lambda k: lambda c, r: c1(c, 1)[1][k])(k)))
for s in (1, 2, 3):
    cols.append(dict(g=G11, h=f'공정순서{s} 외주품번', note=f'11단계 · 공정순서 {s} 「외주품번」 (erp_contracts.rows.ocode). 마지막 공정 = 이 품번, 앞 공정 = 그 공정 재공품',
                     get=(lambda s: lambda c, r: (c1(c, s)[1] or {}).get('ocode', ''))(s)))
    cols.append(dict(g=G11, h=f'공정순서{s} 외주단가', note=f'11단계 · 공정순서 {s} 「외주단가」 (erp_contracts.rows.price). 외주거래처 = 이 공정 워크센터 업체 모두(같은 단가)',
                     get=(lambda s: lambda c, r: (c1(c, s)[1] or {}).get('price', ''))(s)))
# 외주거래처 = 워크센터 확인
for c in CODES:
    for s in (1, 2, 3):
        a = sorted(k['vendor'] for k, _ in ct.get((c, s), [])); b = sorted(wcs[w['wc']]['vendor'] for w in iw.get((c, s), []))
        if a != b: print('외주거래처≠워크센터', c, s, a, b)
        if len({r['price'] for _, r in ct.get((c, s), [])}) > 1: print('업체별 단가 다름', c, s)
sheet(ws, cols, CODES)
print('품목 칸', len(cols), '행', len(CODES))

# ---------- 원장·자재 ----------
ws2 = wb.create_sheet('원장·자재')
def mt(k): return lambda c, r: mats[c].get(k, '')
pp = {}
for p in purp: pp.setdefault(p['code'], []).append(p)
for v in pp.values(): v.sort(key=lambda p: (p['from'], p['vendor'] != 'T신태광'))
bl = {r['ccode']: b for b in impbl for r in b['rows']}
inn = {r['ccode']: b for b in impin for r in b['rows']}
c2 = []
G5b = '5 자재등록'
for k, h, extra in [('code', '자재번호', {}), ('name', '자재명', {'w': 26}), ('spec', '규격', {}), ('eng', '영문명', {}),
                    ('asset', '품목자산분류', {'dv': LST('원자재', '부자재', '재공품', '저장품', '소모품')}), ('state', '자재상태', {'dv': STATES}),
                    ('io', '내외자구분', {'dv': IO}), ('imp', '중요도', {'dv': IMP}), ('unit', '기준단위', {'dv': UNITS})]:
    c2.append(dict(g=G5b, h=h, note=f'5단계 자재등록 · 「{h}」 (erp_materials.{k})', get=mt(k), **extra))
c2.append(dict(g='3 품목대중소분류정의', h='품목구분', dv=LST('제상품', '자재'), note='3단계 · 「품목구분」 (erp_classes.kind). 자재는 자재',
               get=lambda c, r: cls_kind.get(split3(mats[c].get('small'))[2], '')))
for n, h in enumerate(['대분류', '중분류', '자재소분류']):
    c2.append(dict(g='3 품목대중소분류정의', h=h, w=16, note=f'3단계 「{["대분류","중분류","소분류"][n]}」 · 세 칸을 이으면 5단계 「자재소분류」(erp_materials.small)',
                   get=(lambda n: lambda c, r: split3(mats[c].get('small'))[n])(n)))
GP = '구매1 구매단가등록'
def p1(c, k):
    L_ = pp.get(c) or [{}]; return L_[0].get(k, '')
for k, h, dv in [('vendor', '구매거래처', R('거래처')), ('io', '내외자구분', LST('내수', 'Local1(후LC)', 'Local2(선LC)', '직수입')),
                 ('cur', '통화', LST('KRW', 'CNY', 'USD')), ('price', '단가', None), ('from', '적용시작일', None),
                 ('minqty', '구매최소수량', None), ('stepqty', '구매간격수량', None), ('memo', '특이사항', None), ('maker', '제조사', None), ('days', '조달일수', None)]:
    def g(k=k):
        def f(c, r):
            v = p1(c, k)
            if k == 'price' and v != '': return float(v)
            return v
        return f
    c2.append(dict(g=GP, h=h, dv=dv, note=f'구매1 구매단가등록 · 「{h}」 (erp_purprices.{k}). 구매거래처 첫째', get=g()))
c2.append(dict(g=GP, h='구매거래처2', dv=R('거래처'), note='구매단가등록 · 둘째 「구매거래처」 (erp_purprices.vendor). 내외자구분·통화·적용시작일은 첫째와 같음',
               get=lambda c, r: (pp.get(c, [])[1]['vendor'] if len(pp.get(c, [])) > 1 else '')))
c2.append(dict(g=GP, h='단가2', note='구매단가등록 · 둘째 구매거래처 「단가」 (erp_purprices.price)',
               get=lambda c, r: (float(pp.get(c, [])[1]['price']) if len(pp.get(c, [])) > 1 else '')))
GI = '수입1 수입BL입력 · 수입2 수입입고입력'
c2.append(dict(g=GI, h='수입처', dv=R('거래처'), note='수입1 수입BL입력 · 「수입처」 (erp_impbls.vendor). 외자 자재만', get=lambda c, r: bl[c]['vendor'] if c in bl else ''))
c2.append(dict(g=GI, h='가격조건', dv=LST('EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DDP', 'DAT', 'DAP'),
               note='수입1 수입BL입력 · 「가격조건」 (erp_impbls.term)', get=lambda c, r: bl[c]['term'] if c in bl else ''))
c2.append(dict(g=GI, h='입고창고', dv=LST('T본사'), note='수입2 수입입고입력 · 「입고창고」 (erp_impins.wh)', get=lambda c, r: inn[c]['wh'] if c in inn else ''))
sheet(ws2, c2, matcodes)
print('원장 칸', len(c2), '행', matcodes)

# ---------- 거래처 ----------
used_v = sorted({wcs[w]['vendor'] for w in wcs if any(x['wc'] == w for L_ in iw.values() for x in L_ if x['code'] in CODES)}
                | {p['vendor'] for c in matcodes for p in pp.get(c, [])} | {bl[c]['vendor'] for c in bl})
ws3 = wb.create_sheet('거래처')
def vd(k): return lambda c, r: (', '.join(vendors[c].get(k) or []) if k == 'kinds' else vendors[c].get(k, ''))
c3 = [dict(g='1 거래처등록', h=h, w=16 if k != 'kinds' else 30, note=f'1단계 거래처등록 · 「{h}」 (erp_vendors.{k})', get=vd(k))
      for k, h in [('name', '거래처명'), ('sangho', '상호'), ('state', '거래처상태'), ('region', '국내외구분'), ('credit', '신용등급'), ('corp', '법인/개인'),
                   ('bizno', '사업자번호'), ('rep', '대표자성명'), ('tel', '전화번호'), ('biztype', '업태'), ('bizitem', '종목'), ('kinds', '거래처종류')]]
sheet(ws3, c3, used_v)
# ---------- 워크센터 ----------
used_w = sorted({x['wc'] for L_ in iw.values() for x in L_ if x['code'] in CODES})
ws4 = wb.create_sheet('워크센터')
c4 = [dict(g='2 워크센터등록', h=h, w=14, dv=(R('거래처') if k == 'vendor' else None), note=f'2단계 워크센터등록 · 「{h}」 (erp_workcenters.{k})', get=(lambda k: lambda c, r: wcs[c].get(k, ''))(k))
      for k, h in [('name', '워크센터'), ('unit', '사업단위'), ('dept', '생산부서'), ('kind', '워크센터구분'), ('vendor', '외주거래처'), ('capa', 'Capa산정구분'),
                   ('start', '시작일'), ('end', '종료일'), ('whMat', '자재출고창고'), ('whProd', '제상품출고창고'), ('whDeliv', '납품창고'), ('whSite', '현장창고'),
                   ('whIn', '생산입고창고'), ('whSemi', '생산입고창고(반제품)')]]
sheet(ws4, c4, used_w)
# ---------- 공정흐름유형 ----------
used_f = sorted({iflows[c]['flow'] for c in CODES})
ws5 = wb.create_sheet('공정흐름유형')
c5 = [dict(g='6 공정흐름유형등록', h='공정흐름유형', w=20, note='6단계 공정흐름유형등록 · 「공정흐름유형」 (erp_flows.name)', get=lambda c, r: c),
      dict(g='6 공정흐름유형등록', h='특이사항', note='6단계 · 「특이사항」 (erp_flows.memo)', get=lambda c, r: flows[c].get('memo', ''))]
for s in range(1, 6):
    c5.append(dict(g='6 공정흐름유형등록', h=f'공정순서{s} 공정', dv=R('공정'),
                   note=f'6단계 공정 표 · 공정순서 {s} 의 「공정」 (erp_flows.rows.proc). 후속공정순서 = 다음 순서, 끝 공정은 최종공정여부',
                   get=(lambda s: lambda c, r: (flows[c]['rows'][s - 1]['proc'] if len(flows[c]['rows']) >= s else ''))(s)))
sheet(ws5, c5, used_f)
# ---------- 공정 ----------
used_p = sorted({x['proc'] for f in used_f for x in flows[f]['rows']})
ws6 = wb.create_sheet('공정')
c6 = [dict(g='6 공정등록', h='공정명', note='6단계 공정등록 · 「공정명」 (erp_processes.name)', get=lambda c, r: c),
      dict(g='6 공정등록', h='특이사항', w=26, note='6단계 공정등록 · 「특이사항」 (erp_processes.memo)', get=lambda c, r: procs[c].get('memo', '')),
      dict(g='6 공정등록', h='공정검사여부', dv=TF, note='6단계 공정등록 · 「공정검사여부」 (erp_processes.inspect)', get=lambda c, r: bool(procs[c].get('inspect')))]
sheet(ws6, c6, used_p)
# ---------- 목록 ----------
ws7 = wb.create_sheet('목록')
ws7['A1'] = '하위품번 목록'; ws7['A1'].font = HF
ws7['A1'].comment = Comment('품목 시트 하위품번 드롭다운 목록. 품목 시트 품번 + 원장·자재 시트 자재번호(수식, 입력 안 함)', 'VIVIVIC')
for i in range(100):
    ws7.cell(2 + i, 1, f"=IF('품목'!A{3+i}=\"\",\"\",'품목'!A{3+i})")
    ws7.cell(102 + i, 1, f"=IF('원장·자재'!A{3+i}=\"\",\"\",'원장·자재'!A{3+i})")
ws7.column_dimensions['A'].width = 18
wb.save(OUT)
