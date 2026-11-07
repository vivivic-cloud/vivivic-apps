# 하위화면 > 배송스케줄 > upTruckList — 오류메시지

- 주소: `/System/Sales/upTruckList.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 오류메시지 · 소스 : VP.Server.Delivery
- 상태: **미확인** (2026-11-07— 값 없이 열어 벤더피아 오류 쪽이 나옴)
- 폼: `aspnetForm` POST `../../common/ErrorMsg.aspx?Source=…&Message=…)%ub85c+%ubcc0%ud658%ud558%uc9c0+%ubabb%ud588%uc2b5%ub2c8%ub2e4.&StackTrace=…)+%ud30c%uc77c+D%3a%5cVendorpia%5cVP.Server%5cVP.Server.Delivery%5cDelivery_nTx.cs%3a%uc904+213%0d%0a+++%uc704%uce58%3a+System_Sales_upTruckList.FillGridView()` (application/x-www-form-urlencoded)
- 비동기: UpdatePanel ctl00$Contents$UpdatePanel1

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 취소 | `btnCancel` | 쓰기 | `fnClose();` · 폼 제출(서버 처리) |

## 숨은 값 (이름만)

`hdKey` · `hWidth` · `hMobile`

## 연결되는 화면

- `../../common/ErrorMsg.aspx?Source=…&Message=…`
- `../../subPage.aspx`

## 쪽 안 함수

- `fnClose`: → `../../subPage.aspx`
