# 하위화면 > Lot재고관리 > StockInspectionForUser — 전수조사

- 주소: `/System/Stock/StockInspectionForUser.aspx?ScanMode=BARCODE`
- 쪽 제목: VendorPia
- 화면 머리: 전수조사
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./StockInspectionForUser.aspx?ScanMode=BARCODE` (application/x-www-form-urlencoded)
- 비동기: 없음(폼 제출은 전체 다시 그림) · ajax 있음

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 목록 | `btnClose` | 이동 | JS만(제출 안 함) |
| 저장 | `btnSave` | 쓰기 | 폼 제출(서버 처리) |
| 전체삭제 | `btnGoodsNoDelete` | 쓰기 | 확인창 「해당 단품(옵션) 모든 바코드를 삭제하시겠습니까?」 · 검사 「삭제할 단품이을 먼저 클릭해 주십시오.」 |
| 초기화 | `btnClear` | 미확인 |  |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `tbBarCode` | 🎥 카메라접근권한을 허용해주십시오. | 글 | 최대 13 · 이벤트 focus,input,keydown |
| `ddlInspection` | 전수조사 : | 고르기 | -1=선택하세요 · 이벤트 change (기본 `-1`) |

## 일반 표

- `mGridTable`: NO · 단품명(옵션) · 수량 · 전체 · 내건 · 타인
- `dtTable`: NO · 바코드 · 조사일자 · 전체삭제

## 숨은 값 (이름만)

`hdKey` · `hdScanMode` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 확인창: 해당 단품(옵션) 모든 바코드를 삭제하시겠습니까?
- 삭제할 단품이을 먼저 클릭해 주십시오.
- 검수 목록을 불러오지 못했습니다:
- 전수조사를 먼저 선택해주십시오.
- code =
- 전체 삭제 실패:

## 연결되는 화면

- `LotNoBarCodeHome.aspx`
- `../WebSvcInspection.asmx`

## 쪽 안 함수

- `FnInspectionUserList`: ajax `../WebSvcInspection.asmx/InspectionUserList`
- `fnInspectionDetail`: ajax `../WebSvcInspection.asmx/InspectionUserListDetail`
- `fnInspectionUserDelete`: ajax `../WebSvcInspection.asmx/InspectionUserDelete`
- `fnInspectionUserDeleteALL`: ajax `../WebSvcInspection.asmx/InspectionUserDelete`
- `FnInspectionListAjax`: ajax `../WebSvcInspection.asmx/InspectionList`
- `fnBarCodeCheck`: ajax `../WebSvcInspection.asmx/InspectionUserSave`
- `FnDeleteGoodsAll`: ajax `../WebSvcInspection.asmx/InspectionUserDeleteGoodsNoOption`

그 밖: `drawLine` · `tick` · `FnhighlightRowByGoodsNo` · `SetDeleteButtonGoodsNo` · `fnBarCodeAdd` · `resetInputField`
