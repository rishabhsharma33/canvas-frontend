import { PanelTop } from "lucide-react";
import type { BlockDefinition } from "@/lib/builder/types";

export const sectionBlock: BlockDefinition = {
  type: "section",
  label: "Section",
  category: "layout",
  icon: PanelTop,
  acceptsChildren: true,
  defaultProps: {},
  propsSchema: [],
  requiredImports: [],
  render: (_props, children) => (
    <section className="flex w-full flex-col items-center gap-4 px-6 py-12">
      {children}
    </section>
  ),
  codegen: (_props, childrenJsx) =>
    `<section className="flex w-full flex-col items-center gap-4 px-6 py-12">\n${childrenJsx.join(
      "\n"
    )}\n</section>`,
  codegenHtml: (_props, childrenHtml) =>
    `<section class="flex w-full flex-col items-center gap-4 px-6 py-12">\n${childrenHtml.join(
      "\n"
    )}\n</section>`,
};
