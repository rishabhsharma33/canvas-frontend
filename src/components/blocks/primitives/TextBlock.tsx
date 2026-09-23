import { Type } from "lucide-react";
import type { BlockDefinition } from "@/lib/builder/types";

export const textBlock: BlockDefinition = {
  type: "text",
  label: "Text",
  category: "content",
  icon: Type,
  acceptsChildren: false,
  defaultProps: {
    text: "Add your body text here. Click to edit this in the property panel.",
  },
  propsSchema: [{ key: "text", label: "Text", type: "textarea" }],
  requiredImports: [],
  render: (props) => (
    <p className="max-w-prose text-base text-muted-foreground">
      {(props.text as string) ?? ""}
    </p>
  ),
  codegen: (props) =>
    `<p className="max-w-prose text-base text-muted-foreground">${
      (props.text as string) ?? ""
    }</p>`,
  codegenHtml: (props) =>
    `<p class="max-w-prose text-base text-muted-foreground">${
      (props.text as string) ?? ""
    }</p>`,
};
