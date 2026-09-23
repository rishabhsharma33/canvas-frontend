import { Heading1 } from "lucide-react";
import type { BlockDefinition } from "@/lib/builder/types";

type Level = "h1" | "h2" | "h3" | "h4";

const sizeClass: Record<Level, string> = {
  h1: "text-4xl font-bold tracking-tight",
  h2: "text-3xl font-bold tracking-tight",
  h3: "text-2xl font-semibold tracking-tight",
  h4: "text-xl font-semibold tracking-tight",
};

export const headingBlock: BlockDefinition = {
  type: "heading",
  label: "Heading",
  category: "content",
  icon: Heading1,
  acceptsChildren: false,
  defaultProps: { text: "Heading text", level: "h2" as Level },
  propsSchema: [
    { key: "text", label: "Text", type: "text" },
    {
      key: "level",
      label: "Level",
      type: "select",
      options: [
        { label: "H1", value: "h1" },
        { label: "H2", value: "h2" },
        { label: "H3", value: "h3" },
        { label: "H4", value: "h4" },
      ],
    },
  ],
  requiredImports: [],
  render: (props) => {
    const level = (props.level as Level) ?? "h2";
    const text = (props.text as string) ?? "";
    const Tag = level;
    return <Tag className={sizeClass[level]}>{text}</Tag>;
  },
  codegen: (props) => {
    const level = (props.level as Level) ?? "h2";
    const text = (props.text as string) ?? "";
    return `<${level} className="${sizeClass[level]}">${text}</${level}>`;
  },
  codegenHtml: (props) => {
    const level = (props.level as Level) ?? "h2";
    const text = (props.text as string) ?? "";
    return `<${level} class="${sizeClass[level]}">${text}</${level}>`;
  },
};
