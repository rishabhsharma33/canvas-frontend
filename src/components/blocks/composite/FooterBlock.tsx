import { PanelBottom } from "lucide-react";
import type { BlockDefinition } from "@/lib/builder/types";

export const footerBlock: BlockDefinition = {
  type: "footer",
  label: "Footer",
  category: "section",
  icon: PanelBottom,
  acceptsChildren: true,
  defaultProps: {},
  defaultChildren: [
    { type: "heading", props: { text: "Acme Inc.", level: "h4" } },
    { type: "text", props: { text: "© 2026 Acme Inc. All rights reserved." } },
    {
      type: "container",
      props: { direction: "row" },
      children: [
        { type: "button", props: { label: "Privacy", variant: "link" } },
        { type: "button", props: { label: "Terms", variant: "link" } },
        { type: "button", props: { label: "Contact", variant: "link" } },
      ],
    },
  ],
  propsSchema: [],
  requiredImports: [],
  render: (_props, children) => (
    <footer className="flex w-full flex-col items-center gap-3 border-t px-6 py-10 text-center">
      {children}
    </footer>
  ),
  codegen: (_props, childrenJsx) =>
    `<footer className="flex w-full flex-col items-center gap-3 border-t px-6 py-10 text-center">\n${childrenJsx.join(
      "\n"
    )}\n</footer>`,
  codegenHtml: (_props, childrenHtml) =>
    `<footer class="flex w-full flex-col items-center gap-3 border-t px-6 py-10 text-center">\n${childrenHtml.join(
      "\n"
    )}\n</footer>`,
};
