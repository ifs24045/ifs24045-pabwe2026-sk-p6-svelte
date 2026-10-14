import { describe, it, expect, vi, beforeEach } from "vitest";
import { tick, createRawSnippet } from "svelte";
import ModalShell from "./ModalShell.svelte";
import { renderWithProviders } from "../../../test-utils";

const children = createRawSnippet(() => ({
  render: () => '<p data-testid="modal-content">Isi Modal</p>',
}));

const renderShell = (onClose) =>
  renderWithProviders(ModalShell, {
    props: { title: "Judul Modal", onClose, children, $$slots: { default: true } },
  });

describe("ModalShell", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render title and slot content as an accessible dialog", () => {
    const { wrapper } = renderShell(vi.fn());

    const dialog = wrapper.find('[data-testid="modal"]');
    expect(dialog.element.getAttribute("role")).toBe("dialog");
    expect(dialog.element.getAttribute("aria-modal")).toBe("true");
    expect(dialog.element.getAttribute("aria-label")).toBe("Judul Modal");
    expect(wrapper.text()).toContain("Judul Modal");
    expect(wrapper.find('[data-testid="modal-content"]').exists()).toBe(true);
  });

  it("should call onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    const { wrapper } = renderShell(onClose);

    await wrapper.find('[data-testid="modal-close-btn"]').trigger("click");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when the backdrop is clicked", async () => {
    const onClose = vi.fn();
    const { wrapper } = renderShell(onClose);

    await wrapper.find('[data-testid="modal-backdrop"]').trigger("click");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when Escape is pressed but ignore other keys", async () => {
    const onClose = vi.fn();
    renderShell(onClose);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    await tick();
    expect(onClose).not.toHaveBeenCalled();

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await tick();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});