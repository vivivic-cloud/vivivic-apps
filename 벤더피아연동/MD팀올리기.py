# -*- coding: utf-8 -*-
"""MD팀 화면 자료 만들기·올리기 (11-27 [새 지시 MD팀])

아이엔지홈 제품리스트 엑셀(.xlsx, 이름이 .tmp 여도 됨)을 읽어 MD팀 화면(`MD팀.js`)이 그리는 JSON 으로 바꾸고,
`--올리기` 를 주면 우리 Firestore 창고 `artifacts/vivivic-4b7ef/public/data/mdteam_inghome` 에 올린다.
⚠ 업무 자료다 — 공개 저장소·Pages 에 JSON 을 커밋하지 마라. 드라이브 원본은 읽기만 한다.

쓰는 법(맥):
  python3 -m venv /tmp/md && /tmp/md/bin/pip -q install openpyxl
  /tmp/md/bin/python 벤더피아연동/MD팀올리기.py "<엑셀 경로>" --json /tmp/md.json        # 만들어 보기만
  /tmp/md/bin/python 벤더피아연동/MD팀올리기.py "<엑셀 경로>" --올리기                     # 창고에 올림
"""
import sys, io, json, re, datetime, urllib.request, decimal
import openpyxl
from openpyxl.utils import get_column_letter, column_index_from_string

KEY = "AIzaSyB9X_hzd2D3goQ7oenK53Pz805P1c7oSqs"     # 확장이 쓰는 같은 공개 앱 열쇠(search.js 상담·goods.js 서류)
PROJ = "vivivic-4b7ef"
칸 = "mdteam_inghome"
조각크기 = 700_000                                   # 바이트 — Firestore 문서 1MiB 아래

def 색(c):
    """openpyxl 색 → '#rrggbb' (rgb 만. theme·흰색·없음은 None)"""
    if c is None or getattr(c, "type", None) != "rgb" or not isinstance(c.rgb, str): return None
    v = c.rgb[-6:].upper()
    if len(v) != 6 or c.rgb in ("00000000",): return None
    return "#" + v

def 반올림(x):
    return int(decimal.Decimal(str(x)).quantize(decimal.Decimal("1"), rounding=decimal.ROUND_HALF_UP))

def 보이는글(v, fmt):
    """엑셀이 칸에 보이는 글 — 이 파일에 쓰인 꼴(General·#,##0·0%·@)만"""
    if v is None: return ""
    if isinstance(v, bool): return "TRUE" if v else "FALSE"
    if isinstance(v, (datetime.datetime, datetime.date)): return v.strftime("%Y-%m-%d")
    if isinstance(v, (int, float)):
        f = (fmt or "General")
        if f == "0%": return f"{반올림(v * 100)}%"
        if f in ("#,##0", "#,##0_ ", "#,##0_-"): return f"{반올림(v):,}"
        if f in ("0",): return str(반올림(v))
        if f == "@" or f == "General":
            if isinstance(v, float) and v.is_integer(): return str(int(v))
            return ("%.10g" % v) if isinstance(v, float) else str(v)
        print("  ! 모르는 숫자 꼴", f, v, file=sys.stderr)
        return str(v)
    return str(v)

