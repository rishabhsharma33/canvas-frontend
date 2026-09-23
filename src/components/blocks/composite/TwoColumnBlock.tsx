import { Columns2 } from "lucide-react";
import type { BlockDefinition } from "@/lib/builder/types";

export const twoColumnBlock: BlockDefinition = {
  type: "two-column",
  label: "Two Column",
  category: "section",
  icon: Columns2,
  acceptsChildren: true,
  defaultProps: {},
  defaultChildren: [
    {
      type: "image",
      props: {
        src: "https://picsum.photos/seed/dnd-builder-two-col/640/480",
        alt: "Feature preview",
      },
    },
    {
      type: "container",
      props: { direction: "column" },
      children: [
        {
          type: "heading",
          props: { text: "Built for how you actually work", level: "h2" },
        },
        {
          type: "text",
          props: {
            text: "Describe the feature or benefit here, with enough detail to make the case.",
          },
        },
        { type: "button", props: { label: "Learn more", variant: "outline" } },
      ],
    },
  ],
  propsSchema: [],
  requiredImports: [],
  render: (_props, children) => (
    <div className="grid w-full grid-cols-1 items-center gap-8 px-6 py-12 md:grid-cols-2">
      {children}
    </div>
  ),
  codegen: (_props, childrenJsx) =>
    `<div className="grid w-full grid-cols-1 items-center gap-8 px-6 py-12 md:grid-cols-2">\n${childrenJsx.join(
      "\n"
    )}\n</div>`,
  codegenHtml: (_props, childrenHtml) =>
    `<div class="grid w-full grid-cols-1 items-center gap-8 px-6 py-12 md:grid-cols-2">\n${childrenHtml.join(
      "\n"
    )}\n</div>`,
};
