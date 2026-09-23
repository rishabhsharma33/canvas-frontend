import { Quote } from "lucide-react";
import type { BlockDefinition } from "@/lib/builder/types";

export const quoteBlock: BlockDefinition = {
  type: "quote",
  label: "Quote",
  category: "content",
  icon: Quote,
  acceptsChildren: false,
  defaultProps: {
    text: "This product completely changed how our team works. Couldn't imagine going back.",
  },
  propsSchema: [{ key: "text", label: "Quote text", type: "textarea" }],
  requiredImports: [],
  render: (props) => (
    <blockquote className="max-w-prose border-l-2 border-primary pl-4 text-base italic text-muted-foreground">
      {(props.text as string) ?? ""}
    </blockquote>
  ),
  codegen: (props) =>
    `<blockquote className="max-w-prose border-l-2 border-primary pl-4 text-base italic text-muted-foreground">${
      (props.text as string) ?? ""
    }</blockquote>`,
  codegenHtml: (props) =>
    `<blockquote class="max-w-prose border-l-2 border-primary pl-4 text-base italic text-muted-foreground">${
      (props.text as string) ?? ""
    }</blockquote>`,
};
