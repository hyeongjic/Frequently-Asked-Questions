<script setup>
import { computed, ref, watch } from "vue";
import { faqTree } from "./faq_tree.js";

const historyStack = ref(["start"]);
const activeStep = computed(() => historyStack.value.at(-1));
const activeAnswer = ref(null);
const query = ref("");
const isDarkMode = ref(false);
const notice = ref("");
const feedback = ref("");

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

  if (option.answer) activeAnswer.value = { title: option.text, text: option.answer };
}

function selectSearchResult(result) {
  historyStack.value = ["start", result.stepKey];
  activeAnswer.value = { title: result.text, text: result.answer };
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
  feedback.value = isPositive ? "도움이 되었다니 다행이에요." : "의견을 반영해 더 나은 안내를 준비할게요.";
  showNotice(feedback.value);
}

function showNotice(message) {
  notice.value = message;
  window.setTimeout(() => {
    if (notice.value === message) notice.value = "";
  }, 2200);
}

function splitMatch(text) {
  const term = query.value.trim();
  if (!term) return [{ text, matched: false }];
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.split(new RegExp(`(${escaped})`, "ig")).filter(Boolean).map((part) => ({
    text: part,
    matched: part.toLocaleLowerCase() === term.toLocaleLowerCase()
  }));
}
</script>

