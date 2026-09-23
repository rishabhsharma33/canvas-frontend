import type { BuilderPage } from "./types";
import { getBlockDefinition } from "./registry";
import { getStyleClassName } from "./style-props";
import { cn } from "@/lib/utils";

const INDENT = "  ";

function indent(code: string, depth: number): string {
  const pad = INDENT.repeat(depth);
  return code
    .split("\n")
    .map((line) => (line.length ? pad + line : line))
    .join("\n");
}

/**
 * Merges extra classes into a generated element's root className/class attribute — or inserts
 * one if the block's codegen didn't emit one — so per-node style overrides survive export.
 * Relies on the root tag's own attribute always being the first match in the string, since
 * children are always written after it.
 */
function injectClassName(
  code: string,
  extra: string,
  attr: "className" | "class"
): string {
  if (!extra) return code;
  const pattern = new RegExp(`${attr}="([^"]*)"`);
  const match = code.match(pattern);
  if (match) {
    return code.replace(pattern, `${attr}="${cn(match[1], extra)}"`);
  }
  return code.replace(/^(<[A-Za-z][\w.]*)/, `$1 ${attr}="${cn(extra)}"`);
}

function walk(
  page: BuilderPage,
  nodeId: string,
  depth: number,
  emit: "jsx" | "html",
  imports: Set<string>
): string {
  const node = page.nodes[nodeId];
  const def = getBlockDefinition(node.type);
  def.requiredImports.forEach((imp) => imports.add(imp));

  const childrenCode = node.children.map((childId) =>
    indent(walk(page, childId, depth + 1, emit, imports), 1)
  );

  const raw =
    emit === "jsx"
      ? def.codegen(node.props, childrenCode)
      : def.codegenHtml(node.props, childrenCode);

  return injectClassName(
    raw,
    getStyleClassName(node.props),
    emit === "jsx" ? "className" : "class"
  );
}

export function generateJsx(page: BuilderPage): string {
  const imports = new Set<string>();
  const body = indent(walk(page, page.rootId, 0, "jsx", imports), 2);

  const importLines = Array.from(imports).sort();
  const header = [
    ...importLines,
    "",
    "export default function ExportedPage() {",
    "  return (",
  ].join("\n");

  return `${header}\n${body}\n  );\n}\n`;
}

export function generateHtml(page: BuilderPage): string {
  const imports = new Set<string>();
  const body = indent(walk(page, page.rootId, 0, "html", imports), 1);

  return [
    "<!doctype html>",
    '<html lang="en">',
    "  <head>",
    '    <meta charset="utf-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1" />',
    "    <title>Exported Page</title>",
    '    <script src="https://cdn.tailwindcss.com"></script>',
    "  </head>",
    "  <body>",
    body,
    "  </body>",
    "</html>",
    "",
  ].join("\n");
}

export function generateCode(page: BuilderPage, format: "jsx" | "html"): string {
  return format === "jsx" ? generateJsx(page) : generateHtml(page);
}
