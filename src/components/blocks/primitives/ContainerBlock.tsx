import { Square } from "lucide-react";
import type { BlockDefinition } from "@/lib/builder/types";

type Direction = "row" | "column";

export const containerBlock: BlockDefinition = {
  type: "container",
  label: "Container",
  category: "layout",
  icon: Square,
  acceptsChildren: true,
  defaultProps: { direction: "column" as Direction, gap: "4" },
  propsSchema: [
    {
      key: "direction",
      label: "Direction",
      type: "select",
      options: [
        { label: "Column", value: "column" },
        { label: "Row", value: "row" },
      ],
    },
  ],
  requiredImports: [],
  render: (props, children) => {
    const direction = (props.direction as Direction) ?? "column";
    return (
      <div
        className={`flex w-full gap-4 p-4 ${
          direction === "row" ? "flex-row flex-wrap items-start" : "flex-col"
        }`}
      >
        {children}
      </div>
    );
  },
  codegen: (props, childrenJsx) => {
    const direction = (props.direction as Direction) ?? "column";
    const cls = `flex w-full gap-4 p-4 ${
      direction === "row" ? "flex-row flex-wrap items-start" : "flex-col"
    }`;
    return `<div className="${cls}">\n${childrenJsx.join("\n")}\n</div>`;
  },
  codegenHtml: (props, childrenHtml) => {
    const direction = (props.direction as Direction) ?? "column";
    const cls = `flex w-full gap-4 p-4 ${
      direction === "row" ? "flex-row flex-wrap items-start" : "flex-col"
    }`;
    return `<div class="${cls}">\n${childrenHtml.join("\n")}\n</div>`;
  },
};
