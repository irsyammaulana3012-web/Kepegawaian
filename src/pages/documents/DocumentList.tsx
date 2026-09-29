import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderLock,
  UploadCloud,
  Search,
  Filter,
  FileText,
  Download,
  Trash2,
  ExternalLink,
  Eye,
  FileCheck,
  Plus,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { EmployeeDocument, Employee, Unit } from '../../types';
import { documentService } from '../../services/documentService';
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

export const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const { canEdit } = useAuth();
  const { success, error } = useToast();

  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState('all');

  // Upload Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [documentType, setDocumentType] = useState('KTP');
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Delete Dialog
  const [docToDelete, setDocToDelete] = useState<EmployeeDocument | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [docData, empData, unitData] = await Promise.all([
        documentService.getAllDocuments({
          search,
          document_type: selectedType,
          unit_id: selectedUnit
        }),
        employeeService.getEmployees({ limit: 1000 }),
        masterDataService.getUnits()
      ]);
      setDocuments(docData);
      setEmployees(empData.data);
      setUnits(unitData);
    } catch (err: any) {
      error('Gagal memuat dokumen', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedType, selectedUnit]);

  const handleOpenUpload = () => {
    setSelectedEmployeeId(employees[0]?.id || '');
    setDocumentType('KTP');
    setTitle('');
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      error('Pilih karyawan terlebih dahulu');
      return;
    }
    if (!selectedFile) {
      error('Pilih berkas dokumen yang akan diunggah');
      return;
    }

    setIsUploading(true);
    try {
      await documentService.uploadDocument(
        selectedEmployeeId,
        documentType,
        title || selectedFile.name,
        selectedFile
      );

      success('Dokumen Berhasil Diunggah', `Berkas ${selectedFile.name} tersimpan.`);
      setIsModalOpen(false);
      setSelectedFile(null);
      setTitle('');
      loadData();
    } catch (err: any) {
      error('Gagal Mengunggah Dokumen', err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!docToDelete) return;
    try {
      await documentService.deleteDocument(docToDelete.id);
      success('Dokumen Dihapus', `Berkas ${docToDelete.title} telah dihapus.`);
      setDocToDelete(null);
      loadData();
    } catch (err: any) {
      error('Gagal Menghapus Dokumen', err.message);
    }
  };

  // Stats calculation
  const countKtpKk = documents.filter(d => d.document_type === 'KTP' || d.document_type === 'KK').length;
  const countIjazah = documents.filter(d => d.document_type === 'Ijazah' || d.document_type === 'Sertifikat').length;
  const countSK = documents.filter(d => d.document_type.toLowerCase().includes('sk') || d.document_type.toLowerCase().includes('kontrak')).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FolderLock className="w-6 h-6 text-emerald-800" />
              <span>Repositori Dokumen & Berkas Karyawan</span>
            </h2>
            <Badge variant="emerald" size="sm">
              {documents.length} Berkas
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pusat penyimpanan digital berkas identitas (KTP, KK), SK Pengangkatan, SK Penugasan, Ijazah, dan Sertifikat
          </p>
        </div>

        {canEdit && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenUpload}
            className="shadow-sm"
          >
            Unggah Dokumen Baru
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Dokumen</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{documents.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Tersimpan di Cloud/Lokal</p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-800 uppercase">KTP & Kartu Keluarga</span>
          <p className="text-2xl font-black text-emerald-950 mt-1">{countKtpKk}</p>
          <p className="text-[10px] text-emerald-600/80 mt-0.5">Dokumen Kependudukan</p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-sm">
          <span className="text-[11px] font-bold text-amber-800 uppercase">Ijazah & Sertifikat</span>
          <p className="text-2xl font-black text-amber-950 mt-1">{countIjazah}</p>
          <p className="text-[10px] text-amber-600/80 mt-0.5">Akademik & Pelatihan</p>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 shadow-sm">
          <span className="text-[11px] font-bold text-purple-800 uppercase">SK & Kontrak Kerja</span>
          <p className="text-2xl font-black text-purple-950 mt-1">{countSK}</p>
          <p className="text-[10px] text-purple-600/80 mt-0.5">Legalitas & Penugasan</p>
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
              placeholder="Cari nama karyawan, judul berkas, nama file, NIK..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-emerald-600 focus:border-emerald-600 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:ring-emerald-600 focus:border-emerald-600 font-medium"
            >
              <option value="all">Semua Tipe Dokumen</option>
              <option value="KTP">KTP (Kartu Tanda Penduduk)</option>
              <option value="KK">Kartu Keluarga (KK)</option>
              <option value="Ijazah">Ijazah</option>
              <option value="Transkrip">Transkrip Nilai</option>
              <option value="SK Pengangkatan">SK Pengangkatan</option>
              <option value="SK Penugasan">SK Penugasan</option>
              <option value="Kontrak Kerja">Kontrak Kerja</option>
              <option value="Sertifikat">Sertifikat / Pelatihan</option>
              <option value="NPWP">NPWP</option>
              <option value="BPJS">BPJS Kesehatan / Ketenagakerjaan</option>
              <option value="Lainnya">Dokumen Lainnya</option>
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
          <div className="py-12 text-center text-xs text-slate-500">Memuat data dokumen...</div>
        ) : documents.length === 0 ? (
          <EmptyState
            title="Tidak Ada Dokumen Ditemukan"
            description="Belum ada berkas dokumen yang diunggah sesuai kriteria filter."
            actionText={canEdit ? 'Unggah Dokumen Baru' : undefined}
            onAction={canEdit ? handleOpenUpload : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600 uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-10">No</th>
                  <th className="py-3 px-4">Karyawan & Unit</th>
                  <th className="py-3 px-4">Tipe Dokumen</th>
                  <th className="py-3 px-4">Judul Dokumen / Nama File</th>
                  <th className="py-3 px-4">Ukuran</th>
                  <th className="py-3 px-4">Tanggal Unggah</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc, idx) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <div
                        onClick={() => navigate(`/employees/${doc.employee_id}`)}
                        className="font-bold text-emerald-950 hover:text-emerald-700 cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{doc.employee_name}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {doc.employee_number || doc.employee_nik}
                      </div>
                      {doc.units_list && doc.units_list.length > 0 && (
                        <div className="text-[10px] text-emerald-800 font-medium mt-0.5">
                          {doc.units_list.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          doc.document_type === 'KTP' || doc.document_type === 'KK'
                            ? 'blue'
                            : doc.document_type.toLowerCase().includes('sk')
                            ? 'gold'
                            : doc.document_type === 'Ijazah'
                            ? 'emerald'
                            : 'slate'
                        }
                        size="sm"
                      >
                        {doc.document_type}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">{doc.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{doc.file_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] font-mono text-slate-600">
                      {documentService.formatBytes(doc.file_size)}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-600">
                      {doc.created_at ? new Date(doc.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          download={doc.file_name}
                          className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition"
                          title="Lihat / Unduh Dokumen"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        {canEdit && (
                          <button
                            onClick={() => setDocToDelete(doc)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* MODAL UNGGAH DOKUMEN */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Unggah Dokumen Karyawan Baru"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Karyawan <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:ring-emerald-600 focus:border-emerald-600"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.employee_number || emp.nik})
                </option>
              ))}
            </select>
          </div>

          <Select
            label="Tipe / Jenis Dokumen"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            options={[
              { value: 'KTP', label: 'KTP (Kartu Tanda Penduduk)' },
              { value: 'KK', label: 'Kartu Keluarga (KK)' },
              { value: 'Ijazah', label: 'Ijazah Pendidikan' },
              { value: 'Transkrip', label: 'Transkrip Nilai' },
              { value: 'SK Pengangkatan', label: 'SK Pengangkatan Pegawai' },
              { value: 'SK Penugasan', label: 'SK Penugasan / Amanah' },
              { value: 'Kontrak Kerja', label: 'Perjanjian Kontrak Kerja' },
              { value: 'Sertifikat', label: 'Sertifikat Pelatihan / Diklat' },
              { value: 'NPWP', label: 'NPWP' },
              { value: 'BPJS', label: 'BPJS' },
              { value: 'Lainnya', label: 'Dokumen Lainnya' }
            ]}
            required
          />

          <Input
            label="Judul / Nama Dokumen"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: KTP Asli Ahmad Fauzi"
            required
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Pilih File Dokumen <span className="text-rose-500">*</span>
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-emerald-600 rounded-xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition relative">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">
                {selectedFile ? selectedFile.name : 'Klik untuk memilih file'}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Format: PDF, JPG, PNG, DOC (Maks. 10MB)
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isUploading}
              disabled={!selectedFile}
              leftIcon={<UploadCloud className="w-4 h-4" />}
            >
              Unggah Dokumen
            </Button>
          </div>
        </form>
      </Modal>

      {/* DIALOG KONFIRMASI HAPUS */}
      <ConfirmationDialog
        isOpen={Boolean(docToDelete)}
        onClose={() => setDocToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Dokumen?"
        message={`Apakah Anda yakin ingin menghapus berkas "${docToDelete?.title}" milik ${docToDelete?.employee_name}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus Dokumen"
        type="danger"
      />
    </div>
  );
};
