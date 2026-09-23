import type { PropFieldSchema } from "./types";

/**
 * Every option's `value` below is a full, literal Tailwind class string that appears verbatim in
 * this file — required so Tailwind's build-time scanner generates the CSS for it. A dynamically
 * interpolated class name (e.g. `bg-${color}-100`) would not be picked up.
 *
 * "unset" is a sentinel for "no override" (the Select component doesn't support "" as a value).
 */
export const UNSET = "unset";

export const BG_OPTIONS = [
  { label: "None", value: UNSET },
  { label: "White", value: "bg-white" },
  { label: "Muted", value: "bg-muted" },
  { label: "Primary", value: "bg-primary" },
  { label: "Blue tint", value: "bg-blue-50" },
  { label: "Green tint", value: "bg-green-50" },
  { label: "Amber tint", value: "bg-amber-50" },
  { label: "Rose tint", value: "bg-rose-50" },
  { label: "Slate (dark)", value: "bg-slate-900" },
];

export const TEXT_COLOR_OPTIONS = [
  { label: "Default", value: UNSET },
  { label: "Muted", value: "text-muted-foreground" },
  { label: "Primary", value: "text-primary" },
  { label: "White", value: "text-white" },
  { label: "Blue", value: "text-blue-700" },
  { label: "Green", value: "text-green-700" },
  { label: "Amber", value: "text-amber-700" },
  { label: "Rose", value: "text-rose-700" },
];

export const PADDING_OPTIONS = [
  { label: "Default", value: UNSET },
  { label: "None", value: "p-0" },
  { label: "Small", value: "p-2" },
  { label: "Medium", value: "p-4" },
  { label: "Large", value: "p-8" },
  { label: "X-Large", value: "p-12" },
];

export const MARGIN_OPTIONS = [
  { label: "Default", value: UNSET },
  { label: "None", value: "m-0" },
  { label: "Small", value: "m-2" },
  { label: "Medium", value: "m-4" },
  { label: "Large", value: "m-8" },
];

export const ROUNDED_OPTIONS = [
  { label: "Default", value: UNSET },
  { label: "None", value: "rounded-none" },
  { label: "Small", value: "rounded-sm" },
  { label: "Medium", value: "rounded-md" },
  { label: "Large", value: "rounded-xl" },
  { label: "Full", value: "rounded-full" },
];

/** Reserved prop keys (underscore-prefixed so they never collide with a block's own props). */
export const STYLE_PROP_SCHEMA: PropFieldSchema[] = [
  { key: "_bg", label: "Background", type: "select", options: BG_OPTIONS },
  { key: "_textColor", label: "Text color", type: "select", options: TEXT_COLOR_OPTIONS },
  { key: "_padding", label: "Padding", type: "select", options: PADDING_OPTIONS },
  { key: "_margin", label: "Margin", type: "select", options: MARGIN_OPTIONS },
  { key: "_rounded", label: "Corner radius", type: "select", options: ROUNDED_OPTIONS },
];

/**
 * Direction bundles `flex` itself with the direction utility, so it works even on a block whose
 * own root doesn't already establish a flex context (only children-accepting blocks visibly
 * benefit, but the override is harmless to apply to any block).
 */
export const DIRECTION_OPTIONS = [
  { label: "Default", value: UNSET },
  { label: "Row", value: "flex flex-row" },
  { label: "Column", value: "flex flex-col" },
  { label: "Row (reversed)", value: "flex flex-row-reverse" },
  { label: "Column (reversed)", value: "flex flex-col-reverse" },
];

export const JUSTIFY_OPTIONS = [
  { label: "Default", value: UNSET },
  { label: "Start", value: "justify-start" },
  { label: "Center", value: "justify-center" },
  { label: "End", value: "justify-end" },
  { label: "Space between", value: "justify-between" },
  { label: "Space around", value: "justify-around" },
  { label: "Space evenly", value: "justify-evenly" },
];

export const ALIGN_OPTIONS = [
  { label: "Default", value: UNSET },
  { label: "Start", value: "items-start" },
  { label: "Center", value: "items-center" },
  { label: "End", value: "items-end" },
  { label: "Stretch", value: "items-stretch" },
];

export const GAP_OPTIONS = [
  { label: "Default", value: UNSET },
  { label: "None", value: "gap-0" },
  { label: "Small", value: "gap-2" },
  { label: "Medium", value: "gap-4" },
  { label: "Large", value: "gap-8" },
];

export const LAYOUT_PROP_SCHEMA: PropFieldSchema[] = [
  { key: "_flexDirection", label: "Direction", type: "select", options: DIRECTION_OPTIONS },
  { key: "_justify", label: "Justify content", type: "select", options: JUSTIFY_OPTIONS },
  { key: "_align", label: "Align items", type: "select", options: ALIGN_OPTIONS },
  { key: "_gap", label: "Gap", type: "select", options: GAP_OPTIONS },
];

const OVERRIDE_KEYS = [...STYLE_PROP_SCHEMA, ...LAYOUT_PROP_SCHEMA].map((field) => field.key);

/** Builds the combined extra className from whichever style/layout overrides are set on a node. */
export function getStyleClassName(props: Record<string, unknown>): string {
  return OVERRIDE_KEYS.map((key) => (props[key] as string) ?? "")
    .filter((value) => value && value !== UNSET)
    .join(" ");
}
