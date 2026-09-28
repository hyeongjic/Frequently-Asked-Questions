<script setup>
const props = defineProps({
  historyStack: { type: Array, required: true },
  faqTree: { type: Object, required: true }
});

const emit = defineEmits(["select-step"]);
const query = defineModel("query", { type: String, required: true });
</script>

<template>
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
      <template v-for="(stepKey, index) in props.historyStack" :key="`${stepKey}-${index}`">
        <span v-if="index > 0" class="text-[var(--muted)]" aria-hidden="true">/</span>
        <button
          class="rounded px-1 py-0.5 transition hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          :class="index === props.historyStack.length - 1 ? 'font-semibold text-[var(--ink)]' : 'text-[var(--muted)]'"
          type="button"
          @click="emit('select-step', index)"
        >{{ props.faqTree[stepKey].title }}</button>
      </template>
    </nav>
  </div>
</template>