# Automaton Creator — Interactive Web Tool

Build a **single-page web application** that lets users visually create, edit, and export finite automata. It must be deployable for free on **GitHub Pages** via a GitHub Actions build step.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| **Framework** | React 19 + TypeScript | Component model, type safety, clean state management |
| **Build tool** | Vite | Instant dev server, ~2s production builds |
| **Styling** | Tailwind CSS v4 | Utility-first, built-in dark mode (`dark:` prefix), rapid UI development |
| **UI primitives** | Radix UI | Accessible, unstyled headless components — Dialog, DropdownMenu, ContextMenu, Popover, Toast, Tooltip, Select |
| **Graph rendering** | Custom SVG via React components | Full control over state circles, transition arcs, self-loops, arrows |
| **Auto-layout** | dagre | Directed graph layout algorithm for the auto-arrange feature |
| **LaTeX** | KaTeX (npm) | Renders LaTeX in state labels |
| **Image export** | html-to-image | Rasterizes the SVG canvas to PNG |
| **Icons** | Lucide React | Clean, consistent icon set |

### Project Bootstrap

```bash
npm create vite@latest . -- --template react-ts
npm install tailwindcss @tailwindcss/vite
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-context-menu @radix-ui/react-popover @radix-ui/react-toast @radix-ui/react-tooltip @radix-ui/react-select
npm install katex @types/katex
npm install dagre @types/dagre
npm install html-to-image
npm install lucide-react
```

Configure Tailwind via Vite plugin (`@tailwindcss/vite` in `vite.config.ts`). Add `@import "tailwindcss"` to the main CSS file.

## Automaton Types

Support multiple automaton types via a **toolbar dropdown** (Radix Select):

| Type | Description | Transitions |
|------|--------------------------------------|---------------------------------------------------|
| DFA | Deterministic Finite Automaton | Exactly one transition per symbol per state |
| NFA | Nondeterministic Finite Automaton | Multiple transitions per symbol allowed |
| NFA-ε | NFA with epsilon transitions | Same as NFA + ε-transitions (shown with ε label) |

Architecture the automaton model so a PDA or Turing Machine type could be added later (e.g., automaton type is a config/strategy object that defines what fields transitions have), but only implement the three above for now.

### Validation & Warnings

Display non-blocking warnings in a collapsible bar below the toolbar:
- DFA: missing transitions for some symbols from a state
- DFA: multiple transitions on the same symbol (violates determinism)
- No start state defined
- No accept states defined
- Unreachable states (render them slightly dimmed/grayed on the canvas)

Warnings are informational only — never block the user.

## Visual Automaton Editor (SVG Canvas)

The canvas is the centerpiece. Build it as a React component rendering an `<svg>` element. All interactions must be smooth (60fps dragging, no jank).

### State Management Architecture

Use a single `useReducer` (or Zustand if preferred) to hold the automaton model:

```typescript
interface AutomatonState {
  type: 'DFA' | 'NFA' | 'NFA-e';
  states: StateNode[];
  transitions: Transition[];
  alphabet: string[];
  selectedIds: Set<string>;
  viewBox: { x: number; y: number; zoom: number };
}

interface StateNode {
  id: string;
  name: string;          // plain text or "$q_0$" LaTeX
  x: number;
  y: number;
  isStart: boolean;
  isAccept: boolean;
}

interface Transition {
  id: string;
  from: string;
  to: string;
  symbols: string[];     // e.g. ["a", "b"] renders as "a, b"
}
```

### Creating Elements
- **Add state**: Double-click on empty canvas area to create a new state at that position
- **Add transition**: Click a source state, then click a destination state; a small inline Radix Popover appears on the new edge for the user to type the symbol(s)
- **Self-loops**: Connecting a state to itself creates a **clean self-loop arc** rendered as a smooth loop above/outside the state — not an ugly tiny circle. Use an SVG path that is clearly readable and never overlaps the state label.

### Editing Elements
- **Move states**: Click and drag to reposition
- **Edit transition labels**: Double-click an edge label to open an edit popover
- **Set start state**: Right-click (Radix ContextMenu) → "Set as start state" — rendered with an incoming arrow from the left with no source node
- **Toggle accept state**: Right-click → "Toggle accept state" — rendered with a double circle
- **Delete**: Select element(s) + `Delete`/`Backspace`, or right-click → "Delete"
- **Multi-select**: Shift+click to toggle individual selection, or click-drag on empty canvas to draw a selection rectangle; then bulk move/delete

