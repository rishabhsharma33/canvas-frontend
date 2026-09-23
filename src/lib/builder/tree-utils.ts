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
