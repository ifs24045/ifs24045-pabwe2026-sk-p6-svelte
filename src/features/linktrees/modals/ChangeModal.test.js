import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeModal from "./ChangeModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import { linkTreesStore } from "../states/linkTreesStore";

const linkTree = {
  id: 7,
  title: "Kursus Ku",
  type: "private",
  description: "Kumpulan kursus",
};

const renderModal = (onClose = vi.fn()) =>
  renderWithProviders(ChangeModal, { props: { linkTree, onClose } });

describe("ChangeModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render the change modal prefilled with link tree data", () => {
    const { wrapper } = renderModal();

    expect(wrapper.find('[data-testid="modal"]').element.getAttribute("aria-label")).toBe("Ubah Link Tree");
    expect(wrapper.find('[data-testid="link-tree-title-input"]').element.value).toBe("Kursus Ku");
    expect(wrapper.find('[data-testid="link-tree-type-select"]').element.value).toBe("private");
    expect(wrapper.find('[data-testid="link-tree-description-input"]').element.value).toBe("Kumpulan kursus");
    expect(wrapper.find('[data-testid="link-tree-submit-btn"]').text()).toContain("Simpan");
  });

  it("should put the link tree with the edited values on submit", async () => {
    const putSpy = vi.spyOn(linkTreesStore, "asyncPutLinkTree").mockResolvedValue();
    const { wrapper } = renderModal();

    await wrapper.find('[data-testid="link-tree-title-input"]').setValue("Judul Baru");
    await wrapper.find('[data-testid="link-tree-type-select"]').setValue("public");
    await wrapper.find("form").trigger("submit");

    expect(putSpy).toHaveBeenCalledWith(7, "Judul Baru", "public", "Kumpulan kursus");
  });

  it("should call onClose when cancel is clicked", async () => {
    const onClose = vi.fn();
    const { wrapper } = renderModal(onClose);

    await wrapper.find('[data-testid="link-tree-cancel-btn"]').trigger("click");

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});