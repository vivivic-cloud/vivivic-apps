/* 발주상품고르기 — 조혼가구 「제품 발주」의 상품검색 세 방법(상품검색 · ING단품명 · 카테고리) + 부속카드. **공용 부품 한 벌.**

   사장님 11-01 말씀:
   「야 상품검색 부속카드가 조홍가구와 동일한 형태로 나와야 하니까 이렇게 따로 디자인하지말고
     그냥 깃에 배포된 조혼가구의 이부분을 갖다 쓰는 형태로 하면 안될까?」

   ⚠⚠ 공용이다 — **여기를 고치면 조혼가구와 영림원외주입력이 같이 바뀐다.**
   ⚠ 조혼가구는 실제로 쓰는 발주 프로그램이다. 조혼가구 동작이 달라지면 안 된다.

   들어 있는 것 (모두 조혼가구.html v1.9.4 에서 **한 글자도 안 고치고** 옮겼다)
     · 검색칸 마크업 — 조혼가구의 #filter-container 안쪽 그대로 → 발주상품고르기.검색칸()
     · 부속카드 마크업 — 조혼가구 renderOrderParts 의 카드 · 「AMT 외 공급처」 카드 · 두 묶음 → 부속카드() · 특별카드() · 부속묶음()
     · 검색칸을 움직이는 함수들 — resetSelect · onSupplierChange · ING 드롭다운 · adjustIngSelectWidth · onCodeChange ·
       onL1~4Change · resetCategorySelects · resetSearchLabel · selectSearchMethod · 입력 유도(overlay · typePlaceholder) ·
       updateCategoryGuide · initializeCategoryFilters · 부속만 발주 팝오버 · handleSearch · handleSearchKeydown · selectSearchResult · johonPickTick
       (전역 함수 그대로 — 조혼가구 마크업의 onclick 이 이 이름들을 부른다)
     · 모양(CSS) — shared/조혼가구모양.css (조혼가구 <style> 한 벌 그대로)

   부르는 쪽이 갖춰 줄 것 (전역) — 조혼가구는 이미 다 있다:
     currentFullData(원장 줄 배열, 1행 머리) · getCurrentSupplier() · normalizeValue · buildDisplayName · dismissTutorial ·
     (발주: true 일 때만) addOrderedProduct · addOrderedProductFromSearch
   끼울 자리 — 발주.
     { 발주: true }  조혼가구: 「세트발주」·「부속만 발주」 단추까지 그대로.
     { 발주: false } 영림원외주입력(shared/발주상품고르기.html): 그 단추들을 뺀 보기 전용. 고르면 부르는 쪽이
                     showPartBtn(mode) / hidePartAll(mode) 를 덮어써 부속카드를 그린다.

   ⚠ 이 파일은 쓰지 않는다(파이어베이스·저장 없음). 원장 읽기는 각 집이 한다 — 영림원외주입력은 shared/발주상품검색.js. */
