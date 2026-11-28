"""질문 정리 — 「실행함」 이고 실행한 지 30일 지난 질문을 깃 작업일지로 옮기고 erp_questions 에서 지운다(입력폼 v369).

사장님 11-28: 저절로 돌리지 않는다 — 사람이(또는 시킨 작업자가) 손으로 돌린다.
  python3 질문정리.py          옮길 질문만 보임(아무것도 안 바꿈)
  python3 질문정리.py 지움     입력작업자/작업일지.md 맨 위에 절을 더한 뒤 그 문서들을 지움 → 작업일지를 커밋·푸시할 것
⚠ 공개 저장소 — 작업일지로 옮기기 전에 질문·답 글에 단가·계정이 없는지 본다(있으면 그 줄은 손으로 고침).
"""
import os, sys, time, urllib.error

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import 질문올리기 as Q

일지 = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '작업일지.md'))
기준 = time.strftime('%Y-%m-%dT%H:%M:%S', time.gmtime(time.time() - 30 * 86400))

if __name__ == '__main__':
    try:
        옮길 = [q for q in Q.모두() if q.get('상태') == '실행함' and (q.get('실행한때') or '9') < 기준]
    except urllib.error.HTTPError as e:
        sys.exit('저장소 %s' % e.code)
    for q in 옮길:
        print(q['id'], q.get('자리이름'), '|', q.get('질문'), '→', q.get('답'))
    print('옮길 질문', len(옮길))
    if len(sys.argv) > 1 and sys.argv[1] == '지움' and 옮길:
        s = open(일지, encoding='utf-8').read()
        머리 = '# 작업일지 (맨 위가 최신)\n'
        절 = '\n## %s 질문 정리 (실행함 + 30일 지남, %d건 — erp_questions 에서 지움)\n' % (time.strftime('%Y-%m-%d'), len(옮길))
        절 += ''.join('- %s · %s · 보낸이 %s (%s) — 질문: %s / 답: %s (%s %s) · 실행 %s\n' % (
            q.get('자리이름') or q.get('자리'), q['id'], q.get('보낸이') or '', (q.get('만든때') or '')[:10], q.get('질문') or '',
            q.get('답') or '', q.get('답한이') or '', (q.get('답한때') or '')[:10], (q.get('실행한때') or '')[:10]) for q in 옮길)
        s = 머리 + 절 + s[len(머리):] if s.startswith(머리) else 절 + s
        open(일지, 'w', encoding='utf-8').write(s)
        for q in 옮길:
            Q.요청('DELETE', Q.A.DB + Q.COL + '/' + q['id'])
        print('작업일지에 옮기고 지움', len(옮길), '— 작업일지를 커밋·푸시하세요')
