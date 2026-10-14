import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeCoverModal from "./ChangeCoverModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import { linkTreesStore } from "../states/linkTreesStore";
import * as toolsHelper from "../../../helpers/toolsHelper";

const linkTree = { id: 7, title: "Kursus Ku" };

const renderModal = (onClose = vi.fn()) =>
  renderWithProviders(ChangeCoverModal, { props: { linkTree, onClose } });

const chooseFile = async (wrapper, file) => {
  const input = wrapper.find('[data-testid="link-tree-cover-input"]');
  Object.defineProperty(input.element, "files", {
    value: file ? [file] : [],
    configurable: true,
  });
  await input.trigger("change");
};

describe("ChangeCoverModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render the modal with an empty file picker", () => {
    const { wrapper } = renderModal();

    expect(wrapper.find('[data-testid="modal"]').element.getAttribute("aria-label")).toBe("Ubah Sampul");
    expect(wrapper.text()).toContain("Klik untuk memilih gambar");
    expect(wrapper.find('[data-testid="cover-file-name"]').exists()).toBe(false);
  });

  it("should reject files that are not images", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper } = renderModal();

    await chooseFile(wrapper, new File(["dummy"], "file.txt", { type: "text/plain" }));

    expect(errorSpy).toHaveBeenCalledWith("Pilih file gambar yang valid!");
    expect(wrapper.find('[data-testid="cover-file-name"]').exists()).toBe(false);
  });

  it("should reject images larger than 3MB", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper } = renderModal();

    await chooseFile(
      wrapper,
      new File([new Uint8Array(4 * 1024 * 1024)], "large.png", { type: "image/png" })
    );

    expect(errorSpy).toHaveBeenCalledWith("Ukuran file cover maksimal 3MB!");
    expect(wrapper.find('[data-testid="cover-file-name"]').exists()).toBe(false);
  });

  it("should show the file name for a valid image and clear it when selection is emptied", async () => {
    const { wrapper } = renderModal();

    await chooseFile(wrapper, new File(["img"], "cover.png", { type: "image/png" }));
    expect(wrapper.find('[data-testid="cover-file-name"]').text()).toBe("cover.png");

    await chooseFile(wrapper, null);
    expect(wrapper.find('[data-testid="cover-file-name"]').exists()).toBe(false);
  });

  it("should require a file before uploading", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const coverSpy = vi.spyOn(linkTreesStore, "asyncPostLinkTreeCover").mockResolvedValue();
    const { wrapper } = renderModal();

    await wrapper.find("form").trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Pilih gambar cover terlebih dahulu!");
    expect(coverSpy).not.toHaveBeenCalled();
  });

  it("should upload the selected file and show loading state while pending", async () => {
    let resolveUpload;
    const coverSpy = vi.spyOn(linkTreesStore, "asyncPostLinkTreeCover").mockReturnValue(
      new Promise((resolve) => {
        resolveUpload = resolve;
      })
    );
    const { wrapper } = renderModal();
    const file = new File(["img"], "cover.png", { type: "image/png" });

    await chooseFile(wrapper, file);
    await wrapper.find("form").trigger("submit");

    expect(coverSpy).toHaveBeenCalledWith(7, file);
    expect(wrapper.text()).toContain("Mengunggah...");
    expect(wrapper.find('[data-testid="cover-submit-btn"]').element.disabled).toBe(true);

    resolveUpload();
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.text()).toContain("Unggah");
    expect(wrapper.text()).not.toContain("Mengunggah...");
    expect(wrapper.find('[data-testid="cover-submit-btn"]').element.disabled).toBe(false);
  });

  it("should call onClose when cancel is clicked", async () => {
    const onClose = vi.fn();
    const { wrapper } = renderModal(onClose);

    await wrapper.find('[data-testid="cover-cancel-btn"]').trigger("click");

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});