import json, csv, sys, collections, os
src, out, metaname = sys.argv[1], sys.argv[2], sys.argv[3]
rows = json.load(open(src)); h = rows[0]; B = rows[1:]
C = {n: i for i, n in enumerate(h)}
SAME7 = ['원장명', '마감', '마감색상', '재단W', '재단D', 'W엣지면', 'D엣지면']
def nv(v):
    if v is None or str(v).strip() in ('', '선택없음'): return '선택없음'
    return str(v).strip()
def g(r, n): v = r[C[n]]; return '' if v is None else str(v)
def proc(r):
    p = []
    if g(r, '재단부속코드').strip(): p.append('재단')
    nc = bool(g(r, 'NC부속코드').strip())
    if nc: p.append('NC')  # 곡면엣지 앞에는 늘 NC
    if g(r, '엣지부속코드').strip(): p.append('엣지')
    if g(r, '보링부속코드').strip(): p.append('보링')
    return '·'.join(p) or '(코드 없음)'
excluded = [i for i, r in enumerate(B, 1) if nv(r[C['원장명']]) == '선택없음']
grp = collections.OrderedDict()
for i, r in enumerate(B, 1):
    if i in excluded: continue
    k = '|'.join(nv(r[C[n]]) for n in SAME7)
    grp.setdefault(k, []).append(i)
prods = lambda idx: list(dict.fromkeys(nv(B[i-1][0]) for i in idx))
common = [(k, v) for k, v in grp.items() if len(prods(v)) >= 2]
common.sort(key=lambda kv: (-len(prods(kv[1])), kv[0]))
num = {}
os.makedirs(out, exist_ok=True)
with open(os.path.join(out, '공통부속목록.csv'), 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f)
    w.writerow(['공통부속번호'] + SAME7 + ['원래부속명들', '쓰는상품수', '부속줄수', '쓰는상품(발주처)', '공정'])
    for n, (k, idx) in enumerate(common, 1):
        no = 'C%03d' % n; num[k] = no
        ps = prods(idx)
        sup = {nv(B[i-1][0]): nv(B[i-1][C['ing발주처']]) for i in idx}
        w.writerow([no] + k.split('|') + [' / '.join(dict.fromkeys(g(B[i-1], '부속명') for i in idx)), len(ps), len(idx),
                    ' / '.join('%s(%s)' % (p, sup[p]) for p in ps), ' / '.join(dict.fromkeys(proc(B[i-1]) for i in idx))])
single = sum(1 for k, v in grp.items() if k not in num)
with open(os.path.join(out, '상품별부속.csv'), 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f)
    w.writerow(['원장줄', 'ing단품명', 'ing발주처', '부속명'] + SAME7 + ['공급처', '공정', '공통부속번호', '같은부속쓰는상품수'])
    for i, r in sorted(enumerate(B, 1), key=lambda x: (nv(x[1][C['ing발주처']]), nv(x[1][0]), x[0])):
        if i in excluded:
            no, cnt = '판정제외(원장명 없음)', ''
        else:
            k = '|'.join(nv(r[C[n]]) for n in SAME7); no = num.get(k, '단독'); cnt = len(prods(grp[k]))
        w.writerow([i + 1, nv(r[0]), nv(r[C['ing발주처']]), g(r, '부속명')] + [nv(r[C[n]]) for n in SAME7] + [g(r, '공급처'), proc(r), no, cnt])
common_rows = sum(len(v) for k, v in grp.items() if k in num)
json.dump({'원장': metaname, '전체줄': len(B), '제외': len(excluded), '판정줄': len(B) - len(excluded), '서로다른부속': len(grp),
           '공통부속': len(common), '공통부속줄': common_rows, '단독부속': single,
           '단독줄': len(B) - len(excluded) - common_rows, '상품수': len(set(nv(r[0]) for r in B)),
           'top': [(num[k], k, len(prods(v)), len(v)) for k, v in common[:10]],
           'groups': {k: prods(v) for k, v in grp.items()}}, open(os.path.join(out, '..', 'summary.json'), 'w'), ensure_ascii=False, indent=1)
