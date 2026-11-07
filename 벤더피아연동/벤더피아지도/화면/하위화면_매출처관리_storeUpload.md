# 하위화면 > 매출처관리 > storeUpload — 판매사일괄등록

- 주소: `/System/Upload/storeUpload.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 판매사일괄등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./storeUpload.aspx` (multipart/form-data)
- 비동기: 없음(폼 제출은 전체 다시 그림)

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 저장 | `btnUpload` | 쓰기 | 폼 제출(서버 처리) |
| 목록 | `btnClose` | 이동 | 폼 제출(서버 처리) |
| Close | `` | 화면만 |  |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `customFile` |  | 파일 | onchange: `return checkFileExtension(this);` · 이벤트 change,keydown |

## 일반 표

- `table table-striped- table-bordered tabl…`: 판매사명* · 대표자명* · 업태* · 종목* · 사업자번호* · 우편번호 · 기본주소* · 상세주소* · 전화번호* · 팩스번호 · 업체유형* · VAT포함여부 · 정산기준시점 · 최초거래일 · 결제기간 · 결제일 · 은행명 · 계좌번호 · 담당직원 · 담당부서 · 아이디* · 비밀번호* · 쇼핑몰명 · 쇼핑몰주소 · SCMURL · 쇼핑몰담당자 · 몰담당연락처 · 몰담당자메일 · 비고사항

## 숨은 값 (이름만)

`hdKey`

## 쪽 안 메시지

- 첨부 파일은 20MB 이하만 등록할 수 있습니다. 이미지 또는 불필요한 Sheet를 제거 후 다시 시도해주십시오.

## 연결되는 화면

- `../../System/Master/store.aspx`
- `oRowInsert.aspx`
- `../../Download/storeList.xlsx`

## 쪽 안 함수


그 밖: `doubleSubmitCheck` · `fnClose` · `fnDownFile`
