import { create } from "zustand";
import type {
  BuilderDocument,
  BuilderPage,
  DragActiveData,
  SeedNode,
} from "./types";
import * as treeUtils from "./tree-utils";
import type { DropTargetData } from "./tree-utils";
import { clonePage, createBlankPage, nextDuplicateName } from "./seed";
import { createEmptyDocument, loadOrCreateDocument } from "./persistence";
import { createSeedNode } from "./registry";
import { ApiError } from "@/lib/api/http";
import * as documentsApi from "@/lib/api/documents";
import * as pagesApi from "@/lib/api/pages";
import * as nodesApi from "@/lib/api/nodes";

interface BuilderState {
  document: BuilderDocument;
  hydrated: boolean;
  hydrationError: string | null;
  /** Message from the most recent failed background sync call, if any. */
  syncError: string | null;
  selectedNodeId: string | null;
  activeDragId: string | null;
  overId: string | null;
  isPreviewMode: boolean;
  past: BuilderDocument[];
  future: BuilderDocument[];

  hydrate: () => Promise<void>;
  activePage: () => BuilderPage;

  insertNode: (parentId: string, seed: SeedNode, index?: number) => void;
  removeNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  moveNode: (nodeId: string, newParentId: string, index: number) => void;
  updateNodeProps: (nodeId: string, props: Record<string, unknown>) => void;
  handleDrop: (active: DragActiveData, over: DropTargetData) => void;
  undo: () => void;
  redo: () => void;

  createPage: (name?: string) => void;
  switchPage: (pageId: string) => void;
  renamePage: (pageId: string, name: string) => void;
  deletePage: (pageId: string) => void;
  duplicatePage: (pageId: string) => void;

  selectNode: (nodeId: string | null) => void;
  setActiveDrag: (id: string | null) => void;
  setOverId: (id: string | null) => void;
  setPreviewMode: (value: boolean) => void;
  dismissSyncError: () => void;
  /** Clears any loaded document/session state — called on logout so the next login re-hydrates fresh. */
  resetHydration: () => void;
}

function withUpdatedPage(
  document: BuilderDocument,
  page: BuilderPage
): BuilderDocument {
  return {
    ...document,
    pages: { ...document.pages, [page.id]: page },
  };
}

/** Swaps a page from one key to another in `document.pages` (used after id reconciliation). */
function withRenamedPageKey(
  document: BuilderDocument,
  oldPageId: string,
  newPage: BuilderPage
): BuilderDocument {
  const pages = { ...document.pages };
  delete pages[oldPageId];
  pages[newPage.id] = newPage;
  return {
    ...document,
    pages,
    activePageId:
      document.activePageId === oldPageId ? newPage.id : document.activePageId,
  };
}

function messageFor(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Couldn't sync that change to the server.";
}

const HISTORY_LIMIT = 50;
const PROP_EDIT_DEBOUNCE_MS = 500;

/**
 * Rapid updateNodeProps calls (every keystroke in the property panel) are coalesced into a
 * single undo step AND a single network PATCH per touched node: the document from just before
 * the burst is captured here and only pushed onto `past` once the burst goes quiet, rather than
 * on every keystroke, and each touched node is PATCHed once with its final merged props.
 */
let pendingPropSnapshot: BuilderDocument | null = null;
let pendingPropTimer: ReturnType<typeof setTimeout> | null = null;
let pendingPropNodes = new Map<string, { documentId: string; pageId: string }>();

type SetState = (
  partial:
    | Partial<BuilderState>
    | ((state: BuilderState) => Partial<BuilderState>)
) => void;
type GetState = () => BuilderState;

