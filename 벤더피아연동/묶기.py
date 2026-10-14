#!/usr/bin/env python3
"""벤더피아연동.zip 을 묶는다. **늘 이것으로 묶어라.**

⚠⚠ 10-14 — 왜 이 글이 있나
사장님: 「공유된 판에서 벤더피아 연동 확장프로그램 압축다운받은게 폴더가 비어있다고 나온다는데」
까닭은 zip 이었다. 칸 이름이 **UTF-8 바이트**로 적혀 있는데 **「이건 UTF-8이다」 라는 표**
(일반목적 플래그 11번 비트, 0x800)가 **하나도 안 붙어 있었다**(칸 25개 중 0개).
표가 없으면 윈도우 기본 압축풀개가 그 바이트를 **CP949** 로 읽어 이름이 깨지거나
**아예 못 풀어 빈 폴더처럼** 보인다. 사장님 컴퓨터에서는 어쩌다 됐지만
공유받으신 분 컴퓨터에서는 안 됐다.

⚠ `zip -r` 로 묶지 마라 — 이 상자의 zip 은 0x800 을 안 붙이고 `-UN=UTF8` 옵션도 없다.
  파이썬 `zipfile` 은 아스키 아닌 이름에 **0x800 을 저절로 붙인다.** 그래서 이 글로 묶는다.
  (이 집 파일 이름에는 한글이 여섯 들어 있다 — 짚개.js·불러오기.js·저장다리.js·
   깔렸다표시.js·손잡이.js·CLAUDE.md. 안 폴더 이름 「벤더피아보기」 도 한글이다.)

하는 일 — 배포 차례 그대로다
  1. `손잡이.js` 를 `../shared/viggle.js` 에서 **다시 베낀다** (짚어서 지시하기의 뒷길)
  2. 이 폴더를 `벤더피아보기/` 라는 이름으로 묶는다 (zip·잰것 은 뺀다)
  3. **묶은 것을 제가 다시 열어 재고 찍는다.** 어긋나면 **1 로 끝낸다**(멈춘다).

쓰는 법:  python3 묶기.py          (벤더피아연동 폴더에서, 또는 어디서든)
"""
import hashlib
import os
import sys
import zipfile

집 = os.path.dirname(os.path.abspath(__file__))
속폴더 = "벤더피아보기"          # ⚠ 사장님 컴퓨터의 ~/Desktop/벤더피아보기 와 같아야 한다.
밖 = os.path.join(집, "벤더피아연동.zip")   #    이름이 같아야 풀어서 덮어쓰고 ↻ 만 누르면 된다.
뺄것 = {"벤더피아연동.zip", "잰것", "묶기.py", "__pycache__"}
손잡이원본 = os.path.join(집, "..", "shared", "viggle.js")


def 베끼기():
    """3-가. 손잡이.js 를 shared/viggle.js 에서 다시 베낀다. 고치는 곳은 늘 shared 하나다."""
    받을곳 = os.path.join(집, "손잡이.js")
    if not os.path.exists(손잡이원본):
        print("✗ shared/viggle.js 를 못 찾았습니다:", 손잡이원본)
        return False
    with open(손잡이원본, "rb") as r, open(받을곳, "wb") as w:
        w.write(r.read())
    return True


def 묶기():
    칸 = []
    for 이름 in sorted(os.listdir(집)):
        if 이름 in 뺄것:
            continue
        길 = os.path.join(집, 이름)
        if os.path.isdir(길):
            칸.append((이름 + "/", None))
            for f in sorted(os.listdir(길)):
                칸.append((이름 + "/" + f, os.path.join(길, f)))
        else:
            칸.append((이름, 길))
    if os.path.exists(밖):
        os.remove(밖)
    with zipfile.ZipFile(밖, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr(zipfile.ZipInfo(속폴더 + "/"), b"")       # 맨 위 폴더 칸
        for 안이름, 길 in 칸:
            이름 = 속폴더 + "/" + 안이름
            if 길 is None:
                z.writestr(zipfile.ZipInfo(이름), b"")
            else:
                z.write(길, 이름)
    return len(칸) + 1


def 재기():
    """묶은 것을 다시 열어 잰다. 숫자가 어긋나면 False."""
    z = zipfile.ZipFile(밖)
    목록 = z.infolist()
    표붙은것 = sum(1 for i in 목록 if i.flag_bits & 0x800)
    한글칸 = [i for i in 목록 if any(ord(c) > 127 for c in i.filename)]
    표없는한글 = [i for i in 한글칸 if not (i.flag_bits & 0x800)]
    판 = ""
    try:
        import json
        판 = json.loads(z.read(속폴더 + "/manifest.json").decode("utf-8")).get("version", "")
    except Exception as e:
        print("  ⚠ manifest.json 을 못 읽었습니다:", e)
    같나 = False
    try:
        같나 = (hashlib.md5(z.read(속폴더 + "/손잡이.js")).hexdigest()
                == hashlib.md5(open(손잡이원본, "rb").read()).hexdigest())
    except Exception:
        pass
    맨위 = 목록[0].filename if 목록 else ""
    깨짐 = z.testzip()

    print("  칸 수                    :", len(목록))
    print("  UTF-8 표(0x800) 붙은 것   :", 표붙은것, "/", len(목록))
    print("  한글 이름 든 칸           :", len(한글칸), "· 그중 표 없는 것:", len(표없는한글))
    print("  맨 위 폴더                :", 맨위)
    print("  판번호                    :", 판)
    print("  손잡이.js = shared/viggle :", 같나)
    print("  깨진 칸                   :", "없음" if 깨짐 is None else 깨짐)
    print("  크기                      :", f"{os.path.getsize(밖):,} 바이트")

    괜찮나 = True
    if 표붙은것 != len(목록):
        print("  ✗ UTF-8 표가 모든 칸에 안 붙었습니다 — 윈도우에서 빈 폴더로 보입니다."); 괜찮나 = False
    if 표없는한글:
        print("  ✗ 한글 이름인데 표가 없는 칸이 있습니다:", [i.filename for i in 표없는한글][:3]); 괜찮나 = False
    if 맨위 != 속폴더 + "/":
        print(f"  ✗ 맨 위 폴더 이름이 「{속폴더}」 가 아닙니다 — 덮어쓰기가 안 됩니다."); 괜찮나 = False
    if not 같나:
        print("  ✗ 손잡이.js 가 shared/viggle.js 와 다릅니다 — 묵은 뒷길이 돌아갑니다."); 괜찮나 = False
    if 깨짐 is not None:
        print("  ✗ 깨진 칸이 있습니다:", 깨짐); 괜찮나 = False
    return 괜찮나


if __name__ == "__main__":
    print("■ 벤더피아연동.zip 묶기")
    if not 베끼기():
        sys.exit(1)
    print("  손잡이.js 를 shared/viggle.js 에서 다시 베꼈습니다.")
    묶기()
    if 재기():
        print("\n다 됐습니다. ⚠ 사장님(과 공유받으신 분)이 **zip 을 다시 받아** 풀고")
        print("   ~/Desktop/벤더피아보기 에 덮어쓴 뒤 chrome://extensions 에서 ↻ 를 누르셔야 합니다.")
        sys.exit(0)
    print("\n✗ 어긋났습니다. 위 줄을 보고 고친 뒤 다시 묶으십시오.")
    sys.exit(1)
