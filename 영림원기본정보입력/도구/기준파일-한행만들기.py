"""영림원 기본정보 입력 — 기준 파일(품목등록 확정·BOM등록 확정 구글시트를 xlsx 로 받은 것) → 한행 입력표 xlsx.

자료 값은 이 저장소에 없다. 실행할 때 두 곳에서 읽는다:
  1) 기준 파일 xlsx (시트 「1-1.품목등록확정」·「2-1.BOM등록확정」, 1행 제목 · 2행 칸 이름 · 3행부터 자료)
  2) 입력폼 저장소 erp_ 문서를 JSON 으로 받아 둔 폴더(erp_items·erp_boms·erp_itemflows·erp_itemwcs·erp_contracts·erp_materials·erp_purprices)
     — 테스트 4제품·부속 14개·원장·엣지필름의 영림원 입력정보(영림원과 동기화 끝, 11-10).
기준 파일에 없는 칸은 테스트 품목(아래 analog)의 값을 가져오고 「테스트값 칸」에 적는다(시트에서는 노란 칸). 지어낸 값 없음.
쓰는 법: python3 기준파일-한행만들기.py <기준.xlsx> <erp_json폴더> <나갈.xlsx> [<나갈.json>]
칸 배치 = 같은 폴더 위 ../칸.json (프로그램 화면과 같은 정의).
"""
import json, os, re, sys
import openpyxl
from openpyxl.styles import PatternFill, Font, Alignment
from openpyxl.comments import Comment

HERE = os.path.dirname(os.path.abspath(__file__))
SPEC = json.load(open(os.path.join(HERE, '..', '칸.json')))
YEL = PatternFill('solid', fgColor='FFF3C4')
HEAD = PatternFill('solid', fgColor='F5F5F4')


def s(v):
    if v is None: return ''
    if isinstance(v, float) and v.is_integer(): return str(int(v))
    return str(v).strip()


def table(wb, name):
    ws = wb[name]
    rows = list(ws.iter_rows(values_only=True))
    hd = [s(x) for x in rows[1]]
    out = []
    for r in rows[2:]:
        if not any(x not in (None, '') for x in r): continue
        out.append({hd[i]: s(r[i]) for i in range(len(hd)) if hd[i]})
    return out


def wh(spec):
    m = re.match(r'(\d+)\D+(\d+)', spec or '')
    return (int(m.group(1)), int(m.group(2))) if m else (0, 0)


def item_analog(r):
    code, name, spec = r['품번'], r['품명'], r['규격']
    if r['품목자산분류'] == '제품':
        mh = '더 높은' in name
        w = re.search(r'알렉스\s*(\d+)', name)
        w = int(w.group(1)) if w else 0
        if w >= 1000: return 'T-al12mh' if mh else 'T-al12h'
        return 'T-al8mh' if mh else 'T-al80h'
    m = re.search(r'-([A-Za-z]+\d*)_', code)
    k = m.group(1) if m else ''
    w, h = wh(spec)
    big = w >= 1000
    if k in ('tp', 'bt'): return 'T-al-p07' if big else 'T-al-p08'
    if k in ('siL', 'siR'): return 'T-al-p05' if big else 'T-al-p03'
    if k == 'is': return 'T-al-p10' if big else 'T-al-p09'
    if k in ('doL', 'doR', 'do'): return 'T-al-p06' if big else 'T-al-p04'
    if k == 'mrL': return 'T-al-p01'
    if k == 'mrS': return 'T-al-p02'
    if k == 'mr': return 'T-al-p01' if w >= 700 else 'T-al-p02'
    if k == 'b27': return {(True, False): 'T-al-p11', (True, True): 'T-al-p12', (False, False): 'T-al-p13', (False, True): 'T-al-p14'}[(big, h >= 1000)]
    return ''


def mat_analog(code):
    if code.startswith('pb_18'): return 'T-pb18-wt'
    if code.startswith('md_27'): return 'T-md27-wt'
    if code.startswith('ed_001'): return 'T-ted1-wt'
    return ''