### State Naming with LaTeX Support

- New states get auto-incrementing default names: q0, q1, q2, ...
- **Double-click a state** to open a Radix Popover with:
  - A text input field
  - A **live KaTeX preview** below it showing how the name will render
- If the name contains LaTeX delimiters (`$...$`), render with KaTeX both in the preview and on the state circle
- Examples: `$q_0$`, `$q_{even}$`, `$\hat{q}$`, `$q_{A \cup B}$`
- Plain text names (no `$`) render as plain text
- State circles should auto-size their radius slightly if the rendered label is wider than default

### SVG Rendering Details

Each visual element is its own React component for clean separation:

- `<StateCircle>` — circle (or double circle for accept), label (plain or KaTeX foreignObject), selection highlight
- `<TransitionEdge>` — curved SVG path with arrowhead marker, label positioned at midpoint
- `<SelfLoop>` — loop path above the state with arrowhead and label
- `<StartArrow>` — short arrow pointing into the start state from the left
- `<SelectionRect>` — dashed rectangle drawn during drag-select
- `<GridDots>` — subtle dot pattern when snap-to-grid is active

Use SVG `<defs>` for reusable arrowhead markers. Use `<foreignObject>` to embed KaTeX-rendered HTML inside SVG for state labels.

## Minimap & Navigation

### Zoom & Pan
- **Zoom**: Scroll wheel zooms in/out centered on the cursor position. Clamp between 10% and 500%.
- **Pan**: Middle-click drag, or hold `Space` + left-click drag to pan
- **Zoom indicator**: Small badge in the bottom-left showing "75%" etc. Click to reset to 100%.
- **Fit to view**: `F` key or toolbar button — auto-zoom/pan so all states are visible with padding

Implement zoom/pan by manipulating the SVG `viewBox` attribute. Store `viewBox` in state.

### Minimap
- A small `<MiniMap>` component in the bottom-right corner rendering a scaled-down version of the full automaton
- A semi-transparent highlighted rectangle shows the current viewport bounds
- Click or drag on the minimap to navigate
- Toggle visibility with `M` key or a toolbar button

## Snap-to-Grid & Auto-Layout

- **Snap-to-grid toggle** (toolbar button + `G` shortcut): When enabled, state positions snap to a configurable grid (e.g., 20px). Render a subtle dot grid pattern on the canvas background via an SVG `<pattern>`.
- **Auto-layout button**: Run dagre layout algorithm on the current graph, then animate states to their new positions over ~300ms using CSS transitions or `requestAnimationFrame`. The entire auto-layout is a single undoable action.

## Copy, Paste & Export

### JSON Import/Export
- **Copy as JSON** (`Ctrl+C` when no text input is focused): Serialize the full automaton to a clean JSON object and copy to clipboard. Show a Radix Toast: "Copied to clipboard!"
  ```json
  {
    "type": "DFA",
    "states": [
      { "id": "q0", "name": "$q_0$", "x": 100, "y": 200, "isStart": true, "isAccept": false }
    ],
    "transitions": [
      { "from": "q0", "to": "q1", "symbols": ["a"] }
    ],
    "alphabet": ["a", "b"]
  }
  ```
- **Paste from JSON** (`Ctrl+V` when no text input is focused): Parse clipboard text as JSON, validate schema, load the automaton. Show error toast if invalid.
- **Download JSON**: File menu → Download JSON (triggers `.json` file download)
- **Load JSON file**: File menu → Open (native file picker for `.json` files)

### Image Export
- **Export as PNG**: Use `html-to-image`'s `toPng()` on the SVG canvas element. Apply 2x pixel ratio for crisp output. Trigger download with appropriate background color (white in light mode, dark in dark mode).
- **Export as SVG**: Clone the SVG DOM, inline computed styles, serialize to string, trigger `.svg` download.
- Both accessible from an "Export" dropdown menu (Radix DropdownMenu) in the toolbar.

## Undo/Redo

Implement as a custom `useHistory` hook wrapping the automaton state:

