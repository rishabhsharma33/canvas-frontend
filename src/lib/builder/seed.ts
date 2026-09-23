import { v4 as uuid } from "uuid";
import type { BuilderDocument, BuilderPage } from "./types";
import { materializeSeed } from "./tree-utils";
import { createSeedNode } from "./registry";

export const SCHEMA_VERSION = 1;

/** Builds a fresh starter page: a root container seeded with a nav bar and a hero section. */
export function createStarterPage(name = "Home"): BuilderPage {
  const nodes: BuilderPage["nodes"] = {};
  const rootId = uuid();
  nodes[rootId] = {
    id: rootId,
    type: "container",
    props: { direction: "column" },
    children: [],
    parentId: null,
  };

  const navId = materializeSeed(createSeedNode("nav-bar"), rootId, nodes);
  const heroId = materializeSeed(createSeedNode("hero-section"), rootId, nodes);
  nodes[rootId].children.push(navId, heroId);

  const now = new Date().toISOString();
  return {
    id: uuid(),
    name,
    rootId,
    nodes,
    createdAt: now,
    updatedAt: now,
  };
}

/** Builds a fresh, empty page: just a root container with no seeded content. */
export function createBlankPage(name: string): BuilderPage {
  const nodes: BuilderPage["nodes"] = {};
  const rootId = uuid();
  nodes[rootId] = {
    id: rootId,
    type: "container",
    props: { direction: "column" },
    children: [],
    parentId: null,
  };

  const now = new Date().toISOString();
  return {
    id: uuid(),
    name,
    rootId,
    nodes,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Picks the next "<base> (N)" name for a duplicate, given the names already in use. Stripping any
 * existing "(N)" suffix off the source name first means duplicating "Home (2)" produces "Home (3)"
 * rather than "Home (2) (1)".
 */
export function nextDuplicateName(existingNames: string[], sourceName: string): string {
  const match = sourceName.match(/^(.*) \((\d+)\)$/);
  const base = match ? match[1] : sourceName;
  const escapedBase = base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^${escapedBase} \\((\\d+)\\)$`);

  let maxN = 0;
  for (const name of existingNames) {
    const nameMatch = name.match(pattern);
    if (nameMatch) maxN = Math.max(maxN, parseInt(nameMatch[1], 10));
  }
  return `${base} (${maxN + 1})`;
}

/** Deep-clones a page (all nodes, fresh ids) as a new page under the given name. */
export function clonePage(source: BuilderPage, name: string): BuilderPage {
  const idMap: Record<string, string> = {};
  Object.keys(source.nodes).forEach((oldId) => {
    idMap[oldId] = uuid();
  });

  const nodes: BuilderPage["nodes"] = {};
  Object.entries(source.nodes).forEach(([oldId, node]) => {
    const newId = idMap[oldId];
    nodes[newId] = {
      id: newId,
      type: node.type,
      props: { ...node.props },
      children: node.children.map((childId) => idMap[childId]),
      parentId: node.parentId ? idMap[node.parentId] : null,
    };
  });

  const now = new Date().toISOString();
  return {
    id: uuid(),
    name,
    rootId: idMap[source.rootId],
    nodes,
    createdAt: now,
    updatedAt: now,
  };
}

export function createStarterDocument(): BuilderDocument {
  const page = createStarterPage();
  return {
    schemaVersion: SCHEMA_VERSION,
    pages: { [page.id]: page },
    activePageId: page.id,
  };
}
