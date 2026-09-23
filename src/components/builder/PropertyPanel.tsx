"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useBuilderStore } from "@/lib/builder/store";
import { getBlockDefinition } from "@/lib/builder/registry";
import { LAYOUT_PROP_SCHEMA, STYLE_PROP_SCHEMA } from "@/lib/builder/style-props";
import type { BuilderNode, PropFieldSchema } from "@/lib/builder/types";

export function PropertyPanel() {
  const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);
  const node = useBuilderStore((s) =>
    selectedNodeId
      ? s.document.pages[s.document.activePageId].nodes[selectedNodeId]
      : null
  );
  const updateNodeProps = useBuilderStore((s) => s.updateNodeProps);

  if (!node) {
    return (
      <aside className="flex h-full w-72 shrink-0 flex-col border-l bg-card">
        <div className="border-b px-3 py-3">
          <h2 className="text-sm font-semibold">Properties</h2>
        </div>
        <div className="flex flex-1 items-center justify-center p-4 text-center text-xs text-muted-foreground">
          Select a block on the canvas to edit its properties.
        </div>
      </aside>
    );
  }

  const def = getBlockDefinition(node.type);

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-l bg-card">
      <div className="border-b px-3 py-3">
        <h2 className="text-sm font-semibold">Properties</h2>
        <p className="text-xs text-muted-foreground">{def.label}</p>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-3">
          {def.propsSchema.length === 0 && (
            <p className="text-xs text-muted-foreground">
              This block has no content properties.
            </p>
          )}
          <PropFieldList
            schema={def.propsSchema}
            node={node}
            onChange={updateNodeProps}
          />

          <Separator />
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Layout
          </h3>
          <PropFieldList
            schema={LAYOUT_PROP_SCHEMA}
            node={node}
            onChange={updateNodeProps}
          />

          <Separator />
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Style
          </h3>
          <PropFieldList
            schema={STYLE_PROP_SCHEMA}
            node={node}
            onChange={updateNodeProps}
          />
        </div>
      </ScrollArea>
    </aside>
  );
}

function PropFieldList({
  schema,
  node,
  onChange,
}: {
  schema: PropFieldSchema[];
  node: BuilderNode;
  onChange: (nodeId: string, props: Record<string, unknown>) => void;
}) {
  return (
    <>
      {schema.map((field) => (
        <PropField
          key={field.key}
          field={field}
          value={node.props[field.key]}
          onChange={(value) => onChange(node.id, { [field.key]: value })}
        />
      ))}
    </>
  );
}

function PropField({
  field,
  value,
  onChange,
}: {
  field: PropFieldSchema;
  value: unknown;
  onChange: (value: string) => void;
}) {
  const id = `prop-${field.key}`;
  const stringValue =
    (value as string) ?? (field.type === "select" ? field.options?.[0]?.value : undefined) ?? "";

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{field.label}</Label>
      {field.type === "textarea" ? (
        <Textarea
          id={id}
          value={stringValue}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
        />
      ) : field.type === "select" ? (
        <Select
          value={stringValue}
          onValueChange={(value) => onChange(value ?? "")}
        >
          <SelectTrigger id={id} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={id}
          type={field.type === "url" ? "url" : field.type === "number" ? "number" : "text"}
          value={stringValue}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
