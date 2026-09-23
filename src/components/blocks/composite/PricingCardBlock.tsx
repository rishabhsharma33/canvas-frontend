import { CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { BlockDefinition } from "@/lib/builder/types";

export const pricingCardBlock: BlockDefinition = {
  type: "pricing-card",
  label: "Pricing Card",
  category: "section",
  icon: CreditCard,
  acceptsChildren: true,
  defaultProps: {},
  defaultChildren: [
    { type: "badge", props: { label: "Most popular", variant: "secondary" } },
    { type: "heading", props: { text: "$29/mo", level: "h2" } },
    {
      type: "text",
      props: { text: "Everything you need to launch your product." },
    },
    { type: "button", props: { label: "Choose plan", variant: "default" } },
  ],
  propsSchema: [],
  requiredImports: [
    'import { Card, CardContent } from "@/components/ui/card";',
  ],
  render: (_props, children) => (
    <Card className="w-full max-w-sm">
      <CardContent className="flex flex-col items-start gap-3">
        {children}
      </CardContent>
    </Card>
  ),
  codegen: (_props, childrenJsx) =>
    `<Card className="w-full max-w-sm">\n  <CardContent className="flex flex-col items-start gap-3">\n${childrenJsx.join(
      "\n"
    )}\n  </CardContent>\n</Card>`,
  codegenHtml: (_props, childrenHtml) =>
    `<div class="w-full max-w-sm overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">\n  <div class="flex flex-col items-start gap-3 p-4">\n${childrenHtml.join(
      "\n"
    )}\n  </div>\n</div>`,
};
