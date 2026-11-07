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
| `tbCategoryNm` | 분류명 * | 글 | 이벤트 keydown · maxlength 없음 |

## 숨은 값 (이름만)

`hdKey` · `hdCategoryCD`

## 쪽 안 메시지

- 확인창: 삭제하시겠습니까?

## 쪽 안 함수


그 밖: `doubleSubmitCheck`(11-07 잼 — 새 등록 쪽엔 없음, undefined) · `fnClose` · `fnDelete`

## 새 등록 길 (11-07 [새 지시 단품분류 등록] 잼 — 읽기만, 저장 안 누름)

- 여는 곳: `category.aspx` 「등록」 → `fnCategoryDtl(btnInsert)` → `window.open('categoryDtl.aspx?vendorCd…&preCd=1&preNm=분류&depth=', 'popup')`. 쪽을 새로 열면 `hNode`=1(맨 위 「분류」)이라 트리를 안 눌러도 같다. 「수정」 주소는 `vendorCd`·`categoryCd`.
- 새 등록 때 값: 소속 코드 1 · 소속 이름 분류 · `tbDepth` 0 · `hdCategoryCD` 빈칸. 입력 칸은 `tbCategoryNm` 하나.
- `btnSave`: onclick 없음, 쪽 안 검사·alert 없음, `UpdatePanel1` 안(자식이 트리거). 저장 응답 꼴은 못 봄.
- 확장에서 쓰는 곳: `goods.js` `분류등록올리기`(벤더피아 쓰기 예외 네 번째).
