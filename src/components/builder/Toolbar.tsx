"use client";

import {
  Eye,
  EyeOff,
  ExternalLink,
  LayoutDashboard,
  Undo2,
  Redo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useBuilderStore } from "@/lib/builder/store";
import { ExportDialog } from "./ExportDialog";
import { PagesDialog } from "./PagesDialog";

export function Toolbar() {
  const isPreviewMode = useBuilderStore((s) => s.isPreviewMode);
  const setPreviewMode = useBuilderStore((s) => s.setPreviewMode);
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);
  const canUndo = useBuilderStore((s) => s.past.length > 0);
  const canRedo = useBuilderStore((s) => s.future.length > 0);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b bg-card px-3">
      <div className="flex items-center gap-2">
        <LayoutDashboard className="size-4 text-primary" />
        <span className="text-sm font-semibold">DnD Web Builder</span>
      </div>
      <div className="flex items-center gap-2">
        {!isPreviewMode && (
          <>
            <PagesDialog />
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={!canUndo}
                    onClick={undo}
                    aria-label="Undo"
                  >
                    <Undo2 />
                  </Button>
                }
              />
              <TooltipContent>Undo (Ctrl/Cmd+Z)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={!canRedo}
                    onClick={redo}
                    aria-label="Redo"
                  >
                    <Redo2 />
                  </Button>
                }
              />
              <TooltipContent>Redo (Ctrl/Cmd+Shift+Z)</TooltipContent>
            </Tooltip>
          </>
        )}
        <Button
          variant={isPreviewMode ? "default" : "outline"}
          size="sm"
          onClick={() => setPreviewMode(!isPreviewMode)}
        >
          {isPreviewMode ? <EyeOff /> : <Eye />}
          {isPreviewMode ? "Exit preview" : "Preview"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open("/preview", "_blank")}
        >
          <ExternalLink />
          Open preview tab
        </Button>
        <ExportDialog />
      </div>
    </header>
  );
}
