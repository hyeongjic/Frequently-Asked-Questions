<script setup>
const props = defineProps({
  isDarkMode: { type: Boolean, required: true }
});

const emit = defineEmits(["toggle-theme"]);
</script>

<template>
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
      :title="props.isDarkMode ? '라이트 모드' : '다크 모드'"
      @click="emit('toggle-theme')"
    >
      <svg v-if="!props.isDarkMode" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M21 12.8A9 9 0 0 1 11.2 3 7 7 0 1 0 21 12.8Z" />
      </svg>
      <svg v-else viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.8">
        <circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
      </svg>
    </button>
  </header>
</template>