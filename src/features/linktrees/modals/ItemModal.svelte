<script>
  import { LoaderCircle } from "lucide-svelte";
  import ModalShell from "../components/ModalShell.svelte";
  import { linkTreesStore } from "../states/linkTreesStore";
  import { showErrorDialog } from "../../../helpers/toolsHelper";

  export let linkTree;
  export let item = null;
  export let onClose;

  const isEdit = item !== null;

  let title = isEdit ? item.title : "";
  let url = isEdit ? item.url : "";
  let loading = false;

  function isValidUrl(value) {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  async function handleSubmit() {
    if (!title.trim()) {
      showErrorDialog("Judul tautan tidak boleh kosong!");
      return;
    }

    if (!isValidUrl(url.trim())) {
      showErrorDialog("URL tidak valid! Gunakan format https://contoh.com");
      return;
    }

    loading = true;

    if (isEdit) {
      await linkTreesStore.asyncPutItem(linkTree.id, item.id, title.trim(), url.trim());
    } else {
      await linkTreesStore.asyncPostItem(linkTree.id, title.trim(), url.trim());
    }

    loading = false;
  }
</script>

<ModalShell title={isEdit ? "Ubah Tautan" : "Tambah Tautan"} {onClose}>
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div>
      <label
        for="item-title-input"
        class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5"
      >
        Judul Tautan
      </label>
      <input
        id="item-title-input"
        type="text"
        data-testid="item-title-input"
        bind:value={title}
        placeholder="Contoh: Dasar Java"
        class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
        required
      />
    </div>

    <div>
      <label
        for="item-url-input"
        class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5"
      >
        URL
      </label>
      <input
        id="item-url-input"
        type="url"
        data-testid="item-url-input"
        bind:value={url}
        placeholder="https://contoh.com"
        class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
        required
      />
    </div>

    <div class="pt-2 flex items-center justify-end gap-3">
      <button
        type="button"
        data-testid="item-cancel-btn"
        on:click={onClose}
        class="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
      >
        Batal
      </button>
      <button
        type="submit"
        data-testid="item-submit-btn"
        disabled={loading}
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
      >
        {#if loading}
          <LoaderCircle size={18} class="animate-spin" />
          <span>Menyimpan...</span>
        {:else}
          <span>{isEdit ? "Simpan" : "Tambah"}</span>
        {/if}
      </button>
    </div>
  </form>
</ModalShell>