import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Building2,
  GraduationCap,
  AlertTriangle,
  UserPlus,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { DashboardStats } from '../types';
import { employeeService } from '../services/employeeService';
import { auditService } from '../services/auditService';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Skeleton } from '../components/ui/Skeleton';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await employeeService.getDashboardStats();
      setStats(data);
      const logs = await auditService.getLogs();
      setRecentLogs(logs.slice(0, 5));
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} height={120} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton height={300} className="lg:col-span-2" />
          <Skeleton height={300} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 p-4 sm:p-8 text-white shadow-xl shadow-emerald-950/20 border border-emerald-700/50">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-emerald-200 text-[11px] sm:text-xs font-semibold mb-2 sm:mb-3">
              <span>🕌</span>
              <span className="truncate">Sistem Informasi Terintegrasi Pesantren</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Selamat Datang di SIMKA Al-Qur'aniyyah
            </h2>
            <p className="mt-1.5 sm:mt-2 text-emerald-100/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Pusat database seluruh karyawan, guru, dan tenaga kependidikan. Dilengkapi sistem <strong className="text-amber-300 underline underline-offset-4 font-semibold">1 Karyawan = Multiple Penugasan</strong> lintas unit, jabatan, dan amanah pesantren.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row w-full md:w-auto items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-emerald-700/40">
            <Button
              variant="gold"
              size="md"
              className="w-full sm:w-auto justify-center text-xs sm:text-sm"
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={() => navigate('/employees/new')}
            >
              Tambah Karyawan
            </Button>
            <Button
              variant="outline"
              size="md"
              className="w-full sm:w-auto justify-center bg-white/10 hover:bg-white/20 text-white border-emerald-600/50 text-xs sm:text-sm"
              leftIcon={<FileSpreadsheet className="w-4 h-4" />}
              onClick={() => navigate('/import-export')}
            >
              Import / Export
            </Button>
          </div>
        </div>

        {/* Decorative background Islamic pattern shimmer */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Contract Expiration Warning Banner (if any) */}
      {stats.expiring_contracts.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-3.5 sm:p-5 text-amber-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-950 flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span>Pemberitahuan: {stats.expiring_contracts.length} Karyawan Kontrak Akan Berakhir</span>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                  ≤ 90 Hari
                </span>
              </h4>
              <p className="text-[11px] sm:text-xs text-amber-800/90 mt-0.5">
                Terdapat kontrak kerja staf/guru yang perlu segera ditinjau atau diperpanjang masa berlakunya.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto justify-center border-amber-300 text-amber-900 hover:bg-amber-100 shrink-0 bg-white text-xs"
            onClick={() => navigate('/contracts')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Lihat Detail Kontrak
          </Button>
        </div>
      )}

      {/* CORE METRICS: EMPLOYEE & MULTIPLE ASSIGNMENT STATS */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Ringkasan Kepegawaian & Penugasan</span>
          </h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
          <StatCard
            title="Total Karyawan"
            value={stats.total_employees}
            subtitle={`${stats.active_employees} Aktif • ${stats.inactive_employees} Nonaktif`}
            icon={<Users className="w-6 h-6" />}
            variant="emerald"
            onClick={() => navigate('/employees')}
          />

          <StatCard
            title="Penugasan Aktif"
            value={stats.total_active_assignments}
            subtitle="Seluruh SK & Amanah Aktif"
            icon={<Briefcase className="w-6 h-6" />}
            variant="gold"
            onClick={() => navigate('/assignments')}
          />

          <StatCard
            title="Multi-Unit"
            value={stats.multi_unit_employees}
            subtitle="Bertugas di > 1 Unit"
            icon={<Building2 className="w-6 h-6" />}
            variant="purple"
            onClick={() => navigate('/assignments')}
          />

          <StatCard
            title="Multi-Penugasan"
            value={stats.multi_assignment_employees}
            subtitle="Memegang > 1 Jabatan"
            icon={<Layers className="w-6 h-6" />}
            variant="blue"
            onClick={() => navigate('/assignments')}
          />
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase truncate">Tenaga Guru</p>
          <p className="text-base sm:text-xl font-bold text-slate-900 mt-0.5 sm:mt-1">{stats.total_teachers}</p>
        </div>
        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase truncate">Staff / Tendik</p>
          <p className="text-base sm:text-xl font-bold text-slate-900 mt-0.5 sm:mt-1">{stats.total_staff}</p>
        </div>
        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase truncate">Pegawai Tetap</p>
          <p className="text-base sm:text-xl font-bold text-emerald-700 mt-0.5 sm:mt-1">{stats.permanent_employees}</p>
        </div>
        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase truncate">Pegawai Kontrak</p>
          <p className="text-base sm:text-xl font-bold text-amber-700 mt-0.5 sm:mt-1">{stats.contract_employees}</p>
        </div>
        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase truncate">Honorer</p>
          <p className="text-base sm:text-xl font-bold text-blue-700 mt-0.5 sm:mt-1">{stats.honorary_employees}</p>
        </div>
        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase truncate">L / P</p>
          <p className="text-base sm:text-xl font-bold text-slate-900 mt-0.5 sm:mt-1">
            {stats.gender_distribution.male} : {stats.gender_distribution.female}
          </p>
        </div>
      </div>

      {/* DETAILED BREAKDOWNS: UNIT & POSITION ASSIGNMENT DISTRIBUTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Unit Assignments Breakdown */}
        <Card
          title="Distribusi Penugasan Berdasarkan Unit Lembaga"
          subtitle="Jumlah amanah dan penugasan aktif di masing-masing satuan pendidikan"
          className="lg:col-span-2"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/master/units')}
              rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Kelola Unit
            </Button>
          }
        >
          <div className="space-y-4">
            {stats.assignments_per_unit.map((u) => {
              const maxCount = Math.max(...stats.assignments_per_unit.map(item => item.count), 1);
              const percentage = Math.round((u.count / maxCount) * 100);

              return (
                <div key={u.unit_id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{u.unit_name}</span>
                    <span className="font-semibold text-emerald-800 px-2 py-0.5 bg-emerald-50 rounded-md border border-emerald-100">
                      {u.count} Penugasan
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-700 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right 1 Col: Data Completeness & Actionable List */}
        <Card
          title="Kelengkapan Berkas Data Karyawan"
          subtitle="Karyawan dengan profil belum lengkap (Target 100%)"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/employees')}
            >
              Lihat Semua
            </Button>
          }
        >
          {stats.incomplete_data_employees.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              <FileCheck2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="font-bold text-slate-800">Luar Biasa!</p>
              <p>Seluruh data dan dokumen karyawan telah 100% lengkap.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {stats.incomplete_data_employees.slice(0, 4).map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => navigate(`/employees/${emp.id}`)}
                  className="p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="font-bold text-slate-800 truncate max-w-[150px]">
                      {emp.name}
                    </div>
                    <Badge variant={emp.percentage < 50 ? 'rose' : 'amber'} size="sm">
                      {emp.percentage}%
                    </Badge>
                  </div>
                  <ProgressBar value={emp.percentage} size="sm" color={emp.percentage < 50 ? 'rose' : 'gold'} />
                  <p className="text-[10px] text-slate-400 mt-1 truncate">
                    Kurang: {emp.missing.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* RECENT AUDIT ACTIVITY LOGS */}
      <Card
        title="Catatan Audit Aktivitas Terkini (Audit Trail)"
        subtitle="Riwayat perubahan data, penambahan penugasan, dan impor berkas"
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/audit-logs')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Buka Audit Log Lengkap
          </Button>
        }
      >
        <div className="divide-y divide-slate-100">
          {recentLogs.map((log) => (
            <div key={log.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {log.user_name}{' '}
                    <span className="font-normal text-slate-600">melakukan aksi</span>{' '}
                    <Badge variant="emerald" size="sm">
                      {log.action.replace('_', ' ')}
                    </Badge>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Modul: <strong className="text-slate-700">{log.module}</strong> •{' '}
                    {log.details ? JSON.stringify(log.details).replace(/[{}"]/g, ' ') : '-'}
                  </p>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 whitespace-nowrap">
                {new Date(log.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
