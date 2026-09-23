import { CircleUserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { BlockDefinition } from "@/lib/builder/types";

export const avatarBlock: BlockDefinition = {
  type: "avatar",
  label: "Avatar",
  category: "content",
  icon: CircleUserRound,
  acceptsChildren: false,
  defaultProps: {
    src: "https://i.pravatar.cc/80?u=dnd-builder",
    fallback: "AB",
  },
  propsSchema: [
    { key: "src", label: "Image URL", type: "url" },
    { key: "fallback", label: "Fallback initials", type: "text" },
  ],
  requiredImports: [
    'import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";',
  ],
  render: (props) => (
    <Avatar size="lg">
      <AvatarImage src={props.src as string} alt="" />
      <AvatarFallback>{(props.fallback as string) ?? "AB"}</AvatarFallback>
    </Avatar>
  ),
  codegen: (props) =>
    `<Avatar size="lg">\n  <AvatarImage src="${props.src}" alt="" />\n  <AvatarFallback>${
      (props.fallback as string) ?? "AB"
    }</AvatarFallback>\n</Avatar>`,
  codegenHtml: (props) =>
    `<img src="${props.src}" alt="${
      (props.fallback as string) ?? "AB"
    }" class="size-10 rounded-full object-cover" />`,
};
