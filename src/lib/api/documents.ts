import { apiFetch } from "./client";
import type { BuilderDocument } from "@/lib/builder/types";

export interface DocumentSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  pageCount: number;
}

export function listDocuments(): Promise<DocumentSummary[]> {
  return apiFetch("/documents");
}

export function createDocument(name: string): Promise<BuilderDocument> {
  return apiFetch("/documents", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function getDocument(documentId: string): Promise<BuilderDocument> {
  return apiFetch(`/documents/${documentId}`);
}

export function setActivePage(
  documentId: string,
  pageId: string
): Promise<{ activePageId: string }> {
  return apiFetch(`/documents/${documentId}/active-page`, {
    method: "PATCH",
    body: JSON.stringify({ pageId }),
  });
}
