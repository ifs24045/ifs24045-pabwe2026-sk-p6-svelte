<script>
  import { onMount } from "svelte";
  import {
    Plus,
    Search,
    Trash2,
    Link2,
    LoaderCircle,
    FolderOpen,
  } from "lucide-svelte";
  import { linkTreesStore } from "../states/linkTreesStore";
  import { usersStore } from "../../users/states/usersStore";
  import AddModal from "../modals/AddModal.svelte";
  import { showConfirmDialog } from "../../../helpers/toolsHelper";
  import { navigate } from "../../../router.js";

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

  let search = "";
  let filterMine = false;
  let loading = false;
  let showAddModal = false;

  $: linkTrees = $linkTreesStore.linkTrees;
  $: myId = $usersStore.profile ? $usersStore.profile.id : null;

  $: filteredLinkTrees = linkTrees.filter((lt) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      lt.title.toLowerCase().includes(query) ||
      (lt.description || "").toLowerCase().includes(query)
    );
  });

  $: totalPublic = linkTrees.filter((lt) => lt.type === "public").length;
  $: totalUnlisted = linkTrees.filter((lt) => lt.type === "unlisted").length;
  $: totalPrivate = linkTrees.filter((lt) => lt.type === "private").length;
  $: totalLinks = linkTrees.reduce((sum, lt) => sum + lt.total_links, 0);
  $: hasOwned = linkTrees.some((lt) => lt.user_id === myId);

  function loadLinkTrees() {
    loading = true;
    return Promise.resolve(linkTreesStore.asyncSetLinkTrees(filterMine)).finally(() => {
      loading = false;
    });
  }

  onMount(() => {
    loadLinkTrees();
  });

  $: if ($linkTreesStore.isAddLinkTree) {
    linkTreesStore.setIsAddLinkTree(false);
    showAddModal = false;
    loadLinkTrees();
  }

  $: if ($linkTreesStore.isDeleteLinkTree) {
    linkTreesStore.setIsDeleteLinkTree(false);
    loadLinkTrees();
  }

  $: if ($linkTreesStore.isDeleteAllLinkTrees) {
    linkTreesStore.setIsDeleteAllLinkTrees(false);
    loadLinkTrees();
  }

  function metaLabel(linkTree) {
    return `${linkTree.author.name} · ${linkTree.total_links} tautan`;
  }

  function hasCover(cover) {
    return Boolean(cover) && !cover.endsWith("/");
  }

  async function handleDelete(linkTree) {
    const result = await showConfirmDialog(`Hapus link tree "${linkTree.title}"?`);
    if (result.isConfirmed) {
      linkTreesStore.asyncDeleteLinkTree(linkTree.id);
    }
  }

  async function handleDeleteAll() {
    const result = await showConfirmDialog(
      "Semua link tree milik Anda akan dihapus permanen beserta sampul dan tautannya. Lanjutkan?"
    );
    if (result.isConfirmed) {
      linkTreesStore.asyncDeleteAllLinkTrees();
    }
  }
</script>