def main(base, jdir, out_xlsx, out_json=None):
    wb = openpyxl.load_workbook(base, data_only=True)
    items = table(wb, '1-1.품목등록확정')
    boms = table(wb, '2-1.BOM등록확정')
    J = lambda c: [d for d in json.load(open(os.path.join(jdir, c + '.json'))) if d.get('status') != '오류']
    t_items = {d['code']: d for d in J('erp_items')}
    t_flow = {d['code']: d['flow'] for d in J('erp_itemflows')}
    t_bom = {d['pcode']: d for d in J('erp_boms')}
    t_wcs = J('erp_itemwcs')
    t_con = J('erp_contracts')
    t_mat = {d['code']: d for d in J('erp_materials')}
    t_pp = J('erp_purprices')
    t_flows = {d['name']: d for d in J('erp_flows')}

    seen, rows = set(), []
    codes = {r['품번'] for r in items}
    bom_by = {}
    for b in boms: bom_by.setdefault(b['모품목번호'], []).append(b)
    parents = {}
    for b in boms: parents.setdefault(b['하위품번'], []).append(b['모품목번호'])
    for r in items:
        code = r['품번']
        if code in seen: continue
        seen.add(code)
        a = item_analog(r)
        test = []
        o = dict(kind='품목', name=r['품명'], code=code, spec=r['규격'], eng=r['영문명'], asset=r['품목자산분류'], state=r['품목상태'],
                 io=r['내외자구분'], imp=r['중요도'], unit=r['기준단위'], rep='',
                 big=r['품목대분류'], mid=r['품목중분류'], small=r['품목소분류'],
                 u_set=r.get('세트품목여부', ''), u_lot=r.get('Lot 관리 여부', ''), u_ser=r.get('Serial 관리 여부', ''),
                 u_lossIn=r.get('사내Loss율', ''), u_lossOut=r.get('외주Loss율', ''), u_buyer=r.get('기본구매처', ''), u_desc=r.get('품목설명', ''),
                 tpl=a, parents=sorted(set(parents.get(code, []))))
        ta = t_items.get(a, {})
        def take(k, v):
            if s(o.get(k)) == '' and s(v) != '':
                o[k] = v; test.append(k)
        take('imp', ta.get('imp'))
        if ta: o['rep'] = bool(ta.get('rep')); test.append('rep')
        take('flow', t_flow.get(a))
        # 7 BOM — 기준 파일 그대로. 하위유무 = 하위품번이 이 파일 품목에 있으면(계산). 결방향 = 테스트 원장 줄 꼴
        tb = t_bom.get(a, {})
        tgrain = any(x.get('grain') for x in tb.get('rows', []))
        bl = []
        mine = bom_by.get(code, [])
        o['pver'] = mine[0]['모품목BOM차수'] if mine else ''
        for i, b in enumerate(mine):
            x = dict(proc=b['공정'], order=b['표시순서'], cname=b['하위품명'], ccode=b['하위품번'], cspec=b['하위규격'], cver=b['하위BOM차수'],
                     inunit=b['투입단위'], qn=b['소요량(분자)'], qd=b['소요량(분모)'], hasSub=b['하위품번'] in codes, grain=False, memo=b['비고'])
            if tgrain and b['투입단위'] == 'EA' and b['하위품번'] not in codes and re.match(r'(pb|md)_', b['하위품번']):
                x['grain'] = True; test.append('bom.%d.grain' % i)
            bl.append(x)
        o['bom'] = bl
        # 9 · 10 · 11 — 테스트 품목 꼴
        if a:
            o['rev'] = '00'; o['bomRev'] = '00'; test += ['rev', 'bomRev']
        fl = t_flows.get(o.get('flow') or '', {}).get('rows', [])
        procs = []
        mw = [w for w in t_wcs if w['code'] == a]
        if mw:
            o['tunit'] = mw[0].get('tunit', ''); o['time'] = s(mw[0].get('time')); test += ['tunit', 'time']
        crow = [(c['vendor'], c.get('unit', ''), x) for c in t_con for x in c.get('rows', []) if x.get('pcode') == a]
        if crow:
            x0 = crow[0][2]
            o.update(cunit=crow[0][1], cur=x0.get('cur', ''), basis=x0.get('basis', ''), vat=bool(x0.get('vat')), **{'from': x0.get('from', '')})
            test += ['cunit', 'cur', 'basis', 'vat', 'from']
        for i, f in enumerate(fl):
            seq = f['seq']
            ws_ = sorted([w for w in mw if int(w['seq']) == seq], key=lambda w: int(w.get('rank') or 9))
            p = dict(proc=f['proc'], wc1='', wc2='', wc3='', ocode='', price='')
            test.append('procs.%d.proc' % i)
            for j, w in enumerate(ws_[:3]):
                p['wc%d' % (j + 1)] = w['wc']; test.append('procs.%d.wc%d' % (i, j + 1))
            if crow:
                p['ocode'] = code if f.get('last') else '%s_%d' % (code, seq); test.append('procs.%d.ocode' % i)
                cand = [x for v, u, x in crow if int(x.get('pseq') or 0) == seq and x.get('proc') == f['proc']]
                pref = [x for v, u, x in crow if v == p['wc1'] and int(x.get('pseq') or 0) == seq and x.get('proc') == f['proc']]
                pick = (pref or cand or [None])[0]
                if pick is not None: p['price'] = s(pick.get('price')); test.append('procs.%d.price' % i)
            procs.append(p)
        o['procs'] = procs
        o['test'] = test
        rows.append(o)

    # 자재(시트2) — BOM 하위품번 중 품목이 아닌 것
    mats = {}
    for b in boms:
        c = b['하위품번']
        if c in codes or c in mats: continue
        mats[c] = dict(kind='자재', name=b['하위품명'], code=c, spec=b['하위규격'], unit=b['투입단위'], eng='', asset='', state='', io='', imp='', small='')
    for c, o in mats.items():
        a = mat_analog(c); o['tpl'] = a; test = []
        ta = t_mat.get(a, {})
        for k in ('asset', 'state', 'io', 'imp', 'small'):
            if s(o.get(k)) == '' and s(ta.get(k)) != '': o[k] = ta[k]; test.append(k)
        pp = []
        for i, x in enumerate([x for x in t_pp if x['code'] == a][:2]):
            pp.append(dict(vendor=x.get('vendor', ''), io=x.get('io', ''), cur=x.get('cur', ''), price=s(x.get('price')), unit=x.get('unit', ''), memo=x.get('memo', ''), **{'from': x.get('from', '')}))
            test += ['pp.%d.%s' % (i, k) for k in ('vendor', 'io', 'cur', 'price', 'unit', 'from', 'memo') if s(pp[-1][k]) != '']
        o['pp'] = pp; o['test'] = test
        rows.append(o)

    write_xlsx(rows, out_xlsx)
    if out_json: json.dump(rows, open(out_json, 'w'), ensure_ascii=False, indent=1)
    print('품목', sum(1 for r in rows if r['kind'] == '품목'), '자재', len(mats))


