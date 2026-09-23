"use client";

import { useEffect } from "react";
import { useBuilderStore } from "@/lib/builder/store";
import { CanvasNode } from "@/components/builder/CanvasNode";

export default function PreviewPage() {
  const hydrate = useBuilderStore((s) => s.hydrate);
  const hydrated = useBuilderStore((s) => s.hydrated);
  const setPreviewMode = useBuilderStore((s) => s.setPreviewMode);
  const rootId = useBuilderStore(
    (s) => s.document.pages[s.document.activePageId]?.rootId
  );

  useEffect(() => {
    hydrate();
    setPreviewMode(true);
  }, [hydrate, setPreviewMode]);

  if (!hydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-4xl">
      <CanvasNode nodeId={rootId} />
    </div>
  );
}