```typescript
interface HistoryStack<T> {
  past: T[];
  present: T;
  future: T[];
}

function useHistory(initialState: AutomatonState) {
  // Returns [state, dispatch] where dispatch auto-records history
  // Ctrl+Z calls undo(), Ctrl+Shift+Z / Ctrl+Y calls redo()
}
```

Track every discrete action:
- State creation, deletion, move, rename, property change (start/accept)
- Transition creation, deletion, symbol edit
- Bulk operations (multi-delete, auto-layout) record a single history entry

Undo/redo buttons in the toolbar show disabled state when the respective stack is empty. Stack depth: at least 50 entries.

## Dark Mode

- **Toggle button** in the top-right corner (Lucide `Sun`/`Moon` icon)
- Add/remove a `dark` class on `<html>` — Tailwind's `dark:` variant handles the rest
- Persist preference in `localStorage` under a key like `automaton-creator-theme`
- Default to the user's system preference via `window.matchMedia('(prefers-color-scheme: dark)')`, with manual override
- Everything must respect the theme: canvas, toolbar, modals, context menus, toasts, minimap, popovers

## Keyboard Shortcuts & Guide Modal

### Guide Modal
- Press **`?`** or click the **`?` button** to open a Radix Dialog (full-screen overlay) containing:
  - **Keyboard shortcuts table** — grouped by category (Navigation, Editing, File)
  - **Feature overview** — short descriptions of each major feature with Lucide icons
  - **Quick-start tutorial** — numbered 5-step walkthrough: create state → name it → add transition → set start/accept → export
- Dismissible with `Escape`, clicking overlay backdrop, or the X button

### Shortcuts Reference

| Shortcut | Action |
|---|---|
| `?` | Open guide modal |
| `Delete` / `Backspace` | Delete selected elements |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |
| `Ctrl+A` | Select all elements |
| `Ctrl+C` | Copy automaton as JSON |
| `Ctrl+V` | Paste automaton from JSON |
| `Escape` | Deselect all / close modal |
| `G` | Toggle snap-to-grid |
| `F` | Fit view to all states |
| `M` | Toggle minimap |
| `Space + Drag` | Pan the canvas |
| `Double-click canvas` | Create new state |
| `Double-click state` | Rename state |
| `Right-click` | Context menu |

Register all shortcuts via a single `useEffect` with a `keydown` listener. Gate single-key shortcuts (like `?`, `G`, `F`, `M`) so they don't fire when a text input is focused.

