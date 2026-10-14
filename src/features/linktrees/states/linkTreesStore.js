import { writable } from "svelte/store";
import linkTreeApi from "../api/linkTreeApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

function createLinkTreesStore() {
  const initial = {
    linkTrees: [],
    linkTree: null,
    isAddLinkTree: false,
    isChangeLinkTree: false,
    isChangeCoverLinkTree: false,
    isDeleteLinkTree: false,
    isDeleteAllLinkTrees: false,
    isAddItem: false,
    isChangeItem: false,
    isDeleteItem: false,
  };

  let currentState = { ...initial };
  const innerStore = writable(currentState);
  innerStore.subscribe((val) => {
    currentState = val;
  });

  return {
    subscribe: innerStore.subscribe,
    get linkTrees() { return currentState.linkTrees; },
    get linkTree() { return currentState.linkTree; },
    get isAddLinkTree() { return currentState.isAddLinkTree; },
    get isChangeLinkTree() { return currentState.isChangeLinkTree; },
    get isChangeCoverLinkTree() { return currentState.isChangeCoverLinkTree; },
    get isDeleteLinkTree() { return currentState.isDeleteLinkTree; },
    get isDeleteAllLinkTrees() { return currentState.isDeleteAllLinkTrees; },
    get isAddItem() { return currentState.isAddItem; },
    get isChangeItem() { return currentState.isChangeItem; },
    get isDeleteItem() { return currentState.isDeleteItem; },
    get $state() { return currentState; },
    reset(state = initial) {
      innerStore.set({ ...initial, ...state });
    },
    setLinkTrees(linkTrees) {
      innerStore.update((s) => ({ ...s, linkTrees }));
    },
    setLinkTree(linkTree) {
      innerStore.update((s) => ({ ...s, linkTree }));
    },
    setIsAddLinkTree(status) {
      innerStore.update((s) => ({ ...s, isAddLinkTree: status }));
    },
    setIsChangeLinkTree(status) {
      innerStore.update((s) => ({ ...s, isChangeLinkTree: status }));
    },
    setIsChangeCoverLinkTree(status) {
      innerStore.update((s) => ({ ...s, isChangeCoverLinkTree: status }));
    },
    setIsDeleteLinkTree(status) {
      innerStore.update((s) => ({ ...s, isDeleteLinkTree: status }));
    },
    setIsDeleteAllLinkTrees(status) {
      innerStore.update((s) => ({ ...s, isDeleteAllLinkTrees: status }));
    },
    setIsAddItem(status) {
      innerStore.update((s) => ({ ...s, isAddItem: status }));
    },
    setIsChangeItem(status) {
      innerStore.update((s) => ({ ...s, isChangeItem: status }));
    },
    setIsDeleteItem(status) {
      innerStore.update((s) => ({ ...s, isDeleteItem: status }));
    },
    async asyncSetLinkTrees(isMe = false) {
      try {
        const linkTrees = await linkTreeApi.getLinkTrees(isMe);
        this.setLinkTrees(linkTrees);
      } catch {
        this.setLinkTrees([]);
      }
    },
    async asyncSetLinkTree(linkTreeId) {
      try {
        const linkTree = await linkTreeApi.getLinkTreeById(linkTreeId);
        this.setLinkTree(linkTree);
      } catch {
        this.setLinkTree(null);
      }
    },
    async asyncPostLinkTree(title, type, description) {
      try {
        await linkTreeApi.postLinkTree(title, type, description);
        showSuccessDialog("Link tree berhasil ditambahkan!");
        this.setIsAddLinkTree(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsAddLinkTree(false);
      }
    },
    async asyncPutLinkTree(linkTreeId, title, type, description) {
      try {
        const message = await linkTreeApi.putLinkTree(linkTreeId, title, type, description);
        showSuccessDialog(message || "Link tree berhasil diperbarui!");
        this.setIsChangeLinkTree(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsChangeLinkTree(false);
      }
    },
    async asyncPostLinkTreeCover(linkTreeId, cover) {
      try {
        const message = await linkTreeApi.postLinkTreeCover(linkTreeId, cover);
        showSuccessDialog(message || "Cover berhasil diperbarui!");
        this.setIsChangeCoverLinkTree(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsChangeCoverLinkTree(false);
      }
    },
    async asyncDeleteLinkTree(linkTreeId) {
      try {
        const message = await linkTreeApi.deleteLinkTree(linkTreeId);
        showSuccessDialog(message || "Link tree berhasil dihapus!");
        this.setIsDeleteLinkTree(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsDeleteLinkTree(false);
      }
    },
    async asyncDeleteAllLinkTrees() {
      try {
        const message = await linkTreeApi.deleteAllLinkTrees();
        showSuccessDialog(message || "Semua link tree berhasil dihapus!");
        this.setIsDeleteAllLinkTrees(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsDeleteAllLinkTrees(false);
      }
    },
    async asyncPostItem(linkTreeId, title, url) {
      try {
        await linkTreeApi.postItem(linkTreeId, title, url);
        showSuccessDialog("Tautan berhasil ditambahkan!");
        this.setIsAddItem(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsAddItem(false);
      }
    },
    async asyncPutItem(linkTreeId, itemId, title, url) {
      try {
        const message = await linkTreeApi.putItem(linkTreeId, itemId, title, url);
        showSuccessDialog(message || "Tautan berhasil diperbarui!");
        this.setIsChangeItem(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsChangeItem(false);
      }
    },
    async asyncDeleteItem(linkTreeId, itemId) {
      try {
        const message = await linkTreeApi.deleteItem(linkTreeId, itemId);
        showSuccessDialog(message || "Tautan berhasil dihapus!");
        this.setIsDeleteItem(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsDeleteItem(false);
      }
    },
  };
}

export const linkTreesStore = createLinkTreesStore();
export const useLinkTreesStore = () => linkTreesStore;
export default linkTreesStore;