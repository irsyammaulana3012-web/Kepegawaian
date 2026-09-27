import React, { useState } from 'react';
import { ExcelImport } from './ExcelImport';
import { DataExport } from './DataExport';
import { FileSpreadsheet, DownloadCloud, UploadCloud } from 'lucide-react';

export const ImportExportIndex: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'import' | 'export'>('import');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('import')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'import'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Import Data Excel</span>
        </button>

        <button
          onClick={() => setActiveSubTab('export')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'export'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DownloadCloud className="w-4 h-4" />
          <span>Export Data Karyawan</span>
        </button>
      </div>

      {activeSubTab === 'import' ? <ExcelImport /> : <DataExport />}
    </div>
  );
};
