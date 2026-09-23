"use client";

import { useDraggable } from "@dnd-kit/core";
import type { BlockDefinition } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

export function PaletteItem({ def }: { def: BlockDefinition }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${def.type}`,
    data: { source: "palette", blockType: def.type },
  });

  const Icon = def.icon;

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      type="button"
      className={cn(
        "flex w-full cursor-grab items-center gap-2 rounded-md border border-border bg-card px-2.5 py-2 text-left text-sm shadow-xs transition-colors hover:border-primary/50 hover:bg-muted active:cursor-grabbing",
        isDragging && "opacity-40"
      )}
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{def.label}</span>
    </button>
  );
}
