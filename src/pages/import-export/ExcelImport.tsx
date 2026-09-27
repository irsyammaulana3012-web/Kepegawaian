import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  Layers,
  Users,
  ShieldAlert,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { excelService } from '../../services/excelService';
import { ExcelImportPreview } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';

export const ExcelImport: React.FC = () => {
  const navigate = useNavigate();
  const { success, error, warning } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<File | null>(null);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  // Column Mapping
  const [mapping, setMapping] = useState({
    nama: 'Nama Lengkap',
    nik: 'NIK',
    nip: 'NIP',
    jenis_kelamin: 'Jenis Kelamin',
    no_hp: 'No HP',
    email: 'Email',
    status_kepegawaian: 'Status Kepegawaian',
    tanggal_masuk: 'Tanggal Masuk',
    unit: 'Unit Penugasan',
    jabatan: 'Jabatan',
    tugas: 'Tugas',
    is_primary: 'Penugasan Utama (Ya/Tidak)'
  });

  // Analysis & Preview Results
  const [previewResult, setPreviewResult] = useState<ExcelImportPreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // STEP 1: File Upload
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setIsProcessing(true);

      try {
        const rows = await excelService.parseFile(selectedFile);
        if (rows.length === 0) {
          error('File kosong', 'Tidak ada data yang terbaca dari berkas Excel.');
          setIsProcessing(false);
          return;
        }

        setRawRows(rows);
        const fileHeaders = Object.keys(rows[0] || {});
        setHeaders(fileHeaders);

        // Auto-match headers if names are close
        const autoMapped = { ...mapping };
        fileHeaders.forEach(h => {
          const lower = h.toLowerCase();
          if (lower.includes('nama')) autoMapped.nama = h;
          else if (lower.includes('nik')) autoMapped.nik = h;
          else if (lower.includes('nip')) autoMapped.nip = h;
          else if (lower.includes('kelamin') || lower.includes('gender')) autoMapped.jenis_kelamin = h;
          else if (lower.includes('hp') || lower.includes('telepon') || lower.includes('wa')) autoMapped.no_hp = h;
          else if (lower.includes('email')) autoMapped.email = h;
          else if (lower.includes('status')) autoMapped.status_kepegawaian = h;
          else if (lower.includes('masuk') || lower.includes('join')) autoMapped.tanggal_masuk = h;
          else if (lower.includes('unit') || lower.includes('sekolah') || lower.includes('lembaga')) autoMapped.unit = h;
          else if (lower.includes('jabatan') || lower.includes('posisi')) autoMapped.jabatan = h;
          else if (lower.includes('tugas') || lower.includes('mapel') || lower.includes('amanah')) autoMapped.tugas = h;
          else if (lower.includes('utama') || lower.includes('primary')) autoMapped.is_primary = h;
        });

        setMapping(autoMapped);
        setStep(2); // Proceed to mapping
      } catch (err: any) {
        error('Gagal membaca berkas Excel', err.message);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // STEP 2 -> STEP 3: Validate & Group Multi-Assignments
  const handleValidateMapping = async () => {
    if (!mapping.nama || !mapping.nik) {
      error('Kolom Wajib', 'Kolom Nama Lengkap dan NIK wajib dipetakan.');
      return;
    }

    setIsProcessing(true);
    try {
      const preview = await excelService.processAndValidate(rawRows, mapping);
      setPreviewResult(preview);
      setStep(3); // Proceed to Review & Deduplication
    } catch (err: any) {
      error('Validasi Gagal', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // STEP 4: Commit Import
  const handleConfirmImport = async () => {
    if (!previewResult || previewResult.valid_rows.length === 0) return;

    setIsImporting(true);
    try {
      const { importedEmployees, importedAssignments } = await excelService.commitImport(previewResult.valid_rows);
      success(
        'Impor Berhasil!',
        `Berhasil mengimpor ${importedEmployees} data karyawan dan ${importedAssignments} penugasan ke database.`
      );
      setStep(4);
    } catch (err: any) {
      error('Gagal Menyimpan Data Impor', err.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Import Data Karyawan & Penugasan
            </h2>
            <Badge variant="gold" size="sm">
              Multi-Assignment Aware
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Impor massal data karyawan dan penugasan multi-unit secara cerdas tanpa duplikasi data profil
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download className="w-4 h-4 text-emerald-700" />}
          onClick={() => excelService.generateTemplate()}
        >
          Unduh Template Excel
        </Button>
      </div>

      {/* STEPPER WIZARD PROGRESS BAR */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200">
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
          <div className={`p-2 rounded-xl border ${step >= 1 ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
            1. Upload File
          </div>
          <div className={`p-2 rounded-xl border ${step >= 2 ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
            2. Mapping Kolom
          </div>
          <div className={`p-2 rounded-xl border ${step >= 3 ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
            3. Validasi & Review
          </div>
          <div className={`p-2 rounded-xl border ${step >= 4 ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
            4. Selesai
          </div>
        </div>
      </div>

      {/* STEP 1: UPLOAD FILE */}
      {step === 1 && (
        <Card className="text-center py-12">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Pilih Berkas Excel untuk Diimpor</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Mendukung file .xlsx, .xls, atau .csv. Sistem akan otomatis mendeteksi baris ganda sebagai <strong>1 Karyawan dengan Banyak Penugasan</strong>.
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-200 hover:border-emerald-600 rounded-2xl p-8 text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition relative">
              <input
                type="file"
                onChange={handleFileSelected}
                accept=".xlsx, .xls, .csv"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">Klik atau Tarik File Excel ke Area Ini</p>
              <p className="text-[10px] text-slate-400 mt-1">Format: Excel Spreadsheet (.xlsx / .xls)</p>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: COLUMN MAPPING */}
      {step === 2 && (
        <Card
          title="Pemetaan (Mapping) Kolom Excel ke Kolom Database SIMKA"
          subtitle="Pastikan setiap kolom di file Excel Anda sesuai dengan field database"
          action={
            <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
              Pilih Ulang File
            </Button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.keys(mapping).map((key) => (
              <div key={key} className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 capitalize">
                  Field: <strong className="text-emerald-950">{key.replace(/_/g, ' ')}</strong>
                </label>
                <select
                  value={(mapping as any)[key]}
                  onChange={(e) => setMapping({ ...mapping, [key]: e.target.value })}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:ring-emerald-600 focus:border-emerald-600"
                >
                  <option value="">-- Tidak Dipetakan --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
            <Button variant="outline" onClick={() => setStep(1)}>
              Kembali
            </Button>
            <Button
              variant="primary"
              onClick={handleValidateMapping}
              isLoading={isProcessing}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Lanjutkan & Validasi Data
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: VALIDATION, DEDUPLICATION & MULTI-ASSIGNMENT PREVIEW */}
      {step === 3 && previewResult && (
        <div className="space-y-6">
          {/* Key Insight Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Baris Excel</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{previewResult.raw_rows_count}</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm text-center">
              <p className="text-[11px] font-bold text-emerald-800 uppercase">Total Karyawan Unik</p>
              <p className="text-2xl font-black text-emerald-950 mt-1">{previewResult.grouped_employees_count}</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm text-center">
              <p className="text-[11px] font-bold text-amber-800 uppercase">Penugasan Terdeteksi</p>
              <p className="text-2xl font-black text-amber-950 mt-1">{previewResult.total_assignments_count}</p>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 shadow-sm text-center">
              <p className="text-[11px] font-bold text-purple-800 uppercase">Duplikasi Terfilter</p>
              <p className="text-2xl font-black text-purple-950 mt-1">{previewResult.duplicate_assignments_count}</p>
            </div>
          </div>

          {/* Core Concept Banner */}
          <div className="p-4 rounded-2xl bg-emerald-900 text-white text-xs flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300 text-sm">
                Deteksi Multi-Penugasan Berhasil!
              </p>
              <p className="text-emerald-100/90 mt-0.5 leading-relaxed">
                Sistem telah mengelompokkan {previewResult.raw_rows_count} baris Excel menjadi{' '}
                <strong>{previewResult.grouped_employees_count} record karyawan</strong> dengan total{' '}
                <strong>{previewResult.total_assignments_count} penugasan</strong>. Karyawan yang memiliki banyak baris (seperti Ahmad Fauzi) tetap menjadi 1 karyawan dengan multiple penugasan.
              </p>
            </div>
          </div>

          {/* Errors / Warnings List if any */}
          {previewResult.errors.length > 0 && (
            <Card title="Baris dengan Catatan Validasi" className="border-rose-200 bg-rose-50/20">
              <div className="space-y-2 text-xs text-rose-800">
                {previewResult.errors.map((err, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Baris {err.row}: {err.message}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Grouped Preview Table */}
          <Card title="Preview Hasil Pengelompokan Data Karyawan & Penugasan">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600 uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4 w-10">No</th>
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-4">NIK (Identitas Utama)</th>
                    <th className="py-3 px-4">Jumlah Penugasan</th>
                    <th className="py-3 px-4">Rincian Penugasan Terdeteksi</th>
                    <th className="py-3 px-4 text-center">Status di DB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewResult.valid_rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{row.employee.full_name}</td>
                      <td className="py-3.5 px-4 font-mono">{row.employee.nik}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-xs bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                          <Layers className="w-3 h-3" />
                          <span>{row.assignments.length} Penugasan</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {row.assignments.map((asg, aIdx) => (
                            <div key={aIdx} className="text-[11px] flex items-center gap-1.5">
                              <span className="font-semibold text-emerald-800">{asg.unit_name}</span>
                              <span className="text-slate-400">→</span>
                              <span className="font-medium text-slate-800">{asg.position_name}</span>
                              {asg.task_name && (
                                <span className="text-slate-500">({asg.task_name})</span>
                              )}
                              {asg.is_primary && (
                                <Badge variant="gold" size="sm">Utama</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge variant={row.is_existing ? 'blue' : 'emerald'} size="sm">
                          {row.is_existing ? 'Update Data' : 'Karyawan Baru'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
              <Button variant="outline" onClick={() => setStep(2)}>
                Kembali ke Mapping
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmImport}
                isLoading={isImporting}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Konfirmasi & Impor ke Database ({previewResult.valid_rows.length} Karyawan)
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* STEP 4: SUCCESS */}
      {step === 4 && (
        <Card className="text-center py-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Proses Impor Berhasil Selesai!</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Seluruh data karyawan dan penugasan telah tersimpan di master database SIMKA Al-Qur'aniyyah.
          </p>

          <div className="flex items-center justify-center gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setStep(1);
                setFile(null);
                setRawRows([]);
                setPreviewResult(null);
              }}
            >
              Impor File Lainnya
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/employees')}
            >
              Lihat Data Karyawan
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
