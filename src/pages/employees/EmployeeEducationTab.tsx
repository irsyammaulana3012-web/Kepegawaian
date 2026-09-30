import { Employee, EmployeeEducation } from '../../types';
import { educationService } from '../../services/educationService';
import { employeeService } from '../../services/employeeService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';

interface EmployeeEducationTabProps {
  employeeId: string;
  employee?: Employee | null;
}

export const EmployeeEducationTab: React.FC<EmployeeEducationTabProps> = ({ employeeId, employee }) => {
  const { canEdit } = useAuth();
  const { success, error } = useToast();

  const [educationList, setEducationList] = useState<EmployeeEducation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EmployeeEducation | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [level, setLevel] = useState('S1');
  const [institutionName, setInstitutionName] = useState('');
  const [major, setMajor] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [notes, setNotes] = useState('');

  const [itemToDelete, setItemToDelete] = useState<EmployeeEducation | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await educationService.getEducationByEmployee(employeeId);
      setEducationList(data);
    } catch (err: any) {
      error('Gagal memuat riwayat pendidikan', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [employeeId]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setLevel('S1');
    setInstitutionName('');
    setMajor('');
    setStartYear('');
    setEndYear('');
    setCertificateNumber('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: EmployeeEducation) => {
    setEditingItem(item);
    setLevel(item.level);
    setInstitutionName(item.institution_name);
    setMajor(item.major || '');
    setStartYear(item.start_year ? String(item.start_year) : '');
    setEndYear(item.end_year ? String(item.end_year) : '');
    setCertificateNumber(item.certificate_number || '');
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionName.trim()) {
      error('Nama institusi/kampus wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      await educationService.saveEducation({
        id: editingItem ? editingItem.id : undefined,
        employee_id: employeeId,
        level,
        institution_name: institutionName.trim(),
        major: major.trim() || undefined,
        start_year: startYear ? Number(startYear) : undefined,
        end_year: endYear ? Number(endYear) : undefined,
        certificate_number: certificateNumber.trim() || undefined,
        notes: notes.trim() || undefined
      });

      success(
        editingItem ? 'Pendidikan Diperbarui' : 'Pendidikan Ditambahkan',
        'Data riwayat pendidikan berhasil disimpan.'
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
      await educationService.deleteEducation(itemToDelete.id);
      success('Data Dihapus', 'Riwayat pendidikan berhasil dihapus.');
      setItemToDelete(null);
      loadData();
    } catch (err: any) {
      error('Gagal Menghapus', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Riwayat Pendidikan Formal Breakdown (SD - S3) */}
      {employee?.formal_education && employee.formal_education.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <GraduationCap className="w-5 h-5 text-emerald-800" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Riwayat Pendidikan Formal (SD - S3)</h4>
              <p className="text-xs text-slate-500">Data jenjang sekolah dasar hingga perguruan tinggi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {employee.formal_education.map((f, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[11px] uppercase px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded border border-emerald-200">
                    {f.level}
                  </span>
                  {f.year && (
                    <span className="text-[11px] font-mono text-slate-500 font-bold">Lulus: {f.year}</span>
                  )}
                </div>
                <p className="font-bold text-slate-800 text-xs mt-1.5">{f.institution || '-'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Riwayat Pendidikan Nonformal / Pesantren */}
      {employee?.nonformal_education && employee.nonformal_education.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <BookOpen className="w-5 h-5 text-amber-700" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Riwayat Pendidikan / Pelatihan Nonformal & Pesantren</h4>
              <p className="text-xs text-slate-500">Pondok pesantren, kursus tahsin/tahfidz, sertifikasi, diklat</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {employee.nonformal_education.map((nf, i) => (
              <div key={i} className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-slate-900 text-xs">{nf.name}</h5>
                  {nf.year && (
                    <span className="text-[11px] font-mono text-amber-900 font-bold bg-amber-100 px-2 py-0.5 rounded">
                      {nf.year}
                    </span>
                  )}
                </div>
                {nf.institution && (
                  <p className="text-xs text-slate-700 font-medium">Instansi: <strong>{nf.institution}</strong></p>
                )}
                {nf.notes && (
                  <p className="text-[11px] text-slate-500 italic">"{nf.notes}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Daftar Berkas & Dokumen Ijazah */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Dokumen / Ijazah Pendidikan Terdaftar</h3>
          <p className="text-xs text-slate-500">Ijazah resmi, nomor seri ijazah, dan transkrip kelulusan</p>
        </div>
        {canEdit && (
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
            Tambah Pendidikan
          </Button>
        )}
      </div>

      {educationList.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
          Belum ada arsip ijazah spesifik yang diinput.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {educationList.map((item) => (
            <div key={item.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-emerald-800 uppercase px-2 py-0.5 bg-emerald-50 rounded border border-emerald-100">
                      {item.level}
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm mt-1">{item.institution_name}</h5>
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
                {item.major && <p><span className="text-slate-400">Jurusan/Program:</span> <strong>{item.major}</strong></p>}
                {(item.start_year || item.end_year) && (
                  <p><span className="text-slate-400">Tahun:</span> {item.start_year || '?'} - {item.end_year || 'Sekarang'}</p>
                )}
                {item.certificate_number && (
                  <p className="font-mono text-[11px]"><span className="text-slate-400">No. Ijazah:</span> {item.certificate_number}</p>
                )}
                {item.notes && <p className="italic text-slate-500 text-[11px]">"{item.notes}"</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Pendidikan' : 'Tambah Pendidikan'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Select
            label="Jenjang Pendidikan"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            options={[
              { value: 'SD / MI', label: 'SD / MI' },
              { value: 'SMP / MTs', label: 'SMP / MTs' },
              { value: 'SMA / SMK / MA', label: 'SMA / SMK / MA' },
              { value: 'Pondok Pesantren / KMI', label: 'Pondok Pesantren / KMI' },
              { value: 'D3', label: 'Diploma 3 (D3)' },
              { value: 'S1', label: 'Sarjana (S1)' },
              { value: 'S2', label: 'Magister (S2)' },
              { value: 'S3', label: 'Doktor (S3)' }
            ]}
          />

          <Input
            label="Nama Institusi / Universitas / Pesantren"
            isRequired
            value={institutionName}
            onChange={(e) => setInstitutionName(e.target.value)}
            placeholder="Universitas Negeri Jakarta / Ponpes Gontor"
          />

          <Input
            label="Jurusan / Program Studi"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            placeholder="Pendidikan Agama Islam / Manajemen"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tahun Masuk"
              type="number"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              placeholder="2010"
            />
            <Input
              label="Tahun Kelulusan"
              type="number"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              placeholder="2014"
            />
          </div>

          <Input
            label="Nomor Ijazah"
            value={certificateNumber}
            onChange={(e) => setCertificateNumber(e.target.value)}
            placeholder="UNJ-S1-2014-XXXX"
          />

          <Input
            label="Keterangan / Predikat (Opsional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Cum Laude / Hafidz 30 Juz"
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
        title="Hapus Riwayat Pendidikan?"
        message={`Hapus data pendidikan "${itemToDelete?.institution_name}"?`}
      />
    </div>
  );
};
