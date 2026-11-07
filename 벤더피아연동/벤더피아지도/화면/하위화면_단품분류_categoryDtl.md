# 하위화면 > 단품분류 > categoryDtl — 단품분류등록

- 주소: `/System/Master/categoryDtl.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 단품분류등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./categoryDtl.aspx` (application/x-www-form-urlencoded)
- 비동기: UpdatePanel ctl00$Contents$UpdatePanel1

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 저장 | `btnSave` | 쓰기 | 폼 제출(서버 처리) |
| 닫기 | `btnClose` | 이동 | 폼 제출(서버 처리) |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `tbPreCategoryCd` | 소속분류 | 글 | 읽기전용 · 이벤트 keydown |
| `tbPreCategoryNm` | 소속분류 | 글 | 읽기전용 · 이벤트 keydown |
| `tbDepth` | 소속차수 | 글 | 읽기전용 · 이벤트 keydown |
| `tbCategoryNm` |  | 글 | 이벤트 keydown |

## 숨은 값 (이름만)

`hdKey` · `hdCategoryCD`

## 쪽 안 메시지

- 확인창: 삭제하시겠습니까?

## 쪽 안 함수


그 밖: `doubleSubmitCheck` · `fnClose` · `fnDelete`
