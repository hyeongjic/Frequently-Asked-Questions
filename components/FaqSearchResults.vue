<script setup>
const props = defineProps({
  results: { type: Array, required: true },
  query: { type: String, required: true },
  faqTree: { type: Object, required: true }
});

const emit = defineEmits(["select-result"]);

function splitMatch(text) {
  const term = props.query.trim();
  if (!term) return [{ text, matched: false }];
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.split(new RegExp(`(${escaped})`, "ig")).filter(Boolean).map((part) => ({
    text: part,
    matched: part.toLocaleLowerCase() === term.toLocaleLowerCase()
  }));
}
</script>

<template>
  <div class="space-y-3">
    <button
      v-for="(result, index) in props.results"
      :key="`${result.stepKey}-${index}`"
      class="group w-full rounded-xl border border-[var(--line)] bg-[var(--page-bg)] p-4 text-left transition hover:border-[var(--accent)] hover:bg-[var(--tint)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
      type="button"
      @click="emit('select-result', result)"
    >
      <span class="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--accent)]">{{ props.faqTree[result.stepKey].title }} · 질문</span>
      <span class="block font-semibold leading-6">
        <template v-for="(part, partIndex) in splitMatch(result.text)" :key="partIndex"><mark v-if="part.matched" class="rounded-sm bg-[var(--highlight)] text-inherit">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
      </span>
      <span class="mt-2 block text-sm leading-6 text-[var(--muted)]">
        <template v-for="(part, partIndex) in splitMatch(result.answer)" :key="partIndex"><mark v-if="part.matched" class="rounded-sm bg-[var(--highlight)] text-inherit">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
      </span>
    </button>
    <p v-if="props.results.length === 0" class="rounded-xl border border-dashed border-[var(--line)] px-4 py-10 text-center text-sm text-[var(--muted)]">검색 결과가 없습니다.</p>
  </div>
</template>