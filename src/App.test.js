import { describe, it, expect, vi, beforeEach } from "vitest";
import { tick } from "svelte";
import App from "./App.svelte";
import { renderWithProviders } from "./test-utils";
import apiHelper from "./helpers/apiHelper";
import { usersStore } from "./features/users/states/usersStore";
import { linkTreesStore } from "./features/linktrees/states/linkTreesStore";
import { navigate } from "./router";

const mockProfile = { id: 1, name: "Abdullah", email: "a@del.ac.id", photo: null };

const mockLinkTree = {
  id: 5,
  user_id: 1,
  title: "Kursus Ku",
  type: "public",
  description: "Kumpulan kursus",
  cover: null,
  author: { name: "Abdullah" },
  items: [],
};

const renderAuthenticated = (route) => {
  vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
  vi.spyOn(usersStore, "asyncSetProfile").mockResolvedValue();
  vi.spyOn(usersStore, "asyncSetUsers").mockResolvedValue();
  vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockResolvedValue();
  vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockResolvedValue();

  return renderWithProviders(App, {
    route,
    preloadedState: { profile: mockProfile, linkTree: mockLinkTree },
  });
};

describe("App", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render the login page inside the auth layout", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);
    const { wrapper } = renderWithProviders(App, { route: "/auth/login" });

    expect(wrapper.text()).toContain("Masuk Akun");
    expect(wrapper.find('[data-testid="login-email-input"]').exists()).toBe(true);
  });

  it("should render the register page inside the auth layout", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);
    const { wrapper } = renderWithProviders(App, { route: "/auth/register" });

    expect(wrapper.text()).toContain("Daftar Baru");
    expect(wrapper.find('[data-testid="register-name-input"]').exists()).toBe(true);
  });

  it("should switch between auth pages when the route changes", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);
    const { wrapper } = renderWithProviders(App, { route: "/auth/login" });

    navigate("/auth/register");
    await tick();

    expect(wrapper.find('[data-testid="login-email-input"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="register-name-input"]').exists()).toBe(true);
  });

  it("should render the home page inside the link tree layout", () => {
    const { wrapper } = renderAuthenticated("/");

    expect(wrapper.find('[data-testid="add-link-tree-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="sidebar-menu-home"]').exists()).toBe(true);
  });

  it("should render the detail page with the id from the route", () => {
    const { wrapper } = renderAuthenticated("/link-trees/5");

    expect(wrapper.find('[data-testid="detail-title"]').text()).toBe("Kursus Ku");
  });

  it("should render the users page", () => {
    const { wrapper } = renderAuthenticated("/users");

    expect(wrapper.find('[data-testid="search-user-input"]').exists()).toBe(true);
  });

  it("should render the profile page", () => {
    const { wrapper } = renderAuthenticated("/profile");

    expect(wrapper.text()).toContain("Profil Akun");
  });

  it("should render the not found page without a layout for unknown routes", () => {
    const { wrapper } = renderWithProviders(App, { route: "/tidak-ada" });

    expect(wrapper.find('[data-testid="not-found-code"]').text()).toBe("404");
    expect(wrapper.find('[data-testid="sidebar-menu-home"]').exists()).toBe(false);
  });

  it("should keep showing the not found page when moving between unknown routes", async () => {
    const { wrapper } = renderWithProviders(App, { route: "/tidak-ada" });

    navigate("/juga-tidak-ada");
    await tick();

    expect(wrapper.find('[data-testid="not-found-code"]').text()).toBe("404");
  });

  it("should reload the detail page when moving to another link tree", async () => {
    const { wrapper } = renderAuthenticated("/link-trees/5");
    const loadSpy = linkTreesStore.asyncSetLinkTree;
    expect(loadSpy).toHaveBeenCalledTimes(1);

    navigate("/link-trees/6");
    await new Promise((r) => setTimeout(r, 10));

    expect(loadSpy).toHaveBeenLastCalledWith("6");
    expect(wrapper.text()).toContain("Link tree tidak ditemukan.");
  });
});