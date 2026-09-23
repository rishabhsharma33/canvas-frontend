"use client";

import { useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useBuilderStore } from "@/lib/builder/store";
import { getBlockDefinition, registry } from "@/lib/builder/registry";
import type { BlockType, DragActiveData } from "@/lib/builder/types";
import type { DropTargetData } from "@/lib/builder/tree-utils";
import { Toolbar } from "./Toolbar";
import { Palette } from "./Palette";
import { Canvas } from "./Canvas";
import { PropertyPanel } from "./PropertyPanel";

export function BuilderWorkspace() {
  const hydrate = useBuilderStore((s) => s.hydrate);
  const hydrated = useBuilderStore((s) => s.hydrated);
  const isPreviewMode = useBuilderStore((s) => s.isPreviewMode);
  const activeDragId = useBuilderStore((s) => s.activeDragId);
  const setActiveDrag = useBuilderStore((s) => s.setActiveDrag);
  const handleDrop = useBuilderStore((s) => s.handleDrop);
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);
  const duplicateNode = useBuilderStore((s) => s.duplicateNode);
  const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);
  const document = useBuilderStore((s) => s.document);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      if (!mod || (key !== "z" && key !== "y" && key !== "d")) return;

      const target = e.target as HTMLElement | null;
      const isEditable =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (isEditable) return;

      if (key === "d") {
        if (!selectedNodeId) return;
        e.preventDefault();
        duplicateNode(selectedNodeId);
        return;
      }

      e.preventDefault();
      if (key === "y" || e.shiftKey) {
        redo();
      } else {
        undo();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo, duplicateNode, selectedNodeId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor)
  );

  function onDragStart(event: DragStartEvent) {
    setActiveDrag(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return;
    const activeData = active.data.current as DragActiveData | undefined;
    const overData = over.data.current as DropTargetData | undefined;
    if (!activeData || !overData) return;
    if (
      activeData.source === "canvas" &&
      overData.type === "before-node" &&
      overData.nodeId === activeData.nodeId
    ) {
      return;
    }
    handleDrop(activeData, overData);
  }

  const activeDragLabel = (() => {
    if (!activeDragId) return null;
    if (activeDragId.startsWith("palette:")) {
      const type = activeDragId.slice("palette:".length) as BlockType;
      return registry[type]?.label ?? null;
    }
    const page = document.pages[document.activePageId];
    const node = page?.nodes[activeDragId];
    return node ? getBlockDefinition(node.type).label : null;
  })();

  if (!hydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-sm text-muted-foreground">
        Loading your page…
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex h-screen w-full flex-col">
        <Toolbar />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {!isPreviewMode && <Palette />}
          <Canvas />
          {!isPreviewMode && <PropertyPanel />}
        </div>
      </div>
      <DragOverlay>
        {activeDragLabel && (
          <div className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-lg">
            {activeDragLabel}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
