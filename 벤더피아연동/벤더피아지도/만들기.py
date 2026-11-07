#!/usr/bin/env python3
"""벤더피아지도 — 목차.md · 공통.md · 화면/*.md 를 읽어 index.html 하나로 굽는다.
내용은 md 에만 있다. index.html 은 손으로 고치지 않는다 (두 벌 금지).
돌리는 법:  python3 벤더피아지도/만들기.py
"""
import json, pathlib, re

여기 = pathlib.Path(__file__).resolve().parent

def 첫머리(글):
    for 줄 in 글.splitlines():
        if 줄.startswith('# '):
            return 줄[2:].strip()
    return ''

문서 = []
for 이름 in ('목차.md', '공통.md'):
    p = 여기 / 이름
    if p.exists():
        글 = p.read_text(encoding='utf-8')
        문서.append({'f': 이름, 't': 첫머리(글) or 이름, 'g': '안내', 'b': 글})
목차글 = (여기 / '목차.md').read_text(encoding='utf-8') if (여기 / '목차.md').exists() else ''
차례 = {이름: i for i, 이름 in enumerate(dict.fromkeys(re.findall(r'\]\(화면/([^)]+\.md)\)', 목차글)))}
for p in sorted((여기 / '화면').glob('*.md'), key=lambda x: (차례.get(x.name, 99999), x.name)):
    글 = p.read_text(encoding='utf-8')
    제목 = 첫머리(글) or p.stem
    상태 = re.search(r'상태: \*\*(.+?)\*\*', 글)
    묶음 = 제목.split(' > ')[0] if ' > ' in 제목 else '기타'
    문서.append({'f': p.name, 't': 제목, 'g': 묶음, 's': 상태.group(1) if 상태 else '', 'b': 글})

틀 = (여기 / '틀.html').read_text(encoding='utf-8')
자료 = json.dumps(문서, ensure_ascii=False).replace('</', '<\\/')
(여기 / 'index.html').write_text(틀.replace('/*자료*/[]', 자료), encoding='utf-8')
print('화면', len(문서) - 2, '개 구움 →', 여기 / 'index.html')
