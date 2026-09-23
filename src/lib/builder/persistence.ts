import type { BuilderDocument } from "./types";
import { SCHEMA_VERSION } from "./seed";

const STORAGE_KEY = `dnd-builder:document:v${SCHEMA_VERSION}`;
const AUTOSAVE_DELAY_MS = 500;

/** Migrations from an older schemaVersion to the current one. Empty for v1 — real chain lives here later. */
const migrations: Record<number, (old: unknown) => BuilderDocument> = {};

export function loadDocument(): BuilderDocument | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BuilderDocument;
    if (parsed.schemaVersion === SCHEMA_VERSION) return parsed;

    let migrated: unknown = parsed;
    for (let v = parsed.schemaVersion; v < SCHEMA_VERSION; v++) {
      const migrate = migrations[v];
      if (!migrate) return null;
      migrated = migrate(migrated);
    }
    return migrated as BuilderDocument;
  } catch {
    return null;
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function saveDocument(document: BuilderDocument): void {
  if (typeof window === "undefined") return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(document));
    } catch {
      // localStorage unavailable (private mode / quota) — silently skip persistence.
    }
  }, AUTOSAVE_DELAY_MS);
}