/** Commits any pending debounced prop-edit snapshot to history and syncs touched nodes. */
function flushPendingPropEdits(set: SetState, get: GetState) {
  if (pendingPropTimer) {
    clearTimeout(pendingPropTimer);
    pendingPropTimer = null;
  }
  if (pendingPropSnapshot) {
    const snapshot = pendingPropSnapshot;
    pendingPropSnapshot = null;
    set((state) => ({
      past: [...state.past, snapshot].slice(-HISTORY_LIMIT),
      future: [],
    }));
  }

  if (pendingPropNodes.size > 0) {
    const touched = pendingPropNodes;
    pendingPropNodes = new Map();
    for (const [nodeId, { documentId, pageId }] of touched) {
      const node = get().document.pages[pageId]?.nodes[nodeId];
      if (!node) continue; // deleted or reconciled away before the burst settled
      nodesApi.updateNodeProps(documentId, pageId, nodeId, node.props).catch((err) => {
        set({ syncError: messageFor(err) });
      });
    }
  }
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  document: createEmptyDocument(),
  hydrated: false,
  hydrationError: null,
  syncError: null,
  selectedNodeId: null,
  activeDragId: null,
  overId: null,
  isPreviewMode: false,
  past: [],
  future: [],

  hydrate: async () => {
    if (get().hydrated) return;
    set({ hydrationError: null });
    try {
      const document = await loadOrCreateDocument();
      set({ document, hydrated: true, past: [], future: [] });
    } catch (err) {
      set({ hydrationError: messageFor(err) });
    }
  },

  activePage: () => {
    const { document } = get();
    return document.pages[document.activePageId];
  },

  insertNode: (parentId, seed, index) => {
    flushPendingPropEdits(set, get);
    const { document: previousDocument } = get();
    const documentId = previousDocument.id;
    const pageId = previousDocument.activePageId;

    let createdLocalId: string | undefined;
    set((state) => {
      const page = state.document.pages[state.document.activePageId];
      const nextPage = treeUtils.insertNode(page, parentId, seed, index);
      const insertedAt = index ?? page.nodes[parentId].children.length;
      createdLocalId = nextPage.nodes[parentId].children[insertedAt];
      const document = withUpdatedPage(state.document, nextPage);
      return {
        document,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        future: [],
      };
    });

    nodesApi
      .insertNode(documentId, pageId, parentId, seed, index)
      .then((result) => {
        if (!createdLocalId) return;
        set((state) => {
          const page = state.document.pages[pageId];
          if (!page || !page.nodes[createdLocalId as string]) return state;
          const idMap = treeUtils.buildIdReconciliationMap(
            page.nodes,
            createdLocalId as string,
            result.nodes,
            result.createdNodeId
          );
          const remappedPage = treeUtils.remapNodeIds(page, idMap);
          return {
            document: withUpdatedPage(state.document, remappedPage),
            selectedNodeId:
              state.selectedNodeId && idMap[state.selectedNodeId]
                ? idMap[state.selectedNodeId]
                : state.selectedNodeId,
          };
        });
      })
      .catch((err) => {
        set({ document: previousDocument, syncError: messageFor(err) });
      });
  },

  removeNode: (nodeId) => {
    flushPendingPropEdits(set, get);
    const { document: previousDocument } = get();
    const documentId = previousDocument.id;
    const pageId = previousDocument.activePageId;

    set((state) => {
      const page = state.document.pages[state.document.activePageId];
      const nextPage = treeUtils.removeNode(page, nodeId);
      const document = withUpdatedPage(state.document, nextPage);
      return {
        document,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        future: [],
        selectedNodeId:
          state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      };
    });

    nodesApi.removeNode(documentId, pageId, nodeId).catch((err) => {
      set({ document: previousDocument, syncError: messageFor(err) });
    });
  },

  duplicateNode: (nodeId) => {
    flushPendingPropEdits(set, get);
    const { document: previousDocument } = get();
    const documentId = previousDocument.id;
    const pageId = previousDocument.activePageId;

    let newLocalId: string | undefined;
    set((state) => {
      const page = state.document.pages[state.document.activePageId];
      const node = page.nodes[nodeId];
      if (!node || node.parentId === null) return state;

      const nextPage = treeUtils.duplicateNode(page, nodeId);
      const parent = nextPage.nodes[node.parentId];
      newLocalId = parent.children[parent.children.indexOf(nodeId) + 1];

      const document = withUpdatedPage(state.document, nextPage);
      return {
        document,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        future: [],
        selectedNodeId: newLocalId ?? state.selectedNodeId,
      };
    });

    if (!newLocalId) return;
    nodesApi
      .duplicateNode(documentId, pageId, nodeId)
      .then((result) => {
        set((state) => {
          const page = state.document.pages[pageId];
          if (!page || !newLocalId || !page.nodes[newLocalId]) return state;
          const idMap = treeUtils.buildIdReconciliationMap(
            page.nodes,
            newLocalId,
            result.nodes,
            result.newNodeId
          );
          const remappedPage = treeUtils.remapNodeIds(page, idMap);
          return {
            document: withUpdatedPage(state.document, remappedPage),
            selectedNodeId:
              state.selectedNodeId && idMap[state.selectedNodeId]
                ? idMap[state.selectedNodeId]
                : state.selectedNodeId,
          };
        });
      })
      .catch((err) => {
        set({ document: previousDocument, syncError: messageFor(err) });
      });
  },

  moveNode: (nodeId, newParentId, index) => {
    flushPendingPropEdits(set, get);
    const { document: previousDocument } = get();
    const documentId = previousDocument.id;
    const pageId = previousDocument.activePageId;

    set((state) => {
      const page = state.document.pages[state.document.activePageId];
      const nextPage = treeUtils.moveNode(page, nodeId, newParentId, index);
      const document = withUpdatedPage(state.document, nextPage);
      return {
        document,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        future: [],
      };
    });

    nodesApi.moveNode(documentId, pageId, nodeId, newParentId, index).catch((err) => {
      set({ document: previousDocument, syncError: messageFor(err) });
    });
  },

  updateNodeProps: (nodeId, props) => {
    const preEditDocument = get().document;
    if (pendingPropTimer) clearTimeout(pendingPropTimer);
    if (!pendingPropSnapshot) pendingPropSnapshot = preEditDocument;
    pendingPropNodes.set(nodeId, {
      documentId: preEditDocument.id,
      pageId: preEditDocument.activePageId,
    });
    pendingPropTimer = setTimeout(() => {
      flushPendingPropEdits(set, get);
    }, PROP_EDIT_DEBOUNCE_MS);

    set((state) => {
      const page = state.document.pages[state.document.activePageId];
      const nextPage = treeUtils.updateNodeProps(page, nodeId, props);
      const document = withUpdatedPage(state.document, nextPage);
      return { document };
    });
  },

  handleDrop: (active, over) => {
    flushPendingPropEdits(set, get);
    const { document } = get();
    const page = document.pages[document.activePageId];
    const { parentId, index } = treeUtils.resolveDropTarget(page, over);

    if (active.source === "palette") {
      get().insertNode(parentId, createSeedNode(active.blockType), index);
      return;
    }

    let targetIndex = index;
    if (parentId === active.parentId) {
      const originalIndex = page.nodes[parentId].children.indexOf(active.nodeId);
      if (originalIndex !== -1 && originalIndex < targetIndex) {
        targetIndex -= 1;
      }
    }
    get().moveNode(active.nodeId, parentId, targetIndex);
  },

  undo: () => {
    if (pendingPropTimer) {
      clearTimeout(pendingPropTimer);
      pendingPropTimer = null;
    }
    set((state) => {
      let target: BuilderDocument;
      let past = state.past;
      if (pendingPropSnapshot) {
        target = pendingPropSnapshot;
        pendingPropSnapshot = null;
        pendingPropNodes = new Map();
      } else {
        if (past.length === 0) return state;
        target = past[past.length - 1];
        past = past.slice(0, -1);
      }
      return {
        document: target,
        past,
        future: [...state.future, state.document].slice(-HISTORY_LIMIT),
        selectedNodeId: null,
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.future.length === 0) return state;
      const target = state.future[state.future.length - 1];
      const future = state.future.slice(0, -1);
      return {
        document: target,
        future,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        selectedNodeId: null,
      };
    });
  },

  createPage: (name) => {
    flushPendingPropEdits(set, get);
    const { document: previousDocument } = get();
    const documentId = previousDocument.id;
    const pageName =
      name?.trim() || `Page ${Object.keys(previousDocument.pages).length + 1}`;

    const page = createBlankPage(pageName);
    set((state) => {
      const document: BuilderDocument = {
        ...state.document,
        pages: { ...state.document.pages, [page.id]: page },
        activePageId: page.id,
      };
      return {
        document,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        future: [],
        selectedNodeId: null,
      };
    });

    pagesApi
      .createPage(documentId, pageName)
      .then((serverPage) => {
        set((state) => {
          if (!state.document.pages[page.id]) return state; // e.g. already deleted
          const document = withRenamedPageKey(state.document, page.id, serverPage);
          return {
            document,
            selectedNodeId:
              state.selectedNodeId === page.rootId
                ? serverPage.rootId
                : state.selectedNodeId,
          };
        });
      })
      .catch((err) => {
        set({ document: previousDocument, syncError: messageFor(err) });
      });
  },

  switchPage: (pageId) => {
    set((state) => {
      if (!state.document.pages[pageId]) return state;
      if (state.document.activePageId === pageId) return state;
      return {
        document: { ...state.document, activePageId: pageId },
        selectedNodeId: null,
      };
    });

    const { document } = get();
    documentsApi.setActivePage(document.id, pageId).catch((err) => {
      set({ syncError: messageFor(err) });
    });
  },

  renamePage: (pageId, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    flushPendingPropEdits(set, get);
    const { document: previousDocument } = get();
    const documentId = previousDocument.id;

    set((state) => {
      const page = state.document.pages[pageId];
      if (!page) return state;
      const nextPage = { ...page, name: trimmed, updatedAt: new Date().toISOString() };
      const document = withUpdatedPage(state.document, nextPage);
      return {
        document,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        future: [],
      };
    });

    pagesApi.renamePage(documentId, pageId, trimmed).catch((err) => {
      set({ document: previousDocument, syncError: messageFor(err) });
    });
  },

  deletePage: (pageId) => {
    flushPendingPropEdits(set, get);
    const { document: previousDocument } = get();
    const documentId = previousDocument.id;
    const pageIds = Object.keys(previousDocument.pages);
    if (pageIds.length <= 1 || !previousDocument.pages[pageId]) return;

    set((state) => {
      const pages = { ...state.document.pages };
      delete pages[pageId];
      const activePageId =
        state.document.activePageId === pageId
          ? Object.keys(pages)[0]
          : state.document.activePageId;
      const document = { ...state.document, pages, activePageId };
      return {
        document,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        future: [],
        selectedNodeId: null,
      };
    });

    pagesApi.deletePage(documentId, pageId).catch((err) => {
      set({ document: previousDocument, syncError: messageFor(err) });
    });
  },

  duplicatePage: (pageId) => {
    flushPendingPropEdits(set, get);
    const { document: previousDocument } = get();
    const documentId = previousDocument.id;
    const source = previousDocument.pages[pageId];
    if (!source) return;

    const existingNames = Object.values(previousDocument.pages).map((p) => p.name);
    const cloned = clonePage(source, nextDuplicateName(existingNames, source.name));

    set((state) => {
      const document: BuilderDocument = {
        ...state.document,
        pages: { ...state.document.pages, [cloned.id]: cloned },
        activePageId: cloned.id,
      };
      return {
        document,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        future: [],
        selectedNodeId: null,
      };
    });

    pagesApi
      .duplicatePage(documentId, pageId)
      .then((serverPage) => {
        set((state) => {
          const localPage = state.document.pages[cloned.id];
          if (!localPage) return state;
          const idMap = treeUtils.buildIdReconciliationMap(
            localPage.nodes,
            localPage.rootId,
            serverPage.nodes,
            serverPage.rootId
          );
          idMap[cloned.id] = serverPage.id;
          const remappedPage = treeUtils.remapNodeIds(
            { ...localPage, id: serverPage.id },
            idMap
          );
          const document = withRenamedPageKey(state.document, cloned.id, remappedPage);
          return { document };
        });
      })
      .catch((err) => {
        set({ document: previousDocument, syncError: messageFor(err) });
      });
  },

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  setActiveDrag: (id) => set({ activeDragId: id }),
  setOverId: (id) => set({ overId: id }),
  setPreviewMode: (value) =>
    set({ isPreviewMode: value, selectedNodeId: value ? null : get().selectedNodeId }),
  dismissSyncError: () => set({ syncError: null }),
  resetHydration: () => {
    if (pendingPropTimer) clearTimeout(pendingPropTimer);
    pendingPropTimer = null;
    pendingPropSnapshot = null;
    pendingPropNodes = new Map();
    set({
      document: createEmptyDocument(),
      hydrated: false,
      hydrationError: null,
      syncError: null,
      selectedNodeId: null,
      past: [],
      future: [],
    });
  },
}));
