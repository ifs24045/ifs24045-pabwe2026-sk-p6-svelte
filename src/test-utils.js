import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import { authStore } from "./features/auth/states/authStore";
import { usersStore } from "./features/users/states/usersStore";
import { linkTreesStore } from "./features/linktrees/states/linkTreesStore";
import { currentPath } from "./router.js";

function createWrapper(element) {
  return {
    element,
    exists: () => element !== null,
    text: () => element.textContent.trim(),
    find: (selector) => createWrapper(element.querySelector(selector)),
    findAll: (selector) =>
      Array.from(element.querySelectorAll(selector)).map((node) => createWrapper(node)),
    async trigger(eventName) {
      if (eventName === "click") {
        element.click();
      } else {
        element.dispatchEvent(new Event(eventName, { bubbles: true, cancelable: true }));
      }
      await tick();
    },
    async setValue(value) {
      element.value = value;
      const eventName = element.tagName === "SELECT" ? "change" : "input";
      element.dispatchEvent(new Event(eventName, { bubbles: true }));
      await tick();
    },
  };
}

function preloadStores(preloadedState) {
  [authStore, usersStore, linkTreesStore].forEach((store) => {
    const ownState = Object.fromEntries(
      Object.entries(preloadedState).filter(([key]) => key in store.$state)
    );
    if (Object.keys(ownState).length > 0) {
      store.reset(ownState);
    }
  });
}

export function renderWithProviders(Component, { props = {}, preloadedState = {}, route } = {}) {
  preloadStores(preloadedState);

  if (route) {
    window.history.replaceState({}, "", route);
    currentPath.set(route);
  }

  const { container } = render(Component, { props });

  return {
    wrapper: createWrapper(container),
    authStore,
    usersStore,
    linkTreesStore,
  };
}