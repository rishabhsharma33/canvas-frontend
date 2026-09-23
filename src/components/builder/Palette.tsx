"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { registryList, CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/builder/registry";
import { PaletteItem } from "./PaletteItem";

export function Palette() {
  return (
    <aside className="flex h-full w-70 shrink-0 flex-col border-r bg-card">
      <div className="border-b px-3 py-3">
        <h2 className="text-sm font-semibold">Blocks</h2>
        <p className="text-xs text-muted-foreground">
          Drag a block onto the canvas
        </p>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-3">
          {CATEGORY_ORDER.map((category) => {
            const items = registryList.filter((d) => d.category === category);
            if (items.length === 0) return null;
            return (
              <div key={category} className="flex flex-col gap-1.5">
                <h3 className="px-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {CATEGORY_LABELS[category]}
                </h3>
                <div className="flex flex-col gap-1.5">
                  {items.map((def) => (
                    <PaletteItem key={def.type} def={def} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}
