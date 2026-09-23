import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type BlockType =
  | "container"
  | "section"
  | "heading"
  | "text"
  | "button"
  | "image"
  | "badge"
  | "avatar"
  | "input-field"
  | "divider"
  | "quote"
  | "hero-section"
  | "pricing-card"
  | "nav-bar"
  | "form-field-group"
  | "footer"
  | "feature-grid"
  | "testimonial"
  | "cta-band"
  | "two-column";

export interface BuilderNode {
  id: string;
  type: BlockType;
  props: Record<string, unknown>;
  children: string[];
  parentId: string | null;
}

export interface BuilderPage {
  id: string;
  name: string;
  rootId: string;
  nodes: Record<string, BuilderNode>;
  createdAt: string;
  updatedAt: string;
}

export interface BuilderDocument {
  schemaVersion: number;
  pages: Record<string, BuilderPage>;
  activePageId: string;
}

export type PropFieldType =
  | "text"
  | "textarea"
  | "select"
  | "url"
  | "number"
  | "boolean";

export interface PropFieldSchema {
  key: string;
  label: string;
  type: PropFieldType;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

/** A seed node used to pre-populate a composite block's subtree at insert time. */
export interface SeedNode {
  type: BlockType;
  props: Record<string, unknown>;
  children?: SeedNode[];
}

export type DragActiveData =
  | { source: "palette"; blockType: BlockType }
  | { source: "canvas"; nodeId: string; parentId: string };

export interface BlockDefinition {
  type: BlockType;
  label: string;
  category: "primitive" | "layout" | "content" | "section";
  icon: LucideIcon;
  acceptsChildren: boolean;
  defaultProps: Record<string, unknown>;
  defaultChildren?: SeedNode[];
  propsSchema: PropFieldSchema[];
  requiredImports: string[];
  render: (props: Record<string, unknown>, children: ReactNode) => ReactNode;
  codegen: (props: Record<string, unknown>, childrenJsx: string[]) => string;
  codegenHtml: (props: Record<string, unknown>, childrenHtml: string[]) => string;
}
