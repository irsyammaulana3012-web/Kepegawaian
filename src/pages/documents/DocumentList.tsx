import React, { useState, useEffect, useMemo } from 'react';
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
  CheckCircle2,
  XCircle,
  Plus,
  ShieldCheck,
  Building2,
  AlertTriangle,
  FileCheck,
  Sparkles,
  Layers,
  ArrowRight,
  Settings2,
  Edit2,
  Check
} from 'lucide-react';
import { EmployeeDocument, Employee, Unit, DocumentTypeDefinition } from '../../types';
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

export const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const { canEdit } = useAuth();
  const { success, error, info } = useToast();

  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [docTypes, setDocTypes] = useState<DocumentTypeDefinition[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [filterCompleteness, setFilterCompleteness] = useState<'all' | 'complete' | 'incomplete'>('all');

  // Upload Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [documentType, setDocumentType] = useState('KTP');
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Manage Document Types Modal State
  const [isManageTypesOpen, setIsManageTypesOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDescription, setNewTypeDescription] = useState('');
  const [newTypeMandatory, setNewTypeMandatory] = useState(true);
  const [isSavingType, setIsSavingType] = useState(false);

  // Delete Modals State
  const [docToDelete, setDocToDelete] = useState<EmployeeDocument | null>(null);
  const [typeToDelete, setTypeToDelete] = useState<DocumentTypeDefinition | null>(null);

  // View All Docs Modal for a Specific Employee
  const [selectedEmployeeForView, setSelectedEmployeeForView] = useState<Employee | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [docData, typesData, empData, unitData] = await Promise.all([
        documentService.getAllDocuments(),
        documentService.getDocumentTypes(),
        employeeService.getEmployees({ limit: 1000 }),
        masterDataService.getUnits()
      ]);
      setDocuments(docData);
      setDocTypes(typesData);
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
  }, []);

  // Tracked mandatory document columns in the matrix
  const trackedDocTypes = useMemo(() => {
    return docTypes.filter(t => t.is_mandatory && t.is_active);
  }, [docTypes]);

  // Map employee with their documents matrix
  const employeeMatrix = useMemo(() => {
    return employees.map(emp => {
      const empDocs = documents.filter(d => d.employee_id === emp.id);

      // Map documents per tracked type
      const docsByType: Record<string, EmployeeDocument | undefined> = {};
      trackedDocTypes.forEach(t => {
        docsByType[t.name] = empDocs.find(d => {
          const docType = d.document_type.toLowerCase();
          const targetName = t.name.toLowerCase();
          const targetCode = t.code.toLowerCase();

          return (
            docType === targetName ||
            docType === targetCode ||
            docType.includes(targetName) ||
            targetName.includes(docType)
          );
        });
      });

      // Other documents that don't match any tracked column
      const otherDocs = empDocs.filter(d => {
        return !trackedDocTypes.some(t => {
          const docType = d.document_type.toLowerCase();
          const targetName = t.name.toLowerCase();
          return docType === targetName || docType.includes(targetName) || targetName.includes(docType);
        });
      });

      // Calculate completeness
      let completedCount = 0;
      trackedDocTypes.forEach(t => {
        if (docsByType[t.name]) completedCount++;
      });

      const totalTracked = trackedDocTypes.length || 1;
      const percentage = Math.round((completedCount / totalTracked) * 100);

      return {
        employee: emp,
        docsByType,
        otherDocs,
        totalDocsCount: empDocs.length,
        completedCount,
        percentage,
        isComplete: completedCount === trackedDocTypes.length && trackedDocTypes.length > 0
      };
    });
  }, [employees, documents, trackedDocTypes]);

  // Filtered Matrix Rows
  const filteredMatrix = useMemo(() => {
    return employeeMatrix.filter(row => {
      const emp = row.employee;

      // Search match
      const matchSearch =
        !search ||
        emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
        emp.nik.includes(search) ||
        (emp.employee_number && emp.employee_number.toLowerCase().includes(search.toLowerCase())) ||
        (emp.units_list && emp.units_list.some(u => u.toLowerCase().includes(search.toLowerCase())));

      // Unit match
      const matchUnit =
        selectedUnit === 'all' ||
        (emp.units_list && emp.units_list.some(u => {
          const unitObj = units.find(unit => unit.id === selectedUnit || unit.name === selectedUnit);
          return (unitObj && u.toLowerCase() === unitObj.name.toLowerCase()) || u.toLowerCase() === selectedUnit.toLowerCase();
        })) ||
        (emp.primary_assignment && (
          emp.primary_assignment.unit_id === selectedUnit ||
          emp.primary_assignment.unit_name?.toLowerCase() === selectedUnit.toLowerCase()
        ));

      // Completeness match
      const matchCompleteness =
        filterCompleteness === 'all' ||
        (filterCompleteness === 'complete' && row.isComplete) ||
        (filterCompleteness === 'incomplete' && !row.isComplete);

      return matchSearch && matchUnit && matchCompleteness;
    });
  }, [employeeMatrix, search, selectedUnit, filterCompleteness, units]);

  // Overall Stats
  const totalEmployees = employees.length;
  const completeEmployeesCount = employeeMatrix.filter(r => r.isComplete).length;
  const incompleteEmployeesCount = totalEmployees - completeEmployeesCount;
  const totalUploadedDocs = documents.length;

  // Open Quick Upload for a Specific Employee and Doc Type
  const handleQuickUpload = (empId: string, typeName: string) => {
    setSelectedEmployeeId(empId);
    setDocumentType(typeName);
    const emp = employees.find(e => e.id === empId);
    setTitle(`${typeName} - ${emp?.full_name || ''}`);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleOpenGeneralUpload = () => {
    setSelectedEmployeeId(employees[0]?.id || '');
    setDocumentType(docTypes[0]?.name || 'KTP');
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

  const handleUploadSubmit = async (e: React.FormEvent) => {
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

  // Add new Custom Document Type Handler
  const handleCreateDocumentType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) {
      error('Nama jenis dokumen wajib diisi');
      return;
    }

    setIsSavingType(true);
    try {
      await documentService.saveDocumentType({
        name: newTypeName.trim(),
        description: newTypeDescription.trim() || undefined,
        is_mandatory: newTypeMandatory,
        is_active: true
      });

      success('Jenis Dokumen Ditambahkan', `Jenis dokumen "${newTypeName}" berhasil dibuat dan ditambahkan ke matriks.`);
      setNewTypeName('');
      setNewTypeDescription('');
      setNewTypeMandatory(true);
      loadData();
    } catch (err: any) {
      error('Gagal Menyimpan Jenis Dokumen', err.message);
    } finally {
      setIsSavingType(false);
    }
  };

  const handleDeleteDocumentType = async () => {
    if (!typeToDelete) return;
    try {
      await documentService.deleteDocumentType(typeToDelete.id);
      success('Jenis Dokumen Dihapus', `Jenis dokumen "${typeToDelete.name}" telah dihapus.`);
      setTypeToDelete(null);
      loadData();
    } catch (err: any) {
      error('Gagal Menghapus Jenis Dokumen', err.message);
    }
  };

  const handleDelete = async () => {
    if (!docToDelete) return;
    try {
      await documentService.deleteDocument(docToDelete.id);
      success('Dokumen Dihapus', `Berkas "${docToDelete.title}" telah dihapus.`);
      setDocToDelete(null);
      loadData();
    } catch (err: any) {
      error('Gagal Menghapus Dokumen', err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FolderLock className="w-6 h-6 text-emerald-800" />
              <span>Matriks Kelengkapan Berkas & Dokumen Karyawan</span>
            </h2>
            <Badge variant="emerald" size="sm">
              {trackedDocTypes.length} Kolom Dokumen Terlacak
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Setiap baris menampilkan 1 karyawan. Anda dapat menambah jenis dokumen baru secara fleksibel melalui menu kelola dokumen.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Settings2 className="w-4 h-4 text-emerald-800" />}
                onClick={() => setIsManageTypesOpen(true)}
              >
                Kelola Jenis Dokumen
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={handleOpenGeneralUpload}
                className="shadow-sm"
              >
                Unggah Dokumen Baru
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Karyawan</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalEmployees}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Terdaftar di SIMKA</p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase">Berkas Lengkap (100%)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-950 mt-1">{completeEmployeesCount}</p>
          <p className="text-[10px] text-emerald-700/80 mt-0.5">Seluruh dokumen wajib terpenuhi</p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 uppercase">Perlu Dilengkapi</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-950 mt-1">{incompleteEmployeesCount}</p>
          <p className="text-[10px] text-rose-700/80 mt-0.5">Ada dokumen wajib yang kosong</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-600 uppercase">Total Berkas Digital</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalUploadedDocs}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Tersimpan di Cloud/Lokal</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="w-full sm:w-72 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama karyawan, NIK, unit..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-emerald-600 focus:border-emerald-600 transition"
              />
            </div>

            {/* Unit Filter Dropdown */}
            <div className="w-full sm:w-60">
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold focus:ring-emerald-600 focus:border-emerald-600"
              >
                <option value="all">★ Semua Unit Penugasan</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    Unit: {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Completeness Filter Dropdown */}
            <div className="w-full sm:w-56">
              <select
                value={filterCompleteness}
                onChange={(e) => setFilterCompleteness(e.target.value as any)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold focus:ring-emerald-600"
              >
                <option value="all">Semua Status Kelengkapan</option>
                <option value="incomplete">⚠ Hanya yang Belum Lengkap (Merah)</option>
                <option value="complete">✓ Sudah Lengkap 100% (Hijau)</option>
              </select>
            </div>
          </div>

          {/* Quick Info Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan <strong>{filteredMatrix.length}</strong> Karyawan
            </span>
          </div>
        </div>
      </Card>

      {/* MAIN DOCUMENT MATRIX TABLE (DYNAMIC COLUMNS) */}
      <Card>
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500">Memuat matriks dokumen...</div>
        ) : filteredMatrix.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <FolderLock className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-800">Tidak ada data karyawan yang cocok</p>
            <p className="text-xs text-slate-400">Silakan sesuaikan filter pencarian atau unit penugasan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">No</th>
                  <th className="py-3 px-4 min-w-[220px]">Nama Karyawan & Unit</th>
                  <th className="py-3 px-3 text-center w-28">Kelengkapan</th>
                  {/* Dynamic Document Columns from Registered Types */}
                  {trackedDocTypes.map((t, tIdx) => (
                    <th key={t.id} className="py-3 px-3 text-center min-w-[130px]">
                      {tIdx + 1}. {t.name}
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center min-w-[100px]">Lainnya</th>
                  <th className="py-3 px-3 text-center w-16">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMatrix.map((row, idx) => {
                  const emp = row.employee;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                      {/* 1. No */}
                      <td className="py-3.5 px-3 text-center font-bold text-slate-400 font-mono">
                        {idx + 1}
                      </td>

                      {/* 2. Employee Profile & Unit (SINGLE UNIQUE ROW) */}
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => navigate(`/employees/${emp.id}`)}
                          className="font-bold text-emerald-950 hover:text-emerald-700 cursor-pointer flex items-center gap-1.5"
                        >
                          <span>{emp.full_name}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {emp.employee_number || emp.nik}
                        </div>
                        {emp.units_list && emp.units_list.length > 0 && (
                          <div className="text-[10px] text-emerald-800 font-semibold mt-0.5 truncate max-w-[210px]">
                            {emp.units_list.join(', ')}
                          </div>
                        )}
                      </td>

                      {/* 3. Completeness Progress */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full ${
                            row.isComplete
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.completedCount >= Math.ceil(trackedDocTypes.length / 2)
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {row.completedCount}/{trackedDocTypes.length} ({row.percentage}%)
                          </span>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                row.isComplete ? 'bg-emerald-600' : row.completedCount >= Math.ceil(trackedDocTypes.length / 2) ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${row.percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* DYNAMIC DOCUMENT COLUMNS (GREEN / RED) */}
                      {trackedDocTypes.map((t) => {
                        const doc = row.docsByType[t.name];

                        return (
                          <td key={t.id} className="py-3.5 px-3 text-center">
                            {doc ? (
                              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-xl shadow-2xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="font-bold text-[11px]">Ada</span>
                                <a
                                  href={doc.file_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  download={doc.file_name}
                                  title={`Unduh ${doc.title}`}
                                  className="p-1 rounded text-emerald-800 hover:bg-emerald-200 transition ml-0.5"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleQuickUpload(emp.id, t.name)}
                                className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition text-[11px] font-semibold"
                                title={`Klik untuk mengunggah ${t.name}`}
                              >
                                <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                <span>Kosong</span>
                                {canEdit && <span className="text-[10px] text-rose-500 font-bold ml-0.5">+ Unggah</span>}
                              </button>
                            )}
                          </td>
                        );
                      })}

                      {/* Other Documents Count */}
                      <td className="py-3.5 px-3 text-center">
                        {row.otherDocs.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                            {row.otherDocs.length} Berkas
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Actions / View All Details */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => setSelectedEmployeeForView(emp)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 transition"
                          title="Lihat Rincian Seluruh Berkas Karyawan Ini"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* MODAL KELOLA JENIS DOKUMEN (DYNAMIC DOCUMENT TYPES MANAGER) */}
      <Modal
        isOpen={isManageTypesOpen}
        onClose={() => setIsManageTypesOpen(false)}
        title="Pengaturan & Kelola Jenis Dokumen Karyawan"
      >
        <div className="space-y-6">
          {/* Form Add New Type */}
          {canEdit && (
            <form onSubmit={handleCreateDocumentType} className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
              <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-700" />
                <span>Tambah Jenis Dokumen Baru</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Nama Jenis Dokumen"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="Contoh: NPWP / Sertifikat Pendidik / BPJS"
                  required
                />

                <Input
                  label="Keterangan / Deskripsi"
                  value={newTypeDescription}
                  onChange={(e) => setNewTypeDescription(e.target.value)}
                  placeholder="Contoh: Nomor Pokok Wajib Pajak Pegawai"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-emerald-200">
                <div>
                  <span className="text-xs font-bold text-slate-800">Tampilkan sebagai Kolom di Matriks Kelengkapan</span>
                  <p className="text-[10px] text-slate-500">Jika aktif, jenis dokumen ini akan menjadi kolom tabel dan dihitung dalam % kelengkapan</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTypeMandatory}
                    onChange={(e) => setNewTypeMandatory(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-800" />
                </label>
              </div>

              <div className="flex justify-end pt-1">
                <Button variant="primary" size="sm" type="submit" isLoading={isSavingType} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Tambah Jenis Dokumen
                </Button>
              </div>
            </form>
          )}

          {/* List of Registered Document Types */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
              Daftar Jenis Dokumen yang Terdaftar ({docTypes.length})
            </h4>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {docTypes.map((dt, idx) => (
                <div
                  key={dt.id}
                  className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-slate-400 font-bold w-5">{idx + 1}.</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{dt.name}</span>
                        {dt.is_mandatory ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                            Matriks Utama
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">
                            Opsional
                          </span>
                        )}
                      </div>
                      {dt.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{dt.description}</p>
                      )}
                    </div>
                  </div>

                  {canEdit && (
                    <button
                      onClick={() => setTypeToDelete(dt)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Hapus Jenis Dokumen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button variant="primary" size="sm" onClick={() => setIsManageTypesOpen(false)}>
              Selesai
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL VIEW DETAIL SEMUA BERKAS KARYAWAN */}
      {selectedEmployeeForView && (
        <Modal
          isOpen={Boolean(selectedEmployeeForView)}
          onClose={() => setSelectedEmployeeForView(null)}
          title={`Berkas Dokumen: ${selectedEmployeeForView.full_name}`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="font-bold text-slate-900">{selectedEmployeeForView.full_name}</div>
              <div className="text-[11px] text-slate-500 font-mono">
                ID: {selectedEmployeeForView.employee_number} | NIK: {selectedEmployeeForView.nik}
              </div>
              <div className="text-[11px] text-emerald-800 font-medium mt-0.5">
                Unit: {selectedEmployeeForView.units_list?.join(', ') || 'Yayasan'}
              </div>
            </div>

            {/* List of all docs uploaded for this employee */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {documents.filter(d => d.employee_id === selectedEmployeeForView.id).length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">
                  Belum ada dokumen yang diunggah untuk karyawan ini.
                </p>
              ) : (
                documents
                  .filter(d => d.employee_id === selectedEmployeeForView.id)
                  .map(doc => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">{doc.title}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="font-semibold text-emerald-800">{doc.document_type}</span>
                            <span>•</span>
                            <span className="font-mono">{doc.file_name}</span>
                            <span>•</span>
                            <span>{documentService.formatBytes(doc.file_size)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          download={doc.file_name}
                          className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition"
                          title="Unduh Berkas"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        {canEdit && (
                          <button
                            onClick={() => {
                              setSelectedEmployeeForView(null);
                              setDocToDelete(doc);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Hapus Berkas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5 text-emerald-700" />}
                  onClick={() => {
                    const emp = selectedEmployeeForView;
                    setSelectedEmployeeForView(null);
                    handleQuickUpload(emp.id, docTypes[0]?.name || 'KTP');
                  }}
                >
                  + Unggah Berkas untuk Karyawan Ini
                </Button>
              )}
              <Button variant="primary" size="sm" onClick={() => setSelectedEmployeeForView(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL UNGGAH DOKUMEN */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Unggah Dokumen Karyawan"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Karyawan <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:ring-emerald-600 focus:border-emerald-600 font-medium"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.employee_number || emp.nik})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tipe / Jenis Dokumen <span className="text-rose-500">*</span>
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:ring-emerald-600 focus:border-emerald-600 font-medium"
            >
              {docTypes.map((dt) => (
                <option key={dt.id} value={dt.name}>
                  {dt.name} {dt.description ? `(${dt.description})` : ''}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Judul / Keterangan Dokumen"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: KTP Asli Ahmad Fauzi"
            required
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Pilih Berkas Dokumen <span className="text-rose-500">*</span>
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
                {selectedFile ? selectedFile.name : 'Klik atau Tarik Berkas ke Sini'}
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

      {/* DIALOG KONFIRMASI HAPUS BERKAS */}
      <ConfirmationDialog
        isOpen={Boolean(docToDelete)}
        onClose={() => setDocToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Dokumen?"
        message={`Apakah Anda yakin ingin menghapus berkas "${docToDelete?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus Dokumen"
        type="danger"
      />

      {/* DIALOG KONFIRMASI HAPUS JENIS DOKUMEN */}
      <ConfirmationDialog
        isOpen={Boolean(typeToDelete)}
        onClose={() => setTypeToDelete(null)}
        onConfirm={handleDeleteDocumentType}
        title="Hapus Jenis Dokumen?"
        message={`Apakah Anda yakin ingin menghapus jenis dokumen "${typeToDelete?.name}"? Kolom ini tidak akan lagi tampil di matriks kelengkapan.`}
        confirmText="Ya, Hapus Jenis Dokumen"
        type="danger"
      />
    </div>
  );
};
