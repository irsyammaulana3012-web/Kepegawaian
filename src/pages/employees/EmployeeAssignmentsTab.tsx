import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Star,
  CheckCircle2,
  Clock,
  Building2,
  Sparkles,
  Calendar,
  FileText
} from 'lucide-react';
import { EmployeeAssignment, Unit, Position, Task, Department } from '../../types';
import { assignmentService } from '../../services/assignmentService';
import { masterDataService } from '../../services/masterDataService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';

interface EmployeeAssignmentsTabProps {
  employeeId: string;
  onAssignmentsUpdated?: () => void;
}

export const EmployeeAssignmentsTab: React.FC<EmployeeAssignmentsTabProps> = ({
  employeeId,
  onAssignmentsUpdated
}) => {
  const { canEdit } = useAuth();
  const { success, error } = useToast();

  const [assignments, setAssignments] = useState<EmployeeAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Masters
  const [units, setUnits] = useState<Unit[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<EmployeeAssignment | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [unitId, setUnitId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [positionId, setPositionId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [customTaskName, setCustomTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [skNumber, setSkNumber] = useState('');
  const [skDate, setSkDate] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [status, setStatus] = useState<'Aktif' | 'Selesai' | 'Nonaktif'>('Aktif');
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Delete modal state
  const [assignmentToDelete, setAssignmentToDelete] = useState<EmployeeAssignment | null>(null);

  const fetchMastersAndAssignments = async () => {
    setIsLoading(true);
    try {
      const [allUnits, allDeps, allPositions, allTasks, empAssignments] = await Promise.all([
        masterDataService.getUnits(),
        masterDataService.getDepartments(),
        masterDataService.getPositions(),
        masterDataService.getTasks(),
        assignmentService.getAssignmentsByEmployee(employeeId)
      ]);
      setUnits(allUnits);
      setDepartments(allDeps);
      setPositions(allPositions);
      setTasks(allTasks);
      setAssignments(empAssignments);
    } catch (err: any) {
      error('Gagal memuat data penugasan', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMastersAndAssignments();
  }, [employeeId]);

  const handleOpenAddModal = () => {
    setEditingAssignment(null);
    setUnitId(units[0]?.id || '');
    setDepartmentId('');
    setPositionId(positions[0]?.id || '');
    setTaskId('');
    setCustomTaskName('');
    setTaskDescription('');
    setSkNumber('');
    setSkDate('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setIsPrimary(assignments.filter(a => a.status === 'Aktif').length === 0);
    setStatus('Aktif');
    setNotes('');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (asg: EmployeeAssignment) => {
    setEditingAssignment(asg);
    setUnitId(asg.unit_id);
    setDepartmentId(asg.department_id || '');
    setPositionId(asg.position_id);
    setTaskId(asg.task_id || '');
    setCustomTaskName(asg.custom_task_name || '');
    setTaskDescription(asg.task_description || '');
    setSkNumber(asg.sk_number || '');
    setSkDate(asg.sk_date || '');
    setStartDate(asg.start_date);
    setEndDate(asg.end_date || '');
    setIsPrimary(asg.is_primary);
    setStatus(asg.status);
    setNotes(asg.notes || '');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!unitId) errs.unitId = 'Unit lembaga penugasan wajib dipilih';
    if (!positionId) errs.positionId = 'Jabatan wajib dipilih';
    if (!startDate) errs.startDate = 'Tanggal mulai penugasan wajib diisi';
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      errs.endDate = 'Tanggal selesai tidak boleh sebelum tanggal mulai';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await assignmentService.saveAssignment({
        id: editingAssignment ? editingAssignment.id : undefined,
        employee_id: employeeId,
        unit_id: unitId,
        department_id: departmentId || null,
        position_id: positionId,
        task_id: taskId || null,
        custom_task_name: customTaskName.trim() || undefined,
        task_description: taskDescription.trim() || undefined,
        sk_number: skNumber.trim() || undefined,
        sk_date: skDate || undefined,
        start_date: startDate,
        end_date: endDate || null,
        is_primary: isPrimary,
        status: status,
        notes: notes.trim() || undefined
      });

      success(
        editingAssignment ? 'Penugasan Diperbarui' : 'Penugasan Baru Ditambahkan',
        'Data penugasan multi-unit karyawan berhasil disimpan.'
      );
      setIsModalOpen(false);
      fetchMastersAndAssignments();
      if (onAssignmentsUpdated) onAssignmentsUpdated();
    } catch (err: any) {
      error('Gagal Menyimpan Penugasan', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!assignmentToDelete) return;
    try {
      await assignmentService.deleteAssignment(assignmentToDelete.id);
      success('Penugasan Dihapus', 'Data penugasan telah dihapus.');
      setAssignmentToDelete(null);
      fetchMastersAndAssignments();
      if (onAssignmentsUpdated) onAssignmentsUpdated();
    } catch (err: any) {
      error('Gagal Menghapus Penugasan', err.message);
    }
  };

  const handleSetPrimary = async (asgId: string) => {
    try {
      await assignmentService.setPrimary(asgId);
      success('Penugasan Utama Diubah', 'Penugasan terpilih telah ditetapkan sebagai penugasan utama.');
      fetchMastersAndAssignments();
      if (onAssignmentsUpdated) onAssignmentsUpdated();
    } catch (err: any) {
      error('Gagal Mengubah Penugasan Utama', err.message);
    }
  };

  const activeAssignments = assignments.filter(a => a.status === 'Aktif');
  const inactiveAssignments = assignments.filter(a => a.status !== 'Aktif');
  const filteredTasks = tasks.filter(t => !positionId || !t.position_id || t.position_id === positionId);
  const filteredDepartments = departments.filter(d => !unitId || d.unit_id === unitId);

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-emerald-950">
              Daftar Multi-Penugasan Karyawan
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-800 text-white font-bold text-xs">
              {activeAssignments.length} Penugasan Aktif
            </span>
          </div>
          <p className="text-xs text-emerald-900/80 mt-1 leading-relaxed">
            Satu karyawan dapat bertugas di berbagai unit lembaga pesantren dengan jabatan dan tugas berbeda.
          </p>
        </div>

        {canEdit && (
          <Button
            variant="gold"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAddModal}
            className="shrink-0"
          >
            + Tambah Penugasan
          </Button>
        )}
      </div>

      {/* SECTION 1: PENUGASAN AKTIF */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Penugasan Sedang Berjalan (Aktif)</span>
        </h4>

        {activeAssignments.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
            Belum ada penugasan aktif untuk karyawan ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAssignments.map((asg) => (
              <div
                key={asg.id}
                className={`p-5 rounded-2xl border transition-all duration-200 bg-white shadow-sm relative ${
                  asg.is_primary
                    ? 'border-emerald-700/60 ring-2 ring-emerald-600/10 shadow-emerald-900/5'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Primary Ribbon / Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/60 shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-slate-900 text-sm">
                        {asg.unit_name}
                      </h5>
                      <p className="text-xs font-semibold text-emerald-800">
                        {asg.position_name}
                      </p>
                    </div>
                  </div>

                  {asg.is_primary ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white font-bold text-[10px] shadow-sm shadow-amber-500/20">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Penugasan Utama</span>
                    </span>
                  ) : canEdit ? (
                    <button
                      onClick={() => handleSetPrimary(asg.id)}
                      className="text-[11px] text-slate-500 hover:text-amber-700 font-semibold hover:underline"
                    >
                      Jadikan Utama
                    </button>
                  ) : null}
                </div>

                {/* Details */}
                <div className="space-y-2 py-2 border-y border-slate-100 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-500">Tugas / Amanah:</span>
                    <span className="font-bold text-slate-800 text-right">
                      {asg.task_name || asg.custom_task_name || '-'}
                    </span>
                  </div>

                  {asg.department_name && asg.department_name !== '-' && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-500">Divisi / Bagian:</span>
                      <span className="font-medium text-slate-700">{asg.department_name}</span>
                    </div>
                  )}

                  {asg.sk_number && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-500">Nomor SK:</span>
                      <span className="font-mono text-slate-700">{asg.sk_number}</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-500">Periode Tugas:</span>
                    <span className="font-medium text-slate-700">
                      {new Date(asg.start_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}{' '}
                      — {asg.end_date ? new Date(asg.end_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : 'Sekarang'}
                    </span>
                  </div>

                  {asg.notes && (
                    <div className="mt-2 p-2 bg-slate-50 rounded-xl text-[11px] text-slate-600 italic">
                      "{asg.notes}"
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                {canEdit && (
                  <div className="flex items-center justify-end gap-2 mt-3 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenEditModal(asg)}
                      className="text-slate-600 hover:text-emerald-800"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                      onClick={() => setAssignmentToDelete(asg)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      Hapus
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: RIWAYAT PENUGASAN SELESAI / NONAKTIF */}
      {inactiveAssignments.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Penugasan Sebelumnya (Selesai / Nonaktif)</span>
          </h4>

          <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {inactiveAssignments.map((asg) => (
              <div key={asg.id} className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-xs">{asg.position_name}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 text-xs">{asg.unit_name}</span>
                    <Badge variant="slate" size="sm">{asg.status}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Tugas: {asg.task_name} | {asg.start_date} s/d {asg.end_date || 'Selesai'}
                  </p>
                </div>

                {canEdit && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(asg)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setAssignmentToDelete(asg)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT PENUGASAN */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAssignment ? 'Edit Penugasan Karyawan' : 'Tambah Penugasan Baru'}
        subtitle="Kelola tugas dan jabatan karyawan pada unit terkait"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveAssignment} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Unit Lembaga Pesantren"
              isRequired
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              error={formErrors.unitId}
              options={units.map(u => ({ value: u.id, label: u.name }))}
            />

            <Select
              label="Divisi / Bagian (Opsional)"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              options={[
                { value: '', label: '-- Pilih Divisi (Opsional) --' },
                ...filteredDepartments.map(d => ({ value: d.id, label: d.name }))
              ]}
            />

            <Select
              label="Jabatan"
              isRequired
              value={positionId}
              onChange={(e) => setPositionId(e.target.value)}
              error={formErrors.positionId}
              options={positions.map(p => ({ value: p.id, label: `${p.name} (${p.category})` }))}
            />

            <Select
              label="Tugas Pokok (Dari Master)"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              options={[
                { value: '', label: '-- Pilih Tugas Terdaftar --' },
                ...filteredTasks.map(t => ({ value: t.id, label: t.name }))
              ]}
            />

            <div className="sm:col-span-2">
              <Input
                label="Nama Tugas / Amanah Khusus (Jika tidak ada di daftar tugas)"
                value={customTaskName}
                onChange={(e) => setCustomTaskName(e.target.value)}
                placeholder="Contoh: Guru IPS Kelas VII & Wali Kelas VII-A"
              />
            </div>

            <Input
              label="Nomor SK Penugasan"
              value={skNumber}
              onChange={(e) => setSkNumber(e.target.value)}
              placeholder="SK-SMP/2024/015"
            />

            <Input
              label="Tanggal SK"
              type="date"
              value={skDate}
              onChange={(e) => setSkDate(e.target.value)}
            />

            <Input
              label="Tanggal Mulai Penugasan"
              isRequired
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              error={formErrors.startDate}
            />

            <Input
              label="Tanggal Selesai (Kosongkan jika aktif)"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              error={formErrors.endDate}
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

            <div className="flex items-center gap-3 pt-6 sm:col-span-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-600 border-slate-300"
                />
                <span className="text-xs font-bold text-slate-800">
                  Tetapkan Sebagai Penugasan Utama
                </span>
              </label>
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Keterangan / Catatan Penugasan"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan tanggung jawab, jam mengajar, dll."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
            >
              {editingAssignment ? 'Simpan Perubahan' : 'Tambah Penugasan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION */}
      <ConfirmationDialog
        isOpen={Boolean(assignmentToDelete)}
        onClose={() => setAssignmentToDelete(null)}
        onConfirm={handleDeleteAssignment}
        title="Hapus Penugasan?"
        message={`Apakah Anda yakin ingin menghapus penugasan "${assignmentToDelete?.position_name} - ${assignmentToDelete?.unit_name}"?`}
        confirmText="Hapus Penugasan"
        type="danger"
      />
    </div>
  );
};
