import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  Download,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Employee, Unit, Position } from '../../types';
import { employeeService } from '../../services/employeeService';
import { masterDataService } from '../../services/masterDataService';
import { exportService } from '../../services/exportService';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const DataExport: React.FC = () => {
  const { success } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedActive, setSelectedActive] = useState('active');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [empRes, uList, pList] = await Promise.all([
        employeeService.getEmployees({
          unit_id: selectedUnit || undefined,
          position_id: selectedPosition || undefined,
          employment_status: selectedStatus || undefined,
          is_active: selectedActive === 'all' ? undefined : selectedActive === 'active',
          limit: 1000
        }),
        masterDataService.getUnits(),
        masterDataService.getPositions()
      ]);
      setEmployees(empRes.data);
      setUnits(uList);
      setPositions(pList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedUnit, selectedPosition, selectedStatus, selectedActive]);

  const handleExportExcel = () => {
    exportService.exportEmployeesToExcel(employees);
    success('Export Excel Berhasil', `${employees.length} data karyawan berhasil diexport.`);
  };

  const handleExportPdf = () => {
    exportService.exportEmployeesToPdf(employees);
    success('Export PDF Berhasil', `File PDF laporan telah diunduh.`);
  };

  const handleExportCsv = () => {
    const csvData = employees.map(e => ({
      ID: e.employee_number,
      Nama: e.full_name,
      NIK: e.nik,
      NIP: e.nip || '-',
      Status: e.employment_status,
      Unit: e.units_list?.join('; ') || '-',
      PenugasanUtama: e.primary_assignment?.position_name || '-',
      Aktif: e.is_active ? 'Ya' : 'Tidak'
    }));
    exportService.exportToCsv(csvData, 'Data_Karyawan_SIMKA');
    success('Export CSV Berhasil', `${employees.length} data berhasil diexport.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Card
        title="Pusat Export Data Karyawan"
        subtitle="Export data mengikuti filter kriteria aktif (Unit, Jabatan, Status Kepegawaian, Keaktifan)"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Filter Unit</label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="">Semua Unit</option>
              {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Filter Jabatan</label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="">Semua Jabatan</option>
              {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status Kepegawaian</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="">Semua Status</option>
              <option value="Tetap">Tetap</option>
              <option value="Kontrak">Kontrak</option>
              <option value="Honorer">Honorer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status Keaktifan</label>
            <select
              value={selectedActive}
              onChange={(e) => setSelectedActive(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="active">Aktif Saja</option>
              <option value="inactive">Nonaktif</option>
              <option value="all">Semua</option>
            </select>
          </div>
        </div>

        {/* Export Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Microsoft Excel (.xlsx)</h4>
                <p className="text-xs text-slate-500">Spreadsheet lengkap dengan seluruh field</p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExportExcel}
            >
              Unduh Excel ({employees.length} Data)
            </Button>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Dokumen PDF (.pdf)</h4>
                <p className="text-xs text-slate-500">Format cetak resmi yayasan & laporan</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-rose-700 border-rose-200 hover:bg-rose-50"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExportPdf}
            >
              Unduh PDF ({employees.length} Data)
            </Button>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200">
                <Printer className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Print Langsung / CSV</h4>
                <p className="text-xs text-slate-500">Cetak browser atau ekspor data CSV</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => exportService.triggerPrint()}
              >
                Print View
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleExportCsv}
              >
                CSV
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
