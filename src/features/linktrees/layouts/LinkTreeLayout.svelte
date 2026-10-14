<script>
  import { onMount } from "svelte";
  import { LoaderCircle } from "lucide-svelte";
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

  $: if ($usersStore.isProfile) {
    usersStore.setIsProfile(false);
    if (!$usersStore.profile) {
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
      {:else}
        <div class="flex flex-col items-center justify-center py-24">
          <LoaderCircle size={36} class="text-indigo-600 animate-spin mb-2" />
          <p class="text-sm font-medium text-slate-600">Memuat data pengguna...</p>
        </div>
      {/if}
    </main>
  </div>
</div>