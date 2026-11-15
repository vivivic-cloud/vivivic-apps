// 하우저 재고현황(/storage/inventory/list) 읽기 전용 보기. 아무것도 저장·전송하지 않는다.
(function () {
  const NUM = ['정상 재고', '불량 재고', '검품 대기', '가용 재고', '입고 예정'];
  const COLS = ['하우저 상품번호', '상품명', '시공유형', ...NUM, '출고예정 (확정)', '위치', '메모'];

  function read() {
    const t = document.querySelector('#tbl_ret');
    if (!t) return null;
    const heads = [...t.querySelectorAll('thead th')].map(th => th.innerText.replace(/내림차순으로 보기|오름차순으로 보기/g, '').replace(/\s+/g, ' ').trim());
    const rows = [...t.querySelectorAll('tbody tr')].filter(r => r.children.length === heads.length)
      .map(r => { const o = {}; [...r.children].forEach((c, i) => o[heads[i]] = c.innerText.trim()); return o; });
    return { heads, rows };
  }

  function open() {
    const d = read();
    if (!d || !d.rows.length) { alert('재고 표가 아직 없습니다. 조회가 끝난 뒤 다시 눌러 주세요.'); return; }
    const cols = COLS.filter(c => d.heads.includes(c));
    const ov = document.createElement('div'); ov.id = 'hw-ov';
    const sum = k => d.rows.reduce((s, r) => s + (parseInt((r[k] || '0').replace(/,/g, ''), 10) || 0), 0);
    ov.innerHTML = '<header><h1>하우저 재고현황</h1><input placeholder="상품명·번호 검색"><button>닫기</button></header>' +
      '<div id="hw-sum"></div><div id="hw-wrap"><table><thead></thead><tbody></tbody></table></div>';
    document.body.appendChild(ov);
    ov.querySelector('thead').innerHTML = '<tr>' + cols.map(c => `<th class="${NUM.includes(c) ? 'n' : ''}">${c}</th>`).join('') + '</tr>';
    const draw = q => {
      const rs = d.rows.filter(r => !q || (r['상품명'] + r['하우저 상품번호']).toLowerCase().includes(q.toLowerCase()));
      ov.querySelector('tbody').innerHTML = rs.map(r => '<tr>' + cols.map(c => {
        const v = r[c] || '';
        const cls = NUM.includes(c) ? 'n' + (v === '0' ? ' z' : (c === '불량 재고' ? ' bad' : '')) : '';
        return `<td class="${cls}">${v.replace(/</g, '&lt;')}</td>`;
      }).join('') + '</tr>').join('');
      const s = k => rs.reduce((a, r) => a + (parseInt((r[k] || '0').replace(/,/g, ''), 10) || 0), 0);
      ov.querySelector('#hw-sum').innerHTML = `<span>상품<b>${rs.length}</b></span>` + ['정상 재고', '불량 재고', '가용 재고', '입고 예정'].map(k => `<span>${k}<b>${s(k)}</b></span>`).join('');
    };
    draw('');
    ov.querySelector('input').oninput = e => draw(e.target.value.trim());
    ov.querySelector('button').onclick = () => ov.remove();
  }

  const b = document.createElement('button'); b.id = 'hw-btn'; b.textContent = '우리 표로 보기';
  b.onclick = open; document.body.appendChild(b);
})();
