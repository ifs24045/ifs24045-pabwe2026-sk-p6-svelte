<script>
  import ModalShell from "../components/ModalShell.svelte";
  import LinkTreeForm from "../components/LinkTreeForm.svelte";
  import { linkTreesStore } from "../states/linkTreesStore";

  export let onClose;

  async function handleSubmit(title, type, description) {
    await linkTreesStore.asyncPostLinkTree(title, type, description);
  }
</script>

<ModalShell title="Tambah Link Tree" {onClose}>
  <LinkTreeForm
    submitLabel="Tambah"
    loadingLabel="Menambahkan..."
    onSubmit={handleSubmit}
    onCancel={onClose}
  />
</ModalShell>