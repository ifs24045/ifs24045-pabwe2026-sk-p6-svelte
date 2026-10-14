<script>
  import { onMount } from "svelte";
  import {
    ArrowLeft,
    Pencil,
    ImagePlus,
    Plus,
    Trash2,
    Link2,
    ExternalLink,
    LoaderCircle,
    FolderOpen,
  } from "lucide-svelte";
  import { linkTreesStore } from "../states/linkTreesStore";
  import { usersStore } from "../../users/states/usersStore";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import ChangeCoverModal from "../modals/ChangeCoverModal.svelte";
  import ItemModal from "../modals/ItemModal.svelte";
  import { showConfirmDialog } from "../../../helpers/toolsHelper";
  import { navigate } from "../../../router.js";

  export let linkTreeId;

  const typeLabels = {
    public: "Publik",
    unlisted: "Tidak Terdaftar",
    private: "Privat",
  };

  const typeClasses = {
    public: "bg-emerald-50 text-emerald-700",
    unlisted: "bg-amber-50 text-amber-700",
    private: "bg-slate-100 text-slate-600",
  };

  let loading = false;
  let showChangeModal = false;
  let showCoverModal = false;
  let showItemModal = false;
  let editingItem = null;

  $: stored = $linkTreesStore.linkTree;
  $: linkTree = stored && String(stored.id) === String(linkTreeId) ? stored : null;
  $: myId = $usersStore.profile ? $usersStore.profile.id : null;
  $: isOwner = Boolean(linkTree) && linkTree.user_id === myId;

  function loadLinkTree() {
    loading = true;
    return Promise.resolve(linkTreesStore.asyncSetLinkTree(linkTreeId)).finally(() => {
      loading = false;
    });
  }

  onMount(() => {
    loadLinkTree();
  });

  $: if ($linkTreesStore.isChangeLinkTree) {
    linkTreesStore.setIsChangeLinkTree(false);
    showChangeModal = false;
    loadLinkTree();
  }

  $: if ($linkTreesStore.isChangeCoverLinkTree) {
    linkTreesStore.setIsChangeCoverLinkTree(false);
    showCoverModal = false;
    loadLinkTree();
  }

  $: if ($linkTreesStore.isAddItem) {
    linkTreesStore.setIsAddItem(false);
    showItemModal = false;
    loadLinkTree();
  }

  $: if ($linkTreesStore.isChangeItem) {
    linkTreesStore.setIsChangeItem(false);
    showItemModal = false;
    editingItem = null;
    loadLinkTree();
  }

  $: if ($linkTreesStore.isDeleteItem) {
    linkTreesStore.setIsDeleteItem(false);
    loadLinkTree();
  }

  $: if ($linkTreesStore.isDeleteLinkTree) {
    linkTreesStore.setIsDeleteLinkTree(false);
    navigate("/");
  }

  function hasCover(cover) {
    return Boolean(cover) && !cover.endsWith("/");
  }

  function authorLabel(tree) {
    return `Oleh ${tree.author.name}`;
  }

  function openAddItem() {
    editingItem = null;
    showItemModal = true;
  }

  function openEditItem(item) {
    editingItem = item;
    showItemModal = true;
  }

  function closeItemModal() {
    showItemModal = false;
    editingItem = null;
  }

  async function handleDeleteItem(item) {
    const result = await showConfirmDialog(`Hapus tautan "${item.title}"?`);
    if (result.isConfirmed) {
      linkTreesStore.asyncDeleteItem(linkTree.id, item.id);
    }
  }

  async function handleDeleteLinkTree() {
    const result = await showConfirmDialog(
      `Hapus link tree "${linkTree.title}" beserta seluruh tautannya?`
    );
    if (result.isConfirmed) {
      linkTreesStore.asyncDeleteLinkTree(linkTree.id);
    }
  }
</script>

