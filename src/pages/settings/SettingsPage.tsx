import React, { useState } from 'react';
import {
  Settings,
  Database,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Copy,
  Check,
  ShieldAlert,
  Layers,
  Users,
  CheckCircle2,
  Sparkles,
  Server
} from 'lucide-react';
import { store } from '../../services/storageStore';
import { isConfigured } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';

export const SettingsPage: React.FC = () => {
  const { success, info } = useToast();
  const [copiedSql, setCopiedSql] = useState(false);

  // Dialog States
  const [isClearEmployeesOpen, setIsClearEmployeesOpen] = useState(false);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);
  const [isResetDemoOpen, setIsResetDemoOpen] = useState(false);

  // Data stats
  const totalEmployees = store.getEmployees().length;
  const totalAssignments = store.getAssignments().length;
  const totalUnits = store.getUnits().length;
  const totalPositions = store.getPositions().length;

  const sqlScriptTruncateEmployees = `-- ==========================================================
-- SCRIPT SQL SUPABASE: KOSONGKAN DATA KARYAWAN & TRANSAKSI
-- (Mempertahankan Master Data: Units, Positions, Tasks, Users)
-- ==========================================================
TRUNCATE TABLE 
  audit_logs,
  employee_notes,
  employee_leave,
  employee_attendance,
  employee_training,
  employee_documents,
  employee_position_history,
  employee_education,
  employee_assignments,
  employees
CASCADE;`;

  const sqlScriptTruncateAll = `-- ==========================================================
-- SCRIPT SQL SUPABASE: KOSONGKAN SELURUH DATABASE (100% BERSIH)
-- ==========================================================
TRUNCATE TABLE 
  audit_logs,
  employee_notes,
  employee_leave,
  employee_attendance,
  employee_training,
  employee_documents,
  employee_position_history,
  employee_education,
  employee_assignments,
  employees,
  tasks,
  positions,
  departments,
  units
CASCADE;`;

  const handleClearEmployeesOnly = () => {
    store.clearEmployeeDataOnly();
    success(
      'Data Karyawan & Penugasan Dikosongkan',
      'Seluruh data karyawan, penugasan, absensi, berkas, dan histori berhasil dihapus. Master unit & jabatan tetap tersimpan.'
    );
    setIsClearEmployeesOpen(false);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleClearAll = () => {
    store.clearAllData();
    success(
      'Seluruh Database Bersih',
      'Database telah 100% dikosongkan (termasuk data karyawan dan master data).'
    );
    setIsClearAllOpen(false);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleResetDemo = () => {
    store.loadDemoData();
    success(
      'Data Demo Pesantren Dipulihkan',
      'Data simulasi Pondok Pesantren Al-Qur\'aniyyah (Ahmad Fauzi 4 penugasan, dll.) telah dimuat kembali.'
    );
    setIsResetDemoOpen(false);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSql(true);
    info('Script Disalin', 'Script SQL berhasil disalin ke clipboard.');
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-800" />
          <span>Pengaturan & Pemeliharaan Database SIMKA</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Kelola status database, kosongkan data untuk deployment baru, atau pulihkan data demo simulasi
        </p>
      </div>

      {/* Database Status & Stat summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Status Koneksi</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-sm font-black text-emerald-900 mt-2">
            {isConfigured ? 'Supabase Cloud Live' : 'Penyimpanan Lokal (Offline)'}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {isConfigured ? 'Terhubung ke PostgreSQL' : 'Local Storage Persistent'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-600">Total Karyawan</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalEmployees}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Data Karyawan Terdaftar</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-600">Total Penugasan Aktif</span>
          <p className="text-2xl font-black text-emerald-800 mt-1">{totalAssignments}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Penugasan Multi-Unit</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-600">Master Unit & Jabatan</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalUnits} / {totalPositions}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Unit Kerja / Jabatan</p>
        </div>
      </div>

      {/* Action Section: Data Cleanup & Reset */}
      <Card
        title="Pembersihan & Pengosongan Data (Database Management)"
        subtitle="Gunakan opsi di bawah ini untuk mempersiapkan database sebelum upload data riil atau deploy ke akun baru"
      >
        <div className="space-y-4">
          {/* OPTION 1: Clear Employee & Assignment Data Only (RECOMMENDED FOR RE-IMPORT) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4.5 rounded-2xl border border-amber-200 bg-amber-50/50 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-950 uppercase tracking-wide">
                  Opsi 1: Kosongkan Data Karyawan & Penugasan Saja (Direkomendasikan)
                </span>
                <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                  Siap Impor
                </span>
              </div>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                Menghapus semua data profil karyawan, penugasan, riwayat pendidikan, absensi, cuti, dokumen, dan catatan.
                <strong> Master Data Unit (SMP IT, SMA IT, dll.) dan Jabatan tetap utuh</strong>, sehingga Anda bisa langsung mengunggah file Excel Karyawan riil tanpa perlu setting master data lagi.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => setIsClearEmployeesOpen(true)}
              className="text-amber-800 border-amber-300 hover:bg-amber-100 shrink-0 font-bold"
            >
              Kosongkan Data Karyawan
            </Button>
          </div>

          {/* OPTION 2: Reset / Load Pesantren Demo Data */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4.5 rounded-2xl border border-emerald-200 bg-emerald-50/50 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                Opsi 2: Muat Ulang Data Simulasi Pesantren (Demo Data)
              </span>
              <p className="text-xs text-emerald-900/80 leading-relaxed">
                Memulihkan seluruh data contoh default Yayasan Pendidikan Islam Pondok Pesantren Al-Qur'aniyyah (contoh kasus multi-penugasan Ahmad Fauzi di SMP, SMA, dan Yayasan).
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => setIsResetDemoOpen(true)}
              className="text-emerald-800 border-emerald-300 hover:bg-emerald-100 shrink-0 font-bold"
            >
              Muat Data Demo
            </Button>
          </div>

          {/* OPTION 3: Clear 100% All Data */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4.5 rounded-2xl border border-rose-200 bg-rose-50/40 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-black text-rose-950 uppercase tracking-wide">
                Opsi 3: Kosongkan Seluruh Database (100% Clean Slate)
              </span>
              <p className="text-xs text-rose-900/80 leading-relaxed">
                Menghapus SEMUA data termasuk Master Data (Unit, Divisi, Jabatan, Tugas). Gunakan opsi ini jika ingin membangun struktur organisasi yayasan dari nol murni.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
              onClick={() => setIsClearAllOpen(true)}
              className="text-rose-700 border-rose-300 hover:bg-rose-100 shrink-0 font-bold"
            >
              Kosongkan Seluruh Data
            </Button>
          </div>
        </div>
      </Card>

      {/* Supabase Cloud SQL Truncate Helper */}
      <Card
        title="Script SQL untuk Supabase Cloud (Deploy Akun Baru)"
        subtitle="Jika Anda menghubungkan aplikasi ke Supabase Cloud baru dan ingin mengosongkan tabel di SQL Editor Supabase, salin script di bawah ini:"
      >
        <div className="space-y-4">
          <div className="relative">
            <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
              {sqlScriptTruncateEmployees}
            </pre>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(sqlScriptTruncateEmployees)}
              className="absolute top-3 right-3 bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 text-xs py-1"
              leftIcon={copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copiedSql ? 'Tersalin!' : 'Salin Script SQL'}
            </Button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <Server className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Petunjuk Penggunaan di Supabase:</span>
              <ol className="list-decimal list-inside mt-1 space-y-0.5 text-[11px] text-slate-600">
                <li>Buka dashboard Supabase project Anda di browser.</li>
                <li>Masuk ke menu <strong>SQL Editor</strong> di bilah navigasi kiri.</li>
                <li>Klik <strong>New Query</strong>, paste script SQL di atas, lalu klik <strong>Run</strong>.</li>
              </ol>
            </div>
          </div>
        </div>
      </Card>

      {/* DIALOG 1: Confirm Clear Employees Only */}
      <ConfirmationDialog
        isOpen={isClearEmployeesOpen}
        onClose={() => setIsClearEmployeesOpen(false)}
        onConfirm={handleClearEmployeesOnly}
        title="Kosongkan Seluruh Data Karyawan?"
        message="Tindakan ini akan menghapus semua data profil karyawan, penugasan, absensi, berkas, dan riwayat. Master Data (Unit, Jabatan, Tugas) akan tetap dipertahankan. Apakah Anda yakin ingin melanjutkan?"
        confirmText="Ya, Kosongkan Karyawan"
        type="danger"
      />

      {/* DIALOG 2: Confirm Clear All Data */}
      <ConfirmationDialog
        isOpen={isClearAllOpen}
        onClose={() => setIsClearAllOpen(false)}
        onConfirm={handleClearAll}
        title="Kosongkan SELURUH Database?"
        message="PERINGATAN: Tindakan ini akan menghapus SEMUA data termasuk Master Unit, Departemen, Jabatan, Tugas, dan Karyawan. Database akan menjadi kosong 100%. Apakah Anda yakin?"
        confirmText="Ya, Hapus Seluruh Database"
        type="danger"
      />

      {/* DIALOG 3: Confirm Reset Demo */}
      <ConfirmationDialog
        isOpen={isResetDemoOpen}
        onClose={() => setIsResetDemoOpen(false)}
        onConfirm={handleResetDemo}
        title="Muat Ulang Data Simulasi Pesantren?"
        message="Tindakan ini akan memulihkan data simulasi awal Yayasan Pondok Pesantren Al-Qur'aniyyah (termasuk contoh multi-penugasan Ustadz Ahmad Fauzi & Ustadzah Fatimah)."
        confirmText="Ya, Muat Data Demo"
        type="info"
      />
    </div>
  );
};
