import { ListChecks } from "lucide-react";
import type { BlockDefinition } from "@/lib/builder/types";

export const formFieldGroupBlock: BlockDefinition = {
  type: "form-field-group",
  label: "Form",
  category: "section",
  icon: ListChecks,
  acceptsChildren: true,
  defaultProps: {},
  defaultChildren: [
    {
      type: "input-field",
      props: { label: "Name", placeholder: "Jane Doe" },
    },
    {
      type: "input-field",
      props: { label: "Email", placeholder: "you@example.com" },
    },
    { type: "button", props: { label: "Submit", variant: "default" } },
  ],
  propsSchema: [],
  requiredImports: [],
  render: (_props, children) => (
    <form className="flex w-full max-w-sm flex-col items-start gap-3">
      {children}
    </form>
  ),
  codegen: (_props, childrenJsx) =>
    `<form className="flex w-full max-w-sm flex-col items-start gap-3">\n${childrenJsx.join(
      "\n"
    )}\n</form>`,
  codegenHtml: (_props, childrenHtml) =>
    `<form class="flex w-full max-w-sm flex-col items-start gap-3">\n${childrenHtml.join(
      "\n"
    )}\n</form>`,
};
