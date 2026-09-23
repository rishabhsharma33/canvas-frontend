"use client";

import { isValidElement, cloneElement, type ReactElement } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { GripVertical, Trash2 } from "lucide-react";
import { useBuilderStore } from "@/lib/builder/store";
import { getBlockDefinition } from "@/lib/builder/registry";
import { getStyleClassName } from "@/lib/builder/style-props";
import { cn } from "@/lib/utils";
import { EmptyDropZone } from "./EmptyDropZone";

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") ref(node);
      else (ref as React.RefObject<T | null>).current = node;
    });
  };
}

export function CanvasNode({ nodeId }: { nodeId: string }) {
  const node = useBuilderStore((s) => s.document.pages[s.document.activePageId].nodes[nodeId]);
  const isPreviewMode = useBuilderStore((s) => s.isPreviewMode);
  const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);
  const selectNode = useBuilderStore((s) => s.selectNode);
  const removeNode = useBuilderStore((s) => s.removeNode);

  const def = getBlockDefinition(node.type);
  const isSelected = selectedNodeId === node.id;
  const isRoot = node.parentId === null;

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: node.id,
    data: { source: "canvas", nodeId: node.id, parentId: node.parentId },
    disabled: isPreviewMode || isRoot,
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `node:${node.id}`,
    data: { type: "before-node", nodeId: node.id, parentId: node.parentId },
    disabled: isPreviewMode || isRoot,
  });

  const children = node.children.map((childId) => (
    <CanvasNode key={childId} nodeId={childId} />
  ));

  const childrenWithDropzone = def.acceptsChildren ? (
    <>
      {children}
      {!isPreviewMode && (
        <EmptyDropZone
          containerId={node.id}
          disabled={isPreviewMode}
          compact={node.children.length > 0}
        />
      )}
    </>
  ) : (
    <>{children}</>
  );

  const rawRendered = def.render(node.props, childrenWithDropzone);
  const styleClassName = getStyleClassName(node.props);
  const rendered =
    styleClassName && isValidElement<{ className?: string }>(rawRendered)
      ? cloneElement(rawRendered as ReactElement<{ className?: string }>, {
          className: cn(
            (rawRendered as ReactElement<{ className?: string }>).props.className,
            styleClassName
          ),
        })
      : rawRendered;

  if (isPreviewMode) {
    return <>{rendered}</>;
  }

  return (
    <div
      ref={mergeRefs(setDragRef, setDropRef)}
      data-node-id={node.id}
      onClick={(e) => {
        e.stopPropagation();
        selectNode(node.id);
      }}
      className={cn(
        "group/node relative rounded-md outline outline-transparent transition-all",
        (isRoot || def.acceptsChildren) && "w-full",
        !isRoot &&
          (def.acceptsChildren
            ? "outline-2 outline-dashed outline-indigo-300 hover:outline-indigo-400 hover:bg-indigo-500/[0.06]"
            : "outline-1 outline-dashed outline-neutral-300 hover:outline-neutral-400"),
        isSelected && "outline-2 outline-solid outline-primary bg-primary/5",
        isOver && "outline-2 outline-solid outline-primary bg-primary/5",
        isDragging && "opacity-40"
      )}
    >
      {!isRoot && (
        <div className="pointer-events-none absolute -top-3 left-1 z-10 hidden items-center gap-1 group-hover/node:flex group-focus-within/node:flex">
          <button
            {...attributes}
            {...listeners}
            className="pointer-events-auto flex size-5 cursor-grab items-center justify-center rounded bg-primary text-primary-foreground active:cursor-grabbing"
            aria-label="Drag to reorder"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="size-3.5" />
          </button>
          <span className="pointer-events-none rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
            {def.label}
          </span>
          <button
            className="pointer-events-auto flex size-5 items-center justify-center rounded bg-destructive text-destructive-foreground"
            aria-label="Delete block"
            onClick={(e) => {
              e.stopPropagation();
              removeNode(node.id);
            }}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      )}
      {rendered}
    </div>
  );
}
