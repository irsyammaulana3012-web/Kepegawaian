import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Building2,
  BookOpen,
  User,
  ExternalLink,
  Award,
  Sparkles
} from 'lucide-react';
import { EmployeeEducation, Employee, Unit } from '../../types';
import { educationService } from '../../services/educationService';
import { employeeService } from '../../services/employeeService';
import { masterDataService } from '../../services/masterDataService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { EmptyState } from '../../components/common/EmptyState';

export const EducationList: React.FC = () => {
  const navigate = useNavigate();
  const { canEdit } = useAuth();
  const { success, error } = useToast();

  const [educationList, setEducationList] = useState<EmployeeEducation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EmployeeEducation | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [level, setLevel] = useState('S1');
  const [institutionName, setInstitutionName] = useState('');
  const [major, setMajor] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Delete Dialog
  const [itemToDelete, setItemToDelete] = useState<EmployeeEducation | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [eduData, empData, unitData] = await Promise.all([
        educationService.getAllEducation({
          search,
          level: selectedLevel,
          unit_id: selectedUnit
        }),
        employeeService.getEmployees({ limit: 1000 }),
        masterDataService.getUnits()
      ]);
      setEducationList(eduData);
      setEmployees(empData.data);
      setUnits(unitData);
    } catch (err: any) {
      error('Gagal memuat data pendidikan', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedLevel, selectedUnit]);

  // Handle open add modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setSelectedEmployeeId(employees[0]?.id || '');
    setLevel('S1');
    setInstitutionName('');
    setMajor('');
    setStartYear('');
    setEndYear('');
    setCertificateNumber('');
    setNotes('');
    setIsModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (item: EmployeeEducation) => {
    setEditingItem(item);
    setSelectedEmployeeId(item.employee_id);
    setLevel(item.level);
    setInstitutionName(item.institution_name);
    setMajor(item.major || '');
    setStartYear(item.start_year ? String(item.start_year) : '');
    setEndYear(item.end_year ? String(item.end_year) : '');
    setCertificateNumber(item.certificate_number || '');
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  // Handle save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      error('Pilih karyawan terlebih dahulu');
      return;
    }
    if (!institutionName.trim()) {
      error('Nama institusi/kampus wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      await educationService.saveEducation({
        id: editingItem ? editingItem.id : undefined,
        employee_id: selectedEmployeeId,
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
        `Riwayat pendidikan ${institutionName} berhasil disimpan.`
      );
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Gagal menyimpan pendidikan', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await educationService.deleteEducation(itemToDelete.id);
      success('Data Dihapus', 'Riwayat pendidikan berhasil dihapus.');
      setItemToDelete(null);
      loadData();
    } catch (err: any) {
      error('Gagal menghapus data', err.message);
    }
  };

  // Stats Calculation
  const totalS1 = educationList.filter(e => e.level === 'S1').length;
  const totalS2S3 = educationList.filter(e => e.level === 'S2' || e.level === 'S3').length;
  const totalPesantren = educationList.filter(e => e.level === 'Pondok Pesantren' || e.level?.toLowerCase().includes('pesantren')).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-emerald-800" />
              <span>Data Riwayat Pendidikan Karyawan</span>
            </h2>
            <Badge variant="emerald" size="sm">
              {educationList.length} Riwayat
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Direktori kualifikasi akademik, ijazah, dan latar belakang pendidikan seluruh SDM Yayasan Al-Qur'aniyyah
          </p>
        </div>

        {canEdit && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
            className="shadow-sm"
          >
            Tambah Pendidikan
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Kualifikasi</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{educationList.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Tercatat di Database</p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-800 uppercase">Sarjana (S1)</span>
          <p className="text-2xl font-black text-emerald-950 mt-1">{totalS1}</p>
          <p className="text-[10px] text-emerald-600/80 mt-0.5">Lulusan Program Strata 1</p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-sm">
          <span className="text-[11px] font-bold text-amber-800 uppercase">Magister & Doktor (S2/S3)</span>
          <p className="text-2xl font-black text-amber-950 mt-1">{totalS2S3}</p>
          <p className="text-[10px] text-amber-600/80 mt-0.5">Pendidikan Pascasarjana</p>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 shadow-sm">
          <span className="text-[11px] font-bold text-purple-800 uppercase">Pondok Pesantren</span>
          <p className="text-2xl font-black text-purple-950 mt-1">{totalPesantren}</p>
          <p className="text-[10px] text-purple-600/80 mt-0.5">Alumni Pesantren & Ma'had</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card>
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama karyawan, kampus, jurusan, NIK..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-emerald-600 focus:border-emerald-600 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:ring-emerald-600 focus:border-emerald-600 font-medium"
            >
              <option value="all">Semua Jenjang</option>
              <option value="S3">S3 (Doktor)</option>
              <option value="S2">S2 (Magister)</option>
              <option value="S1">S1 (Sarjana)</option>
              <option value="D3">D3 (Diploma)</option>
              <option value="Pondok Pesantren">Pondok Pesantren</option>
              <option value="SMA">SMA / MA / SMK</option>
              <option value="SMP">SMP / MTs</option>
              <option value="SD">SD / MI</option>
            </select>

            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:ring-emerald-600 focus:border-emerald-600 font-medium"
            >
              <option value="all">Semua Unit Penugasan</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card>
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500">Memuat data pendidikan...</div>
        ) : educationList.length === 0 ? (
          <EmptyState
            title="Tidak Ada Data Pendidikan"
            description="Belum ada riwayat pendidikan yang sesuai dengan kriteria filter."
            actionText={canEdit ? 'Tambah Riwayat Pendidikan' : undefined}
            onAction={canEdit ? handleOpenAdd : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600 uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-10">No</th>
                  <th className="py-3 px-4">Karyawan & Unit</th>
                  <th className="py-3 px-4">Jenjang</th>
                  <th className="py-3 px-4">Institusi / Universitas</th>
                  <th className="py-3 px-4">Jurusan / Program Studi</th>
                  <th className="py-3 px-4">Tahun Lulus</th>
                  <th className="py-3 px-4">No. Ijazah</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {educationList.map((edu, idx) => (
                  <tr key={edu.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <div
                        onClick={() => navigate(`/employees/${edu.employee_id}`)}
                        className="font-bold text-emerald-950 hover:text-emerald-700 cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{edu.employee_name}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {edu.employee_number || edu.employee_nik}
                      </div>
                      {edu.units_list && edu.units_list.length > 0 && (
                        <div className="text-[10px] text-emerald-800 font-medium mt-0.5">
                          {edu.units_list.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          edu.level === 'S2' || edu.level === 'S3'
                            ? 'gold'
                            : edu.level === 'S1'
                            ? 'emerald'
                            : edu.level === 'Pondok Pesantren'
                            ? 'purple'
                            : 'slate'
                        }
                        size="sm"
                      >
                        {edu.level}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {edu.institution_name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {edu.major || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      {edu.end_year ? (
                        <span className="font-mono font-bold text-slate-800">{edu.end_year}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {edu.certificate_number || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {canEdit && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(edu)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                              title="Edit Data"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setItemToDelete(edu)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Hapus"
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
      </Card>

      {/* MODAL TAMBAH / EDIT PENDIDIKAN */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Riwayat Pendidikan' : 'Tambah Riwayat Pendidikan'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Karyawan <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              disabled={Boolean(editingItem)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:ring-emerald-600 focus:border-emerald-600 disabled:bg-slate-100"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.employee_number || emp.nik})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Jenjang Pendidikan"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              options={[
                { value: 'SD', label: 'SD / MI' },
                { value: 'SMP', label: 'SMP / MTs' },
                { value: 'SMA', label: 'SMA / MA / SMK' },
                { value: 'Pondok Pesantren', label: 'Pondok Pesantren' },
                { value: 'D3', label: 'D3 (Diploma)' },
                { value: 'S1', label: 'S1 (Sarjana)' },
                { value: 'S2', label: 'S2 (Magister)' },
                { value: 'S3', label: 'S3 (Doktor)' },
                { value: 'Lainnya', label: 'Lainnya' }
              ]}
              required
            />

            <Input
              label="Nama Institusi / Universitas"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder="Contoh: UIN Syarif Hidayatullah"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Jurusan / Program Studi"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="Contoh: Pendidikan Agama Islam"
            />

            <Input
              label="Nomor Ijazah"
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
              placeholder="Contoh: IJZ-12345678"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Tahun Masuk"
              type="number"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              placeholder="Contoh: 2015"
            />

            <Input
              label="Tahun Lulus"
              type="number"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              placeholder="Contoh: 2019"
            />
          </div>

          <Input
            label="Catatan / Keterangan Tambahan"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Gelar akademik, predikat cumlaude, dll."
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit" isLoading={isSaving}>
              Simpan Pendidikan
            </Button>
          </div>
        </form>
      </Modal>

      {/* DIALOG KONFIRMASI HAPUS */}
      <ConfirmationDialog
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Riwayat Pendidikan?"
        message={`Apakah Anda yakin ingin menghapus riwayat pendidikan ${itemToDelete?.institution_name} (${itemToDelete?.level}) milik ${itemToDelete?.employee_name}?`}
        confirmText="Ya, Hapus"
        type="danger"
      />
    </div>
  );
};
