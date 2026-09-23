"use client";

import { useBuilderStore } from "@/lib/builder/store";
import { CanvasNode } from "./CanvasNode";

export function Canvas() {
  const rootId = useBuilderStore(
    (s) => s.document.pages[s.document.activePageId].rootId
  );
  const isPreviewMode = useBuilderStore((s) => s.isPreviewMode);
  const selectNode = useBuilderStore((s) => s.selectNode);

  return (
    <div
      className="flex-1 overflow-auto bg-muted/20"
      onClick={() => !isPreviewMode && selectNode(null)}
    >
      <div className="mx-auto min-h-full w-full max-w-4xl bg-background shadow-xs">
        <CanvasNode nodeId={rootId} />
      </div>
    </div>
  );
}
