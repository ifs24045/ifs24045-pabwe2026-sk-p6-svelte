import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRawSnippet } from "svelte";
import LinkTreeLayout from "./LinkTreeLayout.svelte";
import { renderWithProviders } from "../../../test-utils";
import apiHelper from "../../../helpers/apiHelper";
import { usersStore } from "../../users/states/usersStore";
import * as routerModule from "../../../router";

const children = createRawSnippet(() => ({
  render: () => '<p data-testid="slot-content">Konten Halaman</p>',
}));

const mockProfile = { id: 1, name: "Abdullah", email: "a@del.ac.id", photo: null };

describe("LinkTreeLayout", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should redirect to login when there is no access token", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const profileSpy = vi.spyOn(usersStore, "asyncSetProfile").mockResolvedValue();

    renderWithProviders(LinkTreeLayout, {
      props: { children, $$slots: { default: true } },
      preloadedState: { profile: null },
    });

    expect(navSpy).toHaveBeenCalledWith("/auth/login");
    expect(profileSpy).not.toHaveBeenCalled();
  });

  it("should fetch profile and show loading while profile is not available", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const profileSpy = vi.spyOn(usersStore, "asyncSetProfile").mockResolvedValue();

    const { wrapper } = renderWithProviders(LinkTreeLayout, {
      props: { children, $$slots: { default: true } },
      preloadedState: { profile: null },
    });

    expect(profileSpy).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain("Memuat data pengguna...");
    expect(wrapper.find('[data-testid="slot-content"]').exists()).toBe(false);
  });

  it("should render navbar, sidebar, and content without refetching when profile exists", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    const profileSpy = vi.spyOn(usersStore, "asyncSetProfile").mockResolvedValue();

    const { wrapper } = renderWithProviders(LinkTreeLayout, {
      props: { children, $$slots: { default: true } },
      preloadedState: { profile: mockProfile },
    });

    expect(profileSpy).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Delcom Link Tree");
    expect(wrapper.text()).toContain("Semua Link Tree");
    expect(wrapper.text()).toContain("Abdullah");
    expect(wrapper.find('[data-testid="slot-content"]').exists()).toBe(true);
    expect(wrapper.text()).not.toContain("Memuat data pengguna...");
  });

  it("should clear token and redirect to login when profile fetch fails", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("expired-token");
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const tokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});
    vi.spyOn(usersStore, "asyncSetProfile").mockResolvedValue();

    renderWithProviders(LinkTreeLayout, {
      props: { children, $$slots: { default: true } },
      preloadedState: { profile: null },
    });

    usersStore.setIsProfile(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(tokenSpy).toHaveBeenCalledWith("");
    expect(navSpy).toHaveBeenCalledWith("/auth/login");
    expect(usersStore.isProfile).toBe(false);
  });

  it("should stay on the page when profile fetch succeeds", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const tokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});

    renderWithProviders(LinkTreeLayout, {
      props: { children, $$slots: { default: true } },
      preloadedState: { profile: mockProfile },
    });

    usersStore.setIsProfile(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(navSpy).not.toHaveBeenCalled();
    expect(tokenSpy).not.toHaveBeenCalled();
    expect(usersStore.isProfile).toBe(false);
  });

  it("should clear profile and redirect to login after logout", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { authStore } = renderWithProviders(LinkTreeLayout, {
      props: { children, $$slots: { default: true } },
      preloadedState: { profile: mockProfile },
    });

    authStore.setIsAuthLogout(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(usersStore.profile).toBeNull();
    expect(authStore.isAuthLogout).toBe(false);
    expect(navSpy).toHaveBeenCalledWith("/auth/login");
  });

  it("should toggle the sidebar from the navbar and close it from the overlay", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    const { wrapper } = renderWithProviders(LinkTreeLayout, {
      props: { children, $$slots: { default: true } },
      preloadedState: { profile: mockProfile },
    });

    expect(wrapper.find('[data-testid="sidebar-overlay"]').exists()).toBe(false);

    await wrapper.find('[data-testid="toggle-sidebar-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="sidebar-overlay"]').exists()).toBe(true);

    await wrapper.find('[data-testid="sidebar-overlay"]').trigger("click");
    expect(wrapper.find('[data-testid="sidebar-overlay"]').exists()).toBe(false);
  });
});