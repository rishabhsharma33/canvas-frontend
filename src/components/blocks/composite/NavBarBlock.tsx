import { PanelsTopLeft } from "lucide-react";
import type { BlockDefinition } from "@/lib/builder/types";

export const navBarBlock: BlockDefinition = {
  type: "nav-bar",
  label: "Nav Bar",
  category: "section",
  icon: PanelsTopLeft,
  acceptsChildren: true,
  defaultProps: {},
  defaultChildren: [
    { type: "heading", props: { text: "Acme Inc.", level: "h4" } },
    { type: "button", props: { label: "Sign in", variant: "outline" } },
  ],
  propsSchema: [],
  requiredImports: [],
  render: (_props, children) => (
    <nav className="flex w-full flex-row items-center justify-between border-b px-6 py-4">
      {children}
    </nav>
  ),
  codegen: (_props, childrenJsx) =>
    `<nav className="flex w-full flex-row items-center justify-between border-b px-6 py-4">\n${childrenJsx.join(
      "\n"
    )}\n</nav>`,
  codegenHtml: (_props, childrenHtml) =>
    `<nav class="flex w-full flex-row items-center justify-between border-b px-6 py-4">\n${childrenHtml.join(
      "\n"
    )}\n</nav>`,
};