<div class="space-y-6 animate-in fade-in duration-300">
  <button
    type="button"
    data-testid="back-btn"
    on:click={() => navigate("/")}
    class="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
  >
    <ArrowLeft size={16} />
    Kembali
  </button>

  {#if !linkTree && loading}
    <div class="flex flex-col items-center justify-center py-24">
      <LoaderCircle size={36} class="text-indigo-600 animate-spin mb-2" />
      <p class="text-sm font-medium text-slate-600">Memuat detail link tree...</p>
    </div>
  {:else if !linkTree}
    <div class="py-16 text-center text-slate-400">
      <FolderOpen size={40} class="mx-auto text-slate-300 mb-2" />
      <p class="font-medium">Link tree tidak ditemukan.</p>
    </div>
  {:else}
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {#if hasCover(linkTree.cover)}
        <img
          src={linkTree.cover}
          alt={linkTree.title}
          data-testid="detail-cover"
          class="w-full h-48 sm:h-64 object-cover"
        />
      {:else}
        <div
          data-testid="detail-cover-fallback"
          class="w-full h-48 sm:h-64 bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center"
        >
          <Link2 size={56} class="text-white/80" />
        </div>
      {/if}

      <div class="p-6 sm:p-8 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div class="space-y-2">
            <span
              data-testid="detail-type"
              class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeClasses[linkTree.type]}`}
            >
              {typeLabels[linkTree.type]}
            </span>
            <h1 data-testid="detail-title" class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {linkTree.title}
            </h1>
            <p data-testid="detail-author" class="text-sm text-slate-500">{authorLabel(linkTree)}</p>
          </div>

          {#if isOwner}
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                data-testid="change-btn"
                on:click={() => (showChangeModal = true)}
                class="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <Pencil size={16} />
                Ubah Data
              </button>
              <button
                type="button"
                data-testid="change-cover-btn"
                on:click={() => (showCoverModal = true)}
                class="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <ImagePlus size={16} />
                Ubah Sampul
              </button>
              <button
                type="button"
                data-testid="delete-link-tree-btn"
                on:click={handleDeleteLinkTree}
                class="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 size={16} />
                Hapus
              </button>
            </div>
          {/if}
        </div>

        <p data-testid="detail-description" class="text-sm text-slate-600 leading-relaxed">
          {linkTree.description || "-"}
        </p>
      </div>
    </div>

    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-4">
      <div class="flex items-center justify-between gap-4">
        <h2 class="text-lg font-bold text-slate-900">Daftar Tautan</h2>
        {#if isOwner}
          <button
            type="button"
            data-testid="add-item-btn"
            on:click={openAddItem}
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/25 transition-all"
          >
            <Plus size={16} />
            Tambah Tautan
          </button>
        {/if}
      </div>

      {#if linkTree.items.length === 0}
        <p data-testid="items-empty" class="py-8 text-center text-sm text-slate-400">
          Belum ada tautan di link tree ini.
        </p>
      {:else}
        <ul class="space-y-3">
          {#each linkTree.items as item (item.id)}
            <li
              data-testid={`item-${item.id}`}
              class="flex items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-300 transition-colors"
            >
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`item-link-${item.id}`}
                class="flex-1 min-w-0 flex items-center gap-3"
              >
                <span class="shrink-0 p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <ExternalLink size={16} />
                </span>
                <span class="min-w-0">
                  <span class="block text-sm font-semibold text-slate-900 truncate">{item.title}</span>
                  <span class="block text-xs text-slate-500 truncate">{item.url}</span>
                </span>
              </a>
              {#if isOwner}
                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    data-testid={`item-edit-${item.id}`}
                    aria-label={`Ubah ${item.title}`}
                    on:click={() => openEditItem(item)}
                    class="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    data-testid={`item-delete-${item.id}`}
                    aria-label={`Hapus ${item.title}`}
                    on:click={() => handleDeleteItem(item)}
                    class="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</div>

{#if linkTree && showChangeModal}
  <ChangeModal {linkTree} onClose={() => (showChangeModal = false)} />
{/if}

{#if linkTree && showCoverModal}
  <ChangeCoverModal {linkTree} onClose={() => (showCoverModal = false)} />
{/if}

{#if linkTree && showItemModal}
  <ItemModal {linkTree} item={editingItem} onClose={closeItemModal} />
{/if}