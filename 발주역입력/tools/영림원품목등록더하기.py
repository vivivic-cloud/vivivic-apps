#!/usr/bin/env python3
"""새 판 「품목등록test서버용」 엑셀에서 **새 줄만** 창고(발주역입력_영림원품목등록)에 더한다 — 있던 줄은 안 건드림.
(11-19 사장님: 「이미확인되어 목록에 있는 품명은 빼고 새로 업데이트된 목록을 업데이트 … 비오엠등록업로드 시트 확인해서 지금과 같은 프로그램 논리로」)

쓰는 법:
  python3 발주역입력/tools/영림원품목등록더하기.py "<새 엑셀>"          # 셈 보이고 창고에 씀
  python3 발주역입력/tools/영림원품목등록더하기.py "<새 엑셀>" --안씀   # 셈만
openpyxl 필요. 엑셀은 읽기만.

새 엑셀 시트(1119 판): 「1-1.품목등록확정」(= 품목등록업로드 꼴 51칸) · 「2-1.BOM등록확정」(= BOM등록업로드 꼴 30칸). 나머지 시트는 안 씀.
규칙:
  품목: 창고 품목등록업로드에 없는 **품명** 줄만. 제품·반제품 → 품목등록업로드 끝에(엑셀 차례).
        원자재 → 원부자재 시트(지금 쪽 꼴: 원자재는 원부자재 탭)에 그 **품번**이 없을 때만 끝에.
        있던 품명 줄이 새 엑셀에서 달라졌으면 안 바꾸고 알림만.
  BOM : 창고 BOM등록업로드에 없는 **모품목번호** 의 줄만 끝에. 겹치는 모품목이 다르면 안 바꾸고(옛 것 유지) 알림만.
  행 = 각 줄이 온 엑셀의 행 번호(옛 줄 = 옛 엑셀, 더한 줄 = 새 엑셀). 쪽은 품번 없는 품목 줄 열쇠(#행)에만 씀.
창고의 사람 값(_입력 · _공정목록)은 안 건드림. 칸 차례가 창고와 다르면 멈춤.
"""
import sys, os, json, re, datetime, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import openpyxl
import 업체별단품읽기 as 다리
from 영림원품목등록읽기 import 시트읽기, 조각내기, 창고

새시트 = {'품목등록업로드': '1-1.품목등록확정', 'BOM등록업로드': '2-1.BOM등록확정'}


def 토큰():
    html = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '재단.html'), encoding='utf-8').read()
    key = re.search(r'apiKey:\s*"([^"]+)"', html).group(1)
    return 다리.부름(f'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={key}', {'returnSecureToken': True})['idToken']


def 풀기(v):
    k = next(iter(v)); x = v[k]
    if k == 'mapValue': return {a: 풀기(b) for a, b in x.get('fields', {}).items()}
    if k == 'arrayValue': return [풀기(b) for b in x.get('values', [])]
    if k == 'integerValue': return int(x)
    if k == 'nullValue': return None
    return x


def 창고읽기():
    t = 토큰(); 뿌리 = f'projects/vivivic-4b7ef/databases/(default)/documents/{창고}'
    받기 = lambda n: 풀기({'mapValue': 다리.부름('https://firestore.googleapis.com/v1/' + urllib.parse.quote(f'{뿌리}/{n}'), None, t)})
    목 = 받기('_시트목록'); 시트 = {}
    for s in 목['시트들']:
        줄 = []
        for k in range(1, s['조각'] + 1): 줄 += 받기(f"{s['이름'].replace('/', '／')}_{k}")['줄']
        시트[s['이름']] = {'칸': s['칸'], '줄': 줄}
    return 목, 시트


def 글(v): return '' if v is None else str(v).strip()


