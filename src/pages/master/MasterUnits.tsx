import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Unit } from '../../types';
import { masterDataService } from '../../services/masterDataService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { Skeleton } from '../../components/ui/Skeleton';

export const MasterUnits: React.FC = () => {
  const { canManageMaster } = useAuth();
  const { success, error } = useToast();

  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);

  const loadUnits = async () => {
    setIsLoading(true);
    try {
      const data = await masterDataService.getUnits();
      setUnits(data);
    } catch (err: any) {
      error('Gagal memuat unit', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  const handleOpenAdd = () => {
    setEditingUnit(null);
    setCode(`UNIT-${Date.now().toString().slice(-4)}`);
    setName('');
    setDescription('');
    setSortOrder(units.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: Unit) => {
    setEditingUnit(u);
    setCode(u.code);
    setName(u.name);
    setDescription(u.description || '');
    setSortOrder(u.sort_order);
    setIsActive(u.is_active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Nama unit wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      await masterDataService.saveUnit({
        id: editingUnit ? editingUnit.id : undefined,
        code: code.trim(),
        name: name.trim(),
        description: description.trim() || undefined,
        sort_order: Number(sortOrder),
        is_active: isActive
      });

      success(
        editingUnit ? 'Unit Diperbarui' : 'Unit Baru Ditambahkan',
        `Unit "${name}" berhasil disimpan.`
      );
      setIsModalOpen(false);
      loadUnits();
    } catch (err: any) {
      error('Gagal Menyimpan Unit', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!unitToDelete) return;
    try {
      await masterDataService.deleteUnit(unitToDelete.id);
      success('Unit Dihapus', `Unit "${unitToDelete.name}" telah dihapus.`);
      setUnitToDelete(null);
      loadUnits();
    } catch (err: any) {
      error('Gagal Menghapus Unit', err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-800" />
            <span>Master Data Unit Lembaga</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar seluruh unit pendidikan, madrasah, lembaga Al-Qur'an, dan sekretariat yayasan
          </p>
        </div>

        {canManageMaster && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
          >
            Tambah Unit Baru
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} height={50} />)}
          </div>
        ) : (
          <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Urutan</th>
                <th className="py-3 px-4">Kode Unit</th>
                <th className="py-3 px-4">Nama Unit Lembaga</th>
                <th className="py-3 px-4">Keterangan / Deskripsi</th>
                <th className="py-3 px-4 text-center">Status</th>
                {canManageMaster && <th className="py-3 px-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {units.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 text-center font-bold text-slate-400">{u.sort_order}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-900">{u.code}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">{u.name}</td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{u.description || '-'}</td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge variant={u.is_active ? 'emerald' : 'slate'} size="sm">
                      {u.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  {canManageMaster && (
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-slate-400 hover:text-amber-700 rounded-lg hover:bg-amber-50"
                          title="Edit Unit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setUnitToDelete(u)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Hapus Unit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUnit ? 'Edit Unit Lembaga' : 'Tambah Unit Baru'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Kode Unit"
            isRequired
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="SMPIT / SMAIT / YAS"
          />

          <Input
            label="Nama Unit Lembaga"
            isRequired
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="SMP IT Al-Qur'aniyyah"
          />

          <Input
            label="Deskripsi / Keterangan"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Unit Sekolah Menengah Pertama Islam Terpadu"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Urutan Tampil"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-600 border-slate-300"
                />
                <span className="text-xs font-bold text-slate-800">Unit Aktif</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>Simpan Unit</Button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={Boolean(unitToDelete)}
        onClose={() => setUnitToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Unit Lembaga?"
        message={`Apakah Anda yakin ingin menghapus unit "${unitToDelete?.name}"?`}
        confirmText="Hapus Unit"
        type="danger"
      />
    </div>
  );
};