<div class="space-y-6 animate-in fade-in duration-300">
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        Semua Link Tree
      </h1>
      <p class="text-sm text-slate-500 mt-1">
        Kelola dan jelajahi kumpulan tautan yang dibagikan.
      </p>
    </div>
    <div class="flex items-center gap-3">
      {#if hasOwned}
        <button
          type="button"
          data-testid="delete-all-btn"
          on:click={handleDeleteAll}
          class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 rounded-xl transition-colors"
        >
          <Trash2 size={16} />
          Hapus Semua
        </button>
      {/if}
      <button
        type="button"
        data-testid="add-link-tree-btn"
        on:click={() => (showAddModal = true)}
        class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/25 transition-all"
      >
        <Plus size={16} />
        Tambah Link Tree
      </button>
    </div>
  </div>

  <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
    <div class="bg-white rounded-2xl border border-slate-200/80 p-4">
      <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</p>
      <p data-testid="stat-total" class="text-2xl font-extrabold text-slate-900 mt-1">{linkTrees.length}</p>
    </div>
    <div class="bg-white rounded-2xl border border-slate-200/80 p-4">
      <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Publik</p>
      <p data-testid="stat-public" class="text-2xl font-extrabold text-emerald-600 mt-1">{totalPublic}</p>
    </div>
    <div class="bg-white rounded-2xl border border-slate-200/80 p-4">
      <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Tidak Terdaftar</p>
      <p data-testid="stat-unlisted" class="text-2xl font-extrabold text-amber-600 mt-1">{totalUnlisted}</p>
    </div>
    <div class="bg-white rounded-2xl border border-slate-200/80 p-4">
      <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Privat</p>
      <p data-testid="stat-private" class="text-2xl font-extrabold text-slate-700 mt-1">{totalPrivate}</p>
    </div>
    <div class="bg-white rounded-2xl border border-slate-200/80 p-4 col-span-2 lg:col-span-1">
      <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tautan</p>
      <p data-testid="stat-links" class="text-2xl font-extrabold text-indigo-600 mt-1">{totalLinks}</p>
    </div>
  </div>

  <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
    <div class="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="relative flex-1 max-w-md">
        <Search size={18} class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          data-testid="search-input"
          bind:value={search}
          placeholder="Cari berdasarkan judul atau deskripsi..."
          class="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
        />
      </div>
      <label
        for="filter-mine-checkbox"
        class="inline-flex items-center gap-2 text-sm font-medium text-slate-600"
      >
        <input
          id="filter-mine-checkbox"
          type="checkbox"
          data-testid="filter-mine-checkbox"
          bind:checked={filterMine}
          on:change={loadLinkTrees}
          class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        Milik saya
      </label>
    </div>

    <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {#if loading && filteredLinkTrees.length === 0}
        <div class="col-span-full py-16 text-center text-slate-400">
          <LoaderCircle size={36} class="mx-auto text-indigo-600 animate-spin mb-2" />
          <p class="font-medium text-slate-600">Memuat daftar link tree...</p>
        </div>
      {:else if filteredLinkTrees.length === 0}
        <div class="col-span-full py-12 text-center text-slate-400">
          <FolderOpen size={40} class="mx-auto text-slate-300 mb-2" />
          <p class="font-medium">Tidak ada link tree ditemukan.</p>
        </div>
      {:else}
        {#each filteredLinkTrees as lt (lt.id)}
          <article
            data-testid={`link-tree-card-${lt.id}`}
            class="rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all bg-white overflow-hidden flex flex-col"
          >
            <button
              type="button"
              data-testid={`link-tree-open-${lt.id}`}
              on:click={() => navigate(`/link-trees/${lt.id}`)}
              class="text-left flex-1 flex flex-col"
            >
              {#if hasCover(lt.cover)}
                <img
                  src={lt.cover}
                  alt={lt.title}
                  data-testid={`link-tree-cover-${lt.id}`}
                  class="w-full h-32 object-cover"
                />
              {:else}
                <div
                  data-testid={`link-tree-cover-fallback-${lt.id}`}
                  class="w-full h-32 bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center"
                >
                  <Link2 size={36} class="text-white/80" />
                </div>
              {/if}
              <div class="p-5 space-y-2 flex-1">
                <span
                  data-testid={`link-tree-type-${lt.id}`}
                  class={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeClasses[lt.type]}`}
                >
                  {typeLabels[lt.type]}
                </span>
                <h3 class="text-base font-bold text-slate-900 line-clamp-1">{lt.title}</h3>
                <p class="text-sm text-slate-500 line-clamp-2">{lt.description || "-"}</p>
              </div>
            </button>
            <div class="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{metaLabel(lt)}</span>
              {#if lt.user_id === myId}
                <button
                  type="button"
                  data-testid={`link-tree-delete-${lt.id}`}
                  aria-label={`Hapus ${lt.title}`}
                  on:click={() => handleDelete(lt)}
                  class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              {/if}
            </div>
          </article>
        {/each}
      {/if}
    </div>
  </div>
</div>

{#if showAddModal}
  <AddModal onClose={() => (showAddModal = false)} />
{/if}