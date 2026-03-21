import { useEffect } from 'react';

interface KeyboardHandlers {
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSelectAll: () => void;
  onCopy: () => void;
  onPaste: (text: string) => void;
  onToggleGrid: () => void;
  onFitView: () => void;
  onToggleMinimap: () => void;
  onOpenGuide: () => void;
  onEscape: () => void;
  onDuplicate: () => void;
  onToggleMode: () => void;
}

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    (el as HTMLElement).isContentEditable
  );
}

export function useKeyboard(handlers: KeyboardHandlers) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const focused = isInputFocused();

      // Ctrl shortcuts work even in inputs for some cases
      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handlers.onUndo();
        return;
      }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handlers.onRedo();
        return;
      }
      if (ctrl && e.key === 'a') {
        if (!focused) {
          e.preventDefault();
          handlers.onSelectAll();
        }
        return;
      }
      if (ctrl && e.key === 'c') {
        if (!focused) {
          e.preventDefault();
          handlers.onCopy();
        }
        return;
      }
      if (ctrl && e.key === 'd') {
        if (!focused) {
          e.preventDefault();
          handlers.onDuplicate();
        }
        return;
      }
      if (ctrl && e.key === 'v') {
        if (!focused) {
          e.preventDefault();
          navigator.clipboard.readText().then((text) => {
            handlers.onPaste(text);
          }).catch(() => {});
        }
        return;
      }

      // Single-key shortcuts — only when not in an input
      if (focused) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handlers.onDelete();
      } else if (e.key === 'Escape') {
        handlers.onEscape();
      } else if (e.key === 'g' || e.key === 'G') {
        handlers.onToggleGrid();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handlers.onFitView();
      } else if (e.key === 'm' || e.key === 'M') {
        handlers.onToggleMinimap();
      } else if (e.key === '?') {
        handlers.onOpenGuide();
      } else if (e.key === 't' || e.key === 'T') {
        handlers.onToggleMode();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlers]);
}
