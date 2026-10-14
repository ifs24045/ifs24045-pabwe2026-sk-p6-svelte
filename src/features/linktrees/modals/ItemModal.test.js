import { describe, it, expect, vi, beforeEach } from "vitest";
import ItemModal from "./ItemModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import { linkTreesStore } from "../states/linkTreesStore";
import * as toolsHelper from "../../../helpers/toolsHelper";

const linkTree = { id: 7, title: "Kursus Ku" };
const item = { id: 3, link_tree_id: 7, title: "Dasar Java", url: "https://youtu.be/uHyfQV0kbgo" };

const renderModal = (props = {}) =>
  renderWithProviders(ItemModal, {
    props: { linkTree, onClose: vi.fn(), ...props },
  });

const fillForm = async (wrapper, title, url) => {
  await wrapper.find('[data-testid="item-title-input"]').setValue(title);
  await wrapper.find('[data-testid="item-url-input"]').setValue(url);
};

describe("ItemModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render add mode with an empty form", () => {
    const { wrapper } = renderModal();

    expect(wrapper.find('[data-testid="modal"]').element.getAttribute("aria-label")).toBe("Tambah Tautan");
    expect(wrapper.find('[data-testid="item-title-input"]').element.value).toBe("");
    expect(wrapper.find('[data-testid="item-url-input"]').element.value).toBe("");
    expect(wrapper.find('[data-testid="item-submit-btn"]').text()).toBe("Tambah");
  });

  it("should render edit mode prefilled with item data", () => {
    const { wrapper } = renderModal({ item });

    expect(wrapper.find('[data-testid="modal"]').element.getAttribute("aria-label")).toBe("Ubah Tautan");
    expect(wrapper.find('[data-testid="item-title-input"]').element.value).toBe("Dasar Java");
    expect(wrapper.find('[data-testid="item-url-input"]').element.value).toBe("https://youtu.be/uHyfQV0kbgo");
    expect(wrapper.find('[data-testid="item-submit-btn"]').text()).toBe("Simpan");
  });

  it("should reject an empty title", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const postSpy = vi.spyOn(linkTreesStore, "asyncPostItem").mockResolvedValue();
    const { wrapper } = renderModal();

    await fillForm(wrapper, "   ", "https://delcom.org");
    await wrapper.find("form").trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Judul tautan tidak boleh kosong!");
    expect(postSpy).not.toHaveBeenCalled();
  });

  it("should reject text that is not a URL and URLs that are not http or https", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const postSpy = vi.spyOn(linkTreesStore, "asyncPostItem").mockResolvedValue();
    const { wrapper } = renderModal();
    const message = "URL tidak valid! Gunakan format https://contoh.com";

    await fillForm(wrapper, "Judul", "bukan url");
    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenLastCalledWith(message);

    await fillForm(wrapper, "Judul", "ftp://delcom.org");
    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledTimes(2);
    expect(errorSpy).toHaveBeenLastCalledWith(message);

    expect(postSpy).not.toHaveBeenCalled();
  });

  it("should post a new item with trimmed values in add mode", async () => {
    const postSpy = vi.spyOn(linkTreesStore, "asyncPostItem").mockResolvedValue();
    const putSpy = vi.spyOn(linkTreesStore, "asyncPutItem").mockResolvedValue();
    const { wrapper } = renderModal();

    await fillForm(wrapper, "  Dasar Java  ", "  https://delcom.org  ");
    await wrapper.find("form").trigger("submit");

    expect(postSpy).toHaveBeenCalledWith(7, "Dasar Java", "https://delcom.org");
    expect(putSpy).not.toHaveBeenCalled();
  });

  it("should put the item in edit mode", async () => {
    const postSpy = vi.spyOn(linkTreesStore, "asyncPostItem").mockResolvedValue();
    const putSpy = vi.spyOn(linkTreesStore, "asyncPutItem").mockResolvedValue();
    const { wrapper } = renderModal({ item });

    await wrapper.find('[data-testid="item-title-input"]').setValue("Java Lanjut");
    await wrapper.find("form").trigger("submit");

    expect(putSpy).toHaveBeenCalledWith(7, 3, "Java Lanjut", "https://youtu.be/uHyfQV0kbgo");
    expect(postSpy).not.toHaveBeenCalled();
  });

  it("should show loading state while the request is pending", async () => {
    let resolvePost;
    vi.spyOn(linkTreesStore, "asyncPostItem").mockReturnValue(
      new Promise((resolve) => {
        resolvePost = resolve;
      })
    );
    const { wrapper } = renderModal();

    await fillForm(wrapper, "Judul", "https://delcom.org");
    await wrapper.find("form").trigger("submit");

    expect(wrapper.text()).toContain("Menyimpan...");
    expect(wrapper.find('[data-testid="item-submit-btn"]').element.disabled).toBe(true);

    resolvePost();
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.text()).not.toContain("Menyimpan...");
    expect(wrapper.find('[data-testid="item-submit-btn"]').element.disabled).toBe(false);
  });

  it("should call onClose when cancel is clicked", async () => {
    const onClose = vi.fn();
    const { wrapper } = renderModal({ onClose });

    await wrapper.find('[data-testid="item-cancel-btn"]').trigger("click");

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});