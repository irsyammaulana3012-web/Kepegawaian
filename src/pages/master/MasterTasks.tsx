import React, { useState, useEffect } from 'react';
import { ListTodo, Plus, Edit2, Trash2 } from 'lucide-react';
import { Task, Position } from '../../types';
import { masterDataService } from '../../services/masterDataService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';

export const MasterTasks: React.FC = () => {
  const { canManageMaster } = useAuth();
  const { success, error } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [positionId, setPositionId] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tList, pList] = await Promise.all([
        masterDataService.getTasks(),
        masterDataService.getPositions()
      ]);
      setTasks(tList);
      setPositions(pList);
    } catch (err: any) {
      error('Gagal memuat tugas', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingTask(null);
    setPositionId('');
    setCode(`TUG-${Date.now().toString().slice(-4)}`);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Task) => {
    setEditingTask(t);
    setPositionId(t.position_id || '');
    setCode(t.code || '');
    setName(t.name);
    setDescription(t.description || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Nama tugas wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      await masterDataService.saveTask({
        id: editingTask ? editingTask.id : undefined,
        position_id: positionId || null,
        code: code.trim() || undefined,
        name: name.trim(),
        description: description.trim() || undefined,
        is_active: true
      });

      success(editingTask ? 'Tugas Diperbarui' : 'Tugas Ditambahkan', `Tugas "${name}" berhasil disimpan.`);
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Gagal Menyimpan Tugas', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    try {
      await masterDataService.deleteTask(taskToDelete.id);
      success('Tugas Dihapus', `Tugas "${taskToDelete.name}" telah dihapus.`);
      setTaskToDelete(null);
      loadData();
    } catch (err: any) {
      error('Gagal Menghapus', err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-emerald-800" />
            <span>Master Tugas Pokok & Fungsi (Tupoksi)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar tugas rinci (Guru Mapel, Wali Kelas VII, Pembina OSIS, Koordinator Rapim, dll.)
          </p>
        </div>

        {canManageMaster && (
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
            Tambah Tugas Baru
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Kode</th>
              <th className="py-3 px-4">Nama Tugas / Tupoksi</th>
              <th className="py-3 px-4">Terkait Jabatan</th>
              <th className="py-3 px-4">Deskripsi Tugas</th>
              {canManageMaster && <th className="py-3 px-4 text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/80 transition">
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-900">{t.code || '-'}</td>
                <td className="py-3.5 px-4 font-extrabold text-slate-900">{t.name}</td>
                <td className="py-3.5 px-4 font-semibold text-emerald-800">{t.position_name || 'Semua Jabatan'}</td>
                <td className="py-3.5 px-4 text-slate-500 max-w-sm truncate">{t.description || '-'}</td>
                {canManageMaster && (
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleOpenEdit(t)} className="p-1.5 text-slate-400 hover:text-amber-700 rounded-lg">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setTaskToDelete(t)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTask ? 'Edit Tugas' : 'Tambah Tugas Baru'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Select
            label="Kategori / Terkait Jabatan (Opsional)"
            value={positionId}
            onChange={(e) => setPositionId(e.target.value)}
            options={[
              { value: '', label: '-- Terbuka Untuk Semua Jabatan --' },
              ...positions.map(p => ({ value: p.id, label: p.name }))
            ]}
          />
          <Input label="Kode Tugas" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="G-IPS / WL-7A" />
          <Input label="Nama Tugas / Amanah" isRequired value={name} onChange={(e) => setName(e.target.value)} placeholder="Guru IPS Kelas VII / Koordinator Rapim" />
          <Input label="Deskripsi / Ruang Lingkup" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>Simpan Tugas</Button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Tugas?"
        message={`Apakah Anda yakin ingin menghapus tugas "${taskToDelete?.name}"?`}
        type="danger"
      />
    </div>
  );
};