def flat_cols(sheet):
    """(group, rep, idx, col, 화면 이름) 차례대로"""
    out = []
    for g in sheet['groups']:
        if g.get('rep'):
            for i in range(g['n']):
                for c in g['cols']: out.append((g, g['rep'], i, c, '%s%d %s' % (g['pre'], i + 1, c['l'])))
        else:
            for c in g['cols']: out.append((g, None, None, c, c['l']))
    return out


def full_label(sheet, key):
    for g, rep, i, c, lab in flat_cols(sheet):
        k = '%s.%d.%s' % (rep, i, c['k']) if rep else c['k']
        if k == key: return lab
    return key


def cell(o, rep, i, c):
    if rep:
        arr = o.get(rep) or []
        v = arr[i].get(c['k'], '') if i < len(arr) else ''
    else:
        v = o.get(c['k'], '')
    if c['k'] == 'test' and not rep: return ''
    if isinstance(v, bool): return 'O' if v else ''
    return v


def write_xlsx(rows, path):
    wb = openpyxl.Workbook(); wb.remove(wb.active)
    for sh in SPEC['sheets']:
        ws = wb.create_sheet(sh['name'])
        cols = flat_cols(sh)
        # 1행 묶음 이름(병합) · 2행 칸 이름
        start = 1
        for g in sh['groups']:
            n = len(g['cols']) * (g.get('n') or 1)
            ws.cell(1, start, g['g']).font = Font(bold=True)
            if n > 1: ws.merge_cells(start_row=1, start_column=start, end_row=1, end_column=start + n - 1)
            start += n
        for j, (g, rep, i, c, lab) in enumerate(cols, 1):
            x = ws.cell(2, j, lab if rep else c['l'])
            x.fill = HEAD; x.font = Font(bold=True); x.alignment = Alignment(wrap_text=True, vertical='top')
        r = 3
        for o in [x for x in rows if x['kind'] == sh['kind']]:
            tset = set(o.get('test', []))
            for j, (g, rep, i, c, lab) in enumerate(cols, 1):
                key = '%s.%d.%s' % (rep, i, c['k']) if rep else c['k']
                if key == 'test':
                    ws.cell(r, j, ' · '.join(full_label(sh, k) for k in o.get('test', [])))
                    continue
                x = ws.cell(r, j, cell(o, rep, i, c))
                if key in tset: x.fill = YEL
            r += 1
        ws.freeze_panes = 'C3'
        for j in range(1, len(cols) + 1):
            ws.column_dimensions[openpyxl.utils.get_column_letter(j)].width = 14
    wb.save(path)


if __name__ == '__main__':
    main(*sys.argv[1:])
