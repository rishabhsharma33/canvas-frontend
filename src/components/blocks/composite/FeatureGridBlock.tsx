import { LayoutGrid } from "lucide-react";
import type { BlockDefinition } from "@/lib/builder/types";

export const featureGridBlock: BlockDefinition = {
  type: "feature-grid",
  label: "Feature Grid",
  category: "section",
  icon: LayoutGrid,
  acceptsChildren: true,
  defaultProps: {},
  defaultChildren: [
    {
      type: "container",
      props: { direction: "column" },
      children: [
        { type: "heading", props: { text: "Fast", level: "h4" } },
        {
          type: "text",
          props: {
            text: "Built for speed, from the first paint to the last interaction.",
          },
        },
      ],
    },
    {
      type: "container",
      props: { direction: "column" },
      children: [
        { type: "heading", props: { text: "Flexible", level: "h4" } },
        {
          type: "text",
          props: { text: "Compose exactly the layout your product needs." },
        },
      ],
    },
    {
      type: "container",
      props: { direction: "column" },
      children: [
        { type: "heading", props: { text: "Reliable", level: "h4" } },
        {
          type: "text",
          props: { text: "Tested patterns you can ship with confidence." },
        },
      ],
    },
  ],
  propsSchema: [],
  requiredImports: [],
  render: (_props, children) => (
    <div className="grid w-full grid-cols-1 gap-6 px-6 py-12 md:grid-cols-3">
      {children}
    </div>
  ),
  codegen: (_props, childrenJsx) =>
    `<div className="grid w-full grid-cols-1 gap-6 px-6 py-12 md:grid-cols-3">\n${childrenJsx.join(
      "\n"
    )}\n</div>`,
  codegenHtml: (_props, childrenHtml) =>
    `<div class="grid w-full grid-cols-1 gap-6 px-6 py-12 md:grid-cols-3">\n${childrenHtml.join(
      "\n"
    )}\n</div>`,
};