def 만들기(경로):
    with open(경로, "rb") as f: 몸 = f.read()          # 이름이 .tmp 여도 읽게(읽기만)
    wb = openpyxl.load_workbook(io.BytesIO(몸))                  # 꼴·조건부 서식·하이퍼링크
    wv = openpyxl.load_workbook(io.BytesIO(몸), data_only=True)  # 수식은 계산된 값
    꼴표, 꼴번호 = [], {}
    def 꼴넣기(d):
        if not d: return 0
        k = json.dumps(d, sort_keys=True, ensure_ascii=False)
        if k not in 꼴번호:
            꼴표.append(d); 꼴번호[k] = len(꼴표)       # 0 = 꼴 없음
        return 꼴번호[k]
    시트들 = []
    for ws in wb.worksheets:
        if ws.sheet_state != "visible": continue      # 숨은 시트는 안 씀(이 파일엔 없음)
        v = wv[ws.title]
        숨은열 = {k for k, d in ws.column_dimensions.items() if d.hidden}
        숨은행 = {k for k, d in ws.row_dimensions.items() if d.hidden}
        병합 = [m for m in ws.merged_cells.ranges]
        # ① 머리줄 = 보이는 칸 글이 셋 이상인 첫 줄
        머리행 = None
        for r in range(1, min(ws.max_row, 30) + 1):
            n = sum(1 for c in ws[r] if get_column_letter(c.column) not in 숨은열 and v.cell(r, c.column).value not in (None, "") and str(v.cell(r, c.column).value).strip())
            if n >= 3: 머리행 = r; break
        if 머리행 is None: continue
        머리병합 = [m for m in 병합 if m.min_row == 머리행 and m.max_row == 머리행 and m.max_col > m.min_col]
        아래머리 = bool(머리병합)                     # 「할인판매가」(K4:L4) 처럼 두 줄 머리 → 아래 줄(5행)이 칸 이름
        자료시작 = 머리행 + (2 if 아래머리 else 1)
        # ② 보이는 칸 = 머리 글이나 값이 있는 마지막 열까지, 숨은 열 뺌
        끝열 = 0
        for row in v.iter_rows(min_row=머리행):
            for c in row:
                if c.value not in (None, "") and str(c.value).strip(): 끝열 = max(끝열, c.column)
        열들 = [i for i in range(1, 끝열 + 1) if get_column_letter(i) not in 숨은열]
        def 머리글(r, i):
            x = v.cell(r, i).value
            return "" if x is None else str(x)
        칸이름, 위줄 = [], []
        for i in 열들:
            m = next((m for m in 머리병합 if m.min_col <= i <= m.max_col), None)
            if m:
                칸이름.append(머리글(머리행 + 1, i))
                if i == m.min_col or 위줄 == [] or 위줄[-1][2] != m.coord:
                    위줄.append([머리글(머리행, m.min_col), 1, m.coord])
                else: 위줄[-1][1] += 1
            else:
                칸이름.append(머리글(머리행, i))
                위줄.append(["", 1, None])
        # ③ 조건부 서식 — 이 파일은 「COUNTIF($F$1:$F$N, F1)>1」(같은 상품코드 = 굵은 빨강) 하나뿐
        조건 = {}                                       # (행, 열) → dxf 꼴
        for cf in ws.conditional_formatting:
            for rule in cf.rules:
                f = (rule.formula or [""])[0]
                mm = re.fullmatch(r"COUNTIF\(\$([A-Z]+)\$(\d+):\$([A-Z]+)\$(\d+),\s*([A-Z]+)(\d+)\)>1", f.replace(" ", " "))
                if rule.type != "expression" or not mm:
                    print("  ! 모르는 조건부 서식", ws.title, cf.sqref, f, file=sys.stderr); continue
                ci = column_index_from_string(mm.group(1)); r1, r2 = int(mm.group(2)), int(mm.group(4))
                셈 = {}
                for r in range(r1, r2 + 1):
                    t = 보이는글(v.cell(r, ci).value, ws.cell(r, ci).number_format).strip().lower()
                    if t: 셈[t] = 셈.get(t, 0) + 1
                dxf = rule.dxf
                d = {}
                if dxf and dxf.font:
                    if dxf.font.b: d["w"] = 1
                    if 색(dxf.font.color): d["f"] = 색(dxf.font.color)
                if dxf and dxf.fill and dxf.fill.fill_type == "solid":
                    b = 색(dxf.fill.bgColor) or 색(dxf.fill.fgColor)
                    if b and b != "#FFFFFF": d["b"] = b
                for rng in cf.sqref.ranges:
                    for r in range(rng.min_row, rng.max_row + 1):
                        for c in range(rng.min_col, rng.max_col + 1):
                            t = 보이는글(v.cell(r, c).value, ws.cell(r, c).number_format).strip().lower()
                            if t and 셈.get(t, 0) > 1: 조건[(r, c)] = {**조건.get((r, c), {}), **d}
        def 칸꼴(r, i):
            c = ws.cell(r, i); d = {}
            if c.fill is not None and c.fill.fill_type == "solid":
                b = 색(c.fill.fgColor)
                if b and b != "#FFFFFF": d["b"] = b
            if c.font is not None:
                fg = 색(c.font.color)
                if fg and fg != "#000000": d["f"] = fg
                if c.font.b: d["w"] = 1
                if c.font.i: d["i"] = 1
                if c.font.u: d["u"] = 1
                if c.font.strike: d["s"] = 1
            h = c.alignment.horizontal if c.alignment is not None else None
            if h in ("center", "centerContinuous"): d["a"] = "c"
            elif h == "right": d["a"] = "r"
            elif h == "left": d["a"] = "l"
            elif isinstance(v.cell(r, i).value, (int, float)) and not isinstance(v.cell(r, i).value, bool): d["a"] = "r"   # 엑셀 기본 = 숫자 오른쪽
            d.update(조건.get((r, i), {}))
            return d
        # ④ 머리 위 줄(1~3행)의 글 = 메모 — 「색상표기건: …」 는 그 색의 까닭(마우스 올리면)
        메모, 까닭들 = [], []
        for r in range(1, 머리행):
            for i in 열들:
                t = 머리글(r, i)
                if not t.strip(): continue
                d = 칸꼴(r, i); 메모.append([t, 꼴넣기(d)])
                mm = re.match(r"\s*색상표기건\s*:\s*(.+)", t)
                if mm:
                    if "b" in d: 까닭들.append(("b", d["b"], None, mm.group(1).strip()))
                    elif "f" in d: 까닭들.append(("f", d["f"], d.get("w"), mm.group(1).strip()))
        # ⑤ 줄 — 값이 하나도 없는 줄은 뺌. 숨은 행은 뺌(이 파일엔 없음)
        끝행 = 자료시작 - 1
        for row in v.iter_rows(min_row=자료시작):
            for c in row:
                if c.column in 열들 and c.value not in (None, "") and str(c.value).strip(): 끝행 = max(끝행, c.row)
        줄들, 행번호 = [], []
        제품명칸 = 칸이름.index("제품명") if "제품명" in 칸이름 else -1
        for r in range(자료시작, 끝행 + 1):
            if r in 숨은행: continue
            if not any(v.cell(r, i).value not in (None, "") and str(v.cell(r, i).value).strip() for i in 열들): continue
            줄 = []
            for i in 열들:
                c = ws.cell(r, i)
                t = 보이는글(v.cell(r, i).value, c.number_format)
                d = 칸꼴(r, i)
                for 갈래, 값, 굵, 글 in 까닭들:
                    if d.get(갈래) == 값 and (굵 is None or d.get("w") == 굵): d["t"] = 글
                k = 꼴넣기(d)
                l = c.hyperlink.target if c.hyperlink is not None and c.hyperlink.target else None
                if l and not re.match(r"https?://", l): l = None    # 시트 안 이동 링크는 안 씀
                셀 = [t] if not k and not l else [t, k] if not l else [t, k, l]
                줄.append(셀[0] if len(셀) == 1 else 셀)
            줄들.append(줄); 행번호.append(r)
        # ⑥ 병합(자료 쪽) → 남긴 줄 번호·보이는 칸 번호로
        자리 = {r: k for k, r in enumerate(행번호)}
        병합들 = []
        for m in 병합:
            if m.min_row < 자료시작: continue
            rs = [자리[r] for r in range(m.min_row, m.max_row + 1) if r in 자리]
            cs = [열들.index(c) for c in range(m.min_col, m.max_col + 1) if c in 열들]
            if not rs or not cs or (len(rs) == 1 and len(cs) == 1): continue
            병합들.append([rs[0], cs[0], rs[-1], cs[-1]])
        시트들.append({
            "이름": ws.title,
            "거르개": bool(ws.auto_filter and ws.auto_filter.ref),
            "메모": 메모,
            "위": [[a, b] for a, b, _ in 위줄] if 아래머리 else None,
            "칸": [re.sub(r"\s+", " ", x).strip() for x in 칸이름],
            "칸원래": 칸이름,
            "열": [get_column_letter(i) for i in 열들],
            "행": 행번호,
            "제품명칸": 제품명칸,
            "줄": 줄들,
            "병합": 병합들,
        })
        print(f"  {ws.title}: 머리 {머리행}행 · 칸 {len(열들)} · 줄 {len(줄들)} · 병합 {len(병합들)} · 조건 {len(조건)} · 거르개 {시트들[-1]['거르개']}", file=sys.stderr)
    return {"v": 1, "파일": 경로.split("/")[-1], "만든때": datetime.datetime.now().isoformat(timespec="seconds"), "꼴": 꼴표, "시트": 시트들}

