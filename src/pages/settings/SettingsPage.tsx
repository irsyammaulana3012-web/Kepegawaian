import React, { useState } from 'react';
import { Settings, Database, RefreshCw, Key, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { store } from '../../services/storageStore';
import { isConfigured } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';

export const SettingsPage: React.FC = () => {
  const { success } = useToast();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleResetData = () => {
    store.resetToDefault();
    success('Database Direset', 'Semua data awal default Pondok Pesantren Al-Qur\'aniyyah telah dipulihkan.');
    setIsResetConfirmOpen(false);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-800" />
          <span>Pengaturan Sistem SIMKA</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Konfigurasi database, konektivitas Supabase, dan pemeliharaan</p>
      </div>

      <Card
        title="Status Koneksi Database Supabase"
        subtitle="PostgreSQL, Authentication & Supabase Storage"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Mode Operasional: {isConfigured ? 'Supabase Live Connected' : 'Local Storage & Offline Mode'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {isConfigured
                    ? 'Terhubung dengan database Supabase cloud.'
                    : 'Berjalan dalam mode demo / offline mandiri dengan penyimpanan browser persistence.'}
                </p>
              </div>
            </div>
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950 text-white space-y-2 text-xs">
            <p className="font-bold text-amber-300">Arsitektur Integrasi Masa Depan:</p>
            <p className="text-slate-300 leading-relaxed">
              Database SIMKA disiapkan sebagai master source of truth untuk:
              Aplikasi Keuangan, Pengajuan Dana, Akademik, Absensi Mobile, Penggajian (Payroll), dan PPDB menggunakan foreign key <code>employee_id</code>.
            </p>
          </div>
        </div>
      </Card>

      <Card
        title="Pemeliharaan & Reset Data Uji Coba"
        subtitle="Pulihkan data sample default (Ahmad Fauzi 4 Penugasan, Nasrullah Multi-Unit, dll.)"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-800">Reset ke Data Awal Pesantren Al-Qur'aniyyah</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Menghapus modifikasi lokal dan mengembalikan data simulasi awal</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => setIsResetConfirmOpen(true)}
            className="text-rose-600 border-rose-200 hover:bg-rose-50"
          >
            Reset Data Default
          </Button>
        </div>
      </Card>

      <ConfirmationDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetData}
        title="Reset Data Demo?"
        message="Apakah Anda yakin ingin memulihkan seluruh data awal ke kondisi default?"
        confirmText="Ya, Reset Data"
        type="danger"
      />
    </div>
  );
};
