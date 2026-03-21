import React, { useState } from 'react';
import type { Warning } from '../lib/validation';
import { AlertTriangle, AlertCircle, ChevronDown, ChevronUp, X } from 'lucide-react';

interface WarningBarProps {
  warnings: Warning[];
}

export const WarningBar: React.FC<WarningBarProps> = ({ warnings }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = warnings.filter((w) => !dismissed.has(w.id));

  if (visible.length === 0) return null;

  const errors = visible.filter((w) => w.type === 'error');
  const warns = visible.filter((w) => w.type === 'warning');

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 bg-amber-50 dark:bg-amber-950/30">
      <div className="flex items-center gap-2 px-4 py-2">
        <div className="flex items-center gap-1.5">
          {errors.length > 0 && (
            <AlertCircle size={16} className="text-rose-500 flex-shrink-0" />
          )}
          {warns.length > 0 && errors.length === 0 && (
            <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
          )}
          <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
            {visible.length} {visible.length === 1 ? 'warning' : 'warnings'}
          </span>
        </div>

        {!isExpanded && (
          <span className="text-sm text-amber-700 dark:text-amber-400 truncate flex-1">
            {visible[0].message}
          </span>
        )}

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setIsExpanded((v) => !v)}
            className="p-1 rounded hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 transition-colors"
            aria-label={isExpanded ? 'Collapse warnings' : 'Expand warnings'}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <ul className="px-4 pb-2 flex flex-col gap-1">
          {visible.map((w) => (
            <li key={w.id} className="flex items-start gap-2">
              {w.type === 'error' ? (
                <AlertCircle size={14} className="text-rose-500 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
              )}
              <span className={`text-sm flex-1 ${
                w.type === 'error'
                  ? 'text-rose-700 dark:text-rose-400'
                  : 'text-amber-700 dark:text-amber-400'
              }`}>
                {w.message}
              </span>
              <button
                onClick={() => setDismissed((d) => new Set([...d, w.id]))}
                className="p-0.5 rounded hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-500 dark:text-amber-500 transition-colors flex-shrink-0"
                aria-label="Dismiss warning"
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
