import React, { useState, useRef } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { FolderOpen, Save, FilePlus, Trash2, ChevronDown, X } from 'lucide-react';
import type { SaveEntry } from '../hooks/usePersistence';
import type { AutomatonState } from '../types/automaton';
import { deserializeAutomaton } from '../lib/export';

interface FileMenuProps {
  onNew: () => void;
  onSaveAs: (name: string) => void;
  saves: SaveEntry[];
  onLoadSave: (name: string) => void;
  onDeleteSave: (name: string) => void;
  onLoadJson: (state: AutomatonState) => void;
  onError: (msg: string) => void;
  hasUnsaved: boolean;
}

export const FileMenu: React.FC<FileMenuProps> = ({
  onNew,
  onSaveAs,
  saves,
  onLoadSave,
  onDeleteSave,
  onLoadJson,
  onError,
}) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [openDialogOpen, setOpenDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const name = saveName.trim();
    if (!name) return;
    onSaveAs(name);
    setSaveDialogOpen(false);
    setSaveName('');
  };

  const handleLoadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        const automaton = deserializeAutomaton(data);
        if (automaton) {
          onLoadJson(automaton);
        } else {
          onError('Invalid automaton JSON format.');
        }
      } catch {
        onError('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <FolderOpen size={16} />
            File
            <ChevronDown size={14} className="text-slate-400" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="z-50 min-w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 animate-in fade-in-0 zoom-in-95"
            sideOffset={6}
          >
            <DropdownMenu.Item
              onSelect={onNew}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 outline-none"
            >
              <FilePlus size={15} className="text-slate-400" />
              New
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onSelect={() => setSaveDialogOpen(true)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 outline-none"
            >
              <Save size={15} className="text-slate-400" />
              Save As…
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onSelect={() => setOpenDialogOpen(true)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 outline-none"
            >
              <FolderOpen size={15} className="text-slate-400" />
              Open Saved…
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="h-px bg-slate-200 dark:bg-slate-700 my-1" />

            <DropdownMenu.Item
              onSelect={() => fileInputRef.current?.click()}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 outline-none"
            >
              <FolderOpen size={15} className="text-slate-400" />
              Load JSON File…
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleLoadFile}
      />

      {/* Save As Dialog */}
      <Dialog.Root open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-80">
            <div className="flex items-center gap-2 mb-4">
              <Save size={18} className="text-blue-500" />
              <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Save As
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="ml-auto p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400" aria-label="Close">
                  <X size={16} />
                </button>
              </Dialog.Close>
            </div>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Enter a name"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!saveName.trim()}
                className="flex-1 px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Save
              </button>
              <Dialog.Close asChild>
                <button className="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors">
                  Cancel
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Open Saved Dialog */}
      <Dialog.Root open={openDialogOpen} onOpenChange={setOpenDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-[480px] max-h-[60vh] flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen size={18} className="text-blue-500" />
              <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Open Saved Automata
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="ml-auto p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400" aria-label="Close">
                  <X size={16} />
                </button>
              </Dialog.Close>
            </div>

            {saves.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                No saved automata yet. Use "Save As" to create one.
              </p>
            ) : (
              <div className="overflow-y-auto flex-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide border-b border-slate-200 dark:border-slate-700">
                      <th className="pb-2 pr-4">Name</th>
                      <th className="pb-2 pr-4">Type</th>
                      <th className="pb-2 pr-4">States</th>
                      <th className="pb-2 pr-4">Modified</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {saves.map((save) => (
                      <tr key={save.name} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="py-2 pr-4 font-medium text-slate-900 dark:text-slate-100">{save.name}</td>
                        <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">{save.type}</td>
                        <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">{save.stateCount}</td>
                        <td className="py-2 pr-4 text-slate-500 dark:text-slate-500 text-xs">
                          {save.lastModified.toLocaleDateString()}
                        </td>
                        <td className="py-2 flex gap-1">
                          <button
                            onClick={() => { onLoadSave(save.name); setOpenDialogOpen(false); }}
                            className="px-2.5 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => onDeleteSave(save.name)}
                            className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors"
                            aria-label={`Delete ${save.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
