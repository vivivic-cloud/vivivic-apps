# 하위화면 > 고객문의 > inquiryUpload — 문의일괄등록

- 주소: `/System/CS/inquiryUpload.aspx`
- 쪽 제목: VendorPia
- 화면 머리: 문의일괄등록
- 상태: **확인함** (2026-11-07)
- 폼: `aspnetForm` POST `./inquiryUpload.aspx` (multipart/form-data)
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
| `customFile` | Choose file | 파일 | 이벤트 change |

## 일반 표

- `kt_table_1`: orderNo* · 제목* · 내용*

## 숨은 값 (이름만)

`hdKey` · `hSearchCondition` · `hWidth` · `hMobile`

## 연결되는 화면

- `inquiryList.aspx?SearchCondition=…`
- `../../Download/inquiryList.xls`

## 쪽 안 함수

- `fnClose`: → `inquiryList.aspx?SearchCondition=`

그 밖: `fnDownFile`
