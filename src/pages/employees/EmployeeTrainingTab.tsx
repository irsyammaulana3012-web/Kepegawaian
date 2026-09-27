import React, { useState, useEffect } from 'react';
import { Award, Plus, Edit2, Trash2, Calendar, MapPin, Clock } from 'lucide-react';
import { EmployeeTraining } from '../../types';
import { trainingService } from '../../services/trainingService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';

interface EmployeeTrainingTabProps {
  employeeId: string;
}

export const EmployeeTrainingTab: React.FC<EmployeeTrainingTabProps> = ({ employeeId }) => {
  const { canEdit } = useAuth();
  const { success, error } = useToast();

  const [trainingList, setTrainingList] = useState<EmployeeTraining[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EmployeeTraining | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const [itemToDelete, setItemToDelete] = useState<EmployeeTraining | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await trainingService.getTrainingByEmployee(employeeId);
      setTrainingList(data);
    } catch (err: any) {
      error('Gagal memuat data pelatihan', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [employeeId]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setOrganizer('');
    setDate(new Date().toISOString().split('T')[0]);
    setLocation('');
    setDurationHours('');
    setCertificateNumber('');
    setExpiryDate('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: EmployeeTraining) => {
    setEditingItem(item);
    setName(item.name);
    setOrganizer(item.organizer);
    setDate(item.date);
    setLocation(item.location || '');
    setDurationHours(item.duration_hours ? String(item.duration_hours) : '');
    setCertificateNumber(item.certificate_number || '');
    setExpiryDate(item.expiry_date || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !organizer.trim() || !date) {
      error('Nama pelatihan, penyelenggara, dan tanggal wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      await trainingService.saveTraining({
        id: editingItem ? editingItem.id : undefined,
        employee_id: employeeId,
        name: name.trim(),
        organizer: organizer.trim(),
        date,
        location: location.trim() || undefined,
        duration_hours: durationHours ? Number(durationHours) : undefined,
        certificate_number: certificateNumber.trim() || undefined,
        expiry_date: expiryDate || undefined
      });

      success(
        editingItem ? 'Pelatihan Diperbarui' : 'Pelatihan Ditambahkan',
        'Data pelatihan & sertifikasi berhasil disimpan.'
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
      await trainingService.deleteTraining(itemToDelete.id);
      success('Data Dihapus', 'Pelatihan telah dihapus.');
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
          <h3 className="text-sm font-bold text-slate-900">Pelatihan, Diklat & Sertifikasi Profesi</h3>
          <p className="text-xs text-slate-500">Pengembangan kompetensi guru dan tenaga kependidikan</p>
        </div>
        {canEdit && (
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
            Tambah Pelatihan
          </Button>
        )}
      </div>

      {trainingList.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
          Belum ada riwayat pelatihan atau sertifikasi yang tercatat.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trainingList.map((item) => (
            <div key={item.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{item.name}</h5>
                    <p className="text-xs font-semibold text-emerald-800">{item.organizer}</p>
                  </div>
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

              <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-4 text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                  </span>
                  {item.duration_hours && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {item.duration_hours} Jam (JP)
                    </span>
                  )}
                </div>
                {item.location && <p><span className="text-slate-400">Lokasi:</span> {item.location}</p>}
                {item.certificate_number && (
                  <p className="font-mono text-[11px]"><span className="text-slate-400">No. Sertifikat:</span> {item.certificate_number}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Pelatihan' : 'Tambah Pelatihan & Sertifikasi'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Nama Pelatihan / Workshop / Bimtek"
            isRequired
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Pelatihan Kurikulum Merdeka & Modul Ajar"
          />

          <Input
            label="Lembaga Penyelenggara"
            isRequired
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
            placeholder="Balai Guru Penggerak / JSIT Indonesia"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tanggal Pelaksanaan"
              isRequired
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              label="Durasi (Jam Pelajaran)"
              type="number"
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              placeholder="32"
            />
          </div>

          <Input
            label="Lokasi Kegiatan"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Hotel Salak Bogor / Daring Zoom"
          />

          <Input
            label="Nomor Sertifikat (Jika Ada)"
            value={certificateNumber}
            onChange={(e) => setCertificateNumber(e.target.value)}
            placeholder="BGP-JBR/2024/0991"
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
        title="Hapus Pelatihan?"
        message={`Hapus data pelatihan "${itemToDelete?.name}"?`}
      />
    </div>
  );
};
