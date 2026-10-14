import { describe, it, expect, vi, beforeEach } from "vitest";
import Sidebar from "./Sidebar.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as routerModule from "../../../router";

describe("Sidebar", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render all menu items", () => {
    const { wrapper } = renderWithProviders(Sidebar, {
      props: { onClose: vi.fn() },
    });

    expect(wrapper.text()).toContain("Semua Link Tree");
    expect(wrapper.text()).toContain("Semua Pengguna");
    expect(wrapper.text()).toContain("Profil Saya");
  });

  it("should mark Semua Link Tree as active on home route", () => {
    const { wrapper } = renderWithProviders(Sidebar, {
      route: "/",
      props: { onClose: vi.fn() },
    });

    const home = wrapper.find('[data-testid="sidebar-menu-home"]');
    const users = wrapper.find('[data-testid="sidebar-menu-users"]');
    const profile = wrapper.find('[data-testid="sidebar-menu-profile"]');

    expect(home.element.getAttribute("aria-current")).toBe("page");
    expect(users.element.getAttribute("aria-current")).toBeNull();
    expect(profile.element.getAttribute("aria-current")).toBeNull();
  });

  it("should keep Semua Link Tree active on link tree detail route", () => {
    const { wrapper } = renderWithProviders(Sidebar, {
      route: "/link-trees/5",
      props: { onClose: vi.fn() },
    });

    const home = wrapper.find('[data-testid="sidebar-menu-home"]');
    expect(home.element.getAttribute("aria-current")).toBe("page");
  });

  it("should mark Semua Pengguna as active on users route", () => {
    const { wrapper } = renderWithProviders(Sidebar, {
      route: "/users",
      props: { onClose: vi.fn() },
    });

    const home = wrapper.find('[data-testid="sidebar-menu-home"]');
    const users = wrapper.find('[data-testid="sidebar-menu-users"]');

    expect(users.element.getAttribute("aria-current")).toBe("page");
    expect(home.element.getAttribute("aria-current")).toBeNull();
  });

  it("should mark Profil Saya as active on profile route", () => {
    const { wrapper } = renderWithProviders(Sidebar, {
      route: "/profile",
      props: { onClose: vi.fn() },
    });

    const profile = wrapper.find('[data-testid="sidebar-menu-profile"]');
    expect(profile.element.getAttribute("aria-current")).toBe("page");
  });

  it("should navigate and close the sidebar when a menu is clicked", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const onClose = vi.fn();
    const { wrapper } = renderWithProviders(Sidebar, {
      props: { onClose },
    });

    await wrapper.find('[data-testid="sidebar-menu-users"]').trigger("click");

    expect(navSpy).toHaveBeenCalledWith("/users");
    expect(onClose).toHaveBeenCalledTimes(1);

    await wrapper.find('[data-testid="sidebar-menu-profile"]').trigger("click");

    expect(navSpy).toHaveBeenCalledWith("/profile");
    expect(onClose).toHaveBeenCalledTimes(2);

    await wrapper.find('[data-testid="sidebar-menu-home"]').trigger("click");

    expect(navSpy).toHaveBeenCalledWith("/");
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("should be hidden off-screen and without overlay by default", () => {
    const { wrapper } = renderWithProviders(Sidebar, {
      props: { onClose: vi.fn() },
    });

    expect(wrapper.find('[data-testid="sidebar-overlay"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="sidebar"]').element.className).toContain(
      "-translate-x-full"
    );
  });

  it("should show overlay and slide in when open, and close from overlay and close button", async () => {
    const onClose = vi.fn();
    const { wrapper } = renderWithProviders(Sidebar, {
      props: { isOpen: true, onClose },
    });

    const sidebar = wrapper.find('[data-testid="sidebar"]');
    expect(sidebar.element.className).not.toContain("-translate-x-full");
    expect(wrapper.find('[data-testid="sidebar-overlay"]').exists()).toBe(true);

    await wrapper.find('[data-testid="sidebar-overlay"]').trigger("click");
    expect(onClose).toHaveBeenCalledTimes(1);

    await wrapper.find('[data-testid="sidebar-close-btn"]').trigger("click");
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});