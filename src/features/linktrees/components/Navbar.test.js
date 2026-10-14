import { describe, it, expect, vi, beforeEach } from "vitest";
import Navbar from "./Navbar.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as routerModule from "../../../router";

describe("Navbar", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render brand and profile name with initial avatar fallback", () => {
    const { wrapper } = renderWithProviders(Navbar, {
      props: { onToggleSidebar: vi.fn() },
      preloadedState: {
        profile: { id: 1, name: "Abdullah", email: "a@del.ac.id", photo: null },
      },
    });

    expect(wrapper.text()).toContain("Delcom Link Tree");
    expect(wrapper.text()).toContain("Abdullah");
    expect(wrapper.text()).toContain("A");
    expect(wrapper.find("img").exists()).toBe(false);
  });

  it("should render profile photo when available", () => {
    const { wrapper } = renderWithProviders(Navbar, {
      props: { onToggleSidebar: vi.fn() },
      preloadedState: {
        profile: {
          id: 1,
          name: "Abdullah",
          photo: "https://example.com/photo.jpg",
        },
      },
    });

    const img = wrapper.find("img");
    expect(img.exists()).toBe(true);
    expect(img.element.getAttribute("src")).toBe("https://example.com/photo.jpg");
  });

  it("should use fallback name when profile is null", () => {
    const { wrapper } = renderWithProviders(Navbar, {
      props: { onToggleSidebar: vi.fn() },
      preloadedState: { profile: null },
    });

    expect(wrapper.text()).toContain("Pengguna");
    expect(wrapper.text()).toContain("P");
  });

  it("should use fallback name when profile name is empty", () => {
    const { wrapper } = renderWithProviders(Navbar, {
      props: { onToggleSidebar: vi.fn() },
      preloadedState: { profile: { id: 3, name: "", photo: null } },
    });

    expect(wrapper.text()).toContain("Pengguna");
  });

  it("should call onToggleSidebar when menu button is clicked", async () => {
    const onToggleSidebar = vi.fn();
    const { wrapper } = renderWithProviders(Navbar, {
      props: { onToggleSidebar },
    });

    await wrapper.find('[data-testid="toggle-sidebar-btn"]').trigger("click");

    expect(onToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it("should navigate to home when brand is clicked", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(Navbar, {
      props: { onToggleSidebar: vi.fn() },
    });

    await wrapper.find('[data-testid="navbar-brand"]').trigger("click");

    expect(navSpy).toHaveBeenCalledWith("/");
  });

  it("should navigate to profile when profile button is clicked", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(Navbar, {
      props: { onToggleSidebar: vi.fn() },
      preloadedState: { profile: { id: 1, name: "Abdullah", photo: null } },
    });

    await wrapper.find('[data-testid="navbar-profile-btn"]').trigger("click");

    expect(navSpy).toHaveBeenCalledWith("/profile");
  });

  it("should logout when the confirmation dialog is accepted", async () => {
    const confirmSpy = vi
      .spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValue({ isConfirmed: true });
    const { wrapper, authStore } = renderWithProviders(Navbar, {
      props: { onToggleSidebar: vi.fn() },
    });
    const logoutSpy = vi
      .spyOn(authStore, "asyncSetIsAuthLogout")
      .mockResolvedValue();

    await wrapper.find('[data-testid="logout-btn"]').trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(confirmSpy).toHaveBeenCalledWith("Apakah Anda yakin ingin keluar dari akun?");
    expect(logoutSpy).toHaveBeenCalledTimes(1);
  });

  it("should not logout when the confirmation dialog is cancelled", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({
      isConfirmed: false,
    });
    const { wrapper, authStore } = renderWithProviders(Navbar, {
      props: { onToggleSidebar: vi.fn() },
    });
    const logoutSpy = vi
      .spyOn(authStore, "asyncSetIsAuthLogout")
      .mockResolvedValue();

    await wrapper.find('[data-testid="logout-btn"]').trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(logoutSpy).not.toHaveBeenCalled();
  });
});