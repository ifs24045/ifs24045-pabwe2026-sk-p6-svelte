import { describe, it, expect, vi, beforeEach } from "vitest";
import AddModal from "./AddModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import { linkTreesStore } from "../states/linkTreesStore";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("AddModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render the add modal with an empty form", () => {
    const { wrapper } = renderWithProviders(AddModal, {
      props: { onClose: vi.fn() },
    });

    expect(wrapper.find('[data-testid="modal"]').element.getAttribute("aria-label")).toBe("Tambah Link Tree");
    expect(wrapper.find('[data-testid="link-tree-title-input"]').element.value).toBe("");
    expect(wrapper.find('[data-testid="link-tree-type-select"]').element.value).toBe("public");
    expect(wrapper.find('[data-testid="link-tree-description-input"]').element.value).toBe("");
    expect(wrapper.find('[data-testid="link-tree-submit-btn"]').text()).toContain("Tambah");
  });

  it("should post the link tree with trimmed values on submit", async () => {
    const postSpy = vi.spyOn(linkTreesStore, "asyncPostLinkTree").mockResolvedValue();
    const { wrapper } = renderWithProviders(AddModal, {
      props: { onClose: vi.fn() },
    });

    await wrapper.find('[data-testid="link-tree-title-input"]').setValue("  Kursus Ku  ");
    await wrapper.find('[data-testid="link-tree-type-select"]').setValue("unlisted");
    await wrapper.find('[data-testid="link-tree-description-input"]').setValue("  Kumpulan kursus  ");
    await wrapper.find("form").trigger("submit");

    expect(postSpy).toHaveBeenCalledWith("Kursus Ku", "unlisted", "Kumpulan kursus");
  });

  it("should not post when the form is invalid", async () => {
    const postSpy = vi.spyOn(linkTreesStore, "asyncPostLinkTree").mockResolvedValue();
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(AddModal, {
      props: { onClose: vi.fn() },
    });

    await wrapper.find("form").trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Judul tidak boleh kosong!");
    expect(postSpy).not.toHaveBeenCalled();
  });

  it("should call onClose from cancel button, close button, and backdrop", async () => {
    const onClose = vi.fn();
    const { wrapper } = renderWithProviders(AddModal, { props: { onClose } });

    await wrapper.find('[data-testid="link-tree-cancel-btn"]').trigger("click");
    await wrapper.find('[data-testid="modal-close-btn"]').trigger("click");
    await wrapper.find('[data-testid="modal-backdrop"]').trigger("click");

    expect(onClose).toHaveBeenCalledTimes(3);
  });
});