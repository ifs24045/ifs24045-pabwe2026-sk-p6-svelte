<script>
  import { Link, Menu, LogOut } from "lucide-svelte";
  import { usersStore } from "../../users/states/usersStore";
  import { authStore } from "../../auth/states/authStore";
  import { showConfirmDialog } from "../../../helpers/toolsHelper";
  import { navigate } from "../../../router.js";

  export let onToggleSidebar;

  $: profile = $usersStore.profile;
  $: displayName = profile?.name || "Pengguna";

  async function handleLogout() {
    const result = await showConfirmDialog("Apakah Anda yakin ingin keluar dari akun?");
    if (result.isConfirmed) {
      await authStore.asyncSetIsAuthLogout();
    }
  }
</script>

<header class="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200/80">
  <div class="h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <button
        type="button"
        data-testid="toggle-sidebar-btn"
        on:click={onToggleSidebar}
        class="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
        aria-label="Buka menu"
      >
        <Menu size={22} />
      </button>

      <a
        href="/"
        data-testid="navbar-brand"
        on:click|preventDefault={() => navigate("/")}
        class="flex items-center gap-2.5"
      >
        <span class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/25">
          <Link size={20} strokeWidth={2.5} />
        </span>
        <span class="font-extrabold text-slate-900 tracking-tight">Delcom Link Tree</span>
      </a>
    </div>

    <div class="flex items-center gap-2">
      <button
        type="button"
        data-testid="navbar-profile-btn"
        on:click={() => navigate("/profile")}
        aria-label={`Profil ${displayName}`}
        class="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full hover:bg-slate-100 transition-colors"
      >
        {#if profile?.photo}
          <img
            src={profile.photo}
            alt=""
            class="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
        {:else}
          <span class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm">
            {displayName.charAt(0).toUpperCase()}
          </span>
        {/if}
        <span class="hidden sm:block text-sm font-semibold text-slate-700 max-w-40 truncate">
          {displayName}
        </span>
      </button>

      <button
        type="button"
        data-testid="logout-btn"
        on:click={handleLogout}
        aria-label="Keluar"
        class="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 rounded-xl transition-colors"
      >
        <LogOut size={18} />
        <span class="hidden sm:inline">Keluar</span>
      </button>
    </div>
  </div>
</header>