import React, { useState, useEffect, useRef } from 'react';
import { renderLatex } from '../lib/latex';

interface RenamePopoverProps {
  open: boolean;
  position: { x: number; y: number };
  currentName: string;
  onRename: (name: string) => void;
  onClose: () => void;
}

export const RenamePopover: React.FC<RenamePopoverProps> = ({
  open,
  position,
  currentName,
  onRename,
  onClose,
}) => {
  const [value, setValue] = useState(currentName);
  const previewRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue(currentName);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, currentName]);

  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.innerHTML = renderLatex(value || 'Preview');
    }
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) {
      onRename(trimmed);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed z-50"
      style={{ left: position.x - 100, top: position.y + 40 }}
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 w-56">
        <form onSubmit={handleSubmit}>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">
            State name (LaTeX: $q_0$)
          </label>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.stopPropagation();
                onClose();
              }
            }}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. q0 or $q_0$"
          />

          <div className="mt-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 min-h-8 flex items-center justify-center">
            <div
              ref={previewRef}
              className="text-sm text-slate-700 dark:text-slate-300"
            />
          </div>

          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Rename
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
