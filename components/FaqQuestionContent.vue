<script setup>
import { computed } from "vue";
import FaqSearchResults from "./FaqSearchResults.vue";

const props = defineProps({
  currentData: { type: Object, required: true },
  activeAnswer: { type: Object, default: null },
  questionTitle: { type: String, required: true },
  query: { type: String, required: true },
  searchResults: { type: Array, required: true },
  faqTree: { type: Object, required: true },
  canReset: { type: Boolean, required: true }
});

const emit = defineEmits([
  "select-option",
  "select-search-result",
  "copy-answer",
  "feedback",
  "reset"
]);

const answerImages = computed(() => {
  const images = props.activeAnswer?.images ?? [];
  if (images.length === 0) {
    return [{ src: "/images/faq-placeholder.svg", alt: "FAQ 답변 이미지 예시" }];
  }

  return images.map((image) => typeof image === "string"
    ? { src: image, alt: props.activeAnswer.title }
    : image
  );
});
</script>

<template>
  <div class="min-h-72 p-5 sm:p-7">
    <div class="mb-6 flex items-start gap-3">
      <span class="mt-0.5 h-6 w-1 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden="true"></span>
      <h2 class="text-lg font-bold leading-7 sm:text-xl">{{ props.questionTitle }}</h2>
    </div>

    <FaqSearchResults
      v-if="props.query.trim()"
      :results="props.searchResults"
      :query="props.query"
      :faq-tree="props.faqTree"
      @select-result="emit('select-search-result', $event)"
    />

    <div v-else-if="props.activeAnswer" class="rounded-xl border-l-4 border-[var(--accent)] bg-[var(--page-bg)] p-5 sm:p-6">
      <p class="leading-7 text-[var(--ink)]">{{ props.activeAnswer.text }}</p>
      <div class="mt-5 flex flex-wrap gap-3">
        <figure v-for="(image, index) in answerImages" :key="`${image.src}-${index}`" class="w-full max-w-64 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]">
          <img class="aspect-square w-full object-cover" :src="image.src" :alt="image.alt || props.activeAnswer.title" loading="lazy">
        </figure>
      </div>
      <div class="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-4">
        <button class="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--accent)]" type="button" @click="emit('copy-answer')">
          <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>
          답변 복사
        </button>
        <div class="flex items-center gap-2 text-sm text-[var(--muted)]">
          <span>도움이 되었나요?</span>
          <button class="grid size-9 place-items-center rounded-lg border border-[var(--line)] transition hover:border-[var(--accent)] hover:bg-[var(--tint)]" type="button" aria-label="도움이 됐어요" @click="emit('feedback', true)">👍</button>
          <button class="grid size-9 place-items-center rounded-lg border border-[var(--line)] transition hover:border-[var(--accent)] hover:bg-[var(--tint)]" type="button" aria-label="도움이 안 됐어요" @click="emit('feedback', false)">👎</button>
        </div>
      </div>
    </div>

    <div v-else class="space-y-3">
      <button
        v-for="(option, index) in props.currentData.options"
        :key="option.text"
        class="group flex min-h-16 w-full items-center justify-between gap-4 rounded-xl border border-[var(--line)] bg-[var(--page-bg)] px-4 py-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:px-5"
        type="button"
        @click="emit('select-option', option)"
      >
        <span class="flex items-center gap-3 text-sm font-semibold leading-6 sm:text-base">
          <span class="grid size-7 shrink-0 place-items-center rounded-lg bg-[var(--surface)] text-xs font-bold text-[var(--accent)]">0{{ index + 1 }}</span>
          {{ option.text }}
        </span>
        <svg viewBox="0 0 24 24" class="size-5 shrink-0 text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </div>
  </div>

  <footer v-if="props.canReset" class="border-t border-[var(--line)] px-5 py-4 sm:px-7">
    <button class="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--accent)]" type="button" @click="emit('reset')">
      <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12a9 9 0 1 0 2.64-6.36L3 8"/><path d="M3 3v5h5"/></svg>
      처음 단계로 돌아가기
    </button>
  </footer>
</template>