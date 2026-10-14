<script>
  import ModalShell from "../components/ModalShell.svelte";
  import LinkTreeForm from "../components/LinkTreeForm.svelte";
  import { linkTreesStore } from "../states/linkTreesStore";

  export let linkTree;
  export let onClose;

  async function handleSubmit(title, type, description) {
    await linkTreesStore.asyncPutLinkTree(linkTree.id, title, type, description);
  }
</script>

<ModalShell title="Ubah Link Tree" {onClose}>
  <LinkTreeForm
    initialTitle={linkTree.title}
    initialType={linkTree.type}
    initialDescription={linkTree.description}
    submitLabel="Simpan"
    loadingLabel="Menyimpan..."
    onSubmit={handleSubmit}
    onCancel={onClose}
  />
</ModalShell>