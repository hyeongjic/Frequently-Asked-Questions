<script setup>
import { computed, ref, watch } from "vue";
import { faqTree } from "./faq_tree.js";
import FaqHeader from "./components/FaqHeader.vue";
import FaqNavigation from "./components/FaqNavigation.vue";
import FaqQuestionContent from "./components/FaqQuestionContent.vue";

const historyStack = ref(["start"]);
const activeStep = computed(() => historyStack.value.at(-1));
const activeAnswer = ref(null);
const query = ref("");
const isDarkMode = ref(false);
const notice = ref("");
const currentData = computed(() => faqTree[activeStep.value]);
const searchResults = computed(() => {
  const term = query.value.trim().toLocaleLowerCase();
  if (!term) return [];

  return Object.entries(faqTree).flatMap(([stepKey, category]) =>
    category.options
      .filter((option) =>
        option.answer &&
        `${option.text} ${option.answer}`.toLocaleLowerCase().includes(term)
      )
      .map((option) => ({ ...option, stepKey }))
  );
});

const questionTitle = computed(() => {
  if (query.value.trim()) return `'${query.value.trim()}' 검색 결과`;
  return activeAnswer.value?.title ?? currentData.value.question;
});

watch(isDarkMode, (dark) => {
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}, { immediate: true });

watch(query, () => {
  if (query.value.trim()) activeAnswer.value = null;
});

function selectOption(option) {
  if (option.next) {
    historyStack.value = [...historyStack.value, option.next];
    activeAnswer.value = null;
    query.value = "";
    return;
  }

  if (option.answer) {
    activeAnswer.value = {
      title: option.text,
      text: option.answer,
      images: option.images ?? []
    };
  }
}

function selectSearchResult(result) {
  historyStack.value = ["start", result.stepKey];
  activeAnswer.value = {
    title: result.text,
    text: result.answer,
    images: result.images ?? []
  };
  query.value = "";
}

function goToStep(index) {
  historyStack.value = historyStack.value.slice(0, index + 1);
  activeAnswer.value = null;
  query.value = "";
}

function reset() {
  historyStack.value = ["start"];
  activeAnswer.value = null;
  query.value = "";
}

async function copyAnswer() {
  if (!activeAnswer.value) return;
  try {
    await navigator.clipboard.writeText(`${activeAnswer.value.title}\n\n${activeAnswer.value.text}`);
    showNotice("답변을 클립보드에 복사했습니다.");
  } catch {
    showNotice("클립보드에 복사하지 못했습니다.");
  }
}

function sendFeedback(isPositive) {
  showNotice(isPositive ? "도움이 되었다니 다행이에요." : "의견을 반영해 더 나은 안내를 준비할게요.");
}

function showNotice(message) {
  notice.value = message;
  window.setTimeout(() => {
    if (notice.value === message) notice.value = "";
  }, 2200);
}

</script>

<template>
  <main class="min-h-screen bg-[var(--page-bg)] px-4 py-8 text-[var(--ink)] transition-colors sm:px-8 sm:py-12">
    <div class="mx-auto max-w-3xl">
      <FaqHeader :is-dark-mode="isDarkMode" @toggle-theme="isDarkMode = !isDarkMode" />

      <section class="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_18px_60px_-34px_rgba(23,43,38,0.35)]">
        <FaqNavigation v-model:query="query" :history-stack="historyStack" :faq-tree="faqTree" @select-step="goToStep" />
        <FaqQuestionContent
          :current-data="currentData"
          :active-answer="activeAnswer"
          :question-title="questionTitle"
          :query="query"
          :search-results="searchResults"
          :faq-tree="faqTree"
          :can-reset="historyStack.length > 1 || Boolean(activeAnswer)"
          @select-option="selectOption"
          @select-search-result="selectSearchResult"
          @copy-answer="copyAnswer"
          @feedback="sendFeedback"
          @reset="reset"
        />
      </section>

      <Transition enter-active-class="transition duration-200" enter-from-class="translate-y-2 opacity-0" enter-to-class="translate-y-0 opacity-100" leave-active-class="transition duration-150" leave-to-class="opacity-0">
        <div v-if="notice" class="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-lg bg-[var(--ink)] px-4 py-3 text-sm font-medium text-[var(--surface)] shadow-lg" role="status">{{ notice }}</div>
      </Transition>
      <p class="mt-5 text-center text-xs text-[var(--muted)]">FAQ · 안내 내용을 선택해 확인하세요</p>
    </div>
  </main>
</template>