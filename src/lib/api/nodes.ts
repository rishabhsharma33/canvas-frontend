import { apiFetch } from "./client";
import type { BuilderNode, SeedNode } from "@/lib/builder/types";

export interface InsertNodeResult {
  createdNodeId: string;
  nodes: Record<string, BuilderNode>;
}

export interface MoveNodeResult {
  oldParent: { id: string; childrenOrder: string[] };
  newParent: { id: string; childrenOrder: string[] };
}

export interface DuplicateNodeResult {
  newNodeId: string;
  nodes: Record<string, BuilderNode>;
}

function base(documentId: string, pageId: string) {
  return `/documents/${documentId}/pages/${pageId}/nodes`;
}

export function insertNode(
  documentId: string,
  pageId: string,
  parentId: string,
  seed: SeedNode,
  index?: number
): Promise<InsertNodeResult> {
  return apiFetch(base(documentId, pageId), {
    method: "POST",
    body: JSON.stringify({ parentId, seed, index }),
  });
}

export function updateNodeProps(
  documentId: string,
  pageId: string,
  nodeId: string,
  props: Record<string, unknown>
): Promise<BuilderNode> {
  return apiFetch(`${base(documentId, pageId)}/${nodeId}`, {
    method: "PATCH",
    body: JSON.stringify({ props }),
  });
}

export function moveNode(
  documentId: string,
  pageId: string,
  nodeId: string,
  newParentId: string,
  index: number
): Promise<MoveNodeResult> {
  return apiFetch(`${base(documentId, pageId)}/${nodeId}/move`, {
    method: "PATCH",
    body: JSON.stringify({ newParentId, index }),
  });
}

export function duplicateNode(
  documentId: string,
  pageId: string,
  nodeId: string
): Promise<DuplicateNodeResult> {
  return apiFetch(`${base(documentId, pageId)}/${nodeId}/duplicate`, {
    method: "POST",
  });
}

export function removeNode(
  documentId: string,
  pageId: string,
  nodeId: string
): Promise<{ deletedNodeIds: string[] }> {
  return apiFetch(`${base(documentId, pageId)}/${nodeId}`, {
    method: "DELETE",
  });
}