var 발주상품고르기 = (function () {
    'use strict';

    /* 조혼가구 #filter-container 안쪽 — 글자 그대로(띄어쓰기까지). 바꾸면 두 집이 같이 바뀐다. */
    var 검색칸글 = `
                <div class="flex items-center gap-3 flex-wrap">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[#787774]">
                        <path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>
                    </svg>

                    <!-- 검색 방법 — 폰에서 한 번에 고르게 펼쳐 둔다 -->
                    <div class="dropdown-container jh-pick-box" style="position:relative;">
                        <div id="tutorial-search-tooltip" class="tutorial-tooltip hidden" style="top: calc(100% + 10px); left: 0;" onmouseenter="dismissTutorial()">
                            <span class="tutorial-emoji">👆</span>상품 검색
                        </div>
                        <span id="search-method-label" class="hidden"></span>
                        <div class="method-pick" onclick="dismissTutorial()">
                            <button type="button" class="method-chip" data-mode="direct"
                                onclick="selectSearchMethod('direct', '상품검색(직접입력)')">상품검색</button>
                            <button type="button" class="method-chip jh-pick-best" data-mode="ing"
                                onclick="selectSearchMethod('ing', 'ING단품명')">ING단품명<em>추천</em></button>
                            <button type="button" class="method-chip" data-mode="category"
                                onclick="selectSearchMethod('category', '카테고리')">카테고리</button>
                        </div>
                    </div>

                    <!-- 직접입력 검색 -->
                    <div id="search-mode-direct" class="search-mode-content hidden flex items-center gap-2">
                        <div class="relative" style="min-width: 16rem;">
                            <input type="text" id="product-search" class="notion-input" placeholder="상품명을 입력하세요..." oninput="handleSearch(this.value)" onkeydown="handleSearchKeydown(event)" style="width: 100%;">
                            <div id="search-results" class="search-results-list hidden custom-scrollbar"></div>
                        </div>
                        <div id="wrap-part-direct" class="relative hidden flex-shrink-0 flex items-center gap-2">
                            <button id="btn-part-direct" onclick="handlePartSelectClick('direct')" class="btn-part-order">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                <span class="jh-marq"><span>부속만 발주</span></span>
                            </button>
                            <div id="popover-part-direct" class="part-confirm-popover hidden">
                                <p class="text-[11px] font-bold text-[#37352f] mb-3">선택 부속만 발주?</p>
                                <div class="flex items-center gap-2">
                                    <button onclick="confirmPartSelect('direct')" class="flex-1 py-1.5 text-[11px] font-bold bg-[#37352f] text-white rounded-md hover:bg-black transition-all active:scale-95">확인</button>
                                    <button onclick="cancelPartSelect('direct')" class="flex-1 py-1.5 text-[11px] font-bold bg-[#f7f6f3] text-[#787774] rounded-md hover:bg-[#efefec] transition-all active:scale-95 border border-[#ededeb]">취소</button>
                                </div>
                            </div>
                            <div id="listpop-part-direct" class="part-list-popover hidden"></div>
                            <div id="chip-part-direct" class="hidden flex items-center gap-1">
                                <span id="chip-label-direct" class="part-selected-chip" onclick="openPartList('direct')">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                    <span id="chip-text-direct">부속선택</span>
                                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
                                </span>
                                <button onclick="clearPartSelect('direct')" class="text-[10px] text-[#b0aeaa] hover:text-red-400 font-bold px-1 transition-colors" title="부속발주 해제">✕</button>
                            </div>
                        </div>
                        <input type="hidden" id="sel-part-name-direct" value="">
                        <button id="btn-select-direct" onclick="addOrderedProductFromSearch()" class="notion-card bg-blue-600 hover:bg-blue-700 text-white px-4 font-bold text-[11px] flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 h-[34px] hidden animate-pulse hover:shadow-lg cursor-pointer flex-shrink-0">세트발주</button>
                    </div>

                    <!-- ING단품명 검색 -->
                    <div id="search-mode-ing" class="search-mode-content hidden flex items-center gap-2">
                        <div id="ing-select-wrap" class="select-guide-wrap" style="min-width:12rem; transition:width 0.2s ease;">
                            <select id="sel-ing-code" class="notion-select" style="width:100%; transition:width 0.2s ease;" onchange="onCodeChange()" disabled>
                                <option value=""></option>
                            </select>
                            <div id="overlay-ing" class="select-guide-overlay hidden">제품 고르기</div>
                        </div>
                        <div id="wrap-part-ing" class="relative hidden flex-shrink-0 flex items-center gap-2">
                            <button id="btn-part-ing" onclick="handlePartSelectClick('ing')" class="btn-part-order">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                <span class="jh-marq"><span>부속만 발주</span></span>
                            </button>
                            <div id="popover-part-ing" class="part-confirm-popover hidden">
                                <p class="text-[11px] font-bold text-[#37352f] mb-3">선택 부속만 발주?</p>
                                <div class="flex items-center gap-2">
                                    <button onclick="confirmPartSelect('ing')" class="flex-1 py-1.5 text-[11px] font-bold bg-[#37352f] text-white rounded-md hover:bg-black transition-all active:scale-95">확인</button>
                                    <button onclick="cancelPartSelect('ing')" class="flex-1 py-1.5 text-[11px] font-bold bg-[#f7f6f3] text-[#787774] rounded-md hover:bg-[#efefec] transition-all active:scale-95 border border-[#ededeb]">취소</button>
                                </div>
                            </div>
                            <div id="listpop-part-ing" class="part-list-popover hidden"></div>
                            <div id="chip-part-ing" class="hidden flex items-center gap-1">
                                <span id="chip-label-ing" class="part-selected-chip" onclick="openPartList('ing')">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                    <span id="chip-text-ing">부속선택</span>
                                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
                                </span>
                                <button onclick="clearPartSelect('ing')" class="text-[10px] text-[#b0aeaa] hover:text-red-400 font-bold px-1 transition-colors" title="부속발주 해제">✕</button>
                            </div>
                        </div>
                        <input type="hidden" id="sel-part-name-ing" value="">
                        <button id="btn-select-ing" onclick="addOrderedProduct()" class="notion-card bg-blue-600 hover:bg-blue-700 text-white px-4 font-bold text-[11px] flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 h-[34px] hidden animate-pulse hover:shadow-lg cursor-pointer flex-shrink-0">세트발주</button>
                    </div>

                    <!-- 카테고리 검색 -->
                    <div id="search-mode-category" class="search-mode-content hidden flex flex-col gap-2">
                        <!-- 선택창 행 -->
                        <div class="flex items-center gap-2 flex-wrap">
                            <div class="select-guide-wrap w-32">
                                <select id="sel-l1" class="notion-select w-32" onchange="onL1Change()" disabled><option value="">대분류 선택</option></select>
                                <div id="overlay-l1" class="select-guide-overlay hidden">대분류 선택</div>
                            </div>
                            <div class="select-guide-wrap w-32">
                                <select id="sel-l2" class="notion-select w-32" onchange="onL2Change()" disabled><option value="">중분류 선택</option></select>
                                <div id="overlay-l2" class="select-guide-overlay hidden">중분류 선택</div>
                            </div>
                            <div class="select-guide-wrap w-32">
                                <select id="sel-l3" class="notion-select w-32" onchange="onL3Change()" disabled><option value="">소분류 선택</option></select>
                                <div id="overlay-l3" class="select-guide-overlay hidden">소분류 선택</div>
                            </div>
                            <div class="select-guide-wrap w-32">
                                <select id="sel-l4" class="notion-select w-32" onchange="onL4Change()" disabled><option value="">색상 선택</option></select>
                                <div id="overlay-l4" class="select-guide-overlay hidden">색상 선택</div>
                            </div>
                            <div id="wrap-part-category" class="relative hidden flex-shrink-0 flex items-center gap-2">
                                <button id="btn-part-category" onclick="handlePartSelectClick('category')" class="btn-part-order">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                    <span class="jh-marq"><span>부속만 발주</span></span>
                                </button>
                                <div id="popover-part-category" class="part-confirm-popover hidden">
                                    <p class="text-[11px] font-bold text-[#37352f] mb-3">선택 부속만 발주?</p>
                                    <div class="flex items-center gap-2">
                                        <button onclick="confirmPartSelect('category')" class="flex-1 py-1.5 text-[11px] font-bold bg-[#37352f] text-white rounded-md hover:bg-black transition-all active:scale-95">확인</button>
                                        <button onclick="cancelPartSelect('category')" class="flex-1 py-1.5 text-[11px] font-bold bg-[#f7f6f3] text-[#787774] rounded-md hover:bg-[#efefec] transition-all active:scale-95 border border-[#ededeb]">취소</button>
                                    </div>
                                </div>
                                <div id="listpop-part-category" class="part-list-popover hidden"></div>
                                <div id="chip-part-category" class="hidden flex items-center gap-1">
                                    <span id="chip-label-category" class="part-selected-chip" onclick="openPartList('category')">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                        <span id="chip-text-category">부속선택</span>
                                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
                                    </span>
                                    <button onclick="clearPartSelect('category')" class="text-[10px] text-[#b0aeaa] hover:text-red-400 font-bold px-1 transition-colors" title="부속발주 해제">✕</button>
                                </div>
                            </div>
                            <input type="hidden" id="sel-part-name-category" value="">
                            <button id="btn-select-category" onclick="addOrderedProduct()" class="notion-card bg-blue-600 hover:bg-blue-700 text-white px-4 font-bold text-[11px] flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 h-[34px] hidden animate-pulse hover:shadow-lg cursor-pointer flex-shrink-0">세트발주</button>
                        </div>
                        <!-- 카테고리 선택 완료 후 단품명 표시 -->
                        <div id="category-result-name"></div>
                    </div>
                </div>
            `;

    /* 검색칸을 그 자리에 놓는다. 부른 <script> 의 부모(#filter-container)를 채운다 — 파싱 중에 바로 채워
       조혼가구 본 스크립트가 돌기 전에 요소가 다 있다(예전에 HTML 에 박혀 있던 것과 같은 때). */
    function 검색칸(자리, opt) {
        var 칸 = (자리 && 자리.tagName === 'SCRIPT') ? 자리.parentNode : 자리;
        칸.innerHTML = 검색칸글;
        if (opt && opt.발주 === false) {
            /* 발주 넣기 단추(세트발주·부속만 발주)와 그 값 칸을 뺀다 — 보기 전용 */
            칸.querySelectorAll('[id^="wrap-part-"],[id^="sel-part-name-"],[id^="btn-select-"]').forEach(function (e) { e.remove(); });
        }
        return 칸;
    }

    /* 조혼가구 renderOrderParts 의 부속카드 한 장 — 글자 그대로.
       o = { isAmt, deleteBtn, 부속명, plateName, finishColor, finish, w, d, cardKey, qty, actionsHtml, 원장당, 공정점 }
       원장당 = 재단 편집 기본규칙의 원장 1장당 생산량(shared/원장재단수량.js 원장당). 안 주면 안 그린다(영림원외주입력).
       공정점 = 부속별 필요공정 점 글(조혼가구 부속공정점글). 안 주면 안 그린다(영림원외주입력). */
    function 부속카드(o) {
        const isAmt = o.isAmt, deleteBtn = o.deleteBtn, plateName = o.plateName, finishColor = o.finishColor, finish = o.finish,
              w = o.w, d = o.d, cardKey = o.cardKey, actionsHtml = o.actionsHtml;
        // 기본발주에 포함될 때 AMT 외 공급처 구분 색상
        const cardBgClass = !isAmt ? 'bg-amber-50 border-amber-200' : 'bg-white border-[#ededeb]';
        const cardTextClass = !isAmt ? 'text-amber-700' : 'text-[#37352f]';
        return `
                    <div class="p-2 rounded-lg shadow-sm flex flex-col gap-1 relative group/card border ${cardBgClass}"${o.원장당 != null ? ` data-per-sheet="${o.원장당}"` : ''}>
                        ${deleteBtn}
                        <div class="flex justify-between items-start gap-1">
                            <div class="flex flex-col min-w-0 flex-1" style="word-break:break-all;overflow-wrap:anywhere">
                                <span class="text-[10px] font-bold ${cardTextClass}">${o.부속명}</span>
                                <span class="text-[9px] ${!isAmt ? 'text-amber-400' : 'text-gray-400'}">${plateName}${finishColor ? ` · ${finishColor}` : ''}</span>
                                <span class="text-[9px] ${!isAmt ? 'text-amber-400' : 'text-gray-400'}">${finish}</span>
                                <span class="text-[9px] ${!isAmt ? 'text-amber-600' : 'text-[#787774]'} font-medium">${w} X ${d}</span>
                                ${o.원장당 > 0 ? `<span class="text-[9px] ${!isAmt ? 'text-amber-400' : 'text-gray-400'}">원장당 ${o.원장당}개</span>` : ''}${o.공정점 || ''}
                            </div>
                            <div class="flex flex-col items-end gap-0.5 flex-shrink-0" onclick="event.stopPropagation()">
                                <input id="input-${cardKey}" type="number" value="${o.qty}" class="notion-input !w-10 !p-0 !text-[9px] !text-center font-black ${!isAmt ? 'text-amber-600 bg-amber-50' : 'text-blue-600 bg-blue-50'} border-none disabled:opacity-70" disabled>
                                ${actionsHtml}
                            </div>
                        </div>
                    </div>`;
    }

    /* 「AMT 외 공급처 부속」 카드 한 장 — 글자 그대로. o.단추 = 카드 끝 단추 글(없으면 '') */
    function 특별카드(o) {
        const plateName = o.plateName, finishColor = o.finishColor, finish = o.finish, w = o.w, d = o.d;
        return `<div class="bg-blue-50/30 p-2 rounded-lg border border-dashed border-blue-200 flex flex-col gap-1 relative group/special"${o.원장당 != null ? ` data-per-sheet="${o.원장당}"` : ''}><div class="flex flex-col min-w-0" style="word-break:break-all;overflow-wrap:anywhere"><span class="text-[10px] font-bold text-blue-800">${o.부속명}</span><span class="text-[9px] text-blue-300">${plateName}${finishColor ? ` · ${finishColor}` : ''}</span><span class="text-[9px] text-blue-300">${finish}</span><span class="text-[9px] text-blue-400 font-medium">${w} X ${d}</span>${o.원장당 > 0 ? `<span class="text-[9px] text-blue-300">원장당 ${o.원장당}개</span>` : ''}</div>${o.단추}</div>`;
    }

    /* 「기본 발주 부속」 + 「AMT 외 공급처 부속」 두 묶음 — 글자 그대로 */
    function 부속묶음(basicHtml, specialHtml) {
        return `<div class="space-y-2"><div class="text-[10px] font-bold text-[#787774] px-1 uppercase tracking-wider">기본 발주 부속</div><div class="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-1.5">${basicHtml || '<div class="col-span-full py-4 text-center text-gray-400 italic text-[11px]">없음</div>'}</div></div>${specialHtml ? `<div class="space-y-2 pt-4 border-t border-dashed border-[#ededeb]"><div class="text-[10px] font-bold text-blue-500 px-1 uppercase tracking-wider flex items-center gap-2">AMT 외 공급처 부속</div><div class="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-1.5">${specialHtml}</div></div>` : ''}`;
    }

    return { 검색칸글: 검색칸글, 검색칸: 검색칸, 부속카드: 부속카드, 특별카드: 특별카드, 부속묶음: 부속묶음 };
})();

