# Canvas

A drag-and-drop web page builder. Arrange prebuilt [shadcn/ui](https://ui.shadcn.com) blocks on a live canvas, edit their content and layout visually, and export clean JSX or static HTML when you're done.

## Features

- **Drag-and-drop blocks** — insert, reorder, and nest components directly on the canvas ([dnd-kit](https://dndkit.com))
- **Prebuilt sections** — Hero, Pricing Card, Nav Bar, Form, Footer, Feature Grid, Testimonial, CTA Band, and Two Column, alongside raw primitives (Heading, Text, Button, Image, Badge, Avatar, Input Field, Divider, Quote, Container, Section)
- **Live, WYSIWYG canvas** — the canvas *is* the preview; no separate render path to fall out of sync
- **Property panel** — edit each block's content, plus generic **Layout** (direction, justify, align, gap) and **Style** (background, text color, padding, margin, corner radius) controls that work uniformly across every block
- **Undo/redo** — full history with keyboard shortcuts (`Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z`), and rapid text edits are coalesced into a single step
- **Multi-page** — create, rename, switch between, and delete pages within one project
- **Preview mode** — toggle a chrome-free view in place, or open it in its own tab
- **Code export** — download or copy the arranged layout as formatted JSX (with imports) or static HTML
- **Local persistence** — autosaves to `localStorage`; no backend required

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [dnd-kit](https://dndkit.com) for drag-and-drop
- [Zustand](https://zustand-demo.pmnd.rs) for state management
- [Prettier](https://prettier.io) (standalone, in-browser) for formatting exported code

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start building.

## Project structure

```
src/
  app/                    # Next.js routes (builder page, standalone /preview)
  components/
    ui/                   # shadcn/ui primitives
    builder/               # Editor shell: canvas, palette, toolbar, property panel
    blocks/
      primitives/          # Leaf block definitions (Button, Heading, Text, ...)
      composite/            # Prebuilt section block definitions (Hero, Footer, ...)
  lib/
    builder/
      types.ts             # Core data model (BuilderNode, BuilderPage, BlockDefinition)
      registry.ts           # Single source of truth mapping block type -> definition
      store.ts              # Zustand store: document state, history, actions
      tree-utils.ts          # Pure tree operations (insert/remove/move/reparent)
      codegen.ts             # Tree -> JSX/HTML string export
      persistence.ts         # localStorage load/save with schema versioning
```

Adding a new block means creating one file under `components/blocks/` and registering it in `lib/builder/registry.ts` — the palette, canvas, and export all pick it up automatically.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — run ESLint

## License

[MIT](./LICENSE)
