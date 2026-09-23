"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Copy, FileStack, Pencil, Plus, Trash2 } from "lucide-react";
import { useBuilderStore } from "@/lib/builder/store";
import { cn } from "@/lib/utils";

export function PagesDialog() {
  const [open, setOpen] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const pages = useBuilderStore((s) => s.document.pages);
  const activePageId = useBuilderStore((s) => s.document.activePageId);
  const createPage = useBuilderStore((s) => s.createPage);
  const switchPage = useBuilderStore((s) => s.switchPage);
  const renamePage = useBuilderStore((s) => s.renamePage);
  const deletePage = useBuilderStore((s) => s.deletePage);
  const duplicatePage = useBuilderStore((s) => s.duplicatePage);

  const activePageName = pages[activePageId]?.name ?? "";
  const pageList = Object.values(pages).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const commitEditing = () => {
    if (editingId) renamePage(editingId, editingName);
    setEditingId(null);
  };

  const handleCreate = () => {
    createPage(newPageName);
    setNewPageName("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <FileStack />
            {activePageName}
          </Button>
        }
      />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pages</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-72">
          <div className="flex flex-col gap-1">
            {pageList.map((page) => (
              <div
                key={page.id}
                className={cn(
                  "flex items-center gap-1 rounded-md px-1.5 py-1",
                  page.id === activePageId && "bg-muted"
                )}
              >
                {editingId === page.id ? (
                  <>
                    <Input
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={commitEditing}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEditing();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="h-7 flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={commitEditing}
                      aria-label="Save name"
                    >
                      <Check />
                    </Button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="flex-1 truncate rounded px-1.5 py-1 text-left text-sm"
                      onClick={() => {
                        switchPage(page.id);
                        setOpen(false);
                      }}
                    >
                      {page.name}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => startEditing(page.id, page.name)}
                      aria-label="Rename page"
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => duplicatePage(page.id)}
                      aria-label="Duplicate page"
                    >
                      <Copy />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={pageList.length <= 1}
                      onClick={() => deletePage(page.id)}
                      aria-label="Delete page"
                    >
                      <Trash2 />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-2 border-t pt-3">
          <Input
            placeholder="New page name"
            value={newPageName}
            onChange={(e) => setNewPageName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            className="h-8 flex-1"
          />
          <Button size="sm" onClick={handleCreate}>
            <Plus />
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
