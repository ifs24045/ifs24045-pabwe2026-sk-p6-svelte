import { describe, it, expect, vi, beforeEach } from "vitest";
import NotFoundPage from "./NotFoundPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as routerModule from "../../../router";

describe("NotFoundPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render the 404 message", () => {
    const { wrapper } = renderWithProviders(NotFoundPage);

    expect(wrapper.find('[data-testid="not-found-code"]').text()).toBe("404");
    expect(wrapper.text()).toContain("Halaman Tidak Ditemukan");
  });

  it("should navigate to the home page when the button is clicked", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(NotFoundPage);

    await wrapper.find('[data-testid="not-found-home-btn"]').trigger("click");

    expect(navSpy).toHaveBeenCalledWith("/");
  });
});