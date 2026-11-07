# 하위화면 > 상품관리 > salesGoodsCopy — 상품목록조회

- 주소: `/System/Master/salesGoodsCopy.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 상품목록조회
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./salesGoodsCopy.aspx` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 목록 | `btnClose` | 이동 |  |
| 등록 | `btnSave` | 쓰기 |  |
|  [그리드 안] | `chkALL` | 화면만 | `CheckAllChkItems(this);` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlFromStore` | 원본매출처 | 고르기 | 업무 자료 18개(적지 않음) |
| `tbSGoodsCd` | 매출처상품코드 | 글 |  |
| `tbSGoodsNm` | 상품명 | 글 |  |
| `ddlOption` | 옵션상품여부 | 고르기 | 전체 · 전체 · 1=옵션상품 · 0=상품 (기본 `전체`) |
| `ddlStatus` | 판매상태 | 고르기 | 전체 · 1=판매중 · 2=중지 · 3=품절 (기본 `1`) |
| `ddlUser` | 판매담당 | 고르기 | 업무 자료 46개(적지 않음) |
| `dcStartDt` | 등록기간 | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `dcEndDt` | ~ | 날짜 | 이벤트 focus,keydown,keypress,keyup |
| `ddlToStore` | 대상매출처 | 고르기 | 업무 자료 18개(적지 않음) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 15개(보임 14) · 불러온 줄 있음: 예
- 기능: selection, activation, columnResizing, editingCore, clipboard, events
- 줄 안 요소: `INPUT¦checkbox¦ctl#$Contents$oGrid$it#_#$chkItem¦`

보이는 열: (체크)(CHK) · 매출처명(storeNm) · 옵션상품여부(optionGoodsYn) · 매출처상품명(storeGoodsNm) · 매출처상품코드(storeGoodsCd) · 상품코드(toSGoodsCd) · 상품명(salesGoodsNm) · 판매금액(salesUnitAmt) · 공급금액(supplyUnitAmt) · 구매단가(purchaseAmt) · 수수료(fee) · 판매상태(salesStatusNm) · 판매담당(userNm) · 등록일(regDt)

숨은 열: 매출처코드(storeCd)


쪽 넘김: `Pager1`

## 숨은 값 (이름만)

`hdKey` · `oGrid_clientState` · `hWidth` · `hMobile`

## 연결되는 화면

- `salesGoods.aspx`
