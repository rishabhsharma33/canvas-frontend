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

export function createStarterDocument(): BuilderDocument {
  const page = createStarterPage();
  return {
    schemaVersion: SCHEMA_VERSION,
    pages: { [page.id]: page },
    activePageId: page.id,
  };
}
