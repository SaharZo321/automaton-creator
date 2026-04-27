import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X, MousePointer, Move, Edit2,
  Download, Grid, HelpCircle,
  Plus, Link, Settings, Keyboard,
  Spline, Type
} from 'lucide-react';

interface GuideModalProps {
  open: boolean;
  onClose: () => void;
}

const isMac = typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
const mod = isMac ? '⌘' : 'Ctrl';

const shortcuts = [
  { category: 'Navigation', items: [
    { keys: ['Two-finger scroll'], desc: 'Pan canvas' },
    { keys: ['Pinch', 'Ctrl+Scroll'], desc: 'Zoom in/out' },
    { keys: ['Middle-click drag'], desc: 'Pan canvas' },
    { keys: ['Space + Drag'], desc: 'Pan canvas' },
    { keys: ['F'], desc: 'Fit view to all states' },
    { keys: ['M'], desc: 'Toggle minimap' },
  ]},
  { category: 'Editing', items: [
    { keys: ['Double-click canvas'], desc: 'Create new state' },
    { keys: ['Double-click state'], desc: 'Rename state' },
    { keys: ['Click + Drag'], desc: 'Move state' },
    { keys: ['Shift + Click'], desc: 'Toggle selection' },
    { keys: ['Click + Drag (empty)'], desc: 'Selection rectangle' },
    { keys: [isMac ? '⌫' : 'Delete', isMac ? 'Delete' : 'Backspace'], desc: 'Delete selected' },
    { keys: ['T'], desc: 'Toggle transition / select mode' },
    { keys: [`${mod}+D`], desc: 'Duplicate selected states' },
    { keys: ['Escape'], desc: 'Deselect all' },
    { keys: ['G'], desc: 'Toggle snap-to-grid' },
  ]},
  { category: 'File', items: [
    { keys: [`${mod}+Z`], desc: 'Undo' },
    { keys: [`${mod}+Shift+Z`], desc: 'Redo' },
    { keys: [`${mod}+A`], desc: 'Select all' },
    { keys: [`${mod}+C`], desc: 'Copy as JSON' },
    { keys: [`${mod}+V`], desc: 'Paste from JSON' },
    { keys: ['?'], desc: 'Open this guide' },
  ]},
];

const features = [
  { icon: Plus, title: 'Create States', desc: 'Double-click on empty canvas to create a state. First state becomes the start state automatically.' },
  { icon: Link, title: 'Add Transitions', desc: 'Click the "Add Transition" button, then click source → destination state. Set the symbol in the popover.' },
  { icon: Spline, title: 'Draggable Transitions', desc: 'Select a transition and drag the handle at its midpoint to adjust the curve. Self-loop handles rotate the loop around the state.' },
  { icon: Edit2, title: 'LaTeX Labels', desc: 'State names and transition symbols (in NFA/NFA-ε modes) support LaTeX: wrap in $...$ e.g. $q_0$ or $\\sigma$.' },
  { icon: Type, title: 'Alphabet (Σ)', desc: 'Configure the alphabet via the Σ button in the toolbar. Used to detect missing transitions in DFA mode.' },
  { icon: MousePointer, title: 'Context Menu', desc: 'Right-click (or Ctrl+Click on Mac) any state or transition to set start, toggle accept, rename, or delete.' },
  { icon: Settings, title: 'Auto-Layout', desc: 'Click "Auto-layout" to automatically arrange states using the dagre algorithm.' },
  { icon: Grid, title: 'Snap to Grid', desc: 'Toggle grid snapping with G key or toolbar button for precise placement.' },
  { icon: Move, title: 'Zoom & Pan', desc: 'Trackpad: two-finger scroll to pan, pinch to zoom. Mouse: Ctrl+scroll or pinch to zoom, middle-click or Space+drag to pan.' },
  { icon: Download, title: 'Export', desc: 'Export as PNG (2x resolution), SVG, or JSON. Import JSON to restore automata.' },
];

const tutorial = [
  { step: 1, title: 'Create a state', desc: 'Double-click anywhere on the canvas. A circle appears with name "q0" — this is automatically the start state.' },
  { step: 2, title: 'Name your state', desc: 'Double-click the state to rename it. Try "$q_0$" for LaTeX rendering. The live preview shows how it will look.' },
  { step: 3, title: 'Add more states & transitions', desc: 'Create more states, then click "Add Transition" in the toolbar. Click source state, then destination state. In NFA-ε mode use the ε button to insert epsilon quickly.' },
  { step: 4, title: 'Set start and accept states', desc: 'Right-click (Ctrl+Click on Mac) any state to set it as the start state or toggle its accept status (double circle).' },
  { step: 5, title: 'Export your automaton', desc: 'Use the Export menu to download as PNG or SVG, or File menu to save/load as JSON.' },
];

export const GuideModal: React.FC<GuideModalProps> = ({ open, onClose }) => {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed inset-4 sm:inset-8 lg:inset-16 z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <HelpCircle size={22} className="text-blue-500" />
            <Dialog.Title className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Automaton Creator — Guide
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="ml-auto p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                aria-label="Close guide"
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-10 styled-scrollbar">
            {/* Quick Start Tutorial */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">!</span>
                Quick Start
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tutorial.map((item) => (
                  <div key={item.step} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{item.title}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Features */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Settings size={18} className="text-slate-500" />
                Features
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {features.map((f) => (
                  <div key={f.title} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <f.icon size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{f.title}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Keyboard Shortcuts */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Keyboard size={18} className="text-slate-500" />
                Keyboard Shortcuts
              </h2>
              <div className="grid sm:grid-cols-3 gap-6">
                {shortcuts.map((cat) => (
                  <div key={cat.category}>
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                      {cat.category}
                    </h3>
                    <div className="space-y-1.5">
                      {cat.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-2">
                          <span className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</span>
                          <div className="flex gap-1 flex-shrink-0">
                            {item.keys.map((k) => (
                              <kbd key={k} className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono">
                                {k}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
