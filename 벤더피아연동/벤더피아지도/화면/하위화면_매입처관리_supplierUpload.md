# 하위화면 > 매입처관리 > supplierUpload — 매입처-일괄업로드

- 주소: `/System/Upload/supplierUpload.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 매입처-일괄업로드
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./supplierUpload.aspx` (multipart/form-data)
- 비동기: UpdatePanel ctl00$Contents$UpdatePanel1

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 저장 | `btnUpload` | 쓰기 | 폼 제출(서버 처리) |
| 목록 | `btnClose` | 이동 | 폼 제출(서버 처리) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `customFile` |  | 파일 | onchange: `return checkFileExtension(this);` · 이벤트 change,keydown |

## 일반 표

- `table table-striped- table-bordered tabl…`: 구매사명* · 대표자명* · 대표자연락처 · 업태* · 종목* · 사업자번호* · 우편번호 · 기본주소* · 상세주소* · 전화번호* · 팩스번호 · 아이디* · 비밀번호* · 긴급연락처 · 구매사구분 · 구매사담당자 · 최초거래일 · 결제기간 · 결제일 · 예금주 · 은행명 · 계좌번호 · 비고사항

## 숨은 값 (이름만)

`hdKey`

## 쪽 안 메시지

- 엑셀(.xls, .xlsx)파일만 선택이 가능합니다.
- 첨부 파일은 20MB 이하만 등록할 수 있습니다. 이미지 또는 불필요한 Sheet를 제거 후 다시 시도해주십시오.

## 연결되는 화면

- `../../System/Master/supplier.aspx`
- `oRowInsert.aspx`
- `../../Download/supplierList.xls`

## 쪽 안 함수


그 밖: `doubleSubmitCheck` · `checkFileExtension` · `fnClose` · `fnDownFile`
