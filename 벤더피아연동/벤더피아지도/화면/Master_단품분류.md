# Master > 단품분류

- 주소: `/System/Master/category.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 단품분류관리
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./category.aspx` (application/x-www-form-urlencoded)
- 비동기: UpdatePanel ctl00$Contents$UpdatePanel1

## 버튼

| 글자 | id / name | 구분 | 동작 |
|---|---|---|---|
| 조회 | `btnSearch` | 조회 | 폼 제출(서버 처리) |
| 등록 | `btnInsert` | 쓰기 | 폼 제출(서버 처리) |
| 수정 | `btnUpdate` | 쓰기 | 폼 제출(서버 처리) |
| 삭제 | `btnDelete` | 쓰기 | 폼 제출(서버 처리) |
| 분류 | `ctl00_Contents_oTreet0` | 미확인 | `TreeView_SelectNode(ctl00_Contents_oTree_Data, this,'ctl00_Contents_oT` · 포스트백 `oTree` |
| 기타 | `ctl00_Contents_oTreet1` | 미확인 | `TreeView_SelectNode(ctl00_Contents_oTree_Data, this,'ctl00_Contents_oT` · 포스트백 `oTree` |
| 다이닝룸 | `ctl00_Contents_oTreet2` | 미확인 | `TreeView_SelectNode(ctl00_Contents_oTree_Data, this,'ctl00_Contents_oT` · 포스트백 `oTree` |
| 리빙룸 | `ctl00_Contents_oTreet3` | 미확인 | `TreeView_SelectNode(ctl00_Contents_oTree_Data, this,'ctl00_Contents_oT` · 포스트백 `oTree` |
| 베드룸 | `ctl00_Contents_oTreet4` | 미확인 | `TreeView_SelectNode(ctl00_Contents_oTree_Data, this,'ctl00_Contents_oT` · 포스트백 `oTree` |
| 상업용가구 | `ctl00_Contents_oTreet5` | 미확인 | `TreeView_SelectNode(ctl00_Contents_oTree_Data, this,'ctl00_Contents_oT` · 포스트백 `oTree` |
| 키즈룸 | `ctl00_Contents_oTreet6` | 미확인 | `TreeView_SelectNode(ctl00_Contents_oTree_Data, this,'ctl00_Contents_oT` · 포스트백 `oTree` |
| 홈오피스 | `ctl00_Contents_oTreet7` | 미확인 | `TreeView_SelectNode(ctl00_Contents_oTree_Data, this,'ctl00_Contents_oT` · 포스트백 `oTree` |
| AS | `ctl00_Contents_oTreet8` | 미확인 | `TreeView_SelectNode(ctl00_Contents_oTree_Data, this,'ctl00_Contents_oT` · 포스트백 `oTree` |
|  | `ctl00_Contents_oTreen0` | 미확인 |  |

## 입력 칸

이름 앞의 `ctl00$Contents$` 는 뺐다.

| 이름 | 화면 글자 | 종류 | 값 / 제한 |
|---|---|---|---|
| `ddlRowCnt` | 쪽당 줄 수 | 고르기 | 10 · 20 · 50 · 100 · 500 · 700 · onchange: `javascript:setTimeout('__doPostBack(\'ctl00$Contents$ddlRowC` (기본 `100`) |

## 표(그리드)

### `oGrid` — Infragistics WebDataGrid · 열 5개(보임 5) · 불러온 줄 있음: 예
- 기능: activation, columnResizing, editingCore, sorting, clipboard, events

보이는 열: CHK · 상위분류명(preCategoryNm) · 분류코드(categoryCd) · 분류명(categoryNm) · 분류차수(depth)


## 숨은 값 (이름만)

`hdKey` · `hNode` · `oGrid_clientState` · `hWidth` · `hMobile`

## 쪽 안 메시지

- 분류를 선택하세요.
- 팝업 차단을 해제해주세요.
- 삭제할 목록을 선택해 주십시오.
- 확인창: 삭제하시겠습니까?

## 연결되는 화면

- `categoryDtl.aspx?vendorCd=…`
- `#ctl00_Contents_oTree_SkipLink`

## 쪽 안 함수

- `fnSearch`: 단추 누름 `btnSearch`

그 밖: `TreeView_PopulateNodeDoCallBack` · `fnCategoryDtl` · `fnDelete`
