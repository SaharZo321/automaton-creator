import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Download, Image, FileImage, FileJson, ChevronDown } from 'lucide-react';

interface ExportMenuProps {
  onExportPng: () => void;
  onExportSvg: () => void;
  onExportJson: () => void;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  onExportPng,
  onExportSvg,
  onExportJson,
}) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <Download size={16} />
          Export
          <ChevronDown size={14} className="text-slate-400" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 animate-in fade-in-0 zoom-in-95"
          sideOffset={6}
        >
          <DropdownMenu.Item
            onSelect={onExportPng}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 outline-none"
          >
            <Image size={15} className="text-blue-500" />
            Export as PNG
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onSelect={onExportSvg}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 outline-none"
          >
            <FileImage size={15} className="text-emerald-500" />
            Export as SVG
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-slate-200 dark:bg-slate-700 my-1" />

          <DropdownMenu.Item
            onSelect={onExportJson}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 outline-none"
          >
            <FileJson size={15} className="text-amber-500" />
            Download JSON
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