/* ════ 아래는 조혼가구.html 에서 옮긴 검색칸 함수들 — 한 글자도 안 고쳤다(들여쓰기만 8칸 당김) ════ */

function resetSelect(id, p) { const el = document.getElementById(id); if (el) { el.innerHTML = `<option value="">${p}</option>`; el.disabled = true; } }

function onSupplierChange() {
    const supplier = getCurrentSupplier(); if (currentFullData.length < 2) return;
    const h = currentFullData[0];

    // ING단품명 목록 활성화
    const codes = [...new Set(currentFullData.slice(1).filter(r => normalizeValue(r[h.indexOf("ing발주처")]) === supplier).map(r => normalizeValue(r[0])))].sort();
    const codeSel = document.getElementById('sel-ing-code');
    if (codeSel) {
        codeSel.innerHTML = '<option value=""></option>' + codes.map(v => `<option value="${v}">${v}</option>`).join('');
        codeSel.disabled = false;
    }
    // 모바일 커스텀 드롭다운 초기화
    const ingLabel = document.getElementById('ing-custom-label');
    if (ingLabel) ingLabel.textContent = '';
    initIngCustomDropdown();

    // 대분류 목록 로드 (카테고리 탭 진입 시 initializeCategoryFilters에서도 재로드됨)
    const l1Opts = [...new Set(currentFullData.slice(1).filter(r => normalizeValue(r[h.indexOf("ing발주처")]) === supplier).map(r => normalizeValue(r[h.indexOf("대분류")])))].sort();
    const sel1 = document.getElementById('sel-l1');
    if (sel1) {
        sel1.innerHTML = '<option value="">대분류</option>' + l1Opts.map(v => `<option value="${v}">${v}</option>`).join('');
        sel1.disabled = false;
    }

    // 하위 선택창은 초기화 및 비활성화
    resetSelect('sel-l2', '중분류'); document.getElementById('sel-l2').disabled = true;
    resetSelect('sel-l3', '소분류'); document.getElementById('sel-l3').disabled = true;
    resetSelect('sel-l4', '색상');   document.getElementById('sel-l4').disabled = true;
    hidePartAll('category');
}

