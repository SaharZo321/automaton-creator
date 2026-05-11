import React, { useState, useEffect, useRef } from 'react';
import type { AutomatonType } from '../types/automaton';

interface TransitionEditorProps {
  open: boolean;
  position: { x: number; y: number };
  currentSymbols: string[];
  automatonType: AutomatonType;
  onSave: (symbols: string[]) => void;
  onClose: () => void;
}

export const TransitionEditor: React.FC<TransitionEditorProps> = ({
  open,
  position,
  currentSymbols,
  automatonType,
  onSave,
  onClose,
}) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isPDA = automatonType === 'PDA';
  const separator = isPDA ? ';' : ',';

  useEffect(() => {
    if (open) {
      setValue(currentSymbols.join(isPDA ? '; ' : ', '));
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // intentionally omit currentSymbols — only reset when editor opens, not on re-renders

  const insertEpsilon = () => {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? value.length;
    const newValue = value.slice(0, start) + 'ε' + value.slice(end);
    setValue(newValue);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + 1, start + 1);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const symbols = value
      .split(separator)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (symbols.length > 0) {
      onSave(symbols);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed z-50"
      style={{ left: position.x - 110, top: position.y + 10 }}
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 w-60">
        <form onSubmit={handleSubmit}>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">
            {isPDA ? 'PDA transition(s) — read, pop / push' : 'Transition symbol(s)'}
          </label>
          <div className="flex gap-1.5 items-center">
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
              className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={isPDA ? 'a, X / Y; b, ε / Z' : 'a, b, ε'}
            />
            {(automatonType === 'NFA-e' || isPDA) && (
              <button
                type="button"
                onClick={insertEpsilon}
                title="Insert ε"
                className="px-2.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium transition-colors flex-shrink-0"
              >
                ε
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {isPDA ? (
              <>Format: <span className="font-mono">read, pop / push</span>. Separate multiple with <span className="font-mono">;</span>. Use ε for empty.</>
            ) : (
              <>Separate with commas. LaTeX: <span className="font-mono">$\sigma$</span></>
            )}
          </p>

          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Save
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
