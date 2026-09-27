import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Search,
  Building2,
  Layers,
  Star,
  Download,
  FileSpreadsheet,
  FileText,
  Edit2,
  Trash2,
  CheckCircle2,
  Filter,
  Eye,
  Sparkles
} from 'lucide-react';
import { EmployeeAssignment, Unit, Position, Task, Employee } from '../../types';
import { assignmentService } from '../../services/assignmentService';
import { masterDataService } from '../../services/masterDataService';
import { employeeService } from '../../services/employeeService';
import { exportService } from '../../services/exportService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { Skeleton } from '../../components/ui/Skeleton';

export const AssignmentsOverview: React.FC = () => {
  const navigate = useNavigate();
  const { canEdit } = useAuth();
  const { success, error } = useToast();

  const [assignments, setAssignments] = useState<EmployeeAssignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Aktif');
  const [onlyPrimary, setOnlyPrimary] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<EmployeeAssignment | null>(null);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [positionId, setPositionId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [customTaskName, setCustomTaskName] = useState('');
  const [skNumber, setSkNumber] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [status, setStatus] = useState<'Aktif' | 'Selesai' | 'Nonaktif'>('Aktif');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [assignmentToDelete, setAssignmentToDelete] = useState<EmployeeAssignment | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [asgList, empRes, uList, pList, tList] = await Promise.all([
        assignmentService.getAssignments(),
        employeeService.getEmployees({ limit: 500 }),
        masterDataService.getUnits(),
        masterDataService.getPositions(),
        masterDataService.getTasks()
      ]);
      setAssignments(asgList);
      setEmployees(empRes.data);
      setUnits(uList);
      setPositions(pList);
      setTasks(tList);
    } catch (err: any) {
      error('Gagal memuat penugasan', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingAssignment(null);
    setSelectedEmpId(employees[0]?.id || '');
    setUnitId(units[0]?.id || '');
    setPositionId(positions[0]?.id || '');
    setTaskId('');
    setCustomTaskName('');
    setSkNumber('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setIsPrimary(false);
    setStatus('Aktif');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asg: EmployeeAssignment) => {
    setEditingAssignment(asg);
    setSelectedEmpId(asg.employee_id);
    setUnitId(asg.unit_id);
    setPositionId(asg.position_id);
    setTaskId(asg.task_id || '');
    setCustomTaskName(asg.custom_task_name || '');
    setSkNumber(asg.sk_number || '');
    setStartDate(asg.start_date);
    setEndDate(asg.end_date || '');
    setIsPrimary(asg.is_primary);
    setStatus(asg.status);
    setNotes(asg.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !unitId || !positionId || !startDate) {
      error('Karyawan, Unit, Jabatan, dan Tanggal Mulai wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      await assignmentService.saveAssignment({
        id: editingAssignment ? editingAssignment.id : undefined,
        employee_id: selectedEmpId,
        unit_id: unitId,
        position_id: positionId,
        task_id: taskId || null,
        custom_task_name: customTaskName.trim() || undefined,
        sk_number: skNumber.trim() || undefined,
        start_date: startDate,
        end_date: endDate || null,
        is_primary: isPrimary,
        status: status,
        notes: notes.trim() || undefined
      });

      success(
        editingAssignment ? 'Penugasan Diperbarui' : 'Penugasan Berhasil Ditambahkan',
        'Data penugasan telah tersimpan di database.'
      );
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Gagal Menyimpan Penugasan', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!assignmentToDelete) return;
    try {
      await assignmentService.deleteAssignment(assignmentToDelete.id);
      success('Penugasan Dihapus', 'Data penugasan telah dihapus.');
      setAssignmentToDelete(null);
      loadData();
    } catch (err: any) {
      error('Gagal Menghapus', err.message);
    }
  };

  // Filtered list
  const filteredAssignments = assignments.filter((a) => {
    if (selectedStatus && a.status !== selectedStatus) return false;
    if (selectedUnit && a.unit_id !== selectedUnit) return false;
    if (selectedPosition && a.position_id !== selectedPosition) return false;
    if (onlyPrimary && !a.is_primary) return false;

    if (search) {
      const q = search.toLowerCase();
      const matchEmp = a.employee_name?.toLowerCase().includes(q);
      const matchNum = a.employee_number?.toLowerCase().includes(q);
      const matchUnit = a.unit_name?.toLowerCase().includes(q);
      const matchPos = a.position_name?.toLowerCase().includes(q);
      const matchTask = a.task_name?.toLowerCase().includes(q);
      const matchSk = a.sk_number?.toLowerCase().includes(q);
      if (!matchEmp && !matchNum && !matchUnit && !matchPos && !matchTask && !matchSk) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Manajemen Multiple Penugasan
            </h2>
            <Badge variant="gold" size="sm">
              Core Multi-Assignment Engine
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Database seluruh SK dan penugasan karyawan lintas unit, jabatan, dan amanah yayasan
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleOpenAdd}
            >
              Tambah Penugasan
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-700" />}
            onClick={() => exportService.exportAssignmentsToExcel(filteredAssignments)}
          >
            Export Excel
          </Button>
        </div>
      </div>

      {/* Concept Explainer Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white shadow-sm flex items-start gap-3.5 border border-emerald-700/50">
        <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <p className="font-bold text-amber-300 text-sm">
            Prinsip Inti: 1 Karyawan ≠ 1 Unit ≠ 1 Tugas
          </p>
          <p className="text-emerald-100/90 mt-0.5">
            Satu karyawan (misal <strong>Ahmad Fauzi</strong> atau <strong>Nasrullah</strong>) dapat memegang amanah di <strong>SMP IT</strong>, <strong>SMA IT</strong>, dan <strong>Yayasan</strong> sekaligus tanpa menduplikasi data profil karyawan.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card noPadding className="p-4 bg-white border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama karyawan, ID, jabatan, SK..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
          </div>

          {/* Unit Filter */}
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none"
          >
            <option value="">Semua Unit</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          {/* Position Filter */}
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none"
          >
            <option value="">Semua Jabatan</option>
            {positions.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none"
          >
            <option value="">Semua Status</option>
            <option value="Aktif">Status Aktif Saja</option>
            <option value="Selesai">Status Selesai</option>
            <option value="Nonaktif">Status Nonaktif</option>
          </select>
        </div>
      </Card>

      {/* TABLE OF ASSIGNMENTS */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} height={45} />)}
          </div>
        ) : filteredAssignments.length === 0 ? (
          <EmptyState
            title="Tidak Ada Data Penugasan"
            description="Tidak ada penugasan yang cocok dengan filter yang dipilih."
            actionText="Reset Pencarian"
            onAction={() => {
              setSearch('');
              setSelectedUnit('');
              setSelectedPosition('');
              setSelectedStatus('Aktif');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-10 text-center">No</th>
                  <th className="py-3 px-4">Nama Karyawan</th>
                  <th className="py-3 px-4">Unit Lembaga</th>
                  <th className="py-3 px-4">Jabatan</th>
                  <th className="py-3 px-4">Tugas / Amanah</th>
                  <th className="py-3 px-4">Nomor SK</th>
                  <th className="py-3 px-4">Periode Mulai</th>
                  <th className="py-3 px-4 text-center">Tipe</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssignments.map((asg, idx) => (
                  <tr key={asg.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-center font-medium text-slate-400">{idx + 1}</td>
                    
                    <td className="py-3 px-4">
                      <div
                        className="font-bold text-slate-900 hover:text-emerald-800 cursor-pointer"
                        onClick={() => navigate(`/employees/${asg.employee_id}`)}
                      >
                        {asg.employee_name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{asg.employee_number}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {asg.unit_name}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-800">{asg.position_name}</td>

                    <td className="py-3 px-4 font-medium text-slate-700">
                      {asg.task_name || asg.custom_task_name || '-'}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {asg.sk_number || '-'}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {new Date(asg.start_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {asg.is_primary ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>Utama</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Tambahan</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <Badge variant={asg.status === 'Aktif' ? 'emerald' : 'slate'} size="sm">
                        {asg.status}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/employees/${asg.employee_id}`)}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg"
                          title="Buka Profil Karyawan"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {canEdit && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(asg)}
                              className="p-1.5 text-slate-400 hover:text-amber-700 rounded-lg"
                              title="Edit Penugasan"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setAssignmentToDelete(asg)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                              title="Hapus Penugasan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Assignment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAssignment ? 'Edit Penugasan' : 'Tambah Penugasan Baru'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Select
            label="Pilih Karyawan"
            isRequired
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            disabled={Boolean(editingAssignment)}
            options={employees.map(e => ({ value: e.id, label: `${e.full_name} (${e.employee_number})` }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Unit Lembaga"
              isRequired
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              options={units.map(u => ({ value: u.id, label: u.name }))}
            />

            <Select
              label="Jabatan"
              isRequired
              value={positionId}
              onChange={(e) => setPositionId(e.target.value)}
              options={positions.map(p => ({ value: p.id, label: `${p.name} (${p.category})` }))}
            />

            <Select
              label="Tugas Pokok (Dari Master)"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              options={[
                { value: '', label: '-- Pilih Tugas Terdaftar --' },
                ...tasks.map(t => ({ value: t.id, label: t.name }))
              ]}
            />

            <Input
              label="Nama Tugas Khusus (Jika tidak di daftar)"
              value={customTaskName}
              onChange={(e) => setCustomTaskName(e.target.value)}
              placeholder="Guru IPS Kelas VII / Rapim"
            />

            <Input
              label="Nomor SK Penugasan"
              value={skNumber}
              onChange={(e) => setSkNumber(e.target.value)}
              placeholder="SK-SMP/2024/015"
            />

            <Input
              label="Tanggal Mulai"
              isRequired
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              label="Tanggal Selesai (Opsional)"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            <Select
              label="Status Penugasan"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              options={[
                { value: 'Aktif', label: 'Aktif' },
                { value: 'Selesai', label: 'Selesai' },
                { value: 'Nonaktif', label: 'Nonaktif' }
              ]}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-600 border-slate-300"
            />
            <span className="text-xs font-bold text-slate-800">
              Tetapkan Sebagai Penugasan Utama Karyawan Ini
            </span>
          </label>

          <Input
            label="Catatan / Keterangan Penugasan"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Jam mengajar, ruang lingkup tugas, dll."
          />

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>Simpan Penugasan</Button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={Boolean(assignmentToDelete)}
        onClose={() => setAssignmentToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Penugasan?"
        message={`Hapus penugasan "${assignmentToDelete?.position_name} di ${assignmentToDelete?.unit_name}" untuk ${assignmentToDelete?.employee_name}?`}
      />
    </div>
  );
};