/* ── 모바일 ING 커스텀 드롭다운 ── */
function isMobile() { return window.innerWidth <= 767; }

function initIngCustomDropdown() {
    // 커스텀 드롭다운 요소가 없으면 건너뜀 (통합검색 구조로 대체됨)
    const wrap = document.getElementById('ing-custom-wrap');
    const sel = document.getElementById('sel-ing-code');
    if (!wrap || !sel) return;
    wrap.classList.remove('hidden');

    // 옵션 목록 동기화
    const list = document.getElementById('ing-custom-list');
    if (!list) return;
    list.innerHTML = '';
    Array.from(sel.options).forEach(opt => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = opt.text;
        btn.dataset.value = opt.value;
        if (opt.value === sel.value) btn.classList.add('selected');
        btn.onclick = () => selectIngCustom(opt.value, opt.text);
        list.appendChild(btn);
    });
}

function toggleIngCustomList() {
    const list = document.getElementById('ing-custom-list');
    if (!list) return;
    list.classList.toggle('hidden');
    // 다른 곳 클릭 시 닫기
    if (!list.classList.contains('hidden')) {
        setTimeout(() => {
            document.addEventListener('click', closeIngCustomList, { once: true });
        }, 0);
    }
}

function closeIngCustomList(e) {
    const wrap = document.getElementById('ing-custom-wrap');
    const list = document.getElementById('ing-custom-list');
    if (wrap && !wrap.contains(e.target) && list) {
        list.classList.add('hidden');
    }
}

function selectIngCustom(value, text) {
    // 네이티브 select 값 동기화 후 onCodeChange 호출
    const sel = document.getElementById('sel-ing-code');
    if (sel) sel.value = value;
    const customLabel = document.getElementById('ing-custom-label');
    if (customLabel) customLabel.textContent = text || '';
    const customList = document.getElementById('ing-custom-list');
    if (customList) customList.classList.add('hidden');
    // 선택 표시 업데이트
    document.querySelectorAll('#ing-custom-list button').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.value === value);
    });
    onCodeChange();
}

/* 텍스트 픽셀 너비 측정 (select 폰트 기준) */
function measureTextWidth(text) {
    const canvas = measureTextWidth._canvas || (measureTextWidth._canvas = document.createElement('canvas'));
    const ctx = canvas.getContext('2d');
    ctx.font = '600 13px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
    return ctx.measureText(text).width;
}

/* ING select 너비를 선택된 텍스트에 맞게 조정 */
function adjustIngSelectWidth(text) {
    const wrap = document.getElementById('ing-select-wrap');
    const sel  = document.getElementById('sel-ing-code');
    if (!wrap || !sel) return;
    if (!text) {
        wrap.style.width = '12rem';
        return;
    }
    // 텍스트 너비 + 좌우 패딩(24px) + 화살표 공간(28px) + 여유(8px)
    const px = Math.ceil(measureTextWidth(text)) + 60;
    const minPx = 192; // 12rem = 192px
    const finalPx = Math.max(px, minPx);
    wrap.style.width = finalPx + 'px';
}

function onCodeChange() {
    const supplier = getCurrentSupplier(), code = document.getElementById('sel-ing-code').value;
    const selIngCode = document.getElementById('sel-ing-code');

    if (!code) {
        // select 너비 원복
        adjustIngSelectWidth('');
        // 상품선택 버튼 숨기기
        const btnSelectIng = document.getElementById('btn-select-ing');
        if (btnSelectIng) btnSelectIng.classList.add('hidden');
        // 부속발주 전체 초기화
        hidePartAll('ing');
        return;
    }

    // 선택된 option 텍스트로 너비 조정
    const selectedOpt = selIngCode.options[selIngCode.selectedIndex];
    if (selectedOpt) adjustIngSelectWidth(selectedOpt.text);

    const h = currentFullData[0], row = currentFullData.slice(1).find(r => normalizeValue(r[h.indexOf("ing발주처")]) === supplier && normalizeValue(r[0]) === code);
    if (row) {
        // 상품선택 버튼 등장 (애니메이션)
        const btnSelectIng = document.getElementById('btn-select-ing');
        if (btnSelectIng) {
            btnSelectIng.classList.remove('hidden');
            btnSelectIng.classList.remove('btn-select-appear');
            void btnSelectIng.offsetWidth;
            btnSelectIng.classList.add('btn-select-appear');
        }

        // 부속명 옵션 업데이트 + 버튼 표시
        updatePartNameOptionsByCode('ing', code);
    }
}

