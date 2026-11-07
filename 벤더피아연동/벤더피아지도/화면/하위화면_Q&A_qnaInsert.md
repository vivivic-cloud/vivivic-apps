# 하위화면 > Q&A > qnaInsert — Q/A 등록

- 주소: `/System/Basic/qnaInsert.aspx`
- 쪽 제목: VendorPia
- 화면 머리: Q/A 등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./qnaInsert.aspx` (multipart/form-data)
- 비동기: UpdatePanel ctl00$Contents$UpdatePanel1

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 저장 | `btnSave` | 쓰기 | 폼 제출(서버 처리) |
| 목록 | `btnClose` | 이동 | `fnClose();` |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlStore` | 매출처 | 고르기 | 업무 자료 18개(적지 않음) |
| `ddlSupplier` | 매입처 | 고르기 | 업무 자료 109개(적지 않음) |
| `ddlDeliveryCo` | 배송사 | 고르기 | 업무 자료 18개(적지 않음) |
| `ddlShop` | 매장 | 고르기 | 업무 자료 4개(적지 않음) |
| `lbDept` | 소속부서 | 글 | 이벤트 keydown |
| `cbAnswerYn` |  | 체크 | 이벤트 keydown |
| `tbTitle` | 제목 | 글 | 최대 50 · 이벤트 keydown |
| `tbContent` | 문의내용 | 긴 글 |  |
| `FileUpload1` | 첨부파일1 | 파일 | 이벤트 keydown |
| `FileUpload2` | 첨부파일2 | 파일 | 이벤트 keydown |
| `FileUpload3` | 첨부파일3 | 파일 | 이벤트 keydown |
| `FileUpload4` | 첨부파일4 | 파일 | 이벤트 keydown |
| `FileUpload5` | 첨부파일5 | 파일 | 이벤트 keydown |

## 숨은 값 (이름만)

`hdKey` · `hDeptCd`

## 쪽 안 메시지

- 제목을 입력해주세요.
- 내용을 입력해주세요.

## 연결되는 화면

- `qna.aspx`

## 쪽 안 함수


그 밖: `doubleSubmitCheck` · `fieldValidationCheck`
