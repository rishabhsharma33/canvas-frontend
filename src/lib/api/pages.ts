import { apiFetch } from "./client";
import type { BuilderPage } from "@/lib/builder/types";

export function createPage(documentId: string, name?: string): Promise<BuilderPage> {
  return apiFetch(`/documents/${documentId}/pages`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function renamePage(
  documentId: string,
  pageId: string,
  name: string
): Promise<BuilderPage> {
  return apiFetch(`/documents/${documentId}/pages/${pageId}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export function deletePage(
  documentId: string,
  pageId: string
): Promise<{ deletedPageId: string; newActivePageId: string | null }> {
  return apiFetch(`/documents/${documentId}/pages/${pageId}`, {
    method: "DELETE",
  });
}

export function duplicatePage(
  documentId: string,
  pageId: string
): Promise<BuilderPage> {
  return apiFetch(`/documents/${documentId}/pages/${pageId}/duplicate`, {
    method: "POST",
  });
}