function onL1Change() {
    const supplier = getCurrentSupplier(), code = '', l1 = document.getElementById('sel-l1').value;
    if (!l1) {
        resetSelect('sel-l2', '중분류 선택');
        document.getElementById('sel-l2').disabled = true;
        resetSelect('sel-l3', '소분류 선택');
        document.getElementById('sel-l3').disabled = true;
        resetSelect('sel-l4', '색상 선택');
        document.getElementById('sel-l4').disabled = true;
        hidePartAll('category');
        updateCategoryGuide();
        return;
    }
    const h = currentFullData[0], filtered = currentFullData.slice(1).filter(r => normalizeValue(r[h.indexOf("ing발주처")]) === supplier && (code ? normalizeValue(r[0]) === code : true) && normalizeValue(r[h.indexOf("대분류")]) === l1);
    const vals = [...new Set(filtered.map(r => normalizeValue(r[h.indexOf("중분류")])))].sort();
    const sel = document.getElementById('sel-l2');
    sel.innerHTML = '<option value="">중분류 선택</option>' + vals.map(v => `<option value="${v}">${v}</option>`).join('');
    sel.disabled = false;
    resetSelect('sel-l3', '소분류 선택');
    document.getElementById('sel-l3').disabled = true;
    resetSelect('sel-l4', '색상 선택');
    document.getElementById('sel-l4').disabled = true;
    hidePartAll('category');
    updateCategoryGuide();
    // 리스트가 1개면 자동 선택
    if (vals.length === 1) {
        sel.value = vals[0];
        onL2Change();
    }
}
function onL2Change() {
    const supplier = getCurrentSupplier(), code = '', l1 = document.getElementById('sel-l1').value, l2 = document.getElementById('sel-l2').value;
    if (!l2) {
        resetSelect('sel-l3', '소분류 선택');
        document.getElementById('sel-l3').disabled = true;
        resetSelect('sel-l4', '색상 선택');
        document.getElementById('sel-l4').disabled = true;
        hidePartAll('category');
        updateCategoryGuide();
        return;
    }
    const h = currentFullData[0], filtered = currentFullData.slice(1).filter(r => normalizeValue(r[h.indexOf("ing발주처")]) === supplier && (code ? normalizeValue(r[0]) === code : true) && normalizeValue(r[h.indexOf("대분류")]) === l1 && normalizeValue(r[h.indexOf("중분류")]) === l2);
    const vals = [...new Set(filtered.map(r => normalizeValue(r[h.indexOf("소분류")])))].sort();
    const sel = document.getElementById('sel-l3');
    sel.innerHTML = '<option value="">소분류 선택</option>' + vals.map(v => `<option value="${v}">${v}</option>`).join('');
    sel.disabled = false;
    resetSelect('sel-l4', '색상 선택');
    document.getElementById('sel-l4').disabled = true;
    hidePartAll('category');
    updateCategoryGuide();
    // 리스트가 1개면 자동 선택
    if (vals.length === 1) {
        sel.value = vals[0];
        onL3Change();
    }
}
function onL3Change() {
    const supplier = getCurrentSupplier(), code = '', l1 = document.getElementById('sel-l1').value, l2 = document.getElementById('sel-l2').value, l3 = document.getElementById('sel-l3').value;
    if (!l3) {
        resetSelect('sel-l4', '색상 선택');
        document.getElementById('sel-l4').disabled = true;
        hidePartAll('category');
        updateCategoryGuide();
        return;
    }
    const h = currentFullData[0], filtered = currentFullData.slice(1).filter(r => normalizeValue(r[h.indexOf("ing발주처")]) === supplier && (code ? normalizeValue(r[0]) === code : true) && normalizeValue(r[h.indexOf("대분류")]) === l1 && normalizeValue(r[h.indexOf("중분류")]) === l2 && normalizeValue(r[h.indexOf("소분류")]) === l3);
    const vals = [...new Set(filtered.map(r => normalizeValue(r[h.indexOf("상품색상")])))].sort();
    const sel = document.getElementById('sel-l4');
    sel.innerHTML = '<option value="">색상 선택</option>' + vals.map(v => `<option value="${v}">${v}</option>`).join('');
    sel.disabled = false;
    hidePartAll('category');
    updateCategoryGuide();
    // 리스트가 1개면 자동 선택
    if (vals.length === 1) {
        sel.value = vals[0];
        onL4Change();
    }
}
function onL4Change() {
    const l4 = document.getElementById('sel-l4').value;
    const resultEl = document.getElementById('category-result-name');
    if (!l4) {
        hidePartAll('category');
        updateCategoryGuide();
        const btnCat = document.getElementById('btn-select-category');
        if (btnCat) btnCat.classList.add('hidden');
        if (resultEl) { resultEl.style.display = 'none'; resultEl.textContent = ''; }
        return;
    }
    updateCategoryGuide(); // 모든 overlay 숨김, 완료 표시

    // 카테고리로 매칭된 단품명(ING코드) 찾아서 표시
    const supplier = getCurrentSupplier();
    const h = currentFullData[0];
    const l1 = document.getElementById('sel-l1').value;
    const l2 = document.getElementById('sel-l2').value;
    const l3 = document.getElementById('sel-l3').value;
    const matchedRows = currentFullData.slice(1).filter(r =>
        normalizeValue(r[h.indexOf("ing발주처")]) === supplier &&
        normalizeValue(r[h.indexOf("대분류")]) === l1 &&
        normalizeValue(r[h.indexOf("중분류")]) === l2 &&
        normalizeValue(r[h.indexOf("소분류")]) === l3 &&
        normalizeValue(r[h.indexOf("상품색상")]) === l4
    );
    if (resultEl) {
        if (matchedRows.length > 0) {
            const code = normalizeValue(matchedRows[0][0]); // ING단품명(코드)
            resultEl.textContent = code;
            resultEl.style.display = 'block';
            // 애니메이션 재실행
            resultEl.style.animation = 'none';
            void resultEl.offsetWidth;
            resultEl.style.animation = '';
        } else {
            resultEl.style.display = 'none';
        }
    }

    // 상품선택 버튼 등장 (애니메이션)
    const btnCat = document.getElementById('btn-select-category');
    if (btnCat) {
        btnCat.classList.remove('hidden');
        btnCat.classList.remove('btn-select-appear');
        void btnCat.offsetWidth;
        btnCat.classList.add('btn-select-appear');
    }
    // 부속명 옵션 로드
    updatePartNameOptionsCategory();
}

