"""v241 입고처별 배송기사 링크 파일 만들기 — 사장님 「입고처별로 바꿔」(11-15).
카톡 미리보기 제목은 링크 파일의 고정 <title>/og:title 이라(카톡은 JS 를 안 돌림) 입고처마다 파일을 둔다.
입고처 = 폼 영림원외주입력.html 의 SHIP_WHS 목록(v325 — 옛 PUR_WHS 고정 4곳. PUR_WHS 는 이제 창고등록 완료 창고라 저절로 바뀜). 목록을 고치면 이 파일을 다시 돌리고 같이 커밋한다.
화면·코드는 모두 배송기사.js·배송기사.css 하나를 함께 쓴다. 쓰는 법: python3 배송기사-입고처파일만들기.py
"""
import os, re
D = os.path.dirname(os.path.abspath(__file__))
form = open(os.path.join(D, '영림원외주입력.html'), encoding='utf-8').read()
whs = re.findall(r"'([^']+)'", re.search(r"var SHIP_WHS=\[([^\]]*)\]", form).group(1))
base = open(os.path.join(D, '배송기사.html'), encoding='utf-8').read()
for w in whs:
    if not re.fullmatch(r'[0-9A-Za-z가-힣]+', w):
        raise SystemExit('파일 이름으로 못 쓰는 입고처: ' + w)
    t = w + ' 입고'
    p = base.replace('<title>납품</title>\n', '<title>%s</title>\n<meta property="og:title" content="%s">\n' % (t, t))
    open(os.path.join(D, '배송기사-%s.html' % w), 'w', encoding='utf-8').write(p)
    print('배송기사-%s.html' % w, '·', t)
