import { v4 as uuid } from "uuid";
import type { BuilderNode, BuilderPage, SeedNode } from "./types";

/** Recursively materializes a SeedNode subtree into real BuilderNode entries with fresh ids. */
export function materializeSeed(
  seed: SeedNode,
  parentId: string | null,
  nodes: Record<string, BuilderNode>
): string {
  const id = uuid();
  const childIds = (seed.children ?? []).map((child) =>
    materializeSeed(child, id, nodes)
  );
  nodes[id] = {
    id,
    type: seed.type,
    props: { ...seed.props },
    children: childIds,
    parentId,
  };
  return id;
}

/** Inserts a new node (optionally with a seeded subtree) into a parent's children at a given index. */
export function insertNode(
  page: BuilderPage,
  parentId: string,
  seed: SeedNode,
  index?: number
): BuilderPage {
  const nodes = { ...page.nodes };
  const newId = materializeSeed(seed, parentId, nodes);

  const parent = nodes[parentId];
  const children = [...parent.children];
  const insertAt = index ?? children.length;
  children.splice(insertAt, 0, newId);
  nodes[parentId] = { ...parent, children };

  return { ...page, nodes, updatedAt: new Date().toISOString() };
}

/** Removes a node and all of its descendants from the page. */
export function removeNode(page: BuilderPage, nodeId: string): BuilderPage {
  const nodes = { ...page.nodes };
  const target = nodes[nodeId];
  if (!target) return page;

  const idsToRemove = new Set<string>();
  const collect = (id: string) => {
    idsToRemove.add(id);
    nodes[id]?.children.forEach(collect);
  };
  collect(nodeId);

  if (target.parentId && nodes[target.parentId]) {
    const parent = nodes[target.parentId];
    nodes[target.parentId] = {
      ...parent,
      children: parent.children.filter((id) => id !== nodeId),
    };
  }

  idsToRemove.forEach((id) => delete nodes[id]);

  return { ...page, nodes, updatedAt: new Date().toISOString() };
}

/** Recursively clones an existing node subtree under a (possibly different) parent, with fresh ids. */
function cloneSubtree(
  sourceNodes: Record<string, BuilderNode>,
  sourceId: string,
  newParentId: string,
  targetNodes: Record<string, BuilderNode>
): string {
  const source = sourceNodes[sourceId];
  const newId = uuid();
  const childIds = source.children.map((childId) =>
    cloneSubtree(sourceNodes, childId, newId, targetNodes)
  );
  targetNodes[newId] = {
    id: newId,
    type: source.type,
    props: { ...source.props },
    children: childIds,
    parentId: newParentId,
  };
  return newId;
}

/** Duplicates a node (and its descendants) as a new sibling immediately after it. Root can't be duplicated. */
export function duplicateNode(page: BuilderPage, nodeId: string): BuilderPage {
  const node = page.nodes[nodeId];
  if (!node || node.parentId === null) return page;

  const nodes = { ...page.nodes };
  const newId = cloneSubtree(page.nodes, nodeId, node.parentId, nodes);

  const parent = nodes[node.parentId];
  const children = [...parent.children];
  const index = children.indexOf(nodeId);
  children.splice(index + 1, 0, newId);
  nodes[node.parentId] = { ...parent, children };

  return { ...page, nodes, updatedAt: new Date().toISOString() };
}

/** True if `maybeDescendantId` is `ancestorId` itself or nested anywhere beneath it. */
export function isDescendant(
  nodes: Record<string, BuilderNode>,
  ancestorId: string,
  maybeDescendantId: string
): boolean {
  if (ancestorId === maybeDescendantId) return true;
  const node = nodes[ancestorId];
  if (!node) return false;
  return node.children.some((childId) =>
    isDescendant(nodes, childId, maybeDescendantId)
  );
}

/** Moves an existing node to a new parent at a given index (also used for same-parent reorders). */
export function moveNode(
  page: BuilderPage,
  nodeId: string,
  newParentId: string,
  index: number
): BuilderPage {
  const node = page.nodes[nodeId];
  if (!node) return page;
  if (node.parentId === null) return page; // never move the root
  if (isDescendant(page.nodes, nodeId, newParentId)) return page; // cycle guard

  const nodes = { ...page.nodes };
  const oldParentId = node.parentId;

  if (oldParentId) {
    const oldParent = nodes[oldParentId];
    nodes[oldParentId] = {
      ...oldParent,
      children: oldParent.children.filter((id) => id !== nodeId),
    };
  }

  const newParent = nodes[newParentId];
  const children = [...newParent.children];
  const clampedIndex = Math.max(0, Math.min(index, children.length));
  children.splice(clampedIndex, 0, nodeId);
  nodes[newParentId] = { ...newParent, children };

  nodes[nodeId] = { ...node, parentId: newParentId };

  return { ...page, nodes, updatedAt: new Date().toISOString() };
}

export type DropTargetData =
  | { type: "container-end"; containerId: string }
  | { type: "before-node"; nodeId: string; parentId: string };

/** Resolves a drop-target descriptor into a concrete (parentId, index) insertion point. */
export function resolveDropTarget(
  page: BuilderPage,
  target: DropTargetData
): { parentId: string; index: number } {
  if (target.type === "container-end") {
    const container = page.nodes[target.containerId];
    return { parentId: target.containerId, index: container.children.length };
  }
  const parent = page.nodes[target.parentId];
  const index = parent.children.indexOf(target.nodeId);
  return { parentId: target.parentId, index: index === -1 ? parent.children.length : index };
}

export function updateNodeProps(
  page: BuilderPage,
  nodeId: string,
  props: Record<string, unknown>
): BuilderPage {
  const node = page.nodes[nodeId];
  if (!node) return page;
  return {
    ...page,
    nodes: {
      ...page.nodes,
      [nodeId]: { ...node, props: { ...node.props, ...props } },
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Builds a local-id -> server-id map by walking two structurally-identical
 * subtrees in lockstep (same shape, since the server materialized the exact
 * same seed/clone the client did locally) — used to reconcile a client-generated
 * id with the real one the backend assigned once its response comes back.
 */
export function buildIdReconciliationMap(
  localNodes: Record<string, BuilderNode>,
  localRootId: string,
  serverNodes: Record<string, BuilderNode>,
  serverRootId: string
): Record<string, string> {
  const map: Record<string, string> = {};

  function walk(localId: string, serverId: string) {
    map[localId] = serverId;
    const localNode = localNodes[localId];
    const serverNode = serverNodes[serverId];
    if (!localNode || !serverNode) return;
    localNode.children.forEach((childLocalId, index) => {
      const childServerId = serverNode.children[index];
      if (childServerId) walk(childLocalId, childServerId);
    });
  }

  walk(localRootId, serverRootId);
  return map;
}

/** Rewrites every node id (map keys, parentId, children arrays) in a page through an id map. */
export function remapNodeIds(
  page: BuilderPage,
  idMap: Record<string, string>
): BuilderPage {
  if (Object.keys(idMap).length === 0) return page;
  const remap = (id: string) => idMap[id] ?? id;

  const nodes: Record<string, BuilderNode> = {};
  for (const node of Object.values(page.nodes)) {
    const newId = remap(node.id);
    nodes[newId] = {
      ...node,
      id: newId,
      parentId: node.parentId ? remap(node.parentId) : null,
      children: node.children.map(remap),
    };
  }

  return { ...page, nodes, rootId: remap(page.rootId) };
}