// 카테고리 전체 초기화 (대분류만 활성화, 하위는 모두 초기화+비활성화)
function resetCategorySelects() {
    resetSelect('sel-l2', '중분류'); document.getElementById('sel-l2').disabled = true;
    resetSelect('sel-l3', '소분류'); document.getElementById('sel-l3').disabled = true;
    resetSelect('sel-l4', '색상');   document.getElementById('sel-l4').disabled = true;
    hidePartAll('category');
}

/* ── 검색창 제어 ── */
function resetSearchLabel() {
    document.getElementById('search-method-label').textContent = '검색 방법 선택';
    document.querySelectorAll('.search-mode-content').forEach(c => c.classList.add('hidden'));
    const ingCode = document.getElementById('sel-ing-code');
    if (ingCode) ingCode.value = '';
    const productSearch = document.getElementById('product-search');
    if (productSearch) productSearch.value = '';
    ['btn-select-ing', 'btn-select-direct', 'btn-select-category'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.add('hidden');
    });
    hidePartAll('ing');
    hidePartAll('direct');
    hidePartAll('category');
}

function selectSearchMethod(mode, label) {
    const lb = document.getElementById('search-method-label');
    if (lb) lb.textContent = label;
    document.querySelectorAll('.method-chip').forEach(c =>
        c.classList.toggle('on', c.dataset.mode === mode));
    document.querySelectorAll('.search-mode-content').forEach(content => {
        content.classList.add('hidden');
    });
    const selectedMode = document.getElementById(`search-mode-${mode}`);
    if (selectedMode) selectedMode.classList.remove('hidden');
    hidePartAll('direct');
    hidePartAll('ing');
    hidePartAll('category');
    const sel1 = document.getElementById('sel-l1');
    sel1.value = '';
    resetCategorySelects();
    if (mode === 'category') initializeCategoryFilters();
    if (window.dropdownController) window.dropdownController.closeAll();

    // 검색방법 선택 시 튜토리얼 닫기
    dismissTutorial();

    // 입력 유도 처리
    activateSearchGuide(mode);
}

/* ── 입력 유도 ── */
function showOverlay(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
}
function hideOverlay(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
}

/* 직접입력 placeholder 타이핑 애니메이션 */
let _typingTimers = [];
function clearTyping() {
    _typingTimers.forEach(t => clearTimeout(t));
    _typingTimers = [];
}
function typePlaceholder(inp, msg) {
    clearTyping();
    if (!inp) return;
    inp.placeholder = '';
    let i = 0;
    const tick = () => {
        if (inp.value) { inp.placeholder = msg; return; } // 실제 입력 시작하면 중단
        inp.placeholder = msg.slice(0, i) + (i < msg.length ? '|' : '');
        if (i < msg.length) {
            i++;
            _typingTimers.push(setTimeout(tick, 65));
        } else {
            // 완료 후 커서 깜빡임
            let blink = true;
            const blinkId = setInterval(() => {
                if (inp.value) { clearInterval(blinkId); inp.placeholder = msg; return; }
                inp.placeholder = blink ? msg + '|' : msg;
                blink = !blink;
            }, 500);
            _typingTimers.push(blinkId);
        }
    };
    tick();
}

/* 입력 유도 핵심 함수 */
function activateSearchGuide(mode) {
    clearTyping();
    // 모든 overlay 숨김
    ['overlay-ing','overlay-l1','overlay-l2','overlay-l3','overlay-l4'].forEach(hideOverlay);
    // 카테고리 dim/done/inline-style 초기화
    ['sel-l1','sel-l2','sel-l3','sel-l4'].forEach(id => {
        const s = document.getElementById(id);
        if (s) { s.classList.remove('cat-select-done','cat-select-dim'); s.style.opacity = ''; s.style.pointerEvents = ''; }
    });
    // 카테고리 결과 숨김
    const resultEl = document.getElementById('category-result-name');
    if (resultEl) { resultEl.style.display = 'none'; resultEl.textContent = ''; }

    if (mode === 'direct') {
        const inp = document.getElementById('product-search');
        if (inp) {
            inp.focus();
            typePlaceholder(inp, '상품명');
            // 실제 타이핑 시작하면 애니메이션 중단
            const onInput = () => { clearTyping(); inp.placeholder = '상품명'; inp.removeEventListener('input', onInput); };
            inp.addEventListener('input', onInput);
        }

    } else if (mode === 'ing') {
        // overlay 깜빡임 표시, 선택 시 숨김
        showOverlay('overlay-ing');
        const sel = document.getElementById('sel-ing-code');
        if (sel) {
            const onChange = () => {
                hideOverlay('overlay-ing');
                sel.removeEventListener('change', onChange);
            };
            sel.addEventListener('change', onChange);
        }

    } else if (mode === 'category') {
        updateCategoryGuide();
    }
}

/* 카테고리 단계별 overlay 깜빡임 업데이트 */
function updateCategoryGuide() {
    const ids  = ['sel-l1','sel-l2','sel-l3','sel-l4'];
    const oIds = ['overlay-l1','overlay-l2','overlay-l3','overlay-l4'];
    const selects = ids.map(id => document.getElementById(id));

    // 완료 단계 파악
    let nextStep = 0;
    for (let i = 0; i < selects.length; i++) {
        if (selects[i] && selects[i].value) nextStep = i + 1;
        else break;
    }

    selects.forEach((sel, i) => {
        if (!sel) return;
        sel.classList.remove('cat-select-done','cat-select-dim');
        sel.style.opacity = '';
        sel.style.pointerEvents = '';
        hideOverlay(oIds[i]);

        if (i < nextStep) {
            sel.classList.add('cat-select-done');       // 선택 완료 - 연한 배경
        } else if (i === nextStep) {
            // 현재 선택할 항목: select 투명(클릭 가능), overlay 깜빡임
            sel.style.opacity = '0';
            sel.style.pointerEvents = 'auto';
            showOverlay(oIds[i]);
        } else {
            sel.classList.add('cat-select-dim');        // 아직 비활성
        }
    });
}

