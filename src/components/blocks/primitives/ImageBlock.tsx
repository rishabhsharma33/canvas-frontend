import { Image as ImageIcon } from "lucide-react";
import type { BlockDefinition } from "@/lib/builder/types";

export const imageBlock: BlockDefinition = {
  type: "image",
  label: "Image",
  category: "content",
  icon: ImageIcon,
  acceptsChildren: false,
  defaultProps: {
    src: "https://picsum.photos/seed/dnd-builder/640/360",
    alt: "Placeholder image",
  },
  propsSchema: [
    { key: "src", label: "Image URL", type: "url" },
    { key: "alt", label: "Alt text", type: "text" },
  ],
  requiredImports: [],
  render: (props) => (
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary user-provided URLs, not a static asset
    <img
      src={props.src as string}
      alt={(props.alt as string) ?? ""}
      className="w-full max-w-xl rounded-lg object-cover"
    />
  ),
  codegen: (props) =>
    `<img src="${props.src}" alt="${
      (props.alt as string) ?? ""
    }" className="w-full max-w-xl rounded-lg object-cover" />`,
  codegenHtml: (props) =>
    `<img src="${props.src}" alt="${
      (props.alt as string) ?? ""
    }" class="w-full max-w-xl rounded-lg object-cover" />`,
};
