import React, { useState, useEffect } from 'react';
import { Network, Plus, Edit2, Trash2 } from 'lucide-react';
import { Department, Unit } from '../../types';
import { masterDataService } from '../../services/masterDataService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';

export const MasterDepartments: React.FC = () => {
  const { canManageMaster } = useAuth();
  const { success, error } = useToast();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [unitId, setUnitId] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [deps, uList] = await Promise.all([
        masterDataService.getDepartments(),
        masterDataService.getUnits()
      ]);
      setDepartments(deps);
      setUnits(uList);
    } catch (err: any) {
      error('Gagal memuat divisi', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setUnitId(units[0]?.id || '');
    setCode(`DIV-${Date.now().toString().slice(-4)}`);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (d: Department) => {
    setEditingDept(d);
    setUnitId(d.unit_id);
    setCode(d.code);
    setName(d.name);
    setDescription(d.description || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !unitId) {
      error('Unit dan Nama divisi wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      await masterDataService.saveDepartment({
        id: editingDept ? editingDept.id : undefined,
        unit_id: unitId,
        code: code.trim(),
        name: name.trim(),
        description: description.trim() || undefined,
        is_active: true
      });

      success(editingDept ? 'Divisi Diperbarui' : 'Divisi Ditambahkan', `Divisi "${name}" berhasil disimpan.`);
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Gagal Menyimpan Divisi', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deptToDelete) return;
    try {
      await masterDataService.deleteDepartment(deptToDelete.id);
      success('Divisi Dihapus', `Divisi "${deptToDelete.name}" telah dihapus.`);
      setDeptToDelete(null);
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
            <Network className="w-6 h-6 text-emerald-800" />
            <span>Master Divisi & Bagian</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Struktur divisi dan bidang kerja pada masing-masing unit</p>
        </div>

        {canManageMaster && (
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
            Tambah Divisi Baru
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Kode</th>
              <th className="py-3 px-4">Nama Divisi / Bagian</th>
              <th className="py-3 px-4">Unit Terkait</th>
              <th className="py-3 px-4">Keterangan</th>
              {canManageMaster && <th className="py-3 px-4 text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {departments.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50/80 transition">
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-900">{d.code}</td>
                <td className="py-3.5 px-4 font-bold text-slate-900">{d.name}</td>
                <td className="py-3.5 px-4 font-semibold text-emerald-800">{d.unit_name}</td>
                <td className="py-3.5 px-4 text-slate-500">{d.description || '-'}</td>
                {canManageMaster && (
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleOpenEdit(d)} className="p-1.5 text-slate-400 hover:text-amber-700 rounded-lg">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeptToDelete(d)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg">
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDept ? 'Edit Divisi' : 'Tambah Divisi'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Select
            label="Unit Lembaga"
            isRequired
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            options={units.map(u => ({ value: u.id, label: u.name }))}
          />
          <Input label="Kode Divisi" isRequired value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
          <Input label="Nama Divisi / Bagian" isRequired value={name} onChange={(e) => setName(e.target.value)} placeholder="Bidang Kurikulum / Kesiswaan" />
          <Input label="Deskripsi (Opsional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>Simpan</Button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={Boolean(deptToDelete)}
        onClose={() => setDeptToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Divisi?"
        message={`Hapus divisi "${deptToDelete?.name}"?`}
      />
    </div>
  );
};
