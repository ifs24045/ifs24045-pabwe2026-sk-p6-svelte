<script>
  import { X } from "lucide-svelte";

  export let title;
  export let onClose;

  function handleKeydown(event) {
    if (event.key === "Escape") {
      onClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div
  data-testid="modal"
  role="dialog"
  aria-modal="true"
  aria-label={title}
  class="fixed inset-0 z-50 flex items-center justify-center p-4"
>
  <button
    type="button"
    data-testid="modal-backdrop"
    aria-label="Tutup"
    tabindex="-1"
    on:click={onClose}
    class="absolute inset-0 bg-slate-900/50 cursor-default"
  ></button>

  <div class="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-100">
    <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
      <h2 class="text-lg font-bold text-slate-900">{title}</h2>
      <button
        type="button"
        data-testid="modal-close-btn"
        aria-label="Tutup"
        on:click={onClose}
        class="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <X size={20} />
      </button>
    </div>

    <div class="p-6">
      <slot />
    </div>
  </div>
</div>