## UI/UX Design

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│ [File ▾] [DFA ▾] [↶ ↷] [Auto-layout] [Grid] [Export ▾] [?] [◑] │ ← Toolbar
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                                                              │
│                    SVG Canvas                                │
│                                                              │
│                                            ┌──────────┐     │
│                                            │ minimap  │     │
│                                            └──────────┘     │
├──────────────────────────────────────────────────────────────┤
│ ⚠ Warnings: No start state defined                          │ ← Warning bar
└──────────────────────────────────────────────────────────────┘
```

### Visual Style
- **Modern, clean aesthetic** — generous whitespace, subtle shadows (`shadow-sm`), rounded corners (`rounded-lg`)
- **Color palette**: Tailwind's Slate scale for neutrals, Blue for selections/interactive, Emerald for accept states, Rose for warnings/errors
- **Typography**: Tailwind's default system font stack (Inter-like)
- **Micro-interactions**: Smooth Tailwind transitions (`transition-colors duration-150`) on hover/active states, buttons, theme toggle
- **Context menus**: Radix ContextMenu styled with Tailwind — matches the theme perfectly, animated entry/exit
- **Toast notifications**: Radix Toast provider in the top-right, auto-dismiss after 3s, for "Copied!", "Automaton loaded", "Exported as PNG"
- **Empty state**: When canvas has no states, show a centered message with a faded Lucide icon and text: _"Double-click anywhere to create your first state"_ with a gentle pulse animation (`animate-pulse`)

### Responsiveness
- Optimized for desktop screens (1024px+)
- Toolbar wraps gracefully on narrower screens using `flex-wrap`
- Touch support is not required but don't actively break it

## Persistence

- **Auto-save to `localStorage`**: Debounced save (500ms) on every state change. On mount, restore the last automaton.
- **Named save slots** via the File dropdown menu:
  - **New** — clear the canvas (show a Radix AlertDialog confirmation if there are unsaved changes)
  - **Save As** — Radix Dialog with a name input, saves to a named localStorage key
  - **Open** — Radix Dialog listing saved automata with columns: name, type, state count, last modified date. Click to load.
  - **Delete** — remove a saved entry (with confirmation)

## Project Structure

```
├── index.html
├── vite.config.ts
├── tailwind.config.ts        (if needed, otherwise CSS-only config)
├── tsconfig.json
├── package.json
├── .github/
│   └── workflows/
│       └── deploy.yml        ← GitHub Actions: build + deploy to Pages
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx              ← React root mount
│   ├── App.tsx               ← Top-level layout, providers (Toast, Theme)
│   ├── index.css             ← Tailwind import + any global styles
│   │
│   ├── types/
│   │   └── automaton.ts      ← TypeScript interfaces (StateNode, Transition, AutomatonState)
│   │
│   ├── hooks/
│   │   ├── useAutomaton.ts   ← Core reducer: all automaton mutations
│   │   ├── useHistory.ts     ← Undo/redo stack wrapping the reducer
│   │   ├── useKeyboard.ts    ← Global keyboard shortcut handler
│   │   ├── useViewBox.ts     ← Zoom/pan state and handlers
│   │   └── usePersistence.ts ← localStorage auto-save/restore + save slots
│   │
│   ├── components/
│   │   ├── Toolbar.tsx               ← Top toolbar with all controls
│   │   ├── Canvas.tsx                ← Main SVG element + event handlers
│   │   ├── canvas/
│   │   │   ├── StateCircle.tsx       ← Single state (circle + label)
│   │   │   ├── TransitionEdge.tsx    ← Single transition (path + arrow + label)
│   │   │   ├── SelfLoop.tsx          ← Self-loop rendering
│   │   │   ├── StartArrow.tsx        ← Incoming arrow for start state
│   │   │   ├── SelectionRect.tsx     ← Drag-select rectangle
│   │   │   └── GridPattern.tsx       ← SVG dot grid pattern
│   │   ├── MiniMap.tsx               ← Minimap overlay
│   │   ├── WarningBar.tsx            ← Validation warnings display
│   │   ├── GuideModal.tsx            ← Help modal (shortcuts, features, tutorial)
│   │   ├── RenamePopover.tsx         ← State rename with KaTeX preview
│   │   ├── TransitionEditor.tsx      ← Inline transition symbol editor
│   │   ├── ContextMenu.tsx           ← Right-click menu for states/edges
│   │   ├── FileMenu.tsx              ← File dropdown (New, Save, Open, etc.)
│   │   ├── ExportMenu.tsx            ← Export dropdown (PNG, SVG, JSON)
│   │   ├── ThemeToggle.tsx           ← Dark/light mode button
│   │   └── Toast.tsx                 ← Toast notification wrapper
│   │
│   ├── lib/
│   │   ├── layout.ts          ← dagre integration for auto-layout
│   │   ├── export.ts          ← PNG/SVG/JSON export logic
│   │   ├── validation.ts      ← Automaton validation (warnings)
│   │   ├── latex.ts           ← KaTeX rendering helpers
│   │   └── geometry.ts        ← Math helpers: edge curves, self-loop paths, hit-testing
│   │
│   └── constants.ts           ← Colors, sizes, grid spacing, defaults
│
└── README.md                  ← Project description, features, screenshot, deploy instructions
```

## GitHub Pages Deployment

Include a `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Set `base` in `vite.config.ts` to `'/<repo-name>/'` for correct asset paths on GitHub Pages.

Include in the README:
1. Clone the repository
2. `npm install && npm run dev` for local development
3. Push to `main` — GitHub Actions builds and deploys automatically
4. Enable Pages in repo Settings → Pages → Source: GitHub Actions
5. Site is live at `https://<username>.github.io/<repo-name>/`

## Quality Bar

- Clean, well-organized TypeScript. Each file has a single responsibility. No `any` types.
- Smooth interactions — 60fps dragging, panning, zooming with no stutter or re-render jank
- Accessible: Radix handles focus trapping and ARIA for modals/menus. All icon buttons have `aria-label`. Keyboard navigable.
- Works in latest Chrome, Firefox, and Edge
- No console errors, no TypeScript errors, no ESLint warnings in normal usage
- Production build under 500KB gzipped
