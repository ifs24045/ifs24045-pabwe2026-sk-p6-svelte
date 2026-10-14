import { describe, it, expect, vi, beforeEach } from "vitest";
import { tick } from "svelte";
import HomePage from "./HomePage.svelte";
import { renderWithProviders } from "../../../test-utils";
import { linkTreesStore } from "../states/linkTreesStore";
import { usersStore } from "../../users/states/usersStore";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as routerModule from "../../../router";

const mockLinkTrees = [
  {
    id: 1,
    user_id: 1,
    title: "Kursus Ku",
    type: "public",
    description: "Kumpulan kursus",
    cover: "http://localhost:8000/",
    author: { name: "Abdullah" },
    total_links: 2,
  },
  {
    id: 2,
    user_id: 2,
    title: "Resep Masak",
    type: "unlisted",
    description: null,
    cover: "https://example.com/cover.jpg",
    author: { name: "Ubaid" },
    total_links: 3,
  },
  {
    id: 3,
    user_id: 2,
    title: "Catatan",
    type: "private",
    description: "Rahasia",
    cover: null,
    author: { name: "Ubaid" },
    total_links: 0,
  },
];

const mockProfile = { id: 1, name: "Abdullah", email: "a@del.ac.id", photo: null };

const renderPage = ({ linkTrees = mockLinkTrees, profile = mockProfile, ...state } = {}) => {
  linkTreesStore.reset({ linkTrees, ...state });
  usersStore.setProfile(profile);
  return renderWithProviders(HomePage);
};

