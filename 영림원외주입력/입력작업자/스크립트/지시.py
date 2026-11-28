"""사장님 지시 보기·받음·끝남 — 질문 트리(발주역입력/질문트리.html v1.1.0)에서 사장님이 적은 지시(파이어스토어 erp_questions, 종류 「지시」, 지시 하나 = 문서 하나).

사장님 11-28 「질문 트리에 해당 영역에 대한 지시 요청을 제가 적을 수 있게 해 주세요」.
문서 = {종류:'지시', 자리, 자리이름, 링크, 지시(글), 보낸이, 만든때, 상태:'새 지시'|'받음'|'끝남', 받은때, 끝난때, 메모(작업자)}

쓰는 법(토큰 = 작업자표.py — 입력 작업자 열쇠):
  python3 지시.py                         끝나지 않은 지시(새 지시·받음) — id · 상태 · 자리 · 링크 · 지시 · 메모
  python3 지시.py 보기 [자리] [--모두]     자리 주면 그 자리만 · --모두 = 끝남도
  python3 지시.py 받음 <문서 id> ["메모"]   읽고 일을 시작함 → 상태 「받음」 · 받은때 · (메모)
  python3 지시.py 끝남 <문서 id> ["메모"]   다 함 → 상태 「끝남」 · 끝난때 · (메모 — 무엇을 했나 · 판 번호)
  python3 지시.py 메모 <문서 id> "메모"     메모만 고침
⚠ 지시를 언제 볼지(사장님이 말씀 / 몇 분마다)는 사장님이 정한다 — 저절로 도는 확인을 만들지 말 것.
⚠ 공개 저장소 — 메모에 단가·계정·비밀번호를 쓰지 말 것.
⚠ 쓰기 403 = 입력 작업자 권한을 담당자 관리에서 한 번 다시 저장해야 함(질문올리기.py 와 같음).
"""
import sys, urllib.error, urllib.parse

import 질문올리기 as Q

열림 = ('새 지시', '받음')


def 지시들():
    return [q for q in Q.모두() if q.get('종류') == '지시']


def 찍기(q):
    print('[%s] %s · %s · %s' % (q.get('상태') or '새 지시', q['id'], q.get('자리이름') or q.get('자리'), q.get('만든때')))
    if q.get('링크'):
        print('  링크: %s' % q['링크'])
    print('  지시: %s' % (q.get('지시') or ''))
    if q.get('메모'):
        print('  메모: %s' % q['메모'])


def 바꿈(id, 칸):
    마스크 = '&'.join('updateMask.fieldPaths=' + urllib.parse.quote('`' + k + '`') for k in 칸)
    Q.요청('PATCH', Q.A.DB + Q.COL + '/' + id + '?' + 마스크 + '&currentDocument.exists=true', {'fields': {k: Q.값(v) for k, v in 칸.items()}})


if __name__ == '__main__':
    a = sys.argv[1:]
    try:
        if not a or a[0] == '보기':
            모두 = '--모두' in a
            자리 = [x for x in a[1:] if x != '--모두']
            n = 0
            for q in 지시들():
                if 자리 and q.get('자리') != 자리[0]:
                    continue
                if not 모두 and (q.get('상태') or '새 지시') not in 열림:
                    continue
                찍기(q); n += 1
            print('지시', n)
        elif a[0] in ('받음', '끝남') and len(a) in (2, 3):
            q = next((x for x in 지시들() if x['id'] == a[1]), None)
            if not q:
                sys.exit('지시 「%s」 없음 — python3 지시.py 보기 --모두' % a[1])
            칸 = {'상태': a[0], ('받은때' if a[0] == '받음' else '끝난때'): Q.지금()}
            if a[0] == '끝남' and not q.get('받은때'):
                칸['받은때'] = 칸['끝난때']
            if len(a) == 3:
                칸['메모'] = a[2].strip()
            바꿈(a[1], 칸)
            print(a[0], a[1])
        elif a[0] == '메모' and len(a) == 3:
            바꿈(a[1], {'메모': a[2].strip()})
            print('메모', a[1])
        else:
            print(__doc__)
    except urllib.error.HTTPError as e:
        sys.exit('저장소 %s — %s' % (e.code, e.read().decode()[:300]))
