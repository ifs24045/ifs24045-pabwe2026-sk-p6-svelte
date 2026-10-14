import { describe, it, expect, vi, beforeEach } from "vitest";
import { tick } from "svelte";
import DetailPage from "./DetailPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import { linkTreesStore } from "../states/linkTreesStore";
import { usersStore } from "../../users/states/usersStore";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as routerModule from "../../../router";

const mockLinkTree = {
  id: 7,
  user_id: 1,
  title: "Kursus Ku",
  type: "public",
  description: "Kumpulan kursus",
  cover: "https://example.com/cover.jpg",
  author: { name: "Abdullah" },
  items: [
    { id: 3, link_tree_id: 7, title: "Dasar Java", url: "https://youtu.be/uHyfQV0kbgo" },
    { id: 4, link_tree_id: 7, title: "Dasar Svelte", url: "https://svelte.dev" },
  ],
};

const mockProfile = { id: 1, name: "Abdullah", email: "a@del.ac.id", photo: null };

const renderPage = ({
  linkTree = mockLinkTree,
  profile = mockProfile,
  linkTreeId = 7,
} = {}) => {
  linkTreesStore.reset({ linkTree });
  usersStore.setProfile(profile);
  return renderWithProviders(DetailPage, { props: { linkTreeId } });
};