def 올리기(자료):
    글 = json.dumps(자료, ensure_ascii=False, separators=(",", ":"))
    조각, 지금 = [], ""
    for ch in 글:                                     # 바이트로 자름 (한글 3바이트)
        지금 += ch
        if len(지금) >= 조각크기 // 3 and len(지금.encode()) >= 조각크기: 조각.append(지금); 지금 = ""
    if 지금: 조각.append(지금)
    def 묻기(주소, 몸=None, 표=None, 셈=None):
        h = {"Content-Type": "application/json"}
        if 표: h["Authorization"] = "Bearer " + 표
        q = urllib.request.Request(주소, data=json.dumps(몸).encode() if 몸 is not None else None, headers=h, method=셈 or ("POST" if 몸 is not None else "GET"))
        with urllib.request.urlopen(q, timeout=60) as r: return json.loads(r.read() or b"{}")
    표 = 묻기(f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={KEY}", {"returnSecureToken": True})["idToken"]
    뿌리 = f"projects/{PROJ}/databases/(default)/documents"
    자리 = f"{뿌리}/artifacts/{PROJ}/public/data/{칸}"
    옛 = 묻기(f"https://firestore.googleapis.com/v1/{자리}?pageSize=300&mask.fieldPaths=n", 표=표).get("documents", [])
    옛이름 = {d["name"].split("/")[-1] for d in 옛}
    쓰기 = [{"update": {"name": f"{자리}/c{i + 1}", "fields": {"j": {"stringValue": s}}}} for i, s in enumerate(조각)]
    for n in 옛이름:
        m = re.fullmatch(r"c(\d+)", n)
        if m and int(m.group(1)) > len(조각): 쓰기.append({"delete": f"{자리}/{n}"})
    쓰기.append({"update": {"name": f"{자리}/info", "fields": {
        "n": {"integerValue": str(len(조각))}, "file": {"stringValue": 자료["파일"]},
        "at": {"stringValue": datetime.datetime.now(datetime.timezone.utc).isoformat()},
        "len": {"integerValue": str(len(글))}}}})
    묻기(f"https://firestore.googleapis.com/v1/{뿌리}:commit", {"writes": 쓰기}, 표=표)
    print(f"올림: 조각 {len(조각)} · 글 {len(글):,}자 · {len(글.encode()):,}바이트", file=sys.stderr)

if __name__ == "__main__":
    a = sys.argv[1:]
    if not a: print(__doc__); sys.exit(1)
    자료 = 만들기(a[0])
    if "--json" in a:
        with open(a[a.index("--json") + 1], "w", encoding="utf-8") as f: json.dump(자료, f, ensure_ascii=False)
    if "--올리기" in a: 올리기(자료)
