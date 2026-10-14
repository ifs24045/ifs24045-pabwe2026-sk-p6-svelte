import { describe, it, expect, vi, beforeEach } from "vitest";
import LinkTreeForm from "./LinkTreeForm.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

const renderForm = (props = {}) =>
  renderWithProviders(LinkTreeForm, {
    props: {
      submitLabel: "Simpan",
      loadingLabel: "Menyimpan...",
      onSubmit: vi.fn().mockResolvedValue(),
      onCancel: vi.fn(),
      ...props,
    },
  });

describe("LinkTreeForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render empty form with default type and hint", () => {
    const { wrapper } = renderForm();

    expect(wrapper.find('[data-testid="link-tree-title-input"]').element.value).toBe("");
    expect(wrapper.find('[data-testid="link-tree-type-select"]').element.value).toBe("public");
    expect(wrapper.find('[data-testid="link-tree-description-input"]').element.value).toBe("");
    expect(wrapper.find('[data-testid="link-tree-type-hint"]').text()).toContain("Semua orang");
    expect(wrapper.text()).toContain("Simpan");
  });

  it("should prefill fields from initial props", () => {
    const { wrapper } = renderForm({
      initialTitle: "Kursus Ku",
      initialType: "private",
      initialDescription: "Kumpulan kursus",
    });

    expect(wrapper.find('[data-testid="link-tree-title-input"]').element.value).toBe("Kursus Ku");
    expect(wrapper.find('[data-testid="link-tree-type-select"]').element.value).toBe("private");
    expect(wrapper.find('[data-testid="link-tree-description-input"]').element.value).toBe("Kumpulan kursus");
    expect(wrapper.find('[data-testid="link-tree-type-hint"]').text()).toContain("Hanya Anda");
  });

  it("should update the hint when the type changes", async () => {
    const { wrapper } = renderForm();

    await wrapper.find('[data-testid="link-tree-type-select"]').setValue("unlisted");

    expect(wrapper.find('[data-testid="link-tree-type-hint"]').text()).toContain("memiliki tautan");
  });

  it("should validate title and description before submitting", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const onSubmit = vi.fn().mockResolvedValue();
    const { wrapper } = renderForm({ onSubmit });

    await wrapper.find('[data-testid="link-tree-title-input"]').setValue("   ");
    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Judul tidak boleh kosong!");

    await wrapper.find('[data-testid="link-tree-title-input"]').setValue("Judul");
    await wrapper.find('[data-testid="link-tree-description-input"]').setValue("   ");
    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Deskripsi tidak boleh kosong!");

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("should submit trimmed values and show loading state while pending", async () => {
    let resolveSubmit;
    const onSubmit = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveSubmit = resolve;
      })
    );
    const { wrapper } = renderForm({ onSubmit });

    await wrapper.find('[data-testid="link-tree-title-input"]').setValue("  Judul Baru  ");
    await wrapper.find('[data-testid="link-tree-type-select"]').setValue("unlisted");
    await wrapper.find('[data-testid="link-tree-description-input"]').setValue("  Deskripsi baru  ");
    await wrapper.find("form").trigger("submit");

    expect(onSubmit).toHaveBeenCalledWith("Judul Baru", "unlisted", "Deskripsi baru");
    expect(wrapper.text()).toContain("Menyimpan...");
    expect(wrapper.find('[data-testid="link-tree-submit-btn"]').element.disabled).toBe(true);

    resolveSubmit();
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.text()).toContain("Simpan");
    expect(wrapper.text()).not.toContain("Menyimpan...");
    expect(wrapper.find('[data-testid="link-tree-submit-btn"]').element.disabled).toBe(false);
  });

  it("should call onCancel when cancel button is clicked", async () => {
    const onCancel = vi.fn();
    const { wrapper } = renderForm({ onCancel });

    await wrapper.find('[data-testid="link-tree-cancel-btn"]').trigger("click");

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});