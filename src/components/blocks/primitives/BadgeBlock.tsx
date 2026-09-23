import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BlockDefinition } from "@/lib/builder/types";

type Variant = "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";

export const badgeBlock: BlockDefinition = {
  type: "badge",
  label: "Badge",
  category: "content",
  icon: Tag,
  acceptsChildren: false,
  defaultProps: { label: "New", variant: "default" as Variant },
  propsSchema: [
    { key: "label", label: "Label", type: "text" },
    {
      key: "variant",
      label: "Variant",
      type: "select",
      options: [
        { label: "Default", value: "default" },
        { label: "Secondary", value: "secondary" },
        { label: "Destructive", value: "destructive" },
        { label: "Outline", value: "outline" },
        { label: "Ghost", value: "ghost" },
        { label: "Link", value: "link" },
      ],
    },
  ],
  requiredImports: ['import { Badge } from "@/components/ui/badge";'],
  render: (props) => (
    <Badge variant={(props.variant as Variant) ?? "default"}>
      {(props.label as string) ?? "Badge"}
    </Badge>
  ),
  codegen: (props) =>
    `<Badge variant="${(props.variant as Variant) ?? "default"}">${
      (props.label as string) ?? "Badge"
    }</Badge>`,
  codegenHtml: (props) =>
    `<span class="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">${
      (props.label as string) ?? "Badge"
    }</span>`,
};
