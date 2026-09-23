import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

export function EmptyDropZone({
  containerId,
  disabled,
  compact = false,
}: {
  containerId: string;
  disabled: boolean;
  /** Compact renders a thin trailing strip (container already has children) instead of a big empty-state box. */
  compact?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `container-end:${containerId}`,
    data: { type: "container-end", containerId },
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-full items-center justify-center rounded-md border border-dashed border-indigo-300 text-xs text-muted-foreground transition-colors",
        compact ? "h-3" : "py-6",
        isOver && "border-primary bg-primary/5 text-primary",
        isOver && compact && "h-8"
      )}
    >
      {(!compact || isOver) && "Drop blocks here"}
    </div>
  );
}
