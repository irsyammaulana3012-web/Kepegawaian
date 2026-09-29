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
  RefreshCw,
  User,
  MapPin,
  Phone,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { excelService } from '../../services/excelService';
import { ExcelImportPreview } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const ExcelImport: React.FC = () => {
  const navigate = useNavigate();
  const { success, error, warning } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<File | null>(null);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  // Comprehensive Column Mapping
  const [mapping, setMapping] = useState<Record<string, string>>({
    // 1. Personal
    nama: 'Nama Lengkap',
    nik: 'NIK',
    nip: 'NIP',
    no_kk: 'No KK',
    nickname: 'Nama Panggilan',
    jenis_kelamin: 'Jenis Kelamin',
    tempat_lahir: 'Tempat Lahir',
    tanggal_lahir: 'Tanggal Lahir',
    agama: 'Agama',
    status_pernikahan: 'Status Pernikahan',

    // 2. Address & Domisili
    alamat: 'Alamat Lengkap',
    rt: 'RT',
    rw: 'RW',
    kelurahan: 'Kelurahan',
    kecamatan: 'Kecamatan',
    kota: 'Kota/Kabupaten',
    provinsi: 'Provinsi',
    kode_pos: 'Kode Pos',

    // 3. Contacts
    no_hp: 'No HP',
    whatsapp: 'WhatsApp',
    email: 'Email',

    // 4. Employment
    status_kepegawaian: 'Status Kepegawaian',
    tanggal_masuk: 'Tanggal Masuk',
    tanggal_pengangkatan: 'Tanggal Pengangkatan',
    sk_pengangkatan: 'Nomor SK Pengangkatan',
    tanggal_sk_pengangkatan: 'Tanggal SK Pengangkatan',
    tanggal_akhir_kontrak: 'Tanggal Akhir Kontrak',

    // 5. Assignment
    unit: 'Unit Penugasan',
    divisi: 'Divisi/Bagian',
    jabatan: 'Jabatan',
    tugas: 'Tugas Pokok',
    deskripsi_tugas: 'Deskripsi Tugas Khusus',
    sk_penugasan: 'Nomor SK Penugasan',
    tanggal_sk_penugasan: 'Tanggal SK Penugasan',
    tanggal_mulai_penugasan: 'Tanggal Mulai Penugasan',
    tanggal_selesai_penugasan: 'Tanggal Selesai Penugasan',
    is_primary: 'Penugasan Utama (Ya/Tidak)',
    status_penugasan: 'Status Penugasan',

    // 6. Education
    pendidikan_terakhir: 'Pendidikan Terakhir',
    institusi: 'Nama Institusi/Kampus',
    jurusan: 'Jurusan',
    tahun_lulus: 'Tahun Lulus',
    nomor_ijazah: 'Nomor Ijazah'
  });

  // Analysis & Preview Results
  const [previewResult, setPreviewResult] = useState<ExcelImportPreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Field Groups definition for UI
  const fieldGroups = [
    {
      title: '1. Identitas Personal',
      icon: <User className="w-4 h-4 text-emerald-700" />,
      fields: [
        { key: 'nama', label: 'Nama Lengkap (Wajib)', required: true },
        { key: 'nik', label: 'NIK (16 Digit - Wajib)', required: true },
        { key: 'nip', label: 'NIP / NUPTK' },
        { key: 'no_kk', label: 'Nomor Kartu Keluarga (KK)' },
        { key: 'nickname', label: 'Nama Panggilan / Gelar Ustadz' },
        { key: 'jenis_kelamin', label: 'Jenis Kelamin' },
        { key: 'tempat_lahir', label: 'Tempat Lahir' },
        { key: 'tanggal_lahir', label: 'Tanggal Lahir (YYYY-MM-DD)' },
        { key: 'agama', label: 'Agama' },
        { key: 'status_pernikahan', label: 'Status Pernikahan' }
      ]
    },
    {
      title: '2. Alamat & Domisili',
      icon: <MapPin className="w-4 h-4 text-emerald-700" />,
      fields: [
        { key: 'alamat', label: 'Alamat Lengkap / Jalan' },
        { key: 'rt', label: 'RT' },
        { key: 'rw', label: 'RW' },
        { key: 'kelurahan', label: 'Kelurahan / Desa' },
        { key: 'kecamatan', label: 'Kecamatan' },
        { key: 'kota', label: 'Kota / Kabupaten' },
        { key: 'provinsi', label: 'Provinsi' },
        { key: 'kode_pos', label: 'Kode Pos' }
      ]
    },
    {
      title: '3. Kontak & Komunikasi',
      icon: <Phone className="w-4 h-4 text-emerald-700" />,
      fields: [
        { key: 'no_hp', label: 'Nomor HP' },
        { key: 'whatsapp', label: 'Nomor WhatsApp' },
        { key: 'email', label: 'Alamat Email' }
      ]
    },
    {
      title: '4. Status Kepegawaian & SK',
      icon: <Briefcase className="w-4 h-4 text-emerald-700" />,
      fields: [
        { key: 'status_kepegawaian', label: 'Status Kepegawaian' },
        { key: 'tanggal_masuk', label: 'Tanggal Masuk / Bergabung' },
        { key: 'tanggal_pengangkatan', label: 'Tanggal Pengangkatan' },
        { key: 'sk_pengangkatan', label: 'Nomor SK Pengangkatan' },
        { key: 'tanggal_sk_pengangkatan', label: 'Tanggal SK Pengangkatan' },
        { key: 'tanggal_akhir_kontrak', label: 'Tanggal Akhir Kontrak (Jika Kontrak)' }
      ]
    },
    {
      title: '5. Penugasan, Unit & Jabatan (Multi-Assignment)',
      icon: <Layers className="w-4 h-4 text-emerald-700" />,
      fields: [
        { key: 'unit', label: 'Unit Penugasan (Wajib)', required: true },
        { key: 'divisi', label: 'Divisi / Bagian' },
        { key: 'jabatan', label: 'Jabatan (Wajib)', required: true },
        { key: 'tugas', label: 'Tugas Pokok / Amanah' },
        { key: 'deskripsi_tugas', label: 'Deskripsi Tugas Khusus' },
        { key: 'sk_penugasan', label: 'Nomor SK Penugasan' },
        { key: 'tanggal_sk_penugasan', label: 'Tanggal SK Penugasan' },
        { key: 'tanggal_mulai_penugasan', label: 'Tanggal Mulai Penugasan' },
        { key: 'tanggal_selesai_penugasan', label: 'Tanggal Selesai Penugasan' },
        { key: 'is_primary', label: 'Penugasan Utama (Ya/Tidak)' },
        { key: 'status_penugasan', label: 'Status Penugasan' }
      ]
    },
    {
      title: '6. Riwayat Pendidikan Terakhir',
      icon: <GraduationCap className="w-4 h-4 text-emerald-700" />,
      fields: [
        { key: 'pendidikan_terakhir', label: 'Jenjang Pendidikan (S1/S2/D3/SMA/dll)' },
        { key: 'institusi', label: 'Nama Institusi / Universitas / Pondok' },
        { key: 'jurusan', label: 'Jurusan / Program Studi' },
        { key: 'tahun_lulus', label: 'Tahun Kelulusan' },
        { key: 'nomor_ijazah', label: 'Nomor Ijazah' }
      ]
    }
  ];

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

        // Auto-match headers intelligently
        const autoMapped = { ...mapping };
        fileHeaders.forEach(h => {
          const lower = h.toLowerCase();
          if (lower.includes('nama lengkap') || lower === 'nama') autoMapped.nama = h;
          else if (lower.includes('nik')) autoMapped.nik = h;
          else if (lower.includes('nip') || lower.includes('nuptk')) autoMapped.nip = h;
          else if (lower.includes('kk') || lower.includes('kartu keluarga')) autoMapped.no_kk = h;
          else if (lower.includes('panggilan') || lower.includes('alias')) autoMapped.nickname = h;
          else if (lower.includes('kelamin') || lower.includes('gender') || lower === 'jk') autoMapped.jenis_kelamin = h;
          else if (lower.includes('tempat lahir') || lower.includes('tmp lahir')) autoMapped.tempat_lahir = h;
          else if (lower.includes('tanggal lahir') || lower.includes('tgl lahir')) autoMapped.tanggal_lahir = h;
          else if (lower.includes('agama')) autoMapped.agama = h;
          else if (lower.includes('nikah') || lower.includes('pernikahan') || lower.includes('kawin')) autoMapped.status_pernikahan = h;
          else if (lower.includes('alamat')) autoMapped.alamat = h;
          else if (lower === 'rt') autoMapped.rt = h;
          else if (lower === 'rw') autoMapped.rw = h;
          else if (lower.includes('kelurahan') || lower.includes('desa')) autoMapped.kelurahan = h;
          else if (lower.includes('kecamatan')) autoMapped.kecamatan = h;
          else if (lower.includes('kota') || lower.includes('kabupaten')) autoMapped.kota = h;
          else if (lower.includes('provinsi')) autoMapped.provinsi = h;
          else if (lower.includes('pos')) autoMapped.kode_pos = h;
          else if (lower.includes('hp') || lower.includes('ponsel') || lower.includes('telp')) autoMapped.no_hp = h;
          else if (lower.includes('wa') || lower.includes('whatsapp')) autoMapped.whatsapp = h;
          else if (lower.includes('email')) autoMapped.email = h;
          else if (lower.includes('status kepegawaian') || lower.includes('status pegawai')) autoMapped.status_kepegawaian = h;
          else if (lower.includes('tanggal masuk') || lower.includes('tgl masuk') || lower.includes('tmt')) autoMapped.tanggal_masuk = h;
          else if (lower.includes('tgl angkat') || lower.includes('tanggal pengangkatan')) autoMapped.tanggal_pengangkatan = h;
          else if (lower.includes('sk angkat') || lower.includes('sk pengangkatan')) autoMapped.sk_pengangkatan = h;
          else if (lower.includes('tgl sk angkat') || lower.includes('tanggal sk pengangkatan')) autoMapped.tanggal_sk_pengangkatan = h;
          else if (lower.includes('akhir kontrak') || lower.includes('habis kontrak')) autoMapped.tanggal_akhir_kontrak = h;
          else if (lower.includes('unit') || lower.includes('lembaga') || lower.includes('sekolah')) autoMapped.unit = h;
          else if (lower.includes('divisi') || lower.includes('bagian')) autoMapped.divisi = h;
          else if (lower.includes('jabatan') || lower.includes('posisi')) autoMapped.jabatan = h;
          else if (lower.includes('tugas') || lower.includes('amanah') || lower.includes('mapel')) autoMapped.tugas = h;
          else if (lower.includes('deskripsi')) autoMapped.deskripsi_tugas = h;
          else if (lower.includes('sk penugasan') || lower.includes('sk tugas')) autoMapped.sk_penugasan = h;
          else if (lower.includes('tgl sk penugasan')) autoMapped.tanggal_sk_penugasan = h;
          else if (lower.includes('mulai penugasan') || lower.includes('tgl mulai')) autoMapped.tanggal_mulai_penugasan = h;
          else if (lower.includes('selesai penugasan') || lower.includes('tgl selesai')) autoMapped.tanggal_selesai_penugasan = h;
          else if (lower.includes('utama') || lower.includes('primary')) autoMapped.is_primary = h;
          else if (lower.includes('status penugasan')) autoMapped.status_penugasan = h;
          else if (lower.includes('pendidikan') || lower.includes('jenjang')) autoMapped.pendidikan_terakhir = h;
          else if (lower.includes('institusi') || lower.includes('kampus') || lower.includes('universitas') || lower.includes('sekolah')) autoMapped.institusi = h;
          else if (lower.includes('jurusan') || lower.includes('prodi')) autoMapped.jurusan = h;
          else if (lower.includes('tahun lulus') || lower.includes('thn lulus')) autoMapped.tahun_lulus = h;
          else if (lower.includes('ijazah')) autoMapped.nomor_ijazah = h;
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
    if (!mapping.unit || !mapping.jabatan) {
      error('Kolom Wajib', 'Kolom Unit Penugasan dan Jabatan wajib dipetakan.');
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
              Import Lengkap Data Karyawan & Multi-Penugasan
            </h2>
            <Badge variant="gold" size="sm">
              Schema Komprehensif
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Impor data profil lengkap (KTP, KK, Alamat, Kontak, SK, Pendidikan) dan multi-penugasan tanpa duplikasi data
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={() => excelService.generateTemplate()}
          className="shadow-sm"
        >
          Unduh Template Excel Lengkap
        </Button>
      </div>

      {/* STEPPER WIZARD PROGRESS BAR */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
          <div className={`p-2.5 rounded-xl border transition-all ${step >= 1 ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
            1. Upload File Excel
          </div>
          <div className={`p-2.5 rounded-xl border transition-all ${step >= 2 ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
            2. Pemetaan Kolom
          </div>
          <div className={`p-2.5 rounded-xl border transition-all ${step >= 3 ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
            3. Validasi & Pengelompokan
          </div>
          <div className={`p-2.5 rounded-xl border transition-all ${step >= 4 ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
            4. Selesai
          </div>
        </div>
      </div>

      {/* STEP 1: UPLOAD FILE */}
      {step === 1 && (
        <Card className="text-center py-12">
          <div className="max-w-xl mx-auto space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Upload Berkas Excel Karyawan</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Mendukung seluruh data profil karyawan (NIK, KK, Domisili, Kontak, SK Pengangkatan, Riwayat Pendidikan) serta deteksi cerdas <strong>1 Karyawan = Multiple Penugasan</strong>.
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-200 hover:border-emerald-600 rounded-2xl p-8 text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition relative">
              <input
                type="file"
                onChange={handleFileSelected}
                accept=".xlsx, .xls, .csv"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-10 h-10 text-emerald-700 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">Klik atau Tarik File Excel ke Sini</p>
              <p className="text-xs text-slate-400 mt-1">Format yang didukung: .xlsx, .xls, .csv</p>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="w-3.5 h-3.5 text-emerald-700" />}
                onClick={() => excelService.generateTemplate()}
              >
                Belum punya format? Unduh Template Excel Lengkap
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: COLUMN MAPPING */}
      {step === 2 && (
        <div className="space-y-6">
          <Card
            title="Pemetaan (Mapping) Kolom Excel ke Master Database SIMKA"
            subtitle="Sistem secara otomatis mendeteksi kolom dari file Excel Anda. Anda dapat menyesuaikan atau mengubah pemetaan di bawah ini."
            action={
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                Pilih Ulang File
              </Button>
            }
          >
            <div className="space-y-8">
              {fieldGroups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    {group.icon}
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      {group.title}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
                    {group.fields.map((field) => (
                      <div key={field.key} className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-700">
                          {field.label}{' '}
                          {field.required && <span className="text-rose-500 font-bold">*</span>}
                        </label>
                        <select
                          value={mapping[field.key] || ''}
                          onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                          className={`w-full py-2 px-3 text-xs rounded-xl border transition ${
                            mapping[field.key]
                              ? 'bg-emerald-50/30 border-emerald-300 text-slate-900 font-medium'
                              : 'bg-white border-slate-200 text-slate-400'
                          } focus:ring-emerald-600 focus:border-emerald-600`}
                        >
                          <option value="">-- Tidak Dipetakan / Kosongkan --</option>
                          {headers.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-6">
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
        </div>
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
              <p className="text-[11px] font-bold text-emerald-800 uppercase">Karyawan Unik Teridentifikasi</p>
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
                Pengelompokan Multi-Penugasan & Profil Lengkap Berhasil!
              </p>
              <p className="text-emerald-100/90 mt-0.5 leading-relaxed">
                Sistem mengelompokkan {previewResult.raw_rows_count} baris Excel menjadi{' '}
                <strong>{previewResult.grouped_employees_count} profil karyawan unik</strong> dengan total{' '}
                <strong>{previewResult.total_assignments_count} penugasan</strong>. Data identitas (NIK, KK, Domisili, Pendidikan) otomatis tersinkronisasi.
              </p>
            </div>
          </div>

          {/* Errors / Warnings List if any */}
          {previewResult.errors.length > 0 && (
            <Card title="Catatan Validasi Baris Excel" className="border-rose-200 bg-rose-50/20">
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
          <Card title="Pratinjau Hasil Pengelompokan Data Karyawan, Penugasan & Pendidikan">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600 uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4 w-10">No</th>
                    <th className="py-3 px-4">Nama Lengkap & NIK</th>
                    <th className="py-3 px-4">Kontak & Domisili</th>
                    <th className="py-3 px-4">Pendidikan</th>
                    <th className="py-3 px-4">Rincian Penugasan</th>
                    <th className="py-3 px-4 text-center">Status di DB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewResult.valid_rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{row.employee.full_name}</div>
                        <div className="text-[11px] font-mono text-slate-500">NIK: {row.employee.nik}</div>
                        {row.employee.no_kk && (
                          <div className="text-[10px] text-slate-400">KK: {row.employee.no_kk}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[11px]">
                        <div>{row.employee.phone || row.employee.email || '-'}</div>
                        <div className="text-slate-400 text-[10px]">
                          {row.employee.city ? `${row.employee.city}, ${row.employee.province || ''}` : '-'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[11px]">
                        {row.education && row.education.length > 0 ? (
                          <div>
                            <span className="font-semibold text-emerald-800">{row.education[0].level}</span>
                            <span className="text-slate-600 ml-1">- {row.education[0].institution_name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
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
            Seluruh data identitas karyawan, domisili, kontak, SK, riwayat pendidikan, dan penugasan multi-unit telah tersimpan di master database SIMKA Al-Qur'aniyyah.
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
