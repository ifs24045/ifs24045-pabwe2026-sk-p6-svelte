import { writable } from "svelte/store";

const routes = [
  { pattern: /^\/auth\/login\/?$/, layout: "auth", page: "login", paramNames: [] },
  { pattern: /^\/auth\/register\/?$/, layout: "auth", page: "register", paramNames: [] },
  { pattern: /^\/?$/, layout: "app", page: "home", paramNames: [] },
  { pattern: /^\/link-trees\/([^/]+)\/?$/, layout: "app", page: "detail", paramNames: ["linkTreeId"] },
  { pattern: /^\/users\/?$/, layout: "app", page: "users", paramNames: [] },
  { pattern: /^\/profile\/?$/, layout: "app", page: "profile", paramNames: [] },
];

export const currentPath = writable(window.location.pathname);

export function resolveRoute(path) {
  for (const route of routes) {
    const match = route.pattern.exec(path);
    if (match) {
      const params = {};
      route.paramNames.forEach((name, index) => {
        params[name] = match[index + 1];
      });
      return { layout: route.layout, page: route.page, params };
    }
  }

  return { layout: "none", page: "notfound", params: {} };
}

export function navigate(path) {
  window.history.pushState({}, "", path);
  currentPath.set(path);
}

window.addEventListener("popstate", () => {
  currentPath.set(window.location.pathname);
});