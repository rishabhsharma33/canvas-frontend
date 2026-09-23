import { Minus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { BlockDefinition } from "@/lib/builder/types";

export const dividerBlock: BlockDefinition = {
  type: "divider",
  label: "Divider",
  category: "content",
  icon: Minus,
  acceptsChildren: false,
  defaultProps: {},
  propsSchema: [],
  requiredImports: ['import { Separator } from "@/components/ui/separator";'],
  render: () => <Separator className="my-2" />,
  codegen: () => `<Separator className="my-2" />`,
  codegenHtml: () => `<hr class="my-2 h-px w-full border-0 bg-border" />`,
};