function switchSearchTab(mode) {
    const labelMap = { ing: 'ING단품명', direct: '상품검색(직접입력)', category: '카테고리' };
    selectSearchMethod(mode, labelMap[mode] || mode);
}

function initializeCategoryFilters() {
    const supplier = getCurrentSupplier();
    if (!supplier || currentFullData.length < 2) return;
    const h = currentFullData[0];
    const l1Opts = [...new Set(currentFullData.slice(1).filter(r => normalizeValue(r[h.indexOf("ing발주처")]) === supplier).map(r => normalizeValue(r[h.indexOf("대분류")])))].sort();
    const sel1 = document.getElementById('sel-l1');
    sel1.innerHTML = '<option value="">대분류 선택</option>' + l1Opts.map(v => `<option value="${v}">${v}</option>`).join('');
    sel1.disabled = false;
    resetCategorySelects();
}

// ── 부속발주 커스텀 드롭다운 데이터 저장소 ──
const partListData = { direct: [], ing: [], category: [] };

// 카테고리 검색용 부속명 옵션 로드
function updatePartNameOptionsCategory() {
    const supplier = getCurrentSupplier();
    const l1 = document.getElementById('sel-l1').value;
    const l2 = document.getElementById('sel-l2').value;
    const l3 = document.getElementById('sel-l3').value;
    const l4 = document.getElementById('sel-l4').value;
    if (!l1 || !l2 || !l3 || !l4) return;
    const h = currentFullData[0];
    const filtered = currentFullData.slice(1).filter(r =>
        normalizeValue(r[h.indexOf("ing발주처")]) === supplier &&
        normalizeValue(r[h.indexOf("대분류")]) === l1 &&
        normalizeValue(r[h.indexOf("중분류")]) === l2 &&
        normalizeValue(r[h.indexOf("소분류")]) === l3 &&
        normalizeValue(r[h.indexOf("상품색상")]) === l4
    );
    partListData['category'] = [...new Set(filtered.map(r => normalizeValue(r[h.indexOf("부속명")])).filter(v => v))].sort();
    showPartBtn('category');
}

// 직접입력/ING 검색용 부속명 옵션 로드
function updatePartNameOptionsByCode(mode, code) {
    if (!code || currentFullData.length < 2) return;
    const supplier = getCurrentSupplier();
    if (!supplier) return;
    const h = currentFullData[0];
    const filtered = currentFullData.slice(1).filter(r =>
        normalizeValue(r[h.indexOf("ing발주처")]) === supplier &&
        normalizeValue(r[0]) === code
    );
    partListData[mode] = [...new Set(filtered.map(r => normalizeValue(r[h.indexOf("부속명")])).filter(v => v))].sort();
    showPartBtn(mode);
}

// 하위 호환 래퍼
function updatePartNameOptions(mode) {
    if (mode === 'category') updatePartNameOptionsCategory();
}

let searchResultsData = [];
let selectedSearchIndex = -1;

// ── wrap 표시 (버튼 상태로, 팝오버/목록/칩 모두 숨김) ──
function showPartBtn(mode) {
    const wrap = document.getElementById(`wrap-part-${mode}`);
    const pop  = document.getElementById(`popover-part-${mode}`);
    const lp   = document.getElementById(`listpop-part-${mode}`);
    const chip = document.getElementById(`chip-part-${mode}`);
    const btn  = document.getElementById(`btn-part-${mode}`);
    if (wrap) wrap.classList.remove('hidden');
    if (pop)  pop.classList.add('hidden');
    if (lp)   lp.classList.add('hidden');
    if (chip) chip.classList.add('hidden');
    if (btn)  btn.classList.remove('hidden');
}

// ── 전체 초기화 ──
function hidePartAll(mode) {
    const wrap = document.getElementById(`wrap-part-${mode}`);
    const inp  = document.getElementById(`sel-part-name-${mode}`);
    const pop  = document.getElementById(`popover-part-${mode}`);
    const lp   = document.getElementById(`listpop-part-${mode}`);
    const chip = document.getElementById(`chip-part-${mode}`);
    if (wrap) wrap.classList.add('hidden');
    if (inp)  inp.value = '';
    if (pop)  pop.classList.add('hidden');
    if (lp)   lp.classList.add('hidden');
    if (chip) chip.classList.add('hidden');
    partListData[mode] = [];
}

// ── 버튼 클릭 → 확인 팝오버 토글 ──
function handlePartSelectClick(mode) {
    const pop = document.getElementById(`popover-part-${mode}`);
    if (!pop) return;
    // 다른 모든 팝오버/목록 닫기
    ['direct','ing','category'].forEach(m => {
        if (m !== mode) {
            document.getElementById(`popover-part-${m}`)?.classList.add('hidden');
            document.getElementById(`listpop-part-${m}`)?.classList.add('hidden');
        }
    });
    pop.classList.toggle('hidden');
}

// ── 확인 클릭 → 커스텀 목록 팝오버 즉시 열기 ──
function confirmPartSelect(mode) {
    document.getElementById(`popover-part-${mode}`)?.classList.add('hidden');
    openPartList(mode);
}

// ── 커스텀 목록 팝오버 열기/렌더링 ──
function openPartList(mode) {
    // 다른 목록 모두 닫기
    ['direct','ing','category'].forEach(m => {
        if (m !== mode) {
            document.getElementById(`listpop-part-${m}`)?.classList.add('hidden');
            document.getElementById(`popover-part-${m}`)?.classList.add('hidden');
        }
    });
    const lp = document.getElementById(`listpop-part-${mode}`);
    const currentVal = document.getElementById(`sel-part-name-${mode}`)?.value || '';
    const items = partListData[mode] || [];

    lp.innerHTML = `<div class="part-list-header">부속 선택</div>` +
        `<button class="part-list-item${currentVal === '' ? ' selected' : ''}" data-part-name="">전체 부속 발주</button>` +
        items.map((v, idx) =>
            `<button class="part-list-item${currentVal === v ? ' selected' : ''}" data-part-name="${v}">
                ${currentVal === v ? '✓ ' : ''}${v}
            </button>`
        ).join('');

    // 버튼들에 이벤트 리스너 추가
    lp.querySelectorAll('button.part-list-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const partName = btn.getAttribute('data-part-name');
            selectPartItem(mode, partName);
        });
    });
    lp.classList.remove('hidden');
}

