<script>
  import { LoaderCircle, ImagePlus } from "lucide-svelte";
  import ModalShell from "../components/ModalShell.svelte";
  import { linkTreesStore } from "../states/linkTreesStore";
  import { showErrorDialog } from "../../../helpers/toolsHelper";

  export let linkTree;
  export let onClose;

  const MAX_SIZE = 3 * 1024 * 1024;

  let selectedFile = null;
  let loading = false;

  function handleFileChange(event) {
    const file = event.target.files[0];

    if (!file) {
      selectedFile = null;
      return;
    }

    if (!file.type.startsWith("image/")) {
      showErrorDialog("Pilih file gambar yang valid!");
      selectedFile = null;
      return;
    }

    if (file.size > MAX_SIZE) {
      showErrorDialog("Ukuran file cover maksimal 3MB!");
      selectedFile = null;
      return;
    }

    selectedFile = file;
  }

  async function handleSubmit() {
    if (!selectedFile) {
      showErrorDialog("Pilih gambar cover terlebih dahulu!");
      return;
    }

    loading = true;
    await linkTreesStore.asyncPostLinkTreeCover(linkTree.id, selectedFile);
    loading = false;
  }
</script>

<ModalShell title="Ubah Sampul" {onClose}>
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div>
      <label
        for="link-tree-cover-input"
        class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5"
      >
        Gambar Sampul
      </label>
      <label
        for="link-tree-cover-input"
        class="flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-2xl border-2 border-dashed border-slate-200 text-center hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors"
      >
        <ImagePlus size={28} class="text-indigo-600" />
        {#if selectedFile}
          <span data-testid="cover-file-name" class="text-sm font-semibold text-slate-800 break-all">
            {selectedFile.name}
          </span>
        {:else}
          <span class="text-sm text-slate-500">Klik untuk memilih gambar (maks. 3MB)</span>
        {/if}
      </label>
      <input
        id="link-tree-cover-input"
        type="file"
        accept="image/*"
        data-testid="link-tree-cover-input"
        on:change={handleFileChange}
        class="sr-only"
      />
    </div>

    <div class="pt-2 flex items-center justify-end gap-3">
      <button
        type="button"
        data-testid="cover-cancel-btn"
        on:click={onClose}
        class="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
      >
        Batal
      </button>
      <button
        type="submit"
        data-testid="cover-submit-btn"
        disabled={loading}
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
      >
        {#if loading}
          <LoaderCircle size={18} class="animate-spin" />
          <span>Mengunggah...</span>
        {:else}
          <span>Unggah</span>
        {/if}
      </button>
    </div>
  </form>
</ModalShell>