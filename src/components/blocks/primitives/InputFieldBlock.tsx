import { TextCursorInput } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BlockDefinition } from "@/lib/builder/types";

export const inputFieldBlock: BlockDefinition = {
  type: "input-field",
  label: "Input Field",
  category: "content",
  icon: TextCursorInput,
  acceptsChildren: false,
  defaultProps: { label: "Email", placeholder: "you@example.com" },
  propsSchema: [
    { key: "label", label: "Field label", type: "text" },
    { key: "placeholder", label: "Placeholder", type: "text" },
  ],
  requiredImports: [
    'import { Input } from "@/components/ui/input";',
    'import { Label } from "@/components/ui/label";',
  ],
  render: (props) => {
    const id = `field-${(props.label as string)?.toLowerCase().replace(/\s+/g, "-") || "input"}`;
    return (
      <div className="flex w-full max-w-sm flex-col gap-1.5">
        <Label htmlFor={id}>{(props.label as string) ?? "Label"}</Label>
        <Input id={id} placeholder={(props.placeholder as string) ?? ""} />
      </div>
    );
  },
  codegen: (props) => {
    const label = (props.label as string) ?? "Label";
    return `<div className="flex w-full max-w-sm flex-col gap-1.5">\n  <Label>${label}</Label>\n  <Input placeholder="${
      (props.placeholder as string) ?? ""
    }" />\n</div>`;
  },
  codegenHtml: (props) => {
    const label = (props.label as string) ?? "Label";
    return `<div class="flex w-full max-w-sm flex-col gap-1.5">\n  <label class="text-sm font-medium">${label}</label>\n  <input placeholder="${
      (props.placeholder as string) ?? ""
    }" class="h-9 rounded-md border border-input bg-background px-3 text-sm" />\n</div>`;
  },
};
