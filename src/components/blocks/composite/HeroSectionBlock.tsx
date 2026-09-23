import { LayoutTemplate } from "lucide-react";
import type { BlockDefinition } from "@/lib/builder/types";

export const heroSectionBlock: BlockDefinition = {
  type: "hero-section",
  label: "Hero Section",
  category: "section",
  icon: LayoutTemplate,
  acceptsChildren: true,
  defaultProps: {},
  defaultChildren: [
    {
      type: "heading",
      props: { text: "Build pages by dragging, not coding", level: "h1" },
    },
    {
      type: "text",
      props: {
        text: "Arrange prebuilt shadcn/ui blocks on the canvas, edit their content live, and export clean JSX when you're done.",
      },
    },
    { type: "button", props: { label: "Get Started", variant: "default" } },
  ],
  propsSchema: [],
  requiredImports: [],
  render: (_props, children) => (
    <section className="flex w-full flex-col items-center gap-4 rounded-lg bg-muted/40 px-6 py-16 text-center">
      {children}
    </section>
  ),
  codegen: (_props, childrenJsx) =>
    `<section className="flex w-full flex-col items-center gap-4 rounded-lg bg-muted/40 px-6 py-16 text-center">\n${childrenJsx.join(
      "\n"
    )}\n</section>`,
  codegenHtml: (_props, childrenHtml) =>
    `<section class="flex w-full flex-col items-center gap-4 rounded-lg bg-muted/40 px-6 py-16 text-center">\n${childrenHtml.join(
      "\n"
    )}\n</section>`,
};
