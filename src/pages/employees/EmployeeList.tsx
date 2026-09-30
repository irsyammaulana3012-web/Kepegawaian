import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronDown,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Briefcase,
  Layers,
  Sparkles,
  Eye,
  Edit,
  Trash2,
  Building2,
  RotateCcw
} from 'lucide-react';
import { Employee, Unit, Position } from '../../types';
import { employeeService, EmployeeFilterOptions } from '../../services/employeeService';
import { masterDataService } from '../../services/masterDataService';
import { exportService } from '../../services/exportService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { Skeleton } from '../../components/ui/Skeleton';

export const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const { canEdit } = useAuth();
  const { success, error } = useToast();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [isLoading, setIsLoading] = useState(true);

  // Master options for filters
  const [units, setUnits] = useState<Unit[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedMultiUnits, setSelectedMultiUnits] = useState<string[]>([]);
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedEmploymentStatus, setSelectedEmploymentStatus] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedActiveStatus, setSelectedActiveStatus] = useState<string>('active');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  // Delete & Status modal states
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [employeeToToggleStatus, setEmployeeToToggleStatus] = useState<Employee | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load master data for filter dropdowns
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [u, p] = await Promise.all([
          masterDataService.getUnits(),
          masterDataService.getPositions()
        ]);
        setUnits(u);
        setPositions(p);
      } catch (err) {
        console.error('Error fetching master data:', err);
      }
    };
    fetchMasters();
  }, []);

  const loadEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: EmployeeFilterOptions = {
        search: search.trim() || undefined,
        unit_id: selectedUnit || undefined,
        unit_ids: selectedMultiUnits.length > 0 ? selectedMultiUnits : undefined,
        position_id: selectedPosition || undefined,
        employment_status: selectedEmploymentStatus || undefined,
        gender: selectedGender || undefined,
        is_active: selectedActiveStatus === 'all' ? undefined : selectedActiveStatus === 'active',
        page: currentPage,
        limit: limit
      };

      const res = await employeeService.getEmployees(filters);
      setEmployees(res.data);
      setTotal(res.total);
    } catch (err: any) {
      error('Gagal memuat data karyawan', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [
    search,
    selectedUnit,
    selectedMultiUnits,
    selectedPosition,
    selectedEmploymentStatus,
    selectedGender,
    selectedActiveStatus,
    currentPage,
    limit,
    error
  ]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedUnit('');
    setSelectedMultiUnits([]);
    setSelectedPosition('');
    setSelectedEmploymentStatus('');
    setSelectedGender('');
    setSelectedActiveStatus('active');
    setCurrentPage(1);
  };

  const handleToggleMultiUnitSelection = (unitId: string) => {
    setSelectedMultiUnits(prev => {
      if (prev.includes(unitId)) {
        return prev.filter(id => id !== unitId);
      } else {
        return [...prev, unitId];
      }
    });
    setCurrentPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;
    setIsProcessing(true);
    try {
      await employeeService.deleteEmployee(employeeToDelete.id);
      success('Karyawan Berhasil Dihapus', `Data ${employeeToDelete.full_name} telah dihapus.`);
      setEmployeeToDelete(null);
      loadEmployees();
    } catch (err: any) {
      error('Gagal Menghapus Karyawan', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleStatusConfirm = async () => {
    if (!employeeToToggleStatus) return;
    setIsProcessing(true);
    try {
      const newStatus = !employeeToToggleStatus.is_active;
      await employeeService.toggleActiveStatus(employeeToToggleStatus.id, newStatus);
      success(
        newStatus ? 'Karyawan Diaktifkan' : 'Karyawan Dinonaktifkan',
        `Status ${employeeToToggleStatus.full_name} berhasil diperbarui.`
      );
      setEmployeeToToggleStatus(null);
      loadEmployees();
    } catch (err: any) {
      error('Gagal Mengubah Status', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Data Karyawan & SDM
            </h2>
            <Badge variant="emerald" size="sm">
              {total} Karyawan
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Database pusat seluruh pendidik, tenaga kependidikan, dan pengurus yayasan
          </p>
        </div>

        {/* Action Buttons: Add & Exports */}
        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={() => navigate('/employees/new')}
            >
              Tambah Karyawan
            </Button>
          )}

          {/* Export Dropdown Group */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm">
            <button
              onClick={() => exportService.exportEmployeesToExcel(employees)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition"
              title="Export Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Excel</span>
            </button>
            <span className="w-px h-4 bg-slate-200" />
            <button
              onClick={() => exportService.exportEmployeesToPdf(employees)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition"
              title="Export PDF"
            >
              <FileText className="w-3.5 h-3.5 text-rose-700" />
              <span>PDF</span>
            </button>
            <span className="w-px h-4 bg-slate-200" />
            <button
              onClick={() => exportService.triggerPrint()}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg transition"
              title="Print Laporan"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <Card noPadding className="p-4 bg-white border border-slate-200/80">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Global Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan Nama, NIK (16 digit), ID Karyawan (YPA-xxxx), NIP, No HP..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-slate-50/50 hover:bg-white"
            />
          </div>

          {/* Quick Filter: Unit Select */}
          <div className="w-full md:w-52">
            <select
              value={selectedUnit}
              onChange={(e) => {
                setSelectedUnit(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            >
              <option value="">Semua Unit Lembaga</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Filter: Status Kepegawaian */}
          <div className="w-full md:w-44">
            <select
              value={selectedEmploymentStatus}
              onChange={(e) => {
                setSelectedEmploymentStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            >
              <option value="">Semua Status Pegawai</option>
              <option value="Tetap">Tetap</option>
              <option value="Kontrak">Kontrak</option>
              <option value="Honorer">Honorer</option>
              <option value="Magang">Magang</option>
              <option value="Freelance">Freelance</option>
            </select>
          </div>

          {/* Advanced Filter Toggle Button */}
          <Button
            variant={showAdvancedFilter ? 'secondary' : 'outline'}
            size="sm"
            leftIcon={<Filter className="w-3.5 h-3.5" />}
            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            className="w-full md:w-auto shrink-0"
          >
            <span>Filter Lanjutan</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvancedFilter ? 'rotate-180' : ''}`} />
          </Button>

          {(search || selectedUnit || selectedMultiUnits.length > 0 || selectedPosition || selectedEmploymentStatus || selectedGender || selectedActiveStatus !== 'active') && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleResetFilters}
              title="Reset Semua Filter"
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 shrink-0"
            >
              Reset
            </Button>
          )}
        </div>

        {/* ADVANCED MULTI-UNIT & ROLE FILTER DRAWER */}
        {showAdvancedFilter && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">
            {/* Multi-Unit Intersection Filter (WAJIB: SMP IT + SMA IT multi-assignment check!) */}
            <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Filter Khusus Multi-Unit (Penugasan Silang Lintas Unit):</span>
                </span>
                {selectedMultiUnits.length > 0 && (
                  <button
                    onClick={() => setSelectedMultiUnits([])}
                    className="text-[11px] text-emerald-700 hover:underline font-semibold"
                  >
                    Hapus Pilihan ({selectedMultiUnits.length} Unit)
                  </button>
                )}
              </div>
              <p className="text-[11px] text-emerald-800/80 mb-2">
                Pilih 2 atau lebih unit (misal: <strong>SMP IT + SMA IT</strong>) untuk menemukan karyawan yang memiliki penugasan aktif di seluruh unit yang dipilih:
              </p>
              <div className="flex flex-wrap gap-2">
                {units.map((u) => {
                  const isChecked = selectedMultiUnits.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleToggleMultiUnitSelection(u.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition font-medium flex items-center gap-1.5 ${
                        isChecked
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'
                      }`}
                    >
                      <span>{isChecked ? '✓' : '+'}</span>
                      <span>{u.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Criteria Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Jabatan</label>
                <select
                  value={selectedPosition}
                  onChange={(e) => {
                    setSelectedPosition(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full py-1.5 px-3 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">Semua Jabatan</option>
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Jenis Kelamin</label>
                <select
                  value={selectedGender}
                  onChange={(e) => {
                    setSelectedGender(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full py-1.5 px-3 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">Semua Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status Keaktifan</label>
                <select
                  value={selectedActiveStatus}
                  onChange={(e) => {
                    setSelectedActiveStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full py-1.5 px-3 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="active">Karyawan Aktif Saja</option>
                  <option value="inactive">Karyawan Nonaktif</option>
                  <option value="all">Semua Karyawan (Aktif & Nonaktif)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* DATA KARYAWAN TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height={50} />
            ))}
          </div>
        ) : employees.length === 0 ? (
          <EmptyState
            title="Tidak Ada Data Karyawan"
            description="Tidak ada karyawan yang sesuai dengan kriteria pencarian dan filter Anda."
            actionText="Reset Filter"
            onAction={handleResetFilters}
          />
        ) : (
          <>
            {/* MOBILE VIEW (CARD LIST FOR PHONES) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {employees.map((emp, index) => {
                const rowNumber = (currentPage - 1) * limit + index + 1;
                const isMultiUnit = (emp.units_list?.length || 0) > 1;
                const hasMultiAssignment = (emp.assignment_count || 0) > 1;

                return (
                  <div
                    key={emp.id}
                    onClick={() => navigate(`/employees/${emp.id}`)}
                    className="p-4 hover:bg-slate-50 active:bg-emerald-50/50 transition cursor-pointer space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-sm shrink-0 border border-emerald-200 shadow-sm">
                          {emp.photo_url ? (
                            <img
                              src={emp.photo_url}
                              alt={emp.full_name}
                              className="w-full h-full object-cover rounded-2xl"
                            />
                          ) : (
                            emp.full_name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-mono">#{rowNumber}</span>
                            <h4 className="font-bold text-slate-900 text-sm">{emp.full_name}</h4>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="font-mono text-[10px] font-bold text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              {emp.employee_number}
                            </span>
                            {emp.nirg && (
                              <span className="font-mono text-[10px] font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                NIRG: {emp.nirg}
                              </span>
                            )}
                            {emp.nirk && (
                              <span className="font-mono text-[10px] font-bold text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                                NIRK: {emp.nirk}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Badge variant={emp.is_active ? 'emerald' : 'slate'} size="sm">
                        {emp.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </div>

                    {/* Assignment & Units */}
                    <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="font-semibold text-slate-900">
                          {emp.primary_assignment?.position_name || 'Belum Ada Jabatan'}
                        </span>
                        <span className="font-bold text-emerald-800">
                          {emp.primary_assignment?.unit_name || '-'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <Badge
                          variant={
                            emp.employment_status === 'Tetap'
                              ? 'emerald'
                              : emp.employment_status === 'Kontrak'
                              ? 'amber'
                              : 'blue'
                          }
                          size="sm"
                        >
                          {emp.employment_status}
                        </Badge>
                        {hasMultiAssignment && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded border border-amber-200">
                            <Layers className="w-3 h-3" />
                            <span>{emp.assignment_count} Tugas</span>
                          </span>
                        )}
                        {isMultiUnit && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-purple-50 text-purple-800 font-bold px-1.5 py-0.5 rounded border border-purple-200">
                            <Building2 className="w-3 h-3" />
                            <span>Multi-Unit</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions & Completeness */}
                    <div className="flex items-center justify-between pt-1" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-bold">Kelengkapan:</span>
                        <span className="text-xs font-mono font-black text-slate-800">{emp.data_completeness_pct}%</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/employees/${emp.id}`)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-900 hover:bg-emerald-100 flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => navigate(`/employees/${emp.id}/edit`)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP VIEW (FULL RICH DATA TABLE) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                    <th className="py-3.5 px-4">Karyawan & Registrasi</th>
                    <th className="py-3.5 px-4">NIK & NIP</th>
                    <th className="py-3.5 px-4">Penugasan & Unit</th>
                    <th className="py-3.5 px-4">Status Kerja</th>
                    <th className="py-3.5 px-4">Tgl Masuk</th>
                    <th className="py-3.5 px-4">Kelengkapan</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp, index) => {
                    const rowNumber = (currentPage - 1) * limit + index + 1;
                    const isMultiUnit = (emp.units_list?.length || 0) > 1;
                    const hasMultiAssignment = (emp.assignment_count || 0) > 1;

                    return (
                      <tr
                        key={emp.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/employees/${emp.id}`)}
                      >
                        {/* No */}
                        <td className="py-3.5 px-4 text-center font-medium text-slate-400">
                          {rowNumber}
                        </td>

                        {/* Photo & Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-200">
                              {emp.photo_url ? (
                                <img
                                  src={emp.photo_url}
                                  alt={emp.full_name}
                                  className="w-full h-full object-cover rounded-xl"
                                />
                              ) : (
                                emp.full_name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-emerald-800 transition">
                                {emp.full_name}
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                                <span className="font-mono font-semibold text-emerald-900 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                                  {emp.employee_number}
                                </span>
                                {emp.nirg && (
                                  <span className="font-mono font-bold text-amber-900 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
                                    NIRG: {emp.nirg}
                                  </span>
                                )}
                                {emp.nirk && (
                                  <span className="font-mono font-bold text-indigo-900 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200/60">
                                    NIRK: {emp.nirk}
                                  </span>
                                )}
                                {emp.nickname && <span>({emp.nickname})</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* NIK & NIP */}
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <div className="font-semibold text-slate-800">{emp.nik}</div>
                          <div className="text-slate-400">{emp.nip || '-'}</div>
                        </td>

                        {/* MULTIPLE PENUGASAN DISPLAY */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            {/* Primary Assignment Badge */}
                            {emp.primary_assignment ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">
                                  {emp.primary_assignment.position_name || '-'}
                                </span>
                                <span className="text-slate-400">•</span>
                                <span className="text-emerald-800 font-semibold">
                                  {emp.primary_assignment.unit_name || '-'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Belum ada penugasan</span>
                            )}

                            {/* Multi-Assignment Tag & Unit Pill */}
                            <div className="flex flex-wrap items-center gap-1">
                              {hasMultiAssignment && (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded border border-amber-200">
                                  <Layers className="w-3 h-3" />
                                  <span>{emp.assignment_count} Penugasan</span>
                                </span>
                              )}

                              {isMultiUnit && (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-purple-50 text-purple-800 font-bold px-1.5 py-0.5 rounded border border-purple-200">
                                  <Building2 className="w-3 h-3" />
                                  <span>{emp.units_list?.join(' • ')}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Employment Status */}
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={
                              emp.employment_status === 'Tetap'
                                ? 'emerald'
                                : emp.employment_status === 'Kontrak'
                                ? 'amber'
                                : 'blue'
                            }
                            size="sm"
                          >
                            {emp.employment_status}
                          </Badge>
                        </td>

                        {/* Join Date */}
                        <td className="py-3.5 px-4 text-slate-600">
                          {new Date(emp.join_date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>

                        {/* Completeness Gauge */}
                        <td className="py-3.5 px-4">
                          <div className="w-24">
                            <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                              <span>{emp.data_completeness_pct}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                              <div
                                className={`h-full rounded-full ${
                                  (emp.data_completeness_pct || 0) === 100
                                    ? 'bg-emerald-600'
                                    : (emp.data_completeness_pct || 0) < 60
                                    ? 'bg-rose-500'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${emp.data_completeness_pct || 0}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Active Status */}
                        <td className="py-3.5 px-4 text-center">
                          <Badge variant={emp.is_active ? 'emerald' : 'slate'} size="sm">
                            {emp.is_active ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td
                          className="py-3.5 px-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(`/employees/${emp.id}`)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                              title="Lihat Detail Profil"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {canEdit && (
                              <>
                                <button
                                  onClick={() => navigate(`/employees/${emp.id}/edit`)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition"
                                  title="Edit Data"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => setEmployeeToToggleStatus(emp)}
                                  className={`p-1.5 rounded-lg transition ${
                                    emp.is_active
                                      ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                      : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                                  }`}
                                  title={emp.is_active ? 'Nonaktifkan Karyawan' : 'Aktifkan Karyawan'}
                                >
                                  {emp.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                </button>

                                <button
                                  onClick={() => setEmployeeToDelete(emp)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                                  title="Hapus Karyawan"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination Controls */}
        <div className="px-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            limit={limit}
            onPageChange={(p) => setCurrentPage(p)}
            onLimitChange={(l) => {
              setLimit(l);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        isOpen={Boolean(employeeToDelete)}
        onClose={() => setEmployeeToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Data Karyawan?"
        message={`Apakah Anda yakin ingin menghapus data "${employeeToDelete?.full_name}" (${employeeToDelete?.employee_number})? Seluruh data penugasan, riwayat pendidikan, dan dokumen terkait akan ikut terhapus.`}
        confirmText="Ya, Hapus Data"
        type="danger"
        isLoading={isProcessing}
      />

      {/* Toggle Active Status Modal */}
      <ConfirmationDialog
        isOpen={Boolean(employeeToToggleStatus)}
        onClose={() => setEmployeeToToggleStatus(null)}
        onConfirm={handleToggleStatusConfirm}
        title={employeeToToggleStatus?.is_active ? 'Nonaktifkan Karyawan?' : 'Aktifkan Kembali Karyawan?'}
        message={`Apakah Anda yakin ingin ${
          employeeToToggleStatus?.is_active ? 'menonaktifkan' : 'mengaktifkan kembali'
        } karyawan "${employeeToToggleStatus?.full_name}"?`}
        confirmText={employeeToToggleStatus?.is_active ? 'Nonaktifkan' : 'Aktifkan'}
        type={employeeToToggleStatus?.is_active ? 'warning' : 'info'}
        isLoading={isProcessing}
      />
    </div>
  );
};
