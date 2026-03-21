import React, { useEffect, useRef } from 'react';
import { Play, CheckCircle, Edit2, Trash2 } from 'lucide-react';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface Separator {
  separator: true;
}

type MenuEntry = MenuItem | Separator;

interface ContextMenuOverlayProps {
  x: number;
  y: number;
  items: MenuEntry[];
  onClose: () => void;
}

export const ContextMenuOverlay: React.FC<ContextMenuOverlayProps> = ({ x, y, items, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  // Clamp to viewport
  const menuW = 176;
  const menuH = items.length * 36;
  const clampedX = Math.min(x, window.innerWidth - menuW - 8);
  const clampedY = Math.min(y, window.innerHeight - menuH - 8);

  return (
    <div
      ref={ref}
      style={{ position: 'fixed', left: clampedX, top: clampedY, zIndex: 9999 }}
      className="min-w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, i) => {
        if ('separator' in item) {
          return <div key={i} className="h-px bg-slate-200 dark:bg-slate-700 my-1" />;
        }
        return (
          <button
            key={i}
            disabled={item.disabled}
            onClick={() => { item.onClick(); onClose(); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer outline-none transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed ${
              item.danger
                ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

// Helper to build state context menu items
export function buildStateMenuItems(opts: {
  stateId: string;
  isStart: boolean;
  isAccept: boolean;
  onSetStart: (id: string) => void;
  onToggleAccept: (id: string) => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
}): MenuEntry[] {
  return [
    {
      label: opts.isStart ? 'Start state (current)' : 'Set as start state',
      icon: <Play size={15} className="text-emerald-500" />,
      onClick: () => opts.onSetStart(opts.stateId),
      disabled: opts.isStart,
    },
    {
      label: opts.isAccept ? 'Remove accept state' : 'Set as accept state',
      icon: <CheckCircle size={15} className={opts.isAccept ? 'text-emerald-500' : 'text-slate-400'} />,
      onClick: () => opts.onToggleAccept(opts.stateId),
    },
    {
      label: 'Rename',
      icon: <Edit2 size={15} className="text-blue-500" />,
      onClick: () => opts.onRename(opts.stateId),
    },
    { separator: true },
    {
      label: 'Delete',
      icon: <Trash2 size={15} />,
      onClick: () => opts.onDelete(opts.stateId),
      danger: true,
    },
  ];
}

// Helper to build transition context menu items
export function buildTransitionMenuItems(opts: {
  transitionId: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}): MenuEntry[] {
  return [
    {
      label: 'Edit symbols',
      icon: <Edit2 size={15} className="text-blue-500" />,
      onClick: () => opts.onEdit(opts.transitionId),
    },
    { separator: true },
    {
      label: 'Delete',
      icon: <Trash2 size={15} />,
      onClick: () => opts.onDelete(opts.transitionId),
      danger: true,
    },
  ];
}
