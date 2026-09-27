// 1. FAQ 데이터 트리 정의
const faqTree = {
  start: {
    title: "홈",
    question: "원하시는 안내 카테고리를 선택해 주세요",
    options: [
      { text: "시험 접수 및 변경/환불", next: "registration" },
      { text: "시험 당일 준비물 및 신분증 규정", next: "supplies" },
      { text: "증명서 발급 및 결과 확인", next: "certificate" }
    ]
  },
  registration: {
    title: "접수/환불",
    question: "시험 접수 관련 어떤 내용이 궁금하신가요?",
    options: [
      { text: "정기 접수 기간 이후 추가 접수가 가능한가요?", answer: "정기 접수 기간이 마감된 이후에는 원칙적으로 추가 접수가 불가능합니다. 차회 시험 일정을 확인해 주시기 바랍니다." },
      { text: "시험 취소 및 환불 기준이 어떻게 되나요?", answer: "시험 시행 8일 전까지 취소 시 100% 환불 가능합니다. 이후 시행 4일 전까지는 50%가 환불되며, 이후에는 취소가 불가능합니다." }
    ]
  },
  supplies: {
    title: "준비물/규정",
    question: "준비물 및 시험장 입실 규정 안내입니다.",
    options: [
      { text: "모든 시험은 신분증 확인 후 진행하나요?", answer: "네, 모든 시험은 본인 확인 절차가 필수이며, 규정된 실물 신분증 확인 후 진행됩니다. (모바일 신분증은 정부24 등 공식 앱만 인정)" },
      { text: "수험표를 반드시 출력해 가야 하나요?", answer: "수험번호 확인을 위해 출력을 권장하지만, 모바일 앱 내 수험표 화면 제시로도 대체 가능합니다." }
    ]
  },
  certificate: {
    title: "증명서/결과",
    question: "합격 발표 및 증명서 발급 안내입니다.",
    options: [
      { text: "성적표/합격증명서 발급 방법은 무엇인가요?", answer: "마이페이지 > 증명서 발급 메뉴에서 PDF 저장 및 즉시 출력이 가능하며 별도 수수료는 없습니다." }
    ]
  }
};

// 2. 상태 관리 변수
let historyStack = ["start"];
let isDarkMode = false;

// 3. DOM 요소 캐싱
const questionEl = document.getElementById("step-question");
const optionsEl = document.getElementById("options-list");
const answerCard = document.getElementById("answer-container");
const answerContent = document.getElementById("answer-content");
const breadcrumbEl = document.getElementById("breadcrumb");
const resetBtn = document.getElementById("reset-btn");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
const themeToggle = document.getElementById("theme-toggle");
const copyBtn = document.getElementById("copy-btn");
const toast = document.getElementById("toast");

// 4. 특정 단계 렌더링 함수
function renderStep(stepKey) {
  const currentData = faqTree[stepKey];
  if (!currentData) return;

  // 검색창 초기화 및 UI 전환
  searchResults.classList.add("hidden");
  optionsEl.classList.remove("hidden");
  answerCard.classList.add("hidden");

  questionEl.textContent = currentData.question;
  optionsEl.innerHTML = "";

  // 선택지 버튼 생성
  currentData.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerHTML = `
      <span>${opt.text}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    `;

    btn.onclick = () => {
      if (opt.next) {
        historyStack.push(opt.next);
        renderStep(opt.next);
      } else if (opt.answer) {
        showAnswer(opt.text, opt.answer);
      }
    };
    optionsEl.appendChild(btn);
  });

  updateBreadcrumb();
  updateResetButton();
}

// 5. 최종 답변 출력
function showAnswer(title, answer) {
  optionsEl.classList.add("hidden");
  questionEl.textContent = title;
  answerContent.textContent = answer;
  answerCard.classList.remove("hidden");
  updateResetButton();
}

// 6. 탐색 경로(Breadcrumb) 업데이트
function updateBreadcrumb() {
  breadcrumbEl.innerHTML = "";
  historyStack.forEach((stepKey, idx) => {
    const item = document.createElement("span");
    item.className = "crumb-item";
    item.textContent = faqTree[stepKey].title;
    item.onclick = () => {
      historyStack = historyStack.slice(0, idx + 1);
      renderStep(stepKey);
    };
    breadcrumbEl.appendChild(item);

    if (idx < historyStack.length - 1) {
      const arrow = document.createElement("span");
      arrow.textContent = " > ";
      breadcrumbEl.appendChild(arrow);
    }
  });
}

// 7. 리셋 버튼 활성화 여부
function updateResetButton() {
  if (historyStack.length > 1 || !answerCard.classList.contains("hidden")) {
    resetBtn.classList.remove("hidden");
  } else {
    resetBtn.classList.add("hidden");
  }
}

// 8. 키워드 실시간 검색
searchInput.addEventListener("input", (e) => {
  const query = e.target.value.trim().toLowerCase();

  if (query === "") {
    renderStep(historyStack[historyStack.length - 1]);
    return;
  }

  // 검색 진행 시 화면 초기화
  optionsEl.classList.add("hidden");
  answerCard.classList.add("hidden");
  searchResults.classList.remove("hidden");
  questionEl.textContent = `'${query}' 검색 결과`;
  searchResults.innerHTML = "";

  let matchCount = 0;

  // 전체 faqTree 탐색
  Object.values(faqTree).forEach(category => {
    category.options.forEach(opt => {
      if (opt.answer && (opt.text.toLowerCase().includes(query) || opt.answer.toLowerCase().includes(query))) {
        matchCount++;
        const item = document.createElement("div");
        item.className = "search-item";
        
        // 키워드 하이라이팅
        const highlightedQ = highlightText(opt.text, query);
        const highlightedA = highlightText(opt.answer, query);

        item.innerHTML = `
          <div class="search-item-q">Q. ${highlightedQ}</div>
          <div class="search-item-a">${highlightedA}</div>
        `;
        searchResults.appendChild(item);
      }
    });
  });

  if (matchCount === 0) {
    searchResults.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 20px;">검색 결과가 없습니다.</div>`;
  }
});

// 하이라이팅 유틸리티
function highlightText(text, query) {
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

// 9. 리셋 및 기타 이벤트
resetBtn.onclick = () => {
  historyStack = ["start"];
  searchInput.value = "";
  renderStep("start");
};

// 답변 복사
copyBtn.onclick = () => {
  const textToCopy = `${questionEl.textContent}\n\n${answerContent.textContent}`;
  navigator.clipboard.writeText(textToCopy).then(() => {
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 2000);
  });
};

// 피드백
function handleFeedback(isPositive) {
  alert(isPositive ? "피드백 감사합니다! 👍" : "개선할 수 있도록 노력하겠습니다. 👎");
}

// 다크모드 토글
themeToggle.onclick = () => {
  isDarkMode = !isDarkMode;
  document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light");
};

// 초기 렌더링 실행
renderStep("start");