// ── 목록 아이템 선택 ──
function selectPartItem(mode, val) {
    const inp  = document.getElementById(`sel-part-name-${mode}`);
    const lp   = document.getElementById(`listpop-part-${mode}`);
    const chip = document.getElementById(`chip-part-${mode}`);
    const chipText = document.getElementById(`chip-text-${mode}`);
    const btn  = document.getElementById(`btn-part-${mode}`);
    if (inp) inp.value = val;
    if (lp)  lp.classList.add('hidden');
    // 칩 표시
    if (chipText) chipText.textContent = val || '전체 부속';
    if (chip) chip.classList.remove('hidden');
    if (btn)  btn.classList.add('hidden');
}

// ── 부속발주 칩 ✕ 클릭 → 버튼 상태로 복귀 ──
function clearPartSelect(mode) {
    const inp  = document.getElementById(`sel-part-name-${mode}`);
    const chip = document.getElementById(`chip-part-${mode}`);
    const btn  = document.getElementById(`btn-part-${mode}`);
    if (inp)  inp.value = '';
    if (chip) chip.classList.add('hidden');
    if (btn)  btn.classList.remove('hidden');
}

// ── 팝오버 "취소" 클릭 ──
function cancelPartSelect(mode) {
    document.getElementById(`popover-part-${mode}`)?.classList.add('hidden');
}

function handleSearch(query) {
    const resultsBox = document.getElementById('search-results');
    if (!query.trim()) {
        resultsBox.classList.add('hidden');
        searchResultsData = [];
        selectedSearchIndex = -1;
        return;
    }
    const supplier = getCurrentSupplier(), h = currentFullData[0];
    const filteredData = currentFullData.slice(1).filter(r => {
        const name = buildDisplayName(normalizeValue(r[h.indexOf("대분류")]), normalizeValue(r[h.indexOf("중분류")]), normalizeValue(r[h.indexOf("소분류")]), normalizeValue(r[h.indexOf("상품색상")]));
        return name.toLowerCase().includes(query.toLowerCase()) && normalizeValue(r[h.indexOf("ing발주처")]) === supplier;
    });
    if (filteredData.length > 0) {
        const uniqueResults = [], seenKeys = new Set();
        filteredData.forEach(r => {
            const key = `${r[0]}|${r[h.indexOf("대분류")]}|${r[h.indexOf("중분류")]}|${r[h.indexOf("소분류")]}|${r[h.indexOf("상품색상")]}`;
            if (!seenKeys.has(key)) { seenKeys.add(key); uniqueResults.push({ code: r[0], v1: r[h.indexOf("대분류")], v2: r[h.indexOf("중분류")], v3: r[h.indexOf("소분류")], v4: r[h.indexOf("상품색상")] }); }
        });
        searchResultsData = uniqueResults;
        selectedSearchIndex = -1;
        renderSearchResults();
        resultsBox.classList.remove('hidden');
    } else {
        resultsBox.classList.add('hidden');
        searchResultsData = [];
        selectedSearchIndex = -1;
    }
}

function renderSearchResults() {
    const resultsBox = document.getElementById('search-results');
    resultsBox.innerHTML = searchResultsData.map((id, index) =>
        `<div class="search-result-item p-2 hover:bg-gray-100 cursor-pointer text-[12px] border-b last:border-none ${index === selectedSearchIndex ? 'bg-blue-100' : ''}"
              onclick="selectSearchResult('${id.code}', '${id.v1}', '${id.v2}', '${id.v3}', '${id.v4}')"
              data-index="${index}">${id.code}</div>`
    ).join('');
}

function handleSearchKeydown(e) {
    const resultsBox = document.getElementById('search-results');
    if (resultsBox.classList.contains('hidden') || searchResultsData.length === 0) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedSearchIndex = Math.min(selectedSearchIndex + 1, searchResultsData.length - 1);
        renderSearchResults();
        scrollToSelectedResult();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedSearchIndex = Math.max(selectedSearchIndex - 1, -1);
        renderSearchResults();
        scrollToSelectedResult();
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedSearchIndex >= 0 && selectedSearchIndex < searchResultsData.length) {
            const selected = searchResultsData[selectedSearchIndex];
            selectSearchResult(selected.code, selected.v1, selected.v2, selected.v3, selected.v4);
        }
    } else if (e.key === 'Escape') {
        resultsBox.classList.add('hidden');
        searchResultsData = [];
        selectedSearchIndex = -1;
    }
}

function scrollToSelectedResult() {
    if (selectedSearchIndex >= 0) {
        const resultsBox = document.getElementById('search-results');
        const selectedItem = resultsBox.querySelector(`[data-index="${selectedSearchIndex}"]`);
        if (selectedItem) {
            selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }
}

function selectSearchResult(code, v1, v2, v3, v4) {
    const productSearch = document.getElementById('product-search');
    if (productSearch) {
        clearTyping();
        productSearch.value = code;
        productSearch.placeholder = '상품명';
    }

    const sr = document.getElementById('search-results');
    if (sr) sr.classList.add('hidden');
    searchResultsData = [];
    selectedSearchIndex = -1;

    // 상품선택 버튼 등장 (애니메이션)
    const btnDirect = document.getElementById('btn-select-direct');
    if (btnDirect) {
        btnDirect.classList.remove('hidden');
        btnDirect.classList.remove('btn-select-appear');
        void btnDirect.offsetWidth;
        btnDirect.classList.add('btn-select-appear');
    }

    // 부속명 옵션 업데이트 + 버튼 표시
    updatePartNameOptionsByCode('direct', code);
}

// 검색 방법을 골랐는가 — 검색칸 하나라도 열려 있으면 골랐다고 본다.
// 거래처를 바꿔 resetSearchLabel() 이 다시 감추면 저절로 도로 켜진다.
function johonPickTick(){
    const 열림 = [...document.querySelectorAll('.search-mode-content')]
        .some(el => !el.classList.contains('hidden'));
    const de = document.documentElement;
    if (열림) de.setAttribute('data-johonpicked', '1');
    else de.removeAttribute('data-johonpicked');
}

