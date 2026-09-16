# 에이엠티 시험

`에이엠티.html` 을 진짜 브라우저로 열어 손가락으로 눌러 보는 시험 46개입니다.
화면에는 아무 영향이 없습니다 — GitHub Pages 는 `에이엠티.html` 만 내보냅니다.
이 폴더를 통째로 지워도 앱은 그대로 돕니다.

## 돌리는 법

    # 1) 저장소 뿌리에서 자리 서버를 띄운다
    cd <저장소>
    python3 -m http.server 8899 --bind 127.0.0.1

    # 2) 시험 하나
    node 에이엠티/tests/dot1.mjs

    # 3) 전부 (46개)
    cd 에이엠티/tests
    for f in $(cat 시험목록.txt); do node $f.mjs || echo "!! $f"; done

`시험목록.txt` 가 돌릴 46개의 이름입니다.

## 먼저 갖춰야 할 것

1. **플레이라이트** — 크로미움을 띄웁니다.
2. **자리 자료 네 개** — 저장소 뿌리에 아래 이름으로 둡니다.
   **이 파일들은 저장소에 넣지 않습니다.** 사장님의 실제 발주·재단계획·원장이 들어 있습니다.

       원장.json               원장 엑셀을 줄 배열로 푼 것 (첫 줄이 칸 이름)
       confirmed_orders.json   발주확정목록
       cutting_plans.json      재단도면
       wo_board_order.json     카드 차례

   파이어스토어에서 **읽기만** 해서 떨구면 됩니다. 시험은 이 파일들을 고치지 않습니다.

3. **막힌 CDN 네 곳을 대신할 것** — 이 상자에서는 아래 네 곳에 못 닿아, npm 으로 받은
   같은 판을 시험 창에만 끼워 줍니다. 앱 파일은 건드리지 않습니다.

       npm install tailwindcss@3.4.17 esbuild firebase@11.2.0 xlsx sortablejs gsap

   · `tw-built.css` — 테일윈드를 이 앱 파일 기준으로 뽑은 것
     `npx tailwindcss -c tw.config.js -i tw.in.css -o tw-built.css --minify`
     (`tw.config.js` 의 content 에 `에이엠티/에이엠티.html` 을 적는다)
   · `fb/firebase-{app,auth,firestore,storage}.js` — esbuild 로 묶은 것.
     auth·firestore·storage 는 `--external:@firebase/app` 로 묶고, 묶인 파일 안의
     `@firebase/app` 을 gstatic 주소로 바꿔 둔다(한 벌만 쓰게 하려는 것).

   닿는 자리에서 돌린다면 이 대신 끼우기는 없어도 됩니다.

## 시험이 지키는 것

* **업무 자료는 읽기만 합니다.** 파이어스토어 쓰기(setDoc/updateDoc/deleteDoc/addDoc)는
  가짜로 막고 몇 번 불렸는지 셉니다 — 늘 0 이어야 합니다.
* 시험이 스스로 지어내는 발주·상품 이름은 **본보기 이름**입니다
  (가나가구 · 샘플-20260101-01 · (본)본보기 수납장 1200 …). 실제 거래처·상품 이름은 없습니다.
* 화면은 **폰 375px** 이 기준이고, 누르는 것은 마우스가 아니라 **진짜 손가락**(CDP 터치 · tap)입니다.

## 그림

`SHOTS=1 node boxes1.mjs` 로 돌리면 `에이엠티/shots/` 에 그림을 다시 찍습니다.
그냥 돌리면 작업칸에만 남아 저장소가 더러워지지 않습니다.
