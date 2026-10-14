import { describe, it, expect, beforeEach } from "vitest";
import { get } from "svelte/store";
import { currentPath, navigate, resolveRoute } from "./router";

describe("router", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    currentPath.set("/");
  });

  describe("resolveRoute", () => {
    it("should resolve authentication routes to the auth layout", () => {
      expect(resolveRoute("/auth/login")).toEqual({ layout: "auth", page: "login", params: {} });
      expect(resolveRoute("/auth/register/")).toEqual({ layout: "auth", page: "register", params: {} });
    });

    it("should resolve the home route to the app layout", () => {
      expect(resolveRoute("/")).toEqual({ layout: "app", page: "home", params: {} });
      expect(resolveRoute("")).toEqual({ layout: "app", page: "home", params: {} });
    });

    it("should resolve the detail route and extract linkTreeId", () => {
      expect(resolveRoute("/link-trees/12")).toEqual({
        layout: "app",
        page: "detail",
        params: { linkTreeId: "12" },
      });
    });

    it("should resolve users and profile routes to the app layout", () => {
      expect(resolveRoute("/users")).toEqual({ layout: "app", page: "users", params: {} });
      expect(resolveRoute("/profile")).toEqual({ layout: "app", page: "profile", params: {} });
    });

    it("should resolve unknown paths to the not found page without a layout", () => {
      expect(resolveRoute("/tidak-ada")).toEqual({ layout: "none", page: "notfound", params: {} });
      expect(resolveRoute("/link-trees")).toEqual({ layout: "none", page: "notfound", params: {} });
      expect(resolveRoute("/link-trees/1/extra")).toEqual({ layout: "none", page: "notfound", params: {} });
    });
  });

  describe("navigate", () => {
    it("should push the path to the history and update currentPath", () => {
      navigate("/users");

      expect(window.location.pathname).toBe("/users");
      expect(get(currentPath)).toBe("/users");
    });

    it("should update currentPath when the browser goes back", () => {
      navigate("/users");
      navigate("/profile");

      window.history.pushState({}, "", "/auth/login");
      window.dispatchEvent(new PopStateEvent("popstate"));

      expect(get(currentPath)).toBe("/auth/login");
    });
  });
});