<template>
  <main class="min-h-screen bg-[var(--page-bg)] px-4 py-8 text-[var(--ink)] transition-colors sm:px-8 sm:py-12">
    <div class="mx-auto max-w-3xl">
      <header class="mb-8 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="grid size-11 place-items-center rounded-xl bg-[var(--accent)] text-white shadow-sm" aria-hidden="true">
            <svg viewBox="0 0 24 24" class="size-6" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
              <path d="M4 5.5v15M8 7h8M8 11h7" />
            </svg>
          </div>
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">HELP CENTER</p>
            <h1 class="text-lg font-bold leading-tight sm:text-xl">자주 묻는 질문 가이드</h1>
          </div>
        </div>
        <button
          class="grid size-10 shrink-0 place-items-center rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] transition hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          type="button"
          aria-label="테마 변경"
          :title="isDarkMode ? '라이트 모드' : '다크 모드'"
          @click="isDarkMode = !isDarkMode"
        >
          <svg v-if="!isDarkMode" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M21 12.8A9 9 0 0 1 11.2 3 7 7 0 1 0 21 12.8Z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
          </svg>
        </button>
      </header>

      <section class="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_18px_60px_-34px_rgba(23,43,38,0.35)]">
        <div class="border-b border-[var(--line)] p-5 sm:p-7">
          <label class="relative block">
            <span class="sr-only">FAQ 검색</span>
            <svg viewBox="0 0 24 24" class="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[var(--muted)]" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
            </svg>
            <input
              v-model="query"
              class="w-full rounded-xl border border-[var(--line)] bg-[var(--page-bg)] py-3 pl-12 pr-4 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-3 focus:ring-[color-mix(in_srgb,var(--accent)_15%,transparent)]"
              type="search"
              placeholder="키워드로 검색해 보세요 (예: 신분증, 환불)"
              autocomplete="off"
            >
          </label>

          <nav v-if="!query.trim()" class="mt-5 flex flex-wrap items-center gap-2 text-sm" aria-label="탐색 경로">
            <template v-for="(stepKey, index) in historyStack" :key="`${stepKey}-${index}`">
              <span v-if="index > 0" class="text-[var(--muted)]" aria-hidden="true">/</span>
              <button
                class="rounded px-1 py-0.5 transition hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                :class="index === historyStack.length - 1 ? 'font-semibold text-[var(--ink)]' : 'text-[var(--muted)]'"
                type="button"
                @click="goToStep(index)"
              >{{ faqTree[stepKey].title }}</button>
            </template>
          </nav>
        </div>

        <div class="min-h-72 p-5 sm:p-7">
          <div class="mb-6 flex items-start gap-3">
            <span class="mt-0.5 h-6 w-1 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden="true"></span>
            <h2 class="text-lg font-bold leading-7 sm:text-xl">{{ questionTitle }}</h2>
          </div>

          <div v-if="query.trim()" class="space-y-3">
            <button
              v-for="(result, index) in searchResults"
              :key="`${result.stepKey}-${index}`"
              class="group w-full rounded-xl border border-[var(--line)] bg-[var(--page-bg)] p-4 text-left transition hover:border-[var(--accent)] hover:bg-[var(--tint)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              type="button"
              @click="selectSearchResult(result)"
            >
              <span class="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--accent)]">{{ faqTree[result.stepKey].title }} · 질문</span>
              <span class="block font-semibold leading-6">
                <template v-for="(part, partIndex) in splitMatch(result.text)" :key="partIndex"><mark v-if="part.matched" class="rounded-sm bg-[var(--highlight)] text-inherit">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
              </span>
              <span class="mt-2 block text-sm leading-6 text-[var(--muted)]">
                <template v-for="(part, partIndex) in splitMatch(result.answer)" :key="partIndex"><mark v-if="part.matched" class="rounded-sm bg-[var(--highlight)] text-inherit">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
              </span>
            </button>
            <p v-if="searchResults.length === 0" class="rounded-xl border border-dashed border-[var(--line)] px-4 py-10 text-center text-sm text-[var(--muted)]">검색 결과가 없습니다.</p>
          </div>

          <div v-else-if="activeAnswer" class="rounded-xl border-l-4 border-[var(--accent)] bg-[var(--page-bg)] p-5 sm:p-6">
            <p class="leading-7 text-[var(--ink)]">{{ activeAnswer.text }}</p>
            <div class="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-4">
              <button class="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--accent)]" type="button" @click="copyAnswer">
                <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>
                답변 복사
              </button>
              <div class="flex items-center gap-2 text-sm text-[var(--muted)]">
                <span>도움이 되었나요?</span>
                <button class="grid size-9 place-items-center rounded-lg border border-[var(--line)] transition hover:border-[var(--accent)] hover:bg-[var(--tint)]" type="button" aria-label="도움이 됐어요" @click="sendFeedback(true)">👍</button>
                <button class="grid size-9 place-items-center rounded-lg border border-[var(--line)] transition hover:border-[var(--accent)] hover:bg-[var(--tint)]" type="button" aria-label="도움이 안 됐어요" @click="sendFeedback(false)">👎</button>
              </div>
            </div>
          </div>

          <div v-else class="space-y-3">
            <button
              v-for="(option, index) in currentData.options"
              :key="option.text"
              class="group flex min-h-16 w-full items-center justify-between gap-4 rounded-xl border border-[var(--line)] bg-[var(--page-bg)] px-4 py-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:px-5"
              type="button"
              @click="selectOption(option)"
            >
              <span class="flex items-center gap-3 text-sm font-semibold leading-6 sm:text-base">
                <span class="grid size-7 shrink-0 place-items-center rounded-lg bg-[var(--surface)] text-xs font-bold text-[var(--accent)]">0{{ index + 1 }}</span>
                {{ option.text }}
              </span>
              <svg viewBox="0 0 24 24" class="size-5 shrink-0 text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>

        <footer v-if="historyStack.length > 1 || activeAnswer" class="border-t border-[var(--line)] px-5 py-4 sm:px-7">
          <button class="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--accent)]" type="button" @click="reset">
            <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12a9 9 0 1 0 2.64-6.36L3 8"/><path d="M3 3v5h5"/></svg>
            처음 단계로 돌아가기
          </button>
        </footer>
      </section>

      <Transition enter-active-class="transition duration-200" enter-from-class="translate-y-2 opacity-0" enter-to-class="translate-y-0 opacity-100" leave-active-class="transition duration-150" leave-to-class="opacity-0">
        <div v-if="notice" class="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-lg bg-[var(--ink)] px-4 py-3 text-sm font-medium text-[var(--surface)] shadow-lg" role="status">{{ notice }}</div>
      </Transition>
      <p class="mt-5 text-center text-xs text-[var(--muted)]">FAQ · 안내 내용을 선택해 확인하세요</p>
    </div>
  </main>
</template>