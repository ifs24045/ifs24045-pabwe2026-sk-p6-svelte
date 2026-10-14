import "@testing-library/jest-dom";
import { beforeEach } from "vitest";

beforeEach(async () => {
  const { authStore } = await import("./features/auth/states/authStore");
  const { usersStore } = await import("./features/users/states/usersStore");
  const { linkTreesStore } = await import("./features/linktrees/states/linkTreesStore");
  const { currentPath } = await import("./router.js");

  localStorage.clear();
  authStore.reset();
  usersStore.reset();
  linkTreesStore.reset();
  window.history.replaceState({}, "", "/");
  currentPath.set("/");
});