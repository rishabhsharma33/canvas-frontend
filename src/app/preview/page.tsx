"use client";

import { useEffect } from "react";
import { useBuilderStore } from "@/lib/builder/store";
import { CanvasNode } from "@/components/builder/CanvasNode";
import { AuthGate } from "@/components/auth/AuthGate";

function PreviewContent() {
  const hydrate = useBuilderStore((s) => s.hydrate);
  const hydrated = useBuilderStore((s) => s.hydrated);
  const hydrationError = useBuilderStore((s) => s.hydrationError);
  const setPreviewMode = useBuilderStore((s) => s.setPreviewMode);
  const rootId = useBuilderStore(
    (s) => s.document.pages[s.document.activePageId]?.rootId
  );

  useEffect(() => {
    hydrate();
    setPreviewMode(true);
  }, [hydrate, setPreviewMode]);

  if (hydrationError) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-sm text-destructive">
        {hydrationError}
      </div>
    );
  }

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

export default function PreviewPage() {
  return (
    <AuthGate>
      <PreviewContent />
    </AuthGate>
  );
}
