import type { BuilderDocument } from "./types";
import { createSeedNode } from "./registry";
import * as documentsApi from "@/lib/api/documents";
import * as nodesApi from "@/lib/api/nodes";

/** Placeholder shown only until `loadOrCreateDocument` resolves; nothing reads it before then. */
export function createEmptyDocument(): BuilderDocument {
  return { id: "", name: "", schemaVersion: 1, pages: {}, activePageId: "" };
}

/**
 * Seeds a brand-new blank page with the same starter content the app used to
 * create locally (nav-bar + hero-section) — done via the nodes API, since only
 * the frontend's block registry knows these blocks' default props/children.
 */
async function seedStarterContent(
  documentId: string,
  pageId: string,
  rootId: string
): Promise<void> {
  await nodesApi.insertNode(documentId, pageId, rootId, createSeedNode("nav-bar"));
  await nodesApi.insertNode(documentId, pageId, rootId, createSeedNode("hero-section"));
}

/**
 * Loads the current user's document, creating one (with starter content) the
 * first time they ever hydrate. Per-user document management stays this simple
 * for now — one auto-managed document per account, matching the app's existing
 * single-project UX; a documents picker can be layered on later.
 */
export async function loadOrCreateDocument(): Promise<BuilderDocument> {
  const summaries = await documentsApi.listDocuments();
  if (summaries.length > 0) {
    return documentsApi.getDocument(summaries[0].id);
  }

  const created = await documentsApi.createDocument("My Site");
  const homePage = created.pages[created.activePageId];
  await seedStarterContent(created.id, homePage.id, homePage.rootId);
  return documentsApi.getDocument(created.id);
}
