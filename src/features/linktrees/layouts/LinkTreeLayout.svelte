<script>
  import { onMount } from "svelte";
  import { LoaderCircle, RefreshCw } from "lucide-svelte";
  import Navbar from "../components/Navbar.svelte";
  import Sidebar from "../components/Sidebar.svelte";
  import { authStore } from "../../auth/states/authStore";
  import { usersStore } from "../../users/states/usersStore";
  import apiHelper from "../../../helpers/apiHelper";
  import { navigate } from "../../../router.js";

  let isSidebarOpen = false;

  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
  }

  function closeSidebar() {
    isSidebarOpen = false;
  }

  onMount(() => {
    if (!apiHelper.getAccessToken()) {
      navigate("/auth/login");
      return;
    }

    if (!usersStore.profile) {
      usersStore.asyncSetProfile();
    }
  });

  function retryProfile() {
    usersStore.setProfileError(null);
    usersStore.asyncSetProfile();
  }

  $: if ($usersStore.isProfile) {
    usersStore.setIsProfile(false);
    if (!$usersStore.profile && $usersStore.profileError === "unauthorized") {
      apiHelper.putAccessToken("");
      navigate("/auth/login");
    }
  }

  $: if ($authStore.isAuthLogout) {
    authStore.setIsAuthLogout(false);
    usersStore.setProfile(null);
    navigate("/auth/login");
  }
</script>

<div class="min-h-screen bg-slate-50">
  <Navbar onToggleSidebar={toggleSidebar} />

  <div class="flex">
    <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

    <main class="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
      {#if $usersStore.profile}
        <slot />
      {:else if $usersStore.profileError === "failed"}
        <div class="flex flex-col items-center justify-center py-24 text-center">
          <h1 class="sr-only">Delcom Link Tree</h1>
          <p data-testid="profile-error" class="text-sm font-medium text-slate-600 mb-3">
            Gagal memuat data pengguna. Periksa koneksi lalu coba lagi.
          </p>
          <button
            type="button"
            data-testid="profile-retry-btn"
            on:click={retryProfile}
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
          >
            <RefreshCw size={16} />
            Coba Lagi
          </button>
        </div>
      {:else}
        <div class="flex flex-col items-center justify-center py-24">
          <h1 class="sr-only">Delcom Link Tree</h1>
          <LoaderCircle size={36} class="text-indigo-600 animate-spin mb-2" />
          <p class="text-sm font-medium text-slate-600">Memuat data pengguna...</p>
        </div>
      {/if}
    </main>
  </div>
</div>