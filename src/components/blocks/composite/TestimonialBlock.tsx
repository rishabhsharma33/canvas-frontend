import { MessageSquareQuote } from "lucide-react";
import type { BlockDefinition } from "@/lib/builder/types";

export const testimonialBlock: BlockDefinition = {
  type: "testimonial",
  label: "Testimonial",
  category: "section",
  icon: MessageSquareQuote,
  acceptsChildren: true,
  defaultProps: {},
  defaultChildren: [
    {
      type: "quote",
      props: {
        text: "This product completely changed how our team works. Couldn't imagine going back.",
      },
    },
    { type: "avatar", props: { fallback: "JS" } },
    { type: "heading", props: { text: "Jamie Smith", level: "h4" } },
    { type: "text", props: { text: "Head of Product, Example Co." } },
  ],
  propsSchema: [],
  requiredImports: [],
  render: (_props, children) => (
    <div className="flex w-full max-w-xl flex-col items-center gap-3 px-6 py-12 text-center">
      {children}
    </div>
  ),
  codegen: (_props, childrenJsx) =>
    `<div className="flex w-full max-w-xl flex-col items-center gap-3 px-6 py-12 text-center">\n${childrenJsx.join(
      "\n"
    )}\n</div>`,
  codegenHtml: (_props, childrenHtml) =>
    `<div class="flex w-full max-w-xl flex-col items-center gap-3 px-6 py-12 text-center">\n${childrenHtml.join(
      "\n"
    )}\n</div>`,
};
