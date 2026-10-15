<script>
  import { currentPath, resolveRoute } from "./router.js";
  import AuthLayout from "./features/auth/layouts/AuthLayout.svelte";
  import LoginPage from "./features/auth/pages/LoginPage.svelte";
  import RegisterPage from "./features/auth/pages/RegisterPage.svelte";
  import LinkTreeLayout from "./features/linktrees/layouts/LinkTreeLayout.svelte";
  import HomePage from "./features/linktrees/pages/HomePage.svelte";
  import DetailPage from "./features/linktrees/pages/DetailPage.svelte";
  import UsersPage from "./features/users/pages/UsersPage.svelte";
  import ProfilePage from "./features/users/pages/ProfilePage.svelte";
  import NotFoundPage from "./features/common/pages/NotFoundPage.svelte";

  const layouts = {
    auth: AuthLayout,
    app: LinkTreeLayout,
  };

  const pages = {
    login: LoginPage,
    register: RegisterPage,
    home: HomePage,
    detail: DetailPage,
    users: UsersPage,
    profile: ProfilePage,
    notfound: NotFoundPage,
  };

  $: route = resolveRoute($currentPath);
  $: Layout = layouts[route.layout];
  $: Page = pages[route.page];
</script>

{#key route.layout}
  {#if Layout}
    <svelte:component this={Layout}>
      {#key $currentPath}
        <svelte:component this={Page} {...route.params} />
      {/key}
    </svelte:component>
  {:else}
    {#key $currentPath}
      <svelte:component this={Page} />
    {/key}
  {/if}
{/key}