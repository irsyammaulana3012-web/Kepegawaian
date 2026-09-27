import React, { useState, useEffect } from 'react';
import { History, Plus, Edit2, Trash2, Calendar, MapPin, Sparkles } from 'lucide-react';
import { EmployeePositionHistory } from '../../types';
import { educationService } from '../../services/educationService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';

interface EmployeeHistoryTimelineTabProps {
  employeeId: string;
}

export const EmployeeHistoryTimelineTab: React.FC<EmployeeHistoryTimelineTabProps> = ({ employeeId }) => {
  const { canEdit } = useAuth();
  const { success, error } = useToast();

  const [historyList, setHistoryList] = useState<EmployeePositionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EmployeePositionHistory | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [periodLabel, setPeriodLabel] = useState('');
  const [unitName, setUnitName] = useState('');
  const [positionName, setPositionName] = useState('');
  const [taskName, setTaskName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [skNumber, setSkNumber] = useState('');
  const [notes, setNotes] = useState('');

  const [itemToDelete, setItemToDelete] = useState<EmployeePositionHistory | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await educationService.getHistoryByEmployee(employeeId);
      setHistoryList(data);
    } catch (err: any) {
      error('Gagal memuat riwayat karir', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [employeeId]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setPeriodLabel('2025–Sekarang');
    setUnitName('');
    setPositionName('');
    setTaskName('');
    setStartDate('');
    setEndDate('');
    setSkNumber('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: EmployeePositionHistory) => {
    setEditingItem(item);
    setPeriodLabel(item.period_label);
    setUnitName(item.unit_name);
    setPositionName(item.position_name);
    setTaskName(item.task_name || '');
    setStartDate(item.start_date || '');
    setEndDate(item.end_date || '');
    setSkNumber(item.sk_number || '');
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodLabel.trim() || !unitName.trim() || !positionName.trim()) {
      error('Periode, Unit, dan Jabatan wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      await educationService.saveHistory({
        id: editingItem ? editingItem.id : undefined,
        employee_id: employeeId,
        period_label: periodLabel.trim(),
        unit_name: unitName.trim(),
        position_name: positionName.trim(),
        task_name: taskName.trim() || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        sk_number: skNumber.trim() || undefined,
        notes: notes.trim() || undefined
      });

      success(
        editingItem ? 'Riwayat Diperbarui' : 'Riwayat Ditambahkan',
        'Timeline karir dan penugasan karyawan berhasil disimpan.'
      );
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Gagal Menyimpan', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await educationService.deleteHistory(itemToDelete.id);
      success('Riwayat Dihapus', 'Data timeline berhasil dihapus.');
      setItemToDelete(null);
      loadData();
    } catch (err: any) {
      error('Gagal Menghapus', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Timeline Riwayat Penugasan & Karir</h3>
          <p className="text-xs text-slate-500">Perjalanan penugasan, jabatan lampau, dan mutasi internal pesantren</p>
        </div>
        {canEdit && (
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
            Tambah Riwayat
          </Button>
        )}
      </div>

      {historyList.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
          Belum ada rekaman riwayat timeline.
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
          {historyList.map((item, idx) => (
            <div key={item.id} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-emerald-800 border-4 border-white shadow text-white flex items-center justify-center text-[10px] font-bold">
                {idx + 1}
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-emerald-300 transition space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200 mb-1">
                      {item.period_label}
                    </span>
                    <h4 className="text-base font-bold text-slate-900">
                      {item.position_name} — <span className="text-emerald-800">{item.unit_name}</span>
                    </h4>
                  </div>

                  {canEdit && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-slate-400 hover:text-slate-700">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setItemToDelete(item)} className="p-1.5 text-slate-400 hover:text-rose-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-600 space-y-1 pt-1">
                  {item.task_name && <p><span className="text-slate-400">Amanah/Tugas:</span> <strong>{item.task_name}</strong></p>}
                  {item.sk_number && <p className="font-mono text-[11px]"><span className="text-slate-400">SK:</span> {item.sk_number}</p>}
                  {item.notes && <p className="italic text-slate-500 text-[11px] bg-slate-50 p-2 rounded-lg">"{item.notes}"</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Riwayat' : 'Tambah Riwayat Timeline'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Label Periode"
            isRequired
            value={periodLabel}
            onChange={(e) => setPeriodLabel(e.target.value)}
            placeholder="2022–2024 / 2025–Sekarang"
          />

          <Input
            label="Nama Unit Lembaga"
            isRequired
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
            placeholder="SMP IT Al-Qur'aniyyah / Yayasan"
          />

          <Input
            label="Jabatan"
            isRequired
            value={positionName}
            onChange={(e) => setPositionName(e.target.value)}
            placeholder="Guru / Wali Kelas / Koordinator"
          />

          <Input
            label="Tugas / Amanah"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Guru IPS Kelas VII & Wali Kelas VII-A"
          />

          <Input
            label="Nomor SK (Jika Ada)"
            value={skNumber}
            onChange={(e) => setSkNumber(e.target.value)}
            placeholder="SK-SMP/2022/001"
          />

          <Input
            label="Catatan Riwayat (Opsional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Keterangan penugasan khusus, pencapaian, dll."
          />

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>Simpan</Button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Riwayat?"
        message={`Hapus entri timeline "${itemToDelete?.position_name} (${itemToDelete?.period_label})"?`}
      />
    </div>
  );
};
