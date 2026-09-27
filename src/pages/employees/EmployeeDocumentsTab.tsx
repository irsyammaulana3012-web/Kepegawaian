import React, { useState, useEffect } from 'react';
import {
  FolderLock,
  UploadCloud,
  FileText,
  Download,
  Trash2,
  ExternalLink,
  Eye,
  FileCheck
} from 'lucide-react';
import { EmployeeDocument } from '../../types';
import { documentService } from '../../services/documentService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';

interface EmployeeDocumentsTabProps {
  employeeId: string;
}

export const EmployeeDocumentsTab: React.FC<EmployeeDocumentsTabProps> = ({ employeeId }) => {
  const { canEdit } = useAuth();
  const { success, error } = useToast();

  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Upload modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documentType, setDocumentType] = useState('KTP');
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Delete modal state
  const [docToDelete, setDocToDelete] = useState<EmployeeDocument | null>(null);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await documentService.getDocumentsByEmployee(employeeId);
      setDocuments(data);
    } catch (err: any) {
      error('Gagal memuat dokumen', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [employeeId]);

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
    if (!selectedFile) {
      error('Pilih berkas dokumen yang akan diunggah');
      return;
    }

    setIsUploading(true);
    try {
      await documentService.uploadDocument(
        employeeId,
        documentType,
        title || selectedFile.name,
        selectedFile
      );

      success('Dokumen Berhasil Diunggah', `Berkas ${selectedFile.name} tersimpan.`);
      setIsModalOpen(false);
      setSelectedFile(null);
      setTitle('');
      loadDocuments();
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
      success('Dokumen Dihapus', 'Berkas dokumen telah dihapus.');
      setDocToDelete(null);
      loadDocuments();
    } catch (err: any) {
      error('Gagal Menghapus Dokumen', err.message);
    }
  };

  const docCategories = [
    'KTP',
    'Kartu Keluarga (KK)',
    'Ijazah Terakhir',
    'Transkrip Nilai',
    'SK Pengangkatan Yayasan',
    'SK Penugasan / Mengajar',
    'Kontrak Kerja',
    'Sertifikat Pelatihan / Diklat',
    'Sertifikat Pendidik / Portofolio',
    'NPWP',
    'BPJS Kesehatan / Ketenagakerjaan',
    'Dokumen Lainnya'
  ];

  return (
    <div className="space-y-6">
      {/* Header & Upload Button */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Arsip & Berkas Digital Karyawan</h3>
          <p className="text-xs text-slate-500">Tersimpan terlindungi di cloud storage (/employees/{employeeId}/)</p>
        </div>
        {canEdit && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<UploadCloud className="w-4 h-4" />}
            onClick={() => {
              setSelectedFile(null);
              setTitle('');
              setIsModalOpen(true);
            }}
          >
            Unggah Dokumen
          </Button>
        )}
      </div>

      {/* Document Grid */}
      {documents.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-2">
          <FolderLock className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-700">Belum Ada Dokumen</p>
          <p>Unggah KTP, KK, Ijazah, SK Pengangkatan, atau Sertifikat karyawan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow transition space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {doc.document_type}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {documentService.formatBytes(doc.file_size)}
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-slate-900 text-xs truncate" title={doc.title}>
                      {doc.title}
                    </h5>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5" title={doc.file_name}>
                      {doc.file_name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">
                  {new Date(doc.created_at || '').toLocaleDateString('id-ID')}
                </span>

                <div className="flex items-center gap-1">
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                    title="Buka / Preview Dokumen"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {canEdit && (
                    <button
                      onClick={() => setDocToDelete(doc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Hapus Dokumen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Unggah Berkas Dokumen"
        subtitle="Mendukung format PDF, JPG, PNG, atau scan dokumen"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <Select
            label="Kategori Dokumen"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            options={docCategories.map(c => ({ value: c, label: c }))}
          />

          <Input
            label="Judul Dokumen"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: KTP Asli / SK Yayasan 2024"
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Pilih Berkas File <span className="text-rose-500">*</span>
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition relative">
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              />
              <UploadCloud className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">
                {selectedFile ? selectedFile.name : 'Klik atau Tarik Berkas ke Sini'}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                PDF, JPG, PNG hingga 10MB
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isUploading} disabled={!selectedFile}>
              Unggah Sekarang
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={Boolean(docToDelete)}
        onClose={() => setDocToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Dokumen?"
        message={`Apakah Anda yakin ingin menghapus berkas "${docToDelete?.title}" (${docToDelete?.file_name})?`}
      />
    </div>
  );
};
