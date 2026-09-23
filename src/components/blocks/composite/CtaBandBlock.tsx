import { Megaphone } from "lucide-react";
import type { BlockDefinition } from "@/lib/builder/types";

// Nested Text/Heading blocks hardcode their own text color; these child selectors override
// them so copy stays legible against the band's solid primary-color background.
const bandClassName =
  "flex w-full flex-col items-center gap-4 bg-primary px-6 py-16 text-center text-primary-foreground [&_p]:text-primary-foreground/85 [&_h1]:text-primary-foreground [&_h2]:text-primary-foreground [&_h3]:text-primary-foreground [&_h4]:text-primary-foreground";

export const ctaBandBlock: BlockDefinition = {
  type: "cta-band",
  label: "CTA Band",
  category: "section",
  icon: Megaphone,
  acceptsChildren: true,
  defaultProps: {},
  defaultChildren: [
    { type: "heading", props: { text: "Ready to get started?", level: "h2" } },
    {
      type: "text",
      props: {
        text: "Join thousands of teams already building with our platform.",
      },
    },
    { type: "button", props: { label: "Start free trial", variant: "secondary" } },
  ],
  propsSchema: [],
  requiredImports: [],
  render: (_props, children) => (
    <section className={bandClassName}>{children}</section>
  ),
  codegen: (_props, childrenJsx) =>
    `<section className="${bandClassName}">\n${childrenJsx.join("\n")}\n</section>`,
  codegenHtml: (_props, childrenHtml) =>
    `<section class="${bandClassName}">\n${childrenHtml.join("\n")}\n</section>`,
};