def main():
    if len(sys.argv) < 2: print(__doc__); sys.exit(1)
    wb = openpyxl.load_workbook(sys.argv[1], read_only=True, data_only=True)
    목, 시트 = 창고읽기()
    품, BOM, 원 = 시트['품목등록업로드'], 시트['BOM등록업로드'], 시트['원부자재']
    nc, nr = 시트읽기(wb[새시트['품목등록업로드']])
    bc, br = 시트읽기(wb[새시트['BOM등록업로드']])
    if nc != 품['칸'] or nc != 원['칸'] or bc != BOM['칸']: sys.exit('칸 차례가 창고와 다름 — 멈춤')
    ni, pi, ai = nc.index('품명'), nc.index('품번'), nc.index('품목자산분류')

    # ── 품목
    옛 = {}
    for r in 품['줄']: 옛.setdefault(글(r['v'][ni]), []).append(r['v'])
    새묶 = {}
    for r in nr: 새묶.setdefault(글(r['v'][ni]), []).append(r)
    달라짐 = [k for k in 옛 if k in 새묶 and [r['v'] for r in 새묶[k]] != 옛[k]]
    빠짐 = [k for k in 옛 if k not in 새묶]
    새줄 = [r for r in nr if 글(r['v'][ni]) not in 옛]
    원번 = {글(r['v'][pi]) for r in 원['줄']}
    더품 = [r for r in 새줄 if 글(r['v'][ai]) in ('제품', '반제품')]
    더원 = [r for r in 새줄 if 글(r['v'][ai]) == '원자재' and 글(r['v'][pi]) not in 원번]
    원있음 = [r for r in 새줄 if 글(r['v'][ai]) == '원자재' and 글(r['v'][pi]) in 원번]
    그밖 = [r for r in 새줄 if 글(r['v'][ai]) not in ('제품', '반제품', '원자재')]
    print(f'품목: 창고 {len(품["줄"])}줄({len(옛)} 품명) · 새 엑셀 {len(nr)}줄({len(새묶)} 품명) · 새 품명 {len({글(r["v"][ni]) for r in 새줄})}')
    print(f'  더함 품목등록업로드 {len(더품)}줄 (제품 {sum(글(r["v"][ai])=="제품" for r in 더품)} · 반제품 {sum(글(r["v"][ai])=="반제품" for r in 더품)})'
          f' · 원부자재 {len(더원)}줄 {[글(r["v"][pi]) for r in 더원]} · 원자재 이미 원부자재에 있음 {len(원있음)} · 그 밖 분류 {len(그밖)}')
    print(f'  있던 품명 중 값 달라짐 {len(달라짐)} {달라짐[:10]} · 새 엑셀에서 빠짐 {len(빠짐)} {빠짐[:10]} (둘 다 안 바꿈)')

    # ── BOM
    mi = bc.index('모품목번호')
    옛B = {}
    for r in BOM['줄']: 옛B.setdefault(글(r['v'][mi]), []).append(r['v'])
    새B = {}
    for r in br: 새B.setdefault(글(r['v'][mi]), []).append(r)
    더B = [r for r in br if 글(r['v'][mi]) not in 옛B]
    겹 = [m for m in 새B if m in 옛B]
    다른 = [m for m in 겹 if [r['v'] for r in 새B[m]] != 옛B[m]]
    print(f'BOM: 창고 {len(BOM["줄"])}줄({len(옛B)} 모품목) · 새 엑셀 {len(br)}줄({len(새B)} 모품목) · 더함 {len(더B)}줄({len({글(r["v"][mi]) for r in 더B})} 모품목)'
          f' · 겹침 {len(겹)} 중 다름 {len(다른)} (옛 것 유지)')
    for m in 다른:
        a, b = 옛B[m], [r['v'] for r in 새B[m]]
        칸들 = sorted({bc[i] for x, y in zip(a, b) for i in range(len(bc)) if x[i] != y[i]})
        print(f'  다름 {m}: 줄 {len(a)}→{len(b)} · 칸 {칸들}')
    if '--안씀' in sys.argv: return

    더할 = {'품목등록업로드': 더품, 'BOM등록업로드': 더B, '원부자재': 더원}
    문서들, 시트들 = {}, []
    for s in 목['시트들']:
        이름 = s['이름']; 줄 = 시트[이름]['줄'] + 더할.get(이름, [])
        조각 = 조각내기(줄)
        시트들.append({'이름': 이름, '칸': s['칸'], '줄수': len(줄), '조각': len(조각)})
        if 더할.get(이름):
            for k, c in enumerate(조각, start=1): 문서들[f'{이름.replace("/", "／")}_{k}'] = {'줄': c}
    문서들['_시트목록'] = {'시트들': 시트들, '파일': os.path.basename(sys.argv[1]), '읽은날': datetime.date.today().isoformat(),
                       '옛파일': 목.get('파일'), '옛읽은날': 목.get('읽은날')}
    다리.창고 = 창고
    다리.쓰기(문서들)
    print('창고에 씀:', 창고, list(문서들))
    목2, 시트2 = 창고읽기()
    for s in 시트들:
        같음 = 시트2[s['이름']]['줄'] == 시트[s['이름']]['줄'] + 더할.get(s['이름'], [])
        print(f"  다시 읽음 {s['이름']} {len(시트2[s['이름']]['줄'])}줄 · 맞음 {같음}")


if __name__ == '__main__':
    main()
