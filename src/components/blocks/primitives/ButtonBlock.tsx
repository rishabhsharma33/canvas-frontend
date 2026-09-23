import { RectangleHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BlockDefinition } from "@/lib/builder/types";

type Variant = "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";

export const buttonBlock: BlockDefinition = {
  type: "button",
  label: "Button",
  category: "content",
  icon: RectangleHorizontal,
  acceptsChildren: false,
  defaultProps: { label: "Click me", variant: "default" as Variant },
  propsSchema: [
    { key: "label", label: "Label", type: "text" },
    {
      key: "variant",
      label: "Variant",
      type: "select",
      options: [
        { label: "Default", value: "default" },
        { label: "Outline", value: "outline" },
        { label: "Secondary", value: "secondary" },
        { label: "Ghost", value: "ghost" },
        { label: "Destructive", value: "destructive" },
        { label: "Link", value: "link" },
      ],
    },
  ],
  requiredImports: ['import { Button } from "@/components/ui/button";'],
  render: (props) => (
    <Button variant={(props.variant as Variant) ?? "default"}>
      {(props.label as string) ?? "Button"}
    </Button>
  ),
  codegen: (props) =>
    `<Button variant="${(props.variant as Variant) ?? "default"}">${
      (props.label as string) ?? "Button"
    }</Button>`,
  codegenHtml: (props) =>
    `<button class="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">${
      (props.label as string) ?? "Button"
    }</button>`,
};
