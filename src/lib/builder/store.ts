import { create } from "zustand";
import type {
  BuilderDocument,
  BuilderPage,
  DragActiveData,
  SeedNode,
} from "./types";
import * as treeUtils from "./tree-utils";
import type { DropTargetData } from "./tree-utils";
import {
  clonePage,
  createBlankPage,
  createStarterDocument,
  nextDuplicateName,
} from "./seed";
import { loadDocument, saveDocument } from "./persistence";
import { createSeedNode } from "./registry";

interface BuilderState {
  document: BuilderDocument;
  hydrated: boolean;
  selectedNodeId: string | null;
  activeDragId: string | null;
  overId: string | null;
  isPreviewMode: boolean;
  past: BuilderDocument[];
  future: BuilderDocument[];

  hydrate: () => void;
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

const HISTORY_LIMIT = 50;
const PROP_EDIT_DEBOUNCE_MS = 500;

/**
 * Rapid updateNodeProps calls (every keystroke in the property panel) are coalesced into a
 * single undo step: the document from just before the burst is captured here and only pushed
 * onto `past` once the burst goes quiet, rather than on every keystroke.
 */
let pendingPropSnapshot: BuilderDocument | null = null;
let pendingPropTimer: ReturnType<typeof setTimeout> | null = null;

type SetState = (
  partial:
    | Partial<BuilderState>
    | ((state: BuilderState) => Partial<BuilderState>)
) => void;

/** Commits any pending debounced prop-edit snapshot to history immediately, as its own step. */
function flushPendingPropHistory(set: SetState) {
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
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  document: createStarterDocument(),
  hydrated: false,
  selectedNodeId: null,
  activeDragId: null,
  overId: null,
  isPreviewMode: false,
  past: [],
  future: [],

  hydrate: () => {
    if (get().hydrated) return;
    const loaded = loadDocument();
    set({
      document: loaded ?? get().document,
      hydrated: true,
      past: [],
      future: [],
    });
  },

  activePage: () => {
    const { document } = get();
    return document.pages[document.activePageId];
  },

  insertNode: (parentId, seed, index) => {
    flushPendingPropHistory(set);
    set((state) => {
      const page = state.document.pages[state.document.activePageId];
      const nextPage = treeUtils.insertNode(page, parentId, seed, index);
      const document = withUpdatedPage(state.document, nextPage);
      saveDocument(document);
      return {
        document,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        future: [],
      };
    });
  },

  removeNode: (nodeId) => {
    flushPendingPropHistory(set);
    set((state) => {
      const page = state.document.pages[state.document.activePageId];
      const nextPage = treeUtils.removeNode(page, nodeId);
      const document = withUpdatedPage(state.document, nextPage);
      saveDocument(document);
      return {
        document,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        future: [],
        selectedNodeId:
          state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      };
    });
  },

  duplicateNode: (nodeId) => {
    flushPendingPropHistory(set);
    set((state) => {
      const page = state.document.pages[state.document.activePageId];
      const node = page.nodes[nodeId];
      if (!node || node.parentId === null) return state;

      const nextPage = treeUtils.duplicateNode(page, nodeId);
      const parent = nextPage.nodes[node.parentId];
      const newNodeId = parent.children[parent.children.indexOf(nodeId) + 1];

      const document = withUpdatedPage(state.document, nextPage);
      saveDocument(document);
      return {
        document,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        future: [],
        selectedNodeId: newNodeId ?? state.selectedNodeId,
      };
    });
  },

  moveNode: (nodeId, newParentId, index) => {
    flushPendingPropHistory(set);
    set((state) => {
      const page = state.document.pages[state.document.activePageId];
      const nextPage = treeUtils.moveNode(page, nodeId, newParentId, index);
      const document = withUpdatedPage(state.document, nextPage);
      saveDocument(document);
      return {
        document,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        future: [],
      };
    });
  },

  updateNodeProps: (nodeId, props) => {
    const preEditDocument = get().document;
    if (pendingPropTimer) clearTimeout(pendingPropTimer);
    if (!pendingPropSnapshot) pendingPropSnapshot = preEditDocument;
    pendingPropTimer = setTimeout(() => {
      const snapshot = pendingPropSnapshot;
      pendingPropSnapshot = null;
      pendingPropTimer = null;
      if (snapshot) {
        set((state) => ({
          past: [...state.past, snapshot].slice(-HISTORY_LIMIT),
          future: [],
        }));
      }
    }, PROP_EDIT_DEBOUNCE_MS);

    set((state) => {
      const page = state.document.pages[state.document.activePageId];
      const nextPage = treeUtils.updateNodeProps(page, nodeId, props);
      const document = withUpdatedPage(state.document, nextPage);
      saveDocument(document);
      return { document };
    });
  },

  handleDrop: (active, over) => {
    flushPendingPropHistory(set);
    set((state) => {
      const page = state.document.pages[state.document.activePageId];
      const { parentId, index } = treeUtils.resolveDropTarget(page, over);
      let nextPage = page;

      if (active.source === "palette") {
        nextPage = treeUtils.insertNode(
          page,
          parentId,
          createSeedNode(active.blockType),
          index
        );
      } else {
        let targetIndex = index;
        if (parentId === active.parentId) {
          const originalIndex = page.nodes[parentId].children.indexOf(
            active.nodeId
          );
          if (originalIndex !== -1 && originalIndex < targetIndex) {
            targetIndex -= 1;
          }
        }
        nextPage = treeUtils.moveNode(
          page,
          active.nodeId,
          parentId,
          targetIndex
        );
      }

      const document = withUpdatedPage(state.document, nextPage);
      saveDocument(document);
      return {
        document,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        future: [],
      };
    });
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
      } else {
        if (past.length === 0) return state;
        target = past[past.length - 1];
        past = past.slice(0, -1);
      }
      saveDocument(target);
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
      saveDocument(target);
      return {
        document: target,
        future,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        selectedNodeId: null,
      };
    });
  },

  createPage: (name) => {
    flushPendingPropHistory(set);
    set((state) => {
      const pageName =
        name?.trim() || `Page ${Object.keys(state.document.pages).length + 1}`;
      const page = createBlankPage(pageName);
      const document: BuilderDocument = {
        ...state.document,
        pages: { ...state.document.pages, [page.id]: page },
        activePageId: page.id,
      };
      saveDocument(document);
      return {
        document,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        future: [],
        selectedNodeId: null,
      };
    });
  },

  switchPage: (pageId) => {
    set((state) => {
      if (!state.document.pages[pageId]) return state;
      if (state.document.activePageId === pageId) return state;
      const document = { ...state.document, activePageId: pageId };
      saveDocument(document);
      return { document, selectedNodeId: null };
    });
  },

  renamePage: (pageId, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    flushPendingPropHistory(set);
    set((state) => {
      const page = state.document.pages[pageId];
      if (!page) return state;
      const nextPage = { ...page, name: trimmed, updatedAt: new Date().toISOString() };
      const document = withUpdatedPage(state.document, nextPage);
      saveDocument(document);
      return {
        document,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        future: [],
      };
    });
  },

  deletePage: (pageId) => {
    flushPendingPropHistory(set);
    set((state) => {
      const pageIds = Object.keys(state.document.pages);
      if (pageIds.length <= 1 || !state.document.pages[pageId]) return state;

      const pages = { ...state.document.pages };
      delete pages[pageId];
      const activePageId =
        state.document.activePageId === pageId
          ? Object.keys(pages)[0]
          : state.document.activePageId;
      const document = { ...state.document, pages, activePageId };
      saveDocument(document);
      return {
        document,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        future: [],
        selectedNodeId: null,
      };
    });
  },

  duplicatePage: (pageId) => {
    flushPendingPropHistory(set);
    set((state) => {
      const source = state.document.pages[pageId];
      if (!source) return state;
      const existingNames = Object.values(state.document.pages).map((p) => p.name);
      const cloned = clonePage(source, nextDuplicateName(existingNames, source.name));
      const document: BuilderDocument = {
        ...state.document,
        pages: { ...state.document.pages, [cloned.id]: cloned },
        activePageId: cloned.id,
      };
      saveDocument(document);
      return {
        document,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        future: [],
        selectedNodeId: null,
      };
    });
  },

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  setActiveDrag: (id) => set({ activeDragId: id }),
  setOverId: (id) => set({ overId: id }),
  setPreviewMode: (value) =>
    set({ isPreviewMode: value, selectedNodeId: value ? null : get().selectedNodeId }),
}));
