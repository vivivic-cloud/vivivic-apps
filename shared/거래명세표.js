/* 거래명세표 — 담긴 표 한 벌을 **종이꼴 HTML** 로 그린다.

   사장님 10-12 말씀:
   「조혼가구 스캔으로 납기명세서가 발생될때 에이엠티 프로그램으로 연결되어 나타나는 듯하다
     - 이는 차후 에이엠티와의 로그인 문제로 혼란을 줄 수 있다. 에이엠티의 거래명세표를
     조혼가구에 따로 받아와서 사용할 수 있는 방법을 강구하라」

   그래서 **그리는 법을 집 밖으로 뺀다.** 에이엠티도 조혼가구도 이 한 벌을 쓴다 —
   베껴 두 벌이 되면 두 집이 다른 종이를 보게 된다.

   ⚠⚠ **이 파일은 셈을 하지 않는다.** `confirmedOrders`·`currentFullData`·`window.*` 를
      한 줄도 안 본다. 들어온 것만 보고 그린다. 그래야 남의 집에서도 똑같이 돈다.

   들어오는 것 — `입고확인`·`출고명세표` 에 담긴 **`명세표` 꼴 그대로**다. 새 꼴이 아니다.
     [{ 발주: {displayName, code, orderCode, deliveryDate},
        계획들: [{ 파, 매, 종류, 색상,
                   품목들: [{이름, 크기, 몫, 코드}] }] }]
     · `몫` 이 `null` 이면 **빈칸**이다(0 이 아니다 — 아직 안 적힌 것이다).
     · `매` 가 `null` 이면 원장 매수를 모르는 줄이다.

   설정
     공정      머리줄에 적을 말. 기본 「납기」
     원장      참이면 원장 칸(입고일·수량·재단금액·소요량 쪽)을 단다. 거래명세표는 **거짓**
     파칸      참이면 파레트 칸을 단다. 거래명세표는 **참**
     날짜      줄이 하나도 없을 때 적을 날
     추린이름  파레트 하나만 추렸을 때 그 이름(빈 표의 글이 달라진다)
     몰라      아직 어디서 받을지 모르는 칸을 그리는 함수. 기본은 **빈칸**
     돈글      돈을 글로. 기본은 숫자 그대로
     재단단가  원장 한 장당 값. 원장 칸이 없으면 안 쓴다

   돌려주는 것  { html, 총매, 줄수 }
*/
(() => {
  const _e = (v) => String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function 그리기(묶음, 설정) {
    const 것 = 설정 || {};
    const 공정 = String(것.공정 == null ? '납기' : 것.공정);
    const 원장 = !!것.원장;
    const 파칸 = 것.파칸 == null ? true : !!것.파칸;
    const 날짜 = String(것.날짜 == null ? '' : 것.날짜);
    const 추린파 = String(것.추린이름 == null ? '' : 것.추린이름).trim();
    const 몰라 = typeof 것.몰라 === 'function' ? 것.몰라 : () => '';
    const 돈글 = typeof 것.돈글 === 'function' ? 것.돈글 : (n) => String(n);
    const 단가 = Number(것.재단단가) || 0;

    let 총매 = 0, 줄수 = 0;
    const 몸 = [];
    (묶음 || []).forEach((묶, i) => {
      const o = 묶.발주 || {};
      const 계획들 = 묶.계획들 || [];
      const 품목수 = 계획들.reduce((a, g) => a + ((g && g.품목들) || []).length, 0);
      줄수 += 품목수;
      let 첫줄 = true;
      계획들.forEach(g => {
        if (g.매 != null) 총매 += g.매;
        ((g && g.품목들) || []).forEach((품, j) => {
          const td = [];
          if (첫줄) {
            td.push(`<td rowspan="${품목수}" class="ㄱ">${i + 1}</td>`);
            td.push(`<td rowspan="${품목수}">${_e(o.displayName || o.code || '')}</td>`);
            td.push(`<td rowspan="${품목수}" class="ㄱ">${_e(o.orderCode || '')}</td>`);
            td.push(`<td rowspan="${품목수}" class="ㄱ">${_e(g.종류)}</td>`);
            td.push(`<td rowspan="${품목수}" class="ㄱ">${_e(g.색상)}</td>`);
            // 모델명 · 출고처 — 아직 어디서 받을지 모르는 칸이다.
            // 재단은 빨간 「?」, 그 밖의 공정은 **빈칸**으로 둔다(10-11 지시).
            td.push(`<td rowspan="${품목수}" class="ㄱ">${원장 ? 몰라('') : ''}</td>`);
            td.push(`<td rowspan="${품목수}" class="ㄱ">${원장 ? 몰라('') : ''}</td>`);
            // 원장입고일 — 원장재고 칸이다. 재단에만 둔다.
            if (원장) td.push(`<td rowspan="${품목수}" class="ㄱ">${몰라('')}</td>`);
          }
          // 파레트는 그 묶음의 **첫 줄에만** 적고 아래로 덮는다 — 묶음이 눈에 보인다
          if (파칸 && j === 0) td.push(`<td rowspan="${((g && g.품목들) || []).length}" class="ㄱㄱ">`
            + (g.파 ? _e(g.파) : '<span class="명세-빈파">없음</span>') + `</td>`);

          td.push(`<td class="ㄱ">${_e(품.코드)}</td>`);
          td.push(`<td>${_e(품.이름)}</td>`);
          td.push(`<td class="ㄱ">${_e(품.크기)}</td>`);
          td.push(`<td class="ㄱㄱ">${품.몫 == null ? '' : 품.몫 + '개'}</td>`);
          if (j === 0 && 원장) {
            // 재단금액 = 그 줄의 원장 수량 × 원장 한 장당 값(부가세 포함)
            const 돈 = (g.매 == null) ? null : g.매 * 단가;
            td.push(`<td rowspan="${((g && g.품목들) || []).length}" class="ㄱㄱ">${g.매 == null ? '-' : g.매 + '매'}</td>`);
            td.push(`<td rowspan="${((g && g.품목들) || []).length}" class="ㄱㄱ">${돈 == null ? '-' : 돈글(돈)}</td>`);
          }
          if (첫줄) td.push(`<td rowspan="${품목수}" class="ㄱ">${_e((o.deliveryDate || '').slice(5).replace('-', '/'))}</td>`);
          몸.push('<tr>' + td.join('') + '</tr>');
          첫줄 = false;
        });
      });
    });
    // 추린 파레트에 줄이 하나도 없으면 **빈 표를 내지 않고 한 줄**로 알린다 (10-11 지시)
    if (!줄수) return { html: `<div class="명세-없음">` + (추린파
      ? `${_e(추린파)} 에 담긴 것이 없습니다.`
      : `${_e(날짜)} ${_e(공정)} — 완료된 작업이 없습니다.`) + `</div>`, 총매: 0, 줄수: 0 };

    const 소 = new Map();
    (묶음 || []).forEach(묶 => ((묶 && 묶.계획들) || []).forEach(g => {
      if (g.매 == null) return;
      const k = (g.종류 || '-') + '|' + (g.색상 || '-');
      소.set(k, (소.get(k) || 0) + g.매);
    }));
    const 소줄 = [...소.entries()].map(([k, 매]) => {
      const [종, 색] = k.split('|');
      return `<tr><td class="ㄱ">${몰라('')}</td><td class="ㄱ">${_e(종)}</td>` +
        `<td class="ㄱ">${몰라('')}</td><td class="ㄱ">${_e(색)}</td>` +
        `<td class="ㄱ">${몰라('')}</td><td class="ㄱㄱ">${매}.0매</td>` +
        `<td class="ㄱ">${몰라('')}</td></tr>`;
    }).join('');

    // 이 명세서의 **낱칸 수** — 재단 15 · 그 밖 12 (원장입고일·원장수량·재단금액이 빠진다)
    const 칸수 = (원장 ? 15 : 12) + (파칸 ? 1 : 0);
    const html =
      `<div class="명세-쪽">` +
      `<table class="명세-표">` +
      `<tr><th rowspan="2">순번</th><th rowspan="2">제품명</th><th rowspan="2">PO NO.</th>` +
      `<th colspan="4">원 장</th>` +
      (원장 ? `<th rowspan="2">원장<br>입고일</th>` : '') +
      (파칸 ? `<th rowspan="2">파레트</th>` : '') +
      `<th rowspan="2">부속코드</th><th rowspan="2">품목</th>` +
      `<th rowspan="2">사이즈</th><th rowspan="2">${_e(공정)}<br>수량</th>` +
      (원장 ? `<th rowspan="2">원장<br>수량</th><th rowspan="2">재단금액</th>` : '') +
      `<th rowspan="2">출고<br>예정일</th></tr>` +
      `<tr><th>종류</th><th>색상</th><th>모델명</th><th>출고처</th></tr>` +
      몸.join('') +
      (원장
        ? `<tr class="합"><td class="ㄱ" colspan="12">합  계</td><td class="ㄱ">${총매}매</td>` +
          `<td class="ㄱ">${돈글(총매 * 단가)}</td><td></td></tr>`
        : '') +
      /* 10-11 사장님: 전잔액/현잔액 줄은 「**빼지말고 빈칸으로**」.
         재단에서는 빨간 「?」 그대로, 그 밖의 공정에서는 **빈칸**으로 둔다.
         줄 수가 공정마다 다르므로 칸 수에서 내어 쓴다(앞 칸수-6 · 3 · 1 · 2). */
      `<tr class="합"><td class="ㄱ" colspan="${칸수 - 6}">전잔액</td>` +
      `<td class="ㄱ" colspan="3">${원장 ? 몰라('') : ''}</td>` +
      `<td class="ㄱ">현잔액</td>` +
      `<td class="ㄱ" colspan="2">${원장 ? 몰라('') : ''}</td></tr>` +
      `</table></div>` +
      (원장
        ? `<div class="명세-쪽"><p class="명세-쪽이름">원장 소요량</p>` +
          `<table class="명세-표">` +
          `<tr><th>출고처</th><th>종류</th><th>모델명</th><th>색상</th>` +
          `<th>전일소요량</th><th>금일 소요량</th><th>총소요량</th></tr>` + 소줄 +
          `<tr class="합"><td class="ㄱ" colspan="4">총 소 요 량</td><td class="ㄱ">${몰라('')}</td>` +
          `<td class="ㄱㄱ">${총매}.0매</td><td class="ㄱ">${몰라('')}</td></tr>` +
          `</table></div>`
        : '');
    return { html, 총매, 줄수 };
  }

  /* 보내 둔 거래명세표가 사는 자리. 문서 이름이 **큐알 글**이라,
     거래처는 찍은 글로 바로 집는다. `vp_` 가 아니다 — 두 집이 다 읽어야 한다. */
  const 자리 = ['artifacts', 'vivivic-4b7ef', 'public', 'data', '출고명세표'];

  const 것 = { 그리기, 자리 };
  if (typeof window !== 'undefined') window.거래명세표 = 것;
  if (typeof module !== 'undefined' && module.exports) module.exports = 것;
})();
