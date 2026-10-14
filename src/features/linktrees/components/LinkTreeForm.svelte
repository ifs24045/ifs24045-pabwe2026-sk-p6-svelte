<script>
  import { LoaderCircle } from "lucide-svelte";
  import { showErrorDialog } from "../../../helpers/toolsHelper";

  export let initialTitle = "";
  export let initialType = "public";
  export let initialDescription = "";
  export let submitLabel;
  export let loadingLabel;
  export let onSubmit;
  export let onCancel;

  const typeHints = {
    public: "Semua orang dapat melihat dan menemukan halaman ini.",
    unlisted: "Hanya orang yang memiliki tautan yang dapat membukanya.",
    private: "Hanya Anda yang dapat melihat halaman ini.",
  };

  let title = initialTitle;
  let type = initialType;
  let description = initialDescription;
  let loading = false;

  $: selectedHint = typeHints[type];

  async function handleSubmit() {
    if (!title.trim()) {
      showErrorDialog("Judul tidak boleh kosong!");
      return;
    }
    if (!description.trim()) {
      showErrorDialog("Deskripsi tidak boleh kosong!");
      return;
    }

    loading = true;
    await onSubmit(title.trim(), type, description.trim());
    loading = false;
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
  <div>
    <label for="link-tree-title-input" class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
      Judul
    </label>
    <input
      id="link-tree-title-input"
      type="text"
      data-testid="link-tree-title-input"
      bind:value={title}
      placeholder="Contoh: Kursus Ku"
      class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
      required
    />
  </div>

  <div>
    <label for="link-tree-type-select" class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
      Tipe
    </label>
    <select
      id="link-tree-type-select"
      data-testid="link-tree-type-select"
      bind:value={type}
      class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
    >
      <option value="public">Publik</option>
      <option value="unlisted">Tidak Terdaftar</option>
      <option value="private">Privat</option>
    </select>
    <p data-testid="link-tree-type-hint" class="mt-1.5 text-xs text-slate-500">
      {selectedHint}
    </p>
  </div>

  <div>
    <label for="link-tree-description-input" class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
      Deskripsi
    </label>
    <textarea
      id="link-tree-description-input"
      data-testid="link-tree-description-input"
      bind:value={description}
      rows="3"
      placeholder="Ceritakan singkat isi kumpulan tautan ini"
      class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none"
      required
    ></textarea>
  </div>

  <div class="pt-2 flex items-center justify-end gap-3">
    <button
      type="button"
      data-testid="link-tree-cancel-btn"
      on:click={onCancel}
      class="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
    >
      Batal
    </button>
    <button
      type="submit"
      data-testid="link-tree-submit-btn"
      disabled={loading}
      class="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
    >
      {#if loading}
        <LoaderCircle size={18} class="animate-spin" />
        <span>{loadingLabel}</span>
      {:else}
        <span>{submitLabel}</span>
      {/if}
    </button>
  </div>
</form>