describe("HomePage", () => {
  let loadSpy;

  beforeEach(() => {
    vi.restoreAllMocks();
    linkTreesStore.reset();
    usersStore.setProfile(null);
    loadSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockResolvedValue();
  });

  it("should load all link trees on mount and show a loading indicator", async () => {
    loadSpy.mockReturnValue(new Promise(() => {}));
    const { wrapper } = renderPage({ linkTrees: [] });
    await tick();

    expect(loadSpy).toHaveBeenCalledWith(false);
    expect(wrapper.text()).toContain("Memuat daftar link tree...");
  });

  it("should show the empty state when there are no link trees", async () => {
    const { wrapper } = renderPage({ linkTrees: [] });
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.text()).toContain("Tidak ada link tree ditemukan.");
    expect(wrapper.find('[data-testid="stat-total"]').text()).toBe("0");
    expect(wrapper.find('[data-testid="delete-all-btn"]').exists()).toBe(false);
  });

  it("should render cards, statistics, type badges, and cover fallbacks", () => {
    const { wrapper } = renderPage();

    expect(wrapper.find('[data-testid="stat-total"]').text()).toBe("3");
    expect(wrapper.find('[data-testid="stat-public"]').text()).toBe("1");
    expect(wrapper.find('[data-testid="stat-unlisted"]').text()).toBe("1");
    expect(wrapper.find('[data-testid="stat-private"]').text()).toBe("1");
    expect(wrapper.find('[data-testid="stat-links"]').text()).toBe("5");

    expect(wrapper.find('[data-testid="link-tree-type-1"]').text()).toBe("Publik");
    expect(wrapper.find('[data-testid="link-tree-type-2"]').text()).toBe("Tidak Terdaftar");
    expect(wrapper.find('[data-testid="link-tree-type-3"]').text()).toBe("Privat");

    expect(wrapper.find('[data-testid="link-tree-cover-fallback-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="link-tree-cover-2"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="link-tree-cover-fallback-3"]').exists()).toBe(true);

    expect(wrapper.find('[data-testid="link-tree-card-2"]').text()).toContain("Ubaid · 3 tautan");
    expect(wrapper.find('[data-testid="link-tree-card-2"]').text()).toContain("-");
  });

  it("should update a card when the link tree data changes", async () => {
    const { wrapper } = renderPage();

    linkTreesStore.setLinkTrees([{ ...mockLinkTrees[0], total_links: 9 }, mockLinkTrees[1]]);
    await tick();

    expect(wrapper.find('[data-testid="link-tree-card-1"]').text()).toContain("Abdullah · 9 tautan");
    expect(wrapper.find('[data-testid="link-tree-card-3"]').exists()).toBe(false);
  });

  it("should filter link trees by title or description", async () => {
    const { wrapper } = renderPage();
    const search = wrapper.find('[data-testid="search-input"]');

    await search.setValue("resep");
    expect(wrapper.find('[data-testid="link-tree-card-2"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="link-tree-card-1"]').exists()).toBe(false);

    await search.setValue("rahasia");
    expect(wrapper.find('[data-testid="link-tree-card-3"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="link-tree-card-2"]').exists()).toBe(false);

    await search.setValue("tidak ada");
    expect(wrapper.text()).toContain("Tidak ada link tree ditemukan.");

    await search.setValue("   ");
    expect(wrapper.find('[data-testid="link-tree-card-1"]').exists()).toBe(true);
  });

  it("should reload with the own-data filter when the checkbox is toggled", async () => {
    const { wrapper } = renderPage();

    await wrapper.find('[data-testid="filter-mine-checkbox"]').trigger("click");

    expect(loadSpy).toHaveBeenNthCalledWith(1, false);
    expect(loadSpy).toHaveBeenNthCalledWith(2, true);
  });

  it("should navigate to the detail page when a card is opened", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const { wrapper } = renderPage();

    await wrapper.find('[data-testid="link-tree-open-2"]').trigger("click");

    expect(navSpy).toHaveBeenCalledWith("/link-trees/2");
  });

  it("should show delete buttons only on link trees owned by the user", () => {
    const { wrapper } = renderPage();

    expect(wrapper.find('[data-testid="link-tree-delete-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="link-tree-delete-2"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="delete-all-btn"]').exists()).toBe(true);
  });

  it("should not show owner actions when the profile is not loaded", () => {
    const { wrapper } = renderPage({ profile: null });

    expect(wrapper.find('[data-testid="link-tree-delete-1"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="delete-all-btn"]').exists()).toBe(false);
  });

  it("should delete a link tree only after confirmation", async () => {
    const confirmSpy = vi
      .spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValueOnce({ isConfirmed: false })
      .mockResolvedValueOnce({ isConfirmed: true });
    const deleteSpy = vi.spyOn(linkTreesStore, "asyncDeleteLinkTree").mockResolvedValue();
    const { wrapper } = renderPage();
    const button = wrapper.find('[data-testid="link-tree-delete-1"]');

    await button.trigger("click");
    await new Promise((r) => setTimeout(r, 10));
    expect(deleteSpy).not.toHaveBeenCalled();

    await button.trigger("click");
    await new Promise((r) => setTimeout(r, 10));
    expect(confirmSpy).toHaveBeenCalledWith('Hapus link tree "Kursus Ku"?');
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });

  it("should delete all link trees only after confirmation", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValueOnce({ isConfirmed: false })
      .mockResolvedValueOnce({ isConfirmed: true });
    const deleteAllSpy = vi.spyOn(linkTreesStore, "asyncDeleteAllLinkTrees").mockResolvedValue();
    const { wrapper } = renderPage();
    const button = wrapper.find('[data-testid="delete-all-btn"]');

    await button.trigger("click");
    await new Promise((r) => setTimeout(r, 10));
    expect(deleteAllSpy).not.toHaveBeenCalled();

    await button.trigger("click");
    await new Promise((r) => setTimeout(r, 10));
    expect(deleteAllSpy).toHaveBeenCalledTimes(1);
  });

  it("should open and close the add modal", async () => {
    const { wrapper } = renderPage();
    expect(wrapper.find('[data-testid="modal"]').exists()).toBe(false);

    await wrapper.find('[data-testid="add-link-tree-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="modal"]').exists()).toBe(true);

    await wrapper.find('[data-testid="modal-close-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="modal"]').exists()).toBe(false);
  });

  it("should close the add modal, reset the flag, and reload after a successful add", async () => {
    const { wrapper } = renderPage();
    await wrapper.find('[data-testid="add-link-tree-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="modal"]').exists()).toBe(true);

    linkTreesStore.setIsAddLinkTree(true);
    await tick();

    expect(wrapper.find('[data-testid="modal"]').exists()).toBe(false);
    expect(linkTreesStore.isAddLinkTree).toBe(false);
    expect(loadSpy).toHaveBeenCalledTimes(2);
  });

  it("should reset the flag and reload after a successful delete", async () => {
    renderPage();

    linkTreesStore.setIsDeleteLinkTree(true);
    await tick();

    expect(linkTreesStore.isDeleteLinkTree).toBe(false);
    expect(loadSpy).toHaveBeenCalledTimes(2);
  });

  it("should reset the flag and reload after deleting all link trees", async () => {
    renderPage();

    linkTreesStore.setIsDeleteAllLinkTrees(true);
    await tick();

    expect(linkTreesStore.isDeleteAllLinkTrees).toBe(false);
    expect(loadSpy).toHaveBeenCalledTimes(2);
  });
});