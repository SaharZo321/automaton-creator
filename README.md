# Automaton Creator

A single-page web application for visually creating, editing, and exporting finite automata. Built with React, TypeScript, and Vite. Deployable for free on GitHub Pages.

> This project was written entirely by AI (Claude by Anthropic).

## Features

- **Multiple automaton types** — DFA, NFA, NFA-ε, PDA, and TM supported via a toolbar selector
- **Turing Machine transitions** — TM mode uses `read / write, L/R` transitions and `⊔` for blank tape cells
- **Visual SVG canvas** — drag states, draw transitions, create self-loops, pan and zoom
- **LaTeX state labels** — use `$q_0$`, `$q_{even}$` etc. and see them rendered live with KaTeX
- **Undo/redo** — full history stack (50 entries) for all actions
- **Auto-layout** — automatically arrange states using the dagre algorithm
- **Snap-to-grid** — optional grid snapping with a dot pattern overlay
- **Validation warnings** — non-blocking warnings for missing transitions, non-determinism, unreachable states, and more
- **Minimap** — scaled overview of the canvas with a draggable viewport indicator
- **Dark mode** — system preference detected, manually overridable, persisted to localStorage
- **Export** — PNG (2x resolution), SVG, and JSON
- **Persistence** — auto-save to localStorage, named save slots, JSON import/export

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Double-click canvas` | Create new state |
| `Double-click state` | Rename state |
| `T` | Toggle transition / select mode |
| `Delete` / `Backspace` | Delete selected elements |
| `Ctrl+D` | Duplicate selected states |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |
| `Ctrl+A` | Select all |
| `Ctrl+C` | Copy automaton as JSON |
| `Ctrl+V` | Paste automaton from JSON |
| `G` | Toggle snap-to-grid |
| `F` | Fit view to all states |
| `M` | Toggle minimap |
| `Space + Drag` | Pan canvas |
| `Escape` | Deselect / cancel |
| `?` | Open help guide |

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Radix UI (Dialog, DropdownMenu, ContextMenu, Popover, Toast, Tooltip, Select)
- dagre (auto-layout)
- KaTeX (LaTeX rendering)
- html-to-image (PNG export)
- Lucide React (icons)

## Getting Started

```bash
git clone https://github.com/<username>/automaton-creator.git
cd automaton-creator
npm install
npm run dev
```

Open `http://localhost:5173/automaton-creator/` in your browser.

## Deployment (GitHub Pages)

1. Push the repository to GitHub
2. Go to **Settings → Pages → Source** and select **GitHub Actions**
3. Push to `main` — the included workflow builds and deploys automatically
4. The site will be live at `https://<username>.github.io/automaton-creator/`