describe("DetailPage", () => {
  let loadSpy;
  let navSpy;

  beforeEach(() => {
    vi.restoreAllMocks();
    linkTreesStore.reset();
    usersStore.setProfile(null);
    loadSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockResolvedValue();
    navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
  });

  it("should load the link tree by id and show a loading indicator", async () => {
    loadSpy.mockReturnValue(new Promise(() => {}));
    const { wrapper } = renderPage({ linkTree: null });
    await tick();

    expect(loadSpy).toHaveBeenCalledWith(7);
    expect(wrapper.text()).toContain("Memuat detail link tree...");
  });

  it("should show not found when the link tree is missing or belongs to another id", async () => {
    const { wrapper } = renderPage({ linkTree: null });
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.text()).toContain("Link tree tidak ditemukan.");

    const other = renderPage({ linkTreeId: 99 });
    await new Promise((r) => setTimeout(r, 10));
    expect(other.wrapper.text()).toContain("Link tree tidak ditemukan.");
  });

  it("should go back to the home page", async () => {
    const { wrapper } = renderPage();

    await wrapper.find('[data-testid="back-btn"]').trigger("click");

    expect(navSpy).toHaveBeenCalledWith("/");
  });

  it("should render detail, cover, and items with external links", () => {
    const { wrapper } = renderPage({ linkTreeId: "7" });

    expect(wrapper.find('[data-testid="detail-title"]').text()).toBe("Kursus Ku");
    expect(wrapper.find('[data-testid="detail-type"]').text()).toBe("Publik");
    expect(wrapper.find('[data-testid="detail-author"]').text()).toBe("Oleh Abdullah");
    expect(wrapper.find('[data-testid="detail-description"]').text()).toBe("Kumpulan kursus");
    expect(wrapper.find('[data-testid="detail-cover"]').exists()).toBe(true);

    const link = wrapper.find('[data-testid="item-link-3"]').element;
    expect(link.getAttribute("href")).toBe("https://youtu.be/uHyfQV0kbgo");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(wrapper.find('[data-testid="item-4"]').text()).toContain("Dasar Svelte");
  });

  it("should render fallback cover, placeholder description, and empty items", () => {
    const { wrapper } = renderPage({
      linkTree: { ...mockLinkTree, type: "private", cover: "http://localhost:8000/", description: null, items: [] },
    });

    expect(wrapper.find('[data-testid="detail-cover-fallback"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="detail-type"]').text()).toBe("Privat");
    expect(wrapper.find('[data-testid="detail-description"]').text()).toBe("-");
    expect(wrapper.find('[data-testid="items-empty"]').exists()).toBe(true);
  });

  it("should update the page when the link tree data changes", async () => {
    const { wrapper } = renderPage();

    linkTreesStore.setLinkTree({ ...mockLinkTree, title: "Judul Baru", items: [mockLinkTree.items[0]] });
    await tick();

    expect(wrapper.find('[data-testid="detail-title"]').text()).toBe("Judul Baru");
    expect(wrapper.find('[data-testid="item-4"]').exists()).toBe(false);
  });

  it("should hide owner actions for other users and when the profile is missing", () => {
    const stranger = renderPage({ profile: { ...mockProfile, id: 2 } });
    expect(stranger.wrapper.find('[data-testid="change-btn"]').exists()).toBe(false);
    expect(stranger.wrapper.find('[data-testid="add-item-btn"]').exists()).toBe(false);
    expect(stranger.wrapper.find('[data-testid="item-edit-3"]').exists()).toBe(false);

    const anonymous = renderPage({ profile: null });
    expect(anonymous.wrapper.find('[data-testid="delete-link-tree-btn"]').exists()).toBe(false);
  });

  it("should open and close the change data modal", async () => {
    const { wrapper } = renderPage();

    await wrapper.find('[data-testid="change-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="modal"]').element.getAttribute("aria-label")).toBe("Ubah Link Tree");

    await wrapper.find('[data-testid="modal-close-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="modal"]').exists()).toBe(false);
  });

  it("should open and close the change cover modal", async () => {
    const { wrapper } = renderPage();

    await wrapper.find('[data-testid="change-cover-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="modal"]').element.getAttribute("aria-label")).toBe("Ubah Sampul");

    await wrapper.find('[data-testid="modal-close-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="modal"]').exists()).toBe(false);
  });

  it("should open the item modal in add mode and in edit mode, then close it", async () => {
    const { wrapper } = renderPage();

    await wrapper.find('[data-testid="add-item-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="modal"]').element.getAttribute("aria-label")).toBe("Tambah Tautan");
    expect(wrapper.find('[data-testid="item-title-input"]').element.value).toBe("");

    await wrapper.find('[data-testid="item-cancel-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="modal"]').exists()).toBe(false);

    await wrapper.find('[data-testid="item-edit-4"]').trigger("click");
    expect(wrapper.find('[data-testid="modal"]').element.getAttribute("aria-label")).toBe("Ubah Tautan");
    expect(wrapper.find('[data-testid="item-title-input"]').element.value).toBe("Dasar Svelte");
  });

  it("should close the change modal, reset the flag, and reload after a successful change", async () => {
    const { wrapper } = renderPage();
    await wrapper.find('[data-testid="change-btn"]').trigger("click");

    linkTreesStore.setIsChangeLinkTree(true);
    await tick();

    expect(wrapper.find('[data-testid="modal"]').exists()).toBe(false);
    expect(linkTreesStore.isChangeLinkTree).toBe(false);
    expect(loadSpy).toHaveBeenCalledTimes(2);
  });

  it("should close the cover modal, reset the flag, and reload after a successful cover change", async () => {
    const { wrapper } = renderPage();
    await wrapper.find('[data-testid="change-cover-btn"]').trigger("click");

    linkTreesStore.setIsChangeCoverLinkTree(true);
    await tick();

    expect(wrapper.find('[data-testid="modal"]').exists()).toBe(false);
    expect(linkTreesStore.isChangeCoverLinkTree).toBe(false);
    expect(loadSpy).toHaveBeenCalledTimes(2);
  });

  it("should close the item modal and reload after adding an item", async () => {
    const { wrapper } = renderPage();
    await wrapper.find('[data-testid="add-item-btn"]').trigger("click");

    linkTreesStore.setIsAddItem(true);
    await tick();

    expect(wrapper.find('[data-testid="modal"]').exists()).toBe(false);
    expect(linkTreesStore.isAddItem).toBe(false);
    expect(loadSpy).toHaveBeenCalledTimes(2);
  });

  it("should close the item modal and reload after changing an item", async () => {
    const { wrapper } = renderPage();
    await wrapper.find('[data-testid="item-edit-3"]').trigger("click");

    linkTreesStore.setIsChangeItem(true);
    await tick();

    expect(wrapper.find('[data-testid="modal"]').exists()).toBe(false);
    expect(linkTreesStore.isChangeItem).toBe(false);
    expect(loadSpy).toHaveBeenCalledTimes(2);
  });

  it("should reload after deleting an item", async () => {
    renderPage();

    linkTreesStore.setIsDeleteItem(true);
    await tick();

    expect(linkTreesStore.isDeleteItem).toBe(false);
    expect(loadSpy).toHaveBeenCalledTimes(2);
  });

  it("should delete an item only after confirmation", async () => {
    const confirmSpy = vi
      .spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValueOnce({ isConfirmed: false })
      .mockResolvedValueOnce({ isConfirmed: true });
    const deleteSpy = vi.spyOn(linkTreesStore, "asyncDeleteItem").mockResolvedValue();
    const { wrapper } = renderPage();
    const button = wrapper.find('[data-testid="item-delete-3"]');

    await button.trigger("click");
    await new Promise((r) => setTimeout(r, 10));
    expect(deleteSpy).not.toHaveBeenCalled();

    await button.trigger("click");
    await new Promise((r) => setTimeout(r, 10));
    expect(confirmSpy).toHaveBeenCalledWith('Hapus tautan "Dasar Java"?');
    expect(deleteSpy).toHaveBeenCalledWith(7, 3);
  });

  it("should delete the link tree only after confirmation", async () => {
    const confirmSpy = vi
      .spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValueOnce({ isConfirmed: false })
      .mockResolvedValueOnce({ isConfirmed: true });
    const deleteSpy = vi.spyOn(linkTreesStore, "asyncDeleteLinkTree").mockResolvedValue();
    const { wrapper } = renderPage();
    const button = wrapper.find('[data-testid="delete-link-tree-btn"]');

    await button.trigger("click");
    await new Promise((r) => setTimeout(r, 10));
    expect(deleteSpy).not.toHaveBeenCalled();

    await button.trigger("click");
    await new Promise((r) => setTimeout(r, 10));
    expect(confirmSpy).toHaveBeenCalledWith('Hapus link tree "Kursus Ku" beserta seluruh tautannya?');
    expect(deleteSpy).toHaveBeenCalledWith(7);
  });

  it("should reset the flag and go back home after the link tree is deleted", async () => {
    renderPage();

    linkTreesStore.setIsDeleteLinkTree(true);
    await tick();

    expect(linkTreesStore.isDeleteLinkTree).toBe(false);
    expect(navSpy).toHaveBeenCalledWith("/");
  });
});