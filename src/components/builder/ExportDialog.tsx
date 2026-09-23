"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, Copy, Download } from "lucide-react";
import { useBuilderStore } from "@/lib/builder/store";
import { generateCode } from "@/lib/builder/codegen";

async function formatJsx(code: string): Promise<string> {
  try {
    const prettier = await import("prettier/standalone");
    const babel = await import("prettier/plugins/babel");
    const estree = await import("prettier/plugins/estree");
    return await prettier.format(code, {
      parser: "babel",
      plugins: [babel.default, estree.default],
    });
  } catch {
    return code;
  }
}

export function ExportDialog() {
  const [open, setOpen] = useState(false);
  const [jsx, setJsx] = useState("");
  const [html, setHtml] = useState("");
  const [copied, setCopied] = useState<"jsx" | "html" | null>(null);
  const page = useBuilderStore((s) => s.document.pages[s.document.activePageId]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const rawJsx = generateCode(page, "jsx");
    const rawHtml = generateCode(page, "html");
    formatJsx(rawJsx).then((formatted) => {
      if (cancelled) return;
      setHtml(rawHtml);
      setJsx(formatted);
    });
    return () => {
      cancelled = true;
    };
  }, [open, page]);

  const copy = async (text: string, which: "jsx" | "html") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // clipboard unavailable — no-op
    }
  };

  const slug = page.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "page";

  const download = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Code2 />
            Export
          </Button>
        }
      />
      <DialogContent className="w-full max-w-2xl min-w-0">
        <DialogHeader>
          <DialogTitle>Export code</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Exporting page: <span className="font-medium text-foreground">{page.name}</span>
          </p>
        </DialogHeader>
        <Tabs defaultValue="jsx" className="min-w-0">
          <TabsList>
            <TabsTrigger value="jsx">JSX</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
          </TabsList>
          <TabsContent value="jsx" className="flex min-w-0 flex-col gap-2">
            <pre className="max-h-96 w-full min-w-0 overflow-auto rounded-md bg-muted p-3 text-xs">
              <code>{jsx}</code>
            </pre>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => copy(jsx, "jsx")}>
                <Copy />
                {copied === "jsx" ? "Copied!" : "Copy"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => download(jsx, `${slug}.tsx`)}
              >
                <Download />
                Download
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="html" className="flex min-w-0 flex-col gap-2">
            <pre className="max-h-96 w-full min-w-0 overflow-auto rounded-md bg-muted p-3 text-xs">
              <code>{html}</code>
            </pre>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => copy(html, "html")}>
                <Copy />
                {copied === "html" ? "Copied!" : "Copy"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => download(html, `${slug}.html`)}
              >
                <Download />
                Download
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
