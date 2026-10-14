<script>
  import { LayoutGrid, Users, User, X, Link } from "lucide-svelte";
  import { currentPath, navigate } from "../../../router.js";

  export let isOpen = false;
  export let onClose;

  const menus = [
    {
      label: "Semua Link Tree",
      path: "/",
      icon: LayoutGrid,
      testId: "sidebar-menu-home",
    },
    {
      label: "Semua Pengguna",
      path: "/users",
      icon: Users,
      testId: "sidebar-menu-users",
    },
    {
      label: "Profil Saya",
      path: "/profile",
      icon: User,
      testId: "sidebar-menu-profile",
    },
  ];

  function isActive(menu, path) {
    if (menu.path === "/") {
      return path === "/" || path.startsWith("/link-trees/");
    }
    return path === menu.path;
  }

  function handleNavigate(path) {
    navigate(path);
    onClose();
  }
</script>

{#if isOpen}
  <button
    type="button"
    data-testid="sidebar-overlay"
    aria-label="Tutup menu"
    on:click={onClose}
    class="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
  ></button>
{/if}

<aside
  data-testid="sidebar"
  class="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 transform transition-transform duration-200 lg:static lg:translate-x-0 {isOpen ? 'translate-x-0' : '-translate-x-full'}"
>
  <div class="h-16 px-5 flex items-center justify-between border-b border-slate-100 lg:hidden">
    <span class="flex items-center gap-2 font-extrabold text-slate-900">
      <Link size={18} class="text-indigo-600" />
      Menu
    </span>
    <button
      type="button"
      data-testid="sidebar-close-btn"
      aria-label="Tutup menu"
      on:click={onClose}
      class="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
    >
      <X size={20} />
    </button>
  </div>

  <nav class="p-4 space-y-1.5">
    {#each menus as menu (menu.path)}
      {@const active = isActive(menu, $currentPath)}
      <button
        type="button"
        data-testid={menu.testId}
        aria-current={active ? "page" : undefined}
        on:click={() => handleNavigate(menu.path)}
        class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all {active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}"
      >
        <svelte:component this={menu.icon} size={18} />
        <span>{menu.label}</span>
      </button>
    {/each}
  </nav>
</aside>