import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Edit2, Trash2 } from 'lucide-react';
import { Position, PositionCategory } from '../../types';
import { masterDataService } from '../../services/masterDataService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';

export const MasterPositions: React.FC = () => {
  const { canManageMaster } = useAuth();
  const { success, error } = useToast();

  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<Position | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PositionCategory>('Staff');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);

  const [posToDelete, setPosToDelete] = useState<Position | null>(null);

  const loadPositions = async () => {
    setIsLoading(true);
    try {
      const data = await masterDataService.getPositions();
      setPositions(data);
    } catch (err: any) {
      error('Gagal memuat jabatan', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPositions();
  }, []);

  const handleOpenAdd = () => {
    setEditingPos(null);
    setCode(`JAB-${Date.now().toString().slice(-4)}`);
    setName('');
    setCategory('Staff');
    setDescription('');
    setSortOrder(positions.length + 1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Position) => {
    setEditingPos(p);
    setCode(p.code);
    setName(p.name);
    setCategory(p.category);
    setDescription(p.description || '');
    setSortOrder(p.sort_order);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Nama jabatan wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      await masterDataService.savePosition({
        id: editingPos ? editingPos.id : undefined,
        code: code.trim(),
        name: name.trim(),
        category,
        description: description.trim() || undefined,
        sort_order: Number(sortOrder),
        is_active: true
      });

      success(editingPos ? 'Jabatan Diperbarui' : 'Jabatan Ditambahkan', `Jabatan "${name}" berhasil disimpan.`);
      setIsModalOpen(false);
      loadPositions();
    } catch (err: any) {
      error('Gagal Menyimpan Jabatan', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!posToDelete) return;
    try {
      await masterDataService.deletePosition(posToDelete.id);
      success('Jabatan Dihapus', `Jabatan "${posToDelete.name}" telah dihapus.`);
      setPosToDelete(null);
      loadPositions();
    } catch (err: any) {
      error('Gagal Menghapus Jabatan', err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-800" />
            <span>Master Data Jabatan</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pimpinan, Kepala Sekolah, Guru, Wali Kelas, Bendahara, Tata Usaha, dan struktur jabatan lainnya
          </p>
        </div>

        {canManageMaster && (
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
            Tambah Jabatan Baru
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 w-12 text-center">No</th>
              <th className="py-3 px-4">Kode</th>
              <th className="py-3 px-4">Nama Jabatan</th>
              <th className="py-3 px-4">Kategori Jabatan</th>
              <th className="py-3 px-4">Deskripsi</th>
              {canManageMaster && <th className="py-3 px-4 text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {positions.map((p, idx) => (
              <tr key={p.id} className="hover:bg-slate-50/80 transition">
                <td className="py-3.5 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-900">{p.code}</td>
                <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">{p.name}</td>
                <td className="py-3.5 px-4">
                  <Badge
                    variant={
                      p.category === 'Pimpinan'
                        ? 'gold'
                        : p.category === 'Pendidik'
                        ? 'emerald'
                        : p.category === 'Tenaga Kependidikan'
                        ? 'blue'
                        : 'slate'
                    }
                    size="sm"
                  >
                    {p.category}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-slate-500">{p.description || '-'}</td>
                {canManageMaster && (
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleOpenEdit(p)} className="p-1.5 text-slate-400 hover:text-amber-700 rounded-lg">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setPosToDelete(p)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg">
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPos ? 'Edit Jabatan' : 'Tambah Jabatan'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Kode Jabatan" isRequired value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
          <Input label="Nama Jabatan" isRequired value={name} onChange={(e) => setName(e.target.value)} placeholder="Guru / Wali Kelas / Bendahara" />
          <Select
            label="Kategori Jabatan"
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            options={[
              { value: 'Pimpinan', label: 'Pimpinan' },
              { value: 'Pendidik', label: 'Pendidik (Guru / Wali Kelas)' },
              { value: 'Tenaga Kependidikan', label: 'Tenaga Kependidikan (TU / Bendahara / Operator)' },
              { value: 'Staff', label: 'Staff' },
              { value: 'Operasional', label: 'Operasional (Security / OB / Driver)' }
            ]}
          />
          <Input label="Deskripsi (Opsional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>Simpan Jabatan</Button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={Boolean(posToDelete)}
        onClose={() => setPosToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Jabatan?"
        message={`Apakah Anda yakin ingin menghapus jabatan "${posToDelete?.name}"?`}
        type="danger"
      />
    </div>
  );
};
