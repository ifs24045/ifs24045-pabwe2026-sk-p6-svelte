import { describe, it, expect, vi, beforeEach } from "vitest";
import { useLinkTreesStore, linkTreesStore } from "./linkTreesStore";
import linkTreeApi from "../api/linkTreeApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("linkTreesStore", () => {
  beforeEach(() => {
    linkTreesStore.reset();
    vi.restoreAllMocks();
  });

  it("should have correct default state", () => {
    const store = useLinkTreesStore();
    expect(store.linkTrees).toEqual([]);
    expect(store.linkTree).toBeNull();
    expect(store.isAddLinkTree).toBe(false);
    expect(store.isChangeLinkTree).toBe(false);
    expect(store.isChangeCoverLinkTree).toBe(false);
    expect(store.isDeleteLinkTree).toBe(false);
    expect(store.isDeleteAllLinkTrees).toBe(false);
    expect(store.isAddItem).toBe(false);
    expect(store.isChangeItem).toBe(false);
    expect(store.isDeleteItem).toBe(false);
    expect(store.$state.linkTrees).toEqual([]);
  });

  it("should update state with setters", () => {
    const store = useLinkTreesStore();
    store.setLinkTrees([{ id: 1 }]);
    expect(store.linkTrees).toEqual([{ id: 1 }]);

    store.setLinkTree({ id: 2 });
    expect(store.linkTree).toEqual({ id: 2 });

    store.setIsAddLinkTree(true);
    expect(store.isAddLinkTree).toBe(true);

    store.setIsChangeLinkTree(true);
    expect(store.isChangeLinkTree).toBe(true);

    store.setIsChangeCoverLinkTree(true);
    expect(store.isChangeCoverLinkTree).toBe(true);

    store.setIsDeleteLinkTree(true);
    expect(store.isDeleteLinkTree).toBe(true);

    store.setIsDeleteAllLinkTrees(true);
    expect(store.isDeleteAllLinkTrees).toBe(true);

    store.setIsAddItem(true);
    expect(store.isAddItem).toBe(true);

    store.setIsChangeItem(true);
    expect(store.isChangeItem).toBe(true);

    store.setIsDeleteItem(true);
    expect(store.isDeleteItem).toBe(true);
  });

  it("should reset with a preloaded state", () => {
    const store = useLinkTreesStore();
    store.reset({ linkTrees: [{ id: 9 }] });
    expect(store.linkTrees).toEqual([{ id: 9 }]);
    expect(store.linkTree).toBeNull();
  });

  describe("asyncSetLinkTrees", () => {
    it("should set link trees on success and pass isMe flag", async () => {
      const store = useLinkTreesStore();
      const spy = vi.spyOn(linkTreeApi, "getLinkTrees").mockResolvedValue([{ id: 1 }]);

      await store.asyncSetLinkTrees(true);

      expect(spy).toHaveBeenCalledWith(true);
      expect(store.linkTrees).toEqual([{ id: 1 }]);
    });

    it("should default isMe to false", async () => {
      const store = useLinkTreesStore();
      const spy = vi.spyOn(linkTreeApi, "getLinkTrees").mockResolvedValue([]);

      await store.asyncSetLinkTrees();

      expect(spy).toHaveBeenCalledWith(false);
    });

    it("should set empty array on error", async () => {
      const store = useLinkTreesStore();
      store.setLinkTrees([{ id: 1 }]);
      vi.spyOn(linkTreeApi, "getLinkTrees").mockRejectedValue(new Error("Error"));

      await store.asyncSetLinkTrees();

      expect(store.linkTrees).toEqual([]);
    });
  });

  describe("asyncSetLinkTree", () => {
    it("should set link tree on success", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue({ id: 2 });

      await store.asyncSetLinkTree(2);

      expect(store.linkTree).toEqual({ id: 2 });
    });

    it("should set null on error", async () => {
      const store = useLinkTreesStore();
      store.setLinkTree({ id: 2 });
      vi.spyOn(linkTreeApi, "getLinkTreeById").mockRejectedValue(new Error("Error"));

      await store.asyncSetLinkTree(99);

      expect(store.linkTree).toBeNull();
    });
  });

  describe("asyncPostLinkTree", () => {
    it("should add link tree, show success dialog, and set isAddLinkTree to true", async () => {
      const store = useLinkTreesStore();
      const apiSpy = vi.spyOn(linkTreeApi, "postLinkTree").mockResolvedValue(1);
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncPostLinkTree("Judul", "public", "Deskripsi");

      expect(apiSpy).toHaveBeenCalledWith("Judul", "public", "Deskripsi");
      expect(successSpy).toHaveBeenCalledWith("Link tree berhasil ditambahkan!");
      expect(store.isAddLinkTree).toBe(true);
    });

    it("should show error dialog and set isAddLinkTree to false on error", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "postLinkTree").mockRejectedValue(new Error("Data tidak valid"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncPostLinkTree("", "public", "");

      expect(errorSpy).toHaveBeenCalledWith("Data tidak valid");
      expect(store.isAddLinkTree).toBe(false);
    });
  });

  describe("asyncPutLinkTree", () => {
    it("should update link tree and set isChangeLinkTree to true", async () => {
      const store = useLinkTreesStore();
      const apiSpy = vi.spyOn(linkTreeApi, "putLinkTree").mockResolvedValue("Berhasil mengubah data");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncPutLinkTree(1, "Baru", "private", "Desk");

      expect(apiSpy).toHaveBeenCalledWith(1, "Baru", "private", "Desk");
      expect(successSpy).toHaveBeenCalledWith("Berhasil mengubah data");
      expect(store.isChangeLinkTree).toBe(true);
    });

    it("should use fallback message when server message is empty", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "putLinkTree").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncPutLinkTree(1, "Baru", "private", "Desk");

      expect(successSpy).toHaveBeenCalledWith("Link tree berhasil diperbarui!");
    });

    it("should show error dialog and set isChangeLinkTree to false on error", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "putLinkTree").mockRejectedValue(new Error("Gagal update"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncPutLinkTree(1, "a", "public", "b");

      expect(errorSpy).toHaveBeenCalledWith("Gagal update");
      expect(store.isChangeLinkTree).toBe(false);
    });
  });

  describe("asyncPostLinkTreeCover", () => {
    it("should upload cover and set isChangeCoverLinkTree to true", async () => {
      const store = useLinkTreesStore();
      const apiSpy = vi.spyOn(linkTreeApi, "postLinkTreeCover").mockResolvedValue("Berhasil mengubah cover");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      const file = new File(["img"], "cover.png");
      await store.asyncPostLinkTreeCover(1, file);

      expect(apiSpy).toHaveBeenCalledWith(1, file);
      expect(successSpy).toHaveBeenCalledWith("Berhasil mengubah cover");
      expect(store.isChangeCoverLinkTree).toBe(true);
    });

    it("should use fallback message when server message is empty", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "postLinkTreeCover").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncPostLinkTreeCover(1, new File(["img"], "cover.png"));

      expect(successSpy).toHaveBeenCalledWith("Cover berhasil diperbarui!");
    });

    it("should show error dialog and set isChangeCoverLinkTree to false on error", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "postLinkTreeCover").mockRejectedValue(new Error("File terlalu besar"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncPostLinkTreeCover(1, new File(["img"], "cover.png"));

      expect(errorSpy).toHaveBeenCalledWith("File terlalu besar");
      expect(store.isChangeCoverLinkTree).toBe(false);
    });
  });

  describe("asyncDeleteLinkTree", () => {
    it("should delete link tree and set isDeleteLinkTree to true", async () => {
      const store = useLinkTreesStore();
      const apiSpy = vi.spyOn(linkTreeApi, "deleteLinkTree").mockResolvedValue("Berhasil menghapus data");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncDeleteLinkTree(1);

      expect(apiSpy).toHaveBeenCalledWith(1);
      expect(successSpy).toHaveBeenCalledWith("Berhasil menghapus data");
      expect(store.isDeleteLinkTree).toBe(true);
    });

    it("should use fallback message when server message is empty", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "deleteLinkTree").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncDeleteLinkTree(1);

      expect(successSpy).toHaveBeenCalledWith("Link tree berhasil dihapus!");
    });

    it("should show error dialog and set isDeleteLinkTree to false on error", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "deleteLinkTree").mockRejectedValue(new Error("Gagal hapus"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncDeleteLinkTree(1);

      expect(errorSpy).toHaveBeenCalledWith("Gagal hapus");
      expect(store.isDeleteLinkTree).toBe(false);
    });
  });

  describe("asyncDeleteAllLinkTrees", () => {
    it("should delete all link trees and set isDeleteAllLinkTrees to true", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "deleteAllLinkTrees").mockResolvedValue("Berhasil menghapus semua data link tree");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncDeleteAllLinkTrees();

      expect(successSpy).toHaveBeenCalledWith("Berhasil menghapus semua data link tree");
      expect(store.isDeleteAllLinkTrees).toBe(true);
    });

    it("should use fallback message when server message is empty", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "deleteAllLinkTrees").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncDeleteAllLinkTrees();

      expect(successSpy).toHaveBeenCalledWith("Semua link tree berhasil dihapus!");
    });

    it("should show error dialog and set isDeleteAllLinkTrees to false on error", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "deleteAllLinkTrees").mockRejectedValue(new Error("Unauthenticated."));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncDeleteAllLinkTrees();

      expect(errorSpy).toHaveBeenCalledWith("Unauthenticated.");
      expect(store.isDeleteAllLinkTrees).toBe(false);
    });
  });

  describe("asyncPostItem", () => {
    it("should add item, show success dialog, and set isAddItem to true", async () => {
      const store = useLinkTreesStore();
      const apiSpy = vi.spyOn(linkTreeApi, "postItem").mockResolvedValue(1);
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncPostItem(1, "Delcom", "https://delcom.org");

      expect(apiSpy).toHaveBeenCalledWith(1, "Delcom", "https://delcom.org");
      expect(successSpy).toHaveBeenCalledWith("Tautan berhasil ditambahkan!");
      expect(store.isAddItem).toBe(true);
    });

    it("should show error dialog and set isAddItem to false on error", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "postItem").mockRejectedValue(new Error("URL tidak valid"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncPostItem(1, "a", "x");

      expect(errorSpy).toHaveBeenCalledWith("URL tidak valid");
      expect(store.isAddItem).toBe(false);
    });
  });

  describe("asyncPutItem", () => {
    it("should update item and set isChangeItem to true", async () => {
      const store = useLinkTreesStore();
      const apiSpy = vi.spyOn(linkTreeApi, "putItem").mockResolvedValue("Berhasil mengubah data");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncPutItem(1, 2, "Baru", "https://baru.com");

      expect(apiSpy).toHaveBeenCalledWith(1, 2, "Baru", "https://baru.com");
      expect(successSpy).toHaveBeenCalledWith("Berhasil mengubah data");
      expect(store.isChangeItem).toBe(true);
    });

    it("should use fallback message when server message is empty", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "putItem").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncPutItem(1, 2, "a", "https://a.com");

      expect(successSpy).toHaveBeenCalledWith("Tautan berhasil diperbarui!");
    });

    it("should show error dialog and set isChangeItem to false on error", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "putItem").mockRejectedValue(new Error("Gagal ubah"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncPutItem(1, 2, "a", "https://a.com");

      expect(errorSpy).toHaveBeenCalledWith("Gagal ubah");
      expect(store.isChangeItem).toBe(false);
    });
  });

  describe("asyncDeleteItem", () => {
    it("should delete item and set isDeleteItem to true", async () => {
      const store = useLinkTreesStore();
      const apiSpy = vi.spyOn(linkTreeApi, "deleteItem").mockResolvedValue("Berhasil menghapus data");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncDeleteItem(1, 2);

      expect(apiSpy).toHaveBeenCalledWith(1, 2);
      expect(successSpy).toHaveBeenCalledWith("Berhasil menghapus data");
      expect(store.isDeleteItem).toBe(true);
    });

    it("should use fallback message when server message is empty", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "deleteItem").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncDeleteItem(1, 2);

      expect(successSpy).toHaveBeenCalledWith("Tautan berhasil dihapus!");
    });

    it("should show error dialog and set isDeleteItem to false on error", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "deleteItem").mockRejectedValue(new Error("Gagal hapus"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncDeleteItem(1, 2);

      expect(errorSpy).toHaveBeenCalledWith("Gagal hapus");
      expect(store.isDeleteItem).toBe(false);
    });
  });
});