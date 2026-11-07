# 하위화면 > 고객주문변경 > csUpload — 상담일괄등록

- 주소: `/System/CS/csUpload.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 상담일괄등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./csUpload.aspx` (multipart/form-data)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnUpload` | 조회 | 폼 제출(서버 처리) |
| (그림 icon_cancel.gif, 닫기/취소로 보임) | `btnClose` | 이동 | `fnClose(); return false;` · JS만(제출 안 함) |
| Close | `` | 화면만 |  |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlStore` |  | 고르기 | 업무 자료 19개(적지 않음) |
| `customFile` | Choose file | 파일 | 이벤트 change |

## 일반 표

- `kt_table_1`: 매출처주문번호* · CS유형* · CS사유* · 상품CS수량* · 담당자* · 단품옵션 · CS상세사유 · 매출처주문일* · 송장번호 · 교환송장번호 · 접수일* · 회수여부*

## 숨은 값 (이름만)

`hdKey` · `hSearchCondition` · `hWidth` · `hMobile`

## 연결되는 화면

- `csList.aspx?SearchCondition=…`
- `../../Download/csList.xls`

## 쪽 안 함수

- `fnClose`: → `csList.aspx?SearchCondition=`

그 밖: `fnDownFile`
