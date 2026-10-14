import { describe, it, expect, vi, beforeEach } from "vitest";
import linkTreeApi from "./linkTreeApi";
import apiHelper from "../../../helpers/apiHelper";

const mockResponse = (body) => ({ json: async () => body });

describe("linkTreeApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("postLinkTree", () => {
    it("should post JSON body and return link_tree_id on success", async () => {
      const spy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({
          status: "success",
          data: { link_tree_id: 7 },
        })
      );

      const id = await linkTreeApi.postLinkTree("Judul", "public", "Deskripsi");

      expect(id).toBe(7);
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining("/link-trees"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Judul",
            type: "public",
            description: "Deskripsi",
          }),
        })
      );
    });

    it("should throw server message on fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail", message: "Data tidak valid" })
      );

      await expect(
        linkTreeApi.postLinkTree("", "public", "")
      ).rejects.toThrow("Data tidak valid");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail" })
      );

      await expect(
        linkTreeApi.postLinkTree("a", "public", "b")
      ).rejects.toThrow("Gagal menambahkan link tree");
    });

    it("should accept legacy success flag", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ success: true, data: {} })
      );

      const id = await linkTreeApi.postLinkTree("a", "public", "b");
      expect(id).toBeUndefined();
    });
  });

  describe("postLinkTreeCover", () => {
    it("should upload cover with FormData and return message", async () => {
      const spy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", message: "Berhasil mengubah cover" })
      );

      const file = new File(["img"], "cover.jpg", { type: "image/jpeg" });
      const msg = await linkTreeApi.postLinkTreeCover(1, file);

      expect(msg).toBe("Berhasil mengubah cover");
      const [url, options] = spy.mock.calls[0];
      expect(url).toContain("/link-trees/1/cover");
      expect(options.method).toBe("POST");
      expect(options.body).toBeInstanceOf(FormData);
      expect(options.body.get("cover").name).toBe("cover.jpg");
    });

    it("should fall back to default filename when file has no name", async () => {
      const spy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", message: "Berhasil" })
      );

      const blob = new Blob(["img"], { type: "image/png" });
      await linkTreeApi.postLinkTreeCover(1, blob);

      expect(spy.mock.calls[0][1].body.get("cover").name).toBe("cover.png");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail" })
      );

      const file = new File(["img"], "cover.jpg", { type: "image/jpeg" });
      await expect(linkTreeApi.postLinkTreeCover(1, file)).rejects.toThrow(
        "Gagal mengubah cover link tree"
      );
    });
  });

  describe("putLinkTree", () => {
    it("should put JSON body and return message on success", async () => {
      const spy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", message: "Berhasil mengubah data" })
      );

      const msg = await linkTreeApi.putLinkTree(3, "Baru", "private", "Desk");

      expect(msg).toBe("Berhasil mengubah data");
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining("/link-trees/3"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({
            title: "Baru",
            type: "private",
            description: "Desk",
          }),
        })
      );
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail" })
      );

      await expect(
        linkTreeApi.putLinkTree(3, "a", "public", "b")
      ).rejects.toThrow("Gagal mengubah link tree");
    });
  });

  describe("getLinkTrees", () => {
    it("should return all link trees without is_me query by default", async () => {
      const list = [{ id: 1 }, { id: 2 }];
      const spy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", data: { link_trees: list } })
      );

      const result = await linkTreeApi.getLinkTrees();

      expect(result).toEqual(list);
      const [url, options] = spy.mock.calls[0];
      expect(url).not.toContain("is_me");
      expect(options.method).toBe("GET");
    });

    it("should send is_me=1 when requesting own link trees", async () => {
      const spy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", data: { link_trees: [{ id: 5 }] } })
      );

      const result = await linkTreeApi.getLinkTrees(true);

      expect(result).toEqual([{ id: 5 }]);
      expect(spy.mock.calls[0][0]).toContain("?is_me=1");
    });

    it("should return empty array when link_trees is missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", data: {} })
      );

      expect(await linkTreeApi.getLinkTrees()).toEqual([]);
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail" })
      );

      await expect(linkTreeApi.getLinkTrees()).rejects.toThrow(
        "Gagal mengambil data link tree"
      );
    });
  });

  describe("getLinkTreeById", () => {
    it("should return link_tree object on success", async () => {
      const tree = { id: 1, title: "Kursus Ku", items: [] };
      const spy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", data: { link_tree: tree } })
      );

      const result = await linkTreeApi.getLinkTreeById(1);

      expect(result).toEqual(tree);
      expect(spy.mock.calls[0][0]).toContain("/link-trees/1");
    });

    it("should throw server message on fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail", message: "Tidak ditemukan" })
      );

      await expect(linkTreeApi.getLinkTreeById(99)).rejects.toThrow(
        "Tidak ditemukan"
      );
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail" })
      );

      await expect(linkTreeApi.getLinkTreeById(99)).rejects.toThrow(
        "Gagal mengambil detail link tree"
      );
    });
  });

  describe("deleteLinkTree", () => {
    it("should delete one link tree and return message", async () => {
      const spy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", message: "Berhasil menghapus data" })
      );

      const msg = await linkTreeApi.deleteLinkTree(4);

      expect(msg).toBe("Berhasil menghapus data");
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining("/link-trees/4"),
        { method: "DELETE" }
      );
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail" })
      );

      await expect(linkTreeApi.deleteLinkTree(4)).rejects.toThrow(
        "Gagal menghapus link tree"
      );
    });
  });

  describe("deleteAllLinkTrees", () => {
    it("should delete all link trees and return message", async () => {
      const spy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({
          status: "success",
          message: "Berhasil menghapus semua data link tree",
        })
      );

      const msg = await linkTreeApi.deleteAllLinkTrees();

      expect(msg).toBe("Berhasil menghapus semua data link tree");
      expect(spy.mock.calls[0][1]).toEqual({ method: "DELETE" });
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail" })
      );

      await expect(linkTreeApi.deleteAllLinkTrees()).rejects.toThrow(
        "Gagal menghapus semua link tree"
      );
    });
  });

  describe("postItem", () => {
    it("should post item and return item_id on success", async () => {
      const spy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", data: { item_id: 9 } })
      );

      const id = await linkTreeApi.postItem(1, "Delcom", "https://delcom.org");

      expect(id).toBe(9);
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining("/link-trees/1/items"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ title: "Delcom", url: "https://delcom.org" }),
        })
      );
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail" })
      );

      await expect(
        linkTreeApi.postItem(1, "a", "https://a.com")
      ).rejects.toThrow("Gagal menambahkan tautan");
    });
  });

  describe("putItem", () => {
    it("should put item and return message on success", async () => {
      const spy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", message: "Berhasil mengubah data" })
      );

      const msg = await linkTreeApi.putItem(1, 2, "Baru", "https://baru.com");

      expect(msg).toBe("Berhasil mengubah data");
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining("/link-trees/1/items/2"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ title: "Baru", url: "https://baru.com" }),
        })
      );
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail" })
      );

      await expect(
        linkTreeApi.putItem(1, 2, "a", "https://a.com")
      ).rejects.toThrow("Gagal mengubah tautan");
    });
  });

  describe("deleteItem", () => {
    it("should delete item and return message on success", async () => {
      const spy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "success", message: "Berhasil menghapus data" })
      );

      const msg = await linkTreeApi.deleteItem(1, 2);

      expect(msg).toBe("Berhasil menghapus data");
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining("/link-trees/1/items/2"),
        { method: "DELETE" }
      );
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue(
        mockResponse({ status: "fail" })
      );

      await expect(linkTreeApi.deleteItem(1, 2)).rejects.toThrow(
        "Gagal menghapus tautan"
      );
    });
  });
});